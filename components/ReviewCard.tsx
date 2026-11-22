"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Star, MapPin } from "lucide-react";
import { Review } from "@/types";

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={13}
          fill={star <= rating ? "var(--bm-gold)" : "transparent"}
          color={star <= rating ? "var(--bm-gold)" : "rgba(var(--bm-ink-rgb),0.2)"}
        />
      ))}
    </div>
  );
}

export default function ReviewCard({
  review,
  index = 0,
}: {
  review: Review;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{
        background: "var(--bm-deep)",
        border: "1px solid var(--bm-forest)",
        borderRadius: "16px",
        overflow: "hidden",
        breakInside: "avoid",
        marginBottom: "1.5rem",
        transition: "all 0.3s ease",
      }}
      className="review-card"
    >
      {/* ── Photo if exists ── */}
      {review.image_urls && review.image_urls.length > 0 && (
        <div
          style={{
            position: "relative",
            height: "200px",
            overflow: "hidden",
          }}
        >
          <Image
            src={review.image_urls[0]}
            alt={review.title}
            fill
            style={{ objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, transparent 50%, rgba(17,24,20,0.9) 100%)",
            }}
          />
        </div>
      )}

      {/* ── Content ── */}
      <div style={{ padding: "1.25rem" }}>

        {/* Stars + trek name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.75rem",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <StarRating rating={review.rating} />
          {review.adventure && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <MapPin size={10} color="var(--bm-sage)" />
              <span
                style={{
                  fontFamily: "var(--font-syne)",
                  fontSize: "0.62rem",
                  fontWeight: 600,
                  color: "var(--bm-sage)",
                  letterSpacing: "0.5px",
                }}
              >
                {review.adventure.title}
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <h4
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 700,
            fontSize: "0.95rem",
            color: "var(--bm-cream)",
            marginBottom: "0.5rem",
            lineHeight: 1.3,
          }}
        >
          {review.title}
        </h4>

        {/* Content */}
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.82rem",
            color: "rgba(var(--bm-ink-rgb),0.75)",
            lineHeight: 1.7,
            marginBottom: "1rem",
            display: "-webkit-box",
            WebkitLineClamp: 4,
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
            gap: "0.6rem",
            paddingTop: "0.75rem",
            borderTop: "1px solid var(--bm-forest)",
          }}
        >
          {/* Avatar circle */}
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "var(--bm-moss)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-syne)",
              fontWeight: 700,
              fontSize: "0.75rem",
              color: "var(--bm-gold-text)",
              flexShrink: 0,
            }}
          >
            {review.reviewer_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 600,
                fontSize: "0.82rem",
                color: "var(--bm-cream)",
              }}
            >
              {review.reviewer_name}
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.68rem",
                color: "rgba(var(--bm-ink-rgb),0.65)",
                marginTop: "1px",
              }}
            >
              {new Date(review.created_at).toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .review-card:hover {
          border-color: rgba(212,160,23,0.25) !important;
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.3);
        }
      `}</style>
    </motion.div>
  );
}
