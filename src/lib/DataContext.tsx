'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

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
  currentStock?: number;
  safetyStock?: number;
  stockInTransit?: number;
  forecastDemand?: number;
  orderCount?: number;
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
  isActive?: boolean;
  orderCount?: number;
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
    unitPrice: number;
    lineTotal: number;
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
  error: string | null;
  refreshData: () => Promise<void>;
  updateData: (data: any) => void;
  clearUploadedData: () => void;
  excelPreviewData: {
    headers: string[];
    rows: any[];
    type: 'orders' | 'customers' | 'materials' | null;
  } | null;
  setExcelPreviewData: (data: any) => void;
  demandTrend: { month: string; forecast: number; actual: number }[];
}

// Default values
const defaultKPIs: KPIs = {
  forecastAccuracy: 0,
  inventoryTurns: 0,
  fillRate: 0,
  stockCoverage: 0,
  stockoutRisk: 0,
  totalOrders: 0,
  totalRevenue: 0,
  activeCustomers: 0,
  lowStockItems: 0,
  pendingOrders: 0,
};

const defaultAlerts = [
  { id: 1, type: 'info', message: 'Loading data from database...', time: 'Now' },
];

// Generate months
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Create context
const DataContext = createContext<DataContextType>({
  customers: [],
  materials: [],
  orders: [],
  kpis: defaultKPIs,
  historicalData: {},
  months: MONTHS,
  alerts: defaultAlerts,
  hasUploadedData: false,
  isLoading: true,
  error: null,
  refreshData: async () => {},
  updateData: () => {},
  clearUploadedData: () => {},
  excelPreviewData: null,
  setExcelPreviewData: () => {},
  demandTrend: [],
});

// Provider component
export function DataProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [excelPreviewData, setExcelPreviewData] = useState<any>(null);
  
  // State for data
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [kpis, setKpis] = useState<KPIs>(defaultKPIs);
  const [historicalData, setHistoricalData] = useState<Record<string, HistoricalDataPoint[]>>({});
  const [alerts, setAlerts] = useState(defaultAlerts);
  
  // Fetch all data from APIs
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch from all APIs in parallel
      const [dashboardRes, ordersRes, customersRes, materialsRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/orders'),
        fetch('/api/customers'),
        fetch('/api/materials'),
      ]);
      
      // Process dashboard data
      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json();
        if (dashboardData.success) {
          setKpis(dashboardData.kpis);
          setAlerts([
            { id: 1, type: 'success', message: 'Data loaded successfully', time: 'Just now' },
            ...(dashboardData.kpis.lowStockItems > 0 ? [{
              id: 2,
              type: 'warning',
              message: `${dashboardData.kpis.lowStockItems} items are low on stock`,
              time: 'Just now'
            }] : []),
          ]);
        }
      }
      
      // Process orders
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (ordersData.success) {
          setOrders(ordersData.orders);
        }
      }
      
      // Process customers
      if (customersRes.ok) {
        const customersData = await customersRes.json();
        if (customersData.success) {
          setCustomers(customersData.customers);
        }
      }
      
      // Process materials
      if (materialsRes.ok) {
        const materialsData = await materialsRes.json();
        if (materialsData.success) {
          setMaterials(materialsData.materials);
        }
      }
      
      // Generate historical data from materials
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const newHistoricalData: Record<string, HistoricalDataPoint[]> = {};
      
      materials.forEach(material => {
        newHistoricalData[material.id] = months.map((month, i) => ({
          month,
          actualSales: Math.round(Math.random() * 1000) + 200,
          forecast: Math.round(Math.random() * 1000) + 200,
          openingStock: Math.round(Math.random() * 3000) + 1000,
          stockInTransit: Math.round(Math.random() * 500) + 100,
          safetyStock: Math.round(Math.random() * 500) + 200,
        }));
      });
      
      setHistoricalData(newHistoricalData);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data from server');
      setAlerts([{ id: 1, type: 'error', message: 'Failed to load data', time: 'Just now' }]);
    } finally {
      setIsLoading(false);
    }
  }, [materials]);

  // Load data on mount
  useEffect(() => {
    refreshData();
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
    refreshData(); // Reload from database
  }, [refreshData]);
  
  // Calculate demand trend from historical data
  const demandTrend = useMemo(() => {
    const months = Object.values(historicalData)[0]?.map(d => d.month) || MONTHS.slice(0, 6);
    return months.map((month, i) => {
      let totalForecast = 0;
      let totalActual = 0;
      Object.values(historicalData).forEach(data => {
        totalForecast += data[i]?.forecast || 0;
        totalActual += data[i]?.actualSales || 0;
      });
      return {
        month,
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
    alerts,
    hasUploadedData: orders.length > 0 || customers.length > 0,
    isLoading,
    error,
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
    alerts,
    isLoading,
    error,
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
