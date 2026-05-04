/**
 * hierarchyBuilder.js
 * 
 * Utility functions for building the org chart hierarchy
 * from flat employee data. Uses Dagre for automatic layout.
 */

import dagre from 'dagre';

const NODE_WIDTH = 280;
const NODE_HEIGHT = 140;
const RANK_SEPARATION = 80;
const NODE_SEPARATION = 40;

/**
 * Build a tree structure from flat employee array
 * @param {Array} employees - Flat list of employees
 * @returns {Object} Tree root node with children
 */
export const buildHierarchyTree = (employees) => {
  const map = {};
  employees.forEach(emp => { map[emp.id] = { ...emp, children: [] }; });

  const roots = [];
  employees.forEach(emp => {
    if (emp.managerId && map[emp.managerId]) {
      map[emp.managerId].children.push(map[emp.id]);
    } else {
      roots.push(map[emp.id]);
    }
  });

  return roots.length === 1 ? roots[0] : { id: 'root', name: 'Organisation', children: roots };
};

/**
 * Convert flat employees to React Flow nodes and edges
 * with automatic Dagre layout.
 * @param {Array} employees
 * @returns {{ nodes: Array, edges: Array }}
 */
export const buildFlowElements = (employees) => {
  if (!employees || employees.length === 0) return { nodes: [], edges: [] };

  // Build manager lookup
  const managerNames = {};
  employees.forEach(emp => { managerNames[emp.id] = emp.name; });

  // Create nodes
  const nodes = employees.map(emp => ({
    id: emp.id,
    type: 'employeeCard',
    data: {
      ...emp,
      managerName: emp.managerId ? managerNames[emp.managerId] : null,
    },
    position: { x: 0, y: 0 }, // will be set by dagre
    draggable: true,
  }));

  // Create edges
  const edges = employees
    .filter(emp => emp.managerId)
    .map(emp => ({
      id: `e-${emp.managerId}-${emp.id}`,
      source: emp.managerId,
      target: emp.id,
      type: 'smoothstep',
      animated: false,
      style: {
        stroke: 'rgba(59, 91, 219, 0.35)',
        strokeWidth: 2,
      },
      markerEnd: {
        type: 'arrowclosed',
        color: 'rgba(59, 91, 219, 0.5)',
      },
    }));

  // Apply Dagre layout
  const layouted = applyDagreLayout(nodes, edges);
  return layouted;
};

/**
 * Apply Dagre auto-layout to position nodes
 */
export const applyDagreLayout = (nodes, edges) => {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: 'TB',
    ranksep: RANK_SEPARATION,
    nodesep: NODE_SEPARATION,
    edgesep: 20,
    marginx: 40,
    marginy: 40,
  });

  nodes.forEach(node => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach(edge => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map(node => {
    const nodeWithPosition = g.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

/**
 * Get all ancestors of an employee
 */
export const getAncestors = (employeeId, employees) => {
  const map = {};
  employees.forEach(e => { map[e.id] = e; });

  const ancestors = [];
  let current = map[employeeId];
  while (current && current.managerId) {
    current = map[current.managerId];
    if (current) ancestors.unshift(current);
  }
  return ancestors;
};

/**
 * Get all descendants of an employee
 */
export const getDescendants = (employeeId, employees) => {
  const result = [];
  const queue = [employeeId];
  while (queue.length > 0) {
    const currentId = queue.shift();
    const children = employees.filter(e => e.managerId === currentId);
    children.forEach(child => {
      result.push(child);
      queue.push(child.id);
    });
  }
  return result;
};

/**
 * Filter employees and their ancestors for search
 */
export const filterWithContext = (employees, matchedIds) => {
  const set = new Set(matchedIds);
  // Also include ancestors so hierarchy stays connected
  matchedIds.forEach(id => {
    const ancestors = getAncestors(id, employees);
    ancestors.forEach(a => set.add(a.id));
  });
  return employees.filter(e => set.has(e.id));
};

export default {
  buildHierarchyTree,
  buildFlowElements,
  applyDagreLayout,
  getAncestors,
  getDescendants,
  filterWithContext,
};
