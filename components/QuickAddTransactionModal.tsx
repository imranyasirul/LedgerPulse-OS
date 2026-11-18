"use client";

import { useState } from "react";
import { X, PlusCircle } from "lucide-react";
import { SalesRecord } from "@/types/analytics";

interface QuickAddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecord: (record: SalesRecord) => void;
}

export default function QuickAddTransactionModal({
  isOpen,
  onClose,
  onAddRecord,
}: QuickAddTransactionModalProps) {
  const [product, setProduct] = useState("Wireless ANC Earbuds");
  const [category, setCategory] = useState("Gadgets");
  const [store, setStore] = useState("Online E-Commerce");
  const [revenue, setRevenue] = useState("280");
  const [cost, setCost] = useState("150");
  const [date, setDate] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rev = Number(revenue);
    const cst = Number(cost);
    if (!product.trim() || isNaN(rev) || isNaN(cst) || rev <= 0) return;

    const finalDate = date || new Date().toISOString().split("T")[0];

    onAddRecord({
      id: crypto.randomUUID(),
      date: finalDate,
      product: product.trim(),
      category: category.trim() || "General",
      store: store.trim() || "Primary Store",
      revenue: rev,
      cost: cst,
      profit: rev - cst,
    });

    setDate("");
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Record New Sale Transaction
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Product Name
            </label>
            <input
              type="text"
              required
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Category
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Business Unit / Store
              </label>
              <input
                type="text"
                required
                value={store}
                onChange={(e) => setStore(e.target.value)}
                className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Sale Revenue ($)
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                required
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                className="w-full text-sm font-mono border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Unit Cost ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full text-sm font-mono border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Transaction Date{" "}
              <span className="font-normal text-slate-400">
                (Leave empty for today)
              </span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-sm font-mono border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition cursor-pointer"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}