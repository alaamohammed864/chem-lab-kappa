// Verified Solubility Product Constants (Ksp) at 25°C (298.15 K)
// Source: CRC Handbook of Chemistry and Physics (97th Edition) & IUPAC Solubility Data Series

export interface SparinglySolubleSalt {
  formula: string;
  name: string;
  cation: string;
  anion: string;
  cationCount: number; // x in AxBy
  anionCount: number;  // y in AxBy
  cationCharge: number;
  anionCharge: number;
  ksp: number;         // Solubility product constant at 25°C
  molarMass: number;   // g/mol
  color?: string;
  notes?: string;
}

export const SOLUBILITY_PRODUCTS_DATA: SparinglySolubleSalt[] = [
  // Halides
  { formula: 'AgCl', name: 'Silver chloride', cation: 'Ag⁺', anion: 'Cl⁻', cationCount: 1, anionCount: 1, cationCharge: 1, anionCharge: -1, ksp: 1.77e-10, molarMass: 143.32, color: 'White curd', notes: 'Curdy precipitate in chloride qualitative analysis' },
  { formula: 'AgBr', name: 'Silver bromide', cation: 'Ag⁺', anion: 'Br⁻', cationCount: 1, anionCount: 1, cationCharge: 1, anionCharge: -1, ksp: 5.35e-13, molarMass: 187.77, color: 'Pale yellow', notes: 'Photographic emulsion light-sensitive salt' },
  { formula: 'AgI', name: 'Silver iodide', cation: 'Ag⁺', anion: 'I⁻', cationCount: 1, anionCount: 1, cationCharge: 1, anionCharge: -1, ksp: 8.52e-17, molarMass: 234.77, color: 'Bright yellow', notes: 'Cloud seeding agent; extremely insoluble' },
  { formula: 'PbCl2', name: 'Lead(II) chloride', cation: 'Pb²⁺', anion: 'Cl⁻', cationCount: 1, anionCount: 2, cationCharge: 2, anionCharge: -1, ksp: 1.70e-5, molarMass: 278.10, color: 'White needles', notes: 'Moderately soluble in hot boiling water' },
  { formula: 'PbI2', name: 'Lead(II) iodide', cation: 'Pb²⁺', anion: 'I⁻', cationCount: 1, anionCount: 2, cationCharge: 2, anionCharge: -1, ksp: 9.80e-9, molarMass: 461.01, color: 'Golden yellow', notes: 'Classic "golden rain" crystallization experiment' },
  { formula: 'CaF2', name: 'Calcium fluoride (Fluorite)', cation: 'Ca²⁺', anion: 'F⁻', cationCount: 1, anionCount: 2, cationCharge: 2, anionCharge: -1, ksp: 3.45e-11, molarMass: 78.07, color: 'White / Colorless', notes: 'Naturally occurring optical mineral' },
  { formula: 'MgF2', name: 'Magnesium fluoride', cation: 'Mg²⁺', anion: 'F⁻', cationCount: 1, anionCount: 2, cationCharge: 2, anionCharge: -1, ksp: 5.16e-11, molarMass: 62.30, color: 'White', notes: 'Anti-reflective optical lens coating' },

  // Sulfates & Carbonates
  { formula: 'BaSO4', name: 'Barium sulfate (Barite)', cation: 'Ba²⁺', anion: 'SO₄²⁻', cationCount: 1, anionCount: 1, cationCharge: 2, anionCharge: -2, ksp: 1.08e-10, molarMass: 233.39, color: 'Heavy white powder', notes: 'Medical radio-contrast agent for gastrointestinal imaging' },
  { formula: 'CaSO4', name: 'Calcium sulfate (Gypsum)', cation: 'Ca²⁺', anion: 'SO₄²⁻', cationCount: 1, anionCount: 1, cationCharge: 2, anionCharge: -2, ksp: 4.93e-5, molarMass: 136.14, color: 'White', notes: 'Slightly soluble; major component of industrial scale' },
  { formula: 'SrSO4', name: 'Strontium sulfate (Celestine)', cation: 'Sr²⁺', anion: 'SO₄²⁻', cationCount: 1, anionCount: 1, cationCharge: 2, anionCharge: -2, ksp: 3.44e-7, molarMass: 183.68, color: 'White', notes: 'Intermediate solubility between CaSO4 and BaSO4' },
  { formula: 'PbSO4', name: 'Lead(II) sulfate', cation: 'Pb²⁺', anion: 'SO₄²⁻', cationCount: 1, anionCount: 1, cationCharge: 2, anionCharge: -2, ksp: 2.53e-8, molarMass: 303.26, color: 'White', notes: 'Discharge product in automotive lead-acid batteries' },
  { formula: 'CaCO3', name: 'Calcium carbonate (Calcite)', cation: 'Ca²⁺', anion: 'CO₃²⁻', cationCount: 1, anionCount: 1, cationCharge: 2, anionCharge: -2, ksp: 3.36e-9, molarMass: 100.09, color: 'White crystalline', notes: 'Limestone, marble, and boiler scale deposit' },
  { formula: 'BaCO3', name: 'Barium carbonate (Witherite)', cation: 'Ba²⁺', anion: 'CO₃²⁻', cationCount: 1, anionCount: 1, cationCharge: 2, anionCharge: -2, ksp: 2.58e-9, molarMass: 197.34, color: 'White', notes: 'Precipitates readily in carbonated alkaline solutions' },
  { formula: 'MgCO3', name: 'Magnesium carbonate (Magnesite)', cation: 'Mg²⁺', anion: 'CO₃²⁻', cationCount: 1, anionCount: 1, cationCharge: 2, anionCharge: -2, ksp: 6.82e-6, molarMass: 84.31, color: 'White', notes: 'Athletic chalk and pharmaceutical antacid' },
  { formula: 'FeCO3', name: 'Iron(II) carbonate (Siderite)', cation: 'Fe²⁺', anion: 'CO₃²⁻', cationCount: 1, anionCount: 1, cationCharge: 2, anionCharge: -2, ksp: 3.13e-11, molarMass: 115.86, color: 'Tan / Light brown', notes: 'Key corrosion scale in oil & gas sweet CO2 corrosion' },

  // Hydroxides
  { formula: 'Fe(OH)3', name: 'Iron(III) hydroxide', cation: 'Fe³⁺', anion: 'OH⁻', cationCount: 1, anionCount: 3, cationCharge: 3, anionCharge: -1, ksp: 2.79e-39, molarMass: 106.87, color: 'Red-brown floc', notes: 'Extremely insoluble rust gelatinous flocculant' },
  { formula: 'Fe(OH)2', name: 'Iron(II) hydroxide', cation: 'Fe²⁺', anion: 'OH⁻', cationCount: 1, anionCount: 2, cationCharge: 2, anionCharge: -1, ksp: 4.87e-17, molarMass: 89.86, color: 'Pale green', notes: 'Oxidizes rapidly in air to brown Fe(III) species' },
  { formula: 'Al(OH)3', name: 'Aluminum hydroxide (Gibbsite)', cation: 'Al³⁺', anion: 'OH⁻', cationCount: 1, anionCount: 3, cationCharge: 3, anionCharge: -1, ksp: 1.3e-33, molarMass: 78.00, color: 'White gelatinous', notes: 'Amphoteric hydroxide used in water purification flocculation' },
  { formula: 'Mg(OH)2', name: 'Magnesium hydroxide (Brucite)', cation: 'Mg²⁺', anion: 'OH⁻', cationCount: 1, anionCount: 2, cationCharge: 2, anionCharge: -1, ksp: 5.61e-12, molarMass: 58.32, color: 'White suspension', notes: '"Milk of Magnesia" safe antacid suspension' },
  { formula: 'Ca(OH)2', name: 'Calcium hydroxide (Slaked lime)', cation: 'Ca²⁺', anion: 'OH⁻', cationCount: 1, anionCount: 2, cationCharge: 2, anionCharge: -1, ksp: 5.02e-6, molarMass: 74.09, color: 'White powder', notes: 'Limewater saturated solution has pH ≈ 12.4' },
  { formula: 'Cu(OH)2', name: 'Copper(II) hydroxide', cation: 'Cu²⁺', anion: 'OH⁻', cationCount: 1, anionCount: 2, cationCharge: 2, anionCharge: -1, ksp: 2.20e-20, molarMass: 97.56, color: 'Sky blue gelatinous', notes: 'Precipitates in Fehling and Benedict test reactions' },
  { formula: 'Zn(OH)2', name: 'Zinc hydroxide', cation: 'Zn²⁺', anion: 'OH⁻', cationCount: 1, anionCount: 2, cationCharge: 2, anionCharge: -1, ksp: 3.00e-17, molarMass: 99.42, color: 'White gelatinous', notes: 'Dissolves in excess strong base forming zincate [Zn(OH)4]2-' },

  // Sulfides & Chromates
  { formula: 'Ag2CrO4', name: 'Silver chromate', cation: 'Ag⁺', anion: 'CrO₄²⁻', cationCount: 2, anionCount: 1, cationCharge: 1, anionCharge: -2, ksp: 1.12e-12, molarMass: 331.73, color: 'Brick red', notes: 'Indicator endpoint precipitate in Mohr argentometric titration' },
  { formula: 'BaCrO4', name: 'Barium chromate', cation: 'Ba²⁺', anion: 'CrO₄²⁻', cationCount: 1, anionCount: 1, cationCharge: 2, anionCharge: -2, ksp: 1.17e-10, molarMass: 253.32, color: 'Light yellow', notes: 'Insoluble pigment used in anti-corrosion primer coatings' },
  { formula: 'PbCrO4', name: 'Lead(II) chromate (Chrome yellow)', cation: 'Pb²⁺', anion: 'CrO₄²⁻', cationCount: 1, anionCount: 1, cationCharge: 2, anionCharge: -2, ksp: 2.80e-13, molarMass: 323.20, color: 'Vibrant yellow', notes: 'Historic historical pigment; highly insoluble' },
  { formula: 'ZnS', name: 'Zinc sulfide (Sphalerite)', cation: 'Zn²⁺', anion: 'S²⁻', cationCount: 1, anionCount: 1, cationCharge: 2, anionCharge: -2, ksp: 2.00e-25, molarMass: 97.47, color: 'White / Pale gray', notes: 'Phosphor material used in scintillation radiation detectors' },
  { formula: 'CuS', name: 'Copper(II) sulfide (Covellite)', cation: 'Cu²⁺', anion: 'S²⁻', cationCount: 1, anionCount: 1, cationCharge: 2, anionCharge: -2, ksp: 6.30e-36, molarMass: 95.61, color: 'Dark brown/black', notes: 'Formed in hydrogen sulfide environmental sour corrosion' },
  { formula: 'FeS', name: 'Iron(II) sulfide (Troilite/Pyrrhotite)', cation: 'Fe²⁺', anion: 'S²⁻', cationCount: 1, anionCount: 1, cationCharge: 2, anionCharge: -2, ksp: 6.00e-19, molarMass: 87.91, color: 'Black pyrophoric', notes: 'Primary sulfide scale in sour crude oil pipelines' },
];

// Export aliases for calculation engine compatibility
export const SOLUBILITY_DATA = SOLUBILITY_PRODUCTS_DATA;
export type SolubilityEntry = SparinglySolubleSalt;
