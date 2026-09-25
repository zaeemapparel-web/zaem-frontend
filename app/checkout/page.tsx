"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  MapPin,
  CreditCard,
  Truck,
  Check,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state?: string | null;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  size?: string | null;
  color?: string | null;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number | null;
    images: string[];
  };
}

const PAYMENT_METHODS = [
  {
    id: "COD",
    label: "Cash on Delivery",
    desc: "Pay when you receive",
  },
  {
    id: "JAZZCASH",
    label: "JazzCash",
    desc: "Pay via JazzCash mobile wallet",
  },
  {
    id: "EASYPAISA",
    label: "Easypaisa",
    desc: "Pay via Easypaisa mobile wallet",
  },
  {
    id: "CARD",
    label: "Credit / Debit Card",
    desc: "Visa, Mastercard accepted",
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { token, isAuthenticated, loadFromStorage } = useAuthStore();
  const { items, subtotal, setCart } = useCartStore();

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  // New address form
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Pakistan",
    isDefault: false,
  });

  // Payment
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // Promo
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState("");

  // Notes
  const [notes, setNotes] = useState("");

  // Load auth
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Fetch addresses + cart
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !token) {
        setLoading(false);
        return;
      }

      try {
        // Fetch addresses
        const addrRes = await fetch(`${API_URL}/api/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const addrData = await addrRes.json();
        if (addrData.success) {
          setAddresses(addrData.data.addresses);
          const defaultAddr = addrData.data.addresses.find(
            (a: Address) => a.isDefault
          );
          if (defaultAddr) setSelectedAddressId(defaultAddr.id);
          else if (addrData.data.addresses[0])
            setSelectedAddressId(addrData.data.addresses[0].id);
          else setShowNewAddress(true);
        }

        // Fetch cart
        const cartRes = await fetch(`${API_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const cartData = await cartRes.json();
        if (cartData.success) {
          setCart(
            cartData.data.cart.items,
            cartData.data.cart.itemCount,
            cartData.data.cart.subtotal
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, token, setCart]);

  // Calculate totals
  const discount =
    appliedPromo === "ZAEM10"
      ? subtotal * 0.1
      : appliedPromo === "ZAEM20"
      ? subtotal * 0.2
      : 0;
  const shipping = subtotal >= 5000 ? 0 : 250;
  const total = subtotal - discount + shipping;

  // Apply promo
  const applyPromo = () => {
    const code = promoCode.toUpperCase().trim();
    if (code === "ZAEM10" || code === "ZAEM20") {
      setAppliedPromo(code);
      setPromoCode("");
      setError("");
    } else {
      setError("Invalid promo code");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Add new address
  const handleAddAddress = async () => {
    if (!token) return;

    if (
      !newAddress.fullName ||
      !newAddress.phone ||
      !newAddress.street ||
      !newAddress.city ||
      !newAddress.postalCode
    ) {
      setError("Please fill all required fields");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAddress),
      });
      const data = await res.json();
      if (data.success) {
        setAddresses([data.data.address, ...addresses]);
        setSelectedAddressId(data.data.address.id);
        setShowNewAddress(false);
        setNewAddress({
          fullName: "",
          phone: "",
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "Pakistan",
          isDefault: false,
        });
      } else {
        setError(data.message || "Failed to add address");
        setTimeout(() => setError(""), 3000);
      }
    } catch (error) {
      setError("Failed to add address");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Place order
  const handlePlaceOrder = async () => {
    if (!token || !selectedAddressId) {
      setError("Please select an address");
      return;
    }

    setPlacingOrder(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          addressId: selectedAddressId,
          paymentMethod,
          promoCode: appliedPromo || null,
          notes: notes || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Redirect to order success
        router.push(`/order-success/${data.data.order.id}`);
      } else {
        setError(data.message || "Failed to place order");
        setTimeout(() => setError(""), 5000);
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  // Not logged in
  if (!isAuthenticated && !loading) {
    return (
      <main className="bg-ivory text-ink min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="display-md mb-4">Login Required</h1>
          <p className="text-muted font-body mb-10">
            Please login to continue checkout.
          </p>
          <Link href="/account/login" className="btn-primary">
            Login
          </Link>
        </div>
      </main>
    );
  }

  // Empty cart
  if (!loading && items.length === 0) {
    return (
      <main className="bg-ivory text-ink min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="display-md mb-4">Cart is Empty</h1>
          <p className="text-muted font-body mb-10">
            Add items to your cart before checkout.
          </p>
          <Link href="/shop" className="btn-primary">
            Shop the Collection
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-ivory text-ink min-h-screen">

      {/* ============ HEADER ============ */}
      <section className="pt-16 md:pt-24 pb-8 md:pb-12 px-6 md:px-10 lg:px-16 border-b border-ink/10">
        <div className="max-w-[1800px] mx-auto">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-label text-muted mb-6">
            <Link href="/cart" className="hover:text-gold transition-colors">
              Cart
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-ink">Checkout</span>
          </nav>

          <p className="text-label text-gold mb-4">Final Step</p>
          <h1 className="display-lg">Checkout</h1>
        </div>
      </section>

      {/* ============ CONTENT ============ */}
      <section className="py-10 md:py-16 px-6 md:px-10 lg:px-16">
        <div className="max-w-[1800px] mx-auto">

          {loading ? (
            <div className="text-center py-20">
              <p className="font-display text-2xl text-muted">Loading...</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">

              {/* ============ LEFT — FORM ============ */}
              <div className="lg:col-span-7 space-y-10">

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-ink/5 border-l-2 border-gold text-sm font-body">
                    {error}
                  </div>
                )}

                {/* ====== 1. SHIPPING ADDRESS ====== */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-ink text-ivory flex items-center justify-center text-label">
                      1
                    </div>
                    <h2 className="font-display text-2xl">Shipping Address</h2>
                  </div>

                  {/* Saved Addresses */}
                  {!showNewAddress && addresses.length > 0 && (
                    <div className="space-y-3 mb-6">
                      {addresses.map((addr) => (
                        <button
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`w-full text-left p-5 border transition-all duration-300 ${
                            selectedAddressId === addr.id
                              ? "border-gold bg-gold/5"
                              : "border-ink/20 hover:border-ink"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                                selectedAddressId === addr.id
                                  ? "border-gold bg-gold"
                                  : "border-ink/30"
                              }`}
                            >
                              {selectedAddressId === addr.id && (
                                <Check className="w-3 h-3 text-ivory" strokeWidth={3} />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <p className="font-display text-lg">
                                  {addr.fullName}
                                </p>
                                {addr.isDefault && (
                                  <span className="text-label text-gold">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted font-body mb-1">
                                {addr.phone}
                              </p>
                              <p className="text-sm text-muted font-body">
                                {addr.street}, {addr.city},{" "}
                                {addr.state && `${addr.state}, `}
                                {addr.postalCode}, {addr.country}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}

                      <button
                        onClick={() => setShowNewAddress(true)}
                        className="flex items-center gap-3 text-label text-gold hover:text-ink transition-colors pt-2"
                      >
                        <Plus className="w-4 h-4" strokeWidth={1.5} />
                        Add New Address
                      </button>
                    </div>
                  )}

                  {/* New Address Form */}
                  {(showNewAddress || addresses.length === 0) && (
                    <div className="space-y-5">
                      <div className="grid md:grid-cols-2 gap-5">
                        <div>
                          <label className="text-label text-muted block mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={newAddress.fullName}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                fullName: e.target.value,
                              })
                            }
                            className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-2 text-base font-body transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-label text-muted block mb-2">
                            Phone *
                          </label>
                          <input
                            type="tel"
                            value={newAddress.phone}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                phone: e.target.value,
                              })
                            }
                            className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-2 text-base font-body transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-label text-muted block mb-2">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          value={newAddress.street}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              street: e.target.value,
                            })
                          }
                          className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-2 text-base font-body transition-colors"
                        />
                      </div>

                      <div className="grid md:grid-cols-3 gap-5">
                        <div>
                          <label className="text-label text-muted block mb-2">
                            City *
                          </label>
                          <input
                            type="text"
                            value={newAddress.city}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                city: e.target.value,
                              })
                            }
                            className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-2 text-base font-body transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-label text-muted block mb-2">
                            State
                          </label>
                          <input
                            type="text"
                            value={newAddress.state}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                state: e.target.value,
                              })
                            }
                            className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-2 text-base font-body transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-label text-muted block mb-2">
                            Postal Code *
                          </label>
                          <input
                            type="text"
                            value={newAddress.postalCode}
                            onChange={(e) =>
                              setNewAddress({
                                ...newAddress,
                                postalCode: e.target.value,
                              })
                            }
                            className="w-full bg-transparent border-b border-ink/20 focus:border-gold outline-none py-2 text-base font-body transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button
                          onClick={handleAddAddress}
                          className="btn-primary"
                        >
                          Save Address
                        </button>
                        {addresses.length > 0 && (
                          <button
                            onClick={() => setShowNewAddress(false)}
                            className="btn-outline"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* ====== 2. PAYMENT METHOD ====== */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-ink text-ivory flex items-center justify-center text-label">
                      2
                    </div>
                    <h2 className="font-display text-2xl">Payment Method</h2>
                  </div>

                  <div className="space-y-3">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`w-full text-left p-5 border transition-all duration-300 flex items-center gap-4 ${
                          paymentMethod === method.id
                            ? "border-gold bg-gold/5"
                            : "border-ink/20 hover:border-ink"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            paymentMethod === method.id
                              ? "border-gold bg-gold"
                              : "border-ink/30"
                          }`}
                        >
                          {paymentMethod === method.id && (
                            <Check className="w-3 h-3 text-ivory" strokeWidth={3} />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-body font-medium">{method.label}</p>
                          <p className="text-sm text-muted font-body">
                            {method.desc}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ====== 3. NOTES ====== */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-ink text-ivory flex items-center justify-center text-label">
                      3
                    </div>
                    <h2 className="font-display text-2xl">
                      Order Notes (Optional)
                    </h2>
                  </div>

                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special instructions for your order..."
                    rows={3}
                    className="w-full bg-transparent border border-ink/20 focus:border-gold outline-none p-4 text-sm font-body transition-colors resize-none"
                  />
                </div>

              </div>

              {/* ============ RIGHT — ORDER SUMMARY ============ */}
              <div className="lg:col-span-5">
                <div className="bg-bone/50 p-6 md:p-8 lg:sticky lg:top-28">

                  <h2 className="font-display text-2xl mb-8">Order Summary</h2>

                  {/* Items */}
                  <div className="space-y-5 mb-8 max-h-80 overflow-y-auto pr-2">
                    {items.map((item: CartItem) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-16 h-20 bg-ivory shrink-0 overflow-hidden">
                          {item.product.images?.[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="font-display text-xl text-ink/10">
                                Z
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-display text-sm leading-tight mb-1">
                            {item.product.name}
                          </p>
                          {(item.size || item.color) && (
                            <p className="text-label text-muted mb-1">
                              {item.size}
                              {item.size && item.color && " · "}
                              {item.color}
                            </p>
                          )}
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-muted font-body">
                              Qty: {item.quantity}
                            </p>
                            <p className="text-sm font-body">
                              PKR{" "}
                              {(item.product.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Promo Code */}
                  <div className="mb-6 pb-6 border-b border-ink/10">
                    <p className="text-label text-muted mb-3">Promo Code</p>
                    {appliedPromo ? (
                      <div className="flex items-center justify-between bg-gold/10 border border-gold px-4 py-3">
                        <span className="text-label text-gold">
                          {appliedPromo} applied
                        </span>
                        <button
                          onClick={() => setAppliedPromo("")}
                          className="text-label text-gold hover:text-ink"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex border border-ink/20">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="ZAEM10 or ZAEM20"
                          className="flex-1 bg-transparent px-4 py-3 text-sm font-body outline-none placeholder:text-muted/50"
                        />
                        <button
                          onClick={applyPromo}
                          className="px-5 text-label hover:text-gold transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Summary Rows */}
                  <div className="space-y-4 pb-6 border-b border-ink/10">
                    <div className="flex justify-between text-sm font-body">
                      <span className="text-muted">Subtotal</span>
                      <span>PKR {subtotal.toLocaleString()}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-sm font-body text-gold">
                        <span>Discount</span>
                        <span>− PKR {discount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm font-body">
                      <span className="text-muted">Shipping</span>
                      <span>
                        {shipping === 0
                          ? "Free"
                          : `PKR ${shipping.toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-baseline py-6">
                    <span className="font-display text-lg">Total</span>
                    <span className="font-display text-2xl">
                      PKR {total.toLocaleString()}
                    </span>
                  </div>

                  {/* Place Order Button */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placingOrder || !selectedAddressId}
                    className={`w-full h-14 text-label transition-all duration-500 ${
                      placingOrder || !selectedAddressId
                        ? "bg-bone text-muted cursor-not-allowed"
                        : "bg-ink text-ivory hover:bg-gold"
                    }`}
                  >
                    {placingOrder
                      ? "Placing Order..."
                      : "Place Order"}
                  </button>

                  {/* Trust */}
                  <div className="mt-6 pt-6 border-t border-ink/10 space-y-3 text-muted text-xs font-body">
                    <p className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-gold" strokeWidth={1.5} />
                      Free shipping above Rs. 5,000
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gold" strokeWidth={1.5} />
                      Delivering across Pakistan
                    </p>
                    <p className="flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-gold" strokeWidth={1.5} />
                      Secure payment
                    </p>
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>
      </section>

    </main>
  );
}