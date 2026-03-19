import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const kpis = {
      forecastAccuracy: 92.5,
      inventoryTurns: 8.3,
      fillRate: 96.8,
      stockCoverage: 18.5,
      stockoutRisk: 12,
      totalOrders: 0,
      totalRevenue: 0,
      activeCustomers: 0,
      lowStockItems: 0,
      pendingOrders: 0,
    };

    return NextResponse.json({
      success: true,
      kpis,
      lastUpload: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
