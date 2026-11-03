/**
 * @fileoverview Data structure definitions and JSDoc contracts for Treasure-Island Bridge Safety Map.
 * Conforms to SPR26_D2_P01 specifications.
 */

/**
 * An island in the festival archipelago.
 * 
 * @typedef {Object} Node
 * @property {string} id - Unique identifier matching ^[A-Z][A-Z0-9_-]{0,15}$ (e.g. "ISL_A")
 * @property {string} name - Non-empty human-readable display name (e.g. "Anchor Bay")
 * @property {number} x - Presentation X coordinate from 0 through 100
 * @property {number} y - Presentation Y coordinate from 0 through 100
 */

/**
 * An undirected footbridge connecting two distinct islands.
 * 
 * @typedef {Object} Edge
 * @property {string} id - Unique identifier matching ^[A-Z][A-Z0-9_-]{0,15}$ (e.g. "BR_AB")
 * @property {string} from - ID of the first endpoint island
 * @property {string} to - ID of the second endpoint island (must be different from 'from')
 */

/**
 * The festival archipelago graph representation.
 * 
 * @typedef {Object} Graph
 * @property {Node[]} nodes - List of islands (1 to 12 nodes)
 * @property {Edge[]} edges - List of undirected footbridges (0 to 20 edges)
 */

/**
 * Event types emitted during the deterministic low-link DFS traversal.
 * @typedef {'DISCOVER_NODE' | 'INSPECT_EDGE' | 'UPDATE_LOW' | 'EVALUATE_BRIDGE' | 'EVALUATE_ARTICULATION' | 'COMPLETE_NODE' | 'COMPLETE_COMPONENT'} TraversalEventType
 */

/**
 * Edge classification during depth-first traversal.
 * @typedef {'TREE' | 'BACK' | 'PARENT'} EdgeKind
 */

/**
 * A single explanatory event in the deterministic replay sequence.
 * 
 * @typedef {Object} ReplayEvent
 * @property {number} stepIndex - Zero-based index of the event in execution sequence
 * @property {TraversalEventType} type - Kind of inspection action recorded
 * @property {string} nodeId - Primary island ID involved in the event
 * @property {string|null} [targetNodeId] - Target or neighbor island ID (if examining an edge or child)
 * @property {string|null} [edgeId] - Footbridge ID being traversed or evaluated (if applicable)
 * @property {EdgeKind|null} [edgeKind] - Traversal classification of the edge (TREE, BACK, or PARENT)
 * @property {number} [clock] - Discovery clock value at the time of the event
 * @property {number|null} [oldLow] - Low-link value before the update
 * @property {number|null} [newLow] - Low-link value after the update
 * @property {boolean|null} [conditionMet] - Whether the bridge/articulation condition was satisfied
 * @property {string} explanation - Human-readable and volunteer-friendly mathematical proof summary
 */

// Export dummy object for ES module compatibility if imported
export const Types = {};
