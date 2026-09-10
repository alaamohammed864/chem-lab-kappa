// Crystal Structure Parameter & Density Calculator
// Calculates lattice parameters, atomic radius, coordination number, APF, density, and nearest neighbor distances

import React, { useState } from 'react';
import {
  calculateCrystalMetrics,
  calculateInterplanarSpacing,
  UnitCellMetrics,
} from '../../engines/materials/crystallographyEngine';
import { Calculator, Atom, Compass, Layers, Scale, Sparkles } from 'lucide-react';

interface CrystalCalculatorProps {
  systemId: 'sc' | 'bcc' | 'fcc' | 'hcp';
  onPlaneSelect?: (plane: [number, number, number]) => void;
}

interface MaterialPreset {
  name: string;
  system: 'sc' | 'bcc' | 'fcc' | 'hcp';
  a: number; // Å
  c?: number; // Å (for HCP)
  atomicMass: number; // g/mol
  actualDensity: number; // g/cm³ reference
}

const MATERIAL_PRESETS: MaterialPreset[] = [
  { name: 'Polonium (α-Po)', system: 'sc', a: 3.359, atomicMass: 209.0, actualDensity: 9.196 },
  { name: 'Copper (Cu)', system: 'fcc', a: 3.615, atomicMass: 63.546, actualDensity: 8.96 },
  { name: 'Aluminum (Al)', system: 'fcc', a: 4.049, atomicMass: 26.982, actualDensity: 2.70 },
  { name: 'Nickel (Ni)', system: 'fcc', a: 3.524, atomicMass: 58.693, actualDensity: 8.908 },
  { name: 'Gold (Au)', system: 'fcc', a: 4.078, atomicMass: 196.967, actualDensity: 19.30 },
  { name: 'Iron α (Ferrite)', system: 'bcc', a: 2.866, atomicMass: 55.845, actualDensity: 7.874 },
  { name: 'Tungsten (W)', system: 'bcc', a: 3.165, atomicMass: 183.84, actualDensity: 19.25 },
  { name: 'Chromium (Cr)', system: 'bcc', a: 2.910, atomicMass: 51.996, actualDensity: 7.19 },
  { name: 'Titanium α (Ti)', system: 'hcp', a: 2.951, c: 4.684, atomicMass: 47.867, actualDensity: 4.506 },
  { name: 'Magnesium (Mg)', system: 'hcp', a: 3.209, c: 5.211, atomicMass: 24.305, actualDensity: 1.738 },
  { name: 'Zinc (Zn)', system: 'hcp', a: 2.665, c: 4.947, atomicMass: 65.38, actualDensity: 7.14 },
];

