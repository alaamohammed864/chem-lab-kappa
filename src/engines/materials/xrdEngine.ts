// X-Ray Diffraction (XRD) Simulation, Bragg's Law & Crystallite Size Analysis Engine
import { XRD_PATTERNS_DATA, XRD_SAMPLES } from '../../data/crystals';
import { XRDPatternData } from '../../types';

export interface XRayRadiationSource {
  id: string;
  name: string;
  symbol: string;
  anode: string;
  wavelengthAngstrom: number; // Å
  energyKeV: number;
  description: string;
}

export const XRD_SOURCES: Record<string, XRayRadiationSource> = {
  'cu-ka': {
    id: 'cu-ka',
    name: 'Copper K-alpha (Cu-Kα)',
    symbol: 'Cu-Kα',
    anode: 'Cu',
    wavelengthAngstrom: 1.54060,
    energyKeV: 8.048,
    description: 'Universal laboratory anode wavelength (weighted average of Kα1 1.54056 Å and Kα2 1.54439 Å).',
  },
  'mo-ka': {
    id: 'mo-ka',
    name: 'Molybdenum K-alpha (Mo-Kα)',
    symbol: 'Mo-Kα',
    anode: 'Mo',
    wavelengthAngstrom: 0.71073,
    energyKeV: 17.479,
    description: 'High-energy, short-wavelength radiation. Ideal for heavy elemental matrices, high 2θ reflection compression, and capillary transmission XRD.',
  },
  'co-ka': {
    id: 'co-ka',
    name: 'Cobalt K-alpha (Co-Kα)',
    symbol: 'Co-Kα',
    anode: 'Co',
    wavelengthAngstrom: 1.78901,
    energyKeV: 6.925,
    description: 'Selected for iron-rich and steel alloys to suppress fluorescence background produced by Cu-Kα.',
  },
  'fe-ka': {
    id: 'fe-ka',
    name: 'Iron K-alpha (Fe-Kα)',
    symbol: 'Fe-Kα',
    anode: 'Fe',
    wavelengthAngstrom: 1.93604,
    energyKeV: 6.404,
    description: 'Longer wavelength target providing higher angular separation at low 2θ diffraction angles.',
  },
  'cr-ka': {
    id: 'cr-ka',
    name: 'Chromium K-alpha (Cr-Kα)',
    symbol: 'Cr-Kα',
    anode: 'Cr',
    wavelengthAngstrom: 2.28970,
    energyKeV: 5.415,
    description: 'Specialized radiation standard for residual stress measurements in steels and titanium components.',
  },
};

export interface BraggsLawResult {
  twoThetaDeg: number;
  thetaDeg: number;
  thetaRad: number;
  dSpacingAngstrom: number;
  scatteringVectorQ: number; // Å^-1: q = 4*pi*sin(theta)/lambda
}

export interface ScherrerResult {
  twoThetaDeg: number;
  thetaDeg: number;
  fwhmObservedDeg: number;
  fwhmInstrumentalDeg: number;
  fwhmCorrectedDeg: number;
  fwhmCorrectedRad: number;
  crystalliteSizeNm: number;
  crystalliteSizeAngstrom: number;
  shapeFactorK: number;
  wavelengthAngstrom: number;
  assumptions: string[];
  limitations: string[];
}

export interface ComputedPeakData {
  index: number;
  hkl: string;
  phase: string;
  referenceTwoTheta: number; // Reference angle at Cu-Ka
  dSpacingAngstrom: number; // Intrinsic interplanar spacing (constant for material)
  twoThetaDeg: number; // Angle at active wavelength
  intensityPercent: number; // Relative peak height 0-100%
  fwhmDeg: number;
  crystalliteSizeNm: number;
  isObservable: boolean; // false if lambda > 2d (extinguished by geometric cutoff)
}

export interface DiffractogramScanPoint {
  twoTheta: number;
  intensity: number;
  baseline: number;
}

export interface DiffractogramScanResult {
  points: DiffractogramScanPoint[];
  minTwoTheta: number;
  maxTwoTheta: number;
  stepSize: number;
  peaks: ComputedPeakData[];
  maxIntensity: number;
  radiationName: string;
  wavelengthAngstrom: number;
}

