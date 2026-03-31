'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { parseUploadedData } from '@/lib/uploadDataStore';
import { analyzeData, AnalyzedData, compareDatasets, combineDatasets } from '@/lib/dataAnalyzer';

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
  sheetName?: string;
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
  
  // Data source info
  dataSource: string;
  calculatedAt: string;
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
  dataSource: 'none',
  calculatedAt: '',
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
  fileAnalyses: Map<string, AnalyzedData>;
  addUploadedFile: (file: Omit<UploadedData, 'id' | 'uploadedAt'>) => void;
  setCurrentData: (data: UploadedData | null) => void;
  clearAllData: () => void;
  generateDashboardData: (data: UploadedData) => void;
  getFileComparison: () => { id: string; name: string; revenue: number; orders: number; customers: number; products: number; quantity: number }[];
  getCombinedAnalysis: () => AnalyzedData | null;
  viewMode: 'single' | 'combined' | 'comparison';
  setViewMode: (mode: 'single' | 'combined' | 'comparison') => void;
  selectedFiles: string[];
  toggleFileSelection: (fileId: string) => void;
  selectAllFiles: () => void;
  deselectAllFiles: () => void;
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
  fileAnalyses: new Map(),
  addUploadedFile: () => {},
  setCurrentData: () => {},
  clearAllData: () => {},
  generateDashboardData: () => {},
  getFileComparison: () => [],
  getCombinedAnalysis: () => null,
  viewMode: 'single',
  setViewMode: () => {},
  selectedFiles: [],
  toggleFileSelection: () => {},
  selectAllFiles: () => {},
  deselectAllFiles: () => {},
});

