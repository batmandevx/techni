import { NextRequest, NextResponse } from "next/server";
import { deleteEntity, readSmartOrderStore, upsertMaterial } from "@/lib/smart-order/data";

export async function GET() {
  try {
    const store = await readSmartOrderStore();
    return NextResponse.json({
      materials: store.materials,
      lastSyncAt: store.metadata.materialSyncAt ?? null,
    });
  } catch (error) {
    console.error("materials GET error", error);
    return NextResponse.json({ error: "Failed to fetch materials." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Parameters<typeof upsertMaterial>[0];
    const store = await upsertMaterial(body);
    return NextResponse.json({ materials: store.materials });
  } catch (error) {
    console.error("materials POST error", error);
    return NextResponse.json({ error: "Failed to save material." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const materialNumber = searchParams.get("materialNumber");

    if (!materialNumber) {
      return NextResponse.json({ error: "materialNumber is required." }, { status: 400 });
    }

    const store = await deleteEntity("materials", materialNumber);
    return NextResponse.json({ materials: store.materials });
  } catch (error) {
    console.error("materials DELETE error", error);
    return NextResponse.json({ error: "Failed to delete material." }, { status: 500 });
  }
}
