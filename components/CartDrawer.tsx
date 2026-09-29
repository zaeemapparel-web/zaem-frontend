"use client";

import Link from "next/link";
import { useEffect } from "react";
import { X, Minus, Plus, Trash2, ShoppingBag, Pencil } from "lucide-react";
import { useCartStore } from "../lib/store/cartStore";
import { useAuthStore } from "../lib/store/authStore";

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  size?: string | null;
  color?: string | null;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number | null;
    images: string[];
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function CartDrawer() {
  const {
    items,
    itemCount,
    subtotal,
    isOpen,
    closeCart,
    setCart,
    setLoading,
    loading,
  } = useCartStore();

  const { token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isOpen) return;

    const fetchCart = async () => {
      if (!isAuthenticated || !token) return;

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
  }, [isOpen, isAuthenticated, token, setCart, setLoading]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const updateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1) return;
    if (!token) return;

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
        setCart(
          data.data.cart.items,
          data.data.cart.itemCount,
          data.data.cart.subtotal
        );
      }
    } catch (error) {
      console.error("Failed to update:", error);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/cart/${itemId}`, {
        method: "DELETE",
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
      console.error("Failed to remove:", error);
    }
  };

  const freeShippingThreshold = 8000;
  const amountLeft = freeShippingThreshold - subtotal;
  const progressPercent = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-[200] bg-ink/40 backdrop-blur-sm transition-opacity duration-500 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-[201] h-full w-full sm:w-[480px] bg-ivory shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">

          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-ink/10 shrink-0">
            <div className="flex items-center gap-3">
              <p className="font-display text-xl uppercase tracking-widest">Shopping Bag</p>
              {itemCount > 0 && (
                <span className="text-label text-ink/60">({itemCount})</span>
              )}
            </div>
            <button
              onClick={closeCart}
              className="p-2 -mr-2 hover:text-ink transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Free Shipping Bar */}
          {isAuthenticated && items.length > 0 && (
            <div className="px-6 py-4 border-b border-ink/10 bg-ivory shrink-0">
              <p className="text-label text-ink text-center mb-2">
                {amountLeft > 0
                  ? `FREE SHIPPING OVER Rs.${freeShippingThreshold.toLocaleString()}`
                  : "🎉 YOU GOT FREE SHIPPING!"}
              </p>
              {amountLeft > 0 && (
                <p className="text-xs text-ink/70 font-body text-center mb-3">
                  Amount Left for Free Shipping: Rs.{amountLeft.toLocaleString()}
                </p>
              )}
              <div className="flex items-center gap-3">
                <span className="text-xs text-ink font-body font-medium">
                  Rs.{subtotal.toLocaleString()}
                </span>
                <div className="flex-1 h-1 bg-ink/10 rounded overflow-hidden">
                  <div
                    className="h-full bg-red-600 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs text-ink/60 font-body">
                  Rs.{freeShippingThreshold.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6">

            {!isAuthenticated ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag
                  className="w-12 h-12 text-ink/30 mb-6"
                  strokeWidth={1}
                />
                <p className="font-display text-2xl mb-3">Login required</p>
                <p className="text-ink/60 text-sm font-body mb-8 max-w-xs">
                  Please login to view your cart.
                </p>
                <Link
                  href="/account/login"
                  onClick={closeCart}
                  className="btn-primary"
                >
                  Login
                </Link>
              </div>
            ) : loading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-24 h-32 bg-bone shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="h-3 bg-bone w-1/3" />
                      <div className="h-4 bg-bone w-3/4" />
                      <div className="h-3 bg-bone w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag
                  className="w-12 h-12 text-ink/30 mb-6"
                  strokeWidth={1}
                />
                <p className="font-display text-2xl mb-3">Your cart is empty</p>
                <p className="text-ink/60 text-sm font-body mb-8 max-w-xs">
                  Start exploring our collection and find something you love.
                </p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="btn-primary"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item: CartItem) => (
                  <div key={item.id} className="flex gap-4 pb-6 border-b border-ink/10 last:border-0">

                    <Link
                      href={`/product/${item.product.slug}`}
                      onClick={closeCart}
                      className="w-24 h-32 bg-bone shrink-0 overflow-hidden"
                    >
                      {item.product.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-display text-2xl text-ink/10">
                            Z
                          </span>
                        </div>
                      )}
                    </Link>

                    <div className="flex-1 flex flex-col justify-between py-1">

                      <div>
                        <div className="flex justify-between items-start gap-3 mb-2">
                          <Link
                            href={`/product/${item.product.slug}`}
                            onClick={closeCart}
                            className="font-display text-base leading-tight hover:text-ink/70 transition-colors uppercase tracking-wider"
                          >
                            {item.product.name}
                          </Link>
                        </div>

                        {(item.size || item.color) && (
                          <p className="text-label text-ink/60 mb-2">
                            {item.size && <span>{item.size}</span>}
                            {item.size && item.color && <span> · </span>}
                            {item.color && <span>{item.color}</span>}
                          </p>
                        )}

                        <p className="font-body text-sm text-ink/70 mb-1">
                          Rs.{item.product.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-green-600 font-body">
                          In Stock
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-3 mt-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-7 h-7 rounded-full bg-ink text-ivory flex items-center justify-center hover:bg-ink/80 transition-colors disabled:opacity-30"
                          >
                            <Minus className="w-3 h-3" strokeWidth={2} />
                          </button>
                          <span className="w-8 text-center text-sm font-body">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-full bg-ink text-ivory flex items-center justify-center hover:bg-ink/80 transition-colors"
                          >
                            <Plus className="w-3 h-3" strokeWidth={2} />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-ink/60 hover:text-ink transition-colors p-1"
                            aria-label="Edit"
                          >
                            <Pencil className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-ink/60 hover:text-ink transition-colors p-1"
                            aria-label="Remove"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {isAuthenticated && items.length > 0 && (
            <div className="border-t border-ink/10 px-6 py-5 shrink-0 bg-ivory">

              <div className="flex justify-between items-baseline mb-5">
                <span className="text-base font-medium uppercase tracking-widest text-ink">
                  Subtotal:
                </span>
                <span className="font-display text-xl text-ink">
                  Rs.{subtotal.toLocaleString()}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="flex-1 h-13 py-4 bg-ink text-ivory text-label hover:bg-ink/80 transition-colors duration-500 flex items-center justify-center"
                  >
                    View Bag
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="flex-1 h-13 py-4 bg-ink text-ivory text-label hover:bg-ink/80 transition-colors duration-500 flex items-center justify-center"
                  >
                    Checkout
                  </Link>
                </div>
                <button
                  onClick={closeCart}
                  className="w-full h-13 py-4 border border-ink text-ink text-label hover:bg-ink hover:text-ivory transition-colors duration-500 flex items-center justify-center"
                >
                  Continue Shopping
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}