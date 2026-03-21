import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface MaterialWithRelations {
  id: string;
  description: string;
  baseUom: string;
  salesUom: string;
  plant: string;
  storageLocation: string;
  priceUsd: number;
  isActive: boolean;
  inventoryRecords: Array<{
    closingStock: number;
    safetyStock: number;
    stockInTransit: number;
  }>;
  forecastRecords: Array<{
    forecastDemand: number;
  }>;
  _count: { orderLines: number };
}

export async function GET() {
  try {
    const materials = await prisma.material.findMany({
      orderBy: { description: 'asc' },
      include: {
        inventoryRecords: {
          orderBy: { month: 'desc' },
          take: 1,
        },
        forecastRecords: {
          orderBy: { month: 'desc' },
          take: 1,
        },
        _count: {
          select: { orderLines: true },
        },
      },
    });

    // Transform to frontend format
    const transformedMaterials = materials.map((material: MaterialWithRelations) => {
      const latestInventory = material.inventoryRecords[0];
      const latestForecast = material.forecastRecords[0];

      return {
        id: material.id,
        description: material.description,
        baseUOM: material.baseUom,
        salesUOM: material.salesUom,
        plant: material.plant,
        storageLocation: material.storageLocation,
        priceUSD: material.priceUsd,
        isActive: material.isActive,
        currentStock: latestInventory?.closingStock || 0,
        safetyStock: latestInventory?.safetyStock || 0,
        stockInTransit: latestInventory?.stockInTransit || 0,
        forecastDemand: latestForecast?.forecastDemand || 0,
        orderCount: material._count.orderLines,
      };
    });

    return NextResponse.json({
      success: true,
      materials: transformedMaterials,
      count: materials.length,
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch materials' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const material = await prisma.material.create({
      data: {
        id: body.materialId,
        description: body.description,
        baseUom: body.baseUOM || 'EA',
        salesUom: body.salesUOM || 'EA',
        plant: body.plant || 'DXB1',
        storageLocation: body.storageLocation || 'FG01',
        priceUsd: body.priceUSD || 0,
      },
    });

    // Create initial inventory record if provided
    if (body.openingStock !== undefined) {
      await prisma.inventoryRecord.create({
        data: {
          materialId: material.id,
          month: new Date(),
          openingStock: body.openingStock,
          closingStock: body.openingStock,
          stockInTransit: body.stockInTransit || 0,
          safetyStock: body.safetyStock || 0,
          replenishmentQty: 0,
        },
      });
    }

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
