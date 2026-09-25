"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Minus, Plus, Heart, ShoppingBag } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface QuickViewModalProps {
  productId: string | null;
  onClose: () => void;
}

export default function QuickViewModal({ productId, onClose }: QuickViewModalProps) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setSelectedImage(0);
    setQuantity(1);
    setMessage("");

    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/id/${productId}`);
        if (!res.ok) {
          const allRes = await fetch(`${API_URL}/api/products?limit=200`);
          const allData = await allRes.json();
          if (allData.success) {
            const p = allData.data.products.find((x: any) => x.id === productId);
            if (p) {
              setProduct(p);
              if (p.sizes?.length > 0) setSelectedSize(p.sizes[0]);
              if (p.colors?.length > 0) setSelectedColor(p.colors[0]);
            }
          }
        } else {
          const data = await res.json();
          if (data.success) {
            setProduct(data.data.product);
            if (data.data.product.sizes?.length > 0) setSelectedSize(data.data.product.sizes[0]);
            if (data.data.product.colors?.length > 0) setSelectedColor(data.data.product.colors[0]);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (productId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [productId]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem("zaem_token");
    if (!token) {
      setMessage("Please login first");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setAdding(true);
    try {
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
        setMessage("Added to cart!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.message || "Failed");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch {
      setMessage("Network error");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setAdding(false);
    }
  };

  if (!productId) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-ink/70 backdrop-blur-md" onClick={onClose} />

      <div className="relative bg-ivory max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-[fadeIn_0.4s_ease-out]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-ivory border border-ink/10 hover:bg-ink hover:text-ivory transition-all duration-500"
          aria-label="Close"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>

        {loading ? (
          <div className="p-8 md:p-12 grid md:grid-cols-2 gap-8 animate-pulse">
            <div className="aspect-[3/4] bg-bone" />
            <div className="space-y-4">
              <div className="h-4 bg-bone w-1/3" />
              <div className="h-10 bg-bone w-3/4" />
              <div className="h-6 bg-bone w-1/4" />
              <div className="h-20 bg-bone" />
            </div>
          </div>
        ) : product ? (
          <div className="grid md:grid-cols-2">

            {/* LEFT — Images */}
            <div className="bg-bone">
              <div className="aspect-[3/4] bg-bone overflow-hidden">
                {product.images?.[selectedImage] ? (
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-display text-6xl text-ink/10">ZAEM</span>
                  </div>
                )}
              </div>

              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-4">
                  {product.images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`aspect-square bg-ivory overflow-hidden border-2 transition-all ${
                        selectedImage === i ? "border-gold" : "border-transparent"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT — Info */}
            <div className="p-6 md:p-10 flex flex-col">

              {product.category && (
                <p className="text-label text-gold mb-4">{product.category.name}</p>
              )}

              <h2 className="font-display text-2xl md:text-4xl mb-6">{product.name}</h2>

              <div className="flex items-baseline gap-4 mb-6">
                <p className="font-display text-2xl md:text-3xl">
                  PKR {product.price.toLocaleString()}
                </p>
                {product.comparePrice && product.comparePrice > product.price && (
                  <p className="text-muted text-base line-through font-body">
                    PKR {product.comparePrice.toLocaleString()}
                  </p>
                )}
              </div>

              <p className="text-muted text-sm md:text-base leading-relaxed font-body mb-8 line-clamp-3">
                {product.description}
              </p>

              {/* Size */}
              {product.sizes?.length > 0 && (
                <div className="mb-6">
                  <p className="text-label text-muted mb-3">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[48px] h-10 px-3 text-label border transition-all ${
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

              {/* Color */}
              {product.colors?.length > 0 && (
                <div className="mb-6">
                  <p className="text-label text-muted mb-3">Color</p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color: string) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 text-label border transition-all ${
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

              {/* Quantity + Add */}
              <div className="flex gap-4 mb-6 mt-auto">
                <div className="inline-flex items-center border border-ink/20">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-12 flex items-center justify-center hover:bg-bone"
                  >
                    <Minus className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                  <span className="w-12 text-center font-body">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                    className="w-10 h-12 flex items-center justify-center hover:bg-bone"
                  >
                    <Plus className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="flex-1 h-12 bg-ink text-ivory text-label hover:bg-gold transition-colors disabled:opacity-50"
                >
                  {adding ? "Adding..." : "Add to Cart"}
                </button>
              </div>

              {message && (
                <div className={`p-3 text-label mb-4 ${message.includes("Added") ? "bg-gold/10 text-gold" : "bg-ink/5 text-ink"}`}>
                  {message}
                </div>
              )}

              <Link
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="text-label text-gold hover:text-ink transition-colors text-center"
              >
                View Full Details →
              </Link>

            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-muted font-body">Product not found.</p>
          </div>
        )}
      </div>
    </div>
  );
}