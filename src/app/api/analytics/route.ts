import { NextRequest, NextResponse } from "next/server";
import { buildAnalyticsSnapshot } from "@/lib/smart-order/analytics";
import { readSmartOrderStore } from "@/lib/smart-order/data";

export const dynamic = 'force-dynamic';

function filtersFromRequest(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  return {
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
    salesOrg: searchParams.get("salesOrg") ?? undefined,
    customer: searchParams.get("customer") ?? undefined,
    status: searchParams.get("status") ?? undefined,
  };
}

export async function GET(request: NextRequest) {
  try {
    const store = await readSmartOrderStore();
    const analytics = buildAnalyticsSnapshot(store, filtersFromRequest(request));
    return NextResponse.json(analytics);
  } catch (error) {
    console.error("analytics GET error", error);
    return NextResponse.json({ error: "Failed to fetch analytics." }, { status: 500 });
  }
}
