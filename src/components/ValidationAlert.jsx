import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function ValidationAlert({ errors = [], onDismiss = () => {} }) {
  if (!errors || errors.length === 0) return null;

  return (
    <div className="bg-rose-950/80 border border-rose-500/50 rounded-2xl p-4 shadow-xl text-rose-200 text-xs flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="font-bold text-rose-300 text-sm mb-1">
          Graph Validation Error
        </h4>
        <p className="mb-2 text-rose-200/90 leading-relaxed">
          The requested archipelago configuration violates structural or coordinate contracts. Stale replay has been cleared.
        </p>
        <ul className="list-disc list-inside space-y-1 font-mono text-[11px] bg-rose-950/60 p-2.5 rounded-xl border border-rose-800/60">
          {errors.map((err, idx) => (
            <li key={idx} className="text-rose-300">
              {err}
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={onDismiss}
        className="text-rose-400 hover:text-white p-1 rounded-lg hover:bg-rose-900/50 transition-colors"
        aria-label="Dismiss alert"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
