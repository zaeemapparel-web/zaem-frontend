"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FolderTree,
  Folder,
  FileText,
  X,
  Save,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Package,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ==================== TYPES ====================
interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
  isParent: boolean;
  children?: Category[];
  parent?: { id: string; name: string; slug: string } | null;
  _count?: { products: number };
}

type Level = "parent" | "child" | "grandchild";

interface FormState {
  name: string;
  slug: string;
  description: string;
  image: string;
  parentId: string;
  grandParentId: string; // For grandchild: which parent's child
  level: Level;
}

// ==================== HELPER: Slug Generator ====================
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

// ==================== HELPER: Count Total ====================
const countAll = (categories: Category[]) => {
  let parents = 0;
  let children = 0;
  let grandchildren = 0;

  categories.forEach((cat) => {
    parents++;
    if (cat.children) {
      cat.children.forEach((child) => {
        children++;
        if (child.children) {
          grandchildren += child.children.length;
        }
      });
    }
  });

  return { parents, children, grandchildren, total: parents + children + grandchildren };
};

// ==================== HELPER: Get Level ====================
const getLevel = (cat: Category, allCats: Category[]): Level => {
  if (cat.isParent) return "parent";
  // Check if this category has children (i.e., it's a child that can have grandchildren)
  if (cat.parentId) {
    // Find parent
    for (const parent of allCats) {
      if (parent.children) {
        for (const child of parent.children) {
          if (child.id === cat.id) return "child";
          if (child.children) {
            for (const gc of child.children) {
              if (gc.id === cat.id) return "grandchild";
            }
          }
        }
      }
    }
  }
  return "child";
};

