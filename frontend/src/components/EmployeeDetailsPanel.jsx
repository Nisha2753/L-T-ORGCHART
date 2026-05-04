// /**
//  * EmployeeDetailsPanel.jsx
//  * Right-side panel showing full employee details when a card is selected.
//  */
// import {
//   X, Hash, Mail, Phone, Building2, Briefcase,
//   MapPin, Calendar, User, Users, Activity, Link2
// } from 'lucide-react';

// const DetailRow = ({ icon: Icon, label, value, valueClass }) => (
//   <div className="detail-row">
//     <div className="detail-label">
//       <Icon size={12} />
//       {label}
//     </div>
//     <div className={`detail-value ${valueClass || ''}`}>{value || '—'}</div>
//   </div>
// );

// const EmployeeDetailsPanel = ({ employee, allEmployees = [], onClose }) => {
//   const isOpen = !!employee;

//   if (!employee) {
//     return <div className={`side-panel ${isOpen ? 'open' : ''}`} />;
//   }

//   // Resolve manager name
//   const manager = allEmployees.find(e => e.id === employee.managerId);
//   const directReports = allEmployees.filter(e => e.managerId === employee.id);

//   const formatDate = (dateStr) => {
//     if (!dateStr) return '—';
//     return new Date(dateStr).toLocaleDateString('en-IN', {
//       day: '2-digit', month: 'short', year: 'numeric'
//     });
//   };

//   const LEVEL_LABELS = {
//     0: 'C-Suite',
//     1: 'Vice President',
//     2: 'Manager',
//     3: 'Executive',
//   };

//   return (
//     <div className={`side-panel ${isOpen ? 'open' : ''}`}>
//       {/* Panel Header */}
//       <div className="side-panel-header">
//         <div
//           className="side-panel-avatar"
//           style={{ background: employee.avatarColor || '#1a1a2e' }}
//         >
//           {employee.avatar || employee.name?.slice(0, 2).toUpperCase()}
//         </div>

//         <div className="side-panel-name-block">
//           <div className="side-panel-name">{employee.name}</div>
//           <div className="side-panel-role">
//             {employee.designation} · {employee.department}
//           </div>
//         </div>

//         <button className="side-panel-close" onClick={onClose} title="Close">
//           <X size={14} />
//         </button>
//       </div>

//       {/* Panel Body */}
//       <div className="side-panel-body">

//         {/* Organisation Section */}
//         <div className="side-panel-section">
//           <div className="side-panel-section-title">Organisation</div>
//           <DetailRow icon={Hash} label="Employee ID" value={employee.id} />
//           <DetailRow icon={Building2} label="Department" value={employee.department} />
//           <DetailRow icon={MapPin} label="Location" value={employee.location} />
//           <DetailRow
//             icon={Briefcase}
//             label="Level"
//             value={LEVEL_LABELS[employee.level] || `Level ${employee.level}`}
//           />
//           <div className="detail-row">
//             <div className="detail-label">
//               <Activity size={12} />
//               Status
//             </div>
//             <div className="detail-value">
//               <span className={`status-badge ${(employee.status || 'Active').toLowerCase()}`}>
//                 {employee.status || 'Active'}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Reporting Section */}
//         <div className="side-panel-section">
//           <div className="side-panel-section-title">Reporting</div>
//           <DetailRow
//             icon={User}
//             label="Reports To"
//             value={manager ? `${manager.name}` : 'No Manager (Root)'}
//           />
//           <DetailRow
//             icon={Users}
//             label="Direct Reports"
//             value={directReports.length > 0
//               ? directReports.map(r => r.name).join(', ')
//               : 'None'}
//           />
//           <DetailRow
//             icon={Link2}
//             label="Team Size"
//             value={`${directReports.length} direct report${directReports.length !== 1 ? 's' : ''}`}
//           />
//         </div>

//         {/* Contact Section */}
//         <div className="side-panel-section">
//           <div className="side-panel-section-title">Contact</div>
//           <DetailRow icon={Mail} label="Email" value={employee.email} />
//           <DetailRow icon={Phone} label="Phone" value={employee.phone} />
//         </div>

//         {/* Tenure Section */}
//         <div className="side-panel-section">
//           <div className="side-panel-section-title">Tenure</div>
//           <DetailRow
//             icon={Calendar}
//             label="Joining Date"
//             value={formatDate(employee.joiningDate)}
//           />
//           <DetailRow
//             icon={Activity}
//             label="Years of Service"
//             value={
//               employee.joiningDate
//                 ? `${Math.floor((Date.now() - new Date(employee.joiningDate)) / (1000 * 60 * 60 * 24 * 365))} years`
//                 : '—'
//             }
//           />
//         </div>

//       </div>
//     </div>
//   );
// };

// export default EmployeeDetailsPanel;




