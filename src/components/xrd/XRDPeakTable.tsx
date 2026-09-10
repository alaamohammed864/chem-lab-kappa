import React, { useState } from 'react';
import { ComputedPeakData } from '../../engines/materials/xrdEngine';
import { Table, Download, Eye, Layers, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface XRDPeakTableProps {
  peaks: ComputedPeakData[];
  selectedPeakIndex: number | null;
  onSelectPeak: (index: number) => void;
  probeTwoTheta: number;
  materialName: string;
  activeWavelength: number;
}

export const XRDPeakTable: React.FC<XRDPeakTableProps> = ({
  peaks,
  selectedPeakIndex,
  onSelectPeak,
  probeTwoTheta,
  materialName,
  activeWavelength,
}) => {
  const [showAllDetails, setShowAllDetails] = useState<boolean>(true);

  // CSV Export handler
  const handleExportCSV = () => {
    const headers = [
      'Peak',
      '2Theta_deg',
      'Ref_2Theta_CuKa',
      'Intensity_pct',
      'Miller_hkl',
      'Phase',
      'd_spacing_A',
      'FWHM_deg',
      'Crystallite_Size_nm',
      'Status',
    ];

    const rows = peaks.map((p) => [
      p.index,
      p.twoThetaDeg.toFixed(2),
      p.referenceTwoTheta.toFixed(2),
      p.intensityPercent.toFixed(1),
      `"${p.hkl}"`,
      `"${p.phase}"`,
      p.dSpacingAngstrom.toFixed(4),
      p.fwhmDeg.toFixed(3),
      p.crystalliteSizeNm ? p.crystalliteSizeNm.toFixed(1) : 'N/A',
      p.isObservable ? 'Observable' : 'Extinguished (λ > 2d)',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `XRD_Peaks_${materialName.replace(/\s+/g, '_')}_${activeWavelength}A.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#0b141e] border border-[#142230] rounded-xl p-4 space-y-3 font-mono text-xs shadow-lg">
      {/* Table Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#142230]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Table className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-white font-bold tracking-tight text-xs uppercase">
              Diffraction Peaks & Indexing Table
            </h4>
            <span className="text-[10px] text-slate-400">
              {peaks.filter((p) => p.isObservable).length} observable reflections indexed (λ = {activeWavelength} Å)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAllDetails(!showAllDetails)}
            className="px-2 py-1 rounded text-[10px] bg-[#070e17] border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            {showAllDetails ? 'Compact' : 'Detailed'}
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] bg-purple-950/80 border border-purple-500/40 text-purple-300 hover:text-white hover:bg-purple-900 transition cursor-pointer"
            title="Download CSV table"
          >
            <Download className="w-3 h-3" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto max-h-60 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider sticky top-0 bg-[#0b141e] z-10">
              <th className="py-2 px-2 font-semibold">#</th>
              <th className="py-2 px-2 font-semibold">2θ Angle</th>
              <th className="py-2 px-2 font-semibold">I / I₀ (%)</th>
              <th className="py-2 px-2 font-semibold">Miller (hkl)</th>
              <th className="py-2 px-2 font-semibold">Phase</th>
              <th className="py-2 px-2 font-semibold">d-Spacing</th>
              {showAllDetails && (
                <>
                  <th className="py-2 px-2 font-semibold">FWHM (β)</th>
                  <th className="py-2 px-2 font-semibold">Crystallite Size D</th>
                  <th className="py-2 px-2 font-semibold">Status</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-[11px]">
            {peaks.map((pk) => {
              const isSelected = selectedPeakIndex === pk.index;
              const isProbeNear = Math.abs(probeTwoTheta - pk.twoThetaDeg) < 0.2;

              return (
                <tr
                  key={pk.index}
                  onClick={() => onSelectPeak(pk.index)}
                  className={`transition cursor-pointer ${
                    isSelected
                      ? 'bg-purple-900/50 text-white font-bold border-l-2 border-purple-400'
                      : isProbeNear
                      ? 'bg-cyan-950/40 text-cyan-200'
                      : 'hover:bg-slate-800/40 text-slate-300'
                  } ${!pk.isObservable ? 'opacity-40 bg-red-950/20' : ''}`}
                >
                  <td className="py-2 px-2 text-slate-500 font-mono text-[10px]">{pk.index}</td>
                  <td className="py-2 px-2 font-mono font-bold text-white">
                    {pk.twoThetaDeg.toFixed(2)}°
                    {activeWavelength !== 1.5406 && (
                      <span className="text-[9px] text-slate-500 block">
                        ref: {pk.referenceTwoTheta.toFixed(2)}°
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-purple-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, pk.intensityPercent)}%` }}
                        />
                      </div>
                      <span className="font-mono text-purple-300">{pk.intensityPercent}%</span>
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <span className="px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-cyan-300 font-bold">
                      {pk.hkl}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-slate-300">{pk.phase}</td>
                  <td className="py-2 px-2 text-amber-300 font-bold">{pk.dSpacingAngstrom.toFixed(4)} Å</td>
                  {showAllDetails && (
                    <>
                      <td className="py-2 px-2 text-slate-400">{pk.fwhmDeg.toFixed(3)}°</td>
                      <td className="py-2 px-2 text-cyan-300 font-bold">
                        {pk.crystalliteSizeNm ? `${pk.crystalliteSizeNm.toFixed(1)} nm` : '—'}
                      </td>
                      <td className="py-2 px-2">
                        {pk.isObservable ? (
                          <span className="inline-flex items-center gap-1 text-[9px] text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] text-amber-400">
                            <AlertCircle className="w-3 h-3" />
                            <span>Extinguished</span>
                          </span>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
