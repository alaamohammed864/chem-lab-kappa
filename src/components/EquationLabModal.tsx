import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  X,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Info,
  Layers,
  Atom,
  Boxes,
  FileCheck2,
} from 'lucide-react';
import { ChemistryService } from '../services/chemistryService';
import { BalancedReactionResult } from '../engines';
import { FormulaInspector } from './formula/FormulaInspector';
import { IonExplorer } from './ion/IonExplorer';
import { MoleculeExplorer } from './molecule/MoleculeExplorer';

export type EquationLabTab = 'equation' | 'formula' | 'ions' | 'molecules';

interface EquationLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEquation?: string;
  initialTab?: EquationLabTab;
}

export const EquationLabModal: React.FC<EquationLabModalProps> = ({
  isOpen,
  onClose,
  initialEquation = 'Fe + O2 -> Fe2O3',
  initialTab = 'equation',
}) => {
  const [activeTab, setActiveTab] = useState<EquationLabTab>(initialTab);
  const [equation, setEquation] = useState(initialEquation);
  const [result, setResult] = useState<BalancedReactionResult>(() =>
    ChemistryService.balanceEquationDetailed({ equation: initialEquation })
  );
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Sync initial tab whenever modal is opened with a specific tab
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const sampleReactions = [
    { label: 'Iron Oxidation / Rusting', eq: 'Fe + O2 -> Fe2O3' },
    { label: 'Glucose Combustion', eq: 'C6H12O6 + O2 -> CO2 + H2O' },
    { label: 'Methane Burning', eq: 'CH4 + O2 -> CO2 + H2O' },
    { label: 'Aluminum Acid Dissolution', eq: 'Al + HCl -> AlCl3 + H2' },
    { label: 'Haber-Bosch Ammonia Synthesis', eq: 'N2 + H2 -> NH3' },
    { label: 'Titanium Kroll Process', eq: 'TiCl4 + Mg -> Ti + MgCl2' },
  ];

  const handleBalance = async (eqToSolve = equation) => {
    setIsLoading(true);
    try {
      const res = await ChemistryService.balanceEquation(eqToSolve);
      setResult(res);
    } catch {
      const res = ChemistryService.balanceEquationDetailed({ equation: eqToSolve });
      setResult(res);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (equation.trim()) {
      const res = ChemistryService.balanceEquationDetailed({ equation });
      setResult(res);
    }
  }, [equation]);

  const handleCopy = () => {
    if (result.balanced) {
      navigator.clipboard.writeText(result.balanced);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#091017] border border-[#1b2d42] rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-[#142230] flex items-center justify-between bg-[#0b141e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              {activeTab === 'equation' && <FlaskConical className="w-5 h-5" />}
              {activeTab === 'formula' && <FileCheck2 className="w-5 h-5" />}
              {activeTab === 'ions' && <Atom className="w-5 h-5" />}
              {activeTab === 'molecules' && <Boxes className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Chemical Reaction, Ion & Molecular Workbench
              </h3>
              <p className="text-xs text-slate-400">
                Gaussian linear balancing, formula validation, ion oxidation states & 3D molecular structures
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-4 sm:px-6 py-2 border-b border-[#142230] bg-[#070d15] flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('equation')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'equation'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Reaction Balancer</span>
          </button>

          <button
            onClick={() => setActiveTab('formula')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'formula'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Formula Validator</span>
          </button>

          <button
            onClick={() => setActiveTab('ions')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'ions'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            <span>Ion Explorer & Salts</span>
          </button>

          <button
            onClick={() => setActiveTab('molecules')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'molecules'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Molecule 3D/2D Lab</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'equation' && (
            <div className="space-y-6">
              {/* Equation Input */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Unbalanced Chemical Reaction</span>
                  <span className="text-[10px] text-emerald-400">Use standard arrow -&gt;</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={equation}
                    onChange={(e) => setEquation(e.target.value)}
                    placeholder="e.g. Fe + O2 -> Fe2O3"
                    className="flex-1 bg-[#0a121c] border border-[#1d3148] rounded-xl px-4 py-3 text-base font-mono font-bold text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={() => handleBalance()}
                    disabled={isLoading}
                    className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs font-mono transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span>Balancing...</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Balance</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-mono text-slate-500 mr-1">Presets:</span>
                  {sampleReactions.map((p) => (
                    <button
                      key={p.eq}
                      onClick={() => {
                        setEquation(p.eq);
                        handleBalance(p.eq);
                      }}
                      className="px-2 py-1 rounded bg-[#0d1622] hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/50 text-[11px] font-mono text-slate-300 transition cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Balanced Result Card */}
              {result.isValid ? (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c1f24] to-[#071317] border border-emerald-500/40 space-y-4">
                    <div className="flex items-center justify-between border-b border-emerald-900/40 pb-3">
                      <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 font-semibold uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Stoichiometrically Balanced Output</span>
                      </div>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800 transition cursor-pointer"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="text-xl sm:text-3xl font-mono font-black text-white tracking-wide text-center py-3 bg-[#050c0f]/80 rounded-xl border border-emerald-950 overflow-x-auto">
                      {result.balanced}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono pt-1">
                      <div className="p-3 bg-[#081216] rounded-lg border border-[#132d36]">
                        <div className="text-[10px] text-slate-500 uppercase">Reaction Classification</div>
                        <div className="font-semibold text-emerald-300 mt-0.5">{result.reactionType}</div>
                      </div>
                      <div className="p-3 bg-[#081216] rounded-lg border border-[#132d36]">
                        <div className="text-[10px] text-slate-500 uppercase">Enthalpy of Reaction</div>
                        <div className="font-semibold text-amber-300 mt-0.5">{result.enthalpy}</div>
                      </div>
                    </div>

                    {result.deltaG && (
                      <div className="p-3 bg-[#081216] rounded-lg border border-[#132d36] text-xs font-mono flex items-center justify-between">
                        <span className="text-slate-500 uppercase text-[10px]">Gibbs Free Energy (ΔG°):</span>
                        <span className="font-semibold text-emerald-400">{result.deltaG}</span>
                      </div>
                    )}
                  </div>

                  {/* Step-by-Step Mathematical Derivation */}
                  {result.explanation && result.explanation.length > 0 && (
                    <div className="p-4 rounded-xl bg-[#0a121d] border border-[#162738] text-xs font-mono space-y-2">
                      <button
                        onClick={() => setShowExplanation(!showExplanation)}
                        className="w-full flex items-center justify-between text-slate-300 hover:text-white transition cursor-pointer"
                      >
                        <span className="flex items-center gap-2 font-semibold">
                          <Info className="w-3.5 h-3.5 text-emerald-400" />
                          Linear Algebra Matrix Steps ({result.explanation.length})
                        </span>
                        <span className="text-[10px] text-emerald-400">
                          {showExplanation ? 'Hide Steps' : 'Show Gaussian Steps'}
                        </span>
                      </button>

                      {showExplanation && (
                        <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
                          {result.explanation.map((step, idx) => (
                            <div key={idx} className="flex gap-2">
                              <span className="text-emerald-400 select-none">›</span>
                              <span>{step}</span>
                            </div>
                          ))}
                          <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-500 italic">
                            {result.assumptions.join(' ')}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs font-mono">
                  {result.errors.join('; ') || 'Could not balance equation. Please check chemical syntax.'}
                </div>
              )}

              {/* Law of Conservation of Mass */}
              <div className="p-4 rounded-xl bg-[#0c1520] border border-[#162738] space-y-2 text-xs">
                <div className="font-mono text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                  Law of Conservation of Mass (Lavoisier Principle)
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Every chemical element maintains identical atomic totals across reactants and products. Electron transfer and oxidation state shifts are conserved in equilibrium without mass loss.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'formula' && <FormulaInspector />}

          {activeTab === 'ions' && <IonExplorer />}

          {activeTab === 'molecules' && <MoleculeExplorer />}
        </div>
      </div>
    </div>
  );
};
