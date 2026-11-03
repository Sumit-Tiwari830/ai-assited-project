import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header.jsx';
import ControlPanel from './components/ControlPanel.jsx';
import FestivalMap from './components/FestivalMap.jsx';
import EventExplanation from './components/EventExplanation.jsx';
import NodeTable from './components/NodeTable.jsx';
import SafetySummary from './components/SafetySummary.jsx';
import ValidationAlert from './components/ValidationAlert.jsx';
import { useBridgeSafetyReplay } from './hooks/useBridgeSafetyReplay.js';

export default function App() {
  const {
    graph,
    validation,
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
  } = useBridgeSafetyReplay();

  // Gentle auto-play state
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-play interval timer
  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      if (currentStepIndex >= totalSteps - 1) {
        setIsPlaying(false);
      } else {
        timer = setInterval(() => {
          step();
        }, 900);
      }
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, currentStepIndex, totalSteps, step]);

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleStep = () => {
    setIsPlaying(false);
    step();
  };

  const handleRunToEnd = () => {
    setIsPlaying(false);
    runToEnd();
  };

  const handleReset = () => {
    setIsPlaying(false);
    reset();
  };

  const handleLoadArchipelago = (presetKey = 'MAIN') => {
    setIsPlaying(false);
    loadArchipelago(presetKey);
  };

  const currentStepDisplay = currentStepIndex >= 0 ? currentStepIndex + 1 : 0;

  // Set of stranded node IDs during simulation
  const strandedNodeSet = useMemo(() => {
    if (!simulationResult || !simulationResult.strandedNodeIds) {
      return new Set();
    }
    return new Set(simulationResult.strandedNodeIds);
  }, [simulationResult]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans print:bg-white print:text-black">
      {/* 1. Top Header */}
      <Header />

      {/* 2. Main Content Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col gap-4 print:p-0">
        {/* Validation Error Alert Banner (if graph is invalid) */}
        {!validation.isValid && (
          <ValidationAlert errors={validation.errors} />
        )}

        {/* 3-Column Responsive Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Left Panel: Controls, Stepping, and Legend (3 cols on lg) */}
          <section className="lg:col-span-3 flex flex-col gap-4 print:hidden">
            <ControlPanel
              currentStep={currentStepDisplay}
              totalSteps={totalSteps}
              selectedPreset={selectedPresetKey}
              onSelectPreset={(key) => handleLoadArchipelago(key)}
              onLoadArchipelago={() => handleLoadArchipelago('MAIN')}
              onStep={handleStep}
              onRunToEnd={handleRunToEnd}
              onReset={handleReset}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              edges={graph.edges}
              simulatedClosedBridgeId={simulatedClosedBridgeId}
              onSimulateBridgeFailure={simulateBridgeFailure}
              onRestoreBridge={restoreBridge}
            />
          </section>

          {/* Center Panel: SVG Festival Archipelago Map (6 cols on lg) */}
          <section className="lg:col-span-5 xl:col-span-6 flex flex-col min-h-[480px]">
            <FestivalMap
              nodes={graph.nodes}
              edges={graph.edges}
              currentNodeId={replayState.currentNodeId}
              currentEdgeId={replayState.currentEdgeId}
              discoveryMap={replayState.discoveryMap}
              lowMap={replayState.lowMap}
              bridgeSet={replayState.bridgeSet}
              articulationSet={replayState.articulationSet}
              treeEdgeSet={replayState.treeEdgeSet}
              backEdgeSet={replayState.backEdgeSet}
              simulatedClosedBridgeId={simulatedClosedBridgeId}
              strandedNodeSet={strandedNodeSet}
              onSelectBridge={simulateBridgeFailure}
            />
          </section>

          {/* Right Panel: Explanations, Node Table, and Safety Summary (3 cols on lg) */}
          <section className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4">
            <EventExplanation currentEvent={replayState.currentEvent} />

            <NodeTable
              nodes={graph.nodes}
              discoveryMap={replayState.discoveryMap}
              lowMap={replayState.lowMap}
              parentMap={replayState.parentMap}
              articulationSet={replayState.articulationSet}
              activeNodeId={replayState.currentNodeId}
            />

            <SafetySummary
              componentCount={
                simulationResult ? simulationResult.newComponentCount : replayState.componentCount
              }
              bridges={replayState.finalBridges}
              articulationPoints={replayState.finalArticulationPoints}
              simulationResult={simulationResult}
              onRestoreBridge={restoreBridge}
            />
          </section>
        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-2.5 text-center text-xs text-slate-500 print:hidden">
        Treasure-Island Bridge Safety Map • Tarjan Low-Link Traversal • Offline Deterministic Architecture
      </footer>
    </div>
  );
}
