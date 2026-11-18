"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Store, Trophy, TrendingUp } from "lucide-react";
import { SalesRecord } from "@/types/analytics";

interface BranchComparisonPageProps {
  records: SalesRecord[];
}

export default function BranchComparisonPage({
  records,
}: BranchComparisonPageProps) {
  const branchMetrics = useMemo(() => {
    const map = new Map<
      string,
      {
        revenue: number;
        cost: number;
        profit: number;
        orders: number;
        productProfit: Map<string, number>;
      }
    >();

    records.forEach((r) => {
      const storeName = r.store || "Primary Store";
      const prev = map.get(storeName) || {
        revenue: 0,
        cost: 0,
        profit: 0,
        orders: 0,
        productProfit: new Map<string, number>(),
      };

      prev.revenue += r.revenue;
      prev.cost += r.cost;
      prev.profit += r.profit;
      prev.orders += 1;
      prev.productProfit.set(
        r.product,
        (prev.productProfit.get(r.product) || 0) + r.profit
      );

      map.set(storeName, prev);
    });

    const totalAllRev = Array.from(map.values()).reduce(
      (sum, item) => sum + item.revenue,
      0
    );

    return Array.from(map.entries())
      .map(([name, val]) => {
        let topProduct = "N/A";
        let maxProdProfit = -Infinity;
        val.productProfit.forEach((pProfit, pName) => {
          if (pProfit > maxProdProfit) {
            maxProdProfit = pProfit;
            topProduct = pName;
          }
        });

        const margin = val.revenue > 0 ? (val.profit / val.revenue) * 100 : 0;
        const aov = val.orders > 0 ? val.revenue / val.orders : 0;
        const share = totalAllRev > 0 ? (val.revenue / totalAllRev) * 100 : 0;

        return {
          name,
          revenue: val.revenue,
          cost: val.cost,
          profit: val.profit,
          orders: val.orders,
          margin,
          aov,
          share,
          topProduct,
        };
      })
      .sort((a, b) => b.profit - a.profit);
  }, [records]);

  const leader = branchMetrics[0];

  return (
    <div className="space-y-6">
      {leader && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-amber-400/20 border border-amber-400/30 text-amber-300">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                Top Performing Business Unit
              </span>
              <h2 className="text-xl font-bold mt-0.5">{leader.name}</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Generates {leader.share.toFixed(1)}% of total revenue at a{" "}
                {leader.margin.toFixed(1)}% net margin
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right font-mono">
            <span className="text-xs text-slate-400 block">Unit Net Profit</span>
            <span className="text-2xl font-extrabold text-emerald-400">
              ${leader.profit.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {branchMetrics.map((b) => (
          <div
            key={b.name}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {b.name}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {b.orders} orders • {b.share.toFixed(1)}% revenue share
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                {b.margin.toFixed(1)}% Margin
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[11px] text-slate-400 block">Revenue</span>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                  ${b.revenue.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Net Profit</span>
                <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  ${b.profit.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Avg Order</span>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                  ${Math.round(b.aov).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                Star SKU:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {b.topProduct}
              </span>
            </div>
          </div>
        ))}
      </div>

      <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Channel Revenue vs. Net Profit Benchmark
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={branchMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="revenue"
                name="Total Revenue ($)"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="profit"
                name="Net Profit ($)"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}