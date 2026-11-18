"use client";

import { useState, useMemo } from "react";
import { Compass, ShieldAlert, CheckCircle2 } from "lucide-react";
import { KpiSummary } from "@/types/analytics";

interface BreakEvenRadarProps {
  summary: KpiSummary;
}

export default function BreakEvenRadar({ summary }: BreakEvenRadarProps) {
  const [fixedOverhead, setFixedOverhead] = useState<number>(4500);

  const cvp = useMemo(() => {
    const contributionMargin = summary.totalRevenue - summary.totalCost;
    const cmRatio =
      summary.totalRevenue > 0 ? contributionMargin / summary.totalRevenue : 0;
    const breakEvenRevenue =
      cmRatio > 0 ? Math.round(fixedOverhead / cmRatio) : 0;
    const operatingIncome = contributionMargin - fixedOverhead;
    const marginOfSafetyPct =
      summary.totalRevenue > 0
        ? ((summary.totalRevenue - breakEvenRevenue) / summary.totalRevenue) *
          100
        : 0;
    const coveragePct =
      breakEvenRevenue > 0
        ? Math.min(100, (summary.totalRevenue / breakEvenRevenue) * 100)
        : 100;

    return {
      cmRatioPct: cmRatio * 100,
      breakEvenRevenue,
      operatingIncome: Math.round(operatingIncome),
      marginOfSafetyPct,
      coveragePct,
      isProfitable: operatingIncome >= 0,
    };
  }, [summary, fixedOverhead]);

  return (
    <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-500/25">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Cost-Volume-Profit (CVP) &amp; Break-Even Radar
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Calculates exact break-even sales threshold and Margin of Safety after fixed store rent, payroll, and ad overhead
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <label
            htmlFor="fixed-overhead-input"
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap"
          >
            Fixed Overhead ($):
          </label>
          <input
            id="fixed-overhead-input"
            type="number"
            min="0"
            step="100"
            value={fixedOverhead}
            onChange={(e) => setFixedOverhead(Math.max(0, Number(e.target.value)))}
            className="w-24 text-sm font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Contribution Margin Ratio
          </span>
          <p className="text-xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
            {cvp.cmRatioPct.toFixed(1)}%
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            After variable COGS
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Break-Even Revenue Point
          </span>
          <p className="text-xl font-extrabold font-mono text-cyan-600 dark:text-cyan-400 mt-1">
            ${cvp.breakEvenRevenue.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Zero-loss threshold
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Net Operating Income (EBIT)
          </span>
          <p
            className={`text-xl font-extrabold font-mono mt-1 ${
              cvp.isProfitable
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {cvp.operatingIncome >= 0 ? "+" : "-"}$
            {Math.abs(cvp.operatingIncome).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            After ${fixedOverhead.toLocaleString()} overhead
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Margin of Safety
          </span>
          <p
            className={`text-xl font-extrabold font-mono mt-1 ${
              cvp.marginOfSafetyPct >= 20
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
          >
            {cvp.marginOfSafetyPct.toFixed(1)}%
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Revenue cushion above BEP
          </span>
        </div>
      </div>

      {/* ব্রেক-ইভেন কভারেজ বার */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
            {cvp.isProfitable ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Operating Above Break-Even Threshold
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                Below Break-Even Point — Increase Revenue or Trim Overhead
              </>
            )}
          </span>
          <span className="font-mono text-slate-500 dark:text-slate-400">
            Break-Even Coverage: {cvp.coveragePct.toFixed(0)}%
          </span>
        </div>

        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              cvp.isProfitable
                ? "bg-gradient-to-r from-cyan-500 to-emerald-500"
                : "bg-gradient-to-r from-rose-500 to-amber-500"
            }`}
            style={{ width: `${cvp.coveragePct}%` }}
          />
        </div>
      </div>
    </section>
  );
}