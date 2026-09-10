// Property Ranking and Leaderboard Component
import React, { useState } from 'react';
import { MaterialModel } from '../../engines/materials/materialModel';
import {
  MaterialPropertyKey,
  PROPERTY_DEFINITIONS,
  rankMaterialsByProperty,
  calculateAshbyMetrics,
} from '../../engines/materials/propertyModel';
import { ArrowUpDown, Award, Flame, Zap, Shield, Sparkles } from 'lucide-react';

interface MaterialRankingViewProps {
  materials: MaterialModel[];
  onSelectMaterial: (material: MaterialModel) => void;
  onToggleCompare?: (material: MaterialModel) => void;
  selectedIds?: Set<string>;
}

export const MaterialRankingView: React.FC<MaterialRankingViewProps> = ({
  materials,
  onSelectMaterial,
  onToggleCompare,
  selectedIds = new Set(),
}) => {
  const [activeProperty, setActiveProperty] = useState<MaterialPropertyKey | 'specificStrength' | 'specificModulus'>('yieldStrength');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

  // Compute rankings
  let rankedList: Array<{ material: MaterialModel; value: number; formatted: string; rank: number }>;

  if (activeProperty === 'specificStrength') {
    const sorted = [...materials].sort((a, b) => {
      const aVal = calculateAshbyMetrics(a).specificStrength;
      const bVal = calculateAshbyMetrics(b).specificStrength;
      return sortDirection === 'desc' ? bVal - aVal : aVal - bVal;
    });
    rankedList = sorted.map((m, idx) => ({
      material: m,
      value: calculateAshbyMetrics(m).specificStrength,
      formatted: `${calculateAshbyMetrics(m).specificStrength} kN·m/kg`,
      rank: idx + 1,
    }));
  } else if (activeProperty === 'specificModulus') {
    const sorted = [...materials].sort((a, b) => {
      const aVal = calculateAshbyMetrics(a).specificModulus;
      const bVal = calculateAshbyMetrics(b).specificModulus;
      return sortDirection === 'desc' ? bVal - aVal : aVal - bVal;
    });
    rankedList = sorted.map((m, idx) => ({
      material: m,
      value: calculateAshbyMetrics(m).specificModulus,
      formatted: `${calculateAshbyMetrics(m).specificModulus} MN·m/kg`,
      rank: idx + 1,
    }));
  } else {
    rankedList = rankMaterialsByProperty(materials, activeProperty as MaterialPropertyKey, sortDirection);
  }

  const maxValue = Math.max(...rankedList.map((item) => item.value), 0.001);

  return (
    <div className="flex flex-col space-y-3 select-none">
      {/* Property Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#0b1420] border border-[#18283a]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Rank By Property:</span>
          <select
            value={activeProperty}
            onChange={(e) => setActiveProperty(e.target.value as any)}
            className="bg-[#070d14] border border-[#1e3046] text-amber-300 font-mono text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
          >
            <optgroup label="Mechanical Properties">
              <option value="yieldStrength">Yield Strength (σy)</option>
              <option value="tensileStrength">Tensile Strength (UTS)</option>
              <option value="elasticModulus">Young's Modulus (E)</option>
              <option value="hardness">Hardness (HV / Scale)</option>
              <option value="poissonRatio">Poisson's Ratio (ν)</option>
            </optgroup>
            <optgroup label="Ashby Selection Indices">
              <option value="specificStrength">Specific Strength (σy / ρ)</option>
              <option value="specificModulus">Specific Modulus (E / ρ)</option>
            </optgroup>
            <optgroup label="Thermal & Physical">
              <option value="density">Mass Density (ρ)</option>
              <option value="thermalConductivity">Thermal Conductivity (k)</option>
              <option value="meltingPoint">Melting Point (Tm)</option>
            </optgroup>
            <optgroup label="Electrical & Chemical">
              <option value="electricalConductivity">Electrical Conductivity (σ)</option>
              <option value="corrosionResistance">Corrosion Resistance</option>
            </optgroup>
          </select>
        </div>

        <button
          onClick={() => setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#070d14] border border-[#1e3046] text-slate-300 hover:text-white text-xs font-mono transition"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
          <span>{sortDirection === 'desc' ? 'Highest First' : 'Lowest First'}</span>
        </button>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-2 max-h-[58vh] overflow-y-auto pr-1">
        {rankedList.map((item) => {
          const isSelected = selectedIds.has(item.material.id);
          const percentOfMax = Math.max(3, Math.min(100, (item.value / maxValue) * 100));

          return (
            <div
              key={item.material.id}
              className={`p-3 rounded-xl border transition-all text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-amber-950/30 border-amber-500/60 shadow'
                  : 'bg-[#0b1420] border-[#18283a] hover:border-slate-700 hover:bg-[#0e1928]'
              }`}
            >
              {/* Left: Rank & Info */}
              <div className="flex items-center gap-3 min-w-0">
                {/* Rank Badge */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                    item.rank === 1
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                      : item.rank === 2
                      ? 'bg-slate-300 text-slate-950'
                      : item.rank === 3
                      ? 'bg-amber-800 text-amber-100'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {item.rank}
                </div>

                <div className="min-w-0 cursor-pointer" onClick={() => onSelectMaterial(item.material)}>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="truncate hover:text-amber-300 transition">{item.material.name}</span>
                    <span className="text-[10px] font-mono text-slate-400 capitalize px-1.5 py-0.2 rounded bg-slate-800/80 border border-slate-700/60">
                      {item.material.category}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 truncate">
                    {item.material.designation}
                  </div>
                </div>
              </div>

              {/* Right: Bar & Metric Value */}
              <div className="flex items-center gap-3 sm:w-64 shrink-0">
                <div className="flex-1 bg-[#060c13] rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-500 to-cyan-400"
                    style={{ width: `${percentOfMax}%` }}
                  />
                </div>
                <span className="font-mono font-bold text-xs text-white shrink-0 w-24 text-right">
                  {item.formatted}
                </span>

                {onToggleCompare && (
                  <button
                    onClick={() => onToggleCompare(item.material)}
                    className={`px-2 py-1 rounded text-[10px] font-mono border transition ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                        : 'bg-[#070d14] border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {isSelected ? 'In Comp' : '+ Comp'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
