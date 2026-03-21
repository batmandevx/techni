'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  FileCode,
  Check,
  X,
  Loader2,
  Calendar,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ExportOption {
  id: string;
  label: string;
  icon: any;
  format: string;
  description: string;
}

const exportOptions: ExportOption[] = [
  { id: 'excel', label: 'Excel', icon: FileSpreadsheet, format: 'xlsx', description: 'Full data with formulas' },
  { id: 'pdf', label: 'PDF', icon: FileText, format: 'pdf', description: 'Formatted report' },
  { id: 'csv', label: 'CSV', icon: FileCode, format: 'csv', description: 'Raw data export' },
];

const dataOptions = [
  { id: 'inventory', label: 'Inventory Status', description: 'Current stock levels and metrics' },
  { id: 'orders', label: 'Order History', description: 'Past orders and details' },
  { id: 'forecast', label: 'Forecast Data', description: 'Demand predictions' },
  { id: 'abc', label: 'ABC Analysis', description: 'SKU classifications' },
];

// Mock data for export
const mockInventoryData = [
  { sku: 'WH-001', name: 'Wireless Headphones Pro', category: 'Electronics', stock: 245, reorderPoint: 100, status: 'Good', value: 36750 },
  { sku: 'UC-203', name: 'USB-C Cable 2m', category: 'Accessories', stock: 45, reorderPoint: 50, status: 'Low', value: 1350 },
  { sku: 'LS-105', name: 'Laptop Stand Aluminum', category: 'Accessories', stock: 8, reorderPoint: 20, status: 'Critical', value: 2400 },
  { sku: 'KB-400', name: 'Mechanical Keyboard RGB', category: 'Electronics', stock: 890, reorderPoint: 80, status: 'Excess', value: 133500 },
  { sku: 'MP-120', name: 'Mouse Pad XL', category: 'Accessories', stock: 156, reorderPoint: 60, status: 'Good', value: 2340 },
];

const mockOrdersData = [
  { orderId: 'ORD-001', customer: 'Acme Corp', date: '2024-03-15', items: 12, total: 2450, status: 'Delivered' },
  { orderId: 'ORD-002', customer: 'TechStart Inc', date: '2024-03-16', items: 5, total: 890, status: 'Processing' },
  { orderId: 'ORD-003', customer: 'Global Retail', date: '2024-03-17', items: 25, total: 12500, status: 'Shipped' },
  { orderId: 'ORD-004', customer: 'Local Shop', date: '2024-03-18', items: 3, total: 450, status: 'Pending' },
  { orderId: 'ORD-005', customer: 'Enterprise Co', date: '2024-03-19', items: 50, total: 45000, status: 'Processing' },
];

const mockForecastData = [
  { month: 'Jan', predicted: 1200, actual: 1150, accuracy: 95.8 },
  { month: 'Feb', predicted: 1350, actual: 1420, accuracy: 94.8 },
  { month: 'Mar', predicted: 1500, actual: 1480, accuracy: 98.7 },
  { month: 'Apr', predicted: 1650, actual: null, accuracy: null },
  { month: 'May', predicted: 1800, actual: null, accuracy: null },
];

const mockABCData = [
  { sku: 'KB-400', name: 'Mechanical Keyboard RGB', classification: 'A', revenue: 133500, percentage: 65 },
  { sku: 'WH-001', name: 'Wireless Headphones Pro', classification: 'A', revenue: 36750, percentage: 18 },
  { sku: 'MP-120', name: 'Mouse Pad XL', classification: 'B', revenue: 2340, percentage: 8 },
  { sku: 'LS-105', name: 'Laptop Stand Aluminum', classification: 'B', revenue: 2400, percentage: 5 },
  { sku: 'UC-203', name: 'USB-C Cable 2m', classification: 'C', revenue: 1350, percentage: 4 },
];

