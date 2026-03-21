'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  FileCode,
  Mail,
  Printer,
  Check,
  X,
  Loader2,
  Calendar,
  Filter
} from 'lucide-react';
import { MATERIALS, HISTORICAL_DATA } from '@/lib/mock-data';
import { performABCAnalysis } from '@/lib/forecasting';

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
  { id: 'abc', label: 'ABC Analysis', description: 'SKU classifications and metrics' },
  { id: 'forecast', label: 'Forecast Data', description: 'Demand predictions and accuracy' },
  { id: 'inventory', label: 'Inventory Status', description: 'Current stock levels and gaps' },
  { id: 'orders', label: 'Order History', description: 'Past orders and recommendations' },
];

export function ExportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('excel');
  const [selectedData, setSelectedData] = useState<string[]>(['abc']);
  const [isExporting, setIsExporting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [dateRange, setDateRange] = useState('30d');

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
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
              className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Export Data</h3>
                  <p className="text-sm text-gray-500">Download your data in multiple formats</p>
                </div>
                {!isExporting && (
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
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
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Export Complete!</h4>
                    <p className="text-sm text-gray-500 mt-1">Your file is ready for download</p>
                  </motion.div>
                ) : (
                  <>
                    {/* Format Selection */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3 block">
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
                                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                                  : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                              }`}
                            >
                              <Icon className={`w-6 h-6 mx-auto mb-2 ${
                                isSelected ? 'text-indigo-500' : 'text-gray-400'
                              }`} />
                              <p className={`text-sm font-medium ${
                                isSelected ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-700 dark:text-slate-300'
                              }`}>
                                {option.label}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">{option.description}</p>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Data Selection */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3 block">
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
                                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                                  : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                              }`}
                            >
                              <div>
                                <p className={`text-sm font-medium ${
                                  isSelected ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-700 dark:text-slate-300'
                                }`}>
                                  {option.label}
                                </p>
                                <p className="text-xs text-gray-400">{option.description}</p>
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected
                                  ? 'border-indigo-500 bg-indigo-500'
                                  : 'border-gray-300 dark:border-slate-600'
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
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date Range
                      </label>
                      <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
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
                <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    disabled={isExporting}
                    className="flex-1 py-3 px-4 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-slate-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExport}
                    disabled={isExporting || selectedData.length === 0}
                    className="flex-1 py-3 px-4 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
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
