import React from 'react';
import { ShieldCheck, AlertOctagon, GitCommit, Split, AlertTriangle, RotateCcw, CheckCircle2 } from 'lucide-react';

export default function SafetySummary({
  componentCount = 1,
  bridges = [],
  articulationPoints = [],
  simulationResult = null,
  onRestoreBridge = () => {},
}) {
  const hasVulnerabilities = bridges.length > 0 || articulationPoints.length > 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
      {/* Simulation Banner (if active) */}
      {simulationResult ? (
        <div className="bg-slate-950 rounded-xl p-3 border border-amber-500/40 flex flex-col gap-2.5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Simulated Bridge Closure: {simulationResult.closedBridgeId}</span>
            </div>
            <button
              onClick={onRestoreBridge}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Restore Bridge
            </button>
          </div>

          <div
            className={`p-2.5 rounded-lg text-xs leading-relaxed border ${
              simulationResult.isSplit
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
            }`}
          >
            <div className="flex items-start gap-2">
              {simulationResult.isSplit ? (
                <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold mb-1">
                  {simulationResult.isSplit
                    ? `CRITICAL FAILURE: Network split into ${simulationResult.newComponentCount} components!`
                    : 'SAFE: Network remains 100% connected via alternate path.'}
                </p>
                <p className="text-[11px] opacity-90">{simulationResult.explanation}</p>
              </div>
            </div>
          </div>

          {simulationResult.isSplit && simulationResult.strandedNodeIds.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] bg-rose-950/30 p-2 rounded-lg border border-rose-900/60">
              <span className="text-rose-300 font-bold shrink-0">Stranded Islands:</span>
              <div className="flex flex-wrap gap-1">
                {simulationResult.strandedNodeIds.map((id) => (
                  <span
                    key={id}
                    className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-200 border border-rose-500/40 font-mono text-[10px]"
                  >
                    ⚠️ {id}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Festival Safety Assessment
        </h3>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
            hasVulnerabilities
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          }`}
        >
          {hasVulnerabilities ? 'Vulnerabilities Identified' : 'Fully Redundant (Safe)'}
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl flex flex-col items-center justify-center text-center">
          <GitCommit className="w-4 h-4 text-sky-400 mb-1" />
          <span className="text-lg font-bold text-white">{componentCount}</span>
          <span className="text-[10px] text-slate-400 uppercase font-medium">Components</span>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl flex flex-col items-center justify-center text-center">
          <AlertOctagon className="w-4 h-4 text-amber-400 mb-1" />
          <span className="text-lg font-bold text-amber-400">{bridges.length}</span>
          <span className="text-[10px] text-slate-400 uppercase font-medium">Bridges (Cuts)</span>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl flex flex-col items-center justify-center text-center">
          <Split className="w-4 h-4 text-rose-400 mb-1" />
          <span className="text-lg font-bold text-rose-400">{articulationPoints.length}</span>
          <span className="text-[10px] text-slate-400 uppercase font-medium">Cut-Islands</span>
        </div>
      </div>

      {/* Critical Items Details */}
      <div className="flex flex-col gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        <div>
          <div className="text-slate-400 text-[11px] font-semibold mb-1 flex items-center justify-between">
            <span>Critical Bridge IDs (Ascending):</span>
            <span className="font-mono text-amber-300 font-bold">{bridges.length}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {bridges.length > 0 ? (
              bridges.map((bId) => (
                <span
                  key={bId}
                  className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px]"
                >
                  ⚠️ {bId}
                </span>
              ))
            ) : (
              <span className="text-slate-500 italic text-[11px]">No single-point-of-failure bridges detected</span>
            )}
          </div>
        </div>

        <div className="border-t border-slate-800/60 pt-2 mt-1">
          <div className="text-slate-400 text-[11px] font-semibold mb-1 flex items-center justify-between">
            <span>Articulation Island IDs (Ascending):</span>
            <span className="font-mono text-rose-300 font-bold">{articulationPoints.length}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {articulationPoints.length > 0 ? (
              articulationPoints.map((nodeId) => (
                <span
                  key={nodeId}
                  className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-[11px]"
                >
                  ★ {nodeId}
                </span>
              ))
            ) : (
              <span className="text-slate-500 italic text-[11px]">No single junction disconnects the festival</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
