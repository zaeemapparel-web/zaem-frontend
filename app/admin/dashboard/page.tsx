"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import {
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  DollarSign,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertCircle,
  Star,
  Truck,
  XCircle,
  RotateCcw,
  Calendar,
  Eye,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ==================== TYPES ====================
interface Stats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalUsers: number;
  totalProducts: number;
}

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  user?: { name: string; email: string };
  items?: any[];
}

interface ExtendedStats extends Stats {
  confirmedOrders?: number;
  processingOrders?: number;
  shippedOrders?: number;
  cancelledOrders?: number;
  returnedOrders?: number;
  todayOrders?: number;
  todayRevenue?: number;
  weekOrders?: number;
  weekRevenue?: number;
  monthOrders?: number;
  monthRevenue?: number;
}

// ==================== MAIN COMPONENT ====================
export default function AdminDashboard() {
  const { loadFromStorage } = useAuthStore();

  const [stats, setStats] = useState<ExtendedStats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================== INIT ====================
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("zaem_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const [statsRes, ordersRes] = await Promise.all([
          fetch(`${API_URL}/api/orders/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/orders/admin/all?limit=8`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const statsData = await statsRes.json();
        if (statsData.success) setStats(statsData.data.stats);

        const ordersData = await ordersRes.json();
        if (ordersData.success) setRecentOrders(ordersData.data.orders);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ==================== DERIVED DATA ====================
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const ordersToday = useMemo(
    () => recentOrders.filter((o) => new Date(o.createdAt) >= today).length,
    [recentOrders, today]
  );

  const revenueToday = useMemo(
    () =>
      recentOrders
        .filter((o) => new Date(o.createdAt) >= today)
        .reduce((sum, o) => sum + o.total, 0),
    [recentOrders, today]
  );

  const avgOrderValue = useMemo(
    () => (stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0),
    [stats.totalRevenue, stats.totalOrders]
  );

  const deliveryRate = useMemo(
    () =>
      stats.totalOrders > 0
        ? Math.round((stats.deliveredOrders / stats.totalOrders) * 100)
        : 0,
    [stats.deliveredOrders, stats.totalOrders]
  );

  const pendingRate = useMemo(
    () =>
      stats.totalOrders > 0
        ? Math.round((stats.pendingOrders / stats.totalOrders) * 100)
        : 0,
    [stats.pendingOrders, stats.totalOrders]
  );

  // ==================== STAT CARDS ====================
  const STAT_CARDS = [
    {
      label: "Total Revenue",
      value: `Rs. ${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      trend: "+12.5%",
      trendUp: true,
      accent: "text-[#2E7D32]",
      bg: "bg-[#E8F5E9]",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      trend: "+8.2%",
      trendUp: true,
      accent: "text-[#0A84FF]",
      bg: "bg-[#E3F2FD]",
    },
    {
      label: "Pending",
      value: stats.pendingOrders.toString(),
      icon: Clock,
      trend: `${pendingRate}%`,
      trendUp: false,
      accent: "text-[#E65100]",
      bg: "bg-[#FFF3E0]",
    },
    {
      label: "Delivered",
      value: stats.deliveredOrders.toString(),
      icon: CheckCircle,
      trend: `${deliveryRate}%`,
      trendUp: true,
      accent: "text-[#2E7D32]",
      bg: "bg-[#E8F5E9]",
    },
    {
      label: "Users",
      value: stats.totalUsers.toString(),
      icon: Users,
      trend: "+5.3%",
      trendUp: true,
      accent: "text-[#7B1FA2]",
      bg: "bg-[#F3E5F5]",
    },
    {
      label: "Products",
      value: stats.totalProducts.toString(),
      icon: Package,
      trend: "Active",
      trendUp: true,
      accent: "text-[#C2185B]",
      bg: "bg-[#FCE4EC]",
    },
  ];

  // ==================== STATUS BADGES ====================
  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      PENDING:
        "bg-[#FFF3E0] text-[#E65100] border-[#FFB74D]",
      CONFIRMED:
        "bg-[#E3F2FD] text-[#0A84FF] border-[#64B5F6]",
      PROCESSING:
        "bg-[#F3E5F5] text-[#7B1FA2] border-[#BA68C8]",
      SHIPPED:
        "bg-[#E0F7FA] text-[#00838F] border-[#4DD0E1]",
      DELIVERED:
        "bg-[#E8F5E9] text-[#2E7D32] border-[#81C784]",
      CANCELLED:
        "bg-[#FFEBEE] text-[#C62828] border-[#EF5350]",
      RETURNED:
        "bg-[#FAFAFA] text-[#6E6E73] border-[#BDBDBD]",
    };
    return badges[status] || "bg-[#F5F5F7] text-[#6E6E73] border-[#E5E5E7]";
  };

  // ==================== LOADING ====================
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <Loader2
            className="w-6 h-6 animate-spin text-[#86868B] mx-auto mb-3"
            strokeWidth={2}
          />
          <p className="text-[11px] tracking-[0.3em] uppercase text-[#86868B]">
            Loading
          </p>
        </div>
      </div>
    );
  }

  // ==================== RENDER ====================
  return (
    <div className="admin-fade-in">

      {/* ==================== HEADER ==================== */}
      <div className="mb-8 md:mb-10">
        <p className="text-[10px] tracking-[0.3em] uppercase text-[#86868B] font-medium mb-3">
          Dashboard
        </p>
        <h1 className="font-display text-3xl md:text-5xl lg:text-6xl text-[#1D1D1F] dark:text-white mb-3">
          Overview
        </h1>
        <p className="text-[#6E6E73] dark:text-[#98989D] font-body text-sm">
          Welcome back, Zaeem. Here&apos;s what&apos;s happening at ZAEM today.
        </p>
      </div>

      {/* ==================== ERROR ==================== */}
      {error && (
        <div className="mb-6 p-4 bg-[#FFEBEE] border-l-2 border-[#C62828] text-[#C62828] text-[13px] rounded-r-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" strokeWidth={2} />
          {error}
        </div>
      )}

      {/* ==================== TODAY'S SNAPSHOT ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Today's Orders */}
        <div className="admin-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#E3F2FD] flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-[#0A84FF]" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#86868B] font-medium mb-1">
              Today&apos;s Orders
            </p>
            <p className="font-display text-2xl text-[#1D1D1F] dark:text-white">
              {ordersToday}
            </p>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="admin-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#E8F5E9] flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-[#2E7D32]" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#86868B] font-medium mb-1">
              Today&apos;s Revenue
            </p>
            <p className="font-display text-2xl text-[#1D1D1F] dark:text-white truncate">
              Rs. {revenueToday.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="admin-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#F3E5F5] flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 text-[#7B1FA2]" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#86868B] font-medium mb-1">
              Avg. Order Value
            </p>
            <p className="font-display text-2xl text-[#1D1D1F] dark:text-white truncate">
              Rs. {Math.round(avgOrderValue).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* ==================== STAT CARDS ==================== */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4 mb-8 md:mb-10">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="admin-card p-4 md:p-5 group hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div
                  className={`w-9 h-9 md:w-10 md:h-10 rounded-lg ${card.bg} flex items-center justify-center shrink-0`}
                >
                  <Icon
                    className={`w-4 h-4 md:w-5 md:h-5 ${card.accent}`}
                    strokeWidth={2}
                  />
                </div>
                <span
                  className={`text-[10px] font-medium flex items-center gap-0.5 ${
                    card.trendUp ? "text-[#2E7D32]" : "text-[#E65100]"
                  }`}
                >
                  {card.trendUp ? (
                    <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" strokeWidth={2} />
                  )}
                  {card.trend}
                </span>
              </div>
              <p className="font-display text-lg md:text-2xl text-[#1D1D1F] dark:text-white mb-1 truncate">
                {card.value}
              </p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#86868B] font-medium">
                {card.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* ==================== MAIN GRID ==================== */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* ==================== RECENT ORDERS (2 COLUMNS) ==================== */}
        <div className="lg:col-span-2 admin-card overflow-hidden">
          <div className="flex items-center justify-between p-5 md:p-6 border-b border-[#E5E5E7] dark:border-[#38383A]">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#86868B] font-medium mb-1">
                Recent
              </p>
              <h2 className="font-display text-lg md:text-2xl text-[#1D1D1F] dark:text-white">
                Latest Orders
              </h2>
            </div>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-[11px] tracking-wider uppercase text-[#6E6E73] hover:text-[#1D1D1F] dark:hover:text-white transition-colors font-medium"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart
                  className="w-6 h-6 text-[#86868B]"
                  strokeWidth={1.5}
                />
              </div>
              <p className="font-display text-lg text-[#1D1D1F] dark:text-white mb-2">
                No orders yet
              </p>
              <p className="text-[12px] text-[#86868B]">
                Orders will appear here once customers start buying.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E5E5E7] dark:border-[#38383A] bg-[#FAFAFA] dark:bg-[#0A0A0A]">
                      <th className="text-left p-4 text-[10px] tracking-[0.15em] uppercase text-[#86868B] font-medium">
                        Order
                      </th>
                      <th className="text-left p-4 text-[10px] tracking-[0.15em] uppercase text-[#86868B] font-medium">
                        Customer
                      </th>
                      <th className="text-left p-4 text-[10px] tracking-[0.15em] uppercase text-[#86868B] font-medium">
                        Total
                      </th>
                      <th className="text-left p-4 text-[10px] tracking-[0.15em] uppercase text-[#86868B] font-medium">
                        Status
                      </th>
                      <th className="text-right p-4 text-[10px] tracking-[0.15em] uppercase text-[#86868B] font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-[#E5E5E7] dark:border-[#38383A] last:border-0 hover:bg-[#F5F5F7] dark:hover:bg-[#1C1C1E] transition-colors group"
                      >
                        <td className="p-4">
                          <p className="font-display text-sm text-[#1D1D1F] dark:text-white">
                            {order.orderNumber}
                          </p>
                          <p className="text-[11px] text-[#86868B] font-body mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString("en-PK", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="text-[13px] font-body font-medium text-[#1D1D1F] dark:text-white">
                            {order.user?.name || "Guest"}
                          </p>
                          <p className="text-[11px] text-[#86868B] font-body mt-0.5 truncate max-w-[180px]">
                            {order.user?.email}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="font-display text-sm text-[#1D1D1F] dark:text-white">
                            Rs. {order.total.toLocaleString()}
                          </p>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] tracking-wider uppercase font-medium px-2.5 py-1 rounded-md border ${getStatusBadge(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex items-center gap-1 text-[11px] tracking-wider uppercase text-[#6E6E73] hover:text-[#1D1D1F] dark:hover:text-white transition-colors font-medium"
                          >
                            <Eye className="w-3.5 h-3.5" strokeWidth={2} />
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-[#E5E5E7] dark:divide-[#38383A]">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="block p-4 hover:bg-[#F5F5F7] dark:hover:bg-[#1C1C1E] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="font-display text-sm text-[#1D1D1F] dark:text-white">
                        {order.orderNumber}
                      </p>
                      <span
                        className={`inline-flex items-center text-[9px] tracking-wider uppercase font-medium px-2 py-0.5 rounded border shrink-0 ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-[13px] font-body text-[#1D1D1F] dark:text-white mb-1">
                      {order.user?.name || "Guest"}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-display text-base text-[#1D1D1F] dark:text-white">
                        Rs. {order.total.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-[#86868B] font-body">
                        {new Date(order.createdAt).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ==================== SIDEBAR ==================== */}
        <div className="space-y-5">

          {/* Order Status Breakdown */}
          <div className="admin-card p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg text-[#1D1D1F] dark:text-white">
                Order Status
              </h3>
              <Link
                href="/admin/orders"
                className="text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
              >
                <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
              </Link>
            </div>

            <div className="space-y-3">
              {[
                {
                  label: "Pending",
                  value: stats.pendingOrders,
                  icon: Clock,
                  color: "text-[#E65100]",
                  bg: "bg-[#FFF3E0]",
                },
                {
                  label: "Delivered",
                  value: stats.deliveredOrders,
                  icon: CheckCircle,
                  color: "text-[#2E7D32]",
                  bg: "bg-[#E8F5E9]",
                },
                {
                  label: "Cancelled",
                  value: stats.cancelledOrders || 0,
                  icon: XCircle,
                  color: "text-[#C62828]",
                  bg: "bg-[#FFEBEE]",
                },
                {
                  label: "Returned",
                  value: stats.returnedOrders || 0,
                  icon: RotateCcw,
                  color: "text-[#6E6E73]",
                  bg: "bg-[#F5F5F7]",
                },
              ].map((item) => {
                const Icon = item.icon;
                const percent =
                  stats.totalOrders > 0
                    ? Math.round((item.value / stats.totalOrders) * 100)
                    : 0;

                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-md ${item.bg} flex items-center justify-center`}
                        >
                          <Icon
                            className={`w-3.5 h-3.5 ${item.color}`}
                            strokeWidth={2}
                          />
                        </div>
                        <span className="text-[12px] font-body text-[#1D1D1F] dark:text-white">
                          {item.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#86868B]">
                          {percent}%
                        </span>
                        <span className="font-display text-sm text-[#1D1D1F] dark:text-white w-8 text-right">
                          {item.value}
                        </span>
                      </div>
                    </div>
                    <div className="h-1 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.label === "Delivered"
                            ? "bg-[#2E7D32]"
                            : item.label === "Pending"
                            ? "bg-[#E65100]"
                            : item.label === "Cancelled"
                            ? "bg-[#C62828]"
                            : "bg-[#86868B]"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="admin-card p-5">
            <h3 className="font-display text-lg text-[#1D1D1F] dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link
                href="/admin/products/new"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#F5F5F7] dark:bg-[#1C1C1E] hover:bg-[#E5E5E7] dark:hover:bg-[#2C2C2E] transition-colors group"
              >
                <div className="w-8 h-8 rounded-md bg-[#1D1D1F] dark:bg-white flex items-center justify-center shrink-0">
                  <Package
                    className="w-4 h-4 text-white dark:text-[#1D1D1F]"
                    strokeWidth={2}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white">
                    Add Product
                  </p>
                  <p className="text-[11px] text-[#86868B]">
                    Create a new listing
                  </p>
                </div>
                <ArrowRight
                  className="w-4 h-4 text-[#86868B] group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={2}
                />
              </Link>

              <Link
                href="/admin/orders"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#F5F5F7] dark:bg-[#1C1C1E] hover:bg-[#E5E5E7] dark:hover:bg-[#2C2C2E] transition-colors group"
              >
                <div className="w-8 h-8 rounded-md bg-[#0A84FF] flex items-center justify-center shrink-0">
                  <Truck
                    className="w-4 h-4 text-white"
                    strokeWidth={2}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white">
                    Manage Orders
                  </p>
                  <p className="text-[11px] text-[#86868B]">
                    {stats.pendingOrders} pending
                  </p>
                </div>
                <ArrowRight
                  className="w-4 h-4 text-[#86868B] group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={2}
                />
              </Link>

              <Link
                href="/admin/products"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#F5F5F7] dark:bg-[#1C1C1E] hover:bg-[#E5E5E7] dark:hover:bg-[#2C2C2E] transition-colors group"
              >
                <div className="w-8 h-8 rounded-md bg-[#7B1FA2] flex items-center justify-center shrink-0">
                  <ShoppingCart
                    className="w-4 h-4 text-white"
                    strokeWidth={2}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white">
                    View Products
                  </p>
                  <p className="text-[11px] text-[#86868B]">
                    {stats.totalProducts} active
                  </p>
                </div>
                <ArrowRight
                  className="w-4 h-4 text-[#86868B] group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={2}
                />
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}