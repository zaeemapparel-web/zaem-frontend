"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Search,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  Package,
  DollarSign,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: any[];
  user?: { name: string; email: string };
}

const STATUS_OPTIONS = [
  { value: "", label: "All Orders" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "RETURNED", label: "Returned" },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-gold/10 text-gold",
  CONFIRMED: "bg-blue-50 text-blue-700",
  PROCESSING: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-purple-50 text-purple-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
  RETURNED: "bg-gray-100 text-gray-700",
};

export default function AdminOrdersPage() {
  const { loadFromStorage } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    delivered: 0,
    revenue: 0,
  });

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const fetchOrders = async () => {
    const token = localStorage.getItem("zaem_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const url = filterStatus
        ? `${API_URL}/api/orders/admin/all?status=${filterStatus}&limit=100`
        : `${API_URL}/api/orders/admin/all?limit=100`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setOrders(data.data.orders);

      // Fetch stats
      const statsRes = await fetch(`${API_URL}/api/orders/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats({
          total: statsData.data.stats.totalOrders,
          pending: statsData.data.stats.pendingOrders,
          delivered: statsData.data.stats.deliveredOrders,
          revenue: statsData.data.stats.totalRevenue,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const filteredOrders = orders.filter((o) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(searchLower) ||
      o.user?.name?.toLowerCase().includes(searchLower) ||
      o.user?.email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div>

      {/* Header */}
      <div className="mb-10">
        <p className="text-label text-gold mb-3">Manage</p>
        <h1 className="display-lg mb-3">Orders</h1>
        <p className="text-muted font-body text-sm">
          {orders.length} {orders.length === 1 ? "order" : "orders"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-ivory border border-ink/10 p-5">
          <DollarSign className="w-5 h-5 text-gold mb-4" strokeWidth={1.5} />
          <p className="font-display text-2xl mb-1">
            PKR {stats.revenue.toLocaleString()}
          </p>
          <p className="text-label text-muted">Total Revenue</p>
        </div>
        <div className="bg-ivory border border-ink/10 p-5">
          <Package className="w-5 h-5 text-blue-500 mb-4" strokeWidth={1.5} />
          <p className="font-display text-2xl mb-1">{stats.total}</p>
          <p className="text-label text-muted">Total Orders</p>
        </div>
        <div className="bg-ivory border border-ink/10 p-5">
          <Clock className="w-5 h-5 text-orange-500 mb-4" strokeWidth={1.5} />
          <p className="font-display text-2xl mb-1">{stats.pending}</p>
          <p className="text-label text-muted">Pending</p>
        </div>
        <div className="bg-ivory border border-ink/10 p-5">
          <CheckCircle
            className="w-5 h-5 text-green-500 mb-4"
            strokeWidth={1.5}
          />
          <p className="font-display text-2xl mb-1">{stats.delivered}</p>
          <p className="text-label text-muted">Delivered</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-ivory border border-ink/10 p-4 md:p-5 mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            strokeWidth={1.5}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number, customer..."
            className="w-full pl-11 pr-4 py-3 bg-transparent border border-ink/20 focus:border-gold outline-none text-sm font-body transition-colors"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 bg-transparent border border-ink/20 focus:border-gold outline-none text-sm font-body transition-colors"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Loading / Empty / List */}
      {loading ? (
        <div className="bg-ivory border border-ink/10 p-20 text-center">
          <p className="font-display text-2xl text-muted">Loading...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-ivory border border-ink/10 p-20 text-center">
          <p className="font-display text-2xl mb-4">No orders found.</p>
          <p className="text-muted font-body text-sm">
            Orders will appear here when customers place them.
          </p>
        </div>
      ) : (
        <>
          {/* ============ DESKTOP TABLE ============ */}
          <div className="hidden lg:block bg-ivory border border-ink/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink/10 bg-bone/50">
                  <th className="text-left p-4 text-label text-muted">Order</th>
                  <th className="text-left p-4 text-label text-muted">Customer</th>
                  <th className="text-left p-4 text-label text-muted">Items</th>
                  <th className="text-left p-4 text-label text-muted">Total</th>
                  <th className="text-left p-4 text-label text-muted">Payment</th>
                  <th className="text-left p-4 text-label text-muted">Status</th>
                  <th className="text-right p-4 text-label text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-ink/5 hover:bg-bone/30 transition-colors"
                  >
                    <td className="p-4">
                      <p className="font-display text-sm">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-muted font-body mt-1">
                        {new Date(order.createdAt).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-body">
                        {order.user?.name || "Guest"}
                      </p>
                      <p className="text-xs text-muted font-body mt-1">
                        {order.user?.email}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-body">
                        {order.items?.length || 0} items
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="font-display text-sm">
                        PKR {order.total.toLocaleString()}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-label">{order.paymentMethod}</p>
                      <p className="text-xs text-muted font-body mt-1">
                        {order.paymentStatus}
                      </p>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-label px-2 py-1 ${
                          STATUS_COLORS[order.status] || "bg-bone text-ink"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-2 text-label text-gold hover:text-ink transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ============ MOBILE CARDS ============ */}
          <div className="lg:hidden space-y-4">
            {filteredOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="block bg-ivory border border-ink/10 p-4 hover:border-gold transition-colors"
              >
                {/* Top Row */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-base mb-1 truncate">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-muted font-body">
                      {new Date(order.createdAt).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`text-label px-3 py-1 shrink-0 ${
                      STATUS_COLORS[order.status] || "bg-bone text-ink"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Customer */}
                <div className="mb-3 pb-3 border-b border-ink/10">
                  <p className="text-sm font-body">{order.user?.name || "Guest"}</p>
                  <p className="text-xs text-muted font-body mt-1">
                    {order.user?.email}
                  </p>
                </div>

                {/* Bottom Row */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-label text-muted">
                    <span>{order.items?.length || 0} items</span>
                    <span>·</span>
                    <span>{order.paymentMethod}</span>
                  </div>
                  <p className="font-display text-lg">
                    PKR {order.total.toLocaleString()}
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