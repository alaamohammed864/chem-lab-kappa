// Dilution Calculation Engine
// Computes stock aliquots, target final volumes, dilution factors, and diluent requirements via C1·V1 = C2·V2

export type ConcentrationUnit = 'M' | 'mM' | 'μM' | '%' | 'ppm';
export type VolumeUnit = 'mL' | 'L' | 'μL';

export interface DilutionInputs {
  c1?: number; // Stock concentration
  v1?: number; // Stock volume
  c2?: number; // Target concentration
  v2?: number; // Target volume
  concentrationUnit?: ConcentrationUnit;
  volumeUnit?: VolumeUnit;
  v1Unit?: VolumeUnit;
  v2Unit?: VolumeUnit;
}

export interface DilutionResult {
  c1: number;
  v1: number;
  c2: number;
  v2: number;
  diluentVolumeToAdd: number; // V2 - V1
  dilutionFactor: number;     // C1 / C2
  solvedVariable: 'c1' | 'v1' | 'c2' | 'v2';
  isValid: boolean;
  errors: string[];
  units: {
    concentration: ConcentrationUnit;
    volume: VolumeUnit;
    dilutionFactor: string;
  };
  explanation: string[];
  assumptions: string[];
  safetyGuidance: string;
}

export function computeDilutionEngine(inputs: DilutionInputs): DilutionResult {
  const cUnit = inputs.concentrationUnit || 'M';
  const vUnit = inputs.volumeUnit || 'mL';
  const errors: string[] = [];
  const explanation: string[] = [];
  const assumptions: string[] = [
    'Strict conservation of solute moles: n_initial = n_final (n = C · V).',
    'Ideal volumetric mixing: V_final ≈ V_stock + V_diluent.',
    'Isothermal mixing at ambient laboratory temperature (20°C - 25°C).',
  ];

  const safetyGuidance =
    'Educational Safety Protocol: When diluting concentrated strong acids (e.g. HCl, H2SO4, HNO3), ALWAYS add acid slowly into the water with continuous stirring (Acid into Water / AA). Never add water directly to concentrated acid, as extreme exothermic heat of hydration can cause instantaneous localized boiling and corrosive acid splattering.';

  const defaultUnits = {
    concentration: cUnit,
    volume: vUnit,
    dilutionFactor: 'ratio (x-fold)',
  };

  const emptyResult = (errs: string[], solved: 'c1' | 'v1' | 'c2' | 'v2' = 'v1'): DilutionResult => ({
    c1: inputs.c1 || 0,
    v1: inputs.v1 || 0,
    c2: inputs.c2 || 0,
    v2: inputs.v2 || 0,
    diluentVolumeToAdd: 0,
    dilutionFactor: 1,
    solvedVariable: solved,
    isValid: false,
    errors: errs,
    units: defaultUnits,
    explanation: errs,
    assumptions,
    safetyGuidance,
  });

  const { c1, v1, c2, v2 } = inputs;
  const provided = [
    { key: 'c1', val: c1 },
    { key: 'v1', val: v1 },
    { key: 'c2', val: c2 },
    { key: 'v2', val: v2 },
  ];

  const present = provided.filter((p) => p.val !== undefined && p.val !== null && !isNaN(p.val) && p.val > 0);
  const missing = provided.filter((p) => p.val === undefined || p.val === null || isNaN(p.val) || p.val <= 0);

  if (present.length < 3) {
    errors.push('Please provide at least 3 known values to solve for the 4th unknown in C₁V₁ = C₂V₂.');
    return emptyResult(errors);
  }

  let finalC1 = c1 || 0;
  let finalV1 = v1 || 0;
  let finalC2 = c2 || 0;
  let finalV2 = v2 || 0;
  let solvedKey: 'c1' | 'v1' | 'c2' | 'v2' = (missing[0]?.key as any) || 'v1';

  if (solvedKey === 'v1') {
    // V1 = (C2 * V2) / C1
    if (finalC1 <= 0) {
      errors.push('Stock concentration C₁ must be strictly positive.');
      return emptyResult(errors, 'v1');
    }
    if (finalC2 > finalC1) {
      errors.push(`Target concentration C₂ (${finalC2} ${cUnit}) cannot exceed stock concentration C₁ (${finalC1} ${cUnit}) in a dilution.`);
      return emptyResult(errors, 'v1');
    }
    finalV1 = (finalC2 * finalV2) / finalC1;
  } else if (solvedKey === 'c2') {
    // C2 = (C1 * V1) / V2
    if (finalV2 <= 0) {
      errors.push('Target volume V₂ must be strictly positive.');
      return emptyResult(errors, 'c2');
    }
    finalC2 = (finalC1 * finalV1) / finalV2;
  } else if (solvedKey === 'v2') {
    // V2 = (C1 * V1) / C2
    if (finalC2 <= 0) {
      errors.push('Target concentration C₂ must be strictly positive.');
      return emptyResult(errors, 'v2');
    }
    finalV2 = (finalC1 * finalV1) / finalC2;
  } else if (solvedKey === 'c1') {
    // C1 = (C2 * V2) / V1
    if (finalV1 <= 0) {
      errors.push('Stock volume V₁ must be strictly positive.');
      return emptyResult(errors, 'c1');
    }
    finalC1 = (finalC2 * finalV2) / finalV1;
  }

  // Check physical dilution constraints
  if (finalV2 < finalV1) {
    errors.push(`Target volume V₂ (${finalV2.toFixed(3)} ${vUnit}) cannot be smaller than stock aliquot volume V₁ (${finalV1.toFixed(3)} ${vUnit}) for a dilution.`);
    return emptyResult(errors, solvedKey);
  }

  const diluentToAdd = Math.max(0, finalV2 - finalV1);
  const dilutionFactor = finalC2 > 0 ? finalC1 / finalC2 : 1;

  explanation.push(`Fundamental Equation: C₁ · V₁ = C₂ · V₂`);
  explanation.push(`Stock Parameters: C₁ = ${finalC1.toFixed(4)} ${cUnit}, V₁ = ${finalV1.toFixed(3)} ${vUnit}`);
  explanation.push(`Target Parameters: C₂ = ${finalC2.toFixed(4)} ${cUnit}, V₂ = ${finalV2.toFixed(3)} ${vUnit}`);
  explanation.push(
    `Dilution Factor: DF = C₁ / C₂ = ${finalC1.toFixed(4)} / ${finalC2.toFixed(4)} = ${dilutionFactor.toFixed(2)}× (1:${dilutionFactor.toFixed(2)})`
  );
  explanation.push(
    `Procedure: Pipette exactly ${finalV1.toFixed(3)} ${vUnit} of stock solution into a volumetric vessel, then add ${diluentToAdd.toFixed(3)} ${vUnit} of solvent (e.g. deionized water) to reach the final volume of ${finalV2.toFixed(3)} ${vUnit}.`
  );

  return {
    c1: Number(finalC1.toFixed(4)),
    v1: Number(finalV1.toFixed(4)),
    c2: Number(finalC2.toFixed(4)),
    v2: Number(finalV2.toFixed(4)),
    diluentVolumeToAdd: Number(diluentToAdd.toFixed(4)),
    dilutionFactor: Number(dilutionFactor.toFixed(3)),
    solvedVariable: solvedKey,
    isValid: true,
    errors: [],
    units: defaultUnits,
    explanation,
    assumptions,
    safetyGuidance,
  };
}

export const calculateDilutionEngine = computeDilutionEngine;
