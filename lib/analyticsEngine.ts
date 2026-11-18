import {
  SalesRecord,
  KpiSummary,
  EnterpriseAnalytics,
  RegressionPoint,
  ParetoItem,
} from "@/types/analytics";

export function calculateKpiWithGrowth(records: SalesRecord[]): KpiSummary {
  const totalRevenue = records.reduce((acc, item) => acc + item.revenue, 0);
  const totalCost = records.reduce((acc, item) => acc + item.cost, 0);
  const netProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const mid = Math.floor(sorted.length / 2);

  if (mid === 0) {
    return {
      totalRevenue,
      totalCost,
      netProfit,
      profitMargin,
      revenueGrowth: 0,
      profitGrowth: 0,
    };
  }

  const firstHalf = sorted.slice(0, mid);
  const secondHalf = sorted.slice(mid);

  const firstRev = firstHalf.reduce((s, r) => s + r.revenue, 0);
  const secondRev = secondHalf.reduce((s, r) => s + r.revenue, 0);
  const revenueGrowth =
    firstRev > 0 ? ((secondRev - firstRev) / firstRev) * 100 : 0;

  const firstProf = firstHalf.reduce((s, r) => s + r.profit, 0);
  const secondProf = secondHalf.reduce((s, r) => s + r.profit, 0);
  const profitGrowth =
    firstProf > 0 ? ((secondProf - firstProf) / firstProf) * 100 : 0;

  return {
    totalRevenue,
    totalCost,
    netProfit,
    profitMargin,
    revenueGrowth,
    profitGrowth,
  };
}

export function runEnterpriseAnalytics(
  records: SalesRecord[]
): EnterpriseAnalytics {
  // ১. তারিখ অনুযায়ী দৈনিক আয় একত্রিত করা
  const dailyMap = new Map<string, number>();
  records.forEach((r) => {
    dailyMap.set(r.date, (dailyMap.get(r.date) || 0) + r.revenue);
  });

  const sortedDates = Array.from(dailyMap.keys()).sort((a, b) =>
    a.localeCompare(b)
  );
  const n = sortedDates.length;

  // ২. লিনিয়ার রিগ্রেশন (y = mx + b) হিসাব
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  sortedDates.forEach((date, idx) => {
    const y = dailyMap.get(date) || 0;
    sumX += idx;
    sumY += y;
    sumXY += idx * y;
    sumXX += idx * idx;
  });

  const denominator = n * sumXX - sumX * sumX;
  const slope =
    n > 1 && denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
  const intercept = n > 0 ? (sumY - slope * sumX) / n : 0;

  // মডেল নির্ভুলতা (R-Squared) নির্ণয়
  const meanY = n > 0 ? sumY / n : 0;
  let ssTot = 0;
  let ssRes = 0;

  sortedDates.forEach((date, idx) => {
    const actual = dailyMap.get(date) || 0;
    const predicted = slope * idx + intercept;
    ssTot += Math.pow(actual - meanY, 2);
    ssRes += Math.pow(actual - predicted, 2);
  });

  const rSquared =
    n > 2 && ssTot > 0 ? Math.max(0, Math.min(1, 1 - ssRes / ssTot)) : 0;

  const regressionPoints: RegressionPoint[] = sortedDates.map((date, idx) => {
    const actual = dailyMap.get(date) || 0;
    const trend = Math.max(0, Math.round(slope * idx + intercept));
    return {
      date: date.slice(5), // MM-DD ফরম্যাট
      actualRevenue: actual,
      trendRevenue: trend,
      forecastRevenue: idx === n - 1 ? trend : null,
    };
  });

  // আগামী ৭ দিনের গাণিতিক পূর্বাভাস তৈরি
  let projectedSevenDayRevenue = 0;
  const lastDateStr =
    sortedDates[sortedDates.length - 1] || new Date().toISOString().split("T")[0];
  const baseDate = new Date(lastDateStr);

  for (let i = 1; i <= 7; i++) {
    const futureIdx = n - 1 + i;
    const forecastVal = Math.max(0, Math.round(slope * futureIdx + intercept));
    projectedSevenDayRevenue += forecastVal;

    const nextDate = new Date(baseDate);
    nextDate.setDate(baseDate.getDate() + i);
    const label = nextDate.toISOString().slice(5, 10);

    regressionPoints.push({
      date: `${label} (Est)`,
      actualRevenue: null,
      trendRevenue: forecastVal,
      forecastRevenue: forecastVal,
    });
  }

  // ৩. প্যারেটো ৮০/২০ (ABC) মুনাফা বিশ্লেষণ
  const productMap = new Map<string, { category: string; profit: number }>();
  records.forEach((r) => {
    const existing = productMap.get(r.product);
    if (existing) {
      existing.profit += r.profit;
    } else {
      productMap.set(r.product, { category: r.category, profit: r.profit });
    }
  });

  const sortedProducts = Array.from(productMap.entries())
    .map(([product, info]) => ({
      product,
      category: info.category,
      profit: Math.max(0, info.profit),
    }))
    .sort((a, b) => b.profit - a.profit);

  const totalPositiveProfit = sortedProducts.reduce(
    (sum, p) => sum + p.profit,
    0
  );

  let cumulative = 0;
  const paretoItems: ParetoItem[] = sortedProducts.map((item) => {
    const share =
      totalPositiveProfit > 0 ? (item.profit / totalPositiveProfit) * 100 : 0;
    cumulative += share;

    let abcClass: "A" | "B" | "C" = "C";
    if (cumulative <= 80 || cumulative - share < 75) {
      abcClass = "A";
    } else if (cumulative <= 95) {
      abcClass = "B";
    }

    return {
      product: item.product,
      category: item.category,
      profit: item.profit,
      profitShare: share,
      cumulativeShare: Math.min(100, cumulative),
      abcClass,
    };
  });

  const classAItems = paretoItems.filter((i) => i.abcClass === "A");
  const classAProfitShare = classAItems.reduce(
    (sum, i) => sum + i.profitShare,
    0
  );

  return {
    regressionPoints,
    slopePerDay: slope,
    rSquared,
    projectedSevenDayRevenue,
    paretoItems,
    classACount: classAItems.length,
    classAProfitShare,
  };
}