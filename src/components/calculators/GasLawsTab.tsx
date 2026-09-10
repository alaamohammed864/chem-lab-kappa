import React, { useState, useEffect } from 'react';
import { Wind, Info, Sparkles } from 'lucide-react';
import { ChemistryService } from '../../services/chemistryService';
import { GasLawsInputs, GasLawsResult, PressureUnit, VolumeUnit as GasVolumeUnit, TempUnit } from '../../engines';

export const GasLawsTab: React.FC = () => {
  const [solveFor, setSolveFor] = useState<'V' | 'P' | 'n' | 'T'>('V');
  const [gasName, setGasName] = useState('CO2');
  const [pressure, setPressure] = useState<string>('1.0');
  const [pUnit, setPUnit] = useState<PressureUnit>('atm');
  const [volume, setVolume] = useState<string>('');
  const [vUnit, setVUnit] = useState<GasVolumeUnit>('L');
  const [moles, setMoles] = useState<string>('1.0');
  const [temperature, setTemperature] = useState<string>('298.15');
  const [tUnit, setTUnit] = useState<TempUnit>('K');

  const [result, setResult] = useState<GasLawsResult>(() =>
    ChemistryService.computeGasLaws({
      lawType: 'van_der_waals',
      variableToSolve: 'V',
      pressure: 1.0,
      pressureUnit: 'atm',
      moles: 1.0,
      temperature: 298.15,
      temperatureUnit: 'K',
      selectedGasFormula: 'CO2',
    })
  );
  const [showExplanation, setShowExplanation] = useState(false);

  const presets = [
    { label: 'STP Ideal Gas (1 mol at 1 atm, 273.15 K)', solve: 'V' as const, gas: 'N2', p: '1.0', pU: 'atm' as const, v: '', vU: 'L' as const, n: '1.0', t: '273.15', tU: 'K' as const },
    { label: 'High Pressure CO2 (50 atm, 1 mol, 300 K)', solve: 'V' as const, gas: 'CO2', p: '50.0', pU: 'atm' as const, v: '', vU: 'L' as const, n: '1.0', t: '300', tU: 'K' as const },
    { label: 'Compressed Tank Pressure (10L, 20 mol O2 at 298K)', solve: 'P' as const, gas: 'O2', p: '', pU: 'atm' as const, v: '10.0', vU: 'L' as const, n: '20.0', t: '298.15', tU: 'K' as const },
    { label: 'Room Air Balloon (1 atm, 5L, 25°C Moles)', solve: 'n' as const, gas: 'N2', p: '1.0', pU: 'atm' as const, v: '5.0', vU: 'L' as const, n: '', t: '25', tU: 'C' as const },
  ];

  const handleCalculate = () => {
    const p = pressure ? parseFloat(pressure) : undefined;
    const v = volume ? parseFloat(volume) : undefined;
    const n = moles ? parseFloat(moles) : undefined;
    const t = temperature ? parseFloat(temperature) : undefined;

    const res = ChemistryService.computeGasLaws({
      lawType: 'van_der_waals',
      variableToSolve: solveFor,
      pressure: p,
      pressureUnit: pUnit,
      volume: v,
      volumeUnit: vUnit,
      moles: n,
      temperature: t,
      temperatureUnit: tUnit,
      selectedGasFormula: gasName,
    });
    setResult(res);
  };

  useEffect(() => {
    handleCalculate();
  }, [solveFor, pressure, pUnit, volume, vUnit, moles, temperature, tUnit, gasName]);

  const handleApplyPreset = (p: typeof presets[0]) => {
    setSolveFor(p.solve);
    setGasName(p.gas);
    setPressure(p.p);
    setPUnit(p.pU);
    setVolume(p.v);
    setVUnit(p.vU);
    setMoles(p.n);
    setTemperature(p.t);
    setTUnit(p.tU);
  };

  return (
    <div className="space-y-5 animate-fade-in text-xs font-sans">
      {/* Target Variable Selector & Presets */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Target Variable to Solve</span>
          <span className="text-[10px] text-sky-400">P · V = n · R · T & Van der Waals Correction</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
          {(
            [
              { id: 'V', label: 'Volume (V)' },
              { id: 'P', label: 'Pressure (P)' },
              { id: 'n', label: 'Amount of Substance (n)' },
              { id: 'T', label: 'Temperature (T)' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setSolveFor(t.id);
                if (t.id === 'V') setVolume('');
                if (t.id === 'P') setPressure('');
                if (t.id === 'n') setMoles('');
                if (t.id === 'T') setTemperature('');
              }}
              className={`py-2 px-3 rounded-lg border font-bold transition cursor-pointer text-center ${
                solveFor === t.id
                  ? 'bg-sky-950 border-sky-500 text-sky-200 shadow-sm'
                  : 'bg-[#0d1622] border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-[#121f30]'
              }`}
            >
              Solve {t.label}
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
              className="px-2 py-1 rounded border text-[11px] font-mono transition cursor-pointer bg-[#0d1622] text-slate-300 border-slate-800 hover:border-sky-500/40 hover:bg-sky-950/40"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gas Selection and Inputs */}
      <div className="p-4 rounded-xl bg-[#0c1520] border border-[#162738] space-y-4 font-mono">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Gas Parameters</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase">Gas Species:</span>
            <select
              value={gasName}
              onChange={(e) => setGasName(e.target.value)}
              className="bg-[#070e17] border border-slate-700 text-sky-300 rounded px-2 py-1 text-xs"
            >
              {['N2', 'O2', 'CO2', 'H2', 'He', 'CH4', 'Cl2', 'NH3', 'Ar'].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Pressure */}
          <div className="p-3 bg-[#070e17] rounded-lg border border-[#1a2d40] space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase">
              <span>Pressure (P)</span>
              <select
                value={pUnit}
                onChange={(e) => setPUnit(e.target.value as PressureUnit)}
                className="bg-transparent border-0 text-sky-300 cursor-pointer text-[10px]"
              >
                <option value="atm">atm</option>
                <option value="kPa">kPa</option>
                <option value="bar">bar</option>
                <option value="mmHg">mmHg</option>
                <option value="psi">psi</option>
              </select>
            </div>
            <input
              type="number"
              disabled={solveFor === 'P'}
              value={solveFor === 'P' ? '' : pressure}
              onChange={(e) => setPressure(e.target.value)}
              placeholder={solveFor === 'P' ? '[Solving P]' : 'e.g. 1.0'}
              className={`w-full bg-transparent font-bold text-sm focus:outline-none ${
                solveFor === 'P' ? 'text-sky-400 placeholder-sky-400/60' : 'text-white'
              }`}
            />
          </div>

          {/* Volume */}
          <div className="p-3 bg-[#070e17] rounded-lg border border-[#1a2d40] space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase">
              <span>Volume (V)</span>
              <select
                value={vUnit}
                onChange={(e) => setVUnit(e.target.value as GasVolumeUnit)}
                className="bg-transparent border-0 text-sky-300 cursor-pointer text-[10px]"
              >
                <option value="L">L</option>
                <option value="mL">mL</option>
                <option value="m3">m³</option>
              </select>
            </div>
            <input
              type="number"
              disabled={solveFor === 'V'}
              value={solveFor === 'V' ? '' : volume}
              onChange={(e) => setVolume(e.target.value)}
              placeholder={solveFor === 'V' ? '[Solving V]' : 'e.g. 22.4'}
              className={`w-full bg-transparent font-bold text-sm focus:outline-none ${
                solveFor === 'V' ? 'text-sky-400 placeholder-sky-400/60' : 'text-white'
              }`}
            />
          </div>

          {/* Moles */}
          <div className="p-3 bg-[#070e17] rounded-lg border border-[#1a2d40] space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase">
              <span>Moles (n)</span>
              <span className="text-slate-500">mol</span>
            </div>
            <input
              type="number"
              disabled={solveFor === 'n'}
              value={solveFor === 'n' ? '' : moles}
              onChange={(e) => setMoles(e.target.value)}
              placeholder={solveFor === 'n' ? '[Solving n]' : 'e.g. 1.0'}
              className={`w-full bg-transparent font-bold text-sm focus:outline-none ${
                solveFor === 'n' ? 'text-sky-400 placeholder-sky-400/60' : 'text-white'
              }`}
            />
          </div>

          {/* Temperature */}
          <div className="p-3 bg-[#070e17] rounded-lg border border-[#1a2d40] space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase">
              <span>Temperature (T)</span>
              <select
                value={tUnit}
                onChange={(e) => setTUnit(e.target.value as TempUnit)}
                className="bg-transparent border-0 text-sky-300 cursor-pointer text-[10px]"
              >
                <option value="K">K</option>
                <option value="C">°C</option>
                <option value="F">°F</option>
              </select>
            </div>
            <input
              type="number"
              disabled={solveFor === 'T'}
              value={solveFor === 'T' ? '' : temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder={solveFor === 'T' ? '[Solving T]' : 'e.g. 298.15'}
              className={`w-full bg-transparent font-bold text-sm focus:outline-none ${
                solveFor === 'T' ? 'text-sky-400 placeholder-sky-400/60' : 'text-white'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Results Comparison: Ideal vs Real Gas */}
      {result.isValid ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Solved Value Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-sky-950/60 to-[#0c1520] border border-sky-500/40 space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-sky-400">
                Solved State Value ({result.solvedVariable})
              </div>
              <div className="text-3xl font-black font-mono text-white">
                {result.solvedValue.toFixed(4)}
                <span className="text-sm font-normal text-slate-400 ml-1.5">{result.solvedUnit}</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Normalized: {result.pressureAtm.toFixed(3)} atm, {result.volumeLiters.toFixed(3)} L, {result.moles.toFixed(3)} mol, {result.temperatureKelvin.toFixed(1)} K
              </div>
            </div>

            {/* Van der Waals Real Gas Result */}
            <div className="p-4 rounded-xl bg-[#0c1520] border border-[#162738] space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-indigo-400">
                <span>Compressibility & Density</span>
                {result.idealVsRealDifferencePercent !== undefined && (
                  <span className="text-amber-400 font-bold">
                    Δ {result.idealVsRealDifferencePercent.toFixed(2)}% real deviation
                  </span>
                )}
              </div>
              <div className="text-3xl font-black font-mono text-indigo-200">
                Z = {result.compressibilityFactorZ !== undefined ? result.compressibilityFactorZ.toFixed(4) : '1.0000'}
              </div>
              <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>Gas Density: {result.gasDensityGPerL?.toFixed(3) || '—'} g/L</span>
                <span className="text-[10px] text-slate-500">
                  {gasName} Real Gas Correction
                </span>
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
                  <Info className="w-3.5 h-3.5 text-sky-400" />
                  Gas Law Computation Steps ({result.explanation.length})
                </span>
                <span className="text-[10px] text-sky-400">{showExplanation ? 'Hide' : 'Show Details'}</span>
              </button>

              {showExplanation && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 font-mono text-[11px] text-slate-400">
                  {result.explanation.map((step, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-sky-400 select-none">›</span>
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
          {result.errors.join('; ') || 'Invalid gas parameters.'}
        </div>
      )}
    </div>
  );
};
