// Central Simulation Registry & Factory
// Provides modular registry and decoupled access to all scientific simulation engines.

import { ISimulationEngine, ExperimentMetadata } from './types';
import { TitrationSimulationEngine } from './titrationEngine';
import { CalorimetrySimulationEngine } from './calorimetryEngine';
import { KineticsSimulationEngine } from './kineticsEngine';
import { GasLawSimulationEngine } from './gasLawLabEngine';
import { SpectrophotometrySimulationEngine } from './spectrophotometryEngine';

class SimulationRegistry {
  private engines: Map<string, ISimulationEngine<any, any>> = new Map();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults() {
    this.registerEngine(new TitrationSimulationEngine());
    this.registerEngine(new CalorimetrySimulationEngine());
    this.registerEngine(new KineticsSimulationEngine());
    this.registerEngine(new GasLawSimulationEngine());
    this.registerEngine(new SpectrophotometrySimulationEngine());
  }

  /**
   * Register a new simulation engine into the virtual laboratory.
   * Supports runtime expansion for future custom educational experiments.
   */
  public registerEngine(engine: ISimulationEngine<any, any>): void {
    this.engines.set(engine.metadata.id, engine);
  }

  /**
   * Retrieve a simulation engine by its unique experiment ID.
   */
  public getEngine(id: string): ISimulationEngine<any, any> | undefined {
    return this.engines.get(id);
  }

  /**
   * List metadata for all registered simulation experiments.
   */
  public listExperiments(): ExperimentMetadata[] {
    return Array.from(this.engines.values()).map((e) => e.metadata);
  }

  /**
   * Retrieve default parameters for a given experiment ID.
   */
  public getDefaultParams(id: string): Record<string, any> {
    const engine = this.getEngine(id);
    if (!engine) return {};
    const defaults: Record<string, any> = {};
    for (const def of engine.metadata.paramDefinitions) {
      defaults[def.id] = def.defaultValue;
    }
    return defaults;
  }
}

export const simulationRegistry = new SimulationRegistry();
