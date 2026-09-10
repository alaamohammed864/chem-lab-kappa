import React, { useState, useEffect } from 'react';
import { Calculator, ArrowRightLeft, Sparkles, Check, Info } from 'lucide-react';
import { ChemistryService } from '../../services/chemistryService';
import { MolarMassResult } from '../../engines';

interface MolarMassTabProps {
  initialFormula?: string;
  onFormulaSelect?: (formula: string) => void;
}

export const MolarMassTab: React.FC<MolarMassTabProps> = ({
  initialFormula = 'Fe2O3',
  onFormulaSelect,
}) => {
  const [formula, setFormula] = useState(initialFormula);
  const [result, setResult] = useState<MolarMassResult>(() =>
    ChemistryService.computeMolarMass(initialFormula)
  );
  const [gramsInput, setGramsInput] = useState<string>('100');
  const [molesInput, setMolesInput] = useState<string>('0.626');
  const [volumeLiters, setVolumeLiters] = useState<string>('1.0');
  const [molarity, setMolarity] = useState<string>('0.626');
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (formula.trim()) {
      const res = ChemistryService.computeMolarMass(formula);
      setResult(res);
      if (res.isValid && res.totalMolarMass > 0) {
        const g = parseFloat(gramsInput) || 0;
        const mol = g / res.totalMolarMass;
        setMolesInput(mol.toFixed(4));
        const vol = parseFloat(volumeLiters) || 1;
        setMolarity((mol / vol).toFixed(4));
      }
    }
  }, [formula]);

  const handleGramsChange = (val: string) => {
    setGramsInput(val);
    const g = parseFloat(val);
    if (!isNaN(g) && result.isValid && result.totalMolarMass > 0) {
      const mol = g / result.totalMolarMass;
      setMolesInput(mol.toFixed(4));
      const vol = parseFloat(volumeLiters) || 1;
      setMolarity((mol / vol).toFixed(4));
    }
  };

  const handleMolesChange = (val: string) => {
    setMolesInput(val);
    const mol = parseFloat(val);
    if (!isNaN(mol) && result.isValid && result.totalMolarMass > 0) {
      const g = mol * result.totalMolarMass;
      setGramsInput(g.toFixed(3));
      const vol = parseFloat(volumeLiters) || 1;
      setMolarity((mol / vol).toFixed(4));
    }
  };

  const samplePresets = [
    { label: 'Iron(III) Oxide', formula: 'Fe2O3' },
    { label: 'Calcium Hydroxide', formula: 'Ca(OH)2' },
    { label: 'Ammonium Sulfate', formula: '(NH4)2SO4' },
    { label: 'Glucose', formula: 'C6H12O6' },
    { label: 'Copper Sulfate Hydrate', formula: 'CuSO4*5H2O' },
    { label: 'Titanium Tetrachloride', formula: 'TiCl4' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Formula Input Box */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Chemical Formula</span>
          <span className="text-[10px] text-indigo-400">Supports nested parentheses and hydrates (e.g. CuSO4*5H2O)</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={formula}
            onChange={(e) => {
              setFormula(e.target.value);
              if (onFormulaSelect) onFormulaSelect(e.target.value);
            }}
            placeholder="e.g. Fe2O3, Ca(OH)2, H2SO4, C6H12O6"
            className="flex-1 bg-[#0a121c] border border-[#1d3148] rounded-xl px-4 py-2.5 text-base sm:text-lg font-mono font-bold text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => setFormula('')}
            className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono transition cursor-pointer"
          >
            Clear
          </button>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-mono text-slate-500 mr-1">Presets:</span>
          {samplePresets.map((p) => (
            <button
              key={p.formula}
              onClick={() => {
                setFormula(p.formula);
                if (onFormulaSelect) onFormulaSelect(p.formula);
              }}
              className={`px-2 py-1 rounded border text-[11px] font-mono transition cursor-pointer ${
                formula === p.formula
                  ? 'bg-indigo-950 text-indigo-300 border-indigo-500/60'
                  : 'bg-[#0d1622] text-slate-300 border-slate-800 hover:border-indigo-500/40 hover:bg-indigo-950/40'
              }`}
            >
              {p.formula}
            </button>
          ))}
        </div>
      </div>

      {/* Result Card Grid */}
      {result.isValid ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Total Mass Card (5 cols) */}
          <div className="md:col-span-5 p-5 rounded-xl bg-gradient-to-br from-indigo-950/50 to-[#0d1624] border border-indigo-500/30 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-indigo-300 flex items-center justify-between">
                <span>Total Molecular Weight</span>
                {result.hillFormula && (
                  <span className="text-[10px] text-slate-400 font-mono">Hill: {result.hillFormula}</span>
                )}
              </div>
              <div className="text-3xl sm:text-4xl font-black font-mono text-white mt-1.5">
                {result.totalMolarMass.toFixed(3)}
                <span className="text-sm font-normal text-slate-400 ml-1.5">{result.units.totalMolarMass}</span>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-1">
                Formula: <span className="text-indigo-200 font-bold">{result.formula}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-indigo-900/50 text-[11px] text-slate-300 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Unique Elements:</span>
                <span className="font-mono text-white">{result.elements.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Atoms per Unit:</span>
                <span className="font-mono text-white">{result.totalAtoms} atoms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Standard:</span>
                <span className="font-mono text-cyan-300 text-[10px]">IUPAC CIAAW 2026</span>
              </div>
            </div>
          </div>

          {/* Elements Breakdown Table (7 cols) */}
          <div className="md:col-span-7 p-4 rounded-xl bg-[#0c1520] border border-[#162738] space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
              <span>Elemental Composition & Mass Fraction</span>
              <span className="text-[10px] text-slate-500">% by mass</span>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {result.elements.map((el) => (
                <div key={el.symbol} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded bg-indigo-950 border border-indigo-500/50 flex items-center justify-center text-[10px] text-indigo-300 font-black">
                        {el.symbol}
                      </span>
                      {el.name} ({el.count}×)
                    </span>
                    <span className="text-indigo-300 font-bold">
                      {el.percentage.toFixed(2)}%
                      <span className="text-slate-500 font-normal ml-1">
                        ({el.totalMass.toFixed(3)} g/mol)
                      </span>
                    </span>
                  </div>
                  {/* Percentage Bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, el.percentage))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs font-mono">
          {result.error || result.errors.join('; ') || 'Invalid chemical formula syntax.'}
        </div>
      )}

      {/* Stoichiometric Unit Converter */}
      {result.isValid && (
        <div className="p-4 rounded-xl bg-[#0c1520] border border-[#162738] space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
            <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
            <span>Mass ↔ Moles Conversion & Aqueous Molarity Preview</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            {/* Mass Input */}
            <div className="p-3 bg-[#070e17] rounded-lg border border-[#1a2d40] space-y-1">
              <label className="text-[10px] text-slate-500 uppercase">Mass (Grams)</label>
              <input
                type="number"
                value={gramsInput}
                onChange={(e) => handleGramsChange(e.target.value)}
                className="w-full bg-transparent font-bold text-white text-sm focus:outline-none"
              />
              <div className="text-[10px] text-slate-500">m = n × M</div>
            </div>

            {/* Moles Input */}
            <div className="p-3 bg-[#070e17] rounded-lg border border-[#1a2d40] space-y-1">
              <label className="text-[10px] text-slate-500 uppercase">Amount (Moles)</label>
              <input
                type="number"
                value={molesInput}
                onChange={(e) => handleMolesChange(e.target.value)}
                className="w-full bg-transparent font-bold text-cyan-300 text-sm focus:outline-none"
              />
              <div className="text-[10px] text-slate-500">n = m / M</div>
            </div>

            {/* Molarity Output */}
            <div className="p-3 bg-[#070e17] rounded-lg border border-[#1a2d40] space-y-1">
              <label className="text-[10px] text-slate-500 uppercase">
                Molarity in {volumeLiters}L (mol/L)
              </label>
              <div className="font-bold text-emerald-300 text-sm">{molarity} M</div>
              <div className="text-[10px] text-slate-500">C = n / V</div>
            </div>
          </div>
        </div>
      )}

      {/* Step-by-Step Explanation Accordion */}
      {result.isValid && result.explanation && result.explanation.length > 0 && (
        <div className="p-3.5 rounded-xl bg-[#0a121d] border border-[#162738] text-xs">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full flex items-center justify-between text-slate-300 hover:text-white transition font-mono"
          >
            <span className="flex items-center gap-2 font-semibold">
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              Detailed Calculation Breakdown ({result.explanation.length} steps)
            </span>
            <span className="text-[10px] text-indigo-400">{showExplanation ? 'Hide' : 'Show Details'}</span>
          </button>

          {showExplanation && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 font-mono text-[11px] text-slate-400">
              {result.explanation.map((step, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-indigo-400 select-none">›</span>
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
  );
};
