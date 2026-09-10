import React, { useState, useEffect } from 'react';
import { Pipette, ArrowRight, ShieldAlert, Info, CheckCircle2 } from 'lucide-react';
import { ChemistryService } from '../../services/chemistryService';
import { DilutionResult, ConcentrationUnit, VolumeUnit } from '../../engines';

export const DilutionTab: React.FC = () => {
  const [c1, setC1] = useState<string>('5.0');
  const [v1, setV1] = useState<string>('');
  const [c2, setC2] = useState<string>('0.5');
  const [v2, setV2] = useState<string>('250');
  const [cUnit, setCUnit] = useState<ConcentrationUnit>('M');
  const [vUnit, setVUnit] = useState<VolumeUnit>('mL');

  const [result, setResult] = useState<DilutionResult>(() =>
    ChemistryService.computeDilution({
      c1: 5.0,
      c2: 0.5,
      v2: 250,
      concentrationUnit: 'M',
      volumeUnit: 'mL',
    })
  );

  const presets = [
    { label: '10× Standard Buffer (5M → 0.5M in 250mL)', c1: '5.0', v1: '', c2: '0.5', v2: '250', cU: 'M' as const, vU: 'mL' as const },
    { label: '12M Stock HCl to 1.0M (1000mL)', c1: '12.0', v1: '', c2: '1.0', v2: '1000', cU: 'M' as const, vU: 'mL' as const },
    { label: '50× TAE Electrophoresis Buffer (1000mL)', c1: '50.0', v1: '', c2: '1.0', v2: '1000', cU: 'M' as const, vU: 'mL' as const },
    { label: 'Micromolar Primer Dilution (100μM → 10μM)', c1: '100.0', v1: '', c2: '10.0', v2: '100', cU: 'μM' as const, vU: 'μL' as const },
  ];

  const handleCalculate = () => {
    const parsedC1 = c1 ? parseFloat(c1) : undefined;
    const parsedV1 = v1 ? parseFloat(v1) : undefined;
    const parsedC2 = c2 ? parseFloat(c2) : undefined;
    const parsedV2 = v2 ? parseFloat(v2) : undefined;

    const res = ChemistryService.computeDilution({
      c1: parsedC1,
      v1: parsedV1,
      c2: parsedC2,
      v2: parsedV2,
      concentrationUnit: cUnit,
      volumeUnit: vUnit,
    });
    setResult(res);
  };

  useEffect(() => {
    handleCalculate();
  }, [c1, v1, c2, v2, cUnit, vUnit]);

  const handleApplyPreset = (p: typeof presets[0]) => {
    setC1(p.c1);
    setV1(p.v1);
    setC2(p.c2);
    setV2(p.v2);
    setCUnit(p.cU);
    setVUnit(p.vU);
  };

  return (
    <div className="space-y-5 animate-fade-in text-xs font-sans">
      {/* Title & Presets */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Dilution Calculator (C₁ · V₁ = C₂ · V₂)</span>
          <span className="text-[10px] text-cyan-400">Leave exactly 1 field empty to solve for it</span>
        </label>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-mono text-slate-500 mr-1">Presets:</span>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => handleApplyPreset(p)}
              className="px-2 py-1 rounded border text-[11px] font-mono transition cursor-pointer bg-[#0d1622] text-slate-300 border-slate-800 hover:border-cyan-500/40 hover:bg-cyan-950/40"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs: C1, V1, C2, V2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Stock Solution Side */}
        <div className="p-4 rounded-xl bg-[#0c1520] border border-[#162738] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-indigo-300 font-semibold border-b border-slate-800/80 pb-2">
            <span>1. Stock Solution (Initial)</span>
            <div className="flex items-center gap-1 text-[10px]">
              <span className="text-slate-500">Conc:</span>
              <select
                value={cUnit}
                onChange={(e) => setCUnit(e.target.value as ConcentrationUnit)}
                className="bg-[#070e17] border border-slate-700 text-cyan-300 rounded px-1.5 py-0.5"
              >
                <option value="M">M (mol/L)</option>
                <option value="mM">mM</option>
                <option value="μM">μM</option>
                <option value="%">% (w/v)</option>
                <option value="ppm">ppm</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 font-mono">
            <div>
              <label className="text-[10px] text-slate-400 uppercase">Stock Concentration (C₁)</label>
              <input
                type="number"
                value={c1}
                onChange={(e) => setC1(e.target.value)}
                placeholder="Required (or leave empty to solve)"
                className="mt-1 w-full bg-[#070e17] border border-[#1a2d40] rounded-lg px-3 py-2 font-bold text-white focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase flex items-center justify-between">
                <span>Aliquot Volume to Take (V₁)</span>
                <select
                  value={vUnit}
                  onChange={(e) => setVUnit(e.target.value as VolumeUnit)}
                  className="bg-[#070e17] border border-slate-700 text-cyan-300 rounded px-1.5 py-0.5 text-[10px]"
                >
                  <option value="mL">mL</option>
                  <option value="L">L</option>
                  <option value="μL">μL</option>
                </select>
              </label>
              <input
                type="number"
                value={v1}
                onChange={(e) => setV1(e.target.value)}
                placeholder="[Auto-solved if empty]"
                className={`mt-1 w-full bg-[#070e17] border rounded-lg px-3 py-2 font-bold text-sm focus:outline-none ${
                  !v1 ? 'border-dashed border-cyan-500/50 text-cyan-300 placeholder-cyan-500/60' : 'border-[#1a2d40] text-white focus:border-indigo-500'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Target Solution Side */}
        <div className="p-4 rounded-xl bg-[#0c1520] border border-[#162738] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-cyan-300 font-semibold border-b border-slate-800/80 pb-2">
            <span>2. Target Solution (Diluted)</span>
            <span className="text-[10px] text-slate-400">Final Desired</span>
          </div>

          <div className="space-y-3 font-mono">
            <div>
              <label className="text-[10px] text-slate-400 uppercase">Target Concentration (C₂)</label>
              <input
                type="number"
                value={c2}
                onChange={(e) => setC2(e.target.value)}
                placeholder="e.g. 0.5"
                className="mt-1 w-full bg-[#070e17] border border-[#1a2d40] rounded-lg px-3 py-2 font-bold text-white focus:outline-none focus:border-cyan-500 text-sm"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase">Total Target Volume (V₂)</label>
              <input
                type="number"
                value={v2}
                onChange={(e) => setV2(e.target.value)}
                placeholder="e.g. 250"
                className="mt-1 w-full bg-[#070e17] border border-[#1a2d40] rounded-lg px-3 py-2 font-bold text-white focus:outline-none focus:border-cyan-500 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Card */}
      {result.isValid ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Stock aliquot to take */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/60 to-[#0c1520] border border-indigo-500/40">
              <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-300">
                1. Pipette Stock Aliquot (V₁)
              </div>
              <div className="text-3xl font-black font-mono text-white mt-1">
                {result.v1.toFixed(3)}
                <span className="text-sm font-normal text-slate-400 ml-1">{vUnit}</span>
              </div>
              <div className="text-[10px] font-mono text-indigo-300 mt-0.5">at {result.c1} {cUnit}</div>
            </div>

            {/* Diluent to add */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/60 to-[#0c1520] border border-cyan-500/40">
              <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-300">
                2. Add Solvent / Diluent (ΔV)
              </div>
              <div className="text-3xl font-black font-mono text-cyan-200 mt-1">
                {result.diluentVolumeToAdd.toFixed(3)}
                <span className="text-sm font-normal text-slate-400 ml-1">{vUnit}</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">V₂ - V₁ = Net diluent required</div>
            </div>

            {/* Dilution Factor */}
            <div className="p-4 rounded-xl bg-[#0c1520] border border-[#162738]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Dilution Factor
              </div>
              <div className="text-3xl font-black font-mono text-emerald-300 mt-1">
                {result.dilutionFactor.toFixed(2)}×
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">Ratio: 1 to {result.dilutionFactor.toFixed(2)}</div>
            </div>
          </div>

          {/* Safety Warning Protocol */}
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-200/90 leading-relaxed font-mono">
              <span className="font-bold text-amber-300 block mb-0.5">Laboratory Safety Standard:</span>
              {result.safetyGuidance}
            </div>
          </div>

          {/* Derivation Steps */}
          {result.explanation && (
            <div className="p-3.5 rounded-xl bg-[#0a121d] border border-[#162738] space-y-1.5 font-mono text-[11px] text-slate-400">
              <div className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Procedure Summary</span>
              </div>
              {result.explanation.map((step, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-cyan-400 select-none">›</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs font-mono">
          {result.errors.join('; ') || 'Please enter valid dilution inputs.'}
        </div>
      )}
    </div>
  );
};
