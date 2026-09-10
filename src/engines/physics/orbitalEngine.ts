import { OrbitalType, QuantumNumbers, OrbitalState } from '../../types';

export interface OrbitalPointSample {
  x: number;
  y: number;
  z: number;
  value: number; // wavefunction value psi
  probability: number; // |psi|^2
  sign: 1 | -1; // phase (+1 or -1)
}

export interface RadialDistributionPoint {
  r: number; // in Bohr radii a_0
  density: number; // P(r) = r^2 * |R(r)|^2
  amplitude: number; // R(r)
}

export interface OrbitalCatalogItem {
  id: string;
  name: string;
  type: OrbitalType;
  n: number;
  l: number;
  m: number;
  formula: string;
  nodalPlanes: string;
  description: string;
}

export const ORBITAL_CATALOG: OrbitalCatalogItem[] = [
  // s Orbitals (l=0)
  {
    id: '1s',
    name: '1s',
    type: 's',
    n: 1,
    l: 0,
    m: 0,
    formula: 'ψ₁ₛ = (1/√π) · e⁻ʳ',
    nodalPlanes: 'None (0 radial, 0 angular)',
    description: 'Spherical ground state. Peak probability density is at r = 1 a₀.',
  },
  {
    id: '2s',
    name: '2s',
    type: 's',
    n: 2,
    l: 0,
    m: 0,
    formula: 'ψ₂ₛ = (1/4√2π) · (2 - r) · e⁻ʳ/²',
    nodalPlanes: '1 radial node at r = 2 a₀',
    description: 'Spherically symmetric with 1 concentric radial nodal sphere separating phase inversion.',
  },
  {
    id: '3s',
    name: '3s',
    type: 's',
    n: 3,
    l: 0,
    m: 0,
    formula: 'ψ₃ₛ = (1/81√3π) · (27 - 18r + 2r²) · e⁻ʳ/³',
    nodalPlanes: '2 radial nodes (r ≈ 1.9 a₀, 7.1 a₀)',
    description: 'Concentric spherical shells with 2 internal nodal zero-probability surfaces.',
  },

  // p Orbitals (l=1)
  {
    id: '2px',
    name: '2pₓ',
    type: 'p',
    n: 2,
    l: 1,
    m: 1,
    formula: 'ψ₂ₚₓ = (1/4√2π) · x · e⁻ʳ/²',
    nodalPlanes: 'yz-plane (x = 0)',
    description: 'Dumbbell-shaped orbital aligned along x-axis. Nodal plane at x = 0 with alternating wave phase.',
  },
  {
    id: '2py',
    name: '2p_y',
    type: 'p',
    n: 2,
    l: 1,
    m: -1,
    formula: 'ψ₂ₚᵧ = (1/4√2π) · y · e⁻ʳ/²',
    nodalPlanes: 'xz-plane (y = 0)',
    description: 'Dumbbell-shaped orbital aligned along y-axis with opposite wave phases across xz-plane.',
  },
  {
    id: '2pz',
    name: '2p_z',
    type: 'p',
    n: 2,
    l: 1,
    m: 0,
    formula: 'ψ₂ₚ𝓏 = (1/4√2π) · z · e⁻ʳ/²',
    nodalPlanes: 'xy-plane (z = 0)',
    description: 'Canonical axial p-orbital aligned along z-axis, perpendicular to xy equatorial plane.',
  },
  {
    id: '3pz',
    name: '3p_z',
    type: 'p',
    n: 3,
    l: 1,
    m: 0,
    formula: 'ψ₃ₚ𝓏 ∝ z · (6 - r/3) · e⁻ʳ/³',
    nodalPlanes: '1 radial node + xy-plane (angular)',
    description: 'Higher energy p-orbital containing both an angular nodal plane and an internal radial node.',
  },

  // d Orbitals (l=2)
  {
    id: '3dz2',
    name: '3d_z²',
    type: 'd',
    n: 3,
    l: 2,
    m: 0,
    formula: 'ψ₃𝒹𝓏² ∝ (3z² - r²) · e⁻ʳ/³',
    nodalPlanes: 'Two conical nodal surfaces (θ ≈ 54.7°)',
    description: 'Distinctive toroidal orbital featuring dual axial lobes along z-axis enclosed by an equatorial ring.',
  },
  {
    id: '3dxz',
    name: '3d_xz',
    type: 'd',
    n: 3,
    l: 2,
    m: 1,
    formula: 'ψ₃𝒹ₓ𝓏 ∝ xz · e⁻ʳ/³',
    nodalPlanes: 'xy-plane (z = 0) & yz-plane (x = 0)',
    description: 'Four-lobed cloverleaf orbital in the xz-plane with alternating phases between adjacent quadrants.',
  },
  {
    id: '3dyz',
    name: '3d_yz',
    type: 'd',
    n: 3,
    l: 2,
    m: -1,
    formula: 'ψ₃𝒹ᵧ𝓏 ∝ yz · e⁻ʳ/³',
    nodalPlanes: 'xy-plane (z = 0) & xz-plane (y = 0)',
    description: 'Four-lobed cloverleaf orbital oriented symmetrically in the yz-plane.',
  },
  {
    id: '3dxy',
    name: '3d_xy',
    type: 'd',
    n: 3,
    l: 2,
    m: -2,
    formula: 'ψ₃𝒹ₓᵧ ∝ xy · e⁻ʳ/³',
    nodalPlanes: 'xz-plane (y = 0) & yz-plane (x = 0)',
    description: 'Cloverleaf geometry in the xy-plane lying between the coordinate axes.',
  },
  {
    id: '3dx2-y2',
    name: '3d_x²-y²',
    type: 'd',
    n: 3,
    l: 2,
    m: 2,
    formula: 'ψ₃𝒹ₓ²-ᵧ² ∝ (x² - y²) · e⁻ʳ/³',
    nodalPlanes: 'Planes at x = ±y (rotated 45° to axes)',
    description: 'Four-lobed cloverleaf with lobes directed straight along the x and y Cartesian axes.',
  },

  // f Orbitals (l=3)
  {
    id: '4fz3',
    name: '4f_z³',
    type: 'f',
    n: 4,
    l: 3,
    m: 0,
    formula: 'ψ₄𝒻𝓏³ ∝ z · (5z² - 3r²) · e⁻ʳ/⁴',
    nodalPlanes: 'Conical nodal surfaces + xy-plane',
    description: 'Axial f-orbital with dual polar lobes and two nested equatorial tori.',
  },
  {
    id: '4fxyz',
    name: '4f_xyz',
    type: 'f',
    n: 4,
    l: 3,
    m: -2,
    formula: 'ψ₄𝒻ₓᵧ𝓏 ∝ xyz · e⁻ʳ/⁴',
    nodalPlanes: 'xy, yz, and xz coordinate planes',
    description: 'Eight-lobed octahedral orbital occupying all eight Cartesian octants with alternating parity.',
  },
  {
    id: '4fz_x2-y2',
    name: '4f_z(x²-y²)',
    type: 'f',
    n: 4,
    l: 3,
    m: 2,
    formula: 'ψ₄𝒻𝓏(ₓ²-ᵧ²) ∝ z(x² - y²) · e⁻ʳ/⁴',
    nodalPlanes: 'z = 0 & diagonal planes x = ±y',
    description: 'Eight-lobed orbital with 4 upper lobes and 4 lower lobes alternating in sign.',
  },
  {
    id: '4fx_x2-3y2',
    name: '4f_x(x²-3y²)',
    type: 'f',
    n: 4,
    l: 3,
    m: 3,
    formula: 'ψ₄𝒻ₓ(ₓ²-³ᵧ²) ∝ x(x² - 3y²) · e⁻ʳ/⁴',
    nodalPlanes: 'Three planes at 60° angles',
    description: 'Six-lobed planar rosette orbital in the xy-plane with hexagonal threefold symmetry.',
  },
];

