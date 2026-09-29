"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ChevronRight, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("zaem_token");
      if (!token) {
        window.location.href = "/account/login";
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
  }, []);

  return (
    <main className="bg-ivory text-ink min-h-screen">

      {/* Header */}
      <section className="pt-8 md:pt-12 px-6 md:px-10 lg:px-16">
        <div className="max-w-[1200px] mx-auto">
          <nav className="flex items-center gap-2 text-label text-muted mb-6">
            <Link href="/account" className="hover:text-ink transition-colors">
              My Account
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-ink">My Orders</span>
          </nav>

          <h1 className="display-lg mb-3">
            My <em className="font-display italic">Orders.</em>
          </h1>
          <p className="text-muted font-body mb-10">
            Track and manage your orders.
          </p>
        </div>
      </section>

      {/* Orders List */}
      <section className="pb-16 md:pb-24 px-6 md:px-10 lg:px-16">
        <div className="max-w-[1200px] mx-auto">

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-ink" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-ink/70 font-body mb-4">{error}</p>
              <Link href="/account" className="btn-primary">
                Back to Account
              </Link>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 border border-ink/10">
              <Package
                className="w-12 h-12 text-ink/30 mx-auto mb-6"
                strokeWidth={1}
              />
              <p className="font-display text-2xl mb-3">No orders yet</p>
              <p className="text-muted text-sm font-body mb-8">
                Start shopping to place your first order.
              </p>
              <Link href="/shop" className="btn-primary">
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="block border border-ink/10 hover:border-ink transition-all duration-300 p-5 md:p-6"
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">

                    <div className="flex-1 min-w-[200px]">
                      <p className="text-label text-muted mb-1">Order Number</p>
                      <p className="font-display text-lg">{order.orderNumber}</p>
                    </div>

                    <div className="flex-1 min-w-[120px]">
                      <p className="text-label text-muted mb-1">Date</p>
                      <p className="font-body text-sm">
                        {new Date(order.createdAt).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="flex-1 min-w-[120px]">
                      <p className="text-label text-muted mb-1">Total</p>
                      <p className="font-body text-sm">
                        PKR {order.total.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex-1 min-w-[120px]">
                      <p className="text-label text-muted mb-1">Status</p>
                      <span
                        className={`text-label px-2 py-1 inline-block ${
                          order.status === "DELIVERED"
                            ? "bg-green-100 text-green-700"
                            : order.status === "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <ChevronRight className="w-5 h-5 text-ink/40 shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>
      </section>

    </main>
  );
}