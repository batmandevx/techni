// S&OP Master Data & Mock Data
export const CUSTOMERS = [
  { id: 'C1001', name: 'Al Noor Trading', city: 'Dubai', country: 'UAE', paymentTerms: '30D', salesOrg: '1000', distChannel: '10', division: '0' },
  { id: 'C1002', name: 'Gulf Retail LLC', city: 'Abu Dhabi', country: 'UAE', paymentTerms: '30D', salesOrg: '1000', distChannel: '10', division: '0' },
  { id: 'C1003', name: 'Desert Hypermarket', city: 'Sharjah', country: 'UAE', paymentTerms: '45D', salesOrg: '1000', distChannel: '10', division: '0' },
  { id: 'C1004', name: 'Oasis Superstores', city: 'Doha', country: 'Qatar', paymentTerms: '30D', salesOrg: '1000', distChannel: '10', division: '0' },
  { id: 'C1005', name: 'Arabian Distribution', city: 'Riyadh', country: 'KSA', paymentTerms: '60D', salesOrg: '1000', distChannel: '10', division: '0' },
  { id: 'C1006', name: 'Pegasus', city: 'Kathmandu', country: 'Nepal', paymentTerms: '30D', salesOrg: '1000', distChannel: '10', division: '0' },
  { id: 'C1007', name: 'Mint', city: 'Colombo', country: 'Srilanka', paymentTerms: '45D', salesOrg: '1000', distChannel: '10', division: '0' },
];

export const MATERIALS = [
  { id: 'M2001', description: 'Chocolate Bar 50g', baseUOM: 'EA', salesUOM: 'EA', plant: 'DXB1', storageLocation: 'FG01', priceUSD: 1.20, leadTimeDays: 7, serviceLevel: 0.95, orderingCost: 50, holdingCostPct: 0.20 },
  { id: 'M2002', description: 'Fruit Candy Pack 100g', baseUOM: 'EA', salesUOM: 'EA', plant: 'DXB1', storageLocation: 'FG01', priceUSD: 1.80, leadTimeDays: 14, serviceLevel: 0.98, orderingCost: 50, holdingCostPct: 0.20 },
  { id: 'M2003', description: 'Caramel Toffee 200g', baseUOM: 'EA', salesUOM: 'EA', plant: 'DXB1', storageLocation: 'FG02', priceUSD: 2.50, leadTimeDays: 10, serviceLevel: 0.95, orderingCost: 75, holdingCostPct: 0.25 },
  { id: 'M2004', description: 'Mint Candy Jar', baseUOM: 'EA', salesUOM: 'EA', plant: 'DXB1', storageLocation: 'FG02', priceUSD: 3.00, leadTimeDays: 21, serviceLevel: 0.90, orderingCost: 100, holdingCostPct: 0.15 },
  { id: 'M2005', description: 'Assorted Candy Box', baseUOM: 'EA', salesUOM: 'EA', plant: 'DXB1', storageLocation: 'FG03', priceUSD: 4.50, leadTimeDays: 14, serviceLevel: 0.98, orderingCost: 75, holdingCostPct: 0.20 },
];

export const MONTHS = ['Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026'];

// 6-month historical sales + forecast data per material
export const HISTORICAL_DATA: Record<string, { month: string; actualSales: number; forecast: number; openingStock: number; stockInTransit: number; safetyStock: number }[]> = {
  M2001: [
    { month: 'Oct 2025', actualSales: 4200, forecast: 4000, openingStock: 6000, stockInTransit: 500, safetyStock: 800 },
    { month: 'Nov 2025', actualSales: 4500, forecast: 4300, openingStock: 2300, stockInTransit: 3000, safetyStock: 800 },
    { month: 'Dec 2025', actualSales: 5800, forecast: 5200, openingStock: 800, stockInTransit: 5500, safetyStock: 800 },
    { month: 'Jan 2026', actualSales: 3900, forecast: 4100, openingStock: 500, stockInTransit: 4200, safetyStock: 800 },
    { month: 'Feb 2026', actualSales: 4100, forecast: 4200, openingStock: 800, stockInTransit: 4000, safetyStock: 800 },
    { month: 'Mar 2026', actualSales: 0,    forecast: 4400, openingStock: 700, stockInTransit: 4500, safetyStock: 800 },
  ],
  M2002: [
    { month: 'Oct 2025', actualSales: 3100, forecast: 3000, openingStock: 5000, stockInTransit: 400, safetyStock: 600 },
    { month: 'Nov 2025', actualSales: 3400, forecast: 3200, openingStock: 2300, stockInTransit: 2000, safetyStock: 600 },
    { month: 'Dec 2025', actualSales: 4200, forecast: 3800, openingStock: 900, stockInTransit: 4000, safetyStock: 600 },
    { month: 'Jan 2026', actualSales: 2800, forecast: 3100, openingStock: 700, stockInTransit: 3000, safetyStock: 600 },
    { month: 'Feb 2026', actualSales: 3000, forecast: 3200, openingStock: 900, stockInTransit: 2800, safetyStock: 600 },
    { month: 'Mar 2026', actualSales: 0,    forecast: 3300, openingStock: 700, stockInTransit: 3500, safetyStock: 600 },
  ],
  M2003: [
    { month: 'Oct 2025', actualSales: 2200, forecast: 2100, openingStock: 3500, stockInTransit: 300, safetyStock: 500 },
    { month: 'Nov 2025', actualSales: 2500, forecast: 2300, openingStock: 1600, stockInTransit: 1800, safetyStock: 500 },
    { month: 'Dec 2025', actualSales: 3200, forecast: 2800, openingStock: 900, stockInTransit: 3000, safetyStock: 500 },
    { month: 'Jan 2026', actualSales: 2000, forecast: 2200, openingStock: 700, stockInTransit: 2300, safetyStock: 500 },
    { month: 'Feb 2026', actualSales: 2100, forecast: 2300, openingStock: 1000, stockInTransit: 2000, safetyStock: 500 },
    { month: 'Mar 2026', actualSales: 0,    forecast: 2400, openingStock: 900, stockInTransit: 2500, safetyStock: 500 },
  ],
  M2004: [
    { month: 'Oct 2025', actualSales: 1800, forecast: 1700, openingStock: 2800, stockInTransit: 200, safetyStock: 400 },
    { month: 'Nov 2025', actualSales: 2000, forecast: 1900, openingStock: 1200, stockInTransit: 1500, safetyStock: 400 },
    { month: 'Dec 2025', actualSales: 2600, forecast: 2300, openingStock: 700, stockInTransit: 2500, safetyStock: 400 },
    { month: 'Jan 2026', actualSales: 1600, forecast: 1800, openingStock: 600, stockInTransit: 1800, safetyStock: 400 },
    { month: 'Feb 2026', actualSales: 1700, forecast: 1800, openingStock: 700, stockInTransit: 1600, safetyStock: 400 },
    { month: 'Mar 2026', actualSales: 0,    forecast: 1900, openingStock: 600, stockInTransit: 2000, safetyStock: 400 },
  ],
  M2005: [
    { month: 'Oct 2025', actualSales: 1200, forecast: 1100, openingStock: 2000, stockInTransit: 200, safetyStock: 300 },
    { month: 'Nov 2025', actualSales: 1400, forecast: 1300, openingStock: 1000, stockInTransit: 1000, safetyStock: 300 },
    { month: 'Dec 2025', actualSales: 1800, forecast: 1600, openingStock: 600, stockInTransit: 1800, safetyStock: 300 },
    { month: 'Jan 2026', actualSales: 1000, forecast: 1200, openingStock: 600, stockInTransit: 1200, safetyStock: 300 },
    { month: 'Feb 2026', actualSales: 1100, forecast: 1200, openingStock: 800, stockInTransit: 1100, safetyStock: 300 },
    { month: 'Mar 2026', actualSales: 0,    forecast: 1300, openingStock: 800, stockInTransit: 1400, safetyStock: 300 },
  ],
};

