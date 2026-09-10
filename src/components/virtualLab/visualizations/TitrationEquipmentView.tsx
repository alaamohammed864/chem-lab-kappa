// Acid-Base Titration Equipment Visualization
// Decoupled graphic representation of laboratory burette, Erlenmeyer flask, pH probe, and magnetic stirrer.

import React from 'react';
import { TitrationState, TitrationParams } from '../../../engines/simulation';

interface TitrationEquipmentViewProps {
  state: TitrationState;
  params: TitrationParams;
  isArabic?: boolean;
}

export const TitrationEquipmentView: React.FC<TitrationEquipmentViewProps> = ({
  state,
  params,
  isArabic = false,
}) => {
  const buretteFraction = Math.max(0, Math.min(1, state.buretteRemaining / params.buretteCapacity));
  const liquidLevelY = 60 + (1 - buretteFraction) * 140; // 60 (full) to 200 (empty)
  const flaskVolumeFraction = Math.min(1, state.solutionVolume / 80);
  const flaskLiquidHeight = 35 + flaskVolumeFraction * 35; // 35 to 70

  return (
    <div className="relative w-full h-full min-h-[340px] flex items-center justify-center p-2 select-none">
      <svg
        viewBox="0 0 460 380"
        className="w-full h-full max-h-[360px] drop-shadow-lg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Glass Gradients */}
          <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="25%" stopColor="#38bdf8" stopOpacity="0.08" />
            <stop offset="75%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
          </linearGradient>

          {/* Metal Stand */}
          <linearGradient id="metalGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          <filter id="glowDrop" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#38bdf8" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* --- 1. Laboratory Retort Stand & Clamps --- */}
        {/* Stand Base */}
        <rect x="50" y="340" width="340" height="14" rx="3" fill="url(#metalGrad)" stroke="#0f172a" strokeWidth="1.5" />
        <rect x="70" y="342" width="40" height="4" rx="1" fill="#94a3b8" opacity="0.4" />

        {/* Vertical Stand Rod */}
        <rect x="100" y="30" width="8" height="310" rx="2" fill="url(#metalGrad)" stroke="#0f172a" strokeWidth="1" />

        {/* Burette Top Clamp */}
        <path d="M 108 90 L 195 90 L 195 98 L 108 98 Z" fill="#475569" stroke="#1e293b" />
        <circle cx="108" cy="94" r="5" fill="#64748b" stroke="#0f172a" />
        <rect x="190" y="85" width="22" height="16" rx="2" fill="#334155" stroke="#0f172a" />

        {/* Burette Bottom Clamp */}
        <path d="M 108 190 L 195 190 L 195 198 L 108 198 Z" fill="#475569" stroke="#1e293b" />
        <circle cx="108" cy="194" r="5" fill="#64748b" stroke="#0f172a" />
        <rect x="190" y="185" width="22" height="16" rx="2" fill="#334155" stroke="#0f172a" />

        {/* --- 2. Magnetic Stirrer Base Plate --- */}
        <rect x="140" y="305" width="160" height="35" rx="6" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />
        {/* Ceramic Top Plate */}
        <rect x="145" y="305" width="150" height="6" rx="2" fill="#e2e8f0" stroke="#cbd5e1" />
        {/* Digital RPM Display */}
        <rect x="155" y="318" width="52" height="16" rx="3" fill="#020617" stroke="#334155" />
        <text
          x="181"
          y="330"
          fill="#38bdf8"
          fontFamily="monospace"
          fontSize="10"
          fontWeight="bold"
          textAnchor="middle"
        >
          {state.isStirring ? `${params.stirrerSpeed} RPM` : '0 RPM'}
        </text>
        {/* Knob */}
        <circle cx="275" cy="324" r="7" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
        <line x1="275" y1="324" x2="275" y2="319" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />

        {/* --- 3. Erlenmeyer Flask --- */}
        <g id="erlenmeyer-flask">
          {/* Flask Body Path: Neck width 24 (188 to 212), Base width 90 (155 to 245), Height from y=240 to 305 */}
          <path
            d="M 191 230 L 209 230 L 209 245 L 244 298 C 248 303 242 305 235 305 L 165 305 C 158 305 152 303 156 298 L 191 245 Z"
            fill="url(#glassGrad)"
            stroke="#94a3b8"
            strokeWidth="1.2"
          />
          <ellipse cx="200" cy="230" rx="9" ry="2" fill="#ffffff" opacity="0.2" stroke="#94a3b8" strokeWidth="0.8" />

          {/* Liquid Inside Erlenmeyer */}
          <clipPath id="flaskClip">
            <path d="M 191 230 L 209 230 L 209 245 L 244 298 C 248 303 242 305 235 305 L 165 305 C 158 305 152 303 156 298 L 191 245 Z" />
          </clipPath>

          <g clipPath="url(#flaskClip)">
            {/* Liquid Fill with Dynamic Indicator Color */}
            <rect
              x="145"
              y={305 - flaskLiquidHeight}
              width="110"
              height={flaskLiquidHeight}
              fill={state.indicatorColorHex}
              className="transition-colors duration-500"
            />
            {/* Liquid Surface Meniscus */}
            <ellipse
              cx="200"
              cy={305 - flaskLiquidHeight}
              rx={18 + (flaskLiquidHeight / 70) * 24}
              ry="3"
              fill={state.indicatorColorHex}
              opacity="0.9"
              stroke="#ffffff"
              strokeWidth="0.5"
            />

            {/* Rotating Magnetic Stir Bar */}
            <g
              transform={`translate(200, 301) ${
                state.isStirring ? 'rotate(30)' : 'rotate(0)'
              }`}
              className={state.isStirring ? 'animate-spin origin-center' : ''}
              style={{ transformOrigin: '200px 301px' }}
            >
              <rect x="188" y="299" width="24" height="4" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            </g>
          </g>

          {/* Volume Graduation Lines on Flask */}
          <line x1="184" y1="285" x2="192" y2="285" stroke="#94a3b8" strokeWidth="0.8" opacity="0.6" />
          <line x1="188" y1="270" x2="194" y2="270" stroke="#94a3b8" strokeWidth="0.8" opacity="0.6" />
          <line x1="192" y1="255" x2="196" y2="255" stroke="#94a3b8" strokeWidth="0.8" opacity="0.6" />
        </g>

        {/* --- 4. Calibrated Glass Burette --- */}
        <g id="burette-assembly">
          {/* Glass Tube: width 12 (194 to 206), height 40 to 200 */}
          <rect x="194" y="40" width="12" height="160" fill="url(#glassGrad)" stroke="#94a3b8" strokeWidth="1" />
          {/* Burette Top Funnel Lip */}
          <path d="M 191 40 L 209 40 L 206 45 L 194 45 Z" fill="#e2e8f0" opacity="0.4" stroke="#94a3b8" strokeWidth="0.8" />

          {/* Liquid in Burette */}
          {liquidLevelY < 200 && (
            <rect
              x="195"
              y={liquidLevelY}
              width="10"
              height={200 - liquidLevelY}
              fill="#38bdf8"
              opacity="0.35"
            />
          )}
          {/* Liquid Meniscus */}
          {liquidLevelY < 200 && (
            <ellipse cx="200" cy={liquidLevelY} rx="5" ry="1.5" fill="#38bdf8" opacity="0.6" />
          )}

          {/* Calibrated Tick Marks & Numbers (0 to 50 mL) */}
          {[0, 10, 20, 30, 40, 50].map((val, idx) => {
            const y = 60 + idx * 26;
            return (
              <g key={val}>
                <line x1="194" y1={y} x2="198" y2={y} stroke="#64748b" strokeWidth="0.8" />
                <line x1="194" y1={y + 13} x2="196" y2={y + 13} stroke="#64748b" strokeWidth="0.5" />
                <text x="190" y={y + 3} fill="#94a3b8" fontSize="7" fontFamily="monospace" textAnchor="end">
                  {val}
                </text>
              </g>
            );
          })}

          {/* Burette Stopcock Valve (y=200 to 216) */}
          <path d="M 197 200 L 203 200 L 202 210 L 198 210 Z" fill="#94a3b8" stroke="#475569" />
          {/* Valve Stopcock Handle */}
          <rect
            x={state.isRunning ? 193 : 188}
            y="204"
            width={state.isRunning ? 14 : 24}
            height="4"
            rx="1.5"
            fill={state.isRunning ? '#10b981' : '#f59e0b'}
            stroke="#0f172a"
            strokeWidth="0.8"
          />
          {/* Burette Delivery Tip (y=210 to 226) */}
          <path d="M 199 210 L 201 210 L 200.5 224 L 199.5 224 Z" fill="url(#glassGrad)" stroke="#94a3b8" strokeWidth="0.8" />

          {/* Falling Drops Animation */}
          {(state.isRunning || state.dropAnimationActive) && (
            <g id="animated-drop" filter="url(#glowDrop)">
              <circle cx="200" cy="235" r="2" fill="#38bdf8" className="animate-bounce" />
            </g>
          )}
        </g>

        {/* --- 5. Potentiometric Digital pH Meter & Submerged Electrode --- */}
        <g id="ph-meter-station">
          {/* Benchtop pH Meter Console */}
          <rect x="315" y="160" width="115" height="110" rx="8" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />
          <rect x="325" y="170" width="95" height="38" rx="4" fill="#020617" stroke="#334155" />
          {/* Digital pH Readout */}
          <text x="372" y="196" fill="#38bdf8" fontFamily="monospace" fontSize="20" fontWeight="bold" textAnchor="middle">
            {state.currentPH.toFixed(2)}
          </text>
          <text x="412" y="182" fill="#64748b" fontFamily="sans-serif" fontSize="8" fontWeight="bold">
            pH
          </text>

          {/* Status Indicators on meter */}
          <circle cx="335" cy="225" r="3" fill="#10b981" />
          <text x="343" y="228" fill="#94a3b8" fontSize="8" fontFamily="sans-serif">
            CAL OK
          </text>
          <text x="335" y="248" fill="#64748b" fontSize="8" fontFamily="monospace">
            mV: {((7 - state.currentPH) * 59.16).toFixed(0)}
          </text>
          <text x="335" y="260" fill="#64748b" fontSize="8" fontFamily="monospace">
            T: 25.0 °C
          </text>

          {/* Flexible Cable from Meter to Probe */}
          <path
            d="M 325 250 C 290 260, 260 210, 218 240"
            fill="none"
            stroke="#475569"
            strokeWidth="2"
            strokeDasharray="2 1"
          />

          {/* Submerged Glass Combination pH Electrode */}
          <g transform="rotate(10 218 240)">
            <rect x="215" y="235" width="5" height="52" rx="2" fill="#0284c7" opacity="0.8" stroke="#0369a1" strokeWidth="0.8" />
            {/* Sensitive Glass Bulb Tip */}
            <circle cx="217.5" cy="287" r="3.5" fill="#38bdf8" opacity="0.9" stroke="#ffffff" strokeWidth="0.8" />
          </g>
        </g>

        {/* Labels Overlay */}
        <g id="equipment-labels" opacity="0.8">
          <text x="215" y="65" fill="#94a3b8" fontSize="8" fontFamily="monospace">
            {isArabic ? 'سحاحة 50 مل' : 'Burette (0.1M NaOH)'}
          </text>
          <text x="215" y="75" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold">
            {state.titrantAdded.toFixed(2)} mL added
          </text>

          <text x="140" y="270" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="end">
            {isArabic ? 'دورق إرلنماير' : 'Erlenmeyer'}
          </text>
          <text x="140" y="280" fill="#cbd5e1" fontSize="7" fontFamily="monospace" textAnchor="end">
            {params.analyteType === 'weak_acid_acetic' ? 'CH₃COOH (Weak)' : 'HCl (Strong)'}
          </text>
        </g>
      </svg>
    </div>
  );
};
