"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Banknote,
  Trash2,
  AlertTriangle,
  BookOpen,
  TrendingDown,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  useDebts,
  useCreateDebt,
  useUpdateDebt,
  usePayDebt,
  useDeleteDebt,
} from "@/lib/hooks";
import { useDebounce } from "@/lib/useDebounce";
import { useToast } from "@/components/ui/Toast";
import { DashStatCardSkeleton, TableRowSkeleton } from "@/components/ui/Skeleton";
import DebtModal from "@/components/debts/DebtModal";
import DebtPaymentModal from "@/components/debts/DebtPaymentModal";
import DebtDetailModal from "@/components/debts/DebtDetailModal";

type StatusFilter = "all" | "unpaid" | "partial" | "paid";

const statusLabel: Record<string, string> = {
  unpaid: "To'lanmagan",
  partial: "Qisman",
  paid: "To'langan",
};

const statusColor: Record<string, string> = {
  unpaid: "bg-red-100 text-red-700",
  partial: "bg-amber-100 text-amber-700",
  paid: "bg-green-100 text-green-700",
};

const ITEMS_PER_PAGE = 10;

export default function DebtsPage() {
  const { toast } = useToast();

  // Filter va qidiruv holatlari
  const [activeTab, setActiveTab] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal holatlari
  const [debtModalOpen, setDebtModalOpen] = useState(false);
  const [debtModalMode, setDebtModalMode] = useState<"create" | "edit">("create");
  const [selectedDebt, setSelectedDebt] = useState<any>(undefined);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentDebt, setPaymentDebt] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailDebt, setDetailDebt] = useState<any>(null);

  // API so'rovlari
  const queryParams = {
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    ...(activeTab !== "all" ? { status: activeTab } : {}),
    ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
  };

  const { data, isLoading } = useDebts(queryParams);
  const createDebt = useCreateDebt();
  const updateDebt = useUpdateDebt();
  const payDebt = usePayDebt();
  const deleteDebt = useDeleteDebt();

  const debts = data?.debts || [];
  const summary = data?.summary || {
    totalOutstanding: 0,
    totalPaid: 0,
    activeDebts: 0,
    totalDebts: 0,
  };
  const totalPages = Math.max(1, Math.ceil((summary.totalDebts || debts.length) / ITEMS_PER_PAGE));

  // Tab o'zgartirganda sahifani qayta boshlash
  const handleTabChange = (tab: StatusFilter) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Modal ochish funksiyalari
  const openCreate = () => {
    setSelectedDebt(undefined);
    setDebtModalMode("create");
    setDebtModalOpen(true);
  };

  const openEdit = (debt: any) => {
    setSelectedDebt(debt);
    setDebtModalMode("edit");
    setDebtModalOpen(true);
  };

  const openPayment = (debt: any) => {
    setPaymentDebt(debt);
    setPaymentModalOpen(true);
  };

  const openDetail = (debt: any) => {
    setDetailDebt(debt);
    setDetailModalOpen(true);
  };

  // CRUD operatsiyalari
  const handleCreate = async (formData: any) => {
    try {
      await createDebt.mutateAsync(formData);
      toast("success", "Qarz qo'shildi");
      setDebtModalOpen(false);
    } catch (err: any) {
      toast("error", err.message || "Xatolik yuz berdi");
    }
  };

  const handleUpdate = async (formData: any) => {
    try {
      await updateDebt.mutateAsync({ id: selectedDebt._id, data: formData });
      toast("success", "Qarz yangilandi");
      setDebtModalOpen(false);
    } catch (err: any) {
      toast("error", err.message || "Xatolik yuz berdi");
    }
  };

  const handlePay = async (payData: { amount: number; description?: string }) => {
    try {
      await payDebt.mutateAsync({ id: paymentDebt._id, data: payData });
      toast("success", "To'lov qayd etildi");
      setPaymentModalOpen(false);
    } catch (err: any) {
      toast("error", err.message || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async (debt: any) => {
    if (!window.confirm("Bu qarzni o'chirishni tasdiqlaysizmi?")) return;
    try {
      await deleteDebt.mutateAsync(debt._id);
      toast("success", "Qarz o'chirildi");
    } catch (err: any) {
      toast("error", err.message || "Xatolik yuz berdi");
    }
  };

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "Barchasi" },
    { key: "unpaid", label: "To'lanmagan" },
    { key: "partial", label: "Qisman" },
    { key: "paid", label: "To'langan" },
  ];

  return (
    <div className="space-y-6">
      {/* Sarlavha */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Qarzdaftarcha</h1>
          <p className="text-sm text-gray-500 mt-1">Qarzlarni boshqarish</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className={cn(
            "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl",
            "bg-blue-600 hover:bg-blue-700 text-white",
            "text-sm font-semibold shadow-sm transition-all duration-200"
          )}
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Yangi qarz
        </button>
      </div>

      {/* Statistika kartalari */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <DashStatCardSkeleton key={i} />)
        ) : (
          <>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">Jami qarzlar</span>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-100">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                {formatCurrency(summary.totalOutstanding)}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">To&apos;langan</span>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-100">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                {formatCurrency(summary.totalPaid)}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">Faol qarzlar</span>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-100">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                {summary.activeDebts} ta
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">Jami yozuvlar</span>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-100">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                {summary.totalDebts} ta
              </p>
            </div>
          </>
        )}
      </div>

      {/* Tab va Qidiruv */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px",
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Ism yoki telefon bo'yicha qidirish..."
            className={cn(
              "w-full sm:w-64 pl-9 pr-4 py-2 rounded-xl",
              "bg-white border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            )}
          />
        </div>
      </div>

      {/* Jadval */}
      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {["#", "Shaxs", "Telefon", "Qarz summasi", "To'langan", "Qoldiq", "Holat", "Sana", "Amallar"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap whitespace-nowrap px-4 py-3"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={9} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap px-4 py-3">
                    #
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap px-4 py-3">
                    Shaxs
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap px-4 py-3">
                    Telefon
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap px-4 py-3">
                    Qarz
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap px-4 py-3">
                    To&apos;langan
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap px-4 py-3">
                    Qoldiq
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap px-4 py-3">
                    Holat
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap px-4 py-3">
                    Sana
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap px-4 py-3">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {debts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <AlertTriangle className="w-10 h-10 text-gray-300" />
                        <p className="text-sm text-gray-400">Qarz topilmadi</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  debts.map((debt: any, index: number) => (
                    <tr
                      key={debt._id}
                      className="hover:bg-gray-50/70 transition-colors duration-150"
                    >
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="text-sm text-gray-400 font-medium">
                          {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{debt.personName}</p>
                        {debt.description && (
                          <p className="text-xs text-gray-400 mt-0.5">{debt.description}</p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {debt.phone ? (
                          <span className="text-sm text-gray-600">{debt.phone}</span>
                        ) : (
                          <span className="text-sm text-gray-300">&mdash;</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <span className="text-sm font-semibold text-gray-900 tabular-nums">
                          {formatCurrency(debt.amount)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <span className="text-sm font-semibold text-green-600 tabular-nums">
                          {formatCurrency(debt.paidAmount)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <span className="text-sm font-bold text-red-600 tabular-nums">
                          {formatCurrency(debt.remainingAmount)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold",
                            statusColor[debt.status] || "bg-gray-100 text-gray-600"
                          )}
                        >
                          {statusLabel[debt.status] || debt.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="text-sm text-gray-500">
                          {formatDate(debt.createdAt)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            title="Ko'rish"
                            onClick={() => openDetail(debt)}
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            title="Tahrirlash"
                            onClick={() => openEdit(debt)}
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-yellow-50 hover:text-yellow-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          {debt.status !== "paid" && (
                            <button
                              type="button"
                              title="To'lov qilish"
                              onClick={() => openPayment(debt)}
                              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                            >
                              <Banknote className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            title="O'chirish"
                            onClick={() => handleDelete(debt)}
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-4 sm:px-6">
            <p className="hidden text-sm text-gray-500 sm:block">
              Jami {summary.totalDebts || debts.length} ta qarz
            </p>
            <p className="text-sm text-gray-500 sm:hidden">
              {summary.totalDebts || debts.length} ta
            </p>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 sm:px-3"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Oldingi</span>
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    page === currentPage
                      ? "bg-blue-600 text-white"
                      : "hidden text-gray-600 hover:bg-gray-50 sm:inline-block"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 sm:px-3"
              >
                <span className="hidden sm:inline">Keyingi</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modallar */}
      <DebtModal
        isOpen={debtModalOpen}
        onClose={() => setDebtModalOpen(false)}
        onSubmit={debtModalMode === "create" ? handleCreate : handleUpdate}
        debt={selectedDebt}
        mode={debtModalMode}
      />

      <DebtPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSubmit={handlePay}
        debt={paymentDebt}
      />

      <DebtDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        debt={detailDebt}
      />
    </div>
  );
}
