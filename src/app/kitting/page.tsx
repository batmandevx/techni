'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Puzzle, Package, Plus, Search, ArrowRight, 
  CheckCircle2, Clock, AlertCircle, Boxes,
  Download, Filter, MoreHorizontal, TrendingUp
} from 'lucide-react';

// Mock Kit Masters
const MOCK_KITS = [
  {
    id: 'kit-001',
    kitSkuId: 'SKU-KIT001',
    kitName: 'Promo Pack 1+1',
    description: 'Buy One Get One Free - Coffee Candy',
    isActive: true,
    components: [
      { id: 'comp-001', componentSkuId: 'SKU-A001', componentName: 'Coffee Candy Premium', quantity: 2, uom: 'EA' },
    ],
    allocations: [
      { id: 'alloc-001', orderId: 'ORD-2026-001', quantity: 500, status: 'ALLOCATED', allocatedDate: '2026-03-20' },
      { id: 'alloc-002', orderId: 'ORD-2026-005', quantity: 300, status: 'READY', allocatedDate: '2026-03-21' },
    ],
  },
  {
    id: 'kit-002',
    kitSkuId: 'SKU-KIT002',
    kitName: 'Combo Shampoo + Conditioner',
    description: 'Hair Care Duo Pack',
    isActive: true,
    components: [
      { id: 'comp-002', componentSkuId: 'SKU-SH001', componentName: 'Herbal Shampoo', quantity: 1, uom: 'EA' },
      { id: 'comp-003', componentSkuId: 'SKU-CN001', componentName: 'Herbal Conditioner', quantity: 1, uom: 'EA' },
      { id: 'comp-004', componentSkuId: 'PKG-BOX001', componentName: 'Gift Box Medium', quantity: 1, uom: 'EA' },
    ],
    allocations: [
      { id: 'alloc-003', orderId: 'ORD-2026-012', quantity: 200, status: 'PLANNED', allocatedDate: '2026-03-22' },
    ],
  },
  {
    id: 'kit-003',
    kitSkuId: 'SKU-KIT003',
    kitName: 'Face Care Bundle',
    description: 'Face Wash + Moisturizer Combo',
    isActive: true,
    components: [
      { id: 'comp-005', componentSkuId: 'SKU-FW001', componentName: 'Gentle Face Wash', quantity: 1, uom: 'EA' },
      { id: 'comp-006', componentSkuId: 'SKU-MO001', componentName: 'Daily Moisturizer', quantity: 1, uom: 'EA' },
    ],
    allocations: [
      { id: 'alloc-004', orderId: 'ORD-2026-018', quantity: 150, status: 'ASSEMBLED', allocatedDate: '2026-03-19' },
    ],
  },
];

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKit, setSelectedKit] = useState<string | null>(null);

  // Calculate KPIs
  const totalKits = MOCK_KITS.length;
  const totalAllocations = MOCK_KITS.reduce((sum, kit) => sum + kit.allocations.length, 0);
  const readyToShip = MOCK_KITS.reduce((sum, kit) => 
    sum + kit.allocations.filter(a => a.status === 'READY').length, 0
  );
  const inAssembly = MOCK_KITS.reduce((sum, kit) => 
    sum + kit.allocations.filter(a => a.status === 'ASSEMBLED').length, 0
  );

  const filteredKits = MOCK_KITS.filter(kit =>
    kit.kitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kit.kitSkuId.toLowerCase().includes(searchTerm.toLowerCase())
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

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search kit name, SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      {/* Kits Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredKits.map((kit) => (
          <motion.div
            key={kit.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-5 shadow-sm"
          >
            {/* Kit Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Puzzle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{kit.kitName}</h3>
                  <p className="text-sm text-gray-500">{kit.kitSkuId}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${kit.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                {kit.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{kit.description}</p>

            {/* Components */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Components</p>
              <div className="space-y-2">
                {kit.components.map((component) => (
                  <div key={component.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                        <Package className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{component.componentName}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {component.quantity} {component.uom}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Allocations */}
            <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Allocations</p>
                <span className="text-xs text-gray-400">{kit.allocations.length} orders</span>
              </div>
              <div className="space-y-2">
                {kit.allocations.map((allocation) => {
                  const status = STATUS_CONFIG[allocation.status] || STATUS_CONFIG.PLANNED;
                  const StatusIcon = status.icon;
                  
                  return (
                    <div key={allocation.id} className="flex items-center justify-between p-2.5 border border-gray-100 dark:border-slate-700 rounded-lg">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`w-4 h-4 ${status.color}`} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{allocation.orderId}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{allocation.quantity} units</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                Allocate
              </button>
              <button className="flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors">
                <Boxes className="w-4 h-4" />
                View BOM
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredKits.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
            <Puzzle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No kits found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your search or create a new kit</p>
        </motion.div>
      )}
    </div>
  );
}
