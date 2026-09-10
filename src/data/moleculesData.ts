// Molecular Structure Database
// Contains Cartesian coordinates (in Ångströms), connectivity matrices,
// VSEPR geometries, point groups, and physical properties for representative molecules.

export interface MoleculeAtom {
  id: string;
  element: string; // e.g. "C", "H", "O", "N", "F", "Cl", "S", "P", "B"
  x: number;       // Ångströms (Å)
  y: number;
  z: number;
  formalCharge?: number;
  hybridization?: 's' | 'sp' | 'sp2' | 'sp3' | 'sp3d' | 'sp3d2';
  label?: string;
}

export interface MoleculeBond {
  id: string;
  sourceAtomId: string;
  targetAtomId: string;
  order: 1 | 1.5 | 2 | 3; // 1 = single, 1.5 = aromatic/resonance, 2 = double, 3 = triple
  type?: 'covalent' | 'polar-covalent' | 'ionic' | 'aromatic';
}

export interface MoleculeData {
  id: string;
  name: string;
  formula: string;
  formattedFormula: string;
  iupacName: string;
  molarMass: number;
  vseprGeometry: string;
  pointGroup: string;
  dipoleMomentDebye: number; // in Debyes (D)
  isPolar: boolean;
  category: 'inorganic' | 'organic' | 'atmospheric' | 'solvent' | 'coordination';
  description: string;
  atoms: MoleculeAtom[];
  bonds: MoleculeBond[];
  tags: string[];
}

