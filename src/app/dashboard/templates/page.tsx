"use client";

import { Download, FileSpreadsheet, ShieldCheck, TableProperties } from "lucide-react";
import { ActionLink, PageHero, Panel, StatCard } from "@/components/smart-order/ui";

const previewRows = [
  {
    OrderType: "OR",
    SalesOrg: "1000",
    DistChannel: "10",
    Division: "00",
    SoldTo: "100234",
    ShipTo: "100234",
    Material: "45000123",
    Qty: "120",
    Price: "5.50",
    ReqDate: "10.03.2026",
  },
];

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Excel Templates"
        title="Distribute pre-formatted order workbooks with the right master-data context."
        description="Download the current SmartOrder upload template with order columns, customer and material reference sheets, and the base formatting operators need for consistent file handoffs."
        actions={<ActionLink href="/api/templates/download" label="Download Template v1" />}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Template Version"
          value="v1.0"
          description="Current SmartOrder upload workbook"
          icon={FileSpreadsheet}
          accent="bg-[#1a1a2e]"
        />
        <StatCard
          title="Reference Sheets"
          value="2"
          description="Customers and Materials are included"
          icon={TableProperties}
          accent="bg-sky-600"
        />
        <StatCard
          title="Validation Notes"
          value="Ready"
          description="Date, quantity, and pricing columns are pre-labeled"
          icon={ShieldCheck}
          accent="bg-emerald-600"
        />
      </div>

      <Panel
        title="Template Preview"
        subtitle="The primary Orders sheet that operators will complete"
        action={
          <a
            href="/api/templates/download"
            className="inline-flex items-center gap-2 rounded-full bg-[#e89a2d] px-4 py-2 text-sm font-semibold text-slate-950"
          >
            <Download className="h-4 w-4" />
            Download
          </a>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                {Object.keys(previewRows[0]).map((header) => (
                  <th key={header} className="pb-3 pr-4 font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value) => (
                    <td key={String(value)} className="py-3 pr-4 text-slate-700">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
