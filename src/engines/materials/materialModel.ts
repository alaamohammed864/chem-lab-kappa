// Material Model Definitions for Materials Science Platform
// Independent from UI layer

export type MaterialCategory =
  | 'metals'
  | 'alloys'
  | 'ceramics'
  | 'polymers'
  | 'composites'
  | 'semiconductors'
  | 'advanced materials';

export type HardnessScale = 'HV' | 'HRC' | 'HRB' | 'HB' | 'Mohs' | 'Shore D';

export interface MaterialHardness {
  value: number;
  scale: HardnessScale;
  approxHV?: number; // Normalized Vickers equivalent for cross-comparison
}

export type CorrosionResistanceLevel =
  | 'Excellent'
  | 'Very High'
  | 'High'
  | 'Moderate'
  | 'Low'
  | 'Poor';

export interface MaterialAshbyMetrics {
  specificStrength: number; // Yield Strength / Density (kN·m/kg)
  specificModulus: number; // Young's Modulus / Density (MN·m/kg)
  thermalEffusivity?: number; // sqrt(k * rho * cp)
}

/**
 * Standard typed Material Model
 * Represents engineering and functional materials with 10 core properties
 * and educational demonstration identification.
 */
export interface MaterialModel {
  id: string;
  name: string;
  nameAr?: string;
  designation: string;
  standardGrade?: string;
  formula?: string;
  category: MaterialCategory;
  subCategory?: string;

  // 10 Core Physical / Mechanical / Thermal / Electrical Properties
  density: number; // Mass density in g/cm³ (at 20°C)
  hardness: MaterialHardness; // Indentation or scratch hardness
  tensileStrength: number; // Ultimate Tensile Strength (UTS) in MPa
  yieldStrength: number; // Yield Strength (0.2% offset) in MPa
  elasticModulus: number; // Young's Modulus in GPa
  poissonRatio: number; // Poisson's Ratio (dimensionless, typically 0.15 - 0.45)
  thermalConductivity: number; // Thermal Conductivity in W/(m·K)
  meltingPoint: number; // Melting point or decomposition temperature in °C
  electricalConductivity: number; // Electrical conductivity in S/m (at 20°C)
  corrosionResistance: CorrosionResistanceLevel; // Chemical / oxidation resistance rating

  // Additional Engineering & Material Science Attributes
  thermalExpansion?: number; // Linear coefficient of thermal expansion in 10⁻⁶ / K
  crystalStructure?: string; // Lattice Bravais system or amorphous structure
  maxServiceTemp?: number; // Maximum continuous operating temperature in °C
  specificHeat?: number; // Specific heat capacity in J/(kg·K)
  description: string;
  descriptionAr?: string;
  applications: string[];
  composition?: Record<string, string>;

  // Data Quality & Non-Authoritative Demonstration Disclosure
  isDemonstration: true;
  dataSource: string;
  sourceStandard?: string;
  notes?: string;
}
