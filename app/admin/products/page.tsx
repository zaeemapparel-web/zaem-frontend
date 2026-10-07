"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  StarOff,
  Eye,
  EyeOff,
  X,
  Check,
  Grid3x3,
  List,
  SlidersHorizontal,
  Package,
  AlertCircle,
  Loader2,
  ChevronDown,
  CheckSquare,
  Square,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ==================== TYPES ====================
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

type StockFilter = "all" | "in-stock" | "low-stock" | "out-of-stock";
type StatusFilter = "all" | "active" | "hidden" | "featured";
type ViewMode = "table" | "grid";

// ==================== MAIN COMPONENT ====================
export default function AdminProductsPage() {
  const { loadFromStorage } = useAuthStore();

  // ==================== STATE ====================
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  // Delete confirm modal
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // ==================== INIT ====================
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // ==================== FETCH ====================
  const fetchProducts = async () => {
    const token = localStorage.getItem("zaem_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/products?limit=200`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setProducts(data.data.products);
    } catch (error) {
      console.error(error);
      showToast("error", "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==================== TOAST ====================
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // ==================== TOGGLE FEATURED ====================
  const toggleFeatured = async (id: string, current: boolean) => {
    const token = localStorage.getItem("zaem_token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isFeatured: !current }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isFeatured: !current } : p))
        );
        showToast("success", current ? "Removed from featured" : "Added to featured");
      }
    } catch (error) {
      console.error(error);
      showToast("error", "Failed to update");
    }
  };

  // ==================== TOGGLE ACTIVE ====================
  const toggleActive = async (id: string, current: boolean) => {
    const token = localStorage.getItem("zaem_token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !current }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isActive: !current } : p))
        );
        showToast("success", current ? "Product hidden" : "Product visible");
      }
    } catch (error) {
      console.error(error);
      showToast("error", "Failed to update");
    }
  };

  // ==================== DELETE ====================
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const token = localStorage.getItem("zaem_token");
    if (!token) return;

    setDeleting(deleteConfirm.id);
    try {
      const res = await fetch(`${API_URL}/api/products/${deleteConfirm.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== deleteConfirm.id));
        showToast("success", "Product deleted");
      } else {
        showToast("error", "Delete failed");
      }
    } catch (error) {
      console.error(error);
      showToast("error", "Delete failed");
    } finally {
      setDeleting(null);
      setDeleteConfirm(null);
    }
  };

  // ==================== BULK ACTIONS ====================
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} products?`)) return;

    const token = localStorage.getItem("zaem_token");
    if (!token) return;

    setBulkLoading(true);
    try {
      const promises = Array.from(selectedIds).map((id) =>
        fetch(`${API_URL}/api/products/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      await Promise.all(promises);
      setProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
      showToast("success", "Products deleted");
    } catch (error) {
      console.error(error);
      showToast("error", "Bulk delete failed");
    } finally {
      setBulkLoading(false);
    }
  };

  const bulkToggleActive = async (active: boolean) => {
    if (selectedIds.size === 0) return;
    const token = localStorage.getItem("zaem_token");
    if (!token) return;

    setBulkLoading(true);
    try {
      const promises = Array.from(selectedIds).map((id) =>
        fetch(`${API_URL}/api/products/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive: active }),
        })
      );
      await Promise.all(promises);
      setProducts((prev) =>
        prev.map((p) => (selectedIds.has(p.id) ? { ...p, isActive: active } : p))
      );
      setSelectedIds(new Set());
      showToast("success", active ? "Products activated" : "Products hidden");
    } catch (error) {
      console.error(error);
      showToast("error", "Bulk update failed");
    } finally {
      setBulkLoading(false);
    }
  };

  // ==================== FILTERS ====================
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase());

      // Category
      const matchesCategory =
        !filterCategory || p.category?.slug === filterCategory;

      // Stock
      let matchesStock = true;
      if (stockFilter === "in-stock") matchesStock = p.stock > 5;
      else if (stockFilter === "low-stock")
        matchesStock = p.stock > 0 && p.stock <= 5;
      else if (stockFilter === "out-of-stock") matchesStock = p.stock === 0;

      // Status
      let matchesStatus = true;
      if (statusFilter === "active") matchesStatus = p.isActive;
      else if (statusFilter === "hidden") matchesStatus = !p.isActive;
      else if (statusFilter === "featured") matchesStatus = p.isFeatured;

      return matchesSearch && matchesCategory && matchesStock && matchesStatus;
    });
  }, [products, search, filterCategory, stockFilter, statusFilter]);

  // ==================== STATS ====================
  const stats = useMemo(() => {
    return {
      total: products.length,
      active: products.filter((p) => p.isActive).length,
      featured: products.filter((p) => p.isFeatured).length,
      outOfStock: products.filter((p) => p.stock === 0).length,
      lowStock: products.filter((p) => p.stock > 0 && p.stock <= 5).length,
    };
  }, [products]);

  // ==================== CLEAR FILTERS ====================
  const clearFilters = () => {
    setSearch("");
    setFilterCategory("");
    setStockFilter("all");
    setStatusFilter("all");
  };

  const hasActiveFilters = !!(
    search ||
    filterCategory ||
    stockFilter !== "all" ||
    statusFilter !== "all"
  );

  // ==================== RENDER ====================
  return (
    <div className="admin-fade-in">

      {/* ==================== TOAST ==================== */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-lg shadow-lg border-l-2 admin-fade-in ${
            toast.type === "success"
              ? "bg-[#E8F5E9] border-[#2E7D32] text-[#2E7D32]"
              : "bg-[#FFEBEE] border-[#C62828] text-[#C62828]"
          }`}
        >
          <p className="text-[13px] font-medium">{toast.message}</p>
        </div>
      )}

      {/* ==================== HEADER ==================== */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#86868B] font-medium mb-3">
            Manage
          </p>
          <h1 className="font-display text-3xl md:text-5xl lg:text-6xl text-[#1D1D1F] dark:text-white mb-3">
            Products
          </h1>
          <p className="text-[#6E6E73] dark:text-[#98989D] font-body text-sm">
            {stats.total} {stats.total === 1 ? "product" : "products"} ·{" "}
            {stats.active} active · {stats.outOfStock} out of stock
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="admin-btn admin-btn-primary w-full md:w-fit justify-center"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Add Product
        </Link>
      </div>

      {/* ==================== STATS CARDS ==================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="admin-card p-4">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#86868B] font-medium mb-1">
            Total
          </p>
          <p className="font-display text-2xl text-[#1D1D1F] dark:text-white">
            {stats.total}
          </p>
        </div>
        <div className="admin-card p-4">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#86868B] font-medium mb-1">
            Active
          </p>
          <p className="font-display text-2xl text-[#2E7D32]">
            {stats.active}
          </p>
        </div>
        <div className="admin-card p-4">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#86868B] font-medium mb-1">
            Low Stock
          </p>
          <p className="font-display text-2xl text-[#E65100]">
            {stats.lowStock}
          </p>
        </div>
        <div className="admin-card p-4">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#86868B] font-medium mb-1">
            Out of Stock
          </p>
          <p className="font-display text-2xl text-[#C62828]">
            {stats.outOfStock}
          </p>
        </div>
      </div>

      {/* ==================== FILTERS BAR ==================== */}
      <div className="admin-card p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">

          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B]"
              strokeWidth={2}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="admin-input pl-10"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] rounded-full transition-colors"
              >
                <X className="w-3.5 h-3.5 text-[#86868B]" strokeWidth={2} />
              </button>
            )}
          </div>

          {/* Category */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="admin-input md:min-w-[180px] cursor-pointer"
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
            </optgroup>
            <optgroup label="Bags">
              <option value="bags">All Bags</option>
              <option value="bags-handbags">Handbags</option>
              <option value="bags-totes">Totes</option>
              <option value="bags-clutches">Clutches</option>
            </optgroup>
          </select>

          {/* Stock */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as StockFilter)}
            className="admin-input md:min-w-[150px] cursor-pointer"
          >
            <option value="all">All Stock</option>
            <option value="in-stock">In Stock (&gt;5)</option>
            <option value="low-stock">Low Stock (1-5)</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="admin-input md:min-w-[140px] cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="hidden">Hidden</option>
            <option value="featured">Featured</option>
          </select>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-lg p-1 self-start lg:self-auto">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "table"
                  ? "bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-sm"
                  : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
              }`}
              aria-label="Table view"
            >
              <List className="w-4 h-4" strokeWidth={2} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "grid"
                  ? "bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-sm"
                  : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
              }`}
              aria-label="Grid view"
            >
              <Grid3x3 className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Active Filters + Clear */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E5E5E7] dark:border-[#38383A] flex-wrap">
            <span className="text-[10px] tracking-wider uppercase text-[#86868B] font-medium">
              Filters:
            </span>
            {search && (
              <span className="admin-badge admin-badge-neutral">
                Search: {search}
              </span>
            )}
            {filterCategory && (
              <span className="admin-badge admin-badge-neutral">
                Category: {filterCategory}
              </span>
            )}
            {stockFilter !== "all" && (
              <span className="admin-badge admin-badge-neutral">
                Stock: {stockFilter}
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="admin-badge admin-badge-neutral">
                Status: {statusFilter}
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-[11px] text-[#0A84FF] hover:underline font-medium ml-auto"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ==================== BULK ACTIONS ==================== */}
      {selectedIds.size > 0 && (
        <div className="admin-card p-3 mb-4 flex items-center justify-between gap-3 flex-wrap sticky top-4 z-30 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] border-[#1D1D1F] dark:border-white">
          <p className="text-[13px] font-medium">
            {selectedIds.size} selected
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => bulkToggleActive(true)}
              disabled={bulkLoading}
              className="text-[11px] tracking-wider uppercase font-medium px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              Activate
            </button>
            <button
              onClick={() => bulkToggleActive(false)}
              disabled={bulkLoading}
              className="text-[11px] tracking-wider uppercase font-medium px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              Hide
            </button>
            <button
              onClick={bulkDelete}
              disabled={bulkLoading}
              className="text-[11px] tracking-wider uppercase font-medium px-3 py-1.5 rounded-md bg-[#C62828] hover:bg-[#B71C1C] transition-colors disabled:opacity-50"
            >
              {bulkLoading ? "Deleting..." : "Delete"}
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
              aria-label="Clear selection"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}

      {/* ==================== LOADING ==================== */}
      {loading ? (
        <div className="admin-card p-20 text-center">
          <Loader2
            className="w-6 h-6 text-[#86868B] animate-spin mx-auto mb-3"
            strokeWidth={2}
          />
          <p className="text-[11px] tracking-[0.3em] uppercase text-[#86868B]">
            Loading Products
          </p>
        </div>
      ) : filteredProducts.length === 0 ? (
        /* ==================== EMPTY STATE ==================== */
        <div className="admin-card p-16 text-center">
          <div className="w-16 h-16 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-6 h-6 text-[#86868B]" strokeWidth={1.5} />
          </div>
          <h3 className="font-display text-xl text-[#1D1D1F] dark:text-white mb-2">
            {hasActiveFilters ? "No products match" : "No products yet"}
          </h3>
          <p className="text-[13px] text-[#86868B] mb-6 max-w-md mx-auto">
            {hasActiveFilters
              ? "Try adjusting your filters or search terms"
              : "Add your first product to get started"}
          </p>
          {hasActiveFilters ? (
            <button onClick={clearFilters} className="admin-btn admin-btn-secondary">
              Clear Filters
            </button>
          ) : (
            <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
              <Plus className="w-4 h-4" strokeWidth={2} />
              Add Product
            </Link>
          )}
        </div>
      ) : viewMode === "table" ? (
        /* ==================== TABLE VIEW ==================== */
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E5E7] dark:border-[#38383A] bg-[#FAFAFA] dark:bg-[#0A0A0A]">
                  <th className="text-left p-3 w-10">
                    <button
                      onClick={toggleSelectAll}
                      className="p-1 hover:bg-[#E5E5E7] dark:hover:bg-[#2C2C2E] rounded transition-colors"
                      aria-label="Select all"
                    >
                      {selectedIds.size === filteredProducts.length &&
                      filteredProducts.length > 0 ? (
                        <CheckSquare
                          className="w-4 h-4 text-[#1D1D1F] dark:text-white"
                          strokeWidth={2}
                        />
                      ) : (
                        <Square
                          className="w-4 h-4 text-[#86868B]"
                          strokeWidth={2}
                        />
                      )}
                    </button>
                  </th>
                  <th className="text-left p-3 text-[10px] tracking-[0.15em] uppercase text-[#86868B] font-medium">
                    Product
                  </th>
                  <th className="text-left p-3 text-[10px] tracking-[0.15em] uppercase text-[#86868B] font-medium hidden md:table-cell">
                    Category
                  </th>
                  <th className="text-left p-3 text-[10px] tracking-[0.15em] uppercase text-[#86868B] font-medium">
                    Price
                  </th>
                  <th className="text-left p-3 text-[10px] tracking-[0.15em] uppercase text-[#86868B] font-medium hidden md:table-cell">
                    Stock
                  </th>
                  <th className="text-left p-3 text-[10px] tracking-[0.15em] uppercase text-[#86868B] font-medium hidden lg:table-cell">
                    Status
                  </th>
                  <th className="text-right p-3 text-[10px] tracking-[0.15em] uppercase text-[#86868B] font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const isSelected = selectedIds.has(product.id);
                  return (
                    <tr
                      key={product.id}
                      className={`border-b border-[#E5E5E7] dark:border-[#38383A] last:border-0 transition-colors ${
                        isSelected
                          ? "bg-[#F5F5F7] dark:bg-[#1C1C1E]"
                          : "hover:bg-[#FAFAFA] dark:hover:bg-[#1C1C1E]"
                      }`}
                    >
                      <td className="p-3">
                        <button
                          onClick={() => toggleSelect(product.id)}
                          className="p-1 hover:bg-[#E5E5E7] dark:hover:bg-[#2C2C2E] rounded transition-colors"
                          aria-label="Select product"
                        >
                          {isSelected ? (
                            <CheckSquare
                              className="w-4 h-4 text-[#1D1D1F] dark:text-white"
                              strokeWidth={2}
                            />
                          ) : (
                            <Square
                              className="w-4 h-4 text-[#86868B]"
                              strokeWidth={2}
                            />
                          )}
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-16 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-md shrink-0 overflow-hidden">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package
                                  className="w-5 h-5 text-[#86868B]"
                                  strokeWidth={1.5}
                                />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white line-clamp-2 max-w-[240px]">
                              {product.name}
                            </p>
                            <p className="text-[11px] text-[#86868B] mt-0.5 truncate max-w-[240px]">
                              {product.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <span className="text-[12px] text-[#6E6E73] dark:text-[#98989D]">
                          {product.category?.name || "—"}
                        </span>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white">
                            Rs. {product.price.toLocaleString()}
                          </p>
                          {product.comparePrice && (
                            <p className="text-[11px] text-[#86868B] line-through">
                              Rs. {product.comparePrice.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md ${
                            product.stock === 0
                              ? "bg-[#FFEBEE] text-[#C62828]"
                              : product.stock <= 5
                              ? "bg-[#FFF3E0] text-[#E65100]"
                              : "bg-[#E8F5E9] text-[#2E7D32]"
                          }`}
                        >
                          {product.stock} units
                        </span>
                      </td>
                      <td className="p-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              toggleFeatured(product.id, product.isFeatured)
                            }
                            className={`p-1.5 rounded-md transition-colors ${
                              product.isFeatured
                                ? "text-[#E65100] hover:bg-[#FFF3E0]"
                                : "text-[#86868B] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]"
                            }`}
                            title={product.isFeatured ? "Unfeature" : "Feature"}
                          >
                            {product.isFeatured ? (
                              <Star
                                className="w-4 h-4 fill-current"
                                strokeWidth={2}
                              />
                            ) : (
                              <StarOff className="w-4 h-4" strokeWidth={2} />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              toggleActive(product.id, product.isActive)
                            }
                            className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md transition-colors ${
                              product.isActive
                                ? "bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9]"
                                : "bg-[#F5F5F7] text-[#6E6E73] dark:bg-[#2C2C2E] dark:text-[#98989D]"
                            }`}
                            title={product.isActive ? "Hide" : "Show"}
                          >
                            {product.isActive ? (
                              <Eye className="w-3 h-3" strokeWidth={2} />
                            ) : (
                              <EyeOff className="w-3 h-3" strokeWidth={2} />
                            )}
                            {product.isActive ? "Live" : "Hidden"}
                          </button>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="p-2 rounded-md text-[#6E6E73] dark:text-[#98989D] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" strokeWidth={2} />
                          </Link>
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                id: product.id,
                                name: product.name,
                              })
                            }
                            disabled={deleting === product.id}
                            className="p-2 rounded-md text-[#6E6E73] dark:text-[#98989D] hover:bg-[#FFEBEE] hover:text-[#C62828] transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {deleting === product.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" strokeWidth={2} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ==================== GRID VIEW ==================== */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const isSelected = selectedIds.has(product.id);
            return (
              <div
                key={product.id}
                className={`admin-card overflow-hidden group transition-all duration-300 ${
                  isSelected
                    ? "ring-2 ring-[#1D1D1F] dark:ring-white"
                    : "hover:-translate-y-0.5"
                }`}
              >
                <div className="relative aspect-[3/4] bg-[#F5F5F7] dark:bg-[#1C1C1E]">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package
                        className="w-10 h-10 text-[#86868B]"
                        strokeWidth={1.5}
                      />
                    </div>
                  )}

                  {/* Select checkbox */}
                  <button
                    onClick={() => toggleSelect(product.id)}
                    className="absolute top-2 left-2 p-1.5 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-md"
                    aria-label="Select product"
                  >
                    {isSelected ? (
                      <CheckSquare
                        className="w-4 h-4 text-[#1D1D1F] dark:text-white"
                        strokeWidth={2}
                      />
                    ) : (
                      <Square className="w-4 h-4 text-[#6E6E73]" strokeWidth={2} />
                    )}
                  </button>

                  {/* Badges */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {product.isFeatured && (
                      <span className="inline-flex items-center gap-1 text-[9px] tracking-wider uppercase font-medium bg-[#E65100] text-white px-1.5 py-0.5 rounded">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        Featured
                      </span>
                    )}
                    {!product.isActive && (
                      <span className="inline-flex items-center gap-1 text-[9px] tracking-wider uppercase font-medium bg-[#6E6E73] text-white px-1.5 py-0.5 rounded">
                        <EyeOff className="w-2.5 h-2.5" />
                        Hidden
                      </span>
                    )}
                    {product.stock === 0 && (
                      <span className="text-[9px] tracking-wider uppercase font-medium bg-[#C62828] text-white px-1.5 py-0.5 rounded">
                        Out
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3">
                  <p className="text-[10px] tracking-wider uppercase text-[#86868B] font-medium mb-1 truncate">
                    {product.category?.name || "—"}
                  </p>
                  <h3 className="text-[13px] font-medium text-[#1D1D1F] dark:text-white line-clamp-2 mb-2 min-h-[32px]">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white">
                        Rs. {product.price.toLocaleString()}
                      </p>
                      <p
                        className={`text-[10px] font-medium ${
                          product.stock === 0
                            ? "text-[#C62828]"
                            : product.stock <= 5
                            ? "text-[#E65100]"
                            : "text-[#2E7D32]"
                        }`}
                      >
                        Stock: {product.stock}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="p-1.5 rounded-md hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors"
                        title="Edit"
                      >
                        <Edit
                          className="w-3.5 h-3.5 text-[#6E6E73]"
                          strokeWidth={2}
                        />
                      </Link>
                      <button
                        onClick={() =>
                          setDeleteConfirm({
                            id: product.id,
                            name: product.name,
                          })
                        }
                        className="p-1.5 rounded-md hover:bg-[#FFEBEE] transition-colors"
                        title="Delete"
                      >
                        <Trash2
                          className="w-3.5 h-3.5 text-[#C62828]"
                          strokeWidth={2}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== DELETE CONFIRM MODAL ==================== */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative bg-white dark:bg-[#1C1C1E] max-w-md w-full p-6 rounded-2xl shadow-2xl admin-scale-in">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 bg-[#FFEBEE] rounded-full flex items-center justify-center shrink-0">
                <AlertCircle
                  className="w-6 h-6 text-[#C62828]"
                  strokeWidth={2}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl text-[#1D1D1F] dark:text-white mb-2">
                  Delete Product?
                </h3>
                <p className="text-[13px] text-[#6E6E73] dark:text-[#98989D] font-body leading-relaxed">
                  Are you sure you want to delete{" "}
                  <strong className="text-[#1D1D1F] dark:text-white">
                    &quot;{deleteConfirm.name}&quot;
                  </strong>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="admin-btn admin-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting === deleteConfirm.id}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-lg text-[13px] font-medium transition-colors disabled:opacity-50"
              >
                {deleting === deleteConfirm.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" strokeWidth={2} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}