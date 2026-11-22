"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notifyContentUpdated } from "@/lib/live-refresh";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Check, X, Trash2, Search } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

import { Review } from "@/types";

export default function AdminReviewsClient({
  initialReviews,
}: {
  initialReviews: Review[];
}) {
  const router = useRouter();
  const [reviews, setReviews]         = useState(initialReviews);
  const [search, setSearch]           = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ── Filter ──
  const filtered = reviews.filter((r) => {
    const matchSearch =
      r.reviewer_name.toLowerCase().includes(search.toLowerCase()) ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.adventure?.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    all:      reviews.length,
    pending:  reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
  };

  // ── Approve ──
  const approveReview = async (id: string) => {
  setReviews((prev) =>
    prev.map((r) => r.id === id ? { ...r, status: "approved" as const } : r)
  );

  await fetch("/api/reviews", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status: "approved" }),
  });

  router.refresh();
  notifyContentUpdated();
  toast.success("Review approved — now live ✅");
};

const rejectReview = async (id: string) => {
  setReviews((prev) => prev.filter((r) => r.id !== id));

  await fetch("/api/reviews", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status: "rejected" }),
  });

  router.refresh();
  notifyContentUpdated();
  toast.success("Review rejected and deleted");
};

const deleteReview = async (id: string) => {
  setReviews((prev) => prev.filter((r) => r.id !== id));
  setDeleteConfirm(null);

  await fetch(`/api/reviews?id=${id}`, { method: "DELETE" });
  router.refresh();
  notifyContentUpdated();
  toast.success("Review deleted");
};

  return (
    <div style={{ padding: "2rem" }}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: "2rem" }}
      >
        <h1
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize: "1.8rem",
            color: "var(--bm-cream)",
            marginBottom: "0.3rem",
          }}
        >
          Reviews
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.95rem",
            color: "rgba(var(--bm-ink-rgb),0.68)",
          }}
        >
          {counts.pending > 0 && (
            <span style={{ color: "var(--bm-gold-text)" }}>
              {counts.pending} pending approval ·{" "}
            </span>
          )}
          {counts.approved} approved · {counts.rejected} rejected
        </p>
      </motion.div>

      {/* ── Status tabs ── */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        {(["all", "pending", "approved", "rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 600,
              fontSize: "0.9rem",
              padding: "0.45rem 1rem",
              borderRadius: "999px",
              border: "1px solid",
              cursor: "pointer",
              transition: "all 0.2s",
              borderColor:
                filterStatus === s ? "var(--bm-gold)" : "var(--bm-forest)",
              background:
                filterStatus === s ? "rgba(212,160,23,0.12)" : "transparent",
              color:
                filterStatus === s ? "var(--bm-gold-text)" : "rgba(var(--bm-ink-rgb),0.6)",
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s]})
          </button>
        ))}
      </div>

      {/* ── Search ── */}
      <div style={{ position: "relative", marginBottom: "1.5rem" }}>
        <Search
          size={15}
          color="rgba(var(--bm-ink-rgb),0.3)"
          style={{
            position: "absolute",
            left: "0.85rem",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        />
        <input
          type="text"
          placeholder="Search by name, title or adventure..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "0.7rem 1rem 0.7rem 2.5rem",
            borderRadius: "10px",
            border: "1px solid var(--bm-forest)",
            background: "var(--bm-deep)",
            color: "var(--bm-cream)",
            fontFamily: "var(--font-body)",
            fontSize: "0.95rem",
            outline: "none",
          }}
        />
      </div>

      {/* ── Reviews grid ── */}
      {filtered.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {filtered.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <ReviewCard
                review={review}
                onApprove={() => approveReview(review.id)}
                onReject={() => rejectReview(review.id)}
                onDelete={() =>
                  deleteConfirm === review.id
                    ? deleteReview(review.id)
                    : setDeleteConfirm(review.id)
                }
                deleteConfirm={deleteConfirm === review.id}
                onCancelDelete={() => setDeleteConfirm(null)}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⭐</div>
          <p
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "1rem",
              color: "rgba(var(--bm-ink-rgb),0.6)",
            }}
          >
            No reviews found
          </p>
        </div>
      )}
    </div>
  );
}

