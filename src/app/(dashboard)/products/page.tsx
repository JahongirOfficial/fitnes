"use client";

import { useState } from "react";
import {
  Plus,
  Package,
  ShoppingCart,
  AlertTriangle,
  Search,
  Pencil,
  Trash2,
  ShoppingBag,
  Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useSellProduct } from "@/lib/hooks";
import { useDebounce } from "@/lib/useDebounce";
import { CategoryIcon } from "@/lib/categoryIcons";
import { ProductCardSkeleton, StatCardSkeleton } from "@/components/ui/Skeleton";
import ProductModal from "@/components/products/ProductModal";
import SellModal from "@/components/products/SellModal";

type Category = "all" | "drink" | "chocolate" | "cocktail" | "yogurt";

const categoryLabels: Record<string, string> = {
  all: "Barchasi",
  drink: "Ichimliklar",
  chocolate: "Shokoladlar",
  cocktail: "Kokteylar",
  yogurt: "Yogurtlar",
};

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
}

export default function ProductsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const debouncedSearch = useDebounce(searchQuery, 500);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productModalMode, setProductModalMode] = useState<"create" | "edit">("create");
  const [selectedProduct, setSelectedProduct] = useState<any>(undefined);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [sellProduct, setSellProduct] = useState<any>(undefined);

  const queryParams = {
    ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
    ...(activeCategory !== "all" ? { category: activeCategory } : {}),
  };

  const { data, isLoading } = useProducts(queryParams);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const sellProductMutation = useSellProduct();

  const products = data?.products || [];
  const prodStats = data?.stats || {};

  const openCreateProduct = () => {
    setSelectedProduct(undefined);
    setProductModalMode("create");
    setProductModalOpen(true);
  };
  const openEditProduct = (p: any) => {
    setSelectedProduct(p);
    setProductModalMode("edit");
    setProductModalOpen(true);
  };
  const openSellProduct = (p: any) => {
    setSellProduct(p);
    setSellModalOpen(true);
  };

  const handleProductSubmit = async (formData: FormData) => {
    if (productModalMode === "create") {
      await createProduct.mutateAsync(formData);
      toast("success", "Mahsulot qo'shildi");
    } else if (selectedProduct) {
      await updateProduct.mutateAsync({ id: selectedProduct._id, formData });
      toast("success", "Mahsulot yangilandi");
    }
  };

  const handleDeleteProduct = async (product: any) => {
    if (!confirm(`${product.name} ni o'chirmoqchimisiz?`)) return;
    try {
      await deleteProduct.mutateAsync(product._id);
      toast("success", `${product.name} o'chirildi`);
    } catch (err: any) {
      toast("error", err.message || "O'chirishda xatolik");
    }
  };

  const handleSellSubmit = async (data: { quantity: number; paymentMethod: string; memberId?: string; memberName?: string }) => {
    if (!sellProduct) return;
    await sellProductMutation.mutateAsync({ id: sellProduct._id, data });
    toast("success", `${sellProduct.name} sotildi!`);
  };

  const totalProducts = prodStats.totalProducts || products.length;
  const warehouseValue =
    prodStats.warehouseValue ||
    products.reduce((sum: number, p: any) => sum + p.price * (p.stockQuantity || 0), 0);
  const lowStockCount =
    prodStats.lowStockCount ||
    products.filter((p: any) => (p.stockQuantity || 0) <= (p.minStockAlert || 5)).length;

  const summaryCards = [
    { title: "Jami Mahsulotlar", value: `${totalProducts} ta`, icon: Package, color: "text-blue-600", iconBg: "bg-blue-100" },
    { title: "Ombordagi Qiymat", value: formatPrice(warehouseValue), icon: Warehouse, color: "text-emerald-600", iconBg: "bg-emerald-100" },
    { title: "Kam Qoldiq", value: `${lowStockCount} ta`, icon: AlertTriangle, color: "text-red-600", iconBg: "bg-red-100" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
        <button
          onClick={openCreateProduct}
          className={cn(
            "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl",
            "bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold",
            "shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30",
            "transform hover:-translate-y-0.5 transition-all duration-200"
          )}
        >
          <Plus className="w-5 h-5" />
          Yangi Mahsulot
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
          : summaryCards.map((card) => (
              <div key={card.title} className={cn("bg-white rounded-2xl p-5 card-hover", "border border-gray-100")}>
                <div className="flex items-center gap-4">
                  <div className={cn("flex items-center justify-center w-12 h-12 rounded-xl", card.iconBg)}>
                    <card.icon className={cn("w-6 h-6", card.color)} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{card.title}</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900 mt-0.5">{card.value}</p>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Search + Category Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Mahsulot qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full pl-11 pr-4 py-2.5 rounded-xl",
              "bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            )}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(Object.keys(categoryLabels) as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                activeCategory === cat
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              )}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Package className="w-16 h-16 mb-4 stroke-1" />
          <p className="text-lg font-medium mb-2">Mahsulot topilmadi</p>
          <p className="text-sm text-gray-400 mb-4">Yangi mahsulot qo&apos;shishni boshlang</p>
          <button
            onClick={openCreateProduct}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Qo&apos;shish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product: any, idx: number) => {
            const stock = product.stockQuantity ?? product.stock ?? 0;
            const minStock = product.minStockAlert ?? product.minStock ?? 5;
            const isLowStock = stock <= minStock;
            const stockPercent = Math.min((stock / (minStock * 5)) * 100, 100);
            const categoryBadgeColors: Record<string, string> = {
              drink: "bg-blue-100 text-blue-700",
              chocolate: "bg-amber-100 text-amber-700",
              cocktail: "bg-purple-100 text-purple-700",
              yogurt: "bg-pink-100 text-pink-700",
            };
            return (
              <div
                key={product._id}
                className={cn(
                  "bg-white rounded-2xl p-4 sm:p-5 card-hover-lg",
                  "border border-gray-100 relative overflow-hidden animate-fade-in"
                )}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <span
                  className={cn(
                    "absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full",
                    categoryBadgeColors[product.category] || "bg-gray-100 text-gray-700"
                  )}
                >
                  {categoryLabels[product.category] || product.category}
                </span>

                {/* Product Image or Category Icon */}
                <div className="flex items-center justify-center mt-2 mb-4">
                  {product.image ? (
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <CategoryIcon category={product.category} size="lg" />
                  )}
                </div>

                <h3 className="font-semibold text-base sm:text-lg text-gray-900 text-center mb-1 truncate">
                  {product.name}
                </h3>
                <p className="text-blue-600 font-bold text-lg sm:text-xl text-center mb-4">
                  {formatPrice(product.price)}
                </p>
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-500">Qoldiq: {stock} ta</span>
                    {isLowStock && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                        <AlertTriangle className="w-3 h-3" />
                        Kam qoldiq!
                      </span>
                    )}
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        isLowStock
                          ? "bg-gradient-to-r from-red-500 to-red-400"
                          : "bg-gradient-to-r from-emerald-500 to-emerald-400"
                      )}
                      style={{ width: `${stockPercent}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => openSellProduct(product)}
                    className={cn(
                      "flex-1 inline-flex items-center justify-center gap-1.5",
                      "px-4 py-2 rounded-xl text-sm font-semibold",
                      "border-2 border-blue-600 text-blue-600",
                      "hover:bg-blue-600 hover:text-white transition-all duration-200"
                    )}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Sotish
                  </button>
                  <button
                    onClick={() => openEditProduct(product)}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
                    title="Tahrirlash"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product)}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <ProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onSubmit={handleProductSubmit}
        product={selectedProduct}
        mode={productModalMode}
      />
      <SellModal
        isOpen={sellModalOpen}
        onClose={() => setSellModalOpen(false)}
        onSubmit={handleSellSubmit}
        product={sellProduct}
      />
    </div>
  );
}
