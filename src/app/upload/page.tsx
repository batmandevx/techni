'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  Upload, 
  Check, 
  AlertCircle, 
  X, 
  Download, 
  RefreshCw,
  ArrowRight,
  CheckCircle,
  Database,
  TrendingUp,
  FileCheck,
  Sparkles,
  Trash2,
  Users,
  AlertTriangle,
  ShoppingCart,
  Eye,
  Table,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  FileJson,
  BarChart3,
  LayoutGrid,
  Columns,
  Rows,
  FileType,
  Hash,
  Calendar,
  Type,
  CheckSquare,
  Square,
  Cloud,
  FileUp,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useExcelData } from '@/lib/hooks/useLocalStorage';
import { useData } from '@/lib/DataContext';
import toast from 'react-hot-toast';

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value: string;
}

interface UploadResult {
  total: number;
  valid: number;
  errors: number;
  duplicates: number;
  saved: number;
  headers?: string[];
}

interface FileMetadata {
  fileName: string;
  fileSize: number;
  sheetNames: string[];
  activeSheet: string;
  columnCount: number;
  rowCount: number;
  headers: string[];
  columnTypes: Record<string, string>;
  columnStats: Record<string, { unique: number; empty: number; sample: any[] }>;
}

type UploadType = 'orders' | 'customers' | 'inventory' | null;
type ViewMode = 'upload' | 'preview' | 'processing' | 'complete';

const STEPS = [
  { icon: Cloud, label: 'Upload', description: 'Select file' },
  { icon: FileCheck, label: 'Validate', description: 'Check format' },
  { icon: Zap, label: 'Process', description: 'Save data' },
  { icon: CheckCircle, label: 'Complete', description: 'Ready' },
];

