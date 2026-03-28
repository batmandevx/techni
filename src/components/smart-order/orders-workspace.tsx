"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, Loader2, PlayCircle, RefreshCcw } from "lucide-react";
import { PageHero, Panel, StatCard, StatusBadge, EmptyState } from "@/components/smart-order/ui";
import { SmartOrderBatch } from "@/lib/smart-order/types";

export function OrdersWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [batches, setBatches] = useState<SmartOrderBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<SmartOrderBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  async function loadBatches(batchId?: string | null) {
    const response = await fetch("/api/batches");
    const data = (await response.json()) as { batches: SmartOrderBatch[] };
    setBatches(data.batches);

    const nextSelectedId = batchId ?? selectedBatch?.id ?? data.batches[0]?.id;
    if (nextSelectedId) {
      await loadBatch(nextSelectedId, false);
    } else {
      setSelectedBatch(null);
    }

    setLoading(false);
  }

  async function loadBatch(batchId: string, pushQuery = true) {
    const response = await fetch(`/api/batches/${batchId}`);
    const data = (await response.json()) as { batch: SmartOrderBatch };
    setSelectedBatch(data.batch);

    if (pushQuery) {
      router.replace(`/dashboard/orders?batchId=${batchId}`);
    }
  }

  useEffect(() => {
    void loadBatches(searchParams.get("batchId"));
  }, []);

  useEffect(() => {
    if (!selectedBatch || selectedBatch.status !== "PROCESSING") {
      return;
    }

    const interval = setInterval(() => {
      void loadBatch(selectedBatch.id, false);
      void loadBatches(selectedBatch.id);
    }, 1500);

    return () => clearInterval(interval);
  }, [selectedBatch?.id, selectedBatch?.status]);

  const stats = useMemo(() => {
    const processing = batches.filter((batch) => batch.status === "PROCESSING").length;
    const completed = batches.filter((batch) => ["COMPLETED", "PARTIAL_SUCCESS"].includes(batch.status)).length;
    const created = batches.reduce((sum, batch) => sum + batch.successCount, 0);
    const total = batches.reduce((sum, batch) => sum + batch.totalOrders, 0);

    return {
      processing,
      completed,
      successRate: total ? (created / total) * 100 : 0,
    };
  }, [batches]);

  async function triggerProcessing() {
    if (!selectedBatch) return;
    setActionLoading(true);
    await fetch(`/api/batches/${selectedBatch.id}/process`, { method: "POST" });
    await loadBatch(selectedBatch.id, false);
    await loadBatches(selectedBatch.id);
    setActionLoading(false);
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Order Processing"
        title="Monitor SmartOrder batches as they convert into SAP sales orders."
        description="Validated lines are grouped by sold-to customer, dispatched to the SAP mock worker, and tracked line-by-line so operations can see exactly what was created, failed, or is waiting for retry."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Batches in Queue"
          value={String(batches.length)}
          description={`${stats.processing} actively processing`}
          icon={Loader2}
          accent="bg-[#1a1a2e]"
        />
        <StatCard
          title="Completed Batches"
          value={String(stats.completed)}
          description="Including partial-success runs"
          icon={RefreshCcw}
          accent="bg-emerald-600"
        />
        <StatCard
          title="Line Success Rate"
          value={`${stats.successRate.toFixed(1)}%`}
          description="Created lines divided by total queued lines"
          icon={PlayCircle}
          accent="bg-sky-600"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Batch Queue" subtitle="Latest uploads and their current processing state">
          {loading ? (
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading batches...
            </div>
          ) : batches.length ? (
            <div className="space-y-3">
              {batches.map((batch) => (
                <button
                  key={batch.id}
                  type="button"
                  onClick={() => loadBatch(batch.id)}
                  className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
                    selectedBatch?.id === batch.id
                      ? "border-[#e89a2d] bg-[#fff7ea]"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{batch.batchName}</p>
                      <p className="mt-1 text-sm text-slate-500">{batch.fileName}</p>
                    </div>
                    <StatusBadge status={batch.status} />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-sm text-slate-500">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em]">Orders</p>
                      <p className="mt-1 font-semibold text-slate-900">{batch.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em]">Success</p>
                      <p className="mt-1 font-semibold text-emerald-600">{batch.successCount}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em]">Failed</p>
                      <p className="mt-1 font-semibold text-rose-600">{batch.failedCount}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No batches yet"
              description="Use the upload wizard to create your first validated SmartOrder batch."
            />
          )}
        </Panel>

        <Panel
          title={selectedBatch ? selectedBatch.batchName : "Batch Detail"}
          subtitle={selectedBatch ? selectedBatch.fileName : "Select a batch from the left to inspect line statuses"}
          action={
            selectedBatch ? (
              <div className="flex flex-wrap gap-3">
                <a
                  href={`/api/batches/${selectedBatch.id}/export`}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </a>
                <button
                  type="button"
                  onClick={triggerProcessing}
                  disabled={actionLoading || selectedBatch.status === "PROCESSING"}
                  className="inline-flex items-center gap-2 rounded-full bg-[#e89a2d] px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
                  {selectedBatch.status === "PROCESSING" ? "Processing..." : "Process Batch"}
                </button>
              </div>
            ) : null
          }
        >
          {selectedBatch ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Success</p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-600">{selectedBatch.successCount}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Failed</p>
                  <p className="mt-2 text-2xl font-semibold text-rose-600">{selectedBatch.failedCount}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Pending</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{selectedBatch.pendingCount}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Progress</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {selectedBatch.report?.progressPercent ?? 0}%
                  </p>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
                  <span>Processing Progress</span>
                  <span>{selectedBatch.report?.message ?? "Awaiting processing."}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#e89a2d] transition-all"
                    style={{ width: `${selectedBatch.report?.progressPercent ?? 0}%` }}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="pb-3 pr-4 font-medium">Row</th>
                      <th className="pb-3 pr-4 font-medium">Sold-To</th>
                      <th className="pb-3 pr-4 font-medium">Material</th>
                      <th className="pb-3 pr-4 font-medium">Qty</th>
                      <th className="pb-3 pr-4 font-medium">Status</th>
                      <th className="pb-3 pr-4 font-medium">SAP Order</th>
                      <th className="pb-3 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedBatch.lines.map((line) => (
                      <tr key={line.id}>
                        <td className="py-3 pr-4 text-slate-700">{line.rowIndex}</td>
                        <td className="py-3 pr-4 text-slate-700">{line.soldTo}</td>
                        <td className="py-3 pr-4 text-slate-700">{line.material}</td>
                        <td className="py-3 pr-4 text-slate-700">{line.quantity}</td>
                        <td className="py-3 pr-4">
                          <StatusBadge status={line.status} />
                        </td>
                        <td className="py-3 pr-4 font-mono text-slate-600">{line.sapOrderNumber ?? "-"}</td>
                        <td className="py-3 text-slate-600">
                          {line.validationErrors[0] ?? line.warnings[0] ?? "No exceptions"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState
              title="Select a batch"
              description="Choose a validated or processed batch to inspect its grouped SAP order outcome."
            />
          )}
        </Panel>
      </div>
    </div>
  );
}
