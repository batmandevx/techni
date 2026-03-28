"use client";

import { useEffect, useMemo, useState } from "react";
import { Database, RefreshCcw, Save, Trash2 } from "lucide-react";
import { EmptyState, PageHero, Panel } from "@/components/smart-order/ui";

type FieldConfig = {
  key: string;
  label: string;
  type?: "text" | "number" | "date";
};

type ManagerProps = {
  title: string;
  description: string;
  resourcePath: "/api/master-data/customers" | "/api/master-data/materials" | "/api/master-data/pricing";
  rowsKey: "customers" | "materials" | "pricing";
  deleteKey: string;
  syncEntity?: "customer" | "material" | "pricing";
  fields: FieldConfig[];
};

export function MasterDataManager({
  title,
  description,
  resourcePath,
  rowsKey,
  deleteKey,
  syncEntity,
  fields,
}: ManagerProps) {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadRows() {
    const response = await fetch(resourcePath);
    const data = (await response.json()) as Record<string, Array<Record<string, unknown>> | string | null>;
    setRows((data[rowsKey] as Array<Record<string, unknown>>) ?? []);
    setLastSyncAt((data.lastSyncAt as string | null) ?? null);
    setLoading(false);
  }

  useEffect(() => {
    void loadRows();
  }, [resourcePath]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const term = search.toLowerCase();
    return rows.filter((row) =>
      fields.some((field) => String(row[field.key] ?? "").toLowerCase().includes(term)),
    );
  }, [rows, search, fields]);

  async function handleSave() {
    const response = await fetch(resourcePath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = (await response.json()) as Record<string, Array<Record<string, unknown>>>;
    setRows((data[rowsKey] as Array<Record<string, unknown>>) ?? rows);
    setForm({});
    setEditingId(null);
  }

  async function handleDelete(identifier: string) {
    const response = await fetch(`${resourcePath}?${deleteKey}=${encodeURIComponent(identifier)}`, {
      method: "DELETE",
    });
    const data = (await response.json()) as Record<string, Array<Record<string, unknown>>>;
    setRows((data[rowsKey] as Array<Record<string, unknown>>) ?? rows);
    if (editingId === identifier) {
      setForm({});
      setEditingId(null);
    }
  }

  async function handleSync() {
    if (!syncEntity) return;
    const response = await fetch("/api/master-data/sync-sap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity: syncEntity }),
    });
    const data = (await response.json()) as { lastSyncAt?: string };
    setLastSyncAt(data.lastSyncAt ?? null);
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Master Data"
        title={title}
        description={description}
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel
          title="Records"
          subtitle={lastSyncAt ? `Last sync: ${new Date(lastSyncAt).toLocaleString()}` : "Stored in the SmartOrder cache"}
          action={
            <div className="flex flex-wrap gap-3">
              {syncEntity ? (
                <button
                  type="button"
                  onClick={handleSync}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Sync from SAP
                </button>
              ) : null}
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search..."
                className="rounded-full border border-slate-200 px-4 py-2 text-sm"
              />
            </div>
          }
        >
          {loading ? (
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <RefreshCcw className="h-4 w-4 animate-spin" />
              Loading master data...
            </div>
          ) : filteredRows.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    {fields.map((field) => (
                      <th key={field.key} className="pb-3 pr-4 font-medium">
                        {field.label}
                      </th>
                    ))}
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRows.map((row) => (
                    <tr key={String(row[deleteKey])}>
                      {fields.map((field) => (
                        <td key={field.key} className="py-3 pr-4 text-slate-700">
                          {field.type === "date" && row[field.key]
                            ? new Date(String(row[field.key])).toLocaleDateString()
                            : String(row[field.key] ?? "-")}
                        </td>
                      ))}
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setForm(row);
                              setEditingId(String(row[deleteKey]));
                            }}
                            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(String(row[deleteKey]))}
                            className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No records found" description="Add or sync master data to start validating uploads." />
          )}
        </Panel>

        <Panel
          title={editingId ? "Edit Record" : "Add Record"}
          subtitle="Create or update the local SmartOrder cache"
          action={
            <button
              type="button"
              onClick={() => {
                setForm({});
                setEditingId(null);
              }}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Clear
            </button>
          }
        >
          <div className="space-y-4">
            {fields.map((field) => (
              <label key={field.key} className="block">
                <span className="text-sm font-medium text-slate-700">{field.label}</span>
                <input
                  type={field.type ?? "text"}
                  value={String(form[field.key] ?? "")}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [field.key]: field.type === "number" ? Number(event.target.value) : event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                />
              </label>
            ))}

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-full bg-[#e89a2d] px-4 py-2 text-sm font-semibold text-slate-950"
            >
              <Save className="h-4 w-4" />
              {editingId ? "Update Record" : "Save Record"}
            </button>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <div className="flex items-center gap-2 font-semibold text-slate-950">
                <Database className="h-4 w-4" />
                SmartOrder cache
              </div>
              <p className="mt-2">
                These records are used immediately by the upload validation engine and template generator.
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
