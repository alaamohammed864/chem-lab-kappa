import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Eye,
  Radio,
  Layers,
  Sparkles,
  Zap,
  ShieldCheck,
  AlertCircle,
  Info,
} from 'lucide-react';
import { NDTMethodDetail } from '../../engines/materials/ndtEngine';

interface NDTMethodOverviewProps {
  method: NDTMethodDetail;
}

export const NDTMethodOverview: React.FC<NDTMethodOverviewProps> = ({ method }) => {
  return (
    <div className="space-y-4">
      {/* Header Profile Card */}
      <div className="bg-[#0b131d] border border-[#162738] rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-white font-mono">{method.code}</span>
              <span className="text-slate-500 font-mono text-sm">/</span>
              <h3 className="text-base font-bold text-slate-100">{method.name}</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{method.summary}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
              method.category === 'Volumetric'
                ? 'bg-indigo-950 text-indigo-300 border border-indigo-700'
                : method.category === 'Electromagnetic'
                ? 'bg-amber-950 text-amber-300 border border-amber-700'
                : 'bg-teal-950 text-teal-300 border border-teal-700'
            }`}>
              {method.category} Inspection
            </span>
          </div>
        </div>

        {/* Physics Principle Callout */}
        <div className="p-3 rounded-lg bg-[#0e1724] border border-[#182a3d] space-y-1.5">
          <span className="text-[10px] font-mono uppercase text-cyan-400 font-semibold flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5" />
            Underlying Physical Principle
          </span>
          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            {method.principle}
          </p>
        </div>
      </div>

      {/* Advantages vs Limitations 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Advantages */}
        <div className="bg-[#0b131d] border border-[#162738] rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider font-mono">
            <CheckCircle2 className="w-4 h-4" />
            <span>Key Operational Advantages</span>
          </div>
          <div className="space-y-2">
            {method.advantages.map((adv, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-[#0a1b15] border border-[#103426] text-xs text-emerald-200 flex items-start gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>{adv}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Limitations */}
        <div className="bg-[#0b131d] border border-[#162738] rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider font-mono">
            <XCircle className="w-4 h-4" />
            <span>Operational & Physical Limitations</span>
          </div>
          <div className="space-y-2">
            {method.limitations.map((lim, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-[#1a0f14] border border-[#38121f] text-xs text-rose-200 flex items-start gap-2"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                <span>{lim}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
