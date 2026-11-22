"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ReviewCard from "./ReviewCard";
import { Review } from "@/types";

export default function ReviewsSection({ reviews: allReviews }: { reviews: Review[] }) {
  // show max 4 on homepage
  const reviews = allReviews
    .filter((r) => r.status === "approved")
    .slice(0, 4);

  return (
    <section
      style={{
        padding: "6rem 1.5rem",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* ── Heading ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: "3rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <span
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "var(--bm-gold-text)",
              display: "block",
              marginBottom: "0.75rem",
            }}
          >
            ✦ Real Experiences
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 700,
              color: "var(--bm-cream)",
              lineHeight: 1.2,
            }}
          >
            What Trekkers{" "}
            <em style={{ color: "var(--bm-gold-text)", fontStyle: "italic" }}>
              Say
            </em>
          </h2>
        </div>

        <Link
          href="/reviews"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontFamily: "var(--font-syne)",
            fontWeight: 600,
            fontSize: "0.85rem",
            color: "var(--bm-gold-text)",
            textDecoration: "none",
          }}
          className="view-all-link"
        >
          All Reviews
          <ArrowRight size={16} />
        </Link>
      </motion.div>

      {/* ── Pinterest masonry grid ── */}
      <div
        style={{
          columns: "repeat(auto-fill, minmax(280px, 1fr))",
          columnGap: "1.5rem",
        }}
      >
        {reviews.map((review, i) => (
          <ReviewCard key={review.id} review={review} index={i} />
        ))}
      </div>

      {/* ── Bottom CTA ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: "center", marginTop: "3rem" }}
      >
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            color: "rgba(var(--bm-ink-rgb),0.7)",
            marginBottom: "1.25rem",
          }}
        >
          Been on a BroMountain adventure? Share your experience!
        </p>
        <Link
          href="/reviews#share"
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 700,
            fontSize: "0.85rem",
            textDecoration: "none",
            color: "var(--bm-black)",
            background: "var(--bm-gold)",
            padding: "0.75rem 1.8rem",
            borderRadius: "8px",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            transition: "all 0.2s",
          }}
          className="share-btn"
        >
          Share Your Experience
          <ArrowRight size={15} />
        </Link>
      </motion.div>

      <style>{`
        .view-all-link:hover { gap: 0.75rem !important; }
        .share-btn:hover {
          background: var(--bm-gold-light) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(212,160,23,0.3);
        }
      `}</style>
    </section>
  );
}
