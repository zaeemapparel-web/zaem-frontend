"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalUsers: number;
  totalProducts: number;
}

export default function AdminDashboard() {
  const { loadFromStorage } = useAuthStore();
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    const fetchData = async () => {
      const t = localStorage.getItem("zaem_token");
      if (!t) {
        setLoading(false);
        return;
      }

      try {
        const statsRes = await fetch(`${API_URL}/api/orders/admin/stats`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        const statsData = await statsRes.json();
        if (statsData.success) setStats(statsData.data.stats);

        const ordersRes = await fetch(`${API_URL}/api/orders/admin/all?limit=5`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        const ordersData = await ordersRes.json();
        if (ordersData.success) setRecentOrders(ordersData.data.orders);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const STAT_CARDS = [
    {
      label: "Revenue",
      value: `PKR ${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-gold",
    },
    {
      label: "Orders",
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: "text-blue-500",
    },
    {
      label: "Pending",
      value: stats.pendingOrders.toString(),
      icon: Clock,
      color: "text-orange-500",
    },
    {
      label: "Delivered",
      value: stats.deliveredOrders.toString(),
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      label: "Users",
      value: stats.totalUsers.toString(),
      icon: Users,
      color: "text-purple-500",
    },
    {
      label: "Products",
      value: stats.totalProducts.toString(),
      icon: Package,
      color: "text-pink-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="font-display text-2xl text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div>

      {/* Header */}
      <div className="mb-8 md:mb-12">
        <p className="text-label text-gold mb-3">Dashboard</p>
        <h1 className="font-display text-3xl md:text-5xl lg:text-6xl mb-3">
          Overview
        </h1>
        <p className="text-muted font-body text-sm">
          Welcome back. Here&apos;s what&apos;s happening at ZAEM.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4 mb-8 md:mb-12">
        {STAT_CARDS.map((card) => (
          <div
            key={card.label}
            className="bg-ivory border border-ink/10 p-4 md:p-5 hover:border-gold transition-all duration-500"
          >
            <card.icon
              className={`w-4 h-4 md:w-5 md:h-5 ${card.color} mb-3 md:mb-4`}
              strokeWidth={1.5}
            />
            <p className="font-display text-lg md:text-2xl mb-1 truncate">
              {card.value}
            </p>
            <p className="text-label text-muted">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-ivory border border-ink/10">
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-ink/10">
          <div>
            <p className="text-label text-gold mb-1">Recent</p>
            <h2 className="font-display text-lg md:text-2xl">
              Latest Orders
            </h2>
          </div>
          <Link
            href="/admin/orders"
            className="text-label link-underline hover:text-gold transition-colors"
          >
            View All
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-muted font-body text-sm p-8 text-center">
            No orders yet.
          </p>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ink/10 bg-bone/30">
                    <th className="text-left p-4 text-label text-muted">Order</th>
                    <th className="text-left p-4 text-label text-muted">Customer</th>
                    <th className="text-left p-4 text-label text-muted">Total</th>
                    <th className="text-left p-4 text-label text-muted">Status</th>
                    <th className="text-right p-4 text-label text-muted">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-ink/5 hover:bg-bone/30 transition-colors"
                    >
                      <td className="p-4">
                        <p className="font-display text-sm">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-muted font-body mt-1">
                          {new Date(order.createdAt).toLocaleDateString("en-PK")}
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
                        <p className="font-display text-sm">
                          PKR {order.total.toLocaleString()}
                        </p>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-label px-2 py-1 ${
                            order.status === "DELIVERED"
                              ? "bg-green-50 text-green-700"
                              : order.status === "PENDING"
                              ? "bg-gold/10 text-gold"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-label text-gold hover:text-ink transition-colors"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-ink/5">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="block p-4 hover:bg-bone/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="font-display text-sm">
                      {order.orderNumber}
                    </p>
                    <span
                      className={`text-label px-2 py-1 shrink-0 ${
                        order.status === "DELIVERED"
                          ? "bg-green-50 text-green-700"
                          : order.status === "PENDING"
                          ? "bg-gold/10 text-gold"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm font-body mb-1">
                    {order.user?.name || "Guest"}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-display text-base">
                      PKR {order.total.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted font-body">
                      {new Date(order.createdAt).toLocaleDateString("en-PK")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  );
}