'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Calculator, 
  TrendingDown, 
  DollarSign, 
  Truck,
  AlertCircle,
  CheckCircle2,
  Info,
  Download,
  RefreshCw
} from 'lucide-react';
import { useData } from '@/lib/DataContext';
import { 
  calculateEOQ, 
  calculateReorderPoint,
  calculateReplenishment,
  calculateClosingStock
} from '@/lib/forecasting';
import { MATERIALS, HISTORICAL_DATA } from '@/lib/mock-data';

interface OptimizerResult {
  materialId: string;
  materialName: string;
  category: string;
  priceUSD: number;
  currentStock: number;
  avgMonthlySales: number;
  safetyStock: number;
  leadTimeDays: number;
  orderingCost: number;
  holdingCostPct: number;
  // Calculated values
  eoq: number;
  reorderPoint: number;
  orderPrompt: number;
  orderPromptValue: number;
  stockCoverage: number;
  annualDemand: number;
  holdingCostPerUnit: number;
}

export default function OrderOptimizerPage() {
  const { materials, historicalData } = useData();
  const [serviceLevel, setServiceLevel] = useState<number>(95);

  // Calculate optimizer results for all materials
  const optimizerResults: OptimizerResult[] = useMemo(() => {
    return MATERIALS.map(mat => {
      const matHistory = historicalData[mat.id] || HISTORICAL_DATA[mat.id] || [];
      const latest = matHistory[matHistory.length - 1] || {
        openingStock: 1000,
        stockInTransit: 0,
        actualSales: 0,
        safetyStock: 200,
        forecast: 1000
      };

      // Calculate current stock
      const currentStock = calculateClosingStock(
        latest.openingStock,
        latest.stockInTransit,
        latest.actualSales
      );

      // Calculate average monthly sales
      const salesValues = matHistory
        .filter((h: any) => h.actualSales > 0)
        .map((h: any) => h.actualSales);
      
      const avgMonthlySales = salesValues.length > 0
        ? Math.round(salesValues.reduce((a: number, b: number) => a + b, 0) / salesValues.length)
        : Math.round(latest.forecast * 0.8);

      // Annual demand
      const annualDemand = avgMonthlySales * 12;

      // Holding cost per unit per year
      const holdingCostPerUnit = mat.priceUSD * (mat.holdingCostPct || 0.20);

      // Calculate EOQ
      const eoq = calculateEOQ(annualDemand, mat.orderingCost || 50, holdingCostPerUnit);

      // Calculate reorder point
      const avgDailyDemand = avgMonthlySales / 30;
      const reorderPoint = calculateReorderPoint(
        avgDailyDemand,
        mat.leadTimeDays || 14,
        latest.safetyStock
      );

      // Calculate Order Prompt (Replenishment)
      const orderPrompt = calculateReplenishment(
        latest.forecast,
        latest.safetyStock,
        currentStock
      );

      // Stock coverage in months
      const stockCoverage = avgMonthlySales > 0 ? currentStock / avgMonthlySales : 0;

      return {
        materialId: mat.id,
        materialName: mat.description,
        category: mat.category || 'Uncategorized',
        priceUSD: mat.priceUSD,
        currentStock,
        avgMonthlySales,
        safetyStock: latest.safetyStock,
        leadTimeDays: mat.leadTimeDays || 14,
        orderingCost: mat.orderingCost || 50,
        holdingCostPct: mat.holdingCostPct || 0.20,
        eoq,
        reorderPoint,
        orderPrompt,
        orderPromptValue: orderPrompt * mat.priceUSD,
        stockCoverage,
        annualDemand,
        holdingCostPerUnit,
      };
    });
  }, [materials, historicalData]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalOrderPrompt = optimizerResults.reduce((sum, r) => sum + r.orderPrompt, 0);
    const totalOrderPromptValue = optimizerResults.reduce((sum, r) => sum + r.orderPromptValue, 0);
    const lowStockItems = optimizerResults.filter(r => r.stockCoverage < 1).length;
    const optimalItems = optimizerResults.filter(r => r.stockCoverage >= 1 && r.stockCoverage <= 3).length;

    return {
      totalOrderPrompt,
      totalOrderPromptValue,
      lowStockItems,
      optimalItems,
    };
  }, [optimizerResults]);

  const handleExport = async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    const rows = optimizerResults.map(r => ({
      'SKU ID': r.materialId,
      'Description': r.materialName,
      'Category': r.category,
      'Price (USD)': r.priceUSD,
      'Current Stock': r.currentStock,
      'Avg Monthly Sales': r.avgMonthlySales,
      'Safety Stock': r.safetyStock,
      'EOQ (Units)': Math.round(r.eoq),
      'Reorder Point': Math.round(r.reorderPoint),
      'Order Prompt (Units)': r.orderPrompt,
      'Order Prompt (Value $)': r.orderPromptValue.toFixed(2),
      'Stock Coverage (Months)': r.stockCoverage.toFixed(2),
      'Formula: Order Prompt': '= max(0, (Forecast + Safety Stock) - Closing Stock)',
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Order_Optimizer');
    XLSX.writeFile(wb, 'Tenchi_Order_Optimizer.xlsx');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                <Package className="h-6 w-6 text-indigo-500" />
                Order Optimizer
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                EOQ calculation and order prompt generation with safety stock
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700">
                <RefreshCw size={16} />
                <span className="hidden sm:inline">Recalculate</span>
              </button>
              <button onClick={handleExport} className="flex items-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors">
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/20">
                <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">Total Order Prompt</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {summary.totalOrderPrompt.toLocaleString()} <span className="text-sm font-normal">units</span>
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/20">
                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">Order Prompt Value</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  ${(summary.totalOrderPromptValue / 1000).toFixed(1)}k
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/20">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">Low Stock Items</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{summary.lowStockItems}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/20">
                <Calculator className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">EOQ Optimized</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{summary.optimalItems}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Formula Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4 sm:p-6"
        >
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Info className="h-5 w-5 text-indigo-500" />
            Calculation Formulas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-4 w-4 text-indigo-500" />
                <span className="font-medium text-gray-900 dark:text-white">EOQ</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-slate-400 mb-2">
                Economic Order Quantity minimizes total inventory costs
              </p>
              <code className="text-xs bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">
                √(2 × Annual Demand × Order Cost / Holding Cost)
              </code>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-4 w-4 text-emerald-500" />
                <span className="font-medium text-gray-900 dark:text-white">Reorder Point</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-slate-400 mb-2">
                Stock level that triggers a new order
              </p>
              <code className="text-xs bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">
                (Avg Daily Demand × Lead Time) + Safety Stock
              </code>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-amber-500" />
                <span className="font-medium text-gray-900 dark:text-white">Order Prompt</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-slate-400 mb-2">
                Recommended quantity to order (considers safety stock)
              </p>
              <code className="text-xs bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">
                Max(0, (Forecast + Safety Stock) - Current Stock)
              </code>
            </div>
          </div>
        </motion.div>

        {/* Order Prompt Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 overflow-hidden"
        >
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Order Prompt Recommendations
              </h3>
              <span className="text-xs text-gray-500 dark:text-slate-400">
                Based on forecast + safety stock requirements
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400">SKU ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400">Current Stock</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400">Safety Stock</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400">EOQ</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400">Order Prompt (Units)</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400">Order Prompt (Value)</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {optimizerResults.map((item, i) => (
                  <motion.tr
                    key={item.materialId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 * i }}
                    className="border-t border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-slate-400">{item.materialId}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{item.materialName}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{item.category}</td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-slate-400">
                      {item.currentStock.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-slate-400">
                      {item.safetyStock.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-slate-400">
                      {item.eoq.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.orderPrompt > 0 ? (
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">
                          {item.orderPrompt.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.orderPromptValue > 0 ? (
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          ${item.orderPromptValue.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.stockCoverage < 1 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-500/20 text-xs font-medium text-red-700 dark:text-red-400">
                          <AlertCircle size={12} />
                          Order Now
                        </span>
                      ) : item.orderPrompt > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-xs font-medium text-amber-700 dark:text-amber-400">
                          <Package size={12} />
                          Replenish
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 size={12} />
                          Optimal
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 p-4 sm:p-6"
          >
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-indigo-500" />
              Cost Optimization
            </h4>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
              EOQ helps minimize total inventory costs by balancing ordering costs against holding costs.
              Using the optimal order quantity can reduce costs by 15-25%.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-400">Average Order Cost</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ${Math.round(optimizerResults.reduce((sum, r) => sum + r.orderingCost, 0) / optimizerResults.length)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-400">Average Holding Cost</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {Math.round(optimizerResults.reduce((sum, r) => sum + r.holdingCostPct, 0) / optimizerResults.length * 100)}%
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 p-4 sm:p-6"
          >
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Safety Stock Protection
            </h4>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
              Safety stock protects against stockouts during lead time. Order prompt includes safety 
              stock requirements to maintain service level targets.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-400">Service Level Target</span>
                <span className="font-medium text-gray-900 dark:text-white">{serviceLevel}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-400">Avg Lead Time</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {Math.round(optimizerResults.reduce((sum, r) => sum + r.leadTimeDays, 0) / optimizerResults.length)} days
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
