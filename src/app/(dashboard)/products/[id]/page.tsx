"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShoppingBag,
  TrendingUp,
  Wallet,
  Package,
  XCircle,
  Calendar,
  Tag,
  DollarSign,
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle,
  Minus,
  Info,
  BarChart3,
  History,
  User,
} from "lucide-react";
import { useProductHistory } from "@/lib/hooks";
import {
  cn,
  formatCurrency,
  formatDate,
  formatTime,
} from "@/lib/utils";
import { CategoryIcon } from "@/lib/categoryIcons";

// ---- Yordamchi funksiyalar va konstantalar --------------------------------

/** Kategoriya nomini o'zbek tiliga tarjima qilish */
const categoryLabels: Record<string, string> = {
  drink: "Ichimlik",
  chocolate: "Shokolad",
  cocktail: "Kokteyl",
  yogurt: "Yogurt",
  other: "Boshqa",
};

/** Kategoriya badge ranglari */
const categoryBadgeColors: Record<string, string> = {
  drink: "bg-blue-100 text-blue-700",
  chocolate: "bg-amber-100 text-amber-700",
  cocktail: "bg-purple-100 text-purple-700",
  yogurt: "bg-pink-100 text-pink-700",
  other: "bg-gray-100 text-gray-700",
};

/** Zaxira harakat turi badge */
function getMovementTypeBadge(type: string): { color: string; text: string } {
  switch (type) {
    case "restock":
      return { color: "bg-emerald-100 text-emerald-700", text: "To'ldirish" };
    case "sale":
      return { color: "bg-red-100 text-red-700", text: "Sotish" };
    case "adjustment":
      return { color: "bg-amber-100 text-amber-700", text: "Tuzatish" };
    default:
      return { color: "bg-gray-100 text-gray-700", text: type };
  }
}

// ---- Skeleton komponentlar ------------------------------------------------

function HeaderSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="h-20 w-20 rounded-2xl bg-gray-200" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-7 w-48 rounded-lg bg-gray-200" />
            <div className="h-6 w-20 rounded-full bg-gray-200" />
          </div>
          <div className="flex gap-4">
            <div className="h-4 w-36 rounded bg-gray-200" />
            <div className="h-4 w-36 rounded bg-gray-200" />
          </div>
          <div className="h-5 w-24 rounded-full bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gray-200" />
        <div className="space-y-2">
          <div className="h-3 w-16 rounded bg-gray-200" />
          <div className="h-5 w-24 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-gray-50 px-6 py-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 flex-1 rounded bg-gray-200" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ---- Tab tiplari -----------------------------------------------------------

type TabType = "stock" | "info";

const TABS: { key: TabType; label: string; icon: React.ElementType }[] = [
  { key: "stock", label: "Zaxira tarixi", icon: History },
  { key: "info", label: "Ma'lumotlar", icon: Info },
];

