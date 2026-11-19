"use client";

import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Percent,
  Wallet,
} from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";
import { calculateKpiWithGrowth } from "@/lib/analyticsEngine";

type KpiSummaryData = ReturnType<typeof calculateKpiWithGrowth>;

interface KpiSectionProps {
  summary: KpiSummaryData;
}

export default function KpiSection({ summary }: KpiSectionProps) {
  const data = summary as unknown as Record<string, number | undefined>;

  const totalRevenue = Number(data.totalRevenue ?? 0);
  const totalCost = Number(data.totalCost ?? 0);
  const netProfit = Number(data.totalProfit ?? data.netProfit ?? totalRevenue - totalCost);
  const profitMargin = Number(data.profitMargin ?? 0);

  const revenueGrowth = data.revenueGrowth ?? data.revenueGrowthRate;
  const profitGrowth = data.profitGrowth ?? data.profitGrowthRate;

  const cards = [
    {
      label: "Total Revenue",
      value: totalRevenue,
      prefix: "$",
      suffix: "",
      decimals: 0,
      growth: revenueGrowth,
      subtitle: "Gross top-line sales inflow",
      icon: DollarSign,
      iconBg: "bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-cyan-400",
      accentBorder: "hover:border-blue-400/60",
    },
    {
      label: "Total Cost (COGS)",
      value: totalCost,
      prefix: "$",
      suffix: "",
      decimals: 0,
      growth: undefined,
      subtitle: "Direct inventory & unit cost",
      icon: ShoppingBag,
      iconBg: "bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-300",
      accentBorder: "hover:border-amber-400/60",
    },
    {
      label: "Net Profit",
      value: netProfit,
      prefix: "$",
      suffix: "",
      decimals: 0,
      growth: profitGrowth,
      subtitle: "Realized bottom-line earnings",
      icon: Wallet,
      iconBg: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      accentBorder: "hover:border-emerald-400/60",
    },
    {
      label: "Net Profit Margin",
      value: profitMargin,
      prefix: "",
      suffix: "%",
      decimals: 1,
      growth: undefined,
      subtitle:
        profitMargin >= 40
          ? "Optimal executive margin"
          : profitMargin >= 25
          ? "Healthy operating margin"
          : "Margin optimization advised",
      icon: Percent,
      iconBg: "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300",
      accentBorder: "hover:border-indigo-400/60",
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const hasGrowth = typeof card.growth === "number" && Number.isFinite(card.growth);
        const isPositive = (card.growth ?? 0) >= 0;

        return (
          <div
            key={card.label}
            className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${card.accentBorder}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {card.label}
              </span>
              <div className={`p-2 rounded-xl ${card.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
              <AnimatedCounter
                value={card.value}
                prefix={card.prefix}
                suffix={card.suffix}
                decimals={card.decimals}
              />
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              {hasGrowth ? (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    isPositive
                      ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      : "bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300"
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {isPositive ? "+" : ""}
                  {card.growth!.toFixed(1)}% vs prior
                </span>
              ) : (
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {card.subtitle}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}