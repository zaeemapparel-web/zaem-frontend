"use client";

import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  ShoppingBag,
  Package,
  Sparkles,
  Star,
  Truck,
  RotateCcw,
  Shield,
  Instagram,
  Quote,
  TrendingUp,
  Clock,
  ChevronRight,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ==================== CATEGORIES (SYNCED WITH ADMIN/SHOP) ====================
const CATEGORIES = [
  {
    name: "Woman",
    label: "Category 01",
    slug: "woman",
    image:
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80",
    desc: "Timeless elegance for the modern woman.",
  },
  {
    name: "Man",
    label: "Category 02",
    slug: "man",
    image:
      "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1200&q=80",
    desc: "Tailored for the modern man.",
  },
  {
    name: "Fragrances",
    label: "Category 03",
    slug: "fragrances",
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1200&q=80",
    desc: "Signature scents for every mood.",
  },
  {
    name: "Bags",
    label: "Category 04",
    slug: "bags",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&q=80",
    desc: "Artisan-crafted. Everyday luxury.",
  },
];

// ==================== TRUST BADGES ====================
const TRUST_BADGES = [
  {
    icon: Truck,
    title: "Free Shipping",
    desc: "On orders above Rs. 5,000",
  },
  {
    icon: RotateCcw,
    title: "7-Day Returns",
    desc: "Easy, no-questions returns",
  },
  {
    icon: Shield,
    title: "Secure Payment",
    desc: "COD, JazzCash, EasyPaisa",
  },
];

