// Chemical Equation & Reaction Engine
// Provides chemical equation parsing, reaction classification, stoichiometric balancing,
// and thorough validation for malformed chemical formulas.

import {
  parseChemicalFormula,
  validateChemicalFormula,
  formatChemicalFormula,
  tokenizeFormula,
  ChemicalToken,
  FormulaValidationResult,
} from './formulaParser';
import {
  balanceChemicalEquationEngine,
  BalancedReactionResult,
  ReactionSpecies,
} from './reactionBalancer';

export type ReactionCategory =
  | 'Synthesis'
  | 'Decomposition'
  | 'Single Displacement'
  | 'Double Displacement'
  | 'Combustion'
  | 'Acid-Base Neutralization'
  | 'Redox'
  | 'Precipitation'
  | 'Complexation'
  | 'General Transformation';

export interface ReactionClassificationResult {
  category: ReactionCategory;
  title: string;
  generalForm: string;
  description: string;
  drivingForce?: string;
  isRedox: boolean;
}

export interface ParsedEquationSpecies {
  raw: string;
  formula: string;
  coefficient: number;
  phase?: 's' | 'l' | 'g' | 'aq';
  isProduct: boolean;
  validation: FormulaValidationResult;
}

export interface ParsedEquationResult {
  original: string;
  reactants: ParsedEquationSpecies[];
  products: ParsedEquationSpecies[];
  elementsReactants: Record<string, number>;
  elementsProducts: Record<string, number>;
  isAtomicallyBalanced: boolean;
  isValid: boolean;
  errors: string[];
  classification?: ReactionClassificationResult;
  normalizedEquation: string;
}

export interface EquationEngineInputs {
  equation: string;
}

/**
 * Parses raw species string like "2H2O(l)" or "3Ba(OH)2" into coefficient, formula, and phase
 */
export function parseSpeciesToken(raw: string, isProduct: boolean): ParsedEquationSpecies {
  const trimmed = raw.trim();
  let cleanStr = trimmed;

  // Detect state of matter like (s), (l), (g), (aq)
  let phase: 's' | 'l' | 'g' | 'aq' | undefined;
  const phaseMatch = cleanStr.match(/\((s|l|g|aq)\)$/i);
  if (phaseMatch) {
    phase = phaseMatch[1].toLowerCase() as 's' | 'l' | 'g' | 'aq';
    cleanStr = cleanStr.replace(/\((s|l|g|aq)\)$/i, '').trim();
  }

  // Parse leading coefficient
  const coeffMatch = cleanStr.match(/^(\d+)(.*)$/);
  let coefficient = 1;
  let formula = cleanStr;
  if (coeffMatch && coeffMatch[1]) {
    coefficient = parseInt(coeffMatch[1], 10);
    formula = coeffMatch[2].trim();
  }

  const validation = validateChemicalFormula(formula);

  return {
    raw: trimmed,
    formula,
    coefficient,
    phase,
    isProduct,
    validation,
  };
}

/**
 * Parses full chemical equation string into reactants, products, and atom counts
 */
