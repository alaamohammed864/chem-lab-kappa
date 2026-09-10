// 2D Molecular Structural Diagram (SVG projection)
// Decouples pure chemical structure from vector rendering.
// Displays bonds with correct double/triple offsets, bond orders, and element symbols.

import React from 'react';
import { MoleculeData, MoleculeAtom } from '../../data/moleculesData';
import { getCPKColor, computeCentroid } from '../../engines/chemistry/moleculeEngine';

interface Molecule2DViewProps {
  molecule: MoleculeData;
}

export const Molecule2DView: React.FC<Molecule2DViewProps> = ({ molecule }) => {
  const atoms = molecule.atoms;
  const bonds = molecule.bonds;

  // Compute 2D bounding box over XY plane
  const centroid = computeCentroid(atoms);

  const padding = 60;
  const width = 480;
  const height = 340;

  // Determine span in XY
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  atoms.forEach((a) => {
    if (a.x < minX) minX = a.x;
    if (a.x > maxX) maxX = a.x;
    if (a.y < minY) minY = a.y;
    if (a.y > maxY) maxY = a.y;
  });

  const spanX = Math.max(0.5, maxX - minX);
  const spanY = Math.max(0.5, maxY - minY);
  const scale = Math.min((width - padding * 2) / spanX, (height - padding * 2) / spanY, 75);

  const toScreenX = (x: number) => width / 2 + (x - centroid[0]) * scale;
  const toScreenY = (y: number) => height / 2 - (y - centroid[1]) * scale; // invert Y for SVG

  const atomMap = new Map<string, MoleculeAtom>(atoms.map((a) => [a.id, a]));

  return (
    <div className="w-full h-full min-h-[320px] flex items-center justify-center p-4 bg-[#070d15] rounded-xl border border-slate-800/80 relative overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-lg h-auto drop-shadow-lg"
      >
        <defs>
          <radialGradient id="atomGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Render Bonds */}
        {bonds.map((b) => {
          const a1 = atomMap.get(b.sourceAtomId);
          const a2 = atomMap.get(b.targetAtomId);
          if (!a1 || !a2) return null;

          const x1 = toScreenX(a1.x);
          const y1 = toScreenY(a1.y);
          const x2 = toScreenX(a2.x);
          const y2 = toScreenY(a2.y);

          const dx = x2 - x1;
          const dy = y2 - y1;
          const len = Math.sqrt(dx * dx + dy * dy);
          const nx = -dy / (len || 1);
          const ny = dx / (len || 1);

          if (b.order === 2) {
            const offset = 3.5;
            return (
              <g key={b.id} className="stroke-slate-400">
                <line
                  x1={x1 + nx * offset}
                  y1={y1 + ny * offset}
                  x2={x2 + nx * offset}
                  y2={y2 + ny * offset}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <line
                  x1={x1 - nx * offset}
                  y1={y1 - ny * offset}
                  x2={x2 - nx * offset}
                  y2={y2 - ny * offset}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </g>
            );
          }

          if (b.order === 3) {
            const offset = 4.5;
            return (
              <g key={b.id} className="stroke-slate-400">
                <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="2.5" strokeLinecap="round" />
                <line
                  x1={x1 + nx * offset}
                  y1={y1 + ny * offset}
                  x2={x2 + nx * offset}
                  y2={y2 + ny * offset}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1={x1 - nx * offset}
                  y1={y1 - ny * offset}
                  x2={x2 - nx * offset}
                  y2={y2 - ny * offset}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </g>
            );
          }

          if (b.order === 1.5) {
            return (
              <g key={b.id}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
                <line
                  x1={x1 + nx * 4}
                  y1={y1 + ny * 4}
                  x2={x2 + nx * 4}
                  y2={y2 + ny * 4}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  strokeLinecap="round"
                />
              </g>
            );
          }

          return (
            <line
              key={b.id}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#94a3b8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          );
        })}

        {/* 2. Render Atoms */}
        {atoms.map((atom) => {
          const sx = toScreenX(atom.x);
          const sy = toScreenY(atom.y);
          const cpk = getCPKColor(atom.element);
          const isCarbon = atom.element === 'C';
          const r = isCarbon ? 14 : 16;

          return (
            <g key={atom.id} className="cursor-pointer group">
              <circle
                cx={sx}
                cy={sy}
                r={r + 4}
                className="fill-[#0c1522] stroke-slate-700/80 group-hover:stroke-cyan-400 transition"
                strokeWidth="1.5"
              />
              <circle cx={sx} cy={sy} r={r} fill={cpk} fillOpacity="0.25" />
              <text
                x={sx}
                y={sy + 4.5}
                textAnchor="middle"
                className="text-[13px] font-bold font-mono select-none"
                fill={cpk === '#FFFFFF' ? '#e2e8f0' : cpk}
              >
                {atom.element}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-500 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
        2D Lewis Projection
      </div>
    </div>
  );
};
