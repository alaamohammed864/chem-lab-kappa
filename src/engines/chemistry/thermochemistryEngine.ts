// Thermochemistry & Chemical Thermodynamics Engine
// Computes Hess's Law ΔH°rxn, Standard Entropy ΔS°rxn, Gibbs Free Energy ΔG°rxn, Equilibrium Constants K_eq, and Calorimetry q = mcΔT

import { THERMODYNAMIC_DATA, ThermodynamicEntry } from '../../data/thermochemistryData';
import { balanceChemicalEquationEngine } from './reactionBalancer';

export type ThermoMode = 'reaction_thermodynamics' | 'reaction_enthalpy' | 'calorimetry' | 'heat_capacity' | 'temperature_dependence';

export interface ThermochemistryInputs {
  mode: ThermoMode;
  equation?: string;
  reactionEquation?: string;
  temperatureKelvin?: number; // Defaults to 298.15 K
  // Calorimetry inputs
  massGrams?: number;
  substanceMassGrams?: number;
  specificHeatJPerGC?: number; // e.g. 4.184 J/(g·°C) for liquid water
  specificHeatCapacity?: number;
  deltaTempC?: number;
  deltaTemperatureC?: number;
  initialTempC?: number;
  finalTempC?: number;
  calorimeterHeatCapacityJPerC?: number;
}

export interface SpeciesThermoBreakdown {
  formula: string;
  name: string;
  phase: string;
  coefficient: number;
  isProduct: boolean;
  deltaHf: number; // kJ/mol
  deltaGf: number; // kJ/mol
  s0: number;      // J/(mol·K)
}

export interface ThermochemistryResult {
  mode: ThermoMode;
  // Reaction results
  deltaHReactionKJ: number;
  deltaH_kJ_mol?: number; // alias
  deltaSReactionJPerK: number;
  deltaGReactionKJ: number;
  deltaG_kJ_mol?: number; // alias
  equilibriumConstantKeq?: number;
  temperatureKelvin: number;
  isExothermic: boolean;
  isSpontaneous: boolean;
  spontaneityRegime: string;
  crossoverTemperatureKelvin?: number;
  speciesBreakdown: SpeciesThermoBreakdown[];
  // Calorimetry results
  heatTransferredJoules?: number;
  heatEnergyJoules?: number; // alias
  heatTransferredKJ?: number;
  // Metadata
  isValid: boolean;
  errors: string[];
  units: {
    enthalpy: string;
    entropy: string;
    gibbsEnergy: string;
    temperature: string;
    heat: string;
  };
  explanation: string[];
  assumptions: string[];
}

