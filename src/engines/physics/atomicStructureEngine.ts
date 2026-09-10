import { ChemicalElement } from '../../types';

export interface Nucleon {
  id: string;
  type: 'proton' | 'neutron';
  x: number;
  y: number;
  z: number;
  charge: number; // +1 for proton, 0 for neutron
}

export interface ElectronParticle {
  id: string;
  shellIndex: number; // 0 for K (n=1), 1 for L (n=2), etc.
  shellName: string; // 'K', 'L', 'M', 'N', 'O', 'P', 'Q'
  n: number; // Principal quantum number
  angle: number; // Current orbital angle (radians)
  speed: number; // Angular orbital velocity (rad/s)
  radius: number; // Orbital radius in world units
  inclination: number; // Orbital plane tilt angle (radians)
  azimuth: number; // Orbital plane rotation (radians)
  subshell?: string; // e.g. "1s", "2p", "3d"
}

export interface ElectronShellInfo {
  n: number;
  name: string; // K, L, M, N, O, P, Q
  electrons: number;
  capacity: number; // 2n^2
  radius: number;
  energyEv: number;
}

export interface AtomicStructureModel {
  element: ChemicalElement;
  atomicNumber: number; // Z
  massNumber: number; // A
  protons: number;
  neutrons: number;
  electrons: number;
  netCharge: number;
  nucleons: Nucleon[];
  shells: ElectronShellInfo[];
  electronParticles: ElectronParticle[];
  effectiveNuclearCharge: number;
  bohrRadiusPm: number;
  ionizationEnergyKjMol?: number;
}

const SHELL_NAMES = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];

/**
 * Packs protons and neutrons into a dense, realistic 3D cluster using spherical layer packing.
 */
export function generateNucleusCluster(
  protons: number,
  neutrons: number,
  scale = 1.0
): Nucleon[] {
  const total = protons + neutrons;
  if (total <= 0) return [];

  const nucleons: Nucleon[] = [];
  const nucleonRadius = 0.38 * scale; // individual particle visual radius

  // Shuffle assignment deterministically using seeded alternation
  let pRemaining = protons;
  let nRemaining = neutrons;
  const types: ('proton' | 'neutron')[] = [];

  for (let i = 0; i < total; i++) {
    // Distribute proportionally
    const probProton = pRemaining / (pRemaining + nRemaining);
    if (Math.random() < probProton && pRemaining > 0) {
      types.push('proton');
      pRemaining--;
    } else if (nRemaining > 0) {
      types.push('neutron');
      nRemaining--;
    } else {
      types.push('proton');
      pRemaining--;
    }
  }

  // Golden spiral on sphere surface for concentric packing shells
  let placed = 0;
  const goldenRatio = (1 + Math.sqrt(5)) / 2;

  // Layer 0: Center (if total is small or odd)
  if (total === 1) {
    nucleons.push({
      id: `nucleon-0`,
      type: types[0],
      x: 0,
      y: 0,
      z: 0,
      charge: types[0] === 'proton' ? 1 : 0,
    });
    return nucleons;
  }

  // Multi-shell sphere packing algorithm:
  // As radius increases, each shell holds approx 4*pi*r^2 / area_of_circle
  let currentRadius = nucleonRadius * 0.9;
  let shellIndex = 0;

  while (placed < total) {
    const layerCapacity =
      shellIndex === 0
        ? Math.min(4, total - placed)
        : Math.min(Math.round(8 * Math.pow(shellIndex, 1.6)), total - placed);

    const countInLayer = Math.max(1, layerCapacity);

    for (let j = 0; j < countInLayer && placed < total; j++) {
      const idx = placed;
      const type = types[idx];

      // Fibonacci sphere lattice coordinates
      const theta = 2 * Math.PI * idx / goldenRatio;
      const phi = Math.acos(1 - 2 * (j + 0.5) / countInLayer);

      // Add a slight radial jitter for natural physical clustering
      const r = currentRadius * (1 + 0.08 * Math.sin(idx * 3.7));
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      nucleons.push({
        id: `nucleon-${idx}`,
        type,
        x,
        y,
        z,
        charge: type === 'proton' ? 1 : 0,
      });

      placed++;
    }

    shellIndex++;
    currentRadius += nucleonRadius * 1.35;
  }

  return nucleons;
}

/**
 * Calculates effective nuclear charge Z_eff using simplified Slater's rules.
 */
export function calculateZeff(z: number, shells: number[]): number {
  if (z <= 1) return 1.0;
  // Screening constant S:
  // Valence electrons in same group contribute 0.35 (or 0.30 for 1s)
  // (n-1) group electrons contribute 0.85
  // (n-2) and deeper contribute 1.00
  const n = shells.length;
  if (n === 1) {
    const s = (shells[0] - 1) * 0.30;
    return Math.max(1.0, z - s);
  }

  const valenceCount = shells[n - 1] - 1;
  const nextInnerCount = shells[n - 2] || 0;
  let deepCount = 0;
  for (let i = 0; i < n - 2; i++) {
    deepCount += shells[i];
  }

  const S = valenceCount * 0.35 + nextInnerCount * 0.85 + deepCount * 1.0;
  return Math.max(1.0, Number((z - S).toFixed(2)));
}

