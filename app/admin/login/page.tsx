"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminLoginPage() {
  const router = useRouter();
  const loginStore = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        // Check if admin
        if (data.data.user.role !== "ADMIN") {
          setError("Access denied. Admin only.");
          setLoading(false);
          return;
        }

        loginStore(data.data.user, data.data.token);
        router.push("/admin/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-ink text-ivory min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-12">
          <p className="font-display text-4xl tracking-[0.15em] mb-3">ZAEM</p>
          <p className="text-label text-gold">Admin Access</p>
        </div>

        {/* Card */}
        <div className="bg-ivory/5 border border-ivory/10 p-8 md:p-10">

          <h1 className="font-display text-2xl mb-2">Welcome back</h1>
          <p className="text-ivory/50 text-sm font-body mb-8">
            Sign in to manage ZAEM
          </p>

          {error && (
            <div className="mb-6 p-4 bg-gold/10 border-l-2 border-gold text-sm font-body text-gold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="text-label text-ivory/50 block mb-3">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@zaem.com"
                className="w-full bg-transparent border-b border-ivory/20 focus:border-gold outline-none py-3 text-base font-body transition-colors text-ivory placeholder:text-ivory/30"
              />
            </div>

            <div>
              <label className="text-label text-ivory/50 block mb-3">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-transparent border-b border-ivory/20 focus:border-gold outline-none py-3 text-base font-body transition-colors text-ivory placeholder:text-ivory/30"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-gold text-ink text-label hover:bg-ivory transition-colors duration-500 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

        </div>

        {/* Footer */}
        <p className="text-center text-ivory/30 text-xs font-body mt-8">
          ZAEM Admin Panel v1.0
        </p>

      </div>
    </main>
  );
}