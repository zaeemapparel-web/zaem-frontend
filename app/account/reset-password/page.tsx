"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Shield,
  Home,
  ChevronRight,
  KeyRound,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ==================== HELPERS ====================
const getPasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2)
    return { level: "weak", label: "Weak", color: "#C62828", width: "33%" };
  if (score <= 3)
    return { level: "fair", label: "Fair", color: "#E65100", width: "66%" };
  if (score <= 4)
    return { level: "good", label: "Good", color: "#0A84FF", width: "85%" };
  return { level: "strong", label: "Strong", color: "#2E7D32", width: "100%" };
};

// ==================== MAIN CONTENT ====================
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [passwords, setPasswords] = useState({
    new: "",
    confirm: "",
  });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  // ==================== VALIDATE TOKEN ====================
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setValidating(false);
        setTokenValid(false);
        return;
      }

      try {
        const res = await fetch(
          `${API_URL}/api/auth/validate-reset-token?token=${token}`
        );
        const data = await res.json();
        setTokenValid(data.success);
      } catch (err) {
        console.error(err);
        setTokenValid(false);
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  // ==================== SUBMIT ====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (passwords.new !== passwords.confirm) {
      setError("Passwords do not match");
      return;
    }

    if (passwords.new.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: passwords.new,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push("/account/login"), 3000);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(passwords.new);

  // ==================== LOADING ====================
  if (validating) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <Loader2
            className="w-6 h-6 text-[#86868B] animate-spin mx-auto mb-3"
            strokeWidth={2}
          />
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#86868B]">
            Validating Token
          </p>
        </div>
      </div>
    );
  }

  // ==================== INVALID TOKEN ====================
  if (!token || !tokenValid) {
    return (
      <div className="admin-fade-in">
        <div className="w-16 h-16 rounded-full bg-[#FFEBEE] flex items-center justify-center mb-6">
          <AlertCircle
            className="w-8 h-8 text-[#C62828]"
            strokeWidth={2}
          />
        </div>

        <h1 className="font-display text-3xl md:text-4xl text-[#1D1D1F] dark:text-white mb-3">
          Invalid or Expired Link
        </h1>

        <p className="text-[14px] text-[#6E6E73] dark:text-[#98989D] mb-8 leading-relaxed">
          This password reset link is invalid or has expired. Please request a
          new one.
        </p>

        <div className="space-y-3">
          <Link
            href="/account/forgot-password"
            className="w-full h-12 flex items-center justify-center gap-2 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-xl text-[12px] tracking-wider uppercase font-medium hover:opacity-90 transition-opacity"
          >
            Request New Link
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </Link>

          <Link
            href="/account/login"
            className="w-full h-12 flex items-center justify-center gap-2 border border-[#E5E5E7] dark:border-[#38383A] rounded-xl text-[12px] tracking-wider uppercase font-medium text-[#1D1D1F] dark:text-white hover:bg-[#F5F5F7] dark:hover:bg-[#1C1C1E] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // ==================== SUCCESS ====================
  if (success) {
    return (
      <div className="admin-fade-in">
        <div className="w-16 h-16 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-6">
          <CheckCircle
            className="w-8 h-8 text-[#2E7D32]"
            strokeWidth={2}
          />
        </div>

        <h1 className="font-display text-3xl md:text-4xl text-[#1D1D1F] dark:text-white mb-3">
          Password Reset!
        </h1>

        <p className="text-[14px] text-[#6E6E73] dark:text-[#98989D] mb-8 leading-relaxed">
          Your password has been successfully changed. Redirecting to login...
        </p>

        <Link
          href="/account/login"
          className="w-full h-12 flex items-center justify-center gap-2 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-xl text-[12px] tracking-wider uppercase font-medium hover:opacity-90 transition-opacity"
        >
          Go to Login Now
          <ArrowRight className="w-4 h-4" strokeWidth={2} />
        </Link>
      </div>
    );
  }

  // ==================== FORM ====================
  return (
    <div className="admin-fade-in">
      <div className="inline-flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-md bg-[#E8F5E9] flex items-center justify-center">
          <KeyRound
            className="w-3 h-3 text-[#2E7D32]"
            strokeWidth={2.5}
          />
        </div>
        <p className="text-[10px] tracking-[0.3em] uppercase text-[#86868B] font-medium">
          New Password
        </p>
      </div>

      <h1 className="font-display text-4xl md:text-5xl text-[#1D1D1F] dark:text-white mb-3">
        Set New Password
      </h1>

      <p className="text-[14px] text-[#6E6E73] dark:text-[#98989D] mb-8">
        Create a strong password to secure your account
      </p>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-[#FFEBEE] border-l-2 border-[#C62828] text-[#C62828] text-[13px] rounded-r-lg flex items-start gap-3">
          <AlertCircle
            className="w-4 h-4 shrink-0 mt-0.5"
            strokeWidth={2}
          />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* New Password */}
        <div>
          <label className="block text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] mb-2">
            New Password
          </label>
          <div className="relative">
            <Lock
              className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B] pointer-events-none"
              strokeWidth={2}
            />
            <input
              type={showNew ? "text" : "password"}
              value={passwords.new}
              onChange={(e) =>
                setPasswords({ ...passwords, new: e.target.value })
              }
              required
              placeholder="Min. 6 characters"
              disabled={loading}
              className="w-full h-13 bg-[#FAFAFA] dark:bg-[#1C1C1E] border border-[#E5E5E7] dark:border-[#38383A] rounded-xl pl-11 pr-12 text-[14px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:border-[#1D1D1F] dark:focus:border-white focus:bg-white dark:focus:bg-[#1C1C1E] focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.06)] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors"
            >
              {showNew ? (
                <EyeOff className="w-4 h-4 text-[#86868B]" strokeWidth={2} />
              ) : (
                <Eye className="w-4 h-4 text-[#86868B]" strokeWidth={2} />
              )}
            </button>
          </div>

          {/* Strength */}
          {passwords.new && (
            <div className="mt-2.5">
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
              type={showConfirm ? "text" : "password"}
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords({ ...passwords, confirm: e.target.value })
              }
              required
              placeholder="Repeat password"
              disabled={loading}
              className={`w-full h-13 bg-[#FAFAFA] dark:bg-[#1C1C1E] border rounded-xl pl-11 pr-12 text-[14px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:bg-white dark:focus:bg-[#1C1C1E] focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.06)] transition-all ${
                passwords.confirm
                  ? passwords.new === passwords.confirm
                    ? "border-[#2E7D32]"
                    : "border-[#C62828]"
                  : "border-[#E5E5E7] dark:border-[#38383A] focus:border-[#1D1D1F] dark:focus:border-white"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors"
            >
              {showConfirm ? (
                <EyeOff className="w-4 h-4 text-[#86868B]" strokeWidth={2} />
              ) : (
                <Eye className="w-4 h-4 text-[#86868B]" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !passwords.new || !passwords.confirm}
          className="group w-full h-13 flex items-center justify-center gap-2 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-xl text-[12px] tracking-[0.2em] uppercase font-medium hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
              Resetting...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" strokeWidth={2} />
              Reset Password
            </>
          )}
        </button>

      </form>

      {/* Footer */}
      <div className="mt-10 pt-6 border-t border-[#E5E5E7] dark:border-[#38383A]">
        <div className="flex items-center justify-center gap-2 text-[11px] text-[#86868B]">
          <Shield className="w-3 h-3" strokeWidth={2} />
          <span>Your data is securely encrypted</span>
        </div>
      </div>

    </div>
  );
}

// ==================== PAGE EXPORT ====================
export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex bg-[#FAFAFA] dark:bg-black">

      {/* LEFT — Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative bg-[#0A0A0A] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1600&q=80"
            alt="ZAEM"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16">
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

          <div className="my-auto max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Shield className="w-3.5 h-3.5 text-white" strokeWidth={2} />
              <span className="text-[10px] tracking-[0.2em] uppercase text-white font-medium">
                Secure Reset
              </span>
            </div>

            <h1 className="font-display text-5xl xl:text-6xl text-white leading-[1.05] mb-6">
              Secure.{" "}
              <em className="italic">Simple.</em>
            </h1>

            <p className="text-white/70 text-[15px] leading-relaxed max-w-sm">
              Create a new password for your ZAEM account. Choose something
              strong and memorable.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-white/50">
            <span>© 2026 ZAEM</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <Link href="/privacy" className="hover:text-white/80">
              Privacy
            </Link>
          </div>
        </div>

        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* RIGHT — Form */}
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
            <span className="text-[#1D1D1F] dark:text-white">Reset</span>
          </nav>

          <Suspense
            fallback={
              <div className="py-20 text-center">
                <Loader2
                  className="w-6 h-6 text-[#86868B] animate-spin mx-auto"
                  strokeWidth={2}
                />
              </div>
            }
          >
            <ResetPasswordContent />
          </Suspense>

        </div>
      </div>

    </main>
  );
}