/**
 * EmployeeDetailsPanel.jsx
 * Shows full position details from SAP SuccessFactors.
 */
/**
 * EmployeeDetailsPanel.jsx
 * Side panel with editable fields (local only) + delete for static employees.
 */
// import { useState, useEffect } from "react";
// import {
//   X, Hash, Building2, Briefcase, MapPin, Calendar,
//   User, Users, Activity, Layers, DollarSign, Clock,
//   Tag, Globe, AlertCircle, RefreshCw, ChevronDown,
//   ChevronUp, Edit3, Check, RotateCcw, Trash2
// } from "lucide-react";

// // ─── Editable field row ───────────────────────────────────────────────────────
// const EditableRow = ({ icon: Icon, label, value, field, onEdit, editable = false }) => {
//   const [editing, setEditing] = useState(false);
//   const [draft, setDraft]     = useState(value || "");

//   useEffect(() => {
//     setDraft(value || "");
//   }, [value]);

//   const handleSave = () => {
//     onEdit(field, draft);
//     setEditing(false);
//   };

//   const handleCancel = () => {
//     setDraft(value || "");
//     setEditing(false);
//   };

//   if (!value && value !== 0) return null;

//   return (
//     <div className="detail-row" style={{ alignItems: editing ? "flex-start" : "center" }}>
//       <div className="detail-label">
//         <Icon size={12} />
//         {label}
//       </div>
//       <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", flex: 1 }}>
//         {editing ? (
//           <>
//             <input
//               autoFocus
//               value={draft}
//               onChange={e => setDraft(e.target.value)}
//               onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
//               style={{
//                 fontSize: 12, padding: "4px 8px", border: "1.5px solid #3b5bdb",
//                 borderRadius: 6, outline: "none", width: 140,
//                 fontFamily: "var(--font-body)", color: "#0f172a",
//                 background: "#f8faff",
//               }}
//             />
//             <button onClick={handleSave} title="Save"
//               style={{ background: "#3b5bdb", border: "none", borderRadius: 5,
//                 width: 24, height: 24, display: "flex", alignItems: "center",
//                 justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
//               <Check size={12} color="white" />
//             </button>
//             <button onClick={handleCancel} title="Cancel"
//               style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 5,
//                 width: 24, height: 24, display: "flex", alignItems: "center",
//                 justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
//               <X size={12} color="#64748b" />
//             </button>
//           </>
//         ) : (
//           <>
//             <span className="detail-value">{value}</span>
//             {editable && (
//               <button onClick={() => setEditing(true)} title="Edit"
//                 style={{ background: "none", border: "none", cursor: "pointer",
//                   padding: 3, borderRadius: 4, color: "#94a3b8",
//                   display: "flex", alignItems: "center",
//                   transition: "color 0.15s", flexShrink: 0 }}
//                 onMouseEnter={e => e.currentTarget.style.color = "#3b5bdb"}
//                 onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
//               >
//                 <Edit3 size={11} />
//               </button>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// // ─── Read-only row ────────────────────────────────────────────────────────────
// const DetailRow = ({ icon: Icon, label, value }) => {
//   if (!value && value !== 0) return null;
//   return (
//     <div className="detail-row">
//       <div className="detail-label"><Icon size={12} />{label}</div>
//       <div className="detail-value">{String(value)}</div>
//     </div>
//   );
// };

// // ─── Collapsible section ──────────────────────────────────────────────────────
// const Section = ({ title, children, defaultOpen = true }) => {
//   const [open, setOpen] = useState(defaultOpen);
//   const hasContent = Array.isArray(children) ? children.some(Boolean) : !!children;
//   if (!hasContent) return null;

//   return (
//     <div className="side-panel-section">
//       <button onClick={() => setOpen(o => !o)} style={{
//         width: "100%", background: "none", border: "none", cursor: "pointer",
//         textAlign: "left", display: "flex", alignItems: "center", gap: 8,
//         padding: "4px 0", font: "inherit", color: "inherit",
//       }}>
//         <span style={{
//           flex: 1, letterSpacing: "1.2px", fontSize: 10,
//           fontWeight: 700, textTransform: "uppercase", color: "#94a3b8",
//         }}>
//           {title}
//         </span>
//         <span style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
//         {open
//           ? <ChevronUp size={13} style={{ color: "#94a3b8", flexShrink: 0 }} />
//           : <ChevronDown size={13} style={{ color: "#94a3b8", flexShrink: 0 }} />
//         }
//       </button>
//       {open && <div style={{ marginTop: 6 }}>{children}</div>}
//     </div>
//   );
// };

