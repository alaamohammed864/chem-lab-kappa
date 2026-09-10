import React, { useState } from 'react';
import {
  ShieldAlert,
  Zap,
  Layers,
  CircleDot,
  SplitSquareVertical,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import {
  CORROSION_MECHANISMS,
  CorrosionMechanismInfo,
} from '../../engines/materials/corrosionEngine';

export const CorrosionMechanismsExplorer: React.FC = () => {
  const [activeMechId, setActiveMechId] = useState<string>('pitting');

  const mechanism: CorrosionMechanismInfo = CORROSION_MECHANISMS[activeMechId] || CORROSION_MECHANISMS['pitting'];

  return (
    <div className="space-y-4">
      {/* Mechanism Category Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {Object.values(CORROSION_MECHANISMS).map((mech) => {
          const isSelected = mech.id === activeMechId;
          return (
            <button
              key={mech.id}
              onClick={() => setActiveMechId(mech.id)}
              className={`p-2.5 rounded-lg text-left transition border cursor-pointer ${
                isSelected
                  ? 'bg-rose-950/60 border-rose-500/80 text-white shadow-md shadow-rose-950/40'
                  : 'bg-[#0f1924] border-[#1b2b3d] text-slate-300 hover:border-slate-600 hover:bg-[#132232]'
              }`}
            >
              <div className="font-semibold text-xs truncate">{mech.name}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{mech.category}</div>
            </button>
          );
        })}
      </div>

      {/* Main Visual & Technical Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left: Schematic Graphic (5 cols) */}
        <div className="lg:col-span-5 bg-[#0b131d] border border-[#162738] rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="text-[10px] font-mono uppercase text-rose-400 font-semibold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                ELECTROCHEMICAL CELL SCHEMATIC
              </span>
              <span className="text-[9px] font-mono text-slate-500 uppercase">{mechanism.category}</span>
            </div>

            {/* Interactive SVG Cross-Section Illustration */}
            <div className="relative w-full h-48 bg-[#080d14] rounded-lg border border-[#152332] overflow-hidden flex items-center justify-center p-2">
              <svg viewBox="0 0 320 180" className="w-full h-full">
                {/* Electrolyte Layer (Top) */}
                <rect x="10" y="10" width="300" height="70" fill="#0d2438" rx="4" />
                <text x="20" y="28" fill="#38bdf8" fontSize="10" fontFamily="monospace">
                  Corrosive Electrolyte (H₂O + Cl⁻ + O₂)
                </text>

                {/* Metal Substrate (Bottom) */}
                <rect x="10" y="80" width="300" height="90" fill="#1e293b" rx="4" />
                <text x="20" y="160" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                  Metal Matrix (Substrate)
                </text>

                {/* Passive Oxide Layer (if applicable) */}
                {['pitting', 'crevice', 'intergranular', 'scc'].includes(mechanism.id) && (
                  <rect x="10" y="76" width="300" height="4" fill="#10b981" opacity="0.8" />
                )}

                {/* Dynamic Mode-Specific SVG Elements */}
                {mechanism.id === 'uniform' && (
                  <>
                    <path d="M 20 80 Q 50 78, 80 80 T 140 80 T 200 80 T 260 80 T 300 80" stroke="#f43f5e" strokeWidth="2" fill="none" />
                    <circle cx="60" cy="60" r="3" fill="#f43f5e" />
                    <text x="70" y="63" fill="#f43f5e" fontSize="9" fontFamily="monospace">M → Mⁿ⁺ + ne⁻</text>
                    <circle cx="200" cy="50" r="3" fill="#38bdf8" />
                    <text x="210" y="53" fill="#38bdf8" fontSize="9" fontFamily="monospace">O₂ + 2H₂O + 4e⁻ → 4OH⁻</text>
                  </>
                )}

                {mechanism.id === 'pitting' && (
                  <>
                    {/* Pit Cavity */}
                    <path d="M 130 80 C 130 135, 190 135, 190 80 Z" fill="#090f17" stroke="#f43f5e" strokeWidth="2" />
                    <text x="145" y="105" fill="#f43f5e" fontSize="10" fontWeight="bold" fontFamily="monospace">Pit</text>
                    <text x="135" y="125" fill="#fb7185" fontSize="8" fontFamily="monospace">H⁺ + Cl⁻ (Acidic)</text>
                    {/* Passive Oxide Breach */}
                    <line x1="125" y1="76" x2="195" y2="76" stroke="#000" strokeWidth="6" />
                    {/* Electron Flow Arrow */}
                    <path d="M 160 145 L 240 145 L 240 85" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3,3" />
                    <text x="180" y="140" fill="#fbbf24" fontSize="8" fontFamily="monospace">e⁻ flow</text>
                  </>
                )}

                {mechanism.id === 'galvanic' && (
                  <>
                    <rect x="20" y="80" width="130" height="80" fill="#475569" />
                    <text x="35" y="120" fill="#f87171" fontSize="11" fontWeight="bold">Anode (Zn / Steel)</text>
                    <rect x="170" y="80" width="130" height="80" fill="#334155" />
                    <text x="185" y="120" fill="#38bdf8" fontSize="11" fontWeight="bold">Cathode (Cu / SS)</text>
                    {/* External or Contact Interface */}
                    <line x1="150" y1="80" x2="170" y2="80" stroke="#f59e0b" strokeWidth="3" />
                    <path d="M 85 80 L 85 45 L 235 45 L 235 80" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,4" />
                    <text x="135" y="40" fill="#f59e0b" fontSize="9" fontFamily="monospace">Galvanic Current</text>
                  </>
                )}

                {mechanism.id === 'crevice' && (
                  <>
                    <rect x="80" y="50" width="160" height="30" fill="#64748b" rx="2" opacity="0.9" />
                    <text x="105" y="68" fill="#ffffff" fontSize="9" fontWeight="bold">Gasket / Bolt Shield</text>
                    <rect x="90" y="78" width="140" height="8" fill="#f43f5e" opacity="0.7" />
                    <text x="95" y="105" fill="#f43f5e" fontSize="9" fontFamily="monospace">O₂ Depleted Crevice</text>
                  </>
                )}

                {mechanism.id === 'intergranular' && (
                  <>
                    {/* Grain Boundaries */}
                    <path d="M 40 80 L 100 120 L 100 170 M 100 120 L 180 110 L 220 80 M 180 110 L 210 170 M 180 110 L 270 140" stroke="#f43f5e" strokeWidth="2.5" fill="none" />
                    <text x="45" y="105" fill="#94a3b8" fontSize="9">Grain A</text>
                    <text x="130" y="145" fill="#94a3b8" fontSize="9">Grain B</text>
                    <text x="230" y="115" fill="#94a3b8" fontSize="9">Grain C</text>
                    <text x="110" y="95" fill="#f43f5e" fontSize="8" fontFamily="monospace">Cr₂₃C₆ Precipitates</text>
                  </>
                )}

                {mechanism.id === 'scc' && (
                  <>
                    {/* Tensile Stress Arrows */}
                    <path d="M 30 120 L 10 120 M 15 115 L 5 120 L 15 125" stroke="#38bdf8" strokeWidth="2" />
                    <text x="5" y="105" fill="#38bdf8" fontSize="8">σ Tensile</text>
                    <path d="M 290 120 L 310 120 M 305 115 L 315 120 L 305 125" stroke="#38bdf8" strokeWidth="2" />
                    <text x="280" y="105" fill="#38bdf8" fontSize="8">σ Tensile</text>
                    {/* Branched Crack */}
                    <path d="M 160 80 L 165 110 L 155 125 L 170 145 M 165 110 L 180 130" stroke="#ef4444" strokeWidth="2" fill="none" />
                    <text x="185" y="125" fill="#ef4444" fontSize="9" fontWeight="bold" fontFamily="monospace">Brittle Crack</text>
                  </>
                )}
              </svg>
            </div>
          </div>

          <div className="mt-3 p-2.5 rounded bg-[#0e1724] border border-[#172739] space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
              Half-Cell Electrochemical Reactions
            </span>
            <div className="text-xs font-mono text-rose-300">
              <span className="text-slate-500">Anodic:</span> {mechanism.anodicReaction}
            </div>
            <div className="text-xs font-mono text-cyan-300">
              <span className="text-slate-500">Cathodic:</span> {mechanism.cathodicReaction}
            </div>
          </div>
        </div>

        {/* Right: Technical Explanation, Factors & Mitigation (7 cols) */}
        <div className="lg:col-span-7 bg-[#0b131d] border border-[#162738] rounded-xl p-4 space-y-3">
          <div>
            <span className="text-[10px] font-mono uppercase text-cyan-400 font-semibold">
              DEGRADATION MECHANISM PROFILE
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">{mechanism.name}</h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed bg-[#0e1622] p-3 rounded-lg border border-slate-800">
              {mechanism.mechanismSummary}
            </p>
          </div>

          {/* Critical Trigger Factors */}
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold block mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Critical Physical & Chemical Triggers
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {mechanism.criticalFactors.map((factor, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded bg-[#0f1926] border border-[#1a2d40] text-xs text-slate-300 flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Engineering Mitigation Strategies */}
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold block mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Engineering Prevention & Mitigation Strategies
            </span>
            <div className="space-y-1.5">
              {mechanism.mitigationStrategies.map((strat, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded bg-[#0a1f1a] border border-[#11382c] text-xs text-emerald-200 flex items-start gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>{strat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
