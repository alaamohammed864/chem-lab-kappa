// Comprehensive Phase Diagram Module
// Provides interactive binary systems (Cu-Ni, Pb-Sn, Fe-C, Al-Si), lever-rule computation, and microstructure exploration

import React, { useState } from 'react';
import {
  BINARY_SYSTEMS,
  BinaryPhaseSystem,
  evaluatePhaseState,
} from '../../engines/materials/phaseDiagramEngine';
import { PhaseDiagramCanvas } from './PhaseDiagramCanvas';
import { PhaseInspectorPanel } from './PhaseInspectorPanel';
import {
  Layers,
  AlertTriangle,
  Flame,
  Info,
  ExternalLink,
  Target,
  FileDown,
} from 'lucide-react';

export const PhaseDiagramModule: React.FC = () => {
  const [selectedSystemId, setSelectedSystemId] = useState<string>('cu-ni');
  const activeSystem = BINARY_SYSTEMS.find((s) => s.id === selectedSystemId) || BINARY_SYSTEMS[0];

  // Selected operating state point
  const [selectedX, setSelectedX] = useState<number>(40); // 40 wt% Ni
  const [selectedT, setSelectedT] = useState<number>(1250); // 1250 °C

  // Change system handler
  const handleSystemChange = (systemId: string) => {
    setSelectedSystemId(systemId);
    const newSys = BINARY_SYSTEMS.find((s) => s.id === systemId);
    if (newSys) {
      // Default to mid-range
      const midX = (newSys.compositionRange.min + newSys.compositionRange.max) / 2;
      const midT = (newSys.temperatureRange.min + newSys.temperatureRange.max) / 2;
      setSelectedX(Number(midX.toFixed(1)));
      setSelectedT(Math.round(midT));
    }
  };

  const handleSelectPoint = (x: number, t: number) => {
    setSelectedX(x);
    setSelectedT(t);
  };

  // Evaluate current phase state
  const evaluation = evaluatePhaseState(activeSystem, selectedX, selectedT);

  return (
    <div className="space-y-6">
      {/* Top Header & Binary System Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#18283a]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-mono text-white tracking-wide">
              Binary Phase Diagrams & Lever Rule Engine
            </h2>
            <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 text-[10px] font-mono font-bold uppercase">
              Thermodynamic Equilibrium
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Real-time multi-phase equilibrium modeling, liquidus/solidus boundaries, and microstructural analysis.
          </p>
        </div>

        {/* System Selector Pills */}
        <div className="flex flex-wrap gap-1.5 bg-[#0a141e] p-1.5 rounded-xl border border-[#172b3e]">
          {BINARY_SYSTEMS.map((sys) => (
            <button
              key={sys.id}
              onClick={() => handleSystemChange(sys.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                activeSystem.id === sys.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-[#122232]'
              }`}
            >
              {sys.name}
            </button>
          ))}
        </div>
      </div>

      {/* Demonstration Dataset Notice */}
      {activeSystem.isDemonstration && (
        <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-xl flex items-start gap-2.5 text-xs font-mono text-amber-200/90">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-amber-300">Demonstration Dataset:</span> This phase boundary
            profile represents educational approximations of the {activeSystem.name} system ({activeSystem.classification})
            sourced from {activeSystem.dataSource}. For mission-critical metallurgical fabrication, consult
            formal ASM International Handbooks.
          </div>
        </div>
      )}

      {/* Invariant Reaction Shortcuts */}
      {activeSystem.invariantPoints.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-rose-400" />
            <span>Invariant Reactions:</span>
          </span>
          {activeSystem.invariantPoints.map((pt) => (
            <button
              key={pt.id}
              onClick={() => handleSelectPoint(pt.composition, pt.temperature)}
              className="px-2.5 py-1 bg-[#0b1622] hover:bg-rose-950 hover:text-rose-300 border border-[#192b3e] text-slate-300 rounded-lg transition cursor-pointer flex items-center gap-1.5"
            >
              <span className="font-bold text-rose-400 uppercase text-[10px]">{pt.type}:</span>
              <span>
                {pt.composition} wt% @ {pt.temperature}°C
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Main Workspace Layout (Canvas Left, Inspector Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Diagram Canvas */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-4">
          <div className="bg-[#08111a] p-3 rounded-2xl border border-[#162738] shadow-2xl">
            <PhaseDiagramCanvas
              system={activeSystem}
              selectedX={selectedX}
              selectedT={selectedT}
              onSelectPoint={handleSelectPoint}
              evaluation={evaluation}
            />
          </div>

          {/* System Industrial Significance */}
          <div className="p-4 bg-[#091420] rounded-xl border border-[#162738] text-xs font-mono space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase">
              <Info className="w-4 h-4" />
              <span>System Metallurgical Notes & Applications</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-slate-300">
              {activeSystem.educationalNotes.map((note, idx) => (
                <li key={idx} className="leading-relaxed">{note}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Inspector, Sliders, & Lever Rule */}
        <div className="lg:col-span-5 xl:col-span-5">
          <PhaseInspectorPanel
            system={activeSystem}
            selectedX={selectedX}
            selectedT={selectedT}
            onSelectPoint={handleSelectPoint}
            evaluation={evaluation}
          />
        </div>
      </div>
    </div>
  );
};
export default PhaseDiagramModule;
