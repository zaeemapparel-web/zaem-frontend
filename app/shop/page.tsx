"use client";

import Link from "next/link";
import { useEffect, useState, Suspense, useCallback, useMemo } from "react";
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
} from "lucide-react";
import QuickViewModal from "@/components/QuickViewModal";
import AISearchBar from "@/components/AISearchBar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ==================== CATEGORIES DATA ====================
const CATEGORIES = [
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

const findCategoryBySlug = (slug: string): string => {
  for (const cat of CATEGORIES) {
    if (cat.slug === slug) return cat.name;
    for (const child of cat.children) {
      if (child.slug === slug) return child.name;
      if ("children" in child && (child as any).children) {
        for (const grandchild of (child as any).children) {
          if (grandchild.slug === slug) return grandchild.name;
        }
      }
    }
  }
  return "The Collection";
};

const getBreadcrumb = (slug: string) => {
  if (!slug) return [{ label: "Shop", href: "/shop" }];

  for (const cat of CATEGORIES) {
    if (cat.slug === slug) {
      return [
        { label: "Shop", href: "/shop" },
        { label: cat.name, href: `/shop?category=${cat.slug}` },
      ];
    }
    for (const child of cat.children) {
      if (child.slug === slug) {
        return [
          { label: "Shop", href: "/shop" },
          { label: cat.name, href: `/shop?category=${cat.slug}` },
          { label: child.name, href: `/shop?category=${child.slug}` },
        ];
      }
      if ("children" in child && (child as any).children) {
        for (const grandchild of (child as any).children) {
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

  return [{ label: "Shop", href: "/shop" }];
};

// ==================== PRODUCT CARD ====================
function ProductCard({
  product,
  viewMode,
  onQuickView,
}: {
  product: any;
  viewMode: "grid" | "list";
  onQuickView: (id: string) => void;
}) {
  const hasDiscount =
    product.comparePrice && product.comparePrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.comparePrice - product.price) / product.comparePrice) * 100
      )
    : 0;

  if (viewMode === "list") {
    return (
      <Link
        href={`/product/${product.slug}`}
        className="group flex gap-4 p-4 bg-white border border-ink/10 rounded-xl hover:border-ink/30 hover:shadow-md transition-all duration-300"
      >
        <div className="w-24 h-32 md:w-32 md:h-40 bg-bone rounded-lg overflow-hidden shrink-0">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-6 h-6 text-ink/20" strokeWidth={1.5} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 py-1">
          <p className="text-[10px] uppercase tracking-widest text-ink/50 font-body mb-1">
            {product.category?.name || "ZAEM"}
          </p>
          <h3 className="font-display text-lg md:text-xl leading-tight mb-2 group-hover:text-ink/70 transition-colors line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-3 flex-wrap">
            <p className="font-body text-base md:text-lg font-medium">
              Rs. {product.price.toLocaleString()}
            </p>
            {hasDiscount && (
              <>
                <p className="font-body text-sm text-ink/40 line-through">
                  Rs. {product.comparePrice.toLocaleString()}
                </p>
                <span className="text-[10px] uppercase tracking-widest bg-ink text-white px-2 py-0.5 rounded">
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>
          {product.stock > 0 && product.stock <= 5 && (
            <p className="text-[11px] text-ink/60 font-body mt-2">
              Only {product.stock} left in stock
            </p>
          )}
        </div>
      </Link>
    );
  }

  return (
    <div className="group">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] bg-bone rounded-lg overflow-hidden mb-3">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-10 h-10 text-ink/15" strokeWidth={1.5} />
            </div>
          )}

          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute top-2.5 left-2.5 bg-ink text-white text-[9px] tracking-widest uppercase px-2 py-1 rounded">
              {discountPercent}% OFF
            </div>
          )}

          {/* Low stock badge */}
          {product.stock > 0 && product.stock <= 5 && (
            <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-sm text-ink text-[9px] tracking-widest uppercase px-2 py-1 rounded border border-ink/10">
              {product.stock} left
            </div>
          )}

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-ink/50 flex items-center justify-center">
              <span className="bg-white text-ink text-[10px] tracking-widest uppercase px-3 py-1.5 rounded">
                Sold Out
              </span>
            </div>
          )}

          {/* Quick view */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.preventDefault();
                onQuickView(product.id);
              }}
              className="w-full bg-white/95 backdrop-blur-md text-ink text-[10px] tracking-widest uppercase py-2.5 rounded-lg hover:bg-ink hover:text-white transition-colors duration-300"
            >
              Quick View
            </button>
          </div>
        </div>

        <p className="text-[9px] uppercase tracking-widest text-ink/50 font-body mb-1 truncate">
          {product.category?.name || "ZAEM"}
        </p>
        <h3 className="font-display text-sm md:text-base leading-tight line-clamp-2 mb-1.5 group-hover:text-ink/70 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 flex-wrap">
          <p className="font-body text-sm md:text-base font-medium">
            Rs. {product.price.toLocaleString()}
          </p>
          {hasDiscount && (
            <p className="font-body text-[11px] text-ink/40 line-through">
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
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(
    null
  );
  const [aiSearchOpen, setAiSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);

  // ==================== BUILD QUERY ====================
  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sort) params.set("sort", sort);
    if (search) params.set("search", search);
    return params.toString();
  }, [category, minPrice, maxPrice, sort, search]);

  // ==================== FETCH PRODUCTS ====================
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = buildQuery();
        const res = await fetch(`${API_URL}/api/products?${query}`);
        const data = await res.json();
        if (data.success) setProducts(data.data.products);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();

    const query = buildQuery();
    router.replace(`/shop${query ? `?${query}` : ""}`, { scroll: false });
  }, [category, minPrice, maxPrice, sort, search, buildQuery, router]);

  // ==================== HANDLERS ====================
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

  const hasActiveFilters = useMemo(
    () => !!(category || minPrice || maxPrice || search),
    [category, minPrice, maxPrice, search]
  );

  const pageTitle = useMemo(
    () => findCategoryBySlug(category),
    [category]
  );

  const breadcrumb = useMemo(() => getBreadcrumb(category), [category]);

  return (
    <main className="bg-ivory text-ink min-h-screen">

      {/* ==================== PAGE HEADER ==================== */}
      <section className="pt-8 md:pt-12 pb-6 md:pb-8 px-4 md:px-8 border-b border-ink/10">
        <div className="max-w-[1600px] mx-auto">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-ink/50 font-body mb-4 flex-wrap">
            {breadcrumb.map((item, i) => (
              <div key={item.href} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="w-3 h-3" />}
                {i === breadcrumb.length - 1 ? (
                  <span className="text-ink/70">{item.label}</span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-ink/70 transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-5xl lg:text-6xl mb-2">
                {pageTitle}
              </h1>
              <p className="text-ink/60 text-sm md:text-base max-w-2xl font-body">
                {products.length > 0
                  ? `${products.length} ${
                      products.length === 1 ? "piece" : "pieces"
                    } curated for you`
                  : "A curated selection of premium pieces"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== STICKY FILTER BAR ==================== */}
      <section className="sticky top-0 z-30 bg-ivory/95 backdrop-blur-xl border-b border-ink/10">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1">
              <button
                onClick={() => setCategory("")}
                className={`px-3.5 py-2 text-[10px] tracking-widest uppercase font-body rounded-full whitespace-nowrap transition-all duration-200 ${
                  !category
                    ? "bg-ink text-white"
                    : "bg-bone/50 text-ink/70 hover:bg-bone"
                }`}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setCategory(cat.slug)}
                  className={`px-3.5 py-2 text-[10px] tracking-widest uppercase font-body rounded-full whitespace-nowrap transition-all duration-200 ${
                    category === cat.slug
                      ? "bg-ink text-white"
                      : "bg-bone/50 text-ink/70 hover:bg-bone"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* View mode */}
              <div className="hidden md:flex items-center gap-1 bg-bone/50 rounded-full p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-full transition-all ${
                    viewMode === "grid"
                      ? "bg-white text-ink shadow-sm"
                      : "text-ink/50 hover:text-ink"
                  }`}
                  aria-label="Grid view"
                >
                  <Grid3x3 className="w-3.5 h-3.5" strokeWidth={1.8} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-full transition-all ${
                    viewMode === "list"
                      ? "bg-white text-ink shadow-sm"
                      : "text-ink/50 hover:text-ink"
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
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-bone/50 rounded-full text-[10px] tracking-widest uppercase font-body hover:bg-bone transition-colors"
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
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-ink/10 shadow-xl rounded-xl z-20 py-2 overflow-hidden">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSort(opt.value);
                            setSortDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-body flex items-center justify-between transition-colors ${
                            sort === opt.value
                              ? "bg-bone/50 text-ink"
                              : "text-ink/70 hover:bg-bone/30"
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
                className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 bg-bone/50 rounded-full text-[10px] tracking-widest uppercase font-body hover:bg-bone transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.8} />
                Filters
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
                    <p className="text-[10px] uppercase tracking-widest text-ink/60 font-body">
                      Search
                    </p>
                    <button
                      onClick={() => setAiSearchOpen(true)}
                      className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-ink/60 hover:text-ink transition-colors"
                    >
                      <Sparkles className="w-3 h-3" strokeWidth={2} />
                      AI
                    </button>
                  </div>
                  <div className="relative">
                    <Search
                      className="w-3.5 h-3.5 text-ink/40 absolute left-3 top-1/2 -translate-y-1/2"
                      strokeWidth={2}
                    />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search products..."
                      className="w-full bg-white border border-ink/10 rounded-lg pl-9 pr-3 py-2.5 text-sm font-body outline-none focus:border-ink/30 transition-colors"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-bone rounded-full transition-colors"
                      >
                        <X className="w-3 h-3 text-ink/40" strokeWidth={2} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-ink/60 font-body mb-3">
                    Category
                  </p>

                  <button
                    onClick={() => setCategory("")}
                    className={`block text-sm font-body mb-2 transition-colors ${
                      !category
                        ? "text-ink font-medium"
                        : "text-ink/60 hover:text-ink"
                    }`}
                  >
                    All Products
                  </button>

                  {CATEGORIES.map((cat) => {
                    const isExpanded = expandedCategories.includes(cat.slug);
                    return (
                      <div key={cat.slug} className="mb-0.5">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setCategory(cat.slug)}
                            className={`block text-sm font-body py-1.5 transition-colors text-left flex-1 ${
                              category === cat.slug
                                ? "text-ink font-medium"
                                : "text-ink/60 hover:text-ink"
                            }`}
                          >
                            {cat.name}
                          </button>
                          <button
                            onClick={() => toggleExpand(cat.slug)}
                            className="p-1 text-ink/40 hover:text-ink transition-colors"
                            aria-label="Expand"
                          >
                            <ChevronDown
                              className={`w-3 h-3 transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                              strokeWidth={2}
                            />
                          </button>
                        </div>

                        <div
                          className={`overflow-hidden transition-all duration-300 ${
                            isExpanded
                              ? "max-h-[800px] opacity-100 mt-1"
                              : "max-h-0 opacity-0"
                          }`}
                        >
                          <div className="pl-3 border-l border-ink/10 space-y-0.5">
                            {cat.children.map((child: any) => {
                              if (
                                child.children &&
                                child.children.length > 0
                              ) {
                                const childKey = `${cat.slug}-${child.slug}`;
                                const isChildExpanded =
                                  expandedCategories.includes(childKey);

                                return (
                                  <div key={child.slug}>
                                    <div className="flex items-center justify-between">
                                      <button
                                        onClick={() =>
                                          setCategory(child.slug)
                                        }
                                        className={`block text-xs font-body py-1 transition-colors text-left flex-1 ${
                                          category === child.slug
                                            ? "text-ink font-medium"
                                            : "text-ink/50 hover:text-ink"
                                        }`}
                                      >
                                        {child.name}
                                      </button>
                                      <button
                                        onClick={() =>
                                          toggleExpand(childKey)
                                        }
                                        className="p-1 text-ink/30 hover:text-ink transition-colors"
                                      >
                                        <ChevronDown
                                          className={`w-2.5 h-2.5 transition-transform duration-200 ${
                                            isChildExpanded ? "rotate-180" : ""
                                          }`}
                                          strokeWidth={2}
                                        />
                                      </button>
                                    </div>

                                    <div
                                      className={`overflow-hidden transition-all duration-300 ${
                                        isChildExpanded
                                          ? "max-h-[500px] opacity-100"
                                          : "max-h-0 opacity-0"
                                      }`}
                                    >
                                      <div className="pl-3 border-l border-ink/10 space-y-0.5 mt-0.5">
                                        {child.children.map(
                                          (grandchild: any) => (
                                            <button
                                              key={grandchild.slug}
                                              onClick={() =>
                                                setCategory(grandchild.slug)
                                              }
                                              className={`block w-full text-left text-[11px] font-body py-1 transition-colors ${
                                                category === grandchild.slug
                                                  ? "text-ink font-medium"
                                                  : "text-ink/40 hover:text-ink"
                                              }`}
                                            >
                                              {grandchild.name}
                                            </button>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <button
                                  key={child.slug}
                                  onClick={() => setCategory(child.slug)}
                                  className={`block w-full text-left text-xs font-body py-1 transition-colors ${
                                    category === child.slug
                                      ? "text-ink font-medium"
                                      : "text-ink/50 hover:text-ink"
                                  }`}
                                >
                                  {child.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Price */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-ink/60 font-body mb-3">
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
                            ? "text-ink font-medium"
                            : "text-ink/60 hover:text-ink"
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
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-ink/15 rounded-lg text-[10px] uppercase tracking-widest font-body text-ink/70 hover:bg-bone transition-colors"
                  >
                    <X className="w-3 h-3" strokeWidth={2} />
                    Clear All Filters
                  </button>
                )}
              </div>
            </aside>

            {/* ==================== PRODUCTS GRID ==================== */}
            <div className="lg:col-span-9">
              {/* Active filters */}
              {hasActiveFilters && (
                <div className="flex items-center gap-2 mb-6 flex-wrap">
                  <span className="text-[10px] uppercase tracking-widest text-ink/50 font-body">
                    Active:
                  </span>
                  {category && (
                    <button
                      onClick={() => setCategory("")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-ink text-white text-[10px] tracking-widest uppercase font-body rounded-full hover:bg-ink/80 transition-colors"
                    >
                      {findCategoryBySlug(category)}
                      <X className="w-3 h-3" strokeWidth={2} />
                    </button>
                  )}
                  {(minPrice || maxPrice) && (
                    <button
                      onClick={() => {
                        setMinPrice("");
                        setMaxPrice("");
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-ink text-white text-[10px] tracking-widest uppercase font-body rounded-full hover:bg-ink/80 transition-colors"
                    >
                      Price
                      <X className="w-3 h-3" strokeWidth={2} />
                    </button>
                  )}
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-ink text-white text-[10px] tracking-widest uppercase font-body rounded-full hover:bg-ink/80 transition-colors"
                    >
                      "{search}"
                      <X className="w-3 h-3" strokeWidth={2} />
                    </button>
                  )}
                </div>
              )}

              {/* Loading */}
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[3/4] bg-bone rounded-lg mb-3" />
                      <div className="h-2.5 bg-bone rounded mb-2 w-1/3" />
                      <div className="h-3.5 bg-bone rounded mb-2 w-3/4" />
                      <div className="h-2.5 bg-bone rounded w-1/4" />
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                /* Empty state */
                <div className="text-center py-20 bg-white rounded-xl border border-ink/10">
                  <div className="w-16 h-16 bg-bone rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-7 h-7 text-ink/30" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-xl md:text-2xl mb-2">
                    Nothing here yet
                  </h3>
                  <p className="text-ink/50 font-body text-sm mb-6 max-w-md mx-auto">
                    No products match your current filters. Try adjusting them
                    or clear all.
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-white text-[10px] tracking-widest uppercase font-body rounded-full hover:bg-ink/80 transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                /* Products */
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
          className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${
            mobileFiltersOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileFiltersOpen(false)}
        />

        <div
          className={`absolute top-0 left-0 w-[85vw] max-w-[380px] bg-ivory shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            mobileFiltersOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ height: "100dvh" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-ink/10 shrink-0">
            <p className="font-display text-xl">Filters</p>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="w-9 h-9 flex items-center justify-center hover:bg-bone rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-4.5 h-4.5" strokeWidth={2} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-6">
            {/* Categories */}
            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-widest text-ink/60 font-body mb-3">
                Category
              </p>

              <button
                onClick={() => setCategory("")}
                className={`block text-base font-body mb-2 transition-colors ${
                  !category
                    ? "text-ink font-medium"
                    : "text-ink/60"
                }`}
              >
                All Products
              </button>

              {CATEGORIES.map((cat) => {
                const isExpanded = expandedCategories.includes(cat.slug);
                return (
                  <div key={cat.slug} className="mb-0.5">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setCategory(cat.slug)}
                        className={`block text-base font-body py-2 transition-colors text-left flex-1 ${
                          category === cat.slug
                            ? "text-ink font-medium"
                            : "text-ink/60"
                        }`}
                      >
                        {cat.name}
                      </button>
                      <button
                        onClick={() => toggleExpand(cat.slug)}
                        className="p-1.5 text-ink/40"
                        aria-label="Expand"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                          strokeWidth={2}
                        />
                      </button>
                    </div>

                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        isExpanded
                          ? "max-h-[800px] opacity-100 mt-1"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="pl-3 border-l border-ink/10 space-y-0.5">
                        {cat.children.map((child: any) => {
                          if (child.children && child.children.length > 0) {
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
                                        ? "text-ink font-medium"
                                        : "text-ink/50"
                                    }`}
                                  >
                                    {child.name}
                                  </button>
                                  <button
                                    onClick={() => toggleExpand(childKey)}
                                    className="p-1 text-ink/30"
                                  >
                                    <ChevronDown
                                      className={`w-3 h-3 transition-transform duration-200 ${
                                        isChildExpanded ? "rotate-180" : ""
                                      }`}
                                      strokeWidth={2}
                                    />
                                  </button>
                                </div>

                                <div
                                  className={`overflow-hidden transition-all duration-300 ${
                                    isChildExpanded
                                      ? "max-h-[500px] opacity-100"
                                      : "max-h-0 opacity-0"
                                  }`}
                                >
                                  <div className="pl-3 border-l border-ink/10 space-y-0.5 mt-0.5">
                                    {child.children.map((grandchild: any) => (
                                      <button
                                        key={grandchild.slug}
                                        onClick={() =>
                                          setCategory(grandchild.slug)
                                        }
                                        className={`block w-full text-left text-xs font-body py-1.5 transition-colors ${
                                          category === grandchild.slug
                                            ? "text-ink font-medium"
                                            : "text-ink/40"
                                        }`}
                                      >
                                        {grandchild.name}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <button
                              key={child.slug}
                              onClick={() => setCategory(child.slug)}
                              className={`block w-full text-left text-sm font-body py-1.5 transition-colors ${
                                category === child.slug
                                  ? "text-ink font-medium"
                                  : "text-ink/50"
                              }`}
                            >
                              {child.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Search */}
            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-widest text-ink/60 font-body mb-3">
                Search
              </p>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-white border border-ink/10 rounded-lg px-3 py-2.5 text-sm font-body outline-none focus:border-ink/30 transition-colors"
              />
            </div>

            {/* Price */}
            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-widest text-ink/60 font-body mb-3">
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
                        ? "text-ink font-medium"
                        : "text-ink/60"
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-ink/10 flex gap-3 shrink-0">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex-1 py-3 border border-ink/20 rounded-lg text-[10px] tracking-widest uppercase font-body hover:bg-bone transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="flex-1 py-3 bg-ink text-white rounded-lg text-[10px] tracking-widest uppercase font-body hover:bg-ink/80 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* ==================== MODALS ==================== */}
      <QuickViewModal
        productId={quickViewProductId}
        onClose={() => setQuickViewProductId(null)}
      />

      <AISearchBar
        isOpen={aiSearchOpen}
        onClose={() => setAiSearchOpen(false)}
      />
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-ivory">
          <Loader2 className="w-6 h-6 text-ink/40 animate-spin" strokeWidth={2} />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}