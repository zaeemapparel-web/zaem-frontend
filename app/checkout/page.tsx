"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  MapPin,
  CreditCard,
  Truck,
  Check,
  Plus,
  Loader2,
  AlertCircle,
  X,
  Home,
  User as UserIcon,
  Phone,
  Building2,
  Hash,
  Globe,
  CheckCircle,
  Package,
  Shield,
  Tag,
  ArrowRight,
  ShoppingBag,
  RotateCcw,
  Lock,
  Star,
  Wallet,
  Banknote,
  Building,
  Info,
  Eye,
  Pencil,
  Sparkles,
  Gift,
  TrendingUp,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ==================== TYPES ====================
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
    stock?: number;
    category?: {
      id: string;
      name: string;
      slug: string;
    } | null;
  };
}

// ==================== CONSTANTS ====================
const FREE_SHIPPING_THRESHOLD = 5000;
const SHIPPING_COST = 250;

const PROMO_CODES: Record<string, number> = {
  ZAEM10: 0.1,
  ZAEM20: 0.2,
  WELCOME10: 0.1,
  FESTIVE15: 0.15,
};

const PAYMENT_METHODS = [
  {
    id: "COD",
    label: "Cash on Delivery",
    desc: "Pay when you receive your order",
    icon: Banknote,
    color: "text-[#2E7D32]",
    bg: "bg-[#E8F5E9]",
    badge: "Popular",
  },
  {
    id: "JAZZCASH",
    label: "JazzCash",
    desc: "Pay via JazzCash mobile wallet",
    icon: Wallet,
    color: "text-[#E65100]",
    bg: "bg-[#FFF3E0]",
    badge: null,
  },
  {
    id: "EASYPAISA",
    label: "Easypaisa",
    desc: "Pay via Easypaisa mobile wallet",
    icon: Wallet,
    color: "text-[#2E7D32]",
    bg: "bg-[#E8F5E9]",
    badge: null,
  },
  {
    id: "CARD",
    label: "Credit / Debit Card",
    desc: "Visa, Mastercard accepted",
    icon: CreditCard,
    color: "text-[#0A84FF]",
    bg: "bg-[#E3F2FD]",
    badge: null,
  },
];

const PK_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
];

// ==================== VALIDATION ====================
const validatePhone = (phone: string) => {
  const cleaned = phone.replace(/\D/g, "");
  return /^(92|0)?3\d{9}$/.test(cleaned);
};

