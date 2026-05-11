// // src/components/ParkingLot.jsx
// // Left-side fixed sidebar. No hierarchy constraints — any employee can be
// // assigned to any other employee as manager.

// import { useState } from "react";
// import { X, UserCheck, Users, ChevronLeft, ChevronRight } from "lucide-react";

// const HEADER_HEIGHT = 56;

// export default function ParkingLot({
//   parkedEmployees = [],
//   allEmployees = [],
//   onReattach,
//   onDragStart,
//   onRemoveFromParking,
// }) {
//   const [isOpen, setIsOpen] = useState(true);
//   const [attachingId, setAttachingId] = useState(null);
//   const [selectedManager, setSelectedManager] = useState("");

//   const handleConfirm = (empId) => {
//     if (!selectedManager) return;
//     onReattach(empId, selectedManager);
//     setAttachingId(null);
//     setSelectedManager("");
//   };

//   return (
//     <div
//       style={{
//         position: "fixed",
//         top: HEADER_HEIGHT,
//         left: 0,
//         bottom: 0,
//         width: isOpen ? 268 : 44,
//         background: "#fff",
//         borderRight: "1px solid #e2e8f0",
//         boxShadow: "4px 0 24px rgba(0,0,0,0.07)",
//         transition: "width 0.22s ease",
//         zIndex: 200,
//         display: "flex",
//         flexDirection: "column",
//         overflow: "hidden",
//       }}
//     >
//       {/* Toggle tab — on the RIGHT edge of the sidebar */}
//       <button
//         onClick={() => setIsOpen(o => !o)}
//         title={isOpen ? "Collapse" : "Parking Lot"}
//         style={{
//           position: "absolute",
//           right: -16,
//           top: 24,
//           width: 32,
//           height: 32,
//           borderRadius: "50%",
//           border: "1px solid #e2e8f0",
//           background: "#fff",
//           boxShadow: "2px 2px 8px rgba(0,0,0,0.1)",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           cursor: "pointer",
//           zIndex: 201,
//         }}
//       >
//         {isOpen ? <ChevronLeft size={14} color="#64748b" /> : <ChevronRight size={14} color="#64748b" />}
//       </button>

//       {/* Collapsed state */}
//       {!isOpen && (
//         <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 18, gap: 8 }}>
//           <span style={{ fontSize: 18 }}>🅿️</span>
//           {parkedEmployees.length > 0 && (
//             <span style={{
//               background: "#ef4444", color: "#fff", borderRadius: 999,
//               fontSize: 10, fontWeight: 700, padding: "2px 6px",
//               minWidth: 18, textAlign: "center",
//             }}>
//               {parkedEmployees.length}
//             </span>
//           )}
//         </div>
//       )}

//       {/* Expanded state */}
//       {isOpen && (
//         <>
//           {/* Header */}
//           <div style={{
//             padding: "14px 14px 10px",
//             borderBottom: "1px solid #f1f5f9",
//             background: "#f8fafc",
//             flexShrink: 0,
//           }}>
//             <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//               <span style={{ fontSize: 15 }}>🅿️</span>
//               <span style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>Parking Lot</span>
//               {parkedEmployees.length > 0 && (
//                 <span style={{
//                   marginLeft: "auto",
//                   background: "#ef4444", color: "#fff",
//                   borderRadius: 999, fontSize: 10, fontWeight: 700,
//                   padding: "2px 7px",
//                 }}>
//                   {parkedEmployees.length}
//                 </span>
//               )}
//             </div>
//             <p style={{ margin: "5px 0 0", fontSize: 11, color: "#94a3b8", lineHeight: 1.4 }}>
//               Drag back into chart or attach to any employee.
//             </p>
//           </div>

