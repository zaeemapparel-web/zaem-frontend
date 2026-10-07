"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Shield,
  Sparkles,
  Home,
  ChevronRight,
  Lock,
  Send,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ==================== MAIN COMPONENT ====================
export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ==================== SUBMIT ====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || "Failed to send reset link");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex bg-[#FAFAFA] dark:bg-black">

      {/* ==================== LEFT — BRANDING ==================== */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative bg-[#0A0A0A] overflow-hidden">

        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80"
            alt="ZAEM"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
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

          {/* Center */}
          <div className="my-auto max-w-md">

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Lock className="w-3.5 h-3.5 text-white" strokeWidth={2} />
              <span className="text-[10px] tracking-[0.2em] uppercase text-white font-medium">
                Password Reset
              </span>
            </div>

            <h1 className="font-display text-5xl xl:text-6xl text-white leading-[1.05] mb-6">
              Forgot your{" "}
              <em className="italic">password?</em>
            </h1>

            <p className="text-white/70 text-[15px] leading-relaxed mb-8 max-w-sm">
              No worries. Enter your email address and we&apos;ll send you a
              secure link to reset your password.
            </p>

            <div className="space-y-3">
              {[
                "Check your spam folder if you don't see it",
                "Link expires in 1 hour",
                "Contact support if you need help",
              ].map((tip) => (
                <div
                  key={tip}
                  className="flex items-center gap-3 text-[13px] text-white/80"
                >
                  <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-3 h-3 text-white" strokeWidth={2.5} />
                  </div>
                  {tip}
                </div>
              ))}
            </div>

          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 text-[11px] text-white/50">
            <span>© 2026 ZAEM</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <Link href="/privacy" className="hover:text-white/80">
              Privacy
            </Link>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <Link href="/terms" className="hover:text-white/80">
              Terms
            </Link>
          </div>

        </div>

        {/* Glow */}
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* ==================== RIGHT — FORM ==================== */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center px-5 md:px-12 py-12 md:py-16 bg-white dark:bg-[#0A0A0A]">

        <div className="w-full max-w-md">

          {/* Mobile Logo */}
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

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[10px] tracking-wider uppercase text-[#86868B] font-medium mb-6">
            <Link
              href="/"
              className="hover:text-[#1D1D1F] dark:hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Home className="w-3 h-3" strokeWidth={2} />
              Home
            </Link>
            <ChevronRight className="w-3 h-3" strokeWidth={2} />
            <Link
              href="/account/login"
              className="hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
            >
              Login
            </Link>
            <ChevronRight className="w-3 h-3" strokeWidth={2} />
            <span className="text-[#1D1D1F] dark:text-white">Forgot</span>
          </nav>

          {/* ============ SUCCESS STATE ============ */}
          {success ? (
            <div className="admin-fade-in">

              <div className="w-16 h-16 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-6">
                <CheckCircle
                  className="w-8 h-8 text-[#2E7D32]"
                  strokeWidth={2}
                />
              </div>

              <h1 className="font-display text-3xl md:text-4xl text-[#1D1D1F] dark:text-white mb-3">
                Check your email
              </h1>

              <p className="text-[14px] text-[#6E6E73] dark:text-[#98989D] mb-8 leading-relaxed">
                We&apos;ve sent a password reset link to{" "}
                <strong className="text-[#1D1D1F] dark:text-white">
                  {email}
                </strong>
                . The link will expire in 1 hour.
              </p>

              {/* Info Box */}
              <div className="p-4 rounded-xl bg-[#E3F2FD] border border-[#64B5F6]/30 mb-6">
                <p className="text-[12px] text-[#0A84FF] flex items-start gap-2">
                  <AlertCircle
                    className="w-4 h-4 shrink-0 mt-0.5"
                    strokeWidth={2}
                  />
                  Didn&apos;t receive it? Check spam folder or try again in a few
                  minutes.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail("");
                  }}
                  className="w-full h-12 flex items-center justify-center gap-2 border border-[#E5E5E7] dark:border-[#38383A] rounded-xl text-[12px] tracking-wider uppercase font-medium text-[#1D1D1F] dark:text-white hover:bg-[#F5F5F7] dark:hover:bg-[#1C1C1E] transition-colors"
                >
                  Try Different Email
                </button>

                <Link
                  href="/account/login"
                  className="w-full h-12 flex items-center justify-center gap-2 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-xl text-[12px] tracking-wider uppercase font-medium hover:opacity-90 transition-opacity"
                >
                  <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                  Back to Login
                </Link>
              </div>

            </div>
          ) : (
            /* ============ FORM STATE ============ */
            <>
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-md bg-[#FFF3E0] flex items-center justify-center">
                    <Lock
                      className="w-3 h-3 text-[#E65100]"
                      strokeWidth={2.5}
                    />
                  </div>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-[#86868B] font-medium">
                    Password Reset
                  </p>
                </div>

                <h1 className="font-display text-4xl md:text-5xl text-[#1D1D1F] dark:text-white mb-3">
                  Forgot Password?
                </h1>

                <p className="text-[14px] text-[#6E6E73] dark:text-[#98989D]">
                  Enter your registered email address and we&apos;ll send you a
                  reset link
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-6 p-4 bg-[#FFEBEE] border-l-2 border-[#C62828] text-[#C62828] text-[13px] rounded-r-lg flex items-start gap-3 admin-fade-in">
                  <AlertCircle
                    className="w-4 h-4 shrink-0 mt-0.5"
                    strokeWidth={2}
                  />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">

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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="your@email.com"
                      disabled={loading}
                      className="w-full h-13 bg-[#FAFAFA] dark:bg-[#1C1C1E] border border-[#E5E5E7] dark:border-[#38383A] rounded-xl pl-11 pr-4 text-[14px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:border-[#1D1D1F] dark:focus:border-white focus:bg-white dark:focus:bg-[#1C1C1E] focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.06)] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="group w-full h-13 flex items-center justify-center gap-2 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-xl text-[12px] tracking-[0.2em] uppercase font-medium hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" strokeWidth={2} />
                      Send Reset Link
                    </>
                  )}
                </button>

              </form>

              {/* Divider */}
              <div className="my-7 flex items-center gap-4">
                <div className="flex-1 h-px bg-[#E5E5E7] dark:bg-[#38383A]" />
                <span className="text-[10px] tracking-[0.3em] uppercase text-[#86868B] font-medium">
                  Remember it?
                </span>
                <div className="flex-1 h-px bg-[#E5E5E7] dark:bg-[#38383A]" />
              </div>

              {/* Back to Login */}
              <Link
                href="/account/login"
                className="group w-full h-13 flex items-center justify-center gap-2 border border-[#E5E5E7] dark:border-[#38383A] rounded-xl text-[12px] tracking-[0.2em] uppercase font-medium text-[#1D1D1F] dark:text-white hover:bg-[#F5F5F7] dark:hover:bg-[#1C1C1E] transition-all"
              >
                <ArrowLeft
                  className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
                  strokeWidth={2}
                />
                Back to Login
              </Link>

              {/* Footer */}
              <div className="mt-10 pt-6 border-t border-[#E5E5E7] dark:border-[#38383A] space-y-3">
                <div className="flex items-center justify-center gap-2 text-[11px] text-[#86868B]">
                  <Shield className="w-3 h-3" strokeWidth={2} />
                  <span>Your data is securely encrypted</span>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

    </main>
  );
}