"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notifyContentUpdated } from "@/lib/live-refresh";
import { motion } from "framer-motion";
import {
  Plus, Search, Edit2, Trash2,
  Star, Eye, EyeOff, MapPin,
  Clock, TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { Adventure, Section } from "@/types";
import { formatPrice, getPriceInfo } from "@/lib/adventure-utils";



const difficultyColors: Record<string, string> = {
  Easy:     "#7ab88a",
  Moderate: "#d4a017",
  Hard:     "#c4622d",
  Extreme:  "#c0392b",
};

export default function AdminAdventuresClient(
{
  initialAdventures,
  sections,
}: {
  initialAdventures: Adventure[];
  sections: Section[];
}
) {
  const router = useRouter();
  const [adventures, setAdventures] = useState(initialAdventures);
  const [search, setSearch]         = useState("");
  const [filterSection, setFilterSection] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ── Filter ──
  const filtered = adventures.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.location.toLowerCase().includes(search.toLowerCase());
    const matchSection =
      filterSection === "all" || a.section_id === filterSection;
    return matchSearch && matchSection;
  });

  // ── Toggle featured ──
  // ── Toggle featured ──
const toggleFeatured = async (id: string) => {
  const adventure = adventures.find((a) => a.id === id);
  if (!adventure) return;

  setAdventures((prev) =>
    prev.map((a) => a.id === id ? { ...a, is_featured: !a.is_featured } : a)
  );

  await fetch("/api/adventures", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, is_featured: !adventure.is_featured }),
  });

  router.refresh();
  notifyContentUpdated();
  toast.success("Featured status updated");
};

// ── Toggle active ──
const toggleActive = async (id: string) => {
  const adventure = adventures.find((a) => a.id === id);
  if (!adventure) return;

  setAdventures((prev) =>
    prev.map((a) => a.id === id ? { ...a, is_active: !a.is_active } : a)
  );

  await fetch("/api/adventures", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, is_active: !adventure.is_active }),
  });

  router.refresh();
  notifyContentUpdated();
  toast.success("Status updated");
};

