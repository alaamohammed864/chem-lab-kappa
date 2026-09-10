import React, { useState, useMemo } from 'react';
import { ChemicalElement, OrbitalType, OrbitalVisualizationMode, QuantumNumbers, OrbitalState } from '../types';
import { ELEMENTS_DATA, getElementByNumber, getElementBySymbol } from '../data/elements';
import { buildAtomicStructure, AtomicStructureModel } from '../engines/physics/atomicStructureEngine';
import {
  ORBITAL_CATALOG,
  getOrbitalQuantumState,
  calculateRadialDistribution,
} from '../engines/physics/orbitalEngine';
import { Atom3DCanvas } from './atom/Atom3DCanvas';
import { Orbital3DCanvas } from './atom/Orbital3DCanvas';
import {
  Orbit,
  X,
  Search,
  Sliders,
  Layers,
  Sparkles,
  Zap,
  Info,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Atom,
  HelpCircle,
  TrendingUp,
  Activity,
  CheckCircle2,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface AtomOrbitalLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialElementSymbol?: string;
  initialTab?: 'atom' | 'orbital';
}

export const AtomOrbitalLabModal: React.FC<AtomOrbitalLabModalProps> = ({
  isOpen,
  onClose,
  initialElementSymbol = 'Fe',
  initialTab = 'atom',
}) => {
  const [activeTab, setActiveTab] = useState<'atom' | 'orbital'>(initialTab);

  // -------------------------------------------------------------
  // ATOM LAB STATE
  // -------------------------------------------------------------
  const [selectedElementSymbol, setSelectedElementSymbol] = useState<string>(initialElementSymbol);
  const [elementSearchQuery, setElementSearchQuery] = useState<string>('');
  const [showNucleus, setShowNucleus] = useState<boolean>(true);
  const [showShells, setShowShells] = useState<boolean>(true);
  const [showElectrons, setShowElectrons] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [ionCharge, setIonCharge] = useState<number>(0);

  // Quick Elements for rapid testing across periods & blocks
  const quickElements = ['H', 'He', 'C', 'N', 'O', 'Na', 'Si', 'Fe', 'Cu', 'Ag', 'Au', 'U'];

  const currentElement: ChemicalElement = useMemo(() => {
    return getElementBySymbol(selectedElementSymbol) || getElementBySymbol('Fe') || ELEMENTS_DATA[25];
  }, [selectedElementSymbol]);

  const atomicModel: AtomicStructureModel = useMemo(() => {
    return buildAtomicStructure(currentElement, { charge: ionCharge });
  }, [currentElement, ionCharge]);

  // -------------------------------------------------------------
  // ORBITAL LAB STATE
  // -------------------------------------------------------------
  const [selectedOrbitalId, setSelectedOrbitalId] = useState<string>('2px');
  const [orbitalMode, setOrbitalMode] = useState<OrbitalVisualizationMode>('structure');
  const [quantumN, setQuantumN] = useState<number>(2);
  const [quantumL, setQuantumL] = useState<number>(1);
  const [quantumM, setQuantumM] = useState<number>(1);
  const [quantumSpin, setQuantumSpin] = useState<0.5 | -0.5>(0.5);
  const [showNodalPlanes, setShowNodalPlanes] = useState<boolean>(true);
  const [showAxes, setShowAxes] = useState<boolean>(true);

  // Orbital state based on quantum numbers
  const currentOrbitalState: OrbitalState = useMemo(() => {
    return getOrbitalQuantumState(quantumN, quantumL, quantumM, quantumSpin);
  }, [quantumN, quantumL, quantumM, quantumSpin]);

  // Radial probability curve points
  const radialPoints = useMemo(() => {
    return calculateRadialDistribution(quantumN, quantumL, quantumN * 6.5, 45);
  }, [quantumN, quantumL]);

  // When an orbital catalog item is picked
  const handleSelectCatalogOrbital = (item: (typeof ORBITAL_CATALOG)[0]) => {
    setSelectedOrbitalId(item.id);
    setQuantumN(item.n);
    setQuantumL(item.l);
    setQuantumM(item.m);
  };

  // Jump from current element in Atom Lab to its valence orbital in Orbital Lab
  const handleInspectValenceOrbital = () => {
    const config = currentElement.electronConfig || '';
    // Guess highest subshell from configuration (e.g. 4s, 3d, 2p, 1s)
    let targetN = 2;
    let targetL = 1;
    let targetM = 0;

    if (config.includes('f')) {
      targetL = 3;
      targetN = 4;
    } else if (config.includes('d')) {
      targetL = 2;
      targetN = 3;
    } else if (config.includes('p')) {
      targetL = 1;
      targetN = Math.min(6, currentElement.period || 2);
    } else {
      targetL = 0;
      targetN = Math.min(7, currentElement.period || 1);
    }

    setQuantumN(targetN);
    setQuantumL(targetL);
    setQuantumM(targetM);
    setActiveTab('orbital');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#091017] border border-[#1b2d42] rounded-2xl w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Modal Top Header */}
        <div className="p-3.5 sm:px-6 border-b border-[#142230] flex items-center justify-between bg-[#0b141e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Orbit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Atom & Orbital Quantum Laboratory
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                  3D Quantum Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Interactive Bohr/Aufbau atomic models and hydrogenic quantum wavefunction orbitals (s, p, d, f)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Primary Tab Switcher */}
            <div className="bg-[#070d14] p-1 rounded-lg border border-[#16273b] flex items-center gap-1">
              <button
                onClick={() => setActiveTab('atom')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'atom'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Atom className="w-3.5 h-3.5" />
                <span>3D Atom</span>
              </button>

              <button
                onClick={() => setActiveTab('orbital')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'orbital'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Orbitals (s,p,d,f)</span>
              </button>
            </div>

            <button
              onClick={onClose}
              title="Close modal"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: 3D ATOM LAB */}
        {/* ========================================================= */}
        {activeTab === 'atom' && (
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Element Quick Selector Bar */}
            <div className="p-2.5 sm:px-4 bg-[#0c1520] border-b border-[#142230] flex items-center justify-between gap-3 overflow-x-auto">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-mono text-slate-400 font-semibold uppercase tracking-wider mr-1">
                  Element:
                </span>
                {quickElements.map((sym) => {
                  const el = getElementBySymbol(sym);
                  const isSelected = selectedElementSymbol === sym;
                  return (
                    <button
                      key={sym}
                      onClick={() => {
                        setSelectedElementSymbol(sym);
                        setIonCharge(0);
                      }}
                      className={`px-2.5 py-1 rounded-md text-xs font-mono transition cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border border-cyan-400 text-cyan-200 font-bold shadow'
                          : 'bg-[#101b27] border border-[#1a2f45] text-slate-300 hover:border-cyan-500/40 hover:bg-[#142333]'
                      }`}
                    >
                      <span>{sym}</span>
                      <span className="text-[9px] text-slate-400 font-normal">{el?.number}</span>
                    </button>
                  );
                })}
              </div>

              {/* Element Search Input */}
              <div className="relative shrink-0 w-44 sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search 118 elements..."
                  value={elementSearchQuery}
                  onChange={(e) => {
                    const q = e.target.value;
                    setElementSearchQuery(q);
                    if (q.trim()) {
                      const match = ELEMENTS_DATA.find(
                        (el) =>
                          el.name.toLowerCase().includes(q.toLowerCase()) ||
                          el.symbol.toLowerCase() === q.toLowerCase() ||
                          String(el.number) === q.trim()
                      );
                      if (match) setSelectedElementSymbol(match.symbol);
                    }
                  }}
                  className="w-full bg-[#080e16] border border-[#1b2d42] rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
              {/* 3D Viewport (Left / Center: 8 cols) */}
              <div className="lg:col-span-8 p-3 sm:p-4 flex flex-col bg-[#070d14] relative border-b lg:border-b-0 lg:border-r border-[#142230]">
                <Atom3DCanvas
                  model={atomicModel}
                  showNucleus={showNucleus}
                  showShells={showShells}
                  showElectrons={showElectrons}
                  showLabels={showLabels}
                  reducedMotion={reducedMotion}
                  speedMultiplier={speedMultiplier}
                />

                {/* Sub-toolbar below canvas */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 p-2 bg-[#0b141e] border border-[#16273a] rounded-lg text-xs font-mono">
                  {/* Visual Layer Toggles */}
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={showNucleus}
                        onChange={(e) => setShowNucleus(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                      />
                      <span>Nucleus</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={showShells}
                        onChange={(e) => setShowShells(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                      />
                      <span>Shells</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={showElectrons}
                        onChange={(e) => setShowElectrons(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                      />
                      <span>Electrons</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={showLabels}
                        onChange={(e) => setShowLabels(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                      />
                      <span>Labels</span>
                    </label>
                  </div>

                  {/* Speed Controls & Reduced Motion */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Speed:</span>
                      {[0.5, 1.0, 2.0].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => {
                            setSpeedMultiplier(spd);
                            setReducedMotion(false);
                          }}
                          className={`px-1.5 py-0.5 rounded text-[10px] transition cursor-pointer ${
                            speedMultiplier === spd && !reducedMotion
                              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                              : 'bg-slate-900 text-slate-400 hover:text-white'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setReducedMotion(!reducedMotion)}
                      title="Toggle reduced motion accessibility"
                      className={`px-2 py-0.5 rounded text-[10px] border transition cursor-pointer ${
                        reducedMotion
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                          : 'bg-[#0f1b29] border-[#1a2e44] text-slate-400 hover:text-white'
                      }`}
                    >
                      Reduced Motion: {reducedMotion ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Inspector & Atomic Breakdown Sidebar (Right: 4 cols) */}
              <div className="lg:col-span-4 p-4 bg-[#0a121c] flex flex-col gap-4 overflow-y-auto">
                {/* Element Header Card */}
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#101b29] to-[#0c1522] border border-[#1b2f44]">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-400 p-[2px] shadow-lg">
                        <div className="w-full h-full rounded-[10px] bg-[#091018] flex flex-col items-center justify-center">
                          <span className="text-lg font-black text-cyan-300 leading-none">
                            {currentElement.symbol}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{currentElement.number}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white leading-tight">{currentElement.name}</h4>
                        <p className="text-xs text-slate-400 font-mono">
                          Category: <span className="text-cyan-400 capitalize">{currentElement.category}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleInspectValenceOrbital}
                      title="Inspect Valence Orbital in 3D"
                      className="px-2.5 py-1.5 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-300 text-[11px] font-mono hover:bg-purple-900/50 transition cursor-pointer flex items-center gap-1"
                    >
                      <span>Orbital</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Particle Counter Grid */}
                  <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-[#182c40] text-center font-mono">
                    <div className="p-2 rounded-lg bg-[#070e17] border border-[#142334]">
                      <span className="text-[10px] text-cyan-400 block font-semibold">Protons (Z)</span>
                      <span className="text-base font-bold text-white">{atomicModel.protons}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#070e17] border border-[#142334]">
                      <span className="text-[10px] text-amber-400 block font-semibold">Neutrons (N)</span>
                      <span className="text-base font-bold text-white">{atomicModel.neutrons}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#070e17] border border-[#142334]">
                      <span className="text-[10px] text-blue-400 block font-semibold">Electrons (e⁻)</span>
                      <span className="text-base font-bold text-white">{atomicModel.electrons}</span>
                    </div>
                  </div>
                </div>

                {/* Ionization & Charge State Modifier */}
                <div className="p-3 rounded-xl bg-[#0c1521] border border-[#172b3e]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300">Net Oxidation / Charge State:</span>
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      {ionCharge > 0 ? `+${ionCharge}` : ionCharge < 0 ? `${ionCharge}` : 'Neutral (0)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    {[-2, -1, 0, 1, 2, 3].map((val) => (
                      <button
                        key={val}
                        onClick={() => setIonCharge(val)}
                        className={`flex-1 py-1 rounded transition cursor-pointer ${
                          ionCharge === val
                            ? 'bg-cyan-500/30 border border-cyan-400 text-cyan-200 font-bold'
                            : 'bg-[#101c2a] border border-[#1a2e44] text-slate-400 hover:text-white'
                        }`}
                      >
                        {val > 0 ? `+${val}` : val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Electron Shell Filling Table */}
                <div className="p-3 rounded-xl bg-[#0c1521] border border-[#172b3e] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">Shell Distribution (Bohr / Aufbau):</span>
                    <span className="text-[11px] font-mono text-slate-400">{atomicModel.shells.length} shells</span>
                  </div>

                  <div className="space-y-1.5 font-mono text-xs">
                    {atomicModel.shells.map((shell) => {
                      const pct = Math.round((shell.electrons / shell.capacity) * 100);
                      return (
                        <div key={shell.name} className="p-2 rounded-lg bg-[#070e17] border border-[#152538]">
                          <div className="flex items-center justify-between mb-1 text-[11px]">
                            <span className="font-bold text-cyan-300">
                              Shell {shell.name} (n={shell.n})
                            </span>
                            <span className="text-slate-300">
                              {shell.electrons} / {shell.capacity} e⁻ ({pct}%)
                            </span>
                          </div>
                          {/* Progress Bar */}
                          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-1 text-[9px] text-slate-500">
                            <span>Level Energy: {shell.energyEv} eV</span>
                            <span>Orbital Radius: ~{shell.radius.toFixed(1)} Å</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quantum Physics Properties Card */}
                <div className="p-3 rounded-xl bg-[#0c1521] border border-[#172b3e] space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Valence Electrons:</span>
                    <span className="text-white font-bold">{currentElement.valenceElectrons ?? 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Ground State Config:</span>
                    <span className="text-cyan-300 font-bold">{currentElement.electronConfig}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Effective Nuclear Charge (Z_eff):</span>
                    <span className="text-white font-bold">{atomicModel.effectiveNuclearCharge}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>First Ionization Energy:</span>
                    <span className="text-white font-bold">
                      {currentElement.ionizationEnergy ? `${currentElement.ionizationEnergy} kJ/mol` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Electronegativity (Pauling):</span>
                    <span className="text-white font-bold">{currentElement.electronegativity ?? 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: SCIENTIFIC ORBITAL LAB */}
        {/* ========================================================= */}
        {activeTab === 'orbital' && (
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Orbital Catalog Quick Picker */}
            <div className="p-2.5 sm:px-4 bg-[#0c1520] border-b border-[#142230] flex items-center justify-between gap-3 overflow-x-auto">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-mono text-slate-400 font-semibold uppercase tracking-wider mr-1">
                  Preset Orbitals:
                </span>
                {ORBITAL_CATALOG.map((item) => {
                  const isSelected =
                    quantumN === item.n && quantumL === item.l && quantumM === item.m;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectCatalogOrbital(item)}
                      className={`px-2.5 py-1 rounded-md text-xs font-mono transition cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-500/30 to-fuchsia-500/30 border border-purple-400 text-purple-200 font-bold shadow'
                          : 'bg-[#101b27] border border-[#1a2f45] text-slate-300 hover:border-purple-500/40 hover:bg-[#142333]'
                      }`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>

              {/* Visualization Mode Switcher */}
              <div className="flex items-center gap-1 bg-[#070d14] p-1 rounded-lg border border-[#182c40] shrink-0 font-mono text-xs">
                <button
                  onClick={() => setOrbitalMode('structure')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                    orbitalMode === 'structure'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Nodal Lobes</span>
                </button>

                <button
                  onClick={() => setOrbitalMode('probability')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                    orbitalMode === 'probability'
                      ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Probability Cloud</span>
                </button>

                <button
                  onClick={() => setOrbitalMode('electron-density')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                    orbitalMode === 'electron-density'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Density Heatmap</span>
                </button>
              </div>
            </div>

            {/* Orbital Interactive Workspace Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
              {/* 3D Orbital Canvas (Left / Center: 8 cols) */}
              <div className="lg:col-span-8 p-3 sm:p-4 flex flex-col bg-[#060c13] relative border-b lg:border-b-0 lg:border-r border-[#142230]">
                <Orbital3DCanvas
                  orbital={currentOrbitalState}
                  mode={orbitalMode}
                  showNodalPlanes={showNodalPlanes}
                  showAxes={showAxes}
                  reducedMotion={reducedMotion}
                />

                {/* Sub-toolbar below canvas */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 p-2 bg-[#0b141e] border border-[#16273a] rounded-lg text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={showNodalPlanes}
                        onChange={(e) => setShowNodalPlanes(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-purple-500 focus:ring-0"
                      />
                      <span>Nodal Planes</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={showAxes}
                        onChange={(e) => setShowAxes(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-purple-500 focus:ring-0"
                      />
                      <span>Coordinate Axes (XYZ)</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-[10px]">Wavefunction:</span>
                    <span className="text-cyan-300 font-bold">{currentOrbitalState.formula}</span>
                  </div>
                </div>
              </div>

              {/* Quantum Numbers & Scientific Calculation Inspector (Right: 4 cols) */}
              <div className="lg:col-span-4 p-4 bg-[#0a121c] flex flex-col gap-4 overflow-y-auto">
                {/* Quantum Numbers Configurator Card */}
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#121926] to-[#0d1420] border border-[#1d2f44] flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-purple-400" />
                      <span>Quantum Numbers</span>
                    </h4>
                    <span className="text-[11px] font-mono text-cyan-300 font-bold">
                      {currentOrbitalState.name}
                    </span>
                  </div>

                  {/* n: Principal */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="text-slate-300">Principal (n): Energy Level</span>
                      <span className="text-cyan-400 font-bold">{quantumN}</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-xs">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          onClick={() => {
                            setQuantumN(val);
                            if (quantumL >= val) setQuantumL(val - 1);
                          }}
                          className={`flex-1 py-1 rounded transition cursor-pointer ${
                            quantumN === val
                              ? 'bg-cyan-500/30 border border-cyan-400 text-cyan-200 font-bold'
                              : 'bg-[#0f1b28] border border-[#192c40] text-slate-400 hover:text-white'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* l: Azimuthal */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="text-slate-300">Azimuthal (l): Orbital Angular Momentum</span>
                      <span className="text-purple-400 font-bold">
                        {quantumL} ({['s', 'p', 'd', 'f'][quantumL]})
                      </span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-xs">
                      {[
                        { l: 0, label: 's (0)' },
                        { l: 1, label: 'p (1)' },
                        { l: 2, label: 'd (2)' },
                        { l: 3, label: 'f (3)' },
                      ]
                        .filter((item) => item.l < quantumN)
                        .map((item) => (
                          <button
                            key={item.l}
                            onClick={() => {
                              setQuantumL(item.l);
                              if (Math.abs(quantumM) > item.l) setQuantumM(0);
                            }}
                            className={`flex-1 py-1 rounded transition cursor-pointer ${
                              quantumL === item.l
                                ? 'bg-purple-500/30 border border-purple-400 text-purple-200 font-bold'
                                : 'bg-[#0f1b28] border border-[#192c40] text-slate-400 hover:text-white'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* m: Magnetic */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="text-slate-300">Magnetic (mₗ): Spatial Orientation</span>
                      <span className="text-fuchsia-400 font-bold">{quantumM}</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-xs overflow-x-auto">
                      {Array.from({ length: 2 * quantumL + 1 }, (_, i) => i - quantumL).map((val) => (
                        <button
                          key={val}
                          onClick={() => setQuantumM(val)}
                          className={`flex-1 min-w-[28px] py-1 rounded transition cursor-pointer ${
                            quantumM === val
                              ? 'bg-fuchsia-500/30 border border-fuchsia-400 text-fuchsia-200 font-bold'
                              : 'bg-[#0f1b28] border border-[#192c40] text-slate-400 hover:text-white'
                          }`}
                        >
                          {val > 0 ? `+${val}` : val}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* spin: Electron Spin */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="text-slate-300">Spin (mₛ): Intrinsic Spin</span>
                      <span className="text-amber-400 font-bold">
                        {quantumSpin > 0 ? '+½ (↑)' : '-½ (↓)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <button
                        onClick={() => setQuantumSpin(0.5)}
                        className={`flex-1 py-1 rounded transition cursor-pointer ${
                          quantumSpin === 0.5
                            ? 'bg-amber-500/30 border border-amber-400 text-amber-200 font-bold'
                            : 'bg-[#0f1b28] border border-[#192c40] text-slate-400 hover:text-white'
                        }`}
                      >
                        +½ (Spin Up ↑)
                      </button>
                      <button
                        onClick={() => setQuantumSpin(-0.5)}
                        className={`flex-1 py-1 rounded transition cursor-pointer ${
                          quantumSpin === -0.5
                            ? 'bg-amber-500/30 border border-amber-400 text-amber-200 font-bold'
                            : 'bg-[#0f1b28] border border-[#192c40] text-slate-400 hover:text-white'
                        }`}
                      >
                        -½ (Spin Down ↓)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quantum Calculations & Nodal Metrics */}
                <div className="p-3.5 rounded-xl bg-[#0c1521] border border-[#172b3e] space-y-2.5 text-xs font-mono">
                  <span className="text-xs font-semibold text-slate-200 block font-sans">
                    Nodal & Quantum Calculations:
                  </span>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Radial Nodes (n - l - 1):</span>
                    <span className="text-cyan-300 font-bold">{currentOrbitalState.radialNodes}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Angular Nodal Planes (l):</span>
                    <span className="text-purple-300 font-bold">{currentOrbitalState.angularNodes}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Total Nodes (n - 1):</span>
                    <span className="text-white font-bold">{currentOrbitalState.totalNodes}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Eigenvalue Energy (E_n):</span>
                    <span className="text-emerald-400 font-bold">{currentOrbitalState.energyEv} eV</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Angular Momentum |L|:</span>
                    <span className="text-white font-bold">
                      {(Math.sqrt(quantumL * (quantumL + 1))).toFixed(3)} ℏ
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>L_z Projection:</span>
                    <span className="text-white font-bold">{quantumM} ℏ</span>
                  </div>
                </div>

                {/* Radial Probability Density Curve SVG */}
                <div className="p-3.5 rounded-xl bg-[#0c1521] border border-[#172b3e] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">
                      Radial Probability Density P(r) = r²|R(r)|²
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400">a₀ units</span>
                  </div>

                  {/* SVG Chart */}
                  <div className="w-full h-28 bg-[#070e17] rounded-lg border border-[#152538] p-2 flex items-end">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="0" y1="50" x2="100" y2="50" stroke="#1f364d" strokeWidth="1" />
                      <line x1="0" y1="25" x2="100" y2="25" stroke="#142636" strokeDasharray="2,2" strokeWidth="0.8" />

                      {/* Probability Curve */}
                      {radialPoints.length > 1 && (
                        <path
                          d={(() => {
                            const maxDensity = Math.max(0.001, ...radialPoints.map((p) => p.density));
                            const pointsStr = radialPoints
                              .map((p, idx) => {
                                const x = (idx / (radialPoints.length - 1)) * 100;
                                const y = 50 - (p.density / maxDensity) * 45;
                                return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                              })
                              .join(' ');
                            return pointsStr;
                          })()}
                          fill="none"
                          stroke="#38e1e7"
                          strokeWidth="1.8"
                        />
                      )}
                    </svg>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Peak probability represents the most probable distance of finding the electron from the nucleus.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
