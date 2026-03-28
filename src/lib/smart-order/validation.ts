import {
  SmartMappingResult,
  SmartOrderCustomer,
  SmartOrderLine,
  SmartOrderMaterial,
  SmartValidationRow,
  SmartValidationSummary,
} from "@/lib/smart-order/types";
import { createId, normalizeDate, parseNumber } from "@/lib/smart-order/utils";
import { suggestClosestCustomers, suggestClosestMaterials } from "@/lib/smart-order/ai";

type RawRow = Record<string, unknown>;
type NormalizedRow = Partial<SmartOrderLine> & { rowIndex: number };

function getMappedValue(
  row: RawRow,
  mapping: SmartMappingResult,
  targetField: string,
): unknown {
  const sourceColumn = mapping.mappings.find((item) => item.targetField === targetField)?.sourceColumn;
  return sourceColumn ? row[sourceColumn] : undefined;
}

function buildNormalizedRows(rows: RawRow[], mapping: SmartMappingResult): NormalizedRow[] {
  return rows.map((row, index) => ({
    rowIndex: index + 1,
    orderType: String(getMappedValue(row, mapping, "ORDER_TYPE") ?? "OR"),
    salesOrg: String(getMappedValue(row, mapping, "SALES_ORG") ?? "1000"),
    distChannel: String(getMappedValue(row, mapping, "DIST_CHANNEL") ?? "10"),
    division: String(getMappedValue(row, mapping, "DIVISION") ?? "00"),
    soldTo: String(getMappedValue(row, mapping, "SOLD_TO") ?? "").trim(),
    shipTo: String(getMappedValue(row, mapping, "SHIP_TO") ?? getMappedValue(row, mapping, "SOLD_TO") ?? "").trim(),
    material: String(getMappedValue(row, mapping, "MATERIAL") ?? "").trim(),
    quantity: parseNumber(getMappedValue(row, mapping, "QTY")) ?? 0,
    price: parseNumber(getMappedValue(row, mapping, "PRICE")),
    requestedDeliveryDate: normalizeDate(getMappedValue(row, mapping, "REQ_DEL_DATE")),
    plant: String(getMappedValue(row, mapping, "PLANT") ?? "1000"),
    poNumber: String(getMappedValue(row, mapping, "PO_NUMBER") ?? "").trim() || null,
    currency: String(getMappedValue(row, mapping, "CURRENCY") ?? "USD"),
  }));
}

export function validateNormalizedRows(
  rows: NormalizedRow[],
  customers: SmartOrderCustomer[],
  materials: SmartOrderMaterial[],
  existingLines: SmartOrderLine[] = [],
): { rows: SmartValidationRow[]; summary: SmartValidationSummary } {
  const fingerprints = new Set(existingLines.map((line) => `${line.soldTo}|${line.material}|${line.requestedDeliveryDate}|${line.quantity}`));
  const seenInBatch = new Set<string>();

  const validationRows = rows.map((row) => {
    const validationErrors: string[] = [];
    const warnings: string[] = [];

    const customer = customers.find((item) => item.customerNumber === row.soldTo && item.isActive);
    const material = materials.find((item) => item.materialNumber === row.material && item.isActive);

    if (!row.soldTo) validationErrors.push("Missing SOLD_TO value.");
    if (!row.material) validationErrors.push("Missing MATERIAL value.");
    if (!row.quantity || row.quantity <= 0) validationErrors.push("QTY must be a positive number.");
    if (!row.requestedDeliveryDate) validationErrors.push("REQ_DEL_DATE must be a valid date.");
    if (row.price !== null && row.price !== undefined && Number.isNaN(Number(row.price))) {
      validationErrors.push("PRICE must be numeric.");
    }

    if (!customer && row.soldTo) {
      validationErrors.push(`Customer ${row.soldTo} was not found in CustomerMaster.`);
    }

    if (!material && row.material) {
      validationErrors.push(`Material ${row.material} was not found in MaterialMaster.`);
    }

    if (customer && row.salesOrg && customer.salesOrg !== row.salesOrg) {
      validationErrors.push(`Customer ${row.soldTo} is not assigned to sales org ${row.salesOrg}.`);
    }

    if (material && row.plant && material.plant !== row.plant) {
      validationErrors.push(`Material ${row.material} is not available in plant ${row.plant}.`);
    }

    if (material && Number(row.quantity ?? 0) > material.availableQty) {
      warnings.push(`Requested quantity ${row.quantity ?? 0} exceeds current availability ${material.availableQty}.`);
    }

    const fingerprint = `${row.soldTo}|${row.material}|${row.requestedDeliveryDate}|${row.quantity}`;
    const duplicate = seenInBatch.has(fingerprint) || fingerprints.has(fingerprint);
    if (duplicate) {
      warnings.push("Possible duplicate order detected using customer, material, date, and quantity.");
    }
    seenInBatch.add(fingerprint);

    const line: SmartOrderLine = {
      id: createId("line"),
      rowIndex: row.rowIndex,
      orderType: row.orderType ?? "OR",
      salesOrg: row.salesOrg ?? "1000",
      distChannel: row.distChannel ?? "10",
      division: row.division ?? "00",
      soldTo: row.soldTo ?? "",
      shipTo: row.shipTo ?? row.soldTo ?? "",
      material: row.material ?? "",
      quantity: row.quantity ?? 0,
      price: row.price ?? null,
      requestedDeliveryDate: row.requestedDeliveryDate ?? null,
      plant: row.plant ?? "1000",
      poNumber: row.poNumber ?? null,
      currency: row.currency ?? "USD",
      status: validationErrors.length === 0 ? "VALID" : "INVALID",
      validationErrors,
      warnings,
      retryCount: 0,
    };

    return {
      line,
      valid: validationErrors.length === 0,
      duplicate,
      suggestions: {
        soldTo: customer ? [] : suggestClosestCustomers(row.soldTo ?? "", customers.map(c => c.companyName)).map((name, i) => ({
          value: name,
          label: name,
          score: 1 - (i * 0.1)
        })),
        material: material ? [] : suggestClosestMaterials(row.material ?? "", materials.map(m => m.description)).map((name, i) => ({
          value: name,
          label: name,
          score: 1 - (i * 0.1)
        })),
      },
    };
  });

  const summary: SmartValidationSummary = {
    totalRows: validationRows.length,
    validRows: validationRows.filter((row) => row.valid).length,
    invalidRows: validationRows.filter((row) => !row.valid).length,
    warningRows: validationRows.filter((row) => row.line.warnings.length > 0).length,
    duplicates: validationRows.filter((row) => row.duplicate).length,
  };

  return { rows: validationRows, summary };
}

export function validateRawRows(
  rows: RawRow[],
  mapping: SmartMappingResult,
  customers: SmartOrderCustomer[],
  materials: SmartOrderMaterial[],
  existingLines: SmartOrderLine[] = [],
) {
  return validateNormalizedRows(buildNormalizedRows(rows, mapping), customers, materials, existingLines);
}
