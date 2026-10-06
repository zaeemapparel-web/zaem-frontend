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
  CornerDownLeft,
  Mic,
  MicOff,
  Camera,
  Share2,
  Check,
  Star,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ==================== CONSTANTS ====================
const RECENT_KEY = "zaem_search_history";
const ANALYTICS_KEY = "zaem_search_analytics";
const MAX_RECENT = 6;
const MAX_SUGGESTIONS = 5;
const DEBOUNCE_DELAY = 280;

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

const AI_PROMPTS = [
  "Shaadi ke liye red dress under 5000",
  "Winter jacket under 8000",
  "Gift for him under 3000",
  "Casual white shirt",
  "Perfume for her",
];

const SORT_OPTIONS = [
  { label: "Popular", value: "popular" },
  { label: "Price ↑", value: "price-asc" },
  { label: "Price ↓", value: "price-desc" },
  { label: "Newest", value: "newest" },
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
  soldCount?: number;
}

interface Suggestion {
  type: "product" | "category" | "term";
  text: string;
  slug?: string;
  count?: number;
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

function saveAnalytics(term: string) {
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem(ANALYTICS_KEY);
    const data: Record<string, number> = stored ? JSON.parse(stored) : {};
    const key = term.toLowerCase().trim();
    data[key] = (data[key] || 0) + 1;
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
  } catch {
    // Ignore
  }
}

