// Ashby Materials Selection Scatter Chart
import React, { useState } from 'react';
import { MaterialModel, MaterialCategory } from '../../engines/materials/materialModel';

interface MaterialAshbyPlotProps {
  allMaterials: MaterialModel[];
  selectedMaterials?: MaterialModel[];
  onSelectMaterial?: (material: MaterialModel) => void;
}

const CATEGORY_COLORS: Record<MaterialCategory, { fill: string; stroke: string; label: string }> = {
  metals: { fill: '#3b82f6', stroke: '#60a5fa', label: 'Metals' },
  alloys: { fill: '#f59e0b', stroke: '#fbbf24', label: 'Alloys' },
  ceramics: { fill: '#ec4899', stroke: '#f472b6', label: 'Ceramics' },
  polymers: { fill: '#10b981', stroke: '#34d399', label: 'Polymers' },
  composites: { fill: '#8b5cf6', stroke: '#a78bfa', label: 'Composites' },
  semiconductors: { fill: '#06b6d4', stroke: '#22d3ee', label: 'Semiconductors' },
  'advanced materials': { fill: '#f97316', stroke: '#fb923c', label: 'Advanced Materials' },
};

export const MaterialAshbyPlot: React.FC<MaterialAshbyPlotProps> = ({
  allMaterials,
  selectedMaterials = [],
  onSelectMaterial,
}) => {
  const [yProperty, setYProperty] = useState<'yieldStrength' | 'elasticModulus' | 'tensileStrength'>('yieldStrength');
  const [hoveredMaterial, setHoveredMaterial] = useState<MaterialModel | null>(null);
  const [useLogScale, setUseLogScale] = useState(true);

  const selectedIds = new Set(selectedMaterials.map((m) => m.id));

  // Dimensions
  const width = 640;
  const height = 380;
  const padding = { top: 30, right: 30, bottom: 50, left: 65 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // X range: Density (g/cm³) from ~0.08 to 22
  const minX = 0.08;
  const maxX = 22;

  // Y range: depending on property
  const yRanges: Record<string, { min: number; max: number; label: string; unit: string }> = {
    yieldStrength: { min: 0.8, max: 4500, label: 'Yield Strength (σy)', unit: 'MPa' },
    elasticModulus: { min: 0.04, max: 1200, label: "Young's Modulus (E)", unit: 'GPa' },
    tensileStrength: { min: 1.5, max: 3500, label: 'Tensile Strength (UTS)', unit: 'MPa' },
  };

  const { min: minY, max: maxY, label: yLabel, unit: yUnit } = yRanges[yProperty];

  // Coordinate transforms
  const getX = (density: number) => {
    if (useLogScale) {
      const logMin = Math.log10(minX);
      const logMax = Math.log10(maxX);
      const logVal = Math.log10(Math.max(minX, density));
      return padding.left + ((logVal - logMin) / (logMax - logMin)) * innerWidth;
    }
    return padding.left + (density / maxX) * innerWidth;
  };

  const getY = (val: number) => {
    if (useLogScale) {
      const logMin = Math.log10(minY);
      const logMax = Math.log10(maxY);
      const logVal = Math.log10(Math.max(minY, val));
      const fraction = (logVal - logMin) / (logMax - logMin);
      return padding.top + innerHeight - fraction * innerHeight;
    }
    const fraction = Math.min(1, Math.max(0, val / maxY));
    return padding.top + innerHeight - fraction * innerHeight;
  };

  // Grid tick values
  const xTicks = useLogScale ? [0.1, 0.5, 1, 2, 5, 10, 20] : [2, 5, 10, 15, 20];
  const yTicks = useLogScale
    ? yProperty === 'elasticModulus'
      ? [0.1, 1, 10, 100, 1000]
      : [1, 10, 100, 1000, 4000]
    : [500, 1000, 2000, 3000];

  return (
    <div className="flex flex-col select-none bg-[#091017] rounded-xl border border-[#1b2d42] p-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#142230] text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-mono text-[11px]">Ashby Y-Axis:</span>
          <select
            value={yProperty}
            onChange={(e) => setYProperty(e.target.value as any)}
            className="bg-[#070d14] border border-[#1e3046] text-amber-300 font-mono text-xs rounded px-2.5 py-1 focus:outline-none focus:border-amber-500"
          >
            <option value="yieldStrength">Yield Strength (σy, MPa)</option>
            <option value="elasticModulus">Young's Modulus (E, GPa)</option>
            <option value="tensileStrength">Tensile Strength (UTS, MPa)</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-mono text-slate-400">
            <input
              type="checkbox"
              checked={useLogScale}
              onChange={(e) => setUseLogScale(e.target.checked)}
              className="rounded bg-[#070d14] border-slate-700 text-amber-500 focus:ring-0"
            />
            <span>Log-Log Scale</span>
          </label>
        </div>
      </div>

      {/* Main SVG Area */}
      <div className="relative mt-3 flex justify-center">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full max-w-[700px] h-auto overflow-visible"
        >
          {/* Background */}
          <rect
            x={padding.left}
            y={padding.top}
            width={innerWidth}
            height={innerHeight}
            fill="#050a10"
            stroke="#162536"
            strokeWidth={1}
            rx={6}
          />

          {/* Grid lines - X */}
          {xTicks.map((tick) => {
            const x = getX(tick);
            return (
              <g key={`x-${tick}`}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + innerHeight}
                  stroke="#101d2d"
                  strokeWidth={1}
                  strokeDasharray="3,3"
                />
                <text
                  x={x}
                  y={padding.top + innerHeight + 16}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Grid lines - Y */}
          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={`y-${tick}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + innerWidth}
                  y2={y}
                  stroke="#101d2d"
                  strokeWidth={1}
                  strokeDasharray="3,3"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Diagonal Guide Line (Constant specific metric indicator) */}
          <line
            x1={getX(0.2)}
            y1={getY(yProperty === 'elasticModulus' ? 0.4 : 20)}
            x2={getX(15)}
            y2={getY(yProperty === 'elasticModulus' ? 800 : 3500)}
            stroke="#1e3a5f"
            strokeWidth={1.5}
            strokeDasharray="4,4"
          />
          <text
            x={getX(6)}
            y={getY(yProperty === 'elasticModulus' ? 250 : 1200) - 8}
            fill="#38bdf8"
            fontSize="9"
            fontFamily="monospace"
            transform={`rotate(-24, ${getX(6)}, ${getY(yProperty === 'elasticModulus' ? 250 : 1200)})`}
          >
            Lightweight Structural Frontier (Ashby Index)
          </text>

          {/* Axis Titles */}
          <text
            x={padding.left + innerWidth / 2}
            y={height - 12}
            fill="#94a3b8"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            Mass Density ρ (g/cm³) {useLogScale ? '[Logarithmic]' : ''}
          </text>

          <text
            x={-padding.top - innerHeight / 2}
            y={18}
            fill="#94a3b8"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
            transform="rotate(-90)"
          >
            {yLabel} [{yUnit}]
          </text>

          {/* Material Bubbles */}
          {allMaterials.map((mat) => {
            const rawY = mat[yProperty];
            const cx = getX(mat.density);
            const cy = getY(rawY);
            const isSelected = selectedIds.has(mat.id);
            const isHovered = hoveredMaterial?.id === mat.id;
            const categoryMeta = CATEGORY_COLORS[mat.category] || { fill: '#94a3b8', stroke: '#cbd5e1' };

            return (
              <g
                key={mat.id}
                className="cursor-pointer transition-transform duration-200"
                onMouseEnter={() => setHoveredMaterial(mat)}
                onMouseLeave={() => setHoveredMaterial(null)}
                onClick={() => onSelectMaterial && onSelectMaterial(mat)}
              >
                {/* Selection Halo */}
                {isSelected && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={12}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    className="animate-pulse"
                  />
                )}

                {/* Main Node */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 6.5 : isHovered ? 7 : 5}
                  fill={categoryMeta.fill}
                  stroke={isSelected ? '#ffffff' : categoryMeta.stroke}
                  strokeWidth={isSelected ? 2 : 1.2}
                  opacity={isHovered ? 1 : 0.85}
                />

                {/* Label for highlighted / selected items */}
                {(isSelected || isHovered) && (
                  <text
                    x={cx + 8}
                    y={cy - 6}
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                    className="pointer-events-none drop-shadow"
                  >
                    {mat.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Box */}
        {hoveredMaterial && (
          <div className="absolute top-4 right-4 bg-[#0a131f]/95 border border-amber-500/50 p-2.5 rounded-lg shadow-xl text-xs font-mono max-w-xs pointer-events-none backdrop-blur-sm animate-fade-in">
            <div className="text-white font-bold flex items-center justify-between gap-2">
              <span>{hoveredMaterial.name}</span>
              <span className="text-[10px] text-amber-400 capitalize px-1.5 py-0.2 rounded bg-amber-950 border border-amber-800">
                {hoveredMaterial.category}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{hoveredMaterial.designation}</div>
            <div className="mt-2 pt-1.5 border-t border-slate-800 text-[11px] space-y-0.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Density:</span>
                <span className="text-white font-bold">{hoveredMaterial.density} g/cm³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{yLabel}:</span>
                <span className="text-amber-300 font-bold">
                  {hoveredMaterial[yProperty]} {yUnit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Specific Strength:</span>
                <span className="text-emerald-400 font-bold">
                  {(hoveredMaterial.yieldStrength / hoveredMaterial.density).toFixed(1)} kN·m/kg
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-3 pt-2.5 border-t border-[#142230] text-[11px] font-mono">
        {Object.entries(CATEGORY_COLORS).map(([catKey, catMeta]) => (
          <div key={catKey} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: catMeta.fill }}
            />
            <span className="text-slate-400 capitalize">{catMeta.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
