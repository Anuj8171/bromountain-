// components/admin/AdminBookingsClient.tsx
// PURPOSE: The bookings management UI for /admin/bookings.
//   "use client" — renders the bookings list with search, status filter tabs,
//   expandable row detail, and status-update buttons (confirm/pending/cancel).
//   Also an "Open WhatsApp" button that opens whatsapp.com with a pre-filled
//   message for the booking.
//
//   - initialBookings comes from getAllBookingsAdmin() in lib/data.ts,
//     fetched by the server component app/admin/bookings/page.tsx.
//   - Status updates call PUT /api/bookings (expects body { id, status }),
//     then router.refresh() + notifyContentUpdated().
// CONNECTED TO:
//   - app/admin/bookings/page.tsx (renders <AdminBookingsClient />)
//   - lib/data.ts (getAllBookingsAdmin)
//   - lib/live-refresh.ts (notifyContentUpdated called after status change)
//   - app/api/bookings/route.ts (PUT handler for status updates)
//   - components/admin/AdminSidebar.tsx (the sidebar shows a pending-badge count
//     that the parent page computes from this component's data)
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notifyContentUpdated } from "@/lib/live-refresh";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MessageCircle, Phone,
  Mail, Users, Calendar, X,
  ChevronDown, Filter,
} from "lucide-react";
import toast from "react-hot-toast";
// import { dummyBookings, DummyBooking } from "@/lib/dummy-bookings";

const statusColors = {
  pending:   { bg: "rgba(212,160,23,0.12)",  border: "rgba(212,160,23,0.3)",  text: "var(--bm-gold-text)" },
  confirmed: { bg: "rgba(122,184,138,0.12)", border: "rgba(122,184,138,0.3)", text: "var(--bm-mint)" },
  cancelled: { bg: "rgba(192,57,43,0.12)",   border: "rgba(192,57,43,0.3)",   text: "var(--bm-red)"  },
};
export interface Booking {
  id: string;
  adventure_id: string;
  adventure_title: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  group_type: string;
  group_size: number;
  departure_date: string | null;
  special_requests: string | null;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
}

