import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { simulateBridgeClosure } from '../core/simulation.js';
import { MAIN_FESTIVAL_ARCHIPELAGO } from '../core/archipelagoData.js';

describe('Bridge Failure Simulation Tests', () => {
  it('1. Simulating closure of a critical bridge (BR_CD) must split festival into 2 disconnected zones', () => {
    const sim = simulateBridgeClosure(MAIN_FESTIVAL_ARCHIPELAGO, 'BR_CD');

    assert.ok(sim !== null);
    assert.equal(sim.closedBridgeId, 'BR_CD');
    assert.equal(sim.isSplit, true);
    assert.equal(sim.originalComponentCount, 1);
    assert.equal(sim.newComponentCount, 2);
    // Component 0: A, B, C; Component 1: D, E, F, G
    assert.deepEqual(sim.components[0], ['ISL_A', 'ISL_B', 'ISL_C']);
    assert.deepEqual(sim.components[1], ['ISL_D', 'ISL_E', 'ISL_F', 'ISL_G']);
    assert.deepEqual(sim.strandedNodeIds, ['ISL_D', 'ISL_E', 'ISL_F', 'ISL_G']);
    assert.ok(sim.explanation.includes('CRITICAL FAILURE'));
  });

  it('2. Simulating closure of a redundant cycle bridge (BR_AB) must NOT split the network', () => {
    const sim = simulateBridgeClosure(MAIN_FESTIVAL_ARCHIPELAGO, 'BR_AB');

    assert.ok(sim !== null);
    assert.equal(sim.closedBridgeId, 'BR_AB');
    assert.equal(sim.isSplit, false);
    assert.equal(sim.originalComponentCount, 1);
    assert.equal(sim.newComponentCount, 1);
    assert.deepEqual(sim.strandedNodeIds, []);
    assert.ok(sim.explanation.includes('SAFE CLOSURE'));
  });

  it('3. Non-existent bridge ID returns null without throwing', () => {
    const sim = simulateBridgeClosure(MAIN_FESTIVAL_ARCHIPELAGO, 'BR_DOES_NOT_EXIST');
    assert.equal(sim, null);
  });
});