//           {/* Employee list */}
//           <div style={{ flex: 1, overflowY: "auto", padding: "10px 10px 16px" }}>
//             {parkedEmployees.length === 0 ? (
//               <div style={{ textAlign: "center", padding: "40px 12px", color: "#cbd5e1" }}>
//                 <Users size={28} style={{ display: "block", margin: "0 auto 8px" }} />
//                 <p style={{ margin: 0, fontSize: 12 }}>No detached employees</p>
//                 <p style={{ margin: "4px 0 0", fontSize: 11 }}>Click ✕ on any card to park them here</p>
//               </div>
//             ) : (
//               parkedEmployees.map(emp => (
//                 <div
//                   key={emp.id}
//                   draggable
//                   onDragStart={e => onDragStart(e, emp)}
//                   style={{
//                     background: "#f8fafc",
//                     border: "1.5px dashed #cbd5e1",
//                     borderRadius: 10,
//                     padding: "10px",
//                     marginBottom: 8,
//                     cursor: "grab",
//                     position: "relative",
//                     transition: "box-shadow 0.15s, border-color 0.15s",
//                   }}
//                   onMouseEnter={e => {
//                     e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.08)";
//                     e.currentTarget.style.borderColor = "#94a3b8";
//                   }}
//                   onMouseLeave={e => {
//                     e.currentTarget.style.boxShadow = "none";
//                     e.currentTarget.style.borderColor = "#cbd5e1";
//                   }}
//                 >
//                   {/* Permanent remove button */}
//                   <button
//                     onClick={() => onRemoveFromParking(emp.id)}
//                     title="Remove permanently"
//                     style={{
//                       position: "absolute", top: 6, right: 6,
//                       background: "none", border: "none",
//                       cursor: "pointer", color: "#94a3b8",
//                       padding: 2, display: "flex", borderRadius: 4,
//                     }}
//                     onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
//                     onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
//                   >
//                     <X size={12} />
//                   </button>

//                   {/* Avatar + info */}
//                   <div style={{ display: "flex", alignItems: "center", gap: 9, paddingRight: 16 }}>
//                     <div style={{
//                       width: 34, height: 34, borderRadius: "50%",
//                       background: "#e2e8f0",
//                       display: "flex", alignItems: "center", justifyContent: "center",
//                       fontWeight: 700, fontSize: 12, color: "#475569",
//                       flexShrink: 0,
//                     }}>
//                       {emp.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
//                     </div>
//                     <div style={{ minWidth: 0 }}>
//                       <div style={{
//                         fontWeight: 600, fontSize: 12, color: "#1e293b",
//                         whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
//                       }}>
//                         {emp.name}
//                       </div>
//                       <div style={{
//                         fontSize: 11, color: "#64748b",
//                         whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
//                       }}>
//                         {emp.designation || emp.jobTitle || "—"}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Attach UI */}
//                   {attachingId === emp.id ? (
//                     <div style={{ marginTop: 10 }}>
//                       <select
//                         value={selectedManager}
//                         onChange={e => setSelectedManager(e.target.value)}
//                         style={{
//                           width: "100%", padding: "6px 8px",
//                           borderRadius: 6, border: "1px solid #cbd5e1",
//                           fontSize: 11, background: "#fff",
//                           marginBottom: 6, color: "#1e293b",
//                         }}
//                       >
//                         <option value="">Select anyone as manager...</option>
//                         {allEmployees
//                           .filter(e => e.id !== emp.id)
//                           .map(e => (
//                             <option key={e.id} value={e.id}>
//                               {e.name}{e.designation ? ` — ${e.designation}` : ""}
//                             </option>
//                           ))
//                         }
//                       </select>
//                       <div style={{ display: "flex", gap: 6 }}>
//                         <button
//                           onClick={() => handleConfirm(emp.id)}
//                           disabled={!selectedManager}
//                           style={{
//                             flex: 1, padding: "5px 0",
//                             background: selectedManager ? "#1a3a6b" : "#e2e8f0",
//                             color: selectedManager ? "#fff" : "#94a3b8",
//                             border: "none", borderRadius: 6,
//                             fontSize: 11, fontWeight: 600,
//                             cursor: selectedManager ? "pointer" : "not-allowed",
//                           }}
//                         >
//                           Confirm
//                         </button>
//                         <button
//                           onClick={() => { setAttachingId(null); setSelectedManager(""); }}
//                           style={{
//                             flex: 1, padding: "5px 0",
//                             background: "#f1f5f9", color: "#64748b",
//                             border: "1px solid #e2e8f0", borderRadius: 6,
//                             fontSize: 11, cursor: "pointer",
//                           }}
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     </div>
//                   ) : (
//                     <button
//                       onClick={() => { setAttachingId(emp.id); setSelectedManager(""); }}
//                       style={{
//                         marginTop: 10, width: "100%", padding: "5px 0",
//                         background: "#fff", border: "1px solid #1a3a6b",
//                         color: "#1a3a6b", borderRadius: 6,
//                         fontSize: 11, fontWeight: 600, cursor: "pointer",
//                         display: "flex", alignItems: "center",
//                         justifyContent: "center", gap: 5,
//                       }}
//                     >
//                       <UserCheck size={12} />
//                       Attach to Manager
//                     </button>
//                   )}
//                 </div>
//               ))
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }


