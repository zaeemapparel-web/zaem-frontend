"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FolderTree,
  X,
  Save,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
  isParent?: boolean;
  children?: Category[];
  parent?: { id: string; name: string; slug: string } | null;
  _count?: { products: number };
}

export default function AdminCategoriesPage() {
  const { loadFromStorage } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    parentId: "",
  });

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/categories`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data.categories);

        // Flatten for the parent dropdown
        const flat: Category[] = [];
        data.data.categories.forEach((parent: Category) => {
          flat.push(parent);
          if (parent.children) {
            parent.children.forEach((child) => {
              flat.push({ ...child, parentId: parent.id });
            });
          }
        });
        setAllCategories(flat);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNameChange = (name: string) => {
    setForm({
      ...form,
      name,
      slug: editingId
        ? form.slug
        : name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-"),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("zaem_token");
    if (!token) return;

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const url = editingId
        ? `${API_URL}/api/categories/${editingId}`
        : `${API_URL}/api/categories`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          parentId: form.parentId || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchCategories();
        resetForm();
        setMessage({
          type: "success",
          text: editingId
            ? "Category updated successfully"
            : "Category created successfully",
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: data.message || "Failed" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat: Category) => {
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      image: cat.image || "",
      parentId: cat.parentId || "",
    });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;

    const token = localStorage.getItem("zaem_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        await fetchCategories();
        setMessage({ type: "success", text: "Category deleted" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: data.message || "Failed to delete" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error" });
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      slug: "",
      description: "",
      image: "",
      parentId: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Filter top-level categories by search
  const filteredCategories = categories.filter((c) => {
    if (!search) return true;
    // Search in parent
    if (c.name.toLowerCase().includes(search.toLowerCase())) return true;
    // Search in children
    if (c.children?.some((ch) => ch.name.toLowerCase().includes(search.toLowerCase())))
      return true;
    return false;
  });

  // Get only top-level parents for dropdown (excluding current editing)
  const parentOptions = categories.filter((c) => c.id !== editingId);

  return (
    <div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
        <div>
          <p className="text-label text-gold mb-3">Manage</p>
          <h1 className="display-lg mb-3">Categories</h1>
          <p className="text-muted font-body text-sm">
            {categories.length} parent{" "}
            {categories.length === 1 ? "category" : "categories"}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2 w-fit"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            Add Category
          </button>
        )}
      </div>

      {message.text && (
        <div
          className={`mb-6 p-4 text-sm font-body border-l-2 ${
            message.type === "success"
              ? "bg-gold/10 border-gold text-gold"
              : "bg-red-50 border-red-500 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-ivory border border-gold/30 p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl">
              {editingId ? "Edit Category" : "Add New Category"}
            </h2>
            <button
              onClick={resetForm}
              className="p-2 text-muted hover:text-ink transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-label text-muted block mb-3">
                  Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  placeholder="e.g., Shirts"
                  className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
                />
              </div>

              <div>
                <label className="text-label text-muted block mb-3">
                  Slug *
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                  placeholder="shirts"
                  className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
                />
              </div>
            </div>

            {/* Parent Category Dropdown */}
            <div>
              <label className="text-label text-muted block mb-3">
                Parent Category (optional)
              </label>
              <select
                value={form.parentId}
                onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
              >
                <option value="">
                  None — Make this a Top-Level Category
                </option>
                {parentOptions.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted font-body mt-2">
                Select a parent to make this a subcategory
              </p>
            </div>

            <div>
              <label className="text-label text-muted block mb-3">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                placeholder="Short description..."
                className="w-full bg-transparent border border-ink/20 focus:border-gold outline-none p-4 text-sm font-body transition-colors resize-none"
              />
            </div>

            <div>
              <label className="text-label text-muted block mb-3">
                Image URL
              </label>
              <input
                type="url"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-sm font-body transition-colors"
              />
            </div>

            {/* Image Preview */}
            {form.image && (
              <div>
                <p className="text-label text-muted mb-3">Preview</p>
                <div className="w-32 h-40 bg-bone overflow-hidden">
                  <img
                    src={form.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" strokeWidth={1.5} />
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="bg-ivory border border-ink/10 p-4 md:p-5 mb-6">
        <div className="relative">
          <Search
            className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            strokeWidth={1.5}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-11 pr-4 py-3 bg-transparent border border-ink/20 focus:border-gold outline-none text-sm font-body transition-colors"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="bg-ivory border border-ink/10 p-20 text-center">
          <p className="font-display text-2xl text-muted">Loading...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-ivory border border-ink/10 p-20 text-center">
          <FolderTree
            className="w-16 h-16 text-muted mx-auto mb-6"
            strokeWidth={1}
          />
          <p className="font-display text-2xl mb-4">No categories found.</p>
          <p className="text-muted font-body text-sm">
            {search ? "Try a different search" : "Add your first category"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCategories.map((parent) => (
            <div key={parent.id} className="bg-ivory border border-ink/10">

              {/* Parent Row */}
              <div className="flex items-center gap-4 p-5 border-b border-ink/10">
                <div className="w-14 h-14 bg-bone shrink-0 overflow-hidden">
                  {parent.image ? (
                    <img
                      src={parent.image}
                      alt={parent.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FolderTree
                        className="w-5 h-5 text-muted"
                        strokeWidth={1.5}
                      />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-display text-lg">{parent.name}</p>
                    <span className="text-label bg-gold/10 text-gold px-2 py-0.5">
                      Parent
                    </span>
                  </div>
                  <code className="text-xs bg-bone px-2 py-1 font-body">
                    {parent.slug}
                  </code>
                  {parent.description && (
                    <p className="text-xs text-muted font-body mt-2">
                      {parent.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleEdit(parent)}
                    className="p-2 text-muted hover:text-gold transition-colors"
                    aria-label="Edit"
                  >
                    <Edit className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => handleDelete(parent.id, parent.name)}
                    className="p-2 text-muted hover:text-red-500 transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Children */}
              {parent.children && parent.children.length > 0 ? (
                <div className="bg-bone/30">
                  {parent.children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center gap-4 p-4 pl-12 md:pl-16 border-b border-ink/5 last:border-0"
                    >
                      <ChevronRight
                        className="w-4 h-4 text-muted shrink-0"
                        strokeWidth={1.5}
                      />
                      <div className="flex-1">
                        <p className="font-body text-sm font-medium">
                          {child.name}
                        </p>
                        <code className="text-xs text-muted font-body">
                          {child.slug}
                        </code>
                        {child._count && (
                          <span className="text-xs text-muted font-body ml-3">
                            · {child._count.products || 0} products
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleEdit(child)}
                          className="p-2 text-muted hover:text-gold transition-colors"
                          aria-label="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => handleDelete(child.id, child.name)}
                          className="p-2 text-muted hover:text-red-500 transition-colors"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-bone/20 p-4 pl-12 md:pl-16">
                  <p className="text-xs text-muted font-body">
                    No subcategories yet
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}