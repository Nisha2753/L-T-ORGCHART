/**
 * App.jsx - Root application component
 *
 * FIX: handleReparent now sends employee.code (SAP position code) to the
 * backend instead of employee.id. The backend tree uses `node.code` as the
 * identifier, but React Flow node IDs are set to `emp.id` in hierarchyBuilder.
 *
 * The fix: look up the full employee object by id, then send .code to backend.
 * Also added console.error with the full server response so you can debug.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ReactFlowProvider, useNodesState, useEdgesState } from "reactflow";
import "./App.css";

import LoginPage from "./pages/LoginPage";
import LeftPanel, { DEFAULT_FIELDS } from "./components/LeftPanel";
import Header from "./components/Header";
import OrgChart from "./components/OrgChart";
import EmployeeDetailsPanel from "./components/EmployeeDetailsPanel";

import { exportToExcel } from "./utils/exportToExcel";
import {
  getAllEmployees,
  getDepartments,
  refreshOrgData,
  USE_API,
} from "./services/employeeService";
import { buildFlowElements, applyDagreLayout } from "./utils/hierarchyBuilder";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://l-t-orgchart.onrender.com";

const AppInner = () => {
  const [allEmployees, setAllEmployees]         = useState([]);
  const [departments, setDepartments]           = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState(null);
  const [refreshing, setRefreshing]             = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery]           = useState("");
  const [selectedDept, setSelectedDept]         = useState("");
  const [parkedEmployees, setParkedEmployees]   = useState([]);
  const [enabledFields, setEnabledFields]       = useState(DEFAULT_FIELDS);
  const [localEdits, setLocalEdits]             = useState({});
  const [staticNewEmployees, setStaticNewEmployees] = useState([]);
  const [reparentStatus, setReparentStatus]     = useState(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const isDraggingRef = useRef(false);

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = sessionStorage.getItem("lt_orgchart_user");
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin  = (user) => { sessionStorage.setItem("lt_orgchart_user", JSON.stringify(user)); setCurrentUser(user); };
  const handleLogout = ()     => { sessionStorage.removeItem("lt_orgchart_user"); setCurrentUser(null); };

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const [emps, depts] = await Promise.all([getAllEmployees(), getDepartments()]);
      setAllEmployees(emps);
      setDepartments(depts);
      const combined = [...emps, ...staticNewEmployees];
      const { nodes: n, edges: e } = buildFlowElements(combined);
      setNodes(n.map((node) => ({ ...node, data: { ...node.data, enabledFields } })));
      setEdges(e);
    } catch (err) {
      setError(err.message || "Failed to load org data. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [staticNewEmployees, enabledFields, setNodes, setEdges]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (isDraggingRef.current) return;
    if (allEmployees.length === 0) return;
    const combined = [...allEmployees, ...staticNewEmployees];
    const { nodes: n, edges: e } = buildFlowElements(combined);
    setNodes(n.map((node) => ({ ...node, data: { ...node.data, enabledFields } })));
    setEdges(e);
  }, [allEmployees, staticNewEmployees, enabledFields, setNodes, setEdges]);

  useEffect(() => {
    setNodes((prev) => prev.map((node) => ({ ...node, data: { ...node.data, enabledFields } })));
  }, [enabledFields, setNodes]);

  useEffect(() => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        const edits = localEdits[node.id];
        if (!edits) return node;
        return {
          ...node,
          data: {
            ...node.data,
            name:        edits.name       ?? node.data.name,
            designation: edits.jobTitle   ?? node.data.designation,
            department:  edits.department ?? node.data.department,
            location:    edits.location   ?? node.data.location,
            avatar: edits.name
              ? edits.name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("")
              : node.data.avatar,
          },
        };
      })
    );
  }, [localEdits, setNodes]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshOrgData();
      setTimeout(async () => { await loadData(); setRefreshing(false); }, 2000);
    } catch (err) {
      console.error("Refresh failed:", err.message);
      setRefreshing(false);
    }
  }, [loadData]);

  const handleLocalEdit = useCallback((empId, field, value) => {
    setLocalEdits((prev) => {
      const existing = prev[empId] || {};
      if (value === undefined) {
        const updated = { ...existing };
        delete updated[field];
        if (Object.keys(updated).length === 0) { const all = { ...prev }; delete all[empId]; return all; }
        return { ...prev, [empId]: updated };
      }
      return { ...prev, [empId]: { ...existing, [field]: value } };
    });
  }, []);

  const handleDetachEmployee = useCallback((employeeId) => {
    setAllEmployees((prev) => {
      const employee = prev.find((e) => e.id === employeeId);
      if (!employee) return prev;
      setParkedEmployees((p) => p.find((e) => e.id === employeeId) ? p : [...p, employee]);
      return prev
        .filter((e) => e.id !== employeeId)
        .map((e) => e.managerId === employeeId ? { ...e, managerId: employee.managerId ?? null } : e);
    });
  }, []);

  const handleManagerChange = useCallback((employeeId, newManagerId) => {
    setAllEmployees((prev) => prev.map((e) => e.id === employeeId ? { ...e, managerId: newManagerId } : e));
  }, []);

  const reattachEmployee = useCallback((employee, newManagerId) => {
    setAllEmployees((prev) => {
      if (prev.find((e) => e.id === employee.id))
        return prev.map((e) => e.id === employee.id ? { ...e, managerId: newManagerId } : e);
      return [...prev, { ...employee, managerId: newManagerId }];
    });
    setParkedEmployees((prev) => prev.filter((e) => e.id !== employee.id));
  }, []);

  const handleReattachFromButton = useCallback((employeeId, newManagerId) => {
    const emp = parkedEmployees.find((e) => e.id === employeeId);
    if (!emp) return;
    reattachEmployee(emp, newManagerId);
  }, [parkedEmployees, reattachEmployee]);

  const handleReattachFromDrop   = useCallback((employee, newManagerId) => reattachEmployee(employee, newManagerId), [reattachEmployee]);
  const handleParkingLotDragStart = useCallback((e, employee) => { e.dataTransfer.setData("application/parked-employee", JSON.stringify(employee)); e.dataTransfer.effectAllowed = "move"; }, []);
  const handleRemoveFromParking   = useCallback((id) => setParkedEmployees((p) => p.filter((e) => e.id !== id)), []);
  const handleFieldToggle         = useCallback((key, enabled) => setEnabledFields((prev) => { const next = new Set(prev); enabled ? next.add(key) : next.delete(key); return next; }), []);
  const handleLoadScenario        = useCallback((snapshot) => setAllEmployees(snapshot), []);
  const handleCompareScenario     = useCallback((snapshot) => console.log("Compare scenario:", snapshot), []);
  const handleAddEmployee         = useCallback((newEmp) => setStaticNewEmployees((prev) => [...prev, newEmp]), []);
  const handleDeleteStaticEmployee = useCallback((empId) => { setStaticNewEmployees((prev) => prev.filter((e) => e.id !== empId)); setSelectedEmployee(null); }, []);

  const handleDownload = useCallback(() => {
    exportToExcel(
      [...allEmployees, ...staticNewEmployees], localEdits,
      staticNewEmployees.map((e) => e.id),
      `LT_OrgChart_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  }, [allEmployees, staticNewEmployees, localEdits]);

  // ── handleReparent ─────────────────────────────────────────────────────────
  const handleReparent = useCallback(
    async (draggedId, newParentId) => {
      // draggedId and newParentId are React Flow node IDs = employee.id

      if (draggedId === newParentId) return;

      const combined = [...allEmployees, ...staticNewEmployees];

      // Look up full employee objects
      const draggedEmp    = combined.find((e) => e.id === draggedId);
      const newParentEmp  = combined.find((e) => e.id === newParentId);

      if (!draggedEmp || !newParentEmp) {
        console.error("Reparent: could not find employee objects", { draggedId, newParentId });
        return;
      }

      // Skip if already this parent
      if (draggedEmp.managerId === newParentId) return;

      // Cycle guard
      function isDescendant(ancestorId, targetId) {
        return combined
          .filter((e) => e.managerId === ancestorId)
          .some((c) => c.id === targetId || isDescendant(c.id, targetId));
      }
      if (isDescendant(draggedId, newParentId)) {
        console.warn("Cannot drop onto own descendant.");
        return;
      }

      const previousEmployees = [...allEmployees];

      // Wait one frame for React Flow dragStop cleanup
      await new Promise((resolve) => requestAnimationFrame(resolve));

      // Optimistically update managerId in local state
      setAllEmployees((prev) =>
        prev.map((e) => e.id === draggedId ? { ...e, managerId: newParentId } : e)
      );
      setReparentStatus("saving");

      // ── Determine what identifiers to send to the backend ──────────────────
      // Your backend tree uses `node.code` as the primary key.
      // Your frontend employee objects have both `id` and `code` fields.
      // We prefer `code` if available, otherwise fall back to `id`.
      const employeeCode  = draggedEmp.code   || draggedEmp.id;
      const newParentCode = newParentEmp.code  || newParentEmp.id;

      console.log("Reparent request →", { employeeCode, newParentCode, draggedEmp, newParentEmp });

      try {
        const res = await fetch(`${API_BASE}/api/reparent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employeeCode, newParentCode }),
        });

        // Always read the body for debugging
        const body = await res.json().catch(() => ({}));
        console.log("Reparent response →", res.status, body);

        if (!res.ok) {
          throw new Error(body.error || `HTTP ${res.status}`);
        }

        setReparentStatus("saved");
        setTimeout(() => setReparentStatus(null), 2500);
      } catch (err) {
        console.error("Reparent failed, rolling back:", err.message);
        setAllEmployees(previousEmployees);
        setReparentStatus("error");
        setTimeout(() => setReparentStatus(null), 3500);
      }
    },
    [allEmployees, staticNewEmployees]
  );

  const filteredIds = useMemo(() => {
    if (!searchQuery && !selectedDept) return null;
    const combined = [...allEmployees, ...staticNewEmployees];
    return combined
      .filter((emp) => {
        const matchesDept   = !selectedDept || emp.department === selectedDept;
        const matchesSearch = !searchQuery  ||
          [emp.name, emp.id, emp.code, emp.department, emp.designation, emp.location]
            .some((f) => f?.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesDept && matchesSearch;
      })
      .map((emp) => emp.id);
  }, [allEmployees, staticNewEmployees, searchQuery, selectedDept]);

  const handleNodeClick = useCallback((empId) => {
    const combined = [...allEmployees, ...staticNewEmployees];
    setSelectedEmployee(combined.find((e) => e.id === empId));
  }, [allEmployees, staticNewEmployees]);

  const handleReactFlowNodeClick = useCallback((nodeId) => handleNodeClick(nodeId), [handleNodeClick]);
  const handleSearchChange        = useCallback((val) => setSearchQuery(val), []);
  const handleSearchClear         = useCallback(() => setSearchQuery(""), []);
  const handleDeptChange          = useCallback((val) => setSelectedDept(val), []);

  const handleReLayout = useCallback(() => {
    const { nodes: n, edges: e } = applyDagreLayout(nodes, edges);
    setNodes(n); setEdges(e);
  }, [nodes, edges, setNodes, setEdges]);

  const selectedWithEdits = useMemo(() => {
    if (!selectedEmployee) return null;
    return { ...selectedEmployee, ...(localEdits[selectedEmployee.id] || {}) };
  }, [selectedEmployee, localEdits]);

  const uniqueDepts = useMemo(() =>
    [...new Set([...allEmployees, ...staticNewEmployees].map((e) => e.department).filter(Boolean))],
    [allEmployees, staticNewEmployees]
  );

  const isStaticEmployee = useCallback(
    (empId) => staticNewEmployees.some((e) => e.id === empId),
    [staticNewEmployees]
  );

  const panelOpen = !!selectedEmployee;

  if (!currentUser) return <LoginPage onLogin={handleLogin} />;

  return (
    <div className="app-layout">
      <Header
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchClear={handleSearchClear}
        selectedDept={selectedDept}
        onDeptChange={handleDeptChange}
        departments={departments}
        totalEmployees={allEmployees.length + staticNewEmployees.length}
        totalDepts={uniqueDepts.length}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        isLive={USE_API}
        onAddEmployee={handleAddEmployee}
        allEmployees={[...allEmployees, ...staticNewEmployees]}
        onDownload={handleDownload}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className={`app-body ${panelOpen ? "panel-open" : ""}`}>
        <div className="chart-area">
          {loading && (
            <div className="loading-overlay">
              <div className="loading-spinner" />
              <div className="loading-text">
                {USE_API ? "Connecting to SAP SuccessFactors..." : "Loading organisation data..."}
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="loading-overlay">
              <div style={{ fontSize: 36 }}>⚠️</div>
              <div style={{ color: "#ef4444", fontSize: 15, fontWeight: 700 }}>Connection Error</div>
              <div style={{ color: "#64748b", fontSize: 13, maxWidth: 380, textAlign: "center", lineHeight: 1.6 }}>{error}</div>
              <button onClick={loadData} style={{ marginTop: 16, padding: "9px 24px", background: "#1a3a6b", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-body)" }}>
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <OrgChart
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={handleReactFlowNodeClick}
              filteredIds={filteredIds}
              onReLayout={handleReLayout}
              selectedEmployeeId={selectedEmployee?.id}
              searchQuery={searchQuery}
              allEmployees={[...allEmployees, ...staticNewEmployees]}
              onManagerChange={handleManagerChange}
              onDetachEmployee={handleDetachEmployee}
              onReattachFromParking={handleReattachFromDrop}
              staticEmployeeIds={staticNewEmployees.map((e) => e.id)}
              onReparent={handleReparent}
              isDraggingRef={isDraggingRef}
            />
          )}

          {!loading && !error && filteredIds && filteredIds.length === 0 && (
            <div className="empty-state">
              <svg className="empty-state-icon" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" />
                <circle cx="24" cy="20" r="7" stroke="currentColor" strokeWidth="2" opacity="0.5" />
                <path d="M10 38c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
              </svg>
              <div className="empty-state-text">No positions match your search</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>Try a different name, code, or department</div>
            </div>
          )}
        </div>

        {selectedEmployee && (
          <EmployeeDetailsPanel
            employee={selectedWithEdits}
            allEmployees={[...allEmployees, ...staticNewEmployees]}
            onClose={() => setSelectedEmployee(null)}
            onRefresh={USE_API ? handleRefresh : null}
            onLocalEdit={handleLocalEdit}
            isStatic={isStaticEmployee(selectedEmployee.id)}
            onDeleteStatic={handleDeleteStaticEmployee}
            localEdits={localEdits[selectedEmployee?.id] || {}}
          />
        )}
      </div>

      <LeftPanel
        parkedEmployees={parkedEmployees}
        allEmployees={[...allEmployees, ...staticNewEmployees]}
        onReattach={handleReattachFromButton}
        onDragStart={handleParkingLotDragStart}
        onRemoveFromParking={handleRemoveFromParking}
        enabledFields={enabledFields}
        onFieldToggle={handleFieldToggle}
        currentEmployees={[...allEmployees, ...staticNewEmployees]}
        onLoadScenario={handleLoadScenario}
        onCompareScenario={handleCompareScenario}
      />

      {reparentStatus === "saving" && <div className="reparent-toast reparent-toast--saving">Updating reporting line…</div>}
      {reparentStatus === "saved"  && <div className="reparent-toast reparent-toast--saved">✓ Reporting line updated</div>}
      {reparentStatus === "error"  && <div className="reparent-toast reparent-toast--error">✗ Save failed — change rolled back</div>}
    </div>
  );
};

const App = () => (
  <ReactFlowProvider>
    <AppInner />
  </ReactFlowProvider>
);

export default App;
