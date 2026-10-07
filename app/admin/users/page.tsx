"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import {
  Search,
  User,
  Mail,
  Phone,
  Shield,
  Ban,
  CheckCircle,
  X,
  Loader2,
  Users,
  TrendingUp,
  Award,
  DollarSign,
  ChevronDown,
  Eye,
  Check,
  Copy,
  Calendar,
  ShoppingBag,
  Crown,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ==================== TYPES ====================
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

type RoleFilter = "all" | "USER" | "ADMIN";

// ==================== HELPERS ====================
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const getAvatarColor = (name: string) => {
  const colors = [
    "bg-[#E3F2FD] text-[#0A84FF]",
    "bg-[#F3E5F5] text-[#7B1FA2]",
    "bg-[#FFF3E0] text-[#E65100]",
    "bg-[#E8F5E9] text-[#2E7D32]",
    "bg-[#FFEBEE] text-[#C62828]",
    "bg-[#E0F7FA] text-[#00838F]",
    "bg-[#FCE4EC] text-[#C2185B]",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// ==================== MAIN COMPONENT ====================
export default function AdminUsersPage() {
  const { loadFromStorage } = useAuthStore();

  // ==================== STATE ====================
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<RoleFilter>("all");
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // ==================== INIT ====================
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // ==================== FETCH USERS ====================
  const fetchUsers = async () => {
    const token = localStorage.getItem("zaem_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/orders/admin/all?limit=200`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success && data.data.orders) {
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
          if (order.user && userMap.has(order.user.id)) {
            const u = userMap.get(order.user.id)!;
            u._count = { orders: (u._count?.orders || 0) + 1 };
          }
        });

        setUsers(Array.from(userMap.values()));
      }
    } catch (error) {
      console.error(error);
      showToast("error", "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==================== TOAST ====================
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // ==================== COPY ====================
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    showToast("success", `${label} copied`);
    setTimeout(() => setCopied(null), 2000);
  };

  // ==================== FILTERS ====================
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.phone?.includes(search);

      const matchesRole = filterRole === "all" || u.role === filterRole;

      return matchesSearch && matchesRole;
    });
  }, [users, search, filterRole]);

  // ==================== SORTED ====================
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const aOrders = a._count?.orders || 0;
      const bOrders = b._count?.orders || 0;
      return bOrders - aOrders;
    });
  }, [filteredUsers]);

  // ==================== STATS ====================
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === "ADMIN").length;
    const customers = users.filter((u) => u.role === "USER").length;
    const active = users.filter((u) => u.isActive).length;
    const totalOrders = users.reduce(
      (sum, u) => sum + (u._count?.orders || 0),
      0
    );
    const topCustomer = [...users].sort(
      (a, b) => (b._count?.orders || 0) - (a._count?.orders || 0)
    )[0];

    return { total, admins, customers, active, totalOrders, topCustomer };
  }, [users]);

  // ==================== CLEAR FILTERS ====================
  const hasActiveFilters = !!search || filterRole !== "all";

  const clearFilters = () => {
    setSearch("");
    setFilterRole("all");
  };

  // ==================== STAT CARDS ====================
  const STAT_CARDS = [
    {
      label: "Total Customers",
      value: stats.total.toString(),
      icon: Users,
      accent: "text-[#0A84FF]",
      bg: "bg-[#E3F2FD]",
    },
    {
      label: "Admins",
      value: stats.admins.toString(),
      icon: Crown,
      accent: "text-[#E65100]",
      bg: "bg-[#FFF3E0]",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders.toString(),
      icon: ShoppingBag,
      accent: "text-[#7B1FA2]",
      bg: "bg-[#F3E5F5]",
    },
    {
      label: "Active Users",
      value: stats.active.toString(),
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
            Customers
          </h1>
          <p className="text-[#6E6E73] dark:text-[#98989D] font-body text-sm">
            {stats.total} {stats.total === 1 ? "customer" : "customers"} ·{" "}
            {stats.totalOrders} total orders
          </p>
        </div>
      </div>

      {/* ==================== STAT CARDS ==================== */}
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
                <Icon className={`w-5 h-5 ${card.accent}`} strokeWidth={2} />
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

      {/* ==================== FILTERS ==================== */}
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
              placeholder="Search by name, email, phone..."
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

          {/* Role Filter */}
          <div className="flex items-center gap-1 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-lg p-1">
            {[
              { value: "all", label: "All" },
              { value: "USER", label: "Customers" },
              { value: "ADMIN", label: "Admins" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilterRole(opt.value as RoleFilter)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-medium tracking-wide uppercase transition-all ${
                  filterRole === opt.value
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
            {filterRole !== "all" && (
              <span className="admin-badge admin-badge-neutral">
                Role: {filterRole}
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
            Loading Customers
          </p>
        </div>
      ) : sortedUsers.length === 0 ? (
        /* ==================== EMPTY STATE ==================== */
        <div className="admin-card p-16 text-center">
          <div className="w-16 h-16 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-[#86868B]" strokeWidth={1.5} />
          </div>
          <h3 className="font-display text-xl text-[#1D1D1F] dark:text-white mb-2">
            {hasActiveFilters ? "No customers match" : "No customers yet"}
          </h3>
          <p className="text-[13px] text-[#86868B] mb-6 max-w-md mx-auto">
            {hasActiveFilters
              ? "Try adjusting your filters or search terms"
              : "Customers will appear here when they place orders"}
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
                      Customer
                    </th>
                    <th className="text-left p-3 text-[10px] tracking-[0.15em] uppercase text-[#86868B] font-medium">
                      Phone
                    </th>
                    <th className="text-left p-3 text-[10px] tracking-[0.15em] uppercase text-[#86868B] font-medium">
                      Orders
                    </th>
                    <th className="text-left p-3 text-[10px] tracking-[0.15em] uppercase text-[#86868B] font-medium">
                      Role
                    </th>
                    <th className="text-left p-3 text-[10px] tracking-[0.15em] uppercase text-[#86868B] font-medium">
                      Joined
                    </th>
                    <th className="text-right p-3 text-[10px] tracking-[0.15em] uppercase text-[#86868B] font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.map((user) => {
                    const isTopBuyer =
                      user.id === stats.topCustomer?.id &&
                      (user._count?.orders || 0) > 0;

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-[#E5E5E7] dark:border-[#38383A] last:border-0 hover:bg-[#FAFAFA] dark:hover:bg-[#1C1C1E] transition-colors"
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full ${getAvatarColor(
                                user.name
                              )} flex items-center justify-center font-display text-sm font-medium shrink-0 relative`}
                            >
                              {getInitials(user.name)}
                              {isTopBuyer && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#E65100] rounded-full flex items-center justify-center">
                                  <Crown
                                    className="w-2.5 h-2.5 text-white"
                                    strokeWidth={2.5}
                                  />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white truncate max-w-[200px]">
                                {user.name}
                                {isTopBuyer && (
                                  <span className="ml-2 text-[9px] tracking-wider uppercase font-medium text-[#E65100] bg-[#FFF3E0] px-1.5 py-0.5 rounded">
                                    Top Buyer
                                  </span>
                                )}
                              </p>
                              <div className="flex items-center gap-1 group">
                                <p className="text-[11px] text-[#86868B] truncate max-w-[200px]">
                                  {user.email}
                                </p>
                                <button
                                  onClick={() =>
                                    copyToClipboard(user.email, "Email")
                                  }
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                  title="Copy email"
                                >
                                  {copied === "Email" ? (
                                    <Check
                                      className="w-3 h-3 text-[#2E7D32]"
                                      strokeWidth={2}
                                    />
                                  ) : (
                                    <Copy
                                      className="w-3 h-3 text-[#86868B]"
                                      strokeWidth={2}
                                    />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          {user.phone ? (
                            <div className="flex items-center gap-1.5 group">
                              <span className="text-[12px] text-[#6E6E73] dark:text-[#98989D]">
                                {user.phone}
                              </span>
                              <button
                                onClick={() =>
                                  copyToClipboard(user.phone!, "Phone")
                                }
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                title="Copy phone"
                              >
                                {copied === "Phone" ? (
                                  <Check
                                    className="w-3 h-3 text-[#2E7D32]"
                                    strokeWidth={2}
                                  />
                                ) : (
                                  <Copy
                                    className="w-3 h-3 text-[#86868B]"
                                    strokeWidth={2}
                                  />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[12px] text-[#86868B] italic">
                              —
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md ${
                              (user._count?.orders || 0) > 0
                                ? "bg-[#E3F2FD] text-[#0A84FF]"
                                : "bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#86868B]"
                            }`}
                          >
                            <ShoppingBag className="w-3 h-3" strokeWidth={2} />
                            {user._count?.orders || 0}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] tracking-wider uppercase font-medium px-2.5 py-1 rounded-md ${
                              user.role === "ADMIN"
                                ? "bg-[#FFF3E0] text-[#E65100]"
                                : "bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#6E6E73] dark:text-[#98989D]"
                            }`}
                          >
                            {user.role === "ADMIN" && (
                              <Shield className="w-3 h-3" strokeWidth={2} />
                            )}
                            {user.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 text-[11px] text-[#86868B]">
                            <Calendar className="w-3 h-3" strokeWidth={2} />
                            {new Date(user.createdAt).toLocaleDateString(
                              "en-PK",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <Link
                            href={`/admin/orders?search=${user.email}`}
                            className="inline-flex items-center gap-1.5 text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" strokeWidth={2} />
                            Orders
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ==================== MOBILE CARDS ==================== */}
          <div className="lg:hidden space-y-3">
            {sortedUsers.map((user) => {
              const isTopBuyer =
                user.id === stats.topCustomer?.id &&
                (user._count?.orders || 0) > 0;

              return (
                <div key={user.id} className="admin-card p-4">
                  {/* Top Row */}
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-[#E5E5E7] dark:border-[#38383A]">
                    <div
                      className={`w-12 h-12 rounded-full ${getAvatarColor(
                        user.name
                      )} flex items-center justify-center font-display text-base font-medium shrink-0 relative`}
                    >
                      {getInitials(user.name)}
                      {isTopBuyer && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#E65100] rounded-full flex items-center justify-center">
                          <Crown
                            className="w-3 h-3 text-white"
                            strokeWidth={2.5}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-[#86868B] truncate">
                        {user.email}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-[9px] tracking-wider uppercase font-medium px-2 py-1 rounded-md shrink-0 ${
                        user.role === "ADMIN"
                          ? "bg-[#FFF3E0] text-[#E65100]"
                          : "bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#6E6E73] dark:text-[#98989D]"
                      }`}
                    >
                      {user.role === "ADMIN" && (
                        <Shield className="w-2.5 h-2.5" strokeWidth={2} />
                      )}
                      {user.role}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-[10px] tracking-wider uppercase text-[#86868B] font-medium mb-1">
                        Orders
                      </p>
                      <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white flex items-center gap-1">
                        <ShoppingBag
                          className="w-3.5 h-3.5 text-[#0A84FF]"
                          strokeWidth={2}
                        />
                        {user._count?.orders || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] tracking-wider uppercase text-[#86868B] font-medium mb-1">
                        Joined
                      </p>
                      <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white">
                        {new Date(user.createdAt).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                          year: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  {user.phone && (
                    <div className="pt-3 border-t border-[#E5E5E7] dark:border-[#38383A] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone
                          className="w-3.5 h-3.5 text-[#86868B]"
                          strokeWidth={2}
                        />
                        <span className="text-[12px] text-[#6E6E73] dark:text-[#98989D]">
                          {user.phone}
                        </span>
                      </div>
                      <Link
                        href={`/admin/orders?search=${user.email}`}
                        className="text-[10px] tracking-wider uppercase font-medium text-[#0A84FF] hover:underline"
                      >
                        View Orders →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

    </div>
  );
}