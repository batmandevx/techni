'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileSpreadsheet, X, CheckCircle2, AlertCircle, Loader2,
  ArrowRight, Database, Sparkles, Eye, Download, FileJson,
  Table, Trash2, CheckCircle, BarChart3, Hash
} from 'lucide-react';
import { useData } from '@/lib/DataContext';
import { parseAndStoreUploadedData } from '@/lib/uploadDataStore';
import Link from 'next/link';

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
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadFile | null>(null);
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

  const uploadFile = async (file: UploadFile) => {
    // Update status to uploading
    setFiles(prev => prev.map(f => 
      f.id === file.id ? { ...f, status: 'uploading', progress: 10 } : f
    ));

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file.file);

      console.log('Uploading file:', file.name);

      // Make API call
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Upload error:', errorData);
        throw new Error(errorData.error || `Failed to process file: ${response.status}`);
      }

      const data = await response.json();
      console.log('Upload success:', data);

      // Update file status to completed
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { 
          ...f, 
          status: 'completed',
          progress: 100,
          data: data,
          preview: data.previewRows || data.allRows?.slice(0, 100) || [],
          headers: data.headers || [],
          totalRows: data.totalRows || data.allRows?.length || 0
        } : f
      ));

      // Save to global context for dashboard
      const fileType = file.name.endsWith('.csv') ? 'csv' : 'xlsx';
      const allRows = data.allRows || data.previewRows || [];
      
      if (addUploadedFile) {
        addUploadedFile({
          name: file.name,
          headers: data.headers || [],
          rows: allRows,
          fileType: fileType as 'xlsx' | 'csv',
          detectedFormat: data.detectedFormat,
        });
      }

      // Also store in legacy uploadDataStore for pages still reading from it
      parseAndStoreUploadedData(file.name, data.headers || [], allRows, data.detectedFormat);

    } catch (error) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { 
          ...f, 
          status: 'error',
          error: error instanceof Error ? error.message : 'Failed to process file'
        } : f
      ));
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
      ...rows.map((row: any) => headers.map((h: string) => `"${row[h] ?? ''}"`).join(','))
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
            { icon: FileSpreadsheet, label: 'Files', value: completedFiles.length, color: 'text-indigo-400' },
            { icon: Hash, label: 'Total Rows', value: totalRows.toLocaleString(), color: 'text-emerald-400' },
            { icon: BarChart3, label: 'Columns', value: completedFiles[0]?.headers?.length || 0, color: 'text-amber-400' },
            { icon: CheckCircle2, label: 'Status', value: 'Active', color: 'text-rose-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
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

      {/* File List */}
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
                      {file.totalRows > 0 && (
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
                        <span className="text-sm text-amber-400">Processing</span>
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
                  </div>
                )}

                {/* Error Message */}
                {file.error && (
                  <div className="px-6 py-3 bg-rose-500/10 border-t border-rose-500/20">
                    <p className="text-rose-400 text-sm">{file.error}</p>
                  </div>
                )}
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
