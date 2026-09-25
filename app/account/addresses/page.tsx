"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Plus, MapPin, Trash2, Check } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

export default function AddressesPage() {
  const { loadFromStorage, isAuthenticated } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Pakistan",
    isDefault: false,
  });

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

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
      if (data.success) setAddresses(data.data.addresses);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("zaem_token");
    if (!token) return;

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
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        await fetchAddresses();
        resetForm();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    const token = localStorage.getItem("zaem_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/addresses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSetDefault = async (id: string) => {
    const token = localStorage.getItem("zaem_token");
    if (!token) return;

    try {
      await fetch(`${API_URL}/api/addresses/${id}/default`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchAddresses();
    } catch (error) {
      console.error(error);
    }
  };

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
    setEditingId(addr.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({
      fullName: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Pakistan",
      isDefault: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <main className="bg-ivory text-ink min-h-screen">

      {/* Header */}
      <section className="pt-16 md:pt-24 pb-10 md:pb-16 px-6 md:px-10 lg:px-16 border-b border-ink/10">
        <div className="max-w-[1200px] mx-auto">
          <nav className="flex items-center gap-2 text-label text-muted mb-6">
            <Link href="/account" className="hover:text-gold transition-colors">
              Account
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-ink">Addresses</span>
          </nav>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="display-lg mb-4">Addresses</h1>
              <p className="text-muted text-sm font-body">
                {addresses.length} saved {addresses.length === 1 ? "address" : "addresses"}
              </p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" strokeWidth={1.5} />
                Add New
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 md:py-16 px-6 md:px-10 lg:px-16">
        <div className="max-w-[1200px] mx-auto">

          {/* Form */}
          {showForm && (
            <div className="mb-10 border border-gold/30 bg-gold/5 p-6 md:p-8">
              <h2 className="font-display text-2xl mb-8">
                {editingId ? "Edit Address" : "Add New Address"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-5">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required
                    className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
                  />
                  <input
                    type="tel"
                    placeholder="Phone *"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                    className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Street Address *"
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                  required
                  className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
                />

                <div className="grid md:grid-cols-3 gap-5">
                  <input
                    type="text"
                    placeholder="City *"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    required
                    className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Postal Code *"
                    value={form.postalCode}
                    onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                    required
                    className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={(e) =>
                      setForm({ ...form, isDefault: e.target.checked })
                    }
                    className="w-4 h-4 accent-gold"
                  />
                  <span className="text-sm font-body">
                    Set as default address
                  </span>
                </label>

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="btn-primary">
                    {editingId ? "Update Address" : "Save Address"}
                  </button>
                  <button type="button" onClick={resetForm} className="btn-outline">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Addresses List */}
          {loading ? (
            <div className="text-center py-20">
              <p className="font-display text-2xl text-muted">Loading...</p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-20">
              <MapPin className="w-16 h-16 text-muted mx-auto mb-8" strokeWidth={1} />
              <p className="font-display text-3xl mb-6">No addresses yet.</p>
              <p className="text-muted font-body mb-10">
                Add your shipping address to checkout faster.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`border p-6 transition-all duration-300 ${
                    addr.isDefault
                      ? "border-gold bg-gold/5"
                      : "border-ink/10 hover:border-ink/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-display text-lg">{addr.fullName}</p>
                        {addr.isDefault && (
                          <span className="text-label text-gold flex items-center gap-1">
                            <Check className="w-3 h-3" strokeWidth={2} />
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted font-body mb-1">
                        {addr.phone}
                      </p>
                      <p className="text-sm text-muted font-body">
                        {addr.street}, {addr.city},{" "}
                        {addr.state && `${addr.state}, `}
                        {addr.postalCode}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4 border-t border-ink/10">
                    <button
                      onClick={() => handleEdit(addr)}
                      className="text-label hover:text-gold transition-colors"
                    >
                      Edit
                    </button>
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        className="text-label hover:text-gold transition-colors"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="text-label hover:text-gold transition-colors flex items-center gap-1 ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

    </main>
  );
}