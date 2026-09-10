import React, { useState, useMemo } from 'react';
import { XRD_SAMPLES } from '../data/crystals';
import {
  XRD_SOURCES,
  computeSamplePeaksForWavelength,
  generateDiffractogramScan,
} from '../engines/materials/xrdEngine';
import { XRDParametersPanel } from './xrd/XRDParametersPanel';
import { XRDDiffractogramChart } from './xrd/XRDDiffractogramChart';
import { XRDPeakTable } from './xrd/XRDPeakTable';
import { XRDAnalysisCard } from './xrd/XRDAnalysisCard';
import {
  TrendingUp,
  X,
  Maximize2,
  Minimize2,
  Sliders,
  Table,
  Sparkles,
  Layers,
  RotateCcw,
} from 'lucide-react';

interface XRDLabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const XRDLabModal: React.FC<XRDLabModalProps> = ({ isOpen, onClose }) => {
  // Primary Specimen & Instrument State
  const [selectedSampleKey, setSelectedSampleKey] = useState<string>('ti-6al-4v');
  const [selectedSourceKey, setSelectedSourceKey] = useState<string>('cu-ka');
  const [wavelength, setWavelength] = useState<number>(1.54060);

  // Scan Range and Step Size State
  const [minTwoTheta, setMinTwoTheta] = useState<number>(20);
  const [maxTwoTheta, setMaxTwoTheta] = useState<number>(90);
  const [stepSize, setStepSize] = useState<number>(0.05);

  // Broadening and Analysis Parameters
  const [instrumentalBroadening, setInstrumentalBroadening] = useState<number>(0.08);
  const [shapeFactorK, setShapeFactorK] = useState<number>(0.90);

  // Interactive Probe and Peak Focus State
  const [probeTwoTheta, setProbeTwoTheta] = useState<number>(40.24);
  const [selectedPeakIndex, setSelectedPeakIndex] = useState<number | null>(null);

  // View Layout Modes
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'scan' | 'parameters' | 'analysis'>('scan');

  // Active specimen data
  const sample = XRD_SAMPLES[selectedSampleKey] || XRD_SAMPLES['ti-6al-4v'];

  // Handle source change
  const handleSelectSource = (key: string) => {
    setSelectedSourceKey(key);
    if (key !== 'custom' && XRD_SOURCES[key]) {
      setWavelength(XRD_SOURCES[key].wavelengthAngstrom);
    }
  };

  // Handle sample change
  const handleSelectSample = (key: string) => {
    setSelectedSampleKey(key);
    const newSample = XRD_SAMPLES[key];
    if (newSample && newSample.peaks.length > 0) {
      setProbeTwoTheta(newSample.peaks[0].twoTheta);
      setSelectedPeakIndex(1);
    }
  };

  // Dynamically compute observable peaks for active wavelength
  const computedPeaks = useMemo(() => {
    return computeSamplePeaksForWavelength(
      sample,
      wavelength,
      instrumentalBroadening,
      shapeFactorK
    );
  }, [sample, wavelength, instrumentalBroadening, shapeFactorK]);

