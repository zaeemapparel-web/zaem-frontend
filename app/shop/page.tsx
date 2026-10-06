"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
  Suspense,
  useCallback,
  useMemo,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronRight,
  Search,
  Sparkles,
  Grid3x3,
  List,
  Loader2,
  Check,
  Package,
  Heart,
  ArrowUp,
  Share2,
} from "lucide-react";
import QuickViewModal from "@/components/QuickViewModal";
import AISearchBar from "@/components/AISearchBar";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ==================== TYPES ====================
interface Category {
  id?: string;
  name: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  children?: Category[];
  _count?: { products: number };
  productCount?: number;
}

// ==================== FALLBACK CATEGORIES ====================
const FALLBACK_CATEGORIES: Category[] = [
  {
    name: "Woman",
    slug: "woman",
    children: [
      { name: "New In", slug: "woman-new-in" },
      { name: "Ready to Wear", slug: "woman-ready-to-wear" },
      {
        name: "Unstitched",
        slug: "woman-unstitched",
        children: [
          { name: "Pre-Fall '26", slug: "woman-unstitched-pre-fall-26" },
          { name: "Festive '26", slug: "woman-unstitched-festive-26" },
          { name: "Intermix '26", slug: "woman-unstitched-intermix-26" },
          { name: "Sukoon", slug: "woman-unstitched-sukoon" },
          { name: "Andaaz", slug: "woman-unstitched-andaaz" },
          { name: "Raunak", slug: "woman-unstitched-raunak" },
          { name: "2 Piece", slug: "woman-unstitched-2-piece" },
          { name: "3 Piece", slug: "woman-unstitched-3-piece" },
        ],
      },
      {
        name: "Winter",
        slug: "woman-winter",
        children: [
          { name: "Sweaters", slug: "woman-winter-sweaters" },
          { name: "Jackets", slug: "woman-winter-jackets" },
          { name: "Coats", slug: "woman-winter-coats" },
          { name: "Hoodies", slug: "woman-winter-hoodies" },
        ],
      },
      { name: "West", slug: "woman-west" },
      { name: "Modest Wear", slug: "woman-modest" },
      { name: "Accessories", slug: "woman-accessories" },
      { name: "Special Offers", slug: "woman-sale" },
    ],
  },
  {
    name: "Man",
    slug: "man",
    children: [
      { name: "New In", slug: "man-new-in" },
      { name: "Ready to Wear", slug: "man-ready-to-wear" },
      {
        name: "Unstitched",
        slug: "man-unstitched",
        children: [
          { name: "Platinum", slug: "man-unstitched-platinum" },
          { name: "Gold", slug: "man-unstitched-gold" },
          { name: "Silver", slug: "man-unstitched-silver" },
          { name: "Latha", slug: "man-unstitched-latha" },
          { name: "Boski", slug: "man-unstitched-boski" },
          { name: "Khadar", slug: "man-unstitched-khadar" },
        ],
      },
      {
        name: "Winter",
        slug: "man-winter",
        children: [
          { name: "Sweaters", slug: "man-winter-sweaters" },
          { name: "Jackets", slug: "man-winter-jackets" },
          { name: "Coats", slug: "man-winter-coats" },
        ],
      },
      { name: "West", slug: "man-west" },
      { name: "Accessories", slug: "man-accessories" },
    ],
  },
  {
    name: "Fragrances",
    slug: "fragrances",
    children: [
      {
        name: "For Her",
        slug: "fragrances-her",
        children: [
          { name: "Perfumes", slug: "fragrances-her-perfumes" },
          { name: "Body Mists", slug: "fragrances-her-mists" },
        ],
      },
      {
        name: "For Him",
        slug: "fragrances-him",
        children: [
          { name: "Perfumes", slug: "fragrances-him-perfumes" },
          { name: "Body Mists", slug: "fragrances-him-mists" },
        ],
      },
      { name: "Sets", slug: "fragrances-sets" },
    ],
  },
  {
    name: "Bags",
    slug: "bags",
    children: [
      { name: "Handbags", slug: "bags-handbags" },
      { name: "Totes", slug: "bags-totes" },
      { name: "Clutches", slug: "bags-clutches" },
    ],
  },
];

