"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Star,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Search,
  Bell,
  Moon,
  Sun,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: FolderTree, label: "Categories", href: "/admin/categories" },
  { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Star, label: "Reviews", href: "/admin/reviews" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loadFromStorage, logout } = useAuthStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // ==================== INIT ====================
  useEffect(() => {
    loadFromStorage();
    setChecking(false);

    // Load dark mode preference
    if (typeof window !== "undefined") {
      const isDark = localStorage.getItem("admin_dark_mode") === "true";
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add("dark");
      }
    }
  }, [loadFromStorage]);

  // ==================== AUTH CHECK ====================
  useEffect(() => {
    if (checking) return;
    if (pathname === "/admin/login") return;

    if (!isAuthenticated) {
      router.push("/admin/login");
      return;
    }

    if (user?.role !== "ADMIN" && user?.role !== "MANAGER" && user?.role !== "STAFF") {
      router.push("/admin/login");
      return;
    }
  }, [checking, isAuthenticated, user, pathname, router]);

  // ==================== BODY SCROLL LOCK ====================
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  // ==================== CLOSE SIDEBAR ON ROUTE CHANGE ====================
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // ==================== TOGGLE DARK MODE ====================
  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_dark_mode", String(next));
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  // ==================== LOGIN PAGE ====================
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // ==================== LOADING ====================
  if (checking || !isAuthenticated || (user?.role !== "ADMIN" && user?.role !== "MANAGER" && user?.role !== "STAFF")) {
    return (
      <div className="admin-shell min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#1D1D1F] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-[11px] tracking-[0.4em] uppercase text-[#6E6E73] font-medium">
            Loading
          </p>
        </div>
      </div>
    );
  }

  // ==================== MAIN LAYOUT ====================
  return (
    <div className="admin-shell min-h-screen">

      {/* ============ MOBILE OVERLAY ============ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#1D1D1F]/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ============ SIDEBAR ============ */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[260px] md:w-[280px] admin-sidebar transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">

          {/* ========== LOGO ========== */}
          <div className="h-[72px] flex items-center justify-between px-6 border-b border-[#E5E5E7] dark:border-[#38383A] shrink-0">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3 group"
            >
              <div className="w-9 h-9 bg-[#1D1D1F] dark:bg-white flex items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-105">
                <span className="font-display text-white dark:text-[#1D1D1F] text-lg font-medium">
                  Z
                </span>
              </div>
              <div>
                <p className="font-display text-lg text-[#1D1D1F] dark:text-white leading-none">
                  ZAEM
                </p>
                <p className="text-[9px] tracking-[0.3em] uppercase text-[#86868B] mt-0.5">
                  Admin
                </p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 -mr-2 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" strokeWidth={1.8} />
            </button>
          </div>

          {/* ========== USER INFO ========== */}
          <div className="px-6 py-5 border-b border-[#E5E5E7] dark:border-[#38383A] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F5F5F7] dark:bg-[#2C2C2E] flex items-center justify-center rounded-full text-[#1D1D1F] dark:text-white font-display text-base shrink-0">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-[11px] text-[#86868B] truncate">
                  {user?.role === "ADMIN" ? "Administrator" : user?.role === "MANAGER" ? "Manager" : "Staff"}
                </p>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] shrink-0" />
            </div>
          </div>

          {/* ========== NAV ========== */}
          <nav className="flex-1 overflow-y-auto py-3 px-3">
            <p className="px-3 py-2 text-[10px] tracking-[0.3em] uppercase text-[#86868B] font-medium">
              Menu
            </p>
            {MENU_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 mb-0.5 rounded-lg transition-all duration-200 group relative ${
                    isActive
                      ? "bg-[#1D1D1F] text-white dark:bg-white dark:text-[#1D1D1F]"
                      : "text-[#6E6E73] dark:text-[#98989D] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] hover:text-[#1D1D1F] dark:hover:text-white"
                  }`}
                >
                  <item.icon
                    className="w-[18px] h-[18px] shrink-0"
                    strokeWidth={1.8}
                  />
                  <span className="text-[13px] font-medium">
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute right-3 w-1 h-1 rounded-full bg-white dark:bg-[#1D1D1F]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ========== BOTTOM ========== */}
          <div className="p-3 border-t border-[#E5E5E7] dark:border-[#38383A] shrink-0">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#6E6E73] dark:text-[#98989D] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] hover:text-[#1D1D1F] dark:hover:text-white transition-all duration-200 mb-0.5"
            >
              <ExternalLink className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
              <span className="text-[13px] font-medium">View Store</span>
            </Link>
            <button
              onClick={() => {
                logout();
                router.push("/admin/login");
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#C62828] hover:bg-[#FFEBEE] transition-all duration-200"
            >
              <LogOut className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
              <span className="text-[13px] font-medium">Logout</span>
            </button>
          </div>

        </div>
      </aside>

      {/* ============ MAIN CONTENT ============ */}
      <div className="lg:pl-[260px] md:lg:pl-[280px]">

        {/* ========== TOPBAR ========== */}
        <header className="sticky top-0 z-30 h-[64px] admin-topbar">
          <div className="h-full px-4 md:px-6 lg:px-8 flex items-center justify-between gap-3">

            {/* Left */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 shrink-0 text-[#6E6E73] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" strokeWidth={1.8} />
              </button>

              {/* Breadcrumb */}
              <div className="hidden md:flex items-center gap-2 text-[13px] text-[#86868B]">
                <span>Admin</span>
                <span className="text-[#D2D2D7]">/</span>
                <span className="text-[#1D1D1F] dark:text-white font-medium capitalize">
                  {pathname.split("/").filter(Boolean).slice(1).join(" / ") || "Dashboard"}
                </span>
              </div>
            </div>

            {/* Right — Actions */}
            <div className="flex items-center gap-1 md:gap-2 shrink-0">

              {/* Search */}
              <button
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-[#86868B] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
                aria-label="Search"
              >
                <Search className="w-[18px] h-[18px]" strokeWidth={1.8} />
                <span className="text-[12px]">Search</span>
                <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[10px] font-medium text-[#86868B] border border-[#E5E5E7] dark:border-[#38383A]">
                  ⌘K
                </kbd>
              </button>

              {/* Notifications */}
              <button
                className="relative p-2 rounded-lg text-[#86868B] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-[18px] h-[18px]" strokeWidth={1.8} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#C62828]" />
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-[#86868B] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="w-[18px] h-[18px]" strokeWidth={1.8} />
                ) : (
                  <Moon className="w-[18px] h-[18px]" strokeWidth={1.8} />
                )}
              </button>

              {/* View Store (mobile) */}
              <Link
                href="/"
                target="_blank"
                className="md:hidden p-2 rounded-lg text-[#86868B] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
                aria-label="View store"
              >
                <ExternalLink className="w-[18px] h-[18px]" strokeWidth={1.8} />
              </Link>

            </div>
          </div>
        </header>

        {/* ========== PAGE CONTENT ========== */}
        <main className="p-4 md:p-6 lg:p-8 admin-fade-in">
          {children}
        </main>

      </div>

    </div>
  );
}