// Phase Diagram & Thermodynamic Equilibrium Computation Engine
// Designed for binary alloy systems with Lever Rule and microstructural analysis

export type SystemClassification = 'isomorphous' | 'eutectic' | 'peritectic' | 'iron-carbon';

export interface ComponentDefinition {
  symbol: string;
  name: string;
  atomicNumber: number;
  meltingPointC: number;
  molarMass: number; // g/mol
  crystalStructure: string;
}

export interface PhaseRegion {
  id: string;
  name: string;
  phaseLabel: string; // e.g. "Liquid (L)", "α + L", "α + β", "γ (Austenite)"
  phaseType: 'single-phase' | 'two-phase';
  phases: string[]; // ['L'] or ['α', 'L']
  description: string;
  color: string; // Hex color for canvas/SVG rendering
  // Polygon coordinates [composition wt%, temperature °C]
  polygon: Array<[number, number]>;
}

export interface BoundaryCurve {
  id: string;
  name: string;
  type: 'liquidus' | 'solidus' | 'solvus' | 'isotherm' | 'eutectoid' | 'magnetic';
  color: string;
  dashPattern?: string;
  points: Array<[number, number]>; // [composition wt%, temperature °C]
}

export interface InvariantPoint {
  id: string;
  name: string;
  type: 'eutectic' | 'eutectoid' | 'peritectic' | 'melting-point';
  composition: number; // wt% B
  temperature: number; // °C
  reactionEquation: string; // e.g. "L (61.9 wt% Sn) ⇌ α (18.3%) + β (97.8%)"
  description: string;
}

export interface BinaryPhaseSystem {
  id: string;
  name: string;
  classification: SystemClassification;
  componentA: ComponentDefinition;
  componentB: ComponentDefinition;
  compositionLabel: string; // e.g. "Composition (wt% Ni)"
  temperatureRange: { min: number; max: number }; // °C
  compositionRange: { min: number; max: number }; // wt%
  regions: PhaseRegion[];
  boundaries: BoundaryCurve[];
  invariantPoints: InvariantPoint[];
  isDemonstration: boolean;
  dataSource: string;
  educationalNotes: string[];
}

export interface TieLineResult {
  temperatureC: number;
  overallComposition: number; // X_0 (wt%)
  leftPhaseName: string;
  leftComposition: number; // C_1 (wt%)
  rightPhaseName: string;
  rightComposition: number; // C_2 (wt%)
  leftPhaseFraction: number; // W_1 (0 to 1)
  rightPhaseFraction: number; // W_2 (0 to 1)
  leverRuleFormula: string;
}

export interface PhaseEvaluationResult {
  temperatureC: number;
  compositionWtPercent: number;
  activeRegion: PhaseRegion;
  isTwoPhase: boolean;
  phasesPresent: string[];
  tieLine?: TieLineResult;
  microstructureDescription: string;
  coolingBehaviorNotes: string;
}

// ==========================================
// PRE-BUILT BINARY SYSTEMS DATASET
// ==========================================

