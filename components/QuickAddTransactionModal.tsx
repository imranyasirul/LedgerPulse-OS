"use client";

import { useState } from "react";
import { PlusCircle, X } from "lucide-react";
import { SalesRecord } from "@/types/analytics";

interface QuickAddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecord: (record: SalesRecord) => void;
}

const PRESET_PRODUCTS = [
  { name: "Smart Watch Pro", category: "Gadgets", rev: 280, cost: 150 },
  { name: "Air High-Top Sneakers", category: "Footwear", rev: 240, cost: 130 },
  { name: "Winter Bomber Jacket", category: "Apparel", rev: 190, cost: 105 },
];

export default function QuickAddTransactionModal({
  isOpen,
  onClose,
  onAddRecord,
}: QuickAddTransactionModalProps) {
  const [product, setProduct] = useState("Smart Watch Pro");
  const [category, setCategory] = useState("Gadgets");
  const [store, setStore] = useState("Online E-Commerce");
  const [revenue, setRevenue] = useState("280");
  const [cost, setCost] = useState("150");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  if (!isOpen) return null;

  const numRev = Number(revenue) || 0;
  const numCost = Number(cost) || 0;
  const liveProfit = numRev - numCost;
  const liveMargin = numRev > 0 ? ((liveProfit / numRev) * 100).toFixed(1) : "0.0";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.trim() || numRev <= 0) return;

    const newRecord: SalesRecord = {
      id: crypto.randomUUID(),
      date,
      product: product.trim(),
      category: category.trim() || "General",
      store: store.trim() || "Primary Store",
      revenue: numRev,
      cost: Math.max(0, numCost),
      profit: liveProfit,
    };

    onAddRecord(newRecord);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold">Quick Sale Entry</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* দ্রুত পণ্য নির্বাচনের বাটন */}
          <div>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Quick-Fill SKU Templates
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_PRODUCTS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setProduct(preset.name);
                    setCategory(preset.category);
                    setRevenue(String(preset.rev));
                    setCost(String(preset.cost));
                  }}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 transition cursor-pointer"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Product Name
              </label>
              <input
                type="text"
                required
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Category
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Store / Channel
              </label>
              <input
                type="text"
                required
                value={store}
                onChange={(e) => setStore(e.target.value)}
                className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Transaction Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Selling Revenue ($)
              </label>
              <input
                type="number"
                min="1"
                required
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                className="w-full text-sm font-mono border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Product Cost ($)
              </label>
              <input
                type="number"
                min="0"
                required
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full text-sm font-mono border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* লাইভ মুনাফা ও মার্জিন প্রিভিউ */}
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-between text-xs">
            <span className="font-medium text-emerald-800 dark:text-emerald-300">
              Calculated Net Profit:
            </span>
            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
              ${liveProfit.toLocaleString()} ({liveMargin}% margin)
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer"
            >
              Add to Ledger
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}