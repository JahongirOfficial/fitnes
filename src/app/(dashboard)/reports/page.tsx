"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Calendar, TrendingUp, TrendingDown, Wallet, UserPlus,
  Trophy, Package, BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { useReports } from "@/lib/hooks";
import { DashStatCardSkeleton, ChartSkeleton } from "@/components/ui/Skeleton";

const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((m) => m.Line), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const RTooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });
const RevenuePieChart = dynamic(() => import("@/components/reports/RevenuePieChart"), { ssr: false });

type Period = "daily" | "weekly" | "monthly" | "yearly";

const periods: { key: Period; label: string }[] = [
  { key: "daily", label: "Kunlik" },
  { key: "weekly", label: "Haftalik" },
  { key: "monthly", label: "Oylik" },
  { key: "yearly", label: "Yillik" },
];

const defaultPieData = [
  { name: "Abonementlar", value: 0, fill: "#3b82f6" },
  { name: "Mahsulotlar", value: 0, fill: "#10b981" },
  { name: "Boshqa", value: 0, fill: "#f59e0b" },
];

const rankColors = [
  "bg-yellow-400 text-white", "bg-gray-400 text-white",
  "bg-amber-600 text-white", "bg-blue-400 text-white", "bg-indigo-400 text-white",
];

function LineChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 min-w-[200px]">
      <p className="text-sm font-semibold text-gray-800 mb-2">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600">{entry.dataKey === "income" ? "Daromad" : "Xarajat"}</span>
          </div>
          <span className="font-medium text-gray-900">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}



export default function ReportsPage() {
  const [activePeriod, setActivePeriod] = useState<Period>("monthly");
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: reportData, isLoading } = useReports({ period: activePeriod, startDate, endDate });

  const summary = reportData?.summary || { totalIncome: 0, totalExpense: 0, netProfit: 0, newMembers: 0 };
  const monthlyTrend = reportData?.monthlyTrend || [];
  const revenueByCategory = reportData?.revenueByCategory?.length
    ? reportData.revenueByCategory
    : defaultPieData;
  const topMembers = reportData?.topMembers || [];
  const topProducts = reportData?.topProducts || [];

  const maxVisits = topMembers.length ? Math.max(...topMembers.map((m: any) => m.visits || m.count || 0)) : 1;
  const maxSold = topProducts.length ? Math.max(...topProducts.map((p: any) => p.sold || p.count || 0)) : 1;

  const summaryCards = [
    { title: "Jami Daromad", value: summary.totalIncome, Icon: TrendingUp, iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
    { title: "Jami Xarajat", value: summary.totalExpense, Icon: TrendingDown, iconBg: "bg-red-100", iconColor: "text-red-600" },
    { title: "Sof Foyda", value: summary.netProfit, Icon: Wallet, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
    { title: "Yangi A'zolar", value: summary.newMembers, Icon: UserPlus, iconBg: "bg-purple-100", iconColor: "text-purple-600", isCurrency: false, suffix: " ta" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Hisobotlar</h1>
          <p className="text-sm text-gray-500 mt-1">Moliyaviy va statistik hisobotlar</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap bg-white rounded-xl px-3 py-2 shadow-sm border border-gray-200 w-full sm:w-auto">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="text-sm text-gray-700 bg-transparent outline-none w-full sm:w-[130px]" />
            <span className="text-gray-300">—</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="text-sm text-gray-700 bg-transparent outline-none w-full sm:w-[130px]" />
          </div>
        </div>
      </div>

      {/* Period Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto flex-nowrap pb-1 animate-fade-in">
        {periods.map((period) => (
          <button key={period.key} onClick={() => setActivePeriod(period.key)}
            className={cn("px-5 py-2 text-sm font-medium rounded-xl transition-all duration-200",
              activePeriod === period.key
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200")}>
            {period.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <DashStatCardSkeleton key={i} />)
          : summaryCards.map((card, index) => {
              const isCurrency = (card as any).isCurrency !== false;
              return (
                <div key={card.title} className="bg-white rounded-2xl p-6 shadow-sm card-hover animate-fade-in"
                  style={{ animationDelay: `${index * 80}ms` }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", card.iconBg)}>
                      <card.Icon className={cn("w-5 h-5", card.iconColor)} />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {isCurrency ? formatCurrency(card.value) : `${card.value}${(card as any).suffix || ""}`}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{card.title}</p>
                </div>
              );
            })}
      </div>

      {/* Charts */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm animate-fade-in" style={{ animationDelay: "320ms" }}>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Daromad va Xarajatlar</h2>
                <p className="text-xs text-gray-500 mt-0.5">Oylik tendensiya</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyTrend} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickFormatter={(v: number) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`} />
                <RTooltip content={<LineChartTooltip />} />
                <Line type="monotone" dataKey="income" stroke="#3b82f6" strokeWidth={3}
                  dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }} />
                <Line type="monotone" dataKey="expense" stroke="#f87171" strokeWidth={3}
                  dot={{ r: 4, fill: "#f87171", strokeWidth: 2, stroke: "#fff" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm animate-fade-in" style={{ animationDelay: "400ms" }}>
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

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Members */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm animate-fade-in" style={{ animationDelay: "480ms" }}>
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
            {topMembers.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">Ma&apos;lumot mavjud emas</p>
            ) : (
              topMembers.slice(0, 5).map((member: any, index: number) => {
                const visits = member.visits || member.count || 0;
                const percentage = (visits / maxVisits) * 100;
                return (
                  <div key={member.name || index} className="flex items-center gap-4">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0", rankColors[index] || "bg-gray-300 text-white")}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                        <span className="text-sm font-semibold text-gray-700 shrink-0 ml-2">{visits} tashrif</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${percentage}%`, background: index === 0 ? "linear-gradient(90deg, #f59e0b, #eab308)" : index === 1 ? "linear-gradient(90deg, #9ca3af, #6b7280)" : "linear-gradient(90deg, #3b82f6, #2563eb)" }} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Product Sales */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm animate-fade-in" style={{ animationDelay: "560ms" }}>
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Mahsulot Sotilishi</h2>
              <p className="text-xs text-gray-500 mt-0.5">Eng ko&apos;p sotilgan mahsulotlar</p>
            </div>
          </div>
          <div className="space-y-4">
            {topProducts.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">Ma&apos;lumot mavjud emas</p>
            ) : (
              topProducts.slice(0, 5).map((product: any, index: number) => {
                const sold = product.sold || product.count || 0;
                const percentage = (sold / maxSold) * 100;
                return (
                  <div key={product.name || index} className="flex items-center gap-4">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0", rankColors[index] || "bg-gray-300 text-white")}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <span className="text-sm font-semibold text-gray-700 shrink-0 ml-2">{sold} ta</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${percentage}%`, background: index === 0 ? "linear-gradient(90deg, #6366f1, #4f46e5)" : "linear-gradient(90deg, #a78bfa, #8b5cf6)" }} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