// ==================== NEWSLETTER FORM ====================
function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch(`${API_URL}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setMessage("Subscribed. Welcome to ZAEM.");
        setEmail("");
        setTimeout(() => {
          setStatus("idle");
          setMessage("");
        }, 4000);
      } else {
        setStatus("error");
        setMessage(data.message || "Something went wrong");
        setTimeout(() => {
          setStatus("idle");
          setMessage("");
        }, 4000);
      }
    } catch {
      setStatus("error");
      setMessage("Network error");
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 4000);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:border-b sm:border-ink/20 focus-within:border-ink/50 transition-colors duration-500"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 bg-transparent text-ink placeholder:text-ink/40 text-sm font-body outline-none py-3 px-4 sm:px-0 border border-ink/20 sm:border-0 rounded-full sm:rounded-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="text-[10px] uppercase tracking-[0.2em] font-body font-medium hover:opacity-60 transition-opacity py-3 px-6 bg-ink text-white sm:bg-transparent sm:text-ink rounded-full sm:rounded-none disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {status === "loading" ? "..." : "Subscribe"}
          {status !== "loading" && (
            <ArrowRight className="w-3 h-3 hidden sm:block" strokeWidth={2} />
          )}
        </button>
      </form>

      {message && (
        <p
          className={`text-xs mt-3 font-body ${
            status === "success" ? "text-ink" : "text-ink/70"
          }`}
        >
          {message}
        </p>
      )}
    </>
  );
}

// ==================== PRODUCT CARD ====================
function ProductCard({ product }: { product: any }) {
  const hasDiscount =
    product.comparePrice && product.comparePrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.comparePrice - product.price) / product.comparePrice) * 100
      )
    : 0;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block"
    >
      <div className="relative aspect-[3/4] bg-bone rounded-lg overflow-hidden mb-3">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10 text-ink/15" strokeWidth={1.5} />
          </div>
        )}

        {hasDiscount && (
          <div className="absolute top-2.5 left-2.5 bg-ink text-white text-[9px] tracking-widest uppercase px-2 py-1 rounded">
            {discountPercent}% Off
          </div>
        )}

        {product.stock > 0 && product.stock <= 5 && (
          <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-sm text-ink text-[9px] tracking-widest uppercase px-2 py-1 rounded border border-ink/10">
            Only {product.stock} Left
          </div>
        )}
      </div>

      <p className="text-[9px] uppercase tracking-widest text-ink/50 font-body mb-1 truncate">
        {product.category?.name || "ZAEM"}
      </p>
      <h3 className="font-display text-sm md:text-base leading-tight line-clamp-2 mb-1.5 group-hover:text-ink/70 transition-colors">
        {product.name}
      </h3>
      <div className="flex items-baseline gap-2 flex-wrap">
        <p className="font-body text-sm font-medium">
          Rs. {product.price.toLocaleString()}
        </p>
        {hasDiscount && (
          <p className="font-body text-[11px] text-ink/40 line-through">
            Rs. {product.comparePrice.toLocaleString()}
          </p>
        )}
      </div>
    </Link>
  );
}

// ==================== MAIN HOMEPAGE ====================
export default function Home() {
  // ==================== STATE ====================
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingNew, setLoadingNew] = useState(true);
  const [loadingBest, setLoadingBest] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const heroRef = useRef<HTMLDivElement>(null);

  // ==================== FETCH FEATURED PRODUCTS ====================
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products?featured=true&limit=4`);
        const data = await res.json();
        if (data.success) {
          setFeaturedProducts(data.data.products || []);
        }
      } catch (error) {
        console.error("Featured fetch error:", error);
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);

  // ==================== FETCH NEW ARRIVALS ====================
  useEffect(() => {
    const fetchNew = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products?sort=newest&limit=4`);
        const data = await res.json();
        if (data.success) {
          setNewArrivals(data.data.products || []);
        }
      } catch (error) {
        console.error("New arrivals fetch error:", error);
      } finally {
        setLoadingNew(false);
      }
    };
    fetchNew();
  }, []);

  // ==================== FETCH BEST SELLERS ====================
  useEffect(() => {
    const fetchBest = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/products?sort=price-desc&limit=4`
        );
        const data = await res.json();
        if (data.success) {
          setBestSellers(data.data.products || []);
        }
      } catch (error) {
        console.error("Best sellers fetch error:", error);
      } finally {
        setLoadingBest(false);
      }
    };
    fetchBest();
  }, []);

  // ==================== LENIS SMOOTH SCROLL ====================
  useEffect(() => {
    let lenis: any;
    const initLenis = async () => {
      const Lenis = (await import("lenis")).default;
      lenis = new Lenis({
        duration: 1.4,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    };
    initLenis();

    return () => {
      if (lenis) lenis.destroy();
    };
  }, []);

  // ==================== SCROLL TRACKING (for parallax) ====================
  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="bg-ivory text-ink overflow-x-hidden">

      {/* ==================== HERO SECTION WITH VIDEO ==================== */}
      <section
        ref={heroRef}
        className="relative min-h-[85vh] md:min-h-screen flex flex-col items-center justify-center px-6 md:px-10 overflow-hidden"
      >
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadedData={() => setVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        {/* Fallback gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-br from-ivory via-bone to-ivory transition-opacity duration-1000 ${
            videoLoaded ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-ink/40" />

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-transparent to-ivory/60" />

        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `radial-gradient(circle, #FAF8F4 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* HERO CONTENT */}
        <div className="relative z-10 text-center max-w-[1600px] mx-auto w-full">

          <div className="mb-8 md:mb-12 animate-[fadeIn_1.2s_ease-out]">
            <p className="text-[10px] uppercase tracking-[0.4em] text-ivory/80 flex items-center justify-center gap-3 font-body">
              <span className="w-8 h-px bg-ivory/60" />
              New Season 2026
              <span className="w-8 h-px bg-ivory/60" />
            </p>
          </div>

          <h1 className="display-hero mb-8 md:mb-12 text-ivory drop-shadow-lg">
            <span className="block animate-[revealUp_1.2s_ease-out_both]">
              Style.
            </span>
            <span className="block italic animate-[revealUp_1.2s_ease-out_0.2s_both]">
              Redefined.
            </span>
          </h1>

          <div className="max-w-xl mx-auto mb-10 md:mb-14 animate-[revealUp_1.2s_ease-out_0.4s_both]">
            <p className="text-ivory/90 text-sm md:text-base leading-relaxed font-body drop-shadow-md">
              A curated world of premium clothing, signature fragrances, and
              artisan-crafted bags — designed for the discerning.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-[revealUp_1.2s_ease-out_0.6s_both]">
            <Link
              href="/shop"
              className="group inline-flex items-center justify-center gap-2 px-10 py-5 bg-ivory text-ink text-[10px] uppercase tracking-[0.2em] font-body hover:bg-ink hover:text-ivory transition-all duration-500 min-w-[220px] rounded-full"
            >
              Shop the Collection
              <ArrowRight
                className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform"
                strokeWidth={2}
              />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-10 py-5 border border-ivory/60 text-ivory text-[10px] uppercase tracking-[0.2em] font-body hover:bg-ivory hover:text-ink transition-all duration-500 backdrop-blur-sm min-w-[220px] rounded-full"
            >
              Our Story
            </Link>
          </div>

        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-[fadeIn_2s_ease-out_1s_both] z-10">
          <span className="text-[9px] uppercase tracking-[0.4em] text-ivory/70 font-body">
            Scroll
          </span>
          <ArrowDown
            className="w-4 h-4 text-ivory/70 animate-bounce"
            strokeWidth={1.5}
          />
        </div>

      </section>

      {/* ==================== MARQUEE — CATEGORIES ==================== */}
      <section className="py-5 md:py-7 border-y border-ink/10 overflow-hidden bg-ink text-ivory">
        <div className="flex animate-[marquee_50s_linear_infinite] whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex shrink-0 items-center">
              {["Woman", "Man", "Fragrances", "Bags", "New In", "Sale"].map(
                (text, j) => (
                  <div key={j} className="flex items-center">
                    <span className="font-display text-xl md:text-2xl px-6 md:px-10 tracking-tight italic">
                      {text}
                    </span>
                    <span className="text-ivory/40 text-base md:text-lg">
                      ✦
                    </span>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ==================== TRUST BADGES ==================== */}
      <section className="py-10 md:py-14 px-4 md:px-8 border-b border-ink/10">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {TRUST_BADGES.map((badge, i) => (
              <div
                key={i}
                className="flex items-center gap-4 justify-center md:justify-start"
              >
                <div className="w-11 h-11 bg-bone rounded-full flex items-center justify-center shrink-0">
                  <badge.icon
                    className="w-4.5 h-4.5 text-ink"
                    strokeWidth={1.7}
                  />
                </div>
                <div>
                  <p className="font-body text-sm font-medium mb-0.5">
                    {badge.title}
                  </p>
                  <p className="font-body text-xs text-ink/50">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PHILOSOPHY SECTION ==================== */}
      <section className="py-20 md:py-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-12 gap-10 md:gap-6">
            <div className="md:col-span-3">
              <p className="text-[10px] uppercase tracking-[0.3em] text-ink/50 font-body">
                01 — Philosophy
              </p>
            </div>

            <div className="md:col-span-9">
              <h2 className="display-xl mb-10 md:mb-14">
                The art of{" "}
                <em className="font-display italic">restraint.</em>
              </h2>

              <div className="grid md:grid-cols-2 gap-10 md:gap-20 max-w-5xl">
                <p className="text-ink/60 text-base md:text-lg leading-relaxed font-body">
                  We believe true luxury is quiet. It doesn't shout, it doesn't
                  chase trends — it simply exists, with intention.
                </p>
                <p className="text-ink/60 text-base md:text-lg leading-relaxed font-body">
                  Every piece we create is a meditation on form, function, and
                  feeling. Designed to outlive seasons. Made to be lived in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CATEGORIES GRID — SYNCED ==================== */}
      <section className="pb-20 md:pb-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-16">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-ink/50 font-body mb-4">
                02 — Collections
              </p>
              <h2 className="display-lg">
                Four worlds,{" "}
                <em className="font-display italic">one vision.</em>
              </h2>
            </div>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-body hover:opacity-60 transition-opacity self-start md:self-end"
            >
              View All Collections
              <ArrowRight
                className="w-3 h-3 group-hover:translate-x-1 transition-transform"
                strokeWidth={2}
              />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
                className="group block"
              >
                <div className="relative aspect-[3/4] bg-bone rounded-lg overflow-hidden mb-4">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />

                  <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-all duration-500" />

                  <div className="absolute top-3 left-3">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-white/90 font-body">
                      {cat.label}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-lg md:text-2xl mb-1 md:mb-2 group-hover:opacity-70 transition-opacity duration-500">
                    {cat.name}
                  </h3>
                  <p className="text-ink/50 text-xs md:text-sm font-body leading-relaxed mb-3">
                    {cat.desc}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-body group-hover:opacity-70 transition-opacity">
                    <span>Discover</span>
                    <span className="w-6 md:w-8 h-px bg-ink group-hover:w-12 md:group-hover:w-16 transition-all duration-500" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== NEW ARRIVALS ==================== */}
      <section className="pb-20 md:pb-32 px-4 md:px-8 bg-bone/30">
        <div className="max-w-[1400px] mx-auto pt-16 md:pt-24">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-ink" strokeWidth={2} />
                <p className="text-[10px] uppercase tracking-[0.3em] text-ink/50 font-body">
                  03 — Just In
                </p>
              </div>
              <h2 className="display-lg">
                New <em className="font-display italic">arrivals.</em>
              </h2>
            </div>
            <Link
              href="/shop?sort=newest"
              className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-body hover:opacity-60 transition-opacity self-start md:self-end"
            >
              View All New
              <ArrowRight
                className="w-3 h-3 group-hover:translate-x-1 transition-transform"
                strokeWidth={2}
              />
            </Link>
          </div>

          {loadingNew ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-bone rounded-lg mb-3" />
                  <div className="h-2.5 bg-bone rounded mb-2 w-1/3" />
                  <div className="h-3.5 bg-bone rounded mb-2 w-3/4" />
                  <div className="h-2.5 bg-bone rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : newArrivals.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl">
              <Package
                className="w-10 h-10 text-ink/20 mx-auto mb-3"
                strokeWidth={1.5}
              />
              <p className="text-ink/50 font-body text-sm">
                Coming soon...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==================== FEATURED PRODUCTS ==================== */}
      <section className="py-20 md:py-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-3.5 h-3.5 text-ink" strokeWidth={2} />
                <p className="text-[10px] uppercase tracking-[0.3em] text-ink/50 font-body">
                  04 — Featured
                </p>
              </div>
              <h2 className="display-lg">
                The <em className="font-display italic">essentials.</em>
              </h2>
            </div>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-body hover:opacity-60 transition-opacity self-start md:self-end"
            >
              View All Products
              <ArrowRight
                className="w-3 h-3 group-hover:translate-x-1 transition-transform"
                strokeWidth={2}
              />
            </Link>
          </div>

          {loadingFeatured ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-bone rounded-lg mb-3" />
                  <div className="h-2.5 bg-bone rounded mb-2 w-1/3" />
                  <div className="h-3.5 bg-bone rounded mb-2 w-3/4" />
                  <div className="h-2.5 bg-bone rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-16 bg-bone/30 rounded-xl">
              <Star
                className="w-10 h-10 text-ink/20 mx-auto mb-3"
                strokeWidth={1.5}
              />
              <p className="text-ink/50 font-body text-sm">
                No featured products yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==================== BEST SELLERS ==================== */}
      <section className="pb-20 md:pb-32 px-4 md:px-8 bg-bone/30">
        <div className="max-w-[1400px] mx-auto pt-16 md:pt-24">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-3.5 h-3.5 text-ink" strokeWidth={2} />
                <p className="text-[10px] uppercase tracking-[0.3em] text-ink/50 font-body">
                  05 — Bestsellers
              </p>
              </div>
              <h2 className="display-lg">
                Most <em className="font-display italic">loved.</em>
              </h2>
            </div>
            <Link
              href="/shop?sort=price-desc"
              className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-body hover:opacity-60 transition-opacity self-start md:self-end"
            >
              Shop Bestsellers
              <ArrowRight
                className="w-3 h-3 group-hover:translate-x-1 transition-transform"
                strokeWidth={2}
              />
            </Link>
          </div>

          {loadingBest ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-bone rounded-lg mb-3" />
                  <div className="h-2.5 bg-bone rounded mb-2 w-1/3" />
                  <div className="h-3.5 bg-bone rounded mb-2 w-3/4" />
                  <div className="h-2.5 bg-bone rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : bestSellers.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl">
              <TrendingUp
                className="w-10 h-10 text-ink/20 mx-auto mb-3"
                strokeWidth={1.5}
              />
              <p className="text-ink/50 font-body text-sm">
                Coming soon...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==================== BRAND STORY ==================== */}
      <section className="py-24 md:py-40 px-4 md:px-8 bg-ink text-ivory relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-[10px] uppercase tracking-[0.4em] text-ivory/60 font-body mb-8">
              06 — Our Promise
            </p>

            <h2 className="display-xl mb-10">
              Every stitch,{" "}
              <em className="font-display italic">a promise.</em>
            </h2>

            <p className="text-ivory/60 text-base md:text-lg leading-relaxed font-body max-w-2xl mx-auto mb-12">
              From the loom to your wardrobe, every ZAEM piece carries the
              weight of intention. We work with artisans who share our
              obsession with detail. We choose materials that honor both the
              wearer and the earth.
            </p>

            <Link
              href="/about"
              className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-body hover:opacity-70 transition-opacity"
            >
              Read Our Story
              <ArrowRight
                className="w-3 h-3 group-hover:translate-x-1 transition-transform"
                strokeWidth={2}
              />
            </Link>
          </div>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[25vw] text-ivory/[0.03] whitespace-nowrap select-none pointer-events-none italic">
          ZAEM
        </div>
      </section>

      {/* ==================== TESTIMONIALS / REVIEWS ==================== */}
      <section className="py-20 md:py-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-12 md:mb-20">
            <p className="text-[10px] uppercase tracking-[0.3em] text-ink/50 font-body mb-4">
              07 — Testimonials
            </p>
            <h2 className="display-lg">
              Words from our{" "}
              <em className="font-display italic">customers.</em>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                quote:
                  "The quality is exceptional. Every piece feels intentional and timeless — nothing like fast fashion.",
                author: "Ayesha K.",
                location: "Lahore",
              },
              {
                quote:
                  "I've been looking for premium clothing that actually lasts. ZAEM delivers on every promise.",
                author: "Hassan R.",
                location: "Karachi",
              },
              {
                quote:
                  "The craftsmanship is evident in every detail. My fragrance gets compliments every time.",
                author: "Fatima S.",
                location: "Islamabad",
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="p-6 md:p-8 bg-white border border-ink/10 rounded-xl relative"
              >
                <Quote
                  className="w-6 h-6 text-ink/20 mb-4"
                  strokeWidth={1.5}
                />
                <p className="text-ink/70 text-sm md:text-base font-body leading-relaxed mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className="w-3 h-3 fill-ink text-ink"
                      strokeWidth={1.5}
                    />
                  ))}
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-body font-medium">
                  {testimonial.author}
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-ink/50 font-body mt-0.5">
                  {testimonial.location}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== INSTAGRAM / SOCIAL ==================== */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-bone/30">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Instagram className="w-4 h-4 text-ink" strokeWidth={2} />
              <p className="text-[10px] uppercase tracking-[0.3em] text-ink/50 font-body">
                08 — Follow Us
              </p>
            </div>
            <h2 className="display-lg mb-4">
              @zaemstore on{" "}
              <em className="font-display italic">Instagram</em>
            </h2>
            <p className="text-ink/50 text-sm font-body">
              Tag us in your ZAEM looks to be featured
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {CATEGORIES.map((cat, i) => (
              <a
                key={i}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square bg-bone rounded-lg overflow-hidden"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-all duration-500 flex items-center justify-center">
                  <Instagram
                    className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    strokeWidth={1.5}
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== NEWSLETTER ==================== */}
      <section className="py-20 md:py-32 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-ink/50 font-body mb-6">
                09 — Newsletter
              </p>
              <h2 className="display-lg mb-6">
                Join the{" "}
                <em className="font-display italic">inner circle.</em>
              </h2>
              <p className="text-ink/60 text-base font-body max-w-md">
                Be the first to discover new collections, private sales, and
                stories from the atelier.
              </p>
            </div>

            <div>
              <NewsletterForm />
              <p className="text-ink/40 text-xs mt-4 font-body">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}