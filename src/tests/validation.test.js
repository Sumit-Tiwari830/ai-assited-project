import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateGraph, LIMITS } from '../core/validator.js';

describe('Graph Validation Tests', () => {
  // A clean, baseline valid graph
  const validGraph = {
    nodes: [
      { id: 'ISL_A', name: 'Anchor Bay', x: 10, y: 20 },
      { id: 'ISL_B', name: 'Beacon Point', x: 30, y: 40 },
      { id: 'ISL_C', name: 'Coral Cove', x: 50, y: 60 },
    ],
    edges: [
      { id: 'BR_AB', from: 'ISL_A', to: 'ISL_B' },
      { id: 'BR_BC', from: 'ISL_B', to: 'ISL_C' },
    ],
  };

  it('1. Valid Graph: should successfully pass validation with no errors', () => {
    const result = validateGraph(validGraph);
    assert.equal(result.isValid, true);
    assert.equal(result.error, null);
    assert.equal(result.errors.length, 0);
  });

  it('2. Invalid Node IDs: should reject IDs not matching ^[A-Z][A-Z0-9_-]{0,15}$', () => {
    const invalidIds = ['lowercase', '1START_NUM', 'ISL@BAD', 'THIS_IS_WAY_TOO_LONG_FOR_THE_ID_SPEC'];
    for (const badId of invalidIds) {
      const graph = {
        nodes: [{ id: badId, name: 'Bad Island', x: 10, y: 10 }],
        edges: [],
      };
      const result = validateGraph(graph);
      assert.equal(result.isValid, false);
      assert.ok(result.errors.some((err) => err.includes('Invalid node ID') && err.includes(badId)));
    }
  });

  it('3. Duplicate Node IDs: should reject duplicate node identifiers', () => {
    const graph = {
      nodes: [
        { id: 'ISL_DUP', name: 'First Island', x: 10, y: 10 },
        { id: 'ISL_DUP', name: 'Second Island', x: 20, y: 20 },
      ],
      edges: [],
    };
    const result = validateGraph(graph);
    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((err) => err.includes('Duplicate node ID') && err.includes('ISL_DUP')));
  });

  it('4. Duplicate Undirected Edges: should reject parallel edges between same pair', () => {
    // Forward + Reversed endpoints
    const graph = {
      nodes: [
        { id: 'ISL_A', name: 'Alpha', x: 10, y: 10 },
        { id: 'ISL_B', name: 'Beta', x: 20, y: 20 },
      ],
      edges: [
        { id: 'BR_AB1', from: 'ISL_A', to: 'ISL_B' },
        { id: 'BR_AB2', from: 'ISL_B', to: 'ISL_A' }, // Duplicate unordered connection
      ],
    };
    const result = validateGraph(graph);
    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((err) => err.includes('duplicate connection') && err.includes('BR_AB2')));
  });

  it('5. Self-Loops: should reject edges connecting a node to itself', () => {
    const graph = {
      nodes: [{ id: 'ISL_A', name: 'Alpha', x: 10, y: 10 }],
      edges: [{ id: 'BR_LOOP', from: 'ISL_A', to: 'ISL_A' }],
    };
    const result = validateGraph(graph);
    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((err) => err.includes('self-loop') && err.includes('BR_LOOP')));
  });

  it('6. Missing Edge Endpoints: should reject edges with unknown endpoints', () => {
    const graph = {
      nodes: [{ id: 'ISL_A', name: 'Alpha', x: 10, y: 10 }],
      edges: [{ id: 'BR_GHOST', from: 'ISL_A', to: 'ISL_NONEXISTENT' }],
    };
    const result = validateGraph(graph);
    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((err) => err.includes('unknown endpoint') && err.includes('ISL_NONEXISTENT')));
  });

  it('7. Invalid Coordinates: should reject out-of-range (<0 or >100) and non-finite coords', () => {
    const badCoordGraphs = [
      { x: -5, y: 50, desc: 'negative x' },
      { x: 50, y: 105, desc: 'y > 100' },
      { x: NaN, y: 50, desc: 'NaN x' },
      { x: 50, y: Infinity, desc: 'Infinite y' },
    ];

    for (const { x, y, desc } of badCoordGraphs) {
      const graph = {
        nodes: [{ id: 'ISL_COORD', name: 'Coord Island', x, y }],
        edges: [],
      };
      const result = validateGraph(graph);
      assert.equal(result.isValid, false, `Failed to reject invalid coordinate: ${desc}`);
      assert.ok(result.errors.some((err) => err.includes('invalid x-coordinate') || err.includes('invalid y-coordinate')));
    }
  });

  it('8. Empty Node Names: should reject empty, whitespace-only or non-string names', () => {
    const badNames = ['', '   ', null, undefined];
    for (const badName of badNames) {
      const graph = {
        nodes: [{ id: 'ISL_NONAME', name: badName, x: 10, y: 10 }],
        edges: [],
      };
      const result = validateGraph(graph);
      assert.equal(result.isValid, false);
      assert.ok(result.errors.some((err) => err.includes('non-empty display name')));
    }
  });

  it('9. Graph Size Limits: should enforce node limits [1, 12] and edge limits [0, 20]', () => {
    // 0 nodes (< 1)
    const zeroNodes = { nodes: [], edges: [] };
    const resZero = validateGraph(zeroNodes);
    assert.equal(resZero.isValid, false);
    assert.ok(resZero.errors.some((err) => err.includes(`between ${LIMITS.MIN_NODES} and ${LIMITS.MAX_NODES} nodes`)));

    // 13 nodes (> 12)
    const thirteenNodes = {
      nodes: Array.from({ length: 13 }, (_, i) => ({
        id: `ISL_${String.fromCharCode(65 + i)}`,
        name: `Island ${i}`,
        x: i * 5,
        y: i * 5,
      })),
      edges: [],
    };
    const res13 = validateGraph(thirteenNodes);
    assert.equal(res13.isValid, false);
    assert.ok(res13.errors.some((err) => err.includes(`between ${LIMITS.MIN_NODES} and ${LIMITS.MAX_NODES} nodes`)));

    // 21 edges (> 20) with 12 valid nodes
    const twelveNodes = Array.from({ length: 12 }, (_, i) => ({
      id: `ISL_${String.fromCharCode(65 + i)}`,
      name: `Island ${i}`,
      x: i * 5,
      y: i * 5,
    }));
    // Generate 21 distinct edges
    const twentyOneEdges = [];
    let edgeIdx = 0;
    for (let i = 0; i < 12 && twentyOneEdges.length < 21; i++) {
      for (let j = i + 1; j < 12 && twentyOneEdges.length < 21; j++) {
        twentyOneEdges.push({
          id: `BR_${edgeIdx++}`,
          from: twelveNodes[i].id,
          to: twelveNodes[j].id,
        });
      }
    }
    const res21Edges = validateGraph({ nodes: twelveNodes, edges: twentyOneEdges });
    assert.equal(res21Edges.isValid, false);
    assert.ok(res21Edges.errors.some((err) => err.includes(`between ${LIMITS.MIN_EDGES} and ${LIMITS.MAX_EDGES} edges`)));
  });
});
