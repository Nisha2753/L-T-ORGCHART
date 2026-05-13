<<<<<<< HEAD
// src/components/OrgChart.jsx

import { useCallback, useRef } from "react";
import ReactFlow, {
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

import EmployeeCard from "./EmployeeCard";

const nodeTypes = { employeeCard: EmployeeCard };

export default function OrgChart({
=======
/**
 * OrgChart.jsx
 * Main org chart component using React Flow.
 * Handles rendering, layout, drag-and-drop, and zoom.
 */
import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  MiniMap,
  useReactFlow,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

import EmployeeCard from './EmployeeCard';
import { ZoomIn, ZoomOut, Maximize2, LayoutGrid } from 'lucide-react';

// Register custom node types — defined OUTSIDE component to avoid remounting
const nodeTypes = { employeeCard: EmployeeCard };

const OrgChart = ({
>>>>>>> ed8451212a7a20efc6a494620af9462aa2b382e6
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
<<<<<<< HEAD
  // New feature props
  allEmployees,
  onManagerChange,
  onDetachEmployee,
  onReattachFromParking,
  // Custom props from App.jsx that must NOT reach the ReactFlow DOM div
  filteredIds,
  onReLayout,
  staticEmployeeIds,
  searchQuery,
  selectedEmployeeId,
  // ...if App.jsx passes any other custom props, destructure them here too
  // Everything remaining is a valid ReactFlow prop
  ...rest
}) {
  const { getNodes } = useReactFlow();
  const dropTargetRef = useRef(null);

  // ─── Drag-to-reassign (within chart) ────────────────────────────────────

  const handleNodeDragStop = useCallback(
    (event, draggedNode) => {
      // Guard: skip if employee data not ready
      if (!Array.isArray(allEmployees) || allEmployees.length === 0) return;

      const allNodes = getNodes();
      const SNAP_THRESHOLD = 80;
      let closestNode = null;
      let closestDist = Infinity;

      for (const node of allNodes) {
        if (node.id === draggedNode.id) continue;
        const dx = node.position.x - draggedNode.position.x;
        const dy = node.position.y - draggedNode.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < SNAP_THRESHOLD && dist < closestDist) {
          closestDist = dist;
          closestNode = node;
        }
      }

      if (!closestNode) return; // dropped in empty space — just repositioning

      const employeeId = draggedNode.id;
      const newManagerId = closestNode.id;

      // Only block self-parenting (an employee cannot report to themselves)
      if (employeeId === newManagerId) {
        showValidationToast("An employee cannot report to themselves.");
        return;
      }

      onManagerChange(employeeId, newManagerId);
    },
    [getNodes, allEmployees, onManagerChange]
  );

  // ─── Drop from parking lot (HTML5 drag-and-drop) ─────────────────────────

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      const raw = event.dataTransfer.getData("application/parked-employee");
      if (!raw) return;

      let parkedEmployee;
      try {
        parkedEmployee = JSON.parse(raw);
      } catch {
        return;
      }

      const allNodes = getNodes();
      const canvas = event.currentTarget.getBoundingClientRect();
      const mouseX = event.clientX - canvas.left;
      const mouseY = event.clientY - canvas.top;

      let dropTarget = null;
      let minDist = Infinity;
      for (const node of allNodes) {
        const dx = node.position.x + 100 - mouseX;
        const dy = node.position.y + 50 - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100 && dist < minDist) {
          minDist = dist;
          dropTarget = node;
        }
      }

      if (!dropTarget) {
        showValidationToast("Drop onto an employee card to set their reporting manager.");
        return;
      }

      const newManagerId = dropTarget.id;

      if (parkedEmployee.id === newManagerId) {
        showValidationToast("An employee cannot report to themselves.");
        return;
      }

      onReattachFromParking(parkedEmployee, newManagerId);
    },
    [getNodes, onReattachFromParking]
  );

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  // ─── Enrich nodes with onDetach + id ─────────────────────────────────────

  const enrichedNodes = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onDetach: onDetachEmployee,
      id: node.id,
    },
  }));

  return (
    <div
      style={{ width: "100%", height: "100%" }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <ReactFlow
        nodes={enrichedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        {...rest}
      >
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const level = node.data?.hierarchyLevel;
            const colors = { 1: "#F59E0B", 2: "#3B82F6", 3: "#06B6D4", 4: "#22C55E" };
            return colors[level] || "#94A3B8";
          }}
          style={{ bottom: 20, right: 20 }}
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#E2E8F0" />
      </ReactFlow>
    </div>
  );
}

