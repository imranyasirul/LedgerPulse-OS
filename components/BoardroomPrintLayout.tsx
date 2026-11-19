"use client";

import { useSyncExternalStore } from "react";
import { UserSession } from "@/types/analytics";

interface BoardroomPrintHeaderProps {
  reportTitle: string;
  selectedStore: string;
  selectedCategory: string;
  datePreset: string;
  recordCount: number;
  healthGrade: string;
  currentUser: UserSession;
}

const emptySubscribe = () => () => {};

function getFormattedToday(): string {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getEmptyServerDate(): string {
  return "";
}

export function BoardroomPrintHeader({
  reportTitle,
  selectedStore,
  selectedCategory,
  datePreset,
  recordCount,
  healthGrade,
  currentUser,
}: BoardroomPrintHeaderProps) {
  const generatedDate = useSyncExternalStore(
    emptySubscribe,
    getFormattedToday,
    getEmptyServerDate
  );

  return (
    <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-slate-900 text-white rounded">
              LedgerPlus OS
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Confidential Executive Financial Brief
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1.5">
            {reportTitle}
          </h1>
        </div>

        <div className="text-right text-xs text-slate-700 space-y-0.5">
          <p className="font-bold text-slate-900">
            Credit &amp; Margin Rating: {healthGrade}
          </p>
          {generatedDate && <p>Issued On: {generatedDate}</p>}
          <p>
            Prepared By: {currentUser.name} ({currentUser.role})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-300 text-[11px]">
        <div>
          <span className="text-slate-500 uppercase block">Business Unit</span>
          <strong className="text-slate-900">
            {selectedStore === "All" ? "Consolidated (All Units)" : selectedStore}
          </strong>
        </div>
        <div>
          <span className="text-slate-500 uppercase block">Category Scope</span>
          <strong className="text-slate-900">{selectedCategory}</strong>
        </div>
        <div>
          <span className="text-slate-500 uppercase block">Reporting Window</span>
          <strong className="text-slate-900">
            {datePreset === "ALL"
              ? "Full Ledger History"
              : datePreset === "7D"
              ? "Last 7 Days"
              : datePreset === "30D"
              ? "Last 30 Days"
              : "Custom Date Range"}
          </strong>
        </div>
        <div>
          <span className="text-slate-500 uppercase block">Audited Records</span>
          <strong className="text-slate-900">{recordCount} Transactions</strong>
        </div>
      </div>
    </div>
  );
}

export function BoardroomPrintFooter({
  currentUser,
}: {
  currentUser: UserSession;
}) {
  return (
    <div className="hidden print:block mt-10 pt-6 border-t-2 border-slate-300">
      <div className="grid grid-cols-3 gap-8 text-xs text-slate-700 pt-6">
        <div>
          <div className="border-t border-slate-800 pt-1.5 font-bold text-slate-900">
            {currentUser.name}
          </div>
          <p className="text-[10px] text-slate-500">
            Prepared &amp; Certified ({currentUser.role})
          </p>
        </div>

        <div>
          <div className="border-t border-slate-800 pt-1.5 font-bold text-slate-900">
            Internal Audit &amp; Compliance
          </div>
          <p className="text-[10px] text-slate-500">
            Benford Forensic Integrity Verified
          </p>
        </div>

        <div>
          <div className="border-t border-slate-800 pt-1.5 font-bold text-slate-900">
            Managing Director Approval
          </div>
          <p className="text-[10px] text-slate-500">
            Authorized Boardroom Sign-Off
          </p>
        </div>
      </div>

      <p className="text-[10px] text-slate-400 text-center mt-6">
        Generated electronically by LedgerPlus OS Enterprise BI &amp; ERP Suite • Strictly Confidential
      </p>
    </div>
  );
}