"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, Search, TrendingUp, Clock } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const TRENDING = [
  "Oud Perfume",
  "Linen Shirt",
  "Leather Tote",
  "Silk Dress",
  "Cashmere Coat",
];

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      // Load search history from localStorage
      const saved = localStorage.getItem("zaem_search_history");
      if (saved) {
        try {
          setHistory(JSON.parse(saved));
        } catch {}
      }
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Live search — debounced
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/products?search=${encodeURIComponent(query)}&limit=6`
        );
        const data = await res.json();
        if (data.success) {
          setResults(data.data.products);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen, onClose]);

  const saveToHistory = (searchTerm: string) => {
    const newHistory = [
      searchTerm,
      ...history.filter((h) => h !== searchTerm),
    ].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem("zaem_search_history", JSON.stringify(newHistory));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    saveToHistory(query.trim());
    router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
    onClose();
  };

  const handleTrendingClick = (term: string) => {
    setQuery(term);
    saveToHistory(term);
    router.push(`/shop?search=${encodeURIComponent(term)}`);
    onClose();
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("zaem_search_history");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] animate-[fadeIn_0.3s_ease-out]">
      {/* Dark Background */}
      <div
        className="absolute inset-0 bg-ink/95 backdrop-blur-xl"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative h-full flex flex-col">

        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 md:px-12 lg:px-20 py-6 border-b border-ivory/10">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-gold" strokeWidth={1.5} />
            <p className="text-label text-ivory/60">Search ZAEM</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-ivory/10 transition-colors"
            aria-label="Close search"
          >
            <X className="w-5 h-5 text-ivory" strokeWidth={1.5} />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-6 md:px-12 lg:px-20 py-8 md:py-12">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-transparent text-ivory placeholder:text-ivory/30 text-3xl md:text-5xl lg:text-6xl font-display outline-none border-b-2 border-ivory/20 focus:border-gold transition-colors duration-500 pb-4"
            />
          </form>
        </div>

        {/* Results / Trending / History */}
        <div className="flex-1 overflow-y-auto px-6 md:px-12 lg:px-20 pb-12">

          <div className="max-w-4xl mx-auto">

            {/* Loading */}
            {loading && (
              <div className="py-8">
                <p className="text-label text-gold animate-pulse">Searching...</p>
              </div>
            )}

            {/* Results */}
            {!loading && query && results.length > 0 && (
              <div className="py-6">
                <p className="text-label text-gold mb-6">
                  {results.length} {results.length === 1 ? "Result" : "Results"}
                </p>

                <div className="space-y-1">
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={() => {
                        saveToHistory(query);
                        onClose();
                      }}
                      className="flex items-center gap-4 md:gap-6 p-4 hover:bg-ivory/5 transition-colors group"
                    >
                      <div className="w-14 h-20 md:w-16 md:h-24 bg-bone shrink-0 overflow-hidden">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="font-display text-lg text-ink/10">
                              Z
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-label text-gold mb-1">
                          {product.category?.name || "ZAEM"}
                        </p>
                        <p className="font-display text-lg md:text-xl text-ivory group-hover:text-gold transition-colors truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-ivory/60 font-body mt-1">
                          PKR {product.price.toLocaleString()}
                        </p>
                      </div>

                      <div className="shrink-0 hidden md:block">
                        <span className="text-label text-ivory/40 group-hover:text-gold transition-colors">
                          View →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* View All */}
                <button
                  onClick={() => {
                    saveToHistory(query);
                    router.push(`/shop?search=${encodeURIComponent(query)}`);
                    onClose();
                  }}
                  className="mt-6 w-full py-4 border border-ivory/20 text-label text-ivory hover:bg-gold hover:text-ink hover:border-gold transition-all duration-500"
                >
                  View All Results →
                </button>
              </div>
            )}

            {/* No Results */}
            {!loading && query && results.length === 0 && (
              <div className="py-12 text-center">
                <p className="font-display text-2xl md:text-3xl text-ivory mb-3">
                  No results found.
                </p>
                <p className="text-ivory/60 font-body">
                  Try searching for something else.
                </p>
              </div>
            )}

            {/* Default State — Trending + History */}
            {!query && (
              <div className="py-6 space-y-12">

                {/* Search History */}
                {history.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-gold" strokeWidth={1.5} />
                        <p className="text-label text-ivory/60">Recent Searches</p>
                      </div>
                      <button
                        onClick={clearHistory}
                        className="text-label text-ivory/40 hover:text-gold transition-colors"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {history.map((term) => (
                        <button
                          key={term}
                          onClick={() => handleTrendingClick(term)}
                          className="px-5 py-2.5 border border-ivory/20 text-ivory/80 hover:border-gold hover:text-gold transition-all duration-500 text-sm font-body"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-4 h-4 text-gold" strokeWidth={1.5} />
                    <p className="text-label text-ivory/60">Trending Now</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {TRENDING.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleTrendingClick(term)}
                        className="px-5 py-2.5 border border-ivory/20 text-ivory/80 hover:border-gold hover:text-gold transition-all duration-500 text-sm font-body"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}