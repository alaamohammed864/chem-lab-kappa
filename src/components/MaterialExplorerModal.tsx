import React, { useState, useEffect, useMemo } from 'react';
import { MASTER_MATERIALS_DATA } from '../engines/materials/materialsData';
import { MaterialModel, MaterialCategory } from '../engines/materials/materialModel';
import {
  PROPERTY_DEFINITIONS,
  calculateAshbyMetrics,
  CORROSION_SCORE_MAP,
} from '../engines/materials/propertyModel';
import { MaterialsStorageService } from '../services/materialsStorage';
import { MaterialItem } from '../types';
import { MaterialDetailView } from './materials/MaterialDetailView';
import { MaterialComparisonView } from './materials/MaterialComparisonView';
import { MaterialRankingView } from './materials/MaterialRankingView';
import { MaterialAshbyPlot } from './materials/MaterialAshbyPlot';
import {
  Boxes,
  X,
  Search,
  SlidersHorizontal,
  Star,
  Clock,
  Scale,
  ListOrdered,
  BarChart2,
  Grid,
  Shield,
  Zap,
  Flame,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Maximize2,
} from 'lucide-react';

interface MaterialExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMaterial?: (material: MaterialItem) => void;
}

type MainViewMode = 'explorer' | 'comparison' | 'rankings' | 'ashby';

