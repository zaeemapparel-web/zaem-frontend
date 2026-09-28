"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setMessage("Subscribed! Thank you.");
        setEmail("");
        setTimeout(() => { setStatus("idle"); setMessage(""); }, 4000);
      } else {
        setStatus("error");
        setMessage(data.message || "Failed");
        setTimeout(() => { setStatus("idle"); setMessage(""); }, 4000);
      }
    } catch {
      setStatus("error");
      setMessage("Network error");
      setTimeout(() => { setStatus("idle"); setMessage(""); }, 4000);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 border-b border-ink/30 focus-within:border-gold transition-colors duration-500 pb-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="flex-1 bg-transparent text-ink placeholder:text-muted/50 text-sm font-body outline-none py-3"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="text-label hover:text-gold transition-colors duration-500 py-3 disabled:opacity-50"
        >
          {status === "loading" ? "..." : "Subscribe →"}
        </button>
      </form>

      {message && (
        <p className={`text-xs mt-3 font-body ${status === "success" ? "text-gold" : "text-ink"}`}>
          {message}
        </p>
      )}
    </>
  );
}
export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/products?featured=true&limit=4`
        );
        const data = await res.json();
        if (data.success) {
          setProducts(data.data.products);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

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

  return (
    <main className="bg-ivory text-ink">

      {/* ============ HERO SECTION WITH VIDEO ============ */}
      <section className="relative min-h-[85vh] md:min-h-screen flex flex-col items-center justify-center px-6 md:px-10 overflow-hidden">

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
        <div className="absolute inset-0 bg-ink/35" />

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/20 via-transparent to-ivory/50" />

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
            <p className="text-label text-gold flex items-center justify-center gap-3">
              <span className="w-8 h-px bg-gold" />
              New Season 2026
              <span className="w-8 h-px bg-gold" />
            </p>
          </div>

          <h1 className="display-hero mb-8 md:mb-12 text-ivory drop-shadow-lg">
            <span className="block animate-[revealUp_1.2s_ease-out_both]">
              Style.
            </span>
            <span className="block italic text-gold animate-[revealUp_1.2s_ease-out_0.2s_both]">
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
              className="inline-flex items-center justify-center px-10 py-5 bg-ivory text-ink text-label hover:bg-gold transition-colors duration-500 min-w-[220px]"
            >
             Shop the Collection
   </Link>
    <Link
     href="/about"
    className="inline-flex items-center justify-center px-10 py-5 border border-ivory/60 text-ivory text-label hover:bg-ivory hover:text-ink transition-colors duration-500 backdrop-blur-sm min-w-[220px]"
          >
             Our Story
          </Link>
        </div>

        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-[fadeIn_2s_ease-out_1s_both] z-10">
          <span className="text-label text-ivory/70">Scroll</span>
          <ArrowDown
            className="w-4 h-4 text-gold animate-bounce"
            strokeWidth={1.5}
          />
        </div>

      </section>

      {/* ============ MARQUEE — CATEGORIES ============ */}
      <section className="py-6 md:py-10 border-y border-ink/10 overflow-hidden bg-bone/50">
        <div className="flex animate-[marquee_40s_linear_infinite] whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex shrink-0 items-center">
              {["Woman", "Man", "Fragrances", "Bags", "New In", "Sale"].map((text, j) => (
                <div key={j} className="flex items-center">
                  <span className="font-display text-2xl md:text-4xl px-6 md:px-10 tracking-tight">
                    {text}
                  </span>
                  <span className="text-gold text-xl md:text-3xl">✦</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ============ PHILOSOPHY SECTION ============ */}
      <section className="py-20 md:py-32 px-6 md:px-10 lg:px-16 bg-ivory">
        <div className="max-w-[1800px] mx-auto">

          <div className="grid md:grid-cols-12 gap-10 md:gap-6">

            <div className="md:col-span-3">
              <p className="text-label text-gold">01 — Philosophy</p>
            </div>

            <div className="md:col-span-9">
              <h2 className="display-xl mb-10 md:mb-14">
                The art of{" "}
                <em className="font-display italic text-gold">restraint.</em>
              </h2>

              <div className="grid md:grid-cols-2 gap-10 md:gap-20 max-w-5xl">
                <p className="text-muted text-base md:text-lg leading-relaxed font-body">
                  We believe true luxury is quiet. It doesn't shout, it doesn't
                  chase trends — it simply exists, with intention.
                </p>
                <p className="text-muted text-base md:text-lg leading-relaxed font-body">
                  Every piece we create is a meditation on form, function, and
                  feeling. Designed to outlive seasons. Made to be lived in.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ============ CATEGORIES GRID — 4 COLUMNS ============ */}
      <section className="pb-20 md:pb-32 px-6 md:px-10 lg:px-16 bg-ivory">
        <div className="max-w-[1800px] mx-auto">

          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-16">
            <div>
              <p className="text-label text-gold mb-6">02 — Collections</p>
              <h2 className="display-lg">
                Four worlds,{" "}
                <em className="font-display italic">one vision.</em>
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-label link-underline hover:text-gold transition-colors duration-500 self-start md:self-end"
            >
              View All Collections
            </Link>
          </div>

          {/* 4-Column Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {[
  {
    name: "Woman",
    label: "Category 01",
    slug: "woman",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
    desc: "Timeless elegance for the modern woman.",
  },
  {
    name: "Man",
    label: "Category 02",
    slug: "man",
    image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800&q=80",
    desc: "Tailored for the modern man.",
  },
  {
    name: "Fragrances",
    label: "Category 03",
    slug: "fragrances",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80",
    desc: "Signature scents for every mood.",
  },
  {
    name: "Bags",
    label: "Category 04",
    slug: "bags",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80",
    desc: "Artisan-crafted. Everyday luxury.",
  },
].map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
                className="group block"
              >
                {/* Image Container */}
                <div className="relative aspect-[3/4] bg-bone overflow-hidden mb-4 md:mb-5 img-zoom">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-all duration-700" />

                  {/* Category Label (Top) */}
                  <div className="absolute top-3 md:top-4 left-3 md:left-4 z-10">
                    <p className="text-label text-ivory/90 drop-shadow-md text-[9px] md:text-[10px]">
                      {cat.label}
                    </p>
                  </div>
                </div>

                {/* Category Info */}
                <div>
                  <h3 className="font-display text-lg md:text-2xl mb-1 md:mb-2 group-hover:text-gold transition-colors duration-500">
                    {cat.name}
                  </h3>
                  <p className="text-muted text-xs md:text-sm font-body leading-relaxed">
                    {cat.desc}
                  </p>

                  {/* Discover link */}
                  <div className="flex items-center gap-3 mt-3 md:mt-4 text-label group-hover:text-gold transition-colors duration-500">
                    <span>Discover</span>
                    <span className="w-6 md:w-8 h-px bg-current group-hover:w-12 md:group-hover:w-16 transition-all duration-500" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ============ FEATURED PRODUCTS ============ */}
      <section className="pb-20 md:pb-32 px-6 md:px-10 lg:px-16 bg-ivory">
        <div className="max-w-[1800px] mx-auto">

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-16">
            <div>
              <p className="text-label text-gold mb-6">03 — Featured</p>
              <h2 className="display-lg">
                The <em className="font-display italic">essentials.</em>
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-label link-underline hover:text-gold transition-colors duration-500 self-start md:self-end"
            >
              View All Products
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-bone mb-4" />
                  <div className="h-3 bg-bone mb-2 w-1/3" />
                  <div className="h-4 bg-bone mb-2 w-3/4" />
                  <div className="h-3 bg-bone w-1/4" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted font-body">No featured products yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[3/4] bg-bone overflow-hidden mb-4 md:mb-5 img-zoom">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-display text-6xl text-ink/10">ZAEM</span>
                      </div>
                    )}

                    {product.comparePrice && product.comparePrice > product.price && (
                      <div className="absolute top-4 left-4 bg-gold text-ivory text-[9px] tracking-[0.3em] uppercase font-medium px-3 py-1.5">
                        Sale
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-label text-gold mb-2">
                      {product.category?.name || "ZAEM"}
                    </p>
                    <h3 className="font-display text-lg md:text-xl mb-2 group-hover:text-gold transition-colors duration-500">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-3">
                      <p className="text-ink text-sm font-body">
                        PKR {product.price.toLocaleString()}
                      </p>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <p className="text-muted text-xs line-through font-body">
                          PKR {product.comparePrice.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ============ BRAND STORY ============ */}
      <section className="py-24 md:py-40 px-6 md:px-10 lg:px-16 bg-ink text-ivory relative overflow-hidden">
        <div className="max-w-[1800px] mx-auto relative z-10">

          <div className="max-w-4xl mx-auto text-center">
            <p className="text-label text-gold mb-8">04 — Our Promise</p>

            <h2 className="display-xl mb-10">
              Every stitch,{" "}
              <em className="font-display italic text-gold">a promise.</em>
            </h2>

            <p className="text-ivory/60 text-base md:text-lg leading-relaxed font-body max-w-2xl mx-auto mb-12">
              From the loom to your wardrobe, every ZAEM piece carries the
              weight of intention. We work with artisans who share our
              obsession with detail. We choose materials that honor both the
              wearer and the earth.
            </p>

            <Link
              href="/about"
              className="text-label link-underline hover:text-gold transition-colors duration-500"
            >
              Read Our Story
            </Link>
          </div>

        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[25vw] text-ivory/[0.03] whitespace-nowrap select-none pointer-events-none">
          ZAEM
        </div>
      </section>

      {/* ============ NEWSLETTER ============ */}
      <section className="py-20 md:py-32 px-6 md:px-10 lg:px-16 bg-ivory">
        <div className="max-w-[1800px] mx-auto">

          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">

            <div>
              <p className="text-label text-gold mb-6">Newsletter</p>
              <h2 className="display-lg mb-6">
                Join the{" "}
                <em className="font-display italic">inner circle.</em>
              </h2>
              <p className="text-muted text-base font-body max-w-md">
                Be the first to discover new collections, private sales, and
                stories from the atelier.
              </p>
            </div>

            <div>
              <NewsletterForm />
              <p className="text-muted text-xs mt-4 font-body">
                No spam. Unsubscribe anytime.
              </p>
            </div>

          </div>

        </div>
      </section>

    </main>
  );
}