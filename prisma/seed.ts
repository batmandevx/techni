import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed customers
  const customers = [
    { id: 'C1001', name: 'Al Noor Trading', salesOrg: '1000', distChannel: '10', division: '0', paymentTerms: 'D30' as const, shipToCity: 'Dubai', country: 'UAE' as const },
    { id: 'C1002', name: 'Gulf Retail LLC', salesOrg: '1000', distChannel: '10', division: '0', paymentTerms: 'D30' as const, shipToCity: 'Abu Dhabi', country: 'UAE' as const },
    { id: 'C1003', name: 'Desert Hypermarket', salesOrg: '1000', distChannel: '10', division: '0', paymentTerms: 'D45' as const, shipToCity: 'Sharjah', country: 'UAE' as const },
    { id: 'C1004', name: 'Oasis Superstores', salesOrg: '1000', distChannel: '10', division: '0', paymentTerms: 'D30' as const, shipToCity: 'Doha', country: 'QATAR' as const },
    { id: 'C1005', name: 'Arabian Distribution', salesOrg: '1000', distChannel: '10', division: '0', paymentTerms: 'D60' as const, shipToCity: 'Riyadh', country: 'KSA' as const },
    { id: 'C1006', name: 'Pegasus', salesOrg: '1000', distChannel: '10', division: '0', paymentTerms: 'D30' as const, shipToCity: 'Kathmandu', country: 'NEPAL' as const },
    { id: 'C1007', name: 'Mint', salesOrg: '1000', distChannel: '10', division: '0', paymentTerms: 'D45' as const, shipToCity: 'Colombo', country: 'SRILANKA' as const },
  ];

  for (const customer of customers) {
    await prisma.customer.upsert({
      where: { id: customer.id },
      update: {},
      create: customer,
    });
  }
  console.log(`Seeded ${customers.length} customers`);

  // Seed materials
  const materials = [
    { id: 'M2001', description: 'Chocolate Bar 50g', baseUom: 'EA', salesUom: 'EA', plant: 'DXB1', storageLocation: 'FG01', priceUsd: 1.20 },
    { id: 'M2002', description: 'Fruit Candy Pack 100g', baseUom: 'EA', salesUom: 'EA', plant: 'DXB1', storageLocation: 'FG01', priceUsd: 1.80 },
    { id: 'M2003', description: 'Caramel Toffee 200g', baseUom: 'EA', salesUom: 'EA', plant: 'DXB1', storageLocation: 'FG02', priceUsd: 2.50 },
    { id: 'M2004', description: 'Mint Candy Jar', baseUom: 'EA', salesUom: 'EA', plant: 'DXB1', storageLocation: 'FG02', priceUsd: 3.00 },
    { id: 'M2005', description: 'Assorted Candy Box', baseUom: 'EA', salesUom: 'EA', plant: 'DXB1', storageLocation: 'FG03', priceUsd: 4.50 },
  ];

  for (const material of materials) {
    await prisma.material.upsert({
      where: { id: material.id },
      update: {},
      create: material,
    });
  }
  console.log(`Seeded ${materials.length} materials`);

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
