import React, { useState, useEffect } from 'react';
import { Scale, CheckCircle2, AlertCircle, ArrowRight, Info, Layers } from 'lucide-react';
import { ChemistryService } from '../../services/chemistryService';
import { StoichiometryResult, StoichiometryReactantInput } from '../../engines';

export const StoichiometryTab: React.FC = () => {
  const [equation, setEquation] = useState('Fe + O2 -> Fe2O3');
  const [reactantsInput, setReactantsInput] = useState<StoichiometryReactantInput[]>([
    { formula: 'Fe', amount: 50.0, unit: 'g' },
    { formula: 'O2', amount: 30.0, unit: 'g' },
  ]);
  const [targetProduct, setTargetProduct] = useState('Fe2O3');
  const [actualYieldGrams, setActualYieldGrams] = useState<string>('62.5');
  const [result, setResult] = useState<StoichiometryResult>(() =>
    ChemistryService.computeStoichiometry({
      equation: 'Fe + O2 -> Fe2O3',
      reactants: [
        { formula: 'Fe', amount: 50.0, unit: 'g' },
        { formula: 'O2', amount: 30.0, unit: 'g' },
      ],
      targetProduct: 'Fe2O3',
      actualYield: { amount: 62.5, unit: 'g' },
    })
  );
  const [showExplanation, setShowExplanation] = useState(false);

  const presets = [
    {
      label: 'Iron Oxidation',
      eq: 'Fe + O2 -> Fe2O3',
      reactants: [
        { formula: 'Fe', amount: 56.0, unit: 'g' as const },
        { formula: 'O2', amount: 32.0, unit: 'g' as const },
      ],
      target: 'Fe2O3',
      actual: '70.0',
    },
    {
      label: 'Methane Combustion',
      eq: 'CH4 + O2 -> CO2 + H2O',
      reactants: [
        { formula: 'CH4', amount: 16.0, unit: 'g' as const },
        { formula: 'O2', amount: 80.0, unit: 'g' as const },
      ],
      target: 'CO2',
      actual: '40.0',
    },
    {
      label: 'Haber Ammonia',
      eq: 'N2 + H2 -> NH3',
      reactants: [
        { formula: 'N2', amount: 28.0, unit: 'g' as const },
        { formula: 'H2', amount: 10.0, unit: 'g' as const },
      ],
      target: 'NH3',
      actual: '30.0',
    },
    {
      label: 'Aluminum Acid Dissolution',
      eq: 'Al + HCl -> AlCl3 + H2',
      reactants: [
        { formula: 'Al', amount: 27.0, unit: 'g' as const },
        { formula: 'HCl', amount: 150.0, unit: 'g' as const },
      ],
      target: 'H2',
      actual: '2.8',
    },
  ];

  const handleCalculate = () => {
    const act = parseFloat(actualYieldGrams);
    const res = ChemistryService.computeStoichiometry({
      equation,
      reactants: reactantsInput,
      targetProduct: targetProduct || undefined,
      actualYield: !isNaN(act) && act > 0 ? { amount: act, unit: 'g' } : undefined,
    });
    setResult(res);
  };

  useEffect(() => {
    handleCalculate();
  }, [equation, reactantsInput, targetProduct, actualYieldGrams]);

  const handleUpdateReactant = (idx: number, field: keyof StoichiometryReactantInput, value: any) => {
    const updated = [...reactantsInput];
    updated[idx] = { ...updated[idx], [field]: value };
    setReactantsInput(updated);
  };

  const handleLoadPreset = (p: typeof presets[0]) => {
    setEquation(p.eq);
    setReactantsInput(p.reactants);
    setTargetProduct(p.target);
    setActualYieldGrams(p.actual);
  };

  return (
    <div className="space-y-5 animate-fade-in text-xs font-sans">
      {/* Reaction Equation Input */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Chemical Reaction Equation</span>
          <span className="text-[10px] text-cyan-400">Auto-balanced for stoichiometry</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={equation}
            onChange={(e) => setEquation(e.target.value)}
            placeholder="e.g. Fe + O2 -> Fe2O3 or CH4 + O2 -> CO2 + H2O"
            className="flex-1 bg-[#0a121c] border border-[#1d3148] rounded-xl px-4 py-2.5 text-base font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-mono text-slate-500 mr-1">Presets:</span>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => handleLoadPreset(p)}
              className={`px-2 py-1 rounded border text-[11px] font-mono transition cursor-pointer ${
                equation === p.eq
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60'
                  : 'bg-[#0d1622] text-slate-300 border-slate-800 hover:border-cyan-500/40 hover:bg-cyan-950/40'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reactants Input Row */}
      <div className="p-4 rounded-xl bg-[#0c1520] border border-[#162738] space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
          <span>Starting Reactant Quantities</span>
          <span className="text-[10px] text-slate-500">Provide mass (g) or moles</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {reactantsInput.map((r, idx) => (
            <div key={idx} className="p-3 bg-[#070e17] rounded-lg border border-[#1a2d40] space-y-2">
              <div className="flex items-center justify-between font-mono">
                <input
                  type="text"
                  value={r.formula}
                  onChange={(e) => handleUpdateReactant(idx, 'formula', e.target.value)}
                  className="bg-transparent font-bold text-white text-sm focus:outline-none w-20"
                  placeholder="Formula"
                />
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/60 rounded px-1 py-0.5">
                  <button
                    onClick={() => handleUpdateReactant(idx, 'unit', 'g')}
                    className={`px-1.5 py-0.5 text-[10px] rounded cursor-pointer ${
                      r.unit === 'g' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Grams
                  </button>
                  <button
                    onClick={() => handleUpdateReactant(idx, 'unit', 'mol')}
                    className={`px-1.5 py-0.5 text-[10px] rounded cursor-pointer ${
                      r.unit === 'mol' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Moles
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={r.amount}
                  onChange={(e) => handleUpdateReactant(idx, 'amount', parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#0a121c] border border-slate-800 rounded px-2 py-1 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
                <span className="text-slate-400 font-mono text-xs w-8">{r.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Target Product and Actual Yield for Percent Yield */}
        <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase">Target Product for Yield</label>
            <input
              type="text"
              value={targetProduct}
              onChange={(e) => setTargetProduct(e.target.value)}
              placeholder="e.g. Fe2O3"
              className="mt-1 w-full bg-[#070e17] border border-[#1a2d40] rounded-lg px-3 py-1.5 font-mono text-white text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-slate-400 uppercase">Actual Lab Yield (Grams, optional)</label>
            <input
              type="number"
              value={actualYieldGrams}
              onChange={(e) => setActualYieldGrams(e.target.value)}
              placeholder="e.g. 62.5"
              className="mt-1 w-full bg-[#070e17] border border-[#1a2d40] rounded-lg px-3 py-1.5 font-mono text-emerald-300 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Stoichiometry Results */}
      {result.isValid ? (
        <div className="space-y-4">
          {/* Headline Banner: Limiting Reagent & Balanced Equation */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#0c1c2b] to-[#091522] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                Balanced Stoichiometric Equation
              </div>
              <div className="text-base sm:text-lg font-mono font-bold text-white mt-0.5">
                {result.balancedEquation}
              </div>
            </div>

            <div className="flex items-center gap-2 bg-amber-950/60 border border-amber-500/40 px-3 py-1.5 rounded-lg shrink-0">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="text-[11px] font-mono text-amber-300 font-bold">
                Limiting Reagent: {result.limitingReagent}
              </span>
            </div>
          </div>

          {/* Reactants Consumption Table */}
          <div className="p-4 rounded-xl bg-[#0c1520] border border-[#162738] space-y-2.5">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Reagent Consumption & Excess Analysis
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-[10px]">
                    <th className="pb-1.5">Reactant</th>
                    <th className="pb-1.5">Initial Mass</th>
                    <th className="pb-1.5">Consumed</th>
                    <th className="pb-1.5">Excess Remaining</th>
                    <th className="pb-1.5 text-right">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {result.reactantsAnalysis.map((r) => (
                    <tr key={r.formula}>
                      <td className="py-2 font-bold text-white">{r.formula}</td>
                      <td className="py-2 text-slate-300">{r.initialMass.toFixed(2)} g ({r.initialMoles.toFixed(3)} mol)</td>
                      <td className="py-2 text-rose-300">-{r.massConsumed.toFixed(2)} g</td>
                      <td className="py-2 text-emerald-300 font-bold">
                        {r.isLimiting ? '0.00 g (Fully Consumed)' : `${r.massRemaining.toFixed(2)} g (${r.molesRemaining.toFixed(3)} mol)`}
                      </td>
                      <td className="py-2 text-right">
                        {r.isLimiting ? (
                          <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-500/50 text-[10px] text-amber-300 font-bold">
                            LIMITING
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                            EXCESS
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Theoretical & Percent Yield Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.productsYield.map((p) => (
              <div
                key={p.formula}
                className="p-4 rounded-xl bg-[#0c1520] border border-[#162738] space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-white">{p.formula}</span>
                    <span className="text-[10px] font-mono text-slate-400">{p.molarMass.toFixed(2)} g/mol</span>
                  </div>
                  <div className="mt-2 text-2xl font-black font-mono text-cyan-300">
                    {p.theoreticalMass.toFixed(2)} <span className="text-xs font-normal text-slate-400">g theoretical</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {p.theoreticalMoles.toFixed(4)} moles
                    {p.volumeAtSTP && (
                      <span className="text-emerald-400 ml-1.5 font-bold">
                        ({p.volumeAtSTP.toFixed(2)} L at STP)
                      </span>
                    )}
                  </div>
                </div>

                {p.percentYield !== undefined && (
                  <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">Actual: {p.actualMass?.toFixed(2)} g</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-xs font-mono font-bold text-emerald-300">
                      {p.percentYield.toFixed(1)}% Yield
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Step Explanation */}
          {result.explanation && result.explanation.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#0a121d] border border-[#162738] text-xs">
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="w-full flex items-center justify-between text-slate-300 hover:text-white transition font-mono"
              >
                <span className="flex items-center gap-2 font-semibold">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  Stoichiometric Deduction Steps ({result.explanation.length})
                </span>
                <span className="text-[10px] text-cyan-400">{showExplanation ? 'Hide' : 'Show Details'}</span>
              </button>

              {showExplanation && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 font-mono text-[11px] text-slate-400 whitespace-pre-wrap">
                  {result.explanation.map((step, idx) => (
                    <div key={idx} className="leading-relaxed">
                      {step}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs font-mono">
          {result.errors.join('; ') || 'Unable to compute stoichiometry for these inputs.'}
        </div>
      )}
    </div>
  );
};
