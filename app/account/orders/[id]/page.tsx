"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, Package, Truck, Home, MapPin, X } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { isAuthenticated, loadFromStorage } = useAuthStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

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
        const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setOrder(data.data.order);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    const token = localStorage.getItem("zaem_token");
    if (!token) return;

    setCancelling(true);
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setOrder({ ...order, status: "CANCELLED" });
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <main className="bg-ivory min-h-screen flex items-center justify-center">
        <p className="font-display text-2xl text-muted">Loading...</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="bg-ivory min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="display-md mb-4">Order not found</h1>
          <Link href="/account/orders" className="btn-primary">
            My Orders
          </Link>
        </div>
      </main>
    );
  }

  const canCancel = ["PENDING", "CONFIRMED"].includes(order.status);

  return (
    <main className="bg-ivory text-ink min-h-screen">

      {/* Header */}
      <section className="pt-16 md:pt-24 pb-10 md:pb-16 px-6 md:px-10 lg:px-16 border-b border-ink/10">
        <div className="max-w-[1200px] mx-auto">
          <nav className="flex items-center gap-2 text-label text-muted mb-6">
            <Link href="/account" className="hover:text-gold transition-colors">
              Account
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/account/orders" className="hover:text-gold transition-colors">
              Orders
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-ink">{order.orderNumber}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-label text-gold mb-3">Order</p>
              <h1 className="display-lg">{order.orderNumber}</h1>
            </div>

            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="btn-outline flex items-center gap-2 w-fit"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 md:py-16 px-6 md:px-10 lg:px-16">
        <div className="max-w-[1200px] mx-auto grid lg:grid-cols-3 gap-10">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-8">

            {/* Status */}
            <div className="border border-ink/10 p-6 md:p-8">
              <p className="text-label text-muted mb-6">Order Status</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className={`w-12 h-12 flex items-center justify-center mb-3 ${
                    ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status)
                      ? "bg-gold text-ivory"
                      : "bg-bone text-muted"
                  }`}>
                    <Package className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <p className="font-body text-sm font-medium">Confirmed</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className={`w-12 h-12 flex items-center justify-center mb-3 ${
                    ["SHIPPED", "DELIVERED"].includes(order.status)
                      ? "bg-gold text-ivory"
                      : "bg-bone text-muted"
                  }`}>
                    <Truck className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <p className="font-body text-sm font-medium">Shipped</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className={`w-12 h-12 flex items-center justify-center mb-3 ${
                    order.status === "DELIVERED"
                      ? "bg-gold text-ivory"
                      : "bg-bone text-muted"
                  }`}>
                    <Home className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <p className="font-body text-sm font-medium">Delivered</p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="border border-ink/10 p-6 md:p-8">
              <p className="text-label text-muted mb-6">Items</p>
              <div className="space-y-5">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex gap-4 pb-5 border-b border-ink/5 last:border-0 last:pb-0">
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
                  </div>
                ))}
              </div>
            </div>

            {/* Address */}
            {order.address && (
              <div className="border border-ink/10 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-gold" strokeWidth={1.5} />
                  <p className="text-label text-muted">Shipping Address</p>
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

          {/* RIGHT — Summary */}
          <div>
            <div className="bg-bone/50 p-6 md:p-8 sticky top-28">
              <p className="text-label text-muted mb-6">Order Summary</p>

              <div className="space-y-3 text-sm font-body pb-6 border-b border-ink/10">
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

              <div className="flex justify-between items-baseline py-6">
                <span className="font-display text-lg">Total</span>
                <span className="font-display text-2xl">
                  PKR {order.total.toLocaleString()}
                </span>
              </div>

              <div className="pt-6 border-t border-ink/10 space-y-3 text-xs font-body text-muted">
                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <span className="text-ink">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status</span>
                  <span className="text-ink">{order.paymentStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span>Order Date</span>
                  <span className="text-ink">
                    {new Date(order.createdAt).toLocaleDateString("en-PK")}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}