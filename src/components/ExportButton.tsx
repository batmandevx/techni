'use client';

import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, FileJson, X } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExportButtonProps {
  data: any[];
  filename?: string;
  onExport?: () => void;
}

export function ExportButton({ data, filename = 'export', onExport }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
    setIsOpen(false);
    onExport?.();
  };

  const exportToCSV = () => {
    const headers = Object.keys(data[0] || {}).join(',');
    const rows = data.map((row) => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    setIsOpen(false);
    onExport?.();
  };

  const exportToJSON = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    setIsOpen(false);
    onExport?.();
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-modern btn-secondary-modern"
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <Download size={18} />
        Export
      </button>

      {isOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999,
            }}
            onClick={() => setIsOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.98))',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '16px',
              padding: '8px',
              minWidth: '200px',
              zIndex: 1000,
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
              animation: 'fadeInUp 0.2s ease-out',
            }}
          >
            <ExportOption
              icon={FileSpreadsheet}
              label="Excel (.xlsx)"
              desc="Best for analysis"
              color="#10b981"
              onClick={exportToExcel}
            />
            <ExportOption
              icon={FileText}
              label="CSV (.csv)"
              desc="Universal format"
              color="#6366f1"
              onClick={exportToCSV}
            />
            <ExportOption
              icon={FileJson}
              label="JSON (.json)"
              desc="For developers"
              color="#f59e0b"
              onClick={exportToJSON}
            />
          </div>
        </>
      )}
    </div>
  );
}

function ExportOption({
  icon: Icon,
  label,
  desc,
  color,
  onClick,
}: {
  icon: any;
  label: string;
  desc: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '12px 16px',
        background: 'transparent',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'all 0.2s',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>{label}</div>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{desc}</div>
      </div>
    </button>
  );
}
