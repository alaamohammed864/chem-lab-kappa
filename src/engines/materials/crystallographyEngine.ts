// Crystallography & Bravais Lattice Computation Engine
import { BRAVAIS_SYSTEMS } from '../../data/crystals';
import { CrystalSystem } from '../../types';

export interface MillerSpacingResult {
  h: number;
  k: number;
  l: number;
  latticeConstantA: number; // Å
  latticeConstantC?: number; // Å
  system: 'cubic' | 'tetragonal' | 'hexagonal';
  dSpacingAngstrom: number;
  interplanarAngleDeg?: number;
}

export interface UnitCellMetrics {
  systemId: string;
  name: string;
  atomsPerUnitCell: number;
  coordinationNumber: number;
  atomicPackingFactor: number; // APF (0 to 1)
  latticeParamA: number; // Å
  latticeParamC?: number; // Å (for HCP/tetragonal)
  atomicRadiusR: number; // Å
  nearestNeighborDistance: number; // Å
  secondNearestNeighborDistance?: number; // Å
  unitCellVolumeAngstrom3: number; // Å³
  theoreticalDensityGramsPerCm3: number; // g/cm³
  atomicMassGramsPerMol?: number;
  formulaRelation: string;
}

export interface AtomFractionalCoordinate {
  x: number; // fractional 0..1
  y: number; // fractional 0..1
  z: number; // fractional 0..1
  site: 'corner' | 'body-center' | 'face-center' | 'interior' | 'basal-center';
  label?: string;
}

/**
 * Calculates interplanar spacing d_{hkl} for cubic, tetragonal, and hexagonal crystal systems
 */
export function calculateInterplanarSpacing(
  h: number,
  k: number,
  l: number,
  a: number,
  c?: number,
  system: 'cubic' | 'tetragonal' | 'hexagonal' = 'cubic'
): number {
  if (a <= 0) return 0;
  const sumSquares = h * h + k * k + l * l;
  if (sumSquares === 0) return 0;

  if (system === 'cubic') {
    // d = a / sqrt(h^2 + k^2 + l^2)
    return Number((a / Math.sqrt(sumSquares)).toFixed(4));
  } else if (system === 'tetragonal' && c && c > 0) {
    // 1/d^2 = (h^2 + k^2)/a^2 + l^2/c^2
    const term1 = (h * h + k * k) / (a * a);
    const term2 = (l * l) / (c * c);
    return Number((1 / Math.sqrt(term1 + term2)).toFixed(4));
  } else if (system === 'hexagonal' && c && c > 0) {
    // 1/d^2 = 4/3 * (h^2 + hk + k^2)/a^2 + l^2/c^2
    const term1 = (4 / 3) * ((h * h + h * k + k * k) / (a * a));
    const term2 = (l * l) / (c * c);
    return Number((1 / Math.sqrt(term1 + term2)).toFixed(4));
  }

  // Default cubic fallback
  return Number((a / Math.sqrt(sumSquares)).toFixed(4));
}

/**
 * Returns available Bravais crystal systems
 */
export function getAllCrystalSystems(): CrystalSystem[] {
  return BRAVAIS_SYSTEMS;
}

/**
 * Returns crystal system by ID
 */
export function getCrystalSystemById(id: string): CrystalSystem | undefined {
  return BRAVAIS_SYSTEMS.find((sys) => sys.id === id);
}

/**
 * Calculates theoretical density from lattice constant, atomic mass, atoms per cell
 * rho = (n * M) / (V_cell * N_A)
 */
export function calculateTheoreticalDensity(
  atomsPerUnitCell: number,
  atomicMassGramsPerMol: number,
  volumeAngstromsCubed: number
): number {
  if (volumeAngstromsCubed <= 0) return 0;
  const AVOGADRO = 6.02214076e23;
  // Volume in cm^3: 1 A^3 = 1e-24 cm^3
  const volumeCm3 = volumeAngstromsCubed * 1e-24;
  const massPerCellGrams = (atomsPerUnitCell * atomicMassGramsPerMol) / AVOGADRO;
  return Number((massPerCellGrams / volumeCm3).toFixed(3)); // g/cm³
}

/**
 * Comprehensive Unit Cell calculation for SC, BCC, FCC, HCP
 * Given lattice parameter a (in Å) and optional element atomic mass (g/mol)
 */
