import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runLowLinkDFS } from '../core/lowLinkEngine.js';

describe('lowLinkEngine Tests', () => {
  it('1. Simple Cycle: should detect 0 bridges and 0 articulation points', () => {
    // Triangle cycle: ISL_A - ISL_B - ISL_C - ISL_A
    const graph = {
      nodes: [
        { id: 'ISL_A', name: 'Alpha', x: 10, y: 10 },
        { id: 'ISL_B', name: 'Beta', x: 20, y: 10 },
        { id: 'ISL_C', name: 'Gamma', x: 15, y: 20 },
      ],
      edges: [
        { id: 'BR_AB', from: 'ISL_A', to: 'ISL_B' },
        { id: 'BR_BC', from: 'ISL_B', to: 'ISL_C' },
        { id: 'BR_CA', from: 'ISL_C', to: 'ISL_A' },
      ],
    };

    const result = runLowLinkDFS(graph);

    assert.equal(result.componentCount, 1);
    assert.deepEqual(result.bridges, []);
    assert.deepEqual(result.articulationPoints, []);
    assert.deepEqual(result.discoveryOrder, ['ISL_A', 'ISL_B', 'ISL_C']);
    assert.equal(result.discovery['ISL_A'], 0);
    assert.equal(result.discovery['ISL_B'], 1);
    assert.equal(result.discovery['ISL_C'], 2);
    // Cycle back-edge propagates low = 0 to all nodes
    assert.equal(result.low['ISL_A'], 0);
    assert.equal(result.low['ISL_B'], 0);
    assert.equal(result.low['ISL_C'], 0);
  });

  it('2. Graph with One Bridge: should detect exactly one bridge and one articulation point', () => {
    // Triangle (ISL_A, ISL_B, ISL_C) + Pendant leaf ISL_D connected to ISL_C
    const graph = {
      nodes: [
        { id: 'ISL_A', name: 'Alpha', x: 10, y: 10 },
        { id: 'ISL_B', name: 'Beta', x: 20, y: 10 },
        { id: 'ISL_C', name: 'Gamma', x: 15, y: 20 },
        { id: 'ISL_D', name: 'Delta', x: 30, y: 20 },
      ],
      edges: [
        { id: 'BR_AB', from: 'ISL_A', to: 'ISL_B' },
        { id: 'BR_BC', from: 'ISL_B', to: 'ISL_C' },
        { id: 'BR_CA', from: 'ISL_C', to: 'ISL_A' },
        { id: 'BR_CD', from: 'ISL_C', to: 'ISL_D' },
      ],
    };

    const result = runLowLinkDFS(graph);

    assert.equal(result.componentCount, 1);
    assert.deepEqual(result.bridges, ['BR_CD']);
    assert.deepEqual(result.articulationPoints, ['ISL_C']);
    assert.equal(result.low['ISL_D'], 3);
    assert.equal(result.discovery['ISL_C'], 2);
    // Bridge rule check: low[ISL_D] (3) > discovery[ISL_C] (2)
    assert.ok(result.low['ISL_D'] > result.discovery['ISL_C']);
  });

  it('3. Articulation Point without Bridges: Bowtie / Hourglass graph', () => {
    // Two triangles sharing single vertex ISL_C:
    // Triangle 1: ISL_A - ISL_B - ISL_C - ISL_A
    // Triangle 2: ISL_C - ISL_D - ISL_E - ISL_C
    const graph = {
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

    const result = runLowLinkDFS(graph);

    assert.equal(result.componentCount, 1);
    assert.deepEqual(result.bridges, []); // Both parts are cycles, so 0 bridges
    assert.deepEqual(result.articulationPoints, ['ISL_C']); // ISL_C is the cut-vertex joining the two cycles
  });

  it('4. Disconnected Graph: Multiple components and isolated node with global clock', () => {
    const graph = {
      nodes: [
        { id: 'ISL_A', name: 'A', x: 10, y: 10 },
        { id: 'ISL_B', name: 'B', x: 20, y: 10 },
        { id: 'ISL_C', name: 'C', x: 40, y: 40 },
        { id: 'ISL_D', name: 'D', x: 50, y: 40 },
        { id: 'ISL_E', name: 'Isolated', x: 80, y: 80 },
      ],
      edges: [
        { id: 'BR_AB', from: 'ISL_A', to: 'ISL_B' },
        { id: 'BR_CD', from: 'ISL_C', to: 'ISL_D' },
      ],
    };

    const result = runLowLinkDFS(graph);

    assert.equal(result.componentCount, 3);
    assert.deepEqual(result.bridges, ['BR_AB', 'BR_CD']);
    assert.deepEqual(result.articulationPoints, []); // 2-node components and 1-node components have no articulation points
    // Global clock increments monotonically across components
    assert.equal(result.discovery['ISL_A'], 0);
    assert.equal(result.discovery['ISL_B'], 1);
    assert.equal(result.discovery['ISL_C'], 2);
    assert.equal(result.discovery['ISL_D'], 3);
    assert.equal(result.discovery['ISL_E'], 4);
    assert.equal(result.parent['ISL_A'], null);
    assert.equal(result.parent['ISL_C'], null);
    assert.equal(result.parent['ISL_E'], null);
  });

  it('5. Replay Events: Step order, continuity, and explanation coverage', () => {
    const graph = {
      nodes: [
        { id: 'ISL_A', name: 'Alpha', x: 10, y: 10 },
        { id: 'ISL_B', name: 'Beta', x: 20, y: 10 },
        { id: 'ISL_C', name: 'Gamma', x: 15, y: 20 },
      ],
      edges: [
        { id: 'BR_AB', from: 'ISL_A', to: 'ISL_B' },
        { id: 'BR_BC', from: 'ISL_B', to: 'ISL_C' },
        { id: 'BR_CA', from: 'ISL_C', to: 'ISL_A' },
      ],
    };

    const result = runLowLinkDFS(graph);
    const events = result.events;

    assert.ok(Array.isArray(events));
    assert.ok(events.length > 0);

    // Verify stepIndex continuity (0, 1, 2, ... N-1)
    for (let i = 0; i < events.length; i++) {
      assert.equal(events[i].stepIndex, i, `Event at index ${i} must have stepIndex === ${i}`);
      assert.ok(typeof events[i].explanation === 'string' && events[i].explanation.length > 0);
      assert.ok(typeof events[i].type === 'string');
    }

    // First event must be DISCOVER_NODE for ISL_A
    assert.equal(events[0].type, 'DISCOVER_NODE');
    assert.equal(events[0].nodeId, 'ISL_A');
    assert.equal(events[0].clock, 0);

    // Last event must be COMPLETE_COMPONENT
    assert.equal(events[events.length - 1].type, 'COMPLETE_COMPONENT');
    assert.equal(events[events.length - 1].nodeId, 'ISL_A');

    // Event sequence must contain edge inspections, low updates, and node completions
    const eventTypes = events.map((e) => e.type);
    assert.ok(eventTypes.includes('INSPECT_EDGE'));
    assert.ok(eventTypes.includes('UPDATE_LOW'));
    assert.ok(eventTypes.includes('EVALUATE_BRIDGE'));
    assert.ok(eventTypes.includes('COMPLETE_NODE'));
    assert.ok(eventTypes.includes('COMPLETE_COMPONENT'));
  });
});
