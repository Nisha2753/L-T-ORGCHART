/**
 * LoginPage.jsx
 * L&T branded login page with Orane Consulting branding.
 * Credentials: ID = nidhi, Password = nidhi
 */
import { useState } from "react";
import ltLogo from "../assets/lt-logo.png";

const LoginPage = ({ onLogin }) => {
  const [userId,   setUserId]   = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!userId.trim() || !password.trim()) {
      setError("Please enter both User ID and Password.");
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    if (userId.trim().toLowerCase() === "nidhi" && password === "nidhi") {
      onLogin({
        id:          "nidhi",
        name:        "Nidhi",
        role:        "HR Administrator",
        avatar:      "N",
        avatarColor: "#1a3a6b",
      });
    } else {
      setError("Invalid User ID or Password. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a1628 0%, #1a3a6b 50%, #0e2548 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-body)",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* ── Background decorative circles ── */}
      <div style={{
        position: "absolute", width: 600, height: 600,
        borderRadius: "50%", border: "1px solid rgba(255,255,255,0.04)",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: 900, height: 900,
        borderRadius: "50%", border: "1px solid rgba(255,255,255,0.03)",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: 300, height: 300,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,91,219,0.15) 0%, transparent 70%)",
        top: "10%", right: "10%",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: 200, height: 200,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)",
        bottom: "15%", left: "8%",
        pointerEvents: "none",
      }} />

      {/* ── Login card ── */}
      <div style={{
        background: "rgba(255,255,255,0.97)",
        borderRadius: 20,
        width: "100%",
        maxWidth: 420,
        padding: "36px 40px 32px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)",
        position: "relative",
        zIndex: 1,
      }}>

        {/* ── Logo ── */}
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <img
            src={ltLogo}
            alt="Larsen & Toubro"
            style={{
              height: 48,
              width: "auto",
              objectFit: "contain",
              display: "block",
              margin: "0 auto",
            }}
          />
        </div>

        {/* ── Title + Orane badge ── */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: 22, fontWeight: 700,
            color: "#0f172a", margin: 0, lineHeight: 1.3,
          }}>
            OrgChart Modelling
          </h1>
          <p style={{
            fontSize: 13, color: "#64748b",
            marginTop: 6, marginBottom: 12,
          }}>
            Sign in to your account to continue
          </p>

          {/* Orane Consulting badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 14px",
            background: "linear-gradient(135deg, #fff7ed, #ffedd5)",
            border: "1px solid #fed7aa",
            borderRadius: 99,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#f97316", flexShrink: 0,
              boxShadow: "0 0 6px rgba(249,115,22,0.5)",
            }} />
            <span style={{
              fontSize: 11, fontWeight: 700, color: "#c2410c",
              letterSpacing: "0.8px", textTransform: "uppercase",
              fontFamily: "var(--font-display)",
            }}>
              Powered by Orane Consulting
            </span>
          </div>
        </div>

        {/* ── Form ── */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
        >

          {/* User ID */}
          <div>
            <label style={{
              fontSize: 11, fontWeight: 700, color: "#475569",
              textTransform: "uppercase", letterSpacing: "0.8px",
              display: "block", marginBottom: 6,
            }}>
              User ID
            </label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: 12, top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8", fontSize: 16, pointerEvents: "none",
              }}>
                👤
              </span>
              <input
                type="text"
                value={userId}
                onChange={e => { setUserId(e.target.value); setError(""); }}
                placeholder="Enter your User ID"
                autoComplete="username"
                style={{
                  width: "100%",
                  padding: "11px 14px 11px 38px",
                  border: `1.5px solid ${error ? "#fca5a5" : "#e2e8f0"}`,
                  borderRadius: 10, fontSize: 14,
                  fontFamily: "var(--font-body)", color: "#0f172a",
                  background: "#f8fafc", outline: "none",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                  boxSizing: "border-box",
                }}
                onFocus={e => {
                  e.target.style.borderColor = "#1a3a6b";
                  e.target.style.boxShadow   = "0 0 0 3px rgba(26,58,107,0.1)";
                  e.target.style.background  = "#ffffff";
                }}
                onBlur={e => {
                  e.target.style.borderColor = error ? "#fca5a5" : "#e2e8f0";
                  e.target.style.boxShadow   = "none";
                  e.target.style.background  = "#f8fafc";
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{
              fontSize: 11, fontWeight: 700, color: "#475569",
              textTransform: "uppercase", letterSpacing: "0.8px",
              display: "block", marginBottom: 6,
            }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: 12, top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8", fontSize: 16, pointerEvents: "none",
              }}>
                🔒
              </span>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder="Enter your password"
                autoComplete="current-password"
                style={{
                  width: "100%",
                  padding: "11px 42px 11px 38px",
                  border: `1.5px solid ${error ? "#fca5a5" : "#e2e8f0"}`,
                  borderRadius: 10, fontSize: 14,
                  fontFamily: "var(--font-body)", color: "#0f172a",
                  background: "#f8fafc", outline: "none",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                  boxSizing: "border-box",
                }}
                onFocus={e => {
                  e.target.style.borderColor = "#1a3a6b";
                  e.target.style.boxShadow   = "0 0 0 3px rgba(26,58,107,0.1)";
                  e.target.style.background  = "#ffffff";
                }}
                onBlur={e => {
                  e.target.style.borderColor = error ? "#fca5a5" : "#e2e8f0";
                  e.target.style.boxShadow   = "none";
                  e.target.style.background  = "#f8fafc";
                }}
              />
              {/* Show / hide toggle */}
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{
                  position: "absolute", right: 10, top: "50%",
                  transform: "translateY(-50%)",
                  background: "none", border: "none",
                  cursor: "pointer", padding: 4,
                  color: "#94a3b8", fontSize: 15,
                }}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              padding: "10px 14px",
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: 8, fontSize: 12.5, color: "#dc2626",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "13px",
              background: loading
                ? "#94a3b8"
                : "linear-gradient(135deg, #1a3a6b 0%, #0f2548 100%)",
              color: "white", border: "none", borderRadius: 10,
              fontSize: 14, fontWeight: 700,
              fontFamily: "var(--font-display)",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              letterSpacing: "0.3px",
              marginTop: 4,
              boxShadow: loading
                ? "none"
                : "0 4px 16px rgba(26,58,107,0.35)",
            }}
            onMouseEnter={e => {
              if (!loading) e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {loading ? (
              <span style={{
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8,
              }}>
                <span style={{
                  width: 14, height: 14,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "white", borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.7s linear infinite",
                }} />
                Signing in...
              </span>
            ) : "Sign In"}
          </button>
        </form>

        {/* Demo credentials hint */}
        <div style={{
          marginTop: 20, padding: "10px 14px",
          background: "#f0f9ff", border: "1px solid #bae6fd",
          borderRadius: 8, fontSize: 11.5, color: "#0369a1",
          textAlign: "center",
        }}>
          Demo credentials — ID: <strong>nidhi</strong> · Password: <strong>nidhi</strong>
        </div>

      </div>

      {/* ── Footer ── */}
      <div style={{
        marginTop: 24, textAlign: "center",
        position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 5,
      }}>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
          © {new Date().getFullYear()} Larsen &amp; Toubro Limited. All rights reserved.
        </span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
          Solution by{" "}
          <span style={{ color: "#fb923c", fontWeight: 600 }}>
            Orane Consulting
          </span>
        </span>
      </div>

    </div>
  );
};

export default LoginPage;