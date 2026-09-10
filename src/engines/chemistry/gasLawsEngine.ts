// Gas Laws Calculation Engine
// Supports Ideal Gas Law (PV=nRT), Combined Gas Law, Boyle's, Charles's, Gay-Lussac's, and Real Gas Van der Waals corrections

import { GAS_CONSTANTS, GAS_PROPERTIES_DATA } from '../../data/gasData';

export type GasLawType =
  | 'ideal_gas'
  | 'boyle'
  | 'charles'
  | 'gay_lussac'
  | 'combined'
  | 'van_der_waals';

export type PressureUnit = 'atm' | 'kPa' | 'bar' | 'mmHg' | 'psi';
export type GasVolumeUnit = 'L' | 'mL' | 'm3';
export type TempUnit = 'K' | 'C' | 'F';

export interface GasLawsInputs {
  lawType: GasLawType;
  // State 1 / Primary state variables
  pressure?: number;
  pressureUnit?: PressureUnit;
  volume?: number;
  volumeUnit?: GasVolumeUnit;
  moles?: number;
  temperature?: number;
  temperatureUnit?: TempUnit;
  // State 2 variables (for empirical laws)
  pressure2?: number;
  volume2?: number;
  temperature2?: number;
  // Solved target variable
  variableToSolve?: 'P' | 'V' | 'n' | 'T' | 'P2' | 'V2' | 'T2';
  // Selected real gas
  selectedGasFormula?: string;
  gasFormula?: string; // alias
  molarMass?: number;
  vanDerWaalsA?: number; // L²·bar/mol²
  vanDerWaalsB?: number; // L/mol
}

export interface GasLawsResult {
  lawType: GasLawType;
  solvedVariable: string;
  solvedValue: number;
  solvedUnit: string;
  // Normalized SI/Ideal values
  pressureAtm: number;
  volumeLiters: number;
  moles: number;
  temperatureKelvin: number;
  // Real gas & physical metrics
  gasDensityGPerL?: number;
  compressibilityFactorZ?: number;
  idealVsRealDifferencePercent?: number;
  isValid: boolean;
  errors: string[];
  units: {
    pressure: string;
    volume: string;
    moles: string;
    temperature: string;
    density: string;
  };
  explanation: string[];
  assumptions: string[];
}

