import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Return mock analytics data
    return NextResponse.json({
      success: true,
      summary: {
        totalOrders: 1247,
        totalValue: 842500,
        avgOrderValue: 675,
        uniqueCustomers: 48,
        uniqueMaterials: 156,
      },
      trends: [
        { date: '2026-03-01', orders: 45, value: 32000 },
        { date: '2026-03-15', orders: 52, value: 38000 },
        { date: '2026-03-30', orders: 48, value: 35000 },
      ],
      topCustomers: [
        { customerNumber: 'C1001', companyName: 'Al Noor Trading', totalOrders: 150, totalValue: 125000 },
        { customerNumber: 'C1002', companyName: 'Gulf Retail LLC', totalOrders: 120, totalValue: 98000 },
      ],
      topMaterials: [
        { materialNumber: 'M2001', description: 'Chocolate Bar 50g', totalOrders: 500, totalValue: 75000 },
        { materialNumber: 'M2002', description: 'Fruit Candy Pack 100g', totalOrders: 400, totalValue: 68000 },
      ],
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
