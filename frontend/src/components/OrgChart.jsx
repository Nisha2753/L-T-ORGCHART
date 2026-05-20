/**
 * OrgChart.jsx
 * Main org chart component using React Flow.
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

// Register custom node types
const nodeTypes = {
  employeeCard: EmployeeCard,
};

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
  staticEmployeeIds = [],
}) => {

  const { zoomIn, zoomOut, fitView } = useReactFlow();

  // Annotate nodes
  const annotatedNodes = useMemo(() => {

    const hasFilter =
      searchQuery || (filteredIds && filteredIds.length > 0);

    return nodes.map(node => ({
      ...node,

      data: {
        ...node.data,

        isHighlighted: filteredIds?.includes(node.id),

        isDimmed:
          hasFilter && !filteredIds?.includes(node.id),

        isStatic:
          staticEmployeeIds?.includes(node.id),

        onClick: undefined,
      },

      selected: node.id === selectedEmployeeId,
    }));

  }, [
    nodes,
    selectedEmployeeId,
    filteredIds,
    searchQuery,
    staticEmployeeIds,
  ]);

  const handleFitView = useCallback(() => {

    fitView({
      padding: 0.15,
      duration: 600,
    });

  }, [fitView]);

  // Minimap colors
  const minimapNodeColor = useCallback((node) => {

    const colors = [
      '#f59e0b',
      '#4f6ef7',
      '#06b6d4',
      '#10b981',
    ];

    return colors[node.data?.level ?? 3] || '#4b5563';

  }, []);

  return (

    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >

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

        {/* Controls */}
        <Panel
          position="bottom-right"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >

          <button
            className="zoom-btn"
            onClick={() => zoomIn({ duration: 300 })}
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>

          <button
            className="zoom-btn"
            onClick={() => zoomOut({ duration: 300 })}
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>

          <button
            className="zoom-btn"
            onClick={handleFitView}
            title="Fit View"
          >
            <Maximize2 size={15} />
          </button>

          <button
            className="zoom-btn"
            onClick={onReLayout}
            title="Auto Layout"
          >
            <LayoutGrid size={15} />
          </button>

        </Panel>

      </ReactFlow>

      {/* Legend */}
      <div className="legend">

        <div className="legend-title">
          Hierarchy Level
        </div>

        {[
          { label: 'C-Suite', color: '#f59e0b' },
          { label: 'Vice President', color: '#4f6ef7' },
          { label: 'Manager', color: '#06b6d4' },
          { label: 'Executive', color: '#10b981' },
        ].map(item => (

          <div
            className="legend-item"
            key={item.label}
          >

            <div
              className="legend-dot"
              style={{ background: item.color }}
            />

            {item.label}

          </div>

        ))}

      </div>

    </div>
  );
};

export default OrgChart;