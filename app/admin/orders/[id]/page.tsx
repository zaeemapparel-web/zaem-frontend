"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
  Boxes,
  Copy,
  Check,
  Printer,
  MessageCircle,
  Calendar,
  Loader2,
  AlertCircle,
  ChevronDown,
  Save,
  ExternalLink,
  Eye,
  Hash,
  DollarSign,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ==================== TYPES ====================
interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  trackingNumber?: string;
  trackingUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  items: OrderItem[];
  address?: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

// ==================== STATUS CONFIG ====================
const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    icon: any;
    color: string;
    bg: string;
    border: string;
    dot: string;
  }
> = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    color: "text-[#E65100]",
    bg: "bg-[#FFF3E0]",
    border: "border-[#FFB74D]",
    dot: "bg-[#E65100]",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: CheckCircle,
    color: "text-[#0A84FF]",
    bg: "bg-[#E3F2FD]",
    border: "border-[#64B5F6]",
    dot: "bg-[#0A84FF]",
  },
  PROCESSING: {
    label: "Processing",
    icon: Boxes,
    color: "text-[#7B1FA2]",
    bg: "bg-[#F3E5F5]",
    border: "border-[#BA68C8]",
    dot: "bg-[#7B1FA2]",
  },
  SHIPPED: {
    label: "Shipped",
    icon: Truck,
    color: "text-[#00838F]",
    bg: "bg-[#E0F7FA]",
    border: "border-[#4DD0E1]",
    dot: "bg-[#00838F]",
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle,
    color: "text-[#2E7D32]",
    bg: "bg-[#E8F5E9]",
    border: "border-[#81C784]",
    dot: "bg-[#2E7D32]",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-[#C62828]",
    bg: "bg-[#FFEBEE]",
    border: "border-[#EF5350]",
    dot: "bg-[#C62828]",
  },
  RETURNED: {
    label: "Returned",
    icon: RotateCcw,
    color: "text-[#6E6E73]",
    bg: "bg-[#F5F5F7]",
    border: "border-[#BDBDBD]",
    dot: "bg-[#6E6E73]",
  },
};

const STATUS_OPTIONS = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
];

