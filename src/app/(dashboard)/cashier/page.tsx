"use client";

import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  TrendingUp,
  TrendingDown,
  Receipt,
  CreditCard,
  Banknote,
  Clock,
  Search,
  Package,
  Zap,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { usePayments, useCreatePayment } from "@/lib/hooks";
import { useDebounce } from "@/lib/useDebounce";
import { StatCardSkeleton, TableRowSkeleton } from "@/components/ui/Skeleton";
import PaymentModal from "@/components/cashier/PaymentModal";

type TabType = "income" | "expense" | "all";

function getCategoryIcon(category: string) {
  switch (category) {
    case "subscription": return <CreditCard className="w-4 h-4" />;
    case "product": return <Package className="w-4 h-4" />;
    case "balance": return <Wallet className="w-4 h-4" />;
    case "salary": return <Users className="w-4 h-4" />;
    case "utility": return <Zap className="w-4 h-4" />;
    default: return <Receipt className="w-4 h-4" />;
  }
}

function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    subscription: "Abonement", product: "Mahsulot", balance: "Balans", salary: "Ish haqi",
    utility: "Kommunal", rent: "Ijara", equipment: "Jihozlar", other: "Boshqa",
  };
  return map[category] || category;
}

function getPaymentMethodLabel(method: string): string {
  const map: Record<string, string> = { cash: "Naqd", card: "Karta", transfer: "O'tkazma" };
  return map[method] || method;
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

function SummaryCard({ title, value, icon, gradientFrom, gradientTo }: {
  title: string; value: string; icon: React.ReactNode; gradientFrom: string; gradientTo: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", `bg-gradient-to-br ${gradientFrom} ${gradientTo}`)}>
          {icon}
        </div>
      </div>
      <p className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">{value}</p>
    </div>
  );
}

export default function CashierPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"income" | "expense">("income");

  const queryParams = {
    ...(activeTab !== "all" ? { type: activeTab } : {}),
    ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
  };

  const { data, isLoading } = usePayments(queryParams);
  const createPayment = useCreatePayment();

  const payments = data?.payments || [];
  const dailyTotals = {
    income: data?.summary?.totalIncome || 0,
    expense: data?.summary?.totalExpense || 0,
    net: data?.summary?.netProfit || 0,
    count: data?.summary?.transactionCount || 0,
  };

  const handleCreatePayment = async (paymentData: any) => {
    if (paymentData._skipCreate) {
      toast("success", "Mahsulot sotildi");
      return;
    }
    await createPayment.mutateAsync(paymentData);
    toast("success", paymentData.type === "income" ? "Kirim qo'shildi" : "Chiqim qo'shildi");
  };

  const openIncomeModal = () => { setModalType("income"); setModalOpen(true); };
  const openExpenseModal = () => { setModalType("expense"); setModalOpen(true); };

  const tabs: { key: TabType; label: string }[] = [
    { key: "all", label: "Barchasi" },
    { key: "income", label: "Kirim" },
    { key: "expense", label: "Chiqim" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button onClick={openIncomeModal}
          className={cn("inline-flex items-center gap-2 px-4 py-2.5 rounded-xl",
            "bg-emerald-600 hover:bg-emerald-700 text-white",
            "text-sm font-semibold shadow-sm transition-all duration-200")}>
          <ArrowDownLeft className="w-4 h-4" strokeWidth={2.5} />
          + Kirim
        </button>
        <button onClick={openExpenseModal}
          className={cn("inline-flex items-center gap-2 px-4 py-2.5 rounded-xl",
            "bg-red-600 hover:bg-red-700 text-white",
            "text-sm font-semibold shadow-sm transition-all duration-200")}>
          <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
          + Chiqim
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <SummaryCard title="Bugungi Kirim" value={formatCurrency(dailyTotals.income)}
              icon={<TrendingUp className="w-5 h-5 text-white" />} gradientFrom="from-emerald-500" gradientTo="to-green-600" />
            <SummaryCard title="Bugungi Chiqim" value={formatCurrency(dailyTotals.expense)}
              icon={<TrendingDown className="w-5 h-5 text-white" />} gradientFrom="from-red-500" gradientTo="to-rose-600" />
            <SummaryCard title="Sof Foyda" value={formatCurrency(dailyTotals.net)}
              icon={<Wallet className="w-5 h-5 text-white" />}
              gradientFrom={dailyTotals.net >= 0 ? "from-blue-500" : "from-red-500"}
              gradientTo={dailyTotals.net >= 0 ? "to-indigo-600" : "to-rose-600"} />
            <SummaryCard title="Tranzaksiyalar" value={`${dailyTotals.count} ta`}
              icon={<Receipt className="w-5 h-5 text-white" />} gradientFrom="from-purple-500" gradientTo="to-violet-600" />
          </>
        )}
      </div>

      {/* Tab + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 border-b border-gray-200">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={cn("px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px",
                activeTab === tab.key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300")}>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Qidirish..."
            className={cn("w-full sm:w-64 pl-9 pr-4 py-2 rounded-xl",
              "bg-white border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all")} />
        </div>
      </div>

      {/* Transactions Table */}
      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4">#</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4">Tavsif</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4">Turi</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4">Summa</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4">Sana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={5} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4">#</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4">Tavsif</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4">A&apos;zo</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4">Turi</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4">Summa</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4">To&apos;lov usuli</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4">Sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 sm:px-6 py-12 text-center text-sm text-gray-400">Tranzaksiyalar topilmadi</td>
                  </tr>
                ) : (
                  payments.map((payment: any, index: number) => (
                    <tr key={payment._id} className="hover:bg-gray-50/70 transition-colors duration-150">
                      <td className="px-3 sm:px-6 py-3 sm:py-4"><span className="text-sm text-gray-400 font-medium">{index + 1}</span></td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                            payment.type === "income" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
                            {getCategoryIcon(payment.category)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{payment.description}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{getCategoryLabel(payment.category)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        {payment.memberName ? (
                          <span className="text-sm text-gray-700">{payment.memberName}</span>
                        ) : (
                          <span className="text-sm text-gray-300">&mdash;</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold",
                          payment.type === "income" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>
                          {payment.type === "income" ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {payment.type === "income" ? "Kirim" : "Chiqim"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={cn("text-sm font-bold tabular-nums",
                          payment.type === "income" ? "text-emerald-600" : "text-red-600")}>
                          {payment.type === "income" ? "+" : "-"}{formatCurrency(payment.amount)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border",
                          payment.paymentMethod === "cash" && "border-blue-200 bg-blue-50 text-blue-700",
                          payment.paymentMethod === "card" && "border-purple-200 bg-purple-50 text-purple-700",
                          payment.paymentMethod === "transfer" && "border-gray-200 bg-gray-50 text-gray-600")}>
                          {payment.paymentMethod === "cash" && <Banknote className="w-3 h-3" />}
                          {payment.paymentMethod === "card" && <CreditCard className="w-3 h-3" />}
                          {payment.paymentMethod === "transfer" && <ArrowUpRight className="w-3 h-3" />}
                          {getPaymentMethodLabel(payment.paymentMethod)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {formatDateTime(payment.createdAt)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-100 bg-gray-50/50">
            <p className="text-sm text-gray-500">
              Jami: <span className="font-semibold text-gray-700">{payments.length}</span> ta tranzaksiya
            </p>
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <span className="text-gray-500">
                Kirim: <span className="font-semibold text-emerald-600">
                  {formatCurrency(payments.filter((p: any) => p.type === "income").reduce((s: number, p: any) => s + p.amount, 0))}
                </span>
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">
                Chiqim: <span className="font-semibold text-red-600">
                  {formatCurrency(payments.filter((p: any) => p.type === "expense").reduce((s: number, p: any) => s + p.amount, 0))}
                </span>
              </span>
            </div>
          </div>
        </div>
      )}

      <PaymentModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreatePayment} type={modalType} />
    </div>
  );
}