/**
 * Evaluates the radial wavefunction R_nl(r) for hydrogen-like atom (Z=1).
 * r in atomic units (Bohr radius a_0).
 */
export function evaluateRadialWavefunction(n: number, l: number, r: number, z = 1): number {
  if (r < 0) return 0;
  const rho = (2 * z * r) / n;

  // Exact formulas for common principal/angular combinations:
  if (n === 1 && l === 0) {
    // 1s
    return 2.0 * Math.pow(z, 1.5) * Math.exp(-rho / 2);
  }
  if (n === 2 && l === 0) {
    // 2s
    return (1 / (2 * Math.sqrt(2))) * Math.pow(z, 1.5) * (2 - rho) * Math.exp(-rho / 2);
  }
  if (n === 2 && l === 1) {
    // 2p
    return (1 / (2 * Math.sqrt(6))) * Math.pow(z, 1.5) * rho * Math.exp(-rho / 2);
  }
  if (n === 3 && l === 0) {
    // 3s
    return (1 / (9 * Math.sqrt(3))) * Math.pow(z, 1.5) * (6 - 6 * rho + Math.pow(rho, 2)) * Math.exp(-rho / 2);
  }
  if (n === 3 && l === 1) {
    // 3p
    return (1 / (9 * Math.sqrt(6))) * Math.pow(z, 1.5) * (4 - rho) * rho * Math.exp(-rho / 2);
  }
  if (n === 3 && l === 2) {
    // 3d
    return (1 / (9 * Math.sqrt(30))) * Math.pow(z, 1.5) * Math.pow(rho, 2) * Math.exp(-rho / 2);
  }
  if (n === 4 && l === 0) {
    // 4s
    return (1 / 96) * Math.pow(z, 1.5) * (24 - 36 * rho + 12 * Math.pow(rho, 2) - Math.pow(rho, 3)) * Math.exp(-rho / 2);
  }
  if (n === 4 && l === 1) {
    // 4p
    return (1 / (32 * Math.sqrt(15))) * Math.pow(z, 1.5) * (20 - 10 * rho + Math.pow(rho, 2)) * rho * Math.exp(-rho / 2);
  }
  if (n === 4 && l === 2) {
    // 4d
    return (1 / (96 * Math.sqrt(5))) * Math.pow(z, 1.5) * (6 - rho) * Math.pow(rho, 2) * Math.exp(-rho / 2);
  }
  if (n === 4 && l === 3) {
    // 4f
    return (1 / (96 * Math.sqrt(35))) * Math.pow(z, 1.5) * Math.pow(rho, 3) * Math.exp(-rho / 2);
  }

  // Generic fallback using Slater-like approximation
  const nEff = Math.max(1, n);
  const amplitude = Math.pow(r, l) * Math.exp(-(z * r) / nEff);
  return amplitude;
}

