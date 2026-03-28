import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SmartOrder data...');

  // Create sample customers
  const customers = [
    { customerNumber: '100001', companyName: 'ABC Trading Co', salesOrg: '1000', distChannel: '10', division: '00', country: 'US', region: 'CA' },
    { customerNumber: '100002', companyName: 'XYZ Industries', salesOrg: '1000', distChannel: '10', division: '00', country: 'US', region: 'TX' },
    { customerNumber: '100003', companyName: 'Global Retail Ltd', salesOrg: '1000', distChannel: '10', division: '00', country: 'GB', region: 'LD' },
    { customerNumber: '100004', companyName: 'Euro Distributors', salesOrg: '1000', distChannel: '10', division: '00', country: 'DE', region: 'BY' },
    { customerNumber: '100005', companyName: 'Asia Pacific Corp', salesOrg: '1000', distChannel: '10', division: '00', country: 'SG', region: 'SG' },
  ];

  for (const customer of customers) {
    await prisma.customerMaster.upsert({
      where: { customerNumber: customer.customerNumber },
      update: customer,
      create: customer,
    });
  }

  // Create sample materials
  const materials = [
    { materialNumber: 'MAT001', description: 'Premium Widget A', baseUom: 'EA', salesUom: 'EA', plant: '1000', materialGroup: 'WIDGETS' },
    { materialNumber: 'MAT002', description: 'Standard Widget B', baseUom: 'EA', salesUom: 'EA', plant: '1000', materialGroup: 'WIDGETS' },
    { materialNumber: 'MAT003', description: 'Industrial Component C', baseUom: 'KG', salesUom: 'KG', plant: '1000', materialGroup: 'COMPONENTS' },
    { materialNumber: 'MAT004', description: 'Consumer Product D', baseUom: 'EA', salesUom: 'EA', plant: '1000', materialGroup: 'CONSUMER' },
    { materialNumber: 'MAT005', description: 'Raw Material E', baseUom: 'MT', salesUom: 'MT', plant: '1000', materialGroup: 'RAW' },
  ];

  for (const material of materials) {
    await prisma.materialMaster.upsert({
      where: { materialNumber: material.materialNumber },
      update: material,
      create: material,
    });
  }

  // Create sample pricing conditions
  const pricingConditions = [
    { conditionType: 'PR00', materialNumber: 'MAT001', salesOrg: '1000', amount: 99.99, currency: 'USD', validFrom: new Date('2024-01-01'), validTo: new Date('2024-12-31') },
    { conditionType: 'PR00', materialNumber: 'MAT002', salesOrg: '1000', amount: 49.99, currency: 'USD', validFrom: new Date('2024-01-01'), validTo: new Date('2024-12-31') },
    { conditionType: 'PR00', materialNumber: 'MAT003', salesOrg: '1000', amount: 150.00, currency: 'USD', validFrom: new Date('2024-01-01'), validTo: new Date('2024-12-31') },
    { conditionType: 'PR00', materialNumber: 'MAT004', salesOrg: '1000', amount: 29.99, currency: 'USD', validFrom: new Date('2024-01-01'), validTo: new Date('2024-12-31') },
    { conditionType: 'PR00', materialNumber: 'MAT005', salesOrg: '1000', amount: 500.00, currency: 'USD', validFrom: new Date('2024-01-01'), validTo: new Date('2024-12-31') },
  ];

  for (const pricing of pricingConditions) {
    await prisma.pricingCondition.create({
      data: pricing,
    });
  }

  // Create company settings
  await prisma.companySettings.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      companyName: 'Tenchi Consulting',
      primaryColor: '#e89a2d',
      currency: 'USD',
      sapIntegration: true,
      sapMockMode: true,
    },
  });

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
