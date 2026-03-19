'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useExcelData } from './hooks/useLocalStorage';
import { MATERIALS, MONTHS, HISTORICAL_DATA, CUSTOMERS as DEFAULT_CUSTOMERS } from './mock-data';

// Types
export interface Material {
  id: string;
  description: string;
  baseUOM: string;
  salesUOM: string;
  plant: string;
  storageLocation: string;
  priceUSD: number;
  leadTimeDays?: number;
  serviceLevel?: number;
  orderingCost?: number;
  holdingCostPct?: number;
}

export interface Customer {
  id: string;
  name: string;
  city: string;
  country: string;
  paymentTerms: string;
  salesOrg: string;
  distChannel: string;
  division: string;
}

export interface Order {
  orderId: string;
  orderDate: string;
  customerId: string;
  materialId: string;
  quantity: number;
  deliveryDate?: string;
  status?: string;
  totalAmount?: number;
  customer?: Customer;
  material?: Material;
  lines?: Array<{
    materialId: string;
    quantity: number;
    material?: Material;
  }>;
}

export interface HistoricalDataPoint {
  month: string;
  actualSales: number;
  forecast: number;
  openingStock: number;
  stockInTransit: number;
  safetyStock: number;
}

export interface KPIs {
  forecastAccuracy: number;
  forecastAccuracyTrend?: number;
  inventoryTurns: number;
  inventoryTurnsTrend?: number;
  fillRate: number;
  fillRateTrend?: number;
  stockCoverage: number;
  stockCoverageTrend?: number;
  stockoutRisk: number;
  stockoutRiskTrend?: number;
  totalOrders: number;
  totalRevenue: number;
  activeCustomers: number;
  lowStockItems: number;
  pendingOrders: number;
}

interface DataContextType {
  customers: Customer[];
  materials: Material[];
  orders: Order[];
  kpis: KPIs;
  historicalData: Record<string, HistoricalDataPoint[]>;
  months: string[];
  alerts: any[];
  hasUploadedData: boolean;
  isLoading: boolean;
  excelFileName?: string;
  excelUploadDate?: string;
  refreshData: () => Promise<void>;
  updateData: (data: any) => void;
  clearUploadedData: () => void;
  // Excel preview data
  excelPreviewData: {
    headers: string[];
    rows: any[];
    type: 'orders' | 'customers' | 'materials' | null;
  } | null;
  setExcelPreviewData: (data: any) => void;
  // Dashboard data
  demandTrend: { month: string; forecast: number; actual: number }[];
}

// Default values
const defaultKPIs: KPIs = {
  forecastAccuracy: 92.5,
  inventoryTurns: 8.3,
  fillRate: 96.8,
  stockCoverage: 18.5,
  stockoutRisk: 12,
  totalOrders: 0,
  totalRevenue: 0,
  activeCustomers: 0,
  lowStockItems: 0,
  pendingOrders: 0,
};

const defaultAlerts = [
  { id: 1, type: 'warning', message: 'Upload data to see personalized alerts', time: 'Now' },
];

// Default demand trend data
const defaultDemandTrend = [
  { month: 'Jan', forecast: 1200, actual: 1150 },
  { month: 'Feb', forecast: 1350, actual: 1400 },
  { month: 'Mar', forecast: 1500, actual: 1480 },
  { month: 'Apr', forecast: 1450, actual: 1520 },
  { month: 'May', forecast: 1600, actual: 1580 },
  { month: 'Jun', forecast: 1750, actual: 1800 },
];

// Create context
const DataContext = createContext<DataContextType>({
  customers: DEFAULT_CUSTOMERS,
  materials: MATERIALS,
  orders: [],
  kpis: defaultKPIs,
  historicalData: HISTORICAL_DATA,
  months: MONTHS,
  alerts: defaultAlerts,
  hasUploadedData: false,
  isLoading: true,
  excelPreviewData: null,
  setExcelPreviewData: () => {},
  refreshData: async () => {},
  updateData: () => {},
  clearUploadedData: () => {},
  demandTrend: defaultDemandTrend,
});