export const CU_NI_SYSTEM: BinaryPhaseSystem = {
  id: 'cu-ni',
  name: 'Copper-Nickel (Cu-Ni) Isomorphous System',
  classification: 'isomorphous',
  componentA: {
    symbol: 'Cu',
    name: 'Copper',
    atomicNumber: 29,
    meltingPointC: 1085,
    molarMass: 63.55,
    crystalStructure: 'FCC',
  },
  componentB: {
    symbol: 'Ni',
    name: 'Nickel',
    atomicNumber: 28,
    meltingPointC: 1453,
    molarMass: 58.69,
    crystalStructure: 'FCC',
  },
  compositionLabel: 'Weight Percent Nickel (wt% Ni)',
  temperatureRange: { min: 950, max: 1550 },
  compositionRange: { min: 0, max: 100 },
  isDemonstration: true,
  dataSource: 'ASM Handbook Vol 3 & Callister Materials Science (Demonstration Model)',
  educationalNotes: [
    'Complete liquid and solid solubility due to Hume-Rothery rules (same FCC crystal structure, similar electronegativity and valency, atomic radii differ by only 2.3%).',
    'Used extensively for marine condenser tubes, coins (cupronickel), and electrical resistors (constantan).',
    'Demonstrates non-equilibrium coring upon rapid casting solidification.',
  ],
  invariantPoints: [
    {
      id: 'tm-cu',
      name: 'Pure Cu Melting Point',
      type: 'melting-point',
      composition: 0,
      temperature: 1085,
      reactionEquation: 'L ⇌ Cu (Solid)',
      description: 'Congruent melting point of pure elemental copper.',
    },
    {
      id: 'tm-ni',
      name: 'Pure Ni Melting Point',
      type: 'melting-point',
      composition: 100,
      temperature: 1453,
      reactionEquation: 'L ⇌ Ni (Solid)',
      description: 'Congruent melting point of pure elemental nickel.',
    },
  ],
  boundaries: [
    {
      id: 'liquidus',
      name: 'Liquidus Line',
      type: 'liquidus',
      color: '#38bdf8', // Cyan-blue
      points: [
        [0, 1085],
        [10, 1140],
        [20, 1195],
        [30, 1245],
        [40, 1290],
        [50, 1330],
        [60, 1365],
        [70, 1395],
        [80, 1420],
        [90, 1440],
        [100, 1453],
      ],
    },
    {
      id: 'solidus',
      name: 'Solidus Line',
      type: 'solidus',
      color: '#fbbf24', // Amber
      points: [
        [0, 1085],
        [10, 1100],
        [20, 1130],
        [30, 1170],
        [40, 1215],
        [50, 1260],
        [60, 1305],
        [70, 1350],
        [80, 1390],
        [90, 1425],
        [100, 1453],
      ],
    },
  ],
  regions: [
    {
      id: 'liquid',
      name: 'Liquid Solution (L)',
      phaseLabel: 'Liquid (L)',
      phaseType: 'single-phase',
      phases: ['L'],
      description: 'Homogeneous liquid molten solution of copper and nickel.',
      color: 'rgba(56, 189, 248, 0.12)',
      polygon: [
        [0, 1085],
        [10, 1140],
        [20, 1195],
        [30, 1245],
        [40, 1290],
        [50, 1330],
        [60, 1365],
        [70, 1395],
        [80, 1420],
        [90, 1440],
        [100, 1453],
        [100, 1550],
        [0, 1550],
      ],
    },
    {
      id: 'liquid-plus-alpha',
      name: 'Two-Phase (L + α)',
      phaseLabel: 'L + α (Mushy Zone)',
      phaseType: 'two-phase',
      phases: ['L', 'α'],
      description: 'Equilibrium mixture of liquid solution and solid α crystals.',
      color: 'rgba(168, 85, 247, 0.14)',
      polygon: [
        [0, 1085],
        [10, 1140],
        [20, 1195],
        [30, 1245],
        [40, 1290],
        [50, 1330],
        [60, 1365],
        [70, 1395],
        [80, 1420],
        [90, 1440],
        [100, 1453],
        [90, 1425],
        [80, 1390],
        [70, 1350],
        [60, 1305],
        [50, 1260],
        [40, 1215],
        [30, 1170],
        [20, 1130],
        [10, 1100],
      ],
    },
    {
      id: 'alpha',
      name: 'Solid Solution (α)',
      phaseLabel: 'Solid Solution (α)',
      phaseType: 'single-phase',
      phases: ['α'],
      description: 'Single-phase substitutional FCC solid solution.',
      color: 'rgba(52, 211, 153, 0.12)',
      polygon: [
        [0, 950],
        [0, 1085],
        [10, 1100],
        [20, 1130],
        [30, 1170],
        [40, 1215],
        [50, 1260],
        [60, 1305],
        [70, 1350],
        [80, 1390],
        [90, 1425],
        [100, 1453],
        [100, 950],
      ],
    },
  ],
};

