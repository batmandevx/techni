"use client";

import { Cog, Database, FileCog, Server } from "lucide-react";
import { PageHero, Panel, StatCard } from "@/components/smart-order/ui";

export default function SettingsPage() {
  const sapMock = process.env.SAP_MOCK !== "false";

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Settings"
        title="Operational guardrails for the SmartOrder engine."
        description="Review the current deployment posture for SAP integration, storage, and template generation. These settings cards are intended as a launchpad for future admin controls."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="SAP Mode"
          value={sapMock ? "Mock" : "Live"}
          description="Switches between demo-safe processing and external SAP service calls"
          icon={Server}
          accent={sapMock ? "bg-amber-500" : "bg-emerald-600"}
        />
        <StatCard
          title="Storage"
          value="File Cache"
          description="SmartOrder uses a workspace JSON cache in this implementation"
          icon={Database}
          accent="bg-[#1a1a2e]"
        />
        <StatCard
          title="Template Service"
          value="Enabled"
          description="Workbook generation is available via /api/templates/download"
          icon={FileCog}
          accent="bg-sky-600"
        />
        <StatCard
          title="Admin Surface"
          value="Ready"
          description="Upload, validation, processing, analytics, and master-data modules are active"
          icon={Cog}
          accent="bg-emerald-600"
        />
      </div>

      <Panel title="Next Steps" subtitle="Recommended follow-through before a production rollout">
        <div className="space-y-4 text-sm leading-7 text-slate-600">
          <p>1. Replace file-cache persistence with Prisma-backed repositories once the PostgreSQL schema is migrated and the client is regenerated.</p>
          <p>2. Connect the FastAPI `sap-service` to a real PyRFC destination and surface credentials through environment-specific secrets.</p>
          <p>3. Swap the placeholder admin settings cards for authenticated controls and audit-protected configuration changes.</p>
        </div>
      </Panel>
    </div>
  );
}
