"use client";

import { useState, useMemo, useEffect, useSyncExternalStore } from "react";
import {
  Filter,
  RotateCcw,
  FileSpreadsheet,
  Printer,
  Bot,
  Lock,
  Moon,
  Sun,
  Search,
  Plus,
  Award,
} from "lucide-react";
import Sidebar, { ActiveTab } from "@/components/Sidebar";
import KpiSection from "@/components/KpiSection";
import RevenueChart from "@/components/RevenueChart";
import CategoryChart from "@/components/CategoryChart";
import CsvUploader from "@/components/CsvUploader";
import BusinessInsights from "@/components/BusinessInsights";
import SalesTable from "@/components/SalesTable";
import ForecastAndPareto from "@/components/ForecastAndPareto";
import WebhookPanel from "@/components/WebhookPanel";
import AiAnalystPanel from "@/components/AiAnalystPanel";
import AuthModal from "@/components/AuthModal";
import WhatIfSimulator from "@/components/WhatIfSimulator";
import CommandPalette from "@/components/CommandPalette";
import QuickAddTransactionModal from "@/components/QuickAddTransactionModal";
import RevenueGoalTracker from "@/components/RevenueGoalTracker";
import ExecutiveAudioBriefing from "@/components/ExecutiveAudioBriefing";
import ForensicAuditCard from "@/components/ForensicAuditCard";
import BreakEvenRadar from "@/components/BreakEvenRadar";
import InventoryPage from "@/components/pages/InventoryPage";
import BranchComparisonPage from "@/components/pages/BranchComparisonPage";
import ExpenseTaxVaultPage from "@/components/pages/ExpenseTaxVaultPage";
import CustomerCrmPage from "@/components/pages/CustomerCrmPage";
import InvoiceStudioPage from "@/components/pages/InvoiceStudioPage";
import {
  calculateKpiWithGrowth,
  runEnterpriseAnalytics,
} from "@/lib/analyticsEngine";
import { SalesRecord, UserSession } from "@/types/analytics";

const INITIAL_DATA: SalesRecord[] = [
  { id: "1", date: "2026-11-01", product: "Smart Watch Pro", category: "Gadgets", store: "Online E-Commerce", revenue: 1100, cost: 650, profit: 450 },
  { id: "2", date: "2026-11-02", product: "Winter Bomber Jacket", category: "Apparel", store: "Retail Flagship", revenue: 1450, cost: 850, profit: 600 },
  { id: "3", date: "2026-11-03", product: "Wireless ANC Earbuds", category: "Gadgets", store: "Online E-Commerce", revenue: 1250, cost: 700, profit: 550 },
  { id: "4", date: "2026-11-04", product: "Air High-Top Sneakers", category: "Footwear", store: "Retail Flagship", revenue: 1950, cost: 1100, profit: 850 },
  { id: "5", date: "2026-11-05", product: "Heavyweight Hoodie", category: "Apparel", store: "Online E-Commerce", revenue: 1600, cost: 920, profit: 680 },
  { id: "6", date: "2026-11-06", product: "Air High-Top Sneakers", category: "Footwear", store: "Online E-Commerce", revenue: 2300, cost: 1280, profit: 1020 },
  { id: "7", date: "2026-11-07", product: "Smart Watch Pro", category: "Gadgets", store: "Retail Flagship", revenue: 2100, cost: 1200, profit: 900 },
  { id: "8", date: "2026-11-08", product: "Leather Cardholder", category: "Accessories", store: "Retail Flagship", revenue: 650, cost: 380, profit: 270 },
  { id: "9", date: "2026-11-09", product: "Winter Bomber Jacket", category: "Apparel", store: "Online E-Commerce", revenue: 2550, cost: 1450, profit: 1100 },
  { id: "10", date: "2026-11-10", product: "Canvas Tote Bag", category: "Accessories", store: "Online E-Commerce", revenue: 520, cost: 340, profit: 180 },
  { id: "11", date: "2026-11-11", product: "Air High-Top Sneakers", category: "Footwear", store: "Retail Flagship", revenue: 2850, cost: 1550, profit: 1300 },
  { id: "12", date: "2026-11-12", product: "Smart Watch Pro", category: "Gadgets", store: "Online E-Commerce", revenue: 3100, cost: 1700, profit: 1400 },
];