// ==================== MAIN COMPONENT ====================
export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { loadFromStorage } = useAuthStore();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Editable fields
  const [newStatus, setNewStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // ==================== INIT ====================
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // ==================== FETCH ORDER ====================
  useEffect(() => {
    const fetchOrder = async () => {
      const token = localStorage.getItem("zaem_token");
      if (!token) {
        router.push("/admin/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/orders/admin/all?limit=200`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          const found = data.data.orders.find((o: Order) => o.id === orderId);
          if (found) {
            setOrder(found);
            setNewStatus(found.status);
            setNewPaymentStatus(found.paymentStatus);
            setTrackingNumber(found.trackingNumber || "");
            setTrackingUrl(found.trackingUrl || "");
          } else {
            setError("Order not found");
          }
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load order");
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

  // ==================== COPY TO CLIPBOARD ====================
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    showToast("success", `${label} copied`);
    setTimeout(() => setCopied(null), 2000);
  };

  // ==================== UPDATE STATUS ====================
  const updateOrder = async () => {
    if (!order) return;
    const token = localStorage.getItem("zaem_token");
    if (!token) return;

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/orders/${order.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          paymentStatus: newPaymentStatus,
          trackingNumber: trackingNumber || null,
          trackingUrl: trackingUrl || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrder(data.data.order);
        showToast("success", "Order updated successfully");
      } else {
        showToast("error", data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Network error");
    } finally {
      setSaving(false);
    }
  };

  // ==================== PRINT INVOICE ====================
  const printInvoice = () => {
    window.print();
  };

  // ==================== WHATSAPP SHARE ====================
  const whatsappCustomer = () => {
    if (!order?.address?.phone && !order?.user?.phone) return;
    const phone = order.address?.phone || order.user?.phone || "";
    const cleaned = phone.replace(/\D/g, "").replace(/^0/, "92");

    const message = `Assalam o Alaikum ${order.address?.fullName || order.user?.name}!

Aapka ZAEM order *${order.orderNumber}* ka status: *${newStatus}*
${trackingNumber ? `Tracking: *${trackingNumber}*\n` : ""}
Total: Rs. ${order.total.toLocaleString()}

Shukriya!
Team ZAEM`;

    window.open(
      `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  // ==================== FORMAT DATE ====================
  const formatDate = (date: string) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==================== LOADING ====================
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <Loader2
            className="w-6 h-6 text-[#86868B] animate-spin mx-auto mb-3"
            strokeWidth={2}
          />
          <p className="text-[11px] tracking-[0.3em] uppercase text-[#86868B]">
            Loading Order
          </p>
        </div>
      </div>
    );
  }

  // ==================== ERROR ====================
  if (error || !order) {
    return (
      <div className="admin-card p-16 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-[#FFEBEE] rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-[#C62828]" strokeWidth={2} />
        </div>
        <h2 className="font-display text-xl text-[#1D1D1F] dark:text-white mb-2">
          Order Not Found
        </h2>
        <p className="text-[13px] text-[#86868B] mb-6">
          {error || "This order does not exist or has been removed."}
        </p>
        <Link href="/admin/orders" className="admin-btn admin-btn-primary">
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          Back to Orders
        </Link>
      </div>
    );
  }

  // ==================== STATUS CONFIG ====================
  const currentStatusConfig =
    STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = currentStatusConfig.icon;
  const hasChanges =
    newStatus !== order.status ||
    newPaymentStatus !== order.paymentStatus ||
    trackingNumber !== (order.trackingNumber || "") ||
    trackingUrl !== (order.trackingUrl || "");

  // ==================== RENDER ====================
  return (
    <div className="admin-fade-in">

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-[#F5F5F7] dark:hover:bg-[#1C1C1E] transition-colors shrink-0"
          >
            <ArrowLeft
              className="w-5 h-5 text-[#1D1D1F] dark:text-white"
              strokeWidth={2}
            />
          </Link>
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#86868B] font-medium mb-1">
              Order Details
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-2xl md:text-3xl text-[#1D1D1F] dark:text-white">
                {order.orderNumber}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 text-[10px] tracking-wider uppercase font-medium px-2.5 py-1 rounded-md border ${currentStatusConfig.bg} ${currentStatusConfig.color} ${currentStatusConfig.border}`}
              >
                <StatusIcon className="w-3 h-3" strokeWidth={2.5} />
                {currentStatusConfig.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={printInvoice}
            className="admin-btn admin-btn-secondary"
          >
            <Printer className="w-4 h-4" strokeWidth={2} />
            Print
          </button>
          <button
            onClick={whatsappCustomer}
            className="admin-btn admin-btn-primary"
            style={{ backgroundColor: "#25D366", borderColor: "#25D366" }}
          >
            <MessageCircle className="w-4 h-4" strokeWidth={2} />
            WhatsApp
          </button>
        </div>
      </div>

      {/* ==================== MAIN GRID ==================== */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* ==================== LEFT COLUMN (2/3) ==================== */}
        <div className="lg:col-span-2 space-y-6">

          {/* ============ ORDER ITEMS ============ */}
          <div className="admin-card overflow-hidden">
            <div className="p-5 border-b border-[#E5E5E7] dark:border-[#38383A] flex items-center justify-between">
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#86868B] font-medium mb-1">
                  Items ({order.items.length})
                </p>
                <h2 className="font-display text-lg text-[#1D1D1F] dark:text-white">
                  Order Items
                </h2>
              </div>
              <Hash
                className="w-5 h-5 text-[#86868B]"
                strokeWidth={1.5}
              />
            </div>

            <div className="divide-y divide-[#E5E5E7] dark:divide-[#38383A]">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="p-5 flex gap-4 hover:bg-[#FAFAFA] dark:hover:bg-[#0A0A0A] transition-colors"
                >
                  <div className="w-16 h-20 md:w-20 md:h-24 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-lg overflow-hidden shrink-0">
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
                    <Link
                      href={`/product/${item.productId}`}
                      target="_blank"
                      className="text-[13px] md:text-[14px] font-medium text-[#1D1D1F] dark:text-white hover:underline line-clamp-2 mb-1"
                    >
                      {item.name}
                    </Link>

                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {item.size && (
                        <span className="text-[10px] tracking-wider uppercase font-medium px-2 py-0.5 rounded bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#6E6E73] dark:text-[#98989D]">
                          Size: {item.size}
                        </span>
                      )}
                      {item.color && (
                        <span className="text-[10px] tracking-wider uppercase font-medium px-2 py-0.5 rounded bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#6E6E73] dark:text-[#98989D]">
                          Color: {item.color}
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

            {/* ============ TOTALS ============ */}
            <div className="p-5 bg-[#FAFAFA] dark:bg-[#0A0A0A] border-t border-[#E5E5E7] dark:border-[#38383A] space-y-2.5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#6E6E73] dark:text-[#98989D]">
                  Subtotal
                </span>
                <span className="text-[#1D1D1F] dark:text-white font-medium">
                  Rs. {order.subtotal.toLocaleString()}
                </span>
              </div>

              {order.discount > 0 && (
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#6E6E73] dark:text-[#98989D]">
                    Discount
                  </span>
                  <span className="text-[#2E7D32] font-medium">
                    − Rs. {order.discount.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#6E6E73] dark:text-[#98989D]">
                  Shipping
                </span>
                <span className="text-[#1D1D1F] dark:text-white font-medium">
                  {order.shippingCost === 0
                    ? "Free"
                    : `Rs. ${order.shippingCost.toLocaleString()}`}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-[#E5E5E7] dark:border-[#38383A]">
                <span className="text-[13px] tracking-wider uppercase font-medium text-[#1D1D1F] dark:text-white">
                  Total
                </span>
                <span className="font-display text-xl text-[#1D1D1F] dark:text-white">
                  Rs. {order.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* ============ CUSTOMER & ADDRESS ============ */}
          <div className="grid md:grid-cols-2 gap-4">

            {/* Customer Info */}
            <div className="admin-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#E3F2FD] flex items-center justify-center">
                  <User className="w-4 h-4 text-[#0A84FF]" strokeWidth={2} />
                </div>
                <h3 className="font-display text-base text-[#1D1D1F] dark:text-white">
                  Customer
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white">
                    {order.user?.name || order.address?.fullName || "Guest"}
                  </p>
                </div>

                {order.user?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#86868B] shrink-0" strokeWidth={2} />
                    <button
                      onClick={() =>
                        copyToClipboard(order.user!.email!, "Email")
                      }
                      className="text-[12px] text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-white truncate transition-colors flex items-center gap-1"
                    >
                      {order.user.email}
                      {copied === "Email" ? (
                        <Check className="w-3 h-3 text-[#2E7D32]" strokeWidth={2} />
                      ) : (
                        <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100" strokeWidth={2} />
                      )}
                    </button>
                  </div>
                )}

                {(order.address?.phone || order.user?.phone) && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#86868B] shrink-0" strokeWidth={2} />
                    <button
                      onClick={() =>
                        copyToClipboard(
                          order.address?.phone || order.user?.phone || "",
                          "Phone"
                        )
                      }
                      className="text-[12px] text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-white transition-colors flex items-center gap-1"
                    >
                      {order.address?.phone || order.user?.phone}
                      {copied === "Phone" ? (
                        <Check className="w-3 h-3 text-[#2E7D32]" strokeWidth={2} />
                      ) : (
                        <Copy className="w-3 h-3 opacity-50" strokeWidth={2} />
                      )}
                    </button>
                  </div>
                )}

                {order.user?.id && (
                  <Link
                    href={`/admin/users?search=${order.user.id}`}
                    className="text-[11px] tracking-wider uppercase font-medium text-[#0A84FF] hover:underline flex items-center gap-1 pt-1"
                  >
                    View Profile
                    <ExternalLink className="w-3 h-3" strokeWidth={2} />
                  </Link>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="admin-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#F3E5F5] flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[#7B1FA2]" strokeWidth={2} />
                </div>
                <h3 className="font-display text-base text-[#1D1D1F] dark:text-white">
                  Shipping Address
                </h3>
              </div>

              {order.address ? (
                <div className="space-y-2">
                  <p className="text-[13px] font-medium text-[#1D1D1F] dark:text-white">
                    {order.address.fullName}
                  </p>
                  <p className="text-[12px] text-[#6E6E73] dark:text-[#98989D] leading-relaxed">
                    {order.address.street}
                    <br />
                    {order.address.city}
                    {order.address.state && `, ${order.address.state}`}
                    {order.address.postalCode && ` - ${order.address.postalCode}`}
                    <br />
                    {order.address.country}
                  </p>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `${order.address!.street}, ${order.address!.city}, ${order.address!.postalCode}`,
                        "Address"
                      )
                    }
                    className="text-[10px] tracking-wider uppercase font-medium text-[#0A84FF] hover:underline flex items-center gap-1 mt-2"
                  >
                    <Copy className="w-3 h-3" strokeWidth={2} />
                    Copy Address
                  </button>
                </div>
              ) : (
                <p className="text-[12px] text-[#86868B] italic">
                  No shipping address
                </p>
              )}
            </div>
          </div>

          {/* ============ TIMELINE ============ */}
          <div className="admin-card p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[#FFF3E0] flex items-center justify-center">
                <Calendar className="w-4 h-4 text-[#E65100]" strokeWidth={2} />
              </div>
              <h3 className="font-display text-base text-[#1D1D1F] dark:text-white">
                Timeline
              </h3>
            </div>

            <div className="space-y-3">
              {[
                {
                  label: "Order Placed",
                  date: order.createdAt,
                  show: true,
                  color: "bg-[#0A84FF]",
                },
                {
                  label: "Last Updated",
                  date: order.updatedAt,
                  show: order.updatedAt !== order.createdAt,
                  color: "bg-[#7B1FA2]",
                },
                {
                  label: "Shipped",
                  date: order.shippedAt || "",
                  show: !!order.shippedAt,
                  color: "bg-[#00838F]",
                },
                {
                  label: "Delivered",
                  date: order.deliveredAt || "",
                  show: !!order.deliveredAt,
                  color: "bg-[#2E7D32]",
                },
                {
                  label: "Cancelled",
                  date: order.cancelledAt || "",
                  show: !!order.cancelledAt,
                  color: "bg-[#C62828]",
                },
              ]
                .filter((t) => t.show)
                .map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex flex-col items-center pt-1.5">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <div className="w-px h-full min-h-[20px] bg-[#E5E5E7] dark:bg-[#38383A]" />
                    </div>
                    <div className="flex-1 pb-2">
                      <p className="text-[12px] font-medium text-[#1D1D1F] dark:text-white">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-[#86868B] mt-0.5">
                        {formatDate(item.date)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

        </div>

        {/* ==================== RIGHT COLUMN (1/3) ==================== */}
        <div className="space-y-6">

          {/* ============ STATUS UPDATE ============ */}
          <div className="admin-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#E8F5E9] flex items-center justify-center">
                <Save className="w-4 h-4 text-[#2E7D32]" strokeWidth={2} />
              </div>
              <h3 className="font-display text-base text-[#1D1D1F] dark:text-white">
                Update Order
              </h3>
            </div>

            {/* Status */}
            <div className="mb-4">
              <label className="admin-label">Order Status</label>
              <div className="relative">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="admin-input flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    {(() => {
                      const config =
                        STATUS_CONFIG[newStatus] || STATUS_CONFIG.PENDING;
                      const Icon = config.icon;
                      return (
                        <>
                          <Icon
                            className={`w-4 h-4 ${config.color}`}
                            strokeWidth={2}
                          />
                          <span className="text-[13px]">{config.label}</span>
                        </>
                      );
                    })()}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#86868B] transition-transform ${
                      showStatusDropdown ? "rotate-180" : ""
                    }`}
                    strokeWidth={2}
                  />
                </button>

                {showStatusDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowStatusDropdown(false)}
                    />
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#1C1C1E] border border-[#E5E5E7] dark:border-[#38383A] rounded-xl shadow-xl z-20 py-2 overflow-hidden max-h-[300px] overflow-y-auto">
                      {STATUS_OPTIONS.map((status) => {
                        const config = STATUS_CONFIG[status];
                        const Icon = config.icon;
                        return (
                          <button
                            key={status}
                            onClick={() => {
                              setNewStatus(status);
                              setShowStatusDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-[13px] font-body flex items-center justify-between transition-colors ${
                              newStatus === status
                                ? "bg-[#F5F5F7] dark:bg-[#2C2C2E]"
                                : "hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <Icon
                                className={`w-3.5 h-3.5 ${config.color}`}
                                strokeWidth={2}
                              />
                              {config.label}
                            </span>
                            {newStatus === status && (
                              <Check
                                className="w-3.5 h-3.5 text-[#0A84FF]"
                                strokeWidth={2}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Payment Status */}
            <div className="mb-4">
              <label className="admin-label">Payment Status</label>
              <select
                value={newPaymentStatus}
                onChange={(e) => setNewPaymentStatus(e.target.value)}
                className="admin-input cursor-pointer"
              >
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>

            {/* Tracking Number */}
            {(newStatus === "SHIPPED" || newStatus === "DELIVERED") && (
              <>
                <div className="mb-4">
                  <label className="admin-label">Tracking Number</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g., TCS-123456789"
                    className="admin-input"
                  />
                </div>

                <div className="mb-4">
                  <label className="admin-label">Tracking URL (optional)</label>
                  <input
                    type="url"
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    placeholder="https://track.tcs.com.pk/..."
                    className="admin-input"
                  />
                </div>
              </>
            )}

            {/* Save Button */}
            <button
              onClick={updateOrder}
              disabled={saving || !hasChanges}
              className={`admin-btn w-full justify-center ${
                hasChanges
                  ? "admin-btn-primary"
                  : "admin-btn-secondary opacity-50"
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" strokeWidth={2} />
                  {hasChanges ? "Save Changes" : "No Changes"}
                </>
              )}
            </button>
          </div>

          {/* ============ QUICK INFO ============ */}
          <div className="admin-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#F5F5F7] dark:bg-[#2C2C2E] flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-[#6E6E73]" strokeWidth={2} />
              </div>
              <h3 className="font-display text-base text-[#1D1D1F] dark:text-white">
                Quick Info
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] tracking-wider uppercase text-[#86868B] font-medium">
                  Payment
                </span>
                <span className="text-[12px] font-medium text-[#1D1D1F] dark:text-white">
                  {order.paymentMethod}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] tracking-wider uppercase text-[#86868B] font-medium">
                  Payment Status
                </span>
                <span
                  className={`text-[11px] tracking-wider uppercase font-medium px-2 py-0.5 rounded ${
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
                <span className="text-[11px] tracking-wider uppercase text-[#86868B] font-medium">
                  Total Items
                </span>
                <span className="text-[12px] font-medium text-[#1D1D1F] dark:text-white">
                  {order.items.length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] tracking-wider uppercase text-[#86868B] font-medium">
                  Order ID
                </span>
                <button
                  onClick={() => copyToClipboard(order.id, "Order ID")}
                  className="text-[11px] font-mono text-[#6E6E73] dark:text-[#98989D] hover:text-[#1D1D1F] dark:hover:text-white transition-colors flex items-center gap-1"
                >
                  {order.id.slice(0, 8)}...
                  {copied === "Order ID" ? (
                    <Check className="w-3 h-3 text-[#2E7D32]" strokeWidth={2} />
                  ) : (
                    <Copy className="w-3 h-3" strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ============ NOTES ============ */}
          {order.notes && (
            <div className="admin-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#FFF3E0] flex items-center justify-center">
                  <AlertCircle
                    className="w-4 h-4 text-[#E65100]"
                    strokeWidth={2}
                  />
                </div>
                <h3 className="font-display text-base text-[#1D1D1F] dark:text-white">
                  Customer Notes
                </h3>
              </div>
              <p className="text-[13px] text-[#6E6E73] dark:text-[#98989D] leading-relaxed whitespace-pre-wrap">
                {order.notes}
              </p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}