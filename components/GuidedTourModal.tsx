"use client";

import { useState, useEffect } from "react";
import {
  Compass,
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Bot,
  CheckCircle2,
} from "lucide-react";
import { ActiveTab } from "@/components/Sidebar";

interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenAiAnalyst: () => void;
}

interface TourStep {
  title: string;
  badge: string;
  description: string;
  highlightTip: string;
  targetTab: ActiveTab;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Executive KPI Engine & Live Telemetry",
    badge: "Step 1 of 6 • Overview",
    description:
      "Track real-time revenue, direct COGS, net profit, and automated credit-margin grading with smooth animated counters across all business units.",
    highlightTip:
      "Use the Date-Range presets (7D, 30D, Custom) or Store switcher to slice any metric instantly.",
    targetTab: "overview",
  },
  {
    title: "OLS Predictive Forecasting & What-If Simulator",
    badge: "Step 2 of 6 • Forecasting",
    description:
      "Simulate price changes, cost reductions, and marketing spend before making real decisions, backed by linear regression trajectory and Pareto 80/20 analysis.",
    highlightTip:
      "Adjust the pricing and volume sliders to stress-test profit margins in real time.",
    targetTab: "forecasting",
  },
  {
    title: "Smart Invoice Studio & Margin Guardrails",
    badge: "Step 3 of 6 • Invoices",
    description:
      "Generate clean client-ready receipts while keeping wholesale cost and internal profit margins hidden from the buyer, then sync directly to the ledger in 1 click.",
    highlightTip:
      "Every recorded invoice automatically updates inventory velocity and revenue goals.",
    targetTab: "invoices",
  },
  {
    title: "Benford's Law Forensic Audit & Immutable Trail",
    badge: "Step 4 of 6 • Audited Ledger",
    description:
      "Verify financial integrity with statistical Benford's Law anomaly detection alongside an append-only system audit trail recording every user action.",
    highlightTip:
      "Export either the full transaction ledger or the tamper-evident audit log to CSV anytime.",
    targetTab: "ledger",
  },
  {
    title: "Executive Risk Radar & Boardroom PDF Export",
    badge: "Step 5 of 6 • Governance",
    description:
      "The header Notification Bell flags low-margin SKUs and high burn-rate stock automatically, while Save PDF formats an executive report with sign-off blocks.",
    highlightTip:
      "Click the Bell icon in the top bar to jump straight to any flagged operational risk.",
    targetTab: "overview",
  },
  {
    title: "AI Financial Analyst & Command Palette (Ctrl + K)",
    badge: "Step 6 of 6 • AI Copilot",
    description:
      "Ask natural-language CFO questions to your live dataset or press Ctrl + K anywhere to navigate modules, toggle dark mode, and record sales without touching the mouse.",
    highlightTip:
      "Ready to explore? Launch the AI Analyst directly or start interacting with your workspace.",
    targetTab: "overview",
  },
];

export default function GuidedTourModal({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenAiAnalyst,
}: GuidedTourModalProps) {
  const [stepIndex, setStepIndex] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        setStepIndex((prev) => {
          const next = Math.min(prev + 1, TOUR_STEPS.length - 1);
          onNavigateTab(TOUR_STEPS[next].targetTab);
          return next;
        });
      } else if (e.key === "ArrowLeft") {
        setStepIndex((prev) => {
          const next = Math.max(prev - 1, 0);
          onNavigateTab(TOUR_STEPS[next].targetTab);
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onNavigateTab]);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === TOUR_STEPS.length - 1;
  const progressPercent = ((stepIndex + 1) / TOUR_STEPS.length) * 100;

  const goToStep = (nextIndex: number) => {
    setStepIndex(nextIndex);
    onNavigateTab(TOUR_STEPS[nextIndex].targetTab);
  };

  const handleClose = () => {
    setStepIndex(0);
    onClose();
  };

  return (
    <div className="fixed bottom-5 right-5 left-5 sm:left-auto sm:w-[440px] z-50 rounded-2xl bg-white dark:bg-slate-900 border-2 border-blue-500/50 dark:border-cyan-400/50 shadow-2xl overflow-hidden print:hidden">
      {/* প্রোগ্রেস বার */}
      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-cyan-300">
            <Compass className="w-3.5 h-3.5" />
            {currentStep.badge}
          </span>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close Guided Tour"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-3">
          {currentStep.title}
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
          {currentStep.description}
        </p>

        <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
            {currentStep.highlightTip}
          </p>
        </div>

        {/* স্টেপ ডট ইন্ডিকেটর */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {TOUR_STEPS.map((step, idx) => (
            <button
              key={step.title}
              type="button"
              aria-label={`Go to ${step.badge}`}
              onClick={() => goToStep(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === stepIndex
                  ? "w-6 bg-blue-600 dark:bg-cyan-400"
                  : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>

        {/* নেভিগেশন বাটনসমূহ */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => goToStep(stepIndex - 1)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>

          <div className="flex items-center gap-2">
            {isLast && (
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onOpenAiAnalyst();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5" />
                Try AI Analyst
              </button>
            )}

            {!isLast ? (
              <button
                type="button"
                onClick={() => goToStep(stepIndex + 1)}
                className="inline-flex items-center gap-1 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition cursor-pointer"
              >
                Next
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Finish Tour
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}