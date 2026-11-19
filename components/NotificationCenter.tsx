"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Bell,
  AlertTriangle,
  TrendingDown,
  PackageCheck,
  CheckCheck,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { SalesRecord } from "@/types/analytics";
import { ActiveTab } from "@/components/Sidebar";

interface NotificationCenterProps {
  records: SalesRecord[];
  totalRevenue: number;
  profitMargin: number;
  dbConnected: boolean;
  onNavigate: (tab: ActiveTab) => void;
}

interface SmartAlert {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  targetTab: ActiveTab;
  actionLabel: string;
}

export default function NotificationCenter({
  records,
  totalRevenue,
  profitMargin,
  dbConnected,
  onNavigate,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const alerts = useMemo<SmartAlert[]>(() => {
    const list: SmartAlert[] = [];

    // ১. কম মার্জিন বিশিষ্ট পণ্যের সতর্কবার্তা
    const lowMarginItems = records.filter((r) => {
      const margin = r.revenue > 0 ? (r.profit / r.revenue) * 100 : 0;
      return margin < 36;
    });

    if (lowMarginItems.length > 0) {
      const sample = lowMarginItems[0];
      const sampleMargin =
        sample.revenue > 0
          ? ((sample.profit / sample.revenue) * 100).toFixed(1)
          : "0.0";
      list.push({
        id: `margin-watch-${lowMarginItems.length}-${sample.product}`,
        severity: Number(sampleMargin) < 20 ? "critical" : "warning",
        title: `Margin Watch: ${sample.product} (${sampleMargin}%)`,
        description: `${lowMarginItems.length} transaction(s) recorded below target 36% gross margin threshold.`,
        targetTab: "ledger",
        actionLabel: "Inspect Ledger",
      });
    }

    // ২. সর্বোচ্চ বিক্রীত পণ্যের স্টক রিস্টক অ্যালার্ট
    const productCounts = new Map<string, number>();
    records.forEach((r) => {
      productCounts.set(r.product, (productCounts.get(r.product) || 0) + 1);
    });

    let topProduct = "";
    let topCount = 0;
    productCounts.forEach((count, name) => {
      if (count > topCount) {
        topCount = count;
        topProduct = name;
      }
    });

    if (topProduct && topCount >= 2) {
      list.push({
        id: `stock-velocity-${topProduct}-${topCount}`,
        severity: "warning",
        title: `High Burn-Rate: ${topProduct}`,
        description: `${topCount} high-velocity orders detected. Verify safety stock levels to avoid stockout.`,
        targetTab: "inventory",
        actionLabel: "Check Inventory",
      });
    }

    // ৩. সামগ্রিক মুনাফা ও রেভিনিউ মাইলস্টোন
    if (totalRevenue >= 20000) {
      list.push({
        id: `milestone-rev-${Math.floor(totalRevenue / 5000)}`,
        severity: "info",
        title: `Revenue Milestone: $${totalRevenue.toLocaleString()}`,
        description: `Portfolio net margin stands at ${profitMargin.toFixed(1)}%. Ready for tax reserve allocation.`,
        targetTab: "expenses",
        actionLabel: "Open Tax Vault",
      });
    }

    // ৪. ডাটাবেস বা সিস্টেম স্ট্যাটাস
    list.push({
      id: `sys-sync-${dbConnected ? "pg" : "mem"}`,
      severity: "info",
      title: dbConnected
        ? "PostgreSQL Cloud Ledger Active"
        : "Local In-Memory Engine Ready",
      description: dbConnected
        ? "All invoices and webhook sales are persisting in real time."
        : "Running in ultra-fast session memory. Connect DATABASE_URL for cloud persistence.",
      targetTab: "webhooks",
      actionLabel: "API Pipeline",
    });

    return list;
  }, [records, totalRevenue, profitMargin, dbConnected]);

  const unreadCount = alerts.filter((a) => !readIds.includes(a.id)).length;

  const handleMarkAllRead = () => {
    setReadIds(alerts.map((a) => a.id));
  };

  const handleAlertClick = (alert: SmartAlert) => {
    if (!readIds.includes(alert.id)) {
      setReadIds((prev) => [...prev, alert.id]);
    }
    setIsOpen(false);
    onNavigate(alert.targetTab);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Executive Alerts"
        className="relative inline-flex items-center justify-center p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition active:scale-95 cursor-pointer"
      >
        <Bell className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-4.5 h-4.5 px-1 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/70">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                Executive Risk &amp; Alert Radar
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {unreadCount > 0
                  ? `${unreadCount} unread operational alert(s)`
                  : "All operational checks cleared"}
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {alerts.map((alert) => {
              const isUnread = !readIds.includes(alert.id);
              const Icon =
                alert.severity === "critical"
                  ? AlertTriangle
                  : alert.severity === "warning"
                  ? TrendingDown
                  : alert.targetTab === "inventory"
                  ? PackageCheck
                  : ShieldCheck;

              const badgeStyle =
                alert.severity === "critical"
                  ? "bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400"
                  : alert.severity === "warning"
                  ? "bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  : "bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-cyan-400";

              return (
                <button
                  key={alert.id}
                  type="button"
                  onClick={() => handleAlertClick(alert)}
                  className={`w-full text-left p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer ${
                    isUnread ? "bg-blue-50/30 dark:bg-blue-500/[0.04]" : ""
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${badgeStyle}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {alert.title}
                      </p>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {alert.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-cyan-400 mt-1.5">
                      {alert.actionLabel}
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}