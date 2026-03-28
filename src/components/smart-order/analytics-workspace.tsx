"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, Printer } from "lucide-react";
import { PageHero, Panel, StatCard, EmptyState } from "@/components/smart-order/ui";
import { SmartAnalyticsSnapshot, SmartOrderCustomer } from "@/lib/smart-order/types";
import { formatCurrency } from "@/lib/smart-order/utils";

const palette = ["#1a1a2e", "#e89a2d", "#22c55e", "#0ea5e9", "#ef4444", "#8b5cf6"];

function defaultDate(offsetDays: number) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export function AnalyticsWorkspace() {
  const [analytics, setAnalytics] = useState<SmartAnalyticsSnapshot | null>(null);
  const [customers, setCustomers] = useState<SmartOrderCustomer[]>([]);
  const [filters, setFilters] = useState({
    dateFrom: defaultDate(-30),
    dateTo: defaultDate(1),
    salesOrg: "",
    customer: "",
    status: "ALL",
  });

  async function loadAnalytics(nextFilters = filters) {
    const params = new URLSearchParams(
      Object.entries(nextFilters).filter(([, value]) => Boolean(value)),
    );
    const response = await fetch(`/api/analytics?${params.toString()}`);
    const data = (await response.json()) as SmartAnalyticsSnapshot;
    setAnalytics(data);
  }

  async function loadCustomers() {
    const response = await fetch("/api/master-data/customers");
    const data = (await response.json()) as { customers: SmartOrderCustomer[] };
    setCustomers(data.customers);
  }

  useEffect(() => {
    void loadCustomers();
    void loadAnalytics();
  }, []);

  useEffect(() => {
    void loadAnalytics(filters);
  }, [filters.dateFrom, filters.dateTo, filters.salesOrg, filters.customer, filters.status]);

  const salesOrgOptions = useMemo(() => Array.from(new Set(customers.map((customer) => customer.salesOrg))), [customers]);

  function exportCsv() {
    if (!analytics) return;

    const rows = [
      ["Period", "Orders", "Value"],
      ...analytics.ordersOverTime.map((row) => [row.period, row.count, row.value]),
    ];
    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "tenchi-smartorder-analytics.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <PageHero
          eyebrow="MIS Reporting"
          title="Loading SmartOrder analytics..."
          description="Aggregating order value, success rates, SKU mix, and processing throughput."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="MIS Reporting"
        title="Track order creation throughput, commercial value, and processing health."
        description="The analytics workspace combines batch history, line-level order outcomes, and master-data context to surface the operational KPIs SmartOrder leaders care about most."
      />

      <Panel
        title="Filters"
        subtitle="Slice the dashboard by time, sales org, customer, and status"
        action={
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-full bg-[#e89a2d] px-4 py-2 text-sm font-semibold text-slate-950"
            >
              <Printer className="h-4 w-4" />
              Export PDF
            </button>
          </div>
        }
      >
        <div className="grid gap-3 md:grid-cols-5">
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))}
            className="rounded-2xl border border-slate-200 px-4 py-3"
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))}
            className="rounded-2xl border border-slate-200 px-4 py-3"
          />
          <select
            value={filters.salesOrg}
            onChange={(event) => setFilters((current) => ({ ...current, salesOrg: event.target.value }))}
            className="rounded-2xl border border-slate-200 px-4 py-3"
          >
            <option value="">All Sales Orgs</option>
            {salesOrgOptions.map((salesOrg) => (
              <option key={salesOrg} value={salesOrg}>
                {salesOrg}
              </option>
            ))}
          </select>
          <select
            value={filters.customer}
            onChange={(event) => setFilters((current) => ({ ...current, customer: event.target.value }))}
            className="rounded-2xl border border-slate-200 px-4 py-3"
          >
            <option value="">All Customers</option>
            {customers.map((customer) => (
              <option key={customer.customerNumber} value={customer.customerNumber}>
                {customer.companyName}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            className="rounded-2xl border border-slate-200 px-4 py-3"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PARTIAL_SUCCESS">Partial Success</option>
            <option value="FAILED">Failed</option>
            <option value="VALIDATED">Validated</option>
          </select>
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Orders Created"
          value={String(analytics.kpis.ordersCreated)}
          description={`${analytics.kpis.ordersCreatedChange.toFixed(1)}% vs prior period`}
          icon={Download}
          accent="bg-emerald-600"
        />
        <StatCard
          title="Total Order Value"
          value={formatCurrency(analytics.kpis.totalOrderValue)}
          description={`${analytics.kpis.totalOrderValueChange.toFixed(1)}% vs prior period`}
          icon={Printer}
          accent="bg-[#1a1a2e]"
        />
        <StatCard
          title="SKU Mix"
          value={String(analytics.kpis.skuMix)}
          description="Unique materials across the selected batches"
          icon={Download}
          accent="bg-sky-600"
        />
        <StatCard
          title="Fill Rate"
          value={`${analytics.kpis.fillRate.toFixed(1)}%`}
          description="Created quantity divided by ordered quantity"
          icon={Printer}
          accent="bg-[#e89a2d]"
        />
        <StatCard
          title="Backorders"
          value={`${analytics.kpis.backordersQty}`}
          description={`Open value ${formatCurrency(analytics.kpis.backordersValue)}`}
          icon={Download}
          accent="bg-rose-600"
        />
      </div>

      {analytics.ordersOverTime.length ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title="Orders Over Time" subtitle="Daily volume and commercial value">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.ordersOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#1a1a2e" strokeWidth={3} name="Orders" />
                  <Line type="monotone" dataKey="value" stroke="#e89a2d" strokeWidth={3} name="Value" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Order Value by Customer" subtitle="Top 10 customers by order value">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.orderValueByCustomer} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" />
                  <YAxis dataKey="customer" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1a1a2e" radius={[0, 12, 12, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="SKU Distribution" subtitle="Material category demand mix">
            {analytics.skuDistribution.length ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics.skuDistribution} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110}>
                      {analytics.skuDistribution.map((entry, index) => (
                        <Cell key={entry.name} fill={palette[index % palette.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState title="No SKU data" description="Upload and process batches to populate category mix." />
            )}
          </Panel>

          <Panel title="Processing Success Rate" subtitle="Created lines as a share of all queued lines">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="55%"
                  outerRadius="100%"
                  data={[{ name: "Success", value: analytics.kpis.successRate, fill: "#22c55e" }]}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar dataKey="value" cornerRadius={12} />
                  <Tooltip />
                  <Legend />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <p className="-mt-14 text-center text-4xl font-semibold text-slate-950">{analytics.kpis.successRate.toFixed(1)}%</p>
          </Panel>

          <Panel title="Order Status Breakdown" subtitle="Created, failed, and pending lines by day">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.statusBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="created" stackId="a" fill="#22c55e" />
                  <Bar dataKey="failed" stackId="a" fill="#ef4444" />
                  <Bar dataKey="pending" stackId="a" fill="#94a3b8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Average Processing Time" subtitle="Trend of line-level processing duration">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.processingTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="avgMs" stroke="#0ea5e9" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      ) : (
        <EmptyState
          title="No analytics available yet"
          description="Run at least one SmartOrder batch so the MIS dashboard has processed data to chart."
        />
      )}
    </div>
  );
}
