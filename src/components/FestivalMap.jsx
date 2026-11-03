import React from 'react';

export default function FestivalMap({
  nodes = [],
  edges = [],
  currentNodeId = null,
  currentEdgeId = null,
  discoveryMap = {},
  lowMap = {},
  bridgeSet = new Set(),
  articulationSet = new Set(),
  treeEdgeSet = new Set(),
  backEdgeSet = new Set(),
  simulatedClosedBridgeId = null,
  strandedNodeSet = new Set(),
  onSelectBridge = () => {},
}) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col flex-1 h-full min-h-[480px]">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              simulatedClosedBridgeId ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-pulse'
            }`}
          />
          <span className="font-semibold text-slate-300">
            {simulatedClosedBridgeId ? 'Bridge Failure Simulation Mode' : 'Live Archipelago Map View'}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Click any footbridge to simulate closure</span>
        </div>
        <div className="text-slate-400 text-[11px]">
          {simulatedClosedBridgeId ? (
            <span className="text-rose-400 font-mono font-bold">Closed: {simulatedClosedBridgeId}</span>
          ) : (
            <>
              Active Island: <span className="text-amber-300 font-mono font-semibold">{currentNodeId || 'None'}</span>
            </>
          )}
        </div>
      </div>

      <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800/80">
        <svg
          viewBox="-5 -5 110 110"
          className="w-full h-full max-h-[640px] select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern id="ocean-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1e293b" strokeWidth="0.3" strokeDasharray="1,2" />
            </pattern>
            <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#f59e0b" floodOpacity="0.8" />
            </filter>
            <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#f43f5e" floodOpacity="0.8" />
            </filter>
            <filter id="glow-stranded" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.8" floodColor="#fb923c" floodOpacity="0.9" />
            </filter>
          </defs>

          {/* Ocean grid background */}
          <rect x="-5" y="-5" width="110" height="110" fill="url(#ocean-grid)" />

          {/* 1. FOOTBRIDGES (Edges) */}
          <g id="bridges-layer">
            {edges.map((edge) => {
              const u = nodeMap.get(edge.from);
              const v = nodeMap.get(edge.to);
              if (!u || !v) return null;

              const isClosed = edge.id === simulatedClosedBridgeId;
              const isCurrent = edge.id === currentEdgeId && !isClosed;
              const isBridge = bridgeSet.has(edge.id);
              const isTree = treeEdgeSet.has(edge.id);
              const isBack = backEdgeSet.has(edge.id);

              const midX = (u.x + v.x) / 2;
              const midY = (u.y + v.y) / 2;

              let stroke = '#64748b'; // default slate-500
              let strokeWidth = 1.4;
              let strokeDasharray = '2,2'; // unvisited

              if (isClosed) {
                stroke = '#ef4444'; // red
                strokeWidth = 2.5;
                strokeDasharray = '3,2';
              } else if (isBridge) {
                stroke = '#f59e0b'; // amber
                strokeWidth = 2.4;
                strokeDasharray = 'none';
              } else if (isTree) {
                stroke = '#38bdf8'; // sky blue
                strokeWidth = 1.8;
                strokeDasharray = 'none';
              } else if (isBack) {
                stroke = '#c084fc'; // purple
                strokeWidth = 1.4;
                strokeDasharray = '1.5,1.5';
              }

              return (
                <g
                  key={edge.id}
                  onClick={() => onSelectBridge(edge.id)}
                  className="cursor-pointer group transition-all duration-300"
                >
                  {/* Invisible thicker hit area for easy clicking */}
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke="transparent"
                    strokeWidth={8}
                  />

                  {/* Outer glow line if active */}
                  {isCurrent && (
                    <line
                      x1={u.x}
                      y1={u.y}
                      x2={v.x}
                      y2={v.y}
                      stroke="#fbbf24"
                      strokeWidth={3.8}
                      strokeOpacity={0.6}
                      filter="url(#glow-gold)"
                    />
                  )}

                  {/* Main footbridge line */}
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeLinecap="round"
                    className="group-hover:stroke-sky-300 transition-colors"
                  />

                  {/* Closed bridge cross indicator */}
                  {isClosed && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-10"
                        y="-3.5"
                        width="20"
                        height="7"
                        rx="1.5"
                        fill="#991b1b"
                        stroke="#fca5a5"
                        strokeWidth="0.5"
                        filter="url(#glow-red)"
                      />
                      <text
                        x="0"
                        y="1.3"
                        textAnchor="middle"
                        fontSize="2.4"
                        fontWeight="bold"
                        fill="#ffffff"
                      >
                        🚫 CLOSED
                      </text>
                    </g>
                  )}

                  {/* Bridge status badge (if not closed) */}
                  {!isClosed && isBridge && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-7"
                        y="-3"
                        width="14"
                        height="6"
                        rx="1.5"
                        fill="#b45309"
                        stroke="#fef08a"
                        strokeWidth="0.4"
                      />
                      <text
                        x="0"
                        y="1.2"
                        textAnchor="middle"
                        fontSize="2.4"
                        fontWeight="bold"
                        fill="#ffffff"
                      >
                        ⚠️ CUT
                      </text>
                    </g>
                  )}

                  {/* Loop indicator for back edges */}
                  {!isClosed && !isBridge && isBack && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <circle r="2" fill="#581c87" stroke="#c084fc" strokeWidth="0.4" />
                      <text
                        x="0"
                        y="1.2"
                        textAnchor="middle"
                        fontSize="2.4"
                        fill="#f3e8ff"
                      >
                        ↺
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* 2. ISLANDS (Nodes) */}
          <g id="islands-layer">
            {nodes.map((node) => {
              const isCurrent = node.id === currentNodeId;
              const isArticulation = articulationSet.has(node.id);
              const isDiscovered = discoveryMap[node.id] !== undefined;
              const isStranded = strandedNodeSet.has(node.id);

              const dVal = isDiscovered ? discoveryMap[node.id] : '-';
              const lowVal = lowMap[node.id] !== undefined ? lowMap[node.id] : '-';

              return (
                <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                  {/* Current Active Island Ring (centered) */}
                  {isCurrent && !isStranded && (
                    <circle
                      cx="0"
                      cy="0"
                      r="7.0"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="0.9"
                      strokeDasharray="2,1.5"
                      className="animate-pulse"
                      filter="url(#glow-gold)"
                    />
                  )}

                  {/* Stranded Island Warning Ring */}
                  {isStranded && (
                    <circle
                      cx="0"
                      cy="0"
                      r="7.2"
                      fill="none"
                      stroke="#fb923c"
                      strokeWidth="1.2"
                      strokeDasharray="3,1.5"
                      className="animate-pulse"
                      filter="url(#glow-stranded)"
                    />
                  )}

                  {/* Articulation Point Diamond Marker */}
                  {isArticulation && !isStranded && (
                    <polygon
                      points="0,-6.5 6.5,0 0,6.5 -6.5,0"
                      fill="#881337"
                      stroke="#f43f5e"
                      strokeWidth="0.8"
                      filter="url(#glow-red)"
                    />
                  )}

                  {/* Terrain Island Circle */}
                  <circle
                    r="4.8"
                    fill={
                      isStranded
                        ? '#7c2d12'
                        : isCurrent
                        ? '#0369a1'
                        : isDiscovered
                        ? '#0f766e'
                        : '#334155'
                    }
                    stroke={
                      isStranded
                        ? '#fdba74'
                        : isCurrent
                        ? '#38bdf8'
                        : isArticulation
                        ? '#fda4af'
                        : '#94a3b8'
                    }
                    strokeWidth={isStranded || isArticulation ? 1.2 : 0.8}
                  />

                  {/* Center Node ID */}
                  <text
                    x="0"
                    y="1"
                    textAnchor="middle"
                    fontSize="2.6"
                    fontWeight="bold"
                    fill="#ffffff"
                  >
                    {node.id.replace('ISL_', '')}
                  </text>

                  {/* Island Display Name Label */}
                  <text
                    x="0"
                    y="-5.8"
                    textAnchor="middle"
                    fontSize="2.2"
                    fontWeight="600"
                    fill={isStranded ? '#fed7aa' : '#e2e8f0'}
                    className="drop-shadow"
                  >
                    {node.name}
                  </text>

                  {/* Low-Link Proof Tag [d, low] */}
                  {isDiscovered && !isStranded && (
                    <g transform="translate(0, 7.8)">
                      <rect
                        x="-7"
                        y="-2.4"
                        width="14"
                        height="4.8"
                        rx="1.2"
                        fill="#020617"
                        stroke="#0ea5e9"
                        strokeWidth="0.3"
                      />
                      <text
                        x="0"
                        y="1"
                        textAnchor="middle"
                        fontSize="2.2"
                        fontWeight="mono"
                        fill="#38bdf8"
                      >
                        d:{dVal} L:{lowVal}
                      </text>
                    </g>
                  )}

                  {/* Stranded Badge */}
                  {isStranded && (
                    <g transform="translate(0, 7.8)">
                      <rect
                        x="-9"
                        y="-2.5"
                        width="18"
                        height="5"
                        rx="1.2"
                        fill="#451a03"
                        stroke="#fb923c"
                        strokeWidth="0.4"
                      />
                      <text
                        x="0"
                        y="1.1"
                        textAnchor="middle"
                        fontSize="2.1"
                        fontWeight="bold"
                        fill="#ffedd5"
                      >
                        ⚠️ STRANDED
                      </text>
                    </g>
                  )}

                  {/* Articulation Badge */}
                  {isArticulation && !isStranded && (
                    <g transform="translate(4.5, -4.5)">
                      <circle r="2" fill="#e11d48" stroke="#ffffff" strokeWidth="0.4" />
                      <text
                        x="0"
                        y="1.2"
                        textAnchor="middle"
                        fontSize="2.2"
                        fill="#ffffff"
                        fontWeight="bold"
                      >
                        ★
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
