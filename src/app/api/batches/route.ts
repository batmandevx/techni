import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BatchStatus } from '@prisma/client';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    const batches = await prisma.orderBatch.findMany({
      include: {
        _count: {
          select: { orderLines: true },
        },
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ batches });
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json({ error: 'Failed to fetch batches' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const mappingsJson = formData.get('mappings') as string;

    if (!file || !userId) {
      return NextResponse.json({ error: 'Missing file or userId' }, { status: 400 });
    }

    // Read file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse Excel
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    if (jsonData.length < 2) {
      return NextResponse.json({ error: 'File is empty or invalid' }, { status: 400 });
    }

    const headers = jsonData[0];
    const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== ''));

    // Create batch
    const batch = await prisma.orderBatch.create({
      data: {
        batchName: file.name.replace(/\.[^/.]+$/, ''),
        fileName: file.name,
        fileUrl: `/uploads/${file.name}`,
        totalOrders: rows.length,
        pendingCount: rows.length,
        status: BatchStatus.UPLOADED,
        uploadedBy: userId,
        mappingConfig: mappingsJson,
        aiMappingConfidence: 0.9,
      },
    });

    // Parse mappings
    const mappings = mappingsJson ? JSON.parse(mappingsJson) : [];
    const mappingMap: Record<string, string> = {};
    mappings.forEach((m: any) => {
      mappingMap[m.source_column] = m.target_field;
    });

    // Create order lines
    const orderLines = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowData: Record<string, any> = {};
      
      headers.forEach((header, idx) => {
        const targetField = mappingMap[header];
        if (targetField) {
          rowData[targetField] = row[idx];
        }
      });

      orderLines.push({
        batchId: batch.id,
        rowIndex: i,
        orderType: rowData.ORDER_TYPE || 'OR',
        salesOrg: rowData.SALES_ORG || '1000',
        distChannel: rowData.DIST_CHANNEL || '10',
        division: rowData.DIVISION || '00',
        soldTo: String(rowData.SOLD_TO || ''),
        shipTo: String(rowData.SHIP_TO || rowData.SOLD_TO || ''),
        material: String(rowData.MATERIAL || ''),
        quantity: parseFloat(rowData.QTY) || 0,
        unitPrice: parseFloat(rowData.PRICE) || 0,
        lineTotal: (parseFloat(rowData.QTY) || 0) * (parseFloat(rowData.PRICE) || 0),
        currency: 'USD',
        requestedDeliveryDate: parseDate(rowData.REQ_DEL_DATE),
        status: 'PENDING',
      });
    }

    // Bulk create order lines
    await prisma.orderLine.createMany({
      data: orderLines,
    });

    // Update batch status
    await prisma.orderBatch.update({
      where: { id: batch.id },
      data: { status: BatchStatus.VALIDATED },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPLOAD',
        entityType: 'OrderBatch',
        entityId: batch.id,
        details: JSON.stringify({ fileName: file.name, rows: rows.length }),
      },
    });

    return NextResponse.json({ 
      batch,
      message: 'Batch uploaded successfully',
      orderCount: orderLines.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

function parseDate(dateValue: any): Date | null {
  if (!dateValue) return null;
  
  // Try parsing various date formats
  const date = new Date(dateValue);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  // Try DD.MM.YYYY format
  if (typeof dateValue === 'string' && dateValue.includes('.')) {
    const parts = dateValue.split('.');
    if (parts.length === 3) {
      const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      if (!isNaN(d.getTime())) return d;
    }
  }
  
  return null;
}
