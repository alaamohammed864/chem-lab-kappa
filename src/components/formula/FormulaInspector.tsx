// Chemical Formula Validator & Tokenizer Inspector
// Validates chemical syntax, nested brackets, hydrates, and computes element mass percentages.

import React, { useState } from 'react';
import { validateChemicalFormula } from '../../engines/chemistry/formulaParser';
import {
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Info,
  Scale,
} from 'lucide-react';

export const FormulaInspector: React.FC = () => {
  const [formulaInput, setFormulaInput] = useState('CuSO4·5H2O');

  const validation = validateChemicalFormula(formulaInput);

  const sampleFormulas = [
    { label: 'Copper(II) Sulfate Hydrate', formula: 'CuSO4·5H2O' },
    { label: 'Potassium Ferrocyanide', formula: 'K4[Fe(CN)6]' },
    { label: 'Calcium Phosphate', formula: 'Ca3(PO4)2' },
    { label: 'Ammonium Dichromate', formula: '(NH4)2Cr2O7' },
    { label: 'Malformed - Lowercase element', formula: 'cacl2' },
    { label: 'Malformed - Unclosed bracket', formula: 'Fe2(SO4' },
    { label: 'Malformed - Invalid character', formula: 'NaCl@2' },
  ];

  // Calculate total molecular mass and mass fractions if valid
  const totalMass = validation.tokens
    ? validation.tokens.reduce((acc, t) => acc + (t.atomicMass || 0) * t.count, 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Chemical Formula Input</span>
          <span className="text-[10px] text-cyan-400">Supports (brackets), [coordination], ·hydrates, charges</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={formulaInput}
            onChange={(e) => setFormulaInput(e.target.value)}
            placeholder="e.g., K4[Fe(CN)6], (NH4)2SO4, CuSO4·5H2O..."
            className="flex-1 bg-[#09111c] border border-slate-700/80 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        {/* Quick Sample Formula Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {sampleFormulas.map((s) => (
            <button
              key={s.formula}
              onClick={() => setFormulaInput(s.formula)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-[#0c1622] hover:bg-[#122234] border border-slate-800 text-slate-400 hover:text-cyan-300 transition cursor-pointer"
            >
              {s.formula}
            </button>
          ))}
        </div>
      </div>

      {/* Validation Result Box */}
      <div
        className={`p-4 rounded-xl border transition ${
          validation.isValid
            ? 'bg-emerald-950/20 border-emerald-500/40'
            : 'bg-rose-950/20 border-rose-500/40'
        }`}
      >
        <div className="flex items-start gap-3">
          {validation.isValid ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>{validation.isValid ? 'Valid Chemical Formula' : 'Malformed Chemical Formula'}</span>
              {validation.formatted && (
                <span className="text-cyan-300 font-mono text-base px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                  {validation.formatted}
                </span>
              )}
            </div>
            {validation.isValid ? (
              <p className="text-xs text-slate-300">
                Formula complies with standard IUPAC syntax, balanced grouping brackets, and verified atomic symbols.
              </p>
            ) : (
              <p className="text-xs text-rose-300 font-mono">{validation.error}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tokenized Atom Counts & Mass Breakdown */}
      {validation.isValid && validation.tokens && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Constituent Atoms */}
          <div className="p-4 rounded-xl bg-[#0a121c] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-slate-400">
                Elemental Atom Multiplicities
              </span>
              <span className="text-xs font-mono text-cyan-400">
                {Object.values(validation.counts || {}).reduce((a, b) => a + b, 0)} Total Atoms
              </span>
            </div>

            <div className="space-y-2">
              {validation.tokens.map((token) => (
                <div
                  key={token.symbol}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#0e1724] border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 font-mono font-bold flex items-center justify-center">
                      {token.symbol}
                    </span>
                    <div>
                      <div className="font-semibold text-white">{token.name || token.symbol}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {token.atomicMass ? `${token.atomicMass.toFixed(3)} u` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-white">× {token.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mass Fraction Analysis */}
          <div className="p-4 rounded-xl bg-[#0a121c] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-slate-400">
                Stoichiometric Mass Percentage (w/w%)
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {totalMass.toFixed(3)} g/mol
              </span>
            </div>

            <div className="space-y-2.5">
              {validation.tokens.map((token) => {
                const subMass = (token.atomicMass || 0) * token.count;
                const pct = totalMass > 0 ? (subMass / totalMass) * 100 : 0;
                return (
                  <div key={token.symbol} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 font-semibold">{token.symbol}</span>
                      <span className="text-cyan-300 font-bold">{pct.toFixed(2)}% ({subMass.toFixed(2)} g/mol)</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