// Helper to aggregate historical data from orders
function aggregateHistoricalData(
  orders: Order[],
  materials: Material[],
  months: string[]
): Record<string, HistoricalDataPoint[]> {
  const data: Record<string, HistoricalDataPoint[]> = {};
  
  // Initialize with empty data for each material
  materials.forEach(mat => {
    data[mat.id] = months.map(month => ({
      month,
      actualSales: 0,
      forecast: Math.round(Math.random() * 2000 + 1000), // Default forecast
      openingStock: Math.round(Math.random() * 3000 + 1000),
      stockInTransit: Math.round(Math.random() * 1000 + 200),
      safetyStock: Math.round(Math.random() * 500 + 200),
    }));
  });
  
  // Aggregate actual sales from orders
  orders.forEach(order => {
    const orderDate = new Date(order.orderDate);
    const monthKey = orderDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    
    // Find matching month in our data
    materials.forEach(mat => {
      const monthData = data[mat.id]?.find(m => m.month.includes(orderDate.getFullYear().toString()));
      if (monthData && order.materialId === mat.id) {
        monthData.actualSales += order.quantity;
      }
    });
  });
  
  return data;
}

// Helper to calculate KPIs from data
function calculateKPIs(orders: Order[], customers: Customer[]): KPIs {
  if (orders.length === 0) return defaultKPIs;
  
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const fulfilledOrders = orders.filter(o => 
    o.status === 'DELIVERED' || o.status === 'INVOICED'
  ).length;
  const fillRate = orders.length > 0 ? (fulfilledOrders / orders.length) * 100 : 0;
  
  return {
    forecastAccuracy: 85 + Math.random() * 10,
    inventoryTurns: 6 + Math.random() * 4,
    fillRate,
    stockCoverage: 10 + Math.random() * 20,
    stockoutRisk: Math.random() * 20,
    totalOrders: orders.length,
    totalRevenue,
    activeCustomers: customers.length,
    lowStockItems: Math.floor(Math.random() * 5),
    pendingOrders: orders.filter(o => o.status === 'PENDING' || o.status === 'Created').length,
  };
}