export function parseChemicalEquation(equation: string): ParsedEquationResult {
  const errors: string[] = [];
  if (!equation || !equation.trim()) {
    return {
      original: equation || '',
      reactants: [],
      products: [],
      elementsReactants: {},
      elementsProducts: {},
      isAtomicallyBalanced: false,
      isValid: false,
      errors: ['Equation input cannot be empty.'],
      normalizedEquation: '',
    };
  }

  // Identify reaction divider
  const arrowMatch = equation.match(/->|=>|→|⇌|=/);
  if (!arrowMatch) {
    return {
      original: equation,
      reactants: [],
      products: [],
      elementsReactants: {},
      elementsProducts: {},
      isAtomicallyBalanced: false,
      isValid: false,
      errors: ['Equation must include a reaction arrow ("->", "→", or "=") separating reactants and products.'],
      normalizedEquation: equation,
    };
  }

  const sides = equation.split(arrowMatch[0]);
  if (sides.length !== 2) {
    return {
      original: equation,
      reactants: [],
      products: [],
      elementsReactants: {},
      elementsProducts: {},
      isAtomicallyBalanced: false,
      isValid: false,
      errors: ['Equation must have exactly two sides (reactants -> products).'],
      normalizedEquation: equation,
    };
  }

  const rawReactants = sides[0].split('+').map((s) => s.trim()).filter(Boolean);
  const rawProducts = sides[1].split('+').map((s) => s.trim()).filter(Boolean);

  if (rawReactants.length === 0) {
    errors.push('No reactants found on the left side of the equation.');
  }
  if (rawProducts.length === 0) {
    errors.push('No products found on the right side of the equation.');
  }

  const reactants = rawReactants.map((s) => parseSpeciesToken(s, false));
  const products = rawProducts.map((s) => parseSpeciesToken(s, true));

  // Validate all formulas
  reactants.forEach((r) => {
    if (!r.validation.isValid) {
      errors.push(`Reactant "${r.raw}": ${r.validation.error}`);
    }
  });
  products.forEach((p) => {
    if (!p.validation.isValid) {
      errors.push(`Product "${p.raw}": ${p.validation.error}`);
    }
  });

  // Calculate total atom counts on both sides
  const elementsReactants: Record<string, number> = {};
  reactants.forEach((r) => {
    if (r.validation.counts) {
      for (const [el, cnt] of Object.entries(r.validation.counts)) {
        elementsReactants[el] = (elementsReactants[el] || 0) + cnt * r.coefficient;
      }
    }
  });

  const elementsProducts: Record<string, number> = {};
  products.forEach((p) => {
    if (p.validation.counts) {
      for (const [el, cnt] of Object.entries(p.validation.counts)) {
        elementsProducts[el] = (elementsProducts[el] || 0) + cnt * p.coefficient;
      }
    }
  });

  // Check conservation of atoms
  const allElements = new Set([...Object.keys(elementsReactants), ...Object.keys(elementsProducts)]);
  let isAtomicallyBalanced = true;

  for (const el of allElements) {
    const left = elementsReactants[el] || 0;
    const right = elementsProducts[el] || 0;
    if (left !== right) {
      isAtomicallyBalanced = false;
    }
  }

  const classification = classifyReactionType(
    reactants.map((r) => r.formula),
    products.map((p) => p.formula)
  );

  const formatSide = (species: ParsedEquationSpecies[]) =>
    species
      .map((s) => {
        const coeffStr = s.coefficient > 1 ? `${s.coefficient}` : '';
        const phaseStr = s.phase ? `(${s.phase})` : '';
        return `${coeffStr}${formatChemicalFormula(s.formula)}${phaseStr}`;
      })
      .join(' + ');

  const normalizedEquation = `${formatSide(reactants)} → ${formatSide(products)}`;

  return {
    original: equation,
    reactants,
    products,
    elementsReactants,
    elementsProducts,
    isAtomicallyBalanced,
    isValid: errors.length === 0,
    errors,
    classification,
    normalizedEquation,
  };
}

/**
 * Classifies a chemical reaction into fundamental mechanistic categories.
 * Accepts either a ParsedEquationResult or raw string arrays of reactants and products.
 */
