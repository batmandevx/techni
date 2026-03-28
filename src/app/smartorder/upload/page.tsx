'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, FileSpreadsheet, X, CheckCircle2, AlertCircle, 
  Loader2, ArrowRight, Sparkles, Brain, Download,
  FileJson, FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Link from 'next/link';

interface FileData {
  headers: string[];
  rows: any[][];
  fileName: string;
}

interface Mapping {
  source_column: string;
  target_field: string;
  confidence: number;
}

interface UploadState {
  step: 'upload' | 'mapping' | 'validation' | 'processing' | 'complete';
  fileData: FileData | null;
  mappings: Mapping[];
  isUploading: boolean;
  batchId: string | null;
  validationResults: any[];
}

const SAP_FIELDS = [
  { key: 'ORDER_TYPE', label: 'Order Type', example: 'OR' },
  { key: 'SALES_ORG', label: 'Sales Org', example: '1000' },
  { key: 'DIST_CHANNEL', label: 'Dist. Channel', example: '10' },
  { key: 'DIVISION', label: 'Division', example: '00' },
  { key: 'SOLD_TO', label: 'Sold-To', example: '1000001' },
  { key: 'SHIP_TO', label: 'Ship-To', example: '1000001' },
  { key: 'MATERIAL', label: 'Material', example: 'SKU-001' },
  { key: 'QTY', label: 'Quantity', example: '100' },
  { key: 'PRICE', label: 'Unit Price', example: '24.99' },
  { key: 'REQ_DEL_DATE', label: 'Delivery Date', example: '2026-03-15' },
];

