"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mountain, Lock } from "lucide-react";
import toast from "react-hot-toast";
import ThemeToggle from "@/components/ThemeToggle";

export default function AdminLoginPage() {
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const router                    = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error("Please enter password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Welcome back!");
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        toast.error("Wrong password. Try again.");
        setPassword("");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        // Transparent so the site-wide mountain backdrop shows through
        background: "transparent",
        position: "relative",
        overflowX: "hidden",
        overflowY: "auto",
      }}
    >
      {/* Light / dark switch */}
      <div style={{ position: "absolute", top: "1rem", right: "1rem", zIndex: 2 }}>
        <ThemeToggle
          size={18}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "var(--bm-glass)",
            border: "1px solid var(--bm-glass-border)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            cursor: "pointer",
            color: "var(--bm-cream)",
            transition: "color 0.2s, border-color 0.2s",
          }}
        />
      </div>
      {/* bg glow */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "500px",
          height: "400px",
          background: "var(--bm-moss)",
          opacity: 0.1,
          filter: "blur(80px)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          width: "100%",
          maxWidth: "400px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "2.5rem",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "var(--bm-gold)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
            }}
          >
            <Mountain size={28} color="var(--bm-black)" strokeWidth={2.5} />
          </div>
          <h1
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 800,
              fontSize: "1.5rem",
              color: "var(--bm-cream)",
              marginBottom: "0.3rem",
            }}
          >
            Bro<span style={{ color: "var(--bm-gold-text)" }}>Mountain</span>
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.92rem",
              color: "rgba(var(--bm-ink-rgb),0.68)",
            }}
          >
            Admin Dashboard
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--bm-deep)",
            border: "1px solid var(--bm-forest)",
            borderRadius: "20px",
            padding: "2.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              marginBottom: "2rem",
            }}
          >
            <Lock size={16} color="var(--bm-gold)" />
            <h2
              style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 700,
                fontSize: "1rem",
                color: "var(--bm-cream)",
              }}
            >
              Admin Access Only
            </h2>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  fontFamily: "var(--font-syne)",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  color: "rgba(var(--bm-ink-rgb),0.72)",
                  marginBottom: "0.5rem",
                  letterSpacing: "0.5px",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "0.85rem 3rem 0.85rem 1rem",
                    borderRadius: "10px",
                    border: "1px solid var(--bm-forest)",
                    background: "var(--bm-forest)",
                    color: "var(--bm-cream)",
                    fontFamily: "var(--font-body)",
                    fontSize: "1rem",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute",
                    right: "0.85rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(var(--bm-ink-rgb),0.65)",
                    display: "flex",
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

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
                fontSize: "1rem",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
            >
              {loading ? "Verifying..." : "Login to Dashboard"}
            </button>
          </form>
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: "1.5rem",
            fontFamily: "var(--font-body)",
            fontSize: "0.85rem",
            color: "rgba(var(--bm-ink-rgb),0.55)",
          }}
        >
          BroMountain Adventures — Uttarkashi
        </p>
      </motion.div>
    </div>
  );
}
