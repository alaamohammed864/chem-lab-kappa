import React, { useState, useEffect } from 'react';
import { Activity, Sparkles, AlertCircle, Info } from 'lucide-react';
import { ChemistryService } from '../../services/chemistryService';
import { PHInputs, PHResult, SolutionCategory } from '../../engines';

export const PHTab: React.FC = () => {
  const [category, setCategory] = useState<SolutionCategory>('weak_acid');
  const [substanceName, setSubstanceName] = useState('Acetic Acid (CH3COOH)');
  const [concentrationM, setConcentrationM] = useState<string>('0.1');
  const [ka, setKa] = useState<string>('1.8e-5');
  const [kb, setKb] = useState<string>('1.8e-5');
  const [conjugateBaseM, setConjugateBaseM] = useState<string>('0.1');
  const [temperatureC, setTemperatureC] = useState<string>('25');

  const [result, setResult] = useState<PHResult>(() =>
    ChemistryService.computePH({
      category: 'weak_acid',
      concentrationM: 0.1,
      ka: 1.8e-5,
      temperatureC: 25,
    })
  );
  const [showExplanation, setShowExplanation] = useState(false);

  const presets = [
    {
      label: '0.1 M Hydrochloric Acid (Strong Acid)',
      cat: 'strong_acid' as SolutionCategory,
      name: 'HCl (Hydrochloric Acid)',
      conc: '0.1',
      ka: '',
      kb: '',
      cb: '',
    },
    {
      label: '0.1 M Acetic Acid (Vinegar)',
      cat: 'weak_acid' as SolutionCategory,
      name: 'CH3COOH (Acetic Acid)',
      conc: '0.1',
      ka: '1.8e-5',
      kb: '',
      cb: '',
    },
    {
      label: 'Acetate Buffer (0.1M HA + 0.1M NaA)',
      cat: 'buffer' as SolutionCategory,
      name: 'Acetic/Acetate Buffer',
      conc: '0.1',
      ka: '1.8e-5',
      kb: '',
      cb: '0.1',
    },
    {
      label: '0.05 M Ammonia (Weak Base)',
      cat: 'weak_base' as SolutionCategory,
      name: 'NH3 (Ammonia)',
      conc: '0.05',
      ka: '',
      kb: '1.8e-5',
      cb: '',
    },
    {
      label: '0.01 M Sodium Hydroxide (Strong Base)',
      cat: 'strong_base' as SolutionCategory,
      name: 'NaOH (Sodium Hydroxide)',
      conc: '0.01',
      ka: '',
      kb: '',
      cb: '',
    },
  ];

  const handleCalculate = () => {
    const conc = parseFloat(concentrationM) || 0.01;
    const parsedKa = ka ? parseFloat(ka) : undefined;
    const parsedKb = kb ? parseFloat(kb) : undefined;
    const parsedCb = conjugateBaseM ? parseFloat(conjugateBaseM) : undefined;
    const parsedTemp = parseFloat(temperatureC) || 25;

    const res = ChemistryService.computePH({
      category,
      concentrationM: conc,
      ka: parsedKa,
      kb: parsedKb,
      acidConcentrationM: conc,
      conjugateBaseConcentrationM: parsedCb,
      temperatureC: parsedTemp,
    });
    setResult(res);
  };

  useEffect(() => {
    handleCalculate();
  }, [category, concentrationM, ka, kb, conjugateBaseM, temperatureC]);

  const handleApplyPreset = (p: typeof presets[0]) => {
    setCategory(p.cat);
    setSubstanceName(p.name);
    setConcentrationM(p.conc);
    if (p.ka) setKa(p.ka);
    if (p.kb) setKb(p.kb);
    if (p.cb) setConjugateBaseM(p.cb);
  };

  return (
    <div className="space-y-5 animate-fade-in text-xs font-sans">
      {/* Type Selector & Presets */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Solution Classification</span>
          <span className="text-[10px] text-purple-400">Exact equilibrium solver (Kw = 1.0 × 10⁻¹⁴)</span>
        </label>

        {/* Radio Pill Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 font-mono text-[11px]">
          {(
            [
              { id: 'strong_acid', label: 'Strong Acid' },
              { id: 'weak_acid', label: 'Weak Acid' },
              { id: 'buffer', label: 'Buffer Solution' },
              { id: 'weak_base', label: 'Weak Base' },
              { id: 'strong_base', label: 'Strong Base' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setCategory(t.id)}
              className={`py-2 px-2 rounded-lg border text-center font-bold transition cursor-pointer ${
                category === t.id
                  ? 'bg-purple-950 border-purple-500 text-purple-200 shadow-sm'
                  : 'bg-[#0d1622] border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-[#121f30]'
              }`}
            >
              {t.label}
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
              className="px-2 py-1 rounded border text-[11px] font-mono transition cursor-pointer bg-[#0d1622] text-slate-300 border-slate-800 hover:border-purple-500/40 hover:bg-purple-950/40"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Parameters */}
      <div className="p-4 rounded-xl bg-[#0c1520] border border-[#162738] space-y-3 font-mono">
        <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
          <span>Chemical Parameters</span>
          <span className="text-[10px] text-slate-500">T = {temperatureC}°C</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Substance Name */}
          <div>
            <label className="text-[10px] text-slate-500 uppercase">Substance Name</label>
            <input
              type="text"
              value={substanceName}
              onChange={(e) => setSubstanceName(e.target.value)}
              className="mt-1 w-full bg-[#070e17] border border-[#1a2d40] rounded-lg px-3 py-2 font-bold text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Primary Concentration */}
          <div>
            <label className="text-[10px] text-slate-500 uppercase">
              {category === 'buffer' ? 'Acid Concentration [HA] (M)' : 'Concentration (M)'}
            </label>
            <input
              type="number"
              step="any"
              value={concentrationM}
              onChange={(e) => setConcentrationM(e.target.value)}
              className="mt-1 w-full bg-[#070e17] border border-[#1a2d40] rounded-lg px-3 py-2 font-bold text-cyan-300 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Constant (Ka or Kb or Conjugate Base) */}
          {(category === 'weak_acid' || category === 'buffer') && (
            <div>
              <label className="text-[10px] text-slate-500 uppercase">Acid Dissociation Constant (Ka)</label>
              <input
                type="text"
                value={ka}
                onChange={(e) => setKa(e.target.value)}
                placeholder="e.g. 1.8e-5"
                className="mt-1 w-full bg-[#070e17] border border-[#1a2d40] rounded-lg px-3 py-2 font-bold text-amber-300 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          )}

          {category === 'weak_base' && (
            <div>
              <label className="text-[10px] text-slate-500 uppercase">Base Dissociation Constant (Kb)</label>
              <input
                type="text"
                value={kb}
                onChange={(e) => setKb(e.target.value)}
                placeholder="e.g. 1.8e-5"
                className="mt-1 w-full bg-[#070e17] border border-[#1a2d40] rounded-lg px-3 py-2 font-bold text-amber-300 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          )}

          {category === 'buffer' && (
            <div>
              <label className="text-[10px] text-slate-500 uppercase">Conjugate Base [A⁻] (M)</label>
              <input
                type="number"
                step="any"
                value={conjugateBaseM}
                onChange={(e) => setConjugateBaseM(e.target.value)}
                placeholder="e.g. 0.1"
                className="mt-1 w-full bg-[#070e17] border border-[#1a2d40] rounded-lg px-3 py-2 font-bold text-emerald-300 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Result Cards & Visual pH Scale */}
      {result.isValid ? (
        <div className="space-y-4">
          {/* Main Visual pH Gauge */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-[#0e1224] to-[#0a0f1d] border border-purple-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400">Calculated Acidity / Basicity</span>
                <div className="text-3xl sm:text-5xl font-black font-mono text-white mt-0.5 flex items-baseline gap-2">
                  <span>pH {result.ph.toFixed(2)}</span>
                  <span className="text-sm font-normal text-slate-400 font-mono">(pOH {result.poh.toFixed(2)})</span>
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/60 flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <span className="font-bold text-slate-200 capitalize">{result.classification.replace('-', ' ')}</span>
              </div>
            </div>

            {/* Continuous pH Scale 0 to 14 */}
            <div className="space-y-1.5 pt-1">
              <div className="relative h-4 bg-gradient-to-r from-red-600 via-amber-400 via-emerald-400 via-blue-500 to-purple-700 rounded-full overflow-hidden shadow-inner">
                {/* Pointer Marker */}
                <div
                  className="absolute top-0 bottom-0 w-1.5 bg-white shadow-[0_0_8px_#ffffff] rounded-full transform -translate-x-1/2 transition-all duration-300"
                  style={{ left: `${Math.min(100, Math.max(0, (result.ph / 14) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500 px-0.5">
                <span>0 (Strong Acid)</span>
                <span>7 (Neutral Water)</span>
                <span>14 (Strong Base)</span>
              </div>
            </div>
          </div>

          {/* Ion Concentrations Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-3.5 rounded-xl bg-[#0c1520] border border-[#162738]">
              <div className="text-[10px] uppercase tracking-wider text-rose-400">[H⁺] / [H₃O⁺]</div>
              <div className="text-base sm:text-lg font-bold text-white mt-1">
                {result.hPlusM.toExponential(3)} M
              </div>
              <div className="text-[10px] text-slate-500">Hydronium</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0c1520] border border-[#162738]">
              <div className="text-[10px] uppercase tracking-wider text-blue-400">[OH⁻]</div>
              <div className="text-base sm:text-lg font-bold text-white mt-1">
                {result.ohMinusM.toExponential(3)} M
              </div>
              <div className="text-[10px] text-slate-500">Hydroxide</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0c1520] border border-[#162738]">
              <div className="text-[10px] uppercase tracking-wider text-emerald-400">Ionization (α)</div>
              <div className="text-base sm:text-lg font-bold text-white mt-1">
                {result.ionizationDegreePercent !== undefined
                  ? `${result.ionizationDegreePercent.toFixed(2)}%`
                  : '100% (Complete)'}
              </div>
              <div className="text-[10px] text-slate-500">Dissociation Degree</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0c1520] border border-[#162738]">
              <div className="text-[10px] uppercase tracking-wider text-purple-400">Autoionization (Kw)</div>
              <div className="text-base sm:text-lg font-bold text-white mt-1">
                {result.kw.toExponential(1)}
              </div>
              <div className="text-[10px] text-slate-500">at 25°C</div>
            </div>
          </div>

          {/* Step-by-Step Explanation */}
          {result.explanation && result.explanation.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#0a121d] border border-[#162738] text-xs">
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="w-full flex items-center justify-between text-slate-300 hover:text-white transition font-mono"
              >
                <span className="flex items-center gap-2 font-semibold">
                  <Info className="w-3.5 h-3.5 text-purple-400" />
                  Equilibrium Derivation & Assumptions
                </span>
                <span className="text-[10px] text-purple-400">{showExplanation ? 'Hide' : 'Show Details'}</span>
              </button>

              {showExplanation && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 font-mono text-[11px] text-slate-400">
                  {result.explanation.map((step, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-purple-400 select-none">›</span>
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
          {result.errors.join('; ') || 'Invalid inputs for pH determination.'}
        </div>
      )}
    </div>
  );
};
