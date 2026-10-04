"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Plus, X, Sparkles, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface FlatCategory {
  id: string;
  name: string;
  slug: string;
  level: number;
  parentName?: string;
  fullPath: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { loadFromStorage } = useAuthStore();

  const [categories, setCategories] = useState<FlatCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  useEffect(() => {
    loadFromStorage();

    const fetchData = async () => {
      try {
        // Categories
        const catRes = await fetch(`${API_URL}/api/categories`);
        const catData = await catRes.json();
        if (catData.success) {
          const flat: FlatCategory[] = [];
          catData.data.categories.forEach((parent: any) => {
            flat.push({
              id: parent.id,
              name: parent.name,
              slug: parent.slug,
              level: 0,
              fullPath: parent.name,
            });
            if (parent.children) {
              parent.children.forEach((child: any) => {
                flat.push({
                  id: child.id,
                  name: child.name,
                  slug: child.slug,
                  level: 1,
                  parentName: parent.name,
                  fullPath: `${parent.name} → ${child.name}`,
                });
                if (child.children) {
                  child.children.forEach((grandchild: any) => {
                    flat.push({
                      id: grandchild.id,
                      name: grandchild.name,
                      slug: grandchild.slug,
                      level: 2,
                      parentName: child.name,
                      fullPath: `${parent.name} → ${child.name} → ${grandchild.name}`,
                    });
                  });
                }
              });
            }
          });
          setCategories(flat);
        }

        // Product
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
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  const addImage = () => update("images", [...form.images, ""]);
  const updateImage = (index: number, value: string) => {
    const newImages = [...form.images];
    newImages[index] = value;
    update("images", newImages);
  };
  const removeImage = (index: number) => {
    update("images", form.images.filter((_, i) => i !== index));
  };

  const addSize = () => {
    if (sizeInput.trim() && !form.sizes.includes(sizeInput.trim())) {
      update("sizes", [...form.sizes, sizeInput.trim()]);
      setSizeInput("");
    }
  };
  const removeSize = (size: string) => {
    update("sizes", form.sizes.filter((s) => s !== size));
  };

  const addColor = () => {
    if (colorInput.trim() && !form.colors.includes(colorInput.trim())) {
      update("colors", [...form.colors, colorInput.trim()]);
      setColorInput("");
    }
  };
  const removeColor = (color: string) => {
    update("colors", form.colors.filter((c) => c !== color));
  };

  // ⭐ AI GENERATE DESCRIPTION
  const generateDescription = async () => {
    if (!form.name || !form.price) {
      setError("Product name aur price pehle bharein");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-ink" />
      </div>
    );
  }

  return (
    <div>

      {/* Header */}
      <div className="mb-10">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-label text-muted hover:text-gold transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
          Back to Products
        </Link>
        <p className="text-label text-gold mb-3">Edit</p>
        <h1 className="display-lg">Edit Product</h1>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border-l-2 border-red-500 text-sm font-body text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-8 p-4 bg-gold/10 border-l-2 border-gold text-sm font-body text-gold">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">

        {/* Basic Info */}
        <div className="bg-ivory border border-ink/10 p-6 md:p-8">
          <h2 className="font-display text-xl mb-6">Basic Information</h2>

          <div className="space-y-6">
            <div>
              <label className="text-label text-muted block mb-3">
                Product Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
                className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-label text-muted">Description *</label>
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
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                required
                rows={4}
                className="w-full bg-transparent border border-ink/20 focus:border-gold outline-none p-4 text-sm font-body transition-colors resize-none"
              />
              <p className="text-xs text-muted font-body mt-2">
                💡 Tip: Name aur price bharein, phir AI button dabayein
              </p>
            </div>

            <div>
              <label className="text-label text-muted block mb-3">
                Category *
              </label>
              <select
                value={form.categoryId}
                onChange={(e) => update("categoryId", e.target.value)}
                required
                className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.level === 0 && cat.name}
                    {cat.level === 1 && `  ↳ ${cat.name}`}
                    {cat.level === 2 && `      ↳ ${cat.name}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-ivory border border-ink/10 p-6 md:p-8">
          <h2 className="font-display text-xl mb-6">Pricing</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-label text-muted block mb-3">
                Price (PKR) *
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                required
                className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
              />
            </div>
            <div>
              <label className="text-label text-muted block mb-3">
                Compare Price (PKR)
              </label>
              <input
                type="number"
                value={form.comparePrice}
                onChange={(e) => update("comparePrice", e.target.value)}
                className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-ivory border border-ink/10 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl">Images</h2>
            <button
              type="button"
              onClick={addImage}
              className="text-label text-gold hover:text-ink transition-colors flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
              Add Image
            </button>
          </div>

          <div className="space-y-4">
            {form.images.map((img, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-label text-muted w-6">{i + 1}.</span>
                <input
                  type="url"
                  value={img}
                  onChange={(e) => updateImage(i, e.target.value)}
                  className="flex-1 bg-transparent border-b border-ink/20 focus:border-gold outline-none py-2 text-sm font-body transition-colors"
                />
                {form.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="p-2 text-muted hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {form.images[0] && (
            <div className="mt-6">
              <p className="text-label text-muted mb-3">Preview</p>
              <div className="w-32 h-40 bg-bone overflow-hidden">
                <img
                  src={form.images[0]}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sizes */}
        <div className="bg-ivory border border-ink/10 p-6 md:p-8">
          <h2 className="font-display text-xl mb-6">Sizes</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={sizeInput}
              onChange={(e) => setSizeInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addSize())
              }
              placeholder="Add size (S, M, L, XL)"
              className="flex-1 bg-transparent border-b border-ink/20 focus:border-gold outline-none py-2 text-sm font-body transition-colors"
            />
            <button
              type="button"
              onClick={addSize}
              className="px-4 text-label text-gold hover:text-ink transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.sizes.map((size) => (
              <span
                key={size}
                className="flex items-center gap-2 px-4 py-2 bg-bone text-label"
              >
                {size}
                <button
                  type="button"
                  onClick={() => removeSize(size)}
                  className="hover:text-red-500"
                >
                  <X className="w-3 h-3" strokeWidth={2} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="bg-ivory border border-ink/10 p-6 md:p-8">
          <h2 className="font-display text-xl mb-6">Colors</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addColor())
              }
              placeholder="Add color (Ivory, Charcoal)"
              className="flex-1 bg-transparent border-b border-ink/20 focus:border-gold outline-none py-2 text-sm font-body transition-colors"
            />
            <button
              type="button"
              onClick={addColor}
              className="px-4 text-label text-gold hover:text-ink transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.colors.map((color) => (
              <span
                key={color}
                className="flex items-center gap-2 px-4 py-2 bg-bone text-label"
              >
                {color}
                <button
                  type="button"
                  onClick={() => removeColor(color)}
                  className="hover:text-red-500"
                >
                  <X className="w-3 h-3" strokeWidth={2} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-ivory border border-ink/10 p-6 md:p-8">
          <h2 className="font-display text-xl mb-6">Inventory</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-label text-muted block mb-3">Stock</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => update("stock", e.target.value)}
                className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
              />
            </div>
            <div>
              <label className="text-label text-muted block mb-3">SKU</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => update("sku", e.target.value)}
                className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
              />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => update("isFeatured", e.target.checked)}
                className="w-4 h-4 accent-gold"
              />
              <span className="text-sm font-body">Featured on homepage</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => update("isActive", e.target.checked)}
                className="w-4 h-4 accent-gold"
              />
              <span className="text-sm font-body">Active (visible in store)</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link href="/admin/products" className="btn-outline text-center">
            Cancel
          </Link>
        </div>

      </form>

    </div>
  );
}