// ==================== HOOK: Dynamic Categories ====================
function useCategories() {
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      try {
        const cached = sessionStorage.getItem("zaem_categories_cache");
        const cacheTime = sessionStorage.getItem("zaem_categories_time");
        const now = Date.now();

        if (cached && cacheTime && now - parseInt(cacheTime) < 3600000) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0 && !cancelled) {
              setCategories(parsed);
              setLoading(false);
              return;
            }
          } catch {
            // ignore
          }
        }

        const res = await fetch(`${API_URL}/api/categories`);
        const data = await res.json();

        if (!cancelled && data.success && data.data?.categories?.length > 0) {
          setCategories(data.data.categories);
          try {
            sessionStorage.setItem(
              "zaem_categories_cache",
              JSON.stringify(data.data.categories)
            );
            sessionStorage.setItem("zaem_categories_time", now.toString());
          } catch {
            // ignore
          }
        }
      } catch (error) {
        console.error("Category fetch error:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading };
}

// ==================== HOOK: Recently Viewed ====================
function useRecentlyViewed() {
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("zaem_recently_viewed");
      if (stored) setRecentIds(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const addRecent = useCallback((productId: string) => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("zaem_recently_viewed");
      const current: string[] = stored ? JSON.parse(stored) : [];
      const updated = [productId, ...current.filter((id) => id !== productId)].slice(0, 10);
      localStorage.setItem("zaem_recently_viewed", JSON.stringify(updated));
      setRecentIds(updated);
    } catch {
      // ignore
    }
  }, []);

  return { recentIds, addRecent };
}

