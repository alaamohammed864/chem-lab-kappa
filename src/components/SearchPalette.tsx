import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Table,
  Calculator,
  FlaskConical,
  Boxes,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Atom,
} from 'lucide-react';
import { ELEMENTS_DATA } from '../data/elements';
import { MATERIALS_DATA } from '../data/materials';
import { COMMON_IONS_DATA } from '../data/ionsData';
import { MOLECULES_DATABASE } from '../data/moleculesData';
import { ViewMode } from '../types';

interface SearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ViewMode) => void;
}

export const SearchPalette: React.FC<SearchPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        // handled in parent or here
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tools = [
    { id: 'periodic-table' as ViewMode, title: 'Periodic Table', desc: 'Browse 118 elements', icon: Table },
    { id: 'molar-mass' as ViewMode, title: 'Molar Mass Lab', desc: 'Molecular weight & stoichiometry', icon: Calculator },
    { id: 'balance-equation' as ViewMode, title: 'Equation Balancer', desc: 'Balance chemical reactions', icon: FlaskConical },
    { id: 'ion-explorer' as ViewMode, title: 'Ion Explorer & Salts', desc: 'Common ions, oxidation states & precipitates', icon: Atom },
    { id: 'molecule-lab' as ViewMode, title: 'Molecule 3D/2D Lab', desc: '3D/2D molecular visualizer & VSEPR geometry', icon: Boxes },
    { id: 'material-explorer' as ViewMode, title: 'Material Explorer', desc: 'Browse alloys & technical ceramics', icon: Boxes },
    { id: 'crystal-structure' as ViewMode, title: 'Crystal Structures', desc: 'BCC, FCC, HCP & Miller indices', icon: Sparkles },
    { id: 'xrd-lab' as ViewMode, title: 'XRD Laboratory', desc: 'Diffractometer phase identification', icon: TrendingUp },
  ];

  const filteredTools = tools.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    t.desc.toLowerCase().includes(query.toLowerCase())
  );

  const matchedMolecules = MOLECULES_DATABASE.filter(
    (m) =>
      query.trim() &&
      (m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.formula.toLowerCase().includes(query.toLowerCase()) ||
        m.iupacName.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 4);

  const matchedIons = COMMON_IONS_DATA.filter(
    (i) =>
      query.trim() &&
      (i.name.toLowerCase().includes(query.toLowerCase()) ||
        i.formula.toLowerCase().includes(query.toLowerCase()) ||
        i.plainFormula.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 4);

  const matchedElements = ELEMENTS_DATA.filter(
    (el) =>
      query.trim() &&
      (el.name.toLowerCase().includes(query.toLowerCase()) ||
        el.symbol.toLowerCase().includes(query.toLowerCase()) ||
        String(el.number) === query.trim())
  ).slice(0, 4);

  const matchedMaterials = MATERIALS_DATA.filter(
    (mat) =>
      query.trim() &&
      (mat.name.toLowerCase().includes(query.toLowerCase()) ||
        mat.designation.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#091017] border border-[#1b2d42] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input */}
        <div className="p-3.5 border-b border-[#142230] flex items-center gap-3 bg-[#0c141e]">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search elements, alloys, tools, or XRD phases..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-[#142334] rounded border border-[#203750]">
            ESC
          </kbd>
        </div>

        {/* Search Results List */}
        <div className="p-3 overflow-y-auto max-h-[60vh] space-y-3 text-xs font-mono">
          {/* Tools Section */}
          <div>
            <div className="px-2 pb-1 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Lab Tools & Workspaces
            </div>
            <div className="space-y-1">
              {filteredTools.map((t) => {
                const IconComponent = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      onNavigate(t.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/60 text-left transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 group-hover:border-cyan-500/50">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-white font-medium group-hover:text-cyan-300">{t.title}</div>
                        <div className="text-[10px] text-slate-400 font-sans">{t.desc}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Matched Molecules */}
          {matchedMolecules.length > 0 && (
            <div>
              <div className="px-2 pt-2 pb-1 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Molecules (3D/2D)
              </div>
              <div className="space-y-1">
                {matchedMolecules.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onNavigate('molecule-lab');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/60 text-left transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-6 rounded bg-purple-950 border border-purple-700 text-purple-300 flex items-center justify-center font-bold text-[11px] font-mono">
                        {m.formula}
                      </span>
                      <span className="text-white">{m.name} ({m.vseprGeometry})</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{m.molarMass} g/mol</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Ions */}
          {matchedIons.length > 0 && (
            <div>
              <div className="px-2 pt-2 pb-1 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Ions & Salts
              </div>
              <div className="space-y-1">
                {matchedIons.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => {
                      onNavigate('ion-explorer');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/60 text-left transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-6 rounded bg-blue-950 border border-blue-700 text-blue-300 flex items-center justify-center font-bold text-[11px] font-mono">
                        {i.formula}
                      </span>
                      <span className="text-white">{i.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{i.charge > 0 ? `+${i.charge}` : i.charge}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Elements */}
          {matchedElements.length > 0 && (
            <div>
              <div className="px-2 pt-2 pb-1 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Chemical Elements
              </div>
              <div className="space-y-1">
                {matchedElements.map((el) => (
                  <button
                    key={el.number}
                    onClick={() => {
                      onNavigate('periodic-table');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/60 text-left transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-cyan-950 border border-cyan-700 text-cyan-300 flex items-center justify-center font-bold text-[11px]">
                        {el.symbol}
                      </span>
                      <span className="text-white">{el.name} (#{el.number})</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{el.atomicMass} u</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Materials */}
          {matchedMaterials.length > 0 && (
            <div>
              <div className="px-2 pt-2 pb-1 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Materials & Alloys
              </div>
              <div className="space-y-1">
                {matchedMaterials.map((mat) => (
                  <button
                    key={mat.id}
                    onClick={() => {
                      onNavigate('material-explorer');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/60 text-left transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-amber-950 border border-amber-700 text-amber-300 flex items-center justify-center font-bold text-[10px]">
                        {mat.name.substring(0, 2).toUpperCase()}
                      </span>
                      <span className="text-white">{mat.name} ({mat.designation})</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{mat.crystalStructure}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
