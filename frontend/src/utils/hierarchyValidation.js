// src/utils/hierarchyValidation.js
// Validation helpers for drag-to-reassign manager feature
// Prevents: self-parenting, circular hierarchy

/**
 * Check if making `newManagerId` the manager of `employeeId`
 * would create a circular hierarchy.
 *
 * A circular hierarchy exists when `newManagerId` is a descendant
 * of `employeeId` (i.e., `employeeId` is already above `newManagerId`
 * in the tree). If we then make `newManagerId` the manager of
 * `employeeId`, we'd create a loop.
 *
 * @param {string} employeeId    - The employee being moved
 * @param {string} newManagerId  - The proposed new manager
 * @param {Array}  allEmployees  - Flat array of employee objects with { id, managerId }
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateReassignment(employeeId, newManagerId, allEmployees) {
  // Rule 1: Cannot report to yourself
  if (employeeId === newManagerId) {
    return { valid: false, reason: "An employee cannot report to themselves." };
  }

  // Rule 2: Check for circular hierarchy
  // Walk UP from newManagerId; if we ever reach employeeId, it's circular.
  const managerMap = {};
  for (const emp of allEmployees) {
    managerMap[emp.id] = emp.managerId;
  }

  let cursor = newManagerId;
  const visited = new Set();
  while (cursor) {
    if (visited.has(cursor)) break; // broken chain, stop
    if (cursor === employeeId) {
      return {
        valid: false,
        reason:
          "This would create a circular reporting structure. The proposed manager is currently a subordinate of this employee.",
      };
    }
    visited.add(cursor);
    cursor = managerMap[cursor];
  }

  return { valid: true };
}

/**
 * Get all descendant IDs of a given employee (including themselves).
 * Used to find what would be "orphaned" subtrees, or for UI highlighting.
 *
 * @param {string} rootId       - Starting employee ID
 * @param {Array}  allEmployees - Flat array with { id, managerId }
 * @returns {Set<string>}
 */
export function getDescendantIds(rootId, allEmployees) {
  const childrenMap = {};
  for (const emp of allEmployees) {
    if (emp.managerId) {
      if (!childrenMap[emp.managerId]) childrenMap[emp.managerId] = [];
      childrenMap[emp.managerId].push(emp.id);
    }
  }

  const result = new Set();
  const queue = [rootId];
  while (queue.length) {
    const current = queue.shift();
    result.add(current);
    const children = childrenMap[current] || [];
    queue.push(...children);
  }
  return result;
}