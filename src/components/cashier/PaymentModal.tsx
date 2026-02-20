"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  ShoppingBag,
  Wallet,
  ChevronRight,
  ChevronLeft,
  Search,
  Check,
  X,
  Calendar,
  Package,
  Minus,
  Plus,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  type: "income" | "expense";
  preselectedMember?: { _id: string; fullName: string; subscription?: any } | null;
}

interface MemberOption {
  _id: string;
  fullName: string;
  phone: string;
  status: string;
  subscription?: {
    type: string;
    startDate: string;
    endDate: string;
    price: number;
    status: string;
  };
}

interface ProductOption {
  _id: string;
  name: string;
  price: number;
  category: string;
  stockQuantity: number;
}

type IncomeCategory = "subscription" | "product" | "balance";
type SubType = "daily" | "monthly" | "yearly";
type Step = "category" | "subtype" | "products" | "details";

// ── Narxlar (default, settings dan yangilanadi) ──────────────────────────
const DEFAULT_PRICES: Record<SubType, number> = {
  daily: 30000,
  monthly: 300000,
  yearly: 2500000,
};

// ── Expense Categories ───────────────────────────────────────────────────
const expenseCategories = [
  { value: "salary", label: "Ish haqi" },
  { value: "utility", label: "Kommunal" },
  { value: "rent", label: "Ijara" },
  { value: "equipment", label: "Jihozlar" },
  { value: "other", label: "Boshqa" },
];

