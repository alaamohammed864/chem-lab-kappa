import React from 'react';
import {
  Wrench,
  Cpu,
  Radio,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { NDTMethodDetail } from '../../engines/materials/ndtEngine';

interface NDTEquipmentPanelProps {
  method: NDTMethodDetail;
}

export const NDTEquipmentPanel: React.FC<NDTEquipmentPanelProps> = ({ method }) => {
  return (
    <div className="space-y-4">
      <div className="bg-[#0b131d] border border-[#162738] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
            <Wrench className="w-4 h-4 text-cyan-400" />
            Standard Instrument & Transducer Concepts
          </span>
          <span className="text-[10px] font-mono text-slate-500">Method: {method.code}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {method.equipmentConcepts.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#0f1a26] border border-[#182d42] rounded-lg p-3 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>{item.name}</span>
                  </h4>
                  <span className="text-[9px] font-mono uppercase text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                    Concept
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] font-mono uppercase text-cyan-400 block mb-0.5">
                  Typical Operating Range / Specifications:
                </span>
                <span className="text-xs font-mono font-bold text-slate-200">{item.typicalSpecs}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
