// Ion Explorer & Stoichiometric Salt Builder
// Provides visual exploration of common ions, formal charges, oxidation states,
// and real-time synthesis of neutral ionic salts with solubility rule evaluations.

import React, { useState } from 'react';
import { COMMON_IONS_DATA, IonData } from '../../data/ionsData';
import {
  formIonicCompound,
  verifyOxidationStateSum,
  FormedSaltResult,
} from '../../engines/chemistry/ionEngine';
import {
  Search,
  Filter,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Atom,
} from 'lucide-react';

export const IonExplorer: React.FC = () => {
  const [selectedType, setSelectedType] = useState<'all' | 'cation' | 'anion'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIon, setSelectedIon] = useState<IonData>(COMMON_IONS_DATA[10]); // Fe2+ default

  // Salt Builder state
  const [selectedCation, setSelectedCation] = useState<IonData>(
    COMMON_IONS_DATA.find((i) => i.id === 'fe-3plus') || COMMON_IONS_DATA[11]
  );
  const [selectedAnion, setSelectedAnion] = useState<IonData>(
    COMMON_IONS_DATA.find((i) => i.id === 'so4-2minus') || COMMON_IONS_DATA[25]
  );

  const filteredIons = COMMON_IONS_DATA.filter((ion) => {
    if (selectedType !== 'all' && ion.type !== selectedType) return false;
    if (selectedCategory !== 'all' && ion.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        ion.name.toLowerCase().includes(q) ||
        ion.formula.toLowerCase().includes(q) ||
        ion.symbol.toLowerCase().includes(q) ||
        ion.plainFormula.toLowerCase().includes(q) ||
        ion.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const formedSalt: FormedSaltResult | null = (() => {
    try {
      if (selectedCation && selectedAnion) {
        return formIonicCompound(selectedCation, selectedAnion);
      }
    } catch {
      return null;
    }
    return null;
  })();

  const oxidationVerification = selectedIon ? verifyOxidationStateSum(selectedIon) : null;

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Type Filter */}
          <div className="flex items-center p-0.5 rounded-lg bg-[#0e1724] border border-slate-800">
            {(['all', 'cation', 'anion'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition cursor-pointer ${
                  selectedType === t
                    ? t === 'cation'
                      ? 'bg-blue-500 text-slate-950'
                      : t === 'anion'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === 'all' ? 'All Ions' : `${t}s`}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {['all', 'monatomic', 'polyatomic', 'oxoanion', 'transition-metal'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-[11px] rounded-lg border capitalize whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-800 text-cyan-300 border-cyan-500/40'
                    : 'bg-[#0a121c] text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {cat.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="relative min-w-[200px] sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ions (e.g., SO4, Iron, Fe3+)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#09111c] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Main Grid: Ions Explorer & Salt Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Ions Grid */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>ION DATABASE ({filteredIons.length} found)</span>
            <span>Click to inspect</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredIons.map((ion) => {
              const isSelected = selectedIon?.id === ion.id;
              const isCation = ion.type === 'cation';
              return (
                <div
                  key={ion.id}
                  onClick={() => setSelectedIon(ion)}
                  className={`p-3 rounded-xl border transition cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[95px] ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-500 shadow-md shadow-cyan-500/10'
                      : 'bg-[#0b131e] border-slate-800/90 hover:bg-[#0f1b2a] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`text-base font-bold font-mono ${
                        isCation ? 'text-blue-400' : 'text-emerald-400'
                      }`}
                    >
                      {ion.formula}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isCation
                          ? 'bg-blue-950/80 text-blue-300 border border-blue-500/30'
                          : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {ion.charge > 0 ? `+${ion.charge}` : ion.charge}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-white truncate">{ion.name}</div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
                      <span>{ion.molarMass.toFixed(2)} g/mol</span>
                      <span className="capitalize text-slate-500">{ion.category}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Ion Detail & Salt Builder */}
        <div className="lg:col-span-5 space-y-4">
          {/* Selected Ion Card */}
          {selectedIon && (
            <div className="p-4 rounded-xl bg-[#0a121c] border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold font-mono text-lg ${
                      selectedIon.type === 'cation'
                        ? 'bg-blue-950 text-blue-400 border border-blue-500/40'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {selectedIon.formula}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{selectedIon.name}</h4>
                    <span className="text-[11px] font-mono text-slate-400 capitalize">
                      {selectedIon.type} · {selectedIon.category}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-white block">
                    {selectedIon.molarMass} g/mol
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase">Molar Mass</span>
                </div>
              </div>

              {/* Oxidation States Breakdown */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Oxidation States & Electronic Structure
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedIon.oxidationStates.map((os, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-800 text-xs font-mono text-cyan-300 border border-slate-700"
                    >
                      {os.element}: {os.state > 0 ? `+${os.state}` : os.state}
                    </span>
                  ))}
                  {selectedIon.electronicConfiguration && (
                    <span className="px-2 py-0.5 rounded bg-slate-800/80 text-[11px] font-mono text-purple-300 border border-slate-700">
                      Config: {selectedIon.electronicConfiguration}
                    </span>
                  )}
                </div>
              </div>

              {/* Solution Color & Geometry */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {selectedIon.color && (
                  <div className="p-2 rounded-lg bg-[#0f1b29] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">Aqueous Color</span>
                    <span className="text-white font-medium">{selectedIon.color}</span>
                  </div>
                )}
                {selectedIon.geometry && (
                  <div className="p-2 rounded-lg bg-[#0f1b29] border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">Geometry</span>
                    <span className="text-white font-medium">{selectedIon.geometry}</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-300/90 leading-relaxed">{selectedIon.description}</p>

              {/* Quick action to use in salt builder */}
              <div className="pt-1 flex gap-2">
                {selectedIon.type === 'cation' ? (
                  <button
                    onClick={() => setSelectedCation(selectedIon)}
                    className="w-full py-1.5 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 text-xs font-semibold transition border border-blue-500/40 cursor-pointer"
                  >
                    Set as Cation in Salt Builder
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedAnion(selectedIon)}
                    className="w-full py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold transition border border-emerald-500/40 cursor-pointer"
                  >
                    Set as Anion in Salt Builder
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Interactive Stoichiometric Salt Builder */}
          <div className="p-4 rounded-xl bg-[#09111b] border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Ionic Salt & Precipitation Builder
              </h4>
            </div>

            {/* Select Cation & Anion dropdowns */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono text-blue-400 uppercase block mb-1">Cation (+)</label>
                <select
                  value={selectedCation.id}
                  onChange={(e) => {
                    const found = COMMON_IONS_DATA.find((i) => i.id === e.target.value);
                    if (found) setSelectedCation(found);
                  }}
                  className="w-full bg-[#0d1724] border border-slate-800 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {COMMON_IONS_DATA.filter((i) => i.type === 'cation').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.formula} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-emerald-400 uppercase block mb-1">Anion (-)</label>
                <select
                  value={selectedAnion.id}
                  onChange={(e) => {
                    const found = COMMON_IONS_DATA.find((i) => i.id === e.target.value);
                    if (found) setSelectedAnion(found);
                  }}
                  className="w-full bg-[#0d1724] border border-slate-800 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {COMMON_IONS_DATA.filter((i) => i.type === 'anion').map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.formula} - {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Formed Salt Result */}
            {formedSalt && (
              <div className="p-3.5 rounded-xl bg-[#060c14] border border-slate-800/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-extrabold font-mono text-cyan-300">
                      {formedSalt.formattedFormula}
                    </span>
                    <span className="text-xs text-slate-300 font-semibold block capitalize">
                      {formedSalt.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {formedSalt.molarMass} g/mol
                    </span>
                    <span className="text-[10px] text-slate-500 block">Molar Mass</span>
                  </div>
                </div>

                {/* Solubility Badge */}
                <div
                  className={`p-2.5 rounded-lg border flex items-start gap-2 text-xs ${
                    formedSalt.isSoluble
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                  }`}
                >
                  {formedSalt.isSoluble ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">
                      {formedSalt.isSoluble ? 'Aqueous Soluble Electrolyte' : 'Insoluble Precipitate Formed'}
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">{formedSalt.solubilityNote}</div>
                    {formedSalt.color && (
                      <div className="text-[11px] font-mono text-cyan-300 mt-1">
                        Observation: {formedSalt.color}
                      </div>
                    )}
                  </div>
                </div>

                {/* Reaction Stoichiometry representation */}
                <div className="text-[11px] font-mono text-slate-400 p-2 rounded bg-slate-900/90 border border-slate-800">
                  {formedSalt.cationCount > 1 ? `${formedSalt.cationCount}` : ''}
                  {formedSalt.cation.formula} +{' '}
                  {formedSalt.anionCount > 1 ? `${formedSalt.anionCount}` : ''}
                  {formedSalt.anion.formula} → {formedSalt.formattedFormula}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
