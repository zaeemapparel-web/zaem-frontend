"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import FloatingActions from "@/components/FloatingActions";
import AIChatbot from "@/components/AIChatbot";

// ==================== FONTS ====================
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  preload: true,
  fallback: ["Georgia", "serif"],
  adjustFontFallback: true,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  preload: true,
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: true,
});

// ==================== TYPES ====================
interface LayoutState {
  shopAIOpen: boolean;
  supportAIOpen: boolean;
  cartOpen: boolean;
  darkMode: boolean;
  isOnline: boolean;
  isMobile: boolean;
  scrolled: boolean;
  scrollProgress: number;
  showScrollTop: boolean;
  pageLoaded: boolean;
}

// ==================== CONSTANTS ====================
const SCROLL_TOP_THRESHOLD = 800;
const LOADER_DURATION = 800;

// ==================== MAIN LAYOUT ====================
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ==================== STATE ====================
  const [shopAIOpen, setShopAIOpen] = useState(false);
  const [supportAIOpen, setSupportAIOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  // ==================== REFS ====================
  const rafRef = useRef<number | null>(null);
  const tickingRef = useRef(false);

  // ==================== 1. DARK MODE PERSISTENCE ====================
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("zaem_dark_mode");
    if (saved === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // ==================== 2. ONLINE / OFFLINE DETECTION ====================
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

  // ==================== 3. MOBILE DETECTION ====================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ==================== 4. SCROLL PROGRESS + SHADOW ====================
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

        // Scroll progress (0-100)
        const progress =
          documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;
        setScrollProgress(Math.min(100, progress));

        // Scrolled state
        setScrolled(scrollTop > 50);

        // Show scroll-to-top
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

  // ==================== 5. PAGE LOADED FLAG ====================
  useEffect(() => {
    const timer = setTimeout(() => setPageLoaded(true), LOADER_DURATION);
    return () => clearTimeout(timer);
  }, []);

  // ==================== 6. GLOBAL KEYBOARD SHORTCUTS ====================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K → Search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("zaem-open-search"));
      }

      // Ctrl/Cmd + Shift + A → AI Chat
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "A") {
        e.preventDefault();
        setShopAIOpen(true);
      }

      // Ctrl/Cmd + Shift + C → Cart
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "C") {
        e.preventDefault();
        setCartOpen(true);
      }

      // Escape → Close all modals
      if (e.key === "Escape") {
        setShopAIOpen(false);
        setSupportAIOpen(false);
        setCartOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ==================== 7. CART EVENTS ====================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOpenCart = () => setCartOpen(true);
    const handleCloseCart = () => setCartOpen(false);

    window.addEventListener("zaem-open-cart", handleOpenCart);
    window.addEventListener("zaem-close-cart", handleCloseCart);

    return () => {
      window.removeEventListener("zaem-open-cart", handleOpenCart);
      window.removeEventListener("zaem-close-cart", handleCloseCart);
    };
  }, []);

  // ==================== 8. PREVENT BODY SCROLL WHEN MODAL OPEN ====================
  useEffect(() => {
    const anyOpen = shopAIOpen || supportAIOpen || cartOpen;

    if (anyOpen && isMobile) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [shopAIOpen, supportAIOpen, cartOpen, isMobile]);

  // ==================== 9. SCROLL TO TOP ====================
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ==================== 10. TOGGLE DARK MODE ====================
  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("zaem_dark_mode", "true");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("zaem_dark_mode", "false");
      }
      return newMode;
    });
  }, []);

  // ==================== 11. VISIBILITY CHANGE ====================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab hidden — do nothing
      } else {
        // Tab visible — could refresh data
        window.dispatchEvent(new CustomEvent("zaem-tab-visible"));
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // ==================== 12. SERVICE WORKER (PWA Ready) ====================
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    // Only in production
    // navigator.serviceWorker.register("/sw.js").catch(() => {});
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

        {/* ==================== THEME ==================== */}
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
          content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover"
        />

        {/* ==================== PWA ==================== */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="ZAEM" />
        <link rel="manifest" href="/manifest.json" />

        {/* ==================== SEO ==================== */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#0A0A0A" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* ==================== PRELOAD ==================== */}
        <link
          rel="preconnect"
          href={process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}
        />
        <link rel="dns-prefetch" href="//images.unsplash.com" />

        {/* ==================== DARK MODE INIT (Prevents FOUC) ==================== */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('zaem_dark_mode');
                  if (saved === 'true') {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>

      <body
        className="bg-ivory text-ink font-body antialiased overflow-x-hidden"
        style={{
          // Smooth font rendering
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
      >
        {/* ==================== SCROLL PROGRESS BAR ==================== */}
        <div
          className="fixed top-0 left-0 right-0 h-[3px] z-[200] bg-transparent pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="h-full bg-ink dark:bg-white transition-all duration-150 ease-out origin-left"
            style={{
              transform: `scaleX(${scrollProgress / 100})`,
              willChange: "transform",
            }}
          />
        </div>

        {/* ==================== OFFLINE BANNER ==================== */}
        {!isOnline && (
          <div className="fixed top-0 left-0 right-0 z-[195] bg-yellow-500 text-ink text-center py-2 text-xs font-body tracking-wider animate-[slideDown_0.3s_ease-out]">
            ⚠️ You are offline. Some features may not work.
          </div>
        )}

        {/* ==================== PAGE LOADER (First Visit) ==================== */}
        {!pageLoaded && (
          <div className="fixed inset-0 z-[300] bg-ivory flex items-center justify-center transition-opacity duration-500 pointer-events-none opacity-0">
            {/* Empty placeholder — loader disables after 800ms */}
          </div>
        )}

        {/* ==================== MAIN APP ==================== */}
        <Navbar />

        <main
          className="min-h-screen transition-opacity duration-300"
          style={{ opacity: pageLoaded ? 1 : 0.95 }}
        >
          {children}
        </main>

        <Footer />

        {/* ==================== DRAWERS / MODALS ==================== */}
        <CartDrawer />

        {/* ==================== FLOATING ACTIONS ==================== */}
        <FloatingActions
          onOpenShopAI={() => setShopAIOpen(true)}
          onOpenSupportAI={() => setSupportAIOpen(true)}
        />

        {/* ==================== AI CHATBOTS (DUAL MODE) ==================== */}
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

        {/* ==================== SCROLL TO TOP BUTTON ==================== */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-40 left-4 md:left-6 z-[85] w-11 h-11 bg-ivory/90 backdrop-blur-md border border-ink/10 text-ink rounded-full flex items-center justify-center shadow-lg hover:bg-ink hover:text-ivory transition-all duration-300 active:scale-95 animate-[fadeIn_0.3s_ease-out]"
            aria-label="Scroll to top"
          >
            <svg
              width="16"
              height="16"
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

        {/* ==================== HIDDEN DATA ATTRIBUTES ==================== */}
        <div
          data-zaem-mode={darkMode ? "dark" : "light"}
          data-zaem-device={isMobile ? "mobile" : "desktop"}
          data-zaem-online={isOnline ? "yes" : "no"}
          data-zaem-scrolled={scrolled ? "yes" : "no"}
          style={{ display: "none" }}
          aria-hidden="true"
        />
      </body>
    </html>
  );
}