import { NextRequest, NextResponse } from "next/server";
import { deleteBatch, getBatch, updateBatch } from "@/lib/smart-order/data";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const batch = await getBatch(params.id);

    if (!batch) {
      return NextResponse.json({ error: "Batch not found." }, { status: 404 });
    }

    const stats = {
      total: batch.lines.length,
      valid: batch.lines.filter((line) => line.status === "VALID").length,
      invalid: batch.lines.filter((line) => line.status === "INVALID").length,
      pending: batch.lines.filter((line) => line.status === "PENDING").length,
      created: batch.lines.filter((line) => line.status === "CREATED").length,
      failed: batch.lines.filter((line) => line.status === "FAILED").length,
    };

    return NextResponse.json({ batch, stats });
  } catch (error) {
    console.error("batch GET error", error);
    return NextResponse.json({ error: "Failed to fetch batch." }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const updates = (await request.json()) as Record<string, unknown>;
    const batch = await updateBatch(params.id, (current) => ({ ...current, ...updates }));

    if (!batch) {
      return NextResponse.json({ error: "Batch not found." }, { status: 404 });
    }

    return NextResponse.json({ batch });
  } catch (error) {
    console.error("batch PATCH error", error);
    return NextResponse.json({ error: "Failed to update batch." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const store = await deleteBatch(params.id);
    return NextResponse.json({ success: true, batches: store.batches });
  } catch (error) {
    console.error("batch DELETE error", error);
    return NextResponse.json({ error: "Failed to delete batch." }, { status: 500 });
  }
}
