/**
 * @fileoverview Bridge failure simulation and connectivity analysis.
 * Analyzes the impact of closing any footbridge on festival archipelago connectivity.
 */

import { getSortedNodeIds } from './graphBuilder.js';

/**
 * Simulates closing a single bridge in the archipelago and calculates resulting components.
 * 
 * @param {import('./types.js').Graph} graph - The base festival graph (not modified)
 * @param {string} closedBridgeId - ID of the footbridge to simulate closing
 * @returns {{
 *   closedBridgeId: string,
 *   closedBridge: import('./types.js').Edge | null,
 *   isSplit: boolean,
 *   originalComponentCount: number,
 *   newComponentCount: number,
 *   components: string[][],
 *   nodeComponentMap: Record<string, number>,
 *   strandedNodeIds: string[],
 *   explanation: string
 * } | null}
 */
export function simulateBridgeClosure(graph, closedBridgeId) {
  if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
    return null;
  }

  const closedEdge = graph.edges.find((e) => e.id === closedBridgeId);
  if (!closedEdge) {
    return null;
  }

  const sortedNodeIds = getSortedNodeIds(graph);

  // 1. Calculate original components (using all edges)
  const originalComponents = computeComponents(sortedNodeIds, graph.edges);
  const originalComponentCount = originalComponents.length;

  // 2. Calculate new components with the specified bridge removed
  const remainingEdges = graph.edges.filter((e) => e.id !== closedBridgeId);
  const newComponents = computeComponents(sortedNodeIds, remainingEdges);
  const newComponentCount = newComponents.length;

  // 3. Map each node to its component index
  const nodeComponentMap = {};
  newComponents.forEach((comp, idx) => {
    comp.forEach((nodeId) => {
      nodeComponentMap[nodeId] = idx;
    });
  });

  const isSplit = newComponentCount > originalComponentCount;

  // Main component is component 0 (contains the first alphabetical root island, e.g. ISL_A)
  const strandedNodeIds = isSplit
    ? newComponents.slice(1).flat().sort()
    : [];

  let explanation = '';
  if (isSplit) {
    explanation = `CRITICAL FAILURE: Closing bridge ${closedBridgeId} (${closedEdge.from}—${closedEdge.to}) splits the festival into ${newComponentCount} disconnected zones! Islands [${strandedNodeIds.join(', ')}] are completely cut off from the main festival hub.`;
  } else {
    explanation = `SAFE CLOSURE: Closing bridge ${closedBridgeId} (${closedEdge.from}—${closedEdge.to}) does NOT split the network. The festival remains 100% connected through alternate loop paths.`;
  }

  return {
    closedBridgeId,
    closedBridge: closedEdge,
    isSplit,
    originalComponentCount,
    newComponentCount,
    components: newComponents,
    nodeComponentMap,
    strandedNodeIds,
    explanation,
  };
}

/**
 * Helper to compute connected components deterministically.
 */
function computeComponents(sortedNodeIds, edges) {
  const adj = {};
  for (const id of sortedNodeIds) {
    adj[id] = [];
  }

  for (const edge of edges) {
    if (adj[edge.from] && adj[edge.to]) {
      adj[edge.from].push(edge.to);
      adj[edge.to].push(edge.from);
    }
  }

  const visited = new Set();
  const components = [];

  for (const rootId of sortedNodeIds) {
    if (!visited.has(rootId)) {
      const comp = [];
      const queue = [rootId];
      visited.add(rootId);

      while (queue.length > 0) {
        const u = queue.shift();
        comp.push(u);

        for (const v of adj[u] || []) {
          if (!visited.has(v)) {
            visited.add(v);
            queue.push(v);
          }
        }
      }

      components.push(comp.sort());
    }
  }

  return components;
}
