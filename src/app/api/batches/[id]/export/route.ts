import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const batchId = params.id;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'xlsx';

    const batch = await prisma.orderBatch.findUnique({
      where: { id: batchId },
      include: { orderLines: true },
    });

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Prepare data for export
    const exportData = batch.orderLines.map((line) => ({
      'Row': line.rowIndex + 1,
      'Order Type': line.orderType,
      'Sales Org': line.salesOrg,
      'Dist. Channel': line.distChannel,
      'Division': line.division,
      'Sold-To': line.soldTo,
      'Ship-To': line.shipTo,
      'Material': line.material,
      'Quantity': line.quantity,
      'Unit Price': line.unitPrice,
      'Line Total': line.lineTotal,
      'Currency': line.currency,
      'Req. Delivery Date': line.requestedDeliveryDate?.toISOString().split('T')[0] || '',
      'SAP Order Number': line.sapOrderNumber || '',
      'Status': line.status,
      'Errors': line.validationErrors ? JSON.parse(line.validationErrors).join(', ') : '',
    }));

    if (format === 'csv') {
      // Generate CSV
      const headers = Object.keys(exportData[0] || {});
      const csvRows = [
        headers.join(','),
        ...exportData.map(row => headers.map(h => {
          const val = (row as any)[h];
          // Escape values with commas
          if (typeof val === 'string' && val.includes(',')) {
            return `"${val}"`;
          }
          return val;
        }).join(','))
      ];
      const csv = csvRows.join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="batch-${batchId}.csv"`,
        },
      });
    }

    // Generate Excel
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    
    // Auto-size columns
    const colWidths = headers.map(h => ({ wch: Math.max(h.length, 15) }));
    worksheet['!cols'] = colWidths;

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="batch-${batchId}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

const headers = [
  'Row', 'Order Type', 'Sales Org', 'Dist. Channel', 'Division',
  'Sold-To', 'Ship-To', 'Material', 'Quantity', 'Unit Price',
  'Line Total', 'Currency', 'Req. Delivery Date', 'SAP Order Number',
  'Status', 'Errors'
];
