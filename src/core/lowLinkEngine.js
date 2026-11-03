/**
 * @fileoverview Low-link Depth-First Search traversal engine for bridges and articulation points
 * with deterministic replay event logging.
 * Conforms to SPR26_D2_P01 specifications.
 */

import { getSortedNodeIds, buildAdjacencyList } from './graphBuilder.js';

/**
 * Runs a deterministic low-link DFS traversal across all components,
 * recording an ordered sequence of explanatory replay events.
 * 
 * Algorithm contracts:
 * - One zero-based discovery clock across all components.
 * - Nodes and unvisited roots explored in ascending ASCII ID order.
 * - Neighbors visited in ascending ASCII ID order.
 * - Discovery & low values assigned on first reach.
 * - Back-edges update: low[u] = min(low[u], discovery[neighbor]).
 * - Tree-edges update: low[u] = min(low[u], low[child]).
 * - Bridge rule: low[child] > discovery[u] (strict inequality).
 * - Articulation rule:
 *     - Non-root: at least one child has low[child] >= discovery[u].
 *     - Root: has at least two DFS-tree children.
 * - Results sorted in ascending ASCII order.
 * 
 * @param {import('./types.js').Graph} graph
 * @returns {{
 *   discovery: Record<string, number>,
 *   low: Record<string, number>,
 *   parent: Record<string, string | null>,
 *   discoveryOrder: string[],
 *   bridges: string[],
 *   articulationPoints: string[],
 *   componentCount: number,
 *   treeChildrenCount: Record<string, number>,
 *   events: import('./types.js').ReplayEvent[]
 * }}
 */