export const PB_SN_SYSTEM: BinaryPhaseSystem = {
  id: 'pb-sn',
  name: 'Lead-Tin (Pb-Sn) Binary Eutectic System',
  classification: 'eutectic',
  componentA: {
    symbol: 'Pb',
    name: 'Lead',
    atomicNumber: 82,
    meltingPointC: 327,
    molarMass: 207.2,
    crystalStructure: 'FCC',
  },
  componentB: {
    symbol: 'Sn',
    name: 'Tin',
    atomicNumber: 50,
    meltingPointC: 232,
    molarMass: 118.71,
    crystalStructure: 'BCT (White Tin)',
  },
  compositionLabel: 'Weight Percent Tin (wt% Sn)',
  temperatureRange: { min: 0, max: 400 },
  compositionRange: { min: 0, max: 100 },
  isDemonstration: true,
  dataSource: 'ASM Phase Diagram Handbook (Demonstration Model)',
  educationalNotes: [
    'Classic binary eutectic model used for soldering alloys (60/40 and 63/37 Sn-Pb).',
    'Eutectic temperature of 183°C is significantly lower than either pure Pb (327°C) or pure Sn (232°C).',
    'Eutectic composition at 61.9 wt% Sn solidifies into fine alternating lamellae of α and β phases.',
  ],
  invariantPoints: [
    {
      id: 'eutectic-pt',
      name: 'Eutectic Reaction Point',
      type: 'eutectic',
      composition: 61.9,
      temperature: 183,
      reactionEquation: 'L (61.9% Sn) ⇌ α (18.3% Sn) + β (97.8% Sn)',
      description: 'Simultaneous solidification of liquid into fine lamellar α + β at 183°C.',
    },
    {
      id: 'tm-pb',
      name: 'Pure Pb Melting Point',
      type: 'melting-point',
      composition: 0,
      temperature: 327,
      reactionEquation: 'L ⇌ Pb (α)',
      description: 'Melting point of pure elemental lead.',
    },
    {
      id: 'tm-sn',
      name: 'Pure Sn Melting Point',
      type: 'melting-point',
      composition: 100,
      temperature: 232,
      reactionEquation: 'L ⇌ Sn (β)',
      description: 'Melting point of pure elemental tin.',
    },
  ],
  boundaries: [
    {
      id: 'liquidus-pb',
      name: 'Liquidus (Pb rich)',
      type: 'liquidus',
      color: '#38bdf8',
      points: [
        [0, 327],
        [10, 305],
        [20, 280],
        [30, 255],
        [40, 230],
        [50, 205],
        [61.9, 183],
      ],
    },
    {
      id: 'liquidus-sn',
      name: 'Liquidus (Sn rich)',
      type: 'liquidus',
      color: '#38bdf8',
      points: [
        [61.9, 183],
        [70, 195],
        [80, 210],
        [90, 222],
        [100, 232],
      ],
    },
    {
      id: 'eutectic-isotherm',
      name: 'Eutectic Isotherm (183°C)',
      type: 'isotherm',
      color: '#f43f5e',
      dashPattern: '4,4',
      points: [
        [18.3, 183],
        [61.9, 183],
        [97.8, 183],
      ],
    },
    {
      id: 'solidus-alpha',
      name: 'Solidus (α)',
      type: 'solidus',
      color: '#fbbf24',
      points: [
        [0, 327],
        [10, 260],
        [18.3, 183],
      ],
    },
    {
      id: 'solidus-beta',
      name: 'Solidus (β)',
      type: 'solidus',
      color: '#fbbf24',
      points: [
        [97.8, 183],
        [99, 210],
        [100, 232],
      ],
    },
    {
      id: 'solvus-alpha',
      name: 'Solvus (α)',
      type: 'solvus',
      color: '#34d399',
      points: [
        [18.3, 183],
        [15, 140],
        [10, 100],
        [5, 50],
        [2, 0],
      ],
    },
    {
      id: 'solvus-beta',
      name: 'Solvus (β)',
      type: 'solvus',
      color: '#34d399',
      points: [
        [97.8, 183],
        [98.5, 140],
        [99.2, 100],
        [99.7, 50],
        [99.9, 0],
      ],
    },
  ],
  regions: [
    {
      id: 'liquid',
      name: 'Liquid (L)',
      phaseLabel: 'Liquid (L)',
      phaseType: 'single-phase',
      phases: ['L'],
      description: 'Homogeneous molten lead-tin liquid solution.',
      color: 'rgba(56, 189, 248, 0.12)',
      polygon: [
        [0, 327],
        [10, 305],
        [20, 280],
        [30, 255],
        [40, 230],
        [50, 205],
        [61.9, 183],
        [70, 195],
        [80, 210],
        [90, 222],
        [100, 232],
        [100, 400],
        [0, 400],
      ],
    },
    {
      id: 'alpha-plus-liquid',
      name: 'α + Liquid (Hypoeutectic Mushy)',
      phaseLabel: 'α + L',
      phaseType: 'two-phase',
      phases: ['α', 'L'],
      description: 'Proeutectic solid α phase crystals surrounded by molten liquid.',
      color: 'rgba(168, 85, 247, 0.14)',
      polygon: [
        [0, 327],
        [10, 305],
        [20, 280],
        [30, 255],
        [40, 230],
        [50, 205],
        [61.9, 183],
        [18.3, 183],
        [10, 260],
      ],
    },
    {
      id: 'liquid-plus-beta',
      name: 'Liquid + β (Hypereutectic Mushy)',
      phaseLabel: 'L + β',
      phaseType: 'two-phase',
      phases: ['L', 'β'],
      description: 'Proeutectic solid β phase crystals surrounded by molten liquid.',
      color: 'rgba(236, 72, 153, 0.14)',
      polygon: [
        [61.9, 183],
        [70, 195],
        [80, 210],
        [90, 222],
        [100, 232],
        [99, 210],
        [97.8, 183],
      ],
    },
    {
      id: 'alpha',
      name: 'Solid Solution α (Pb-rich)',
      phaseLabel: 'α (Pb solid solution)',
      phaseType: 'single-phase',
      phases: ['α'],
      description: 'FCC solid solution of Sn dissolved in Pb (max 18.3 wt% Sn at 183°C).',
      color: 'rgba(52, 211, 153, 0.12)',
      polygon: [
        [0, 0],
        [0, 327],
        [10, 260],
        [18.3, 183],
        [15, 140],
        [10, 100],
        [5, 50],
        [2, 0],
      ],
    },
    {
      id: 'beta',
      name: 'Solid Solution β (Sn-rich)',
      phaseLabel: 'β (Sn solid solution)',
      phaseType: 'single-phase',
      phases: ['β'],
      description: 'BCT solid solution of Pb dissolved in Sn (max 2.2 wt% Pb at 183°C).',
      color: 'rgba(251, 191, 36, 0.12)',
      polygon: [
        [97.8, 183],
        [99, 210],
        [100, 232],
        [100, 0],
        [99.9, 0],
        [99.7, 50],
        [99.2, 100],
        [98.5, 140],
      ],
    },
    {
      id: 'alpha-plus-beta',
      name: 'Two-Phase (α + β)',
      phaseLabel: 'α + β (Lamellar Eutectic)',
      phaseType: 'two-phase',
      phases: ['α', 'β'],
      description: 'Solid mixture of α and β grains or fine eutectic alternating lamellae.',
      color: 'rgba(244, 63, 94, 0.12)',
      polygon: [
        [2, 0],
        [5, 50],
        [10, 100],
        [15, 140],
        [18.3, 183],
        [97.8, 183],
        [98.5, 140],
        [99.2, 100],
        [99.7, 50],
        [99.9, 0],
      ],
    },
  ],
};

