"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Section } from "@/types";
import { Lock } from "lucide-react";

export default function SectionsGrid({ sections }: { sections: Section[] }  ) {
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
        style={{ textAlign: "center", marginBottom: "3.5rem" }}
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
          ✦ What We Offer
        </span>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 700,
            color: "var(--bm-cream)",
            lineHeight: 1.2,
          }}
        >
          Choose Your{" "}
          <em style={{ color: "var(--bm-gold-text)", fontStyle: "italic" }}>
            Adventure
          </em>
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "1rem",
            color: "rgba(var(--bm-ink-rgb),0.75)",
            marginTop: "1rem",
            maxWidth: "480px",
            margin: "1rem auto 0",
            lineHeight: 1.7,
          }}
        >
          From high altitude treks to peaceful camping — pick your path into
          the Himalayas
        </p>
      </motion.div>

      {/* ── Grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {sections.map((section, i) => {
          const isActive = section.status === "active";

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              {isActive ? (
                <Link
                  href={`/adventures?section=${section.slug}`}
                  style={{ textDecoration: "none" }}
                  className="section-card-link"
                >
                  <SectionCard section={section} isActive={true} index={i} />
                </Link>
              ) : (
                <SectionCard section={section} isActive={false} index={i} />
              )}
            </motion.div>
          );
        })}
      </div>

      <style>{`
        .section-card-link:hover .section-card {
          border-color: rgba(212,160,23,0.4) !important;
          transform: translateY(-6px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.4);
        }
        .section-card-link:hover .section-icon {
          background: var(--bm-gold) !important;
          transform: scale(1.1);
        }
        .section-card-link:hover .section-arrow {
          transform: translateX(4px);
          color: var(--bm-gold-text);
        }
        .section-card {
          transition: all 0.3s ease;
        }
        .section-icon {
          transition: all 0.3s ease;
        }
        .section-arrow {
          transition: all 0.3s ease;
        }
      `}</style>
    </section>
  );
}

function SectionCard({
  section,
  isActive,
  index,
}: {
  section: Section;
  isActive: boolean;
  index: number;
}) {
  return (
    <div
      className="section-card"
      style={{
        background: "var(--bm-deep)",
        border: `1px solid ${isActive ? "var(--bm-forest)" : "rgba(42,74,50,0.3)"}`,
        borderRadius: "16px",
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
        opacity: isActive ? 1 : 0.6,
        cursor: isActive ? "pointer" : "default",
      }}
    >
      {/* bg glow */}
      <div
        style={{
          position: "absolute",
          top: "-40px",
          right: "-40px",
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          background: isActive
            ? "rgba(212,160,23,0.06)"
            : "rgba(122,184,138,0.04)",
          filter: "blur(30px)",
          pointerEvents: "none",
        }}
      />

      {/* Coming Soon badge */}
      {!isActive && (
        <div
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background: "rgba(122,184,138,0.1)",
            border: "1px solid rgba(122,184,138,0.2)",
            borderRadius: "999px",
            padding: "3px 10px",
            fontFamily: "var(--font-syne)",
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "var(--bm-mint)",
          }}
        >
          <Lock size={9} />
          Coming Soon
        </div>
      )}

      {/* Icon */}
      <div
        className="section-icon"
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "14px",
          background: isActive
            ? "rgba(212,160,23,0.12)"
            : "rgba(42,74,50,0.3)",
          border: `1px solid ${isActive ? "rgba(212,160,23,0.2)" : "rgba(42,74,50,0.4)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.6rem",
          marginBottom: "1.5rem",
        }}
      >
        {section.icon}
      </div>

      {/* Name */}
      <h3
        style={{
          fontFamily: "var(--font-syne)",
          fontWeight: 700,
          fontSize: "1.2rem",
          color: isActive ? "var(--bm-cream)" : "rgba(var(--bm-ink-rgb),0.5)",
          marginBottom: "0.6rem",
        }}
      >
        {section.name}
      </h3>

      {/* Description */}
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.88rem",
          color: isActive
            ? "rgba(var(--bm-ink-rgb),0.55)"
            : "rgba(var(--bm-ink-rgb),0.3)",
          lineHeight: 1.6,
          marginBottom: "1.5rem",
        }}
      >
        {section.description}
      </p>

      {/* Footer */}
      {isActive ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontFamily: "var(--font-syne)",
            fontWeight: 600,
            fontSize: "0.82rem",
            color: "var(--bm-gold-text)",
          }}
        >
          <span>Explore {section.name}</span>
          <span className="section-arrow" style={{ fontSize: "1rem" }}>
            →
          </span>
        </div>
      ) : (
        <div
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: "0.78rem",
            color: "rgba(var(--bm-ink-rgb),0.55)",
            letterSpacing: "0.5px",
          }}
        >
          Available soon
        </div>
      )}
    </div>
  );
}
