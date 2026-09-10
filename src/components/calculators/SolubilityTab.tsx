import React, { useState, useEffect } from 'react';
import { Sparkles, Info } from 'lucide-react';
import { ChemistryService } from '../../services/chemistryService';
import { SolubilityInputs, SolubilityResult, SolubilityCalculationMode } from '../../engines';

export const SolubilityTab: React.FC = () => {
  const [mode, setMode] = useState<SolubilityCalculationMode>('molar_solubility');
  const [saltFormula, setSaltFormula] = useState('AgCl');
  const [commonIon, setCommonIon] = useState<'cation' | 'anion'>('anion');
  const [commonIonM, setCommonIonM] = useState<string>('0.05');
  const [qCationM, setQCationM] = useState<string>('1.0e-4');
  const [qAnionM, setQAnionM] = useState<string>('1.0e-4');

  const [result, setResult] = useState<SolubilityResult>(() =>
    ChemistryService.computeSolubility({
      mode: 'molar_solubility',
      saltFormula: 'AgCl',
    })
  );
  const [showExplanation, setShowExplanation] = useState(false);

  const presets = [
    { label: 'Silver Chloride (AgCl, 1:1)', formula: 'AgCl', mode: 'molar_solubility' as const },
    { label: 'Calcium Fluoride (CaF2, 1:2)', formula: 'CaF2', mode: 'molar_solubility' as const },
    { label: 'Lead(II) Iodide (PbI2, 1:2)', formula: 'PbI2', mode: 'molar_solubility' as const },
    { label: 'Barium Sulfate (BaSO4, 1:1)', formula: 'BaSO4', mode: 'molar_solubility' as const },
    { label: 'Iron(III) Hydroxide (Fe(OH)3, 1:3)', formula: 'Fe(OH)3', mode: 'molar_solubility' as const },
    { label: 'AgCl in 0.05 M NaCl (Common Anion)', formula: 'AgCl', mode: 'common_ion_effect' as const, cIon: 'anion' as const, cM: '0.05' },
    { label: 'Precipitation Test (Ag⁺ 1e-4M + Cl⁻ 1e-4M)', formula: 'AgCl', mode: 'precipitation_quotient' as const, catM: '1.0e-4', anM: '1.0e-4' },
  ];

  const handleCalculate = () => {
    const cIonM = commonIonM ? parseFloat(commonIonM) : undefined;
    const catM = qCationM ? parseFloat(qCationM) : undefined;
    const anM = qAnionM ? parseFloat(qAnionM) : undefined;

    const res = ChemistryService.computeSolubility({
      mode,
      saltFormula,
      commonIon,
      commonIonConcentrationM: cIonM,
      cationConcentrationM: catM,
      anionConcentrationM: anM,
    });
    setResult(res);
  };

  useEffect(() => {
    handleCalculate();
  }, [mode, saltFormula, commonIon, commonIonM, qCationM, qAnionM]);

  const handleApplyPreset = (p: typeof presets[0]) => {
    setSaltFormula(p.formula);
    setMode(p.mode);
    if (p.cIon) setCommonIon(p.cIon);
    if (p.cM) setCommonIonM(p.cM);
    if (p.catM) setQCationM(p.catM);
    if (p.anM) setQAnionM(p.anM);
  };

  return (
    <div className="space-y-5 animate-fade-in text-xs font-sans">
      {/* Mode Selector */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Solubility & Equilibrium Mode</span>
          <span className="text-[10px] text-teal-400">Exact Ksp dissolution & common ion suppression</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
          {(
            [
              { id: 'molar_solubility', label: 'Pure Water Solubility' },
              { id: 'common_ion_effect', label: 'Common Ion Effect' },
              { id: 'precipitation_quotient', label: 'Precipitation (Q vs Ksp)' },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`py-2 px-3 rounded-lg border font-bold transition cursor-pointer text-center ${
                mode === m.id
                  ? 'bg-teal-950 border-teal-500 text-teal-200 shadow-sm'
                  : 'bg-[#0d1622] border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-[#121f30]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-mono text-slate-500 mr-1">Presets:</span>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => handleApplyPreset(p)}
              className="px-2 py-1 rounded border text-[11px] font-mono transition cursor-pointer bg-[#0d1622] text-slate-300 border-slate-800 hover:border-teal-500/40 hover:bg-teal-950/40"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="p-4 rounded-xl bg-[#0c1520] border border-[#162738] space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Equilibrium Salt Parameters
          </span>
          <span className="text-[10px] text-teal-400">{result.saltName}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Salt Formula */}
          <div>
            <label className="text-[10px] text-slate-500 uppercase">Sparingly Soluble Salt</label>
            <input
              type="text"
              value={saltFormula}
              onChange={(e) => setSaltFormula(e.target.value)}
              placeholder="e.g. AgCl, CaF2, PbI2"
              className="mt-1 w-full bg-[#070e17] border border-[#1a2d40] rounded-lg px-3 py-2 font-bold text-white text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Common Ion Mode Inputs */}
          {mode === 'common_ion_effect' && (
            <>
              <div>
                <label className="text-[10px] text-slate-500 uppercase">Common Ion Type</label>
                <select
                  value={commonIon}
                  onChange={(e) => setCommonIon(e.target.value as 'cation' | 'anion')}
                  className="mt-1 w-full bg-[#070e17] border border-[#1a2d40] rounded-lg px-3 py-2 font-bold text-sky-300 text-xs focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="anion">Common Anion (e.g. Cl⁻ from NaCl)</option>
                  <option value="cation">Common Cation (e.g. Ag⁺ from AgNO3)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase">Common Ion Concentration (M)</label>
                <input
                  type="number"
                  step="any"
                  value={commonIonM}
                  onChange={(e) => setCommonIonM(e.target.value)}
                  className="mt-1 w-full bg-[#070e17] border border-[#1a2d40] rounded-lg px-3 py-2 font-bold text-amber-300 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>
            </>
          )}

          {/* Precipitation Quotient Inputs */}
          {mode === 'precipitation_quotient' && (
            <>
              <div>
                <label className="text-[10px] text-slate-500 uppercase">Initial [Cation] (M)</label>
                <input
                  type="number"
                  step="any"
                  value={qCationM}
                  onChange={(e) => setQCationM(e.target.value)}
                  className="mt-1 w-full bg-[#070e17] border border-[#1a2d40] rounded-lg px-3 py-2 font-bold text-rose-300 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase">Initial [Anion] (M)</label>
                <input
                  type="number"
                  step="any"
                  value={qAnionM}
                  onChange={(e) => setQAnionM(e.target.value)}
                  className="mt-1 w-full bg-[#070e17] border border-[#1a2d40] rounded-lg px-3 py-2 font-bold text-blue-300 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Solubility Results */}
      {result.isValid ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Primary Solubility Card */}
            <div className="md:col-span-6 p-5 rounded-xl bg-gradient-to-br from-teal-950/60 to-[#0c1520] border border-teal-500/40 space-y-3 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-teal-300">
                  Molar Solubility (s)
                </div>
                <div className="text-3xl sm:text-4xl font-black font-mono text-white mt-1">
                  {result.molarSolubilityMolPerL.toExponential(4)}
                  <span className="text-sm font-normal text-slate-400 ml-1.5">mol/L</span>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-2">
                  Dissociation: <span className="text-teal-200 font-bold">{result.dissociationEquation}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-teal-900/50 flex justify-between text-[11px] font-mono text-slate-300">
                <span>Mass Solubility:</span>
                <span className="font-bold text-teal-300">
                  {result.massSolubilityGPerL < 0.001
                    ? `${(result.massSolubilityGPerL * 1000).toFixed(3)} mg/L`
                    : `${result.massSolubilityGPerL.toFixed(4)} g/L`}
                </span>
              </div>
            </div>

            {/* Equilibrium Constant & Status */}
            <div className="md:col-span-6 p-5 rounded-xl bg-[#0c1520] border border-[#162738] space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Solubility Product Constant
                </span>
                <span className="text-xs text-teal-400 font-bold">Ksp = {result.ksp.toExponential(2)}</span>
              </div>

              {mode === 'precipitation_quotient' && result.reactionQuotientQ !== undefined && (
                <div className="p-3 bg-[#070e17] rounded-lg border border-[#1a2d40] space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Ion Product (Q):</span>
                    <span className="font-bold text-white">{result.reactionQuotientQ.toExponential(3)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Precipitation Expected:</span>
                    <span className={`font-bold ${result.precipitationExpected ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {result.precipitationExpected ? 'YES (Precipitates)' : 'NO (Remains Dissolved)'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 pt-1">
                    State: {result.saturationState}
                  </div>
                </div>
              )}

              {mode === 'common_ion_effect' && result.commonIonEffectComparison && (
                <div className="p-3 bg-[#070e17] rounded-lg border border-[#1a2d40] space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pure Water (s₀):</span>
                    <span className="text-slate-300">{result.commonIonEffectComparison.pureWaterSolubility.toExponential(3)} M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">With Common Ion (s):</span>
                    <span className="text-amber-300 font-bold">{result.commonIonEffectComparison.suppressedSolubility.toExponential(3)} M</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800 text-[10px]">
                    <span className="text-slate-500">Solubility Reduction:</span>
                    <span className="text-rose-400 font-bold">{result.commonIonEffectComparison.reductionFactor.toFixed(1)}× suppressed</span>
                  </div>
                </div>
              )}

              <div className="text-[11px] text-slate-400">
                Formula Weight: <span className="text-white font-bold">{result.molarMass.toFixed(2)} g/mol</span>
              </div>
            </div>
          </div>

          {/* Derivation Steps */}
          {result.explanation && result.explanation.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#0a121d] border border-[#162738] text-xs">
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="w-full flex items-center justify-between text-slate-300 hover:text-white transition font-mono"
              >
                <span className="flex items-center gap-2 font-semibold">
                  <Info className="w-3.5 h-3.5 text-teal-400" />
                  Ksp Equilibrium Derivation Steps
                </span>
                <span className="text-[10px] text-teal-400">{showExplanation ? 'Hide' : 'Show Details'}</span>
              </button>

              {showExplanation && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 font-mono text-[11px] text-slate-400">
                  {result.explanation.map((step, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-teal-400 select-none">›</span>
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
          {result.errors.join('; ') || 'Invalid solubility parameters.'}
        </div>
      )}
    </div>
  );
};
