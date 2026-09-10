// Acid-Base & pH Calculation Engine
// Computes pH, pOH, [H+], [OH-], degree of ionization, and buffer equilibria with exact quadratic equilibrium solutions

export type SolutionCategory =
  | 'strong_acid'
  | 'strong_base'
  | 'weak_acid'
  | 'weak_base'
  | 'buffer'
  | 'direct_ion';

export interface PHInputs {
  category: SolutionCategory;
  concentrationM?: number;    // Molarity (mol/L)
  protonsOrHydroxides?: number; // e.g. 1 for HCl, 2 for H2SO4 or Ca(OH)2
  ka?: number;                 // Acid dissociation constant (for weak acids)
  pka?: number;                // -log10(Ka)
  kb?: number;                 // Base dissociation constant (for weak bases)
  pkb?: number;                // -log10(Kb)
  acidConcentrationM?: number; // [HA] for buffer
  conjugateBaseConcentrationM?: number; // [A-] for buffer
  directHPlusConcentrationM?: number; // [H+]
  directOHMinusConcentrationM?: number; // [OH-]
  temperatureC?: number;       // Defaults to 25°C
}

export interface PHResult {
  category: SolutionCategory;
  ph: number;
  poh: number;
  hPlusM: number;
  ohMinusM: number;
  ionizationDegreePercent?: number; // alpha
  kw: number;
  classification: string;
  isValid: boolean;
  errors: string[];
  units: {
    ph: string;
    poh: string;
    concentrations: string;
    ionization: string;
  };
  explanation: string[];
  assumptions: string[];
}

export const COMMON_ACID_BASE_CONSTANTS = [
  { name: 'Hydrochloric Acid (HCl)', type: 'strong_acid', pka: -6.3 },
  { name: 'Nitric Acid (HNO3)', type: 'strong_acid', pka: -1.4 },
  { name: 'Sulfuric Acid (H2SO4, 1st proton)', type: 'strong_acid', pka: -3.0 },
  { name: 'Acetic Acid (CH3COOH)', type: 'weak_acid', ka: 1.75e-5, pka: 4.757 },
  { name: 'Formic Acid (HCOOH)', type: 'weak_acid', ka: 1.78e-4, pka: 3.75 },
  { name: 'Hydrofluoric Acid (HF)', type: 'weak_acid', ka: 6.6e-4, pka: 3.18 },
  { name: 'Benzoic Acid (C6H5COOH)', type: 'weak_acid', ka: 6.3e-5, pka: 4.20 },
  { name: 'Carbonic Acid (H2CO3, 1st proton)', type: 'weak_acid', ka: 4.3e-7, pka: 6.37 },
  { name: 'Ammonia (NH3 / NH4+)', type: 'weak_base', kb: 1.77e-5, pkb: 4.752 },
  { name: 'Methylamine (CH3NH2)', type: 'weak_base', kb: 4.4e-4, pkb: 3.36 },
  { name: 'Pyridine (C5H5N)', type: 'weak_base', kb: 1.7e-9, pkb: 8.77 },
];

