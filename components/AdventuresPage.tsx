"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdventureCard from "@/components/AdventureCard";
import { Adventure, Section } from "@/types/index";
import { SlidersHorizontal, X } from "lucide-react";

const difficulties = ["All", "Easy", "Moderate", "Hard", "Extreme"];
const durations = [
  { label: "All", min: 0, max: 999 },
  { label: "1-3 Days", min: 1, max: 3 },
  { label: "4-6 Days", min: 4, max: 6 },
  { label: "7+ Days", min: 7, max: 999 },
];
const priceRanges = [
  { label: "All", min: 0, max: 999999 },
  { label: "Under ₹2,500", min: 0, max: 2500 },
  { label: "₹2,500 - ₹4,000", min: 2500, max: 4000 },
  { label: "Above ₹4,000", min: 4000, max: 999999 },
];

export default function AdventuresPage({
  adventures,
  sections,
}: {
  adventures: Adventure[];
  sections: Section[];
}) {
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get("section") || "all";

  const [selectedSection, setSelectedSection]     = useState(sectionParam);
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedDuration, setSelectedDuration]   = useState(0);
  const [selectedPrice, setSelectedPrice]         = useState(0);
  const [showFilters, setShowFilters]             = useState(false);
  const [sortBy, setSortBy]                       = useState("default");

  // ── Active sections only ──
  const activeSections = sections.filter((s) => s.status === "active");

  // ── Filter logic ──
  const filtered = useMemo(() => {
    let result = adventures.filter((a) => a.is_active);

    // section filter
    if (selectedSection !== "all") {
      const section = sections.find((s) => s.slug === selectedSection);
      if (section) result = result.filter((a) => a.section_id === section.id);
    }

    // difficulty filter
    if (selectedDifficulty !== "All") {
      result = result.filter((a) => a.difficulty === selectedDifficulty);
    }

    // duration filter
    const dur = durations[selectedDuration];
    result = result.filter(
      (a) => a.duration_days >= dur.min && a.duration_days <= dur.max
    );

    // price filter
    const price = priceRanges[selectedPrice];
    result = result.filter(
      (a) => a.discounted_price >= price.min && a.discounted_price <= price.max
    );

    // sort
    if (sortBy === "price-low")
      result = [...result].sort((a, b) => a.discounted_price - b.discounted_price);
    if (sortBy === "price-high")
      result = [...result].sort((a, b) => b.discounted_price - a.discounted_price);
    if (sortBy === "duration")
      result = [...result].sort((a, b) => a.duration_days - b.duration_days);
    if (sortBy === "difficulty") {
      const order = { Easy: 1, Moderate: 2, Hard: 3, Extreme: 4 };
      result = [...result].sort(
        (a, b) => order[a.difficulty] - order[b.difficulty]
      );
    }

    return result;
  }, [selectedSection, selectedDifficulty, selectedDuration, selectedPrice, sortBy]);

  // ── Check if any filter is active ──
  const hasActiveFilters =
    selectedSection !== "all" ||
    selectedDifficulty !== "All" ||
    selectedDuration !== 0 ||
    selectedPrice !== 0;

  const clearFilters = () => {
    setSelectedSection("all");
    setSelectedDifficulty("All");
    setSelectedDuration(0);
    setSelectedPrice(0);
    setSortBy("default");
  };

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "80px", minHeight: "100vh" }}>

        {/* ── Hero ── */}
        <section
          style={{
            padding: "4rem 1.5rem 3rem",
            maxWidth: "1200px",
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
                marginBottom: "0.75rem",
              }}
            >
              ✦ Uttarakhand Adventures
            </span>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 5vw, 3.2rem)",
                fontWeight: 900,
                color: "var(--bm-cream)",
                lineHeight: 1.1,
              }}
            >
              Find Your Perfect{" "}
              <em style={{ color: "var(--bm-gold-text)", fontStyle: "italic" }}>
                Adventure
              </em>
            </h1>
          </motion.div>
        </section>

        {/* ── Section tabs ── */}
        <section
          style={{
            padding: "0 1.5rem",
            maxWidth: "1200px",
            margin: "0 auto",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => setSelectedSection("all")}
              style={{
                ...tabStyle,
                borderColor:
                  selectedSection === "all"
                    ? "var(--bm-gold)"
                    : "var(--bm-forest)",
                background:
                  selectedSection === "all"
                    ? "rgba(212,160,23,0.12)"
                    : "transparent",
                color:
                  selectedSection === "all"
                    ? "var(--bm-gold)"
                    : "rgba(var(--bm-ink-rgb),0.5)",
              }}
            >
              All Activities
            </button>
            {activeSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setSelectedSection(section.slug)}
                style={{
                  ...tabStyle,
                  borderColor:
                    selectedSection === section.slug
                      ? "var(--bm-gold)"
                      : "var(--bm-forest)",
                  background:
                    selectedSection === section.slug
                      ? "rgba(212,160,23,0.12)"
                      : "transparent",
                  color:
                    selectedSection === section.slug
                      ? "var(--bm-gold)"
                      : "rgba(var(--bm-ink-rgb),0.5)",
                }}
              >
                {section.icon} {section.name}
              </button>
            ))}
          </div>
        </section>

        {/* ── Filters bar ── */}
        <section
          style={{
            padding: "0 1.5rem",
            maxWidth: "1200px",
            margin: "0 auto",
            marginBottom: "2.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            {/* Left — filter toggle + clear */}
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontFamily: "var(--font-syne)",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  padding: "0.55rem 1.1rem",
                  borderRadius: "8px",
                  border: "1px solid var(--bm-forest)",
                  background: showFilters
                    ? "var(--bm-forest)"
                    : "transparent",
                  color: "var(--bm-sand)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <SlidersHorizontal size={14} />
                Filters
                {hasActiveFilters && (
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "var(--bm-gold)",
                      display: "inline-block",
                    }}
                  />
                )}
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontFamily: "var(--font-syne)",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: "var(--bm-rust)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <X size={12} />
                  Clear filters
                </button>
              )}
            </div>

            {/* Right — sort + count */}
            <div
              style={{ display: "flex", alignItems: "center", gap: "1rem" }}
            >
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.8rem",
                  color: "rgba(var(--bm-ink-rgb),0.65)",
                }}
              >
                {filtered.length} adventure
                {filtered.length !== 1 ? "s" : ""}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  fontFamily: "var(--font-syne)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  padding: "0.5rem 0.75rem",
                  borderRadius: "8px",
                  border: "1px solid var(--bm-forest)",
                  background: "var(--bm-deep)",
                  color: "var(--bm-sand)",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value="default">Sort: Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="duration">Duration</option>
                <option value="difficulty">Difficulty</option>
              </select>
            </div>
          </div>

          {/* ── Expanded filters ── */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                marginTop: "1.25rem",
                padding: "1.5rem",
                background: "var(--bm-deep)",
                border: "1px solid var(--bm-forest)",
                borderRadius: "12px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {/* Difficulty */}
              <div>
                <p style={filterLabelStyle}>Difficulty</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {difficulties.map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDifficulty(d)}
                      style={{
                        ...filterChipStyle,
                        borderColor:
                          selectedDifficulty === d
                            ? "var(--bm-gold)"
                            : "var(--bm-forest)",
                        background:
                          selectedDifficulty === d
                            ? "rgba(212,160,23,0.12)"
                            : "transparent",
                        color:
                          selectedDifficulty === d
                            ? "var(--bm-gold)"
                            : "rgba(var(--bm-ink-rgb),0.45)",
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <p style={filterLabelStyle}>Duration</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {durations.map((d, i) => (
                    <button
                      key={d.label}
                      onClick={() => setSelectedDuration(i)}
                      style={{
                        ...filterChipStyle,
                        borderColor:
                          selectedDuration === i
                            ? "var(--bm-gold)"
                            : "var(--bm-forest)",
                        background:
                          selectedDuration === i
                            ? "rgba(212,160,23,0.12)"
                            : "transparent",
                        color:
                          selectedDuration === i
                            ? "var(--bm-gold)"
                            : "rgba(var(--bm-ink-rgb),0.45)",
                      }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <p style={filterLabelStyle}>Price Range</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {priceRanges.map((p, i) => (
                    <button
                      key={p.label}
                      onClick={() => setSelectedPrice(i)}
                      style={{
                        ...filterChipStyle,
                        borderColor:
                          selectedPrice === i
                            ? "var(--bm-gold)"
                            : "var(--bm-forest)",
                        background:
                          selectedPrice === i
                            ? "rgba(212,160,23,0.12)"
                            : "transparent",
                        color:
                          selectedPrice === i
                            ? "var(--bm-gold)"
                            : "rgba(var(--bm-ink-rgb),0.45)",
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </section>

        {/* ── Adventures grid ── */}
        <section
          style={{
            padding: "0 1.5rem 6rem",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {filtered.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {filtered.map((adventure, i) => (
                <AdventureCard
                  key={adventure.id}
                  adventure={adventure}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: "center",
                padding: "5rem 0",
              }}
            >
              <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>
                🏔️
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "var(--bm-cream)",
                  marginBottom: "0.5rem",
                }}
              >
                No adventures found
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.85rem",
                  color: "rgba(var(--bm-ink-rgb),0.68)",
                  marginBottom: "1.5rem",
                }}
              >
                Try adjusting your filters
              </p>
              <button
                onClick={clearFilters}
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  padding: "0.65rem 1.5rem",
                  borderRadius: "8px",
                  border: "1px solid var(--bm-forest)",
                  background: "transparent",
                  color: "var(--bm-sand)",
                  cursor: "pointer",
                }}
              >
                Clear All Filters
              </button>
            </motion.div>
          )}
        </section>
      </main>
      <Footer sections={sections}  />
    </>
  );
}

// ── Style helpers ──
const tabStyle: React.CSSProperties = {
  fontFamily: "var(--font-syne)",
  fontWeight: 600,
  fontSize: "0.82rem",
  padding: "0.55rem 1.1rem",
  borderRadius: "999px",
  border: "1px solid",
  cursor: "pointer",
  transition: "all 0.2s",
  background: "transparent",
};

const filterLabelStyle: React.CSSProperties = {
  fontFamily: "var(--font-syne)",
  fontSize: "0.72rem",
  fontWeight: 700,
  letterSpacing: "1.5px",
  textTransform: "uppercase",
  color: "rgba(var(--bm-ink-rgb),0.68)",
  marginBottom: "0.6rem",
};

const filterChipStyle: React.CSSProperties = {
  fontFamily: "var(--font-syne)",
  fontWeight: 600,
  fontSize: "0.75rem",
  padding: "0.4rem 0.85rem",
  borderRadius: "999px",
  border: "1px solid",
  cursor: "pointer",
  transition: "all 0.2s",
  background: "transparent",
};