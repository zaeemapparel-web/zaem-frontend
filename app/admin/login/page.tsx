"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowRight,
  Shield,
  CheckCircle,
  Sparkles,
  Sparkle,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminLoginPage() {
  const router = useRouter();
  const loginStore = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (data.success) {
        const role = data.data.user.role;
        if (role !== "ADMIN" && role !== "MANAGER" && role !== "STAFF") {
          setError("Access denied. Admin privileges required.");
          setLoading(false);
          return;
        }

        loginStore(data.data.user, data.data.token);

        if (remember) {
          try {
            localStorage.setItem("zaem_remember", "true");
          } catch {
            // ignore
          }
        }

        router.push("/admin/dashboard");
      } else {
        setError(data.message || "Invalid credentials");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-stretch bg-[#0A0A0A] relative overflow-hidden">

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ==================== LEFT SIDE (Branding) ==================== */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 bg-gradient-to-br from-[#0A0A0A] via-[#1D1D1F] to-[#0A0A0A]">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#1D1D1F] rounded-full blur-[120px] opacity-40" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#2C2C2E] rounded-full blur-[100px] opacity-30" />

        <div className="relative z-10 max-w-md text-center">

          <div className="mb-12">
            <h1 className="font-display text-6xl md:text-7xl text-white tracking-[0.2em] mb-4">
              ZAEM
            </h1>
            <p className="text-[10px] tracking-[0.5em] uppercase text-[#86868B]">
              EST. 2026
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="h-px w-12 bg-[#38383A]" />
            <Sparkle className="w-4 h-4 text-[#6E6E73]" strokeWidth={1.5} />
            <div className="h-px w-12 bg-[#38383A]" />
          </div>

          <h2 className="font-display text-3xl md:text-4xl text-white mb-4 leading-tight">
            Style.{" "}
            <span className="italic">Redefined.</span>
          </h2>

          <p className="text-[#86868B] text-[13px] leading-relaxed mb-12 max-w-sm mx-auto">
            Manage your premium store with an elegant dashboard built for
            the modern e-commerce experience.
          </p>

          <div className="space-y-3 text-left max-w-xs mx-auto">
            {[
              "Complete store management",
              "Real-time order tracking",
              "AI-powered analytics",
              "Secure admin access",
            ].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 text-[12px] text-[#98989D]"
              >
                <div className="w-5 h-5 rounded-full bg-[#1C1C1E] flex items-center justify-center shrink-0">
                  <CheckCircle
                    className="w-3 h-3 text-white"
                    strokeWidth={2.5}
                  />
                </div>
                {feature}
              </div>
            ))}
          </div>

          <p className="text-[10px] tracking-[0.3em] uppercase text-[#48484A] mt-16">
            Admin Panel v1.0
          </p>
        </div>
      </div>

      {/* ==================== RIGHT SIDE (Form) ==================== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white dark:bg-[#0A0A0A]">

        <div className="w-full max-w-md">

          <div className="lg:hidden text-center mb-10">
            <h1 className="font-display text-4xl md:text-5xl text-[#1D1D1F] dark:text-white tracking-[0.2em] mb-2">
              ZAEM
            </h1>
            <p className="text-[9px] tracking-[0.4em] uppercase text-[#86868B]">
              Admin Access
            </p>
          </div>

          <div className="mb-8">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#86868B] font-medium mb-3 flex items-center gap-2">
              <Sparkles className="w-3 h-3" strokeWidth={2} />
              Admin Panel
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-[#1D1D1F] dark:text-white mb-3">
              Welcome back
            </h2>
            <p className="text-[13px] text-[#6E6E73] dark:text-[#98989D]">
              Sign in to manage your store
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-[#FFEBEE] border-l-2 border-[#C62828] text-[#C62828] text-[13px] rounded-r-lg flex items-start gap-3">
              <AlertCircle
                className="w-4 h-4 shrink-0 mt-0.5"
                strokeWidth={2}
              />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ============ EMAIL ============ */}
            <div>
              <label className="admin-label">Email Address</label>
              <div className="relative">
                <Mail
                  className="w-4 h-4 absolute left-3.5 top-[22px] text-[#86868B] pointer-events-none"
                  strokeWidth={2}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="admin@zaem.com"
                  className="admin-input pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            {/* ============ PASSWORD ============ */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="admin-label !mb-0">Password</label>
                <button
                  type="button"
                  className="text-[10px] tracking-wider uppercase text-[#0A84FF] hover:underline font-medium"
                  onClick={() =>
                    alert(
                      "Please contact the developer to reset your password."
                    )
                  }
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock
                  className="w-4 h-4 absolute left-3.5 top-[22px] text-[#86868B] pointer-events-none"
                  strokeWidth={2}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="admin-input pl-10 pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-[13px] p-1.5 rounded-md hover:bg-[#F5F5F7] dark:hover:bg-[#1C1C1E] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff
                      className="w-4 h-4 text-[#86868B]"
                      strokeWidth={2}
                    />
                  ) : (
                    <Eye
                      className="w-4 h-4 text-[#86868B]"
                      strokeWidth={2}
                    />
                  )}
                </button>
              </div>
            </div>

            {/* ============ REMEMBER ============ */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <button
                type="button"
                onClick={() => setRemember(!remember)}
                className={`w-4 h-4 rounded border transition-all flex items-center justify-center shrink-0 ${
                  remember
                    ? "bg-[#1D1D1F] dark:bg-white border-[#1D1D1F] dark:border-white"
                    : "border-[#D2D2D7] dark:border-[#48484A] hover:border-[#86868B]"
                }`}
              >
                {remember && (
                  <CheckCircle
                    className="w-3 h-3 text-white dark:text-[#1D1D1F]"
                    strokeWidth={3}
                  />
                )}
              </button>
              <span className="text-[12px] text-[#6E6E73] dark:text-[#98989D]">
                Remember this device for 30 days
              </span>
            </label>

            {/* ============ SUBMIT ============ */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="group w-full h-12 md:h-13 flex items-center justify-center gap-2 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-xl text-[12px] tracking-[0.2em] uppercase font-medium hover:opacity-90 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight
                    className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                    strokeWidth={2}
                  />
                </>
              )}
            </button>

          </form>

          <div className="mt-8 pt-6 border-t border-[#E5E5E7] dark:border-[#38383A]">
            <div className="flex items-center justify-center gap-2 text-[11px] text-[#86868B]">
              <Shield className="w-3 h-3" strokeWidth={2} />
              <span>Secured with JWT authentication</span>
            </div>

            <p className="text-center text-[11px] text-[#86868B] mt-4">
              <Link
                href="/"
                className="hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
              >
                ← Back to store
              </Link>
            </p>
          </div>

        </div>
      </div>

    </main>
  );
}