export const FE_C_SYSTEM: BinaryPhaseSystem = {
  id: 'fe-c',
  name: 'Iron-Carbon (Fe-Fe₃C) Phase Diagram',
  classification: 'iron-carbon',
  componentA: {
    symbol: 'Fe',
    name: 'Iron',
    atomicNumber: 26,
    meltingPointC: 1538,
    molarMass: 55.85,
    crystalStructure: 'BCC (α), FCC (γ)',
  },
  componentB: {
    symbol: 'C',
    name: 'Carbon (Cementite Fe₃C)',
    atomicNumber: 6,
    meltingPointC: 1227, // stoichiometric Fe3C decomposition
    molarMass: 12.011,
    crystalStructure: 'Orthorhombic Fe₃C',
  },
  compositionLabel: 'Weight Percent Carbon (wt% C)',
  temperatureRange: { min: 400, max: 1600 },
  compositionRange: { min: 0, max: 6.7 },
  isDemonstration: true,
  dataSource: 'Callister Materials Science & Engineering & ASM Handbook (Demonstration Model)',
  educationalNotes: [
    'The foundational phase diagram of metallurgy, distinguishing Steels (<2.14 wt% C) from Cast Irons (2.14 - 6.7 wt% C).',
    'Eutectoid point at 727°C and 0.76 wt% C produces Pearlite (alternating lamellae of α-ferrite and Fe₃C cementite).',
    'Eutectic point at 1147°C and 4.30 wt% C produces Ledeburite (austenite + cementite mixture).',
  ],
  invariantPoints: [
    {
      id: 'eutectoid-pt',
      name: 'Eutectoid Reaction Point',
      type: 'eutectoid',
      composition: 0.76,
      temperature: 727,
      reactionEquation: 'γ (0.76% C) ⇌ α (0.022% C) + Fe₃C (6.70% C) [Pearlite]',
      description: 'Solid-state eutectoid decomposition of austenite into pearlite.',
    },
    {
      id: 'eutectic-fe-c',
      name: 'Eutectic Reaction Point',
      type: 'eutectic',
      composition: 4.3,
      temperature: 1147,
      reactionEquation: 'L (4.30% C) ⇌ γ (2.14% C) + Fe₃C (6.70% C) [Ledeburite]',
      description: 'Solidification of cast iron liquid into ledeburite.',
    },
    {
      id: 'tm-fe',
      name: 'Pure Fe Melting Point',
      type: 'melting-point',
      composition: 0,
      temperature: 1538,
      reactionEquation: 'L ⇌ δ-Ferrite',
      description: 'Pure iron melting point.',
    },
  ],
  boundaries: [
    {
      id: 'liquidus-fe-c',
      name: 'Liquidus',
      type: 'liquidus',
      color: '#38bdf8',
      points: [
        [0, 1538],
        [1.0, 1480],
        [2.14, 1380],
        [3.0, 1280],
        [4.3, 1147],
        [5.0, 1220],
        [6.0, 1320],
        [6.7, 1400],
      ],
    },
    {
      id: 'eutectic-line',
      name: 'Eutectic Isotherm (1147°C)',
      type: 'isotherm',
      color: '#f43f5e',
      dashPattern: '4,4',
      points: [
        [2.14, 1147],
        [4.3, 1147],
        [6.7, 1147],
      ],
    },
    {
      id: 'eutectoid-line',
      name: 'A₁ Eutectoid Line (727°C)',
      type: 'eutectoid',
      color: '#f43f5e',
      dashPattern: '4,4',
      points: [
        [0.022, 727],
        [0.76, 727],
        [6.7, 727],
      ],
    },
    {
      id: 'a3-line',
      name: 'A₃ Boundary (γ → α)',
      type: 'solvus',
      color: '#34d399',
      points: [
        [0, 912],
        [0.3, 820],
        [0.76, 727],
      ],
    },
    {
      id: 'acm-line',
      name: 'A_cm Boundary (γ → Fe₃C)',
      type: 'solvus',
      color: '#34d399',
      points: [
        [0.76, 727],
        [1.2, 900],
        [2.14, 1147],
      ],
    },
  ],
  regions: [
    {
      id: 'liquid-fe-c',
      name: 'Liquid (L)',
      phaseLabel: 'Liquid (L)',
      phaseType: 'single-phase',
      phases: ['L'],
      description: 'Molten iron-carbon liquid bath.',
      color: 'rgba(56, 189, 248, 0.12)',
      polygon: [
        [0, 1538],
        [1.0, 1480],
        [2.14, 1380],
        [3.0, 1280],
        [4.3, 1147],
        [5.0, 1220],
        [6.0, 1320],
        [6.7, 1400],
        [6.7, 1600],
        [0, 1600],
      ],
    },
    {
      id: 'gamma-austenite',
      name: 'Austenite (γ)',
      phaseLabel: 'Austenite (γ, FCC)',
      phaseType: 'single-phase',
      phases: ['γ'],
      description: 'Face-centered cubic (FCC) iron interstitial solid solution of carbon.',
      color: 'rgba(52, 211, 153, 0.14)',
      polygon: [
        [0, 912],
        [0.3, 820],
        [0.76, 727],
        [1.2, 900],
        [2.14, 1147],
        [2.14, 1380],
        [1.0, 1480],
        [0.1, 1493],
        [0, 1394],
      ],
    },
    {
      id: 'gamma-plus-liquid',
      name: 'Austenite + Liquid (γ + L)',
      phaseLabel: 'γ + L',
      phaseType: 'two-phase',
      phases: ['γ', 'L'],
      description: 'Solid austenite crystals within liquid melt.',
      color: 'rgba(168, 85, 247, 0.12)',
      polygon: [
        [0.1, 1493],
        [1.0, 1480],
        [2.14, 1380],
        [3.0, 1280],
        [4.3, 1147],
        [2.14, 1147],
      ],
    },
    {
      id: 'liquid-plus-fe3c',
      name: 'Liquid + Cementite (L + Fe₃C)',
      phaseLabel: 'L + Fe₃C',
      phaseType: 'two-phase',
      phases: ['L', 'Fe₃C'],
      description: 'Primary cementite crystals crystallizing from hypereutectic liquid.',
      color: 'rgba(236, 72, 153, 0.12)',
      polygon: [
        [4.3, 1147],
        [5.0, 1220],
        [6.0, 1320],
        [6.7, 1400],
        [6.7, 1147],
      ],
    },
    {
      id: 'gamma-plus-fe3c',
      name: 'Austenite + Cementite (γ + Fe₃C)',
      phaseLabel: 'γ + Fe₃C',
      phaseType: 'two-phase',
      phases: ['γ', 'Fe₃C'],
      description: 'Austenite grains plus proeutectoid cementite networks.',
      color: 'rgba(245, 158, 11, 0.12)',
      polygon: [
        [0.76, 727],
        [1.2, 900],
        [2.14, 1147],
        [6.7, 1147],
        [6.7, 727],
      ],
    },
    {
      id: 'alpha-ferrite',
      name: 'Ferrite (α)',
      phaseLabel: 'Ferrite (α, BCC)',
      phaseType: 'single-phase',
      phases: ['α'],
      description: 'Body-centered cubic (BCC) iron with very low carbon solubility (max 0.022 wt% at 727°C).',
      color: 'rgba(34, 197, 94, 0.15)',
      polygon: [
        [0, 400],
        [0, 912],
        [0.022, 727],
        [0.005, 400],
      ],
    },
    {
      id: 'alpha-plus-gamma',
      name: 'Ferrite + Austenite (α + γ)',
      phaseLabel: 'α + γ',
      phaseType: 'two-phase',
      phases: ['α', 'γ'],
      description: 'Intercritical heating zone where ferrite and austenite coexist.',
      color: 'rgba(14, 165, 233, 0.12)',
      polygon: [
        [0, 912],
        [0.3, 820],
        [0.76, 727],
        [0.022, 727],
      ],
    },
    {
      id: 'alpha-plus-fe3c',
      name: 'Ferrite + Cementite (α + Fe₃C)',
      phaseLabel: 'α + Fe₃C (Pearlite / Spheroidite)',
      phaseType: 'two-phase',
      phases: ['α', 'Fe₃C'],
      description: 'Room temperature steel microstructure containing ferrite matrix and hard cementite lamellae.',
      color: 'rgba(239, 68, 68, 0.12)',
      polygon: [
        [0.005, 400],
        [0.022, 727],
        [6.7, 727],
        [6.7, 400],
      ],
    },
  ],
};

