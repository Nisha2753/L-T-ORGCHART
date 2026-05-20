import { useState, useEffect, useRef } from "react";
import {
  X,
  Hash,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  User,
  Users,
  Activity,
  Layers,
  DollarSign,
  Clock,
  Tag,
  Globe,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Edit3,
  Check,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { FIELD_OPTIONS } from "../data/dropdownOptions";

const ActionBtn = ({ icon: Icon, onClick, title, bg, white }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      background: bg,
      border: white ? "none" : "1px solid #e2e8f0",
      borderRadius: 6,
      width: 26,
      height: 26,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      flexShrink: 0,
    }}
  >
    <Icon size={12} color={white ? "white" : "#64748b"} />
  </button>
);

const EditPencil = ({ onClick }) => (
  <button
    onClick={onClick}
    title="Edit"
    style={{
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: 3,
      borderRadius: 4,
      color: "#94a3b8",
      display: "flex",
      alignItems: "center",
    }}
  >
    <Edit3 size={11} />
  </button>
);

const DetailRow = ({ icon: Icon, label, value }) => {
  if (!value && value !== 0) return null;

  return (
    <div className="detail-row">
      <div className="detail-label">
        <Icon size={12} />
        {label}
      </div>

      <div className="detail-value">{String(value)}</div>
    </div>
  );
};

const TextEditRow = ({
  icon: Icon,
  label,
  value,
  field,
  onEdit,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");

  useEffect(() => {
    setDraft(value || "");
  }, [value]);

  const save = () => {
    if (!draft.trim()) return;
    onEdit(field, draft.trim());
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value || "");
    setEditing(false);
  };

  return (
    <div className="detail-row">
      <div className="detail-label">
        <Icon size={12} />
        {label}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        {editing ? (
          <>
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") cancel();
              }}
              style={{
                fontSize: 12,
                padding: "5px 8px",
                border: "1.5px solid #3b5bdb",
                borderRadius: 6,
                width: 150,
              }}
            />

            <ActionBtn
              icon={Check}
              bg="#3b5bdb"
              white
              title="Save"
              onClick={save}
            />

            <ActionBtn
              icon={X}
              bg="#f1f5f9"
              title="Cancel"
              onClick={cancel}
            />
          </>
        ) : (
          <>
            <span className="detail-value">{value}</span>
            <EditPencil onClick={() => setEditing(true)} />
          </>
        )}
      </div>
    </div>
  );
};

const DropdownRow = ({
  icon: Icon,
  label,
  value,
  field,
  onEdit,
  options = [],
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");

  const selectRef = useRef(null);

  useEffect(() => {
    setDraft(value || "");
  }, [value]);

  useEffect(() => {
    if (editing && selectRef.current) {
      selectRef.current.focus();
    }
  }, [editing]);

  const save = () => {
    if (!draft) return;
    onEdit(field, draft);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value || "");
    setEditing(false);
  };

  return (
    <div className="detail-row">
      <div className="detail-label">
        <Icon size={12} />
        {label}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        {editing ? (
          <>
            <select
              ref={selectRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              style={{
                fontSize: 12,
                padding: "5px 8px",
                border: "1.5px solid #3b5bdb",
                borderRadius: 6,
                minWidth: 150,
              }}
            >
              <option value="">Select</option>

              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <ActionBtn
              icon={Check}
              bg="#3b5bdb"
              white
              title="Save"
              onClick={save}
            />

            <ActionBtn
              icon={X}
              bg="#f1f5f9"
              title="Cancel"
              onClick={cancel}
            />
          </>
        ) : (
          <>
            <span className="detail-value">{value}</span>
            <EditPencil onClick={() => setEditing(true)} />
          </>
        )}
      </div>
    </div>
  );
};

const Section = ({
  title,
  children,
  defaultOpen = true,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="side-panel-section">
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 0",
        }}
      >
        <span
          style={{
            flex: 1,
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            color: "#94a3b8",
            textAlign: "left",
          }}
        >
          {title}
        </span>

        {open ? (
          <ChevronUp size={13} />
        ) : (
          <ChevronDown size={13} />
        )}
      </button>

      {open && <div>{children}</div>}
    </div>
  );
};

