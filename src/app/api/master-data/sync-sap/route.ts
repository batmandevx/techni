import { NextRequest, NextResponse } from "next/server";
import { markSync } from "@/lib/smart-order/data";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { entity?: "customer" | "material" | "pricing" };
    const entity = body.entity ?? "customer";
    const store = await markSync(entity);

    return NextResponse.json({
      success: true,
      entity,
      lastSyncAt:
        entity === "customer"
          ? store.metadata.customerSyncAt
          : entity === "material"
            ? store.metadata.materialSyncAt
            : store.metadata.pricingSyncAt,
    });
  } catch (error) {
    console.error("sync-sap POST error", error);
    return NextResponse.json({ error: "Failed to sync master data." }, { status: 500 });
  }
}
