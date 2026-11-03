import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runLowLinkDFS } from '../core/lowLinkEngine.js';

describe('Tarjan Algorithm Boundary Conditions & Presets', () => {
  it('1. Root child-count rule: Root with 1 DFS child is NOT an articulation point, even if low[child] >= discovery[root]', () => {
    // Linear 3-node path: ISL_A - ISL_B - ISL_C
    // Root ISL_A has discovery = 0. Child ISL_B has discovery = 1, low = 1.
    // Note that low[ISL_B] (1) >= discovery[ISL_A] (0).
    // If ISL_A were a non-root, it would be an articulation point.
    // But since ISL_A is the root and has only ONE DFS-tree child (ISL_B), it is NOT an articulation point.
    const pathGraph = {
      nodes: [
        { id: 'ISL_A', name: 'Root', x: 10, y: 10 },
        { id: 'ISL_B', name: 'Middle', x: 20, y: 10 },
        { id: 'ISL_C', name: 'End', x: 30, y: 10 },
      ],
      edges: [
        { id: 'BR_AB', from: 'ISL_A', to: 'ISL_B' },
        { id: 'BR_BC', from: 'ISL_B', to: 'ISL_C' },
      ],
    };

    const result = runLowLinkDFS(pathGraph);

    // Tree children count for root ISL_A is 1 (< 2)
    assert.equal(result.treeChildrenCount['ISL_A'], 1);
    // ISL_A is NOT an articulation point
    assert.ok(!result.articulationPoints.includes('ISL_A'));

    // ISL_B IS an articulation point (non-root with child ISL_C having low[ISL_C]=2 >= discovery[ISL_B]=1)
    assert.ok(result.articulationPoints.includes('ISL_B'));
    assert.deepEqual(result.articulationPoints, ['ISL_B']);

    // Both edges are bridges
    assert.deepEqual(result.bridges, ['BR_AB', 'BR_BC']);
  });

  it('2. Root child-count rule: Root with >= 2 DFS children IS an articulation point', () => {
    // Star/Fork graph: Root ISL_A connected to ISL_B and ISL_C with no edge between B and C
    const forkGraph = {
      nodes: [
        { id: 'ISL_A', name: 'Root', x: 20, y: 20 },
        { id: 'ISL_B', name: 'Branch 1', x: 10, y: 30 },
        { id: 'ISL_C', name: 'Branch 2', x: 30, y: 30 },
      ],
      edges: [
        { id: 'BR_AB', from: 'ISL_A', to: 'ISL_B' },
        { id: 'BR_AC', from: 'ISL_A', to: 'ISL_C' },
      ],
    };

    const result = runLowLinkDFS(forkGraph);

    // Root ISL_A has 2 DFS-tree children (>= 2)
    assert.equal(result.treeChildrenCount['ISL_A'], 2);
    assert.deepEqual(result.articulationPoints, ['ISL_A']);
    assert.deepEqual(result.bridges, ['BR_AB', 'BR_AC']);
  });

  it('3. Equality Boundary (low[child] === discovery[parent]): Non-root IS an articulation point (>= holds), but edge is NOT a bridge (> fails)', () => {
    // Two triangles sharing vertex ISL_C:
    // Cycle 1: ISL_A - ISL_B - ISL_C - ISL_A (discovery[ISL_C] = 2)
    // Cycle 2: ISL_C - ISL_D - ISL_E - ISL_C
    // In Cycle 2, ISL_D visits ISL_E, which back-edges to ISL_C.
    // Thus low[ISL_D] = discovery[ISL_C] = 2.
    // Parent = ISL_C (discovery = 2), Child = ISL_D (low = 2).
    const bowtieGraph = {
      nodes: [
        { id: 'ISL_A', name: 'A', x: 10, y: 10 },
        { id: 'ISL_B', name: 'B', x: 20, y: 10 },
        { id: 'ISL_C', name: 'C', x: 30, y: 20 },
        { id: 'ISL_D', name: 'D', x: 40, y: 10 },
        { id: 'ISL_E', name: 'E', x: 50, y: 10 },
      ],
      edges: [
        { id: 'BR_AB', from: 'ISL_A', to: 'ISL_B' },
        { id: 'BR_BC', from: 'ISL_B', to: 'ISL_C' },
        { id: 'BR_CA', from: 'ISL_C', to: 'ISL_A' },
        { id: 'BR_CD', from: 'ISL_C', to: 'ISL_D' },
        { id: 'BR_DE', from: 'ISL_D', to: 'ISL_E' },
        { id: 'BR_EC', from: 'ISL_E', to: 'ISL_C' },
      ],
    };

    const result = runLowLinkDFS(bowtieGraph);

    // Verify exact equality between child low and parent discovery
    assert.equal(result.discovery['ISL_C'], 2);
    assert.equal(result.low['ISL_D'], 2);
    assert.equal(result.low['ISL_D'], result.discovery['ISL_C'], 'low[child] must strictly equal discovery[parent]');

    // Articulation condition: low[ISL_D] (2) >= discovery[ISL_C] (2) -> TRUE (ISL_C is an articulation point)
    assert.ok(result.low['ISL_D'] >= result.discovery['ISL_C']);
    assert.ok(result.articulationPoints.includes('ISL_C'));

    // Bridge condition: low[ISL_D] (2) > discovery[ISL_C] (2) -> FALSE (BR_CD is NOT a bridge)
    assert.ok(!(result.low['ISL_D'] > result.discovery['ISL_C']));
    assert.ok(!result.bridges.includes('BR_CD'));

    // Graph contains zero bridges because both halves are loops
    assert.deepEqual(result.bridges, []);
  });

  it('4. Strict Inequality (low[child] > discovery[parent]): Edge IS a bridge AND node IS an articulation point', () => {
    // Triangle ISL_A - ISL_B - ISL_C - ISL_A + Bridge to ISL_D
    const bridgeGraph = {
      nodes: [
        { id: 'ISL_A', name: 'A', x: 10, y: 10 },
        { id: 'ISL_B', name: 'B', x: 20, y: 10 },
        { id: 'ISL_C', name: 'C', x: 30, y: 20 },
        { id: 'ISL_D', name: 'D', x: 40, y: 20 },
      ],
      edges: [
        { id: 'BR_AB', from: 'ISL_A', to: 'ISL_B' },
        { id: 'BR_BC', from: 'ISL_B', to: 'ISL_C' },
        { id: 'BR_CA', from: 'ISL_C', to: 'ISL_A' },
        { id: 'BR_CD', from: 'ISL_C', to: 'ISL_D' },
      ],
    };

    const result = runLowLinkDFS(bridgeGraph);

    // Child ISL_D: low[ISL_D] = 3. Parent ISL_C: discovery[ISL_C] = 2.
    assert.equal(result.discovery['ISL_C'], 2);
    assert.equal(result.low['ISL_D'], 3);
    assert.ok(result.low['ISL_D'] > result.discovery['ISL_C'], 'low[child] must be strictly greater than discovery[parent]');

    // Edge BR_CD IS a bridge
    assert.deepEqual(result.bridges, ['BR_CD']);
    // Node ISL_C IS an articulation point
    assert.deepEqual(result.articulationPoints, ['ISL_C']);
  });

  it('5. Ancestor Back-Edge (low[child] < discovery[node]): Neither bridge nor articulation point', () => {
    // Simple 4-node cycle: ISL_A - ISL_B - ISL_C - ISL_D - ISL_A
    const squareCycle = {
      nodes: [
        { id: 'ISL_A', name: 'A', x: 10, y: 10 },
        { id: 'ISL_B', name: 'B', x: 20, y: 10 },
        { id: 'ISL_C', name: 'C', x: 20, y: 20 },
        { id: 'ISL_D', name: 'D', x: 10, y: 20 },
      ],
      edges: [
        { id: 'BR_AB', from: 'ISL_A', to: 'ISL_B' },
        { id: 'BR_BC', from: 'ISL_B', to: 'ISL_C' },
        { id: 'BR_CD', from: 'ISL_C', to: 'ISL_D' },
        { id: 'BR_DA', from: 'ISL_D', to: 'ISL_A' },
      ],
    };

    const result = runLowLinkDFS(squareCycle);

    // All nodes in the cycle reach back to ISL_A (discovery 0), so low of all children is 0
    assert.equal(result.low['ISL_D'], 0);
    assert.equal(result.low['ISL_C'], 0);
    assert.equal(result.low['ISL_B'], 0);

    // For non-root node ISL_B (discovery 1), child ISL_C has low 0 < discovery 1
    assert.ok(result.low['ISL_C'] < result.discovery['ISL_B']);

    // Neither bridge nor articulation point anywhere in the 4-cycle
    assert.deepEqual(result.bridges, []);
    assert.deepEqual(result.articulationPoints, []);
  });
});
