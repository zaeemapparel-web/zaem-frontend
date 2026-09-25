"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  StarOff,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  stock: number;
  isFeatured: boolean;
  isActive: boolean;
  images: string[];
  category?: { id: string; name: string; slug: string };
}

export default function AdminProductsPage() {
  const { loadFromStorage } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const fetchProducts = async () => {
    const token = localStorage.getItem("zaem_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/products?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setProducts(data.data.products);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleFeatured = async (id: string, current: boolean) => {
    const token = localStorage.getItem("zaem_token");
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isFeatured: !current }),
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isFeatured: !current } : p))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    const token = localStorage.getItem("zaem_token");
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !current }),
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: !current } : p))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const token = localStorage.getItem("zaem_token");
    if (!token) return;

    setDeleting(id);
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      !filterCategory || p.category?.slug === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-12">
        <div>
          <p className="text-label text-gold mb-3">Manage</p>
          <h1 className="font-display text-3xl md:text-5xl lg:text-6xl mb-3">
            Products
          </h1>
          <p className="text-muted font-body text-sm">
            {products.length} {products.length === 1 ? "product" : "products"} in your store
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-ink text-ivory text-label hover:bg-gold transition-colors duration-500 w-full md:w-fit"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-ivory border border-ink/10 p-4 mb-6 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search
            className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            strokeWidth={1.5}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-11 pr-4 py-3 bg-transparent border border-ink/20 focus:border-gold outline-none text-sm font-body transition-colors"
          />
        </div>
        <select
  value={filterCategory}
  onChange={(e) => setFilterCategory(e.target.value)}
  className="px-4 py-3 bg-transparent border border-ink/20 focus:border-gold outline-none text-sm font-body transition-colors md:min-w-[220px]"
>
  <option value="">All Categories</option>

  <optgroup label="Woman">
    <option value="woman">All Woman</option>
    <option value="woman-new-in">New In</option>
    <option value="woman-ready-to-wear">Ready to Wear</option>
    <option value="woman-unstitched">Unstitched</option>
    <option value="woman-winter">Winter</option>
    <option value="woman-west">West</option>
    <option value="woman-modest">Modest Wear</option>
    <option value="woman-accessories">Accessories</option>
    <option value="woman-sale">Special Offers</option>
  </optgroup>

  <optgroup label="Man">
    <option value="man">All Man</option>
    <option value="man-new-in">New In</option>
    <option value="man-ready-to-wear">Ready to Wear</option>
    <option value="man-unstitched">Unstitched</option>
    <option value="man-winter">Winter</option>
    <option value="man-west">West</option>
    <option value="man-accessories">Accessories</option>
  </optgroup>

  <optgroup label="Fragrances">
    <option value="fragrances">All Fragrances</option>
    <option value="fragrances-her">For Her</option>
    <option value="fragrances-him">For Him</option>
    <option value="fragrances-sets">Sets</option>
    <option value="fragrances-by-scent">Shop by Scent</option>
  </optgroup>

  <optgroup label="Bags">
    <option value="bags">All Bags</option>
    <option value="bags-handbags">Handbags</option>
    <option value="bags-totes">Totes</option>
    <option value="bags-clutches">Clutches</option>
  </optgroup>
