import React from 'react';
import { HelpCircle, X, BookOpen, Compass, ShieldCheck, Atom } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#091017] border border-[#1b2d42] rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-[#142230] flex items-center justify-between bg-[#0b141e]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Scientific References & User Documentation
              </h3>
              <p className="text-xs text-slate-400">Alaa Chem Lab engineering principles and calculation standards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-[#0c1622] border border-[#172737] space-y-1.5">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Atom className="w-4 h-4 text-cyan-400" />
              Periodic Table & Atomic Masses
            </h4>
            <p>
              Standard atomic masses are based on IUPAC Commission on Isotopic Abundances and Atomic Weights (CIAAW) recommendations with carbon-12 (¹²C = 12 u) reference standards.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0c1622] border border-[#172737] space-y-1.5">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Compass className="w-4 h-4 text-teal-400" />
              Crystallography & Bragg's Law
            </h4>
            <p>
              Interplanar d-spacing is computed via Bragg's law: <code className="text-cyan-300 font-mono">λ = 2d sin θ</code>. For cubic lattices (FCC, BCC), <code className="text-cyan-300 font-mono">d = a / √(h² + k² + l²)</code>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0c1622] border border-[#172737] space-y-1.5">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Materials Standards & Grades
            </h4>
            <p>
              Material mechanical properties (Yield strength, Ultimate Tensile Strength, Elastic Modulus) reflect ASTM and AMS standards for aerospace and petrochemical service.
            </p>
          </div>

          <div className="text-[11px] font-mono text-slate-400 text-center pt-2">
            Engineer in charge: <strong className="text-white">ENG ALAA MOHAMMED</strong> • Scientific Workspace 2026
          </div>
        </div>
      </div>
    </div>
  );
};
