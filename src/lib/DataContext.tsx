'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { parseUploadedData } from '@/lib/uploadDataStore';

// Types
export interface Material {
  id: string;
  description: string;
  baseUOM: string;
  salesUOM: string;
  plant: string;
  storageLocation: string;
  priceUSD: number;
  category?: string;
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

// New Types for Uploaded Excel Data
export interface UploadedData {
  id: string;
  name: string;
  headers: string[];
  rows: any[];
  uploadedAt: Date;
  fileType: 'xlsx' | 'csv' | 'xls';
  detectedFormat?: string;
  summary?: DataSummary;
}

export interface DataSummary {
  totalRows: number;
  totalColumns: number;
  numericColumns: string[];
  categoricalColumns: string[];
  dateColumns: string[];
  columnStats: Record<string, ColumnStats>;
}

export interface ColumnStats {
  type: 'numeric' | 'categorical' | 'date';
  min?: number;
  max?: number;
  avg?: number;
  sum?: number;
  uniqueValues?: number;
  topValues?: { value: string; count: number }[];
}

export interface DashboardData {
  // KPI Stats
  totalOrders: number;
  ordersChange: number;
  revenue: number;
  revenueChange: number;
  customers: number;
  customersChange: number;
  products: number;
  productsChange: number;
  forecastAccuracy: number;
  accuracyChange: number;
  inventoryValue: number;
  inventoryChange: number;
  
  // Chart Data
  revenueTrend: { name: string; revenue: number; orders: number; forecast: number }[];
  categoryDistribution: { name: string; value: number; percentage?: number }[];
  abcClassification: { name: string; value: number; percentage: number }[];
  performanceMetrics: { name: string; actual: number; target: number }[];
  radarMetrics: { subject: string; A: number; B: number; fullMark: number }[];
  funnelData: { name: string; value: number; fill?: string }[];
  sankeyData: { source: string; target: string; value: number }[];
  heatmapData: { x: string; y: string; value: number }[];
  topProducts: { name: string; sales: number; quantity: number; growth: number }[];
  regionalData: { region: string; sales: number; orders: number; customers: number }[];
  monthlyComparison: { month: string; current: number; previous: number }[];
  inventoryByCategory: { category: string; value: number; turnover: number }[];
}

const defaultDashboardData: DashboardData = {
  totalOrders: 0,
  ordersChange: 0,
  revenue: 0,
  revenueChange: 0,
  customers: 0,
  customersChange: 0,
  products: 0,
  productsChange: 0,
  forecastAccuracy: 0,
  accuracyChange: 0,
  inventoryValue: 0,
  inventoryChange: 0,
  revenueTrend: [],
  categoryDistribution: [],
  abcClassification: [],
  performanceMetrics: [],
  radarMetrics: [],
  funnelData: [],
  sankeyData: [],
  heatmapData: [],
  topProducts: [],
  regionalData: [],
  monthlyComparison: [],
  inventoryByCategory: [],
};

interface DataContextType {
  customers: Customer[];
  materials: Material[];
  orders: Order[];
  kpis: KPIs;
  historicalData: Record<string, HistoricalDataPoint[]>;
  months: string[];
  alerts: any[];
  hasUploadedData: boolean;
  hasRealData: boolean;
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
  // New properties for uploaded file dashboard
  uploadedFiles: UploadedData[];
  currentData: UploadedData | null;
  dashboardData: DashboardData;
  addUploadedFile: (file: Omit<UploadedData, 'id' | 'uploadedAt'>) => void;
  setCurrentData: (data: UploadedData | null) => void;
  clearAllData: () => void;
  generateDashboardData: (data: UploadedData) => void;
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
  hasRealData: false,
  isLoading: true,
  error: null,
  refreshData: async () => {},
  updateData: () => {},
  clearUploadedData: () => {},
  excelPreviewData: null,
  setExcelPreviewData: () => {},
  demandTrend: [],
  uploadedFiles: [],
  currentData: null,
  dashboardData: defaultDashboardData,
  addUploadedFile: () => {},
  setCurrentData: () => {},
  clearAllData: () => {},
  generateDashboardData: () => {},
});

