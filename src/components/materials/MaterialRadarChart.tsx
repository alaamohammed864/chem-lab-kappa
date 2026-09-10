// Multi-Material Spider / Radar Chart Visualization
import React from 'react';
import { MaterialModel } from '../../engines/materials/materialModel';
import { normalizePropertyScore } from '../../engines/materials/propertyModel';

interface MaterialRadarChartProps {
  materials: MaterialModel[];
  width?: number;
  height?: number;
}

const RADAR_AXES = [
  { key: 'yieldStrength', label: 'Yield Strength', labelAr: 'إجهاد الخضوع' },
  { key: 'elasticModulus', label: 'Stiffness (E)', labelAr: 'معامل المرونة' },
  { key: 'hardness', label: 'Hardness', labelAr: 'الصلادة' },
  { key: 'thermalConductivity', label: 'Thermal Cond.', labelAr: 'التوصيل الحراري' },
  { key: 'electricalConductivity', label: 'Electrical Cond.', labelAr: 'التوصيل الكهربي' },
  { key: 'corrosionResistance', label: 'Corrosion Res.', labelAr: 'مقاومة التآكل' },
  { key: 'density', label: 'Lightweight (1/ρ)', labelAr: 'خفة الوزن' },
] as const;

const PALETTE = [
  { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.22)', text: 'text-amber-400' },
  { stroke: '#06b6d4', fill: 'rgba(6, 182, 212, 0.22)', text: 'text-cyan-400' },
  { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.22)', text: 'text-emerald-400' },
  { stroke: '#ec4899', fill: 'rgba(236, 72, 153, 0.22)', text: 'text-pink-400' },
  { stroke: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.22)', text: 'text-purple-400' },
];

export const MaterialRadarChart: React.FC<MaterialRadarChartProps> = ({
  materials,
  width = 460,
  height = 360,
}) => {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.38;
  const count = RADAR_AXES.length;
  const angleStep = (Math.PI * 2) / count;

  // Grid rings at 25%, 50%, 75%, 100%
  const levels = [0.25, 0.5, 0.75, 1.0];

  const getCoordinates = (index: number, scoreFraction: number) => {
    // Start at top (-PI/2)
    const angle = index * angleStep - Math.PI / 2;
    const r = radius * scoreFraction;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  return (
    <div className="flex flex-col items-center select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-[480px] h-auto overflow-visible"
      >
        {/* Background Grid Circles / Polygons */}
        {levels.map((lvl, lIdx) => {
          const points = RADAR_AXES.map((_, aIdx) => {
            const pt = getCoordinates(aIdx, lvl);
            return `${pt.x},${pt.y}`;
          }).join(' ');

          return (
            <g key={lvl}>
              <polygon
                points={points}
                fill="none"
                stroke="#1b2d42"
                strokeWidth={lIdx === levels.length - 1 ? 1.5 : 1}
                strokeDasharray={lIdx === levels.length - 1 ? undefined : '3,3'}
              />
              <text
                x={cx + 6}
                y={cy - radius * lvl + 10}
                fill="#475569"
                fontSize="9"
                fontFamily="monospace"
              >
                {Math.round(lvl * 100)}%
              </text>
            </g>
          );
        })}

        {/* Axis Spokes & Labels */}
        {RADAR_AXES.map((axis, aIdx) => {
          const outer = getCoordinates(aIdx, 1.0);
          const labelPt = getCoordinates(aIdx, 1.18);

          return (
            <g key={axis.key}>
              <line
                x1={cx}
                y1={cy}
                x2={outer.x}
                y2={outer.y}
                stroke="#1e293b"
                strokeWidth={1.2}
              />
              <text
                x={labelPt.x}
                y={labelPt.y}
                fill="#94a3b8"
                fontSize="10"
                fontWeight="600"
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="sans-serif"
              >
                {axis.label}
              </text>
            </g>
          );
        })}

        {/* Material Polygons */}
        {materials.slice(0, 5).map((mat, mIdx) => {
          const color = PALETTE[mIdx % PALETTE.length];
          const pts = RADAR_AXES.map((axis, aIdx) => {
            const score = normalizePropertyScore(mat, axis.key as any) / 100;
            return getCoordinates(aIdx, Math.max(0.08, score));
          });

          const polygonPoints = pts.map((p) => `${p.x},${p.y}`).join(' ');

          return (
            <g key={mat.id} className="transition-all duration-300">
              <polygon
                points={polygonPoints}
                fill={color.fill}
                stroke={color.stroke}
                strokeWidth={2.2}
                strokeLinejoin="round"
              />
              {pts.map((p, pIdx) => (
                <circle
                  key={pIdx}
                  cx={p.x}
                  cy={p.y}
                  r={3.5}
                  fill={color.stroke}
                  stroke="#091017"
                  strokeWidth={1.5}
                />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-2 px-3 py-1.5 rounded-lg bg-[#070d14] border border-[#18283a]">
        {materials.slice(0, 5).map((mat, mIdx) => {
          const color = PALETTE[mIdx % PALETTE.length];
          return (
            <div key={mat.id} className="flex items-center gap-1.5 text-xs font-mono">
              <span
                className="w-3 h-3 rounded-full shrink-0 border border-black/40"
                style={{ backgroundColor: color.stroke }}
              />
              <span className="text-white font-medium truncate max-w-[130px]">
                {mat.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
