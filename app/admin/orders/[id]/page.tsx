"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Package,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { loadFromStorage } = useAuthStore();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [newStatus, setNewStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    const fetchOrder = async () => {
      const token = localStorage.getItem("zaem_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Fetch all orders and find one
        const res = await fetch(
          `${API_URL}/api/orders/admin/all?limit=100`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.success) {
          const found = data.data.orders.find((o: any) => o.id === orderId);
          if (found) {
            setOrder(found);
            setNewStatus(found.status);
            setNewPaymentStatus(found.paymentStatus);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  const handleUpdateStatus = async () => {
    const token = localStorage.getItem("zaem_token");
    if (!token) return;

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          paymentStatus: newPaymentStatus,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrder({ ...order, status: newStatus, paymentStatus: newPaymentStatus });
        setMessage({ type: "success", text: "Order updated successfully" });
      } else {
        setMessage({ type: "error", text: data.message || "Failed to update" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="font-display text-2xl text-muted">Loading...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="font-display text-2xl mb-6">Order not found</p>
        <Link href="/admin/orders" className="btn-primary">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div>

      {/* Header */}
      <div className="mb-10">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-label text-muted hover:text-gold transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
          Back to Orders
        </Link>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-label text-gold mb-3">Order</p>
            <h1 className="display-lg mb-3">{order.orderNumber}</h1>
            <p className="text-muted text-sm font-body">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-PK", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>

      {message.text && (
        <div
          className={`mb-6 p-4 text-sm font-body border-l-2 ${
            message.type === "success"
              ? "bg-gold/10 border-gold text-gold"
              : "bg-red-50 border-red-500 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ============ LEFT ============ */}
        <div className="lg:col-span-2 space-y-6">

          {/* Status Update */}
          <div className="bg-ivory border border-ink/10 p-6">
            <h2 className="font-display text-xl mb-6">Update Status</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-label text-muted block mb-3">
                  Order Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-label text-muted block mb-3">
                  Payment Status
                </label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
                  className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-3 text-base font-body transition-colors"
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleUpdateStatus}
              disabled={saving}
              className="btn-primary mt-6 disabled:opacity-50"
            >
              {saving ? "Updating..." : "Update Order"}
            </button>
          </div>

          {/* Items */}
          <div className="bg-ivory border border-ink/10 p-6">
            <h2 className="font-display text-xl mb-6">Items ({order.items?.length || 0})</h2>

            <div className="space-y-5">
              {order.items?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-5 border-b border-ink/5 last:border-0 last:pb-0"
                >
                  <div className="w-16 h-20 bg-bone shrink-0 overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-display text-xl text-ink/10">Z</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-base mb-1">{item.name}</p>
                    <p className="text-label text-muted mb-2">
                      Qty: {item.quantity}
                      {item.size && ` · Size: ${item.size}`}
                      {item.color && ` · ${item.color}`}
                    </p>
                    <p className="font-body text-sm">
                      PKR {item.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-base">
                      PKR {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Address */}
          {order.address && (
            <div className="bg-ivory border border-ink/10 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-gold" strokeWidth={1.5} />
                <h2 className="font-display text-xl">Shipping Address</h2>
              </div>
              <p className="font-display text-lg mb-2">
                {order.address.fullName}
              </p>
              <p className="text-sm text-muted font-body mb-1">
                {order.address.phone}
              </p>
              <p className="text-sm text-muted font-body">
                {order.address.street}, {order.address.city},{" "}
                {order.address.state && `${order.address.state}, `}
                {order.address.postalCode}, {order.address.country}
              </p>
            </div>
          )}

        </div>

        {/* ============ RIGHT ============ */}
        <div className="space-y-6">

          {/* Customer */}
          {order.user && (
            <div className="bg-ivory border border-ink/10 p-6">
              <h2 className="font-display text-lg mb-4">Customer</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm font-body">
                  <User className="w-4 h-4 text-gold" strokeWidth={1.5} />
                  <span>{order.user.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-body">
                  <Mail className="w-4 h-4 text-gold" strokeWidth={1.5} />
                  <span className="truncate">{order.user.email}</span>
                </div>
                {order.user.phone && (
                  <div className="flex items-center gap-3 text-sm font-body">
                    <Phone className="w-4 h-4 text-gold" strokeWidth={1.5} />
                    <span>{order.user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-ivory border border-ink/10 p-6">
            <h2 className="font-display text-lg mb-4">Summary</h2>
            <div className="space-y-3 text-sm font-body pb-4 border-b border-ink/10">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>PKR {order.subtotal.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-gold">
                  <span>Discount</span>
                  <span>− PKR {order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span>
                  {order.shippingCost === 0
                    ? "Free"
                    : `PKR ${order.shippingCost.toLocaleString()}`}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-baseline py-4">
              <span className="font-display text-base">Total</span>
              <span className="font-display text-xl">
                PKR {order.total.toLocaleString()}
              </span>
            </div>

            <div className="pt-4 border-t border-ink/10 space-y-2 text-xs font-body text-muted">
              <div className="flex justify-between">
                <span>Payment Method</span>
                <span className="text-ink">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Status</span>
                <span className="text-ink">{order.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment</span>
                <span className="text-ink">{order.paymentStatus}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}