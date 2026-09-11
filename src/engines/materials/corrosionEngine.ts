// Corrosion Science & Degradation Calculation Engine
// Provides educational models, galvanic series, environmental comparisons, and Faraday's law rate solvers.

export interface AlloyCorrosionProfile {
  id: string;
  name: string;
  category: 'Stainless Steel' | 'Carbon Steel' | 'Nickel Alloy' | 'Titanium Alloy' | 'Aluminum Alloy' | 'Copper Alloy';
  composition: {
    cr?: number;
    ni?: number;
    mo?: number;
    n?: number;
    w?: number;
    cu?: number;
    fe?: number;
    ti?: number;
    al?: number;
    c?: number;
    o?: number;
    mg?: number;
    [key: string]: number | undefined;
  };
  densityGramsPerCm3: number;
  equivalentWeightGrams: number;
  standardPotentialVSCE: number; // Potential in flowing seawater (V vs Saturated Calomel Electrode)
  passivating: boolean;
  baseCorrosionRatesMmPerYear: Record<string, number>; // baseline uniform rate per environment
  pittingSusceptibility: 'Extremely Low' | 'Low' | 'Moderate' | 'High' | 'Severe';
  sccSusceptibility: 'Immune' | 'Low' | 'Moderate in Hot Chlorides' | 'High in Chlorides' | 'Susceptible in Ammonia';
}

export interface CorrosionEnvironment {
  id: string;
  name: string;
  description: string;
  phRange: [number, number];
  typicalChloridePpm: number;
  aerationLevel: 'High' | 'Moderate' | 'Deaerated';
  corrosivenessIndex: number; // 1 to 10 scale
}

export interface PRENResult {
  alloyName: string;
  crPercentage: number;
  moPercentage: number;
  nPercentage: number;
  wPercentage?: number;
  prenValue: number;
  resistanceClass: 'Standard Pitting' | 'Resistant (Marine Service)' | 'Super-Austenitic / Super-Duplex' | 'Critical Pitting Resistant';
}

export interface CorrosionRateResult {
  corrosionCurrentDensityMicroA: number; // µA/cm²
  equivalentWeightGrams: number; // EW (g/eq)
  densityGramsPerCm3: number; // g/cm³
  rateMmPerYear: number;
  rateMpy: number; // mils per year
  severity: 'Negligible' | 'Mild' | 'Moderate' | 'Severe' | 'Catastrophic';
  faradayConstantC: number;
}

export interface GalvanicPairResult {
  anodicAlloy: AlloyCorrosionProfile;
  cathodicAlloy: AlloyCorrosionProfile;
  anodeMaterial?: AlloyCorrosionProfile;
  cathodeMaterial?: AlloyCorrosionProfile;
  potentialDifferenceVolts: number;
  potentialDifferenceV?: number;
  riskLevel: 'Negligible (< 0.15 V)' | 'Moderate (0.15 - 0.30 V)' | 'Severe (> 0.30 V)';
  areaRatioEffect: string;
  recommendation: string;
}

export interface TemperatureCorrosionPoint {
  temperatureC: number;
  corrosionRateMmPerYear: number;
  arrheniusRateFactor: number;
}