// ── Delete ──
const handleDelete = async (id: string) => {
  setAdventures((prev) => prev.filter((a) => a.id !== id));
  setDeleteConfirm(null);

  await fetch(`/api/adventures?id=${id}`, { method: "DELETE" });
  router.refresh();
  notifyContentUpdated();
  toast.success("Adventure deleted");
};


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
            Adventures
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.95rem",
              color: "rgba(var(--bm-ink-rgb),0.68)",
            }}
          >
            {adventures.filter((a) => a.is_active).length} active ·{" "}
            {adventures.filter((a) => a.is_featured).length} featured
          </p>
        </div>

        <Link
          href="/admin/adventures/new"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontFamily: "var(--font-syne)",
            fontWeight: 700,
            fontSize: "0.98rem",
            color: "var(--bm-black)",
            background: "var(--bm-gold)",
            padding: "0.7rem 1.3rem",
            borderRadius: "10px",
            textDecoration: "none",
            transition: "all 0.2s",
          }}
          className="add-btn"
        >
          <Plus size={16} />
          Add Adventure
        </Link>
      </motion.div>

      {/* ── Search + filter ── */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        {/* Search */}
        <div
          style={{
            position: "relative",
            flex: 1,
            minWidth: "200px",
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
            placeholder="Search adventures..."
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

        {/* Section filter */}
        <select
          value={filterSection}
          onChange={(e) => setFilterSection(e.target.value)}
          style={{
            padding: "0.7rem 1rem",
            borderRadius: "10px",
            border: "1px solid var(--bm-forest)",
            background: "var(--bm-deep)",
            color: "var(--bm-sand)",
            fontFamily: "var(--font-syne)",
            fontSize: "0.92rem",
            fontWeight: 600,
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="all">All Sections</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.icon} {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* ── Adventures table ── */}
      <div
        style={{
          background: "var(--bm-deep)",
          border: "1px solid var(--bm-forest)",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 120px",
            padding: "0.85rem 1.25rem",
            borderBottom: "1px solid var(--bm-forest)",
            background: "rgba(42,74,50,0.15)",
          }}
        >
          {["Adventure", "Section", "Price", "Status", "Actions"].map(
            (h) => (
              <span
                key={h}
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: "rgba(var(--bm-ink-rgb),0.65)",
                }}
              >
                {h}
              </span>
            )
          )}
        </div>

        {/* Rows */}
        {filtered.length > 0 ? (
          filtered.map((adventure, i) => {
            const section = sections.find(
              (s) => s.id === adventure.section_id
            );
            const price = getPriceInfo(adventure);

            return (
              <motion.div
                key={adventure.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr 120px",
                    padding: "1rem 1.25rem",
                    borderBottom: "1px solid rgba(42,74,50,0.3)",
                    alignItems: "center",
                    opacity: adventure.is_active ? 1 : 0.5,
                    transition: "background 0.2s",
                  }}
                  className="table-row"
                >
                  {/* Name */}
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-syne)",
                          fontWeight: 700,
                          fontSize: "0.98rem",
                          color: "var(--bm-cream)",
                        }}
                      >
                        {adventure.title}
                      </span>
                      {adventure.is_featured && (
                        <Star
                          size={12}
                          fill="var(--bm-gold)"
                          color="var(--bm-gold)"
                        />
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "3px",
                          fontFamily: "var(--font-body)",
                          fontSize: "0.82rem",
                          color: "rgba(var(--bm-ink-rgb),0.65)",
                        }}
                      >
                        <MapPin size={10} />
                        {adventure.location}
                      </span>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "3px",
                          fontFamily: "var(--font-body)",
                          fontSize: "0.82rem",
                          color: "rgba(var(--bm-ink-rgb),0.65)",
                        }}
                      >
                        <Clock size={10} />
                        {adventure.duration_days}D
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-syne)",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          color: difficultyColors[adventure.difficulty],
                        }}
                      >
                        {adventure.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Section */}
                  <div>
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.92rem",
                        color: "rgba(var(--bm-ink-rgb),0.75)",
                      }}
                    >
                      {section?.icon} {section?.name}
                    </span>
                  </div>

                  {/* Price */}
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-syne)",
                        fontSize: "0.8rem",
                        color: "var(--bm-rust)",
                        textDecoration: "line-through",
                      }}
                    >
                      {formatPrice(price.original)}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-syne)",
                        fontWeight: 700,
                        fontSize: "0.98rem",
                        color: price.offerActive
                          ? "var(--bm-gold)"
                          : "var(--bm-cream)",
                      }}
                    >
                      {formatPrice(
                        price.offerActive ? price.offer! : price.sale
                      )}
                    </div>
                    {price.offerActive && (
                      <div
                        style={{
                          fontFamily: "var(--font-syne)",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: "var(--bm-gold-text)",
                          letterSpacing: "0.5px",
                        }}
                      >
                        OFFER ACTIVE
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.35rem",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-syne)",
                        fontWeight: 700,
                        fontSize: "0.78rem",
                        letterSpacing: "0.5px",
                        padding: "3px 8px",
                        borderRadius: "999px",
                        width: "fit-content",
                        background: adventure.is_active
                          ? "rgba(122,184,138,0.15)"
                          : "rgba(192,57,43,0.15)",
                        color: adventure.is_active
                          ? "var(--bm-mint)"
                          : "var(--bm-red)",
                        border: `1px solid ${
                          adventure.is_active
                            ? "rgba(122,184,138,0.3)"
                            : "rgba(192,57,43,0.3)"
                        }`,
                      }}
                    >
                      {adventure.is_active ? "Active" : "Hidden"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    {/* Featured toggle */}
                    <button
                      onClick={() => toggleFeatured(adventure.id)}
                      title={
                        adventure.is_featured
                          ? "Remove from featured"
                          : "Add to featured"
                      }
                      style={{
                        ...iconBtnStyle,
                        color: adventure.is_featured
                          ? "var(--bm-gold)"
                          : "rgba(var(--bm-ink-rgb),0.25)",
                      }}
                    >
                      <Star
                        size={14}
                        fill={
                          adventure.is_featured
                            ? "var(--bm-gold)"
                            : "transparent"
                        }
                      />
                    </button>

                    {/* Active toggle */}
                    <button
                      onClick={() => toggleActive(adventure.id)}
                      title={
                        adventure.is_active ? "Hide adventure" : "Show adventure"
                      }
                      style={{
                        ...iconBtnStyle,
                        color: adventure.is_active
                          ? "var(--bm-mint)"
                          : "rgba(var(--bm-ink-rgb),0.25)",
                      }}
                    >
                      {adventure.is_active ? (
                        <Eye size={14} />
                      ) : (
                        <EyeOff size={14} />
                      )}
                    </button>

                    {/* Edit */}
                    <Link
                      href={`/admin/adventures/${adventure.id}/edit`}
                      style={{
                        ...iconBtnStyle,
                        color: "rgba(var(--bm-ink-rgb),0.65)",
                        textDecoration: "none",
                      }}
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </Link>

                    {/* Delete */}
                    {deleteConfirm === adventure.id ? (
                      <div
                        style={{
                          display: "flex",
                          gap: "4px",
                        }}
                      >
                        <button
                          onClick={() => handleDelete(adventure.id)}
                          style={{
                            fontFamily: "var(--font-syne)",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            border: "none",
                            background: "var(--bm-red)",
                            color: "white",
                            cursor: "pointer",
                          }}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          style={{
                            fontFamily: "var(--font-syne)",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            border: "1px solid var(--bm-forest)",
                            background: "transparent",
                            color: "var(--bm-sand)",
                            cursor: "pointer",
                          }}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(adventure.id)}
                        style={{
                          ...iconBtnStyle,
                          color: "rgba(192,57,43,0.5)",
                        }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div
            style={{
              padding: "4rem",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "1rem",
                color: "rgba(var(--bm-ink-rgb),0.6)",
              }}
            >
              No adventures found
            </p>
          </div>
        )}
      </div>

      <style>{`
        .add-btn:hover {
          background: var(--bm-gold-light) !important;
          transform: translateY(-1px);
        }
        .table-row:hover {
          background: rgba(42,74,50,0.1) !important;
        }
      `}</style>
    </div>
  );
}

const iconBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "5px",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s",
};