// Interactive Phase Diagram SVG Canvas
// Renders temperature vs. composition with phase regions, boundary curves, cursor tracking, and tie-line overlays

import React, { useState, useRef } from 'react';
import {
  BinaryPhaseSystem,
  evaluatePhaseState,
  PhaseEvaluationResult,
} from '../../engines/materials/phaseDiagramEngine';

interface PhaseDiagramCanvasProps {
  system: BinaryPhaseSystem;
  selectedX: number; // wt%
  selectedT: number; // °C
  onSelectPoint: (x: number, t: number) => void;
  evaluation: PhaseEvaluationResult;
}

export const PhaseDiagramCanvas: React.FC<PhaseDiagramCanvasProps> = ({
  system,
  selectedX,
  selectedT,
  onSelectPoint,
  evaluation,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; t: number; mouseX: number; mouseY: number } | null>(null);

  // SVG viewBox coordinate mapping
  const width = 640;
  const height = 460;
  const padding = { top: 35, right: 55, bottom: 55, left: 65 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const xMin = system.compositionRange.min;
  const xMax = system.compositionRange.max;
  const tMin = system.temperatureRange.min;
  const tMax = system.temperatureRange.max;

  // Convert (x, t) in physical space to (px, py) in SVG space
  const mapX = (x: number) => padding.left + ((x - xMin) / (xMax - xMin)) * plotW;
  const mapT = (t: number) => padding.top + plotH - ((t - tMin) / (tMax - tMin)) * plotH;

  // Invert SVG coordinate (px, py) to (x, t)
  const unmapX = (px: number) => xMin + ((px - padding.left) / plotW) * (xMax - xMin);
  const unmapT = (py: number) => tMin + ((padding.top + plotH - py) / plotH) * (tMax - tMin);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;

    if (px >= padding.left && px <= width - padding.right && py >= padding.top && py <= height - padding.bottom) {
      const physX = Math.max(xMin, Math.min(xMax, unmapX(px)));
      const physT = Math.max(tMin, Math.min(tMax, unmapT(py)));
      setHoverPos({
        x: physX,
        t: physT,
        mouseX: e.clientX - rect.left,
        mouseY: e.clientY - rect.top,
      });
    } else {
      setHoverPos(null);
    }
  };

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;

    if (px >= padding.left && px <= width - padding.right && py >= padding.top && py <= height - padding.bottom) {
      const physX = Math.max(xMin, Math.min(xMax, unmapX(px)));
      const physT = Math.max(tMin, Math.min(tMax, unmapT(py)));
      onSelectPoint(Number(physX.toFixed(1)), Math.round(physT));
    }
  };

  // Generate tick marks
  const xTicks: number[] = [];
  const xStep = (xMax - xMin) <= 10 ? 1 : (xMax - xMin) <= 50 ? 5 : 10;
  for (let val = xMin; val <= xMax; val += xStep) {
    xTicks.push(val);
  }

  const tTicks: number[] = [];
  const tStep = (tMax - tMin) <= 500 ? 50 : 100;
  for (let val = Math.ceil(tMin / tStep) * tStep; val <= tMax; val += tStep) {
    tTicks.push(val);
  }

  // Active state point mapping
  const selPx = mapX(selectedX);
  const selPy = mapT(selectedT);

  // Hover point evaluation
  const hoverEval = hoverPos ? evaluatePhaseState(system, hoverPos.x, hoverPos.t) : null;

  return (
    <div className="relative w-full bg-[#060b12] rounded-xl border border-[#142334] overflow-hidden select-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto cursor-crosshair block"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverPos(null)}
        onClick={handleClick}
      >
        {/* Background Gradients & Filters */}
        <defs>
          <linearGradient id="plotBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#081422" />
            <stop offset="100%" stopColor="#040910" />
          </linearGradient>
          <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#102030" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Plot area background */}
        <rect
          x={padding.left}
          y={padding.top}
          width={plotW}
          height={plotH}
          fill="url(#plotBg)"
          stroke="#1b3046"
          strokeWidth="1.5"
        />
        <rect
          x={padding.left}
          y={padding.top}
          width={plotW}
          height={plotH}
          fill="url(#gridPattern)"
          opacity="0.6"
        />

        {/* Gridlines */}
        {xTicks.map((xVal) => (
          <line
            key={`grid-x-${xVal}`}
            x1={mapX(xVal)}
            y1={padding.top}
            x2={mapX(xVal)}
            y2={padding.top + plotH}
            stroke="#152638"
            strokeWidth="0.75"
            strokeDasharray="2,2"
          />
        ))}
        {tTicks.map((tVal) => (
          <line
            key={`grid-t-${tVal}`}
            x1={padding.left}
            y1={mapT(tVal)}
            x2={padding.left + plotW}
            y2={mapT(tVal)}
            stroke="#152638"
            strokeWidth="0.75"
            strokeDasharray="2,2"
          />
        ))}

        {/* 1. Phase Region Polygons */}
        {system.regions.map((region) => {
          const pointsStr = region.polygon
            .map(([x, t]) => `${mapX(x).toFixed(1)},${mapT(t).toFixed(1)}`)
            .join(' ');

          const isCurrentActive = evaluation.activeRegion.id === region.id;

          return (
            <g key={region.id}>
              <polygon
                points={pointsStr}
                fill={region.color}
                stroke={isCurrentActive ? '#38bdf8' : 'none'}
                strokeWidth={isCurrentActive ? 1.5 : 0}
                className="transition-colors duration-150"
              />
            </g>
          );
        })}

        {/* 2. Boundary Curves */}
        {system.boundaries.map((boundary) => {
          const d = boundary.points
            .map(([x, t], i) => `${i === 0 ? 'M' : 'L'} ${mapX(x).toFixed(1)} ${mapT(t).toFixed(1)}`)
            .join(' ');

          return (
            <path
              key={boundary.id}
              d={d}
              fill="none"
              stroke={boundary.color}
              strokeWidth="2"
              strokeDasharray={boundary.dashPattern || 'none'}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {/* 3. Invariant Reaction Points */}
        {system.invariantPoints.map((pt) => {
          const px = mapX(pt.composition);
          const py = mapT(pt.temperature);
          return (
            <g key={pt.id}>
              <circle cx={px} cy={py} r="5" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />
              <text
                x={px}
                y={py - 8}
                textAnchor="middle"
                fill="#f43f5e"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {pt.temperature}°C
              </text>
            </g>
          );
        })}

        {/* 4. Tie-Line Overlay (When two-phase region is active) */}
        {evaluation.tieLine && (
          <g>
            {/* Horizontal Tie-Line */}
            <line
              x1={mapX(evaluation.tieLine.leftComposition)}
              y1={selPy}
              x2={mapX(evaluation.tieLine.rightComposition)}
              y2={selPy}
              stroke="#fbbf24"
              strokeWidth="2.5"
              strokeDasharray="4,3"
            />
            {/* Left Boundary Intercept */}
            <circle
              cx={mapX(evaluation.tieLine.leftComposition)}
              cy={selPy}
              r="4.5"
              fill="#fbbf24"
              stroke="#081422"
              strokeWidth="1.5"
            />
            {/* Right Boundary Intercept */}
            <circle
              cx={mapX(evaluation.tieLine.rightComposition)}
              cy={selPy}
              r="4.5"
              fill="#fbbf24"
              stroke="#081422"
              strokeWidth="1.5"
            />
            {/* Intercept composition labels */}
            <text
              x={mapX(evaluation.tieLine.leftComposition)}
              y={selPy + 14}
              textAnchor="middle"
              fill="#fbbf24"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {evaluation.tieLine.leftPhaseName}: {evaluation.tieLine.leftComposition}%
            </text>
            <text
              x={mapX(evaluation.tieLine.rightComposition)}
              y={selPy + 14}
              textAnchor="middle"
              fill="#fbbf24"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {evaluation.tieLine.rightPhaseName}: {evaluation.tieLine.rightComposition}%
            </text>
          </g>
        )}

        {/* 5. Selected State Point (Crosshairs & Marker) */}
        <g>
          {/* Vertical guideline */}
          <line
            x1={selPx}
            y1={padding.top}
            x2={selPx}
            y2={padding.top + plotH}
            stroke="#38bdf8"
            strokeWidth="1"
            strokeDasharray="3,3"
            opacity="0.7"
          />
          {/* Horizontal guideline */}
          <line
            x1={padding.left}
            y1={selPy}
            x2={padding.left + plotW}
            y2={selPy}
            stroke="#38bdf8"
            strokeWidth="1"
            strokeDasharray="3,3"
            opacity="0.7"
          />
          {/* Center Target Point */}
          <circle cx={selPx} cy={selPy} r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
          <circle cx={selPx} cy={selPy} r="2" fill="#040910" />
        </g>

        {/* 6. Axes & Tick Labels */}
        {/* X Axis */}
        <line
          x1={padding.left}
          y1={padding.top + plotH}
          x2={padding.left + plotW}
          y2={padding.top + plotH}
          stroke="#334d68"
          strokeWidth="1.5"
        />
        {xTicks.map((xVal) => (
          <g key={`xtick-${xVal}`} transform={`translate(${mapX(xVal)}, ${padding.top + plotH})`}>
            <line y2="5" stroke="#334d68" strokeWidth="1" />
            <text
              y="16"
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="10"
              fontFamily="monospace"
            >
              {xVal}
            </text>
          </g>
        ))}

        {/* Y Axis (Left - Temperature °C) */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + plotH}
          stroke="#334d68"
          strokeWidth="1.5"
        />
        {tTicks.map((tVal) => (
          <g key={`ytick-${tVal}`} transform={`translate(${padding.left}, ${mapT(tVal)})`}>
            <line x2="-5" stroke="#334d68" strokeWidth="1" />
            <text
              x="-8"
              y="3"
              textAnchor="end"
              fill="#94a3b8"
              fontSize="10"
              fontFamily="monospace"
            >
              {tVal}
            </text>
          </g>
        ))}

        {/* Y Axis (Right - Temperature K) */}
        <line
          x1={padding.left + plotW}
          y1={padding.top}
          x2={padding.left + plotW}
          y2={padding.top + plotH}
          stroke="#334d68"
          strokeWidth="1.5"
        />
        {tTicks.map((tVal) => (
          <g key={`ytick-k-${tVal}`} transform={`translate(${padding.left + plotW}, ${mapT(tVal)})`}>
            <line x2="5" stroke="#334d68" strokeWidth="1" />
            <text
              x="8"
              y="3"
              textAnchor="start"
              fill="#64748b"
              fontSize="9"
              fontFamily="monospace"
            >
              {tVal + 273}K
            </text>
          </g>
        ))}

        {/* Axis Labels */}
        <text
          x={padding.left + plotW / 2}
          y={height - 12}
          textAnchor="middle"
          fill="#cbd5e1"
          fontSize="11"
          fontFamily="monospace"
          fontWeight="bold"
        >
          {system.compositionLabel} →
        </text>

        <text
          x={18}
          y={padding.top + plotH / 2}
          textAnchor="middle"
          fill="#cbd5e1"
          fontSize="11"
          fontFamily="monospace"
          fontWeight="bold"
          transform={`rotate(-90 18 ${padding.top + plotH / 2})`}
        >
          Temperature (°C)
        </text>

        {/* Component Names at Endpoints */}
        <text
          x={padding.left}
          y={padding.top - 12}
          fill="#38bdf8"
          fontSize="11"
          fontFamily="monospace"
          fontWeight="bold"
        >
          Pure {system.componentA.name} ({system.componentA.symbol})
        </text>
        <text
          x={padding.left + plotW}
          y={padding.top - 12}
          textAnchor="end"
          fill="#38bdf8"
          fontSize="11"
          fontFamily="monospace"
          fontWeight="bold"
        >
          Pure {system.componentB.name} ({system.componentB.symbol})
        </text>
      </svg>

      {/* Real-time Hover Inspection Tooltip */}
      {hoverPos && hoverEval && (
        <div
          className="absolute pointer-events-none z-30 px-3 py-2 bg-[#091522]/95 border border-cyan-500/60 rounded-lg shadow-xl text-xs font-mono backdrop-blur-md transition-transform"
          style={{
            left: `${Math.min(hoverPos.mouseX + 15, width - 180)}px`,
            top: `${Math.max(10, hoverPos.mouseY - 60)}px`,
          }}
        >
          <div className="font-bold text-cyan-300">{hoverEval.activeRegion.phaseLabel}</div>
          <div className="text-slate-300 text-[11px] mt-0.5">
            X: <span className="text-white font-bold">{hoverPos.x.toFixed(1)} wt%</span> • T:{' '}
            <span className="text-amber-300 font-bold">{Math.round(hoverPos.t)}°C</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Click to set operating state</div>
        </div>
      )}
    </div>
  );
};
