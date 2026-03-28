import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LineStatus, BatchStatus } from '@prisma/client';

// Mock SAP BAPI response
function mockSAPCall(orderLine: any) {
  const success = Math.random() > 0.1; // 90% success rate
  
  if (success) {
    return {
      success: true,
      orderNumber: '00000' + Math.floor(100000 + Math.random() * 900000),
      message: 'Order created successfully',
    };
  } else {
    return {
      success: false,
      errors: ['Material not available in plant', 'Pricing condition missing'],
    };
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const batchId = params.id;
    
    // Get batch with order lines
    const batch = await prisma.orderBatch.findUnique({
      where: { id: batchId },
      include: { orderLines: true },
    });

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Update batch status
    await prisma.orderBatch.update({
      where: { id: batchId },
      data: { status: BatchStatus.PROCESSING },
    });

    let successCount = 0;
    let failedCount = 0;

    // Process each order line
    for (const line of batch.orderLines) {
      // Validate against master data
      const customer = await prisma.customerMaster.findUnique({
        where: { customerNumber: line.soldTo },
      });

      const material = await prisma.materialMaster.findUnique({
        where: { materialNumber: line.material },
      });

      if (!customer) {
        await prisma.orderLine.update({
          where: { id: line.id },
          data: {
            status: LineStatus.FAILED,
            validationErrors: JSON.stringify(['Customer not found in master data']),
            processedAt: new Date(),
          },
        });
        failedCount++;
        continue;
      }

      if (!material) {
        await prisma.orderLine.update({
          where: { id: line.id },
          data: {
            status: LineStatus.FAILED,
            validationErrors: JSON.stringify(['Material not found in master data']),
            processedAt: new Date(),
          },
        });
        failedCount++;
        continue;
      }

      // Call SAP (mock)
      const sapResult = mockSAPCall(line);

      if (sapResult.success) {
        await prisma.orderLine.update({
          where: { id: line.id },
          data: {
            status: LineStatus.CREATED,
            sapOrderNumber: sapResult.orderNumber,
            sapResponse: JSON.stringify(sapResult),
            processedAt: new Date(),
          },
        });
        successCount++;
      } else {
        await prisma.orderLine.update({
          where: { id: line.id },
          data: {
            status: LineStatus.FAILED,
            validationErrors: JSON.stringify(sapResult.errors),
            sapResponse: JSON.stringify(sapResult),
            processedAt: new Date(),
          },
        });
        failedCount++;
      }
    }

    // Update batch with final status
    const finalStatus = failedCount === 0 
      ? BatchStatus.COMPLETED 
      : successCount > 0 
        ? BatchStatus.PARTIAL_SUCCESS 
        : BatchStatus.FAILED;

    await prisma.orderBatch.update({
      where: { id: batchId },
      data: {
        status: finalStatus,
        successCount,
        failedCount,
        pendingCount: 0,
        sapSyncStatus: 'SYNCED',
        sapSyncAt: new Date(),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'PROCESS_BATCH',
        entityType: 'OrderBatch',
        entityId: batchId,
        details: JSON.stringify({ successCount, failedCount }),
      },
    });

    return NextResponse.json({
      success: true,
      status: finalStatus,
      successCount,
      failedCount,
    });
  } catch (error) {
    console.error('Processing error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