// src/components/LeftPanel.jsx
// Left sidebar with 3 tabs:
//   1. Tile Fields  — toggle which fields show on every card
//   2. Parking Lot  — detached employees
//   3. Scenarios    — save/load/compare org arrangements

// src/components/LeftPanel.jsx
// Left sidebar with 3 tabs:
//   1. Tile Fields  — toggle which fields show on every card
//   2. Parking Lot  — detached employees
//   3. Scenarios    — save/load/compare org arrangements

import { useState, useCallback } from "react";
import { X, UserCheck, Users, ChevronLeft, ChevronRight,
         GitCompare, Plus, Clock, Check, Trash2 } from "lucide-react";

const HEADER_HEIGHT = 56;
const PANEL_WIDTH   = 280;

// ── All configurable tile fields (matches EmployeeCard data keys) ──────────
const TILE_FIELD_OPTIONS = [
  { key: "name",          label: "Name",           source: "PerPerson",      alwaysOn: true },
  { key: "designation",   label: "Designation",     source: "EmpJob",         alwaysOn: true },
  { key: "id",            label: "Employee ID",     source: "PerPerson" },
  { key: "department",    label: "Business Unit",   source: "FOBusinessUnit" },
  { key: "location",      label: "Location",        source: "FOLocation" },
  { key: "grade",         label: "Grade",           source: "EmpJob" },
  { key: "yearsOfService",label: "Years of Service",source: "EmpEmployment" },
  { key: "email",         label: "Email",           source: "PerEmail" },
  { key: "phone",         label: "Phone",           source: "PerPhone" },
  { key: "costCenter",    label: "Cost Center",     source: "EmpJob" },
];

// Default enabled fields
const DEFAULT_FIELDS = new Set(["name", "designation", "id", "department", "location"]);

// ── Scenario helpers ───────────────────────────────────────────────────────
function makeScenarioId() {
  return "sc_" + Date.now().toString(36);
}