export const AL_SI_SYSTEM: BinaryPhaseSystem = {
  id: 'al-si',
  name: 'Aluminum-Silicon (Al-Si) Eutectic Casting System',
  classification: 'eutectic',
  componentA: {
    symbol: 'Al',
    name: 'Aluminum',
    atomicNumber: 13,
    meltingPointC: 660,
    molarMass: 26.98,
    crystalStructure: 'FCC',
  },
  componentB: {
    symbol: 'Si',
    name: 'Silicon',
    atomicNumber: 14,
    meltingPointC: 1414,
    molarMass: 28.085,
    crystalStructure: 'Diamond Cubic',
  },
  compositionLabel: 'Weight Percent Silicon (wt% Si)',
  temperatureRange: { min: 200, max: 1200 },
  compositionRange: { min: 0, max: 100 },
  isDemonstration: true,
  dataSource: 'ASM Handbook Vol 3: Alloy Phase Diagrams (Demonstration Model)',
  educationalNotes: [
    'Crucial alloy system for automotive engine blocks, cylinder heads, and aerospace castings (e.g. A356, A380).',
    'Simple binary eutectic at 577°C with eutectic composition 12.6 wt% Si.',
    'Silicon addition provides high fluidity, low shrinkage during solidification, and high wear resistance.',
  ],
  invariantPoints: [
    {
      id: 'eutectic-al-si',
      name: 'Eutectic Point',
      type: 'eutectic',
      composition: 12.6,
      temperature: 577,
      reactionEquation: 'L (12.6% Si) ⇌ (Al) + (Si)',
      description: 'Eutectic solidification of liquid into (Al) solid solution and crystalline silicon needles.',
    },
    {
      id: 'tm-al',
      name: 'Pure Al Melting Point',
      type: 'melting-point',
      composition: 0,
      temperature: 660,
      reactionEquation: 'L ⇌ Al',
      description: 'Melting point of pure aluminum.',
    },
    {
      id: 'tm-si',
      name: 'Pure Si Melting Point',
      type: 'melting-point',
      composition: 100,
      temperature: 1414,
      reactionEquation: 'L ⇌ Si',
      description: 'Melting point of pure silicon.',
    },
  ],
  boundaries: [
    {
      id: 'liquidus-al',
      name: 'Liquidus (Al rich)',
      type: 'liquidus',
      color: '#38bdf8',
      points: [
        [0, 660],
        [4, 635],
        [8, 608],
        [12.6, 577],
      ],
    },
    {
      id: 'liquidus-si',
      name: 'Liquidus (Si rich)',
      type: 'liquidus',
      color: '#38bdf8',
      points: [
        [12.6, 577],
        [20, 690],
        [30, 810],
        [40, 920],
        [50, 1020],
        [60, 1110],
        [70, 1195],
        [80, 1275],
        [90, 1348],
        [100, 1414],
      ],
    },
    {
      id: 'eutectic-isotherm-al-si',
      name: 'Eutectic Isotherm (577°C)',
      type: 'isotherm',
      color: '#f43f5e',
      dashPattern: '4,4',
      points: [
        [1.65, 577],
        [12.6, 577],
        [99.9, 577],
      ],
    },
  ],
  regions: [
    {
      id: 'liquid-al-si',
      name: 'Liquid (L)',
      phaseLabel: 'Liquid (L)',
      phaseType: 'single-phase',
      phases: ['L'],
      description: 'Molten aluminum-silicon liquid alloy.',
      color: 'rgba(56, 189, 248, 0.12)',
      polygon: [
        [0, 660],
        [4, 635],
        [8, 608],
        [12.6, 577],
        [20, 690],
        [30, 810],
        [40, 920],
        [50, 1020],
        [60, 1110],
        [70, 1195],
        [80, 1275],
        [90, 1348],
        [100, 1414],
        [100, 1450],
        [0, 1450],
      ],
    },
    {
      id: 'alpha-plus-l-al-si',
      name: 'α(Al) + Liquid',
      phaseLabel: 'α + L',
      phaseType: 'two-phase',
      phases: ['α', 'L'],
      description: 'Primary aluminum dendrites coexisting with liquid.',
      color: 'rgba(168, 85, 247, 0.14)',
      polygon: [
        [0, 660],
        [4, 635],
        [8, 608],
        [12.6, 577],
        [1.65, 577],
      ],
    },
    {
      id: 'liquid-plus-si',
      name: 'Liquid + (Si)',
      phaseLabel: 'L + (Si)',
      phaseType: 'two-phase',
      phases: ['L', 'Si'],
      description: 'Primary faceted silicon crystals coexisting with liquid.',
      color: 'rgba(236, 72, 153, 0.14)',
      polygon: [
        [12.6, 577],
        [20, 690],
        [30, 810],
        [40, 920],
        [50, 1020],
        [60, 1110],
        [70, 1195],
        [80, 1275],
        [90, 1348],
        [100, 1414],
        [100, 577],
      ],
    },
    {
      id: 'alpha-al',
      name: 'Solid Solution (Al)',
      phaseLabel: '(Al) Solid Solution',
      phaseType: 'single-phase',
      phases: ['(Al)'],
      description: 'FCC solid solution of Si in Al (max 1.65 wt% at 577°C).',
      color: 'rgba(52, 211, 153, 0.12)',
      polygon: [
        [0, 200],
        [0, 660],
        [1.65, 577],
        [0.5, 400],
        [0.1, 200],
      ],
    },
    {
      id: 'alpha-plus-si',
      name: 'Two-Phase (Al) + (Si)',
      phaseLabel: '(Al) + (Si) [Cast Alloy]',
      phaseType: 'two-phase',
      phases: ['(Al)', '(Si)'],
      description: 'Eutectic mixture of aluminum matrix and brittle silicon plates/needles.',
      color: 'rgba(244, 63, 94, 0.12)',
      polygon: [
        [0.1, 200],
        [0.5, 400],
        [1.65, 577],
        [100, 577],
        [100, 200],
      ],
    },
  ],
};

