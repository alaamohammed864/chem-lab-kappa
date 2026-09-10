import React, { useState, useEffect } from 'react';
import { Flame, Sparkles, Info, Thermometer } from 'lucide-react';
import { ChemistryService } from '../../services/chemistryService';
import { ThermochemistryInputs, ThermochemistryResult, ThermoMode } from '../../engines';

export const ThermochemistryTab: React.FC = () => {
  const [mode, setMode] = useState<ThermoMode>('reaction_thermodynamics');
  const [equation, setEquation] = useState('CH4 + 2O2 -> CO2 + 2H2O');
  const [temperatureK, setTemperatureK] = useState<string>('298.15');

  // Calorimetry inputs: q = m * c * ΔT
  const [waterMass, setWaterMass] = useState<string>('250');
  const [specificHeat, setSpecificHeat] = useState<string>('4.184');
  const [initialTemp, setInitialTemp] = useState<string>('20.0');
  const [finalTemp, setFinalTemp] = useState<string>('45.5');

  const [result, setResult] = useState<ThermochemistryResult>(() =>
    ChemistryService.computeThermochemistry({
      mode: 'reaction_thermodynamics',
      equation: 'CH4 + 2O2 -> CO2 + 2H2O',
      temperatureKelvin: 298.15,
    })
  );
  const [showExplanation, setShowExplanation] = useState(false);

  const presets = [
    { label: 'Methane Combustion', eq: 'CH4 + 2O2 -> CO2 + 2H2O', mode: 'reaction_thermodynamics' as const },
    { label: 'Haber-Bosch Ammonia', eq: 'N2 + 3H2 -> 2NH3', mode: 'reaction_thermodynamics' as const },
    { label: 'Iron Oxidation / Rust', eq: '4Fe + 3O2 -> 2Fe2O3', mode: 'reaction_thermodynamics' as const },
    { label: 'Limestone Decomposition', eq: 'CaCO3 -> CaO + CO2', mode: 'reaction_thermodynamics' as const },
    { label: 'Bomb Calorimetry (250g H2O, ΔT=25.5°C)', eq: '', mode: 'calorimetry' as const, m: '250', c: '4.184', ti: '20.0', tf: '45.5' },
  ];

  const handleCalculate = () => {
    const tK = parseFloat(temperatureK) || 298.15;
    const m = parseFloat(waterMass) || 0;
    const c = parseFloat(specificHeat) || 4.184;
    const ti = parseFloat(initialTemp) || 0;
    const tf = parseFloat(finalTemp) || 0;

    const res = ChemistryService.computeThermochemistry({
      mode,
      equation,
      temperatureKelvin: tK,
      massGrams: m,
      specificHeatJPerGC: c,
      initialTempC: ti,
      finalTempC: tf,
    });
    setResult(res);
  };

  useEffect(() => {
    handleCalculate();
  }, [mode, equation, temperatureK, waterMass, specificHeat, initialTemp, finalTemp]);

  const handleApplyPreset = (p: typeof presets[0]) => {
    setMode(p.mode);
    if (p.eq) setEquation(p.eq);
    if (p.m) setWaterMass(p.m);
    if (p.c) setSpecificHeat(p.c);
    if (p.ti) setInitialTemp(p.ti);
    if (p.tf) setFinalTemp(p.tf);
  };

  return (
    <div className="space-y-5 animate-fade-in text-xs font-sans">
      {/* Mode Selector */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Thermodynamic Analysis Mode</span>
          <span className="text-[10px] text-amber-400">Hess's Law ΔH°, ΔS°, ΔG° & Calorimetry (q = mcΔT)</span>
        </label>

        <div className="grid grid-cols-2 gap-2 font-mono text-xs">
          <button
            onClick={() => setMode('reaction_thermodynamics')}
            className={`py-2 px-3 rounded-lg border font-bold transition cursor-pointer text-center ${
              mode === 'reaction_thermodynamics'
                ? 'bg-amber-950 border-amber-500 text-amber-200 shadow-sm'
                : 'bg-[#0d1622] border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-[#121f30]'
            }`}
          >
            Hess's Law & Reaction State Functions
          </button>
          <button
            onClick={() => setMode('calorimetry')}
            className={`py-2 px-3 rounded-lg border font-bold transition cursor-pointer text-center ${
              mode === 'calorimetry'
                ? 'bg-amber-950 border-amber-500 text-amber-200 shadow-sm'
                : 'bg-[#0d1622] border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-[#121f30]'
            }`}
          >
            Calorimetry & Heat Exchange (q = mcΔT)
          </button>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-mono text-slate-500 mr-1">Presets:</span>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => handleApplyPreset(p)}
              className="px-2 py-1 rounded border text-[11px] font-mono transition cursor-pointer bg-[#0d1622] text-slate-300 border-slate-800 hover:border-amber-500/40 hover:bg-amber-950/40"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      {mode === 'reaction_thermodynamics' ? (
        <div className="p-4 rounded-xl bg-[#0c1520] border border-[#162738] space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Reaction Equation & Temperature
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500">T (Kelvin):</span>
              <input
                type="number"
                value={temperatureK}
                onChange={(e) => setTemperatureK(e.target.value)}
                className="w-20 bg-[#070e17] border border-slate-700 text-amber-300 rounded px-2 py-0.5 text-xs text-center"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 uppercase">Chemical Reaction</label>
            <input
              type="text"
              value={equation}
              onChange={(e) => setEquation(e.target.value)}
              placeholder="e.g. CH4 + 2O2 -> CO2 + 2H2O"
              className="mt-1 w-full bg-[#070e17] border border-[#1a2d40] rounded-lg px-4 py-2.5 font-bold text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-[#0c1520] border border-[#162738] space-y-3 font-mono">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800/80 pb-2.5">
            Calorimetric Measurement Inputs
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] text-slate-500 uppercase">Mass (g)</label>
              <input
                type="number"
                value={waterMass}
                onChange={(e) => setWaterMass(e.target.value)}
                className="mt-1 w-full bg-[#070e17] border border-[#1a2d40] rounded px-3 py-1.5 font-bold text-white text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase">Specific Heat c (J/g·°C)</label>
              <input
                type="number"
                value={specificHeat}
                onChange={(e) => setSpecificHeat(e.target.value)}
                className="mt-1 w-full bg-[#070e17] border border-[#1a2d40] rounded px-3 py-1.5 font-bold text-amber-300 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase">Initial Temp Ti (°C)</label>
              <input
                type="number"
                value={initialTemp}
                onChange={(e) => setInitialTemp(e.target.value)}
                className="mt-1 w-full bg-[#070e17] border border-[#1a2d40] rounded px-3 py-1.5 font-bold text-sky-300 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase">Final Temp Tf (°C)</label>
              <input
                type="number"
                value={finalTemp}
                onChange={(e) => setFinalTemp(e.target.value)}
                className="mt-1 w-full bg-[#070e17] border border-[#1a2d40] rounded px-3 py-1.5 font-bold text-rose-300 text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {result.isValid ? (
        <div className="space-y-4">
          {mode === 'reaction_thermodynamics' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
              {/* ΔH Enthalpy */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#161209] to-[#0c1520] border border-amber-500/40 space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-amber-400">Standard Enthalpy ΔH°rxn</div>
                <div className="text-2xl font-black text-white">
                  {result.deltaHReactionKJ.toFixed(2)}
                  <span className="text-xs font-normal text-slate-400 ml-1">kJ/mol</span>
                </div>
                <div className="text-[11px] font-bold text-amber-300">
                  {result.isExothermic ? 'Exothermic (Releases Heat)' : 'Endothermic (Absorbs Heat)'}
                </div>
              </div>

              {/* ΔS Entropy */}
              <div className="p-4 rounded-xl bg-[#0c1520] border border-[#162738] space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-sky-400">Standard Entropy ΔS°rxn</div>
                <div className="text-2xl font-black text-white">
                  {result.deltaSReactionJPerK.toFixed(2)}
                  <span className="text-xs font-normal text-slate-400 ml-1">J/(mol·K)</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {result.deltaSReactionJPerK > 0 ? 'Increase in disorder' : 'Decrease in disorder'}
                </div>
              </div>

              {/* ΔG Gibbs Free Energy */}
              <div className="p-4 rounded-xl bg-[#0c1520] border border-[#162738] space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-emerald-400">Gibbs Free Energy ΔG°rxn</div>
                <div className="text-2xl font-black text-white">
                  {result.deltaGReactionKJ.toFixed(2)}
                  <span className="text-xs font-normal text-slate-400 ml-1">kJ/mol</span>
                </div>
                <div className="text-[11px] font-bold text-emerald-300">
                  {result.isSpontaneous ? 'Spontaneous at 298.15K' : 'Non-spontaneous (Requires Work)'}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-gradient-to-br from-amber-950/60 to-[#0c1520] border border-amber-500/40 space-y-2 font-mono">
              <div className="text-[10px] uppercase tracking-wider text-amber-300">Heat Transferred (q = mcΔT)</div>
              <div className="text-3xl font-black text-white">
                {result.heatTransferredKJ?.toFixed(3)}
                <span className="text-sm font-normal text-slate-400 ml-1.5">kJ</span>
                <span className="text-base font-normal text-amber-400 ml-3">
                  ({result.heatTransferredJoules?.toFixed(1)} J)
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Temperature Change: ΔT = {(parseFloat(finalTemp) - parseFloat(initialTemp)).toFixed(2)} °C
              </div>
            </div>
          )}

          {/* Derivation Steps */}
          {result.explanation && result.explanation.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#0a121d] border border-[#162738] text-xs">
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="w-full flex items-center justify-between text-slate-300 hover:text-white transition font-mono"
              >
                <span className="flex items-center gap-2 font-semibold">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  Thermodynamic Derivation Steps ({result.explanation.length})
                </span>
                <span className="text-[10px] text-amber-400">{showExplanation ? 'Hide' : 'Show Details'}</span>
              </button>

              {showExplanation && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 font-mono text-[11px] text-slate-400">
                  {result.explanation.map((step, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-amber-400 select-none">›</span>
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
          {result.errors.join('; ') || 'Invalid thermodynamic inputs or species not in database.'}
        </div>
      )}
    </div>
  );
};
