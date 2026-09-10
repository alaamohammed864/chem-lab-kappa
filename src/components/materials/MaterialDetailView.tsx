// High-density Engineering Specification & Detail Inspector for Materials
import React, { useState } from 'react';
import { MaterialModel } from '../../engines/materials/materialModel';
import {
  PROPERTY_DEFINITIONS,
  calculateAshbyMetrics,
  normalizePropertyScore,
} from '../../engines/materials/propertyModel';
import { MaterialsStorageService } from '../../services/materialsStorage';
import {
  Star,
  Layers,
  Scale,
  Zap,
  Flame,
  Shield,
  CheckCircle,
  Copy,
  Check,
  AlertTriangle,
  FileText,
  Activity,
  Maximize2,
  Atom,
} from 'lucide-react';

interface MaterialDetailViewProps {
  material: MaterialModel;
  isFavorite: boolean;
  isInComparison: boolean;
  onToggleFavorite: (id: string) => void;
  onToggleComparison: (material: MaterialModel) => void;
  onOpenComparison?: () => void;
}

export const MaterialDetailView: React.FC<MaterialDetailViewProps> = ({
  material,
  isFavorite,
  isInComparison,
  onToggleFavorite,
  onToggleComparison,
  onOpenComparison,
}) => {
  const [copied, setCopied] = useState(false);
  const ashby = calculateAshbyMetrics(material);

  const handleCopyJson = () => {
    const jsonStr = JSON.stringify(material, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 text-left select-none">
      {/* Top Header Card */}
      <div className="p-4 rounded-xl bg-[#0b1420] border border-[#1b2d42] flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800">
              {material.category}
            </span>
            {material.subCategory && (
              <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                {material.subCategory}
              </span>
            )}
            {material.formula && (
              <span className="text-[10px] font-mono text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-950/50 border border-cyan-800/40">
                {material.formula}
              </span>
            )}
          </div>

          <h3 className="text-xl font-bold text-white tracking-tight mt-1.5 flex items-center gap-2">
            {material.name}
          </h3>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Designation / Grade: <strong className="text-white">{material.designation}</strong>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start">
          <button
            onClick={() => onToggleFavorite(material.id)}
            className={`p-2 rounded-lg border transition ${
              isFavorite
                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                : 'bg-[#070d14] border-[#1e3046] text-slate-400 hover:text-white'
            }`}
            title={isFavorite ? 'Remove Favorite' : 'Save as Favorite'}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
          </button>

          <button
            onClick={() => onToggleComparison(material)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition flex items-center gap-1.5 ${
              isInComparison
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                : 'bg-[#070d14] border-[#1e3046] text-slate-300 hover:text-white hover:border-slate-600'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isInComparison ? 'In Comparison' : '+ Compare'}</span>
          </button>

          <button
            onClick={handleCopyJson}
            className="p-2 rounded-lg border bg-[#070d14] border-[#1e3046] text-slate-400 hover:text-white transition"
            title="Copy JSON Specification"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Demonstration Data Quality & Engineering Disclaimer Notice */}
      <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 flex items-start gap-2.5 text-xs text-amber-200/90 font-mono">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-bold text-amber-300 text-[11px] flex items-center gap-2">
            <span>Demonstration Reference Data (Non-Authoritative)</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-900/60 text-[9px] text-amber-300">
              Demo Mode
            </span>
          </div>
          <p className="text-[11px] text-amber-200/75 leading-relaxed">
            Values are representative handbook metrics from <em>{material.dataSource}</em> intended for simulation, education, and relative material benchmarking. Do not use for certified structural design without vendor mill certificates.
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="p-3.5 rounded-xl bg-[#0b1420] border border-[#1b2d42] text-xs text-slate-300 leading-relaxed">
        {material.description}
      </div>

      {/* 10 Core Physical & Mechanical Properties Grid */}
      <div className="space-y-2">
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>10 Core Standard Properties</span>
          <span className="text-[10px] text-slate-500 font-normal">SI Units @ 20°C</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
          {/* Density */}
          <div className="p-3 rounded-xl bg-[#09111b] border border-[#18283a] flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 uppercase">Mass Density (ρ)</span>
            <div className="font-bold text-base text-white mt-1">{material.density} g/cm³</div>
            <div className="w-full bg-[#050a10] rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-sky-400 h-full rounded-full"
                style={{ width: `${Math.min(100, (material.density / 20) * 100)}%` }}
              />
            </div>
          </div>

          {/* Hardness */}
          <div className="p-3 rounded-xl bg-[#09111b] border border-[#18283a] flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 uppercase">Hardness</span>
            <div className="font-bold text-base text-purple-300 mt-1">
              {material.hardness.value} {material.hardness.scale}
            </div>
            <div className="text-[9px] text-slate-400 mt-1">
              Indentation resistance
            </div>
          </div>

          {/* Tensile Strength */}
          <div className="p-3 rounded-xl bg-[#09111b] border border-[#18283a] flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 uppercase">Tensile Strength (UTS)</span>
            <div className="font-bold text-base text-amber-300 mt-1">
              {material.tensileStrength.toLocaleString()} MPa
            </div>
            <div className="w-full bg-[#050a10] rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full"
                style={{ width: `${Math.min(100, (material.tensileStrength / 3000) * 100)}%` }}
              />
            </div>
          </div>

          {/* Yield Strength */}
          <div className="p-3 rounded-xl bg-[#09111b] border border-[#18283a] flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 uppercase">Yield Strength (σy)</span>
            <div className="font-bold text-base text-emerald-300 mt-1">
              {material.yieldStrength.toLocaleString()} MPa
            </div>
            <div className="w-full bg-[#050a10] rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full"
                style={{ width: `${Math.min(100, (material.yieldStrength / 2500) * 100)}%` }}
              />
            </div>
          </div>

          {/* Elastic Modulus */}
          <div className="p-3 rounded-xl bg-[#09111b] border border-[#18283a] flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 uppercase">Young's Modulus (E)</span>
            <div className="font-bold text-base text-cyan-300 mt-1">
              {material.elasticModulus.toLocaleString()} GPa
            </div>
            <div className="w-full bg-[#050a10] rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full"
                style={{ width: `${Math.min(100, (material.elasticModulus / 1000) * 100)}%` }}
              />
            </div>
          </div>

          {/* Poisson's Ratio */}
          <div className="p-3 rounded-xl bg-[#09111b] border border-[#18283a] flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 uppercase">Poisson's Ratio (ν)</span>
            <div className="font-bold text-base text-indigo-300 mt-1">{material.poissonRatio}</div>
            <div className="text-[9px] text-slate-400 mt-1">
              Transverse/Axial strain ratio
            </div>
          </div>

          {/* Thermal Conductivity */}
          <div className="p-3 rounded-xl bg-[#09111b] border border-[#18283a] flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 uppercase">Thermal Cond. (k)</span>
            <div className="font-bold text-base text-teal-300 mt-1">
              {material.thermalConductivity} W/m·K
            </div>
            <div className="w-full bg-[#050a10] rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-teal-400 h-full rounded-full"
                style={{ width: `${Math.min(100, (material.thermalConductivity / 400) * 100)}%` }}
              />
            </div>
          </div>

          {/* Melting Point */}
          <div className="p-3 rounded-xl bg-[#09111b] border border-[#18283a] flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 uppercase">Melting Point (Tm)</span>
            <div className="font-bold text-base text-rose-300 mt-1">
              {material.meltingPoint.toLocaleString()} °C
            </div>
            <div className="w-full bg-[#050a10] rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-rose-400 h-full rounded-full"
                style={{ width: `${Math.min(100, (material.meltingPoint / 3500) * 100)}%` }}
              />
            </div>
          </div>

          {/* Electrical Conductivity */}
          <div className="p-3 rounded-xl bg-[#09111b] border border-[#18283a] flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 uppercase">Electrical Cond. (σ)</span>
            <div className="font-bold text-sm text-yellow-300 mt-1 truncate">
              {material.electricalConductivity >= 1e5
                ? `${(material.electricalConductivity / 1e6).toFixed(2)} × 10⁶ S/m`
                : material.electricalConductivity >= 1
                ? `${material.electricalConductivity} S/m`
                : `${material.electricalConductivity.toExponential(1)} S/m`}
            </div>
            <div className="text-[9px] text-slate-400 mt-1">
              Carrier mobility
            </div>
          </div>

          {/* Corrosion Resistance */}
          <div className="p-3 rounded-xl bg-[#09111b] border border-[#18283a] flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 uppercase">Corrosion Resistance</span>
            <div className="font-bold text-base text-emerald-400 mt-1 flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              <span>{material.corrosionResistance}</span>
            </div>
            <div className="text-[9px] text-slate-400 mt-1">
              Acid / Saline / Oxidation
            </div>
          </div>

          {/* Ashby Specific Strength */}
          <div className="p-3 rounded-xl bg-[#0f1b29] border border-[#1e344e] flex flex-col justify-between">
            <span className="text-[10px] text-amber-400 uppercase font-bold">Specific Strength (σ/ρ)</span>
            <div className="font-bold text-base text-amber-300 mt-1">
              {ashby.specificStrength} <span className="text-xs text-slate-400">kN·m/kg</span>
            </div>
            <div className="text-[9px] text-slate-400 mt-1">
              Lightweight structural figure
            </div>
          </div>

          {/* Ashby Specific Modulus */}
          <div className="p-3 rounded-xl bg-[#0f1b29] border border-[#1e344e] flex flex-col justify-between">
            <span className="text-[10px] text-cyan-400 uppercase font-bold">Specific Modulus (E/ρ)</span>
            <div className="font-bold text-base text-cyan-300 mt-1">
              {ashby.specificModulus} <span className="text-xs text-slate-400">MN·m/kg</span>
            </div>
            <div className="text-[9px] text-slate-400 mt-1">
              Specific elastic stiffness
            </div>
          </div>
        </div>
      </div>

      {/* Crystallography & Structure Details */}
      {material.crystalStructure && (
        <div className="p-3 rounded-xl bg-[#0b1420] border border-[#1b2d42] space-y-1 text-xs">
          <div className="font-mono text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1.5">
            <Atom className="w-3.5 h-3.5 text-teal-400" />
            <span>Crystallography & Microstructure</span>
          </div>
          <p className="font-mono text-slate-200">
            {material.crystalStructure}
          </p>
        </div>
      )}

      {/* Composition Table (if available) */}
      {material.composition && Object.keys(material.composition).length > 0 && (
        <div className="p-3 rounded-xl bg-[#0b1420] border border-[#1b2d42] space-y-2 text-xs">
          <div className="font-mono text-[10px] text-slate-400 uppercase font-semibold">
            Elemental & Chemical Composition
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(material.composition).map(([elem, fraction]) => (
              <span
                key={elem}
                className="px-2.5 py-1 rounded bg-[#070d14] border border-[#1e3046] font-mono text-[11px] text-slate-200"
              >
                <strong className="text-amber-400">{elem}</strong>: {fraction}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Applications Checklist */}
      <div className="p-3.5 rounded-xl bg-[#0b1420] border border-[#1b2d42] space-y-2 text-xs">
        <div className="font-mono text-[10px] text-slate-400 uppercase font-semibold">
          Primary Industrial & Engineering Applications
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
          {material.applications.map((app, i) => (
            <li key={i} className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{app}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
