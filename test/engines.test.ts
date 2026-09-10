// ALAA CHEM LAB — Scientific Engines & Architecture Test Suite
import {
  parseChemicalFormula,
  calculateMolarMass,
  calculateMolesFromMass,
  calculateMolarity,
  balanceChemicalEquationLocal,
  calculateInterplanarSpacing,
  calculateTheoreticalDensity,
  calculateBraggsLaw,
  calculateFullBraggParameters,
  XRD_SOURCES,
  calculatePREN,
  calculateFaradayCorrosionRate,
  calculateUltrasonicVelocities,
  calculateUltrasonicWavelength,
} from '../src/engines';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

function assertClose(actual: number, expected: number, tolerance = 0.01, message: string) {
  const diff = Math.abs(actual - expected);
  assert(diff <= tolerance, `${message} (Expected ~${expected}, Got ${actual})`);
}

console.log('--- 1. Testing Chemical Formula & Molar Mass Engine ---');
const fe2o3Counts = parseChemicalFormula('Fe2O3');
assert(fe2o3Counts['Fe'] === 2 && fe2o3Counts['O'] === 3, 'Fe2O3 tokenized into Fe: 2, O: 3');

const complexCounts = parseChemicalFormula('Ca3(PO4)2');
assert(complexCounts['Ca'] === 3 && complexCounts['P'] === 2 && complexCounts['O'] === 8, 'Ca3(PO4)2 tokenized into Ca: 3, P: 2, O: 8');

const fe2o3Molar = calculateMolarMass('Fe2O3');
assert(fe2o3Molar.isValid, 'Fe2O3 molar mass calculation is marked valid');
assertClose(fe2o3Molar.totalMolarMass, 159.69, 0.2, 'Fe2O3 total molar mass ~ 159.69 g/mol');

const moles = calculateMolesFromMass(100, fe2o3Molar.totalMolarMass);
assertClose(moles, 0.626, 0.01, '100g of Fe2O3 = ~0.626 moles');

const molarity = calculateMolarity(moles, 2.0);
assertClose(molarity, 0.313, 0.01, '0.626 moles in 2L = ~0.313 M');

console.log('\n--- 2. Testing Reaction Balancer & Stoichiometry Engine ---');
const feOxidation = balanceChemicalEquationLocal('Fe + O2 -> Fe2O3');
assert(feOxidation.balanced.includes('4Fe') && feOxidation.balanced.includes('2Fe₂O₃'), 'Fe + O2 balanced into 4Fe + 3O₂ → 2Fe₂O₃');
assert(feOxidation.enthalpy.includes('Exothermic'), 'Reaction identified as exothermic');

const methaneCombustion = balanceChemicalEquationLocal('CH4 + O2 -> CO2 + H2O');
assert(methaneCombustion.balanced.includes('CH₄') && methaneCombustion.balanced.includes('2H₂O'), 'CH4 combustion properly balanced');

console.log('\n--- 3. Testing Crystallography & Interplanar Spacing Engine ---');
// For FCC Copper, a = 3.615 Å, Miller index (111):
// d_{111} = 3.615 / sqrt(1^2 + 1^2 + 1^2) = 3.615 / sqrt(3) ~ 2.087 Å
const d111Cubic = calculateInterplanarSpacing(1, 1, 1, 3.615);
assertClose(d111Cubic, 2.087, 0.005, 'Cu (111) interplanar d-spacing ~ 2.087 Å');

// For Tetragonal (002) with a = 3.0, c = 4.0:
// 1/d^2 = 0 + 4 / 16 = 1/4 => d = 2.0 Å
const d002Tetra = calculateInterplanarSpacing(0, 0, 2, 3.0, 4.0, 'tetragonal');
assertClose(d002Tetra, 2.0, 0.01, 'Tetragonal (002) d-spacing = 2.0 Å');

console.log('\n--- 4. Testing XRD & Bragg\'s Law Engine ---');
// lambda = 2 * d * sin(theta) => for Cu-Ka (1.5406 A) and 2theta = 40.24 deg (theta = 20.12 deg):
// d = 1.5406 / (2 * sin(20.12 deg)) = 1.5406 / (2 * 0.34397) ~ 2.2394 A
const bragg = calculateBraggsLaw(40.24, XRD_SOURCES['cu-ka'].wavelengthAngstrom);
assertClose(bragg.dSpacingAngstrom, 2.2394, 0.01, "Bragg's Law d-spacing at 2theta = 40.24° ~ 2.24 Å");

const fullBragg = calculateFullBraggParameters(40.24, 1.5406);
assert(fullBragg.scatteringVectorQ > 0, 'Scattering vector Q is calculated and positive');

console.log('\n--- 5. Testing Corrosion Science Engine ---');
// 316L stainless steel: 17% Cr, 2.5% Mo, 0.05% N
// PREN = 17 + 3.3 * 2.5 + 16 * 0.05 = 17 + 8.25 + 0.8 = 26.05
const pren316L = calculatePREN(17, 2.5, 0.05, 0, 'AISI 316L');
assertClose(pren316L.prenValue, 26.05, 0.1, '316L PREN calculation = 26.05');
assert(pren316L.resistanceClass === 'Resistant (Marine Service)', '316L classified as marine service resistant');

// 2507 Super Duplex: 25% Cr, 4% Mo, 0.28% N -> PREN = 25 + 13.2 + 4.48 = 42.68
const pren2507 = calculatePREN(25, 4, 0.28, 0, 'Super Duplex 2507');
assert(pren2507.prenValue >= 40, 'Super Duplex PREN >= 40');
assert(pren2507.resistanceClass === 'Critical Pitting Resistant', 'Super duplex classified as critical pitting resistant');

const faradayRate = calculateFaradayCorrosionRate(10, 28, 7.9);
assert(faradayRate.rateMmPerYear > 0, 'Faraday corrosion rate calculated and positive');

console.log('\n--- 6. Testing Non-Destructive Testing (NDT) Engine ---');
// Steel: E = 205 GPa, rho = 7.85 g/cm3, nu = 0.29
const ndtSteel = calculateUltrasonicVelocities(205, 7.85, 0.29, 'Carbon Steel');
assert(ndtSteel.longitudinalVelocityMS > 5000 && ndtSteel.longitudinalVelocityMS < 6500, 'Steel longitudinal velocity between 5000 and 6500 m/s');
assert(ndtSteel.acousticImpedanceMRayl > 40, 'Steel acoustic impedance > 40 MRayl');

const probe = calculateUltrasonicWavelength(ndtSteel.longitudinalVelocityMS, 5.0, 10.0);
assert(probe.wavelengthMm > 0 && probe.nearFieldDistanceMm! > 0, 'Probe wavelength and near-field distance computed');

console.log('\n--- 7. Testing 118 Chemical Elements Dataset & Lookups ---');
import {
  ELEMENTS_DATA,
  getElementByNumber,
  getElementBySymbol,
  searchElements,
} from '../src/data/elements';

assert(ELEMENTS_DATA.length === 118, `All 118 elements loaded (Count: ${ELEMENTS_DATA.length})`);

// Verify sequence 1 to 118
let sequenceValid = true;
for (let i = 1; i <= 118; i++) {
  const el = getElementByNumber(i);
  if (!el || el.number !== i) {
    sequenceValid = false;
    break;
  }
}
assert(sequenceValid, 'All elements 1 to 118 exist in strict atomic number sequence');

