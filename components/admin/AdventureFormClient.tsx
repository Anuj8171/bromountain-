"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notifyContentUpdated } from "@/lib/live-refresh";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  Plus, Trash2, Upload, X,
  ChevronLeft,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { Adventure, ItineraryDay, DepartureDate, Section } from "@/types";

// ── Inline dummy sections (safe, no import issues) ──


interface AdventureFormData {
  title: string;
  section_id: string;
  tagline: string;
  description: string;
  location: string;
  state: string;
  difficulty: string;
  duration_days: number;
  duration_nights: number;
  max_altitude: string;
  distance_km: number;
  best_season: string;
  min_age: number;
  max_group_size: number;
  original_price: number;
  discounted_price: number;
  offer_price: number | null;
  offer_expires_at: string;
  is_featured: boolean;
  is_active: boolean;
}

export default function AdventureFormClient({
  mode,
  adventure,
  sections
}: {
  mode: "new" | "edit";
  adventure?: Adventure;
  sections : Section[];
}) {
  const router = useRouter();
  const [loading, setLoading]     = useState(false);
  const [activeTab, setActiveTab] = useState<
    "basic" | "pricing" | "itinerary" | "inclusions" | "dates" | "images"
  >("basic");

  // ── Image states ──
  const [coverImage, setCoverImage]     = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>(
    adventure?.cover_image_url || ""
  );
  const [galleryFiles, setGalleryFiles]       = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(
    Array.isArray(adventure?.gallery_images) ? adventure.gallery_images : []
  );

  // ── Itinerary state ──
  const [itinerary, setItinerary] = useState<Partial<ItineraryDay>[]>(
    Array.isArray(adventure?.itinerary) ? adventure.itinerary : []
  );

  // ── Inclusions / Exclusions ──
  const [inclusions, setInclusions] = useState<string[]>(
    Array.isArray(adventure?.inclusions) ? adventure.inclusions : []
  );
  const [exclusions, setExclusions] = useState<string[]>(
    Array.isArray(adventure?.exclusions) ? adventure.exclusions : []
  );
  const [newInclusion, setNewInclusion] = useState("");
  const [newExclusion, setNewExclusion] = useState("");

  // ── Departure dates ──
  const [dates, setDates] = useState<Partial<DepartureDate>[]>(
    Array.isArray(adventure?.departure_dates) ? adventure.departure_dates : []
  );
  const [newDate, setNewDate]   = useState("");
  const [newSlots, setNewSlots] = useState(15);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AdventureFormData>({
    defaultValues: {
      title:            adventure?.title           || "",
      section_id:       adventure?.section_id      || "",
      tagline:          adventure?.tagline          || "",
      description:      adventure?.description      || "",
      location:         adventure?.location         || "",
      state:            adventure?.state            || "Uttarakhand",
      difficulty:       adventure?.difficulty       || "Moderate",
      duration_days:    adventure?.duration_days    || 5,
      duration_nights:  adventure?.duration_nights  || 4,
      max_altitude:     adventure?.max_altitude     || "",
      distance_km:      adventure?.distance_km      || 0,
      best_season:      adventure?.best_season      || "",
      min_age:          adventure?.min_age          || 10,
      max_group_size:   adventure?.max_group_size   || 20,
      original_price:   adventure?.original_price   || 0,
      discounted_price: adventure?.discounted_price || 0,
      offer_price:      adventure?.offer_price      ?? null,
      offer_expires_at: adventure?.offer_expires_at || "",
      is_featured:      adventure?.is_featured      || false,
      is_active:        adventure?.is_active        ?? true,
    },
  });

  // ── Cover image handler ──
  const handleCoverImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  // ── Gallery handler ──
  const handleGalleryImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files     = Array.from(e.target.files || []);
    const remaining = 8 - galleryPreviews.length;
    if (files.length > remaining) {
      toast.error(`Max 8 gallery images. ${remaining} slots remaining.`);
      return;
    }
    const newFiles    = files.slice(0, remaining);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setGalleryFiles((prev)    => [...prev, ...newFiles]);
    setGalleryPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles((prev)    => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Itinerary helpers ──
  const addDay = () => {
    setItinerary((prev) => [
      ...prev,
      {
        id:            `new-${Date.now()}`,
        day_number:    prev.length + 1,
        title:         "",
        description:   "",
        activities:    [],
        accommodation: "",
        meals:         "",
        distance_km:   null,
        custom_fields: [],
      },
    ]);
  };

  const updateDay = (
    index: number,
    field: string,
    value: string | number | null | string[]
  ) => {
    setItinerary((prev) =>
      prev.map((day, i) => (i === index ? { ...day, [field]: value } : day))
    );
  };

  const removeDay = (index: number) => {
    setItinerary((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((day, i) => ({ ...day, day_number: i + 1 }))
    );
  };

  // ── Inclusions / Exclusions helpers ──
  const addInclusion = () => {
    if (!newInclusion.trim()) return;
    setInclusions((prev) => [...prev, newInclusion.trim()]);
    setNewInclusion("");
  };

  const addExclusion = () => {
    if (!newExclusion.trim()) return;
    setExclusions((prev) => [...prev, newExclusion.trim()]);
    setNewExclusion("");
  };

  // ── Date helpers ──
  const addDate = () => {
    if (!newDate) { toast.error("Select a date"); return; }
    setDates((prev) => [
      ...prev,
      {
        id:              `new-${Date.now()}`,
        date:            newDate,
        available_slots: newSlots,
        booked_slots:    0,
      },
    ]);
    setNewDate("");
    setNewSlots(15);
  };

  // ── Submit ──
  const onSubmit = async (data: AdventureFormData) => {
    setLoading(true);
    try {
      // upload cover image if new one selected
      let coverUrl = coverPreview;
      if (coverImage) {
        const formData = new FormData();
        formData.append("file", coverImage);
        formData.append("folder", "adventures/covers");
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const result = await res.json();
        coverUrl = result.url;
      }

      // upload gallery images
      const galleryUrls = [...galleryPreviews.filter((p) => p.startsWith("http"))];
      for (const file of galleryFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "adventures/gallery");
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const result = await res.json();
        if (result.url) galleryUrls.push(result.url);
      }

      // save adventure
      const payload = {
        ...data,
        cover_image_url: coverUrl || null,
        gallery_images:  galleryUrls,
        itinerary,
        inclusions,
        exclusions,
        departure_dates: dates,
        ...(mode === "edit" ? { id: adventure?.id } : {}),
      };

       const res = await fetch("/api/adventures", {
              method: mode === "new" ? "POST" : "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error);

            toast.success(
              mode === "new" ? "Adventure created!" : "Adventure updated!"
            );
            router.push("/admin/adventures");
            router.refresh();
            notifyContentUpdated();
        } catch {
                  toast.error("Something went wrong");
                } finally {
                  setLoading(false);
                }
              };

  const tabs = [
    { key: "basic",      label: "Basic Info" },
    { key: "pricing",    label: "Pricing" },
    { key: "images",     label: "Images" },
    { key: "itinerary",  label: "Itinerary" },
    { key: "inclusions", label: "Inclusions" },
    { key: "dates",      label: "Dates" },
  ] as const;

  return (
    <div style={{ padding: "2rem" }}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: "2rem" }}
      >
        <button
          onClick={() => router.back()}
          style={{
            display:     "flex",
            alignItems:  "center",
            gap:         "4px",
            fontFamily:  "var(--font-syne)",
            fontSize:    "0.8rem",
            fontWeight:  600,
            color:       "rgba(var(--bm-ink-rgb),0.68)",
            background:  "none",
            border:      "none",
            cursor:      "pointer",
            marginBottom:"1rem",
            padding:     0,
          }}
        >
          <ChevronLeft size={14} />
          Back to Adventures
        </button>
        <h1
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize:   "1.8rem",
            color:      "var(--bm-cream)",
          }}
        >
          {mode === "new" ? "Add New Adventure" : `Edit: ${adventure?.title}`}
        </h1>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* ── Tabs ── */}
        <div
          style={{
            display:       "flex",
            gap:           "0.25rem",
            marginBottom:  "2rem",
            overflowX:     "auto",
            paddingBottom: "2px",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                fontFamily:  "var(--font-syne)",
                fontWeight:  600,
                fontSize:    "0.82rem",
                padding:     "0.55rem 1.1rem",
                borderRadius:"8px",
                border:      "1px solid",
                borderColor: activeTab === tab.key ? "var(--bm-gold)" : "var(--bm-forest)",
                background:  activeTab === tab.key ? "rgba(212,160,23,0.12)" : "transparent",
                color:       activeTab === tab.key ? "var(--bm-gold-text)" : "rgba(var(--bm-ink-rgb),0.6)",
                cursor:      "pointer",
                whiteSpace:  "nowrap",
                transition:  "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── BASIC INFO TAB ── */}
        {activeTab === "basic" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            <div
              style={{
                display:               "grid",
                gridTemplateColumns:   "repeat(auto-fit, minmax(240px, 1fr))",
                gap:                   "1.25rem",
              }}
            >
              {/* Title */}
              <div style={{ gridColumn: "span 2" }}>
                <label style={labelStyle}>Adventure Title *</label>
                <input
                  {...register("title", { required: "Title is required" })}
                  placeholder="e.g. Kedarkantha Trek"
                  style={{
                    ...inputStyle,
                    borderColor: errors.title ? "var(--bm-red)" : "var(--bm-forest)",
                  }}
                />
                {errors.title && <span style={errorStyle}>{errors.title.message}</span>}
              </div>

              {/* Section — uses safe inline array */}
              <div>
                <label style={labelStyle}>Section *</label>
                <select
                  {...register("section_id", { required: "Section is required" })}
                  style={{
                    ...inputStyle,
                    borderColor: errors.section_id ? "var(--bm-red)" : "var(--bm-forest)",
                  }}
                >
                  <option value="">Select section...</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.icon} {s.name}
                    </option>
                  ))}
                </select>
                {errors.section_id && (
                  <span style={errorStyle}>{errors.section_id.message}</span>
                )}
              </div>

              {/* Difficulty */}
              <div>
                <label style={labelStyle}>Difficulty *</label>
                <select
                  {...register("difficulty")}
                  style={{ ...inputStyle, borderColor: "var(--bm-forest)" }}
                >
                  {["Easy", "Moderate", "Hard", "Extreme"].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Tagline */}
              <div style={{ gridColumn: "span 2" }}>
                <label style={labelStyle}>Tagline *</label>
                <input
                  {...register("tagline", { required: "Tagline is required" })}
                  placeholder="Short catchy description"
                  style={{
                    ...inputStyle,
                    borderColor: errors.tagline ? "var(--bm-red)" : "var(--bm-forest)",
                  }}
                />
                {errors.tagline && <span style={errorStyle}>{errors.tagline.message}</span>}
              </div>

              {/* Description */}
              <div style={{ gridColumn: "span 2" }}>
                <label style={labelStyle}>Full Description *</label>
                <textarea
                  {...register("description", { required: "Description is required" })}
                  placeholder="Detailed description of the adventure..."
                  rows={5}
                  style={{
                    ...inputStyle,
                    resize:      "vertical",
                    borderColor: errors.description ? "var(--bm-red)" : "var(--bm-forest)",
                  }}
                />
                {errors.description && (
                  <span style={errorStyle}>{errors.description.message}</span>
                )}
              </div>

              {/* Location */}
              <div>
                <label style={labelStyle}>Location *</label>
                <input
                  {...register("location", { required: "Location is required" })}
                  placeholder="e.g. Sankri"
                  style={{
                    ...inputStyle,
                    borderColor: errors.location ? "var(--bm-red)" : "var(--bm-forest)",
                  }}
                />
                {errors.location && <span style={errorStyle}>{errors.location.message}</span>}
              </div>

              {/* State */}
              <div>
                <label style={labelStyle}>State *</label>
                <input
                  {...register("state")}
                  placeholder="Uttarakhand"
                  style={{ ...inputStyle, borderColor: "var(--bm-forest)" }}
                />
              </div>

              {/* Duration */}
              <div>
                <label style={labelStyle}>Duration Days *</label>
                <input
                  {...register("duration_days", { valueAsNumber: true })}
                  type="number"
                  min={1}
                  style={{ ...inputStyle, borderColor: "var(--bm-forest)" }}
                />
              </div>

              <div>
                <label style={labelStyle}>Duration Nights *</label>
                <input
                  {...register("duration_nights", { valueAsNumber: true })}
                  type="number"
                  min={0}
                  style={{ ...inputStyle, borderColor: "var(--bm-forest)" }}
                />
              </div>

              {/* Max altitude */}
              <div>
                <label style={labelStyle}>Max Altitude</label>
                <input
                  {...register("max_altitude")}
                  placeholder="e.g. 3800m"
                  style={{ ...inputStyle, borderColor: "var(--bm-forest)" }}
                />
              </div>

              {/* Distance */}
              <div>
                <label style={labelStyle}>Distance (km)</label>
                <input
                  {...register("distance_km", { valueAsNumber: true })}
                  type="number"
                  min={0}
                  style={{ ...inputStyle, borderColor: "var(--bm-forest)" }}
                />
              </div>

              {/* Best season */}
              <div>
                <label style={labelStyle}>Best Season *</label>
                <input
                  {...register("best_season")}
                  placeholder="e.g. Dec – April"
                  style={{ ...inputStyle, borderColor: "var(--bm-forest)" }}
                />
              </div>

              {/* Min age */}
              <div>
                <label style={labelStyle}>Min Age</label>
                <input
                  {...register("min_age", { valueAsNumber: true })}
                  type="number"
                  min={1}
                  style={{ ...inputStyle, borderColor: "var(--bm-forest)" }}
                />
              </div>

              {/* Max group size */}
              <div>
                <label style={labelStyle}>Max Group Size</label>
                <input
                  {...register("max_group_size", { valueAsNumber: true })}
                  type="number"
                  min={1}
                  style={{ ...inputStyle, borderColor: "var(--bm-forest)" }}
                />
              </div>

              {/* Toggles */}
              <div style={{ gridColumn: "span 2", display: "flex", gap: "2rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    {...register("is_active")}
                    style={{ width: "16px", height: "16px", accentColor: "var(--bm-gold)" }}
                  />
                  <span style={{ fontFamily: "var(--font-syne)", fontWeight: 600, fontSize: "0.95rem", color: "var(--bm-cream)" }}>
                    Active (visible on website)
                  </span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    {...register("is_featured")}
                    style={{ width: "16px", height: "16px", accentColor: "var(--bm-gold)" }}
                  />
                  <span style={{ fontFamily: "var(--font-syne)", fontWeight: 600, fontSize: "0.95rem", color: "var(--bm-cream)" }}>
                    Featured on homepage
                  </span>
                </label>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── PRICING TAB ── */}
        {activeTab === "pricing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display:             "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap:                 "1.25rem",
            }}
          >
            {/* Original price */}
            <div>
              <label style={labelStyle}>Original Price (₹) *</label>
              <input
                {...register("original_price", {
                  required:      "Required",
                  valueAsNumber: true,
                  min:           { value: 1, message: "Must be greater than 0" },
                })}
                type="number"
                placeholder="4000"
                style={{
                  ...inputStyle,
                  borderColor: errors.original_price ? "var(--bm-red)" : "var(--bm-forest)",
                }}
              />
              <p style={hintStyle}>This price always shows with strikethrough</p>
              {errors.original_price && (
                <span style={errorStyle}>{errors.original_price.message}</span>
              )}
            </div>

            {/* Sale price */}
            <div>
              <label style={labelStyle}>Sale Price (₹) *</label>
              <input
                {...register("discounted_price", {
                  required:      "Required",
                  valueAsNumber: true,
                  min:           { value: 1, message: "Must be greater than 0" },
                })}
                type="number"
                placeholder="3699"
                style={{
                  ...inputStyle,
                  borderColor: errors.discounted_price ? "var(--bm-red)" : "var(--bm-forest)",
                }}
              />
              <p style={hintStyle}>This is the actual price users pay</p>
              {errors.discounted_price && (
                <span style={errorStyle}>{errors.discounted_price.message}</span>
              )}
            </div>

            {/* Divider */}
            <div
              style={{
                gridColumn:  "1 / -1",
                borderTop:   "1px solid var(--bm-forest)",
                paddingTop:  "1.25rem",
              }}
            >
              <p
                style={{
                  fontFamily:    "var(--font-syne)",
                  fontWeight:    700,
                  fontSize:      "0.78rem",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color:         "rgba(var(--bm-ink-rgb),0.65)",
                  marginBottom:  "1rem",
                }}
              >
                Special Offer (Optional)
              </p>
            </div>

            {/* Offer price */}
            <div>
              <label style={labelStyle}>Offer Price (₹)</label>
              <input
                {...register("offer_price", { valueAsNumber: true })}
                type="number"
                placeholder="2999"
                style={{ ...inputStyle, borderColor: "var(--bm-forest)" }}
              />
              <p style={hintStyle}>Leave empty for no offer</p>
            </div>

            {/* Offer expiry */}
            <div>
              <label style={labelStyle}>Offer Expiry Date</label>
              <input
                {...register("offer_expires_at")}
                type="date"
                style={{ ...inputStyle, borderColor: "var(--bm-forest)" }}
              />
              <p style={hintStyle}>Offer auto-expires on this date</p>
            </div>

            {/* Price preview */}
            <div
              style={{
                gridColumn: "1 / -1",
                background: "rgba(42,74,50,0.15)",
                border:     "1px solid var(--bm-forest)",
                borderRadius:"12px",
                padding:    "1.25rem",
              }}
            >
              <p
                style={{
                  fontFamily:    "var(--font-syne)",
                  fontWeight:    600,
                  fontSize:      "0.75rem",
                  color:         "rgba(var(--bm-ink-rgb),0.68)",
                  marginBottom:  "0.75rem",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                Preview on website
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                <span
                  style={{
                    fontFamily:     "var(--font-syne)",
                    fontWeight:     600,
                    fontSize:       "1rem",
                    color:          "rgba(var(--bm-ink-rgb),0.65)",
                    textDecoration: "line-through",
                  }}
                >
                  ₹{(watch("original_price") || 0).toLocaleString("en-IN")}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-syne)",
                    fontWeight: 800,
                    fontSize:   "1.2rem",
                    color:      "var(--bm-gold-text)",
                  }}
                >
                  ₹{(watch("discounted_price") || 0).toLocaleString("en-IN")}
                </span>
                {watch("offer_price") && watch("offer_expires_at") && (
                  <span
                    style={{
                      fontFamily:    "var(--font-syne)",
                      fontWeight:    700,
                      fontSize:      "0.72rem",
                      letterSpacing: "1px",
                      padding:       "0.3rem 0.65rem",
                      borderRadius:  "6px",
                      background:    "rgba(212,160,23,0.15)",
                      color:         "var(--bm-gold-text)",
                      border:        "1px solid rgba(212,160,23,0.3)",
                    }}
                  >
                    ✦ SPECIAL OFFER
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── IMAGES TAB ── */}
        {activeTab === "images" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
          >
            {/* Cover image */}
            <div>
              <label style={labelStyle}>Cover Image</label>
              <p style={hintStyle}>Main image shown on cards and detail page. Max 5MB.</p>

              {coverPreview ? (
                <div style={{ position: "relative", width: "100%", maxWidth: "400px" }}>
                  <img
                    src={coverPreview}
                    alt="Cover"
                    style={{
                      width:        "100%",
                      height:       "220px",
                      objectFit:    "cover",
                      borderRadius: "12px",
                      border:       "1px solid var(--bm-forest)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => { setCoverImage(null); setCoverPreview(""); }}
                    style={{
                      position:      "absolute",
                      top:           "0.5rem",
                      right:         "0.5rem",
                      background:    "rgba(10,12,11,0.8)",
                      border:        "none",
                      borderRadius:  "50%",
                      width:         "28px",
                      height:        "28px",
                      display:       "flex",
                      alignItems:    "center",
                      justifyContent:"center",
                      cursor:        "pointer",
                      color:         "#f2ede4",
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label style={uploadAreaStyle}>
                  <ImageIcon size={24} color="rgba(var(--bm-ink-rgb),0.3)" />
                  <span
                    style={{
                      fontFamily: "var(--font-syne)",
                      fontWeight: 600,
                      fontSize:   "0.85rem",
                      color:      "rgba(var(--bm-ink-rgb),0.68)",
                    }}
                  >
                    Click to upload cover image
                  </span>
                  <span style={hintStyle}>JPG, PNG, WEBP</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCoverImage}
                    style={{ display: "none" }}
                  />
                </label>
              )}
            </div>

            {/* Gallery images */}
            <div>
              <label style={labelStyle}>Gallery Images (max 8)</label>
              <p style={hintStyle}>Additional photos shown in the gallery slideshow.</p>

              {galleryPreviews.length > 0 && (
                <div
                  style={{
                    display:             "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                    gap:                 "0.75rem",
                    marginBottom:        "1rem",
                  }}
                >
                  {galleryPreviews.map((preview, i) => (
                    <div key={i} style={{ position: "relative" }}>
                      <img
                        src={preview}
                        alt={`Gallery ${i + 1}`}
                        style={{
                          width:        "100%",
                          height:       "90px",
                          objectFit:    "cover",
                          borderRadius: "8px",
                          border:       "1px solid var(--bm-forest)",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(i)}
                        style={{
                          position:       "absolute",
                          top:            "4px",
                          right:          "4px",
                          background:     "rgba(10,12,11,0.8)",
                          border:         "none",
                          borderRadius:   "50%",
                          width:          "22px",
                          height:         "22px",
                          display:        "flex",
                          alignItems:     "center",
                          justifyContent: "center",
                          cursor:         "pointer",
                          color:          "var(--bm-cream)",
                        }}
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {galleryPreviews.length < 8 && (
                <label style={uploadAreaStyle}>
                  <Upload size={20} color="rgba(var(--bm-ink-rgb),0.3)" />
                  <span
                    style={{
                      fontFamily: "var(--font-syne)",
                      fontWeight: 600,
                      fontSize:   "0.82rem",
                      color:      "rgba(var(--bm-ink-rgb),0.68)",
                    }}
                  >
                    Add gallery photos ({galleryPreviews.length}/8)
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleGalleryImages}
                    style={{ display: "none" }}
                  />
                </label>
              )}
            </div>
          </motion.div>
        )}

        {/* ── ITINERARY TAB ── */}
        {activeTab === "itinerary" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div
              style={{
                display:       "flex",
                flexDirection: "column",
                gap:           "1rem",
                marginBottom:  "1.5rem",
              }}
            >
              {itinerary.map((day, i) => (
                <div
                  key={day.id || i}
                  style={{
                    background:   "var(--bm-deep)",
                    border:       "1px solid var(--bm-forest)",
                    borderRadius: "14px",
                    padding:      "1.25rem",
                  }}
                >
                  {/* Day header */}
                  <div
                    style={{
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "space-between",
                      marginBottom:   "1rem",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-syne)",
                        fontWeight: 700,
                        fontSize:   "0.82rem",
                        color:      "var(--bm-gold-text)",
                      }}
                    >
                      Day {day.day_number}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeDay(i)}
                      style={{
                        background: "none",
                        border:     "none",
                        cursor:     "pointer",
                        color:      "rgba(192,57,43,0.6)",
                        display:    "flex",
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div
                    style={{
                      display:             "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap:                 "0.85rem",
                    }}
                  >
                    {/* Title */}
                    <div style={{ gridColumn: "span 2" }}>
                      <label style={labelStyle}>Day Title *</label>
                      <input
                        value={day.title || ""}
                        onChange={(e) => updateDay(i, "title", e.target.value)}
                        placeholder="e.g. Sankri → Juda Ka Talab"
                        style={{ ...inputStyle, borderColor: "var(--bm-forest)" }}
                      />
                    </div>

                    {/* Description */}
                    <div style={{ gridColumn: "span 2" }}>
                      <label style={labelStyle}>Description</label>
                      <textarea
                        value={day.description || ""}
                        onChange={(e) => updateDay(i, "description", e.target.value)}
                        placeholder="What happens this day..."
                        rows={3}
                        style={{ ...inputStyle, resize: "vertical", borderColor: "var(--bm-forest)" }}
                      />
                    </div>

                    {/* Activities */}
                    <div style={{ gridColumn: "span 2" }}>
                      <label style={labelStyle}>Activities (comma separated)</label>
                      <input
                        value={(Array.isArray(day.activities) ? day.activities : []).join(", ")}
                        onChange={(e) =>
                          updateDay(
                            i,
                            "activities",
                            e.target.value.split(",").map((a) => a.trim()).filter(Boolean)
                          )
                        }
                        placeholder="Trekking, Bird Watching, Photography"
                        style={{ ...inputStyle, borderColor: "var(--bm-forest)" }}
                      />
                    </div>

                    {/* Meals */}
                    <div>
                      <label style={labelStyle}>Meals</label>
                      <input
                        value={day.meals || ""}
                        onChange={(e) => updateDay(i, "meals", e.target.value)}
                        placeholder="Breakfast, Lunch, Dinner"
                        style={{ ...inputStyle, borderColor: "var(--bm-forest)" }}
                      />
                    </div>

                    {/* Accommodation */}
                    <div>
                      <label style={labelStyle}>Accommodation</label>
                      <input
                        value={day.accommodation || ""}
                        onChange={(e) => updateDay(i, "accommodation", e.target.value)}
                        placeholder="Camping / Guesthouse"
                        style={{ ...inputStyle, borderColor: "var(--bm-forest)" }}
                      />
                    </div>

                    {/* Distance */}
                    <div>
                      <label style={labelStyle}>Distance (km)</label>
                      <input
                        type="number"
                        value={day.distance_km ?? ""}
                        onChange={(e) =>
                          updateDay(
                            i,
                            "distance_km",
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        placeholder="4"
                        style={{ ...inputStyle, borderColor: "var(--bm-forest)" }}
                      />
                    </div>

                    {/* Custom fields */}
                    <div style={{ gridColumn: "span 2" }}>
                      <label style={labelStyle}>
                        Custom Fields (icon | label | value — one per line)
                      </label>
                      <textarea
                        value={(Array.isArray(day.custom_fields) ? day.custom_fields : [])
                          .map((f: any) => `${f.icon} | ${f.label} | ${f.value}`)
                          .join("\n")}
                        onChange={(e) => {
                          const fields = e.target.value
                            .split("\n")
                            .filter((l) => l.trim())
                            .map((line) => {
                              const parts = line.split("|").map((p) => p.trim());
                              return {
                                icon:  parts[0] || "📌",
                                label: parts[1] || "",
                                value: parts[2] || "",
                              };
                            });
                          updateDay(i, "custom_fields", fields as any);
                        }}
                        placeholder={`🌤️ | Weather | Cold, -5°C\n⚠️ | Safety | Walk slow\n🎒 | Carry | Extra layer`}
                        rows={3}
                        style={{
                          ...inputStyle,
                          resize:      "vertical",
                          borderColor: "var(--bm-forest)",
                          fontFamily:  "monospace",
                          fontSize:    "0.8rem",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addDay}
              style={{
                display:        "flex",
                alignItems:     "center",
                gap:            "0.5rem",
                fontFamily:     "var(--font-syne)",
                fontWeight:     600,
                fontSize:       "0.85rem",
                padding:        "0.75rem 1.25rem",
                borderRadius:   "10px",
                border:         "1.5px dashed var(--bm-forest)",
                background:     "transparent",
                color:          "rgba(var(--bm-ink-rgb),0.7)",
                cursor:         "pointer",
                width:          "100%",
                justifyContent: "center",
                transition:     "all 0.2s",
              }}
              className="add-day-btn"
            >
              <Plus size={16} />
              Add Day {itinerary.length + 1}
            </button>
          </motion.div>
        )}

        {/* ── INCLUSIONS TAB ── */}
        {activeTab === "inclusions" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}
            className="inclusions-grid"
          >
            {/* Inclusions */}
            <div>
              <h3
                style={{
                  fontFamily:   "var(--font-syne)",
                  fontWeight:   700,
                  fontSize:     "0.9rem",
                  color:        "var(--bm-mint)",
                  marginBottom: "1rem",
                }}
              >
                ✅ What's Included
              </h3>

              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                <input
                  value={newInclusion}
                  onChange={(e) => setNewInclusion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInclusion())}
                  placeholder="e.g. All meals during trek"
                  style={{ ...inputStyle, borderColor: "var(--bm-forest)", flex: 1 }}
                />
                <button
                  type="button"
                  onClick={addInclusion}
                  style={{
                    padding:        "0 1rem",
                    borderRadius:   "8px",
                    border:         "none",
                    background:     "var(--bm-moss)",
                    color:          "var(--bm-mint)",
                    cursor:         "pointer",
                    display:        "flex",
                    alignItems:     "center",
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {inclusions.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "space-between",
                      padding:        "0.65rem 0.85rem",
                      background:     "rgba(122,184,138,0.06)",
                      border:         "1px solid rgba(122,184,138,0.15)",
                      borderRadius:   "8px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize:   "0.85rem",
                        color:      "rgba(var(--bm-ink-rgb),0.82)",
                      }}
                    >
                      ✓ {item}
                    </span>
                    <button
                      type="button"
                      onClick={() => setInclusions((prev) => prev.filter((_, j) => j !== i))}
                      style={{
                        background: "none",
                        border:     "none",
                        cursor:     "pointer",
                        color:      "rgba(var(--bm-ink-rgb),0.55)",
                        display:    "flex",
                      }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Exclusions */}
            <div>
              <h3
                style={{
                  fontFamily:   "var(--font-syne)",
                  fontWeight:   700,
                  fontSize:     "0.9rem",
                  color:        "var(--bm-rust)",
                  marginBottom: "1rem",
                }}
              >
                ❌ What's Excluded
              </h3>

              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                <input
                  value={newExclusion}
                  onChange={(e) => setNewExclusion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addExclusion())}
                  placeholder="e.g. Personal trekking gear"
                  style={{ ...inputStyle, borderColor: "var(--bm-forest)", flex: 1 }}
                />
                <button
                  type="button"
                  onClick={addExclusion}
                  style={{
                    padding:      "0 1rem",
                    borderRadius: "8px",
                    border:       "none",
                    background:   "rgba(184,80,48,0.15)",
                    color:        "var(--bm-rust)",
                    cursor:       "pointer",
                    display:      "flex",
                    alignItems:   "center",
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {exclusions.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "space-between",
                      padding:        "0.65rem 0.85rem",
                      background:     "rgba(184,80,48,0.06)",
                      border:         "1px solid rgba(184,80,48,0.15)",
                      borderRadius:   "8px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize:   "0.85rem",
                        color:      "rgba(var(--bm-ink-rgb),0.82)",
                      }}
                    >
                      ✗ {item}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExclusions((prev) => prev.filter((_, j) => j !== i))}
                      style={{
                        background: "none",
                        border:     "none",
                        cursor:     "pointer",
                        color:      "rgba(var(--bm-ink-rgb),0.55)",
                        display:    "flex",
                      }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── DATES TAB ── */}
        {activeTab === "dates" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Add date row */}
            <div
              style={{
                display:      "flex",
                gap:          "0.75rem",
                marginBottom: "1.5rem",
                flexWrap:     "wrap",
                alignItems:   "flex-end",
              }}
            >
              <div>
                <label style={labelStyle}>Departure Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  style={{ ...inputStyle, borderColor: "var(--bm-forest)" }}
                />
              </div>
              <div>
                <label style={labelStyle}>Available Slots</label>
                <input
                  type="number"
                  value={newSlots}
                  min={1}
                  onChange={(e) => setNewSlots(Number(e.target.value))}
                  style={{ ...inputStyle, borderColor: "var(--bm-forest)", width: "120px" }}
                />
              </div>
              <button
                type="button"
                onClick={addDate}
                style={{
                  display:      "flex",
                  alignItems:   "center",
                  gap:          "0.5rem",
                  fontFamily:   "var(--font-syne)",
                  fontWeight:   600,
                  fontSize:     "0.85rem",
                  padding:      "0.7rem 1.25rem",
                  borderRadius: "10px",
                  border:       "none",
                  background:   "var(--bm-moss)",
                  color:        "var(--bm-cream)",
                  cursor:       "pointer",
                }}
              >
                <Plus size={15} />
                Add Date
              </button>
            </div>

            {/* Dates list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {dates.map((date, i) => (
                <div
                  key={date.id || i}
                  style={{
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "space-between",
                    padding:        "1rem 1.25rem",
                    background:     "var(--bm-deep)",
                    border:         "1px solid var(--bm-forest)",
                    borderRadius:   "10px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-syne)",
                        fontWeight: 700,
                        fontSize:   "0.9rem",
                        color:      "var(--bm-cream)",
                      }}
                    >
                      {new Date(date.date || "").toLocaleDateString("en-IN", {
                        weekday: "short",
                        day:     "numeric",
                        month:   "long",
                        year:    "numeric",
                      })}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize:   "0.75rem",
                        color:      "rgba(var(--bm-ink-rgb),0.68)",
                        marginTop:  "2px",
                      }}
                    >
                      {(date.available_slots || 0) - (date.booked_slots || 0)} of{" "}
                      {date.available_slots} slots available
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDates((prev) => prev.filter((_, j) => j !== i))}
                    style={{
                      background: "none",
                      border:     "none",
                      cursor:     "pointer",
                      color:      "rgba(192,57,43,0.5)",
                      display:    "flex",
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {dates.length === 0 && (
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize:   "0.85rem",
                    color:      "rgba(var(--bm-ink-rgb),0.6)",
                    textAlign:  "center",
                    padding:    "2rem",
                  }}
                >
                  No departure dates added yet
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Save button ── */}
        <div
          style={{
            marginTop:      "2.5rem",
            display:        "flex",
            gap:            "1rem",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              fontFamily:   "var(--font-syne)",
              fontWeight:   600,
              fontSize:     "0.88rem",
              padding:      "0.85rem 1.5rem",
              borderRadius: "10px",
              border:       "1px solid var(--bm-forest)",
              background:   "transparent",
              color:        "var(--bm-sand)",
              cursor:       "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              fontFamily:   "var(--font-syne)",
              fontWeight:   700,
              fontSize:     "0.88rem",
              padding:      "0.85rem 2rem",
              borderRadius: "10px",
              border:       "none",
              background:   loading ? "rgba(212,160,23,0.5)" : "var(--bm-gold)",
              color:        "var(--bm-black)",
              cursor:       loading ? "not-allowed" : "pointer",
              transition:   "all 0.2s",
            }}
            className="save-btn"
          >
            {loading
              ? "Saving..."
              : mode === "new"
              ? "Create Adventure"
              : "Save Changes"}
          </button>
        </div>
      </form>

      <style>{`
        .add-day-btn:hover {
          border-color: var(--bm-sage) !important;
          color: var(--bm-cream) !important;
        }
        .save-btn:hover:not(:disabled) {
          background: var(--bm-gold-light) !important;
          transform: translateY(-1px);
        }
        @media (max-width: 640px) {
          .inclusions-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// ── Style helpers ──
const inputStyle: React.CSSProperties = {
  width:      "100%",
  padding:    "0.75rem 1rem",
  borderRadius:"8px",
  border:     "1px solid",
  background: "var(--bm-forest)",
  color:      "var(--bm-cream)",
  fontFamily: "var(--font-body)",
  fontSize:   "0.88rem",
  outline:    "none",
  transition: "border-color 0.2s",
};

const labelStyle: React.CSSProperties = {
  display:       "block",
  fontFamily:    "var(--font-syne)",
  fontWeight:    600,
  fontSize:      "0.75rem",
  color:         "rgba(var(--bm-ink-rgb),0.72)",
  marginBottom:  "0.4rem",
  letterSpacing: "0.5px",
};

const errorStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize:   "0.7rem",
  color:      "var(--bm-red)",
  marginTop:  "0.2rem",
  display:    "block",
};

const hintStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize:   "0.7rem",
  color:      "rgba(var(--bm-ink-rgb),0.6)",
  marginTop:  "0.25rem",
};

const uploadAreaStyle: React.CSSProperties = {
  display:        "flex",
  flexDirection:  "column",
  alignItems:     "center",
  justifyContent: "center",
  gap:            "0.5rem",
  padding:        "2.5rem",
  borderRadius:   "12px",
  border:         "2px dashed var(--bm-forest)",
  background:     "rgba(42,74,50,0.06)",
  cursor:         "pointer",
  transition:     "all 0.2s",
};