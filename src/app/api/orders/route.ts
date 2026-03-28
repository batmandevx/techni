import { NextResponse } from 'next/server';

// Mock orders data for when Prisma is not available
const mockOrders = [
  { id: 'ORD001', orderNumber: '100001', customerId: 'CUST001', materialId: 'MAT001', quantity: 100, status: 'COMPLETED', createdAt: new Date().toISOString() },
  { id: 'ORD002', orderNumber: '100002', customerId: 'CUST002', materialId: 'MAT002', quantity: 50, status: 'PENDING', createdAt: new Date().toISOString() },
  { id: 'ORD003', orderNumber: '100003', customerId: 'CUST003', materialId: 'MAT003', quantity: 75, status: 'PROCESSING', createdAt: new Date().toISOString() },
];

async function getPrisma() {
  try {
    const { prisma } = await import('@/lib/prisma');
    return prisma;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const prisma = await getPrisma();
    
    if (!prisma) {
      return NextResponse.json({
        success: true,
        orders: mockOrders,
        count: mockOrders.length,
      });
    }
    
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        items: {
          include: {
            material: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      orders,
      count: orders.length,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({
      success: true,
      orders: mockOrders,
      count: mockOrders.length,
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prisma = await getPrisma();
    
    if (!prisma) {
      const newOrder = {
        id: `ORD${Date.now()}`,
        orderNumber: `100${Math.floor(Math.random() * 1000)}`,
        ...body,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
      return NextResponse.json({
        success: true,
        order: newOrder,
        message: 'Order created (mock mode)'
      });
    }
    
    const order = await prisma.order.create({
      data: {
        customerId: body.customerId,
        salesOrg: body.salesOrg || '1000',
        distChannel: body.distChannel || '10',
        division: body.division || '00',
        orderType: body.orderType || 'OR',
        poNumber: body.poNumber,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create order' },
      { status: 500 }
    );
  }
}
