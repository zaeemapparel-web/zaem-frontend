"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronRight,
  Search,
  Sparkles,
} from "lucide-react";
import QuickViewModal from "@/components/QuickViewModal";
import AISearchBar from "@/components/AISearchBar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
          { name: "Festive '26 Catalogue", slug: "woman-unstitched-festive-catalogue" },
          { name: "Unstitched Pre-Fall '26", slug: "woman-unstitched-pre-fall-catalogue" },
          { name: "Fabric Glossary", slug: "woman-unstitched-fabric-glossary" },
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
          { name: "Trench Coats", slug: "woman-winter-trench" },
          { name: "Over Coats", slug: "woman-winter-overcoat" },
          { name: "Caps & Shawls", slug: "woman-winter-caps-shawls" },
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
          { name: "Silk Boski", slug: "man-unstitched-silk-boski" },
          { name: "Cotton", slug: "man-unstitched-cotton" },
          { name: "Cotton Silk", slug: "man-unstitched-cotton-silk" },
          { name: "Raw Silk", slug: "man-unstitched-raw-silk" },
        ],
      },
      {
        name: "Winter",
        slug: "man-winter",
        children: [
          { name: "Sweaters", slug: "man-winter-sweaters" },
          { name: "Jackets", slug: "man-winter-jackets" },
          { name: "Coats", slug: "man-winter-coats" },
          { name: "Hoodies", slug: "man-winter-hoodies" },
          { name: "Trench Coats", slug: "man-winter-trench" },
          { name: "Over Coats", slug: "man-winter-overcoat" },
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
      { name: "Shop by Scent", slug: "fragrances-by-scent" },
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
  return "Products";
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
              { label: grandchild.name, href: `/shop?category=${grandchild.slug}` },
            ];
          }
        }
      }
    }
  }

  return [{ label: "Shop", href: "/shop" }];
};

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

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sort) params.set("sort", sort);
    if (search) params.set("search", search);
    return params.toString();
  };

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
  }, [category, minPrice, maxPrice, sort, search]);

  const clearFilters = () => {
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSearch("");
    setSort("newest");
  };

  const hasActiveFilters = category || minPrice || maxPrice || search;

  const toggleExpand = (slug: string) => {
    setExpandedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const pageTitle = category ? findCategoryBySlug(category) : "The Collection";
  const breadcrumb = getBreadcrumb(category);

  return (
    <main className="bg-ivory text-ink min-h-screen">

      {/* PAGE HEADER */}
      <section className="pt-8 md:pt-12 pb-8 md:pb-10 px-6 md:px-10 lg:px-16 border-b border-ink/10">
        <div className="max-w-[1800px] mx-auto">
          <nav className="flex items-center gap-2 text-label text-muted mb-6 flex-wrap">
            {breadcrumb.map((item, i) => (
              <div key={item.href} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="w-3 h-3" />}
                {i === breadcrumb.length - 1 ? (
                  <span className="text-ink">{item.label}</span>
                ) : (
                  <Link href={item.href} className="hover:text-gold transition-colors">
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          <h1 className="display-lg mb-4">{pageTitle}</h1>
          <p className="text-muted text-sm md:text-base max-w-2xl font-body">
            A curated selection of premium pieces — designed with intention, crafted for the discerning.
          </p>
        </div>
      </section>

      {/* AI SEARCH BAR — Pro Feature */}
      <section className="px-6 md:px-10 lg:px-16 pt-6 md:pt-8">
        <div className="max-w-[1800px] mx-auto">
          <button
            onClick={() => setAiSearchOpen(true)}
            className="w-full flex items-center gap-3 px-4 md:px-6 py-4 bg-white border border-ink/15 hover:border-gold transition-all duration-300 text-left group"
          >
            <Search className="w-5 h-5 text-ink/50 group-hover:text-gold transition-colors shrink-0" strokeWidth={1.8} />
            <span className="text-sm md:text-base text-ink/60 font-body flex-1 truncate">
              Search with AI... try "red dress under 5000" or "shaadi ke liye outfit"
            </span>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-gold to-[#B8935A] shrink-0">
              <Sparkles className="w-3 h-3 text-ink" />
              <span className="text-[10px] uppercase tracking-widest text-ink font-medium hidden sm:inline">
                AI
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* FILTERS + PRODUCTS */}
      <section className="py-10 md:py-14 px-6 md:px-10 lg:px-16">
        <div className="max-w-[1800px] mx-auto">

          {/* Filter Bar */}
          <div className="flex items-center justify-between mb-8 md:mb-12 pb-6 border-b border-ink/10 gap-4">
            <div className="hidden lg:flex items-center gap-8 flex-wrap">
              <button
                onClick={() => setCategory("")}
                className={`text-label transition-colors duration-500 ${!category ? "text-gold" : "text-ink hover:text-gold"}`}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setCategory(cat.slug)}
                  className={`text-label transition-colors duration-500 whitespace-nowrap ${category === cat.slug ? "text-gold" : "text-ink hover:text-gold"}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-6 ml-auto">
              <span className="hidden md:block text-label text-muted">{products.length} Items</span>

              <div className="relative">
                <button
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  className="text-label flex items-center gap-2 hover:text-gold transition-colors duration-500"
                >
                  Sort
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-300 ${sortDropdownOpen ? "rotate-180" : ""}`}
                    strokeWidth={1.5}
                  />
                </button>

                {sortDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setSortDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-3 w-56 bg-ivory border border-ink/10 shadow-xl z-20 py-2">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSort(opt.value);
                            setSortDropdownOpen(false);
                          }}
                          className={`block w-full text-left px-5 py-3 text-sm font-body hover:bg-bone transition-colors ${sort === opt.value ? "text-gold" : "text-ink"}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden text-label flex items-center gap-2 hover:text-gold transition-colors duration-500"
              >
                <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
                Filters
              </button>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="grid lg:grid-cols-12 gap-10">

            {/* SIDEBAR */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="mb-10">
                <p className="text-label text-muted mb-4">Search</p>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-2 text-sm font-body transition-colors duration-500"
                />
              </div>

              <div className="mb-10">
                <p className="text-label text-muted mb-4">Category</p>

                <button
                  onClick={() => setCategory("")}
                  className={`block text-sm font-body mb-3 transition-colors duration-500 ${!category ? "text-gold" : "text-ink/70 hover:text-gold"}`}
                >
                  All Products
                </button>

                {CATEGORIES.map((cat) => {
                  const isExpanded = expandedCategories.includes(cat.slug);
                  return (
                    <div key={cat.slug} className="mb-1">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setCategory(cat.slug)}
                          className={`block text-sm font-body py-1.5 transition-colors duration-500 text-left flex-1 ${category === cat.slug ? "text-gold" : "text-ink/70 hover:text-gold"}`}
                        >
                          {cat.name}
                        </button>
                        <button
                          onClick={() => toggleExpand(cat.slug)}
                          className="p-1 -mr-1 text-muted hover:text-gold transition-colors"
                        >
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                            strokeWidth={1.5}
                          />
                        </button>
                      </div>

                      <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? "max-h-[800px] opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                        <div className="pl-3 border-l border-ink/10 space-y-0.5">
                          {cat.children.map((child: any) => {
                            if (child.children && child.children.length > 0) {
                              const childKey = `${cat.slug}-${child.slug}`;
                              const isChildExpanded = expandedCategories.includes(childKey);

                              return (
                                <div key={child.slug}>
                                  <div className="flex items-center justify-between">
                                    <button
                                      onClick={() => setCategory(child.slug)}
                                      className={`block text-xs font-body py-1.5 transition-colors text-left flex-1 ${category === child.slug ? "text-gold" : "text-muted hover:text-gold"}`}
                                    >
                                      {child.name}
                                    </button>
                                    <button
                                      onClick={() => toggleExpand(childKey)}
                                      className="p-1 text-muted hover:text-gold transition-colors"
                                    >
                                      <ChevronDown
                                        className={`w-3 h-3 transition-transform duration-300 ${isChildExpanded ? "rotate-180" : ""}`}
                                        strokeWidth={1.5}
                                      />
                                    </button>
                                  </div>

                                  <div className={`overflow-hidden transition-all duration-500 ${isChildExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                                    <div className="pl-3 border-l border-ink/10 space-y-0.5 mt-0.5">
                                      {child.children.map((grandchild: any) => (
                                        <button
                                          key={grandchild.slug}
                                          onClick={() => setCategory(grandchild.slug)}
                                          className={`block w-full text-left text-xs font-body py-1.5 transition-colors ${category === grandchild.slug ? "text-gold" : "text-muted hover:text-gold"}`}
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
                                className={`block w-full text-left text-xs font-body py-1.5 transition-colors ${category === child.slug ? "text-gold" : "text-muted hover:text-gold"}`}
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

              <div className="mb-10">
                <p className="text-label text-muted mb-4">Price</p>
                <div className="space-y-3">
                  {PRICE_RANGES.map((range, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setMinPrice(range.min);
                        setMaxPrice(range.max);
                      }}
                      className={`block text-sm font-body transition-colors duration-500 ${minPrice === range.min && maxPrice === range.max ? "text-gold" : "text-ink/70 hover:text-gold"}`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-label text-gold hover:text-ink transition-colors duration-500 flex items-center gap-2"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Clear All
                </button>
              )}
            </aside>

            {/* PRODUCTS GRID */}
            <div className="lg:col-span-9">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[3/4] bg-bone mb-4" />
                      <div className="h-3 bg-bone mb-2 w-1/3" />
                      <div className="h-4 bg-bone mb-2 w-3/4" />
                      <div className="h-3 bg-bone w-1/4" />
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-32">
                  <p className="font-display text-3xl md:text-4xl mb-4">
                    Nothing here yet.
                  </p>
                  <p className="text-muted font-body mb-8">
                    No products match your filters.
                  </p>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="btn-primary">
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      className="group block"
                    >
                      <div className="relative aspect-[3/4] bg-bone overflow-hidden mb-4 md:mb-5 img-zoom">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="font-display text-6xl text-ink/10">
                              ZAEM
                            </span>
                          </div>
                        )}

                        {product.comparePrice && product.comparePrice > product.price && (
                          <div className="absolute top-4 left-4 bg-gold text-ivory text-[9px] tracking-[0.3em] uppercase font-medium px-3 py-1.5">
                            Sale
                          </div>
                        )}

                        {product.stock > 0 && product.stock <= 5 && (
                          <div className="absolute top-4 right-4 bg-ink text-ivory text-[9px] tracking-[0.3em] uppercase font-medium px-3 py-1.5">
                            Only {product.stock} left
                          </div>
                        )}

                        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setQuickViewProductId(product.id);
                            }}
                            className="flex-1 bg-ivory text-ink text-label py-3 hover:bg-gold hover:text-ivory transition-colors duration-500"
                          >
                            Quick View
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-label text-gold mb-2">
                          {product.category?.name || "ZAEM"}
                        </p>
                        <h3 className="font-display text-base md:text-xl mb-2 group-hover:text-gold transition-colors duration-500">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-3">
                          <p className="text-ink text-sm font-body">
                            PKR {product.price.toLocaleString()}
                          </p>
                          {product.comparePrice && product.comparePrice > product.price && (
                            <p className="text-muted text-xs line-through font-body">
                              PKR {product.comparePrice.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MOBILE FILTERS DRAWER */}
      <div className={`fixed inset-0 z-[100] lg:hidden ${mobileFiltersOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-500 ${mobileFiltersOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileFiltersOpen(false)}
        />

        <div
          className={`absolute top-0 left-0 w-screen max-w-full md:max-w-[420px] bg-ivory shadow-2xl flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileFiltersOpen ? "translate-x-0" : "-translate-x-full"}`}
          style={{ height: "100dvh", maxHeight: "100dvh" }}
        >
          <div className="flex items-center justify-between h-20 px-5 border-b border-ink/10 shrink-0">
            <p className="font-display text-2xl">Filters</p>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-bone transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6">
            <div className="mb-10">
              <p className="text-label text-muted mb-4">Category</p>

              <button
                onClick={() => setCategory("")}
                className={`block text-base font-body mb-3 transition-colors ${!category ? "text-gold" : "text-ink/70"}`}
              >
                All Products
              </button>

              {CATEGORIES.map((cat) => {
                const isExpanded = expandedCategories.includes(cat.slug);
                return (
                  <div key={cat.slug} className="mb-1">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setCategory(cat.slug)}
                        className={`block text-base font-body py-2 transition-colors text-left flex-1 ${category === cat.slug ? "text-gold" : "text-ink/70"}`}
                      >
                        {cat.name}
                      </button>
                      <button
                        onClick={() => toggleExpand(cat.slug)}
                        className="p-1.5 text-muted"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                          strokeWidth={1.5}
                        />
                      </button>
                    </div>

                    <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? "max-h-[800px] opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                      <div className="pl-3 border-l border-ink/10 space-y-0.5">
                        {cat.children.map((child: any) => {
                          if (child.children && child.children.length > 0) {
                            const childKey = `${cat.slug}-${child.slug}`;
                            const isChildExpanded = expandedCategories.includes(childKey);

                            return (
                              <div key={child.slug}>
                                <div className="flex items-center justify-between">
                                  <button
                                    onClick={() => setCategory(child.slug)}
                                    className={`block text-sm font-body py-2 transition-colors text-left flex-1 ${category === child.slug ? "text-gold" : "text-muted"}`}
                                  >
                                    {child.name}
                                  </button>
                                  <button
                                    onClick={() => toggleExpand(childKey)}
                                    className="p-1.5 text-muted"
                                  >
                                    <ChevronDown
                                      className={`w-3.5 h-3.5 transition-transform duration-300 ${isChildExpanded ? "rotate-180" : ""}`}
                                      strokeWidth={1.5}
                                    />
                                  </button>
                                </div>

                                <div className={`overflow-hidden transition-all duration-500 ${isChildExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                                  <div className="pl-3 border-l border-ink/10 space-y-0.5 mt-0.5">
                                    {child.children.map((grandchild: any) => (
                                      <button
                                        key={grandchild.slug}
                                        onClick={() => setCategory(grandchild.slug)}
                                        className={`block w-full text-left text-xs font-body py-2 transition-colors ${category === grandchild.slug ? "text-gold" : "text-muted"}`}
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
                              className={`block w-full text-left text-sm font-body py-2 transition-colors ${category === child.slug ? "text-gold" : "text-muted"}`}
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

            <div className="mb-10">
              <p className="text-label text-muted mb-4">Search</p>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-2 text-sm font-body transition-colors duration-500"
              />
            </div>

            <div className="mb-10">
              <p className="text-label text-muted mb-4">Price</p>
              <div className="space-y-3">
                {PRICE_RANGES.map((range, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setMinPrice(range.min);
                      setMaxPrice(range.max);
                    }}
                    className={`block text-base font-body transition-colors duration-500 ${minPrice === range.min && maxPrice === range.max ? "text-gold" : "text-ink/70 hover:text-gold"}`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-5 border-t border-ink/10 flex gap-3 shrink-0">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex-1 py-3 border border-ink/20 text-label hover:border-gold hover:text-gold transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="flex-1 py-3 bg-ink text-ivory text-label hover:bg-gold transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* QUICK VIEW MODAL */}
      <QuickViewModal
        productId={quickViewProductId}
        onClose={() => setQuickViewProductId(null)}
      />

      {/* AI SEARCH BAR */}
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
          <p className="font-display text-2xl text-muted">Loading...</p>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}