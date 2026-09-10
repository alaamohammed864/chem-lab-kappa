// Molar Mass & Stoichiometry Engine
// Computes molecular weights, Hill notation formulas, and elemental mass fractions using standard IUPAC atomic masses

import { ELEMENTS_DATA } from '../../data/elements';
import { parseChemicalFormula } from './formulaParser';

const ELEMENT_MASS_MAP: Record<string, number> = {};
for (const el of ELEMENTS_DATA) {
  ELEMENT_MASS_MAP[el.symbol] = el.atomicMass;
}

export interface ElementBreakdown {
  symbol: string;
  name: string;
  count: number;
  atomicMass: number;
  totalMass: number;
  percentage: number;
}

export interface MolarMassInputs {
  formula: string;
}

export interface MolarMassResult {
  formula: string;
  totalMolarMass: number;
  elements: ElementBreakdown[];
  totalAtoms: number;
  hillFormula: string;
  isValid: boolean;
  error?: string;
  errors: string[];
  units: {
    totalMolarMass: string;
    atomicMass: string;
    percentage: string;
  };
  explanation: string[];
  assumptions: string[];
}

export function computeMolarMassEngine(inputs: MolarMassInputs): MolarMassResult {
  const formula = (inputs.formula || '').trim();
  const errors: string[] = [];
  const explanation: string[] = [];
  const assumptions: string[] = [
    'Standard terrestrial isotopic abundances as defined by IUPAC CIAAW.',
    'Atmospheric pressure at standard temperature; no non-stoichiometric lattice defects assumed.',
  ];

  const defaultUnits = {
    totalMolarMass: 'g/mol',
    atomicMass: 'g/mol',
    percentage: '%',
  };

  if (!formula) {
    errors.push('Chemical formula cannot be empty.');
    return {
      formula,
      totalMolarMass: 0,
      elements: [],
      totalAtoms: 0,
      hillFormula: '',
      isValid: false,
      error: errors[0],
      errors,
      units: defaultUnits,
      explanation: ['No formula provided for calculation.'],
      assumptions,
    };
  }

  try {
    const counts = parseChemicalFormula(formula);
    const symbols = Object.keys(counts);

    if (symbols.length === 0) {
      errors.push(`Invalid chemical formula "${formula}". Please check element symbols and syntax.`);
      return {
        formula,
        totalMolarMass: 0,
        elements: [],
        totalAtoms: 0,
        hillFormula: '',
        isValid: false,
        error: errors[0],
        errors,
        units: defaultUnits,
        explanation: ['Unable to tokenize elements from formula.'],
        assumptions,
      };
    }

    let totalMolarMass = 0;
    let totalAtoms = 0;
    const elements: ElementBreakdown[] = [];

    for (const sym of symbols) {
      const mass = ELEMENT_MASS_MAP[sym];
      if (!mass) {
        errors.push(`Unrecognized chemical symbol "${sym}".`);
        return {
          formula,
          totalMolarMass: 0,
          elements: [],
          totalAtoms: 0,
          hillFormula: '',
          isValid: false,
          error: errors[0],
          errors,
          units: defaultUnits,
          explanation: [`Element symbol "${sym}" does not exist on the periodic table.`],
          assumptions,
        };
      }

      const count = counts[sym];
      const totalMass = count * mass;
      totalMolarMass += totalMass;
      totalAtoms += count;

      const elObj = ELEMENTS_DATA.find((e) => e.symbol === sym);
      elements.push({
        symbol: sym,
        name: elObj?.name || sym,
        count,
        atomicMass: mass,
        totalMass,
        percentage: 0,
      });
    }

    // Calculate percentages
    for (const el of elements) {
      el.percentage = totalMolarMass > 0 ? (el.totalMass / totalMolarMass) * 100 : 0;
      explanation.push(
        `${el.name} (${el.symbol}): ${el.count} atom(s) × ${el.atomicMass.toFixed(3)} g/mol = ${el.totalMass.toFixed(3)} g/mol (${el.percentage.toFixed(2)}% by mass)`
      );
    }

    // Sort by mass percentage descending
    elements.sort((a, b) => b.percentage - a.percentage);

    // Generate Hill notation (C first, H second, then alphabetical)
    const hillSortedSymbols = [...symbols].sort((a, b) => {
      if (symbols.includes('C')) {
        if (a === 'C') return -1;
        if (b === 'C') return 1;
        if (a === 'H') return -1;
        if (b === 'H') return 1;
      }
      return a.localeCompare(b);
    });

    const hillFormula = hillSortedSymbols
      .map((sym) => `${sym}${counts[sym] > 1 ? counts[sym] : ''}`)
      .join('');

    explanation.unshift(
      `Formula contains ${symbols.length} unique elements with a total of ${totalAtoms} atoms per formula unit.`
    );
    explanation.push(
      `Sum total molecular mass = ${totalMolarMass.toFixed(3)} g/mol (Hill notation: ${hillFormula}).`
    );

    return {
      formula,
      totalMolarMass: Number(totalMolarMass.toFixed(4)),
      elements,
      totalAtoms,
      hillFormula,
      isValid: true,
      errors: [],
      units: defaultUnits,
      explanation,
      assumptions,
    };
  } catch (err: any) {
    const msg = err?.message || 'Error parsing chemical formula';
    errors.push(msg);
    return {
      formula,
      totalMolarMass: 0,
      elements: [],
      totalAtoms: 0,
      hillFormula: '',
      isValid: false,
      error: msg,
      errors,
      units: defaultUnits,
      explanation: [`Computation halted due to syntax exception: ${msg}`],
      assumptions,
    };
  }
}

// Backward-compatible wrapper
export function calculateMolarMass(formula: string): MolarMassResult {
  return computeMolarMassEngine({ formula });
}

export function calculateMolesFromMass(massGrams: number, molarMass: number): number {
  if (molarMass <= 0 || massGrams < 0) return 0;
  return massGrams / molarMass;
}

export function calculateMassFromMoles(moles: number, molarMass: number): number {
  if (molarMass <= 0 || moles < 0) return 0;
  return moles * molarMass;
}

export function calculateMolarity(moles: number, volumeLiters: number): number {
  if (volumeLiters <= 0 || moles < 0) return 0;
  return moles / volumeLiters;
}