// ── Review Card ──────────────────────────────────────────────
function ReviewCard({
  review,
  onApprove,
  onReject,
  onDelete,
  deleteConfirm,
  onCancelDelete,
}: {
  review: Review;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  deleteConfirm: boolean;
  onCancelDelete: () => void;
}) {
  const statusConfig = {
    pending:  { bg: "rgba(212,160,23,0.1)",  border: "rgba(212,160,23,0.25)",  text: "var(--bm-gold-text)",  label: "Pending" },
    approved: { bg: "rgba(122,184,138,0.1)", border: "rgba(122,184,138,0.25)", text: "var(--bm-mint)",  label: "Live" },
    rejected: { bg: "rgba(192,57,43,0.1)",   border: "rgba(192,57,43,0.25)",   text: "var(--bm-red)",   label: "Rejected" },
  };
  const config = statusConfig[review.status];

  return (
    <div
      style={{
        background: "var(--bm-deep)",
        border: `1px solid ${
          review.status === "pending"
            ? "rgba(212,160,23,0.2)"
            : "var(--bm-forest)"
        }`,
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      {/* Photos if any */}
      {review.image_urls && review.image_urls.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "2px",
            height: "140px",
          }}
        >
          {review.image_urls.slice(0, 3).map((url, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Image
                src={url}
                alt={`Review photo ${i + 1}`}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: "1.25rem" }}>
        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "0.75rem",
            gap: "0.5rem",
          }}
        >
          <div>
            {/* Stars */}
            <div
              style={{
                display: "flex",
                gap: "2px",
                marginBottom: "0.35rem",
              }}
            >
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={13}
                  fill={s <= review.rating ? "var(--bm-gold)" : "transparent"}
                  color={
                    s <= review.rating
                      ? "var(--bm-gold)"
                      : "rgba(var(--bm-ink-rgb),0.2)"
                  }
                />
              ))}
            </div>

            {/* Trek */}
            {review.adventure && (
              <span
                style={{
                  fontFamily: "var(--font-syne)",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "var(--bm-sage)",
                  letterSpacing: "0.5px",
                }}
              >
                {review.adventure.title}
              </span>
            )}
          </div>

          {/* Status badge */}
          <span
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 700,
              fontSize: "0.75rem",
              letterSpacing: "0.5px",
              padding: "3px 8px",
              borderRadius: "999px",
              background: config.bg,
              color: config.text,
              border: `1px solid ${config.border}`,
              whiteSpace: "nowrap",
            }}
          >
            {config.label}
          </span>
        </div>

        {/* Title */}
        <h4
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--bm-cream)",
            marginBottom: "0.4rem",
            lineHeight: 1.3,
          }}
        >
          {review.title}
        </h4>

        {/* Content */}
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            color: "rgba(var(--bm-ink-rgb),0.72)",
            lineHeight: 1.65,
            marginBottom: "1rem",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          "{review.content}"
        </p>

        {/* Reviewer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1rem",
            paddingBottom: "1rem",
            borderBottom: "1px solid var(--bm-forest)",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "var(--bm-moss)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-syne)",
              fontWeight: 700,
              fontSize: "0.8rem",
              color: "var(--bm-gold-text)",
              flexShrink: 0,
            }}
          >
            {review.reviewer_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div
              style={{
                // Body font: Syne's flat-cut g/j tails look clipped at this size.
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "var(--bm-cream)",
              }}
            >
              {review.reviewer_name}
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.78rem",
                color: "rgba(var(--bm-ink-rgb),0.6)",
              }}
            >
              {review.reviewer_email}
            </div>
          </div>
          <span
            style={{
              marginLeft: "auto",
              fontFamily: "var(--font-body)",
              fontSize: "0.78rem",
              color: "rgba(var(--bm-ink-rgb),0.6)",
            }}
          >
            {new Date(review.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>

        {/* Action buttons */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          {/* Pending — show approve + reject */}
          {review.status === "pending" && (
            <>
              <button
                onClick={onApprove}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  fontFamily: "var(--font-syne)",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  padding: "0.6rem 0.75rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "rgba(122,184,138,0.15)",
                  color: "var(--bm-mint)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                className="approve-btn"
              >
                <Check size={14} />
                Approve
              </button>
              <button
                onClick={onReject}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  fontFamily: "var(--font-syne)",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  padding: "0.6rem 0.75rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "rgba(192,57,43,0.12)",
                  color: "var(--bm-red)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                className="reject-btn"
              >
                <X size={14} />
                Reject
              </button>
            </>
          )}

          {/* Approved — show delete */}
          {review.status === "approved" && (
            <>
              {deleteConfirm ? (
                <>
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.88rem",
                      color: "rgba(var(--bm-ink-rgb),0.72)",
                      alignSelf: "center",
                      flex: 1,
                    }}
                  >
                    Delete this review?
                  </span>
                  <button
                    onClick={onDelete}
                    style={{
                      fontFamily: "var(--font-syne)",
                      fontWeight: 700,
                      fontSize: "0.88rem",
                      padding: "0.5rem 0.85rem",
                      borderRadius: "8px",
                      border: "none",
                      background: "var(--bm-red)",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={onCancelDelete}
                    style={{
                      fontFamily: "var(--font-syne)",
                      fontWeight: 600,
                      fontSize: "0.88rem",
                      padding: "0.5rem 0.85rem",
                      borderRadius: "8px",
                      border: "1px solid var(--bm-forest)",
                      background: "transparent",
                      color: "var(--bm-sand)",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={onDelete}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontFamily: "var(--font-syne)",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    padding: "0.55rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(192,57,43,0.2)",
                    background: "transparent",
                    color: "rgba(192,57,43,0.6)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  className="delete-btn"
                >
                  <Trash2 size={13} />
                  Delete Review
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        .approve-btn:hover {
          background: rgba(122,184,138,0.25) !important;
        }
        .reject-btn:hover {
          background: rgba(192,57,43,0.2) !important;
        }
        .delete-btn:hover {
          background: rgba(192,57,43,0.1) !important;
          color: var(--bm-red) !important;
        }
      `}</style>
    </div>
  );
}