// ---- Asosiy sahifa komponenti ----------------------------------------------

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>("stock");

  // Ma'lumotlarni yuklash
  const { data, isLoading } = useProductHistory(id);

  // Ma'lumotlarni ajratib olish
  const product = data?.product;
  const stockMovements = data?.stockMovements || [];
  const stats = data?.stats || {
    totalSold: 0,
    todaySold: 0,
    totalRevenue: 0,
    profit: 0,
    todayRevenue: 0,
  };

  // ---- Loading holati -------------------------------------------------------

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Orqaga tugma */}
        <button
          type="button"
          onClick={() => router.push("/products")}
          className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Orqaga
        </button>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <HeaderSkeleton />
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <TableSkeleton />
        </div>
      </div>
    );
  }

  // ---- Mahsulot topilmadi ---------------------------------------------------

  if (!product) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => router.push("/products")}
          className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Orqaga
        </button>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white px-6 py-16 shadow-sm">
          <XCircle className="mb-4 h-12 w-12 text-red-300" />
          <p className="text-lg font-medium text-gray-700">Mahsulot topilmadi</p>
          <p className="mt-1 text-sm text-gray-400">Ushbu ID bilan mahsulot mavjud emas</p>
          <button
            type="button"
            onClick={() => router.push("/products")}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Mahsulotlarga qaytish
          </button>
        </div>
      </div>
    );
  }

  // ---- Mahsulot ma'lumotlari ------------------------------------------------

  const stock = product.stockQuantity ?? 0;
  const minStock = product.minStockAlert ?? 5;
  const isLowStock = stock <= minStock;

  // ---- Render ---------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Orqaga tugma */}
      <button
        type="button"
        onClick={() => router.push("/products")}
        className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Orqaga
      </button>

      {/* ---- Header ---- */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          {/* Mahsulot rasmi yoki kategoriya ikonkasi */}
          {product.image ? (
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex-shrink-0">
              <CategoryIcon category={product.category} size="lg" />
            </div>
          )}

          {/* Nomi, kategoriya, narxlar */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{product.name}</h1>
              <span
                className={cn(
                  "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium",
                  categoryBadgeColors[product.category] || "bg-gray-100 text-gray-700"
                )}
              >
                {categoryLabels[product.category] || product.category}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                Sotish narxi: <span className="font-semibold text-blue-600">{formatCurrency(product.price)}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" />
                Tan narxi: <span className="font-semibold text-gray-700">{formatCurrency(product.costPrice)}</span>
              </span>
            </div>

            <div>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold",
                  isLowStock
                    ? "bg-red-100 text-red-700"
                    : "bg-emerald-100 text-emerald-700"
                )}
              >
                {isLowStock && <AlertTriangle className="h-3 w-3" />}
                <Package className="h-3 w-3" />
                Qoldiq: {stock} ta
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Statistika kartalar ---- */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Jami sotilgan */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Jami sotilgan</p>
              <p className="text-lg font-bold text-gray-900">{stats.totalSold} dona</p>
            </div>
          </div>
        </div>

        {/* Bugungi sotuv */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Bugungi sotuv</p>
              <p className="text-lg font-bold text-gray-900">{stats.todaySold} dona</p>
            </div>
          </div>
        </div>

        {/* Jami daromad */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
              <Wallet className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Jami daromad</p>
              <p className="text-lg font-bold text-emerald-600">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>

        {/* Sof foyda */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                stats.profit >= 0 ? "bg-emerald-100" : "bg-red-100"
              )}
            >
              <TrendingUp
                className={cn(
                  "h-5 w-5",
                  stats.profit >= 0 ? "text-emerald-600" : "text-red-600"
                )}
              />
            </div>
            <div>
              <p className="text-xs text-gray-500">Sof foyda</p>
              <p
                className={cn(
                  "text-lg font-bold",
                  stats.profit >= 0 ? "text-emerald-600" : "text-red-600"
                )}
              >
                {formatCurrency(stats.profit)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Tablar ---- */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* Tab sarlavhalar */}
        <div className="flex border-b border-gray-100">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors sm:flex-none",
                  isActive
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab kontent */}
        <div className="p-4 sm:p-6">
          {activeTab === "stock" && <StockTab stockMovements={stockMovements} />}
          {activeTab === "info" && <InfoTab product={product} />}
        </div>
      </div>
    </div>
  );
}

// ---- Tab: Zaxira tarixi --------------------------------------------------

interface StockTabProps {
  stockMovements: any[];
}

