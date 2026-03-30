'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Puzzle, Package, Plus, Search, ArrowRight, 
  CheckCircle2, Clock, AlertCircle, Boxes,
  Download, Filter, MoreHorizontal, TrendingUp,
  Upload
} from 'lucide-react';
import Link from 'next/link';
import { useData } from '@/lib/DataContext';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  PLANNED: { label: 'Planned', color: 'text-blue-600', bg: 'bg-blue-100', icon: Clock },
  ALLOCATED: { label: 'Allocated', color: 'text-indigo-600', bg: 'bg-indigo-100', icon: Boxes },
  ASSEMBLED: { label: 'Assembled', color: 'text-amber-600', bg: 'bg-amber-100', icon: Puzzle },
  READY: { label: 'Ready', color: 'text-emerald-600', bg: 'bg-emerald-100', icon: CheckCircle2 },
  SHIPPED: { label: 'Shipped', color: 'text-gray-600', bg: 'bg-gray-100', icon: Package },
};

const KPICard = ({ title, value, subtitle, icon: Icon, color }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2 }}
    className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-5 shadow-sm"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </motion.div>
);

export default function KittingOperationsPage() {
  const { hasUploadedData } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  // No mock kits — only uploaded kit data should be displayed
  const kits: any[] = [];

  const totalKits = kits.length;
  const totalAllocations = kits.reduce((sum, kit) => sum + (kit.allocations?.length || 0), 0);
  const readyToShip = kits.reduce((sum, kit) => 
    sum + (kit.allocations?.filter((a: any) => a.status === 'READY').length || 0), 0
  );
  const inAssembly = kits.reduce((sum, kit) => 
    sum + (kit.allocations?.filter((a: any) => a.status === 'ASSEMBLED').length || 0), 0
  );

  const filteredKits = kits.filter((kit: any) =>
    kit.kitName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kit.kitSkuId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Kitting Operations
            </h1>
            <p className="text-gray-500 dark:text-slate-400 mt-1">
              Co-packing, bundle creation, and promotional kit management
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-violet-700 transition-all shadow-lg shadow-indigo-500/25">
              <Plus className="w-4 h-4" />
              New Kit
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard title="Active Kits" value={totalKits} subtitle="Kit configurations" icon={Puzzle} color="bg-indigo-500" />
        <KPICard title="Total Allocations" value={totalAllocations} subtitle="Across all kits" icon={Boxes} color="bg-blue-500" />
        <KPICard title="Ready to Ship" value={readyToShip} subtitle="Awaiting dispatch" icon={CheckCircle2} color="bg-emerald-500" />
        <KPICard title="In Assembly" value={inAssembly} subtitle="Being processed" icon={Clock} color="bg-amber-500" />
      </div>

      <div className="flex flex-col items-center justify-center py-16 text-center px-4 bg-white/5 border border-white/10 rounded-2xl">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <Puzzle className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Kit Data</h2>
        <p className="text-slate-400 max-w-md mb-8">
          Upload your kitting and bundling data to view co-packing operations and allocations.
        </p>
        <Link 
          href="/upload" 
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium transition-all"
        >
          <Upload className="w-5 h-5" />
          Upload Data
        </Link>
      </div>
    </div>
  );
}
