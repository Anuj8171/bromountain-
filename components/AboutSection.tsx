// components/AboutSection.tsx
// PURPOSE: Static "Our Story" section on the homepage (rendered by app/page.tsx
//   right after FeaturedAdventures).
//   - Two-column grid: left = image (/about.jpg) + floating "20+ Happy Trekkers"
//     card; right = "Our Story" heading, two paragraphs, location badges
//     (Uttarkashi / Uttarakhand / Himalayas), and a CTA button linking to
//     /adventures.
//   - Uses framer-motion whileInView for entrance animations.
// CONNECTED TO:
//   - app/page.tsx (renders <AboutSection /> as part of the homepage)
//   - app/layout.tsx (site backdrop + fonts)
//   - globals.css (BM theme tokens used inline)
//   - No data fetching here — all content is hardcoded.
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, ArrowRight } from "lucide-react";

const highlights = [
  { value: "Uttarkashi", label: "Home Base" },
  { value: "Uttarakhand", label: "Our Backyard" },
  { value: "Himalayas", label: "Our Office" },
];

export default function AboutSection() {
  return (
    <section
      style={{
        padding: "6rem 1.5rem",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "4rem",
          alignItems: "center",
        }}
      >
        {/* ── Left — Image ── */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ position: "relative" }}
        >
          {/* Main image */}
          <div
            style={{
              position: "relative",
              height: "480px",
              borderRadius: "20px",
              overflow: "hidden",
              background: "var(--bm-forest)",
            }}
          >
           <Image
            src="/about.jpg"
            alt="BroMountain team in Uttarkashi"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            style={{ objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to bottom, transparent 60%, rgba(10,12,11,0.6) 100%)",
              }}
            />
          </div>

          {/* Floating card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
              position: "absolute",
              bottom: "-1.5rem",
              right: "-1.5rem",
              background: "var(--bm-deep)",
              border: "1px solid var(--bm-forest)",
              borderRadius: "16px",
              padding: "1.25rem 1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
              boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 800,
                fontSize: "2rem",
                color: "var(--bm-gold-text)",
                lineHeight: 1,
              }}
            >
              20+
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.75rem",
                color: "rgba(var(--bm-ink-rgb),0.72)",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              Happy Trekkers
            </div>
          </motion.div>
        </motion.div>

        {/* ── Right — Content ── */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
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
            ✦ Our Story
          </span>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
              fontWeight: 700,
              color: "var(--bm-cream)",
              lineHeight: 1.2,
              marginBottom: "1.5rem",
            }}
          >
            Born in the{" "}
            <em style={{ color: "var(--bm-gold-text)", fontStyle: "italic" }}>
              Himalayas,
            </em>{" "}
            Built for the Mountains
          </h2>

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.95rem",
              color: "rgba(var(--bm-ink-rgb),0.78)",
              lineHeight: 1.8,
              marginBottom: "1.25rem",
            }}
          >
            BroMountain was born from a simple idea — to share the raw,
            untouched beauty of Uttarakhand with the world. We are a team
            of passionate mountain lovers, based right here in Uttarkashi,
            the gateway to the Himalayas.
          </p>

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.95rem",
              color: "rgba(var(--bm-ink-rgb),0.78)",
              lineHeight: 1.8,
              marginBottom: "2rem",
            }}
          >
            Every trail we walk, every camp we set up, every summit we help
            you reach — it all comes from 3+ years of living and breathing
            these mountains. This isn't just business for us. This is home.
          </p>

          {/* Location badges */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              marginBottom: "2rem",
            }}
          >
            {highlights.map((h, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "var(--bm-deep)",
                  border: "1px solid var(--bm-forest)",
                  borderRadius: "999px",
                  padding: "0.4rem 1rem",
                }}
              >
                <MapPin size={11} color="var(--bm-gold)" />
                <span
                  style={{
                    fontFamily: "var(--font-syne)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--bm-sand)",
                  }}
                >
                  {h.value}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.68rem",
                    color: "rgba(var(--bm-ink-rgb),0.65)",
                  }}
                >
                  — {h.label}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/adventures"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontFamily: "var(--font-syne)",
              fontWeight: 700,
              fontSize: "0.9rem",
              textDecoration: "none",
              color: "var(--bm-black)",
              background: "var(--bm-gold)",
              padding: "0.85rem 2rem",
              borderRadius: "8px",
              transition: "all 0.2s",
            }}
            className="about-cta"
          >
            Start Your Adventure
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>

      <style>{`
        .about-cta:hover {
          background: var(--bm-gold-light) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(212,160,23,0.3);
        }
      `}</style>
    </section>
  );
}