const hydrogen = getElementByNumber(1);
assert(hydrogen?.symbol === 'H' && hydrogen?.name === 'Hydrogen', 'Element 1 is Hydrogen (H)');
assertClose(hydrogen?.atomicMass || 0, 1.008, 0.01, 'Hydrogen atomic mass is ~1.008 u');

const oganesson = getElementByNumber(118);
assert(oganesson?.symbol === 'Og' && oganesson?.name === 'Oganesson', 'Element 118 is Oganesson (Og)');
assert(oganesson?.period === 7 && oganesson?.group === 18, 'Oganesson is Period 7, Group 18');

const iron = getElementBySymbol('Fe');
assert(iron?.name === 'Iron' && iron?.number === 26, 'Symbol lookup Fe correctly returns Iron (Z=26)');
assert(iron?.block === 'd' && iron?.category === 'transition-metal', 'Iron is d-block transition metal');

const gold = getElementBySymbol('Au');
assert(gold?.name === 'Gold' && gold?.number === 79, 'Symbol lookup Au correctly returns Gold (Z=79)');

const searchResult = searchElements('Titanium');
assert(searchResult.some((e) => e.symbol === 'Ti'), 'Search for "Titanium" finds Ti');

const sBlockCount = ELEMENTS_DATA.filter((e) => e.block === 's').length;
const pBlockCount = ELEMENTS_DATA.filter((e) => e.block === 'p').length;
const dBlockCount = ELEMENTS_DATA.filter((e) => e.block === 'd').length;
const fBlockCount = ELEMENTS_DATA.filter((e) => e.block === 'f').length;
assert(sBlockCount === 14, `s-block contains 14 elements (got ${sBlockCount})`);
assert(pBlockCount === 36, `p-block contains 36 elements (got ${pBlockCount})`);
assert(dBlockCount === 40, `d-block contains 40 elements (got ${dBlockCount})`);
assert(fBlockCount === 28, `f-block contains 28 elements (got ${fBlockCount})`);
assert(sBlockCount + pBlockCount + dBlockCount + fBlockCount === 118, 'Sum of all blocks equals exactly 118');

console.log('\n--- 8. Testing Stoichiometry & Limiting Reagent Engine ---');
import {
  computeMolarMassEngine,
  calculateStoichiometryEngine,
  computeConcentrationEngine,
  calculateDilutionEngine,
  calculatePHEngine,
  calculateGasLawsEngine,
  calculateThermochemistryEngine,
  calculateSolubilityEngine,
} from '../src/engines';

// Stoichiometry: 2H2 + O2 -> 2H2O
// 4g H2 (MW ~ 2.016 g/mol -> ~1.984 mol) and 32g O2 (MW ~ 32 g/mol -> 1.0 mol)
const stoich = calculateStoichiometryEngine({
  equation: '2H2 + O2 -> 2H2O',
  reactants: [
    { formula: 'H2', amount: 4, unit: 'g' },
    { formula: 'O2', amount: 32, unit: 'g' },
  ],
  targetProduct: 'H2O',
});
assert(stoich.isValid, 'Stoichiometry calculation is valid');
assert(stoich.limitingReagent === 'H2', `Identified H2 as limiting reagent (Got ${stoich.limitingReagent})`);
assertClose(stoich.targetProductYield?.theoreticalMoles || 0, 1.984, 0.05, 'Theoretical yield of H2O ~ 1.98 moles');
assertClose(stoich.targetProductYield?.theoreticalMass || 0, 35.75, 0.5, 'Theoretical yield of H2O ~ 35.75 g');

console.log('\n--- 9. Testing Concentration & Unit Conversion Engine ---');
// 58.44g of NaCl in 1.0 L of water (density 1.02 g/mL)
const conc = computeConcentrationEngine({
  soluteFormula: 'NaCl',
  soluteMassGrams: 58.44,
  solutionVolumeLiters: 1.0,
  solutionDensityGPerMl: 1.02,
});
assert(conc.isValid, 'Concentration calculation is valid');
assertClose(conc.molarity || 0, 1.0, 0.02, 'Molarity of 58.44g NaCl in 1L = ~1.00 M');
assert(conc.massPercent !== undefined && conc.massPercent > 5, 'Mass percent calculated (> 5%)');
assert(conc.ppm !== undefined && conc.ppm > 50000, 'PPM concentration calculated (> 50,000 ppm)');

console.log('\n--- 10. Testing Dilution Engine (C1·V1 = C2·V2) ---');
// Diluting 12 M HCl stock down to 1.0 M in 500 mL: V1 = (1 * 500) / 12 = 41.67 mL
const dilution = calculateDilutionEngine({
  c1: 12.0,
  c2: 1.0,
  v2: 500.0,
  v1Unit: 'mL',
  v2Unit: 'mL',
});
assert(dilution.isValid, 'Dilution calculation is valid');
assertClose(dilution.v1 || 0, 41.67, 0.1, 'Required stock volume V1 ~ 41.67 mL');
assertClose(dilution.diluentVolumeToAdd || 0, 458.33, 0.2, 'Diluent volume to add ~ 458.33 mL');

console.log('\n--- 11. Testing pH & Acid-Base Engine ---');
// 0.01 M Strong Acid (HCl): pH = -log10(0.01) = 2.0
const strongAcidPH = calculatePHEngine({
  category: 'strong_acid',
  concentrationM: 0.01,
});
assert(strongAcidPH.isValid, 'Strong acid pH calculation is valid');
assertClose(strongAcidPH.ph, 2.0, 0.01, '0.01 M HCl has pH = 2.00');
assertClose(strongAcidPH.poh, 12.0, 0.01, '0.01 M HCl has pOH = 12.00');

// Weak acid: 0.1 M Acetic acid (Ka = 1.75e-5): [H+] ~ sqrt(Ka * C) ~ 0.001323 -> pH ~ 2.88
const weakAcidPH = calculatePHEngine({
  category: 'weak_acid',
  concentrationM: 0.1,
  ka: 1.75e-5,
});
assert(weakAcidPH.isValid, 'Weak acid pH calculation is valid');
assertClose(weakAcidPH.ph, 2.88, 0.02, '0.1 M Acetic acid has pH ~ 2.88');

// Buffer: Acetic acid (0.1 M) / Sodium Acetate (0.1 M): pH = pKa = -log10(1.75e-5) = 4.757
const bufferPH = calculatePHEngine({
  category: 'buffer',
  acidConcentrationM: 0.1,
  conjugateBaseConcentrationM: 0.1,
  ka: 1.75e-5,
});
assert(bufferPH.isValid, 'Buffer pH calculation is valid');
assertClose(bufferPH.ph, 4.757, 0.02, 'Equal molarity acetate buffer pH = pKa ~ 4.76');

console.log('\n--- 12. Testing Gas Laws Engine ---');
// Ideal gas: P = nRT/V for 1.0 mol at 273.15 K and 22.414 L -> P ~ 1.0 atm
const idealGasP = calculateGasLawsEngine({
  lawType: 'ideal_gas',
  variableToSolve: 'P',
  moles: 1.0,
  volume: 22.414,
  volumeUnit: 'L',
  temperature: 273.15,
  temperatureUnit: 'K',
  pressureUnit: 'atm',
});
assert(idealGasP.isValid, 'Ideal gas P calculation is valid');
assertClose(idealGasP.solvedValue, 1.0, 0.01, '1 mol at STP in 22.414 L has P ~ 1.00 atm');

