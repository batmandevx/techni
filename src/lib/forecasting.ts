// Advanced Forecasting Engine for S&OP
// Implements multiple forecasting algorithms and statistical analysis

export interface InventoryRecord {
  materialId: string;
  month: string;
  openingStock: number;
  stockInTransit: number;
  actualSales: number;
  forecastDemand: number;
  safetyStock: number;
}

export interface ForecastResult extends InventoryRecord {
  closingStock: number;
  replenishmentQty: number;
  forecastAccuracy: number;
  stockCoverageDays: number;
  stockoutRisk: number;
  forecastError: number;
  bias: number;
  mape: number;
}

export interface ForecastMetrics {
  accuracy: number;
  bias: number;
  mape: number;
  rmse: number;
  trackingSignal: number;
}

export interface TrendAnalysis {
  direction: 'up' | 'down' | 'stable';
  slope: number;
  strength: number; // 0-100
  seasonalFactor: number;
}

export interface ForecastScenario {
  id: string;
  name: string;
  description: string;
  demandAdjustment: number;
  safetyStockAdjustment: number;
  leadTimeAdjustment: number;
  confidence: number;
}

// ============================================
// Core Inventory Calculations & SAP Formulas
// ============================================

export const Z_SCORES: Record<number, number> = {
  0.90: 1.28,
  0.95: 1.645,
  0.98: 2.05,
  0.99: 2.33,
};

/**
 * Calculate standard deviation for a set of numbers
 */
export function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * SAP Standard Statistical Safety Stock
 * SS = Z * sqrt(LeadTime) * standardDeviation(Demand)
 */
export function calculateStatisticalSafetyStock(
  historicalDemand: number[],
  leadTimeDays: number,
  serviceLevel: number = 0.95
): number {
  const zScore = Z_SCORES[serviceLevel] || 1.645;
  const stdDevDemand = calculateStandardDeviation(historicalDemand);
  const leadTimeMonths = Math.max(0.1, leadTimeDays / 30);
  return Math.round(zScore * Math.sqrt(leadTimeMonths) * stdDevDemand);
}

/**
 * Closing Stock = Opening Stock + Stock in Transit – Actual Sales
 */
export function calculateClosingStock(openingStock: number, stockInTransit: number, actualSales: number): number {
  return Math.max(0, openingStock + stockInTransit - actualSales);
}

/**
 * Replenishment Quantity = (Forecast Demand + Safety Stock) – Closing Stock
 * If ≤ 0, no replenishment needed
 */
export function calculateReplenishment(forecastDemand: number, safetyStock: number, closingStock: number): number {
  const qty = (forecastDemand + safetyStock) - closingStock;
  return Math.max(0, Math.ceil(qty));
}

/**
 * Forecast Accuracy = (1 - |Actual - Forecast| / Actual) × 100
 */
export function calculateForecastAccuracy(actual: number, forecast: number): number {
  if (actual === 0) return forecast === 0 ? 100 : 0;
  return Math.max(0, Math.min(100, (1 - Math.abs(actual - forecast) / actual) * 100));
}

/**
 * Mean Absolute Percentage Error (MAPE)
 */
export function calculateMAPE(actuals: number[], forecasts: number[]): number {
  if (actuals.length === 0 || actuals.length !== forecasts.length) return 0;
  let sum = 0;
  let count = 0;
  for (let i = 0; i < actuals.length; i++) {
    if (actuals[i] !== 0) {
      sum += Math.abs((actuals[i] - forecasts[i]) / actuals[i]);
      count++;
    }
  }
  return count > 0 ? (sum / count) * 100 : 0;
}

/**
 * Root Mean Square Error (RMSE)
 */
export function calculateRMSE(actuals: number[], forecasts: number[]): number {
  if (actuals.length === 0 || actuals.length !== forecasts.length) return 0;
  const squaredErrors = actuals.map((actual, i) => Math.pow(actual - forecasts[i], 2));
  const mse = squaredErrors.reduce((a, b) => a + b, 0) / actuals.length;
  return Math.sqrt(mse);
}

