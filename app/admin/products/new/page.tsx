"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, Sparkles, Plus, X, Loader2, Upload,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/categories`);
        const data = await res.json();
        if (data.success) {
          setCategories(data.data.categories || []);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchCategories();
  }, []);

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

  // AI Description Generator
  const generateDescription = async () => {
    if (!form.name || !form.price) {
      setError("Name aur price pehle bharein");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const selectedCategory = categories.find((c) => c.id === form.categoryId);
      const res = await fetch(`${API_URL}/api/ai/generate-description`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          price: Number(form.price),
          category: selectedCategory?.name || "Fashion",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("zaem_token");
      if (!token) {
        router.push("/account/login");
        return;
      }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
        categoryId: form.categoryId || null,
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
    <main className="bg-ivory text-ink min-h-screen">

      {/* Header */}
      <div className="sticky top-0 z-30 bg-ivory/95 backdrop-blur-xl border-b border-ink/10">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/products"
              className="flex items-center justify-center w-10 h-10 hover:bg-bone transition-colors"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
            </Link>
            <div>
              <p className="text-label text-ink/50 mb-0.5">Add Product</p>
              <h1 className="font-display text-xl md:text-2xl">New Product</h1>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 bg-ink text-ivory text-label hover:bg-gold transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="max-w-[1400px] mx-auto px-4 md:px-8 py-8"
      >
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-2 border-red-500 text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-2 border-green-500 text-green-700 text-sm">
            ✓ {success}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT — Main Info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Basic Info */}
            <div className="bg-white border border-ink/10 p-6 space-y-5">
              <h2 className="font-display text-lg border-b border-ink/10 pb-3">
                Basic Information
              </h2>

              <div>
                <label className="text-label text-ink/60 block mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g., White Cotton Shirt"
                  className="w-full bg-transparent border border-ink/20 focus:border-ink outline-none px-4 py-3 text-sm font-body"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-label text-ink/60">
                    Description *
                  </label>
                  <button
                    type="button"
                    onClick={generateDescription}
                    disabled={generating}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-gold to-[#B8935A] text-ink text-[10px] tracking-wider uppercase font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        Generate with AI
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
                  className="w-full bg-transparent border border-ink/20 focus:border-ink outline-none px-4 py-3 text-sm font-body resize-none"
                />
                <p className="text-xs text-ink/40 mt-1">
                  💡 Tip: Name aur price bhar dein, phir AI button dabayein
                </p>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white border border-ink/10 p-6 space-y-4">
              <h2 className="font-display text-lg border-b border-ink/10 pb-3">
                Product Images
              </h2>

              {form.images.map((img, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 border border-ink/20 px-3">
                    <Upload className="w-4 h-4 text-ink/40 shrink-0" />
                    <input
                      type="url"
                      value={img}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 bg-transparent outline-none py-3 text-sm font-body"
                    />
                  </div>
                  {form.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="w-12 flex items-center justify-center border border-ink/20 hover:bg-red-50 hover:border-red-500 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addImageField}
                className="flex items-center gap-2 text-label text-ink/60 hover:text-ink transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add another image
              </button>

              {/* Image Preview */}
              {form.images[0] && (
                <div className="pt-3 border-t border-ink/10">
                  <p className="text-label text-ink/50 mb-2">Preview</p>
                  <img
                    src={form.images[0]}
                    alt="Preview"
                    className="w-32 h-40 object-cover bg-bone"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = "0.3";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Variants */}
            <div className="bg-white border border-ink/10 p-6 space-y-5">
              <h2 className="font-display text-lg border-b border-ink/10 pb-3">
                Variants
              </h2>

              <div>
                <label className="text-label text-ink/60 block mb-2">
                  Sizes (comma separated)
                </label>
                <input
                  type="text"
                  value={form.sizes}
                  onChange={(e) => handleChange("sizes", e.target.value)}
                  placeholder="S, M, L, XL"
                  className="w-full bg-transparent border border-ink/20 focus:border-ink outline-none px-4 py-3 text-sm font-body"
                />
              </div>

              <div>
                <label className="text-label text-ink/60 block mb-2">
                  Colors (comma separated)
                </label>
                <input
                  type="text"
                  value={form.colors}
                  onChange={(e) => handleChange("colors", e.target.value)}
                  placeholder="Black, White, Cognac"
                  className="w-full bg-transparent border border-ink/20 focus:border-ink outline-none px-4 py-3 text-sm font-body"
                />
              </div>
            </div>

          </div>

          {/* RIGHT — Sidebar */}
          <div className="space-y-6">

            {/* Pricing */}
            <div className="bg-white border border-ink/10 p-6 space-y-5">
              <h2 className="font-display text-lg border-b border-ink/10 pb-3">
                Pricing
              </h2>

              <div>
                <label className="text-label text-ink/60 block mb-2">
                  Price (PKR) *
                </label>
                <input
                  type="number"
                  required
                  value={form.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  placeholder="4500"
                  className="w-full bg-transparent border border-ink/20 focus:border-ink outline-none px-4 py-3 text-sm font-body"
                />
              </div>

              <div>
                <label className="text-label text-ink/60 block mb-2">
                  Compare Price (PKR)
                </label>
                <input
                  type="number"
                  value={form.comparePrice}
                  onChange={(e) => handleChange("comparePrice", e.target.value)}
                  placeholder="6000 (optional)"
                  className="w-full bg-transparent border border-ink/20 focus:border-ink outline-none px-4 py-3 text-sm font-body"
                />
                <p className="text-xs text-ink/40 mt-1">
                  Discount dikhane ke liye
                </p>
              </div>
            </div>

            {/* Organization */}
            <div className="bg-white border border-ink/10 p-6 space-y-5">
              <h2 className="font-display text-lg border-b border-ink/10 pb-3">
                Organization
              </h2>

              <div>
                <label className="text-label text-ink/60 block mb-2">
                  Category *
                </label>
                <select
                  required
                  value={form.categoryId}
                  onChange={(e) => handleChange("categoryId", e.target.value)}
                  className="w-full bg-transparent border border-ink/20 focus:border-ink outline-none px-4 py-3 text-sm font-body"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-label text-ink/60 block mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => handleChange("stock", e.target.value)}
                  placeholder="10"
                  className="w-full bg-transparent border border-ink/20 focus:border-ink outline-none px-4 py-3 text-sm font-body"
                />
              </div>

              <div>
                <label className="text-label text-ink/60 block mb-2">
                  SKU (optional)
                </label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => handleChange("sku", e.target.value)}
                  placeholder="WHITE-SHIRT-001"
                  className="w-full bg-transparent border border-ink/20 focus:border-ink outline-none px-4 py-3 text-sm font-body"
                />
              </div>
            </div>

            {/* Status */}
            <div className="bg-white border border-ink/10 p-6 space-y-4">
              <h2 className="font-display text-lg border-b border-ink/10 pb-3">
                Status
              </h2>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => handleChange("isActive", e.target.checked)}
                  className="w-4 h-4 accent-ink"
                />
                <span className="text-sm font-body">Active (visible on site)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => handleChange("isFeatured", e.target.checked)}
                  className="w-4 h-4 accent-ink"
                />
                <span className="text-sm font-body">Featured on homepage</span>
              </label>
            </div>

          </div>

        </div>

        {/* Bottom Save Bar */}
        <div className="mt-8 flex justify-end gap-3">
          <Link
            href="/admin/products"
            className="px-6 py-3 border border-ink/20 text-label hover:bg-bone transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-ink text-ivory text-label hover:bg-gold transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading ? "Saving..." : "Create Product"}
          </button>
        </div>

      </form>
    </main>
  );
}