export function calculateCrystalMetrics(
  systemId: 'sc' | 'bcc' | 'fcc' | 'hcp',
  latticeParamA: number,
  atomicMassGramsPerMol: number = 55.845, // default iron / transition metal
  cOverARatio: number = 1.633 // ideal for HCP
): UnitCellMetrics {
  const a = Math.max(0.1, latticeParamA);

  if (systemId === 'sc') {
    // Simple Cubic: a = 2R, atoms per cell = 1, CN = 6
    const R = a / 2;
    const n = 1;
    const CN = 6;
    const apf = Math.PI / 6; // ~0.5236
    const dNN = a;
    const d2NN = a * Math.SQRT2;
    const volume = a * a * a;
    const density = calculateTheoreticalDensity(n, atomicMassGramsPerMol, volume);

    return {
      systemId: 'sc',
      name: 'Simple Cubic (SC)',
      atomsPerUnitCell: n,
      coordinationNumber: CN,
      atomicPackingFactor: Number(apf.toFixed(3)),
      latticeParamA: a,
      atomicRadiusR: Number(R.toFixed(4)),
      nearestNeighborDistance: Number(dNN.toFixed(4)),
      secondNearestNeighborDistance: Number(d2NN.toFixed(4)),
      unitCellVolumeAngstrom3: Number(volume.toFixed(3)),
      theoreticalDensityGramsPerCm3: density,
      atomicMassGramsPerMol,
      formulaRelation: 'a = 2R, APF = π/6 ≈ 0.524',
    };
  }

  if (systemId === 'bcc') {
    // Body-Centered Cubic: 4R = a*sqrt(3) -> R = a*sqrt(3)/4, atoms per cell = 2, CN = 8
    const R = (a * Math.sqrt(3)) / 4;
    const n = 2;
    const CN = 8;
    const apf = (Math.sqrt(3) * Math.PI) / 8; // ~0.6802
    const dNN = 2 * R; // = a * sqrt(3) / 2
    const d2NN = a;
    const volume = a * a * a;
    const density = calculateTheoreticalDensity(n, atomicMassGramsPerMol, volume);

    return {
      systemId: 'bcc',
      name: 'Body-Centered Cubic (BCC)',
      atomsPerUnitCell: n,
      coordinationNumber: CN,
      atomicPackingFactor: Number(apf.toFixed(3)),
      latticeParamA: a,
      atomicRadiusR: Number(R.toFixed(4)),
      nearestNeighborDistance: Number(dNN.toFixed(4)),
      secondNearestNeighborDistance: Number(d2NN.toFixed(4)),
      unitCellVolumeAngstrom3: Number(volume.toFixed(3)),
      theoreticalDensityGramsPerCm3: density,
      atomicMassGramsPerMol,
      formulaRelation: 'a = 4R/√3, APF = √3π/8 ≈ 0.680',
    };
  }

  if (systemId === 'fcc') {
    // Face-Centered Cubic: 4R = a*sqrt(2) -> R = a / (2*sqrt(2)), atoms per cell = 4, CN = 12
    const R = a / (2 * Math.SQRT2);
    const n = 4;
    const CN = 12;
    const apf = Math.PI / (3 * Math.SQRT2); // ~0.7405
    const dNN = 2 * R; // = a / sqrt(2)
    const d2NN = a;
    const volume = a * a * a;
    const density = calculateTheoreticalDensity(n, atomicMassGramsPerMol, volume);

    return {
      systemId: 'fcc',
      name: 'Face-Centered Cubic (FCC)',
      atomsPerUnitCell: n,
      coordinationNumber: CN,
      atomicPackingFactor: Number(apf.toFixed(3)),
      latticeParamA: a,
      atomicRadiusR: Number(R.toFixed(4)),
      nearestNeighborDistance: Number(dNN.toFixed(4)),
      secondNearestNeighborDistance: Number(d2NN.toFixed(4)),
      unitCellVolumeAngstrom3: Number(volume.toFixed(3)),
      theoreticalDensityGramsPerCm3: density,
      atomicMassGramsPerMol,
      formulaRelation: 'a = 2R√2, APF = π/(3√2) ≈ 0.740',
    };
  }

  // Hexagonal Close-Packed (HCP): a = 2R, c = a * cOverARatio, n = 6 (full prism) or 2 (primitive)
  const R = a / 2;
  const c = a * cOverARatio;
  const n = 6; // full hexagonal prism basis
  const CN = 12;
  const apf = Math.PI / (3 * Math.SQRT2); // ~0.7405 for ideal c/a
  const dNN = a; // for ideal c/a = 1.633, distance to 6 in-plane & 6 out-of-plane is a
  // Hexagonal prism volume = (3 * sqrt(3) / 2) * a^2 * c
  const volume = ((3 * Math.sqrt(3)) / 2) * a * a * c;
  const density = calculateTheoreticalDensity(n, atomicMassGramsPerMol, volume);

  return {
    systemId: 'hcp',
    name: 'Hexagonal Close-Packed (HCP)',
    atomsPerUnitCell: n,
    coordinationNumber: CN,
    atomicPackingFactor: Number(apf.toFixed(3)),
    latticeParamA: a,
    latticeParamC: Number(c.toFixed(4)),
    atomicRadiusR: Number(R.toFixed(4)),
    nearestNeighborDistance: Number(dNN.toFixed(4)),
    unitCellVolumeAngstrom3: Number(volume.toFixed(3)),
    theoreticalDensityGramsPerCm3: density,
    atomicMassGramsPerMol,
    formulaRelation: 'a = 2R, c/a = √(8/3) ≈ 1.633, APF ≈ 0.740',
  };
}