function getTopSearches(limit = 5): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(ANALYTICS_KEY);
    if (!stored) return [];
    const data: Record<string, number> = JSON.parse(stored);
    return Object.entries(data)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([term]) => term);
  } catch {
    return [];
  }
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <mark className="bg-[#FFEB3B] dark:bg-[#FFEB3B]/30 text-[#1D1D1F] dark:text-white px-0.5 rounded">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  );
}

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString("en-PK")}`;
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

  // ==================== STATE ====================
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [topSearches, setTopSearches] = useState<string[]>([]);
  const [activeResultIndex, setActiveResultIndex] = useState(-1);
  const [mounted, setMounted] = useState(false);
  const [sortBy, setSortBy] = useState("popular");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedSearch, setCopiedSearch] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const recognitionRef = useRef<any>(null);

  // ==================== MOBILE + REDUCED MOTION ====================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);

    return () => {
      window.removeEventListener("resize", checkMobile);
      mq.removeEventListener("change", handler);
    };
  }, []);

  // ==================== VOICE SUPPORT CHECK ====================
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    setVoiceSupported(!!SpeechRecognition);
  }, []);

  // ==================== FOCUS & RESET ON OPEN ====================
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setHistory(getStoredHistory());
      setTopSearches(getTopSearches());
      setQuery("");
      setResults([]);
      setActiveResultIndex(-1);
      setSortBy("popular");
      setTimeout(() => inputRef.current?.focus(), 180);
    } else {
      const timer = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ==================== BODY SCROLL LOCK ====================
  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.top = `-${scrollY}px`;

    return () => {
      const top = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      if (top) {
        window.scrollTo(0, parseInt(top || "0") * -1);
      }
    };
  }, [isOpen]);

  // ==================== DEBOUNCE ====================
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [query]);

  // ==================== LIVE SEARCH ====================
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const performSearch = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/products?search=${encodeURIComponent(
            debouncedQuery
          )}&limit=12&sort=${sortBy}`
        );
        const data = await res.json();
        if (!cancelled && data.success) {
          setResults(data.data.products || []);
        }
      } catch (error) {
        console.error("Search error:", error);
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    performSearch();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, sortBy]);

  // ==================== SAVE HISTORY ====================
  const saveToHistory = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;

      const updated = [
        trimmed,
        ...history.filter((h) => h.toLowerCase() !== trimmed.toLowerCase()),
      ].slice(0, MAX_RECENT);

      setHistory(updated);
      saveAnalytics(trimmed);

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

  const handleAISearchClick = useCallback(
    (prompt?: string) => {
      onClose();
      if (onOpenAISearch) {
        setTimeout(() => onOpenAISearch(), 250);
      }
      if (prompt) {
        // Could pass prompt to AI search if parent supports it
        sessionStorage.setItem("zaem_ai_prompt", prompt);
      }
    },
    [onClose, onOpenAISearch]
  );

  const handleShareSearch = useCallback(async () => {
    if (typeof window === "undefined") return;

    const url = `${window.location.origin}/shop?search=${encodeURIComponent(
      query
    )}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Search: ${query}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopiedSearch(true);
        setTimeout(() => setCopiedSearch(false), 2000);
      }
    } catch {
      // User cancelled
    }
  }, [query]);

  // ==================== VOICE SEARCH ====================
  const handleVoiceSearch = useCallback(() => {
    if (!voiceSupported) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-PK";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("");
      setQuery(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setIsListening(false);
    }
  }, [voiceSupported, isListening]);

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

      // Ctrl/Cmd + K → AI Search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        handleAISearchClick();
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
      handleAISearchClick,
    ]
  );

  // ==================== GLOBAL ESC ====================
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // ==================== MEMOIZED ====================
  const hasQuery = query.trim().length > 0;
  const showResults = hasQuery && (loading || results.length > 0);
  const showEmptyResults = hasQuery && !loading && results.length === 0;
  const hasHistory = history.length > 0;
  const currentSort = SORT_OPTIONS.find((o) => o.value === sortBy);

  if (!isOpen && !mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] transition-opacity duration-200 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* PANEL */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Search"
        aria-modal="true"
        className={`absolute inset-x-0 top-0 max-h-[92vh] bg-[#FAFAFA] dark:bg-[#0A0A0A] shadow-2xl flex flex-col transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        }`}
      >
        {/* ==================== HEADER ==================== */}
        <div className="shrink-0 border-b border-[#E5E5E7] dark:border-[#38383A] bg-[#FAFAFA] dark:bg-[#0A0A0A]">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 md:py-5">
            {/* Label + Close */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Search
                  className="w-3.5 h-3.5 text-[#86868B]"
                  strokeWidth={2}
                />
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#6E6E73] dark:text-[#98989D] font-body font-medium">
                  Search ZAEM
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center hover:bg-[#F5F5F7] dark:hover:bg-[#1C1C1E] rounded-full transition-colors active:scale-90"
                aria-label="Close search"
              >
                <X
                  className="w-5 h-5 text-[#1D1D1F] dark:text-white"
                  strokeWidth={2}
                />
              </button>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-center gap-3 bg-white dark:bg-[#1C1C1E] border border-[#D2D2D7] dark:border-[#48484A] rounded-xl px-4 py-3.5 focus-within:border-[#1D1D1F] dark:focus-within:border-white focus-within:shadow-[0_0_0_4px_rgba(29,29,31,0.08)] dark:focus-within:shadow-[0_0_0_4px_rgba(255,255,255,0.08)] transition-all duration-200">
                <Search
                  className="w-5 h-5 text-[#86868B] shrink-0"
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
                  className="flex-1 bg-transparent outline-none text-[15px] md:text-base font-body text-[#1D1D1F] dark:text-white placeholder:text-[#86868B]"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  aria-label="Search input"
                />

                {/* Clear */}
                {query && !loading && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setActiveResultIndex(-1);
                      inputRef.current?.focus();
                    }}
                    className="w-6 h-6 flex items-center justify-center hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] rounded-full transition-colors shrink-0"
                    aria-label="Clear"
                  >
                    <X
                      className="w-3.5 h-3.5 text-[#86868B]"
                      strokeWidth={2}
                    />
                  </button>
                )}

                {/* Loading */}
                {loading && (
                  <Loader2
                    className="w-4 h-4 text-[#86868B] animate-spin shrink-0"
                    strokeWidth={2}
                  />
                )}

                {/* Voice */}
                {voiceSupported && !query && (
                  <button
                    type="button"
                    onClick={handleVoiceSearch}
                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-all shrink-0 ${
                      isListening
                        ? "bg-[#FF3B30] text-white animate-pulse"
                        : "hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] text-[#86868B]"
                    }`}
                    aria-label={isListening ? "Stop listening" : "Voice search"}
                  >
                    {isListening ? (
                      <MicOff className="w-4 h-4" strokeWidth={2} />
                    ) : (
                      <Mic className="w-4 h-4" strokeWidth={2} />
                    )}
                  </button>
                )}

                {/* Share */}
                {query && !loading && (
                  <button
                    type="button"
                    onClick={handleShareSearch}
                    className="w-8 h-8 flex items-center justify-center hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] rounded-full transition-colors shrink-0"
                    aria-label="Share search"
                  >
                    {copiedSearch ? (
                      <Check
                        className="w-4 h-4 text-[#2E7D32]"
                        strokeWidth={2}
                      />
                    ) : (
                      <Share2
                        className="w-4 h-4 text-[#86868B]"
                        strokeWidth={2}
                      />
                    )}
                  </button>
                )}

                {/* ESC hint */}
                {!query && !voiceSupported && (
                  <div className="hidden md:flex items-center gap-1 shrink-0">
                    <kbd className="px-1.5 py-0.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[9px] font-body text-[#86868B] rounded border border-[#E5E5E7] dark:border-[#38383A]">
                      ESC
                    </kbd>
                  </div>
                )}
              </div>
            </form>

            {/* ==================== AI SEARCH BUTTON ==================== */}
            {onOpenAISearch && (
              <button
                onClick={() => handleAISearchClick()}
                className="mt-3 w-full flex items-center justify-between gap-3 px-4 py-3 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-xl hover:bg-black dark:hover:bg-[#F5F5F7] active:scale-[0.99] transition-all duration-200 group shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-white/10 dark:bg-[#1D1D1F]/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-white/20 dark:group-hover:bg-[#1D1D1F]/20 transition-colors">
                    <Sparkles className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <p className="text-sm font-body font-medium leading-tight">
                      Search with AI
                    </p>
                    <p className="text-[11px] text-white/60 dark:text-[#1D1D1F]/60 font-body leading-tight mt-0.5 truncate">
                      "shaadi ke liye red dress under 5000"
                    </p>
                  </div>
                </div>
                <ArrowRight
                  className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform shrink-0"
                  strokeWidth={2}
                />
              </button>
            )}

            {/* ==================== SORT BAR (when results) ==================== */}
            {showResults && results.length > 1 && (
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#86868B] font-body font-medium">
                  {results.length}{" "}
                  {results.length === 1 ? "Result" : "Results"}
                </p>

                <div className="relative">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#1C1C1E] border border-[#E5E5E7] dark:border-[#38383A] rounded-full text-[11px] font-body text-[#1D1D1F] dark:text-white hover:border-[#D2D2D7] transition-colors"
                  >
                    <SlidersHorizontal
                      className="w-3 h-3 text-[#86868B]"
                      strokeWidth={2}
                    />
                    {currentSort?.label}
                  </button>

                  {showSortMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowSortMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-[#1C1C1E] border border-[#E5E5E7] dark:border-[#38383A] rounded-lg shadow-lg z-20 py-1 overflow-hidden">
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setSortBy(opt.value);
                              setShowSortMenu(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-[12px] font-body flex items-center justify-between transition-colors ${
                              sortBy === opt.value
                                ? "bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white"
                                : "text-[#6E6E73] dark:text-[#98989D] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]"
                            }`}
                          >
                            {opt.label}
                            {sortBy === opt.value && (
                              <Check
                                className="w-3 h-3"
                                strokeWidth={2}
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ==================== BODY ==================== */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6">
            {/* LOADING SKELETON */}
            {loading && !results.length && (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[3/4] bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-lg mb-2.5" />
                      <div className="h-2 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded mb-2 w-1/3" />
                      <div className="h-3 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded mb-2 w-3/4" />
                      <div className="h-2 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded w-1/2" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RESULTS */}
            {!loading && results.length > 0 && (
              <div>
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
                          className={`relative aspect-[3/4] bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-lg overflow-hidden mb-2.5 transition-all duration-300 ${
                            isActive
                              ? "ring-2 ring-[#1D1D1F] dark:ring-white ring-offset-2 ring-offset-[#FAFAFA] dark:ring-offset-[#0A0A0A]"
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
                                className="w-8 h-8 text-[#1D1D1F]/15 dark:text-white/15"
                                strokeWidth={1.5}
                              />
                            </div>
                          )}

                          {hasDiscount && (
                            <div className="absolute top-2 left-2 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] text-[9px] tracking-widest uppercase px-2 py-1 rounded">
                              Sale
                            </div>
                          )}

                          {product.stock === 0 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="bg-white text-[#1D1D1F] text-[10px] tracking-widest uppercase px-3 py-1.5 rounded">
                                Sold Out
                              </span>
                            </div>
                          )}
                        </div>

                        <p className="text-[9px] uppercase tracking-widest text-[#86868B] font-body mb-1 truncate">
                          {product.category?.name || "ZAEM"}
                        </p>
                        <h3 className="font-display text-sm md:text-base leading-tight line-clamp-2 mb-1 text-[#1D1D1F] dark:text-white group-hover:opacity-70 transition-opacity">
                          {highlightMatch(product.name, query)}
                        </h3>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <p className="font-body text-xs md:text-sm text-[#1D1D1F] dark:text-white font-medium">
                            {formatPrice(product.price)}
                          </p>
                          {hasDiscount && (
                            <p className="font-body text-[10px] text-[#86868B] line-through">
                              {formatPrice(product.comparePrice!)}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* VIEW ALL BUTTON */}
                <button
                  onClick={handleSubmit}
                  className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-[#1C1C1E] border border-[#E5E5E7] dark:border-[#38383A] rounded-xl hover:border-[#D2D2D7] dark:hover:border-[#48484A] hover:shadow-sm transition-all duration-200 text-[13px] font-body font-medium text-[#1D1D1F] dark:text-white"
                >
                  View all results for &quot;{query}&quot;
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </div>
            )}
            {/* ==================== EMPTY RESULTS ==================== */}
            {showEmptyResults && (
              <div className="py-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search
                      className="w-6 h-6 text-[#86868B]"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="font-display text-xl md:text-2xl text-[#1D1D1F] dark:text-white mb-2">
                    No results for &quot;{debouncedQuery}&quot;
                  </h3>
                  <p className="text-[#6E6E73] dark:text-[#98989D] font-body text-sm max-w-md mx-auto">
                    Try a different keyword, or let AI help you find what you're looking for.
                  </p>
                </div>

                {/* AI Search CTA */}
                {onOpenAISearch && (
                  <button
                    onClick={() => handleAISearchClick()}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-xl hover:bg-black dark:hover:bg-[#F5F5F7] active:scale-[0.99] transition-all duration-200 group shadow-sm mb-6"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-white/10 dark:bg-[#1D1D1F]/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-white/20 dark:group-hover:bg-[#1D1D1F]/20 transition-colors">
                        <Sparkles className="w-4 h-4" strokeWidth={2} />
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <p className="text-sm font-body font-medium leading-tight">
                          Let AI find it for you
                        </p>
                        <p className="text-[11px] text-white/60 dark:text-[#1D1D1F]/60 font-body leading-tight mt-0.5 truncate">
                          Describe what you want in your own words
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform shrink-0"
                      strokeWidth={2}
                    />
                  </button>
                )}

                {/* Suggested AI prompts */}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#86868B] font-body font-medium mb-3">
                    Try asking AI
                  </p>
                  <div className="space-y-2">
                    {AI_PROMPTS.slice(0, 3).map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => handleAISearchClick(prompt)}
                        className="w-full text-left flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#1C1C1E] border border-[#E5E5E7] dark:border-[#38383A] rounded-xl hover:border-[#1D1D1F] dark:hover:border-white transition-all duration-200 group"
                      >
                        <div className="w-6 h-6 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-md flex items-center justify-center shrink-0 group-hover:bg-[#1D1D1F] dark:group-hover:bg-white transition-colors">
                          <Sparkles
                            className="w-3 h-3 text-[#86868B] group-hover:text-white dark:group-hover:text-[#1D1D1F] transition-colors"
                            strokeWidth={2}
                          />
                        </div>
                        <span className="text-[13px] font-body text-[#1D1D1F] dark:text-white flex-1 truncate">
                          {prompt}
                        </span>
                        <ArrowUpRight
                          className="w-3.5 h-3.5 text-[#86868B] group-hover:text-[#1D1D1F] dark:group-hover:text-white transition-colors shrink-0"
                          strokeWidth={2}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Browse categories */}
                <div className="mt-8 pt-8 border-t border-[#E5E5E7] dark:border-[#38383A]">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#86868B] font-body font-medium mb-3">
                    Or browse categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/shop?category=${cat.slug}`}
                        onClick={onClose}
                        className="px-3.5 py-2 bg-white dark:bg-[#1C1C1E] border border-[#E5E5E7] dark:border-[#38383A] rounded-full text-xs font-body text-[#1D1D1F] dark:text-white hover:border-[#1D1D1F] dark:hover:border-white transition-all duration-200 active:scale-95"
                      >
                        {cat.emoji} {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ==================== DEFAULT STATE (no query) ==================== */}
            {!hasQuery && (
              <div className="space-y-8">

                {/* ============ RECENT SEARCHES ============ */}
                {hasHistory && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock
                          className="w-3.5 h-3.5 text-[#86868B]"
                          strokeWidth={2}
                        />
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#86868B] font-body font-medium">
                          Recent
                        </p>
                      </div>
                      <button
                        onClick={handleClearHistory}
                        className="text-[10px] uppercase tracking-[0.2em] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white font-body font-medium transition-colors flex items-center gap-1"
                        aria-label="Clear history"
                      >
                        <Trash2 className="w-3 h-3" strokeWidth={2} />
                        Clear
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {history.map((term) => (
                        <button
                          key={term}
                          onClick={() => handleTermClick(term)}
                          className="group px-3.5 py-2 bg-white dark:bg-[#1C1C1E] border border-[#E5E5E7] dark:border-[#38383A] rounded-full text-xs font-body text-[#1D1D1F] dark:text-white hover:border-[#1D1D1F] dark:hover:border-white hover:bg-[#1D1D1F] dark:hover:bg-white hover:text-white dark:hover:text-[#1D1D1F] transition-all duration-200 active:scale-95 flex items-center gap-1.5"
                        >
                          <Clock
                            className="w-3 h-3 opacity-50 group-hover:opacity-100"
                            strokeWidth={2}
                          />
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ============ TRENDING NOW ============ */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp
                      className="w-3.5 h-3.5 text-[#86868B]"
                      strokeWidth={2}
                    />
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#86868B] font-body font-medium">
                      Trending Now
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {TRENDING.map((term, index) => (
                      <button
                        key={term}
                        onClick={() => handleTermClick(term)}
                        className="group px-3.5 py-2 bg-white dark:bg-[#1C1C1E] border border-[#E5E5E7] dark:border-[#38383A] rounded-full text-xs font-body text-[#1D1D1F] dark:text-white hover:border-[#1D1D1F] dark:hover:border-white hover:bg-[#1D1D1F] dark:hover:bg-white hover:text-white dark:hover:text-[#1D1D1F] transition-all duration-200 active:scale-95 flex items-center gap-1.5"
                      >
                        {index < 3 && (
                          <span className="text-[10px] font-medium text-[#FF3B30]">
                            #{index + 1}
                          </span>
                        )}
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ============ YOUR TOP SEARCHES (analytics) ============ */}
                {topSearches.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Star
                        className="w-3.5 h-3.5 text-[#86868B]"
                        strokeWidth={2}
                      />
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#86868B] font-body font-medium">
                        Your Top Searches
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {topSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => handleTermClick(term)}
                          className="px-3.5 py-2 bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-transparent rounded-full text-xs font-body text-[#1D1D1F] dark:text-white hover:border-[#1D1D1F] dark:hover:border-white transition-all duration-200 active:scale-95"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ============ CATEGORIES ============ */}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#86868B] font-body font-medium mb-3">
                    Shop by Category
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3">
                    {POPULAR_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/shop?category=${cat.slug}`}
                        onClick={onClose}
                        className="group flex items-center gap-3 p-3.5 bg-white dark:bg-[#1C1C1E] border border-[#E5E5E7] dark:border-[#38383A] rounded-xl hover:border-[#1D1D1F] dark:hover:border-white hover:shadow-sm transition-all duration-200 active:scale-[0.98]"
                      >
                        <div className="w-9 h-9 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-full flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform duration-300">
                          {cat.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-sm font-medium text-[#1D1D1F] dark:text-white truncate">
                            {cat.name}
                          </p>
                        </div>
                        <ChevronRight
                          className="w-4 h-4 text-[#86868B] group-hover:text-[#1D1D1F] dark:group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0"
                          strokeWidth={2}
                        />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* ============ AI PROMPTS SHOWCASE ============ */}
                {onOpenAISearch && (
                  <div className="pt-6 border-t border-[#E5E5E7] dark:border-[#38383A]">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles
                        className="w-3.5 h-3.5 text-[#1D1D1F] dark:text-white"
                        strokeWidth={2}
                      />
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#86868B] font-body font-medium">
                        Try AI Search
                      </p>
                    </div>

                    <div className="grid gap-2">
                      {AI_PROMPTS.slice(0, 3).map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => handleAISearchClick(prompt)}
                          className="group flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#1C1C1E] border border-[#E5E5E7] dark:border-[#38383A] rounded-xl hover:border-[#1D1D1F] dark:hover:border-white hover:shadow-sm transition-all duration-200 text-left"
                        >
                          <div className="w-7 h-7 bg-gradient-to-br from-[#1D1D1F] to-[#2C2C2E] dark:from-white dark:to-[#F5F5F7] rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <Sparkles
                              className="w-3.5 h-3.5 text-white dark:text-[#1D1D1F]"
                              strokeWidth={2}
                            />
                          </div>
                          <span className="text-[13px] font-body text-[#1D1D1F] dark:text-white flex-1 truncate">
                            {prompt}
                          </span>
                          <ArrowUpRight
                            className="w-3.5 h-3.5 text-[#86868B] group-hover:text-[#1D1D1F] dark:group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0"
                            strokeWidth={2}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>

        {/* ==================== FOOTER (Desktop only) ==================== */}
        <div className="shrink-0 border-t border-[#E5E5E7] dark:border-[#38383A] bg-[#F5F5F7]/50 dark:bg-[#1C1C1E]/50 hidden md:block">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between text-[10px] text-[#86868B] font-body">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#2C2C2E] border border-[#E5E5E7] dark:border-[#38383A] rounded text-[9px] font-medium text-[#1D1D1F] dark:text-white">
                  ↑
                </kbd>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#2C2C2E] border border-[#E5E5E7] dark:border-[#38383A] rounded text-[9px] font-medium text-[#1D1D1F] dark:text-white">
                  ↓
                </kbd>
                <span>Navigate</span>
              </div>

              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#2C2C2E] border border-[#E5E5E7] dark:border-[#38383A] rounded text-[9px] font-medium text-[#1D1D1F] dark:text-white">
                  <CornerDownLeft className="w-2.5 h-2.5 inline" />
                </kbd>
                <span>Select</span>
              </div>

              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#2C2C2E] border border-[#E5E5E7] dark:border-[#38383A] rounded text-[9px] font-medium text-[#1D1D1F] dark:text-white">
                  ESC
                </kbd>
                <span>Close</span>
              </div>

              {onOpenAISearch && (
                <div className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#2C2C2E] border border-[#E5E5E7] dark:border-[#38383A] rounded text-[9px] font-medium text-[#1D1D1F] dark:text-white">
                    ⌘K
                  </kbd>
                  <span>AI Search</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <Sparkles
                className="w-3 h-3 text-[#86868B]"
                strokeWidth={2}
              />
              <span>Powered by ZAEM AI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}