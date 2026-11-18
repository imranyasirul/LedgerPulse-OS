"use client";

import { useState, useMemo } from "react";
import { Sliders, TrendingUp, RotateCcw } from "lucide-react";
import { KpiSummary } from "@/types/analytics";

interface WhatIfSimulatorProps {
  summary: KpiSummary;
}

export default function WhatIfSimulator({ summary }: WhatIfSimulatorProps) {
  const [priceDelta, setPriceDelta] = useState<number>(0);
  const [costDelta, setCostDelta] = useState<number>(0);

  const simulation = useMemo(() => {
    const simulatedRevenue = summary.totalRevenue * (1 + priceDelta / 100);
    const simulatedCost = summary.totalCost * (1 + costDelta / 100);
    const simulatedProfit = simulatedRevenue - simulatedCost;
    const simulatedMargin =
      simulatedRevenue > 0 ? (simulatedProfit / simulatedRevenue) * 100 : 0;
    const profitDiff = simulatedProfit - summary.netProfit;

    return {
      simulatedRevenue: Math.round(simulatedRevenue),
      simulatedCost: Math.round(simulatedCost),
      simulatedProfit: Math.round(simulatedProfit),
      simulatedMargin,
      profitDiff: Math.round(profitDiff),
    };
  }, [summary, priceDelta, costDelta]);

  const isModified = priceDelta !== 0 || costDelta !== 0;

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-6 shadow-lg border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-white">
              Executive &ldquo;What-If&rdquo; Margin &amp; Pricing Simulator
            </h2>
            <p className="text-xs text-slate-400">
              Simulate net profit sensitivity to pricing adjustments and supplier COGS optimization
            </p>
          </div>
        </div>

        {isModified && (
          <button
            type="button"
            onClick={() => {
              setPriceDelta(0);
              setCostDelta(0);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer self-start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Sliders
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-slate-300">Selling Price Adjustment</span>
              <span
                className={`font-mono ${
                  priceDelta > 0
                    ? "text-emerald-400"
                    : priceDelta < 0
                    ? "text-amber-400"
                    : "text-slate-300"
                }`}
              >
                {priceDelta > 0 ? `+${priceDelta}%` : `${priceDelta}%`}
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="30"
              step="1"
              value={priceDelta}
              onChange={(e) => setPriceDelta(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>-20% Discount</span>
              <span>0% Baseline</span>
              <span>+30% Markup</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-slate-300">Supplier Cost (COGS) Change</span>
              <span
                className={`font-mono ${
                  costDelta < 0
                    ? "text-emerald-400"
                    : costDelta > 0
                    ? "text-rose-400"
                    : "text-slate-300"
                }`}
              >
                {costDelta > 0 ? `+${costDelta}%` : `${costDelta}%`}
              </span>
            </div>
            <input
              type="range"
              min="-25"
              max="20"
              step="1"
              value={costDelta}
              onChange={(e) => setCostDelta(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>-25% Cost Cut</span>
              <span>0% Baseline</span>
              <span>+20% Inflation</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              Simulated Revenue
            </span>
            <p className="text-xl font-bold font-mono tabular-nums text-white mt-2">
              ${simulation.simulatedRevenue.toLocaleString()}
            </p>
            <span className="text-[11px] text-slate-400 mt-1">
              Base: ${summary.totalRevenue.toLocaleString()}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/30 flex flex-col justify-between">
            <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Projected Profit
            </span>
            <p className="text-xl font-bold font-mono tabular-nums text-emerald-300 mt-2">
              ${simulation.simulatedProfit.toLocaleString()}
            </p>
            <span
              className={`text-[11px] font-mono mt-1 ${
                simulation.profitDiff >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {simulation.profitDiff >= 0 ? "+" : ""}$
              {simulation.profitDiff.toLocaleString()} impact
            </span>
          </div>

          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-400/30 flex flex-col justify-between">
            <span className="text-[11px] uppercase tracking-wider text-indigo-300 font-semibold">
              New Net Margin
            </span>
            <p className="text-xl font-bold font-mono tabular-nums text-indigo-200 mt-2">
              {simulation.simulatedMargin.toFixed(1)}%
            </p>
            <span className="text-[11px] text-slate-400 mt-1">
              Base: {summary.profitMargin.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}