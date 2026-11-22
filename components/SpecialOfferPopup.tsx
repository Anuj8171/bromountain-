"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";

import {SpecialOffer} from "@/types";

export default function SpecialOfferPopup({ offer }: { offer: SpecialOffer }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // check if already dismissed in this session
    const wasDismissed = sessionStorage.getItem("bm_offer_dismissed");
    if (wasDismissed) return;

    // check if offer is active and not expired
    if (!offer.is_active) return;
    if (offer.expires_at && new Date(offer.expires_at) < new Date()) return;

    // show after 2.5 seconds
    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer);
  }, [offer]);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem("bm_offer_dismissed", "true");
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleDismiss}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(4px)",
            }}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 101,
              width: "min(480px, 90vw)",
              background: "var(--bm-deep)",
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
              border: "1px solid rgba(212,160,23,0.25)",
            }}
          >
            {/* Gold top bar */}
            <div
              style={{
                height: "4px",
                background:
                  "linear-gradient(90deg, var(--bm-gold), var(--bm-gold-light), var(--bm-gold))",
                backgroundSize: "200% auto",
                animation: "shimmer 3s linear infinite",
              }}
            />

            {/* Close button */}
            <button
              onClick={handleDismiss}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "rgba(var(--bm-ink-rgb),0.08)",
                border: "1px solid rgba(var(--bm-ink-rgb),0.12)",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "rgba(var(--bm-ink-rgb),0.78)",
                transition: "all 0.2s",
                zIndex: 1,
              }}
              className="popup-close"
            >
              <X size={15} />
            </button>

            {/* Content */}
            <div style={{ padding: "2.5rem" }}>
              {/* Badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(212,160,23,0.12)",
                  border: "1px solid rgba(212,160,23,0.3)",
                  borderRadius: "999px",
                  padding: "0.35rem 1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <Sparkles size={12} color="var(--bm-gold)" />
                <span
                  style={{
                    fontFamily: "var(--font-syne)",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "var(--bm-gold-text)",
                  }}
                >
                  {offer.badge_text}
                </span>
              </div>

              {/* Title */}
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  color: "var(--bm-cream)",
                  lineHeight: 1.2,
                  marginBottom: "0.75rem",
                }}
              >
                {offer.title}
              </h3>

              {/* Subtitle */}
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.95rem",
                  color: "rgba(var(--bm-ink-rgb),0.78)",
                  lineHeight: 1.6,
                  marginBottom: "1.5rem",
                }}
              >
                {offer.subtitle}
              </p>

              {/* Expiry */}
              {offer.expires_at && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "2rem",
                    padding: "0.6rem 1rem",
                    background: "rgba(192,57,43,0.08)",
                    border: "1px solid rgba(192,57,43,0.2)",
                    borderRadius: "8px",
                  }}
                >
                  <span style={{ fontSize: "0.8rem" }}>⏰</span>
                  <span
                    style={{
                      fontFamily: "var(--font-syne)",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#e07060",
                    }}
                  >
                    Offer expires{" "}
                    {new Date(offer.expires_at).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </span>
                </div>
              )}

              {/* CTA buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                <Link
                  href="/adventures"
                  onClick={handleDismiss}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    fontFamily: "var(--font-syne)",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    textDecoration: "none",
                    color: "var(--bm-black)",
                    background: "var(--bm-gold)",
                    padding: "0.85rem 1.5rem",
                    borderRadius: "10px",
                    transition: "all 0.2s",
                    minWidth: "140px",
                  }}
                  className="popup-cta"
                >
                  Book Now 🏔️
                </Link>
                <button
                  onClick={handleDismiss}
                  style={{
                    fontFamily: "var(--font-syne)",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    color: "rgba(var(--bm-ink-rgb),0.7)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.85rem 1rem",
                    borderRadius: "10px",
                    transition: "color 0.2s",
                    whiteSpace: "nowrap",
                  }}
                  className="popup-skip"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>

          <style>{`
            .popup-close:hover {
              background: rgba(var(--bm-ink-rgb),0.15) !important;
              color: var(--bm-cream) !important;
            }
            .popup-cta:hover {
              background: var(--bm-gold-light) !important;
              transform: translateY(-1px);
            }
            .popup-skip:hover {
              color: rgba(var(--bm-ink-rgb),0.82) !important;
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}
