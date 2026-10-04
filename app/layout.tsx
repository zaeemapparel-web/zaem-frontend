"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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

// ==================== CONSTANTS ====================
const SCROLL_TOP_THRESHOLD = 800;
const LOADER_DURATION = 600;
const SESSION_KEY = "zaem_session_start";
const VISITED_KEY = "zaem_visited";

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
  const [isTablet, setIsTablet] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("down");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // ==================== REFS ====================
  const rafRef = useRef<number | null>(null);
  const tickingRef = useRef(false);
  const lastScrollY = useRef(0);

  // ==================== 1. DARK MODE INIT ====================
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("zaem_dark_mode");
      if (saved === "true") {
        setDarkMode(true);
        document.documentElement.classList.add("dark");
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // ==================== 2. PREFERS REDUCED MOTION ====================
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
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
      localStorage.setItem(SESSION_KEY, Date.now().toString());
    } catch (e) {
      // ignore
    }
  }, []);

  // ==================== 4. ONLINE/OFFLINE DETECTION ====================
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

  // ==================== 5. RESPONSIVE DETECTION ====================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // ==================== 6. SCROLL TRACKING (RAF Optimized) ====================
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

        // Progress (0-100)
        const progress =
          documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;
        setScrollProgress(Math.min(100, Math.max(0, progress)));

        // Scrolled state
        setScrolled(scrollTop > 50);

        // Scroll direction
        if (scrollTop > lastScrollY.current + 5) {
          setScrollDirection("down");
        } else if (scrollTop < lastScrollY.current - 5) {
          setScrollDirection("up");
        }
        lastScrollY.current = scrollTop;

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

  // ==================== 7. PAGE LOADED FLAG ====================
  useEffect(() => {
    const timer = setTimeout(() => setPageLoaded(true), LOADER_DURATION);
    return () => clearTimeout(timer);
  }, []);

  // ==================== 8. KEYBOARD SHORTCUTS ====================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in input
      const target = e.target as HTMLElement;
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
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setShopAIOpen(true);
        return;
      }

      // Ctrl/Cmd + Shift + S → Support AI
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setSupportAIOpen(true);
        return;
      }

      // Ctrl/Cmd + Shift + C → Cart
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("zaem-open-cart"));
        return;
      }

      // Escape → Close all
      if (e.key === "Escape") {
        setShopAIOpen(false);
        setSupportAIOpen(false);
        setCartOpen(false);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ==================== 9. CART EVENTS ====================
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

  // ==================== 10. AI CHAT EVENTS ====================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOpenShopAI = () => setShopAIOpen(true);
    const handleOpenSupportAI = () => setSupportAIOpen(true);

    window.addEventListener("zaem-open-shop-ai", handleOpenShopAI);
    window.addEventListener("zaem-open-support-ai", handleOpenSupportAI);

    return () => {
      window.removeEventListener("zaem-open-shop-ai", handleOpenShopAI);
      window.removeEventListener("zaem-open-support-ai", handleOpenSupportAI);
    };
  }, []);

  // ==================== 11. BODY SCROLL LOCK ====================
  useEffect(() => {
    const anyOpen = shopAIOpen || supportAIOpen || cartOpen;

    if (anyOpen && isMobile) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${window.scrollY}px`;
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
  }, [shopAIOpen, supportAIOpen, cartOpen, isMobile]);

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
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
  }, []);

  // ==================== 13. SCROLL TO TOP ====================
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ==================== 14. TOGGLE DARK MODE ====================
  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const newMode = !prev;
      try {
        if (newMode) {
          document.documentElement.classList.add("dark");
          localStorage.setItem("zaem_dark_mode", "true");
        } else {
          document.documentElement.classList.remove("dark");
          localStorage.setItem("zaem_dark_mode", "false");
        }
      } catch (e) {
        // ignore
      }
      return newMode;
    });
  }, []);

  // ==================== 15. ANY MODAL OPEN ====================
  const anyModalOpen = useMemo(
    () => shopAIOpen || supportAIOpen || cartOpen,
    [shopAIOpen, supportAIOpen, cartOpen]
  );

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

        {/* ==================== SEO / MISC ==================== */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#0A0A0A" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* ==================== PRELOAD / PRECONNECT ==================== */}
        <link
          rel="preconnect"
          href={process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}
        />
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* ==================== DARK MODE FOUC PREVENTION ==================== */}
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

        {/* ==================== GLOBAL STYLES ==================== */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Prevent horizontal scroll */
              html, body { max-width: 100vw; overflow-x: hidden; }
              
              /* Smooth font rendering */
              body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
              
              /* Better tap highlights on mobile */
              * { -webkit-tap-highlight-color: transparent; }
              
              /* Prevent text size adjust on iOS */
              html { -webkit-text-size-adjust: 100%; }
              
              /* Safe area for notched devices */
              body { padding-left: env(safe-area-inset-left); padding-right: env(safe-area-inset-right); }
            `,
          }}
        />
      </head>

      <body className="bg-ivory text-ink font-body antialiased overflow-x-hidden">
        {/* ==================== SCROLL PROGRESS BAR ==================== */}
        <div className="fixed top-0 left-0 right-0 h-[3px] z-[200] bg-transparent pointer-events-none">
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

        {/* ==================== PAGE LOADER ==================== */}
        {!pageLoaded && (
          <div className="fixed inset-0 z-[300] bg-ivory flex items-center justify-center transition-opacity duration-300 pointer-events-none opacity-0">
            {/* Reserved for future loader */}
          </div>
        )}

        {/* ==================== NAVBAR ==================== */}
        <Navbar />

        {/* ==================== MAIN CONTENT ==================== */}
        <main
          className="min-h-screen transition-opacity duration-300"
          style={{ opacity: pageLoaded ? 1 : 0.98 }}
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

        {/* ==================== HIDDEN DATA ATTRS ==================== */}
        <div
          data-zaem-mode={darkMode ? "dark" : "light"}
          data-zaem-device={isMobile ? "mobile" : isTablet ? "tablet" : "desktop"}
          data-zaem-online={isOnline ? "yes" : "no"}
          data-zaem-scrolled={scrolled ? "yes" : "no"}
          data-zaem-direction={scrollDirection}
          data-zaem-modal={anyModalOpen ? "open" : "closed"}
          data-zaem-motion={prefersReducedMotion ? "reduced" : "full"}
          data-zaem-visit={isFirstVisit ? "first" : "return"}
          style={{ display: "none" }}
          aria-hidden="true"
        />
      </body>
    </html>
  );
}