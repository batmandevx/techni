import { NextRequest, NextResponse } from 'next/server';
import { getBatch, updateBatch, listCustomers, listMaterials } from '@/lib/smart-order/store';
import { validateRawRows } from '@/lib/smart-order/validation';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const batch = await getBatch(id);
    
    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Convert batch lines to raw rows for validation
    const rawRows = batch.lines.map(line => {
      const row: Record<string, unknown> = {
        orderType: line.orderType,
        salesOrg: line.salesOrg,
        distChannel: line.distChannel,
        division: line.division,
        soldTo: line.soldTo,
        shipTo: line.shipTo,
        material: line.material,
        quantity: line.quantity,
        price: line.price,
        requestedDeliveryDate: line.requestedDeliveryDate,
        poNumber: line.poNumber,
        currency: line.currency
      };
      return row;
    });

    // Get master data for validation
    const customers = await listCustomers();
    const materials = await listMaterials();

    // Validate rows
    const { rows: validationRows, summary } = validateRawRows(
      rawRows,
      batch.mappingConfig,
      customers,
      materials,
      batch.lines
    );
    
    // Update batch lines with validation results
    const validatedLines = batch.lines.map((line, index) => {
      const result = validationRows[index];
      return {
        ...line,
        validationErrors: result.line.validationErrors,
        warnings: result.line.warnings,
        status: result.line.status
      };
    });

    // Update batch
    await updateBatch(id, {
      lines: validatedLines,
      status: 'VALIDATED',
      report: {
        progressPercent: 0,
        createdGroups: batch.report?.createdGroups || 0,
        failedGroups: batch.report?.failedGroups || 0,
        averageProcessingTimeMs: batch.report?.averageProcessingTimeMs || 0,
        message: `Validated: ${summary.validRows}/${summary.totalRows} valid, ${summary.invalidRows} errors, ${summary.warningRows} warnings`
      }
    });

    return NextResponse.json({
      success: true,
      valid: summary.invalidRows === 0,
      lines: validatedLines.map(line => ({
        id: line.id,
        data: {
          orderType: line.orderType,
          salesOrg: line.salesOrg,
          distChannel: line.distChannel,
          division: line.division,
          soldTo: line.soldTo,
          shipTo: line.shipTo,
          material: line.material,
          quantity: line.quantity,
          price: line.price,
          requestedDeliveryDate: line.requestedDeliveryDate,
          poNumber: line.poNumber,
          currency: line.currency
        },
        validationErrors: line.validationErrors,
        warnings: line.warnings
      })),
      stats: {
        total: summary.totalRows,
        valid: summary.validRows,
        errors: summary.invalidRows,
        warnings: summary.warningRows
      }
    });

  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Validation failed' },
      { status: 500 }
    );
  }
}
