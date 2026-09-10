import React, { useState } from 'react';
import {
  Calculator,
  X,
  Scale,
  FlaskConical,
  Beaker,
  Activity,
  Wind,
  Flame,
  Droplets,
} from 'lucide-react';
import { MolarMassTab } from './calculators/MolarMassTab';
import { StoichiometryTab } from './calculators/StoichiometryTab';
import { ConcentrationTab } from './calculators/ConcentrationTab';
import { DilutionTab } from './calculators/DilutionTab';
import { PHTab } from './calculators/PHTab';
import { GasLawsTab } from './calculators/GasLawsTab';
import { ThermochemistryTab } from './calculators/ThermochemistryTab';
import { SolubilityTab } from './calculators/SolubilityTab';

export type ChemistryCalculatorTabId =
  | 'molar_mass'
  | 'stoichiometry'
  | 'concentration'
  | 'dilution'
  | 'ph'
  | 'gas_laws'
  | 'thermochemistry'
  | 'solubility';

interface MolarMassCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFormula?: string;
  initialTab?: ChemistryCalculatorTabId;
}

export const MolarMassCalculatorModal: React.FC<MolarMassCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialFormula = 'Fe2O3',
  initialTab = 'molar_mass',
}) => {
  const [activeTab, setActiveTab] = useState<ChemistryCalculatorTabId>(initialTab);

  if (!isOpen) return null;

  const tabs: { id: ChemistryCalculatorTabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'molar_mass', label: 'Molar Mass', icon: Calculator },
    { id: 'stoichiometry', label: 'Stoichiometry', icon: Scale },
    { id: 'concentration', label: 'Concentration', icon: Beaker },
    { id: 'dilution', label: 'Dilution', icon: Droplets },
    { id: 'ph', label: 'pH & Acid-Base', icon: Activity },
    { id: 'gas_laws', label: 'Gas Laws', icon: Wind },
    { id: 'thermochemistry', label: 'Thermochemistry', icon: Flame },
    { id: 'solubility', label: 'Solubility (Ksp)', icon: FlaskConical },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#091017] border border-[#1b2d42] rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-[#142230] flex items-center justify-between bg-[#0b141e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Chemical Calculation Engine
              </h3>
              <p className="text-xs text-slate-400">
                Precision quantitative chemistry, solution equilibria, thermodynamics & stoichiometry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="flex items-center gap-1 px-4 sm:px-6 py-2 border-b border-[#142230] bg-[#070e17] overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body: Active Tab View */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-[#091017]">
          {activeTab === 'molar_mass' && (
            <MolarMassTab initialFormula={initialFormula} />
          )}

          {activeTab === 'stoichiometry' && (
            <StoichiometryTab />
          )}

          {activeTab === 'concentration' && (
            <ConcentrationTab />
          )}

          {activeTab === 'dilution' && (
            <DilutionTab />
          )}

          {activeTab === 'ph' && (
            <PHTab />
          )}

          {activeTab === 'gas_laws' && (
            <GasLawsTab />
          )}

          {activeTab === 'thermochemistry' && (
            <ThermochemistryTab />
          )}

          {activeTab === 'solubility' && (
            <SolubilityTab />
          )}
        </div>
      </div>
    </div>
  );
};
