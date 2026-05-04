/**
 * App.jsx - Root application component
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { ReactFlowProvider, useNodesState, useEdgesState } from "reactflow";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import ProfileMenu from "./components/ProfileMenu";

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

const AppInner = () => {
  const [allEmployees, setAllEmployees]         = useState([]);
  const [departments, setDepartments]           = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState(null);
  const [refreshing, setRefreshing]             = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery]           = useState("");
  const [selectedDept, setSelectedDept]         = useState("");

  // localEdits: stores edited field values per employee { [empId]: { field: value } }
  const [localEdits, setLocalEdits] = useState({});

  // staticNewEmployees: new cards added locally, never sent to backend
  const [staticNewEmployees, setStaticNewEmployees] = useState([]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [currentUser, setCurrentUser] = useState(() => {
  // Persist login across page refresh
  const saved = sessionStorage.getItem("lt_orgchart_user");
  
  return saved ? JSON.parse(saved) : null;

});

const handleLogin = (user) => {
  sessionStorage.setItem("lt_orgchart_user", JSON.stringify(user));
  setCurrentUser(user);
};

const handleLogout = () => {
  sessionStorage.removeItem("lt_orgchart_user");
  setCurrentUser(null);
};
  // ── Load data ────────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const [emps, depts] = await Promise.all([
        getAllEmployees(),
        getDepartments(),
      ]);
      setAllEmployees(emps);
      setDepartments(depts);
      const { nodes: n, edges: e } = buildFlowElements([...emps, ...staticNewEmployees]);
      setNodes(n);
      setEdges(e);
    } catch (err) {
      setError(err.message || "Failed to load org data. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [setNodes, setEdges, staticNewEmployees]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Rebuild chart when new static employees are added ─────────────────────
  useEffect(() => {
    if (allEmployees.length > 0) {
      const combined = [...allEmployees, ...staticNewEmployees];
      const { nodes: n, edges: e } = buildFlowElements(combined);
      setNodes(n);
      setEdges(e);
    }
  }, [staticNewEmployees, allEmployees]);


  // ── Sync localEdits into node data so tree cards update live ──────────────────
useEffect(() => {
  setNodes(prevNodes =>
    prevNodes.map(node => {
      const edits = localEdits[node.id];
      if (!edits) return node;
      return {
        ...node,
        data: {
          ...node.data,
          // Reflect edited fields into card display
          name:        edits.name        ?? node.data.name,
          designation: edits.jobTitle    ?? node.data.designation,
          department:  edits.department  ?? node.data.department,
          location:    edits.location    ?? node.data.location,
          // Recalculate avatar initials if name changed
          avatar: edits.name
            ? edits.name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || "").join("")
            : node.data.avatar,
        },
      };
    })
  );
}, [localEdits]);
  // ── Refresh from SuccessFactors ───────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshOrgData();
      setTimeout(async () => {
        await loadData();
        setRefreshing(false);
      }, 2000);
    } catch (err) {
      console.error("Refresh failed:", err.message);
      setRefreshing(false);
    }
  }, [loadData]);

  // ── Local field edit handler ──────────────────────────────────────────────
  // Called from EmployeeDetailsPanel when user edits a field
  // const handleLocalEdit = useCallback((empId, field, value) => {
  //   setLocalEdits(prev => ({
  //     ...prev,
  //     [empId]: { ...(prev[empId] || {}), [field]: value },
  //   }));
  // }, []);

  const handleLocalEdit = useCallback((empId, field, value) => {
  setLocalEdits(prev => {
    const existing = prev[empId] || {};

    // If value is undefined, remove that field (used by reset)
    if (value === undefined) {
      const updated = { ...existing };
      delete updated[field];
      // If no edits left, remove the employee entry entirely
      if (Object.keys(updated).length === 0) {
        const all = { ...prev };
        delete all[empId];
        return all;
      }
      return { ...prev, [empId]: updated };
    }

    return {
      ...prev,
      [empId]: { ...existing, [field]: value },
    };
  });
}, []);

  // ── Add new static employee ───────────────────────────────────────────────
  const handleAddEmployee = useCallback((newEmp) => {
    setStaticNewEmployees(prev => [...prev, newEmp]);
  }, []);

  // ── Delete static employee ────────────────────────────────────────────────
  const handleDeleteStaticEmployee = useCallback((empId) => {
    setStaticNewEmployees(prev => prev.filter(e => e.id !== empId));
    setSelectedEmployee(null);
  }, []);


  // ── Download all data as Excel ────────────────────────────────────────────────
const handleDownload = useCallback(() => {
  exportToExcel(
    [...allEmployees, ...staticNewEmployees],  // all positions including local
    localEdits,                                 // any local field edits
    staticNewEmployees.map(e => e.id),          // IDs of local-only cards
    `LT_OrgChart_${new Date().toISOString().slice(0, 10)}.xlsx`
  );
}, [allEmployees, staticNewEmployees, localEdits]);

  // ── Search + filter ───────────────────────────────────────────────────────
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

  // ── Node click ────────────────────────────────────────────────────────────
  const handleNodeClick = useCallback((empId) => {
    const combined = [...allEmployees, ...staticNewEmployees];
    const emp = combined.find((e) => e.id === empId);
    setSelectedEmployee((prev) => (prev?.id === empId ? null : emp));
  }, [allEmployees, staticNewEmployees]);

  const handleClosePanel   = useCallback(() => setSelectedEmployee(null), []);
  const handleSearchChange = useCallback((val) => setSearchQuery(val), []);
  const handleSearchClear  = useCallback(() => setSearchQuery(""), []);
  const handleDeptChange   = useCallback((val) => setSelectedDept(val), []);

  const handleReLayout = useCallback(() => {
    const { nodes: n, edges: e } = applyDagreLayout(nodes, edges);
    setNodes(n);
    setEdges(e);
  }, [nodes, edges, setNodes, setEdges]);

  // ── Merge localEdits into selectedEmployee before passing to panel ─────────
  const selectedWithEdits = useMemo(() => {
    if (!selectedEmployee) return null;
    const edits = localEdits[selectedEmployee.id] || {};
    return { ...selectedEmployee, ...edits };
  }, [selectedEmployee, localEdits]);

  const uniqueDepts = useMemo(
    () => [...new Set(
      [...allEmployees, ...staticNewEmployees].map((e) => e.department).filter(Boolean)
    )],
    [allEmployees, staticNewEmployees]
  );

  const isStaticEmployee = useCallback((empId) =>
    staticNewEmployees.some(e => e.id === empId),
  [staticNewEmployees]);

  const panelOpen = !!selectedEmployee;
if (!currentUser) {
  return <LoginPage onLogin={handleLogin} />;
}


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
              <div style={{ color: "#64748b", fontSize: 13, maxWidth: 380, textAlign: "center", lineHeight: 1.6 }}>
                {error}
              </div>
              <button onClick={loadData} style={{
                marginTop: 16, padding: "9px 24px", background: "#1a3a6b",
                color: "white", border: "none", borderRadius: 8,
                cursor: "pointer", fontSize: 13, fontWeight: 600,
                fontFamily: "var(--font-body)",
              }}>
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
              onNodeClick={handleNodeClick}
              selectedEmployeeId={selectedEmployee?.id}
              searchQuery={searchQuery}
              filteredIds={filteredIds}
              onReLayout={handleReLayout}
              staticEmployeeIds={staticNewEmployees.map(e => e.id)}
            />
          )}

          {!loading && !error && filteredIds && filteredIds.length === 0 && (
            <div className="empty-state">
              <svg className="empty-state-icon" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" />
                <circle cx="24" cy="20" r="7" stroke="currentColor" strokeWidth="2" opacity="0.5" />
                <path d="M10 38c0-7.732 6.268-14 14-14s14 6.268 14 14"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
              </svg>
              <div className="empty-state-text">No positions match your search</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>Try a different name, code, or department</div>
            </div>
          )}
        </div>

        <EmployeeDetailsPanel
          employee={selectedWithEdits}
          allEmployees={[...allEmployees, ...staticNewEmployees]}
          onClose={handleClosePanel}
          onRefresh={USE_API ? handleRefresh : null}
          onLocalEdit={handleLocalEdit}
          isStatic={selectedEmployee ? isStaticEmployee(selectedEmployee.id) : false}
          onDeleteStatic={handleDeleteStaticEmployee}
          localEdits={localEdits[selectedEmployee?.id] || {}}
        />
      </div>
    </div>
  );
};

const App = () => (
  <ReactFlowProvider><AppInner /></ReactFlowProvider>
);

export default App;