export const CrystalCalculator: React.FC<CrystalCalculatorProps> = ({ systemId, onPlaneSelect }) => {
  // Input parameters
  const [latticeA, setLatticeA] = useState<number>(() => {
    if (systemId === 'sc') return 3.359;
    if (systemId === 'bcc') return 2.866;
    if (systemId === 'fcc') return 3.615;
    return 2.951; // hcp
  });

  const [atomicMass, setAtomicMass] = useState<number>(() => {
    if (systemId === 'sc') return 209.0;
    if (systemId === 'bcc') return 55.845;
    if (systemId === 'fcc') return 63.546;
    return 47.867; // hcp
  });

  // Miller indices state
  const [h, setH] = useState(1);
  const [k, setK] = useState(1);
  const [l, setL] = useState(1);

  // Compute metrics
  const metrics: UnitCellMetrics = calculateCrystalMetrics(systemId, latticeA, atomicMass);

  // Compute d_hkl
  const dSpacing = calculateInterplanarSpacing(
    h,
    k,
    l,
    latticeA,
    metrics.latticeParamC,
    systemId === 'hcp' ? 'hexagonal' : 'cubic'
  );

  const handleApplyPreset = (preset: MaterialPreset) => {
    setLatticeA(preset.a);
    setAtomicMass(preset.atomicMass);
  };

  return (
    <div className="space-y-5">
      {/* Material Presets Chips */}
      <div>
        <div className="text-[11px] font-mono uppercase text-slate-400 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Real Elemental Presets ({systemId.toUpperCase()})</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {MATERIAL_PRESETS.filter((p) => p.system === systemId).map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleApplyPreset(preset)}
              className="px-2.5 py-1 rounded-md text-xs font-mono bg-[#0d1824] hover:bg-teal-950/60 hover:text-teal-300 border border-[#1b2f42] text-slate-300 transition cursor-pointer"
            >
              {preset.name} (a = {preset.a} Å)
            </button>
          ))}
        </div>
      </div>

      {/* Input Parameters Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 bg-[#0a121c] rounded-xl border border-[#162738]">
          <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
            Lattice Parameter a (Å)
          </label>
          <input
            type="number"
            step="0.001"
            min="0.5"
            max="20"
            value={latticeA}
            onChange={(e) => setLatticeA(parseFloat(e.target.value) || 1)}
            className="w-full bg-[#050a10] border border-[#1a2d40] rounded-lg px-3 py-1.5 text-base font-bold font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
          />
          <div className="text-[10px] font-mono text-slate-500 mt-1">
            1 Ångström = 0.1 nm = 10⁻¹⁰ meters
          </div>
        </div>

        <div className="p-3 bg-[#0a121c] rounded-xl border border-[#162738]">
          <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
            Atomic Mass M (g/mol)
          </label>
          <input
            type="number"
            step="0.01"
            min="1"
            max="300"
            value={atomicMass}
            onChange={(e) => setAtomicMass(parseFloat(e.target.value) || 1)}
            className="w-full bg-[#050a10] border border-[#1a2d40] rounded-lg px-3 py-1.5 text-base font-bold font-mono text-amber-300 focus:outline-none focus:border-amber-500"
          />
          <div className="text-[10px] font-mono text-slate-500 mt-1">
            Used for theoretical density calculation (ρ = n·M / V·N_A)
          </div>
        </div>
      </div>

      {/* Primary Calculated Crystallographic Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div className="p-3 rounded-xl bg-[#0b1622] border border-[#192b3e]">
          <div className="text-[10px] font-mono uppercase text-slate-400">Atoms per Unit Cell (n)</div>
          <div className="text-xl font-bold font-mono text-teal-300 mt-0.5">
            {metrics.atomsPerUnitCell} <span className="text-xs text-slate-500 font-normal">atoms</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">{metrics.formulaRelation}</div>
        </div>

        <div className="p-3 rounded-xl bg-[#0b1622] border border-[#192b3e]">
          <div className="text-[10px] font-mono uppercase text-slate-400">Coordination Number (CN)</div>
          <div className="text-xl font-bold font-mono text-cyan-300 mt-0.5">{metrics.coordinationNumber}</div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">Nearest adjacent neighbors</div>
        </div>

        <div className="p-3 rounded-xl bg-[#0b1622] border border-[#192b3e]">
          <div className="text-[10px] font-mono uppercase text-slate-400">Atomic Packing Factor (APF)</div>
          <div className="text-xl font-bold font-mono text-amber-300 mt-0.5">
            {(metrics.atomicPackingFactor * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">
            Ratio = {metrics.atomicPackingFactor}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#0b1622] border border-[#192b3e]">
          <div className="text-[10px] font-mono uppercase text-slate-400">Atomic Radius (R)</div>
          <div className="text-xl font-bold font-mono text-emerald-300 mt-0.5">
            {metrics.atomicRadiusR} <span className="text-xs text-slate-500 font-normal">Å</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">
            {(metrics.atomicRadiusR * 0.1).toFixed(4)} nm
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#0b1622] border border-[#192b3e]">
          <div className="text-[10px] font-mono uppercase text-slate-400">Nearest-Neighbor (d_NN)</div>
          <div className="text-xl font-bold font-mono text-purple-300 mt-0.5">
            {metrics.nearestNeighborDistance} <span className="text-xs text-slate-500 font-normal">Å</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">Center-to-center touch distance</div>
        </div>

        <div className="p-3 rounded-xl bg-[#0b1622] border border-[#192b3e]">
          <div className="text-[10px] font-mono uppercase text-slate-400">Theoretical Density (ρ)</div>
          <div className="text-xl font-bold font-mono text-rose-300 mt-0.5">
            {metrics.theoreticalDensityGramsPerCm3}{' '}
            <span className="text-xs text-slate-500 font-normal">g/cm³</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">
            Cell Vol: {metrics.unitCellVolumeAngstrom3} Å³
          </div>
        </div>
      </div>

      {/* Miller Indices (hkl) Interplanar d-Spacing */}
      <div className="p-4 bg-[#0a141e] rounded-xl border border-[#192b3e] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase">
            <Calculator className="w-4 h-4 text-teal-400" />
            <span>Miller Indices & Interplanar Spacing (d_hkl)</span>
          </div>
          <div className="flex items-center gap-1">
            {([ [1,0,0], [1,1,0], [1,1,1], [0,0,2] ] as [number, number, number][]).map((p) => (
              <button
                key={p.join('')}
                onClick={() => {
                  setH(p[0]);
                  setK(p[1]);
                  setL(p[2]);
                  if (onPlaneSelect) onPlaneSelect(p);
                }}
                className="px-2 py-0.5 text-[10px] font-mono bg-[#0f1d2b] hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 rounded border border-[#1a2d40] transition cursor-pointer"
              >
                ({p.join('')})
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-2 bg-[#060c14] rounded-lg border border-[#152332]">
            <label className="text-[10px] font-mono text-slate-500 uppercase block">Index (h)</label>
            <input
              type="number"
              value={h}
              onChange={(e) => setH(parseInt(e.target.value) || 0)}
              className="w-full bg-transparent font-mono font-bold text-white text-base focus:outline-none"
            />
          </div>

          <div className="p-2 bg-[#060c14] rounded-lg border border-[#152332]">
            <label className="text-[10px] font-mono text-slate-500 uppercase block">Index (k)</label>
            <input
              type="number"
              value={k}
              onChange={(e) => setK(parseInt(e.target.value) || 0)}
              className="w-full bg-transparent font-mono font-bold text-white text-base focus:outline-none"
            />
          </div>

          <div className="p-2 bg-[#060c14] rounded-lg border border-[#152332]">
            <label className="text-[10px] font-mono text-slate-500 uppercase block">Index (l)</label>
            <input
              type="number"
              value={l}
              onChange={(e) => setL(parseInt(e.target.value) || 0)}
              className="w-full bg-transparent font-mono font-bold text-white text-base focus:outline-none"
            />
          </div>

          <div className="p-2 bg-[#060c14] rounded-lg border border-[#152332]">
            <label className="text-[10px] font-mono text-slate-500 uppercase block">
              d({h}{k}{l}) Spacing
            </label>
            <div className="text-base font-mono font-bold text-emerald-300">{dSpacing} Å</div>
          </div>
        </div>

        <p className="text-[11px] font-mono text-slate-400 leading-relaxed">
          {systemId === 'hcp'
            ? 'Hexagonal interplanar spacing formula: 1/d² = 4/3·(h² + hk + k²)/a² + l²/c²'
            : 'Cubic interplanar spacing formula: d = a / √(h² + k² + l²)'}
        </p>
      </div>
    </div>
  );
};
