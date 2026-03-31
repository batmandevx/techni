/**
 * Real Data Analyzer - Extracts actual metrics from uploaded Excel data
 * No random values - only real calculations from the data
 */

export interface AnalyzedData {
  // Basic stats
  totalRows: number;
  totalColumns: number;
  columnNames: string[];
  
  // Financial metrics (calculated from actual data)
  totalRevenue: number;
  totalQuantity: number;
  averageOrderValue: number;
  
  // Counts
  totalOrders: number;
  uniqueCustomers: number;
  uniqueProducts: number;
  uniqueCategories: number;
  uniqueRegions: number;
  
  // Detected columns
  revenueColumn: string | null;
  quantityColumn: string | null;
  productColumn: string | null;
  customerColumn: string | null;
  categoryColumn: string | null;
  regionColumn: string | null;
  dateColumn: string | null;
  priceColumn: string | null;
  
  // Breakdowns
  revenueByCategory: { name: string; value: number; percentage: number }[];
  revenueByRegion: { region: string; sales: number; orders: number; customers: number }[];
  topProducts: { name: string; sales: number; quantity: number }[];
  topCustomers: { name: string; sales: number; orders: number }[];
  monthlyRevenue: { month: string; revenue: number; orders: number }[];
  
  // ABC Classification (based on actual data)
  abcClassification: { name: string; value: number; percentage: number }[];
  
  // Inventory value (if inventory data present)
  inventoryValue: number;
  
  // Forecast accuracy (if forecast vs actual columns present)
  forecastAccuracy: number | null;
  
  // Data source info
  fileName: string;
  sheetName?: string;
  uploadedAt: string;
}

/**
 * Find column by possible name patterns - enhanced matching
 */
function findColumn(headers: string[], patterns: string[]): string | null {
  const found = headers.find(h => {
    const headerLower = h.toLowerCase().replace(/[_\s-]/g, '');
    return patterns.some(p => {
      const patternLower = p.toLowerCase().replace(/[_\s-]/g, '');
      return headerLower.includes(patternLower) || 
             patternLower.includes(headerLower) ||
             // Fuzzy match for common abbreviations
             (p === 'qty' && (headerLower.includes('qty') || headerLower.includes('quantity'))) ||
             (p === 'id' && headerLower.endsWith('id')) ||
             (p === 'amount' && headerLower.includes('amount'));
    });
  });
  return found || null;
}

/**
 * Parse numeric value from cell - handles various formats
 */
function parseNumber(value: any): number {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Remove currency symbols, commas, and spaces
    const cleaned = value.replace(/[$,€£₹\s]/g, '').replace(/\((\d+)\)/g, '-$1'); // Handle negative numbers in parentheses
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

/**
 * Parse date value - handles Excel serial numbers
 */
function parseDate(value: any): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    // Try parsing as date string
    const date = new Date(value);
    if (!isNaN(date.getTime())) return date;
    
    // Try DD/MM/YYYY format
    const parts = value.split(/[/-]/);
    if (parts.length === 3) {
      const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      if (!isNaN(d.getTime())) return d;
    }
  }
  if (typeof value === 'number') {
    // Excel date serial number (days since 1900-01-01, with 1900 leap year bug)
    const date = new Date((value - 25569) * 86400 * 1000);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
}

/**
 * Format month key from date
 */
function getMonthKey(date: Date): string {
  return date.toLocaleString('default', { month: 'short', year: 'numeric' });
}

/**
 * Detect if data looks like order data
 */
function detectDataType(headers: string[]): 'orders' | 'customers' | 'products' | 'inventory' | 'unknown' {
  const headerStr = headers.join(' ').toLowerCase();
  
  if (headerStr.includes('order') && (headerStr.includes('customer') || headerStr.includes('quantity'))) {
    return 'orders';
  }
  if (headerStr.includes('customer') && headerStr.includes('payment')) {
    return 'customers';
  }
  if (headerStr.includes('material') && headerStr.includes('price')) {
    return 'products';
  }
  if (headerStr.includes('stock') || headerStr.includes('inventory') || headerStr.includes('opening')) {
    return 'inventory';
  }
  return 'unknown';
}

