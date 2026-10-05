"use client";
import SizeGuideModal from "@/components/SizeGuideModal";
import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Heart,
  Truck,
  RotateCcw,
  Shield,
  Minus,
  Plus,
  ChevronRight,
  Star,
  Sparkles,
  Check,
  Camera,
  X,
  ThumbsUp,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import SizeRecommender from "@/components/SizeRecommender";
import ProductRecommendations from "@/components/ProductRecommendations";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ==================== MAIN PRODUCT PAGE ====================
export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { openCart } = useCartStore();
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [refreshReviews, setRefreshReviews] = useState(0);
  const [sizeRecommenderOpen, setSizeRecommenderOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/${slug}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.data.product);
          if (data.data.product.sizes?.length > 0) {
            setSelectedSize(data.data.product.sizes[0]);
          }
          if (data.data.product.colors?.length > 0) {
            setSelectedColor(data.data.product.colors[0]);
          }

          if (data.data.product?.name) {
            const viewed = JSON.parse(
              localStorage.getItem("zaem_recently_viewed") || "[]"
            );
            const updated = [
              data.data.product.name,
              ...viewed.filter((n: string) => n !== data.data.product.name),
            ].slice(0, 5);
            localStorage.setItem(
              "zaem_recently_viewed",
              JSON.stringify(updated)
            );
          }
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProduct();
  }, [slug, refreshReviews]);

  useEffect(() => {
    const check = async () => {
      const token = localStorage.getItem("zaem_token");
      if (!token || !product?.id) return;
      try {
        const res = await fetch(`${API_URL}/api/wishlist/check/${product.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setInWishlist(data.data.inWishlist);
      } catch (error) {
        console.error("Wishlist check error:", error);
      }
    };
    check();
  }, [product?.id]);

  const toggleWishlist = async () => {
    const token = localStorage.getItem("zaem_token");
    if (!token) {
      setCartMessage("Please login first");
      setTimeout(() => setCartMessage(""), 3000);
      return;
    }
    if (!product?.id) return;

    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await fetch(`${API_URL}/api/wishlist/${product.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setInWishlist(false);
        setCartMessage("Removed from wishlist");
      } else {
        await fetch(`${API_URL}/api/wishlist`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: product.id }),
        });
        setInWishlist(true);
        setCartMessage("Added to wishlist");
      }
      setTimeout(() => setCartMessage(""), 3000);
    } catch (error) {
      console.error("Wishlist toggle error:", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    setCartMessage("");
    try {
      const token = localStorage.getItem("zaem_token");
      if (!token) {
        setCartMessage("Please login first");
        setTimeout(() => setCartMessage(""), 3000);
        return;
      }

      const res = await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          size: selectedSize || null,
          color: selectedColor || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const cartRes = await fetch(`${API_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const cartData = await cartRes.json();
        if (cartData.success) {
          useCartStore.getState().setCart(
            cartData.data.cart.items,
            cartData.data.cart.itemCount,
            cartData.data.cart.subtotal
          );
        }
        openCart();
      } else {
        setCartMessage(data.message || "Failed to add");
        setTimeout(() => setCartMessage(""), 3000);
      }
    } catch (error) {
      setCartMessage("Failed to add");
      setTimeout(() => setCartMessage(""), 3000);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <main className="bg-ivory min-h-screen">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-20">
          <div className="animate-pulse grid md:grid-cols-2 gap-10">
            <div className="aspect-[3/4] bg-bone" />
            <div className="space-y-4">
              <div className="h-4 bg-bone w-1/4" />
              <div className="h-10 bg-bone w-3/4" />
              <div className="h-6 bg-bone w-1/3" />
              <div className="h-20 bg-bone" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="bg-ivory min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-display text-4xl mb-6">Not found.</h1>
          <p className="text-ink/60 mb-8 font-body">
            This product doesn't exist.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-white text-[10px] tracking-widest uppercase font-body rounded-full hover:bg-ink/80 transition-colors"
          >
            Back to Shop
          </Link>
        </div>
      </main>
    );
  }

  const hasDiscount =
    product.comparePrice && product.comparePrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.comparePrice - product.price) / product.comparePrice) * 100
      )
    : 0;

  return (
    <main className="bg-ivory text-ink min-h-screen">

      {/* ==================== BREADCRUMB ==================== */}
      <section className="pt-6 md:pt-8 px-4 md:px-8 border-b border-ink/5">
        <div className="max-w-[1400px] mx-auto pb-4">
          <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-ink/50 font-body flex-wrap">
            <Link href="/" className="hover:text-ink/70 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/shop" className="hover:text-ink/70 transition-colors">
              Shop
            </Link>
            {product.category?.parent && (
              <>
                <ChevronRight className="w-3 h-3" />
                <Link
                  href={`/shop?category=${product.category.parent.slug}`}
                  className="hover:text-ink/70 transition-colors"
                >
                  {product.category.parent.name}
                </Link>
              </>
            )}
            {product.category && (
              <>
                <ChevronRight className="w-3 h-3" />
                <Link
                  href={`/shop?category=${product.category.slug}`}
                  className="hover:text-ink/70 transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-3 h-3" />
            <span className="text-ink truncate max-w-[200px] md:max-w-none">
              {product.name}
            </span>
          </nav>
        </div>
      </section>

      {/* ==================== PRODUCT DETAILS ==================== */}
      <section className="py-8 md:py-12 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">

            {/* LEFT — IMAGES */}
            <div>
              <div className="relative aspect-[3/4] bg-bone rounded-lg overflow-hidden mb-3">
                {product.images?.[selectedImage] ? (
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-display text-6xl text-ink/10">
                      ZAEM
                    </span>
                  </div>
                )}

                {hasDiscount && (
                  <div className="absolute top-3 left-3 bg-ink text-white text-[9px] tracking-widest uppercase px-2.5 py-1.5 rounded">
                    -{discountPercent}%
                  </div>
                )}
              </div>

              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 md:gap-3">
                  {product.images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative aspect-square bg-bone rounded overflow-hidden border-2 transition-all duration-300 ${
                        selectedImage === i
                          ? "border-ink"
                          : "border-transparent hover:border-ink/30"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT — INFO */}
            <div className="md:pt-2">

              {product.category && (
                <p className="text-[10px] uppercase tracking-widest text-ink/50 font-body mb-3">
                  {product.category.name}
                </p>
              )}

              <h1 className="font-display text-2xl md:text-3xl lg:text-4xl mb-4">
                {product.name}
              </h1>

              {product.reviewCount > 0 && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.round(product.avgRating)
                            ? "fill-ink text-ink"
                            : "text-ink/20"
                        }`}
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-ink/60 font-body">
                    {product.avgRating} ({product.reviewCount})
                  </span>
                </div>
              )}

              <div className="flex items-baseline gap-3 mb-6">
                <p className="font-display text-2xl md:text-3xl">
                  Rs. {product.price.toLocaleString()}
                </p>
                {hasDiscount && (
                  <p className="text-ink/40 text-lg line-through font-body">
                    Rs. {product.comparePrice.toLocaleString()}
                  </p>
                )}
              </div>

              <p className="text-ink/70 text-sm md:text-base leading-relaxed font-body mb-8">
                {product.description}
              </p>

              {/* SIZE */}
              {product.sizes?.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] uppercase tracking-widest text-ink/60 font-body">
                      Size
                    </p>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setSizeRecommenderOpen(true)}
                        className="text-[10px] uppercase tracking-widest text-ink/60 hover:text-ink transition-colors flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" strokeWidth={2} />
                        Find My Size
                      </button>
                      <button
                        type="button"
                        onClick={() => setSizeGuideOpen(true)}
                        className="text-[10px] uppercase tracking-widest text-ink/60 hover:text-ink transition-colors"
                      >
                        Size Guide
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[48px] h-11 px-4 text-[11px] tracking-widest uppercase font-body border rounded transition-all duration-200 ${
                          selectedSize === size
                            ? "border-ink bg-ink text-white"
                            : "border-ink/20 hover:border-ink/50"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* COLOR */}
              {product.colors?.length > 0 && (
                <div className="mb-6">
                  <p className="text-[10px] uppercase tracking-widest text-ink/60 font-body mb-3">
                    Color
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color: string) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 text-[11px] tracking-widest uppercase font-body border rounded transition-all duration-200 ${
                          selectedColor === color
                            ? "border-ink bg-ink text-white"
                            : "border-ink/20 hover:border-ink/50"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* QUANTITY */}
              <div className="mb-6">
                <p className="text-[10px] uppercase tracking-widest text-ink/60 font-body mb-3">
                  Quantity
                </p>
                <div className="inline-flex items-center border border-ink/20 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-11 h-11 flex items-center justify-center hover:bg-bone transition-colors"
                    aria-label="Decrease"
                  >
                    <Minus className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                  <span className="w-12 text-center font-body text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock || 10, quantity + 1))
                    }
                    className="w-11 h-11 flex items-center justify-center hover:bg-bone transition-colors"
                    aria-label="Increase"
                  >
                    <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </div>

                {product.stock > 0 && product.stock <= 5 && (
                  <p className="text-[10px] uppercase tracking-widest text-ink/70 mt-3 font-body">
                    Only {product.stock} left in stock
                  </p>
                )}
                {product.stock === 0 && (
                  <p className="text-[10px] uppercase tracking-widest text-ink/40 mt-3 font-body">
                    Out of stock
                  </p>
                )}
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.stock === 0}
                  className={`flex-1 h-13 py-4 text-[11px] tracking-widest uppercase font-body rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    product.stock === 0
                      ? "bg-bone text-ink/40 cursor-not-allowed"
                      : "bg-ink text-white hover:bg-ink/80 active:scale-[0.98]"
                  }`}
                >
                  {addingToCart ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Adding...
                    </>
                  ) : product.stock === 0 ? (
                    "Out of Stock"
                  ) : (
                    "Add to Cart"
                  )}
                </button>

                <button
                  onClick={toggleWishlist}
                  disabled={wishlistLoading}
                  className={`w-13 h-13 border rounded-lg flex items-center justify-center transition-all duration-300 ${
                    inWishlist
                      ? "border-ink bg-ink text-white"
                      : "border-ink/20 hover:border-ink/50"
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart
                    className={`w-5 h-5 ${inWishlist ? "fill-current" : ""}`}
                    strokeWidth={1.7}
                  />
                </button>
              </div>

              {cartMessage && (
                <div className="mb-6 p-3 bg-bone border-l-2 border-ink text-xs font-body rounded">
                  {cartMessage}
                </div>
              )}

              {/* TRUST */}
              <div className="border-t border-ink/10 pt-6 space-y-3">
                <div className="flex items-center gap-3 text-xs font-body text-ink/70">
                  <Truck className="w-4 h-4" strokeWidth={1.7} />
                  <span>Free shipping on orders above Rs. 5,000</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-body text-ink/70">
                  <RotateCcw className="w-4 h-4" strokeWidth={1.7} />
                  <span>7-day easy returns</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-body text-ink/70">
                  <Shield className="w-4 h-4" strokeWidth={1.7} />
                  <span>Secure payment — COD, JazzCash, Easypaisa</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ==================== REVIEWS SECTION (UPGRADED) ==================== */}
      <ReviewsSection
        productId={product.id}
        refreshKey={refreshReviews}
        onRefresh={() => setRefreshReviews((r) => r + 1)}
      />

      {/* ==================== RECOMMENDATIONS ==================== */}
      <ProductRecommendations
        currentProductId={product.id}
        title="Complete the Look"
        subtitle="Curated for you"
      />

      {/* ==================== MODALS ==================== */}
      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />

      <SizeRecommender
        isOpen={sizeRecommenderOpen}
        onClose={() => setSizeRecommenderOpen(false)}
        productId={product.id}
        productName={product.name}
        availableSizes={product.sizes || []}
        onSelectSize={(size) => setSelectedSize(size)}
      />
    </main>
  );
}

// ==================== REVIEWS SECTION COMPONENT ====================
function ReviewsSection({
  productId,
  refreshKey,
  onRefresh,
}: {
  productId: string;
  refreshKey: number;
  onRefresh: () => void;
}) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState({
    avgRating: 0,
    total: 0,
    breakdown: [] as { rating: number; count: number }[],
  });
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"recent" | "helpful" | "highest">(
    "recent"
  );
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterPhotos, setFilterPhotos] = useState(false);
  const [writeOpen, setWriteOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // ==================== FETCH REVIEWS ====================
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("sort", sortBy);
        if (filterRating) params.set("rating", filterRating.toString());
        if (filterPhotos) params.set("withPhotos", "true");

        const res = await fetch(
          `${API_URL}/api/reviews/product/${productId}?${params.toString()}`
        );
        const data = await res.json();
        if (data.success) {
          setReviews(data.data.reviews || []);
          setStats({
            avgRating: data.avgRating || 0,
            total: data.totalReviews || 0,
            breakdown: data.breakdown || [],
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [productId, refreshKey, sortBy, filterRating, filterPhotos]);

  // ==================== HELPERS ====================
  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return d.toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const totalPercent = (count: number) =>
    stats.total > 0 ? (count / stats.total) * 100 : 0;

  return (
    <section className="py-12 md:py-20 px-4 md:px-8 border-t border-ink/10">
      <div className="max-w-[1200px] mx-auto">

        {/* HEADER */}
        <div className="mb-10 md:mb-14">
          <p className="text-[10px] uppercase tracking-widest text-ink/50 font-body mb-3">
            Customer Reviews
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h2 className="font-display text-3xl md:text-5xl mb-3">
                What customers <em className="italic">say.</em>
              </h2>
              {stats.total > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(stats.avgRating)
                            ? "fill-ink text-ink"
                            : "text-ink/20"
                        }`}
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-body text-ink/70">
                    <strong className="text-ink">{stats.avgRating}</strong> / 5
                    · {stats.total}{" "}
                    {stats.total === 1 ? "review" : "reviews"}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setWriteOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-ink text-white text-[10px] tracking-widest uppercase font-body rounded-full hover:bg-ink/80 transition-colors active:scale-[0.98] self-start md:self-auto"
            >
              <MessageSquare className="w-3.5 h-3.5" strokeWidth={2} />
              Write a Review
            </button>
          </div>
        </div>

        {/* STATS + FILTERS */}
        {stats.total > 0 && (
          <div className="mb-8 grid md:grid-cols-3 gap-6 p-6 bg-white rounded-xl border border-ink/10">
            {/* Big avg */}
            <div className="flex md:flex-col items-center md:items-start justify-center md:justify-start gap-3 md:gap-0">
              <div className="text-center md:text-left">
                <p className="font-display text-5xl md:text-6xl leading-none mb-1">
                  {stats.avgRating}
                </p>
                <div className="flex items-center gap-0.5 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.round(stats.avgRating)
                          ? "fill-ink text-ink"
                          : "text-ink/20"
                      }`}
                      strokeWidth={1.5}
                    />
                  ))}
                </div>
                <p className="text-[10px] uppercase tracking-widest text-ink/50 font-body">
                  {stats.total} {stats.total === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>

            {/* Breakdown bars */}
            <div className="md:col-span-2 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const item = stats.breakdown.find(
                  (b: any) => b.rating === rating
                );
                const count = item?.count || 0;
                const percent = totalPercent(count);

                return (
                  <button
                    key={rating}
                    onClick={() => setFilterRating(rating)}
                    className={`w-full flex items-center gap-3 group transition-opacity ${
                      filterRating && filterRating !== rating
                        ? "opacity-40"
                        : "opacity-100"
                    }`}
                  >
                    <span className="text-[11px] font-body text-ink/60 w-6 text-right">
                      {rating}
                    </span>
                    <Star
                      className="w-3 h-3 fill-ink/60 text-ink/60"
                      strokeWidth={1.5}
                    />
                    <div className="flex-1 h-1.5 bg-bone rounded-full overflow-hidden">
                      <div
                        className="h-full bg-ink transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-body text-ink/50 w-8 text-right">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* FILTER CHIPS + SORT */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setFilterRating(null);
                setFilterPhotos(false);
              }}
              className={`px-3 py-1.5 text-[10px] tracking-widest uppercase font-body rounded-full transition-all ${
                !filterRating && !filterPhotos
                  ? "bg-ink text-white"
                  : "bg-bone text-ink/70 hover:bg-bone/70"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterPhotos(!filterPhotos)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] tracking-widest uppercase font-body rounded-full transition-all ${
                filterPhotos
                  ? "bg-ink text-white"
                  : "bg-bone text-ink/70 hover:bg-bone/70"
              }`}
            >
              <Camera className="w-3 h-3" strokeWidth={2} />
              With Photos
            </button>
            {filterRating && (
              <button
                onClick={() => setFilterRating(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-ink text-white text-[10px] tracking-widest uppercase font-body rounded-full"
              >
                {filterRating}★
                <X className="w-3 h-3" strokeWidth={2} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-ink/50 font-body">
              Sort:
            </span>
            {(["recent", "helpful", "highest"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-3 py-1.5 text-[10px] tracking-widest uppercase font-body rounded-full transition-all ${
                  sortBy === s
                    ? "bg-ink text-white"
                    : "bg-bone text-ink/70 hover:bg-bone/70"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* REVIEWS LIST */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2
              className="w-6 h-6 text-ink/40 animate-spin"
              strokeWidth={2}
            />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-ink/10">
            <MessageSquare
              className="w-10 h-10 text-ink/20 mx-auto mb-4"
              strokeWidth={1.5}
            />
            <p className="font-display text-xl mb-2">No reviews yet</p>
            <p className="text-ink/50 font-body text-sm mb-6">
              Be the first to share your thoughts!
            </p>
            <button
              onClick={() => setWriteOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-white text-[10px] tracking-widest uppercase font-body rounded-full hover:bg-ink/80 transition-colors"
            >
              Write a Review
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onPhotoClick={setLightboxImage}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>

      {/* WRITE REVIEW MODAL */}
      {writeOpen && (
        <WriteReviewModal
          productId={productId}
          onClose={() => setWriteOpen(false)}
          onSuccess={() => {
            setWriteOpen(false);
            onRefresh();
          }}
        />
      )}

      {/* LIGHTBOX */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[300] bg-ink/95 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 w-11 h-11 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
          <img
            src={lightboxImage}
            alt="Review"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}

// ==================== REVIEW CARD ====================
function ReviewCard({
  review,
  onPhotoClick,
  formatDate,
}: {
  review: any;
  onPhotoClick: (url: string) => void;
  formatDate: (d: string) => string;
}) {
  const [helpful, setHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
  const [loading, setLoading] = useState(false);

  const handleHelpful = async () => {
    const token = localStorage.getItem("zaem_token");
    if (!token) {
      alert("Please login to mark helpful");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/reviews/${review.id}/helpful`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setHelpful(data.helpful);
        setHelpfulCount((prev) => (data.helpful ? prev + 1 : prev - 1));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 md:p-6 bg-white rounded-xl border border-ink/10 hover:border-ink/20 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Avatar */}
          <div className="w-10 h-10 bg-bone rounded-full flex items-center justify-center shrink-0">
            {review.user?.avatar ? (
              <img
                src={review.user.avatar}
                alt={review.user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="font-display text-base text-ink/60">
                {review.user?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-body text-sm font-medium truncate">
                {review.user?.name || "Anonymous"}
              </p>
              {review.isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-bone text-[9px] uppercase tracking-widest text-ink/70 rounded-full">
                  <Check className="w-2.5 h-2.5" strokeWidth={3} />
                  Verified
                </span>
              )}
            </div>
            <p className="text-[10px] uppercase tracking-widest text-ink/40 font-body mt-0.5">
              {formatDate(review.createdAt)}
            </p>
          </div>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-0.5 shrink-0">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < review.rating ? "fill-ink text-ink" : "text-ink/20"
              }`}
              strokeWidth={1.5}
            />
          ))}
        </div>
      </div>

      {/* Title */}
      {review.title && (
        <p className="font-display text-base md:text-lg mb-2">
          {review.title}
        </p>
      )}

      {/* Comment */}
      <p className="text-ink/70 text-sm font-body leading-relaxed mb-3">
        {review.comment}
      </p>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {review.images.map((img: string, i: number) => (
            <button
              key={i}
              onClick={() => onPhotoClick(img)}
              className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border border-ink/10 hover:border-ink/30 transition-colors"
            >
              <img
                src={img}
                alt={`Review photo ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Admin reply */}
      {review.adminReply && (
        <div className="mt-4 p-4 bg-bone/50 border-l-2 border-ink rounded">
          <p className="text-[10px] uppercase tracking-widest text-ink/60 font-body mb-1.5">
            ZAEM Response
          </p>
          <p className="text-sm text-ink/80 font-body leading-relaxed">
            {review.adminReply}
          </p>
        </div>
      )}

      {/* Helpful button */}
      <div className="mt-4 pt-4 border-t border-ink/5 flex items-center gap-3">
        <button
          onClick={handleHelpful}
          disabled={loading}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-body transition-all ${
            helpful
              ? "bg-ink text-white"
              : "bg-bone text-ink/70 hover:bg-bone/70"
          }`}
        >
          <ThumbsUp
            className={`w-3 h-3 ${helpful ? "fill-current" : ""}`}
            strokeWidth={1.8}
          />
          Helpful {helpfulCount > 0 && `(${helpfulCount})`}
        </button>
      </div>
    </div>
  );
}

// ==================== WRITE REVIEW MODAL ====================
function WriteReviewModal({
  productId,
  onClose,
  onSuccess,
}: {
  productId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > 3) {
      setError("Maximum 3 images allowed");
      setTimeout(() => setError(""), 3000);
      return;
    }

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} is too large (max 5MB)`);
        setTimeout(() => setError(""), 3000);
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError(`${file.name} is not an image`);
        setTimeout(() => setError(""), 3000);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string].slice(0, 3));
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("zaem_token");
    if (!token) {
      setError("Please login first");
      return;
    }

    if (!comment.trim()) {
      setError("Review text is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          rating,
          title: title.trim(),
          comment: comment.trim(),
          images,
        }),
      });
      const data = await res.json();

      if (data.success) {
        onSuccess();
      } else {
        setError(data.message || "Failed to submit");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[250] animate-[fadeIn_0.2s_ease-out]"
      />

      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[251] w-auto md:w-[560px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col animate-[modalIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-ink/10 shrink-0">
          <h3 className="font-display text-xl md:text-2xl">Write a Review</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center hover:bg-bone rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-2 border-red-500 text-xs text-red-700 font-body rounded">
              {error}
            </div>
          )}

          {/* Rating */}
          <div className="mb-6">
            <label className="text-[10px] uppercase tracking-widest text-ink/60 font-body block mb-3">
              Your Rating *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-ink text-ink"
                        : "text-ink/20"
                    }`}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
            <p className="text-[10px] text-ink/50 font-body mt-2">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          {/* Title */}
          <div className="mb-5">
            <label className="text-[10px] uppercase tracking-widest text-ink/60 font-body block mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              maxLength={100}
              className="w-full bg-transparent border border-ink/15 focus:border-ink/40 rounded-lg outline-none px-4 py-3 text-sm font-body transition-colors"
            />
          </div>

          {/* Comment */}
          <div className="mb-5">
            <label className="text-[10px] uppercase tracking-widest text-ink/60 font-body block mb-2">
              Your Review *
            </label>
            <textarea
              required
              rows={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this product..."
              maxLength={1000}
              className="w-full bg-transparent border border-ink/15 focus:border-ink/40 rounded-lg outline-none px-4 py-3 text-sm font-body resize-none transition-colors"
            />
            <p className="text-[10px] text-ink/40 font-body mt-1 text-right">
              {comment.length}/1000
            </p>
          </div>

          {/* Images */}
          <div className="mb-5">
            <label className="text-[10px] uppercase tracking-widest text-ink/60 font-body block mb-2">
              Photos (Optional, Max 3)
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />

            <div className="flex gap-2 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative w-20 h-20">
                  <img
                    src={img}
                    alt={`Upload ${i + 1}`}
                    className="w-full h-full object-cover rounded-lg border border-ink/10"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-ink text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}

              {images.length < 3 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 border-2 border-dashed border-ink/20 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-ink/40 transition-colors"
                >
                  <Camera className="w-4 h-4 text-ink/50" strokeWidth={2} />
                  <span className="text-[9px] uppercase tracking-widest text-ink/50 font-body">
                    Add
                  </span>
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-ink/10 flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-3 border border-ink/20 rounded-lg text-[10px] tracking-widest uppercase font-body hover:bg-bone transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-3 bg-ink text-white rounded-lg text-[10px] tracking-widest uppercase font-body hover:bg-ink/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </button>
        </div>
      </div>
    </>
  );
}