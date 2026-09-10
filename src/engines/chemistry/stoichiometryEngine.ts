// Stoichiometry Calculation Engine
// Computes limiting reagents, excess reactant remaining, theoretical yield, and percent yield

import { computeMolarMassEngine } from './molarMassEngine';
import { balanceChemicalEquationEngine } from './reactionBalancer';

export interface StoichiometryReactantInput {
  formula: string;
  amount: number;
  unit: 'g' | 'mol';
}

export interface StoichiometryInputs {
  equation: string;
  reactants: StoichiometryReactantInput[];
  targetProduct?: string;
  actualYield?: {
    amount: number;
    unit: 'g' | 'mol';
  };
}

export interface ReagentAnalysis {
  formula: string;
  molarMass: number;
  initialMoles: number;
  initialMass: number;
  stoichiometricCoeff: number;
  molesPerCoeff: number;
  isLimiting: boolean;
  molesConsumed: number;
  massConsumed: number;
  molesRemaining: number;
  massRemaining: number;
}

export interface ProductYield {
  formula: string;
  molarMass: number;
  stoichiometricCoeff: number;
  theoreticalMoles: number;
  theoreticalMass: number;
  volumeAtSTP?: number; // Liters at 0°C, 1 atm for gases
  actualMass?: number;
  actualMoles?: number;
  percentYield?: number;
}

export interface StoichiometryResult {
  balancedEquation: string;
  limitingReagent: string;
  reactantsAnalysis: ReagentAnalysis[];
  productsYield: ProductYield[];
  targetProductYield?: ProductYield;
  isValid: boolean;
  errors: string[];
  units: {
    mass: string;
    moles: string;
    molarMass: string;
    volumeSTP: string;
    percentYield: string;
  };
  explanation: string[];
  assumptions: string[];
}

