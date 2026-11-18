"use client";

import { useState, useMemo } from "react";
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Layers,
} from "lucide-react";
import { SalesRecord } from "@/types/analytics";

interface InventoryPageProps {
  records: SalesRecord[];
  canEdit: boolean;
}

const DEFAULT_STOCK: Record<string, number> = {
  "Smart Watch Pro": 42,
  "Winter Bomber Jacket": 18,
  "Wireless ANC Earbuds": 65,
  "Air High-Top Sneakers": 14,
  "Heavyweight Hoodie": 35,
  "Leather Cardholder": 80,
  "Canvas Tote Bag": 54,
};

export default function InventoryPage({
  records,
  canEdit,
}: InventoryPageProps) {
  const [stockOverrides, setStockOverrides] =
    useState<Record<string, number>>(DEFAULT_STOCK);

  const inventoryItems = useMemo(() => {
    const productMap = new Map<
      string,
      { category: string; unitsSold: number; totalRev: number; totalCost: number }
    >();

    records.forEach((r) => {
      const prev = productMap.get(r.product) || {
        category: r.category,
        unitsSold: 0,
        totalRev: 0,
        totalCost: 0,
      };
      productMap.set(r.product, {
        category: r.category,
        unitsSold: prev.unitsSold + 1,
        totalRev: prev.totalRev + r.revenue,
        totalCost: prev.totalCost + r.cost,
      });
    });

    const uniqueDays = Math.max(1, new Set(records.map((r) => r.date)).size);

    return Array.from(productMap.entries()).map(([product, stats], index) => {
      const fallbackStock = 25 + ((index * 13) % 45);
      const currentStock = stockOverrides[product] ?? fallbackStock;
      const dailyVelocity = stats.unitsSold / uniqueDays;
      const daysLeft =
        dailyVelocity > 0 ? Math.round(currentStock / dailyVelocity) : 99;
      const avgUnitCost =
        stats.unitsSold > 0 ? stats.totalCost / stats.unitsSold : 0;
      const stockValuation = Math.round(currentStock * avgUnitCost);

      const status: "CRITICAL" | "LOW" | "HEALTHY" =
        daysLeft <= 12 || currentStock <= 15
          ? "CRITICAL"
          : daysLeft <= 25 || currentStock <= 25
          ? "LOW"
          : "HEALTHY";

      return {
        product,
        category: stats.category,
        currentStock,
        unitsSold: stats.unitsSold,
        dailyVelocity,
        daysLeft,
        stockValuation,
        status,
      };
    });
  }, [records, stockOverrides]);

  const totalUnits = inventoryItems.reduce((s, i) => s + i.currentStock, 0);
  const totalValuation = inventoryItems.reduce(
    (s, i) => s + i.stockValuation,
    0
  );
  const criticalCount = inventoryItems.filter(
    (i) => i.status === "CRITICAL"
  ).length;

  const handleRestock = (product: string, current: number) => {
    if (!canEdit) return;
    setStockOverrides((prev) => ({
      ...prev,
      [product]: current + 25,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Warehouse Units
            </span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">
            {totalUnits.toLocaleString()} units
          </p>
          <span className="text-xs text-slate-400 mt-1 block">
            Across {inventoryItems.length} active SKUs
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Inventory Cost Valuation
            </span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
            ${totalValuation.toLocaleString()}
          </p>
          <span className="text-xs text-slate-400 mt-1 block">
            Capital tied in active stock
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Reorder Alerts
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-2">
            {criticalCount} SKUs
          </p>
          <span className="text-xs text-slate-400 mt-1 block">
            Require immediate restocking
          </span>
        </div>
      </div>

      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200/80 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            SKU Stock Velocity &amp; Automated Replenishment Matrix
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time burn rate computed directly from audited transaction frequency
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-5">Product SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">In Stock</th>
                <th className="py-3.5 px-4 text-right">Est. Days Left</th>
                <th className="py-3.5 px-4 text-right">Stock Value</th>
                <th className="py-3.5 px-4">Health</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {inventoryItems.map((item) => (
                <tr
                  key={item.product}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-5 font-semibold text-slate-900 dark:text-white">
                    {item.product}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                    {item.category}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {item.currentStock}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-600 dark:text-slate-300">
                    ~{item.daysLeft} days
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700 dark:text-slate-200">
                    ${item.stockValuation.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    {item.status === "CRITICAL" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300">
                        <AlertTriangle className="w-3 h-3" /> Critical
                      </span>
                    )}
                    {item.status === "LOW" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300">
                        Low Stock
                      </span>
                    )}
                    {item.status === "HEALTHY" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" /> Optimal
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      type="button"
                      disabled={!canEdit}
                      onClick={() =>
                        handleRestock(item.product, item.currentStock)
                      }
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/15 hover:bg-blue-100 rounded-lg disabled:opacity-40 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Restock +25
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}