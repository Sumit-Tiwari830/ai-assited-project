/**
 * @fileoverview Graph validation logic for Treasure-Island Bridge Safety Map.
 * Conforms to SPR26_D2_P01 specifications.
 */

/**
 * Regular expression for valid Node and Edge IDs:
 * Starts with an uppercase ASCII letter, followed by 0-15 uppercase letters, digits, underscores, or hyphens.
 */
export const ID_REGEX = /^[A-Z][A-Z0-9_-]{0,15}$/;

export const LIMITS = {
  MIN_NODES: 1,
  MAX_NODES: 12,
  MIN_EDGES: 0,
  MAX_EDGES: 20,
  MIN_COORD: 0,
  MAX_COORD: 100,
};

/**
 * Validates the complete graph structure, endpoints, and coordinate ranges before traversal.
 * 
 * @param {import('./types.js').Graph} graph - The graph to validate
 * @returns {{ isValid: boolean, error: string | null, errors: string[] }}
 */
export function validateGraph(graph) {
  const errors = [];

  if (!graph || typeof graph !== 'object') {
    return {
      isValid: false,
      error: 'Graph definition must be an object with nodes and edges arrays.',
      errors: ['Graph definition must be an object with nodes and edges arrays.'],
    };
  }

  // --- 1. Node Array & Count Validation ---
  if (!Array.isArray(graph.nodes)) {
    errors.push("Graph 'nodes' must be an array.");
  } else if (graph.nodes.length < LIMITS.MIN_NODES || graph.nodes.length > LIMITS.MAX_NODES) {
    errors.push(
      `Graph must contain between ${LIMITS.MIN_NODES} and ${LIMITS.MAX_NODES} nodes (found ${graph.nodes.length}).`
    );
  }

  // --- 2. Edge Array & Count Validation ---
  if (!Array.isArray(graph.edges)) {
    errors.push("Graph 'edges' must be an array.");
  } else if (graph.edges.length < LIMITS.MIN_EDGES || graph.edges.length > LIMITS.MAX_EDGES) {
    errors.push(
      `Graph must contain between ${LIMITS.MIN_EDGES} and ${LIMITS.MAX_EDGES} edges (found ${graph.edges.length}).`
    );
  }

  // If top-level array checks failed, return early
  if (errors.length > 0 && (!Array.isArray(graph.nodes) || !Array.isArray(graph.edges))) {
    return {
      isValid: false,
      error: errors[0],
      errors,
    };
  }

  // --- 3. Individual Node Validation ---
  const seenNodeIds = new Set();

  for (let i = 0; i < graph.nodes.length; i++) {
    const node = graph.nodes[i];
    const nodePrefix = `Node at index ${i}`;

    if (!node || typeof node !== 'object') {
      errors.push(`${nodePrefix} is invalid or not an object.`);
      continue;
    }

    // Node ID format
    if (!node.id || typeof node.id !== 'string' || !ID_REGEX.test(node.id)) {
      errors.push(
        `Invalid node ID '${node.id || ''}'. Node ID must match ^[A-Z][A-Z0-9_-]{0,15}$.`
      );
    } else if (seenNodeIds.has(node.id)) {
      // Duplicate Node ID
      errors.push(`Duplicate node ID '${node.id}'. Node IDs must be unique.`);
    } else {
      seenNodeIds.add(node.id);
    }

    const currentId = node.id || nodePrefix;

    // Display Name
    if (typeof node.name !== 'string' || node.name.trim() === '') {
      errors.push(`Node '${currentId}' must have a non-empty display name.`);
    }

    // Coordinates (x, y)
    if (typeof node.x !== 'number' || !Number.isFinite(node.x) || node.x < LIMITS.MIN_COORD || node.x > LIMITS.MAX_COORD) {
      errors.push(
        `Node '${currentId}' has invalid x-coordinate (${node.x}). Coordinate must be a finite number between ${LIMITS.MIN_COORD} and ${LIMITS.MAX_COORD}.`
      );
    }

    if (typeof node.y !== 'number' || !Number.isFinite(node.y) || node.y < LIMITS.MIN_COORD || node.y > LIMITS.MAX_COORD) {
      errors.push(
        `Node '${currentId}' has invalid y-coordinate (${node.y}). Coordinate must be a finite number between ${LIMITS.MIN_COORD} and ${LIMITS.MAX_COORD}.`
      );
    }
  }

  // --- 4. Individual Edge Validation ---
  const seenEdgeIds = new Set();
  const seenConnections = new Set();

  for (let i = 0; i < graph.edges.length; i++) {
    const edge = graph.edges[i];
    const edgePrefix = `Edge at index ${i}`;

    if (!edge || typeof edge !== 'object') {
      errors.push(`${edgePrefix} is invalid or not an object.`);
      continue;
    }

    // Edge ID format
    if (!edge.id || typeof edge.id !== 'string' || !ID_REGEX.test(edge.id)) {
      errors.push(
        `Invalid edge ID '${edge.id || ''}'. Edge ID must match ^[A-Z][A-Z0-9_-]{0,15}$.`
      );
    } else if (seenEdgeIds.has(edge.id)) {
      // Duplicate Edge ID
      errors.push(`Duplicate edge ID '${edge.id}'. Edge IDs must be unique.`);
    } else {
      seenEdgeIds.add(edge.id);
    }

    const currentEdgeId = edge.id || edgePrefix;

    // Check endpoints exist
    const hasFrom = typeof edge.from === 'string' && seenNodeIds.has(edge.from);
    const hasTo = typeof edge.to === 'string' && seenNodeIds.has(edge.to);

    if (!edge.from || typeof edge.from !== 'string') {
      errors.push(`Edge '${currentEdgeId}' is missing a valid 'from' endpoint ID.`);
    } else if (!seenNodeIds.has(edge.from)) {
      errors.push(`Edge '${currentEdgeId}' references unknown endpoint node '${edge.from}'.`);
    }

    if (!edge.to || typeof edge.to !== 'string') {
      errors.push(`Edge '${currentEdgeId}' is missing a valid 'to' endpoint ID.`);
    } else if (!seenNodeIds.has(edge.to)) {
      errors.push(`Edge '${currentEdgeId}' references unknown endpoint node '${edge.to}'.`);
    }

    // Self-loop check
    if (edge.from && edge.to && edge.from === edge.to) {
      errors.push(`Edge '${currentEdgeId}' is a self-loop on node '${edge.from}'. Self-loops are invalid.`);
    }

    // Duplicate connection check (undirected unordered pair)
    if (hasFrom && hasTo && edge.from !== edge.to) {
      const canonicalPair = edge.from < edge.to ? `${edge.from}---${edge.to}` : `${edge.to}---${edge.from}`;
      if (seenConnections.has(canonicalPair)) {
        errors.push(
          `Edge '${currentEdgeId}' creates a duplicate connection between '${edge.from}' and '${edge.to}'. Parallel edges are invalid.`
        );
      } else {
        seenConnections.add(canonicalPair);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    error: errors.length > 0 ? errors[0] : null,
    errors,
  };
}
