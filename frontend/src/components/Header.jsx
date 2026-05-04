/**
 * Header.jsx - with Add Employee modal
 */
import { useState } from "react";
//import { Search, X, Users, GitBranch, RefreshCw, Wifi, WifiOff, UserPlus } from "lucide-react";
import { Search, X, Users, GitBranch, RefreshCw, Wifi, WifiOff, UserPlus, Download } from "lucide-react";
import ltLogo from "../assets/lt-logo.png";

// ─── Add Employee Modal ───────────────────────────────────────────────────────
const AddEmployeeModal = ({ onClose, onAdd, allEmployees = [] }) => {
  const [form, setForm] = useState({
    name: "", designation: "", department: "",
    location: "", managerId: "", jobCode: "",
  });
  const [error, setError] = useState("");

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const handleSubmit = () => {
    if (!form.name.trim())        return setError("Name is required");
    if (!form.designation.trim()) return setError("Designation is required");
    if (!form.managerId.trim())   return setError("Manager is required");

    const newId = "LOCAL-" + Date.now();
    const managerObj = allEmployees.find(e => e.id === form.managerId);

    onAdd({
      id:          newId,
      code:        newId,
      name:        form.name.trim(),
      designation: form.designation.trim(),
      jobTitle:    form.designation.trim(),
      department:  form.department.trim(),
      location:    form.location.trim(),
      managerId:   form.managerId.trim(),
      jobCode:     form.jobCode.trim(),
      level:       (managerObj?.level ?? 0) + 1,
      avatar:      form.name.trim().split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() || "").join(""),
      avatarColor: "#1a3a6b",
      status:      "Active",
      effectiveStatus: "A",
      vacant:      false,
    });
    onClose();
  };

  const inputStyle = {
    width: "100%", padding: "8px 12px", borderRadius: 8, fontSize: 13,
    border: "1px solid #e2e8f0", outline: "none", fontFamily: "var(--font-body)",
    color: "#0f172a", background: "#f8fafc", marginTop: 4,
    transition: "border-color 0.15s",
  };

  const labelStyle = {
    fontSize: 11, fontWeight: 600, color: "#64748b",
    textTransform: "uppercase", letterSpacing: "0.8px",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)",
      zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(4px)",
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#ffffff", borderRadius: 16, width: 440,
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)", overflow: "hidden",
      }}>
        {/* Modal header */}
        <div style={{
          padding: "18px 24px", background: "#1a3a6b",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 15, fontFamily: "var(--font-display)" }}>
              Add New Position
            </div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 2 }}>
              Local only — not saved to SAP SuccessFactors
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8,
            width: 30, height: 30, cursor: "pointer", color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <X size={14} />
          </button>
        </div>

        {/* Modal body */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {error && (
            <div style={{
              padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: 8, fontSize: 12, color: "#dc2626",
            }}>
              ⚠️ {error}
            </div>
          )}

          <div>
            <div style={labelStyle}>Name *</div>
            <input style={inputStyle} placeholder="e.g. Rahul Sharma"
              value={form.name} onChange={e => { set("name", e.target.value); setError(""); }}
              onFocus={e => e.target.style.borderColor = "#3b5bdb"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          <div>
            <div style={labelStyle}>Designation *</div>
            <input style={inputStyle} placeholder="e.g. Senior Engineer"
              value={form.designation} onChange={e => { set("designation", e.target.value); setError(""); }}
              onFocus={e => e.target.style.borderColor = "#3b5bdb"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={labelStyle}>Department</div>
              <input style={inputStyle} placeholder="e.g. IT"
                value={form.department} onChange={e => set("department", e.target.value)}
                onFocus={e => e.target.style.borderColor = "#3b5bdb"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>
            <div>
              <div style={labelStyle}>Location</div>
              <input style={inputStyle} placeholder="e.g. Mumbai"
                value={form.location} onChange={e => set("location", e.target.value)}
                onFocus={e => e.target.style.borderColor = "#3b5bdb"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>
          </div>

          <div>
            <div style={labelStyle}>Reports To (Manager) *</div>
            <select style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
              value={form.managerId}
              onChange={e => { set("managerId", e.target.value); setError(""); }}
              onFocus={e => e.target.style.borderColor = "#3b5bdb"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"}
            >
              <option value="">— Select Manager —</option>
              {allEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.designation || emp.jobTitle || emp.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={labelStyle}>Job Code</div>
            <input style={inputStyle} placeholder="e.g. ENG-SR-001"
              value={form.jobCode} onChange={e => set("jobCode", e.target.value)}
              onFocus={e => e.target.style.borderColor = "#3b5bdb"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>
        </div>

        {/* Modal footer */}
        <div style={{
          padding: "14px 24px", borderTop: "1px solid #f1f5f9",
          display: "flex", justifyContent: "flex-end", gap: 10,
          background: "#fafbff",
        }}>
          <button onClick={onClose} style={{
            padding: "8px 20px", borderRadius: 8, border: "1px solid #e2e8f0",
            background: "#ffffff", color: "#475569", fontSize: 13,
            fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)",
          }}>
            Cancel
          </button>
          <button onClick={handleSubmit} style={{
            padding: "8px 20px", borderRadius: 8, border: "none",
            background: "#1a3a6b", color: "white", fontSize: 13,
            fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)",
          }}>
            Add to Chart
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Header ───────────────────────────────────────────────────────────────────
const Header = ({
  searchQuery, onSearchChange, onSearchClear,
  selectedDept, onDeptChange, departments = [],
  totalEmployees = 0, totalDepts = 0,
  onRefresh, refreshing, isLive,
  onAddEmployee, allEmployees = [],
  onDownload,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <header className="header">
        {/* Logo */}
        <div className="header-brand">
          <img src={ltLogo} alt="Larsen & Toubro" className="header-logo-img" />
        </div>

        {/* Search + Filter */}
        <div className="header-center">
          <div className="search-container">
            <Search className="search-icon" size={15} />
            <input
              type="text" className="search-input"
              placeholder="Search by name, position code, department..."
              value={searchQuery} onChange={e => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={onSearchClear} title="Clear">
                <X size={13} />
              </button>
            )}
          </div>
          <select className="dept-filter" value={selectedDept} onChange={e => onDeptChange(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
          </select>
        </div>

        {/* Right section */}
        <div className="header-right">
          {/* Live/Static badge */}
          {isLive ? (
            <div className="header-stat" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <Wifi size={12} style={{ color: "#16a34a" }} />
              <span style={{ color: "#16a34a", fontWeight: 600, fontSize: 11 }}>Live · SAP SF</span>
            </div>
          ) : (
            <div className="header-stat" style={{ background: "#fefce8", border: "1px solid #fde68a" }}>
              <WifiOff size={12} style={{ color: "#ca8a04" }} />
              <span style={{ color: "#ca8a04", fontWeight: 600, fontSize: 11 }}>Static Mode</span>
            </div>
          )}

          <div className="header-stat"><Users size={13} /><strong>{totalEmployees}</strong><span>Positions</span></div>
          <div className="header-stat"><GitBranch size={13} /><strong>{totalDepts}</strong><span>Depts</span></div>
          

          {/* Download button — ADD THIS BEFORE Add Position button */}
<button
  onClick={onDownload}
  title="Download all positions as Excel"
  style={{
    display: "flex", alignItems: "center", gap: 6,
    padding: "6px 14px", background: "#ffffff",
    color: "#059669", border: "1.5px solid #059669",
    borderRadius: 8, fontSize: 12, fontWeight: 600,
    cursor: "pointer", fontFamily: "var(--font-body)",
    transition: "all 150ms ease", whiteSpace: "nowrap",
  }}
  onMouseEnter={e => {
    e.currentTarget.style.background = "#059669";
    e.currentTarget.style.color = "white";
  }}
  onMouseLeave={e => {
    e.currentTarget.style.background = "white";
    e.currentTarget.style.color = "#059669";
  }}
>
  <Download size={13} />
  Export Excel
</button>

          {/* Add Employee button */}
          <button
            onClick={() => setShowAddModal(true)}
            title="Add new position locally"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 14px", background: "#ffffff",
              color: "#1a3a6b", border: "1.5px solid #1a3a6b",
              borderRadius: 8, fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: "var(--font-body)",
              transition: "all 150ms ease", whiteSpace: "nowrap",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#1a3a6b"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#1a3a6b"; }}
          >
            <UserPlus size={13} />
            Add Position
          </button>

          {/* Refresh button */}
          {onRefresh && (
            <button onClick={onRefresh} disabled={refreshing} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 14px",
              background: refreshing ? "#e0e7ff" : "#1a3a6b",
              color: refreshing ? "#3b5bdb" : "white",
              border: "1px solid", borderColor: refreshing ? "#c7d2fe" : "#1a3a6b",
              borderRadius: 8, fontSize: 12, fontWeight: 600,
              cursor: refreshing ? "not-allowed" : "pointer",
              fontFamily: "var(--font-body)", transition: "all 150ms ease",
              whiteSpace: "nowrap",
            }}>
              <RefreshCw size={13} style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none" }} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          )}
        </div>
      </header>

      {/* Add Employee Modal */}
      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onAdd={onAddEmployee}
          allEmployees={allEmployees}
        />
      )}
    </>
  );
};

export default Header;