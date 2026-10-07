"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  X,
  Tag,
  Check,
  CheckCircle,
  AlertCircle,
  Loader2,
  Heart,
  Truck,
  RotateCcw,
  Shield,
  Home,
  ChevronRight,
  Sparkles,
  Gift,
  TrendingUp,
  Package,
  Star,
  Crown,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";

// ==================== TYPES ====================
interface CartProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  images: string[];
  stock: number;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface CartItemType {
  id: string;
  productId: string;
  quantity: number;
  size?: string | null;
  color?: string | null;
  product: CartProduct;
}

// ==================== CONSTANTS ====================
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const FREE_SHIPPING_THRESHOLD = 5000;
const SHIPPING_COST = 250;

const PROMO_CODES: Record<string, number> = {
  ZAEM10: 0.1,
  ZAEM20: 0.2,
  WELCOME10: 0.1,
  FESTIVE15: 0.15,
};

// ==================== MAIN COMPONENT ====================
export default function CartPage() {
  const router = useRouter();
  const {
    items,
    itemCount,
    subtotal,
    setCart,
    setLoading,
    loading,
  } = useCartStore();
  const { token, isAuthenticated, loadFromStorage } = useAuthStore();

  // ==================== STATE ====================
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState("");
  const [promoError, setPromoError] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [removingItem, setRemovingItem] = useState<string | null>(null);
  const [updatingQty, setUpdatingQty] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // ==================== INIT ====================
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // ==================== FETCH CART ====================
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

  // ==================== TOAST ====================
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // ==================== UPDATE QUANTITY ====================
  const updateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1 || !token) return;
    setUpdatingQty(itemId);
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
      } else {
        showToast("error", data.message || "Failed to update");
      }
    } catch (error) {
      console.error("Failed to update:", error);
      showToast("error", "Network error");
    } finally {
      setUpdatingQty(null);
    }
  };

  // ==================== REMOVE ITEM ====================
  const handleRemove = async () => {
    if (!deleteConfirm || !token) return;
    setRemovingItem(deleteConfirm.id);
    try {
      const res = await fetch(`${API_URL}/api/cart/${deleteConfirm.id}`, {
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
        showToast("success", "Item removed");
      }
    } catch (error) {
      console.error("Failed to remove:", error);
      showToast("error", "Network error");
    } finally {
      setRemovingItem(null);
      setDeleteConfirm(null);
    }
  };

  // ==================== APPLY PROMO ====================
  const applyPromo = () => {
    setPromoError("");
    setApplyingPromo(true);

    const code = promoCode.toUpperCase().trim();

    setTimeout(() => {
      if (PROMO_CODES[code]) {
        setPromoApplied(code);
        setPromoCode("");
        showToast("success", `Promo code ${code} applied!`);
      } else {
        setPromoError("Invalid or expired promo code");
        setTimeout(() => setPromoError(""), 3000);
      }
      setApplyingPromo(false);
    }, 500);
  };

  // ==================== CALCULATIONS ====================
  const discount = useMemo(() => {
    if (!promoApplied) return 0;
    const percent = PROMO_CODES[promoApplied] || 0;
    return subtotal * percent;
  }, [promoApplied, subtotal]);

  const shipping = useMemo(
    () => (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST),
    [subtotal]
  );

  const total = useMemo(
    () => subtotal - discount + shipping,
    [subtotal, discount, shipping]
  );

  const freeShippingProgress = useMemo(() => {
    return Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  }, [subtotal]);

  const amountToFreeShipping = useMemo(() => {
    return Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  }, [subtotal]);

  const totalSavings = useMemo(() => {
    return (items as CartItemType[]).reduce((sum, item) => {
      const compare = item.product.comparePrice;
      if (compare && compare > item.product.price) {
        return sum + (compare - item.product.price) * item.quantity;
      }
      return sum;
    }, 0);
  }, [items]);

  // ==================== NOT LOGGED IN ====================
  if (!isAuthenticated && !loading) {
    return (
      <main className="bg-[#FAFAFA] dark:bg-black min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag
              className="w-8 h-8 text-[#86868B]"
              strokeWidth={1.5}
            />
          </div>
          <h1 className="font-display text-3xl text-[#1D1D1F] dark:text-white mb-3">
            Login Required
          </h1>
          <p className="text-[13px] text-[#6E6E73] dark:text-[#98989D] mb-8 leading-relaxed">
            Please login to view your cart and continue shopping.
          </p>
          <Link
            href="/account/login?redirect=/cart"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-xl text-[12px] tracking-[0.2em] uppercase font-medium hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Sign In
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </Link>
        </div>
      </main>
    );
  }

  // ==================== RENDER ====================
  return (
    <main className="bg-[#FAFAFA] dark:bg-black min-h-screen">

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
      <section className="pt-8 md:pt-16 pb-6 md:pb-10 px-4 md:px-8 lg:px-16 border-b border-[#E5E5E7] dark:border-[#38383A]">
        <div className="max-w-[1400px] mx-auto">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[10px] tracking-wider uppercase text-[#86868B] font-medium mb-5 flex-wrap">
            <Link
              href="/"
              className="hover:text-[#1D1D1F] dark:hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Home className="w-3 h-3" strokeWidth={2} />
              Home
            </Link>
            <ChevronRight className="w-3 h-3" strokeWidth={2} />
            <span className="text-[#1D1D1F] dark:text-white">
              Shopping Cart
            </span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#86868B] font-medium mb-3">
                Shopping Bag
              </p>
              <h1 className="font-display text-3xl md:text-5xl lg:text-6xl text-[#1D1D1F] dark:text-white mb-3">
                Your Cart
              </h1>
              <p className="text-[#6E6E73] dark:text-[#98989D] text-sm md:text-base font-body">
                {itemCount > 0
                  ? `${itemCount} ${itemCount === 1 ? "item" : "items"} · Rs. ${subtotal.toLocaleString()}`
                  : "Your cart is empty"}
              </p>
            </div>

            {items.length > 0 && (
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-white transition-colors shrink-0"
              >
                ← Continue Shopping
              </Link>
            )}
          </div>

        </div>
      </section>

      {/* ==================== FREE SHIPPING PROGRESS ==================== */}
      {!loading && items.length > 0 && shipping > 0 && (
        <section className="py-4 px-4 md:px-8 lg:px-16 bg-[#FFF3E0] dark:bg-[#2C2C2E] border-b border-[#FFB74D]/30 dark:border-[#FFB74D]/20">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white dark:bg-[#1C1C1E] flex items-center justify-center shrink-0">
                <Truck
                  className="w-4 h-4 text-[#E65100]"
                  strokeWidth={2}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] md:text-[13px] text-[#E65100] font-medium mb-2">
                  Add Rs. {amountToFreeShipping.toLocaleString()} more for{" "}
                  <span className="font-bold">FREE shipping</span> 🎉
                </p>
                <div className="h-1.5 bg-white dark:bg-[#1C1C1E] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#E65100] to-[#FFB74D] rounded-full transition-all duration-700"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {!loading && items.length > 0 && shipping === 0 && (
        <section className="py-3 px-4 md:px-8 lg:px-16 bg-[#E8F5E9] dark:bg-[#1C2E1E] border-b border-[#81C784]/30">
          <div className="max-w-[1400px] mx-auto flex items-center justify-center gap-2">
            <CheckCircle
              className="w-4 h-4 text-[#2E7D32]"
              strokeWidth={2.5}
            />
            <p className="text-[12px] md:text-[13px] text-[#2E7D32] font-medium">
              You&apos;ve unlocked FREE shipping!
            </p>
          </div>
        </section>
      )}

      {/* ==================== CART CONTENT ==================== */}
      <section className="py-8 md:py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-[1400px] mx-auto">

          {loading ? (
            /* ==================== LOADING ==================== */
            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-5">
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-4 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A] animate-pulse"
                  >
                    <div className="w-24 h-32 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-xl" />
                    <div className="flex-1 space-y-3">
                      <div className="h-3 bg-[#F5F5F7] dark:bg-[#2C2C2E] w-1/3 rounded" />
                      <div className="h-4 bg-[#F5F5F7] dark:bg-[#2C2C2E] w-3/4 rounded" />
                      <div className="h-4 bg-[#F5F5F7] dark:bg-[#2C2C2E] w-1/4 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : items.length === 0 ? (
            /* ==================== EMPTY STATE ==================== */
            <div className="text-center py-20 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A] px-6">
              <div className="w-20 h-20 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-full flex items-center justify-center mx-auto mb-5">
                <ShoppingBag
                  className="w-8 h-8 text-[#86868B]"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="font-display text-2xl md:text-3xl text-[#1D1D1F] dark:text-white mb-3">
                Your cart is empty
              </h3>
              <p className="text-[14px] text-[#6E6E73] dark:text-[#98989D] mb-8 max-w-md mx-auto leading-relaxed">
                Looks like you haven&apos;t added anything yet. Explore our
                collection and start shopping.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-xl text-[12px] tracking-[0.2em] uppercase font-medium hover:opacity-90 active:scale-[0.98] transition-all group"
              >
                <ShoppingBag className="w-4 h-4" strokeWidth={2} />
                Shop the Collection
                <ArrowRight
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={2}
                />
              </Link>
            </div>
          ) : (
            /* ==================== CART ITEMS ==================== */
            <div className="grid lg:grid-cols-12 gap-8">

              {/* ==================== LEFT — ITEMS ==================== */}
              <div className="lg:col-span-8">

                {/* Items Count */}
                <div className="flex items-center justify-between mb-5">
                  <p className="text-[11px] tracking-wider uppercase text-[#86868B] font-medium">
                    {items.length} {items.length === 1 ? "Item" : "Items"}
                  </p>
                  {totalSavings > 0 && (
                    <p className="text-[11px] tracking-wider uppercase text-[#2E7D32] font-medium flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3" strokeWidth={2.5} />
                      Saving Rs. {totalSavings.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Items List */}
                <div className="space-y-4">
                  {(items as CartItemType[]).map((item) => {
                    const hasDiscount =
                      item.product.comparePrice &&
                      item.product.comparePrice > item.product.price;
                    const itemTotal = item.product.price * item.quantity;

                    return (
                      <div
                        key={item.id}
                        className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A] overflow-hidden hover:border-[#D2D2D7] dark:hover:border-[#48484A] transition-colors group"
                      >
                        <div className="flex flex-col sm:flex-row gap-4 p-4 md:p-5">

                          {/* Image */}
                          <Link
                            href={`/product/${item.product.slug}`}
                            className="w-full sm:w-24 md:w-28 h-32 md:h-36 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-xl shrink-0 overflow-hidden relative"
                          >
                            {item.product.images?.[0] ? (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package
                                  className="w-8 h-8 text-[#86868B]"
                                  strokeWidth={1.5}
                                />
                              </div>
                            )}

                            {hasDiscount && (
                              <div className="absolute top-2 left-2 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] text-[9px] tracking-wider uppercase font-medium px-2 py-1 rounded">
                                Sale
                              </div>
                            )}
                          </Link>

                          {/* Details */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">

                            {/* Header Row */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <Link
                                  href={`/product/${item.product.slug}`}
                                  className="font-display text-base md:text-lg text-[#1D1D1F] dark:text-white hover:opacity-70 transition-opacity leading-tight line-clamp-2 block mb-1.5"
                                >
                                  {item.product.name}
                                </Link>

                                <div className="flex flex-wrap items-center gap-1.5">
                                  {item.size && (
                                    <span className="text-[10px] tracking-wider uppercase font-medium px-2 py-0.5 rounded-md bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#6E6E73] dark:text-[#98989D]">
                                      Size: {item.size}
                                    </span>
                                  )}
                                  {item.color && (
                                    <span className="text-[10px] tracking-wider uppercase font-medium px-2 py-0.5 rounded-md bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#6E6E73] dark:text-[#98989D]">
                                      {item.color}
                                    </span>
                                  )}
                                  {item.product.category?.name && (
                                    <span className="text-[10px] tracking-wider uppercase font-medium px-2 py-0.5 rounded-md bg-[#E3F2FD] text-[#0A84FF]">
                                      {item.product.category.name}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Remove */}
                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    id: item.id,
                                    name: item.product.name,
                                  })
                                }
                                className="p-2 rounded-lg text-[#86868B] hover:bg-[#FFEBEE] hover:text-[#C62828] transition-colors shrink-0"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-4 h-4" strokeWidth={2} />
                              </button>
                            </div>

                            {/* Bottom Row */}
                            <div className="flex flex-wrap items-end justify-between gap-3 pt-3 border-t border-[#E5E5E7] dark:border-[#38383A]">

                              {/* Quantity */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity - 1)
                                  }
                                  disabled={
                                    item.quantity <= 1 ||
                                    updatingQty === item.id
                                  }
                                  className="w-9 h-9 rounded-lg border border-[#E5E5E7] dark:border-[#38383A] flex items-center justify-center hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                  aria-label="Decrease"
                                >
                                  <Minus
                                    className="w-3.5 h-3.5 text-[#1D1D1F] dark:text-white"
                                    strokeWidth={2}
                                  />
                                </button>

                                <div className="w-10 text-center">
                                  {updatingQty === item.id ? (
                                    <Loader2
                                      className="w-4 h-4 animate-spin text-[#86868B] mx-auto"
                                      strokeWidth={2}
                                    />
                                  ) : (
                                    <span className="text-[14px] font-medium text-[#1D1D1F] dark:text-white">
                                      {item.quantity}
                                    </span>
                                  )}
                                </div>

                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity + 1)
                                  }
                                  disabled={
                                    updatingQty === item.id ||
                                    item.quantity >= item.product.stock
                                  }
                                  className="w-9 h-9 rounded-lg border border-[#E5E5E7] dark:border-[#38383A] flex items-center justify-center hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                  aria-label="Increase"
                                >
                                  <Plus
                                    className="w-3.5 h-3.5 text-[#1D1D1F] dark:text-white"
                                    strokeWidth={2}
                                  />
                                </button>
                              </div>

                              {/* Price */}
                              <div className="text-right">
                                {hasDiscount &&
                                  item.product.comparePrice && (
                                    <p className="text-[11px] text-[#86868B] line-through mb-0.5">
                                      Rs.{" "}
                                      {(
                                        item.product.comparePrice *
                                        item.quantity
                                      ).toLocaleString()}
                                    </p>
                                  )}
                                <p className="font-display text-lg md:text-xl text-[#1D1D1F] dark:text-white">
                                  Rs. {itemTotal.toLocaleString()}
                                </p>
                              </div>

                            </div>

                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-3 mt-6">
                  {[
                    { icon: Truck, label: "Fast Delivery" },
                    { icon: RotateCcw, label: "Easy Returns" },
                    { icon: Shield, label: "Secure Checkout" },
                  ].map((badge) => {
                    const Icon = badge.icon;
                    return (
                      <div
                        key={badge.label}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white dark:bg-[#1C1C1E] border border-[#E5E5E7] dark:border-[#38383A]"
                      >
                        <Icon
                          className="w-4 h-4 text-[#6E6E73] dark:text-[#98989D]"
                          strokeWidth={1.8}
                        />
                        <span className="text-[9px] md:text-[10px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] text-center">
                          {badge.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* ==================== RIGHT — SUMMARY ==================== */}
              <div className="lg:col-span-4">
                <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A] p-5 md:p-6 lg:sticky lg:top-24">

                  <h2 className="font-display text-xl md:text-2xl text-[#1D1D1F] dark:text-white mb-5">
                    Order Summary
                  </h2>

                  {/* Promo Code */}
                  <div className="mb-5">
                    <label className="block text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] mb-2">
                      Promo Code
                    </label>
                    {promoApplied ? (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#E8F5E9] border border-[#81C784]">
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle
                            className="w-4 h-4 text-[#2E7D32] shrink-0"
                            strokeWidth={2.5}
                          />
                          <span className="text-[12px] font-medium text-[#2E7D32] truncate">
                            {promoApplied} applied
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setPromoApplied("");
                            showToast("success", "Promo removed");
                          }}
                          className="p-1 rounded-md hover:bg-[#C8E6C9] transition-colors shrink-0"
                        >
                          <X
                            className="w-3.5 h-3.5 text-[#2E7D32]"
                            strokeWidth={2}
                          />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <Tag
                            className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B] pointer-events-none"
                            strokeWidth={2}
                          />
                          <input
                            type="text"
                            value={promoCode}
                            onChange={(e) =>
                              setPromoCode(e.target.value.toUpperCase())
                            }
                            onKeyDown={(e) =>
                              e.key === "Enter" && applyPromo()
                            }
                            placeholder="Enter code"
                            className="w-full h-11 bg-[#FAFAFA] dark:bg-[#0A0A0A] border border-[#E5E5E7] dark:border-[#38383A] rounded-xl pl-10 pr-3 text-[13px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:border-[#1D1D1F] dark:focus:border-white transition-all"
                          />
                        </div>
                        <button
                          onClick={applyPromo}
                          disabled={applyingPromo || !promoCode.trim()}
                          className="px-4 rounded-xl bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] text-[11px] tracking-wider uppercase font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                        >
                          {applyingPromo ? (
                            <Loader2
                              className="w-4 h-4 animate-spin"
                              strokeWidth={2}
                            />
                          ) : (
                            "Apply"
                          )}
                        </button>
                      </div>
                    )}
                    {promoError && (
                      <p className="text-[11px] text-[#C62828] mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" strokeWidth={2} />
                        {promoError}
                      </p>
                    )}

                    {!promoApplied && !promoError && (
                      <p className="text-[10px] text-[#86868B] mt-2 flex items-center gap-1">
                        <Gift className="w-3 h-3" strokeWidth={2} />
                        Try: ZAEM10, WELCOME10, FESTIVE15
                      </p>
                    )}
                  </div>

                  {/* Summary Rows */}
                  <div className="space-y-3 pb-4 border-b border-[#E5E5E7] dark:border-[#38383A]">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[#6E6E73] dark:text-[#98989D]">
                        Subtotal ({itemCount} items)
                      </span>
                      <span className="text-[#1D1D1F] dark:text-white font-medium">
                        Rs. {subtotal.toLocaleString()}
                      </span>
                    </div>

                    {discount > 0 && (
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="text-[#2E7D32] flex items-center gap-1">
                          <Tag className="w-3 h-3" strokeWidth={2} />
                          Discount ({promoApplied})
                        </span>
                        <span className="text-[#2E7D32] font-medium">
                          − Rs. {discount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-[#6E6E73] dark:text-[#98989D]">
                        Shipping
                      </span>
                      <span
                        className={`font-medium ${
                          shipping === 0
                            ? "text-[#2E7D32]"
                            : "text-[#1D1D1F] dark:text-white"
                        }`}
                      >
                        {shipping === 0
                          ? "FREE"
                          : `Rs. ${shipping.toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between py-5">
                    <span className="text-[13px] tracking-wider uppercase font-medium text-[#1D1D1F] dark:text-white">
                      Total
                    </span>
                    <span className="font-display text-2xl text-[#1D1D1F] dark:text-white">
                      Rs. {total.toLocaleString()}
                    </span>
                  </div>

                  {/* Checkout Button */}
                  <Link
                    href="/checkout"
                    className="w-full h-13 flex items-center justify-center gap-2 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-xl text-[12px] tracking-[0.2em] uppercase font-medium hover:opacity-90 active:scale-[0.98] transition-all group"
                  >
                    Proceed to Checkout
                    <ArrowRight
                      className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                      strokeWidth={2}
                    />
                  </Link>

                  {/* Continue Shopping */}
                  <Link
                    href="/shop"
                    className="w-full h-11 flex items-center justify-center gap-2 mt-3 border border-[#E5E5E7] dark:border-[#38383A] rounded-xl text-[11px] tracking-wider uppercase font-medium text-[#1D1D1F] dark:text-white hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors"
                  >
                    Continue Shopping
                  </Link>

                  {/* Trust */}
                  <div className="mt-5 pt-5 border-t border-[#E5E5E7] dark:border-[#38383A] space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-[#6E6E73] dark:text-[#98989D]">
                      <CheckCircle
                        className="w-3 h-3 text-[#2E7D32] shrink-0"
                        strokeWidth={2.5}
                      />
                      <span>Free shipping above Rs. 5,000</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#6E6E73] dark:text-[#98989D]">
                      <CheckCircle
                        className="w-3 h-3 text-[#2E7D32] shrink-0"
                        strokeWidth={2.5}
                      />
                      <span>7-day easy returns</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#6E6E73] dark:text-[#98989D]">
                      <CheckCircle
                        className="w-3 h-3 text-[#2E7D32] shrink-0"
                        strokeWidth={2.5}
                      />
                      <span>Secure payment methods</span>
                    </div>
                  </div>

                  {/* Money Back */}
                  <div className="mt-5 p-3 rounded-xl bg-[#F5F5F7] dark:bg-[#0A0A0A] text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <Shield
                        className="w-3.5 h-3.5 text-[#6E6E73]"
                        strokeWidth={2}
                      />
                      <p className="text-[10px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D]">
                        Secure Checkout
                      </p>
                    </div>
                    <p className="text-[10px] text-[#86868B]">
                      Your data is protected with 256-bit SSL
                    </p>
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>
      </section>

      {/* ==================== DELETE CONFIRM MODAL ==================== */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative bg-white dark:bg-[#1C1C1E] max-w-md w-full p-6 rounded-2xl shadow-2xl">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 bg-[#FFEBEE] rounded-full flex items-center justify-center shrink-0">
                <Trash2
                  className="w-6 h-6 text-[#C62828]"
                  strokeWidth={2}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl text-[#1D1D1F] dark:text-white mb-2">
                  Remove Item?
                </h3>
                <p className="text-[13px] text-[#6E6E73] dark:text-[#98989D] leading-relaxed">
                  Remove{" "}
                  <strong className="text-[#1D1D1F] dark:text-white">
                    {deleteConfirm.name}
                  </strong>{" "}
                  from your cart?
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={removingItem !== null}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E5E7] dark:border-[#38383A] text-[12px] tracking-wider uppercase font-medium text-[#1D1D1F] dark:text-white hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors disabled:opacity-50"
              >
                Keep
              </button>
              <button
                onClick={handleRemove}
                disabled={removingItem !== null}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C62828] hover:bg-[#B71C1C] text-white text-[12px] tracking-wider uppercase font-medium transition-colors disabled:opacity-50"
              >
                {removingItem ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" strokeWidth={2} />
                    Remove
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}