function timeAgo(ts) {
  const s = (Date.now() - ts) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} hr ago`;
  return `${Math.round(s / 86400)} days ago`;
}

// ── Demo / seed scenarios ──────────────────────────────────────────────────
const DEMO_SCENARIOS = [
  {
    id: "demo_1",
    name: "Q3 Restructure — Construction merger",
    author: "Suresh K.",
    createdAt: Date.now() - 3 * 86400_000,
    changes: 4,
    snapshot: null, // live data placeholder
    isDemo: true,
  },
  {
    id: "demo_2",
    name: "Defence carve-out preview",
    author: "Priya M.",
    createdAt: Date.now() - 7 * 86400_000,
    changes: 2,
    snapshot: null,
    isDemo: true,
  },
];

function LeftPanel({
  // Parking lot props
  parkedEmployees = [],
  allEmployees    = [],
  onReattach,
  onDragStart,
  onRemoveFromParking,
  // Tile field props
  enabledFields,        // Set<string> — controlled by App
  onFieldToggle,        // fn(key, enabled)
  // Scenario props
  currentEmployees,     // snapshot of live allEmployees for saving
  onLoadScenario,       // fn(employees) — restores a scenario
  onCompareScenario,    // fn(scenarioEmployees) — compare view
}) {
  const [isOpen,      setIsOpen]      = useState(true);
  const [activeTab,   setActiveTab]   = useState("tile"); // tile | parking | scenarios
  const [attachingId, setAttachingId] = useState(null);
  const [selManager,  setSelManager]  = useState("");

  // Scenarios state (in-memory; can persist to localStorage later)
  const [scenarios,   setScenarios]   = useState(DEMO_SCENARIOS);
  const [newName,     setNewName]     = useState("");
  const [savingNew,   setSavingNew]   = useState(false);
  const [activeScId,  setActiveScId]  = useState(null); // currently loaded scenario id

  // ── Parking lot helpers ──────────────────────────────────────────────────
  const confirmAttach = (empId) => {
    if (!selManager) return;
    onReattach(empId, selManager);
    setAttachingId(null);
    setSelManager("");
  };

  // ── Scenario helpers ─────────────────────────────────────────────────────
  const handleSaveScenario = () => {
    if (!newName.trim()) return;
    const sc = {
      id:        makeScenarioId(),
      name:      newName.trim(),
      author:    "You",
      createdAt: Date.now(),
      changes:   0,
      snapshot:  JSON.parse(JSON.stringify(currentEmployees)),
      isDemo:    false,
    };
    setScenarios(prev => [sc, ...prev]);
    setNewName("");
    setSavingNew(false);
  };

  const handleLoadScenario = (sc) => {
    if (sc.isDemo || !sc.snapshot) return; // demo — nothing to restore
    setActiveScId(sc.id);
    onLoadScenario(sc.snapshot);
  };

  const handleDeleteScenario = (scId) => {
    setScenarios(prev => prev.filter(s => s.id !== scId));
    if (activeScId === scId) setActiveScId(null);
  };

  const handleCompare = (sc) => {
    if (!onCompareScenario) return;
    const snap = sc.isDemo ? currentEmployees : sc.snapshot;
    onCompareScenario(snap);
  };

  // ── Tab counts ────────────────────────────────────────────────────────────
  const parkCount = parkedEmployees.length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      position:  "fixed",
      top:       HEADER_HEIGHT,
      left:      0,
      bottom:    0,
      width:     isOpen ? PANEL_WIDTH : 44,
      background:"#fff",
      borderRight:"1px solid #e2e8f0",
      boxShadow: "4px 0 24px rgba(0,0,0,0.06)",
      transition:"width 0.22s ease",
      zIndex:    200,
      display:   "flex",
      flexDirection: "column",
      overflow:  "hidden",
    }}>
      {/* Toggle tab */}
      <button
        onClick={() => setIsOpen(o => !o)}
        style={{
          position:"absolute", right:-16, top:24,
          width:32, height:32, borderRadius:"50%",
          border:"1px solid #e2e8f0", background:"#fff",
          boxShadow:"2px 2px 8px rgba(0,0,0,0.1)",
          display:"flex", alignItems:"center", justifyContent:"center",
          cursor:"pointer", zIndex:201,
        }}
      >
        {isOpen ? <ChevronLeft size={14} color="#64748b"/> : <ChevronRight size={14} color="#64748b"/>}
      </button>

      {/* Collapsed */}
      {!isOpen && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", paddingTop:18, gap:12 }}>
          <span title="Tile Fields" style={{ fontSize:18, cursor:"pointer" }}
            onClick={() => { setIsOpen(true); setActiveTab("tile"); }}>⚙️</span>
          <span title="Parking Lot" style={{ fontSize:18, cursor:"pointer", position:"relative" }}
            onClick={() => { setIsOpen(true); setActiveTab("parking"); }}>
            🅿️
            {parkCount > 0 && (
              <span style={{ position:"absolute", top:-4, right:-4,
                background:"#ef4444", color:"#fff", borderRadius:999,
                fontSize:9, fontWeight:700, padding:"1px 4px" }}>
                {parkCount}
              </span>
            )}
          </span>
          <span title="Scenarios" style={{ fontSize:18, cursor:"pointer" }}
            onClick={() => { setIsOpen(true); setActiveTab("scenarios"); }}>📋</span>
        </div>
      )}

      {/* Expanded */}
      {isOpen && (
        <>
          {/* Tab bar */}
          <div style={{ display:"flex", borderBottom:"1px solid #e2e8f0", flexShrink:0, background:"#f8fafc" }}>
            {[
              { id:"tile",      label:"Tile Fields" },
              { id:"parking",   label:`Parking Lot${parkCount > 0 ? ` (${parkCount})` : ""}` },
              { id:"scenarios", label:"Scenarios" },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  flex:1, padding:"10px 4px", fontSize:11, fontWeight:600,
                  border:"none", background:"none", cursor:"pointer",
                  borderBottom: activeTab === tab.id ? "2px solid #1a3a6b" : "2px solid transparent",
                  color: activeTab === tab.id ? "#1a3a6b" : "#64748b",
                  transition:"color 0.15s",
                  whiteSpace:"nowrap",
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── TAB: Tile Fields ───────────────────────────────────────────── */}
          {activeTab === "tile" && (
            <div style={{ flex:1, overflowY:"auto", padding:"14px 14px 20px" }}>
              <p style={{ margin:"0 0 4px", fontWeight:700, fontSize:13, color:"#1e293b" }}>
                Configure Tile Fields
              </p>
              <p style={{ margin:"0 0 16px", fontSize:11, color:"#64748b", lineHeight:1.5 }}>
                Pick which fields appear on every tile in the chart.
                Name and Designation are always shown.
              </p>

              {TILE_FIELD_OPTIONS.map(field => {
                const active = field.alwaysOn || (enabledFields && enabledFields.has(field.key));
                return (
                  <div key={field.key} style={{
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"9px 0", borderBottom:"1px solid #f1f5f9",
                  }}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:12, color: field.alwaysOn ? "#94a3b8" : "#1e293b" }}>
                        {field.label}
                      </div>
                      <div style={{ fontSize:10, color:"#94a3b8", marginTop:1 }}>
                        {field.source}
                      </div>
                    </div>
                    <label style={{ position:"relative", display:"inline-block", width:36, height:20, flexShrink:0 }}>
                      <input
                        type="checkbox"
                        checked={!!active}
                        disabled={!!field.alwaysOn}
                        onChange={e => onFieldToggle && onFieldToggle(field.key, e.target.checked)}
                        style={{ opacity:0, width:0, height:0 }}
                      />
                      <span style={{
                        position:"absolute", inset:0, borderRadius:10,
                        background: active ? "#1a3a6b" : "#e2e8f0",
                        transition:"background 0.2s",
                        opacity: field.alwaysOn ? 0.45 : 1,
                      }}>
                        <span style={{
                          position:"absolute", top:2, left: active ? 18 : 2,
                          width:16, height:16, borderRadius:"50%",
                          background:"#fff",
                          boxShadow:"0 1px 4px rgba(0,0,0,0.2)",
                          transition:"left 0.2s",
                        }}/>
                      </span>
                    </label>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── TAB: Parking Lot ──────────────────────────────────────────── */}
          {activeTab === "parking" && (
            <div style={{ flex:1, overflowY:"auto", padding:"12px 10px 16px" }}>
              <p style={{ margin:"0 0 12px", fontSize:11, color:"#94a3b8", padding:"0 4px" }}>
                Drag back into chart or attach to any employee.
              </p>

              {parkCount === 0 ? (
                <div style={{ textAlign:"center", padding:"40px 12px", color:"#cbd5e1" }}>
                  <Users size={28} style={{ display:"block", margin:"0 auto 8px" }}/>
                  <p style={{ margin:0, fontSize:12 }}>No detached employees</p>
                  <p style={{ margin:"4px 0 0", fontSize:11 }}>Click ✕ on any card to park them</p>
                </div>
              ) : (
                parkedEmployees.map(emp => (
                  <div key={emp.id} draggable onDragStart={e => onDragStart(e, emp)}
                    style={{
                      background:"#f8fafc", border:"1.5px dashed #cbd5e1",
                      borderRadius:10, padding:10, marginBottom:8,
                      cursor:"grab", position:"relative",
                      transition:"box-shadow 0.15s, border-color 0.15s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.08)";
                      e.currentTarget.style.borderColor = "#94a3b8";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.borderColor = "#cbd5e1";
                    }}
                  >
                    {/* Remove permanently */}
                    <button onClick={() => onRemoveFromParking(emp.id)}
                      style={{ position:"absolute", top:6, right:6,
                        background:"none", border:"none", cursor:"pointer",
                        color:"#94a3b8", padding:2, display:"flex", borderRadius:4 }}
                      onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                      onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
                    ><X size={12}/></button>

                    {/* Avatar + info */}
                    <div style={{ display:"flex", alignItems:"center", gap:9, paddingRight:16 }}>
                      <div style={{
                        width:34, height:34, borderRadius:"50%", background:"#e2e8f0",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontWeight:700, fontSize:12, color:"#475569", flexShrink:0,
                      }}>
                        {emp.name?.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase() || "?"}
                      </div>
                      <div style={{ minWidth:0 }}>
                        <div style={{ fontWeight:600, fontSize:12, color:"#1e293b",
                          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                          {emp.name}
                        </div>
                        <div style={{ fontSize:11, color:"#64748b",
                          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                          {emp.designation || "—"}
                        </div>
                      </div>
                    </div>

                    {/* Attach UI */}
                    {attachingId === emp.id ? (
                      <div style={{ marginTop:10 }}>
                        <select value={selManager} onChange={e => setSelManager(e.target.value)}
                          style={{ width:"100%", padding:"6px 8px", borderRadius:6,
                            border:"1px solid #cbd5e1", fontSize:11, background:"#fff",
                            marginBottom:6, color:"#1e293b" }}>
                          <option value="">Select anyone as manager...</option>
                          {allEmployees.filter(e => e.id !== emp.id).map(e => (
                            <option key={e.id} value={e.id}>
                              {e.name}{e.designation ? ` — ${e.designation}` : ""}
                            </option>
                          ))}
                        </select>
                        <div style={{ display:"flex", gap:6 }}>
                          <button onClick={() => confirmAttach(emp.id)} disabled={!selManager}
                            style={{ flex:1, padding:"5px 0",
                              background: selManager ? "#1a3a6b" : "#e2e8f0",
                              color: selManager ? "#fff" : "#94a3b8",
                              border:"none", borderRadius:6, fontSize:11, fontWeight:600,
                              cursor: selManager ? "pointer" : "not-allowed" }}>
                            Confirm
                          </button>
                          <button onClick={() => { setAttachingId(null); setSelManager(""); }}
                            style={{ flex:1, padding:"5px 0", background:"#f1f5f9",
                              color:"#64748b", border:"1px solid #e2e8f0",
                              borderRadius:6, fontSize:11, cursor:"pointer" }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setAttachingId(emp.id); setSelManager(""); }}
                        style={{ marginTop:10, width:"100%", padding:"5px 0",
                          background:"#fff", border:"1px solid #1a3a6b",
                          color:"#1a3a6b", borderRadius:6, fontSize:11,
                          fontWeight:600, cursor:"pointer",
                          display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
                        <UserCheck size={12}/> Attach to Manager
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── TAB: Scenarios ────────────────────────────────────────────── */}
          {activeTab === "scenarios" && (
            <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column" }}>
              {/* Save new scenario */}
              <div style={{ padding:"12px 14px", borderBottom:"1px solid #f1f5f9", background:"#f8fafc" }}>
                <p style={{ margin:"0 0 8px", fontWeight:700, fontSize:12, color:"#1e293b" }}>
                  SAVED SCENARIOS
                </p>
                <p style={{ margin:"0 0 10px", fontSize:11, color:"#64748b" }}>
                  Scenarios are stored locally. Save the current chart state to compare later.
                </p>

                {savingNew ? (
                  <div style={{ display:"flex", gap:6 }}>
                    <input
                      autoFocus
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleSaveScenario(); if (e.key === "Escape") setSavingNew(false); }}
                      placeholder="Scenario name..."
                      style={{ flex:1, padding:"6px 10px", borderRadius:7, border:"1px solid #cbd5e1",
                        fontSize:12, color:"#1e293b", outline:"none" }}
                    />
                    <button onClick={handleSaveScenario} disabled={!newName.trim()}
                      style={{ padding:"6px 10px", background: newName.trim() ? "#1a3a6b" : "#e2e8f0",
                        color: newName.trim() ? "#fff" : "#94a3b8",
                        border:"none", borderRadius:7, fontSize:11, fontWeight:600,
                        cursor: newName.trim() ? "pointer" : "not-allowed" }}>
                      <Check size={13}/>
                    </button>
                    <button onClick={() => setSavingNew(false)}
                      style={{ padding:"6px 10px", background:"#f1f5f9",
                        color:"#64748b", border:"1px solid #e2e8f0",
                        borderRadius:7, fontSize:11, cursor:"pointer" }}>
                      <X size={13}/>
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setSavingNew(true)}
                    style={{ width:"100%", padding:"7px 0",
                      background:"#1a3a6b", color:"#fff",
                      border:"none", borderRadius:7, fontSize:12,
                      fontWeight:600, cursor:"pointer",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                    <Plus size={13}/> Save current scenario
                  </button>
                )}
              </div>

              {/* Scenario list */}
              <div style={{ flex:1, overflowY:"auto", padding:"10px 10px 16px" }}>
                {scenarios.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"32px 12px", color:"#cbd5e1" }}>
                    <p style={{ margin:0, fontSize:12 }}>No saved scenarios yet</p>
                  </div>
                ) : (
                  scenarios.map(sc => (
                    <div key={sc.id}
                      style={{
                        background: activeScId === sc.id ? "#eff6ff" : "#f8fafc",
                        border: `1.5px solid ${activeScId === sc.id ? "#93c5fd" : "#e2e8f0"}`,
                        borderRadius:10, padding:"11px 12px",
                        marginBottom:8, transition:"border-color 0.15s",
                      }}>
                      {/* Title row */}
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontWeight:700, fontSize:12, color:"#1e293b",
                            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                            {sc.name}
                          </div>
                          <div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>
                            {sc.author}
                          </div>
                        </div>
                        {!sc.isDemo && (
                          <button onClick={() => handleDeleteScenario(sc.id)}
                            style={{ background:"none", border:"none", cursor:"pointer",
                              color:"#94a3b8", padding:2, flexShrink:0 }}
                            onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                            onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>
                            <Trash2 size={12}/>
                          </button>
                        )}
                      </div>

                      {/* Meta row */}
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:6 }}>
                        <span style={{ fontSize:10, color:"#94a3b8", display:"flex", alignItems:"center", gap:3 }}>
                          <Clock size={10}/> {timeAgo(sc.createdAt)}
                        </span>
                        {sc.changes > 0 && (
                          <span style={{ fontSize:10, fontWeight:700,
                            background:"#dbeafe", color:"#1d4ed8",
                            borderRadius:4, padding:"1px 6px" }}>
                            {sc.changes} changes
                          </span>
                        )}
                        {sc.isDemo && (
                          <span style={{ fontSize:10, fontWeight:700,
                            background:"#f1f5f9", color:"#64748b",
                            borderRadius:4, padding:"1px 6px" }}>
                            demo
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display:"flex", gap:6, marginTop:10 }}>
                        <button
                          onClick={() => handleLoadScenario(sc)}
                          disabled={sc.isDemo}
                          title={sc.isDemo ? "Demo scenario — save your own to load" : "Load this scenario"}
                          style={{
                            flex:1, padding:"5px 0", fontSize:11, fontWeight:600,
                            background: activeScId === sc.id ? "#1a3a6b" : sc.isDemo ? "#f1f5f9" : "#fff",
                            color: activeScId === sc.id ? "#fff" : sc.isDemo ? "#94a3b8" : "#1a3a6b",
                            border: `1px solid ${activeScId === sc.id ? "#1a3a6b" : sc.isDemo ? "#e2e8f0" : "#1a3a6b"}`,
                            borderRadius:6, cursor: sc.isDemo ? "not-allowed" : "pointer",
                          }}>
                          {activeScId === sc.id ? "✓ Loaded" : "Load"}
                        </button>
                        <button
                          onClick={() => handleCompare(sc)}
                          title="Compare with live data"
                          style={{
                            flex:1, padding:"5px 0", fontSize:11, fontWeight:600,
                            background:"#f8fafc", color:"#475569",
                            border:"1px solid #e2e8f0", borderRadius:6, cursor:"pointer",
                            display:"flex", alignItems:"center", justifyContent:"center", gap:4,
                          }}>
                          <GitCompare size={11}/> Compare
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export { DEFAULT_FIELDS, TILE_FIELD_OPTIONS };
export default LeftPanel;