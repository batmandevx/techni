'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@clerk/nextjs';
import {
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Database,
  Sparkles,
} from 'lucide-react';
import { LoadingScreen } from '@/components/ui/loading-screen';

interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
}

export default function UploadPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

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
  };

  const uploadFile = async (file: UploadFile) => {
    setFiles(prev => prev.map(f => 
      f.id === file.id ? { ...f, status: 'uploading' } : f
    ));

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, progress: i } : f
      ));
    }

    // Simulate processing
    setFiles(prev => prev.map(f => 
      f.id === file.id ? { ...f, status: 'processing' } : f
    ));

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mark as completed
    setFiles(prev => prev.map(f => 
      f.id === file.id ? { ...f, status: 'completed' } : f
    ));
  };

  const handleUploadAll = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    await Promise.all(pendingFiles.map(uploadFile));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Upload Data</h1>
        <p className="text-slate-400 text-sm mt-1">
          Upload Excel or CSV files for AI-powered data processing
        </p>
      </div>

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
            relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300
            ${isDragging 
              ? 'border-indigo-500 bg-indigo-500/10' 
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
          <div className="p-4 rounded-full bg-indigo-500/10 w-fit mx-auto mb-4">
            <Upload className="w-8 h-8 text-indigo-400" />
          </div>
          <p className="text-white font-medium mb-2">
            Drop files here or click to browse
          </p>
          <p className="text-slate-500 text-sm">
            Supports .xlsx, .xls, and .csv files
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
            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
              <h2 className="font-semibold text-white">
                Files ({files.length})
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFiles([])}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Clear all
                </button>
                <button
                  onClick={handleUploadAll}
                  disabled={!files.some(f => f.status === 'pending')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Process All
                </button>
              </div>
            </div>

            <div className="divide-y divide-white/6">
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 flex-shrink-0">
                    <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(file.size)}
                    </p>
                    
                    {/* Progress bar */}
                    {file.status === 'uploading' && (
                      <div className="mt-2">
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${file.progress}%` }}
                            className="h-full bg-indigo-500"
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {file.progress}%
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {file.status === 'pending' && (
                      <span className="text-xs text-slate-400">Ready</span>
                    )}
                    {file.status === 'uploading' && (
                      <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                    )}
                    {file.status === 'processing' && (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                        <span className="text-xs text-amber-400">AI Processing</span>
                      </div>
                    )}
                    {file.status === 'completed' && (
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-xs">Done</span>
                      </div>
                    )}
                    {file.status === 'error' && (
                      <div className="flex items-center gap-1.5 text-rose-400">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs">Failed</span>
                      </div>
                    )}
                    
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {[
          {
            icon: Database,
            title: 'Supported Formats',
            desc: 'Excel (.xlsx, .xls) and CSV files are supported',
          },
          {
            icon: Sparkles,
            title: 'AI Mapping',
            desc: 'AI automatically detects and maps columns to SAP fields',
          },
          {
            icon: CheckCircle2,
            title: 'Validation',
            desc: 'Data is validated against master records before processing',
          },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="bg-white/5 border border-white/10 rounded-xl p-4"
          >
            <div className="p-2 rounded-lg bg-indigo-500/10 w-fit mb-3">
              <item.icon className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="font-medium text-white text-sm mb-1">{item.title}</h3>
            <p className="text-slate-400 text-xs">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
