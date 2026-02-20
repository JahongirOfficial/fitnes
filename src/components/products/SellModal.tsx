"use client";

import { useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { quantity: number; paymentMethod: string }) => Promise<void>;
  product?: any;
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
}

export default function SellModal({ isOpen, onClose, onSubmit, product }: SellModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const maxStock = product?.stockQuantity ?? product?.stock ?? 0;
  const totalPrice = (product?.price || 0) * quantity;

  const handleSubmit = async () => {
    if (quantity < 1 || quantity > maxStock) return;
    setIsLoading(true);
    try {
      await onSubmit({ quantity, paymentMethod });
      setQuantity(1);
      onClose();
    } catch { /* parent handles */ } finally { setIsLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mahsulot Sotish" size="sm"
      footer={
        <>
          <button onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            Bekor qilish
          </button>
          <button onClick={handleSubmit} disabled={isLoading || quantity < 1 || quantity > maxStock}
            className={cn("inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all",
              "bg-blue-600 hover:bg-blue-700", "disabled:opacity-50 disabled:cursor-not-allowed")}>
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ShoppingBag size={16} />}
            Sotish
          </button>
        </>
      }>
      <div className="space-y-4">
        {product && (
          <div className="p-4 bg-gray-50 rounded-xl text-center">
            <p className="font-semibold text-gray-900 text-lg">{product.name}</p>
            <p className="text-blue-600 font-bold text-xl mt-1">{formatPrice(product.price)}</p>
            <p className="text-xs text-gray-500 mt-1">Qoldiq: {maxStock} ta</p>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Miqdor</label>
          <input type="number" min={1} max={maxStock} value={quantity}
            onChange={(e) => setQuantity(Math.min(Number(e.target.value), maxStock))}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">To&apos;lov usuli</label>
          <div className="flex gap-3">
            {[{ value: "cash", label: "Naqd" }, { value: "card", label: "Karta" }, { value: "transfer", label: "O'tkazma" }].map((m) => (
              <button key={m.value} type="button" onClick={() => setPaymentMethod(m.value)}
                className={cn("flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border",
                  paymentMethod === m.value ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50")}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4 bg-blue-50 rounded-xl flex items-center justify-between">
          <span className="text-sm text-gray-700">Jami summa:</span>
          <span className="text-xl font-bold text-blue-700">{formatPrice(totalPrice)}</span>
        </div>
      </div>
    </Modal>
  );
}