export function computeThermochemistryEngine(inputs: ThermochemistryInputs): ThermochemistryResult {
  const errors: string[] = [];
  const explanation: string[] = [];
  const tempK = inputs.temperatureKelvin && inputs.temperatureKelvin > 0 ? inputs.temperatureKelvin : 298.15;

  const defaultUnits = {
    enthalpy: 'kJ/mol',
    entropy: 'J/(mol·K)',
    gibbsEnergy: 'kJ/mol',
    temperature: 'K',
    heat: 'J',
  };

  const assumptions: string[] = [
    'Thermodynamic properties referenced from NIST Chemistry WebBook standard state tables at P = 1 bar (100 kPa).',
    'ΔH° and ΔS° assumed invariant with temperature over moderate ranges (Kirchhoff heat capacity variations neglected unless specified).',
    'Ideal thermodynamic behavior for gaseous and dilute aqueous species.',
  ];

  const emptyResult = (errs: string[]): ThermochemistryResult => ({
    mode: inputs.mode,
    deltaHReactionKJ: 0,
    deltaSReactionJPerK: 0,
    deltaGReactionKJ: 0,
    temperatureKelvin: tempK,
    isExothermic: false,
    isSpontaneous: false,
    spontaneityRegime: 'Undefined',
    speciesBreakdown: [],
    isValid: false,
    errors: errs,
    units: defaultUnits,
    explanation: errs,
    assumptions,
  });

  const R_J_MOL_K = 8.314462618;

  try {
    if (inputs.mode === 'calorimetry' || (inputs.mode as string) === 'heat_capacity') {
      const mass = inputs.massGrams || inputs.substanceMassGrams || 0;
      const c = inputs.specificHeatJPerGC || inputs.specificHeatCapacity || 4.184; // Water default
      let dT = inputs.deltaTempC !== undefined ? inputs.deltaTempC : inputs.deltaTemperatureC;

      if (dT === undefined && inputs.initialTempC !== undefined && inputs.finalTempC !== undefined) {
        dT = inputs.finalTempC - inputs.initialTempC;
      }

      if (mass <= 0) {
        errors.push('Sample mass must be strictly positive for calorimetry.');
        return emptyResult(errors);
      }
      if (dT === undefined) {
        errors.push('Temperature change (ΔT) or initial and final temperatures must be provided.');
        return emptyResult(errors);
      }

      // q_sample = m · c · ΔT
      let qJoules = mass * c * dT;
      if (inputs.calorimeterHeatCapacityJPerC && inputs.calorimeterHeatCapacityJPerC > 0) {
        qJoules += inputs.calorimeterHeatCapacityJPerC * dT;
      }
      const qKJ = qJoules / 1000;

      explanation.push(`Calorimetry Formula: q = m · c · ΔT`);
      explanation.push(
        `q = (${mass} g) × (${c} J/(g·°C)) × (${dT.toFixed(2)} °C) = ${qJoules.toFixed(2)} J (${qKJ.toFixed(4)} kJ)`
      );
      if (dT > 0) {
        explanation.push('System absorbed thermal energy (Endothermic process relative to the fluid).');
      } else {
        explanation.push('System released thermal energy (Exothermic process relative to the fluid).');
      }

      return {
        mode: inputs.mode,
        deltaHReactionKJ: qKJ,
        deltaH_kJ_mol: qKJ,
        deltaSReactionJPerK: 0,
        deltaGReactionKJ: 0,
        deltaG_kJ_mol: 0,
        temperatureKelvin: tempK,
        isExothermic: qJoules < 0,
        isSpontaneous: true,
        spontaneityRegime: qJoules < 0 ? 'Exothermic heat evolution' : 'Endothermic heat absorption',
        speciesBreakdown: [],
        heatTransferredJoules: Number(qJoules.toFixed(2)),
        heatEnergyJoules: Number(qJoules.toFixed(2)),
        heatTransferredKJ: Number(qKJ.toFixed(4)),
        isValid: true,
        errors: [],
        units: defaultUnits,
        explanation,
        assumptions,
      };
    }

    // Reaction Thermodynamics Mode
    const eqInput = inputs.equation || inputs.reactionEquation;
    if (!eqInput || !eqInput.trim()) {
      errors.push('A chemical reaction equation is required for thermodynamic analysis.');
      return emptyResult(errors);
    }

    const balancedRes = balanceChemicalEquationEngine({ equation: eqInput });
    if (!balancedRes.isValid || balancedRes.reactants.length === 0 || balancedRes.products.length === 0) {
      errors.push(`Unable to balance reaction for thermochemistry: ${balancedRes.errors.join('; ')}`);
      return emptyResult(errors);
    }

    const speciesBreakdown: SpeciesThermoBreakdown[] = [];
    let sumProductsH = 0;
    let sumReactantsH = 0;
    let sumProductsS = 0;
    let sumReactantsS = 0;
    let sumProductsG = 0;
    let sumReactantsG = 0;

    explanation.push(`Balanced Equation: ${balancedRes.balanced}`);

    // Helper to find entry in THERMODYNAMIC_DATA
    const findEntry = (formula: string): ThermodynamicEntry | null => {
      const clean = formula
        .trim()
        .replace(/[₀-₉]/g, (ch) => '0123456789'['₀₁₂₃₄₅₆₇₈₉'.indexOf(ch)] || ch)
        .replace(/\([a-z,]+\)/i, '')
        .toUpperCase();
      for (const key of Object.keys(THERMODYNAMIC_DATA)) {
        const item = THERMODYNAMIC_DATA[key];
        const itemFormula = item.formula
          .trim()
          .replace(/[₀-₉]/g, (ch) => '0123456789'['₀₁₂₃₄₅₆₇₈₉'.indexOf(ch)] || ch)
          .toUpperCase();
        const baseKey = key.replace(/\([a-z,]+\)/i, '').toUpperCase();
        if (itemFormula === clean || baseKey === clean || key.toUpperCase() === clean) {
          return item;
        }
      }
      return null;
    };

    // Process reactants
    for (const r of balancedRes.reactants) {
      const entry = findEntry(r.formula);
      if (!entry) {
        errors.push(`Thermodynamic data for reactant "${r.formula}" is not available in standard NIST tables.`);
        continue;
      }
      speciesBreakdown.push({
        formula: r.formula,
        name: entry.name,
        phase: entry.phase,
        coefficient: r.coefficient,
        isProduct: false,
        deltaHf: entry.deltaHf,
        deltaGf: entry.deltaGf,
        s0: entry.S0,
      });
      sumReactantsH += r.coefficient * entry.deltaHf;
      sumReactantsS += r.coefficient * entry.S0;
      sumReactantsG += r.coefficient * entry.deltaGf;
    }

    // Process products
    for (const p of balancedRes.products) {
      const entry = findEntry(p.formula);
      if (!entry) {
        errors.push(`Thermodynamic data for product "${p.formula}" is not available in standard NIST tables.`);
        continue;
      }
      speciesBreakdown.push({
        formula: p.formula,
        name: entry.name,
        phase: entry.phase,
        coefficient: p.coefficient,
        isProduct: true,
        deltaHf: entry.deltaHf,
        deltaGf: entry.deltaGf,
        s0: entry.S0,
      });
      sumProductsH += p.coefficient * entry.deltaHf;
      sumProductsS += p.coefficient * entry.S0;
      sumProductsG += p.coefficient * entry.deltaGf;
    }

    if (errors.length > 0) {
      return emptyResult(errors);
    }

    // Hess's Law
    const deltaH = sumProductsH - sumReactantsH;
    const deltaS = sumProductsS - sumReactantsS; // J/(mol·K)

    // Gibbs Free Energy:
    // At standard T (298.15K), can use sum(deltaGf).
    // At non-standard T, use Gibbs-Helmholtz: ΔG = ΔH - T·ΔS
    const deltaG = tempK === 298.15
      ? (sumProductsG - sumReactantsG)
      : deltaH - (tempK * deltaS) / 1000;

    const isExo = deltaH < 0;
    const isSpon = deltaG < 0;

    // Equilibrium Constant: K = exp(-ΔG / RT)
    // Guard against overflow/underflow
    let keq: number | undefined;
    const exponent = (-deltaG * 1000) / (R_J_MOL_K * tempK);
    if (exponent > 100) {
      keq = Infinity;
    } else if (exponent < -100) {
      keq = 0;
    } else {
      keq = Math.exp(exponent);
    }

    // Spontaneity regime & crossover temperature
    let regime = '';
    let crossoverT: number | undefined;

    if (deltaH < 0 && deltaS > 0) {
      regime = 'Spontaneous at all temperatures (Enthalpically & Entropically favored: ΔH < 0, ΔS > 0)';
    } else if (deltaH > 0 && deltaS < 0) {
      regime = 'Non-spontaneous at all temperatures (Disadvantaged: ΔH > 0, ΔS < 0)';
    } else if (deltaH < 0 && deltaS < 0) {
      // Spontaneous at low temperatures (T < ΔH / ΔS)
      crossoverT = (deltaH * 1000) / deltaS;
      regime = `Spontaneous at low temperatures (below T* = ${crossoverT.toFixed(1)} K)`;
    } else if (deltaH > 0 && deltaS > 0) {
      // Spontaneous at high temperatures (T > ΔH / ΔS)
      crossoverT = (deltaH * 1000) / deltaS;
      regime = `Spontaneous at high temperatures (above T* = ${crossoverT.toFixed(1)} K)`;
    }

    explanation.push(`\n--- Hess's Law Calculations (T = ${tempK} K) ---`);
    explanation.push(
      `Standard Enthalpy of Reaction: ΔH°rxn = Σ ν_p ΔH°f(products) - Σ ν_r ΔH°f(reactants) = ${sumProductsH.toFixed(2)} - (${sumReactantsH.toFixed(2)}) = ${deltaH.toFixed(2)} kJ/mol (${isExo ? 'Exothermic' : 'Endothermic'})`
    );
    explanation.push(
      `Standard Entropy of Reaction: ΔS°rxn = Σ ν_p S°(products) - Σ ν_r S°(reactants) = ${sumProductsS.toFixed(2)} - (${sumReactantsS.toFixed(2)}) = ${deltaS.toFixed(2)} J/(mol·K)`
    );
    explanation.push(
      `Gibbs Free Energy: ΔG°rxn = ΔH° - T·ΔS° = ${deltaH.toFixed(2)} kJ - (${tempK} K × ${deltaS.toFixed(2)} J/(mol·K) ÷ 1000) = ${deltaG.toFixed(2)} kJ/mol`
    );
    explanation.push(`Spontaneity: ${isSpon ? 'Thermodynamically SPONTANEOUS (ΔG < 0)' : 'NON-SPONTANEOUS (ΔG > 0)'}`);
    explanation.push(`Regime: ${regime}`);
    if (keq !== undefined && isFinite(keq) && keq > 0) {
      explanation.push(`Equilibrium Constant K_eq = exp(-ΔG° / RT) = ${keq.toExponential(3)}`);
    }

    return {
      mode: inputs.mode,
      deltaHReactionKJ: Number(deltaH.toFixed(2)),
      deltaH_kJ_mol: Number(deltaH.toFixed(2)),
      deltaSReactionJPerK: Number(deltaS.toFixed(2)),
      deltaGReactionKJ: Number(deltaG.toFixed(2)),
      deltaG_kJ_mol: Number(deltaG.toFixed(2)),
      equilibriumConstantKeq: keq !== undefined ? (isFinite(keq) ? Number(keq.toPrecision(4)) : undefined) : undefined,
      temperatureKelvin: tempK,
      isExothermic: isExo,
      isSpontaneous: isSpon,
      spontaneityRegime: regime,
      crossoverTemperatureKelvin: crossoverT ? Number(crossoverT.toFixed(1)) : undefined,
      speciesBreakdown,
      isValid: true,
      errors: [],
      units: defaultUnits,
      explanation,
      assumptions,
    };
  } catch (err: any) {
    errors.push(err?.message || 'Error executing thermochemical calculation.');
    return emptyResult(errors);
  }
}

export const calculateThermochemistryEngine = computeThermochemistryEngine;
