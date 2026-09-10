// Molecule Engine
// Separates pure chemical data and computational geometry from rendering/visualization.
// Computes atomic centroids, bounding spheres, bond distances, bond angles,
// and CPK color assignments.

import { MOLECULES_DATABASE, MoleculeData, MoleculeAtom, MoleculeBond } from '../../data/moleculesData';

export type { MoleculeData, MoleculeAtom, MoleculeBond };

// Standard CPK Color Palette (Corey-Pauling-Koltun)
export const CPK_COLORS: Record<string, string> = {
  H: '#FFFFFF',   // White
  C: '#334155',   // Slate Charcoal
  N: '#3B82F6',   // Deep Sky Blue
  O: '#EF4444',   // Red
  F: '#22C55E',   // Green
  Cl: '#10B981',  // Emerald Green
  Br: '#B91C1C',  // Dark Red/Brown
  I: '#7C3AED',   // Violet
  S: '#EAB308',   // Yellow
  P: '#F97316',   // Orange
  B: '#F472B6',   // Pinkish Salmon
  Si: '#94A3B8',  // Light Grey
  Fe: '#D97706',  // Rust
  Cu: '#CA8A04',  // Bronze
  DEFAULT: '#A855F7', // Purple fallback
};

// Covalent Radii in Ångströms (Cordero et al., 2008)
export const COVALENT_RADII: Record<string, number> = {
  H: 0.31,
  C: 0.76,
  N: 0.71,
  O: 0.66,
  F: 0.57,
  Cl: 1.02,
  Br: 1.20,
  I: 1.39,
  S: 1.05,
  P: 1.07,
  B: 0.84,
  Si: 1.11,
  DEFAULT: 0.75,
};

// Van der Waals Radii in Ångströms (Bondi, 1964)
export const VDW_RADII: Record<string, number> = {
  H: 1.20,
  C: 1.70,
  N: 1.55,
  O: 1.52,
  F: 1.47,
  Cl: 1.75,
  Br: 1.85,
  I: 1.98,
  S: 1.80,
  P: 1.80,
  B: 1.92,
  Si: 2.10,
  DEFAULT: 1.60,
};

/**
 * Returns the CPK hex color for a given chemical element
 */
export function getCPKColor(element: string): string {
  const sym = element.trim();
  return CPK_COLORS[sym] || CPK_COLORS.DEFAULT;
}

/**
 * Returns the covalent radius in Ångströms
 */
export function getCovalentRadius(element: string): number {
  const sym = element.trim();
  return COVALENT_RADII[sym] || COVALENT_RADII.DEFAULT;
}

/**
 * Returns the Van der Waals radius in Ångströms
 */
export function getVanDerWaalsRadius(element: string): number {
  const sym = element.trim();
  return VDW_RADII[sym] || VDW_RADII.DEFAULT;
}

/**
 * Computes the geometric centroid (center of mass approximation) of a molecule's atoms
 */
export function computeCentroid(atoms: MoleculeAtom[]): [number, number, number] {
  if (!atoms || atoms.length === 0) return [0, 0, 0];
  let sx = 0, sy = 0, sz = 0;
  for (const a of atoms) {
    sx += a.x;
    sy += a.y;
    sz += a.z;
  }
  const n = atoms.length;
  return [sx / n, sy / n, sz / n];
}

/**
 * Computes the bounding sphere radius from centroid
 */
export function computeBoundingRadius(atoms: MoleculeAtom[], centroid?: [number, number, number]): number {
  const [cx, cy, cz] = centroid || computeCentroid(atoms);
  let maxDistSq = 0;
  for (const a of atoms) {
    const dx = a.x - cx;
    const dy = a.y - cy;
    const dz = a.z - cz;
    const distSq = dx * dx + dy * dy + dz * dz;
    if (distSq > maxDistSq) maxDistSq = distSq;
  }
  return Math.sqrt(maxDistSq);
}

/**
 * Calculates Euclidean bond distance between two atoms in Ångströms
 */
export function calculateBondLength(a1: MoleculeAtom, a2: MoleculeAtom): number {
  const dx = a1.x - a2.x;
  const dy = a1.y - a2.y;
  const dz = a1.z - a2.z;
  return parseFloat(Math.sqrt(dx * dx + dy * dy + dz * dz).toFixed(3));
}

/**
 * Calculates bond angle in degrees between three atoms (a1 - vertex - a2)
 */
export function calculateBondAngle(a1: MoleculeAtom, vertex: MoleculeAtom, a2: MoleculeAtom): number {
  const v1 = [a1.x - vertex.x, a1.y - vertex.y, a1.z - vertex.z];
  const v2 = [a2.x - vertex.x, a2.y - vertex.y, a2.z - vertex.z];

  const dot = v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
  const mag1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1] + v1[2] * v1[2]);
  const mag2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1] + v2[2] * v2[2]);

  if (mag1 === 0 || mag2 === 0) return 0;
  const cosTheta = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  return parseFloat(((Math.acos(cosTheta) * 180) / Math.PI).toFixed(1));
}

/**
 * Retrieves molecule by unique ID
 */
export function getMoleculeById(id: string): MoleculeData | undefined {
  const idLower = id.toLowerCase().trim();
  return MOLECULES_DATABASE.find(
    (m) =>
      m.id.toLowerCase() === idLower ||
      m.formula.toLowerCase() === idLower ||
      m.name.toLowerCase() === idLower
  );
}

/**
 * Filters molecules database by keyword and category
 */
export function searchMolecules(query = '', category = 'all'): MoleculeData[] {
  const q = query.toLowerCase().trim();
  return MOLECULES_DATABASE.filter((m) => {
    if (category !== 'all' && m.category !== category) return false;
    if (q) {
      const matchName = m.name.toLowerCase().includes(q);
      const matchFormula = m.formula.toLowerCase().includes(q);
      const matchIupac = m.iupacName.toLowerCase().includes(q);
      const matchGeom = m.vseprGeometry.toLowerCase().includes(q);
      const matchDesc = m.description.toLowerCase().includes(q);
      const matchTags = m.tags.some((t) => t.toLowerCase().includes(q));
      return matchName || matchFormula || matchIupac || matchGeom || matchDesc || matchTags;
    }
    return true;
  });
}

/**
 * Exported Molecule Engine namespace
 */
export const MoleculeEngine = {
  allMolecules: MOLECULES_DATABASE,
  getMoleculeById,
  searchMolecules,
  computeCentroid,
  computeBoundingRadius,
  calculateBondLength,
  calculateBondAngle,
  getCPKColor,
  getCovalentRadius,
  getVanDerWaalsRadius,
};