export function classifyReactionType(
  reactantsOrParsed: string[] | ParsedEquationResult,
  productsList?: string[]
): ReactionClassificationResult {
  let reactants: string[];
  let products: string[];

  if (Array.isArray(reactantsOrParsed)) {
    reactants = reactantsOrParsed;
    products = productsList || [];
  } else {
    reactants = reactantsOrParsed.reactants.map((r) => r.formula);
    products = reactantsOrParsed.products.map((p) => p.formula);
  }

  const rClean = reactants.map((r) => r.trim().toUpperCase());
  const pClean = products.map((p) => p.trim().toUpperCase());
  const rSet = new Set(rClean);
  const pSet = new Set(pClean);

  // Hydrocarbon / Organic Combustion: Fuel with C or S reacting with O2 to form CO2/SO2/H2O
  const hasCarbonFuel = rClean.some((r) => r.includes('C') && r !== 'CO2');
  if (rSet.has('O2') && (pSet.has('CO2') || (hasCarbonFuel && pSet.has('H2O')))) {
    return {
      category: 'Combustion',
      title: 'Hydrocarbon / Organic Combustion',
      generalForm: 'Fuel + O₂ → CO₂ + H₂O + Heat',
      description: 'Rapid exothermic oxidation reaction between a fuel substance and atmospheric oxygen.',
      drivingForce: 'Large negative free energy from forming strong C=O and O-H bonds.',
      isRedox: true,
    };
  }

  // Synthesis / Combination: A + B -> AB
  if (reactants.length >= 2 && products.length === 1) {
    return {
      category: 'Synthesis',
      title: 'Combination / Synthesis Reaction',
      generalForm: 'A + B → AB',
      description: 'Two or more simple chemical entities coalesce to synthesize a more complex compound.',
      drivingForce: 'Thermodynamic stabilization via new chemical bond formation.',
      isRedox: true,
    };
  }

  // Decomposition: AB -> A + B
  if (reactants.length === 1 && products.length >= 2) {
    return {
      category: 'Decomposition',
      title: 'Decomposition Reaction (Thermal / Electrolytic)',
      generalForm: 'AB → A + B',
      description: 'A single chemical compound fractures into simpler constituent elements or compounds.',
      drivingForce: 'Entropy gain (ΔS° > 0) from gas evolution or thermal input.',
      isRedox: true,
    };
  }

  // Acid-Base Neutralization: HA + BOH -> BA + H2O
  const commonAcids = ['HCL', 'H2SO4', 'HNO3', 'CH3COOH', 'H3PO4', 'HBR', 'HI', 'HCLO4'];
  const commonBases = ['NAOH', 'KOH', 'CA(OH)2', 'BA(OH)2', 'MG(OH)2', 'NH3', 'NH4OH'];
  const hasAcid = rClean.some((r) => commonAcids.includes(r) || r.startsWith('H'));
  const hasBase = rClean.some((r) => commonBases.includes(r) || r.includes('OH'));

  if (hasAcid && hasBase && (pSet.has('H2O') || pSet.has('HOH'))) {
    return {
      category: 'Acid-Base Neutralization',
      title: 'Arrhenius / Brønsted–Lowry Acid-Base Neutralization',
      generalForm: 'Acid + Base → Salt + Water',
      description: 'Proton transfer equilibrium from a proton donor to a hydroxide/proton acceptor.',
      drivingForce: 'Exothermic water formation (H⁺ + OH⁻ → H₂O, ΔH° = -55.8 kJ/mol).',
      isRedox: false,
    };
  }

  // Single Displacement: A + BC -> B + AC
  if (reactants.length === 2 && products.length === 2) {
    const isSingleDisplacement =
      (reactants[0].length <= 2 && reactants[1].length > 2) ||
      (reactants[1].length <= 2 && reactants[0].length > 2);

    if (isSingleDisplacement) {
      return {
        category: 'Single Displacement',
        title: 'Single Replacement / Oxidation-Reduction',
        generalForm: 'A + BC → AC + B',
        description: 'An elemental active metal or halogen displaces another element from its aqueous salt solution.',
        drivingForce: 'Standard reduction potential gradient according to the electrochemical Activity Series.',
        isRedox: true,
      };
    }

    // Double Displacement / Metathesis: AB + CD -> AD + CB
    return {
      category: 'Double Displacement',
      title: 'Double Replacement / Metathesis',
      generalForm: 'AB + CD → AD + CB',
      description: 'Exchange of cation and anion partners between two ionic compounds in aqueous solution.',
      drivingForce: 'Formation of an insoluble precipitate, weak electrolyte, or evolved gas.',
      isRedox: false,
    };
  }

  // General redox or transformation
  return {
    category: 'Redox',
    title: 'Oxidation-Reduction (Redox) Transformation',
    generalForm: 'Oxidant + Reductant → Products',
    description: 'Chemical reaction featuring the transfer of valence electrons and changes in atomic oxidation states.',
    drivingForce: 'Electrochemical standard reduction potential difference (ΔE° > 0).',
    isRedox: true,
  };
}

/**
 * Checks if a parsed chemical equation is currently atom-balanced
 */
export function verifyEquationBalancing(parsed: ParsedEquationResult): {
  isBalanced: boolean;
  reactantCounts: Record<string, number>;
  productCounts: Record<string, number>;
} {
  return {
    isBalanced: parsed.isAtomicallyBalanced,
    reactantCounts: parsed.elementsReactants,
    productCounts: parsed.elementsProducts,
  };
}

/**
 * Complete Equation Engine service
 */
export const EquationEngine = {
  parseFormula: parseChemicalFormula,
  validateFormula: validateChemicalFormula,
  tokenizeFormula,
  formatFormula: formatChemicalFormula,
  parseEquation: parseChemicalEquation,
  classifyReaction: classifyReactionType,
  verifyBalancing: verifyEquationBalancing,
  balanceEquation: balanceChemicalEquationEngine,
};