const PAGE_TITLES: Record<ActiveTab, { title: string; subtitle: string }> = {
  overview: {
    title: "Executive Intelligence Overview",
    subtitle: "Unified real-time KPIs, forecasts & automated boardroom telemetry",
  },
  forecasting: {
    title: "Predictive Forecasting & Pareto 80/20",
    subtitle: "OLS linear regression velocity & ABC profit concentration matrix",
  },
  branches: {
    title: "Branch & Channel Performance Arena",
    subtitle: "Head-to-head margin, AOV & revenue benchmark across business units",
  },
  invoices: {
    title: "Smart Invoice & Deal Profit Studio",
    subtitle: "Client receipt generator with secret margin guardrails & 1-click ledger sync",
  },
  inventory: {
    title: "Smart Inventory & Stock Velocity",
    subtitle: "Automated burn-rate tracking, stock valuation & replenishment alerts",
  },
  expenses: {
    title: "OpEx, Tax Reserve & Cash Flow Vault",
    subtitle: "Operating overhead ledger, corporate tax provision & free cash flow",
  },
  customers: {
    title: "Customer CRM & Lifetime Value Studio",
    subtitle: "CLV:CAC unit economics simulator & RFM buyer retention segments",
  },
  ledger: {
    title: "Audited Financial Sales Ledger",
    subtitle: "Benford's Law forensic integrity check & full transaction records",
  },
  webhooks: {
    title: "Live Storefront Webhook Pipeline",
    subtitle: "Real-time POS & e-commerce checkout ingestion API",
  },
};

function subscribeTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("aurabi-theme-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("aurabi-theme-change", callback);
  };
}

function getThemeSnapshot(): boolean {
  return localStorage.getItem("aurabi-theme") === "dark";
}

function getServerThemeSnapshot(): boolean {
  return false;
}

