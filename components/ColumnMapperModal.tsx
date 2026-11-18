"use client";

import { useState, useMemo } from "react";
import { X, CheckCircle2, Sparkles, ArrowRight, AlertCircle } from "lucide-react";
import { SalesRecord } from "@/types/analytics";

interface ColumnMapperModalProps {
  fileName: string;
  headers: string[];
  rawRows: Record<string, unknown>[];
  onConfirm: (records: SalesRecord[]) => void;
  onClose: () => void;
}

interface FieldMapping {
  product: string;
  revenue: string;
  cost: string;
  date: string;
  category: string;
  store: string;
}

function autoDetectColumn(headers: string[], keywords: string[]): string {
  const lowerHeaders = headers.map((h) => ({
    original: h,
    lower: h.toLowerCase().replace(/[^a-z0-9]/g, ""),
  }));

  for (const kw of keywords) {
    const exact = lowerHeaders.find((h) => h.lower === kw);
    if (exact) return exact.original;
  }

  for (const kw of keywords) {
    const partial = lowerHeaders.find((h) => h.lower.includes(kw));
    if (partial) return partial.original;
  }

  return "";
}

function parseFinancialNumber(val: unknown): number {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (val === null || val === undefined) return 0;
  const cleaned = String(val).replace(/[^0-9.-]+/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function parseCleanDate(val: unknown): string {
  if (typeof val === "number" && val > 20000 && val < 80000) {
    const utcDays = Math.floor(val - 25569);
    const dateObj = new Date(utcDays * 86400 * 1000);
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toISOString().split("T")[0];
    }
  }
  const str = String(val ?? "").trim();
  if (!str) return new Date().toISOString().split("T")[0];

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }
  return str.slice(0, 10);
}

export default function ColumnMapperModal({
  fileName,
  headers,
  rawRows,
  onConfirm,
  onClose,
}: ColumnMapperModalProps) {
  const [mapping, setMapping] = useState<FieldMapping>(() => ({
    product: autoDetectColumn(headers, ["product", "item", "title", "name", "sku", "goods"]),
    revenue: autoDetectColumn(headers, ["revenue", "sales", "gross", "total", "amount", "price", "income"]),
    cost: autoDetectColumn(headers, ["cost", "cogs", "expense", "buy", "purchase"]),
    date: autoDetectColumn(headers, ["date", "orderdate", "time", "day", "created"]),
    category: autoDetectColumn(headers, ["category", "dept", "department", "type", "group"]),
    store: autoDetectColumn(headers, ["store", "branch", "outlet", "channel", "shop", "location"]),
  }));

  const [validationError, setValidationError] = useState<string | null>(null);

  const mappedRecords = useMemo(() => {
    if (!mapping.product || !mapping.revenue) return [];

    return rawRows
      .map((row, index) => {
        const product = String(row[mapping.product] ?? "").trim();
        const revenue = parseFinancialNumber(row[mapping.revenue]);
        const cost = mapping.cost ? parseFinancialNumber(row[mapping.cost]) : 0;
        const date = mapping.date
          ? parseCleanDate(row[mapping.date])
          : new Date().toISOString().split("T")[0];
        const category = mapping.category
          ? String(row[mapping.category] ?? "General").trim() || "General"
          : "General";
        const store = mapping.store
          ? String(row[mapping.store] ?? "Primary Store").trim() || "Primary Store"
          : "Primary Store";

        if (!product || revenue <= 0) return null;

        return {
         id: `imp-${fileName}-${index}`,
          date,
          product,
          category,
          store,
          revenue,
          cost,
          profit: revenue - cost,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
}, [rawRows, mapping, fileName]);

  const handleApply = () => {
    if (!mapping.product || !mapping.revenue) {
      setValidationError("Please map both Product Name and Revenue columns to proceed.");
      return;
    }
    if (mappedRecords.length === 0) {
      setValidationError("No valid rows found with positive revenue. Check your column mapping.");
      return;
    }
    onConfirm(mappedRecords);
  };

  const fields: { key: keyof FieldMapping; label: string; required?: boolean }[] = [
    { key: "product", label: "Product / Item Name", required: true },
    { key: "revenue", label: "Gross Revenue / Sales", required: true },
    { key: "cost", label: "Product Cost / COGS" },
    { key: "date", label: "Transaction Date" },
    { key: "category", label: "Product Category" },
    { key: "store", label: "Store / Branch / Channel" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* হেডার */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Smart Schema & Column Mapper
              </h2>
              <p className="text-xs text-slate-500">
                Source file: <strong className="text-slate-700">{fileName}</strong> ({rawRows.length} rows detected)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/70 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* বডি */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div
                key={field.key}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60"
              >
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {field.label}{" "}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={mapping[field.key]}
                    onChange={(e) => {
                      setValidationError(null);
                      setMapping((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }));
                    }}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">
                      {field.required ? "-- Select Column --" : "-- Not Mapped (Default) --"}
                    </option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* লাইভ ডেটা প্রিভিউ */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Sanitized Data Preview (First 3 Valid Rows)
              </h3>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {mappedRecords.length} valid records ready
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Store</th>
                    <th className="py-2 px-3">Product</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3 text-right">Revenue</th>
                    <th className="py-2 px-3 text-right">Cost</th>
                    <th className="py-2 px-3 text-right">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mappedRecords.slice(0, 3).map((row) => (
                    <tr key={row.id}>
                      <td className="py-2 px-3 text-slate-600">{row.date}</td>
                      <td className="py-2 px-3 text-slate-600">{row.store}</td>
                      <td className="py-2 px-3 font-medium text-slate-900">
                        {row.product}
                      </td>
                      <td className="py-2 px-3 text-slate-600">{row.category}</td>
                      <td className="py-2 px-3 text-right font-medium text-slate-800">
                        ${row.revenue.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-600">
                        ${row.cost.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-emerald-600">
                        ${row.profit.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {mappedRecords.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-slate-400">
                        Select valid Product and Revenue columns to preview mapped data
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {validationError && (
            <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* ফুটার */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            Import {mappedRecords.length} Records
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}