export const MaterialExplorerModal: React.FC<MaterialExplorerModalProps> = ({
  isOpen,
  onClose,
  onSelectMaterial,
}) => {
  const [activeView, setActiveView] = useState<MainViewMode>('explorer');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showOnlyRecents, setShowOnlyRecents] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Property Filters
  const [minYieldStrength, setMinYieldStrength] = useState<number>(0);
  const [maxDensity, setMaxDensity] = useState<number>(20);
  const [minElasticModulus, setMinElasticModulus] = useState<number>(0);
  const [minCorrosionLevel, setMinCorrosionLevel] = useState<string>('all');

  // Favorites & Recents state synced with MaterialsStorageService
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => MaterialsStorageService.getFavorites());
  const [recentIds, setRecentIds] = useState<string[]>(() => MaterialsStorageService.getRecents());

  // Active Material for Details
  const [activeMaterial, setActiveMaterial] = useState<MaterialModel>(MASTER_MATERIALS_DATA[0]);

  // Comparison pool
  const [comparisonIds, setComparisonIds] = useState<string[]>(['ti-6al-4v', 'ss-316l', 'sic-alpha']);

  // Sync with storage service
  useEffect(() => {
    const unsubscribe = MaterialsStorageService.subscribe(() => {
      setFavoriteIds(MaterialsStorageService.getFavorites());
      setRecentIds(MaterialsStorageService.getRecents());
    });
    return unsubscribe;
  }, []);

  // When active material changes, track as recent
  const handleSelectActiveMaterial = (mat: MaterialModel) => {
    setActiveMaterial(mat);
    MaterialsStorageService.recordRecent(mat.id);
    if (onSelectMaterial) {
      onSelectMaterial(mat as unknown as MaterialItem);
    }
  };

  const toggleFavorite = (id: string) => {
    MaterialsStorageService.toggleFavorite(id);
  };

  const toggleComparison = (mat: MaterialModel) => {
    setComparisonIds((prev) =>
      prev.includes(mat.id) ? prev.filter((item) => item !== mat.id) : [...prev, mat.id]
    );
  };

  const clearComparison = () => {
    setComparisonIds([]);
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: MASTER_MATERIALS_DATA.length };
    MASTER_MATERIALS_DATA.forEach((m) => {
      counts[m.category] = (counts[m.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return MASTER_MATERIALS_DATA.filter((mat) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        mat.name.toLowerCase().includes(q) ||
        mat.designation.toLowerCase().includes(q) ||
        (mat.formula && mat.formula.toLowerCase().includes(q)) ||
        (mat.subCategory && mat.subCategory.toLowerCase().includes(q)) ||
        mat.applications.some((app) => app.toLowerCase().includes(q));

      // Category
      const matchesCat = selectedCategory === 'all' || mat.category === selectedCategory;

      // Favorites / Recents
      const matchesFav = !showOnlyFavorites || favoriteIds.includes(mat.id);
      const matchesRecent = !showOnlyRecents || recentIds.includes(mat.id);

      // Property filters
      const matchesYield = mat.yieldStrength >= minYieldStrength;
      const matchesDensity = mat.density <= maxDensity;
      const matchesModulus = mat.elasticModulus >= minElasticModulus;
      const matchesCorrosion =
        minCorrosionLevel === 'all' ||
        (CORROSION_SCORE_MAP[mat.corrosionResistance] || 0) >= (CORROSION_SCORE_MAP[minCorrosionLevel as any] || 0);

      return (
        matchesSearch &&
        matchesCat &&
        matchesFav &&
        matchesRecent &&
        matchesYield &&
        matchesDensity &&
        matchesModulus &&
        matchesCorrosion
      );
    });
  }, [
    searchQuery,
    selectedCategory,
    showOnlyFavorites,
    showOnlyRecents,
    minYieldStrength,
    maxDensity,
    minElasticModulus,
    minCorrosionLevel,
    favoriteIds,
    recentIds,
  ]);

  const selectedComparisonMaterials = useMemo(() => {
    return MASTER_MATERIALS_DATA.filter((m) => comparisonIds.includes(m.id));
  }, [comparisonIds]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setShowOnlyFavorites(false);
    setShowOnlyRecents(false);
    setMinYieldStrength(0);
    setMaxDensity(20);
    setMinElasticModulus(0);
    setMinCorrosionLevel('all');
  };

  if (!isOpen) return null;

  const CATEGORIES_LIST: Array<{ id: string; label: string; count?: number }> = [
    { id: 'all', label: 'All Classes', count: categoryCounts['all'] },
    { id: 'metals', label: 'Metals', count: categoryCounts['metals'] },
    { id: 'alloys', label: 'Alloys', count: categoryCounts['alloys'] },
    { id: 'ceramics', label: 'Ceramics', count: categoryCounts['ceramics'] },
    { id: 'polymers', label: 'Polymers', count: categoryCounts['polymers'] },
    { id: 'composites', label: 'Composites', count: categoryCounts['composites'] },
    { id: 'semiconductors', label: 'Semiconductors', count: categoryCounts['semiconductors'] },
    { id: 'advanced materials', label: 'Advanced', count: categoryCounts['advanced materials'] },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#091017] border border-[#1b2d42] rounded-2xl w-full max-w-7xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Top Header Bar */}
        <div className="p-4 sm:px-6 border-b border-[#142230] flex items-center justify-between bg-[#0b141e] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-950/40">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Materials Science Platform
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300 font-semibold">
                  {MASTER_MATERIALS_DATA.length} Verified Models
                </span>
                <span className="hidden sm:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Demo Dataset
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
                Mechanical, thermal, electrical properties, Ashby selection indices, and multi-material comparative analytics
              </p>
            </div>
          </div>

          {/* View Switcher Tabs & Close Button */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center bg-[#070d14] p-1 rounded-xl border border-[#1a2b3d] text-xs font-mono">
              <button
                onClick={() => setActiveView('explorer')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                  activeView === 'explorer'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Explorer</span>
              </button>

              <button
                onClick={() => setActiveView('comparison')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                  activeView === 'comparison'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Comparison ({comparisonIds.length})</span>
              </button>

              <button
                onClick={() => setActiveView('rankings')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                  activeView === 'rankings'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Rankings</span>
              </button>

              <button
                onClick={() => setActiveView('ashby')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                  activeView === 'ashby'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Ashby Plot</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile View Switcher (Visible on small screens) */}
        <div className="flex md:hidden items-center justify-around bg-[#070d14] p-1.5 border-b border-[#142230] text-xs font-mono">
          <button
            onClick={() => setActiveView('explorer')}
            className={`px-2 py-1 rounded ${activeView === 'explorer' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
          >
            Explorer
          </button>
          <button
            onClick={() => setActiveView('comparison')}
            className={`px-2 py-1 rounded ${activeView === 'comparison' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
          >
            Compare ({comparisonIds.length})
          </button>
          <button
            onClick={() => setActiveView('rankings')}
            className={`px-2 py-1 rounded ${activeView === 'rankings' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
          >
            Rankings
          </button>
          <button
            onClick={() => setActiveView('ashby')}
            className={`px-2 py-1 rounded ${activeView === 'ashby' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
          >
            Ashby
          </button>
        </div>

        {/* Search, Categories & Filter Bar (Only in Explorer mode) */}
        {activeView === 'explorer' && (
          <div className="p-3 sm:px-6 border-b border-[#142230] bg-[#0d1622] space-y-2.5 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              {/* Search input */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search alloy, polymer, ceramic, formula..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#070d14] border border-[#1e3046] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-slate-500 hover:text-white"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Favorites, Recents & Property Filters Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowOnlyFavorites(!showOnlyFavorites);
                    setShowOnlyRecents(false);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition ${
                    showOnlyFavorites
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                      : 'bg-[#070d14] border-[#1e3046] text-slate-300 hover:text-white'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-slate-950' : 'text-amber-400'}`} />
                  <span>Favorites ({favoriteIds.length})</span>
                </button>

                <button
                  onClick={() => {
                    setShowOnlyRecents(!showOnlyRecents);
                    setShowOnlyFavorites(false);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition ${
                    showOnlyRecents
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                      : 'bg-[#070d14] border-[#1e3046] text-slate-300 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Recent ({recentIds.length})</span>
                </button>

                <button
                  onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition ${
                    isFilterPanelOpen
                      ? 'bg-slate-800 text-white border-slate-600 font-bold'
                      : 'bg-[#070d14] border-[#1e3046] text-slate-400 hover:text-white'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                  <span>Filters</span>
                </button>

                {(searchQuery || selectedCategory !== 'all' || showOnlyFavorites || showOnlyRecents || minYieldStrength > 0 || maxDensity < 20) && (
                  <button
                    onClick={resetAllFilters}
                    className="p-1.5 rounded-lg bg-[#070d14] border border-[#1e3046] text-slate-400 hover:text-amber-400 transition"
                    title="Reset all filters"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono scrollbar-none">
              {CATEGORIES_LIST.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setShowOnlyFavorites(false);
                    setShowOnlyRecents(false);
                  }}
                  className={`px-2.5 py-1 rounded-md border whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === cat.id && !showOnlyFavorites && !showOnlyRecents
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                      : 'bg-[#070d14] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span>{cat.label}</span>
                  {cat.count !== undefined && (
                    <span className={`text-[9px] px-1 py-0.2 rounded ${
                      selectedCategory === cat.id && !showOnlyFavorites && !showOnlyRecents
                        ? 'bg-slate-950/20 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {cat.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Expandable Property Sliders Panel */}
            {isFilterPanelOpen && (
              <div className="p-3 bg-[#070d14] rounded-xl border border-[#1e3046] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono animate-fade-in">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Min Yield Strength (σy):</span>
                    <span className="text-amber-300 font-bold">{minYieldStrength} MPa</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={2000}
                    step={50}
                    value={minYieldStrength}
                    onChange={(e) => setMinYieldStrength(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Max Density (ρ):</span>
                    <span className="text-cyan-300 font-bold">{maxDensity} g/cm³</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={0.5}
                    value={maxDensity}
                    onChange={(e) => setMaxDensity(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Min Young's Modulus (E):</span>
                    <span className="text-emerald-300 font-bold">{minElasticModulus} GPa</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={500}
                    step={20}
                    value={minElasticModulus}
                    onChange={(e) => setMinElasticModulus(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Min Corrosion Resistance:</span>
                  </div>
                  <select
                    value={minCorrosionLevel}
                    onChange={(e) => setMinCorrosionLevel(e.target.value)}
                    className="w-full bg-[#0a121c] border border-[#1e3046] rounded p-1.5 text-xs text-white"
                  >
                    <option value="all">Any Rating</option>
                    <option value="Moderate">Moderate & Above</option>
                    <option value="High">High & Above</option>
                    <option value="Very High">Very High & Above</option>
                    <option value="Excellent">Excellent Only</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Primary Viewport Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#070d14]">
          {/* 1. EXPLORER VIEW (List + Detail Pane) */}
          {activeView === 'explorer' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[550px]">
              {/* Left Column: Materials Cards List (5 cols) */}
              <div className="lg:col-span-5 space-y-2.5 max-h-[64vh] overflow-y-auto pr-1.5">
                <div className="text-[11px] font-mono text-slate-500 flex justify-between px-1">
                  <span>Showing {filteredMaterials.length} materials</span>
                  {filteredMaterials.length === 0 && (
                    <span className="text-amber-400">No match. Click reset filters.</span>
                  )}
                </div>

                {filteredMaterials.map((mat) => {
                  const isSelected = activeMaterial.id === mat.id;
                  const isFav = favoriteIds.includes(mat.id);
                  const isComp = comparisonIds.includes(mat.id);
                  const ashby = calculateAshbyMetrics(mat);

                  return (
                    <div
                      key={mat.id}
                      onClick={() => handleSelectActiveMaterial(mat)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-amber-950/40 border-amber-500/80 shadow-lg shadow-amber-500/10'
                          : 'bg-[#0d1622] border-[#18283a] hover:border-slate-700 hover:bg-[#101b2a]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
                            <span className="truncate">{mat.name}</span>
                            <span className="text-[10px] font-mono capitalize px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-800/60 text-amber-400 shrink-0">
                              {mat.category}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
                            {mat.designation}
                          </div>
                        </div>

                        {/* Card Top Action Icons */}
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => toggleFavorite(mat.id)}
                            className={`p-1 rounded transition ${
                              isFav ? 'text-amber-400' : 'text-slate-600 hover:text-slate-300'
                            }`}
                            title="Favorite"
                          >
                            <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                          </button>
                          <button
                            onClick={() => toggleComparison(mat)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition ${
                              isComp
                                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                                : 'bg-[#070d14] border-slate-700 text-slate-400 hover:text-white'
                            }`}
                            title="Add to comparison"
                          >
                            {isComp ? '✓ Comp' : '+ Comp'}
                          </button>
                        </div>
                      </div>

                      {/* Specs Summary Row */}
                      <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-400">
                        <div>
                          <span className="text-slate-500 block text-[9px]">DENSITY</span>
                          <strong className="text-white">{mat.density} g/cm³</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px]">YIELD (σy)</span>
                          <strong className="text-emerald-300">{mat.yieldStrength} MPa</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px]">MODULUS (E)</span>
                          <strong className="text-cyan-300">{mat.elasticModulus} GPa</strong>
                        </div>
                      </div>

                      {/* Ashby Badge */}
                      <div className="flex items-center justify-between mt-2 text-[9px] font-mono text-slate-500">
                        <span>Specific Strength: <strong className="text-amber-300">{ashby.specificStrength} kN·m/kg</strong></span>
                        <span className="text-slate-400">{mat.corrosionResistance}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Active Material Detailed Spec Inspector (7 cols) */}
              <div className="lg:col-span-7 bg-[#0a121a] rounded-2xl border border-[#18283a] p-5 max-h-[64vh] overflow-y-auto">
                <MaterialDetailView
                  material={activeMaterial}
                  isFavorite={favoriteIds.includes(activeMaterial.id)}
                  isInComparison={comparisonIds.includes(activeMaterial.id)}
                  onToggleFavorite={toggleFavorite}
                  onToggleComparison={toggleComparison}
                  onOpenComparison={() => setActiveView('comparison')}
                />
              </div>
            </div>
          )}

          {/* 2. COMPARISON VIEW */}
          {activeView === 'comparison' && (
            <MaterialComparisonView
              selectedMaterials={selectedComparisonMaterials}
              allMaterials={MASTER_MATERIALS_DATA}
              onRemoveMaterial={(id) => setComparisonIds((prev) => prev.filter((item) => item !== id))}
              onAddMaterial={(m) => setComparisonIds((prev) => [...prev, m.id])}
              onClearAll={clearComparison}
              onSelectMaterialDetail={(m) => {
                setActiveMaterial(m);
                setActiveView('explorer');
              }}
            />
          )}

          {/* 3. RANKINGS VIEW */}
          {activeView === 'rankings' && (
            <MaterialRankingView
              materials={MASTER_MATERIALS_DATA}
              onSelectMaterial={(m) => {
                setActiveMaterial(m);
                setActiveView('explorer');
              }}
              onToggleCompare={toggleComparison}
              selectedIds={new Set(comparisonIds)}
            />
          )}

          {/* 4. ASHBY PLOT VIEW */}
          {activeView === 'ashby' && (
            <MaterialAshbyPlot
              allMaterials={MASTER_MATERIALS_DATA}
              selectedMaterials={selectedComparisonMaterials}
              onSelectMaterial={(m) => {
                setActiveMaterial(m);
                setActiveView('explorer');
              }}
            />
          )}
        </div>

        {/* Persistent Floating Comparison Bar (when items are selected and in explorer mode) */}
        {activeView === 'explorer' && comparisonIds.length > 0 && (
          <div className="p-3 border-t border-[#142230] bg-[#0c1624] flex items-center justify-between shrink-0 animate-slide-up">
            <div className="flex items-center gap-2 overflow-x-auto text-xs font-mono">
              <span className="text-slate-400 font-bold flex items-center gap-1.5 shrink-0">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span>Comparison Tray:</span>
              </span>
              {selectedComparisonMaterials.map((m) => (
                <span
                  key={m.id}
                  className="px-2 py-0.5 rounded bg-[#070d14] border border-[#1e3046] text-white flex items-center gap-1.5 text-[11px] shrink-0"
                >
                  <span className="truncate max-w-[120px]">{m.name}</span>
                  <button
                    onClick={() => toggleComparison(m)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-3">
              <button
                onClick={() => setActiveView('comparison')}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono transition shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Compare ({comparisonIds.length})</span>
              </button>
              <button
                onClick={clearComparison}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 text-xs font-mono"
                title="Clear tray"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