// Comprehensive engineering alloy corrosion database
export const CORROSION_ALLOYS: Record<string, AlloyCorrosionProfile> = {
  'ss-304': {
    id: 'ss-304',
    name: 'AISI 304 (1.4301)',
    category: 'Stainless Steel',
    composition: { cr: 18.2, ni: 8.5, fe: 70.5, c: 0.05 },
    densityGramsPerCm3: 7.93,
    equivalentWeightGrams: 25.1,
    standardPotentialVSCE: -0.08, // Passive state
    passivating: true,
    baseCorrosionRatesMmPerYear: {
      marine: 0.045,
      industrial: 0.008,
      acidic: 0.65,
      caustic: 0.015,
      geothermal: 0.38,
      deaerated: 0.001,
    },
    pittingSusceptibility: 'Moderate',
    sccSusceptibility: 'High in Chlorides',
  },
  'ss-316l': {
    id: 'ss-316l',
    name: 'AISI 316L (1.4404)',
    category: 'Stainless Steel',
    composition: { cr: 17.0, ni: 12.0, mo: 2.2, fe: 65.5, n: 0.04 },
    densityGramsPerCm3: 8.0,
    equivalentWeightGrams: 25.5,
    standardPotentialVSCE: -0.05,
    passivating: true,
    baseCorrosionRatesMmPerYear: {
      marine: 0.012,
      industrial: 0.003,
      acidic: 0.18,
      caustic: 0.008,
      geothermal: 0.15,
      deaerated: 0.001,
    },
    pittingSusceptibility: 'Low',
    sccSusceptibility: 'Moderate in Hot Chlorides',
  },
  'duplex-2205': {
    id: 'duplex-2205',
    name: '2205 Duplex (UNS S32205)',
    category: 'Stainless Steel',
    composition: { cr: 22.5, ni: 5.5, mo: 3.1, n: 0.18, fe: 68.0 },
    densityGramsPerCm3: 7.8,
    equivalentWeightGrams: 25.2,
    standardPotentialVSCE: 0.02,
    passivating: true,
    baseCorrosionRatesMmPerYear: {
      marine: 0.002,
      industrial: 0.001,
      acidic: 0.06,
      caustic: 0.003,
      geothermal: 0.04,
      deaerated: 0.0005,
    },
    pittingSusceptibility: 'Extremely Low',
    sccSusceptibility: 'Low',
  },
  'superduplex-2507': {
    id: 'superduplex-2507',
    name: '2507 Super Duplex (UNS S32750)',
    category: 'Stainless Steel',
    composition: { cr: 25.0, ni: 7.0, mo: 4.0, n: 0.28, fe: 63.5 },
    densityGramsPerCm3: 7.8,
    equivalentWeightGrams: 25.0,
    standardPotentialVSCE: 0.08,
    passivating: true,
    baseCorrosionRatesMmPerYear: {
      marine: 0.0008,
      industrial: 0.0004,
      acidic: 0.02,
      caustic: 0.001,
      geothermal: 0.015,
      deaerated: 0.0002,
    },
    pittingSusceptibility: 'Extremely Low',
    sccSusceptibility: 'Immune',
  },
  'carbon-steel-1018': {
    id: 'carbon-steel-1018',
    name: 'Carbon Steel (AISI 1018)',
    category: 'Carbon Steel',
    composition: { fe: 98.8, c: 0.18, mn: 0.8 },
    densityGramsPerCm3: 7.85,
    equivalentWeightGrams: 27.92,
    standardPotentialVSCE: -0.65, // Highly active
    passivating: false,
    baseCorrosionRatesMmPerYear: {
      marine: 0.28,
      industrial: 0.09,
      acidic: 2.85,
      caustic: 0.04,
      geothermal: 1.65,
      deaerated: 0.008,
    },
    pittingSusceptibility: 'Severe',
    sccSusceptibility: 'Low',
  },
  'inconel-625': {
    id: 'inconel-625',
    name: 'Inconel 625 (UNS N06625)',
    category: 'Nickel Alloy',
    composition: { ni: 61.0, cr: 21.5, mo: 9.0, fe: 4.0 },
    densityGramsPerCm3: 8.44,
    equivalentWeightGrams: 26.8,
    standardPotentialVSCE: 0.10,
    passivating: true,
    baseCorrosionRatesMmPerYear: {
      marine: 0.0002,
      industrial: 0.0001,
      acidic: 0.008,
      caustic: 0.0005,
      geothermal: 0.005,
      deaerated: 0.0001,
    },
    pittingSusceptibility: 'Extremely Low',
    sccSusceptibility: 'Immune',
  },
  'hastelloy-c276': {
    id: 'hastelloy-c276',
    name: 'Hastelloy C-276 (UNS N10276)',
    category: 'Nickel Alloy',
    composition: { ni: 57.0, mo: 16.0, cr: 15.5, fe: 5.5, w: 3.8 },
    densityGramsPerCm3: 8.89,
    equivalentWeightGrams: 28.5,
    standardPotentialVSCE: 0.15,
    passivating: true,
    baseCorrosionRatesMmPerYear: {
      marine: 0.0001,
      industrial: 0.0001,
      acidic: 0.003,
      caustic: 0.0002,
      geothermal: 0.002,
      deaerated: 0.00005,
    },
    pittingSusceptibility: 'Extremely Low',
    sccSusceptibility: 'Immune',
  },
  'ti-grade-2': {
    id: 'ti-grade-2',
    name: 'CP-Titanium Grade 2',
    category: 'Titanium Alloy',
    composition: { ti: 99.2, o: 0.18, fe: 0.2 },
    densityGramsPerCm3: 4.51,
    equivalentWeightGrams: 11.98,
    standardPotentialVSCE: 0.12,
    passivating: true,
    baseCorrosionRatesMmPerYear: {
      marine: 0.0001,
      industrial: 0.0001,
      acidic: 0.015,
      caustic: 0.0002,
      geothermal: 0.001,
      deaerated: 0.00005,
    },
    pittingSusceptibility: 'Extremely Low',
    sccSusceptibility: 'Immune',
  },
  'al-6061': {
    id: 'al-6061',
    name: 'Aluminum 6061-T6',
    category: 'Aluminum Alloy',
    composition: { al: 97.0, mg: 1.0, si: 0.6, cu: 0.28, cr: 0.2 },
    densityGramsPerCm3: 2.7,
    equivalentWeightGrams: 8.99,
    standardPotentialVSCE: -0.79,
    passivating: true,
    baseCorrosionRatesMmPerYear: {
      marine: 0.12,
      industrial: 0.025,
      acidic: 1.95,
      caustic: 3.4,
      geothermal: 1.2,
      deaerated: 0.004,
    },
    pittingSusceptibility: 'High',
    sccSusceptibility: 'Moderate in Hot Chlorides',
  },
  'cuni-90-10': {
    id: 'cuni-90-10',
    name: 'Copper-Nickel 90/10 (C70600)',
    category: 'Copper Alloy',
    composition: { cu: 88.5, ni: 10.0, fe: 1.5 },
    densityGramsPerCm3: 8.94,
    equivalentWeightGrams: 31.7,
    standardPotentialVSCE: -0.22,
    passivating: true,
    baseCorrosionRatesMmPerYear: {
      marine: 0.025,
      industrial: 0.005,
      acidic: 0.45,
      caustic: 0.02,
      geothermal: 0.18,
      deaerated: 0.002,
    },
    pittingSusceptibility: 'Low',
    sccSusceptibility: 'Immune',
  },
};

