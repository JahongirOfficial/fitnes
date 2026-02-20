"use client";

import { User, Phone, Clock, FileText } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

interface DebtDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: any;
}

// Qarz holati uchun rang va matn
function getDebtStatusStyle(status: string): string {
  switch (status) {
    case "paid":
      return "bg-emerald-100 text-emerald-700";
    case "partial":
      return "bg-amber-100 text-amber-700";
    case "unpaid":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getDebtStatusText(status: string): string {
  switch (status) {
    case "paid":
      return "To'langan";
    case "partial":
      return "Qisman to'langan";
    case "unpaid":
      return "To'lanmagan";
    default:
      return status;
  }
}

export default function DebtDetailModal({
  isOpen,
  onClose,
  debt,
}: DebtDetailModalProps) {
  if (!debt) return null;

  const totalAmount = debt.amount || 0;
  const paidAmount = debt.paidAmount || 0;
  const remainingAmount = debt.remainingAmount ?? (totalAmount - paidAmount);
  const progressPercent = totalAmount > 0 ? Math.min((paidAmount / totalAmount) * 100, 100) : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Qarz Tafsilotlari"
      size="md"
      footer={
        <button
          onClick={onClose}
          className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
        >
          Yopish
        </button>
      }
    >
      <div className="space-y-5">
        {/* Shaxs ma'lumotlari */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <User size={18} className="text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">
                {debt.personName}
              </h3>
            </div>
            {debt.phone && (
              <div className="flex items-center gap-2 mt-1">
                <Phone size={14} className="text-gray-400" />
                <span className="text-sm text-gray-500">{debt.phone}</span>
              </div>
            )}
          </div>
          {/* Holat badge */}
          <span
            className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
              getDebtStatusStyle(debt.status)
            )}
          >
            {getDebtStatusText(debt.status)}
          </span>
        </div>

        {/* Summa ma'lumotlari */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 mb-1">Jami qarz</p>
              <p className="text-sm font-bold text-gray-900">
                {formatCurrency(totalAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">To&apos;langan</p>
              <p className="text-sm font-bold text-emerald-600">
                {formatCurrency(paidAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Qoldiq</p>
              <p className="text-sm font-bold text-red-600">
                {formatCurrency(remainingAmount)}
              </p>
            </div>
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

        {/* Izoh */}
        {debt.description && (
          <div className="flex items-start gap-2">
            <FileText size={14} className="text-gray-400 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-600">{debt.description}</p>
          </div>
        )}

        {/* To'lov tarixi */}
        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Clock size={14} className="text-gray-400" />
            To&apos;lov tarixi
          </h4>

          {debt.payments && debt.payments.length > 0 ? (
            <div className="space-y-2">
              {debt.payments.map((payment: any, index: number) => (
                <div
                  key={payment._id || index}
                  className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(payment.amount)}
                    </p>
                    {payment.description && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {payment.description}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 ml-3">
                    {formatDate(payment.date)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400">
                Hali to&apos;lov qayd etilmagan
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
