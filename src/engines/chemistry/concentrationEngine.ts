// Solution Concentration Engine
// Calculates Molarity, Molality, Mass Percent (w/w), Parts Per Million (ppm), Normality, and Solution Preparation Quantities

import { computeMolarMassEngine } from './molarMassEngine';

export interface ConcentrationInputs {
  soluteFormula?: string;
  soluteMolarMass?: number;
  soluteMassGrams?: number;
  soluteMoles?: number;
  solutionVolumeLiters?: number;
  solventMassKg?: number;
  solutionDensityGPerMl?: number; // Defaults to 1.00 g/mL for dilute aqueous solutions
  valenceEquivalents?: number;    // n for Normality N = M * n (e.g. 2 for H2SO4 or Ca(OH)2)
}

export interface ConcentrationResult {
  soluteMolarMass: number;
  soluteMoles: number;
  soluteMassGrams: number;
  solutionVolumeLiters: number;
  solventMassKg: number;
  solutionMassGrams: number;
  molarityM: number;       // mol/L
  molarity?: number;       // alias
  molalityM: number;       // mol/kg solvent
  massPercent: number;     // % w/w
  ppm: number;             // parts per million (mg/kg or mg/L)
  ppb: number;             // parts per billion (μg/kg)
  normalityN: number;      // eq/L
  massConcentrationGPerL: number; // g/L
  isValid: boolean;
  errors: string[];
  units: {
    molarity: string;
    molality: string;
    massPercent: string;
    ppm: string;
    normality: string;
    massConcentration: string;
  };
  explanation: string[];
  assumptions: string[];
}

