"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, loadFromStorage, token } = useAuthStore();
  const [stats, setStats] = useState({ orders: 0, wishlist: 0, addresses: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAuthenticated || !token) {
        setLoading(false);
        return;
      }

      try {
        const [ordersRes, wishlistRes, addressesRes] = await Promise.all([
          fetch(`${API_URL}/api/orders`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/wishlist`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/addresses`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const [ordersData, wishlistData, addressesData] = await Promise.all([
          ordersRes.json(),
          wishlistRes.json(),
          addressesRes.json(),
        ]);

        setStats({
          orders: ordersData.success ? ordersData.count : 0,
          wishlist: wishlistData.success ? wishlistData.count : 0,
          addresses: addressesData.success ? addressesData.count : 0,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [isAuthenticated, token]);

  // Not logged in → redirect
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/account/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return (
      <main className="bg-ivory min-h-screen flex items-center justify-center">
        <p className="font-display text-2xl text-muted">Loading...</p>
      </main>
    );
  }

  const MENU_ITEMS = [
    {
      icon: Package,
      label: "My Orders",
      desc: `${stats.orders} ${stats.orders === 1 ? "order" : "orders"}`,
      href: "/account/orders",
    },
    {
      icon: User,
      label: "Profile",
      desc: "Edit your personal info",
      href: "/account/profile",
    },
    {
      icon: MapPin,
      label: "Addresses",
      desc: `${stats.addresses} saved ${stats.addresses === 1 ? "address" : "addresses"}`,
      href: "/account/addresses",
    },
    {
      icon: Heart,
      label: "Wishlist",
      desc: `${stats.wishlist} saved ${stats.wishlist === 1 ? "item" : "items"}`,
      href: "/wishlist",
    },
  ];

  return (
    <main className="bg-ivory text-ink min-h-screen">

      {/* ============ HEADER ============ */}
      <section className="pt-16 md:pt-24 pb-10 md:pb-16 px-6 md:px-10 lg:px-16 border-b border-ink/10">
        <div className="max-w-[1800px] mx-auto">
          <p className="text-label text-gold mb-4">My Account</p>
          <h1 className="display-xl mb-6">
            Welcome,{" "}
            <em className="font-display italic text-gold">
              {user?.name?.split(" ")[0] || "there"}.
            </em>
          </h1>
          <p className="text-muted text-sm md:text-base font-body">
            Manage your orders, addresses, and personal details.
          </p>
        </div>
      </section>

      {/* ============ MENU ============ */}
      <section className="py-10 md:py-16 px-6 md:px-10 lg:px-16">
        <div className="max-w-[1200px] mx-auto">

          <div className="grid md:grid-cols-2 gap-4 md:gap-6">

            {MENU_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-6 p-6 md:p-8 border border-ink/10 hover:border-gold transition-all duration-500"
              >
                <div className="w-14 h-14 bg-bone group-hover:bg-gold flex items-center justify-center transition-colors duration-500 shrink-0">
                  <item.icon
                    className="w-6 h-6 group-hover:text-ivory transition-colors duration-500"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-display text-xl md:text-2xl mb-1">
                    {item.label}
                  </p>
                  <p className="text-sm text-muted font-body">{item.desc}</p>
                </div>
                <ChevronRight
                  className="w-5 h-5 text-muted group-hover:text-gold group-hover:translate-x-1 transition-all duration-500"
                  strokeWidth={1.5}
                />
              </Link>
            ))}

          </div>

          {/* Logout */}
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="mt-8 w-full md:w-auto flex items-center gap-3 text-label text-gold hover:text-ink transition-colors duration-500 py-4"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            Logout
          </button>

        </div>
      </section>

    </main>
  );
}