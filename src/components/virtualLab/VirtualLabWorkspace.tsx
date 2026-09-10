// Virtual Laboratory Workspace
// Master container orchestrating simulation engines, visual equipment, control panels, graphing, and history.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  simulationRegistry,
  ISimulationEngine,
  ExperimentMetadata,
  BaseSimulationState,
  SimulationAction,
} from '../../engines/simulation';
import { ExperimentSelector } from './ExperimentSelector';
import { ControlsPanel } from './ControlsPanel';
import { ObservationArea } from './ObservationArea';
import { ResultsPanel } from './ResultsPanel';
import { DataTablePanel } from './DataTablePanel';
import { GraphPanel } from './GraphPanel';
import { ExperimentHistoryPanel, ExperimentRunRecord } from './ExperimentHistoryPanel';
import { SafetyAdvisoryModal } from './SafetyAdvisoryModal';

// Equipment Visualizations
import { TitrationEquipmentView } from './visualizations/TitrationEquipmentView';
import { CalorimetryEquipmentView } from './visualizations/CalorimetryEquipmentView';
import { KineticsEquipmentView } from './visualizations/KineticsEquipmentView';
import { GasLawEquipmentView } from './visualizations/GasLawEquipmentView';
import { SpectrophotometerEquipmentView } from './visualizations/SpectrophotometerEquipmentView';

