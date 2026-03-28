'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, FileSpreadsheet, AlertCircle, CheckCircle2, 
  ArrowRight, ArrowLeft, Loader2, Database, Settings2,
  Play, RotateCcw, Sparkles, FileCheck, X, RefreshCw,
  Info, Table, BarChart3, Box
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import LoadingScreen from '@/components/smartorder/LoadingScreen';
import { SmartOrderNav } from '@/components/smartorder/SmartOrderNav';
import { SmartOrderFooter } from '@/components/smartorder/SmartOrderFooter';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

interface UploadResponse {
  success: boolean;
  batchName: string;
  fileName: string;
  headers: string[];
  previewRows: Record<string, unknown>[];
  allRows: Record<string, unknown>[];
  totalRows: number;
  sampleData: Record<string, unknown>;
  detectedFormat: 'pivot' | 'stock' | 'customer' | 'flat' | 'unknown';
  sheetName: string;
  headerRowIndex: number;
  dataStartRowIndex: number;
  error?: string;
}

interface MappingResponse {
  success: boolean;
  mapping: Record<string, string>;
  confidence: number;
  unmapped: string[];
  suggestions: Record<string, string[]>;
  warnings: string[];
  message?: string;
  error?: string;
}

interface ValidationResponse {
  success: boolean;
  valid: boolean;
  lines: Array<{
    id: string;
    data: Record<string, unknown>;
    validationErrors?: string[];
    warnings?: string[];
  }>;
  stats: {
    total: number;
    valid: number;
    errors: number;
    warnings: number;
  };
  error?: string;
}

interface BatchResponse {
  success: boolean;
  batchId: string;
  message: string;
  error?: string;
}

