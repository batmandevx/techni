// Tenchi S&OP - Upload Data Store
// Parses uploaded Excel data and persists it to localStorage for use across pages

const STORAGE_KEY = 'tenchi_sop_upload_v2';

export interface ParsedMaterial {
  id: string;
  description: string;
  category: string;
  monthlySales: number[];
  monthNames: string[];
  totalSales: number;
  avgMonthlySales: number;
  currentStock: number;
  price: number;
}

export interface MonthlyTrend {
  month: string;
  actual: number;
  forecast: number;
  orders: number;
}

export interface CategoryData {
  name: string;
  value: number;
}

export interface UploadedData {
  fileName: string;
  uploadedAt: string;
  totalRows: number;
  detectedFormat: string;
  headers: string[];
  materials: ParsedMaterial[];
  monthlyTrend: MonthlyTrend[];
  topCategories: CategoryData[];
  abcDistribution: CategoryData[];
  performanceData: { name: string; actual: number; target: number }[];
  radarData: { subject: string; [key: string]: any }[];
  radarKeys: string[];
  kpis: {
    totalSKUs: number;
    totalRevenue: number;
    avgCoverage: number;
    forecastAccuracy: number;
    totalOrders: number;
  };
}

const MONTH_PATTERNS = [/^jan/i,/^feb/i,/^mar/i,/^apr/i,/^may/i,/^jun/i,/^jul/i,/^aug/i,/^sep/i,/^oct/i,/^nov/i,/^dec/i];
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function isMonthCol(h: string) { return MONTH_PATTERNS.some(p => p.test(h.trim())); }
function isMaterialCol(h: string) { return /material|sku|product\s*no|item\s*code|article|mat_no|mat no/i.test(h); }
function isDescriptionCol(h: string) { return /description|product\s*name|item\s*name|desc\b/i.test(h); }
function isCategoryCol(h: string) { return /category|group|class|type|segment|brand/i.test(h); }
function isPriceCol(h: string) { return /\bprice\b|\brate\b|unit.?price|usd|unit.?value/i.test(h); }
function isQtyCol(h: string) { return /\bqty\b|quantity|units\s*sold|actual\s*sales|\bsales\b|\bsold\b|\bdemand\b/i.test(h) && !/forecast|plan/i.test(h); }
function isForecastCol(h: string) { return /forecast|planned|target\s*demand/i.test(h); }
function isStockCol(h: string) { return /opening|closing|on.?hand|inventory|balance/i.test(h); }
function isDateCol(h: string) { return /\bdate\b|\bmonth\b|\bperiod\b|\bweek\b/i.test(h) && !isMonthCol(h); }

function toNum(v: any): number {
  if (v === null || v === undefined || v === '') return 0;
  const n = parseFloat(String(v).replace(/[^0-9.-]/g, ''));
  return isNaN(n) ? 0 : n;
}

function normalizeMonth(col: string): string {
  for (let i = 0; i < MONTH_PATTERNS.length; i++) {
    if (MONTH_PATTERNS[i].test(col.trim())) {
      return col.trim();
    }
  }
  return col.trim();
}

function detectFormat(headers: string[], rows: any[]): 'pivot' | 'flat' | 'stock' {
  const monthCols = headers.filter(isMonthCol);
  if (monthCols.length >= 2) return 'pivot';
  const hasStock = headers.some(h => /opening|purchase|primary/i.test(h));
  if (hasStock) return 'stock';
  return 'flat';
}

function parsePivot(headers: string[], rows: any[]) {
  const monthCols = headers.filter(isMonthCol);
  const actualMonthCols = monthCols.filter(h => !isForecastCol(h));
  const forecastMonthCols = monthCols.filter(isForecastCol);

  const matCol = headers.find(isMaterialCol) || headers[0];
  const descCol = headers.find(isDescriptionCol);
  const catCol = headers.find(isCategoryCol);
  const priceCol = headers.find(isPriceCol);

  const materials: ParsedMaterial[] = [];
  const categoryMap: Record<string, number> = {};

  for (const row of rows) {
    const id = String(row[matCol] || '').trim();
    if (!id || id.toLowerCase() === 'total') continue;
    const monthlySales = actualMonthCols.map(c => toNum(row[c]));
    const totalSales = monthlySales.reduce((a, b) => a + b, 0);
    const avgMonthlySales = actualMonthCols.length > 0 ? totalSales / actualMonthCols.length : 0;
    const price = priceCol ? toNum(row[priceCol]) : 1;
    const category = catCol ? String(row[catCol] || 'Other').trim() : 'General';
    const description = descCol ? String(row[descCol] || id).trim() : id;
    const stockCol = headers.find(isStockCol);
    const currentStock = stockCol ? toNum(row[stockCol]) : 0;

    materials.push({ id, description, category, monthlySales, monthNames: actualMonthCols.map(normalizeMonth), totalSales, avgMonthlySales, currentStock, price });
    categoryMap[category] = (categoryMap[category] || 0) + totalSales;
  }

  const monthlyTrend: MonthlyTrend[] = actualMonthCols.map((col, i) => {
    const actual = materials.reduce((sum, m) => sum + (m.monthlySales[i] || 0), 0);
    let forecast = actual * 1.05;
    if (forecastMonthCols.length > i) {
      forecast = rows.reduce((sum, r) => sum + toNum(r[forecastMonthCols[i]]), 0);
    }
    return { month: normalizeMonth(col), actual, forecast, orders: Math.round(actual / 50) };
  });

  const topCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  return { materials, monthlyTrend, topCategories };
}

