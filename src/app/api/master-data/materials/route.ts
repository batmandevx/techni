import { NextRequest, NextResponse } from 'next/server';

const MOCK_MATERIALS = [
  { id: 'M2001', materialNumber: '2001', description: 'Chocolate Bar 50g', category: 'Chocolate Candy', priceUsd: 1.20, isActive: true },
  { id: 'M2002', materialNumber: '2002', description: 'Fruit Candy Pack 100g', category: 'Fruit Candy', priceUsd: 1.80, isActive: true },
  { id: 'M2003', materialNumber: '2003', description: 'Caramel Toffee 200g', category: 'Toffee Candy', priceUsd: 2.50, isActive: true },
  { id: 'M2004', materialNumber: '2004', description: 'Mint Candy Jar', category: 'Mint Candy', priceUsd: 3.00, isActive: true },
  { id: 'M2005', materialNumber: '2005', description: 'Assorted Candy Box', category: 'Gift Box', priceUsd: 4.50, isActive: true },
];

export async function GET() {
  try {
    return NextResponse.json({ materials: MOCK_MATERIALS });
  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newMaterial = {
      id: 'M' + Date.now(),
      ...body,
      isActive: true,
    };
    
    return NextResponse.json({ 
      material: newMaterial,
      message: 'Material created successfully',
    });
  } catch (error) {
    console.error('Error creating material:', error);
    return NextResponse.json({ error: 'Failed to create material' }, { status: 500 });
  }
}
