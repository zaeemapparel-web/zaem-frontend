"use client";

import { useEffect, useState } from "react";
import {
  Search,
  User,
  Mail,
  Phone,
  Shield,
  Ban,
  CheckCircle,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count?: { orders: number };
}

export default function AdminUsersPage() {
  const { loadFromStorage } = useAuthStore();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Mock fetch — since backend doesn't have /admin/users yet,
  // we'll use orders data to extract users
  const fetchUsers = async () => {
    const token = localStorage.getItem("zaem_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Try fetching users from a dedicated endpoint if exists
      const res = await fetch(`${API_URL}/api/orders/admin/all?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success && data.data.orders) {
        // Extract unique users from orders
        const userMap = new Map<string, UserData>();
        data.data.orders.forEach((order: any) => {
          if (order.user && !userMap.has(order.user.id)) {
            userMap.set(order.user.id, {
              id: order.user.id,
              name: order.user.name,
              email: order.user.email,
              phone: order.user.phone,
              role: "USER",
              isActive: true,
              createdAt: order.createdAt,
              _count: { orders: 0 },
            });
          }
          // Count orders
          if (order.user && userMap.has(order.user.id)) {
            const u = userMap.get(order.user.id)!;
            u._count = { orders: (u._count?.orders || 0) + 1 };
          }
        });

        setUsers(Array.from(userMap.values()));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !filterRole || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div>

      {/* Header */}
      <div className="mb-10">
        <p className="text-label text-gold mb-3">Manage</p>
        <h1 className="display-lg mb-3">Customers</h1>
        <p className="text-muted font-body text-sm">
          {users.length} {users.length === 1 ? "customer" : "customers"} in your store
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-gold/5 border border-gold/20 p-4 mb-6">
        <p className="text-sm font-body text-ink/70">
          <strong className="text-gold">Note:</strong> User data is extracted from orders. Full user management API can be added later.
        </p>
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
            placeholder="Search by name or email..."
            className="w-full pl-11 pr-4 py-3 bg-transparent border border-ink/20 focus:border-gold outline-none text-sm font-body transition-colors"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-3 bg-transparent border border-ink/20 focus:border-gold outline-none text-sm font-body transition-colors"
        >
          <option value="">All Roles</option>
          <option value="USER">Customers</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      {/* Loading / Empty */}
      {loading ? (
        <div className="bg-ivory border border-ink/10 p-20 text-center">
          <p className="font-display text-2xl text-muted">Loading...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-ivory border border-ink/10 p-20 text-center">
          <p className="font-display text-2xl mb-4">No customers found.</p>
          <p className="text-muted font-body text-sm">
            Customers will appear here when they register and place orders.
          </p>
        </div>
      ) : (
        <>
          {/* ============ DESKTOP TABLE ============ */}
          <div className="hidden lg:block bg-ivory border border-ink/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink/10 bg-bone/50">
                  <th className="text-left p-4 text-label text-muted">Customer</th>
                  <th className="text-left p-4 text-label text-muted">Phone</th>
                  <th className="text-left p-4 text-label text-muted">Orders</th>
                  <th className="text-left p-4 text-label text-muted">Role</th>
                  <th className="text-left p-4 text-label text-muted">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-ink/5 hover:bg-bone/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gold text-ivory flex items-center justify-center font-display text-sm shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-body font-medium">
                            {user.name}
                          </p>
                          <p className="text-xs text-muted font-body mt-0.5">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-body">
                        {user.phone || "—"}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="font-display text-sm">
                        {user._count?.orders || 0}
                      </p>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-label px-3 py-1 ${
                          user.role === "ADMIN"
                            ? "bg-gold/10 text-gold"
                            : "bg-bone text-ink"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-xs text-muted font-body">
                        {new Date(user.createdAt).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ============ MOBILE CARDS ============ */}
          <div className="lg:hidden space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-ivory border border-ink/10 p-4"
              >
                {/* Top Row */}
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-ink/10">
                  <div className="w-12 h-12 bg-gold text-ivory flex items-center justify-center font-display text-lg shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body font-medium truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted font-body truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Info Rows */}
                <div className="space-y-2 text-sm font-body">
                  {user.phone && (
                    <div className="flex items-center gap-2 text-muted">
                      <Phone className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted">
                    <User className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>{user._count?.orders || 0} orders</span>
                  </div>
                </div>

                {/* Role Badge */}
                <div className="mt-3 pt-3 border-t border-ink/10 flex items-center justify-between">
                  <span
                    className={`text-label px-3 py-1 ${
                      user.role === "ADMIN"
                        ? "bg-gold/10 text-gold"
                        : "bg-bone text-ink"
                    }`}
                  >
                    {user.role}
                  </span>
                  <span className="text-xs text-muted font-body">
                    {new Date(user.createdAt).toLocaleDateString("en-PK")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}