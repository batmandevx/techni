import { NextRequest, NextResponse } from 'next/server';
import { getBatch, updateBatch } from '@/lib/smart-order/store';
import { BatchStatus } from '@/lib/smart-order/types';

// Mock SAP service URL
const SAP_SERVICE_URL = process.env.SAP_SERVICE_URL || 'http://localhost:8000';

interface SAPOrderResponse {
  success: boolean;
  salesOrderNumber?: string;
  message?: string;
  error?: string;
}

async function createSalesOrder(orderData: {
  orderType: string;
  salesOrg: string;
  distChannel: string;
  division: string;
  soldTo: string;
  shipTo: string;
  material: string;
  quantity: number;
  price: number | null;
  currency: string;
  poNumber: string;
  requestedDeliveryDate: string;
}): Promise<SAPOrderResponse> {
  try {
    const response = await fetch(`${SAP_SERVICE_URL}/api/create-sales-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'SAP service error'
      };
    }

    const result = await response.json();
    return {
      success: true,
      salesOrderNumber: result.salesOrderNumber || result.orderNumber,
      message: result.message
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'SAP connection failed'
    };
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const batch = await getBatch(id);
    
    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Update batch status to processing
    await updateBatch(id, { status: 'PROCESSING' as BatchStatus });

    // Process each valid line
    const results = [];
    let successCount = 0;
    let failedCount = 0;

    for (const line of batch.lines) {
      // Skip lines with validation errors
      if (line.validationErrors && line.validationErrors.length > 0) {
        failedCount++;
        continue;
      }

      // Create SAP order
      const orderData = {
        orderType: String(line.orderType || 'OR'),
        salesOrg: String(line.salesOrg || '1000'),
        distChannel: String(line.distChannel || '10'),
        division: String(line.division || '00'),
        soldTo: String(line.soldTo || ''),
        shipTo: String(line.shipTo || line.soldTo || ''),
        material: String(line.material || ''),
        quantity: Number(line.quantity) || 0,
        price: line.price ? Number(line.price) : null,
        currency: String(line.currency || 'USD'),
        poNumber: String(line.poNumber || `PO-${Date.now()}`),
        requestedDeliveryDate: String(line.requestedDeliveryDate || new Date().toISOString().split('T')[0])
      };

      const sapResult = await createSalesOrder(orderData);

      // Update line with SAP response
      line.sapResponse = sapResult.success ? {
        orderNumber: sapResult.salesOrderNumber || 'N/A',
        message: sapResult.message
      } : { error: sapResult.error };
      line.status = sapResult.success ? 'CREATED' : 'FAILED';
      line.updatedAt = new Date().toISOString();

      if (sapResult.success) {
        successCount++;
      } else {
        failedCount++;
      }

      results.push({
        lineId: line.id,
        success: sapResult.success,
        orderNumber: sapResult.salesOrderNumber,
        error: sapResult.error
      });
    }

    // Update batch with results
    const finalStatus: BatchStatus = failedCount === 0 ? 'COMPLETED' : 
                                      successCount === 0 ? 'FAILED' : 'PARTIAL_SUCCESS';

    await updateBatch(id, {
      lines: batch.lines,
      status: finalStatus,
      successCount,
      failedCount,
      pendingCount: 0,
      report: {
        progressPercent: 100,
        createdGroups: successCount,
        failedGroups: failedCount,
        averageProcessingTimeMs: 0,
        message: `Processing complete: ${successCount} success, ${failedCount} failed`
      }
    });

    return NextResponse.json({
      success: true,
      batchId: id,
      status: finalStatus,
      stats: {
        total: batch.lines.length,
        success: successCount,
        failed: failedCount
      },
      results
    });

  } catch (error) {
    console.error('Process error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Processing failed' },
      { status: 500 }
    );
  }
}
