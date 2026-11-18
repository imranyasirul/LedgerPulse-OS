"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { TrendingUp, PieChart as PieIcon } from "lucide-react";
import { EnterpriseAnalytics } from "@/types/analytics";

interface ForecastAndParetoProps {
  analytics: EnterpriseAnalytics;
}

export default function ForecastAndPareto({ analytics }: ForecastAndParetoProps) {
  const {
    regressionPoints,
    slopePerDay,
    rSquared,
    projectedSevenDayRevenue,
    paretoItems,
    classACount,
    classAProfitShare,
  } = analytics;

  return (
    <div className="space-y-6">
      {/* লিনিয়ার রিগ্রেশন পূর্বাভাস সেকশন */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-800">
                OLS Linear Regression & 7-Day Revenue Forecast
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Mathematical trendline computed from historical daily sales velocity
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 block">
                7-Day Projected Revenue
              </span>
              <span className="text-sm font-bold text-blue-600">
                ${projectedSevenDayRevenue.toLocaleString()}
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 block">
                Daily Trend Slope
              </span>
              <span
                className={`text-sm font-bold ${
                  slopePerDay >= 0 ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {slopePerDay >= 0 ? "+" : ""}${slopePerDay.toFixed(1)} / day
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 block">
                Model Fit (R²)
              </span>
              <span className="text-sm font-bold text-slate-800">
                {(rSquared * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <ComposedChart data={regressionPoints}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, ""]}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Legend />
              <Bar
                dataKey="actualRevenue"
                name="Actual Daily Revenue ($)"
                fill="#93c5fd"
                radius={[4, 4, 0, 0]}
              />
              <Line
                type="monotone"
                dataKey="trendRevenue"
                name="Regression Trendline ($)"
                stroke="#1d4ed8"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="forecastRevenue"
                name="7-Day Forecast ($)"
                stroke="#10b981"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* প্যারেটো ৮০/২০ (ABC) বিশ্লেষণ সেকশন */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-slate-800">
                Pareto 80/20 (ABC) Profit Concentration Analysis
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Identifies the vital few products driving 80% of total net profit
            </p>
          </div>

          <div className="px-4 py-2 rounded-lg bg-purple-50 border border-purple-200 text-xs text-purple-900">
            <strong>{classACount} Class-A products</strong> generate{" "}
            <strong>{classAProfitShare.toFixed(1)}%</strong> of total net profit
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <ComposedChart data={paretoItems}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="product" stroke="#64748b" fontSize={11} />
                <YAxis yAxisId="left" stroke="#64748b" fontSize={12} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  stroke="#8b5cf6"
                  fontSize={12}
                />
                <Tooltip
                  formatter={(value, name) => {
                    const num = Number(value ?? 0);
                    if (String(name).includes("%")) {
                      return [`${num.toFixed(1)}%`, name];
                    }
                    return [`$${num.toLocaleString()}`, name];
                  }}
                />
                <Legend />
                <ReferenceLine
                  yAxisId="right"
                  y={80}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{ value: "80% Pareto Threshold", fill: "#ef4444", fontSize: 11 }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="profit"
                  name="Net Profit ($)"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cumulativeShare"
                  name="Cumulative Profit (%)"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-1 overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3 text-right">Share</th>
                  <th className="py-2.5 px-3 text-center">Class</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paretoItems.map((item) => {
                  const badge =
                    item.abcClass === "A"
                      ? "bg-emerald-100 text-emerald-800"
                      : item.abcClass === "B"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-slate-100 text-slate-700";

                  return (
                    <tr key={item.product}>
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {item.product}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600">
                        {item.profitShare.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold ${badge}`}
                        >
                          {item.abcClass}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}