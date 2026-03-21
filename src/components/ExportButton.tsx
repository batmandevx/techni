'use client';

import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, FileJson } from 'lucide-react';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
      >
        <Download size={18} />
        <span className="hidden sm:inline">Export</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-2 min-w-[220px] z-50 shadow-xl"
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-left"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <div className="font-semibold text-gray-900 dark:text-white text-sm">{label}</div>
        <div className="text-xs text-gray-500 dark:text-slate-400">{desc}</div>
      </div>
    </button>
  );
}
