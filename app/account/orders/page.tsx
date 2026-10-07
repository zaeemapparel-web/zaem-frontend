"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  ChevronRight,
  Loader2,
  Search,
  X,
  Filter,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  RotateCcw,
  Eye,
  ArrowRight,
  ShoppingBag,
  AlertCircle,
  Boxes,
  DollarSign,
  Home,
  Download,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ==================== TYPES ====================
interface OrderItem {
  id: string;
  name: string;
  image?: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  subtotal: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
}

type StatusFilter =
  | "all"
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

type DateFilter = "all" | "month" | "3months" | "year";

// ==================== STATUS CONFIG ====================
const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    icon: any;
    color: string;
    bg: string;
    border: string;
  }
> = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    color: "text-[#E65100]",
    bg: "bg-[#FFF3E0]",
    border: "border-[#FFB74D]",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: CheckCircle,
    color: "text-[#0A84FF]",
    bg: "bg-[#E3F2FD]",
    border: "border-[#64B5F6]",
  },
  PROCESSING: {
    label: "Processing",
    icon: Boxes,
    color: "text-[#7B1FA2]",
    bg: "bg-[#F3E5F5]",
    border: "border-[#BA68C8]",
  },
  SHIPPED: {
    label: "Shipped",
    icon: Truck,
    color: "text-[#00838F]",
    bg: "bg-[#E0F7FA]",
    border: "border-[#4DD0E1]",
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle,
    color: "text-[#2E7D32]",
    bg: "bg-[#E8F5E9]",
    border: "border-[#81C784]",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-[#C62828]",
    bg: "bg-[#FFEBEE]",
    border: "border-[#EF5350]",
  },
  RETURNED: {
    label: "Returned",
    icon: RotateCcw,
    color: "text-[#6E6E73]",
    bg: "bg-[#F5F5F7]",
    border: "border-[#BDBDBD]",
  },
};

