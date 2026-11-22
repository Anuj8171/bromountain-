"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { CheckCircle, Users, User, UserCheck, Building2, Heart } from "lucide-react";
import toast from "react-hot-toast";
import { Adventure, GroupType, DepartureDate } from "@/types/index";
import { getPriceInfo, formatPrice } from "@/lib/adventure-utils";

const groupTypes = [
  { value: "solo", label: "Solo", icon: User, desc: "Just me" },
  { value: "random_group", label: "Random Group", icon: Users, desc: "Join others" },
  { value: "friends_group", label: "Friends", icon: UserCheck, desc: "My group" },
  { value: "family", label: "Family", icon: Heart, desc: "Family trip" },
  { value: "corporate", label: "Corporate", icon: Building2, desc: "Team outing" },
];

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  group_size: number;
  departure_date_id: string;
  special_requests: string;
}

export default function BookingForm({ adventure,onSuccess }: { adventure: Adventure,onSuccess?: () => void }) {
  const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const price = getPriceInfo(adventure);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<BookingFormData>({
    defaultValues: { group_size: 1 },
  });

  const groupSize = watch("group_size") || 1;

  // ── Generate booking reference ──
  const generateRef = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `BM-${new Date().getFullYear()}-${num}`;
  };

  // ── Build WhatsApp message ──
  const buildWhatsAppMessage = (data: BookingFormData) => {
    const displayPrice = price.offerActive ? price.offer! : price.sale;
    const total = displayPrice * Number(data.group_size);
    const selectedDate = adventure.departure_dates?.find(
      (d) => d.id === data.departure_date_id
    );

    return encodeURIComponent(
      `Hi BroMountain! 🏔️\n` +
      `I just submitted a booking request.\n\n` +
      `*Adventure:* ${adventure.title}\n` +
      `*Group Type:* ${groupTypes.find((g) => g.value === selectedGroup)?.label}\n` +
      `*Group Size:* ${data.group_size} ${Number(data.group_size) === 1 ? "person" : "people"}\n` +
      `*Date:* ${selectedDate ? new Date(selectedDate.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "Flexible"}\n` +
      `*Total:* ₹${total.toLocaleString("en-IN")}\n\n` +
      `*Name:* ${data.name}\n` +
      `*Phone:* ${data.phone}\n` +
      `*Ref:* ${bookingRef || "pending"}\n\n` +
      `Please confirm my slot!`
    );
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!selectedGroup) {
      toast.error("Please select a group type");
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with real API when Supabase connected
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adventure_id:       adventure.id,
          departure_date_id:  data.departure_date_id || null,
          name:               data.name,
          email:              data.email,
          phone:              data.phone,
          whatsapp:           data.whatsapp,
          group_type:         selectedGroup,
          group_size:         data.group_size,
          special_requests:   data.special_requests || null,
        }),
      });

const result = await res.json();
if (!res.ok) throw new Error(result.error);

