import React, { useState, useEffect } from 'react';
import { Beaker, ArrowRight, Info, CheckCircle2 } from 'lucide-react';
import { ChemistryService } from '../../services/chemistryService';
import { ConcentrationResult } from '../../engines';

export const ConcentrationTab: React.FC = () => {
  const [soluteFormula, setSoluteFormula] = useState('NaCl');
  const [soluteMassGrams, setSoluteMassGrams] = useState<string>('58.44');
  const [volumeLiters, setVolumeLiters] = useState<string>('1.0');
  const [densityGPerMl, setDensityGPerMl] = useState<string>('1.0');
  const [valence, setValence] = useState<number>(1);
  const [result, setResult] = useState<ConcentrationResult>(() =>
    ChemistryService.computeConcentration({
      soluteFormula: 'NaCl',
      soluteMassGrams: 58.44,
      solutionVolumeLiters: 1.0,
      solutionDensityGPerMl: 1.0,
      valenceEquivalents: 1,
    })
  );
  const [showExplanation, setShowExplanation] = useState(false);

  const presets = [
    { label: 'Normal Saline (0.9% NaCl)', formula: 'NaCl', mass: '9.0', vol: '1.0', dens: '1.005', val: 1 },
    { label: '1.0 M Sodium Hydroxide', formula: 'NaOH', mass: '40.0', vol: '1.0', dens: '1.04', val: 1 },
    { label: '0.5 M Sulfuric Acid', formula: 'H2SO4', mass: '49.04', vol: '1.0', dens: '1.03', val: 2 },
    { label: '5% Dextrose (Glucose)', formula: 'C6H12O6', mass: '50.0', vol: '1.0', dens: '1.02', val: 1 },
    { label: 'Copper(II) Sulfate', formula: 'CuSO4', mass: '15.96', vol: '0.5', dens: '1.01', val: 2 },
  ];

  const handleCalculate = () => {
    const mass = parseFloat(soluteMassGrams) || 0;
    const vol = parseFloat(volumeLiters) || 1.0;
    const dens = parseFloat(densityGPerMl) || 1.0;

    const res = ChemistryService.computeConcentration({
      soluteFormula,
      soluteMassGrams: mass,
      solutionVolumeLiters: vol,
      solutionDensityGPerMl: dens,
      valenceEquivalents: valence,
    });
    setResult(res);
  };

  useEffect(() => {
    handleCalculate();
  }, [soluteFormula, soluteMassGrams, volumeLiters, densityGPerMl, valence]);

  const handleApplyPreset = (p: typeof presets[0]) => {
    setSoluteFormula(p.formula);
    setSoluteMassGrams(p.mass);
    setVolumeLiters(p.vol);
    setDensityGPerMl(p.dens);
    setValence(p.val);
  };

  return (
    <div className="space-y-5 animate-fade-in text-xs font-sans">
      {/* Solute & Presets */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Solute Chemical Formula</span>
          <span className="text-[10px] text-teal-400">Auto-derives molecular mass</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={soluteFormula}
            onChange={(e) => setSoluteFormula(e.target.value)}
            placeholder="e.g. NaCl, NaOH, H2SO4, C6H12O6"
            className="flex-1 bg-[#0a121c] border border-[#1d3148] rounded-xl px-4 py-2.5 text-base font-mono font-bold text-white focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-mono text-slate-500 mr-1">Presets:</span>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => handleApplyPreset(p)}
              className={`px-2 py-1 rounded border text-[11px] font-mono transition cursor-pointer ${
                soluteFormula === p.formula
                  ? 'bg-teal-950 text-teal-300 border-teal-500/60'
                  : 'bg-[#0d1622] text-slate-300 border-slate-800 hover:border-teal-500/40 hover:bg-teal-950/40'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Solution Parameters Grid */}
      <div className="p-4 rounded-xl bg-[#0c1520] border border-[#162738] space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
          <span>Preparation Parameters</span>
          <span className="text-[10px] text-slate-500">Molar Mass: {result.soluteMolarMass.toFixed(3)} g/mol</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
          {/* Solute Mass */}
          <div className="p-3 bg-[#070e17] rounded-lg border border-[#1a2d40] space-y-1">
            <label className="text-[10px] text-slate-500 uppercase">Solute Mass (g)</label>
            <input
              type="number"
              value={soluteMassGrams}
              onChange={(e) => setSoluteMassGrams(e.target.value)}
              className="w-full bg-transparent font-bold text-white text-sm focus:outline-none"
            />
            <div className="text-[10px] text-teal-400">{result.soluteMoles.toFixed(4)} mol</div>
          </div>

          {/* Volume */}
          <div className="p-3 bg-[#070e17] rounded-lg border border-[#1a2d40] space-y-1">
            <label className="text-[10px] text-slate-500 uppercase">Volume (Liters)</label>
            <input
              type="number"
              value={volumeLiters}
              onChange={(e) => setVolumeLiters(e.target.value)}
              className="w-full bg-transparent font-bold text-white text-sm focus:outline-none"
            />
            <div className="text-[10px] text-slate-500">{(parseFloat(volumeLiters) * 1000 || 0).toFixed(0)} mL</div>
          </div>

          {/* Solution Density */}
          <div className="p-3 bg-[#070e17] rounded-lg border border-[#1a2d40] space-y-1">
            <label className="text-[10px] text-slate-500 uppercase">Density (g/mL)</label>
            <input
              type="number"
              value={densityGPerMl}
              onChange={(e) => setDensityGPerMl(e.target.value)}
              className="w-full bg-transparent font-bold text-white text-sm focus:outline-none"
            />
            <div className="text-[10px] text-slate-500">Total: {result.solutionMassGrams.toFixed(1)} g</div>
          </div>

          {/* Valence Equivalents */}
          <div className="p-3 bg-[#070e17] rounded-lg border border-[#1a2d40] space-y-1">
            <label className="text-[10px] text-slate-500 uppercase">Valence (n_eq)</label>
            <input
              type="number"
              value={valence}
              onChange={(e) => setValence(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-transparent font-bold text-white text-sm focus:outline-none"
            />
            <div className="text-[10px] text-slate-500">For Normality N</div>
          </div>
        </div>
      </div>

      {/* Primary Concentration Metrics Cards */}
      {result.isValid ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Molarity */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-teal-950/50 to-[#0c1520] border border-teal-500/30">
              <div className="text-[10px] font-mono uppercase tracking-wider text-teal-400">Molarity (M)</div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
                {result.molarityM.toFixed(4)}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">mol / L solution</div>
            </div>

            {/* Mass Percent */}
            <div className="p-4 rounded-xl bg-[#0c1520] border border-[#162738]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">Mass Fraction (% w/w)</div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
                {result.massPercent.toFixed(3)}%
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">{result.massConcentrationGPerL.toFixed(2)} g/L</div>
            </div>

            {/* Molality */}
            <div className="p-4 rounded-xl bg-[#0c1520] border border-[#162738]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">Molality (m)</div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
                {result.molalityM.toFixed(4)}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">mol / kg solvent</div>
            </div>

            {/* Normality */}
            <div className="p-4 rounded-xl bg-[#0c1520] border border-[#162738]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400">Normality (N)</div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
                {result.normalityN.toFixed(4)}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">equivalents / L</div>
            </div>
          </div>

          {/* Trace Level Concentrations */}
          <div className="p-4 rounded-xl bg-[#0c1520] border border-[#162738] flex flex-wrap items-center justify-between gap-4 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs">Parts Per Million (ppm):</span>
              <span className="text-sm font-bold text-emerald-300">{result.ppm.toLocaleString()} ppm</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs">Parts Per Billion (ppb):</span>
              <span className="text-sm font-bold text-sky-300">{result.ppb.toLocaleString()} ppb</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs">Total Solute:</span>
              <span className="text-sm font-bold text-white">{result.soluteMassGrams.toFixed(3)} g in {result.solutionVolumeLiters.toFixed(2)} L</span>
            </div>
          </div>

          {/* Step Explanation */}
          {result.explanation && result.explanation.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#0a121d] border border-[#162738] text-xs">
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="w-full flex items-center justify-between text-slate-300 hover:text-white transition font-mono"
              >
                <span className="flex items-center gap-2 font-semibold">
                  <Info className="w-3.5 h-3.5 text-teal-400" />
                  Derivation & Preparation Protocol
                </span>
                <span className="text-[10px] text-teal-400">{showExplanation ? 'Hide' : 'Show Protocol'}</span>
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
          {result.errors.join('; ') || 'Invalid solution parameters.'}
        </div>
      )}
    </div>
  );
};
