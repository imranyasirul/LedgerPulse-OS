"use client";

import { useState, useMemo } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import { SalesRecord } from "@/types/analytics";

interface SalesTableProps {
  data: SalesRecord[];
}

type SortField = "date" | "revenue" | "profit";

export default function SalesTable({ data }: SalesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("date");

  const processedRows = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    const filtered = data.filter(
      (item) =>
        item.product.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );

    return filtered.sort((a, b) => {
      if (sortBy === "revenue") return b.revenue - a.revenue;
      if (sortBy === "profit") return b.profit - a.profit;
      return b.date.localeCompare(a.date);
    });
  }, [data, searchQuery, sortBy]);

  return (
    <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Detailed Sales Ledger
          </h2>
          <p className="text-xs text-slate-500">
            Search products or sort records by financial performance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product..."
              className="pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-4 h-4 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortField)}
              className="text-sm border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Sort: Latest Date</option>
              <option value="revenue">Sort: Highest Revenue</option>
              <option value="profit">Sort: Highest Profit</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-right">Revenue</th>
              <th className="py-3 px-4 text-right">Cost</th>
              <th className="py-3 px-4 text-right">Net Profit</th>
              <th className="py-3 px-4 text-right">Margin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {processedRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No matching sales records found.
                </td>
              </tr>
            ) : (
              processedRows.map((row) => {
                const margin = row.revenue > 0 ? (row.profit / row.revenue) * 100 : 0;
                const badgeColor =
                  margin >= 38
                    ? "bg-emerald-100 text-emerald-700"
                    : margin >= 25
                    ? "bg-blue-100 text-blue-700"
                    : "bg-amber-100 text-amber-700";

                return (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {row.date}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {row.product}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{row.category}</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-800">
                      ${row.revenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      ${row.cost.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                      ${row.profit.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${badgeColor}`}
                      >
                        {margin.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}