export function ExportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('excel');
  const [selectedData, setSelectedData] = useState<string[]>(['inventory']);
  const [isExporting, setIsExporting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [dateRange, setDateRange] = useState('30d');

  const generateFilename = (dataType: string) => {
    const date = new Date().toISOString().split('T')[0];
    return `tenchi-${dataType}-${date}`;
  };

  const exportToExcel = (data: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const exportToCSV = (data: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const exportToPDF = (data: any[], filename: string, title: string) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    const headers = Object.keys(data[0] || {});
    const rows = data.map(item => Object.values(item));
    
    (doc as any).autoTable({
      head: [headers],
      body: rows,
      startY: 40,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [99, 102, 241] },
    });
    
    doc.save(`${filename}.pdf`);
  };

  const getDataForExport = (dataType: string) => {
    switch (dataType) {
      case 'inventory': return mockInventoryData;
      case 'orders': return mockOrdersData;
      case 'forecast': return mockForecastData;
      case 'abc': return mockABCData;
      default: return [];
    }
  };

  const getTitleForExport = (dataType: string) => {
    const titles: Record<string, string> = {
      inventory: 'Inventory Status Report',
      orders: 'Order History Report',
      forecast: 'Demand Forecast Report',
      abc: 'ABC Analysis Report',
    };
    return titles[dataType] || 'Export Report';
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    // Export each selected data type
    for (const dataType of selectedData) {
      const data = getDataForExport(dataType);
      const filename = generateFilename(dataType);
      
      if (selectedFormat === 'excel') {
        exportToExcel(data, filename);
      } else if (selectedFormat === 'csv') {
        exportToCSV(data, filename);
      } else if (selectedFormat === 'pdf') {
        exportToPDF(data, filename, getTitleForExport(dataType));
      }
      
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setIsExporting(false);
    setIsComplete(true);
    
    setTimeout(() => {
      setIsComplete(false);
      setIsOpen(false);
    }, 2000);
  };

  const toggleDataOption = (id: string) => {
    setSelectedData(prev => 
      prev.includes(id) 
        ? prev.filter(d => d !== id)
        : [...prev, id]
    );
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className="w-full p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
      >
        <Download className="w-5 h-5" />
        <span className="font-medium">Export Data</span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => !isExporting && setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-lg bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Export Data</h3>
                  <p className="text-sm text-gray-400">Download your data in multiple formats</p>
                </div>
                {!isExporting && (
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-slate-800 text-gray-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {isComplete ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-white">Export Complete!</h4>
                    <p className="text-sm text-gray-400 mt-1">Your files have been downloaded</p>
                  </motion.div>
                ) : (
                  <>
                    {/* Format Selection */}
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-3 block">
                        Export Format
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {exportOptions.map((option) => {
                          const Icon = option.icon;
                          const isSelected = selectedFormat === option.id;

                          return (
                            <motion.button
                              key={option.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setSelectedFormat(option.id)}
                              className={`p-4 rounded-xl border-2 transition-all ${
                                isSelected
                                  ? 'border-indigo-500 bg-indigo-500/10'
                                  : 'border-slate-700 hover:border-slate-600'
                              }`}
                            >
                              <Icon className={`w-6 h-6 mx-auto mb-2 ${
                                isSelected ? 'text-indigo-400' : 'text-gray-500'
                              }`} />
                              <p className={`text-sm font-medium ${
                                isSelected ? 'text-indigo-400' : 'text-gray-300'
                              }`}>
                                {option.label}
                              </p>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Data Selection */}
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-3 block">
                        Data to Export
                      </label>
                      <div className="space-y-2">
                        {dataOptions.map((option) => {
                          const isSelected = selectedData.includes(option.id);

                          return (
                            <motion.button
                              key={option.id}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => toggleDataOption(option.id)}
                              className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                                isSelected
                                  ? 'border-indigo-500 bg-indigo-500/10'
                                  : 'border-slate-700 hover:border-slate-600'
                              }`}
                            >
                              <div>
                                <p className={`text-sm font-medium ${
                                  isSelected ? 'text-indigo-400' : 'text-gray-300'
                                }`}>
                                  {option.label}
                                </p>
                                <p className="text-xs text-gray-500">{option.description}</p>
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected
                                  ? 'border-indigo-500 bg-indigo-500'
                                  : 'border-slate-600'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Date Range */}
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date Range
                      </label>
                      <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-700 bg-slate-800 text-gray-300 text-sm"
                      >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="1y">Last year</option>
                        <option value="all">All time</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              {!isComplete && (
                <div className="p-6 border-t border-slate-800 flex gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    disabled={isExporting}
                    className="flex-1 py-3 px-4 border border-slate-700 rounded-xl text-gray-300 font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExport}
                    disabled={isExporting || selectedData.length === 0}
                    className="flex-1 py-3 px-4 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Export {selectedData.length} item{selectedData.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
