import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface OrderWithRelations {
  id: string;
  orderDate: Date;
  customerId: string;
  status: string;
  totalAmount: number | null;
  requestedDeliveryDate: Date | null;
  customer: {
    id: string;
    name: string;
    shipToCity: string;
    country: string;
  };
  lines: Array<{
    materialId: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    material: {
      id: string;
      description: string;
      priceUsd: number;
    };
  }>;
}

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { orderDate: 'desc' },
      include: {
        customer: true,
        lines: {
          include: {
            material: true,
          },
        },
        statusHistory: {
          orderBy: { changedAt: 'desc' },
          take: 1,
        },
      },
    });

    // Transform to frontend format
    const transformedOrders = orders.map((order: OrderWithRelations) => ({
      orderId: order.id,
      orderDate: order.orderDate.toISOString(),
      customerId: order.customerId,
      customer: order.customer,
      status: order.status,
      totalAmount: order.totalAmount,
      deliveryDate: order.requestedDeliveryDate?.toISOString(),
      lines: order.lines.map((line) => ({
        materialId: line.materialId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        lineTotal: line.lineTotal,
        material: line.material,
      })),
    }));

    return NextResponse.json({
      success: true,
      orders: transformedOrders,
      count: orders.length,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const order = await prisma.order.create({
      data: {
        id: body.orderId,
        orderDate: new Date(body.orderDate),
        customerId: body.customerId,
        status: body.status || 'CREATED',
        totalAmount: body.totalAmount,
        requestedDeliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : null,
        lines: {
          create: body.lines?.map((line: { materialId: string; quantity: number; unitPrice: number }) => ({
            materialId: line.materialId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            lineTotal: line.quantity * line.unitPrice,
          })),
        },
      },
      include: {
        customer: true,
        lines: {
          include: { material: true },
        },
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
