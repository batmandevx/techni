import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CUSTOMERS = [
  { id: 'C1001', name: 'Al Noor Trading', shipToCity: 'Dubai', country: 'UAE', paymentTerms: 'D30' },
  { id: 'C1002', name: 'Gulf Retail LLC', shipToCity: 'Abu Dhabi', country: 'UAE', paymentTerms: 'D30' },
  { id: 'C1003', name: 'Desert Hypermarket', shipToCity: 'Sharjah', country: 'UAE', paymentTerms: 'D45' },
  { id: 'C1004', name: 'Oasis Superstores', shipToCity: 'Doha', country: 'Qatar', paymentTerms: 'D30' },
  { id: 'C1005', name: 'Arabian Distribution', shipToCity: 'Riyadh', country: 'KSA', paymentTerms: 'D60' },
  { id: 'C1006', name: 'Pegasus Retail', shipToCity: 'Kathmandu', country: 'Nepal', paymentTerms: 'D30' },
  { id: 'C1007', name: 'Mint Trading', shipToCity: 'Colombo', country: 'Sri Lanka', paymentTerms: 'D45' },
];

const MATERIALS = [
  { id: 'M2001', description: 'Chocolate Bar 50g', priceUsd: 1.20, storageLocation: 'FG01' },
  { id: 'M2002', description: 'Fruit Candy Pack 100g', priceUsd: 1.80, storageLocation: 'FG01' },
  { id: 'M2003', description: 'Caramel Toffee 200g', priceUsd: 2.50, storageLocation: 'FG02' },
  { id: 'M2004', description: 'Mint Candy Jar', priceUsd: 3.00, storageLocation: 'FG02' },
  { id: 'M2005', description: 'Assorted Candy Box', priceUsd: 4.50, storageLocation: 'FG03' },
  { id: 'M2006', description: 'Coffee Candy Bag 150g', priceUsd: 2.20, storageLocation: 'FG01' },
  { id: 'M2007', description: 'Jelly Beans Pack 200g', priceUsd: 1.90, storageLocation: 'FG01' },
  { id: 'M2008', description: 'Lollipop Mix 50pc', priceUsd: 3.50, storageLocation: 'FG02' },
];

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data
  await prisma.orderLine.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventoryRecord.deleteMany();
  await prisma.forecastRecord.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.material.deleteMany();

  console.log('✅ Cleared existing data');

  // Seed Customers
  for (const customer of CUSTOMERS) {
    await prisma.customer.create({
      data: customer,
    });
  }
  console.log(`✅ Seeded ${CUSTOMERS.length} customers`);

  // Seed Materials
  for (const material of MATERIALS) {
    await prisma.material.create({
      data: material,
    });
  }
  console.log(`✅ Seeded ${MATERIALS.length} materials`);

  // Generate 6 months of historical data
  const months: Date[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    date.setDate(1);
    months.push(date);
  }

  // Create inventory and forecast records for each material
  for (const material of MATERIALS) {
    let openingStock = Math.floor(Math.random() * 3000) + 1000;

    for (const month of months) {
      const actualSales = Math.floor(Math.random() * 1000) + 200;
      const forecastDemand = Math.floor(actualSales * (0.9 + Math.random() * 0.2));
      const stockInTransit = Math.floor(Math.random() * 500) + 100;
      const safetyStock = Math.floor(actualSales * 0.3);
      const replenishmentQty = Math.floor(Math.random() * 800) + 200;
      const closingStock = openingStock + stockInTransit - actualSales + replenishmentQty;

      await prisma.inventoryRecord.create({
        data: {
          materialId: material.id,
          month,
          openingStock,
          stockInTransit,
          actualSales,
          closingStock,
          safetyStock,
          replenishmentQty,
        },
      });

      await prisma.forecastRecord.create({
        data: {
          materialId: material.id,
          month,
          forecastDemand,
          actualDemand: actualSales,
          forecastAccuracy: Math.round((1 - Math.abs(forecastDemand - actualSales) / actualSales) * 100),
          modelUsed: 'gemini-moving-avg',
        },
      });

      openingStock = closingStock;
    }
  }
  console.log(`✅ Seeded ${months.length} months of inventory/forecast data`);

  // Create sample orders
  const orderStatuses = ['DELIVERED', 'SHIPPED', 'INVOICED', 'CONFIRMED', 'PENDING'];
  const orders = [];

  for (let i = 0; i < 50; i++) {
    const customer = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 90));

    const numLines = Math.floor(Math.random() * 3) + 1;
    const lines = [];
    let totalAmount = 0;

    for (let j = 0; j < numLines; j++) {
      const material = MATERIALS[Math.floor(Math.random() * MATERIALS.length)];
      const quantity = Math.floor(Math.random() * 100) + 10;
      const lineTotal = quantity * material.priceUsd;
      totalAmount += lineTotal;

      lines.push({
        materialId: material.id,
        quantity,
        unitPrice: material.priceUsd,
        lineTotal,
      });
    }

    const orderId = `ORD${String(i + 1).padStart(5, '0')}`;

    orders.push({
      id: orderId,
      orderDate,
      customerId: customer.id,
      status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
      totalAmount,
      requestedDeliveryDate: new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      lines,
    });
  }

  // Insert orders
  for (const order of orders) {
    await prisma.order.create({
      data: {
        id: order.id,
        orderDate: order.orderDate,
        customerId: order.customerId,
        status: order.status,
        totalAmount: order.totalAmount,
        requestedDeliveryDate: order.requestedDeliveryDate,
        lines: {
          create: order.lines,
        },
      },
    });
  }
  console.log(`✅ Seeded ${orders.length} orders`);

  console.log('\n🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
