"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, ShoppingBag, Search, X } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface MemberOption {
  _id: string;
  fullName: string;
  phone: string;
  balance?: number;
}

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    quantity: number;
    paymentMethod: string;
    memberId?: string;
    memberName?: string;
  }) => Promise<void>;
  product?: any;
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
}

export default function SellModal({ isOpen, onClose, onSubmit, product }: SellModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Member search
  const [memberSearch, setMemberSearch] = useState("");
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberOption | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const maxStock = product?.stockQuantity ?? product?.stock ?? 0;
  const totalPrice = (product?.price || 0) * quantity;

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setPaymentMethod("cash");
      setMemberSearch("");
      setMembers([]);
      setSelectedMember(null);
      setShowDropdown(false);
    }
  }, [isOpen]);

  // Search members
  const searchMembers = useCallback(async (query: string) => {
    setMembersLoading(true);
    try {
      const params: any = { limit: 10 };
      if (query.trim()) params.search = query.trim();
      const data = await api.searchMembers(params);
      setMembers(data.members || []);
    } catch {
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (!showDropdown) return;
    const timer = setTimeout(() => searchMembers(memberSearch), 300);
    return () => clearTimeout(timer);
  }, [memberSearch, showDropdown, searchMembers]);

  const handleSubmit = async () => {
    if (quantity < 1 || quantity > maxStock) return;
    if (paymentMethod === "balance" && selectedMember && (selectedMember.balance || 0) < totalPrice) return;
    setIsLoading(true);
    try {
      await onSubmit({
        quantity,
        paymentMethod,
        memberId: selectedMember?._id,
        memberName: selectedMember?.fullName,
      });
      onClose();
    } catch { /* parent handles */ } finally { setIsLoading(false); }
  };

  const paymentMethods = [
    { value: "cash", label: "Naqd" },
    { value: "card", label: "Karta" },
    { value: "transfer", label: "O'tkazma" },
    ...(selectedMember?.balance
      ? [{ value: "balance", label: `Balans (${formatPrice(selectedMember.balance)})` }]
      : []),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mahsulot Sotish" size="md"
      footer={
        <>
          <button onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            Bekor qilish
          </button>
          <button onClick={handleSubmit}
            disabled={isLoading || quantity < 1 || quantity > maxStock || (paymentMethod === "balance" && (!selectedMember || (selectedMember.balance || 0) < totalPrice))}
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

        {/* Member search (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            A&apos;zo (ixtiyoriy)
          </label>
          {selectedMember ? (
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  {selectedMember.fullName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedMember.fullName}</p>
                  {(selectedMember.balance ?? 0) > 0 && (
                    <p className="text-xs text-emerald-600 font-semibold">
                      Balans: {formatPrice(selectedMember.balance || 0)}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => {
                setSelectedMember(null);
                if (paymentMethod === "balance") setPaymentMethod("cash");
              }} className="text-gray-400 hover:text-red-500 transition">
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  onFocus={() => {
                    setShowDropdown(true);
                    if (members.length === 0) searchMembers("");
                  }}
                  placeholder="Ism yoki telefon..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
              {showDropdown && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                  {membersLoading ? (
                    <div className="flex items-center justify-center py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="ml-2 text-xs text-gray-500">Qidirilmoqda...</span>
                    </div>
                  ) : members.length === 0 ? (
                    <p className="text-center py-3 text-xs text-gray-400">A&apos;zo topilmadi</p>
                  ) : (
                    members.map((m) => (
                      <button key={m._id} type="button"
                        onClick={() => {
                          setSelectedMember(m);
                          setShowDropdown(false);
                          setMemberSearch("");
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition text-left">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                          {m.fullName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{m.fullName}</p>
                          <p className="text-xs text-gray-400">{m.phone}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Miqdor</label>
          <input type="number" min={1} max={maxStock} value={quantity}
            onChange={(e) => setQuantity(Math.min(Number(e.target.value), maxStock))}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">To&apos;lov usuli</label>
          <div className="flex flex-wrap gap-2">
            {paymentMethods.map((m) => (
              <button key={m.value} type="button" onClick={() => setPaymentMethod(m.value)}
                className={cn("flex-1 min-w-[80px] px-3 py-2.5 rounded-xl text-sm font-medium transition-all border",
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