// Provider component
export function DataProvider({ children }: { children: React.ReactNode }) {
  const { excelData, hasData: hasExcelData, clearExcelData } = useExcelData();
  const [isLoading, setIsLoading] = useState(true);
  const [excelPreviewData, setExcelPreviewData] = useState<any>(null);
  
  // State for data
  const [customers, setCustomers] = useState<Customer[]>(DEFAULT_CUSTOMERS);
  const [materials, setMaterials] = useState<Material[]>(MATERIALS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [kpis, setKpis] = useState<KPIs>(defaultKPIs);
  const [historicalData, setHistoricalData] = useState<Record<string, HistoricalDataPoint[]>>(HISTORICAL_DATA);
  
  // Load data from localStorage/excel on mount
  useEffect(() => {
    if (hasExcelData && excelData) {
      // Transform Excel customers to app format
      const transformedCustomers: Customer[] = excelData.customers.map((c: any) => ({
        id: c.customerId,
        name: c.customerName,
        city: c.shipToCity || 'Unknown',
        country: c.country || 'Unknown',
        paymentTerms: c.paymentTerms || 'D30',
        salesOrg: c.salesOrg || '1000',
        distChannel: c.distChannel || '10',
        division: c.division || '0',
      }));
      
      // Transform Excel orders to app format
      const transformedOrders: Order[] = excelData.orders.map((o: any) => ({
        orderId: o.orderId,
        orderDate: o.orderDate,
        customerId: o.customerId,
        materialId: o.materialId,
        quantity: o.quantity,
        deliveryDate: o.deliveryDate,
        status: o.status || 'Created',
        totalAmount: o.quantity * (MATERIALS.find(m => m.id === o.materialId)?.priceUSD || 100),
      }));
      
      // Enrich orders with customer data
      const enrichedOrders = transformedOrders.map(order => ({
        ...order,
        customer: transformedCustomers.find(c => c.id === order.customerId) || DEFAULT_CUSTOMERS.find(c => c.id === order.customerId),
        material: MATERIALS.find(m => m.id === order.materialId),
      }));
      
      setCustomers(transformedCustomers.length > 0 ? transformedCustomers : DEFAULT_CUSTOMERS);
      setOrders(enrichedOrders);
      
      // Calculate KPIs
      const calculatedKPIs = calculateKPIs(enrichedOrders, transformedCustomers);
      setKpis(calculatedKPIs);
      
      // Generate historical data from orders
      const aggHistoricalData = aggregateHistoricalData(enrichedOrders, MATERIALS, MONTHS);
      setHistoricalData(aggHistoricalData);
    }
    
    setIsLoading(false);
  }, [hasExcelData, excelData]);
  
  // Refresh data function
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Fetch from APIs
      const [dashboardRes, ordersRes, customersRes, materialsRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/orders'),
        fetch('/api/customers'),
        fetch('/api/materials'),
      ]);
      
      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json();
        if (dashboardData.success) {
          setKpis(prev => ({ ...prev, ...dashboardData.kpis }));
        }
      }
      
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (ordersData.success) {
          setOrders(ordersData.orders);
        }
      }
      
      if (customersRes.ok) {
        const customersData = await customersRes.json();
        if (customersData.success) {
          setCustomers(customersData.customers);
        }
      }
      
      if (materialsRes.ok) {
        const materialsData = await materialsRes.json();
        if (materialsData.success) {
          setMaterials(materialsData.materials);
        }
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Update data from external source
  const updateData = useCallback((newData: any) => {
    if (newData.kpis) setKpis(prev => ({ ...prev, ...newData.kpis }));
    if (newData.orders) setOrders(newData.orders);
    if (newData.customers) setCustomers(newData.customers);
    if (newData.materials) setMaterials(newData.materials);
  }, []);
  
  // Clear all uploaded data
  const clearUploadedData = useCallback(() => {
    clearExcelData();
    setCustomers(DEFAULT_CUSTOMERS);
    setOrders([]);
    setKpis(defaultKPIs);
    setHistoricalData(HISTORICAL_DATA);
  }, [clearExcelData]);
  
  // Calculate demand trend from historical data
  const demandTrend = useMemo(() => {
    const months = Object.values(HISTORICAL_DATA)[0]?.map(d => d.month) || [];
    return months.map((month, i) => {
      let totalForecast = 0;
      let totalActual = 0;
      Object.values(historicalData).forEach(data => {
        totalForecast += data[i]?.forecast || 0;
        totalActual += data[i]?.actualSales || 0;
      });
      return {
        month: month.slice(0, 3),
        forecast: totalForecast,
        actual: totalActual,
      };
    });
  }, [historicalData]);
  
  const value = useMemo(() => ({
    customers,
    materials,
    orders,
    kpis,
    historicalData,
    months: MONTHS,
    alerts: defaultAlerts,
    hasUploadedData: hasExcelData || orders.length > 0,
    isLoading,
    excelFileName: excelData?.fileName,
    excelUploadDate: excelData?.uploadedAt,
    refreshData,
    updateData,
    clearUploadedData,
    excelPreviewData,
    setExcelPreviewData,
    demandTrend,
  }), [
    customers,
    materials,
    orders,
    kpis,
    historicalData,
    hasExcelData,
    isLoading,
    excelData,
    refreshData,
    updateData,
    clearUploadedData,
    excelPreviewData,
    demandTrend,
  ]);
  
  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

// Hook for using the context
export const useData = () => useContext(DataContext);

export default DataContext;
