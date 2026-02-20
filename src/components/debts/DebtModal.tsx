"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Save } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

interface DebtFormData {
  personName: string;
  phone: string;
  amount: string;
  description: string;
}

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    personName: string;
    phone?: string;
    amount: number;
    description?: string;
  }) => Promise<void>;
  debt?: any;
  mode: "create" | "edit";
}

export default function DebtModal({
  isOpen,
  onClose,
  onSubmit,
  debt,
  mode,
}: DebtModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<DebtFormData>({
    personName: "",
    phone: "",
    amount: "",
    description: "",
  });

  // Formni to'ldirish: tahrirlash rejimida mavjud qarz ma'lumotlari bilan
  useEffect(() => {
    if (debt && mode === "edit") {
      setForm({
        personName: debt.personName || "",
        phone: debt.phone || "",
        amount: String(debt.amount || ""),
        description: debt.description || "",
      });
    } else {
      setForm({
        personName: "",
        phone: "",
        amount: "",
        description: "",
      });
    }
  }, [debt, mode, isOpen]);

  const handleChange = (field: keyof DebtFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.personName.trim() || !form.amount || Number(form.amount) <= 0) return;

    setIsLoading(true);
    try {
      await onSubmit({
        personName: form.personName.trim(),
        phone: form.phone.trim() || undefined,
        amount: Number(form.amount),
        description: form.description.trim() || undefined,
      });
      onClose();
    } catch {
      // Xato yuqori komponent tomonidan boshqariladi
    } finally {
      setIsLoading(false);
    }
  };

  const title = mode === "create" ? "Yangi Qarz Qo'shish" : "Qarzni Tahrirlash";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
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
            disabled={isLoading || !form.personName.trim() || !form.amount || Number(form.amount) <= 0}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all",
              "bg-blue-600 hover:bg-blue-700 shadow-sm",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : mode === "create" ? (
              <Plus size={16} />
            ) : (
              <Save size={16} />
            )}
            {mode === "create" ? "Qo'shish" : "Saqlash"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Shaxs ismi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Shaxs ismi *
          </label>
          <input
            type="text"
            value={form.personName}
            onChange={(e) => handleChange("personName", e.target.value)}
            placeholder="Ism Familiya"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Telefon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Telefon
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="+998901234567"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Qarz summasi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Qarz summasi *
          </label>
          <input
            type="number"
            value={form.amount}
            onChange={(e) => handleChange("amount", e.target.value)}
            placeholder="0"
            min="1"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* Izoh */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Izoh
          </label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Qo'shimcha izoh..."
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>
      </div>
    </Modal>
  );
}
