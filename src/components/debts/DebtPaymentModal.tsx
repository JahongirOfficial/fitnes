"use client";

import { useState, useEffect } from "react";
import { Loader2, Banknote } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { cn, formatCurrency } from "@/lib/utils";

interface DebtPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { amount: number; description?: string; paymentMethod: string }) => Promise<void>;
  debt: any;
}

export default function DebtPaymentModal({
  isOpen,
  onClose,
  onSubmit,
  debt,
}: DebtPaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Qoldiq summani hisoblash
  const totalAmount = debt?.amount || 0;
  const paidAmount = debt?.paidAmount || 0;
  const remainingAmount = debt?.remainingAmount ?? (totalAmount - paidAmount);

  // To'lov foizi (progress bar uchun)
  const progressPercent = totalAmount > 0 ? Math.min((paidAmount / totalAmount) * 100, 100) : 0;

  // Modal ochilganda formni tiklash va qoldiq summa bilan to'ldirish
  useEffect(() => {
    if (isOpen && debt) {
      const remaining = debt.remainingAmount ?? (debt.amount - (debt.paidAmount || 0));
      setAmount(String(remaining));
      setDescription("");
      setPaymentMethod("cash");
    }
  }, [isOpen, debt]);

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0 || Number(amount) > remainingAmount) return;

    setIsLoading(true);
    try {
      await onSubmit({
        amount: Number(amount),
        description: description.trim() || undefined,
        paymentMethod,
      });
      onClose();
    } catch {
      // Xato yuqori komponent tomonidan boshqariladi
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="To'lov Qayd Etish"
      subtitle={debt?.personName}
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
            disabled={isLoading || !amount || Number(amount) <= 0 || Number(amount) > remainingAmount}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all",
              "bg-emerald-600 hover:bg-emerald-700 shadow-sm",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Banknote size={16} />
            )}
            To&apos;lovni tasdiqlash
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Qarz ma'lumotlari sarlavhasi */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-500">Jami qarz</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(totalAmount)}
            </span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-500">To&apos;langan</span>
            <span className="text-sm font-semibold text-emerald-600">
              {formatCurrency(paidAmount)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Qoldiq</span>
            <span className="text-sm font-bold text-red-600">
              {formatCurrency(remainingAmount)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  progressPercent >= 100
                    ? "bg-emerald-500"
                    : progressPercent > 0
                    ? "bg-amber-500"
                    : "bg-gray-300"
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1 text-right">
              {progressPercent.toFixed(0)}% to&apos;langan
            </p>
          </div>
        </div>

        {/* To'lov summasi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            To&apos;lov summasi *
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            min="1"
            max={remainingAmount}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
          {Number(amount) > remainingAmount && (
            <p className="text-xs text-red-500 mt-1">
              Summa qoldiq miqdordan ({formatCurrency(remainingAmount)}) oshmasligi kerak
            </p>
          )}
        </div>

        {/* To'lov turi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            To&apos;lov turi
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
                onClick={() => setPaymentMethod(m.value)}
                className={cn(
                  "flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border",
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

        {/* Izoh */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Izoh
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Qo'shimcha izoh..."
            rows={3}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
          />
        </div>
      </div>
    </Modal>
  );
}
