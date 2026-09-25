"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Star,
  CheckCircle,
  Trash2,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Review {
  id: string;
  rating: number;
  title?: string | null;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  user: { id: string; name: string; email: string };
  product: { id: string; name: string; slug: string; images: string[] };
}

export default function AdminReviewsPage() {
  const { loadFromStorage } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (id: string) => {
    const token = localStorage.getItem("zaem_token");
    if (!token) return;

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
        setMessage({ type: "success", text: "Review approved" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    const token = localStorage.getItem("zaem_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/reviews/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        setMessage({ type: "success", text: "Review deleted" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.comment?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      !filterStatus ||
      (filterStatus === "pending" && !r.isApproved) ||
      (filterStatus === "approved" && r.isApproved);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: reviews.length,
    pending: reviews.filter((r) => !r.isApproved).length,
    approved: reviews.filter((r) => r.isApproved).length,
    avgRating:
      reviews.length > 0
        ? (
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          ).toFixed(1)
        : "0.0",
  };

  return (
    <div>

      {/* Header */}
      <div className="mb-10">
        <p className="text-label text-gold mb-3">Moderate</p>
        <h1 className="display-lg mb-3">Reviews</h1>
        <p className="text-muted font-body text-sm">
          {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
        </p>
      </div>

      {message.text && (
        <div className="mb-6 p-4 bg-gold/10 border-l-2 border-gold text-sm font-body text-gold">
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-ivory border border-ink/10 p-5">
          <MessageSquare className="w-5 h-5 text-blue-500 mb-4" strokeWidth={1.5} />
          <p className="font-display text-2xl mb-1">{stats.total}</p>
          <p className="text-label text-muted">Total</p>
        </div>
        <div className="bg-ivory border border-ink/10 p-5">
          <CheckCircle className="w-5 h-5 text-orange-500 mb-4" strokeWidth={1.5} />
          <p className="font-display text-2xl mb-1">{stats.pending}</p>
          <p className="text-label text-muted">Pending</p>
        </div>
        <div className="bg-ivory border border-ink/10 p-5">
          <ThumbsUp className="w-5 h-5 text-green-500 mb-4" strokeWidth={1.5} />
          <p className="font-display text-2xl mb-1">{stats.approved}</p>
          <p className="text-label text-muted">Approved</p>
        </div>
        <div className="bg-ivory border border-ink/10 p-5">
          <Star className="w-5 h-5 text-gold mb-4" strokeWidth={1.5} />
          <p className="font-display text-2xl mb-1">{stats.avgRating}</p>
          <p className="text-label text-muted">Avg Rating</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-ivory border border-ink/10 p-4 md:p-5 mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            strokeWidth={1.5}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews..."
            className="w-full pl-11 pr-4 py-3 bg-transparent border border-ink/20 focus:border-gold outline-none text-sm font-body transition-colors"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 bg-transparent border border-ink/20 focus:border-gold outline-none text-sm font-body transition-colors"
        >
          <option value="">All Reviews</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      {/* Loading / Empty */}
      {loading ? (
        <div className="bg-ivory border border-ink/10 p-20 text-center">
          <p className="font-display text-2xl text-muted">Loading...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-ivory border border-ink/10 p-20 text-center">
          <MessageSquare
            className="w-16 h-16 text-muted mx-auto mb-6"
            strokeWidth={1}
          />
          <p className="font-display text-2xl mb-4">No reviews yet.</p>
          <p className="text-muted font-body text-sm">
            Customer reviews will appear here for moderation.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className={`bg-ivory border p-6 ${
                review.isApproved ? "border-ink/10" : "border-gold/30 bg-gold/5"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-6">

                {/* Product Image */}
                <div className="w-16 h-20 bg-bone shrink-0 overflow-hidden">
                  {review.product?.images?.[0] ? (
                    <img
                      src={review.product.images[0]}
                      alt={review.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-display text-sm text-ink/10">Z</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">

                  {/* Product + User */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                    <div>
                      <p className="font-display text-base">
                        {review.product?.name}
                      </p>
                      <p className="text-xs text-muted font-body mt-1">
                        By {review.user?.name} ·{" "}
                        {new Date(review.createdAt).toLocaleDateString("en-PK")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < review.rating
                                ? "fill-gold text-gold"
                                : "text-muted"
                            }`}
                            strokeWidth={1.5}
                          />
                        ))}
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-label px-2 py-1 ${
                          review.isApproved
                            ? "bg-green-50 text-green-700"
                            : "bg-gold/20 text-gold"
                        }`}
                      >
                        {review.isApproved ? "Approved" : "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Review Text */}
                  {review.title && (
                    <p className="font-display text-base mb-2">
                      {review.title}
                    </p>
                  )}
                  <p className="text-sm text-muted font-body leading-relaxed mb-4">
                    {review.comment}
                  </p>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-ink/10">
                    {!review.isApproved && (
                      <button
                        onClick={() => handleApprove(review.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 text-label hover:bg-green-100 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="flex items-center gap-2 px-4 py-2 border border-ink/20 text-label hover:border-red-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Delete
                    </button>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}