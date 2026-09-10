export type ViewMode =
  | 'dashboard'
  | 'virtual-lab'
  | 'periodic-table'
  | 'molar-mass'
  | 'balance-equation'
  | 'ion-explorer'
  | 'molecule-lab'
  | 'atom-orbital-lab'
  | 'atom-lab'
  | 'orbital-lab'
  | 'material-explorer'
  | 'crystal-structure'
  | 'xrd-lab'
  | 'projects'
  | 'research-workspace'
  | 'recent-activity'
  | 'ai-assistant'
  | 'ndt-center'
  | 'engineering-calc'
  | 'phase-diagrams'
  | 'corrosion-lab'
  | 'reports'
  | 'settings'
  | 'about'
  | 'help';

export type OrbitalType = 's' | 'p' | 'd' | 'f';

export type OrbitalVisualizationMode = 'structure' | 'probability' | 'electron-density';

export interface QuantumNumbers {
  n: number; // Principal (1 - 7)
  l: number; // Azimuthal (0 - 3)
  m: number; // Magnetic (-l to +l)
  spin: 0.5 | -0.5; // Spin (+1/2 or -1/2)
}

export interface OrbitalState {
  id: string;
  name: string; // e.g. "2px", "3dz2", "4fxyz"
  type: OrbitalType;
  n: number;
  l: number;
  m: number;
  spin: 0.5 | -0.5;
  energyEv: number;
  radialNodes: number;
  angularNodes: number;
  totalNodes: number;
  formula: string;
  description: string;
}

export interface ElementIsotope {
  mass: number;
  abundance?: number; // percentage, e.g. 91.75
  halfLife?: string; // e.g. 'Stable' or '2.6 yr'
  isStable: boolean;
}

export interface ElementDiscovery {
  year: number | string;
  discoverer: string;
  country?: string;
}

export interface ElementSafety {
  hazards?: string[];
  handling?: string;
  nfpa?: { health: number; flammability: number; reactivity: number };
}

export interface ChemicalElement {
  number: number;
  symbol: string;
  name: string;
  atomicMass: number;
  category:
    | 'alkali'
    | 'alkaline-earth'
    | 'transition-metal'
    | 'post-transition'
    | 'metalloid'
    | 'nonmetal'
    | 'halogen'
    | 'noble-gas'
    | 'lanthanide'
    | 'actinide'
    | 'unknown';
  group: number;
  period: number;
  block: 's' | 'p' | 'd' | 'f';
  phase: 'solid' | 'liquid' | 'gas' | 'unknown';
  electronConfig: string;
  valenceElectrons: number;
  protons: number;
  neutrons: number;
  electrons: number;
  oxidationStates: string;
  electronegativity?: number; // Pauling
  ionizationEnergy?: number; // kJ/mol
  electronAffinity?: number; // kJ/mol
  atomicRadius?: number; // pm
  density?: number; // g/cm³ @ STP
  meltPoint?: number; // K
  boilPoint?: number; // K
  crystalStructure?: string;
  shells?: number[]; // electrons per shell (K, L, M, N, O, P, Q)
  isotopes?: ElementIsotope[];
  discovery?: ElementDiscovery;
  applications?: string[];
  safety?: ElementSafety;
  summary: string;
  isVerifiedData?: boolean; // false for predicted synthetic superheavies 113-118
}

export type MaterialCategory =
  | 'metals'
  | 'alloys'
  | 'ceramics'
  | 'polymers'
  | 'composites'
  | 'semiconductors'
  | 'advanced materials';

export interface MaterialHardness {
  value: number;
  scale: 'HV' | 'HRC' | 'HRB' | 'HB' | 'Mohs' | 'Shore D';
  approxHV?: number;
}

export interface MaterialItem {
  id: string;
  name: string;
  nameAr?: string;
  designation: string;
  standardGrade?: string;
  formula?: string;
  category: MaterialCategory | 'Titanium Alloys' | 'Stainless Steels' | 'Superalloys' | 'Advanced Ceramics' | 'Technical Ceramics' | 'Carbon Materials' | 'Refractory Metals' | 'Aluminum Alloys' | string;
  subCategory?: string;
  density: number; // g/cm³
  hardness: MaterialHardness;
  yieldStrength: number; // MPa
  tensileStrength: number; // MPa
  elasticModulus: number; // GPa
  poissonRatio: number;
  thermalConductivity: number; // W/m·K
  meltingPoint: number; // °C
  electricalConductivity: number; // S/m
  corrosionResistance: 'Excellent' | 'Very High' | 'High' | 'Moderate' | 'Low' | 'Poor';
  thermalExpansion?: number; // 10^-6 / K
  maxServiceTemp?: number; // °C
  crystalStructure?: string;
  description: string;
  descriptionAr?: string;
  applications: string[];
  composition?: Record<string, string>;
  isDemonstration?: boolean;
  dataSource?: string;
}

export interface ResearchNote {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  timestamp: string;
  statusColor: 'cyan' | 'purple' | 'teal' | 'slate' | 'amber';
  content?: string;
  details?: string;
}

export interface CrystalSystem {
  id: string;
  name: string;
  symbol: string;
  bravais: string;
  atomsPerCell: number;
  coordinationNumber: number;
  apf: number; // Atomic packing factor
  latticeRelation: string;
  angleRelation: string;
  commonExamples: string[];
  description: string;
}

export interface XRDPatternData {
  material: string;
  radiation: string; // e.g., Cu-Kα (λ = 1.5406 Å)
  peaks: {
    twoTheta: number;
    intensity: number; // 0 - 100%
    hkl: string;
    phase: string;
    dSpacing?: number;
    fwhm?: number;
  }[];
  id?: string;
  formula?: string;
  crystalSystem?: string;
  spaceGroup?: string;
  latticeParams?: { a: number; b?: number; c?: number };
  description?: string;
  isDemonstration?: boolean;
  dataSource?: string;
}

// Scientific Engine Model Extensions
export interface ReactionBalanceResult {
  original: string;
  balanced: string;
  reactionType: string;
  enthalpy: string;
  deltaG?: string;
  notes: string;
  isSpontaneous?: boolean;
}

export interface CorrosionMetric {
  alloyName: string;
  prenValue: number;
  resistanceClass: string;
  corrosionRateMmPerYear?: number;
}

export interface NDTMetric {
  material: string;
  longitudinalVelocityMS: number;
  shearVelocityMS: number;
  acousticImpedanceMRayl: number;
}

