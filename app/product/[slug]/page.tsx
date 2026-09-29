"use client";
import SizeGuideModal from "@/components/SizeGuideModal";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Heart, Truck, RotateCcw, Shield, Minus, Plus, ChevronRight, Star,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
        // Refresh cart and open drawer
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
        <div className="max-w-[1800px] mx-auto px-6 md:px-10 lg:px-16 py-20">
          <div className="animate-pulse grid md:grid-cols-2 gap-10">
            <div className="aspect-[4/5] bg-bone" />
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
      <section className="pt-6 md:pt-8 px-4 md:px-10 lg:px-16">
        <div className="max-w-[1400px] mx-auto">
          <nav className="flex items-center gap-2 text-label text-ink/60 flex-wrap">
            <Link href="/" className="hover:text-ink transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/shop" className="hover:text-ink transition-colors">
              Shop
            </Link>

            {product.category?.parent && (
              <>
                <ChevronRight className="w-3 h-3" />
                <Link
                  href={`/shop?category=${product.category.parent.slug}`}
                  className="hover:text-ink transition-colors"
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
                  className="hover:text-ink transition-colors"
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
      <section className="py-6 md:py-10 px-4 md:px-10 lg:px-16">
        <div className="max-w-[1400px] mx-auto">

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">

            {/* LEFT — IMAGES (COMPACT) */}
            <div>
              <div className="relative aspect-[4/5] md:aspect-[3/4] max-h-[420px] md:max-h-[550px] bg-bone overflow-hidden mb-3">
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
                  <div className="absolute top-3 left-3 bg-ink text-ivory text-label px-3 py-1.5">
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
                      className={`relative aspect-square bg-bone overflow-hidden border-2 transition-all duration-300 ${
                        selectedImage === i
                          ? "border-ink"
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
            <div className="md:pt-2">

              {product.category && (
                <div className="flex items-center gap-2 mb-3">
                  {product.category.parent && (
                    <>
                      <Link
                        href={`/shop?category=${product.category.parent.slug}`}
                        className="text-label text-ink/60 hover:text-ink transition-colors"
                      >
                        {product.category.parent.name}
                      </Link>
                      <span className="text-ink/60 text-xs">/</span>
                    </>
                  )}
                  <Link
                    href={`/shop?category=${product.category.slug}`}
                    className="text-label text-ink hover:text-ink transition-colors"
                  >
                    {product.category.name}
                  </Link>
                </div>
              )}

              <h1 className="display-md mb-4">{product.name}</h1>

              {product.reviewCount > 0 && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < Math.round(product.avgRating)
                            ? "text-ink"
                            : "text-ink/30"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-label text-ink/60">
                    {product.avgRating} ({product.reviewCount} reviews)
                  </span>
                </div>
              )}

              <div className="flex items-baseline gap-4 mb-6">
                <p className="text-2xl md:text-3xl font-display text-ink">
                  PKR {product.price.toLocaleString()}
                </p>
                {hasDiscount && (
                  <p className="text-ink/50 text-lg line-through font-body">
                    PKR {product.comparePrice.toLocaleString()}
                  </p>
                )}
              </div>

              <p className="text-ink/70 text-sm md:text-base leading-relaxed font-body mb-6">
                {product.description}
              </p>

              {product.sizes?.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-label text-ink">Size</p>
                    <button
                      type="button"
                      onClick={() => setSizeGuideOpen(true)}
                      className="text-label text-ink underline hover:text-ink transition-colors"
                    >
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {product.sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[56px] h-11 px-4 text-label border transition-all duration-300 ${
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
                <div className="mb-6">
                  <p className="text-label text-ink mb-3">Color</p>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color: string) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-5 py-2.5 text-label border transition-all duration-300 ${
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

              <div className="mb-6">
                <p className="text-label text-ink mb-3">Quantity</p>
                <div className="inline-flex items-center border border-ink/20">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-11 h-11 flex items-center justify-center hover:bg-bone transition-colors"
                  >
                    <Minus className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                  <span className="w-16 text-center font-body">{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock || 10, quantity + 1))
                    }
                    className="w-11 h-11 flex items-center justify-center hover:bg-bone transition-colors"
                  >
                    <Plus className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>

                {product.stock > 0 && product.stock <= 5 && (
                  <p className="text-label text-ink mt-3">
                    Only {product.stock} left in stock
                  </p>
                )}
                {product.stock === 0 && (
                  <p className="text-label text-ink/60 mt-3">Out of stock</p>
                )}
              </div>

              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.stock === 0}
                  className={`flex-1 h-13 py-4 text-label transition-all duration-500 ${
                    product.stock === 0
                      ? "bg-bone text-ink/40 cursor-not-allowed"
                      : "bg-ink text-ivory hover:bg-ink/80"
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
                  className={`w-13 h-13 p-3.5 border flex items-center justify-center transition-all duration-500 ${
                    inWishlist
                      ? "border-ink bg-ink/10 text-ink"
                      : "border-ink/20 hover:border-ink hover:text-ink"
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
                  className={`mb-6 p-3 text-label ${
                    cartMessage.includes("Added") ||
                    cartMessage.includes("Removed")
                      ? "bg-ink/5 text-ink"
                      : "bg-ink/5 text-ink"
                  }`}
                >
                  {cartMessage}
                </div>
              )}

              <div className="border-t border-ink/10 pt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm font-body text-ink">
                  <Truck className="w-4 h-4 text-ink" strokeWidth={1.5} />
                  <span>Free shipping on orders above Rs. 5,000</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-body text-ink">
                  <RotateCcw className="w-4 h-4 text-ink" strokeWidth={1.5} />
                  <span>7-day easy returns</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-body text-ink">
                  <Shield className="w-4 h-4 text-ink" strokeWidth={1.5} />
                  <span>Secure payment — COD, JazzCash, Easypaisa</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ============ REVIEWS SECTION ============ */}
      <section className="py-12 md:py-16 px-4 md:px-10 lg:px-16 border-t border-ink/10">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-label text-ink mb-4">Customer Reviews</p>
          <h2 className="display-lg mb-10">
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
                                ? "fill-ink text-ink"
                                : "text-ink/30"
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
                      <p className="text-ink/70 text-sm font-body leading-relaxed mb-3">
                        {review.comment}
                      </p>
                      <p className="text-label text-ink/60">
                        {review.user?.name} ·{" "}
                        {new Date(review.createdAt).toLocaleDateString("en-PK")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-ink/60 font-body">
                  No reviews yet. Be the first to review this product!
                </p>
              )}
            </div>

            <div>
              <p className="text-label text-ink/60 mb-4">Write a Review</p>
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
        <div className="p-4 bg-ink/5 border-l-2 border-ink text-sm font-body text-ink">
          ✓ Review submitted! It will appear after approval.
        </div>
      )}
      {error && (
        <div className="p-4 bg-ink/5 border-l-2 border-ink text-sm font-body">
          {error}
        </div>
      )}

      <div>
        <label className="text-label text-ink/60 block mb-3">Rating</label>
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
                  star <= rating ? "fill-ink text-ink" : "text-ink/30"
                }`}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-label text-ink/60 block mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summary of your review"
          className="w-full bg-transparent border-b border-ink/20 focus:border-ink outline-none py-2 text-sm font-body"
        />
      </div>

      <div>
        <label className="text-label text-ink/60 block mb-2">Review *</label>
        <textarea
          required
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts..."
          className="w-full bg-transparent border border-ink/20 focus:border-ink outline-none p-3 text-sm font-body resize-none"
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
            <p className="text-label text-ink mb-4">You May Also Like</p>
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
          <p className="text-label text-ink mb-4">You May Also Like</p>
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
                  <div className="absolute top-4 left-4 bg-ink text-ivory text-[9px] tracking-[0.3em] uppercase font-medium px-3 py-1.5">
                    Sale
                  </div>
                )}
              </div>

              <div>
                <p className="text-label text-ink mb-2">
                  {p.category?.name || "ZAEM"}
                </p>
                <h3 className="font-display text-base md:text-xl mb-2 group-hover:text-ink transition-colors duration-500">
                  {p.name}
                </h3>
                <div className="flex items-center gap-3">
                  <p className="text-ink text-sm font-body">
                    PKR {p.price.toLocaleString()}
                  </p>
                  {p.comparePrice && p.comparePrice > p.price && (
                    <p className="text-ink/60 text-xs line-through font-body">
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