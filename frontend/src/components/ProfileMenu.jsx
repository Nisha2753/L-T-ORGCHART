/**
 * ProfileMenu.jsx
 * User profile avatar + dropdown menu in the header.
 */
import { useState, useRef, useEffect } from "react";
import { LogOut, User, Shield, ChevronDown } from "lucide-react";

const ProfileMenu = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>

      {/* Avatar button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "5px 10px 5px 5px",
          background: open ? "#f0f4ff" : "transparent",
          border: `1.5px solid ${open ? "#c7d2fe" : "#e2e8f0"}`,
          borderRadius: 99, cursor: "pointer",
          transition: "all 0.15s ease",
          fontFamily: "var(--font-body)",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "#f0f4ff";
          e.currentTarget.style.borderColor = "#c7d2fe";
        }}
        onMouseLeave={e => {
          if (!open) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "#e2e8f0";
          }
        }}
      >
        {/* Avatar circle */}
        <div style={{
          width: 30, height: 30, borderRadius: "50%",
          background: user.avatarColor || "#1a3a6b",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: 12, color: "white", flexShrink: 0,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}>
          {user.avatar || user.name?.[0]?.toUpperCase() || "U"}
        </div>

        {/* Name */}
        <span style={{
          fontSize: 13, fontWeight: 600, color: "#0f172a",
          whiteSpace: "nowrap",
        }}>
          {user.name}
        </span>

        <ChevronDown
          size={13}
          style={{
            color: "#94a3b8",
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.2s ease",
          }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
          width: 220, zIndex: 999,
          overflow: "hidden",
          animation: "fadeInDown 0.15s ease",
        }}>

          {/* User info header */}
          <div style={{
            padding: "14px 16px",
            background: "linear-gradient(135deg, #1a3a6b, #0f2548)",
            borderBottom: "1px solid #e2e8f0",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-display)", fontWeight: 700,
                fontSize: 15, color: "white", flexShrink: 0,
                border: "2px solid rgba(255,255,255,0.3)",
              }}>
                {user.avatar || user.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "white" }}>
                  {user.name}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 1 }}>
                  {user.role || "User"}
                </div>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div style={{ padding: "6px 0" }}>

            <MenuItem icon={User} label="My Profile" onClick={() => setOpen(false)} />
            <MenuItem icon={Shield} label="Permissions" onClick={() => setOpen(false)} />

            {/* Divider */}
            <div style={{ height: 1, background: "#f1f5f9", margin: "6px 0" }} />

            <MenuItem
              icon={LogOut}
              label="Sign Out"
              onClick={() => { setOpen(false); onLogout(); }}
              danger
            />
          </div>

          {/* Footer */}
          <div style={{
            padding: "8px 16px",
            borderTop: "1px solid #f1f5f9",
            fontSize: 10, color: "#94a3b8",
            background: "#fafbff",
            textAlign: "center",
          }}>
            L&T OrgChart Modelling Platform
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MenuItem helper ──────────────────────────────────────────────────────────
const MenuItem = ({ icon: Icon, label, onClick, danger = false }) => (
  <button
    onClick={onClick}
    style={{
      width: "100%", display: "flex", alignItems: "center", gap: 10,
      padding: "9px 16px", background: "none", border: "none",
      cursor: "pointer", textAlign: "left",
      fontSize: 13, fontWeight: 500,
      color: danger ? "#ef4444" : "#374151",
      fontFamily: "var(--font-body)",
      transition: "background 0.1s ease",
    }}
    onMouseEnter={e => e.currentTarget.style.background = danger ? "#fef2f2" : "#f8fafc"}
    onMouseLeave={e => e.currentTarget.style.background = "none"}
  >
    <Icon size={14} style={{ color: danger ? "#ef4444" : "#64748b", flexShrink: 0 }} />
    {label}
  </button>
);

export default ProfileMenu;