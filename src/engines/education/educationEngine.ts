// Education & Learning Engine for Materials Science, Metallurgy & Chemistry

export interface PracticeQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  formulaHint?: string;
}

export interface Lesson {
  id: string;
  title: string;
  durationMinutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  sections: {
    heading: string;
    content: string;
    keyPoints?: string[];
    equations?: string[];
  }[];
  practiceQuestions: PracticeQuestion[];
}

export interface WorksheetProblem {
  id: string;
  title: string;
  scenario: string;
  givenData: Record<string, string>;
  stepsToSolve: string[];
  solution: string;
  standardReference?: string;
}

export interface Worksheet {
  id: string;
  title: string;
  targetAudience: string;
  estimatedTimeMinutes: number;
  objectives: string[];
  problems: WorksheetProblem[];
}

export interface LearningPath {
  id: string;
  title: string;
  category: 'Materials' | 'Crystallography' | 'Corrosion' | 'NDT' | 'Chemistry';
  description: string;
  iconName: string;
  badgeColor: string;
  lessons: Lesson[];
  worksheets: Worksheet[];
}

export interface UserProgressRecord {
  completedLessonIds: string[];
  quizScores: Record<string, { score: number; total: number; timestamp: string }>;
  completedWorksheetIds: string[];
  learningPathProgressPct: Record<string, number>;
  activityHistory: {
    id: string;
    type: 'lesson_completed' | 'quiz_passed' | 'worksheet_downloaded';
    title: string;
    timestamp: string;
    details?: string;
  }[];
}