// // ─── Badges ───────────────────────────────────────────────────────────────────
// const StatusBadge = ({ status, effectiveStatus }) => {
//   const label    = status || effectiveStatus || "—";
//   const isActive = label.toLowerCase() === "active" || effectiveStatus === "A";
//   return (
//     <span className={`status-badge ${isActive ? "active" : ""}`}
//       style={!isActive ? { background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" } : {}}>
//       {label}
//     </span>
//   );
// };

// const VacancyBadge = ({ vacant }) => (
//   <span style={{
//     padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
//     background: vacant ? "#fef9c3" : "#dcfce7",
//     color:      vacant ? "#854d0e" : "#15803d",
//     border:     `1px solid ${vacant ? "#fde68a" : "#bbf7d0"}`,
//   }}>
//     {vacant ? "Vacant" : "Filled"}
//   </span>
// );

// // ─── Main component ───────────────────────────────────────────────────────────
// const EmployeeDetailsPanel = ({
//   employee,
//   allEmployees = [],
//   onClose,
//   onRefresh,
//   onLocalEdit,
//   isStatic = false,
//   onDeleteStatic,
//   localEdits = {},
// }) => {
//   const isOpen = !!employee;
//   if (!employee) return <div className="side-panel" />;

//   const hasEdits      = Object.keys(localEdits).length > 0;
//   const manager       = allEmployees.find(e => e.id === employee.managerId);
//   const directReports = allEmployees.filter(e => e.managerId === employee.id);

//   const LEVEL_LABELS = {
//     0: "C-Suite", 1: "Vice President", 2: "Manager",
//     3: "Executive", 4: "Associate", 5: "Staff",
//   };

//   const formatDate = (val) => {
//     if (!val) return null;
//     const epoch = typeof val === "string" ? val.match(/\/Date\((\d+)\)\//)?.[1] : null;
//     const d = epoch ? new Date(parseInt(epoch)) : new Date(val);
//     if (isNaN(d.getTime())) return String(val);
//     return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
//   };

//   const initials = employee.avatar
//     || (employee.name || "??").split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || "").join("");

//   const handleEdit = (field, value) => {
//     onLocalEdit && onLocalEdit(employee.id, field, value);
//   };

//   // const handleResetEdits = () => {
//   //   onLocalEdit && Object.keys(localEdits).forEach(field => {
//   //     onLocalEdit(employee.id, field, undefined);
//   //   });
//   // };


//   const handleResetEdits = () => {
//   if (!onLocalEdit) return;
//   // Pass each field as undefined — App.jsx handleLocalEdit will clean them up
//   Object.keys(localEdits).forEach(field => {
//     onLocalEdit(employee.id, field, undefined);
//   });
// };
//   return (
//     <div className={`side-panel ${isOpen ? "open" : ""}`}>

//       {/* ── Header ── */}
//       <div className="side-panel-header">
//         <div className="side-panel-avatar" style={{ background: employee.avatarColor || "#1a3a6b" }}>
//           {initials}
//         </div>

//         <div className="side-panel-name-block">
//           <div className="side-panel-name">{employee.name}</div>
//           <div className="side-panel-role">
//             {employee.designation || employee.jobTitle || "—"}
//             {employee.department ? ` · ${employee.department}` : ""}
//           </div>
//           <div style={{ marginTop: 7, display: "flex", gap: 6, flexWrap: "wrap" }}>
//             <StatusBadge status={employee.status} effectiveStatus={employee.effectiveStatus} />
//             {employee.vacant !== "" && employee.vacant !== undefined && (
//               <VacancyBadge vacant={employee.vacant} />
//             )}
//             {isStatic && (
//               <span style={{
//                 padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700,
//                 background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe",
//                 letterSpacing: "0.5px",
//               }}>
//                 LOCAL
//               </span>
//             )}
//             {hasEdits && (
//               <span style={{
//                 padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700,
//                 background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa",
//                 letterSpacing: "0.5px",
//               }}>
//                 EDITED
//               </span>
//             )}
//           </div>
//         </div>

//         {/* Action buttons */}
//         <div style={{ display: "flex", gap: 5, flexShrink: 0, alignSelf: "flex-start" }}>
//           {hasEdits && (
//             <button className="side-panel-close" onClick={handleResetEdits}
//               title="Reset local edits" style={{ color: "#f97316" }}>
//               <RotateCcw size={13} />
//             </button>
//           )}
//           {onRefresh && !isStatic && (
//             <button className="side-panel-close" onClick={onRefresh}
//               title="Re-fetch from SAP SuccessFactors" style={{ color: "#3b5bdb" }}>
//               <RefreshCw size={13} />
//             </button>
//           )}
//           {isStatic && (
//             <button className="side-panel-close" onClick={() => onDeleteStatic(employee.id)}
//               title="Delete this local card"
//               style={{ color: "#ef4444" }}
//               onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.borderColor = "#fca5a5"; }}
//               onMouseLeave={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
//             >
//               <Trash2 size={13} />
//             </button>
//           )}
//           <button className="side-panel-close" onClick={onClose} title="Close">
//             <X size={14} />
//           </button>
//         </div>
//       </div>

