"use client";

import { useState } from "react";
import {
  Webhook,
  Key,
  Copy,
  Check,
  Send,
  Terminal,
  Activity,
  Lock,
} from "lucide-react";
import { SalesRecord, UserRole } from "@/types/analytics";

interface WebhookPanelProps {
  onNewRecordIngested: (record: SalesRecord) => void;
  recentWebhookCount: number;
  userRole: UserRole;
}

const API_KEY = "aura_live_sk_987654321";

export default function WebhookPanel({
  onNewRecordIngested,
  recentWebhookCount,
  userRole,
}: WebhookPanelProps) {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);

  const [product, setProduct] = useState("Air Jordan 1 High OG");
  const [category, setCategory] = useState("Footwear");
  const [store, setStore] = useState("Online E-Commerce");
  const [revenue, setRevenue] = useState("240");
  const [cost, setCost] = useState("135");

  const isOwner = userRole === "OWNER";
  const canDispatch = userRole === "OWNER" || userRole === "ANALYST";
  const displayedKey = isOwner ? API_KEY : "aura_live_sk_••••••••• (Owner Only)";

  const curlSnippet = `curl -X POST http://localhost:3000/api/webhook/sales \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${displayedKey}" \\
  -d '{
    "product": "${product}",
    "category": "${category}",
    "store": "${store}",
    "revenue": ${Number(revenue) || 240},
    "cost": ${Number(cost) || 135}
  }'`;

  const copyToClipboard = (text: string, type: "key" | "curl") => {
    if (!isOwner) return;
    navigator.clipboard.writeText(text);
    if (type === "key") {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    }
  };

  const handleSimulateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canDispatch) return;
    setLoading(true);
    setApiResponse(null);

    try {
      const res = await fetch("/api/webhook/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({
          product,
          category,
          store,
          revenue: Number(revenue),
          cost: Number(cost),
          date: new Date().toISOString().split("T")[0],
        }),
      });

      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));

      if (res.ok && data.record) {
        onNewRecordIngested(data.record);
      }
    } catch {
      setApiResponse(JSON.stringify({ error: "Network request failed" }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg">
              <Webhook className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Real-Time Storefront & POS Webhook Ingestion
              </h2>
              <p className="text-xs text-slate-500">
                Stream live checkout orders directly into PostgreSQL & live analytics
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>Pipeline Active • {recentWebhookCount} live events ingested</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
              POST Endpoint URL
            </span>
            <code className="text-sm font-mono text-slate-900 break-all">
              /api/webhook/sales
            </code>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
            <div>
              <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase mb-1">
                <Key className="w-3.5 h-3.5" />
                Secret Header (x-api-key)
              </span>
              <code className="text-sm font-mono text-blue-700">
                {displayedKey}
              </code>
            </div>
            {isOwner ? (
              <button
                type="button"
                onClick={() => copyToClipboard(API_KEY, "key")}
                className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg transition cursor-pointer"
                title="Copy API Key"
              >
                {copiedKey ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                <Lock className="w-3.5 h-3.5" /> Restricted
              </span>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Terminal className="w-4 h-4 text-slate-500" />
              cURL / External Backend Payload Example
            </span>
            {isOwner && (
              <button
                type="button"
                onClick={() => copyToClipboard(curlSnippet, "curl")}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                {copiedCurl ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Snippet
                  </>
                )}
              </button>
            )}
          </div>
          <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed">
            {curlSnippet}
          </pre>
        </div>
      </section>

      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-semibold text-slate-800 mb-1">
          Live Checkout Webhook Simulator
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Dispatch an authenticated POST request to verify real-time KPI & database persistence
        </p>

        {!canDispatch ? (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0" />
            <span>
              Your current role (<strong>{userRole}</strong>) has read-only access. Switch to Owner or Analyst to dispatch live events.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <form onSubmit={handleSimulateWebhook} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Store / Channel
                  </label>
                  <input
                    type="text"
                    required
                    value={store}
                    onChange={(e) => setStore(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Revenue ($)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={revenue}
                    onChange={(e) => setRevenue(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cost / COGS ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {loading ? "Dispatching Event..." : "Send Live Order Event"}
              </button>
            </form>

            <div>
              <span className="block text-xs font-semibold text-slate-600 mb-1.5">
                Server Response Log
              </span>
              <pre className="h-44 p-4 rounded-xl bg-slate-950 text-emerald-400 text-xs font-mono overflow-auto">
                {apiResponse || "// Awaiting webhook dispatch..."}
              </pre>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}