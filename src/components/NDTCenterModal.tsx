import React, { useState } from 'react';
import {
  X,
  Radio,
  Eye,
  Layers,
  Sparkles,
  Zap,
  Activity,
  Calculator,
  Wrench,
  Search,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import {
  NDT_METHODS,
  NDTMethodDetail,
} from '../engines/materials/ndtEngine';
import { NDTMethodOverview } from './ndt/NDTMethodOverview';
import { NDTPhysicsCalculator } from './ndt/NDTPhysicsCalculator';
import { NDTEquipmentPanel } from './ndt/NDTEquipmentPanel';
import { NDTIndicationsCatalog } from './ndt/NDTIndicationsCatalog';
import { NDTSafetyStandardsPanel } from './ndt/NDTSafetyStandardsPanel';

interface NDTCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type NDTSubTab = 'overview' | 'physics' | 'equipment' | 'indications' | 'safety';

export const NDTCenterModal: React.FC<NDTCenterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedMethodKey, setSelectedMethodKey] = useState<'VT' | 'PT' | 'MT' | 'UT' | 'RT' | 'ET'>('UT');
  const [activeTab, setActiveTab] = useState<NDTSubTab>('overview');

  if (!isOpen) return null;

  const currentMethod: NDTMethodDetail = NDT_METHODS[selectedMethodKey] || NDT_METHODS['UT'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#070d14] border border-[#1b2b3d] w-full max-w-6xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-[#162738] bg-gradient-to-r from-[#0b1420] via-[#0e1a2b] to-[#0b1420] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Non-Destructive Testing (NDT) Center
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-semibold">
                  Inspection Engineering Center
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Acoustic, radiographic, electromagnetic & optical defect evaluation workstation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
            title="Close NDT Center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Qualification Notice */}
        <div className="bg-gradient-to-r from-cyan-950/30 via-indigo-950/20 to-transparent border-b border-cyan-900/30 px-5 py-2 flex items-center justify-between text-xs text-cyan-200/90">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong>Educational Guide:</strong> Formulations and indications reference ASME BPVC Section V, ASTM, and ISO 9712 consensus standards. Inspection of live pressure equipment requires formally qualified Level II/III personnel.
            </span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400/70 shrink-0 hidden md:inline">
            6 Core Methods Supported
          </span>
        </div>

        {/* Primary Method Selector Bar (VT, PT, MT, UT, RT, ET) */}
        <div className="px-5 py-2.5 bg-[#09111b] border-b border-[#142232] flex items-center gap-2 overflow-x-auto">
          {(['VT', 'PT', 'MT', 'UT', 'RT', 'ET'] as const).map((code) => {
            const isSelected = selectedMethodKey === code;
            const method = NDT_METHODS[code];
            return (
              <button
                key={code}
                onClick={() => setSelectedMethodKey(code)}
                className={`px-3 py-1.5 rounded-lg transition border cursor-pointer flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-md shadow-indigo-950/50'
                    : 'bg-[#0e1724] border-[#18283a] text-slate-300 hover:border-slate-600 hover:bg-[#121f2f]'
                }`}
              >
                <span className="font-mono font-bold text-xs">{code}</span>
                <span className="text-xs text-slate-300 truncate max-w-[120px]">{(method.fullName || method.shortName).split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-[#142232] bg-[#070e17] overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-t-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer border-b-2 ${
              activeTab === 'overview'
                ? 'bg-[#0d1a27] text-indigo-300 border-indigo-500 font-bold'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Overview & Principles</span>
          </button>

          <button
            onClick={() => setActiveTab('physics')}
            className={`px-3.5 py-2 rounded-t-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer border-b-2 ${
              activeTab === 'physics'
                ? 'bg-[#0d1a27] text-cyan-300 border-cyan-500 font-bold'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Physics & Formulation Solver</span>
          </button>

          <button
            onClick={() => setActiveTab('equipment')}
            className={`px-3.5 py-2 rounded-t-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer border-b-2 ${
              activeTab === 'equipment'
                ? 'bg-[#0d1a27] text-teal-300 border-teal-500 font-bold'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Instrumentation Concepts</span>
          </button>

          <button
            onClick={() => setActiveTab('indications')}
            className={`px-3.5 py-2 rounded-t-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer border-b-2 ${
              activeTab === 'indications'
                ? 'bg-[#0d1a27] text-rose-300 border-rose-500 font-bold'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Flaw & Indication Examples</span>
          </button>

          <button
            onClick={() => setActiveTab('safety')}
            className={`px-3.5 py-2 rounded-t-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer border-b-2 ${
              activeTab === 'safety'
                ? 'bg-[#0d1a27] text-amber-300 border-amber-500 font-bold'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Safety Protocols & Standards</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'overview' && (
            <NDTMethodOverview method={currentMethod} />
          )}

          {activeTab === 'physics' && (
            <NDTPhysicsCalculator methodCode={selectedMethodKey} />
          )}

          {activeTab === 'equipment' && (
            <NDTEquipmentPanel method={currentMethod} />
          )}

          {activeTab === 'indications' && (
            <NDTIndicationsCatalog method={currentMethod} />
          )}

          {activeTab === 'safety' && (
            <NDTSafetyStandardsPanel method={currentMethod} />
          )}
        </div>

        {/* Footer Status Bar */}
        <div className="px-5 py-2.5 border-t border-[#142232] bg-[#060b12] flex items-center justify-between text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
              Method: <strong>{currentMethod.shortName} ({currentMethod.fullName})</strong>
            </span>
            <span>·</span>
            <span>Inspection Category: {currentMethod.category}</span>
          </div>

          <div className="text-[11px] text-slate-400">
            Reference Codes: <strong className="text-cyan-400">{currentMethod.referenceCodes[0]}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
