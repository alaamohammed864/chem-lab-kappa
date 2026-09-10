// Materials Science & Metallurgy Service Layer
import { MATERIALS_DATA } from '../data/materials';
import { BRAVAIS_SYSTEMS, XRD_PATTERNS_DATA } from '../data/crystals';
import { MaterialItem, CrystalSystem, XRDPatternData } from '../types';
import {
  calculateInterplanarSpacing,
  calculateBraggsLaw,
  calculatePREN,
  calculateUltrasonicVelocities,
} from '../engines';

export class MaterialsService {
  /**
   * Retrieves all engineering materials
   */
  static getMaterials(): MaterialItem[] {
    return MATERIALS_DATA;
  }

  /**
   * Filter materials by category and query string
   */
  static searchMaterials(query: string, category = 'all'): MaterialItem[] {
    const q = query.trim().toLowerCase();
    return MATERIALS_DATA.filter((mat) => {
      const matchesSearch =
        !q ||
        mat.name.toLowerCase().includes(q) ||
        mat.designation.toLowerCase().includes(q) ||
        (mat.formula && mat.formula.toLowerCase().includes(q));
      const matchesCategory = category === 'all' || mat.category === category;
      return matchesSearch && matchesCategory;
    });
  }

  /**
   * Retrieves all Bravais crystal systems
   */
  static getCrystalSystems(): CrystalSystem[] {
    return BRAVAIS_SYSTEMS;
  }

  /**
   * Retrieves all XRD reference spectra
   */
  static getXRDPatterns(): XRDPatternData[] {
    return XRD_PATTERNS_DATA;
  }

  /**
   * Evaluates interplanar d-spacing
   */
  static computeDSpacing(
    h: number,
    k: number,
    l: number,
    a: number,
    c?: number,
    system: 'cubic' | 'tetragonal' | 'hexagonal' = 'cubic'
  ): number {
    return calculateInterplanarSpacing(h, k, l, a, c, system);
  }

  /**
   * Evaluates Bragg's Law
   */
  static computeBraggsLaw(twoThetaDeg: number, wavelength = 1.5406) {
    return calculateBraggsLaw(twoThetaDeg, wavelength);
  }

  /**
   * Calculates PREN for an alloy composition
   */
  static computePREN(cr: number, mo: number, n: number, w = 0, name?: string) {
    return calculatePREN(cr, mo, n, w, name);
  }

  /**
   * Calculates ultrasonic velocities and impedance for an alloy
   */
  static computeUltrasonics(elasticModulusGPa: number, densityGramsPerCm3: number, poissonsRatio = 0.3) {
    return calculateUltrasonicVelocities(elasticModulusGPa, densityGramsPerCm3, poissonsRatio);
  }
}
