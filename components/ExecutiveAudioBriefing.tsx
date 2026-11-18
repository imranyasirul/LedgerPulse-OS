"use client";

import { useState, useMemo, useEffect } from "react";
import { Volume2, Square, Pause, Play, Radio } from "lucide-react";
import { KpiSummary, EnterpriseAnalytics } from "@/types/analytics";

interface ExecutiveAudioBriefingProps {
  summary: KpiSummary;
  analytics: EnterpriseAnalytics;
  selectedStore: string;
  recordCount: number;
}

export default function ExecutiveAudioBriefing({
  summary,
  analytics,
  selectedStore,
  recordCount,
}: ExecutiveAudioBriefingProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const briefingScript = useMemo(() => {
    const scopeName =
      selectedStore === "All" ? "all business units" : selectedStore;
    const topProduct = analytics.paretoItems[0]?.product || "our core catalog";
    const growthPhrase =
      summary.revenueGrowth >= 0
        ? `up ${summary.revenueGrowth.toFixed(1)} percent`
        : `down ${Math.abs(summary.revenueGrowth).toFixed(1)} percent`;

    return `Executive Briefing for ${scopeName}. Across ${recordCount} audited transactions, total revenue stands at ${summary.totalRevenue.toLocaleString()} dollars, trending ${growthPhrase} compared to the prior period. Net profit is ${summary.netProfit.toLocaleString()} dollars with a ${summary.profitMargin.toFixed(1)} percent net margin. Under Pareto eighty-twenty analysis, ${topProduct} leads profit concentration, while our linear regression model projects ${analytics.projectedSevenDayRevenue.toLocaleString()} dollars in revenue over the next seven days.`;
  }, [summary, analytics, selectedStore, recordCount]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlayOrResume = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(briefingScript);
    utterance.rate = 0.98;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    setIsSpeaking(true);
    setIsPaused(false);
    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsSpeaking(false);
    }
  };

  const handleStop = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-[0_1px_3px_rgba(15,23,42,0.03)] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 print:hidden">
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/25 shrink-0">
          <Radio className={`w-5 h-5 ${isSpeaking ? "animate-pulse" : ""}`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Boardroom Voice Audio Digest
            </h2>
            {isSpeaking && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                <span className="w-1.5 h-3 bg-emerald-500 rounded-full animate-bounce" />
                <span className="w-1.5 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="w-1.5 h-3.5 bg-emerald-500 rounded-full animate-bounce" />
                Live Narration
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
            {briefingScript}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!isSpeaking ? (
          <button
            type="button"
            onClick={handlePlayOrResume}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition cursor-pointer"
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5" />
                Resume Briefing
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                Listen to Briefing
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePause}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-500/20 rounded-xl transition cursor-pointer"
          >
            <Pause className="w-3.5 h-3.5" />
            Pause
          </button>
        )}

        {(isSpeaking || isPaused) && (
          <button
            type="button"
            onClick={handleStop}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
          >
            <Square className="w-3.5 h-3.5" />
            Stop
          </button>
        )}
      </div>
    </section>
  );
}