// Provider component
export function DataProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [excelPreviewData, setExcelPreviewData] = useState<any>(null);
  const [hasRealData, setHasRealData] = useState(false);
  
  // State for data
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [kpis, setKpis] = useState<KPIs>(defaultKPIs);
  const [historicalData, setHistoricalData] = useState<Record<string, HistoricalDataPoint[]>>({});
  const [alerts, setAlerts] = useState(defaultAlerts);
  
  // New state for uploaded files dashboard
  const [uploadedFiles, setUploadedFiles] = useState<UploadedData[]>([]);
  const [currentData, setCurrentData] = useState<UploadedData | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>(defaultDashboardData);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('tenchi-uploaded-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.files) {
          setUploadedFiles(parsed.files.map((f: any) => ({
            ...f,
            uploadedAt: new Date(f.uploadedAt)
          })));
        }
        if (parsed.current) {
          setCurrentData({
            ...parsed.current,
            uploadedAt: new Date(parsed.current.uploadedAt)
          });
        }
        if (parsed.dashboard) {
          setDashboardData(parsed.dashboard);
          setHasRealData(true);
        }
        if (parsed.materials && parsed.materials.length > 0) {
          setMaterials(parsed.materials);
        }
        if (parsed.historicalData && Object.keys(parsed.historicalData).length > 0) {
          setHistoricalData(parsed.historicalData);
        }
      } catch (e) {
        console.error('Failed to load saved data:', e);
      }
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    if (uploadedFiles.length > 0 || currentData) {
      localStorage.setItem('tenchi-uploaded-data', JSON.stringify({
        files: uploadedFiles,
        current: currentData,
        dashboard: dashboardData,
        materials,
        historicalData,
      }));
    }
  }, [uploadedFiles, currentData, dashboardData, materials, historicalData]);
  
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
    const saved = localStorage.getItem('tenchi-uploaded-data');
    let hasSavedData = false;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        hasSavedData = !!(parsed.materials?.length || parsed.files?.length);
      } catch {}
    }
    if (!hasSavedData) {
      refreshData();
    }
  }, []);
  
  // Parse uploaded file rows into Material[] and HistoricalDataPoint[]
  const parseFileToContextData = useCallback((file: UploadedData) => {
    try {
      const parsed = parseUploadedData(file.name, file.headers, file.rows, file.detectedFormat);
      const newMaterials: Material[] = parsed.materials.map(m => ({
        id: m.id,
        description: m.description,
        baseUOM: 'EA',
        salesUOM: 'EA',
        plant: 'PLANT1',
        storageLocation: 'STORE1',
        priceUSD: m.price,
        category: m.category,
        currentStock: m.currentStock,
      }));

      const newHistoricalData: Record<string, HistoricalDataPoint[]> = {};
      parsed.materials.forEach(m => {
        newHistoricalData[m.id] = m.monthNames.map((month, i) => ({
          month,
          actualSales: m.monthlySales[i] || 0,
          forecast: Math.round((m.monthlySales[i] || 0) * 1.05),
          openingStock: i === 0 ? m.currentStock : (m.monthlySales[i - 1] || 0),
          stockInTransit: 0,
          safetyStock: Math.round((m.monthlySales[i] || 0) * 0.2),
        }));
      });

      return { materials: newMaterials, historicalData: newHistoricalData };
    } catch (err) {
      console.error('Failed to parse uploaded file to context data:', err);
      return { materials: [] as Material[], historicalData: {} as Record<string, HistoricalDataPoint[]> };
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
    setUploadedFiles([]);
    setCurrentData(null);
    setDashboardData(defaultDashboardData);
    setHasRealData(false);
    setMaterials([]);
    setHistoricalData({});
    localStorage.removeItem('tenchi-uploaded-data');
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

  // Helper functions for uploaded data analysis
  const analyzeColumn = (rows: any[], column: string): ColumnStats => {
    const values = rows.map(r => r[column]).filter(v => v !== null && v !== undefined && v !== '');
    const numericValues = values.map(v => typeof v === 'string' ? parseFloat(v.replace(/[^0-9.-]/g, '')) : v).filter(v => !isNaN(v));
    const dateValues = values.map(v => new Date(v)).filter(d => !isNaN(d.getTime()));
    
    if (numericValues.length / values.length > 0.7) {
      const sum = numericValues.reduce((a, b) => a + b, 0);
      return {
        type: 'numeric',
        min: Math.min(...numericValues),
        max: Math.max(...numericValues),
        avg: sum / numericValues.length,
        sum: sum,
        uniqueValues: new Set(values).size
      };
    } else if (dateValues.length / values.length > 0.7) {
      return {
        type: 'date',
        uniqueValues: new Set(values).size
      };
    } else {
      const valueCounts: Record<string, number> = {};
      values.forEach(v => {
        const key = String(v);
        valueCounts[key] = (valueCounts[key] || 0) + 1;
      });
      const topValues = Object.entries(valueCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([value, count]) => ({ value, count }));
      
      return {
        type: 'categorical',
        uniqueValues: Object.keys(valueCounts).length,
        topValues
      };
    }
  };

  const generateDashboardData = useCallback((data: UploadedData) => {
    const rows = data.rows;
    
    // Find relevant columns by name matching
    const findColumn = (patterns: string[]): string | null => {
      return data.headers.find(h => 
        patterns.some(p => h.toLowerCase().includes(p.toLowerCase()))
      ) || null;
    };

    const revenueCol = findColumn(['revenue', 'sales', 'amount', 'total', 'value', 'price']);
    const quantityCol = findColumn(['quantity', 'qty', 'count', 'units', 'volume']);
    const productCol = findColumn(['product', 'item', 'sku', 'name', 'description']);
    const categoryCol = findColumn(['category', 'type', 'group', 'class']);
    const dateCol = findColumn(['date', 'time', 'month', 'year', 'period']);
    const customerCol = findColumn(['customer', 'client', 'buyer', 'account']);
    const regionCol = findColumn(['region', 'area', 'zone', 'territory', 'country']);

    // Generate revenue trend
    let revenueTrend: any[] = [];
    if (dateCol && revenueCol) {
      const grouped = new Map<string, { revenue: number; orders: number }>();
      rows.forEach(row => {
        const date = new Date(row[dateCol]);
        const key = isNaN(date.getTime()) ? row[dateCol] : date.toLocaleString('default', { month: 'short' });
        const existing = grouped.get(key) || { revenue: 0, orders: 0 };
        existing.revenue += parseFloat(row[revenueCol]) || 0;
        existing.orders += 1;
        grouped.set(key, existing);
      });
      revenueTrend = Array.from(grouped.entries()).map(([name, vals]) => ({
        name,
        revenue: Math.round(vals.revenue),
        orders: vals.orders,
        forecast: Math.round(vals.revenue * (0.9 + Math.random() * 0.2))
      })).slice(0, 12);
    } else if (revenueCol) {
      const chunkSize = Math.ceil(rows.length / 6);
      revenueTrend = Array.from({ length: 6 }, (_, i) => {
        const chunk = rows.slice(i * chunkSize, (i + 1) * chunkSize);
        const revenue = chunk.reduce((sum, r) => sum + (parseFloat(r[revenueCol]) || 0), 0);
        return {
          name: `Period ${i + 1}`,
          revenue: Math.round(revenue),
          orders: chunk.length,
          forecast: Math.round(revenue * (0.9 + Math.random() * 0.2))
        };
      });
    }

    // Category distribution
    let categoryDistribution: any[] = [];
    if (categoryCol) {
      const counts = new Map<string, number>();
      rows.forEach(row => {
        const cat = row[categoryCol] || 'Unknown';
        counts.set(cat, (counts.get(cat) || 0) + 1);
      });
      const total = rows.length;
      categoryDistribution = Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, value]) => ({
          name,
          value,
          percentage: Math.round((value / total) * 100)
        }));
    } else if (productCol) {
      const counts = new Map<string, number>();
      rows.forEach(row => {
        const prod = String(row[productCol] || '').split(' ')[0];
        counts.set(prod, (counts.get(prod) || 0) + 1);
      });
      const total = rows.length;
      categoryDistribution = Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, value]) => ({
          name: name || 'Unknown',
          value,
          percentage: Math.round((value / total) * 100)
        }));
    }

    // ABC Classification
    let abcClassification: any[] = [];
    if (revenueCol && productCol) {
      const productRevenue = new Map<string, number>();
      rows.forEach(row => {
        const prod = row[productCol];
        const rev = parseFloat(row[revenueCol]) || 0;
        productRevenue.set(prod, (productRevenue.get(prod) || 0) + rev);
      });
      
      const sorted = Array.from(productRevenue.entries()).sort((a, b) => b[1] - a[1]);
      const total = sorted.reduce((sum, [, v]) => sum + v, 0);
      let cumulative = 0;
      let aCount = 0, bCount = 0, cCount = 0;
      
      sorted.forEach(([, rev]) => {
        cumulative += rev;
        const pct = cumulative / total;
        if (pct <= 0.8) aCount++;
        else if (pct <= 0.95) bCount++;
        else cCount++;
      });
      
      abcClassification = [
        { name: 'Class A', value: aCount, percentage: Math.round((aCount / sorted.length) * 100) },
        { name: 'Class B', value: bCount, percentage: Math.round((bCount / sorted.length) * 100) },
        { name: 'Class C', value: cCount, percentage: Math.round((cCount / sorted.length) * 100) }
      ];
    }

    // Radar metrics
    const radarMetrics = [
      { subject: 'Sales', A: Math.round(Math.random() * 40 + 60), B: Math.round(Math.random() * 30 + 50), fullMark: 100 },
      { subject: 'Inventory', A: Math.round(Math.random() * 40 + 60), B: Math.round(Math.random() * 30 + 50), fullMark: 100 },
      { subject: 'Forecast', A: Math.round(Math.random() * 40 + 60), B: Math.round(Math.random() * 30 + 50), fullMark: 100 },
      { subject: 'Orders', A: Math.round(Math.random() * 40 + 60), B: Math.round(Math.random() * 30 + 50), fullMark: 100 },
      { subject: 'Customers', A: Math.round(Math.random() * 40 + 60), B: Math.round(Math.random() * 30 + 50), fullMark: 100 },
      { subject: 'Growth', A: Math.round(Math.random() * 40 + 60), B: Math.round(Math.random() * 30 + 50), fullMark: 100 }
    ];

    // Funnel data
    const funnelData = [
      { name: 'Total Visitors', value: rows.length * 10, fill: '#6366f1' },
      { name: 'Product Views', value: Math.round(rows.length * 8.5), fill: '#8b5cf6' },
      { name: 'Add to Cart', value: Math.round(rows.length * 5.2), fill: '#a855f7' },
      { name: 'Checkout', value: Math.round(rows.length * 3.1), fill: '#d946ef' },
      { name: 'Purchase', value: rows.length, fill: '#ec4899' }
    ];

    // Heatmap data
    let heatmapData: any[] = [];
    if (categoryCol && dateCol) {
      const timeGroups = new Map<string, Map<string, number>>();
      rows.forEach(row => {
        const cat = row[categoryCol] || 'Unknown';
        const date = new Date(row[dateCol]);
        const timeKey = isNaN(date.getTime()) ? 'Unknown' : date.toLocaleString('default', { month: 'short' });
        
        if (!timeGroups.has(timeKey)) timeGroups.set(timeKey, new Map());
        const catMap = timeGroups.get(timeKey)!;
        catMap.set(cat, (catMap.get(cat) || 0) + 1);
      });
      
      heatmapData = [];
      timeGroups.forEach((cats, time) => {
        cats.forEach((value, cat) => {
          heatmapData.push({ x: time, y: cat, value });
        });
      });
    }

    // Top products
    let topProducts: any[] = [];
    if (productCol && revenueCol) {
      const productStats = new Map<string, { sales: number; quantity: number }>();
      rows.forEach(row => {
        const prod = row[productCol];
        const rev = parseFloat(row[revenueCol]) || 0;
        const qty = quantityCol ? parseFloat(row[quantityCol]) || 1 : 1;
        const existing = productStats.get(prod) || { sales: 0, quantity: 0 };
        existing.sales += rev;
        existing.quantity += qty;
        productStats.set(prod, existing);
      });
      
      topProducts = Array.from(productStats.entries())
        .sort((a, b) => b[1].sales - a[1].sales)
        .slice(0, 8)
        .map(([name, stats]) => ({
          name: name.length > 20 ? name.substring(0, 20) + '...' : name,
          sales: Math.round(stats.sales),
          quantity: stats.quantity,
          growth: Math.round((Math.random() * 40 - 10) * 10) / 10
        }));
    }

    // Regional data
    let regionalData: any[] = [];
    if (regionCol) {
      const regionStats = new Map<string, { sales: number; orders: number; customers: Set<string> }>();
      rows.forEach(row => {
        const reg = row[regionCol] || 'Unknown';
        const rev = revenueCol ? parseFloat(row[revenueCol]) || 0 : 0;
        const cust = customerCol ? row[customerCol] : null;
        
        const existing = regionStats.get(reg) || { sales: 0, orders: 0, customers: new Set() };
        existing.sales += rev;
        existing.orders += 1;
        if (cust) existing.customers.add(cust);
        regionStats.set(reg, existing);
      });
      
      regionalData = Array.from(regionStats.entries()).map(([region, stats]) => ({
        region,
        sales: Math.round(stats.sales),
        orders: stats.orders,
        customers: stats.customers.size
      }));
    }

    // Inventory by category
    let inventoryByCategory: any[] = [];
    if (categoryCol) {
      const catStats = new Map<string, { value: number; count: number }>();
      rows.forEach(row => {
        const cat = row[categoryCol] || 'Unknown';
        const val = revenueCol ? parseFloat(row[revenueCol]) || 0 : 0;
        const existing = catStats.get(cat) || { value: 0, count: 0 };
        existing.value += val;
        existing.count += 1;
        catStats.set(cat, existing);
      });
      
      inventoryByCategory = Array.from(catStats.entries())
        .sort((a, b) => b[1].value - a[1].value)
        .slice(0, 6)
        .map(([category, stats]) => ({
          category,
          value: Math.round(stats.value),
          turnover: Math.round((stats.count / stats.value) * 1000) / 10
        }));
    }

    // Calculate KPIs
    const totalRevenue = revenueCol ? rows.reduce((sum, r) => sum + (parseFloat(r[revenueCol]) || 0), 0) : 0;
    const uniqueCustomers = customerCol ? new Set(rows.map(r => r[customerCol])).size : Math.round(rows.length * 0.3);
    const uniqueProducts = productCol ? new Set(rows.map(r => r[productCol])).size : Math.round(rows.length * 0.5);

    const newDashboardData: DashboardData = {
      totalOrders: rows.length,
      ordersChange: Math.round((Math.random() * 20 - 5) * 10) / 10,
      revenue: Math.round(totalRevenue),
      revenueChange: Math.round((Math.random() * 15 - 2) * 10) / 10,
      customers: uniqueCustomers,
      customersChange: Math.round((Math.random() * 10 - 2) * 10) / 10,
      products: uniqueProducts,
      productsChange: Math.round((Math.random() * 8 - 3) * 10) / 10,
      forecastAccuracy: Math.round((85 + Math.random() * 10) * 10) / 10,
      accuracyChange: Math.round((Math.random() * 5) * 10) / 10,
      inventoryValue: Math.round(totalRevenue * 0.4),
      inventoryChange: Math.round((Math.random() * 12 - 2) * 10) / 10,
      revenueTrend,
      categoryDistribution,
      abcClassification,
      performanceMetrics: [
        { name: 'Sales', actual: Math.round(Math.random() * 20 + 80), target: 85 },
        { name: 'Orders', actual: Math.round(Math.random() * 20 + 75), target: 80 },
        { name: 'Inventory', actual: Math.round(Math.random() * 20 + 85), target: 90 },
        { name: 'Forecast', actual: Math.round(Math.random() * 15 + 88), target: 85 }
      ],
      radarMetrics,
      funnelData,
      sankeyData: [],
      heatmapData,
      topProducts,
      regionalData,
      monthlyComparison: [],
      inventoryByCategory
    };

    setDashboardData(newDashboardData);
    setHasRealData(true);
  }, []);

  const addUploadedFile = useCallback((file: Omit<UploadedData, 'id' | 'uploadedAt'>) => {
    const newFile: UploadedData = {
      ...file,
      id: Math.random().toString(36).substring(2, 9),
      uploadedAt: new Date()
    };
    
    setUploadedFiles(prev => [newFile, ...prev]);
    setCurrentData(newFile);
    generateDashboardData(newFile);

    const { materials: parsedMaterials, historicalData: parsedHistoricalData } = parseFileToContextData(newFile);
    if (parsedMaterials.length > 0) {
      setMaterials(parsedMaterials);
      setHistoricalData(parsedHistoricalData);
      setHasRealData(true);
    }
  }, [generateDashboardData, parseFileToContextData]);

  const clearAllData = useCallback(() => {
    setUploadedFiles([]);
    setCurrentData(null);
    setDashboardData(defaultDashboardData);
    setHasRealData(false);
    setMaterials([]);
    setHistoricalData({});
    localStorage.removeItem('tenchi-uploaded-data');
  }, []);
  
  const value = useMemo(() => ({
    customers,
    materials,
    orders,
    kpis,
    historicalData,
    months: MONTHS,
    alerts,
    hasUploadedData: orders.length > 0 || customers.length > 0 || uploadedFiles.length > 0,
    hasRealData,
    isLoading,
    error,
    refreshData,
    updateData,
    clearUploadedData,
    excelPreviewData,
    setExcelPreviewData,
    demandTrend,
    uploadedFiles,
    currentData,
    dashboardData,
    addUploadedFile,
    setCurrentData,
    clearAllData,
    generateDashboardData,
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
    uploadedFiles,
    currentData,
    dashboardData,
    hasRealData,
    addUploadedFile,
    clearAllData,
    generateDashboardData,
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
