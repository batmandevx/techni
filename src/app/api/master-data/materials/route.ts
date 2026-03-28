import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where = search ? {
      OR: [
        { materialNumber: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
        { materialGroup: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};

    const [materials, total] = await Promise.all([
      prisma.materialMaster.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.materialMaster.count({ where }),
    ]);

    return NextResponse.json({
      materials,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const material = await prisma.materialMaster.create({
      data: {
        materialNumber: data.materialNumber,
        description: data.description,
        baseUom: data.baseUom || 'EA',
        salesUom: data.salesUom || 'EA',
        plant: data.plant || '1000',
        storageLocation: data.storageLocation,
        materialGroup: data.materialGroup,
        category: data.category,
        subCategory: data.subCategory,
        priceUsd: data.priceUsd,
        costUsd: data.costUsd,
        isActive: true,
      },
    });

    return NextResponse.json({ material });
  } catch (error) {
    console.error('Error creating material:', error);
    return NextResponse.json({ error: 'Failed to create material' }, { status: 500 });
  }
}