// Corrosion environments
export const CORROSION_ENVIRONMENTS: Record<string, CorrosionEnvironment> = {
  marine: {
    id: 'marine',
    name: 'Marine & Seawater Service',
    description: '3.5% NaCl, aerated natural seawater at 25°C. High chloride conductivity inducing pitting and crevice breakdown.',
    phRange: [7.8, 8.4],
    typicalChloridePpm: 19500,
    aerationLevel: 'High',
    corrosivenessIndex: 7,
  },
  industrial: {
    id: 'industrial',
    name: 'Urban & Industrial Atmosphere',
    description: 'Sulfur dioxide (SO₂), nitrogen oxides, atmospheric humidity, and airborne dust particles.',
    phRange: [4.5, 6.5],
    typicalChloridePpm: 150,
    aerationLevel: 'High',
    corrosivenessIndex: 4,
  },
  acidic: {
    id: 'acidic',
    name: 'Dilute Acid Chemical Service',
    description: '0.1M hydrochloric/sulfuric acid mixture (pH ~ 2.0). Active dissolution with hydrogen evolution cathode reaction.',
    phRange: [1.5, 3.0],
    typicalChloridePpm: 3500,
    aerationLevel: 'Moderate',
    corrosivenessIndex: 9,
  },
  caustic: {
    id: 'caustic',
    name: 'Alkaline & Caustic Service',
    description: '10% NaOH alkaline stream (pH 12–13). Attack on amphoteric metals like aluminum, passivating for steels.',
    phRange: [11.0, 13.5],
    typicalChloridePpm: 80,
    aerationLevel: 'Moderate',
    corrosivenessIndex: 5,
  },
  geothermal: {
    id: 'geothermal',
    name: 'High-Temperature Geothermal Brine',
    description: 'Hot mineralized brine at 95°C containing dissolved H₂S, CO₂, and chlorides under elevated pressure.',
    phRange: [5.0, 6.5],
    typicalChloridePpm: 25000,
    aerationLevel: 'Deaerated',
    corrosivenessIndex: 8,
  },
  deaerated: {
    id: 'deaerated',
    name: 'Deaerated High-Purity Boiler Water',
    description: 'Treated feedwater with oxygen scavenging (< 5 ppb O₂). Passive reduction of general corrosion rate.',
    phRange: [9.0, 9.6],
    typicalChloridePpm: 2,
    aerationLevel: 'Deaerated',
    corrosivenessIndex: 1,
  },
};

