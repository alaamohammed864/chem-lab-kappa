// Virtual Laboratory & Simulation Architecture Types
// Provides a decoupled, extensible framework separating Simulation Logic, UI, and Visualization.

export type SimulationCategory =
  | 'Acid-Base Titration'
  | 'Thermochemistry & Calorimetry'
  | 'Chemical Kinetics'
  | 'Gas Laws & Thermodynamics'
  | 'Spectrophotometry & Optics';

export interface SimulationParamDefinition {
  id: string;
  name: string;
  nameAr?: string;
  type: 'number' | 'select' | 'boolean';
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: { label: string; labelAr?: string; value: string | number }[];
  defaultValue: any;
  description: string;
  descriptionAr?: string;
}

export interface SimulationObservation {
  timestamp: number; // in seconds of simulation time
  type: 'info' | 'change' | 'milestone' | 'warning';
  message: string;
  messageAr?: string;
  visualCue?: string; // e.g. color hex code, indicator change
}

export interface SimulationDataPoint {
  id: string;
  stepIndex: number;
  simTime: number; // in seconds
  values: Record<string, number | string>;
}

export interface SimulationResultItem {
  label: string;
  labelAr?: string;
  value: string | number;
  unit?: string;
  expectedValue?: string | number;
  percentError?: number;
  formulaUsed?: string;
  interpretation?: string;
  interpretationAr?: string;
}

export interface GraphAxisConfig {
  xKey: string;
  xLabel: string;
  xLabelAr?: string;
  xUnit: string;
  yKey: string;
  yLabel: string;
  yLabelAr?: string;
  yUnit: string;
  secondaryYKey?: string;
  secondaryYLabel?: string;
  secondaryYUnit?: string;
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
}

export interface TableColumnConfig {
  key: string;
  label: string;
  labelAr?: string;
  unit?: string;
  precision?: number;
}

export interface ExperimentMetadata {
  id: string;
  title: string;
  titleAr: string;
  category: SimulationCategory;
  difficulty: 'Introductory' | 'Intermediate' | 'Advanced';
  durationMinutes: number;
  summary: string;
  summaryAr: string;
  educationalObjectives: string[];
  educationalObjectivesAr?: string[];
  safetyGuidelines: string[];
  safetyGuidelinesAr?: string[];
  paramDefinitions: SimulationParamDefinition[];
  tableColumns: TableColumnConfig[];
  graphConfig: GraphAxisConfig;
}

export interface SimulationAction {
  type: string;
  payload?: any;
}

export interface BaseSimulationState {
  simTime: number; // current elapsed simulation seconds
  isRunning: boolean;
  isComplete: boolean;
  statusText: string;
  statusTextAr?: string;
  observations: SimulationObservation[];
  dataPoints: SimulationDataPoint[];
  results: SimulationResultItem[];
}

export interface ISimulationEngine<
  TState extends BaseSimulationState = BaseSimulationState,
  TParams = Record<string, any>
> {
  metadata: ExperimentMetadata;
  getInitialState(params: TParams): TState;
  step(currentState: TState, params: TParams, dt: number): TState;
  handleAction(currentState: TState, action: SimulationAction, params: TParams): TState;
  calculateResults(state: TState, params: TParams): SimulationResultItem[];
  validateParams(params: TParams): { isValid: boolean; errors?: string[] };
}

export interface ExperimentHistoryItem {
  id: string;
  experimentId: string;
  experimentTitle: string;
  dateCompleted: string;
  durationSeconds: number;
  paramsSnapshot: Record<string, any>;
  dataPointsCount: number;
  keyResults: { label: string; value: string | number; unit?: string }[];
  notes?: string;
}

// Convenient aliases for component props
export type ParamDefinition = SimulationParamDefinition;
export type TableColumnDefinition = TableColumnConfig;
export type GraphConfig = GraphAxisConfig;
export type ObservationEvent = SimulationObservation;

