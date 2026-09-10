import React from 'react';
import {
  calculateBraggsLaw,
  calculateScherrerCrystalliteSize,
} from '../../engines/materials/xrdEngine';
import { XRDPatternData } from '../../types';
import { Sparkles, Activity, ShieldAlert, BookOpen, Layers, Check } from 'lucide-react';

interface XRDAnalysisCardProps {
  probeTwoTheta: number;
  activeWavelength: number;
  sample: XRDPatternData;
  shapeFactorK: number;
  instrumentalBroadening: number;
}

export const XRDAnalysisCard: React.FC<XRDAnalysisCardProps> = ({
  probeTwoTheta,
  activeWavelength,
  sample,
  shapeFactorK,
  instrumentalBroadening,
}) => {
  // Bragg relationship calculation
  const bragg = calculateBraggsLaw(probeTwoTheta, activeWavelength);

  // Approximate representative FWHM around probe angle
  const nearestPeak = sample.peaks.find(
    (p) => Math.abs(p.twoTheta - probeTwoTheta) < 2.0
  );
  const sampleFWHM = nearestPeak?.fwhm || 0.22;

  // Scherrer calculation
  const scherrer = calculateScherrerCrystalliteSize(
    probeTwoTheta,
    sampleFWHM,
    activeWavelength,
    shapeFactorK,
    instrumentalBroadening
  );

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Bragg's Law & Scherrer Solver Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bragg's Law Solver Card */}
        <div className="bg-[#0b141e] border border-purple-500/30 rounded-xl p-4 space-y-3 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-[#142230]">
            <div className="flex items-center gap-1.5 text-purple-300 font-bold uppercase tracking-wider text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Bragg's Law Solver</span>
            </div>
            <span className="text-[10px] text-slate-400">λ = 2d sin θ</span>
          </div>

          <div className="space-y-2">
            <div className="p-2.5 bg-[#070e17] rounded-lg border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase">Interplanar Lattice Spacing (d)</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-300 font-mono">
                  {bragg.dSpacingAngstrom}
                </span>
                <span className="text-xs text-slate-400">Å (10⁻¹⁰ m)</span>
              </div>
              <div className="text-[9px] text-slate-500">
                d = {activeWavelength} / (2 × sin({(probeTwoTheta / 2).toFixed(3)}°))
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-[#070e17] p-2 rounded border border-slate-800">
                <span className="text-slate-500 block">Diffraction Angle (2θ):</span>
                <span className="font-bold text-white text-xs">{probeTwoTheta.toFixed(3)}°</span>
              </div>
              <div className="bg-[#070e17] p-2 rounded border border-slate-800">
                <span className="text-slate-500 block">Bragg Angle (θ):</span>
                <span className="font-bold text-cyan-300 text-xs">{(probeTwoTheta / 2).toFixed(3)}°</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scherrer Crystallite Size Card */}
        <div className="bg-[#0b141e] border border-cyan-500/30 rounded-xl p-4 space-y-3 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-[#142230]">
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold uppercase tracking-wider text-[11px]">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Scherrer Crystallite Size</span>
            </div>
            <span className="text-[10px] text-slate-400">D = Kλ / (β cos θ)</span>
          </div>

          <div className="space-y-2">
            <div className="p-2.5 bg-[#070e17] rounded-lg border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase">Estimated Mean Crystallite Domain (D)</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-cyan-300 font-mono">
                  {scherrer.crystalliteSizeNm.toFixed(1)}
                </span>
                <span className="text-xs text-slate-400">nm ({scherrer.crystalliteSizeAngstrom.toFixed(0)} Å)</span>
              </div>
              <div className="text-[9px] text-slate-500">
                Net sample broadening β = {scherrer.fwhmCorrectedRad.toFixed(5)} rad ({sampleFWHM}° FWHM - {instrumentalBroadening}° inst)
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-[#070e17] p-2 rounded border border-slate-800">
                <span className="text-slate-500 block">Shape Factor K:</span>
                <span className="font-bold text-white text-xs">{shapeFactorK}</span>
              </div>
              <div className="bg-[#070e17] p-2 rounded border border-slate-800">
                <span className="text-slate-500 block">Instrumental β_inst:</span>
                <span className="font-bold text-slate-300 text-xs">{instrumentalBroadening}°</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assumptions & Scientific Limitations Banner */}
      <div className="bg-[#0c1520] border border-slate-800 rounded-xl p-4 space-y-3 text-slate-300 text-[11px]">
        <div className="flex items-center gap-2 text-amber-400 font-semibold uppercase tracking-wider text-[11px]">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Scientific Assumptions & Physical Boundaries</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px]">
          <div className="space-y-1.5 bg-[#070e17] p-2.5 rounded border border-slate-800/80">
            <div className="font-bold text-slate-200">Physical Assumptions:</div>
            <ul className="space-y-1 text-slate-400 list-disc list-inside">
              {scherrer.assumptions.map((assump, i) => (
                <li key={i}>{assump}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-1.5 bg-[#070e17] p-2.5 rounded border border-slate-800/80">
            <div className="font-bold text-slate-200">Applicability Limitations:</div>
            <ul className="space-y-1 text-slate-400 list-disc list-inside">
              {scherrer.limitations.map((lim, i) => (
                <li key={i}>{lim}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Provenance & Demonstration Disclaimer */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>
              <strong>Reference Source:</strong> {sample.dataSource || 'ICDD Powder Diffraction File / Materials Science Reference Library'}
            </span>
          </div>
          <div className="text-amber-400/90 font-mono text-[9px] bg-amber-950/30 border border-amber-500/20 px-2 py-0.5 rounded">
            DEMONSTRATION & KINEMATIC SIMULATION DATASET
          </div>
        </div>
      </div>
    </div>
  );
};
