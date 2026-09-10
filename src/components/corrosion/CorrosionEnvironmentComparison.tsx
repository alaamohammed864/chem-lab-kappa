import React, { useState } from 'react';
import {
  Waves,
  Factory,
  TestTube2,
  Droplets,
  Flame,
  Thermometer,
  Wind,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  CORROSION_ENVIRONMENTS,
  CORROSION_ALLOYS,
  AlloyCorrosionProfile,
  generateTemperatureCorrosionTrend,
} from '../../engines/materials/corrosionEngine';

interface CorrosionEnvironmentComparisonProps {
  selectedAlloyId: string;
}

export const CorrosionEnvironmentComparison: React.FC<CorrosionEnvironmentComparisonProps> = ({
  selectedAlloyId,
}) => {
  const alloy: AlloyCorrosionProfile = CORROSION_ALLOYS[selectedAlloyId] || CORROSION_ALLOYS['ss-316l'];
  const [selectedEnvId, setSelectedEnvId] = useState<string>('marine');
  const [ambientTempC, setAmbientTempC] = useState<number>(25);

  const currentEnv = CORROSION_ENVIRONMENTS[selectedEnvId] || CORROSION_ENVIRONMENTS['marine'];
  const baseRate = alloy.baseCorrosionRatesMmPerYear[selectedEnvId] || 0.01;

  // Compute thermal activation adjustment via Arrhenius factor
  const tempTrends = generateTemperatureCorrosionTrend(baseRate, 35, 10, 95, 10);
  const activeTempPoint = tempTrends.reduce((prev, curr) =>
    Math.abs(curr.temperatureC - ambientTempC) < Math.abs(prev.temperatureC - ambientTempC) ? curr : prev
  );

  return (
    <div className="space-y-4">
      {/* Environment Selector Bar */}
      <div>
        <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2 block">
          Select Operating Service Environment
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {Object.values(CORROSION_ENVIRONMENTS).map((env) => {
            const isSelected = env.id === selectedEnvId;
            return (
              <button
                key={env.id}
                onClick={() => setSelectedEnvId(env.id)}
                className={`p-2.5 rounded-lg text-left transition border cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/60 border-cyan-500/80 text-white shadow-md shadow-cyan-950/40'
                    : 'bg-[#0f1924] border-[#1b2b3d] text-slate-300 hover:border-slate-600 hover:bg-[#132232]'
                }`}
              >
                <div>
                  <div className="font-semibold text-xs truncate">{env.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <span>Severity:</span>
                    <span className={`font-mono font-bold ${
                      env.corrosivenessIndex >= 8 ? 'text-rose-400' :
                      env.corrosivenessIndex >= 5 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {env.corrosivenessIndex}/10
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Comparison Area: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left Column: Environment Parameters & Rate (5 cols) */}
        <div className="lg:col-span-5 bg-[#0b131d] border border-[#162738] rounded-xl p-4 space-y-3">
          <div className="border-b border-slate-800 pb-2">
            <span className="text-[10px] font-mono uppercase text-cyan-400 font-semibold">
              ACTIVE SERVICE MEDIA
            </span>
            <h4 className="text-sm font-bold text-white mt-0.5">{currentEnv.name}</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{currentEnv.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded bg-[#101b28] border border-[#1a2d40] text-center">
              <span className="text-[9px] font-mono uppercase text-slate-500 block">pH Range</span>
              <span className="text-xs font-mono font-bold text-slate-200">
                {currentEnv.phRange[0]} – {currentEnv.phRange[1]}
              </span>
            </div>
            <div className="p-2 rounded bg-[#101b28] border border-[#1a2d40] text-center">
              <span className="text-[9px] font-mono uppercase text-slate-500 block">Chlorides</span>
              <span className="text-xs font-mono font-bold text-slate-200">
                {currentEnv.typicalChloridePpm} ppm
              </span>
            </div>
            <div className="p-2 rounded bg-[#101b28] border border-[#1a2d40] text-center">
              <span className="text-[9px] font-mono uppercase text-slate-500 block">Aeration</span>
              <span className="text-xs font-mono font-bold text-slate-200">
                {currentEnv.aerationLevel}
              </span>
            </div>
          </div>

          {/* Temperature Sensitivity Slider */}
          <div className="p-3 rounded-lg bg-[#0e1724] border border-[#172739] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-slate-300 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                Service Temperature
              </span>
              <span className="font-mono font-bold text-amber-300">{ambientTempC}°C</span>
            </div>
            <input
              type="range"
              min={10}
              max={95}
              step={1}
              value={ambientTempC}
              onChange={(e) => setAmbientTempC(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-500">
              <span>10°C (Cold)</span>
              <span>25°C (Ref)</span>
              <span>95°C (Severe thermal)</span>
            </div>
          </div>

          {/* Temperature Adjusted Rate */}
          <div className="p-3 rounded-lg bg-gradient-to-r from-[#121c29] to-[#0f2430] border border-cyan-900/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Estimated Penetration Rate ({ambientTempC}°C)
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-extrabold text-cyan-300 font-mono">
                  {activeTempPoint.corrosionRateMmPerYear}
                </span>
                <span className="text-xs text-slate-400">mm/year ({(activeTempPoint.corrosionRateMmPerYear * 39.37).toFixed(2)} mpy)</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono text-slate-500 uppercase block">Arrhenius factor</span>
              <span className="text-xs font-mono font-bold text-amber-400">
                ×{activeTempPoint.arrheniusRateFactor}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Chart Across All Environments for Selected Alloy (7 cols) */}
        <div className="lg:col-span-7 bg-[#0b131d] border border-[#162738] rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <div>
                <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Relative Environmental Resistance of {alloy.name}
                </h4>
                <p className="text-[11px] text-slate-400">
                  Uniform baseline penetration rate (mm/year at 25°C) across test media
                </p>
              </div>
            </div>

            {/* Horizontal Bar Visualizer */}
            <div className="space-y-3 my-2">
              {Object.entries(CORROSION_ENVIRONMENTS).map(([envKey, envObj]) => {
                const rate = alloy.baseCorrosionRatesMmPerYear[envKey] || 0.001;
                const isSelected = envKey === selectedEnvId;
                // Normalize bar relative to 1 mm/yr
                const barWidth = Math.min(100, Math.max(3, Math.log10(rate * 1000 + 1) * 33));

                return (
                  <div
                    key={envKey}
                    onClick={() => setSelectedEnvId(envKey)}
                    className={`p-2 rounded-lg transition border cursor-pointer ${
                      isSelected
                        ? 'bg-[#102030] border-cyan-500/50'
                        : 'bg-[#0e1622] border-transparent hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between text-xs mb-1">
                      <span className={`font-semibold ${isSelected ? 'text-cyan-300' : 'text-slate-300'}`}>
                        {envObj.name}
                      </span>
                      <span className="font-mono text-slate-400">
                        {rate} mm/yr ({rate < 0.02 ? 'Negligible' : rate < 0.1 ? 'Mild' : rate < 0.5 ? 'Moderate' : 'Severe'})
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          rate > 0.5 ? 'bg-rose-500' :
                          rate > 0.1 ? 'bg-amber-400' :
                          rate > 0.02 ? 'bg-teal-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400 flex items-center gap-2 mt-2">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              Values represent typical steady-state uninhibited laboratory corrosion rates. Real service coupon testing is advised for critical process plant design.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
