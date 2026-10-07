"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
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
  ChevronRight,
  Command,
  Sparkles,
  TrendingUp,
  Circle,
  ChevronDown,
  User,
  LogOut as LogOutIcon,
  Keyboard,
  Home,
  HelpCircle,
  Copy,
  Check,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

// ==================== MENU ITEMS ====================
const MENU_ITEMS = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/admin/dashboard",
    description: "Overview & analytics",
  },
  {
    icon: Package,
    label: "Products",
    href: "/admin/products",
    description: "Manage inventory",
  },
  {
    icon: FolderTree,
    label: "Categories",
    href: "/admin/categories",
    description: "Organize catalog",
  },
  {
    icon: ShoppingCart,
    label: "Orders",
    href: "/admin/orders",
    description: "Track sales",
  },
  {
    icon: Users,
    label: "Customers",
    href: "/admin/users",
    description: "User management",
  },
  {
    icon: Star,
    label: "Reviews",
    href: "/admin/reviews",
    description: "Moderate feedback",
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/admin/settings",
    description: "Store config",
  },
];

// ==================== QUICK SHORTCUTS ====================
const SHORTCUTS = [
  { keys: ["⌘", "K"], label: "Search" },
  { keys: ["⌘", "N"], label: "New Product" },
  { keys: ["⌘", "O"], label: "Orders" },
  { keys: ["ESC"], label: "Close" },
];

