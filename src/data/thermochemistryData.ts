// Verified Standard Thermodynamic Properties at 298.15 K (25°C) and 1 bar
// Source: NIST Chemistry WebBook & CRC Handbook of Chemistry and Physics

export interface ThermodynamicCompound {
  formula: string;
  name: string;
  phase: 's' | 'l' | 'g' | 'aq';
  deltaHf: number; // kJ/mol (Standard Enthalpy of Formation)
  deltaGf: number; // kJ/mol (Standard Gibbs Free Energy of Formation)
  S0: number;      // J/(mol·K) (Standard Molar Entropy)
  Cp?: number;     // J/(mol·K) (Specific heat capacity at constant pressure)
}

export type ThermodynamicEntry = ThermodynamicCompound;

export const THERMODYNAMIC_DATA: Record<string, ThermodynamicCompound> = {
  // Elements in standard states (deltaHf = 0, deltaGf = 0)
  'O2(g)': { formula: 'O2', name: 'Oxygen gas', phase: 'g', deltaHf: 0, deltaGf: 0, S0: 205.15, Cp: 29.38 },
  'H2(g)': { formula: 'H2', name: 'Hydrogen gas', phase: 'g', deltaHf: 0, deltaGf: 0, S0: 130.68, Cp: 28.84 },
  'N2(g)': { formula: 'N2', name: 'Nitrogen gas', phase: 'g', deltaHf: 0, deltaGf: 0, S0: 191.61, Cp: 29.12 },
  'C(s,graphite)': { formula: 'C', name: 'Carbon (graphite)', phase: 's', deltaHf: 0, deltaGf: 0, S0: 5.74, Cp: 8.53 },
  'Fe(s)': { formula: 'Fe', name: 'Iron (alpha)', phase: 's', deltaHf: 0, deltaGf: 0, S0: 27.28, Cp: 25.10 },
  'Al(s)': { formula: 'Al', name: 'Aluminum', phase: 's', deltaHf: 0, deltaGf: 0, S0: 28.30, Cp: 24.20 },
  'Cu(s)': { formula: 'Cu', name: 'Copper', phase: 's', deltaHf: 0, deltaGf: 0, S0: 33.15, Cp: 24.44 },
  'Ti(s)': { formula: 'Ti', name: 'Titanium (alpha)', phase: 's', deltaHf: 0, deltaGf: 0, S0: 30.63, Cp: 25.06 },
  'Mg(s)': { formula: 'Mg', name: 'Magnesium', phase: 's', deltaHf: 0, deltaGf: 0, S0: 32.68, Cp: 24.87 },
  'Cl2(g)': { formula: 'Cl2', name: 'Chlorine gas', phase: 'g', deltaHf: 0, deltaGf: 0, S0: 223.08, Cp: 33.95 },
  'S(s,rhombic)': { formula: 'S', name: 'Sulfur (rhombic)', phase: 's', deltaHf: 0, deltaGf: 0, S0: 31.80, Cp: 22.60 },

  // Water & Oxides
  'H2O(l)': { formula: 'H2O', name: 'Water (liquid)', phase: 'l', deltaHf: -285.83, deltaGf: -237.13, S0: 69.91, Cp: 75.38 },
  'H2O(g)': { formula: 'H2O', name: 'Water vapor (steam)', phase: 'g', deltaHf: -241.82, deltaGf: -228.57, S0: 188.84, Cp: 33.58 },
  'CO2(g)': { formula: 'CO2', name: 'Carbon dioxide', phase: 'g', deltaHf: -393.51, deltaGf: -394.39, S0: 213.74, Cp: 37.11 },
  'CO(g)': { formula: 'CO', name: 'Carbon monoxide', phase: 'g', deltaHf: -110.53, deltaGf: -137.17, S0: 197.67, Cp: 29.14 },
  'Fe2O3(s)': { formula: 'Fe2O3', name: 'Iron(III) oxide (Hematite)', phase: 's', deltaHf: -824.2, deltaGf: -742.2, S0: 87.40, Cp: 103.85 },
  'Fe3O4(s)': { formula: 'Fe3O4', name: 'Magnetite', phase: 's', deltaHf: -1118.4, deltaGf: -1015.4, S0: 145.3, Cp: 143.5 },
  'Al2O3(s)': { formula: 'Al2O3', name: 'Aluminum oxide (Corundum)', phase: 's', deltaHf: -1675.7, deltaGf: -1582.3, S0: 50.92, Cp: 79.04 },
  'TiO2(s,rutile)': { formula: 'TiO2', name: 'Titanium dioxide (Rutile)', phase: 's', deltaHf: -944.0, deltaGf: -888.8, S0: 50.62, Cp: 55.06 },
  'CaO(s)': { formula: 'CaO', name: 'Calcium oxide (Quicklime)', phase: 's', deltaHf: -635.09, deltaGf: -604.03, S0: 39.75, Cp: 42.80 },
  'MgO(s)': { formula: 'MgO', name: 'Magnesium oxide', phase: 's', deltaHf: -601.7, deltaGf: -569.4, S0: 26.94, Cp: 37.15 },
  'SO2(g)': { formula: 'SO2', name: 'Sulfur dioxide', phase: 'g', deltaHf: -296.84, deltaGf: -300.19, S0: 248.22, Cp: 39.87 },
  'SO3(g)': { formula: 'SO3', name: 'Sulfur trioxide', phase: 'g', deltaHf: -395.72, deltaGf: -371.06, S0: 256.76, Cp: 50.67 },
  'NO2(g)': { formula: 'NO2', name: 'Nitrogen dioxide', phase: 'g', deltaHf: 33.18, deltaGf: 51.31, S0: 240.06, Cp: 37.20 },
  'NO(g)': { formula: 'NO', name: 'Nitric oxide', phase: 'g', deltaHf: 90.25, deltaGf: 86.55, S0: 210.76, Cp: 29.84 },

  // Hydrocarbons & Organic compounds
  'CH4(g)': { formula: 'CH4', name: 'Methane', phase: 'g', deltaHf: -74.87, deltaGf: -50.72, S0: 186.26, Cp: 35.31 },
  'C2H6(g)': { formula: 'C2H6', name: 'Ethane', phase: 'g', deltaHf: -84.68, deltaGf: -32.82, S0: 229.60, Cp: 52.63 },
  'C3H8(g)': { formula: 'C3H8', name: 'Propane', phase: 'g', deltaHf: -103.85, deltaGf: -23.49, S0: 269.91, Cp: 73.50 },
  'C6H12O6(s)': { formula: 'C6H12O6', name: 'D-Glucose', phase: 's', deltaHf: -1273.3, deltaGf: -910.1, S0: 212.1, Cp: 218.8 },
  'C2H5OH(l)': { formula: 'C2H5OH', name: 'Ethanol', phase: 'l', deltaHf: -277.69, deltaGf: -174.78, S0: 160.7, Cp: 111.46 },

  // Salts, Acids, Bases & Chlorides
  'NH3(g)': { formula: 'NH3', name: 'Ammonia gas', phase: 'g', deltaHf: -46.11, deltaGf: -16.45, S0: 192.45, Cp: 35.06 },
  'HCl(g)': { formula: 'HCl', name: 'Hydrogen chloride gas', phase: 'g', deltaHf: -92.31, deltaGf: -95.30, S0: 186.91, Cp: 29.12 },
  'HCl(aq)': { formula: 'HCl', name: 'Hydrochloric acid (aq)', phase: 'aq', deltaHf: -167.16, deltaGf: -131.23, S0: 56.5, Cp: -136.4 },
  'HNO3(l)': { formula: 'HNO3', name: 'Nitric acid', phase: 'l', deltaHf: -174.10, deltaGf: -80.71, S0: 155.6, Cp: 109.87 },
  'H2SO4(l)': { formula: 'H2SO4', name: 'Sulfuric acid', phase: 'l', deltaHf: -813.99, deltaGf: -690.00, S0: 156.9, Cp: 138.9 },
  'NaOH(s)': { formula: 'NaOH', name: 'Sodium hydroxide', phase: 's', deltaHf: -425.61, deltaGf: -379.49, S0: 64.46, Cp: 59.54 },
  'NaOH(aq)': { formula: 'NaOH', name: 'Sodium hydroxide (aq)', phase: 'aq', deltaHf: -470.11, deltaGf: -419.18, S0: 48.1, Cp: -87.0 },
  'NaCl(s)': { formula: 'NaCl', name: 'Sodium chloride (Halite)', phase: 's', deltaHf: -411.15, deltaGf: -384.14, S0: 72.13, Cp: 50.50 },
  'CaCO3(s,calcite)': { formula: 'CaCO3', name: 'Calcium carbonate (Calcite)', phase: 's', deltaHf: -1206.92, deltaGf: -1128.8, S0: 92.9, Cp: 81.88 },
  'TiCl4(l)': { formula: 'TiCl4', name: 'Titanium tetrachloride', phase: 'l', deltaHf: -804.2, deltaGf: -737.2, S0: 252.3, Cp: 145.2 },
  'MgCl2(s)': { formula: 'MgCl2', name: 'Magnesium chloride', phase: 's', deltaHf: -641.32, deltaGf: -591.79, S0: 89.62, Cp: 71.09 },
  'AlCl3(s)': { formula: 'AlCl3', name: 'Aluminum chloride', phase: 's', deltaHf: -704.2, deltaGf: -628.8, S0: 110.67, Cp: 91.13 },
};