const ref = result.booking_ref || generateRef();
setBookingRef(ref);
      setSubmitted(true);

      // Open WhatsApp with pre-filled message
      const waNumber = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "919876543210";
      const message  = buildWhatsAppMessage(data);
      window.open(`https://wa.me/${waNumber}?text=${message}`, "_blank");

      toast.success("Booking submitted successfully!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: "var(--bm-deep)",
          border: "1px solid rgba(122,184,138,0.3)",
          borderRadius: "16px",
          padding: "2.5rem",
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
            marginBottom: "0.5rem",
          }}
        >
          Booking Request Submitted!
        </h3>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.85rem",
            color: "rgba(var(--bm-ink-rgb),0.72)",
            lineHeight: 1.6,
            marginBottom: "1rem",
          }}
        >
          Your booking has been saved. A WhatsApp message has opened for you
          to send to us directly.
        </p>
        <div
          style={{
            display: "inline-block",
            background: "rgba(212,160,23,0.1)",
            border: "1px solid rgba(212,160,23,0.25)",
            borderRadius: "8px",
            padding: "0.6rem 1.2rem",
            marginBottom: "1.5rem",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 700,
              fontSize: "0.8rem",
              color: "var(--bm-gold-text)",
              letterSpacing: "1px",
            }}
          >
            Ref: {bookingRef}
          </span>
        </div>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.78rem",
            color: "rgba(var(--bm-ink-rgb),0.65)",
          }}
        >
          We will confirm your slot within 24 hours via WhatsApp.
        </p>
      </motion.div>
    );
  }

  return (
    <div
      style={{
        background: "var(--bm-deep)",
        border: "1px solid var(--bm-forest)",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "1.5rem",
          borderBottom: "1px solid var(--bm-forest)",
          background: "rgba(42,74,50,0.15)",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 700,
            fontSize: "1.1rem",
            color: "var(--bm-cream)",
            marginBottom: "0.4rem",
          }}
        >
          Book This Adventure
        </h3>

        {/* Price display */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <span className="price-original">
            {formatPrice(price.original)}
          </span>
          {price.offerActive ? (
            <span className="price-offer">
              {formatPrice(price.offer!)}
            </span>
          ) : (
            <span className="price-sale">
              {formatPrice(price.sale)}
            </span>
          )}
          {price.offerActive && (
            <span className="offer-badge">✦ SPECIAL OFFER</span>
          )}
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.72rem",
              color: "rgba(var(--bm-ink-rgb),0.65)",
            }}
          >
            per person
          </span>
        </div>
      </div>

      <div style={{ padding: "1.5rem" }}>

        {/* Step 1 — Group type */}
        <div style={{ marginBottom: "1.5rem" }}>
          <p
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 700,
              fontSize: "0.78rem",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "rgba(var(--bm-ink-rgb),0.7)",
              marginBottom: "0.75rem",
            }}
          >
            Step 1 — Select Group Type
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
              gap: "0.5rem",
            }}
          >
            {groupTypes.map((group) => {
              const Icon = group.icon;
              const isSelected = selectedGroup === group.value;
              return (
                <button
                  key={group.value}
                  onClick={() => setSelectedGroup(group.value as GroupType)}
                  style={{
                    padding: "0.75rem 0.5rem",
                    borderRadius: "10px",
                    border: "1px solid",
                    borderColor: isSelected
                      ? "var(--bm-gold)"
                      : "var(--bm-forest)",
                    background: isSelected
                      ? "rgba(212,160,23,0.12)"
                      : "transparent",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  <Icon
                    size={18}
                    color={
                      isSelected
                        ? "var(--bm-gold)"
                        : "rgba(var(--bm-ink-rgb),0.4)"
                    }
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-syne)",
                      fontWeight: 600,
                      fontSize: "0.65rem",
                      color: isSelected
                        ? "var(--bm-gold)"
                        : "rgba(var(--bm-ink-rgb),0.4)",
                      textAlign: "center",
                      lineHeight: 1.2,
                    }}
                  >
                    {group.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2 — Form (shows after group selected) */}
        <AnimatePresence>
          {selectedGroup && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: "rgba(var(--bm-ink-rgb),0.7)",
                  marginBottom: "1rem",
                }}
              >
                Step 2 — Your Details
              </p>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {/* Name */}
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <input
                      {...register("name", { required: "Name is required" })}
                      placeholder="Rahul Sharma"
                      style={{
                        ...inputStyle,
                        borderColor: errors.name
                          ? "var(--bm-red)"
                          : "var(--bm-forest)",
                      }}
                    />
                    {errors.name && (
                      <span style={errorStyle}>{errors.name.message}</span>
                    )}
                  </div>

                  {/* Phone + WhatsApp */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.75rem",
                    }}
                  >
                    <div>
                      <label style={labelStyle}>Phone *</label>
                      <input
                        {...register("phone", {
                          required: "Phone is required",
                          pattern: {
                            value: /^[6-9]\d{9}$/,
                            message: "Invalid phone number",
                          },
                        })}
                        placeholder="9876543210"
                        style={{
                          ...inputStyle,
                          borderColor: errors.phone
                            ? "var(--bm-red)"
                            : "var(--bm-forest)",
                        }}
                      />
                      {errors.phone && (
                        <span style={errorStyle}>{errors.phone.message}</span>
                      )}
                    </div>
                    <div>
                      <label style={labelStyle}>WhatsApp *</label>
                      <input
                        {...register("whatsapp", {
                          required: "WhatsApp is required",
                        })}
                        placeholder="9876543210"
                        style={{
                          ...inputStyle,
                          borderColor: errors.whatsapp
                            ? "var(--bm-red)"
                            : "var(--bm-forest)",
                        }}
                      />
                      {errors.whatsapp && (
                        <span style={errorStyle}>
                          {errors.whatsapp.message}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input
                      {...register("email", {
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
                        borderColor: errors.email
                          ? "var(--bm-red)"
                          : "var(--bm-forest)",
                      }}
                    />
                    {errors.email && (
                      <span style={errorStyle}>{errors.email.message}</span>
                    )}
                  </div>

                  {/* Group size + Date */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.75rem",
                    }}
                  >
                    <div>
                      <label style={labelStyle}>Group Size *</label>
                      <input
                        {...register("group_size", {
                          required: "Required",
                          min: { value: 1, message: "Min 1" },
                          max: {
                            value: adventure.max_group_size,
                            message: `Max ${adventure.max_group_size}`,
                          },
                        })}
                        type="number"
                        min={1}
                        max={adventure.max_group_size}
                        style={{
                          ...inputStyle,
                          borderColor: errors.group_size
                            ? "var(--bm-red)"
                            : "var(--bm-forest)",
                        }}
                      />
                      {errors.group_size && (
                        <span style={errorStyle}>
                          {errors.group_size.message}
                        </span>
                      )}
                    </div>
                    <div>
                      <label style={labelStyle}>Preferred Date</label>
                      <select
                        {...register("departure_date_id")}
                        style={{ ...inputStyle, borderColor: "var(--bm-forest)" }}
                      >
                        <option value="">Flexible</option>
                        {adventure.departure_dates
                          ?.filter(
                            (d) => d.available_slots - d.booked_slots > 0
                          )
                          .map((d) => {
                            const slots = d.available_slots - d.booked_slots;
                            return (
                              <option key={d.id} value={d.id}>
                                {new Date(d.date).toLocaleDateString(
                                  "en-IN",
                                  { day: "numeric", month: "short" }
                                )}{" "}
                                ({slots} slots)
                              </option>
                            );
                          })}
                      </select>
                    </div>
                  </div>

                  {/* Special requests */}
                  <div>
                    <label style={labelStyle}>
                      Special Requests (optional)
                    </label>
                    <textarea
                      {...register("special_requests")}
                      placeholder="Vegetarian meals, medical conditions, etc."
                      rows={3}
                      style={{
                        ...inputStyle,
                        resize: "none",
                        borderColor: "var(--bm-forest)",
                      }}
                    />
                  </div>

                  {/* Total price */}
                  <div
                    style={{
                      padding: "1rem",
                      background: "rgba(42,74,50,0.2)",
                      borderRadius: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-syne)",
                        fontSize: "0.82rem",
                        color: "rgba(var(--bm-ink-rgb),0.72)",
                      }}
                    >
                      {groupSize} × {formatPrice(price.offerActive ? price.offer! : price.sale)}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-syne)",
                        fontWeight: 800,
                        fontSize: "1.1rem",
                        color: "var(--bm-gold-text)",
                      }}
                    >
                      {formatPrice((price.offerActive ? price.offer! : price.sale) * Number(groupSize))}
                    </span>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "1rem",
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
                    className="booking-submit"
                  >
                    {loading
                      ? "Submitting..."
                      : "Submit Booking Request 🏔️"}
                  </button>

                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.72rem",
                      color: "rgba(var(--bm-ink-rgb),0.6)",
                      textAlign: "center",
                      lineHeight: 1.5,
                    }}
                  >
                    After submitting, WhatsApp will open automatically so
                    you can send your booking details to us directly.
                  </p>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .booking-submit:hover:not(:disabled) {
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
  border: "1px solid",
  background: "var(--bm-forest)",
  color: "var(--bm-cream)",
  fontFamily: "var(--font-body)",
  fontSize: "0.85rem",
  outline: "none",
  transition: "border-color 0.2s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-syne)",
  fontWeight: 600,
  fontSize: "0.72rem",
  color: "rgba(var(--bm-ink-rgb),0.72)",
  marginBottom: "0.4rem",
  letterSpacing: "0.5px",
};

const errorStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "0.7rem",
  color: "var(--bm-red)",
  marginTop: "0.2rem",
  display: "block",
};
