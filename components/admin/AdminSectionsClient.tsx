// components/admin/AdminSectionsClient.tsx
// PURPOSE: The sections management UI for /admin/sections.
//   "use client" — renders the list of sections with inline status toggle,
//   edit form (modal), and delete confirmation.
//   - initialSections comes from getSections() in lib/data.ts, fetched by the
//     server component app/admin/sections/page.tsx.
//   - Create/update calls POST/PUT /api/sections.
//   - Delete calls DELETE /api/sections.
//   - After any change, calls notifyContentUpdated() so other open tabs know
//     content changed, and router.refresh() to revalidate the current page.
// CONNECTED TO:
//   - app/admin/sections/page.tsx (renders <AdminSectionsClient />)
//   - lib/data.ts (getSections)
//   - lib/live-refresh.ts (notifyContentUpdated)
//   - app/api/sections/route.ts (POST/PUT/DELETE handlers)
//   - types/index.ts (Section type)
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { notifyContentUpdated } from "@/lib/live-refresh";
import { Plus, Trash2, Edit2, X, Check, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
// import { dummySections } from "@/lib/dummy-data";
import { Section } from "@/types";

export default function AdminSectionsClient({
  initialSections,
}: {
  initialSections: Section[];
}) {
  const router = useRouter();
  const [sections, setSections]   = useState(initialSections);
  // console.log(sections);
  const [showForm, setShowForm]   = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "", slug: "", description: "", icon: "",
    status: "active" as "active" | "coming_soon",
  });

  const resetForm = () => {
    setForm({ name: "", slug: "", description: "", icon: "", status: "active" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (section: Section) => {
    setForm({
      name: section.name, slug: section.slug,
      description: section.description, icon: section.icon,
      status: section.status,
    });
    setEditingId(section.id);
    setShowForm(true);
  };

  const handleSave = async () => {
  if (!form.name || !form.icon) {
    toast.error("Name and icon are required");
    return;
  }

  if (editingId) {
    const res = await fetch("/api/sections", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingId, ...form }),
    });
    const updated = await res.json();
    setSections((prev) =>
      prev.map((s) => s.id === editingId ? updated : s)
    );
    toast.success("Section updated ✅");
  } else {
    const res = await fetch("/api/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const created = await res.json();
    setSections((prev) => [...prev, created]);
    toast.success("Section added ✅");
  }
  router.refresh();
  notifyContentUpdated();
  resetForm();
};

const toggleStatus = async (id: string) => {
  const section = sections.find((s) => s.id === id);
  if (!section) return;

  const newStatus = section.status === "active" ? "coming_soon" : "active";
  setSections((prev) =>
    prev.map((s) => s.id === id ? { ...s, status: newStatus } : s)
  );

  await fetch("/api/sections", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status: newStatus }),
  });

  router.refresh();
  notifyContentUpdated();
  toast.success("Status updated");
};

