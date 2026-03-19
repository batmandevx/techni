'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
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
  Square
} from 'lucide-react';
import Link from 'next/link';
import { useExcelData } from '@/lib/hooks/useLocalStorage';
import { useData } from '@/lib/DataContext';

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

type UploadType = 'orders' | 'customers' | null;
type ViewMode = 'upload' | 'preview' | 'processing' | 'complete';

const STEPS = [
  { icon: Upload, label: 'Upload', description: 'Select Excel file' },
  { icon: FileCheck, label: 'Validate', description: 'Check data format' },
  { icon: Database, label: 'Process', description: 'Save to database' },
  { icon: CheckCircle, label: 'Complete', description: 'Upload finished' },
];

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Detect data type
function detectDataType(values: any[]): string {
  const nonEmpty = values.filter(v => v !== undefined && v !== null && v !== '');
  if (nonEmpty.length === 0) return 'empty';
  
  const dates = nonEmpty.filter(v => !isNaN(Date.parse(v)));
  if (dates.length / nonEmpty.length > 0.8) return 'date';
  
  const numbers = nonEmpty.filter(v => !isNaN(parseFloat(v)) && isFinite(v));
  if (numbers.length / nonEmpty.length > 0.8) return 'number';
  
  return 'text';
}

// Progress Ring Component
function ProgressRing({ progress, size = 120 }: { progress: number; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="url(#gradient)" strokeWidth={strokeWidth} fill="none" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>
        {progress}%
      </div>
    </div>
  );
}

