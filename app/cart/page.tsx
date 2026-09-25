"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function CartPage() {
  const { items, itemCount, subtotal, setCart, setLoading, loading } = useCartStore();
  const { token, isAuthenticated } = useAuthStore();

  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState("");
  const [promoError, setPromoError] = useState("");

  // Fetch cart
  useEffect(() => {
    const fetchCart = async () => {
      if (!isAuthenticated || !token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setCart(
            data.data.cart.items,
            data.data.cart.itemCount,
            data.data.cart.subtotal
          );
        }
      } catch (error) {
        console.error("Failed to fetch cart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [isAuthenticated, token, setCart, setLoading]);

  // Update quantity
  const updateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1 || !token) return;
    try {
      const res = await fetch(`${API_URL}/api/cart/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQty }),
      });
      const data = await res.json();
      if (data.success) {
        setCart(data.data.cart.items, data.data.cart.itemCount, data.data.cart.subtotal);
      }
    } catch (error) {
      console.error("Failed to update:", error);
    }
  };

  // Remove item
  const removeItem = async (itemId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/cart/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setCart(data.data.cart.items, data.data.cart.itemCount, data.data.cart.subtotal);
      }
    } catch (error) {
      console.error("Failed to remove:", error);
    }
  };

  // Apply promo code (demo)
  const applyPromo = () => {
    setPromoError("");
    const code = promoCode.toUpperCase().trim();
    if (code === "ZAEM10" || code === "ZAEM20") {
      setPromoApplied(code);
      setPromoCode("");
    } else {
      setPromoError("Invalid promo code");
      setTimeout(() => setPromoError(""), 3000);
    }
  };

  // Calculate totals
  const discount = promoApplied === "ZAEM10" ? subtotal * 0.1 :
                   promoApplied === "ZAEM20" ? subtotal * 0.2 : 0;
  const shipping = subtotal >= 5000 ? 0 : 250;
  const total = subtotal - discount + shipping;

  // Not logged in
  if (!isAuthenticated) {
    return (
      <main className="bg-ivory text-ink min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <ShoppingBag className="w-16 h-16 text-muted mx-auto mb-8" strokeWidth={1} />
          <h1 className="display-md mb-4">Login Required</h1>
          <p className="text-muted font-body mb-10">
            Please login to view your cart.
          </p>
          <Link href="/account/login" className="btn-primary">
            Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-ivory text-ink min-h-screen">

      {/* ============ PAGE HEADER ============ */}
      <section className="pt-16 md:pt-24 pb-10 md:pb-16 px-6 md:px-10 lg:px-16">
        <div className="max-w-[1800px] mx-auto">
          <p className="text-label text-gold mb-6">Shopping Bag</p>
          <h1 className="display-xl mb-6">Your Cart</h1>
          <p className="text-muted text-sm md:text-base font-body">
            {itemCount > 0
              ? `${itemCount} ${itemCount === 1 ? "item" : "items"} in your cart`
              : "Your cart is empty"}
          </p>
        </div>
      </section>

      {/* ============ CART CONTENT ============ */}
      <section className="pb-20 md:pb-32 px-6 md:px-10 lg:px-16">
        <div className="max-w-[1800px] mx-auto">

          {loading ? (
            <div className="grid lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex gap-6 animate-pulse">
                    <div className="w-32 h-40 bg-bone" />
                    <div className="flex-1 space-y-4">
                      <div className="h-3 bg-bone w-1/3" />
                      <div className="h-5 bg-bone w-3/4" />
                      <div className="h-4 bg-bone w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-3xl md:text-4xl mb-6">
                Your cart is empty.
              </p>
              <p className="text-muted font-body mb-10">
                Start exploring our collection.
              </p>
              <Link href="/shop" className="btn-primary">
                Shop the Collection
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">

              {/* ============ LEFT — ITEMS ============ */}
              <div className="lg:col-span-8">
                <div className="space-y-8">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-5 md:gap-6 pb-8 border-b border-ink/10"
                    >
                      {/* Image */}
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="w-24 h-32 md:w-32 md:h-40 bg-bone shrink-0 overflow-hidden"
                      >
                        {item.product.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="font-display text-3xl text-ink/10">
                              Z
                            </span>
                          </div>
                        )}
                      </Link>

                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-4 mb-3">
                            <Link
                              href={`/product/${item.product.slug}`}
                              className="font-display text-lg md:text-xl hover:text-gold transition-colors leading-tight"
                            >
                              {item.product.name}
                            </Link>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-muted hover:text-gold transition-colors shrink-0 p-1"
                              aria-label="Remove"
                            >
                              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                          </div>

                          {(item.size || item.color) && (
                            <p className="text-label text-muted mb-3">
                              {item.size && <span>Size: {item.size}</span>}
                              {item.size && item.color && <span> · </span>}
                              {item.color && <span>Color: {item.color}</span>}
                            </p>
                          )}

                          <p className="font-body text-base">
                            PKR {item.product.price.toLocaleString()}
                          </p>
                        </div>

                        {/* Quantity */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border border-ink/20">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              className="w-10 h-10 flex items-center justify-center hover:bg-bone transition-colors disabled:opacity-30"
                            >
                              <Minus className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </button>
                            <span className="w-12 text-center text-sm font-body">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="w-10 h-10 flex items-center justify-center hover:bg-bone transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </button>
                          </div>

                          <p className="font-display text-lg">
                            PKR{" "}
                            {(item.product.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Continue Shopping */}
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-3 mt-10 text-label hover:text-gold transition-colors"
                >
                  ← Continue Shopping
                </Link>
              </div>

              {/* ============ RIGHT — SUMMARY ============ */}
              <div className="lg:col-span-4">
                <div className="bg-bone/50 p-6 md:p-8 sticky top-28">

                  <h2 className="font-display text-2xl mb-8">Order Summary</h2>

                  {/* Promo Code */}
                  <div className="mb-8">
                    <p className="text-label text-muted mb-3">Promo Code</p>
                    {promoApplied ? (
                      <div className="flex items-center justify-between bg-gold/10 border border-gold px-4 py-3">
                        <span className="text-label text-gold">
                          {promoApplied} applied
                        </span>
                        <button
                          onClick={() => setPromoApplied("")}
                          className="text-label text-gold hover:text-ink"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex border border-ink/20">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="ZAEM10 or ZAEM20"
                          className="flex-1 bg-transparent px-4 py-3 text-sm font-body outline-none placeholder:text-muted/50"
                        />
                        <button
                          onClick={applyPromo}
                          className="px-5 text-label hover:text-gold transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                    {promoError && (
                      <p className="text-label text-gold mt-2">{promoError}</p>
                    )}
                  </div>

                  {/* Summary Rows */}
                  <div className="space-y-4 pb-6 border-b border-ink/10">
                    <div className="flex justify-between text-sm font-body">
                      <span className="text-muted">Subtotal</span>
                      <span>PKR {subtotal.toLocaleString()}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-sm font-body text-gold">
                        <span>Discount</span>
                        <span>− PKR {discount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm font-body">
                      <span className="text-muted">Shipping</span>
                      <span>
                        {shipping === 0 ? "Free" : `PKR ${shipping.toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-baseline py-6">
                    <span className="font-display text-lg">Total</span>
                    <span className="font-display text-2xl">
                      PKR {total.toLocaleString()}
                    </span>
                  </div>

                  {/* Checkout Button */}
                  <Link
                    href="/checkout"
                    className="w-full h-14 bg-ink text-ivory text-label hover:bg-gold transition-colors duration-500 flex items-center justify-center gap-3"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                  </Link>

                  {/* Trust badges */}
                  <div className="mt-6 pt-6 border-t border-ink/10 space-y-3 text-muted text-xs font-body">
                    <p>✓ Free shipping on orders above Rs. 5,000</p>
                    <p>✓ 7-day easy returns</p>
                    <p>✓ Secure payment</p>
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>
      </section>

    </main>
  );
}