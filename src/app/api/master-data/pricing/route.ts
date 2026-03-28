import { NextRequest, NextResponse } from "next/server";
import { deleteEntity, readSmartOrderStore, upsertPricing } from "@/lib/smart-order/data";

export async function GET() {
  try {
    const store = await readSmartOrderStore();
    return NextResponse.json({
      pricing: store.pricing,
      lastSyncAt: store.metadata.pricingSyncAt ?? null,
    });
  } catch (error) {
    console.error("pricing GET error", error);
    return NextResponse.json({ error: "Failed to fetch pricing." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Parameters<typeof upsertPricing>[0];
    const store = await upsertPricing(body);
    return NextResponse.json({ pricing: store.pricing });
  } catch (error) {
    console.error("pricing POST error", error);
    return NextResponse.json({ error: "Failed to save pricing condition." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required." }, { status: 400 });
    }

    const store = await deleteEntity("pricing", id);
    return NextResponse.json({ pricing: store.pricing });
  } catch (error) {
    console.error("pricing DELETE error", error);
    return NextResponse.json({ error: "Failed to delete pricing condition." }, { status: 500 });
  }
}