/**
 * Evaluates the real angular component Y_lm(x, y, z).
 * Vector (x,y,z) is on or scaled relative to radius r.
 */
export function evaluateAngularWavefunction(
  l: number,
  m: number,
  x: number,
  y: number,
  z: number,
  r: number
): number {
  if (r === 0) return 0;
  const nx = x / r;
  const ny = y / r;
  const nz = z / r;

  // s orbital: l=0, m=0
  if (l === 0) {
    return 1.0 / Math.sqrt(4 * Math.PI);
  }

  // p orbitals: l=1
  if (l === 1) {
    const norm = Math.sqrt(3 / (4 * Math.PI));
    if (m === 0) return norm * nz; // p_z
    if (m === 1) return norm * nx; // p_x
    if (m === -1) return norm * ny; // p_y
  }

  // d orbitals: l=2
  if (l === 2) {
    if (m === 0) {
      // 3d_z^2
      return Math.sqrt(5 / (16 * Math.PI)) * (3 * nz * nz - 1);
    }
    if (m === 1) {
      // 3d_xz
      return Math.sqrt(15 / (4 * Math.PI)) * nx * nz;
    }
    if (m === -1) {
      // 3d_yz
      return Math.sqrt(15 / (4 * Math.PI)) * ny * nz;
    }
    if (m === 2) {
      // 3d_x^2-y^2
      return Math.sqrt(15 / (16 * Math.PI)) * (nx * nx - ny * ny);
    }
    if (m === -2) {
      // 3d_xy
      return Math.sqrt(15 / (4 * Math.PI)) * nx * ny;
    }
  }

  // f orbitals: l=3
  if (l === 3) {
    if (m === 0) {
      // 4f_z^3
      return Math.sqrt(7 / (16 * Math.PI)) * nz * (5 * nz * nz - 3);
    }
    if (m === 1) {
      // 4f_xz^2
      return Math.sqrt(21 / (32 * Math.PI)) * nx * (5 * nz * nz - 1);
    }
    if (m === -1) {
      // 4f_yz^2
      return Math.sqrt(21 / (32 * Math.PI)) * ny * (5 * nz * nz - 1);
    }
    if (m === 2) {
      // 4f_z(x^2-y^2)
      return Math.sqrt(105 / (16 * Math.PI)) * nz * (nx * nx - ny * ny);
    }
    if (m === -2) {
      // 4f_xyz
      return Math.sqrt(105 / (4 * Math.PI)) * nx * ny * nz;
    }
    if (m === 3) {
      // 4f_x(x^2-3y^2)
      return Math.sqrt(35 / (32 * Math.PI)) * nx * (nx * nx - 3 * ny * ny);
    }
    if (m === -3) {
      // 4f_y(3x^2-y^2)
      return Math.sqrt(35 / (32 * Math.PI)) * ny * (3 * nx * nx - ny * ny);
    }
  }

  return 0;
}

/**
 * Computes the total wavefunction psi(x, y, z) and probability density |psi|^2.
 */
