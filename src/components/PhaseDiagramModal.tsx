// Phase Diagram Modal wrapper with React.lazy and Suspense for optimal performance

import React, { Suspense, lazy } from 'react';
import { X, Layers, Loader2 } from 'lucide-react';

// Lazy-load heavy SVG and calculation module
const PhaseDiagramModule = lazy(() => import('./phaseDiagram/PhaseDiagramModule'));

interface PhaseDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhaseDiagramModal: React.FC<PhaseDiagramModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#091017] border border-[#1b2d42] rounded-2xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:px-6 border-b border-[#142230] flex items-center justify-between bg-[#0b141e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Phase Diagram & Metallurgical Equilibrium Suite</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  v2.0
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Binary systems, Lever Rule calculations, liquidus/solidus boundaries, and microstructural evolution
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

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <Suspense
            fallback={
              <div className="h-96 flex flex-col items-center justify-center gap-3 text-cyan-400 font-mono text-xs">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span>Loading Phase Diagram Engine & Boundary Solvers...</span>
              </div>
            }
          >
            <PhaseDiagramModule />
          </Suspense>
        </div>
      </div>
    </div>
  );
};
