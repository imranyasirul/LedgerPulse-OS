export interface SalesRecord {
  id: string;
  date: string;
  product: string;
  category: string;
  store?: string;
  revenue: number;
  cost: number;
  profit: number;
}

export interface KpiSummary {
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  profitMargin: number;
  revenueGrowth: number;
  profitGrowth: number;
}

export interface RegressionPoint {
  date: string;
  actualRevenue: number | null;
  trendRevenue: number;
  forecastRevenue: number | null;
}

export interface ParetoItem {
  product: string;
  category: string;
  profit: number;
  profitShare: number;
  cumulativeShare: number;
  abcClass: "A" | "B" | "C";
}

export interface EnterpriseAnalytics {
  regressionPoints: RegressionPoint[];
  slopePerDay: number;
  rSquared: number;
  projectedSevenDayRevenue: number;
  paretoItems: ParetoItem[];
  classACount: number;
  classAProfitShare: number;
}

export type UserRole = "OWNER" | "ANALYST" | "VIEWER";

export interface UserSession {
  name: string;
  email: string;
  role: UserRole;
}