// Corrosion Mechanisms Catalog
export interface CorrosionMechanismInfo {
  id: string;
  name: string;
  category: 'General' | 'Localized' | 'Metallurgically-Influenced' | 'Environmentally-Assisted' | 'Flow-Assisted';
  mechanismSummary: string;
  anodicReaction: string;
  cathodicReaction: string;
  criticalFactors: string[];
  mitigationStrategies: string[];
  schematicType: 'uniform' | 'galvanic' | 'pitting' | 'crevice' | 'intergranular' | 'scc';
}

export const CORROSION_MECHANISMS: Record<string, CorrosionMechanismInfo> = {
  uniform: {
    id: 'uniform',
    name: 'Uniform / General Attack',
    category: 'General',
    mechanismSummary: 'Evenly distributed electrochemical dissolution over the entire exposed metal surface, governed by mixed potential theory and electron transfer equilibrium.',
    anodicReaction: 'M → Mⁿ⁺ + n e⁻ (metal dissolution)',
    cathodicReaction: 'O₂ + 2H₂O + 4e⁻ → 4OH⁻ (aerated) or 2H⁺ + 2e⁻ → H₂ (acidic)',
    criticalFactors: ['Electrolyte conductivity', 'pH level', 'Dissolved oxygen', 'Temperature', 'Depolarization'],
    mitigationStrategies: ['Corrosion allowances in wall thickness', 'Protective organic coatings', 'Cathodic protection (impressed current or sacrificial anodes)', 'Corrosion inhibitors'],
    schematicType: 'uniform',
  },
  galvanic: {
    id: 'galvanic',
    name: 'Galvanic / Bimetallic Corrosion',
    category: 'General',
    mechanismSummary: 'Accelerated attack when two dissimilar metals with distinct electrochemical potentials are electrically connected in a common conducting electrolyte.',
    anodicReaction: 'M_anode → M_anodeⁿ⁺ + n e⁻ (less noble metal corrodes faster)',
    cathodicReaction: 'Electron consumption on noble cathode (polarization equilibrium)',
    criticalFactors: ['Potential difference (ΔV > 0.15 V)', 'Area ratio (small anode / large cathode is disastrous)', 'Electrolyte conductivity'],
    mitigationStrategies: ['Electrical isolation (dielectric flanges, nylon washers)', 'Select metals close in the Galvanic Series', 'Coat the cathode or both metals (never coat only the anode!)'],
    schematicType: 'galvanic',
  },
  pitting: {
    id: 'pitting',
    name: 'Pitting Corrosion',
    category: 'Localized',
    mechanismSummary: 'Extremely localized passive film breakdown yielding deep microscopic cavities. Pits become self-sustaining autocatalytic cells with high internal chloride and hydrogen ion concentrations.',
    anodicReaction: 'Fe → Fe²⁺ + 2e⁻ inside pit; Fe²⁺ + 2H₂O + 2Cl⁻ → Fe(OH)₂ + 2HCl (acidification)',
    cathodicReaction: 'O₂ + 2H₂O + 4e⁻ → 4OH⁻ on adjacent broad passive surface',
    criticalFactors: ['Halide concentration (Cl⁻, Br⁻)', 'Passive film defects', 'Stagnant electrolyte conditions', 'Temperature exceeding Critical Pitting Temperature (CPT)'],
    mitigationStrategies: ['High PREN alloys (%Cr + 3.3%Mo + 16%N ≥ 40)', 'Avoid stagnant flow regimes (> 1.5 m/s)', 'De-chlorination and biocide dosage'],
    schematicType: 'pitting',
  },
  crevice: {
    id: 'crevice',
    name: 'Crevice Corrosion',
    category: 'Localized',
    mechanismSummary: 'Occurs inside narrow shielded geometries (gasket faces, bolt threads, sediment deposits) where stagnant electrolyte experiences differential aeration and oxygen depletion.',
    anodicReaction: 'Metal dissolution inside crevice due to rapid oxygen exhaustion',
    cathodicReaction: 'Oxygen reduction on exterior surface, driving chloride migration into crevice',
    criticalFactors: ['Crevice gap geometry (< 0.1 mm)', 'Differential aeration cells', 'Electrolyte chloride content'],
    mitigationStrategies: ['Design welded butt joints rather than bolted lap joints', 'Continuous seal welding', 'Non-absorbent fluoropolymer gaskets'],
    schematicType: 'crevice',
  },
  intergranular: {
    id: 'intergranular',
    name: 'Intergranular Corrosion (Sensitization)',
    category: 'Metallurgically-Influenced',
    mechanismSummary: 'Localized attack along crystal grain boundaries, typically caused by chromium carbide (Cr₂₃C₆) precipitation at 450°C–850°C which depletes chromium in adjacent zones below 12%.',
    anodicReaction: 'Preferential dissolution of chromium-depleted grain boundary envelope (< 12% Cr)',
    cathodicReaction: 'Reduction reactions sustained on bulk matrix grain interiors',
    criticalFactors: ['Sensitizing heat treatment or welding heat-affected zone (HAZ)', 'Carbon content > 0.03% in austenitic grades'],
    mitigationStrategies: ['Use low-carbon "L" grades (e.g., 316L with C < 0.03%)', 'Stabilized grades (Ti-stabilized 321, Nb-stabilized 347)', 'Solution annealing at 1050°C with rapid quench'],
    schematicType: 'intergranular',
  },
  scc: {
    id: 'scc',
    name: 'Stress Corrosion Cracking (SCC)',
    category: 'Environmentally-Assisted',
    mechanismSummary: 'Catastrophic brittle crack propagation under the simultaneous combination of sustained tensile stress, a susceptible metallurgy, and a specific corrosive environmental species.',
    anodicReaction: 'Localized slip-dissolution / film rupture at crack tip stress concentration',
    cathodicReaction: 'Hydrogen evolution assisting decohesion or film breakdown',
    criticalFactors: ['Tensile stress (applied or residual welding stress)', 'Specific ion matching (Cl⁻ for austenitic SS; NH₃ for brass; caustic for carbon steel)', 'Temperature > 60°C'],
    mitigationStrategies: ['Post-weld heat treatment (stress relief)', 'Shot peening to induce compressive surface residual stresses', 'Switch to duplex stainless steel or nickel superalloys'],
    schematicType: 'scc',
  },
};

