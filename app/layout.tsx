"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import FloatingActions from "@/components/FloatingActions";
import AIChatbot from "@/components/AIChatbot";

// ============================================================
// FONTS — OPTIMIZED WITH FALLBACKS
// ============================================================
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  preload: true,
  fallback: ["Georgia", "Times New Roman", "serif"],
  adjustFontFallback: true,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  preload: true,
  fallback: ["system-ui", "-apple-system", "sans-serif"],
  adjustFontFallback: true,
});

// ============================================================
// TYPES
// ============================================================
type ThemeMode = "light" | "dark" | "system";

interface LayoutState {
  shopAIOpen: boolean;
  supportAIOpen: boolean;
  darkMode: boolean;
  themeMode: ThemeMode;
  isOnline: boolean;
  isMobile: boolean;
  isTablet: boolean;
  scrollProgress: number;
  showScrollTop: boolean;
  pageLoaded: boolean;
  prefersReducedMotion: boolean;
  isFirstVisit: boolean;
}

// ============================================================
// CONSTANTS
// ============================================================
const SCROLL_TOP_THRESHOLD = 800;
const LOADER_DURATION = 300;
const THEME_KEY = "zaem_theme";
const VISITED_KEY = "zaem_visited";

// ============================================================
// MAIN LAYOUT
// ============================================================
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ==================== STATE ====================
  const [shopAIOpen, setShopAIOpen] = useState(false);
  const [supportAIOpen, setSupportAIOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [isOnline, setIsOnline] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  const rafRef = useRef<number | null>(null);
  const tickingRef = useRef(false);

  // ==================== 1. THEME INITIALIZATION ====================
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem(THEME_KEY) as ThemeMode | null;

      if (saved === "dark") {
        setDarkMode(true);
        setThemeMode("dark");
        document.documentElement.classList.add("dark");
      } else if (saved === "light") {
        setDarkMode(false);
        setThemeMode("light");
        document.documentElement.classList.remove("dark");
      } else {
        // System preference
        setThemeMode("system");
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        if (mq.matches) {
          setDarkMode(true);
          document.documentElement.classList.add("dark");
        }

        // Listen for system changes
        const handler = (e: MediaQueryListEvent) => {
          if (themeMode === "system") {
            setDarkMode(e.matches);
            if (e.matches) {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
          }
        };
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
      }
    } catch (e) {
      // Ignore
    }
  }, [themeMode]);

  // ==================== 2. PREFERS REDUCED MOTION ====================
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ==================== 3. FIRST VISIT TRACKING ====================
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const visited = localStorage.getItem(VISITED_KEY);
      if (!visited) {
        setIsFirstVisit(true);
        localStorage.setItem(VISITED_KEY, "true");
      }
    } catch (e) {}
  }, []);

  // ==================== 4. ONLINE / OFFLINE ====================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOnline(true);
      window.dispatchEvent(new CustomEvent("zaem-online"));
    };
    const handleOffline = () => {
      setIsOnline(false);
      window.dispatchEvent(new CustomEvent("zaem-offline"));
    };

    setIsOnline(navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ==================== 5. DEVICE DETECTION ====================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice, { passive: true });
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // ==================== 6. RAF SCROLL TRACKING ====================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;

      rafRef.current = requestAnimationFrame(() => {
        const windowHeight = window.innerHeight;
        const documentHeight =
          document.documentElement.scrollHeight - windowHeight;
        const scrollTop = window.scrollY;

        const progress =
          documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;

        setScrollProgress(Math.min(100, Math.max(0, progress)));
        setShowScrollTop(scrollTop > SCROLL_TOP_THRESHOLD);

        tickingRef.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ==================== 7. PAGE LOADED ====================
  useEffect(() => {
    const timer = setTimeout(() => setPageLoaded(true), LOADER_DURATION);
    return () => clearTimeout(timer);
  }, []);

  // ==================== 8. GLOBAL KEYBOARD SHORTCUTS ====================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;

      // Don't trigger if typing
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Ctrl/Cmd + K → Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("zaem-open-search"));
        return;
      }

      // Ctrl/Cmd + Shift + A → Shop AI
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "a"
      ) {
        e.preventDefault();
        setShopAIOpen(true);
        return;
      }

      // Ctrl/Cmd + Shift + S → Support AI
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "s"
      ) {
        e.preventDefault();
        setSupportAIOpen(true);
        return;
      }

      // Ctrl/Cmd + Shift + C → Cart
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "c"
      ) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("zaem-open-cart"));
        return;
      }

      // Ctrl/Cmd + Shift + T → Theme Toggle
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "t"
      ) {
        e.preventDefault();
        toggleDarkMode();
        return;
      }

      // Escape → Close all modals
      if (e.key === "Escape") {
        setShopAIOpen(false);
        setSupportAIOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ==================== 9. CART EVENTS ====================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOpenCart = () => {
      window.dispatchEvent(new CustomEvent("cart-should-open"));
    };

    window.addEventListener("zaem-open-cart", handleOpenCart);
    return () => window.removeEventListener("zaem-open-cart", handleOpenCart);
  }, []);

  // ==================== 10. AI EVENTS ====================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOpenShop = () => setShopAIOpen(true);
    const handleOpenSupport = () => setSupportAIOpen(true);

    window.addEventListener("zaem-open-shop-ai", handleOpenShop);
    window.addEventListener("zaem-open-support-ai", handleOpenSupport);

    return () => {
      window.removeEventListener("zaem-open-shop-ai", handleOpenShop);
      window.removeEventListener("zaem-open-support-ai", handleOpenSupport);
    };
  }, []);

  // ==================== 11. BODY SCROLL LOCK ====================
  useEffect(() => {
    const anyModalOpen = shopAIOpen || supportAIOpen;

    if (anyModalOpen && isMobile) {
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
    };
  }, [shopAIOpen, supportAIOpen, isMobile]);

  // ==================== 12. VISIBILITY CHANGE ====================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        window.dispatchEvent(new CustomEvent("zaem-tab-hidden"));
      } else {
        window.dispatchEvent(new CustomEvent("zaem-tab-visible"));
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // ==================== 13. SERVICE WORKER (PWA) ====================
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    // Register only in production
    // navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  // ==================== 14. TOGGLE DARK MODE ====================
  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const newMode = !prev;

      try {
        if (newMode) {
          document.documentElement.classList.add("dark");
          localStorage.setItem(THEME_KEY, "dark");
          setThemeMode("dark");
        } else {
          document.documentElement.classList.remove("dark");
          localStorage.setItem(THEME_KEY, "light");
          setThemeMode("light");
        }
      } catch (e) {}

      return newMode;
    });
  }, []);

  // ==================== 15. SCROLL TO TOP ====================
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ==================== RENDER ====================
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${
        darkMode ? "dark" : ""
      }`}
      suppressHydrationWarning
    >
      <head>
        {/* ==================== ICONS ==================== */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* ==================== THEME COLORS ==================== */}
        <meta name="theme-color" content="#0A0A0A" />
        <meta
          name="theme-color"
          content="#FAF8F4"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#0A0A0A"
          media="(prefers-color-scheme: dark)"
        />

        {/* ==================== VIEWPORT ==================== */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover, user-scalable=yes"
        />

        {/* ==================== PWA ==================== */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="ZAEM" />
        <meta name="application-name" content="ZAEM" />
        <link rel="manifest" href="/manifest.json" />

        {/* ==================== SEO META ==================== */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#0A0A0A" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />

        {/* ==================== SOCIAL META ==================== */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="ZAEM" />
        <meta name="twitter:card" content="summary_large_image" />

        {/* ==================== PRELOAD / PRECONNECT ==================== */}
        <link
          rel="preconnect"
          href={process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* ==================== DARK MODE FOUC PREVENTION ==================== */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('zaem_theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else if (saved === 'light') {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />

        {/* ==================== STRUCTURED DATA (SEO) ==================== */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "ZAEM",
              url: "https://zaemstore.com",
              logo: "https://zaemstore.com/icon.svg",
              description:
                "Premium Pakistani fashion — clothing, perfumes, and bags.",
              contactPoint: {
                "@type": "ContactPoint",
                email: "zaemapparel@gmail.com",
                telephone: "+92 319 3773788",
                contactType: "customer service",
              },
              sameAs: ["https://instagram.com/zaemstore"],
            }),
          }}
        />
      </head>

      <body className="bg-ivory text-ink font-body antialiased overflow-x-hidden">

        {/* ==================== SCROLL PROGRESS BAR ==================== */}
        <div
          className="fixed top-0 left-0 right-0 h-[2px] z-[200] bg-transparent pointer-events-none"
          role="progressbar"
          aria-label="Page scroll progress"
          aria-valuenow={Math.round(scrollProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-ink dark:bg-white origin-left gpu-accelerate"
            style={{
              transform: `scaleX(${scrollProgress / 100})`,
              willChange: "transform",
              transition: prefersReducedMotion ? "none" : "transform 100ms ease-out",
            }}
          />
        </div>

        {/* ==================== OFFLINE BANNER ==================== */}
        {!isOnline && (
          <div
            className="fixed top-0 left-0 right-0 z-[195] bg-ink text-ivory text-center py-2.5 text-[10px] uppercase tracking-[0.3em] font-body"
            role="alert"
            aria-live="polite"
          >
            ⚠️ You are offline — Some features may not work
          </div>
        )}

        {/* ==================== SKIP TO CONTENT (A11y) ==================== */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300] focus:px-4 focus:py-2 focus:bg-ink focus:text-ivory focus:rounded-full focus:text-[10px] focus:uppercase focus:tracking-widest"
        >
          Skip to content
        </a>

        {/* ==================== NAVBAR ==================== */}
        <Navbar />

        {/* ==================== MAIN CONTENT ==================== */}
        <main
          id="main-content"
          className="min-h-screen"
          style={{
            opacity: pageLoaded ? 1 : 0.98,
            transition: prefersReducedMotion ? "none" : "opacity 300ms ease-out",
          }}
        >
          {children}
        </main>

        {/* ==================== FOOTER ==================== */}
        <Footer />

        {/* ==================== CART DRAWER ==================== */}
        <CartDrawer />

        {/* ==================== FLOATING ACTIONS ==================== */}
        <FloatingActions
          onOpenShopAI={() => setShopAIOpen(true)}
          onOpenSupportAI={() => setSupportAIOpen(true)}
        />

        {/* ==================== AI CHATBOTS ==================== */}
        <AIChatbot
          isOpen={shopAIOpen}
          mode="shop"
          onClose={() => setShopAIOpen(false)}
        />
        <AIChatbot
          isOpen={supportAIOpen}
          mode="support"
          onClose={() => setSupportAIOpen(false)}
        />

        {/* ==================== SCROLL TO TOP ==================== */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-40 left-4 md:left-6 z-[85] w-10 h-10 bg-ivory/95 dark:bg-ink/95 backdrop-blur-md border border-ink/10 dark:border-ivory/10 text-ink dark:text-ivory rounded-full flex items-center justify-center shadow-lg hover:bg-ink hover:text-ivory dark:hover:bg-ivory dark:hover:text-ink transition-all duration-300 active:scale-95 touch-manipulation"
            aria-label="Scroll to top"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        )}

        {/* ==================== HIDDEN DEBUG DATA ==================== */}
        <div
          data-zaem-theme={darkMode ? "dark" : "light"}
          data-zaem-device={isMobile ? "mobile" : isTablet ? "tablet" : "desktop"}
          data-zaem-online={isOnline ? "yes" : "no"}
          data-zaem-motion={prefersReducedMotion ? "reduced" : "full"}
          data-zaem-visit={isFirstVisit ? "first" : "return"}
          style={{ display: "none" }}
          aria-hidden="true"
        />
      </body>
    </html>
  );
}