/**
 * Forecast Bias = Average of (Forecast - Actual)
 * Positive = Over-forecasting, Negative = Under-forecasting
 */
export function calculateBias(actuals: number[], forecasts: number[]): number {
  if (actuals.length === 0 || actuals.length !== forecasts.length) return 0;
  const biases = actuals.map((actual, i) => forecasts[i] - actual);
  return biases.reduce((a, b) => a + b, 0) / biases.length;
}

/**
 * Tracking Signal = Running Sum of Forecast Errors / MAD
 */
export function calculateTrackingSignal(actuals: number[], forecasts: number[]): number {
  if (actuals.length < 2) return 0;
  const errors = actuals.map((actual, i) => actual - forecasts[i]);
  const runningSum = errors.reduce((a, b) => a + b, 0);
  const absErrors = errors.map(e => Math.abs(e));
  const mad = absErrors.reduce((a, b) => a + b, 0) / absErrors.length;
  return mad !== 0 ? runningSum / mad : 0;
}

/**
 * Stock Coverage = Current Inventory / Average Daily Sales (assumes 30-day month)
 */
export function calculateStockCoverage(currentStock: number, monthlySales: number): number {
  const dailySales = monthlySales / 30;
  if (dailySales === 0) return 999;
  return Math.round(currentStock / dailySales);
}

/**
 * Stockout Risk Probability based on coverage and safety stock
 */
export function calculateStockoutRisk(closingStock: number, safetyStock: number, forecastDemand: number): number {
  if (closingStock <= 0) return 100;
  if (closingStock >= forecastDemand + safetyStock) return 0;
  const ratio = closingStock / (forecastDemand + safetyStock);
  if (ratio < 0.3) return 85;
  if (ratio < 0.5) return 60;
  if (ratio < 0.7) return 35;
  if (ratio < 0.9) return 15;
  return 5;
}

// ============================================
// Forecasting Algorithms
// ============================================

/**
 * Simple Moving Average Forecast
 */
export function movingAverageForecast(historicalSales: number[], periods: number = 3): number {
  if (historicalSales.length === 0) return 0;
  const n = Math.min(periods, historicalSales.length);
  const recent = historicalSales.slice(-n);
  return Math.round(recent.reduce((a, b) => a + b, 0) / n);
}

/**
 * Weighted Moving Average (more weight to recent periods)
 */
export function weightedMovingAverage(historicalSales: number[], weights?: number[]): number {
  if (historicalSales.length === 0) return 0;
  const n = historicalSales.length;
  const defaultWeights = Array.from({ length: n }, (_, i) => (i + 1) / ((n * (n + 1)) / 2));
  const w = weights || defaultWeights;
  
  let sum = 0;
  let weightSum = 0;
  for (let i = 0; i < n; i++) {
    sum += historicalSales[i] * w[i];
    weightSum += w[i];
  }
  return Math.round(sum / weightSum);
}

/**
 * Exponential Smoothing (Simple)
 * @param alpha - Smoothing factor (0-1), higher = more responsive to recent changes
 */
export function exponentialSmoothing(historicalSales: number[], alpha: number = 0.3): number {
  if (historicalSales.length === 0) return 0;
  if (historicalSales.length === 1) return historicalSales[0];
  
  let forecast = historicalSales[0];
  for (let i = 1; i < historicalSales.length; i++) {
    forecast = alpha * historicalSales[i] + (1 - alpha) * forecast;
  }
  return Math.round(forecast);
}

/**
 * Double Exponential Smoothing (Holt's Method) - captures trend
 */