// Van der Waals real gas: CO2 at high pressure
const vdwGas = calculateGasLawsEngine({
  lawType: 'van_der_waals',
  gasFormula: 'CO2',
  moles: 2.0,
  volume: 1.0,
  volumeUnit: 'L',
  temperature: 300,
  temperatureUnit: 'K',
  pressureUnit: 'atm',
});
assert(vdwGas.isValid, 'Van der Waals real gas calculation is valid');
assert(vdwGas.solvedValue > 0, 'Van der Waals pressure is computed and positive');

console.log('\n--- 13. Testing Thermochemistry & Calorimetry Engine ---');
// Hess's law for Methane combustion: CH4 + 2O2 -> CO2 + 2H2O
// deltaH° = (-393.51 + 2*(-285.83)) - (-74.87 + 0) = (-965.17) - (-74.87) = -890.30 kJ/mol
const thermoch = calculateThermochemistryEngine({
  mode: 'reaction_thermodynamics',
  reactionEquation: 'CH4 + 2O2 -> CO2 + 2H2O',
});
assert(thermoch.isValid, 'Thermochemistry reaction enthalpy calculation is valid');
assert(thermoch.isExothermic, 'CH4 combustion correctly flagged as exothermic');
assertClose(thermoch.deltaHReactionKJ, -890.3, 2.0, 'CH4 combustion deltaH ~ -890.3 kJ/mol');
assert(thermoch.deltaGReactionKJ < 0, 'Gibbs energy negative (spontaneous)');

// Calorimetry: q = m * c * deltaT: 100g water (c = 4.184 J/g°C), deltaT = 20°C -> q = 8368 J = 8.368 kJ
const calo = calculateThermochemistryEngine({
  mode: 'heat_capacity',
  substanceMassGrams: 100,
  specificHeatCapacity: 4.184,
  deltaTemperatureC: 20,
});
assert(calo.isValid, 'Calorimetry calculation is valid');
assertClose(calo.heatTransferredJoules || 0, 8368, 1.0, '100g water warmed by 20°C absorbs 8368 J');

console.log('\n--- 14. Testing Solubility Product (Ksp) Engine ---');
// AgCl: Ksp = 1.77e-10 -> s = sqrt(1.77e-10) ~ 1.33e-5 mol/L
const agclSol = calculateSolubilityEngine({
  mode: 'solubility_from_ksp',
  saltFormula: 'AgCl',
});
assert(agclSol.isValid, 'AgCl solubility calculation is valid');
assertClose(agclSol.molarSolubilityMolPerL, 1.33e-5, 1e-6, 'AgCl molar solubility ~ 1.33e-5 mol/L');
assert(agclSol.massSolubilityGPerL > 0, 'AgCl mass solubility in g/L is positive');

// Common ion effect: AgCl in 0.1 M NaCl -> [Cl-] = 0.1 M -> s' = 1.77e-10 / 0.1 = 1.77e-9 mol/L
const commonIonSol = calculateSolubilityEngine({
  mode: 'common_ion_effect',
  saltFormula: 'AgCl',
  commonIonMolarity: 0.1,
  commonIonType: 'anion',
});
assert(commonIonSol.isValid, 'Common ion effect calculation is valid');
assertClose(commonIonSol.molarSolubilityMolPerL, 1.77e-9, 1e-10, 'AgCl in 0.1 M Cl- has common-ion solubility ~ 1.77e-9 mol/L');

// Precipitation prediction: [Ag+] = 1e-4, [Cl-] = 1e-4 -> Q = 1e-8 > Ksp (1.77e-10) -> Precipitate forms!
const precip = calculateSolubilityEngine({
  mode: 'precipitate_check',
  saltFormula: 'AgCl',
  cationConcentrationM: 1e-4,
  anionConcentrationM: 1e-4,
});
assert(precip.isValid, 'Precipitation check calculation is valid');
assert(precip.willPrecipitate === true, 'Correctly predicts precipitation when Q > Ksp');

console.log('\n--- 15. Testing Chemical Formula Validation & Tokenization Engine ---');
import {
  validateChemicalFormula,
  formatChemicalFormula,
} from '../src/engines/chemistry/formulaParser';

// Valid formulas
const val1 = validateChemicalFormula('CuSO4·5H2O');
assert(val1.isValid, 'CuSO4·5H2O is recognized as a valid chemical formula');
assert(val1.counts['Cu'] === 1 && val1.counts['S'] === 1 && val1.counts['O'] === 9 && val1.counts['H'] === 10, 'CuSO4·5H2O correctly counts all atoms including hydrate water');

const valCoord = validateChemicalFormula('K4[Fe(CN)6]');
assert(valCoord.isValid, 'Coordination complex K4[Fe(CN)6] is recognized as valid');
assert(valCoord.counts['K'] === 4 && valCoord.counts['Fe'] === 1 && valCoord.counts['C'] === 6 && valCoord.counts['N'] === 6, 'K4[Fe(CN)6] correctly distributes bracket multiplier across C and N');

// Malformed / invalid formulas
const invUnclosed = validateChemicalFormula('Fe2(SO4');
assert(!invUnclosed.isValid, 'Fe2(SO4 correctly rejected due to unclosed bracket');
assert(invUnclosed.error?.includes('bracket') || invUnclosed.error?.includes('parenthes'), 'Clear error message provided for unclosed bracket');

const invLower = validateChemicalFormula('cacl2');
assert(!invLower.isValid, 'cacl2 correctly rejected due to lowercase chemical symbol');

const invChar = validateChemicalFormula('NaCl@3');
assert(!invChar.isValid, 'NaCl@3 correctly rejected due to invalid character @');

// Unicode formatting
const formattedWater = formatChemicalFormula('H2O');
assert(formattedWater === 'H₂O', 'H2O formatted with unicode subscript H₂O');

console.log('\n--- 16. Testing Chemical Equation Engine & Reaction Classifier ---');
import {
  parseChemicalEquation,
  classifyReactionType,
  verifyEquationBalancing,
} from '../src/engines/chemistry/equationEngine';

const parsedEq = parseChemicalEquation('2H2 + O2 -> 2H2O');
assert(parsedEq.reactants.length === 2, 'Parsed 2 reactants from 2H2 + O2');
assert(parsedEq.products.length === 1, 'Parsed 1 product from 2H2O');
assert(parsedEq.reactants[0].coefficient === 2 && parsedEq.reactants[0].formula === 'H2', 'First reactant is 2H2');
assert(parsedEq.reactants[1].coefficient === 1 && parsedEq.reactants[1].formula === 'O2', 'Second reactant is 1O2');
assert(parsedEq.products[0].coefficient === 2 && parsedEq.products[0].formula === 'H2O', 'Product is 2H2O');

const isBalancedWater = verifyEquationBalancing(parsedEq);
assert(isBalancedWater.isBalanced, '2H2 + O2 -> 2H2O verifies as balanced equation');

