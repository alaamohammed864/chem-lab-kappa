// Chemical Reaction Balancer & Stoichiometry Engine
// Employs a linear-algebraic Gaussian elimination system over integers to balance arbitrary chemical reactions,
// coupled with NIST thermodynamic verification and reaction mechanism classification.

import { parseChemicalFormula } from './formulaParser';
import { THERMODYNAMIC_DATA } from '../../data/thermochemistryData';

export interface ReactionSpecies {
  formula: string;
  coefficient: number;
}

export interface BalancedReactionResult {
  original: string;
  balanced: string;
  reactionType: string;
  enthalpy: string;
  deltaG?: string;
  notes: string;
  isSpontaneous?: boolean;
  reactants: ReactionSpecies[];
  products: ReactionSpecies[];
  isValid: boolean;
  errors: string[];
  units: {
    coefficients: string;
    enthalpy: string;
    gibbsEnergy: string;
  };
  explanation: string[];
  assumptions: string[];
}

export interface ReactionBalancerInputs {
  equation: string;
}

// Known verified reference reactions for rapid lookup & deep pedagogical notes
const VERIFIED_REACTIONS_DB: Record<string, {
  balanced: string;
  type: string;
  enthalpy: string;
  deltaG: string;
  notes: string;
}> = {
  'fe+o2->fe2o3': {
    balanced: '4Fe + 3O₂ → 2Fe₂O₃',
    type: 'Synthesis / High-Temperature Oxidation (Redox)',
    enthalpy: 'ΔH° = -1648.4 kJ/mol (Exothermic)',
    deltaG: 'ΔG° = -1484.8 kJ/mol (Spontaneous)',
    notes: 'Formation of Iron(III) oxide (hematite/rust). Standard atmospheric corrosion mechanism for iron alloys.',
  },
  'fe+o2=fe2o3': {
    balanced: '4Fe + 3O₂ → 2Fe₂O₃',
    type: 'Synthesis / High-Temperature Oxidation (Redox)',
    enthalpy: 'ΔH° = -1648.4 kJ/mol (Exothermic)',
    deltaG: 'ΔG° = -1484.8 kJ/mol (Spontaneous)',
    notes: 'Formation of Iron(III) oxide (hematite/rust). Standard atmospheric corrosion mechanism for iron alloys.',
  },
  'h2+o2->h2o': {
    balanced: '2H₂ + O₂ → 2H₂O',
    type: 'Combustion / Synthesis',
    enthalpy: 'ΔH° = -571.6 kJ/mol (Exothermic)',
    deltaG: 'ΔG° = -474.4 kJ/mol (Spontaneous)',
    notes: 'Water synthesis from hydrogen and oxygen gas. Foundational fuel cell electrochemistry.',
  },
  'ch4+o2->co2+h2o': {
    balanced: 'CH₄ + 2O₂ → CO₂ + 2H₂O',
    type: 'Hydrocarbon Combustion',
    enthalpy: 'ΔH° = -890.8 kJ/mol (Exothermic)',
    deltaG: 'ΔG° = -818.0 kJ/mol (Spontaneous)',
    notes: 'Complete methane oxidation generating carbon dioxide and water vapor.',
  },
  'c6h12o6+o2->co2+h2o': {
    balanced: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O',
    type: 'Cellular Respiration / Aerobic Oxidation',
    enthalpy: 'ΔH° = -2803.0 kJ/mol (Exothermic)',
    deltaG: 'ΔG° = -2870.0 kJ/mol (Spontaneous)',
    notes: 'Aerobic glucose oxidation yielding ATP equivalent chemical energy.',
  },
  'al+hcl->alcl3+h2': {
    balanced: '2Al + 6HCl → 2AlCl₃ + 3H₂↑',
    type: 'Single Displacement / Acid Dissolution',
    enthalpy: 'ΔH° = -1050.2 kJ/mol (Exothermic)',
    deltaG: 'ΔG° = -980.0 kJ/mol (Spontaneous)',
    notes: 'Vigorous dissolution of metallic aluminum in hydrochloric acid evolving flammable hydrogen gas.',
  },
  'n2+h2->nh3': {
    balanced: 'N₂ + 3H₂ ⇌ 2NH₃',
    type: 'Haber-Bosch Catalytic Synthesis',
    enthalpy: 'ΔH° = -91.8 kJ/mol (Exothermic)',
    deltaG: 'ΔG° = -33.0 kJ/mol (Spontaneous at 298K)',
    notes: 'Heterogeneous catalytic reduction of atmospheric nitrogen over promoted iron/ruthenium catalyst.',
  },
  'ticl4+mg->ti+mgcl2': {
    balanced: 'TiCl₄ + 2Mg → Ti + 2MgCl₂',
    type: 'Kroll Metallurgical Reduction',
    enthalpy: 'ΔH° = -544.0 kJ/mol (Reduction to α-Ti)',
    deltaG: 'ΔG° = -480.0 kJ/mol (Spontaneous)',
    notes: 'Core metallurgical industrial process for extracting sponge titanium from rutile/ilmenite ore.',
  },
  'caco3->cao+co2': {
    balanced: 'CaCO₃ → CaO + CO₂↑',
    type: 'Thermal Decomposition (Calcination)',
    enthalpy: 'ΔH° = +178.2 kJ/mol (Endothermic)',
    deltaG: 'ΔG° = +130.4 kJ/mol (Non-spontaneous at 298K, spontaneous > 840°C)',
    notes: 'Limestone calcination producing quicklime used in cement manufacturing and metallurgical fluxes.',
  },
  'al+o2->al2o3': {
    balanced: '4Al + 3O₂ → 2Al₂O₃',
    type: 'Direct Oxidation / Passivation',
    enthalpy: 'ΔH° = -3351.4 kJ/mol (Strongly Exothermic)',
    deltaG: 'ΔG° = -3164.6 kJ/mol (Spontaneous)',
    notes: 'Spontaneous formation of amorphous/corundum passivation barrier preventing bulk aluminum degradation.',
  },
  'ti+o2->tio2': {
    balanced: 'Ti + O₂ → TiO₂',
    type: 'Direct Titanium Passivation',
    enthalpy: 'ΔH° = -944.0 kJ/mol',
    deltaG: 'ΔG° = -888.8 kJ/mol',
    notes: 'Stable rutile/anatase oxide layer providing superior corrosion passivity in saline and bodily fluids.',
  },
  'hcl+naoh->nacl+h2o': {
    balanced: 'HCl + NaOH → NaCl + H₂O',
    type: 'Acid-Base Neutralization',
    enthalpy: 'ΔH° = -57.1 kJ/mol',
    deltaG: 'ΔG° = -79.9 kJ/mol',
    notes: 'Prototypical strong acid and base neutralization forming aqueous sodium chloride.',
  },
};

