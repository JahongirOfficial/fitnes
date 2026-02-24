"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Save, Plus, Upload, X, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface RecipeItem {
  ingredientId: string;
  quantity: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  product?: any;
  mode: "create" | "edit";
}

const categories = [
  { value: "drink", label: "Ichimlik" },
  { value: "chocolate", label: "Shokolad" },
  { value: "cocktail", label: "Kokteyl" },
  { value: "yogurt", label: "Yogurt" },
  { value: "other", label: "Boshqa" },
];

export default function ProductModal({ isOpen, onClose, onSubmit, product, mode }: ProductModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "drink",
    price: "",
    costPrice: "",
    stockQuantity: "",
    minStockAlert: "5",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Recipe state (for cocktails)
  const [recipe, setRecipe] = useState<RecipeItem[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  // Load all products for ingredient selector
  useEffect(() => {
    if (!isOpen) return;
    const loadProducts = async () => {
      try {
        const data = await api.getProducts({});
        setAllProducts(data.products || []);
      } catch {
        /* ignore */
      }
    };
    loadProducts();
  }, [isOpen]);

  useEffect(() => {
    if (product && mode === "edit") {
      setForm({
        name: product.name || "",
        category: product.category || "drink",
        price: String(product.price || ""),
        costPrice: String(product.costPrice || ""),
        stockQuantity: String(product.stockQuantity ?? product.stock ?? ""),
        minStockAlert: String(product.minStockAlert ?? product.minStock ?? "5"),
      });
      if (product.image) {
        setImagePreview(product.image);
      } else {
        setImagePreview(null);
      }
      setImageFile(null);
      setRemoveImage(false);
      // Load recipe
      if (product.recipe && product.recipe.length > 0) {
        setRecipe(product.recipe.map((r: any) => ({
          ingredientId: r.ingredientId || "",
          quantity: String(r.quantity || ""),
        })));
      } else {
        setRecipe([]);
      }
    } else {
      setForm({ name: "", category: "drink", price: "", costPrice: "", stockQuantity: "", minStockAlert: "5" });
      setImageFile(null);
      setImagePreview(null);
      setRemoveImage(false);
      setRecipe([]);
    }
  }, [product, mode, isOpen]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;
    setImageFile(file);
    setRemoveImage(false);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addRecipeItem = () => {
    setRecipe((prev) => [...prev, { ingredientId: "", quantity: "" }]);
  };

  const updateRecipeItem = (index: number, field: keyof RecipeItem, value: string) => {
    setRecipe((prev) => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const removeRecipeItem = (index: number) => {
    setRecipe((prev) => prev.filter((_, i) => i !== index));
  };

  const isCocktail = form.category === "cocktail";

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.price) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("category", form.category);
      formData.append("price", form.price);
      formData.append("costPrice", form.costPrice || "0");
      formData.append("stockQuantity", isCocktail ? "0" : (form.stockQuantity || "0"));
      formData.append("minStockAlert", form.minStockAlert || "5");

      if (isCocktail) {
        const validRecipe = recipe.filter((r) => r.ingredientId && r.quantity);
        formData.append("recipe", JSON.stringify(validRecipe.map((r) => ({
          ingredientId: r.ingredientId,
          quantity: Number(r.quantity),
        }))));
      } else {
        formData.append("recipe", JSON.stringify([]));
      }

      if (imageFile) {
        formData.append("image", imageFile);
      } else if (removeImage) {
        formData.append("removeImage", "true");
      }

      await onSubmit(formData);
      onClose();
    } catch {
      /* parent handles */
    } finally {
      setIsLoading(false);
    }
  };

  // Ingredients available for selection (exclude the current product if editing)
  const ingredientOptions = allProducts.filter(
    (p) => p._id !== product?._id && p._id !== product?.id
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "Yangi Mahsulot" : "Mahsulotni Tahrirlash"}
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
            disabled={isLoading || !form.name.trim() || !form.price}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all",
              "bg-blue-600 hover:bg-blue-700",
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
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Rasm</label>
          {imagePreview ? (
            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center shadow-lg transition"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "w-full h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all",
                isDragOver
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50"
              )}
            >
              <Upload className={cn("w-8 h-8 mb-2", isDragOver ? "text-blue-500" : "text-gray-400")} />
              <p className="text-sm text-gray-500">Rasmni bu yerga tashlang yoki bosing</p>
              <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP (max 5MB)</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            className="hidden"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomi *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Mahsulot nomi"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategoriya</label>
          <select
            value={form.category}
            onChange={(e) => {
              const cat = e.target.value;
              setForm((p) => ({ ...p, category: cat }));
              if (cat !== "cocktail") setRecipe([]);
            }}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Sotish narxi *</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
              placeholder="0"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tannarx</label>
            <input
              type="number"
              value={form.costPrice}
              onChange={(e) => setForm((p) => ({ ...p, costPrice: e.target.value }))}
              placeholder="0"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        {/* Stock fields — hidden for cocktails (retseptdan hisoblanadi) */}
        {!isCocktail && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Qoldiq</label>
              <input
                type="number"
                value={form.stockQuantity}
                onChange={(e) => setForm((p) => ({ ...p, stockQuantity: e.target.value }))}
                placeholder="0"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Min qoldiq</label>
              <input
                type="number"
                value={form.minStockAlert}
                onChange={(e) => setForm((p) => ({ ...p, minStockAlert: e.target.value }))}
                placeholder="5"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>
        )}

        {/* Recipe section — only for cocktails */}
        {isCocktail && (
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Retsept (ingredientlar)</h3>
              <button
                type="button"
                onClick={addRecipeItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
              >
                <Plus size={14} />
                Ingredient qo&apos;shish
              </button>
            </div>
            {recipe.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                Hozircha ingredient yo&apos;q. Qo&apos;shish tugmasini bosing.
              </p>
            ) : (
              <div className="space-y-2">
                {recipe.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <select
                      value={item.ingredientId}
                      onChange={(e) => updateRecipeItem(index, "ingredientId", e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    >
                      <option value="">Ingredient tanlang</option>
                      {ingredientOptions.map((p) => (
                        <option key={p._id || p.id} value={p._id || p.id}>
                          {p.name} (qoldiq: {p.stockQuantity})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => updateRecipeItem(index, "quantity", e.target.value)}
                      placeholder="Miqdor"
                      className="w-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => removeRecipeItem(index)}
                      className="w-9 h-9 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <p className="text-xs text-gray-400 mt-1">
                  Miqdor = 1 ta kokteyl uchun kerakli miqdor (litr, dona va h.k.)
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