</select>
      </div>

      {/* Loading / Empty */}
      {loading ? (
        <div className="bg-ivory border border-ink/10 p-12 text-center">
          <p className="font-display text-xl md:text-2xl text-muted">Loading...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-ivory border border-ink/10 p-12 text-center">
          <p className="font-display text-xl md:text-2xl mb-4">No products found.</p>
          <p className="text-muted font-body text-sm mb-6">
            {search ? "Try a different search" : "Add your first product"}
          </p>
          {!search && (
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-ivory text-label hover:bg-gold transition-colors"
            >
              Add Product
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-ivory border border-ink/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink/10 bg-bone/30">
                  <th className="text-left p-4 text-label text-muted">Product</th>
                  <th className="text-left p-4 text-label text-muted">Category</th>
                  <th className="text-left p-4 text-label text-muted">Price</th>
                  <th className="text-left p-4 text-label text-muted">Stock</th>
                  <th className="text-left p-4 text-label text-muted">Featured</th>
                  <th className="text-left p-4 text-label text-muted">Status</th>
                  <th className="text-right p-4 text-label text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-ink/5 hover:bg-bone/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 bg-bone shrink-0 overflow-hidden">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="font-display text-sm text-ink/10">
                                Z
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-display text-sm leading-tight truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted font-body mt-1 truncate">
                            {product.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-label">
                        {product.category?.name || "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-display text-sm">
                        PKR {product.price.toLocaleString()}
                      </p>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-label ${
                          product.stock === 0
                            ? "text-red-500"
                            : product.stock <= 5
                            ? "text-gold"
                            : "text-ink"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleFeatured(product.id, product.isFeatured)}
                        className={`p-1.5 transition-colors ${
                          product.isFeatured ? "text-gold" : "text-muted hover:text-gold"
                        }`}
                      >
                        {product.isFeatured ? (
                          <Star className="w-4 h-4 fill-current" strokeWidth={1.5} />
                        ) : (
                          <StarOff className="w-4 h-4" strokeWidth={1.5} />
                        )}
                      </button>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleActive(product.id, product.isActive)}
                        className={`flex items-center gap-2 text-label ${
                          product.isActive ? "text-green-600" : "text-muted"
                        }`}
                      >
                        {product.isActive ? (
                          <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" strokeWidth={1.5} />
                        )}
                        {product.isActive ? "Active" : "Hidden"}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="p-2 text-muted hover:text-gold transition-colors"
                        >
                          <Edit className="w-4 h-4" strokeWidth={1.5} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={deleting === product.id}
                          className="p-2 text-muted hover:text-red-500 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-ivory border border-ink/10 p-4"
              >
                <div className="flex gap-3 mb-4">
                  <div className="w-16 h-20 bg-bone shrink-0 overflow-hidden">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-display text-base text-ink/10">
                          Z
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm leading-tight mb-1 truncate">
                      {product.name}
                    </p>
                    <p className="text-label text-gold mb-1">
                      {product.category?.name || "—"}
                    </p>
                    <p className="font-display text-sm">
                      PKR {product.price.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-ink/10 flex-wrap">
                  <span
                    className={`text-label px-2.5 py-1 ${
                      product.stock === 0
                        ? "bg-red-50 text-red-500"
                        : product.stock <= 5
                        ? "bg-gold/10 text-gold"
                        : "bg-bone text-ink"
                    }`}
                  >
                    Stock: {product.stock}
                  </span>
                  <button
                    onClick={() => toggleFeatured(product.id, product.isFeatured)}
                    className={`flex items-center gap-1 text-label px-2.5 py-1 transition-colors ${
                      product.isFeatured ? "bg-gold/10 text-gold" : "bg-bone text-muted"
                    }`}
                  >
                    <Star className={`w-3 h-3 ${product.isFeatured ? "fill-current" : ""}`} strokeWidth={1.5} />
                    {product.isFeatured ? "Featured" : "No"}
                  </button>
                  <button
                    onClick={() => toggleActive(product.id, product.isActive)}
                    className={`flex items-center gap-1 text-label px-2.5 py-1 transition-colors ${
                      product.isActive ? "bg-green-50 text-green-600" : "bg-bone text-muted"
                    }`}
                  >
                    {product.isActive ? <Eye className="w-3 h-3" strokeWidth={1.5} /> : <EyeOff className="w-3 h-3" strokeWidth={1.5} />}
                    {product.isActive ? "Active" : "Hidden"}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-ink text-ivory text-label hover:bg-gold transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    disabled={deleting === product.id}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-ink/20 text-label hover:border-red-500 hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}