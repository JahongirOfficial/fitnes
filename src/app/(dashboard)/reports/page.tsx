"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  UserCheck,
  Package,
  BarChart3,
  Trophy,
  CreditCard,
  Banknote,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useReports } from "@/lib/hooks";
import { DashStatCardSkeleton, ChartSkeleton } from "@/components/ui/Skeleton";

// -- Recharts dynamic imports (SSR off) --
const AreaChart = dynamic(() => import("recharts").then((m) => m.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then((m) => m.Area), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const RTooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });
const RevenuePieChart = dynamic(() => import("@/components/reports/RevenuePieChart"), { ssr: false });

// -- Types --
type Period = "daily" | "weekly" | "monthly" | "yearly";
type SectionTab = "umumiy" | "moliya" | "azolar" | "tashriflar" | "mahsulotlar";

// -- Constants --
const periods: { key: Period; label: string }[] = [
  { key: "daily", label: "Kunlik" },
  { key: "weekly", label: "Haftalik" },
  { key: "monthly", label: "Oylik" },
  { key: "yearly", label: "Yillik" },
];

const sectionTabs: { key: SectionTab; label: string; Icon: typeof BarChart3 }[] = [
  { key: "umumiy", label: "Umumiy", Icon: BarChart3 },
  { key: "moliya", label: "Moliya", Icon: Wallet },
  { key: "azolar", label: "A'zolar", Icon: Users },
  { key: "tashriflar", label: "Tashriflar", Icon: UserCheck },
  { key: "mahsulotlar", label: "Mahsulotlar", Icon: Package },
];

const defaultPieData = [
  { name: "Abonementlar", value: 0, fill: "#3b82f6" },
  { name: "Mahsulotlar", value: 0, fill: "#10b981" },
  { name: "Boshqa", value: 0, fill: "#f59e0b" },
];

const rankColors = [
  "bg-yellow-400 text-white",
  "bg-gray-400 text-white",
  "bg-amber-600 text-white",
  "bg-blue-400 text-white",
  "bg-indigo-400 text-white",
];

const rankGradients = [
  "linear-gradient(90deg, #f59e0b, #eab308)",
  "linear-gradient(90deg, #9ca3af, #6b7280)",
  "linear-gradient(90deg, #d97706, #b45309)",
  "linear-gradient(90deg, #3b82f6, #2563eb)",
  "linear-gradient(90deg, #6366f1, #4f46e5)",
  "linear-gradient(90deg, #8b5cf6, #7c3aed)",
  "linear-gradient(90deg, #06b6d4, #0891b2)",
  "linear-gradient(90deg, #14b8a6, #0d9488)",
  "linear-gradient(90deg, #f43f5e, #e11d48)",
  "linear-gradient(90deg, #ec4899, #db2777)",
];

const paymentMethodLabels: Record<string, string> = {
  cash: "Naqd",
  card: "Karta",
  transfer: "O'tkazma",
  balance: "Balans",
};

const paymentMethodIcons: Record<string, typeof Banknote> = {
  cash: Banknote,
  card: CreditCard,
  transfer: Wallet,
  balance: Users,
};

const paymentMethodColors: Record<string, { bg: string; text: string; bar: string }> = {
  cash: { bg: "bg-emerald-100", text: "text-emerald-600", bar: "#10b981" },
  card: { bg: "bg-blue-100", text: "text-blue-600", bar: "#3b82f6" },
  transfer: { bg: "bg-purple-100", text: "text-purple-600", bar: "#8b5cf6" },
  balance: { bg: "bg-amber-100", text: "text-amber-600", bar: "#f59e0b" },
};

// -- Custom Tooltips --

function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 min-w-[200px]">
      <p className="text-sm font-semibold text-gray-800 mb-2">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600">
              {entry.dataKey === "income" ? "Daromad" : entry.dataKey === "expense" ? "Xarajat" : entry.name}
            </span>
          </div>
          <span className="font-medium text-gray-900">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

function CountTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 min-w-[160px]">
      <p className="text-sm font-semibold text-gray-800 mb-2">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600">{entry.name || entry.dataKey}</span>
          </div>
          <span className="font-medium text-gray-900">{entry.value} ta</span>
        </div>
      ))}
    </div>
  );
}

