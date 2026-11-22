"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import AdventureCard from "./AdventureCard";
import { Adventure } from "@/types/index";

export default function FeaturedAdventures({ adventures }: { adventures: Adventure[] }) {
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
            ✦ Hand Picked For You
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
            Featured{" "}
            <em style={{ color: "var(--bm-gold-text)", fontStyle: "italic" }}>
              Adventures
            </em>
          </h2>
        </div>

        {/* View all link */}
        <Link
          href="/adventures"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontFamily: "var(--font-syne)",
            fontWeight: 600,
            fontSize: "0.85rem",
            color: "var(--bm-gold-text)",
            textDecoration: "none",
            transition: "gap 0.2s",
          }}
          className="view-all-link"
        >
          View All Adventures
          <ArrowRight size={16} />
        </Link>
      </motion.div>

    
            <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "1.25rem",
            }}
            >
            {adventures.map((adventure, i) => (
                <AdventureCard key={adventure.id} adventure={adventure} index={i} />
            ))}
            </div>

      <style>{`
        .view-all-link:hover {
          gap: 0.75rem !important;
        }
      `}</style>
    </section>
  );
}
