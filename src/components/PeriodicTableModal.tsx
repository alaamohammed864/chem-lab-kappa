import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ELEMENTS_DATA, getElementByNumber } from '../data/elements';
import { ChemicalElement } from '../types';
import {
  Search,
  X,
  Layers,
  Sparkles,
  ShieldAlert,
  Compass,
  CheckCircle2,
  Copy,
  Plus,
  Grid,
  LayoutGrid,
  Thermometer,
  Zap,
  Flame,
  ArrowRight,
} from 'lucide-react';

interface PeriodicTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectForCalculation?: (element: ChemicalElement) => void;
}

type BlockType = 'all' | 's' | 'p' | 'd' | 'f';
type PhaseType = 'all' | 'solid' | 'liquid' | 'gas';
type ViewLayout = 'table' | 'grid';

export const PeriodicTableModal: React.FC<PeriodicTableModalProps> = ({
  isOpen,
  onClose,
  onSelectForCalculation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBlock, setSelectedBlock] = useState<BlockType>('all');
  const [selectedPhase, setSelectedPhase] = useState<PhaseType>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<number | 'all'>('all');
  const [layoutMode, setLayoutMode] = useState<ViewLayout>('table');
  const [copied, setCopied] = useState(false);

  // Active selected element
  const [activeElement, setActiveElement] = useState<ChemicalElement>(() => {
    return ELEMENTS_DATA.find((e) => e.symbol === 'Fe') || ELEMENTS_DATA[0];
  });

  // Hovered element for quick snapshot tooltip/status
  const [hoveredElement, setHoveredElement] = useState<ChemicalElement | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(
    () => [
      { id: 'all', label: 'All Categories' },
      { id: 'alkali', label: 'Alkali Metals' },
      { id: 'alkaline-earth', label: 'Alkaline Earth' },
      { id: 'transition-metal', label: 'Transition Metals' },
      { id: 'post-transition', label: 'Post-Transition' },
      { id: 'metalloid', label: 'Metalloids' },
      { id: 'nonmetal', label: 'Nonmetals' },
      { id: 'halogen', label: 'Halogens' },
      { id: 'noble-gas', label: 'Noble Gases' },
      { id: 'lanthanide', label: 'Lanthanides' },
      { id: 'actinide', label: 'Actinides' },
    ],
    []
  );

  // Filter logic
  const filteredElements = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ELEMENTS_DATA.filter((el) => {
      const matchesSearch =
        !q ||
        el.name.toLowerCase().includes(q) ||
        el.symbol.toLowerCase().includes(q) ||
        String(el.number) === q ||
        (el.summary && el.summary.toLowerCase().includes(q)) ||
        (el.applications && el.applications.some((app) => app.toLowerCase().includes(q)));

      const matchesCategory = selectedCategory === 'all' || el.category === selectedCategory;
      const matchesBlock = selectedBlock === 'all' || el.block === selectedBlock;
      const matchesPhase = selectedPhase === 'all' || el.phase === selectedPhase;
      const matchesPeriod = selectedPeriod === 'all' || el.period === selectedPeriod;

      return matchesSearch && matchesCategory && matchesBlock && matchesPhase && matchesPeriod;
    });
  }, [searchQuery, selectedCategory, selectedBlock, selectedPhase, selectedPeriod]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        const currentIndex = filteredElements.findIndex((el) => el.number === activeElement.number);
        if (currentIndex === -1) {
          if (filteredElements.length > 0) setActiveElement(filteredElements[0]);
          return;
        }

        let nextIndex = currentIndex;
        if (e.key === 'ArrowRight') {
          nextIndex = (currentIndex + 1) % filteredElements.length;
        } else if (e.key === 'ArrowLeft') {
          nextIndex = (currentIndex - 1 + filteredElements.length) % filteredElements.length;
        } else if (e.key === 'ArrowDown') {
          // Jump down approx a row
          nextIndex = Math.min(filteredElements.length - 1, currentIndex + (layoutMode === 'table' ? 18 : 6));
        } else if (e.key === 'ArrowUp') {
          nextIndex = Math.max(0, currentIndex - (layoutMode === 'table' ? 18 : 6));
        }
        setActiveElement(filteredElements[nextIndex]);
      }
    },
    [isOpen, onClose, filteredElements, activeElement, layoutMode]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const copySymbol = (symbol: string) => {
    navigator.clipboard.writeText(symbol);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!isOpen) return null;

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'transition-metal':
        return 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300 hover:border-cyan-400';
      case 'nonmetal':
        return 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:border-emerald-400';
      case 'noble-gas':
        return 'border-indigo-500/40 bg-indigo-950/30 text-indigo-300 hover:border-indigo-400';
      case 'alkali':
        return 'border-rose-500/40 bg-rose-950/30 text-rose-300 hover:border-rose-400';
      case 'alkaline-earth':
        return 'border-amber-500/40 bg-amber-950/30 text-amber-300 hover:border-amber-400';
      case 'metalloid':
        return 'border-teal-500/40 bg-teal-950/30 text-teal-300 hover:border-teal-400';
      case 'halogen':
        return 'border-purple-500/40 bg-purple-950/30 text-purple-300 hover:border-purple-400';
      case 'post-transition':
        return 'border-sky-500/40 bg-sky-950/30 text-sky-300 hover:border-sky-400';
      case 'lanthanide':
        return 'border-pink-500/40 bg-pink-950/30 text-pink-300 hover:border-pink-400';
      case 'actinide':
        return 'border-orange-500/40 bg-orange-950/30 text-orange-300 hover:border-orange-400';
      default:
        return 'border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-500';
    }
  };

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case 'transition-metal':
        return 'bg-cyan-950/60 border-cyan-800 text-cyan-300';
      case 'nonmetal':
        return 'bg-emerald-950/60 border-emerald-800 text-emerald-300';
      case 'noble-gas':
        return 'bg-indigo-950/60 border-indigo-800 text-indigo-300';
      case 'alkali':
        return 'bg-rose-950/60 border-rose-800 text-rose-300';
      case 'alkaline-earth':
        return 'bg-amber-950/60 border-amber-800 text-amber-300';
      case 'metalloid':
        return 'bg-teal-950/60 border-teal-800 text-teal-300';
      case 'halogen':
        return 'bg-purple-950/60 border-purple-800 text-purple-300';
      case 'post-transition':
        return 'bg-sky-950/60 border-sky-800 text-sky-300';
      case 'lanthanide':
        return 'bg-pink-950/60 border-pink-800 text-pink-300';
      case 'actinide':
        return 'bg-orange-950/60 border-orange-800 text-orange-300';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  // Helper to render an element card in 18-column periodic table coordinate layout
  const renderElementButton = (el: ChemicalElement, compact = false) => {
    const isSelected = activeElement.number === el.number;
    const isFiltered = filteredElements.some((item) => item.number === el.number);
    const isDimmed = !isFiltered;

    return (
      <button
        key={el.number}
        id={`element-btn-${el.number}`}
        onClick={() => setActiveElement(el)}
        onMouseEnter={() => setHoveredElement(el)}
        onMouseLeave={() => setHoveredElement(null)}
        disabled={isDimmed}
        className={`p-1 sm:p-1.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden ${
          compact ? 'h-14 sm:h-16' : 'h-14 sm:h-16'
        } ${getCategoryColor(el.category)} ${
          isSelected
            ? 'ring-2 ring-cyan-400 scale-[1.05] z-10 shadow-lg shadow-cyan-500/30'
            : isDimmed
            ? 'opacity-20 cursor-not-allowed filter grayscale'
            : 'hover:scale-[1.02]'
        }`}
        title={`${el.name} (${el.symbol}) - Atomic # ${el.number}`}
      >
        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 w-full leading-none">
          <span>{el.number}</span>
          <span className="text-[8px] font-sans opacity-80 uppercase">{el.block}</span>
        </div>
        <div className="mt-0.5">
          <div className="text-sm sm:text-base font-extrabold tracking-tight leading-none text-white">
            {el.symbol}
          </div>
          <div className="text-[8px] sm:text-[9px] truncate text-slate-300 mt-0.5 leading-tight font-medium">
            {el.name}
          </div>
        </div>
        <div className="text-[8px] font-mono text-slate-400 truncate opacity-70">
          {typeof el.atomicMass === 'number' ? el.atomicMass.toFixed(1) : el.atomicMass}
        </div>
      </button>
    );
  };

  // Standard 18-column Periodic Table coordinate mapping
  // Periods 1 to 7 with 18 groups
  const renderPeriodicTableGrid = () => {
    const gridCells: (ChemicalElement | null)[][] = Array.from({ length: 7 }, () =>
      Array(18).fill(null)
    );

    ELEMENTS_DATA.forEach((el) => {
      // Lanthanides (57-71) & Actinides (89-103) go to f-block rows below
      if (el.number >= 57 && el.number <= 71) return;
      if (el.number >= 89 && el.number <= 103) return;

      const pIndex = el.period - 1;
      const gIndex = el.group - 1;
      if (pIndex >= 0 && pIndex < 7 && gIndex >= 0 && gIndex < 18) {
        gridCells[pIndex][gIndex] = el;
      }
    });

    const lanthanides = ELEMENTS_DATA.filter((e) => e.number >= 57 && e.number <= 71);
    const actinides = ELEMENTS_DATA.filter((e) => e.number >= 89 && e.number <= 103);

    return (
      <div className="min-w-[780px] p-2 sm:p-4 space-y-4">
        {/* Main 7 Periods x 18 Groups */}
        <div className="space-y-1">
          {gridCells.map((row, pIdx) => (
            <div key={`period-${pIdx + 1}`} className="grid grid-cols-18 gap-1 items-center">
              {row.map((cell, gIdx) => {
                // Placeholders for Lanthanide (period 6, group 3) and Actinide (period 7, group 3)
                if (pIdx === 5 && gIdx === 2) {
                  return (
                    <div
                      key="lanthanide-slot"
                      className="h-14 sm:h-16 rounded-lg border border-pink-700/50 bg-pink-950/20 text-pink-300 flex flex-col items-center justify-center text-center p-1 text-[9px] font-mono cursor-default"
                      title="Lanthanide Series (57-71)"
                    >
                      <span className="text-[8px] uppercase">57-71</span>
                      <span className="font-bold text-[10px]">La-Lu</span>
                    </div>
                  );
                }
                if (pIdx === 6 && gIdx === 2) {
                  return (
                    <div
                      key="actinide-slot"
                      className="h-14 sm:h-16 rounded-lg border border-orange-700/50 bg-orange-950/20 text-orange-300 flex flex-col items-center justify-center text-center p-1 text-[9px] font-mono cursor-default"
                      title="Actinide Series (89-103)"
                    >
                      <span className="text-[8px] uppercase">89-103</span>
                      <span className="font-bold text-[10px]">Ac-Lr</span>
                    </div>
                  );
                }

                if (!cell) {
                  return <div key={`empty-${pIdx}-${gIdx}`} className="h-14 sm:h-16" />;
                }

                return renderElementButton(cell);
              })}
            </div>
          ))}
        </div>

        {/* Lanthanide & Actinide Sub-Rows */}
        <div className="pt-2 border-t border-[#1a293b] space-y-1">
          {/* Lanthanides */}
          <div className="flex items-center gap-2">
            <span className="w-16 text-[10px] font-mono text-pink-400 font-bold uppercase tracking-wider shrink-0 text-right">
              Lanthanide:
            </span>
            <div className="grid grid-cols-15 gap-1 flex-1">
              {lanthanides.map((el) => renderElementButton(el))}
            </div>
          </div>

          {/* Actinides */}
          <div className="flex items-center gap-2">
            <span className="w-16 text-[10px] font-mono text-orange-400 font-bold uppercase tracking-wider shrink-0 text-right">
              Actinide:
            </span>
            <div className="grid grid-cols-15 gap-1 flex-1">
              {actinides.map((el) => renderElementButton(el))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Dense Grid View
  const renderDenseGrid = () => {
    return (
      <div className="p-3 sm:p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8 gap-2">
        {filteredElements.map((el) => renderElementButton(el))}
      </div>
    );
  };

  const previewTarget = hoveredElement || activeElement;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        ref={containerRef}
        className="bg-[#091017] border border-[#1b2d42] rounded-2xl w-full max-w-7xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Top Header */}
        <div className="p-3.5 sm:px-6 border-b border-[#142230] flex items-center justify-between bg-[#0b141e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                Periodic Table & Element Inspector
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                  All 118 Elements
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300">
                  <CheckCircle2 className="w-3 h-3" /> IUPAC Verified
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Interactive materials science database with verified atomic masses, electron configurations, and thermodynamic data.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="hidden md:flex items-center p-0.5 bg-[#060b10] border border-slate-800 rounded-lg text-xs">
              <button
                onClick={() => setLayoutMode('table')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
                  layoutMode === 'table'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="18-Column Periodic Table Layout"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>18-Col Table</span>
              </button>
              <button
                onClick={() => setLayoutMode('grid')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
                  layoutMode === 'grid'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Dense Filtered Grid"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Card Grid</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-3 sm:px-5 border-b border-[#142230] bg-[#0d1622] flex flex-col gap-2.5">
          {/* Row 1: Search and Primary Category Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search symbol, name, or # (e.g. Ti, Titanium, 22)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#070d14] border border-[#1e3046] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-500 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category selection */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-mono no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-md border whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-sm'
                      : 'bg-[#0a121c] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Secondary Scientific Filters (Block, Phase, Period) & Active Count */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs pt-1 border-t border-[#152332]">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Block filter */}
              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                <span className="text-slate-500">Block:</span>
                {(['all', 's', 'p', 'd', 'f'] as BlockType[]).map((blk) => (
                  <button
                    key={blk}
                    onClick={() => setSelectedBlock(blk)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition cursor-pointer ${
                      selectedBlock === blk
                        ? 'bg-cyan-950 border border-cyan-500 text-cyan-300'
                        : 'bg-[#09111b] border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {blk}
                  </button>
                ))}
              </div>

              {/* Phase filter */}
              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                <span className="text-slate-500">State @ STP:</span>
                {(['all', 'solid', 'liquid', 'gas'] as PhaseType[]).map((ph) => (
                  <button
                    key={ph}
                    onClick={() => setSelectedPhase(ph)}
                    className={`px-2 py-0.5 rounded text-[10px] capitalize transition cursor-pointer ${
                      selectedPhase === ph
                        ? 'bg-cyan-950 border border-cyan-500 text-cyan-300'
                        : 'bg-[#09111b] border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {ph}
                  </button>
                ))}
              </div>

              {/* Period filter */}
              <div className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-slate-400">
                <span className="text-slate-500">Period:</span>
                {(['all', 1, 2, 3, 4, 5, 6, 7] as (number | 'all')[]).map((prd) => (
                  <button
                    key={String(prd)}
                    onClick={() => setSelectedPeriod(prd)}
                    className={`px-1.5 py-0.5 rounded text-[10px] transition cursor-pointer ${
                      selectedPeriod === prd
                        ? 'bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-[#09111b] border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {prd}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter result status & Quick hover preview */}
            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
              <span>
                Matching:{' '}
                <strong className="text-cyan-400">{filteredElements.length}</strong> / 118
              </span>
              {hoveredElement && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-700/50 text-cyan-300">
                  <strong>{hoveredElement.symbol}</strong> ({hoveredElement.name}) — Z={hoveredElement.number}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content: Main Body (Table/Grid on Left + Rich Inspector on Right) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Main Visualizer (Cols 8) */}
          <div className="lg:col-span-8 overflow-auto max-h-[55vh] lg:max-h-[66vh] bg-[#070d14]">
            {filteredElements.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
                <p>No elements match the current search or filters.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedBlock('all');
                    setSelectedPhase('all');
                    setSelectedPeriod('all');
                  }}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs cursor-pointer hover:bg-cyan-400 transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : layoutMode === 'table' ? (
              renderPeriodicTableGrid()
            ) : (
              renderDenseGrid()
            )}
          </div>

          {/* Right Panel: High-Fidelity Scientific Element Inspector (Cols 4) */}
          <div className="lg:col-span-4 p-4 sm:p-5 bg-[#0a121a] border-t lg:border-t-0 lg:border-l border-[#142230] overflow-y-auto max-h-[55vh] lg:max-h-[66vh] space-y-4">
            {/* Top Profile Card */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 text-slate-950 font-black text-2xl flex flex-col items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
                  <span>{activeElement.symbol}</span>
                  <span className="text-[9px] font-mono font-medium -mt-1">{activeElement.number}</span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    {activeElement.name}
                    <button
                      onClick={() => copySymbol(activeElement.symbol)}
                      className="text-slate-400 hover:text-cyan-400 transition cursor-pointer"
                      title="Copy symbol"
                    >
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border capitalize ${getCategoryBadgeClass(
                        activeElement.category
                      )}`}
                    >
                      {activeElement.category.replace('-', ' ')}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                      {activeElement.block}-block
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right font-mono text-[10px] text-slate-400 space-y-0.5">
                <div>Group {activeElement.group}</div>
                <div>Period {activeElement.period}</div>
                <div className="capitalize text-cyan-400 font-semibold">{activeElement.phase}</div>
              </div>
            </div>

            {/* Scientific Summary */}
            <p className="text-xs text-slate-300 leading-relaxed bg-[#0d1722] p-3 rounded-xl border border-[#18283a]">
              {activeElement.summary}
            </p>

            {/* Subatomic Particle Count */}
            <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-xs">
              <div className="p-2 rounded-lg bg-[#0e1724] border border-[#18283a]">
                <div className="text-[9px] text-slate-500 uppercase">Protons (Z)</div>
                <div className="font-bold text-white mt-0.5">{activeElement.protons ?? activeElement.number}</div>
              </div>
              <div className="p-2 rounded-lg bg-[#0e1724] border border-[#18283a]">
                <div className="text-[9px] text-slate-500 uppercase">Neutrons (N)</div>
                <div className="font-bold text-white mt-0.5">
                  {activeElement.neutrons ?? Math.round(activeElement.atomicMass) - activeElement.number}
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#0e1724] border border-[#18283a]">
                <div className="text-[9px] text-slate-500 uppercase">Electrons</div>
                <div className="font-bold text-white mt-0.5">{activeElement.electrons ?? activeElement.number}</div>
              </div>
              <div className="p-2 rounded-lg bg-[#0e1724] border border-[#18283a]">
                <div className="text-[9px] text-slate-500 uppercase">Valence e⁻</div>
                <div className="font-bold text-cyan-300 mt-0.5">
                  {activeElement.valenceElectrons ?? '—'}
                </div>
              </div>
            </div>

            {/* Shell Distribution */}
            {activeElement.shells && activeElement.shells.length > 0 && (
              <div className="p-2.5 rounded-lg bg-[#0e1724] border border-[#18283a] text-xs font-mono">
                <div className="text-[10px] text-slate-500 uppercase mb-1">
                  Electron Shells (K, L, M, N, O, P, Q)
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {activeElement.shells.map((count, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 font-bold text-[11px]"
                    >
                      {count}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Primary Physical & Chemical Properties */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#0e1724] border border-[#18283a]">
                <div className="text-[10px] text-slate-500 uppercase">Standard Mass</div>
                <div className="font-semibold text-white mt-0.5">
                  {typeof activeElement.atomicMass === 'number'
                    ? `${activeElement.atomicMass.toFixed(3)} u`
                    : `${activeElement.atomicMass} u`}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0e1724] border border-[#18283a]">
                <div className="text-[10px] text-slate-500 uppercase">Electron Config</div>
                <div className="font-semibold text-cyan-300 mt-0.5 truncate" title={activeElement.electronConfig}>
                  {activeElement.electronConfig}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0e1724] border border-[#18283a]">
                <div className="text-[10px] text-slate-500 uppercase">Electronegativity</div>
                <div className="font-semibold text-white mt-0.5">
                  {activeElement.electronegativity ? `${activeElement.electronegativity} (Pauling)` : 'N/A'}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0e1724] border border-[#18283a]">
                <div className="text-[10px] text-slate-500 uppercase">1st Ionization</div>
                <div className="font-semibold text-emerald-300 mt-0.5">
                  {activeElement.ionizationEnergy ? `${activeElement.ionizationEnergy} kJ/mol` : 'N/A'}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0e1724] border border-[#18283a]">
                <div className="text-[10px] text-slate-500 uppercase">Crystal Structure</div>
                <div className="font-semibold text-teal-300 mt-0.5 truncate">
                  {activeElement.crystalStructure || 'N/A'}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0e1724] border border-[#18283a]">
                <div className="text-[10px] text-slate-500 uppercase">Atomic Radius</div>
                <div className="font-semibold text-sky-300 mt-0.5">
                  {activeElement.atomicRadius ? `${activeElement.atomicRadius} pm` : 'N/A'}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0e1724] border border-[#18283a]">
                <div className="text-[10px] text-slate-500 uppercase">Melting Point</div>
                <div className="font-semibold text-amber-300 mt-0.5">
                  {activeElement.meltPoint
                    ? `${activeElement.meltPoint} K (${(activeElement.meltPoint - 273.15).toFixed(1)} °C)`
                    : 'N/A'}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0e1724] border border-[#18283a]">
                <div className="text-[10px] text-slate-500 uppercase">Boiling Point</div>
                <div className="font-semibold text-orange-300 mt-0.5">
                  {activeElement.boilPoint
                    ? `${activeElement.boilPoint} K (${(activeElement.boilPoint - 273.15).toFixed(1)} °C)`
                    : 'N/A'}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0e1724] border border-[#18283a]">
                <div className="text-[10px] text-slate-500 uppercase">Density @ STP</div>
                <div className="font-semibold text-purple-300 mt-0.5">
                  {activeElement.density ? `${activeElement.density} g/cm³` : 'N/A'}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0e1724] border border-[#18283a]">
                <div className="text-[10px] text-slate-500 uppercase">Oxidation States</div>
                <div className="font-semibold text-indigo-300 mt-0.5 truncate" title={activeElement.oxidationStates}>
                  {activeElement.oxidationStates || 'N/A'}
                </div>
              </div>
            </div>

            {/* Key Engineering Applications */}
            {activeElement.applications && activeElement.applications.length > 0 && (
              <div className="p-3 rounded-xl bg-[#0e1724] border border-[#18283a] space-y-1.5">
                <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Engineering & Industrial Applications
                </div>
                <ul className="space-y-1 text-xs text-slate-300">
                  {activeElement.applications.map((app, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-[11px] leading-snug">
                      <span className="text-cyan-500 mt-1">•</span>
                      <span>{app}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Safety & Hazards */}
            {activeElement.safety?.hazards && activeElement.safety.hazards.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-1 text-xs">
                <div className="text-[10px] font-mono text-amber-400 uppercase font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Safety & Hazard Notes
                </div>
                <div className="text-amber-200/90 text-[11px] space-y-0.5">
                  {activeElement.safety.hazards.map((haz, idx) => (
                    <p key={idx}>• {haz}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Discovery & Historical Info */}
            {activeElement.discovery && (
              <div className="text-[11px] font-mono text-slate-400 p-2.5 rounded-lg bg-[#0a111a] border border-[#152332] flex items-center justify-between">
                <div>
                  <span className="text-slate-500">Discovered: </span>
                  <span className="text-slate-200 font-semibold">{activeElement.discovery.year}</span>
                  {activeElement.discovery.country && ` (${activeElement.discovery.country})`}
                </div>
                {activeElement.discovery.discoverer && (
                  <div className="truncate max-w-[140px] text-slate-300" title={activeElement.discovery.discoverer}>
                    {activeElement.discovery.discoverer}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              {onSelectForCalculation && (
                <button
                  onClick={() => {
                    onSelectForCalculation(activeElement);
                    onClose();
                  }}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs py-2.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20"
                >
                  <Plus className="w-4 h-4" />
                  Add {activeElement.symbol} to Molar Mass Formula
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
