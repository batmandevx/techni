import { PrismaClient, UserRole, CreditStatus, BatchStatus, LineStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tenchi.com' },
    update: {},
    create: {
      email: 'admin@tenchi.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });
  console.log('Created admin user:', admin.email);

  // Create operator user
  const operator = await prisma.user.upsert({
    where: { email: 'operator@tenchi.com' },
    update: {},
    create: {
      email: 'operator@tenchi.com',
      name: 'Operator User',
      role: UserRole.OPERATOR,
      isActive: true,
    },
  });
  console.log('Created operator user:', operator.email);

  // Seed Customer Master
  const customers = [
    { customerNumber: '1000001', companyName: 'ABC Retailers Ltd', country: 'USA', region: 'CA', city: 'Los Angeles' },
    { customerNumber: '1000002', companyName: 'Fresh Mart Inc', country: 'USA', region: 'NY', city: 'New York' },
    { customerNumber: '1000003', companyName: 'Super Store Chain', country: 'USA', region: 'TX', city: 'Houston' },
    { customerNumber: '1000004', companyName: 'Global Foods LLC', country: 'USA', region: 'IL', city: 'Chicago' },
    { customerNumber: '1000005', companyName: 'Metro Distribution', country: 'USA', region: 'FL', city: 'Miami' },
  ];

  for (const customer of customers) {
    await prisma.customerMaster.upsert({
      where: { customerNumber: customer.customerNumber },
      update: {},
      create: {
        ...customer,
        salesOrg: '1000',
        distChannel: '10',
        division: '00',
        paymentTerms: 'NET30',
        shippingCondition: '01',
        creditStatus: CreditStatus.ACTIVE,
        isActive: true,
      },
    });
  }
  console.log('Created', customers.length, 'customers');

  // Seed Material Master
  const materials = [
    { materialNumber: 'SKU-001', description: 'Premium Coffee Beans 1kg', materialGroup: 'BEVERAGES', category: 'Food', priceUsd: 24.99 },
    { materialNumber: 'SKU-002', description: 'Organic Tea Selection', materialGroup: 'BEVERAGES', category: 'Food', priceUsd: 18.50 },
    { materialNumber: 'SKU-003', description: 'Dark Chocolate Bar 100g', materialGroup: 'CONFECTIONERY', category: 'Food', priceUsd: 4.99 },
    { materialNumber: 'SKU-004', description: 'Whole Grain Cereal 500g', materialGroup: 'CEREALS', category: 'Food', priceUsd: 6.99 },
    { materialNumber: 'SKU-005', description: 'Olive Oil Extra Virgin 1L', materialGroup: 'OILS', category: 'Food', priceUsd: 15.99 },
    { materialNumber: 'SKU-006', description: 'Premium Pasta 500g', materialGroup: 'PASTA', category: 'Food', priceUsd: 3.99 },
    { materialNumber: 'SKU-007', description: 'Organic Honey 500g', materialGroup: 'CONDIMENTS', category: 'Food', priceUsd: 12.99 },
    { materialNumber: 'SKU-008', description: 'Mixed Nuts 300g', materialGroup: 'SNACKS', category: 'Food', priceUsd: 9.99 },
  ];

  for (const material of materials) {
    await prisma.materialMaster.upsert({
      where: { materialNumber: material.materialNumber },
      update: {},
      create: {
        ...material,
        baseUom: 'EA',
        salesUom: 'EA',
        plant: '1000',
        isActive: true,
      },
    });
  }
  console.log('Created', materials.length, 'materials');

  // Seed Pricing Conditions
  const pricings = [
    { materialNumber: 'SKU-001', conditionType: 'PR00', amount: 24.99 },
    { materialNumber: 'SKU-002', conditionType: 'PR00', amount: 18.50 },
    { materialNumber: 'SKU-003', conditionType: 'PR00', amount: 4.99 },
    { materialNumber: 'SKU-001', conditionType: 'K004', amount: 2.50 }, // Discount
    { materialNumber: 'SKU-002', conditionType: 'K004', amount: 1.85 },
  ];

  for (const pricing of pricings) {
    await prisma.pricingCondition.create({
      data: {
        ...pricing,
        currency: 'USD',
        isActive: true,
      },
    });
  }
  console.log('Created', pricings.length, 'pricing conditions');

  // Seed Sample Order Batch
  const batch = await prisma.orderBatch.create({
    data: {
      batchName: 'Sample Import - March 2026',
      fileName: 'sample_orders_march.xlsx',
      fileUrl: '/uploads/sample_march.xlsx',
      totalOrders: 5,
      successCount: 4,
      failedCount: 1,
      pendingCount: 0,
      status: BatchStatus.COMPLETED,
      aiMappingConfidence: 0.94,
      uploadedBy: admin.id,
      sapSyncStatus: 'SYNCED',
      sapSyncAt: new Date(),
    },
  });

  // Seed Order Lines
  const orderLines = [
    { soldTo: '1000001', shipTo: '1000001', material: 'SKU-001', quantity: 50, unitPrice: 24.99, status: LineStatus.CREATED, sapOrderNumber: '0000012345' },
    { soldTo: '1000001', shipTo: '1000001', material: 'SKU-003', quantity: 100, unitPrice: 4.99, status: LineStatus.CREATED, sapOrderNumber: '0000012345' },
    { soldTo: '1000002', shipTo: '1000002', material: 'SKU-002', quantity: 30, unitPrice: 18.50, status: LineStatus.CREATED, sapOrderNumber: '0000012346' },
    { soldTo: '1000003', shipTo: '1000003', material: 'SKU-004', quantity: 75, unitPrice: 6.99, status: LineStatus.CREATED, sapOrderNumber: '0000012347' },
    { soldTo: '1000005', shipTo: '1000005', material: 'SKU-999', quantity: 20, unitPrice: 0, status: LineStatus.FAILED, validationErrors: '["Material not found"]' },
  ];

  for (const line of orderLines) {
    await prisma.orderLine.create({
      data: {
        ...line,
        batchId: batch.id,
        rowIndex: orderLines.indexOf(line),
        orderType: 'OR',
        salesOrg: '1000',
        distChannel: '10',
        division: '00',
        plant: '1000',
        currency: 'USD',
        lineTotal: line.quantity * line.unitPrice,
        requestedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        processedAt: new Date(),
      },
    });
  }
  console.log('Created', orderLines.length, 'order lines');

  // Seed Daily Metrics
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    await prisma.dailyMetric.upsert({
      where: { date },
      update: {},
      create: {
        date,
        totalOrders: Math.floor(Math.random() * 50) + 20,
        totalValue: Math.random() * 10000 + 5000,
        successCount: Math.floor(Math.random() * 45) + 15,
        failedCount: Math.floor(Math.random() * 5),
        uniqueCustomers: Math.floor(Math.random() * 10) + 3,
        uniqueMaterials: Math.floor(Math.random() * 8) + 2,
        avgProcessingTime: Math.random() * 120 + 30,
      },
    });
  }
  console.log('Created 30 days of metrics');

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