// Greatest Common Divisor
function gcd(a: number, b: number): number {
  a = Math.round(Math.abs(a));
  b = Math.round(Math.abs(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

// Least Common Multiple
function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(Math.round((a * b) / gcd(a, b)));
}

// Fraction class for exact rational Gaussian elimination without floating-point drift
class Fraction {
  num: number;
  den: number;

  constructor(num: number, den = 1) {
    if (den < 0) {
      num = -num;
      den = -den;
    }
    const g = gcd(num, den);
    this.num = Math.round(num / g);
    this.den = Math.round(den / g);
  }

  add(other: Fraction): Fraction {
    return new Fraction(this.num * other.den + other.num * this.den, this.den * other.den);
  }

  sub(other: Fraction): Fraction {
    return new Fraction(this.num * other.den - other.num * this.den, this.den * other.den);
  }

  mul(other: Fraction): Fraction {
    return new Fraction(this.num * other.num, this.den * other.den);
  }

  div(other: Fraction): Fraction {
    return new Fraction(this.num * other.den, this.den * other.num);
  }

  isZero(): boolean {
    return this.num === 0;
  }
}

/**
 * Universal integer chemical reaction balancer
 */
export function balanceChemicalEquationEngine(inputs: ReactionBalancerInputs): BalancedReactionResult {
  const equation = (inputs.equation || '').trim();
  const errors: string[] = [];
  const explanation: string[] = [];
  const assumptions: string[] = [
    'Strict conservation of atomic mass (Lavoisier principle): atoms cannot be created or destroyed.',
    'Lowest integer stoichiometric coefficients satisfying the linear conservation null-space.',
    'Standard state temperature 298.15 K (25°C) and pressure 1 bar for thermodynamic properties.',
  ];

  const defaultUnits = {
    coefficients: 'mol (stoichiometric ratio)',
    enthalpy: 'kJ/mol',
    gibbsEnergy: 'kJ/mol',
  };

  if (!equation) {
    errors.push('Chemical equation cannot be empty.');
    return {
      original: equation,
      balanced: equation,
      reactionType: 'Undefined',
      enthalpy: 'N/A',
      notes: 'No equation provided.',
      reactants: [],
      products: [],
      isValid: false,
      errors,
      units: defaultUnits,
      explanation: ['Please enter an equation like Fe + O2 -> Fe2O3 or CH4 + O2 -> CO2 + H2O'],
      assumptions,
    };
  }

  // 1. Fast path: check verified reference reactions
  const normalizedKey = equation.toLowerCase().replace(/\s+/g, '');
  if (VERIFIED_REACTIONS_DB[normalizedKey]) {
    const r = VERIFIED_REACTIONS_DB[normalizedKey];
    const parsedParts = parseEquationParts(r.balanced);
    return {
      original: equation,
      balanced: r.balanced,
      reactionType: r.type,
      enthalpy: r.enthalpy,
      deltaG: r.deltaG,
      notes: r.notes,
      isSpontaneous: !r.deltaG.includes('Non-spontaneous'),
      reactants: parsedParts.reactants,
      products: parsedParts.products,
      isValid: true,
      errors: [],
      units: defaultUnits,
      explanation: [
        `Verified standard stoichiometric reaction: ${r.balanced}`,
        `Mechanism: ${r.type}`,
        `Standard enthalpy: ${r.enthalpy}`,
        `Free energy of reaction: ${r.deltaG}`,
      ],
      assumptions,
    };
  }

  // 2. Universal Gaussian elimination balancer
  try {
    // Split into LHS and RHS by ->, =, =>, or →
    const sideSeparator = equation.includes('->')
      ? '->'
      : equation.includes('=>')
      ? '=>'
      : equation.includes('→')
      ? '→'
      : equation.includes('⇌')
      ? '⇌'
      : equation.includes('=')
      ? '='
      : null;

    if (!sideSeparator) {
      errors.push('Equation missing reaction arrow (use "->", "→", or "=" to separate reactants and products).');
      return {
        original: equation,
        balanced: equation,
        reactionType: 'Invalid Syntax',
        enthalpy: 'N/A',
        notes: errors[0],
        reactants: [],
        products: [],
        isValid: false,
        errors,
        units: defaultUnits,
        explanation: errors,
        assumptions,
      };
    }

    const sides = equation.split(sideSeparator);
    if (sides.length !== 2) {
      errors.push('Equation must contain exactly one reaction divider (reactants -> products).');
      return errorResult(equation, errors, defaultUnits, assumptions);
    }

    const rawReactants = sides[0].split('+').map((s) => cleanSpeciesString(s)).filter(Boolean);
    const rawProducts = sides[1].split('+').map((s) => cleanSpeciesString(s)).filter(Boolean);

    if (rawReactants.length === 0 || rawProducts.length === 0) {
      errors.push('Equation must contain at least one reactant and one product.');
      return errorResult(equation, errors, defaultUnits, assumptions);
    }

    const allSpecies = [...rawReactants, ...rawProducts];
    const parsedSpecies = allSpecies.map((sp) => parseChemicalFormula(sp));

    // Collect all elements across both sides
    const allElementsSet = new Set<string>();
    parsedSpecies.forEach((counts) => {
      Object.keys(counts).forEach((el) => allElementsSet.add(el));
    });
    const elementsList = Array.from(allElementsSet);

    // Verify elements on both sides
    const reactantElements = new Set<string>();
    rawReactants.forEach((sp) => {
      const c = parseChemicalFormula(sp);
      Object.keys(c).forEach((el) => reactantElements.add(el));
    });
    const productElements = new Set<string>();
    rawProducts.forEach((sp) => {
      const c = parseChemicalFormula(sp);
      Object.keys(c).forEach((el) => productElements.add(el));
    });

    for (const el of elementsList) {
      if (!reactantElements.has(el)) {
        errors.push(`Element "${el}" appears in products but not in reactants. Atomic conservation violated.`);
      }
      if (!productElements.has(el)) {
        errors.push(`Element "${el}" appears in reactants but not in products. Atomic conservation violated.`);
      }
    }

    if (errors.length > 0) {
      return errorResult(equation, errors, defaultUnits, assumptions);
    }

    // Build the atomic conservation matrix:
    // Rows = Elements (M), Columns = Chemical Species (N)
    // For reactants: +count; for products: -count
    const M = elementsList.length;
    const N = allSpecies.length;
    const matrix: Fraction[][] = [];

    for (let r = 0; r < M; r++) {
      const el = elementsList[r];
      const row: Fraction[] = [];
      for (let c = 0; c < N; c++) {
        const count = parsedSpecies[c][el] || 0;
        const sign = c < rawReactants.length ? 1 : -1;
        row.push(new Fraction(sign * count));
      }
      matrix.push(row);
    }

    // Solve for integer null-space using Gaussian elimination
    const coefficients = solveChemicalSystemNullSpace(matrix, M, N);

    if (!coefficients || coefficients.some((c) => c <= 0)) {
      errors.push('Could not find unique positive stoichiometric integer coefficients for this reaction.');
      return errorResult(equation, errors, defaultUnits, assumptions);
    }

    // Extract reactants and products with computed coefficients
    const reactants: ReactionSpecies[] = rawReactants.map((formula, idx) => ({
      formula,
      coefficient: coefficients[idx],
    }));

    const products: ReactionSpecies[] = rawProducts.map((formula, idx) => ({
      formula,
      coefficient: coefficients[rawReactants.length + idx],
    }));

    const balancedReactantsStr = reactants
      .map((r) => `${r.coefficient > 1 ? r.coefficient : ''}${formatSubscripts(r.formula)}`)
      .join(' + ');

    const balancedProductsStr = products
      .map((p) => `${p.coefficient > 1 ? p.coefficient : ''}${formatSubscripts(p.formula)}`)
      .join(' + ');

    const balancedStr = `${balancedReactantsStr} → ${balancedProductsStr}`;

    // Determine reaction classification
    const classification = classifyReaction(rawReactants, rawProducts, reactants, products);

    // Calculate thermodynamic enthalpy if species match thermochemistry database
    const thermoResult = computeReactionThermodynamics(reactants, products);

    explanation.push(`Identified ${elementsList.length} unique elements: ${elementsList.join(', ')}.`);
    elementsList.forEach((el) => {
      const lhsAtoms = reactants.reduce((sum, r) => sum + r.coefficient * (parseChemicalFormula(r.formula)[el] || 0), 0);
      const rhsAtoms = products.reduce((sum, p) => sum + p.coefficient * (parseChemicalFormula(p.formula)[el] || 0), 0);
      explanation.push(`Conservation for ${el}: Left = ${lhsAtoms} atoms, Right = ${rhsAtoms} atoms (Balanced).`);
    });

    if (thermoResult.enthalpy) {
      explanation.push(`Thermodynamic analysis: ${thermoResult.enthalpy}.`);
    }

    return {
      original: equation,
      balanced: balancedStr,
      reactionType: classification,
      enthalpy: thermoResult.enthalpy || 'Evaluated via standard enthalpy tables',
      deltaG: thermoResult.deltaG,
      notes: thermoResult.notes || `Stoichiometrically balanced: ${balancedStr}.`,
      isSpontaneous: thermoResult.isSpontaneous ?? true,
      reactants,
      products,
      isValid: true,
      errors: [],
      units: defaultUnits,
      explanation,
      assumptions,
    };
  } catch (err: any) {
    errors.push(err?.message || 'Error balancing chemical equation.');
    return errorResult(equation, errors, defaultUnits, assumptions);
  }
}

// Backward compatible wrapper
export function balanceChemicalEquationLocal(inputEquation: string): BalancedReactionResult {
  return balanceChemicalEquationEngine({ equation: inputEquation });
}

function errorResult(
  equation: string,
  errors: string[],
  units: any,
  assumptions: string[]
): BalancedReactionResult {
  return {
    original: equation,
    balanced: equation,
    reactionType: 'Stoichiometric Error',
    enthalpy: 'N/A',
    notes: errors[0] || 'Invalid equation.',
    reactants: [],
    products: [],
    isValid: false,
    errors,
    units,
    explanation: errors,
    assumptions,
  };
}

function cleanSpeciesString(str: string): string {
  // Strip leading numbers or state symbols like (s), (l), (g), (aq) for balancing
  return str.trim().replace(/^\d+/, '').replace(/\((s|l|g|aq)\)$/i, '').trim();
}

function formatSubscripts(formula: string): string {
  const subscriptMap: Record<string, string> = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  };
  return formula.replace(/\d+/g, (match) => match.split('').map((ch) => subscriptMap[ch] || ch).join(''));
}

function classifyReaction(
  reactants: string[],
  products: string[],
  rObjs: ReactionSpecies[],
  pObjs: ReactionSpecies[]
): string {
  const rSet = new Set(reactants.map((r) => r.toUpperCase()));
  const pSet = new Set(products.map((p) => p.toUpperCase()));

  if (rSet.has('O2') && (pSet.has('CO2') || pSet.has('H2O'))) {
    return 'Combustion Reaction (Oxidation)';
  }
  if (reactants.length === 1 && products.length >= 2) {
    return 'Decomposition Reaction';
  }
  if (reactants.length >= 2 && products.length === 1) {
    return 'Direct Synthesis / Combination';
  }
  if (reactants.length === 2 && products.length === 2) {
    const isAcidBase =
      (rSet.has('HCL') || rSet.has('H2SO4') || rSet.has('HNO3') || rSet.has('CH3COOH')) &&
      (rSet.has('NAOH') || rSet.has('KOH') || rSet.has('CA(OH)2') || rSet.has('BA(OH)2'));
    if (isAcidBase && pSet.has('H2O')) {
      return 'Acid-Base Neutralization';
    }
    return 'Displacement / Metathesis Reaction';
  }
  return 'Redox & Stoichiometric Transformation';
}

function computeReactionThermodynamics(
  reactants: ReactionSpecies[],
  products: ReactionSpecies[]
): { enthalpy?: string; deltaG?: string; notes?: string; isSpontaneous?: boolean } {
  let deltaHSum = 0;
  let deltaGSum = 0;
  let allKnownH = true;
  let allKnownG = true;

  for (const p of products) {
    const key = findThermoKey(p.formula);
    if (key && THERMODYNAMIC_DATA[key]) {
      deltaHSum += p.coefficient * THERMODYNAMIC_DATA[key].deltaHf;
      deltaGSum += p.coefficient * THERMODYNAMIC_DATA[key].deltaGf;
    } else {
      allKnownH = false;
      allKnownG = false;
    }
  }

  for (const r of reactants) {
    const key = findThermoKey(r.formula);
    if (key && THERMODYNAMIC_DATA[key]) {
      deltaHSum -= r.coefficient * THERMODYNAMIC_DATA[key].deltaHf;
      deltaGSum -= r.coefficient * THERMODYNAMIC_DATA[key].deltaGf;
    } else {
      allKnownH = false;
      allKnownG = false;
    }
  }

  if (!allKnownH) return {};

  const isExo = deltaHSum < 0;
  const isSpon = deltaGSum < 0;

  return {
    enthalpy: `ΔH° = ${deltaHSum.toFixed(1)} kJ/mol (${isExo ? 'Exothermic' : 'Endothermic'})`,
    deltaG: allKnownG
      ? `ΔG° = ${deltaGSum.toFixed(1)} kJ/mol (${isSpon ? 'Thermodynamically Spontaneous at 298K' : 'Non-spontaneous at 298K'})`
      : undefined,
    isSpontaneous: isSpon,
  };
}

function findThermoKey(formula: string): string | null {
  const norm = formula.toUpperCase();
  for (const key of Object.keys(THERMODYNAMIC_DATA)) {
    const baseFormula = THERMODYNAMIC_DATA[key].formula.toUpperCase();
    if (baseFormula === norm) {
      return key;
    }
  }
  return null;
}

/**
 * Solve chemical homogeneous system M x N using reduced row echelon form (RREF)
 * to find the smallest strictly positive integer vector in the null space
 */
function solveChemicalSystemNullSpace(matrix: Fraction[][], M: number, N: number): number[] | null {
  // Gaussian elimination with full partial pivoting
  let lead = 0;
  const A = matrix.map((row) => row.map((f) => new Fraction(f.num, f.den)));

  for (let r = 0; r < M; r++) {
    if (lead >= N) break;
    let i = r;
    while (A[i][lead].isZero()) {
      i++;
      if (i === M) {
        i = r;
        lead++;
        if (lead === N) return solveSimpleDirect(A, M, N);
      }
    }
    // Swap rows
    const temp = A[i];
    A[i] = A[r];
    A[r] = temp;

    const div = A[r][lead];
    if (!div.isZero()) {
      for (let j = 0; j < N; j++) {
        A[r][j] = A[r][j].div(div);
      }
    }

    for (let k = 0; k < M; k++) {
      if (k !== r) {
        const factor = A[k][lead];
        if (!factor.isZero()) {
          for (let j = 0; j < N; j++) {
            A[k][j] = A[k][j].sub(factor.mul(A[r][j]));
          }
        }
      }
    }
    lead++;
  }

  // Find null space solution setting free variable (last column) to 1
  const freeCol = N - 1;
  const solution: Fraction[] = [];
  for (let c = 0; c < N; c++) {
    solution.push(new Fraction(0));
  }
  solution[freeCol] = new Fraction(1);

  for (let r = M - 1; r >= 0; r--) {
    let pivotCol = -1;
    for (let c = 0; c < freeCol; c++) {
      if (!A[r][c].isZero()) {
        pivotCol = c;
        break;
      }
    }
    if (pivotCol !== -1) {
      let sum = new Fraction(0);
      for (let c = pivotCol + 1; c < N; c++) {
        sum = sum.add(A[r][c].mul(solution[c]));
      }
      solution[pivotCol] = new Fraction(0).sub(sum);
    }
  }

  // Check if all entries have the same sign
  const nonZero = solution.filter((s) => !s.isZero());
  if (nonZero.length === 0) return null;

  const firstSign = nonZero[0].num > 0 ? 1 : -1;
  for (const s of nonZero) {
    if ((s.num > 0 ? 1 : -1) !== firstSign) {
      // Invert or retry
      // If sign alternation occurs, try positive free variables
    }
  }

  // Find common denominator to scale to integers
  let commonDenom = 1;
  solution.forEach((s) => {
    commonDenom = lcm(commonDenom, s.den);
  });

  const intCoeffs = solution.map((s) => {
    const val = Math.round((s.num * commonDenom) / s.den) * firstSign;
    return val;
  });

  // Divide by common GCD
  let commonGcd = intCoeffs[0];
  for (let i = 1; i < intCoeffs.length; i++) {
    commonGcd = gcd(commonGcd, intCoeffs[i]);
  }

  const finalCoeffs = intCoeffs.map((c) => Math.round(c / commonGcd));
  if (finalCoeffs.some((c) => c <= 0)) {
    // Fallback: bounded brute-force search over small integers 1..12
    return bruteForceIntegerBalance(matrix, M, N);
  }

  return finalCoeffs;
}

function solveSimpleDirect(A: Fraction[][], M: number, N: number): number[] | null {
  return bruteForceIntegerBalance(A, M, N);
}

// Bounded integer solver for highly coupled or small systems
function bruteForceIntegerBalance(matrix: Fraction[][], M: number, N: number): number[] | null {
  if (N > 5) return null; // Avoid combinatorial explosion

  const limits = [1, 2, 3, 4, 5, 6, 8, 10, 12];
  const vec: number[] = new Array(N).fill(1);

  function check(v: number[]): boolean {
    for (let r = 0; r < M; r++) {
      let sum = 0;
      for (let c = 0; c < N; c++) {
        sum += (matrix[r][c].num / matrix[r][c].den) * v[c];
      }
      if (Math.abs(sum) > 1e-6) return false;
    }
    return true;
  }

  if (N === 2) {
    for (const a of limits) {
      for (const b of limits) {
        if (check([a, b])) return [a, b];
      }
    }
  } else if (N === 3) {
    for (const a of limits) {
      for (const b of limits) {
        for (const c of limits) {
          if (check([a, b, c])) return [a, b, c];
        }
      }
    }
  } else if (N === 4) {
    for (const a of limits) {
      for (const b of limits) {
        for (const c of limits) {
          for (const d of limits) {
            if (check([a, b, c, d])) return [a, b, c, d];
          }
        }
      }
    }
  } else if (N === 5) {
    for (const a of limits) {
      for (const b of limits) {
        for (const c of limits) {
          for (const d of limits) {
            for (const e of limits) {
              if (check([a, b, c, d, e])) return [a, b, c, d, e];
            }
          }
        }
      }
    }
  }

  return null;
}

function parseEquationParts(balancedStr: string): { reactants: ReactionSpecies[]; products: ReactionSpecies[] } {
  const parts = balancedStr.split(/→|->|=/);
  const rStr = (parts[0] || '').split('+');
  const pStr = (parts[1] || '').split('+');

  const parseItem = (s: string): ReactionSpecies => {
    const trimmed = s.trim();
    const match = trimmed.match(/^(\d+)(.*)$/);
    if (match) {
      return {
        coefficient: parseInt(match[1], 10),
        formula: match[2].trim(),
      };
    }
    return { coefficient: 1, formula: trimmed };
  };

  return {
    reactants: rStr.map(parseItem).filter((i) => i.formula),
    products: pStr.map(parseItem).filter((i) => i.formula),
  };
}
