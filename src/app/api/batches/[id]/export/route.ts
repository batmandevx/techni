import { NextRequest, NextResponse } from "next/server";
import { getBatch } from "@/lib/smart-order/data";

function escapeCsv(value: unknown): string {
  const raw = String(value ?? "");
  return /[,"\n]/.test(raw) ? `"${raw.replace(/"/g, '""')}"` : raw;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const batch = await getBatch(params.id);

    if (!batch) {
      return NextResponse.json({ error: "Batch not found." }, { status: 404 });
    }

    const rows = [
      [
        "Row",
        "SoldTo",
        "Material",
        "Qty",
        "Price",
        "RequestedDeliveryDate",
        "Status",
        "SapOrderNumber",
        "ValidationErrors",
      ],
      ...batch.lines.map((line) => [
        line.rowIndex,
        line.soldTo,
        line.material,
        line.quantity,
        line.price ?? "",
        line.requestedDeliveryDate ?? "",
        line.status,
        line.sapOrderNumber ?? "",
        line.validationErrors.join("; "),
      ]),
    ];

    const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${batch.fileName.replace(/\.[^.]+$/, "")}-report.csv"`,
      },
    });
  } catch (error) {
    console.error("batch export error", error);
    return NextResponse.json({ error: "Failed to export batch." }, { status: 500 });
  }
}
