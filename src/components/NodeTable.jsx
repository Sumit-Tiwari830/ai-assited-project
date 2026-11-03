import React from 'react';
import { Table } from 'lucide-react';

export default function NodeTable({
  nodes = [],
  discoveryMap = {},
  lowMap = {},
  parentMap = {},
  articulationSet = new Set(),
  activeNodeId = null,
}) {
  const tableRows = nodes.map((n) => {
    const isDiscovered = discoveryMap[n.id] !== undefined;
    const dVal = isDiscovered ? discoveryMap[n.id] : '-';
    const lowVal = lowMap[n.id] !== undefined ? lowMap[n.id] : '-';
    const parentVal =
      parentMap[n.id] !== undefined
        ? parentMap[n.id] === null
          ? 'null (Root)'
          : parentMap[n.id]
        : '-';
    const isArt = articulationSet.has(n.id);

    return {
      id: n.id,
      name: n.name,
      parent: parentVal,
      d: dVal,
      low: lowVal,
      isArt,
      isActive: n.id === activeNodeId,
    };
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Table className="w-4 h-4 text-sky-400" />
          Island Traversal & Low-Link Table
        </h3>
        <span className="text-[11px] text-slate-500 font-mono">
          {tableRows.length} Islands
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 max-h-56 overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 sticky top-0 backdrop-blur z-10">
              <th className="py-2 px-3 font-semibold">Island</th>
              <th className="py-2 px-3 font-semibold">Parent</th>
              <th className="py-2 px-3 font-semibold text-center font-mono">Disc (d)</th>
              <th className="py-2 px-3 font-semibold text-center font-mono">Low (L)</th>
              <th className="py-2 px-3 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {tableRows.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-4 text-center text-slate-500 italic">
                  No islands in graph.
                </td>
              </tr>
            ) : (
              tableRows.map((row) => (
                <tr
                  key={row.id}
                  className={`transition-colors ${
                    row.isActive
                      ? 'bg-sky-500/10 text-white font-medium'
                      : 'text-slate-300 hover:bg-slate-900/50'
                  }`}
                >
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1.5">
                      {row.isActive && <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />}
                      <span className="font-mono font-bold text-sky-400">{row.id}</span>
                      <span className="text-slate-400 text-[11px]">({row.name})</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-400">{row.parent}</td>
                  <td className="py-2 px-3 text-center font-mono font-semibold text-slate-200">
                    {row.d}
                  </td>
                  <td className="py-2 px-3 text-center font-mono font-semibold text-sky-300">
                    {row.low}
                  </td>
                  <td className="py-2 px-3 text-right">
                    {row.isArt ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        ★ Cut-Island
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400">
                        Standard
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
