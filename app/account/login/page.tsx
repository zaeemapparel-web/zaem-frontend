"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Shield,
  User as UserIcon,
  ShoppingBag,
  Package,
  Heart,
  Truck,
  RotateCcw,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function LoginPage() {
  const router = useRouter();
  const loginStore = useAuthStore((s) => s.login);

  // ==================== STATE ====================
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ==================== INIT ====================
  useEffect(() => {
    setMounted(true);
    // Load remembered email
    try {
      const saved = localStorage.getItem("zaem_remembered_email");
      if (saved) {
        setEmail(saved);
        setRemember(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // ==================== SUBMIT ====================
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
        // Save remembered email
        try {
          if (remember) {
            localStorage.setItem("zaem_remembered_email", email.trim());
          } else {
            localStorage.removeItem("zaem_remembered_email");
          }
        } catch {
          // ignore
        }

        loginStore(data.data.user, data.data.token);

        // Redirect logic
        const redirect = new URLSearchParams(window.location.search).get(
          "redirect"
        );
        if (redirect) {
          router.push(redirect);
        } else if (data.data.user.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/account");
        }
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

  // ==================== RENDER ====================
  return (
    <main className="min-h-screen flex bg-[#FAFAFA] dark:bg-black">

      {/* ==================== LEFT — BRANDING ==================== */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative bg-[#0A0A0A] overflow-hidden">

        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80"
            alt="ZAEM"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#0A0A0A]/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16">

          {/* Logo Top */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
          >
            <div className="w-11 h-11 bg-white flex items-center justify-center rounded-xl">
              <span className="font-display text-[#0A0A0A] text-lg font-medium">
                Z
              </span>
            </div>
            <div>
              <p className="font-display text-2xl text-white tracking-[0.15em] leading-none">
                ZAEM
              </p>
              <p className="text-[9px] tracking-[0.4em] uppercase text-white/60 mt-0.5">
                Est. 2026
              </p>
            </div>
          </Link>

          {/* Middle Content */}
          <div className="my-auto">
            <div className="max-w-md">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                <span className="text-[10px] tracking-[0.2em] uppercase text-white font-medium">
                  Welcome Back
                </span>
              </div>

              {/* Heading */}
              <h1 className="font-display text-5xl xl:text-6xl text-white leading-[1.05] mb-6">
                Style.{" "}
                <em className="italic">Redefined.</em>
              </h1>

              {/* Description */}
              <p className="text-white/70 text-[15px] leading-relaxed mb-8 max-w-sm">
                Sign in to continue your journey with ZAEM — premium
                clothing, signature fragrances, and artisan-crafted bags.
              </p>

              {/* Features */}
              <div className="space-y-3">
                {[
                  { icon: Package, text: "Track your orders in real-time" },
                  { icon: Heart, text: "Save your favorite pieces" },
                  { icon: Truck, text: "Fast nationwide delivery" },
                  { icon: RotateCcw, text: "Easy 7-day returns" },
                ].map((feature) => (
                  <div
                    key={feature.text}
                    className="flex items-center gap-3 text-[13px] text-white/80"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0">
                      <feature.icon
                        className="w-3.5 h-3.5 text-white"
                        strokeWidth={2}
                      />
                    </div>
                    {feature.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 text-[11px] text-white/50">
            <span>© 2026 ZAEM</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <Link href="/privacy" className="hover:text-white/80 transition-colors">
              Privacy
            </Link>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <Link href="/terms" className="hover:text-white/80 transition-colors">
              Terms
            </Link>
          </div>

        </div>

        {/* Decorative glow */}
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* ==================== RIGHT — FORM ==================== */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center px-5 md:px-12 py-12 md:py-16 bg-white dark:bg-[#0A0A0A]">

        <div className="w-full max-w-md">

          {/* ============ MOBILE LOGO ============ */}
          <div className="lg:hidden mb-10">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1D1D1F] dark:bg-white flex items-center justify-center rounded-xl">
                <span className="font-display text-white dark:text-[#1D1D1F] text-lg">
                  Z
                </span>
              </div>
              <div>
                <p className="font-display text-2xl text-[#1D1D1F] dark:text-white tracking-[0.15em] leading-none">
                  ZAEM
                </p>
                <p className="text-[9px] tracking-[0.4em] uppercase text-[#86868B] mt-0.5">
                  Est. 2026
                </p>
              </div>
            </Link>
          </div>

          {/* ============ HEADER ============ */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md bg-[#E3F2FD] flex items-center justify-center">
                <Sparkles
                  className="w-3 h-3 text-[#0A84FF]"
                  strokeWidth={2.5}
                />
              </div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#86868B] font-medium">
                Welcome Back
              </p>
            </div>

            <h1 className="font-display text-4xl md:text-5xl text-[#1D1D1F] dark:text-white mb-3">
              Sign In
            </h1>

            <p className="text-[14px] text-[#6E6E73] dark:text-[#98989D]">
              Enter your credentials to access your account
            </p>
          </div>

          {/* ============ ERROR ============ */}
          {error && (
            <div className="mb-6 p-4 bg-[#FFEBEE] border-l-2 border-[#C62828] text-[#C62828] text-[13px] rounded-r-lg flex items-start gap-3 admin-scale-in">
              <AlertCircle
                className="w-4 h-4 shrink-0 mt-0.5"
                strokeWidth={2}
              />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* ============ FORM ============ */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
  className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B] pointer-events-none"
  style={{ transform: 'translateY(-50%)' }}
  strokeWidth={2}
/>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="your@email.com"
                  disabled={loading}
                  className="w-full h-13 bg-[#FAFAFA] dark:bg-[#1C1C1E] border border-[#E5E5E7] dark:border-[#38383A] rounded-xl pl-11 pr-4 text-[14px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:border-[#1D1D1F] dark:focus:border-white focus:bg-white dark:focus:bg-[#1C1C1E] focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.06)] transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D]">
                  Password
                </label>
                <Link
                  href="/account/forgot-password"
                  className="text-[11px] tracking-wider uppercase font-medium text-[#0A84FF] hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock
  className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B] pointer-events-none"
  style={{ transform: 'translateY(-50%)' }}
  strokeWidth={2}
/>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  disabled={loading}
                  className="w-full h-13 bg-[#FAFAFA] dark:bg-[#1C1C1E] border border-[#E5E5E7] dark:border-[#38383A] rounded-xl pl-11 pr-12 text-[14px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:border-[#1D1D1F] dark:focus:border-white focus:bg-white dark:focus:bg-[#1C1C1E] focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.06)] transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
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

            {/* Remember Me */}
            <label className="flex items-center gap-3 cursor-pointer select-none py-1">
              <button
                type="button"
                onClick={() => setRemember(!remember)}
                className={`w-5 h-5 rounded-md border transition-all flex items-center justify-center shrink-0 ${
                  remember
                    ? "bg-[#1D1D1F] dark:bg-white border-[#1D1D1F] dark:border-white"
                    : "border-[#D2D2D7] dark:border-[#48484A] hover:border-[#86868B]"
                }`}
              >
                {remember && (
                  <Check
                    className="w-3 h-3 text-white dark:text-[#1D1D1F]"
                    strokeWidth={3}
                  />
                )}
              </button>
              <span className="text-[13px] text-[#6E6E73] dark:text-[#98989D]">
                Remember this device
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="group w-full h-13 flex items-center justify-center gap-2 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-xl text-[12px] tracking-[0.2em] uppercase font-medium hover:opacity-90 active:scale-[0.99] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2
                    className="w-4 h-4 animate-spin"
                    strokeWidth={2}
                  />
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

          {/* ============ DIVIDER ============ */}
          <div className="my-7 flex items-center gap-4">
            <div className="flex-1 h-px bg-[#E5E5E7] dark:bg-[#38383A]" />
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#86868B] font-medium">
              New to ZAEM?
            </span>
            <div className="flex-1 h-px bg-[#E5E5E7] dark:bg-[#38383A]" />
          </div>

          {/* ============ REGISTER LINK ============ */}
          <Link
            href="/account/register"
            className="group w-full h-13 flex items-center justify-center gap-2 border border-[#E5E5E7] dark:border-[#38383A] rounded-xl text-[12px] tracking-[0.2em] uppercase font-medium text-[#1D1D1F] dark:text-white hover:bg-[#F5F5F7] dark:hover:bg-[#1C1C1E] transition-all duration-200"
          >
            Create an Account
            <ArrowRight
              className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
              strokeWidth={2}
            />
          </Link>

          {/* ============ FOOTER ============ */}
          <div className="mt-10 pt-6 border-t border-[#E5E5E7] dark:border-[#38383A] space-y-3">
            <div className="flex items-center justify-center gap-2 text-[11px] text-[#86868B]">
              <Shield className="w-3 h-3" strokeWidth={2} />
              <span>Your data is securely encrypted</span>
            </div>

            <div className="flex items-center justify-center gap-4 text-[11px] text-[#86868B]">
              <Link
                href="/"
                className="hover:text-[#1D1D1F] dark:hover:text-white transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" strokeWidth={2} />
                Back to Store
              </Link>
              <span className="w-1 h-1 rounded-full bg-[#D2D2D7] dark:bg-[#48484A]" />
              <Link
                href="/contact"
                className="hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
              >
                Need Help?
              </Link>
            </div>
          </div>

        </div>
      </div>

    </main>
  );
}