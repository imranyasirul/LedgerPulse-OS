"use client";

import { useState } from "react";
import { Bot, X, Send, Sparkles } from "lucide-react";
import {
  SalesRecord,
  KpiSummary,
  EnterpriseAnalytics,
} from "@/types/analytics";

interface AiAnalystPanelProps {
  isOpen: boolean;
  onClose: () => void;
  records: SalesRecord[];
  summary: KpiSummary;
  analytics: EnterpriseAnalytics;
  selectedStore: string;
}

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
}

const QUICK_PROMPTS = [
  "Which products drive 80% of our net profit?",
  "What is our 7-day revenue forecast & daily trend?",
  "How can we improve our overall profit margin?",
  "Compare store & channel performance",
];

function generateExecutiveAnswer(
  question: string,
  records: SalesRecord[],
  summary: KpiSummary,
  analytics: EnterpriseAnalytics,
  selectedStore: string
): string {
  if (records.length === 0) {
    return "No active transactions are available in the current filter. Please upload a CSV/Excel dataset or reset filters.";
  }

  const q = question.toLowerCase();

  // ১. প্যারেটো ৮০/২০ প্রশ্ন
  if (
    q.includes("80%") ||
    q.includes("pareto") ||
    q.includes("top") ||
    q.includes("best")
  ) {
    const classA = analytics.paretoItems.filter((i) => i.abcClass === "A");
    const names = classA
      .map((i) => `${i.product} (${i.profitShare.toFixed(1)}%)`)
      .join(", ");
    return `Pareto 80/20 Analysis (${selectedStore}):\n• ${classA.length} Class-A products generate ${analytics.classAProfitShare.toFixed(1)}% of total net profit ($${summary.netProfit.toLocaleString()}).\n• Core Profit Drivers: ${names || "N/A"}.\n• Recommendation: Prioritize inventory availability and ad spend on these Class-A items while bundling slower Class-C items.`;
  }

  // ২. লিনিয়ার রিগ্রেশন ও ফোরকাস্ট প্রশ্ন
  if (
    q.includes("forecast") ||
    q.includes("predict") ||
    q.includes("trend") ||
    q.includes("future") ||
    q.includes("7-day")
  ) {
    const direction =
      analytics.slopePerDay >= 0 ? "upward growth" : "downward contraction";
    return `OLS Regression Forecast (${selectedStore}):\n• Projected 7-Day Revenue: $${analytics.projectedSevenDayRevenue.toLocaleString()}.\n• Daily Velocity Slope: ${analytics.slopePerDay >= 0 ? "+" : ""}$${analytics.slopePerDay.toFixed(2)}/day (${direction}).\n• Model Confidence (R²): ${(analytics.rSquared * 100).toFixed(1)}%.\n• Action Plan: Ensure stock replenishment aligns with the projected $${analytics.projectedSevenDayRevenue.toLocaleString()} demand window.`;
  }

  // ৩. মার্জিন ও খরচ অপ্টিমাইজেশন প্রশ্ন
  if (
    q.includes("margin") ||
    q.includes("profit") ||
    q.includes("cost") ||
    q.includes("improve")
  ) {
    const sortedByMargin = [...records].sort(
      (a, b) => a.profit / a.revenue - b.profit / b.revenue
    );
    const weakest = sortedByMargin[0];
    const weakMargin =
      weakest.revenue > 0 ? (weakest.profit / weakest.revenue) * 100 : 0;
    const targetProfit = Math.round(summary.totalRevenue * 0.48);
    const gap = Math.max(0, targetProfit - summary.netProfit);

    return `Margin & Cost Optimization Audit:\n• Current Net Margin: ${summary.profitMargin.toFixed(1)}% ($${summary.netProfit.toLocaleString()} net profit on $${summary.totalRevenue.toLocaleString()} revenue).\n• Primary Margin Drag: "${weakest.product}" is operating at a ${weakMargin.toFixed(1)}% margin.\n• Path to 48% Net Margin: Negotiating supplier COGS down by 8% on low-margin SKUs or shifting volume toward Class-A items would unlock ~$${gap.toLocaleString()} in additional net profit.`;
  }

  // ৪. স্টোর বা চ্যানেল তুলনা
  if (
    q.includes("store") ||
    q.includes("channel") ||
    q.includes("branch") ||
    q.includes("compare")
  ) {
    const storeStats = new Map<string, { rev: number; profit: number }>();
    records.forEach((r) => {
      const st = r.store || "Primary Store";
      const prev = storeStats.get(st) || { rev: 0, profit: 0 };
      storeStats.set(st, {
        rev: prev.rev + r.revenue,
        profit: prev.profit + r.profit,
      });
    });

    const lines = Array.from(storeStats.entries()).map(([st, val]) => {
      const m = val.rev > 0 ? ((val.profit / val.rev) * 100).toFixed(1) : "0.0";
      return `• ${st}: $${val.rev.toLocaleString()} revenue | $${val.profit.toLocaleString()} profit (${m}% margin)`;
    });

    return `Multi-Channel Business Unit Breakdown:\n${lines.join("\n")}\n• Strategic Insight: Allocate higher marketing budget to the channel exhibiting superior net margin per transaction.`;
  }

  // ডিফল্ট এক্সিকিউটিভ সামারি
  const topItem = analytics.paretoItems[0];
  return `Executive Summary for ${selectedStore}:\n• Total Revenue: $${summary.totalRevenue.toLocaleString()} (${summary.revenueGrowth >= 0 ? "+" : ""}${summary.revenueGrowth.toFixed(1)}% vs prior period).\n• Net Profit: $${summary.netProfit.toLocaleString()} at a ${summary.profitMargin.toFixed(1)}% margin.\n• #1 Profit Contributor: ${topItem ? `${topItem.product} ($${topItem.profit.toLocaleString()})` : "N/A"}.\n• 7-Day OLS Forecast: $${analytics.projectedSevenDayRevenue.toLocaleString()}.\n\nAsk me about Pareto 80/20 products, 7-day forecasts, margin improvements, or store comparisons!`;
}

export default function AiAnalystPanel({
  isOpen,
  onClose,
  records,
  summary,
  analytics,
  selectedStore,
}: AiAnalystPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content:
        "Hello! I am your AuraBI Executive Analyst. I continuously audit your live sales ledger, OLS regression trends, and Pareto 80/20 metrics. Select a prompt below or ask any financial question.",
    },
  ]);
  const [input, setInput] = useState("");

  if (!isOpen) return null;

  const handleAsk = (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `u-${messages.length}`,
      role: "user",
      content: trimmed,
    };

    const replyText = generateExecutiveAnswer(
      trimmed,
      records,
      summary,
      analytics,
      selectedStore
    );

    const aiMsg: ChatMessage = {
      id: `a-${messages.length + 1}`,
      role: "assistant",
      content: replyText,
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end print:hidden">
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col">
        {/* ড্রয়ার হেডার */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold flex items-center gap-1.5">
                AI Executive Data Analyst
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h2>
              <p className="text-[11px] text-slate-400">
                Auditing {records.length} live records ({selectedStore})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* চ্যাট মেসেজ তালিকা */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-line shadow-xs ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* কুইক প্রম্পট চিপস */}
        <div className="px-4 py-2.5 bg-white border-t border-slate-100 flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleAsk(prompt)}
              className="text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-full transition cursor-pointer text-left"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* ইনপুট ফর্ম */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(input);
          }}
          className="p-4 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about margins, Pareto, or forecasts..."
            className="flex-1 text-sm border border-slate-300 rounded-lg px-3.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}