/**
 * OrgChart.jsx
 *
 * KEY FIX: Replaced manual bounding-box overlap (which reads stale `nodes`
 * state) with React Flow's built-in getIntersectingNodes() which reads
 * directly from React Flow's internal store — always accurate during drag.
 *
 * The manual approach failed because:
 *   - `nodes` prop is React state, updated AFTER render
 *   - During drag, React Flow moves the node in its OWN Zustand store
 *   - So `nodes` is always one frame behind the actual dragged position
 *   - getIntersectingNodes() bypasses React state entirely and reads the
 *     internal store directly — this is the officially supported API
 */

import { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  MiniMap,
  useReactFlow,
  Panel,
} from "reactflow";

import "reactflow/dist/style.css";

import EmployeeCard from "./EmployeeCard";
import { ZoomIn, ZoomOut, Maximize2, LayoutGrid } from "lucide-react";

const nodeTypes = { employeeCard: EmployeeCard };

const OrgChart = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  selectedEmployeeId,
  searchQuery,
  filteredIds,
  onReLayout,
  onReparent,
  isDraggingRef,
  staticEmployeeIds = [],
  // existing props — kept so nothing breaks
  allEmployees,
  onManagerChange,
  onDetachEmployee,
  onReattachFromParking,
}) => {
  // getIntersectingNodes reads React Flow's internal store — not stale state
  const { zoomIn, zoomOut, fitView, getIntersectingNodes } = useReactFlow();

  const [dropTargetId, setDropTargetId] = useState(null);

  // ── Annotate nodes ──────────────────────────────────────────────────────
  const annotatedNodes = useMemo(() => {
    const hasFilter = searchQuery || (filteredIds && filteredIds.length > 0);
    return nodes.map((node) => ({
      ...node,
      draggable: true,
      data: {
        ...node.data,
        isHighlighted: filteredIds?.includes(node.id),
        isDimmed:      hasFilter && !filteredIds?.includes(node.id),
        isStatic:      staticEmployeeIds?.includes(node.id),
        isDropTarget:  node.id === dropTargetId,
        onClick:       undefined,
      },
      selected: node.id === selectedEmployeeId,
    }));
  }, [nodes, selectedEmployeeId, filteredIds, searchQuery, staticEmployeeIds, dropTargetId]);

  // ── onNodeDragStart — mark dragging ────────────────────────────────────
  const handleNodeDragStart = useCallback(() => {
    if (isDraggingRef) isDraggingRef.current = true;
  }, [isDraggingRef]);

  // ── onNodeDrag — highlight the node currently under the dragged card ───
  const handleNodeDrag = useCallback(
    (_evt, draggedNode) => {
      // getIntersectingNodes uses React Flow's internal store — always correct
      const hits = getIntersectingNodes(draggedNode);
      if (hits.length > 0) {
        // Pick closest by center distance
        const best = hits.reduce((a, b) => {
          const da = Math.hypot(
            (a.position.x + (a.width  ?? 280) / 2) - (draggedNode.position.x + (draggedNode.width  ?? 280) / 2),
            (a.position.y + (a.height ?? 140) / 2) - (draggedNode.position.y + (draggedNode.height ?? 140) / 2)
          );
          const db = Math.hypot(
            (b.position.x + (b.width  ?? 280) / 2) - (draggedNode.position.x + (draggedNode.width  ?? 280) / 2),
            (b.position.y + (b.height ?? 140) / 2) - (draggedNode.position.y + (draggedNode.height ?? 140) / 2)
          );
          return da < db ? a : b;
        });
        setDropTargetId(best.id);
      } else {
        setDropTargetId(null);
      }
    },
    [getIntersectingNodes]
  );

  // ── onNodeDragStop — fire reparent if valid target found ───────────────
  const handleNodeDragStop = useCallback(
    (_evt, draggedNode) => {
      // Clear dragging flag FIRST so App.jsx useEffect can run after reparent
      if (isDraggingRef) isDraggingRef.current = false;

      const hits = getIntersectingNodes(draggedNode);

      if (hits.length > 0 && onReparent) {
        // Pick closest
        const target = hits.reduce((a, b) => {
          const da = Math.hypot(
            (a.position.x + (a.width  ?? 280) / 2) - (draggedNode.position.x + (draggedNode.width  ?? 280) / 2),
            (a.position.y + (a.height ?? 140) / 2) - (draggedNode.position.y + (draggedNode.height ?? 140) / 2)
          );
          const db = Math.hypot(
            (b.position.x + (b.width  ?? 280) / 2) - (draggedNode.position.x + (draggedNode.width  ?? 280) / 2),
            (b.position.y + (b.height ?? 140) / 2) - (draggedNode.position.y + (draggedNode.height ?? 140) / 2)
          );
          return da < db ? a : b;
        });

        // Skip if already this node's parent
        const currentEdge    = edges.find((e) => e.target === draggedNode.id);
        const currentParentId = currentEdge?.source ?? null;

        if (target.id !== draggedNode.id && target.id !== currentParentId) {
          onReparent(draggedNode.id, target.id);
        }
      }

      setDropTargetId(null);
    },
    [getIntersectingNodes, edges, onReparent, isDraggingRef]
  );

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.15, duration: 600 });
  }, [fitView]);

  const minimapNodeColor = useCallback((node) => {
    const colors = ["#f59e0b", "#4f6ef7", "#06b6d4", "#10b981"];
    return colors[node.data?.level ?? 3] || "#4b5563";
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <ReactFlow
        nodes={annotatedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => onNodeClick(node.id)}
        onNodeDragStart={handleNodeDragStart}
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={nodeTypes}
        nodesDraggable={true}
        selectNodesOnDrag={false}
        nodesConnectable={false}
        elementsSelectable={true}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.2}
        maxZoom={1.8}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
        deleteKeyCode={null}
        style={{ background: "var(--bg-base)" }}
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
          style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px" }}
        />

        <Panel position="bottom-right" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
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

      {/* Drop hint banner — shows while hovering a valid target */}
      {dropTargetId && (
        <div style={{
          position: "absolute", top: 12, left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(79,110,247,0.93)", color: "#fff",
          padding: "6px 18px", borderRadius: 8, fontSize: 13,
          fontWeight: 600, pointerEvents: "none", zIndex: 10,
          boxShadow: "0 2px 12px rgba(0,0,0,0.18)", letterSpacing: "0.01em",
        }}>
          Release to move under this card
        </div>
      )}

      {/* Legend */}
      <div className="legend">
        <div className="legend-title">Hierarchy Level</div>
        {[
          { label: "C-Suite",        color: "#f59e0b" },
          { label: "Vice President", color: "#4f6ef7" },
          { label: "Manager",        color: "#06b6d4" },
          { label: "Executive",      color: "#10b981" },
        ].map((item) => (
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