export function holtSmoothing(
  historicalSales: number[],
  alpha: number = 0.3,
  beta: number = 0.1,
  periodsAhead: number = 1
): number {
  if (historicalSales.length < 2) return historicalSales[0] || 0;
  
  let level = historicalSales[0];
  let trend = historicalSales[1] - historicalSales[0];
  
  for (let i = 1; i < historicalSales.length; i++) {
    const prevLevel = level;
    level = alpha * historicalSales[i] + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
  }
  
  return Math.round(level + periodsAhead * trend);
}

/**
 * Linear Regression Forecast
 */
export function linearRegressionForecast(historicalSales: number[], periodsAhead: number = 1): number {
  if (historicalSales.length < 2) return historicalSales[0] || 0;
  
  const n = historicalSales.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = historicalSales;
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return Math.round(slope * (n - 1 + periodsAhead) + intercept);
}

/**
 * Seasonal Decomposition Forecast
 */
export function seasonalForecast(
  historicalSales: number[],
  seasonLength: number = 12,
  periodsAhead: number = 1
): number {
  if (historicalSales.length < seasonLength * 2) {
    return movingAverageForecast(historicalSales, 3);
  }
  
  const seasons: number[][] = [];
  for (let i = 0; i < seasonLength; i++) {
    seasons[i] = [];
    for (let j = i; j < historicalSales.length; j += seasonLength) {
      seasons[i].push(historicalSales[j]);
    }
  }
  
  const seasonalIndices = seasons.map(season => 
    season.length > 0 ? season.reduce((a, b) => a + b, 0) / season.length : 0
  );
  
  const overallAverage = historicalSales.reduce((a, b) => a + b, 0) / historicalSales.length;
  const normalizedIndices = seasonalIndices.map(idx => idx / overallAverage);
  
  const trend = linearRegressionForecast(historicalSales, periodsAhead);
  const seasonalIndex = normalizedIndices[(historicalSales.length + periodsAhead - 1) % seasonLength];
  
  return Math.round(trend * seasonalIndex);
}

// ============================================
// Trend Analysis
// ============================================

/**
 * Analyze trend direction and strength
 */
