'use client';

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";
import Link from "next/link";

export interface PricingTier {
  name: string;
  icon: React.ReactNode;
  price: number | string;
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
  href?: string;
}

function CreativePricing({
  tag = "Simple Pricing",
  title = "Plans for Every Team",
  description = "Scale your supply chain intelligence as you grow",
  tiers,
}: {
  tag?: string;
  title?: string;
  description?: string;
  tiers: PricingTier[];
}) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 relative">
      <div className="text-center space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 text-xs font-semibold tracking-wide text-indigo-300 backdrop-blur-sm">
          ✦ {tag}
        </div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">
          {title}
        </h2>
        <p className="text-lg text-slate-400 font-light max-w-xl mx-auto">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {tiers.map((tier, index) => (
          <div
            key={tier.name}
            className={cn(
              "relative group",
              "transition-all duration-500",
              index === 1 && "md:-translate-y-4"
            )}
          >
            {/* Card glow for popular */}
            {tier.popular && (
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-indigo-500 to-violet-600 opacity-70 blur-sm group-hover:opacity-100 transition-opacity" />
            )}

            <div
              className={cn(
                "relative rounded-2xl p-8 flex flex-col gap-6 h-full",
                "border transition-all duration-300",
                tier.popular
                  ? "bg-gradient-to-b from-indigo-950 to-slate-900 border-indigo-500/50 shadow-[0_0_40px_rgba(99,102,241,0.2)]"
                  : "bg-white/[0.03] border-white/[0.08] hover:border-white/20 backdrop-blur-sm"
              )}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                    MOST POPULAR
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="flex flex-col gap-3">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    tier.popular
                      ? "bg-indigo-500/20 text-indigo-400"
                      : "bg-white/[0.06] text-slate-300"
                  )}
                >
                  {tier.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                  <p className="text-sm text-slate-400 mt-1">{tier.description}</p>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-end gap-1">
                {typeof tier.price === 'number' ? (
                  <>
                    <span className="text-5xl font-black text-white">${tier.price}</span>
                    <span className="text-slate-400 mb-1.5">/month</span>
                  </>
                ) : (
                  <span className="text-4xl font-black text-white">{tier.price}</span>
                )}
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-3 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                        tier.popular
                          ? "bg-indigo-500/20 text-indigo-400"
                          : "bg-white/[0.06] text-slate-400"
                      )}
                    >
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-sm text-slate-300 leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link href={tier.href ?? '/auth?mode=sign-up'}>
                <Button
                  className={cn(
                    "w-full h-12 font-semibold rounded-xl text-sm transition-all duration-300",
                    tier.popular
                      ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] hover:scale-[1.02]"
                      : "bg-white/[0.06] text-white border border-white/10 hover:bg-white/[0.12] hover:scale-[1.02]"
                  )}
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { CreativePricing };