import {
  FlaskConical,
  BarChart2,
  Table,
  History,
  FileText,
  HelpCircle,
  Minimize2,
  Maximize2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface VirtualLabWorkspaceProps {
  language?: 'en' | 'ar';
}

export const VirtualLabWorkspace: React.FC<VirtualLabWorkspaceProps> = ({
  language = 'en',
}) => {
  const isArabic = language === 'ar';
  const experiments = useMemoExperiments();
  const [selectedExpId, setSelectedExpId] = useState<string>('acid-base-titration');
  const [speed, setSpeed] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'graph' | 'table' | 'history'>('graph');
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<ExperimentRunRecord[]>([]);

  // Active Engine & Parameters
  const engineRef = useRef<ISimulationEngine<any, any> | undefined>(
    simulationRegistry.getEngine('acid-base-titration')
  );
  const [params, setParams] = useState<Record<string, any>>(() =>
    simulationRegistry.getDefaultParams('acid-base-titration')
  );
  const [simState, setSimState] = useState<BaseSimulationState>(() => {
    const eng = simulationRegistry.getEngine('acid-base-titration')!;
    return eng.getInitialState(simulationRegistry.getDefaultParams('acid-base-titration'));
  });

  // Switch Experiment Handler
  const handleSelectExperiment = useCallback((expId: string) => {
    // Archive current run if it has data
    if (simState.dataPoints.length > 0) {
      archiveCurrentRun();
    }

    setSelectedExpId(expId);
    const newEngine = simulationRegistry.getEngine(expId);
    engineRef.current = newEngine;

    if (newEngine) {
      const defaultParams = simulationRegistry.getDefaultParams(expId);
      setParams(defaultParams);
      const initialState = newEngine.getInitialState(defaultParams);
      setSimState(initialState);
    }
  }, [simState]);

  // Update Parameter Handler
  const handleUpdateParam = useCallback((paramId: string, value: any) => {
    setParams((prev) => {
      const updated = { ...prev, [paramId]: value };
      if (engineRef.current && !simState.isRunning && simState.simTime === 0) {
        setSimState(engineRef.current.getInitialState(updated));
      }
      return updated;
    });
  }, [simState.isRunning, simState.simTime]);

  // Dispatch Action to Simulation Engine
  const handleAction = useCallback((action: SimulationAction) => {
    if (!engineRef.current) return;

    if (action.type === 'START') {
      setSimState((prev) => ({ ...prev, isRunning: true }));
      return;
    }

    if (action.type === 'PAUSE') {
      setSimState((prev) => ({ ...prev, isRunning: false }));
      return;
    }

    if (action.type === 'RESET') {
      const freshState = engineRef.current.getInitialState(params);
      setSimState(freshState);
      return;
    }

    const nextState = engineRef.current.handleAction(simState, action, params);
    setSimState(nextState);
  }, [simState, params]);

  // Archive Run to History
  const archiveCurrentRun = useCallback(() => {
    if (!engineRef.current || simState.dataPoints.length === 0) return;
    const currentMeta = engineRef.current.metadata;
    const topResult = simState.results[0];

    const record: ExperimentRunRecord = {
      runId: `run-${Date.now()}`,
      experimentId: currentMeta.id,
      experimentTitle: currentMeta.title,
      experimentTitleAr: currentMeta.titleAr,
      timestamp: Date.now(),
      durationSeconds: simState.simTime,
      dataPointsCount: simState.dataPoints.length,
      keyMetricLabel: topResult?.label || 'Data Points',
      keyMetricValue: topResult ? `${topResult.value} ${topResult.unit || ''}` : `${simState.dataPoints.length}`,
      params: { ...params },
    };

    setHistory((prev) => [record, ...prev]);
  }, [simState, params]);

  // Real-Time Simulation Stepping Loop
  useEffect(() => {
    if (!simState.isRunning || simState.isComplete) return;

    const interval = setInterval(() => {
      if (engineRef.current && simState.isRunning) {
        const dt = 0.2 * speed;
        setSimState((prev) => {
          if (!prev.isRunning || prev.isComplete) return prev;
          return engineRef.current!.step(prev, params, dt);
        });
      }
    }, 150);

    return () => clearInterval(interval);
  }, [simState.isRunning, simState.isComplete, speed, params]);

  // Auto-archive when simulation is marked complete
  useEffect(() => {
    if (simState.isComplete && simState.dataPoints.length > 0) {
      archiveCurrentRun();
    }
  }, [simState.isComplete]);

  // Active Metadata
  const currentMetadata = engineRef.current?.metadata || experiments[0];

  return (
    <div
      className={`w-full min-h-screen bg-[#060c14] text-slate-100 flex flex-col font-sans ${
        isArabic ? 'rtl' : 'ltr'
      }`}
    >
      {/* 1. Top Experiment Selector Bar */}
      <ExperimentSelector
        experiments={experiments}
        selectedExperimentId={selectedExpId}
        onSelectExperiment={handleSelectExperiment}
        onOpenSafetyAdvisory={() => setIsSafetyModalOpen(true)}
        isArabic={isArabic}
      />

      {/* 2. Main Laboratory Workspace Layout */}
      <div className="flex-1 p-3 sm:p-5 max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (Lg: 7 cols): Equipment Visualization + Observations */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Equipment Visualization Stage Card */}
          <div className="w-full bg-[#0d1622] border border-[#18293d] rounded-xl p-3 sm:p-4 shadow-xl flex flex-col justify-between relative overflow-hidden">
            {/* Visualizer Header */}
            <div className="flex items-center justify-between border-b border-[#18293d] pb-2.5 mb-2">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  {isArabic ? 'منطقة المشاهدة وتجهيزات المختبر' : 'Apparatus & Equipment Visualization'}
                </h3>
              </div>

              {/* Status Pill */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-cyan-400">
                  t = {simState.simTime.toFixed(1)}s
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                    simState.isRunning
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : 'bg-[#132030] text-slate-400'
                  }`}
                >
                  {simState.isRunning
                    ? isArabic
                      ? 'نشط'
                      : 'LIVE'
                    : isArabic
                    ? 'متوقف'
                    : 'PAUSED'}
                </span>
              </div>
            </div>

            {/* Dynamic Equipment Rendering */}
            <div className="w-full flex-1 flex items-center justify-center bg-[#070e17] rounded-lg border border-[#121f2f] overflow-hidden min-h-[350px]">
              {selectedExpId === 'acid-base-titration' && (
                <TitrationEquipmentView state={simState as any} params={params as any} isArabic={isArabic} />
              )}
              {selectedExpId === 'solution-calorimetry' && (
                <CalorimetryEquipmentView state={simState as any} params={params as any} isArabic={isArabic} />
              )}
              {selectedExpId === 'chemical-kinetics' && (
                <KineticsEquipmentView state={simState as any} params={params as any} isArabic={isArabic} />
              )}
              {selectedExpId === 'gas-laws-pvt' && (
                <GasLawEquipmentView state={simState as any} params={params as any} isArabic={isArabic} />
              )}
              {selectedExpId === 'spectrophotometry-beer-lambert' && (
                <SpectrophotometerEquipmentView state={simState as any} params={params as any} isArabic={isArabic} />
              )}
            </div>

            {/* Live Status Text Bar */}
            <div className="mt-2.5 p-2 rounded bg-[#08121c] border border-[#121f2f] text-xs font-mono text-slate-300 flex items-center justify-between">
              <span className="truncate">
                {isArabic && simState.statusTextAr ? simState.statusTextAr : simState.statusText}
              </span>
              <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                {simState.dataPoints.length} points
              </span>
            </div>
          </div>

          {/* Chronological Observation Area */}
          <ObservationArea
            observations={simState.observations}
            onClear={() => setSimState((prev) => ({ ...prev, observations: [] }))}
            isArabic={isArabic}
          />
        </div>

        {/* Right Column (Lg: 5 cols): Controls, Results, Tabs (Graph, Table, History) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Controls Panel */}
          <ControlsPanel
            metadata={currentMetadata}
            state={simState}
            params={params}
            onAction={handleAction}
            onUpdateParam={handleUpdateParam}
            speed={speed}
            onSpeedChange={setSpeed}
            isArabic={isArabic}
          />

          {/* Results Panel */}
          <ResultsPanel
            results={simState.results}
            isComplete={simState.isComplete}
            isArabic={isArabic}
          />

          {/* Analysis View Tabs: Graph vs Data Table vs History */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-1 border-b border-[#18293d] pb-1">
              <button
                onClick={() => setActiveTab('graph')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-medium transition cursor-pointer ${
                  activeTab === 'graph'
                    ? 'bg-[#0d1622] text-cyan-300 border-t border-x border-[#18293d]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isArabic ? 'المنحنى البياني' : 'Vector Plot'}</span>
              </button>

              <button
                onClick={() => setActiveTab('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-medium transition cursor-pointer ${
                  activeTab === 'table'
                    ? 'bg-[#0d1622] text-cyan-300 border-t border-x border-[#18293d]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Table className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isArabic ? 'جدول القياسات' : 'Data Table'}</span>
                <span className="text-[10px] font-mono px-1 rounded bg-[#142334] text-slate-400">
                  {simState.dataPoints.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-medium transition cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-[#0d1622] text-cyan-300 border-t border-x border-[#18293d]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <History className="w-3.5 h-3.5 text-purple-400" />
                <span>{isArabic ? 'السجل' : 'Run History'}</span>
                <span className="text-[10px] font-mono px-1 rounded bg-[#142334] text-slate-400">
                  {history.length}
                </span>
              </button>
            </div>

            {/* Active Tab Panel Body */}
            {activeTab === 'graph' && (
              <GraphPanel
                config={currentMetadata.graphConfig}
                dataPoints={simState.dataPoints}
                isArabic={isArabic}
              />
            )}

            {activeTab === 'table' && (
              <DataTablePanel
                columns={currentMetadata.tableColumns}
                dataPoints={simState.dataPoints}
                onClearData={() => setSimState((prev) => ({ ...prev, dataPoints: [] }))}
                isArabic={isArabic}
              />
            )}

            {activeTab === 'history' && (
              <ExperimentHistoryPanel
                history={history}
                onClearHistory={() => setHistory([])}
                isArabic={isArabic}
              />
            )}
          </div>
        </div>
      </div>

      {/* Safety Advisory Modal */}
      <SafetyAdvisoryModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
        isArabic={isArabic}
      />
    </div>
  );
};

function useMemoExperiments(): ExperimentMetadata[] {
  return React.useMemo(() => simulationRegistry.listExperiments(), []);
}