/**
 * Calculates interplanar d-spacing via Bragg's Law: lambda = 2 * d * sin(theta)
 */
export function calculateBraggsLaw(
  twoThetaDeg: number,
  lambdaAngstrom = 1.54060
): { thetaRad: number; dSpacingAngstrom: number } {
  const thetaDeg = twoThetaDeg / 2;
  const thetaRad = (thetaDeg * Math.PI) / 180;
  const sinTheta = Math.sin(thetaRad);
  const dSpacing = sinTheta > 0 ? lambdaAngstrom / (2 * sinTheta) : 0;
  return {
    thetaRad,
    dSpacingAngstrom: Number(dSpacing.toFixed(4)),
  };
}

/**
 * Calculates diffraction angle 2θ from known d-spacing and radiation wavelength
 * lambda = 2 * d * sin(theta) => sin(theta) = lambda / (2 * d)
 */
export function calculateTwoThetaFromDSpacing(
  dSpacingAngstrom: number,
  lambdaAngstrom: number
): number | null {
  if (dSpacingAngstrom <= 0 || lambdaAngstrom <= 0) return null;
  const sinTheta = lambdaAngstrom / (2 * dSpacingAngstrom);
  if (sinTheta >= 1 || sinTheta <= 0) {
    // Beyond geometric reflection sphere limit (cutoff)
    return null;
  }
  const thetaRad = Math.asin(sinTheta);
  const twoThetaDeg = (2 * thetaRad * 180) / Math.PI;
  return Number(twoThetaDeg.toFixed(3));
}

/**
 * Enhanced Bragg's law calculation including scattering vector Q
 */
export function calculateFullBraggParameters(
  twoThetaDeg: number,
  lambdaAngstrom = 1.54060
): BraggsLawResult {
  const thetaDeg = twoThetaDeg / 2;
  const thetaRad = (thetaDeg * Math.PI) / 180;
  const sinTheta = Math.sin(thetaRad);
  const dSpacing = sinTheta > 0 ? lambdaAngstrom / (2 * sinTheta) : 0;
  const q = sinTheta > 0 ? (4 * Math.PI * sinTheta) / lambdaAngstrom : 0;

  return {
    twoThetaDeg,
    thetaDeg,
    thetaRad,
    dSpacingAngstrom: Number(dSpacing.toFixed(4)),
    scatteringVectorQ: Number(q.toFixed(4)),
  };
}

/**
 * Estimates mean coherent crystallite domain size using the Scherrer equation:
 * D = (K * lambda) / (beta * cos(theta))
 *
 * Parameters:
 * - twoThetaDeg: Peak position 2θ in degrees
 * - fwhmObservedDeg: Observed full width at half maximum (FWHM) in degrees
 * - lambdaAngstrom: Radiation wavelength (default Cu-Kα = 1.54060 Å)
 * - shapeFactorK: Dimensionless shape factor (typically 0.89 - 0.94, default 0.90)
 * - instrumentalBroadeningDeg: Instrumental FWHM resolution limit (default 0.08°)
 */
