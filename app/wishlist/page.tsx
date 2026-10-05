"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import {
  Heart,
  ShoppingBag,
  Trash2,
  Bell,
  BellOff,
  TrendingDown,
  Loader2,
  Package,
  Check,
  Share2,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ==================== TYPES ====================
interface WishlistItem {
  id: string;
  productId: string;
  priceAtAdd?: number;
  notifyOnDrop: boolean;
  notifyOnStock: boolean;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number | null;
    images: string[];
    stock: number;
    category?: { name: string; slug: string };
  };
}

// ==================== MAIN COMPONENT ====================
export default function WishlistPage() {
  const { token, isAuthenticated, loadFromStorage } = useAuthStore();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState(false);

  // ==================== LOAD AUTH ====================
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // ==================== FETCH WISHLIST ====================
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.data.wishlist || []);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // ==================== TOAST AUTO HIDE ====================
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (shareToast) {
      const timer = setTimeout(() => setShareToast(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [shareToast]);

  // ==================== REMOVE ITEM ====================
  const removeItem = async (productId: string, name: string) => {
    if (!token) return;
    setRemovingId(productId);
    try {
      const res = await fetch(`${API_URL}/api/wishlist/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.productId !== productId));
        setToast(`${name} removed from wishlist`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setRemovingId(null);
    }
  };

  // ==================== ADD TO CART ====================
  const addToCart = async (product: WishlistItem["product"], name: string) => {
    if (!token) return;
    setAddingToCartId(product.id);
    try {
      const res = await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      const data = await res.json();
      if (data.success) {
        setToast(`${name} added to cart`);
      } else {
        setToast(data.message || "Failed to add");
      }
    } catch (error) {
      console.error(error);
      setToast("Network error");
    } finally {
      setAddingToCartId(null);
    }
  };

  // ==================== TOGGLE NOTIFICATIONS ====================
  const toggleNotify = async (
    productId: string,
    field: "notifyOnDrop" | "notifyOnStock",
    current: boolean
  ) => {
    if (!token) return;

    // Optimistic update
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, [field]: !current } : i
      )
    );

    try {
      await fetch(`${API_URL}/api/wishlist/${productId}/notify`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [field]: !current }),
      });
    } catch (error) {
      console.error(error);
      // Revert on error
      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId ? { ...i, [field]: current } : i
        )
      );
    }
  };

  // ==================== SHARE WISHLIST ====================
  const shareWishlist = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My ZAEM Wishlist",
          text: "Check out my saved items from ZAEM",
          url,
        });
      } catch {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setShareToast(true);
      } catch {
        setToast("Could not copy link");
      }
    }
  };

  // ==================== CALCULATE PRICE DROP ====================
  const getPriceDrop = (item: WishlistItem) => {
    if (!item.priceAtAdd || item.priceAtAdd <= item.product.price) return null;
    const drop = item.priceAtAdd - item.product.price;
    const percent = Math.round((drop / item.priceAtAdd) * 100);
    return { drop, percent };
  };

  // ==================== NOT LOGGED IN ====================
  if (!isAuthenticated && !loading) {
    return (
      <main className="bg-ivory text-ink min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-bone rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-9 h-9 text-ink/40" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-3xl mb-3">Login Required</h1>
          <p className="text-ink/60 font-body text-sm mb-8">
            Please login to view your wishlist and get price drop alerts.
          </p>
          <Link
            href="/account/login"
            className="inline-flex items-center justify-center px-6 py-3 bg-ink text-white text-[10px] tracking-widest uppercase font-body rounded-full hover:bg-ink/80 transition-colors"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-ivory text-ink min-h-screen">

      {/* ==================== HEADER ==================== */}
      <section className="pt-10 md:pt-16 pb-6 md:pb-10 px-4 md:px-8 border-b border-ink/10">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-ink/50 font-body mb-3">
                Saved Items
              </p>
              <h1 className="font-display text-3xl md:text-5xl lg:text-6xl mb-2">
                Wishlist
              </h1>
              <p className="text-ink/60 text-sm font-body">
                {items.length > 0
                  ? `${items.length} ${
                      items.length === 1 ? "item" : "items"
                    } saved`
                  : "No items saved yet"}
              </p>
            </div>

            {items.length > 0 && (
              <button
                onClick={shareWishlist}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-ink/20 rounded-full text-[10px] tracking-widest uppercase font-body hover:bg-bone transition-colors self-start md:self-auto"
              >
                <Share2 className="w-3.5 h-3.5" strokeWidth={2} />
                Share Wishlist
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ==================== CONTENT ==================== */}
      <section className="py-8 md:py-12 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto">

          {/* Loading */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-bone rounded-lg mb-3" />
                  <div className="h-2.5 bg-bone rounded mb-2 w-1/3" />
                  <div className="h-3.5 bg-bone rounded mb-2 w-3/4" />
                  <div className="h-2.5 bg-bone rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            /* Empty state */
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-bone rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-9 h-9 text-ink/30" strokeWidth={1.5} />
              </div>
              <h2 className="font-display text-2xl md:text-3xl mb-3">
                Your wishlist is empty
              </h2>
              <p className="text-ink/50 font-body text-sm mb-8 max-w-md mx-auto">
                Save your favourite pieces and get notified when they go on
                sale or come back in stock.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-white text-[10px] tracking-widest uppercase font-body rounded-full hover:bg-ink/80 transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" strokeWidth={2} />
                Shop the Collection
              </Link>
            </div>
          ) : (
            /* Wishlist grid */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {items.map((item) => {
                const priceDrop = getPriceDrop(item);
                const isOutOfStock = item.product.stock === 0;
                const hasDiscount =
                  item.product.comparePrice &&
                  item.product.comparePrice > item.product.price;

                return (
                  <div key={item.id} className="group flex flex-col">
                    {/* Image */}
                    <div className="relative aspect-[3/4] bg-bone rounded-lg overflow-hidden mb-3">
                      <Link href={`/product/${item.product.slug}`}>
                        {item.product.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package
                              className="w-8 h-8 text-ink/15"
                              strokeWidth={1.5}
                            />
                          </div>
                        )}
                      </Link>

                      {/* Remove button */}
                      <button
                        onClick={() =>
                          removeItem(item.productId, item.product.name)
                        }
                        disabled={removingId === item.productId}
                        className="absolute top-2.5 right-2.5 w-9 h-9 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-ink hover:text-white transition-all duration-300 disabled:opacity-50"
                        aria-label="Remove"
                      >
                        {removingId === item.productId ? (
                          <Loader2
                            className="w-3.5 h-3.5 animate-spin"
                            strokeWidth={2}
                          />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                        )}
                      </button>

                      {/* Price drop badge */}
                      {priceDrop && (
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-ink text-white text-[9px] tracking-widest uppercase px-2 py-1 rounded">
                          <TrendingDown
                            className="w-3 h-3"
                            strokeWidth={2}
                          />
                          {priceDrop.percent}% Drop
                        </div>
                      )}

                      {/* Sale badge (if applicable) */}
                      {!priceDrop && hasDiscount && (
                        <div className="absolute top-2.5 left-2.5 bg-ink text-white text-[9px] tracking-widest uppercase px-2 py-1 rounded">
                          Sale
                        </div>
                      )}

                      {/* Out of stock overlay */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-ink/60 flex items-center justify-center">
                          <span className="bg-white text-ink text-[10px] tracking-widest uppercase px-3 py-1.5 rounded">
                            Out of Stock
                          </span>
                        </div>
                      )}

                      {/* Quick add on hover */}
                      {!isOutOfStock && (
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() =>
                              addToCart(item.product, item.product.name)
                            }
                            disabled={addingToCartId === item.product.id}
                            className="w-full flex items-center justify-center gap-1.5 bg-white/95 backdrop-blur-md text-ink text-[10px] tracking-widest uppercase py-2.5 rounded-lg hover:bg-ink hover:text-white transition-colors duration-300 disabled:opacity-50"
                          >
                            {addingToCartId === item.product.id ? (
                              <>
                                <Loader2
                                  className="w-3 h-3 animate-spin"
                                  strokeWidth={2}
                                />
                                Adding...
                              </>
                            ) : (
                              <>
                                <ShoppingBag
                                  className="w-3 h-3"
                                  strokeWidth={2}
                                />
                                Add to Cart
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col">
                      <p className="text-[9px] uppercase tracking-widest text-ink/50 font-body mb-1 truncate">
                        {item.product.category?.name || "ZAEM"}
                      </p>
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="block"
                      >
                        <h3 className="font-display text-sm md:text-base leading-tight line-clamp-2 mb-1.5 hover:text-ink/70 transition-colors">
                          {item.product.name}
                        </h3>
                      </Link>

                      {/* Price */}
                      <div className="flex items-baseline gap-2 flex-wrap mb-2">
                        <p className="font-body text-sm font-medium">
                          Rs. {item.product.price.toLocaleString()}
                        </p>
                        {item.product.comparePrice &&
                          item.product.comparePrice > item.product.price && (
                            <p className="font-body text-[11px] text-ink/40 line-through">
                              Rs. {item.product.comparePrice.toLocaleString()}
                            </p>
                          )}
                      </div>

                      {/* Notifications toggles */}
                      <div className="flex items-center gap-1.5 mt-auto pt-2">
                        <button
                          onClick={() =>
                            toggleNotify(
                              item.productId,
                              "notifyOnDrop",
                              item.notifyOnDrop
                            )
                          }
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] tracking-widest uppercase font-body transition-all ${
                            item.notifyOnDrop
                              ? "bg-ink text-white"
                              : "bg-bone text-ink/60 hover:bg-bone/70"
                          }`}
                          title="Notify on price drop"
                        >
                          {item.notifyOnDrop ? (
                            <Bell className="w-2.5 h-2.5" strokeWidth={2} />
                          ) : (
                            <BellOff className="w-2.5 h-2.5" strokeWidth={2} />
                          )}
                          Drop
                        </button>

                        <button
                          onClick={() =>
                            toggleNotify(
                              item.productId,
                              "notifyOnStock",
                              item.notifyOnStock
                            )
                          }
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] tracking-widest uppercase font-body transition-all ${
                            item.notifyOnStock
                              ? "bg-ink text-white"
                              : "bg-bone text-ink/60 hover:bg-bone/70"
                          }`}
                          title="Notify when back in stock"
                        >
                          {item.notifyOnStock ? (
                            <Bell className="w-2.5 h-2.5" strokeWidth={2} />
                          ) : (
                            <BellOff className="w-2.5 h-2.5" strokeWidth={2} />
                          )}
                          Stock
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ==================== TOAST ==================== */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] bg-ink text-white text-xs font-body px-5 py-3 rounded-full shadow-xl animate-[toastIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)] max-w-[90vw] text-center">
          {toast}
        </div>
      )}

      {shareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] bg-ink text-white text-xs font-body px-5 py-3 rounded-full shadow-xl flex items-center gap-2 animate-[toastIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">
          <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
          Link copied to clipboard
        </div>
      )}
    </main>
  );
}