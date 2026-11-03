/**
 * @fileoverview Independently documented theoretical oracle for the Main Festival Archipelago.
 * Conforms to SPR26_D2_P01 specification.
 * 
 * IMPORTANT: This file documents expected mathematical solutions calculated by hand.
 * The application calculation engine does NOT import or read this file to make decisions.
 * It is solely used by unit tests to verify the engine's dynamic computations.
 */

export const MAIN_ARCHIPELAGO_ORACLE = {
  // Sorted Adjacency Lists (ascending ASCII of neighbor IDs)
  sortedAdjacency: {
    ISL_A: ['ISL_B', 'ISL_C'],
    ISL_B: ['ISL_A', 'ISL_C'],
    ISL_C: ['ISL_A', 'ISL_B', 'ISL_D'],
    ISL_D: ['ISL_C', 'ISL_E'],
    ISL_E: ['ISL_D', 'ISL_F', 'ISL_G'],
    ISL_F: ['ISL_E', 'ISL_G'],
    ISL_G: ['ISL_E', 'ISL_F'],
  },

  // Deterministic Discovery Order (ascending ASCII root selection & neighbor exploration)
  discoveryOrder: [
    'ISL_A',
    'ISL_B',
    'ISL_C',
    'ISL_D',
    'ISL_E',
    'ISL_F',
    'ISL_G',
  ],

  // Node Traversal Table (Parent, Discovery Clock, Low-Link)
  nodeTable: {
    ISL_A: { parent: null, discovery: 0, low: 0 },
    ISL_B: { parent: 'ISL_A', discovery: 1, low: 0 },
    ISL_C: { parent: 'ISL_B', discovery: 2, low: 0 },
    ISL_D: { parent: 'ISL_C', discovery: 3, low: 3 },
    ISL_E: { parent: 'ISL_D', discovery: 4, low: 4 },
    ISL_F: { parent: 'ISL_E', discovery: 5, low: 4 },
    ISL_G: { parent: 'ISL_F', discovery: 6, low: 4 },
  },

  // Connected Component Count
  componentCount: 1,

  // Critical Cut-Edges (Sorted ASCII)
  // BR_CD is bridge because low[ISL_D]=3 > discovery[ISL_C]=2
  // BR_DE is bridge because low[ISL_E]=4 > discovery[ISL_D]=3
  bridges: ['BR_CD', 'BR_DE'],

  // Critical Cut-Vertices (Sorted ASCII)
  // ISL_C is articulation point because child ISL_D has low[ISL_D]=3 >= discovery[ISL_C]=2
  // ISL_D is articulation point because child ISL_E has low[ISL_E]=4 >= discovery[ISL_D]=3
  // ISL_E is articulation point because child ISL_F has low[ISL_F]=4 >= discovery[ISL_E]=4
  // Root ISL_A has 1 DFS tree child (ISL_B), so it is NOT an articulation point
  articulationPoints: ['ISL_C', 'ISL_D', 'ISL_E'],
};
