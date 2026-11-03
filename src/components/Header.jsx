import React from 'react';
import { Compass, ShieldCheck, MapPin, Printer } from 'lucide-react';

export default function Header() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 shadow-lg print:bg-white print:border-none print:shadow-none">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-400 shadow-inner print:hidden">
            <Compass className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white print:text-black">
                Treasure-Island Bridge Safety Map
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 print:text-black print:border-slate-400">
                SPR26_D2_P01
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 print:text-slate-600">
              Interactive low-link DFS inspection for festival island footbridges & cut-junctions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Print or export safety report"
          >
            <Printer className="w-3.5 h-3.5 text-sky-400" />
            <span>Print Report</span>
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-medium">Deterministic Engine Ready</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
            <MapPin className="w-4 h-4 text-sky-400" />
            <span>Local Festival Network</span>
          </div>
        </div>
      </div>
    </header>
  );
}