/**
 * Returns fractional atomic coordinates within the unit cell for 3D visualization
 */
export function getAtomicCoordinates(systemId: string): AtomFractionalCoordinate[] {
  if (systemId === 'sc') {
    // 8 corners
    return [
      { x: 0, y: 0, z: 0, site: 'corner' },
      { x: 1, y: 0, z: 0, site: 'corner' },
      { x: 0, y: 1, z: 0, site: 'corner' },
      { x: 1, y: 1, z: 0, site: 'corner' },
      { x: 0, y: 0, z: 1, site: 'corner' },
      { x: 1, y: 0, z: 1, site: 'corner' },
      { x: 0, y: 1, z: 1, site: 'corner' },
      { x: 1, y: 1, z: 1, site: 'corner' },
    ];
  }

  if (systemId === 'bcc') {
    // 8 corners + 1 body center
    return [
      { x: 0, y: 0, z: 0, site: 'corner' },
      { x: 1, y: 0, z: 0, site: 'corner' },
      { x: 0, y: 1, z: 0, site: 'corner' },
      { x: 1, y: 1, z: 0, site: 'corner' },
      { x: 0, y: 0, z: 1, site: 'corner' },
      { x: 1, y: 0, z: 1, site: 'corner' },
      { x: 0, y: 1, z: 1, site: 'corner' },
      { x: 1, y: 1, z: 1, site: 'corner' },
      { x: 0.5, y: 0.5, z: 0.5, site: 'body-center' },
    ];
  }

  if (systemId === 'fcc') {
    // 8 corners + 6 face centers
    return [
      { x: 0, y: 0, z: 0, site: 'corner' },
      { x: 1, y: 0, z: 0, site: 'corner' },
      { x: 0, y: 1, z: 0, site: 'corner' },
      { x: 1, y: 1, z: 0, site: 'corner' },
      { x: 0, y: 0, z: 1, site: 'corner' },
      { x: 1, y: 0, z: 1, site: 'corner' },
      { x: 0, y: 1, z: 1, site: 'corner' },
      { x: 1, y: 1, z: 1, site: 'corner' },
      // 6 face centers
      { x: 0.5, y: 0.5, z: 0, site: 'face-center' },
      { x: 0.5, y: 0.5, z: 1, site: 'face-center' },
      { x: 0.5, y: 0, z: 0.5, site: 'face-center' },
      { x: 0.5, y: 1, z: 0.5, site: 'face-center' },
      { x: 0, y: 0.5, z: 0.5, site: 'face-center' },
      { x: 1, y: 0.5, z: 0.5, site: 'face-center' },
    ];
  }

  if (systemId === 'hcp') {
    // Hexagonal prism coordinates:
    // Basal bottom (z=0): 6 corners + center
    // Basal top (z=1): 6 corners + center
    // Midplane (z=0.5): 3 interior atoms
    const coords: AtomFractionalCoordinate[] = [];
    const angles = [0, 60, 120, 180, 240, 300];

    // Bottom basal plane
    coords.push({ x: 0, y: 0, z: 0, site: 'basal-center' });
    angles.forEach((deg) => {
      const rad = (deg * Math.PI) / 180;
      coords.push({ x: Math.cos(rad), y: Math.sin(rad), z: 0, site: 'corner' });
    });

    // Top basal plane
    coords.push({ x: 0, y: 0, z: 1, site: 'basal-center' });
    angles.forEach((deg) => {
      const rad = (deg * Math.PI) / 180;
      coords.push({ x: Math.cos(rad), y: Math.sin(rad), z: 1, site: 'corner' });
    });

    // 3 interior atoms in the middle layer (z = 0.5)
    // Located at distance 1/sqrt(3) from center at angles 30°, 150°, 270°
    const midAngles = [30, 150, 270];
    const rMid = 1 / Math.sqrt(3);
    midAngles.forEach((deg) => {
      const rad = (deg * Math.PI) / 180;
      coords.push({ x: rMid * Math.cos(rad), y: rMid * Math.sin(rad), z: 0.5, site: 'interior' });
    });

    return coords;
  }

  // Fallback corners
  return [
    { x: 0, y: 0, z: 0, site: 'corner' },
    { x: 1, y: 0, z: 0, site: 'corner' },
    { x: 0, y: 1, z: 0, site: 'corner' },
    { x: 1, y: 1, z: 0, site: 'corner' },
    { x: 0, y: 0, z: 1, site: 'corner' },
    { x: 1, y: 0, z: 1, site: 'corner' },
    { x: 0, y: 1, z: 1, site: 'corner' },
    { x: 1, y: 1, z: 1, site: 'corner' },
  ];
}
