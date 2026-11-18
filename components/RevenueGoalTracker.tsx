"use client";

import { useState, useSyncExternalStore } from "react";
import { Target, Edit3, Check, Flame } from "lucide-react";

interface RevenueGoalTrackerProps {
  currentRevenue: number;
  transactionCount: number;
}

function subscribeTarget(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("aurabi-target-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("aurabi-target-change", callback);
  };
}

function getTargetSnapshot(): number {
  const saved = localStorage.getItem("aurabi-revenue-target");
  const parsed = Number(saved);
  return saved && !isNaN(parsed) && parsed > 0 ? parsed : 30000;
}

function getServerTargetSnapshot(): number {
  return 30000;
}

export default function RevenueGoalTracker({
  currentRevenue,
  transactionCount,
}: RevenueGoalTrackerProps) {
  const target = useSyncExternalStore(
    subscribeTarget,
    getTargetSnapshot,
    getServerTargetSnapshot
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [draftTarget, setDraftTarget] = useState<string>("30000");

  const percentage =
    target > 0 ? Math.min(100, (currentRevenue / target) * 100) : 0;
  const remaining = Math.max(0, target - currentRevenue);
  const avgOrderValue =
    transactionCount > 0 ? currentRevenue / transactionCount : 0;
  const ordersNeeded =
    avgOrderValue > 0 ? Math.ceil(remaining / avgOrderValue) : 0;

  const handleSave = () => {
    const parsed = Number(draftTarget);
    if (!isNaN(parsed) && parsed > 0) {
      localStorage.setItem("aurabi-revenue-target", String(parsed));
      window.dispatchEvent(new Event("aurabi-target-change"));
    }
    setIsEditing(false);
  };

  return (
    <section className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Executive Revenue Target &amp; Pace
              </h2>
              {percentage >= 100 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                  <Flame className="w-3 h-3" /> Goal Achieved!
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {remaining > 0
                ? `$${remaining.toLocaleString()} remaining (~${ordersNeeded} orders at $${Math.round(avgOrderValue)} AOV)`
                : "Surpassed period target ahead of schedule"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="100"
                value={draftTarget}
                onChange={(e) => setDraftTarget(e.target.value)}
                className="w-28 text-xs font-mono border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleSave}
                className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                title="Save Target"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraftTarget(String(target));
                setIsEditing(true);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Target: ${target.toLocaleString()}
            </button>
          )}
        </div>
      </div>

      <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs font-mono mt-2.5 text-slate-500 dark:text-slate-400">
        <span>
          Achieved:{" "}
          <strong className="text-slate-900 dark:text-white">
            ${currentRevenue.toLocaleString()}
          </strong>
        </span>
        <span className="font-bold text-blue-600 dark:text-blue-400">
          {percentage.toFixed(1)}%
        </span>
      </div>
    </section>
  );
}