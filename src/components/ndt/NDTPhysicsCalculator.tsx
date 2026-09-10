import React, { useState } from 'react';
import {
  Calculator,
  Radio,
  Layers,
  Sparkles,
  Zap,
  Activity,
  Eye,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  NDTMethodDetail,
  calculateUltrasonicVelocities,
  calculateUltrasonicWavelength,
  calculateRadiographicExposure,
  calculateEddyCurrentSkinDepth,
} from '../../engines/materials/ndtEngine';

interface NDTPhysicsCalculatorProps {
  methodCode: 'VT' | 'PT' | 'MT' | 'UT' | 'RT' | 'ET';
}

export const NDTPhysicsCalculator: React.FC<NDTPhysicsCalculatorProps> = ({ methodCode }) => {
  // UT state
  const [youngsModulusGPa, setYoungsModulusGPa] = useState<number>(210);
  const [densityGramsCm3, setDensityGramsCm3] = useState<number>(7.85);
  const [poissonRatio, setPoissonRatio] = useState<number>(0.30);
  const [frequencyMHz, setFrequencyMHz] = useState<number>(5.0);
  const [crystalDiameterMm, setCrystalDiameterMm] = useState<number>(10.0);

  // RT state
  const [initialIntensity, setInitialIntensity] = useState<number>(100);
  const [linearAttenCoef, setLinearAttenCoef] = useState<number>(0.50);
  const [thicknessCm, setThicknessCm] = useState<number>(2.0);
  const [focalSpotMm, setFocalSpotMm] = useState<number>(3.0);
  const [sourceToFilmDistanceMm, setSourceToFilmDistanceMm] = useState<number>(800);
  const [objectToFilmDistanceMm, setObjectToFilmDistanceMm] = useState<number>(25);

  // ET state
  const [etFrequencyHz, setEtFrequencyHz] = useState<number>(100000); // 100 kHz
  const [relPermeability, setRelPermeability] = useState<number>(1.0); // Non-ferromagnetic default
  const [conductivityPctIACS, setConductivityPctIACS] = useState<number>(35.0); // Al alloy

  // PT state
  const [surfaceTensionMilliN, setSurfaceTensionMilliN] = useState<number>(32); // mN/m
  const [contactAngleDeg, setContactAngleDeg] = useState<number>(15); // degrees
  const [crackWidthMicrons, setCrackWidthMicrons] = useState<number>(2.0); // µm

  // MT state
  const [partLengthMm, setPartLengthMm] = useState<number>(250);
  const [partDiameterMm, setPartDiameterMm] = useState<number>(50);

  // VT state
  const [lightLevelLux, setLightLevelLux] = useState<number>(1250);
  const [viewingDistanceMm, setViewingDistanceMm] = useState<number>(450);
  const [viewingAngleDeg, setViewingAngleDeg] = useState<number>(45);

  return (
    <div className="bg-[#0b131d] border border-[#162738] rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
          <Calculator className="w-4 h-4 text-cyan-400" />
          Interactive Physics & Formulation Solver: {methodCode}
        </span>
        <span className="text-[10px] font-mono text-slate-500">Real-Time Scientific Evaluation</span>
      </div>

      {/* 1. UT Solver */}
      {methodCode === 'UT' && (() => {
        const velocities = calculateUltrasonicVelocities(
          youngsModulusGPa,
          densityGramsCm3,
          poissonRatio,
          'Test Specimen'
        );
        const wave = calculateUltrasonicWavelength(
          velocities.longitudinalVelocityMS,
          frequencyMHz,
          crystalDiameterMm
        );

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-semibold block">
                Material Elastic & Probe Parameters
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Young's Modulus E (GPa):</label>
                  <input
                    type="number"
                    value={youngsModulusGPa}
                    onChange={(e) => setYoungsModulusGPa(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-[#101b28] border border-[#1b2f44] text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Density ρ (g/cm³):</label>
                  <input
                    type="number"
                    value={densityGramsCm3}
                    onChange={(e) => setDensityGramsCm3(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-[#101b28] border border-[#1b2f44] text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Poisson's Ratio ν:</label>
                  <input
                    type="number"
                    step={0.01}
                    value={poissonRatio}
                    onChange={(e) => setPoissonRatio(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-[#101b28] border border-[#1b2f44] text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Probe Freq f (MHz):</label>
                  <input
                    type="number"
                    step={0.5}
                    value={frequencyMHz}
                    onChange={(e) => setFrequencyMHz(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-[#101b28] border border-[#1b2f44] text-xs font-mono text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-1">Crystal Element Diameter D (mm):</label>
                <input
                  type="number"
                  value={crystalDiameterMm}
                  onChange={(e) => setCrystalDiameterMm(Number(e.target.value))}
                  className="w-full px-2 py-1 rounded bg-[#101b28] border border-[#1b2f44] text-xs font-mono text-white"
                />
              </div>
            </div>

            <div className="bg-[#0e1724] border border-[#172739] rounded-lg p-3 space-y-2.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                Calculated Acoustic Outputs
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-[#121f2d]">
                  <span className="text-[9px] text-slate-400 block">Longitudinal Velocity (v_L)</span>
                  <span className="text-sm font-bold text-cyan-300">{velocities.longitudinalVelocityMS} m/s</span>
                </div>
                <div className="p-2 rounded bg-[#121f2d]">
                  <span className="text-[9px] text-slate-400 block">Shear Velocity (v_S)</span>
                  <span className="text-sm font-bold text-cyan-300">{velocities.shearVelocityMS} m/s</span>
                </div>
                <div className="p-2 rounded bg-[#121f2d]">
                  <span className="text-[9px] text-slate-400 block">Acoustic Impedance (Z)</span>
                  <span className="text-sm font-bold text-amber-300">{velocities.acousticImpedanceMRayl} MRayl</span>
                </div>
                <div className="p-2 rounded bg-[#121f2d]">
                  <span className="text-[9px] text-slate-400 block">Acoustic Wavelength (λ)</span>
                  <span className="text-sm font-bold text-emerald-300">{wave.wavelengthMm} mm</span>
                </div>
              </div>

              <div className="p-2 rounded bg-[#121f2d] text-xs font-mono flex justify-between">
                <div>
                  <span className="text-[9px] text-slate-400 block">Near Field Zone (N)</span>
                  <span className="text-sm font-bold text-indigo-300">{wave.nearFieldDistanceMm} mm</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 block">Beam Spread Angle (θ)</span>
                  <span className="text-sm font-bold text-indigo-300">±{wave.beamSpreadAngleDeg}°</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 pt-1">
                Note: Flaw sizing within near field (N) requires DGS/AVG diagram correction due to acoustic interference.
              </div>
            </div>
          </div>
        );
      })()}

      {/* 2. RT Solver */}
      {methodCode === 'RT' && (() => {
        const rt = calculateRadiographicExposure(
          initialIntensity,
          linearAttenCoef,
          thicknessCm,
          focalSpotMm,
          sourceToFilmDistanceMm,
          objectToFilmDistanceMm
        );

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase text-indigo-400 font-semibold block">
                Radiographic Source & Geometry Inputs
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Incident Intensity I₀ (R/h):</label>
                  <input
                    type="number"
                    value={initialIntensity}
                    onChange={(e) => setInitialIntensity(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-[#101b28] border border-[#1b2f44] text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Linear Attenuation µ (cm⁻¹):</label>
                  <input
                    type="number"
                    step={0.05}
                    value={linearAttenCoef}
                    onChange={(e) => setLinearAttenCoef(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-[#101b28] border border-[#1b2f44] text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Material Thickness x (cm):</label>
                  <input
                    type="number"
                    step={0.2}
                    value={thicknessCm}
                    onChange={(e) => setThicknessCm(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-[#101b28] border border-[#1b2f44] text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Focal Spot Size F (mm):</label>
                  <input
                    type="number"
                    step={0.5}
                    value={focalSpotMm}
                    onChange={(e) => setFocalSpotMm(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-[#101b28] border border-[#1b2f44] text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Source-to-Film D (mm):</label>
                  <input
                    type="number"
                    value={sourceToFilmDistanceMm}
                    onChange={(e) => setSourceToFilmDistanceMm(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-[#101b28] border border-[#1b2f44] text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Object-to-Film d (mm):</label>
                  <input
                    type="number"
                    value={objectToFilmDistanceMm}
                    onChange={(e) => setObjectToFilmDistanceMm(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-[#101b28] border border-[#1b2f44] text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#0e1724] border border-[#172739] rounded-lg p-3 space-y-2.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                Radiation Attenuation & Image Sharpness
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-[#121f2d]">
                  <span className="text-[9px] text-slate-400 block">Transmitted Intensity (I)</span>
                  <span className="text-sm font-bold text-indigo-300">{rt.transmittedIntensity} R/h</span>
                </div>
                <div className="p-2 rounded bg-[#121f2d]">
                  <span className="text-[9px] text-slate-400 block">Transmission %</span>
                  <span className="text-sm font-bold text-indigo-300">{rt.attenuationPercentage}%</span>
                </div>
                <div className="p-2 rounded bg-[#121f2d]">
                  <span className="text-[9px] text-slate-400 block">Half-Value Layer (HVL)</span>
                  <span className="text-sm font-bold text-cyan-300">{rt.halfValueLayerCm} cm</span>
                </div>
                <div className="p-2 rounded bg-[#121f2d]">
                  <span className="text-[9px] text-slate-400 block">Tenth-Value Layer (TVL)</span>
                  <span className="text-sm font-bold text-cyan-300">{rt.tenthValueLayerCm} cm</span>
                </div>
              </div>

              {/* Geometric unsharpness verification */}
              <div className="p-2.5 rounded bg-[#121f2d] border border-slate-700/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase block">Geometric Unsharpness (Ug)</span>
                  <span className="font-mono font-bold text-sm text-white">{rt.geometricUnsharpnessMm} mm</span>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    rt.unsharpnessAcceptable ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {rt.unsharpnessAcceptable ? 'ASME Ug PASS (<0.51mm)' : 'Ug EXCEEDS LIMIT'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 3. ET Solver */}
      {methodCode === 'ET' && (() => {
        const et = calculateEddyCurrentSkinDepth(
          etFrequencyHz,
          relPermeability,
          conductivityPctIACS
        );

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold block">
                Eddy Current Test Parameters
              </span>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Test Frequency (Hz):</label>
                  <input
                    type="number"
                    step={5000}
                    value={etFrequencyHz}
                    onChange={(e) => setEtFrequencyHz(Math.max(10, Number(e.target.value)))}
                    className="w-full px-2 py-1 rounded bg-[#101b28] border border-[#1b2f44] text-xs font-mono text-white"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-0.5">
                    <span>10 kHz (Deep sub-surface)</span>
                    <span>100 kHz (Standard tubing)</span>
                    <span>1 MHz (Thin coatings)</span>
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Relative Permeability µ_r:</label>
                  <input
                    type="number"
                    step={0.1}
                    value={relPermeability}
                    onChange={(e) => setRelPermeability(Math.max(1.0, Number(e.target.value)))}
                    className="w-full px-2 py-1 rounded bg-[#101b28] border border-[#1b2f44] text-xs font-mono text-white"
                  />
                  <span className="text-[9px] text-slate-500">
                    µ_r = 1.0 for non-magnetic (Al, Cu, Austenitic SS); ~100-300 for ferromagnetic carbon steels.
                  </span>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Conductivity (% IACS):</label>
                  <input
                    type="number"
                    step={1}
                    value={conductivityPctIACS}
                    onChange={(e) => setConductivityPctIACS(Math.max(0.1, Number(e.target.value)))}
                    className="w-full px-2 py-1 rounded bg-[#101b28] border border-[#1b2f44] text-xs font-mono text-white"
                  />
                  <span className="text-[9px] text-slate-500">
                    Copper = 100% IACS, Aluminum 6061-T6 ~ 43%, Stainless 316 ~ 2.3%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#0e1724] border border-[#172739] rounded-lg p-3 space-y-3">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                Standard Depth of Penetration (SDP)
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-[#121f2d] border border-amber-900/30">
                  <span className="text-[9px] text-slate-400 block">1-Delta Skin Depth (δ)</span>
                  <span className="text-lg font-bold text-amber-300">{et.standardSkinDepthMm} mm</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">37% current density</span>
                </div>
                <div className="p-2.5 rounded bg-[#121f2d] border border-amber-900/30">
                  <span className="text-[9px] text-slate-400 block">Effective Depth (3δ)</span>
                  <span className="text-lg font-bold text-cyan-300">{et.effectivePenetrationDepthMm} mm</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">5% current cutoff</span>
                </div>
              </div>

              <div className="p-2 rounded bg-[#101a26] text-xs font-mono space-y-1">
                <div className="text-[10px] text-slate-400 uppercase">Standard Skin Depth Formula:</div>
                <div className="text-cyan-300">δ = 1 / √(π · f · µ · σ) = 50.3 · √(1 / (f · µ_r · σ_%IACS))</div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 4. PT Solver */}
      {methodCode === 'PT' && (() => {
        // Jurin's Law capillary rise: h = 2 * gamma * cos(theta) / (rho * g * r)
        // gamma in N/m, theta in rad, rho in kg/m3 (approx 850 for oil penetrant), g = 9.81 m/s2, r in m
        const gamma = surfaceTensionMilliN * 1e-3; // N/m
        const thetaRad = (contactAngleDeg * Math.PI) / 180;
        const rho = 850; // kg/m3
        const g = 9.81;
        const r = (crackWidthMicrons * 1e-6) / 2; // radius
        const hMeters = (2 * gamma * Math.cos(thetaRad)) / (rho * g * r);
        const capillaryPressureKPa = (2 * gamma * Math.cos(thetaRad)) / r / 1000;

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase text-teal-400 font-semibold block">
                Penetrant Fluid Dynamics & Crack Geometry
              </span>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Liquid Surface Tension γ (mN/m):</label>
                  <input
                    type="number"
                    value={surfaceTensionMilliN}
                    onChange={(e) => setSurfaceTensionMilliN(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-[#101b28] border border-[#1b2f44] text-xs font-mono text-white"
                  />
                  <span className="text-[9px] text-slate-500">Typical visible/fluorescent penetrants: 28 – 36 mN/m</span>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Wetting Contact Angle θ (°):</label>
                  <input
                    type="number"
                    value={contactAngleDeg}
                    onChange={(e) => setContactAngleDeg(Math.max(0, Math.min(89, Number(e.target.value))))}
                    className="w-full px-2 py-1 rounded bg-[#101b28] border border-[#1b2f44] text-xs font-mono text-white"
                  />
                  <span className="text-[9px] text-slate-500">Lower contact angle implies superior spontaneous wetting (cos θ → 1)</span>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Surface Crack Width w (µm):</label>
                  <input
                    type="number"
                    step={0.5}
                    value={crackWidthMicrons}
                    onChange={(e) => setCrackWidthMicrons(Math.max(0.1, Number(e.target.value)))}
                    className="w-full px-2 py-1 rounded bg-[#101b28] border border-[#1b2f44] text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#0e1724] border border-[#172739] rounded-lg p-3 space-y-3">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                Capillary Ingress Pressure (Jurin's Principle)
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-[#121f2d] border border-teal-900/30">
                  <span className="text-[9px] text-slate-400 block">Capillary Suction ΔP</span>
                  <span className="text-lg font-bold text-teal-300">{capillaryPressureKPa.toFixed(1)} kPa</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Driving suction head</span>
                </div>
                <div className="p-2.5 rounded bg-[#121f2d] border border-teal-900/30">
                  <span className="text-[9px] text-slate-400 block">Equilibrium Height (h)</span>
                  <span className="text-lg font-bold text-cyan-300">{(hMeters).toFixed(2)} m</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Theoretical meniscus rise</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#101a26] text-xs text-slate-300 leading-relaxed">
                As crack opening dimension narrows (r → 0), capillary suction pressure increases inversely, pulling the penetrant into microscopic fatigue cracks during dwell time.
              </div>
            </div>
          </div>
        );
      })()}

      {/* 5. MT Solver */}
      {methodCode === 'MT' && (() => {
        // ASTM E709 / ASME Sec V Longitudinal coil magnetization:
        // Ampere-turns NI = 45000 / (L / D) for parts where L/D is between 2 and 4
        // NI = 35000 / (L/D + 2) for L/D >= 4
        const ldRatio = partLengthMm / Math.max(1, partDiameterMm);
        let ampereTurns = 0;
        if (ldRatio >= 2 && ldRatio < 4) {
          ampereTurns = Math.round(45000 / ldRatio);
        } else if (ldRatio >= 4) {
          ampereTurns = Math.round(35000 / (ldRatio + 2));
        } else {
          ampereTurns = 25000;
        }

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold block">
                Part Dimensions & Coil Magnetization
              </span>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Part Length L (mm):</label>
                  <input
                    type="number"
                    value={partLengthMm}
                    onChange={(e) => setPartLengthMm(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-[#101b28] border border-[#1b2f44] text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Part Diameter D (mm):</label>
                  <input
                    type="number"
                    value={partDiameterMm}
                    onChange={(e) => setPartDiameterMm(Math.max(1, Number(e.target.value)))}
                    className="w-full px-2 py-1 rounded bg-[#101b28] border border-[#1b2f44] text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#0e1724] border border-[#172739] rounded-lg p-3 space-y-3">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                Required Magnetizing Force (ASTM E709)
              </span>
              <div className="p-3 rounded bg-[#121f2d] border border-amber-900/40 text-xs font-mono">
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-400">L/D Aspect Ratio:</span>
                  <span className="font-bold text-white text-sm">{ldRatio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-baseline mt-2">
                  <span className="text-slate-400">Required Coil Ampere-Turns (NI):</span>
                  <span className="font-bold text-amber-400 text-base">{ampereTurns.toLocaleString()} A-t</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 leading-relaxed">
                For a 5-turn coil, required current I = {Math.round(ampereTurns / 5)} Amperes AC/HWDC.
                Flux leakage creates external north-south magnetic poles across transverse cracks, trapping ferromagnetic particles.
              </div>
            </div>
          </div>
        );
      })()}

      {/* 6. VT Solver */}
      {methodCode === 'VT' && (() => {
        const isLuxCompliant = lightLevelLux >= 1076; // ASME Sec V Art 9 requires min 100 fc (1076 lux)
        const isAngleCompliant = viewingAngleDeg >= 30;
        const isDistanceCompliant = viewingDistanceMm <= 600; // ASME max 24 inches (600 mm)

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase text-teal-400 font-semibold block">
                Visual Inspection Ergonomics & Illumination
              </span>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Surface Illuminance (Lux):</label>
                  <input
                    type="number"
                    value={lightLevelLux}
                    onChange={(e) => setLightLevelLux(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-[#101b28] border border-[#1b2f44] text-xs font-mono text-white"
                  />
                  <span className="text-[9px] text-slate-500">ASME Article 9 threshold: ≥ 1076 Lux (100 foot-candles)</span>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Viewing Distance (mm):</label>
                  <input
                    type="number"
                    value={viewingDistanceMm}
                    onChange={(e) => setViewingDistanceMm(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-[#101b28] border border-[#1b2f44] text-xs font-mono text-white"
                  />
                  <span className="text-[9px] text-slate-500">Maximum allowable direct distance: ≤ 600 mm (24 inches)</span>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Viewing Angle (° to surface):</label>
                  <input
                    type="number"
                    value={viewingAngleDeg}
                    onChange={(e) => setViewingAngleDeg(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-[#101b28] border border-[#1b2f44] text-xs font-mono text-white"
                  />
                  <span className="text-[9px] text-slate-500">Minimum line-of-sight angle: ≥ 30°</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0e1724] border border-[#172739] rounded-lg p-3 space-y-2.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                ASME Section V Article 9 Verification
              </span>
              <div className="space-y-2 text-xs font-mono">
                <div className={`p-2 rounded flex justify-between items-center ${
                  isLuxCompliant ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-800/60' : 'bg-rose-950/60 text-rose-200 border border-rose-800/60'
                }`}>
                  <span>Illumination (≥1076 Lux):</span>
                  <span className="font-bold">{isLuxCompliant ? 'PASS' : 'FAIL (Dim)'}</span>
                </div>
                <div className={`p-2 rounded flex justify-between items-center ${
                  isDistanceCompliant ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-800/60' : 'bg-rose-950/60 text-rose-200 border border-rose-800/60'
                }`}>
                  <span>Distance (≤600 mm):</span>
                  <span className="font-bold">{isDistanceCompliant ? 'PASS' : 'FAIL (Too far)'}</span>
                </div>
                <div className={`p-2 rounded flex justify-between items-center ${
                  isAngleCompliant ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-800/60' : 'bg-rose-950/60 text-rose-200 border border-rose-800/60'
                }`}>
                  <span>Angle (≥30°):</span>
                  <span className="font-bold">{isAngleCompliant ? 'PASS' : 'FAIL (Too shallow)'}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