// Aggregate dashboard data
export const DASHBOARD_KPI = {
  forecastAccuracy: 91.2,
  forecastAccuracyTrend: 2.4,
  inventoryTurns: 7.8,
  inventoryTurnsTrend: 0.5,
  fillRate: 96.5,
  fillRateTrend: 1.2,
  stockCoverage: 14,
  stockCoverageTrend: -2,
  stockoutRisk: 8.3,
  stockoutRiskTrend: -1.5,
};

export const DEMAND_VS_ACTUAL = MONTHS.map((month, i) => {
  let totalActual = 0;
  let totalForecast = 0;
  Object.values(HISTORICAL_DATA).forEach(data => {
    totalActual += data[i].actualSales;
    totalForecast += data[i].forecast;
  });
  return { month, actual: totalActual, forecast: totalForecast };
});

export const ALERTS = [
  { id: 1, type: 'danger' as const, title: 'Stockout Risk', message: 'M2001 Chocolate Bar stock below safety threshold at FG01', time: '5 min ago' },
  { id: 2, type: 'warning' as const, title: 'Forecast Deviation', message: 'M2003 Caramel Toffee Dec actual exceeded forecast by 14.3%', time: '1 hour ago' },
  { id: 3, type: 'info' as const, title: 'Replenishment Order', message: 'Auto-generated PO for M2005 Assorted Candy Box - 1,400 cartons', time: '2 hours ago' },
  { id: 4, type: 'success' as const, title: 'Delivery Confirmed', message: 'Stock in transit for M2002 received at FG01 warehouse', time: '3 hours ago' },
  { id: 5, type: 'warning' as const, title: 'Payment Terms Alert', message: 'Arabian Distribution (C1005) approaching 60-day payment deadline', time: '4 hours ago' },
  { id: 6, type: 'info' as const, title: 'New Order', message: 'SO7001 from Al Noor Trading - 500 cartons M2001', time: '5 hours ago' },
];

// Customer order data for order management
export const SAMPLE_ORDERS = [
  { orderId: 'SO5001', orderDate: '2026-03-01', customerId: 'C1001', materialId: 'M2001', quantity: 500, deliveryDate: '2026-03-10', status: 'Delivered' },
  { orderId: 'SO5002', orderDate: '2026-03-01', customerId: 'C1002', materialId: 'M2002', quantity: 300, deliveryDate: '2026-03-08', status: 'Shipped' },
  { orderId: 'SO5003', orderDate: '2026-03-02', customerId: 'C1003', materialId: 'M2003', quantity: 200, deliveryDate: '2026-03-12', status: 'Confirmed' },
  { orderId: 'SO5004', orderDate: '2026-03-02', customerId: 'C1004', materialId: 'M2004', quantity: 150, deliveryDate: '2026-03-15', status: 'Confirmed' },
  { orderId: 'SO5005', orderDate: '2026-03-03', customerId: 'C1005', materialId: 'M2005', quantity: 100, deliveryDate: '2026-03-18', status: 'Created' },
  { orderId: 'SO5006', orderDate: '2026-03-03', customerId: 'C1006', materialId: 'M2001', quantity: 800, deliveryDate: '2026-03-20', status: 'Created' },
  { orderId: 'SO5007', orderDate: '2026-03-04', customerId: 'C1007', materialId: 'M2002', quantity: 450, deliveryDate: '2026-03-22', status: 'Created' },
];
