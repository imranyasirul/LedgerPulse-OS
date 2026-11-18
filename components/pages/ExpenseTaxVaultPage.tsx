"use client";

import { useState, useMemo } from "react";
import { Receipt, Plus, Trash2, Landmark, Wallet } from "lucide-react";
import { KpiSummary } from "@/types/analytics";

interface ExpenseItem {
  id: string;
  title: string;
  category: string;
  amount: number;
}

interface ExpenseTaxVaultPageProps {
  summary: KpiSummary;
  canEdit: boolean;
}

const INITIAL_EXPENSES: ExpenseItem[] = [
  { id: "exp-1", title: "Showroom & Warehouse Lease", category: "Facility", amount: 1800 },
  { id: "exp-2", title: "Meta & TikTok Performance Ads", category: "Marketing", amount: 1250 },
  { id: "exp-3", title: "Sales & Logistics Staff Payroll", category: "Payroll", amount: 1650 },
  { id: "exp-4", title: "Nationwide Courier & Packaging", category: "Fulfillment", amount: 480 },
];

export default function ExpenseTaxVaultPage({
  summary,
  canEdit,
}: ExpenseTaxVaultPageProps) {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(INITIAL_EXPENSES);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Marketing");
  const [amount, setAmount] = useState("");
  const [taxRate, setTaxRate] = useState<number>(15);

  const financials = useMemo(() => {
    const totalOpex = expenses.reduce((sum, e) => sum + e.amount, 0);
    const grossProfit = summary.netProfit;
    const ebitda = grossProfit - totalOpex;
    const estimatedTax = ebitda > 0 ? Math.round((ebitda * taxRate) / 100) : 0;
    const trueNetCash = ebitda - estimatedTax;

    return {
      totalOpex,
      grossProfit,
      ebitda,
      estimatedTax,
      trueNetCash,
    };
  }, [expenses, summary.netProfit, taxRate]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    const numAmount = Number(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) return;

    setExpenses((prev) => [
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        category,
        amount: numAmount,
      },
      ...prev,
    ]);
    setTitle("");
    setAmount("");
  };

  const handleDelete = (id: string) => {
    if (!canEdit) return;
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Gross Product Profit
          </span>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1.5">
            ${financials.grossProfit.toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Operating Expenses (OpEx)
          </span>
          <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1.5">
            -${financials.totalOpex.toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Tax &amp; VAT Reserve ({taxRate}%)
            </span>
            <Landmark className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1.5">
            -${financials.estimatedTax.toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Retained Free Cash Flow
            </span>
            <Wallet className="w-4 h-4 text-emerald-500" />
          </div>
          <p
            className={`text-2xl font-bold font-mono mt-1.5 ${
              financials.trueNetCash >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            ${financials.trueNetCash.toLocaleString()}
          </p>
        </div>
      </div>

      {/* ট্যাক্স স্লাইডার ও খরচ এন্ট্রি */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Tax Provision &amp; Expense Entry
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Adjust corporate tax rate and log recurring overhead bills
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70">
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-slate-600 dark:text-slate-300">
                Corporate Tax / VAT Provision
              </span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400">
                {taxRate}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="35"
              step="1"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {canEdit && (
            <form onSubmit={handleAddExpense} className="space-y-3 pt-2">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Expense title (e.g., Facebook Ad Boost)"
                className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Facility">Facility</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Payroll">Payroll</option>
                  <option value="Fulfillment">Fulfillment</option>
                  <option value="Software">Software</option>
                </select>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount ($)"
                  className="text-sm font-mono border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Record Operating Expense
              </button>
            </form>
          )}
        </div>

        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="w-4 h-4 text-slate-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Active Operating Expense Schedule
            </h3>
          </div>

          <div className="space-y-2.5">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {exp.title}
                  </p>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {exp.category}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                    ${exp.amount.toLocaleString()}
                  </span>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => handleDelete(exp.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                      title="Remove Expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}