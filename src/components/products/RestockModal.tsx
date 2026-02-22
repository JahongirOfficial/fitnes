"use client";

import { useState, useEffect } from "react";
import { Loader2, PackagePlus, ChevronDown } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "@/lib/categoryIcons";

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { productId: string; quantity: number; costPrice?: number }) => Promise<void>;
  products: any[];
  preselectedProduct?: any;
}

const categoryLabels: Record<string, string> = {
  drink: "Ichimlik",
  chocolate: "Shokolad",
  cocktail: "Kokteyl",
  yogurt: "Yogurt",
};

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
}

export default function RestockModal({ isOpen, onClose, onSubmit, products, preselectedProduct }: RestockModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [costPrice, setCostPrice] = useState<number | "">("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedProduct = products.find((p) => p._id === selectedProductId);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setCostPrice("");
      setDropdownOpen(false);
      if (preselectedProduct) {
        setSelectedProductId(preselectedProduct._id);
        setCostPrice(preselectedProduct.costPrice || "");
      } else {
        setSelectedProductId("");
      }
    }
  }, [isOpen, preselectedProduct]);

  useEffect(() => {
    if (selectedProduct && !costPrice) {
      setCostPrice(selectedProduct.costPrice || "");
    }
  }, [selectedProductId]);

  const totalCost = (Number(costPrice) || 0) * quantity;

  const handleSubmit = async () => {
    if (!selectedProductId || quantity < 1) return;
    setIsLoading(true);
    try {
      await onSubmit({
        productId: selectedProductId,
        quantity,
        costPrice: Number(costPrice) || undefined,
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
      title="Mahsulot Qabul Qilish"
      subtitle="Omborga yangi mahsulot qo'shish"
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
            disabled={isLoading || !selectedProductId || quantity < 1}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all",
              "bg-emerald-600 hover:bg-emerald-700",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <PackagePlus size={16} />}
            Qabul qilish
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Product selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Mahsulotni tanlang *</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm transition",
                "focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none",
                dropdownOpen && "ring-2 ring-emerald-500 border-transparent"
              )}
            >
              {selectedProduct ? (
                <div className="flex items-center gap-3">
                  {selectedProduct.image ? (
                    <img src={selectedProduct.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                  ) : (
                    <CategoryIcon category={selectedProduct.category} size="sm" />
                  )}
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{selectedProduct.name}</p>
                    <p className="text-xs text-gray-500">
                      Qoldiq: {selectedProduct.stockQuantity} ta | {categoryLabels[selectedProduct.category] || selectedProduct.category}
                    </p>
                  </div>
                </div>
              ) : (
                <span className="text-gray-400">Mahsulot tanlang...</span>
              )}
              <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", dropdownOpen && "rotate-180")} />
            </button>

            {dropdownOpen && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                {products.length === 0 ? (
                  <p className="text-center py-3 text-xs text-gray-400">Mahsulot topilmadi</p>
                ) : (
                  products.map((p) => (
                    <button
                      key={p._id}
                      type="button"
                      onClick={() => {
                        setSelectedProductId(p._id);
                        setCostPrice(p.costPrice || "");
                        setDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition text-left",
                        selectedProductId === p._id && "bg-emerald-50"
                      )}
                    >
                      {p.image ? (
                        <img src={p.image} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                      ) : (
                        <CategoryIcon category={p.category} size="sm" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs text-gray-400">
                          Qoldiq: {p.stockQuantity} ta | {formatPrice(p.price)}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Miqdor *</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
            placeholder="Nechta?"
          />
        </div>

        {/* Cost price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tan narxi (1 dona)</label>
          <input
            type="number"
            min={0}
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
            placeholder="Tan narxini kiriting..."
          />
        </div>

        {/* Summary */}
        {selectedProduct && (
          <div className="p-4 bg-emerald-50 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Mahsulot:</span>
              <span className="font-medium text-gray-900">{selectedProduct.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Hozirgi qoldiq:</span>
              <span className="font-medium text-gray-900">{selectedProduct.stockQuantity} ta</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Qo&apos;shiladigan:</span>
              <span className="font-semibold text-emerald-700">+{quantity} ta</span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-emerald-200 pt-2">
              <span className="text-gray-600">Yangi qoldiq:</span>
              <span className="font-bold text-emerald-700">{selectedProduct.stockQuantity + quantity} ta</span>
            </div>
            {totalCost > 0 && (
              <div className="flex items-center justify-between text-sm border-t border-emerald-200 pt-2">
                <span className="text-gray-600">Jami xarajat:</span>
                <span className="font-bold text-red-600">{formatPrice(totalCost)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
