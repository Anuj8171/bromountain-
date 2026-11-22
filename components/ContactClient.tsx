// components/ContactClient.tsx
// PURPOSE: Full contact page UI (client component). Rendered by
//   app/contact/page.tsx. Includes:
//   - Navbar (its own instance, not shared with app/page.tsx)
//   - Hero: "Let's Plan Your Adventure" heading + subtext
//   - Contact info cards (MapPin, Phone, Mail, Clock)
//   - Contact form (react-hook-form) → opens WhatsApp with a pre-filled
//     message on submit, shows success state
//   - FAQ accordion (faqs from lib/faqs.ts) — renders the same data that
//     app/contact/page.tsx sends to getFaqSchema for JSON-LD
//   - Footer (its own instance)
// CONNECTED TO:
//   - app/contact/page.tsx (renders <ContactClient sections={...} />)
//   - lib/faqs.ts (faqs — imported here for the accordion UI)
//   - lib/auth.ts? No — this is public-facing, no auth.
//   - NEXT_PUBLIC_ADMIN_WHATSAPP env var for the WhatsApp number.
//   - react-hot-toast for success/error toasts.
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  MapPin, Phone, Mail, Clock,
  Instagram, Youtube, CheckCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import toast from "react-hot-toast";
import { Section } from "@/types/index";
import { faqs } from "@/lib/faqs";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}


const contactInfo = [
  {
    icon: MapPin,
    label: "Our Base",
    value: "Uttarkashi, Uttarakhand",
    sub: "Gateway to the Himalayas",
  },
  {
    icon: Phone,
    label: "Call Us",
    value: ["+91 81910 10300", "+91 79063 90034"],
    sub: "Mon–Sat, 8AM–8PM",
  },
  {
    icon: Mail,
    label: "Email Us",
    value: "bromountains01@gmail.com",
    sub: "We reply within 24 hours",
  },
  {
    icon: Clock,
    label: "Office Hours",
    value: "8:00 AM – 8:00 PM",
    sub: "Monday to Saturday",
  },
];