const typeCombustion = classifyReactionType(parsedEq);
assert(typeCombustion.category === 'Synthesis', '2H2 + O2 -> 2H2O classified as Synthesis');

const acidBaseEq = parseChemicalEquation('HCl + NaOH -> NaCl + H2O');
const typeAcidBase = classifyReactionType(acidBaseEq);
assert(typeAcidBase.category === 'Acid-Base Neutralization', 'HCl + NaOH -> NaCl + H2O classified as Acid-Base Neutralization');

const decompEq = parseChemicalEquation('2H2O2 -> 2H2O + O2');
const typeDecomp = classifyReactionType(decompEq);
assert(typeDecomp.category === 'Decomposition', '2H2O2 -> 2H2O + O2 classified as Decomposition');

console.log('\n--- 17. Testing Ion Engine & Stoichiometric Salt Synthesis ---');
import {
  COMMON_IONS_DATA,
  findIonById,
  findIonBySymbolOrFormula,
} from '../src/data/ionsData';
import {
  formIonicCompound,
  predictAqueousSolubility,
  verifyOxidationStateSum,
} from '../src/engines/chemistry/ionEngine';

assert(COMMON_IONS_DATA.length >= 25, 'Common ions database contains comprehensive catalog of ions');

const fe3Plus = findIonById('fe-3plus');
assert(fe3Plus !== undefined, 'Found Fe3+ ion in database');
assert(fe3Plus?.charge === 3 && fe3Plus?.oxidationStates[0].state === 3, 'Fe3+ has charge +3 and oxidation state +3');

const sulfate = findIonById('so4-2minus');
assert(sulfate !== undefined, 'Found SO4(2-) in database');
assert(sulfate?.charge === -2, 'Sulfate has charge -2');

// Verify oxidation state sum: S(+6) + 4 * O(-2) = 6 - 8 = -2
const sulfateOxCheck = sulfate ? verifyOxidationStateSum(sulfate) : null;
assert(sulfateOxCheck?.valid === true, 'Sulfate oxidation state sum matches formal charge of -2');

// Stoichiometric salt synthesis: Al3+ + SO4(2-) -> Al2(SO4)3
const al3Plus = findIonById('al-3plus')!;
const al2so43 = formIonicCompound(al3Plus, sulfate!);
assert(al2so43.cationCount === 2 && al2so43.anionCount === 3, 'Al3+ and SO4(2-) combine in 2:3 ratio');
assert(al2so43.formula === 'Al2(SO4)3', 'Plain formula is Al2(SO4)3');
assertClose(al2so43.molarMass, 342.15, 0.5, 'Al2(SO4)3 molar mass ~ 342.15 g/mol');

// Insoluble salt test: Ag+ + Cl- -> AgCl precipitate
const agPlus = findIonById('ag-plus')!;
const chloride = findIonById('cl-minus')!;
const agcl = formIonicCompound(agPlus, chloride);
assert(!agcl.isSoluble, 'AgCl predicted as insoluble precipitate');
assert(agcl.color?.toLowerCase().includes('white'), 'AgCl precipitate observation noted as white');

// Barium sulfate test: Ba2+ + SO4(2-) -> BaSO4 precipitate
const ba2Plus = findIonById('ba-2plus')!;
const baso4 = formIonicCompound(ba2Plus, sulfate!);
assert(!baso4.isSoluble, 'BaSO4 predicted as insoluble precipitate');

console.log('\n--- 18. Testing Molecule Engine & Computational Geometry ---');
import { MOLECULES_DATABASE } from '../src/data/moleculesData';
import {
  getMoleculeById,
  computeCentroid,
  computeBoundingRadius,
  calculateBondLength,
  calculateBondAngle,
  getCPKColor,
  getCovalentRadius,
  getVanDerWaalsRadius,
} from '../src/engines/chemistry/moleculeEngine';

assert(MOLECULES_DATABASE.length >= 10, 'Molecules database contains rich dataset of 3D/2D molecules');

const h2o = getMoleculeById('h2o');
assert(h2o !== undefined, 'H2O molecule retrieved by ID');
assert(h2o?.atoms.length === 3, 'H2O contains 3 atoms (1 oxygen, 2 hydrogens)');
assert(h2o?.bonds.length === 2, 'H2O contains 2 covalent bonds');
assert(h2o?.pointGroup === 'C2v', 'H2O symmetry point group is C2v');
assert(h2o?.isPolar === true && h2o?.dipoleMomentDebye > 1.5, 'H2O identified as polar with dipole moment ~ 1.85 D');

// Test geometric calculations on H2O
const centroid = computeCentroid(h2o!.atoms);
assert(typeof centroid[0] === 'number' && typeof centroid[1] === 'number' && typeof centroid[2] === 'number', 'Centroid calculated with numeric X, Y, Z');

const oxygen = h2o!.atoms.find((a) => a.element === 'O')!;
const h1 = h2o!.atoms.find((a) => a.id === 'H1')!;
const h2 = h2o!.atoms.find((a) => a.id === 'H2')!;

const ohDistance = calculateBondLength(oxygen, h1);
assertClose(ohDistance, 0.96, 0.05, 'O-H bond length in water ~ 0.96 Å');

const hohAngle = calculateBondAngle(h1, oxygen, h2);
assertClose(hohAngle, 104.5, 1.5, 'H-O-H bond angle in water ~ 104.5°');

// Test CPK colors & radii
assert(getCPKColor('H') === '#FFFFFF', 'Hydrogen CPK color is white #FFFFFF');
assert(getCPKColor('O') === '#EF4444', 'Oxygen CPK color is red');
assert(getCPKColor('C') === '#334155', 'Carbon CPK color is dark slate charcoal');
assert(getCovalentRadius('C') > getCovalentRadius('H'), 'Carbon covalent radius is larger than hydrogen');
assert(getVanDerWaalsRadius('Cl') > getVanDerWaalsRadius('F'), 'Chlorine Van der Waals radius is larger than fluorine');

console.log('\n--- 19. Testing Virtual Laboratory Simulation Engines & Registry ---');
import {
  simulationRegistry,
  TitrationSimulationEngine,
  CalorimetrySimulationEngine,
  KineticsSimulationEngine,
  GasLawLabEngine,
  SpectrophotometrySimulationEngine,
} from '../src/engines/simulation';

// Test 19.1: Registry Verification
const registeredExperiments = simulationRegistry.listExperiments();
assert(registeredExperiments.length === 5, `Simulation registry loaded 5 experiments (got ${registeredExperiments.length})`);

const expIds = registeredExperiments.map((e) => e.id);
assert(expIds.includes('acid-base-titration'), 'Registry includes acid-base titration');
assert(expIds.includes('solution-calorimetry'), 'Registry includes solution calorimetry');
assert(expIds.includes('chemical-kinetics'), 'Registry includes chemical kinetics');
assert(expIds.includes('gas-laws-pvt'), 'Registry includes gas laws PVT');
assert(expIds.includes('spectrophotometry-beer-lambert'), 'Registry includes spectrophotometry');

