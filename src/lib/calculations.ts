// Core S&OP Calculation Engine

export function calculateClosingStock(
  openingStock: number,
  stockInTransit: number,
  actualSales: number
): number {
  const closing = openingStock + stockInTransit - actualSales;
  return Math.max(0, closing);
}

export function calculateReplenishmentQty(
  forecastDemand: number,
  safetyStock: number,
  closingStock: number
): number {
  const required = (forecastDemand + safetyStock) - closingStock;
  return Math.max(0, required);
}

export function calculateForecastAccuracy(actual: number, forecast: number): number {
  if (actual === 0) return forecast === 0 ? 100 : 0;
  const accuracy = (1 - Math.abs(actual - forecast) / actual) * 100;
  return Math.max(0, Math.round(accuracy * 100) / 100);
}

export function calculateInventoryTurns(cogs: number, avgInventory: number): number {
  if (avgInventory === 0) return 0;
  return Math.round((cogs / avgInventory) * 100) / 100;
}

export function calculateFillRate(fulfilledOrders: number, totalOrders: number): number {
  if (totalOrders === 0) return 100;
  return Math.round((fulfilledOrders / totalOrders) * 10000) / 100;
}

export function calculateStockCoverage(currentStock: number, avgDailySales: number): number {
  if (avgDailySales === 0) return 999;
  return Math.round((currentStock / avgDailySales) * 10) / 10;
}

export function calculateStockoutRisk(
  demandVariance: number,
  safetyStock: number,
  currentStock: number
): number {
  const zScore = (currentStock - safetyStock) / Math.max(demandVariance, 1);
  const risk = Math.max(0, Math.min(100, 50 - zScore * 20));
  return Math.round(risk);
}

export function calculateOrderLineTotal(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100;
}
