/**
 * EmployeeCard.jsx
 * Custom React Flow node — represents a single employee in the org chart.
 */
/**
 * EmployeeCard.jsx — with static badge for locally added cards
 */
import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { MapPin, Building2 } from 'lucide-react';

const LEVEL_COLORS = {
  0: '#e67700', 1: '#3b5bdb', 2: '#0891b2', 3: '#059669', 4: '#7c3aed',
};

const EmployeeCard = memo(({ data, selected }) => {
  const {
    id, name, designation, department, location,
    avatar, avatarColor, level = 0,
    isHighlighted, isDimmed, isStatic,
  } = data;

  const levelColor = LEVEL_COLORS[level] || LEVEL_COLORS[3];

  const cardClass = [
    'emp-card',
    selected      ? 'selected'    : '',
    isHighlighted ? 'highlighted' : '',
    isDimmed      ? 'dimmed'      : '',
    isStatic      ? 'static-card' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClass} style={{ '--level-color': levelColor }}>
      <Handle type="target" position={Position.Top} style={{
        background: levelColor, width: 8, height: 8,
        border: '2px solid #ffffff', top: -4,
      }} />

      {/* Static badge */}
      {isStatic && (
        <div style={{
          position: "absolute", top: 8, right: 8,
          fontSize: 9, fontWeight: 700, letterSpacing: "0.6px",
          padding: "2px 6px", borderRadius: 4,
          background: "#eff6ff", color: "#1d4ed8",
          border: "1px solid #bfdbfe", textTransform: "uppercase",
          zIndex: 1,
        }}>
          LOCAL
        </div>
      )}

      <div className="emp-card-header">
        <div className="emp-avatar" style={{ background: avatarColor || '#1a3a6b' }}>
          {avatar || name?.slice(0, 2).toUpperCase()}
          <div className="emp-avatar-ring" />
        </div>
        <div className="emp-name-block">
          <div className="emp-name">{name}</div>
          <div className="emp-designation">{designation}</div>
          <div className="emp-id-badge">#{id?.replace("LOCAL-", "L-")}</div>
        </div>
      </div>

      <div className="emp-card-divider" />

      <div className="emp-meta">
        <div className="emp-meta-item">
          <Building2 size={11} />
          <span>{department || "—"}</span>
        </div>
        <div className="emp-meta-item">
          <MapPin size={11} />
          <span>{location || "—"}</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} style={{
        background: levelColor, width: 8, height: 8,
        border: '2px solid #ffffff', bottom: -4,
      }} />
    </div>
  );
});

EmployeeCard.displayName = 'EmployeeCard';
export default EmployeeCard;