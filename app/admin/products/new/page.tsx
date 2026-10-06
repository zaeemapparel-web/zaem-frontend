"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Sparkles,
  Plus,
  X,
  Loader2,
  Upload,
} from "lucide-react";
import AdminCategorySelector from "@/components/AdminCategorySelector";



const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    stock: "",
    sku: "",
    images: [""],
    sizes: "",
    colors: "",
    isFeatured: false,
    isActive: true,
  });

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...form.images];
    newImages[index] = value;
    setForm((prev) => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setForm((prev) => ({ ...prev, images: [...prev.images, ""] }));
  };

  const removeImageField = (index: number) => {
    if (form.images.length === 1) return;
    const newImages = form.images.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, images: newImages }));
  };

  // ==================== AI DESCRIPTION ====================
  const generateDescription = async () => {
    if (!form.name || !form.price) {
      setError("Name aur price pehle bharein");
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
          colors: form.colors
            ? form.colors.split(",").map((c) => c.trim()).filter(Boolean)
            : [],
          sizes: form.sizes
            ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setForm((prev) => ({ ...prev, description: data.data.description }));
      } else {
        setError(data.message || "AI generation failed");
      }
    } catch (error) {
      setError("AI service temporarily unavailable");
    } finally {
      setGenerating(false);
    }
  };

  // ==================== SUBMIT ====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.categoryId) {
      setError("Category select karein");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("zaem_token");
      if (!token) {
        router.push("/admin/login");
        return;
      }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
        categoryId: form.categoryId,
        stock: Number(form.stock) || 0,
        sku: form.sku.trim() || null,
        images: form.images.filter((img) => img.trim()),
        sizes: form.sizes
          ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        colors: form.colors
          ? form.colors.split(",").map((c) => c.trim()).filter(Boolean)
          : [],
        isFeatured: form.isFeatured,
        isActive: form.isActive,
      };

      const res = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess("Product created successfully!");
        setTimeout(() => router.push("/admin/products"), 1200);
      } else {
        setError(data.message || "Failed to create product");
      }
    } catch (error) {
      console.error(error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>

      {/* ============ HEADER ============ */}
      <div className="sticky top-[64px] z-20 bg-[#FBFBFD]/95 dark:bg-black/95 backdrop-blur-xl border-b border-[#E5E5E7] dark:border-[#38383A] -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8">
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
                Add Product
              </p>
              <h1 className="font-display text-xl md:text-2xl text-[#1D1D1F] dark:text-white">
                New Product
              </h1>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="admin-btn admin-btn-primary disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" strokeWidth={2} />
            )}
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* ============ FORM ============ */}
      <form onSubmit={handleSubmit} className="pt-6">
        {error && (
          <div className="mb-6 p-4 bg-[#FFEBEE] border-l-2 border-[#C62828] text-[#C62828] text-[13px] rounded-r-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-[#E8F5E9] border-l-2 border-[#2E7D32] text-[#2E7D32] text-[13px] rounded-r-lg">
            ✓ {success}
          </div>
        )}

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
                    required
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g., White Cotton Shirt"
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
                    required
                    rows={6}
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
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
              <h2 className="font-display text-lg text-[#1D1D1F] dark:text-white border-b border-[#E5E5E7] dark:border-[#38383A] pb-3 mb-5">
                Product Images
              </h2>

              <div className="space-y-3">
                {form.images.map((img, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1 flex items-center gap-2 admin-input !py-0">
                      <Upload className="w-4 h-4 text-[#86868B] shrink-0 ml-3" strokeWidth={2} />
                      <input
                        type="url"
                        value={img}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="flex-1 bg-transparent outline-none py-3 text-[13px]"
                      />
                    </div>
                    {form.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageField(index)}
                        className="w-12 flex items-center justify-center rounded-lg border border-[#D2D2D7] hover:bg-[#FFEBEE] hover:border-[#C62828] hover:text-[#C62828] text-[#86868B] transition-colors"
                      >
                        <X className="w-4 h-4" strokeWidth={2} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addImageField}
                className="mt-4 flex items-center gap-2 text-[12px] font-medium text-[#6E6E73] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                Add another image
              </button>

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

            {/* Variants */}
            <div className="admin-card p-6">
              <h2 className="font-display text-lg text-[#1D1D1F] dark:text-white border-b border-[#E5E5E7] dark:border-[#38383A] pb-3 mb-5">
                Variants
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="admin-label">Sizes (comma separated)</label>
                  <input
                    type="text"
                    value={form.sizes}
                    onChange={(e) => handleChange("sizes", e.target.value)}
                    placeholder="S, M, L, XL"
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="admin-label">Colors (comma separated)</label>
                  <input
                    type="text"
                    value={form.colors}
                    onChange={(e) => handleChange("colors", e.target.value)}
                    placeholder="Black, White, Cognac"
                    className="admin-input"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* ============ RIGHT — SIDEBAR ============ */}
          <div className="space-y-6">

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
                    required
                    value={form.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    placeholder="4500"
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="admin-label">Compare Price (PKR)</label>
                  <input
                    type="number"
                    value={form.comparePrice}
                    onChange={(e) => handleChange("comparePrice", e.target.value)}
                    placeholder="6000 (optional)"
                    className="admin-input"
                  />
                  <p className="text-[11px] text-[#86868B] mt-2">
                    Discount dikhane ke liye
                  </p>
                </div>
              </div>
            </div>

            {/* Organization */}
            <div className="admin-card p-6">
              <h2 className="font-display text-lg text-[#1D1D1F] dark:text-white border-b border-[#E5E5E7] dark:border-[#38383A] pb-3 mb-5">
                Organization
              </h2>

              {/* ⭐ NEW 3-LEVEL SELECTOR */}
              <div className="mb-5">
                <AdminCategorySelector
                  value={form.categoryId}
                  onChange={(id, path) => {
                    handleChange("categoryId", id);
                    setCategoryPath(path);
                  }}
                  required={true}
                />
              </div>

              <div className="space-y-5">
                <div>
                  <label className="admin-label">Stock Quantity</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => handleChange("stock", e.target.value)}
                    placeholder="10"
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="admin-label">SKU (optional)</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => handleChange("sku", e.target.value)}
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
                    onChange={(e) => handleChange("isActive", e.target.checked)}
                    className="w-4 h-4 rounded accent-[#1D1D1F]"
                  />
                  <span className="text-[13px] text-[#1D1D1F] dark:text-white">
                    Active (visible on site)
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => handleChange("isFeatured", e.target.checked)}
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

        {/* ============ BOTTOM BAR ============ */}
        <div className="mt-8 flex justify-end gap-3">
          <Link
            href="/admin/products"
            className="admin-btn admin-btn-secondary"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="admin-btn admin-btn-primary disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" strokeWidth={2} />
            )}
            {loading ? "Saving..." : "Create Product"}
          </button>
        </div>

      </form>
    </main>
  );
}