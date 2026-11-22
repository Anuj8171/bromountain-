// components/admin/AdminDashboardClient.tsx
// PURPOSE: The dashboard UI for the admin panel (/admin/dashboard).
//   "use client" — renders stat cards, alert banner, monthly bookings chart,
//   recent bookings list, and quick-action links.
//   - Stats come from getAdminStats() in lib/data.ts (fetched by the server
//     component app/admin/dashboard/page.tsx).
//   - Recent bookings from getRecentBookingsAdmin().
//   - Monthly bookings from getMonthlyBookings().
// CONNECTED TO:
//   - app/admin/dashboard/page.tsx (renders <AdminDashboardClient /> with
//     stats, recentBookings, monthlyData props)
//   - lib/data.ts (getAdminStats, getRecentBookingsAdmin, getMonthlyBookings)
//   - lib/live-refresh.ts (not used directly here, but the parent page may call
//     notifyContentUpdated — this client component doesn't call it)
//   - All admin section links point to /admin/bookings, /admin/reviews,
//     /admin/adventures, /admin/sections, /admin/offers
"use client";

import Link from "next/link";
import {
  BookOpen, Star, Map, Users,
  TrendingUp, Clock, CheckCircle, XCircle,
  ArrowRight, Layers, Gift,
} from "lucide-react";

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  pendingReviews: number;
  totalAdventures: number;
  totalSections: number;
}
export default function AdminDashboardClient({
  stats,
  recentBookings,
  monthlyData,
}: {
  stats: Stats;
  recentBookings: any[];
  monthlyData: { month: string; count: number }[];
}) {

  const maxCount = Math.max(...monthlyData.map((m) => m.count), 1);

  const statCards = [
    {
      label: "Total Bookings",
      value: stats.totalBookings,
      icon: BookOpen,
      color: "var(--bm-gold-text)",
      bg: "rgba(212,160,23,0.1)",
      href: "/admin/bookings",
    },
    {
      label: "Pending Bookings",
      value: stats.pendingBookings,
      icon: Clock,
      color: "#e07060",
      bg: "rgba(192,57,43,0.1)",
      href: "/admin/bookings",
      alert: stats.pendingBookings > 0,
    },
    {
      label: "Pending Reviews",
      value: stats.pendingReviews,
      icon: Star,
      color: "var(--bm-mint)",
      bg: "rgba(122,184,138,0.1)",
      href: "/admin/reviews",
      alert: stats.pendingReviews > 0,
    },
    {
      label: "Active Adventures",
      value: stats.totalAdventures,
      icon: Map,
      color: "var(--bm-sage)",
      bg: "rgba(74,122,88,0.1)",
      href: "/admin/adventures",
    },
    {
      label: "Confirmed Bookings",
      value: stats.confirmedBookings,
      icon: CheckCircle,
      color: "var(--bm-mint)",
      bg: "rgba(122,184,138,0.1)",
      href: "/admin/bookings",
    },
    {
      label: "Active Sections",
      value: stats.totalSections,
      icon: Layers,
      color: "var(--bm-gold-text)",
      bg: "rgba(212,160,23,0.1)",
      href: "/admin/sections",
    },
  ];

  return (
    <div style={{ padding: "2rem" }}>

      {/* ── Header ── */}
      <div
        style={{ marginBottom: "2.5rem" }}
      >
        <h1
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize: "1.8rem",
            color: "var(--bm-cream)",
            marginBottom: "0.3rem",
          }}
        >
          Dashboard
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.95rem",
            color: "rgba(var(--bm-ink-rgb),0.68)",
          }}
        >
          Welcome back! Here's what's happening at BroMountain.
        </p>
      </div>

      {/* ── Alert banner if pending items ── */}
      {(stats.pendingBookings > 0 || stats.pendingReviews > 0) && (
        <div
          style={{
            background: "rgba(212,160,23,0.08)",
            border: "1px solid rgba(212,160,23,0.25)",
            borderRadius: "12px",
            padding: "1rem 1.25rem",
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
            }}
          >
            <span style={{ fontSize: "1rem" }}>🔔</span>
            <span
              style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 600,
                fontSize: "0.95rem",
                color: "var(--bm-gold-text)",
              }}
            >
              {stats.pendingBookings > 0 &&
                `${stats.pendingBookings} booking${stats.pendingBookings > 1 ? "s" : ""} need attention`}
              {stats.pendingBookings > 0 && stats.pendingReviews > 0 && " · "}
              {stats.pendingReviews > 0 &&
                `${stats.pendingReviews} review${stats.pendingReviews > 1 ? "s" : ""} awaiting approval`}
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {stats.pendingBookings > 0 && (
              <Link
                href="/admin/bookings"
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  color: "var(--bm-black)",
                  background: "var(--bm-gold)",
                  padding: "0.4rem 0.9rem",
                  borderRadius: "6px",
                  textDecoration: "none",
                }}
              >
                View Bookings
              </Link>
            )}
            {stats.pendingReviews > 0 && (
              <Link
                href="/admin/reviews"
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  color: "var(--bm-gold-text)",
                  background: "rgba(212,160,23,0.12)",
                  border: "1px solid rgba(212,160,23,0.3)",
                  padding: "0.4rem 0.9rem",
                  borderRadius: "6px",
                  textDecoration: "none",
                }}
              >
                Review Queue
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2.5rem",
        }}
      >
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
            >
              <Link
                href={card.href}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    background: "var(--bm-deep)",
                    border: `1px solid ${card.alert ? "rgba(212,160,23,0.3)" : "var(--bm-forest)"}`,
                    borderRadius: "14px",
                    padding: "1.25rem",
                    transition: "all 0.2s",
                    cursor: "pointer",
                  }}
                  className="stat-card"
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "1rem",
                    }}
                  >
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "10px",
                        background: card.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={18} color={card.color} />
                    </div>
                    {card.alert && (
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "var(--bm-gold)",
                          display: "block",
                          animation: "pulse-gold 2s infinite",
                        }}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-syne)",
                      fontWeight: 800,
                      fontSize: "2rem",
                      color: "var(--bm-cream)",
                      lineHeight: 1,
                      marginBottom: "0.35rem",
                    }}
                  >
                    {card.value}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.88rem",
                      color: "rgba(var(--bm-ink-rgb),0.68)",
                    }}
                  >
                    {card.label}
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* ── Bottom grid — chart + recent bookings ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {/* Monthly bookings chart */}
        <div
          style={{
            background: "var(--bm-deep)",
            border: "1px solid var(--bm-forest)",
            borderRadius: "16px",
            padding: "1.5rem",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 700,
              fontSize: "1rem",
              color: "var(--bm-cream)",
              marginBottom: "1.5rem",
            }}
          >
            Monthly Bookings
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "0.75rem",
              height: "140px",
            }}
          >
            {monthlyData.map((m, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.4rem",
                  height: "100%",
                  justifyContent: "flex-end",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-syne)",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "rgba(var(--bm-ink-rgb),0.68)",
                  }}
                >
                  {m.count}
                </span>
                <div
                  style={{
                    width: "100%",
                    height: `${(m.count / maxCount) * 100}px`,
                    background:
                      i === monthlyData.length - 1
                        ? "var(--bm-gold)"
                        : "rgba(212,160,23,0.3)",
                    borderRadius: "4px 4px 0 0",
                    minHeight: "4px",
                    transition: "height 0.6s ease",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-syne)",
                    fontSize: "0.75rem",
                    color: "rgba(var(--bm-ink-rgb),0.65)",
                  }}
                >
                  {m.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent bookings */}
        <div
          style={{
            background: "var(--bm-deep)",
            border: "1px solid var(--bm-forest)",
            borderRadius: "16px",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.25rem",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 700,
                fontSize: "1rem",
                color: "var(--bm-cream)",
              }}
            >
              Recent Bookings
            </h3>
            <Link
              href="/admin/bookings"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontFamily: "var(--font-syne)",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--bm-gold-text)",
                textDecoration: "none",
              }}
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {recentBookings.slice(0, 4).map((booking, i) => (
              <div
                key={booking.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem",
                  background: "rgba(42,74,50,0.1)",
                  borderRadius: "10px",
                  border: "1px solid var(--bm-forest)",
                }}
              >
                <div>
                  <div
                    style={{
                      // Body font keeps g/j descenders legible (see bookings list).
                      fontFamily: "var(--font-body)",
                      fontWeight: 600,
                      fontSize: "0.92rem",
                      color: "var(--bm-cream)",
                    }}
                  >
                    {booking.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.82rem",
                      color: "rgba(var(--bm-ink-rgb),0.65)",
                      marginTop: "2px",
                    }}
                  >
                    {booking.adventure_title}
                  </div>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-syne)",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    letterSpacing: "0.5px",
                    padding: "3px 8px",
                    borderRadius: "999px",
                    background:
                      booking.status === "confirmed"
                        ? "rgba(122,184,138,0.15)"
                        : booking.status === "cancelled"
                        ? "rgba(192,57,43,0.15)"
                        : "rgba(212,160,23,0.15)",
                    color:
                      booking.status === "confirmed"
                        ? "var(--bm-mint)"
                        : booking.status === "cancelled"
                        ? "var(--bm-red)"
                        : "var(--bm-gold-text)",
                    border: `1px solid ${
                      booking.status === "confirmed"
                        ? "rgba(122,184,138,0.3)"
                        : booking.status === "cancelled"
                        ? "rgba(192,57,43,0.3)"
                        : "rgba(212,160,23,0.3)"
                    }`,
                  }}
                >
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div
          style={{
            background: "var(--bm-deep)",
            border: "1px solid var(--bm-forest)",
            borderRadius: "16px",
            padding: "1.5rem",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 700,
              fontSize: "1rem",
              color: "var(--bm-cream)",
              marginBottom: "1.25rem",
            }}
          >
            Quick Actions
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
            }}
          >
            {[
              {
                label: "Add New Adventure",
                href: "/admin/adventures/new",
                icon: Map,
                color: "var(--bm-gold-text)",
              },
              {
                label: "Manage Bookings",
                href: "/admin/bookings",
                icon: BookOpen,
                color: "var(--bm-mint)",
              },
              {
                label: "Review Queue",
                href: "/admin/reviews",
                icon: Star,
                color: "var(--bm-sage)",
              },
              {
                label: "Manage Sections",
                href: "/admin/sections",
                icon: Layers,
                color: "var(--bm-gold-text)",
              },
              {
                label: "Special Offers",
                href: "/admin/offers",
                icon: Gift,
                color: "var(--bm-rust)",
              },
            ].map(({ label, href, icon: Icon, color }, i) => (
              <Link
                key={i}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.8rem 1rem",
                  borderRadius: "10px",
                  border: "1px solid var(--bm-forest)",
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
                className="quick-action"
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.65rem",
                  }}
                >
                  <Icon size={16} color={color} />
                  <span
                    style={{
                      fontFamily: "var(--font-syne)",
                      fontWeight: 600,
                      fontSize: "0.92rem",
                      color: "rgba(var(--bm-ink-rgb),0.82)",
                    }}
                  >
                    {label}
                  </span>
                </div>
                <ArrowRight
                  size={14}
                  color="rgba(var(--bm-ink-rgb),0.25)"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .stat-card:hover {
          border-color: rgba(212,160,23,0.25) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }
        .quick-action:hover {
          border-color: rgba(212,160,23,0.2) !important;
          background: rgba(42,74,50,0.1) !important;
        }
        .quick-action:hover span {
          color: var(--bm-cream) !important;
        }
      `}</style>
    </div>
  );
}
