"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Clock,
  Wallet,
  QrCode,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Printer,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  MapPin,
  FileText,
} from "lucide-react";
import { useMember, useMemberPayments, useMemberVisits, useMemberDebts } from "@/lib/hooks";
import {
  cn,
  formatCurrency,
  formatDate,
  formatTime,
  getStatusColor,
  getStatusText,
  getSubscriptionText,
  getPaymentMethodText,
} from "@/lib/utils";
import { downloadQrCode, printQrCard } from "@/lib/qr-utils";

// ─── Yordamchi funksiyalar ───────────────────────────────────────────────────

/** A'zo ismidan 1-2 harf olish (avatar uchun) */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Qolgan kunlarni hisoblash (endDate - bugun) */
function getRemainingDays(endDate: string): number {
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/** Tashrif davomiyligini formatlash */
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} daqiqa`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} soat`;
  return `${hours} soat ${mins} daqiqa`;
}

/** Qarz statusi uchun rang va matn */
function getDebtStatusStyle(status: string): { color: string; text: string } {
  switch (status) {
    case "unpaid":
      return { color: "bg-red-100 text-red-700", text: "To'lanmagan" };
    case "partial":
      return { color: "bg-amber-100 text-amber-700", text: "Qisman to'langan" };
    case "paid":
      return { color: "bg-emerald-100 text-emerald-700", text: "To'langan" };
    default:
      return { color: "bg-gray-100 text-gray-700", text: status };
  }
}

// ─── Skeleton komponentlar ──────────────────────────────────────────────────

function HeaderSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gray-200" />
        <div className="space-y-2">
          <div className="h-6 w-48 rounded-lg bg-gray-200" />
          <div className="h-4 w-32 rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gray-200" />
        <div className="space-y-2">
          <div className="h-3 w-16 rounded bg-gray-200" />
          <div className="h-5 w-24 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-gray-50 px-6 py-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 flex-1 rounded bg-gray-200" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Tab tiplari ────────────────────────────────────────────────────────────

type TabType = "payments" | "visits" | "debts" | "info";

const TABS: { key: TabType; label: string; icon: React.ElementType }[] = [
  { key: "payments", label: "To'lovlar", icon: CreditCard },
  { key: "visits", label: "Tashriflar", icon: Activity },
  { key: "debts", label: "Qarzlar", icon: AlertTriangle },
  { key: "info", label: "Ma'lumotlar", icon: User },
];

const PAYMENTS_PER_PAGE = 10;

// ─── Asosiy sahifa komponenti ───────────────────────────────────────────────

