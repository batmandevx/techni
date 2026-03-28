'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Boxes, Factory, Calendar, AlertTriangle, CheckCircle2, 
  Clock, Package, TrendingUp, Download, Plus, Search,
  ChevronRight, MoreHorizontal, Truck, Warehouse
} from 'lucide-react';

// Mock BOM data
const MOCK_BOMS = [
  {
    id: 'bom-001',
    skuId: 'SKU-FG001',
    skuName: 'Premium Gift Box',
    version: 1,
    isActive: true,
    lines: [
      { id: 'line-001', materialId: 'SKU-A001', materialName: 'Coffee Candy', materialType: 'RM', quantity: 10, uom: 'EA' },
      { id: 'line-002', materialId: 'SKU-B002', materialName: 'Fruit Jelly', materialType: 'RM', quantity: 8, uom: 'EA' },
      { id: 'line-003', materialId: 'PKG-001', materialName: 'Gift Box Large', materialType: 'PM', quantity: 1, uom: 'EA' },
    ],
  },
  {
    id: 'bom-002',
    skuId: 'SKU-FG002',
    skuName: 'Assorted Candy Pack',
    version: 2,
    isActive: true,
    lines: [
      { id: 'line-004', materialId: 'SKU-C003', materialName: 'Chocolate', materialType: 'RM', quantity: 12, uom: 'EA' },
      { id: 'line-005', materialId: 'SKU-D004', materialName: 'Mint Candy', materialType: 'RM', quantity: 15, uom: 'EA' },
      { id: 'line-006', materialId: 'PKG-002', materialName: 'Plastic Box', materialType: 'PM', quantity: 1, uom: 'EA' },
    ],
  },
];

// Mock Production Plans
const MOCK_PRODUCTION = [
  {
    id: 'plan-001',
    skuId: 'SKU-FG001',
    skuName: 'Premium Gift Box',
    plannedDate: '2026-04-01',
    quantity: 5000,
    status: 'CONFIRMED',
    priority: 1,
    materialsAvailable: true,
    vendorETAs: [
      { materialId: 'SKU-A001', eta: '2026-03-28', quantity: 50000, status: 'IN_TRANSIT' },
      { materialId: 'SKU-B002', eta: '2026-03-27', quantity: 40000, status: 'ARRIVED' },
    ],
  },
  {
    id: 'plan-002',
    skuId: 'SKU-FG002',
    skuName: 'Assorted Candy Pack',
    plannedDate: '2026-04-05',
    quantity: 8000,
    status: 'PLANNED',
    priority: 2,
    materialsAvailable: false,
    vendorETAs: [
      { materialId: 'SKU-C003', eta: '2026-04-02', quantity: 96000, status: 'EXPECTED' },
    ],
  },
];

