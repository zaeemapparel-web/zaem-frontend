"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, Loader2, X, TrendingUp, Clock } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const TRENDING = [
  "Red dress",
  "Winter coat",
  "Wedding outfit",
  "Black perfume",
  "Leather bag",
];

export default function AISearchBar({ isOpen, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      const saved = JSON.parse(localStorage.getItem("zaem_recent_searches") || "[]");
      setRecent(saved.slice(0, 5));
    }
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || loading) return;

    setLoading(true);
    setQuery(searchQuery);

    // Save to recent
    const updated = [searchQuery, ...recent.filter((r) => r !== searchQuery)].slice(0, 5);
    setRecent(updated);
    localStorage.setItem("zaem_recent_searches", JSON.stringify(updated));

    try {
      const res = await fetch(`${API_URL}/api/ai/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await res.json();
      if (data.success) {
        setResults(data.data.products);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error(error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (slug: string) => {
    onClose();
    router.push(`/product/${slug}`);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[120]"
      />

      {/* Search Panel */}
      <div className="fixed inset-x-0 top-0 z-[121] bg-ivory shadow-2xl max-h-[85vh] overflow-hidden flex flex-col animate-[slideDown_0.3s_ease-out]">

        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 md:px-8 py-5 border-b border-ink/10">
          <Search className="w-5 h-5 text-ink/50 shrink-0" strokeWidth={1.8} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
            placeholder="Search anything... 'red dress under 5000'"
            className="flex-1 bg-transparent outline-none text-base font-body placeholder:text-ink/40"
          />
          {loading && <Loader2 className="w-5 h-5 animate-spin text-gold" />}
          <button
            onClick={onClose}
            className="p-2 hover:bg-bone rounded-full transition-colors shrink-0"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">

          {/* AI Badge */}
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <p className="text-[10px] uppercase tracking-widest text-ink/60 font-body">
              AI-Powered Search
            </p>
          </div>

          {/* Empty state — suggestions */}
          {!query && !loading && results.length === 0 && (
            <>
              {/* Recent searches */}
              {recent.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-3.5 h-3.5 text-ink/50" />
                    <p className="text-[10px] uppercase tracking-widest text-ink/60 font-body">
                      Recent
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((r) => (
                      <button
                        key={r}
                        onClick={() => handleSearch(r)}
                        className="px-3 py-1.5 bg-bone text-xs font-body rounded-full hover:bg-ink hover:text-ivory transition-colors"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-3.5 h-3.5 text-ink/50" />
                  <p className="text-[10px] uppercase tracking-widest text-ink/60 font-body">
                    Trending
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRENDING.map((t) => (
                    <button
                      key={t}
                      onClick={() => handleSearch(t)}
                      className="px-3 py-1.5 border border-ink/15 text-xs font-body rounded-full hover:border-ink hover:bg-ink hover:text-ivory transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleProductClick(p.slug)}
                  className="group text-left"
                >
                  <div className="aspect-[3/4] bg-bone overflow-hidden mb-3">
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-display text-2xl text-ink/10">Z</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-ink/50 mb-1">
                    {p.category?.name || "ZAEM"}
                  </p>
                  <p className="font-display text-sm mb-1 group-hover:text-gold transition-colors">
                    {p.name}
                  </p>
                  <p className="text-xs font-body">PKR {p.price.toLocaleString()}</p>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {query && !loading && results.length === 0 && (
            <div className="text-center py-12">
              <p className="font-display text-xl mb-2">No products found</p>
              <p className="text-sm text-ink/60 font-body">
                Try different keywords
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="border-t border-ink/10 px-4 md:px-8 py-3 bg-bone/30">
          <p className="text-[10px] text-ink/50 text-center font-body">
            Try: "shaadi ke liye dress", "sasti perfume", "winter coat"
          </p>
        </div>

      </div>
    </>
  );
}