export default function AdminCategoriesPage() {
  const { loadFromStorage } = useAuthStore();

  // ==================== STATE ====================
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    slug: "",
    description: "",
    image: "",
    parentId: "",
    grandParentId: "",
    level: "parent",
  });

  // Expanded state
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());
  const [expandedChildren, setExpandedChildren] = useState<Set<string>>(new Set());

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string; hasChildren: boolean; hasProducts: number } | null>(null);

  // ==================== INIT ====================
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // ==================== FETCH ====================
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/categories`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data.categories || []);
        // Auto-expand all parents initially
        const parentIds = new Set<string>(
          (data.data.categories || []).map((c: Category) => c.id)
        );
        setExpandedParents(parentIds);
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

  // ==================== STATS ====================
  const stats = useMemo(() => countAll(categories), [categories]);

  // ==================== FILTERED TREE ====================
  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const s = search.toLowerCase().trim();

    return categories
      .map((parent) => {
        // Check parent
        const parentMatches = parent.name.toLowerCase().includes(s) || parent.slug.toLowerCase().includes(s);

        // Check children
        const matchedChildren = (parent.children || []).map((child) => {
          const childMatches = child.name.toLowerCase().includes(s) || child.slug.toLowerCase().includes(s);
          const matchedGrandchildren = (child.children || []).filter(
            (gc) => gc.name.toLowerCase().includes(s) || gc.slug.toLowerCase().includes(s)
          );

          if (childMatches || matchedGrandchildren.length > 0) {
            return {
              ...child,
              children: childMatches ? child.children : matchedGrandchildren,
            };
          }
          return null;
        }).filter(Boolean) as Category[];

        if (parentMatches) return parent;
        if (matchedChildren.length > 0) {
          return { ...parent, children: matchedChildren };
        }
        return null;
      })
      .filter(Boolean) as Category[];
  }, [categories, search]);

  // ==================== TOGGLE EXPAND ====================
  const toggleParent = (id: string) => {
    setExpandedParents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleChild = (id: string) => {
    setExpandedChildren((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ==================== HANDLERS: FORM ====================
  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: editingId ? prev.slug : generateSlug(name),
    }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      slug: "",
      description: "",
      image: "",
      parentId: "",
      grandParentId: "",
      level: "parent",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (cat: Category) => {
    // Determine level
    let level: Level = "parent";
    let parentId = cat.parentId || "";
    let grandParentId = "";

    if (!cat.isParent) {
      // Find if it's a child or grandchild
      for (const parent of categories) {
        if (parent.children) {
          for (const child of parent.children) {
            if (child.id === cat.id) {
              level = "child";
              parentId = parent.id;
              break;
            }
            if (child.children) {
              for (const gc of child.children) {
                if (gc.id === cat.id) {
                  level = "grandchild";
                  parentId = child.id;
                  grandParentId = parent.id;
                  break;
                }
              }
            }
          }
        }
      }
    }

    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      image: cat.image || "",
      parentId,
      grandParentId,
      level,
    });
    setEditingId(cat.id);
    setShowForm(true);
  };

  // ==================== GET DROPDOWN OPTIONS ====================
  const getParentOptions = () => {
    // For adding a CHILD, we need parent list
    return categories.filter((c) => c.id !== editingId);
  };

  const getChildOptions = () => {
    // For adding a GRANDCHILD, we need the selected parent's children
    if (!form.grandParentId) return [];
    const selectedParent = categories.find((c) => c.id === form.grandParentId);
    if (!selectedParent || !selectedParent.children) return [];
    return selectedParent.children.filter((c) => c.id !== editingId);
  };

  // ==================== SUBMIT ====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("zaem_token");
    if (!token) return;

    // Determine final parentId based on level
    let finalParentId: string | null = null;
    if (form.level === "child") {
      finalParentId = form.parentId;
    } else if (form.level === "grandchild") {
      finalParentId = form.parentId; // parentId is actually the child's id in grandchild case
    }

    if (form.level !== "parent" && !finalParentId) {
      setMessage({ type: "error", text: "Parent category select karein" });
      return;
    }

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
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim() || null,
          image: form.image.trim() || null,
          parentId: finalParentId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchCategories();
        resetForm();
        setMessage({
          type: "success",
          text: editingId ? "Category update ho gayi" : "Category add ho gayi",
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

  // ==================== DELETE ====================
  const handleDeleteClick = (cat: Category) => {
    const hasChildren = !!(cat.children && cat.children.length > 0);
    const hasProducts = cat._count?.products || 0;
    setDeleteConfirm({
      id: cat.id,
      name: cat.name,
      hasChildren,
      hasProducts,
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const token = localStorage.getItem("zaem_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/categories/${deleteConfirm.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        await fetchCategories();
        setMessage({ type: "success", text: "Category delete ho gayi" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: data.message || "Delete failed" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setDeleteConfirm(null);
    }
  };

  // ==================== RENDER ====================
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <p className="text-label text-gold mb-3">Manage</p>
          <h1 className="display-lg mb-3">Categories</h1>
          <p className="text-muted font-body text-sm">
            {stats.parents} parents · {stats.children} children · {stats.grandchildren} grandchildren
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="btn-primary flex items-center gap-2 w-fit"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            Add Category
          </button>
        )}
      </div>

      {/* Message */}
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

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-ivory border-2 border-gold/40 p-6 md:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl">
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
            {/* Level Select */}
            <div>
              <label className="text-label text-muted block mb-3">
                Category Level *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["parent", "child", "grandchild"] as Level[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        level: lvl,
                        parentId: "",
                        grandParentId: "",
                      })
                    }
                    className={`px-4 py-3 border-2 text-sm font-body transition-all ${
                      form.level === lvl
                        ? "border-gold bg-gold/10 text-ink"
                        : "border-ink/10 hover:border-ink/30 text-muted"
                    }`}
                  >
                    {lvl === "parent" && "📁 Parent"}
                    {lvl === "child" && "📂 Child"}
                    {lvl === "grandchild" && "📄 Grandchild"}
                  </button>
                ))}
              </div>
            </div>

            {/* Parent Dropdown (child) */}
            {form.level === "child" && (
              <div>
                <label className="text-label text-muted block mb-3">
                  Parent Category *
                </label>
                <select
                  value={form.parentId}
                  onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                  className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
                  required
                >
                  <option value="">Select Parent</option>
                  {getParentOptions().map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Grandparent + Parent Dropdowns (grandchild) */}
            {form.level === "grandchild" && (
              <>
                <div>
                  <label className="text-label text-muted block mb-3">
                    Parent (Level 1) *
                  </label>
                  <select
                    value={form.grandParentId}
                    onChange={(e) =>
                      setForm({ ...form, grandParentId: e.target.value, parentId: "" })
                    }
                    className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
                    required
                  >
                    <option value="">Select Parent</option>
                    {getParentOptions().map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-label text-muted block mb-3">
                    Child (Level 2) *
                  </label>
                  <select
                    value={form.parentId}
                    onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                    className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
                    required
                    disabled={!form.grandParentId}
                  >
                    <option value="">Select Child</option>
                    {getChildOptions().map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Name + Slug */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-label text-muted block mb-3">Name *</label>
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
                <label className="text-label text-muted block mb-3">Slug *</label>
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

            {/* Description */}
            <div>
              <label className="text-label text-muted block mb-3">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder="Short description..."
                className="w-full bg-transparent border border-ink/20 focus:border-gold outline-none p-4 text-sm font-body transition-colors resize-none"
              />
            </div>

            {/* Image */}
            <div>
              <label className="text-label text-muted block mb-3">Image URL</label>
              <input
                type="url"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://..."
                className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-sm font-body transition-colors"
              />
            </div>

            {form.image && (
              <div>
                <p className="text-label text-muted mb-3">Preview</p>
                <div className="w-24 h-32 bg-bone overflow-hidden">
                  <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" strokeWidth={1.5} />}
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
              <button type="button" onClick={resetForm} className="btn-outline">
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

      {/* ==================== TREE VIEW ==================== */}
      {loading ? (
        <div className="bg-ivory border border-ink/10 p-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto mb-4" />
          <p className="font-display text-xl text-muted">Loading...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-ivory border border-ink/10 p-20 text-center">
          <FolderTree className="w-16 h-16 text-muted mx-auto mb-6" strokeWidth={1} />
          <p className="font-display text-2xl mb-4">No categories found</p>
          <p className="text-muted font-body text-sm">
            {search ? "Try a different search" : "Add your first category"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCategories.map((parent) => {
            const isParentExpanded = expandedParents.has(parent.id);
            const parentProductCount = parent._count?.products || 0;

            return (
              <div key={parent.id} className="bg-ivory border border-ink/10">
                {/* Parent Row */}
                <div className="flex items-center gap-3 p-4 md:p-5 border-b border-ink/5">
                  <button
                    onClick={() => toggleParent(parent.id)}
                    className="p-1 text-muted hover:text-ink transition-colors shrink-0"
                    aria-label="Expand"
                  >
                    {isParentExpanded ? (
                      <ChevronDown className="w-4 h-4" strokeWidth={2} />
                    ) : (
                      <ChevronRight className="w-4 h-4" strokeWidth={2} />
                    )}
                  </button>

                  {/* Icon */}
                  <div className="w-10 h-10 bg-gold/10 flex items-center justify-center shrink-0">
                    <Folder className="w-5 h-5 text-gold" strokeWidth={1.5} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="font-display text-lg">{parent.name}</p>
                      <span className="text-[9px] bg-gold text-ink px-2 py-0.5 uppercase tracking-widest font-body font-medium">
                        Parent
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted font-body flex-wrap">
                      <code className="bg-bone px-2 py-0.5">{parent.slug}</code>
                      {parent.children && (
                        <span>{parent.children.length} children</span>
                      )}
                      {parentProductCount > 0 && (
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" strokeWidth={2} />
                          {parentProductCount} products
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setForm({
                          name: "",
                          slug: "",
                          description: "",
                          image: "",
                          parentId: parent.id,
                          grandParentId: "",
                          level: "child",
                        });
                        setEditingId(null);
                        setShowForm(true);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-body text-gold hover:bg-gold/10 transition-colors"
                      title="Add child"
                    >
                      + Child
                    </button>
                    <button
                      onClick={() => handleEdit(parent)}
                      className="p-2 text-muted hover:text-gold transition-colors"
                      aria-label="Edit"
                    >
                      <Edit className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(parent)}
                      className="p-2 text-muted hover:text-red-500 transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                {/* Children */}
                {isParentExpanded && parent.children && parent.children.length > 0 && (
                  <div className="bg-bone/20">
                    {parent.children.map((child) => {
                      const isChildExpanded = expandedChildren.has(child.id);
                      const hasGrandchildren = child.children && child.children.length > 0;

                      return (
                        <div key={child.id} className="border-b border-ink/5 last:border-0">
                          {/* Child Row */}
                          <div className="flex items-center gap-3 p-3 pl-10 md:pl-14">
                            {hasGrandchildren ? (
                              <button
                                onClick={() => toggleChild(child.id)}
                                className="p-1 text-muted hover:text-ink transition-colors shrink-0"
                                aria-label="Expand"
                              >
                                {isChildExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5" strokeWidth={2} />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
                                )}
                              </button>
                            ) : (
                              <div className="w-5 shrink-0" />
                            )}

                            <div className="w-8 h-8 bg-bone flex items-center justify-center shrink-0">
                              <Folder className="w-4 h-4 text-muted" strokeWidth={1.5} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-body text-sm font-medium">{child.name}</p>
                                <span className="text-[9px] bg-bone text-muted px-1.5 py-0.5 uppercase tracking-widest font-body">
                                  Child
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted font-body flex-wrap mt-0.5">
                                <code className="text-[10px]">{child.slug}</code>
                                {child._count && child._count.products > 0 && (
                                  <span>· {child._count.products} products</span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => {
                                  setForm({
                                    name: "",
                                    slug: "",
                                    description: "",
                                    image: "",
                                    parentId: "",
                                    grandParentId: parent.id,
                                    level: "grandchild",
                                  });
                                  setEditingId(null);
                                  setShowForm(true);
                                  window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                className="px-2 py-1 text-[9px] uppercase tracking-widest font-body text-gold hover:bg-gold/10 transition-colors"
                                title="Add grandchild"
                              >
                                + Sub
                              </button>
                              <button
                                onClick={() => handleEdit(child)}
                                className="p-1.5 text-muted hover:text-gold transition-colors"
                                aria-label="Edit"
                              >
                                <Edit className="w-3.5 h-3.5" strokeWidth={1.5} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(child)}
                                className="p-1.5 text-muted hover:text-red-500 transition-colors"
                                aria-label="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                              </button>
                            </div>
                          </div>

                          {/* Grandchildren */}
                          {isChildExpanded && hasGrandchildren && (
                            <div className="bg-bone/30">
                              {child.children!.map((gc) => (
                                <div
                                  key={gc.id}
                                  className="flex items-center gap-3 p-2.5 pl-20 md:pl-24 border-b border-ink/5 last:border-0"
                                >
                                  <div className="w-6 h-6 bg-ivory flex items-center justify-center shrink-0">
                                    <FileText className="w-3 h-3 text-muted" strokeWidth={1.5} />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="font-body text-xs">{gc.name}</p>
                                      <span className="text-[8px] bg-ivory text-muted px-1 py-0.5 uppercase tracking-widest font-body">
                                        Sub
                                      </span>
                                    </div>
                                    <code className="text-[10px] text-muted font-body">{gc.slug}</code>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={() => handleEdit(gc)}
                                      className="p-1.5 text-muted hover:text-gold transition-colors"
                                      aria-label="Edit"
                                    >
                                      <Edit className="w-3 h-3" strokeWidth={1.5} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteClick(gc)}
                                      className="p-1.5 text-muted hover:text-red-500 transition-colors"
                                      aria-label="Delete"
                                    >
                                      <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* No children */}
                {isParentExpanded && (!parent.children || parent.children.length === 0) && (
                  <div className="p-4 pl-16 bg-bone/10">
                    <p className="text-xs text-muted font-body italic">
                      No children yet. Click "+ Child" to add.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== DELETE CONFIRM MODAL ==================== */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative bg-ivory max-w-md w-full p-6 md:p-8 shadow-2xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-display text-xl mb-2">Delete Category?</h3>
                <p className="text-sm font-body text-muted mb-4">
                  <strong className="text-ink">&quot;{deleteConfirm.name}&quot;</strong> ko delete karna chahte hain?
                </p>

                {deleteConfirm.hasProducts > 0 && (
                  <div className="bg-red-50 border-l-2 border-red-500 p-3 mb-3 text-xs font-body text-red-700">
                    ⚠️ Isme {deleteConfirm.hasProducts} products hain. Pehle products move karein warna delete nahi hoga.
                  </div>
                )}

                {deleteConfirm.hasChildren && (
                  <div className="bg-red-50 border-l-2 border-red-500 p-3 text-xs font-body text-red-700">
                    ⚠️ Isme children hain. Server warning de sakta hai.
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-5 py-2.5 border border-ink/20 text-[10px] uppercase tracking-widest font-body hover:bg-bone transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 bg-red-600 text-white text-[10px] uppercase tracking-widest font-body hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}