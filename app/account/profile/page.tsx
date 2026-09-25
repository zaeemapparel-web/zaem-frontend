"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ProfilePage() {
  const { user, loadFromStorage, login, token } = useAuthStore();
  const [form, setForm] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = localStorage.getItem("zaem_token");
    if (!t) return;

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        login(data.data.user, t);
        setMessage({ type: "success", text: "Profile updated successfully" });
      } else {
        setMessage({ type: "error", text: data.message || "Failed to update" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  return (
    <main className="bg-ivory text-ink min-h-screen">

      {/* Header */}
      <section className="pt-16 md:pt-24 pb-10 md:pb-16 px-6 md:px-10 lg:px-16 border-b border-ink/10">
        <div className="max-w-[800px] mx-auto">
          <nav className="flex items-center gap-2 text-label text-muted mb-6">
            <Link href="/account" className="hover:text-gold transition-colors">
              Account
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-ink">Profile</span>
          </nav>
          <h1 className="display-lg mb-4">Profile</h1>
          <p className="text-muted text-sm font-body">
            Update your personal information.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-10 md:py-16 px-6 md:px-10 lg:px-16">
        <div className="max-w-[800px] mx-auto">

          {message.text && (
            <div
              className={`mb-8 p-4 text-sm font-body border-l-2 ${
                message.type === "success"
                  ? "bg-gold/10 border-gold text-gold"
                  : "bg-ink/5 border-ink text-ink"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">

            <div>
              <label className="text-label text-muted block mb-3">
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
              />
            </div>

            <div>
              <label className="text-label text-muted block mb-3">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full bg-transparent border-b border-ink/10 outline-none py-3 text-base font-body text-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted mt-2 font-body">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label className="text-label text-muted block mb-3">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="03001234567"
                className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </form>

        </div>
      </section>

    </main>
  );
}