export const AVAILABLE_PHASE_SYSTEMS: BinaryPhaseSystem[] = [
  CU_NI_SYSTEM,
  PB_SN_SYSTEM,
  FE_C_SYSTEM,
  AL_SI_SYSTEM,
];
export const BINARY_SYSTEMS = AVAILABLE_PHASE_SYSTEMS;

// ==========================================
// POINT IN POLYGON ALGORITHM (Ray-Casting)
// ==========================================

export function isPointInsidePolygon(point: [number, number], vs: Array<[number, number]>): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0],
      yi = vs[i][1];
    const xj = vs[j][0],
      yj = vs[j][1];

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Standalone Lever Rule calculation helper
 */
export function calculateLeverRule(
  temperatureC: number,
  overallComposition: number,
  leftPhaseName: string,
  leftComposition: number,
  rightPhaseName: string,
  rightComposition: number
): TieLineResult {
  const x = overallComposition;
  const cLeft = leftComposition;
  const cRight = rightComposition;
  const span = cRight - cLeft;
  const clampedX = Math.max(cLeft, Math.min(cRight, x));
  const wLeft = span > 0 ? (cRight - clampedX) / span : 0.5;
  const wRight = span > 0 ? (clampedX - cLeft) / span : 0.5;

  return {
    temperatureC,
    overallComposition: Number(x.toFixed(2)),
    leftPhaseName,
    leftComposition: Number(cLeft.toFixed(2)),
    rightPhaseName,
    rightComposition: Number(cRight.toFixed(2)),
    leftPhaseFraction: Number(wLeft.toFixed(3)),
    rightPhaseFraction: Number(wRight.toFixed(3)),
    leverRuleFormula: `W(${leftPhaseName}) = (${cRight.toFixed(1)} - ${x.toFixed(1)}) / (${cRight.toFixed(1)} - ${cLeft.toFixed(1)}) = ${(wLeft * 100).toFixed(1)}% | W(${rightPhaseName}) = (${x.toFixed(1)} - ${cLeft.toFixed(1)}) / (${cRight.toFixed(1)} - ${cLeft.toFixed(1)}) = ${(wRight * 100).toFixed(1)}%`,
  };
}

