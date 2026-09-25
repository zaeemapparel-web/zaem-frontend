"use client";
import SizeGuideModal from "@/components/SizeGuideModal";
import Link from "next/link";
import { useEffect, useState } from "react";
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
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
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
        setTimeout(() => setCartMessage(""), 3000);
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
        setTimeout(() => setCartMessage(""), 3000);
      }
    } catch (error) {
      console.error("Wishlist toggle error:", error);
      setCartMessage("Wishlist error");
      setTimeout(() => setCartMessage(""), 3000);
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
        setCartMessage("Added to cart!");
        setTimeout(() => setCartMessage(""), 3000);
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
        <div className="max-w-[1800px] mx-auto px-6 md:px-10 lg:px-16 py-20">
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
          <h1 className="display-lg mb-6">Not found.</h1>
          <p className="text-muted mb-8 font-body">This product doesn't exist.</p>
          <Link href="/shop" className="btn-primary">
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

      {/* ============ BREADCRUMB ============ */}
      <section className="pt-8 md:pt-12 px-6 md:px-10 lg:px-16">
        <div className="max-w-[1800px] mx-auto">
          <nav className="flex items-center gap-2 text-label text-muted flex-wrap">
            <Link href="/" className="hover:text-gold transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/shop" className="hover:text-gold transition-colors">
              Shop
            </Link>

            {product.category?.parent && (
              <>
                <ChevronRight className="w-3 h-3" />
                <Link
                  href={`/shop?category=${product.category.parent.slug}`}
                  className="hover:text-gold transition-colors"
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
                  className="hover:text-gold transition-colors"
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

      {/* ============ PRODUCT DETAILS ============ */}
      <section className="py-10 md:py-16 px-6 md:px-10 lg:px-16">
        <div className="max-w-[1800px] mx-auto">

          <div className="grid md:grid-cols-2 gap-10 md:gap-16 lg:gap-24">

            {/* LEFT — IMAGES */}
            <div>
              <div className="relative aspect-[3/4] bg-bone overflow-hidden mb-4">
                {product.images?.[selectedImage] ? (
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-display text-8xl text-ink/10">
                      ZAEM
                    </span>
                  </div>
                )}

                {hasDiscount && (
                  <div className="absolute top-4 left-4 bg-gold text-ivory text-label px-3 py-1.5">
                    -{discountPercent}%
                  </div>
                )}
              </div>

              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3 md:gap-4">
                  {product.images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative aspect-square bg-bone overflow-hidden border-2 transition-all duration-300 ${
                        selectedImage === i
                          ? "border-gold"
                          : "border-transparent"
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
            <div className="md:pt-4">

              {product.category && (
                <div className="flex items-center gap-2 mb-4">
                  {product.category.parent && (
                    <>
                      <Link
                        href={`/shop?category=${product.category.parent.slug}`}
                        className="text-label text-muted hover:text-gold transition-colors"
                      >
                        {product.category.parent.name}
                      </Link>
                      <span className="text-muted text-xs">/</span>
                    </>
                  )}
                  <Link
                    href={`/shop?category=${product.category.slug}`}
                    className="text-label text-gold hover:text-ink transition-colors"
                  >
                    {product.category.name}
                  </Link>
                </div>
              )}

              <h1 className="display-md mb-6">{product.name}</h1>

              {product.reviewCount > 0 && (
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < Math.round(product.avgRating)
                            ? "text-gold"
                            : "text-muted"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-label text-muted">
                    {product.avgRating} ({product.reviewCount} reviews)
                  </span>
                </div>
              )}

              <div className="flex items-baseline gap-4 mb-8">
                <p className="text-2xl md:text-3xl font-display">
                  PKR {product.price.toLocaleString()}
                </p>
                {hasDiscount && (
                  <p className="text-muted text-lg line-through font-body">
                    PKR {product.comparePrice.toLocaleString()}
                  </p>
                )}
              </div>

              <p className="text-muted text-base leading-relaxed font-body mb-10">
                {product.description}
              </p>

              {product.sizes?.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-label text-muted">Size</p>
                    <button
  type="button"
  onClick={() => setSizeGuideOpen(true)}
  className="text-label text-gold hover:text-ink transition-colors"
>
  Size Guide
</button>
                  </div>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {product.sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[56px] h-12 px-4 text-label border transition-all duration-300 ${
                          selectedSize === size
                            ? "border-ink bg-ink text-ivory"
                            : "border-ink/20 hover:border-ink"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.colors?.length > 0 && (
                <div className="mb-8">
                  <p className="text-label text-muted mb-4">Color</p>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color: string) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-5 py-3 text-label border transition-all duration-300 ${
                          selectedColor === color
                            ? "border-ink bg-ink text-ivory"
                            : "border-ink/20 hover:border-ink"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-8">
                <p className="text-label text-muted mb-4">Quantity</p>
                <div className="inline-flex items-center border border-ink/20">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-bone transition-colors"
                  >
                    <Minus className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                  <span className="w-16 text-center font-body">{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock || 10, quantity + 1))
                    }
                    className="w-12 h-12 flex items-center justify-center hover:bg-bone transition-colors"
                  >
                    <Plus className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>

                {product.stock > 0 && product.stock <= 5 && (
                  <p className="text-label text-gold mt-4">
                    Only {product.stock} left in stock
                  </p>
                )}
                {product.stock === 0 && (
                  <p className="text-label text-muted mt-4">Out of stock</p>
                )}
              </div>

              <div className="flex gap-4 mb-10">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.stock === 0}
                  className={`flex-1 h-14 text-label transition-all duration-500 ${
                    product.stock === 0
                      ? "bg-bone text-muted cursor-not-allowed"
                      : "bg-ink text-ivory hover:bg-gold"
                  }`}
                >
                  {addingToCart
                    ? "Adding..."
                    : product.stock === 0
                    ? "Out of Stock"
                    : "Add to Cart"}
                </button>

                <button
                  onClick={toggleWishlist}
                  disabled={wishlistLoading}
                  className={`w-14 h-14 border flex items-center justify-center transition-all duration-500 ${
                    inWishlist
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-ink/20 hover:border-gold hover:text-gold"
                  }`}
                  aria-label="Add to wishlist"
                >
                  <Heart
                    className={`w-5 h-5 transition-all ${
                      inWishlist ? "fill-current" : ""
                    }`}
                    strokeWidth={1.5}
                  />
                </button>
              </div>

              {cartMessage && (
                <div
                  className={`mb-8 p-4 text-label ${
                    cartMessage.includes("Added") ||
                    cartMessage.includes("Removed")
                      ? "bg-gold/10 text-gold"
                      : "bg-ink/5 text-ink"
                  }`}
                >
                  {cartMessage}
                </div>
              )}

              <div className="border-t border-ink/10 pt-8 space-y-4">
                <div className="flex items-center gap-3 text-sm font-body">
                  <Truck className="w-4 h-4 text-gold" strokeWidth={1.5} />
                  <span>Free shipping on orders above Rs. 5,000</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-body">
                  <RotateCcw className="w-4 h-4 text-gold" strokeWidth={1.5} />
                  <span>7-day easy returns</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-body">
                  <Shield className="w-4 h-4 text-gold" strokeWidth={1.5} />
                  <span>Secure payment — COD, JazzCash, Easypaisa</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ============ REVIEWS SECTION ============ */}
      <section className="py-16 md:py-24 px-6 md:px-10 lg:px-16 border-t border-ink/10">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-label text-gold mb-6">Customer Reviews</p>
          <h2 className="display-lg mb-12">
            What our customers{" "}
            <em className="font-display italic">say.</em>
          </h2>

          <div className="grid md:grid-cols-2 gap-12">

            <div>
              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-6">
                  {product.reviews.map((review: any) => (
                    <div
                      key={review.id}
                      className="border-b border-ink/10 pb-6"
                    >
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? "fill-gold text-gold"
                                : "text-muted"
                            }`}
                            strokeWidth={1.5}
                          />
                        ))}
                      </div>
                      {review.title && (
                        <p className="font-display text-base mb-2">
                          {review.title}
                        </p>
                      )}
                      <p className="text-muted text-sm font-body leading-relaxed mb-3">
                        {review.comment}
                      </p>
                      <p className="text-label text-muted">
                        {review.user?.name} ·{" "}
                        {new Date(review.createdAt).toLocaleDateString("en-PK")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted font-body">
                  No reviews yet. Be the first to review this product!
                </p>
              )}
            </div>

            <div>
              <p className="text-label text-muted mb-6">Write a Review</p>
              <ReviewForm
                productId={product.id}
                onSuccess={() => setRefreshReviews((r) => r + 1)}
              />
            </div>

          </div>
        </div>
      </section>

      {/* ============ RELATED PRODUCTS ============ */}
      <RelatedProducts
        categorySlug={product.category?.slug || ""}
        currentProductId={product.id}
      />
     <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </main>
  );
}

{/* ============ REVIEW FORM COMPONENT ============ */}
function ReviewForm({
  productId,
  onSuccess,
}: {
  productId: string;
  onSuccess: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("zaem_token");
    if (!token) {
      setError("Please login first");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, rating, title, comment }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setTitle("");
        setComment("");
        setRating(5);
        onSuccess();
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError(data.message || "Failed to submit");
        setTimeout(() => setError(""), 3000);
      }
    } catch {
      setError("Network error");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {submitted && (
        <div className="p-4 bg-gold/10 border-l-2 border-gold text-sm font-body text-gold">
          ✓ Review submitted! It will appear after approval.
        </div>
      )}
      {error && (
        <div className="p-4 bg-ink/5 border-l-2 border-ink text-sm font-body">
          {error}
        </div>
      )}

      <div>
        <label className="text-label text-muted block mb-3">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-7 h-7 ${
                  star <= rating ? "fill-gold text-gold" : "text-muted"
                }`}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-label text-muted block mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summary of your review"
          className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-2 text-sm font-body"
        />
      </div>

      <div>
        <label className="text-label text-muted block mb-2">Review *</label>
        <textarea
          required
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full bg-transparent border border-ink/20 focus:border-gold outline-none p-3 text-sm font-body resize-none"
        />
      </div>

      <button type="submit" className="btn-primary">
        Submit Review
      </button>
    </form>
  );
}

{/* ============ RELATED PRODUCTS COMPONENT ============ */}
function RelatedProducts({
  categorySlug,
  currentProductId,
}: {
  categorySlug: string;
  currentProductId: string;
}) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      if (!categorySlug) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `${API_URL}/api/products?category=${categorySlug}&limit=5`
        );
        const data = await res.json();
        if (data.success) {
          const filtered = data.data.products
            .filter((p: any) => p.id !== currentProductId)
            .slice(0, 4);
          setProducts(filtered);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRelated();
  }, [categorySlug, currentProductId]);

  if (loading) {
    return (
      <section className="py-16 md:py-24 px-6 md:px-10 lg:px-16 border-t border-ink/10 bg-bone/20">
        <div className="max-w-[1800px] mx-auto">
          <div className="mb-12">
            <p className="text-label text-gold mb-4">You May Also Like</p>
            <h2 className="display-lg">
              Related <em className="font-display italic">pieces.</em>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-bone mb-4" />
                <div className="h-3 bg-bone mb-2 w-1/3" />
                <div className="h-4 bg-bone w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-16 md:py-24 px-6 md:px-10 lg:px-16 border-t border-ink/10 bg-bone/20">
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-12 md:mb-16">
          <p className="text-label text-gold mb-4">You May Also Like</p>
          <h2 className="display-lg">
            Related <em className="font-display italic">pieces.</em>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              className="group block"
            >
              <div className="relative aspect-[3/4] bg-bone overflow-hidden mb-4 md:mb-5 img-zoom">
                {p.images && p.images[0] ? (
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-display text-5xl text-ink/10">
                      ZAEM
                    </span>
                  </div>
                )}

                {p.comparePrice && p.comparePrice > p.price && (
                  <div className="absolute top-4 left-4 bg-gold text-ivory text-[9px] tracking-[0.3em] uppercase font-medium px-3 py-1.5">
                    Sale
                  </div>
                )}
              </div>

              <div>
                <p className="text-label text-gold mb-2">
                  {p.category?.name || "ZAEM"}
                </p>
                <h3 className="font-display text-base md:text-xl mb-2 group-hover:text-gold transition-colors duration-500">
                  {p.name}
                </h3>
                <div className="flex items-center gap-3">
                  <p className="text-ink text-sm font-body">
                    PKR {p.price.toLocaleString()}
                  </p>
                  {p.comparePrice && p.comparePrice > p.price && (
                    <p className="text-muted text-xs line-through font-body">
                      PKR {p.comparePrice.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}