// ==================== MAIN COMPONENT ====================
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loadFromStorage, logout } = useAuthStore();

  // ==================== STATE ====================
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notifications] = useState([
    {
      id: 1,
      title: "New order received",
      desc: "Order ZAEM-20261007",
      time: "2m ago",
      unread: true,
    },
  ]);

  // ==================== INIT ====================
  useEffect(() => {
    loadFromStorage();
    setChecking(false);

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

    if (
      user?.role !== "ADMIN" &&
      user?.role !== "MANAGER" &&
      user?.role !== "STAFF"
    ) {
      router.push("/admin/login");
      return;
    }
  }, [checking, isAuthenticated, user, pathname, router]);

  // ==================== BODY SCROLL LOCK ====================
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sidebarOpen || searchOpen || shortcutsOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen, searchOpen, shortcutsOpen]);

  // ==================== CLOSE ON ROUTE CHANGE ====================
  useEffect(() => {
    setSidebarOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  // ==================== KEYBOARD SHORTCUTS ====================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmd = e.metaKey || e.ctrlKey;

      // ⌘K → Search
      if (isCmd && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }

      // ⌘N → New Product
      if (isCmd && e.key === "n") {
        e.preventDefault();
        router.push("/admin/products/new");
      }

      // ⌘O → Orders
      if (isCmd && e.key === "o") {
        e.preventDefault();
        router.push("/admin/orders");
      }

      // ESC → Close everything
      if (e.key === "Escape") {
        setSearchOpen(false);
        setShortcutsOpen(false);
        setProfileOpen(false);
      }

      // ? → Show shortcuts
      if (e.key === "?" && !isCmd) {
        const target = e.target as HTMLElement;
        if (
          target.tagName !== "INPUT" &&
          target.tagName !== "TEXTAREA"
        ) {
          e.preventDefault();
          setShortcutsOpen(true);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);

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
  if (
    checking ||
    !isAuthenticated ||
    (user?.role !== "ADMIN" &&
      user?.role !== "MANAGER" &&
      user?.role !== "STAFF")
  ) {
    return (
      <div className="admin-shell min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-[#E5E5E7] dark:border-[#38383A]" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#1D1D1F] dark:border-t-white animate-spin" />
          </div>
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#86868B] font-medium">
            Loading ZAEM
          </p>
        </div>
      </div>
    );
  }

  // ==================== USER ROLE LABEL ====================
  const roleLabel =
    user?.role === "ADMIN"
      ? "Administrator"
      : user?.role === "MANAGER"
      ? "Manager"
      : "Staff";

  const roleColor =
    user?.role === "ADMIN"
      ? "bg-[#FFF3E0] text-[#E65100]"
      : user?.role === "MANAGER"
      ? "bg-[#E3F2FD] text-[#0A84FF]"
      : "bg-[#F5F5F7] text-[#6E6E73]";

  // ==================== RENDER ====================
  return (
    <div className="admin-shell min-h-screen">

      {/* ==================== MOBILE OVERLAY ==================== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#1D1D1F]/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ==================== SIDEBAR ==================== */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[272px] admin-sidebar transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">

          {/* ========== LOGO HEADER ========== */}
          <div className="h-[76px] flex items-center justify-between px-6 border-b border-[#E5E5E7] dark:border-[#38383A] shrink-0">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 bg-[#1D1D1F] dark:bg-white flex items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
                <span className="font-display text-white dark:text-[#1D1D1F] text-lg font-medium">
                  Z
                </span>
              </div>
              <div>
                <p className="font-display text-lg text-[#1D1D1F] dark:text-white leading-none">
                  ZAEM
                </p>
                <p className="text-[9px] tracking-[0.3em] uppercase text-[#86868B] mt-0.5">
                  Admin Panel
                </p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 -mr-2 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-colors rounded-lg hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" strokeWidth={1.8} />
            </button>
          </div>

          {/* ========== USER INFO ========== */}
          <div className="px-5 py-4 border-b border-[#E5E5E7] dark:border-[#38383A] shrink-0">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAFAFA] dark:bg-[#0A0A0A] hover:bg-[#F5F5F7] dark:hover:bg-[#1C1C1E] transition-colors group">
              <div className="relative shrink-0">
                <div className="w-11 h-11 bg-gradient-to-br from-[#1D1D1F] to-[#48484A] dark:from-white dark:to-[#D2D2D7] flex items-center justify-center rounded-full text-white dark:text-[#1D1D1F] font-display text-base font-medium shadow-sm">
                  {user?.name?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#2E7D32] rounded-full border-2 border-white dark:border-[#0A0A0A]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white truncate">
                  {user?.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`inline-flex items-center gap-1 text-[9px] tracking-wider uppercase font-medium px-1.5 py-0.5 rounded ${roleColor}`}
                  >
                    {roleLabel}
                  </span>
                </div>
              </div>
              <ChevronRight
                className="w-4 h-4 text-[#86868B] shrink-0 group-hover:translate-x-0.5 transition-transform"
                strokeWidth={2}
              />
            </div>
          </div>

          {/* ========== NAVIGATION ========== */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">

            {/* Section: Main */}
            <p className="px-3 py-2 text-[10px] tracking-[0.3em] uppercase text-[#86868B] font-medium">
              Main Menu
            </p>

            {MENU_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 mb-0.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                    isActive
                      ? "bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] shadow-sm"
                      : "text-[#6E6E73] dark:text-[#98989D] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] hover:text-[#1D1D1F] dark:hover:text-white"
                  }`}
                >
                  {/* Active left bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white dark:bg-[#1D1D1F] rounded-r-full" />
                  )}

                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
                      isActive
                        ? "bg-white/10 dark:bg-[#1D1D1F]/10"
                        : "bg-[#F5F5F7] dark:bg-[#1C1C1E] group-hover:bg-[#E5E5E7] dark:group-hover:bg-[#2C2C2E]"
                    }`}
                  >
                    <item.icon
                      className="w-[16px] h-[16px]"
                      strokeWidth={1.9}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium leading-tight">
                      {item.label}
                    </p>
                    <p
                      className={`text-[10px] mt-0.5 truncate ${
                        isActive
                          ? "text-white/60 dark:text-[#1D1D1F]/60"
                          : "text-[#86868B]"
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>

                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#1D1D1F] shrink-0" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ========== QUICK SHORTCUT BUTTON ========== */}
          <div className="px-3 pb-2 shrink-0">
            <button
              onClick={() => setShortcutsOpen(true)}
              className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-[#6E6E73] dark:text-[#98989D] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] hover:text-[#1D1D1F] dark:hover:text-white transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F5F5F7] dark:bg-[#1C1C1E] flex items-center justify-center group-hover:bg-[#E5E5E7] dark:group-hover:bg-[#2C2C2E] transition-colors">
                  <Keyboard className="w-[16px] h-[16px]" strokeWidth={1.9} />
                </div>
                <span className="text-[13px] font-medium">Shortcuts</span>
              </div>
              <kbd className="text-[9px] px-1.5 py-0.5 rounded bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#86868B] font-medium">
                ?
              </kbd>
            </button>
          </div>

          {/* ========== BOTTOM ACTIONS ========== */}
          <div className="p-3 border-t border-[#E5E5E7] dark:border-[#38383A] shrink-0 space-y-0.5">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#6E6E73] dark:text-[#98989D] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] hover:text-[#1D1D1F] dark:hover:text-white transition-all duration-200 group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#F5F5F7] dark:bg-[#1C1C1E] flex items-center justify-center group-hover:bg-[#E5E5E7] dark:group-hover:bg-[#2C2C2E] transition-colors">
                <ExternalLink className="w-[16px] h-[16px]" strokeWidth={1.9} />
              </div>
              <span className="text-[13px] font-medium">View Store</span>
            </Link>

            <button
              onClick={() => {
                logout();
                router.push("/admin/login");
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#C62828] hover:bg-[#FFEBEE] transition-all duration-200 group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#FFEBEE] flex items-center justify-center group-hover:bg-[#FFCDD2] transition-colors">
                <LogOut className="w-[16px] h-[16px]" strokeWidth={1.9} />
              </div>
              <span className="text-[13px] font-medium">Sign Out</span>
            </button>
          </div>

          {/* ========== FOOTER INFO ========== */}
          <div className="px-5 py-3 border-t border-[#E5E5E7] dark:border-[#38383A] shrink-0">
            <p className="text-[9px] tracking-[0.2em] uppercase text-[#86868B] text-center">
              ZAEM Admin v1.0
            </p>
          </div>

        </div>
      </aside>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="lg:pl-[272px]">

        {/* ==================== TOPBAR ==================== */}
        <header className="sticky top-0 z-30 h-[72px] admin-topbar">
          <div className="h-full px-4 md:px-6 lg:px-8 flex items-center justify-between gap-3">

            {/* ========== LEFT ========== */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 shrink-0 text-[#6E6E73] hover:text-[#1D1D1F] dark:hover:text-white transition-colors rounded-lg hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" strokeWidth={1.9} />
              </button>

              {/* Breadcrumb */}
              <div className="hidden md:flex items-center gap-2 text-[13px] min-w-0">
                <Link
                  href="/admin/dashboard"
                  className="text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Home className="w-3.5 h-3.5" strokeWidth={2} />
                  Admin
                </Link>
                {pathname !== "/admin/dashboard" && (
                  <>
                    <ChevronRight
                      className="w-3.5 h-3.5 text-[#D2D2D7] dark:text-[#48484A] shrink-0"
                      strokeWidth={2}
                    />
                    <span className="text-[#1D1D1F] dark:text-white font-medium capitalize truncate">
                      {pathname
                        .split("/")
                        .filter(Boolean)
                        .slice(1)
                        .map((s) => s.replace("-", " "))
                        .join(" / ")}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* ========== RIGHT ========== */}
            <div className="flex items-center gap-1 md:gap-1.5 shrink-0">

              {/* Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden md:flex items-center gap-3 px-3 py-2 rounded-xl text-[#86868B] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] hover:text-[#1D1D1F] dark:hover:text-white transition-colors border border-transparent hover:border-[#E5E5E7] dark:hover:border-[#38383A]"
                aria-label="Search"
              >
                <Search className="w-4 h-4" strokeWidth={2} />
                <span className="text-[12px] font-medium hidden lg:inline">
                  Search
                </span>
                <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[10px] font-medium text-[#86868B] border border-[#E5E5E7] dark:border-[#38383A]">
                  <Command className="w-2.5 h-2.5" strokeWidth={2} />
                  K
                </kbd>
              </button>

              {/* Mobile Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="md:hidden p-2 rounded-xl text-[#86868B] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors"
                aria-label="Search"
              >
                <Search className="w-[18px] h-[18px]" strokeWidth={1.9} />
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  className="relative p-2 rounded-xl text-[#86868B] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-[18px] h-[18px]" strokeWidth={1.9} />
                  {notifications.some((n) => n.unread) && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C62828] animate-pulse" />
                  )}
                </button>
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl text-[#86868B] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="w-[18px] h-[18px]" strokeWidth={1.9} />
                ) : (
                  <Moon className="w-[18px] h-[18px]" strokeWidth={1.9} />
                )}
              </button>

              {/* Divider */}
              <div className="hidden md:block w-px h-6 bg-[#E5E5E7] dark:bg-[#38383A] mx-1" />

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1 pl-1 pr-2 md:pr-3 rounded-xl hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors"
                  aria-label="Profile menu"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1D1D1F] to-[#48484A] dark:from-white dark:to-[#D2D2D7] flex items-center justify-center text-white dark:text-[#1D1D1F] font-display text-[13px] font-medium shrink-0">
                    {user?.name?.charAt(0).toUpperCase() || "A"}
                  </div>
                  <ChevronDown
                    className={`hidden md:block w-3.5 h-3.5 text-[#86868B] transition-transform ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                    strokeWidth={2}
                  />
                </button>

                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#1C1C1E] border border-[#E5E5E7] dark:border-[#38383A] rounded-2xl shadow-xl z-20 overflow-hidden admin-scale-in">

                      {/* User Info */}
                      <div className="p-4 border-b border-[#E5E5E7] dark:border-[#38383A]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1D1D1F] to-[#48484A] dark:from-white dark:to-[#D2D2D7] flex items-center justify-center text-white dark:text-[#1D1D1F] font-display text-sm font-medium shrink-0">
                            {user?.name?.charAt(0).toUpperCase() || "A"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white truncate">
                              {user?.name}
                            </p>
                            <p className="text-[11px] text-[#86868B] truncate">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu */}
                      <div className="py-1.5">
                        <Link
                          href="/admin/settings"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#1D1D1F] dark:text-white hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors"
                        >
                          <User className="w-4 h-4 text-[#86868B]" strokeWidth={2} />
                          Profile Settings
                        </Link>

                        <Link
                          href="/"
                          target="_blank"
                          className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#1D1D1F] dark:text-white hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 text-[#86868B]" strokeWidth={2} />
                          View Store
                        </Link>

                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            setShortcutsOpen(true);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#1D1D1F] dark:text-white hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors"
                        >
                          <Keyboard className="w-4 h-4 text-[#86868B]" strokeWidth={2} />
                          Keyboard Shortcuts
                        </button>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-[#E5E5E7] dark:border-[#38383A]" />

                      {/* Logout */}
                      <div className="py-1.5">
                        <button
                          onClick={() => {
                            logout();
                            router.push("/admin/login");
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#C62828] hover:bg-[#FFEBEE] transition-colors"
                        >
                          <LogOutIcon className="w-4 h-4" strokeWidth={2} />
                          Sign Out
                        </button>
                      </div>

                    </div>
                  </>
                )}
              </div>

            </div>
          </div>
        </header>

        {/* ==================== PAGE CONTENT ==================== */}
        <main className="p-4 md:p-6 lg:p-8 admin-fade-in">
          {children}
        </main>

      </div>

      {/* ==================== COMMAND PALETTE (⌘K) ==================== */}
      {searchOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-2xl overflow-hidden admin-scale-in">

            {/* Search Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E5E5E7] dark:border-[#38383A]">
              <Search
                className="w-5 h-5 text-[#86868B] shrink-0"
                strokeWidth={2}
              />
              <input
                type="text"
                placeholder="Search or jump to..."
                autoFocus
                className="flex-1 bg-transparent outline-none text-[15px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B]"
              />
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#86868B] font-medium">
                ESC
              </kbd>
            </div>

            {/* Quick Nav */}
            <div className="p-2 max-h-[60vh] overflow-y-auto">
              <p className="px-3 py-2 text-[10px] tracking-[0.3em] uppercase text-[#86868B] font-medium">
                Navigate
              </p>
              {MENU_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#F5F5F7] dark:bg-[#0A0A0A] flex items-center justify-center shrink-0 group-hover:bg-[#E5E5E7] dark:group-hover:bg-[#2C2C2E] transition-colors">
                    <item.icon className="w-4 h-4 text-[#6E6E73]" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-[#86868B]">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight
                    className="w-4 h-4 text-[#86868B]"
                    strokeWidth={2}
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== SHORTCUTS MODAL ==================== */}
      {shortcutsOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShortcutsOpen(false)}
          />
          <div className="relative bg-white dark:bg-[#1C1C1E] max-w-lg w-full p-6 rounded-2xl shadow-2xl admin-scale-in">

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-[#E3F2FD] flex items-center justify-center">
                <Keyboard className="w-5 h-5 text-[#0A84FF]" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl text-[#1D1D1F] dark:text-white">
                  Keyboard Shortcuts
                </h3>
                <p className="text-[11px] text-[#86868B] mt-0.5">
                  Quick actions for power users
                </p>
              </div>
              <button
                onClick={() => setShortcutsOpen(false)}
                className="p-2 rounded-lg hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors"
              >
                <X
                  className="w-4 h-4 text-[#86868B]"
                  strokeWidth={2}
                />
              </button>
            </div>

            <div className="space-y-2">
              {[
                { keys: ["⌘", "K"], label: "Open command palette" },
                { keys: ["⌘", "N"], label: "Add new product" },
                { keys: ["⌘", "O"], label: "View orders" },
                { keys: ["?"], label: "Show shortcuts" },
                { keys: ["ESC"], label: "Close modal" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-[#FAFAFA] dark:bg-[#0A0A0A]"
                >
                  <span className="text-[13px] text-[#1D1D1F] dark:text-white">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-1">
                    {item.keys.map((key, i) => (
                      <kbd
                        key={i}
                        className="min-w-[28px] h-7 px-2 rounded-md bg-white dark:bg-[#1C1C1E] border border-[#E5E5E7] dark:border-[#38383A] flex items-center justify-center text-[11px] font-medium text-[#6E6E73] dark:text-[#98989D] shadow-sm"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShortcutsOpen(false)}
              className="admin-btn admin-btn-primary w-full justify-center mt-5"
            >
              Got it
            </button>
          </div>
        </div>
      )}

    </div>
  );
}