import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Flame,
} from 'lucide-react';
import {
  CORROSION_ALLOYS,
  calculatePREN,
  AlloyCorrosionProfile,
} from '../../engines/materials/corrosionEngine';

interface CorrosionMaterialSelectorProps {
  selectedAlloyId: string;
  onSelectAlloy: (id: string) => void;
}

export const CorrosionMaterialSelector: React.FC<CorrosionMaterialSelectorProps> = ({
  selectedAlloyId,
  onSelectAlloy,
}) => {
  const alloy: AlloyCorrosionProfile = CORROSION_ALLOYS[selectedAlloyId] || CORROSION_ALLOYS['ss-316l'];

  const pren = calculatePREN(
    alloy.composition.cr || 0,
    alloy.composition.mo || 0,
    alloy.composition.n || 0,
    alloy.composition.w || 0,
    alloy.name
  );

  return (
    <div className="space-y-4">
      {/* Alloy Selector Pills */}
      <div>
        <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2 block">
          Select Engineering Alloy / Grade
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {Object.values(CORROSION_ALLOYS).map((a) => {
            const isSelected = a.id === selectedAlloyId;
            return (
              <button
                key={a.id}
                onClick={() => onSelectAlloy(a.id)}
                className={`p-2 rounded-lg text-left transition border text-xs cursor-pointer ${
                  isSelected
                    ? 'bg-rose-950/50 border-rose-500/80 text-white shadow-lg shadow-rose-950/40'
                    : 'bg-[#0f1924] border-[#1b2b3d] text-slate-300 hover:border-slate-600 hover:bg-[#132232]'
                }`}
              >
                <div className="font-semibold truncate">{a.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{a.category}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Alloy Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Profile Card (7 cols) */}
        <div className="md:col-span-7 bg-[#0b131d] border border-[#162738] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{alloy.name}</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                  {alloy.category}
                </span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Density: {alloy.densityGramsPerCm3} g/cm³ · Equivalent Weight: {alloy.equivalentWeightGrams} g/eq
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Galvanic Seawater</span>
              <span className={`text-xs font-mono font-bold ${alloy.standardPotentialVSCE < -0.3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {alloy.standardPotentialVSCE > 0 ? `+${alloy.standardPotentialVSCE}` : alloy.standardPotentialVSCE} V vs SCE
              </span>
            </div>
          </div>

          {/* Elemental Composition Chips */}
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">
              Key Alloying Element Weight %:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(alloy.composition).map(([element, pct]) => (
                <div
                  key={element}
                  className="px-2 py-1 rounded bg-[#101c2b] border border-[#1a3048] text-xs font-mono text-slate-200"
                >
                  <span className="text-cyan-400 font-bold uppercase">{element}:</span> {pct}%
                </div>
              ))}
            </div>
          </div>

          {/* Susceptibility Indicators */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-2.5 rounded-lg bg-[#0e1724] border border-[#172739]">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Pitting Resistance</span>
              <span className={`text-xs font-semibold ${
                alloy.pittingSusceptibility === 'Extremely Low' ? 'text-emerald-400' :
                alloy.pittingSusceptibility === 'Low' ? 'text-teal-400' :
                alloy.pittingSusceptibility === 'Moderate' ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {alloy.pittingSusceptibility}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#0e1724] border border-[#172739]">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">Stress Corrosion (SCC)</span>
              <span className={`text-xs font-semibold ${
                alloy.sccSusceptibility === 'Immune' ? 'text-emerald-400' :
                alloy.sccSusceptibility === 'Low' ? 'text-teal-400' : 'text-amber-400'
              }`}>
                {alloy.sccSusceptibility}
              </span>
            </div>
          </div>
        </div>

        {/* PREN & Metric Card (5 cols) */}
        <div className="md:col-span-5 bg-[#0b131d] border border-[#162738] rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-semibold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                PITTING INDEX (PREN)
              </span>
              <span className="text-[9px] font-mono text-slate-500">ASTM G48 Reference</span>
            </div>

            {alloy.category === 'Stainless Steel' || alloy.composition.cr ? (
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white font-mono">{pren.prenValue}</span>
                  <span className="text-xs font-medium text-slate-400">
                    PREN = %Cr + 3.3(%Mo + 0.5%W) + 16%N
                  </span>
                </div>

                {/* Meter Bar */}
                <div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-500 ${
                        pren.prenValue >= 40 ? 'bg-emerald-400' :
                        pren.prenValue >= 32 ? 'bg-cyan-400' :
                        pren.prenValue >= 24 ? 'bg-amber-400' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, (pren.prenValue / 50) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
                    <span>0 (Active)</span>
                    <span>24 (Marine)</span>
                    <span>32 (Duplex)</span>
                    <span>≥40 (Super Duplex)</span>
                  </div>
                </div>

                <div className="p-2 rounded bg-rose-950/20 border border-rose-900/40 text-[11px] text-rose-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Class: <strong>{pren.resistanceClass}</strong></span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-2 text-slate-400 text-xs">
                <Info className="w-6 h-6 mx-auto text-slate-600" />
                <p>PREN metric applies specifically to chromium-molybdenum stainless alloys.</p>
                <p className="text-[10px] text-slate-500">
                  This alloy relies on natural passive oxide films (e.g. TiO₂ for Ti, Al₂O₃ for Al) or noble immunity.
                </p>
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 font-mono pt-3 border-t border-slate-800/60 mt-3">
            Passivation Behavior: {alloy.passivating ? 'Stable passive oxide layer' : 'Active corrosion without protective film'}
          </div>
        </div>
      </div>
    </div>
  );
};