/**
 * Evaluates active phase region, tie-line endpoints, and lever-rule mass fractions
 */
export function evaluatePhaseState(
  system: BinaryPhaseSystem,
  compositionWtPercent: number,
  temperatureC: number
): PhaseEvaluationResult {
  const x = Math.max(system.compositionRange.min, Math.min(system.compositionRange.max, compositionWtPercent));
  const t = Math.max(system.temperatureRange.min, Math.min(system.temperatureRange.max, temperatureC));

  // 1. Find which region contains this (x, t) coordinate
  let activeRegion: PhaseRegion | undefined;
  for (const region of system.regions) {
    if (isPointInsidePolygon([x, t], region.polygon)) {
      activeRegion = region;
      break;
    }
  }

  // Fallback to nearest region if right on boundary or outside polygons
  if (!activeRegion) {
    activeRegion = system.regions[0];
  }

  const isTwoPhase = activeRegion.phaseType === 'two-phase';
  let tieLine: TieLineResult | undefined;

  if (isTwoPhase) {
    // Determine boundary compositions C_left and C_right at temperature t
    // Scan across horizontal line from x=min to x=max
    let cLeft = x;
    let cRight = x;

    // Numerical scan across width of region polygon at temperature t
    const xMin = system.compositionRange.min;
    const xMax = system.compositionRange.max;
    const steps = 200;
    const dx = (xMax - xMin) / steps;

    let foundLeft = false;
    for (let currentX = xMin; currentX <= xMax; currentX += dx) {
      if (isPointInsidePolygon([currentX, t], activeRegion.polygon)) {
        if (!foundLeft) {
          cLeft = currentX;
          foundLeft = true;
        }
        cRight = currentX;
      }
    }

    // Guard against edge collapse
    if (cRight <= cLeft) {
      cLeft = Math.max(xMin, x - 5);
      cRight = Math.min(xMax, x + 5);
    }

    // Ensure x is bounded inside [cLeft, cRight]
    const clampedX = Math.max(cLeft, Math.min(cRight, x));
    const span = cRight - cLeft;

    // Lever rule:
    // W_left = (C_right - X) / (C_right - C_left)
    // W_right = (X - C_left) / (C_right - C_left)
    const wLeft = span > 0 ? (cRight - clampedX) / span : 0.5;
    const wRight = span > 0 ? (clampedX - cLeft) / span : 0.5;

    const phase1 = activeRegion.phases[0] || 'Phase 1';
    const phase2 = activeRegion.phases[1] || 'Phase 2';

    tieLine = {
      temperatureC: t,
      overallComposition: Number(x.toFixed(2)),
      leftPhaseName: phase1,
      leftComposition: Number(cLeft.toFixed(2)),
      rightPhaseName: phase2,
      rightComposition: Number(cRight.toFixed(2)),
      leftPhaseFraction: Number(wLeft.toFixed(3)),
      rightPhaseFraction: Number(wRight.toFixed(3)),
      leverRuleFormula: `W(${phase1}) = (${cRight.toFixed(1)} - ${x.toFixed(1)}) / (${cRight.toFixed(1)} - ${cLeft.toFixed(1)}) = ${(wLeft * 100).toFixed(1)}% | W(${phase2}) = (${x.toFixed(1)} - ${cLeft.toFixed(1)}) / (${cRight.toFixed(1)} - ${cLeft.toFixed(1)}) = ${(wRight * 100).toFixed(1)}%`,
    };
  }

  // Microstructure descriptions
  let microDesc = '';
  let notes = '';

  if (!isTwoPhase) {
    microDesc = `Homogeneous single-phase ${activeRegion.phaseLabel} with 100% uniform composition (${x.toFixed(1)} wt%). Consists of single-phase polycrystalline grains or completely molten liquid.`;
    notes = `Degrees of freedom by Gibbs Phase Rule: F = C - P + 1 = 2 - 1 + 1 = 2 (both temperature and composition can vary independently within this field).`;
  } else {
    const p1 = activeRegion.phases[0] || 'Phase A';
    const p2 = activeRegion.phases[1] || 'Phase B';
    const f1 = tieLine ? (tieLine.leftPhaseFraction * 100).toFixed(1) : '50.0';
    const f2 = tieLine ? (tieLine.rightPhaseFraction * 100).toFixed(1) : '50.0';
    const c1 = tieLine ? tieLine.leftComposition.toFixed(1) : '0.0';
    const c2 = tieLine ? tieLine.rightComposition.toFixed(1) : '100.0';

    microDesc = `Two-phase equilibrium mixture consisting of ${f1}% ${p1} (at ${c1} wt%) and ${f2}% ${p2} (at ${c2} wt%). Governed by thermodynamic equilibrium tie-line at ${t.toFixed(0)}°C.`;
    notes = `Degrees of freedom by Gibbs Phase Rule: F = C - P + 1 = 2 - 2 + 1 = 1 (at any fixed temperature, compositions of both phases are strictly fixed).`;
  }

  return {
    temperatureC: t,
    compositionWtPercent: x,
    activeRegion,
    isTwoPhase,
    phasesPresent: activeRegion.phases,
    tieLine,
    microstructureDescription: microDesc,
    coolingBehaviorNotes: notes,
  };
}