export function runLowLinkDFS(graph) {
  const sortedNodeIds = getSortedNodeIds(graph);
  const adjacency = buildAdjacencyList(graph);

  let clock = 0;
  const discovery = {};
  const low = {};
  const parent = {};
  const treeChildrenCount = {};
  const discoveryOrder = [];

  const bridgeIds = [];
  const articulationNodeIds = new Set();
  let componentCount = 0;

  /** @type {import('./types.js').ReplayEvent[]} */
  const events = [];

  /**
   * Helper to append an immutable event to the deterministic replay log.
   */
  function emitEvent(eventData) {
    events.push({
      stepIndex: events.length,
      ...eventData,
    });
  }

  /**
   * Internal recursive DFS traversal.
   * 
   * @param {string} u - Current node ID
   * @param {string | null} p - Parent node ID (null for component roots)
   */
  function dfs(u, p) {
    discovery[u] = clock;
    low[u] = clock;
    clock++;

    parent[u] = p;
    treeChildrenCount[u] = 0;
    discoveryOrder.push(u);

    // 1. Record Node Discovery
    emitEvent({
      type: 'DISCOVER_NODE',
      nodeId: u,
      targetNodeId: null,
      edgeId: null,
      edgeKind: null,
      clock: discovery[u],
      oldLow: null,
      newLow: low[u],
      conditionMet: null,
      explanation: `Discovered island ${u}. Assigned discovery clock = ${discovery[u]} and initial low-link = ${low[u]}.`,
    });

    const neighbors = adjacency[u] || [];

    for (const { to: v, edgeId } of neighbors) {
      if (v === p) {
        // Skip direct parent edge in undirected graph
        emitEvent({
          type: 'INSPECT_EDGE',
          nodeId: u,
          targetNodeId: v,
          edgeId,
          edgeKind: 'PARENT',
          clock,
          oldLow: low[u],
          newLow: low[u],
          conditionMet: null,
          explanation: `Inspecting bridge ${edgeId} connecting ${u} to ${v}. Island ${v} is the parent island in the DFS tree; skipping to prevent immediate backtracking.`,
        });
        continue;
      }

      if (discovery[v] !== undefined) {
        // 2. Back-edge to an already visited neighbor/ancestor
        emitEvent({
          type: 'INSPECT_EDGE',
          nodeId: u,
          targetNodeId: v,
          edgeId,
          edgeKind: 'BACK',
          clock,
          oldLow: low[u],
          newLow: low[u],
          conditionMet: null,
          explanation: `Inspecting bridge ${edgeId} connecting ${u} to ${v}. Island ${v} was already visited (discovery[${v}] = ${discovery[v]}); this is an alternate loop back-edge.`,
        });

        const oldLow = low[u];
        const candidateLow = discovery[v];
        low[u] = Math.min(oldLow, candidateLow);

        emitEvent({
          type: 'UPDATE_LOW',
          nodeId: u,
          targetNodeId: v,
          edgeId,
          edgeKind: 'BACK',
          clock,
          oldLow,
          newLow: low[u],
          conditionMet: null,
          explanation:
            oldLow !== low[u]
              ? `Updated low[${u}] from ${oldLow} to min(${oldLow}, discovery[${v}]=${candidateLow}) = ${low[u]} via loop back-edge ${edgeId}.`
              : `Low[${u}] remains ${low[u]} because current low[${u}] (${low[u]}) <= discovery[${v}] (${candidateLow}).`,
        });
      } else {
        // 3. Tree-edge to an unvisited child
        treeChildrenCount[u]++;

        emitEvent({
          type: 'INSPECT_EDGE',
          nodeId: u,
          targetNodeId: v,
          edgeId,
          edgeKind: 'TREE',
          clock,
          oldLow: low[u],
          newLow: low[u],
          conditionMet: null,
          explanation: `Inspecting bridge ${edgeId} connecting ${u} to unvisited island ${v}. Traversing as a DFS tree bridge.`,
        });

        dfs(v, u);

        // 4. Upon return from child:
        const oldLow = low[u];
        const childLow = low[v];
        low[u] = Math.min(oldLow, childLow);

        emitEvent({
          type: 'UPDATE_LOW',
          nodeId: u,
          targetNodeId: v,
          edgeId,
          edgeKind: 'TREE',
          clock,
          oldLow,
          newLow: low[u],
          conditionMet: null,
          explanation:
            oldLow !== low[u]
              ? `Returned from child island ${v} to ${u}. Updated low[${u}] from ${oldLow} to min(${oldLow}, low[${v}]=${childLow}) = ${low[u]}.`
              : `Returned from child island ${v} to ${u}. Low[${u}] remains ${low[u]} (min(${oldLow}, low[${v}]=${childLow}) = ${low[u]}).`,
        });

        // 5. Bridge check (strict inequality: low[child] > discovery[u])
        const isBridge = low[v] > discovery[u];
        if (isBridge) {
          bridgeIds.push(edgeId);
        }

        emitEvent({
          type: 'EVALUATE_BRIDGE',
          nodeId: u,
          targetNodeId: v,
          edgeId,
          edgeKind: 'TREE',
          clock,
          oldLow: null,
          newLow: low[u],
          conditionMet: isBridge,
          explanation: isBridge
            ? `CRITICAL BRIDGE DETECTED: Bridge ${edgeId} (${u}—${v}) is a critical cut-edge because child low[${v}]=${low[v]} > discovery[${u}]=${discovery[u]}. No loop bypasses this bridge!`
            : `SAFE CROSSING: Bridge ${edgeId} (${u}—${v}) is safe (not a bridge) because child low[${v}]=${low[v]} <= discovery[${u}]=${discovery[u]}, proving an alternate cycle path exists.`,
        });

        // 6. Articulation point check for non-root node
        if (p !== null) {
          const isArt = low[v] >= discovery[u];
          if (isArt) {
            articulationNodeIds.add(u);
          }

          emitEvent({
            type: 'EVALUATE_ARTICULATION',
            nodeId: u,
            targetNodeId: v,
            edgeId,
            edgeKind: 'TREE',
            clock,
            oldLow: null,
            newLow: low[u],
            conditionMet: isArt,
            explanation: isArt
              ? `CRITICAL ARTICULATION JUNCTION: Island ${u} is a critical cut-vertex because child ${v} cannot reach any island discovered before ${u} (low[${v}]=${low[v]} >= discovery[${u}]=${discovery[u]}). Removing ${u} splits the festival!`
              : `Island ${u} is not cut by branch ${v} because low[${v}]=${low[v]} < discovery[${u}]=${discovery[u]} (branch connects to an earlier ancestor).`,
          });
        }
      }
    }

    // 7. Node Completion
    emitEvent({
      type: 'COMPLETE_NODE',
      nodeId: u,
      targetNodeId: null,
      edgeId: null,
      edgeKind: null,
      clock,
      oldLow: null,
      newLow: low[u],
      conditionMet: null,
      explanation: `Completed exploration of all bridges from island ${u}. Final low-link value = ${low[u]}.`,
    });
  }

  // Iterate through all nodes in ascending ASCII ID order
  for (const rootId of sortedNodeIds) {
    if (discovery[rootId] === undefined) {
      componentCount++;
      dfs(rootId, null);

      // Root articulation point check: root is articulation point iff it has >= 2 DFS children
      const isRootArt = treeChildrenCount[rootId] >= 2;
      if (isRootArt) {
        articulationNodeIds.add(rootId);
      }

      emitEvent({
        type: 'EVALUATE_ARTICULATION',
        nodeId: rootId,
        targetNodeId: null,
        edgeId: null,
        edgeKind: null,
        clock,
        oldLow: null,
        newLow: low[rootId],
        conditionMet: isRootArt,
        explanation: isRootArt
          ? `CRITICAL ARTICULATION ROOT: Component root ${rootId} has ${treeChildrenCount[rootId]} DFS-tree children (>= 2). Removing ${rootId} disconnects separate festival subtrees!`
          : `Component root ${rootId} has ${treeChildrenCount[rootId]} DFS-tree child (< 2). Root is not an articulation point.`,
      });

      // Component Completion
      emitEvent({
        type: 'COMPLETE_COMPONENT',
        nodeId: rootId,
        targetNodeId: null,
        edgeId: null,
        edgeKind: null,
        clock,
        oldLow: null,
        newLow: low[rootId],
        conditionMet: null,
        explanation: `Completed inspection of festival component #${componentCount} rooted at island ${rootId}.`,
      });
    }
  }

  // Sort final bridge IDs and articulation node IDs in ascending ASCII order
  const sortedBridges = bridgeIds.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const sortedArticulationPoints = Array.from(articulationNodeIds).sort((a, b) =>
    a < b ? -1 : a > b ? 1 : 0
  );

  return {
    discovery,
    low,
    parent,
    discoveryOrder,
    bridges: sortedBridges,
    articulationPoints: sortedArticulationPoints,
    componentCount,
    treeChildrenCount,
    events,
  };
}
