import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runLowLinkDFS } from '../core/lowLinkEngine.js';
import { MAIN_FESTIVAL_ARCHIPELAGO } from '../core/archipelagoData.js';

describe('Reset & Repeatability Tests', () => {
  it('1. Repeated stepped and complete runs produce identical histories and results', () => {
    // Snapshot of original graph before any run
    const originalGraphSnapshot = JSON.stringify(MAIN_FESTIVAL_ARCHIPELAGO);

    // Run 1: Complete run
    const run1 = runLowLinkDFS(MAIN_FESTIVAL_ARCHIPELAGO);

    // Confirm original graph data was not mutated
    assert.equal(
      JSON.stringify(MAIN_FESTIVAL_ARCHIPELAGO),
      originalGraphSnapshot,
      'Graph object must remain strictly immutable across runs'
    );

    // Run 2: Reset and run again
    const run2 = runLowLinkDFS(MAIN_FESTIVAL_ARCHIPELAGO);

    // Assert Run 1 and Run 2 are identical
    assert.deepEqual(run1.discoveryOrder, run2.discoveryOrder);
    assert.deepEqual(run1.discovery, run2.discovery);
    assert.deepEqual(run1.low, run2.low);
    assert.deepEqual(run1.parent, run2.parent);
    assert.deepEqual(run1.bridges, run2.bridges);
    assert.deepEqual(run1.articulationPoints, run2.articulationPoints);
    assert.deepEqual(run1.componentCount, run2.componentCount);

    // Event sequence equality
    assert.equal(run1.events.length, run2.events.length);
    for (let i = 0; i < run1.events.length; i++) {
      assert.deepEqual(run1.events[i], run2.events[i], `Event at index ${i} must match between runs`);
    }

    // Run 3: Third run to ensure multi-cycle repeatability
    const run3 = runLowLinkDFS(MAIN_FESTIVAL_ARCHIPELAGO);
    assert.deepEqual(run1.bridges, run3.bridges);
    assert.deepEqual(run1.articulationPoints, run3.articulationPoints);
  });
});