export default function ContactPage({sections}: { sections: Section[] }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [openFaq, setOpenFaq]     = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));

      // open whatsapp with pre-filled message
      const waNumber = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "919876543210";
      const message  = encodeURIComponent(
        `Hi BroMountain! 👋\n\n` +
        `*Name:* ${data.name}\n` +
        `*Email:* ${data.email}\n` +
        `*Phone:* ${data.phone}\n` +
        `*Subject:* ${data.subject}\n\n` +
        `*Message:*\n${data.message}`
      );
      window.open(`https://wa.me/${waNumber}?text=${message}`, "_blank");

      setSubmitted(true);
      reset();
      toast.success("Message sent!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "80px", minHeight: "100vh" }}>

        {/* ── Hero ── */}
        <section
          style={{
            padding: "5rem 1.5rem 4rem",
            textAlign: "center",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "var(--bm-gold-text)",
                display: "block",
                marginBottom: "1rem",
              }}
            >
              ✦ Get In Touch
            </span>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 5vw, 3.2rem)",
                fontWeight: 900,
                color: "var(--bm-cream)",
                lineHeight: 1.15,
                marginBottom: "1rem",
              }}
            >
              Let's Plan Your{" "}
              <em style={{ color: "var(--bm-gold-text)", fontStyle: "italic" }}>
                Adventure
              </em>
            </h1>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.95rem",
                color: "rgba(var(--bm-ink-rgb),0.72)",
                lineHeight: 1.7,
              }}
            >
              Have questions? Want to plan a custom trek? Just want to say
              hello? We're based in Uttarkashi and always happy to chat.
            </p>
          </motion.div>
        </section>

        {/* ── Contact info cards ── */}
        <section
          style={{
            padding: "0 1.5rem 4rem",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
              marginBottom: "4rem",
            }}
          >
            {contactInfo.map(({ icon: Icon, label, value, sub }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                style={{
                  background: "var(--bm-deep)",
                  border: "1px solid var(--bm-forest)",
                  borderRadius: "14px",
                  padding: "1.5rem",
                  display: "flex",
                  gap: "1rem",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: "rgba(212,160,23,0.1)",
                    border: "1px solid rgba(212,160,23,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} color="var(--bm-gold)" strokeWidth={1.5} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: "var(--font-syne)",
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      color: "rgba(var(--bm-ink-rgb),0.65)",
                      marginBottom: "0.3rem",
                    }}
                  >
                    {label}
                  </p>
                  {Array.isArray(value) ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.25rem",
                        marginBottom: "0.2rem",
                      }}
                    >
                      {value.map((phone) => (
                        <a
                          key={phone}
                          href={`tel:${phone.replace(/\s+/g, "")}`}
                          className="contact-phone"
                          style={{
                            fontFamily: "var(--font-syne)",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            lineHeight: 1.45,
                            color: "var(--bm-cream)",
                            textDecoration: "none",
                            whiteSpace: "nowrap",
                            transition: "color 0.2s",
                          }}
                        >
                          {phone}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p
                      style={{
                        fontFamily: "var(--font-syne)",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        color: "var(--bm-cream)",
                        marginBottom: "0.2rem",
                        overflowWrap: "break-word",
                        minWidth: 0,
                      }}
                    >
                      {value}
                    </p>
                  )}
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.75rem",
                      color: "rgba(var(--bm-ink-rgb),0.65)",
                    }}
                  >
                    {sub}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Form + FAQ grid ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "3rem",
              alignItems: "start",
            }}
          >
            {/* Contact form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 700,
                  fontSize: "1.2rem",
                  color: "var(--bm-cream)",
                  marginBottom: "1.5rem",
                }}
              >
                Send Us a Message
              </h2>

              {submitted ? (
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
                    size={44}
                    color="var(--bm-mint)"
                    style={{ margin: "0 auto 1rem" }}
                  />
                  <h3
                    style={{
                      fontFamily: "var(--font-syne)",
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      color: "var(--bm-cream)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Message Sent!
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.85rem",
                      color: "rgba(var(--bm-ink-rgb),0.72)",
                      lineHeight: 1.6,
                      marginBottom: "1.5rem",
                    }}
                  >
                    WhatsApp has opened with your message. Hit send and
                    we'll get back to you within 24 hours.
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
                    Send Another
                  </button>
                </motion.div>
              ) : (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  style={{
                    background: "var(--bm-deep)",
                    border: "1px solid var(--bm-forest)",
                    borderRadius: "16px",
                    padding: "2rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.1rem",
                  }}
                >
                  {/* Name + Phone */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.75rem",
                    }}
                  >
                    <div>
                      <label style={labelStyle}>Name *</label>
                      <input
                        {...register("name", { required: "Required" })}
                        placeholder="Your name"
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
                    <div>
                      <label style={labelStyle}>Phone *</label>
                      <input
                        {...register("phone", { required: "Required" })}
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
                  </div>

                  {/* Email */}
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input
                      {...register("email", {
                        required: "Required",
                        pattern: {
                          value: /^\S+@\S+\.\S+$/,
                          message: "Invalid email",
                        },
                      })}
                      type="email"
                      placeholder="hello@gmail.com"
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

                  {/* Subject */}
                  <div>
                    <label style={labelStyle}>Subject *</label>
                    <select
                      {...register("subject", { required: "Required" })}
                      style={{
                        ...inputStyle,
                        borderColor: errors.subject
                          ? "var(--bm-red)"
                          : "var(--bm-forest)",
                      }}
                    >
                      <option value="">Select subject...</option>
                      <option value="Trek Enquiry">Trek Enquiry</option>
                      <option value="Custom Trek">Custom Trek Request</option>
                      <option value="Group Booking">Group Booking</option>
                      <option value="Cancellation">Cancellation/Refund</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.subject && (
                      <span style={errorStyle}>{errors.subject.message}</span>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label style={labelStyle}>Message *</label>
                    <textarea
                      {...register("message", {
                        required: "Please write a message",
                        minLength: {
                          value: 20,
                          message: "At least 20 characters",
                        },
                      })}
                      placeholder="Tell us what you're looking for..."
                      rows={4}
                      style={{
                        ...inputStyle,
                        resize: "vertical",
                        minHeight: "100px",
                        borderColor: errors.message
                          ? "var(--bm-red)"
                          : "var(--bm-forest)",
                      }}
                    />
                    {errors.message && (
                      <span style={errorStyle}>{errors.message.message}</span>
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
                    className="contact-submit"
                  >
                    {loading ? "Sending..." : "Send Message via WhatsApp 💬"}
                  </button>

                  {/* Social links */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "1rem",
                      paddingTop: "0.5rem",
                    }}
                  >
                    {[
                      { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/bromountains/" },
                      { icon: Youtube, label: "YouTube", href: "#" },
                    ].map(({ icon: Icon, label, href }) => (
                      <a
                        key={label}
                        href={href}
                        aria-label={label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          fontFamily: "var(--font-syne)",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          color: "rgba(var(--bm-ink-rgb),0.68)",
                          textDecoration: "none",
                          transition: "color 0.2s",
                        }}
                        className="social-link"
                      >
                        <Icon size={14} />
                        {label}
                      </a>
                    ))}
                  </div>
                </form>
              )}
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-syne)",
                  fontWeight: 700,
                  fontSize: "1.2rem",
                  color: "var(--bm-cream)",
                  marginBottom: "1.5rem",
                }}
              >
                Frequently Asked Questions
              </h2>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {faqs.map((faq, i) => (
                  <div
                    key={i}
                    style={{
                      background: "var(--bm-deep)",
                      border: "1px solid",
                      borderColor:
                        openFaq === i
                          ? "rgba(212,160,23,0.3)"
                          : "var(--bm-forest)",
                      borderRadius: "12px",
                      overflow: "hidden",
                      transition: "border-color 0.2s",
                    }}
                  >
                    <button
                      onClick={() =>
                        setOpenFaq(openFaq === i ? null : i)
                      }
                      style={{
                        width: "100%",
                        padding: "1.1rem 1.25rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        gap: "1rem",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-syne)",
                          fontWeight: 600,
                          fontSize: "0.88rem",
                          color:
                            openFaq === i
                              ? "var(--bm-gold)"
                              : "var(--bm-cream)",
                          lineHeight: 1.4,
                          transition: "color 0.2s",
                        }}
                      >
                        {faq.q}
                      </span>
                      <span
                        style={{
                          color:
                            openFaq === i
                              ? "var(--bm-gold)"
                              : "rgba(var(--bm-ink-rgb),0.3)",
                          fontSize: "1.2rem",
                          flexShrink: 0,
                          transition: "all 0.2s",
                          transform:
                            openFaq === i ? "rotate(45deg)" : "rotate(0deg)",
                        }}
                      >
                        +
                      </span>
                    </button>

                    {openFaq === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          padding: "0 1.25rem 1.1rem",
                          borderTop: "1px solid var(--bm-forest)",
                        }}
                      >
                        <p
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "0.85rem",
                            color: "rgba(var(--bm-ink-rgb),0.75)",
                            lineHeight: 1.7,
                            paddingTop: "0.85rem",
                          }}
                        >
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer sections={sections}  />

      <style>{`
        .contact-submit:hover:not(:disabled) {
          background: var(--bm-gold-light) !important;
          transform: translateY(-1px);
        }
        .social-link:hover {
          color: var(--bm-gold-text) !important;
        }
        .contact-phone:hover {
          color: var(--bm-gold-text) !important;
        }
      `}</style>
    </>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  borderRadius: "8px",
  border: "1px solid",
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
  fontSize: "0.75rem",
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