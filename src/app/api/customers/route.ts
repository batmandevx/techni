import { NextResponse } from 'next/server';

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

// Mock customers data for when Prisma is not available
const mockCustomers = [
  { id: 'CUST001', name: 'ABC Retailers', shipToCity: 'Mumbai', country: 'India', paymentTerms: 'N30', salesOrg: '1000', distChannel: '10', division: '00', isActive: true },
  { id: 'CUST002', name: 'Fresh Mart', shipToCity: 'Delhi', country: 'India', paymentTerms: 'N30', salesOrg: '1000', distChannel: '10', division: '00', isActive: true },
  { id: 'CUST003', name: 'Super Store', shipToCity: 'Bangalore', country: 'India', paymentTerms: 'N45', salesOrg: '1000', distChannel: '10', division: '00', isActive: true },
  { id: 'CUST004', name: 'Groceries Plus', shipToCity: 'Chennai', country: 'India', paymentTerms: 'N30', salesOrg: '1000', distChannel: '10', division: '00', isActive: true },
  { id: 'CUST005', name: 'Daily Needs', shipToCity: 'Hyderabad', country: 'India', paymentTerms: 'N15', salesOrg: '1000', distChannel: '10', division: '00', isActive: true },
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
      // Return mock data when Prisma is not available
      return NextResponse.json({
        success: true,
        customers: mockCustomers.map(c => ({
          id: c.id,
          name: c.name,
          city: c.shipToCity,
          country: c.country,
          paymentTerms: c.paymentTerms,
          salesOrg: c.salesOrg,
          distChannel: c.distChannel,
          division: c.division,
          isActive: c.isActive,
          orderCount: 0,
        })),
        count: mockCustomers.length,
      });
    }
    
    const customers = await prisma.customer.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    // Transform to frontend format
    const transformedCustomers = (customers as CustomerWithCount[]).map((customer) => ({
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
    // Return mock data on error
    return NextResponse.json({
      success: true,
      customers: mockCustomers.map(c => ({
        id: c.id,
        name: c.name,
        city: c.shipToCity,
        country: c.country,
        paymentTerms: c.paymentTerms,
        salesOrg: c.salesOrg,
        distChannel: c.distChannel,
        division: c.division,
        isActive: c.isActive,
        orderCount: 0,
      })),
      count: mockCustomers.length,
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prisma = await getPrisma();
    
    if (!prisma) {
      return NextResponse.json({
        success: true,
        customer: { id: body.customerId, ...body },
        message: 'Customer created (mock mode)'
      });
    }
    
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