export function computeStoichiometryEngine(inputs: StoichiometryInputs): StoichiometryResult {
  const errors: string[] = [];
  const explanation: string[] = [];
  const assumptions: string[] = [
    'Reaction proceeds quantitatively to completion (no secondary side reactions).',
    'Ideal gas behavior assumed for STP gas volume calculations (22.414 L/mol at 0°C, 1 atm).',
    'Purity of starting reagents assumed to be 100.0%.',
  ];

  const defaultUnits = {
    mass: 'g',
    moles: 'mol',
    molarMass: 'g/mol',
    volumeSTP: 'L (STP)',
    percentYield: '%',
  };

  const emptyResult = (errs: string[]): StoichiometryResult => ({
    balancedEquation: inputs.equation || '',
    limitingReagent: 'None',
    reactantsAnalysis: [],
    productsYield: [],
    isValid: false,
    errors: errs,
    units: defaultUnits,
    explanation: errs,
    assumptions,
  });

  if (!inputs.equation || !inputs.equation.trim()) {
    errors.push('Please provide a chemical reaction equation.');
    return emptyResult(errors);
  }

  // 1. Balance reaction
  const balanceRes = balanceChemicalEquationEngine({ equation: inputs.equation });
  if (!balanceRes.isValid || balanceRes.reactants.length === 0 || balanceRes.products.length === 0) {
    errors.push(`Could not balance equation: ${balanceRes.errors.join('; ')}`);
    return emptyResult(errors);
  }

  const { reactants: rSpecies, products: pSpecies, balanced } = balanceRes;

  // 2. Validate input reactants
  if (!inputs.reactants || inputs.reactants.length === 0) {
    errors.push('At least one reactant amount must be specified.');
    return emptyResult(errors);
  }

  for (const r of inputs.reactants) {
    if (isNaN(r.amount) || r.amount <= 0) {
      errors.push(`Amount for reactant "${r.formula}" must be a positive number.`);
    }
  }
  if (errors.length > 0) return emptyResult(errors);

  // 3. Compute molar masses and moles for all reactants
  const reactantsAnalysis: ReagentAnalysis[] = [];
  explanation.push(`Balanced Reaction: ${balanced}`);

  for (const rSpec of rSpecies) {
    const matchedInput = inputs.reactants.find(
      (inp) => inp.formula.toUpperCase().replace(/\s+/g, '') === rSpec.formula.toUpperCase().replace(/\s+/g, '')
    );

    const mRes = computeMolarMassEngine({ formula: rSpec.formula });
    const molarMass = mRes.isValid && mRes.totalMolarMass > 0 ? mRes.totalMolarMass : 1;

    let initialMoles = 0;
    let initialMass = 0;

    if (matchedInput) {
      if (matchedInput.unit === 'g') {
        initialMass = matchedInput.amount;
        initialMoles = initialMass / molarMass;
      } else {
        initialMoles = matchedInput.amount;
        initialMass = initialMoles * molarMass;
      }
    }

    const molesPerCoeff = rSpec.coefficient > 0 ? initialMoles / rSpec.coefficient : 0;

    reactantsAnalysis.push({
      formula: rSpec.formula,
      molarMass,
      initialMoles,
      initialMass,
      stoichiometricCoeff: rSpec.coefficient,
      molesPerCoeff,
      isLimiting: false,
      molesConsumed: 0,
      massConsumed: 0,
      molesRemaining: 0,
      massRemaining: 0,
    });
  }

  // Filter to reactants that actually had an input provided
  const activeReactants = reactantsAnalysis.filter((r) => r.initialMoles > 0);
  if (activeReactants.length === 0) {
    errors.push('None of the specified reactant formulas matched the reactants in the balanced equation.');
    return emptyResult(errors);
  }

  // 4. Determine Limiting Reagent (lowest moles / coefficient)
  let minRatio = Infinity;
  let limitingReagentFormula = activeReactants[0].formula;

  for (const r of activeReactants) {
    if (r.molesPerCoeff < minRatio) {
      minRatio = r.molesPerCoeff;
      limitingReagentFormula = r.formula;
    }
  }

  explanation.push(`\n--- Step 1: Limiting Reagent Analysis ---`);
  activeReactants.forEach((r) => {
    const isLim = r.formula === limitingReagentFormula;
    r.isLimiting = isLim;
    explanation.push(
      `${r.formula}: ${r.initialMass.toFixed(3)} g ÷ ${r.molarMass.toFixed(3)} g/mol = ${r.initialMoles.toFixed(4)} mol (normalized by ν = ${r.stoichiometricCoeff}: ${r.molesPerCoeff.toFixed(4)} mol eq).`
    );
  });

  explanation.push(
    `Limiting Reagent is "${limitingReagentFormula}" (has the minimum stoichiometric mole equivalent ${minRatio.toFixed(4)} mol eq).`
  );

  // 5. Consumption and excess remaining calculation
  explanation.push(`\n--- Step 2: Reactant Consumption & Excess ---`);
  for (const r of reactantsAnalysis) {
    r.molesConsumed = r.stoichiometricCoeff * minRatio;
    r.massConsumed = r.molesConsumed * r.molarMass;
    r.molesRemaining = Math.max(0, r.initialMoles - r.molesConsumed);
    r.massRemaining = r.molesRemaining * r.molarMass;

    if (!r.isLimiting && r.initialMoles > 0) {
      explanation.push(
        `${r.formula}: Initial = ${r.initialMass.toFixed(2)} g, Consumed = ${r.massConsumed.toFixed(2)} g, Excess Remaining = ${r.massRemaining.toFixed(2)} g (${r.molesRemaining.toFixed(4)} mol).`
      );
    }
  }

  // 6. Theoretical yield calculation for all products
  explanation.push(`\n--- Step 3: Product Theoretical Yields ---`);
  const productsYield: ProductYield[] = [];
  const commonGases = new Set(['H2', 'O2', 'N2', 'CO2', 'CO', 'CH4', 'NH3', 'CL2', 'SO2', 'NO2']);

  for (const pSpec of pSpecies) {
    const mRes = computeMolarMassEngine({ formula: pSpec.formula });
    const molarMass = mRes.isValid && mRes.totalMolarMass > 0 ? mRes.totalMolarMass : 1;

    // Theoretical moles = product coefficient * minRatio
    const theoreticalMoles = pSpec.coefficient * minRatio;
    const theoreticalMass = theoreticalMoles * molarMass;

    // Check if STP gas volume applies
    let volumeAtSTP: number | undefined;
    if (commonGases.has(pSpec.formula.toUpperCase())) {
      volumeAtSTP = theoreticalMoles * 22.414;
    }

    const py: ProductYield = {
      formula: pSpec.formula,
      molarMass,
      stoichiometricCoeff: pSpec.coefficient,
      theoreticalMoles: Number(theoreticalMoles.toFixed(4)),
      theoreticalMass: Number(theoreticalMass.toFixed(4)),
      volumeAtSTP: volumeAtSTP ? Number(volumeAtSTP.toFixed(3)) : undefined,
    };

    // Actual yield & percent yield if specified
    if (
      inputs.actualYield &&
      inputs.targetProduct &&
      inputs.targetProduct.toUpperCase().replace(/\s+/g, '') === pSpec.formula.toUpperCase().replace(/\s+/g, '')
    ) {
      let actMass = 0;
      let actMol = 0;
      if (inputs.actualYield.unit === 'g') {
        actMass = inputs.actualYield.amount;
        actMol = actMass / molarMass;
      } else {
        actMol = inputs.actualYield.amount;
        actMass = actMol * molarMass;
      }
      py.actualMass = actMass;
      py.actualMoles = actMol;
      py.percentYield = theoreticalMass > 0 ? (actMass / theoreticalMass) * 100 : 0;
    }

    productsYield.push(py);
    explanation.push(
      `${pSpec.formula} (ν = ${pSpec.coefficient}): ${pSpec.coefficient} × ${minRatio.toFixed(4)} mol = ${theoreticalMoles.toFixed(4)} mol (${theoreticalMass.toFixed(3)} g theoretical yield)${volumeAtSTP ? ` [${volumeAtSTP.toFixed(2)} L at STP]` : ''}.`
    );

    if (py.percentYield !== undefined) {
      explanation.push(
        `Actual Yield = ${py.actualMass?.toFixed(3)} g → Percent Yield = (${py.actualMass?.toFixed(3)} / ${theoreticalMass.toFixed(3)}) × 100% = ${py.percentYield.toFixed(2)}%.`
      );
    }
  }

  const targetProductYield = inputs.targetProduct
    ? productsYield.find((p) => p.formula.toUpperCase() === inputs.targetProduct?.toUpperCase())
    : productsYield[0];

  return {
    balancedEquation: balanced,
    limitingReagent: limitingReagentFormula,
    reactantsAnalysis,
    productsYield,
    targetProductYield,
    isValid: true,
    errors: [],
    units: defaultUnits,
    explanation,
    assumptions,
  };
}

export const calculateStoichiometryEngine = computeStoichiometryEngine;
