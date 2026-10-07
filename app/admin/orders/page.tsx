"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  Package,
  DollarSign,
  X,
  Loader2,
  AlertCircle,
  TrendingUp,
  Calendar,
  Filter,
  ChevronDown,
  ShoppingBag,
  User,
  ArrowRight,
  RotateCcw,
  Boxes,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ==================== TYPES ====================
interface Order {
  id: string;
  orderNumber: string;
  total: number;
  subtotal?: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: any[];
  user?: { name: string; email: string; phone?: string };
  address?: any;
}

type DateFilter = "all" | "today" | "week" | "month";

// ==================== STATUS OPTIONS ====================
const STATUS_OPTIONS = [
  { value: "", label: "All Orders", icon: Package },
  { value: "PENDING", label: "Pending", icon: Clock },
  { value: "CONFIRMED", label: "Confirmed", icon: CheckCircle },
  { value: "PROCESSING", label: "Processing", icon: Boxes },
  { value: "SHIPPED", label: "Shipped", icon: Truck },
  { value: "DELIVERED", label: "Delivered", icon: CheckCircle },
  { value: "CANCELLED", label: "Cancelled", icon: XCircle },
  { value: "RETURNED", label: "Returned", icon: RotateCcw },
];

// ==================== STATUS COLORS ====================
const getStatusStyle = (status: string) => {
  const styles: Record<string, string> = {
    PENDING: "bg-[#FFF3E0] text-[#E65100] border-[#FFB74D]",
    CONFIRMED: "bg-[#E3F2FD] text-[#0A84FF] border-[#64B5F6]",
    PROCESSING: "bg-[#F3E5F5] text-[#7B1FA2] border-[#BA68C8]",
    SHIPPED: "bg-[#E0F7FA] text-[#00838F] border-[#4DD0E1]",
    DELIVERED: "bg-[#E8F5E9] text-[#2E7D32] border-[#81C784]",
    CANCELLED: "bg-[#FFEBEE] text-[#C62828] border-[#EF5350]",
    RETURNED: "bg-[#F5F5F7] text-[#6E6E73] border-[#BDBDBD] dark:bg-[#2C2C2E] dark:text-[#98989D] dark:border-[#48484A]",
  };
  return (
    styles[status] ||
    "bg-[#F5F5F7] text-[#6E6E73] border-[#E5E5E7] dark:bg-[#2C2C2E] dark:text-[#98989D] dark:border-[#48484A]"
  );
};

