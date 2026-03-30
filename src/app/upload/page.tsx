'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileSpreadsheet, X, CheckCircle2, AlertCircle, Loader2,
  ArrowRight, Database, Sparkles, Eye, Download, FileJson,
  Table, Trash2, RefreshCw, CheckCircle, TrendingUp, BarChart3,
  PieChart, Users, DollarSign, Package, Calendar, Hash, FileText,
  Brain, Activity, Zap, ChevronDown, ChevronUp, ArrowUpRight,
  ArrowDownRight, Target, Layers
} from 'lucide-react';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { useData } from '@/lib/DataContext';
import Link from 'next/link';

interface ColumnInsight {
  name: string;
  type: 'numeric' | 'text' | 'date' | 'category';
  uniqueValues: number;
  nullCount: number;
  sampleValues: any[];
  stats?: {
    min?: number;
    max?: number;
    avg?: number;
    sum?: number;
  };
}

interface DataInsights {
  totalRows: number;
  totalColumns: number;
  numericColumns: string[];
  textColumns: string[];
  dateColumns: string[];
  categoryColumns: string[];
  columnInsights: ColumnInsight[];
  estimatedRevenue?: number;
  estimatedOrders?: number;
  estimatedProducts?: number;
  estimatedCustomers?: number;
  dateRange?: { start: string; end: string };
  topCategories?: { name: string; count: number }[];
}

interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  data?: any;
  preview?: any[];
  headers?: string[];
  totalRows?: number;
  insights?: DataInsights;
  processingStage?: string;
}