function parseFlat(headers: string[], rows: any[]) {
  const matCol = headers.find(isMaterialCol) || headers[0];
  const descCol = headers.find(isDescriptionCol);
  const catCol = headers.find(isCategoryCol);
  const qtyCol = headers.find(isQtyCol);
  const priceCol = headers.find(isPriceCol);
  const dateCol = headers.find(isDateCol) || headers.find(isMonthCol);

  const matMap: Record<string, { totalSales: number; revenue: number; category: string; description: string; price: number }> = {};
  const monthMap: Record<string, { actual: number; revenue: number; orders: number }> = {};

  for (const row of rows) {
    const id = String(row[matCol] || '').trim();
    if (!id) continue;
    const qty = qtyCol ? toNum(row[qtyCol]) : 1;
    const price = priceCol ? toNum(row[priceCol]) : 0;
    const revenue = qty * price;
    const category = catCol ? String(row[catCol] || 'Other') : 'General';
    const description = descCol ? String(row[descCol] || id) : id;

    if (!matMap[id]) matMap[id] = { totalSales: 0, revenue: 0, category, description, price };
    matMap[id].totalSales += qty;
    matMap[id].revenue += revenue;

    const rawDate = dateCol ? String(row[dateCol] || '') : '';
    let monthKey = 'Other';
    if (rawDate) {
      for (let i = 0; i < MONTH_LABELS.length; i++) {
        if (new RegExp(MONTH_LABELS[i], 'i').test(rawDate)) { monthKey = MONTH_LABELS[i]; break; }
      }
      if (monthKey === 'Other') {
        try { const d = new Date(rawDate); if (!isNaN(d.getTime())) monthKey = MONTH_LABELS[d.getMonth()]; } catch {}
      }
    }
    if (!monthMap[monthKey]) monthMap[monthKey] = { actual: 0, revenue: 0, orders: 0 };
    monthMap[monthKey].actual += qty;
    monthMap[monthKey].revenue += revenue;
    monthMap[monthKey].orders += 1;
  }

  const numMonths = Math.max(Object.keys(monthMap).length, 1);
  const materials: ParsedMaterial[] = Object.entries(matMap).map(([id, d]) => ({
    id, description: d.description, category: d.category,
    monthlySales: [], monthNames: [],
    totalSales: d.totalSales, avgMonthlySales: d.totalSales / numMonths,
    currentStock: 0, price: d.price,
  }));

  const monthlyTrend: MonthlyTrend[] = Object.entries(monthMap).map(([month, d]) => ({
    month, actual: d.actual, forecast: Math.round(d.actual * 1.08), orders: d.orders,
  }));

  const categoryMap: Record<string, number> = {};
  Object.values(matMap).forEach(m => { categoryMap[m.category] = (categoryMap[m.category] || 0) + m.totalSales; });
  const topCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));

  return { materials, monthlyTrend, topCategories };
}

function parseStock(headers: string[], rows: any[]) {
  const matCol = headers.find(isMaterialCol) || headers[0];
  const descCol = headers.find(isDescriptionCol);
  const catCol = headers.find(isCategoryCol);
  const priceCol = headers.find(isPriceCol);
  const openingCol = headers.find(h => /opening/i.test(h));
  const primaryCol = headers.find(h => /primary|actual.?sales/i.test(h));
  const forecastCol = headers.find(h => /forecast|planned/i.test(h));

  const materials: ParsedMaterial[] = [];
  const categoryMap: Record<string, number> = {};

  for (const row of rows) {
    const id = String(row[matCol] || '').trim();
    if (!id || id.toLowerCase() === 'total') continue;
    const actualSales = primaryCol ? toNum(row[primaryCol]) : 0;
    const price = priceCol ? toNum(row[priceCol]) : 1;
    const category = catCol ? String(row[catCol] || 'Other').trim() : 'General';
    const description = descCol ? String(row[descCol] || id).trim() : id;
    const currentStock = openingCol ? toNum(row[openingCol]) : 0;

    materials.push({ id, description, category, monthlySales: [actualSales], monthNames: ['Current'], totalSales: actualSales, avgMonthlySales: actualSales, currentStock, price });
    categoryMap[category] = (categoryMap[category] || 0) + actualSales;
  }

  const topCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));
  return { materials, monthlyTrend: [] as MonthlyTrend[], topCategories };
}