export const LEARNING_PATHS_DATA: LearningPath[] = [
  {
    id: 'path-cryst-xrd',
    title: 'Crystallography & X-Ray Diffractometry',
    category: 'Crystallography',
    description: 'Bravais lattices, unit cell geometry, Bragg diffraction, Miller indices, and Scherrer crystallite sizing.',
    iconName: 'Sparkles',
    badgeColor: 'teal',
    lessons: [
      {
        id: 'lesson-cryst-1',
        title: 'Cubic Unit Cells & Atomic Packing Factor (APF)',
        durationMinutes: 15,
        difficulty: 'Beginner',
        summary: 'Explore geometry, coordination numbers, and packing efficiencies in SC, BCC, and FCC crystal systems.',
        sections: [
          {
            heading: '1. Unit Cell Geometry & Coordination Numbers',
            content: 'In metallic crystals, atoms pack to minimize free volume and electrostatic potential. Simple Cubic (SC) contains 1 atom per cell with CN=6. Body-Centered Cubic (BCC) contains 2 atoms per cell with CN=8. Face-Centered Cubic (FCC) attains the highest geometric packing with 4 atoms per cell and CN=12.',
            keyPoints: [
              'SC: 8 corner atoms × 1/8 = 1 atom per unit cell; a = 2R; APF = 0.524',
              'BCC: (8 × 1/8) + 1 center = 2 atoms; a = 4R / √3; APF = 0.680',
              'FCC: (8 × 1/8) + (6 faces × 1/2) = 4 atoms; a = 4R / √2; APF = 0.740',
            ],
            equations: [
              'APF = (N_atoms · V_sphere) / V_unitcell',
              'V_sphere = (4/3) · π · R³',
              'ρ_theoretical = (N · M) / (V_cell · N_A)',
            ],
          },
          {
            heading: '2. Theoretical Density Calculation',
            content: 'Knowing the crystal structure, lattice parameter a, atomic weight M, and Avogadro constant N_A allows exact calculation of theoretical single-crystal density. Real materials exhibit lower density due to vacancies, grain boundaries, and dislocations.',
            keyPoints: [
              'Copper (FCC, M=63.55 g/mol, a=3.615 Å) yields ρ = 8.93 g/cm³',
              'Iron (BCC, M=55.85 g/mol, a=2.866 Å) yields ρ = 7.88 g/cm³',
            ],
            equations: ['ρ = (n · M) / (a³ · 6.022 × 10²³)'],
          },
        ],
        practiceQuestions: [
          {
            id: 'q-cryst-1',
            question: 'What is the theoretical atomic packing factor (APF) for a Face-Centered Cubic (FCC) lattice?',
            options: ['0.52', '0.68', '0.74', '0.82'],
            correctOptionIndex: 2,
            explanation: 'In close-packed FCC lattices, hard spheres occupy 74.05% of the total unit cell volume (APF = π / (3√2) ≈ 0.74).',
          },
          {
            id: 'q-cryst-2',
            question: 'In a Body-Centered Cubic (BCC) lattice with lattice constant a, what is the atomic radius R?',
            options: ['a / 2', 'a · √2 / 4', 'a · √3 / 4', 'a / √3'],
            correctOptionIndex: 2,
            explanation: 'The atoms touch along the body diagonal of length a√3, which spans 4 atomic radii (4R = a√3 => R = a√3 / 4).',
          },
        ],
      },
      {
        id: 'lesson-xrd-1',
        title: "Bragg's Law & Peak Indexing in Powder XRD",
        durationMinutes: 20,
        difficulty: 'Intermediate',
        summary: 'Derive constructive interference conditions in crystal planes and index diffraction peaks to determine crystal symmetry.',
        sections: [
          {
            heading: "1. Constructive Wave Interference & Bragg's Formulation",
            content: 'When incident monochromatic X-rays with wavelength λ strike parallel crystallographic planes separated by interplanar distance d, scattering occurs constructively only when the optical path difference equals an integer multiple of λ.',
            keyPoints: [
              'Path difference = 2 · d · sin(θ)',
              'Constructive reflection occurs when nλ = 2d·sin(θ)',
              'Typical laboratory radiation: Cu-Kα (λ = 1.5406 Å)',
            ],
            equations: [
              'nλ = 2 · d_{hkl} · sin(θ)',
              'd_{hkl} = a / √(h² + k² + l²) (for cubic lattices)',
            ],
          },
          {
            heading: '2. Systematic Reflection Absences & Extinction Rules',
            content: 'Non-primitive Bravais lattices produce destructive interference for specific Miller index combinations due to centered atom sites.',
            keyPoints: [
              'BCC extinction rule: Reflections permitted only when (h + k + l) is even',
              'FCC extinction rule: Reflections permitted only when h, k, l are all odd or all even (unmixed)',
            ],
            equations: [
              'BCC allowed: (110), (200), (211), (220), (310)',
              'FCC allowed: (111), (200), (220), (311), (222)',
            ],
          },
        ],
        practiceQuestions: [
          {
            id: 'q-xrd-1',
            question: 'Which of the following reflections is systematically extinguished (forbidden) in an FCC crystal?',
            options: ['(111)', '(200)', '(210)', '(220)'],
            correctOptionIndex: 2,
            explanation: 'For FCC lattices, indices must be all odd or all even. (210) has mixed parity (even, odd, even) and is extinguished.',
          },
          {
            id: 'q-xrd-2',
            question: 'For Cu-Kα radiation (λ = 1.5406 Å), a diffraction peak is measured at 2θ = 40.0°. What is the interplanar spacing d?',
            options: ['1.12 Å', '2.25 Å', '3.85 Å', '4.50 Å'],
            correctOptionIndex: 1,
            explanation: 'θ = 20.0°. d = λ / (2 · sin(20.0°)) = 1.5406 / (2 · 0.3420) = 1.5406 / 0.6840 ≈ 2.25 Å.',
          },
        ],
      },
    ],
    worksheets: [
      {
        id: 'ws-xrd-index',
        title: 'Laboratory Problem Set: Cubic Phase Indexing',
        targetAudience: 'Undergraduate Materials Engineering / Physics',
        estimatedTimeMinutes: 30,
        objectives: [
          'Calculate interplanar d-spacings from recorded 2θ diffraction peaks',
          'Determine whether an unknown specimen has BCC or FCC structure',
          'Calculate the unit cell lattice parameter a',
        ],
        problems: [
          {
            id: 'p-1',
            title: 'Problem 1: Unknown Transition Metal Powder Analysis',
            scenario: 'A powder specimen is analyzed with Cu-Kα radiation (λ = 1.5406 Å). The first two prominent diffraction peaks occur at 2θ₁ = 44.4° and 2θ₂ = 64.6°.',
            givenData: {
              'Radiation Source': 'Cu-Kα (λ = 1.5406 Å)',
              'Peak 1 (2θ)': '44.4°',
              'Peak 2 (2θ)': '64.6°',
            },
            stepsToSolve: [
              '1. Calculate sin²(θ₁) and sin²(θ₂): θ₁ = 22.2° -> sin(22.2°) = 0.3778, sin² = 0.1428. θ₂ = 32.3° -> sin(32.3°) = 0.5344, sin² = 0.2855.',
              '2. Compute ratio: sin²(θ₂) / sin²(θ₁) = 0.2855 / 0.1428 = 2.00.',
              '3. For BCC, first two allowed lines are (110) with s₁=2, and (200) with s₂=4. Ratio s₂/s₁ = 4/2 = 2.00. This confirms BCC structure.',
              '4. Calculate lattice parameter a = (λ / 2sin θ) · √(h²+k²+l²) = (1.5406 / 0.7557) · √2 = 2.038 · 1.414 = 2.88 Å (Ferritic Alpha-Iron).',
            ],
            solution: 'The specimen is Body-Centered Cubic (BCC) with lattice parameter a = 2.88 Å, matching alpha-iron (ferrite).',
            standardReference: 'ASTM E975 / Cullity Elements of X-Ray Diffraction',
          },
        ],
      },
    ],
  },
  {
    id: 'path-corrosion',
    title: 'Corrosion Science & Protection Engineering',
    category: 'Corrosion',
    description: 'Electrochemical degradation kinetics, Faraday penetration rates, galvanic series pairing, and PREN pitting immunity.',
    iconName: 'ShieldAlert',
    badgeColor: 'rose',
    lessons: [
      {
        id: 'lesson-corr-1',
        title: "Electrochemical Kinetics & Faraday's Law",
        durationMinutes: 18,
        difficulty: 'Intermediate',
        summary: 'Understand the relationship between corrosion current density and uniform wall thinning rates in industrial piping.',
        sections: [
          {
            heading: '1. The Electrochemical Corrosion Cell',
            content: 'Corrosion in aqueous media consists of coupled anodic oxidation (metal dissolution) and cathodic reduction (oxygen reduction in neutral water or hydrogen evolution in acid).',
            keyPoints: [
              'Anode: M -> Mⁿ⁺ + n e⁻ (metal loss)',
              'Cathode (neutral): O₂ + 2H₂O + 4e⁻ -> 4 OH⁻',
              'Cathode (acid): 2H⁺ + 2e⁻ -> H₂',
            ],
            equations: ['i_anodic = i_cathodic = i_corr (at open-circuit potential E_corr)'],
          },
          {
            heading: "2. Quantitative Conversion: Current Density to Penetration Rate",
            content: "Faraday's Law of Electrolysis quantitatively links the corrosion current density i_corr (µA/cm²) to thickness loss rate per year.",
            keyPoints: [
              'For carbon steel (EW = 27.92 g/eq, ρ = 7.85 g/cm³): 10 µA/cm² corresponds to ~0.116 mm/year (4.6 mpy).',
              'A rate > 1.0 mm/year is classified as severe or catastrophic for pressurized equipment.',
            ],
            equations: [
              'CR (mm/yr) = 0.00327 · (i_corr · EW) / ρ',
              'CR (mpy) = 0.129 · (i_corr · EW) / ρ',
            ],
          },
        ],
        practiceQuestions: [
          {
            id: 'q-corr-1',
            question: "In an active acid environment, an iron pipe has a measured corrosion current density of 100 µA/cm². What is its approximate annual penetration rate?",
            options: ['0.01 mm/yr', '0.12 mm/yr', '1.16 mm/yr', '11.6 mm/yr'],
            correctOptionIndex: 2,
            explanation: 'CR = 0.00327 · (100 · 27.92) / 7.85 ≈ 1.16 mm/year.',
          },
          {
            id: 'q-corr-2',
            question: 'What is the Pitting Resistance Equivalent Number (PREN) formula for stainless steels containing Chromium, Molybdenum, and Nitrogen?',
            options: [
              '%Cr + %Mo + %N',
              '%Cr + 3.3 · %Mo + 16 · %N',
              '%Cr + 10 · %Mo + 2 · %N',
              '%Cr + 0.5 · %Mo + 30 · %N',
            ],
            correctOptionIndex: 1,
            explanation: 'PREN = %Cr + 3.3 · (%Mo + 0.5%W) + 16 · %N. A PREN >= 40 defines super duplex grades suitable for critical seawater service.',
          },
        ],
      },
    ],
    worksheets: [
      {
        id: 'ws-corr-galvanic',
        title: 'Worksheet: Galvanic Coupling & Area Ratio Analysis',
        targetAudience: 'Corrosion Engineers & Plant Inspectors',
        estimatedTimeMinutes: 25,
        objectives: [
          'Identify anode and cathode in dissimilar metal couples',
          'Evaluate galvanic acceleration factor due to cathode-to-anode area ratios',
          'Select appropriate electrical isolation and barrier coating strategies',
        ],
        problems: [
          {
            id: 'p-corr-1',
            title: 'Problem: Carbon Steel Fasteners in Type 316 Stainless Steel Shell',
            scenario: 'A technician accidentally installs plain carbon steel bolts (A_anode = 0.02 m²) into a large 316L stainless steel heat exchanger tubesheet (A_cathode = 2.0 m²) immersed in aerated seawater.',
            givenData: {
              'Anode Material': 'AISI 1018 Carbon Steel (-0.61 V vs SCE)',
              'Cathode Material': 'AISI 316L Stainless Steel (-0.08 V vs SCE)',
              'Area Ratio (A_c / A_a)': '100 : 1',
              'Electrolyte': 'Natural Seawater (3.5% NaCl)',
            },
            stepsToSolve: [
              '1. Calculate potential driving force: ΔE = (-0.08) - (-0.61) = 0.53 V. This is a severe driving potential.',
              '2. Determine area ratio effect: Total cathodic current I_c = i_c · A_c must equal total anodic current I_a = i_a · A_a.',
              '3. Thus i_a = i_c · (A_c / A_a) = 100 · i_c. Anodic dissolution current is concentrated by a factor of 100 on the small bolt heads.',
              '4. Fastener failure will occur within weeks due to rapid galvanic necking and shear fracture.',
              '5. Engineering remedy: Replace bolts with 316L/Super Duplex fasteners, or insert dielectric sleeve washers.',
            ],
            solution: 'Critical hazard: 100:1 cathode-to-anode ratio will accelerate fastener dissolution by two orders of magnitude.',
            standardReference: 'ASTM G82 / NACE SP0169',
          },
        ],
      },
    ],
  },
  {
    id: 'path-ndt',
    title: 'Non-Destructive Testing (NDT) Foundations',
    category: 'NDT',
    description: 'Acoustic wave propagation in UT, radiographic Beer-Lambert attenuation in RT, and eddy current skin depth in ET.',
    iconName: 'Radio',
    badgeColor: 'indigo',
    lessons: [
      {
        id: 'lesson-ndt-1',
        title: 'Ultrasonic Wave Velocities, Wavelength & Beam Geometry',
        durationMinutes: 22,
        difficulty: 'Intermediate',
        summary: 'Master the physics of longitudinal and shear wave velocities, transducer near-field zone, and beam divergence.',
        sections: [
          {
            heading: '1. Elastic Wave Propagation in Solids',
            content: 'Sound waves travel as longitudinal (compression) waves and transverse (shear) waves. Longitudinal waves travel approximately twice as fast as shear waves in structural metals.',
            keyPoints: [
              'Carbon steel v_L ≈ 5960 m/s; v_S ≈ 3240 m/s',
              'Acoustic impedance Z = ρ · v (Steel Z ≈ 45 MRayl; Water Z ≈ 1.5 MRayl)',
              'Reflection coefficient at steel/air interface is ~99.9% due to acoustic impedance mismatch',
            ],
            equations: [
              'v_L = √[ (E(1 - ν)) / (ρ(1 + ν)(1 - 2ν)) ]',
              'v_S = √[ E / (2ρ(1 + ν)) ]',
              'λ = v / f',
            ],
          },
          {
            heading: '2. Transducer Beam Physics (Near Field & Spread)',
            content: 'The ultrasonic beam consists of an interference near-field zone (Fresnel zone) where sound pressure fluctuates rapidly, and a far-field zone (Fraunhofer zone) where the beam diverges smoothly.',
            keyPoints: [
              'Near field distance N = D² · f / (4 · v)',
              'Beam spread half angle: sin(θ) = 1.22 · λ / D',
              'Defects located in the near field cannot be reliably sized by simple amplitude calibration alone.',
            ],
            equations: ['N = D² / (4 · λ) = (D² · f) / (4 · v)'],
          },
        ],
        practiceQuestions: [
          {
            id: 'q-ndt-1',
            question: 'What is the acoustic wavelength of a 5.0 MHz longitudinal wave propagating through carbon steel (v = 5960 m/s)?',
            options: ['0.59 mm', '1.19 mm', '2.38 mm', '4.76 mm'],
            correctOptionIndex: 1,
            explanation: 'λ = v / f = 5960 m/s / (5.0 × 10⁶ s⁻¹) = 0.001192 m ≈ 1.19 mm.',
          },
          {
            id: 'q-ndt-2',
            question: 'Why is a liquid couplant (such as gel, oil, or water) required between the ultrasonic transducer and the metal workpiece?',
            options: [
              'To cool down the piezoelectric crystal',
              'To eliminate the air gap because 99.9% of acoustic energy would reflect due to acoustic impedance mismatch',
              'To chemically etch the surface for better acoustic reflection',
              'To polarize the sound wave from shear into longitudinal mode',
            ],
            correctOptionIndex: 1,
            explanation: 'The vast acoustic impedance mismatch between air (0.0004 MRayl) and steel (45 MRayl) causes complete wave reflection unless a liquid couplant bridges the acoustic boundary.',
          },
        ],
      },
    ],
    worksheets: [
      {
        id: 'ws-ndt-rt',
        title: 'Worksheet: Radiographic Exposure & Unsharpness',
        targetAudience: 'Level II Radiographers & QC Inspectors',
        estimatedTimeMinutes: 30,
        objectives: [
          'Calculate transmitted radiation intensity through stepped steel blocks via Beer-Lambert Law',
          'Compute Half-Value Layer (HVL) thicknesses for Iridium-192 and Cobalt-60',
          'Verify geometric unsharpness (Ug) compliance per ASME Section V Article 2',
        ],
        problems: [
          {
            id: 'p-ndt-rt-1',
            title: 'Problem: Geometric Unsharpness of Pipeline Seam Radiograph',
            scenario: 'An X-ray tube with a focal spot F = 3.0 mm is used to inspect a 25 mm thick steel pipeline weld. The source-to-film distance (SFD) D = 700 mm, and the object-to-film distance d = 25 mm.',
            givenData: {
              'Focal Spot F': '3.0 mm',
              'Source-to-Film Distance D': '700 mm',
              'Object-to-Film Distance d': '25 mm',
              'Material Thickness t': '25 mm',
              'Governing Code': 'ASME Section V Article 2',
            },
            stepsToSolve: [
              '1. Identify formula for geometric unsharpness: U_g = (F · d) / (D - d).',
              '2. Calculate denominator: D - d = 700 - 25 = 675 mm (Source-to-Object distance).',
              '3. Calculate unsharpness: U_g = (3.0 mm · 25 mm) / 675 mm = 75 / 675 ≈ 0.111 mm.',
              '4. Check ASME Sec V Table T-274.2: For material thickness t ≤ 50 mm, maximum allowable U_g is 0.51 mm.',
              '5. Since 0.111 mm ≤ 0.51 mm, the geometric arrangement satisfies code requirements for radiographic sharpness.',
            ],
            solution: 'Calculated U_g = 0.11 mm, which easily satisfies the ASME Sec V maximum limit of 0.51 mm.',
            standardReference: 'ASME Boiler and Pressure Vessel Code Section V Article 2 Table T-274.2',
          },
        ],
      },
    ],
  },
];

