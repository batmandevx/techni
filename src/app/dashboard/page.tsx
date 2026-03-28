"use client";

import { useEffect, useState } from "react";
import { BarChart3, Boxes, CheckCircle2, Clock4 } from "lucide-react";
import { PageHero, Panel, StatCard, StatusBadge, ActionLink, CurrencyText } from "@/components/smart-order/ui";

interface DashboardStats {
  ordersCreated: number;
  ordersCreatedChange: number;
  totalOrderValue: number;
  totalOrderValueChange: number;
  pendingCount: number;
  completedCount: number;
  failedCount: number;
  totalCustomers: number;
  totalMaterials: number;
}

const defaultStats: DashboardStats = {
  ordersCreated: 0,
  ordersCreatedChange: 0,
  totalOrderValue: 0,
  totalOrderValueChange: 0,
  pendingCount: 0,
  completedCount: 0,
  failedCount: 0,
  totalCustomers: 0,
  totalMaterials: 0,
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [recentBatches, setRecentBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          const data = await res.json();
          setStats({
            ordersCreated: data.kpis?.ordersCreated || 0,
            ordersCreatedChange: data.kpis?.ordersCreatedChange || 0,
            totalOrderValue: data.kpis?.totalOrderValue || 0,
            totalOrderValueChange: data.kpis?.totalOrderValueChange || 0,
            pendingCount: data.kpis?.pendingCount || 0,
            completedCount: data.kpis?.completedCount || 0,
            failedCount: data.kpis?.failedCount || 0,
            totalCustomers: data.kpis?.totalCustomers || 0,
            totalMaterials: data.kpis?.totalMaterials || 0,
          });
          setRecentBatches(data.recentBatches || []);
        }
      } catch (e) {
        console.error('Failed to fetch dashboard data:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Order Automation"
        title="Turn distributor spreadsheets into SAP-ready orders."
        description="Upload external Excel or CSV files, let the mapping engine normalize columns, validate against cached SAP masters, then process batches into sales orders with live MIS reporting."
        actions={
          <>
            <ActionLink href="/dashboard/upload" label="Upload New Batch" />
            <ActionLink href="/dashboard/orders" label="Review Order History" variant="secondary" />
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Orders Created"
          value={String(stats.ordersCreated)}
          description={`${stats.ordersCreatedChange.toFixed(1)}% vs previous period`}
          icon={CheckCircle2}
          accent="bg-emerald-600"
        />
        <StatCard
          title="Total Order Value"
          value={`$${(stats.totalOrderValue / 1000).toFixed(1)}k`}
          description={`${stats.totalOrderValueChange.toFixed(1)}% vs previous period`}
          icon={BarChart3}
          accent="bg-[#1a1a2e]"
        />
        <StatCard
          title="Pending Processing"
          value={String(stats.pendingCount)}
          description="Awaiting SAP submission"
          icon={Clock4}
          accent="bg-amber-500"
        />
        <StatCard
          title="Master Data"
          value={`${stats.totalCustomers}/${stats.totalMaterials}`}
          description="Cached customers / materials"
          icon={Boxes}
          accent="bg-sky-600"
        />
      </div>

      <Panel title="Recent Batches" subtitle="Latest upload and processing activity">
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading...</div>
        ) : recentBatches.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No batches yet. <a href="/dashboard/upload" className="text-indigo-400 hover:underline">Upload your first batch</a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200/70">
                  <th className="pb-3 pr-4 font-medium">Batch</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Orders</th>
                  <th className="pb-3 pr-4 font-medium">Success</th>
                  <th className="pb-3 pr-4 font-medium">Failed</th>
                  <th className="pb-3 pr-4 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBatches.slice(0, 5).map((batch: any) => (
                  <tr key={batch.id} className="hover:bg-slate-50/50">
                    <td className="py-3 pr-4">
                      <div className="font-medium text-slate-900">{batch.batchName}</div>
                      <div className="text-xs text-slate-500">{batch.fileName}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={batch.status} />
                    </td>
                    <td className="py-3 pr-4 text-slate-700">{batch.totalOrders}</td>
                    <td className="py-3 pr-4 text-emerald-600">{batch.successCount}</td>
                    <td className="py-3 pr-4 text-rose-600">{batch.failedCount}</td>
                    <td className="py-3 pr-4 text-slate-500">
                      {new Date(batch.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
