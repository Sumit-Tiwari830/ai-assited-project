/**
 * @fileoverview Custom hook for deterministic low-link DFS replay state management
 * and bridge failure simulation.
 */

import { useState, useMemo, useCallback } from 'react';
import { validateGraph } from '../core/validator.js';
import { runLowLinkDFS } from '../core/lowLinkEngine.js';
import { MAIN_FESTIVAL_ARCHIPELAGO, PRESETS } from '../core/archipelagoData.js';
import { simulateBridgeClosure } from '../core/simulation.js';

export function useBridgeSafetyReplay(initialGraph = MAIN_FESTIVAL_ARCHIPELAGO) {
  const [activeGraph, setActiveGraph] = useState(initialGraph);
  const [selectedPresetKey, setSelectedPresetKey] = useState('MAIN');

  // Bridge failure simulation state
  const [simulatedClosedBridgeId, setSimulatedClosedBridgeId] = useState(null);

  // Validate the current graph
  const validation = useMemo(() => {
    return validateGraph(activeGraph);
  }, [activeGraph]);

  // Run the low-link engine if the graph is valid; clear if invalid
  const traversalResult = useMemo(() => {
    if (!validation.isValid) {
      return null;
    }
    return runLowLinkDFS(activeGraph);
  }, [activeGraph, validation.isValid]);

  const events = traversalResult ? traversalResult.events : [];
  const totalSteps = events.length;

  // Step pointer: -1 means pre-traversal, 0 ... totalSteps - 1 are replay events
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Simulation computation
  const simulationResult = useMemo(() => {
    if (!simulatedClosedBridgeId) return null;
    return simulateBridgeClosure(activeGraph, simulatedClosedBridgeId);
  }, [activeGraph, simulatedClosedBridgeId]);

  // Derive the active visual state at currentStepIndex
  const replayState = useMemo(() => {
    const discoveryMap = {};
    const lowMap = {};
    const parentMap = {};
    const bridgeSet = new Set();
    const articulationSet = new Set();
    const treeEdgeSet = new Set();
    const backEdgeSet = new Set();
    const completedNodeSet = new Set();

    if (!traversalResult || currentStepIndex < 0 || events.length === 0) {
      return {
        currentNodeId: null,
        currentEdgeId: null,
        currentEvent: null,
        discoveryMap,
        lowMap,
        parentMap,
        bridgeSet,
        articulationSet,
        treeEdgeSet,
        backEdgeSet,
        completedNodeSet,
        componentCount: traversalResult ? traversalResult.componentCount : 0,
        finalBridges: traversalResult ? traversalResult.bridges : [],
        finalArticulationPoints: traversalResult ? traversalResult.articulationPoints : [],
      };
    }

    const bound = Math.min(currentStepIndex, events.length - 1);

    for (let i = 0; i <= bound; i++) {
      const ev = events[i];

      if (ev.type === 'DISCOVER_NODE') {
        discoveryMap[ev.nodeId] = ev.clock;
        lowMap[ev.nodeId] = ev.newLow;
        if (traversalResult.parent[ev.nodeId] !== undefined) {
          parentMap[ev.nodeId] = traversalResult.parent[ev.nodeId];
        }
      } else if (ev.type === 'INSPECT_EDGE') {
        if (ev.edgeKind === 'TREE' && ev.edgeId) {
          treeEdgeSet.add(ev.edgeId);
        } else if (ev.edgeKind === 'BACK' && ev.edgeId) {
          backEdgeSet.add(ev.edgeId);
        }
      } else if (ev.type === 'UPDATE_LOW') {
        lowMap[ev.nodeId] = ev.newLow;
      } else if (ev.type === 'EVALUATE_BRIDGE') {
        if (ev.conditionMet && ev.edgeId) {
          bridgeSet.add(ev.edgeId);
        }
      } else if (ev.type === 'EVALUATE_ARTICULATION') {
        if (ev.conditionMet && ev.nodeId) {
          articulationSet.add(ev.nodeId);
        }
      } else if (ev.type === 'COMPLETE_NODE') {
        completedNodeSet.add(ev.nodeId);
      }
    }

    const currentEv = events[bound];

    return {
      currentNodeId: currentEv.nodeId || null,
      currentEdgeId: currentEv.edgeId || null,
      currentEvent: currentEv,
      discoveryMap,
      lowMap,
      parentMap,
      bridgeSet,
      articulationSet,
      treeEdgeSet,
      backEdgeSet,
      completedNodeSet,
      componentCount: traversalResult.componentCount,
      finalBridges: traversalResult.bridges,
      finalArticulationPoints: traversalResult.articulationPoints,
    };
  }, [traversalResult, events, currentStepIndex]);

  // Actions
  const loadArchipelago = useCallback(
    (presetKey = 'MAIN') => {
      const graph = PRESETS[presetKey] || MAIN_FESTIVAL_ARCHIPELAGO;
      setSelectedPresetKey(presetKey);
      setActiveGraph(graph);
      setCurrentStepIndex(0);
      setSimulatedClosedBridgeId(null);
    },
    []
  );

  const step = useCallback(() => {
    setCurrentStepIndex((prev) => {
      if (prev < totalSteps - 1) {
        return prev + 1;
      }
      return prev;
    });
  }, [totalSteps]);

  const runToEnd = useCallback(() => {
    if (totalSteps > 0) {
      setCurrentStepIndex(totalSteps - 1);
    }
  }, [totalSteps]);

  const reset = useCallback(() => {
    setCurrentStepIndex(-1);
    setSimulatedClosedBridgeId(null);
  }, []);

  const simulateBridgeFailure = useCallback((bridgeId) => {
    setSimulatedClosedBridgeId((prev) => (prev === bridgeId ? null : bridgeId));
  }, []);

  const restoreBridge = useCallback(() => {
    setSimulatedClosedBridgeId(null);
  }, []);

  return {
    graph: activeGraph,
    validation,
    traversalResult,
    events,
    totalSteps,
    currentStepIndex,
    replayState,
    selectedPresetKey,
    simulatedClosedBridgeId,
    simulationResult,
    simulateBridgeFailure,
    restoreBridge,
    loadArchipelago,
    step,
    runToEnd,
    reset,
    setCustomGraph: (customGraph) => {
      setActiveGraph(customGraph);
      setCurrentStepIndex(0);
      setSimulatedClosedBridgeId(null);
    },
  };
}
