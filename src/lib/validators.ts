// Excel parser and data validator
import { CUSTOMERS, MATERIALS } from './mock-data';

export interface ParsedOrder {
  orderId: string;
  orderDate: string;
  customerId: string;
  materialId: string;
  quantity: number;
  deliveryDate: string;
  salesOrg?: string;
}

export interface ValidationResult {
  row: number;
  order: ParsedOrder;
  valid: boolean;
  errors: string[];
}

export interface UploadSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicates: number;
  results: ValidationResult[];
}

/**
 * Convert Excel serial date to ISO string
 */
export function excelDateToISO(serial: number): string {
  const utcDays = Math.floor(serial - 25569);
  const date = new Date(utcDays * 86400 * 1000);
  return date.toISOString().split('T')[0];
}

/**
 * Validate a single order row
 */
export function validateOrder(order: ParsedOrder, existingOrderIds: Set<string>, rowIndex: number): ValidationResult {
  const errors: string[] = [];

  // Check required fields
  if (!order.orderId) errors.push('Missing Order_ID');
  if (!order.customerId) errors.push('Missing Customer_ID');
  if (!order.materialId) errors.push('Missing Material_ID');
  if (!order.quantity || order.quantity <= 0) errors.push('Quantity must be > 0');

  // Validate Customer_ID exists in master data
  const customer = CUSTOMERS.find(c => c.id === order.customerId);
  if (order.customerId && !customer) {
    errors.push(`Invalid Customer_ID: ${order.customerId} does not exist`);
  }

  // Validate Material_ID exists in master data
  const material = MATERIALS.find(m => m.id === order.materialId);
  if (order.materialId && !material) {
    errors.push(`Invalid Material_ID: ${order.materialId} does not exist`);
  }

  // Check for duplicates
  if (existingOrderIds.has(order.orderId)) {
    errors.push(`Duplicate order detected: ${order.orderId}`);
  }

  // Date validation
  if (order.deliveryDate && order.orderDate && order.deliveryDate < order.orderDate) {
    errors.push('Delivery date must be >= Order date');
  }

  return {
    row: rowIndex,
    order,
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Process batch of orders
 */
export function validateOrderBatch(orders: ParsedOrder[]): UploadSummary {
  const seenOrderIds = new Set<string>();
  const results: ValidationResult[] = [];
  let duplicates = 0;

  for (let i = 0; i < orders.length; i++) {
    const result = validateOrder(orders[i], seenOrderIds, i + 1);

    if (result.errors.some(e => e.startsWith('Duplicate'))) {
      duplicates++;
    }

    if (result.valid) {
      seenOrderIds.add(orders[i].orderId);
    }

    results.push(result);
  }

  return {
    totalRows: orders.length,
    validRows: results.filter(r => r.valid).length,
    invalidRows: results.filter(r => !r.valid).length,
    duplicates,
    results,
  };
}

/**
 * Parse inventory/forecast data from Excel
 */
export interface ParsedInventoryRow {
  materialId: string;
  month: string;
  openingStock: number;
  stockInTransit: number;
  actualSales: number;
  forecastDemand: number;
  safetyStock: number;
}

export function mapExcelColumns(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const normalizedHeaders = headers.map(h => h?.toString().toLowerCase().trim().replace(/[_\s]+/g, '') || '');

  const columnMap: Record<string, string[]> = {
    orderId: ['orderid', 'order_id', 'sono', 'salesorder'],
    orderDate: ['orderdate', 'order_date', 'date'],
    customerId: ['customerid', 'customer_id', 'custid'],
    materialId: ['materialid', 'material_id', 'matid', 'sku'],
    quantity: ['quantity', 'qty', 'orderqty'],
    deliveryDate: ['deliverydate', 'delivery_date', 'requesteddeliverydate', 'deldate'],
    salesOrg: ['salesorg', 'sales_org'],
    openingStock: ['openingstock', 'opening_stock', 'beginningstock'],
    stockInTransit: ['stockintransit', 'stock_in_transit', 'intransit', 'transit'],
    actualSales: ['actualsales', 'actual_sales', 'sales', 'actual'],
    forecastDemand: ['forecastdemand', 'forecast_demand', 'forecast', 'demand'],
    safetyStock: ['safetystock', 'safety_stock', 'buffer'],
    month: ['month', 'period'],
  };

  for (const [field, aliases] of Object.entries(columnMap)) {
    for (let i = 0; i < normalizedHeaders.length; i++) {
      if (aliases.includes(normalizedHeaders[i])) {
        mapping[field] = headers[i];
        break;
      }
    }
  }

  return mapping;
}
