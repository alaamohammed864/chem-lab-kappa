// Molecule Explorer Component
// Allows interactive visual exploration of molecular geometries, 3D WebGL vs 2D views,
// VSEPR properties, point groups, and atomic coordinates.

import React, { useState } from 'react';
import { MOLECULES_DATABASE, MoleculeData, MoleculeAtom } from '../../data/moleculesData';
import { MoleculeVisualizer3D, MoleculeRenderMode } from './MoleculeVisualizer3D';
import { Molecule2DView } from './Molecule2DView';
import {
  Boxes,
  RotateCw,
  Eye,
  Search,
  Maximize2,
  Compass,
  Zap,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const MoleculeExplorer: React.FC = () => {
  const [selectedMoleculeId, setSelectedMoleculeId] = useState<string>('h2o');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewDimension, setViewDimension] = useState<'3D' | '2D'>('3D');
  const [renderMode, setRenderMode] = useState<MoleculeRenderMode>('ball-and-stick');
  const [autoRotate, setAutoRotate] = useState(true);
  const [showDipole, setShowDipole] = useState(true);
  const [selectedAtom, setSelectedAtom] = useState<MoleculeAtom | null>(null);

  const selectedMolecule: MoleculeData =
    MOLECULES_DATABASE.find((m) => m.id === selectedMoleculeId) || MOLECULES_DATABASE[0];

  const filteredMolecules = MOLECULES_DATABASE.filter((m) => {
    if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        m.name.toLowerCase().includes(q) ||
        m.formula.toLowerCase().includes(q) ||
        m.iupacName.toLowerCase().includes(q) ||
        m.vseprGeometry.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'inorganic', 'organic', 'atmospheric'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-[#0e1724] text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px] sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search molecule..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#09111c] border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Main Molecule Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Quick Selector List */}
        <div className="lg:col-span-4 space-y-2 max-h-[560px] overflow-y-auto pr-1">
          {filteredMolecules.map((mol) => {
            const isSelected = mol.id === selectedMolecule.id;
            return (
              <div
                key={mol.id}
                onClick={() => {
                  setSelectedMoleculeId(mol.id);
                  setSelectedAtom(null);
                }}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                    : 'bg-[#0a121c] border-slate-800/80 hover:bg-[#0f1b29] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs font-mono shrink-0 ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800/80 text-cyan-400 border border-slate-700/60'
                    }`}
                  >
                    {mol.formula}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                      <span>{mol.name}</span>
                      {mol.isPolar && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" title="Polar Molecule" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{mol.vseprGeometry}</div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-slate-500 block">{mol.pointGroup}</span>
                  <span className="text-[9px] font-mono text-cyan-400/80">{mol.dipoleMomentDebye} D</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Visualization Viewport & Chemical Data */}
        <div className="lg:col-span-8 space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#0b131e] border border-slate-800">
            {/* 3D vs 2D Selector */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800">
              <button
                onClick={() => setViewDimension('3D')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                  viewDimension === '3D' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                3D Viewport
              </button>
              <button
                onClick={() => setViewDimension('2D')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                  viewDimension === '2D' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                2D Structure
              </button>
            </div>

            {/* 3D Render Modes */}
            {viewDimension === '3D' && (
              <div className="flex items-center gap-1">
                {(['ball-and-stick', 'space-filling', 'wireframe'] as MoleculeRenderMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setRenderMode(mode)}
                    className={`px-2.5 py-1 text-[11px] capitalize rounded-md transition cursor-pointer ${
                      renderMode === mode
                        ? 'bg-slate-800 text-cyan-300 font-medium border border-cyan-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    {mode.replace(/-/g, ' ')}
                  </button>
                ))}
              </div>
            )}

            {/* Toggles */}
            {viewDimension === '3D' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`p-1.5 rounded-lg border text-xs transition cursor-pointer flex items-center gap-1 ${
                    autoRotate
                      ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Toggle Auto-Rotation"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline text-[10px]">Spin</span>
                </button>

                <button
                  onClick={() => setShowDipole(!showDipole)}
                  className={`p-1.5 rounded-lg border text-xs transition cursor-pointer flex items-center gap-1 ${
                    showDipole
                      ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Toggle Dipole Vector"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[10px]">Dipole</span>
                </button>
              </div>
            )}
          </div>

          {/* Canvas Viewport */}
          <div className="h-[380px] w-full rounded-2xl overflow-hidden border border-slate-800 shadow-xl relative">
            {viewDimension === '3D' ? (
              <MoleculeVisualizer3D
                molecule={selectedMolecule}
                renderMode={renderMode}
                autoRotate={autoRotate}
                showDipole={showDipole}
                onSelectAtom={setSelectedAtom}
              />
            ) : (
              <Molecule2DView molecule={selectedMolecule} />
            )}
          </div>

          {/* Molecule Metadata & VSEPR Geometry Dashboard */}
          <div className="p-4 rounded-xl bg-[#09111b] border border-slate-800/90 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white">{selectedMolecule.name}</h4>
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                    {selectedMolecule.formattedFormula}
                  </span>
                  <span className="text-xs text-slate-400 italic">({selectedMolecule.iupacName})</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{selectedMolecule.description}</p>
              </div>

              <div className="text-right">
                <span className="text-sm font-bold font-mono text-emerald-400">
                  {selectedMolecule.molarMass} g/mol
                </span>
                <span className="text-[10px] text-slate-500 block uppercase">Molar Mass</span>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2.5 rounded-lg bg-[#0d1724] border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">VSEPR Geometry</span>
                <span className="text-xs font-semibold text-white">{selectedMolecule.vseprGeometry}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0d1724] border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Point Group</span>
                <span className="text-xs font-semibold text-cyan-300 font-mono">{selectedMolecule.pointGroup}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0d1724] border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Dipole Moment</span>
                <span className="text-xs font-semibold text-amber-300 font-mono">
                  {selectedMolecule.dipoleMomentDebye} D ({selectedMolecule.isPolar ? 'Polar' : 'Non-polar'})
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0d1724] border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Atoms & Bonds</span>
                <span className="text-xs font-semibold text-white">
                  {selectedMolecule.atoms.length} atoms, {selectedMolecule.bonds.length} bonds
                </span>
              </div>
            </div>

            {/* Selected Atom Inspection or Coordinate Preview */}
            <div className="p-3 rounded-lg bg-[#070d15] border border-slate-800/80 text-xs">
              <div className="flex items-center justify-between text-slate-400 font-mono text-[11px] mb-2">
                <span>Atomic Coordinates (Cartesian Ångströms)</span>
                <span className="text-cyan-400">Click any atom in 3D to inspect</span>
              </div>
              <div className="max-h-28 overflow-y-auto font-mono text-[11px] space-y-1 text-slate-300">
                {selectedMolecule.atoms.map((a) => (
                  <div
                    key={a.id}
                    className={`flex items-center justify-between px-2 py-1 rounded ${
                      selectedAtom?.id === a.id
                        ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="font-bold w-12">{a.id} ({a.element})</span>
                    <span>X: {a.x.toFixed(3)}</span>
                    <span>Y: {a.y.toFixed(3)}</span>
                    <span>Z: {a.z.toFixed(3)}</span>
                    <span className="text-slate-500 text-[10px]">{a.hybridization || 'sp'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