export default function MemberProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>("payments");
  const [paymentPage, setPaymentPage] = useState(1);

  // Ma'lumotlarni yuklash
  const { data: member, isLoading: memberLoading } = useMember(id);
  const { data: paymentsData, isLoading: paymentsLoading } = useMemberPayments(id, {
    page: paymentPage,
    limit: PAYMENTS_PER_PAGE,
  });
  const { data: visitsData, isLoading: visitsLoading } = useMemberVisits(id, { limit: 50 });
  const { data: debtsData, isLoading: debtsLoading } = useMemberDebts(id);

  // Ma'lumotlarni ajratib olish
  const payments = paymentsData?.payments || [];
  const paymentsTotalPages = paymentsData?.totalPages || 1;
  const visits = visitsData?.visits || [];
  const visitsSummary = visitsData?.summary || { totalVisits: 0, avgDuration: 0 };
  const debts = debtsData?.debts || [];
  const debtsSummary = debtsData?.summary || { totalOutstanding: 0 };

  // ─── Loading holati ─────────────────────────────────────────────────────

  if (memberLoading) {
    return (
      <div className="space-y-6">
        {/* Orqaga tugma */}
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Orqaga
        </button>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <HeaderSkeleton />
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <TableSkeleton />
        </div>
      </div>
    );
  }

  // A'zo topilmadi
  if (!member) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Orqaga
        </button>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white px-6 py-16 shadow-sm">
          <XCircle className="mb-4 h-12 w-12 text-red-300" />
          <p className="text-lg font-medium text-gray-700">A&apos;zo topilmadi</p>
          <p className="mt-1 text-sm text-gray-400">Ushbu ID bilan a&apos;zo mavjud emas</p>
        </div>
      </div>
    );
  }

  // ─── A'zo ma'lumotlari ──────────────────────────────────────────────────

  const balance = member.balance || 0;
  const subscription = member.subscription;
  const remainingDays = subscription?.endDate ? getRemainingDays(subscription.endDate) : null;
  const isExpired = remainingDays !== null && remainingDays < 0;
  const totalOutstanding = debtsSummary.totalOutstanding || 0;

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Orqaga tugma */}
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Orqaga
      </button>

      {/* ────── Header ────── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          {/* Avatar */}
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">
            {getInitials(member.fullName)}
          </div>

          {/* Ism, status, kontakt */}
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{member.fullName}</h1>
              <span
                className={cn(
                  "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium",
                  getStatusColor(member.status)
                )}
              >
                {getStatusText(member.status)}
              </span>
              {member.memberId && (
                <span className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 font-mono tracking-wider">
                  {member.memberId}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {member.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {member.phone}
                </span>
              )}
              {member.email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {member.email}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Ro&apos;yxatdan o&apos;tgan: {formatDate(member.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ────── Statistika kartalar ────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Balans */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                balance > 0 ? "bg-emerald-100" : balance < 0 ? "bg-red-100" : "bg-gray-100"
              )}
            >
              <Wallet
                className={cn(
                  "h-5 w-5",
                  balance > 0 ? "text-emerald-600" : balance < 0 ? "text-red-600" : "text-gray-400"
                )}
              />
            </div>
            <div>
              <p className="text-xs text-gray-500">Balans</p>
              <p
                className={cn(
                  "text-lg font-bold",
                  balance > 0 ? "text-emerald-600" : balance < 0 ? "text-red-600" : "text-gray-400"
                )}
              >
                {formatCurrency(balance)}
              </p>
            </div>
          </div>
        </div>

        {/* Abonement */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                isExpired ? "bg-red-100" : subscription ? "bg-blue-100" : "bg-gray-100"
              )}
            >
              <CreditCard
                className={cn(
                  "h-5 w-5",
                  isExpired ? "text-red-600" : subscription ? "text-blue-600" : "text-gray-400"
                )}
              />
            </div>
            <div>
              <p className="text-xs text-gray-500">Abonement</p>
              {subscription ? (
                <div>
                  <p className={cn("text-lg font-bold", isExpired ? "text-red-600" : "text-gray-900")}>
                    {getSubscriptionText(subscription.type)}
                  </p>
                  <p className={cn("text-xs", isExpired ? "text-red-500" : "text-gray-400")}>
                    {isExpired
                      ? "Tugagan"
                      : remainingDays === 0
                        ? "Bugun tugaydi"
                        : `${remainingDays} kun qoldi`}
                  </p>
                </div>
              ) : (
                <p className="text-lg font-bold text-gray-400">Yo&apos;q</p>
              )}
            </div>
          </div>
        </div>

        {/* Tashriflar */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Tashriflar</p>
              {visitsLoading ? (
                <div className="h-5 w-12 animate-pulse rounded bg-gray-200" />
              ) : (
                <p className="text-lg font-bold text-gray-900">{visitsSummary.totalVisits}</p>
              )}
            </div>
          </div>
        </div>

        {/* Qarzlar */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                totalOutstanding > 0 ? "bg-red-100" : "bg-emerald-100"
              )}
            >
              <AlertTriangle
                className={cn(
                  "h-5 w-5",
                  totalOutstanding > 0 ? "text-red-600" : "text-emerald-600"
                )}
              />
            </div>
            <div>
              <p className="text-xs text-gray-500">Qarzlar</p>
              {debtsLoading ? (
                <div className="h-5 w-12 animate-pulse rounded bg-gray-200" />
              ) : totalOutstanding > 0 ? (
                <p className="text-lg font-bold text-red-600">{formatCurrency(totalOutstanding)}</p>
              ) : (
                <p className="text-lg font-bold text-emerald-600">Qarz yo&apos;q</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ────── Tablar ────── */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* Tab sarlavhalar */}
        <div className="flex border-b border-gray-100">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors sm:flex-none",
                  isActive
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab kontent */}
        <div className="p-4 sm:p-6">
          {activeTab === "payments" && (
            <PaymentsTab
              payments={payments}
              isLoading={paymentsLoading}
              page={paymentPage}
              totalPages={paymentsTotalPages}
              onPageChange={setPaymentPage}
            />
          )}
          {activeTab === "visits" && (
            <VisitsTab visits={visits} isLoading={visitsLoading} summary={visitsSummary} />
          )}
          {activeTab === "debts" && (
            <DebtsTab debts={debts} isLoading={debtsLoading} />
          )}
          {activeTab === "info" && (
            <InfoTab member={member} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tab 1: To'lovlar ───────────────────────────────────────────────────────

interface PaymentsTabProps {
  payments: any[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function PaymentsTab({ payments, isLoading, page, totalPages, onPageChange }: PaymentsTabProps) {
  if (isLoading) {
    return <TableSkeleton rows={5} cols={5} />;
  }

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <CreditCard className="mb-3 h-10 w-10 text-gray-300" />
        <p className="text-sm font-medium text-gray-500">To&apos;lovlar mavjud emas</p>
        <p className="mt-1 text-xs text-gray-400">Bu a&apos;zoning to&apos;lovlari hali yo&apos;q</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="whitespace-nowrap pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Sana
              </th>
              <th className="whitespace-nowrap pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Tavsif
              </th>
              <th className="whitespace-nowrap pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Summa
              </th>
              <th className="whitespace-nowrap pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Turi
              </th>
              <th className="whitespace-nowrap pb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                To&apos;lov usuli
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {payments.map((payment: any) => (
              <tr key={payment._id} className="transition-colors hover:bg-gray-50">
                <td className="whitespace-nowrap py-3 pr-4 text-sm text-gray-600">
                  {formatDate(payment.createdAt)}
                </td>
                <td className="py-3 pr-4 text-sm text-gray-700">
                  {payment.description || payment.category || "—"}
                </td>
                <td className="whitespace-nowrap py-3 pr-4 text-sm font-semibold">
                  <span className={payment.type === "income" ? "text-emerald-600" : "text-red-600"}>
                    {payment.type === "income" ? "+" : "-"}
                    {formatCurrency(payment.amount)}
                  </span>
                </td>
                <td className="whitespace-nowrap py-3 pr-4">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium",
                      payment.type === "income"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    )}
                  >
                    {payment.type === "income" ? "Kirim" : "Chiqim"}
                  </span>
                </td>
                <td className="whitespace-nowrap py-3 text-sm text-gray-600">
                  {getPaymentMethodText(payment.paymentMethod)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-500">
            Sahifa {page} / {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Oldingi
            </button>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Keyingi
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab 2: Tashriflar ──────────────────────────────────────────────────────

interface VisitsTabProps {
  visits: any[];
  isLoading: boolean;
  summary: { totalVisits: number; avgDuration: number };
}

function VisitsTab({ visits, isLoading, summary }: VisitsTabProps) {
  if (isLoading) {
    return <TableSkeleton rows={5} cols={4} />;
  }

  if (visits.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <Activity className="mb-3 h-10 w-10 text-gray-300" />
        <p className="text-sm font-medium text-gray-500">Tashriflar mavjud emas</p>
        <p className="mt-1 text-xs text-gray-400">Bu a&apos;zo hali zalga kirmagan</p>
      </div>
    );
  }

  return (
    <div>
      {/* Tashrif statistikasi */}
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="inline-flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-1.5 text-sm">
          <TrendingUp className="h-4 w-4 text-purple-600" />
          <span className="text-gray-600">Jami:</span>
          <span className="font-semibold text-purple-700">{summary.totalVisits} ta</span>
        </div>
        {summary.avgDuration > 0 && (
          <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-sm">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-gray-600">O&apos;rtacha:</span>
            <span className="font-semibold text-blue-700">{formatDuration(summary.avgDuration)}</span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="whitespace-nowrap pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Sana
              </th>
              <th className="whitespace-nowrap pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Kirish vaqti
              </th>
              <th className="whitespace-nowrap pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Chiqish vaqti
              </th>
              <th className="whitespace-nowrap pb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Davomiylik
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {visits.map((visit: any) => (
              <tr key={visit._id} className="transition-colors hover:bg-gray-50">
                <td className="whitespace-nowrap py-3 pr-4 text-sm text-gray-600">
                  {formatDate(visit.checkInTime)}
                </td>
                <td className="whitespace-nowrap py-3 pr-4 text-sm text-gray-700 font-medium">
                  {formatTime(visit.checkInTime)}
                </td>
                <td className="whitespace-nowrap py-3 pr-4 text-sm">
                  {visit.checkOutTime ? (
                    <span className="text-gray-700 font-medium">{formatTime(visit.checkOutTime)}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Hali zalda
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap py-3 text-sm text-gray-600">
                  {(() => {
                    if (visit.duration) return formatDuration(visit.duration);
                    if (visit.checkOutTime) {
                      const mins = Math.round(
                        (new Date(visit.checkOutTime).getTime() - new Date(visit.checkInTime).getTime()) / 60000
                      );
                      return formatDuration(mins > 0 ? mins : 1);
                    }
                    // Hali zalda — hozirgi davomiylikni ko'rsatish
                    const elapsed = Math.round(
                      (Date.now() - new Date(visit.checkInTime).getTime()) / 60000
                    );
                    return (
                      <span className="text-emerald-600 font-medium">
                        {formatDuration(elapsed > 0 ? elapsed : 1)}
                      </span>
                    );
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tab 3: Qarzlar ─────────────────────────────────────────────────────────

interface DebtsTabProps {
  debts: any[];
  isLoading: boolean;
}

function DebtsTab({ debts, isLoading }: DebtsTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (debts.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <CheckCircle className="mb-3 h-10 w-10 text-emerald-300" />
        <p className="text-sm font-medium text-gray-500">Qarzlar yo&apos;q</p>
        <p className="mt-1 text-xs text-gray-400">Bu a&apos;zoning hech qanday qarzi mavjud emas</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {debts.map((debt: any) => {
        const statusStyle = getDebtStatusStyle(debt.status);
        return (
          <div
            key={debt._id}
            className="rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{debt.personName}</p>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium",
                      statusStyle.color
                    )}
                  >
                    {statusStyle.text}
                  </span>
                </div>
                {debt.description && (
                  <p className="text-sm text-gray-500">{debt.description}</p>
                )}
                <p className="text-xs text-gray-400">{formatDate(debt.createdAt)}</p>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-red-600">
                  {formatCurrency(debt.remainingAmount)}
                </p>
                {debt.paidAmount > 0 && (
                  <p className="text-xs text-gray-400">
                    Jami: {formatCurrency(debt.amount)} | To&apos;langan: {formatCurrency(debt.paidAmount)}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tab 4: Ma'lumotlar ─────────────────────────────────────────────────────

interface InfoTabProps {
  member: any;
}

function InfoTab({ member }: InfoTabProps) {
  const subscription = member.subscription;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Shaxsiy ma'lumotlar */}
      <div className="rounded-xl border border-gray-100 p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <User className="h-4 w-4 text-blue-600" />
          Shaxsiy ma&apos;lumotlar
        </h3>
        <div className="space-y-3">
          <InfoRow icon={User} label="To'liq ism" value={member.fullName} />
          <InfoRow icon={Phone} label="Telefon" value={member.phone || "—"} />
          <InfoRow icon={Mail} label="Email" value={member.email || "Ko'rsatilmagan"} />
          <InfoRow
            icon={Calendar}
            label="Tug'ilgan sana"
            value={member.dateOfBirth ? formatDate(member.dateOfBirth) : "Ko'rsatilmagan"}
          />
          <InfoRow icon={MapPin} label="Manzil" value={member.address || "Ko'rsatilmagan"} />
          <InfoRow icon={Calendar} label="Ro'yxatdan o'tgan" value={formatDate(member.createdAt)} />
        </div>
      </div>

      {/* Abonement ma'lumotlari */}
      <div className="rounded-xl border border-gray-100 p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <CreditCard className="h-4 w-4 text-blue-600" />
          Abonement ma&apos;lumotlari
        </h3>
        {subscription ? (
          <div className="space-y-3">
            <InfoRow
              icon={FileText}
              label="Turi"
              value={getSubscriptionText(subscription.type)}
            />
            <InfoRow
              icon={Calendar}
              label="Boshlanish sanasi"
              value={formatDate(subscription.startDate)}
            />
            <InfoRow
              icon={Calendar}
              label="Tugash sanasi"
              value={formatDate(subscription.endDate)}
            />
            <InfoRow
              icon={Wallet}
              label="Narxi"
              value={formatCurrency(subscription.price)}
            />
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500">Holati</span>
              <span
                className={cn(
                  "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium",
                  subscription.status === "active"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                )}
              >
                {subscription.status === "active" ? "Faol" : "Tugagan"}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 text-center">
            <CreditCard className="mb-2 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">Abonement mavjud emas</p>
          </div>
        )}
      </div>

      {/* QR kod */}
      {member.qrCode && (
        <div className="rounded-xl border border-gray-100 p-5 lg:col-span-2">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <QrCode className="h-4 w-4 text-blue-600" />
            QR kod
          </h3>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="flex-shrink-0 rounded-xl border-2 border-dashed border-gray-200 p-3">
              <img
                src={member.qrCode}
                alt={`${member.fullName} QR kodi`}
                className="h-40 w-40"
              />
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-500">
                Bu QR kod orqali a&apos;zo tez kirish va chiqish qilishi mumkin.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => downloadQrCode(member.qrCode, member.fullName)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Download className="h-4 w-4" />
                  Yuklab olish
                </button>
                <button
                  type="button"
                  onClick={() =>
                    printQrCard(member.qrCode, member.fullName, member.phone, member.memberId)
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  <Printer className="h-4 w-4" />
                  Chop etish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Yordamchi InfoRow komponenti ───────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="flex items-center gap-2 text-sm text-gray-500">
        <Icon className="h-3.5 w-3.5 text-gray-400" />
        {label}
      </span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}