// ==================== HOOK: Wishlist ====================
function useWishlist() {
  const { token, isAuthenticated } = useAuthStore();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setWishlistIds(new Set());
      return;
    }

    const fetchWishlist = async () => {
      try {
        const res = await fetch(`${API_URL}/api/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data?.wishlist) {
          const ids = new Set<string>(
            data.data.wishlist.map((item: any) => item.productId || item.product?.id)
          );
          setWishlistIds(ids);
        }
      } catch (error) {
        console.error("Wishlist fetch error:", error);
      }
    };

    fetchWishlist();
  }, [isAuthenticated, token]);

  const toggle = useCallback(
    async (productId: string) => {
      if (!isAuthenticated || !token) {
        return { success: false, needsLogin: true };
      }

      setLoading(true);
      const isInWishlist = wishlistIds.has(productId);

      try {
        const res = await fetch(
          isInWishlist
            ? `${API_URL}/api/wishlist/${productId}`
            : `${API_URL}/api/wishlist`,
          {
            method: isInWishlist ? "DELETE" : "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: isInWishlist ? undefined : JSON.stringify({ productId }),
          }
        );

        const data = await res.json();
        if (data.success) {
          setWishlistIds((prev) => {
            const next = new Set(prev);
            if (isInWishlist) next.delete(productId);
            else next.add(productId);
            return next;
          });
          return { success: true, added: !isInWishlist };
        }
        return { success: false, needsLogin: false };
      } catch (error) {
        console.error("Wishlist toggle error:", error);
        return { success: false, needsLogin: false };
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, token, wishlistIds]
  );

  return { wishlistIds, toggle, loading };
}

// ==================== CONSTANTS ====================
const PRICE_RANGES = [
  { label: "All Prices", min: "", max: "" },
  { label: "Under Rs. 5,000", min: "0", max: "5000" },
  { label: "Rs. 5,000 — 10,000", min: "5000", max: "10000" },
  { label: "Rs. 10,000 — 20,000", min: "10000", max: "20000" },
  { label: "Above Rs. 20,000", min: "20000", max: "" },
];

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A to Z", value: "name-asc" },
  { label: "Name: Z to A", value: "name-desc" },
];

// ==================== HELPERS ====================
const findCategoryBySlug = (slug: string, categories: Category[]): string => {
  if (!slug) return "The Collection";
  for (const cat of categories) {
    if (cat.slug === slug) return cat.name;
    if (cat.children) {
      for (const child of cat.children) {
        if (child.slug === slug) return child.name;
        if (child.children) {
          for (const grandchild of child.children) {
            if (grandchild.slug === slug) return grandchild.name;
          }
        }
      }
    }
  }
  return "The Collection";
};

const getBreadcrumb = (slug: string, categories: Category[]) => {
  if (!slug) return [{ label: "Shop", href: "/shop" }];

  for (const cat of categories) {
    if (cat.slug === slug) {
      return [
        { label: "Shop", href: "/shop" },
        { label: cat.name, href: `/shop?category=${cat.slug}` },
      ];
    }
    if (cat.children) {
      for (const child of cat.children) {
        if (child.slug === slug) {
          return [
            { label: "Shop", href: "/shop" },
            { label: cat.name, href: `/shop?category=${cat.slug}` },
            { label: child.name, href: `/shop?category=${child.slug}` },
          ];
        }
        if (child.children) {
          for (const grandchild of child.children) {
            if (grandchild.slug === slug) {
              return [
                { label: "Shop", href: "/shop" },
                { label: cat.name, href: `/shop?category=${cat.slug}` },
                { label: child.name, href: `/shop?category=${child.slug}` },
                {
                  label: grandchild.name,
                  href: `/shop?category=${grandchild.slug}`,
                },
              ];
            }
          }
        }
      }
    }
  }
  return [{ label: "Shop", href: "/shop" }];
};

// ==================== PRODUCT CARD ====================
function ProductCard({
  product,
  viewMode,
  onQuickView,
  isInWishlist,
  onWishlistToggle,
  onView,
}: {
  product: any;
  viewMode: "grid" | "list";
  onQuickView: (id: string) => void;
  isInWishlist: boolean;
  onWishlistToggle: (id: string) => void;
  onView: (id: string) => void;
}) {
  const hasDiscount =
    product.comparePrice && product.comparePrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.comparePrice - product.price) / product.comparePrice) * 100
      )
    : 0;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onWishlistToggle(product.id);
  };

  if (viewMode === "list") {
    return (
      <Link
        href={`/product/${product.slug}`}
        onClick={() => onView(product.id)}
        className="group flex gap-4 p-4 bg-white dark:bg-[#1C1C1E] border border-[#E5E5E7] dark:border-[#38383A] rounded-xl hover:border-[#1D1D1F]/30 dark:hover:border-white/30 hover:shadow-md transition-all duration-300"
      >
        <div className="w-24 h-32 md:w-32 md:h-40 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-lg overflow-hidden shrink-0 relative">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package
                className="w-6 h-6 text-[#1D1D1F]/20 dark:text-white/20"
                strokeWidth={1.5}
              />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 py-1">
          <p className="text-[10px] uppercase tracking-widest text-[#86868B] font-body mb-1">
            {product.category?.name || "ZAEM"}
          </p>
          <h3 className="font-display text-lg md:text-xl leading-tight mb-2 text-[#1D1D1F] dark:text-white group-hover:opacity-70 transition-opacity line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-3 flex-wrap">
            <p className="font-body text-base md:text-lg font-medium text-[#1D1D1F] dark:text-white">
              Rs. {product.price.toLocaleString()}
            </p>
            {hasDiscount && (
              <>
                <p className="font-body text-sm text-[#86868B] line-through">
                  Rs. {product.comparePrice.toLocaleString()}
                </p>
                <span className="text-[10px] uppercase tracking-widest bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] px-2 py-0.5 rounded">
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>
          {product.stock > 0 && product.stock <= 5 && (
            <p className="text-[11px] text-[#6E6E73] dark:text-[#98989D] font-body mt-2">
              Only {product.stock} left in stock
            </p>
          )}
        </div>

        <button
          onClick={handleWishlistClick}
          className="p-2 h-fit rounded-full hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors"
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isInWishlist
                ? "fill-red-500 text-red-500"
                : "text-[#1D1D1F]/40 dark:text-white/40"
            }`}
            strokeWidth={2}
          />
        </button>
      </Link>
    );
  }

  return (
    <div className="group">
      <Link
        href={`/product/${product.slug}`}
        onClick={() => onView(product.id)}
        className="block"
      >
        <div className="relative aspect-[3/4] bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-lg overflow-hidden mb-3">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package
                className="w-10 h-10 text-[#1D1D1F]/15 dark:text-white/15"
                strokeWidth={1.5}
              />
            </div>
          )}

          {hasDiscount && (
            <div className="absolute top-2.5 left-2.5 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] text-[9px] tracking-widest uppercase px-2 py-1 rounded">
              {discountPercent}% OFF
            </div>
          )}

          {product.stock > 0 && product.stock <= 5 && (
            <div className="absolute top-2.5 right-2.5 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-sm text-[#1D1D1F] dark:text-white text-[9px] tracking-widest uppercase px-2 py-1 rounded border border-[#E5E5E7] dark:border-[#38383A]">
              {product.stock} left
            </div>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-[#1D1D1F] text-[10px] tracking-widest uppercase px-3 py-1.5 rounded">
                Sold Out
              </span>
            </div>
          )}

          <button
            onClick={handleWishlistClick}
            className="absolute top-2.5 right-2.5 w-9 h-9 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 shadow-sm"
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            style={{ display: product.stock > 0 && product.stock <= 5 ? "none" : undefined }}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isInWishlist
                  ? "fill-red-500 text-red-500"
                  : "text-[#1D1D1F]/60 dark:text-white/60"
              }`}
              strokeWidth={2}
            />
          </button>

          <div className="absolute bottom-2.5 left-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.preventDefault();
                onQuickView(product.id);
              }}
              className="w-full bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md text-[#1D1D1F] dark:text-white text-[10px] tracking-widest uppercase py-2.5 rounded-lg hover:bg-[#1D1D1F] dark:hover:bg-white hover:text-white dark:hover:text-[#1D1D1F] transition-colors duration-300"
            >
              Quick View
            </button>
          </div>
        </div>

        <p className="text-[9px] uppercase tracking-widest text-[#86868B] font-body mb-1 truncate">
          {product.category?.name || "ZAEM"}
        </p>
        <h3 className="font-display text-sm md:text-base leading-tight line-clamp-2 mb-1.5 text-[#1D1D1F] dark:text-white group-hover:opacity-70 transition-opacity">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 flex-wrap">
          <p className="font-body text-sm md:text-base font-medium text-[#1D1D1F] dark:text-white">
            Rs. {product.price.toLocaleString()}
          </p>
          {hasDiscount && (
            <p className="font-body text-[11px] text-[#86868B] line-through">
              Rs. {product.comparePrice.toLocaleString()}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}

// ==================== MAIN CONTENT ====================
function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null);
  const [aiSearchOpen, setAiSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  const { categories, loading: categoriesLoading } = useCategories();
  const { wishlistIds, toggle: toggleWishlist } = useWishlist();
  const { addRecent } = useRecentlyViewed();

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sort) params.set("sort", sort);
    if (search) params.set("search", search);
    return params.toString();
  }, [category, minPrice, maxPrice, sort, search]);

  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = buildQuery();
        const res = await fetch(`${API_URL}/api/products?${query}`);
        const data = await res.json();
        if (!cancelled && data.success) setProducts(data.data.products);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProducts();

    const query = buildQuery();
    router.replace(`/shop${query ? `?${query}` : ""}`, { scroll: false });

    return () => {
      cancelled = true;
    };
  }, [category, minPrice, maxPrice, sort, search, buildQuery, router]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 800);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const clearFilters = useCallback(() => {
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSearch("");
    setSort("newest");
  }, []);

  const toggleExpand = useCallback((slug: string) => {
    setExpandedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }, []);

  const handleQuickView = useCallback((id: string) => {
    setQuickViewProductId(id);
  }, []);

  const handleWishlistToggle = useCallback(
    async (id: string) => {
      const result = await toggleWishlist(id);
      if (result?.needsLogin) {
        router.push("/account/login");
      }
    },
    [toggleWishlist, router]
  );

  const handleView = useCallback(
    (id: string) => {
      addRecent(id);
    },
    [addRecent]
  );

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ url, title: "ZAEM" });
      } else {
        await navigator.clipboard.writeText(url);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      }
    } catch {
      // user cancelled
    }
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const hasActiveFilters = useMemo(
    () => !!(category || minPrice || maxPrice || search),
    [category, minPrice, maxPrice, search]
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (category) count++;
    if (minPrice || maxPrice) count++;
    if (search) count++;
    return count;
  }, [category, minPrice, maxPrice, search]);

  const pageTitle = useMemo(
    () => findCategoryBySlug(category, categories),
    [category, categories]
  );

  const breadcrumb = useMemo(
    () => getBreadcrumb(category, categories),
    [category, categories]
  );

  return (
    <main className="bg-[#FAFAFA] dark:bg-black text-[#1D1D1F] dark:text-white min-h-screen">
      {/* ==================== PAGE HEADER ==================== */}
      <section className="pt-8 md:pt-12 pb-6 md:pb-8 px-4 md:px-8 border-b border-[#E5E5E7] dark:border-[#38383A]">
        <div className="max-w-[1600px] mx-auto">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#86868B] font-body mb-4 flex-wrap">
            {breadcrumb.map((item, i) => (
              <div key={item.href} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="w-3 h-3" />}
                {i === breadcrumb.length - 1 ? (
                  <span className="text-[#1D1D1F] dark:text-white">{item.label}</span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-3xl md:text-5xl lg:text-6xl mb-2 text-[#1D1D1F] dark:text-white">
                {pageTitle}
              </h1>
              <p className="text-[#6E6E73] dark:text-[#98989D] text-sm md:text-base max-w-2xl font-body">
                {products.length > 0
                  ? `${products.length} ${
                      products.length === 1 ? "piece" : "pieces"
                    } curated for you`
                  : "A curated selection of premium pieces"}
              </p>
            </div>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-body text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
              aria-label="Share this page"
            >
              <Share2 className="w-3.5 h-3.5" strokeWidth={1.8} />
              Share
            </button>
          </div>
        </div>
      </section>

      {/* ==================== STICKY FILTER BAR ==================== */}
      <section className="sticky top-0 z-30 bg-[#FAFAFA]/95 dark:bg-black/95 backdrop-blur-xl border-b border-[#E5E5E7] dark:border-[#38383A]">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1 min-w-0">
              <button
                onClick={() => setCategory("")}
                className={`px-3.5 py-2 text-[10px] tracking-widest uppercase font-body rounded-full whitespace-nowrap shrink-0 transition-all duration-200 ${
                  !category
                    ? "bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F]"
                    : "bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#6E6E73] dark:text-[#98989D] hover:bg-[#E5E5E7] dark:hover:bg-[#2C2C2E]"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setCategory(cat.slug)}
                  className={`px-3.5 py-2 text-[10px] tracking-widest uppercase font-body rounded-full whitespace-nowrap shrink-0 transition-all duration-200 ${
                    category === cat.slug
                      ? "bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F]"
                      : "bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#6E6E73] dark:text-[#98989D] hover:bg-[#E5E5E7] dark:hover:bg-[#2C2C2E]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* View mode */}
              <div className="hidden md:flex items-center gap-1 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-full p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-full transition-all ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-sm"
                      : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
                  }`}
                  aria-label="Grid view"
                >
                  <Grid3x3 className="w-3.5 h-3.5" strokeWidth={1.8} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-full transition-all ${
                    viewMode === "list"
                      ? "bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-sm"
                      : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
                  }`}
                  aria-label="List view"
                >
                  <List className="w-3.5 h-3.5" strokeWidth={1.8} />
                </button>
              </div>

              {/* Sort */}
              <div className="relative">
                <button
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-full text-[10px] tracking-widest uppercase font-body text-[#1D1D1F] dark:text-white hover:bg-[#E5E5E7] dark:hover:bg-[#2C2C2E] transition-colors shrink-0"
                >
                  Sort
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      sortDropdownOpen ? "rotate-180" : ""
                    }`}
                    strokeWidth={2}
                  />
                </button>

                {sortDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setSortDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1C1C1E] border border-[#E5E5E7] dark:border-[#38383A] shadow-xl rounded-xl z-20 py-2 overflow-hidden">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSort(opt.value);
                            setSortDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-body flex items-center justify-between transition-colors ${
                            sort === opt.value
                              ? "bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white"
                              : "text-[#6E6E73] dark:text-[#98989D] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]"
                          }`}
                        >
                          {opt.label}
                          {sort === opt.value && (
                            <Check className="w-3.5 h-3.5" strokeWidth={2} />
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Filters (mobile) */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-full text-[10px] tracking-widest uppercase font-body text-[#1D1D1F] dark:text-white hover:bg-[#E5E5E7] dark:hover:bg-[#2C2C2E] transition-colors relative shrink-0"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.8} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] text-[9px] rounded-full flex items-center justify-center font-medium">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== MAIN GRID ==================== */}
      <section className="py-8 md:py-10 px-4 md:px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* ==================== SIDEBAR (Desktop) ==================== */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24 space-y-8">
                {/* Search */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] uppercase tracking-widest text-[#6E6E73] dark:text-[#98989D] font-body">
                      Search
                    </p>
                    <button
                      onClick={() => setAiSearchOpen(true)}
                      className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
                    >
                      <Sparkles className="w-3 h-3" strokeWidth={2} />
                      AI
                    </button>
                  </div>
                  <div className="relative">
                    <Search
                      className="w-3.5 h-3.5 text-[#86868B] absolute left-3 top-1/2 -translate-y-1/2"
                      strokeWidth={2}
                    />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search products..."
                      className="w-full bg-white dark:bg-[#1C1C1E] border border-[#E5E5E7] dark:border-[#38383A] rounded-lg pl-9 pr-3 py-2.5 text-sm font-body text-[#1D1D1F] dark:text-white outline-none focus:border-[#1D1D1F] dark:focus:border-white transition-colors"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] rounded-full transition-colors"
                        aria-label="Clear search"
                      >
                        <X className="w-3 h-3 text-[#86868B]" strokeWidth={2} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#6E6E73] dark:text-[#98989D] font-body mb-3">
                    Category
                  </p>

                  <button
                    onClick={() => setCategory("")}
                    className={`block text-sm font-body mb-2 transition-colors ${
                      !category
                        ? "text-[#1D1D1F] dark:text-white font-medium"
                        : "text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-white"
                    }`}
                  >
                    All Products
                  </button>

                  {categoriesLoading && (
                    <div className="space-y-2 mt-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-4 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded animate-pulse w-3/4"
                        />
                      ))}
                    </div>
                  )}

                  {!categoriesLoading &&
                    categories.map((cat) => {
                      const isExpanded = expandedCategories.includes(cat.slug);
                      const hasChildren = cat.children && cat.children.length > 0;
                      const productCount = cat._count?.products;

                      return (
                        <div key={cat.slug} className="mb-0.5">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => setCategory(cat.slug)}
                              className={`block text-sm font-body py-1.5 transition-colors text-left flex-1 ${
                                category === cat.slug
                                  ? "text-[#1D1D1F] dark:text-white font-medium"
                                  : "text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-white"
                              }`}
                            >
                              {cat.name}
                              {productCount !== undefined && (
                                <span className="text-[#86868B] ml-1">
                                  ({productCount})
                                </span>
                              )}
                            </button>
                            {hasChildren && (
                              <button
                                onClick={() => toggleExpand(cat.slug)}
                                className="p-1 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
                                aria-label="Expand"
                              >
                                <ChevronDown
                                  className={`w-3 h-3 transition-transform duration-200 ${
                                    isExpanded ? "rotate-180" : ""
                                  }`}
                                  strokeWidth={2}
                                />
                              </button>
                            )}
                          </div>

                          {hasChildren && (
                            <div
                              className={`overflow-hidden transition-all duration-300 ${
                                isExpanded
                                  ? "max-h-[800px] opacity-100 mt-1"
                                  : "max-h-0 opacity-0"
                              }`}
                            >
                              <div className="pl-3 border-l border-[#E5E5E7] dark:border-[#38383A] space-y-0.5">
                                {cat.children!.map((child) => {
                                  const hasGrandchildren =
                                    child.children && child.children.length > 0;
                                  const childKey = `${cat.slug}-${child.slug}`;
                                  const isChildExpanded =
                                    expandedCategories.includes(childKey);
                                  const childCount = child._count?.products;

                                  return (
                                    <div key={child.slug}>
                                      <div className="flex items-center justify-between">
                                        <button
                                          onClick={() => setCategory(child.slug)}
                                          className={`block text-xs font-body py-1 transition-colors text-left flex-1 ${
                                            category === child.slug
                                              ? "text-[#1D1D1F] dark:text-white font-medium"
                                              : "text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-white"
                                          }`}
                                        >
                                          {child.name}
                                          {childCount !== undefined && (
                                            <span className="text-[#86868B] ml-1">
                                              ({childCount})
                                            </span>
                                          )}
                                        </button>
                                        {hasGrandchildren && (
                                          <button
                                            onClick={() => toggleExpand(childKey)}
                                            className="p-1 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
                                            aria-label="Expand"
                                          >
                                            <ChevronDown
                                              className={`w-2.5 h-2.5 transition-transform duration-200 ${
                                                isChildExpanded ? "rotate-180" : ""
                                              }`}
                                              strokeWidth={2}
                                            />
                                          </button>
                                        )}
                                      </div>

                                      {hasGrandchildren && (
                                        <div
                                          className={`overflow-hidden transition-all duration-300 ${
                                            isChildExpanded
                                              ? "max-h-[500px] opacity-100"
                                              : "max-h-0 opacity-0"
                                          }`}
                                        >
                                          <div className="pl-3 border-l border-[#E5E5E7] dark:border-[#38383A] space-y-0.5 mt-0.5">
                                            {child.children!.map((grandchild) => (
                                              <button
                                                key={grandchild.slug}
                                                onClick={() =>
                                                  setCategory(grandchild.slug)
                                                }
                                                className={`block w-full text-left text-[11px] font-body py-1 transition-colors ${
                                                  category === grandchild.slug
                                                    ? "text-[#1D1D1F] dark:text-white font-medium"
                                                    : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
                                                }`}
                                              >
                                                {grandchild.name}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>

                {/* Price */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#6E6E73] dark:text-[#98989D] font-body mb-3">
                    Price
                  </p>
                  <div className="space-y-1.5">
                    {PRICE_RANGES.map((range, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setMinPrice(range.min);
                          setMaxPrice(range.max);
                        }}
                        className={`block text-sm font-body transition-colors ${
                          minPrice === range.min && maxPrice === range.max
                            ? "text-[#1D1D1F] dark:text-white font-medium"
                            : "text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-white"
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-[#D2D2D7] dark:border-[#48484A] rounded-lg text-[10px] uppercase tracking-widest font-body text-[#6E6E73] dark:text-[#98989D] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors"
                  >
                    <X className="w-3 h-3" strokeWidth={2} />
                    Clear All Filters
                  </button>
                )}
              </div>
            </aside>

            {/* ==================== PRODUCTS GRID ==================== */}
            <div className="lg:col-span-9">
              {hasActiveFilters && (
                <div className="flex items-center gap-2 mb-6 flex-wrap">
                  <span className="text-[10px] uppercase tracking-widest text-[#86868B] font-body">
                    Active:
                  </span>
                  {category && (
                    <button
                      onClick={() => setCategory("")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] text-[10px] tracking-widest uppercase font-body rounded-full hover:opacity-80 transition-colors"
                    >
                      {findCategoryBySlug(category, categories)}
                      <X className="w-3 h-3" strokeWidth={2} />
                    </button>
                  )}
                  {(minPrice || maxPrice) && (
                    <button
                      onClick={() => {
                        setMinPrice("");
                        setMaxPrice("");
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] text-[10px] tracking-widest uppercase font-body rounded-full hover:opacity-80 transition-colors"
                    >
                      Price
                      <X className="w-3 h-3" strokeWidth={2} />
                    </button>
                  )}
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] text-[10px] tracking-widest uppercase font-body rounded-full hover:opacity-80 transition-colors"
                    >
                      &quot;{search}&quot;
                      <X className="w-3 h-3" strokeWidth={2} />
                    </button>
                  )}
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[3/4] bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-lg mb-3" />
                      <div className="h-2.5 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded mb-2 w-1/3" />
                      <div className="h-3.5 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded mb-2 w-3/4" />
                      <div className="h-2.5 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded w-1/4" />
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-[#1C1C1E] rounded-xl border border-[#E5E5E7] dark:border-[#38383A]">
                  <div className="w-16 h-16 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package
                      className="w-7 h-7 text-[#86868B]"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="font-display text-xl md:text-2xl mb-2 text-[#1D1D1F] dark:text-white">
                    Nothing here yet
                  </h3>
                  <p className="text-[#6E6E73] dark:text-[#98989D] font-body text-sm mb-6 max-w-md mx-auto">
                    No products match your current filters. Try adjusting them
                    or clear all.
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] text-[10px] tracking-widest uppercase font-body rounded-full hover:opacity-80 transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5"
                      : "space-y-3"
                  }
                >
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      viewMode={viewMode}
                      onQuickView={handleQuickView}
                      isInWishlist={wishlistIds.has(product.id)}
                      onWishlistToggle={handleWishlistToggle}
                      onView={handleView}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== MOBILE FILTERS DRAWER ==================== */}
      <div
        className={`fixed inset-0 z-[100] lg:hidden ${
          mobileFiltersOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            mobileFiltersOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileFiltersOpen(false)}
        />

        <div
          className={`absolute top-0 left-0 w-[85vw] max-w-[380px] bg-[#FAFAFA] dark:bg-[#0A0A0A] shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            mobileFiltersOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ height: "100dvh" }}
        >
          <div className="flex items-center justify-between h-16 px-5 border-b border-[#E5E5E7] dark:border-[#38383A] shrink-0">
            <p className="font-display text-xl text-[#1D1D1F] dark:text-white">
              Filters
            </p>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="w-9 h-9 flex items-center justify-center hover:bg-[#F5F5F7] dark:hover:bg-[#1C1C1E] rounded-full transition-colors"
              aria-label="Close"
            >
              <X
                className="w-4.5 h-4.5 text-[#1D1D1F] dark:text-white"
                strokeWidth={2}
              />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6">
            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-widest text-[#6E6E73] dark:text-[#98989D] font-body mb-3">
                Category
              </p>

              <button
                onClick={() => setCategory("")}
                className={`block text-base font-body mb-2 transition-colors ${
                  !category
                    ? "text-[#1D1D1F] dark:text-white font-medium"
                    : "text-[#6E6E73] dark:text-[#98989D]"
                }`}
              >
                All Products
              </button>

              {categories.map((cat) => {
                const isExpanded = expandedCategories.includes(cat.slug);
                const hasChildren = cat.children && cat.children.length > 0;

                return (
                  <div key={cat.slug} className="mb-0.5">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setCategory(cat.slug)}
                        className={`block text-base font-body py-2 transition-colors text-left flex-1 ${
                          category === cat.slug
                            ? "text-[#1D1D1F] dark:text-white font-medium"
                            : "text-[#6E6E73] dark:text-[#98989D]"
                        }`}
                      >
                        {cat.name}
                      </button>
                      {hasChildren && (
                        <button
                          onClick={() => toggleExpand(cat.slug)}
                          className="p-1.5 text-[#86868B]"
                          aria-label="Expand"
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                            strokeWidth={2}
                          />
                        </button>
                      )}
                    </div>

                    {hasChildren && (
                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          isExpanded
                            ? "max-h-[800px] opacity-100 mt-1"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="pl-3 border-l border-[#E5E5E7] dark:border-[#38383A] space-y-0.5">
                          {cat.children!.map((child) => {
                            const hasGrandchildren =
                              child.children && child.children.length > 0;
                            const childKey = `${cat.slug}-${child.slug}`;
                            const isChildExpanded =
                              expandedCategories.includes(childKey);

                            return (
                              <div key={child.slug}>
                                <div className="flex items-center justify-between">
                                  <button
                                    onClick={() => setCategory(child.slug)}
                                    className={`block text-sm font-body py-1.5 transition-colors text-left flex-1 ${
                                      category === child.slug
                                        ? "text-[#1D1D1F] dark:text-white font-medium"
                                        : "text-[#6E6E73] dark:text-[#98989D]"
                                    }`}
                                  >
                                    {child.name}
                                  </button>
                                  {hasGrandchildren && (
                                    <button
                                      onClick={() => toggleExpand(childKey)}
                                      className="p-1 text-[#86868B]"
                                      aria-label="Expand"
                                    >
                                      <ChevronDown
                                        className={`w-3 h-3 transition-transform duration-200 ${
                                          isChildExpanded ? "rotate-180" : ""
                                        }`}
                                        strokeWidth={2}
                                      />
                                    </button>
                                  )}
                                </div>

                                {hasGrandchildren && (
                                  <div
                                    className={`overflow-hidden transition-all duration-300 ${
                                      isChildExpanded
                                        ? "max-h-[500px] opacity-100"
                                        : "max-h-0 opacity-0"
                                    }`}
                                  >
                                    <div className="pl-3 border-l border-[#E5E5E7] dark:border-[#38383A] space-y-0.5 mt-0.5">
                                      {child.children!.map((grandchild) => (
                                        <button
                                          key={grandchild.slug}
                                          onClick={() =>
                                            setCategory(grandchild.slug)
                                          }
                                          className={`block w-full text-left text-xs font-body py-1.5 transition-colors ${
                                            category === grandchild.slug
                                              ? "text-[#1D1D1F] dark:text-white font-medium"
                                              : "text-[#86868B]"
                                          }`}
                                        >
                                          {grandchild.name}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-widest text-[#6E6E73] dark:text-[#98989D] font-body mb-3">
                Search
              </p>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-white dark:bg-[#1C1C1E] border border-[#E5E5E7] dark:border-[#38383A] rounded-lg px-3 py-2.5 text-sm font-body text-[#1D1D1F] dark:text-white outline-none focus:border-[#1D1D1F] dark:focus:border-white transition-colors"
              />
            </div>

            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-widest text-[#6E6E73] dark:text-[#98989D] font-body mb-3">
                Price
              </p>
              <div className="space-y-2">
                {PRICE_RANGES.map((range, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setMinPrice(range.min);
                      setMaxPrice(range.max);
                    }}
                    className={`block text-base font-body transition-colors ${
                      minPrice === range.min && maxPrice === range.max
                        ? "text-[#1D1D1F] dark:text-white font-medium"
                        : "text-[#6E6E73] dark:text-[#98989D]"
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-5 border-t border-[#E5E5E7] dark:border-[#38383A] flex gap-3 shrink-0">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex-1 py-3 border border-[#D2D2D7] dark:border-[#48484A] rounded-lg text-[10px] tracking-widest uppercase font-body text-[#1D1D1F] dark:text-white hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="flex-1 py-3 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-lg text-[10px] tracking-widest uppercase font-body hover:opacity-80 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* ==================== SCROLL TO TOP ==================== */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-4 md:right-6 z-40 w-11 h-11 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-full shadow-lg hover:opacity-90 transition-opacity duration-300 flex items-center justify-center"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-4 h-4" strokeWidth={2} />
        </button>
      )}

      {/* ==================== SHARE TOAST ==================== */}
      {shareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] text-[11px] tracking-widest uppercase font-body px-5 py-3 rounded-full shadow-2xl">
          Link copied ✓
        </div>
      )}

      {/* ==================== MODALS ==================== */}
      <QuickViewModal
        productId={quickViewProductId}
        onClose={() => setQuickViewProductId(null)}
      />

      <AISearchBar isOpen={aiSearchOpen} onClose={() => setAiSearchOpen(false)} />
    </main>
  );
}

// ==================== PAGE EXPORT ====================
export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] dark:bg-black">
          <Loader2
            className="w-6 h-6 text-[#1D1D1F] dark:text-white animate-spin"
            strokeWidth={2}
          />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}