// Step Indicator Component
function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const isActive = index <= currentStep;
        const isCurrent = index === currentStep;
        
        return (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px',
                background: isActive ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.05)',
                border: isCurrent ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isActive ? '0 0 30px rgba(99, 102, 241, 0.4)' : 'none',
                transition: 'all 0.4s', transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
              }}>
                <Icon size={24} style={{ color: isActive ? 'white' : '#64748b' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: isActive ? '#f8fafc' : '#64748b' }}>{step.label}</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{step.description}</div>
              </div>
            </div>
            {index < STEPS.length - 1 && (
              <div style={{ width: '40px', height: '2px', background: index < currentStep ? 'linear-gradient(90deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.1)', transition: 'all 0.4s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Stats Card Component
function StatCard({ label, value, color, icon: Icon }: { label: string; value: number | string; color: string; icon: any }) {
  return (
    <div className="card-modern" style={{ textAlign: 'center', padding: '1.5rem' }}>
      <div style={{
        width: '50px', height: '50px', borderRadius: '14px',
        background: `linear-gradient(135deg, ${color}40, ${color}20)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1rem', boxShadow: `0 0 20px ${color}40`,
      }}>
        <Icon size={24} style={{ color }} />
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem' }}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{label}</div>
    </div>
  );
}

// Upload Type Selector Component
function UploadTypeSelector({ selected, onSelect }: { selected: UploadType; onSelect: (type: UploadType) => void }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
      <button
        onClick={() => onSelect('orders')}
        style={{
          padding: '1.5rem 2rem',
          borderRadius: '16px',
          border: selected === 'orders' ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
          background: selected === 'orders' ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.1))' : 'rgba(255,255,255,0.05)',
          cursor: 'pointer',
          transition: 'all 0.3s',
          textAlign: 'center',
          minWidth: '200px',
        }}
      >
        <ShoppingCart size={32} style={{ color: selected === 'orders' ? '#6366f1' : '#64748b', marginBottom: '0.5rem' }} />
        <div style={{ fontSize: '1rem', fontWeight: 600, color: selected === 'orders' ? '#f8fafc' : '#94a3b8' }}>Orders</div>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Sales orders data</div>
      </button>
      
      <button
        onClick={() => onSelect('customers')}
        style={{
          padding: '1.5rem 2rem',
          borderRadius: '16px',
          border: selected === 'customers' ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
          background: selected === 'customers' ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1))' : 'rgba(255,255,255,0.05)',
          cursor: 'pointer',
          transition: 'all 0.3s',
          textAlign: 'center',
          minWidth: '200px',
        }}
      >
        <Users size={32} style={{ color: selected === 'customers' ? '#10b981' : '#64748b', marginBottom: '0.5rem' }} />
        <div style={{ fontSize: '1rem', fontWeight: 600, color: selected === 'customers' ? '#f8fafc' : '#94a3b8' }}>Customers</div>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Customer master data</div>
      </button>
    </div>
  );
}

// File Metadata Component
function FileMetadataCard({ metadata }: { metadata: FileMetadata }) {
  const [showAllColumns, setShowAllColumns] = useState(false);
  
  const typeColors: Record<string, string> = {
    'text': '#6366f1',
    'number': '#10b981',
    'date': '#f59e0b',
    'empty': '#64748b',
  };
  
  const typeIcons: Record<string, any> = {
    'text': Type,
    'number': Hash,
    'date': Calendar,
    'empty': Square,
  };
  
  return (
    <div style={{ 
      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))',
      border: '1px solid rgba(99, 102, 241, 0.2)',
      borderRadius: '16px',
      padding: '1.5rem',
      marginBottom: '1.5rem'
    }}>
      {/* File Info Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '14px',
          background: 'linear-gradient(135deg, #6366f130, #8b5cf620)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FileSpreadsheet size={28} style={{ color: '#6366f1' }} />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>{metadata.fileName}</h4>
          <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Size: {formatFileSize(metadata.fileSize)}</span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Sheet: {metadata.activeSheet}</span>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
          <Columns size={20} style={{ color: '#6366f1', margin: '0 auto 6px' }} />
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>{metadata.columnCount}</div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Columns</div>
        </div>
        <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
          <Rows size={20} style={{ color: '#10b981', margin: '0 auto 6px' }} />
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>{metadata.rowCount.toLocaleString()}</div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rows</div>
        </div>
        <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
          <LayoutGrid size={20} style={{ color: '#f59e0b', margin: '0 auto 6px' }} />
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>{metadata.sheetNames.length}</div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sheets</div>
        </div>
        <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
          <FileType size={20} style={{ color: '#ec4899', margin: '0 auto 6px' }} />
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>{Object.keys(metadata.columnTypes).length}</div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Data Types</div>
        </div>
      </div>
      
      {/* Column Details */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h5 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>Column Details</h5>
          <button 
            onClick={() => setShowAllColumns(!showAllColumns)}
            style={{ fontSize: '0.75rem', color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {showAllColumns ? 'Show Less' : `Show All ${metadata.headers.length} Columns`}
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {(showAllColumns ? metadata.headers : metadata.headers.slice(0, 5)).map((header, i) => {
            const type = metadata.columnTypes[header] || 'text';
            const stats = metadata.columnStats[header];
            const TypeIcon = typeIcons[type] || Type;
            return (
              <div key={i} style={{ 
                display: 'flex', alignItems: 'center', gap: '10px', 
                padding: '8px 12px', 
                background: 'rgba(255,255,255,0.03)', 
                borderRadius: '8px',
                borderLeft: `3px solid ${typeColors[type] || '#6366f1'}`
              }}>
                <TypeIcon size={14} style={{ color: typeColors[type] || '#6366f1' }} />
                <span style={{ fontSize: '0.8rem', color: '#f8fafc', flex: 1, fontWeight: 500 }}>{header}</span>
                <span style={{ 
                  fontSize: '0.7rem', 
                  color: typeColors[type] || '#64748b',
                  background: `${typeColors[type]}20` || 'rgba(99, 102, 241, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  textTransform: 'capitalize'
                }}>
                  {type}
                </span>
                {stats && (
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {stats.unique} unique
                  </span>
                )}
              </div>
            );
          })}
          {!showAllColumns && metadata.headers.length > 5 && (
            <div style={{ textAlign: 'center', padding: '8px', fontSize: '0.75rem', color: '#64748b' }}>
              + {metadata.headers.length - 5} more columns
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Excel Preview Component
function ExcelPreview({ 
  headers, 
  rows, 
  type,
  onConfirm,
  onCancel,
  currentPage,
  totalPages,
  onPageChange,
  fileMetadata
}: { 
  headers: string[]; 
  rows: any[]; 
  type: string;
  onConfirm: () => void;
  onCancel: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  fileMetadata?: FileMetadata;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(headers));
  
  const filteredRows = rows.filter(row => 
    Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  
  const pageSize = 10;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + pageSize);
  
  const toggleRow = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };
  
  const toggleAll = () => {
    if (selectedRows.size === paginatedRows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedRows.map((_, i) => startIndex + i)));
    }
  };
  
  const toggleColumn = (header: string) => {
    const newVisible = new Set(visibleColumns);
    if (newVisible.has(header)) {
      if (newVisible.size > 1) newVisible.delete(header);
    } else {
      newVisible.add(header);
    }
    setVisibleColumns(newVisible);
  };
  
  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
      {/* File Metadata */}
      {fileMetadata && <FileMetadataCard metadata={fileMetadata} />}
      
      {/* Preview Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f130, #8b5cf620)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Table size={20} style={{ color: '#6366f1' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Data Preview</h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0 0' }}>
              {filteredRows.length.toLocaleString()} of {rows.length.toLocaleString()} records • {type === 'customers' ? 'Customer Master' : 'Sales Orders'}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '8px 10px 8px 32px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '0.8rem',
                width: '160px',
              }}
            />
          </div>
          <button 
            onClick={() => setShowColumnSelector(!showColumnSelector)}
            className="btn-modern btn-secondary-modern"
            style={{ padding: '8px 12px', fontSize: '0.8rem' }}
          >
            <Columns size={14} />
            Columns
          </button>
          <button onClick={onCancel} className="btn-modern btn-secondary-modern" style={{ padding: '8px 12px' }}>
            <X size={16} />
          </button>
          <button onClick={onConfirm} className="btn-modern btn-primary-modern" style={{ padding: '8px 16px' }}>
            <Check size={16} />
            Confirm
          </button>
        </div>
      </div>
      
      {/* Column Selector */}
      {showColumnSelector && (
        <div style={{ 
          background: 'rgba(255,255,255,0.03)', 
          border: '1px solid rgba(255,255,255,0.1)', 
          borderRadius: '12px',
          padding: '12px',
          marginBottom: '1rem'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px' }}>Select columns to display:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {headers.map(header => (
              <button
                key={header}
                onClick={() => toggleColumn(header)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  border: 'none',
                  cursor: 'pointer',
                  background: visibleColumns.has(header) ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.05)',
                  color: visibleColumns.has(header) ? '#818cf8' : '#64748b',
                }}
              >
                {visibleColumns.has(header) ? '✓ ' : ''}{header}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Data Table */}
      <div style={{ 
        background: 'rgba(255,255,255,0.02)', 
        border: '1px solid rgba(255,255,255,0.05)', 
        borderRadius: '16px',
        overflow: 'hidden',
        marginBottom: '1rem'
      }}>
        <div style={{ maxHeight: '400px', overflow: 'auto' }}>
          <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'rgba(15, 23, 42, 0.98)', zIndex: 10 }}>
              <tr>
                <th style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', width: '36px' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedRows.size === paginatedRows.length && paginatedRows.length > 0}
                    onChange={toggleAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                {Array.from(visibleColumns).map((header, i) => (
                  <th key={i} style={{ 
                    padding: '10px', 
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'left',
                    color: '#94a3b8',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    fontSize: '0.75rem',
                  }}>
                    {header.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, rowIndex) => (
                <tr key={startIndex + rowIndex} style={{ 
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  background: selectedRows.has(startIndex + rowIndex) ? 'rgba(99, 102, 241, 0.1)' : rowIndex % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                }}>
                  <td style={{ padding: '8px 10px' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedRows.has(startIndex + rowIndex)}
                      onChange={() => toggleRow(startIndex + rowIndex)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  {Array.from(visibleColumns).map((header, colIndex) => (
                    <td key={colIndex} style={{ padding: '8px 10px', color: '#f8fafc', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row[header] !== undefined ? String(row[header]) : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination & Selection Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredRows.length)} of {filteredRows.length} records
          </span>
          {selectedRows.size > 0 && (
            <span style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 500 }}>
              {selectedRows.size} selected
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn-modern btn-secondary-modern"
            style={{ padding: '6px 10px' }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '0.8rem', color: '#f8fafc', padding: '0 12px' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn-modern btn-secondary-modern"
            style={{ padding: '6px 10px' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Upload Page Component
export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('upload');
  const [result, setResult] = useState<UploadResult | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadType, setUploadType] = useState<UploadType>(null);
  const [detectedType, setDetectedType] = useState<string>('');
  
  // Preview data state
  const [previewData, setPreviewData] = useState<{
    headers: string[];
    rows: any[];
    type: 'orders' | 'customers';
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | undefined>(undefined);
  
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
          
          const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
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
      reader.readAsBinaryString(file);
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
      setApiErrors(resultData.errors || []);

      setProgress(100);
      setCurrentStep(3);

      setResult({
        total: previewData.rows.length,
        valid: validData.length,
        errors: validationErrors.length,
        duplicates: validationErrors.filter(e => e.message.includes('Duplicate')).length,
        saved: resultData.saved || 0,
        headers: previewData.headers,
      });

      setErrors(validationErrors);
      setViewMode('complete');
      
      window.dispatchEvent(new CustomEvent('dashboard-refresh'));
      refreshData();

    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      setViewMode('upload');
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setFiles([file]);
    
    setViewMode('processing');
    setCurrentStep(1);
    setProgress(25);
    
    try {
      const { data, headers, type, metadata } = await processExcel(file);
      setProgress(50);
      
      setPreviewData({ headers, rows: data, type });
      setFileMetadata(metadata);
      setCurrentPage(1);
      setViewMode('preview');
      
    } catch (error) {
      console.error('Preview error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process file');
      setViewMode('upload');
    }
  }, [uploadType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 
      'application/vnd.ms-excel': ['.xls'], 
      'text/csv': ['.csv'] 
    },
    maxFiles: 1,
    disabled: viewMode === 'processing' && progress > 0 && progress < 100,
  });

  const reset = () => {
    setFiles([]);
    setViewMode('upload');
    setResult(null);
    setErrors([]);
    setApiErrors([]);
    setCurrentStep(0);
    setProgress(0);
    setErrorMessage('');
    setDetectedType('');
    setPreviewData(null);
    setFileMetadata(undefined);
    setCurrentPage(1);
  };

  const totalPreviewPages = previewData ? Math.ceil(previewData.rows.length / 10) : 1;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', background: 'linear-gradient(90deg, #f8fafc, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Upload Data
        </h1>
        <p style={{ color: '#94a3b8' }}>Import orders or customers from Excel files with detailed preview</p>
      </div>
      
      {/* Existing Data Alert */}
      {hasData && viewMode === 'upload' && (
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05))',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '16px',
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <Database size={20} style={{ color: '#6366f1' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>
              Existing Data Found
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              {excelData?.orders.length || 0} orders • {excelData?.customers.length || 0} customers • Uploaded {excelData?.uploadedAt ? new Date(excelData.uploadedAt).toLocaleDateString() : 'Unknown'}
            </div>
          </div>
          <Link href="/forecasting" className="btn-modern btn-primary-modern" style={{ textDecoration: 'none' }}>
            <BarChart3 size={16} />
            View Forecast
          </Link>
        </div>
      )}

      {/* Step Indicator */}
      {viewMode !== 'preview' && <StepIndicator currentStep={currentStep} />}

      {/* Main Content */}
      <div className="card-modern" style={{ minHeight: 400 }}>
        {viewMode === 'upload' && (
          <>
            <UploadTypeSelector selected={uploadType} onSelect={setUploadType} />
            
            <div {...getRootProps()} className="upload-zone-modern" style={{ borderColor: isDragActive ? '#6366f1' : 'rgba(99, 102, 241, 0.3)', animation: 'fadeInUp 0.5s ease-out' }}>
              <input {...getInputProps()} />
              <div style={{ width: '100px', height: '100px', borderRadius: '24px', background: 'linear-gradient(135deg, #6366f130, #8b5cf620)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: isDragActive ? '0 0 40px rgba(99, 102, 241, 0.4)' : '0 0 20px rgba(99, 102, 241, 0.2)', transition: 'all 0.4s', transform: isDragActive ? 'scale(1.1)' : 'scale(1)' }}>
                <FileSpreadsheet size={48} style={{ color: '#6366f1' }} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
                {uploadType ? `Drop your ${uploadType} file here` : 'Select upload type above'}
              </h3>
              <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                {uploadType ? 'or click to browse from your computer' : 'Choose whether to upload orders or customers'}
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {['.xlsx', '.xls', '.csv'].map(ext => (
                  <span key={ext} style={{ padding: '6px 12px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '8px', fontSize: '0.8rem', color: '#818cf8' }}>{ext}</span>
                ))}
              </div>
            </div>
          </>
        )}

        {viewMode === 'processing' && (
          <div style={{ textAlign: 'center', padding: '3rem', animation: 'fadeIn 0.3s' }}>
            <ProgressRing progress={progress} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
              Processing {files[0]?.name}
            </h3>
            <p style={{ color: '#64748b' }}>Detected type: <span style={{ color: '#6366f1', fontWeight: 600 }}>{detectedType}</span></p>
          </div>
        )}

        {viewMode === 'preview' && previewData && (
          <ExcelPreview
            headers={previewData.headers}
            rows={previewData.rows}
            type={previewData.type}
            onConfirm={handleConfirmUpload}
            onCancel={() => { setViewMode('upload'); setPreviewData(null); setFileMetadata(undefined); }}
            currentPage={currentPage}
            totalPages={totalPreviewPages}
            onPageChange={setCurrentPage}
            fileMetadata={fileMetadata}
          />
        )}

        {viewMode === 'complete' && result && (
          <div style={{ animation: 'fadeInUp 0.5s ease-out' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <StatCard label="Total Records" value={result.total} color="#6366f1" icon={FileSpreadsheet} />
              <StatCard label="Valid & Saved" value={result.saved} color="#10b981" icon={CheckCircle} />
              <StatCard label="Errors" value={result.errors + apiErrors.length} color="#ef4444" icon={AlertCircle} />
              <StatCard label="Duplicates" value={result.duplicates} color="#f59e0b" icon={Trash2} />
            </div>

            {(errors.length > 0 || apiErrors.length > 0) && (
              <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <AlertCircle size={20} /> Data Validation Errors
                  </h4>
                  {result.duplicates > 0 && (
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '4px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={14} /> {result.duplicates} Duplicates Dropped
                    </span>
                  )}
                </div>
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ color: '#94a3b8', textAlign: 'left' }}>
                        <th style={{ padding: '8px' }}>Row</th>
                        <th style={{ padding: '8px' }}>Field</th>
                        <th style={{ padding: '8px' }}>Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {errors.slice(0, 10).map((e, i) => (
                        <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '8px', color: '#f8fafc' }}>{e.row}</td>
                          <td style={{ padding: '8px' }}><span className="badge-modern badge-info-modern">{e.field}</span></td>
                          <td style={{ padding: '8px', color: '#f87171' }}>{e.message}</td>
                        </tr>
                      ))}
                      {apiErrors.slice(0, 10).map((e, i) => (
                        <tr key={`api-${i}`} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '8px', color: '#f8fafc' }} colSpan={3}>{e}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #10b981, #34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }}>
                <Check size={28} style={{ color: 'white' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399', marginBottom: '4px' }}>Upload Complete!</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '12px' }}>{result.saved} records saved successfully to {detectedType}</p>
                
                {result.headers && result.headers.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Detected Columns:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {result.headers.slice(0, 8).map((h: string, i: number) => (
                        <span key={i} style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                          {h.replace(/_/g, ' ')}
                        </span>
                      ))}
                      {result.headers.length > 8 && (
                        <span style={{ fontSize: '0.75rem', color: '#64748b', padding: '2px 8px' }}>+ {result.headers.length - 8} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={reset} className="btn-modern btn-secondary-modern">Upload Another</button>
                <Link href="/forecasting" className="btn-modern btn-primary-modern" style={{ textDecoration: 'none' }}>View Forecasting <ArrowRight size={18} /></Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
