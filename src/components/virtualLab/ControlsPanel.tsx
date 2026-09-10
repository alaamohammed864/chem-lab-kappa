// Laboratory Controls Panel
// Decoupled controller layer executing simulation actions and configuring experimental parameters.

import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Plus,
  Sliders,
  Droplets,
  Disc,
  Flame,
  Zap,
  CheckCircle2,
  HelpCircle,
  Eye,
} from 'lucide-react';
import {
  ExperimentMetadata,
  BaseSimulationState,
  SimulationAction,
  ParamDefinition,
} from '../../engines/simulation';

interface ControlsPanelProps {
  metadata: ExperimentMetadata;
  state: BaseSimulationState;
  params: Record<string, any>;
  onAction: (action: SimulationAction) => void;
  onUpdateParam: (paramId: string, value: any) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  isArabic?: boolean;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  metadata,
  state,
  params,
  onAction,
  onUpdateParam,
  speed,
  onSpeedChange,
  isArabic = false,
}) => {
  const [showParamEditor, setShowParamEditor] = useState(false);

  return (
    <div className="w-full bg-[#0d1622] border border-[#18293d] rounded-xl p-3.5 space-y-4 shadow-md">
      {/* 1. Header & Primary Simulation Clock */}
      <div className="flex items-center justify-between border-b border-[#18293d] pb-2.5">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {isArabic ? 'لوحة التحكم والمحاكاة' : 'Simulation Controls'}
          </h4>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              state.isRunning ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
            }`}
          />
          <span className="text-[11px] font-mono text-slate-400">
            {state.isRunning ? (isArabic ? 'جاري التشغيل' : 'Running') : (isArabic ? 'متوقف' : 'Paused')}
          </span>
        </div>
      </div>

      {/* 2. Universal Playback & Execution Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-[#09111a] border border-[#142334]">
        <div className="flex items-center gap-1.5">
          {/* Play / Pause */}
          <button
            onClick={() => onAction({ type: state.isRunning ? 'PAUSE' : 'START' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              state.isRunning
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
            }`}
          >
            {state.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{state.isRunning ? (isArabic ? 'إيقاف' : 'Pause') : (isArabic ? 'تشغيل' : 'Run')}</span>
          </button>

          {/* Reset */}
          <button
            onClick={() => onAction({ type: 'RESET' })}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#132030] text-slate-300 hover:text-white hover:bg-[#1b2d42] border border-[#223750] transition cursor-pointer"
            title="Reset Simulation to Initial State"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isArabic ? 'إعادة تعيين' : 'Reset'}</span>
          </button>

          {/* Record Manual Data Snapshot */}
          <button
            onClick={() => onAction({ type: 'RECORD_DATA_POINT' })}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#132030] text-cyan-400 hover:text-cyan-300 hover:bg-[#1b2d42] border border-[#223750] transition cursor-pointer"
            title="Record current state into Data Table"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isArabic ? 'حفظ نقطة' : 'Record'}</span>
          </button>
        </div>

        {/* Speed Multiplier */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-slate-500 font-mono">Speed:</span>
          {[1, 2, 5, 10].map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                speed === s
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-[#121f2d] text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* 3. Specialized Experiment Control Actions */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
          <span>{isArabic ? 'إجراءات التجربة التفاعلية' : 'Active Experiment Controls'}</span>
          <span className="text-[10px] font-mono text-cyan-500">ID: {metadata.id}</span>
        </div>

        {/* --- A. Titration Specific Actions --- */}
        {metadata.id === 'acid-base-titration' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => onAction({ type: 'ADD_TITRANT', payload: { amount: 0.05 } })}
              disabled={state.buretteRemaining <= 0}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-pink-950/40 border border-pink-700/40 text-pink-300 text-xs font-medium hover:bg-pink-900/50 transition cursor-pointer disabled:opacity-40"
            >
              <Droplets className="w-3.5 h-3.5 text-pink-400" />
              <span>+ 0.05 mL (Drop)</span>
            </button>

            <button
              onClick={() => onAction({ type: 'ADD_TITRANT', payload: { amount: 0.5 } })}
              disabled={state.buretteRemaining <= 0}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-[#142334] border border-[#223750] text-slate-200 text-xs font-medium hover:bg-[#1b2f46] transition cursor-pointer disabled:opacity-40"
            >
              <span>+ 0.50 mL</span>
            </button>

            <button
              onClick={() => onAction({ type: 'ADD_TITRANT', payload: { amount: 2.0 } })}
              disabled={state.buretteRemaining <= 0}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-[#142334] border border-[#223750] text-slate-200 text-xs font-medium hover:bg-[#1b2f46] transition cursor-pointer disabled:opacity-40"
            >
              <span>+ 2.00 mL</span>
            </button>

            <button
              onClick={() => onAction({ type: 'TOGGLE_STIRRER' })}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium border transition cursor-pointer ${
                (state as any).isStirring
                  ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                  : 'bg-[#142334] border-[#223750] text-slate-400 hover:text-slate-200'
              }`}
            >
              <Disc className={`w-3.5 h-3.5 ${(state as any).isStirring ? 'animate-spin' : ''}`} />
              <span>{(state as any).isStirring ? 'Stirrer ON' : 'Stirrer OFF'}</span>
            </button>
          </div>
        )}

        {/* --- B. Calorimetry Specific Actions --- */}
        {metadata.id === 'solution-calorimetry' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => onAction({ type: 'ADD_SOLUTE' })}
              disabled={(state as any).soluteAdded}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                !(state as any).soluteAdded
                  ? 'bg-orange-500/20 text-orange-300 border-orange-500/40 hover:bg-orange-500/30'
                  : 'bg-[#121d28] text-slate-500 border-[#1f3042] cursor-not-allowed'
              }`}
            >
              <Flame className="w-4 h-4 text-orange-400" />
              <span>
                {!(state as any).soluteAdded
                  ? isArabic
                    ? 'إضافة المذاب وبدء التفاعل'
                    : 'Inject Solute into Calorimeter'
                  : isArabic
                  ? 'تمت إضافة المذاب'
                  : 'Solute Already Injected'}
              </span>
            </button>

            <button
              onClick={() => onAction({ type: 'TOGGLE_STIRRER' })}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium border transition cursor-pointer ${
                (state as any).isStirring
                  ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                  : 'bg-[#142334] border-[#223750] text-slate-400 hover:text-slate-200'
              }`}
            >
              <Disc className={`w-3.5 h-3.5 ${(state as any).isStirring ? 'animate-spin' : ''}`} />
              <span>{(state as any).isStirring ? 'Magnetic Stirring: Active' : 'Stirrer: Inactive'}</span>
            </button>
          </div>
        )}

        {/* --- C. Chemical Kinetics Specific Actions --- */}
        {metadata.id === 'chemical-kinetics' && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onAction({ type: state.isRunning ? 'PAUSE' : 'START' })}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                state.isRunning
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30'
              }`}
            >
              <Zap className="w-4 h-4 text-purple-400" />
              <span>
                {state.isRunning
                  ? isArabic
                    ? 'إيقاف مؤقت للتفاعل'
                    : 'Pause Reaction Fading'
                  : (state as any).simTime > 0
                  ? isArabic
                    ? 'استئناف التفاعل'
                    : 'Resume Reaction'
                  : isArabic
                  ? 'خلط المتفاعلات وبدء القياس الطيفي'
                  : 'Mix Reactants & Start Spectrophotometer'}
              </span>
            </button>
          </div>
        )}

        {/* --- D. Gas Laws Specific Actions --- */}
        {metadata.id === 'gas-laws-pvt' && (
          <div className="space-y-3 p-2.5 rounded-lg bg-[#09111a] border border-[#142334]">
            {/* Live Volume Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>{isArabic ? 'حجم المكبس (V)' : 'Piston Volume (V)'}</span>
                <span className="font-mono text-cyan-400">
                  {((state as any).currentVolumeL || 2.0).toFixed(2)} L
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={(state as any).currentVolumeL || 2.0}
                onChange={(e) => onAction({ type: 'SET_VOLUME', payload: { volumeL: parseFloat(e.target.value) } })}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-[#17283c] rounded"
              />
            </div>

            {/* Live Temperature Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>{isArabic ? 'درجة الحرارة (T)' : 'Gas Temperature (T)'}</span>
                <span className="font-mono text-orange-400">
                  {((state as any).currentTempC || 25.0).toFixed(1)} °C
                </span>
              </div>
              <input
                type="range"
                min="-10"
                max="120"
                step="1"
                value={(state as any).currentTempC || 25.0}
                onChange={(e) =>
                  onAction({ type: 'SET_TEMPERATURE', payload: { tempC: parseFloat(e.target.value) } })
                }
                className="w-full accent-orange-400 cursor-pointer h-1.5 bg-[#17283c] rounded"
              />
            </div>

            {/* Compression Sweep Button */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => onAction({ type: 'STEP_COMPRESSION' })}
                className="flex-1 py-1.5 text-xs font-medium rounded bg-[#132030] hover:bg-[#1b2e45] text-slate-200 border border-[#223750] transition cursor-pointer"
              >
                Compress (-0.25 L)
              </button>
              <button
                onClick={() => onAction({ type: 'STEP_EXPANSION' })}
                className="flex-1 py-1.5 text-xs font-medium rounded bg-[#132030] hover:bg-[#1b2e45] text-slate-200 border border-[#223750] transition cursor-pointer"
              >
                Expand (+0.25 L)
              </button>
            </div>
          </div>
        )}

        {/* --- E. Spectrophotometry Specific Actions --- */}
        {metadata.id === 'spectrophotometry-beer-lambert' && (
          <div className="space-y-2.5">
            {/* Calibration & Zeroing */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAction({ type: 'CALIBRATE_BLANK' })}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-emerald-950/40 border border-emerald-600/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-900/50 transition cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isArabic ? 'معايرة الصفر (الماء المقطر)' : 'Zero / Calibrate Blank (A = 0.000)'}</span>
              </button>
            </div>

            {/* Standard Series Buttons */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">
                {isArabic ? 'قياس تراكيز المعايرة القياسية:' : 'Insert Calibration Standards:'}
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {[0, 1, 2, 3, 4].map((idx) => {
                  const isMeasured = (state as any).standardsMeasured?.some(
                    (s: any) => s.standardId === `Standard #${idx + 1}`
                  );
                  return (
                    <button
                      key={idx}
                      onClick={() => onAction({ type: 'MEASURE_STANDARD', payload: { standardIndex: idx } })}
                      className={`py-1.5 text-[11px] font-mono rounded border transition cursor-pointer ${
                        isMeasured
                          ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 font-bold'
                          : 'bg-[#142334] border-[#223750] text-slate-300 hover:text-white hover:bg-[#1b2e45]'
                      }`}
                    >
                      Std #{idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Unknown Sample Analysis Button */}
            <button
              onClick={() => onAction({ type: 'MEASURE_UNKNOWN' })}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-950/60 border border-indigo-500/50 text-indigo-300 text-xs font-bold hover:bg-indigo-900/70 transition cursor-pointer"
            >
              <Eye className="w-4 h-4 text-indigo-400" />
              <span>{isArabic ? 'تحليل العينة المجهولة واستنتاج التركيز' : 'Insert & Quantify Unknown Sample'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Collapsible Parameter Customizer Accordion */}
      <div className="border-t border-[#18293d] pt-2.5">
        <button
          onClick={() => setShowParamEditor(!showParamEditor)}
          className="flex items-center justify-between w-full text-xs font-medium text-slate-400 hover:text-slate-200 transition cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            {isArabic ? 'تعديل متغيرات التجربة المخبرية' : 'Configure Experiment Parameters'}
          </span>
          <span className="text-[10px] font-mono text-cyan-500">
            {showParamEditor ? (isArabic ? 'إخفاء ▲' : 'Collapse ▲') : (isArabic ? 'تعديل ▼' : 'Edit ▼')}
          </span>
        </button>

        {showParamEditor && (
          <div className="mt-3 space-y-3 p-3 rounded-lg bg-[#09111a] border border-[#142334] text-xs">
            {metadata.paramDefinitions.map((paramDef: ParamDefinition) => (
              <div key={paramDef.id} className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <label htmlFor={paramDef.id} className="font-medium">
                    {isArabic ? paramDef.nameAr : paramDef.name}
                  </label>
                  {paramDef.type === 'number' && (
                    <span className="font-mono text-cyan-400">
                      {params[paramDef.id] ?? paramDef.defaultValue} {paramDef.unit}
                    </span>
                  )}
                </div>

                {paramDef.type === 'number' && (
                  <input
                    id={paramDef.id}
                    type="range"
                    min={paramDef.min}
                    max={paramDef.max}
                    step={paramDef.step || 1}
                    value={params[paramDef.id] ?? paramDef.defaultValue}
                    onChange={(e) => onUpdateParam(paramDef.id, parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-[#17283c] rounded"
                  />
                )}

                {paramDef.type === 'select' && paramDef.options && (
                  <select
                    id={paramDef.id}
                    value={params[paramDef.id] ?? paramDef.defaultValue}
                    onChange={(e) => onUpdateParam(paramDef.id, e.target.value)}
                    className="w-full p-1.5 bg-[#121f2d] border border-[#223750] rounded text-slate-200 text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    {paramDef.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {isArabic && opt.labelAr ? opt.labelAr : opt.label}
                      </option>
                    ))}
                  </select>
                )}

                {paramDef.description && (
                  <p className="text-[10px] text-slate-500">{paramDef.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
