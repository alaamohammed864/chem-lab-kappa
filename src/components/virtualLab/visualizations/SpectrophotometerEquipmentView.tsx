// Spectrophotometry & Beer-Lambert Law Equipment Visualization
// Decoupled graphic representation of spectrophotometer instrument chassis, monochromator grating, cuvette compartment, and dual-readout LCD.

import React from 'react';
import { SpectrophotometryState, SpectrophotometryParams } from '../../../engines/simulation';

interface SpectrophotometerEquipmentViewProps {
  state: SpectrophotometryState;
  params: SpectrophotometryParams;
  isArabic?: boolean;
}

export const SpectrophotometerEquipmentView: React.FC<SpectrophotometerEquipmentViewProps> = ({
  state,
  params,
  isArabic = false,
}) => {
  const isCuvetteEmpty = state.currentCuvetteContent === 'blank_water';
  const solutionColor = isCuvetteEmpty
    ? '#ffffff20'
    : params.solute === 'copper_sulfate'
    ? 'rgba(56, 189, 248, 0.75)'
    : params.solute === 'food_dye_blue'
    ? 'rgba(37, 99, 235, 0.75)'
    : 'rgba(239, 68, 68, 0.75)';

  return (
    <div className="relative w-full h-full min-h-[340px] flex items-center justify-center p-2 select-none">
      <svg
        viewBox="0 0 460 380"
        className="w-full h-full max-h-[360px] drop-shadow-lg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="chassisGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="60%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Rainbow Spectrum Monochromator Gradient */}
          <linearGradient id="spectrumGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="20%" stopColor="#3b82f6" />
            <stop offset="40%" stopColor="#10b981" />
            <stop offset="60%" stopColor="#eab308" />
            <stop offset="80%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>

          <filter id="laserGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Benchtop Stand */}
        <rect x="30" y="335" width="400" height="15" rx="3" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />

        {/* --- 1. Spectrophotometer Main Instrument Chassis --- */}
        <rect x="50" y="90" width="360" height="240" rx="14" fill="url(#chassisGrad)" stroke="#334155" strokeWidth="2" />
        {/* Decorative Top Accent Line */}
        <line x1="65" y1="102" x2="395" y2="102" stroke="#38bdf8" strokeWidth="1.5" opacity="0.4" />

        {/* Brand & Model Badge */}
        <text x="75" y="125" fill="#f8fafc" fontSize="12" fontFamily="monospace" fontWeight="bold">
          SPECTRO-QUANT 2026
        </text>
        <text x="75" y="137" fill="#64748b" fontSize="8" fontFamily="sans-serif">
          UV-VIS SINGLE-BEAM SPECTROPHOTOMETER
        </text>

        {/* --- 2. Dual Digital LCD Display Panel --- */}
        <g id="instrument-lcd" transform="translate(235, 115)">
          <rect x="0" y="0" width="160" height="85" rx="6" fill="#020617" stroke="#1e293b" strokeWidth="1.5" />

          {/* Screen Inner Bezel */}
          <rect x="6" y="6" width="148" height="73" rx="4" fill="#071520" stroke="#0e2a3f" />

          {/* Absorbance Readout */}
          <text x="14" y="26" fill="#64748b" fontSize="8" fontFamily="sans-serif">
            ABSORBANCE (A)
          </text>
          <text x="14" y="52" fill="#38bdf8" fontFamily="monospace" fontSize="22" fontWeight="bold">
            {state.currentAbsorbance.toFixed(3)}
          </text>

          {/* Transmittance % Readout */}
          <text x="96" y="26" fill="#64748b" fontSize="8" fontFamily="sans-serif">
            TRANSMITTANCE
          </text>
          <text x="96" y="52" fill="#10b981" fontFamily="monospace" fontSize="18" fontWeight="bold">
            {state.currentTransmittancePct.toFixed(1)}%
          </text>

          {/* Sub-bar: Wavelength and Calibration Status */}
          <line x1="6" y1="60" x2="154" y2="60" stroke="#0e2a3f" />
          <text x="14" y="72" fill="#94a3b8" fontSize="8" fontFamily="monospace">
            λ = {params.selectedWavelengthNm} nm
          </text>
          <text x="96" y="72" fill={state.isBlankCalibrated ? '#34d399' : '#f59e0b'} fontSize="7" fontFamily="sans-serif" fontWeight="bold">
            {state.isBlankCalibrated ? '● ZERO OK' : '○ RE-ZERO'}
          </text>
        </g>

        {/* --- 3. Optical Monochromator Grating Visual (Lower Left) --- */}
        <g id="optical-monochromator" transform="translate(75, 175)">
          <rect x="0" y="0" width="135" height="125" rx="6" fill="#091017" stroke="#1e293b" strokeWidth="1.2" />
          <text x="10" y="18" fill="#64748b" fontSize="7" fontFamily="monospace">
            DIFFRACTION MONOCHROMATOR
          </text>

          {/* Tungsten Halogen Light Source */}
          <circle cx="25" cy="45" r="10" fill="#fef08a" opacity="0.8" />
          <text x="25" y="65" fill="#94a3b8" fontSize="6" fontFamily="monospace" textAnchor="middle">
            SOURCE
          </text>

          {/* Dispersed Continuous Spectrum Bar */}
          <rect x="45" y="38" width="75" height="12" rx="2" fill="url(#spectrumGrad)" />

          {/* Monochromator Exit Slit Selector */}
          <rect
            x={45 + ((params.selectedWavelengthNm - 400) / 350) * 70}
            y="35"
            width="5"
            height="18"
            rx="1"
            fill="#ffffff"
            stroke="#0f172a"
            strokeWidth="0.8"
          />

          {/* Selected Wavelength Monochromatic Beam exiting right */}
          <line
            x1="120"
            y1="44"
            x2="155"
            y2="44"
            stroke={state.beamColorHex}
            strokeWidth="3"
            filter="url(#laserGlow)"
          />

          <text x="68" y="75" fill="#64748b" fontSize="7" fontFamily="monospace" textAnchor="middle">
            λ Selector: {params.selectedWavelengthNm} nm
          </text>
        </g>

        {/* --- 4. Sample Compartment with Cuvette (Lower Right) --- */}
        <g id="sample-compartment" transform="translate(235, 215)">
          {/* Sample Compartment Chamber (Cutaway view) */}
          <rect x="0" y="0" width="160" height="85" rx="6" fill="#091017" stroke="#334155" strokeWidth="1.5" />
          <text x="10" y="16" fill="#94a3b8" fontSize="8" fontFamily="monospace">
            SAMPLE COMPARTMENT
          </text>

          {/* Cuvette Slot */}
          <rect x="58" y="22" width="44" height="55" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1" />

          {/* Optical Cuvette with liquid solution */}
          <rect x="62" y="24" width="36" height="50" rx="2" fill="#ffffff" fillOpacity="0.1" stroke="#cbd5e1" strokeWidth="1" />
          {/* Liquid inside cuvette */}
          <rect x="64" y="32" width="32" height="40" rx="1" fill={solutionColor} />

          {/* Incoming Monochromatic Light Beam */}
          <line
            x1="0"
            y1="50"
            x2="58"
            y2="50"
            stroke={state.beamColorHex}
            strokeWidth="3"
            filter="url(#laserGlow)"
          />

          {/* Transmitted Light Beam exiting cuvette to detector */}
          <line
            x1="102"
            y1="50"
            x2="148"
            y2="50"
            stroke={state.beamColorHex}
            strokeWidth={Math.max(1, 3 * (state.currentTransmittancePct / 100))}
            opacity={Math.max(0.15, state.currentTransmittancePct / 100)}
            filter="url(#laserGlow)"
          />

          {/* Photodiode Detector icon */}
          <rect x="148" y="42" width="6" height="16" rx="1" fill="#38bdf8" />
        </g>

        {/* Labels Overlay */}
        <text x="315" y="320" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">
          {isArabic ? 'حامل عينات القياس الطيفي' : `Cuvette: ${state.currentCuvetteContent.replace('_', ' ').toUpperCase()}`}
        </text>
      </svg>
    </div>
  );
};