export function computePHEngine(inputs: PHInputs): PHResult {
  const errors: string[] = [];
  const explanation: string[] = [];
  const tempC = inputs.temperatureC !== undefined ? inputs.temperatureC : 25;
  // Standard Kw at 25°C = 1.0e-14
  const kw = 1.0e-14;

  const assumptions: string[] = [
    `Aqueous solution at temperature T = ${tempC}°C (standard autoionization constant Kw = 1.00 × 10⁻¹⁴).`,
    'Activity coefficients assumed γ ≈ 1.00 for dilute solutions (activity approximated by molar concentration).',
    'Solvent auto-ionization water contribution accounted for where concentration approaches ~10⁻⁷ M.',
  ];

  const defaultUnits = {
    ph: 'pH scale (0-14)',
    poh: 'pOH scale (0-14)',
    concentrations: 'mol/L (M)',
    ionization: '%',
  };

  const emptyResult = (errs: string[]): PHResult => ({
    category: inputs.category,
    ph: 7.0,
    poh: 7.0,
    hPlusM: 1e-7,
    ohMinusM: 1e-7,
    kw,
    classification: 'Neutral',
    isValid: false,
    errors: errs,
    units: defaultUnits,
    explanation: errs,
    assumptions,
  });

  let hPlus = 1e-7;
  let ohMinus = 1e-7;
  let ionizationDegree: number | undefined;

  try {
    switch (inputs.category) {
      case 'strong_acid': {
        const C = inputs.concentrationM || 0;
        if (C <= 0) {
          errors.push('Acid concentration must be strictly positive.');
          return emptyResult(errors);
        }
        const z = inputs.protonsOrHydroxides || 1;
        // [H+] = z * C (with water background if very dilute)
        const acidH = z * C;
        // Exact solution quadratic considering water autoionization: [H+]² - acidH[H+] - Kw = 0
        hPlus = (acidH + Math.sqrt(acidH * acidH + 4 * kw)) / 2;
        ohMinus = kw / hPlus;
        ionizationDegree = 100.0;

        explanation.push(`Strong Acid completely dissociates in water: HA → H⁺ + A⁻`);
        explanation.push(`Protic factor z = ${z}, Stoichiometric [H⁺] from acid = ${acidH.toExponential(3)} M`);
        explanation.push(`Total [H⁺] (including solvent equilibrium) = ${hPlus.toExponential(4)} M`);
        break;
      }

      case 'strong_base': {
        const C = inputs.concentrationM || 0;
        if (C <= 0) {
          errors.push('Base concentration must be strictly positive.');
          return emptyResult(errors);
        }
        const z = inputs.protonsOrHydroxides || 1;
        const baseOH = z * C;
        ohMinus = (baseOH + Math.sqrt(baseOH * baseOH + 4 * kw)) / 2;
        hPlus = kw / ohMinus;
        ionizationDegree = 100.0;

        explanation.push(`Strong Base completely dissociates: B(OH)z → Bᶻ⁺ + z OH⁻`);
        explanation.push(`Total [OH⁻] = ${ohMinus.toExponential(4)} M`);
        break;
      }

      case 'weak_acid': {
        const C = inputs.concentrationM || 0;
        if (C <= 0) {
          errors.push('Weak acid concentration must be strictly positive.');
          return emptyResult(errors);
        }
        let ka = inputs.ka;
        if ((!ka || ka <= 0) && inputs.pka !== undefined) {
          ka = Math.pow(10, -inputs.pka);
        }
        if (!ka || ka <= 0) {
          errors.push('Acid dissociation constant Ka (or pKa) must be specified.');
          return emptyResult(errors);
        }

        // Exact equilibrium quadratic: Ka = x² / (C - x) => x² + Ka·x - Ka·C = 0
        // Quadratic formula: x = (-Ka + sqrt(Ka² + 4·Ka·C)) / 2
        const disc = ka * ka + 4 * ka * C;
        const x = (-ka + Math.sqrt(disc)) / 2;
        hPlus = Math.max(1e-7, x);
        ohMinus = kw / hPlus;
        ionizationDegree = (hPlus / C) * 100;

        explanation.push(`Weak Acid Partial Dissociation: HA ⇌ H⁺ + A⁻`);
        explanation.push(`Equilibrium Expression: Ka = [H⁺][A⁻] / [HA] = ${ka.toExponential(3)} (pKa = ${(-Math.log10(ka)).toFixed(2)})`);
        explanation.push(`Exact Quadratic Solution: x² + Ka·x - Ka·C = 0 → [H⁺] = ${hPlus.toExponential(4)} M`);
        explanation.push(`Degree of Ionization (α): (${hPlus.toExponential(3)} / ${C.toFixed(3)}) × 100% = ${ionizationDegree.toFixed(2)}%`);
        break;
      }

      case 'weak_base': {
        const C = inputs.concentrationM || 0;
        if (C <= 0) {
          errors.push('Weak base concentration must be strictly positive.');
          return emptyResult(errors);
        }
        let kb = inputs.kb;
        if ((!kb || kb <= 0) && inputs.pkb !== undefined) {
          kb = Math.pow(10, -inputs.pkb);
        }
        if (!kb || kb <= 0) {
          errors.push('Base dissociation constant Kb (or pKb) must be specified.');
          return emptyResult(errors);
        }

        const disc = kb * kb + 4 * kb * C;
        const x = (-kb + Math.sqrt(disc)) / 2;
        ohMinus = Math.max(1e-7, x);
        hPlus = kw / ohMinus;
        ionizationDegree = (ohMinus / C) * 100;

        explanation.push(`Weak Base Hydrolysis: B + H₂O ⇌ BH⁺ + OH⁻`);
        explanation.push(`Equilibrium Constant: Kb = ${kb.toExponential(3)} (pKb = ${(-Math.log10(kb)).toFixed(2)})`);
        explanation.push(`Exact Quadratic Solution: [OH⁻] = ${ohMinus.toExponential(4)} M`);
        explanation.push(`Degree of Protonation (α): (${ohMinus.toExponential(3)} / ${C.toFixed(3)}) × 100% = ${ionizationDegree.toFixed(2)}%`);
        break;
      }

      case 'buffer': {
        const ha = inputs.acidConcentrationM || 0;
        const aMinus = inputs.conjugateBaseConcentrationM || 0;
        if (ha <= 0 || aMinus <= 0) {
          errors.push('Both weak acid [HA] and conjugate base [A⁻] must have positive concentrations for a buffer.');
          return emptyResult(errors);
        }
        let pka = inputs.pka;
        if (pka === undefined && inputs.ka && inputs.ka > 0) {
          pka = -Math.log10(inputs.ka);
        }
        if (pka === undefined) {
          errors.push('pKa (or Ka) is required for buffer calculations.');
          return emptyResult(errors);
        }

        // Henderson-Hasselbalch equation: pH = pKa + log10([A-] / [HA])
        const phVal = pka + Math.log10(aMinus / ha);
        hPlus = Math.pow(10, -phVal);
        ohMinus = kw / hPlus;

        explanation.push(`Henderson-Hasselbalch Buffer Equation:`);
        explanation.push(`pH = pKa + log₁₀([A⁻] / [HA])`);
        explanation.push(`pH = ${pka.toFixed(3)} + log₁₀(${aMinus.toFixed(3)} / ${ha.toFixed(3)}) = ${phVal.toFixed(3)}`);
        break;
      }

      case 'direct_ion': {
        if (inputs.directHPlusConcentrationM && inputs.directHPlusConcentrationM > 0) {
          hPlus = inputs.directHPlusConcentrationM;
          ohMinus = kw / hPlus;
        } else if (inputs.directOHMinusConcentrationM && inputs.directOHMinusConcentrationM > 0) {
          ohMinus = inputs.directOHMinusConcentrationM;
          hPlus = kw / ohMinus;
        } else {
          errors.push('Either [H⁺] or [OH⁻] molar concentration must be provided.');
          return emptyResult(errors);
        }
        explanation.push(`Direct Ionic Calculation: [H⁺] = ${hPlus.toExponential(4)} M, [OH⁻] = ${ohMinus.toExponential(4)} M`);
        break;
      }
    }

    const ph = -Math.log10(hPlus);
    const poh = 14.0 - ph;

    let classification = 'Neutral';
    if (ph < 2.0) classification = 'Strongly Acidic';
    else if (ph < 6.5) classification = 'Weakly / Moderately Acidic';
    else if (ph >= 6.5 && ph <= 7.5) classification = 'Neutral';
    else if (ph <= 12.0) classification = 'Weakly / Moderately Basic';
    else classification = 'Strongly Alkaline';

    explanation.push(`pH = -log₁₀[H⁺] = ${ph.toFixed(3)}`);
    explanation.push(`pOH = -log₁₀[OH⁻] = 14.00 - pH = ${poh.toFixed(3)}`);
    explanation.push(`Classification: ${classification}`);

    return {
      category: inputs.category,
      ph: Number(ph.toFixed(3)),
      poh: Number(poh.toFixed(3)),
      hPlusM: hPlus,
      ohMinusM: ohMinus,
      ionizationDegreePercent: ionizationDegree !== undefined ? Number(ionizationDegree.toFixed(3)) : undefined,
      kw,
      classification,
      isValid: true,
      errors: [],
      units: defaultUnits,
      explanation,
      assumptions,
    };
  } catch (err: any) {
    errors.push(err?.message || 'Error calculating pH.');
    return emptyResult(errors);
  }
}

export const calculatePHEngine = computePHEngine;
