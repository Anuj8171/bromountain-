"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Adventure, Section } from '@/types/index';
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Clock, TrendingUp, Users, Calendar,
  ChevronLeft, ChevronRight, Check, X,
  Utensils, Bed, Footprints,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingForm from "@/components/BookingForm";
import { getPriceInfo, formatPrice, getSlotsStatus } from "@/lib/adventure-utils";


const difficultyColors: Record<string, string> = {
  Easy: "#7ab88a",
  Moderate: "#d4a017",
  Hard: "#c4622d",
  Extreme: "#c0392b",
};

export default function AdventureDetailClient({
  adventure, sections
}: {
  adventure: Adventure;
  sections: Section[];
}) {
  const router = useRouter();

  const [activeImage, setActiveImage]   = useState(0);
  const [activeTab, setActiveTab]       = useState<"itinerary" | "inclusions" | "dates">("itinerary");
  const price = getPriceInfo(adventure);

  const allImages = [
    ...(adventure.cover_image_url ? [adventure.cover_image_url] : []),
    ...adventure.gallery_images,
  ];

  const nextImage = () => setActiveImage((i) => (i + 1) % allImages.length);
  const prevImage = () => setActiveImage((i) => (i - 1 + allImages.length) % allImages.length);

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "80px", minHeight: "100vh" }}>

        {/* ── Breadcrumb ── */}
        <div
          style={{
            padding: "1.5rem 1.5rem 0",
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Link
            href="/adventures"
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "0.78rem",
              color: "rgba(var(--bm-ink-rgb),0.68)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "color 0.2s",
            }}
            className="breadcrumb-link"
          >
            <ChevronLeft size={14} />
            Adventures
          </Link>
          <span
            style={{
              color: "rgba(var(--bm-ink-rgb),0.68)",
              fontSize: "0.78rem",
            }}
          >
            /
          </span>
          <span
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "0.78rem",
              color: "rgba(var(--bm-ink-rgb),0.78)",
            }}
          >
            {adventure.title}
          </span>
        </div>

        {/* ── Main content ── */}
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "2rem 1.5rem 6rem",
            display: "grid",
            gridTemplateColumns: "1fr min(400px, 100%)",
            gap: "3rem",
            alignItems: "start",
          }}
          className="detail-grid"
        >
          {/* ── LEFT COLUMN ── */}
          <div>

            {/* ── Photo Gallery ── */}
            <div
              style={{
                position: "relative",
                borderRadius: "20px",
                overflow: "hidden",
                background: "var(--bm-forest)",
                marginBottom: "2rem",
                aspectRatio: "16/9",
              }}
            >
              {allImages.length > 0 ? (
                <>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeImage}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      style={{ position: "absolute", inset: 0 }}
                    >
                      <Image
                        src={allImages[activeImage]}
                        alt={adventure.title}
                        fill
                        style={{ objectFit: "cover" }}
                        priority
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Nav arrows */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        style={{
                          position: "absolute",
                          left: "1rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          zIndex: 10,
                          ...galleryBtnStyle,
                        }}
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={nextImage}
                        style={{
                          position: "absolute",
                          right: "1rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          zIndex: 10,
                          ...galleryBtnStyle,
                        }}
                      >
                        <ChevronRight size={18} />
                      </button>

                      {/* Dots */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: "1rem",
                          left: "50%",
                          transform: "translateX(-50%)",
                          display: "flex",
                          gap: "6px",
                          zIndex: 10,
                        }}
                      >
                        {allImages.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImage(i)}
                            style={{
                              width: i === activeImage ? "20px" : "6px",
                              height: "6px",
                              borderRadius: "999px",
                              background:
                                i === activeImage
                                  ? "var(--bm-gold)"
                                  : "rgba(255,255,255,0.4)",
                              border: "none",
                              cursor: "pointer",
                              padding: 0,
                              transition: "all 0.3s",
                            }}
                          />
                        ))}
                      </div>
                    </>
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
                      padding: "5px 12px",
                      fontFamily: "var(--font-syne)",
                      fontSize: "0.68rem",
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
                      }}
                    />
                    {adventure.difficulty}
                  </div>
                </>
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "4rem",
                    background: "linear-gradient(135deg, var(--bm-forest), var(--bm-moss))",
                  }}
                >
                  🏔️
                </div>
              )}
            </div>

            {/* ── Title + quick info ── */}
            <div style={{ marginBottom: "2rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "0.5rem",
                }}
              >
                <MapPin size={13} color="var(--bm-sage)" />
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.82rem",
                    color: "var(--bm-sage)",
                  }}
                >
                  {adventure.location}, {adventure.state}
                </span>
              </div>

              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                  fontWeight: 900,
                  color: "var(--bm-cream)",
                  lineHeight: 1.15,
                  marginBottom: "0.75rem",
                }}
              >
                {adventure.title}
              </h1>

              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "1rem",
                  color: "rgba(var(--bm-ink-rgb),0.75)",
                  lineHeight: 1.7,
                  marginBottom: "1.5rem",
                }}
              >
                {adventure.description}
              </p>

              {/* Quick stats */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                  gap: "0.75rem",
                }}
              >
                {[
                  {
                    icon: Clock,
                    label: "Duration",
                    value: `${adventure.duration_days}D / ${adventure.duration_nights}N`,
                  },
                  {
                    icon: TrendingUp,
                    label: "Max Altitude",
                    value: adventure.max_altitude || "N/A",
                  },
                  {
                    icon: Footprints,
                    label: "Distance",
                    value: adventure.distance_km
                      ? `${adventure.distance_km} km`
                      : "N/A",
                  },
                  {
                    icon: Users,
                    label: "Group Size",
                    value: `Max ${adventure.max_group_size}`,
                  },
                  {
                    icon: Calendar,
                    label: "Best Season",
                    value: adventure.best_season,
                  },
                  {
                    icon: Users,
                    label: "Min Age",
                    value: `${adventure.min_age}+ years`,
                  },
                ].map(({ icon: Icon, label, value }, i) => (
                  <div
                    key={i}
                    style={{
                      background: "var(--bm-deep)",
                      border: "1px solid var(--bm-forest)",
                      borderRadius: "10px",
                      padding: "0.85rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        marginBottom: "0.3rem",
                      }}
                    >
                      <Icon size={12} color="var(--bm-gold)" />
                      <span
                        style={{
                          fontFamily: "var(--font-syne)",
                          fontSize: "0.62rem",
                          color: "rgba(var(--bm-ink-rgb),0.65)",
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                        }}
                      >
                        {label}
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-syne)",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        color: "var(--bm-cream)",
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Tabs ── */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  gap: "0.25rem",
                  background: "var(--bm-deep)",
                  border: "1px solid var(--bm-forest)",
                  borderRadius: "10px",
                  padding: "4px",
                  marginBottom: "1.5rem",
                  width: "fit-content",
                }}
              >
                {(
                  [
                    { key: "itinerary", label: "Itinerary" },
                    { key: "inclusions", label: "Inclusions" },
                    { key: "dates", label: "Dates" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      fontFamily: "var(--font-syne)",
                      fontWeight: 600,
                      fontSize: "0.82rem",
                      padding: "0.5rem 1.1rem",
                      borderRadius: "7px",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      background:
                        activeTab === tab.key
                          ? "var(--bm-forest)"
                          : "transparent",
                      color:
                        activeTab === tab.key
                          ? "var(--bm-cream)"
                          : "rgba(var(--bm-ink-rgb),0.4)",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Itinerary tab */}
              {activeTab === "itinerary" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {adventure.itinerary && adventure.itinerary.length > 0 ? (
                    adventure.itinerary.map((day, i) => (
                      <motion.div
                        key={day.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        style={{
                          display: "flex",
                          gap: "1rem",
                        }}
                      >
                        {/* Day number */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              background: "rgba(212,160,23,0.12)",
                              border: "1px solid rgba(212,160,23,0.25)",
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
                            {day.day_number}
                          </div>
                          {i < (adventure.itinerary?.length ?? 0) - 1 && (
                            <div
                              style={{
                                width: "1px",
                                flex: 1,
                                minHeight: "20px",
                                background: "var(--bm-forest)",
                                margin: "4px 0",
                              }}
                            />
                          )}
                        </div>

                        {/* Day content */}
                        <div
                          style={{
                            background: "var(--bm-deep)",
                            border: "1px solid var(--bm-forest)",
                            borderRadius: "12px",
                            padding: "1.1rem",
                            flex: 1,
                          }}
                        >
                          <h4
                            style={{
                              fontFamily: "var(--font-syne)",
                              fontWeight: 700,
                              fontSize: "0.95rem",
                              color: "var(--bm-cream)",
                              marginBottom: "0.4rem",
                            }}
                          >
                            {day.title}
                          </h4>
                          <p
                            style={{
                              fontFamily: "var(--font-body)",
                              fontSize: "0.82rem",
                              color: "rgba(var(--bm-ink-rgb),0.72)",
                              lineHeight: 1.6,
                              marginBottom: "0.75rem",
                            }}
                          >
                            {day.description}
                          </p>

                          {/* Activities */}
                          {day.activities.length > 0 && (
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "0.4rem",
                                marginBottom: "0.75rem",
                              }}
                            >
                              {day.activities.map((activity, j) => (
                                <span
                                  key={j}
                                  style={{
                                    fontFamily: "var(--font-syne)",
                                    fontSize: "0.65rem",
                                    fontWeight: 600,
                                    padding: "3px 8px",
                                    borderRadius: "999px",
                                    background: "rgba(74,122,88,0.2)",
                                    border: "1px solid rgba(74,122,88,0.3)",
                                    color: "var(--bm-mint)",
                                    letterSpacing: "0.5px",
                                  }}
                                >
                                  {activity}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Day meta */}
                          <div
                            style={{
                              display: "flex",
                              gap: "1rem",
                              flexWrap: "wrap",
                            }}
                          >
                            {day.meals && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <Utensils size={11} color="var(--bm-sage)" />
                                <span
                                  style={{
                                    fontFamily: "var(--font-body)",
                                    fontSize: "0.72rem",
                                    color: "rgba(var(--bm-ink-rgb),0.68)",
                                  }}
                                >
                                  {day.meals}
                                </span>
                              </div>
                            )}
                            {day.accommodation && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <Bed size={11} color="var(--bm-sage)" />
                                <span
                                  style={{
                                    fontFamily: "var(--font-body)",
                                    fontSize: "0.72rem",
                                    color: "rgba(var(--bm-ink-rgb),0.68)",
                                  }}
                                >
                                  {day.accommodation}
                                </span>
                              </div>
                            )}
                            {day.distance_km && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <Footprints size={11} color="var(--bm-sage)" />
                                <span
                                  style={{
                                    fontFamily: "var(--font-body)",
                                    fontSize: "0.72rem",
                                    color: "rgba(var(--bm-ink-rgb),0.68)",
                                  }}
                                >
                                  {day.distance_km} km
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Custom fields */}
                          {day.custom_fields && day.custom_fields.length > 0 && (
                            <div
                              style={{
                                marginTop: "0.75rem",
                                paddingTop: "0.75rem",
                                borderTop: "1px solid var(--bm-forest)",
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.35rem",
                              }}
                            >
                              {day.custom_fields.map((field, j) => (
                                <div
                                  key={j}
                                  style={{
                                    display: "flex",
                                    gap: "0.5rem",
                                    alignItems: "flex-start",
                                  }}
                                >
                                  <span style={{ fontSize: "0.8rem" }}>
                                    {field.icon}
                                  </span>
                                  <span
                                    style={{
                                      fontFamily: "var(--font-syne)",
                                      fontSize: "0.72rem",
                                      fontWeight: 600,
                                      color: "rgba(var(--bm-ink-rgb),0.7)",
                                      minWidth: "80px",
                                    }}
                                  >
                                    {field.label}:
                                  </span>
                                  <span
                                    style={{
                                      fontFamily: "var(--font-body)",
                                      fontSize: "0.72rem",
                                      color: "rgba(var(--bm-ink-rgb),0.75)",
                                    }}
                                  >
                                    {field.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.85rem",
                        color: "rgba(var(--bm-ink-rgb),0.65)",
                        textAlign: "center",
                        padding: "2rem 0",
                      }}
                    >
                      Itinerary coming soon
                    </p>
                  )}
                </div>
              )}

              {/* Inclusions tab */}
              {activeTab === "inclusions" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1.5rem",
                  }}
                >
                  {/* Inclusions */}
                  <div>
                    <h4
                      style={{
                        fontFamily: "var(--font-syne)",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        color: "var(--bm-mint)",
                        marginBottom: "1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Check size={15} color="var(--bm-mint)" />
                      What's Included
                    </h4>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.6rem",
                      }}
                    >
                      {adventure.inclusions?.map((item, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "0.6rem",
                          }}
                        >
                          <Check
                            size={13}
                            color="var(--bm-mint)"
                            style={{ flexShrink: 0, marginTop: "2px" }}
                          />
                          <span
                            style={{
                              fontFamily: "var(--font-body)",
                              fontSize: "0.85rem",
                              color: "rgba(var(--bm-ink-rgb),0.8)",
                              lineHeight: 1.5,
                            }}
                          >
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Exclusions */}
                  <div>
                    <h4
                      style={{
                        fontFamily: "var(--font-syne)",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        color: "var(--bm-rust)",
                        marginBottom: "1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <X size={15} color="var(--bm-rust)" />
                      What's Excluded
                    </h4>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.6rem",
                      }}
                    >
                      {adventure.exclusions?.map((item, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "0.6rem",
                          }}
                        >
                          <X
                            size={13}
                            color="var(--bm-rust)"
                            style={{ flexShrink: 0, marginTop: "2px" }}
                          />
                          <span
                            style={{
                              fontFamily: "var(--font-body)",
                              fontSize: "0.85rem",
                              color: "rgba(var(--bm-ink-rgb),0.8)",
                              lineHeight: 1.5,
                            }}
                          >
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Dates tab */}
              {activeTab === "dates" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {adventure.departure_dates &&
                  adventure.departure_dates.length > 0 ? (
                    adventure.departure_dates.map((date) => {
                      const slots = getSlotsStatus(
                        date.available_slots,
                        date.booked_slots
                      );
                      const isFull = slots.color === "red" && date.available_slots - date.booked_slots === 0;
                      return (
                        <div
                          key={date.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "1rem 1.25rem",
                            background: "var(--bm-deep)",
                            border: "1px solid var(--bm-forest)",
                            borderRadius: "10px",
                            opacity: isFull ? 0.5 : 1,
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontFamily: "var(--font-syne)",
                                fontWeight: 700,
                                fontSize: "0.95rem",
                                color: "var(--bm-cream)",
                              }}
                            >
                              {new Date(date.date).toLocaleDateString(
                                "en-IN",
                                {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                }
                              )}
                            </div>
                            <div
                              style={{
                                fontFamily: "var(--font-body)",
                                fontSize: "0.75rem",
                                color: "rgba(var(--bm-ink-rgb),0.68)",
                                marginTop: "2px",
                              }}
                            >
                              {adventure.duration_days} Days / {adventure.duration_nights} Nights
                            </div>
                          </div>
                          <div
                            style={{
                              fontFamily: "var(--font-syne)",
                              fontWeight: 700,
                              fontSize: "0.75rem",
                              color:
                                slots.color === "red"
                                  ? "var(--bm-red)"
                                  : slots.color === "yellow"
                                  ? "var(--bm-gold)"
                                  : "var(--bm-mint)",
                              background:
                                slots.color === "red"
                                  ? "rgba(192,57,43,0.1)"
                                  : slots.color === "yellow"
                                  ? "rgba(212,160,23,0.1)"
                                  : "rgba(122,184,138,0.1)",
                              border: `1px solid ${
                                slots.color === "red"
                                  ? "rgba(192,57,43,0.25)"
                                  : slots.color === "yellow"
                                  ? "rgba(212,160,23,0.25)"
                                  : "rgba(122,184,138,0.25)"
                              }`,
                              padding: "4px 10px",
                              borderRadius: "999px",
                            }}
                          >
                            {slots.label}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.85rem",
                        color: "rgba(var(--bm-ink-rgb),0.65)",
                        textAlign: "center",
                        padding: "2rem 0",
                      }}
                    >
                      Contact us for available dates
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN — Booking Form ── */}
          <div style={{ position: "sticky", top: "100px" }}>
            <BookingForm
              adventure={adventure}
              onSuccess={() => router.refresh()}
            />
          </div>
        </div>
      </main>
      <Footer sections={sections} />

      <style>{`
        @media (max-width: 768px) {
          .detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .breadcrumb-link:hover {
          color: var(--bm-gold-text) !important;
        }
      `}</style>
    </>
  );
}

const galleryBtnStyle: React.CSSProperties = {
  background: "rgba(10,12,11,0.7)",
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(var(--bm-ink-rgb),0.15)",
  borderRadius: "50%",
  width: "38px",
  height: "38px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "#f2ede4",
  transition: "all 0.2s",
};