// Test 19.2: Titration Simulation Engine
const titrationEngine = new TitrationSimulationEngine();
const titrParams = {
  ...titrationEngine.metadata.paramDefinitions.reduce((acc, p) => ({ ...acc, [p.id]: p.defaultValue }), {} as any),
  analyteType: 'strong_acid_hcl',
  analyteConcentration: 0.1,
  analyteVolume: 25.0,
  titrantConcentration: 0.1,
  buretteCapacity: 50.0,
  dropRate: 0.5,
};
const initialTitrState = titrationEngine.getInitialState(titrParams);
assert(initialTitrState.simTime === 0 && !initialTitrState.isRunning, 'Initial titration state starts at t=0, paused');
assertClose(initialTitrState.currentPH, 1.0, 0.1, '0.1M strong acid initial pH ~ 1.0');

// Step titration with NaOH additions while running
let runningTitrState = { ...initialTitrState, isRunning: true };
let stepTitrState = titrationEngine.step(runningTitrState, titrParams, 2.0);
assert(stepTitrState.titrantAdded > 0, 'Titration step adds titrant volume over time');
assert(stepTitrState.dataPoints.length > 0, 'Data points recorded during titration step');

// Test 19.3: Calorimetry Simulation Engine
const calEngine = new CalorimetrySimulationEngine();
const calParams = calEngine.metadata.paramDefinitions.reduce((acc, p) => ({ ...acc, [p.id]: p.defaultValue }), {} as any);
const initialCalState = calEngine.getInitialState(calParams);
assertClose(initialCalState.currentTemp, 22.0, 0.1, 'Initial calorimeter temperature = 22.0 °C');
const steppedCal = calEngine.step({ ...initialCalState, isRunning: true, soluteAdded: true }, calParams, 2.0);
assert(steppedCal.simTime === 2.0, 'Calorimeter simTime advanced by dt');

// Test 19.4: Kinetics Simulation Engine
const kinEngine = new KineticsSimulationEngine();
const kinParams = kinEngine.metadata.paramDefinitions.reduce((acc, p) => ({ ...acc, [p.id]: p.defaultValue }), {} as any);
const initialKinState = kinEngine.getInitialState(kinParams);
assert(initialKinState.currentConcA > 0, 'Initial dye concentration is positive');
const steppedKin = kinEngine.step({ ...initialKinState, isRunning: true }, kinParams, 10.0);
assert(steppedKin.currentConcA < initialKinState.currentConcA, 'Reactant concentration decreases as reaction proceeds');
assert(steppedKin.reactionProgressPct > 0, 'Reaction progress percentage increases');

// Test 19.5: Gas Laws Simulation Engine
const gasEngine = new GasLawLabEngine();
const gasParams = gasEngine.metadata.paramDefinitions.reduce((acc, p) => ({ ...acc, [p.id]: p.defaultValue }), {} as any);
const initialGasState = gasEngine.getInitialState(gasParams);
assert(initialGasState.currentPressureKPa > 0 && initialGasState.currentVolumeL > 0, 'Gas laws engine computes non-zero initial pressure and volume');

// Test 19.6: Spectrophotometry Simulation Engine (Beer-Lambert Law)
const specEngine = new SpectrophotometrySimulationEngine();
const specParams = {
  solute: 'copper_sulfate' as const,
  selectedWavelengthNm: 635,
  pathLengthCm: 1.0,
  unknownSampleConcentration: 0.08,
};
const specState = specEngine.getInitialState(specParams);
assert(specState.currentAbsorbance === 0, 'Initial blank absorbance is 0.000');
const calibratedBlank = specEngine.handleAction(specState, { type: 'CALIBRATE_BLANK' }, specParams);
assert(calibratedBlank.isBlankCalibrated, 'Spectrophotometer calibrated with 100% T blank baseline');

// Measure standard solution #2 (0.05 M CuSO4 at 635 nm)
const sampleState = specEngine.handleAction(
  calibratedBlank,
  { type: 'MEASURE_STANDARD', payload: { standardIndex: 1 } },
  specParams
);
// A = epsilon * b * c: For CuSO4 at 635 nm, epsilon = 12.5, b = 1.0 cm, c = 0.05 M => A ~ 0.625
assertClose(sampleState.currentAbsorbance, 0.625, 0.05, 'Beer-Lambert absorbance calculated correctly');
assert(sampleState.currentTransmittancePct > 0 && sampleState.currentTransmittancePct < 100, 'Transmittance percentage is between 0% and 100%');

console.log('\n--- 20. Testing Materials Science Platform & Engineering Models ---');
const { MASTER_MATERIALS_DATA } = await import('../src/engines/materials/materialsData');
const {
  PROPERTY_DEFINITIONS,
  normalizePropertyScore,
  calculateAshbyMetrics,
  rankMaterialsByProperty,
} = await import('../src/engines/materials/propertyModel');

// 20.1 Material database validation
assert(MASTER_MATERIALS_DATA.length >= 20, `Materials database contains ${MASTER_MATERIALS_DATA.length} materials (>= 20 required)`);

const requiredCategories = [
  'metals',
  'alloys',
  'ceramics',
  'polymers',
  'composites',
  'semiconductors',
  'advanced materials',
];
const foundCategories = new Set(MASTER_MATERIALS_DATA.map((m) => m.category));
requiredCategories.forEach((cat) => {
  assert(foundCategories.has(cat as any), `Materials database supports category: ${cat}`);
});

// 20.2 Verification of all 10 core engineering properties on each material
let allPropertiesValid = true;
let allMarkedDemonstration = true;

for (const mat of MASTER_MATERIALS_DATA) {
  if (
    typeof mat.density !== 'number' || mat.density <= 0 ||
    typeof mat.hardness?.value !== 'number' || !mat.hardness?.scale ||
    typeof mat.tensileStrength !== 'number' || mat.tensileStrength <= 0 ||
    typeof mat.yieldStrength !== 'number' || mat.yieldStrength <= 0 ||
    typeof mat.elasticModulus !== 'number' || mat.elasticModulus <= 0 ||
    typeof mat.poissonRatio !== 'number' || mat.poissonRatio <= 0 || mat.poissonRatio >= 0.5 ||
    typeof mat.thermalConductivity !== 'number' || mat.thermalConductivity <= 0 ||
    typeof mat.meltingPoint !== 'number' || mat.meltingPoint <= 0 ||
    typeof mat.electricalConductivity !== 'number' || mat.electricalConductivity <= 0 ||
    !mat.corrosionResistance
  ) {
    allPropertiesValid = false;
    console.error(`Material ${mat.id} failed property validation`);
  }

  if (!mat.isDemonstration || !mat.dataSource) {
    allMarkedDemonstration = false;
  }
}
assert(allPropertiesValid, 'All materials contain all 10 core typed engineering properties with valid non-zero ranges');
assert(allMarkedDemonstration, 'All materials are explicitly marked with isDemonstration: true and valid reference dataSource');

// 20.3 Verification of Ashby selection metrics
const ti64 = MASTER_MATERIALS_DATA.find((m) => m.id === 'ti-6al-4v')!;
const ti64Ashby = calculateAshbyMetrics(ti64);
// Ti-6Al-4V: Yield = 880 MPa, Density = 4.43 g/cm3 => 880 / 4.43 ~ 198.6 kN*m/kg
assertClose(ti64Ashby.specificStrength, 198.6, 1.0, 'Ti-6Al-4V specific strength ~ 198.6 kN·m/kg');

