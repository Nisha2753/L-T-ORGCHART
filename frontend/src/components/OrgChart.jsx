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
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
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