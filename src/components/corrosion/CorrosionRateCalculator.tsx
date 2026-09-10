import React, { useState } from 'react';
import {
  Calculator,
  Flame,
  Activity,
  ShieldAlert,
  ArrowRight,
  Info,
  Layers,
  HelpCircle,
} from 'lucide-react';
import {
  calculateFaradayCorrosionRate,
  CORROSION_ALLOYS,
} from '../../engines/materials/corrosionEngine';

export const CorrosionRateCalculator: React.FC = () => {
  const [iCorr, setICorr] = useState<number>(10); // µA/cm²
  const [ew, setEw] = useState<number>(27.92); // g/eq (Iron/Carbon steel default)
  const [density, setDensity] = useState<number>(7.85); // g/cm³
  const [selectedPreset, setSelectedPreset] = useState<string>('carbon-steel-1018');

  const handleSelectPreset = (alloyKey: string) => {
    setSelectedPreset(alloyKey);
    const alloy = CORROSION_ALLOYS[alloyKey];
    if (alloy) {
      setEw(alloy.equivalentWeightGrams);
      setDensity(alloy.densityGramsPerCm3);
    }
  };

  const result = calculateFaradayCorrosionRate(iCorr, ew, density);

  // Stern-Geary Polarization Resistance estimation assuming typical Tafel slopes (beta_a = beta_c = 120 mV/dec)
  // B = (beta_a * beta_c) / (2.303 * (beta_a + beta_c)) = (0.12 * 0.12) / (2.303 * 0.24) = 0.0144 / 0.55272 ~ 0.026 V
  // Rp = B / i_corr = 0.026 / (i_corr in A/cm²) = (0.026 * 1e6) / i_corr (in ohm·cm²)
  const sternGearyConstantB = 0.026; // V
  const polarizationResistanceOhmCm2 = iCorr > 0 ? (sternGearyConstantB * 1e6) / iCorr : 0;

  return (
    <div className="space-y-4">
      {/* Top Presets */}
      <div>
        <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2 block">
          Load Material Physical Constants Preset
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(CORROSION_ALLOYS).map(([key, alloy]) => (
            <button
              key={key}
              onClick={() => handleSelectPreset(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition border cursor-pointer ${
                selectedPreset === key
                  ? 'bg-rose-950/60 border-rose-500 text-rose-200 shadow-sm'
                  : 'bg-[#0f1924] border-[#1b2b3d] text-slate-300 hover:border-slate-600'
              }`}
            >
              {alloy.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Inputs (6 cols) */}
        <div className="lg:col-span-6 bg-[#0b131d] border border-[#162738] rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-cyan-400" />
              Faraday Electrochemical Inputs
            </span>
            <span className="text-[10px] font-mono text-slate-500">ASTM G102 Standard</span>
          </div>

          {/* Current Density i_corr */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="text-slate-300 font-medium">
                Corrosion Current Density (<span className="font-mono text-cyan-300">i_corr</span>):
              </label>
              <div className="flex items-center gap-1 font-mono">
                <input
                  type="number"
                  min={0.01}
                  max={5000}
                  step={1}
                  value={iCorr}
                  onChange={(e) => setICorr(Math.max(0.001, Number(e.target.value)))}
                  className="w-20 px-2 py-0.5 rounded bg-[#101b28] border border-[#1d3148] text-right text-cyan-300 text-xs font-bold"
                />
                <span className="text-slate-400 text-[10px]">µA/cm²</span>
              </div>
            </div>
            <input
              type="range"
              min={0.1}
              max={250}
              step={0.5}
              value={Math.min(250, iCorr)}
              onChange={(e) => setICorr(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-500">
              <span>0.1 µA (Passive)</span>
              <span>10 µA (Mild attack)</span>
              <span>100+ µA (Active dissolution)</span>
            </div>
          </div>

          {/* Equivalent Weight EW */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="text-slate-300 font-medium">
                Alloy Equivalent Weight (<span className="font-mono text-cyan-300">EW</span>):
              </label>
              <div className="flex items-center gap-1 font-mono">
                <input
                  type="number"
                  min={5}
                  max={100}
                  step={0.1}
                  value={ew}
                  onChange={(e) => setEw(Math.max(1, Number(e.target.value)))}
                  className="w-20 px-2 py-0.5 rounded bg-[#101b28] border border-[#1d3148] text-right text-cyan-300 text-xs font-bold"
                />
                <span className="text-slate-400 text-[10px]">g/eq</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              EW = 1 / Σ (f_i · n_i / M_i) based on alloying mass fractions f_i and valence states n_i.
            </p>
          </div>

          {/* Density rho */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="text-slate-300 font-medium">
                Material Density (<span className="font-mono text-cyan-300">ρ</span>):
              </label>
              <div className="flex items-center gap-1 font-mono">
                <input
                  type="number"
                  min={1}
                  max={25}
                  step={0.05}
                  value={density}
                  onChange={(e) => setDensity(Math.max(0.1, Number(e.target.value)))}
                  className="w-20 px-2 py-0.5 rounded bg-[#101b28] border border-[#1d3148] text-right text-cyan-300 text-xs font-bold"
                />
                <span className="text-slate-400 text-[10px]">g/cm³</span>
              </div>
            </div>
          </div>

          {/* Derivation Equation Box */}
          <div className="p-3 rounded-lg bg-[#0e1724] border border-[#182a3d] space-y-1 text-xs font-mono">
            <div className="text-[10px] uppercase text-slate-400 font-semibold">Faraday Penetration Equation:</div>
            <div className="text-cyan-300">CR (mm/year) = 0.00327 · (i_corr · EW) / ρ</div>
            <div className="text-slate-400">CR (mpy) = 0.129 · (i_corr · EW) / ρ</div>
            <div className="text-[9px] text-slate-500 pt-1">
              Constant 0.00327 derives from (3.1536×10⁷ s/yr · 10 mm/cm) / (96,485 C/eq · 10⁶ µA/A).
            </div>
          </div>
        </div>

        {/* Right Outputs & Polarization Resistance (6 cols) */}
        <div className="lg:col-span-6 bg-[#0b131d] border border-[#162738] rounded-xl p-4 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                Calculated Corrosion Rate
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                result.severity === 'Catastrophic' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                result.severity === 'Severe' ? 'bg-rose-900/40 text-rose-300 border border-rose-800/60' :
                result.severity === 'Moderate' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                result.severity === 'Mild' ? 'bg-teal-950 text-teal-300 border border-teal-800' :
                'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {result.severity} Risk
              </span>
            </div>

            {/* Big Primary Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3.5 rounded-xl bg-gradient-to-b from-[#131f2d] to-[#0d1622] border border-[#1c3046]">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Metric Rate</span>
                <div className="text-2xl font-black text-white font-mono mt-1">
                  {result.rateMmPerYear}
                </div>
                <span className="text-[10px] text-cyan-400 font-mono">mm / year</span>
              </div>

              <div className="p-3.5 rounded-xl bg-gradient-to-b from-[#131f2d] to-[#0d1622] border border-[#1c3046]">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Imperial Rate</span>
                <div className="text-2xl font-black text-amber-300 font-mono mt-1">
                  {result.rateMpy}
                </div>
                <span className="text-[10px] text-amber-400 font-mono">mpy (mils / year)</span>
              </div>
            </div>

            {/* Stern-Geary Polarization Resistance */}
            <div className="p-3 rounded-xl bg-[#0f1926] border border-[#182a3d] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-400" />
                  Linear Polarization Resistance (LPR)
                </span>
                <span className="text-[10px] font-mono text-slate-500">Stern-Geary Model</span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-slate-400 text-xs">Polarization Resistance R_p:</span>
                <span className="font-mono text-sm font-bold text-indigo-300">
                  {polarizationResistanceOhmCm2.toLocaleString('en-US', { maximumFractionDigits: 0 })} Ω·cm²
                </span>
              </div>
              <div className="text-[10px] text-slate-400 leading-relaxed">
                Higher R_p indicates an intact passive barrier resisting electrochemical charge transfer.
                Measurement via non-destructive potentiostatic sweeps (±10 mV around open-circuit potential).
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400 flex items-center gap-2">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              Uniform penetration assumption: Localized pitting or stress cracking can cause through-wall perforation significantly earlier than uniform Faraday rates suggest.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
