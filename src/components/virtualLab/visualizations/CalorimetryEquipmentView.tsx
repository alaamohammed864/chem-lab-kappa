// Solution Calorimetry Equipment Visualization
// Cross-sectional graphic representation of insulated calorimeter, immersion temperature sensor, and dissolution dynamics.

import React from 'react';
import { CalorimetryState, CalorimetryParams } from '../../../engines/simulation';

interface CalorimetryEquipmentViewProps {
  state: CalorimetryState;
  params: CalorimetryParams;
  isArabic?: boolean;
}

export const CalorimetryEquipmentView: React.FC<CalorimetryEquipmentViewProps> = ({
  state,
  params,
  isArabic = false,
}) => {
  const isExothermic = state.deltaTemp >= 0;
  const heatGlowColor = isExothermic ? '#f97316' : '#06b6d4';
  const tempRatio = Math.max(0, Math.min(1, (state.currentTemp - 15) / 30));
  const mercuryHeight = 30 + tempRatio * 110;

  return (
    <div className="relative w-full h-full min-h-[340px] flex items-center justify-center p-2 select-none">
      <svg
        viewBox="0 0 460 380"
        className="w-full h-full max-h-[360px] drop-shadow-lg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="calorimeterOuterGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.6" />
          </linearGradient>

          <filter id="thermalGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Benchtop Surface */}
        <rect x="40" y="340" width="380" height="15" rx="3" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />

        {/* --- 1. Calorimeter Cutaway Body --- */}
        {/* Outer Insulated Shell */}
        <rect x="110" y="160" width="180" height="175" rx="12" fill="url(#calorimeterOuterGrad)" stroke="#475569" strokeWidth="2" />

        {/* Polystyrene Vacuum/Air Gap Insulation Layer */}
        <rect x="122" y="172" width="156" height="155" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 2" />

        {/* Inner Stainless Reaction Vessel */}
        <rect x="135" y="185" width="130" height="135" rx="6" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />

        {/* Solution Fluid Fill */}
        <rect x="137" y="215" width="126" height="103" rx="4" fill="url(#waterGrad)" />
        <ellipse cx="200" cy="215" rx="63" ry="5" fill="#38bdf8" opacity="0.6" stroke="#e0f2fe" strokeWidth="0.8" />

        {/* Floating Dissolving Salt Crystals */}
        {state.soluteAdded && state.soluteDissolvedFraction < 0.98 && (
          <g id="dissolving-crystals" opacity={1 - state.soluteDissolvedFraction * 0.8}>
            {[
              { x: 165, y: 250 },
              { x: 195, y: 275 },
              { x: 225, y: 260 },
              { x: 180, y: 300 },
              { x: 210, y: 295 },
              { x: 155, y: 280 },
              { x: 235, y: 290 },
            ].map((pt, i) => (
              <polygon
                key={i}
                points={`${pt.x},${pt.y} ${pt.x + 4},${pt.y + 2} ${pt.x + 2},${pt.y + 6} ${pt.x - 2},${pt.y + 4}`}
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="0.5"
                className={state.isStirring ? 'animate-pulse' : ''}
              />
            ))}
          </g>
        )}

        {/* Rotating Magnetic Stir Bar at the Bottom */}
        <g
          transform="translate(200, 310)"
          className={state.isStirring ? 'animate-spin origin-center' : ''}
          style={{ transformOrigin: '200px 310px' }}
        >
          <rect x="-16" y="-3" width="32" height="6" rx="3" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
        </g>

        {/* Insulated Calorimeter Lid (Removable) */}
        <rect x="100" y="146" width="200" height="18" rx="5" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
        <rect x="180" y="136" width="40" height="10" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1" />

        {/* Port Openings in the Lid */}
        {/* Thermometer Port at x=170 */}
        <circle cx="170" cy="155" r="4" fill="#0f172a" />
        {/* Stirrer Shaft Port at x=200 */}
        <circle cx="200" cy="155" r="4" fill="#0f172a" />
        {/* Funnel/Addition Port at x=230 */}
        <circle cx="230" cy="155" r="4" fill="#0f172a" />

        {/* --- 2. High-Precision Digital Temperature Immersion Probe --- */}
        {/* Probe Shaft (x=168 to 172, y=85 to 290) */}
        <rect x="168" y="85" width="4" height="205" rx="2" fill="#94a3b8" stroke="#475569" strokeWidth="0.8" />
        {/* Sensitive Thermistor Tip */}
        <path d="M 167 285 L 173 285 L 170 294 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="0.8" />

        {/* Wire leading to Benchtop Console */}
        <path
          d="M 170 85 C 170 40, 320 40, 340 160"
          fill="none"
          stroke="#475569"
          strokeWidth="2.5"
        />

        {/* Digital Thermometer Console Station */}
        <g id="thermometer-console">
          <rect x="315" y="160" width="115" height="110" rx="8" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />
          <rect x="325" y="170" width="95" height="42" rx="4" fill="#020617" stroke="#334155" />

          {/* Temperature LED Readout */}
          <text
            x="372"
            y="198"
            fill={heatGlowColor}
            fontFamily="monospace"
            fontSize="21"
            fontWeight="bold"
            textAnchor="middle"
          >
            {state.currentTemp.toFixed(2)}
          </text>
          <text x="412" y="184" fill="#64748b" fontFamily="sans-serif" fontSize="8" fontWeight="bold">
            °C
          </text>

          {/* ΔT Display */}
          <text x="335" y="232" fill="#94a3b8" fontSize="9" fontFamily="monospace">
            ΔT: {state.deltaTemp >= 0 ? '+' : ''}{state.deltaTemp.toFixed(2)} °C
          </text>
          <text x="335" y="248" fill="#94a3b8" fontSize="9" fontFamily="monospace">
            q: {state.cumulativeHeatJoules.toFixed(0)} J
          </text>
          <text x="335" y="262" fill="#64748b" fontSize="8" fontFamily="sans-serif">
            {state.soluteAdded ? 'Solute Injected' : 'Awaiting Solute'}
          </text>
        </g>

        {/* Thermal Wave Radiation Indicator */}
        {state.soluteAdded && (
          <g id="thermal-waves" filter="url(#thermalGlow)" opacity="0.6">
            <path
              d="M 120 230 Q 110 240 120 250"
              stroke={heatGlowColor}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 280 230 Q 290 240 280 250"
              stroke={heatGlowColor}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Glass Thermometer Column Gauge (Visual analog indicator) */}
        <g id="analog-gauge" transform="translate(60, 150)">
          <rect x="0" y="0" width="18" height="160" rx="9" fill="#0f172a" stroke="#334155" strokeWidth="1" />
          <line x1="9" y1="15" x2="9" y2="145" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
          {/* Mercury / Alcohol Column */}
          <line
            x1="9"
            y1="145"
            x2="9"
            y2={145 - mercuryHeight}
            stroke={heatGlowColor}
            strokeWidth="4"
            strokeLinecap="round"
            className="transition-all duration-300"
          />
          {/* Bulb */}
          <circle cx="9" cy="145" r="7" fill={heatGlowColor} />
        </g>

        {/* Labels Overlay */}
        <text x="200" y="130" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">
          {isArabic ? 'مسعر حراري معزول ذو ضغط ثابت' : 'Insulated Coffee-Cup Calorimeter'}
        </text>
        <text x="200" y="333" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">
          {params.waterVolume} mL H₂O + {params.soluteMass} g Solute
        </text>
      </svg>
    </div>
  );
};