export default function DashboardPage() {
  const [records, setRecords] = useState<SalesRecord[]>(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [selectedStore, setSelectedStore] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isCustomData, setIsCustomData] = useState<boolean>(false);
  const [webhookCount, setWebhookCount] = useState<number>(0);
  const [isAiOpen, setIsAiOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isCommandOpen, setIsCommandOpen] = useState<boolean>(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [dbConnected, setDbConnected] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserSession>({
    name: "Yasirul Islam Imran",
    email: "imran@aurabi.io",
    role: "OWNER",
  });

  const isDark = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    const handleGlobalShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleGlobalShortcut);
    return () => window.removeEventListener("keydown", handleGlobalShortcut);
  }, []);

  const toggleDarkMode = () => {
    const next = !isDark;
    localStorage.setItem("aurabi-theme", next ? "dark" : "light");
    window.dispatchEvent(new Event("aurabi-theme-change"));
  };

  useEffect(() => {
    async function hydrateWorkspace() {
      try {
        const [authRes, recRes] = await Promise.all([
          fetch("/api/auth"),
          fetch("/api/records"),
        ]);

        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData.user) setCurrentUser(authData.user);
        }

        if (recRes.ok) {
          const recData = await recRes.json();
          setDbConnected(Boolean(recData.connected));
          if (
            recData.connected &&
            Array.isArray(recData.records) &&
            recData.records.length > 0
          ) {
            setRecords(recData.records);
            setIsCustomData(true);
          }
        }
      } catch {
        // অফলাইন বা ডেমো মোডে চলবে
      }
    }

    hydrateWorkspace();
  }, []);

  const stores = useMemo(() => {
    const unique = Array.from(
      new Set(records.map((item) => item.store || "Primary Store"))
    );
    return ["All", ...unique];
  }, [records]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(records.map((item) => item.category)));
    return ["All", ...unique];
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const storeName = item.store || "Primary Store";
      const matchStore = selectedStore === "All" || storeName === selectedStore;
      const matchCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      return matchStore && matchCategory;
    });
  }, [records, selectedStore, selectedCategory]);

  const summary = useMemo(
    () => calculateKpiWithGrowth(filteredRecords),
    [filteredRecords]
  );

  const enterpriseAnalytics = useMemo(
    () => runEnterpriseAnalytics(filteredRecords),
    [filteredRecords]
  );

  const healthGrade =
    summary.profitMargin >= 40
      ? "AAA • Optimal Margin"
      : summary.profitMargin >= 25
      ? "AA • Healthy Growth"
      : "B • Margin Watch";

  const handleDataLoaded = async (newRecords: SalesRecord[]) => {
    setRecords(newRecords);
    setSelectedStore("All");
    setSelectedCategory("All");
    setIsCustomData(true);

    try {
      await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: newRecords }),
      });
    } catch {
      // মেমোরিতে সংরক্ষিত থাকবে
    }
  };

  const handleQuickAddRecord = async (newRecord: SalesRecord) => {
    setRecords((prev) => [newRecord, ...prev]);
    setIsCustomData(true);

    try {
      await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: [newRecord] }),
      });
    } catch {
      // মেমোরিতে সংরক্ষিত থাকবে
    }
  };

  const handleNewWebhookRecord = (newRecord: SalesRecord) => {
    setRecords((prev) => [newRecord, ...prev]);
    setWebhookCount((c) => c + 1);
    setIsCustomData(true);
  };

  const handleReset = async () => {
    if (currentUser.role !== "OWNER") return;
    setRecords(INITIAL_DATA);
    setSelectedStore("All");
    setSelectedCategory("All");
    setIsCustomData(false);
    setWebhookCount(0);

    if (dbConnected) {
      try {
        await fetch("/api/records", { method: "DELETE" });
      } catch {
        // ইগনোর
      }
    }
  };

  const handleExportCsv = () => {
    const headers = [
      "date,store,product,category,revenue,cost,profit,margin_percent",
    ];
    const rows = filteredRecords.map((r) => {
      const margin =
        r.revenue > 0 ? ((r.profit / r.revenue) * 100).toFixed(2) : "0.00";
      return `${r.date},"${r.store || "Primary Store"}","${r.product}","${r.category}",${r.revenue},${r.cost},${r.profit},${margin}`;
    });

    const csvContent = [...headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `enterprise-bi-${selectedStore.toLowerCase().replace(/\s+/g, "-")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const canEdit = currentUser.role !== "VIEWER";
  const currentMeta = PAGE_TITLES[activeTab];

  return (
    <div className="min-h-screen bg-[#f6f8fa] dark:bg-[#070b14] flex flex-col lg:flex-row transition-colors duration-200 print:bg-white">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        stores={stores}
        selectedStore={selectedStore}
        onStoreChange={setSelectedStore}
        onOpenAiAnalyst={() => setIsAiOpen(true)}
        webhookCount={webhookCount}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        dbConnected={dbConnected}
      />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto print:p-2">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs print:hidden">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                AURABI OS //
              </span>
              <span>{currentMeta.subtitle}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/30">
              <Award className="w-3.5 h-3.5" />
              Credit &amp; Margin Grade: {healthGrade}
            </div>
          </div>

          <header className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {currentMeta.title}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Workspace:{" "}
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {selectedStore === "All"
                    ? "All Business Units"
                    : selectedStore}
                </span>{" "}
                • Role:{" "}
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {currentUser.role}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <button
                type="button"
                onClick={() => setIsCommandOpen(true)}
                className="inline-flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 transition cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span>Quick Search...</span>
                <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  Ctrl K
                </kbd>
              </button>

              <button
                type="button"
                onClick={toggleDarkMode}
                aria-label="Toggle Dark Mode"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-amber-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                {isDark ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-indigo-600" />
                    <span>Dark</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsAiOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-blue-600 rounded-xl hover:bg-slate-800 dark:hover:bg-blue-500 shadow-xs transition cursor-pointer"
              >
                <Bot className="w-4 h-4 text-blue-400 dark:text-white" />
                AI Analyst
              </button>

              {canEdit && (
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-500/25 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Sale
                </button>
              )}

              {canEdit ? (
                <CsvUploader onDataLoaded={handleDataLoaded} />
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-xl">
                  <Lock className="w-3.5 h-3.5" />
                  Read-Only
                </span>
              )}
            </div>
          </header>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.02)] flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-2.5">
              <Filter className="w-4 h-4 text-slate-400" />
              <label
                htmlFor="category-filter"
                className="text-sm font-medium text-slate-600 dark:text-slate-300"
              >
                Category:
              </label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <span className="text-xs text-slate-400 ml-1">
                {filteredRecords.length} transactions
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isCustomData && currentUser.role === "OWNER" && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/15 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Data
                </button>
              )}

              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Export CSV
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Save PDF
              </button>
            </div>
          </div>

          <KpiSection summary={summary} />

          {activeTab === "overview" && (
            <>
              <ExecutiveAudioBriefing
                summary={summary}
                analytics={enterpriseAnalytics}
                selectedStore={selectedStore}
                recordCount={filteredRecords.length}
              />
              <RevenueGoalTracker
                currentRevenue={summary.totalRevenue}
                transactionCount={filteredRecords.length}
              />
              <BreakEvenRadar summary={summary} />
              <WhatIfSimulator summary={summary} />
              <BusinessInsights data={filteredRecords} />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <RevenueChart data={filteredRecords} />
                </div>
                <div className="lg:col-span-1">
                  <CategoryChart data={filteredRecords} />
                </div>
              </div>
              <ForecastAndPareto analytics={enterpriseAnalytics} />
              <ForensicAuditCard records={filteredRecords} />
            </>
          )}

          {activeTab === "forecasting" && (
            <>
              <BreakEvenRadar summary={summary} />
              <WhatIfSimulator summary={summary} />
              <ForecastAndPareto analytics={enterpriseAnalytics} />
            </>
          )}

          {activeTab === "branches" && (
            <BranchComparisonPage records={records} />
          )}

          {activeTab === "invoices" && (
            <InvoiceStudioPage
              records={records}
              onRecordSale={handleQuickAddRecord}
              canEdit={canEdit}
            />
          )}

          {activeTab === "inventory" && (
            <InventoryPage records={filteredRecords} canEdit={canEdit} />
          )}

          {activeTab === "expenses" && (
            <ExpenseTaxVaultPage summary={summary} canEdit={canEdit} />
          )}

          {activeTab === "customers" && (
            <CustomerCrmPage
              summary={summary}
              transactionCount={filteredRecords.length}
            />
          )}

          {activeTab === "ledger" && (
            <>
              <ForensicAuditCard records={filteredRecords} />
              <SalesTable data={filteredRecords} />
            </>
          )}

          {activeTab === "webhooks" && (
            <WebhookPanel
              onNewRecordIngested={handleNewWebhookRecord}
              recentWebhookCount={webhookCount}
              userRole={currentUser.role}
            />
          )}
        </div>
      </main>

      <AiAnalystPanel
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        records={filteredRecords}
        summary={summary}
        analytics={enterpriseAnalytics}
        selectedStore={selectedStore}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onAuthenticated={(user) => setCurrentUser(user)}
      />

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onTabChange={setActiveTab}
        onOpenAi={() => setIsAiOpen(true)}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onExportCsv={handleExportCsv}
        isDark={isDark}
        onToggleDark={toggleDarkMode}
        stores={stores}
        onSelectStore={setSelectedStore}
        canEdit={canEdit}
      />

      <QuickAddTransactionModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddRecord={handleQuickAddRecord}
      />
    </div>
  );
}