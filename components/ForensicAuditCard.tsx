"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ShieldCheck, AlertTriangle, Scale } from "lucide-react";
import { SalesRecord } from "@/types/analytics";

interface ForensicAuditCardProps {
  records: SalesRecord[];
}

const BENFORD_EXPECTED: Record<number, number> = {
  1: 30.1,
  2: 17.6,
  3: 12.5,
  4: 9.7,
  5: 7.9,
  6: 6.7,
  7: 5.8,
  8: 5.1,
  9: 4.6,
};

function extractLeadingDigit(value: number): number | null {
  const absStr = Math.abs(value).toString().replace(/[^1-9]/g, "");
  if (!absStr) return null;
  const digit = Number(absStr[0]);
  return digit >= 1 && digit <= 9 ? digit : null;
}

export default function ForensicAuditCard({ records }: ForensicAuditCardProps) {
  const auditResult = useMemo(() => {
    const counts: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
    };

    let validSamples = 0;
    records.forEach((r) => {
      const d = extractLeadingDigit(r.revenue);
      if (d !== null) {
        counts[d] += 1;
        validSamples += 1;
      }
    });

    let totalAbsDeviation = 0;
    const chartData = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => {
      const actualPct =
        validSamples > 0 ? (counts[digit] / validSamples) * 100 : 0;
      const expectedPct = BENFORD_EXPECTED[digit];
      totalAbsDeviation += Math.abs(actualPct - expectedPct);

      return {
        digit: `Digit ${digit}`,
        actual: Number(actualPct.toFixed(1)),
        benford: expectedPct,
      };
    });

    const mad = totalAbsDeviation / 9;
    const integrityScore = Math.max(0, Math.min(100, Math.round(100 - mad * 3.5)));
    const isHealthy = validSamples < 10 || mad <= 8.5;

    return {
      chartData,
      validSamples,
      mad,
      integrityScore,
      isHealthy,
    };
  }, [records]);

  return (
    <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-500/25">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Forensic Accounting Audit (Benford&rsquo;s Law Analysis)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Compares leading-digit frequency of {auditResult.validSamples} revenue entries against Benford&rsquo;s natural logarithmic curve to detect ledger anomalies
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              Integrity Score
            </span>
            <span className="text-lg font-extrabold font-mono text-slate-900 dark:text-white">
              {auditResult.integrityScore}/100
            </span>
          </div>

          {auditResult.isHealthy ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
              Natural Distribution
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
              <AlertTriangle className="w-4 h-4" />
              Variance Flagged
            </span>
          )}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={auditResult.chartData}
            margin={{ top: 10, right: 16, left: -12, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.45} />
            <XAxis dataKey="digit" tick={{ fontSize: 11 }} />
            <YAxis unit="%" tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar
              dataKey="actual"
              name="Actual Ledger %"
              fill="#6366f1"
              radius={[6, 6, 0, 0]}
              barSize={26}
            />
            <Line
              type="monotone"
              dataKey="benford"
              name="Benford Expected %"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#10b981" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}