export function computeConcentrationEngine(inputs: ConcentrationInputs): ConcentrationResult {
  const errors: string[] = [];
  const explanation: string[] = [];
  const assumptions: string[] = [
    'Dilute aqueous solution behavior at 20°C - 25°C.',
    inputs.solutionDensityGPerMl
      ? `Solution density specified as ${inputs.solutionDensityGPerMl} g/mL.`
      : 'Solution density approximated as 1.000 g/mL (standard dilute water density).',
    'Additivity of volume assumed in the absence of non-ideal excess volume of mixing data.',
  ];

  const defaultUnits = {
    molarity: 'mol/L (M)',
    molality: 'mol/kg solvent (m)',
    massPercent: '% (w/w)',
    ppm: 'ppm (mg/kg)',
    normality: 'eq/L (N)',
    massConcentration: 'g/L',
  };

  const emptyResult = (errs: string[]): ConcentrationResult => ({
    soluteMolarMass: 0,
    soluteMoles: 0,
    soluteMassGrams: 0,
    solutionVolumeLiters: 0,
    solventMassKg: 0,
    solutionMassGrams: 0,
    molarityM: 0,
    molalityM: 0,
    massPercent: 0,
    ppm: 0,
    ppb: 0,
    normalityN: 0,
    massConcentrationGPerL: 0,
    isValid: false,
    errors: errs,
    units: defaultUnits,
    explanation: errs,
    assumptions,
  });

  // Determine molar mass
  let molarMass = inputs.soluteMolarMass || 0;
  if (inputs.soluteFormula && inputs.soluteFormula.trim()) {
    const mmRes = computeMolarMassEngine({ formula: inputs.soluteFormula.trim() });
    if (mmRes.isValid && mmRes.totalMolarMass > 0) {
      molarMass = mmRes.totalMolarMass;
    } else {
      errors.push(`Invalid solute formula "${inputs.soluteFormula}": ${mmRes.errors.join('; ')}`);
      return emptyResult(errors);
    }
  }

  if (molarMass <= 0) {
    errors.push('A valid solute formula or positive molar mass (g/mol) is required.');
    return emptyResult(errors);
  }

  // Determine solute amount
  let soluteGrams = inputs.soluteMassGrams || 0;
  let soluteMoles = inputs.soluteMoles || 0;

  if (soluteGrams > 0 && soluteMoles <= 0) {
    soluteMoles = soluteGrams / molarMass;
  } else if (soluteMoles > 0 && soluteGrams <= 0) {
    soluteGrams = soluteMoles * molarMass;
  } else if (soluteGrams <= 0 && soluteMoles <= 0) {
    errors.push('Either solute mass (grams) or solute amount (moles) must be provided.');
    return emptyResult(errors);
  }

  // Determine solution volume and masses
  let volumeLiters = inputs.solutionVolumeLiters || 0;
  const densityGPerMl = inputs.solutionDensityGPerMl || 1.0;
  let solventKg = inputs.solventMassKg || 0;

  if (volumeLiters <= 0 && solventKg > 0) {
    // Approximate volume from solvent mass and solute mass via density
    const totalMassGrams = solventKg * 1000 + soluteGrams;
    const totalVolumeMl = totalMassGrams / densityGPerMl;
    volumeLiters = totalVolumeMl / 1000;
  } else if (volumeLiters > 0 && solventKg <= 0) {
    const totalMassGrams = volumeLiters * 1000 * densityGPerMl;
    const solventGrams = Math.max(0, totalMassGrams - soluteGrams);
    solventKg = solventGrams / 1000;
  } else if (volumeLiters <= 0 && solventKg <= 0) {
    // Default to 1.0 Liter
    volumeLiters = 1.0;
    solventKg = Math.max(0.001, (volumeLiters * 1000 * densityGPerMl - soluteGrams) / 1000);
  }

  if (volumeLiters <= 0) {
    errors.push('Solution volume must be strictly positive.');
    return emptyResult(errors);
  }

  const solutionMassGrams = volumeLiters * 1000 * densityGPerMl;
  const molarityM = soluteMoles / volumeLiters;
  const molalityM = solventKg > 0 ? soluteMoles / solventKg : 0;
  const massPercent = solutionMassGrams > 0 ? (soluteGrams / solutionMassGrams) * 100 : 0;
  const ppm = solutionMassGrams > 0 ? (soluteGrams / solutionMassGrams) * 1_000_000 : 0;
  const ppb = ppm * 1_000;
  const valence = inputs.valenceEquivalents && inputs.valenceEquivalents > 0 ? inputs.valenceEquivalents : 1;
  const normalityN = molarityM * valence;
  const massConcGPerL = soluteGrams / volumeLiters;

  explanation.push(`Solute Molar Mass = ${molarMass.toFixed(3)} g/mol`);
  explanation.push(
    `Solute Quantity: ${soluteGrams.toFixed(4)} g ⟷ ${soluteMoles.toFixed(5)} mol (n = m / M)`
  );
  explanation.push(
    `Molarity (C = n / V): ${soluteMoles.toFixed(4)} mol ÷ ${volumeLiters.toFixed(3)} L = ${molarityM.toFixed(4)} M`
  );
  explanation.push(
    `Mass Concentration: ${soluteGrams.toFixed(3)} g ÷ ${volumeLiters.toFixed(3)} L = ${massConcGPerL.toFixed(3)} g/L`
  );
  explanation.push(
    `Mass Percent: (${soluteGrams.toFixed(3)} g ÷ ${solutionMassGrams.toFixed(3)} g total) × 100% = ${massPercent.toFixed(3)}% w/w`
  );
  explanation.push(
    `Parts Per Million: (${soluteGrams.toFixed(4)} g ÷ ${solutionMassGrams.toFixed(3)} g total) × 10⁶ = ${ppm.toFixed(2)} ppm`
  );
  if (solventKg > 0) {
    explanation.push(
      `Molality (m = n / m_solvent): ${soluteMoles.toFixed(4)} mol ÷ ${solventKg.toFixed(4)} kg = ${molalityM.toFixed(4)} mol/kg`
    );
  }
  if (valence > 1) {
    explanation.push(
      `Normality (N = M × n_eq, where n_eq = ${valence}): ${molarityM.toFixed(4)} M × ${valence} = ${normalityN.toFixed(4)} N`
    );
  }

  return {
    soluteMolarMass: Number(molarMass.toFixed(4)),
    soluteMoles: Number(soluteMoles.toFixed(5)),
    soluteMassGrams: Number(soluteGrams.toFixed(4)),
    solutionVolumeLiters: Number(volumeLiters.toFixed(4)),
    solventMassKg: Number(solventKg.toFixed(4)),
    solutionMassGrams: Number(solutionMassGrams.toFixed(2)),
    molarityM: Number(molarityM.toFixed(4)),
    molarity: Number(molarityM.toFixed(4)),
    molalityM: Number(molalityM.toFixed(4)),
    massPercent: Number(massPercent.toFixed(4)),
    ppm: Number(ppm.toFixed(2)),
    ppb: Number(ppb.toFixed(1)),
    normalityN: Number(normalityN.toFixed(4)),
    massConcentrationGPerL: Number(massConcGPerL.toFixed(3)),
    isValid: true,
    errors: [],
    units: defaultUnits,
    explanation,
    assumptions,
  };
}