//       {/* ── Edit notice ── */}
//       {!isStatic && (
//         <div style={{
//           padding: "8px 16px", background: "#f0f9ff",
//           borderBottom: "1px solid #e0f2fe",
//           display: "flex", alignItems: "center", gap: 8,
//         }}>
//           <Edit3 size={12} color="#0284c7" />
//           <span style={{ fontSize: 11, color: "#0369a1" }}>
//             Click <strong>✎</strong> next to any field to edit locally. Changes are not saved to SAP.
//           </span>
//         </div>
//       )}

//       {/* ── Body ── */}
//       <div className="side-panel-body">

//         {/* Position — editable fields */}
//         {/* <Section title="Position" defaultOpen={true}>
//           <DetailRow    icon={Hash}      label="Position Code"   value={employee.code || employee.id} />
//           <EditableRow  icon={Briefcase} label="Job Title"       value={employee.jobTitle || employee.designation}
//             field="jobTitle" onEdit={handleEdit} editable={true} />
//           <EditableRow  icon={Tag}       label="Job Code"        value={employee.jobCode}
//             field="jobCode" onEdit={handleEdit} editable={true} />
//           <EditableRow  icon={Layers}    label="Job Level"       value={employee.jobLevel}
//             field="jobLevel" onEdit={handleEdit} editable={true} />
//           <DetailRow    icon={Activity}  label="Hierarchy Level" value={LEVEL_LABELS[employee.level] ?? `Level ${employee.level}`} />
//           <DetailRow    icon={User}      label="Incumbent"       value={employee.incumbent} />
//         </Section> */}

//         <Section title="Position" defaultOpen={true}>
//   <DetailRow    icon={Hash}      label="Position Code"   value={employee.code || employee.id} />
//   <EditableRow  icon={User}      label="Name"            value={employee.name}
//     field="name" onEdit={handleEdit} editable={true} />
//   <EditableRow  icon={Briefcase} label="Job Title"       value={employee.jobTitle || employee.designation}
//     field="jobTitle" onEdit={handleEdit} editable={true} />
//   <EditableRow  icon={Tag}       label="Job Code"        value={employee.jobCode}
//     field="jobCode" onEdit={handleEdit} editable={true} />
//   <EditableRow  icon={Layers}    label="Job Level"       value={employee.jobLevel}
//     field="jobLevel" onEdit={handleEdit} editable={true} />
//   <DetailRow    icon={Activity}  label="Hierarchy Level" value={LEVEL_LABELS[employee.level] ?? `Level ${employee.level}`} />
//   <DetailRow    icon={User}      label="Incumbent"       value={employee.incumbent} />
// </Section>

//         {/* Organisation — editable fields */}
//         <Section title="Organisation" defaultOpen={true}>
//           <EditableRow  icon={Building2} label="Department"    value={employee.department}
//             field="department" onEdit={handleEdit} editable={true} />
//           <EditableRow  icon={Globe}     label="Business Unit" value={employee.businessUnit}
//             field="businessUnit" onEdit={handleEdit} editable={true} />
//           <EditableRow  icon={Layers}    label="Division"      value={employee.division}
//             field="division" onEdit={handleEdit} editable={true} />
//           <DetailRow    icon={Building2} label="Company"       value={employee.company} />
//           <EditableRow  icon={MapPin}    label="Location"      value={employee.location}
//             field="location" onEdit={handleEdit} editable={true} />
//           <DetailRow    icon={Hash}      label="Cost Center"   value={employee.costCenter} />
//         </Section>

//         {/* Reporting — read only */}
//         <Section title="Reporting" defaultOpen={true}>
//           <DetailRow icon={User} label="Reports To"
//             value={manager?.name || (employee.managerId ? `Code: ${employee.managerId}` : "Root — No Manager")} />
//           {directReports.length > 0 && (
//             <div className="detail-row">
//               <div className="detail-label"><Users size={12} />Direct Reports</div>
//               <div className="detail-value" style={{ maxWidth: 180 }}>
//                 <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end" }}>
//                   {directReports.map(r => (
//                     <span key={r.id} style={{
//                       fontSize: 11, background: "#f0f4ff", color: "#3b5bdb",
//                       padding: "1px 7px", borderRadius: 99,
//                       border: "1px solid #c7d2fe", whiteSpace: "nowrap",
//                     }}>
//                       {r.name}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}
//           <DetailRow icon={Users} label="Team Size"
//             value={`${directReports.length} direct report${directReports.length !== 1 ? "s" : ""}`} />
//         </Section>

