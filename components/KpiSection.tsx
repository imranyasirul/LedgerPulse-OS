"use client";

import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { KpiSummary } from "@/types/analytics";

interface KpiSectionProps {
  summary: KpiSummary;
}

export default function KpiSection({ summary }: KpiSectionProps) {
  const cards = [
    {
      title: "Total Revenue",
      value: `$${summary.totalRevenue.toLocaleString()}`,
      growth: summary.revenueGrowth,
      icon: DollarSign,
    },
    {
      title: "Total Cost (COGS)",
      value: `$${summary.totalCost.toLocaleString()}`,
      growth: null,
      icon: ShoppingBag,
    },
    {
      title: "Net Profit",
      value: `$${summary.netProfit.toLocaleString()}`,
      growth: summary.profitGrowth,
      icon: TrendingUp,
    },
    {
      title: "Net Profit Margin",
      value: `${summary.profitMargin.toFixed(1)}%`,
      growth: null,
      icon: Percent,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isPositive = (card.growth ?? 0) >= 0;

        return (
          <div
            key={card.title}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] hover:border-slate-300 transition-colors flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">
                {card.title}
              </p>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-600">
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <h3 className="text-2xl font-bold tracking-tight font-mono tabular-nums text-slate-900">
                {card.value}
              </h3>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs">
              {card.growth !== null ? (
                <span
                  className={`inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-md ${
                    isPositive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {isPositive ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {Math.abs(card.growth).toFixed(1)}% vs prior period
                </span>
              ) : (
                <span className="text-slate-400">Audited live metric</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}