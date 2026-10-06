"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Plus, X, Sparkles, Loader2, Save, Upload } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import AdminCategorySelector from "@/components/AdminCategorySelector";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { loadFromStorage } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categoryPath, setCategoryPath] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    comparePrice: "",
    categoryId: "",
    images: [""],
    sizes: [] as string[],
    colors: [] as string[],
    stock: "",
    sku: "",
    isFeatured: false,
    isActive: true,
  });

  const [sizeInput, setSizeInput] = useState("");
  const [colorInput, setColorInput] = useState("");

  // ==================== FETCH PRODUCT ====================
  useEffect(() => {
    loadFromStorage();

    const fetchProduct = async () => {
      try {
        const prodRes = await fetch(`${API_URL}/api/products/id/${productId}`);
        if (!prodRes.ok) {
          const allRes = await fetch(`${API_URL}/api/products?limit=200`);
          const allData = await allRes.json();
          if (allData.success) {
            const product = allData.data.products.find(
              (p: any) => p.id === productId
            );
            if (product) fillForm(product);
          }
        } else {
          const prodData = await prodRes.json();
          if (prodData.success) fillForm(prodData.data.product);
        }
      } catch (error) {
        console.error(error);
        setError("Product load nahi ho paya");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [loadFromStorage, productId]);

  const fillForm = (product: any) => {
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      comparePrice: product.comparePrice?.toString() || "",
      categoryId: product.categoryId || "",
      images: product.images?.length > 0 ? product.images : [""],
      sizes: product.sizes || [],
      colors: product.colors || [],
      stock: product.stock?.toString() || "",
      sku: product.sku || "",
      isFeatured: product.isFeatured || false,
      isActive: product.isActive !== false,
    });
  };

  const update = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ==================== IMAGE HANDLERS ====================
  const addImage = () => update("images", [...form.images, ""]);
  const updateImage = (index: number, value: string) => {
    const newImages = [...form.images];
    newImages[index] = value;
    update("images", newImages);
  };
  const removeImage = (index: number) => {
    if (form.images.length === 1) return;
    update("images", form.images.filter((_, i) => i !== index));
  };

  // ==================== SIZE HANDLERS ====================
  const addSize = () => {
    if (sizeInput.trim() && !form.sizes.includes(sizeInput.trim())) {
      update("sizes", [...form.sizes, sizeInput.trim()]);
      setSizeInput("");
    }
  };
  const removeSize = (size: string) => {
    update("sizes", form.sizes.filter((s) => s !== size));
  };

  // ==================== COLOR HANDLERS ====================
  const addColor = () => {
    if (colorInput.trim() && !form.colors.includes(colorInput.trim())) {
      update("colors", [...form.colors, colorInput.trim()]);
      setColorInput("");
    }
  };
  const removeColor = (color: string) => {
    update("colors", form.colors.filter((c) => c !== color));
  };

  // ==================== AI DESCRIPTION ====================
  const generateDescription = async () => {
    if (!form.name || !form.price) {
      setError("Product name aur price pehle bharein");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/ai/generate-description`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          price: Number(form.price),
          category: categoryPath || "Fashion",
          colors: form.colors,
          sizes: form.sizes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        update("description", data.data.description);
      } else {
        setError(data.message || "AI generation failed");
        setTimeout(() => setError(""), 3000);
      }
    } catch (error) {
      setError("AI service unavailable. Try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setGenerating(false);
    }
  };

  // ==================== SUBMIT ====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.categoryId) {
      setError("Category select karein");
      return;
    }

    const token = localStorage.getItem("zaem_token");
    if (!token) return;

    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          comparePrice: form.comparePrice
            ? parseFloat(form.comparePrice)
            : null,
          stock: parseInt(form.stock) || 0,
          images: form.images.filter((img) => img.trim() !== ""),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess("Product updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to update product");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ==================== LOADING ====================
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-[#86868B]" strokeWidth={2} />
      </div>
    );
  }

  // ==================== RENDER ====================
  return (
    <main>

      {/* ============ HEADER ============ */}
      <div className="sticky top-[64px] z-20 bg-[#FBFBFD]/95 dark:bg-black/95 backdrop-blur-xl border-b border-[#E5E5E7] dark:border-[#38383A] -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 mb-6">
        <div className="py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/products"
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#1D1D1F] dark:text-white" strokeWidth={1.8} />
            </Link>
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#86868B] mb-0.5">
                Edit Product
              </p>
              <h1 className="font-display text-xl md:text-2xl text-[#1D1D1F] dark:text-white truncate max-w-[200px] md:max-w-none">
                {form.name || "Loading..."}
              </h1>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="admin-btn admin-btn-primary disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" strokeWidth={2} />
            )}
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* ============ MESSAGES ============ */}
      {error && (
        <div className="mb-6 p-4 bg-[#FFEBEE] border-l-2 border-[#C62828] text-[#C62828] text-[13px] rounded-r-lg admin-fade-in">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-[#E8F5E9] border-l-2 border-[#2E7D32] text-[#2E7D32] text-[13px] rounded-r-lg admin-fade-in">
          ✓ {success}
        </div>
      )}

      {/* ============ FORM ============ */}
      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ============ LEFT — MAIN ============ */}
          <div className="lg:col-span-2 space-y-6">

            {/* Basic Info */}
            <div className="admin-card p-6">
              <h2 className="font-display text-lg text-[#1D1D1F] dark:text-white border-b border-[#E5E5E7] dark:border-[#38383A] pb-3 mb-5">
                Basic Information
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="admin-label">
                    Product Name <span className="text-[#C62828]">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    required
                    placeholder="Product name"
                    className="admin-input"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="admin-label !mb-0">
                      Description <span className="text-[#C62828]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={generateDescription}
                      disabled={generating}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] text-[10px] tracking-wider uppercase font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          AI Generate
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    required
                    rows={5}
                    placeholder="Product description..."
                    className="admin-input resize-none"
                  />
                  <p className="text-[11px] text-[#86868B] mt-2">
                    💡 Tip: Name aur price bharein, phir AI button dabayein
                  </p>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="admin-card p-6">
              <div className="flex items-center justify-between mb-5 border-b border-[#E5E5E7] dark:border-[#38383A] pb-3">
                <h2 className="font-display text-lg text-[#1D1D1F] dark:text-white">
                  Product Images
                </h2>
                <button
                  type="button"
                  onClick={addImage}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-[#6E6E73] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  Add Image
                </button>
              </div>

              <div className="space-y-3">
                {form.images.map((img, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[11px] text-[#86868B] w-5 shrink-0">
                      {i + 1}.
                    </span>
                    <div className="flex-1 flex items-center gap-2 admin-input !py-0">
                      <Upload className="w-4 h-4 text-[#86868B] shrink-0 ml-3" strokeWidth={2} />
                      <input
                        type="url"
                        value={img}
                        onChange={(e) => updateImage(i, e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="flex-1 bg-transparent outline-none py-3 text-[13px]"
                      />
                    </div>
                    {form.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg text-[#86868B] hover:bg-[#FFEBEE] hover:text-[#C62828] transition-colors"
                      >
                        <X className="w-4 h-4" strokeWidth={2} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {form.images[0] && (
                <div className="pt-4 mt-4 border-t border-[#E5E5E7] dark:border-[#38383A]">
                  <p className="admin-label">Preview</p>
                  <img
                    src={form.images[0]}
                    alt="Preview"
                    className="w-32 h-40 object-cover rounded-lg bg-[#F5F5F7] dark:bg-[#2C2C2E]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = "0.3";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Sizes */}
            <div className="admin-card p-6">
              <h2 className="font-display text-lg text-[#1D1D1F] dark:text-white border-b border-[#E5E5E7] dark:border-[#38383A] pb-3 mb-5">
                Sizes
              </h2>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addSize())
                  }
                  placeholder="Add size (S, M, L, XL)"
                  className="admin-input"
                />
                <button
                  type="button"
                  onClick={addSize}
                  className="admin-btn admin-btn-secondary shrink-0"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {form.sizes.map((size) => (
                  <span
                    key={size}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[12px] font-medium text-[#1D1D1F] dark:text-white rounded-md"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => removeSize(size)}
                      className="text-[#86868B] hover:text-[#C62828] transition-colors"
                    >
                      <X className="w-3 h-3" strokeWidth={2} />
                    </button>
                  </span>
                ))}
                {form.sizes.length === 0 && (
                  <p className="text-[12px] text-[#86868B] italic">
                    No sizes added yet
                  </p>
                )}
              </div>
            </div>

            {/* Colors */}
            <div className="admin-card p-6">
              <h2 className="font-display text-lg text-[#1D1D1F] dark:text-white border-b border-[#E5E5E7] dark:border-[#38383A] pb-3 mb-5">
                Colors
              </h2>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addColor())
                  }
                  placeholder="Add color (Ivory, Charcoal)"
                  className="admin-input"
                />
                <button
                  type="button"
                  onClick={addColor}
                  className="admin-btn admin-btn-secondary shrink-0"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {form.colors.map((color) => (
                  <span
                    key={color}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[12px] font-medium text-[#1D1D1F] dark:text-white rounded-md"
                  >
                    {color}
                    <button
                      type="button"
                      onClick={() => removeColor(color)}
                      className="text-[#86868B] hover:text-[#C62828] transition-colors"
                    >
                      <X className="w-3 h-3" strokeWidth={2} />
                    </button>
                  </span>
                ))}
                {form.colors.length === 0 && (
                  <p className="text-[12px] text-[#86868B] italic">
                    No colors added yet
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* ============ RIGHT — SIDEBAR ============ */}
          <div className="space-y-6">

            {/* Organization — 3-LEVEL CATEGORY SELECTOR */}
            <div className="admin-card p-6">
              <h2 className="font-display text-lg text-[#1D1D1F] dark:text-white border-b border-[#E5E5E7] dark:border-[#38383A] pb-3 mb-5">
                Organization
              </h2>

              <AdminCategorySelector
                value={form.categoryId}
                onChange={(id, path) => {
                  update("categoryId", id);
                  setCategoryPath(path);
                }}
                required={true}
              />
            </div>

            {/* Pricing */}
            <div className="admin-card p-6">
              <h2 className="font-display text-lg text-[#1D1D1F] dark:text-white border-b border-[#E5E5E7] dark:border-[#38383A] pb-3 mb-5">
                Pricing
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="admin-label">
                    Price (PKR) <span className="text-[#C62828]">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => update("price", e.target.value)}
                    required
                    placeholder="4500"
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="admin-label">Compare Price (PKR)</label>
                  <input
                    type="number"
                    value={form.comparePrice}
                    onChange={(e) => update("comparePrice", e.target.value)}
                    placeholder="6000 (optional)"
                    className="admin-input"
                  />
                  <p className="text-[11px] text-[#86868B] mt-2">
                    Discount dikhane ke liye
                  </p>
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="admin-card p-6">
              <h2 className="font-display text-lg text-[#1D1D1F] dark:text-white border-b border-[#E5E5E7] dark:border-[#38383A] pb-3 mb-5">
                Inventory
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="admin-label">Stock Quantity</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => update("stock", e.target.value)}
                    placeholder="10"
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="admin-label">SKU (optional)</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => update("sku", e.target.value)}
                    placeholder="WHITE-SHIRT-001"
                    className="admin-input"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="admin-card p-6">
              <h2 className="font-display text-lg text-[#1D1D1F] dark:text-white border-b border-[#E5E5E7] dark:border-[#38383A] pb-3 mb-5">
                Status
              </h2>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => update("isActive", e.target.checked)}
                    className="w-4 h-4 rounded accent-[#1D1D1F]"
                  />
                  <span className="text-[13px] text-[#1D1D1F] dark:text-white">
                    Active (visible in store)
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => update("isFeatured", e.target.checked)}
                    className="w-4 h-4 rounded accent-[#1D1D1F]"
                  />
                  <span className="text-[13px] text-[#1D1D1F] dark:text-white">
                    Featured on homepage
                  </span>
                </label>
              </div>
            </div>

          </div>

        </div>

        {/* ============ BOTTOM ACTIONS ============ */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-end">
          <Link
            href="/admin/products"
            className="admin-btn admin-btn-secondary justify-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="admin-btn admin-btn-primary disabled:opacity-50 justify-center"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" strokeWidth={2} />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </form>

    </main>
  );
}