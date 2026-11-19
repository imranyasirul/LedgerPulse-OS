"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Send,
  Eye,
  X,
} from "lucide-react";
import { SalesRecord } from "@/types/analytics";

interface InvoiceStudioPageProps {
  records: SalesRecord[];
  onRecordSale: (record: SalesRecord) => Promise<void> | void;
  canEdit: boolean;
}

interface InvoiceLineItem {
  id: string;
  product: string;
  category: string;
  qty: number;
  unitPrice: number;
  unitCost: number;
}

interface IssuedInvoice {
  invoiceNo: string;
  date: string;
  customerName: string;
  customerPhone: string;
  store: string;
  paymentMethod: string;
  items: InvoiceLineItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  grandTotal: number;
  netProfit: number;
}

export default function InvoiceStudioPage({
  records,
  onRecordSale,
  canEdit,
}: InvoiceStudioPageProps) {
  const catalog = useMemo(() => {
    const map = new Map<
      string,
      { category: string; totalRev: number; totalCost: number; count: number }
    >();

    records.forEach((r) => {
      const prev = map.get(r.product) || {
        category: r.category,
        totalRev: 0,
        totalCost: 0,
        count: 0,
      };
      map.set(r.product, {
        category: r.category,
        totalRev: prev.totalRev + r.revenue,
        totalCost: prev.totalCost + r.cost,
        count: prev.count + 1,
      });
    });

    return Array.from(map.entries()).map(([product, stats]) => ({
      product,
      category: stats.category,
      avgPrice: Math.round(stats.totalRev / stats.count),
      avgCost: Math.round(stats.totalCost / stats.count),
    }));
  }, [records]);

  const [invoiceCounter, setInvoiceCounter] = useState<number>(1042);
  const [customerName, setCustomerName] = useState<string>("Tanvir Ahmed");
  const [customerPhone, setCustomerPhone] = useState<string>("+880 1712-458920");
  const [store, setStore] = useState<string>("Online E-Commerce");
  const [paymentMethod, setPaymentMethod] = useState<string>("bKash / Nagad");
  const [discount, setDiscount] = useState<number>(50);
  const [deliveryFee, setDeliveryFee] = useState<number>(15);
  const [invoiceDate, setInvoiceDate] = useState<string>("");

  const [items, setItems] = useState<InvoiceLineItem[]>([
    {
      id: "init-1",
      product: "Smart Watch Pro",
      category: "Gadgets",
      qty: 1,
      unitPrice: 1250,
      unitCost: 700,
    },
    {
      id: "init-2",
      product: "Wireless ANC Earbuds",
      category: "Gadgets",
      qty: 1,
      unitPrice: 450,
      unitCost: 240,
    },
  ]);

  const [issuedHistory, setIssuedHistory] = useState<IssuedInvoice[]>([]);
  const [previewInvoice, setPreviewInvoice] = useState<IssuedInvoice | null>(
    null
  );
  const [syncBanner, setSyncBanner] = useState<string | null>(null);

  const financials = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.qty * item.unitPrice,
      0
    );
    const totalCogs = items.reduce(
      (sum, item) => sum + item.qty * item.unitCost,
      0
    );
    const safeDiscount = Math.min(subtotal, Math.max(0, discount));
    const netProductRevenue = subtotal - safeDiscount;
    const grandTotal = netProductRevenue + Math.max(0, deliveryFee);
    const netProfit = netProductRevenue - totalCogs;
    const netMarginPct =
      netProductRevenue > 0 ? (netProfit / netProductRevenue) * 100 : 0;

    return {
      subtotal,
      totalCogs,
      safeDiscount,
      netProductRevenue,
      grandTotal,
      netProfit,
      netMarginPct,
    };
  }, [items, discount, deliveryFee]);

  const handleAddCatalogItem = (productName: string) => {
    const found = catalog.find((c) => c.product === productName);
    if (!found) return;

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.product === found.product);
      if (existingIndex >= 0) {
        return prev.map((item, idx) =>
          idx === existingIndex ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          product: found.product,
          category: found.category,
          qty: 1,
          unitPrice: found.avgPrice,
          unitCost: found.avgCost,
        },
      ];
    });
  };

  const handleAddBlankRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        product: "Custom Item",
        category: "General",
        qty: 1,
        unitPrice: 200,
        unitCost: 110,
      },
    ]);
  };

  const updateItem = (
    id: string,
    field: keyof InvoiceLineItem,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleIssueAndSync = async () => {
    if (!canEdit || items.length === 0) return;

    const finalDate = invoiceDate || new Date().toISOString().split("T")[0];
    const invoiceNo = `INV-${invoiceCounter}`;

    const discountRatio =
      financials.subtotal > 0
        ? financials.netProductRevenue / financials.subtotal
        : 1;

    for (const item of items) {
      const grossLine = item.qty * item.unitPrice;
      const adjustedRev = Math.round(grossLine * discountRatio);
      const lineCost = Math.round(item.qty * item.unitCost);

      await onRecordSale({
        id: crypto.randomUUID(),
        date: finalDate,
        product: item.product,
        category: item.category,
        store,
        revenue: adjustedRev,
        cost: lineCost,
        profit: adjustedRev - lineCost,
      });
    }

    const completedInvoice: IssuedInvoice = {
      invoiceNo,
      date: finalDate,
      customerName: customerName.trim() || "Walk-In Customer",
      customerPhone: customerPhone.trim() || "N/A",
      store,
      paymentMethod,
      items: [...items],
      subtotal: financials.subtotal,
      discount: financials.safeDiscount,
      deliveryFee: Math.max(0, deliveryFee),
      grandTotal: financials.grandTotal,
      netProfit: financials.netProfit,
    };

    setIssuedHistory((prev) => [completedInvoice, ...prev]);
    setPreviewInvoice(completedInvoice);
    setInvoiceCounter((c) => c + 1);
    setSyncBanner(
      `${invoiceNo} issued for ${completedInvoice.customerName} ($${completedInvoice.grandTotal.toLocaleString()}) & synced directly to Financial Ledger!`
    );
  };

  return (
    <div className="space-y-6">
      {syncBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncBanner(null)}
            className="text-emerald-700 dark:text-emerald-300 hover:opacity-75 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* মূল ইনভয়েস বিল্ডার ও সিক্রেট মার্জিন গার্ডরেইল */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:hidden">
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Smart Customer Invoice Builder (#INV-{invoiceCounter})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Generate client receipts &amp; automatically sync revenue into your ledger
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddBlankRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/15 hover:bg-blue-100 rounded-xl transition cursor-pointer self-start"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Custom Row
            </button>
          </div>

          {/* ক্যাটালগ কুইক-পিক বাটন */}
          {catalog.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                1-Click Catalog Quick-Add (Auto-Fills Avg Price &amp; COGS):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {catalog.map((catItem) => (
                  <button
                    key={catItem.product}
                    type="button"
                    onClick={() => handleAddCatalogItem(catItem.product)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-500/20 hover:text-blue-600 dark:hover:text-blue-300 border border-slate-200/70 dark:border-slate-700 transition cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    {catItem.product} (${catItem.avgPrice})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ক্রেতার তথ্য */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Business Unit
              </label>
              <select
                value={store}
                onChange={(e) => setStore(e.target.value)}
                className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Online E-Commerce">Online E-Commerce</option>
                <option value="Retail Flagship">Retail Flagship</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="bKash / Nagad">bKash / Nagad</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
                <option value="Cash Counter">Cash Counter</option>
                <option value="Card / Bank">Card / Bank</option>
              </select>
            </div>
          </div>

          {/* ইনভয়েস আইটেম টেবিল */}
          <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-2 w-16 text-center">Qty</th>
                  <th className="py-2.5 px-2 w-24 text-right">Sell ($)</th>
                  <th className="py-2.5 px-2 w-24 text-right text-amber-600 dark:text-amber-400">
                    Unit Cost
                  </th>
                  <th className="py-2.5 px-3 text-right">Line Total</th>
                  <th className="py-2.5 px-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.product}
                        onChange={(e) =>
                          updateItem(item.id, "product", e.target.value)
                        }
                        className="w-full bg-transparent font-semibold text-slate-900 dark:text-white focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "qty",
                            Math.max(1, Number(e.target.value))
                          )
                        }
                        className="w-full text-center font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-1 text-slate-900 dark:text-white"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "unitPrice",
                            Math.max(0, Number(e.target.value))
                          )
                        }
                        className="w-full text-right font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-1 px-1.5 text-slate-900 dark:text-white"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0"
                        value={item.unitCost}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "unitCost",
                            Math.max(0, Number(e.target.value))
                          )
                        }
                        className="w-full text-right font-mono bg-amber-50/60 dark:bg-amber-500/10 border border-amber-200/70 dark:border-amber-500/20 rounded-md py-1 px-1.5 text-amber-800 dark:text-amber-300"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      ${(item.qty * item.unitPrice).toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ডিসকাউন্ট, ডেলিভারি ও তারিখ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Customer Discount ($)
              </label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                className="w-full text-xs font-mono border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Delivery / Shipping ($)
              </label>
              <input
                type="number"
                min="0"
                value={deliveryFee}
                onChange={(e) =>
                  setDeliveryFee(Math.max(0, Number(e.target.value)))
                }
                className="w-full text-xs font-mono border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Invoice Date (Blank = Today)
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full text-xs font-mono border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* ডান পাশ: ওনার সিক্রেট মার্জিন গার্ডরেইল ও সামারি */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-950 text-white p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                <Sparkles className="w-3.5 h-3.5" />
                Owner Margin Guardrail
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                Hidden on Print
              </span>
            </div>

            <div className="space-y-2 text-xs border-b border-slate-800 pb-4">
              <div className="flex justify-between text-slate-400">
                <span>Product Subtotal:</span>
                <span className="font-mono text-white">
                  ${financials.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-rose-400">
                <span>Discount Applied:</span>
                <span className="font-mono">
                  -${financials.safeDiscount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery Charge:</span>
                <span className="font-mono text-white">
                  +${Math.max(0, deliveryFee).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-800">
                <span>Customer Payable:</span>
                <span className="font-mono text-blue-400">
                  ${financials.grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Your Total COGS:</span>
                <span className="font-mono text-amber-300">
                  ${financials.totalCogs.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-300">
                  True Deal Net Profit:
                </span>
                <span
                  className={`text-lg font-extrabold font-mono ${
                    financials.netProfit >= 0
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }`}
                >
                  ${financials.netProfit.toLocaleString()} (
                  {financials.netMarginPct.toFixed(1)}%)
                </span>
              </div>
            </div>

            {financials.netMarginPct < 15 && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2 text-xs text-rose-200">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  Warning: Discount reduced net profit margin below 15%. Consider trimming the discount before issuing.
                </span>
              </div>
            )}

            <button
              type="button"
              disabled={!canEdit || items.length === 0}
              onClick={handleIssueAndSync}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-blue-600/20 disabled:opacity-40 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Issue Invoice &amp; Sync to Ledger
            </button>
          </div>
        </div>
      </div>

      {/* প্রিন্টযোগ্য কাস্টমার ইনভয়েস প্রিভিউ */}
      {previewInvoice && (
        <section className="bg-white text-slate-900 p-8 rounded-2xl border border-slate-300 shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
                Official Tax Invoice &amp; Receipt
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {previewInvoice.store}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Invoice No:{" "}
                <strong className="font-mono text-slate-800">
                  {previewInvoice.invoiceNo}
                </strong>{" "}
                • Date: <span className="font-mono">{previewInvoice.date}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </button>
              <button
                type="button"
                onClick={() => setPreviewInvoice(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-semibold block">
                Billed To:
              </span>
              <p className="font-bold text-sm text-slate-900 mt-0.5">
                {previewInvoice.customerName}
              </p>
              <p className="text-slate-600">{previewInvoice.customerPhone}</p>
            </div>
            <div className="text-right">
              <span className="text-slate-400 uppercase font-semibold block">
                Payment Status:
              </span>
              <p className="font-bold text-emerald-600 text-sm mt-0.5">
                CONFIRMED ({previewInvoice.paymentMethod})
              </p>
            </div>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50 text-slate-500 uppercase text-[10px]">
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {previewInvoice.items.map((it) => (
                <tr key={it.id}>
                  <td className="py-2.5 px-3 font-semibold">{it.product}</td>
                  <td className="py-2.5 px-3 text-center font-mono">{it.qty}</td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    ${it.unitPrice.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold">
                    ${(it.qty * it.unitPrice).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span className="font-mono">
                  ${previewInvoice.subtotal.toLocaleString()}
                </span>
              </div>
              {previewInvoice.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span className="font-mono">
                    -${previewInvoice.discount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Shipping / Delivery:</span>
                <span className="font-mono">
                  ${previewInvoice.deliveryFee.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="font-mono">
                  ${previewInvoice.grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* পূর্বে ইস্যু করা ইনভয়েস তালিকা */}
      {issuedHistory.length > 0 && (
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 print:hidden">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
            Session Issued Invoices ({issuedHistory.length})
          </h3>
          <div className="space-y-2">
            {issuedHistory.map((inv) => (
              <div
                key={inv.invoiceNo}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {inv.invoiceNo}
                  </span>{" "}
                  •{" "}
                  <strong className="text-slate-900 dark:text-white">
                    {inv.customerName}
                  </strong>{" "}
                  <span className="text-slate-400">({inv.date})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    ${inv.grandTotal.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewInvoice(inv)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-500 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}