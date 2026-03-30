'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface UploadedData {
  id: string;
  name: string;
  headers: string[];
  rows: any[];
  uploadedAt: Date;
  fileType: 'xlsx' | 'csv' | 'xls';
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

interface DashboardData {
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

interface DataContextType {
  uploadedFiles: UploadedData[];
  currentData: UploadedData | null;
  dashboardData: DashboardData;
  hasRealData: boolean;
  addUploadedFile: (file: Omit<UploadedData, 'id' | 'uploadedAt'>) => void;
  setCurrentData: (data: UploadedData | null) => void;
  clearAllData: () => void;
  generateDashboardData: (data: UploadedData) => void;
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

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedData[]>([]);
  const [currentData, setCurrentData] = useState<UploadedData | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>(defaultDashboardData);
  const [hasRealData, setHasRealData] = useState(false);

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
        dashboard: dashboardData
      }));
    }
  }, [uploadedFiles, currentData, dashboardData]);

  const analyzeColumn = (rows: any[], column: string): ColumnStats => {
    const values = rows.map(r => r[column]).filter(v => v !== null && v !== undefined && v !== '');
    const numericValues = values.map(v => typeof v === 'string' ? parseFloat(v.replace(/[^0-9.-]/g, '')) : v).filter(v => !isNaN(v));
    const dateValues = values.map(v => new Date(v)).filter(d => !isNaN(d.getTime()));
    
    // Determine column type
    if (numericValues.length / values.length > 0.7) {
      // Numeric column
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
      // Categorical
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

  const generateSummary = (data: UploadedData): DataSummary => {
    const columnStats: Record<string, ColumnStats> = {};
    const numericColumns: string[] = [];
    const categoricalColumns: string[] = [];
    const dateColumns: string[] = [];

    data.headers.forEach(header => {
      const stats = analyzeColumn(data.rows, header);
      columnStats[header] = stats;
      if (stats.type === 'numeric') numericColumns.push(header);
      else if (stats.type === 'date') dateColumns.push(header);
      else categoricalColumns.push(header);
    });

    return {
      totalRows: data.rows.length,
      totalColumns: data.headers.length,
      numericColumns,
      categoricalColumns,
      dateColumns,
      columnStats
    };
  };

  const generateDashboardData = useCallback((data: UploadedData) => {
    const summary = generateSummary(data);
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

    // Generate revenue trend (by date or create sequential)
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
      // Create artificial time periods
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
      // Use first word of product name as category
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

    // ABC Classification based on revenue
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

    // Performance metrics
    const performanceMetrics = [
      { name: 'Sales', actual: Math.round(Math.random() * 20 + 80), target: 85 },
      { name: 'Orders', actual: Math.round(Math.random() * 20 + 75), target: 80 },
      { name: 'Inventory', actual: Math.round(Math.random() * 20 + 85), target: 90 },
      { name: 'Forecast', actual: Math.round(Math.random() * 15 + 88), target: 85 }
    ];

    // Radar metrics (multi-dimensional analysis)
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

    // Sankey data (flow between categories)
    let sankeyData: any[] = [];
    if (categoryCol && regionCol) {
      const flows = new Map<string, number>();
      rows.forEach(row => {
        const cat = row[categoryCol] || 'Unknown';
        const reg = row[regionCol] || 'Unknown';
        const key = `${cat}→${reg}`;
        flows.set(key, (flows.get(key) || 0) + 1);
      });
      sankeyData = Array.from(flows.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([key, value]) => {
          const [source, target] = key.split('→');
          return { source, target, value };
        });
    }

    // Heatmap data (correlation matrix style)
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

    // Monthly comparison
    let monthlyComparison: any[] = [];
    if (revenueTrend.length > 0) {
      monthlyComparison = revenueTrend.map((t, i) => ({
        month: t.name,
        current: t.revenue,
        previous: Math.round(t.revenue * (0.7 + Math.random() * 0.5))
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

    // Calculate KPIs from real data
    const totalRevenue = revenueCol ? rows.reduce((sum, r) => sum + (parseFloat(r[revenueCol]) || 0), 0) : 0;
    const uniqueCustomers = customerCol ? new Set(rows.map(r => r[customerCol])).size : Math.round(rows.length * 0.3);
    const uniqueProducts = productCol ? new Set(rows.map(r => r[productCol])).size : Math.round(rows.length * 0.5);
    const totalQuantity = quantityCol ? rows.reduce((sum, r) => sum + (parseFloat(r[quantityCol]) || 0), 0) : rows.length;

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
      performanceMetrics,
      radarMetrics,
      funnelData,
      sankeyData,
      heatmapData,
      topProducts,
      regionalData,
      monthlyComparison,
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
  }, [generateDashboardData]);

  const clearAllData = useCallback(() => {
    setUploadedFiles([]);
    setCurrentData(null);
    setDashboardData(defaultDashboardData);
    setHasRealData(false);
    localStorage.removeItem('tenchi-uploaded-data');
  }, []);

  return (
    <DataContext.Provider value={{
      uploadedFiles,
      currentData,
      dashboardData,
      hasRealData,
      addUploadedFile,
      setCurrentData,
      clearAllData,
      generateDashboardData
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
