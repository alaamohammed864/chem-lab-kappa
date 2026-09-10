// Dynamic Scientific Plot & Graphing Panel
// Pure decoupled vector plotting engine handling primary & secondary Y axes, dynamic bounds, and crosshair inspections.

import React, { useState, useMemo, useRef } from 'react';
import { LineChart, Maximize2, Download, Eye, Layers } from 'lucide-react';
import { GraphConfig, SimulationDataPoint } from '../../engines/simulation';

interface GraphPanelProps {
  config: GraphConfig;
  dataPoints: SimulationDataPoint[];
  isArabic?: boolean;
}

export const GraphPanel: React.FC<GraphPanelProps> = ({
  config,
  dataPoints,
  isArabic = false,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; ySec?: number; screenX: number; screenY: number } | null>(null);
  const [showSecondary, setShowSecondary] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);

  // SVG Chart Dimensions
  const width = 560;
  const height = 280;
  const margin = { top: 25, right: config.secondaryYKey ? 45 : 20, bottom: 40, left: 50 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Compute Domain & Range from data
  const { minX, maxX, minY, maxY, minYSup, maxYSup, validPoints } = useMemo(() => {
    const pts = dataPoints
      .map((dp) => ({
        x: Number(dp.values[config.xKey]),
        y: Number(dp.values[config.yKey]),
        ySec: config.secondaryYKey ? Number(dp.values[config.secondaryYKey]) : undefined,
      }))
      .filter((p) => !isNaN(p.x) && !isNaN(p.y));

    let calcMinX = config.minX ?? (pts.length ? Math.min(...pts.map((p) => p.x)) : 0);
    let calcMaxX = config.maxX ?? (pts.length ? Math.max(...pts.map((p) => p.x)) : 10);
    if (calcMaxX <= calcMinX) calcMaxX = calcMinX + 1;

    let calcMinY = config.minY ?? (pts.length ? Math.min(...pts.map((p) => p.y)) : 0);
    let calcMaxY = config.maxY ?? (pts.length ? Math.max(...pts.map((p) => p.y)) : 10);
    if (calcMaxY <= calcMinY) calcMaxY = calcMinY + 1;

    let calcMinYSup = 0;
    let calcMaxYSup = 100;
    if (config.secondaryYKey) {
      const validSec = pts.filter((p) => p.ySec !== undefined && !isNaN(p.ySec!));
      if (validSec.length) {
        calcMinYSup = Math.min(...validSec.map((p) => p.ySec!));
        calcMaxYSup = Math.max(...validSec.map((p) => p.ySec!));
        if (calcMaxYSup <= calcMinYSup) calcMaxYSup = calcMinYSup + 1;
      }
    }

    return {
      minX: calcMinX,
      maxX: calcMaxX,
      minY: calcMinY,
      maxY: calcMaxY,
      minYSup: calcMinYSup,
      maxYSup: calcMaxYSup,
      validPoints: pts,
    };
  }, [dataPoints, config]);

  // Coordinate transforms
  const scaleX = (val: number) => margin.left + ((val - minX) / (maxX - minX)) * innerWidth;
  const scaleY = (val: number) => margin.top + innerHeight - ((val - minY) / (maxY - minY)) * innerHeight;
  const scaleYSec = (val: number) =>
    margin.top + innerHeight - ((val - minYSup) / (maxYSup - minYSup)) * innerHeight;

  // Build SVG Path Strings
  const primaryPathD = useMemo(() => {
    if (validPoints.length < 2) return '';
    return validPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.x).toFixed(1)} ${scaleY(p.y).toFixed(1)}`)
      .join(' ');
  }, [validPoints, minX, maxX, minY, maxY]);

  const secondaryPathD = useMemo(() => {
    if (!config.secondaryYKey || !showSecondary || validPoints.length < 2) return '';
    return validPoints
      .filter((p) => p.ySec !== undefined)
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.x).toFixed(1)} ${scaleYSec(p.ySec!).toFixed(1)}`)
      .join(' ');
  }, [validPoints, config.secondaryYKey, showSecondary, minX, maxX, minYSup, maxYSup]);

  // Handle Mouse Hover / Crosshairs
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || validPoints.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * width;

    // Find closest point by X coordinate
    let closest = validPoints[0];
    let minDiff = Infinity;
    for (const p of validPoints) {
      const diff = Math.abs(scaleX(p.x) - svgX);
      if (diff < minDiff) {
        minDiff = diff;
        closest = p;
      }
    }

    if (minDiff < 40) {
      setHoveredPoint({
        x: closest.x,
        y: closest.y,
        ySec: closest.ySec,
        screenX: scaleX(closest.x),
        screenY: scaleY(closest.y),
      });
    } else {
      setHoveredPoint(null);
    }
  };

  return (
    <div className="w-full bg-[#0d1622] border border-[#18293d] rounded-xl p-3.5 space-y-3 shadow-md">
      {/* Header & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#18293d] pb-2">
        <div className="flex items-center gap-2">
          <LineChart className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {isArabic ? 'الرسم البياني العلمي التفاعلي' : 'Real-Time Kinetic / Equilibrium Plot'}
          </h4>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-cyan-400 rounded-full" />
            <span className="text-cyan-300">
              {isArabic && config.yLabelAr ? config.yLabelAr : config.yLabel}
            </span>
          </div>

          {config.secondaryYKey && (
            <button
              onClick={() => setShowSecondary(!showSecondary)}
              className="flex items-center gap-1.5 cursor-pointer opacity-90 hover:opacity-100"
            >
              <span className={`w-3 h-0.5 bg-amber-400 rounded-full ${!showSecondary ? 'opacity-30' : ''}`} />
              <span className={`text-amber-300 ${!showSecondary ? 'line-through opacity-40' : ''}`}>
                {config.secondaryYLabel}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full aspect-[2/1] min-h-[220px] max-h-[300px]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {/* Subtle Grid Lines (Horizontal & Vertical) */}
          <g id="grid-lines" opacity="0.15">
            {[0, 0.25, 0.5, 0.75, 1.0].map((frac) => {
              const y = margin.top + frac * innerHeight;
              const x = margin.left + frac * innerWidth;
              return (
                <React.Fragment key={frac}>
                  <line x1={margin.left} y1={y} x2={width - margin.right} y2={y} stroke="#64748b" strokeDasharray="3 3" />
                  <line x1={x} y1={margin.top} x2={x} y2={height - margin.bottom} stroke="#64748b" strokeDasharray="3 3" />
                </React.Fragment>
              );
            })}
          </g>

          {/* Primary X and Y Axes Lines */}
          <line
            x1={margin.left}
            y1={height - margin.bottom}
            x2={width - margin.right}
            y2={height - margin.bottom}
            stroke="#475569"
            strokeWidth="1.2"
          />
          <line
            x1={margin.left}
            y1={margin.top}
            x2={margin.left}
            y2={height - margin.bottom}
            stroke="#475569"
            strokeWidth="1.2"
          />

          {/* Y Axis Ticks and Labels (Left) */}
          {[0, 0.5, 1.0].map((frac) => {
            const val = minY + (1 - frac) * (maxY - minY);
            const y = margin.top + frac * innerHeight;
            return (
              <g key={frac}>
                <line x1={margin.left - 4} y1={y} x2={margin.left} y2={y} stroke="#64748b" />
                <text
                  x={margin.left - 7}
                  y={y + 3}
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {val.toFixed(val < 1 ? 2 : 1)}
                </text>
              </g>
            );
          })}

          {/* X Axis Ticks and Labels (Bottom) */}
          {[0, 0.5, 1.0].map((frac) => {
            const val = minX + frac * (maxX - minX);
            const x = margin.left + frac * innerWidth;
            return (
              <g key={frac}>
                <line x1={x} y1={height - margin.bottom} x2={x} y2={height - margin.bottom + 4} stroke="#64748b" />
                <text
                  x={x}
                  y={height - margin.bottom + 14}
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {val.toFixed(val < 1 ? 2 : 1)}
                </text>
              </g>
            );
          })}

          {/* X Axis Title */}
          <text
            x={margin.left + innerWidth / 2}
            y={height - 8}
            fill="#cbd5e1"
            fontSize="10"
            fontFamily="sans-serif"
            textAnchor="middle"
          >
            {isArabic && config.xLabelAr ? config.xLabelAr : config.xLabel}{' '}
            {config.xUnit && `(${config.xUnit})`}
          </text>

          {/* Y Axis Title */}
          <text
            transform={`rotate(-90 ${margin.left - 34} ${margin.top + innerHeight / 2})`}
            x={margin.left - 34}
            y={margin.top + innerHeight / 2}
            fill="#38bdf8"
            fontSize="10"
            fontFamily="sans-serif"
            textAnchor="middle"
          >
            {isArabic && config.yLabelAr ? config.yLabelAr : config.yLabel}
          </text>

          {/* Secondary Y Axis Ticks (Right) */}
          {config.secondaryYKey && showSecondary && (
            <g id="secondary-axis">
              <line
                x1={width - margin.right}
                y1={margin.top}
                x2={width - margin.right}
                y2={height - margin.bottom}
                stroke="#475569"
                strokeWidth="1"
              />
              {[0, 0.5, 1.0].map((frac) => {
                const val = minYSup + (1 - frac) * (maxYSup - minYSup);
                const y = margin.top + frac * innerHeight;
                return (
                  <g key={frac}>
                    <line x1={width - margin.right} y1={y} x2={width - margin.right + 4} stroke="#64748b" />
                    <text
                      x={width - margin.right + 7}
                      y={y + 3}
                      fill="#f59e0b"
                      fontSize="8"
                      fontFamily="monospace"
                    >
                      {val.toFixed(0)}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Primary Curve Path */}
          {primaryPathD && (
            <path
              d={primaryPathD}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Secondary Curve Path */}
          {secondaryPathD && (
            <path
              d={secondaryPathD}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="1.5"
              strokeDasharray="4 2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Points Data Dots */}
          {validPoints.map((p, idx) => (
            <circle
              key={idx}
              cx={scaleX(p.x)}
              cy={scaleY(p.y)}
              r="2.5"
              fill="#0369a1"
              stroke="#38bdf8"
              strokeWidth="1"
            />
          ))}

          {/* Active Hover Crosshair Line & Tooltip */}
          {hoveredPoint && (
            <g id="hover-crosshairs" pointerEvents="none">
              <line
                x1={hoveredPoint.screenX}
                y1={margin.top}
                x2={hoveredPoint.screenX}
                y2={height - margin.bottom}
                stroke="#ffffff"
                strokeWidth="0.8"
                strokeDasharray="2 2"
                opacity="0.6"
              />
              <circle
                cx={hoveredPoint.screenX}
                cy={hoveredPoint.screenY}
                r="4"
                fill="#ffffff"
                stroke="#0284c7"
                strokeWidth="1.5"
              />

              {/* Tooltip Box */}
              <g
                transform={`translate(${Math.min(
                  width - 110,
                  Math.max(margin.left + 5, hoveredPoint.screenX - 50)
                )}, ${Math.max(margin.top + 5, hoveredPoint.screenY - 45)})`}
              >
                <rect x="0" y="0" width="100" height="36" rx="4" fill="#020617" stroke="#334155" opacity="0.95" />
                <text x="8" y="14" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                  X: {hoveredPoint.x.toFixed(2)} {config.xUnit}
                </text>
                <text x="8" y="28" fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  Y: {hoveredPoint.y.toFixed(2)} {config.yUnit}
                </text>
              </g>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