export function evaluateOrbitalWavefunction(
  n: number,
  l: number,
  m: number,
  x: number,
  y: number,
  z: number
): { psi: number; probability: number; sign: 1 | -1 } {
  const r = Math.sqrt(x * x + y * y + z * z);
  const R = evaluateRadialWavefunction(n, l, r);
  const Y = evaluateAngularWavefunction(l, m, x, y, z, r);
  const psi = R * Y;
  return {
    psi,
    probability: psi * psi,
    sign: psi >= 0 ? 1 : -1,
  };
}

/**
 * Computes radial probability distribution points P(r) = r^2 |R_nl(r)|^2
 * up to maxR.
 */
export function calculateRadialDistribution(
  n: number,
  l: number,
  maxR = 25,
  steps = 80
): RadialDistributionPoint[] {
  const points: RadialDistributionPoint[] = [];
  const dr = maxR / steps;

  for (let i = 0; i <= steps; i++) {
    const r = i * dr;
    const R = evaluateRadialWavefunction(n, l, r);
    const density = r * r * R * R;
    points.push({
      r: Number(r.toFixed(2)),
      density: Number(density.toFixed(5)),
      amplitude: Number(R.toFixed(5)),
    });
  }

  return points;
}

/**
 * Generates sample point cloud for statistical probability density mode.
 * Samples points where probability density |psi|^2 is high.
 */
export function generateOrbitalPointCloud(
  n: number,
  l: number,
  m: number,
  targetPoints = 1400
): OrbitalPointSample[] {
  const samples: OrbitalPointSample[] = [];
  const maxR = n * 4.5 + 2.0; // scale boundary with principal quantum number
  let attempts = 0;
  const maxAttempts = targetPoints * 50;

  // Estimate peak value for rejection sampling
  let peakProb = 0.0001;
  for (let i = 0; i < 200; i++) {
    const testR = (i / 200) * maxR;
    const p = Math.pow(evaluateRadialWavefunction(n, l, testR), 2);
    if (p > peakProb) peakProb = p;
  }

  while (samples.length < targetPoints && attempts < maxAttempts) {
    attempts++;

    // Random point in spherical shell
    const u = Math.random();
    const v = Math.random();
    const theta = Math.acos(2 * v - 1);
    const phi = 2 * Math.PI * u;
    const r = Math.pow(Math.random(), 0.5) * maxR;

    const x = r * Math.sin(theta) * Math.cos(phi);
    const y = r * Math.sin(theta) * Math.sin(phi);
    const z = r * Math.cos(theta);

    const res = evaluateOrbitalWavefunction(n, l, m, x, y, z);
    const probNorm = res.probability / (peakProb || 1);

    // Acceptance rejection
    if (Math.random() < probNorm * 2.5) {
      samples.push({
        x,
        y,
        z,
        value: res.psi,
        probability: res.probability,
        sign: res.sign,
      });
    }
  }

  return samples;
}

/**
 * Returns full quantum metadata for an orbital state.
 */
export function getOrbitalQuantumState(
  n: number,
  l: number,
  m: number,
  spin: 0.5 | -0.5 = 0.5
): OrbitalState {
  const types: OrbitalType[] = ['s', 'p', 'd', 'f'];
  const type = types[l] || 's';

  // Energy E_n = -13.6 eV / n^2
  const energyEv = Number((-13.6 / Math.pow(n, 2)).toFixed(3));
  const radialNodes = Math.max(0, n - l - 1);
  const angularNodes = l;
  const totalNodes = n - 1;

  // Name construction
  let subName = '';
  if (l === 0) subName = '';
  else if (l === 1) {
    subName = m === 0 ? 'z' : m === 1 ? 'x' : 'y';
  } else if (l === 2) {
    subName = m === 0 ? 'z²' : m === 1 ? 'xz' : m === -1 ? 'yz' : m === 2 ? 'x²-y²' : 'xy';
  } else if (l === 3) {
    subName = m === 0 ? 'z³' : m === 2 ? 'z(x²-y²)' : m === -2 ? 'xyz' : `m=${m}`;
  }

  const name = `${n}${type}${subName ? `_${subName}` : ''}`;
  const catalogMatch = ORBITAL_CATALOG.find((item) => item.n === n && item.l === l && item.m === m);

  return {
    id: `${n}-${type}-${m}-${spin > 0 ? 'up' : 'down'}`,
    name,
    type,
    n,
    l,
    m,
    spin,
    energyEv,
    radialNodes,
    angularNodes,
    totalNodes,
    formula: catalogMatch ? catalogMatch.formula : `ψ(${n},${l},${m}) = R_{${n}${l}}(r) Y_{${l}}^{${m}}(θ,φ)`,
    description: catalogMatch ? catalogMatch.description : `Quantum state with ${radialNodes} radial and ${angularNodes} angular nodes.`,
  };
}
