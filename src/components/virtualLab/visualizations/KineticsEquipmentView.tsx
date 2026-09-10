// Chemical Kinetics & Optical Bench Visualization
// Decoupled graphic representation of spectrophotometric cuvette, monochromatic beam, photodetector, and reaction stopwatch.

import React from 'react';
import { KineticsState, KineticsParams } from '../../../engines/simulation';

interface KineticsEquipmentViewProps {
  state: KineticsState;
  params: KineticsParams;
  isArabic?: boolean;
}

export const KineticsEquipmentView: React.FC<KineticsEquipmentViewProps> = ({
  state,
  params,
  isArabic = false,
}) => {
  const concFraction = Math.max(0.05, Math.min(1, state.currentConcA / (params.initialConcA || 40)));
  const transmittedBeamOpacity = Math.max(0.15, Math.min(0.95, state.currentTransmittancePct / 100));

  return (
    <div className="relative w-full h-full min-h-[340px] flex items-center justify-center p-2 select-none">
      <svg
        viewBox="0 0 460 380"
        className="w-full h-full max-h-[360px] drop-shadow-lg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="beamGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.7" />
          </linearGradient>

          <filter id="beamGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Benchtop Surface */}
        <rect x="30" y="330" width="400" height="16" rx="3" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />

        {/* --- 1. Optical Bench Rail --- */}
        <rect x="50" y="270" width="360" height="12" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="1.2" />
        <rect x="70" y="273" width="320" height="2" rx="1" fill="#64748b" opacity="0.6" />

        {/* --- 2. Light Source & Monochromator Assembly (Left) --- */}
        <g id="light-source" transform="translate(60, 160)">
          {/* Lamp Housing */}
          <rect x="0" y="0" width="70" height="90" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
          {/* Cooling Vents */}
          <line x1="12" y1="18" x2="58" y2="18" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="26" x2="58" y2="26" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="34" x2="58" y2="34" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />

          {/* Lamp Collimating Lens Tube */}
          <path d="M 70 35 L 88 40 L 88 50 L 70 55 Z" fill="#475569" stroke="#334155" />
          <ellipse cx="88" cy="45" rx="3" ry="5" fill="#38bdf8" opacity="0.8" />

          {/* Light Bulb Filament Glow inside */}
          <circle cx="35" cy="55" r="10" fill="#facc15" opacity="0.8" filter="url(#beamGlow)" />
          <text x="35" y="78" fill="#94a3b8" fontSize="7" fontFamily="monospace" textAnchor="middle">
            LAMP 550nm
          </text>
        </g>

        {/* Incident Optical Beam (Left to Cuvette) */}
        <g id="incident-beam" filter="url(#beamGlow)">
          <polygon
            points="148,202 210,200 210,210 148,208"
            fill="url(#beamGrad)"
            opacity="0.85"
          />
        </g>

        {/* --- 3. Thermostatted Optical Cuvette Holder (Center) --- */}
        <g id="cuvette-holder" transform="translate(210, 140)">
          {/* Cuvette Compartment Base */}
          <rect x="-8" y="80" width="56" height="50" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          <text x="20" y="120" fill="#64748b" fontSize="7" fontFamily="sans-serif" textAnchor="middle">
            {params.temperatureCelsius} °C BATH
          </text>

          {/* Quartz Glass Cuvette: width 40 (0 to 40), height 100 (0 to 100) */}
          <rect x="0" y="0" width="40" height="95" rx="3" fill="#ffffff" fillOpacity="0.08" stroke="#94a3b8" strokeWidth="1.2" />

          {/* Liquid Inside Cuvette with Fading Reaction Dye Color */}
          <rect
            x="2"
            y="12"
            width="36"
            height="81"
            rx="2"
            fill={state.colorOpacityHex}
            className="transition-colors duration-300"
          />
          {/* Fluid Meniscus */}
          <ellipse cx="20" cy="12" rx="18" ry="3" fill={state.colorOpacityHex} opacity="0.9" stroke="#ffffff" strokeWidth="0.5" />

          {/* Optical Path Crosshairs (1 cm path length) */}
          <line x1="0" y1="65" x2="40" y2="65" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.7" />
          <text x="20" y="60" fill="#ffffff" fontSize="7" fontFamily="monospace" textAnchor="middle" opacity="0.9">
            b = 1.0 cm
          </text>
        </g>

        {/* Transmitted Light Beam (Cuvette to Detector) */}
        <g id="transmitted-beam" filter="url(#beamGlow)">
          <polygon
            points="250,201 315,203 315,207 250,209"
            fill="#a78bfa"
            opacity={transmittedBeamOpacity}
            className="transition-opacity duration-300"
          />
        </g>

        {/* --- 4. Photodetector Sensor Assembly (Right) --- */}
        <g id="photodetector" transform="translate(315, 160)">
          {/* Detector Housing */}
          <rect x="0" y="0" width="75" height="90" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
          {/* Input Aperture Slit */}
          <rect x="-6" y="38" width="6" height="14" rx="1" fill="#475569" />
          <line x1="0" y1="40" x2="0" y2="50" stroke="#a78bfa" strokeWidth="2" />

          <text x="37" y="24" fill="#94a3b8" fontSize="7" fontFamily="monospace" textAnchor="middle">
            PHOTODIODE
          </text>

          {/* Intensity LED Bar Graph on detector */}
          <rect x="12" y="36" width="50" height="8" rx="2" fill="#020617" stroke="#334155" />
          <rect
            x="13"
            y="37"
            width={Math.max(2, 48 * (state.currentTransmittancePct / 100))}
            height="6"
            rx="1"
            fill="#38bdf8"
            className="transition-all duration-300"
          />
          <text x="37" y="60" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">
            {state.currentTransmittancePct.toFixed(1)}% T
          </text>
        </g>

        {/* --- 5. Digital Reaction Stopwatch & Kinetic Readout --- */}
        <g id="reaction-timer" transform="translate(170, 45)">
          <rect x="0" y="0" width="120" height="60" rx="8" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />
          <rect x="8" y="8" width="104" height="28" rx="4" fill="#020617" stroke="#334155" />
          {/* Elapsed Timer Display */}
          <text x="60" y="27" fill="#38bdf8" fontFamily="monospace" fontSize="16" fontWeight="bold" textAnchor="middle">
            {state.simTime.toFixed(1)} s
          </text>
          <text x="60" y="48" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">
            Abs: {state.currentAbsorbance.toFixed(3)}
          </text>
        </g>

        {/* Labels Overlay */}
        <text x="230" y="250" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">
          {isArabic ? 'خلية امتصاص كوارتز 1 سم' : 'Quartz Cuvette (1.0 cm)'}
        </text>
        <text x="230" y="262" fill="#a78bfa" fontSize="8" fontFamily="monospace" textAnchor="middle">
          [Dye] = {state.currentConcA.toFixed(1)} µM
        </text>
      </svg>
    </div>
  );
};
