import React, { useState } from 'react';
import {
  AlertOctagon,
  ShieldAlert,
  Search,
  Eye,
  Activity,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { NDTMethodDetail, NDTIndicationExample } from '../../engines/materials/ndtEngine';

interface NDTIndicationsCatalogProps {
  method: NDTMethodDetail;
}

export const NDTIndicationsCatalog: React.FC<NDTIndicationsCatalogProps> = ({ method }) => {
  const [selectedIndicationIndex, setSelectedIndicationIndex] = useState<number>(0);

  const indication: NDTIndicationExample =
    method.indicationExamples[selectedIndicationIndex] || method.indicationExamples[0];

  return (
    <div className="space-y-4">
      {/* Selector Pills */}
      <div className="flex flex-wrap gap-2">
        {method.indicationExamples.map((ind, idx) => {
          const isSelected = idx === selectedIndicationIndex;
          return (
            <button
              key={idx}
              onClick={() => setSelectedIndicationIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? 'bg-rose-950/60 border-rose-500 text-rose-200 shadow-md shadow-rose-950/40'
                  : 'bg-[#0f1924] border-[#1b2b3d] text-slate-300 hover:border-slate-600 hover:bg-[#132232]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                ind.severityClass === 'Critical' ? 'bg-rose-500' :
                ind.severityClass === 'Major' ? 'bg-amber-400' : 'bg-teal-400'
              }`} />
              <span>{ind.name}</span>
            </button>
          );
        })}
      </div>

      {/* Indication Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Graphic Representation / Diagram (5 cols) */}
        <div className="lg:col-span-5 bg-[#0b131d] border border-[#162738] rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="text-[10px] font-mono uppercase text-rose-400 font-semibold flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                SIGNAL / PATTERN DISPLAY
              </span>
              <span className="text-[10px] font-mono text-slate-500">Method: {method.code}</span>
            </div>

            {/* SVG Visual Display */}
            <div className="w-full h-44 bg-[#080d14] rounded-lg border border-[#152332] overflow-hidden flex items-center justify-center p-2 relative">
              <svg viewBox="0 0 300 160" className="w-full h-full">
                {/* Method Specific SVG Canvas */}
                {method.code === 'UT' && (
                  <>
                    {/* A-scan oscilloscope display */}
                    <rect x="10" y="10" width="280" height="140" fill="#04070b" stroke="#1e293b" />
                    {/* Grid lines */}
                    <line x1="10" y1="80" x2="290" y2="80" stroke="#142232" strokeDasharray="3,3" />
                    <line x1="80" y1="10" x2="80" y2="150" stroke="#142232" strokeDasharray="3,3" />
                    <line x1="150" y1="10" x2="150" y2="150" stroke="#142232" strokeDasharray="3,3" />
                    <line x1="220" y1="10" x2="220" y2="150" stroke="#142232" strokeDasharray="3,3" />
                    {/* Initial pulse */}
                    <path d="M 20 140 L 30 140 L 35 30 L 40 140 L 130 140" fill="none" stroke="#22c55e" strokeWidth="2" />
                    {/* Flaw echo */}
                    <path d="M 130 140 L 138 140 L 145 60 L 152 140 L 250 140" fill="none" stroke="#f43f5e" strokeWidth="2" />
                    {/* Backwall echo */}
                    <path d="M 250 140 L 258 140 L 265 40 L 272 140 L 285 140" fill="none" stroke="#22c55e" strokeWidth="2" />
                    <text x="30" y="24" fill="#22c55e" fontSize="9" fontFamily="monospace">Initial</text>
                    <text x="135" y="52" fill="#f43f5e" fontSize="10" fontWeight="bold" fontFamily="monospace">FLAW ECHO</text>
                    <text x="245" y="32" fill="#22c55e" fontSize="9" fontFamily="monospace">Backwall</text>
                  </>
                )}

                {method.code === 'RT' && (
                  <>
                    {/* Radiographic Film Dark Negative View */}
                    <rect x="10" y="10" width="280" height="140" fill="#334155" stroke="#475569" />
                    {/* Weld bead contour */}
                    <rect x="10" y="50" width="280" height="60" fill="#475569" />
                    <text x="20" y="42" fill="#cbd5e1" fontSize="9" fontFamily="monospace">Base Metal</text>
                    <text x="20" y="85" fill="#f1f5f9" fontSize="10" fontWeight="bold" fontFamily="monospace">WELD SEAM</text>
                    {/* Flaw Indication: dark linear feature for lack of fusion or crack */}
                    <path d="M 110 80 Q 150 78, 190 82" stroke="#020617" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="210" cy="72" r="3" fill="#020617" />
                    <circle cx="225" cy="85" r="4" fill="#020617" />
                    <text x="120" y="102" fill="#020617" fontSize="9" fontWeight="bold" fontFamily="monospace">
                      Radiographic Defect Shadow
                    </text>
                  </>
                )}

                {method.code === 'PT' && (
                  <>
                    {/* White Developer Background with Crimson Dye Bleed */}
                    <rect x="10" y="10" width="280" height="140" fill="#e2e8f0" stroke="#cbd5e1" />
                    <text x="20" y="30" fill="#64748b" fontSize="9" fontFamily="monospace">White Developer Coating</text>
                    {/* Red Dye Bleedout Crack */}
                    <path d="M 90 75 Q 140 70, 200 85" stroke="#e11d48" strokeWidth="5" strokeLinecap="round" opacity="0.85" />
                    <path d="M 120 73 L 135 55" stroke="#e11d48" strokeWidth="3.5" strokeLinecap="round" opacity="0.85" />
                    <circle cx="160" cy="78" r="8" fill="#e11d48" opacity="0.3" />
                    <text x="95" y="110" fill="#be123c" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      Crimson Penetrant Bleed-Out Halo
                    </text>
                  </>
                )}

                {method.code === 'MT' && (
                  <>
                    {/* Steel surface with black magnetic powder accumulation */}
                    <rect x="10" y="10" width="280" height="140" fill="#1e293b" />
                    <text x="20" y="30" fill="#94a3b8" fontSize="9" fontFamily="monospace">Ferromagnetic Steel Part</text>
                    {/* Magnetic Flux Lines */}
                    <line x1="20" y1="80" x2="280" y2="80" stroke="#3b82f6" strokeWidth="1" strokeDasharray="5,5" />
                    <text x="210" y="72" fill="#60a5fa" fontSize="8" fontFamily="monospace">Magnetic Flux Φ</text>
                    {/* Transverse Crack with Powder Ridge */}
                    <line x1="150" y1="50" x2="150" y2="110" stroke="#000000" strokeWidth="5" />
                    <line x1="148" y1="48" x2="148" y2="112" stroke="#f59e0b" strokeWidth="2" />
                    <line x1="152" y1="48" x2="152" y2="112" stroke="#f59e0b" strokeWidth="2" />
                    <text x="80" y="135" fill="#f59e0b" fontSize="9" fontWeight="bold" fontFamily="monospace">
                      Magnetic Particle Accumulation
                    </text>
                  </>
                )}

                {method.code === 'ET' && (
                  <>
                    {/* Impedance Plane Complex Diagram */}
                    <rect x="10" y="10" width="280" height="140" fill="#050a10" stroke="#1e293b" />
                    <line x1="150" y1="10" x2="150" y2="150" stroke="#334155" />
                    <line x1="10" y1="80" x2="290" y2="80" stroke="#334155" />
                    <text x="270" y="75" fill="#64748b" fontSize="8">R</text>
                    <text x="155" y="22" fill="#64748b" fontSize="8">X_L</text>
                    {/* Liftoff Curve */}
                    <path d="M 150 80 Q 120 70, 70 65" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3,3" />
                    <text x="75" y="60" fill="#64748b" fontSize="8">Lift-off</text>
                    {/* Flaw Signal Figure-8 Loop */}
                    <path d="M 150 80 C 180 50, 200 40, 210 60 C 220 80, 170 100, 150 80 Z" fill="none" stroke="#38bdf8" strokeWidth="2" />
                    <text x="180" y="115" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
                      Defect Impedance Vector
                    </text>
                  </>
                )}

                {method.code === 'VT' && (
                  <>
                    <rect x="10" y="10" width="280" height="140" fill="#182230" />
                    <path d="M 30 110 L 150 40 L 270 110" stroke="#64748b" strokeWidth="3" fill="none" />
                    <circle cx="150" cy="40" r="6" fill="#f43f5e" />
                    <text x="60" y="130" fill="#cbd5e1" fontSize="9" fontFamily="monospace">
                      Visible Surface Crack / Undercut
                    </text>
                  </>
                )}
              </svg>
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#0e1724] border border-[#172739] text-xs space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
              Root Cause Mechanism:
            </span>
            <p className="text-slate-300 leading-relaxed text-[11px]">{indication.rootCause || indication.probableCause}</p>
          </div>
        </div>

        {/* Right: Technical Details, Visual Signature & Evaluation (7 cols) */}
        <div className="lg:col-span-7 bg-[#0b131d] border border-[#162738] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="text-base font-bold text-white">{indication.name || indication.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{indication.description || indication.defectType}</p>
            </div>
            {(() => {
              const severity = indication.severityClass || (indication.criticality.includes('Rejectable') ? 'Critical' : indication.criticality.includes('Marginal') ? 'Major' : 'Minor');
              return (
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                  severity === 'Critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                  severity === 'Major' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                  'bg-teal-950 text-teal-300 border border-teal-800'
                }`}>
                  {severity} Severity
                </span>
              );
            })()}
          </div>

          {/* Visual Presentation / Signal Pattern */}
          <div className="p-3 rounded-lg bg-[#0e1622] border border-[#16293d] space-y-1">
            <span className="text-[10px] font-mono uppercase text-cyan-400 font-semibold block">
              Inspection Signal / Image Pattern:
            </span>
            <p className="text-xs text-slate-200 leading-relaxed font-mono">
              {indication.typicalAppearance || indication.visualAppearance}
            </p>
          </div>

          {/* Evaluation & Acceptance Hint */}
          <div className="p-3 rounded-lg bg-[#0d1f19] border border-[#123d30] space-y-1">
            <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold block flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              Standard Code Evaluation & Acceptance Guidance:
            </span>
            <p className="text-xs text-emerald-200 leading-relaxed">
              {indication.evaluationGuidance || indication.criticality}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
