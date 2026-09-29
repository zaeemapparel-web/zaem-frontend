"use client";

import Link from "next/link";
import { useEffect } from "react";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
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

  // Fetch cart when drawer opens
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

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Update quantity
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
          <div className="flex items-center justify-between h-20 px-6 border-b border-ink/10 shrink-0">
            <div className="flex items-center gap-3">
              <p className="font-display text-2xl">Cart</p>
              {itemCount > 0 && (
                <span className="text-label text-muted">({itemCount})</span>
              )}
            </div>
            <button
              onClick={closeCart}
              className="p-2 -mr-2 hover:text-gold transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6">

            {/* Not logged in */}
            {!isAuthenticated ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag
                  className="w-12 h-12 text-muted mb-6"
                  strokeWidth={1}
                />
                <p className="font-display text-2xl mb-3">Login required</p>
                <p className="text-muted text-sm font-body mb-8 max-w-xs">
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
              // Loading
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
              // Empty cart
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag
                  className="w-12 h-12 text-muted mb-6"
                  strokeWidth={1}
                />
                <p className="font-display text-2xl mb-3">Your cart is empty</p>
                <p className="text-muted text-sm font-body mb-8 max-w-xs">
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
              // Cart items
              <div className="space-y-6">
                {items.map((item: CartItem) => (
                  <div key={item.id} className="flex gap-4">

                    {/* Image */}
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

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between py-1">

                      <div>
                        <div className="flex justify-between items-start gap-3 mb-2">
                          <Link
                            href={`/product/${item.product.slug}`}
                            onClick={closeCart}
                            className="font-display text-base leading-tight hover:text-gold transition-colors"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-muted hover:text-gold transition-colors shrink-0"
                            aria-label="Remove"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </div>

                        {/* Size / Color */}
                        {(item.size || item.color) && (
                          <p className="text-label text-muted mb-3">
                            {item.size && <span>Size: {item.size}</span>}
                            {item.size && item.color && <span> · </span>}
                            {item.color && <span>Color: {item.color}</span>}
                          </p>
                        )}

                        {/* Price */}
                        <p className="font-body text-sm">
                          PKR {item.product.price.toLocaleString()}
                        </p>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center border border-ink/20 w-fit mt-3">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center hover:bg-bone transition-colors disabled:opacity-30"
                        >
                          <Minus className="w-3 h-3" strokeWidth={1.5} />
                        </button>
                        <span className="w-10 text-center text-sm font-body">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-8 h-8 flex items-center justify-center hover:bg-bone transition-colors"
                        >
                          <Plus className="w-3 h-3" strokeWidth={1.5} />
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer — Subtotal + Checkout */}
          {isAuthenticated && items.length > 0 && (
            <div className="border-t border-ink/10 px-6 py-6 shrink-0 bg-ivory">

              {/* Subtotal */}
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-label text-muted">Subtotal</span>
                <span className="font-display text-xl">
                  PKR {subtotal.toLocaleString()}
                </span>
              </div>

              <p className="text-muted text-xs font-body mb-6">
                Shipping & taxes calculated at checkout.
              </p>

              {/* Free shipping progress */}
              {subtotal < 5000 && (
                <div className="mb-6">
                  <p className="text-label text-gold mb-2">
                    Add Rs. {(5000 - subtotal).toLocaleString()} more for free
                    shipping
                  </p>
                  <div className="h-1 bg-bone overflow-hidden">
                    <div
                      className="h-full bg-gold transition-all duration-500"
                      style={{ width: `${(subtotal / 5000) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="space-y-3">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full h-14 bg-ink text-ivory text-label hover:bg-gold transition-colors duration-500 flex items-center justify-center"
                >
                  Checkout
                </Link>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full h-14 border border-ink/20 text-label hover:border-gold hover:text-gold transition-colors duration-500 flex items-center justify-center"
                >
                  View Full Cart
                </Link>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}