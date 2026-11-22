// components/HeroSection.tsx
// PURPOSE: The full-viewport hero on the homepage. "use client" so it can
//   animate and auto-rotate slides with client JS.
//   - Rotates through 3 hero slides (photo + tag + headline + sub + altitude
//     scale) every 5 seconds, with manual dot indicators on the left.
//   - Animated stat counters (useCounter hook) start 0.8s after mount.
//   - CTA buttons: Explore Adventures → /adventures, View Reviews → /reviews.
//   - Scroll-down chevron indicator at the bottom.
//   - Altitude scale (right side) animates a fill bar to the peak height.
// CONNECTED TO:
//   - app/page.tsx (renders <HeroSection /> right after Navbar)
//   - app/layout.tsx (site backdrop mountain silhouette shows behind this section)
//   - lib/data.ts not used here — slide data is hardcoded in heroSlides.
//   - globals.css (BM theme tokens used inline: --bm-gold, --bm-on-photo, etc.)
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ChevronDown } from "lucide-react";

const heroSlides = [
  {
    image: "/hero-1.jpg",
    tag: "Uttarkashi, Uttarakhand",
    headline: "Go Where",
    headlineGold: "Roads Don't",
    sub: "Uttarakhand's finest trekking and adventure experiences",
    scale: "3800m",
    scaleLabel: "Kedarkantha Peak",
  },
  {
    image: "/hero-2.jpg",
    tag: "Himalayan Adventures",
    headline: "Conquer The",
    headlineGold: "Mighty Peaks",
    sub: "Expert guides. Real mountains. Unforgettable memories.",
    scale: "3408m",
    scaleLabel: "Dayara Bugyal",
  },
  {
    image: "/hero-3.jpg",
    tag: "Based in Uttarkashi",
    headline: "Find Your",
    headlineGold: "Wild Side",
    sub: "Trekking, camping and adventures across Uttarakhand",
    scale: "3024m",
    scaleLabel: "Dodital Lake",
  },
];

// The photo stays 100% solid (nothing shows through it) for the top 80%.
// Only the last ~20% dissolves, so the bottom edge melts into the page with no hard line.
const HERO_FADE_MASK =
  "linear-gradient(to bottom, #000 0%, #000 80%, rgba(0,0,0,0.8) 87%, rgba(0,0,0,0.45) 93%, rgba(0,0,0,0.15) 97%, transparent 100%)";

// Same dark overlay in both themes (keeps the white headline readable on any photo).
const HERO_SCRIM =
  "linear-gradient(to bottom, rgba(10,12,11,0.38) 0%, rgba(10,12,11,0.46) 50%, rgba(10,12,11,0.30) 80%, rgba(10,12,11,0) 100%)";

// Gold for text that sits directly on the photo (the theme gold is too dark on it in light mode)
const GOLD_ON_PHOTO = "#f2c94c";

const stats = [
  { value: 20, suffix: "+", label: "Happy Trekkers" },
  { value: 40, suffix: "", label: "Adventures" },
  { value: 3, suffix: "+", label: "Years Experience" },
];

// ── Animated counter hook ──
function useCounter(target: number, duration: number = 2000, start: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number;
    let frame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, start]);

  return count;
}

// ── Single stat counter ──
function StatCounter({
  value,
  suffix,
  label,
  delay,
  start,
}: {
  value: number;
  suffix: string;
  label: string;
  delay: number;
  start: boolean;
}) {
  const count = useCounter(value, 2000, start);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={start ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      style={{ textAlign: "center" }}
    >
      <div
        style={{
          fontFamily: "var(--font-syne)",
          fontWeight: 800,
          fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
          color: "var(--bm-gold-text)",
          lineHeight: 1,
          letterSpacing: "-1px",
        }}
      >
        {count.toLocaleString("en-IN")}{suffix}
      </div>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.7rem",
          color: "var(--bm-sand)",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          marginTop: "6px",
          fontWeight: 300,
        }}
      >
        {label}
      </div>
    </motion.div>
  );
}

