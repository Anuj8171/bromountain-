"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { notifyContentUpdated } from "@/lib/live-refresh";
import { Plus, Trash2, Power, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

import { SpecialOffer } from "@/types";

export default function AdminOffersClient({
  initialOffers,
}: {
  initialOffers: SpecialOffer[];
}) {
  const router = useRouter();
  const [offers, setOffers]     = useState<SpecialOffer[]>(initialOffers);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "", subtitle: "", badge_text: "LIMITED TIME", expires_at: "",
  });

  const resetForm = () => {
    setForm({ title: "", subtitle: "", badge_text: "LIMITED TIME", expires_at: "" });
    setShowForm(false);
  };

  // ── Toggle active — only one active at a time ──
const toggleActive = async (id: string) => {
  const offer = offers.find((o) => o.id === id);
  if (!offer) return;

  const newActive = !offer.is_active;
  setOffers((prev) =>
    prev.map((o) =>
      o.id === id
        ? { ...o, is_active: newActive }
        : { ...o, is_active: false }
    )
  );

  await fetch("/api/offers", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, is_active: newActive }),
  });

  router.refresh();
  notifyContentUpdated();
  toast.success(newActive ? "Popup turned ON ✅" : "Popup turned OFF");
};

const handleAdd = async () => {
  if (!form.title || !form.subtitle) {
    toast.error("Title and subtitle are required");
    return;
  }

  const res = await fetch("/api/offers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  const created = await res.json();

  setOffers((prev) => [
    ...prev.map((o) => ({ ...o, is_active: false })),
    created,
  ]);
  router.refresh();
  notifyContentUpdated();
  toast.success("Offer created and activated!");
  resetForm();
};

const handleDelete = async (id: string) => {
  setOffers((prev) => prev.filter((o) => o.id !== id));
  setDeleteConfirm(null);

  await fetch(`/api/offers?id=${id}`, { method: "DELETE" });
  router.refresh();
  notifyContentUpdated();
  toast.success("Offer deleted");
};

  const activeOffer = offers.find((o) => o.is_active);

  return (
    <div style={{ padding: "2rem" }}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 800,
              fontSize: "1.8rem",
              color: "var(--bm-cream)",
              marginBottom: "0.3rem",
            }}
          >
            Special Offers
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.95rem",
              color: "rgba(var(--bm-ink-rgb),0.68)",
            }}
          >
            {activeOffer
              ? "1 popup currently active on website"
              : "No popup active right now"}
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontFamily: "var(--font-syne)",
            fontWeight: 700,
            fontSize: "0.98rem",
            padding: "0.7rem 1.3rem",
            borderRadius: "10px",
            border: "none",
            background: "var(--bm-gold)",
            color: "var(--bm-black)",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          className="add-btn"
        >
          <Plus size={16} />
          New Offer
        </button>
      </motion.div>

      {/* ── Info banner ── */}
      <div
        style={{
          background: "rgba(212,160,23,0.06)",
          border: "1px solid rgba(212,160,23,0.15)",
          borderRadius: "12px",
          padding: "1rem 1.25rem",
          marginBottom: "2rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <Sparkles size={16} color="var(--bm-gold)" />
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.92rem",
            color: "rgba(var(--bm-ink-rgb),0.72)",
            lineHeight: 1.5,
          }}
        >
          Only <strong style={{ color: "var(--bm-gold-text)" }}>one popup</strong> can
          be active at a time. Activating a new offer automatically deactivates the
          previous one. Popups auto-hide when the expiry date passes.
        </p>
      </div>

      {/* ── Add form ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              background: "var(--bm-deep)",
              border: "1px solid rgba(212,160,23,0.25)",
              borderRadius: "16px",
              padding: "1.5rem",
              marginBottom: "2rem",
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
              Create New Offer
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1rem",
                marginBottom: "1.25rem",
              }}
            >
              <div style={{ gridColumn: "span 2" }}>
                <label style={labelStyle}>Popup Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Summer Special! 🏔️"
                  style={inputStyle}
                />
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={labelStyle}>Subtitle *</label>
                <input
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="e.g. Book any trek before 30 April and get flat ₹500 off"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Badge Text</label>
                <input
                  value={form.badge_text}
                  onChange={(e) => setForm({ ...form, badge_text: e.target.value })}
                  placeholder="LIMITED TIME"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Expiry Date (optional)</label>
                <input
                  type="date"
                  value={form.expires_at}
                  onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                  style={inputStyle}
                />
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.8rem",
                    color: "rgba(var(--bm-ink-rgb),0.6)",
                    marginTop: "0.25rem",
                  }}
                >
                  Leave empty for no expiry
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={handleAdd}
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  padding: "0.7rem 1.5rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "var(--bm-gold)",
                  color: "var(--bm-black)",
                  cursor: "pointer",
                }}
              >
                Create & Activate
              </button>
              <button
                onClick={resetForm}
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  padding: "0.7rem 1.25rem",
                  borderRadius: "8px",
                  border: "1px solid var(--bm-forest)",
                  background: "transparent",
                  color: "var(--bm-sand)",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Offers list ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {offers.map((offer, i) => {
          const isExpired =
            offer.expires_at &&
            new Date(offer.expires_at) < new Date();

          return (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{
                background: "var(--bm-deep)",
                border: `1px solid ${
                  offer.is_active
                    ? "rgba(212,160,23,0.35)"
                    : "var(--bm-forest)"
                }`,
                borderRadius: "16px",
                padding: "1.5rem",
                opacity: isExpired ? 0.6 : 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                {/* Left content */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "0.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "var(--font-syne)",
                        fontWeight: 700,
                        fontSize: "1.05rem",
                        color: "var(--bm-cream)",
                      }}
                    >
                      {offer.title}
                    </h3>

                    {/* Active badge */}
                    {offer.is_active && !isExpired && (
                      <span className="offer-badge">
                        ✦ LIVE ON WEBSITE
                      </span>
                    )}

                    {/* Expired badge */}
                    {isExpired && (
                      <span
                        style={{
                          fontFamily: "var(--font-syne)",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          letterSpacing: "1px",
                          padding: "3px 8px",
                          borderRadius: "999px",
                          background: "rgba(192,57,43,0.1)",
                          color: "var(--bm-red)",
                          border: "1px solid rgba(192,57,43,0.25)",
                        }}
                      >
                        EXPIRED
                      </span>
                    )}
                  </div>

                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.95rem",
                      color: "rgba(var(--bm-ink-rgb),0.75)",
                      marginBottom: "0.6rem",
                      lineHeight: 1.5,
                    }}
                  >
                    {offer.subtitle}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-syne)",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "rgba(var(--bm-ink-rgb),0.65)",
                      }}
                    >
                      Badge: {offer.badge_text}
                    </span>
                    {offer.expires_at && (
                      <span
                        style={{
                          fontFamily: "var(--font-syne)",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color: isExpired
                            ? "var(--bm-red)"
                            : "rgba(var(--bm-ink-rgb),0.35)",
                        }}
                      >
                        Expires:{" "}
                        {new Date(offer.expires_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    )}
                    {!offer.expires_at && (
                      <span
                        style={{
                          fontFamily: "var(--font-syne)",
                          fontSize: "0.8rem",
                          color: "rgba(var(--bm-ink-rgb),0.65)",
                        }}
                      >
                        No expiry date
                      </span>
                    )}
                  </div>
                </div>

                {/* Right — actions */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  {/* Toggle ON/OFF */}
                  {!isExpired && (
                    <button
                      onClick={() => toggleActive(offer.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        fontFamily: "var(--font-syne)",
                        fontWeight: 600,
                        fontSize: "0.88rem",
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        border: "1px solid",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        borderColor: offer.is_active
                          ? "rgba(122,184,138,0.3)"
                          : "var(--bm-forest)",
                        background: offer.is_active
                          ? "rgba(122,184,138,0.1)"
                          : "transparent",
                        color: offer.is_active
                          ? "var(--bm-mint)"
                          : "rgba(var(--bm-ink-rgb),0.4)",
                      }}
                    >
                      <Power size={13} />
                      {offer.is_active ? "ON" : "OFF"}
                    </button>
                  )}

                  {/* Delete */}
                  {deleteConfirm === offer.id ? (
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        onClick={() => handleDelete(offer.id)}
                        style={{
                          fontFamily: "var(--font-syne)",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          padding: "5px 10px",
                          borderRadius: "6px",
                          border: "none",
                          background: "var(--bm-red)",
                          color: "white",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        style={{
                          fontFamily: "var(--font-syne)",
                          fontWeight: 600,
                          fontSize: "0.82rem",
                          padding: "5px 10px",
                          borderRadius: "6px",
                          border: "1px solid var(--bm-forest)",
                          background: "transparent",
                          color: "var(--bm-sand)",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(offer.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "6px",
                        borderRadius: "7px",
                        color: "rgba(192,57,43,0.5)",
                        display: "flex",
                        transition: "all 0.2s",
                      }}
                      title="Delete offer"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {offers.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "4rem",
              background: "var(--bm-deep)",
              borderRadius: "16px",
              border: "1px solid var(--bm-forest)",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎁</div>
            <p
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "1rem",
                color: "rgba(var(--bm-ink-rgb),0.6)",
                marginBottom: "1rem",
              }}
            >
              No offers created yet
            </p>
            <button
              onClick={() => setShowForm(true)}
              style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 600,
                fontSize: "0.95rem",
                padding: "0.65rem 1.5rem",
                borderRadius: "8px",
                border: "1px solid var(--bm-forest)",
                background: "transparent",
                color: "var(--bm-sand)",
                cursor: "pointer",
              }}
            >
              Create First Offer
            </button>
          </div>
        )}
      </div>

      <style>{`
        .add-btn:hover {
          background: var(--bm-gold-light) !important;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.7rem 0.9rem",
  borderRadius: "8px",
  border: "1px solid var(--bm-forest)",
  background: "var(--bm-forest)",
  color: "var(--bm-cream)",
  fontFamily: "var(--font-body)",
  fontSize: "0.95rem",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-syne)",
  fontWeight: 600,
  fontSize: "0.82rem",
  color: "rgba(var(--bm-ink-rgb),0.72)",
  marginBottom: "0.4rem",
  letterSpacing: "0.5px",
};