// ── Component ─────────────────────────────────────────────────────────────
export default function PaymentModal({
  isOpen,
  onClose,
  onSubmit,
  type,
  preselectedMember,
}: PaymentModalProps) {
  const isIncome = type === "income";

  // ── Steps (only for income) ──────────────────────────────────────────
  const [step, setStep] = useState<Step>("category");
  const [incomeCategory, setIncomeCategory] = useState<IncomeCategory>("subscription");
  const [subType, setSubType] = useState<SubType>("monthly");

  // ── Pricing from settings ────────────────────────────────────────────
  const [prices, setPrices] = useState<Record<SubType, number>>(DEFAULT_PRICES);

  // ── Member selection ─────────────────────────────────────────────────
  const [memberSearch, setMemberSearch] = useState("");
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberOption | null>(null);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  // ── Product selection ────────────────────────────────────────────────
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<
    { product: ProductOption; quantity: number }[]
  >([]);

  // ── Form fields ──────────────────────────────────────────────────────
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isLoading, setIsLoading] = useState(false);

  // ── Expense form ─────────────────────────────────────────────────────
  const [expenseCategory, setExpenseCategory] = useState("salary");

  // ── Load pricing from settings ───────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const loadPricing = async () => {
      try {
        const settings = await api.getSettings();
        if (settings?.pricing) {
          setPrices({
            daily: settings.pricing.daily || DEFAULT_PRICES.daily,
            monthly: settings.pricing.monthly || DEFAULT_PRICES.monthly,
            yearly: settings.pricing.yearly || DEFAULT_PRICES.yearly,
          });
        }
      } catch {
        // use defaults
      }
    };
    loadPricing();
  }, [isOpen]);

  // ── Reset form when modal opens/closes ───────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setStep(isIncome ? "category" : "details");
      setIncomeCategory("subscription");
      setSubType("monthly");
      setMemberSearch("");
      setMembers([]);
      setSelectedMember(null);
      setSelectedProducts([]);
      setAmount("");
      setDescription("");
      setPaymentMethod("cash");
      setExpenseCategory("salary");
      setShowMemberDropdown(false);

      if (preselectedMember) {
        setSelectedMember(preselectedMember as MemberOption);
      }
    }
  }, [isOpen, isIncome, preselectedMember]);

  // ── Auto-set amount based on category/subtype ────────────────────────
  useEffect(() => {
    if (!isIncome) return;
    if (incomeCategory === "subscription" || incomeCategory === "balance") {
      setAmount(String(prices[subType]));
    } else if (incomeCategory === "product") {
      const total = selectedProducts.reduce(
        (sum, sp) => sum + sp.product.price * sp.quantity,
        0
      );
      setAmount(String(total));
    }
  }, [isIncome, incomeCategory, subType, prices, selectedProducts]);

  // ── Auto-generate description ────────────────────────────────────────
  useEffect(() => {
    if (!isIncome) return;
    const subLabels: Record<SubType, string> = {
      daily: "Kunlik",
      monthly: "Oylik",
      yearly: "Yillik",
    };
    if (incomeCategory === "subscription") {
      setDescription(`${subLabels[subType]} abonement to'lovi`);
    } else if (incomeCategory === "balance") {
      setDescription(`${subLabels[subType]} balansni to'ldirish`);
    } else if (incomeCategory === "product") {
      if (selectedProducts.length > 0) {
        const names = selectedProducts.map(
          (sp) => `${sp.product.name} x${sp.quantity}`
        );
        setDescription(names.join(", "));
      } else {
        setDescription("");
      }
    }
  }, [isIncome, incomeCategory, subType, selectedProducts]);

  // ── Search members ───────────────────────────────────────────────────
  const searchMembers = useCallback(
    async (query: string) => {
      setMembersLoading(true);
      try {
        const params: any = { limit: 20 };
        if (query.trim()) params.search = query.trim();

        // Filter by subscription type for subscription payments
        if (isIncome && incomeCategory === "subscription") {
          params.subscription = subType;
        }

        const data = await api.searchMembers(params);
        setMembers(data.members || []);
      } catch {
        setMembers([]);
      } finally {
        setMembersLoading(false);
      }
    },
    [isIncome, incomeCategory, subType]
  );

  // ── Debounced member search ──────────────────────────────────────────
  useEffect(() => {
    if (!showMemberDropdown) return;
    const timer = setTimeout(() => searchMembers(memberSearch), 300);
    return () => clearTimeout(timer);
  }, [memberSearch, showMemberDropdown, searchMembers]);

  // ── Load products ────────────────────────────────────────────────────
  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const data = await api.getProducts();
      setProducts(
        (data.products || []).filter((p: ProductOption) => p.stockQuantity > 0)
      );
    } catch {
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  // ── Product helpers ──────────────────────────────────────────────────
  const toggleProduct = (product: ProductOption) => {
    const exists = selectedProducts.find(
      (sp) => sp.product._id === product._id
    );
    if (exists) {
      setSelectedProducts((prev) =>
        prev.filter((sp) => sp.product._id !== product._id)
      );
    } else {
      setSelectedProducts((prev) => [...prev, { product, quantity: 1 }]);
    }
  };

  const updateProductQuantity = (productId: string, delta: number) => {
    setSelectedProducts((prev) =>
      prev.map((sp) => {
        if (sp.product._id === productId) {
          const newQty = Math.max(
            1,
            Math.min(sp.quantity + delta, sp.product.stockQuantity)
          );
          return { ...sp, quantity: newQty };
        }
        return sp;
      })
    );
  };

  // ── Format currency ──────────────────────────────────────────────────
  const formatPrice = (n: number) =>
    new Intl.NumberFormat("uz-UZ").format(n) + " so'm";

  // ── Handle category selection ────────────────────────────────────────
  const handleCategorySelect = (cat: IncomeCategory) => {
    setIncomeCategory(cat);
    if (cat === "product") {
      loadProducts();
      setStep("products");
    } else {
      setStep("subtype");
    }
  };

  // ── Handle subtype selection then go to details ──────────────────────
  const handleSubTypeSelect = (st: SubType) => {
    setSubType(st);
    setStep("details");
  };

  // ── Handle submit ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (isIncome && !selectedMember) return;
    if (!amount || Number(amount) <= 0) return;

    setIsLoading(true);
    try {
      if (isIncome && incomeCategory === "product" && selectedProducts.length > 0) {
        // Sell products via API
        for (const sp of selectedProducts) {
          await api.sellProduct(sp.product._id, {
            quantity: sp.quantity,
            paymentMethod,
          });
        }
        // Submit callback to refresh parent
        await onSubmit({ _skipCreate: true });
      } else {
        await onSubmit({
          type,
          description: description || undefined,
          memberName: selectedMember?.fullName || undefined,
          memberId: selectedMember?._id || undefined,
          amount: Number(amount),
          category: isIncome ? (incomeCategory === "balance" ? "balance" : incomeCategory) : expenseCategory,
          paymentMethod,
        });
      }
      onClose();
    } catch {
      // handled by parent
    } finally {
      setIsLoading(false);
    }
  };

  // ── Navigate back ────────────────────────────────────────────────────
  const goBack = () => {
    if (step === "details") {
      if (!isIncome) {
        onClose();
        return;
      }
      if (incomeCategory === "product") {
        setStep("products");
      } else {
        setStep("subtype");
      }
    } else if (step === "products") {
      setStep("category");
      setSelectedProducts([]);
    } else if (step === "subtype") {
      setStep("category");
    } else {
      onClose();
    }
  };

  // ── Get title based on step ──────────────────────────────────────────
  const getTitle = () => {
    if (!isIncome) return "Yangi Chiqim";
    switch (step) {
      case "category":
        return "Kirim - Kategoriya";
      case "subtype":
        return incomeCategory === "subscription"
          ? "Abonement turi"
          : "Balans turi";
      case "products":
        return "Mahsulot tanlash";
      case "details":
        return "To'lov ma'lumotlari";
    }
  };

  // ── Render: EXPENSE mode (simple form) ───────────────────────────────
  if (!isIncome) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Yangi Chiqim"
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
              disabled={isLoading || !description.trim() || !amount}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all",
                "bg-red-600 hover:bg-red-700",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ArrowUpRight size={16} />
              )}
              Chiqim qo'shish
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tavsif *
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Masalan: Oylik ish haqi"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Summa (so&apos;m) *
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Kategoriya
              </label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                {expenseCategories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              To&apos;lov usuli
            </label>
            <div className="flex gap-2 sm:gap-3">
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
                    "flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border",
                    paymentMethod === m.value
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  // ── Render: INCOME mode (multi-step) ─────────────────────────────────
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      size={step === "products" ? "lg" : "md"}
      footer={
        step === "details" ? (
          <>
            <button
              onClick={goBack}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
            >
              <ChevronLeft size={16} />
              Ortga
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !selectedMember || !amount || Number(amount) <= 0}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all",
                "bg-emerald-600 hover:bg-emerald-700",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ArrowDownLeft size={16} />
              )}
              To&apos;lovni tasdiqlash
            </button>
          </>
        ) : step === "products" ? (
          <>
            <button
              onClick={goBack}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
            >
              <ChevronLeft size={16} />
              Ortga
            </button>
            <button
              onClick={() => setStep("details")}
              disabled={selectedProducts.length === 0}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all",
                "bg-emerald-600 hover:bg-emerald-700",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              To&apos;lovga o&apos;tish
              <ChevronRight size={16} />
            </button>
          </>
        ) : undefined
      }
    >
      {/* ── Step 1: Category Selection ──────────────────────────────── */}
      {step === "category" && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 mb-4">
            Kirim turini tanlang:
          </p>
          {[
            {
              key: "subscription" as IncomeCategory,
              label: "Abonement",
              desc: "Kunlik, oylik yoki yillik a'zolik to'lovi",
              icon: CreditCard,
              color: "bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-400",
              iconBg: "bg-blue-100",
            },
            {
              key: "product" as IncomeCategory,
              label: "Mahsulot sotish",
              desc: "Ichimlik, shokolad va boshqa mahsulotlar",
              icon: ShoppingBag,
              color: "bg-purple-50 text-purple-600 border-purple-200 hover:border-purple-400",
              iconBg: "bg-purple-100",
            },
            {
              key: "balance" as IncomeCategory,
              label: "Balansni to'ldirish",
              desc: "A'zo balansini kunlik, oylik yoki yillik to'ldirish",
              icon: Wallet,
              color: "bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-400",
              iconBg: "bg-emerald-100",
            },
          ].map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => handleCategorySelect(cat.key)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all",
                cat.color
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-xl shrink-0",
                  cat.iconBg
                )}
              >
                <cat.icon className="w-6 h-6" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-gray-900">{cat.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{cat.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* ── Step 2: Sub-type Selection (for subscription/balance) ──── */}
      {step === "subtype" && (
        <div className="space-y-3">
          <button
            onClick={goBack}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition mb-2"
          >
            <ChevronLeft size={14} />
            Ortga
          </button>
          <p className="text-sm text-gray-500 mb-2">
            {incomeCategory === "subscription"
              ? "Abonement turini tanlang:"
              : "Balans turini tanlang:"}
          </p>
          {(
            [
              {
                key: "daily" as SubType,
                label: "Kunlik",
                icon: Calendar,
                color: "border-orange-200 hover:border-orange-400 bg-orange-50",
                iconBg: "bg-orange-100 text-orange-600",
              },
              {
                key: "monthly" as SubType,
                label: "Oylik",
                icon: Calendar,
                color: "border-blue-200 hover:border-blue-400 bg-blue-50",
                iconBg: "bg-blue-100 text-blue-600",
              },
              {
                key: "yearly" as SubType,
                label: "Yillik",
                icon: Calendar,
                color: "border-purple-200 hover:border-purple-400 bg-purple-50",
                iconBg: "bg-purple-100 text-purple-600",
              },
            ] as const
          ).map((st) => (
            <button
              key={st.key}
              type="button"
              onClick={() => handleSubTypeSelect(st.key)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                st.color
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-lg",
                    st.iconBg
                  )}
                >
                  <st.icon className="w-5 h-5" />
                </div>
                <span className="font-semibold text-gray-900">{st.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-700">
                  {formatPrice(prices[st.key])}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Step 2b: Product Selection ──────────────────────────────── */}
      {step === "products" && (
        <div className="space-y-4">
          {productsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2 text-sm text-gray-500">
                Mahsulotlar yuklanmoqda...
              </span>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 stroke-1" />
              <p>Mavjud mahsulotlar yo&apos;q</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
                {products.map((product) => {
                  const isSelected = selectedProducts.some(
                    (sp) => sp.product._id === product._id
                  );
                  const sp = selectedProducts.find(
                    (sp) => sp.product._id === product._id
                  );
                  return (
                    <div
                      key={product._id}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all cursor-pointer",
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      )}
                      onClick={() => !isSelected && toggleProduct(product)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Qoldiq: {product.stockQuantity} ta
                          </p>
                          <p className="text-sm font-bold text-blue-600 mt-1">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                        {isSelected && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleProduct(product);
                            }}
                            className="shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                      {isSelected && sp && (
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-200">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateProductQuantity(product._id, -1);
                              }}
                              className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-sm font-bold w-6 text-center">
                              {sp.quantity}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateProductQuantity(product._id, 1);
                              }}
                              className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-blue-700">
                            {formatPrice(product.price * sp.quantity)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {selectedProducts.length > 0 && (
                <div className="p-3 bg-emerald-50 rounded-xl flex items-center justify-between border border-emerald-200">
                  <span className="text-sm font-medium text-gray-700">
                    Jami ({selectedProducts.reduce((s, sp) => s + sp.quantity, 0)} ta
                    mahsulot):
                  </span>
                  <span className="text-lg font-bold text-emerald-700">
                    {formatPrice(
                      selectedProducts.reduce(
                        (s, sp) => s + sp.product.price * sp.quantity,
                        0
                      )
                    )}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Step 3: Payment Details ─────────────────────────────────── */}
      {step === "details" && (
        <div className="space-y-4">
          {/* Summary of what's being paid for */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Kategoriya</p>
                <p className="text-sm font-semibold text-gray-900">
                  {incomeCategory === "subscription"
                    ? `Abonement - ${
                        subType === "daily"
                          ? "Kunlik"
                          : subType === "monthly"
                          ? "Oylik"
                          : "Yillik"
                      }`
                    : incomeCategory === "balance"
                    ? `Balans - ${
                        subType === "daily"
                          ? "Kunlik"
                          : subType === "monthly"
                          ? "Oylik"
                          : "Yillik"
                      }`
                    : `Mahsulot sotish (${selectedProducts.length} ta)`}
                </p>
              </div>
              <p className="text-lg font-bold text-emerald-600">
                {formatPrice(Number(amount) || 0)}
              </p>
            </div>
          </div>

          {/* Member selection - REQUIRED */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              A&apos;zo tanlang *
            </label>
            {selectedMember ? (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {selectedMember.fullName
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedMember.fullName}
                    </p>
                    {selectedMember.phone && (
                      <p className="text-xs text-gray-500">
                        {selectedMember.phone}
                      </p>
                    )}
                  </div>
                </div>
                {!preselectedMember && (
                  <button
                    onClick={() => {
                      setSelectedMember(null);
                      setShowMemberDropdown(true);
                    }}
                    className="text-gray-400 hover:text-red-500 transition"
                  >
                    <X size={18} />
                  </button>
                )}
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
                      setShowMemberDropdown(true);
                      if (members.length === 0) searchMembers("");
                    }}
                    placeholder="Ism yoki telefon bo'yicha qidiring..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>
                {showMemberDropdown && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {membersLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        <span className="ml-2 text-xs text-gray-500">
                          Qidirilmoqda...
                        </span>
                      </div>
                    ) : members.length === 0 ? (
                      <p className="text-center py-4 text-xs text-gray-400">
                        A&apos;zo topilmadi
                      </p>
                    ) : (
                      members.map((m) => (
                        <button
                          key={m._id}
                          type="button"
                          onClick={() => {
                            setSelectedMember(m);
                            setShowMemberDropdown(false);
                            setMemberSearch("");
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                            {m.fullName
                              .split(" ")
                              .map((w) => w[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {m.fullName}
                            </p>
                            <p className="text-xs text-gray-400">{m.phone}</p>
                          </div>
                          {m.subscription?.type && (
                            <span
                              className={cn(
                                "text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0",
                                m.subscription.type === "daily" &&
                                  "bg-orange-100 text-orange-700",
                                m.subscription.type === "monthly" &&
                                  "bg-blue-100 text-blue-700",
                                m.subscription.type === "yearly" &&
                                  "bg-purple-100 text-purple-700"
                              )}
                            >
                              {m.subscription.type === "daily"
                                ? "Kunlik"
                                : m.subscription.type === "monthly"
                                ? "Oylik"
                                : "Yillik"}
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Amount (auto-filled but editable) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Summa (so&apos;m)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition font-semibold"
            />
          </div>

          {/* Description (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tavsif (ixtiyoriy)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Qo'shimcha izoh..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Payment method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              To&apos;lov usuli
            </label>
            <div className="flex gap-2 sm:gap-3">
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
                    "flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border",
                    paymentMethod === m.value
                      ? "border-blue-600 bg-blue-50 text-blue-700"
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
  );
}
