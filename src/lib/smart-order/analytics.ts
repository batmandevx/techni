import {
  SmartAnalyticsFilters,
  SmartAnalyticsSnapshot,
  SmartOrderBatch,
  SmartOrderStore,
} from "@/lib/smart-order/types";
import { groupBy } from "@/lib/smart-order/utils";

function inRange(value: string, filters: SmartAnalyticsFilters): boolean {
  if (filters.dateFrom && value < filters.dateFrom) return false;
  if (filters.dateTo && value > filters.dateTo) return false;
  return true;
}

function filterBatches(batches: SmartOrderBatch[], filters: SmartAnalyticsFilters): SmartOrderBatch[] {
  return batches.filter((batch) => {
    if (!inRange(batch.createdAt.slice(0, 10), filters)) {
      return false;
    }

    if (filters.status && filters.status !== "ALL" && batch.status !== filters.status) {
      return false;
    }

    if (filters.salesOrg || filters.customer) {
      return batch.lines.some((line) => {
        if (filters.salesOrg && line.salesOrg !== filters.salesOrg) return false;
        if (filters.customer && line.soldTo !== filters.customer) return false;
        return true;
      });
    }

    return true;
  });
}

function previousPeriodFilters(filters: SmartAnalyticsFilters): SmartAnalyticsFilters {
  if (!filters.dateFrom || !filters.dateTo) {
    return {};
  }

  const from = new Date(filters.dateFrom);
  const to = new Date(filters.dateTo);
  const span = to.getTime() - from.getTime();
  const prevTo = new Date(from.getTime() - 24 * 60 * 60 * 1000);
  const prevFrom = new Date(prevTo.getTime() - span);

  return {
    ...filters,
    dateFrom: prevFrom.toISOString().slice(0, 10),
    dateTo: prevTo.toISOString().slice(0, 10),
  };
}

function sumBatchValue(batch: SmartOrderBatch): number {
  return batch.lines.reduce((sum, line) => sum + (line.price ?? 0) * line.quantity, 0);
}

function percentChange(current: number, previous: number): number {
  if (!previous) {
    return current ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

export function buildAnalyticsSnapshot(
  store: SmartOrderStore,
  filters: SmartAnalyticsFilters,
): SmartAnalyticsSnapshot {
  const batches = filterBatches(store.batches, filters);
  const previous = filterBatches(store.batches, previousPeriodFilters(filters));
  const customersByNumber = new Map(store.customers.map((customer) => [customer.customerNumber, customer]));
  const materialsByNumber = new Map(store.materials.map((material) => [material.materialNumber, material]));

  const createdLineCount = batches.flatMap((batch) => batch.lines).filter((line) => line.status === "CREATED").length;
  const totalValue = batches.reduce((sum, batch) => sum + sumBatchValue(batch), 0);
  const totalLines = batches.flatMap((batch) => batch.lines);
  const createdQty = totalLines.filter((line) => line.status === "CREATED").reduce((sum, line) => sum + line.quantity, 0);
  const orderedQty = totalLines.reduce((sum, line) => sum + line.quantity, 0);
  const pendingLines = totalLines.filter((line) => line.status !== "CREATED");
  const pendingQty = pendingLines.reduce((sum, line) => sum + line.quantity, 0);
  const pendingValue = pendingLines.reduce((sum, line) => sum + line.quantity * (line.price ?? 0), 0);
  const uniqueMaterials = new Set(totalLines.map((line) => line.material));
  const successRate = totalLines.length ? (createdLineCount / totalLines.length) * 100 : 0;

  const previousCreated = previous.flatMap((batch) => batch.lines).filter((line) => line.status === "CREATED").length;
  const previousValue = previous.reduce((sum, batch) => sum + sumBatchValue(batch), 0);

  const groupedByDay = groupBy(batches, (batch) => batch.createdAt.slice(0, 10));
  const ordersOverTime = Object.entries(groupedByDay)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([period, dayBatches]) => ({
      period,
      count: dayBatches.flatMap((batch) => batch.lines).filter((line) => line.status === "CREATED").length,
      value: dayBatches.reduce((sum, batch) => sum + sumBatchValue(batch), 0),
    }));

  const customerBuckets = new Map<string, { value: number; orderCount: number }>();
  totalLines.forEach((line) => {
    const current = customerBuckets.get(line.soldTo) ?? { value: 0, orderCount: 0 };
    current.value += line.quantity * (line.price ?? 0);
    current.orderCount += 1;
    customerBuckets.set(line.soldTo, current);
  });

  const topCustomers = Array.from(customerBuckets.entries())
    .map(([customerNumber, data]) => {
      const customer = customersByNumber.get(customerNumber);
      return {
        customerNumber,
        companyName: customer?.companyName ?? customerNumber,
        value: data.value,
        orderCount: data.orderCount,
      };
    })
    .sort((left, right) => right.value - left.value)
    .slice(0, 10);

  const skuDistributionBuckets = new Map<string, number>();
  totalLines.forEach((line) => {
    const material = materialsByNumber.get(line.material);
    const key = material?.category ?? "Other";
    skuDistributionBuckets.set(key, (skuDistributionBuckets.get(key) ?? 0) + line.quantity);
  });

  const statusBreakdown = Object.entries(groupedByDay)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([period, dayBatches]) => {
      const lines = dayBatches.flatMap((batch) => batch.lines);
      return {
        period,
        created: lines.filter((line) => line.status === "CREATED").length,
        failed: lines.filter((line) => line.status === "FAILED").length,
        pending: lines.filter((line) => ["PENDING", "VALID", "PROCESSING"].includes(line.status)).length,
      };
    });

  const processingTrend = Object.entries(groupedByDay)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([period, dayBatches]) => {
      const durations = dayBatches
        .flatMap((batch) => batch.lines)
        .map((line) => line.processingDurationMs ?? 0)
        .filter((value) => value > 0);

      const avgMs = durations.length ? durations.reduce((sum, value) => sum + value, 0) / durations.length : 0;
      return { period, avgMs };
    });

  // Calculate additional stats
  const pendingCount = batches.filter(b => b.status === 'UPLOADED' || b.status === 'VALIDATING' || b.status === 'AI_MAPPING' || b.status === 'VALIDATED' || b.status === 'PROCESSING').length;
  const completedCount = batches.filter(b => b.status === 'COMPLETED').length;
  const failedCount = batches.filter(b => b.status === 'FAILED').length;

  return {
    filters,
    kpis: {
      ordersCreated: createdLineCount,
      ordersCreatedChange: percentChange(createdLineCount, previousCreated),
      totalOrderValue: totalValue,
      totalOrderValueChange: percentChange(totalValue, previousValue),
      skuMix: uniqueMaterials.size,
      fillRate: orderedQty ? (createdQty / orderedQty) * 100 : 0,
      backordersQty: pendingQty,
      backordersValue: pendingValue,
      successRate,
      pendingCount,
      completedCount,
      failedCount,
      totalCustomers: store.customers.length,
      totalMaterials: store.materials.length,
    },
    ordersOverTime,
    orderValueByCustomer: topCustomers.map((customer) => ({
      customer: customer.companyName,
      value: customer.value,
    })),
    skuDistribution: Array.from(skuDistributionBuckets.entries()).map(([name, value]) => ({ name, value })),
    statusBreakdown,
    processingTrend,
    topCustomers,
    recentBatches: batches
      .slice()
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, 5),
  };
}
