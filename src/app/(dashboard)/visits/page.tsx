"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  ScanLine,
  Users,
  UserCheck,
  Clock,
  LogOut,
  ChevronRight,
  Activity,
  Loader2,
  Search,
  QrCode,
  BadgeCheck,
  BadgeX,
  Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/lib/useDebounce";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { useVisits, useCheckIn, useCheckOut, useCheckOutByMember, useMembers, useDailyPay } from "@/lib/hooks";
import { StatCardSkeleton, TableRowSkeleton } from "@/components/ui/Skeleton";
import Modal from "@/components/ui/Modal";

const QrScannerModal = dynamic(
  () => import("@/components/visits/QrScannerModal"),
  { ssr: false }
);

function getInitials(name: string): string {
  return name.split(" ").map((part) => part[0]).join("").toUpperCase();
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) return `${hours} soat ${mins} daqiqa`;
  if (hours > 0) return `${hours} soat`;
  return `${mins} daqiqa`;
}

function getElapsedMinutes(checkInTime: string): number {
  const now = new Date();
  const checkIn = new Date(checkInTime);
  return Math.max(0, Math.floor((now.getTime() - checkIn.getTime()) / 60000));
}

export default function VisitsPage() {
  const { toast } = useToast();
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const debouncedMemberSearch = useDebounce(memberSearch, 500);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [qrScanMode, setQrScanMode] = useState<"checkin" | "checkout" | null>(null);

  const [dailyPayModal, setDailyPayModal] = useState<{
    member: any;
    requiredAmount: number;
    paidAmount: number;
    paymentMethod: string;
  } | null>(null);

  const { data, isLoading } = useVisits();
  const { data: dailyMembersData } = useMembers({ subscription: "daily", limit: 100 });
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const checkOutByMember = useCheckOutByMember();
  const dailyPay = useDailyPay();

  const visits = data?.visits || [];
  const summary = data?.summary || { currentlyInGym: 0, totalToday: 0, avgDuration: 0 };
  const activeMembers = visits.filter((v: any) => !v.checkOutTime);
  const dailyMembers = dailyMembersData?.members || [];

  function isPaidToday(member: any): boolean {
    if (!member.dailyPaidDate) return false;
    const paid = new Date(member.dailyPaidDate);
    const today = new Date();
    return paid.getFullYear() === today.getFullYear() &&
      paid.getMonth() === today.getMonth() &&
      paid.getDate() === today.getDate();
  }

  const handleDailyPay = async () => {
    if (!dailyPayModal) return;
    try {
      const result = await dailyPay.mutateAsync({
        id: dailyPayModal.member._id,
        data: {
          amount: dailyPayModal.paidAmount,
          requiredAmount: dailyPayModal.requiredAmount,
          paymentMethod: dailyPayModal.paymentMethod,
        },
      });
      if (result?.debtCreated) {
        const amt = new Intl.NumberFormat("uz-UZ").format(result.debtAmount) + " so'm";
        toast("warning", `${dailyPayModal.member.fullName} — to'lov qayd etildi. Qarz: ${amt}`);
      } else {
        toast("success", `${dailyPayModal.member.fullName} — bugungi to'lov qayd etildi`);
      }
      setDailyPayModal(null);
    } catch (err: any) {
      toast("error", err.message || "To'lov qayd etishda xatolik");
    }
  };

  // Debounced auto-search
  useEffect(() => {
    if (!debouncedMemberSearch.trim()) {
      setSearchResults([]);
      return;
    }
    const searchMembers = async () => {
      setSearching(true);
      try {
        const data = await api.getMembers({ search: debouncedMemberSearch.trim(), limit: 10 });
        setSearchResults(data.members || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    };
    searchMembers();
  }, [debouncedMemberSearch]);

  const handleCheckOut = async (visitId: string) => {
    try {
      await checkOut.mutateAsync(visitId);
      toast("success", "Chiqish qayd etildi");
    } catch (err: any) {
      toast("error", err.message || "Chiqish qayd etishda xatolik");
    }
  };

  const handleCheckIn = async (memberId: string) => {
    try {
      const result = await checkIn.mutateAsync(memberId);
      if (result?.debtCreated) {
        const amt = new Intl.NumberFormat("uz-UZ").format(result.debtAmount) + " so'm";
        toast("warning", `Kirish qayd etildi. Obonement muddati o'tgan (${result.extraDays} kun). Qarz: ${amt}`);
      } else {
        toast("success", "Kirish qayd etildi");
      }
      setScanModalOpen(false);
      setMemberSearch("");
      setSearchResults([]);
    } catch (err: any) {
      toast("error", err.message || "Kirish qayd etishda xatolik");
    }
  };

  const handleQrCheckIn = async (memberId: string, memberName: string) => {
    const result = await checkIn.mutateAsync(memberId);
    if (result?.debtCreated) {
      const amt = new Intl.NumberFormat("uz-UZ").format(result.debtAmount) + " so'm";
      toast("warning", `${memberName} kirish qayd etildi. Obonement muddati o'tgan (${result.extraDays} kun). Qarz: ${amt}`);
    } else {
      toast("success", `${memberName} kirish qayd etildi`);
    }
  };

  const handleQrCheckOut = async (memberId: string, memberName: string) => {
    await checkOutByMember.mutateAsync(memberId);
    toast("success", `${memberName} chiqish qayd etildi`);
  };

  const summaryCards = [
    { title: "Hozir Zalda", value: `${summary.currentlyInGym || activeMembers.length} kishi`, icon: Users, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-600", hasPulse: true },
    { title: "Bugungi Tashriflar", value: `${summary.totalToday || visits.length} ta`, icon: UserCheck, iconBg: "bg-blue-500/10", iconColor: "text-blue-600", hasPulse: false },
    { title: "O'rtacha Vaqt", value: `${summary.avgDuration || 0} daqiqa`, icon: Clock, iconBg: "bg-purple-500/10", iconColor: "text-purple-600", hasPulse: false },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Tashriflar</h1>
          <p className="text-sm text-gray-500 mt-1">Kirish va chiqish qaydlari</p>
        </div>
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          <button onClick={() => setQrScanMode("checkin")}
            className={cn("inline-flex items-center gap-2 px-4 py-2.5 rounded-xl",
              "bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold",
              "shadow-lg shadow-emerald-500/25 transition-all duration-200")}>
            <QrCode className="w-4 h-4" />
            QR Kirish
          </button>
          <button onClick={() => setQrScanMode("checkout")}
            className={cn("inline-flex items-center gap-2 px-4 py-2.5 rounded-xl",
              "bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold",
              "shadow-lg shadow-amber-500/25 transition-all duration-200")}>
            <QrCode className="w-4 h-4" />
            QR Chiqish
          </button>
          <button onClick={() => setScanModalOpen(true)}
            className={cn("inline-flex items-center gap-2 px-4 py-2.5 rounded-xl",
              "bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold",
              "shadow-lg shadow-blue-500/25 transition-all duration-200")}>
            <ScanLine className="w-4 h-4" />
            Kirish Qayd Etish
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
          : summaryCards.map((card, index) => (
              <div key={card.title} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm card-hover animate-fade-in"
                style={{ animationDelay: `${index * 80}ms` }}>
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", card.iconBg)}>
                    <card.icon className={cn("w-6 h-6", card.iconColor)} />
                  </div>
                  {card.hasPulse && (
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                    </span>
                  )}
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.title}</p>
              </div>
            ))}
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap px-4 py-3">A&apos;zo</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap px-4 py-3">Kirish</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap px-4 py-3">Chiqish</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap px-4 py-3">Davomiylik</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap px-4 py-3">Holat</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={5} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          {/* Kunlik a'zolar */}
          {dailyMembers.length > 0 && (
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm animate-fade-in" style={{ animationDelay: "200ms" }}>
              <div className="flex items-center gap-3 mb-4 sm:mb-5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Banknote className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Kunlik a&apos;zolar</h2>
                  <p className="text-xs text-gray-500">
                    {dailyMembers.filter(isPaidToday).length}/{dailyMembers.length} ta bugun to&apos;lov qilgan
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {dailyMembers.map((member: any) => {
                  const paid = isPaidToday(member);
                  return (
                    <div key={member._id} className={cn(
                      "p-4 rounded-xl border transition-all duration-200",
                      paid
                        ? "border-emerald-100 bg-emerald-50/40"
                        : "border-amber-100 bg-amber-50/30"
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold",
                          paid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                          {getInitials(member.fullName)}
                        </div>
                        {paid ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <BadgeCheck className="w-3 h-3" /> To&apos;ladi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                            <BadgeX className="w-3 h-3" /> To&apos;lamadi
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-0.5 truncate">{member.fullName}</p>
                      <p className="text-xs text-gray-500 mb-3">
                        {new Intl.NumberFormat("uz-UZ").format(member.subscription?.price || 0)} so&apos;m/kun
                      </p>
                      {!paid && (
                        <button
                          onClick={() => setDailyPayModal({
                            member,
                            requiredAmount: member.subscription?.price || 30000,
                            paidAmount: member.subscription?.price || 30000,
                            paymentMethod: "cash",
                          })}
                          className={cn(
                            "w-full inline-flex items-center justify-center gap-1.5",
                            "px-3 py-1.5 rounded-lg text-xs font-semibold",
                            "bg-amber-500 hover:bg-amber-600 text-white transition-all"
                          )}
                        >
                          <Banknote className="w-3.5 h-3.5" />
                          To&apos;lov qildi
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Currently in Gym */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm animate-fade-in" style={{ animationDelay: "240ms" }}>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Hozir zalda bo&apos;lganlar</h2>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            </div>

            {activeMembers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">Hozirda zalda hech kim yo&apos;q</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {activeMembers.map((member: any) => {
                  const elapsed = getElapsedMinutes(member.checkInTime);
                  return (
                    <div key={member._id}
                      className={cn("relative p-4 rounded-xl border border-emerald-100",
                        "bg-gradient-to-br from-emerald-50/50 to-white",
                        "hover:shadow-md hover:border-emerald-200 transition-all duration-200")}>
                      <div className="absolute top-3 right-3">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                        </span>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                        <span className="text-sm font-bold text-green-600">{getInitials(member.memberName || "")}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-2">{member.memberName}</p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Kirish: {new Date(member.checkInTime).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mb-3">
                        <Activity className="w-3.5 h-3.5" />
                        <span>{formatDuration(elapsed)}</span>
                      </div>
                      <button onClick={() => handleCheckOut(member._id)}
                        className={cn("w-full inline-flex items-center justify-center gap-1.5",
                          "px-3 py-1.5 rounded-lg text-xs font-semibold",
                          "border border-red-200 text-red-600",
                          "hover:bg-red-50 hover:border-red-300 transition-all duration-200")}>
                        <LogOut className="w-3.5 h-3.5" />
                        Chiqish
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Visit History Table */}
          <div className="bg-white rounded-2xl shadow-sm animate-fade-in" style={{ animationDelay: "320ms" }}>
            <div className="flex items-center justify-between p-4 sm:p-6 pb-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <ChevronRight className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Bugungi tashriflar tarixi</h2>
                  <p className="text-xs text-gray-500">Barcha kirish va chiqish qaydlari</p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 pt-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap pb-3 pl-4">A&apos;zo</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap pb-3">Kirish</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap pb-3">Chiqish</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap pb-3">Davomiylik</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap pb-3 pr-4">Holat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {visits.map((visit: any) => {
                      const isActive = !visit.checkOutTime;
                      const elapsed = isActive ? getElapsedMinutes(visit.checkInTime) : visit.duration;
                      return (
                        <tr key={visit._id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3 pl-4">
                            <div className="flex items-center gap-3">
                              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", isActive ? "bg-green-100" : "bg-gray-100")}>
                                <span className={cn("text-xs font-bold", isActive ? "text-green-600" : "text-gray-500")}>
                                  {getInitials(visit.memberName || "")}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-gray-900">{visit.memberName}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-1.5 text-sm text-gray-700">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              {new Date(visit.checkInTime).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </td>
                          <td className="py-3">
                            {visit.checkOutTime ? (
                              <div className="flex items-center gap-1.5 text-sm text-gray-700">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                {new Date(visit.checkOutTime).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>
                          <td className="py-3">
                            <span className={cn("text-sm", isActive ? "text-emerald-600 font-medium" : "text-gray-700")}>
                              {formatDuration(elapsed || 0)}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            {isActive ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                                </span>
                                Zalda
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                Tugallangan
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {visits.length === 0 && (
                      <tr><td colSpan={5} className="py-12 text-center text-gray-400 text-sm">Bugungi tashriflar mavjud emas</td></tr>
                    )}
                  </tbody>
                </table>
            </div>
          </div>
        </>
      )}

      {/* Check-in Modal */}
      <Modal isOpen={scanModalOpen} onClose={() => { setScanModalOpen(false); setMemberSearch(""); setSearchResults([]); }}
        title="A'zo Kirishini Qayd Etish" size="md">
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-xl text-center">
            <ScanLine className="w-12 h-12 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">QR kod skanerlash yoki a&apos;zo ismini qidiring</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            {searching && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-500" />}
            <input type="text" value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="Ism yoki telefon bo'yicha qidiring..."
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
          </div>
          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searchResults.map((member: any) => (
                <button key={member._id} onClick={() => handleCheckIn(member._id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 hover:border-emerald-200 border border-transparent transition text-left">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-600">
                    {getInitials(member.fullName || "")}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{member.fullName}</p>
                    <p className="text-xs text-gray-500">{member.phone}</p>
                  </div>
                  <span className={cn("text-xs font-medium px-2 py-1 rounded-lg",
                    member.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                    {member.status === "active" ? "Faol" : "Nofaol"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* QR Scanner Modal */}
      {qrScanMode && (
        <QrScannerModal
          isOpen={!!qrScanMode}
          onClose={() => setQrScanMode(null)}
          onScanSuccess={qrScanMode === "checkin" ? handleQrCheckIn : handleQrCheckOut}
          mode={qrScanMode}
        />
      )}

      {/* Daily Pay Modal */}
      <Modal
        isOpen={!!dailyPayModal}
        onClose={() => setDailyPayModal(null)}
        title="Kunlik to'lovni qayd etish"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setDailyPayModal(null)}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
            >
              Bekor qilish
            </button>
            <button
              onClick={handleDailyPay}
              disabled={dailyPay.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 shadow-sm disabled:opacity-50 transition"
            >
              {dailyPay.isPending ? <Loader2 size={16} className="animate-spin" /> : <Banknote size={16} />}
              To&apos;lovni tasdiqlash
            </button>
          </>
        }
      >
        {dailyPayModal && (
          <div className="space-y-4">
            {/* A'zo info */}
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-700">
                {getInitials(dailyPayModal.member.fullName)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{dailyPayModal.member.fullName}</p>
                <p className="text-xs text-gray-500">Kunlik abonement</p>
              </div>
            </div>

            {/* To'lashi kerak */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                To&apos;lashi kerak (so&apos;m)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={new Intl.NumberFormat("uz-UZ").format(dailyPayModal.requiredAmount)}
                onChange={(e) => {
                  const num = Number(e.target.value.replace(/\s/g, "").replace(/,/g, "")) || 0;
                  setDailyPayModal((prev) => prev ? { ...prev, requiredAmount: num } : null);
                }}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Hozir to'layapti */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Hozir to&apos;layapti (so&apos;m)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={new Intl.NumberFormat("uz-UZ").format(dailyPayModal.paidAmount)}
                onChange={(e) => {
                  const num = Number(e.target.value.replace(/\s/g, "").replace(/,/g, "")) || 0;
                  setDailyPayModal((prev) => prev ? { ...prev, paidAmount: num } : null);
                }}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Qarz ogohlantirish */}
            {dailyPayModal.paidAmount < dailyPayModal.requiredAmount && dailyPayModal.requiredAmount > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                <span className="font-semibold">Qarz:</span>
                <span>
                  {new Intl.NumberFormat("uz-UZ").format(dailyPayModal.requiredAmount - dailyPayModal.paidAmount)} so&apos;m — qarz daftarchaga yoziladi
                </span>
              </div>
            )}

            {/* To'lov usuli */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">To&apos;lov usuli</label>
              <div className="flex gap-2">
                {[
                  { value: "cash", label: "Naqd" },
                  { value: "card", label: "Karta" },
                  { value: "transfer", label: "O'tkazma" },
                ].map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setDailyPayModal((prev) => prev ? { ...prev, paymentMethod: m.value } : null)}
                    className={cn(
                      "flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border",
                      dailyPayModal.paymentMethod === m.value
                        ? "border-amber-500 bg-amber-50 text-amber-700"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
