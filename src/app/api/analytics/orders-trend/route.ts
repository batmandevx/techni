import { NextRequest, NextResponse } from "next/server";
import { buildAnalyticsSnapshot } from "@/lib/smart-order/analytics";
import { readSmartOrderStore } from "@/lib/smart-order/data";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const store = await readSmartOrderStore();
    const { searchParams } = new URL(request.url);
    const analytics = buildAnalyticsSnapshot(store, {
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined,
      salesOrg: searchParams.get("salesOrg") ?? undefined,
      customer: searchParams.get("customer") ?? undefined,
      status: searchParams.get("status") ?? undefined,
    });

    return NextResponse.json({ data: analytics.ordersOverTime });
  } catch (error) {
    console.error("orders-trend GET error", error);
    return NextResponse.json({ error: "Failed to fetch order trend." }, { status: 500 });
  }
}
