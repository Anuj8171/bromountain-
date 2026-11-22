"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReviewCard from "@/components/ReviewCard";
import ReviewForm from "@/components/ReviewForm";

import { Adventure, Review, Section } from "@/types";
// import { getReviewsMetadata } from "@/lib/seo";


export default function ReviewsPage(
    { reviews, adventures, sections }: {
        reviews: Review[];
        adventures: Adventure[];
        sections: Section[];
    }
) {
    const approvedReviews = reviews
  const [selectedAdventure, setSelectedAdventure] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);

  const filtered =
    selectedAdventure === "all"
      ? approvedReviews
      : approvedReviews.filter(
          (r) => r.adventure_id === selectedAdventure
        );

  const avgRating =
    approvedReviews.reduce((sum, r) => sum + r.rating, 0) /
    approvedReviews.length;

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "80px", minHeight: "100vh" }}>

        {/* ── Hero ── */}
        <section
          style={{
            padding: "5rem 1.5rem 4rem",
            textAlign: "center",
            maxWidth: "700px",
            margin: "0 auto",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "var(--bm-gold-text)",
                display: "block",
                marginBottom: "1rem",
              }}
            >
              ✦ Real Experiences
            </span>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 900,
                color: "var(--bm-cream)",
                lineHeight: 1.1,
                marginBottom: "1rem",
              }}
            >
              What Trekkers{" "}
              <em style={{ color: "var(--bm-gold-text)", fontStyle: "italic" }}>
                Say
              </em>
            </h1>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "1rem",
                color: "rgba(var(--bm-ink-rgb),0.75)",
                lineHeight: 1.7,
                marginBottom: "2rem",
              }}
            >
              Honest reviews from real trekkers who have been on BroMountain
              adventures. No filters, no edits.
            </p>

            {/* Stats row */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "2.5rem",
                flexWrap: "wrap",
              }}
            >
              {[
                {
                  value: `${avgRating.toFixed(1)} ⭐`,
                  label: "Average Rating",
                },
                {
                  value: `${approvedReviews.length}+`,
                  label: "Reviews",
                },
                {
                  value: "20+",
                  label: "Happy Trekkers",
                },
              ].map((stat, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-syne)",
                      fontWeight: 800,
                      fontSize: "1.5rem",
                      color: "var(--bm-gold-text)",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.72rem",
                      color: "rgba(var(--bm-ink-rgb),0.68)",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      marginTop: "4px",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── Filters + Share button ── */}
        <section
          style={{
            padding: "0 1.5rem 3rem",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
              marginBottom: "2.5rem",
            }}
          >
            {/* Filter by adventure */}
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => setSelectedAdventure("all")}
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  padding: "0.5rem 1.1rem",
                  borderRadius: "999px",
                  border: "1px solid",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  borderColor:
                    selectedAdventure === "all"
                      ? "var(--bm-gold)"
                      : "var(--bm-forest)",
                  background:
                    selectedAdventure === "all"
                      ? "rgba(212,160,23,0.12)"
                      : "transparent",
                  color:
                    selectedAdventure === "all"
                      ? "var(--bm-gold)"
                      : "rgba(var(--bm-ink-rgb),0.5)",
                }}
              >
                All Treks
              </button>
              {adventures.map((adventure) => (
                <button
                  key={adventure.id}
                  onClick={() => setSelectedAdventure(adventure.id)}
                  style={{
                    fontFamily: "var(--font-syne)",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    padding: "0.5rem 1.1rem",
                    borderRadius: "999px",
                    border: "1px solid",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    borderColor:
                      selectedAdventure === adventure.id
                        ? "var(--bm-gold)"
                        : "var(--bm-forest)",
                    background:
                      selectedAdventure === adventure.id
                        ? "rgba(212,160,23,0.12)"
                        : "transparent",
                    color:
                      selectedAdventure === adventure.id
                        ? "var(--bm-gold)"
                        : "rgba(var(--bm-ink-rgb),0.5)",
                  }}
                >
                  {adventure.title}
                </button>
              ))}
            </div>

            {/* Share experience button */}
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 700,
                fontSize: "0.85rem",
                padding: "0.65rem 1.5rem",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s",
                background: showForm
                  ? "var(--bm-forest)"
                  : "var(--bm-gold)",
                color: showForm ? "var(--bm-cream)" : "var(--bm-black)",
              }}
              className="share-btn"
              id="share"
            >
              {showForm ? "✕ Close Form" : "✦ Share Your Experience"}
            </button>
          </div>

          {/* ── Review Form ── */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ marginBottom: "3rem" }}
            >
              <ReviewForm
                adventures={adventures}
                onSuccess={() => setShowForm(false)}
              />
            </motion.div>
          )}

          {/* ── Reviews count ── */}
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.82rem",
              color: "rgba(var(--bm-ink-rgb),0.65)",
              marginBottom: "1.5rem",
            }}
          >
            Showing {filtered.length} review
            {filtered.length !== 1 ? "s" : ""}
            {selectedAdventure !== "all" && (
              <span
                style={{ color: "var(--bm-gold-text)", marginLeft: "0.5rem" }}
              >
                for{" "}
                {
                  adventures.find((a) => a.id === selectedAdventure)
                    ?.title
                }
              </span>
            )}
          </p>

          {/* ── Reviews masonry grid ── */}
          {filtered.length > 0 ? (
            <div
              style={{
                columns: "repeat(auto-fill, minmax(300px, 1fr))",
                columnGap: "1.5rem",
              }}
            >
              {filtered.map((review, i) => (
                <ReviewCard key={review.id} review={review} index={i} />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "4rem 0",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                🏔️
              </div>
              <p
                style={{
                  fontFamily: "var(--font-syne)",
                  fontSize: "1rem",
                  color: "rgba(var(--bm-ink-rgb),0.68)",
                }}
              >
                No reviews yet for this adventure
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer sections={sections} />
    </>
  );
}
