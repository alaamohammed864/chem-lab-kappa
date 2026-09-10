import React from 'react';
import { XRD_SOURCES, XRayRadiationSource } from '../../engines/materials/xrdEngine';
import { XRDPatternData } from '../../types';
import { Sliders, Zap, Atom, HelpCircle, Layers, Gauge } from 'lucide-react';

interface XRDParametersPanelProps {
  selectedSample: XRDPatternData;
  availableSamples: Record<string, XRDPatternData>;
  selectedSampleKey: string;
  onSelectSample: (key: string) => void;
  selectedSourceKey: string;
  onSelectSource: (key: string) => void;
  wavelength: number;
  onChangeWavelength: (lambda: number) => void;
  minTwoTheta: number;
  maxTwoTheta: number;
  onChangeScanRange: (min: number, max: number) => void;
  stepSize: number;
  onChangeStepSize: (step: number) => void;
  instrumentalBroadening: number;
  onChangeInstrumentalBroadening: (val: number) => void;
  shapeFactorK: number;
  onChangeShapeFactorK: (val: number) => void;
}

export const XRDParametersPanel: React.FC<XRDParametersPanelProps> = ({
  selectedSample,
  availableSamples,
  selectedSampleKey,
  onSelectSample,
  selectedSourceKey,
  onSelectSource,
  wavelength,
  onChangeWavelength,
  minTwoTheta,
  maxTwoTheta,
  onChangeScanRange,
  stepSize,
  onChangeStepSize,
  instrumentalBroadening,
  onChangeInstrumentalBroadening,
  shapeFactorK,
  onChangeShapeFactorK,
}) => {
  const isCustomSource = selectedSourceKey === 'custom';
  const activeSource = XRD_SOURCES[selectedSourceKey];

  return (
    <div className="bg-[#0b141e] border border-[#142230] rounded-xl p-4 space-y-4 text-xs font-mono">
      <div className="flex items-center justify-between pb-2 border-b border-[#142230]">
        <div className="flex items-center gap-2 text-purple-400 font-semibold uppercase tracking-wider text-[11px]">
          <Sliders className="w-4 h-4 text-purple-400" />
          <span>XRD Instrument & Scan Parameters</span>
        </div>
        <span className="text-[10px] text-slate-500 bg-[#070e17] px-2 py-0.5 rounded border border-slate-800">
          Bragg-Brentano θ-2θ
        </span>
      </div>

      {/* Material / Specimen Selection */}
      <div className="space-y-1.5">
        <label className="text-[10px] text-slate-400 uppercase flex items-center justify-between font-semibold">
          <span>1. Specimen Material</span>
          <span className="text-cyan-400 text-[10px] lowercase font-normal">{selectedSample.crystalSystem || 'Crystalline'}</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-32 overflow-y-auto pr-1">
          {(Object.entries(availableSamples) as [string, XRDPatternData][]).map(([key, item]) => {
            const isSelected = selectedSampleKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelectSample(key)}
                className={`px-2 py-1.5 rounded text-left transition border text-[11px] truncate cursor-pointer ${
                  isSelected
                    ? 'bg-purple-900/60 border-purple-500 text-white font-bold shadow-sm'
                    : 'bg-[#070e17] border-slate-800/80 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
                title={item.material}
              >
                <div className="font-bold truncate">{item.material.split('(')[0].trim()}</div>
                <div className="text-[9px] text-slate-400 truncate">
                  {item.formula || item.crystalSystem || 'Powder'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Radiation Source & Wavelength */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-[#142230]">
        <div className="sm:col-span-7 space-y-1.5">
          <label className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>2. Radiation Source (Anode Target)</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {Object.entries(XRD_SOURCES).map(([key, src]) => {
              const isSelected = selectedSourceKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSelectSource(key)}
                  className={`px-2 py-1.5 rounded text-center transition border text-[10px] cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 text-white font-bold border-purple-400 shadow-sm'
                      : 'bg-[#070e17] text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div>{src.symbol}</div>
                  <div className="text-[9px] opacity-80">{src.wavelengthAngstrom} Å</div>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => onSelectSource('custom')}
              className={`px-2 py-1.5 rounded text-center transition border text-[10px] cursor-pointer ${
                isCustomSource
                  ? 'bg-purple-600 text-white font-bold border-purple-400'
                  : 'bg-[#070e17] text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              <div>Custom λ</div>
              <div className="text-[9px] opacity-80">Manual Input</div>
            </button>
          </div>
        </div>

        {/* Active Wavelength Display / Input */}
        <div className="sm:col-span-5 space-y-1.5">
          <label className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-between">
            <span>Wavelength λ (Å)</span>
            {activeSource && (
              <span className="text-amber-400 text-[10px] font-normal">{activeSource.energyKeV} keV</span>
            )}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.0001"
              min="0.1"
              max="5.0"
              disabled={!isCustomSource}
              value={wavelength}
              onChange={(e) => onChangeWavelength(parseFloat(e.target.value) || 1.5406)}
              className={`w-full bg-[#070e17] border rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold ${
                isCustomSource
                  ? 'border-purple-500 text-white focus:outline-none focus:ring-1 focus:ring-purple-400'
                  : 'border-slate-800 text-slate-300 cursor-not-allowed bg-slate-900/50'
              }`}
            />
            <span className="text-slate-400 font-bold">Å</span>
          </div>
          <div className="text-[9px] text-slate-500">
            {activeSource ? activeSource.name : 'User custom X-ray wavelength'}
          </div>
        </div>
      </div>

      {/* Scan Range and Step Size */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-[#142230]">
        <div className="sm:col-span-7 space-y-1.5">
          <label className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-between">
            <span>3. Scan Range 2θ (min → max)</span>
            <span className="text-slate-500">{minTwoTheta}° to {maxTwoTheta}°</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5 bg-[#070e17] border border-slate-800 rounded px-2 py-1">
              <span className="text-[10px] text-slate-500">Min:</span>
              <input
                type="number"
                min="5"
                max={maxTwoTheta - 5}
                step="5"
                value={minTwoTheta}
                onChange={(e) => onChangeScanRange(Math.max(5, parseInt(e.target.value) || 10), maxTwoTheta)}
                className="w-full bg-transparent text-white font-bold focus:outline-none text-xs"
              />
              <span className="text-[10px] text-slate-500">°</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#070e17] border border-slate-800 rounded px-2 py-1">
              <span className="text-[10px] text-slate-500">Max:</span>
              <input
                type="number"
                min={minTwoTheta + 5}
                max="150"
                step="5"
                value={maxTwoTheta}
                onChange={(e) => onChangeScanRange(minTwoTheta, Math.min(150, parseInt(e.target.value) || 100))}
                className="w-full bg-transparent text-white font-bold focus:outline-none text-xs"
              />
              <span className="text-[10px] text-slate-500">°</span>
            </div>
          </div>
        </div>

        {/* Step Size */}
        <div className="sm:col-span-5 space-y-1.5">
          <label className="text-[10px] text-slate-400 uppercase font-semibold">
            <span>4. Step Size Δ2θ (deg)</span>
          </label>
          <div className="grid grid-cols-4 gap-1">
            {[0.01, 0.02, 0.05, 0.1].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => onChangeStepSize(st)}
                className={`py-1 rounded text-center transition border text-[10px] cursor-pointer ${
                  stepSize === st
                    ? 'bg-cyan-600 text-white font-bold border-cyan-400'
                    : 'bg-[#070e17] text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {st}°
              </button>
            ))}
          </div>
          <div className="text-[9px] text-slate-500">
            {Math.round((maxTwoTheta - minTwoTheta) / stepSize)} measurement points
          </div>
        </div>
      </div>

      {/* Crystallite Size & Instrumental Broadening Controls */}
      <div className="pt-2 border-t border-[#142230] grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Inst. Broadening (β_inst):</span>
            <span className="font-bold text-slate-200">{instrumentalBroadening}° FWHM</span>
          </div>
          <input
            type="range"
            min="0.02"
            max="0.20"
            step="0.01"
            value={instrumentalBroadening}
            onChange={(e) => onChangeInstrumentalBroadening(parseFloat(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer"
          />
          <span className="text-[9px] text-slate-500">Slit/optics resolution baseline</span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Scherrer Shape Factor (K):</span>
            <span className="font-bold text-slate-200">{shapeFactorK.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {[
              { label: '0.89 (Cubic)', val: 0.89 },
              { label: '0.90 (Sphere)', val: 0.90 },
              { label: '0.94 (Octahedral)', val: 0.94 },
            ].map((kOpt) => (
              <button
                key={kOpt.val}
                type="button"
                onClick={() => onChangeShapeFactorK(kOpt.val)}
                className={`py-1 rounded text-center transition border text-[9px] cursor-pointer ${
                  shapeFactorK === kOpt.val
                    ? 'bg-purple-600 text-white font-bold border-purple-400'
                    : 'bg-[#070e17] text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {kOpt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
