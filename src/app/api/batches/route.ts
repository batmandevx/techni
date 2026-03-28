import { NextRequest, NextResponse } from "next/server";
import { createBatch, listBatches } from "@/lib/smart-order/store";
import { SmartOrderBatch, SmartMappingResult } from "@/lib/smart-order/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "20");

    const allBatches = await listBatches();
    const filtered = status ? allBatches.filter((batch) => batch.status === status) : allBatches;
    const startIndex = (page - 1) * limit;
    const batches = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      batches,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    });
  } catch (error) {
    console.error("batches GET error", error);
    return NextResponse.json({ error: "Failed to fetch batches." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { batchName, fileName, totalOrders, mapping, rows } = body;

    if (!batchName || !fileName) {
      return NextResponse.json({ error: "batchName and fileName are required." }, { status: 400 });
    }

    // Convert simple mapping to SmartMappingResult format
    const mappingConfig: SmartMappingResult = {
      mappings: Object.entries(mapping || {}).map(([sourceColumn, targetField]) => ({
        sourceColumn,
        targetField: targetField as any,
        confidence: 0.8,
        rationale: "User mapped"
      })),
      unmappedColumns: [],
      warnings: [],
      overallConfidence: 0.8,
      provider: "heuristic"
    };

    // Convert rows to SmartOrderLine format
    const lines = (rows || []).map((row: Record<string, unknown>, index: number) => ({
      id: `line-${Date.now()}-${index}`,
      rowIndex: index,
      orderType: String(row.ORDER_TYPE || row.orderType || 'OR'),
      salesOrg: String(row.SALES_ORG || row.salesOrg || '1000'),
      distChannel: String(row.DIST_CHANNEL || row.distChannel || '10'),
      division: String(row.DIVISION || row.division || '00'),
      soldTo: String(row.SOLD_TO || row.soldTo || row.Customer || ''),
      shipTo: String(row.SHIP_TO || row.shipTo || row.SOLD_TO || row.soldTo || row.Customer || ''),
      material: String(row.MATERIAL || row.material || row.Product || ''),
      quantity: Number(row.QUANTITY || row.quantity || row.Qty || row.QTY || 0),
      price: row.PRICE || row.price || row.Rate || null,
      requestedDeliveryDate: String(row.REQ_DEL_DATE || row.REQ_DATE || row.reqDate || new Date().toISOString().split('T')[0]),
      plant: String(row.PLANT || row.plant || '1000'),
      poNumber: String(row.PO_NUMBER || row.poNumber || `PO-${Date.now()}-${index}`),
      currency: String(row.CURRENCY || row.currency || 'USD'),
      status: 'PENDING' as const,
      validationErrors: [],
      warnings: [],
      retryCount: 0
    }));

    // Create batch object matching SmartUploadDraft structure
    const batchData = {
      batchName,
      fileName,
      uploadedBy: 'system',
      filePreview: rows?.slice(0, 5) || [],
      mappingConfig,
      lines
    };

    const batch = await createBatch(batchData);
    return NextResponse.json({ 
      success: true,
      batchId: batch.id,
      batch 
    }, { status: 201 });
  } catch (error) {
    console.error("batches POST error", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to create batch." 
    }, { status: 500 });
  }
}
