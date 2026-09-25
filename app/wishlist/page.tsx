"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number | null;
    images: string[];
    category?: { name: string; slug: string };
  };
}

export default function WishlistPage() {
  const { token, isAuthenticated, loadFromStorage } = useAuthStore();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Fetch wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
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
        if (data.success) setItems(data.data.wishlist);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [isAuthenticated, token]);

  // Remove
  const removeItem = async (productId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/wishlist/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.productId !== productId));
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Add to cart from wishlist
  const addToCart = async (product: WishlistItem["product"]) => {
    if (!token) return;
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
        alert("Added to cart!");
      } else {
        alert(data.message || "Failed");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Not logged in
  if (!isAuthenticated) {
    return (
      <main className="bg-ivory text-ink min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <Heart className="w-16 h-16 text-muted mx-auto mb-8" strokeWidth={1} />
          <h1 className="display-md mb-4">Login Required</h1>
          <p className="text-muted font-body mb-10">
            Please login to view your wishlist.
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

      {/* Header */}
      <section className="pt-16 md:pt-24 pb-10 md:pb-16 px-6 md:px-10 lg:px-16">
        <div className="max-w-[1800px] mx-auto">
          <p className="text-label text-gold mb-6">Saved Items</p>
          <h1 className="display-xl mb-6">Wishlist</h1>
          <p className="text-muted text-sm md:text-base font-body">
            {items.length > 0
              ? `${items.length} ${items.length === 1 ? "item" : "items"} saved`
              : "No items saved yet"}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20 md:pb-32 px-6 md:px-10 lg:px-16">
        <div className="max-w-[1800px] mx-auto">

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-bone mb-4" />
                  <div className="h-3 bg-bone mb-2 w-1/3" />
                  <div className="h-4 bg-bone w-3/4" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="w-16 h-16 text-muted mx-auto mb-8" strokeWidth={1} />
              <p className="font-display text-3xl md:text-4xl mb-6">
                Your wishlist is empty.
              </p>
              <p className="text-muted font-body mb-10">
                Save your favourite pieces for later.
              </p>
              <Link href="/shop" className="btn-primary">
                Shop the Collection
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {items.map((item) => (
                <div key={item.id} className="group">

                  {/* Image */}
                  <div className="relative aspect-[3/4] bg-bone overflow-hidden mb-5">
                    <Link href={`/product/${item.product.slug}`}>
                      {item.product.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-display text-5xl text-ink/10">Z</span>
                        </div>
                      )}
                    </Link>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="absolute top-3 right-3 w-10 h-10 bg-ivory/90 backdrop-blur-sm flex items-center justify-center hover:bg-ink hover:text-ivory transition-all duration-500"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>

                    {/* Quick Add */}
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <button
                        onClick={() => addToCart(item.product)}
                        className="w-full bg-ink text-ivory text-label py-3 hover:bg-gold transition-colors duration-500"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div>
                    <p className="text-label text-gold mb-2">
                      {item.product.category?.name || "ZAEM"}
                    </p>
                    <Link href={`/product/${item.product.slug}`}>
                      <h3 className="font-display text-lg md:text-xl mb-2 group-hover:text-gold transition-colors duration-500">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-ink text-sm font-body">
                      PKR {item.product.price.toLocaleString()}
                    </p>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      </section>
    </main>
  );
}