import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runLowLinkDFS } from '../core/lowLinkEngine.js';

describe('Permutation & Determinism Tests', () => {
  // Base test graph with 1 cycle, 2 bridges, 2 articulation points
  const baseGraph = {
    nodes: [
      { id: 'ISL_A', name: 'Anchor Bay', x: 10, y: 10 },
      { id: 'ISL_B', name: 'Beacon Point', x: 20, y: 10 },
      { id: 'ISL_C', name: 'Coral Cove', x: 30, y: 20 },
      { id: 'ISL_D', name: 'Dune Haven', x: 45, y: 20 },
      { id: 'ISL_E', name: 'Emerald Isle', x: 60, y: 20 },
    ],
    edges: [
      { id: 'BR_AB', from: 'ISL_A', to: 'ISL_B' },
      { id: 'BR_BC', from: 'ISL_B', to: 'ISL_C' },
      { id: 'BR_CA', from: 'ISL_C', to: 'ISL_A' },
      { id: 'BR_CD', from: 'ISL_C', to: 'ISL_D' },
      { id: 'BR_DE', from: 'ISL_D', to: 'ISL_E' },
    ],
  };

  /**
   * Helper to perform Fisher-Yates shuffle on an array copy.
   */
  function shuffleArray(arr, seed = 42) {
    const copy = [...arr];
    // Simple deterministic pseudo-random generator
    let s = seed;
    function rand() {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    }
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  it('1. Shuffled and reversed nodes/edges must produce 100% identical traversal results', () => {
    const baseline = runLowLinkDFS(baseGraph);

    // Test multiple permutation variants:
    const variations = [
      // Variation 1: Reverse nodes
      {
        nodes: [...baseGraph.nodes].reverse(),
        edges: [...baseGraph.edges],
      },
      // Variation 2: Reverse edges
      {
        nodes: [...baseGraph.nodes],
        edges: [...baseGraph.edges].reverse(),
      },
      // Variation 3: Reverse both nodes and edges
      {
        nodes: [...baseGraph.nodes].reverse(),
        edges: [...baseGraph.edges].reverse(),
      },
      // Variation 4: Swap endpoint directions (from <-> to)
      {
        nodes: [...baseGraph.nodes],
        edges: baseGraph.edges.map((e) => ({ ...e, from: e.to, to: e.from })),
      },
      // Variation 5: Shuffled nodes and edges with multiple seeds
      {
        nodes: shuffleArray(baseGraph.nodes, 101),
        edges: shuffleArray(baseGraph.edges, 202),
      },
      {
        nodes: shuffleArray(baseGraph.nodes, 777),
        edges: shuffleArray(baseGraph.edges, 888),
      },
      {
        nodes: shuffleArray(baseGraph.nodes, 9999),
        edges: shuffleArray(
          baseGraph.edges.map((e) => ({ ...e, from: e.to, to: e.from })),
          1234
        ),
      },
    ];

    for (let idx = 0; idx < variations.length; idx++) {
      const variantGraph = variations[idx];
      const result = runLowLinkDFS(variantGraph);

      assert.equal(
        result.componentCount,
        baseline.componentCount,
        `Variant ${idx} componentCount mismatch`
      );
      assert.deepEqual(
        result.discoveryOrder,
        baseline.discoveryOrder,
        `Variant ${idx} discoveryOrder mismatch`
      );
      assert.deepEqual(
        result.discovery,
        baseline.discovery,
        `Variant ${idx} discovery map mismatch`
      );
      assert.deepEqual(
        result.low,
        baseline.low,
        `Variant ${idx} low map mismatch`
      );
      assert.deepEqual(
        result.parent,
        baseline.parent,
        `Variant ${idx} parent map mismatch`
      );
      assert.deepEqual(
        result.bridges,
        baseline.bridges,
        `Variant ${idx} bridges mismatch`
      );
      assert.deepEqual(
        result.articulationPoints,
        baseline.articulationPoints,
        `Variant ${idx} articulationPoints mismatch`
      );

      // Verify event sequence structure matches identically
      assert.equal(
        result.events.length,
        baseline.events.length,
        `Variant ${idx} event count mismatch`
      );
      for (let e = 0; e < result.events.length; e++) {
        assert.equal(
          result.events[e].type,
          baseline.events[e].type,
          `Variant ${idx} event[${e}] type mismatch`
        );
        assert.equal(
          result.events[e].nodeId,
          baseline.events[e].nodeId,
          `Variant ${idx} event[${e}] nodeId mismatch`
        );
      }
    }
  });

  it('2. Neighbors must strictly be inspected in ascending alphabetical order of neighbor ID', () => {
    // Star graph where root ISL_A is connected to ISL_Z, ISL_M, ISL_B, ISL_K
    // Defined in reverse / chaotic order in input edges array
    const starGraph = {
      nodes: [
        { id: 'ISL_A', name: 'Root', x: 50, y: 50 },
        { id: 'ISL_Z', name: 'Zeta', x: 90, y: 90 },
        { id: 'ISL_M', name: 'Mu', x: 50, y: 10 },
        { id: 'ISL_B', name: 'Beta', x: 10, y: 50 },
        { id: 'ISL_K', name: 'Kappa', x: 80, y: 20 },
      ],
      edges: [
        { id: 'BR_AZ', from: 'ISL_A', to: 'ISL_Z' },
        { id: 'BR_AM', from: 'ISL_A', to: 'ISL_M' },
        { id: 'BR_AB', from: 'ISL_A', to: 'ISL_B' },
        { id: 'BR_AK', from: 'ISL_A', to: 'ISL_K' },
      ],
    };

    const result = runLowLinkDFS(starGraph);

    // Extract all edge inspections made from ISL_A
    const inspectionTargetsFromA = result.events
      .filter((e) => e.type === 'INSPECT_EDGE' && e.nodeId === 'ISL_A')
      .map((e) => e.targetNodeId);

    // Expected ascending order: ISL_B, ISL_K, ISL_M, ISL_Z
    assert.deepEqual(inspectionTargetsFromA, ['ISL_B', 'ISL_K', 'ISL_M', 'ISL_Z']);

    // Root ISL_A has 4 tree children (>= 2), so ISL_A must be an articulation point
    assert.deepEqual(result.articulationPoints, ['ISL_A']);
    // All 4 edges are bridges
    assert.deepEqual(result.bridges, ['BR_AB', 'BR_AK', 'BR_AM', 'BR_AZ']);
  });

  it('3. Unvisited component roots must be chosen in ascending alphabetical order', () => {
    // Disconnected graph with isolated nodes defined in reverse order
    const disconnectedGraph = {
      nodes: [
        { id: 'ISL_Z', name: 'Z', x: 10, y: 10 },
        { id: 'ISL_M', name: 'M', x: 20, y: 20 },
        { id: 'ISL_A', name: 'A', x: 30, y: 30 },
      ],
      edges: [],
    };

    const result = runLowLinkDFS(disconnectedGraph);

    // Must be visited in alphabetical order: ISL_A, then ISL_M, then ISL_Z
    assert.deepEqual(result.discoveryOrder, ['ISL_A', 'ISL_M', 'ISL_Z']);
    assert.equal(result.discovery['ISL_A'], 0);
    assert.equal(result.discovery['ISL_M'], 1);
    assert.equal(result.discovery['ISL_Z'], 2);
    assert.equal(result.componentCount, 3);
  });
});
