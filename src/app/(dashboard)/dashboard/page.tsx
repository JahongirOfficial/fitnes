"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Users,
  UserCheck,
  ShoppingBag,
  Wallet,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { useDashboard } from "@/lib/hooks";
import { DashStatCardSkeleton, ChartSkeleton } from "@/components/ui/Skeleton";

const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then((m) => m.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then((m) => m.Area), { ssr: false });

function IncomeChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 min-w-[180px]">
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

function MembersChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 min-w-[160px]">
      <p className="text-sm font-semibold text-gray-800 mb-2">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600">{entry.dataKey === "active" ? "Faol" : "Yangi"}</span>
          </div>
          <span className="font-medium text-gray-900">{entry.value} ta</span>
        </div>
      ))}
    </div>
  );
}

const fallbackWeeklyData = [
  { day: "Dush", income: 0, expense: 0 },
  { day: "Sesh", income: 0, expense: 0 },
  { day: "Chor", income: 0, expense: 0 },
  { day: "Pay", income: 0, expense: 0 },
  { day: "Jum", income: 0, expense: 0 },
  { day: "Shan", income: 0, expense: 0 },
  { day: "Yak", income: 0, expense: 0 },
];

const fallbackMonthlyData = [
  { month: "Sen", active: 0, new: 0 },
  { month: "Okt", active: 0, new: 0 },
  { month: "Noy", active: 0, new: 0 },
  { month: "Dek", active: 0, new: 0 },
  { month: "Yan", active: 0, new: 0 },
  { month: "Fev", active: 0, new: 0 },
];

export default function DashboardPage() {
  const router = useRouter();
  const { data: dashData, isLoading } = useDashboard();

  const stats = dashData?.stats || {
    todayIncome: 0,
    activeMembers: 0,
    todayVisits: 0,
    productSales: 0,
    changes: { income: 0, members: 0, visits: 0, productSales: 0 },
  };

  const changes = stats.changes || { income: 0, members: 0, visits: 0, productSales: 0 };
  const weeklyData = dashData?.weeklyData?.length ? dashData.weeklyData : fallbackWeeklyData;
  const monthlyMembers = dashData?.monthlyMembers?.length ? dashData.monthlyMembers : fallbackMonthlyData;
  const recentPayments = dashData?.recentPayments || [];
  const currentlyInGym = dashData?.currentlyInGym || [];

  const statCards = [
    { title: "Bugungi Daromad", value: stats.todayIncome, change: changes.income, gradient: "gradient-blue", Icon: TrendingUp, href: "/cashier?tab=income" },
    { title: "Faol A'zolar", value: stats.activeMembers, change: changes.members, gradient: "gradient-green", Icon: Users, isCurrency: false, href: "/members?status=active" },
    { title: "Bugungi Tashriflar", value: stats.todayVisits, change: changes.visits, gradient: "gradient-purple", Icon: UserCheck, isCurrency: false, href: "/visits" },
    { title: "Mahsulot Sotilishi", value: stats.productSales, change: changes.productSales, gradient: "gradient-orange", Icon: ShoppingBag, href: "/products" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <DashStatCardSkeleton key={i} />)
          : statCards.map((card, index) => {
              const isPositive = card.change >= 0;
              const isCurrency = card.isCurrency !== false && card.value >= 1000;
              return (
                <div
                  key={card.title}
                  onClick={() => router.push(card.href)}
                  className={cn("bg-white rounded-2xl p-4 sm:p-6 shadow-sm card-hover animate-fade-in cursor-pointer hover:shadow-md transition-shadow")}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4", card.gradient)}>
                    <card.Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                    {isCurrency ? formatCurrency(card.value as number) : card.value}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">{card.title}</p>
                    {card.change !== 0 && (
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full",
                          isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                        )}
                      >
                        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {isPositive ? "+" : ""}
                        {card.change}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
      </div>

      {/* Charts Section */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Income & Expense Bar Chart */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm animate-fade-in" style={{ animationDelay: "320ms" }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Haftalik Daromad va Xarajatlar</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">So&apos;nggi 7 kun statistikasi</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-gray-500">Daromad</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="text-gray-500">Xarajat</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData} barGap={4} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickFormatter={(v: number) =>
                    v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`
                  }
                />
                <Tooltip content={<IncomeChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                <Bar dataKey="income" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Bar dataKey="expense" fill="#f87171" radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Members Statistics Area Chart */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm animate-fade-in" style={{ animationDelay: "400ms" }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">A&apos;zolar Statistikasi</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Oxirgi 6 oylik tendensiya</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-gray-500">Faol</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <span className="text-gray-500">Yangi</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyMembers} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="newGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip content={<MembersChartTooltip />} />
                <Area type="monotone" dataKey="active" stroke="#10b981" strokeWidth={2.5} fill="url(#activeGradient)" />
                <Area type="monotone" dataKey="new" stroke="#3b82f6" strokeWidth={2.5} fill="url(#newGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm animate-fade-in" style={{ animationDelay: "480ms" }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">So&apos;nggi To&apos;lovlar</h2>
                <p className="text-xs text-gray-500">Bugungi tranzaksiyalar</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {recentPayments.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">Bugungi to&apos;lovlar mavjud emas</p>
            ) : (
              recentPayments.map((payment: any) => {
                const isIncome = payment.type === "income";
                return (
                  <div
                    key={payment._id || payment.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                          isIncome ? "bg-emerald-100" : "bg-red-100"
                        )}
                      >
                        {isIncome ? (
                          <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {payment.memberName || payment.description}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={cn(
                              "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                              isIncome ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                            )}
                          >
                            {isIncome ? "Kirim" : "Chiqim"}
                          </span>
                          <span className="text-xs text-gray-400">{payment.paymentMethod || payment.method}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className={cn("text-sm font-semibold", isIncome ? "text-emerald-600" : "text-red-600")}>
                        {isIncome ? "+" : "-"}
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(payment.createdAt).toLocaleTimeString("uz-UZ", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Currently in Gym */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm animate-fade-in" style={{ animationDelay: "560ms" }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Hozir Zalda</h2>
                <p className="text-xs text-gray-500">{currentlyInGym.length} ta a&apos;zo mashg&apos;ulotda</p>
              </div>
            </div>
            {currentlyInGym.length > 0 && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            )}
          </div>
          <div className="space-y-3">
            {currentlyInGym.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">Hozirda zalda hech kim yo&apos;q</p>
            ) : (
              currentlyInGym.map((member: any) => (
                <div
                  key={member._id || member.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {(member.memberName || member.name || "")
                          .split(" ")
                          .map((w: string) => w[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.memberName || member.name}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        Kirish:{" "}
                        {new Date(member.checkInTime || member.checkIn).toLocaleTimeString("uz-UZ", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Zalda
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