//         {/* Compensation — editable */}
//         <Section title="Compensation & Grade" defaultOpen={false}>
//           <EditableRow icon={DollarSign} label="Pay Grade"      value={employee.payGrade}
//             field="payGrade" onEdit={handleEdit} editable={true} />
//           <EditableRow icon={Briefcase}  label="Employee Class" value={employee.employeeClass}
//             field="employeeClass" onEdit={handleEdit} editable={true} />
//           <DetailRow   icon={Briefcase}  label="Employment Type" value={employee.employmentType} />
//           <DetailRow   icon={Briefcase}  label="Regular / Temp"  value={employee.regularTemporary} />
//           <DetailRow   icon={Clock}      label="Standard Hours"  value={employee.standardHours} />
//           <DetailRow   icon={Hash}       label="Target FTE"      value={employee.targetFTE} />
//         </Section>

//         {/* Effective Period — read only */}
//         <Section title="Effective Period" defaultOpen={false}>
//           <DetailRow icon={Calendar} label="Start Date"  value={formatDate(employee.effectiveStartDate)} />
//           <DetailRow icon={Calendar} label="End Date"    value={formatDate(employee.effectiveEndDate)} />
//           <DetailRow icon={Calendar} label="Created"     value={formatDate(employee.createdDateTime)} />
//           <DetailRow icon={User}     label="Created By"  value={employee.createdBy} />
//           <DetailRow icon={Calendar} label="Modified"    value={formatDate(employee.lastModifiedDateTime)} />
//           <DetailRow icon={User}     label="Modified By" value={employee.lastModifiedBy} />
//         </Section>

//         {/* Criticality */}
//         <Section title="Criticality" defaultOpen={false}>
//           <DetailRow icon={AlertCircle} label="Criticality"          value={employee.criticality} />
//           <DetailRow icon={AlertCircle} label="Position Criticality" value={employee.positionCriticality} />
//         </Section>

//       </div>
//     </div>
//   );
// };

// export default EmployeeDetailsPanel;
/**
 * EmployeeDetailsPanel.jsx
 * Side panel with editable fields.
 * - Name field: free text input
 * - All other editable fields: controlled dropdowns
 */
import { useState, useEffect, useRef } from "react";
import {
  X, Hash, Building2, Briefcase, MapPin, Calendar,
  User, Users, Activity, Layers, DollarSign, Clock,
  Tag, Globe, AlertCircle, RefreshCw, ChevronDown,
  ChevronUp, Edit3, Check, RotateCcw, Trash2
} from "lucide-react";
import { FIELD_OPTIONS } from "../data/dropdownOptions";

