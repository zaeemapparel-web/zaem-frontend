"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  Plus,
  MapPin,
  Trash2,
  Check,
  Home,
  Loader2,
  AlertCircle,
  User as UserIcon,
  Phone,
  Building2,
  Hash,
  Globe,
  X,
  CheckCircle,
  Star,
  Pencil,
  Briefcase,
  Package,
  Sparkles,
  Info,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ==================== TYPES ====================
interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state?: string | null;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface AddressForm {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

const EMPTY_FORM: AddressForm = {
  fullName: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Pakistan",
  isDefault: false,
};

// ==================== PAKISTAN CITIES ====================
const PK_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Hyderabad",
  "Bahawalpur",
  "Sargodha",
  "Sukkur",
  "Larkana",
  "Sheikhupura",
  "Mardan",
  "Gujrat",
  "Kasur",
  "Rahim Yar Khan",
];

// ==================== VALIDATION ====================
const validatePhone = (phone: string) => {
  const cleaned = phone.replace(/\D/g, "");
  return /^(92|0)?3\d{9}$/.test(cleaned);
};

const validatePostalCode = (code: string) => {
  return /^\d{5}$/.test(code.replace(/\D/g, ""));
};

// ==================== MAIN COMPONENT ====================
export default function AddressesPage() {
  const { loadFromStorage, isAuthenticated } = useAuthStore();

  // ==================== STATE ====================
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Form state
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ==================== INIT ====================
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // ==================== FETCH ====================
  const fetchAddresses = async () => {
    const token = localStorage.getItem("zaem_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        // Sort: default first
        const sorted = [...(data.data.addresses || [])].sort(
          (a, b) => Number(b.isDefault) - Number(a.isDefault)
        );
        setAddresses(sorted);
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==================== TOAST ====================
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // ==================== VALIDATE FORM ====================
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      errors.fullName = "Full name is required (min. 2 characters)";
    }
    if (!form.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!validatePhone(form.phone)) {
      errors.phone = "Enter a valid Pakistani phone number";
    }
    if (!form.street.trim() || form.street.trim().length < 5) {
      errors.street = "Street address is required";
    }
    if (!form.city.trim()) {
      errors.city = "City is required";
    }
    if (!form.postalCode.trim()) {
      errors.postalCode = "Postal code is required";
    } else if (!validatePostalCode(form.postalCode)) {
      errors.postalCode = "Enter a valid 5-digit postal code";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ==================== SUBMIT ====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const token = localStorage.getItem("zaem_token");
    if (!token) return;

    setSaving(true);
    try {
      const url = editingId
        ? `${API_URL}/api/addresses/${editingId}`
        : `${API_URL}/api/addresses`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          street: form.street.trim(),
          city: form.city.trim(),
          state: form.state.trim() || null,
          postalCode: form.postalCode.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchAddresses();
        showToast(
          "success",
          editingId ? "Address updated" : "Address added"
        );
        resetForm();
      } else {
        showToast("error", data.message || "Failed to save address");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ==================== DELETE ====================
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const token = localStorage.getItem("zaem_token");
    if (!token) return;

    setDeleting(deleteConfirm.id);
    try {
      const res = await fetch(
        `${API_URL}/api/addresses/${deleteConfirm.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setAddresses((prev) =>
          prev.filter((a) => a.id !== deleteConfirm.id)
        );
        showToast("success", "Address deleted");
      } else {
        showToast("error", "Failed to delete");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Network error");
    } finally {
      setDeleting(null);
      setDeleteConfirm(null);
    }
  };

  // ==================== SET DEFAULT ====================
  const handleSetDefault = async (id: string) => {
    const token = localStorage.getItem("zaem_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/addresses/${id}/default`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchAddresses();
        showToast("success", "Default address updated");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Network error");
    }
  };

  // ==================== EDIT ====================
  const handleEdit = (addr: Address) => {
    setForm({
      fullName: addr.fullName,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      state: addr.state || "",
      postalCode: addr.postalCode,
      country: addr.country,
      isDefault: addr.isDefault,
    });
    setFormErrors({});
    setEditingId(addr.id);
    setShowForm(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ==================== RESET ====================
  const resetForm = () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setEditingId(null);
    setShowForm(false);
  };

  // ==================== UPDATE FIELD ====================
  const updateField = (key: keyof AddressForm, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  // ==================== RENDER ====================
  return (
    <main className="bg-[#FAFAFA] dark:bg-black min-h-screen">

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
      <section className="pt-8 md:pt-16 pb-6 md:pb-10 px-4 md:px-8 lg:px-16 border-b border-[#E5E5E7] dark:border-[#38383A]">
        <div className="max-w-[1400px] mx-auto">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[10px] tracking-wider uppercase text-[#86868B] font-medium mb-5 flex-wrap">
            <Link
              href="/"
              className="hover:text-[#1D1D1F] dark:hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Home className="w-3 h-3" strokeWidth={2} />
              Home
            </Link>
            <ChevronRight className="w-3 h-3" strokeWidth={2} />
            <Link
              href="/account"
              className="hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
            >
              My Account
            </Link>
            <ChevronRight className="w-3 h-3" strokeWidth={2} />
            <span className="text-[#1D1D1F] dark:text-white">Addresses</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#86868B] font-medium mb-3">
                Shipping
              </p>
              <h1 className="font-display text-3xl md:text-5xl lg:text-6xl text-[#1D1D1F] dark:text-white mb-3">
                My Addresses
              </h1>
              <p className="text-[#6E6E73] dark:text-[#98989D] text-sm md:text-base font-body">
                {addresses.length} saved{" "}
                {addresses.length === 1 ? "address" : "addresses"}
                {addresses.some((a) => a.isDefault) &&
                  " · default set"}
              </p>
            </div>

            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-xl text-[11px] tracking-wider uppercase font-medium hover:opacity-90 active:scale-[0.98] transition-all shrink-0"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                Add New Address
              </button>
            )}
          </div>

        </div>
      </section>

      {/* ==================== FORM ==================== */}
      {showForm && (
        <section className="py-8 px-4 md:px-8 lg:px-16 admin-fade-in">
          <div className="max-w-[1400px] mx-auto">
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border-2 border-[#1D1D1F] dark:border-white overflow-hidden">

              {/* Form Header */}
              <div className="p-5 md:p-6 border-b border-[#E5E5E7] dark:border-[#38383A] flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#E3F2FD] flex items-center justify-center shrink-0">
                    <MapPin
                      className="w-5 h-5 text-[#0A84FF]"
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <h2 className="font-display text-lg md:text-xl text-[#1D1D1F] dark:text-white">
                      {editingId ? "Edit Address" : "Add New Address"}
                    </h2>
                    <p className="text-[11px] text-[#86868B] mt-0.5">
                      {editingId
                        ? "Update the details below"
                        : "Fill in your shipping address"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={resetForm}
                  className="p-2 rounded-lg hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors"
                  aria-label="Close form"
                >
                  <X
                    className="w-4 h-4 text-[#86868B]"
                    strokeWidth={2}
                  />
                </button>
              </div>

              {/* Form Fields */}
              <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5">

                <div className="grid md:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] mb-2">
                      Full Name <span className="text-[#C62828]">*</span>
                    </label>
                    <div className="relative">
                      <UserIcon
                        className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B] pointer-events-none"
                        strokeWidth={2}
                      />
                      <input
                        type="text"
                        value={form.fullName}
                        onChange={(e) =>
                          updateField("fullName", e.target.value)
                        }
                        placeholder="Your full name"
                        disabled={saving}
                        className={`w-full h-12 bg-[#FAFAFA] dark:bg-[#0A0A0A] border rounded-xl pl-11 pr-4 text-[14px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:bg-white dark:focus:bg-[#1C1C1E] focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.06)] transition-all ${
                          formErrors.fullName
                            ? "border-[#C62828] focus:border-[#C62828]"
                            : "border-[#E5E5E7] dark:border-[#38383A] focus:border-[#1D1D1F] dark:focus:border-white"
                        }`}
                      />
                    </div>
                    {formErrors.fullName && (
                      <p className="text-[10px] text-[#C62828] mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" strokeWidth={2} />
                        {formErrors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] mb-2">
                      Phone Number <span className="text-[#C62828]">*</span>
                    </label>
                    <div className="relative">
                      <Phone
                        className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B] pointer-events-none"
                        strokeWidth={2}
                      />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        placeholder="0300 1234567"
                        disabled={saving}
                        className={`w-full h-12 bg-[#FAFAFA] dark:bg-[#0A0A0A] border rounded-xl pl-11 pr-4 text-[14px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:bg-white dark:focus:bg-[#1C1C1E] focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.06)] transition-all ${
                          formErrors.phone
                            ? "border-[#C62828] focus:border-[#C62828]"
                            : "border-[#E5E5E7] dark:border-[#38383A] focus:border-[#1D1D1F] dark:focus:border-white"
                        }`}
                      />
                    </div>
                    {formErrors.phone && (
                      <p className="text-[10px] text-[#C62828] mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" strokeWidth={2} />
                        {formErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Street */}
                <div>
                  <label className="block text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] mb-2">
                    Street Address <span className="text-[#C62828]">*</span>
                  </label>
                  <div className="relative">
                    <Home
                      className="w-4 h-4 absolute left-4 top-4 text-[#86868B] pointer-events-none"
                      strokeWidth={2}
                    />
                    <textarea
                      value={form.street}
                      onChange={(e) => updateField("street", e.target.value)}
                      placeholder="House #, Street name, Area, Landmark"
                      disabled={saving}
                      rows={2}
                      className={`w-full bg-[#FAFAFA] dark:bg-[#0A0A0A] border rounded-xl pl-11 pr-4 py-3 text-[14px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:bg-white dark:focus:bg-[#1C1C1E] focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.06)] transition-all resize-none ${
                        formErrors.street
                          ? "border-[#C62828] focus:border-[#C62828]"
                          : "border-[#E5E5E7] dark:border-[#38383A] focus:border-[#1D1D1F] dark:focus:border-white"
                      }`}
                    />
                  </div>
                  {formErrors.street && (
                    <p className="text-[10px] text-[#C62828] mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" strokeWidth={2} />
                      {formErrors.street}
                    </p>
                  )}
                </div>

                {/* City / State / Postal */}
                <div className="grid md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] mb-2">
                      City <span className="text-[#C62828]">*</span>
                    </label>
                    <div className="relative">
                      <Building2
                        className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B] pointer-events-none"
                        strokeWidth={2}
                      />
                      <input
                        type="text"
                        value={form.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        placeholder="e.g., Lahore"
                        list="cities"
                        disabled={saving}
                        className={`w-full h-12 bg-[#FAFAFA] dark:bg-[#0A0A0A] border rounded-xl pl-11 pr-4 text-[14px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:bg-white dark:focus:bg-[#1C1C1E] focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.06)] transition-all ${
                          formErrors.city
                            ? "border-[#C62828] focus:border-[#C62828]"
                            : "border-[#E5E5E7] dark:border-[#38383A] focus:border-[#1D1D1F] dark:focus:border-white"
                        }`}
                      />
                      <datalist id="cities">
                        {PK_CITIES.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </div>
                    {formErrors.city && (
                      <p className="text-[10px] text-[#C62828] mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" strokeWidth={2} />
                        {formErrors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] mb-2">
                      State / Province
                    </label>
                    <div className="relative">
                      <MapPin
                        className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B] pointer-events-none"
                        strokeWidth={2}
                      />
                      <input
                        type="text"
                        value={form.state}
                        onChange={(e) => updateField("state", e.target.value)}
                        placeholder="e.g., Punjab"
                        disabled={saving}
                        className="w-full h-12 bg-[#FAFAFA] dark:bg-[#0A0A0A] border border-[#E5E5E7] dark:border-[#38383A] rounded-xl pl-11 pr-4 text-[14px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:border-[#1D1D1F] dark:focus:border-white focus:bg-white dark:focus:bg-[#1C1C1E] focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.06)] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] mb-2">
                      Postal Code <span className="text-[#C62828]">*</span>
                    </label>
                    <div className="relative">
                      <Hash
                        className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B] pointer-events-none"
                        strokeWidth={2}
                      />
                      <input
                        type="text"
                        value={form.postalCode}
                        onChange={(e) =>
                          updateField("postalCode", e.target.value)
                        }
                        placeholder="54000"
                        maxLength={5}
                        disabled={saving}
                        className={`w-full h-12 bg-[#FAFAFA] dark:bg-[#0A0A0A] border rounded-xl pl-11 pr-4 text-[14px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:bg-white dark:focus:bg-[#1C1C1E] focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.06)] transition-all ${
                          formErrors.postalCode
                            ? "border-[#C62828] focus:border-[#C62828]"
                            : "border-[#E5E5E7] dark:border-[#38383A] focus:border-[#1D1D1F] dark:focus:border-white"
                        }`}
                      />
                    </div>
                    {formErrors.postalCode && (
                      <p className="text-[10px] text-[#C62828] mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" strokeWidth={2} />
                        {formErrors.postalCode}
                      </p>
                    )}
                  </div>
                </div>

                {/* Country + Default */}
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] mb-2">
                      Country
                    </label>
                    <div className="relative">
                      <Globe
                        className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B] pointer-events-none"
                        strokeWidth={2}
                      />
                      <input
                        type="text"
                        value={form.country}
                        disabled
                        className="w-full h-12 bg-[#F5F5F7] dark:bg-[#0A0A0A] border border-[#E5E5E7] dark:border-[#38383A] rounded-xl pl-11 pr-4 text-[14px] text-[#6E6E73] dark:text-[#98989D] outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="flex items-end pb-3">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <button
                        type="button"
                        onClick={() =>
                          updateField("isDefault", !form.isDefault)
                        }
                        className={`w-5 h-5 rounded-md border transition-all flex items-center justify-center shrink-0 ${
                          form.isDefault
                            ? "bg-[#1D1D1F] dark:bg-white border-[#1D1D1F] dark:border-white"
                            : "border-[#D2D2D7] dark:border-[#48484A] hover:border-[#86868B]"
                        }`}
                      >
                        {form.isDefault && (
                          <Check
                            className="w-3 h-3 text-white dark:text-[#1D1D1F]"
                            strokeWidth={3}
                          />
                        )}
                      </button>
                      <span className="text-[13px] text-[#6E6E73] dark:text-[#98989D]">
                        Set as default shipping address
                      </span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-3 flex-wrap">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-xl text-[11px] tracking-wider uppercase font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" strokeWidth={2} />
                        {editingId ? "Update Address" : "Save Address"}
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[#E5E5E7] dark:border-[#38383A] text-[11px] tracking-wider uppercase font-medium text-[#1D1D1F] dark:text-white hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>

              </form>
            </div>
          </div>
        </section>
      )}

      {/* ==================== ADDRESSES LIST ==================== */}
      <section className="py-8 md:py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-[1400px] mx-auto">

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="text-center">
                <Loader2
                  className="w-6 h-6 text-[#86868B] animate-spin mx-auto mb-3"
                  strokeWidth={2}
                />
                <p className="text-[10px] tracking-[0.3em] uppercase text-[#86868B]">
                  Loading Addresses
                </p>
              </div>
            </div>
          ) : addresses.length === 0 ? (
            /* ==================== EMPTY STATE ==================== */
            <div className="text-center py-20 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A] px-6">
              <div className="w-20 h-20 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-full flex items-center justify-center mx-auto mb-5">
                <MapPin
                  className="w-8 h-8 text-[#86868B]"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="font-display text-2xl md:text-3xl text-[#1D1D1F] dark:text-white mb-3">
                No addresses yet
              </h3>
              <p className="text-[14px] text-[#6E6E73] dark:text-[#98989D] mb-8 max-w-md mx-auto leading-relaxed">
                Add your shipping address to checkout faster and easier.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-xl text-[12px] tracking-[0.2em] uppercase font-medium hover:opacity-90 active:scale-[0.98] transition-all"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                Add Your First Address
              </button>
            </div>
          ) : (
            /* ==================== ADDRESSES GRID ==================== */
            <>
              <div className="flex items-center justify-between mb-5">
                <p className="text-[11px] tracking-wider uppercase text-[#86868B] font-medium">
                  {addresses.length}{" "}
                  {addresses.length === 1 ? "address" : "addresses"}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 md:gap-5">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`group relative bg-white dark:bg-[#1C1C1E] rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                      addr.isDefault
                        ? "border-[#1D1D1F] dark:border-white"
                        : "border-[#E5E5E7] dark:border-[#38383A] hover:border-[#D2D2D7] dark:hover:border-[#48484A]"
                    }`}
                  >
                    {/* Default Badge */}
                    {addr.isDefault && (
                      <div className="absolute top-0 right-0 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] text-[9px] tracking-[0.2em] uppercase font-medium px-3 py-1.5 rounded-bl-xl flex items-center gap-1">
                        <Star
                          className="w-2.5 h-2.5 fill-current"
                          strokeWidth={2.5}
                        />
                        Default
                      </div>
                    )}

                    <div className="p-5 md:p-6">

                      {/* Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                            addr.isDefault
                              ? "bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F]"
                              : "bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#6E6E73] dark:text-[#98989D]"
                          }`}
                        >
                          <Home className="w-5 h-5" strokeWidth={2} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-display text-lg text-[#1D1D1F] dark:text-white truncate mb-1">
                            {addr.fullName}
                          </p>
                          <p className="text-[12px] text-[#6E6E73] dark:text-[#98989D] flex items-center gap-1.5">
                            <Phone className="w-3 h-3" strokeWidth={2} />
                            {addr.phone}
                          </p>
                        </div>
                      </div>

                      {/* Address Body */}
                      <div className="space-y-1.5 mb-5 min-h-[60px]">
                        <p className="text-[13px] text-[#6E6E73] dark:text-[#98989D] leading-relaxed">
                          {addr.street}
                        </p>
                        <p className="text-[13px] text-[#6E6E73] dark:text-[#98989D] leading-relaxed">
                          {addr.city}
                          {addr.state && `, ${addr.state}`}
                          {addr.postalCode && ` - ${addr.postalCode}`}
                        </p>
                        <p className="text-[12px] text-[#86868B] flex items-center gap-1.5 pt-1">
                          <Globe className="w-3 h-3" strokeWidth={2} />
                          {addr.country}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-4 border-t border-[#E5E5E7] dark:border-[#38383A] flex-wrap">
                        <button
                          onClick={() => handleEdit(addr)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
                        >
                          <Pencil className="w-3 h-3" strokeWidth={2} />
                          Edit
                        </button>

                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefault(addr.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] tracking-wider uppercase font-medium text-[#0A84FF] hover:bg-[#E3F2FD] transition-colors"
                          >
                            <Check
                              className="w-3 h-3"
                              strokeWidth={2.5}
                            />
                            Set Default
                          </button>
                        )}

                        <button
                          onClick={() =>
                            setDeleteConfirm({
                              id: addr.id,
                              name: addr.fullName,
                            })
                          }
                          disabled={deleting === addr.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] hover:bg-[#FFEBEE] hover:text-[#C62828] transition-colors ml-auto disabled:opacity-50"
                        >
                          {deleting === addr.id ? (
                            <Loader2
                              className="w-3 h-3 animate-spin"
                              strokeWidth={2}
                            />
                          ) : (
                            <Trash2 className="w-3 h-3" strokeWidth={2} />
                          )}
                          Delete
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </section>

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
                  Delete Address?
                </h3>
                <p className="text-[13px] text-[#6E6E73] dark:text-[#98989D] leading-relaxed">
                  Delete{" "}
                  <strong className="text-[#1D1D1F] dark:text-white">
                    {deleteConfirm.name}
                  </strong>
                  &apos;s address? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting !== null}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E5E7] dark:border-[#38383A] text-[12px] tracking-wider uppercase font-medium text-[#1D1D1F] dark:text-white hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting !== null}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C62828] hover:bg-[#B71C1C] text-white text-[12px] tracking-wider uppercase font-medium transition-colors disabled:opacity-50"
              >
                {deleting ? (
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

    </main>
  );
}