export default function UploadPage() {
  const [state, setState] = useState<UploadState>({
    step: 'upload',
    fileData: null,
    mappings: [],
    isUploading: false,
    batchId: null,
    validationResults: [],
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setState(prev => ({ ...prev, isUploading: true }));

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      if (jsonData.length < 2) {
        alert('File is empty or invalid');
        return;
      }

      const headers = jsonData[0];
      const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== ''));

      setState(prev => ({
        ...prev,
        step: 'mapping',
        fileData: { headers, rows, fileName: file.name },
        isUploading: false,
      }));

      // Auto-map using AI
      await autoMapColumns(headers, rows[0] || []);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading file');
      setState(prev => ({ ...prev, isUploading: false }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  async function autoMapColumns(headers: string[], sampleRow: any[]) {
    try {
      const response = await fetch('/api/ai/map-columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headers, sampleRow }),
      });

      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          ...prev,
          mappings: data.mappings || [],
        }));
      }
    } catch (error) {
      console.error('Auto-mapping error:', error);
    }
  }

  function updateMapping(header: string, targetField: string) {
    setState(prev => {
      const existingIndex = prev.mappings.findIndex(m => m.source_column === header);
      const newMapping = { source_column: header, target_field: targetField, confidence: 1 };
      
      if (existingIndex >= 0) {
        const newMappings = [...prev.mappings];
        newMappings[existingIndex] = newMapping;
        return { ...prev, mappings: newMappings };
      }
      
      return { ...prev, mappings: [...prev.mappings, newMapping] };
    });
  }

  async function uploadBatch() {
    if (!state.fileData) return;

    setState(prev => ({ ...prev, isUploading: true }));

    try {
      const formData = new FormData();
      
      // Recreate file from data
      const worksheet = XLSX.utils.aoa_to_sheet([
        state.fileData.headers,
        ...state.fileData.rows,
      ]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const fileBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
      const file = new File([fileBuffer], state.fileData.fileName, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      formData.append('file', file);
      formData.append('userId', 'guest');
      formData.append('mappings', JSON.stringify(state.mappings));

      const response = await fetch('/api/batches', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          ...prev,
          step: 'validation',
          batchId: data.batch.id,
          isUploading: false,
        }));
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
      setState(prev => ({ ...prev, isUploading: false }));
    }
  }

  async function processBatch() {
    if (!state.batchId) return;

    setState(prev => ({ ...prev, step: 'processing', isUploading: true }));

    try {
      const response = await fetch(`/api/batches/${state.batchId}/process`, {
        method: 'POST',
      });

      if (response.ok) {
        setState(prev => ({
          ...prev,
          step: 'complete',
          isUploading: false,
        }));
      } else {
        throw new Error('Processing failed');
      }
    } catch (error) {
      console.error('Processing error:', error);
      alert('Processing failed');
      setState(prev => ({ ...prev, isUploading: false }));
    }
  }

  function getConfidenceColor(confidence: number) {
    if (confidence >= 0.9) return 'text-emerald-400';
    if (confidence >= 0.7) return 'text-amber-400';
    return 'text-rose-400';
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Upload Orders</h1>
        <p className="text-slate-400 text-sm mt-1">
          Upload Excel files and let AI map columns to SAP fields
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-8">
        {['Upload', 'AI Mapping', 'Validation', 'Processing'].map((step, i) => {
          const stepKey = ['upload', 'mapping', 'validation', 'processing'][i];
          const isActive = state.step === stepKey || 
            (stepKey === 'upload' && state.step !== 'upload') ||
            (stepKey === 'mapping' && ['validation', 'processing', 'complete'].includes(state.step));
          const isComplete = ['validation', 'processing', 'complete'].includes(state.step) && i < 2 ||
            ['processing', 'complete'].includes(state.step) && i < 3 ||
            state.step === 'complete';
          
          return (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                isComplete ? 'bg-emerald-500 text-white' :
                isActive ? 'bg-indigo-500 text-white' :
                'bg-white/10 text-slate-400'
              }`}>
                {isComplete ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm ${isActive ? 'text-white' : 'text-slate-500'}`}>{step}</span>
              {i < 3 && <div className="w-8 h-px bg-white/10 ml-2" />}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* Upload Step */}
        {state.step === 'upload' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div
              {...getRootProps()}
              className={`
                relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer
                ${isDragActive 
                  ? 'border-indigo-500 bg-indigo-500/10' 
                  : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                }
              `}
            >
              <input {...getInputProps()} />
              <div className="p-4 rounded-full bg-indigo-500/10 w-fit mx-auto mb-4">
                {state.isUploading ? (
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 text-indigo-400" />
                )}
              </div>
              <p className="text-white font-medium mb-2">
                {isDragActive ? 'Drop the file here' : 'Drop Excel file here or click to browse'}
              </p>
              <p className="text-slate-500 text-sm">
                Supports .xlsx, .xls, and .csv files
              </p>
            </div>

            {/* Template Download */}
            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm mb-3">Need a template?</p>
              <div className="flex justify-center gap-3">
                <a
                  href="/templates/order_template.xlsx"
                  download
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm rounded-lg transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel Template
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {/* Mapping Step */}
        {state.step === 'mapping' && state.fileData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-indigo-400" />
                <h2 className="font-semibold text-white">AI Column Mapping</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  {state.mappings.length} of {state.fileData.headers.length} columns mapped
                </span>
              </div>
            </div>

            <div className="p-5 space-y-4 max-h-[400px] overflow-y-auto">
              {state.fileData.headers.map((header, i) => {
                const mapping = state.mappings.find(m => m.source_column === header);
                const sampleValue = state.fileData?.rows[0]?.[i] || '';
                
                return (
                  <div key={header} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{header}</p>
                      <p className="text-xs text-slate-500">Sample: {String(sampleValue).slice(0, 30)}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                    <div className="flex-1">
                      <select
                        value={mapping?.target_field || ''}
                        onChange={(e) => updateMapping(header, e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white outline-none focus:border-indigo-500/40"
                      >
                        <option value="" className="bg-slate-900">-- Select SAP Field --</option>
                        {SAP_FIELDS.map(field => (
                          <option key={field.key} value={field.key} className="bg-slate-900">
                            {field.label}
                          </option>
                        ))}
                      </select>
                      {mapping && (
                        <div className="flex items-center gap-1 mt-1">
                          <Sparkles className="w-3 h-3 text-indigo-400" />
                          <span className={`text-xs ${getConfidenceColor(mapping.confidence)}`}>
                            {(mapping.confidence * 100).toFixed(0)}% confidence
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between px-5 py-4 border-t border-white/6">
              <button
                onClick={() => setState(prev => ({ ...prev, step: 'upload', fileData: null, mappings: [] }))}
                className="text-slate-400 hover:text-white text-sm"
              >
                Start Over
              </button>
              <button
                onClick={uploadBatch}
                disabled={state.isUploading || state.mappings.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {state.isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                Continue to Validation
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Validation Step */}
        {state.step === 'validation' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center"
          >
            <div className="p-4 rounded-full bg-emerald-500/10 w-fit mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Validation Complete</h2>
            <p className="text-slate-400 mb-6">
              Your file has been validated and is ready for processing.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={processBatch}
                disabled={state.isUploading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
              >
                {state.isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                Process Orders in SAP
              </button>
            </div>
          </motion.div>
        )}

        {/* Processing Step */}
        {state.step === 'processing' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center"
          >
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Processing Orders</h2>
            <p className="text-slate-400">
              Creating orders in SAP S/4HANA via BAPI. This may take a moment...
            </p>
          </motion.div>
        )}

        {/* Complete Step */}
        {state.step === 'complete' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center"
          >
            <div className="p-4 rounded-full bg-emerald-500/10 w-fit mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Processing Complete!</h2>
            <p className="text-slate-400 mb-6">
              Your orders have been successfully created in SAP.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href="/smartorder/orders"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors"
              >
                View Orders
              </Link>
              <button
                onClick={() => setState({
                  step: 'upload',
                  fileData: null,
                  mappings: [],
                  isUploading: false,
                  batchId: null,
                  validationResults: [],
                })}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-colors"
              >
                Upload Another File
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