/**
 * Build lookup maps for relational data
 */
function buildLookupMaps(allData: { headers: string[]; rows: any[] }[]): {
  customerMap: Map<string, any>;
  productMap: Map<string, { price: number; name: string }>;
} {
  const customerMap = new Map<string, any>();
  const productMap = new Map<string, { price: number; name: string }>();
  
  for (const data of allData) {
    const dataType = detectDataType(data.headers);
    
    if (dataType === 'customers') {
      const idCol = findColumn(data.headers, ['customer_id', 'customerid', 'id', 'customer_code']);
      const nameCol = findColumn(data.headers, ['customer_name', 'name', 'customer']);
      const countryCol = findColumn(data.headers, ['country', 'region']);
      const cityCol = findColumn(data.headers, ['city', 'ship_to_city']);
      
      if (idCol) {
        for (const row of data.rows) {
          const id = String(row[idCol] || '').trim();
          if (id) {
            customerMap.set(id, {
              name: nameCol ? row[nameCol] : id,
              country: countryCol ? row[countryCol] : 'Unknown',
              city: cityCol ? row[cityCol] : 'Unknown'
            });
          }
        }
      }
    }
    
    if (dataType === 'products') {
      const idCol = findColumn(data.headers, ['material_id', 'product_id', 'sku', 'id', 'item_code']);
      const nameCol = findColumn(data.headers, ['material_description', 'product_name', 'description', 'name']);
      const priceCol = findColumn(data.headers, ['price', 'unit_price', 'rate', 'amount', 'cost']);
      
      if (idCol) {
        for (const row of data.rows) {
          const id = String(row[idCol] || '').trim();
          if (id) {
            productMap.set(id, {
              price: priceCol ? parseNumber(row[priceCol]) : 0,
              name: nameCol ? String(row[nameCol]) : id
            });
          }
        }
      }
    }
  }
  
  return { customerMap, productMap };
}

/**
 * Analyze uploaded data and extract real metrics
 */
