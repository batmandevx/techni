import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo purposes
// In production, this would be a database
const storage = {
  orders: [] as any[],
  customers: [] as any[],
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orders, customers, type } = body;

    // Handle Customer Master Data Upload
    if (type === 'customers' && customers && Array.isArray(customers)) {
      console.log(`Processing ${customers.length} customers for upload`);
      
      // Add to storage
      customers.forEach((customer: any) => {
        const existingIndex = storage.customers.findIndex(c => c.customerId === customer.customerId);
        if (existingIndex >= 0) {
          storage.customers[existingIndex] = { ...storage.customers[existingIndex], ...customer };
        } else {
          storage.customers.push(customer);
        }
      });

      return NextResponse.json({
        success: true,
        message: `Successfully processed ${customers.length} customers`,
        saved: customers.length,
        errors: [],
        totalCustomers: storage.customers.length,
      });
    }

    // Handle Orders Upload
    if (orders && Array.isArray(orders) && orders.length > 0) {
      console.log(`Processing ${orders.length} orders for upload`);
      
      // Add to storage
      orders.forEach((order: any) => {
        const existingIndex = storage.orders.findIndex(o => o.orderId === order.orderId);
        if (existingIndex >= 0) {
          storage.orders[existingIndex] = { ...storage.orders[existingIndex], ...order };
        } else {
          storage.orders.push(order);
        }
      });

      return NextResponse.json({
        success: true,
        message: `Successfully processed ${orders.length} orders`,
        saved: orders.length,
        errors: [],
        totalOrders: storage.orders.length,
      });
    }

    return NextResponse.json(
      { success: false, message: 'No data provided' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to process upload' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve stored data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'customers') {
      return NextResponse.json({
        success: true,
        customers: storage.customers,
      });
    }

    if (type === 'orders') {
      return NextResponse.json({
        success: true,
        orders: storage.orders,
      });
    }

    return NextResponse.json({
      success: true,
      orders: storage.orders,
      customers: storage.customers,
    });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve data' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to clear data
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'customers') {
      storage.customers = [];
    } else if (type === 'orders') {
      storage.orders = [];
    } else {
      storage.customers = [];
      storage.orders = [];
    }

    return NextResponse.json({
      success: true,
      message: 'Data cleared successfully',
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to clear data' },
      { status: 500 }
    );
  }
}