// ── Altitude scale component ──
function AltitudeScale({
  scale,
  label,
  visible,
}: {
  scale: string;
  label: string;
  visible: boolean;
}) {
  const meters = parseInt(scale);
  const maxAltitude = 4000;
  const fillPercent = (meters / maxAltitude) * 100;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      {/* Altitude value */}
      <AnimatePresence mode="wait">
        <motion.div
          key={scale}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.5 }}
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 700,
            fontSize: "0.8rem",
            color: GOLD_ON_PHOTO,
            letterSpacing: "1px",
            textShadow: "0 1px 8px rgba(0,0,0,0.55)",
          }}
        >
          {scale}
        </motion.div>
      </AnimatePresence>

      {/* Scale bar */}
      <div
        style={{
          width: "3px",
          height: "140px",
          background: "rgba(250,247,240,0.22)",
          borderRadius: "999px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* tick marks */}
        {[1000, 2000, 3000, 4000].map((alt) => (
          <div
            key={alt}
            style={{
              position: "absolute",
              right: "-6px",
              bottom: `${(alt / maxAltitude) * 100}%`,
              width: "6px",
              height: "1px",
              background: "rgba(250,247,240,0.45)",
            }}
          />
        ))}

        {/* fill */}
        <motion.div
          key={`fill-${scale}`}
          initial={{ height: "0%" }}
          animate={{ height: `${fillPercent}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "linear-gradient(to top, var(--bm-gold), var(--bm-mint))",
            borderRadius: "999px",
          }}
        />
      </div>

      {/* Tick labels on left */}
      <div
        style={{
          position: "absolute",
          right: "3.5rem",
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "140px",
          alignItems: "flex-end",
        }}
      >
        {["4000m", "3000m", "2000m", "1000m"].map((t) => (
          <span
            key={t}
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "0.55rem",
              color: "var(--bm-on-photo-ink)",
              letterSpacing: "0.5px",
            }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={label}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.6rem",
            color: "var(--bm-on-photo-ink)",
            letterSpacing: "1px",
            textTransform: "uppercase",
            textAlign: "center",
            maxWidth: "60px",
          }}
        >
          {label}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [statsStarted, setStatsStarted] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  // ── Auto slide every 5s ──
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // ── Start counters after 0.8s ──
  useEffect(() => {
    const t = setTimeout(() => setStatsStarted(true), 800);
    return () => clearTimeout(t);
  }, []);

  const slide = heroSlides[current];

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        minHeight: "600px",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* ── Background photo: fades out at the bottom so it melts into the page backdrop ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          overflow: "hidden",
          WebkitMaskImage: HERO_FADE_MASK,
          maskImage: HERO_FADE_MASK,
        }}
      >
        {heroSlides.map((s, i) => (
          <motion.div
            key={i}
            animate={{ opacity: i === current ? 1 : 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${s.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              scale: i === current ? 1.05 : 1,
              transition: "transform 6s ease-out",
            }}
          />
        ))}

        {/* Dark scrim for text contrast. It also ends transparent, so there is no colour band at the bottom. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: HERO_SCRIM,
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ── Left slide indicators ── */}
      <div
        style={{
          position: "absolute",
          left: "2rem",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          alignItems: "center",
        }}
      >
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: "3px",
              height: i === current ? "36px" : "14px",
              borderRadius: "999px",
              background: i === current
                ? "var(--bm-gold)"
                : "rgba(250,247,240,0.4)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "all 0.4s ease",
            }}
          />
        ))}
      </div>

      {/* ── Right altitude scale ── */}
      <div
        className="bm-altitude"
        style={{
          position: "absolute",
          right: "2.5rem",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
        }}
      >
        <AltitudeScale
          scale={slide.scale}
          label={slide.scaleLabel}
          visible={true}
        />
      </div>

      {/* ── Center Content ── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          padding: "0 1.5rem",
          maxWidth: "750px",
          width: "100%",
        }}
      >
        {/* Tag */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`tag-${current}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: "1.2rem" }}
          >
            <span
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: GOLD_ON_PHOTO,
                background: "rgba(10,12,11,0.35)",
                border: "1px solid rgba(242,201,76,0.45)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                padding: "0.35rem 1rem",
                borderRadius: "999px",
              }}
            >
              ✦ {slide.tag}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Headline */}
        <AnimatePresence mode="wait">
          <motion.h1
            key={`headline-${current}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
              fontWeight: 900,
              lineHeight: 1.1,
              color: "var(--bm-on-photo)",
              textShadow: "0 2px 24px rgba(0,0,0,0.45)",
              marginBottom: "0.5rem",
            }}
          >
            {slide.headline}{" "}
            <em style={{ color: GOLD_ON_PHOTO, fontStyle: "italic" }}>
              {slide.headlineGold}
            </em>
          </motion.h1>
        </AnimatePresence>

        {/* Subtext */}
        <AnimatePresence mode="wait">
          <motion.p
            key={`sub-${current}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
              color: "var(--bm-on-photo-ink)",
              maxWidth: "480px",
              margin: "0 auto 2rem",
              lineHeight: 1.7,
              fontWeight: 300,
            }}
          >
            {slide.sub}
          </motion.p>
        </AnimatePresence>

        {/* ── Stats in middle ── */}
        <div
          ref={statsRef}
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "clamp(1.25rem, 6vw, 3rem)",
            marginBottom: "2.5rem",
            padding: "1.2rem clamp(0.85rem, 5vw, 2rem)",
            maxWidth: "100%",
            background: "var(--bm-glass)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            borderRadius: "16px",
            border: "1px solid var(--bm-glass-border)",
            width: "fit-content",
            margin: "0 auto 2.5rem",
          }}
        >
          {stats.map((stat, i) => (
            <StatCounter
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              delay={i * 0.15}
              start={statsStarted}
            />
          ))}
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/adventures"
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 700,
              fontSize: "0.9rem",
              letterSpacing: "0.5px",
              textDecoration: "none",
              color: "var(--bm-black)",
              background: "var(--bm-gold)",
              padding: "0.85rem 2rem",
              borderRadius: "8px",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.2s",
            }}
            className="hero-btn-primary"
          >
            Explore Adventures
          </Link>

          <Link
            href="/reviews"
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 600,
              fontSize: "0.9rem",
              letterSpacing: "0.5px",
              textDecoration: "none",
              color: "var(--bm-on-photo)",
              background: "rgba(10,12,11,0.50)",
              border: "1.5px solid rgba(250,247,240,0.45)",
              padding: "0.85rem 2rem",
              borderRadius: "8px",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backdropFilter: "blur(8px)",
              transition: "all 0.2s",
            }}
            className="hero-btn-secondary"
          >
            View Reviews
          </Link>
        </motion.div>
      </div>

      {/* ── Scroll indicator ── */}
      <div
        className="bm-scroll"
        style={{
          position: "absolute",
          bottom: "1.8rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2px",
          padding: "0.4rem 0.9rem 0.25rem",
          background: "var(--bm-glass)",
          border: "1px solid var(--bm-glass-border)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderRadius: "999px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: "0.58rem",
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "var(--bm-cream)",
          }}
        >
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={14} color="var(--bm-sand)" />
        </motion.div>
      </div>

      {/* ── Button styles ── */}
      <style>{`
        /* The altitude gauge needs room — hide it on small screens */
        @media (max-width: 900px) {
          .bm-altitude { display: none; }
        }
        /* Short screens: the scroll hint would sit on top of the buttons */
        @media (max-height: 760px) {
          .bm-scroll { display: none !important; }
        }
        .hero-btn-primary:hover {
          background: var(--bm-gold-light) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(212,160,23,0.4);
        }
        .hero-btn-secondary:hover {
          background: rgba(10,12,11,0.68) !important;
          border-color: rgba(250,247,240,0.8) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </section>
  );
}