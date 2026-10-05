"use client";

import { useState, useEffect } from "react";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import FloatingActions from "@/components/FloatingActions";
import AIChatbot from "@/components/AIChatbot";

// ==================== FONTS (OPTIMIZED) ====================
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

// ==================== MAIN LAYOUT ====================
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ==================== STATE ====================
  const [shopAIOpen, setShopAIOpen] = useState(false);
  const [supportAIOpen, setSupportAIOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // ==================== ONLINE / OFFLINE DETECTION ====================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ==================== MOBILE DETECTION ====================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  // ==================== GLOBAL KEYBOARD SHORTCUTS ====================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleKeyDown = (e: KeyboardEvent) => {
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

      // Escape → Close all modals
      if (e.key === "Escape") {
        setShopAIOpen(false);
        setSupportAIOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ==================== BODY SCROLL LOCK (When AI Open) ====================
  useEffect(() => {
    const anyOpen = shopAIOpen || supportAIOpen;

    if (anyOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [shopAIOpen, supportAIOpen, isMobile]);

  // ==================== PAGE VISIBILITY TRACKING ====================
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

  // ==================== RENDER ====================
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        {/* ==================== ICONS ==================== */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* ==================== THEME COLOR ==================== */}
        <meta name="theme-color" content="#FAF8F4" />

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
          content="default"
        />
        <meta name="apple-mobile-web-app-title" content="ZAEM" />

        {/* ==================== SEO ==================== */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#FAF8F4" />

        {/* ==================== PRECONNECT ==================== */}
        <link
          rel="preconnect"
          href={process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}
        />
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>

      <body className="bg-ivory text-ink font-body antialiased overflow-x-hidden">
        {/* ==================== OFFLINE BANNER ==================== */}
        {!isOnline && (
          <div className="fixed top-0 left-0 right-0 z-[195] bg-ink text-ivory text-center py-2 text-[10px] uppercase tracking-widest font-body">
            ⚠️ You are offline — Some features may not work
          </div>
        )}

        {/* ==================== NAVBAR ==================== */}
        <Navbar />

        {/* ==================== MAIN CONTENT ==================== */}
        <main className="min-h-screen">{children}</main>

        {/* ==================== FOOTER ==================== */}
        <Footer />

        {/* ==================== CART DRAWER ==================== */}
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
      </body>
    </html>
  );
}