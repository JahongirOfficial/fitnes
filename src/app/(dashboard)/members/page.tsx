"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  UserPlus,
  Pencil,
  Trash2,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Users,
  Wallet,
  Eye,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useMembers, useCreateMember, useUpdateMember, useDeleteMember } from "@/lib/hooks";
import { useDebounce } from "@/lib/useDebounce";
import { TableRowSkeleton, StatCardSkeleton } from "@/components/ui/Skeleton";
import MemberModal from "@/components/members/MemberModal";
import PaymentModal from "@/components/cashier/PaymentModal";
import { api } from "@/lib/api";

type MemberStatus = "active" | "expired" | "inactive";

interface Member {
  _id: string;
  fullName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  address?: string;
  memberId?: string;
  qrCode?: string;
  status: MemberStatus;
  balance?: number;
  subscription?: {
    type: string;
    startDate: string;
    endDate: string;
    price: number;
    status: string;
  };
  createdAt: string;
}

const statusLabel: Record<MemberStatus, string> = {
  active: "Faol",
  expired: "Muddati tugagan",
  inactive: "Nofaol",
};

const statusColor: Record<MemberStatus, string> = {
  active: "bg-green-100 text-green-700",
  expired: "bg-red-100 text-red-700",
  inactive: "bg-gray-100 text-gray-600",
};

const subscriptionLabel: Record<string, string> = {
  daily: "Kunlik",
  monthly: "Oylik",
  yearly: "Yillik",
};

