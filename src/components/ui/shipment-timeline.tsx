"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Package, Ship, CheckCircle2, Truck, MapPin,
  ClipboardList, Warehouse, Plane, ArrowRight
} from "lucide-react";
import Link from "next/link";
import { LocationMap } from "./expand-map";

interface TimelineStep {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  status: "done" | "active" | "pending";
  time: string;
  location: string;
  color: string;
}

const steps: TimelineStep[] = [
  {
    icon: <ClipboardList className="w-5 h-5" />,
    label: "Order Confirmed",
    sublabel: "Purchase order processed & validated",
    status: "done",
    time: "Mar 24 · 08:12",
    location: "Shanghai, CN",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: <Warehouse className="w-5 h-5" />,
    label: "Assembled & Loaded",
    sublabel: "Goods packed and container sealed",
    status: "done",
    time: "Mar 25 · 14:30",
    location: "Shanghai Port, CN",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: <Ship className="w-5 h-5" />,
    label: "Departed Origin Port",
    sublabel: "Container vessel MSC AURORA departed",
    status: "done",
    time: "Mar 26 · 09:00",
    location: "Shanghai → Jebel Ali",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: <Plane className="w-5 h-5" />,
    label: "In Transit · Open Ocean",
    sublabel: "Vessel tracking active — ETA confirmed",
    status: "active",
    time: "Mar 31 · Now",
    location: "Arabian Sea",
    color: "from-indigo-500 to-violet-500",
  },
  {
    icon: <MapPin className="w-5 h-5" />,
    label: "Arriving Destination Port",
    sublabel: "Customs clearance pre-filed",
    status: "pending",
    time: "Apr 04 · Est.",
    location: "Jebel Ali, UAE",
    color: "from-slate-600 to-slate-700",
  },
  {
    icon: <Truck className="w-5 h-5" />,
    label: "Last-Mile Dispatch",
    sublabel: "Delivery truck assigned",
    status: "pending",
    time: "Apr 05 · Est.",
    location: "Dubai, UAE",
    color: "from-slate-600 to-slate-700",
  },
  {
    icon: <CheckCircle2 className="w-5 h-5" />,
    label: "Delivered",
    sublabel: "Confirm receipt & close order",
    status: "pending",
    time: "Apr 06 · Est.",
    location: "End Customer",
    color: "from-slate-600 to-slate-700",
  },
];

const ContainerTag = () => (
  <div className="flex flex-col gap-1 p-3 rounded-xl border border-white/10 bg-white/[0.03]">
    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Container ID</div>
    <div className="text-sm font-mono font-bold text-white">MSCU-4829104-7</div>
    <div className="text-[10px] text-slate-500">40HC · 28.3 tons</div>
  </div>
);

export function ShipmentTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="w-full py-24 px-4 border-t border-white/[0.06] bg-[#070b14]">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold tracking-wider text-indigo-300 mb-5">
            <Ship className="w-3.5 h-3.5" /> LIVE SHIPMENT TRACKING
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
            Track Your Order,{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Every Step.
            </span>
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto text-sm font-light leading-relaxed">
            Real-time container tracking with satellite telemetry, port notifications, and automated
            ETA alerts — so you always know where your goods are.
          </p>
        </motion.div>

        {/* Timeline card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="rounded-3xl border border-white/[0.08] bg-white/[0.025] backdrop-blur-sm overflow-hidden"
        >
          {/* Card header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-8 py-5 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                <Package className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Order #TEN-2025-8824</div>
                <div className="text-[11px] text-slate-500">Shanghai → Dubai · Est. 12 days transit</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LocationMap 
                location="Arabian Sea"
                coordinates="18.2833° N, 62.8333° E"
                className="hidden sm:block"
              />
              <ContainerTag />
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-8 py-4 border-b border-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-violet-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={isInView ? { width: "56%" } : {}}
                  transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                />
              </div>
              <span className="text-xs font-bold text-indigo-400 shrink-0">56% Complete</span>
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-slate-600">Shanghai Port</span>
              <span className="text-[10px] text-slate-600">Dubai End Customer</span>
            </div>
          </div>

          {/* Steps */}
          <div className="px-8 py-6 space-y-0">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
                className="flex gap-4"
              >
                {/* Left: icon + connector line */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg
                      ${step.status === "active" ? "ring-2 ring-indigo-400/50 ring-offset-2 ring-offset-[#070b14]" : ""}
                      ${step.status === "pending" ? "opacity-30" : ""}
                    `}
                  >
                    <span className="text-white">{step.icon}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-px flex-1 my-1 min-h-[28px] ${step.status === "done" ? "bg-emerald-500/40" : "bg-white/[0.06]"}`} />
                  )}
                </div>

                {/* Right: content */}
                <div className={`pb-6 flex-1 ${step.status === "pending" ? "opacity-35" : ""}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{step.label}</span>
                      {step.status === "active" && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold border border-indigo-500/30 animate-pulse">
                          LIVE
                        </span>
                      )}
                      {step.status === "done" && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">{step.time}</div>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{step.sublabel}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-slate-600" />
                    <span className="text-[11px] text-slate-600">{step.location}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="px-8 py-5 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.02]">
            <p className="text-sm text-slate-400">
              Get <span className="text-white font-semibold">real-time</span> alerts for every shipment milestone
            </p>
            <Link href="/auth?mode=sign-up">
              <motion.button
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-all"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                Track Live Now <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Supporting stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-8 grid grid-cols-3 gap-4"
        >
          {[
            { label: "Shipments Tracked", value: "12,000+", color: "text-indigo-400" },
            { label: "On-Time Delivery Rate", value: "97.8%", color: "text-emerald-400" },
            { label: "Avg. Alert Latency", value: "< 2 min", color: "text-amber-400" },
          ].map((s, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-[11px] text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
