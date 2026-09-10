import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  BookOpen,
  FileCheck,
  AlertTriangle,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { NDTMethodDetail } from '../../engines/materials/ndtEngine';

interface NDTSafetyStandardsPanelProps {
  method: NDTMethodDetail;
}

export const NDTSafetyStandardsPanel: React.FC<NDTSafetyStandardsPanelProps> = ({ method }) => {
  return (
    <div className="space-y-4">
      {/* Safety Guidelines Card */}
      <div className="bg-[#0b131d] border border-[#162738] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-rose-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            Mandatory Operational Safety Protocols ({method.code})
          </span>
          <span className="text-[10px] font-mono text-slate-500">Personnel & Environmental Safety</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
          {method.safetyGuidelines.map((guide, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-[#140c11] border border-[#2d141e] text-xs text-rose-200 flex items-start gap-2.5"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{guide}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Published Technical Codes & Reference Standards */}
      <div className="bg-[#0b131d] border border-[#162738] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-cyan-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            Published Industrial Codes & Reference Specifications
          </span>
          <span className="text-[10px] font-mono text-slate-500">ASME / ASTM / ISO Consensus</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          {method.referenceCodes.map((codeItem, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-[#0e1724] border border-[#172b3e] text-xs text-slate-300 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-mono font-semibold text-slate-100">{codeItem}</span>
              </div>
              <span className="text-[9px] font-mono uppercase text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                Standard
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Qualification Disclaimer Notice */}
      <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs text-amber-200/90 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block text-amber-300">Personnel Qualification & Certification Boundary:</strong>
          <p className="leading-relaxed text-[11px]">
            This interactive NDT workstation is an educational engineering utility designed for scientific visualization and formula simulation.
            Performing non-destructive examination on pressurized vessels, aerospace components, or structural welds requires certified Level II / Level III personnel qualified under an employer-written practice complying with ASNT SNT-TC-1A, ANSI/ASNT CP-189, or ISO 9712.
          </p>
        </div>
      </div>
    </div>
  );
};
