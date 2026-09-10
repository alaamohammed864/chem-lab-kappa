// Ion Engine
// Provides structured ion querying, oxidation state verification,
// stoichiometric ionic salt synthesis, and precipitation/solubility predictions.

import { COMMON_IONS_DATA, IonData } from '../../data/ionsData';
import { formatChemicalFormula } from './formulaParser';

export interface FormedSaltResult {
  formula: string;
  formattedFormula: string;
  name: string;
  cation: IonData;
  anion: IonData;
  cationCount: number;
  anionCount: number;
  molarMass: number;
  isSoluble: boolean;
  solubilityNote: string;
  color?: string;
}

export interface IonFilterOptions {
  type?: 'cation' | 'anion' | 'all';
  charge?: number;
  category?: 'monatomic' | 'polyatomic' | 'oxoanion' | 'organic' | 'transition-metal' | 'all';
  searchQuery?: string;
}

/**
 * Calculates greatest common divisor for reducing integer ratios
 */
function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

/**
 * Searches and filters structured ions by text query, type, charge, or category
 */
export function searchIons(options: IonFilterOptions = {}): IonData[] {
  const { type = 'all', charge, category = 'all', searchQuery = '' } = options;
  const q = searchQuery.toLowerCase().trim();

  return COMMON_IONS_DATA.filter((ion) => {
    if (type !== 'all' && ion.type !== type) return false;
    if (charge !== undefined && ion.charge !== charge) return false;
    if (category !== 'all' && ion.category !== category) return false;

    if (q) {
      const matchName = ion.name.toLowerCase().includes(q);
      const matchFormula = ion.formula.toLowerCase().includes(q);
      const matchSymbol = ion.symbol.toLowerCase().includes(q);
      const matchPlain = ion.plainFormula.toLowerCase().includes(q);
      const matchDesc = ion.description.toLowerCase().includes(q);
      const matchElement = ion.oxidationStates.some((os) => os.element.toLowerCase() === q);
      return matchName || matchFormula || matchSymbol || matchPlain || matchDesc || matchElement;
    }
    return true;
  });
}

/**
 * Finds an ion by its unique ID, symbol, or formula
 */
export function getIonById(identifier: string): IonData | undefined {
  const idLower = identifier.toLowerCase().trim();
  return COMMON_IONS_DATA.find(
    (ion) =>
      ion.id.toLowerCase() === idLower ||
      ion.symbol.toLowerCase() === idLower ||
      ion.formula.toLowerCase() === idLower ||
      ion.plainFormula.toLowerCase() === idLower
  );
}

/**
 * Validates that the sum of elemental oxidation states times element counts equals the ion's formal charge
 */
export function verifyOxidationStateSum(ion: IonData): { valid: boolean; calculatedSum: number; formalCharge: number } {
  // Check for monatomic ions where charge equals oxidation state directly
  if (ion.category === 'monatomic' || ion.oxidationStates.length === 1) {
    const calculatedSum = ion.oxidationStates[0].state;
    return {
      valid: calculatedSum === ion.charge,
      calculatedSum,
      formalCharge: ion.charge,
    };
  }

  // Check known polyatomic oxoanions and cations
  let calculatedSum = 0;
  // We compute total formal charge contribution from listed states
  for (const os of ion.oxidationStates) {
    // Determine count of this element in plainFormula
    const reg = new RegExp(`${os.element}(\\d*)`);
    const match = ion.plainFormula.match(reg);
    const count = match && match[1] ? parseInt(match[1], 10) : 1;
    calculatedSum += os.state * count;
  }

  return {
    valid: calculatedSum === ion.charge,
    calculatedSum,
    formalCharge: ion.charge,
  };
}

/**
 * Evaluates aqueous solubility rules for an ionic compound formed from a cation and anion
 */