const subscriptionColor: Record<string, string> = {
  daily: "bg-orange-100 text-orange-700",
  monthly: "bg-blue-100 text-blue-700",
  yearly: "bg-purple-100 text-purple-700",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 12) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`;
  }
  return phone;
}

const ITEMS_PER_PAGE = 10;

export default function MembersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchQuery, 500);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [selectedMember, setSelectedMember] = useState<Member | undefined>(undefined);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMember, setPaymentMember] = useState<Member | null>(null);

  const queryParams = {
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    ...(subscriptionFilter !== "all" ? { subscription: subscriptionFilter } : {}),
  };

  const { data, isLoading } = useMembers(queryParams);
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const deleteMember = useDeleteMember();

  const members: Member[] = data?.members || [];
  const stats = data?.stats || { total: 0, active: 0, expired: 0, inactive: 0 };
  const totalPages = Math.max(1, Math.ceil(stats.total / ITEMS_PER_PAGE));

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };
  const handleSubscriptionChange = (value: string) => {
    setSubscriptionFilter(value);
    setCurrentPage(1);
  };

  const openCreate = () => {
    setSelectedMember(undefined);
    setModalMode("create");
    setModalOpen(true);
  };
  const openView = (member: Member) => {
    setSelectedMember(member);
    setModalMode("view");
    setModalOpen(true);
  };
  const openEdit = (member: Member) => {
    setSelectedMember(member);
    setModalMode("edit");
    setModalOpen(true);
  };
  const handleDelete = async (member: Member) => {
    if (!confirm(`${member.fullName} ni o'chirmoqchimisiz?`)) return;
    try {
      await deleteMember.mutateAsync(member._id);
      toast("success", `${member.fullName} o'chirildi`);
    } catch (err: any) {
      toast("error", err.message || "O'chirishda xatolik");
    }
  };
  const openPayment = (member: Member) => {
    setPaymentMember(member);
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (data: any) => {
    if (data._skipCreate) {
      toast("success", "Mahsulot sotildi");
      return;
    }
    await api.createPayment(data);
    toast("success", "To'lov qo'shildi");
  };

  const handleModalSubmit = async (data: any) => {
    if (modalMode === "create") {
      await createMember.mutateAsync(data);
      toast("success", "Yangi a'zo qo'shildi");
    } else if (modalMode === "edit" && selectedMember) {
      await updateMember.mutateAsync({ id: selectedMember._id, data });
      toast("success", "A'zo ma'lumotlari yangilandi");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <UserPlus className="h-4 w-4" />
          + Yangi A&apos;zo
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col items-stretch gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Ism, telefon yoki email bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 sm:w-auto"
        >
          <option value="all">Barchasi</option>
          <option value="active">Faol</option>
          <option value="expired">Muddati tugagan</option>
          <option value="inactive">Nofaol</option>
        </select>
        <select
          value={subscriptionFilter}
          onChange={(e) => handleSubscriptionChange(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 sm:w-auto"
        >
          <option value="all">Barchasi</option>
          <option value="daily">Kunlik</option>
          <option value="monthly">Oylik</option>
          <option value="yearly">Yillik</option>
        </select>
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`rounded-lg p-2 transition-colors ${
              viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`rounded-lg p-2 transition-colors ${
              viewMode === "table" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Jami A'zolar", value: stats.total, color: "bg-blue-100", iconColor: "text-blue-600", bar: "bg-blue-500" },
            { label: "Faol", value: stats.active, color: "bg-green-100", iconColor: "text-green-600", bar: "bg-green-500" },
            { label: "Muddati tugagan", value: stats.expired, color: "bg-red-100", iconColor: "text-red-600", bar: "bg-red-500" },
            { label: "Nofaol", value: stats.inactive, color: "bg-gray-100", iconColor: "text-gray-500", bar: "bg-gray-400" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 sm:gap-4 rounded-2xl bg-white p-3 sm:p-4 shadow-sm">
              <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl ${s.color}`}>
                <Users className={`h-5 w-5 sm:h-6 sm:w-6 ${s.iconColor}`} />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">{s.label}</p>
                <p className="text-lg font-bold text-gray-900 sm:text-2xl">{s.value}</p>
              </div>
              <div className={`ml-auto h-full w-1 rounded-full ${s.bar}`} />
            </div>
          ))}
        </div>
      )}

      {/* Loading State / Table / Grid */}
      {isLoading ? (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">#</th>
                <th className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Ism</th>
                <th className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Maxsus ID</th>
                <th className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Telefon</th>
                <th className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Abonement</th>
                <th className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Holat</th>
                <th className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Muddat</th>
                <th className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Balans</th>
                <th className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={9} />
              ))}
            </tbody>
          </table>
        </div>
      ) : viewMode === "table" ? (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">#</th>
                  <th className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Ism</th>
                  <th className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Maxsus ID</th>
                  <th className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Telefon</th>
                  <th className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Abonement</th>
                  <th className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Holat</th>
                  <th className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Muddat</th>
                  <th className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Balans</th>
                  <th className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">To&apos;lov</th>
                  <th className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-3 sm:px-6 py-12 text-center text-gray-400">
                      Hech qanday a&apos;zo topilmadi
                    </td>
                  </tr>
                ) : (
                  members.map((member, idx) => (
                    <tr key={member._id} className="transition-colors hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/members/${member._id}`)}>
                      <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-500">
                        {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                      </td>
                      <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                            {getInitials(member.fullName)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{member.fullName}</p>
                            {member.email && <p className="text-xs text-gray-400">{member.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4">
                        {member.memberId ? (
                          <span className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 font-mono tracking-wider">
                            {member.memberId}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-300">&mdash;</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-600">{formatPhone(member.phone)}</td>
                      <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4">
                        {member.subscription?.type ? (
                          <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ${subscriptionColor[member.subscription.type] || ""}`}>
                            {subscriptionLabel[member.subscription.type] || member.subscription.type}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4">
                        <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ${statusColor[member.status]}`}>
                          {statusLabel[member.status]}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-600">{formatDate(member.subscription?.endDate)}</td>
                      <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4">
                        <span className={`text-sm font-semibold ${(member.balance || 0) > 0 ? "text-emerald-600" : "text-gray-400"}`}>
                          {(member.balance || 0) > 0
                            ? new Intl.NumberFormat("uz-UZ").format(member.balance!) + " so'm"
                            : "0"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => openPayment(member)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                        >
                          <Wallet className="h-3.5 w-3.5" />
                          To&apos;lov
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-3 sm:px-6 py-3 sm:py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <button type="button" title="Ko'rish" onClick={() => router.push(`/members/${member._id}`)} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button type="button" title="Tahrirlash" onClick={() => openEdit(member)} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-yellow-50 hover:text-yellow-600">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button type="button" title="O'chirish" onClick={() => handleDelete(member)} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600">
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
            <p className="hidden text-sm text-gray-500 sm:block">Jami {stats.total} ta a&apos;zo</p>
            <p className="text-sm text-gray-500 sm:hidden">{stats.total} ta</p>
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
                    page === currentPage ? "bg-blue-600 text-white" : "hidden text-gray-600 hover:bg-gray-50 sm:inline-block"
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
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.length === 0 ? (
            <div className="col-span-full rounded-2xl bg-white px-6 py-12 text-center text-gray-400 shadow-sm">
              Hech qanday a&apos;zo topilmadi
            </div>
          ) : (
            members.map((member) => (
              <div key={member._id} className="rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md cursor-pointer" onClick={() => router.push(`/members/${member._id}`)}>
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                      {getInitials(member.fullName)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.fullName}</p>
                      {member.memberId && <span className="inline-flex items-center mt-0.5 rounded-lg bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 font-mono tracking-wider">{member.memberId}</span>}
                      {member.email && <p className="text-xs text-gray-400">{member.email}</p>}
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ${statusColor[member.status]}`}>
                    {statusLabel[member.status]}
                  </span>
                </div>
                <div className="mb-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Telefon</span>
                    <span className="text-gray-700">{formatPhone(member.phone)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Abonement</span>
                    {member.subscription?.type ? (
                      <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ${subscriptionColor[member.subscription.type] || ""}`}>
                        {subscriptionLabel[member.subscription.type] || member.subscription.type}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Muddat</span>
                    <span className="text-gray-700">{formatDate(member.subscription?.endDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Balans</span>
                    <span className={`font-semibold ${(member.balance || 0) > 0 ? "text-emerald-600" : "text-gray-400"}`}>
                      {(member.balance || 0) > 0
                        ? new Intl.NumberFormat("uz-UZ").format(member.balance!) + " so'm"
                        : "0 so'm"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-t border-gray-100 pt-3" onClick={(e) => e.stopPropagation()}>
                  <button type="button" onClick={() => openPayment(member)} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100">
                    <Wallet className="h-3.5 w-3.5" />
                    To&apos;lov
                  </button>
                  <div className="ml-auto flex items-center gap-1">
                    <button type="button" title="Ko'rish" onClick={() => router.push(`/members/${member._id}`)} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button type="button" title="Tahrirlash" onClick={() => openEdit(member)} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-yellow-50 hover:text-yellow-600">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" title="O'chirish" onClick={() => handleDelete(member)} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {stats.total > ITEMS_PER_PAGE && (
            <div className="col-span-full flex items-center justify-between rounded-2xl bg-white px-4 py-4 shadow-sm sm:px-6">
              <p className="text-sm text-gray-500">{stats.total} ta</p>
              <div className="flex items-center gap-1 sm:gap-2">
                <button type="button" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 sm:px-3">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 sm:px-3">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <MemberModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleModalSubmit} member={selectedMember} mode={modalMode} />
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => { setPaymentModalOpen(false); setPaymentMember(null); }}
        onSubmit={handlePaymentSubmit}
        type="income"
        preselectedMember={paymentMember}
      />
    </div>
  );
}
