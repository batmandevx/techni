import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get total orders
    const totalOrders = await prisma.orderLine.count({
      where: { createdAt: { gte: startDate } },
    });

    const completedOrders = await prisma.orderLine.count({
      where: { 
        createdAt: { gte: startDate },
        status: 'CREATED',
      },
    });

    const failedOrders = await prisma.orderLine.count({
      where: { 
        createdAt: { gte: startDate },
        status: 'FAILED',
      },
    });

    // Calculate total value
    const orderValue = await prisma.orderLine.aggregate({
      where: { createdAt: { gte: startDate } },
      _sum: { lineTotal: true },
    });

    // Get unique customers
    const customers = await prisma.orderLine.groupBy({
      by: ['soldTo'],
      where: { createdAt: { gte: startDate } },
      _count: true,
    });

    // Get unique materials
    const materials = await prisma.orderLine.groupBy({
      by: ['material'],
      where: { createdAt: { gte: startDate } },
      _count: true,
    });

    // Get daily trend
    const dailyMetrics = await prisma.dailyMetric.findMany({
      where: { date: { gte: startDate } },
      orderBy: { date: 'asc' },
    });

    // Get top customers
    const topCustomers = await prisma.orderLine.groupBy({
      by: ['soldTo'],
      where: { createdAt: { gte: startDate } },
      _sum: { lineTotal: true },
      _count: { id: true },
      orderBy: { _sum: { lineTotal: 'desc' } },
      take: 10,
    });

    // Get customer names
    const customerNumbers = topCustomers.map(c => c.soldTo);
    const customerDetails = await prisma.customerMaster.findMany({
      where: { customerNumber: { in: customerNumbers } },
      select: { customerNumber: true, companyName: true },
    });

    const customerMap = Object.fromEntries(
      customerDetails.map(c => [c.customerNumber, c.companyName])
    );

    // Get status breakdown
    const statusBreakdown = await prisma.orderLine.groupBy({
      by: ['status'],
      where: { createdAt: { gte: startDate } },
      _count: { id: true },
    });

    // Get material distribution
    const materialDistribution = await prisma.orderLine.groupBy({
      by: ['material'],
      where: { createdAt: { gte: startDate } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    });

    const materialNumbers = materialDistribution.map(m => m.material);
    const materialDetails = await prisma.materialMaster.findMany({
      where: { materialNumber: { in: materialNumbers } },
      select: { materialNumber: true, description: true, materialGroup: true },
    });

    const materialMap = Object.fromEntries(
      materialDetails.map(m => [m.materialNumber, m])
    );

    return NextResponse.json({
      kpis: {
        totalOrders,
        completedOrders,
        failedOrders,
        successRate: totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0,
        totalValue: orderValue._sum.lineTotal || 0,
        uniqueCustomers: customers.length,
        uniqueMaterials: materials.length,
      },
      dailyTrend: dailyMetrics.map(m => ({
        date: m.date.toISOString().split('T')[0],
        orders: m.totalOrders,
        value: m.totalValue,
        success: m.successCount,
        failed: m.failedCount,
      })),
      topCustomers: topCustomers.map(c => ({
        customerNumber: c.soldTo,
        customerName: customerMap[c.soldTo] || c.soldTo,
        orderCount: c._count.id,
        totalValue: c._sum.lineTotal || 0,
      })),
      statusBreakdown: statusBreakdown.map(s => ({
        status: s.status,
        count: s._count.id,
      })),
      materialDistribution: materialDistribution.map(m => ({
        materialNumber: m.material,
        materialName: materialMap[m.material]?.description || m.material,
        category: materialMap[m.material]?.materialGroup || 'Unknown',
        quantity: m._sum.quantity || 0,
      })),
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
