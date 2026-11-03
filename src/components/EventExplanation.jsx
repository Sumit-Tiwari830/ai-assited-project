import React from 'react';
import { Info, AlertTriangle, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function EventExplanation({
  currentEvent = {
    stepIndex: 12,
    type: 'EVALUATE_BRIDGE',
    nodeId: 'ISL_C',
    targetNodeId: 'ISL_D',
    edgeId: 'BR_CD',
    edgeKind: 'TREE',
    oldLow: null,
    newLow: 0,
    clock: 3,
    conditionMet: true,
    explanation:
      'CRITICAL BRIDGE DETECTED: Bridge BR_CD (ISL_C—ISL_D) is a critical cut-edge because child low[ISL_D]=3 > discovery[ISL_C]=2. No loop bypasses this bridge!',
  },
}) {
  if (!currentEvent) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-sky-400" />
          Inspection Step Explanation
        </h3>
        <p className="text-xs text-slate-500 italic">
          Press 'Step (1 Event)' or 'Run to End' to begin inspecting footbridges.
        </p>
      </div>
    );
  }

  const { type, nodeId, targetNodeId, edgeId, edgeKind, explanation, conditionMet } = currentEvent;

  // Badge color mapping based on event type
  const getBadgeStyle = () => {
    switch (type) {
      case 'EVALUATE_BRIDGE':
        return conditionMet
          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'EVALUATE_ARTICULATION':
        return conditionMet
          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
          : 'bg-slate-700 text-slate-300 border-slate-600';
      case 'DISCOVER_NODE':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'UPDATE_LOW':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'INSPECT_EDGE':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-sky-400" />
          Inspection Step Explanation
        </h3>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${getBadgeStyle()}`}
        >
          {type.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Target identifiers banner */}
      <div className="flex items-center gap-2 text-xs bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800">
        <span className="text-slate-400">Current Island:</span>
        <span className="font-mono font-bold text-sky-400">{nodeId}</span>

        {targetNodeId && (
          <>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="text-slate-400">Target:</span>
            <span className="font-mono font-bold text-emerald-400">{targetNodeId}</span>
          </>
        )}

        {edgeId && (
          <span className="ml-auto font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Bridge: {edgeId} ({edgeKind || 'EDGE'})
          </span>
        )}
      </div>

      {/* Narrative Explanation */}
      <div
        className={`p-3 rounded-xl border text-xs leading-relaxed ${
          conditionMet && (type === 'EVALUATE_BRIDGE' || type === 'EVALUATE_ARTICULATION')
            ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
            : 'bg-slate-950 border-slate-800 text-slate-300'
        }`}
      >
        <div className="flex items-start gap-2">
          {conditionMet ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          )}
          <p>{explanation}</p>
        </div>
      </div>
    </div>
  );
}