const cfEpoxy = MASTER_MATERIALS_DATA.find((m) => m.id === 'cfrp-epoxy-hm')!;
const cfAshby = calculateAshbyMetrics(cfEpoxy);
// CFRP: Yield = 1600 MPa, Density = 1.55 g/cm3 => 1600 / 1.55 ~ 1032.2 kN*m/kg
assert(cfAshby.specificStrength > ti64Ashby.specificStrength, 'CFRP composite exhibits higher specific strength than Ti-6Al-4V titanium alloy');

// 20.4 Verification of Property Ranking
const rankedByYield = rankMaterialsByProperty(MASTER_MATERIALS_DATA, 'yieldStrength', 'desc');
assert(rankedByYield.length === MASTER_MATERIALS_DATA.length, 'Ranked list includes all materials');
assert(rankedByYield[0].value >= rankedByYield[1].value, 'Ranked list correctly ordered descending by yield strength');

// 20.5 Verification of Normalization scores
const scoreTiYield = normalizePropertyScore(ti64, 'yieldStrength');
assert(scoreTiYield >= 0 && scoreTiYield <= 100, 'Normalized property score is bounded within [0, 100]');

console.log('\n--- 21. Testing Crystallography Engine (SC, BCC, FCC, HCP) ---');
import {
  calculateCrystalMetrics,
  getAtomicCoordinates,
} from '../src/engines/materials/crystallographyEngine';

// 21.1 Simple Cubic (SC)
const scMetrics = calculateCrystalMetrics('sc', 3.359, 209.0); // Polonium
assert(scMetrics.atomsPerUnitCell === 1, 'SC has 1 atom per unit cell');
assert(scMetrics.coordinationNumber === 6, 'SC coordination number = 6');
assertClose(scMetrics.atomicPackingFactor, 0.524, 0.005, 'SC APF = 0.524 (52.4%)');
assertClose(scMetrics.atomicRadiusR, 1.6795, 0.01, 'SC R = a / 2');

// 21.2 Body-Centered Cubic (BCC)
const bccMetrics = calculateCrystalMetrics('bcc', 2.866, 55.845); // alpha-Iron
assert(bccMetrics.atomsPerUnitCell === 2, 'BCC has 2 atoms per unit cell');
assert(bccMetrics.coordinationNumber === 8, 'BCC coordination number = 8');
assertClose(bccMetrics.atomicPackingFactor, 0.68, 0.005, 'BCC APF = 0.68 (68.0%)');
assertClose(bccMetrics.atomicRadiusR, 1.241, 0.01, 'BCC R = a * sqrt(3) / 4');
assertClose(bccMetrics.theoreticalDensityGramsPerCm3, 7.88, 0.05, 'BCC Ferrite theoretical density ~ 7.88 g/cm³');

// 21.3 Face-Centered Cubic (FCC)
const fccMetrics = calculateCrystalMetrics('fcc', 3.615, 63.546); // Copper
assert(fccMetrics.atomsPerUnitCell === 4, 'FCC has 4 atoms per unit cell');
assert(fccMetrics.coordinationNumber === 12, 'FCC coordination number = 12');
assertClose(fccMetrics.atomicPackingFactor, 0.74, 0.005, 'FCC APF = 0.74 (74.0%)');
assertClose(fccMetrics.atomicRadiusR, 1.278, 0.01, 'FCC R = a / (2 * sqrt(2))');
assertClose(fccMetrics.theoreticalDensityGramsPerCm3, 8.93, 0.05, 'FCC Copper theoretical density ~ 8.93 g/cm³');

// 21.4 Hexagonal Close-Packed (HCP)
const hcpMetrics = calculateCrystalMetrics('hcp', 2.951, 47.867); // alpha-Titanium
assert(hcpMetrics.atomsPerUnitCell === 6, 'HCP has 6 atoms per unit cell');
assert(hcpMetrics.coordinationNumber === 12, 'HCP coordination number = 12');
assertClose(hcpMetrics.atomicPackingFactor, 0.74, 0.005, 'HCP APF = 0.74 (74.0%)');
assertClose(hcpMetrics.latticeParamC!, 4.819, 0.05, 'HCP ideal c/a ratio = 1.633');

// 21.5 Atomic coordinate generation for 3D visualizers
const scCoords = getAtomicCoordinates('sc');
assert(scCoords.length === 8, 'SC returns 8 corner coordinate sites');
const bccCoords = getAtomicCoordinates('bcc');
assert(bccCoords.length === 9, 'BCC returns 8 corners + 1 body-center site');
const fccCoords = getAtomicCoordinates('fcc');
assert(fccCoords.length === 14, 'FCC returns 8 corners + 6 face-center sites');

console.log('\n--- 22. Testing Binary Phase Diagram & Lever Rule Engine ---');
import {
  CU_NI_SYSTEM,
  PB_SN_SYSTEM,
  FE_C_SYSTEM,
  AL_SI_SYSTEM,
  AVAILABLE_PHASE_SYSTEMS,
  evaluatePhaseState,
  calculateLeverRule,
} from '../src/engines/materials/phaseDiagramEngine';

assert(AVAILABLE_PHASE_SYSTEMS.length >= 4, 'At least 4 binary phase systems supported (Cu-Ni, Pb-Sn, Fe-C, Al-Si)');

// 22.1 Cu-Ni Isomorphous System Evaluation
// At 1400°C and 20 wt% Ni -> Liquid
const cuNiLiquid = evaluatePhaseState(CU_NI_SYSTEM, 20, 1400);
assert(cuNiLiquid.activeRegion.id === 'liquid', 'Cu-Ni at 20 wt% Ni, 1400°C is pure Liquid');
assert(!cuNiLiquid.isTwoPhase, 'Pure liquid is single-phase');

// At 1250°C and 40 wt% Ni -> Two-phase (alpha + L)
const cuNiTwoPhase = evaluatePhaseState(CU_NI_SYSTEM, 40, 1250);
assert(cuNiTwoPhase.isTwoPhase, 'Cu-Ni at 40 wt% Ni, 1250°C is in two-phase region (α + L)');
assert(cuNiTwoPhase.tieLine !== undefined, 'Tie-line computed for two-phase region');
if (cuNiTwoPhase.tieLine) {
  assert(cuNiTwoPhase.tieLine.leftComposition < 40, 'Liquid composition is to the left (lower Ni)');
  assert(cuNiTwoPhase.tieLine.rightComposition > 40, 'Solid alpha composition is to the right (higher Ni)');
  assertClose(
    cuNiTwoPhase.tieLine.leftPhaseFraction + cuNiTwoPhase.tieLine.rightPhaseFraction,
    1.0,
    0.001,
    'Mass fractions of left and right phases sum to 1.0 (100%)'
  );
}

// 22.2 Lever Rule Pure Function Verification
// Target: X0 = 40%, C_L = 32%, C_alpha = 50%
// W_L = (50 - 40) / (50 - 32) = 10 / 18 = 0.556 (55.6%)
// W_alpha = (40 - 32) / (50 - 32) = 8 / 18 = 0.444 (44.4%)
const manualLever = calculateLeverRule(1250, 40, 'Liquid', 32, 'α', 50);
assertClose(manualLever.leftPhaseFraction, 0.556, 0.005, 'Lever rule computes 55.6% Liquid');
assertClose(manualLever.rightPhaseFraction, 0.444, 0.005, 'Lever rule computes 44.4% α solid');