export function computeGasLawsEngine(inputs: GasLawsInputs): GasLawsResult {
  const pUnit = inputs.pressureUnit || 'atm';
  const vUnit = inputs.volumeUnit || 'L';
  const tUnit = inputs.temperatureUnit || 'K';
  const errors: string[] = [];
  const explanation: string[] = [];

  const defaultUnits = {
    pressure: pUnit,
    volume: vUnit,
    moles: 'mol',
    temperature: tUnit,
    density: 'g/L',
  };

  const assumptions: string[] = [
    inputs.lawType === 'van_der_waals'
      ? 'Real gas behavior governed by Van der Waals equations of state accounting for molecular attraction and finite excluded volume.'
      : 'Ideal gas behavior assumed (point-mass particles, zero excluded volume, perfectly elastic collisions, negligible intermolecular forces).',
    'System is in macroscopic thermodynamic equilibrium.',
  ];

  const emptyResult = (errs: string[]): GasLawsResult => ({
    lawType: inputs.lawType,
    solvedVariable: inputs.variableToSolve || 'P',
    solvedValue: 0,
    solvedUnit: '',
    pressureAtm: 0,
    volumeLiters: 0,
    moles: 0,
    temperatureKelvin: 0,
    isValid: false,
    errors: errs,
    units: defaultUnits,
    explanation: errs,
    assumptions,
  });

  // Helper conversions to Atm, Liters, Kelvin
  const toAtm = (val: number, unit: PressureUnit): number => {
    switch (unit) {
      case 'atm': return val;
      case 'kPa': return val / 101.325;
      case 'bar': return val / 1.01325;
      case 'mmHg': return val / 760;
      case 'psi': return val / 14.6959;
    }
  };

  const fromAtm = (atm: number, unit: PressureUnit): number => {
    switch (unit) {
      case 'atm': return atm;
      case 'kPa': return atm * 101.325;
      case 'bar': return atm * 1.01325;
      case 'mmHg': return atm * 760;
      case 'psi': return atm * 14.6959;
    }
  };

  const toLiters = (val: number, unit: GasVolumeUnit): number => {
    switch (unit) {
      case 'L': return val;
      case 'mL': return val / 1000;
      case 'm3': return val * 1000;
    }
  };

  const fromLiters = (liters: number, unit: GasVolumeUnit): number => {
    switch (unit) {
      case 'L': return liters;
      case 'mL': return liters * 1000;
      case 'm3': return liters / 1000;
    }
  };

  const toKelvin = (val: number, unit: TempUnit): number => {
    switch (unit) {
      case 'K': return val;
      case 'C': return val + 273.15;
      case 'F': return ((val - 32) * 5) / 9 + 273.15;
    }
  };

  const fromKelvin = (k: number, unit: TempUnit): number => {
    switch (unit) {
      case 'K': return k;
      case 'C': return k - 273.15;
      case 'F': return ((k - 273.15) * 9) / 5 + 32;
    }
  };

  const R = GAS_CONSTANTS.R_L_ATM_MOL_K; // 0.082057366 L·atm / (mol·K)

  try {
    let solvedVal = 0;
    let solvedUnit = '';
    let solvedVar: string = inputs.variableToSolve || 'P';

    let pAtm = inputs.pressure !== undefined ? toAtm(inputs.pressure, pUnit) : 1;
    let vLit = inputs.volume !== undefined ? toLiters(inputs.volume, vUnit) : 1;
    let nMol = inputs.moles !== undefined ? inputs.moles : 1;
    let tKel = inputs.temperature !== undefined ? toKelvin(inputs.temperature, tUnit) : 298.15;

    // Check absolute zero
    if (tKel <= 0) {
      errors.push(`Temperature (${tKel.toFixed(2)} K) cannot be less than or equal to absolute zero (0 K).`);
      return emptyResult(errors);
    }

    if (inputs.lawType === 'ideal_gas') {
      switch (solvedVar) {
        case 'P':
          if (vLit <= 0 || nMol <= 0 || tKel <= 0) {
            errors.push('Volume, moles, and temperature must be strictly positive.');
            return emptyResult(errors);
          }
          pAtm = (nMol * R * tKel) / vLit;
          solvedVal = fromAtm(pAtm, pUnit);
          solvedUnit = pUnit;
          explanation.push(`Ideal Gas Formula: P = (n · R · T) / V`);
          explanation.push(
            `P = (${nMol} mol × 0.08206 L·atm/(mol·K) × ${tKel.toFixed(2)} K) ÷ ${vLit.toFixed(3)} L = ${pAtm.toFixed(4)} atm`
          );
          break;

        case 'V':
          if (pAtm <= 0 || nMol <= 0 || tKel <= 0) {
            errors.push('Pressure, moles, and temperature must be strictly positive.');
            return emptyResult(errors);
          }
          vLit = (nMol * R * tKel) / pAtm;
          solvedVal = fromLiters(vLit, vUnit);
          solvedUnit = vUnit;
          explanation.push(`Ideal Gas Formula: V = (n · R · T) / P`);
          explanation.push(
            `V = (${nMol} mol × 0.08206 L·atm/(mol·K) × ${tKel.toFixed(2)} K) ÷ ${pAtm.toFixed(4)} atm = ${vLit.toFixed(3)} L`
          );
          break;

        case 'n':
          if (pAtm <= 0 || vLit <= 0 || tKel <= 0) {
            errors.push('Pressure, volume, and temperature must be strictly positive.');
            return emptyResult(errors);
          }
          nMol = (pAtm * vLit) / (R * tKel);
          solvedVal = nMol;
          solvedUnit = 'mol';
          explanation.push(`Ideal Gas Formula: n = (P · V) / (R · T)`);
          explanation.push(
            `n = (${pAtm.toFixed(4)} atm × ${vLit.toFixed(3)} L) ÷ (0.08206 × ${tKel.toFixed(2)} K) = ${nMol.toFixed(4)} mol`
          );
          break;

        case 'T':
          if (pAtm <= 0 || vLit <= 0 || nMol <= 0) {
            errors.push('Pressure, volume, and moles must be strictly positive.');
            return emptyResult(errors);
          }
          tKel = (pAtm * vLit) / (nMol * R);
          solvedVal = fromKelvin(tKel, tUnit);
          solvedUnit = tUnit;
          explanation.push(`Ideal Gas Formula: T = (P · V) / (n · R)`);
          explanation.push(
            `T = (${pAtm.toFixed(4)} atm × ${vLit.toFixed(3)} L) ÷ (${nMol} mol × 0.08206) = ${tKel.toFixed(2)} K`
          );
          break;
      }
    } else if (inputs.lawType === 'boyle') {
      // P1 * V1 = P2 * V2
      solvedVar = inputs.variableToSolve === 'P2' ? 'P2' : 'V2';
      if (solvedVar === 'V2') {
        const p2Atm = inputs.pressure2 ? toAtm(inputs.pressure2, pUnit) : pAtm;
        if (p2Atm <= 0) {
          errors.push('P₂ must be strictly positive.');
          return emptyResult(errors);
        }
        const v2Lit = (pAtm * vLit) / p2Atm;
        solvedVal = fromLiters(v2Lit, vUnit);
        solvedUnit = vUnit;
        explanation.push(`Boyle's Law (Isothermal: T = const): P₁ · V₁ = P₂ · V₂`);
        explanation.push(`V₂ = (P₁ · V₁) / P₂ = (${pAtm.toFixed(3)} atm × ${vLit.toFixed(3)} L) / ${p2Atm.toFixed(3)} atm = ${v2Lit.toFixed(3)} L`);
      } else {
        const v2Lit = inputs.volume2 ? toLiters(inputs.volume2, vUnit) : vLit;
        if (v2Lit <= 0) {
          errors.push('V₂ must be strictly positive.');
          return emptyResult(errors);
        }
        const p2Atm = (pAtm * vLit) / v2Lit;
        solvedVal = fromAtm(p2Atm, pUnit);
        solvedUnit = pUnit;
        explanation.push(`Boyle's Law: P₂ = (P₁ · V₁) / V₂ = ${p2Atm.toFixed(3)} atm`);
      }
    } else if (inputs.lawType === 'charles') {
      // V1 / T1 = V2 / T2
      solvedVar = inputs.variableToSolve === 'T2' ? 'T2' : 'V2';
      if (solvedVar === 'V2') {
        const t2Kel = inputs.temperature2 ? toKelvin(inputs.temperature2, tUnit) : tKel;
        if (t2Kel <= 0 || tKel <= 0) {
          errors.push('Temperatures must be strictly above 0 K.');
          return emptyResult(errors);
        }
        const v2Lit = (vLit * t2Kel) / tKel;
        solvedVal = fromLiters(v2Lit, vUnit);
        solvedUnit = vUnit;
        explanation.push(`Charles's Law (Isobaric: P = const): V₁ / T₁ = V₂ / T₂`);
        explanation.push(`V₂ = V₁ · (T₂ / T₁) = ${vLit.toFixed(3)} L × (${t2Kel.toFixed(2)} K / ${tKel.toFixed(2)} K) = ${v2Lit.toFixed(3)} L`);
      } else {
        const v2Lit = inputs.volume2 ? toLiters(inputs.volume2, vUnit) : vLit;
        if (vLit <= 0 || tKel <= 0) {
          errors.push('V₁ and T₁ must be strictly positive.');
          return emptyResult(errors);
        }
        const t2Kel = (tKel * v2Lit) / vLit;
        solvedVal = fromKelvin(t2Kel, tUnit);
        solvedUnit = tUnit;
        explanation.push(`Charles's Law: T₂ = T₁ · (V₂ / V₁) = ${t2Kel.toFixed(2)} K`);
      }
    } else if (inputs.lawType === 'combined') {
      // (P1 * V1) / T1 = (P2 * V2) / T2
      const p2Atm = inputs.pressure2 ? toAtm(inputs.pressure2, pUnit) : pAtm;
      const t2Kel = inputs.temperature2 ? toKelvin(inputs.temperature2, tUnit) : tKel;
      if (p2Atm <= 0 || t2Kel <= 0 || tKel <= 0) {
        errors.push('P₂, T₂, and T₁ must be strictly positive.');
        return emptyResult(errors);
      }
      const v2Lit = (pAtm * vLit * t2Kel) / (tKel * p2Atm);
      solvedVal = fromLiters(v2Lit, vUnit);
      solvedUnit = vUnit;
      solvedVar = 'V2';
      explanation.push(`Combined Gas Law: (P₁ · V₁) / T₁ = (P₂ · V₂) / T₂`);
      explanation.push(`V₂ = (P₁ · V₁ · T₂) / (T₁ · P₂) = ${v2Lit.toFixed(3)} L`);
    } else if (inputs.lawType === 'van_der_waals') {
      // (P + a * n^2 / V^2) * (V - n * b) = n * R * T
      let a = inputs.vanDerWaalsA || 1.370; // e.g. N2 default
      let b = inputs.vanDerWaalsB || 0.0387;

      const gFormula = inputs.selectedGasFormula || inputs.gasFormula;
      if (gFormula) {
        const gProp = GAS_PROPERTIES_DATA.find((g) => g.formula.toLowerCase() === gFormula.toLowerCase());
        if (gProp) {
          a = gProp.a;
          b = gProp.b;
        }
      }

      // Convert a from L²·bar/mol² to L²·atm/mol² (1 bar = 0.986923 atm)
      const aAtm = a * 0.986923;
      const coVolume = nMol * b;

      if (vLit <= coVolume) {
        errors.push(`Volume (${vLit.toFixed(3)} L) cannot be smaller than the gas molecular co-volume n·b (${coVolume.toFixed(3)} L).`);
        return emptyResult(errors);
      }

      // Calculate Real Pressure P_real = [n·R·T / (V - n·b)] - [a·n² / V²]
      const term1 = (nMol * R * tKel) / (vLit - coVolume);
      const term2 = (aAtm * nMol * nMol) / (vLit * vLit);
      const realPAtm = term1 - term2;
      const idealPAtm = (nMol * R * tKel) / vLit;

      pAtm = realPAtm;
      solvedVal = fromAtm(realPAtm, pUnit);
      solvedUnit = pUnit;
      solvedVar = 'P (Real)';

      const diffPct = idealPAtm > 0 ? ((realPAtm - idealPAtm) / idealPAtm) * 100 : 0;
      explanation.push(`Van der Waals Real Gas Equation:`);
      explanation.push(`[P + a·(n/V)²] · [V - n·b] = n·R·T`);
      explanation.push(`Parameters: a = ${a.toFixed(3)} L²·bar/mol², b = ${b.toFixed(4)} L/mol`);
      explanation.push(`Real Pressure = ${realPAtm.toFixed(4)} atm (Ideal Gas = ${idealPAtm.toFixed(4)} atm, Deviation = ${diffPct.toFixed(2)}%)`);
    }

    // Physical secondary properties
    let gasDensity: number | undefined;
    let molMass = inputs.molarMass;
    if (!molMass && inputs.selectedGasFormula) {
      const gProp = GAS_PROPERTIES_DATA.find((g) => g.formula.toLowerCase() === inputs.selectedGasFormula?.toLowerCase());
      if (gProp) molMass = gProp.molarMass;
    }

    if (molMass && molMass > 0 && tKel > 0) {
      // Density rho = (P * M) / (R * T) in g/L
      gasDensity = (pAtm * molMass) / (R * tKel);
      explanation.push(`Gas Density (ρ = P·M / R·T): ${gasDensity.toFixed(3)} g/L at ${pAtm.toFixed(3)} atm and ${tKel.toFixed(1)} K`);
    }

    // Compressibility factor Z = (P · V) / (n · R · T)
    const zFactor = nMol > 0 && tKel > 0 ? (pAtm * vLit) / (nMol * R * tKel) : 1.0;

    return {
      lawType: inputs.lawType,
      solvedVariable: solvedVar,
      solvedValue: Number(solvedVal.toFixed(4)),
      solvedUnit,
      pressureAtm: Number(pAtm.toFixed(4)),
      volumeLiters: Number(vLit.toFixed(4)),
      moles: Number(nMol.toFixed(4)),
      temperatureKelvin: Number(tKel.toFixed(2)),
      gasDensityGPerL: gasDensity ? Number(gasDensity.toFixed(3)) : undefined,
      compressibilityFactorZ: Number(zFactor.toFixed(4)),
      isValid: true,
      errors: [],
      units: defaultUnits,
      explanation,
      assumptions,
    };
  } catch (err: any) {
    errors.push(err?.message || 'Error executing gas law calculation.');
    return emptyResult(errors);
  }
}

export const calculateGasLawsEngine = computeGasLawsEngine;