export default function AdminBookingsClient( {
  initialBookings,
}: {
  initialBookings: Booking[];
}) {
  const router = useRouter();
  const [bookings, setBookings]       = useState(initialBookings);
  const [search, setSearch]           = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected]       = useState<Booking | null>(null);

  // ── Filter ──
  const filtered = bookings.filter((b) => {
    const matchSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.adventure_title.toLowerCase().includes(search.toLowerCase()) ||
      b.phone.includes(search) ||
      b.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "all" || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // ── Update status ──
  const updateStatus = async (
  id: string,
  status: "pending" | "confirmed" | "cancelled"
) => {
  setBookings((prev) =>
    prev.map((b) => b.id === id ? { ...b, status } : b)
  );
  if (selected?.id === id) setSelected((prev: any) => prev ? { ...prev, status } : null);

  await fetch("/api/bookings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  });

  router.refresh();
  notifyContentUpdated();
  toast.success(`Booking marked as ${status}`);
};

  // ── Open WhatsApp ──
  const openWhatsApp = (whatsapp: string, booking: Booking) => {
    const message = encodeURIComponent(
      `Hi ${booking.name}! 🏔️\n\n` +
      `This is BroMountain Adventures regarding your booking.\n\n` +
      `*Booking Ref:* ${booking.id}\n` +
      `*Adventure:* ${booking.adventure_title}\n` +
      `*Date:* ${booking.departure_date ? new Date(booking.departure_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "Flexible"}\n\n`
    );
    window.open(`https://wa.me/91${whatsapp}?text=${message}`, "_blank");
  };

  const counts = {
    all:       bookings.length,
    pending:   bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  return (
    <div style={{ padding: "2rem" }}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: "2rem" }}
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
          Bookings
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.95rem",
            color: "rgba(var(--bm-ink-rgb),0.68)",
          }}
        >
          {counts.pending} pending · {counts.confirmed} confirmed · {counts.cancelled} cancelled
        </p>
      </motion.div>

      {/* ── Status filter tabs ── */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        {(["all", "pending", "confirmed", "cancelled"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 600,
              fontSize: "0.9rem",
              padding: "0.45rem 1rem",
              borderRadius: "999px",
              border: "1px solid",
              cursor: "pointer",
              transition: "all 0.2s",
              borderColor:
                filterStatus === s
                  ? "var(--bm-gold)"
                  : "var(--bm-forest)",
              background:
                filterStatus === s
                  ? "rgba(212,160,23,0.12)"
                  : "transparent",
              color:
                filterStatus === s
                  ? "var(--bm-gold-text)"
                  : "rgba(var(--bm-ink-rgb),0.6)",
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s]})
          </button>
        ))}
      </div>

      {/* ── Search ── */}
      <div
        style={{
          position: "relative",
          marginBottom: "1.5rem",
        }}
      >
        <Search
          size={15}
          color="rgba(var(--bm-ink-rgb),0.3)"
          style={{
            position: "absolute",
            left: "0.85rem",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        />
        <input
          type="text"
          placeholder="Search by name, trek, phone or ref..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "0.7rem 1rem 0.7rem 2.5rem",
            borderRadius: "10px",
            border: "1px solid var(--bm-forest)",
            background: "var(--bm-deep)",
            color: "var(--bm-cream)",
            fontFamily: "var(--font-body)",
            fontSize: "0.95rem",
            outline: "none",
          }}
        />
      </div>

      {/* ── Bookings list ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        {filtered.length > 0 ? (
          filtered.map((booking, i) => {
            const colors = statusColors[booking.status];
            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div
                  style={{
                    background: "var(--bm-deep)",
                    border: "1px solid var(--bm-forest)",
                    borderRadius: "14px",
                    padding: "1.25rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  className="booking-card"
                  onClick={() =>
                    setSelected(
                      selected?.id === booking.id ? null : booking
                    )
                  }
                >
                  {/* Top row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "0.75rem",
                    }}
                  >
                    {/* Left info */}
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          marginBottom: "0.3rem",
                        }}
                      >
                        <span
                          style={{
                            // Body font: Syne's sheared, flat-ended g/j tails read
                            // as clipped at this size, so names use DM Sans.
                            fontFamily: "var(--font-body)",
                            fontWeight: 600,
                            fontSize: "1rem",
                            color: "var(--bm-cream)",
                          }}
                        >
                          {booking.name}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-syne)",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: "rgba(var(--bm-ink-rgb),0.6)",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {booking.id}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "1rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "0.88rem",
                            color: "rgba(var(--bm-ink-rgb),0.72)",
                          }}
                        >
                          🏔️ {booking.adventure_title}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "0.88rem",
                            color: "rgba(var(--bm-ink-rgb),0.68)",
                          }}
                        >
                          👥 {booking.group_type} · {booking.group_size}{" "}
                          {booking.group_size === 1 ? "person" : "people"}
                        </span>
                        {booking.departure_date && (
                          <span
                            style={{
                              fontFamily: "var(--font-body)",
                              fontSize: "0.88rem",
                              color: "rgba(var(--bm-ink-rgb),0.68)",
                            }}
                          >
                            📅{" "}
                            {new Date(booking.departure_date).toLocaleDateString(
                              "en-IN",
                              { day: "numeric", month: "short", year: "numeric" }
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right — status + expand */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-syne)",
                          fontWeight: 700,
                          fontSize: "0.8rem",
                          letterSpacing: "0.5px",
                          padding: "4px 10px",
                          borderRadius: "999px",
                          background: colors.bg,
                          color: colors.text,
                          border: `1px solid ${colors.border}`,
                          textTransform: "capitalize",
                        }}
                      >
                        {booking.status}
                      </span>
                      <ChevronDown
                        size={16}
                        color="rgba(var(--bm-ink-rgb),0.3)"
                        style={{
                          transition: "transform 0.2s",
                          transform:
                            selected?.id === booking.id
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                        }}
                      />
                    </div>
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {selected?.id === booking.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          marginTop: "1.25rem",
                          paddingTop: "1.25rem",
                          borderTop: "1px solid var(--bm-forest)",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: "1rem",
                            marginBottom: "1.25rem",
                          }}
                        >
                          {/* Contact info */}
                          <div>
                            <p style={detailLabelStyle}>Contact Details</p>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem",
                              }}
                            >
                              <div style={detailRowStyle}>
                                <Phone size={13} color="var(--bm-sage)" />
                                <span style={detailTextStyle}>{booking.phone}</span>
                              </div>
                              <div style={detailRowStyle}>
                                <MessageCircle size={13} color="var(--bm-sage)" />
                                <span style={detailTextStyle}>{booking.whatsapp}</span>
                              </div>
                              <div style={detailRowStyle}>
                                <Mail size={13} color="var(--bm-sage)" />
                                <span style={detailTextStyle}>{booking.email}</span>
                              </div>
                            </div>
                          </div>

                          {/* Booking info */}
                          <div>
                            <p style={detailLabelStyle}>Booking Details</p>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem",
                              }}
                            >
                              <div style={detailRowStyle}>
                                <Users size={13} color="var(--bm-sage)" />
                                <span style={detailTextStyle}>
                                  {booking.group_type} — {booking.group_size} people
                                </span>
                              </div>
                              <div style={detailRowStyle}>
                                <Calendar size={13} color="var(--bm-sage)" />
                                <span style={detailTextStyle}>
                                  {booking.departure_date
                                    ? new Date(booking.departure_date).toLocaleDateString(
                                        "en-IN",
                                        { day: "numeric", month: "long", year: "numeric" }
                                      )
                                    : "Flexible"}
                                </span>
                              </div>
                              <div style={detailRowStyle}>
                                <span
                                  style={{
                                    fontFamily: "var(--font-body)",
                                    fontSize: "0.82rem",
                                    color: "rgba(var(--bm-ink-rgb),0.65)",
                                  }}
                                >
                                  Submitted:{" "}
                                  {new Date(booking.created_at).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Special requests */}
                          {booking.special_requests && (
                            <div>
                              <p style={detailLabelStyle}>Special Requests</p>
                              <p
                                style={{
                                  fontFamily: "var(--font-body)",
                                  fontSize: "0.92rem",
                                  color: "rgba(var(--bm-ink-rgb),0.78)",
                                  lineHeight: 1.5,
                                  padding: "0.65rem",
                                  background: "rgba(42,74,50,0.15)",
                                  borderRadius: "8px",
                                  border: "1px solid var(--bm-forest)",
                                }}
                              >
                                {booking.special_requests}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div
                          style={{
                            display: "flex",
                            gap: "0.75rem",
                            flexWrap: "wrap",
                          }}
                        >
                          {/* WhatsApp */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openWhatsApp(booking.whatsapp, booking);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              fontFamily: "var(--font-syne)",
                              fontWeight: 700,
                              fontSize: "0.92rem",
                              padding: "0.6rem 1.2rem",
                              borderRadius: "8px",
                              border: "none",
                              background: "#25D366",
                              color: "white",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                          >
                            <MessageCircle size={15} />
                            Open WhatsApp
                          </button>

                          {/* Status buttons */}
                          {booking.status !== "confirmed" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatus(booking.id, "confirmed");
                              }}
                              style={{
                                fontFamily: "var(--font-syne)",
                                fontWeight: 600,
                                fontSize: "0.92rem",
                                padding: "0.6rem 1.2rem",
                                borderRadius: "8px",
                                border: "1px solid rgba(122,184,138,0.3)",
                                background: "rgba(122,184,138,0.1)",
                                color: "var(--bm-mint)",
                                cursor: "pointer",
                              }}
                            >
                              ✓ Mark Confirmed
                            </button>
                          )}

                          {booking.status !== "pending" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatus(booking.id, "pending");
                              }}
                              style={{
                                fontFamily: "var(--font-syne)",
                                fontWeight: 600,
                                fontSize: "0.92rem",
                                padding: "0.6rem 1.2rem",
                                borderRadius: "8px",
                                border: "1px solid rgba(212,160,23,0.3)",
                                background: "rgba(212,160,23,0.1)",
                                color: "var(--bm-gold-text)",
                                cursor: "pointer",
                              }}
                            >
                              ↺ Mark Pending
                            </button>
                          )}

                          {booking.status !== "cancelled" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatus(booking.id, "cancelled");
                              }}
                              style={{
                                fontFamily: "var(--font-syne)",
                                fontWeight: 600,
                                fontSize: "0.92rem",
                                padding: "0.6rem 1.2rem",
                                borderRadius: "8px",
                                border: "1px solid rgba(192,57,43,0.3)",
                                background: "rgba(192,57,43,0.1)",
                                color: "var(--bm-red)",
                                cursor: "pointer",
                              }}
                            >
                              ✗ Cancel
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "4rem",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
            <p
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "1rem",
                color: "rgba(var(--bm-ink-rgb),0.6)",
              }}
            >
              No bookings found
            </p>
          </div>
        )}
      </div>

      <style>{`
        .booking-card:hover {
          border-color: rgba(212,160,23,0.2) !important;
          background: rgba(42,74,50,0.08) !important;
        }
      `}</style>
    </div>
  );
}

// ── Style helpers ──
const detailLabelStyle: React.CSSProperties = {
  fontFamily: "var(--font-syne)",
  fontWeight: 700,
  fontSize: "0.8rem",
  letterSpacing: "1.5px",
  textTransform: "uppercase",
  color: "rgba(var(--bm-ink-rgb),0.6)",
  marginBottom: "0.6rem",
};

const detailRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const detailTextStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "0.92rem",
  color: "rgba(var(--bm-ink-rgb),0.78)",
};