const handleDelete = async (id: string) => {
  setSections((prev) => prev.filter((s) => s.id !== id));
  setDeleteConfirm(null);

  await fetch(`/api/sections?id=${id}`, { method: "DELETE" });
  router.refresh();
  notifyContentUpdated();
  toast.success("Section deleted");
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
            Activity Sections
          </h1>
           {/* <button className="bg-amber-50  text-black" onClick={() => alert("clicked")}>clcik me</button> */}
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.95rem",
              color: "rgba(var(--bm-ink-rgb),0.68)",
            }}
          >
            {sections.filter((s) => s.status === "active").length} active ·{" "}
            {sections.filter((s) => s.status === "coming_soon").length} coming soon
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setShowForm(true); }}
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
          Add Section
        </button>
      </motion.div>

      {/* ── Add/Edit Form ── */}
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
              {editingId ? "Edit Section" : "Add New Section"}
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
                marginBottom: "1.25rem",
              }}
            >
              {/* Name */}
              <div>
                <label style={labelStyle}>Section Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Snowboarding"
                  style={inputStyle}
                />
              </div>

              {/* Icon */}
              <div>
                <label style={labelStyle}>Icon (emoji) *</label>
                <input
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="e.g. 🏂"
                  style={inputStyle}
                />
              </div>

              {/* Description */}
              <div style={{ gridColumn: "span 2" }}>
                <label style={labelStyle}>Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description shown on homepage"
                  style={inputStyle}
                />
              </div>

              {/* Status */}
              <div>
                <label style={labelStyle}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as "active" | "coming_soon",
                    })
                  }
                  style={inputStyle}
                >
                  <option value="active">Active</option>
                  <option value="coming_soon">Coming Soon</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={handleSave}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
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
                <Check size={15} />
                {editingId ? "Save Changes" : "Add Section"}
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

      {/* ── Sections grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {sections.map((section, i) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{
              background: "var(--bm-deep)",
              border: `1px solid ${
                section.status === "active"
                  ? "var(--bm-forest)"
                  : "rgba(42,74,50,0.3)"
              }`,
              borderRadius: "16px",
              padding: "1.5rem",
              opacity: section.status === "active" ? 1 : 0.7,
            }}
          >
            {/* Top row */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "12px",
                  background:
                    section.status === "active"
                      ? "rgba(212,160,23,0.1)"
                      : "rgba(42,74,50,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.6rem",
                }}
              >
                {section.icon}
              </div>

              {/* Status badge */}
              <span
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  padding: "3px 8px",
                  borderRadius: "999px",
                  background:
                    section.status === "active"
                      ? "rgba(122,184,138,0.1)"
                      : "rgba(122,184,138,0.05)",
                  color:
                    section.status === "active"
                      ? "var(--bm-mint)"
                      : "rgba(122,184,138,0.5)",
                  border: `1px solid ${
                    section.status === "active"
                      ? "rgba(122,184,138,0.25)"
                      : "rgba(122,184,138,0.1)"
                  }`,
                }}
              >
                {section.status === "active" ? "Active" : "Coming Soon"}
              </span>
            </div>

            {/* Name */}
            <h3
              style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 700,
                fontSize: "1.05rem",
                color: "var(--bm-cream)",
                marginBottom: "0.4rem",
              }}
            >
              {section.name}
            </h3>

            {/* Description */}
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.92rem",
                color: "rgba(var(--bm-ink-rgb),0.7)",
                lineHeight: 1.5,
                marginBottom: "1.25rem",
              }}
            >
              {section.description || "No description"}
            </p>

            {/* Action row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                paddingTop: "1rem",
                borderTop: "1px solid var(--bm-forest)",
              }}
            >
              {/* Toggle status */}
              <button
                onClick={() => toggleStatus(section.id)}
                title={
                  section.status === "active"
                    ? "Set as Coming Soon"
                    : "Set as Active"
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontFamily: "var(--font-syne)",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  padding: "0.45rem 0.85rem",
                  borderRadius: "7px",
                  border: "1px solid var(--bm-forest)",
                  background: "transparent",
                  color:
                    section.status === "active"
                      ? "var(--bm-mint)"
                      : "rgba(var(--bm-ink-rgb),0.4)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  flex: 1,
                  justifyContent: "center",
                }}
              >
                {section.status === "active" ? (
                  <Eye size={13} />
                ) : (
                  <EyeOff size={13} />
                )}
                {section.status === "active" ? "Active" : "Coming Soon"}
              </button>

              {/* Edit */}
              <button
                onClick={() => handleEdit(section)}
                style={{
                  ...iconBtnStyle,
                  color: "rgba(var(--bm-ink-rgb),0.68)",
                }}
                title="Edit"
              >
                <Edit2 size={15} />
              </button>

              {/* Delete */}
              {deleteConfirm === section.id ? (
                <div style={{ display: "flex", gap: "4px" }}>
                  <button
                    onClick={() => handleDelete(section.id)}
                    style={{
                      fontFamily: "var(--font-syne)",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      padding: "4px 8px",
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
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      padding: "4px 8px",
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
                  onClick={() => setDeleteConfirm(section.id)}
                  style={{
                    ...iconBtnStyle,
                    color: "rgba(192,57,43,0.5)",
                  }}
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </motion.div>
        ))}
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

const iconBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "6px",
  borderRadius: "7px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s",
};
