"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { SalesRecord } from "@/types/analytics";

interface CategoryChartProps {
  data: SalesRecord[];
}

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

export default function CategoryChart({ data }: CategoryChartProps) {
  const categoryData = useMemo(() => {
    const totals = new Map<string, number>();

    data.forEach((item) => {
      const current = totals.get(item.category) || 0;
      totals.set(item.category, current + item.revenue);
    });

    return Array.from(totals.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [data]);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        Revenue Share by Category
      </h2>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <PieChart>
            <Pie
              data={categoryData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={4}
            >
              {categoryData.map((entry, index) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
             formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, "Revenue"]}
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}