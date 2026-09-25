"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Search, Heart, User, ShoppingBag, Menu, X, Moon, Sun, Home, ChevronDown,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { useCartStore } from "@/lib/store/cartStore";
import SearchOverlay from "./SearchOverlay";

const NAV_LINKS = [
  {
    label: "Woman",
    href: "/shop?category=woman",
    children: [
      { label: "New In", href: "/shop?category=woman-new-in" },
      { label: "Ready to Wear", href: "/shop?category=woman-ready-to-wear" },
      {
        label: "Unstitched",
        href: "/shop?category=woman-unstitched",
        children: [
          { label: "Pre-Fall '26", href: "/shop?category=woman-unstitched-pre-fall-26" },
          { label: "Festive '26", href: "/shop?category=woman-unstitched-festive-26" },
          { label: "Intermix '26", href: "/shop?category=woman-unstitched-intermix-26" },
          { label: "Sukoon", href: "/shop?category=woman-unstitched-sukoon" },
          { label: "Andaaz", href: "/shop?category=woman-unstitched-andaaz" },
          { label: "Raunak", href: "/shop?category=woman-unstitched-raunak" },
          { label: "2 Piece", href: "/shop?category=woman-unstitched-2-piece" },
          { label: "3 Piece", href: "/shop?category=woman-unstitched-3-piece" },
          { label: "Festive '26 Catalogue", href: "/shop?category=woman-unstitched-festive-catalogue" },
          { label: "Unstitched Pre-Fall '26", href: "/shop?category=woman-unstitched-pre-fall-catalogue" },
          { label: "Fabric Glossary", href: "/shop?category=woman-unstitched-fabric-glossary" },
        ],
      },
      {
        label: "Winter",
        href: "/shop?category=woman-winter",
        children: [
          { label: "Sweaters", href: "/shop?category=woman-winter-sweaters" },
          { label: "Jackets", href: "/shop?category=woman-winter-jackets" },
          { label: "Coats", href: "/shop?category=woman-winter-coats" },
          { label: "Hoodies", href: "/shop?category=woman-winter-hoodies" },
          { label: "Trench Coats", href: "/shop?category=woman-winter-trench" },
          { label: "Over Coats", href: "/shop?category=woman-winter-overcoat" },
          { label: "Caps & Shawls", href: "/shop?category=woman-winter-caps-shawls" },
        ],
      },
      { label: "West", href: "/shop?category=woman-west" },
      { label: "Modest Wear", href: "/shop?category=woman-modest" },
      { label: "Accessories", href: "/shop?category=woman-accessories" },
      { label: "Special Offers", href: "/shop?category=woman-sale" },
    ],
  },
  {
    label: "Man",
    href: "/shop?category=man",
    children: [
      { label: "New In", href: "/shop?category=man-new-in" },
      { label: "Ready to Wear", href: "/shop?category=man-ready-to-wear" },
      {
        label: "Unstitched",
        href: "/shop?category=man-unstitched",
        children: [
          { label: "Platinum", href: "/shop?category=man-unstitched-platinum" },
          { label: "Gold", href: "/shop?category=man-unstitched-gold" },
          { label: "Silver", href: "/shop?category=man-unstitched-silver" },
          { label: "Latha", href: "/shop?category=man-unstitched-latha" },
          { label: "Boski", href: "/shop?category=man-unstitched-boski" },
          { label: "Khadar", href: "/shop?category=man-unstitched-khadar" },
          { label: "Silk Boski", href: "/shop?category=man-unstitched-silk-boski" },
          { label: "Cotton", href: "/shop?category=man-unstitched-cotton" },
          { label: "Cotton Silk", href: "/shop?category=man-unstitched-cotton-silk" },
          { label: "Raw Silk", href: "/shop?category=man-unstitched-raw-silk" },
        ],
      },
      {
        label: "Winter",
        href: "/shop?category=man-winter",
        children: [
          { label: "Sweaters", href: "/shop?category=man-winter-sweaters" },
          { label: "Jackets", href: "/shop?category=man-winter-jackets" },
          { label: "Coats", href: "/shop?category=man-winter-coats" },
          { label: "Hoodies", href: "/shop?category=man-winter-hoodies" },
          { label: "Trench Coats", href: "/shop?category=man-winter-trench" },
          { label: "Over Coats", href: "/shop?category=man-winter-overcoat" },
        ],
      },
      { label: "West", href: "/shop?category=man-west" },
      { label: "Accessories", href: "/shop?category=man-accessories" },
    ],
  },
  {
    label: "Fragrances",
    href: "/shop?category=fragrances",
    children: [
      {
        label: "For Her",
        href: "/shop?category=fragrances-her",
        children: [
          { label: "Perfumes", href: "/shop?category=fragrances-her-perfumes" },
          { label: "Body Mists", href: "/shop?category=fragrances-her-mists" },
        ],
      },
      {
        label: "For Him",
        href: "/shop?category=fragrances-him",
        children: [
          { label: "Perfumes", href: "/shop?category=fragrances-him-perfumes" },
          { label: "Body Mists", href: "/shop?category=fragrances-him-mists" },
        ],
      },
      { label: "Sets", href: "/shop?category=fragrances-sets" },
      { label: "Shop by Scent", href: "/shop?category=fragrances-by-scent" },
    ],
  },
  {
    label: "Bags",
    href: "/shop?category=bags",
    children: [
      { label: "All Bags", href: "/shop?category=bags" },
      { label: "Handbags", href: "/shop?category=bags-handbags" },
      { label: "Totes", href: "/shop?category=bags-totes" },
      { label: "Clutches", href: "/shop?category=bags-clutches" },
    ],
  },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [megaMenu, setMegaMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string[]>([]);

  const { user, isAuthenticated, logout, loadFromStorage, token } = useAuthStore();
  const { itemCount, openCart, setCart } = useCartStore();

  useEffect(() => { loadFromStorage(); }, [loadFromStorage]);

  useEffect(() => {
    const saved = localStorage.getItem("zaem_dark_mode");
    if (saved === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    const fetchCartCount = async () => {
      if (!isAuthenticated || !token) { setCart([], 0, 0); return; }
      try {
        const res = await fetch(`${API_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setCart(data.data.cart.items, data.data.cart.itemCount, data.data.cart.subtotal);
      } catch (error) { console.error(error); }
    };
    fetchCartCount();
  }, [isAuthenticated, token, setCart]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => { if (!mobileOpen) setMobileExpanded([]); }, [mobileOpen]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("zaem_dark_mode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("zaem_dark_mode", "false");
    }
  };

  const toggleMobileExpand = (key: string) => {
    setMobileExpanded((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <>
      <div className="bg-ink text-ivory py-2 overflow-hidden">
        <div className="flex animate-[marquee_40s_linear_infinite] whitespace-nowrap will-change-transform">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex shrink-0">
              <span className="text-label px-8">Free Shipping on Orders Above Rs. 5,000</span>
              <span className="text-label px-8 text-gold">✦</span>
              <span className="text-label px-8">New Arrivals — Autumn Collection 2026</span>
              <span className="text-label px-8 text-gold">✦</span>
              <span className="text-label px-8">7-Day Easy Returns</span>
              <span className="text-label px-8 text-gold">✦</span>
            </div>
          ))}
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled ? "bg-ivory/75 backdrop-blur-2xl border-b border-ink/5 shadow-sm" : "bg-ivory"
        }`}
        onMouseLeave={() => setMegaMenu(null)}
      >
        <nav className="max-w-[1800px] mx-auto px-4 md:px-10 lg:px-16">
          <div className="flex items-center justify-between h-16 md:h-24">

            <div className="flex-1">
              <Link href="/" className="group inline-flex flex-col items-start">
                <span className="font-display text-xl md:text-3xl tracking-[0.25em] leading-none group-hover:text-gold transition-colors duration-500">ZAEM</span>
                <span className="text-[7px] md:text-[8px] tracking-[0.5em] text-muted mt-0.5 md:mt-1 opacity-60 group-hover:opacity-100 transition-opacity duration-500">EST. 2026</span>
              </Link>
            </div>

            <div className="hidden lg:flex items-center gap-10 flex-shrink-0">
              {NAV_LINKS.map((link) => (
                <div key={link.href} className="relative" onMouseEnter={() => setMegaMenu(link.label)}>
                  <Link href={link.href} className="text-label link-underline hover:text-gold transition-colors duration-500 flex items-center gap-1">
                    {link.label}
                    {link.children && (
                      <ChevronDown className={`w-3 h-3 opacity-50 transition-transform duration-500 ${megaMenu === link.label ? "rotate-180" : ""}`} strokeWidth={1.5} />
                    )}
                  </Link>

                  {megaMenu === link.label && link.children && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 min-w-[240px] animate-[fadeIn_0.3s_ease-out]">
                      <div className="bg-ivory border border-ink/10 shadow-2xl py-4 backdrop-blur-xl">
                        <p className="text-label text-gold px-5 pb-3 border-b border-ink/5 mb-2">{link.label}</p>

                        {link.children.map((child: any, idx: number) => {
                          if (child.children && child.children.length > 0) {
                            return (
                              <div key={child.href + child.label} className="group/sub relative">
                                <Link
                                  href={child.href}
                                  className="flex items-center justify-between px-5 py-2.5 text-sm font-body hover:bg-bone hover:text-gold transition-colors duration-300"
                                  style={{ animation: `revealUp 0.4s ease-out ${idx * 0.05}s both` }}
                                >
                                  {child.label}
                                  <ChevronDown className="w-3 h-3 -rotate-90 opacity-40 group-hover/sub:opacity-100 group-hover/sub:translate-x-0.5 transition-all duration-300" strokeWidth={1.5} />
                                </Link>

                                <div className="absolute left-full top-0 ml-1 hidden group-hover/sub:block min-w-[220px] z-50">
                                  <div className="bg-ivory border border-ink/10 shadow-2xl py-3 max-h-[500px] overflow-y-auto">
                                    {child.children.map((grandchild: any) => (
                                      <Link
                                        key={grandchild.href + grandchild.label}
                                        href={grandchild.href}
                                        className="block px-5 py-2 text-sm font-body hover:bg-bone hover:text-gold transition-colors"
                                      >
                                        {grandchild.label}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <Link
                              key={child.href + child.label}
                              href={child.href}
                              className="block px-5 py-2.5 text-sm font-body hover:bg-bone hover:text-gold transition-colors duration-300 relative group/item"
                              style={{ animation: `revealUp 0.4s ease-out ${idx * 0.05}s both` }}
                            >
                              <span className="flex items-center justify-between">
                                {child.label}
                                <span className="w-0 h-px bg-gold group-hover/item:w-6 transition-all duration-300" />
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex-1 flex items-center justify-end gap-1 md:gap-3">
              <button onClick={() => setMobileOpen(true)} className="lg:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-bone transition-all duration-500">
                <Menu className="w-5 h-5" strokeWidth={1.5} />
              </button>

              <button onClick={toggleDarkMode} className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-bone hover:text-gold transition-all duration-500">
                {darkMode ? <Sun className="w-4 h-4" strokeWidth={1.5} /> : <Moon className="w-4 h-4" strokeWidth={1.5} />}
              </button>

              <button onClick={() => setSearchOpen(true)} className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-bone hover:text-gold transition-all duration-500">
                <Search className="w-4 h-4" strokeWidth={1.5} />
              </button>

              <Link href="/wishlist" className="hidden md:flex items-center justify-center w-9 h-9 rounded-full hover:bg-bone hover:text-gold transition-all duration-500">
                <Heart className="w-4 h-4" strokeWidth={1.5} />
              </Link>

              {isAuthenticated ? (
                <div className="relative hidden md:block" onMouseEnter={() => setAccountDropdownOpen(true)} onMouseLeave={() => setAccountDropdownOpen(false)}>
                  <button className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-bone hover:text-gold transition-all duration-500">
                    <User className="w-4 h-4" strokeWidth={1.5} />
                  </button>

                  {accountDropdownOpen && (
                    <div className="absolute right-0 top-full pt-3 w-64 z-50 animate-[fadeIn_0.3s_ease-out]">
                      <div className="bg-ivory border border-ink/10 shadow-2xl backdrop-blur-xl">
                        <div className="px-5 py-4 border-b border-ink/10">
                          <p className="text-label text-muted mb-1">Welcome</p>
                          <p className="font-display text-lg truncate">{user?.name}</p>
                          <p className="text-xs text-muted font-body mt-1 truncate">{user?.email}</p>
                        </div>
                        <div className="py-2">
                          <Link href="/account" className="block px-5 py-2.5 text-sm hover:bg-bone hover:text-gold transition-colors font-body">My Account</Link>
                          <Link href="/account/orders" className="block px-5 py-2.5 text-sm hover:bg-bone hover:text-gold transition-colors font-body">My Orders</Link>
                          <Link href="/account/addresses" className="block px-5 py-2.5 text-sm hover:bg-bone hover:text-gold transition-colors font-body">My Addresses</Link>
                          <Link href="/wishlist" className="block px-5 py-2.5 text-sm hover:bg-bone hover:text-gold transition-colors font-body">My Wishlist</Link>
                        </div>
                        <div className="border-t border-ink/10">
                          <button onClick={() => { logout(); setAccountDropdownOpen(false); }} className="w-full text-left px-5 py-3 text-sm hover:bg-bone transition-colors font-body text-gold">
                            Logout
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/account/login" className="hidden md:flex items-center justify-center w-9 h-9 rounded-full hover:bg-bone hover:text-gold transition-all duration-500">
                  <User className="w-4 h-4" strokeWidth={1.5} />
                </Link>
              )}

              <button onClick={openCart} className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-bone hover:text-gold transition-all duration-500">
                <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-gold text-ivory text-[9px] font-medium w-4 h-4 rounded-full flex items-center justify-center animate-[pulseGold_3s_ease-in-out_infinite]">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      <div className={`fixed inset-0 z-[100] ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-500 ${mobileOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setMobileOpen(false)} />

        <div
          className={`absolute top-0 left-0 w-screen max-w-full md:max-w-[420px] bg-ivory shadow-2xl flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
          style={{ height: "100dvh", maxHeight: "100dvh" }}
        >
          <div className="flex items-center justify-between h-20 px-5 border-b border-ink/10 shrink-0">
            <Link href="/" className="group inline-flex flex-col items-start" onClick={() => setMobileOpen(false)}>
              <span className="font-display text-xl tracking-[0.25em] leading-none">ZAEM</span>
              <span className="text-[7px] tracking-[0.5em] text-muted mt-1 opacity-60">EST. 2026</span>
            </Link>
            <div className="flex items-center gap-1">
              <button onClick={toggleDarkMode} className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-bone transition-colors">
                {darkMode ? <Sun className="w-4 h-4" strokeWidth={1.5} /> : <Moon className="w-4 h-4" strokeWidth={1.5} />}
              </button>
              <button onClick={() => setMobileOpen(false)} className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-bone transition-colors">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}>
            <nav className="px-5 py-4">
              <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 font-display text-2xl py-4 border-b border-ink/10 hover:text-gold transition-colors">
                <Home className="w-5 h-5" strokeWidth={1.5} />
                Home
              </Link>

              {NAV_LINKS.map((link) => {
                const isExpanded = mobileExpanded.includes(link.label);
                return (
                  <div key={link.href} className="border-b border-ink/10">
                    <button onClick={() => toggleMobileExpand(link.label)} className="w-full flex items-center justify-between font-display text-2xl py-4 hover:text-gold transition-colors text-left">
                      <span>{link.label}</span>
                      <ChevronDown className={`w-5 h-5 shrink-0 opacity-60 transition-transform duration-500 ${isExpanded ? "rotate-180" : ""}`} strokeWidth={1.5} />
                    </button>

                    {link.children && (
                      <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isExpanded ? "max-h-[1500px] opacity-100 pb-3" : "max-h-0 opacity-0"}`}>
                        <div className="pl-4 space-y-1">
                          <Link href={link.href} onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm font-body text-gold hover:text-ink transition-colors border-b border-ink/5">
                            View All {link.label}
                          </Link>

                          {link.children.map((child: any) => {
                            if (child.children && child.children.length > 0) {
                              const childKey = `${link.label}-${child.label}`;
                              const isChildExpanded = mobileExpanded.includes(childKey);

                              return (
                                <div key={child.href + child.label}>
                                  <button onClick={() => toggleMobileExpand(childKey)} className="w-full flex items-center justify-between py-2.5 text-sm font-body text-muted hover:text-gold transition-colors text-left">
                                    <span>{child.label}</span>
                                    <ChevronDown className={`w-4 h-4 shrink-0 opacity-60 transition-transform duration-500 ${isChildExpanded ? "rotate-180" : ""}`} strokeWidth={1.5} />
                                  </button>

                                  <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isChildExpanded ? "max-h-[600px] opacity-100 pb-2" : "max-h-0 opacity-0"}`}>
                                    <div className="pl-4 space-y-1">
                                      <Link href={child.href} onClick={() => setMobileOpen(false)} className="block py-2 text-xs font-body text-gold hover:text-ink transition-colors">
                                        View All {child.label}
                                      </Link>

                                      {child.children.map((grandchild: any) => (
                                        <Link
                                          key={grandchild.href + grandchild.label}
                                          href={grandchild.href}
                                          onClick={() => setMobileOpen(false)}
                                          className="block py-2 text-xs font-body text-muted hover:text-gold transition-colors"
                                        >
                                          {grandchild.label}
                                        </Link>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <Link key={child.href + child.label} href={child.href} onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm font-body text-muted hover:text-gold transition-colors">
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {isAuthenticated ? (
                <>
                  <Link href="/account" onClick={() => setMobileOpen(false)} className="block font-display text-xl py-4 border-b border-ink/10 hover:text-gold transition-colors">My Account</Link>
                  <Link href="/account/orders" onClick={() => setMobileOpen(false)} className="block font-display text-xl py-4 border-b border-ink/10 hover:text-gold transition-colors">My Orders</Link>
                  <Link href="/wishlist" onClick={() => setMobileOpen(false)} className="block font-display text-xl py-4 border-b border-ink/10 hover:text-gold transition-colors">Wishlist</Link>
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="block w-full text-left font-display text-xl py-4 text-gold border-b border-ink/10">Logout</button>
                </>
              ) : (
                <Link href="/account/login" onClick={() => setMobileOpen(false)} className="block font-display text-xl py-4 border-b border-ink/10 hover:text-gold transition-colors">Login</Link>
              )}
            </nav>
          </div>

          <div className="p-5 border-t border-ink/10 shrink-0 bg-bone/30">
            <p className="text-label text-gold mb-2">Contact</p>
            <p className="font-body text-sm text-muted mb-1">zaemlifestyle@gmail.com</p>
            <p className="font-body text-sm text-muted">+92 319 3773788</p>
          </div>
        </div>
      </div>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}