export const MOLECULES_DATABASE: MoleculeData[] = [
  // 1. Water (H2O)
  {
    id: 'h2o',
    name: 'Water',
    formula: 'H2O',
    formattedFormula: 'H₂O',
    iupacName: 'Oxidane',
    molarMass: 18.015,
    vseprGeometry: 'Bent (104.5°)',
    pointGroup: 'C2v',
    dipoleMomentDebye: 1.85,
    isPolar: true,
    category: 'inorganic',
    description: 'Universal solvent; bent geometry caused by two lone electron pairs on central oxygen atom.',
    atoms: [
      { id: 'O1', element: 'O', x: 0.0, y: 0.0, z: 0.117, hybridization: 'sp3' },
      { id: 'H1', element: 'H', x: 0.0, y: 0.757, z: -0.469, hybridization: 's' },
      { id: 'H2', element: 'H', x: 0.0, y: -0.757, z: -0.469, hybridization: 's' },
    ],
    bonds: [
      { id: 'b1', sourceAtomId: 'O1', targetAtomId: 'H1', order: 1, type: 'polar-covalent' },
      { id: 'b2', sourceAtomId: 'O1', targetAtomId: 'H2', order: 1, type: 'polar-covalent' },
    ],
    tags: ['solvent', 'bent', 'polar', 'hydrogen-bonding'],
  },

  // 2. Carbon Dioxide (CO2)
  {
    id: 'co2',
    name: 'Carbon Dioxide',
    formula: 'CO2',
    formattedFormula: 'CO₂',
    iupacName: 'Carbon dioxide',
    molarMass: 44.01,
    vseprGeometry: 'Linear (180°)',
    pointGroup: 'D∞h',
    dipoleMomentDebye: 0.0,
    isPolar: false,
    category: 'atmospheric',
    description: 'Major atmospheric greenhouse gas; linear symmetrical non-polar geometry with sp hybridized carbon.',
    atoms: [
      { id: 'C1', element: 'C', x: 0.0, y: 0.0, z: 0.0, hybridization: 'sp' },
      { id: 'O1', element: 'O', x: 0.0, y: 0.0, z: 1.16, hybridization: 'sp2' },
      { id: 'O2', element: 'O', x: 0.0, y: 0.0, z: -1.16, hybridization: 'sp2' },
    ],
    bonds: [
      { id: 'b1', sourceAtomId: 'C1', targetAtomId: 'O1', order: 2, type: 'covalent' },
      { id: 'b2', sourceAtomId: 'C1', targetAtomId: 'O2', order: 2, type: 'covalent' },
    ],
    tags: ['gas', 'linear', 'nonpolar', 'greenhouse'],
  },

  // 3. Ammonia (NH3)
  {
    id: 'nh3',
    name: 'Ammonia',
    formula: 'NH3',
    formattedFormula: 'NH₃',
    iupacName: 'Azane',
    molarMass: 17.031,
    vseprGeometry: 'Trigonal Pyramidal (107.3°)',
    pointGroup: 'C3v',
    dipoleMomentDebye: 1.47,
    isPolar: true,
    category: 'inorganic',
    description: 'Weak Brønsted base; trigonal pyramidal geometry driven by single lone pair with rapid umbrella inversion.',
    atoms: [
      { id: 'N1', element: 'N', x: 0.0, y: 0.0, z: 0.116, hybridization: 'sp3' },
      { id: 'H1', element: 'H', x: 0.0, y: 0.94, z: -0.27, hybridization: 's' },
      { id: 'H2', element: 'H', x: -0.814, y: -0.47, z: -0.27, hybridization: 's' },
      { id: 'H3', element: 'H', x: 0.814, y: -0.47, z: -0.27, hybridization: 's' },
    ],
    bonds: [
      { id: 'b1', sourceAtomId: 'N1', targetAtomId: 'H1', order: 1, type: 'polar-covalent' },
      { id: 'b2', sourceAtomId: 'N1', targetAtomId: 'H2', order: 1, type: 'polar-covalent' },
      { id: 'b3', sourceAtomId: 'N1', targetAtomId: 'H3', order: 1, type: 'polar-covalent' },
    ],
    tags: ['base', 'pyramidal', 'polar', 'ligand'],
  },

  // 4. Methane (CH4)
  {
    id: 'ch4',
    name: 'Methane',
    formula: 'CH4',
    formattedFormula: 'CH₄',
    iupacName: 'Methane',
    molarMass: 16.043,
    vseprGeometry: 'Tetrahedral (109.5°)',
    pointGroup: 'Td',
    dipoleMomentDebye: 0.0,
    isPolar: false,
    category: 'organic',
    description: 'Simplest hydrocarbon alkane; textbook regular tetrahedral coordination with sp3 hybridization.',
    atoms: [
      { id: 'C1', element: 'C', x: 0.0, y: 0.0, z: 0.0, hybridization: 'sp3' },
      { id: 'H1', element: 'H', x: 0.628, y: 0.628, z: 0.628, hybridization: 's' },
      { id: 'H2', element: 'H', x: -0.628, y: -0.628, z: 0.628, hybridization: 's' },
      { id: 'H3', element: 'H', x: -0.628, y: 0.628, z: -0.628, hybridization: 's' },
      { id: 'H4', element: 'H', x: 0.628, y: -0.628, z: -0.628, hybridization: 's' },
    ],
    bonds: [
      { id: 'b1', sourceAtomId: 'C1', targetAtomId: 'H1', order: 1, type: 'covalent' },
      { id: 'b2', sourceAtomId: 'C1', targetAtomId: 'H2', order: 1, type: 'covalent' },
      { id: 'b3', sourceAtomId: 'C1', targetAtomId: 'H3', order: 1, type: 'covalent' },
      { id: 'b4', sourceAtomId: 'C1', targetAtomId: 'H4', order: 1, type: 'covalent' },
    ],
    tags: ['alkane', 'tetrahedral', 'fuel', 'nonpolar'],
  },

  // 5. Ethane (C2H6)
  {
    id: 'c2h6',
    name: 'Ethane',
    formula: 'C2H6',
    formattedFormula: 'C₂H₆',
    iupacName: 'Ethane',
    molarMass: 30.07,
    vseprGeometry: 'Tetrahedral carbons (Staggered conformer)',
    pointGroup: 'D3d',
    dipoleMomentDebye: 0.0,
    isPolar: false,
    category: 'organic',
    description: 'Saturated two-carbon alkane showcasing free rotation around C-C single sigma bond.',
    atoms: [
      { id: 'C1', element: 'C', x: 0.0, y: 0.0, z: 0.763, hybridization: 'sp3' },
      { id: 'C2', element: 'C', x: 0.0, y: 0.0, z: -0.763, hybridization: 'sp3' },
      { id: 'H1', element: 'H', x: 0.0, y: 1.018, z: 1.156, hybridization: 's' },
      { id: 'H2', element: 'H', x: -0.882, y: -0.509, z: 1.156, hybridization: 's' },
      { id: 'H3', element: 'H', x: 0.882, y: -0.509, z: 1.156, hybridization: 's' },
      { id: 'H4', element: 'H', x: 0.0, y: -1.018, z: -1.156, hybridization: 's' },
      { id: 'H5', element: 'H', x: 0.882, y: 0.509, z: -1.156, hybridization: 's' },
      { id: 'H6', element: 'H', x: -0.882, y: 0.509, z: -1.156, hybridization: 's' },
    ],
    bonds: [
      { id: 'b1', sourceAtomId: 'C1', targetAtomId: 'C2', order: 1, type: 'covalent' },
      { id: 'b2', sourceAtomId: 'C1', targetAtomId: 'H1', order: 1, type: 'covalent' },
      { id: 'b3', sourceAtomId: 'C1', targetAtomId: 'H2', order: 1, type: 'covalent' },
      { id: 'b4', sourceAtomId: 'C1', targetAtomId: 'H3', order: 1, type: 'covalent' },
      { id: 'b5', sourceAtomId: 'C2', targetAtomId: 'H4', order: 1, type: 'covalent' },
      { id: 'b6', sourceAtomId: 'C2', targetAtomId: 'H5', order: 1, type: 'covalent' },
      { id: 'b7', sourceAtomId: 'C2', targetAtomId: 'H6', order: 1, type: 'covalent' },
    ],
    tags: ['alkane', 'conformation', 'fuel'],
  },

  // 6. Ethene (C2H4)
  {
    id: 'c2h4',
    name: 'Ethene (Ethylene)',
    formula: 'C2H4',
    formattedFormula: 'C₂H₄',
    iupacName: 'Ethene',
    molarMass: 28.054,
    vseprGeometry: 'Trigonal Planar (120°)',
    pointGroup: 'D2h',
    dipoleMomentDebye: 0.0,
    isPolar: false,
    category: 'organic',
    description: 'Simplest alkene featuring carbon-carbon double bond (one sigma + one pi bond).',
    atoms: [
      { id: 'C1', element: 'C', x: 0.0, y: 0.665, z: 0.0, hybridization: 'sp2' },
      { id: 'C2', element: 'C', x: 0.0, y: -0.665, z: 0.0, hybridization: 'sp2' },
      { id: 'H1', element: 'H', x: 0.923, y: 1.232, z: 0.0, hybridization: 's' },
      { id: 'H2', element: 'H', x: -0.923, y: 1.232, z: 0.0, hybridization: 's' },
      { id: 'H3', element: 'H', x: 0.923, y: -1.232, z: 0.0, hybridization: 's' },
      { id: 'H4', element: 'H', x: -0.923, y: -1.232, z: 0.0, hybridization: 's' },
    ],
    bonds: [
      { id: 'b1', sourceAtomId: 'C1', targetAtomId: 'C2', order: 2, type: 'covalent' },
      { id: 'b2', sourceAtomId: 'C1', targetAtomId: 'H1', order: 1, type: 'covalent' },
      { id: 'b3', sourceAtomId: 'C1', targetAtomId: 'H2', order: 1, type: 'covalent' },
      { id: 'b4', sourceAtomId: 'C2', targetAtomId: 'H3', order: 1, type: 'covalent' },
      { id: 'b5', sourceAtomId: 'C2', targetAtomId: 'H4', order: 1, type: 'covalent' },
    ],
    tags: ['alkene', 'planar', 'double-bond'],
  },

  // 7. Ethyne (C2H2)
  {
    id: 'c2h2',
    name: 'Ethyne (Acetylene)',
    formula: 'C2H2',
    formattedFormula: 'C₂H₂',
    iupacName: 'Ethyne',
    molarMass: 26.038,
    vseprGeometry: 'Linear (180°)',
    pointGroup: 'D∞h',
    dipoleMomentDebye: 0.0,
    isPolar: false,
    category: 'organic',
    description: 'Simplest alkyne featuring a high-energy carbon-carbon triple bond (one sigma + two pi bonds).',
    atoms: [
      { id: 'C1', element: 'C', x: 0.0, y: 0.0, z: 0.603, hybridization: 'sp' },
      { id: 'C2', element: 'C', x: 0.0, y: 0.0, z: -0.603, hybridization: 'sp' },
      { id: 'H1', element: 'H', x: 0.0, y: 0.0, z: 1.666, hybridization: 's' },
      { id: 'H2', element: 'H', x: 0.0, y: 0.0, z: -1.666, hybridization: 's' },
    ],
    bonds: [
      { id: 'b1', sourceAtomId: 'C1', targetAtomId: 'C2', order: 3, type: 'covalent' },
      { id: 'b2', sourceAtomId: 'C1', targetAtomId: 'H1', order: 1, type: 'covalent' },
      { id: 'b3', sourceAtomId: 'C2', targetAtomId: 'H2', order: 1, type: 'covalent' },
    ],
    tags: ['alkyne', 'linear', 'triple-bond', 'welding'],
  },

  // 8. Benzene (C6H6)
  {
    id: 'c6h6',
    name: 'Benzene',
    formula: 'C6H6',
    formattedFormula: 'C₆H₆',
    iupacName: 'Benzene',
    molarMass: 78.114,
    vseprGeometry: 'Hexagonal Planar (120°)',
    pointGroup: 'D6h',
    dipoleMomentDebye: 0.0,
    isPolar: false,
    category: 'organic',
    description: 'Prototypical aromatic hydrocarbon; delocalized 6 pi-electron aromatic ring with bond order 1.5.',
    atoms: [
      { id: 'C1', element: 'C', x: 1.397, y: 0.0, z: 0.0, hybridization: 'sp2' },
      { id: 'C2', element: 'C', x: 0.698, y: 1.21, z: 0.0, hybridization: 'sp2' },
      { id: 'C3', element: 'C', x: -0.698, y: 1.21, z: 0.0, hybridization: 'sp2' },
      { id: 'C4', element: 'C', x: -1.397, y: 0.0, z: 0.0, hybridization: 'sp2' },
      { id: 'C5', element: 'C', x: -0.698, y: -1.21, z: 0.0, hybridization: 'sp2' },
      { id: 'C6', element: 'C', x: 0.698, y: -1.21, z: 0.0, hybridization: 'sp2' },
      { id: 'H1', element: 'H', x: 2.477, y: 0.0, z: 0.0, hybridization: 's' },
      { id: 'H2', element: 'H', x: 1.239, y: 2.145, z: 0.0, hybridization: 's' },
      { id: 'H3', element: 'H', x: -1.239, y: 2.145, z: 0.0, hybridization: 's' },
      { id: 'H4', element: 'H', x: -2.477, y: 0.0, z: 0.0, hybridization: 's' },
      { id: 'H5', element: 'H', x: -1.239, y: -2.145, z: 0.0, hybridization: 's' },
      { id: 'H6', element: 'H', x: 1.239, y: -2.145, z: 0.0, hybridization: 's' },
    ],
    bonds: [
      { id: 'b1', sourceAtomId: 'C1', targetAtomId: 'C2', order: 1.5, type: 'aromatic' },
      { id: 'b2', sourceAtomId: 'C2', targetAtomId: 'C3', order: 1.5, type: 'aromatic' },
      { id: 'b3', sourceAtomId: 'C3', targetAtomId: 'C4', order: 1.5, type: 'aromatic' },
      { id: 'b4', sourceAtomId: 'C4', targetAtomId: 'C5', order: 1.5, type: 'aromatic' },
      { id: 'b5', sourceAtomId: 'C5', targetAtomId: 'C6', order: 1.5, type: 'aromatic' },
      { id: 'b6', sourceAtomId: 'C6', targetAtomId: 'C1', order: 1.5, type: 'aromatic' },
      { id: 'b7', sourceAtomId: 'C1', targetAtomId: 'H1', order: 1, type: 'covalent' },
      { id: 'b8', sourceAtomId: 'C2', targetAtomId: 'H2', order: 1, type: 'covalent' },
      { id: 'b9', sourceAtomId: 'C3', targetAtomId: 'H3', order: 1, type: 'covalent' },
      { id: 'b10', sourceAtomId: 'C4', targetAtomId: 'H4', order: 1, type: 'covalent' },
      { id: 'b11', sourceAtomId: 'C5', targetAtomId: 'H5', order: 1, type: 'covalent' },
      { id: 'b12', sourceAtomId: 'C6', targetAtomId: 'H6', order: 1, type: 'covalent' },
    ],
    tags: ['aromatic', 'ring', 'planar', 'resonance'],
  },

  // 9. Sulfur Hexafluoride (SF6)
  {
    id: 'sf6',
    name: 'Sulfur Hexafluoride',
    formula: 'SF6',
    formattedFormula: 'SF₆',
    iupacName: 'Sulfur hexafluoride',
    molarMass: 146.06,
    vseprGeometry: 'Octahedral (90°)',
    pointGroup: 'Oh',
    dipoleMomentDebye: 0.0,
    isPolar: false,
    category: 'inorganic',
    description: 'Hypervalent molecule; perfect octahedral coordination with sp3d2 sulfur hybridization.',
    atoms: [
      { id: 'S1', element: 'S', x: 0.0, y: 0.0, z: 0.0, hybridization: 'sp3d2' },
      { id: 'F1', element: 'F', x: 1.56, y: 0.0, z: 0.0 },
      { id: 'F2', element: 'F', x: -1.56, y: 0.0, z: 0.0 },
      { id: 'F3', element: 'F', x: 0.0, y: 1.56, z: 0.0 },
      { id: 'F4', element: 'F', x: 0.0, y: -1.56, z: 0.0 },
      { id: 'F5', element: 'F', x: 0.0, y: 0.0, z: 1.56 },
      { id: 'F6', element: 'F', x: 0.0, y: 0.0, z: -1.56 },
    ],
    bonds: [
      { id: 'b1', sourceAtomId: 'S1', targetAtomId: 'F1', order: 1, type: 'covalent' },
      { id: 'b2', sourceAtomId: 'S1', targetAtomId: 'F2', order: 1, type: 'covalent' },
      { id: 'b3', sourceAtomId: 'S1', targetAtomId: 'F3', order: 1, type: 'covalent' },
      { id: 'b4', sourceAtomId: 'S1', targetAtomId: 'F4', order: 1, type: 'covalent' },
      { id: 'b5', sourceAtomId: 'S1', targetAtomId: 'F5', order: 1, type: 'covalent' },
      { id: 'b6', sourceAtomId: 'S1', targetAtomId: 'F6', order: 1, type: 'covalent' },
    ],
    tags: ['octahedral', 'hypervalent', 'inert-gas'],
  },

  // 10. Phosphorus Pentachloride (PCl5)
  {
    id: 'pcl5',
    name: 'Phosphorus Pentachloride',
    formula: 'PCl5',
    formattedFormula: 'PCl₅',
    iupacName: 'Pentachloro-λ5-phosphane',
    molarMass: 208.24,
    vseprGeometry: 'Trigonal Bipyramidal (90° / 120°)',
    pointGroup: 'D3h',
    dipoleMomentDebye: 0.0,
    isPolar: false,
    category: 'inorganic',
    description: 'Hypervalent VSEPR geometry showcasing three equatorial and two longer axial ligands.',
    atoms: [
      { id: 'P1', element: 'P', x: 0.0, y: 0.0, z: 0.0, hybridization: 'sp3d' },
      { id: 'Cl1', element: 'Cl', x: 2.02, y: 0.0, z: 0.0 },
      { id: 'Cl2', element: 'Cl', x: -1.01, y: 1.75, z: 0.0 },
      { id: 'Cl3', element: 'Cl', x: -1.01, y: -1.75, z: 0.0 },
      { id: 'Cl4', element: 'Cl', x: 0.0, y: 0.0, z: 2.14 },
      { id: 'Cl5', element: 'Cl', x: 0.0, y: 0.0, z: -2.14 },
    ],
    bonds: [
      { id: 'b1', sourceAtomId: 'P1', targetAtomId: 'Cl1', order: 1, type: 'covalent' },
      { id: 'b2', sourceAtomId: 'P1', targetAtomId: 'Cl2', order: 1, type: 'covalent' },
      { id: 'b3', sourceAtomId: 'P1', targetAtomId: 'Cl3', order: 1, type: 'covalent' },
      { id: 'b4', sourceAtomId: 'P1', targetAtomId: 'Cl4', order: 1, type: 'covalent' },
      { id: 'b5', sourceAtomId: 'P1', targetAtomId: 'Cl5', order: 1, type: 'covalent' },
    ],
    tags: ['trigonal-bipyramidal', 'axial-equatorial'],
  },

  // 11. Methanol (CH3OH)
  {
    id: 'ch3oh',
    name: 'Methanol',
    formula: 'CH3OH',
    formattedFormula: 'CH₃OH',
    iupacName: 'Methanol',
    molarMass: 32.04,
    vseprGeometry: 'Tetrahedral Carbon, Bent Oxygen (108.9°)',
    pointGroup: 'Cs',
    dipoleMomentDebye: 1.70,
    isPolar: true,
    category: 'organic',
    description: 'Simplest aliphatic alcohol; forms hydrogen bonds and miscible with water in all proportions.',
    atoms: [
      { id: 'C1', element: 'C', x: -0.66, y: 0.0, z: 0.0, hybridization: 'sp3' },
      { id: 'O1', element: 'O', x: 0.74, y: 0.0, z: 0.0, hybridization: 'sp3' },
      { id: 'H1', element: 'H', x: 1.13, y: 0.89, z: 0.0, hybridization: 's' },
      { id: 'H2', element: 'H', x: -1.02, y: -0.51, z: 0.89, hybridization: 's' },
      { id: 'H3', element: 'H', x: -1.02, y: -0.51, z: -0.89, hybridization: 's' },
      { id: 'H4', element: 'H', x: -1.02, y: 1.02, z: 0.0, hybridization: 's' },
    ],
    bonds: [
      { id: 'b1', sourceAtomId: 'C1', targetAtomId: 'O1', order: 1, type: 'polar-covalent' },
      { id: 'b2', sourceAtomId: 'O1', targetAtomId: 'H1', order: 1, type: 'polar-covalent' },
      { id: 'b3', sourceAtomId: 'C1', targetAtomId: 'H2', order: 1, type: 'covalent' },
      { id: 'b4', sourceAtomId: 'C1', targetAtomId: 'H3', order: 1, type: 'covalent' },
      { id: 'b5', sourceAtomId: 'C1', targetAtomId: 'H4', order: 1, type: 'covalent' },
    ],
    tags: ['alcohol', 'solvent', 'polar', 'hydroxyl'],
  },

  // 12. Acetic Acid (CH3COOH)
  {
    id: 'ch3cooh',
    name: 'Acetic Acid',
    formula: 'CH3COOH',
    formattedFormula: 'CH₃COOH',
    iupacName: 'Ethanoic acid',
    molarMass: 60.052,
    vseprGeometry: 'Trigonal Planar Carbonyl (120°)',
    pointGroup: 'Cs',
    dipoleMomentDebye: 1.74,
    isPolar: true,
    category: 'organic',
    description: 'Prototypical carboxylic acid (vinegar); planar carboxyl group capable of cyclic hydrogen-bonded dimer formation.',
    atoms: [
      { id: 'C1', element: 'C', x: 0.08, y: 0.12, z: 0.0, hybridization: 'sp2' },
      { id: 'O1', element: 'O', x: 0.63, y: 1.20, z: 0.0, hybridization: 'sp2' },
      { id: 'O2', element: 'O', x: 0.77, y: -1.05, z: 0.0, hybridization: 'sp3' },
      { id: 'H1', element: 'H', x: 1.72, y: -0.86, z: 0.0, hybridization: 's' },
      { id: 'C2', element: 'C', x: -1.41, y: -0.09, z: 0.0, hybridization: 'sp3' },
      { id: 'H2', element: 'H', x: -1.89, y: 0.89, z: 0.0, hybridization: 's' },
      { id: 'H3', element: 'H', x: -1.69, y: -0.63, z: 0.89, hybridization: 's' },
      { id: 'H4', element: 'H', x: -1.69, y: -0.63, z: -0.89, hybridization: 's' },
    ],
    bonds: [
      { id: 'b1', sourceAtomId: 'C1', targetAtomId: 'O1', order: 2, type: 'polar-covalent' },
      { id: 'b2', sourceAtomId: 'C1', targetAtomId: 'O2', order: 1, type: 'polar-covalent' },
      { id: 'b3', sourceAtomId: 'O2', targetAtomId: 'H1', order: 1, type: 'polar-covalent' },
      { id: 'b4', sourceAtomId: 'C1', targetAtomId: 'C2', order: 1, type: 'covalent' },
      { id: 'b5', sourceAtomId: 'C2', targetAtomId: 'H2', order: 1, type: 'covalent' },
      { id: 'b6', sourceAtomId: 'C2', targetAtomId: 'H3', order: 1, type: 'covalent' },
      { id: 'b7', sourceAtomId: 'C2', targetAtomId: 'H4', order: 1, type: 'covalent' },
    ],
    tags: ['acid', 'carboxylic', 'vinegar', 'polar'],
  },

  // 13. Boron Trifluoride (BF3)
  {
    id: 'bf3',
    name: 'Boron Trifluoride',
    formula: 'BF3',
    formattedFormula: 'BF₃',
    iupacName: 'Trifluoroborane',
    molarMass: 67.81,
    vseprGeometry: 'Trigonal Planar (120°)',
    pointGroup: 'D3h',
    dipoleMomentDebye: 0.0,
    isPolar: false,
    category: 'inorganic',
    description: 'Classic electron-deficient Lewis acid; trigonal planar with an empty 2pz orbital on boron.',
    atoms: [
      { id: 'B1', element: 'B', x: 0.0, y: 0.0, z: 0.0, hybridization: 'sp2' },
      { id: 'F1', element: 'F', x: 1.31, y: 0.0, z: 0.0 },
      { id: 'F2', element: 'F', x: -0.655, y: 1.135, z: 0.0 },
      { id: 'F3', element: 'F', x: -0.655, y: -1.135, z: 0.0 },
    ],
    bonds: [
      { id: 'b1', sourceAtomId: 'B1', targetAtomId: 'F1', order: 1, type: 'covalent' },
      { id: 'b2', sourceAtomId: 'B1', targetAtomId: 'F2', order: 1, type: 'covalent' },
      { id: 'b3', sourceAtomId: 'B1', targetAtomId: 'F3', order: 1, type: 'covalent' },
    ],
    tags: ['trigonal-planar', 'lewis-acid', 'nonpolar'],
  },

  // 14. Sulfur Dioxide (SO2)
  {
    id: 'so2',
    name: 'Sulfur Dioxide',
    formula: 'SO2',
    formattedFormula: 'SO₂',
    iupacName: 'Sulfur dioxide',
    molarMass: 64.066,
    vseprGeometry: 'Bent (119.0°)',
    pointGroup: 'C2v',
    dipoleMomentDebye: 1.63,
    isPolar: true,
    category: 'atmospheric',
    description: 'Pungent volcanic gas; bent geometry derived from trigonal planar electron domain geometry with one lone pair.',
    atoms: [
      { id: 'S1', element: 'S', x: 0.0, y: 0.0, z: 0.36, hybridization: 'sp2' },
      { id: 'O1', element: 'O', x: 0.0, y: 1.25, z: -0.36, hybridization: 'sp2' },
      { id: 'O2', element: 'O', x: 0.0, y: -1.25, z: -0.36, hybridization: 'sp2' },
    ],
    bonds: [
      { id: 'b1', sourceAtomId: 'S1', targetAtomId: 'O1', order: 1.5, type: 'polar-covalent' },
      { id: 'b2', sourceAtomId: 'S1', targetAtomId: 'O2', order: 1.5, type: 'polar-covalent' },
    ],
    tags: ['bent', 'gas', 'resonance', 'polar'],
  },
];
