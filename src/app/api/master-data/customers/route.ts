import { NextRequest, NextResponse } from "next/server";
import { deleteEntity, readSmartOrderStore, upsertCustomer } from "@/lib/smart-order/data";

export async function GET() {
  try {
    const store = await readSmartOrderStore();
    return NextResponse.json({
      customers: store.customers,
      lastSyncAt: store.metadata.customerSyncAt ?? null,
    });
  } catch (error) {
    console.error("customers GET error", error);
    return NextResponse.json({ error: "Failed to fetch customers." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Parameters<typeof upsertCustomer>[0];
    const store = await upsertCustomer(body);
    return NextResponse.json({ customers: store.customers });
  } catch (error) {
    console.error("customers POST error", error);
    return NextResponse.json({ error: "Failed to save customer." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerNumber = searchParams.get("customerNumber");

    if (!customerNumber) {
      return NextResponse.json({ error: "customerNumber is required." }, { status: 400 });
    }

    const store = await deleteEntity("customers", customerNumber);
    return NextResponse.json({ customers: store.customers });
  } catch (error) {
    console.error("customers DELETE error", error);
    return NextResponse.json({ error: "Failed to delete customer." }, { status: 500 });
  }
}