export function calculateScherrerCrystalliteSize(
  twoThetaDeg: number,
  fwhmObservedDeg = 0.22,
  lambdaAngstrom = 1.54060,
  shapeFactorK = 0.90,
  instrumentalBroadeningDeg = 0.08
): ScherrerResult {
  const thetaDeg = twoThetaDeg / 2;
  const thetaRad = (thetaDeg * Math.PI) / 180;

  // Instrumental broadening deconvolution (standard Gaussian approximation: beta_sample^2 = beta_obs^2 - beta_inst^2)
  let fwhmCorrectedDeg = fwhmObservedDeg;
  if (fwhmObservedDeg > instrumentalBroadeningDeg) {
    fwhmCorrectedDeg = Math.sqrt(
      Math.pow(fwhmObservedDeg, 2) - Math.pow(instrumentalBroadeningDeg, 2)
    );
  } else {
    // If measured width is narrower than instrument limit, floor to minimum physical threshold
    fwhmCorrectedDeg = 0.01;
  }

  // Convert corrected FWHM to radians
  const fwhmCorrectedRad = (fwhmCorrectedDeg * Math.PI) / 180;
  const cosTheta = Math.cos(thetaRad);

  // Wavelength in Angstroms => D in Angstroms, then convert to nm
  const crystalliteSizeAngstrom =
    cosTheta > 0 && fwhmCorrectedRad > 0
      ? (shapeFactorK * lambdaAngstrom) / (fwhmCorrectedRad * cosTheta)
      : 0;

  const crystalliteSizeNm = Number((crystalliteSizeAngstrom / 10).toFixed(2));

  return {
    twoThetaDeg,
    thetaDeg: Number(thetaDeg.toFixed(3)),
    fwhmObservedDeg: Number(fwhmObservedDeg.toFixed(3)),
    fwhmInstrumentalDeg: Number(instrumentalBroadeningDeg.toFixed(3)),
    fwhmCorrectedDeg: Number(fwhmCorrectedDeg.toFixed(4)),
    fwhmCorrectedRad: Number(fwhmCorrectedRad.toFixed(6)),
    crystalliteSizeNm,
    crystalliteSizeAngstrom: Number(crystalliteSizeAngstrom.toFixed(2)),
    shapeFactorK,
    wavelengthAngstrom: lambdaAngstrom,
    assumptions: [
      'Assumes strain-free crystallites; microstrain broadening is neglected (requires Williamson-Hall plot for separation).',
      'Assumes coherent diffraction domains are quasi-spherical with shape factor K ≈ 0.90.',
      'Instrumental broadening is removed via standard quadratic Gaussian profile subtraction.',
    ],
    limitations: [
      'Scherrer relationship is valid primarily for nanoscale crystallites in the range of 2 nm to ~100 nm.',
      'Above 100 nm, instrumental line broadening dominates peak width and renders crystallite size estimates inaccurate.',
      'Below 2 nm, significant amorphous diffuse scattering occurs and kinematic diffraction theory breaks down.',
    ],
  };
}

/**
 * Recalculates peak list for a selected sample under arbitrary radiation wavelength
 */
export function computeSamplePeaksForWavelength(
  sampleData: XRDPatternData,
  lambdaAngstrom: number,
  instrumentalBroadeningDeg = 0.08,
  shapeFactorK = 0.90
): ComputedPeakData[] {
  return sampleData.peaks.map((refPeak, idx) => {
    // Calculate reference d-spacing if not explicitly specified
    let dSpacing = refPeak.dSpacing;
    if (!dSpacing || dSpacing <= 0) {
      // Reference peaks in standard catalog are measured under Cu-Ka (1.54060 A)
      const braggRef = calculateBraggsLaw(refPeak.twoTheta, 1.54060);
      dSpacing = braggRef.dSpacingAngstrom;
    }

    // Shift 2theta position according to active wavelength
    const shiftedTwoTheta = calculateTwoThetaFromDSpacing(dSpacing, lambdaAngstrom);
    const isObservable = shiftedTwoTheta !== null && shiftedTwoTheta >= 5 && shiftedTwoTheta <= 160;

    const activeTwoTheta = shiftedTwoTheta !== null ? shiftedTwoTheta : refPeak.twoTheta;
    const fwhm = refPeak.fwhm || 0.22;

    const scherrer = calculateScherrerCrystalliteSize(
      activeTwoTheta,
      fwhm,
      lambdaAngstrom,
      shapeFactorK,
      instrumentalBroadeningDeg
    );

    return {
      index: idx + 1,
      hkl: refPeak.hkl,
      phase: refPeak.phase,
      referenceTwoTheta: refPeak.twoTheta,
      dSpacingAngstrom: Number(dSpacing.toFixed(4)),
      twoThetaDeg: activeTwoTheta,
      intensityPercent: refPeak.intensity,
      fwhmDeg: fwhm,
      crystalliteSizeNm: scherrer.crystalliteSizeNm,
      isObservable,
    };
  });
}

/**
 * Pseudo-Voigt line profile function for XRD peak shape simulation
 * Combines Gaussian and Lorentzian components (eta = Lorentzian fraction)
 */
