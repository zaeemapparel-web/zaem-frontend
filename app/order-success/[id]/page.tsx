"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, Package, Truck, Home } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params.id as string;

  const { token, loadFromStorage } = useAuthStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    const fetchOrder = async () => {
      const t = localStorage.getItem("zaem_token");
      if (!t) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${t}` },
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
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-ivory text-ink min-h-screen">

      {/* ============ HERO ============ */}
      <section className="pt-20 md:pt-32 pb-16 md:pb-24 px-6 md:px-10 lg:px-16 border-b border-ink/10">
        <div className="max-w-3xl mx-auto text-center">

          {/* Success Icon */}
          <div className="w-20 h-20 bg-gold rounded-full flex items-center justify-center mx-auto mb-8 animate-[fadeIn_0.8s_ease-out]">
            <Check className="w-10 h-10 text-ivory" strokeWidth={2.5} />
          </div>

          <p className="text-label text-gold mb-6">Order Confirmed</p>
          <h1 className="display-xl mb-8">
            Thank <em className="font-display italic text-gold">you.</em>
          </h1>
          <p className="text-muted text-base md:text-lg font-body max-w-xl mx-auto mb-10">
            Your order has been placed successfully. We&apos;ll send you a
            confirmation on WhatsApp shortly.
          </p>

          {/* Order Number */}
          <div className="inline-block border border-ink/10 px-8 py-5">
            <p className="text-label text-muted mb-2">Order Number</p>
            <p className="font-display text-2xl">{order.orderNumber}</p>
          </div>

        </div>
      </section>

      {/* ============ DETAILS ============ */}
      <section className="py-16 md:py-24 px-6 md:px-10 lg:px-16">
        <div className="max-w-4xl mx-auto">

          {/* Timeline */}
          <div className="mb-16">
            <p className="text-label text-muted mb-8">What&apos;s Next?</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-gold text-ivory flex items-center justify-center mb-4">
                  <Package className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <p className="font-display text-lg mb-2">Processing</p>
                <p className="text-sm text-muted font-body">
                  We&apos;re preparing your order
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-bone text-ink flex items-center justify-center mb-4">
                  <Truck className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <p className="font-display text-lg mb-2">Shipping</p>
                <p className="text-sm text-muted font-body">
                  Delivering within 3-5 days
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-bone text-ink flex items-center justify-center mb-4">
                  <Home className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <p className="font-display text-lg mb-2">Delivery</p>
                <p className="text-sm text-muted font-body">
                  Receive at your doorstep
                </p>
              </div>

            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-bone/50 p-6 md:p-8 mb-10">
            <p className="text-label text-muted mb-6">Order Summary</p>

            <div className="space-y-4 mb-6 pb-6 border-b border-ink/10">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between gap-4 text-sm font-body">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-muted text-xs mt-1">
                      Qty: {item.quantity}
                      {item.size && ` · Size: ${item.size}`}
                      {item.color && ` · ${item.color}`}
                    </p>
                  </div>
                  <p>PKR {(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-sm font-body">
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
              <div className="flex justify-between items-baseline pt-3 border-t border-ink/10">
                <span className="font-display text-lg">Total</span>
                <span className="font-display text-2xl">
                  PKR {order.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

        
          {/* WhatsApp Confirmation */}
<div className="bg-ink text-ivory p-6 md:p-8 mb-10">
  <div className="flex items-start gap-4 mb-6">
    <div className="w-12 h-12 bg-[#25D366] flex items-center justify-center shrink-0">
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6 text-white"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    </div>
    <div className="flex-1">
      <p className="font-display text-xl mb-2">
        Order Confirmation
      </p>
      <p className="text-ivory/60 text-sm font-body leading-relaxed">
        Apna order confirm karne ke liye WhatsApp par message bhejein.
        Hamari team foran aap se rabta karegi.
      </p>
    </div>
  </div>

  <a
    href={`https://wa.me/923193773788?text=${encodeURIComponent(
      `Hi ZAEM! 👋\n\nMera order confirm karna hai:\n\n📦 Order Number: ${order.orderNumber}\n💰 Total: PKR ${order.total.toLocaleString()}\n💳 Payment: ${order.paymentMethod}\n\nShukriya!`
    )}`}
    target="_blank"
    rel="noopener noreferrer"
    className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#25D366] text-white text-label hover:bg-white hover:text-ink transition-colors duration-500"
  >
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-4 h-4"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
    WhatsApp par Confirm Karein
  </a>
</div>
{/* Actions */}
        
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/account/orders" className="btn-primary">
              View My Orders
            </Link>
            <Link href="/shop" className="btn-outline">
              Continue Shopping
            </Link>
          </div>

        </div>
      </section>

    </main>
  );
}