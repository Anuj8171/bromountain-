"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Clock, TrendingUp, Calendar } from "lucide-react";
import { Adventure } from "@/types/index";
import { getPriceInfo, formatPrice } from  "@/lib/adventure-utils";

const difficultyColors: Record<string, string> = {
  Easy:     "#7ab88a",
  Moderate: "#d4a017",
  Hard:     "#c4622d",
  Extreme:  "#c0392b",
};

export default function AdventureCard({
  adventure,
  index = 0,
}: {
  adventure: Adventure;
  index?: number;
}) {
  const price = getPriceInfo(adventure);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        href={`/adventures/${adventure.slug}`}
        style={{ textDecoration: "none" }}
        className="adventure-card-link"
      >
        <div
          className="adventure-card"
          style={{
            background: "var(--bm-deep)",
            border: "1px solid var(--bm-forest)",
            borderRadius: "16px",
            overflow: "hidden",
            transition: "all 0.35s ease",
            cursor: "pointer",
          }}
        >
          {/* ── Image ── */}
          <div
            style={{
              position: "relative",
              height: "240px",
              overflow: "hidden",
              background: "var(--bm-forest)",
            }}
          >
            {adventure.cover_image_url ? (
              <Image
                src={adventure.cover_image_url}
                alt={adventure.title}
                fill
                style={{
                  objectFit: "cover",
                  transition: "transform 0.5s ease",
                }}
                className="adventure-card-img"
              />
            ) : (
              /* placeholder if no image */
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "3rem",
                  background:
                    "linear-gradient(135deg, var(--bm-forest), var(--bm-moss))",
                }}
              >
                🏔️
              </div>
            )}

            {/* Difficulty badge */}
            <div
              style={{
                position: "absolute",
                top: "1rem",
                left: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                background: "rgba(10,12,11,0.75)",
                backdropFilter: "blur(8px)",
                border: `1px solid ${difficultyColors[adventure.difficulty]}40`,
                borderRadius: "999px",
                padding: "4px 10px",
                fontFamily: "var(--font-syne)",
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: difficultyColors[adventure.difficulty],
              }}
            >
              <span
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: difficultyColors[adventure.difficulty],
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              {adventure.difficulty}
            </div>

            {/* Special offer badge */}
            {price.offerActive && (
              <div
                className="offer-badge"
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                }}
              >
                ✦ OFFER
              </div>
            )}

            {/* Duration pill at bottom */}
            <div
              style={{
                position: "absolute",
                bottom: "1rem",
                right: "1rem",
                background: "rgba(10,12,11,0.75)",
                backdropFilter: "blur(8px)",
                borderRadius: "999px",
                padding: "4px 10px",
                fontFamily: "var(--font-syne)",
                fontSize: "0.65rem",
                fontWeight: 600,
                color: "#f2ede4",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Clock size={10} />
              {adventure.duration_days}D / {adventure.duration_nights}N
            </div>
          </div>

          {/* ── Content ── */}
          <div style={{ padding: "1.25rem" }}>

            {/* Location */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                marginBottom: "0.5rem",
              }}
            >
              <MapPin size={11} color="var(--bm-sage)" />
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.75rem",
                  color: "var(--bm-sage)",
                  letterSpacing: "0.5px",
                }}
              >
                {adventure.location}, {adventure.state}
              </span>
            </div>

            {/* Title */}
            <h3
              style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 700,
                fontSize: "1.05rem",
                color: "var(--bm-cream)",
                marginBottom: "0.4rem",
                lineHeight: 1.3,
                transition: "color 0.2s",
              }}
              className="adventure-card-title"
            >
              {adventure.title}
            </h3>

            {/* Tagline */}
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.8rem",
                color: "rgba(var(--bm-ink-rgb),0.7)",
                marginBottom: "1rem",
                lineHeight: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {adventure.tagline}
            </p>

            {/* Info row */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                marginBottom: "1rem",
                paddingBottom: "1rem",
                borderBottom: "1px solid var(--bm-forest)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <TrendingUp size={11} color="var(--bm-sage)" />
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.72rem",
                    color: "rgba(var(--bm-ink-rgb),0.72)",
                  }}
                >
                  {adventure.max_altitude ?? "—"}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Calendar size={11} color="var(--bm-sage)" />
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.72rem",
                    color: "rgba(var(--bm-ink-rgb),0.72)",
                  }}
                >
                  {adventure.best_season}
                </span>
              </div>
            </div>

            {/* Price row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/* Pricing */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
               {/* ── Pricing — only 2 prices ever show at once ── */}

                {/* Original always strikethrough */}
                <span className="price-original">
                {formatPrice(price.original)}
                </span>

                {/* Offer active → show offer price in gold */}
                {/* No offer → show sale price in cream */}
                {price.offerActive ? (
                <span className="price-offer">
                    {formatPrice(price.offer!)}
                </span>
                ) : (
                <span className="price-sale">
                    {formatPrice(price.sale)}
                </span>
                )}
              </div>

              {/* Arrow CTA */}
              <div
                className="adventure-card-arrow"
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "rgba(212,160,23,0.12)",
                  border: "1px solid rgba(212,160,23,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--bm-gold-text)",
                  fontSize: "0.9rem",
                  transition: "all 0.3s ease",
                  flexShrink: 0,
                }}
              >
                →
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* ── Hover styles ── */}
      <style>{`
        .adventure-card-link:hover .adventure-card {
          border-color: rgba(212,160,23,0.35) !important;
          transform: translateY(-6px);
          box-shadow: 0 24px 60px rgba(0,0,0,0.45);
        }
        .adventure-card-link:hover .adventure-card-img {
          transform: scale(1.06);
        }
        .adventure-card-link:hover .adventure-card-title {
          color: var(--bm-gold-text) !important;
        }
        .adventure-card-link:hover .adventure-card-arrow {
          background: var(--bm-gold) !important;
          border-color: var(--bm-gold-text) !important;
          color: var(--bm-black) !important;
          transform: translateX(3px);
        }
      `}</style>
    </motion.div>
  );
}