export function analyzeData(
  headers: string[], 
  rows: any[],
  fileName: string = 'Unknown',
  allSheets?: { headers: string[]; rows: any[]; sheetName: string }[]
): AnalyzedData {
  // Detect columns with enhanced patterns
  const revenueColumn = findColumn(headers, ['revenue', 'sales', 'amount', 'total', 'value', 'net', 'gross', 'total_amount', 'line_total']);
  const quantityColumn = findColumn(headers, ['quantity', 'qty', 'count', 'units', 'volume', 'pcs', 'order_qty']);
  const productColumn = findColumn(headers, ['product', 'item', 'sku', 'material', 'material_id', 'materialid', 'product_id', 'productid']);
  const customerColumn = findColumn(headers, ['customer', 'client', 'buyer', 'account', 'party', 'dealer', 'customer_id', 'customerid']);
  const categoryColumn = findColumn(headers, ['category', 'type', 'group', 'class', 'segment', 'division', 'product_type']);
  const regionColumn = findColumn(headers, ['region', 'area', 'zone', 'territory', 'country', 'state', 'city']);
  const dateColumn = findColumn(headers, ['date', 'time', 'month', 'year', 'period', 'day', 'order_date', 'delivery_date']);
  const forecastColumn = findColumn(headers, ['forecast', 'predicted', 'projection', 'estimate', 'planned']);
  const actualColumn = findColumn(headers, ['actual', 'real', 'achieved', 'delivered', 'sold']);
  const inventoryColumn = findColumn(headers, ['inventory', 'stock', 'onhand', 'on hand', 'available', 'closing']);
  const priceColumn = findColumn(headers, ['price', 'unit_price', 'rate', 'unit_cost', 'price_usd']);
  const orderIdColumn = findColumn(headers, ['order_id', 'orderid', 'so', 'sales_order', 'invoice', 'invoice_no']);

  // Build lookup maps if we have multiple sheets
  const { customerMap, productMap } = allSheets ? buildLookupMaps(allSheets.map(s => ({ headers: s.headers, rows: s.rows }))) : 
                                               { customerMap: new Map(), productMap: new Map() };

  // Calculate totals
  let totalRevenue = 0;
  let totalQuantity = 0;
  let inventoryValue = 0;
  
  const customers = new Set<string>();
  const products = new Set<string>();
  const categories = new Set<string>();
  const regions = new Set<string>();
  const orderIds = new Set<string>();
  
  // For breakdowns
  const categoryRevenue = new Map<string, number>();
  const regionStats = new Map<string, { revenue: number; orders: number; customers: Set<string> }>();
  const productStats = new Map<string, { sales: number; quantity: number }>();
  const customerStats = new Map<string, { sales: number; orders: number }>();
  const monthlyStats = new Map<string, { revenue: number; orders: number }>();
  
  // For forecast accuracy
  let forecastSum = 0;
  let actualSum = 0;
  let accuracyCount = 0;

  rows.forEach((row, index) => {
    // Get product and customer info from lookups
    const prodId = productColumn ? String(row[productColumn] || '').trim() : '';
    const custId = customerColumn ? String(row[customerColumn] || '').trim() : '';
    const productInfo = productMap.get(prodId);
    const customerInfo = customerMap.get(custId);
    
    // Calculate revenue
    let rowRevenue = 0;
    if (revenueColumn) {
      rowRevenue = parseNumber(row[revenueColumn]);
    } else if (quantityColumn && productInfo?.price) {
      // Calculate revenue from quantity * price from master data
      const qty = parseNumber(row[quantityColumn]);
      rowRevenue = qty * productInfo.price;
    } else if (quantityColumn && priceColumn) {
      // Calculate revenue from quantity * price in row
      const qty = parseNumber(row[quantityColumn]);
      const price = parseNumber(row[priceColumn]);
      rowRevenue = qty * price;
    }
    totalRevenue += rowRevenue;
    
    // Quantity
    if (quantityColumn) {
      totalQuantity += parseNumber(row[quantityColumn]);
    }
    
    // Inventory value
    if (inventoryColumn) {
      inventoryValue += parseNumber(row[inventoryColumn]);
    }
    
    // Unique counts
    if (customerColumn && row[customerColumn]) {
      customers.add(String(row[customerColumn]));
    }
    if (productColumn && row[productColumn]) {
      products.add(String(row[productColumn]));
    }
    if (categoryColumn && row[categoryColumn]) {
      categories.add(String(row[categoryColumn]));
    }
    if (regionColumn && row[regionColumn]) {
      regions.add(String(row[regionColumn]));
    } else if (customerInfo?.country) {
      regions.add(customerInfo.country);
    }
    if (orderIdColumn && row[orderIdColumn]) {
      orderIds.add(String(row[orderIdColumn]));
    }
    
    // Category breakdown
    const cat = categoryColumn ? String(row[categoryColumn] || 'Unknown') : 'General';
    categoryRevenue.set(cat, (categoryRevenue.get(cat) || 0) + rowRevenue);
    
    // Region breakdown
    const reg = regionColumn ? String(row[regionColumn] || 'Unknown') : 
                customerInfo?.country || 'Unknown';
    const existing = regionStats.get(reg) || { revenue: 0, orders: 0, customers: new Set() };
    existing.revenue += rowRevenue;
    existing.orders += 1;
    if (customerColumn && row[customerColumn]) {
      existing.customers.add(String(row[customerColumn]));
    }
    regionStats.set(reg, existing);
    
    // Product stats
    const prod = productColumn ? String(row[productColumn] || 'Unknown') : 
                 (productInfo?.name || 'Unknown');
    const qty = quantityColumn ? parseNumber(row[quantityColumn]) : 0;
    const prodExisting = productStats.get(prod) || { sales: 0, quantity: 0 };
    prodExisting.sales += rowRevenue;
    prodExisting.quantity += qty;
    productStats.set(prod, prodExisting);
    
    // Customer stats
    const cust = customerColumn ? String(row[customerColumn] || 'Unknown') :
                 (customerInfo?.name || 'Unknown');
    const custExisting = customerStats.get(cust) || { sales: 0, orders: 0 };
    custExisting.sales += rowRevenue;
    custExisting.orders += 1;
    customerStats.set(cust, custExisting);
    
    // Monthly stats
    if (dateColumn) {
      const date = parseDate(row[dateColumn]);
      if (date) {
        const monthKey = getMonthKey(date);
        const monthExisting = monthlyStats.get(monthKey) || { revenue: 0, orders: 0 };
        monthExisting.revenue += rowRevenue;
        monthExisting.orders += 1;
        monthlyStats.set(monthKey, monthExisting);
      }
    }
    
    // Forecast accuracy
    if (forecastColumn && actualColumn) {
      const forecast = parseNumber(row[forecastColumn]);
      const actual = parseNumber(row[actualColumn]);
      if (forecast > 0 && actual > 0) {
        forecastSum += forecast;
        actualSum += actual;
        accuracyCount++;
      }
    }
  });

  // Calculate ABC Classification based on actual product revenue
  const sortedProducts = Array.from(productStats.entries())
    .sort((a, b) => b[1].sales - a[1].sales);
  
  const totalProductRevenue = sortedProducts.reduce((sum, [, stats]) => sum + stats.sales, 0);
  let cumulativeRevenue = 0;
  let aCount = 0, bCount = 0, cCount = 0;
  
  sortedProducts.forEach(([, stats]) => {
    cumulativeRevenue += stats.sales;
    const pct = totalProductRevenue > 0 ? cumulativeRevenue / totalProductRevenue : 0;
    if (pct <= 0.8) aCount++;
    else if (pct <= 0.95) bCount++;
    else cCount++;
  });
  
  const totalProducts = sortedProducts.length || 1;
  const abcClassification = [
    { name: 'Class A (Top 80%)', value: aCount, percentage: Math.round((aCount / totalProducts) * 100) },
    { name: 'Class B (Next 15%)', value: bCount, percentage: Math.round((bCount / totalProducts) * 100) },
    { name: 'Class C (Bottom 5%)', value: cCount, percentage: Math.round((cCount / totalProducts) * 100) }
  ];

  // Calculate forecast accuracy
  let forecastAccuracy: number | null = null;
  if (accuracyCount > 0 && forecastSum > 0) {
    forecastAccuracy = Math.round((1 - Math.abs(forecastSum - actualSum) / forecastSum) * 100);
  }

  // Sort monthly data chronologically
  const sortedMonths = Array.from(monthlyStats.entries())
    .sort((a, b) => {
      const dateA = new Date(a[0]);
      const dateB = new Date(b[0]);
      return dateA.getTime() - dateB.getTime();
    });

  return {
    totalRows: rows.length,
    totalColumns: headers.length,
    columnNames: headers,
    
    totalRevenue: Math.round(totalRevenue),
    totalQuantity: Math.round(totalQuantity),
    averageOrderValue: orderIds.size > 0 ? Math.round(totalRevenue / orderIds.size) : 
                       rows.length > 0 ? Math.round(totalRevenue / rows.length) : 0,
    
    totalOrders: orderIds.size || rows.length,
    uniqueCustomers: customers.size,
    uniqueProducts: products.size,
    uniqueCategories: categories.size || categoryRevenue.size,
    uniqueRegions: regions.size || regionStats.size,
    
    revenueColumn,
    quantityColumn,
    productColumn,
    customerColumn,
    categoryColumn,
    regionColumn,
    dateColumn,
    priceColumn,
    
    revenueByCategory: Array.from(categoryRevenue.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({
        name,
        value: Math.round(value),
        percentage: totalRevenue > 0 ? Math.round((value / totalRevenue) * 100) : 0
      })),
    
    revenueByRegion: Array.from(regionStats.entries())
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .map(([region, stats]) => ({
        region,
        sales: Math.round(stats.revenue),
        orders: stats.orders,
        customers: stats.customers.size
      })),
    
    topProducts: sortedProducts
      .slice(0, 10)
      .map(([name, stats]) => ({
        name: name.length > 30 ? name.substring(0, 30) + '...' : name,
        sales: Math.round(stats.sales),
        quantity: Math.round(stats.quantity)
      })),
    
    topCustomers: Array.from(customerStats.entries())
      .sort((a, b) => b[1].sales - a[1].sales)
      .slice(0, 10)
      .map(([name, stats]) => ({
        name: name.length > 30 ? name.substring(0, 30) + '...' : name,
        sales: Math.round(stats.sales),
        orders: stats.orders
      })),
    
    monthlyRevenue: sortedMonths.map(([month, stats]) => ({
      month,
      revenue: Math.round(stats.revenue),
      orders: stats.orders
    })),
    
    abcClassification,
    inventoryValue: Math.round(inventoryValue),
    forecastAccuracy,
    
    fileName,
    uploadedAt: new Date().toISOString()
  };
}

