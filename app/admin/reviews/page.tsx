"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Star,
  CheckCircle,
  Trash2,
  MessageSquare,
  ThumbsUp,
  X,
  Loader2,
  AlertCircle,
  Filter,
  Reply,
  Send,
  Eye,
  EyeOff,
  TrendingUp,
  Award,
  ChevronDown,
  Camera,
  Check,
  User,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ==================== TYPES ====================
interface Review {
  id: string;
  rating: number;
  title?: string | null;
  comment: string;
  images?: string[];
  isApproved: boolean;
  isVerified?: boolean;
  helpfulCount?: number;
  adminReply?: string | null;
  adminRepliedAt?: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
  product: { id: string; name: string; slug: string; images: string[] };
}

type StatusFilter = "all" | "pending" | "approved";
type RatingFilter = "all" | "5" | "4" | "3" | "2" | "1";

// ==================== HELPERS ====================
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const getAvatarColor = (name: string) => {
  const colors = [
    "bg-[#E3F2FD] text-[#0A84FF]",
    "bg-[#F3E5F5] text-[#7B1FA2]",
    "bg-[#FFF3E0] text-[#E65100]",
    "bg-[#E8F5E9] text-[#2E7D32]",
    "bg-[#FFEBEE] text-[#C62828]",
    "bg-[#E0F7FA] text-[#00838F]",
    "bg-[#FCE4EC] text-[#C2185B]",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// ==================== MAIN COMPONENT ====================
export default function AdminReviewsPage() {
  const { loadFromStorage } = useAuthStore();

  // ==================== STATE ====================
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("all");
  const [filterRating, setFilterRating] = useState<RatingFilter>("all");
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Reply modal
  const [replyModal, setReplyModal] = useState<{
    id: string;
    existing: string;
  } | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySaving, setReplySaving] = useState(false);

  // ==================== INIT ====================
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // ==================== FETCH ====================
  const fetchReviews = async () => {
    const token = localStorage.getItem("zaem_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/reviews/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setReviews(data.data.reviews);
    } catch (error) {
      console.error(error);
      showToast("error", "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==================== TOAST ====================
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // ==================== APPROVE ====================
  const handleApprove = async (id: string) => {
    const token = localStorage.getItem("zaem_token");
    if (!token) return;

    setProcessing(id);
    try {
      const res = await fetch(`${API_URL}/api/reviews/${id}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isApproved: true } : r))
        );
        showToast("success", "Review approved");
      } else {
        showToast("error", data.message || "Failed to approve");
      }
    } catch (error) {
      console.error(error);
      showToast("error", "Network error");
    } finally {
      setProcessing(null);
    }
  };

  // ==================== REJECT (DELETE) ====================
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const token = localStorage.getItem("zaem_token");
    if (!token) return;

    setProcessing(deleteConfirm.id);
    try {
      const res = await fetch(`${API_URL}/api/reviews/${deleteConfirm.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== deleteConfirm.id));
        showToast("success", "Review deleted");
      }
    } catch (error) {
      console.error(error);
      showToast("error", "Delete failed");
    } finally {
      setProcessing(null);
      setDeleteConfirm(null);
    }
  };

  // ==================== ADMIN REPLY ====================
  const handleSendReply = async () => {
    if (!replyModal || !replyText.trim()) return;
    const token = localStorage.getItem("zaem_token");
    if (!token) return;

    setReplySaving(true);
    try {
      const res = await fetch(`${API_URL}/api/reviews/${replyModal.id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reply: replyText.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === replyModal.id
              ? {
                  ...r,
                  adminReply: replyText.trim(),
                  adminRepliedAt: new Date().toISOString(),
                }
              : r
          )
        );
        showToast("success", "Reply sent");
        setReplyModal(null);
        setReplyText("");
      } else {
        showToast("error", data.message || "Failed to send reply");
      }
    } catch (error) {
      console.error(error);
      showToast("error", "Network error");
    } finally {
      setReplySaving(false);
    }
  };

  // ==================== FILTERS ====================
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      // Search
      const matchesSearch =
        !search ||
        r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.comment?.toLowerCase().includes(search.toLowerCase());

      // Status
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "pending" && !r.isApproved) ||
        (filterStatus === "approved" && r.isApproved);

      // Rating
      const matchesRating =
        filterRating === "all" || r.rating === parseInt(filterRating);

      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [reviews, search, filterStatus, filterRating]);

  // ==================== STATS ====================
  const stats = useMemo(() => {
    const total = reviews.length;
    const pending = reviews.filter((r) => !r.isApproved).length;
    const approved = reviews.filter((r) => r.isApproved).length;
    const avgRating =
      total > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
        : "0.0";

    // Rating breakdown
    const breakdown = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((r) => r.rating === star).length,
      percent: total > 0 ? Math.round((reviews.filter((r) => r.rating === star).length / total) * 100) : 0,
    }));

    return { total, pending, approved, avgRating, breakdown };
  }, [reviews]);

  // ==================== FILTERS ====================
  const hasActiveFilters =
    !!search || filterStatus !== "all" || filterRating !== "all";

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("all");
    setFilterRating("all");
  };

  // ==================== STAT CARDS ====================
  const STAT_CARDS = [
    {
      label: "Total Reviews",
      value: stats.total.toString(),
      icon: MessageSquare,
      accent: "text-[#0A84FF]",
      bg: "bg-[#E3F2FD]",
    },
    {
      label: "Pending",
      value: stats.pending.toString(),
      icon: AlertCircle,
      accent: "text-[#E65100]",
      bg: "bg-[#FFF3E0]",
    },
    {
      label: "Approved",
      value: stats.approved.toString(),
      icon: CheckCircle,
      accent: "text-[#2E7D32]",
      bg: "bg-[#E8F5E9]",
    },
    {
      label: "Avg Rating",
      value: stats.avgRating,
      icon: Star,
      accent: "text-[#E65100]",
      bg: "bg-[#FFF3E0]",
    },
  ];

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
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#86868B] font-medium mb-3">
            Moderate
          </p>
          <h1 className="font-display text-3xl md:text-5xl lg:text-6xl text-[#1D1D1F] dark:text-white mb-3">
            Reviews
          </h1>
          <p className="text-[#6E6E73] dark:text-[#98989D] font-body text-sm">
            {stats.total} {stats.total === 1 ? "review" : "reviews"} ·{" "}
            {stats.pending} pending
          </p>
        </div>
      </div>

      {/* ==================== STATS GRID ==================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="admin-card p-4 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div
                className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3`}
              >
                <Icon className={`w-5 h-5 ${card.accent}`} strokeWidth={2} />
              </div>
              <p className="font-display text-lg md:text-2xl text-[#1D1D1F] dark:text-white mb-1 truncate">
                {card.value}
              </p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#86868B] font-medium">
                {card.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* ==================== RATING BREAKDOWN ==================== */}
      {stats.total > 0 && (
        <div className="admin-card p-5 mb-6">
          <h3 className="font-display text-base text-[#1D1D1F] dark:text-white mb-4">
            Rating Breakdown
          </h3>
          <div className="space-y-2.5">
            {stats.breakdown.map((item) => (
              <div key={item.star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12 shrink-0">
                  <span className="text-[12px] font-medium text-[#1D1D1F] dark:text-white">
                    {item.star}
                  </span>
                  <Star
                    className="w-3 h-3 fill-[#E65100] text-[#E65100]"
                    strokeWidth={2}
                  />
                </div>
                <div className="flex-1 h-1.5 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.star === 5
                        ? "bg-[#2E7D32]"
                        : item.star === 4
                        ? "bg-[#7CB342]"
                        : item.star === 3
                        ? "bg-[#E65100]"
                        : item.star === 2
                        ? "bg-[#EF6C00]"
                        : "bg-[#C62828]"
                    }`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 w-16 justify-end shrink-0">
                  <span className="text-[11px] text-[#86868B]">
                    {item.percent}%
                  </span>
                  <span className="text-[12px] font-medium text-[#1D1D1F] dark:text-white w-6 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== FILTERS ==================== */}
      <div className="admin-card p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B]"
              strokeWidth={2}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer, product, or review text..."
              className="admin-input pl-10"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] rounded-full transition-colors"
              >
                <X className="w-3.5 h-3.5 text-[#86868B]" strokeWidth={2} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-lg p-1">
            {[
              { value: "all", label: "All" },
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilterStatus(opt.value as StatusFilter)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-medium tracking-wide uppercase transition-all ${
                  filterStatus === opt.value
                    ? "bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white shadow-sm"
                    : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
                }`}
              >
                {opt.label}
                {opt.value === "pending" && stats.pending > 0 && (
                  <span className="ml-1.5 text-[9px] bg-[#E65100] text-white px-1.5 py-0.5 rounded-full">
                    {stats.pending}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Rating Filter */}
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value as RatingFilter)}
            className="admin-input md:min-w-[140px] cursor-pointer"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E5E5E7] dark:border-[#38383A] flex-wrap">
            <span className="text-[10px] tracking-wider uppercase text-[#86868B] font-medium">
              Filters:
            </span>
            {search && (
              <span className="admin-badge admin-badge-neutral">
                Search: {search}
              </span>
            )}
            {filterStatus !== "all" && (
              <span className="admin-badge admin-badge-neutral">
                Status: {filterStatus}
              </span>
            )}
            {filterRating !== "all" && (
              <span className="admin-badge admin-badge-neutral">
                Rating: {filterRating}★
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-[11px] text-[#0A84FF] hover:underline font-medium ml-auto"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ==================== LOADING ==================== */}
      {loading ? (
        <div className="admin-card p-20 text-center">
          <Loader2
            className="w-6 h-6 text-[#86868B] animate-spin mx-auto mb-3"
            strokeWidth={2}
          />
          <p className="text-[11px] tracking-[0.3em] uppercase text-[#86868B]">
            Loading Reviews
          </p>
        </div>
      ) : filteredReviews.length === 0 ? (
        /* ==================== EMPTY STATE ==================== */
        <div className="admin-card p-16 text-center">
          <div className="w-16 h-16 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare
              className="w-6 h-6 text-[#86868B]"
              strokeWidth={1.5}
            />
          </div>
          <h3 className="font-display text-xl text-[#1D1D1F] dark:text-white mb-2">
            {hasActiveFilters ? "No reviews match" : "No reviews yet"}
          </h3>
          <p className="text-[13px] text-[#86868B] mb-6 max-w-md mx-auto">
            {hasActiveFilters
              ? "Try adjusting your filters or search terms"
              : "Customer reviews will appear here for moderation"}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="admin-btn admin-btn-secondary"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        /* ==================== REVIEWS LIST ==================== */
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className={`admin-card p-5 ${
                !review.isApproved ? "border-[#FFB74D] dark:border-[#FFB74D]" : ""
              }`}
            >
              <div className="flex flex-col md:flex-row gap-5">

                {/* Product Image */}
                <Link
                  href={`/product/${review.product?.slug}`}
                  target="_blank"
                  className="w-20 h-24 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-lg shrink-0 overflow-hidden hover:opacity-80 transition-opacity"
                >
                  {review.product?.images?.[0] ? (
                    <img
                      src={review.product.images[0]}
                      alt={review.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MessageSquare
                        className="w-6 h-6 text-[#86868B]"
                        strokeWidth={1.5}
                      />
                    </div>
                  )}
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0">

                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <Link
                        href={`/product/${review.product?.slug}`}
                        target="_blank"
                        className="font-display text-base text-[#1D1D1F] dark:text-white hover:underline block truncate max-w-[300px]"
                      >
                        {review.product?.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-2">
                        <div
                          className={`w-6 h-6 rounded-full ${getAvatarColor(
                            review.user?.name || "A"
                          )} flex items-center justify-center text-[10px] font-medium shrink-0`}
                        >
                          {getInitials(review.user?.name || "A")}
                        </div>
                        <p className="text-[11px] text-[#86868B] truncate">
                          {review.user?.name} ·{" "}
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-PK",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Rating */}
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < review.rating
                                ? "fill-[#E65100] text-[#E65100]"
                                : "text-[#D2D2D7] dark:text-[#48484A]"
                            }`}
                            strokeWidth={1.5}
                          />
                        ))}
                      </div>

                      {/* Badges */}
                      {review.isVerified && (
                        <span className="inline-flex items-center gap-1 text-[9px] tracking-wider uppercase font-medium px-2 py-1 rounded bg-[#E8F5E9] text-[#2E7D32]">
                          <Check className="w-2.5 h-2.5" strokeWidth={3} />
                          Verified
                        </span>
                      )}

                      <span
                        className={`text-[9px] tracking-wider uppercase font-medium px-2 py-1 rounded ${
                          review.isApproved
                            ? "bg-[#E8F5E9] text-[#2E7D32]"
                            : "bg-[#FFF3E0] text-[#E65100]"
                        }`}
                      >
                        {review.isApproved ? "Approved" : "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Review Title */}
                  {review.title && (
                    <p className="font-display text-base text-[#1D1D1F] dark:text-white mb-2">
                      {review.title}
                    </p>
                  )}

                  {/* Review Comment */}
                  <p className="text-[13px] text-[#6E6E73] dark:text-[#98989D] font-body leading-relaxed mb-3">
                    {review.comment}
                  </p>

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      {review.images.slice(0, 4).map((img, idx) => (
                        <a
                          key={idx}
                          href={img}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-md overflow-hidden hover:opacity-80 transition-opacity"
                        >
                          <img
                            src={img}
                            alt={`Review ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                      {review.images.length > 4 && (
                        <span className="text-[11px] text-[#86868B]">
                          +{review.images.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Helpful Count */}
                  {(review.helpfulCount || 0) > 0 && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#86868B] mb-3">
                      <ThumbsUp className="w-3 h-3" strokeWidth={2} />
                      {review.helpfulCount} people found this helpful
                    </div>
                  )}

                  {/* Admin Reply */}
                  {review.adminReply && (
                    <div className="bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-lg p-3 mb-3 border-l-2 border-[#0A84FF]">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Reply
                          className="w-3 h-3 text-[#0A84FF]"
                          strokeWidth={2}
                        />
                        <p className="text-[10px] tracking-wider uppercase font-medium text-[#0A84FF]">
                          Your Reply
                        </p>
                      </div>
                      <p className="text-[12px] text-[#6E6E73] dark:text-[#98989D] leading-relaxed">
                        {review.adminReply}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-[#E5E5E7] dark:border-[#38383A]">
                    {!review.isApproved && (
                      <button
                        onClick={() => handleApprove(review.id)}
                        disabled={processing === review.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F5E9] text-[#2E7D32] text-[11px] tracking-wider uppercase font-medium rounded-md hover:bg-[#C8E6C9] transition-colors disabled:opacity-50"
                      >
                        {processing === review.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5" strokeWidth={2} />
                        )}
                        Approve
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setReplyModal({
                          id: review.id,
                          existing: review.adminReply || "",
                        });
                        setReplyText(review.adminReply || "");
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E3F2FD] text-[#0A84FF] text-[11px] tracking-wider uppercase font-medium rounded-md hover:bg-[#BBDEFB] transition-colors"
                    >
                      <Reply className="w-3.5 h-3.5" strokeWidth={2} />
                      {review.adminReply ? "Edit Reply" : "Reply"}
                    </button>

                    <button
                      onClick={() =>
                        setDeleteConfirm({
                          id: review.id,
                          name: review.user?.name || "this review",
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] tracking-wider uppercase font-medium rounded-md border border-[#E5E5E7] dark:border-[#38383A] text-[#6E6E73] dark:text-[#98989D] hover:border-[#C62828] hover:text-[#C62828] transition-colors ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==================== DELETE CONFIRM MODAL ==================== */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
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
                  Delete Review?
                </h3>
                <p className="text-[13px] text-[#6E6E73] dark:text-[#98989D] font-body leading-relaxed">
                  Delete{" "}
                  <strong className="text-[#1D1D1F] dark:text-white">
                    {deleteConfirm.name}
                  </strong>
                  &apos;s review? This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="admin-btn admin-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={processing === deleteConfirm.id}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-lg text-[13px] font-medium transition-colors disabled:opacity-50"
              >
                {processing === deleteConfirm.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" strokeWidth={2} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== REPLY MODAL ==================== */}
      {replyModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setReplyModal(null)}
          />
          <div className="relative bg-white dark:bg-[#1C1C1E] max-w-lg w-full p-6 rounded-2xl shadow-2xl admin-scale-in">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 bg-[#E3F2FD] rounded-full flex items-center justify-center shrink-0">
                <Reply className="w-6 h-6 text-[#0A84FF]" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl text-[#1D1D1F] dark:text-white mb-2">
                  {replyModal.existing ? "Edit Reply" : "Reply to Review"}
                </h3>
                <p className="text-[12px] text-[#6E6E73] dark:text-[#98989D]">
                  Your reply will be visible publicly on the product page.
                </p>
              </div>
            </div>

            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={5}
              placeholder="Thank you for your feedback..."
              className="admin-input resize-none mb-4"
              autoFocus
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setReplyModal(null)}
                className="admin-btn admin-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReply}
                disabled={replySaving || !replyText.trim()}
                className="admin-btn admin-btn-primary disabled:opacity-50"
              >
                {replySaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" strokeWidth={2} />
                    Send Reply
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}