// Analyze data to generate insights
const analyzeData = (rows: any[], headers: string[]): DataInsights => {
  const insights: DataInsights = {
    totalRows: rows.length,
    totalColumns: headers.length,
    numericColumns: [],
    textColumns: [],
    dateColumns: [],
    categoryColumns: [],
    columnInsights: [],
  };

  headers.forEach(header => {
    const values = rows.map(r => r[header]).filter(v => v !== null && v !== undefined && v !== '');
    const uniqueValues = Array.from(new Set(values));
    const nullCount = rows.length - values.length;
    
    // Determine column type
    let type: 'numeric' | 'text' | 'date' | 'category' = 'text';
    let stats = undefined;

    // Check if numeric
    const numericValues = values.map(v => typeof v === 'string' ? parseFloat(v.replace(/[^0-9.-]/g, '')) : v).filter(v => !isNaN(v));
    if (numericValues.length / values.length > 0.7) {
      type = 'numeric';
      const sum = numericValues.reduce((a, b) => a + b, 0);
      stats = {
        min: Math.min(...numericValues),
        max: Math.max(...numericValues),
        avg: sum / numericValues.length,
        sum: sum,
      };
      insights.numericColumns.push(header);
    } else {
      // Check if date
      const dateValues = values.map(v => new Date(v)).filter(d => !isNaN(d.getTime()));
      if (dateValues.length / values.length > 0.7) {
        type = 'date';
        insights.dateColumns.push(header);
      } else if (uniqueValues.length / values.length < 0.3 && uniqueValues.length < 50) {
        type = 'category';
        insights.categoryColumns.push(header);
      } else {
        insights.textColumns.push(header);
      }
    }

    insights.columnInsights.push({
      name: header,
      type,
      uniqueValues: uniqueValues.length,
      nullCount,
      sampleValues: values.slice(0, 3),
      stats,
    });
  });

  // Find key columns for estimates
  const revenueCol = insights.numericColumns.find(h => 
    h.toLowerCase().includes('revenue') || h.toLowerCase().includes('sales') || 
    h.toLowerCase().includes('amount') || h.toLowerCase().includes('total')
  );
  const quantityCol = insights.numericColumns.find(h => 
    h.toLowerCase().includes('quantity') || h.toLowerCase().includes('qty') || 
    h.toLowerCase().includes('count') || h.toLowerCase().includes('units')
  );
  const productCol = headers.find(h => 
    h.toLowerCase().includes('product') || h.toLowerCase().includes('item') || 
    h.toLowerCase().includes('sku') || h.toLowerCase().includes('name')
  );
  const customerCol = headers.find(h => 
    h.toLowerCase().includes('customer') || h.toLowerCase().includes('client') || 
    h.toLowerCase().includes('buyer')
  );
  const dateCol = insights.dateColumns[0];
  const categoryCol = insights.categoryColumns[0];

  // Calculate estimates
  if (revenueCol) {
    const revenues = rows.map(r => parseFloat(r[revenueCol]) || 0);
    insights.estimatedRevenue = revenues.reduce((a, b) => a + b, 0);
  }
  if (quantityCol) {
    const qtys = rows.map(r => parseFloat(r[quantityCol]) || 0);
    insights.estimatedOrders = qtys.reduce((a, b) => a + b, 0);
  } else {
    insights.estimatedOrders = rows.length;
  }
  if (productCol) {
    const products = Array.from(new Set(rows.map(r => r[productCol])));
    insights.estimatedProducts = products.length;
  }
  if (customerCol) {
    const customers = Array.from(new Set(rows.map(r => r[customerCol])));
    insights.estimatedCustomers = customers.length;
  }

  // Date range
  if (dateCol) {
    const dates = rows.map(r => new Date(r[dateCol])).filter(d => !isNaN(d.getTime()));
    if (dates.length > 0) {
      insights.dateRange = {
        start: new Date(Math.min(...dates.map(d => d.getTime()))).toLocaleDateString(),
        end: new Date(Math.max(...dates.map(d => d.getTime()))).toLocaleDateString(),
      };
    }
  }

  // Top categories
  if (categoryCol) {
    const catCounts: Record<string, number> = {};
    rows.forEach(r => {
      const cat = r[categoryCol];
      if (cat) catCounts[cat] = (catCounts[cat] || 0) + 1;
    });
    insights.topCategories = Object.entries(catCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }

  return insights;
};

export default function UploadPage() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadFile | null>(null);
  const [expandedInsights, setExpandedInsights] = useState<string | null>(null);
  const { addUploadedFile, hasRealData, currentData } = useData();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')
    );
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
  }, []);

  const addFiles = (newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      name: file.name,
      size: file.size,
      status: 'pending',
      progress: 0,
    }));
    setFiles(prev => [...prev, ...uploadFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (previewFile?.id === id) setPreviewFile(null);
  };

  const updateFileProgress = (id: string, progress: number, stage?: string) => {
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, progress, processingStage: stage } : f
    ));
  };

  const updateFileStatus = (id: string, status: UploadFile['status'], data?: any) => {
    setFiles(prev => prev.map(f => {
      if (f.id !== id) return f;
      const newData = { ...f, status, ...data };
      if (data?.preview && data?.headers) {
        newData.insights = analyzeData(data.preview, data.headers);
      }
      return newData;
    }));
  };

  const uploadFile = async (file: UploadFile) => {
    updateFileStatus(file.id, 'uploading');

    try {
      // Simulate progress stages
      const stages = ['Reading file...', 'Parsing data...', 'Analyzing columns...', 'Generating insights...'];
      for (let i = 0; i <= 40; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 150));
        updateFileProgress(file.id, i, stages[Math.floor(i / 10)]);
      }

      updateFileStatus(file.id, 'processing');

      const formData = new FormData();
      formData.append('file', file.file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process file');
      }

      const data = await response.json();

      for (let i = 50; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        updateFileProgress(file.id, i);
      }

      // Update with completed status and insights
      const allRows = data.allRows || data.previewRows || [];
      updateFileStatus(file.id, 'completed', {
        data,
        preview: data.previewRows || allRows.slice(0, 100),
        headers: data.headers,
        totalRows: data.totalRows || allRows.length,
      });

      // Save to global context for dashboard
      const fileType = file.name.endsWith('.csv') ? 'csv' : 'xlsx';
      if (typeof addUploadedFile === 'function') {
        addUploadedFile({
          name: file.name,
          headers: data.headers,
          rows: allRows,
          fileType: fileType as 'xlsx' | 'csv',
        });
      }

    } catch (error) {
      console.error('Upload error:', error);
      updateFileStatus(file.id, 'error', {
        error: error instanceof Error ? error.message : 'Failed to process file'
      });
    }
  };

  const handleUploadAll = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    for (const file of pendingFiles) {
      await uploadFile(file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatNumber = (num?: number) => {
    if (num === undefined || isNaN(num)) return 'N/A';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const exportToJSON = (file: UploadFile) => {
    if (!file.data) return;
    const blob = new Blob([JSON.stringify(file.data.allRows || file.data.previewRows, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace(/\.[^/.]+$/, '')}_export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = (file: UploadFile) => {
    if (!file.data || !file.headers) return;
    const rows = file.data.allRows || file.data.previewRows;
    const headers = file.headers;
    const csvContent = [
      headers.join(','),
      ...rows.map((row: any) => headers.map(h => `"${row[h] ?? ''}"`).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace(/\.[^/.]+$/, '')}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const completedFiles = files.filter(f => f.status === 'completed');
  const totalRows = completedFiles.reduce((sum, f) => sum + (f.totalRows || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Success Banner */}
      <AnimatePresence>
        {hasRealData && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-emerald-400 font-medium">Data loaded successfully!</p>
                  <p className="text-emerald-400/70 text-sm">
                    {currentData?.name} | {currentData?.rows.length.toLocaleString()} rows | Dashboard updated
                  </p>
                </div>
              </div>
              <Link
                href="/"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
              >
                View Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Upload Data</h1>
        <p className="text-slate-400 mt-2">
          Upload Excel or CSV files for AI-powered data processing and real-time dashboard updates
        </p>
      </div>

      {/* Stats Overview */}
      {completedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          {[
            { icon: FileText, label: 'Files', value: completedFiles.length, color: 'indigo' },
            { icon: Hash, label: 'Total Rows', value: formatNumber(totalRows), color: 'emerald' },
            { icon: BarChart3, label: 'Columns', value: formatNumber(completedFiles[0]?.headers?.length), color: 'amber' },
            { icon: Activity, label: 'Status', value: 'Active', color: 'rose' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
                <span className="text-slate-400 text-sm">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Drop Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
            ${isDragging 
              ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' 
              : 'border-white/20 hover:border-white/40 hover:bg-white/5'
            }
          `}
        >
          <input
            type="file"
            multiple
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <motion.div 
            className="p-5 rounded-full bg-indigo-500/10 w-fit mx-auto mb-4"
            animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
          >
            <Upload className="w-10 h-10 text-indigo-400" />
          </motion.div>
          <p className="text-white font-semibold text-lg mb-2">
            Drop files here or click to browse
          </p>
          <p className="text-slate-500">
            Supports .xlsx, .xls, and .csv files up to 50MB
          </p>
        </div>
      </motion.div>

      {/* File List with Insights */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* File Cards */}
            {files.map((file) => (
              <motion.div
                key={file.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
              >
                {/* File Header */}
                <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5">
                  <div className="p-3 rounded-xl bg-indigo-500/10">
                    <FileSpreadsheet className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-semibold text-white truncate">{file.name}</p>
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <span>{formatFileSize(file.size)}</span>
                      {file.totalRows && (
                        <>
                          <span>|</span>
                          <span>{file.totalRows.toLocaleString()} rows</span>
                        </>
                      )}
                      {file.headers && (
                        <>
                          <span>|</span>
                          <span>{file.headers.length} columns</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.status === 'completed' && (
                      <>
                        <button
                          onClick={() => setPreviewFile(file)}
                          className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => exportToCSV(file)}
                          className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                          title="Export CSV"
                        >
                          <Table className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setExpandedInsights(expandedInsights === file.id ? null : file.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                          title="View Insights"
                        >
                          {expandedInsights === file.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </>
                    )}
                    {file.status === 'pending' && (
                      <button
                        onClick={() => uploadFile(file)}
                        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Process
                      </button>
                    )}
                    {file.status === 'uploading' && (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                        <span className="text-sm text-slate-400">{file.progress}%</span>
                      </div>
                    )}
                    {file.status === 'processing' && (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                        <span className="text-sm text-amber-400">AI Processing</span>
                      </div>
                    )}
                    {file.status === 'completed' && (
                      <div className="flex items-center gap-1.5 text-emerald-400 px-3">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm font-medium">Done</span>
                      </div>
                    )}
                    {file.status === 'error' && (
                      <div className="flex items-center gap-1.5 text-rose-400">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm">Failed</span>
                      </div>
                    )}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                {(file.status === 'uploading' || file.status === 'processing') && (
                  <div className="px-6 py-3 bg-white/[0.02]">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${file.progress}%` }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                      />
                    </div>
                    {file.processingStage && (
                      <p className="text-xs text-slate-400 mt-2">{file.processingStage}</p>
                    )}
                  </div>
                )}

                {/* Error Message */}
                {file.error && (
                  <div className="px-6 py-3 bg-rose-500/10 border-t border-rose-500/20">
                    <p className="text-rose-400 text-sm">{file.error}</p>
                  </div>
                )}

                {/* Data Insights Panel */}
                <AnimatePresence>
                  {expandedInsights === file.id && file.insights && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 overflow-hidden"
                    >
                      <div className="p-6 bg-slate-900/50">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          {[
                            { icon: Hash, label: 'Total Rows', value: formatNumber(file.insights.totalRows), color: 'indigo' },
                            { icon: BarChart3, label: 'Columns', value: file.insights.totalColumns, color: 'emerald' },
                            { icon: DollarSign, label: 'Est. Revenue', value: file.insights.estimatedRevenue ? `$${formatNumber(file.insights.estimatedRevenue)}` : 'N/A', color: 'amber' },
                            { icon: Package, label: 'Products', value: formatNumber(file.insights.estimatedProducts), color: 'rose' },
                          ].map((metric, i) => (
                            <div key={i} className="bg-white/5 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <metric.icon className={`w-4 h-4 text-${metric.color}-400`} />
                                <span className="text-slate-400 text-xs">{metric.label}</span>
                              </div>
                              <p className="text-xl font-bold text-white">{metric.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Column Analysis */}
                        <div className="mb-6">
                          <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <Brain className="w-5 h-5 text-indigo-400" />
                            Column Analysis
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {file.insights.columnInsights.slice(0, 6).map((col, i) => (
                              <div key={i} className="bg-white/5 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-white font-medium text-sm truncate">{col.name}</span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    col.type === 'numeric' ? 'bg-emerald-500/20 text-emerald-400' :
                                    col.type === 'date' ? 'bg-amber-500/20 text-amber-400' :
                                    col.type === 'category' ? 'bg-violet-500/20 text-violet-400' :
                                    'bg-slate-500/20 text-slate-400'
                                  }`}>
                                    {col.type}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-slate-400">
                                  <span>{col.uniqueValues} unique</span>
                                  {col.nullCount > 0 && <span className="text-rose-400">{col.nullCount} nulls</span>}
                                </div>
                                {col.stats && (
                                  <div className="mt-2 pt-2 border-t border-white/5 text-xs text-slate-500">
                                    Min: {formatNumber(col.stats.min)} | Max: {formatNumber(col.stats.max)} | Avg: {formatNumber(col.stats.avg)}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Top Categories */}
                        {file.insights.topCategories && file.insights.topCategories.length > 0 && (
                          <div>
                            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                              <Layers className="w-5 h-5 text-violet-400" />
                              Top Categories
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {file.insights.topCategories.map((cat, i) => (
                                <div key={i} className="bg-violet-500/10 border border-violet-500/20 rounded-lg px-4 py-2">
                                  <span className="text-violet-400 font-medium">{cat.name}</span>
                                  <span className="text-violet-400/60 text-sm ml-2">({cat.count})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {/* Process All Button */}
            {files.some(f => f.status === 'pending') && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleUploadAll}
                className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Process All Files
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {files.length === 0 && !hasRealData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="p-6 rounded-full bg-white/5 w-fit mx-auto mb-6">
            <Database className="w-12 h-12 text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No files uploaded yet</h3>
          <p className="text-slate-400 mb-6">Upload an Excel or CSV file to see AI-powered insights</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { title: 'Sales Data', desc: 'Revenue, orders, products' },
              { title: 'Customer Data', desc: 'Clients, regions, segments' },
              { title: 'Inventory Data', desc: 'Stock levels, SKUs, warehouses' },
            ].map((type, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                <h4 className="text-white font-medium mb-1">{type.title}</h4>
                <p className="text-slate-400 text-sm">{type.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Data Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setPreviewFile(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-7xl max-h-[85vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/95">
                <div>
                  <h3 className="text-lg font-semibold text-white">Data Preview</h3>
                  <p className="text-sm text-slate-400">
                    {previewFile.name} | {previewFile.totalRows?.toLocaleString()} rows | {previewFile.headers?.length} columns
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportToCSV(previewFile)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                  <button
                    onClick={() => setPreviewFile(null)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                {previewFile.preview && previewFile.headers && (
                  <table className="w-full text-sm">
                    <thead className="bg-white/5 sticky top-0 z-10">
                      <tr>
                        {previewFile.headers.map((header) => (
                          <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-slate-300 whitespace-nowrap border-b border-white/10">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {previewFile.preview.map((row, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          {previewFile.headers!.map((header) => (
                            <td key={header} className="px-4 py-2.5 text-slate-400 whitespace-nowrap">
                              {row[header] ?? '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="px-6 py-4 border-t border-white/10 bg-slate-900/95 flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  Showing first {previewFile.preview?.length} of {previewFile.totalRows?.toLocaleString()} rows
                </p>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