function computeABC(materials: ParsedMaterial[]): CategoryData[] {
  const sorted = [...materials].map(m => ({ ...m, rev: m.totalSales * Math.max(m.price, 1) })).sort((a, b) => b.rev - a.rev);
  const totalRev = sorted.reduce((s, m) => s + m.rev, 0);
  let cum = 0, a = 0, b = 0;
  for (const m of sorted) {
    cum += totalRev > 0 ? (m.rev / totalRev) * 100 : 0;
    if (cum <= 80) a++; else if (cum <= 95) b++;
  }
  const c = Math.max(0, sorted.length - a - b);
  return [{ name: 'Class A', value: Math.max(a, sorted.length > 0 ? 1 : 0) }, { name: 'Class B', value: b }, { name: 'Class C', value: c }].filter(d => d.value > 0);
}

function computeRadar(materials: ParsedMaterial[]): { data: { subject: string; [key: string]: any }[], keys: string[] } {
  const top5 = [...materials].sort((a, b) => b.totalSales - a.totalSales).slice(0, 5);
  if (top5.length === 0) return { data: [], keys: [] };

  const maxSales = Math.max(...top5.map(m => m.totalSales), 1);
  const maxRev = Math.max(...top5.map(m => m.totalSales * Math.max(m.price, 1)), 1);
  const maxStock = Math.max(...top5.map(m => m.currentStock), 1);

  const keys = top5.map(m => m.id.length > 10 ? m.id.slice(0, 10) : m.id);
  const subjects = ['Sales Vol.', 'Revenue', 'Avg/Month', 'Stock', 'Coverage'];

  const data = subjects.map(subject => {
    const entry: any = { subject };
    top5.forEach((m, i) => {
      const key = keys[i];
      const coverage = m.avgMonthlySales > 0 ? (m.currentStock / m.avgMonthlySales) * 100 : 0;
      if (subject === 'Sales Vol.') entry[key] = Math.round((m.totalSales / maxSales) * 100);
      else if (subject === 'Revenue') entry[key] = Math.round((m.totalSales * Math.max(m.price, 1) / maxRev) * 100);
      else if (subject === 'Avg/Month') entry[key] = Math.round((m.avgMonthlySales / maxSales) * 100);
      else if (subject === 'Stock') entry[key] = Math.round((m.currentStock / maxStock) * 100);
      else if (subject === 'Coverage') entry[key] = Math.min(100, Math.round(coverage));
    });
    return entry;
  });

  return { data, keys };
}

export function parseAndStoreUploadedData(fileName: string, headers: string[], rows: any[], detectedFormat: string): UploadedData {
  const fmt = detectFormat(headers, rows);
  let parsed: { materials: ParsedMaterial[]; monthlyTrend: MonthlyTrend[]; topCategories: CategoryData[] };
  if (fmt === 'pivot') parsed = parsePivot(headers, rows);
  else if (fmt === 'stock') parsed = parseStock(headers, rows);
  else parsed = parseFlat(headers, rows);

  const { materials, monthlyTrend, topCategories } = parsed;
  const abcDistribution = computeABC(materials);
  const { data: radarData, keys: radarKeys } = computeRadar(materials);
  const performanceData = monthlyTrend.slice(0, 8).map(m => ({ name: m.month, actual: m.actual, target: m.forecast }));

  const totalRevenue = materials.reduce((s, m) => s + m.totalSales * Math.max(m.price, 1), 0);
  const totalOrders = monthlyTrend.reduce((s, m) => s + m.orders, 0) || rows.length;
  const coverages = materials.filter(m => m.avgMonthlySales > 0).map(m => m.currentStock / m.avgMonthlySales);
  const avgCoverage = coverages.length > 0 ? coverages.reduce((a, b) => a + b, 0) / coverages.length : 0;
  const monthsWithBoth = monthlyTrend.filter(m => m.actual > 0 && m.forecast > 0);
  const forecastAccuracy = monthsWithBoth.length > 0
    ? Math.min(100, Math.max(0, monthsWithBoth.reduce((s, m) => s + (1 - Math.abs(m.actual - m.forecast) / m.actual), 0) / monthsWithBoth.length * 100))
    : 0;

  const data: UploadedData = {
    fileName, uploadedAt: new Date().toISOString(), totalRows: rows.length, detectedFormat: fmt, headers,
    materials, monthlyTrend, topCategories, abcDistribution, performanceData, radarData, radarKeys,
    kpis: { totalSKUs: materials.length, totalRevenue, avgCoverage, forecastAccuracy, totalOrders },
  };

  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  return data;
}

export function getUploadedData(): UploadedData | null {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}

export function clearUploadedData(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}
