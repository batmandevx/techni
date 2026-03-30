// Advanced Forecasting Engine for S&OP
// Implements multiple forecasting algorithms, ABC analysis, and inventory ageing

// ============================================
// Interfaces
// ============================================

export interface InventoryRecord {
  materialId: string;
  month: string;
  openingStock: number;
  stockInTransit: number;
  actualSales: number;
  forecastDemand: number;
  safetyStock: number;
  priceUSD?: number;
  category?: string;
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
  // New fields
  stockCoverageMonths: number;
  avgMonthlySales: number;
  avgMonthlySalesValue: number;
  monthOutOfStock: number;
  monthOutOfStockValue: number;
  abcClassification: 'A' | 'B' | 'C';
  totalStockUnits: number;
  totalStockValue: number;
}

export interface ABCAnalysisResult {
  materialId: string;
  materialName: string;
  totalSalesValue: number;
  salesValueContribution: number;
  cumulativeContribution: number;
  classification: 'A' | 'B' | 'C';
  category: string;
  avgMonthlySales: number;
  avgMonthlySalesValue: number;
  currentStock: number;
  stockValue: number;
  stockCoverageMonths: number;
  isOutOfStock: boolean;
  riskLevel: 'high' | 'medium' | 'low';
  // Additional KPIs
  forecastAccuracy: number;
  stockGapUnits: number;
  stockGapValue: number;
  // Inventory ageing
  inventoryAgeDays: number;
  inventoryAgeStatus: 'good' | 'slow' | 'bad';
  batchDate?: string;
  expiryDate?: string;
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
// Configurable Inventory Ageing Buckets
// Master-driven configuration
// ============================================

export interface InventoryAgeConfig {
  good: { min: number; max: number; label: string; color: string };
  slow: { min: number; max: number; label: string; color: string };
  bad: { min: number; max: number | null; label: string; color: string };
}

// Default configuration (can be overridden via settings)
export const DEFAULT_AGE_CONFIG: InventoryAgeConfig = {
  good: { min: 0, max: 180, label: 'Good', color: '#10b981' }, // 0-6 months
  slow: { min: 180, max: 365, label: 'Slow Moving', color: '#f59e0b' }, // 6-12 months
  bad: { min: 365, max: null, label: 'Bad Inventory', color: '#ef4444' }, // 12+ months
};

// Alternative configurations for different industries
export const AGE_CONFIG_PRESETS: Record<string, InventoryAgeConfig> = {
  default: DEFAULT_AGE_CONFIG,
  fmcg: {
    good: { min: 0, max: 90, label: 'Good', color: '#10b981' }, // 0-3 months
    slow: { min: 90, max: 180, label: 'Slow Moving', color: '#f59e0b' }, // 3-6 months
    bad: { min: 180, max: null, label: 'Bad Inventory', color: '#ef4444' }, // 6+ months
  },
  pharmaceutical: {
    good: { min: 0, max: 365, label: 'Good', color: '#10b981' }, // 0-12 months
    slow: { min: 365, max: 545, label: 'Slow Moving', color: '#f59e0b' }, // 12-18 months
    bad: { min: 545, max: null, label: 'Near Expiry', color: '#ef4444' }, // 18+ months
  },
  electronics: {
    good: { min: 0, max: 365, label: 'Good', color: '#10b981' }, // 0-12 months
    slow: { min: 365, max: 730, label: 'Slow Moving', color: '#f59e0b' }, // 12-24 months
    bad: { min: 730, max: null, label: 'Obsolete', color: '#ef4444' }, // 24+ months
  },
  automotive: {
    good: { min: 0, max: 730, label: 'Good', color: '#10b981' }, // 0-24 months
    slow: { min: 730, max: 1095, label: 'Slow Moving', color: '#f59e0b' }, // 24-36 months
    bad: { min: 1095, max: null, label: 'Obsolete', color: '#ef4444' }, // 36+ months
  },
};

// Current age configuration (can be changed at runtime)
let currentAgeConfig: InventoryAgeConfig = { ...DEFAULT_AGE_CONFIG };

/**
 * Set the inventory age configuration
 */
export function setInventoryAgeConfig(config: InventoryAgeConfig | string): void {
  if (typeof config === 'string') {
    currentAgeConfig = AGE_CONFIG_PRESETS[config] || DEFAULT_AGE_CONFIG;
  } else {
    currentAgeConfig = config;
  }
}

/**
 * Get the current inventory age configuration
 */
export function getInventoryAgeConfig(): InventoryAgeConfig {
  return { ...currentAgeConfig };
}

// ============================================
// Master-driven Inventory Ageing Configuration
// ============================================

export interface InventoryAgeMasterConfig {
  goodMinMonths: number;
  goodMaxMonths: number;
  goodLabel: string;
  goodColor: string;
  slowMinMonths: number;
  slowMaxMonths: number;
  slowLabel: string;
  slowColor: string;
  badMinMonths: number;
  badLabel: string;
  badColor: string;
}

export const DEFAULT_INVENTORY_AGE_MASTER_CONFIG: InventoryAgeMasterConfig = {
  goodMinMonths: 0,
  goodMaxMonths: 6,
  goodLabel: 'Good',
  goodColor: '#10b981',
  slowMinMonths: 6,
  slowMaxMonths: 12,
  slowLabel: 'Slow Moving',
  slowColor: '#f59e0b',
  badMinMonths: 12,
  badLabel: 'Bad Inventory',
  badColor: '#ef4444',
};

let currentAgeMasterConfig: InventoryAgeMasterConfig = { ...DEFAULT_INVENTORY_AGE_MASTER_CONFIG };

// Initialize from localStorage if available
if (typeof window !== 'undefined') {
  try {
    const savedConfig = localStorage.getItem('inventoryAgeConfig');
    if (savedConfig) {
      currentAgeMasterConfig = JSON.parse(savedConfig);
    }
  } catch (e) {
    console.log('Using default inventory age config');
  }
}

export function setInventoryAgeMasterConfig(config: InventoryAgeMasterConfig): void {
  currentAgeMasterConfig = config;
  if (typeof window !== 'undefined') {
    localStorage.setItem('inventoryAgeConfig', JSON.stringify(config));
  }
}

export function getInventoryAgeMasterConfig(): InventoryAgeMasterConfig {
  return { ...currentAgeMasterConfig };
}

// Listen for config changes from other components
export function initInventoryAgeConfigListener(): void {
  if (typeof window !== 'undefined') {
    window.addEventListener('inventory-age-config-changed', (e: Event) => {
      const customEvent = e as CustomEvent<InventoryAgeMasterConfig>;
      currentAgeMasterConfig = customEvent.detail;
    });
  }
}

/**
 * Calculate inventory age status based on age in months using master config
 */
export function calculateInventoryAgeStatus(ageDays: number): 'good' | 'slow' | 'bad' {
  const ageMonths = ageDays / 30;
  if (ageMonths >= currentAgeMasterConfig.badMinMonths) return 'bad';
  if (ageMonths >= currentAgeMasterConfig.slowMinMonths) return 'slow';
  return 'good';
}

/**
 * Get age bucket label and color using master config
 */
export function getAgeBucketInfo(ageDays: number): { label: string; color: string; status: 'good' | 'slow' | 'bad' } {
  const status = calculateInventoryAgeStatus(ageDays);
  const config = currentAgeMasterConfig;
  switch (status) {
    case 'good':
      return { label: config.goodLabel, color: config.goodColor, status };
    case 'slow':
      return { label: config.slowLabel, color: config.slowColor, status };
    case 'bad':
      return { label: config.badLabel, color: config.badColor, status };
  }
}

/**
 * Calculate inventory age in days from batch date
 */
export function calculateInventoryAge(batchDate: string | Date): number {
  const batch = new Date(batchDate);
  const today = new Date();
  const diffTime = today.getTime() - batch.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// ============================================
// Core Inventory Calculations
// ============================================

/**
 * Closing Stock = Opening Stock + Stock in Transit – Actual Sales
 */
export function calculateClosingStock(openingStock: number, stockInTransit: number, actualSales: number): number {
  return Math.max(0, openingStock + stockInTransit - actualSales);
}

/**
 * Total Stock Units = Opening Stock + Stock in Transit
 */
export function calculateTotalStockUnits(openingStock: number, stockInTransit: number): number {
  return openingStock + stockInTransit;
}

/**
 * Total Stock Value = Total Stock Units × Price per Unit
 */
export function calculateTotalStockValue(totalStockUnits: number, priceUSD: number): number {
  return totalStockUnits * priceUSD;
}

/**
 * Average Monthly Sales Units
 */
export function calculateAvgMonthlySales(historicalSales: number[]): number {
  if (historicalSales.length === 0) return 0;
  return Math.round(historicalSales.reduce((a, b) => a + b, 0) / historicalSales.length);
}

/**
 * Average Monthly Sales Value
 */
export function calculateAvgMonthlySalesValue(historicalSales: number[], priceUSD: number): number {
  const avgUnits = calculateAvgMonthlySales(historicalSales);
  return avgUnits * priceUSD;
}

/**
 * Stock Coverage (Months) = Total Stock Units / Avg Monthly Sales Units
 */
export function calculateStockCoverageMonths(totalStockUnits: number, avgMonthlySales: number): number {
  if (avgMonthlySales === 0) return 999;
  return parseFloat((totalStockUnits / avgMonthlySales).toFixed(2));
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
 * Stock Out Gap (Units) = Forecast Units - Available Stock Units
 * Positive value means shortage, negative means surplus
 */
export function calculateStockOutGapUnits(forecastDemand: number, availableStock: number): number {
  return forecastDemand - availableStock;
}

/**
 * Calculate Stock Gap (Units) - shows 0 if excess stock
 * Formula: max(0, Available Stock - Avg Monthly Sales)
 */
export function calculateStockGapUnits(availableStock: number, avgMonthlySales: number): number {
  const gap = availableStock - avgMonthlySales;
  // If available stock exceeds average monthly sales, there's no gap (show 0)
  return Math.max(0, gap);
}

/**
 * Calculate Stock Gap (Value) - shows 0 if excess stock
 * Formula: max(0, (Available Stock - Avg Monthly Sales) × Price)
 */
export function calculateStockGapValue(availableStock: number, avgMonthlySales: number, priceUSD: number): number {
  const gapUnits = calculateStockGapUnits(availableStock, avgMonthlySales);
  return gapUnits * priceUSD;
}

/**
 * Month Out of Stock (Units) = Forecast Units - Available Stock Units
 * Alias for calculateStockOutGapUnits
 */
export function calculateMonthOutOfStock(forecastDemand: number, availableStock: number): number {
  return calculateStockOutGapUnits(forecastDemand, availableStock);
}

/**
 * Month Out of Stock (Value) = Forecast Value - Available Stock Value
 */
export function calculateMonthOutOfStockValue(forecastDemand: number, availableStock: number, priceUSD: number): number {
  // Use the new formula that shows 0 for excess stock
  const gap = availableStock - forecastDemand;
  if (gap >= 0) return 0;
  return gap * priceUSD;
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
  const mad = errors.reduce((a, b) => a + Math.abs(b), 0) / errors.length;
  if (mad === 0) return 0;
  const runningSum = errors.reduce((a, b) => a + b, 0);
  return runningSum / mad;
}

/**
 * Calculate stock coverage in days
 */
export function calculateStockCoverage(closingStock: number, avgDailyDemand: number): number {
  if (avgDailyDemand === 0) return 999;
  return Math.round(closingStock / avgDailyDemand);
}

/**
 * Calculate stockout risk percentage
 */
export function calculateStockoutRisk(closingStock: number, safetyStock: number, forecastDemand: number): number {
  if (closingStock <= 0) return 100;
  if (closingStock <= safetyStock) return 75;
  if (closingStock < forecastDemand) return 50;
  return Math.max(0, (1 - closingStock / (forecastDemand * 1.5)) * 100);
}

/**
 * Calculate statistical safety stock based on service level
 */
export function calculateStatisticalSafetyStock(
  avgDemand: number,
  demandStdDev: number,
  leadTime: number,
  serviceLevel: number = 0.95
): number {
  // Z-score for given service level
  const zScores: Record<number, number> = {
    0.80: 0.84, 0.85: 1.04, 0.90: 1.28, 0.91: 1.34, 0.92: 1.41,
    0.93: 1.48, 0.94: 1.55, 0.95: 1.645, 0.96: 1.75, 0.97: 1.88,
    0.98: 2.05, 0.99: 2.33,
  };
  const z = zScores[Math.round(serviceLevel * 100) / 100] || 1.645;

  // Safety Stock = Z × √(Lead Time) × Standard Deviation of Demand
  return Math.round(z * Math.sqrt(leadTime) * demandStdDev);
}

// ============================================
// ABC Analysis Functions
// ============================================

export interface MaterialForABC {
  id: string;
  description: string;
  priceUSD: number;
  category: string;
  historicalSales: number[];
  historicalForecasts?: number[];
  currentStock: number;
  batchDate?: string;
  expiryDate?: string;
  forecastDemand?: number;
}

/**
 * Perform ABC Analysis on materials based on sales value
 * A = Top 80% of total sales value
 * B = Next 15% of total sales value
 * C = Bottom 5% of total sales value
 */
export function performABCAnalysis(materials: MaterialForABC[]): ABCAnalysisResult[] {
  // Calculate metrics for each material
  const materialsWithMetrics = materials.map(mat => {
    const totalSalesUnits = mat.historicalSales.reduce((a, b) => a + b, 0);
    const totalSalesValue = totalSalesUnits * mat.priceUSD;
    const avgMonthlySales = mat.historicalSales.length > 0
      ? Math.round(totalSalesUnits / mat.historicalSales.length)
      : 0;
    const avgMonthlySalesValue = avgMonthlySales * mat.priceUSD;
    const stockCoverageMonths = calculateStockCoverageMonths(mat.currentStock, avgMonthlySales);

    // Calculate forecast accuracy if we have forecast data
    let forecastAccuracy = 100;
    if (mat.historicalForecasts && mat.historicalForecasts.length > 0) {
      const actuals = mat.historicalSales.filter(s => s > 0);
      const forecasts = mat.historicalForecasts.slice(0, actuals.length);
      if (actuals.length > 0 && forecasts.length > 0) {
        forecastAccuracy = 100 - calculateMAPE(actuals, forecasts);
      }
    }

    // Calculate stock gap using new formula (shows 0 if excess stock)
    const stockGapUnits = calculateStockGapUnits(mat.currentStock, avgMonthlySales);
    const stockGapValue = calculateStockGapValue(mat.currentStock, avgMonthlySales, mat.priceUSD);

    // Calculate stock value
    const stockValue = mat.currentStock * mat.priceUSD;

    // Calculate inventory age
    const inventoryAgeDays = mat.batchDate ? calculateInventoryAge(mat.batchDate) : 0;
    const inventoryAgeStatus = calculateInventoryAgeStatus(inventoryAgeDays);

    return {
      materialId: mat.id,
      materialName: mat.description,
      totalSalesValue,
      salesValueContribution: 0, // Will be calculated
      cumulativeContribution: 0, // Will be calculated
      classification: 'C' as 'A' | 'B' | 'C',
      category: mat.category,
      avgMonthlySales,
      avgMonthlySalesValue,
      currentStock: mat.currentStock,
      stockValue,
      stockCoverageMonths,
      isOutOfStock: mat.currentStock <= 0,
      riskLevel: (stockCoverageMonths < 1 ? 'high' : stockCoverageMonths < 2 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
      forecastAccuracy,
      stockGapUnits,
      stockGapValue,
      inventoryAgeDays,
      inventoryAgeStatus,
      batchDate: mat.batchDate,
      expiryDate: mat.expiryDate,
    };
  });

  // Sort by total sales value (descending)
  materialsWithMetrics.sort((a, b) => b.totalSalesValue - a.totalSalesValue);

  // Calculate total sales value across all materials
  const grandTotalSalesValue = materialsWithMetrics.reduce((sum, m) => sum + m.totalSalesValue, 0);

  // Calculate contribution percentages and classify
  let cumulativeValue = 0;
  const results: ABCAnalysisResult[] = materialsWithMetrics.map(mat => {
    cumulativeValue += mat.totalSalesValue;
    const contribution = grandTotalSalesValue > 0 ? (mat.totalSalesValue / grandTotalSalesValue) * 100 : 0;
    const cumulative = grandTotalSalesValue > 0 ? (cumulativeValue / grandTotalSalesValue) * 100 : 0;

    // Classify based on cumulative contribution
    let classification: 'A' | 'B' | 'C' = 'C';
    if (cumulative <= 80) {
      classification = 'A';
    } else if (cumulative <= 95) {
      classification = 'B';
    } else {
      classification = 'C';
    }

    return {
      ...mat,
      salesValueContribution: parseFloat(contribution.toFixed(2)),
      cumulativeContribution: parseFloat(cumulative.toFixed(2)),
      classification,
    };
  });

  return results;
}

export interface ABCSummary {
  a: { count: number; totalValue: number; outOfStock: number; atRisk: number; avgCoverage: number; };
  b: { count: number; totalValue: number; outOfStock: number; atRisk: number; avgCoverage: number; };
  c: { count: number; totalValue: number; outOfStock: number; atRisk: number; avgCoverage: number; };
  lowCoverage: { count: number; items: Array<{ sku: string; name: string; category: string; coverage: number }> };
}

/**
 * Get ABC summary statistics
 */
export function getABCSummary(abcResults: ABCAnalysisResult[]): ABCSummary {
  const aItems = abcResults.filter(r => r.classification === 'A');
  const bItems = abcResults.filter(r => r.classification === 'B');
  const cItems = abcResults.filter(r => r.classification === 'C');

  const lowCoverageItems = abcResults
    .filter(r => r.stockCoverageMonths < 1)
    .map(r => ({
      sku: r.materialId,
      name: r.materialName,
      category: r.category,
      coverage: r.stockCoverageMonths,
    }));

  return {
    a: {
      count: aItems.length,
      totalValue: aItems.reduce((sum, r) => sum + r.totalSalesValue, 0),
      outOfStock: aItems.filter(r => r.isOutOfStock).length,
      atRisk: aItems.filter(r => !r.isOutOfStock && r.stockCoverageMonths < 1).length,
      avgCoverage: aItems.length > 0 ? aItems.reduce((sum, r) => sum + r.stockCoverageMonths, 0) / aItems.length : 0,
    },
    b: {
      count: bItems.length,
      totalValue: bItems.reduce((sum, r) => sum + r.totalSalesValue, 0),
      outOfStock: bItems.filter(r => r.isOutOfStock).length,
      atRisk: bItems.filter(r => !r.isOutOfStock && r.stockCoverageMonths < 1).length,
      avgCoverage: bItems.length > 0 ? bItems.reduce((sum, r) => sum + r.stockCoverageMonths, 0) / bItems.length : 0,
    },
    c: {
      count: cItems.length,
      totalValue: cItems.reduce((sum, r) => sum + r.totalSalesValue, 0),
      outOfStock: cItems.filter(r => r.isOutOfStock).length,
      atRisk: cItems.filter(r => !r.isOutOfStock && r.stockCoverageMonths < 1).length,
      avgCoverage: cItems.length > 0 ? cItems.reduce((sum, r) => sum + r.stockCoverageMonths, 0) / cItems.length : 0,
    },
    lowCoverage: {
      count: lowCoverageItems.length,
      items: lowCoverageItems,
    },
  };
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
export function processInventoryRecord(
  record: InventoryRecord,
  historicalSales: number[] = []
): ForecastResult {
  const closingStock = calculateClosingStock(record.openingStock, record.stockInTransit, record.actualSales);
  const replenishmentQty = calculateReplenishment(record.forecastDemand, record.safetyStock, closingStock);
  const forecastAccuracy = calculateForecastAccuracy(record.actualSales, record.forecastDemand);
  const avgDailyDemand = (record.actualSales || record.forecastDemand) / 30;
  const stockCoverageDays = calculateStockCoverage(closingStock, avgDailyDemand);
  const stockoutRisk = calculateStockoutRisk(closingStock, record.safetyStock, record.forecastDemand);

  // Calculate new metrics
  const totalStockUnits = calculateTotalStockUnits(record.openingStock, record.stockInTransit);
  const totalStockValue = calculateTotalStockValue(totalStockUnits, record.priceUSD || 0);
  const avgMonthlySales = calculateAvgMonthlySales(historicalSales.length > 0 ? historicalSales : [record.actualSales || record.forecastDemand]);
  const avgMonthlySalesValue = calculateAvgMonthlySalesValue(
    historicalSales.length > 0 ? historicalSales : [record.actualSales || record.forecastDemand],
    record.priceUSD || 0
  );
  const stockCoverageMonths = calculateStockCoverageMonths(totalStockUnits, avgMonthlySales);
  const monthOutOfStock = calculateMonthOutOfStock(record.forecastDemand, totalStockUnits);
  const monthOutOfStockValue = calculateMonthOutOfStockValue(record.forecastDemand, totalStockUnits, record.priceUSD || 0);

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
    // New fields
    stockCoverageMonths,
    avgMonthlySales,
    avgMonthlySalesValue,
    monthOutOfStock,
    monthOutOfStockValue,
    abcClassification: 'C', // Will be set by ABC analysis
    totalStockUnits,
    totalStockValue,
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
  leadTimeAdjustment: number = 0,
  historicalSales: number[] = []
): ForecastResult {
  const adjustedRecord: InventoryRecord = {
    ...record,
    forecastDemand: Math.round(record.forecastDemand * (1 + demandAdjustment / 100)),
    safetyStock: Math.round(record.safetyStock * (1 + safetyStockAdjustment / 100)),
  };
  return processInventoryRecord(adjustedRecord, historicalSales);
}

/**
 * Generate multiple scenarios for comparison
 */
export function generateScenarios(baseRecord: InventoryRecord, historicalSales: number[] = []): ForecastScenario[] {
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
 * Calculate reorder point
 */
export function calculateReorderPoint(
  avgDailyDemand: number,
  leadTimeDays: number,
  safetyStock: number
): number {
  return Math.round(avgDailyDemand * leadTimeDays + safetyStock);
}
