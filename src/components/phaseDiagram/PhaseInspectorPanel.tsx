// Phase Diagram Inspector Panel with Lever Rule and Microstructural Analysis
// Provides sliders, numeric inputs, phase fraction calculation, and simulated microscopic metallography

import React from 'react';
import {
  BinaryPhaseSystem,
  PhaseEvaluationResult,
} from '../../engines/materials/phaseDiagramEngine';
import { Sliders, Scale, Layers, Microscope, Info, HelpCircle, FileText } from 'lucide-react';

interface PhaseInspectorPanelProps {
  system: BinaryPhaseSystem;
  selectedX: number;
  selectedT: number;
  onSelectPoint: (x: number, t: number) => void;
  evaluation: PhaseEvaluationResult;
}

export const PhaseInspectorPanel: React.FC<PhaseInspectorPanelProps> = ({
  system,
  selectedX,
  selectedT,
  onSelectPoint,
  evaluation,
}) => {
  const xMin = system.compositionRange.min;
  const xMax = system.compositionRange.max;
  const tMin = system.temperatureRange.min;
  const tMax = system.temperatureRange.max;

  const tieLine = evaluation.tieLine;

  return (
    <div className="space-y-4">
      {/* 1. Sliders & Numeric Controls */}
      <div className="p-4 bg-[#0a141e] rounded-xl border border-[#162738] space-y-3.5">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-white uppercase">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Operating State Controls</span>
          </div>
          <div className="text-[10px] text-slate-400 font-normal">
            Click diagram or adjust sliders
          </div>
        </div>

        {/* Composition Input */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono mb-1">
            <span className="text-slate-400">Composition (X₀):</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.1"
                min={xMin}
                max={xMax}
                value={selectedX}
                onChange={(e) =>
                  onSelectPoint(
                    Math.max(xMin, Math.min(xMax, parseFloat(e.target.value) || xMin)),
                    selectedT
                  )
                }
                className="w-20 bg-[#060c14] border border-[#1a2d40] rounded px-2 py-0.5 text-right font-bold text-cyan-300 focus:outline-none"
              />
              <span className="text-slate-400 text-xs font-bold">wt%</span>
            </div>
          </div>
          <input
            type="range"
            min={xMin}
            max={xMax}
            step={0.1}
            value={selectedX}
            onChange={(e) => onSelectPoint(parseFloat(e.target.value), selectedT)}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
          />
        </div>

        {/* Temperature Input */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono mb-1">
            <span className="text-slate-400">Temperature (T₀):</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="1"
                min={tMin}
                max={tMax}
                value={selectedT}
                onChange={(e) =>
                  onSelectPoint(
                    selectedX,
                    Math.max(tMin, Math.min(tMax, parseFloat(e.target.value) || tMin))
                  )
                }
                className="w-20 bg-[#060c14] border border-[#1a2d40] rounded px-2 py-0.5 text-right font-bold text-amber-300 focus:outline-none"
              />
              <span className="text-slate-400 text-xs font-bold">°C</span>
            </div>
          </div>
          <input
            type="range"
            min={tMin}
            max={tMax}
            step={1}
            value={selectedT}
            onChange={(e) => onSelectPoint(selectedX, parseFloat(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
          />
        </div>
      </div>

      {/* 2. Active Phase State Readout */}
      <div className="p-4 bg-[#0a141e] rounded-xl border border-[#162738] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Equilibrium Phase State</span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
              evaluation.isTwoPhase
                ? 'bg-purple-950 text-purple-300 border border-purple-800/60'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
            }`}
          >
            {evaluation.isTwoPhase ? 'Two-Phase Mixture' : 'Single Phase'}
          </span>
        </div>

        <div className="text-lg font-mono font-bold text-white flex items-center gap-2">
          <span className="text-cyan-300">{evaluation.activeRegion.phaseLabel}</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-[#060d16] p-2.5 rounded-lg border border-[#142334]">
          {evaluation.microstructureDescription}
        </p>
      </div>

      {/* 3. Lever Rule Calculation Panel (When Two-Phase) */}
      {tieLine ? (
        <div className="p-4 bg-[#0b1622] rounded-xl border border-purple-500/30 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-300 uppercase">
            <Scale className="w-4 h-4 text-purple-400" />
            <span>Lever Rule Phase Fractions (T = {tieLine.temperatureC}°C)</span>
          </div>

          {/* Phase Comparison Bars */}
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300 font-bold">
                  {tieLine.leftPhaseName} (C₁ = {tieLine.leftComposition} wt%)
                </span>
                <span className="text-teal-300 font-bold">
                  {(tieLine.leftPhaseFraction * 100).toFixed(1)}% mass
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-300"
                  style={{ width: `${tieLine.leftPhaseFraction * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-300 font-bold">
                  {tieLine.rightPhaseName} (C₂ = {tieLine.rightComposition} wt%)
                </span>
                <span className="text-amber-300 font-bold">
                  {(tieLine.rightPhaseFraction * 100).toFixed(1)}% mass
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-rose-400 rounded-full transition-all duration-300"
                  style={{ width: `${tieLine.rightPhaseFraction * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Step-by-Step Mathematical Lever Rule Breakdown */}
          <div className="p-2.5 bg-[#050b12] rounded-lg border border-[#15273a] text-[11px] font-mono space-y-1">
            <div className="text-slate-500 uppercase text-[9px]">Lever Rule Formula:</div>
            <div className="text-slate-300">{tieLine.leverRuleFormula}</div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-[#0a141e] rounded-xl border border-[#162738] space-y-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase">
            <Layers className="w-4 h-4" />
            <span>Single Phase Homogeneity</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            All elements are completely mutually dissolved. 100% of the material constitutes the {evaluation.activeRegion.phaseLabel} phase at composition X₀ = {selectedX.toFixed(1)} wt%.
          </p>
        </div>
      )}

      {/* 4. Microstructural Metallography Simulation */}
      <div className="p-4 bg-[#0a141e] rounded-xl border border-[#162738] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase">
            <Microscope className="w-4 h-4 text-cyan-400" />
            <span>Simulated Microstructure (Optical 500×)</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Schematic metallography</span>
        </div>

        <div className="w-full h-28 bg-[#050a10] rounded-lg border border-[#142334] flex items-center justify-center overflow-hidden relative">
          {/* Microstructure Graphic Representation */}
          {evaluation.activeRegion.id.includes('liquid') && !evaluation.isTwoPhase ? (
            // Pure molten liquid
            <div className="w-full h-full bg-gradient-to-tr from-cyan-950/60 to-blue-900/40 flex items-center justify-center text-xs font-mono text-cyan-300">
              [Uniform Molten Liquid Bath - No Grain Boundaries]
            </div>
          ) : evaluation.isTwoPhase && evaluation.activeRegion.phases.includes('L') ? (
            // Dendritic solid in liquid
            <svg className="w-full h-full" viewBox="0 0 240 100">
              <rect width="240" height="100" fill="#081b2c" />
              {/* Liquid background */}
              <text x="120" y="20" textAnchor="middle" fill="#38bdf8" fontSize="10" fontFamily="monospace">
                Liquid Solution (L)
              </text>
              {/* Solid Dendrite branches */}
              <path
                d="M 40 50 L 80 50 M 60 30 L 60 70 M 50 40 L 70 60 M 150 60 L 190 60 M 170 40 L 170 80"
                stroke="#a855f7"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <text x="170" y="92" textAnchor="middle" fill="#c084fc" fontSize="9" fontFamily="monospace">
                Primary Solid Dendrites ({evaluation.phasesPresent[0]})
              </text>
            </svg>
          ) : evaluation.isTwoPhase ? (
            // Lamellar Eutectic or Two-Phase grains
            <svg className="w-full h-full" viewBox="0 0 240 100">
              <rect width="240" height="100" fill="#0c1622" />
              {/* Alternating lamellae */}
              {[15, 35, 55, 75, 95, 115, 135, 155, 175, 195, 215].map((lx, idx) => (
                <rect
                  key={idx}
                  x={lx}
                  y="15"
                  width="10"
                  height="70"
                  fill={idx % 2 === 0 ? '#14b8a6' : '#f59e0b'}
                  rx="1"
                  opacity="0.85"
                />
              ))}
              <text x="120" y="95" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                Fine Alternating Lamellae ({evaluation.phasesPresent.join(' + ')})
              </text>
            </svg>
          ) : (
            // Single phase polycrystalline grains
            <svg className="w-full h-full" viewBox="0 0 240 100">
              <rect width="240" height="100" fill="#06121a" />
              {/* Polygonal grain boundaries */}
              <path
                d="M 10 10 L 60 25 L 90 70 L 40 85 Z M 60 25 L 140 15 L 160 65 L 90 70 Z M 140 15 L 220 30 L 210 80 L 160 65 Z"
                fill="#0d2330"
                stroke="#2dd4bf"
                strokeWidth="1.5"
              />
              <text x="120" y="45" textAnchor="middle" fill="#5eead4" fontSize="10" fontFamily="monospace" fontWeight="bold">
                Equiaxed {evaluation.activeRegion.phaseLabel} Grains
              </text>
            </svg>
          )}
        </div>
      </div>

      {/* 5. Gibbs Phase Rule Note */}
      <div className="p-3 bg-[#081018] rounded-lg border border-[#142332] text-[11px] font-mono text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5 text-slate-300 font-bold">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Thermodynamic Degrees of Freedom</span>
        </div>
        <div>{evaluation.coolingBehaviorNotes}</div>
      </div>
    </div>
  );
};
