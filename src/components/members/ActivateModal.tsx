"use client";

import { useState, useEffect } from "react";
import { Loader2, UserCheck, Calendar } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

interface ActivateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    subscriptionType: string;
    startDate: string;
    endDate: string;
    price: number;
    paymentMethod: string;
  }) => Promise<void>;
  member: any;
}

const subscriptionTypes = [
  { value: "daily", label: "Kunlik", days: 1 },
  { value: "monthly", label: "Oylik", days: 30 },
  { value: "yearly", label: "Yillik", days: 365 },
];

const paymentMethods = [
  { value: "cash", label: "Naqd" },
  { value: "card", label: "Karta" },
  { value: "transfer", label: "O'tkazma" },
];

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
}

export default function ActivateModal({ isOpen, onClose, onSubmit, member }: ActivateModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const todayStr = new Date().toISOString().split("T")[0];

  const [subscriptionType, setSubscriptionType] = useState("monthly");
  const [startDate, setStartDate] = useState(todayStr);
  const [price, setPrice] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const selectedType = subscriptionTypes.find((t) => t.value === subscriptionType)!;
  const endDate = addDays(startDate, selectedType.days);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setSubscriptionType("monthly");
      setStartDate(new Date().toISOString().split("T")[0]);
      setPrice("");
      setPaymentMethod("cash");
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!price || Number(price) <= 0) return;
    setIsLoading(true);
    try {
      await onSubmit({
        subscriptionType,
        startDate,
        endDate,
        price: Number(price),
        paymentMethod,
      });
      onClose();
    } catch {
      /* parent handles */
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Abonementni Faollashtirish"
      subtitle={member?.fullName}
      size="md"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !price || Number(price) <= 0}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all",
              "bg-emerald-600 hover:bg-emerald-700",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
            Faollashtirish
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Abonement turi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Abonement turi</label>
          <div className="flex gap-2">
            {subscriptionTypes.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setSubscriptionType(t.value)}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border",
                  subscriptionType === t.value
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Boshlanish sanasi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Boshlanish sanasi
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        {/* Tugash sanasi (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Tugash sanasi <span className="text-gray-400 font-normal">(avtomatik)</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={endDate}
              readOnly
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 outline-none cursor-default"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {selectedType.label}: {selectedType.days} kun
          </p>
        </div>

        {/* Narx */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            To&apos;lov summasi *
          </label>
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="Narxni kiriting..."
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* To'lov usuli */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">To&apos;lov usuli</label>
          <div className="flex gap-2">
            {paymentMethods.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setPaymentMethod(m.value)}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border",
                  paymentMethod === m.value
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Xulosa */}
        {price && Number(price) > 0 && (
          <div className="p-4 bg-emerald-50 rounded-xl space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">A&apos;zo:</span>
              <span className="font-medium text-gray-900">{member?.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Abonement:</span>
              <span className="font-medium text-gray-900">{selectedType.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Muddati:</span>
              <span className="font-medium text-gray-900">{startDate} → {endDate}</span>
            </div>
            <div className="flex justify-between border-t border-emerald-200 pt-1.5">
              <span className="text-gray-600 font-medium">Summa:</span>
              <span className="font-bold text-emerald-700">{formatPrice(Number(price))}</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
