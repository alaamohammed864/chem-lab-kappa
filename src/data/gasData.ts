// Verified Gas Physical Data & Van der Waals Parameters
// Source: NIST Chemistry WebBook & CRC Handbook of Chemistry and Physics

export interface GasProperty {
  formula: string;
  name: string;
  molarMass: number;     // g/mol
  a: number;             // L²·bar/mol² (Van der Waals attraction parameter)
  b: number;             // L/mol (Van der Waals co-volume parameter)
  criticalTempK: number; // Critical Temperature (K)
  criticalPressureBar: number; // Critical Pressure (bar)
  densityAtSTP: number;  // g/L (at 0°C, 1 atm = 22.414 L/mol)
}

export const GAS_PROPERTIES_DATA: GasProperty[] = [
  { formula: 'He', name: 'Helium', molarMass: 4.0026, a: 0.0346, b: 0.0238, criticalTempK: 5.19, criticalPressureBar: 2.27, densityAtSTP: 0.1786 },
  { formula: 'Ne', name: 'Neon', molarMass: 20.1797, a: 0.2135, b: 0.0171, criticalTempK: 44.4, criticalPressureBar: 27.6, densityAtSTP: 0.9002 },
  { formula: 'Ar', name: 'Argon', molarMass: 39.948, a: 1.355, b: 0.0320, criticalTempK: 150.8, criticalPressureBar: 48.7, densityAtSTP: 1.784 },
  { formula: 'H2', name: 'Hydrogen', molarMass: 2.01588, a: 0.2476, b: 0.0266, criticalTempK: 33.2, criticalPressureBar: 12.97, densityAtSTP: 0.0899 },
  { formula: 'N2', name: 'Nitrogen', molarMass: 28.0134, a: 1.370, b: 0.0387, criticalTempK: 126.2, criticalPressureBar: 33.9, densityAtSTP: 1.2506 },
  { formula: 'O2', name: 'Oxygen', molarMass: 31.9988, a: 1.382, b: 0.0319, criticalTempK: 154.6, criticalPressureBar: 50.4, densityAtSTP: 1.429 },
  { formula: 'CO2', name: 'Carbon dioxide', molarMass: 44.009, a: 3.658, b: 0.0429, criticalTempK: 304.2, criticalPressureBar: 73.8, densityAtSTP: 1.977 },
  { formula: 'CH4', name: 'Methane', molarMass: 16.0425, a: 2.303, b: 0.0431, criticalTempK: 190.6, criticalPressureBar: 46.0, densityAtSTP: 0.716 },
  { formula: 'NH3', name: 'Ammonia', molarMass: 17.0305, a: 4.225, b: 0.0371, criticalTempK: 405.5, criticalPressureBar: 112.8, densityAtSTP: 0.771 },
  { formula: 'Cl2', name: 'Chlorine', molarMass: 70.906, a: 6.579, b: 0.0562, criticalTempK: 416.9, criticalPressureBar: 79.9, densityAtSTP: 3.214 },
  { formula: 'SO2', name: 'Sulfur dioxide', molarMass: 64.066, a: 6.865, b: 0.0568, criticalTempK: 430.8, criticalPressureBar: 78.8, densityAtSTP: 2.926 },
  { formula: 'Air', name: 'Standard Dry Air', molarMass: 28.964, a: 1.358, b: 0.0364, criticalTempK: 132.5, criticalPressureBar: 37.7, densityAtSTP: 1.293 },
];

export const GAS_CONSTANTS = {
  R_J_MOL_K: 8.314462618,      // J / (mol·K)
  R_L_ATM_MOL_K: 0.082057366,  // L·atm / (mol·K)
  R_L_BAR_MOL_K: 0.083144626,  // L·bar / (mol·K)
  R_L_TORR_MOL_K: 62.36367,    // L·Torr / (mol·K) or L·mmHg / (mol·K)
  STANDARD_TEMP_K: 273.15,     // 0°C
  STANDARD_PRESSURE_ATM: 1.0,  // 1 atm
  STANDARD_PRESSURE_KPA: 101.325, // kPa
  STANDARD_PRESSURE_BAR: 1.0,  // IUPAC STP is 1 bar, historical is 1 atm
  MOLAR_VOLUME_STP_L: 22.413962, // L/mol at 0°C, 1 atm
  MOLAR_VOLUME_IUPAC_L: 22.710955, // L/mol at 0°C, 1 bar
  AVOGADRO_NUMBER: 6.02214076e23, // mol⁻¹
};