// Provider component
export function DataProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [excelPreviewData, setExcelPreviewData] = useState<any>(null);
  const [hasRealData, setHasRealData] = useState(false);
  const [viewMode, setViewMode] = useState<'single' | 'combined' | 'comparison'>('single');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  
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
  const [fileAnalyses, setFileAnalyses] = useState<Map<string, AnalyzedData>>(new Map());

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
        if (parsed.fileAnalyses) {
          setFileAnalyses(new Map(Object.entries(parsed.fileAnalyses)));
        }
      } catch (e) {
        console.error('Failed to load saved data:', e);
      }
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    if (uploadedFiles.length > 0 || currentData) {
      const fileAnalysesObj = Object.fromEntries(fileAnalyses);
      localStorage.setItem('tenchi-uploaded-data', JSON.stringify({
        files: uploadedFiles,
        current: currentData,
        dashboard: dashboardData,
        materials,
        historicalData,
        fileAnalyses: fileAnalysesObj
      }));
    }
  }, [uploadedFiles, currentData, dashboardData, materials, historicalData, fileAnalyses]);
  
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
    setFileAnalyses(new Map());
    setHasRealData(false);
    setMaterials([]);
    setHistoricalData({});
    setSelectedFiles([]);
    setViewMode('single');
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

  const generateDashboardData = useCallback((data: UploadedData) => {
    // Use the real data analyzer - NO RANDOM VALUES
    const analysis = analyzeData(data.headers, data.rows, data.name);
    
    // Store analysis for this file
    setFileAnalyses(prev => new Map(prev).set(data.id, analysis));

    // Build revenue trend from actual monthly data
    const revenueTrend = analysis.monthlyRevenue.map(m => ({
      name: m.month,
      revenue: m.revenue,
      orders: m.orders,
      forecast: Math.round(m.revenue * 1.05) // 5% growth projection based on actual
    }));

    // Category distribution from actual data
    const categoryDistribution = analysis.revenueByCategory;

    // ABC Classification from actual data
    const abcClassification = analysis.abcClassification;

    // Top products from actual data (no random growth)
    const topProducts = analysis.topProducts.map(p => ({
      ...p,
      growth: 0 // Real growth would need historical comparison
    }));

    // Regional data from actual data
    const regionalData = analysis.revenueByRegion;

    // Calculate changes based on actual data trends (not random)
    // If we have multiple months, calculate real trend
    let ordersChange = 0;
    let revenueChange = 0;
    let customersChange = 0;
    let productsChange = 0;
    let accuracyChange = 0;
    let inventoryChange = 0;

    if (analysis.monthlyRevenue.length >= 2) {
      const firstMonth = analysis.monthlyRevenue[0];
      const lastMonth = analysis.monthlyRevenue[analysis.monthlyRevenue.length - 1];
      revenueChange = firstMonth.revenue > 0 
        ? Math.round(((lastMonth.revenue - firstMonth.revenue) / firstMonth.revenue) * 1000) / 10
        : 0;
      ordersChange = firstMonth.orders > 0
        ? Math.round(((lastMonth.orders - firstMonth.orders) / firstMonth.orders) * 1000) / 10
        : 0;
    }

    const newDashboardData: DashboardData = {
      totalOrders: analysis.totalOrders,
      ordersChange,
      revenue: analysis.totalRevenue,
      revenueChange,
      customers: analysis.uniqueCustomers,
      customersChange,
      products: analysis.uniqueProducts,
      productsChange,
      forecastAccuracy: analysis.forecastAccuracy || 0,
      accuracyChange,
      inventoryValue: analysis.inventoryValue,
      inventoryChange,
      revenueTrend: revenueTrend.length > 0 ? revenueTrend : 
        // Fallback if no date column: split data into periods
        Array.from({ length: 6 }, (_, i) => {
          const chunkSize = Math.ceil(data.rows.length / 6);
          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, data.rows.length);
          const chunkRevenue = analysis.revenueColumn 
            ? data.rows.slice(start, end).reduce((sum, r) => sum + (parseFloat(r[analysis.revenueColumn!]) || 0), 0)
            : 0;
          return {
            name: `Period ${i + 1}`,
            revenue: Math.round(chunkRevenue),
            orders: end - start,
            forecast: Math.round(chunkRevenue * 1.05)
          };
        }),
      categoryDistribution,
      abcClassification,
      performanceMetrics: [
        { name: 'Sales', actual: analysis.totalRevenue > 0 ? 100 : 0, target: 85 },
        { name: 'Orders', actual: analysis.totalOrders > 0 ? 100 : 0, target: 80 },
        { name: 'Inventory', actual: analysis.inventoryValue > 0 ? 100 : 0, target: 90 },
        { name: 'Forecast', actual: analysis.forecastAccuracy || 0, target: 85 }
      ],
      radarMetrics: [
        { subject: 'Sales', A: Math.min(100, Math.round(analysis.totalRevenue / 10000)), B: 50, fullMark: 100 },
        { subject: 'Inventory', A: Math.min(100, Math.round(analysis.inventoryValue / 10000)), B: 50, fullMark: 100 },
        { subject: 'Forecast', A: analysis.forecastAccuracy || 50, B: 50, fullMark: 100 },
        { subject: 'Orders', A: Math.min(100, analysis.totalOrders), B: 50, fullMark: 100 },
        { subject: 'Customers', A: Math.min(100, analysis.uniqueCustomers), B: 50, fullMark: 100 },
        { subject: 'Products', A: Math.min(100, analysis.uniqueProducts), B: 50, fullMark: 100 }
      ],
      funnelData: [
        { name: 'Total Orders', value: analysis.totalOrders, fill: '#6366f1' },
        { name: 'Unique Customers', value: analysis.uniqueCustomers, fill: '#8b5cf6' },
        { name: 'Unique Products', value: analysis.uniqueProducts, fill: '#a855f7' },
        { name: 'Categories', value: analysis.uniqueCategories, fill: '#d946ef' },
        { name: 'Regions', value: analysis.uniqueRegions, fill: '#ec4899' }
      ],
      sankeyData: [],
      heatmapData: [], // Would need time-based category data
      topProducts,
      regionalData,
      monthlyComparison: analysis.monthlyRevenue.map((m, i, arr) => ({
        month: m.month,
        current: m.revenue,
        previous: i > 0 ? arr[i - 1].revenue : m.revenue
      })),
      inventoryByCategory: analysis.revenueByCategory.map(c => ({
        category: c.name,
        value: c.value,
        turnover: c.percentage
      })),
      dataSource: data.name,
      calculatedAt: new Date().toISOString()
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
    
    // Auto-select the new file
    setSelectedFiles(prev => [...prev, newFile.id]);
  }, [generateDashboardData, parseFileToContextData]);

  const clearAllData = useCallback(() => {
    setUploadedFiles([]);
    setCurrentData(null);
    setDashboardData(defaultDashboardData);
    setFileAnalyses(new Map());
    setHasRealData(false);
    setMaterials([]);
    setHistoricalData({});
    setSelectedFiles([]);
    setViewMode('single');
    localStorage.removeItem('tenchi-uploaded-data');
  }, []);

  // Get comparison data for all uploaded files
  const getFileComparison = useCallback(() => {
    return uploadedFiles.map(file => {
      const analysis = fileAnalyses.get(file.id);
      return {
        id: file.id,
        name: file.name,
        revenue: analysis?.totalRevenue || 0,
        orders: analysis?.totalOrders || file.rows.length,
        customers: analysis?.uniqueCustomers || 0,
        products: analysis?.uniqueProducts || 0,
        quantity: analysis?.totalQuantity || 0
      };
    });
  }, [uploadedFiles, fileAnalyses]);

  // Get combined analysis of all files
  const getCombinedAnalysis = useCallback((): AnalyzedData | null => {
    if (uploadedFiles.length === 0) return null;
    if (uploadedFiles.length === 1) {
      return fileAnalyses.get(uploadedFiles[0].id) || null;
    }

    // Combine all rows from all files
    const allRows = uploadedFiles.flatMap(f => f.rows);
    const allHeaders = uploadedFiles[0]?.headers || [];
    
    return analyzeData(allHeaders, allRows, `Combined (${uploadedFiles.length} files)`);
  }, [uploadedFiles, fileAnalyses]);

  // File selection handlers
  const toggleFileSelection = useCallback((fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  }, []);

  const selectAllFiles = useCallback(() => {
    setSelectedFiles(uploadedFiles.map(f => f.id));
  }, [uploadedFiles]);

  const deselectAllFiles = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  // Update dashboard when view mode changes
  useEffect(() => {
    if (viewMode === 'combined' && uploadedFiles.length > 1) {
      const combined = getCombinedAnalysis();
      if (combined) {
        // Build dashboard from combined analysis
        const revenueTrend = combined.monthlyRevenue.map(m => ({
          name: m.month,
          revenue: m.revenue,
          orders: m.orders,
          forecast: Math.round(m.revenue * 1.05)
        }));

        setDashboardData(prev => ({
          ...prev,
          totalOrders: combined.totalOrders,
          revenue: combined.totalRevenue,
          customers: combined.uniqueCustomers,
          products: combined.uniqueProducts,
          forecastAccuracy: combined.forecastAccuracy || 0,
          inventoryValue: combined.inventoryValue,
          revenueTrend: revenueTrend.length > 0 ? revenueTrend : prev.revenueTrend,
          categoryDistribution: combined.revenueByCategory,
          abcClassification: combined.abcClassification,
          topProducts: combined.topProducts.map(p => ({ ...p, growth: 0 })),
          regionalData: combined.revenueByRegion,
          dataSource: `Combined (${uploadedFiles.length} files)`,
          calculatedAt: new Date().toISOString()
        }));
      }
    } else if (viewMode === 'single' && currentData) {
      // Regenerate for current file
      generateDashboardData(currentData);
    }
  }, [viewMode, uploadedFiles.length, currentData, getCombinedAnalysis, generateDashboardData]);
  
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
    fileAnalyses,
    addUploadedFile,
    setCurrentData,
    clearAllData,
    generateDashboardData,
    getFileComparison,
    getCombinedAnalysis,
    viewMode,
    setViewMode,
    selectedFiles,
    toggleFileSelection,
    selectAllFiles,
    deselectAllFiles,
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
    fileAnalyses,
    hasRealData,
    addUploadedFile,
    clearAllData,
    generateDashboardData,
    getFileComparison,
    getCombinedAnalysis,
    viewMode,
    selectedFiles,
    toggleFileSelection,
    selectAllFiles,
    deselectAllFiles,
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