/**
 * Calculates Pitting Resistance Equivalent Number (PREN)
 * PREN = %Cr + 3.3(%Mo + 0.5%W) + 16%N
 */
export function calculatePREN(
  crPct: number,
  moPct: number,
  nPct: number,
  wPct = 0,
  alloyName = 'Selected Alloy'
): PRENResult {
  const prenValue = Number((crPct + 3.3 * (moPct + 0.5 * wPct) + 16 * nPct).toFixed(2));

  let resistanceClass: PRENResult['resistanceClass'] = 'Standard Pitting';
  if (prenValue >= 40) {
    resistanceClass = 'Critical Pitting Resistant';
  } else if (prenValue >= 32) {
    resistanceClass = 'Super-Austenitic / Super-Duplex';
  } else if (prenValue >= 24) {
    resistanceClass = 'Resistant (Marine Service)';
  }

  return {
    alloyName,
    crPercentage: crPct,
    moPercentage: moPct,
    nPercentage: nPct,
    wPercentage: wPct,
    prenValue,
    resistanceClass,
  };
}

/**
 * Calculates uniform penetration rate via Faraday's Law:
 * CR (mm/yr) = 0.00327 * (i_corr * EW) / rho
 * CR (mpy) = 0.129 * (i_corr * EW) / rho
 */
export function calculateFaradayCorrosionRate(
  iCorrMicroAmpPerCm2: number,
  equivalentWeight: number,
  densityGramsPerCm3: number
): CorrosionRateResult {
  if (densityGramsPerCm3 <= 0 || iCorrMicroAmpPerCm2 <= 0) {
    return {
      corrosionCurrentDensityMicroA: iCorrMicroAmpPerCm2,
      equivalentWeightGrams: equivalentWeight,
      densityGramsPerCm3,
      rateMmPerYear: 0,
      rateMpy: 0,
      severity: 'Negligible',
      faradayConstantC: 96485,
    };
  }

  // Faraday conversion constant for mm/year: 0.00327
  const rateMmPerYear = Number(
    ((0.00327 * iCorrMicroAmpPerCm2 * equivalentWeight) / densityGramsPerCm3).toFixed(4)
  );
  // mils per year (1 mm/yr = 39.37 mpy)
  const rateMpy = Number((rateMmPerYear * 39.37).toFixed(3));

  let severity: CorrosionRateResult['severity'] = 'Negligible';
  if (rateMmPerYear > 1.0) severity = 'Catastrophic';
  else if (rateMmPerYear > 0.5) severity = 'Severe';
  else if (rateMmPerYear > 0.1) severity = 'Moderate';
  else if (rateMmPerYear > 0.02) severity = 'Mild';

  return {
    corrosionCurrentDensityMicroA: iCorrMicroAmpPerCm2,
    equivalentWeightGrams: equivalentWeight,
    densityGramsPerCm3,
    rateMmPerYear,
    rateMpy,
    severity,
    faradayConstantC: 96485,
  };
}

