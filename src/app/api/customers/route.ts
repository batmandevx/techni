import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface CustomerWithCount {
  id: string;
  name: string;
  shipToCity: string;
  country: string;
  paymentTerms: string;
  salesOrg: string;
  distChannel: string;
  division: string;
  isActive: boolean;
  _count: { orders: number };
}

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    // Transform to frontend format
    const transformedCustomers = customers.map((customer: CustomerWithCount) => ({
      id: customer.id,
      name: customer.name,
      city: customer.shipToCity,
      country: customer.country,
      paymentTerms: customer.paymentTerms,
      salesOrg: customer.salesOrg,
      distChannel: customer.distChannel,
      division: customer.division,
      isActive: customer.isActive,
      orderCount: customer._count.orders,
    }));

    return NextResponse.json({
      success: true,
      customers: transformedCustomers,
      count: customers.length,
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const customer = await prisma.customer.create({
      data: {
        id: body.customerId,
        name: body.customerName,
        salesOrg: body.salesOrg || '1000',
        distChannel: body.distChannel || '10',
        division: body.division || '0',
        paymentTerms: body.paymentTerms || 'D30',
        shipToCity: body.shipToCity || 'Unknown',
        country: body.country || 'Unknown',
        creditLimit: body.creditLimit,
      },
    });

    return NextResponse.json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