// ==================== STATUS TABS ====================
const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All Orders" },
  { value: "PENDING", label: "Pending" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

// ==================== MAIN COMPONENT ====================
export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  // ==================== FETCH ORDERS ====================
  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("zaem_token");
      if (!token) {
        router.push("/account/login");
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setOrders(data.data.orders || []);
        } else {
          setError(data.message || "Failed to load orders");
        }
      } catch (err) {
        console.error(err);
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [router]);

  // ==================== STATS ====================
  const stats = useMemo(() => {
    const total = orders.length;
    const totalSpent = orders
      .filter((o) => o.status !== "CANCELLED" && o.status !== "RETURNED")
      .reduce((sum, o) => sum + o.total, 0);
    const pending = orders.filter((o) =>
      ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"].includes(o.status)
    ).length;
    const delivered = orders.filter((o) => o.status === "DELIVERED").length;

    return { total, totalSpent, pending, delivered };
  }, [orders]);

  // ==================== FILTERS ====================
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search
      if (search) {
        const s = search.toLowerCase();
        const matchesSearch =
          order.orderNumber.toLowerCase().includes(s) ||
          order.items?.some((item) =>
            item.name.toLowerCase().includes(s)
          );
        if (!matchesSearch) return false;
      }

      // Status
      if (statusFilter !== "all" && order.status !== statusFilter) {
        return false;
      }

      // Date
      if (dateFilter !== "all") {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        const diffDays =
          (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);

        if (dateFilter === "month" && diffDays > 30) return false;
        if (dateFilter === "3months" && diffDays > 90) return false;
        if (dateFilter === "year" && diffDays > 365) return false;
      }

      return true;
    });
  }, [orders, search, statusFilter, dateFilter]);

  const hasActiveFilters =
    !!search || statusFilter !== "all" || dateFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDateFilter("all");
  };

  // ==================== STATUS COUNT ====================
  const getStatusCount = (status: StatusFilter) => {
    if (status === "all") return orders.length;
    return orders.filter((o) => o.status === status).length;
  };

  // ==================== FORMAT DATE ====================
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ==================== LOADING ====================
  if (loading) {
    return (
      <main className="bg-[#FAFAFA] dark:bg-black min-h-screen">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-16 pt-12 md:pt-20">
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <Loader2
                className="w-6 h-6 text-[#86868B] animate-spin mx-auto mb-3"
                strokeWidth={2}
              />
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#86868B]">
                Loading Orders
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ==================== RENDER ====================
  return (
    <main className="bg-[#FAFAFA] dark:bg-black min-h-screen">

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
            <span className="text-[#1D1D1F] dark:text-white">My Orders</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#86868B] font-medium mb-3">
                Order History
              </p>
              <h1 className="font-display text-3xl md:text-5xl lg:text-6xl text-[#1D1D1F] dark:text-white mb-3">
                My Orders
              </h1>
              <p className="text-[#6E6E73] dark:text-[#98989D] text-sm md:text-base font-body">
                Track, manage, and reorder your purchases
              </p>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-xl text-[11px] tracking-wider uppercase font-medium hover:opacity-90 active:scale-[0.98] transition-all shrink-0"
            >
              <ShoppingBag className="w-4 h-4" strokeWidth={2} />
              Continue Shopping
            </Link>
          </div>

        </div>
      </section>

      {/* ==================== STATS ==================== */}
      {orders.length > 0 && (
        <section className="py-6 md:py-8 px-4 md:px-8 lg:px-16">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Total Orders */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A] p-4">
                <div className="w-9 h-9 rounded-lg bg-[#E3F2FD] flex items-center justify-center mb-3">
                  <ShoppingBag
                    className="w-4 h-4 text-[#0A84FF]"
                    strokeWidth={2}
                  />
                </div>
                <p className="font-display text-xl md:text-2xl text-[#1D1D1F] dark:text-white mb-0.5">
                  {stats.total}
                </p>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#86868B] font-medium">
                  Total Orders
                </p>
              </div>

              {/* Total Spent */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A] p-4">
                <div className="w-9 h-9 rounded-lg bg-[#E8F5E9] flex items-center justify-center mb-3">
                  <DollarSign
                    className="w-4 h-4 text-[#2E7D32]"
                    strokeWidth={2}
                  />
                </div>
                <p className="font-display text-xl md:text-2xl text-[#1D1D1F] dark:text-white mb-0.5 truncate">
                  Rs. {stats.totalSpent.toLocaleString()}
                </p>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#86868B] font-medium">
                  Total Spent
                </p>
              </div>

              {/* In Progress */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A] p-4">
                <div className="w-9 h-9 rounded-lg bg-[#FFF3E0] flex items-center justify-center mb-3">
                  <Truck
                    className="w-4 h-4 text-[#E65100]"
                    strokeWidth={2}
                  />
                </div>
                <p className="font-display text-xl md:text-2xl text-[#1D1D1F] dark:text-white mb-0.5">
                  {stats.pending}
                </p>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#86868B] font-medium">
                  In Progress
                </p>
              </div>

              {/* Delivered */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A] p-4">
                <div className="w-9 h-9 rounded-lg bg-[#E8F5E9] flex items-center justify-center mb-3">
                  <CheckCircle
                    className="w-4 h-4 text-[#2E7D32]"
                    strokeWidth={2}
                  />
                </div>
                <p className="font-display text-xl md:text-2xl text-[#1D1D1F] dark:text-white mb-0.5">
                  {stats.delivered}
                </p>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#86868B] font-medium">
                  Delivered
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================== FILTERS ==================== */}
      {orders.length > 0 && (
        <section className="pb-6 px-4 md:px-8 lg:px-16">
          <div className="max-w-[1400px] mx-auto">

            {/* Status Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide mb-4 pb-1">
              {STATUS_TABS.map((tab) => {
                const count = getStatusCount(tab.value);
                const isActive = statusFilter === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setStatusFilter(tab.value)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] tracking-wider uppercase font-medium whitespace-nowrap shrink-0 transition-all ${
                      isActive
                        ? "bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F]"
                        : "bg-white dark:bg-[#1C1C1E] text-[#6E6E73] dark:text-[#98989D] border border-[#E5E5E7] dark:border-[#38383A] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]"
                    }`}
                  >
                    {tab.label}
                    {count > 0 && (
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                          isActive
                            ? "bg-white/20 dark:bg-[#1D1D1F]/20"
                            : "bg-[#F5F5F7] dark:bg-[#2C2C2E]"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search + Date Filter */}
            <div className="flex flex-col md:flex-row gap-3">

              {/* Search */}
              <div className="flex-1 relative">
                <Search
                  className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B] pointer-events-none"
                  strokeWidth={2}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by order number or product..."
                  className="w-full h-12 bg-white dark:bg-[#1C1C1E] border border-[#E5E5E7] dark:border-[#38383A] rounded-xl pl-10 pr-10 text-[13px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:border-[#1D1D1F] dark:focus:border-white focus:shadow-[0_0_0_4px_rgba(29,29,31,0.06)] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.06)] transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors"
                    aria-label="Clear search"
                  >
                    <X
                      className="w-3.5 h-3.5 text-[#86868B]"
                      strokeWidth={2}
                    />
                  </button>
                )}
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-1 bg-white dark:bg-[#1C1C1E] border border-[#E5E5E7] dark:border-[#38383A] rounded-xl p-1 shrink-0">
                {[
                  { value: "all", label: "All Time" },
                  { value: "month", label: "30d" },
                  { value: "3months", label: "90d" },
                  { value: "year", label: "1y" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDateFilter(opt.value as DateFilter)}
                    className={`px-3 py-2 rounded-lg text-[11px] font-medium tracking-wide transition-all whitespace-nowrap ${
                      dateFilter === opt.value
                        ? "bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F]"
                        : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-[10px] tracking-wider uppercase text-[#86868B] font-medium">
                  Filters:
                </span>
                {search && (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#6E6E73] dark:text-[#98989D] px-2 py-1 rounded-md">
                    Search: {search}
                  </span>
                )}
                {statusFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#6E6E73] dark:text-[#98989D] px-2 py-1 rounded-md">
                    Status: {statusFilter}
                  </span>
                )}
                {dateFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#6E6E73] dark:text-[#98989D] px-2 py-1 rounded-md">
                    Date: {dateFilter}
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-[11px] text-[#0A84FF] hover:underline font-medium"
                >
                  Clear all
                </button>
              </div>
            )}

          </div>
        </section>
      )}

      {/* ==================== ORDERS LIST ==================== */}
      <section className="pb-16 md:pb-24 px-4 md:px-8 lg:px-16">
        <div className="max-w-[1400px] mx-auto">

          {error ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-[#FFEBEE] rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle
                  className="w-6 h-6 text-[#C62828]"
                  strokeWidth={2}
                />
              </div>
              <p className="font-display text-xl text-[#1D1D1F] dark:text-white mb-2">
                Something went wrong
              </p>
              <p className="text-[13px] text-[#6E6E73] dark:text-[#98989D] mb-6">
                {error}
              </p>
              <Link
                href="/account"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-xl text-[11px] tracking-wider uppercase font-medium hover:opacity-90 transition-all"
              >
                Back to Account
              </Link>
            </div>
          ) : orders.length === 0 ? (
            /* ==================== EMPTY STATE ==================== */
            <div className="text-center py-20 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A] px-6">
              <div className="w-20 h-20 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-full flex items-center justify-center mx-auto mb-5">
                <Package
                  className="w-8 h-8 text-[#86868B]"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="font-display text-2xl md:text-3xl text-[#1D1D1F] dark:text-white mb-3">
                No orders yet
              </h3>
              <p className="text-[14px] text-[#6E6E73] dark:text-[#98989D] mb-8 max-w-md mx-auto leading-relaxed">
                Start shopping to place your first order. We'll keep all your
                order history right here.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-xl text-[12px] tracking-[0.2em] uppercase font-medium hover:opacity-90 active:scale-[0.98] transition-all group"
              >
                <ShoppingBag className="w-4 h-4" strokeWidth={2} />
                Start Shopping
                <ArrowRight
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={2}
                />
              </Link>
            </div>
          ) : filteredOrders.length === 0 ? (
            /* ==================== NO FILTER MATCH ==================== */
            <div className="text-center py-20 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A] px-6">
              <div className="w-20 h-20 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-full flex items-center justify-center mx-auto mb-5">
                <Search
                  className="w-8 h-8 text-[#86868B]"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="font-display text-2xl text-[#1D1D1F] dark:text-white mb-3">
                No orders match
              </h3>
              <p className="text-[14px] text-[#6E6E73] dark:text-[#98989D] mb-6 max-w-md mx-auto">
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white rounded-xl text-[11px] tracking-wider uppercase font-medium hover:bg-[#E5E5E7] dark:hover:bg-[#38383A] transition-all"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            /* ==================== ORDERS ==================== */
            <>
              <p className="text-[11px] tracking-wider uppercase text-[#86868B] font-medium mb-4">
                Showing {filteredOrders.length}{" "}
                {filteredOrders.length === 1 ? "order" : "orders"}
              </p>

              <div className="space-y-3 md:space-y-4">
                {filteredOrders.map((order) => {
                  const statusConfig =
                    STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                  const StatusIcon = statusConfig.icon;

                  return (
                    <Link
                      key={order.id}
                      href={`/account/orders/${order.id}`}
                      className="block bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A] hover:border-[#D2D2D7] dark:hover:border-[#48484A] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group"
                    >
                      <div className="flex flex-col md:flex-row">

                        {/* ============ LEFT (ORDER INFO) ============ */}
                        <div className="flex-1 p-4 md:p-5 min-w-0">

                          {/* Header Row */}
                          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                            <div className="flex items-center gap-3 min-w-0">
                              <p className="text-[13px] md:text-[14px] font-medium text-[#1D1D1F] dark:text-white truncate">
                                {order.orderNumber}
                              </p>
                              <span
                                className={`inline-flex items-center gap-1 text-[9px] tracking-wider uppercase font-medium px-2 py-0.5 rounded border shrink-0 ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}
                              >
                                <StatusIcon
                                  className="w-2.5 h-2.5"
                                  strokeWidth={2.5}
                                />
                                {statusConfig.label}
                              </span>
                            </div>

                            <p className="text-[11px] text-[#86868B] flex items-center gap-1.5 shrink-0">
                              <Calendar className="w-3 h-3" strokeWidth={2} />
                              {formatDate(order.createdAt)}
                            </p>
                          </div>

                          {/* Product Images + Items */}
                          <div className="flex items-center gap-4">

                            {/* Image stack */}
                            <div className="flex -space-x-3 shrink-0">
                              {order.items?.slice(0, 3).map((item, idx) => (
                                <div
                                  key={idx}
                                  className="w-14 h-16 md:w-16 md:h-20 rounded-lg bg-[#F5F5F7] dark:bg-[#2C2C2E] border-2 border-white dark:border-[#1C1C1E] overflow-hidden"
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
                                <div className="w-14 h-16 md:w-16 md:h-20 rounded-lg bg-[#F5F5F7] dark:bg-[#2C2C2E] border-2 border-white dark:border-[#1C1C1E] flex items-center justify-center text-[11px] font-medium text-[#6E6E73] dark:text-[#98989D]">
                                  +{order.items.length - 3}
                                </div>
                              )}
                            </div>

                            {/* Item names */}
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] text-[#1D1D1F] dark:text-white mb-1 line-clamp-1">
                                {order.items?.[0]?.name || "Order Item"}
                              </p>
                              <p className="text-[11px] text-[#86868B]">
                                {order.items?.length || 0}{" "}
                                {order.items?.length === 1 ? "item" : "items"}
                                {order.items?.[0]?.size &&
                                  ` · Size ${order.items[0].size}`}
                              </p>
                              {order.paymentMethod && (
                                <p className="text-[10px] tracking-wider uppercase text-[#86868B] font-medium mt-1">
                                  {order.paymentMethod}
                                </p>
                              )}
                            </div>

                          </div>

                        </div>

                        {/* ============ RIGHT (PRICE + CTA) ============ */}
                        <div className="flex md:flex-col items-center md:items-end md:justify-between gap-4 md:gap-3 p-4 md:p-5 md:border-l border-t md:border-t-0 border-[#E5E5E7] dark:border-[#38383A] bg-[#FAFAFA] dark:bg-[#0A0A0A] md:bg-transparent md:dark:bg-transparent">

                          <div className="text-left md:text-right flex-1 md:flex-none">
                            <p className="text-[10px] tracking-[0.2em] uppercase text-[#86868B] font-medium mb-1">
                              Total
                            </p>
                            <p className="font-display text-xl md:text-2xl text-[#1D1D1F] dark:text-white">
                              Rs. {order.total.toLocaleString()}
                            </p>
                          </div>

                          <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1C1C1E] border border-[#E5E5E7] dark:border-[#38383A] rounded-xl text-[11px] tracking-wider uppercase font-medium text-[#1D1D1F] dark:text-white group-hover:bg-[#1D1D1F] dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-[#1D1D1F] group-hover:border-[#1D1D1F] dark:group-hover:border-white transition-all">
                            <Eye className="w-3.5 h-3.5" strokeWidth={2} />
                            View
                            <ChevronRight
                              className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
                              strokeWidth={2}
                            />
                          </div>

                        </div>

                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}

        </div>
      </section>

    </main>
  );
}