/**
 * Calculates galvanic pairing risk between two metals based on potential difference
 */
export function evaluateGalvanicPair(
  metalAKey: string,
  metalBKey: string,
  areaRatioAnodeToCathode = 1.0
): GalvanicPairResult | null {
  const metalA = CORROSION_ALLOYS[metalAKey];
  const metalB = CORROSION_ALLOYS[metalBKey];
  if (!metalA || !metalB) return null;

  // Anode is more negative (less noble)
  const isANegative = metalA.standardPotentialVSCE < metalB.standardPotentialVSCE;
  const anodic = isANegative ? metalA : metalB;
  const cathodic = isANegative ? metalB : metalA;

  const potentialDiff = Math.abs(metalA.standardPotentialVSCE - metalB.standardPotentialVSCE);

  let riskLevel: GalvanicPairResult['riskLevel'] = 'Negligible (< 0.15 V)';
  if (potentialDiff >= 0.30) {
    riskLevel = 'Severe (> 0.30 V)';
  } else if (potentialDiff >= 0.15) {
    riskLevel = 'Moderate (0.15 - 0.30 V)';
  }

  let areaEffect = 'Balanced Area (1:1): Corrosion is distributed evenly over the anode.';
  if (areaRatioAnodeToCathode < 0.25) {
    areaEffect = 'DANGEROUS Small Anode / Large Cathode ratio! Intense localized current concentration on the anodic component.';
  } else if (areaRatioAnodeToCathode > 3.0) {
    areaEffect = 'Favorable Large Anode / Small Cathode ratio: Current is diffused over a broad surface.';
  }

  let rec = 'Standard bimetallic assembly. Normal inspection recommended.';
  if (riskLevel === 'Severe (> 0.30 V)') {
    rec = 'MANDATORY electrical insulation (dielectric sleeve/gasket) or replacement of one alloy to reduce potential gradient.';
  } else if (riskLevel === 'Moderate (0.15 - 0.30 V)') {
    rec = 'Insulate joint if exposed to marine electrolyte; or coat cathodic member to diminish cathode reaction surface.';
  }

  return {
    anodicAlloy: anodic,
    cathodicAlloy: cathodic,
    anodeMaterial: anodic,
    cathodeMaterial: cathodic,
    potentialDifferenceVolts: Number(potentialDiff.toFixed(2)),
    potentialDifferenceV: Number(potentialDiff.toFixed(2)),
    riskLevel,
    areaRatioEffect: areaEffect,
    recommendation: rec,
  };
}

/**
 * Generates temperature trend points via Arrhenius thermal activation model
 * k(T) = k_ref * exp( (-Ea / R) * (1/T - 1/T_ref) )
 */
export function generateTemperatureCorrosionTrend(
  baseRate25C: number,
  activationEnergyKJPerMol = 35,
  minTempC = 10,
  maxTempC = 100,
  steps = 10
): TemperatureCorrosionPoint[] {
  const R = 8.314; // J/(mol*K)
  const Ea_J = activationEnergyKJPerMol * 1000;
  const T_ref_K = 25 + 273.15;

  const stepSize = (maxTempC - minTempC) / (steps - 1);
  const points: TemperatureCorrosionPoint[] = [];

  for (let i = 0; i < steps; i++) {
    const tempC = Number((minTempC + i * stepSize).toFixed(1));
    const tempK = tempC + 273.15;
    const factor = Math.exp((-Ea_J / R) * (1 / tempK - 1 / T_ref_K));
    const rate = Number((baseRate25C * factor).toFixed(4));

    points.push({
      temperatureC: tempC,
      corrosionRateMmPerYear: rate,
      arrheniusRateFactor: Number(factor.toFixed(3)),
    });
  }

  return points;
}
