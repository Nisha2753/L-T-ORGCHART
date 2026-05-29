/**
 * EmployeeCard.jsx
 * Custom React Flow node — represents a single employee in the org chart.
 */

import { memo } from "react";
import { Handle, Position } from "reactflow";
import { MapPin, Building2, Hash, Layers, Phone, Mail } from "lucide-react";

const LEVEL_COLORS = {
  0: "#e67700",
  1: "#3b5bdb",
  2: "#0891b2",
  3: "#059669",
  4: "#7c3aed",
};

const EmployeeCard = memo(({ data, selected }) => {
  const {
    id,
    name,
    designation,
    department,
    location,
    avatar,
    initials,
    avatarColor,
    level = 0,
    isHighlighted,
    isDimmed,
    isStatic,
    onDetach,
    enabledFields,
    grade,
    yearsOfService,
    email,
    phone,
    costCenter,
  } = data;

  const ef =
    enabledFields ||
    new Set(["name", "designation", "id", "department", "location"]);

  const show = (key) => ef.has(key);

  const levelColor = LEVEL_COLORS[level] || LEVEL_COLORS[3];

  const cardClass = [
    "emp-card",
    selected ? "selected" : "",
    isHighlighted ? "highlighted" : "",
    isDimmed ? "dimmed" : "",
    isStatic ? "static-card" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`${cardClass} ${
        data.isDropTarget ? "employee-card--drop-target" : ""
      }`}
      style={{ "--level-color": levelColor }}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        style={{
          background: levelColor,
          width: 8,
          height: 8,
          border: "2px solid #ffffff",
          top: -4,
        }}
      />

      {onDetach && (
        <button
          className="nodrag"
          onClick={(e) => {
            e.stopPropagation();
            onDetach(id);
          }}
          title="Send to Parking Lot"
          style={{
            position: "absolute",
            top: -8,
            right: -8,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#ef4444",
            border: "2px solid #fff",
            color: "#fff",
            cursor: "pointer",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            fontSize: 11,
            fontWeight: 700,
            lineHeight: 1,
            boxShadow: "0 2px 6px rgba(239,68,68,0.45)",
            transition: "transform 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          ×
        </button>
      )}

      {isStatic && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.6px",
            padding: "2px 6px",
            borderRadius: 4,
            background: "#eff6ff",
            color: "#1d4ed8",
            border: "1px solid #bfdbfe",
            textTransform: "uppercase",
            zIndex: 1,
          }}
        >
          LOCAL
        </div>
      )}

      <div className="emp-card-header">
        <div
          className="emp-avatar"
          style={{
            background: avatarColor || "#1a3a6b",
            overflow: "hidden",
          }}
        >
          {/* {avatar && avatar.startsWith("data:image") ? (
            <img
              src={avatar}
              alt={name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
          ) : (
            <span>{initials || name?.slice(0, 2).toUpperCase()}</span>
          )} */}
          {avatar ? (
  <img
    src={avatar}
    alt={name}
    onError={(e) => {
      e.currentTarget.style.display = "none";
    }}
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
      borderRadius: "50%",
    }}
  />
) : (
  <span>{initials || name?.slice(0, 2).toUpperCase()}</span>
)}

          <div className="emp-avatar-ring" />
        </div>

        <div className="emp-name-block">
          <div className="emp-name">{name}</div>
          <div className="emp-designation">{designation}</div>

          {show("id") && (
            <div className="emp-id-badge">#{id?.replace("LOCAL-", "L-")}</div>
          )}
        </div>
      </div>

      {(show("department") ||
        show("location") ||
        show("grade") ||
        show("yearsOfService") ||
        show("email") ||
        show("phone") ||
        show("costCenter")) && (
        <>
          <div className="emp-card-divider" />

          <div className="emp-meta">
            {show("department") && (
              <div className="emp-meta-item">
                <Building2 size={11} />
                <span>{department || "—"}</span>
              </div>
            )}

            {show("location") && (
              <div className="emp-meta-item">
                <MapPin size={11} />
                <span>{location || "—"}</span>
              </div>
            )}

            {show("grade") && grade && (
              <div className="emp-meta-item">
                <Layers size={11} />
                <span>Grade: {grade}</span>
              </div>
            )}

            {show("yearsOfService") && yearsOfService != null && (
              <div className="emp-meta-item">
                <Hash size={11} />
                <span>{yearsOfService} yrs</span>
              </div>
            )}

            {show("email") && email && (
              <div className="emp-meta-item">
                <Mail size={11} />
                <span style={{ fontSize: 10 }}>{email}</span>
              </div>
            )}

            {show("phone") && phone && (
              <div className="emp-meta-item">
                <Phone size={11} />
                <span>{phone}</span>
              </div>
            )}

            {show("costCenter") && costCenter && (
              <div className="emp-meta-item">
                <Hash size={11} />
                <span>CC: {costCenter}</span>
              </div>
            )}
          </div>
        </>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        style={{
          background: levelColor,
          width: 8,
          height: 8,
          border: "2px solid #ffffff",
          bottom: -4,
        }}
      />
    </div>
  );
});

EmployeeCard.displayName = "EmployeeCard";

export default EmployeeCard;