// Format detection badge
function FormatBadge({ format }: { format: string }) {
  const config: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    pivot: { icon: <BarChart3 className="w-3 h-3" />, label: 'Pivot Table', color: 'bg-purple-500/20 text-purple-400' },
    stock: { icon: <Box className="w-3 h-3" />, label: 'Stock Report', color: 'bg-blue-500/20 text-blue-400' },
    customer: { icon: <Database className="w-3 h-3" />, label: 'Customer Sales', color: 'bg-green-500/20 text-green-400' },
    flat: { icon: <Table className="w-3 h-3" />, label: 'Standard Data', color: 'bg-gray-500/20 text-gray-400' },
    unknown: { icon: <Info className="w-3 h-3" />, label: 'Unknown', color: 'bg-yellow-500/20 text-yellow-400' }
  };
  
  const c = config[format] || config.unknown;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${c.color}`}>
      {c.icon} {c.label}
    </span>
  );
}

// Step indicators
function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = ['Upload', 'Map Columns', 'Validate', 'Process'];
  
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div className={`
            flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold
            transition-all duration-300
            ${currentStep === index + 1 ? 'bg-gradient-to-r from-[#0088CC] to-[#00A3E0] text-white shadow-lg shadow-[#0088CC]/25' : ''}
            ${currentStep > index + 1 ? 'bg-[#FFD700] text-black' : ''}
            ${currentStep < index + 1 ? 'bg-white/10 text-gray-400' : ''}
          `}>
            {currentStep > index + 1 ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
          </div>
          <span className={`
            ml-2 text-sm font-medium hidden sm:block
            ${currentStep === index + 1 ? 'text-white' : ''}
            ${currentStep > index + 1 ? 'text-[#FFD700]' : ''}
            ${currentStep < index + 1 ? 'text-gray-400' : ''}
          `}>
            {step}
          </span>
          {index < steps.length - 1 && (
            <div className={`w-8 sm:w-12 h-0.5 mx-2 ${currentStep > index + 1 ? 'bg-[#FFD700]' : 'bg-white/10'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// File Upload Step
function UploadStep({ 
  onUpload, 
  isUploading, 
  error,
  uploadProgress 
}: { 
  onUpload: (file: File) => void;
  isUploading: boolean;
  error: string | null;
  uploadProgress: number;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  }, [onUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  }, [onUpload]);

  return (
    <motion.div 
      variants={fadeInUp}
      initial="initial" 
      animate="animate"
      className="space-y-6"
    >
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0088CC] to-[#00A3E0] flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-white">Upload Sales Report</CardTitle>
          <CardDescription className="text-gray-400">
            Drag and drop your Excel file or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
              transition-all duration-300
              ${isDragging 
                ? 'border-[#0088CC] bg-[#0088CC]/10' 
                : 'border-white/20 hover:border-[#0088CC]/50 hover:bg-white/5'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {isUploading ? (
              <div className="space-y-4">
                <Loader2 className="w-12 h-12 text-[#0088CC] animate-spin mx-auto" />
                <div className="space-y-2">
                  <p className="text-white font-medium">Parsing Excel file...</p>
                  <Progress value={uploadProgress} className="w-48 mx-auto" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <FileSpreadsheet className="w-12 h-12 text-[#0088CC] mx-auto" />
                <div>
                  <p className="text-white font-medium text-lg">
                    Drop your file here or click to browse
                  </p>
                  <p className="text-gray-500 mt-1">
                    Supports .xlsx, .xls, and .csv files
                  </p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-300">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Supported Formats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Pivot Tables', desc: 'Sales trend reports with monthly columns' },
              { label: 'Stock Reports', desc: 'Opening/closing stock with movement data' },
              { label: 'Customer Sales', desc: 'Customer-wise sales value reports' },
              { label: 'Standard Orders', desc: 'Flat order data with customer/material codes' }
            ].map((format) => (
              <div key={format.label} className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-white text-sm font-medium">{format.label}</p>
                <p className="text-gray-500 text-xs">{format.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Column Mapping Step
function MappingStep({
  uploadData,
  mapping,
  onMappingChange,
  onConfirm,
  onBack,
  isLoading,
  mappingResponse
}: {
  uploadData: UploadResponse | null;
  mapping: Record<string, string>;
  onMappingChange: (column: string, field: string) => void;
  onConfirm: () => void;
  onBack: () => void;
  isLoading: boolean;
  mappingResponse: MappingResponse | null;
}) {
  const [manualMapping, setManualMapping] = useState<Record<string, string>>({});
  const [showUnmapped, setShowUnmapped] = useState(false);

  const sapFields = [
    'ORDER_TYPE', 'SOLD_TO', 'SHIP_TO', 'MATERIAL', 'QUANTITY',
    'UOM', 'PRICE', 'CURRENCY', 'REQ_DATE', 'PO_NUMBER',
    'SALES_ORG', 'DIST_CHANNEL', 'DIVISION', 'PLANT'
  ];

  const unmappedColumns = uploadData?.headers.filter(h => !mapping[h]) || [];
  const mappedCount = Object.keys(mapping).length;
  const confidence = mappingResponse?.confidence || 0;

  return (
    <motion.div 
      variants={fadeInUp}
      initial="initial" 
      animate="animate"
      className="space-y-6"
    >
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FFD700]" />
                AI Column Mapping
              </CardTitle>
              <CardDescription className="text-gray-400">
                Review and adjust the AI-detected column mappings
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{Math.round(confidence * 100)}%</div>
              <div className="text-xs text-gray-500">Confidence</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Info */}
          {uploadData && (
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-10 h-10 text-[#0088CC]" />
                <div>
                  <p className="text-white font-medium">{uploadData.fileName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <FormatBadge format={uploadData.detectedFormat} />
                    <span className="text-gray-500 text-sm">•</span>
                    <span className="text-gray-500 text-sm">{uploadData.totalRows.toLocaleString()} rows</span>
                    <span className="text-gray-500 text-sm">•</span>
                    <span className="text-gray-500 text-sm">{uploadData.headers.length} columns</span>
                  </div>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-400">
                {mappedCount} / {uploadData.headers.length} mapped
              </Badge>
            </div>
          )}

          {/* Mapping Table */}
          <div className="border border-white/10 rounded-lg overflow-hidden">
            <div className="grid grid-cols-2 gap-4 p-3 bg-white/5 text-sm font-medium text-gray-400">
              <span>Excel Column</span>
              <span>SAP Field</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {uploadData?.headers.map((header) => (
                <div 
                  key={header}
                  className="grid grid-cols-2 gap-4 p-3 border-t border-white/5 hover:bg-white/5"
                >
                  <div className="flex items-center gap-2">
                    {mapping[header] ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                    )}
                    <span className="text-white text-sm">{header}</span>
                  </div>
                  <select
                    value={mapping[header] || ''}
                    onChange={(e) => onMappingChange(header, e.target.value)}
                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white focus:border-[#0088CC] outline-none"
                  >
                    <option value="">-- Select Field --</option>
                    {sapFields.map(field => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Warnings */}
          {mappingResponse?.warnings && mappingResponse.warnings.length > 0 && (
            <Alert className="bg-yellow-500/10 border-yellow-500/30 text-yellow-300">
              <Info className="w-4 h-4" />
              <AlertDescription>
                {mappingResponse.warnings.join(', ')}
              </AlertDescription>
            </Alert>
          )}

          {/* Preview */}
          {uploadData?.previewRows && uploadData.previewRows.length > 0 && (
            <div>
              <h4 className="text-white font-medium mb-3">Data Preview</h4>
              <div className="overflow-x-auto rounded-lg border border-white/10">
                <table className="w-full text-sm">
                  <thead className="bg-white/5">
                    <tr>
                      {uploadData.headers.slice(0, 5).map(h => (
                        <th key={h} className="px-3 py-2 text-left text-gray-400 font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {uploadData.previewRows.slice(0, 3).map((row, i) => (
                      <tr key={i} className="border-t border-white/5">
                        {uploadData.headers.slice(0, 5).map(h => (
                          <td key={h} className="px-3 py-2 text-white">
                            {String(row[h] || '').substring(0, 30)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={onBack}
              className="border-white/10 text-white hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading || mappedCount === 0}
              className="bg-gradient-to-r from-[#0088CC] to-[#00A3E0] text-white hover:opacity-90"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Confirm Mapping
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Validation Step
function ValidationStep({
  validationResult,
  onConfirm,
  onBack,
  isValidating
}: {
  validationResult: ValidationResponse | null;
  onConfirm: () => void;
  onBack: () => void;
  isValidating: boolean;
}) {
  if (!validationResult) return null;

  const { stats, lines } = validationResult;
  const errorLines = lines.filter(l => l.validationErrors && l.validationErrors.length > 0);
  const warningLines = lines.filter(l => l.warnings && l.warnings.length > 0);

  return (
    <motion.div 
      variants={fadeInUp}
      initial="initial" 
      animate="animate"
      className="space-y-6"
    >
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#FFD700]" />
            Validation Results
          </CardTitle>
          <CardDescription className="text-gray-400">
            Review data quality and validation issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total', value: stats.total, color: 'text-white' },
              { label: 'Valid', value: stats.valid, color: 'text-green-400' },
              { label: 'Errors', value: stats.errors, color: 'text-red-400' },
              { label: 'Warnings', value: stats.warnings, color: 'text-yellow-400' }
            ].map(stat => (
              <div key={stat.label} className="p-4 rounded-lg bg-white/5 text-center">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Validation Progress</span>
              <span className="text-white">{Math.round((stats.valid / stats.total) * 100)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(stats.valid / stats.total) * 100}%` }}
                className="h-full bg-gradient-to-r from-green-500 to-green-400"
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Errors List */}
          {errorLines.length > 0 && (
            <div className="border border-red-500/20 rounded-lg overflow-hidden">
              <div className="p-3 bg-red-500/10 text-red-400 text-sm font-medium">
                Errors ({errorLines.length})
              </div>
              <div className="max-h-48 overflow-y-auto">
                {errorLines.slice(0, 10).map((line, i) => (
                  <div key={line.id} className="p-3 border-t border-white/5">
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-gray-400">Row {i + 1}:</span>
                      <span className="text-white">{line.validationErrors?.join(', ')}</span>
                    </div>
                  </div>
                ))}
                {errorLines.length > 10 && (
                  <div className="p-3 text-center text-gray-500 text-sm">
                    +{errorLines.length - 10} more errors
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={onBack}
              className="border-white/10 text-white hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isValidating || stats.valid === 0}
              className="bg-gradient-to-r from-[#0088CC] to-[#00A3E0] text-white hover:opacity-90"
            >
              {isValidating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Process Orders
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Processing Step
function ProcessingStep({
  batchId,
  progress,
  onDone
}: {
  batchId: string | null;
  progress: number;
  onDone: () => void;
}) {
  return (
    <motion.div 
      variants={fadeInUp}
      initial="initial" 
      animate="animate"
      className="space-y-6"
    >
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardContent className="py-12 text-center">
          {progress < 100 ? (
            <div className="space-y-6">
              <div className="relative w-24 h-24 mx-auto">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-white/10"
                  />
                  <motion.circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    className="text-[#0088CC]"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: progress / 100 }}
                    style={{ pathLength: progress / 100 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[#0088CC] animate-spin" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Processing Orders
                </h3>
                <p className="text-gray-400">
                  {progress}% complete - Sending to SAP...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Processing Complete!
                </h3>
                <p className="text-gray-400 mb-4">
                  Batch {batchId} has been processed successfully.
                </p>
                <Button
                  onClick={onDone}
                  className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black hover:opacity-90"
                >
                  View Results
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Main Page Component
export default function UploadPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [mappingResponse, setMappingResponse] = useState<MappingResponse | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResponse | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showLoading, setShowLoading] = useState(true);

  // Handle file upload
  const handleUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Upload failed');
      }

      const data: UploadResponse = await response.json();
      setUploadData(data);
      
      // Automatically proceed to AI mapping
      setStep(2);
      
      // Call AI mapping API
      const mappingRes = await fetch('/api/ai/map-columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headers: data.headers,
          sampleData: data.sampleData,
          detectedFormat: data.detectedFormat,
          batchName: data.batchName
        })
      });

      if (mappingRes.ok) {
        const mappingData: MappingResponse = await mappingRes.json();
        setMapping(mappingData.mapping || {});
        setMappingResponse(mappingData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle mapping confirmation
  const handleMappingConfirm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Create batch first
      const batchRes = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchName: uploadData?.batchName,
          fileName: uploadData?.fileName,
          totalOrders: uploadData?.totalRows,
          mapping: mapping,
          rows: uploadData?.allRows || uploadData?.previewRows || []
        })
      });

      if (!batchRes.ok) {
        const err = await batchRes.json();
        throw new Error(err.error || 'Failed to create batch');
      }

      const batchData: BatchResponse = await batchRes.json();
      setBatchId(batchData.batchId);

      // Run validation
      const validationRes = await fetch(`/api/batches/${batchData.batchId}/validate`, {
        method: 'POST'
      });

      if (validationRes.ok) {
        const validationData: ValidationResponse = await validationRes.json();
        setValidationResult(validationData);
        setStep(3);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle validation confirmation and processing
  const handleProcess = async () => {
    setIsLoading(true);
    setError(null);
    setProgress(0);
    setStep(4);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + 10;
      });
    }, 500);

    try {
      const processRes = await fetch(`/api/batches/${batchId}/process`, {
        method: 'POST'
      });

      clearInterval(interval);

      if (processRes.ok) {
        setProgress(100);
      } else {
        const err = await processRes.json();
        throw new Error(err.error || 'Processing failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
      clearInterval(interval);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle completion
  const handleDone = () => {
    router.push(`/smartorder/batch/${batchId}`);
  };

  // Handle reset
  const handleReset = () => {
    setStep(1);
    setUploadData(null);
    setMapping({});
    setMappingResponse(null);
    setValidationResult(null);
    setBatchId(null);
    setProgress(0);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#121212] via-[#0f1628] to-[#1a1a1a]">
      {showLoading && (
        <LoadingScreen 
          onComplete={() => setShowLoading(false)} 
          minDuration={2000}
        />
      )}
      
      <SmartOrderNav />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Upload <span className="text-[#FFD700]">Sales Data</span>
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto">
              Import Excel reports and convert them to SAP orders automatically
            </p>
          </motion.div>

          {/* Step Indicator */}
          <StepIndicator currentStep={step} />

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6"
              >
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-300">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription className="flex items-center justify-between">
                    {error}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setError(null)}
                      className="h-6 px-2 text-red-300 hover:text-white hover:bg-red-500/20"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <UploadStep
                key="upload"
                onUpload={handleUpload}
                isUploading={isLoading}
                error={error}
                uploadProgress={uploadProgress}
              />
            )}
            
            {step === 2 && (
              <MappingStep
                key="mapping"
                uploadData={uploadData}
                mapping={mapping}
                onMappingChange={(col, field) => 
                  setMapping(prev => ({ ...prev, [col]: field }))
                }
                onConfirm={handleMappingConfirm}
                onBack={handleReset}
                isLoading={isLoading}
                mappingResponse={mappingResponse}
              />
            )}
            
            {step === 3 && (
              <ValidationStep
                key="validation"
                validationResult={validationResult}
                onConfirm={handleProcess}
                onBack={() => setStep(2)}
                isValidating={isLoading}
              />
            )}
            
            {step === 4 && (
              <ProcessingStep
                key="processing"
                batchId={batchId}
                progress={progress}
                onDone={handleDone}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
      
      <SmartOrderFooter />
    </div>
  );
}
