import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  Layers,
  Waves,
  Calculator,
  Zap,
  BookOpen,
  Info,
  Flame,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { CorrosionMaterialSelector } from './corrosion/CorrosionMaterialSelector';
import { CorrosionEnvironmentComparison } from './corrosion/CorrosionEnvironmentComparison';
import { CorrosionMechanismsExplorer } from './corrosion/CorrosionMechanismsExplorer';
import { CorrosionRateCalculator } from './corrosion/CorrosionRateCalculator';
import { CorrosionGalvanicMatrix } from './corrosion/CorrosionGalvanicMatrix';

interface CorrosionLabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CorrosionTab = 'materials' | 'environments' | 'mechanisms' | 'rates' | 'galvanic';

export const CorrosionLabModal: React.FC<CorrosionLabModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<CorrosionTab>('materials');
  const [selectedAlloyId, setSelectedAlloyId] = useState<string>('ss-316l');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#070d14] border border-[#1b2b3d] w-full max-w-6xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-[#162738] bg-gradient-to-r from-[#0b1420] via-[#0e1a2b] to-[#0b1420] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Corrosion Science & Material Degradation Laboratory
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-rose-950/80 text-rose-300 border border-rose-800/60 font-semibold">
                  Engineering Educational Lab
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Electrochemical kinetics, PREN resistance, galvanic couple dynamics & localized attack mechanisms
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
            title="Close Laboratory"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Educational Safety Banner */}
        <div className="bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-transparent border-b border-amber-800/30 px-5 py-2 flex items-center justify-between text-xs text-amber-200/90">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Engineering Notice:</strong> Corrosion data and electrochemical calculations are educational models. Do not use for hazardous chemical containment or life-critical pipeline design without empirical coupon testing per ASTM G1/G31 and NACE MR0175.
            </span>
          </div>
          <span className="text-[10px] font-mono text-amber-400/70 shrink-0 hidden md:inline">
            ISO 15156 / ASTM G48 Grounded
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-[#142232] bg-[#09111b] overflow-x-auto">
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-3.5 py-2 rounded-t-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer border-b-2 ${
              activeTab === 'materials'
                ? 'bg-[#0f1d2c] text-rose-300 border-rose-500 font-bold'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Material Selection & PREN</span>
          </button>

          <button
            onClick={() => setActiveTab('environments')}
            className={`px-3.5 py-2 rounded-t-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer border-b-2 ${
              activeTab === 'environments'
                ? 'bg-[#0f1d2c] text-cyan-300 border-cyan-500 font-bold'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
            }`}
          >
            <Waves className="w-4 h-4" />
            <span>Environment Comparison</span>
          </button>

          <button
            onClick={() => setActiveTab('mechanisms')}
            className={`px-3.5 py-2 rounded-t-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer border-b-2 ${
              activeTab === 'mechanisms'
                ? 'bg-[#0f1d2c] text-rose-300 border-rose-500 font-bold'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Degradation Mechanisms</span>
          </button>

          <button
            onClick={() => setActiveTab('rates')}
            className={`px-3.5 py-2 rounded-t-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer border-b-2 ${
              activeTab === 'rates'
                ? 'bg-[#0f1d2c] text-amber-300 border-amber-500 font-bold'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Faraday Rate & LPR</span>
          </button>

          <button
            onClick={() => setActiveTab('galvanic')}
            className={`px-3.5 py-2 rounded-t-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer border-b-2 ${
              activeTab === 'galvanic'
                ? 'bg-[#0f1d2c] text-amber-300 border-amber-500 font-bold'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Galvanic Couple Matrix</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'materials' && (
            <CorrosionMaterialSelector
              selectedAlloyId={selectedAlloyId}
              onSelectAlloy={setSelectedAlloyId}
            />
          )}

          {activeTab === 'environments' && (
            <CorrosionEnvironmentComparison
              selectedAlloyId={selectedAlloyId}
            />
          )}

          {activeTab === 'mechanisms' && (
            <CorrosionMechanismsExplorer />
          )}

          {activeTab === 'rates' && (
            <CorrosionRateCalculator />
          )}

          {activeTab === 'galvanic' && (
            <CorrosionGalvanicMatrix />
          )}
        </div>

        {/* Footer Status Bar */}
        <div className="px-5 py-2.5 border-t border-[#142232] bg-[#060b12] flex items-center justify-between text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              Engine: ASTM G102 / G48 / G82 Kinetic Core
            </span>
            <span>·</span>
            <span>NACE MR0175 / ISO 15156 Reference Standards</span>
          </div>

          <div className="text-[11px] text-slate-400">
            Current Material: <strong className="text-rose-400">{selectedAlloyId.toUpperCase()}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
