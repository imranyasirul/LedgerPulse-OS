"use client";

import {
  LayoutDashboard,
  TrendingUp,
  Table2,
  Store,
  BarChart3,
  Webhook,
  Bot,
  Database,
  UserCog,
  Package,
  GitCompareArrows,
  Receipt,
  Users,
  FileText,
  Sparkles,
} from "lucide-react";
import { UserSession } from "@/types/analytics";

export type ActiveTab =
  | "overview"
  | "forecasting"
  | "inventory"
  | "branches"
  | "expenses"
  | "customers"
  | "invoices"
  | "ledger"
  | "webhooks";

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  stores: string[];
  selectedStore: string;
  onStoreChange: (store: string) => void;
  onOpenAiAnalyst: () => void;
  webhookCount: number;
  currentUser: UserSession;
  onOpenAuthModal: () => void;
  dbConnected: boolean;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  stores,
  selectedStore,
  onStoreChange,
  onOpenAiAnalyst,
  webhookCount,
  currentUser,
  onOpenAuthModal,
  dbConnected,
}: SidebarProps) {
  const navGroups: {
    title: string;
    items: {
      id: ActiveTab;
      label: string;
      icon: typeof LayoutDashboard;
      badge?: number;
    }[];
  }[] = [
    {
      title: "Core Intelligence",
      items: [
        { id: "overview", label: "Executive Overview", icon: LayoutDashboard },
        { id: "forecasting", label: "Forecasting & Pareto", icon: TrendingUp },
        { id: "branches", label: "Branch & Channel Arena", icon: GitCompareArrows },
      ],
    },
    {
      title: "Operations & Finance",
      items: [
        { id: "invoices", label: "Smart Invoice Studio", icon: FileText },
        { id: "inventory", label: "Smart Inventory", icon: Package },
        { id: "expenses", label: "OpEx & Tax Vault", icon: Receipt },
        { id: "customers", label: "Customer CRM & LTV", icon: Users },
      ],
    },
    {
      title: "Audit & Pipelines",
      items: [
        { id: "ledger", label: "Financial Ledger", icon: Table2 },
        {
          id: "webhooks",
          label: "Live Webhook API",
          icon: Webhook,
          badge: webhookCount > 0 ? webhookCount : undefined,
        },
      ],
    },
  ];

  const roleBadgeColor =
    currentUser.role === "OWNER"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
      : currentUser.role === "ANALYST"
      ? "bg-blue-500/15 text-blue-300 border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.2)]"
      : "bg-amber-500/15 text-amber-300 border-amber-500/40";

  return (
    <aside className="w-full lg:w-68 bg-gradient-to-b from-[#050814] via-[#090f24] to-[#050814] text-slate-100 flex flex-col shrink-0 lg:min-h-screen border-r border-slate-800/90 relative overflow-hidden print:hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 w-56 h-56 rounded-full bg-blue-600/20 blur-3xl" />

      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3.5 relative z-10">
        <div className="p-2.5 bg-gradient-to-br from-blue-500 via-indigo-600 to-cyan-500 rounded-xl shadow-lg shadow-blue-600/30 ring-1 ring-white/20">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-base tracking-tight block bg-gradient-to-r from-white via-blue-100 to-cyan-300 bg-clip-text text-transparent">
            LedgerPlus <span className="text-cyan-400">OS</span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            Enterprise ERP &amp; BI Suite
          </span>
        </div>
      </div>

      <div className="p-4 border-b border-slate-800/80 relative z-10">
        <label
          htmlFor="workspace-select"
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2"
        >
          <Store className="w-3.5 h-3.5 text-cyan-400" />
          Active Business Unit
        </label>
        <select
          id="workspace-select"
          value={selectedStore}
          onChange={(e) => onStoreChange(e.target.value)}
          className="w-full bg-slate-900/90 border border-slate-700/80 hover:border-blue-500/60 text-xs font-semibold text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
        >
          {stores.map((store) => (
            <option key={store} value={store}>
              {store === "All" ? "All Business Units" : store}
            </option>
          ))}
        </select>
      </div>

      <nav className="p-3.5 space-y-5 flex-1 overflow-y-auto relative z-10">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              {group.title}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`group relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    active
                      ? "bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-blue-600/80 text-white shadow-lg shadow-blue-600/25 ring-1 ring-blue-400/30"
                      : "text-slate-300 hover:bg-white/[0.05] hover:text-white hover:translate-x-1"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-cyan-300 shadow-[0_0_8px_#67e8f9]" />
                  )}
                  <span className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                        active
                          ? "text-cyan-200 scale-110"
                          : "text-slate-400 group-hover:text-blue-400"
                      }`}
                    />
                    {item.label}
                  </span>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-400 text-slate-950 rounded-full shadow-xs">
                      +{item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}

        <div className="pt-3 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onOpenAiAnalyst}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600/25 via-purple-600/25 to-blue-600/25 hover:from-indigo-600/40 hover:to-blue-600/40 text-indigo-200 border border-indigo-400/30 shadow-inner transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            <Bot className="w-4 h-4 text-cyan-300" />
            <span>Launch AI Copilot</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-950/70 backdrop-blur-md relative z-10">
        <div className="flex items-center justify-between text-[11px] px-1">
          <span className="flex items-center gap-2 text-slate-300 font-medium">
            <span
              className={`w-2 h-2 rounded-full ${
                dbConnected
                  ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                  : "bg-amber-400 animate-pulse"
              }`}
            />
            <Database className="w-3.5 h-3.5 text-slate-400" />
            {dbConnected ? "PostgreSQL Live" : "Local Memory"}
          </span>
          <span className="font-mono text-[10px] text-slate-500">v2.6</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-white truncate">
              {currentUser.name}
            </p>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleBadgeColor}`}
            >
              {currentUser.role}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            {currentUser.email}
          </p>
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="mt-3 w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-200 bg-white/[0.07] hover:bg-white/[0.14] border border-white/[0.08] py-2 rounded-xl transition active:scale-[0.98] cursor-pointer"
          >
            <UserCog className="w-3.5 h-3.5 text-cyan-400" />
            Switch Role / Sign In
          </button>
        </div>
      </div>
    </aside>
  );
}