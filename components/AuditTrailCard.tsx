"use client";

import { useState } from "react";
import {
  ShieldCheck,
  History,
  Download,
  Lock,
  FileText,
  Database,
  UserCheck,
} from "lucide-react";
import { UserRole } from "@/types/analytics";

export type AuditCategory = "TRANSACTION" | "REPORT" | "DATA" | "SECURITY";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  category: AuditCategory;
  action: string;
  detail: string;
  hash: string;
}

interface AuditTrailCardProps {
  logs: AuditLogEntry[];
}

export default function AuditTrailCard({ logs }: AuditTrailCardProps) {
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | AuditCategory>("ALL");

  const filteredLogs =
    selectedFilter === "ALL"
      ? logs
      : logs.filter((entry) => entry.category === selectedFilter);

  const handleExportAuditLog = () => {
    const headers = ["timestamp,actor,role,category,action,detail,verification_hash"];
    const rows = logs.map(
      (l) =>
        `"${l.timestamp}","${l.actor}","${l.role}","${l.category}","${l.action}","${l.detail.replace(/"/g, '""')}","${l.hash}"`
    );
    const csvContent = [...headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "ledgerplus-immutable-audit-trail.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-cyan-400 shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Immutable System Activity &amp; Audit Trail
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                <Lock className="w-2.5 h-2.5" />
                Append-Only Log
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tamper-evident governance log recording every ledger mutation, export, and clearance event
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportAuditLog}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
          Export Audit CSV
        </button>
      </div>

      {/* ক্যাটাগরি ফিল্টার বার */}
      <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: "ALL", label: "All Events" },
              { id: "TRANSACTION", label: "Transactions" },
              { id: "DATA", label: "Data Sync" },
              { id: "REPORT", label: "Exports & PDF" },
              { id: "SECURITY", label: "Security & Tour" },
            ] as { id: "ALL" | AuditCategory; label: string }[]
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedFilter(item.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                selectedFilter === item.id
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
          {filteredLogs.length} verified event(s)
        </span>
      </div>

      {/* অডিট লগ তালিকা */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
        {filteredLogs.map((entry) => {
          const Icon =
            entry.category === "TRANSACTION"
              ? Database
              : entry.category === "REPORT"
              ? FileText
              : entry.category === "SECURITY"
              ? UserCheck
              : ShieldCheck;

          const badgeColor =
            entry.category === "TRANSACTION"
              ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
              : entry.category === "REPORT"
              ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300"
              : entry.category === "SECURITY"
              ? "bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300"
              : "bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-cyan-300";

          return (
            <div
              key={entry.id}
              className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${badgeColor}`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {entry.action}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {entry.actor} • {entry.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {entry.detail}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0 text-[11px] font-mono">
                <span className="text-slate-500 dark:text-slate-400">
                  {entry.timestamp}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px]">
                  #{entry.hash}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}