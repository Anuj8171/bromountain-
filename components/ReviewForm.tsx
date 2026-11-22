"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Star, Upload, X, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Adventure } from "@/types";

interface ReviewFormData {
  reviewer_name: string;
  reviewer_email: string;
  adventure_id: string;
  title: string;
  content: string;
  rating: number;
}

export default function ReviewForm({
  adventures,
  onSuccess,
  preselectedAdventureId,
}: {
  adventures: Adventure[];
  onSuccess?: () => void;
  preselectedAdventureId?: string;
}) {
  const [rating, setRating]       = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [photos, setPhotos]       = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReviewFormData>({
    defaultValues: {
      adventure_id: preselectedAdventureId || "",
    },
  });

  // ── Handle photo selection ──
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 3) {
      toast.error("Maximum 3 photos allowed");
      return;
    }
    setPhotos((prev) => [...prev, ...files].slice(0, 3));
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Submit ──
  const onSubmit = async (data: ReviewFormData) => {
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with real API call when Supabase connected
    // upload photos first
const uploadedUrls: string[] = [];
for (const photo of photos) {
  const formData = new FormData();
  formData.append("file", photo);
  formData.append("folder", "reviews");

  const uploadRes = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  const uploadData = await uploadRes.json();
  if (uploadData.url) uploadedUrls.push(uploadData.url);
}

// submit review
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            adventure_id:    data.adventure_id || null,
            reviewer_name:   data.reviewer_name,
            reviewer_email:  data.reviewer_email,
            rating,
            title:           data.title,
            content:         data.content,
            image_urls:      uploadedUrls,
          }),
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error);
      setSubmitted(true);
      reset();
      setRating(0);
      setPhotos([]);
      onSuccess?.();

      toast.success("Review submitted! Awaiting admin approval.");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ──
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: "var(--bm-deep)",
          border: "1px solid rgba(122,184,138,0.3)",
          borderRadius: "16px",
          padding: "3rem",
          textAlign: "center",
        }}
      >
        <CheckCircle
          size={48}
          color="var(--bm-mint)"
          style={{ margin: "0 auto 1rem" }}
        />
        <h3
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 700,
            fontSize: "1.2rem",
            color: "var(--bm-cream)",
            marginBottom: "0.75rem",
          }}
        >
          Review Submitted!
        </h3>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            color: "rgba(var(--bm-ink-rgb),0.75)",
            lineHeight: 1.6,
            marginBottom: "1.5rem",
          }}
        >
          Thank you for sharing your experience. Your review will appear on
          the website once approved by our team.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 600,
            fontSize: "0.85rem",
            padding: "0.65rem 1.5rem",
            borderRadius: "8px",
            border: "1px solid var(--bm-forest)",
            background: "transparent",
            color: "var(--bm-sand)",
            cursor: "pointer",
          }}
        >
          Write Another Review
        </button>
      </motion.div>
    );
  }

  return (
    <div
      style={{
        background: "var(--bm-deep)",
        border: "1px solid var(--bm-forest)",
        borderRadius: "16px",
        padding: "2rem",
      }}
    >
      <h3
        style={{
          fontFamily: "var(--font-syne)",
          fontWeight: 700,
          fontSize: "1.1rem",
          color: "var(--bm-cream)",
          marginBottom: "0.5rem",
        }}
      >
        Share Your Experience
      </h3>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.82rem",
          color: "rgba(var(--bm-ink-rgb),0.68)",
          marginBottom: "2rem",
        }}
      >
        Your review will be visible after admin approval
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.25rem",
            marginBottom: "1.25rem",
          }}
        >
          {/* Name */}
          <div>
            <label style={labelStyle}>Your Name *</label>
            <input
              {...register("reviewer_name", {
                required: "Name is required",
              })}
              placeholder="Rahul Sharma"
              style={{
                ...inputStyle,
                borderColor: errors.reviewer_name
                  ? "var(--bm-red)"
                  : "var(--bm-forest)",
              }}
            />
            {errors.reviewer_name && (
              <span style={errorStyle}>{errors.reviewer_name.message}</span>
            )}
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>Your Email *</label>
            <input
              {...register("reviewer_email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Invalid email",
                },
              })}
              type="email"
              placeholder="rahul@gmail.com"
              style={{
                ...inputStyle,
                borderColor: errors.reviewer_email
                  ? "var(--bm-red)"
                  : "var(--bm-forest)",
              }}
            />
            {errors.reviewer_email && (
              <span style={errorStyle}>{errors.reviewer_email.message}</span>
            )}
          </div>
        </div>

        {/* Which adventure */}
        <div style={{ marginBottom: "1.25rem" }}>
          <label style={labelStyle}>Which Adventure? *</label>
          <select
            {...register("adventure_id", {
              required: "Please select an adventure",
            })}
            style={{
              ...inputStyle,
              borderColor: errors.adventure_id
                ? "var(--bm-red)"
                : "var(--bm-forest)",
            }}
          >
            <option value="">Select adventure...</option>
            {adventures.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
          {errors.adventure_id && (
            <span style={errorStyle}>{errors.adventure_id.message}</span>
          )}
        </div>

        {/* Star rating */}
        <div style={{ marginBottom: "1.25rem" }}>
          <label style={labelStyle}>Your Rating *</label>
          <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.5rem" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px",
                  transition: "transform 0.1s",
                  transform:
                    star <= (hoveredStar || rating)
                      ? "scale(1.2)"
                      : "scale(1)",
                }}
              >
                <Star
                  size={28}
                  fill={
                    star <= (hoveredStar || rating)
                      ? "var(--bm-gold)"
                      : "transparent"
                  }
                  color={
                    star <= (hoveredStar || rating)
                      ? "var(--bm-gold)"
                      : "rgba(var(--bm-ink-rgb),0.25)"
                  }
                />
              </button>
            ))}
            {rating > 0 && (
              <span
                style={{
                  fontFamily: "var(--font-syne)",
                  fontSize: "0.8rem",
                  color: "var(--bm-gold-text)",
                  alignSelf: "center",
                  marginLeft: "0.5rem",
                }}
              >
                {
                  ["", "Poor", "Fair", "Good", "Great", "Amazing!"][
                    rating
                  ]
                }
              </span>
            )}
          </div>
        </div>

        {/* Review title */}
        <div style={{ marginBottom: "1.25rem" }}>
          <label style={labelStyle}>Review Title *</label>
          <input
            {...register("title", { required: "Title is required" })}
            placeholder="e.g. Life changing experience!"
            style={{
              ...inputStyle,
              borderColor: errors.title
                ? "var(--bm-red)"
                : "var(--bm-forest)",
            }}
          />
          {errors.title && (
            <span style={errorStyle}>{errors.title.message}</span>
          )}
        </div>

        {/* Experience text */}
        <div style={{ marginBottom: "1.25rem" }}>
          <label style={labelStyle}>Your Experience *</label>
          <textarea
            {...register("content", {
              required: "Please share your experience",
              minLength: {
                value: 50,
                message: "Please write at least 50 characters",
              },
            })}
            placeholder="Tell us about your trek — the views, the team, the food, the memories..."
            rows={5}
            style={{
              ...inputStyle,
              resize: "vertical",
              minHeight: "120px",
              borderColor: errors.content
                ? "var(--bm-red)"
                : "var(--bm-forest)",
            }}
          />
          {errors.content && (
            <span style={errorStyle}>{errors.content.message}</span>
          )}
        </div>

        {/* Photo upload */}
        <div style={{ marginBottom: "2rem" }}>
          <label style={labelStyle}>
            Photos (optional — max 3)
          </label>

          {/* Photo previews */}
          {photos.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                marginBottom: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              {photos.map((photo, i) => (
                <div
                  key={i}
                  style={{
                    position: "relative",
                    width: "80px",
                    height: "80px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: "1px solid var(--bm-forest)",
                  }}
                >
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Photo ${i + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    style={{
                      position: "absolute",
                      top: "3px",
                      right: "3px",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: "rgba(10,12,11,0.8)",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#f2ede4",
                    }}
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          {photos.length < 3 && (
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.65rem 1.25rem",
                borderRadius: "8px",
                border: "1.5px dashed var(--bm-forest)",
                cursor: "pointer",
                fontFamily: "var(--font-syne)",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "rgba(var(--bm-ink-rgb),0.7)",
                transition: "all 0.2s",
              }}
              className="upload-label"
            >
              <Upload size={15} />
              Add Photos ({photos.length}/3)
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handlePhotoChange}
                style={{ display: "none" }}
              />
            </label>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.95rem",
            borderRadius: "10px",
            border: "none",
            background: loading
              ? "rgba(212,160,23,0.5)"
              : "var(--bm-gold)",
            color: "var(--bm-black)",
            fontFamily: "var(--font-syne)",
            fontWeight: 700,
            fontSize: "0.95rem",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
          className="submit-btn"
        >
          {loading ? "Submitting..." : "Post My Experience ✦"}
        </button>
      </form>

      <style>{`
        .upload-label:hover {
          border-color: var(--bm-sage) !important;
          color: var(--bm-sand) !important;
        }
        .submit-btn:hover:not(:disabled) {
          background: var(--bm-gold-light) !important;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}

// ── Style helpers ──
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  borderRadius: "8px",
  border: "1px solid var(--bm-forest)",
  background: "var(--bm-forest)",
  color: "var(--bm-cream)",
  fontFamily: "var(--font-body)",
  fontSize: "0.88rem",
  outline: "none",
  transition: "border-color 0.2s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-syne)",
  fontWeight: 600,
  fontSize: "0.78rem",
  color: "rgba(var(--bm-ink-rgb),0.78)",
  marginBottom: "0.5rem",
  letterSpacing: "0.5px",
};

const errorStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "0.72rem",
  color: "var(--bm-red)",
  marginTop: "0.25rem",
  display: "block",
};