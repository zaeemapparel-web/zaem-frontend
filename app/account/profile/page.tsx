"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Check,
  CheckCircle,
  Save,
  ArrowLeft,
  ChevronRight,
  Shield,
  Camera,
  Home,
  Sparkles,
  Crown,
  Award,
  Star,
  Gift,
  TrendingUp,
  X,
  Trash2,
  Package,  // ← YE ADD KIYA
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ==================== HELPERS ====================
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

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

// ==================== MAIN COMPONENT ====================
export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loadFromStorage, token, login } = useAuthStore();

  // ==================== STATE ====================
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Profile form
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
  });

  // Password form
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Stats
  const [stats, setStats] = useState({
    orders: 0,
    totalSpent: 0,
    memberSince: "",
  });

  // ==================== INIT ====================
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // ==================== LOAD USER DATA ====================
  useEffect(() => {
    if (!isAuthenticated || !token) {
      setLoading(false);
      return;
    }

    // Pre-fill profile
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: (user as any).phone || "",
        dateOfBirth: (user as any).dateOfBirth
          ? new Date((user as any).dateOfBirth).toISOString().split("T")[0]
          : "",
      });
    }

    // Fetch stats
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data?.orders) {
          const orders = data.data.orders;
          const totalSpent = orders
            .filter(
              (o: any) =>
                o.status !== "CANCELLED" && o.status !== "RETURNED"
            )
            .reduce((sum: number, o: any) => sum + o.total, 0);

          const firstOrder = orders[orders.length - 1];
          setStats({
            orders: orders.length,
            totalSpent,
            memberSince:
              firstOrder?.createdAt || (user as any)?.createdAt || "",
          });
        } else if (user) {
          setStats({
            orders: 0,
            totalSpent: 0,
            memberSince: (user as any).createdAt || "",
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated, token, user]);

  // ==================== REDIRECT ====================
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/account/login");
    }
  }, [isAuthenticated, loading, router]);

  // ==================== TOAST ====================
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // ==================== SAVE PROFILE ====================
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name.trim(),
          phone: profile.phone.trim() || null,
          dateOfBirth: profile.dateOfBirth || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Update local store
        if (data.data?.user && token) {
          login(data.data.user, token);
        }
        showToast("success", "Profile updated successfully");
      } else {
        showToast("error", data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ==================== CHANGE PASSWORD ====================
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      showToast("error", "New passwords do not match");
      return;
    }

    if (passwords.new.length < 6) {
      showToast("error", "Password must be at least 6 characters");
      return;
    }

    setChangingPassword(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("success", "Password changed successfully");
        setPasswords({ current: "", new: "", confirm: "" });
      } else {
        showToast("error", data.message || "Failed to change password");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Network error. Please try again.");
    } finally {
      setChangingPassword(false);
    }
  };

  // ==================== LOADING ====================
  if (loading || !isAuthenticated) {
    return (
      <main className="bg-[#FAFAFA] dark:bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className="w-6 h-6 text-[#86868B] animate-spin mx-auto mb-3"
            strokeWidth={2}
          />
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#86868B]">
            Loading Profile
          </p>
        </div>
      </main>
    );
  }

  // ==================== DERIVED ====================
  const passwordStrength = getPasswordStrength(passwords.new);
  const tierInfo =
    stats.totalSpent >= 100000
      ? {
          tier: "Platinum",
          color: "bg-[#E0F7FA] text-[#00838F]",
          icon: Crown,
        }
      : stats.totalSpent >= 50000
      ? {
          tier: "Gold",
          color: "bg-[#FFF3E0] text-[#E65100]",
          icon: Award,
        }
      : stats.totalSpent >= 10000
      ? {
          tier: "Silver",
          color: "bg-[#F5F5F7] text-[#6E6E73]",
          icon: Star,
        }
      : {
          tier: "Bronze",
          color: "bg-[#F5F5F7] text-[#6E6E73]",
          icon: Star,
        };
  const TierIcon = tierInfo.icon;

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
            <span className="text-[#1D1D1F] dark:text-white">Profile</span>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/account"
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[#F5F5F7] dark:hover:bg-[#1C1C1E] transition-colors shrink-0"
            >
              <ArrowLeft
                className="w-5 h-5 text-[#1D1D1F] dark:text-white"
                strokeWidth={2}
              />
            </Link>

            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#86868B] font-medium mb-1">
                Account Settings
              </p>
              <h1 className="font-display text-2xl md:text-4xl lg:text-5xl text-[#1D1D1F] dark:text-white">
                My Profile
              </h1>
            </div>
          </div>

        </div>
      </section>

      {/* ==================== MAIN LAYOUT ==================== */}
      <section className="py-8 md:py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-3 gap-5 md:gap-6">

          {/* ==================== LEFT COLUMN (2/3) ==================== */}
          <div className="lg:col-span-2 space-y-5">

            {/* ============ PROFILE INFO FORM ============ */}
            <form
              onSubmit={handleSaveProfile}
              className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A] overflow-hidden"
            >
              <div className="p-5 md:p-6 border-b border-[#E5E5E7] dark:border-[#38383A] flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#E3F2FD] flex items-center justify-center shrink-0">
                    <UserIcon
                      className="w-5 h-5 text-[#0A84FF]"
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <h2 className="font-display text-lg md:text-xl text-[#1D1D1F] dark:text-white">
                      Personal Information
                    </h2>
                    <p className="text-[11px] text-[#86868B] mt-0.5">
                      Update your basic account details
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-6 space-y-5">

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
                      value={profile.name}
                      onChange={(e) =>
                        setProfile({ ...profile, name: e.target.value })
                      }
                      required
                      placeholder="Your full name"
                      disabled={saving}
                      className="w-full h-12 bg-[#FAFAFA] dark:bg-[#0A0A0A] border border-[#E5E5E7] dark:border-[#38383A] rounded-xl pl-11 pr-4 text-[14px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:border-[#1D1D1F] dark:focus:border-white focus:bg-white dark:focus:bg-[#1C1C1E] focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.06)] transition-all"
                    />
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
                      value={profile.email}
                      disabled
                      className="w-full h-12 bg-[#F5F5F7] dark:bg-[#0A0A0A] border border-[#E5E5E7] dark:border-[#38383A] rounded-xl pl-11 pr-4 text-[14px] text-[#6E6E73] dark:text-[#98989D] outline-none cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[10px] text-[#86868B] mt-1.5 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" strokeWidth={2} />
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                {/* Phone + DOB */}
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone
                        className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B] pointer-events-none"
                        strokeWidth={2}
                      />
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) =>
                          setProfile({ ...profile, phone: e.target.value })
                        }
                        placeholder="0300 1234567"
                        disabled={saving}
                        className="w-full h-12 bg-[#FAFAFA] dark:bg-[#0A0A0A] border border-[#E5E5E7] dark:border-[#38383A] rounded-xl pl-11 pr-4 text-[14px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:border-[#1D1D1F] dark:focus:border-white focus:bg-white dark:focus:bg-[#1C1C1E] focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.06)] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] mb-2">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar
                        className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B] pointer-events-none"
                        strokeWidth={2}
                      />
                      <input
                        type="date"
                        value={profile.dateOfBirth}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            dateOfBirth: e.target.value,
                          })
                        }
                        disabled={saving}
                        className="w-full h-12 bg-[#FAFAFA] dark:bg-[#0A0A0A] border border-[#E5E5E7] dark:border-[#38383A] rounded-xl pl-11 pr-4 text-[14px] text-[#1D1D1F] dark:text-white outline-none focus:border-[#1D1D1F] dark:focus:border-white focus:bg-white dark:focus:bg-[#1C1C1E] focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.06)] transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-2">
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
                        <Save className="w-4 h-4" strokeWidth={2} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>

              </div>
            </form>

            {/* ============ CHANGE PASSWORD ============ */}
            <form
              onSubmit={handleChangePassword}
              className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A] overflow-hidden"
            >
              <div className="p-5 md:p-6 border-b border-[#E5E5E7] dark:border-[#38383A] flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#FFF3E0] flex items-center justify-center shrink-0">
                  <Lock
                    className="w-5 h-5 text-[#E65100]"
                    strokeWidth={2}
                  />
                </div>
                <div>
                  <h2 className="font-display text-lg md:text-xl text-[#1D1D1F] dark:text-white">
                    Change Password
                  </h2>
                  <p className="text-[11px] text-[#86868B] mt-0.5">
                    Keep your account secure with a strong password
                  </p>
                </div>
              </div>

              <div className="p-5 md:p-6 space-y-5">

                {/* Current Password */}
                <div>
                  <label className="block text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B] pointer-events-none"
                      strokeWidth={2}
                    />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwords.current}
                      onChange={(e) =>
                        setPasswords({
                          ...passwords,
                          current: e.target.value,
                        })
                      }
                      required
                      placeholder="Enter current password"
                      disabled={changingPassword}
                      className="w-full h-12 bg-[#FAFAFA] dark:bg-[#0A0A0A] border border-[#E5E5E7] dark:border-[#38383A] rounded-xl pl-11 pr-12 text-[14px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:border-[#1D1D1F] dark:focus:border-white focus:bg-white dark:focus:bg-[#1C1C1E] focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.06)] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors"
                    >
                      {showCurrentPassword ? (
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
                      type={showNewPassword ? "text" : "password"}
                      value={passwords.new}
                      onChange={(e) =>
                        setPasswords({ ...passwords, new: e.target.value })
                      }
                      required
                      placeholder="Min. 6 characters"
                      disabled={changingPassword}
                      className="w-full h-12 bg-[#FAFAFA] dark:bg-[#0A0A0A] border border-[#E5E5E7] dark:border-[#38383A] rounded-xl pl-11 pr-12 text-[14px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:border-[#1D1D1F] dark:focus:border-white focus:bg-white dark:focus:bg-[#1C1C1E] focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.06)] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors"
                    >
                      {showNewPassword ? (
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
                  {passwords.new && (
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
                      <div className="h-1 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-full overflow-hidden">
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
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B] pointer-events-none"
                      strokeWidth={2}
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwords.confirm}
                      onChange={(e) =>
                        setPasswords({
                          ...passwords,
                          confirm: e.target.value,
                        })
                      }
                      required
                      placeholder="Repeat new password"
                      disabled={changingPassword}
                      className={`w-full h-12 bg-[#FAFAFA] dark:bg-[#0A0A0A] border rounded-xl pl-11 pr-12 text-[14px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:bg-white dark:focus:bg-[#1C1C1E] focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.06)] transition-all ${
                        passwords.confirm
                          ? passwords.new === passwords.confirm
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
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-xl text-[11px] tracking-wider uppercase font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {changingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" strokeWidth={2} />
                        Update Password
                      </>
                    )}
                  </button>
                </div>

              </div>
            </form>

            {/* ============ DANGER ZONE ============ */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#FFCDD2] dark:border-[#5C1F1F] overflow-hidden">
              <div className="p-5 md:p-6 border-b border-[#FFCDD2] dark:border-[#5C1F1F] flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#FFEBEE] flex items-center justify-center shrink-0">
                  <AlertCircle
                    className="w-5 h-5 text-[#C62828]"
                    strokeWidth={2}
                  />
                </div>
                <div>
                  <h2 className="font-display text-lg md:text-xl text-[#C62828]">
                    Danger Zone
                  </h2>
                  <p className="text-[11px] text-[#86868B] mt-0.5">
                    Irreversible actions — proceed with caution
                  </p>
                </div>
              </div>

              <div className="p-5 md:p-6 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white mb-1">
                    Delete Account
                  </p>
                  <p className="text-[11px] text-[#86868B] leading-relaxed">
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#C62828] text-[11px] tracking-wider uppercase font-medium text-[#C62828] hover:bg-[#FFEBEE] transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                  Delete Account
                </button>
              </div>
            </div>

          </div>

          {/* ==================== RIGHT COLUMN (1/3) ==================== */}
          <div className="space-y-5">

            {/* ============ PROFILE CARD ============ */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A] p-5 lg:sticky lg:top-24">

              {/* Avatar */}
              <div className="flex flex-col items-center text-center pb-5 border-b border-[#E5E5E7] dark:border-[#38383A]">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#1D1D1F] to-[#48484A] dark:from-white dark:to-[#D2D2D7] flex items-center justify-center text-white dark:text-[#1D1D1F] font-display text-3xl font-medium shadow-lg">
                    {getInitials(user?.name || "User")}
                  </div>
                  <button
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#1D1D1F] dark:bg-white flex items-center justify-center border-2 border-white dark:border-[#1C1C1E] hover:opacity-90 transition-opacity"
                    aria-label="Change avatar"
                  >
                    <Camera
                      className="w-3.5 h-3.5 text-white dark:text-[#1D1D1F]"
                      strokeWidth={2}
                    />
                  </button>
                </div>

                <h3 className="font-display text-lg text-[#1D1D1F] dark:text-white mb-1 truncate max-w-full">
                  {user?.name}
                </h3>
                <p className="text-[12px] text-[#86868B] truncate max-w-full">
                  {user?.email}
                </p>

                {/* Tier Badge */}
                <div
                  className={`inline-flex items-center gap-1.5 mt-3 text-[10px] tracking-wider uppercase font-medium px-2.5 py-1 rounded-md ${tierInfo.color}`}
                >
                  <TierIcon className="w-3 h-3" strokeWidth={2.5} />
                  {tierInfo.tier} Member
                </div>
              </div>

              {/* Stats */}
              <div className="py-5 border-b border-[#E5E5E7] dark:border-[#38383A] space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] tracking-wider uppercase text-[#86868B] font-medium flex items-center gap-1.5">
                    <Package className="w-3 h-3" strokeWidth={2} />
                    Orders
                  </span>
                  <span className="font-display text-base text-[#1D1D1F] dark:text-white">
                    {stats.orders}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] tracking-wider uppercase text-[#86868B] font-medium flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3" strokeWidth={2} />
                    Total Spent
                  </span>
                  <span className="font-display text-base text-[#1D1D1F] dark:text-white truncate">
                    Rs. {stats.totalSpent.toLocaleString()}
                  </span>
                </div>

                {stats.memberSince && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] tracking-wider uppercase text-[#86868B] font-medium flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" strokeWidth={2} />
                      Member Since
                    </span>
                    <span className="text-[12px] text-[#1D1D1F] dark:text-white">
                      {new Date(stats.memberSince).toLocaleDateString(
                        "en-PK",
                        { month: "short", year: "numeric" }
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Links */}
              <div className="pt-5 space-y-1">
                <Link
                  href="/account/orders"
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-[13px] text-[#6E6E73] dark:text-[#98989D] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] hover:text-[#1D1D1F] dark:hover:text-white transition-colors group"
                >
                  <span className="flex items-center gap-2.5">
                    <Package className="w-4 h-4" strokeWidth={2} />
                    My Orders
                  </span>
                  <ChevronRight
                    className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
                    strokeWidth={2}
                  />
                </Link>

                <Link
                  href="/account/addresses"
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-[13px] text-[#6E6E73] dark:text-[#98989D] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] hover:text-[#1D1D1F] dark:hover:text-white transition-colors group"
                >
                  <span className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4" strokeWidth={2} />
                    Addresses
                  </span>
                  <ChevronRight
                    className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
                    strokeWidth={2}
                  />
                </Link>

                <Link
                  href="/wishlist"
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-[13px] text-[#6E6E73] dark:text-[#98989D] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] hover:text-[#1D1D1F] dark:hover:text-white transition-colors group"
                >
                  <span className="flex items-center gap-2.5">
                    <Star className="w-4 h-4" strokeWidth={2} />
                    Wishlist
                  </span>
                  <ChevronRight
                    className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
                    strokeWidth={2}
                  />
                </Link>

                <Link
                  href="/account"
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-[13px] text-[#6E6E73] dark:text-[#98989D] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] hover:text-[#1D1D1F] dark:hover:text-white transition-colors group"
                >
                  <span className="flex items-center gap-2.5">
                    <Home className="w-4 h-4" strokeWidth={2} />
                    Dashboard
                  </span>
                  <ChevronRight
                    className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
                    strokeWidth={2}
                  />
                </Link>
              </div>

            </div>

            {/* ============ SECURITY CARD ============ */}
            <div className="bg-gradient-to-br from-[#1D1D1F] to-[#2C2C2E] dark:from-white dark:to-[#F5F5F7] rounded-2xl p-5 text-white dark:text-[#1D1D1F]">

              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 dark:bg-[#1D1D1F]/10 flex items-center justify-center">
                  <Shield className="w-4 h-4" strokeWidth={2} />
                </div>
                <h3 className="font-display text-base">Account Security</h3>
              </div>

              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-2 text-[12px]">
                  <CheckCircle
                    className="w-3.5 h-3.5 text-[#81C784]"
                    strokeWidth={2.5}
                  />
                  <span className="text-white/80 dark:text-[#1D1D1F]/80">
                    JWT Authentication active
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[12px]">
                  <CheckCircle
                    className="w-3.5 h-3.5 text-[#81C784]"
                    strokeWidth={2.5}
                  />
                  <span className="text-white/80 dark:text-[#1D1D1F]/80">
                    Password encrypted
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[12px]">
                  <CheckCircle
                    className="w-3.5 h-3.5 text-[#81C784]"
                    strokeWidth={2.5}
                  />
                  <span className="text-white/80 dark:text-[#1D1D1F]/80">
                    Secure session management
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ==================== DELETE MODAL ==================== */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowDeleteModal(false);
              setDeleteConfirmText("");
            }}
          />
          <div className="relative bg-white dark:bg-[#1C1C1E] max-w-md w-full p-6 rounded-2xl shadow-2xl">

            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 bg-[#FFEBEE] rounded-full flex items-center justify-center shrink-0">
                <AlertCircle
                  className="w-6 h-6 text-[#C62828]"
                  strokeWidth={2}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl text-[#C62828] mb-2">
                  Delete Account?
                </h3>
                <p className="text-[13px] text-[#6E6E73] dark:text-[#98989D] leading-relaxed">
                  This will permanently delete your account, orders, wishlist,
                  and all data. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] mb-2">
                Type{" "}
                <span className="text-[#C62828] font-bold">DELETE</span> to
                confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full h-12 bg-[#FAFAFA] dark:bg-[#0A0A0A] border border-[#E5E5E7] dark:border-[#38383A] rounded-xl px-4 text-[14px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:border-[#C62828] transition-all"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E5E7] dark:border-[#38383A] text-[12px] tracking-wider uppercase font-medium text-[#1D1D1F] dark:text-white hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={deleteConfirmText !== "DELETE"}
                onClick={() => {
                  showToast(
                    "error",
                    "Account deletion is disabled. Contact support."
                  );
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C62828] hover:bg-[#B71C1C] text-white text-[12px] tracking-wider uppercase font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                Delete
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}