const ACCEPTED_FORMATS = {
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'text/csv': ['.csv'],
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function detectDataType(values: any[]): string {
  const nonEmpty = values.filter(v => v !== undefined && v !== null && v !== '');
  if (nonEmpty.length === 0) return 'empty';
  
  const dates = nonEmpty.filter(v => !isNaN(Date.parse(v)));
  if (dates.length / nonEmpty.length > 0.8) return 'date';
  
  const numbers = nonEmpty.filter(v => !isNaN(parseFloat(v)) && isFinite(v));
  if (numbers.length / nonEmpty.length > 0.8) return 'number';
  
  return 'text';
}

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('upload');
  const [result, setResult] = useState<UploadResult | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [uploadType, setUploadType] = useState<UploadType>(null);
  const [detectedType, setDetectedType] = useState<string>('');
  const [previewData, setPreviewData] = useState<{
    headers: string[];
    rows: any[];
    type: 'orders' | 'customers';
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { addOrders, addCustomers, hasData, excelData } = useExcelData();
  const { refreshData } = useData();

  const detectFileType = (headers: string[]): 'orders' | 'customers' | 'unknown' => {
    const headerLower = headers.map(h => h.toLowerCase().replace(/[_\s]/g, ''));
    
    if (headerLower.includes('customername') || headerLower.includes('customer_name') || 
        headerLower.includes('paymentterms') || headerLower.includes('shiptocity')) {
      return 'customers';
    }
    
    if (headerLower.includes('orderid') || headerLower.includes('order_id') || 
        headerLower.includes('materialid') || headerLower.includes('quantity')) {
      return 'orders';
    }
    
    return 'unknown';
  };

  const processExcel = async (file: File): Promise<{ data: any[]; headers: string[]; type: 'orders' | 'customers'; metadata: FileMetadata }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) { reject(new Error('Failed to read file')); return; }
          
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[];
          
          if (jsonData.length < 2) { reject(new Error('File is empty')); return; }

          const headers = (jsonData[0] as string[]).map(h => String(h || '').trim());
          const rows = jsonData.slice(1);
          
          // Build metadata
          const columnTypes: Record<string, string> = {};
          const columnStats: Record<string, { unique: number; empty: number; sample: any[] }> = {};
          
          headers.forEach((header, colIndex) => {
            const colValues = rows.map(row => row[colIndex]).filter(v => v !== undefined);
            columnTypes[header] = detectDataType(colValues);
            const unique = new Set(colValues).size;
            const empty = rows.length - colValues.length;
            columnStats[header] = { unique, empty, sample: colValues.slice(0, 3) };
          });
          
          const metadata: FileMetadata = {
            fileName: file.name,
            fileSize: file.size,
            sheetNames: workbook.SheetNames,
            activeSheet: sheetName,
            columnCount: headers.length,
            rowCount: rows.length,
            headers,
            columnTypes,
            columnStats,
          };
          
          const detectedType = uploadType || detectFileType(headers);
          setDetectedType(detectedType);
          
          if (detectedType === 'customers') {
            const colMap = {
              customerId: headers.findIndex(h => /customerid|customer_id/i.test(h)),
              customerName: headers.findIndex(h => /customername|customer_name|name/i.test(h)),
              salesOrg: headers.findIndex(h => /salesorg|sales_org/i.test(h)),
              distChannel: headers.findIndex(h => /distchannel|distribution|channel/i.test(h)),
              division: headers.findIndex(h => /division/i.test(h)),
              paymentTerms: headers.findIndex(h => /paymentterms|payment_terms/i.test(h)),
              shipToCity: headers.findIndex(h => /shiptocity|ship_to_city|city/i.test(h)),
              country: headers.findIndex(h => /country/i.test(h)),
            };

            const customers = rows.map((row: any, idx: number) => ({
              customerId: row[colMap.customerId] ? String(row[colMap.customerId]).trim() : '',
              customerName: row[colMap.customerName] ? String(row[colMap.customerName]).trim() : '',
              salesOrg: row[colMap.salesOrg] || '1000',
              distChannel: row[colMap.distChannel] || '10',
              division: row[colMap.division] || '0',
              paymentTerms: row[colMap.paymentTerms] || 'D30',
              shipToCity: row[colMap.shipToCity] ? String(row[colMap.shipToCity]).trim() : '',
              country: row[colMap.country] ? String(row[colMap.country]).trim() : '',
              lineNumber: idx + 2,
            })).filter(c => c.customerId);

            resolve({ data: customers, headers, type: 'customers', metadata });
          } else {
            const colMap = {
              orderId: headers.findIndex(h => /orderid|order_id|orderno/i.test(h)),
              orderDate: headers.findIndex(h => /orderdate|order_date|date/i.test(h)),
              customerId: headers.findIndex(h => /customerid|customer_id/i.test(h)),
              materialId: headers.findIndex(h => /materialid|material_id|sku|item/i.test(h)),
              quantity: headers.findIndex(h => /quantity|qty/i.test(h)),
              deliveryDate: headers.findIndex(h => /deliverydate|delivery_date/i.test(h)),
            };

            const orders = rows.map((row: any, idx: number) => {
              const qty = row[colMap.quantity];
              return {
                orderId: row[colMap.orderId] ? String(row[colMap.orderId]).trim() : '',
                orderDate: row[colMap.orderDate] ? new Date(row[colMap.orderDate]) : new Date(),
                customerId: row[colMap.customerId] ? String(row[colMap.customerId]).trim() : '',
                materialId: row[colMap.materialId] ? String(row[colMap.materialId]).trim() : '',
                quantity: typeof qty === 'number' ? qty : parseFloat(qty) || 0,
                deliveryDate: row[colMap.deliveryDate] ? new Date(row[colMap.deliveryDate]) : null,
                lineNumber: idx + 2,
              };
            }).filter(o => o.orderId);

            resolve({ data: orders, headers, type: 'orders', metadata });
          }
        } catch (error) { reject(error); }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const handleConfirmUpload = async () => {
    if (!previewData) return;
    
    setViewMode('processing');
    setCurrentStep(2);
    setProgress(50);
    
    try {
      const validationErrors: ValidationError[] = [];
      const validData: any[] = [];
      const seenIds = new Set<string>();

      previewData.rows.forEach((item: any) => {
        const id = previewData.type === 'customers' ? item.customerId : item.orderId;
        
        if (seenIds.has(id)) {
          validationErrors.push({ 
            row: item.lineNumber, 
            field: previewData.type === 'customers' ? 'Customer_ID' : 'Order_ID', 
            message: `Duplicate ${previewData.type === 'customers' ? 'Customer' : 'Order'} ID`, 
            value: id 
          });
        } else if (!id) {
          validationErrors.push({ 
            row: item.lineNumber, 
            field: previewData.type === 'customers' ? 'Customer_ID' : 'Order_ID', 
            message: 'ID is required', 
            value: '' 
          });
        } else {
          validData.push(item);
          seenIds.add(id);
        }
      });

      setProgress(75);

      if (previewData.type === 'customers') {
        addCustomers(validData, files[0]?.name);
      } else {
        addOrders(validData, files[0]?.name);
      }

      const payload = previewData.type === 'customers' 
        ? { customers: validData, type: 'customers' } 
        : { orders: validData, type: 'orders' };
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resultData = await response.json();

      setProgress(100);
      setCurrentStep(3);

      setResult({
        total: previewData.rows.length,
        valid: validData.length,
        errors: validationErrors.length,
        duplicates: validationErrors.filter(e => e.message.includes('Duplicate')).length,
        saved: resultData.saved || validData.length,
        headers: previewData.headers,
      });

      setErrors(validationErrors);
      setViewMode('complete');
      
      window.dispatchEvent(new CustomEvent('dashboard-refresh'));
      refreshData();

      toast.success(`Successfully uploaded ${validData.length} records!`);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
      setViewMode('upload');
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;
    
    // Validate file type
    const validTypes = ['.xlsx', '.xls', '.csv'];
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!validTypes.includes(fileExt)) {
      toast.error('Invalid file type. Please upload .xlsx, .xls, or .csv files.');
      return;
    }

    setFiles([file]);
    setViewMode('processing');
    setCurrentStep(1);
    setProgress(25);
    
    try {
      const { data, headers, type, metadata } = await processExcel(file);
      setProgress(75);
      
      setPreviewData({ headers, rows: data, type });
      setFileMetadata(metadata);
      setCurrentPage(1);
      setViewMode('preview');
      setProgress(100);
      
      toast.success(`File validated! Found ${data.length} records.`);
    } catch (error) {
      console.error('Preview error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process file');
      setViewMode('upload');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [uploadType]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const reset = () => {
    setFiles([]);
    setViewMode('upload');
    setResult(null);
    setErrors([]);
    setCurrentStep(0);
    setProgress(0);
    setDetectedType('');
    setPreviewData(null);
    setFileMetadata(undefined);
    setCurrentPage(1);
    setUploadType(null);
  };

  const totalPreviewPages = previewData ? Math.ceil(previewData.rows.length / 10) : 1;
  const pageSize = 10;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRows = previewData?.rows.slice(startIndex, startIndex + pageSize) || [];

  const downloadTemplate = async (type: 'orders' | 'customers') => {
    const wb = XLSX.utils.book_new();
    if (type === 'orders') {
      const headers = ['Order_ID', 'Order_Date', 'Customer_ID', 'Material_ID', 'Quantity', 'Status'];
      const sample = [
        ['ORD-001', '2026-01-15', 'CUST-001', 'MAT-001', 500, 'CONFIRMED'],
        ['ORD-002', '2026-02-01', 'CUST-002', 'MAT-002', 300, 'SHIPPED'],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([headers, ...sample]), 'Orders_Template');
    } else {
      const headers = ['Customer_ID', 'Customer_Name', 'Sales_Org', 'Dist_Channel', 'Division', 'Payment_Terms', 'Ship_To_City', 'Country'];
      const sample = [
        ['CUST-001', 'Acme Corp', 'SG01', '10', 'Beverages', 'NET30', 'Singapore', 'Singapore'],
        ['CUST-002', 'Beta Ltd', 'AU01', '10', 'Snacks', 'NET60', 'Sydney', 'Australia'],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([headers, ...sample]), 'Customers_Template');
    }
    XLSX.writeFile(wb, `Tenchi_${type}_template.xlsx`);
    toast.success(`${type === 'orders' ? 'Orders' : 'Customers'} template downloaded!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-800/50"
      >
        <div className="px-6 py-6">
          <h1 className="flex items-center gap-3 text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30">
              <Cloud className="h-6 w-6 text-white" />
            </div>
            Data Import
          </h1>
          <p className="mt-2 text-gray-500 dark:text-slate-400">
            Import orders, customers, or inventory data from Excel files
          </p>
        </div>
      </motion.div>

      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Step Indicator */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentStep;
              const isCurrent = index === currentStep;
              
              return (
                <div key={index} className="flex items-center">
                  <motion.div 
                    initial={false}
                    animate={{ scale: isCurrent ? 1.1 : 1 }}
                    className={`flex flex-col items-center ${index < STEPS.length - 1 ? 'mr-8' : ''}`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30' 
                        : 'bg-gray-200 dark:bg-slate-700'
                    }`}>
                      <Icon className={`h-6 w-6 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-xs font-semibold ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                      <p className="text-[10px] text-gray-400">{step.description}</p>
                    </div>
                  </motion.div>
                  {index < STEPS.length - 1 && (
                    <div className={`w-16 h-1 rounded-full mx-2 transition-all ${
                      index < currentStep ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gray-200 dark:bg-slate-700'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          {viewMode === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              {/* Upload Type Selector */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'orders', label: 'Sales Orders', icon: ShoppingCart, desc: 'Import order data', color: 'indigo' },
                  { id: 'customers', label: 'Customers', icon: Users, desc: 'Customer master data', color: 'emerald' },
                  { id: 'inventory', label: 'Inventory', icon: LayoutGrid, desc: 'Stock levels & data', color: 'amber' },
                ].map((type, i) => (
                  <motion.button
                    key={type.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setUploadType(type.id as UploadType)}
                    className={`p-6 rounded-2xl border-2 transition-all text-left ${
                      uploadType === type.id 
                        ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-500/10 shadow-lg` 
                        : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-${type.color}-100 dark:bg-${type.color}-500/20 flex items-center justify-center mb-3`}>
                      <type.icon className={`h-6 w-6 text-${type.color}-600 dark:text-${type.color}-400`} />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{type.label}</h3>
                    <p className="text-sm text-gray-500">{type.desc}</p>
                  </motion.button>
                ))}
              </div>

              {/* Drop Zone */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => uploadType && fileInputRef.current?.click()}
                className={`relative p-12 rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
                  isDragging 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' 
                    : uploadType
                    ? 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-indigo-400'
                    : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 cursor-not-allowed'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                
                <div className="text-center">
                  <motion.div 
                    animate={{ y: isDragging ? -10 : 0, scale: isDragging ? 1.1 : 1 }}
                    className={`w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center ${
                      uploadType ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/30' : 'bg-gray-200 dark:bg-slate-700'
                    }`}
                  >
                    <Cloud className={`h-12 w-12 ${uploadType ? 'text-white' : 'text-gray-400'}`} />
                  </motion.div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {uploadType ? 'Drop your file here' : 'Select upload type first'}
                  </h3>
                  <p className="text-gray-500 dark:text-slate-400 mb-4">
                    {uploadType ? 'or click to browse from your computer' : 'Choose what type of data you want to upload'}
                  </p>
                  
                  {uploadType && (
                    <div className="flex justify-center gap-2">
                      {['.xlsx', '.xls', '.csv'].map(ext => (
                        <span key={ext} className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-slate-700 text-xs text-gray-600 dark:text-slate-400">
                          {ext}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Template Downloads */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-gray-200 dark:border-slate-700"
              >
                <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Download className="h-4 w-4 text-indigo-500" />
                  Download Templates
                </h4>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => downloadTemplate('orders')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-sm hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Orders Template (.xlsx)
                  </button>
                  <button
                    onClick={() => downloadTemplate('customers')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                  >
                    <Users className="h-4 w-4" />
                    Customers Template (.xlsx)
                  </button>
                </div>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
                  Download and fill in the template, then upload your completed file above.
                </p>
              </motion.div>
            </motion.div>
          )}

          {viewMode === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="relative w-32 h-32 mx-auto mb-8">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200 dark:text-slate-700" />
                  <circle 
                    cx="64" cy="64" r="56" 
                    stroke="url(#gradient)" 
                    strokeWidth="8" 
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${progress * 3.52} 352`}
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#9333ea" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{progress}%</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Processing {files[0]?.name}</h3>
              <p className="text-gray-500 mt-2">{detectedType ? `Detected: ${detectedType}` : 'Analyzing file...'}</p>
            </motion.div>
          )}

          {viewMode === 'preview' && previewData && fileMetadata && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* File Info Card */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <FileSpreadsheet className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{fileMetadata.fileName}</h3>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(fileMetadata.fileSize)} • {fileMetadata.rowCount.toLocaleString()} rows • {fileMetadata.columnCount} columns
                    </p>
                  </div>
                  <button
                    onClick={() => setViewMode('upload')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Data Preview</h4>
                    <p className="text-sm text-gray-500">{previewData.rows.length.toLocaleString()} records found</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('upload')}
                      className="px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmUpload}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all"
                    >
                      Import Data
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-slate-900/50">
                      <tr>
                        {previewData.headers.slice(0, 8).map((header, i) => (
                          <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRows.map((row, i) => (
                        <tr key={i} className="border-t border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                          {previewData.headers.slice(0, 8).map((header, j) => (
                            <td key={j} className="px-4 py-3 text-gray-900 dark:text-slate-300">
                              {row[header]?.toString() || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPreviewPages > 1 && (
                  <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Showing {startIndex + 1} to {Math.min(startIndex + pageSize, previewData.rows.length)} of {previewData.rows.length}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-200 dark:border-slate-600 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="px-4 py-2 text-sm">{currentPage} / {totalPreviewPages}</span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPreviewPages, p + 1))}
                        disabled={currentPage === totalPreviewPages}
                        className="p-2 rounded-lg border border-gray-200 dark:border-slate-600 disabled:opacity-50"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {viewMode === 'complete' && result && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30"
              >
                <Check className="h-12 w-12 text-white" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Upload Complete!</h2>
              <p className="text-gray-500 mb-8">{result.saved} records imported successfully</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
                {[
                  { label: 'Total', value: result.total, color: 'indigo' },
                  { label: 'Valid', value: result.valid, color: 'emerald' },
                  { label: 'Errors', value: result.errors, color: 'red' },
                  { label: 'Duplicates', value: result.duplicates, color: 'amber' },
                ].map((stat, i) => (
                  <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-200 dark:border-slate-700">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={reset}
                  className="px-6 py-3 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Upload Another
                </button>
                <Link
                  href="/abc-dashboard"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all flex items-center gap-2"
                >
                  View Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
