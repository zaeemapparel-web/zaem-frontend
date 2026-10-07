"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  Package,
  Truck,
  Home,
  MapPin,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Boxes,
  RotateCcw,
  Copy,
  Check,
  Printer,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  Hash,
  Download,
  ArrowLeft,
  Shield,
  Star,
  MessageCircle,
  Eye,
  User as UserIcon,
  Lock,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ==================== STATUS CONFIG ====================
const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    icon: any;
    color: string;
    bg: string;
    border: string;
    description: string;
  }
> = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    color: "text-[#E65100]",
    bg: "bg-[#FFF3E0]",
    border: "border-[#FFB74D]",
    description: "Your order has been placed and is awaiting confirmation",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: CheckCircle,
    color: "text-[#0A84FF]",
    bg: "bg-[#E3F2FD]",
    border: "border-[#64B5F6]",
    description: "Your order has been confirmed and is being prepared",
  },
  PROCESSING: {
    label: "Processing",
    icon: Boxes,
    color: "text-[#7B1FA2]",
    bg: "bg-[#F3E5F5]",
    border: "border-[#BA68C8]",
    description: "Your order is being packed and prepared for shipping",
  },
  SHIPPED: {
    label: "Shipped",
    icon: Truck,
    color: "text-[#00838F]",
    bg: "bg-[#E0F7FA]",
    border: "border-[#4DD0E1]",
    description: "Your order is on the way",
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle,
    color: "text-[#2E7D32]",
    bg: "bg-[#E8F5E9]",
    border: "border-[#81C784]",
    description: "Your order has been delivered successfully",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: X,
    color: "text-[#C62828]",
    bg: "bg-[#FFEBEE]",
    border: "border-[#EF5350]",
    description: "This order has been cancelled",
  },
  RETURNED: {
    label: "Returned",
    icon: RotateCcw,
    color: "text-[#6E6E73]",
    bg: "bg-[#F5F5F7]",
    border: "border-[#BDBDBD]",
    description: "This order has been returned",
  },
};

// ==================== TIMELINE STEPS ====================
const TIMELINE_STEPS = [
  { status: "PENDING", label: "Order Placed", icon: Package },
  { status: "CONFIRMED", label: "Confirmed", icon: CheckCircle },
  { status: "PROCESSING", label: "Processing", icon: Boxes },
  { status: "SHIPPED", label: "Shipped", icon: Truck },
  { status: "DELIVERED", label: "Delivered", icon: Home },
];

