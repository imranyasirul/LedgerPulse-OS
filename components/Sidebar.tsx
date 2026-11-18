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
} from "lucide-react";
import { UserSession } from "@/types/analytics";

export type ActiveTab =
  | "overview"
  | "forecasting"
  | "inventory"
  | "branches"
  | "expenses"
  | "customers"
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
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
      : currentUser.role === "ANALYST"
      ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
      : "bg-amber-500/20 text-amber-300 border-amber-500/40";

  return (
    <aside className="w-full lg:w-64 bg-slate-950 text-slate-100 flex flex-col shrink-0 lg:min-h-screen border-r border-slate-800/80 print:hidden">
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-md shadow-blue-600/20">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-base tracking-tight block">
 LedgerPulse <span className="text-blue-400">OS</span>
</span>
          <span className="text-[11px] text-slate-400">
            Enterprise ERP &amp; BI Suite
          </span>
        </div>
      </div>

      <div className="p-4 border-b border-slate-800/80">
        <label
          htmlFor="workspace-select"
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2"
        >
          <Store className="w-3.5 h-3.5 text-blue-400" />
          Active Business Unit
        </label>
        <select
          id="workspace-select"
          value={selectedStore}
          onChange={(e) => onStoreChange(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700/80 text-xs font-medium text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {stores.map((store) => (
            <option key={store} value={store}>
              {store === "All" ? "All Business Units" : store}
            </option>
          ))}
        </select>
      </div>

      <nav className="p-3.5 space-y-5 flex-1 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    active
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-600/25"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </span>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500 text-slate-950 rounded-full">
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
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 transition cursor-pointer"
          >
            <Bot className="w-4 h-4 text-indigo-400" />
            Launch AI Executive Copilot
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-900/40">
        <div className="flex items-center gap-2 text-[11px]">
          <Database
            className={`w-3.5 h-3.5 ${
              dbConnected ? "text-emerald-400" : "text-amber-400"
            }`}
          />
          <span className="text-slate-300">
            {dbConnected ? "PostgreSQL Connected" : "Local Memory Mode"}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
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
            className="mt-2.5 w-full inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 py-1.5 rounded-lg transition cursor-pointer"
          >
            <UserCog className="w-3.5 h-3.5" />
            Switch Role / Sign In
          </button>
        </div>
      </div>
    </aside>
  );
}