// 22.3 Pb-Sn Eutectic System & Invariant Point
const pbSnEutecticPt = PB_SN_SYSTEM.invariantPoints.find((p) => p.type === 'eutectic');
assert(pbSnEutecticPt !== undefined, 'Pb-Sn defines an invariant eutectic reaction point');
assertClose(pbSnEutecticPt!.temperature, 183, 1.0, 'Pb-Sn eutectic temperature = 183°C');
assertClose(pbSnEutecticPt!.composition, 61.9, 0.5, 'Pb-Sn eutectic composition = 61.9 wt% Sn');

// 22.4 Demonstration Data Integrity
let allSystemsMarked = true;
for (const sys of AVAILABLE_PHASE_SYSTEMS) {
  if (!sys.isDemonstration || !sys.dataSource) {
    allSystemsMarked = false;
  }
}
assert(allSystemsMarked, 'All binary phase systems are explicitly flagged with isDemonstration: true and valid dataSource citations');

console.log('\n--- 23. Testing XRD Laboratory & Analysis Foundation ---');
import {
  calculateTwoThetaFromDSpacing,
  calculateScherrerCrystalliteSize,
  computeSamplePeaksForWavelength,
  generateDiffractogramScan,
  getXRDPatternByMaterial,
} from '../src/engines/materials/xrdEngine';

// 23.1 Bragg relationship & d-spacing for Cu (111) reflection
// Cu (111) has d = 2.087 Å. For Cu-Kα (λ = 1.54060 Å):
// sin(θ) = 1.54060 / (2 * 2.087) = 0.3691 => θ = 21.657° => 2θ = 43.31°
const cuTwoTheta = calculateTwoThetaFromDSpacing(2.087, 1.54060);
assertClose(cuTwoTheta || 0, 43.31, 0.05, 'Cu (111) Bragg angle under Cu-Kα ~ 43.31°');

// For Mo-Kα (λ = 0.71073 Å):
// sin(θ) = 0.71073 / (2 * 2.087) = 0.17028 => θ = 9.803° => 2θ = 19.61°
const cuMoTwoTheta = calculateTwoThetaFromDSpacing(2.087, 0.71073);
assertClose(cuMoTwoTheta || 0, 19.61, 0.05, 'Cu (111) Bragg angle compresses to ~19.61° under Mo-Kα');
assert((cuMoTwoTheta || 0) < (cuTwoTheta || 0), 'Shorter wavelength shifts diffraction peaks to lower 2θ angles');

// 23.2 Geometric extinction cutoff test
// When λ > 2d, sin(θ) > 1 which is physically impossible (no reflection observable)
const extinguished = calculateTwoThetaFromDSpacing(1.0, 2.5); // λ = 2.5 Å > 2 * 1.0 Å
assert(extinguished === null, 'Reflection correctly extinguished when λ > 2d (sin θ > 1)');

// 23.3 Scherrer Crystallite Size Estimation
// For 2θ = 43.3°, FWHM = 0.25°, λ = 1.5406 Å, K = 0.90, instrumental broadening = 0.08°:
// β_sample = sqrt(0.25^2 - 0.08^2) = sqrt(0.0625 - 0.0064) = sqrt(0.0561) = 0.23686°
// β_rad = 0.23686 * π / 180 = 0.004134 rad
// θ = 21.65°, cos(θ) = 0.9294
// D = (0.90 * 1.5406 Å) / (0.004134 * 0.9294) = 1.38654 / 0.003842 = 360.8 Å = 36.1 nm
const scherrerTest = calculateScherrerCrystalliteSize(43.3, 0.25, 1.54060, 0.90, 0.08);
assert(scherrerTest.crystalliteSizeNm > 30 && scherrerTest.crystalliteSizeNm < 42, `Scherrer crystallite size ~ 36 nm (got ${scherrerTest.crystalliteSizeNm} nm)`);
assert(scherrerTest.assumptions.length >= 3, 'Scherrer calculation outputs explicit physical assumptions');
assert(scherrerTest.limitations.length >= 3, 'Scherrer calculation outputs explicit physical limitations');

// 23.4 Multi-wavelength peak position recomputation
const ti64Xrd = getXRDPatternByMaterial('ti-6al-4v')!;
assert(ti64Xrd !== undefined, 'Ti-6Al-4V sample retrieved from dataset');
const tiPeaksCu = computeSamplePeaksForWavelength(ti64Xrd, XRD_SOURCES['cu-ka'].wavelengthAngstrom);
const tiPeaksMo = computeSamplePeaksForWavelength(ti64Xrd, XRD_SOURCES['mo-ka'].wavelengthAngstrom);
assert(tiPeaksCu.length === ti64Xrd.peaks.length, 'All sample reflections indexed for Cu-Kα');
assert(tiPeaksMo.length === ti64Xrd.peaks.length, 'All sample reflections indexed for Mo-Kα');
assert(tiPeaksMo[0].twoThetaDeg < tiPeaksCu[0].twoThetaDeg, 'Mo-Kα peak 1 angle is lower than Cu-Kα');

// 23.5 Continuous scan generation & profile synthesis
const scanSim = generateDiffractogramScan({
  sampleData: ti64Xrd,
  lambdaAngstrom: 1.54060,
  minTwoTheta: 20,
  maxTwoTheta: 80,
  stepSize: 0.1,
});
assert(scanSim.points.length > 500, `Diffractogram scan generated ${scanSim.points.length} continuous data points`);
assert(scanSim.maxIntensity >= 100, 'Diffractogram normalized maximum intensity reaches at least 100%');
assert(scanSim.peaks.every((p) => p.dSpacingAngstrom > 0), 'All indexed peaks have positive interplanar d-spacings');

console.log('\n--- 24. Testing Corrosion Science & Degradation Engine ---');
const {
  CORROSION_ALLOYS,
  CORROSION_ENVIRONMENTS,
  CORROSION_MECHANISMS,
  evaluateGalvanicPair,
  generateTemperatureCorrosionTrend,
} = await import('../src/engines/materials/corrosionEngine');

// 24.1 PREN Calculation
// PREN for 316L (17% Cr, 2.2% Mo, 0.04% N): 17 + 3.3 * 2.2 + 16 * 0.04 = 17 + 7.26 + 0.64 = 24.9
const prenCheck316L = calculatePREN(17.0, 2.2, 0.04, 0, 'AISI 316L');
assertClose(prenCheck316L.prenValue, 24.9, 0.1, '316L PREN ~ 24.9');
assert(prenCheck316L.resistanceClass === 'Resistant (Marine Service)', '316L classified as Resistant (Marine Service)');

// PREN for 2507 Super Duplex (25% Cr, 4.0% Mo, 0.28% N): 25 + 3.3 * 4 + 16 * 0.28 = 25 + 13.2 + 4.48 = 42.68
const prenCheck2507 = calculatePREN(25.0, 4.0, 0.28, 0, '2507 Super Duplex');
assert(prenCheck2507.prenValue > 40, '2507 Super Duplex PREN exceeds 40');
assert(prenCheck2507.resistanceClass === 'Critical Pitting Resistant', '2507 classified as Critical Pitting Resistant');

