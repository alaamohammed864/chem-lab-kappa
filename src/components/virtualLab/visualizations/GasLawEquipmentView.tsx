// Gas Laws & Thermodynamic PVT Chamber Equipment Visualization
// Decoupled graphic representation of variable piston cylinder, thermal heating coils, pressure manometer, and molecular particles.

import React from 'react';
import { GasLawState, GasLawParams } from '../../../engines/simulation';

interface GasLawEquipmentViewProps {
  state: GasLawState;
  params: GasLawParams;
  isArabic?: boolean;
}

export const GasLawEquipmentView: React.FC<GasLawEquipmentViewProps> = ({
  state,
  params,
  isArabic = false,
}) => {
  // Piston Y position: Volume ranges from 0.5 L (piston down at Y=230) to 5.0 L (piston high at Y=80)
  const volFraction = Math.max(0.1, Math.min(1.0, state.currentVolumeL / 5.0));
  const pistonY = 240 - volFraction * 160; // 80 to 224

  // Temperature coil color: blue if cold (<20°C), yellow-orange if moderate, bright orange-red if hot (>60°C)
  const tempC = state.currentTempC;
  let coilColor = '#38bdf8';
  if (tempC >= 25 && tempC < 60) coilColor = '#f59e0b';
  if (tempC >= 60) coilColor = '#ef4444';

  // Needle angle for analog manometer gauge (0 to 600 kPa -> -120 deg to +120 deg)
  const pressureFraction = Math.min(1.0, state.currentPressureKPa / 600);
  const needleAngle = -120 + pressureFraction * 240;

  return (
    <div className="relative w-full h-full min-h-[340px] flex items-center justify-center p-2 select-none">
      <svg
        viewBox="0 0 460 380"
        className="w-full h-full max-h-[360px] drop-shadow-lg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="cylinderGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="20%" stopColor="#475569" />
            <stop offset="80%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          <linearGradient id="pistonGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          <filter id="gaugeShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000000" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Benchtop Stand */}
        <rect x="40" y="335" width="380" height="15" rx="3" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />

        {/* --- 1. Thermal Jacket / Heating Coils around cylinder --- */}
        <rect x="120" y="70" width="160" height="210" rx="8" fill="#091017" stroke="#334155" strokeWidth="1.5" />
        {/* Thermal Coils */}
        {[85, 115, 145, 175, 205, 235, 265].map((y) => (
          <line
            key={y}
            x1="122"
            y1={y}
            x2="135"
            y2={y}
            stroke={coilColor}
            strokeWidth="3"
            strokeLinecap="round"
            className="transition-colors duration-500"
          />
        ))}
        {[85, 115, 145, 175, 205, 235, 265].map((y) => (
          <line
            key={y}
            x1="265"
            y1={y}
            x2="278"
            y2={y}
            stroke={coilColor}
            strokeWidth="3"
            strokeLinecap="round"
            className="transition-colors duration-500"
          />
        ))}

        {/* --- 2. Heavy-Duty Sealed Gas Cylinder Chamber --- */}
        {/* Transparent / Glass Cylinder Bore (x=138 to 262, y=75 to 275) */}
        <rect x="138" y="75" width="124" height="200" rx="4" fill="#020617" stroke="#475569" strokeWidth="2" />

        {/* Volume Metric Markings (1.0 L to 5.0 L) on Left Wall */}
        {[1, 2, 3, 4, 5].map((v) => {
          const markY = 240 - (v / 5.0) * 160;
          return (
            <g key={v}>
              <line x1="138" y1={markY} x2="148" y2={markY} stroke="#94a3b8" strokeWidth="1" />
              <text x="151" y={markY + 3} fill="#64748b" fontSize="7" fontFamily="monospace">
                {v}L
              </text>
            </g>
          );
        })}

        {/* Gas Molecule Particles in Chamber (under the piston) */}
        <g id="gas-particles">
          {[
            { cx: 160, cy: pistonY + 20, r: 2.5 },
            { cx: 190, cy: pistonY + 35, r: 2.5 },
            { cx: 220, cy: pistonY + 15, r: 2.5 },
            { cx: 175, cy: Math.min(265, pistonY + 60), r: 2.5 },
            { cx: 205, cy: Math.min(265, pistonY + 50), r: 2.5 },
            { cx: 235, cy: Math.min(265, pistonY + 45), r: 2.5 },
            { cx: 150, cy: Math.min(265, pistonY + 80), r: 2.5 },
            { cx: 185, cy: Math.min(265, pistonY + 95), r: 2.5 },
            { cx: 225, cy: Math.min(265, pistonY + 85), r: 2.5 },
            { cx: 170, cy: Math.min(265, pistonY + 115), r: 2.5 },
            { cx: 210, cy: Math.min(265, pistonY + 120), r: 2.5 },
          ].map((p, idx) => (
            <circle
              key={idx}
              cx={p.cx}
              cy={p.cy}
              r={p.r}
              fill="#38bdf8"
              opacity="0.9"
              className={state.isRunning ? 'animate-pulse' : ''}
            />
          ))}
        </g>

        {/* --- 3. Movable Piston Head & Rod --- */}
        <g id="piston-assembly" className="transition-all duration-300">
          {/* Piston Rod */}
          <rect x="195" y={pistonY - 60} width="10" height="60" rx="2" fill="url(#pistonGrad)" stroke="#1e293b" />
          {/* Piston Handle / Weight Plate */}
          <rect x="175" y={pistonY - 65} width="50" height="10" rx="3" fill="#475569" stroke="#1e293b" strokeWidth="1.2" />
          <text x="200" y={pistonY - 58} fill="#ffffff" fontSize="6" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
            LOAD
          </text>

          {/* Piston Head (Width 120, Height 16) */}
          <rect x="140" y={pistonY} width="120" height="14" rx="2" fill="url(#pistonGrad)" stroke="#0f172a" strokeWidth="1.2" />
          {/* O-Ring Rubber Seals on Piston Edge */}
          <rect x="140" y={pistonY + 3} width="3" height="8" fill="#1e293b" />
          <rect x="257" y={pistonY + 3} width="3" height="8" fill="#1e293b" />
        </g>

        {/* --- 4. High-Precision Analog Manometer Dial Gauge (Right) --- */}
        <g id="manometer-dial" transform="translate(320, 110)" filter="url(#gaugeShadow)">
          {/* Connecting Pipe from cylinder port to gauge */}
          <path d="M -58 85 L -20 85 L -20 30 L 0 30" fill="none" stroke="#475569" strokeWidth="4" />

          {/* Dial Outer Bezel */}
          <circle cx="45" cy="45" r="45" fill="#0f172a" stroke="#475569" strokeWidth="3" />
          <circle cx="45" cy="45" r="41" fill="#020617" stroke="#334155" strokeWidth="1" />

          {/* Dial Scale Tick Marks (0 to 600 kPa) */}
          {[0, 100, 200, 300, 400, 500, 600].map((tick, i) => {
            const angle = -120 + (i / 6) * 240;
            const rad = (angle * Math.PI) / 180;
            const x1 = 45 + Math.cos(rad) * 33;
            const y1 = 45 + Math.sin(rad) * 33;
            const x2 = 45 + Math.cos(rad) * 38;
            const y2 = 45 + Math.sin(rad) * 38;
            return <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="1.2" />;
          })}

          {/* Indicator Needle */}
          <g transform={`rotate(${needleAngle} 45 45)`} className="transition-transform duration-300">
            <line x1="45" y1="45" x2="45" y2="13" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
            <circle cx="45" cy="45" r="4" fill="#f87171" stroke="#b91c1c" strokeWidth="1" />
          </g>

          {/* Dial Label & Value */}
          <text x="45" y="65" fill="#38bdf8" fontFamily="monospace" fontSize="10" fontWeight="bold" textAnchor="middle">
            {state.currentPressureKPa.toFixed(0)}
          </text>
          <text x="45" y="75" fill="#64748b" fontFamily="sans-serif" fontSize="7" textAnchor="middle">
            kPa
          </text>
        </g>

        {/* --- 5. Digital Telemetry Badge Station (Left) --- */}
        <g id="telemetry-box" transform="translate(45, 110)">
          <rect x="0" y="0" width="70" height="90" rx="6" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />
          <text x="35" y="16" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">
            GAS PVT
          </text>

          <text x="8" y="34" fill="#64748b" fontSize="7" fontFamily="monospace">
            V:
          </text>
          <text x="24" y="34" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold">
            {state.currentVolumeL.toFixed(2)} L
          </text>

          <text x="8" y="50" fill="#64748b" fontSize="7" fontFamily="monospace">
            T:
          </text>
          <text x="24" y="50" fill={coilColor} fontSize="8" fontFamily="monospace" fontWeight="bold">
            {state.currentTempC.toFixed(1)} °C
          </text>

          <text x="8" y="66" fill="#64748b" fontSize="7" fontFamily="monospace">
            v_rms:
          </text>
          <text x="8" y="78" fill="#e2e8f0" fontSize="8" fontFamily="monospace">
            {state.vRms_m_s.toFixed(0)} m/s
          </text>
        </g>

        {/* Labels Overlay */}
        <text x="200" y="55" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">
          {isArabic ? 'غرفة المكبس الديناميكية الحرارية' : 'Variable-Volume Gas Piston Chamber'}
        </text>
        <text x="200" y="315" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">
          {params.molesGas} mol {params.gasType.toUpperCase()} | P·V = {(state.currentPressureKPa * state.currentVolumeL).toFixed(1)} kPa·L
        </text>
      </svg>
    </div>
  );
};
