import { getBatch, updateBatch } from "@/lib/smart-order/data";
import { createSalesOrderInSap } from "@/lib/smart-order/sap";
import { SmartOrderBatch, SmartOrderLine } from "@/lib/smart-order/types";
import { groupBy, sleep } from "@/lib/smart-order/utils";

const activeBatches = new Set<string>();

function nextBatchStatus(batch: SmartOrderBatch): SmartOrderBatch["status"] {
  if (batch.successCount > 0 && batch.failedCount > 0) {
    return "PARTIAL_SUCCESS";
  }
  if (batch.successCount > 0 && batch.failedCount === 0) {
    return "COMPLETED";
  }
  return "FAILED";
}

function averageDuration(lines: SmartOrderLine[]): number {
  const durations = lines.map((line) => line.processingDurationMs ?? 0).filter((value) => value > 0);
  if (!durations.length) {
    return 0;
  }
  return durations.reduce((sum, value) => sum + value, 0) / durations.length;
}

export async function processBatchInBackground(batchId: string): Promise<void> {
  if (activeBatches.has(batchId)) {
    return;
  }

  activeBatches.add(batchId);

  try {
    const batch = await getBatch(batchId);
    if (!batch || batch.status === "PROCESSING") {
      return;
    }

    await updateBatch(batchId, (current) => ({
      ...current,
      status: "PROCESSING",
      report: {
        ...(current.report ?? {
          progressPercent: 0,
          createdGroups: 0,
          failedGroups: 0,
          averageProcessingTimeMs: 0,
        }),
        startedAt: new Date().toISOString(),
        message: "Dispatching validated lines to SAP mock worker.",
      },
      lines: current.lines.map((line) =>
        line.status === "VALID" || line.status === "PENDING"
          ? { ...line, status: "PROCESSING" }
          : line,
      ),
    }));

    const groups = groupBy(
      batch.lines.filter((line) => ["VALID", "PENDING", "FAILED"].includes(line.status)),
      (line) => line.soldTo,
    );

    let processedGroups = 0;
    let createdGroups = 0;
    let failedGroups = 0;

    for (const customerGroup of Object.values(groups)) {
      const startedAt = Date.now();
      const [firstLine] = customerGroup;

      const result = await createSalesOrderInSap({
        orderType: firstLine.orderType,
        salesOrg: firstLine.salesOrg,
        distChannel: firstLine.distChannel,
        division: firstLine.division,
        soldTo: firstLine.soldTo,
        shipTo: firstLine.shipTo,
        reqDelDate: firstLine.requestedDeliveryDate,
        currency: firstLine.currency,
        poNumber: firstLine.poNumber,
        items: customerGroup,
      });

      processedGroups += 1;
      const durationMs = Date.now() - startedAt;

      await updateBatch(batchId, (current) => {
        const lines: SmartOrderLine[] = current.lines.map((line): SmartOrderLine => {
          if (!customerGroup.some((groupLine) => groupLine.id === line.id)) {
            return line;
          }

          if (result.success) {
            return {
              ...line,
              status: "CREATED",
              sapOrderNumber: result.orderNumber ?? null,
              sapItemNumber: String((customerGroup.indexOf(line) + 1) * 10).padStart(6, "0"),
              sapResponse: result.response ?? null,
              processingDurationMs: durationMs,
            };
          }

          return {
            ...line,
            status: "FAILED",
            validationErrors: [
              ...line.validationErrors,
              ...(result.errors ?? ["Unknown SAP processing error."]),
            ],
            sapResponse: result.response ?? null,
            retryCount: line.retryCount + 1,
            processingDurationMs: durationMs,
          };
        });

        const successCount = lines.filter((line) => line.status === "CREATED").length;
        const failedCount = lines.filter((line) => line.status === "FAILED").length;
        const pendingCount = lines.filter((line) => ["VALID", "PENDING", "PROCESSING"].includes(line.status)).length;

        return {
          ...current,
          successCount,
          failedCount,
          pendingCount,
          report: {
            startedAt: current.report?.startedAt ?? new Date().toISOString(),
            progressPercent: Object.keys(groups).length
              ? Math.round((processedGroups / Object.keys(groups).length) * 100)
              : 100,
            createdGroups,
            failedGroups,
            averageProcessingTimeMs: averageDuration(lines),
            message: result.success
              ? `Created SAP order ${result.orderNumber} for customer ${firstLine.soldTo}.`
              : `Customer ${firstLine.soldTo} failed SAP creation.`,
          },
        };
      });

      if (result.success) {
        createdGroups += 1;
      } else {
        failedGroups += 1;
      }

      await sleep(750);
    }

    await updateBatch(batchId, (current) => ({
      ...current,
      status: nextBatchStatus(current),
      report: {
        ...(current.report ?? {
          progressPercent: 100,
          createdGroups,
          failedGroups,
          averageProcessingTimeMs: averageDuration(current.lines),
        }),
        progressPercent: 100,
        createdGroups,
        failedGroups,
        averageProcessingTimeMs: averageDuration(current.lines),
        completedAt: new Date().toISOString(),
        message: `${createdGroups} customer groups created, ${failedGroups} failed.`,
      },
    }));
  } finally {
    activeBatches.delete(batchId);
  }
}
