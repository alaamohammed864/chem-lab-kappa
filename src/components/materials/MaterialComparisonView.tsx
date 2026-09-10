// Multi-Material Comparison Suite
import React, { useState } from 'react';
import { MaterialModel } from '../../engines/materials/materialModel';
import {
  PROPERTY_DEFINITIONS,
  MaterialPropertyKey,
  calculateAshbyMetrics,
} from '../../engines/materials/propertyModel';
import { MaterialRadarChart } from './MaterialRadarChart';
import { MaterialAshbyPlot } from './MaterialAshbyPlot';
import { MaterialRankingView } from './MaterialRankingView';
import {
  Scale,
  Table as TableIcon,
  Activity,
  BarChart2,
  ListOrdered,
  Download,
  Trash2,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface MaterialComparisonViewProps {
  selectedMaterials: MaterialModel[];
  allMaterials: MaterialModel[];
  onRemoveMaterial: (id: string) => void;
  onAddMaterial: (material: MaterialModel) => void;
  onClearAll: () => void;
  onSelectMaterialDetail: (material: MaterialModel) => void;
}

type ComparisonTab = 'table' | 'radar' | 'ashby' | 'bars' | 'ranking';

export const MaterialComparisonView: React.FC<MaterialComparisonViewProps> = ({
  selectedMaterials,
  allMaterials,
  onRemoveMaterial,
  onAddMaterial,
  onClearAll,
  onSelectMaterialDetail,
}) => {
  const [activeTab, setActiveTab] = useState<ComparisonTab>('table');
  const [baselineIndex, setBaselineIndex] = useState(0);
  const [activeBarProperty, setActiveBarProperty] = useState<MaterialPropertyKey>('yieldStrength');

  // Handle empty state
  if (selectedMaterials.length === 0) {
    return (
      <div className="p-8 text-center bg-[#091017] border border-[#1b2d42] rounded-2xl space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
          <Scale className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-white">No Materials Selected for Comparison</h4>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Select 2 or more materials from the explorer or library to compare their mechanical, thermal, electrical, and chemical performance side-by-side.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {allMaterials.slice(0, 4).map((m) => (
            <button
              key={m.id}
              onClick={() => onAddMaterial(m)}
              className="px-2.5 py-1.5 rounded-lg bg-[#0d1723] border border-[#1e3046] text-slate-300 hover:text-white text-xs font-mono transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>{m.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const baselineMaterial = selectedMaterials[Math.min(baselineIndex, selectedMaterials.length - 1)];

  // Export CSV function
  const handleExportCSV = () => {
    const headers = ['Property', 'Unit', ...selectedMaterials.map((m) => `"${m.name} (${m.designation})"`)]
    const rows: string[] = [headers.join(',')];

    Object.values(PROPERTY_DEFINITIONS).forEach((def) => {
      const row = [
        `"${def.name}"`,
        `"${def.unit}"`,
        ...selectedMaterials.map((m) => `"${def.formatValue(m)}"`),
      ];
      rows.push(row.join(','));
    });

    // Ashby rows
    rows.push([
      '"Specific Strength (σ/ρ)"',
      '"kN·m/kg"',
      ...selectedMaterials.map((m) => `"${calculateAshbyMetrics(m).specificStrength}"`),
    ].join(','));
    rows.push([
      '"Specific Modulus (E/ρ)"',
      '"MN·m/kg"',
      ...selectedMaterials.map((m) => `"${calculateAshbyMetrics(m).specificModulus}"`),
    ].join(','));

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `material_comparison_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 select-none">
      {/* Selected Materials Chips & Quick Actions Bar */}
      <div className="p-3.5 rounded-xl bg-[#0b1420] border border-[#1b2d42] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400 font-bold">
            Comparing ({selectedMaterials.length}):
          </span>
          {selectedMaterials.map((mat, idx) => (
            <div
              key={mat.id}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition ${
                idx === baselineIndex
                  ? 'bg-amber-950/60 border-amber-500/80 text-amber-300'
                  : 'bg-[#070d14] border-[#1e3046] text-slate-300'
              }`}
            >
              <button
                onClick={() => setBaselineIndex(idx)}
                title="Set as baseline for percentage comparisons"
                className="hover:underline font-bold"
              >
                {mat.name}
              </button>
              {idx === baselineIndex && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500 text-slate-950 font-black">
                  BASE
                </span>
              )}
              <button
                onClick={() => onRemoveMaterial(mat.id)}
                className="text-slate-500 hover:text-rose-400 transition ml-1"
                title="Remove from comparison"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#070d14] border border-[#1e3046] text-xs font-mono text-slate-300 hover:text-white transition"
            title="Download CSV spec sheet"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onClearAll}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#070d14] border border-[#1e3046] text-xs font-mono text-slate-400 hover:text-rose-400 transition"
            title="Clear all selected materials"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-[#142230] pb-1 overflow-x-auto text-xs font-mono">
        <button
          onClick={() => setActiveTab('table')}
          className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition ${
            activeTab === 'table'
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
              : 'bg-[#070d14] border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <TableIcon className="w-3.5 h-3.5" />
          <span>Spec Table</span>
        </button>

        <button
          onClick={() => setActiveTab('radar')}
          className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition ${
            activeTab === 'radar'
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
              : 'bg-[#070d14] border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Radar Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('ashby')}
          className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition ${
            activeTab === 'ashby'
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
              : 'bg-[#070d14] border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Ashby Selection Plot</span>
        </button>

        <button
          onClick={() => setActiveTab('bars')}
          className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition ${
            activeTab === 'bars'
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
              : 'bg-[#070d14] border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Property Bars</span>
        </button>

        <button
          onClick={() => setActiveTab('ranking')}
          className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition ${
            activeTab === 'ranking'
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
              : 'bg-[#070d14] border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <ListOrdered className="w-3.5 h-3.5" />
          <span>Rankings</span>
        </button>
      </div>

      {/* Tab 1: Comparison Table */}
      {activeTab === 'table' && (
        <div className="overflow-x-auto rounded-xl border border-[#1b2d42] bg-[#091017]">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#0b1420] border-b border-[#1b2d42] text-slate-400">
                <th className="p-3 w-48 font-semibold">Property / Unit</th>
                {selectedMaterials.map((mat, idx) => (
                  <th key={mat.id} className="p-3 min-w-[170px] text-white">
                    <div className="flex items-center justify-between">
                      <span
                        onClick={() => onSelectMaterialDetail(mat)}
                        className="font-bold hover:text-amber-400 cursor-pointer"
                      >
                        {mat.name}
                      </span>
                      {idx === baselineIndex && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500 text-slate-950 font-black">
                          BASE
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal truncate mt-0.5">
                      {mat.designation}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#142230]">
              {/* Category Row */}
              <tr className="bg-[#070d14]/60">
                <td className="p-3 font-semibold text-slate-400">Category</td>
                {selectedMaterials.map((m) => (
                  <td key={m.id} className="p-3 capitalize text-amber-300">
                    {m.category}
                  </td>
                ))}
              </tr>

              {/* 10 Core Properties Rows */}
              {Object.values(PROPERTY_DEFINITIONS).map((def) => {
                const numericValues = selectedMaterials.map((m) => def.getNumericValue(m));
                const bestValue = def.higherIsBetter
                  ? Math.max(...numericValues)
                  : Math.min(...numericValues);
                const baselineVal = def.getNumericValue(baselineMaterial);

                return (
                  <tr key={def.key} className="hover:bg-[#0c1624] transition">
                    <td className="p-3">
                      <div className="font-semibold text-white">{def.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {def.symbol} [{def.unit}]
                      </div>
                    </td>
                    {selectedMaterials.map((mat) => {
                      const val = def.getNumericValue(mat);
                      const isBest = val === bestValue && selectedMaterials.length > 1;
                      const deltaPct =
                        baselineVal !== 0 && mat.id !== baselineMaterial.id
                          ? (((val - baselineVal) / Math.abs(baselineVal)) * 100).toFixed(0)
                          : null;

                      return (
                        <td key={mat.id} className="p-3">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${isBest ? 'text-emerald-400' : 'text-slate-200'}`}>
                              {def.formatValue(mat)}
                            </span>
                            {isBest && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold">
                                BEST
                              </span>
                            )}
                          </div>
                          {deltaPct && (
                            <div
                              className={`text-[10px] font-mono mt-0.5 ${
                                Number(deltaPct) > 0 ? 'text-emerald-400' : 'text-slate-500'
                              }`}
                            >
                              {Number(deltaPct) > 0 ? `+${deltaPct}%` : `${deltaPct}%`} vs base
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Specific Strength (Ashby) */}
              <tr className="bg-[#0b1420]/60 hover:bg-[#0c1624] transition">
                <td className="p-3">
                  <div className="font-semibold text-amber-400">Specific Strength (σy/ρ)</div>
                  <div className="text-[10px] text-slate-500">kN·m/kg [Ashby Index]</div>
                </td>
                {selectedMaterials.map((m) => {
                  const ash = calculateAshbyMetrics(m);
                  return (
                    <td key={m.id} className="p-3 font-bold text-amber-300">
                      {ash.specificStrength} kN·m/kg
                    </td>
                  );
                })}
              </tr>

              {/* Specific Modulus (Ashby) */}
              <tr className="bg-[#0b1420]/60 hover:bg-[#0c1624] transition">
                <td className="p-3">
                  <div className="font-semibold text-cyan-400">Specific Modulus (E/ρ)</div>
                  <div className="text-[10px] text-slate-500">MN·m/kg [Ashby Index]</div>
                </td>
                {selectedMaterials.map((m) => {
                  const ash = calculateAshbyMetrics(m);
                  return (
                    <td key={m.id} className="p-3 font-bold text-cyan-300">
                      {ash.specificModulus} MN·m/kg
                    </td>
                  );
                })}
              </tr>

              {/* Lattice Structure */}
              <tr>
                <td className="p-3 font-semibold text-slate-400">Crystal Lattice</td>
                {selectedMaterials.map((m) => (
                  <td key={m.id} className="p-3 text-[11px] text-slate-300">
                    {m.crystalStructure || 'N/A'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Radar / Spider Comparison */}
      {activeTab === 'radar' && (
        <div className="p-5 rounded-xl bg-[#091017] border border-[#1b2d42] flex flex-col items-center">
          <div className="text-xs text-slate-400 mb-2 text-center max-w-md">
            Multidimensional normalized footprint across Specific Strength, Stiffness, Hardness, Thermal Conduction, Electrical Conduction, and Corrosion Resistance.
          </div>
          <MaterialRadarChart materials={selectedMaterials} />
        </div>
      )}

      {/* Tab 3: Ashby Selection Scatter Plot */}
      {activeTab === 'ashby' && (
        <MaterialAshbyPlot
          allMaterials={allMaterials}
          selectedMaterials={selectedMaterials}
          onSelectMaterial={onSelectMaterialDetail}
        />
      )}

      {/* Tab 4: Property Bar Chart */}
      {activeTab === 'bars' && (
        <div className="p-4 rounded-xl bg-[#091017] border border-[#1b2d42] space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Property to compare:</span>
            <select
              value={activeBarProperty}
              onChange={(e) => setActiveBarProperty(e.target.value as any)}
              className="bg-[#070d14] border border-[#1e3046] text-amber-300 font-mono text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-amber-500"
            >
              {Object.values(PROPERTY_DEFINITIONS).map((def) => (
                <option key={def.key} value={def.key}>
                  {def.name} ({def.symbol} [{def.unit}])
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 pt-2">
            {(() => {
              const def = PROPERTY_DEFINITIONS[activeBarProperty];
              const values = selectedMaterials.map((m) => def.getNumericValue(m));
              const maxVal = Math.max(...values, 0.001);

              return selectedMaterials.map((mat) => {
                const val = def.getNumericValue(mat);
                const percent = Math.max(4, Math.min(100, (val / maxVal) * 100));

                return (
                  <div key={mat.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-white font-bold">{mat.name}</span>
                      <span className="text-amber-300 font-bold">{def.formatValue(mat)}</span>
                    </div>
                    <div className="w-full bg-[#050a10] rounded-full h-3 overflow-hidden border border-[#162536]">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-500 to-cyan-400"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* Tab 5: Property Ranking */}
      {activeTab === 'ranking' && (
        <MaterialRankingView
          materials={allMaterials}
          onSelectMaterial={onSelectMaterialDetail}
          onToggleCompare={(m) => {
            const exists = selectedMaterials.some((x) => x.id === m.id);
            if (exists) onRemoveMaterial(m.id);
            else onAddMaterial(m);
          }}
          selectedIds={new Set(selectedMaterials.map((m) => m.id))}
        />
      )}
    </div>
  );
};