// ==================== MAIN COMPONENT ====================
export default function CheckoutPage() {
  const router = useRouter();
  const { token, isAuthenticated, loadFromStorage } = useAuthStore();
  const { items, subtotal, setCart } = useCartStore();

  // ==================== STATE ====================
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // New address
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
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [savingAddress, setSavingAddress] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // Promo
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState("");
  const [promoError, setPromoError] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);

  // Notes
  const [notes, setNotes] = useState("");

  // Terms
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Order summary expanded (mobile)
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  // ==================== INIT ====================
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // ==================== FETCH DATA ====================
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !token) {
        setLoading(false);
        return;
      }

      try {
        const [addrRes, cartRes] = await Promise.all([
          fetch(`${API_URL}/api/addresses`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/cart`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const [addrData, cartData] = await Promise.all([
          addrRes.json(),
          cartRes.json(),
        ]);

        if (addrData.success) {
          const addrs = addrData.data.addresses || [];
          setAddresses(addrs);

          const defaultAddr =
            addrs.find((a: Address) => a.isDefault) || addrs[0];
          if (defaultAddr) setSelectedAddressId(defaultAddr.id);
          else setShowNewAddress(true);
        }

        if (cartData.success) {
          setCart(
            cartData.data.cart.items,
            cartData.data.cart.itemCount,
            cartData.data.cart.subtotal
          );
        }
      } catch (err) {
        console.error(err);
        showToast("error", "Failed to load checkout data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, token, setCart]);

  // ==================== TOAST ====================
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // ==================== CALCULATIONS ====================
  const discount = useMemo(() => {
    if (!appliedPromo) return 0;
    return subtotal * (PROMO_CODES[appliedPromo] || 0);
  }, [appliedPromo, subtotal]);

  const shipping = useMemo(
    () => (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST),
    [subtotal]
  );

  const total = useMemo(
    () => subtotal - discount + shipping,
    [subtotal, discount, shipping]
  );

  const totalSavings = useMemo(() => {
    return items.reduce((sum, item) => {
      const compare = item.product.comparePrice;
      if (compare && compare > item.product.price) {
        return sum + (compare - item.product.price) * item.quantity;
      }
      return sum;
    }, 0);
  }, [items]);

  // ==================== PROMO ====================
  const applyPromo = () => {
    setPromoError("");
    setApplyingPromo(true);
    const code = promoCode.toUpperCase().trim();

    setTimeout(() => {
      if (PROMO_CODES[code]) {
        setAppliedPromo(code);
        setPromoCode("");
        showToast("success", `Promo ${code} applied!`);
      } else {
        setPromoError("Invalid promo code");
        setTimeout(() => setPromoError(""), 3000);
      }
      setApplyingPromo(false);
    }, 400);
  };

  // ==================== VALIDATE ADDRESS ====================
  const validateAddress = () => {
    const errors: Record<string, string> = {};
    if (!newAddress.fullName.trim() || newAddress.fullName.trim().length < 2)
      errors.fullName = "Full name is required";
    if (!newAddress.phone.trim()) errors.phone = "Phone is required";
    else if (!validatePhone(newAddress.phone))
      errors.phone = "Invalid Pakistani phone number";
    if (!newAddress.street.trim() || newAddress.street.trim().length < 5)
      errors.street = "Street address is required";
    if (!newAddress.city.trim()) errors.city = "City is required";
    if (!newAddress.postalCode.trim()) errors.postalCode = "Postal code required";
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ==================== ADD ADDRESS ====================
  const handleAddAddress = async () => {
    if (!token || !validateAddress()) return;

    setSavingAddress(true);
    try {
      const res = await fetch(`${API_URL}/api/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newAddress,
          fullName: newAddress.fullName.trim(),
          phone: newAddress.phone.trim(),
          street: newAddress.street.trim(),
          city: newAddress.city.trim(),
          state: newAddress.state.trim() || null,
          postalCode: newAddress.postalCode.trim(),
        }),
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
        setAddressErrors({});
        showToast("success", "Address added");
      } else {
        showToast("error", data.message || "Failed to add address");
      }
    } catch (err) {
      showToast("error", "Network error");
    } finally {
      setSavingAddress(false);
    }
  };

  // ==================== PLACE ORDER ====================
  const handlePlaceOrder = async () => {
    if (!token) return;

    if (!selectedAddressId) {
      showToast("error", "Please select a shipping address");
      return;
    }

    if (!agreedToTerms) {
      showToast("error", "Please accept terms and conditions");
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
          notes: notes.trim() || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/order-success/${data.data.order.id}`);
      } else {
        showToast("error", data.message || "Failed to place order");
        setPlacingOrder(false);
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Network error. Please try again.");
      setPlacingOrder(false);
    }
  };

  // ==================== NOT AUTH ====================
  if (!isAuthenticated && !loading) {
    return (
      <main className="bg-[#FAFAFA] dark:bg-black min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-[#86868B]" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-3xl text-[#1D1D1F] dark:text-white mb-3">
            Login Required
          </h1>
          <p className="text-[13px] text-[#6E6E73] dark:text-[#98989D] mb-8">
            Please login to continue checkout.
          </p>
          <Link
            href="/account/login?redirect=/checkout"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-xl text-[12px] tracking-[0.2em] uppercase font-medium hover:opacity-90 transition-all"
          >
            Sign In
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </Link>
        </div>
      </main>
    );
  }

  // ==================== EMPTY CART ====================
  if (!loading && items.length === 0) {
    return (
      <main className="bg-[#FAFAFA] dark:bg-black min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-8 h-8 text-[#86868B]" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-3xl text-[#1D1D1F] dark:text-white mb-3">
            Cart is Empty
          </h1>
          <p className="text-[13px] text-[#6E6E73] dark:text-[#98989D] mb-8">
            Add items to your cart before proceeding to checkout.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-xl text-[12px] tracking-[0.2em] uppercase font-medium hover:opacity-90 transition-all"
          >
            <ShoppingBag className="w-4 h-4" strokeWidth={2} />
            Shop Now
          </Link>
        </div>
      </main>
    );
  }

  // ==================== RENDER ====================
  return (
    <main className="bg-[#FAFAFA] dark:bg-black min-h-screen">

      {/* ==================== TOAST ==================== */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-lg shadow-lg border-l-2 admin-fade-in ${
            toast.type === "success"
              ? "bg-[#E8F5E9] border-[#2E7D32] text-[#2E7D32]"
              : "bg-[#FFEBEE] border-[#C62828] text-[#C62828]"
          }`}
        >
          <p className="text-[13px] font-medium">{toast.message}</p>
        </div>
      )}

      {/* ==================== HEADER ==================== */}
      <section className="pt-8 md:pt-16 pb-6 md:pb-10 px-4 md:px-8 lg:px-16 border-b border-[#E5E5E7] dark:border-[#38383A]">
        <div className="max-w-[1400px] mx-auto">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[10px] tracking-wider uppercase text-[#86868B] font-medium mb-5 flex-wrap">
            <Link
              href="/cart"
              className="hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
            >
              Cart
            </Link>
            <ChevronRight className="w-3 h-3" strokeWidth={2} />
            <span className="text-[#1D1D1F] dark:text-white">Checkout</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#86868B] font-medium mb-3">
                Final Step
              </p>
              <h1 className="font-display text-3xl md:text-5xl lg:text-6xl text-[#1D1D1F] dark:text-white mb-3">
                Checkout
              </h1>
              <p className="text-[#6E6E73] dark:text-[#98989D] text-sm md:text-base">
                Complete your order in just a few steps
              </p>
            </div>

            {/* Steps Indicator */}
            <div className="flex items-center gap-2 shrink-0">
              {[
                { num: 1, label: "Cart", done: true },
                { num: 2, label: "Details", active: true },
                { num: 3, label: "Confirm" },
              ].map((step, i) => (
                <div key={step.num} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium ${
                      step.done
                        ? "bg-[#2E7D32] text-white"
                        : step.active
                        ? "bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F]"
                        : "bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#86868B]"
                    }`}
                  >
                    {step.done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : step.num}
                  </div>
                  {i < 2 && (
                    <div
                      className={`w-6 h-0.5 ${
                        step.done ? "bg-[#2E7D32]" : "bg-[#E5E5E7] dark:bg-[#38383A]"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ==================== CONTENT ==================== */}
      <section className="py-8 md:py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-[1400px] mx-auto">

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="text-center">
                <Loader2
                  className="w-6 h-6 text-[#86868B] animate-spin mx-auto mb-3"
                  strokeWidth={2}
                />
                <p className="text-[10px] tracking-[0.3em] uppercase text-[#86868B]">
                  Loading Checkout
                </p>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">

              {/* ==================== LEFT — FORM ==================== */}
              <div className="lg:col-span-7 space-y-5">

                {/* ============ SECTION 1: SHIPPING ADDRESS ============ */}
                <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A] overflow-hidden">

                  {/* Section Header */}
                  <div className="p-5 border-b border-[#E5E5E7] dark:border-[#38383A] flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1D1D1F] dark:bg-white flex items-center justify-center text-white dark:text-[#1D1D1F] text-[13px] font-medium shrink-0">
                        1
                      </div>
                      <div>
                        <h2 className="font-display text-lg text-[#1D1D1F] dark:text-white">
                          Shipping Address
                        </h2>
                        <p className="text-[11px] text-[#86868B] mt-0.5">
                          Where should we deliver?
                        </p>
                      </div>
                    </div>

                    {addresses.length > 0 && !showNewAddress && (
                      <button
                        onClick={() => setShowNewAddress(true)}
                        className="inline-flex items-center gap-1.5 text-[11px] tracking-wider uppercase font-medium text-[#0A84FF] hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                        Add New
                      </button>
                    )}
                  </div>

                  <div className="p-5">

                    {/* Saved Addresses */}
                    {!showNewAddress && addresses.length > 0 && (
                      <div className="space-y-3">
                        {addresses.map((addr) => {
                          const isSelected = selectedAddressId === addr.id;
                          return (
                            <button
                              key={addr.id}
                              onClick={() => setSelectedAddressId(addr.id)}
                              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 relative ${
                                isSelected
                                  ? "border-[#1D1D1F] dark:border-white bg-[#F5F5F7] dark:bg-[#2C2C2E]"
                                  : "border-[#E5E5E7] dark:border-[#38383A] hover:border-[#D2D2D7] dark:hover:border-[#48484A]"
                              }`}
                            >
                              {addr.isDefault && (
                                <span className="absolute top-3 right-3 text-[9px] tracking-wider uppercase font-medium px-2 py-0.5 rounded-md bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] inline-flex items-center gap-1">
                                  <Star className="w-2.5 h-2.5 fill-current" strokeWidth={2.5} />
                                  Default
                                </span>
                              )}

                              <div className="flex items-start gap-3">
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                                    isSelected
                                      ? "border-[#1D1D1F] dark:border-white bg-[#1D1D1F] dark:bg-white"
                                      : "border-[#D2D2D7] dark:border-[#48484A]"
                                  }`}
                                >
                                  {isSelected && (
                                    <Check
                                      className="w-3 h-3 text-white dark:text-[#1D1D1F]"
                                      strokeWidth={3}
                                    />
                                  )}
                                </div>

                                <div className="flex-1 min-w-0 pr-16">
                                  <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white mb-1">
                                    {addr.fullName}
                                  </p>
                                  <p className="text-[11px] text-[#6E6E73] dark:text-[#98989D] flex items-center gap-1.5 mb-1.5">
                                    <Phone className="w-3 h-3" strokeWidth={2} />
                                    {addr.phone}
                                  </p>
                                  <p className="text-[12px] text-[#6E6E73] dark:text-[#98989D] leading-relaxed">
                                    {addr.street}, {addr.city}
                                    {addr.state && `, ${addr.state}`}{" "}
                                    {addr.postalCode}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* New Address Form */}
                    {(showNewAddress || addresses.length === 0) && (
                      <div className="space-y-4 admin-fade-in">

                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Full Name */}
                          <div>
                            <label className="block text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] mb-2">
                              Full Name <span className="text-[#C62828]">*</span>
                            </label>
                            <div className="relative">
                              <UserIcon
                                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B]"
                                strokeWidth={2}
                              />
                              <input
                                type="text"
                                value={newAddress.fullName}
                                onChange={(e) => {
                                  setNewAddress({ ...newAddress, fullName: e.target.value });
                                  if (addressErrors.fullName)
                                    setAddressErrors({ ...addressErrors, fullName: "" });
                                }}
                                placeholder="Your full name"
                                className={`w-full h-11 bg-[#FAFAFA] dark:bg-[#0A0A0A] border rounded-xl pl-10 pr-4 text-[13px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:bg-white dark:focus:bg-[#1C1C1E] transition-all ${
                                  addressErrors.fullName
                                    ? "border-[#C62828]"
                                    : "border-[#E5E5E7] dark:border-[#38383A] focus:border-[#1D1D1F] dark:focus:border-white"
                                }`}
                              />
                            </div>
                            {addressErrors.fullName && (
                              <p className="text-[10px] text-[#C62828] mt-1">
                                {addressErrors.fullName}
                              </p>
                            )}
                          </div>

                          {/* Phone */}
                          <div>
                            <label className="block text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] mb-2">
                              Phone <span className="text-[#C62828]">*</span>
                            </label>
                            <div className="relative">
                              <Phone
                                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B]"
                                strokeWidth={2}
                              />
                              <input
                                type="tel"
                                value={newAddress.phone}
                                onChange={(e) => {
                                  setNewAddress({ ...newAddress, phone: e.target.value });
                                  if (addressErrors.phone)
                                    setAddressErrors({ ...addressErrors, phone: "" });
                                }}
                                placeholder="0300 1234567"
                                className={`w-full h-11 bg-[#FAFAFA] dark:bg-[#0A0A0A] border rounded-xl pl-10 pr-4 text-[13px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:bg-white dark:focus:bg-[#1C1C1E] transition-all ${
                                  addressErrors.phone
                                    ? "border-[#C62828]"
                                    : "border-[#E5E5E7] dark:border-[#38383A] focus:border-[#1D1D1F] dark:focus:border-white"
                                }`}
                              />
                            </div>
                            {addressErrors.phone && (
                              <p className="text-[10px] text-[#C62828] mt-1">
                                {addressErrors.phone}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Street */}
                        <div>
                          <label className="block text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] mb-2">
                            Street Address <span className="text-[#C62828]">*</span>
                          </label>
                          <div className="relative">
                            <Home
                              className="w-4 h-4 absolute left-3.5 top-3.5 text-[#86868B]"
                              strokeWidth={2}
                            />
                            <textarea
                              value={newAddress.street}
                              onChange={(e) => {
                                setNewAddress({ ...newAddress, street: e.target.value });
                                if (addressErrors.street)
                                  setAddressErrors({ ...addressErrors, street: "" });
                              }}
                              rows={2}
                              placeholder="House #, Street, Area, Landmark"
                              className={`w-full bg-[#FAFAFA] dark:bg-[#0A0A0A] border rounded-xl pl-10 pr-4 py-3 text-[13px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:bg-white dark:focus:bg-[#1C1C1E] transition-all resize-none ${
                                addressErrors.street
                                  ? "border-[#C62828]"
                                  : "border-[#E5E5E7] dark:border-[#38383A] focus:border-[#1D1D1F] dark:focus:border-white"
                              }`}
                            />
                          </div>
                          {addressErrors.street && (
                            <p className="text-[10px] text-[#C62828] mt-1">
                              {addressErrors.street}
                            </p>
                          )}
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] mb-2">
                              City <span className="text-[#C62828]">*</span>
                            </label>
                            <input
                              type="text"
                              value={newAddress.city}
                              onChange={(e) => {
                                setNewAddress({ ...newAddress, city: e.target.value });
                                if (addressErrors.city)
                                  setAddressErrors({ ...addressErrors, city: "" });
                              }}
                              placeholder="Lahore"
                              list="checkout-cities"
                              className={`w-full h-11 bg-[#FAFAFA] dark:bg-[#0A0A0A] border rounded-xl px-4 text-[13px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:bg-white dark:focus:bg-[#1C1C1E] transition-all ${
                                addressErrors.city
                                  ? "border-[#C62828]"
                                  : "border-[#E5E5E7] dark:border-[#38383A] focus:border-[#1D1D1F] dark:focus:border-white"
                              }`}
                            />
                            <datalist id="checkout-cities">
                              {PK_CITIES.map((c) => (
                                <option key={c} value={c} />
                              ))}
                            </datalist>
                            {addressErrors.city && (
                              <p className="text-[10px] text-[#C62828] mt-1">
                                {addressErrors.city}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] mb-2">
                              State
                            </label>
                            <input
                              type="text"
                              value={newAddress.state}
                              onChange={(e) =>
                                setNewAddress({ ...newAddress, state: e.target.value })
                              }
                              placeholder="Punjab"
                              className="w-full h-11 bg-[#FAFAFA] dark:bg-[#0A0A0A] border border-[#E5E5E7] dark:border-[#38383A] rounded-xl px-4 text-[13px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:border-[#1D1D1F] dark:focus:border-white transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] mb-2">
                              Postal Code <span className="text-[#C62828]">*</span>
                            </label>
                            <input
                              type="text"
                              value={newAddress.postalCode}
                              onChange={(e) => {
                                setNewAddress({ ...newAddress, postalCode: e.target.value });
                                if (addressErrors.postalCode)
                                  setAddressErrors({ ...addressErrors, postalCode: "" });
                              }}
                              placeholder="54000"
                              maxLength={5}
                              className={`w-full h-11 bg-[#FAFAFA] dark:bg-[#0A0A0A] border rounded-xl px-4 text-[13px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:bg-white dark:focus:bg-[#1C1C1E] transition-all ${
                                addressErrors.postalCode
                                  ? "border-[#C62828]"
                                  : "border-[#E5E5E7] dark:border-[#38383A] focus:border-[#1D1D1F] dark:focus:border-white"
                              }`}
                            />
                            {addressErrors.postalCode && (
                              <p className="text-[10px] text-[#C62828] mt-1">
                                {addressErrors.postalCode}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={handleAddAddress}
                            disabled={savingAddress}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-xl text-[11px] tracking-wider uppercase font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                            {savingAddress ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" strokeWidth={2} />
                                Save Address
                              </>
                            )}
                          </button>

                          {addresses.length > 0 && (
                            <button
                              onClick={() => {
                                setShowNewAddress(false);
                                setAddressErrors({});
                              }}
                              className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#E5E5E7] dark:border-[#38383A] rounded-xl text-[11px] tracking-wider uppercase font-medium text-[#1D1D1F] dark:text-white hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>

                      </div>
                    )}

                  </div>
                </div>

                {/* ============ SECTION 2: PAYMENT METHOD ============ */}
                <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A] overflow-hidden">

                  <div className="p-5 border-b border-[#E5E5E7] dark:border-[#38383A] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1D1D1F] dark:bg-white flex items-center justify-center text-white dark:text-[#1D1D1F] text-[13px] font-medium shrink-0">
                      2
                    </div>
                    <div>
                      <h2 className="font-display text-lg text-[#1D1D1F] dark:text-white">
                        Payment Method
                      </h2>
                      <p className="text-[11px] text-[#86868B] mt-0.5">
                        How would you like to pay?
                      </p>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    {PAYMENT_METHODS.map((method) => {
                      const Icon = method.icon;
                      const isSelected = paymentMethod === method.id;

                      return (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 relative ${
                            isSelected
                              ? "border-[#1D1D1F] dark:border-white bg-[#F5F5F7] dark:bg-[#2C2C2E]"
                              : "border-[#E5E5E7] dark:border-[#38383A] hover:border-[#D2D2D7] dark:hover:border-[#48484A]"
                          }`}
                        >
                          {method.badge && (
                            <span className="absolute top-3 right-3 text-[9px] tracking-wider uppercase font-medium px-2 py-0.5 rounded-md bg-[#2E7D32] text-white">
                              {method.badge}
                            </span>
                          )}

                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? "border-[#1D1D1F] dark:border-white bg-[#1D1D1F] dark:bg-white"
                                  : "border-[#D2D2D7] dark:border-[#48484A]"
                              }`}
                            >
                              {isSelected && (
                                <Check
                                  className="w-3 h-3 text-white dark:text-[#1D1D1F]"
                                  strokeWidth={3}
                                />
                              )}
                            </div>

                            <div
                              className={`w-10 h-10 rounded-lg ${method.bg} flex items-center justify-center shrink-0`}
                            >
                              <Icon
                                className={`w-5 h-5 ${method.color}`}
                                strokeWidth={2}
                              />
                            </div>

                            <div className="flex-1 min-w-0 pr-12">
                              <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white">
                                {method.label}
                              </p>
                              <p className="text-[11px] text-[#86868B] mt-0.5">
                                {method.desc}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ============ SECTION 3: ORDER NOTES ============ */}
                <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A] overflow-hidden">

                  <div className="p-5 border-b border-[#E5E5E7] dark:border-[#38383A] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] flex items-center justify-center text-[#6E6E73] dark:text-[#98989D] text-[13px] font-medium shrink-0">
                      3
                    </div>
                    <div>
                      <h2 className="font-display text-lg text-[#1D1D1F] dark:text-white">
                        Order Notes
                      </h2>
                      <p className="text-[11px] text-[#86868B] mt-0.5">
                        Optional — anything we should know?
                      </p>
                    </div>
                  </div>

                  <div className="p-5">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Special delivery instructions, gift message, etc."
                      rows={3}
                      maxLength={500}
                      className="w-full bg-[#FAFAFA] dark:bg-[#0A0A0A] border border-[#E5E5E7] dark:border-[#38383A] rounded-xl p-4 text-[13px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:border-[#1D1D1F] dark:focus:border-white focus:bg-white dark:focus:bg-[#1C1C1E] transition-all resize-none"
                    />
                    <p className="text-[10px] text-[#86868B] mt-1.5 text-right">
                      {notes.length}/500
                    </p>
                  </div>
                </div>

                {/* ============ TRUST BADGES ============ */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Truck, label: "Fast Delivery" },
                    { icon: RotateCcw, label: "Easy Returns" },
                    { icon: Shield, label: "Secure" },
                  ].map((badge) => {
                    const Icon = badge.icon;
                    return (
                      <div
                        key={badge.label}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white dark:bg-[#1C1C1E] border border-[#E5E5E7] dark:border-[#38383A]"
                      >
                        <Icon
                          className="w-4 h-4 text-[#6E6E73] dark:text-[#98989D]"
                          strokeWidth={1.8}
                        />
                        <span className="text-[9px] md:text-[10px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] text-center">
                          {badge.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* ==================== RIGHT — ORDER SUMMARY ==================== */}
              <div className="lg:col-span-5">
                <div className="lg:sticky lg:top-24 space-y-4">

                  {/* Mobile Summary Toggle */}
                  <button
                    onClick={() => setSummaryExpanded(!summaryExpanded)}
                    className="lg:hidden w-full flex items-center justify-between p-4 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A]"
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-[#6E6E73]" strokeWidth={2} />
                      <span className="text-[13px] font-medium text-[#1D1D1F] dark:text-white">
                        Order Summary
                      </span>
                      <span className="text-[11px] text-[#86868B]">
                        ({items.length} items)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-lg text-[#1D1D1F] dark:text-white">
                        Rs. {total.toLocaleString()}
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 text-[#86868B] transition-transform ${
                          summaryExpanded ? "rotate-90" : ""
                        }`}
                        strokeWidth={2}
                      />
                    </div>
                  </button>

                  {/* Summary Card */}
                  <div
                    className={`bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A] overflow-hidden transition-all duration-300 ${
                      summaryExpanded ? "block" : "hidden lg:block"
                    }`}
                  >

                    {/* Header */}
                    <div className="p-5 border-b border-[#E5E5E7] dark:border-[#38383A]">
                      <h2 className="font-display text-lg text-[#1D1D1F] dark:text-white">
                        Order Summary
                      </h2>
                    </div>

                    {/* Items Preview */}
                    <div className="p-5 border-b border-[#E5E5E7] dark:border-[#38383A] max-h-64 overflow-y-auto">
                      <div className="space-y-3">
                        {items.map((item: CartItem) => (
                          <div key={item.id} className="flex gap-3">
                            <div className="w-12 h-14 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-lg shrink-0 overflow-hidden relative">
                              {item.product.images?.[0] ? (
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package
                                    className="w-4 h-4 text-[#86868B]"
                                    strokeWidth={1.5}
                                  />
                                </div>
                              )}
                              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] text-[9px] font-medium rounded-full flex items-center justify-center">
                                {item.quantity}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-medium text-[#1D1D1F] dark:text-white line-clamp-2 leading-tight">
                                {item.product.name}
                              </p>
                              {(item.size || item.color) && (
                                <p className="text-[10px] text-[#86868B] mt-0.5">
                                  {item.size}
                                  {item.size && item.color && " · "}
                                  {item.color}
                                </p>
                              )}
                            </div>
                            <p className="text-[12px] font-medium text-[#1D1D1F] dark:text-white shrink-0">
                              Rs.{" "}
                              {(item.product.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Promo Code */}
                    <div className="p-5 border-b border-[#E5E5E7] dark:border-[#38383A]">
                      {appliedPromo ? (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-[#E8F5E9] border border-[#81C784]">
                          <div className="flex items-center gap-2 min-w-0">
                            <CheckCircle
                              className="w-4 h-4 text-[#2E7D32] shrink-0"
                              strokeWidth={2.5}
                            />
                            <span className="text-[12px] font-medium text-[#2E7D32] truncate">
                              {appliedPromo} applied
                            </span>
                          </div>
                          <button
                            onClick={() => setAppliedPromo("")}
                            className="p-1 rounded-md hover:bg-[#C8E6C9] transition-colors shrink-0"
                          >
                            <X
                              className="w-3.5 h-3.5 text-[#2E7D32]"
                              strokeWidth={2}
                            />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex gap-2">
                            <div className="flex-1 relative">
                              <Tag
                                className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B]"
                                strokeWidth={2}
                              />
                              <input
                                type="text"
                                value={promoCode}
                                onChange={(e) =>
                                  setPromoCode(e.target.value.toUpperCase())
                                }
                                onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                                placeholder="Enter code"
                                className="w-full h-10 bg-[#FAFAFA] dark:bg-[#0A0A0A] border border-[#E5E5E7] dark:border-[#38383A] rounded-xl pl-10 pr-3 text-[12px] text-[#1D1D1F] dark:text-white placeholder:text-[#86868B] outline-none focus:border-[#1D1D1F] dark:focus:border-white transition-all"
                              />
                            </div>
                            <button
                              onClick={applyPromo}
                              disabled={applyingPromo || !promoCode.trim()}
                              className="px-4 rounded-xl bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] text-[11px] tracking-wider uppercase font-medium hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0"
                            >
                              {applyingPromo ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
                              ) : (
                                "Apply"
                              )}
                            </button>
                          </div>
                          {promoError && (
                            <p className="text-[10px] text-[#C62828] mt-2 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" strokeWidth={2} />
                              {promoError}
                            </p>
                          )}
                          {!promoError && (
                            <p className="text-[10px] text-[#86868B] mt-2 flex items-center gap-1">
                              <Gift className="w-3 h-3" strokeWidth={2} />
                              Try: ZAEM10, WELCOME10
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Totals */}
                    <div className="p-5 space-y-3 border-b border-[#E5E5E7] dark:border-[#38383A]">
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="text-[#6E6E73] dark:text-[#98989D]">
                          Subtotal ({items.length} items)
                        </span>
                        <span className="text-[#1D1D1F] dark:text-white font-medium">
                          Rs. {subtotal.toLocaleString()}
                        </span>
                      </div>

                      {discount > 0 && (
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="text-[#2E7D32] flex items-center gap-1">
                            <Tag className="w-3 h-3" strokeWidth={2} />
                            Discount
                          </span>
                          <span className="text-[#2E7D32] font-medium">
                            − Rs. {discount.toLocaleString()}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[13px]">
                        <span className="text-[#6E6E73] dark:text-[#98989D]">
                          Shipping
                        </span>
                        <span
                          className={`font-medium ${
                            shipping === 0
                              ? "text-[#2E7D32]"
                              : "text-[#1D1D1F] dark:text-white"
                          }`}
                        >
                          {shipping === 0 ? "FREE" : `Rs. ${shipping.toLocaleString()}`}
                        </span>
                      </div>

                      {totalSavings > 0 && (
                        <div className="pt-2 border-t border-[#E5E5E7] dark:border-[#38383A]">
                          <p className="text-[11px] text-[#2E7D32] flex items-center gap-1.5">
                            <TrendingUp className="w-3 h-3" strokeWidth={2.5} />
                            You&apos;re saving Rs. {totalSavings.toLocaleString()} on
                            this order!
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Total */}
                    <div className="p-5 border-b border-[#E5E5E7] dark:border-[#38383A]">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] tracking-wider uppercase font-medium text-[#1D1D1F] dark:text-white">
                          Total
                        </span>
                        <span className="font-display text-2xl text-[#1D1D1F] dark:text-white">
                          Rs. {total.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Terms + Place Order */}
                    <div className="p-5 space-y-4">

                      {/* Terms */}
                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <button
                          type="button"
                          onClick={() => setAgreedToTerms(!agreedToTerms)}
                          className={`w-5 h-5 rounded-md border transition-all flex items-center justify-center shrink-0 mt-0.5 ${
                            agreedToTerms
                              ? "bg-[#1D1D1F] dark:bg-white border-[#1D1D1F] dark:border-white"
                              : "border-[#D2D2D7] dark:border-[#48484A] hover:border-[#86868B]"
                          }`}
                        >
                          {agreedToTerms && (
                            <Check
                              className="w-3 h-3 text-white dark:text-[#1D1D1F]"
                              strokeWidth={3}
                            />
                          )}
                        </button>
                        <span className="text-[11px] text-[#6E6E73] dark:text-[#98989D] leading-relaxed">
                          I agree to ZAEM&apos;s{" "}
                          <Link
                            href="/terms"
                            className="text-[#1D1D1F] dark:text-white underline"
                          >
                            Terms
                          </Link>{" "}
                          and{" "}
                          <Link
                            href="/returns"
                            className="text-[#1D1D1F] dark:text-white underline"
                          >
                            Return Policy
                          </Link>
                        </span>
                      </label>

                      {/* Place Order */}
                      <button
                        onClick={handlePlaceOrder}
                        disabled={
                          placingOrder ||
                          !selectedAddressId ||
                          !agreedToTerms ||
                          items.length === 0
                        }
                        className={`group w-full h-14 flex items-center justify-center gap-2 rounded-xl text-[12px] tracking-[0.2em] uppercase font-medium transition-all ${
                          placingOrder ||
                          !selectedAddressId ||
                          !agreedToTerms ||
                          items.length === 0
                            ? "bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#86868B] cursor-not-allowed"
                            : "bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] hover:opacity-90 active:scale-[0.98]"
                        }`}
                      >
                        {placingOrder ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                            Placing Order...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" strokeWidth={2} />
                            Place Order · Rs. {total.toLocaleString()}
                          </>
                        )}
                      </button>

                      {/* Trust */}
                      <div className="space-y-2 pt-2">
                        {[
                          "Free shipping above Rs. 5,000",
                          "7-day easy returns",
                          "Secure payment methods",
                        ].map((text) => (
                          <div
                            key={text}
                            className="flex items-center gap-2 text-[10px] text-[#86868B]"
                          >
                            <CheckCircle
                              className="w-3 h-3 text-[#2E7D32] shrink-0"
                              strokeWidth={2.5}
                            />
                            <span>{text}</span>
                          </div>
                        ))}
                      </div>

                    </div>

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