  // Dynamically simulate continuous diffractogram profile
  const scanSimulation = useMemo(() => {
    return generateDiffractogramScan({
      sampleData: sample,
      lambdaAngstrom: wavelength,
      minTwoTheta,
      maxTwoTheta,
      stepSize,
      instrumentalBroadeningDeg: instrumentalBroadening,
    });
  }, [sample, wavelength, minTwoTheta, maxTwoTheta, stepSize, instrumentalBroadening]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className={`bg-[#091017] border border-[#1b2d42] rounded-2xl w-full flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ${
          isMaximized ? 'max-w-[98vw] h-[96vh]' : 'max-w-6xl max-h-[94vh]'
        }`}
      >
        {/* Header */}
        <div className="p-3 sm:px-6 border-b border-[#142230] flex items-center justify-between bg-[#0b141e] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  X-Ray Powder Diffraction (XRD) Laboratory
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/70 border border-purple-500/30 text-purple-300">
                  Bragg-Brentano θ-2θ
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Phase indexing, d-spacing via Bragg's law, and Scherrer crystallite domain size estimation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-[#070e17] border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveTab('scan')}
                className={`px-3 py-1 rounded transition cursor-pointer ${
                  activeTab === 'scan' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Diffractogram
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('parameters')}
                className={`px-3 py-1 rounded transition cursor-pointer ${
                  activeTab === 'parameters' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Scan Parameters
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('analysis')}
                className={`px-3 py-1 rounded transition cursor-pointer ${
                  activeTab === 'analysis' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Bragg & Scherrer
              </button>
            </div>

            {/* Maximize Button */}
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title={isMaximized ? 'Restore View' : 'Maximize Window'}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4 text-cyan-400" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Specimen & Anode Quick Select Strip */}
        <div className="p-2.5 bg-[#0c1520] border-b border-[#142230] flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
            <span className="text-[10px] text-slate-400 uppercase font-semibold mr-1">Specimen:</span>
            {Object.entries(XRD_SAMPLES).map(([key, data]) => {
              const isSelected = selectedSampleKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectSample(key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap transition cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 text-white font-bold shadow-sm'
                      : 'bg-[#080e16] text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {data.material.split('(')[0].trim()}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span>Anode:</span>
              <select
                value={selectedSourceKey}
                onChange={(e) => handleSelectSource(e.target.value)}
                className="bg-[#070e17] border border-slate-700 text-white px-2 py-1 rounded text-xs font-mono focus:outline-none focus:border-purple-500"
              >
                {Object.entries(XRD_SOURCES).map(([k, s]) => (
                  <option key={k} value={k}>
                    {s.name} ({s.wavelengthAngstrom} Å)
                  </option>
                ))}
                <option value="custom">Custom λ...</option>
              </select>
            </div>

            <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400 bg-[#070e17] px-2 py-1 rounded border border-slate-800">
              <span>2θ:</span>
              <span className="font-bold text-white">{minTwoTheta}° to {maxTwoTheta}°</span>
              <span className="text-slate-500">|</span>
              <span>Step:</span>
              <span className="font-bold text-cyan-300">{stepSize}°</span>
            </div>
          </div>
        </div>

        {/* Scrollable Main Workspace Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 bg-[#070c12]">
          {/* Main Diffractogram Spectrum Chart */}
          <XRDDiffractogramChart
            scanPoints={scanSimulation.points}
            peaks={computedPeaks}
            minTwoTheta={minTwoTheta}
            maxTwoTheta={maxTwoTheta}
            activeWavelength={wavelength}
            probeTwoTheta={probeTwoTheta}
            onSetProbeTwoTheta={setProbeTwoTheta}
            selectedPeakIndex={selectedPeakIndex}
            onSelectPeakIndex={setSelectedPeakIndex}
            materialName={sample.material}
            radiationName={XRD_SOURCES[selectedSourceKey]?.name || 'Custom Source'}
            isMaximized={isMaximized}
          />

          {/* Tabbed / Collapsible Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Peak Indexing Table & Bragg Analysis */}
            <div className="lg:col-span-7 space-y-5">
              <XRDPeakTable
                peaks={computedPeaks}
                selectedPeakIndex={selectedPeakIndex}
                onSelectPeak={(idx) => {
                  setSelectedPeakIndex(idx);
                  const found = computedPeaks.find((p) => p.index === idx);
                  if (found) setProbeTwoTheta(found.twoThetaDeg);
                }}
                probeTwoTheta={probeTwoTheta}
                materialName={sample.material}
                activeWavelength={wavelength}
              />

              <XRDAnalysisCard
                probeTwoTheta={probeTwoTheta}
                activeWavelength={wavelength}
                sample={sample}
                shapeFactorK={shapeFactorK}
                instrumentalBroadening={instrumentalBroadening}
              />
            </div>

            {/* Right Column: Instrument & Scan Parameters */}
            <div className="lg:col-span-5 space-y-5">
              <XRDParametersPanel
                selectedSample={sample}
                availableSamples={XRD_SAMPLES}
                selectedSampleKey={selectedSampleKey}
                onSelectSample={handleSelectSample}
                selectedSourceKey={selectedSourceKey}
                onSelectSource={handleSelectSource}
                wavelength={wavelength}
                onChangeWavelength={setWavelength}
                minTwoTheta={minTwoTheta}
                maxTwoTheta={maxTwoTheta}
                onChangeScanRange={(min, max) => {
                  setMinTwoTheta(min);
                  setMaxTwoTheta(max);
                }}
                stepSize={stepSize}
                onChangeStepSize={setStepSize}
                instrumentalBroadening={instrumentalBroadening}
                onChangeInstrumentalBroadening={setInstrumentalBroadening}
                shapeFactorK={shapeFactorK}
                onChangeShapeFactorK={setShapeFactorK}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