function StockTab({ stockMovements }: StockTabProps) {
  if (stockMovements.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <History className="mb-3 h-10 w-10 text-gray-300" />
        <p className="text-sm font-medium text-gray-500">Zaxira tarixi yo&apos;q</p>
        <p className="mt-1 text-xs text-gray-400">Bu mahsulotda zaxira harakatlari hali yo&apos;q</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="whitespace-nowrap pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Sana
            </th>
            <th className="whitespace-nowrap pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Tur
            </th>
            <th className="whitespace-nowrap pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Miqdor
            </th>
            <th className="whitespace-nowrap pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Qoldiq
            </th>
            <th className="whitespace-nowrap pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Kimga
            </th>
            <th className="whitespace-nowrap pb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Izoh
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {stockMovements.map((movement: any) => {
            const badge = getMovementTypeBadge(movement.type);
            const isPositive = movement.quantity > 0;
            return (
              <tr key={movement._id} className="transition-colors hover:bg-gray-50">
                <td className="whitespace-nowrap py-3 pr-4 text-sm text-gray-600">
                  <div>{formatDate(movement.createdAt)}</div>
                  <div className="text-xs text-gray-400">{formatTime(movement.createdAt)}</div>
                </td>
                <td className="whitespace-nowrap py-3 pr-4">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium",
                      badge.color
                    )}
                  >
                    {badge.text}
                  </span>
                </td>
                <td className="whitespace-nowrap py-3 pr-4 text-sm">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 font-semibold",
                      isPositive ? "text-emerald-600" : "text-red-600"
                    )}
                  >
                    {isPositive ? (
                      <ArrowUpCircle className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownCircle className="h-3.5 w-3.5" />
                    )}
                    {isPositive ? "+" : ""}
                    {movement.quantity}
                  </span>
                </td>
                <td className="whitespace-nowrap py-3 pr-4 text-sm text-gray-600">
                  <span className="text-gray-400">{movement.previousStock}</span>
                  <span className="mx-1.5 text-gray-300">&rarr;</span>
                  <span className="font-medium text-gray-700">{movement.newStock}</span>
                </td>
                <td className="whitespace-nowrap py-3 pr-4 text-sm">
                  {movement.type === "sale" && movement.memberName ? (
                    <span className="inline-flex items-center gap-1.5 font-medium text-gray-700">
                      <User className="h-3.5 w-3.5 text-gray-400" />
                      {movement.memberName}
                    </span>
                  ) : (
                    <Minus className="inline h-4 w-4 text-gray-300" />
                  )}
                </td>
                <td className="py-3 text-sm text-gray-500">
                  {movement.description || <Minus className="inline h-4 w-4 text-gray-300" />}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---- Tab 3: Ma'lumotlar -----------------------------------------------------

interface InfoTabProps {
  product: any;
}

function InfoTab({ product }: InfoTabProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Asosiy ma'lumotlar */}
      <div className="rounded-xl border border-gray-100 p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Package className="h-4 w-4 text-blue-600" />
          Mahsulot ma&apos;lumotlari
        </h3>
        <div className="space-y-3">
          <InfoRow icon={Package} label="Nomi" value={product.name} />
          <InfoRow
            icon={Tag}
            label="Kategoriya"
            value={categoryLabels[product.category] || product.category}
          />
          <InfoRow
            icon={DollarSign}
            label="Sotish narxi"
            value={formatCurrency(product.price)}
          />
          <InfoRow
            icon={DollarSign}
            label="Tan narxi"
            value={formatCurrency(product.costPrice)}
          />
          <InfoRow
            icon={AlertTriangle}
            label="Minimal ogohlantirish"
            value={`${product.minStockAlert ?? 5} ta`}
          />
          <InfoRow
            icon={Calendar}
            label="Yaratilgan sana"
            value={formatDate(product.createdAt)}
          />
        </div>
      </div>

      {/* Mahsulot rasmi */}
      <div className="rounded-xl border border-gray-100 p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <BarChart3 className="h-4 w-4 text-blue-600" />
          Mahsulot rasmi
        </h3>
        {product.image ? (
          <div className="flex items-center justify-center">
            <div className="overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 p-2">
              <img
                src={product.image}
                alt={product.name}
                className="h-48 w-48 rounded-xl object-cover"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-3">
              <CategoryIcon category={product.category} size="lg" />
            </div>
            <p className="text-sm text-gray-500">Rasm yuklanmagan</p>
            <p className="mt-1 text-xs text-gray-400">Kategoriya ikonkasi ko&apos;rsatilmoqda</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Yordamchi InfoRow komponenti -------------------------------------------

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="flex items-center gap-2 text-sm text-gray-500">
        <Icon className="h-3.5 w-3.5 text-gray-400" />
        {label}
      </span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}