function pseudoVoigtProfile(
  deltaTwoTheta: number,
  fwhm: number,
  lorentzianFraction = 0.5
): number {
  const halfWidth = fwhm / 2;
  const x = deltaTwoTheta;

  // Gaussian component: exp(-ln(2) * (x / halfWidth)^2)
  const g = Math.exp(-Math.LN2 * Math.pow(x / halfWidth, 2));

  // Lorentzian component: 1 / (1 + (x / halfWidth)^2)
  const l = 1 / (1 + Math.pow(x / halfWidth, 2));

  return (1 - lorentzianFraction) * g + lorentzianFraction * l;
}

/**
 * Generates continuous synthetic diffractogram scan data (points array)
 * across specified 2θ range and step size
 */
export function generateDiffractogramScan(params: {
  sampleData: XRDPatternData;
  lambdaAngstrom: number;
  minTwoTheta?: number;
  maxTwoTheta?: number;
  stepSize?: number;
  backgroundIntensity?: number; // base a.u.
  noiseLevel?: number; // random noise amplitude
  instrumentalBroadeningDeg?: number;
  shapeFactorK?: number;
}): DiffractogramScanResult {
  const {
    sampleData,
    lambdaAngstrom,
    minTwoTheta = 10,
    maxTwoTheta = 100,
    stepSize = 0.05,
    backgroundIntensity = 2.5,
    noiseLevel = 0.8,
    instrumentalBroadeningDeg = 0.08,
    shapeFactorK = 0.90,
  } = params;

  const computedPeaks = computeSamplePeaksForWavelength(
    sampleData,
    lambdaAngstrom,
    instrumentalBroadeningDeg,
    shapeFactorK
  );

  const points: DiffractogramScanPoint[] = [];
  const observablePeaks = computedPeaks.filter((p) => p.isObservable);

  let maxObservedIntensity = 0;

  // Generate continuous scan steps
  const steps = Math.round((maxTwoTheta - minTwoTheta) / stepSize);
  for (let i = 0; i <= steps; i++) {
    const twoTheta = Number((minTwoTheta + i * stepSize).toFixed(3));

    // Subtle background curvature (Air scattering and fluorescent background at low angles)
    const airScatter = 3.5 * Math.exp(-twoTheta / 18.0);
    const flatBase = backgroundIntensity;
    const baseValue = flatBase + airScatter;

    // Small deterministic pseudo-random noise
    const noise = (Math.sin(twoTheta * 73.13) * 0.5 + Math.cos(twoTheta * 157.8) * 0.5) * noiseLevel;

    // Sum peak profiles
    let peakContribution = 0;
    for (const peak of observablePeaks) {
      const delta = twoTheta - peak.twoThetaDeg;
      // Cut off beyond 5x FWHM for computational performance
      if (Math.abs(delta) < peak.fwhmDeg * 5) {
        const profile = pseudoVoigtProfile(delta, peak.fwhmDeg, 0.45);
        peakContribution += peak.intensityPercent * profile;
      }
    }

    const totalIntensity = Math.max(0, baseValue + peakContribution + noise);
    if (totalIntensity > maxObservedIntensity) {
      maxObservedIntensity = totalIntensity;
    }

    points.push({
      twoTheta,
      intensity: Number(totalIntensity.toFixed(2)),
      baseline: Number(baseValue.toFixed(2)),
    });
  }

  return {
    points,
    minTwoTheta,
    maxTwoTheta,
    stepSize,
    peaks: computedPeaks,
    maxIntensity: Math.max(100, Number(maxObservedIntensity.toFixed(1))),
    radiationName: sampleData.radiation,
    wavelengthAngstrom: lambdaAngstrom,
  };
}

/**
 * Returns available XRD reference datasets
 */
export function getAllXRDPatterns(): XRDPatternData[] {
  return Object.values(XRD_SAMPLES);
}

/**
 * Finds XRD pattern by material key or name
 */
export function getXRDPatternByMaterial(materialKeyOrName: string): XRDPatternData | undefined {
  if (XRD_SAMPLES[materialKeyOrName]) {
    return XRD_SAMPLES[materialKeyOrName];
  }
  return Object.values(XRD_SAMPLES).find((p) =>
    p.material.toLowerCase().includes(materialKeyOrName.toLowerCase()) ||
    (p.id && p.id.toLowerCase() === materialKeyOrName.toLowerCase())
  );
}

