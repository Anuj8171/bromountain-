// components/Footer.tsx
// PURPOSE: Site-wide footer rendered at the bottom of every public page.
//   "use client" because it filters active sections client-side and uses
//   client components (Link, Image, Lucide icons).
//   Columns: Brand + socials | Activities (links to /adventures?section=) |
//   Quick Links (/adventures, /reviews, /contact) | Contact info.
//   Bottom row: copyright + "Made with ❤️ in Uttarkashi".
// CONNECTED TO:
//   - app/page.tsx (renders <Footer sections={sections} />)
//   - app/contact/page.tsx would import Footer too if it used it (currently
//     ContactClient renders its own Navbar + no Footer — check if intended)
//   - types/index.ts (Section type for the sections prop)
//   - lib/data.ts (sections come from getSections / getActiveSections)
"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Instagram, MessageCircle } from "lucide-react";
import { Section } from "@/types";

export default function Footer({ sections }: { sections: Section[] }) {
  const activeSections = sections.filter((s) => s.status === "active");
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "var(--bm-deep)",
        borderTop: "1px solid var(--bm-forest)",
        padding: "5rem 1.5rem 2rem",
        marginTop: "4rem",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* ── Top grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "3rem",
            marginBottom: "4rem",
          }}
        >
          {/* Brand column */}
          <div>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                textDecoration: "none",
                marginBottom: "1.25rem",
              }}
            >
              <Image
                src="/logo3.png"
                alt="BroMountain"
                width={62} // bigger logo
                height={62}
                style={{ objectFit: "contain" }}
              />
              <span
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 700,
                  fontSize: "1rem", // smaller text
                  color: "var(--bm-cream)",
                }}
              >
                Bro<span style={{ color: "var(--bm-gold-text)" }}>Mountains</span>
              </span>
            </Link>

            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.85rem",
                color: "rgba(var(--bm-ink-rgb),0.7)",
                lineHeight: 1.7,
                marginBottom: "1.5rem",
                maxWidth: "240px",
              }}
            >
              Go where roads don't. Uttarakhand's finest trekking and
              adventure experiences based in Uttarkashi.
            </p>

            {/* Social links */}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {[
                {
                  icon: Instagram,
                  href: "https://www.instagram.com/bromountains/",
                  label: "Instagram",
                },
                {
                  icon: MessageCircle,
                  href: "https://whatsapp.com/channel/0029Vb6ljRcBPzjRrHFtEP2Z",
                  label: "WhatsApp Channel",
                },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "var(--bm-forest)",
                    border: "1px solid var(--bm-moss)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(var(--bm-ink-rgb),0.72)",
                    transition: "all 0.2s",
                    textDecoration: "none",
                  }}
                  className="social-icon"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Activities column */}
          <div>
            <h4
              style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 700,
                fontSize: "0.8rem",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "var(--bm-gold-text)",
                marginBottom: "1.25rem",
              }}
            >
              Activities
            </h4>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.65rem",
              }}
            >
              {activeSections.map((section) => (
                <Link
                  key={section.id}
                  href={`/adventures?section=${section.slug}`}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.85rem",
                    color: "rgba(var(--bm-ink-rgb),0.72)",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    transition: "color 0.2s",
                  }}
                  className="footer-link"
                >
                  <span style={{ fontSize: "0.9rem" }}>
                    {section.icon}
                  </span>
                  {section.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick links column */}
          <div>
            <h4
              style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 700,
                fontSize: "0.8rem",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "var(--bm-gold-text)",
                marginBottom: "1.25rem",
              }}
            >
              Quick Links
            </h4>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.65rem",
              }}
            >
              {[
                { label: "All Adventures", href: "/adventures" },
                { label: "Reviews", href: "/reviews" },
                { label: "Contact Us", href: "/contact" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.85rem",
                    color: "rgba(var(--bm-ink-rgb),0.72)",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  className="footer-link"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact column */}
          <div>
            <h4
              style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 700,
                fontSize: "0.8rem",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "var(--bm-gold-text)",
                marginBottom: "1.25rem",
              }}
            >
              Contact
            </h4>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
              }}
            >
              {[
                {
                  icon: MapPin,
                  text: "Uttarkashi, Uttarakhand, India",
                },
                {
                  icon: Phone,
                  text: "+91 8171299264",
                },
                {
                  icon: Mail,
                  text: "hello@bromountain.in",
                },
              ].map(({ icon: Icon, text }, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.6rem",
                  }}
                >
                  <Icon
                    size={14}
                    color="var(--bm-gold)"
                    style={{ marginTop: "2px", flexShrink: 0 }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.82rem",
                      color: "rgba(var(--bm-ink-rgb),0.72)",
                      lineHeight: 1.5,
                    }}
                  >
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            background: "var(--bm-forest)",
            marginBottom: "2rem",
          }}
        />

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.78rem",
              color: "rgba(var(--bm-ink-rgb),0.6)",
            }}
          >
            © {year} BroMountain Adventures. All rights reserved.
          </p>

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.78rem",
              color: "rgba(var(--bm-ink-rgb),0.6)",
            }}
          >
            Made with ❤️ in Uttarkashi, Uttarakhand
          </p>
        </div>
      </div>

      <style>{`
        .footer-link:hover { color: var(--bm-gold-text) !important; }
        .social-icon:hover {
          background: var(--bm-moss) !important;
          color: var(--bm-gold-text) !important;
          border-color: rgba(212,160,23,0.3) !important;
        }
      `}</style>
    </footer>
  );
}