"use client";

import { useEffect, useState } from "react";
import { Folder, FileText, ChevronRight, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  isParent: boolean;
  children?: Category[];
}

interface Props {
  value: string;
  onChange: (categoryId: string, path: string) => void;
  required?: boolean;
}

export default function AdminCategorySelector({
  value,
  onChange,
  required = true,
}: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedParent, setSelectedParent] = useState<string>("");
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [selectedGrandchild, setSelectedGrandchild] = useState<string>("");

  // ==================== FETCH ====================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/categories`);
        const data = await res.json();
        if (data.success) {
          setCategories(data.data.categories || []);
        }
      } catch (error) {
        console.error("Category fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // ==================== AUTO-FILL ====================
  useEffect(() => {
    if (!value || categories.length === 0) return;

    for (const parent of categories) {
      if (parent.id === value) {
        setSelectedParent(parent.id);
        setSelectedChild("");
        setSelectedGrandchild("");
        return;
      }
      if (parent.children) {
        for (const child of parent.children) {
          if (child.id === value) {
            setSelectedParent(parent.id);
            setSelectedChild(child.id);
            setSelectedGrandchild("");
            return;
          }
          if (child.children) {
            for (const gc of child.children) {
              if (gc.id === value) {
                setSelectedParent(parent.id);
                setSelectedChild(child.id);
                setSelectedGrandchild(gc.id);
                return;
              }
            }
          }
        }
      }
    }
  }, [value, categories]);

  // ==================== TRIGGER onChange ====================
  useEffect(() => {
    const finalId = selectedGrandchild || selectedChild || selectedParent;
    if (!finalId) {
      onChange("", "");
      return;
    }

    const parent = categories.find((c) => c.id === selectedParent);
    const child = parent?.children?.find((c) => c.id === selectedChild);
    const grandchild = child?.children?.find((c) => c.id === selectedGrandchild);

    const pathParts = [parent?.name, child?.name, grandchild?.name].filter(Boolean);
    const path = pathParts.join(" → ");

    onChange(finalId, path);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedParent, selectedChild, selectedGrandchild, categories]);

  // ==================== OPTIONS ====================
  const selectedParentObj = categories.find((c) => c.id === selectedParent);
  const childOptions = selectedParentObj?.children || [];
  const selectedChildObj = childOptions.find((c) => c.id === selectedChild);
  const grandchildOptions = selectedChildObj?.children || [];

  // ==================== LOADING ====================
  if (loading) {
    return (
      <div className="admin-card p-6 flex items-center gap-3">
        <Loader2 className="w-4 h-4 animate-spin text-[#86868B]" strokeWidth={2} />
        <span className="text-[13px] text-[#86868B]">Loading categories...</span>
      </div>
    );
  }

  // ==================== RENDER ====================
  return (
    <div className="space-y-5">

      {/* ==================== PARENT ==================== */}
      <div>
        <label className="admin-label flex items-center gap-2">
          <Folder className="w-3.5 h-3.5" strokeWidth={2} />
          Parent Category {required && <span className="text-[#C62828]">*</span>}
        </label>
        <select
          value={selectedParent}
          onChange={(e) => {
            setSelectedParent(e.target.value);
            setSelectedChild("");
            setSelectedGrandchild("");
          }}
          required={required}
          className="admin-input"
        >
          <option value="">Select Parent</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* ==================== CHILD ==================== */}
      {selectedParent && childOptions.length > 0 && (
        <div className="admin-scale-in">
          <label className="admin-label flex items-center gap-2">
            <Folder className="w-3.5 h-3.5" strokeWidth={2} />
            Child Category{" "}
            <span className="text-[#86868B] font-normal normal-case tracking-normal">
              (optional)
            </span>
          </label>
          <select
            value={selectedChild}
            onChange={(e) => {
              setSelectedChild(e.target.value);
              setSelectedGrandchild("");
            }}
            className="admin-input"
          >
            <option value="">— Skip (stay at Parent level) —</option>
            {childOptions.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ==================== GRANDCHILD ==================== */}
      {selectedChild && grandchildOptions.length > 0 && (
        <div className="admin-scale-in">
          <label className="admin-label flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" strokeWidth={2} />
            Grandchild Category{" "}
            <span className="text-[#86868B] font-normal normal-case tracking-normal">
              (optional)
            </span>
          </label>
          <select
            value={selectedGrandchild}
            onChange={(e) => setSelectedGrandchild(e.target.value)}
            className="admin-input"
          >
            <option value="">— Skip (stay at Child level) —</option>
            {grandchildOptions.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ==================== PREVIEW ==================== */}
      {(selectedParent || selectedChild || selectedGrandchild) && (
        <div className="bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-lg p-4 border border-[#E5E5E7] dark:border-[#38383A] admin-scale-in">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#86868B] font-medium mb-2">
            Product will appear in
          </p>
          <div className="flex items-center gap-1.5 text-[13px] font-medium flex-wrap text-[#1D1D1F] dark:text-white">
            {selectedParentObj && <span>{selectedParentObj.name}</span>}
            {selectedChildObj && (
              <>
                <ChevronRight className="w-3 h-3 text-[#86868B]" strokeWidth={2} />
                <span>{selectedChildObj.name}</span>
              </>
            )}
            {selectedGrandchild && (
              <>
                <ChevronRight className="w-3 h-3 text-[#86868B]" strokeWidth={2} />
                <span className="text-[#6E6E73] dark:text-[#98989D]">
                  {grandchildOptions.find((g) => g.id === selectedGrandchild)?.name}
                </span>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}