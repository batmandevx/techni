import { NextRequest, NextResponse } from 'next/server';

const MOCK_CUSTOMERS = [
  { id: 'C1001', customerNumber: '1001', companyName: 'Al Noor Trading', country: 'UAE', city: 'Dubai', isActive: true },
  { id: 'C1002', customerNumber: '1002', companyName: 'Gulf Retail LLC', country: 'UAE', city: 'Abu Dhabi', isActive: true },
  { id: 'C1003', customerNumber: '1003', companyName: 'Desert Hypermarket', country: 'UAE', city: 'Sharjah', isActive: true },
  { id: 'C1004', customerNumber: '1004', companyName: 'Oasis Superstores', country: 'Qatar', city: 'Doha', isActive: true },
  { id: 'C1005', customerNumber: '1005', companyName: 'Arabian Distribution', country: 'KSA', city: 'Riyadh', isActive: true },
];

export async function GET() {
  try {
    return NextResponse.json({ customers: MOCK_CUSTOMERS });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newCustomer = {
      id: 'C' + Date.now(),
      ...body,
      isActive: true,
    };
    
    return NextResponse.json({ 
      customer: newCustomer,
      message: 'Customer created successfully',
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