export function analyzeTrend(historicalSales: number[]): TrendAnalysis {
  if (historicalSales.length < 3) {
    return { direction: 'stable', slope: 0, strength: 0, seasonalFactor: 1 };
  }
  
  const n = historicalSales.length;
  const x = Array.from({ length: n }, (_, i) => i);
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = historicalSales.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * historicalSales[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumYY = historicalSales.reduce((sum, yi) => sum + yi * yi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  
  // Calculate R-squared for strength
  const ssTot = sumYY - (sumY * sumY) / n;
  const ssRes = sumYY - slope * sumXY - (sumY * sumY) / n + (slope * sumX * sumY) / n;
  const rSquared = ssTot !== 0 ? 1 - ssRes / ssTot : 0;
  
  // Determine direction
  let direction: 'up' | 'down' | 'stable' = 'stable';
  if (slope > historicalSales.reduce((a, b) => a + b, 0) / n * 0.05) direction = 'up';
  else if (slope < -historicalSales.reduce((a, b) => a + b, 0) / n * 0.05) direction = 'down';
  
  // Calculate seasonal factor (simple)
  const firstHalf = historicalSales.slice(0, Math.floor(n / 2));
  const secondHalf = historicalSales.slice(Math.floor(n / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const seasonalFactor = firstAvg !== 0 ? secondAvg / firstAvg : 1;
  
  return {
    direction,
    slope,
    strength: Math.round(Math.abs(rSquared) * 100),
    seasonalFactor,
  };
}

// ============================================
// Main Processing Functions
// ============================================

export type ForecastMethod = 'sma' | 'wma' | 'ses' | 'holt' | 'linear' | 'seasonal';

export interface ForecastOptions {
  method: ForecastMethod;
  periods?: number;
  alpha?: number;
  beta?: number;
  seasonLength?: number;
}

/**
 * Generate forecast using specified method
 */
export function generateForecast(
  historicalSales: number[],
  options: ForecastOptions = { method: 'sma' }
): number {
  switch (options.method) {
    case 'sma':
      return movingAverageForecast(historicalSales, options.periods || 3);
    case 'wma':
      return weightedMovingAverage(historicalSales);
    case 'ses':
      return exponentialSmoothing(historicalSales, options.alpha || 0.3);
    case 'holt':
      return holtSmoothing(historicalSales, options.alpha || 0.3, options.beta || 0.1);
    case 'linear':
      return linearRegressionForecast(historicalSales);
    case 'seasonal':
      return seasonalForecast(historicalSales, options.seasonLength || 12);
    default:
      return movingAverageForecast(historicalSales, 3);
  }
}

/**
 * Process full inventory record through the forecasting engine
 */
export function processInventoryRecord(record: InventoryRecord): ForecastResult {
  const closingStock = calculateClosingStock(record.openingStock, record.stockInTransit, record.actualSales);
  const replenishmentQty = calculateReplenishment(record.forecastDemand, record.safetyStock, closingStock);
  const forecastAccuracy = calculateForecastAccuracy(record.actualSales, record.forecastDemand);
  const stockCoverageDays = calculateStockCoverage(closingStock, record.actualSales || record.forecastDemand);
  const stockoutRisk = calculateStockoutRisk(closingStock, record.safetyStock, record.forecastDemand);
  
  // Additional metrics
  const forecastError = record.actualSales > 0 ? record.forecastDemand - record.actualSales : 0;
  const bias = record.actualSales > 0 ? (record.forecastDemand - record.actualSales) / record.actualSales * 100 : 0;
  const mape = record.actualSales > 0 ? Math.abs((record.actualSales - record.forecastDemand) / record.actualSales) * 100 : 0;

  return {
    ...record,
    closingStock,
    replenishmentQty,
    forecastAccuracy,
    stockCoverageDays,
    stockoutRisk,
    forecastError,
    bias,
    mape,
  };
}

/**
 * Calculate aggregate metrics for a set of forecast results
 */
export function calculateAggregateMetrics(results: ForecastResult[]): ForecastMetrics {
  const withActuals = results.filter(r => r.actualSales > 0);
  
  if (withActuals.length === 0) {
    return { accuracy: 0, bias: 0, mape: 0, rmse: 0, trackingSignal: 0 };
  }
  
  const actuals = withActuals.map(r => r.actualSales);
  const forecasts = withActuals.map(r => r.forecastDemand);
  
  const avgAccuracy = withActuals.reduce((sum, r) => sum + r.forecastAccuracy, 0) / withActuals.length;
  
  return {
    accuracy: avgAccuracy,
    bias: calculateBias(actuals, forecasts),
    mape: calculateMAPE(actuals, forecasts),
    rmse: calculateRMSE(actuals, forecasts),
    trackingSignal: calculateTrackingSignal(actuals, forecasts),
  };
}

/**
 * What-if scenario modeling: adjust parameters and recalculate
 */
export function whatIfScenario(
  record: InventoryRecord,
  demandAdjustment: number = 0,
  safetyStockAdjustment: number = 0,
  _leadTimeAdjustment: number = 0
): ForecastResult {
  const adjustedRecord: InventoryRecord = {
    ...record,
    forecastDemand: Math.round(record.forecastDemand * (1 + demandAdjustment / 100)),
    safetyStock: Math.round(record.safetyStock * (1 + safetyStockAdjustment / 100)),
  };
  return processInventoryRecord(adjustedRecord);
}

/**
 * Generate multiple scenarios for comparison
 */
export function generateScenarios(_baseRecord: InventoryRecord): ForecastScenario[] {
  return [
    {
      id: 'optimistic',
      name: 'Optimistic',
      description: 'High demand growth scenario (+20%)',
      demandAdjustment: 20,
      safetyStockAdjustment: 10,
      leadTimeAdjustment: 0,
      confidence: 0.25,
    },
    {
      id: 'baseline',
      name: 'Baseline',
      description: 'Current forecast with no changes',
      demandAdjustment: 0,
      safetyStockAdjustment: 0,
      leadTimeAdjustment: 0,
      confidence: 0.5,
    },
    {
      id: 'pessimistic',
      name: 'Pessimistic',
      description: 'Low demand scenario (-15%)',
      demandAdjustment: -15,
      safetyStockAdjustment: -5,
      leadTimeAdjustment: 0,
      confidence: 0.25,
    },
    {
      id: 'promotional',
      name: 'Promotional',
      description: 'Promotional campaign scenario (+35%)',
      demandAdjustment: 35,
      safetyStockAdjustment: 25,
      leadTimeAdjustment: -10,
      confidence: 0.3,
    },
  ];
}

/**
 * ABC Analysis for inventory classification
 */
export function abcAnalysis(items: { id: string; value: number }[]): {
  a: string[];
  b: string[];
  c: string[];
  thresholds: { a: number; b: number };
} {
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const totalValue = items.reduce((sum, item) => sum + item.value, 0);
  
  let cumulativeValue = 0;
  const a: string[] = [];
  const b: string[] = [];
  const c: string[] = [];
  
  for (const item of sorted) {
    cumulativeValue += item.value;
    const percentage = cumulativeValue / totalValue;
    
    if (percentage <= 0.8) a.push(item.id);
    else if (percentage <= 0.95) b.push(item.id);
    else c.push(item.id);
  }
  
  return {
    a,
    b,
    c,
    thresholds: { a: 0.8, b: 0.95 },
  };
}

/**
 * Calculate economic order quantity (EOQ)
 */
export function calculateEOQ(
  annualDemand: number,
  orderingCost: number,
  holdingCostPerUnit: number
): number {
  if (holdingCostPerUnit <= 0) return 0;
  return Math.round(Math.sqrt((2 * annualDemand * orderingCost) / holdingCostPerUnit));
}

/**
 * Alias: exponentialSmoothingForecast — returns the next single period forecast
 */
export function exponentialSmoothingForecast(historicalSales: number[], alpha: number = 0.3): number {
  return exponentialSmoothing(historicalSales, alpha);
}

/**
 * Alias: linearTrendForecast — wrapper around linearRegressionForecast
 */
export function linearTrendForecast(historicalSales: number[], periodsAhead: number = 1): number {
  return linearRegressionForecast(historicalSales, periodsAhead);
}

/**
 * Ensemble forecast: weighted average of all models
 */
export function ensembleForecast(historicalSales: number[]): number {
  if (historicalSales.length === 0) return 0;
  const ma3v = movingAverageForecast(historicalSales, 3);
  const ma6v = movingAverageForecast(historicalSales, 6);
  const esv  = exponentialSmoothing(historicalSales, 0.3);
  const holt = holtSmoothing(historicalSales, 0.3, 0.1, 1);
  const lin  = linearRegressionForecast(historicalSales, 1);
  // Weights favour more reactive models
  return Math.round((ma3v * 0.25 + ma6v * 0.15 + esv * 0.25 + holt * 0.2 + lin * 0.15));
}

// ─── Future Forecast ─────────────────────────────────────────────────────────

export interface FutureForecast {
  month: string;
  ma3: number;
  ma6: number;
  exponentialSmoothing: number;
  linearTrend: number;
  ensemble: number;
  lowerBound: number;
  upperBound: number;
  replenishmentNeeded: number;
}

/**
 * Generate future forecasts for specific month labels
 * Rolls each method forward period-by-period
 */
export function generateFutureForecast(
  historicalSales: number[],
  futureMonths: string[],
  safetyStock: number,
  lastClosingStock: number,
  periods: number = 3,
): FutureForecast[] {
  const months = futureMonths.slice(0, periods);
  const ma3Data  = [...historicalSales];
  const ma6Data  = [...historicalSales];
  const esData   = [...historicalSales];
  const linData  = [...historicalSales];
  const ensData  = [...historicalSales];

  // Estimate MAE from in-sample errors
  const inSampleErrors = historicalSales.slice(1).map((actual, i) => {
    const sub = historicalSales.slice(0, i + 1);
    return Math.abs(actual - ensembleForecast(sub));
  });
  const mae = inSampleErrors.length > 0 ? inSampleErrors.reduce((a, b) => a + b, 0) / inSampleErrors.length : 200;

  let runningStock = lastClosingStock;

  return months.map((month, i) => {
    const ma3v  = movingAverageForecast(ma3Data, 3);
    const ma6v  = movingAverageForecast(ma6Data, 6);
    const esv   = exponentialSmoothing(esData, 0.3);
    const linv  = Math.max(0, linearRegressionForecast(linData, 1));
    const ens   = Math.round((ma3v * 0.25 + ma6v * 0.15 + esv * 0.25 + holtSmoothing(ensData, 0.3, 0.1, 1) * 0.2 + linv * 0.15));
    const margin = Math.round(mae * (1 + i * 0.2));

    runningStock = Math.max(0, runningStock - ens);
    const replenishmentNeeded = Math.max(0, Math.ceil((ens + safetyStock) - runningStock));
    if (replenishmentNeeded > 0) runningStock += replenishmentNeeded;

    // Roll each series forward
    ma3Data.push(ma3v); ma6Data.push(ma6v); esData.push(esv);
    linData.push(linv); ensData.push(ens);

    return {
      month,
      ma3: ma3v,
      ma6: ma6v,
      exponentialSmoothing: esv,
      linearTrend: linv,
      ensemble: ens,
      lowerBound: Math.max(0, ens - margin),
      upperBound: ens + margin,
      replenishmentNeeded,
    };
  });
}

/**
 * Generate future period forecasts with confidence intervals by rolling the method forward
 */
export function generateFutureForecasts(
  historicalSales: number[],
  futurePeriods: number = 3,
  method: ForecastMethod = 'sma',
  options: Omit<ForecastOptions, 'method'> = {},
): { value: number; lower: number; upper: number }[] {
  if (historicalSales.length === 0) return [];

  // Compute in-sample errors for confidence interval width
  const inSampleErrors: number[] = [];
  for (let i = 1; i < historicalSales.length; i++) {
    const subset = historicalSales.slice(0, i);
    const pred = generateForecast(subset, { method, ...options });
    inSampleErrors.push(Math.abs(historicalSales[i] - pred));
  }
  const mae = inSampleErrors.length > 0 ? inSampleErrors.reduce((a, b) => a + b, 0) / inSampleErrors.length : 0;

  const data = [...historicalSales];
  return Array.from({ length: futurePeriods }, (_, i) => {
    const value = Math.max(0, generateForecast(data, { method, ...options }));
    const margin = Math.round(mae * (1 + i * 0.25)); // widen CI over time
    data.push(value);
    return { value, lower: Math.max(0, value - margin), upper: value + margin };
  });
}

/**
 * Get future month labels starting from a given month string ("Mar 2026" → ["Apr 2026", …])
 */
export function getFutureMonths(lastMonth: string, count: number): string[] {
  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const parts = lastMonth.split(' ');
  let mIdx = MONTH_NAMES.indexOf(parts[0]);
  let year = parseInt(parts[1] ?? '2026', 10);
  if (mIdx === -1) { mIdx = 0; }
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    mIdx++;
    if (mIdx >= 12) { mIdx = 0; year++; }
    result.push(`${MONTH_NAMES[mIdx]} ${year}`);
  }
  return result;
}

/**
 * Calculate reorder point
 */
export function calculateReorderPoint(
  avgDailyDemand: number,
  leadTimeDays: number,
  safetyStock: number
): number {
  return Math.round(avgDailyDemand * leadTimeDays + safetyStock);
}
