"use client";

import { useMemo } from "react";
import { Award, Layers, AlertTriangle, LineChart } from "lucide-react";
import { SalesRecord } from "@/types/analytics";

interface BusinessInsightsProps {
  data: SalesRecord[];
}

export default function BusinessInsights({ data }: BusinessInsightsProps) {
  const insights = useMemo(() => {
    if (data.length === 0) return null;

    const topProduct = [...data].sort((a, b) => b.profit - a.profit)[0];

    const categoryMap = new Map<string, number>();
    data.forEach((item) => {
      categoryMap.set(item.category, (categoryMap.get(item.category) || 0) + item.revenue);
    });

    let topCategory = { name: "N/A", revenue: 0 };
    categoryMap.forEach((revenue, name) => {
      if (revenue > topCategory.revenue) {
        topCategory = { name, revenue };
      }
    });

    const lowestMarginItem = [...data].sort(
      (a, b) => a.profit / a.revenue - b.profit / b.revenue
    )[0];
    const lowestMarginPercent =
      lowestMarginItem.revenue > 0
        ? (lowestMarginItem.profit / lowestMarginItem.revenue) * 100
        : 0;

    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const projectedRevenue = Math.round(totalRevenue * 1.12);

    return {
      topProduct,
      topCategory,
      lowestMarginItem,
      lowestMarginPercent,
      projectedRevenue,
    };
  }, [data]);

  if (!insights) return null;

  return (
    <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Automated Business Insights & Forecast
        </h2>
        <p className="text-xs text-slate-500">
          Algorithmic summary based on your active dataset
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-200">
          <div className="flex items-center gap-2 text-emerald-700 font-medium text-sm">
            <Award className="w-4 h-4" />
            <span>Top Profit Driver</span>
          </div>
          <p className="text-base font-bold text-slate-900 mt-2">
            {insights.topProduct.product}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Generated ${insights.topProduct.profit.toLocaleString()} net profit
          </p>
        </div>

        <div className="p-4 rounded-lg bg-blue-50/70 border border-blue-200">
          <div className="flex items-center gap-2 text-blue-700 font-medium text-sm">
            <Layers className="w-4 h-4" />
            <span>Leading Category</span>
          </div>
          <p className="text-base font-bold text-slate-900 mt-2">
            {insights.topCategory.name}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Total revenue of ${insights.topCategory.revenue.toLocaleString()}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200">
          <div className="flex items-center gap-2 text-amber-700 font-medium text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Margin Watchlist</span>
          </div>
          <p className="text-base font-bold text-slate-900 mt-2">
            {insights.lowestMarginItem.product}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Lowest margin at {insights.lowestMarginPercent.toFixed(1)}% — review pricing or cost
          </p>
        </div>

        <div className="p-4 rounded-lg bg-purple-50/70 border border-purple-200">
          <div className="flex items-center gap-2 text-purple-700 font-medium text-sm">
            <LineChart className="w-4 h-4" />
            <span>Next-Period Forecast</span>
          </div>
          <p className="text-base font-bold text-slate-900 mt-2">
            ${insights.projectedRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Projected revenue assuming +12% growth target
          </p>
        </div>
      </div>
    </section>
  );
}