import React, { useRef, useState, useMemo, useEffect } from 'react';
import {
  DiffractogramScanPoint,
  ComputedPeakData,
  calculateBraggsLaw,
} from '../../engines/materials/xrdEngine';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';

interface XRDDiffractogramChartProps {
  scanPoints: DiffractogramScanPoint[];
  peaks: ComputedPeakData[];
  minTwoTheta: number;
  maxTwoTheta: number;
  activeWavelength: number;
  probeTwoTheta: number;
  onSetProbeTwoTheta: (val: number) => void;
  selectedPeakIndex?: number | null;
  onSelectPeakIndex?: (idx: number) => void;
  materialName: string;
  radiationName: string;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

export const XRDDiffractogramChart: React.FC<XRDDiffractogramChartProps> = ({
  scanPoints,
  peaks,
  minTwoTheta,
  maxTwoTheta,
  activeWavelength,
  probeTwoTheta,
  onSetProbeTwoTheta,
  selectedPeakIndex,
  onSelectPeakIndex,
  materialName,
  radiationName,
  isMaximized = false,
  onToggleMaximize,
}) => {
  // Viewport Zoom & Pan State
  const [viewMin, setViewMin] = useState<number>(minTwoTheta);
  const [viewMax, setViewMax] = useState<number>(maxTwoTheta);

  // Sync with global min/max bounds when scan range changes
  useEffect(() => {
    setViewMin(minTwoTheta);
    setViewMax(maxTwoTheta);
  }, [minTwoTheta, maxTwoTheta]);

  // Mouse hover cursor state for tooltips
  const [hoverCursor, setHoverCursor] = useState<{
    twoTheta: number;
    intensity: number;
    pixelX: number;
    pixelY: number;
    nearestPeak?: ComputedPeakData;
  } | null>(null);

  // Pan dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragStartRange, setDragStartRange] = useState<{ min: number; max: number }>({
    min: minTwoTheta,
    max: maxTwoTheta,
  });

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Chart dimensions in viewBox coordinates
  const svgWidth = 800;
  const svgHeight = isMaximized ? 420 : 280;
  const padding = { top: 38, right: 35, bottom: 45, left: 55 };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  // Max intensity for Y-scale
  const maxY = useMemo(() => {
    // Determine max intensity in current visible viewport
    const visiblePoints = scanPoints.filter(
      (pt) => pt.twoTheta >= viewMin && pt.twoTheta <= viewMax
    );
    if (visiblePoints.length === 0) return 110;
    const maxVal = Math.max(...visiblePoints.map((p) => p.intensity));
    return Math.max(105, Math.ceil(maxVal * 1.12));
  }, [scanPoints, viewMin, viewMax]);

  // Coordinate mapping functions
  const xToPixel = (twoTheta: number): number => {
    const clamped = Math.max(viewMin, Math.min(viewMax, twoTheta));
    return padding.left + ((clamped - viewMin) / (viewMax - viewMin)) * plotWidth;
  };

  const pixelToTwoTheta = (pixelX: number): number => {
    const ratio = (pixelX - padding.left) / plotWidth;
    const clampedRatio = Math.max(0, Math.min(1, ratio));
    return Number((viewMin + clampedRatio * (viewMax - viewMin)).toFixed(3));
  };

  const yToPixel = (intensity: number): number => {
    const clamped = Math.max(0, Math.min(maxY, intensity));
    return padding.top + plotHeight - (clamped / maxY) * plotHeight;
  };

  // Zoom controls
  const handleZoomIn = () => {
    const currentSpan = viewMax - viewMin;
    if (currentSpan <= 5) return; // Min zoom limit
    const center = (viewMin + viewMax) / 2;
    const newSpan = currentSpan * 0.7;
    setViewMin(Math.max(minTwoTheta, Number((center - newSpan / 2).toFixed(2))));
    setViewMax(Math.min(maxTwoTheta, Number((center + newSpan / 2).toFixed(2))));
  };

  const handleZoomOut = () => {
    const currentSpan = viewMax - viewMin;
    const center = (viewMin + viewMax) / 2;
    const newSpan = currentSpan * 1.4;
    const newMin = Math.max(minTwoTheta, Number((center - newSpan / 2).toFixed(2)));
    const newMax = Math.min(maxTwoTheta, Number((center + newSpan / 2).toFixed(2)));
    setViewMin(newMin);
    setViewMax(newMax);
  };

  const handleResetZoom = () => {
    setViewMin(minTwoTheta);
    setViewMax(maxTwoTheta);
  };

  const handlePresetZoom = (rangeMin: number, rangeMax: number) => {
    setViewMin(Math.max(minTwoTheta, rangeMin));
    setViewMax(Math.min(maxTwoTheta, rangeMax));
  };

  // Pan controls
  const handlePan = (direction: 'left' | 'right') => {
    const span = viewMax - viewMin;
    const delta = span * 0.25;
    if (direction === 'left') {
      const newMin = Math.max(minTwoTheta, viewMin - delta);
      const newMax = newMin + span;
      setViewMin(Number(newMin.toFixed(2)));
      setViewMax(Number(newMax.toFixed(2)));
    } else {
      const newMax = Math.min(maxTwoTheta, viewMax + delta);
      const newMin = newMax - span;
      setViewMin(Number(newMin.toFixed(2)));
      setViewMax(Number(newMax.toFixed(2)));
    }
  };

  // Mouse wheel zoom over SVG
  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseRatio = (mouseX - padding.left) / plotWidth;
    const focusTwoTheta = viewMin + mouseRatio * (viewMax - viewMin);

    const zoomFactor = e.deltaY < 0 ? 0.82 : 1.22;
    const currentSpan = viewMax - viewMin;
    const newSpan = currentSpan * zoomFactor;

    if (newSpan < 4 || newSpan > (maxTwoTheta - minTwoTheta) * 1.5) return;

    const newMin = Math.max(minTwoTheta, Number((focusTwoTheta - mouseRatio * newSpan).toFixed(2)));
    const newMax = Math.min(maxTwoTheta, Number((newMin + newSpan).toFixed(2)));

    setViewMin(newMin);
    setViewMax(newMax);
  };

  // Mouse drag to pan
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartRange({ min: viewMin, max: viewMax });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // In plot area
    if (
      mouseX >= padding.left &&
      mouseX <= padding.left + plotWidth &&
      mouseY >= padding.top &&
      mouseY <= padding.top + plotHeight
    ) {
      const currentTwoTheta = pixelToTwoTheta(mouseX);

      // Interpolate intensity at current 2theta from nearest scan points
      const nearestPt = scanPoints.find((p) => Math.abs(p.twoTheta - currentTwoTheta) < 0.1);
      const intensity = nearestPt ? nearestPt.intensity : 0;

      // Find nearest peak within 1.0 deg
      const nearestPeak = peaks
        .filter((p) => p.isObservable && Math.abs(p.twoThetaDeg - currentTwoTheta) < 1.0)
        .sort((a, b) => Math.abs(a.twoThetaDeg - currentTwoTheta) - Math.abs(b.twoThetaDeg - currentTwoTheta))[0];

      setHoverCursor({
        twoTheta: currentTwoTheta,
        intensity,
        pixelX: mouseX,
        pixelY: mouseY,
        nearestPeak,
      });
    } else {
      setHoverCursor(null);
    }

    // Handle dragging
    if (isDragging) {
      const deltaPixels = e.clientX - dragStartX;
      const span = dragStartRange.max - dragStartRange.min;
      const deltaTwoTheta = (deltaPixels / plotWidth) * span;

      let newMin = dragStartRange.min - deltaTwoTheta;
      let newMax = dragStartRange.max - deltaTwoTheta;

      if (newMin < minTwoTheta) {
        newMin = minTwoTheta;
        newMax = minTwoTheta + span;
      }
      if (newMax > maxTwoTheta) {
        newMax = maxTwoTheta;
        newMin = maxTwoTheta - span;
      }

      setViewMin(Number(newMin.toFixed(2)));
      setViewMax(Number(newMax.toFixed(2)));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Click on plot sets probe 2theta
  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    if (mouseX >= padding.left && mouseX <= padding.left + plotWidth) {
      const clickedTwoTheta = pixelToTwoTheta(mouseX);
      onSetProbeTwoTheta(clickedTwoTheta);
    }
  };

  // Build SVG path for continuous diffractogram curve
  const visiblePoints = useMemo(() => {
    return scanPoints.filter((pt) => pt.twoTheta >= viewMin - 1 && pt.twoTheta <= viewMax + 1);
  }, [scanPoints, viewMin, viewMax]);

  const curvePath = useMemo(() => {
    if (visiblePoints.length === 0) return '';
    return visiblePoints.reduce((acc, pt, i) => {
      const x = xToPixel(pt.twoTheta);
      const y = yToPixel(pt.intensity);
      return i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }, '');
  }, [visiblePoints, viewMin, viewMax, maxY]);

  const fillAreaPath = useMemo(() => {
    if (visiblePoints.length === 0) return '';
    const baselineY = padding.top + plotHeight;
    const startX = xToPixel(visiblePoints[0].twoTheta);
    const endX = xToPixel(visiblePoints[visiblePoints.length - 1].twoTheta);
    return `${curvePath} L ${endX.toFixed(1)} ${baselineY} L ${startX.toFixed(1)} ${baselineY} Z`;
  }, [curvePath, visiblePoints, viewMin, viewMax, plotHeight]);

  // Generate 2theta axis ticks
  const xTicks = useMemo(() => {
    const span = viewMax - viewMin;
    let step = 10;
    if (span <= 15) step = 1;
    else if (span <= 30) step = 2;
    else if (span <= 60) step = 5;
    else step = 10;

    const start = Math.ceil(viewMin / step) * step;
    const ticks: number[] = [];
    for (let val = start; val <= viewMax; val += step) {
      ticks.push(Number(val.toFixed(1)));
    }
    return ticks;
  }, [viewMin, viewMax]);

  // Generate Y axis ticks
  const yTicks = useMemo(() => {
    return [0, 25, 50, 75, 100];
  }, []);

  // Probe d-spacing readout
  const probeBragg = calculateBraggsLaw(probeTwoTheta, activeWavelength);

  return (
    <div className="bg-[#091017] border border-purple-500/30 rounded-2xl p-4 sm:p-5 flex flex-col space-y-3 relative shadow-xl">
      {/* Top Header Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#142230]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-semibold bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
            DIFFRACTOGRAM SPECTRUM
          </span>
          <span className="text-xs font-bold text-white tracking-tight hidden sm:inline">
            {materialName}
          </span>
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/20 px-1.5 py-0.5 rounded">
            λ = {activeWavelength} Å ({radiationName.split('(')[0].trim()})
          </span>
        </div>

        {/* Zoom & Pan Toolbar */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          {/* Presets */}
          <div className="hidden md:flex items-center gap-1 mr-1">
            <button
              type="button"
              onClick={() => handlePresetZoom(minTwoTheta, maxTwoTheta)}
              className="px-2 py-1 rounded text-[10px] bg-[#0c1520] border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 cursor-pointer"
            >
              Full
            </button>
            <button
              type="button"
              onClick={() => handlePresetZoom(25, 65)}
              className="px-2 py-1 rounded text-[10px] bg-[#0c1520] border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 cursor-pointer"
            >
              25°-65°
            </button>
            <button
              type="button"
              onClick={() => handlePresetZoom(60, 100)}
              className="px-2 py-1 rounded text-[10px] bg-[#0c1520] border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 cursor-pointer"
            >
              60°-100°
            </button>
          </div>

          {/* Pan Left/Right */}
          <button
            type="button"
            onClick={() => handlePan('left')}
            className="p-1.5 rounded bg-[#0c1520] border border-slate-800 text-slate-300 hover:text-white hover:border-purple-500 transition cursor-pointer"
            title="Pan Left (Shift 2θ lower)"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handlePan('right')}
            className="p-1.5 rounded bg-[#0c1520] border border-slate-800 text-slate-300 hover:text-white hover:border-purple-500 transition cursor-pointer"
            title="Pan Right (Shift 2θ higher)"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Zoom In/Out */}
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded bg-[#0c1520] border border-slate-800 text-slate-300 hover:text-white hover:border-purple-500 transition cursor-pointer"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded bg-[#0c1520] border border-slate-800 text-slate-300 hover:text-white hover:border-purple-500 transition cursor-pointer"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="p-1.5 rounded bg-[#0c1520] border border-slate-800 text-slate-300 hover:text-white hover:border-purple-500 transition cursor-pointer"
            title="Reset Zoom View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Maximize Toggle */}
          {onToggleMaximize && (
            <button
              type="button"
              onClick={onToggleMaximize}
              className="p-1.5 rounded bg-[#0c1520] border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500 transition cursor-pointer ml-1"
              title={isMaximized ? 'Restore View' : 'Maximize Diffractogram View'}
            >
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5 text-cyan-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div
        className={`relative w-full rounded-xl bg-[#060b11] border border-slate-800/90 overflow-hidden select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-crosshair'
        }`}
        style={{ height: isMaximized ? '420px' : '290px' }}
      >
        <svg
          ref={svgRef}
          className="w-full h-full"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="none"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setIsDragging(false);
            setHoverCursor(null);
          }}
          onClick={handleClick}
        >
          <defs>
            {/* Diffractogram Area Gradient */}
            <linearGradient id="spectrumGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#a855f7" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
            </linearGradient>

            {/* Grid Pattern */}
            <pattern id="minorGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#0f1924" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Subtle Background Grid */}
          <rect
            x={padding.left}
            y={padding.top}
            width={plotWidth}
            height={plotHeight}
            fill="url(#minorGrid)"
          />

          {/* Horizontal Gridlines & Y-Axis Labels */}
          {yTicks.map((val) => {
            const y = yToPixel(val);
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + plotWidth}
                  y2={y}
                  stroke="#162536"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="#64748b"
                  className="text-[9px] font-mono"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Y-Axis Label */}
          <text
            x={16}
            y={padding.top + plotHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90, 16, ${padding.top + plotHeight / 2})`}
            fill="#94a3b8"
            className="text-[10px] font-mono font-semibold tracking-wider"
          >
            Relative Intensity I/I₀ (%)
          </text>

          {/* Vertical Gridlines & X-Axis (2θ) Labels */}
          {xTicks.map((val) => {
            const x = xToPixel(val);
            return (
              <g key={val}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + plotHeight}
                  stroke="#162536"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <line
                  x1={x}
                  y1={padding.top + plotHeight}
                  x2={x}
                  y2={padding.top + plotHeight + 5}
                  stroke="#475569"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={padding.top + plotHeight + 17}
                  textAnchor="middle"
                  fill="#94a3b8"
                  className="text-[10px] font-mono"
                >
                  {val}°
                </text>
              </g>
            );
          })}

          {/* X-Axis Main Label */}
          <text
            x={padding.left + plotWidth / 2}
            y={svgHeight - 8}
            textAnchor="middle"
            fill="#cbd5e1"
            className="text-[11px] font-mono font-semibold tracking-wider"
          >
            Diffraction Angle 2θ (degrees)
          </text>

          {/* Main Diffractogram Area Fill */}
          {fillAreaPath && (
            <path d={fillAreaPath} fill="url(#spectrumGradient)" />
          )}

          {/* Main Diffractogram Spectral Curve */}
          {curvePath && (
            <path
              d={curvePath}
              fill="none"
              stroke="#c084fc"
              strokeWidth="1.8"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {/* Observable Peak Markers & Labels */}
          {peaks
            .filter((pk) => pk.isObservable && pk.twoThetaDeg >= viewMin && pk.twoThetaDeg <= viewMax)
            .map((pk) => {
              const x = xToPixel(pk.twoThetaDeg);
              const y = yToPixel(pk.intensityPercent);
              const isSelected = selectedPeakIndex === pk.index;

              return (
                <g
                  key={pk.index}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetProbeTwoTheta(pk.twoThetaDeg);
                    if (onSelectPeakIndex) onSelectPeakIndex(pk.index);
                  }}
                >
                  {/* Vertical indicator line down to baseline */}
                  <line
                    x1={x}
                    y1={y}
                    x2={x}
                    y2={padding.top + plotHeight}
                    stroke={isSelected ? '#38bdf8' : '#7c3aed'}
                    strokeDasharray="2 2"
                    strokeWidth={isSelected ? '1.5' : '1'}
                    className="group-hover:stroke-cyan-400 transition"
                  />

                  {/* Peak Marker Dot */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? '5' : '3.5'}
                    fill={isSelected ? '#38bdf8' : '#a855f7'}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? '1.5' : '1'}
                    className="group-hover:fill-cyan-400 group-hover:scale-125 transition origin-center"
                  />

                  {/* Flag Tag Box with Miller Index */}
                  <g transform={`translate(${x}, ${y - 12})`}>
                    <rect
                      x="-16"
                      y="-11"
                      width="32"
                      height="12"
                      rx="3"
                      fill={isSelected ? '#0369a1' : '#1e1b4b'}
                      stroke={isSelected ? '#38bdf8' : '#a855f7'}
                      strokeWidth="0.8"
                      className="group-hover:fill-cyan-900 group-hover:stroke-cyan-400"
                    />
                    <text
                      x="0"
                      y="-2"
                      textAnchor="middle"
                      fill={isSelected ? '#ffffff' : '#e2e8f0'}
                      className="text-[8px] font-mono font-bold group-hover:fill-white"
                    >
                      {pk.hkl}
                    </text>
                  </g>
                </g>
              );
            })}

          {/* Interactive Active Probe Line */}
          {probeTwoTheta >= viewMin && probeTwoTheta <= viewMax && (
            <g>
              <line
                x1={xToPixel(probeTwoTheta)}
                y1={padding.top}
                x2={xToPixel(probeTwoTheta)}
                y2={padding.top + plotHeight}
                stroke="#06b6d4"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              {/* Top Probe Flag */}
              <polygon
                points={`${xToPixel(probeTwoTheta) - 5},${padding.top - 2} ${xToPixel(probeTwoTheta) + 5},${padding.top - 2} ${xToPixel(probeTwoTheta)},${padding.top + 6}`}
                fill="#06b6d4"
              />
            </g>
          )}

          {/* Hover Crosshair */}
          {hoverCursor && (
            <g>
              <line
                x1={hoverCursor.pixelX}
                y1={padding.top}
                x2={hoverCursor.pixelX}
                y2={padding.top + plotHeight}
                stroke="#94a3b8"
                strokeWidth="0.8"
                strokeDasharray="2 2"
                opacity="0.6"
              />
              <circle
                cx={hoverCursor.pixelX}
                cy={yToPixel(hoverCursor.intensity)}
                r="3.5"
                fill="#38bdf8"
                stroke="#ffffff"
                strokeWidth="1"
              />
            </g>
          )}
        </svg>

        {/* Real-Time Floating Tooltip */}
        {hoverCursor && (
          <div
            className="absolute z-20 pointer-events-none bg-[#0b141e]/95 backdrop-blur-md border border-cyan-500/50 rounded-lg p-2.5 shadow-2xl text-slate-200 font-mono text-[10px] space-y-1 transition-all"
            style={{
              left: `${Math.min(hoverCursor.pixelX + 15, svgWidth - 190)}px`,
              top: `${Math.max(15, hoverCursor.pixelY - 70)}px`,
            }}
          >
            <div className="flex items-center justify-between gap-3 text-cyan-300 font-bold border-b border-slate-800 pb-1">
              <span>2θ = {hoverCursor.twoTheta.toFixed(2)}°</span>
              <span className="text-slate-400 font-normal">θ = {(hoverCursor.twoTheta / 2).toFixed(2)}°</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-slate-300">
              <span>d-spacing:</span>
              <span className="font-bold text-amber-300">
                {calculateBraggsLaw(hoverCursor.twoTheta, activeWavelength).dSpacingAngstrom} Å
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-slate-300">
              <span>Intensity:</span>
              <span className="font-bold text-purple-300">{hoverCursor.intensity.toFixed(1)}%</span>
            </div>
            {hoverCursor.nearestPeak && (
              <div className="pt-1 border-t border-slate-800/80 text-[9px] text-cyan-400 font-semibold">
                ★ Reflection {hoverCursor.nearestPeak.hkl} ({hoverCursor.nearestPeak.phase})
              </div>
            )}
          </div>
        )}

        {/* Legend Overlay at Top Right */}
        <div className="absolute top-2 right-2 flex items-center gap-3 bg-[#070e17]/80 backdrop-blur-sm border border-slate-800 px-2.5 py-1 rounded text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-purple-400 inline-block rounded" />
            <span>Profile Curve</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500 border border-white inline-block" />
            <span>Peak Position</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-0.5 bg-cyan-400 border-t border-cyan-400 border-dashed inline-block" />
            <span>Active Probe</span>
          </div>
        </div>
      </div>

      {/* Active Probe Readout Footer Bar */}
      <div className="bg-[#0b141e] border border-[#142230] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Crosshair className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Interactive Diffraction Probe Line
            </div>
            <div className="text-white font-bold text-sm">
              2θ = {probeTwoTheta.toFixed(2)}° <span className="text-slate-500 text-xs font-normal">| θ = {(probeTwoTheta / 2).toFixed(3)}°</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="bg-[#070e17] px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">d-Spacing</span>
            <span className="text-amber-300 font-bold text-sm">
              {probeBragg.dSpacingAngstrom} Å
            </span>
          </div>

          <div className="bg-[#070e17] px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Scattering Vector Q</span>
            <span className="text-purple-300 font-bold text-sm">
              {((4 * Math.PI * Math.sin(probeBragg.thetaRad)) / activeWavelength).toFixed(3)} Å⁻¹
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400">Jump to 2θ:</span>
            <input
              type="number"
              step="0.1"
              min="5"
              max="160"
              value={probeTwoTheta}
              onChange={(e) => onSetProbeTwoTheta(parseFloat(e.target.value) || minTwoTheta)}
              className="w-20 bg-[#070e17] border border-slate-700 rounded px-2 py-1 text-white font-bold focus:outline-none focus:border-cyan-400 text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
