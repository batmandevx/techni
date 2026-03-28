import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where = search ? {
      OR: [
        { customerNumber: { contains: search, mode: 'insensitive' as const } },
        { companyName: { contains: search, mode: 'insensitive' as const } },
        { city: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};

    const [customers, total] = await Promise.all([
      prisma.customerMaster.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customerMaster.count({ where }),
    ]);

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const customer = await prisma.customerMaster.create({
      data: {
        customerNumber: data.customerNumber,
        companyName: data.companyName,
        salesOrg: data.salesOrg || '1000',
        distChannel: data.distChannel || '10',
        division: data.division || '00',
        paymentTerms: data.paymentTerms || 'NET30',
        shippingCondition: data.shippingCondition || '01',
        country: data.country,
        region: data.region,
        city: data.city,
        address: data.address,
        creditLimit: data.creditLimit,
        isActive: true,
      },
    });

    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
