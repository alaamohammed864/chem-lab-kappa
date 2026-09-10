// Crystallography & Unit Cell Laboratory Modal
// Fully supports SC, BCC, FCC, HCP with interactive 3D WebGL unit cell visualizer and parametric crystallography engine

import React, { useState, Suspense, lazy } from 'react';
import { CRYSTAL_SYSTEMS } from '../data/crystals';
import { CrystalSystem } from '../types';
import { Sparkles, X, Orbit, Compass, Calculator, Loader2, Layers, Info } from 'lucide-react';
import { CrystalCalculator } from './crystallography/CrystalCalculator';

// Lazy-load 3D WebGL crystal renderer for optimum loading performance
const CrystalVisualizer3D = lazy(() =>
  import('./crystallography/CrystalVisualizer3D').then((m) => ({ default: m.CrystalVisualizer3D }))
);

interface CrystalStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrystalStructureModal: React.FC<CrystalStructureModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedSystem, setSelectedSystem] = useState<CrystalSystem>(CRYSTAL_SYSTEMS[0]);
  const [activeMillerPlane, setActiveMillerPlane] = useState<[number, number, number] | null>([1, 1, 1]);

  if (!isOpen) return null;

  // Normalized base lattice parameter
  const baseA =
    selectedSystem.id === 'sc'
      ? 3.359
      : selectedSystem.id === 'bcc'
      ? 2.866
      : selectedSystem.id === 'fcc'
      ? 3.615
      : 2.951;

  const baseC = selectedSystem.id === 'hcp' ? 4.684 : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#091017] border border-[#1b2d42] rounded-2xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:px-6 border-b border-[#142230] flex items-center justify-between bg-[#0b141e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-950/80 border border-teal-500/40 flex items-center justify-center text-teal-400 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Crystallography & Unit Cell Laboratory</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-950 text-teal-300 border border-teal-800/60">
                  3D WebGL
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                SC, BCC, FCC, HCP lattice systems, atomic packing factor (APF), coordination numbers, and nearest-neighbor geometry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crystal System Selector Tabs */}
        <div className="p-3 bg-[#0c1520] border-b border-[#142230] flex items-center gap-2 overflow-x-auto">
          {CRYSTAL_SYSTEMS.map((sys) => (
            <button
              key={sys.id}
              onClick={() => {
                setSelectedSystem(sys);
                setActiveMillerPlane(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition cursor-pointer ${
                selectedSystem.id === sys.id
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'bg-[#080e16] text-slate-400 border border-slate-800 hover:text-white hover:bg-[#122232]'
              }`}
            >
              {sys.name}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* 3D Visualizer Column (5 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-3 rounded-2xl bg-[#08121c] border border-teal-500/30 shadow-2xl">
                <div className="flex items-center justify-between px-2 py-1 text-[10px] font-mono text-teal-400 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-1.5">
                    <Orbit className="w-3.5 h-3.5" />
                    Interactive 3D Unit Cell
                  </span>
                  <span className="text-slate-500">
                    {selectedSystem.bravais} • Pearson: {selectedSystem.symbol}
                  </span>
                </div>

                {/* 3D WebGL Canvas */}
                <Suspense
                  fallback={
                    <div className="h-[380px] flex flex-col items-center justify-center gap-3 text-teal-400 font-mono text-xs bg-[#050a10] rounded-xl border border-[#142334]">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span>Rendering 3D Lattice Geometry...</span>
                    </div>
                  }
                >
                  <CrystalVisualizer3D
                    systemId={selectedSystem.id}
                    latticeA={baseA}
                    latticeC={baseC}
                    activeMillerPlane={activeMillerPlane}
                    heightClass="h-[380px]"
                  />
                </Suspense>
              </div>

              {/* Description Card */}
              <div className="p-4 bg-[#0c1520] rounded-xl border border-[#162738] space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{selectedSystem.name}</span>
                  <span className="text-teal-400 text-[11px] font-bold">
                    APF: {(selectedSystem.apf * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">{selectedSystem.description}</p>
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px]">
                  <span className="text-slate-500">Representative materials:</span>
                  <span className="font-bold text-teal-300">{selectedSystem.commonExamples.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Parameter & Density Engine Calculator Column (6 cols) */}
            <div className="lg:col-span-6">
              <CrystalCalculator
                systemId={
                  ['sc', 'bcc', 'fcc', 'hcp'].includes(selectedSystem.id)
                    ? (selectedSystem.id as 'sc' | 'bcc' | 'fcc' | 'hcp')
                    : 'fcc'
                }
                onPlaneSelect={(plane) => setActiveMillerPlane(plane)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CrystalStructureModal;
