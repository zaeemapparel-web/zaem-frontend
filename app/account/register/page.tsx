"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Sparkles,
  Shield,
  Package,
  Heart,
  Truck,
  RotateCcw,
  Gift,
  Star,
  Crown,
  CheckCircle,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ==================== VALIDATION ====================
const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePhone = (phone: string) => {
  // Pakistani phone: 03XXXXXXXXX or +923XXXXXXXXX
  const cleaned = phone.replace(/\D/g, "");
  return /^(92|0)?3\d{9}$/.test(cleaned);
};

const getPasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { level: "weak", label: "Weak", color: "#C62828", width: "33%" };
  if (score <= 3) return { level: "fair", label: "Fair", color: "#E65100", width: "66%" };
  if (score <= 4) return { level: "good", label: "Good", color: "#0A84FF", width: "85%" };
  return { level: "strong", label: "Strong", color: "#2E7D32", width: "100%" };
};

// ==================== MAIN COMPONENT ====================
export default function RegisterPage() {
  const router = useRouter();
  const loginStore = useAuthStore((s) => s.login);

  // ==================== STATE ====================
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ==================== VALIDATION STATE ====================
  const validations = useMemo(() => {
    return {
      name: form.name.trim().length >= 2,
      email: validateEmail(form.email),
      phone: !form.phone || validatePhone(form.phone),
      passwordLength: form.password.length >= 6,
      passwordMatch:
        form.password === form.confirmPassword && form.password.length > 0,
    };
  }, [form]);

  const passwordStrength = useMemo(
    () => getPasswordStrength(form.password),
    [form.password]
  );

  const canSubmit =
    validations.name &&
    validations.email &&
    validations.passwordLength &&
    validations.passwordMatch &&
    validations.phone &&
    agreedToTerms &&
    !loading;

  // ==================== UPDATE ====================
  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError("");
  };

  // ==================== SUBMIT ====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!canSubmit) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim() || null,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Auto-login
        loginStore(data.data.user, data.data.token);

        // Newsletter opt-in (optional)
        if (newsletterOptIn && form.email) {
          try {
            await fetch(`${API_URL}/api/newsletter/subscribe`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: form.email.trim() }),
            });
          } catch {
            // Silent fail — don't block registration
          }
        }

        // Redirect
        router.push("/account");
      } else {
        setError(data.message || "Registration failed");
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
            src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1600&q=80"
            alt="ZAEM"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#0A0A0A]/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16">

          {/* Logo Top */}
          <Link href="/" className="flex items-center gap-3 group">
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
                  New Here?
                </span>
              </div>

              {/* Heading */}
              <h1 className="font-display text-5xl xl:text-6xl text-white leading-[1.05] mb-6">
                Join the{" "}
                <em className="italic">inner circle.</em>
              </h1>

              {/* Description */}
              <p className="text-white/70 text-[15px] leading-relaxed mb-8 max-w-sm">
                Create your account and become part of the ZAEM family —
                early access to new collections, exclusive offers, and
                more.
              </p>

              {/* Benefits */}
              <div className="space-y-3">
                {[
                  {
                    icon: Gift,
                    text: "10% off your first order",
                    highlight: true,
                  },
                  { icon: Package, text: "Track all your orders easily" },
                  { icon: Heart, text: "Save pieces to your wishlist" },
                  { icon: Crown, text: "Loyalty points on every order" },
                  { icon: Truck, text: "Free shipping above Rs. 5,000" },
                ].map((benefit) => (
                  <div
                    key={benefit.text}
                    className={`flex items-center gap-3 text-[13px] ${
                      benefit.highlight
                        ? "text-white font-medium"
                        : "text-white/80"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        benefit.highlight
                          ? "bg-white text-[#0A0A0A]"
                          : "bg-white/10 backdrop-blur-sm text-white"
                      }`}
                    >
                      <benefit.icon
                        className="w-3.5 h-3.5"
                        strokeWidth={2}
                      />
                    </div>
                    {benefit.text}
                    {benefit.highlight && (
                      <span className="text-[9px] tracking-wider uppercase font-medium bg-white text-[#0A0A0A] px-1.5 py-0.5 rounded">
                        Free
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 text-[11px] text-white/50">
            <span>© 2026 ZAEM</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <Link
              href="/privacy"
              className="hover:text-white/80 transition-colors"
            >
              Privacy
            </Link>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <Link
              href="/terms"
              className="hover:text-white/80 transition-colors"
            >
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
                Create Account
              </p>
            </div>

            <h1 className="font-display text-4xl md:text-5xl text-[#1D1D1F] dark:text-white mb-3">
              Get Started
            </h1>

            <p className="text-[14px] text-[#6E6E73] dark:text-[#98989D]">
              Create your ZAEM account and unlock exclusive benefits
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
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className="block text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] mb-2">
                Full Name
              </label>
              <div className="relative">
                <UserIcon
                  className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B] pointer-events-none"
                  strokeWidth={2}
                />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                  autoComplete="name"
                  placeholder="Your full name"
                  disabled={loading}
                  className="w-full h-13 bg-[#FAFAFA] dark:bg-[#1C1C1E] border border-[#E5E5E7] dark:border-[#38383A] rounded-xl pl-11 pr-4 text-[14px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:border-[#1D1D1F] dark:focus:border-white focus:bg-white dark:focus:bg-[#1C1C1E] focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.06)] transition-all duration-200"
                />
                {validations.name && (
                  <CheckCircle
                    className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-[#2E7D32]"
                    strokeWidth={2}
                  />
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B] pointer-events-none"
                  strokeWidth={2}
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="your@email.com"
                  disabled={loading}
                  className="w-full h-13 bg-[#FAFAFA] dark:bg-[#1C1C1E] border border-[#E5E5E7] dark:border-[#38383A] rounded-xl pl-11 pr-4 text-[14px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:border-[#1D1D1F] dark:focus:border-white focus:bg-white dark:focus:bg-[#1C1C1E] focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.06)] transition-all duration-200"
                />
                {validations.email && (
                  <CheckCircle
                    className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-[#2E7D32]"
                    strokeWidth={2}
                  />
                )}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] mb-2">
                Phone Number{" "}
                <span className="text-[#86868B] normal-case tracking-normal">
                  (optional)
                </span>
              </label>
              <div className="relative">
                <Phone
                  className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B] pointer-events-none"
                  strokeWidth={2}
                />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  autoComplete="tel"
                  placeholder="0300 1234567"
                  disabled={loading}
                  className="w-full h-13 bg-[#FAFAFA] dark:bg-[#1C1C1E] border border-[#E5E5E7] dark:border-[#38383A] rounded-xl pl-11 pr-4 text-[14px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:border-[#1D1D1F] dark:focus:border-white focus:bg-white dark:focus:bg-[#1C1C1E] focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.06)] transition-all duration-200"
                />
                {form.phone && validations.phone && (
                  <CheckCircle
                    className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-[#2E7D32]"
                    strokeWidth={2}
                  />
                )}
                {form.phone && !validations.phone && (
                  <AlertCircle
                    className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-[#E65100]"
                    strokeWidth={2}
                  />
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B] pointer-events-none"
                  strokeWidth={2}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Min. 6 characters"
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

              {/* Strength Bar */}
              {form.password && (
                <div className="mt-2.5 admin-fade-in">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] tracking-wider uppercase font-medium text-[#86868B]">
                      Strength
                    </span>
                    <span
                      className="text-[10px] tracking-wider uppercase font-medium"
                      style={{ color: passwordStrength.color }}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-1 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: passwordStrength.width,
                        backgroundColor: passwordStrength.color,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B] pointer-events-none"
                  strokeWidth={2}
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  disabled={loading}
                  className={`w-full h-13 bg-[#FAFAFA] dark:bg-[#1C1C1E] border rounded-xl pl-11 pr-12 text-[14px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:bg-white dark:focus:bg-[#1C1C1E] focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.06)] transition-all duration-200 ${
                    form.confirmPassword
                      ? validations.passwordMatch
                        ? "border-[#2E7D32]"
                        : "border-[#C62828]"
                      : "border-[#E5E5E7] dark:border-[#38383A] focus:border-[#1D1D1F] dark:focus:border-white"
                  }`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
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
                {form.confirmPassword && validations.passwordMatch && (
                  <CheckCircle
                    className="w-4 h-4 absolute right-12 top-1/2 -translate-y-1/2 text-[#2E7D32]"
                    strokeWidth={2}
                  />
                )}
              </div>
            </div>

            {/* Terms & Newsletter */}
            <div className="space-y-3 pt-2">
              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <button
                  type="button"
                  onClick={() => setAgreedToTerms(!agreedToTerms)}
                  className={`w-5 h-5 rounded-md border transition-all flex items-center justify-center shrink-0 mt-0.5 ${
                    agreedToTerms
                      ? "bg-[#1D1D1F] dark:bg-white border-[#1D1D1F] dark:border-white"
                      : "border-[#D2D2D7] dark:border-[#48484A] hover:border-[#86868B]"
                  }`}
                >
                  {agreedToTerms && (
                    <Check
                      className="w-3 h-3 text-white dark:text-[#1D1D1F]"
                      strokeWidth={3}
                    />
                  )}
                </button>
                <span className="text-[12px] text-[#6E6E73] dark:text-[#98989D] leading-relaxed">
                  I agree to ZAEM's{" "}
                  <Link
                    href="/terms"
                    className="text-[#1D1D1F] dark:text-white underline underline-offset-2 hover:text-[#0A84FF]"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-[#1D1D1F] dark:text-white underline underline-offset-2 hover:text-[#0A84FF]"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>

              {/* Newsletter */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <button
                  type="button"
                  onClick={() => setNewsletterOptIn(!newsletterOptIn)}
                  className={`w-5 h-5 rounded-md border transition-all flex items-center justify-center shrink-0 mt-0.5 ${
                    newsletterOptIn
                      ? "bg-[#1D1D1F] dark:bg-white border-[#1D1D1F] dark:border-white"
                      : "border-[#D2D2D7] dark:border-[#48484A] hover:border-[#86868B]"
                  }`}
                >
                  {newsletterOptIn && (
                    <Check
                      className="w-3 h-3 text-white dark:text-[#1D1D1F]"
                      strokeWidth={3}
                    />
                  )}
                </button>
                <span className="text-[12px] text-[#6E6E73] dark:text-[#98989D] leading-relaxed">
                  Send me updates on new collections and private sales
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="group w-full h-13 flex items-center justify-center gap-2 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-xl text-[12px] tracking-[0.2em] uppercase font-medium hover:opacity-90 active:scale-[0.99] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:opacity-40 mt-2"
            >
              {loading ? (
                <>
                  <Loader2
                    className="w-4 h-4 animate-spin"
                    strokeWidth={2}
                  />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
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
              Already a Member?
            </span>
            <div className="flex-1 h-px bg-[#E5E5E7] dark:bg-[#38383A]" />
          </div>

          {/* ============ LOGIN LINK ============ */}
          <Link
            href="/account/login"
            className="group w-full h-13 flex items-center justify-center gap-2 border border-[#E5E5E7] dark:border-[#38383A] rounded-xl text-[12px] tracking-[0.2em] uppercase font-medium text-[#1D1D1F] dark:text-white hover:bg-[#F5F5F7] dark:hover:bg-[#1C1C1E] transition-all duration-200"
          >
            Sign In to Your Account
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