/**
 * Analyze multiple sheets from same workbook
 */
export function analyzeWorkbook(
  sheets: { name: string; headers: string[]; rows: any[] }[],
  fileName: string
): AnalyzedData {
  // Find the main data sheet (usually orders/sales data)
  const orderSheet = sheets.find(s => detectDataType(s.headers) === 'orders') ||
                     sheets.find(s => s.rows.length > 0); // Fallback to first non-empty sheet
  
  if (!orderSheet) {
    return analyzeData([], [], fileName);
  }
  
  // Analyze with access to all sheets for lookups
  return analyzeData(orderSheet.headers, orderSheet.rows, fileName, 
    sheets.map(s => ({ headers: s.headers, rows: s.rows, sheetName: s.name })));
}

/**
 * Compare multiple datasets
 */
export interface DataComparison {
  fileName: string;
  sheetName?: string;
  totalRevenue: number;
  totalOrders: number;
  uniqueCustomers: number;
  uniqueProducts: number;
  averageOrderValue: number;
  totalQuantity: number;
}

export function compareDatasets(datasets: { name: string; headers: string[]; rows: any[] }[]): DataComparison[] {
  return datasets.map(ds => {
    const analysis = analyzeData(ds.headers, ds.rows, ds.name);
    return {
      fileName: ds.name,
      totalRevenue: analysis.totalRevenue,
      totalOrders: analysis.totalOrders,
      uniqueCustomers: analysis.uniqueCustomers,
      uniqueProducts: analysis.uniqueProducts,
      averageOrderValue: analysis.averageOrderValue,
      totalQuantity: analysis.totalQuantity
    };
  });
}

/**
 * Combine multiple datasets for aggregate analysis
 */
export function combineDatasets(datasets: { name: string; headers: string[]; rows: any[] }[]): AnalyzedData {
  if (datasets.length === 0) {
    return analyzeData([], [], 'Combined');
  }
  
  if (datasets.length === 1) {
    return analyzeData(datasets[0].headers, datasets[0].rows, datasets[0].name);
  }
  
  // Use headers from first dataset and combine all rows
  const baseHeaders = datasets[0].headers;
  const allRows = datasets.flatMap(ds => ds.rows);
  
  return analyzeData(baseHeaders, allRows, `Combined (${datasets.length} files)`);
}