function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 min-w-[180px]">
      <p className="text-sm font-semibold text-gray-800 mb-2">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-gray-600">{entry.name || entry.dataKey}</span>
          </div>
          <span className="font-medium text-gray-900">
            {typeof entry.value === "number" && entry.value >= 1000 ? formatCurrency(entry.value) : `${entry.value} ta`}
          </span>
        </div>
      ))}
    </div>
  );
}

function VisitBarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 min-w-[160px]">
      <p className="text-sm font-semibold text-gray-800 mb-2">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-gray-600">Tashriflar</span>
          </div>
          <span className="font-medium text-gray-900">{entry.value} ta</span>
        </div>
      ))}
    </div>
  );
}

// -- Helper: format large numbers for Y-axis --
function formatAxisValue(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return `${v}`;
}

// -- Empty state component --
function EmptyState({ message }: { message: string }) {
  return <p className="text-center text-gray-400 py-8 text-sm">{message}</p>;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ReportsPage() {
  const [activePeriod, setActivePeriod] = useState<Period>("monthly");
  const [activeSection, setActiveSection] = useState<SectionTab>("umumiy");
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: reportData, isLoading } = useReports({ period: activePeriod, startDate, endDate });

  // -- Extract data with fallbacks --
  const summary = reportData?.summary || {
    totalIncome: 0, totalExpense: 0, netProfit: 0,
    newMembers: 0, totalVisits: 0, totalTransactions: 0,
  };
  const monthlyTrend = reportData?.monthlyTrend || [];
  const revenueByCategory = reportData?.revenueByCategory?.length ? reportData.revenueByCategory : defaultPieData;
  const paymentMethods = reportData?.paymentMethods || [];
  const incomeByCategory = reportData?.incomeByCategory || [];
  const dailyIncome = reportData?.dailyIncome || [];
  const avgTransaction = reportData?.avgTransaction || 0;
  const membersByStatus = reportData?.membersByStatus || { active: 0, expired: 0, inactive: 0 };
  const membersBySubscription = reportData?.membersBySubscription || { daily: 0, monthly: 0, yearly: 0 };
  const newMembersTrend = reportData?.newMembersTrend || [];
  const balanceStats = reportData?.balanceStats || { totalBalance: 0, avgBalance: 0, membersWithBalance: 0 };
  const topBalanceMembers = reportData?.topBalanceMembers || [];
  const visitStats = reportData?.visitStats || { totalVisits: 0, avgPerDay: 0, avgDuration: 0 };
  const topVisitors = reportData?.topVisitors || [];
  const visitsByWeekday = reportData?.visitsByWeekday || [];
  const visitsTrend = reportData?.visitsTrend || [];
  const topProducts = reportData?.topProducts || [];
  const productsByCategory = reportData?.productsByCategory || [];
  const lowStockProducts = reportData?.lowStockProducts || [];

  // -- Derived values --
  const totalMembers = membersByStatus.active + membersByStatus.expired + membersByStatus.inactive;
  const totalSubscriptions = membersBySubscription.daily + membersBySubscription.monthly + membersBySubscription.yearly;
  const totalPaymentMethodAmount = paymentMethods.reduce((s: number, p: any) => s + (p.total || 0), 0);

  // Subscription pie data
  const subscriptionPieData = [
    { name: "Kunlik", value: membersBySubscription.daily, fill: "#f59e0b" },
    { name: "Oylik", value: membersBySubscription.monthly, fill: "#3b82f6" },
    { name: "Yillik", value: membersBySubscription.yearly, fill: "#10b981" },
  ];

  // Product categories pie data
  const productCategoryPieData = productsByCategory.map((c: any, i: number) => ({
    name: c.category,
    value: c.revenue || c.sold || 0,
    fill: ["#f97316", "#3b82f6", "#8b5cf6", "#10b981", "#ef4444", "#f59e0b"][i % 6],
  }));

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Hisobotlar</h1>
          <p className="text-sm text-gray-500 mt-1">Moliyaviy va statistik hisobotlar</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap bg-white rounded-xl px-3 py-2 shadow-sm border border-gray-200 w-full sm:w-auto">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm text-gray-700 bg-transparent outline-none w-full sm:w-[130px]"
            />
            <span className="text-gray-300">&mdash;</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-sm text-gray-700 bg-transparent outline-none w-full sm:w-[130px]"
            />
          </div>
        </div>
      </div>

      {/* ── Period Tabs ── */}
      <div className="flex items-center gap-2 overflow-x-auto flex-nowrap pb-1 animate-fade-in">
        {periods.map((period) => (
          <button
            key={period.key}
            onClick={() => setActivePeriod(period.key)}
            className={cn(
              "px-5 py-2 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap",
              activePeriod === period.key
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            )}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* ── Section Tabs ── */}
      <div className="flex items-center gap-2 overflow-x-auto flex-nowrap pb-1 animate-fade-in" style={{ animationDelay: "80ms" }}>
        {sectionTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSection(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap",
              activeSection === tab.key
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            )}
          >
            <tab.Icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {activeSection === "umumiy" && (
        <UmumiyTab
          isLoading={isLoading}
          summary={summary}
          monthlyTrend={monthlyTrend}
          revenueByCategory={revenueByCategory}
        />
      )}

      {activeSection === "moliya" && (
        <MoliyaTab
          isLoading={isLoading}
          avgTransaction={avgTransaction}
          paymentMethods={paymentMethods}
          totalPaymentMethodAmount={totalPaymentMethodAmount}
          incomeByCategory={incomeByCategory}
          dailyIncome={dailyIncome}
        />
      )}

      {activeSection === "azolar" && (
        <AzolarTab
          isLoading={isLoading}
          membersByStatus={membersByStatus}
          totalMembers={totalMembers}
          subscriptionPieData={subscriptionPieData}
          totalSubscriptions={totalSubscriptions}
          newMembersTrend={newMembersTrend}
          balanceStats={balanceStats}
          topBalanceMembers={topBalanceMembers}
        />
      )}

      {activeSection === "tashriflar" && (
        <TashriflarTab
          isLoading={isLoading}
          visitStats={visitStats}
          visitsByWeekday={visitsByWeekday}
          visitsTrend={visitsTrend}
          topVisitors={topVisitors}
        />
      )}

      {activeSection === "mahsulotlar" && (
        <MahsulotlarTab
          isLoading={isLoading}
          topProducts={topProducts}
          productCategoryPieData={productCategoryPieData}
          lowStockProducts={lowStockProducts}
        />
      )}
    </div>
  );
}

// ============================================================================
// TAB 1: UMUMIY
// ============================================================================

function UmumiyTab({
  isLoading,
  summary,
  monthlyTrend,
  revenueByCategory,
}: {
  isLoading: boolean;
  summary: any;
  monthlyTrend: any[];
  revenueByCategory: any[];
}) {
  const kpiCards = [
    { title: "Jami Daromad", value: summary.totalIncome, Icon: TrendingUp, iconBg: "bg-emerald-100", iconColor: "text-emerald-600", isCurrency: true },
    { title: "Jami Xarajat", value: summary.totalExpense, Icon: TrendingDown, iconBg: "bg-red-100", iconColor: "text-red-600", isCurrency: true },
    { title: "Sof Foyda", value: summary.netProfit, Icon: Wallet, iconBg: "bg-blue-100", iconColor: "text-blue-600", isCurrency: true },
    { title: "Yangi A'zolar", value: summary.newMembers, Icon: Users, iconBg: "bg-purple-100", iconColor: "text-purple-600", isCurrency: false, suffix: " ta" },
    { title: "Jami Tashriflar", value: summary.totalVisits, Icon: UserCheck, iconBg: "bg-cyan-100", iconColor: "text-cyan-600", isCurrency: false, suffix: " ta" },
    { title: "Tranzaksiyalar", value: summary.totalTransactions, Icon: CreditCard, iconBg: "bg-amber-100", iconColor: "text-amber-600", isCurrency: false, suffix: " ta" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards - 2x3 grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <DashStatCardSkeleton key={i} />)
          : kpiCards.map((card, index) => (
              <div
                key={card.title}
                className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm card-hover animate-fade-in"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", card.iconBg)}>
                    <card.Icon className={cn("w-5 h-5", card.iconColor)} />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {card.isCurrency ? formatCurrency(card.value) : `${card.value}${card.suffix || ""}`}
                </p>
                <p className="text-sm text-gray-500 mt-1">{card.title}</p>
              </div>
            ))}
      </div>

      {/* Charts Row */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend AreaChart */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm animate-fade-in" style={{ animationDelay: "500ms" }}>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Daromad va Xarajatlar</h2>
                <p className="text-xs text-gray-500 mt-0.5">Oylik tendensiya</p>
              </div>
            </div>
            {monthlyTrend.length === 0 ? (
              <EmptyState message="Ma'lumot mavjud emas" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyTrend} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradientIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gradientExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={formatAxisValue} />
                  <RTooltip content={<TrendTooltip />} />
                  <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} fill="url(#gradientIncome)" dot={{ r: 3, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }} name="Daromad" />
                  <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2.5} fill="url(#gradientExpense)" dot={{ r: 3, fill: "#ef4444", strokeWidth: 2, stroke: "#fff" }} name="Xarajat" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Revenue Pie Chart */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm animate-fade-in" style={{ animationDelay: "580ms" }}>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Daromad Taqsimoti</h2>
                <p className="text-xs text-gray-500 mt-0.5">Kategoriyalar bo&apos;yicha</p>
              </div>
            </div>
            <RevenuePieChart data={revenueByCategory} />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TAB 2: MOLIYA