const PROGRESS_STORAGE_KEY = 'alaa_chem_lab_education_progress_v1';

export class EducationService {
  static getProgress(): UserProgressRecord {
    try {
      const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('LocalStorage unavailable for education progress', e);
    }
    return {
      completedLessonIds: ['lesson-cryst-1'],
      quizScores: {
        'lesson-cryst-1': { score: 2, total: 2, timestamp: new Date().toISOString() },
      },
      completedWorksheetIds: [],
      learningPathProgressPct: {
        'path-cryst-xrd': 50,
      },
      activityHistory: [
        {
          id: 'hist-1',
          type: 'lesson_completed',
          title: 'Completed: Cubic Unit Cells & Atomic Packing Factor (APF)',
          timestamp: 'Yesterday, 14:20',
          details: 'Score: 2/2 (100%)',
        },
      ],
    };
  }

  static recordLessonCompletion(
    lessonId: string,
    score: number,
    total: number,
    pathId: string
  ): UserProgressRecord {
    const current = this.getProgress();
    const isNew = !current.completedLessonIds.includes(lessonId);
    const completedLessonIds = isNew
      ? [...current.completedLessonIds, lessonId]
      : current.completedLessonIds;

    const quizScores = {
      ...current.quizScores,
      [lessonId]: { score, total, timestamp: new Date().toISOString() },
    };

    // Recalculate path completion %
    const targetPath = LEARNING_PATHS_DATA.find((p) => p.id === pathId);
    let pathPct = 0;
    if (targetPath) {
      const totalLessons = targetPath.lessons.length;
      const completedCount = targetPath.lessons.filter((l) =>
        completedLessonIds.includes(l.id)
      ).length;
      pathPct = Math.round((completedCount / totalLessons) * 100);
    }

    const learningPathProgressPct = {
      ...current.learningPathProgressPct,
      [pathId]: pathPct,
    };

    const newActivity = {
      id: `act-${Date.now()}`,
      type: 'lesson_completed' as const,
      title: `Lesson completed: ${lessonId}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      details: `Score: ${score}/${total} (${Math.round((score / total) * 100)}%)`,
    };

    const updated: UserProgressRecord = {
      ...current,
      completedLessonIds,
      quizScores,
      learningPathProgressPct,
      activityHistory: [newActivity, ...current.activityHistory].slice(0, 30),
    };

    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save education progress to localStorage', e);
    }

    return updated;
  }
}
