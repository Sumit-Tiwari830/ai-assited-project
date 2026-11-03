import React from 'react';
import { Play, SkipForward, RotateCcw, Compass, Map, Layers, AlertTriangle, Pause, PlayCircle } from 'lucide-react';

export default function ControlPanel({
  onLoadArchipelago = () => {},
  onStep = () => {},
  onRunToEnd = () => {},
  onReset = () => {},
  isPlaying = false,
  onTogglePlay = () => {},
  currentStep = 0,
  totalSteps = 0,
  selectedPreset = 'MAIN',
  onSelectPreset = () => {},
  edges = [],
  simulatedClosedBridgeId = null,
  onSimulateBridgeFailure = () => {},
  onRestoreBridge = () => {},
}) {
  const isFinished = totalSteps > 0 && currentStep >= totalSteps;
  const progressPercent = totalSteps > 0 ? Math.min(100, Math.round((currentStep / totalSteps) * 100)) : 0;

  return (
    <aside className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-5 print:hidden">
      {/* Primary Actions Section */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Compass className="w-4 h-4 text-sky-400" />
          Replay Controls
        </h2>
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onLoadArchipelago}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-md shadow-sky-500/20 active:scale-[0.98] transition-all"
          >
            <Map className="w-4 h-4" />
            Load My Archipelago
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onStep}
              disabled={isFinished || isPlaying}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-medium text-xs border transition-all ${
                isFinished || isPlaying
                  ? 'bg-slate-800/40 text-slate-500 border-slate-800 cursor-not-allowed'
                  : 'bg-slate-800 hover:bg-slate-700 text-sky-300 border-slate-700 active:scale-[0.98]'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Step (1 Event)
            </button>

            <button
              onClick={onTogglePlay}
              disabled={isFinished}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-medium text-xs border transition-all ${
                isFinished
                  ? 'bg-slate-800/40 text-slate-500 border-slate-800 cursor-not-allowed'
                  : isPlaying
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-sky-300 border-slate-700 active:scale-[0.98]'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <PlayCircle className="w-3.5 h-3.5" />}
              {isPlaying ? 'Pause Auto' : 'Gentle Auto-Play'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onRunToEnd}
              disabled={isFinished}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-medium text-xs border transition-all ${
                isFinished
                  ? 'bg-slate-800/40 text-slate-500 border-slate-800 cursor-not-allowed'
                  : 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border-slate-700 active:scale-[0.98]'
              }`}
            >
              <SkipForward className="w-3.5 h-3.5" />
              Run to End
            </button>

            <button
              onClick={onReset}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-medium text-xs bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 active:scale-[0.98] transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Map
            </button>
          </div>
        </div>
      </div>

      {/* Progress & Step Status */}
      <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
        <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5">
          <span>Inspection Progress</span>
          <span className="font-mono text-slate-200">
            {currentStep} / {totalSteps} steps ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-sky-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Bridge Failure Simulation Control */}
      <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-3 flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          Bridge Failure Simulation
        </label>
        <p className="text-[11px] text-slate-400 leading-tight">
          Simulate closing any footbridge to test festival isolation.
        </p>
        <div className="flex gap-2 items-center mt-1">
          <select
            value={simulatedClosedBridgeId || ''}
            onChange={(e) => onSimulateBridgeFailure(e.target.value || null)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="">-- Click bridge or select --</option>
            {edges.map((edge) => (
              <option key={edge.id} value={edge.id}>
                {edge.id} ({edge.from} ↔ {edge.to})
              </option>
            ))}
          </select>
          {simulatedClosedBridgeId && (
            <button
              onClick={onRestoreBridge}
              className="px-2 py-1.5 rounded-lg text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 shrink-0 transition-colors"
              title="Restore closed bridge"
            >
              Restore
            </button>
          )}
        </div>
      </div>

      {/* Archipelago Preset Selector */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          Archipelago Preset
        </label>
        <select
          value={selectedPreset}
          onChange={(e) => onSelectPreset(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
        >
          <option value="MAIN">Main Festival Archipelago (7 Islands, 8 Bridges)</option>
          <option value="CYCLE">Pure Safe Cycle (No Bridges / No Articulations)</option>
          <option value="BOWTIE">Bowtie Hourglass (Articulation Point without Bridge)</option>
          <option value="MULTI_ROOT">Multi-Child Root & Disconnected Island</option>
        </select>
      </div>

      {/* Visual Legend (Accessibility-First) */}
      <div className="border-t border-slate-800/80 pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
          Accessibility Map Legend
        </h3>
        <div className="grid grid-cols-1 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 border-t border-dashed border-slate-400" />
            <span className="text-slate-300">Dashed Gray: Unvisited Bridge</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 bg-sky-400 rounded-full" />
            <span className="text-slate-300">Solid Blue: DFS Tree Bridge</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 border-t-2 border-dotted border-purple-400" />
            <span className="text-slate-300">Dotted Purple: Inspected Loop (Back-Edge ↺)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-1.5 bg-amber-500 rounded-sm shadow-sm shadow-amber-500/50" />
            <span className="text-amber-300 font-medium">Double Amber: Critical Bridge (Cut-Edge ⚠️)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rotate-45 bg-rose-500 border border-white/40" />
            <span className="text-rose-300 font-medium">Red Diamond: Articulation Island (★)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 border-t-2 border-dashed border-red-500" />
            <span className="text-red-400 font-medium">Red Dashed: Closed Bridge (🚫 CLOSED)</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
