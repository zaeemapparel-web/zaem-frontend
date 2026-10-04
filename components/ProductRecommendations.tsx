"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Props {
  currentProductId?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function ProductRecommendations({
  currentProductId,
  title = "You May Also Like",
  subtitle = "AI picked for you",
  className = "",
}: Props) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Get recently viewed from localStorage
        const recentlyViewed = JSON.parse(
          localStorage.getItem("zaem_recently_viewed") || "[]"
        );
        const cartData = JSON.parse(
          localStorage.getItem("zaem_cart_snapshot") || "[]"
        );

        const res = await fetch(`${API_URL}/api/ai/recommendations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: currentProductId,
            recentlyViewed,
            cartItems: cartData,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setProducts(data.data.products);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentProductId]);

  if (loading) {
    return (
      <section className={`py-12 md:py-16 px-4 md:px-10 lg:px-16 border-t border-ink/10 ${className}`}>
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="w-4 h-4 text-gold" />
            <p className="text-[10px] uppercase tracking-widest text-ink/60 font-body">
              {subtitle}
            </p>
          </div>
          <h2 className="font-display text-2xl md:text-3xl mb-8">{title}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-bone mb-3" />
                <div className="h-3 bg-bone mb-2 w-1/3" />
                <div className="h-4 bg-bone w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className={`py-12 md:py-16 px-4 md:px-10 lg:px-16 border-t border-ink/10 ${className}`}>
      <div className="max-w-[1400px] mx-auto">

        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-gold" />
          <p className="text-[10px] uppercase tracking-widest text-ink/60 font-body">
            {subtitle}
          </p>
        </div>

        <h2 className="font-display text-2xl md:text-3xl mb-8">{title}</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              className="group block"
            >
              <div className="relative aspect-[3/4] bg-bone overflow-hidden mb-3">
                {p.images?.[0] ? (
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-display text-3xl text-ink/10">
                      ZAEM
                    </span>
                  </div>
                )}

                {p.comparePrice && p.comparePrice > p.price && (
                  <div className="absolute top-3 left-3 bg-ink text-ivory text-[9px] tracking-widest uppercase px-2 py-1">
                    Sale
                  </div>
                )}
              </div>

              <p className="text-[10px] uppercase tracking-widest text-ink/60 mb-1">
                {p.category?.name || "ZAEM"}
              </p>
              <h3 className="font-display text-sm md:text-base mb-1 text-ink group-hover:text-gold transition-colors">
                {p.name}
              </h3>
              <p className="text-ink text-xs font-body">
                PKR {p.price.toLocaleString()}
              </p>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}