// ─── Toast helper ────────────────────────────────────────────────────────────

function showValidationToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#1E293B",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 500,
    zIndex: 9999,
    boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
    maxWidth: "400px",
    textAlign: "center",
    lineHeight: 1.4,
    borderLeft: "4px solid #EF4444",
  });
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s";
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 3500);
}
=======
  selectedEmployeeId,
  searchQuery,
  filteredIds,
  onReLayout,
  staticEmployeeIds = [],
}) => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  // Annotate nodes with selection/highlight/dimmed states
  // const annotatedNodes = useMemo(() => {
  //   const hasFilter = searchQuery || (filteredIds && filteredIds.length > 0);
  //   return nodes.map(node => ({
  //     ...node,
  //     data: {
  //       ...node.data,
  //       isHighlighted: filteredIds?.includes(node.id),
  //       isDimmed: hasFilter && !filteredIds?.includes(node.id),
  //       onClick: undefined,  // handled by ReactFlow's onNodeClick above
  //     },
  //     selected: node.id === selectedEmployeeId,
  //     className: node.id === selectedEmployeeId ? 'selected' : '',
  //   }));
  // }, [nodes, selectedEmployeeId, filteredIds, searchQuery, onNodeClick]);


  const annotatedNodes = useMemo(() => {
  const hasFilter = searchQuery || (filteredIds && filteredIds.length > 0);
  return nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      isHighlighted: filteredIds?.includes(node.id),
      isDimmed: hasFilter && !filteredIds?.includes(node.id),
      isStatic: staticEmployeeIds?.includes(node.id),  // ← ADD THIS
      onClick: undefined,
    },
    selected: node.id === selectedEmployeeId,
  }));
}, [nodes, selectedEmployeeId, filteredIds, searchQuery, staticEmployeeIds]);
  const handleFitView = useCallback(() => {
    fitView({ padding: 0.15, duration: 600 });
  }, [fitView]);

  // Minimap node color based on level
  const minimapNodeColor = useCallback((node) => {
    const colors = ['#f59e0b', '#4f6ef7', '#06b6d4', '#10b981'];
    return colors[node.data?.level ?? 3] || '#4b5563';
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={annotatedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => onNodeClick(node.id)}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.2}
        maxZoom={1.8}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
        deleteKeyCode={null}
        style={{ background: 'var(--bg-base)' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1.2}
          color="rgba(255,255,255,0.06)"
        />

        <MiniMap
          nodeColor={minimapNodeColor}
          maskColor="rgba(240, 244, 248, 0.85)"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
          }}
        />

        {/* Custom zoom controls panel */}
        <Panel position="bottom-right" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button className="zoom-btn" onClick={() => zoomIn({ duration: 300 })} title="Zoom In">
            <ZoomIn size={15} />
          </button>
          <button className="zoom-btn" onClick={() => zoomOut({ duration: 300 })} title="Zoom Out">
            <ZoomOut size={15} />
          </button>
          <button className="zoom-btn" onClick={handleFitView} title="Fit View">
            <Maximize2 size={15} />
          </button>
          <button className="zoom-btn" onClick={onReLayout} title="Auto Layout">
            <LayoutGrid size={15} />
          </button>
        </Panel>
      </ReactFlow>

      {/* Legend */}
      <div className="legend">
        <div className="legend-title">Hierarchy Level</div>
        {[
          { label: 'C-Suite', color: '#f59e0b' },
          { label: 'Vice President', color: '#4f6ef7' },
          { label: 'Manager', color: '#06b6d4' },
          { label: 'Executive', color: '#10b981' },
        ].map(item => (
          <div className="legend-item" key={item.label}>
            <div className="legend-dot" style={{ background: item.color }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrgChart;
>>>>>>> ed8451212a7a20efc6a494620af9462aa2b382e6
