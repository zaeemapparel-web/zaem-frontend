"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  ChevronRight,
  ShoppingBag,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Star,
  Crown,
  Gift,
  ArrowRight,
  Loader2,
  Shield,
  Mail,
  Phone,
  Calendar,
  Award,
  Sparkles,
  Settings,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ==================== TYPES ====================
interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  items: any[];
}

interface Stats {
  orders: number;
  pending: number;
  delivered: number;
  wishlist: number;
  addresses: number;
  totalSpent: number;
}

// ==================== STATUS CONFIG ====================
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: any }
> = {
  PENDING: {
    label: "Pending",
    color: "text-[#E65100]",
    bg: "bg-[#FFF3E0]",
    border: "border-[#FFB74D]",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "text-[#0A84FF]",
    bg: "bg-[#E3F2FD]",
    border: "border-[#64B5F6]",
    icon: CheckCircle,
  },
  PROCESSING: {
    label: "Processing",
    color: "text-[#7B1FA2]",
    bg: "bg-[#F3E5F5]",
    border: "border-[#BA68C8]",
    icon: Package,
  },
  SHIPPED: {
    label: "Shipped",
    color: "text-[#00838F]",
    bg: "bg-[#E0F7FA]",
    border: "border-[#4DD0E1]",
    icon: Truck,
  },
  DELIVERED: {
    label: "Delivered",
    color: "text-[#2E7D32]",
    bg: "bg-[#E8F5E9]",
    border: "border-[#81C784]",
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-[#C62828]",
    bg: "bg-[#FFEBEE]",
    border: "border-[#EF5350]",
    icon: XCircle,
  },
  RETURNED: {
    label: "Returned",
    color: "text-[#6E6E73]",
    bg: "bg-[#F5F5F7]",
    border: "border-[#BDBDBD]",
    icon: Package,
  },
};

// ==================== HELPERS ====================
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const getTierInfo = (totalSpent: number) => {
  if (totalSpent >= 100000)
    return {
      tier: "Platinum",
      color: "bg-[#E0F7FA] text-[#00838F]",
      icon: Crown,
      next: null,
    };
  if (totalSpent >= 50000)
    return {
      tier: "Gold",
      color: "bg-[#FFF3E0] text-[#E65100]",
      icon: Award,
      next: 100000,
    };
  if (totalSpent >= 10000)
    return {
      tier: "Silver",
      color: "bg-[#F5F5F7] text-[#6E6E73]",
      icon: Star,
      next: 50000,
    };
  return {
    tier: "Bronze",
    color: "bg-[#F5F5F7] text-[#6E6E73]",
    icon: Star,
    next: 10000,
  };
};

// ==================== MAIN COMPONENT ====================
export default function AccountPage() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    logout,
    loadFromStorage,
    token,
  } = useAuthStore();

  const [stats, setStats] = useState<Stats>({
    orders: 0,
    pending: 0,
    delivered: 0,
    wishlist: 0,
    addresses: 0,
    totalSpent: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // ==================== INIT ====================
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // ==================== FETCH STATS ====================
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

        if (ordersData.success && ordersData.data?.orders) {
          const orders = ordersData.data.orders;
          const totalSpent = orders
            .filter(
              (o: Order) =>
                o.status !== "CANCELLED" && o.status !== "RETURNED"
            )
            .reduce((sum: number, o: Order) => sum + o.total, 0);

          setStats({
            orders: orders.length,
            pending: orders.filter((o: Order) => o.status === "PENDING").length,
            delivered: orders.filter(
              (o: Order) => o.status === "DELIVERED"
            ).length,
            wishlist: wishlistData.success ? wishlistData.count || 0 : 0,
            addresses: addressesData.success ? addressesData.count || 0 : 0,
            totalSpent,
          });

          // Recent 3 orders
          setRecentOrders(orders.slice(0, 3));
        } else {
          setStats({
            orders: 0,
            pending: 0,
            delivered: 0,
            wishlist: wishlistData.success ? wishlistData.count || 0 : 0,
            addresses: addressesData.success ? addressesData.count || 0 : 0,
            totalSpent: 0,
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [isAuthenticated, token]);

  // ==================== REDIRECT IF NOT AUTH ====================
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/account/login");
    }
  }, [isAuthenticated, loading, router]);

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
            Loading Account
          </p>
        </div>
      </main>
    );
  }

  // ==================== DERIVED ====================
  const tierInfo = getTierInfo(stats.totalSpent);
  const TierIcon = tierInfo.icon;
  const nextTierProgress = tierInfo.next
    ? Math.min(100, (stats.totalSpent / tierInfo.next) * 100)
    : 100;

  // ==================== MENU ITEMS ====================
  const MENU_ITEMS = [
    {
      icon: Package,
      label: "My Orders",
      desc: `${stats.orders} ${stats.orders === 1 ? "order" : "orders"}`,
      href: "/account/orders",
      accent: "text-[#0A84FF]",
      bg: "bg-[#E3F2FD]",
    },
    {
      icon: User,
      label: "Profile",
      desc: "Edit your personal info",
      href: "/account/profile",
      accent: "text-[#7B1FA2]",
      bg: "bg-[#F3E5F5]",
    },
    {
      icon: MapPin,
      label: "Addresses",
      desc: `${stats.addresses} saved ${
        stats.addresses === 1 ? "address" : "addresses"
      }`,
      href: "/account/addresses",
      accent: "text-[#E65100]",
      bg: "bg-[#FFF3E0]",
    },
    {
      icon: Heart,
      label: "Wishlist",
      desc: `${stats.wishlist} saved ${
        stats.wishlist === 1 ? "item" : "items"
      }`,
      href: "/wishlist",
      accent: "text-[#C62828]",
      bg: "bg-[#FFEBEE]",
    },
  ];

  // ==================== RENDER ====================
  return (
    <main className="bg-[#FAFAFA] dark:bg-black min-h-screen">

      {/* ==================== HEADER ==================== */}
      <section className="pt-12 md:pt-20 pb-8 md:pb-12 px-4 md:px-8 lg:px-16 border-b border-[#E5E5E7] dark:border-[#38383A]">
        <div className="max-w-[1400px] mx-auto">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[10px] tracking-wider uppercase text-[#86868B] font-medium mb-5">
            <Link
              href="/"
              className="hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
            >
              Home
            </Link>
            <ChevronRight className="w-3 h-3" strokeWidth={2} />
            <span className="text-[#1D1D1F] dark:text-white">My Account</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">

            {/* Avatar */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-[#1D1D1F] to-[#48484A] dark:from-white dark:to-[#D2D2D7] flex items-center justify-center text-white dark:text-[#1D1D1F] font-display text-2xl md:text-3xl font-medium shrink-0 shadow-lg">
              {getInitials(user?.name || "User")}
            </div>

            {/* Welcome */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#86868B] font-medium mb-2">
                Welcome Back
              </p>
              <h1 className="font-display text-3xl md:text-5xl text-[#1D1D1F] dark:text-white mb-2 truncate">
                {user?.name?.split(" ")[0] || "there"}.
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span
                  className={`inline-flex items-center gap-1.5 text-[10px] tracking-wider uppercase font-medium px-2.5 py-1 rounded-md ${tierInfo.color}`}
                >
                  <TierIcon className="w-3 h-3" strokeWidth={2.5} />
                  {tierInfo.tier} Member
                </span>
                {user?.email && (
                  <span className="text-[12px] text-[#86868B] flex items-center gap-1">
                    <Mail className="w-3 h-3" strokeWidth={2} />
                    {user.email}
                  </span>
                )}
              </div>
            </div>

            {/* Logout Button (Desktop) */}
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E5E7] dark:border-[#38383A] text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] hover:bg-[#F5F5F7] dark:hover:bg-[#1C1C1E] hover:text-[#1D1D1F] dark:hover:text-white transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" strokeWidth={2} />
              Sign Out
            </button>

          </div>
        </div>
      </section>

      {/* ==================== STATS ==================== */}
      <section className="py-8 md:py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-[1400px] mx-auto">

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">

            {/* Total Spent */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A] p-4 md:p-5 hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-[#E8F5E9] flex items-center justify-center mb-3">
                <TrendingUp
                  className="w-5 h-5 text-[#2E7D32]"
                  strokeWidth={2}
                />
              </div>
              <p className="font-display text-lg md:text-2xl text-[#1D1D1F] dark:text-white mb-1 truncate">
                Rs. {stats.totalSpent.toLocaleString()}
              </p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#86868B] font-medium">
                Total Spent
              </p>
            </div>

            {/* Orders */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A] p-4 md:p-5 hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-[#E3F2FD] flex items-center justify-center mb-3">
                <ShoppingBag
                  className="w-5 h-5 text-[#0A84FF]"
                  strokeWidth={2}
                />
              </div>
              <p className="font-display text-lg md:text-2xl text-[#1D1D1F] dark:text-white mb-1">
                {stats.orders}
              </p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#86868B] font-medium">
                Total Orders
              </p>
            </div>

            {/* Delivered */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A] p-4 md:p-5 hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-[#E8F5E9] flex items-center justify-center mb-3">
                <CheckCircle
                  className="w-5 h-5 text-[#2E7D32]"
                  strokeWidth={2}
                />
              </div>
              <p className="font-display text-lg md:text-2xl text-[#1D1D1F] dark:text-white mb-1">
                {stats.delivered}
              </p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#86868B] font-medium">
                Delivered
              </p>
            </div>

            {/* Wishlist */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A] p-4 md:p-5 hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-[#FFEBEE] flex items-center justify-center mb-3">
                <Heart
                  className="w-5 h-5 text-[#C62828]"
                  strokeWidth={2}
                />
              </div>
              <p className="font-display text-lg md:text-2xl text-[#1D1D1F] dark:text-white mb-1">
                {stats.wishlist}
              </p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#86868B] font-medium">
                Wishlist
              </p>
            </div>

          </div>

          {/* Loyalty Progress (if next tier exists) */}
          {tierInfo.next && (
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A] p-5 mb-8">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#FFF3E0] flex items-center justify-center">
                    <Gift
                      className="w-5 h-5 text-[#E65100]"
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white">
                      Unlock Next Tier
                    </p>
                    <p className="text-[11px] text-[#86868B]">
                      Spend Rs.{" "}
                      {(tierInfo.next - stats.totalSpent).toLocaleString()}{" "}
                      more to reach next level
                    </p>
                  </div>
                </div>
                <p className="font-display text-lg text-[#1D1D1F] dark:text-white">
                  {Math.round(nextTierProgress)}%
                </p>
              </div>
              <div className="h-2 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#E65100] to-[#FFB74D] rounded-full transition-all duration-1000"
                  style={{ width: `${nextTierProgress}%` }}
                />
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ==================== RECENT ORDERS ==================== */}
      {recentOrders.length > 0 && (
        <section className="pb-8 md:pb-12 px-4 md:px-8 lg:px-16">
          <div className="max-w-[1400px] mx-auto">

            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-[#86868B] font-medium mb-1">
                  Recent Activity
                </p>
                <h2 className="font-display text-2xl md:text-3xl text-[#1D1D1F] dark:text-white">
                  Latest Orders
                </h2>
              </div>
              <Link
                href="/account/orders"
                className="flex items-center gap-1.5 text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
              >
                View All
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
              </Link>
            </div>

            <div className="space-y-3">
              {recentOrders.map((order) => {
                const statusConfig =
                  STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                const StatusIcon = statusConfig.icon;

                return (
                  <Link
                    key={order.id}
                    href={`/account/orders/${order.id}`}
                    className="block bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A] p-4 md:p-5 hover:border-[#D2D2D7] dark:hover:border-[#48484A] hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">

                      {/* Images */}
                      <div className="hidden md:flex -space-x-3 shrink-0">
                        {order.items?.slice(0, 3).map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="w-12 h-14 rounded-lg bg-[#F5F5F7] dark:bg-[#2C2C2E] border-2 border-white dark:border-[#1C1C1E] overflow-hidden"
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package
                                  className="w-4 h-4 text-[#86868B]"
                                  strokeWidth={1.5}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <div className="w-12 h-14 rounded-lg bg-[#F5F5F7] dark:bg-[#2C2C2E] border-2 border-white dark:border-[#1C1C1E] flex items-center justify-center text-[10px] font-medium text-[#86868B]">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>

                      {/* Mobile Images */}
                      <div className="md:hidden w-12 h-14 rounded-lg bg-[#F5F5F7] dark:bg-[#2C2C2E] overflow-hidden shrink-0">
                        {order.items?.[0]?.image ? (
                          <img
                            src={order.items[0].image}
                            alt={order.items[0].name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package
                              className="w-4 h-4 text-[#86868B]"
                              strokeWidth={1.5}
                            />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white">
                            {order.orderNumber}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 text-[9px] tracking-wider uppercase font-medium px-2 py-0.5 rounded border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}
                          >
                            <StatusIcon
                              className="w-2.5 h-2.5"
                              strokeWidth={2.5}
                            />
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#86868B] flex items-center gap-2 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar
                              className="w-3 h-3"
                              strokeWidth={2}
                            />
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-PK",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-[#D2D2D7] dark:bg-[#48484A]" />
                          <span>
                            {order.items?.length || 0}{" "}
                            {order.items?.length === 1 ? "item" : "items"}
                          </span>
                        </p>
                      </div>

                      {/* Total */}
                      <div className="text-right shrink-0">
                        <p className="font-display text-base md:text-lg text-[#1D1D1F] dark:text-white">
                          Rs. {order.total.toLocaleString()}
                        </p>
                        <ChevronRight
                          className="w-4 h-4 text-[#86868B] ml-auto mt-1"
                          strokeWidth={2}
                        />
                      </div>

                    </div>
                  </Link>
                );
              })}
            </div>

          </div>
        </section>
      )}

      {/* ==================== MENU ITEMS ==================== */}
      <section className="pb-12 md:pb-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-[1400px] mx-auto">

          <div className="mb-5">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#86868B] font-medium mb-1">
              Manage
            </p>
            <h2 className="font-display text-2xl md:text-3xl text-[#1D1D1F] dark:text-white">
              Your Account
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-3 md:gap-4">

            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-4 p-4 md:p-5 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A] hover:border-[#D2D2D7] dark:hover:border-[#48484A] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}
                  >
                    <Icon
                      className={`w-5 h-5 ${item.accent}`}
                      strokeWidth={2}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-base md:text-lg text-[#1D1D1F] dark:text-white mb-0.5">
                      {item.label}
                    </p>
                    <p className="text-[12px] text-[#86868B] truncate">
                      {item.desc}
                    </p>
                  </div>
                  <ChevronRight
                    className="w-4 h-4 text-[#86868B] group-hover:translate-x-0.5 group-hover:text-[#1D1D1F] dark:group-hover:text-white transition-all shrink-0"
                    strokeWidth={2}
                  />
                </Link>
              );
            })}

          </div>

        </div>
      </section>

      {/* ==================== QUICK ACTIONS ==================== */}
      <section className="pb-12 md:pb-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-[1400px] mx-auto">

          <div className="bg-gradient-to-br from-[#1D1D1F] to-[#2C2C2E] dark:from-white dark:to-[#F5F5F7] rounded-2xl p-6 md:p-8 text-white dark:text-[#1D1D1F]">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

              <div className="max-w-lg">
                <div className="w-12 h-12 rounded-xl bg-white/10 dark:bg-[#1D1D1F]/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6" strokeWidth={2} />
                </div>
                <h3 className="font-display text-2xl md:text-3xl mb-2">
                  Continue Shopping
                </h3>
                <p className="text-white/70 dark:text-[#1D1D1F]/70 text-[13px] leading-relaxed">
                  Discover our latest collections — premium clothing,
                  signature fragrances, and artisan-crafted bags.
                </p>
              </div>

              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-[#1D1D1F] text-[#1D1D1F] dark:text-white rounded-xl text-[12px] tracking-[0.2em] uppercase font-medium hover:opacity-90 active:scale-[0.98] transition-all group shrink-0"
              >
                Shop Now
                <ArrowRight
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={2}
                />
              </Link>

            </div>

          </div>

        </div>
      </section>

      {/* ==================== LOGOUT (Mobile) ==================== */}
      <section className="pb-12 px-4 md:hidden">
        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="w-full flex items-center justify-center gap-2 py-4 border border-[#E5E5E7] dark:border-[#38383A] rounded-xl text-[12px] tracking-wider uppercase font-medium text-[#C62828] hover:bg-[#FFEBEE] transition-colors"
        >
          <LogOut className="w-4 h-4" strokeWidth={2} />
          Sign Out
        </button>
      </section>

      {/* ==================== FOOTER INFO ==================== */}
      <section className="pb-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-center gap-2 text-[11px] text-[#86868B]">
            <Shield className="w-3 h-3" strokeWidth={2} />
            <span>Your account is secured with JWT authentication</span>
          </div>
        </div>
      </section>

    </main>
  );
}