export function predictAqueousSolubility(cation: IonData, anion: IonData): { isSoluble: boolean; solubilityNote: string; note: string } {
  const cSym = cation.plainFormula;
  const aSym = anion.plainFormula;

  const res = (isSoluble: boolean, msg: string) => ({
    isSoluble,
    solubilityNote: msg,
    note: msg,
  });

  // Rule 1: Alkali metals (Li, Na, K, Rb, Cs) and Ammonium (NH4) salts are universally soluble
  if (['Na', 'K', 'Li', 'Rb', 'Cs', 'NH4'].includes(cSym)) {
    return res(true, 'Soluble: All salts of alkali metals (Group 1) and ammonium (NH₄⁺) are highly soluble in water.');
  }

  // Rule 2: All Nitrates (NO3), Chlorates (ClO3, ClO4), and Acetates (CH3COO) are soluble
  if (['NO3', 'ClO3', 'ClO4', 'CH3COO'].includes(aSym)) {
    return res(true, `Soluble: All inorganic ${anion.name.toLowerCase()} salts are readily soluble in aqueous solution.`);
  }

  // Rule 3: Halides (Cl-, Br-, I-) are soluble except with Ag+, Pb2+, Hg2(2+)
  if (['Cl', 'Br', 'I'].includes(aSym)) {
    if (['Ag', 'Pb'].includes(cSym)) {
      return res(false, `Insoluble precipitate: Halides of ${cation.name} (Ag⁺, Pb²⁺) form sparingly soluble salts with low Ksp.`);
    }
    return res(true, `Soluble: Halide salt of ${cation.name} dissolves completely in aqueous medium.`);
  }

  // Rule 4: Sulfates (SO4) are soluble except Ba2+, Pb2+, Ca2+, Sr2+, Ag+
  if (aSym === 'SO4') {
    if (['Ba', 'Pb', 'Sr'].includes(cSym)) {
      return res(false, `Insoluble precipitate: Heavy alkaline-earth sulfate (${cation.name} sulfate) is virtually insoluble in water.`);
    }
    if (['Ca', 'Ag'].includes(cSym)) {
      return res(false, `Slightly / sparingly soluble: ${cation.name} sulfate exhibits limited solubility (sparingly soluble precipitate).`);
    }
    return res(true, 'Soluble: Sulfate dissolves well with this transition/alkaline cation.');
  }

  // Rule 5: Hydroxides (OH-) are insoluble except Alkali metals, Ba2+, Ca2+ (sparingly)
  if (aSym === 'OH') {
    if (['Ba'].includes(cSym)) {
      return res(true, 'Soluble: Barium hydroxide dissolves to produce a strongly alkaline aqueous solution.');
    }
    if (['Ca', 'Sr'].includes(cSym)) {
      return res(false, 'Sparingly soluble: Forms limewater / slaked lime suspension; excess precipitates as hydroxide.');
    }
    return res(false, `Insoluble precipitate: ${cation.name} hydroxide forms an insoluble gelatinous hydroxide precipitate.`);
  }

  // Rule 6: Carbonates (CO3), Phosphates (PO4), Sulfides (S), Chromates (CrO4) are insoluble with polyvalent cations
  if (['CO3', 'PO4', 'S', 'CrO4', 'Cr2O7'].includes(aSym)) {
    return res(false, `Insoluble precipitate: ${anion.name} forms a precipitate with multivalent ${cation.name} cations.`);
  }

  // Default assumption
  return res(true, 'Presumed soluble under standard dilute laboratory conditions at 25°C.');
}

/**
 * Combines a cation and an anion into an electrically neutral ionic compound
 * utilizing the lowest common multiple / cross-over method of ionic charges.
 */
export function formIonicCompound(cation: IonData, anion: IonData): FormedSaltResult {
  if (cation.type !== 'cation') {
    throw new Error(`First argument must be a cation (positive charge), received ${cation.name} (${cation.charge})`);
  }
  if (anion.type !== 'anion') {
    throw new Error(`Second argument must be an anion (negative charge), received ${anion.name} (${anion.charge})`);
  }

  const qCation = Math.abs(cation.charge);
  const qAnion = Math.abs(anion.charge);

  const divisor = gcd(qCation, qAnion);
  const cationCount = qAnion / divisor;
  const anionCount = qCation / divisor;

  // Format chemical formula
  let catPart = cation.plainFormula;
  if (cationCount > 1 && cation.category === 'polyatomic') {
    catPart = `(${catPart})`;
  }
  const catCountStr = cationCount > 1 ? `${cationCount}` : '';

  let anPart = anion.plainFormula;
  if (anionCount > 1 && anion.category !== 'monatomic') {
    anPart = `(${anPart})`;
  }
  const anCountStr = anionCount > 1 ? `${anionCount}` : '';

  const formula = `${catPart}${catCountStr}${anPart}${anCountStr}`;
  const formattedFormula = formatChemicalFormula(formula);

  // Derive IUPAC Salt Name
  let catName = cation.name.replace(/ ion.*$/, '').replace(/ \(.*\)$/, '');
  let anName = anion.name.replace(/ ion.*$/, '').replace(/ \(.*\)$/, '');
  const saltName = `${catName} ${anName.toLowerCase()}`;

  // Molar mass calculation
  const molarMass = parseFloat((cation.molarMass * cationCount + anion.molarMass * anionCount).toFixed(3));

  // Solubility prediction
  const { isSoluble, solubilityNote } = predictAqueousSolubility(cation, anion);

  // Suggested color
  let color: string | undefined;
  if (!isSoluble) {
    if (anion.plainFormula === 'CrO4' && cation.plainFormula === 'Ag') color = 'Brick red precipitate';
    else if (anion.plainFormula === 'I' && (cation.plainFormula === 'Pb' || cation.plainFormula === 'Ag')) color = 'Bright yellow precipitate';
    else if (anion.plainFormula === 'S' && cation.plainFormula === 'Fe') color = 'Black precipitate';
    else if (anion.plainFormula === 'S' && cation.plainFormula === 'Cu') color = 'Dark brown/black precipitate';
    else if (anion.plainFormula === 'OH' && cation.plainFormula === 'Fe' && cation.charge === 3) color = 'Reddish-brown gelatinous floc';
    else if (anion.plainFormula === 'OH' && cation.plainFormula === 'Cu') color = 'Sky blue precipitate';
    else if (anion.plainFormula === 'Cl' && cation.plainFormula === 'Ag') color = 'White curdy precipitate';
    else color = 'White/Colorless solid precipitate';
  }

  return {
    formula,
    formattedFormula,
    name: saltName,
    cation,
    anion,
    cationCount,
    anionCount,
    molarMass,
    isSoluble,
    solubilityNote,
    color,
  };
}

/**
 * Exported Ion Engine namespace
 */
export const IonEngine = {
  allIons: COMMON_IONS_DATA,
  searchIons,
  getIonById,
  verifyOxidationStateSum,
  predictAqueousSolubility,
  formIonicCompound,
};
