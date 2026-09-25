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

  useEffect(() => {
    loadFromStorage();
    setChecking(false);
  }, [loadFromStorage]);

  useEffect(() => {
    if (checking) return;
    if (pathname === "/admin/login") return;

    if (!isAuthenticated) {
      router.push("/admin/login");
      return;
    }

    if (user?.role !== "ADMIN") {
      router.push("/admin/login");
      return;
    }
  }, [checking, isAuthenticated, user, pathname, router]);

  // Lock body scroll when sidebar open (mobile)
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

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (checking || !isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="bg-ink text-ivory min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-2xl animate-pulse">ZAEM</p>
          <p className="text-label text-muted mt-3">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bone/30 min-h-screen">

      {/* ============ MOBILE OVERLAY ============ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ============ SIDEBAR ============ */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 md:w-72 bg-ink text-ivory transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">

          {/* Logo */}
          <div className="h-16 md:h-20 flex items-center justify-between px-5 md:px-6 border-b border-ivory/10 shrink-0">
            <Link
              href="/admin/dashboard"
              className="font-display text-xl md:text-2xl tracking-[0.15em]"
            >
              ZAEM
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 -mr-2 text-ivory/60 hover:text-ivory"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Admin Info */}
          <div className="px-5 md:px-6 py-4 border-b border-ivory/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-gold text-ink flex items-center justify-center font-display text-base md:text-lg shrink-0">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="min-w-0">
                <p className="text-label text-gold">Admin</p>
                <p className="font-display text-xs md:text-sm truncate">
                  {user?.name}
                </p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {MENU_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 md:px-4 py-2.5 md:py-3 mb-0.5 transition-all duration-300 ${
                    isActive
                      ? "bg-gold text-ink"
                      : "text-ivory/70 hover:bg-ivory/5 hover:text-ivory"
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                  <span className="text-sm font-body font-medium">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="p-3 border-t border-ivory/10 shrink-0">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-3.5 md:px-4 py-2.5 md:py-3 text-ivory/70 hover:bg-ivory/5 hover:text-ivory transition-all duration-300 mb-0.5"
            >
              <ExternalLink className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              <span className="text-sm font-body">View Store</span>
            </Link>
            <button
              onClick={() => {
                logout();
                router.push("/admin/login");
              }}
              className="w-full flex items-center gap-3 px-3.5 md:px-4 py-2.5 md:py-3 text-gold hover:bg-ivory/5 transition-all duration-300"
            >
              <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              <span className="text-sm font-body">Logout</span>
            </button>
          </div>

        </div>
      </aside>

      {/* ============ MAIN CONTENT ============ */}
      <div className="lg:pl-64 md:lg:pl-72">

        {/* Topbar */}
        <header className="sticky top-0 z-30 h-14 md:h-16 bg-ivory/90 backdrop-blur-xl border-b border-ink/5">
          <div className="h-full px-4 md:px-8 lg:px-10 flex items-center justify-between gap-3">

            {/* Menu button + Page Title */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 shrink-0"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" strokeWidth={1.5} />
              </button>

              <div className="min-w-0">
                <p className="text-label text-muted truncate">
                  ZAEM Admin Panel
                </p>
              </div>
            </div>

            {/* Right — Quick Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              <Link
                href="/"
                target="_blank"
                className="hidden md:inline-flex text-label text-muted hover:text-gold transition-colors"
              >
                View Store →
              </Link>
            </div>

          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-10">
          {children}
        </main>

      </div>

    </div>
  );
}