// ==================== MAIN COMPONENT ====================
export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { loadFromStorage } = useAuthStore();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // ==================== INIT ====================
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // ==================== FETCH ORDER ====================
  useEffect(() => {
    const fetchOrder = async () => {
      const token = localStorage.getItem("zaem_token");
      if (!token) {
        router.push("/account/login");
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setOrder(data.data.order);
        } else {
          setError(data.message || "Order not found");
        }
      } catch (err) {
        console.error(err);
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId, router]);

  // ==================== TOAST ====================
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // ==================== COPY ====================
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    showToast("success", `${label} copied`);
    setTimeout(() => setCopied(null), 2000);
  };

  // ==================== CANCEL ORDER ====================
  const handleCancel = async () => {
    const token = localStorage.getItem("zaem_token");
    if (!token) return;

    setCancelling(true);
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setOrder({ ...order, status: "CANCELLED" });
        showToast("success", "Order cancelled successfully");
      } else {
        showToast("error", data.message || "Failed to cancel order");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Network error");
    } finally {
      setCancelling(false);
      setShowCancelModal(false);
    }
  };

  // ==================== PRINT ====================
  const handlePrint = () => {
    window.print();
  };

  // ==================== LOADING ====================
  if (loading) {
    return (
      <main className="bg-[#FAFAFA] dark:bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className="w-6 h-6 text-[#86868B] animate-spin mx-auto mb-3"
            strokeWidth={2}
          />
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#86868B]">
            Loading Order
          </p>
        </div>
      </main>
    );
  }

  // ==================== ERROR ====================
  if (error || !order) {
    return (
      <main className="bg-[#FAFAFA] dark:bg-black min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-[#FFEBEE] rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle
              className="w-6 h-6 text-[#C62828]"
              strokeWidth={2}
            />
          </div>
          <h1 className="font-display text-2xl text-[#1D1D1F] dark:text-white mb-2">
            Order Not Found
          </h1>
          <p className="text-[13px] text-[#6E6E73] dark:text-[#98989D] mb-6">
            {error || "This order does not exist or has been removed"}
          </p>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] rounded-xl text-[11px] tracking-wider uppercase font-medium hover:opacity-90 transition-all"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            My Orders
          </Link>
        </div>
      </main>
    );
  }

  // ==================== DERIVED ====================
  const statusConfig =
    STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = statusConfig.icon;
  const canCancel = ["PENDING", "CONFIRMED"].includes(order.status);
  const currentStepIndex = TIMELINE_STEPS.findIndex(
    (s) => s.status === order.status
  );
  const isCancelled =
    order.status === "CANCELLED" || order.status === "RETURNED";

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
              href="/"
              className="hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
            >
              Home
            </Link>
            <ChevronRight className="w-3 h-3" strokeWidth={2} />
            <Link
              href="/account"
              className="hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
            >
              Account
            </Link>
            <ChevronRight className="w-3 h-3" strokeWidth={2} />
            <Link
              href="/account/orders"
              className="hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
            >
              Orders
            </Link>
            <ChevronRight className="w-3 h-3" strokeWidth={2} />
            <span className="text-[#1D1D1F] dark:text-white">
              {order.orderNumber}
            </span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div className="flex items-center gap-4 min-w-0">
              <Link
                href="/account/orders"
                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[#F5F5F7] dark:hover:bg-[#1C1C1E] transition-colors shrink-0"
              >
                <ArrowLeft
                  className="w-5 h-5 text-[#1D1D1F] dark:text-white"
                  strokeWidth={2}
                />
              </Link>

              <div className="min-w-0">
                <p className="text-[10px] tracking-[0.3em] uppercase text-[#86868B] font-medium mb-1">
                  Order Details
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="font-display text-2xl md:text-3xl lg:text-4xl text-[#1D1D1F] dark:text-white truncate">
                    {order.orderNumber}
                  </h1>
                  <button
                    onClick={() =>
                      copyToClipboard(order.orderNumber, "Order #")
                    }
                    className="p-1.5 rounded-md hover:bg-[#F5F5F7] dark:hover:bg-[#1C1C1E] transition-colors shrink-0"
                    aria-label="Copy order number"
                  >
                    {copied === "Order #" ? (
                      <Check
                        className="w-3.5 h-3.5 text-[#2E7D32]"
                        strokeWidth={2}
                      />
                    ) : (
                      <Copy
                        className="w-3.5 h-3.5 text-[#86868B]"
                        strokeWidth={2}
                      />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E5E7] dark:border-[#38383A] text-[11px] tracking-wider uppercase font-medium text-[#6E6E73] dark:text-[#98989D] hover:bg-[#F5F5F7] dark:hover:bg-[#1C1C1E] hover:text-[#1D1D1F] dark:hover:text-white transition-colors"
              >
                <Printer className="w-3.5 h-3.5" strokeWidth={2} />
                Print
              </button>

              {canCancel && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E5E7] dark:border-[#38383A] text-[11px] tracking-wider uppercase font-medium text-[#C62828] hover:bg-[#FFEBEE] transition-colors"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={2} />
                  Cancel
                </button>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ==================== STATUS BANNER ==================== */}
      <section className="py-6 md:py-8 px-4 md:px-8 lg:px-16">
        <div className="max-w-[1400px] mx-auto">
          <div
            className={`rounded-2xl border p-5 md:p-6 ${statusConfig.bg} ${statusConfig.border}`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white dark:bg-[#1C1C1E] flex items-center justify-center shrink-0`}
              >
                <StatusIcon
                  className={`w-6 h-6 ${statusConfig.color}`}
                  strokeWidth={2}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2
                    className={`font-display text-xl md:text-2xl ${statusConfig.color}`}
                  >
                    {statusConfig.label}
                  </h2>
                  <span className="text-[10px] tracking-wider uppercase text-[#86868B] font-medium">
                    · Updated{" "}
                    {new Date(
                      order.updatedAt || order.createdAt
                    ).toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                <p className={`text-[13px] ${statusConfig.color} opacity-80`}>
                  {statusConfig.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== TIMELINE ==================== */}
      {!isCancelled && (
        <section className="pb-6 md:pb-8 px-4 md:px-8 lg:px-16">
          <div className="max-w-[1400px] mx-auto">
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A] p-5 md:p-8">

              <h3 className="text-[11px] tracking-wider uppercase text-[#86868B] font-medium mb-6">
                Order Timeline
              </h3>

              {/* Desktop Timeline */}
              <div className="hidden md:block">
                <div className="flex items-center justify-between relative">

                  {/* Background line */}
                  <div className="absolute top-6 left-6 right-6 h-0.5 bg-[#E5E5E7] dark:bg-[#38383A]" />

                  {/* Progress line */}
                  <div
                    className="absolute top-6 left-6 h-0.5 bg-[#2E7D32] transition-all duration-1000"
                    style={{
                      width: `calc(${
                        (currentStepIndex / (TIMELINE_STEPS.length - 1)) * 100
                      }% - ${currentStepIndex === 0 ? 0 : 12}px)`,
                    }}
                  />

                  {TIMELINE_STEPS.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isComplete = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;

                    return (
                      <div
                        key={step.status}
                        className="flex flex-col items-center relative z-10 flex-1"
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                            isComplete
                              ? "bg-[#2E7D32] border-[#2E7D32] text-white"
                              : "bg-white dark:bg-[#1C1C1E] border-[#E5E5E7] dark:border-[#38383A] text-[#86868B]"
                          } ${isCurrent ? "ring-4 ring-[#E8F5E9]" : ""}`}
                        >
                          {isComplete ? (
                            <Check className="w-5 h-5" strokeWidth={3} />
                          ) : (
                            <StepIcon className="w-5 h-5" strokeWidth={2} />
                          )}
                        </div>
                        <p
                          className={`text-[11px] tracking-wider uppercase font-medium mt-3 text-center ${
                            isComplete
                              ? "text-[#1D1D1F] dark:text-white"
                              : "text-[#86868B]"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Timeline */}
              <div className="md:hidden space-y-4">
                {TIMELINE_STEPS.map((step, idx) => {
                  const StepIcon = step.icon;
                  const isComplete = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div key={step.status} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all shrink-0 ${
                            isComplete
                              ? "bg-[#2E7D32] border-[#2E7D32] text-white"
                              : "bg-white dark:bg-[#1C1C1E] border-[#E5E5E7] dark:border-[#38383A] text-[#86868B]"
                          } ${isCurrent ? "ring-4 ring-[#E8F5E9]" : ""}`}
                        >
                          {isComplete ? (
                            <Check className="w-4 h-4" strokeWidth={3} />
                          ) : (
                            <StepIcon className="w-4 h-4" strokeWidth={2} />
                          )}
                        </div>
                        {idx < TIMELINE_STEPS.length - 1 && (
                          <div
                            className={`w-0.5 h-6 mt-1 ${
                              idx < currentStepIndex
                                ? "bg-[#2E7D32]"
                                : "bg-[#E5E5E7] dark:bg-[#38383A]"
                            }`}
                          />
                        )}
                      </div>
                      <div className="pt-1.5">
                        <p
                          className={`text-[12px] tracking-wider uppercase font-medium ${
                            isComplete
                              ? "text-[#1D1D1F] dark:text-white"
                              : "text-[#86868B]"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tracking Number */}
              {order.trackingNumber && (
                <div className="mt-6 pt-6 border-t border-[#E5E5E7] dark:border-[#38383A]">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#E0F7FA] flex items-center justify-center">
                        <Truck
                          className="w-4 h-4 text-[#00838F]"
                          strokeWidth={2}
                        />
                      </div>
                      <div>
                        <p className="text-[10px] tracking-wider uppercase text-[#86868B] font-medium mb-0.5">
                          Tracking Number
                        </p>
                        <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white">
                          {order.trackingNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          copyToClipboard(
                            order.trackingNumber,
                            "Tracking #"
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E5E5E7] dark:border-[#38383A] text-[11px] font-medium text-[#6E6E73] dark:text-[#98989D] hover:bg-[#F5F5F7] dark:hover:bg-[#1C1C1E] transition-colors"
                      >
                        {copied === "Tracking #" ? (
                          <Check
                            className="w-3.5 h-3.5 text-[#2E7D32]"
                            strokeWidth={2}
                          />
                        ) : (
                          <Copy className="w-3.5 h-3.5" strokeWidth={2} />
                        )}
                        Copy
                      </button>

                      {order.trackingUrl && (
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1D1D1F] dark:bg-white text-white dark:text-[#1D1D1F] text-[11px] tracking-wider uppercase font-medium hover:opacity-90 transition-colors"
                        >
                          Track
                          <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>
      )}

      {/* ==================== MAIN CONTENT ==================== */}
      <section className="pb-16 md:pb-24 px-4 md:px-8 lg:px-16">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-3 gap-5 md:gap-6">

          {/* ==================== LEFT COLUMN (2/3) ==================== */}
          <div className="lg:col-span-2 space-y-5">

            {/* ============ ITEMS ============ */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A] overflow-hidden">
              <div className="p-5 border-b border-[#E5E5E7] dark:border-[#38383A] flex items-center justify-between">
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-[#86868B] font-medium mb-1">
                    Items ({order.items?.length || 0})
                  </p>
                  <h3 className="font-display text-lg text-[#1D1D1F] dark:text-white">
                    Order Items
                  </h3>
                </div>
              </div>

              <div className="divide-y divide-[#E5E5E7] dark:divide-[#38383A]">
                {order.items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-4 md:p-5 flex gap-4 hover:bg-[#FAFAFA] dark:hover:bg-[#0A0A0A] transition-colors"
                  >
                    <div className="w-16 h-20 md:w-20 md:h-24 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-xl overflow-hidden shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package
                            className="w-6 h-6 text-[#86868B]"
                            strokeWidth={1.5}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] md:text-[14px] font-medium text-[#1D1D1F] dark:text-white mb-1.5 line-clamp-2">
                        {item.name}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        {item.size && (
                          <span className="text-[10px] tracking-wider uppercase font-medium px-2 py-0.5 rounded-md bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#6E6E73] dark:text-[#98989D]">
                            Size: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="text-[10px] tracking-wider uppercase font-medium px-2 py-0.5 rounded-md bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#6E6E73] dark:text-[#98989D]">
                            {item.color}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[12px] text-[#86868B]">
                          Rs. {item.price.toLocaleString()} × {item.quantity}
                        </p>
                        <p className="text-[14px] font-medium text-[#1D1D1F] dark:text-white">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ============ SHIPPING ADDRESS ============ */}
            {order.address && (
              <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-[#F3E5F5] flex items-center justify-center">
                    <MapPin
                      className="w-4 h-4 text-[#7B1FA2]"
                      strokeWidth={2}
                    />
                  </div>
                  <h3 className="font-display text-base text-[#1D1D1F] dark:text-white">
                    Shipping Address
                  </h3>
                </div>

                <div className="space-y-2">
                  <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white">
                    {order.address.fullName}
                  </p>
                  <p className="text-[12px] text-[#6E6E73] dark:text-[#98989D] leading-relaxed">
                    {order.address.street}
                    <br />
                    {order.address.city}
                    {order.address.state && `, ${order.address.state}`}
                    {order.address.postalCode &&
                      ` - ${order.address.postalCode}`}
                    <br />
                    {order.address.country}
                  </p>

                  <div className="flex items-center gap-2 pt-2">
                    <Phone
                      className="w-3.5 h-3.5 text-[#86868B]"
                      strokeWidth={2}
                    />
                    <span className="text-[12px] text-[#6E6E73] dark:text-[#98989D]">
                      {order.address.phone}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      copyToClipboard(
                        `${order.address.street}, ${order.address.city}, ${order.address.postalCode}`,
                        "Address"
                      )
                    }
                    className="inline-flex items-center gap-1.5 text-[10px] tracking-wider uppercase font-medium text-[#0A84FF] hover:underline mt-3"
                  >
                    {copied === "Address" ? (
                      <Check className="w-3 h-3" strokeWidth={2} />
                    ) : (
                      <Copy className="w-3 h-3" strokeWidth={2} />
                    )}
                    Copy Address
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* ==================== RIGHT COLUMN (1/3) ==================== */}
          <div className="space-y-5">

            {/* ============ ORDER SUMMARY ============ */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-[#E5E5E7] dark:border-[#38383A] p-5 lg:sticky lg:top-24">

              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 rounded-lg bg-[#E8F5E9] flex items-center justify-center">
                  <Hash
                    className="w-4 h-4 text-[#2E7D32]"
                    strokeWidth={2}
                  />
                </div>
                <h3 className="font-display text-base text-[#1D1D1F] dark:text-white">
                  Order Summary
                </h3>
              </div>

              <div className="space-y-3 text-[13px] pb-4 border-b border-[#E5E5E7] dark:border-[#38383A]">
                <div className="flex items-center justify-between">
                  <span className="text-[#6E6E73] dark:text-[#98989D]">
                    Subtotal
                  </span>
                  <span className="text-[#1D1D1F] dark:text-white font-medium">
                    Rs. {order.subtotal.toLocaleString()}
                  </span>
                </div>

                {order.discount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#6E6E73] dark:text-[#98989D]">
                      Discount
                    </span>
                    <span className="text-[#2E7D32] font-medium">
                      − Rs. {order.discount.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-[#6E6E73] dark:text-[#98989D]">
                    Shipping
                  </span>
                  <span className="text-[#1D1D1F] dark:text-white font-medium">
                    {order.shippingCost === 0
                      ? "Free"
                      : `Rs. ${order.shippingCost.toLocaleString()}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between py-5 border-b border-[#E5E5E7] dark:border-[#38383A]">
                <span className="text-[13px] tracking-wider uppercase font-medium text-[#1D1D1F] dark:text-white">
                  Total
                </span>
                <span className="font-display text-2xl text-[#1D1D1F] dark:text-white">
                  Rs. {order.total.toLocaleString()}
                </span>
              </div>

              {/* Meta info */}
              <div className="pt-5 space-y-3 text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#6E6E73] dark:text-[#98989D] flex items-center gap-1.5">
                    <CreditCard className="w-3 h-3" strokeWidth={2} />
                    Payment
                  </span>
                  <span className="text-[#1D1D1F] dark:text-white font-medium">
                    {order.paymentMethod}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#6E6E73] dark:text-[#98989D] flex items-center gap-1.5">
                    <Shield className="w-3 h-3" strokeWidth={2} />
                    Payment Status
                  </span>
                  <span
                    className={`text-[10px] tracking-wider uppercase font-medium px-2 py-0.5 rounded ${
                      order.paymentStatus === "PAID"
                        ? "bg-[#E8F5E9] text-[#2E7D32]"
                        : order.paymentStatus === "FAILED"
                        ? "bg-[#FFEBEE] text-[#C62828]"
                        : "bg-[#FFF3E0] text-[#E65100]"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#6E6E73] dark:text-[#98989D] flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" strokeWidth={2} />
                    Placed
                  </span>
                  <span className="text-[#1D1D1F] dark:text-white font-medium">
                    {new Date(order.createdAt).toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

            </div>

            {/* ============ NEED HELP? ============ */}
            <div className="bg-gradient-to-br from-[#1D1D1F] to-[#2C2C2E] dark:from-white dark:to-[#F5F5F7] rounded-2xl p-5 text-white dark:text-[#1D1D1F]">

              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 dark:bg-[#1D1D1F]/10 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" strokeWidth={2} />
                </div>
                <h3 className="font-display text-base">Need Help?</h3>
              </div>

              <p className="text-[12px] text-white/70 dark:text-[#1D1D1F]/70 leading-relaxed mb-4">
                Have questions about your order? Our team is here to help.
              </p>

              <div className="space-y-2">
                <a
                  href={`https://wa.me/923193773788?text=${encodeURIComponent(
                    `Hi ZAEM! I need help with my order ${order.orderNumber}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 w-full px-4 py-2.5 bg-white/10 dark:bg-[#1D1D1F]/10 hover:bg-white/20 dark:hover:bg-[#1D1D1F]/20 rounded-xl text-[11px] tracking-wider uppercase font-medium transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <MessageCircle className="w-3.5 h-3.5" strokeWidth={2} />
                    WhatsApp
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
                </a>

                <a
                  href="mailto:zaemlifestyle@gmail.com"
                  className="flex items-center justify-between gap-2 w-full px-4 py-2.5 bg-white/10 dark:bg-[#1D1D1F]/10 hover:bg-white/20 dark:hover:bg-[#1D1D1F]/20 rounded-xl text-[11px] tracking-wider uppercase font-medium transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" strokeWidth={2} />
                    Email Us
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
                </a>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ==================== CANCEL MODAL ==================== */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCancelModal(false)}
          />
          <div className="relative bg-white dark:bg-[#1C1C1E] max-w-md w-full p-6 rounded-2xl shadow-2xl admin-scale-in">

            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 bg-[#FFEBEE] rounded-full flex items-center justify-center shrink-0">
                <AlertCircle
                  className="w-6 h-6 text-[#C62828]"
                  strokeWidth={2}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl text-[#1D1D1F] dark:text-white mb-2">
                  Cancel Order?
                </h3>
                <p className="text-[13px] text-[#6E6E73] dark:text-[#98989D] leading-relaxed">
                  Are you sure you want to cancel order{" "}
                  <strong className="text-[#1D1D1F] dark:text-white">
                    {order.orderNumber}
                  </strong>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E5E7] dark:border-[#38383A] text-[12px] tracking-wider uppercase font-medium text-[#1D1D1F] dark:text-white hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-colors disabled:opacity-50"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C62828] hover:bg-[#B71C1C] text-white text-[12px] tracking-wider uppercase font-medium transition-colors disabled:opacity-50"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" strokeWidth={2} />
                    Cancel Order
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}