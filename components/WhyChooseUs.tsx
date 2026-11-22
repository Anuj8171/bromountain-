"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Users,
  Mountain,
  Clock,
  Award,
  Heart,
} from "lucide-react";

const reasons = [
  {
    icon: Shield,
    title: "Safety First",
    description:
      "Certified guides, first aid trained staff, and emergency protocols on every trek. Your safety is never compromised.",
  },
  {
    icon: Mountain,
    title: "Local Expertise",
    description:
      "Born and based in Uttarkashi — we know these mountains better than anyone. Every trail, every weather pattern.",
  },
  {
    icon: Users,
    title: "Small Groups",
    description:
      "We keep groups small so every trekker gets personal attention. No crowded batches, no rushing.",
  },
  {
    icon: Clock,
    title: "3+ Years Experience",
    description:
      "Over 3 years of leading treks across Uttarakhand. 2400+ happy trekkers and counting.",
  },
  {
    icon: Award,
    title: "Quality Guaranteed",
    description:
      "Premium camping gear, nutritious meals cooked fresh, comfortable accommodation at every stop.",
  },
  {
    icon: Heart,
    title: "Personal Touch",
    description:
      "We treat every trekker like family. From the first WhatsApp message to the final descent.",
  },
];

export default function WhyChooseUs() {
  return (
    <section
      style={{
        padding: "6rem 1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* bg accent */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "600px",
          background: "var(--bm-moss)",
          opacity: 0.06,
          filter: "blur(80px)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* ── Heading ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "4rem" }}
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
            ✦ Why BroMountain
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
            We Don't Just Lead Treks.{" "}
            <em style={{ color: "var(--bm-gold-text)", fontStyle: "italic" }}>
              We Create Memories.
            </em>
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "1rem",
              color: "rgba(var(--bm-ink-rgb),0.72)",
              marginTop: "1rem",
              maxWidth: "500px",
              margin: "1rem auto 0",
              lineHeight: 1.7,
            }}
          >
            From Uttarkashi's backstreets to Himalayan summits — here's why
            20+ trekkers chose us
          </p>
        </motion.div>

        {/* ── Grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {reasons.map((reason, i) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                style={{
                  background: "var(--bm-deep)",
                  border: "1px solid var(--bm-forest)",
                  borderRadius: "16px",
                  padding: "1.75rem",
                  display: "flex",
                  gap: "1.25rem",
                  alignItems: "flex-start",
                  transition: "all 0.3s ease",
                }}
                className="why-card"
              >
                {/* Icon */}
                <div
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "12px",
                    background: "rgba(212,160,23,0.1)",
                    border: "1px solid rgba(212,160,23,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} color="var(--bm-gold)" strokeWidth={1.5} />
                </div>

                {/* Text */}
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-syne)",
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "var(--bm-cream)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {reason.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.85rem",
                      color: "rgba(var(--bm-ink-rgb),0.72)",
                      lineHeight: 1.65,
                    }}
                  >
                    {reason.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <style>{`
        .why-card:hover {
          border-color: rgba(212,160,23,0.25) !important;
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.25);
        }
      `}</style>
    </section>
  );
}
