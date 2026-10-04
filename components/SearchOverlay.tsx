"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  X,
  Search,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Loader2,
  ShoppingBag,
  ChevronRight,
  Command,
  CornerDownLeft,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ==================== CONSTANTS ====================
const RECENT_KEY = "zaem_search_history";
const MAX_RECENT = 6;

const TRENDING = [
  "Oud Perfume",
  "Linen Shirt",
  "Leather Tote",
  "Silk Dress",
  "Cashmere Coat",
  "Winter Jacket",
];

const POPULAR_CATEGORIES = [
  { name: "Woman", slug: "woman", emoji: "👗" },
  { name: "Man", slug: "man", emoji: "👔" },
  { name: "Fragrances", slug: "fragrances", emoji: "💫" },
  { name: "Bags", slug: "bags", emoji: "👜" },
];

// ==================== TYPES ====================
interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAISearch?: () => void;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category?: { name: string; slug: string };
  stock: number;
}

// ==================== HELPERS ====================
function getStoredHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(RECENT_KEY);
    return saved ? JSON.parse(saved).slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

// ==================== MAIN COMPONENT ====================
export default function SearchOverlay({
  isOpen,
  onClose,
  onOpenAISearch,
}: SearchOverlayProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [activeResultIndex, setActiveResultIndex] = useState(-1);
  const [mounted, setMounted] = useState(false);

  // ==================== FOCUS & RESET ON OPEN ====================
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setHistory(getStoredHistory());
      setQuery("");
      setResults([]);
      setActiveResultIndex(-1);
      // Delay focus for animation
      setTimeout(() => inputRef.current?.focus(), 180);
    } else {
      const timer = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ==================== BODY SCROLL LOCK ====================
  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  // ==================== DEBOUNCE ====================
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 280);
    return () => clearTimeout(timer);
  }, [query]);

  // ==================== LIVE SEARCH ====================
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/products?search=${encodeURIComponent(
            debouncedQuery
          )}&limit=8`
        );
        const data = await res.json();
        if (data.success) {
          setResults(data.data.products || []);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  // ==================== SAVE HISTORY ====================
  const saveToHistory = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      const updated = [
        trimmed,
        ...history.filter((h) => h !== trimmed),
      ].slice(0, MAX_RECENT);
      setHistory(updated);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
    },
    [history]
  );

  // ==================== HANDLERS ====================
  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      const trimmed = query.trim();
      if (!trimmed) return;

      saveToHistory(trimmed);
      router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
      onClose();
    },
    [query, router, onClose, saveToHistory]
  );

  const handleTermClick = useCallback(
    (term: string) => {
      saveToHistory(term);
      router.push(`/shop?search=${encodeURIComponent(term)}`);
      onClose();
    },
    [router, onClose, saveToHistory]
  );

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch {
      // Ignore
    }
  }, []);

  const handleAISearchClick = useCallback(() => {
    onClose();
    if (onOpenAISearch) {
      setTimeout(() => onOpenAISearch(), 250);
    }
  }, [onClose, onOpenAISearch]);

  // ==================== KEYBOARD NAVIGATION ====================
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveResultIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveResultIndex((prev) => (prev > 0 ? prev - 1 : -1));
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (activeResultIndex >= 0 && results[activeResultIndex]) {
          const product = results[activeResultIndex];
          saveToHistory(query);
          router.push(`/product/${product.slug}`);
          onClose();
        } else {
          handleSubmit();
        }
        return;
      }
    },
    [
      results,
      activeResultIndex,
      query,
      router,
      onClose,
      handleSubmit,
      saveToHistory,
    ]
  );

  // ==================== ESC TO CLOSE ====================
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // ==================== FORMATTERS ====================
  const formatPrice = (price: number) =>
    `Rs. ${price.toLocaleString("en-PK")}`;

  const hasQuery = query.trim().length > 0;
  const showResults = hasQuery && (loading || results.length > 0);
  const showEmptyResults = hasQuery && !loading && results.length === 0;

  if (!isOpen && !mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] transition-opacity duration-200 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* ==================== BACKDROP ==================== */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />

      {/* ==================== PANEL ==================== */}
      <div
        ref={panelRef}
        className={`absolute inset-x-0 top-0 max-h-[92vh] bg-ivory shadow-2xl flex flex-col transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-4 opacity-0"
        }`}
      >
        {/* ==================== SEARCH INPUT HEADER ==================== */}
        <div className="shrink-0 border-b border-ink/10 bg-ivory">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 md:py-5">
            {/* Top row: label + close */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-ink/40" strokeWidth={2} />
                <p className="text-[10px] uppercase tracking-[0.25em] text-ink/50 font-body font-medium">
                  Search ZAEM
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center hover:bg-ink/5 rounded-full transition-colors active:scale-90"
                aria-label="Close search"
              >
                <X className="w-5 h-5 text-ink/70" strokeWidth={2} />
              </button>
            </div>

            {/* Input field */}
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-center gap-3 bg-white border border-ink/15 rounded-xl px-4 py-3.5 focus-within:border-ink/40 transition-all duration-200">
                <Search
                  className="w-5 h-5 text-ink/40 shrink-0"
                  strokeWidth={1.8}
                />

                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveResultIndex(-1);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search products, categories..."
                  className="flex-1 bg-transparent outline-none text-[15px] md:text-base font-body text-ink placeholder:text-ink/40"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />

                {query && !loading && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setActiveResultIndex(-1);
                      inputRef.current?.focus();
                    }}
                    className="w-6 h-6 flex items-center justify-center hover:bg-ink/5 rounded-full transition-colors shrink-0"
                    aria-label="Clear"
                  >
                    <X className="w-3.5 h-3.5 text-ink/50" strokeWidth={2} />
                  </button>
                )}

                {loading && (
                  <Loader2
                    className="w-4 h-4 text-ink/40 animate-spin shrink-0"
                    strokeWidth={2}
                  />
                )}

                {!loading && !query && (
                  <div className="hidden md:flex items-center gap-1 shrink-0">
                    <kbd className="px-1.5 py-0.5 bg-bone text-[9px] font-body text-ink/50 rounded border border-ink/10">
                      ESC
                    </kbd>
                  </div>
                )}
              </div>
            </form>

            {/* ==================== AI SEARCH BUTTON (PROMINENT) ==================== */}
            {onOpenAISearch && (
              <button
                onClick={handleAISearchClick}
                className="mt-3 w-full flex items-center justify-between gap-3 px-4 py-3 bg-ink text-white rounded-xl hover:bg-ink/90 active:scale-[0.99] transition-all duration-200 group shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                    <Sparkles
                      className="w-4 h-4 text-white"
                      strokeWidth={2}
                    />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <p className="text-sm font-body font-medium leading-tight">
                      Search with AI
                    </p>
                    <p className="text-[11px] text-white/60 font-body leading-tight mt-0.5 truncate">
                      "shaadi ke liye red dress under 5000"
                    </p>
                  </div>
                </div>
                <ArrowRight
                  className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition-transform shrink-0"
                  strokeWidth={2}
                />
              </button>
            )}
          </div>
        </div>

        {/* ==================== BODY ==================== */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6">
            {/* ==================== LOADING ==================== */}
            {loading && !results.length && (
              <div className="py-12 flex flex-col items-center gap-3">
                <Loader2
                  className="w-5 h-5 text-ink/40 animate-spin"
                  strokeWidth={2}
                />
                <p className="text-[11px] uppercase tracking-widest text-ink/50 font-body">
                  Searching...
                </p>
              </div>
            )}

            {/* ==================== RESULTS ==================== */}
            {!loading && results.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-ink/50 font-body font-medium">
                    {results.length}{" "}
                    {results.length === 1 ? "Result" : "Results"}
                  </p>
                  <button
                    onClick={handleSubmit}
                    className="text-[10px] uppercase tracking-[0.2em] text-ink/50 hover:text-ink font-body font-medium transition-colors flex items-center gap-1"
                  >
                    View All
                    <ChevronRight className="w-3 h-3" strokeWidth={2} />
                  </button>
                </div>

                {/* Product grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {results.map((product, idx) => {
                    const hasDiscount =
                      product.comparePrice &&
                      product.comparePrice > product.price;
                    const isActive = idx === activeResultIndex;

                    return (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        onClick={() => {
                          saveToHistory(query);
                          onClose();
                        }}
                        onMouseEnter={() => setActiveResultIndex(idx)}
                        onMouseLeave={() => setActiveResultIndex(-1)}
                        className={`group block transition-all duration-200 ${
                          isActive ? "scale-[1.02]" : ""
                        }`}
                      >
                        <div
                          className={`relative aspect-[3/4] bg-bone rounded-lg overflow-hidden mb-2.5 transition-all duration-300 ${
                            isActive
                              ? "ring-2 ring-ink ring-offset-2 ring-offset-ivory"
                              : ""
                          }`}
                        >
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag
                                className="w-8 h-8 text-ink/15"
                                strokeWidth={1.5}
                              />
                            </div>
                          )}

                          {hasDiscount && (
                            <div className="absolute top-2 left-2 bg-ink text-white text-[9px] tracking-widest uppercase px-2 py-1 rounded">
                              Sale
                            </div>
                          )}
                        </div>

                        <p className="text-[9px] uppercase tracking-widest text-ink/50 font-body mb-1 truncate">
                          {product.category?.name || "ZAEM"}
                        </p>
                        <h3 className="font-display text-sm md:text-base leading-tight line-clamp-2 mb-1 group-hover:text-ink/70 transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <p className="font-body text-xs md:text-sm text-ink font-medium">
                            {formatPrice(product.price)}
                          </p>
                          {hasDiscount && (
                            <p className="font-body text-[10px] text-ink/40 line-through">
                              {formatPrice(product.comparePrice!)}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Bottom AI Suggestion */}
                {onOpenAISearch && (
                  <button
                    onClick={handleAISearchClick}
                    className="mt-6 w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border border-ink/10 rounded-xl hover:border-ink/30 hover:shadow-sm transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 bg-ink rounded-lg flex items-center justify-center shrink-0">
                        <Sparkles
                          className="w-4 h-4 text-white"
                          strokeWidth={2}
                        />
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <p className="text-sm font-body font-medium text-ink leading-tight">
                          Didn't find what you need?
                        </p>
                        <p className="text-[11px] text-ink/50 font-body leading-tight mt-0.5">
                          Try AI search for better results
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight
                      className="w-4 h-4 text-ink/40 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0"
                      strokeWidth={2}
                    />
                  </button>
                )}
              </div>
            )}

            {/* ==================== NO RESULTS ==================== */}
            {showEmptyResults && (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-bone rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search
                    className="w-6 h-6 text-ink/30"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="font-display text-xl md:text-2xl text-ink mb-2">
                  No results found
                </h3>
                <p className="text-ink/50 font-body text-sm mb-6 max-w-md mx-auto">
                  We couldn't find anything for "{debouncedQuery}". Try a
                  different keyword.
                </p>

                {onOpenAISearch && (
                  <button
                    onClick={handleAISearchClick}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-white rounded-full text-sm font-body hover:bg-ink/90 active:scale-95 transition-all duration-200"
                  >
                    <Sparkles className="w-4 h-4" strokeWidth={2} />
                    Try AI Search
                  </button>
                )}
              </div>
            )}

            {/* ==================== DEFAULT STATE ==================== */}
            {!hasQuery && (
              <div className="space-y-8">
                {/* ============ RECENT SEARCHES ============ */}
                {history.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock
                          className="w-3.5 h-3.5 text-ink/40"
                          strokeWidth={2}
                        />
                        <p className="text-[10px] uppercase tracking-[0.2em] text-ink/50 font-body font-medium">
                          Recent
                        </p>
                      </div>
                      <button
                        onClick={handleClearHistory}
                        className="text-[10px] uppercase tracking-[0.2em] text-ink/40 hover:text-ink/70 font-body font-medium transition-colors"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {history.map((term) => (
                        <button
                          key={term}
                          onClick={() => handleTermClick(term)}
                          className="px-3.5 py-2 bg-white border border-ink/10 rounded-full text-xs font-body text-ink/80 hover:border-ink/30 hover:bg-ink hover:text-white transition-all duration-200 active:scale-95"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ============ TRENDING ============ */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp
                      className="w-3.5 h-3.5 text-ink/40"
                      strokeWidth={2}
                    />
                    <p className="text-[10px] uppercase tracking-[0.2em] text-ink/50 font-body font-medium">
                      Trending Now
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {TRENDING.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleTermClick(term)}
                        className="px-3.5 py-2 bg-white border border-ink/10 rounded-full text-xs font-body text-ink/80 hover:border-ink/30 hover:bg-ink hover:text-white transition-all duration-200 active:scale-95"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ============ CATEGORIES ============ */}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-ink/50 font-body font-medium mb-3">
                    Shop by Category
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3">
                    {POPULAR_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/shop?category=${cat.slug}`}
                        onClick={onClose}
                        className="group flex items-center gap-3 p-3.5 bg-white border border-ink/10 rounded-xl hover:border-ink/30 hover:shadow-sm transition-all duration-200 active:scale-[0.98]"
                      >
                        <div className="w-9 h-9 bg-bone rounded-full flex items-center justify-center text-lg shrink-0 group-hover:bg-ink/5 transition-colors">
                          {cat.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-sm font-medium text-ink truncate">
                            {cat.name}
                          </p>
                        </div>
                        <ChevronRight
                          className="w-4 h-4 text-ink/30 group-hover:text-ink group-hover:translate-x-0.5 transition-all shrink-0"
                          strokeWidth={2}
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ==================== FOOTER HINT ==================== */}
        <div className="shrink-0 border-t border-ink/10 bg-bone/40 hidden md:block">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between text-[10px] text-ink/50 font-body">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-white border border-ink/10 rounded text-[9px] font-medium">
                  ↑
                </kbd>
                <kbd className="px-1.5 py-0.5 bg-white border border-ink/10 rounded text-[9px] font-medium">
                  ↓
                </kbd>
                <span>Navigate</span>
              </div>

              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-white border border-ink/10 rounded text-[9px] font-medium">
                  <CornerDownLeft className="w-2.5 h-2.5 inline" />
                </kbd>
                <span>Select</span>
              </div>

              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-white border border-ink/10 rounded text-[9px] font-medium">
                  ESC
                </kbd>
                <span>Close</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-ink/40" strokeWidth={2} />
              <span>Powered by ZAEM AI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}