// ==================== MAIN COMPONENT ====================
export default function AdminOrdersPage() {
  const { loadFromStorage } = useAuthStore();

  // ==================== STATE ====================
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    delivered: 0,
    cancelled: 0,
    revenue: 0,
    todayRevenue: 0,
    todayOrders: 0,
  });

  // ==================== INIT ====================
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // ==================== FETCH ====================
  const fetchOrders = async () => {
    const token = localStorage.getItem("zaem_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const url = filterStatus
        ? `${API_URL}/api/orders/admin/all?status=${filterStatus}&limit=200`
        : `${API_URL}/api/orders/admin/all?limit=200`;

      const [ordersRes, statsRes] = await Promise.all([
        fetch(url, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/orders/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const ordersData = await ordersRes.json();
      if (ordersData.success) setOrders(ordersData.data.orders);

      const statsData = await statsRes.json();
      if (statsData.success) {
        const s = statsData.data.stats;
        setStats({
          total: s.totalOrders,
          pending: s.pendingOrders,
          delivered: s.deliveredOrders,
          cancelled: s.cancelledOrders || 0,
          revenue: s.totalRevenue,
          todayRevenue: s.todayRevenue || 0,
          todayOrders: s.todayOrders || 0,
        });
      }
    } catch (error) {
      console.error(error);
      showToast("error", "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  // ==================== TOAST ====================
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // ==================== FILTERS ====================
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Search
      if (search) {
        const s = search.toLowerCase();
        const matchesSearch =
          o.orderNumber.toLowerCase().includes(s) ||
          o.user?.name?.toLowerCase().includes(s) ||
          o.user?.email?.toLowerCase().includes(s) ||
          o.user?.phone?.includes(s);
        if (!matchesSearch) return false;
      }

      // Date filter
      if (dateFilter !== "all") {
        const orderDate = new Date(o.createdAt);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (dateFilter === "today" && orderDate < today) return false;
        if (dateFilter === "week") {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (orderDate < weekAgo) return false;
        }
        if (dateFilter === "month") {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          if (orderDate < monthAgo) return false;
        }
      }

      return true;
    });
  }, [orders, search, dateFilter]);

  const hasActiveFilters =
    !!search || !!filterStatus || dateFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("");
    setDateFilter("all");
  };

  const currentStatusLabel =
    STATUS_OPTIONS.find((s) => s.value === filterStatus)?.label || "All Orders";

  // ==================== STAT CARDS ====================
  const STAT_CARDS = [
    {
      label: "Total Revenue",
      value: `Rs. ${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      accent: "text-[#2E7D32]",
      bg: "bg-[#E8F5E9]",
    },
    {
      label: "Total Orders",
      value: stats.total.toString(),
      icon: Package,
      accent: "text-[#0A84FF]",
      bg: "bg-[#E3F2FD]",
    },
    {
      label: "Pending",
      value: stats.pending.toString(),
      icon: Clock,
      accent: "text-[#E65100]",
      bg: "bg-[#FFF3E0]",
    },
    {
      label: "Delivered",
      value: stats.delivered.toString(),
      icon: CheckCircle,
      accent: "text-[#2E7D32]",
      bg: "bg-[#E8F5E9]",
    },
  ];

  // ==================== RENDER ====================
  return (
    <div className="admin-fade-in">

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
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#86868B] font-medium mb-3">
            Manage
          </p>
          <h1 className="font-display text-3xl md:text-5xl lg:text-6xl text-[#1D1D1F] dark:text-white mb-3">
            Orders
          </h1>
          <p className="text-[#6E6E73] dark:text-[#98989D] font-body text-sm">
            {filteredOrders.length} {filteredOrders.length === 1 ? "order" : "orders"}
            {hasActiveFilters && ` · filtered from ${orders.length}`}
          </p>
        </div>
      </div>

      {/* ==================== STATS CARDS ==================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="admin-card p-4 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div
                className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3`}
              >
                <Icon
                  className={`w-5 h-5 ${card.accent}`}
                  strokeWidth={2}
                />
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

      {/* ==================== FILTERS BAR ==================== */}
      <div className="admin-card p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">

          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B]"
              strokeWidth={2}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order number, customer, email..."
              className="admin-input pl-10"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] rounded-full transition-colors"
              >
                <X className="w-3.5 h-3.5 text-[#86868B]" strokeWidth={2} />
              </button>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="relative lg:min-w-[200px]">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="admin-input flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2 text-[13px]">
                <Filter className="w-3.5 h-3.5 text-[#86868B]" strokeWidth={2} />
                {currentStatusLabel}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#86868B] transition-transform ${
                  showStatusDropdown ? "rotate-180" : ""
                }`}
                strokeWidth={2}
              />
            </button>

            {showStatusDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowStatusDropdown(false)}
                />
                <div className="absolute left-0 lg:left-auto lg:right-0 top-full mt-2 w-56 bg-white dark:bg-[#1C1C1E] border border-[#E5E5E7] dark:border-[#38383A] rounded-xl shadow-xl z-20 py-2 overflow-hidden admin-scale-in">
                  {STATUS_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setFilterStatus(opt.value);
                          setShowStatusDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-[13px] font-body flex items-center justify-between transition-colors ${
                          filterStatus === opt.value
                            ? "bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white"
                            : "text-[#6E6E73] dark:text-[#98989D] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                          {opt.label}
                        </span>
                        {filterStatus === opt.value && (
                          <CheckCircle
                            className="w-3.5 h-3.5 text-[#0A84FF]"
                            strokeWidth={2}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-lg p-1">
            {[
              { value: "all", label: "All" },
              { value: "today", label: "Today" },
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDateFilter(opt.value as DateFilter)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-medium tracking-wide uppercase transition-all ${
                  dateFilter === opt.value
                    ? "bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-sm"
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
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E5E5E7] dark:border-[#38383A] flex-wrap">
            <span className="text-[10px] tracking-wider uppercase text-[#86868B] font-medium">
              Filters:
            </span>
            {search && (
              <span className="admin-badge admin-badge-neutral">
                Search: {search}
              </span>
            )}
            {filterStatus && (
              <span className="admin-badge admin-badge-neutral">
                Status: {filterStatus}
              </span>
            )}
            {dateFilter !== "all" && (
              <span className="admin-badge admin-badge-neutral">
                Date: {dateFilter}
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-[11px] text-[#0A84FF] hover:underline font-medium ml-auto"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ==================== LOADING ==================== */}
      {loading ? (
        <div className="admin-card p-20 text-center">
          <Loader2
            className="w-6 h-6 text-[#86868B] animate-spin mx-auto mb-3"
            strokeWidth={2}
          />
          <p className="text-[11px] tracking-[0.3em] uppercase text-[#86868B]">
            Loading Orders
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        /* ==================== EMPTY STATE ==================== */
        <div className="admin-card p-16 text-center">
          <div className="w-16 h-16 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-6 h-6 text-[#86868B]" strokeWidth={1.5} />
          </div>
          <h3 className="font-display text-xl text-[#1D1D1F] dark:text-white mb-2">
            {hasActiveFilters ? "No orders match" : "No orders yet"}
          </h3>
          <p className="text-[13px] text-[#86868B] mb-6 max-w-md mx-auto">
            {hasActiveFilters
              ? "Try adjusting your filters or search terms"
              : "Orders will appear here when customers place them"}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="admin-btn admin-btn-secondary"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ==================== DESKTOP TABLE ==================== */}
          <div className="hidden lg:block admin-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E5E7] dark:border-[#38383A] bg-[#FAFAFA] dark:bg-[#0A0A0A]">
                    <th className="text-left p-3 text-[10px] tracking-[0.15em] uppercase text-[#86868B] font-medium">
                      Order
                    </th>
                    <th className="text-left p-3 text-[10px] tracking-[0.15em] uppercase text-[#86868B] font-medium">
                      Customer
                    </th>
                    <th className="text-left p-3 text-[10px] tracking-[0.15em] uppercase text-[#86868B] font-medium">
                      Items
                    </th>
                    <th className="text-left p-3 text-[10px] tracking-[0.15em] uppercase text-[#86868B] font-medium">
                      Total
                    </th>
                    <th className="text-left p-3 text-[10px] tracking-[0.15em] uppercase text-[#86868B] font-medium">
                      Payment
                    </th>
                    <th className="text-left p-3 text-[10px] tracking-[0.15em] uppercase text-[#86868B] font-medium">
                      Status
                    </th>
                    <th className="text-right p-3 text-[10px] tracking-[0.15em] uppercase text-[#86868B] font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-[#E5E5E7] dark:border-[#38383A] last:border-0 hover:bg-[#FAFAFA] dark:hover:bg-[#1C1C1E] transition-colors"
                    >
                      <td className="p-3">
                        <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white">
                          {order.orderNumber}
                        </p>
                        <p className="text-[11px] text-[#86868B] mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-PK", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] flex items-center justify-center shrink-0">
                            <User className="w-3.5 h-3.5 text-[#86868B]" strokeWidth={2} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white truncate max-w-[160px]">
                              {order.user?.name || "Guest"}
                            </p>
                            <p className="text-[11px] text-[#86868B] truncate max-w-[160px]">
                              {order.user?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-[12px] text-[#6E6E73] dark:text-[#98989D]">
                          {order.items?.length || 0} items
                        </span>
                      </td>
                      <td className="p-3">
                        <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white">
                          Rs. {order.total.toLocaleString()}
                        </p>
                      </td>
                      <td className="p-3">
                        <p className="text-[11px] tracking-wider uppercase text-[#1D1D1F] dark:text-white font-medium">
                          {order.paymentMethod}
                        </p>
                        <p
                          className={`text-[10px] mt-0.5 font-medium ${
                            order.paymentStatus === "PAID"
                              ? "text-[#2E7D32]"
                              : order.paymentStatus === "FAILED"
                              ? "text-[#C62828]"
                              : "text-[#E65100]"
                          }`}
                        >
                          {order.paymentStatus}
                        </p>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] tracking-wider uppercase font-medium px-2.5 py-1 rounded-md border ${getStatusStyle(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1.5 text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
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
          </div>

          {/* ==================== MOBILE CARDS ==================== */}
          <div className="lg:hidden space-y-3">
            {filteredOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="block admin-card p-4 hover:border-[#D2D2D7] dark:hover:border-[#48484A] transition-colors"
              >
                {/* Top Row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white mb-1 truncate">
                      {order.orderNumber}
                    </p>
                    <p className="text-[11px] text-[#86868B]">
                      {new Date(order.createdAt).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center text-[9px] tracking-wider uppercase font-medium px-2 py-1 rounded-md border shrink-0 ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Customer */}
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#E5E5E7] dark:border-[#38383A]">
                  <div className="w-8 h-8 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5 text-[#86868B]" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white truncate">
                      {order.user?.name || "Guest"}
                    </p>
                    <p className="text-[11px] text-[#86868B] truncate">
                      {order.user?.email}
                    </p>
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[11px] text-[#86868B]">
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" strokeWidth={2} />
                      {order.items?.length || 0} items
                    </span>
                    <span>·</span>
                    <span className="uppercase tracking-wider font-medium">
                      {order.paymentMethod}
                    </span>
                  </div>
                  <p className="text-[15px] font-medium text-[#1D1D1F] dark:text-white">
                    Rs. {order.total.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

    </div>
  );
}