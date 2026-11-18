"use client";

import { useState, useMemo } from "react";
import { Users, Crown, HeartHandshake, UserPlus } from "lucide-react";
import { KpiSummary } from "@/types/analytics";

interface CustomerCrmPageProps {
  summary: KpiSummary;
  transactionCount: number;
}

export default function CustomerCrmPage({
  summary,
  transactionCount,
}: CustomerCrmPageProps) {
  const baseAov =
    transactionCount > 0 ? Math.round(summary.totalRevenue / transactionCount) : 180;
  const [ordersPerYear, setOrdersPerYear] = useState<number>(4.5);
  const [lifespanYears, setLifespanYears] = useState<number>(2.5);
  const [cac, setCac] = useState<number>(35);

  const ltvStats = useMemo(() => {
    const grossMarginRatio =
      summary.profitMargin > 0 ? summary.profitMargin / 100 : 0.4;
    const grossLtv = Math.round(baseAov * ordersPerYear * lifespanYears);
    const netLtv = Math.round(grossLtv * grossMarginRatio);
    const ratio = cac > 0 ? netLtv / cac : 0;

    return {
      grossLtv,
      netLtv,
      ratio,
      isHealthy: ratio >= 3,
    };
  }, [baseAov, ordersPerYear, lifespanYears, cac, summary.profitMargin]);

  const segments = [
    {
      name: "VIP Champions",
      share: "18%",
      revenueContribution: "52%",
      action: "Offer early access to limited sneaker & gadget drops",
      badge: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
      icon: Crown,
    },
    {
      name: "Loyal Repeaters",
      share: "34%",
      revenueContribution: "31%",
      action: "Introduce bundle discounts to raise Average Order Value",
      badge: "bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300",
      icon: HeartHandshake,
    },
    {
      name: "First-Time Buyers",
      share: "48%",
      revenueContribution: "17%",
      action: "Trigger 10% second-order retargeting coupon within 14 days",
      badge: "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
      icon: UserPlus,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Customer Lifetime Value (CLV) vs. Acquisition Cost (CAC) Engine
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Anchored to your live Average Order Value (${baseAov.toLocaleString()}) and {summary.profitMargin.toFixed(1)}% net margin
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono ${
              ltvStats.isHealthy
                ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : "bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300"
            }`}
          >
            LTV:CAC Ratio = {ltvStats.ratio.toFixed(1)}x{" "}
            {ltvStats.isHealthy ? "(Benchmark ≥ 3.0x)" : "(Optimize Ad CAC)"}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-600 dark:text-slate-300">
                  Repeat Orders Per Year
                </span>
                <span className="font-mono text-blue-600 dark:text-blue-400">
                  {ordersPerYear.toFixed(1)} orders/yr
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                step="0.5"
                value={ordersPerYear}
                onChange={(e) => setOrdersPerYear(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-600 dark:text-slate-300">
                  Average Customer Retention Lifespan
                </span>
                <span className="font-mono text-blue-600 dark:text-blue-400">
                  {lifespanYears.toFixed(1)} years
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="0.5"
                value={lifespanYears}
                onChange={(e) => setLifespanYears(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-600 dark:text-slate-300">
                  Ad Acquisition Cost Per Customer (CAC)
                </span>
                <span className="font-mono text-rose-600 dark:text-rose-400">
                  ${cac}
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="150"
                step="5"
                value={cac}
                onChange={(e) => setCac(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70">
              <span className="text-xs font-semibold text-slate-400 uppercase">
                Gross Customer LTV
              </span>
              <p className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-2">
                ${ltvStats.grossLtv.toLocaleString()}
              </p>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                Total lifetime revenue per buyer
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/25">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase">
                Net Profit LTV
              </span>
              <p className="text-2xl font-extrabold font-mono text-emerald-700 dark:text-emerald-300 mt-2">
                ${ltvStats.netLtv.toLocaleString()}
              </p>
              <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1 block">
                Net margin contribution per buyer
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {segments.map((seg) => {
          const Icon = seg.icon;
          return (
            <div
              key={seg.name}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${seg.badge}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {seg.name}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                    {seg.share} of base
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {seg.action}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Revenue Share:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {seg.revenueContribution}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}