// Mock Vendor ETAs
const MOCK_VENDOR_ETAS = [
  { id: 'eta-001', vendorName: 'Shanghai Materials Co.', materialId: 'SKU-A001', materialName: 'Coffee Candy', etaDate: '2026-03-28', quantity: 50000, containerNumber: 'MSKU1234567', status: 'IN_TRANSIT' },
  { id: 'eta-002', vendorName: 'Rotterdam Suppliers BV', materialId: 'SKU-B002', materialName: 'Fruit Jelly', etaDate: '2026-03-27', quantity: 40000, containerNumber: 'MSCU7654321', status: 'ARRIVED' },
  { id: 'eta-003', vendorName: 'Singapore Ingredients', materialId: 'SKU-C003', materialName: 'Chocolate', etaDate: '2026-04-02', quantity: 96000, containerNumber: 'HLCU9876543', status: 'EXPECTED' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PLANNED: { label: 'Planned', color: 'text-blue-600', bg: 'bg-blue-100' },
  CONFIRMED: { label: 'Confirmed', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-amber-600', bg: 'bg-amber-100' },
  COMPLETED: { label: 'Completed', color: 'text-gray-600', bg: 'bg-gray-100' },
  DELAYED: { label: 'Delayed', color: 'text-rose-600', bg: 'bg-rose-100' },
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

export default function ProductionPlanningPage() {
  const [activeTab, setActiveTab] = useState<'plans' | 'bom' | 'etas'>('plans');
  const [searchTerm, setSearchTerm] = useState('');

  const kpis = {
    totalPlans: MOCK_PRODUCTION.length,
    confirmed: MOCK_PRODUCTION.filter(p => p.status === 'CONFIRMED').length,
    delayed: MOCK_PRODUCTION.filter(p => p.status === 'DELAYED').length,
    materialsExpected: MOCK_VENDOR_ETAS.filter(e => e.status === 'EXPECTED').length,
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Production Planning
            </h1>
            <p className="text-gray-500 dark:text-slate-400 mt-1">
              BOM management, MRP, and production scheduling
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl text-sm font-medium hover:from-indigo-600 hover:to-violet-700 transition-all shadow-lg shadow-indigo-500/25">
              <Plus className="w-4 h-4" />
              New Plan
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard title="Production Plans" value={kpis.totalPlans} subtitle="Active schedules" icon={Factory} color="bg-indigo-500" />
        <KPICard title="Confirmed" value={kpis.confirmed} subtitle="Ready to produce" icon={CheckCircle2} color="bg-emerald-500" />
        <KPICard title="Delayed" value={kpis.delayed} subtitle="Need attention" icon={AlertTriangle} color="bg-rose-500" />
        <KPICard title="Materials Expected" value={kpis.materialsExpected} subtitle="Inbound shipments" icon={Truck} color="bg-amber-500" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 dark:border-slate-700">
        {[
          { key: 'plans', label: 'Production Plans', icon: Factory },
          { key: 'bom', label: 'Bill of Materials', icon: Boxes },
          { key: 'etas', label: 'Vendor ETAs', icon: Truck },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Production Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          {MOCK_PRODUCTION.map((plan) => {
            const status = STATUS_CONFIG[plan.status] || STATUS_CONFIG.PLANNED;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${status.bg} flex items-center justify-center`}>
                      <Factory className={`w-6 h-6 ${status.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{plan.skuName}</h3>
                      <p className="text-sm text-gray-500">{plan.skuId} • {plan.quantity.toLocaleString()} units</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-600">
                      Priority {plan.priority}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Planned Date</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(plan.plannedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Materials Status</p>
                    <p className={`text-sm font-medium flex items-center gap-1.5 ${plan.materialsAvailable ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {plan.materialsAvailable ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      {plan.materialsAvailable ? 'Available' : 'Awaiting Delivery'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Last Material ETA</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {plan.vendorETAs.length > 0 
                        ? new Date(Math.max(...plan.vendorETAs.map(e => new Date(e.eta).getTime()))).toLocaleDateString()
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>

                {plan.vendorETAs.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-900/50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-2">Material Shipments</p>
                    <div className="space-y-2">
                      {plan.vendorETAs.map((eta, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300">{eta.materialId}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-500">{eta.quantity.toLocaleString()} units</span>
                            <span className="text-xs text-gray-400">ETA: {new Date(eta.eta).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* BOM Tab */}
      {activeTab === 'bom' && (
        <div className="space-y-6">
          {MOCK_BOMS.map((bom) => (
            <motion.div
              key={bom.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                    <Boxes className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{bom.skuName}</h3>
                    <p className="text-sm text-gray-500">{bom.skuId} • Version {bom.version}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${bom.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                  {bom.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-700">
                      <th className="text-left py-2 text-gray-500 font-medium">Type</th>
                      <th className="text-left py-2 text-gray-500 font-medium">Material</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Quantity</th>
                      <th className="text-left py-2 text-gray-500 font-medium">UOM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bom.lines.map((line) => (
                      <tr key={line.id} className="border-b border-gray-100 dark:border-slate-800">
                        <td className="py-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            line.materialType === 'RM' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                          }`}>
                            {line.materialType}
                          </span>
                        </td>
                        <td className="py-2">
                          <p className="font-medium text-gray-900 dark:text-white">{line.materialName}</p>
                          <p className="text-xs text-gray-500">{line.materialId}</p>
                        </td>
                        <td className="py-2 text-right font-medium text-gray-900 dark:text-white">{line.quantity}</td>
                        <td className="py-2 text-gray-500">{line.uom}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Vendor ETAs Tab */}
      {activeTab === 'etas' && (
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search materials, vendors, containers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500"
              />
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-900/50">
              <tr>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Vendor</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Material</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">Quantity</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Container</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">ETA</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_VENDOR_ETAS.map((eta) => (
                <tr key={eta.id} className="border-t border-gray-100 dark:border-slate-800">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">{eta.vendorName}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900 dark:text-white">{eta.materialName}</p>
                    <p className="text-xs text-gray-500">{eta.materialId}</p>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">{eta.quantity.toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-500">{eta.containerNumber}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">{new Date(eta.etaDate).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      eta.status === 'ARRIVED' ? 'bg-emerald-100 text-emerald-600' :
                      eta.status === 'IN_TRANSIT' ? 'bg-amber-100 text-amber-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {eta.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