// ─── Text input row (Name field only) ────────────────────────────────────────
const TextEditRow = ({ icon: Icon, label, value, field, onEdit }) => {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(value || "");

  useEffect(() => { setDraft(value || ""); }, [value]);

  const handleSave = () => {
    if (!draft.trim()) return;
    onEdit(field, draft.trim());
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(value || "");
    setEditing(false);
  };

  if (!value && value !== 0) return null;

  return (
    <div className="detail-row" style={{ alignItems: editing ? "flex-start" : "center" }}>
      <div className="detail-label"><Icon size={12} />{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", flex: 1 }}>
        {editing ? (
          <>
            <input
              autoFocus
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter")  handleSave();
                if (e.key === "Escape") handleCancel();
              }}
              style={{
                fontSize: 12, padding: "5px 9px",
                border: "1.5px solid #3b5bdb", borderRadius: 7,
                outline: "none", width: 150,
                fontFamily: "var(--font-body)", color: "#0f172a",
                background: "#f8faff",
              }}
            />
            <ActionBtn icon={Check} color="#3b5bdb" bg="#3b5bdb" onClick={handleSave} title="Save" white />
            <ActionBtn icon={X}     color="#64748b" bg="#f1f5f9" onClick={handleCancel} title="Cancel" />
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

// ─── Dropdown row (all other editable fields) ─────────────────────────────────
const DropdownRow = ({ icon: Icon, label, value, field, onEdit, options = [] }) => {
  const [editing,  setEditing]  = useState(false);
  const [draft,    setDraft]    = useState(value || "");
  const [touched,  setTouched]  = useState(false);
  const selectRef = useRef(null);

  useEffect(() => { setDraft(value || ""); }, [value]);

  // Auto-focus select when editing opens
  useEffect(() => {
    if (editing && selectRef.current) selectRef.current.focus();
  }, [editing]);

  const handleSave = () => {
    if (!draft) { setTouched(true); return; }
    onEdit(field, draft);
    setEditing(false);
    setTouched(false);
  };

  const handleCancel = () => {
    setDraft(value || "");
    setEditing(false);
    setTouched(false);
  };

  // Merge current value into options if not already present
  const allOptions = value && !options.includes(value)
    ? [value, ...options]
    : options;

  if (!value && value !== 0) return null;

  return (
    <div className="detail-row" style={{ alignItems: editing ? "flex-start" : "center" }}>
      <div className="detail-label"><Icon size={12} />{label}</div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flex: 1, gap: 3 }}>
        {editing ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {/* Dropdown select */}
              <div style={{ position: "relative" }}>
                <select
                  ref={selectRef}
                  value={draft}
                  onChange={e => { setDraft(e.target.value); setTouched(false); }}
                  style={{
                    fontSize: 12, padding: "5px 28px 5px 9px",
                    border: `1.5px solid ${touched && !draft ? "#ef4444" : "#3b5bdb"}`,
                    borderRadius: 7, outline: "none",
                    fontFamily: "var(--font-body)", color: "#0f172a",
                    background: "#f8faff", cursor: "pointer",
                    appearance: "none", minWidth: 140,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%233b5bdb' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 8px center",
                  }}
                >
                  <option value="" disabled>
                    — Select {label} —
                  </option>
                  {allOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <ActionBtn icon={Check} color="#3b5bdb" bg="#3b5bdb" onClick={handleSave} title="Save" white />
              <ActionBtn icon={X}     color="#64748b" bg="#f1f5f9" onClick={handleCancel} title="Cancel" />
            </div>
            {/* Validation message */}
            {touched && !draft && (
              <span style={{ fontSize: 10.5, color: "#ef4444" }}>
                ⚠ Please select a value
              </span>
            )}
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="detail-value">{value}</span>
            <EditPencil onClick={() => setEditing(true)} />
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Shared small helpers ─────────────────────────────────────────────────────
const EditPencil = ({ onClick }) => (
  <button
    onClick={onClick} title="Edit"
    style={{
      background: "none", border: "none", cursor: "pointer",
      padding: 3, borderRadius: 4, color: "#94a3b8",
      display: "flex", alignItems: "center", transition: "color 0.15s",
      flexShrink: 0,
    }}
    onMouseEnter={e => e.currentTarget.style.color = "#3b5bdb"}
    onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
  >
    <Edit3 size={11} />
  </button>
);

const ActionBtn = ({ icon: Icon, onClick, title, bg, white }) => (
  <button
    onClick={onClick} title={title}
    style={{
      background: bg, border: white ? "none" : "1px solid #e2e8f0",
      borderRadius: 6, width: 26, height: 26,
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", flexShrink: 0, transition: "opacity 0.15s",
    }}
    onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
  >
    <Icon size={12} color={white ? "white" : "#64748b"} />
  </button>
);

// ─── Read-only row ────────────────────────────────────────────────────────────
const DetailRow = ({ icon: Icon, label, value }) => {
  if (!value && value !== 0) return null;
  return (
    <div className="detail-row">
      <div className="detail-label"><Icon size={12} />{label}</div>
      <div className="detail-value">{String(value)}</div>
    </div>
  );
};

// ─── Collapsible section ──────────────────────────────────────────────────────
const Section = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  const hasContent = Array.isArray(children) ? children.some(Boolean) : !!children;
  if (!hasContent) return null;

  return (
    <div className="side-panel-section">
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", background: "none", border: "none",
          cursor: "pointer", textAlign: "left",
          display: "flex", alignItems: "center", gap: 8,
          padding: "4px 0", font: "inherit", color: "inherit",
        }}
      >
        <span style={{
          flex: 1, letterSpacing: "1.2px", fontSize: 10,
          fontWeight: 700, textTransform: "uppercase", color: "#94a3b8",
        }}>
          {title}
        </span>
        <span style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
        {open
          ? <ChevronUp   size={13} style={{ color: "#94a3b8", flexShrink: 0 }} />
          : <ChevronDown size={13} style={{ color: "#94a3b8", flexShrink: 0 }} />
        }
      </button>
      {open && <div style={{ marginTop: 6 }}>{children}</div>}
    </div>
  );
};

// ─── Badges ───────────────────────────────────────────────────────────────────
const StatusBadge = ({ status, effectiveStatus }) => {
  const label    = status || effectiveStatus || "—";
  const isActive = label.toLowerCase() === "active" || effectiveStatus === "A";
  return (
    <span
      className={`status-badge ${isActive ? "active" : ""}`}
      style={!isActive ? { background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" } : {}}
    >
      {label}
    </span>
  );
};

const VacancyBadge = ({ vacant }) => (
  <span style={{
    padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
    background: vacant ? "#fef9c3" : "#dcfce7",
    color:      vacant ? "#854d0e" : "#15803d",
    border:     `1px solid ${vacant ? "#fde68a" : "#bbf7d0"}`,
  }}>
    {vacant ? "Vacant" : "Filled"}
  </span>
);

// ─── Main component ───────────────────────────────────────────────────────────
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
  const isOpen    = !!employee;
  if (!employee) return <div className="side-panel" />;

  const hasEdits      = Object.keys(localEdits).length > 0;
  const manager       = allEmployees.find(e => e.id === employee.managerId);
  const directReports = allEmployees.filter(e => e.managerId === employee.id);

  const LEVEL_LABELS = {
    0: "C-Suite", 1: "Vice President", 2: "Manager",
    3: "Executive", 4: "Associate",   5: "Staff",
  };

  const formatDate = (val) => {
    if (!val) return null;
    const epoch = typeof val === "string" ? val.match(/\/Date\((\d+)\)\//)?.[1] : null;
    const d = epoch ? new Date(parseInt(epoch)) : new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const initials = employee.avatar
    || (employee.name || "??").split(/\s+/).slice(0, 2)
        .map(w => w[0]?.toUpperCase() || "").join("");

  const handleEdit = (field, value) => {
    onLocalEdit && onLocalEdit(employee.id, field, value);
  };

  const handleResetEdits = () => {
    if (!onLocalEdit) return;
    Object.keys(localEdits).forEach(field =>
      onLocalEdit(employee.id, field, undefined)
    );
  };

  // Helper — get options for a field
  const opts = (field) => FIELD_OPTIONS[field] || [];

  return (
    <div className={`side-panel ${isOpen ? "open" : ""}`}>

      {/* ── Panel Header ───────────────────────────────────────────────────── */}
      <div className="side-panel-header">
        <div
          className="side-panel-avatar"
          style={{ background: employee.avatarColor || "#1a3a6b" }}
        >
          {initials}
        </div>

        <div className="side-panel-name-block">
          <div className="side-panel-name">{employee.name}</div>
          <div className="side-panel-role">
            {employee.designation || employee.jobTitle || "—"}
            {employee.department ? ` · ${employee.department}` : ""}
          </div>
          <div style={{ marginTop: 7, display: "flex", gap: 6, flexWrap: "wrap" }}>
            <StatusBadge status={employee.status} effectiveStatus={employee.effectiveStatus} />
            {employee.vacant !== "" && employee.vacant !== undefined && (
              <VacancyBadge vacant={employee.vacant} />
            )}
            {isStatic && (
              <span style={{
                padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700,
                background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe",
              }}>
                LOCAL
              </span>
            )}
            {hasEdits && (
              <span style={{
                padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700,
                background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa",
              }}>
                EDITED
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 5, flexShrink: 0, alignSelf: "flex-start" }}>
          {hasEdits && (
            <button className="side-panel-close" onClick={handleResetEdits}
              title="Reset all local edits" style={{ color: "#f97316" }}>
              <RotateCcw size={13} />
            </button>
          )}
          {onRefresh && !isStatic && (
            <button className="side-panel-close" onClick={onRefresh}
              title="Re-fetch from SAP SuccessFactors" style={{ color: "#3b5bdb" }}>
              <RefreshCw size={13} />
            </button>
          )}
          {isStatic && (
            <button
              className="side-panel-close"
              onClick={() => onDeleteStatic(employee.id)}
              title="Delete this local card"
              style={{ color: "#ef4444" }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#fee2e2";
                e.currentTarget.style.borderColor = "#fca5a5";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "#f1f5f9";
                e.currentTarget.style.borderColor = "#e2e8f0";
              }}
            >
              <Trash2 size={13} />
            </button>
          )}
          <button className="side-panel-close" onClick={onClose} title="Close">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ── Edit notice ────────────────────────────────────────────────────── */}
      {!isStatic && (
        <div style={{
          padding: "8px 16px", background: "#f0f9ff",
          borderBottom: "1px solid #e0f2fe",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <Edit3 size={12} color="#0284c7" />
          <span style={{ fontSize: 11, color: "#0369a1" }}>
            Click <strong>✎</strong> next to any field to edit locally.{" "}
            <span style={{ color: "#94a3b8" }}>Changes are not saved to SAP.</span>
          </span>
        </div>
      )}

      {/* ── Panel Body ─────────────────────────────────────────────────────── */}
      <div className="side-panel-body">

        {/* POSITION */}
        <Section title="Position" defaultOpen={true}>
          <DetailRow   icon={Hash}      label="Position Code"   value={employee.code || employee.id} />

          {/* Name — free text input */}
          <TextEditRow icon={User}      label="Name"            value={employee.name}
            field="name" onEdit={handleEdit} />

          {/* Job Title — dropdown */}
          <DropdownRow icon={Briefcase} label="Job Title"
            value={employee.jobTitle || employee.designation}
            field="jobTitle" onEdit={handleEdit}
            options={opts("jobTitle")} />

          {/* Job Code — dropdown */}
          <DropdownRow icon={Tag}       label="Job Code"
            value={employee.jobCode}
            field="jobCode" onEdit={handleEdit}
            options={opts("jobCode")} />

          {/* Job Level — dropdown */}
          <DropdownRow icon={Layers}    label="Job Level"
            value={employee.jobLevel}
            field="jobLevel" onEdit={handleEdit}
            options={opts("jobLevel")} />

          <DetailRow   icon={Activity}  label="Hierarchy Level"
            value={LEVEL_LABELS[employee.level] ?? `Level ${employee.level}`} />
          <DetailRow   icon={User}      label="Incumbent"       value={employee.incumbent} />
        </Section>

        {/* ORGANISATION */}
        <Section title="Organisation" defaultOpen={true}>

          {/* Department — dropdown */}
          <DropdownRow icon={Building2} label="Department"
            value={employee.department}
            field="department" onEdit={handleEdit}
            options={opts("department")} />

          {/* Business Unit — dropdown */}
          <DropdownRow icon={Globe}     label="Business Unit"
            value={employee.businessUnit}
            field="businessUnit" onEdit={handleEdit}
            options={opts("businessUnit")} />

          {/* Division — dropdown */}
          <DropdownRow icon={Layers}    label="Division"
            value={employee.division}
            field="division" onEdit={handleEdit}
            options={opts("division")} />

          {/* Company — dropdown */}
          <DropdownRow icon={Building2} label="Company"
            value={employee.company}
            field="company" onEdit={handleEdit}
            options={opts("company")} />

          <DetailRow   icon={MapPin}    label="Location"        value={employee.location} />
          <DetailRow   icon={Hash}      label="Cost Center"     value={employee.costCenter} />
        </Section>

        {/* REPORTING — read only */}
        <Section title="Reporting" defaultOpen={true}>
          <DetailRow icon={User} label="Reports To"
            value={
              manager?.name ||
              (employee.managerId ? `Code: ${employee.managerId}` : "Root — No Manager")
            }
          />
          {directReports.length > 0 && (
            <div className="detail-row">
              <div className="detail-label"><Users size={12} />Direct Reports</div>
              <div className="detail-value" style={{ maxWidth: 180 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end" }}>
                  {directReports.map(r => (
                    <span key={r.id} style={{
                      fontSize: 11, background: "#f0f4ff", color: "#3b5bdb",
                      padding: "1px 7px", borderRadius: 99,
                      border: "1px solid #c7d2fe", whiteSpace: "nowrap",
                    }}>
                      {r.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DetailRow icon={Users} label="Team Size"
            value={`${directReports.length} direct report${directReports.length !== 1 ? "s" : ""}`}
          />
        </Section>

        {/* COMPENSATION — dropdown for payGrade & employeeClass */}
        <Section title="Compensation & Grade" defaultOpen={false}>
          <DropdownRow icon={DollarSign} label="Pay Grade"
            value={employee.payGrade}
            field="payGrade" onEdit={handleEdit}
            options={["G1","G2","G3","G4","G5","G6","G7","G8","G9","G10"]}
          />
          <DropdownRow icon={Briefcase}  label="Employee Class"
            value={employee.employeeClass}
            field="employeeClass" onEdit={handleEdit}
            options={["FT","PT","Contract","Intern","Consultant"]}
          />
          <DetailRow icon={Briefcase}  label="Employment Type"  value={employee.employmentType} />
          <DetailRow icon={Briefcase}  label="Regular / Temp"   value={employee.regularTemporary} />
          <DetailRow icon={Clock}      label="Standard Hours"   value={employee.standardHours} />
          <DetailRow icon={Hash}       label="Target FTE"       value={employee.targetFTE} />
        </Section>

        {/* EFFECTIVE PERIOD — read only */}
        <Section title="Effective Period" defaultOpen={false}>
          <DetailRow icon={Calendar} label="Start Date"  value={formatDate(employee.effectiveStartDate)} />
          <DetailRow icon={Calendar} label="End Date"    value={formatDate(employee.effectiveEndDate)} />
          <DetailRow icon={Calendar} label="Created"     value={formatDate(employee.createdDateTime)} />
          <DetailRow icon={User}     label="Created By"  value={employee.createdBy} />
          <DetailRow icon={Calendar} label="Modified"    value={formatDate(employee.lastModifiedDateTime)} />
          <DetailRow icon={User}     label="Modified By" value={employee.lastModifiedBy} />
        </Section>

        {/* CRITICALITY — read only */}
        <Section title="Criticality" defaultOpen={false}>
          <DetailRow icon={AlertCircle} label="Criticality"          value={employee.criticality} />
          <DetailRow icon={AlertCircle} label="Position Criticality" value={employee.positionCriticality} />
        </Section>

      </div>
    </div>
  );
};

export default EmployeeDetailsPanel;