// 24.2 Faraday's Law Corrosion Rate
// Carbon steel in active acid: i_corr = 100 µA/cm², EW = 27.92, rho = 7.85 g/cm³
// CR = 0.00327 * (100 * 27.92) / 7.85 = 1.163 mm/year
const rateTest = calculateFaradayCorrosionRate(100, 27.92, 7.85);
assertClose(rateTest.rateMmPerYear, 1.163, 0.05, 'Faraday CR for active steel ~ 1.16 mm/yr');
assert(rateTest.severity === 'Catastrophic', 'CR > 1.0 mm/yr classified as Catastrophic');
assert(rateTest.rateMpy > 40, 'Rate in mils per year (mpy) corresponds correctly');

// 24.3 Galvanic Pairing Evaluation
// Carbon steel (-0.65 V) paired with AISI 316L (-0.05 V) => ΔV = 0.60 V (Severe)
const galvanicTest = evaluateGalvanicPair('carbon-steel-1018', 'ss-316l', 0.1);
assert(galvanicTest !== null, 'Galvanic pair evaluated successfully');
assert(galvanicTest?.anodicAlloy.id === 'carbon-steel-1018', 'Carbon steel correctly identified as anode (less noble)');
assert(galvanicTest?.cathodicAlloy.id === 'ss-316l', 'Stainless 316L correctly identified as cathode');
assert(galvanicTest?.riskLevel === 'Severe (> 0.30 V)', 'Large potential difference classified as Severe risk');

// 24.4 Temperature Arrhenius Trend
const tempTrend = generateTemperatureCorrosionTrend(0.1, 35, 20, 80, 7);
assert(tempTrend.length === 7, 'Generated 7 temperature trend points');
assert(tempTrend[tempTrend.length - 1].corrosionRateMmPerYear > tempTrend[0].corrosionRateMmPerYear, 'Corrosion rate increases monotonically with temperature');

// 24.5 Catalogs check
assert(Object.keys(CORROSION_ALLOYS).length >= 8, 'Corrosion alloy catalog contains at least 8 engineering alloys');
assert(Object.keys(CORROSION_ENVIRONMENTS).length >= 5, 'Corrosion environment catalog contains at least 5 environments');
assert(Object.keys(CORROSION_MECHANISMS).length >= 6, 'Corrosion mechanism catalog contains at least 6 core degradation modes');

console.log('\n--- 25. Testing Non-Destructive Testing (NDT) Engine ---');
const {
  NDT_METHODS,
  calculateUltrasonicVelocities: calcUTVelocities,
  calculateUltrasonicWavelength: calcUTWavelength,
  calculateRadiographicExposure,
  calculateEddyCurrentSkinDepth,
} = await import('../src/engines/materials/ndtEngine');

// 25.1 NDT Method Coverage
const ndtKeys = ['VT', 'PT', 'MT', 'UT', 'RT', 'ET'];
ndtKeys.forEach((key) => {
  const method = NDT_METHODS[key as any];
  assert(method !== undefined, `NDT method ${key} exists in database`);
  assert(method.equipmentConcepts.length >= 2, `${key} contains at least 2 equipment concepts`);
  assert(method.indicationExamples.length >= 2, `${key} contains at least 2 indication examples`);
  assert(method.safetyGuidelines.length >= 2, `${key} contains safety-oriented guidelines`);
  assert(method.referenceCodes.length >= 2, `${key} cites actual published standards`);
});

// 25.2 Ultrasonic Velocities
// Steel: E = 210 GPa, rho = 7.85 g/cm³ = 7850 kg/m³, nu = 0.30
// v_L = sqrt( (210e9 * 0.70) / (7850 * 1.30 * 0.40) ) = sqrt( 147e9 / 4082 ) = sqrt(36011758) = 6000 m/s
const utVelSteel = calcUTVelocities(210, 7.85, 0.30, 'Structural Carbon Steel');
assert(utVelSteel.longitudinalVelocityMS > 5800 && utVelSteel.longitudinalVelocityMS < 6100, `Steel longitudinal velocity ~ 5950-6000 m/s (got ${utVelSteel.longitudinalVelocityMS} m/s)`);
assert(utVelSteel.shearVelocityMS > 3100 && utVelSteel.shearVelocityMS < 3300, `Steel shear velocity ~ 3200 m/s (got ${utVelSteel.shearVelocityMS} m/s)`);
assert(utVelSteel.acousticImpedanceMRayl > 40, 'Steel acoustic impedance is ~ 45 MRayl');

// 25.3 Ultrasonic Probe Wavelength & Near Field
// 5 MHz probe in steel (v = 5950 m/s), diameter D = 10 mm
// lambda = 5950 / 5e6 = 0.00119 m = 1.19 mm
// N = D^2 / (4 * lambda) = 100 / (4 * 1.19) = 21.0 mm
const utProbe = calcUTWavelength(5950, 5.0, 10.0);
assertClose(utProbe.wavelengthMm, 1.19, 0.05, '5 MHz wavelength in steel ~ 1.19 mm');
assert(utProbe.nearFieldDistanceMm! > 18 && utProbe.nearFieldDistanceMm! < 24, `Near field distance ~ 21 mm (got ${utProbe.nearFieldDistanceMm} mm)`);
assert(typeof utProbe.halfBeamSpreadDeg === 'number', 'Half beam spread angle calculated');

// 25.4 Radiographic Attenuation & Geometric Unsharpness
// Initial 100 R/h, mu = 0.5 cm^-1, thickness = 2.0 cm
// I = 100 * exp(-0.5 * 2) = 100 * exp(-1) = 36.788 R/h
// HVL = ln(2) / 0.5 = 1.386 cm
// Ug = 2.0 mm * 2.5 cm / (70 - 2.5 cm) = 5.0 / 67.5 = 0.074 mm
const rtExposure = calculateRadiographicExposure(100, 0.5, 2.0, 2.0, 70, 2.5);
assertClose(rtExposure.transmittedIntensity, 36.788, 0.05, 'Beer-Lambert transmitted intensity ~ 36.79 R/h');
assertClose(rtExposure.halfValueLayerCm, 1.386, 0.02, 'Half-Value Layer HVL ~ 1.386 cm');
assert(rtExposure.geometricUnsharpnessMm < 0.15, 'Geometric unsharpness Ug < 0.15 mm meets code threshold');

// 25.5 Eddy Current Skin Depth
// Aluminum 6061-T6: conductivity ~ 25 MS/m, relative permeability = 1.0, f = 100 kHz (100,000 Hz)
// delta = 1 / sqrt(pi * 100000 * 4*pi*1e-7 * 25e6) = 1 / sqrt(9.869e6) = 1 / 3141.5 = 0.000318 m = 0.318 mm
const etSkinDepth = calculateEddyCurrentSkinDepth(100000, 25, 1.0);
assertClose(etSkinDepth.standardSkinDepthMm, 0.318, 0.02, 'Eddy current skin depth for Al at 100 kHz ~ 0.32 mm');
assert(etSkinDepth.effectivePenetrationDepthMm > etSkinDepth.standardSkinDepthMm, 'Effective 3-delta penetration depth is greater than 1-delta skin depth');

console.log(`\n========================================`);
console.log(`TEST RESULTS: ${passed} Passed, ${failed} Failed`);
console.log(`========================================`);

if (failed > 0) {
  process.exit(1);
}
