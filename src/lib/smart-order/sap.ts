import { SmartOrderLine } from "@/lib/smart-order/types";
import { hashCode } from "@/lib/smart-order/utils";

export interface SapOrderPayload {
  orderType: string;
  salesOrg: string;
  distChannel: string;
  division: string;
  soldTo: string;
  shipTo: string;
  reqDelDate: string | null;
  currency: string;
  poNumber?: string | null;
  items: SmartOrderLine[];
}

export interface SapOrderResult {
  success: boolean;
  orderNumber?: string;
  errors?: string[];
  response?: Record<string, unknown>;
}

export async function createSalesOrderInSap(payload: SapOrderPayload): Promise<SapOrderResult> {
  const useMock = process.env.SAP_MOCK !== "false";
  const serviceUrl = process.env.SAP_SERVICE_URL;

  if (!useMock && serviceUrl) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    try {
      const response = await fetch(`${serviceUrl.replace(/\/$/, "")}/api/create-sales-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_type: payload.orderType,
          sales_org: payload.salesOrg,
          dist_channel: payload.distChannel,
          division: payload.division,
          sold_to: payload.soldTo,
          ship_to: payload.shipTo,
          req_del_date: payload.reqDelDate,
          currency: payload.currency,
          po_number: payload.poNumber,
          items: payload.items.map((item) => ({
            material: item.material,
            quantity: item.quantity,
            price: item.price,
            plant: item.plant,
          })),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        return {
          success: false,
          errors: [`SAP service responded with status ${response.status}.`],
        };
      }

      const data = (await response.json()) as SapOrderResult;
      return data;
    } catch (error) {
      clearTimeout(timeout);
      console.error("SAP service unavailable, using mock fallback:", error);
    }
  }

  return createMockSalesOrder(payload);
}

export async function createMockSalesOrder(payload: SapOrderPayload): Promise<SapOrderResult> {
  const fingerprint = `${payload.soldTo}|${payload.items.map((item) => item.material).join(",")}|${payload.reqDelDate}`;
  const hash = hashCode(fingerprint);
  const success = hash % 100 < 95;
  const orderNumber = String(1_000_000_000 + (hash % 900_000_000)).slice(0, 10);

  if (!success) {
    return {
      success: false,
      errors: ["BAPI_SALESORDER_CREATEFROMDAT2 returned V1 311: Sales document not created due to credit check."],
      response: {
        RETURN: [
          {
            TYPE: "E",
            ID: "V1",
            NUMBER: "311",
            MESSAGE: "Credit limit exceeded for sold-to party.",
          },
        ],
      },
    };
  }

  return {
    success: true,
    orderNumber,
    response: {
      SALESDOCUMENT: orderNumber,
      RETURN: [
        {
          TYPE: "S",
          ID: "V1",
          NUMBER: "311",
          MESSAGE: "Sales document created successfully.",
        },
      ],
    },
  };
}
