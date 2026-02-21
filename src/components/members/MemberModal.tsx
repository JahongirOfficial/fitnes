"use client";

import { useState, useEffect } from "react";
import { Loader2, QrCode, Save, UserPlus, Download, Printer } from "lucide-react";
import { downloadQrCode, printQrCard } from "@/lib/qr-utils";
import Modal from "@/components/ui/Modal";
import { api } from "@/lib/api";
import { cn, formatPhoneInput, unformatPhone, formatAmountInput, unformatAmount } from "@/lib/utils";

interface MemberFormData {
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  address: string;
  subscriptionType: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  subscriptionPrice: number;
  paymentMethod: string;
}

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  member?: any;
  mode: "create" | "edit" | "view";
}

const defaultPrices: Record<string, number> = {
  daily: 30000,
  monthly: 300000,
  yearly: 2500000,
};

function calculateEndDate(startDate: string, type: string): string {
  if (!startDate) return "";
  const date = new Date(startDate);
  if (type === "daily") date.setDate(date.getDate() + 1);
  else if (type === "monthly") date.setMonth(date.getMonth() + 1);
  else if (type === "yearly") date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split("T")[0];
}

export default function MemberModal({
  isOpen,
  onClose,
  onSubmit,
  member,
  mode,
}: MemberModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [settingsPrices, setSettingsPrices] = useState<Record<string, number>>(defaultPrices);
  const [form, setForm] = useState<MemberFormData>({
    fullName: "",
    phone: "+998",
    email: "",
    dateOfBirth: "",
    address: "",
    subscriptionType: "monthly",
    subscriptionStartDate: new Date().toISOString().split("T")[0],
    subscriptionEndDate: "",
    subscriptionPrice: 300000,
    paymentMethod: "cash",
  });

  // Load settings prices when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const loadPricing = async () => {
      try {
        const settings = await api.getSettings();
        if (settings?.pricing) {
          setSettingsPrices({
            daily: settings.pricing.daily || 30000,
            monthly: settings.pricing.monthly || 300000,
            yearly: settings.pricing.yearly || 2500000,
          });
        }
      } catch {
        /* use defaults */
      }
    };
    loadPricing();
  }, [isOpen]);

  useEffect(() => {
    if (member && (mode === "edit" || mode === "view")) {
      setForm({
        fullName: member.fullName || "",
        phone: member.phone ? formatPhoneInput(member.phone) : "+998",
        email: member.email || "",
        dateOfBirth: member.dateOfBirth || "",
        address: member.address || "",
        subscriptionType: member.subscription?.type || "monthly",
        subscriptionStartDate: member.subscription?.startDate
          ? new Date(member.subscription.startDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        subscriptionEndDate: member.subscription?.endDate
          ? new Date(member.subscription.endDate).toISOString().split("T")[0]
          : "",
        subscriptionPrice: member.subscription?.price || 300000,
        paymentMethod: "cash",
      });
    } else {
      const today = new Date().toISOString().split("T")[0];
      setForm({
        fullName: "",
        phone: "+998",
        email: "",
        dateOfBirth: "",
        address: "",
        subscriptionType: "monthly",
        subscriptionStartDate: today,
        subscriptionEndDate: calculateEndDate(today, "monthly"),
        subscriptionPrice: settingsPrices.monthly || 300000,
        paymentMethod: "cash",
      });
    }
  }, [member, mode, isOpen, settingsPrices]);

  const handleChange = (field: keyof MemberFormData, value: string | number) => {
    setForm((prev) => {
      // Format phone input for display
      if (field === "phone") {
        const formatted = formatPhoneInput(value as string);
        return { ...prev, phone: formatted };
      }

      // Format price input - store as number but handle string input
      if (field === "subscriptionPrice") {
        const numValue = typeof value === "string" ? unformatAmount(value) : value;
        return { ...prev, subscriptionPrice: numValue };
      }

      const updated = { ...prev, [field]: value };

      if (field === "subscriptionType") {
        // Only auto-update price if it matches the OLD default
        const oldDefault = settingsPrices[prev.subscriptionType] || 300000;
        const newDefault = settingsPrices[value as string] || 300000;
        if (prev.subscriptionPrice === oldDefault || prev.subscriptionPrice === defaultPrices[prev.subscriptionType]) {
          updated.subscriptionPrice = newDefault;
        }
        updated.subscriptionEndDate = calculateEndDate(
          updated.subscriptionStartDate,
          value as string
        );
      }
      if (field === "subscriptionStartDate") {
        updated.subscriptionEndDate = calculateEndDate(
          value as string,
          updated.subscriptionType
        );
      }

      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!form.fullName.trim() || !form.phone.trim()) return;

    setIsLoading(true);
    try {
      await onSubmit({
        fullName: form.fullName,
        phone: unformatPhone(form.phone),
        email: form.email || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        address: form.address || undefined,
        subscription: {
          type: form.subscriptionType,
          startDate: form.subscriptionStartDate,
          endDate: form.subscriptionEndDate,
          price: form.subscriptionPrice,
        },
        paymentMethod: form.paymentMethod,
      });
      onClose();
    } catch {
      // error handled by parent
    } finally {
      setIsLoading(false);
    }
  };

  const isView = mode === "view";
  const title =
    mode === "create"
      ? "Yangi A'zo Qo'shish"
      : mode === "edit"
      ? "A'zo Tahrirlash"
      : "A'zo Ma'lumotlari";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      footer={
        !isView ? (
          <>
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
            >
              Bekor qilish
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !form.fullName.trim() || !form.phone.trim()}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all",
                "bg-blue-600 hover:bg-blue-700 shadow-sm",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : mode === "create" ? (
                <UserPlus size={16} />
              ) : (
                <Save size={16} />
              )}
              {mode === "create" ? "Qo'shish" : "Saqlash"}
            </button>
          </>
        ) : undefined
      }
    >
      <div className="space-y-5">
        {/* QR Code for view mode */}
        {isView && member?.qrCode && (
          <div className="flex justify-center">
            <div className="p-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl">
              <img
                src={member.qrCode}
                alt="QR Code"
                className="w-40 h-40 mx-auto"
              />
              {member?.memberId && (
                <p className="text-center text-lg font-bold text-blue-600 font-mono tracking-widest mt-2">
                  ID: {member.memberId}
                </p>
              )}
              <p className="text-xs text-center text-gray-500 mt-1 flex items-center justify-center gap-1">
                <QrCode size={12} /> QR Kod
              </p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <button
                  onClick={() => downloadQrCode(member.qrCode, member.fullName)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                >
                  <Download size={14} />
                  Yuklab olish
                </button>
                <button
                  onClick={() =>
                    printQrCard(member.qrCode, member.fullName, member.phone, member.memberId)
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
                >
                  <Printer size={14} />
                  Chop etish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              To&#39;liq ism *
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              disabled={isView}
              placeholder="Ism Familiya"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Telefon *
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              disabled={isView}
              placeholder="+998 90 123 45 67"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={isView}
              placeholder="email@example.com"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tug&#39;ilgan sana
            </label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
              disabled={isView}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-60"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Manzil
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
            disabled={isView}
            placeholder="Manzil"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-60"
          />
        </div>

        {/* Subscription */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Abonement
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Turi
              </label>
              <select
                value={form.subscriptionType}
                onChange={(e) => handleChange("subscriptionType", e.target.value)}
                disabled={isView}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-60"
              >
                <option value="daily">Kunlik</option>
                <option value="monthly">Oylik</option>
                <option value="yearly">Yillik</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Boshlanish
              </label>
              <input
                type="date"
                value={form.subscriptionStartDate}
                onChange={(e) =>
                  handleChange("subscriptionStartDate", e.target.value)
                }
                disabled={isView}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tugash
              </label>
              <input
                type="date"
                value={form.subscriptionEndDate}
                disabled
                className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm outline-none opacity-60"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Narx (so&#39;m)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={formatAmountInput(String(form.subscriptionPrice))}
              onChange={(e) =>
                handleChange("subscriptionPrice", e.target.value)
              }
              disabled={isView}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-60 max-w-xs"
            />
          </div>
          {/* Payment method selector - only in create mode */}
          {mode === "create" && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                To&apos;lov usuli
              </label>
              <div className="flex gap-2">
                {[
                  { value: "cash", label: "Naqd" },
                  { value: "card", label: "Karta" },
                  { value: "transfer", label: "O'tkazma" },
                ].map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, paymentMethod: m.value }))}
                    className={cn(
                      "flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border",
                      form.paymentMethod === m.value
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