/**
 * Computes energy levels and shell geometries for any chemical element.
 */
export function buildAtomicStructure(
  element: ChemicalElement,
  options: {
    charge?: number; // ionic charge, default 0
    scaleRadius?: number;
  } = {}
): AtomicStructureModel {
  const charge = options.charge || 0;
  const z = element.protons || element.number;
  const a = Math.round(element.atomicMass);
  const neutrons = element.neutrons !== undefined ? element.neutrons : Math.max(0, a - z);
  const electrons = Math.max(0, z - charge);

  // Shell distributions from element data or standard Aufbau fallback
  let shellCounts: number[] = [];
  if (element.shells && element.shells.length > 0) {
    shellCounts = [...element.shells];
  } else {
    // Aufbau standard distribution
    let remaining = electrons;
    for (let n = 1; n <= 7 && remaining > 0; n++) {
      const cap = 2 * n * n;
      const take = Math.min(remaining, cap);
      shellCounts.push(take);
      remaining -= take;
    }
  }

  // Adjust for ionization charge if any
  if (charge !== 0) {
    let toRemove = charge;
    for (let i = shellCounts.length - 1; i >= 0 && toRemove > 0; i--) {
      const take = Math.min(shellCounts[i], toRemove);
      shellCounts[i] -= take;
      toRemove -= take;
    }
    // Filter empty trailing shells
    while (shellCounts.length > 1 && shellCounts[shellCounts.length - 1] === 0) {
      shellCounts.pop();
    }
  }

  const zEff = calculateZeff(z, shellCounts);

  // Shell Info & Radii
  // Scale radii visually so they are well-spaced for 3D inspection
  const baseRadius = 2.4 * (options.scaleRadius || 1.0);
  const shells: ElectronShellInfo[] = shellCounts.map((count, idx) => {
    const n = idx + 1;
    const capacity = 2 * n * n;
    // Visually aesthetic logarithmic/power scaling for concentric shells
    const radius = baseRadius + Math.pow(n, 1.25) * 1.55;
    // Bohr energy level approx: E_n = -13.6 * (Z_eff^2) / n^2
    const energyEv = Number((-13.6 * Math.pow(zEff, 2) / Math.pow(n, 2)).toFixed(2));

    return {
      n,
      name: SHELL_NAMES[idx] || `N${n}`,
      electrons: count,
      capacity,
      radius,
      energyEv,
    };
  });

  // Generate 3D Electron particle states
  const electronParticles: ElectronParticle[] = [];
  let particleIndex = 0;

  shells.forEach((shell) => {
    const count = shell.electrons;
    if (count <= 0) return;

    // Distribute electrons on orbital planes
    // For n=1 (K shell): 1 inclined plane
    // For higher shells: multi-inclined planes to give true 3D spatial electron cloud appearance
    const planesPerShell = Math.min(count, Math.max(1, Math.ceil(count / 4)));
    const electronsPerPlane = Math.ceil(count / planesPerShell);

    for (let i = 0; i < count; i++) {
      const planeIdx = Math.floor(i / electronsPerPlane);
      const indexInPlane = i % electronsPerPlane;
      const countInThisPlane = Math.min(electronsPerPlane, count - planeIdx * electronsPerPlane);

      // Equispaced angles on the plane
      const angle = (2 * Math.PI * indexInPlane) / countInThisPlane;

      // Keplerian-like speed: electrons closer to nucleus orbit faster: omega ~ 1 / n^1.4
      const speed = (1.4 / Math.pow(shell.n, 1.35)) * (planeIdx % 2 === 0 ? 1 : -1);

      // Vary plane tilt for visual richness
      const inclination = ((planeIdx * 55 + shell.n * 25) * Math.PI) / 180;
      const azimuth = ((planeIdx * 70 + shell.n * 40) * Math.PI) / 180;

      electronParticles.push({
        id: `electron-${shell.name}-${particleIndex++}`,
        shellIndex: shell.n - 1,
        shellName: shell.name,
        n: shell.n,
        angle,
        speed,
        radius: shell.radius,
        inclination,
        azimuth,
      });
    }
  });

  const nucleons = generateNucleusCluster(z, neutrons, 1.0);

  return {
    element,
    atomicNumber: z,
    massNumber: a,
    protons: z,
    neutrons,
    electrons,
    netCharge: charge,
    nucleons,
    shells,
    electronParticles,
    effectiveNuclearCharge: zEff,
    bohrRadiusPm: Math.round(52.9 / zEff),
    ionizationEnergyKjMol: element.ionizationEnergy,
  };
}