// ============================================================================

function MoliyaTab({
  isLoading,
  avgTransaction,
  paymentMethods,
  totalPaymentMethodAmount,
  incomeByCategory,
  dailyIncome,
}: {
  isLoading: boolean;
  avgTransaction: number;
  paymentMethods: any[];
  totalPaymentMethodAmount: number;
  incomeByCategory: any[];
  dailyIncome: any[];
}) {
  // Payment method bar chart data
  const paymentBarData = paymentMethods.map((pm: any) => ({
    name: paymentMethodLabels[pm.method] || pm.method,
    total: pm.total || 0,
    count: pm.count || 0,
    fill: paymentMethodColors[pm.method]?.bar || "#6b7280",
  }));

  // Income by category bar data
  const incomeCategoryBarData = incomeByCategory.map((ic: any) => ({
    name: ic.category,
    total: ic.total || 0,
    count: ic.count || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <DashStatCardSkeleton key={i} />)
        ) : (
          <>
            {/* Avg Transaction Card */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm card-hover animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(avgTransaction)}</p>
              <p className="text-sm text-gray-500 mt-1">O&apos;rtacha tranzaksiya</p>
            </div>

            {/* Payment Method Cards */}
            {paymentMethods.slice(0, 3).map((pm: any, index: number) => {
              const colors = paymentMethodColors[pm.method] || { bg: "bg-gray-100", text: "text-gray-600" };
              const PMIcon = paymentMethodIcons[pm.method] || CreditCard;
              const percentage = totalPaymentMethodAmount > 0 ? ((pm.total / totalPaymentMethodAmount) * 100).toFixed(1) : "0";
              return (
                <div
                  key={pm.method}
                  className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm card-hover animate-fade-in"
                  style={{ animationDelay: `${(index + 1) * 80}ms` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", colors.bg)}>
                      <PMIcon className={cn("w-5 h-5", colors.text)} />
                    </div>
                    <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{percentage}%</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(pm.total || 0)}</p>
                  <p className="text-sm text-gray-500 mt-1">{paymentMethodLabels[pm.method] || pm.method} ({pm.count || 0} ta)</p>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Charts Row 1 */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Methods Horizontal Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm animate-fade-in" style={{ animationDelay: "320ms" }}>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">To&apos;lov Usullari</h2>
                <p className="text-xs text-gray-500 mt-0.5">Usullar bo&apos;yicha taqsimot</p>
              </div>
            </div>
            {paymentBarData.length === 0 ? (
              <EmptyState message="Ma'lumot mavjud emas" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={paymentBarData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={formatAxisValue} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} width={80} />
                  <RTooltip content={<TrendTooltip />} />
                  <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={28} name="Summa">
                    {paymentBarData.map((entry: any, index: number) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Income by Category */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm animate-fade-in" style={{ animationDelay: "400ms" }}>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Daromad Kategoriyalari</h2>
                <p className="text-xs text-gray-500 mt-0.5">Kategoriya bo&apos;yicha daromad</p>
              </div>
            </div>
            {incomeCategoryBarData.length === 0 ? (
              <EmptyState message="Ma'lumot mavjud emas" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={incomeCategoryBarData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={formatAxisValue} />
                  <RTooltip content={<TrendTooltip />} />
                  <Bar dataKey="total" fill="#10b981" radius={[6, 6, 0, 0]} barSize={36} name="Summa" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* Daily Income/Expense AreaChart */}
      {isLoading ? (
        <ChartSkeleton />
      ) : (
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm animate-fade-in" style={{ animationDelay: "480ms" }}>
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Kunlik Daromad va Xarajat</h2>
              <p className="text-xs text-gray-500 mt-0.5">Kunlar bo&apos;yicha moliyaviy ko&apos;rsatkichlar</p>
            </div>
          </div>
          {dailyIncome.length === 0 ? (
            <EmptyState message="Ma'lumot mavjud emas" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyIncome} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradientDailyIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradientDailyExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={formatAxisValue} />
                <RTooltip content={<TrendTooltip />} />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#gradientDailyIncome)" dot={false} name="Daromad" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fill="url(#gradientDailyExpense)" dot={false} name="Xarajat" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
}

// We need Cell for colored bars - dynamic import
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), { ssr: false });

// ============================================================================
// TAB 3: A'ZOLAR
// ============================================================================

function AzolarTab({
  isLoading,
  membersByStatus,
  totalMembers,
  subscriptionPieData,
  totalSubscriptions,
  newMembersTrend,
  balanceStats,
  topBalanceMembers,
}: {
  isLoading: boolean;
  membersByStatus: { active: number; expired: number; inactive: number };
  totalMembers: number;
  subscriptionPieData: any[];
  totalSubscriptions: number;
  newMembersTrend: any[];
  balanceStats: { totalBalance: number; avgBalance: number; membersWithBalance: number };
  topBalanceMembers: any[];
}) {
  const activePercent = totalMembers > 0 ? ((membersByStatus.active / totalMembers) * 100).toFixed(1) : "0";
  const expiredPercent = totalMembers > 0 ? ((membersByStatus.expired / totalMembers) * 100).toFixed(1) : "0";
  const inactivePercent = totalMembers > 0 ? ((membersByStatus.inactive / totalMembers) * 100).toFixed(1) : "0";

  const maxBalance = topBalanceMembers.length > 0 ? Math.max(...topBalanceMembers.map((m: any) => m.balance || 0)) : 1;

  const statusCards = [
    { title: "Faol", count: membersByStatus.active, percent: activePercent, color: "emerald", gradient: "from-emerald-500 to-emerald-400" },
    { title: "Muddati tugagan", count: membersByStatus.expired, percent: expiredPercent, color: "red", gradient: "from-red-500 to-red-400" },
    { title: "Nofaol", count: membersByStatus.inactive, percent: inactivePercent, color: "gray", gradient: "from-gray-500 to-gray-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Status Cards with progress bars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <DashStatCardSkeleton key={i} />)
          : statusCards.map((card, index) => (
              <div
                key={card.title}
                className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm card-hover animate-fade-in"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
                  <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", {
                    "bg-emerald-100 text-emerald-700": card.color === "emerald",
                    "bg-red-100 text-red-700": card.color === "red",
                    "bg-gray-100 text-gray-700": card.color === "gray",
                  })}>
                    {card.percent}%
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-3">{card.count} ta</p>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out", card.gradient)}
                    style={{ width: `${card.percent}%` }}
                  />
                </div>
              </div>
            ))}
      </div>

      {/* Subscription Pie + New Members Trend */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subscription Types Pie */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm animate-fade-in" style={{ animationDelay: "240ms" }}>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Abonement Turlari</h2>
                <p className="text-xs text-gray-500 mt-0.5">Jami: {totalSubscriptions} ta a&apos;zo</p>
              </div>
            </div>
            <RevenuePieChart data={subscriptionPieData} />
          </div>

          {/* New Members Trend */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm animate-fade-in" style={{ animationDelay: "320ms" }}>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Yangi A&apos;zolar</h2>
                <p className="text-xs text-gray-500 mt-0.5">Oylik tendensiya</p>
              </div>
            </div>
            {newMembersTrend.length === 0 ? (
              <EmptyState message="Ma'lumot mavjud emas" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={newMembersTrend} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradientNewMembers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <RTooltip content={<CountTooltip />} />
                  <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#gradientNewMembers)" dot={{ r: 3, fill: "#8b5cf6", strokeWidth: 2, stroke: "#fff" }} name="Yangi a'zolar" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* Balance Stats + Top Balance Members */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Balance Stats Mini Cards */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm animate-fade-in" style={{ animationDelay: "400ms" }}>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Balans Statistikasi</h2>
                <p className="text-xs text-gray-500 mt-0.5">A&apos;zolar balansi haqida</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <p className="text-xs text-emerald-600 font-medium mb-1">Jami Balans</p>
                <p className="text-lg font-bold text-emerald-700">{formatCurrency(balanceStats.totalBalance)}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-xs text-blue-600 font-medium mb-1">O&apos;rtacha Balans</p>
                <p className="text-lg font-bold text-blue-700">{formatCurrency(balanceStats.avgBalance)}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <p className="text-xs text-purple-600 font-medium mb-1">Balansli A&apos;zolar</p>
                <p className="text-lg font-bold text-purple-700">{balanceStats.membersWithBalance} ta</p>
              </div>
            </div>
          </div>

          {/* Top 5 Balance Members */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm animate-fade-in" style={{ animationDelay: "480ms" }}>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Top Balanslar</h2>
                <p className="text-xs text-gray-500 mt-0.5">Eng yuqori balansga ega a&apos;zolar</p>
              </div>
            </div>
            <div className="space-y-4">
              {topBalanceMembers.length === 0 ? (
                <EmptyState message="Ma'lumot mavjud emas" />
              ) : (
                topBalanceMembers.slice(0, 5).map((member: any, index: number) => {
                  const balance = member.balance || 0;
                  const percentage = maxBalance > 0 ? (balance / maxBalance) * 100 : 0;
                  return (
                    <div key={member.name || index} className="flex items-center gap-4">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0", rankColors[index] || "bg-gray-300 text-white")}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                          <span className="text-sm font-semibold text-gray-700 shrink-0 ml-2">{formatCurrency(balance)}</span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${percentage}%`, background: rankGradients[index] || rankGradients[3] }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TAB 4: TASHRIFLAR
// ============================================================================

function TashriflarTab({
  isLoading,
  visitStats,
  visitsByWeekday,
  visitsTrend,
  topVisitors,
}: {
  isLoading: boolean;
  visitStats: { totalVisits: number; avgPerDay: number; avgDuration: number };
  visitsByWeekday: any[];
  visitsTrend: any[];
  topVisitors: any[];
}) {
  const maxVisitorCount = topVisitors.length > 0 ? Math.max(...topVisitors.map((v: any) => v.visits || 0)) : 1;

  const visitKpiCards = [
    { title: "Jami Tashriflar", value: visitStats.totalVisits, Icon: UserCheck, iconBg: "bg-blue-100", iconColor: "text-blue-600", suffix: " ta" },
    { title: "Kunlik O'rtacha", value: visitStats.avgPerDay, Icon: Calendar, iconBg: "bg-emerald-100", iconColor: "text-emerald-600", suffix: " ta" },
    { title: "O'rtacha Davomiylik", value: visitStats.avgDuration, Icon: Clock, iconBg: "bg-purple-100", iconColor: "text-purple-600", suffix: " daq" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <DashStatCardSkeleton key={i} />)
          : visitKpiCards.map((card, index) => (
              <div
                key={card.title}
                className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm card-hover animate-fade-in"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", card.iconBg)}>
                    <card.Icon className={cn("w-5 h-5", card.iconColor)} />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {card.value}{card.suffix}
                </p>
                <p className="text-sm text-gray-500 mt-1">{card.title}</p>
              </div>
            ))}
      </div>

      {/* Charts */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekday Distribution BarChart */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm animate-fade-in" style={{ animationDelay: "240ms" }}>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Hafta Kunlari</h2>
                <p className="text-xs text-gray-500 mt-0.5">Kunlar bo&apos;yicha tashriflar</p>
              </div>
            </div>
            {visitsByWeekday.length === 0 ? (
              <EmptyState message="Ma'lumot mavjud emas" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={visitsByWeekday} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <RTooltip content={<VisitBarTooltip />} />
                  <Bar dataKey="visits" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={32} name="Tashriflar" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Visits Trend AreaChart */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm animate-fade-in" style={{ animationDelay: "320ms" }}>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Tashriflar Tendensiyasi</h2>
                <p className="text-xs text-gray-500 mt-0.5">Oylik o&apos;zgarish</p>
              </div>
            </div>
            {visitsTrend.length === 0 ? (
              <EmptyState message="Ma'lumot mavjud emas" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={visitsTrend} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradientVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <RTooltip content={<CountTooltip />} />
                  <Area type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gradientVisits)" dot={{ r: 3, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }} name="Tashriflar" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* Top 10 Visitors */}
      {isLoading ? (
        <ChartSkeleton />
      ) : (
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm animate-fade-in" style={{ animationDelay: "400ms" }}>
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Top A&apos;zolar</h2>
              <p className="text-xs text-gray-500 mt-0.5">Eng ko&apos;p tashrif buyurganlar</p>
            </div>
          </div>
          <div className="space-y-4">
            {topVisitors.length === 0 ? (
              <EmptyState message="Ma'lumot mavjud emas" />
            ) : (
              topVisitors.slice(0, 10).map((visitor: any, index: number) => {
                const visits = visitor.visits || 0;
                const percentage = maxVisitorCount > 0 ? (visits / maxVisitorCount) * 100 : 0;
                return (
                  <div key={visitor.name || index} className="flex items-center gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                      rankColors[index] || "bg-gray-300 text-white"
                    )}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-medium text-gray-900 truncate">{visitor.name}</p>
                        <span className="text-sm font-semibold text-gray-700 shrink-0 ml-2">{visits} tashrif</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${percentage}%`, background: rankGradients[index] || rankGradients[3] }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TAB 5: MAHSULOTLAR
// ============================================================================

function MahsulotlarTab({
  isLoading,
  topProducts,
  productCategoryPieData,
  lowStockProducts,
}: {
  isLoading: boolean;
  topProducts: any[];
  productCategoryPieData: any[];
  lowStockProducts: any[];
}) {
  const maxRevenue = topProducts.length > 0 ? Math.max(...topProducts.map((p: any) => p.revenue || 0)) : 1;

  return (
    <div className="space-y-6">
      {/* Top Products + Categories Pie */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 10 Products with progress bars */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm animate-fade-in">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Top Mahsulotlar</h2>
                <p className="text-xs text-gray-500 mt-0.5">Eng ko&apos;p sotilgan mahsulotlar</p>
              </div>
            </div>
            <div className="space-y-4">
              {topProducts.length === 0 ? (
                <EmptyState message="Ma'lumot mavjud emas" />
              ) : (
                topProducts.slice(0, 10).map((product: any, index: number) => {
                  const revenue = product.revenue || 0;
                  const percentage = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                  return (
                    <div key={product.name || index} className="flex items-center gap-4">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                        rankColors[index] || "bg-gray-300 text-white"
                      )}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                            <p className="text-xs text-gray-400">{product.sold || 0} ta sotilgan</p>
                          </div>
                          <span className="text-sm font-semibold text-gray-700 shrink-0 ml-2">{formatCurrency(revenue)}</span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${percentage}%`, background: rankGradients[index] || rankGradients[3] }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Product Categories Pie */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm animate-fade-in" style={{ animationDelay: "80ms" }}>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Kategoriyalar</h2>
                <p className="text-xs text-gray-500 mt-0.5">Kategoriya bo&apos;yicha taqsimot</p>
              </div>
            </div>
            {productCategoryPieData.length === 0 ? (
              <EmptyState message="Ma'lumot mavjud emas" />
            ) : (
              <>
                <RevenuePieChart data={productCategoryPieData} />
                {/* Category details */}
                <div className="mt-4 space-y-3">
                  {productCategoryPieData.map((cat: any, index: number) => (
                    <div key={cat.name || index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.fill }} />
                        <span className="text-gray-600">{cat.name}</span>
                      </div>
                      <span className="font-medium text-gray-900">{formatCurrency(cat.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Low Stock Alerts */}
      {isLoading ? (
        <ChartSkeleton />
      ) : (
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm animate-fade-in" style={{ animationDelay: "160ms" }}>
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Kam Qolgan Mahsulotlar</h2>
              <p className="text-xs text-gray-500 mt-0.5">Zaxira kamaygan mahsulotlar</p>
            </div>
          </div>
          {lowStockProducts.length === 0 ? (
            <EmptyState message="Barcha mahsulotlar yetarli miqdorda" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockProducts.map((product: any, index: number) => {
                const isVeryLow = (product.stock || 0) <= Math.floor((product.minAlert || 5) / 2);
                return (
                  <div
                    key={product.name || index}
                    className={cn(
                      "rounded-xl p-4 border animate-fade-in",
                      isVeryLow ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
                    )}
                    style={{ animationDelay: `${(index + 2) * 80}ms` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <span className={cn(
                        "text-xs font-semibold px-2 py-0.5 rounded-full",
                        isVeryLow ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {product.stock || 0} ta
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{product.category}</span>
                      <span>Min: {product.minAlert || 5} ta</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