const EmployeeDetailsPanel = ({
  employee,
  allEmployees = [],
  onClose,
  onRefresh,
  onLocalEdit,
  isStatic = false,
  onDeleteStatic,
  localEdits = {},
}) => {
  const isOpen = !!employee;

  if (!employee) {
    return <div className="side-panel" />;
  }

  const manager = allEmployees.find(
    (e) => e.id === employee.managerId
  );

  const directReports = allEmployees.filter(
    (e) => e.managerId === employee.id
  );

  const hasEdits = Object.keys(localEdits).length > 0;

  const handleEdit = (field, value) => {
    onLocalEdit &&
      onLocalEdit(employee.id, field, value);
  };

  const handleResetEdits = () => {
    if (!onLocalEdit) return;

    Object.keys(localEdits).forEach((field) => {
      onLocalEdit(employee.id, field, undefined);
    });
  };

  const opts = (field) => FIELD_OPTIONS[field] || [];

  return (
    // <div className={`side-panel ${isOpen ? "open" : ""}`}>
    //   <div className="side-panel-header">
    //     <div
    //       className="side-panel-avatar"
    //       style={{
    //         background:
    //           employee.avatarColor || "#1a3a6b",
    //       }}
    //     >
    //       {employee.avatar ||
    //         employee.name
    //           ?.split(" ")
    //           .map((w) => w[0])
    //           .join("")
    //           .slice(0, 2)
    //           .toUpperCase()}
    //     </div>
    <div className={`side-panel ${isOpen ? "open" : ""}`}>
  <div className="side-panel-header">
    <div
      className="side-panel-avatar"
      style={{
        background: employee.avatarColor || "#1a3a6b",
        overflow: "hidden",
      }}
    >
      {employee.avatar &&
      employee.avatar.startsWith("data:image") ? (
        <img
          src={employee.avatar}
          alt={employee.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%",
          }}
        />
      ) : (
        <span>
          {employee.initials ||
            employee.name
              ?.split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
        </span>
      )}
    </div>

        <div className="side-panel-name-block">
          <div className="side-panel-name">
            {employee.name}
          </div>

          <div className="side-panel-role">
            {employee.designation ||
              employee.jobTitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 5,
          }}
        >
          {hasEdits && (
            <button
              className="side-panel-close"
              onClick={handleResetEdits}
            >
              <RotateCcw size={13} />
            </button>
          )}

          {onRefresh && (
            <button
              className="side-panel-close"
              onClick={onRefresh}
            >
              <RefreshCw size={13} />
            </button>
          )}

          {isStatic && (
            <button
              className="side-panel-close"
              onClick={() =>
                onDeleteStatic(employee.id)
              }
            >
              <Trash2 size={13} />
            </button>
          )}

          <button
            className="side-panel-close"
            onClick={onClose}
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="side-panel-body">
        <Section title="Position">
          <DetailRow
            icon={Hash}
            label="Position Code"
            value={employee.code || employee.id}
          />

          <TextEditRow
            icon={User}
            label="Name"
            value={employee.name}
            field="name"
            onEdit={handleEdit}
          />

          <DropdownRow
            icon={Briefcase}
            label="Job Title"
            value={
              employee.jobTitle ||
              employee.designation
            }
            field="jobTitle"
            onEdit={handleEdit}
            options={opts("jobTitle")}
          />

          <DropdownRow
            icon={Tag}
            label="Department"
            value={employee.department}
            field="department"
            onEdit={handleEdit}
            options={opts("department")}
          />

          <DetailRow
            icon={MapPin}
            label="Location"
            value={employee.location}
          />
        </Section>

        <Section title="Reporting">
          <DetailRow
            icon={User}
            label="Reports To"
            value={
              manager?.name ||
              "No Manager"
            }
          />

          <DetailRow
            icon={Users}
            label="Direct Reports"
            value={directReports.length}
          />
        </Section>

        <Section title="Additional Info">
          <DetailRow
            icon={Building2}
            label="Company"
            value={employee.company}
          />

          <DetailRow
            icon={DollarSign}
            label="Pay Grade"
            value={employee.payGrade}
          />

          <DetailRow
            icon={Clock}
            label="Standard Hours"
            value={employee.standardHours}
          />

          <DetailRow
            icon={Calendar}
            label="Effective Start"
            value={employee.effectiveStartDate}
          />

          <DetailRow
            icon={AlertCircle}
            label="Criticality"
            value={employee.criticality}
          />
        </Section>
      </div>
    </div>
  );
};

export default EmployeeDetailsPanel;