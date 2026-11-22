// components/admin/AdminSidebar.tsx
// PURPOSE: The collapsible sidebar for the admin panel.
//   - Renders the admin logo + brand, and a vertical nav of admin section
//     links. Each nav item shows an icon + label; active item is highlighted
//     via usePathname.
//   - Toggle button (hamburger) collapses/expands the sidebar; on collapse
//     only icons show.
//   - "Customize Website" at the bottom links to /admin/customize.
//   - Badges: pending bookings count on the Bookings link, pending reviews
//     count on the Reviews link (passed as props from AdminDashboardClient/
//     AdminLayout).
//   - Logout button calls POST /api/admin/logout then redirects to /admin/login.
// CONNECTED TO:
//   - app/admin/layout.tsx (renders <AdminSidebar /> as part of the admin
//     shell, alongside AdminContent).
//   - lib/store.ts (useAppStore for user info + sidebar state — currently not
//     used in this file directly but imported elsewhere in admin).
//   - All admin pages (dashboard, adventures, bookings, reviews, sections,
//     offers) — this sidebar links to them.
//   - framer-motion for the mobile drawer animation.
//   - ThemeToggle (for the theme switch button in the sidebar).
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mountain, LayoutDashboard, Map, BookOpen,
  Star, Layers, Gift, LogOut, Menu, X,
} from "lucide-react";
import toast from "react-hot-toast";
import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/adventures", icon: Map, label: "Adventures" },
  { href: "/admin/bookings", icon: BookOpen, label: "Bookings" },
  { href: "/admin/reviews", icon: Star, label: "Reviews" },
  { href: "/admin/sections", icon: Layers, label: "Sections" },
  { href: "/admin/offers", icon: Gift, label: "Special Offers" },
];

export default function AdminSidebar({
  pendingBookings = 0,
  pendingReviews = 0,
}: {
  pendingBookings?: number;
  pendingReviews?: number;
}) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      toast.success("Logged out");
      router.push("/admin/login");
      router.refresh();
    } catch {
      toast.error("Logout failed");
    }
  };

  const badges: Record<string, number> = {
    "/admin/bookings": pendingBookings,
    "/admin/reviews":  pendingReviews,
  };

  const SidebarContent = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "1.5rem",
          borderBottom: "1px solid var(--bm-forest)",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            // background: "var(--bm-gold)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Image src="/logo.png" alt="BroMountain Logo" width={100} height={100} style={{ objectFit: "contain" }} priority />
        </div>
        <div>
          <div
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 800,
              fontSize: "1rem",
              color: "var(--bm-cream)",
            }}
          >
            Bro<span style={{ color: "var(--bm-gold-text)" }}>Mountains</span>
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.78rem",
              color: "rgba(var(--bm-ink-rgb),0.65)",
            }}
          >
            Admin Panel
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav
        style={{
          flex: 1,
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          overflowY: "auto",
        }}
      >
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          const badge    = badges[href] || 0;

          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.7rem 0.9rem",
                borderRadius: "10px",
                textDecoration: "none",
                background: isActive
                  ? "rgba(212,160,23,0.12)"
                  : "transparent",
                border: `1px solid ${
                  isActive
                    ? "rgba(212,160,23,0.2)"
                    : "transparent"
                }`,
                transition: "all 0.2s",
              }}
              className="admin-nav-link"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.7rem",
                }}
              >
                <Icon
                  size={17}
                  color={
                    isActive
                      ? "var(--bm-gold-text)"
                      : "rgba(var(--bm-ink-rgb),0.55)"
                  }
                />
                <span
                  style={{
                    fontFamily: "var(--font-syne)",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    color: isActive
                      ? "var(--bm-gold-text)"
                      : "rgba(var(--bm-ink-rgb),0.78)",
                  }}
                >
                  {label}
                </span>
              </div>

              {/* Badge */}
              {badge > 0 && (
                <span
                  style={{
                    background: "var(--bm-red)",
                    color: "white",
                    fontFamily: "var(--font-syne)",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    padding: "2px 7px",
                    borderRadius: "999px",
                    minWidth: "20px",
                    textAlign: "center",
                  }}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — view site + logout */}
      <div
        style={{
          padding: "1rem",
          borderTop: "1px solid var(--bm-forest)",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <Link
          href="/"
          target="_blank"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.65rem 0.9rem",
            borderRadius: "10px",
            textDecoration: "none",
            fontFamily: "var(--font-syne)",
            fontWeight: 600,
            fontSize: "0.92rem",
            color: "rgba(var(--bm-ink-rgb),0.78)",
            transition: "color 0.2s",
          }}
          className="admin-nav-link"
        >
          <Mountain size={15} />
          View Website
        </Link>

        {/* Light / dark switch */}
        <ThemeToggle
          size={15}
          label
          className="admin-theme-toggle"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.65rem 0.9rem",
            borderRadius: "10px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-syne)",
            fontWeight: 600,
            fontSize: "0.92rem",
            color: "rgba(var(--bm-ink-rgb),0.78)",
            transition: "color 0.2s",
            width: "100%",
            textAlign: "left",
          }}
        />

        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.65rem 0.9rem",
            borderRadius: "10px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-syne)",
            fontWeight: 600,
            fontSize: "0.92rem",
            color: "var(--bm-red)",
            transition: "color 0.2s",
            width: "100%",
            textAlign: "left",
          }}
          className="logout-btn"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="admin-sidebar-desktop"
        style={{
          width: "270px",
          flexShrink: 0,
          height: "100vh",
          position: "sticky",
          top: 0,
          background: "var(--bm-deep)",
          borderRight: "1px solid var(--bm-forest)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div
        className="admin-mobile-bar"
        style={{
          display: "none",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "var(--bm-deep)",
          borderBottom: "1px solid var(--bm-forest)",
          padding: "1rem 1.5rem",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize: "1rem",
            color: "var(--bm-gold-text)",
          }}
        >
          BroMountain Admin
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ThemeToggle
            size={18}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--bm-cream)",
            }}
          />
          <button
            onClick={() => setOpen(true)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--bm-cream)",
            }}
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 40,
                background: "rgba(0,0,0,0.6)",
              }}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                bottom: 0,
                width: "260px",
                zIndex: 50,
                background: "var(--bm-deep)",
                borderRight: "1px solid var(--bm-forest)",
              }}
            >
              <button
                onClick={() => setOpen(false)}
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--bm-sand)",
                }}
              >
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .admin-nav-link:hover {
          background: rgba(var(--bm-ink-rgb),0.05) !important;
          color: var(--bm-cream) !important;
        }
        .admin-theme-toggle:hover {
          background: rgba(var(--bm-ink-rgb),0.05) !important;
          color: var(--bm-cream) !important;
        }
        .logout-btn:hover {
          color: var(--bm-red) !important;
          background: rgba(192,57,43,0.08) !important;
        }
        @media (max-width: 768px) {
          .admin-sidebar-desktop { display: none !important; }
          .admin-mobile-bar { display: flex !important; }
        }
      `}</style>
    </>
  );
}
