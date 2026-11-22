// components/Navbar.tsx
// PURPOSE: The site-wide navigation header. Renders on every public page
//   (included by app/layout.tsx → app/page.tsx → <Navbar />, and other
//   pages that import it). Responsive: desktop links + mobile hamburger menu.
//
//   FEATURES:
//   - Fixed position, transparent on the hero (Home page first view), solid
//     glass background after scrolling or on non-home pages.
//   - Auto-hides on scroll-down, re-appears on scroll-up.
//   - Active link highlighting based on current pathname.
//   - Theme toggle button (delegates to ThemeToggle component).
//   - "Book Now" CTA links to /adventures.
//   - Mobile: hamburger → slide-down menu with the same links + CTA.
//   - Locks body scroll while mobile menu is open.
//
// CONNECTED TO:
//   - app/page.tsx (renders <Navbar /> on the home page),
//   - app/adventures/page.tsx, app/reviews/page.tsx, app/contact/page.tsx
//     (each imports and renders Navbar directly),
//   - app/adventures/[slug]/page.tsx (imports and renders Navbar),
//   - ThemeToggle.tsx (for the theme switch button),
//   - app/layout.tsx (provides the site-wide mountain backdrop that the
//     transparent navbar sits on top of on the home page).
//
// TECH: "use client" — uses React state + scroll effect + framer-motion
//   for menu animation. Uses next/link for client-side navigation.
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Adventures", href: "/adventures" },
  { label: "Reviews", href: "/reviews" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  // ── Solid background after scrolling, and slide the bar away when the
  //    reader scrolls down so it only comes back on the way up ──
  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        setScrolled(y > 20);
        if (y < 80) setHidden(false);
        else if (Math.abs(y - lastY) > 4) setHidden(y > lastY);
        lastY = y;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // ── Lock body scroll while the menu is open ──
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  const isHome = pathname === "/";
  const solid = scrolled || menuOpen || !isHome;

  return (
    <header
      className={`bm-header${solid ? " is-solid" : " on-photo"}`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: solid ? "var(--bm-nav-bg)" : "transparent",
        backdropFilter: solid ? "blur(14px)" : "none",
        WebkitBackdropFilter: solid ? "blur(14px)" : "none",
        borderBottom: solid ? "1px solid var(--bm-glass-border)" : "1px solid transparent",
        transform: hidden && !menuOpen ? "translateY(-105%)" : "translateY(0)",
        transition:
          "transform 0.35s ease, background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease",
        willChange: "transform",
      }}
    >
      <nav
        className="bm-nav"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem",
          minHeight: "76px",
        }}
      >
        {/* ── Brand ── */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <Image
            src="/logo.png"
            alt="BroMountain Logo"
            width={40}
            height={40}
            style={{ objectFit: "contain", width: "40px", height: "40px" }}
            priority
          />
          <div>
            <span
              className="bm-brand-name"
              style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 800,
                fontSize: "1.15rem",
                letterSpacing: "-0.3px",
                display: "block",
                lineHeight: 1,
              }}
            >
              Bro<span className="bm-brand-accent">Mountain</span>
            </span>
            <span
              className="bm-brand-tag"
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "0.55rem",
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                display: "block",
                lineHeight: 1,
                marginTop: "4px",
              }}
            >
              Go where roads don&apos;t
            </span>
          </div>
        </Link>

        {/* ── Desktop links ── */}
        <div
          className="bm-nav-links"
          style={{ alignItems: "center", gap: "2.25rem" }}
        >
          {navLinks.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`bm-nav-link${active ? " is-active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* ── Actions ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexShrink: 0 }}>
          <ThemeToggle className="bm-icon-btn" size={17} />

          <Link href="/adventures" className="bm-cta bm-nav-cta">
            Book Now
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="bm-icon-btn bm-nav-burger"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="bm-mobile-menu"
          >
            {navLinks.map((link) => {
              const active =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`bm-mobile-link${active ? " is-active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/adventures"
              className="bm-cta"
              style={{ marginTop: "0.75rem", textAlign: "center" }}
              onClick={() => setMenuOpen(false)}
            >
              Book Now
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .bm-nav { padding: 0 1.25rem; }

        .bm-nav-links { display: flex; }

        .bm-brand-name { color: var(--bm-cream); }
        .bm-brand-accent { color: var(--bm-gold-text); }
        .bm-brand-tag { color: var(--bm-sand); }

        /* Navbar sitting directly on a hero photo */
        .bm-header.on-photo .bm-brand-name { color: var(--bm-on-photo); }
        .bm-header.on-photo .bm-brand-accent { color: var(--bm-gold-light); }
        .bm-header.on-photo .bm-brand-tag { color: var(--bm-on-photo-ink); }
        .bm-header.on-photo .bm-nav-link { color: var(--bm-on-photo); }
        .bm-header.on-photo .bm-nav-link:hover,
        .bm-header.on-photo .bm-nav-link.is-active { color: var(--bm-gold-light); }
        .bm-header.on-photo .bm-icon-btn {
          color: var(--bm-on-photo);
          background: rgba(250, 247, 240, 0.12);
          border-color: rgba(250, 247, 240, 0.28);
        }
        .bm-header.on-photo .bm-icon-btn:hover {
          color: var(--bm-gold-light);
          border-color: var(--bm-gold-light);
        }

        .bm-nav-link {
          position: relative;
          font-family: var(--font-syne);
          font-weight: 600;
          font-size: 0.9rem;
          letter-spacing: 0.4px;
          text-decoration: none;
          color: var(--bm-cream);
          opacity: 0.78;
          padding: 4px 0;
          transition: opacity 0.2s, color 0.2s;
        }
        .bm-nav-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -2px;
          height: 2px;
          width: 0;
          background: var(--bm-gold);
          border-radius: 2px;
          transition: width 0.25s ease;
        }
        .bm-nav-link:hover,
        .bm-nav-link.is-active { opacity: 1; color: var(--bm-gold-text); }
        .bm-nav-link:hover::after,
        .bm-nav-link.is-active::after { width: 100%; }

        .bm-cta {
          font-family: var(--font-syne);
          font-weight: 700;
          font-size: 0.85rem;
          letter-spacing: 0.4px;
          text-decoration: none;
          color: var(--bm-black);
          background: var(--bm-gold);
          padding: 0.6rem 1.4rem;
          border-radius: 999px;
          display: inline-block;
          line-height: 1;
          transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .bm-cta:hover {
          background: var(--bm-gold-light);
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(212, 160, 23, 0.35);
        }

        .bm-icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          cursor: pointer;
          color: var(--bm-cream);
          background: var(--bm-glass);
          border: 1px solid var(--bm-glass-border);
          transition: color 0.2s, border-color 0.2s, background 0.2s;
        }
        .bm-icon-btn:hover {
          color: var(--bm-gold-text);
          border-color: var(--bm-gold);
        }

        .bm-nav-burger { display: none; }

        .bm-mobile-menu {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 0.5rem 1.25rem 1.5rem;
          background: var(--bm-nav-bg);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--bm-glass-border);
        }
        .bm-mobile-link {
          font-family: var(--font-syne);
          font-weight: 600;
          font-size: 1rem;
          text-decoration: none;
          color: var(--bm-cream);
          padding: 0.85rem 0.25rem;
          border-bottom: 1px solid var(--bm-glass-border);
        }
        .bm-mobile-link.is-active { color: var(--bm-gold-text); }

        @media (min-width: 860px) {
          .bm-nav { padding: 0 2.5rem; }
        }
        @media (max-width: 859px) {
          .bm-nav-links { display: none; }
          .bm-nav-cta { display: none; }
          .bm-nav-burger { display: inline-flex; }
        }
      `}</style>
    </header>
  );
}
