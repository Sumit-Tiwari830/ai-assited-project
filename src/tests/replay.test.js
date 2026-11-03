import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runLowLinkDFS } from '../core/lowLinkEngine.js';
import { buildAdjacencyList } from '../core/graphBuilder.js';
import { MAIN_FESTIVAL_ARCHIPELAGO } from '../core/archipelagoData.js';
import { MAIN_ARCHIPELAGO_ORACLE } from '../core/archipelagoOracle.js';

describe('Replay & Oracle Verification Tests', () => {
  it('1. Main Archipelago: dynamically computed results must 100% match independently documented oracle', () => {
    // 1. Verify adjacency list matching oracle
    const computedAdj = buildAdjacencyList(MAIN_FESTIVAL_ARCHIPELAGO);
    for (const [nodeId, expectedNeighbors] of Object.entries(MAIN_ARCHIPELAGO_ORACLE.sortedAdjacency)) {
      const computedNeighbors = (computedAdj[nodeId] || []).map((entry) => entry.to);
      assert.deepEqual(
        computedNeighbors,
        expectedNeighbors,
        `Adjacency list for ${nodeId} must match oracle`
      );
    }

    // 2. Run low-link traversal dynamically
    const result = runLowLinkDFS(MAIN_FESTIVAL_ARCHIPELAGO);

    // 3. Verify Discovery Order
    assert.deepEqual(
      result.discoveryOrder,
      MAIN_ARCHIPELAGO_ORACLE.discoveryOrder,
      'Discovery order must match oracle exactly'
    );

    // 4. Verify Node Table (Parent, Discovery Clock, Low-Link)
    for (const [nodeId, expected] of Object.entries(MAIN_ARCHIPELAGO_ORACLE.nodeTable)) {
      assert.equal(
        result.discovery[nodeId],
        expected.discovery,
        `Discovery time for ${nodeId} mismatch`
      );
      assert.equal(
        result.low[nodeId],
        expected.low,
        `Low-link value for ${nodeId} mismatch`
      );
      assert.equal(
        result.parent[nodeId],
        expected.parent,
        `Parent for ${nodeId} mismatch`
      );
    }

    // 5. Verify Component Count
    assert.equal(result.componentCount, MAIN_ARCHIPELAGO_ORACLE.componentCount);

    // 6. Verify Critical Bridges (Sorted ASCII)
    assert.deepEqual(result.bridges, MAIN_ARCHIPELAGO_ORACLE.bridges);

    // 7. Verify Articulation Points (Sorted ASCII)
    assert.deepEqual(result.articulationPoints, MAIN_ARCHIPELAGO_ORACLE.articulationPoints);
  });

  it('2. Stepping through replay events must agree with the final table and classifications', () => {
    const result = runLowLinkDFS(MAIN_FESTIVAL_ARCHIPELAGO);
    const events = result.events;

    // Simulate stepping through events one by one
    const simulatedLow = {};
    const simulatedBridges = new Set();
    const simulatedArticulation = new Set();

    for (const ev of events) {
      if (ev.type === 'DISCOVER_NODE') {
        simulatedLow[ev.nodeId] = ev.newLow;
      } else if (ev.type === 'UPDATE_LOW') {
        simulatedLow[ev.nodeId] = ev.newLow;
      } else if (ev.type === 'EVALUATE_BRIDGE' && ev.conditionMet) {
        simulatedBridges.add(ev.edgeId);
      } else if (ev.type === 'EVALUATE_ARTICULATION' && ev.conditionMet) {
        simulatedArticulation.add(ev.nodeId);
      }
    }

    // End of replay state must agree with final values
    for (const nodeId of result.discoveryOrder) {
      assert.equal(
        simulatedLow[nodeId],
        result.low[nodeId],
        `Replay-derived low value for ${nodeId} must match final low value`
      );
    }

    assert.deepEqual(
      Array.from(simulatedBridges).sort(),
      result.bridges,
      'Replay-detected bridges must match final bridges list'
    );

    assert.deepEqual(
      Array.from(simulatedArticulation).sort(),
      result.articulationPoints,
      'Replay-detected articulation points must match final articulation list'
    );
  });
});
