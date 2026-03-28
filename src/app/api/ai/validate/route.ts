import { NextRequest, NextResponse } from "next/server";
import { readSmartOrderStore } from "@/lib/smart-order/data";
import { validateNormalizedRows, validateRawRows } from "@/lib/smart-order/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const store = await readSmartOrderStore();
    const existingLines = store.batches.flatMap((batch) => batch.lines);

    if (Array.isArray(body.normalizedRows)) {
      const result = validateNormalizedRows(body.normalizedRows, store.customers, store.materials, existingLines);
      return NextResponse.json(result);
    }

    if (Array.isArray(body.rows) && body.mapping) {
      const result = validateRawRows(body.rows, body.mapping, store.customers, store.materials, existingLines);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "Either normalizedRows or rows with mapping is required." },
      { status: 400 },
    );
  } catch (error) {
    console.error("validate POST error", error);
    return NextResponse.json({ error: "Failed to validate workbook rows." }, { status: 500 });
  }
}
