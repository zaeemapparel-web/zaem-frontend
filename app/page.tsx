"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import {
  ArrowDown,
  ArrowRight,
  Package,
  Sparkles,
  Star,
  Truck,
  RotateCcw,
  Shield,
  Heart,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ==================== CATEGORIES ====================
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
  { icon: Truck, title: "Free Shipping", desc: "On orders above Rs. 5,000" },
  { icon: RotateCcw, title: "7-Day Returns", desc: "Easy, no-questions returns" },
  { icon: Shield, title: "Secure Payment", desc: "COD, JazzCash, EasyPaisa" },
];

// ==================== MARQUEE ====================
const MARQUEE_ITEMS = ["Woman", "Man", "Fragrances", "Bags", "New In", "Sale"];

// ==================== NEWSLETTER FORM ====================
function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
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
          className="flex-1 bg-transparent text-ink placeholder:text-ink/40 text-base sm:text-sm font-body outline-none py-3 px-4 sm:px-0 border border-ink/20 sm:border-0 rounded-full sm:rounded-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="text-[10px] uppercase tracking-[0.2em] font-body font-medium hover:opacity-60 transition-opacity py-3 px-6 bg-ink text-white sm:bg-transparent sm:text-ink rounded-full sm:rounded-none disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap min-h-[44px]"
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
      prefetch={true}
      className="group block touch-manipulation"
    >
      <div className="relative aspect-[3/4] bg-bone rounded-lg overflow-hidden mb-3 contain-strict gpu-accelerate">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 gpu-accelerate"
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

// ==================== PRODUCT GRID SKELETON ====================
function ProductGridSkeleton() {
  return (
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
  );
}

// ==================== EMPTY STATE ====================
function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center py-16 bg-bone/30 rounded-xl">
      <Package className="w-10 h-10 text-ink/20 mx-auto mb-3" strokeWidth={1.5} />
      <p className="text-ink/50 font-body text-sm mb-1">{title}</p>
      <p className="text-ink/40 font-body text-xs">{subtitle}</p>
    </div>
  );
}

// ==================== FAST LINK (Instant Navigation) ====================
function FastLink({
  href,
  children,
  className,
  onNavigate,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigating) return;

    setNavigating(true);
    onNavigate?.();

    // Instantly navigate — Next.js prefetches the page
    router.push(href);
  };

  return (
    <Link
      href={href}
      prefetch={true}
      onClick={handleClick}
      className={`touch-manipulation select-none ${className} ${
        navigating ? "opacity-70" : ""
      }`}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {children}
    </Link>
  );
}

