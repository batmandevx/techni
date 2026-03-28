"use client";

import Link from "next/link";
import { ArrowRight, LucideIcon } from "lucide-react";
import { BatchStatus, LineStatus } from "@/lib/smart-order/types";
import { formatCurrency } from "@/lib/smart-order/utils";

const statusStyles: Record<string, string> = {
  UPLOADED: "bg-slate-100 text-slate-700",
  VALIDATING: "bg-amber-100 text-amber-700",
  AI_MAPPING: "bg-amber-100 text-amber-700",
  VALIDATED: "bg-sky-100 text-sky-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  PARTIAL_SUCCESS: "bg-orange-100 text-orange-700",
  FAILED: "bg-rose-100 text-rose-700",
  PENDING: "bg-slate-100 text-slate-700",
  VALID: "bg-sky-100 text-sky-700",
  INVALID: "bg-rose-100 text-rose-700",
  CREATED: "bg-emerald-100 text-emerald-700",
};

export function StatusBadge({ status }: { status: BatchStatus | LineStatus }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status] ?? "bg-slate-100 text-slate-700"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_22px_80px_-40px_rgba(15,23,42,0.28)]">
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 px-6 py-5">
          <div>
            {title ? <h2 className="text-lg font-semibold text-slate-950">{title}</h2> : null}
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </section>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="rounded-[32px] border border-[#1a1a2e]/10 bg-[radial-gradient(circle_at_top_left,_rgba(232,154,45,0.24),_transparent_32%),linear-gradient(135deg,#1a1a2e_0%,#232347_50%,#11263c_100%)] px-6 py-7 text-white shadow-[0_30px_90px_-45px_rgba(26,26,46,0.8)] sm:px-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f4d9b1]">{eyebrow}</p>
          <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  accent = "bg-[#1a1a2e]",
}: {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  accent?: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
          <p className="mt-2 text-sm text-slate-500">{description}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function ActionLink({
  href,
  label,
  variant = "primary",
}: {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link
      href={href}
      className={
        variant === "primary"
          ? "inline-flex items-center gap-2 rounded-full bg-[#e89a2d] px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-[#f0ae52]"
          : "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
      }
    >
      {label}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 px-6 py-10 text-center">
      <p className="text-lg font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}

export function CurrencyText({ value }: { value: number }) {
  return <>{formatCurrency(value)}</>;
}
