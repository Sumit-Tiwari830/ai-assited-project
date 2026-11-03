/**
 * @fileoverview Graph builder and deterministic adjacency constructor.
 * Conforms to SPR26_D2_P01 specifications.
 */

/**
 * Returns a new array of all node IDs sorted in ascending ASCII order.
 * Ensures component iteration order is deterministic regardless of source array order.
 * 
 * @param {import('./types.js').Graph} graph 
 * @returns {string[]} Sorted array of node IDs
 */
export function getSortedNodeIds(graph) {
  if (!graph || !Array.isArray(graph.nodes)) return [];
  return [...graph.nodes].map((n) => n.id).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

/**
 * Builds a deterministic adjacency list for an undirected graph.
 * 
 * Rules:
 * 1. Node keys are sorted in ascending ASCII order.
 * 2. Each undirected edge is added to both endpoints.
 * 3. Each node's neighbor list is sorted in ascending ASCII order of neighbor ID.
 * 
 * Each neighbor entry contains:
 * - `to`: The neighbor island ID
 * - `edgeId`: The footbridge ID connecting them
 * 
 * @param {import('./types.js').Graph} graph 
 * @returns {Record<string, Array<{ to: string, edgeId: string }>>} Adjacency map
 */
export function buildAdjacencyList(graph) {
  const sortedNodeIds = getSortedNodeIds(graph);
  const adjacency = {};

  for (const id of sortedNodeIds) {
    adjacency[id] = [];
  }

  if (graph && Array.isArray(graph.edges)) {
    for (const edge of graph.edges) {
      if (adjacency[edge.from] && adjacency[edge.to]) {
        adjacency[edge.from].push({ to: edge.to, edgeId: edge.id });
        adjacency[edge.to].push({ to: edge.from, edgeId: edge.id });
      }
    }
  }

  // Sort each node's neighbors in ascending ASCII order of neighbor ID ('to')
  for (const id of sortedNodeIds) {
    adjacency[id].sort((a, b) => (a.to < b.to ? -1 : a.to > b.to ? 1 : 0));
  }

  return adjacency;
}

/**
 * Builds fast lookup maps for nodes and edges, along with sorted IDs and adjacency.
 * 
 * @param {import('./types.js').Graph} graph
 * @returns {{
 *   sortedNodeIds: string[],
 *   adjacency: Record<string, Array<{ to: string, edgeId: string }>>,
 *   nodeMap: Map<string, import('./types.js').Node>,
 *   edgeMap: Map<string, import('./types.js').Edge>
 * }}
 */
export function buildGraphLookup(graph) {
  const sortedNodeIds = getSortedNodeIds(graph);
  const adjacency = buildAdjacencyList(graph);

  const nodeMap = new Map();
  if (graph && Array.isArray(graph.nodes)) {
    for (const node of graph.nodes) {
      nodeMap.set(node.id, node);
    }
  }

  const edgeMap = new Map();
  if (graph && Array.isArray(graph.edges)) {
    for (const edge of graph.edges) {
      edgeMap.set(edge.id, edge);
    }
  }

  return {
    sortedNodeIds,
    adjacency,
    nodeMap,
    edgeMap,
  };
}