// ==================== MAIN HOMEPAGE ====================
export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingNew, setLoadingNew] = useState(true);
  const [loadingBest, setLoadingBest] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [shopNavigating, setShopNavigating] = useState(false);

  const router = useRouter();
  const observerRef = useRef<IntersectionObserver | null>(null);

  // ==================== MOBILE DETECTION ====================
  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  // ==================== PREFETCH SHOP PAGE ====================
  useEffect(() => {
    // Prefetch shop page for instant navigation
    router.prefetch("/shop");
    router.prefetch("/account/login");
  }, [router]);

  // ==================== FETCH FEATURED ====================
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products?featured=true&limit=4`);
        const data = await res.json();
        if (data.success) setFeaturedProducts(data.data.products || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);

  // ==================== FETCH NEW ====================
  useEffect(() => {
    const fetchNew = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products?sort=newest&limit=4`);
        const data = await res.json();
        if (data.success) setNewArrivals(data.data.products || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingNew(false);
      }
    };
    fetchNew();
  }, []);

  // ==================== FETCH BEST ====================
  useEffect(() => {
    const fetchBest = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products?sort=price-desc&limit=4`);
        const data = await res.json();
        if (data.success) setBestSellers(data.data.products || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingBest(false);
      }
    };
    fetchBest();
  }, []);

  // ==================== LENIS ====================
  useEffect(() => {
    let lenis: any;
    const init = async () => {
      try {
        const Lenis = (await import("lenis")).default;
        lenis = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 2,
          infinite: false,
        });
        function raf(time: number) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      } catch (e) {}
    };
    init();
    return () => {
      if (lenis) lenis.destroy();
    };
  }, []);

  // ==================== RAF SCROLL ====================
  useEffect(() => {
    let ticking = false;
    let rafId: number | null = null;

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        rafId = requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // ==================== SCROLL REVEAL ====================
  useEffect(() => {
    if (typeof window === "undefined") return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-section-id");
            if (id) setVisibleSections((prev) => new Set(prev).add(id));
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -80px 0px" }
    );

    const sections = document.querySelectorAll("[data-section-id]");
    sections.forEach((s) => observerRef.current?.observe(s));

    return () => observerRef.current?.disconnect();
  }, []);

  const isVisible = useCallback(
    (id: string) => visibleSections.has(id),
    [visibleSections]
  );

  const revealClasses = useCallback(
    (id: string, delay = 0) => {
      const visible = isVisible(id);
      return `transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] gpu-accelerate ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`;
    },
    [isVisible]
  );

  // ==================== INSTANT SHOP NAVIGATION ====================
  const handleShopClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (shopNavigating) return;
      setShopNavigating(true);
      router.push("/shop");
    },
    [router, shopNavigating]
  );

  const handleAboutClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      router.push("/about");
    },
    [router]
  );

  const handleCategoryClick = useCallback(
    (slug: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      router.push(`/shop?category=${slug}`);
    },
    [router]
  );

  return (
    <main className="bg-ivory text-ink overflow-x-hidden contain-content">

      {/* ==================== HERO ==================== */}
      <section className="relative min-h-[85vh] md:min-h-screen flex flex-col items-center justify-center px-6 md:px-10 overflow-hidden">

        {/* Video — only on desktop or WiFi */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload={isMobile ? "none" : "auto"}
          onLoadedData={() => setVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ${
            videoLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        {/* Fallback gradient — always visible on mobile */}
        <div
          className={`absolute inset-0 bg-gradient-to-br from-ivory via-bone to-ivory transition-opacity duration-[1500ms] ${
            videoLoaded && !isMobile ? "opacity-0" : "opacity-100"
          }`}
        />

        <div className="absolute inset-0 bg-ink/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-transparent to-ivory/60" />

        <div className="relative z-10 text-center max-w-[1600px] mx-auto w-full">
          <div className="mb-6 md:mb-12 opacity-0 animate-[fadeIn_1.2s_ease-out_0.2s_both] gpu-accelerate">
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-ivory/80 flex items-center justify-center gap-3 font-body">
              <span className="w-6 md:w-8 h-px bg-ivory/60" />
              New Season 2026
              <span className="w-6 md:w-8 h-px bg-ivory/60" />
            </p>
          </div>

          <h1 className="display-hero mb-6 md:mb-12 text-ivory drop-shadow-lg gpu-accelerate">
            <span className="block opacity-0 animate-[revealUp_1.2s_ease-out_0.4s_both]">
              Style.
            </span>
            <span className="block italic opacity-0 animate-[revealUp_1.2s_ease-out_0.6s_both]">
              Redefined.
            </span>
          </h1>

          <div className="max-w-xl mx-auto mb-8 md:mb-14 opacity-0 animate-[revealUp_1.2s_ease-out_0.8s_both] gpu-accelerate">
            <p className="text-ivory/90 text-sm md:text-base leading-relaxed font-body drop-shadow-md px-4">
              A curated world of premium clothing, signature fragrances, and
              artisan-crafted bags — designed for the discerning.
            </p>
          </div>

          {/* BUTTONS — Instant Navigation */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center opacity-0 animate-[revealUp_1.2s_ease-out_1s_both] px-4">
            <Link
              href="/shop"
              prefetch={true}
              onClick={handleShopClick}
              className={`group inline-flex items-center justify-center gap-2 px-8 md:px-10 py-4 md:py-5 bg-ivory text-ink text-[10px] uppercase tracking-[0.2em] font-body hover:bg-ink hover:text-ivory transition-all duration-300 min-w-[200px] md:min-w-[220px] rounded-full touch-manipulation select-none ${
                shopNavigating ? "opacity-70 scale-95" : ""
              }`}
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {shopNavigating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
                  Opening...
                </>
              ) : (
                <>
                  Shop the Collection
                  <ArrowRight
                    className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300"
                    strokeWidth={2}
                  />
                </>
              )}
            </Link>

            <Link
              href="/about"
              prefetch={true}
              onClick={handleAboutClick}
              className="inline-flex items-center justify-center px-8 md:px-10 py-4 md:py-5 border border-ivory/60 text-ivory text-[10px] uppercase tracking-[0.2em] font-body hover:bg-ivory hover:text-ink transition-all duration-300 backdrop-blur-sm min-w-[200px] md:min-w-[220px] rounded-full touch-manipulation select-none"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              Our Story
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 md:gap-3 opacity-0 animate-[fadeIn_2s_ease-out_1.5s_both] z-10">
          <span className="text-[8px] md:text-[9px] uppercase tracking-[0.4em] text-ivory/70 font-body">
            Scroll
          </span>
          <ArrowDown
            className="w-3.5 md:w-4 h-3.5 md:h-4 text-ivory/70 animate-bounce"
            strokeWidth={1.5}
          />
        </div>
      </section>

      {/* ==================== MARQUEE ==================== */}
      <section className="py-4 md:py-7 border-y border-ink/10 overflow-hidden bg-ink text-ivory contain-strict">
        <div className="flex animate-[marquee_50s_linear_infinite] whitespace-nowrap hover:[animation-play-state:paused] gpu-accelerate">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex shrink-0 items-center">
              {MARQUEE_ITEMS.map((text, j) => (
                <div key={j} className="flex items-center">
                  <span className="font-display text-lg md:text-2xl px-5 md:px-10 tracking-tight italic">
                    {text}
                  </span>
                  <span className="text-ivory/40 text-sm md:text-lg">✦</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ==================== TRUST BADGES ==================== */}
      <section className="py-8 md:py-14 px-4 md:px-8 border-b border-ink/10" data-section-id="trust">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
            {TRUST_BADGES.map((badge, i) => {
              const IconComponent = badge.icon;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 md:gap-4 justify-start group gpu-accelerate ${revealClasses("trust", i * 100)}`}
                >
                  <div className="w-10 md:w-11 h-10 md:h-11 bg-bone rounded-full flex items-center justify-center shrink-0 group-hover:bg-ink group-hover:text-white transition-colors duration-500">
                    <IconComponent className="w-4 md:w-4.5 h-4 md:h-4.5" strokeWidth={1.7} />
                  </div>
                  <div>
                    <p className="font-body text-sm font-medium mb-0.5">
                      {badge.title}
                    </p>
                    <p className="font-body text-xs text-ink/50">{badge.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== PHILOSOPHY ==================== */}
      <section className="py-16 md:py-32 px-4 md:px-8 contain-layout" data-section-id="philosophy">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-12 gap-8 md:gap-6">
            <div className="md:col-span-3">
              <p className={`text-[10px] uppercase tracking-[0.3em] text-ink/50 font-body ${revealClasses("philosophy")}`}>
                01 — Philosophy
              </p>
            </div>
            <div className="md:col-span-9">
              <h2 className={`display-xl mb-8 md:mb-14 ${revealClasses("philosophy", 100)}`}>
                The art of <em className="font-display italic">restraint.</em>
              </h2>
              <div className="grid md:grid-cols-2 gap-8 md:gap-20 max-w-5xl">
                <p className={`text-ink/60 text-base md:text-lg leading-relaxed font-body ${revealClasses("philosophy", 200)}`}>
                  We believe true luxury is quiet. It doesn't shout, it doesn't chase trends — it simply exists, with intention.
                </p>
                <p className={`text-ink/60 text-base md:text-lg leading-relaxed font-body ${revealClasses("philosophy", 300)}`}>
                  Every piece we create is a meditation on form, function, and feeling. Designed to outlive seasons. Made to be lived in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CATEGORIES ==================== */}
      <section className="pb-16 md:pb-32 px-4 md:px-8 contain-layout" data-section-id="categories">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6 mb-8 md:mb-16">
            <div>
              <p className={`text-[10px] uppercase tracking-[0.3em] text-ink/50 font-body mb-3 md:mb-4 ${revealClasses("categories")}`}>
                02 — Collections
              </p>
              <h2 className={`display-lg ${revealClasses("categories", 100)}`}>
                Four worlds, <em className="font-display italic">one vision.</em>
              </h2>
            </div>
            <Link
              href="/shop"
              prefetch={true}
              className={`group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-body hover:opacity-60 transition-opacity self-start md:self-end touch-manipulation ${revealClasses("categories", 200)}`}
            >
              View All Collections
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {CATEGORIES.map((cat, idx) => (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
                prefetch={true}
                className={`group block gpu-accelerate touch-manipulation ${revealClasses("categories", 300 + idx * 100)}`}
              >
                <div className="relative aspect-[3/4] bg-bone rounded-lg overflow-hidden mb-3 md:mb-4 contain-strict">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] gpu-accelerate"
                  />
                  <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-all duration-700" />
                  <div className="absolute top-2.5 md:top-3 left-2.5 md:left-3">
                    <p className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] text-white/90 font-body">
                      {cat.label}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-base md:text-2xl mb-1 md:mb-2 group-hover:opacity-70 transition-opacity duration-500">
                    {cat.name}
                  </h3>
                  <p className="text-ink/50 text-xs md:text-sm font-body leading-relaxed mb-2 md:mb-3 line-clamp-2">
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
      <section className="pb-16 md:pb-32 px-4 md:px-8 bg-bone/30 contain-layout" data-section-id="new">
        <div className="max-w-[1400px] mx-auto pt-12 md:pt-24">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6 mb-8 md:mb-14">
            <div>
              <div className={`flex items-center gap-2 mb-3 md:mb-4 ${revealClasses("new")}`}>
                <Sparkles className="w-3.5 h-3.5 text-ink" strokeWidth={2} />
                <p className="text-[10px] uppercase tracking-[0.3em] text-ink/50 font-body">
                  03 — Just In
                </p>
              </div>
              <h2 className={`display-lg ${revealClasses("new", 100)}`}>
                New <em className="font-display italic">arrivals.</em>
              </h2>
            </div>
            <Link
              href="/shop?sort=newest"
              prefetch={true}
              className={`group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-body hover:opacity-60 transition-opacity self-start md:self-end touch-manipulation ${revealClasses("new", 200)}`}
            >
              View All New
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2} />
            </Link>
          </div>

          <div className={revealClasses("new", 300)}>
            {loadingNew ? (
              <ProductGridSkeleton />
            ) : newArrivals.length === 0 ? (
              <EmptyState title="Coming soon..." subtitle="New arrivals will appear here" />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
                {newArrivals.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==================== FEATURED ==================== */}
      <section className="py-16 md:py-32 px-4 md:px-8 contain-layout" data-section-id="featured">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6 mb-8 md:mb-14">
            <div>
              <div className={`flex items-center gap-2 mb-3 md:mb-4 ${revealClasses("featured")}`}>
                <Star className="w-3.5 h-3.5 text-ink" strokeWidth={2} />
                <p className="text-[10px] uppercase tracking-[0.3em] text-ink/50 font-body">
                  04 — Featured
                </p>
              </div>
              <h2 className={`display-lg ${revealClasses("featured", 100)}`}>
                The <em className="font-display italic">essentials.</em>
              </h2>
            </div>
            <Link
              href="/shop"
              prefetch={true}
              className={`group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-body hover:opacity-60 transition-opacity self-start md:self-end touch-manipulation ${revealClasses("featured", 200)}`}
            >
              View All Products
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2} />
            </Link>
          </div>

          <div className={revealClasses("featured", 300)}>
            {loadingFeatured ? (
              <ProductGridSkeleton />
            ) : featuredProducts.length === 0 ? (
              <EmptyState title="No featured products yet" subtitle="Featured items will appear here" />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==================== BEST SELLERS ==================== */}
      <section className="pb-16 md:pb-32 px-4 md:px-8 bg-bone/30 contain-layout" data-section-id="best">
        <div className="max-w-[1400px] mx-auto pt-12 md:pt-24">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6 mb-8 md:mb-14">
            <div>
              <div className={`flex items-center gap-2 mb-3 md:mb-4 ${revealClasses("best")}`}>
                <span className="w-3.5 h-3.5 text-ink text-sm flex items-center justify-center">↗</span>
                <p className="text-[10px] uppercase tracking-[0.3em] text-ink/50 font-body">
                  05 — Bestsellers
                </p>
              </div>
              <h2 className={`display-lg ${revealClasses("best", 100)}`}>
                Most <em className="font-display italic">loved.</em>
              </h2>
            </div>
            <Link
              href="/shop?sort=price-desc"
              prefetch={true}
              className={`group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-body hover:opacity-60 transition-opacity self-start md:self-end touch-manipulation ${revealClasses("best", 200)}`}
            >
              Shop Bestsellers
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2} />
            </Link>
          </div>

          <div className={revealClasses("best", 300)}>
            {loadingBest ? (
              <ProductGridSkeleton />
            ) : bestSellers.length === 0 ? (
              <EmptyState title="Coming soon..." subtitle="Bestsellers will appear here" />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
                {bestSellers.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==================== BRAND STORY ==================== */}
      <section className="py-20 md:py-40 px-4 md:px-8 bg-ink text-ivory relative overflow-hidden contain-strict" data-section-id="story">
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <p className={`text-[10px] uppercase tracking-[0.4em] text-ivory/60 font-body mb-6 md:mb-8 ${revealClasses("story")}`}>
              06 — Our Promise
            </p>
            <h2 className={`display-xl mb-8 md:mb-10 ${revealClasses("story", 100)}`}>
              Every stitch, <em className="font-display italic">a promise.</em>
            </h2>
            <p className={`text-ivory/60 text-base md:text-lg leading-relaxed font-body max-w-2xl mx-auto mb-10 md:mb-12 ${revealClasses("story", 200)}`}>
              From the loom to your wardrobe, every ZAEM piece carries the weight of intention. We work with artisans who share our obsession with detail. We choose materials that honor both the wearer and the earth.
            </p>
            <Link
              href="/about"
              prefetch={true}
              className={`group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-body hover:opacity-70 transition-opacity touch-manipulation ${revealClasses("story", 300)}`}
            >
              Read Our Story
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2} />
            </Link>
          </div>
        </div>
        <div
          className="absolute top-1/2 left-1/2 font-display text-[25vw] text-ivory/[0.03] whitespace-nowrap select-none pointer-events-none italic gpu-accelerate"
          style={{
            transform: `translate(-50%, -50%) translate3d(0, ${Math.max(0, (scrollY - 2400) * 0.08)}px, 0)`,
          }}
        >
          ZAEM
        </div>
      </section>

      {/* ==================== INSTAGRAM ==================== */}
      <section className="py-12 md:py-24 px-4 md:px-8 bg-bone/30 contain-layout" data-section-id="instagram">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-8 md:mb-14">
            <div className={`flex items-center justify-center gap-2 mb-3 md:mb-4 ${revealClasses("instagram")}`}>
              <span className="w-4 h-4 text-ink text-sm flex items-center justify-center">📸</span>
              <p className="text-[10px] uppercase tracking-[0.3em] text-ink/50 font-body">
                07 — Follow Us
              </p>
            </div>
            <h2 className={`display-lg mb-3 md:mb-4 ${revealClasses("instagram", 100)}`}>
              @zaemstore on <em className="font-display italic">Instagram</em>
            </h2>
            <p className={`text-ink/50 text-sm font-body ${revealClasses("instagram", 200)}`}>
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
                className={`group relative aspect-square bg-bone rounded-lg overflow-hidden contain-strict gpu-accelerate ${revealClasses("instagram", 300 + i * 100)}`}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] gpu-accelerate"
                />
                <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-all duration-500 flex items-center justify-center">
                  <span className="text-white text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    📸
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== NEWSLETTER ==================== */}
      <section className="py-16 md:py-32 px-4 md:px-8 contain-layout" data-section-id="newsletter">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-2 gap-10 md:gap-20 items-center">
            <div>
              <p className={`text-[10px] uppercase tracking-[0.3em] text-ink/50 font-body mb-4 md:mb-6 ${revealClasses("newsletter")}`}>
                08 — Newsletter
              </p>
              <h2 className={`display-lg mb-5 md:mb-6 ${revealClasses("newsletter", 100)}`}>
                Join the <em className="font-display italic">inner circle.</em>
              </h2>
              <p className={`text-ink/60 text-base font-body max-w-md ${revealClasses("newsletter", 200)}`}>
                Be the first to discover new collections, private sales, and stories from the atelier.
              </p>
            </div>
            <div className={revealClasses("newsletter", 300)}>
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