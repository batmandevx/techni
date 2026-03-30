import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const batchId = params.id;
    
    // Return mock export data
    return NextResponse.json({
      success: true,
      batchId,
      data: [
        { orderId: 'ORD001', customer: 'C1001', material: 'M2001', quantity: 100, status: 'CREATED' },
        { orderId: 'ORD002', customer: 'C1002', material: 'M2002', quantity: 200, status: 'CREATED' },
      ],
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
