import { NextResponse } from 'next/server';

// Mock materials data for when Prisma is not available
const mockMaterials = [
  { id: 'MAT001', materialNumber: 'MAT001', description: 'Premium Basmati Rice 1kg', baseUom: 'EA', salesUom: 'EA', plant: '1000', storageLocation: 'FG01', materialGroup: 'RICE', isActive: true, availableQty: 1000 },
  { id: 'MAT002', materialNumber: 'MAT002', description: 'Organic Turmeric Powder 200g', baseUom: 'EA', salesUom: 'EA', plant: '1000', storageLocation: 'FG01', materialGroup: 'SPICES', isActive: true, availableQty: 500 },
  { id: 'MAT003', materialNumber: 'MAT003', description: 'Cold Pressed Coconut Oil 1L', baseUom: 'EA', salesUom: 'EA', plant: '1000', storageLocation: 'FG01', materialGroup: 'OILS', isActive: true, availableQty: 750 },
  { id: 'MAT004', materialNumber: 'MAT004', description: 'Whole Wheat Atta 5kg', baseUom: 'EA', salesUom: 'EA', plant: '1000', storageLocation: 'FG01', materialGroup: 'FLOUR', isActive: true, availableQty: 1200 },
  { id: 'MAT005', materialNumber: 'MAT005', description: 'Premium Tea Powder 500g', baseUom: 'EA', salesUom: 'EA', plant: '1000', storageLocation: 'FG01', materialGroup: 'BEVERAGES', isActive: true, availableQty: 800 },
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
      return NextResponse.json({
        success: true,
        materials: mockMaterials.map(m => ({
          id: m.id,
          materialNumber: m.materialNumber,
          description: m.description,
          baseUom: m.baseUom,
          availableQty: m.availableQty,
          plant: m.plant,
          materialGroup: m.materialGroup,
          isActive: m.isActive,
        })),
        count: mockMaterials.length,
      });
    }
    
    const materials = await prisma.material.findMany({
      orderBy: { description: 'asc' },
    });

    return NextResponse.json({
      success: true,
      materials: materials.map((m: any) => ({
        id: m.id,
        materialNumber: m.materialNumber,
        description: m.description,
        baseUom: m.baseUom,
        availableQty: m.availableQty,
        plant: m.plant,
        materialGroup: m.materialGroup,
        isActive: m.isActive,
      })),
      count: materials.length,
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json({
      success: true,
      materials: mockMaterials.map(m => ({
        id: m.id,
        materialNumber: m.materialNumber,
        description: m.description,
        baseUom: m.baseUom,
        availableQty: m.availableQty,
        plant: m.plant,
        materialGroup: m.materialGroup,
        isActive: m.isActive,
      })),
      count: mockMaterials.length,
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
        material: { id: body.materialNumber, ...body },
        message: 'Material created (mock mode)'
      });
    }
    
    const material = await prisma.material.create({
      data: {
        materialNumber: body.materialNumber,
        description: body.description,
        baseUom: body.baseUom || 'EA',
        salesUom: body.salesUom || 'EA',
        plant: body.plant || '1000',
        storageLocation: body.storageLocation || 'FG01',
        materialGroup: body.materialGroup || 'GENERAL',
        isActive: true,
        availableQty: body.availableQty || 0,
      },
    });

    return NextResponse.json({
      success: true,
      material,
    });
  } catch (error) {
    console.error('Error creating material:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create material' },
      { status: 500 }
    );
  }
}
