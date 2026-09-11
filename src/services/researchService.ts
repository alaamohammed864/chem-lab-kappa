// Research Workspace Engine: Projects, Notes, References, Calculations, Elements, Materials, Attachments & History

import { ChemicalElement, MaterialItem, ResearchNote } from '../types';

export interface ResearchReference {
  id: string;
  title: string;
  authors: string;
  publication: string;
  year: number;
  doi?: string;
  standardCode?: string; // e.g., ASTM E165, ASME BPVC Sec V, ISO 9712
  notes?: string;
}

export interface SavedCalculation {
  id: string;
  tool: 'xrd' | 'corrosion' | 'ndt' | 'crystal' | 'stoichiometry';
  title: string;
  formula: string;
  timestamp: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  notes?: string;
}

export interface ResearchAttachment {
  id: string;
  name: string;
  type: 'diffraction_scan' | 'micrograph' | 'tensile_curve' | 'chemical_assay' | 'pdf';
  fileSizeFormatted: string;
  uploadedAt: string;
  description?: string;
}

export interface ProjectHistoryItem {
  id: string;
  action: string;
  timestamp: string;
  user: string;
  details?: string;
}

export interface ResearchProject {
  id: string;
  title: string;
  description: string;
  category: 'Metals & Alloys' | 'Corrosion & Coatings' | 'Crystallography' | 'NDT Quality Assurance' | 'Chemical Synthesis';
  status: 'Active' | 'Under Review' | 'Completed' | 'Archived';
  leadResearcher: string;
  createdAt: string;
  updatedAt: string;
  notes: ResearchNote[];
  references: ResearchReference[];
  calculations: SavedCalculation[];
  linkedElements: string[]; // Element symbols, e.g. ['Fe', 'Cr', 'Ni', 'Mo']
  linkedMaterials: string[]; // Material designations, e.g. ['AISI 316L', 'Ti-6Al-4V']
  attachments: ResearchAttachment[];
  history: ProjectHistoryItem[];
}

const PROJECTS_STORAGE_KEY = 'alaa_chem_lab_research_projects_v2';
const NOTES_STORAGE_KEY = 'alaa_chem_lab_research_notes_v1';

export const INITIAL_PROJECTS: ResearchProject[] = [
  {
    id: 'proj-1',
    title: 'Phase Transformation & Pitting Immunity in 2507 Super Duplex Stainless Steel',
    description: 'Electrochemical characterization of passive film breakdown in chlorinated marine water and XRD phase balance evaluation between ferrite and austenite.',
    category: 'Corrosion & Coatings',
    status: 'Active',
    leadResearcher: 'Dr. Alaa / Senior Metallurgy Group',
    createdAt: '2026-09-01T08:30:00.000Z',
    updatedAt: '2026-09-10T14:15:00.000Z',
    notes: [
      {
        id: 'note-101',
        title: 'Electrochemical Impedance Spectroscopy (EIS)',
        subtitle: '3.5% NaCl electrolyte @ 25°C and 50°C',
        category: 'Corrosion Science',
        timestamp: 'Today, 11:20 AM',
        statusColor: 'purple',
        details: 'High charge transfer resistance (R_ct > 150 kΩ·cm²) observed up to 60°C. Break-down of passive Cr₂O₃/MoO₃ duplex barrier occurs when critical pitting potential E_pit drops below +650 mV vs Ag/AgCl.',
      },
      {
        id: 'note-102',
        title: 'Austenite-to-Ferrite Phase Volume Fraction',
        subtitle: 'Powder XRD relative intensity ratio',
        category: 'XRD Analysis',
        timestamp: 'Yesterday, 04:30 PM',
        statusColor: 'cyan',
        details: 'Calculated 52% γ-austenite (FCC) and 48% α-ferrite (BCC) from peak integrated intensity ratios of γ(220) and α(200). Within ASTM A890 requirement of 40-60% duplex balance.',
      },
    ],
    references: [
      {
        id: 'ref-1',
        title: 'Pitting and Crevice Corrosion Resistance of High-Alloy Stainless Steels',
        authors: 'Sedriks, A. J.',
        publication: 'Corrosion Engineering Handbook',
        year: 2021,
        standardCode: 'ASTM G48 / ASTM G150',
        doi: '10.1016/j.corsci.2021.109842',
      },
      {
        id: 'ref-2',
        title: 'Standard Test Methods for Detecting Detrimental Intermetallic Phases in Duplex Steels',
        authors: 'ASTM International',
        publication: 'ASTM Standards Volume 01.03',
        year: 2023,
        standardCode: 'ASTM A923 Method C',
      },
    ],
    calculations: [
      {
        id: 'calc-1',
        tool: 'corrosion',
        title: 'PREN Pitting Resistance Equivalent Calculation',
        formula: 'PREN = %Cr + 3.3(%Mo + 0.5%W) + 16%N',
        timestamp: '2026-09-08 10:15',
        inputs: { Cr: 25.2, Mo: 3.8, W: 0.2, N: 0.28 },
        outputs: { PREN: 42.42, immunityClass: 'Super Duplex (Critical Marine Service)' },
        notes: 'PREN > 40 confirms resistance to seawater localized pitting at temperatures up to 45°C.',
      },
      {
        id: 'calc-2',
        tool: 'xrd',
        title: "Bragg Planar Spacing for Ferrite (110)",
        formula: 'd = λ / (2 sin θ)',
        timestamp: '2026-09-09 14:20',
        inputs: { twoTheta: 44.68, lambda: 1.5406, hkl: '110' },
        outputs: { dSpacing: 2.027, latticeParameterA: 2.866 },
        notes: 'Residual stress shift < 0.05° confirms stress-relieved annealed condition.',
      },
    ],
    linkedElements: ['Fe', 'Cr', 'Ni', 'Mo', 'N'],
    linkedMaterials: ['2507 Super Duplex', 'AISI 316L'],
    attachments: [
      {
        id: 'att-1',
        name: 'XRD_Diffractogram_Scan_Run04.xy',
        type: 'diffraction_scan',
        fileSizeFormatted: '480 KB',
        uploadedAt: '2026-09-09',
        description: 'Continuous scan from 20° to 90° 2θ with Cu-Kα source.',
      },
      {
        id: 'att-2',
        name: 'Micrograph_Duplex_Etch_500x.png',
        type: 'micrograph',
        fileSizeFormatted: '2.4 MB',
        uploadedAt: '2026-09-10',
        description: 'Beraha color etching revealing elongated ferrite and austenite bands.',
      },
    ],
    history: [
      {
        id: 'hist-1',
        action: 'Project Initialized & Literature Logged',
        timestamp: '2026-09-01 08:30',
        user: 'Lead Investigator',
        details: 'Initial target: verify duplex grain ratio and seawater pitting threshold.',
      },
      {
        id: 'hist-2',
        action: 'Diffractogram Analysis Completed',
        timestamp: '2026-09-09 16:40',
        user: 'XRD Specialist',
        details: 'Indexed peaks at 44.68° (BCC α) and 43.50° (FCC γ). Phase ratio: 48/52.',
      },
      {
        id: 'hist-3',
        action: 'Electrochemical PREN & Corrosion Calculation Attached',
        timestamp: '2026-09-10 14:15',
        user: 'Corrosion Engineer',
        details: 'PREN calculated at 42.42 (>40). Passed threshold for severe subsea valves.',
      },
    ],
  },
  {
    id: 'proj-2',
    title: 'Ultrasonic Pulse-Echo Attenuation & Shear Wave Sizing in Welded Heavy Plates',
    description: 'Calibration of ultrasonic angle beam transducers (45° and 60°) for detection and sizing of lack-of-fusion planar defects per ASME Section V Article 4.',
    category: 'NDT Quality Assurance',
    status: 'Active',
    leadResearcher: 'Eng. NDT Level III',
    createdAt: '2026-09-04T10:00:00.000Z',
    updatedAt: '2026-09-10T12:00:00.000Z',
    notes: [
      {
        id: 'note-201',
        title: 'DAC Curve Construction on IIW Type 1 Calibration Block',
        subtitle: 'Distance-Amplitude Correction at 4.0 MHz',
        category: 'NDT Engineering',
        timestamp: 'Yesterday, 10:00 AM',
        statusColor: 'teal',
        details: 'Constructed 3-point DAC curve using 1.5 mm side-drilled holes at depths of 10 mm, 25 mm, and 40 mm. Primary reference response set to 80% full screen height (FSH).',
      },
    ],
    references: [
      {
        id: 'ref-201',
        title: 'ASME Boiler and Pressure Vessel Code Section V: Nondestructive Examination',
        authors: 'ASME Committee on Nondestructive Examination',
        publication: 'ASME Boiler and Pressure Vessel Code',
        year: 2023,
        standardCode: 'ASME BPVC Section V Article 4',
      },
    ],
    calculations: [
      {
        id: 'calc-201',
        tool: 'ndt',
        title: 'Near Field and Beam Spread Angle for 4 MHz Transducer',
        formula: 'N = D² / (4λ), sin θ = 1.22 λ / D',
        timestamp: '2026-09-09 11:30',
        inputs: { frequencyMHz: 4.0, crystalDiameterMm: 12.0, velocityMS: 3240 },
        outputs: { wavelengthMm: 0.81, nearFieldMm: 44.4, beamSpreadDeg: 4.7 },
        notes: 'Calculations ensure defects deeper than 45 mm reside in Fraunhofer far-field.',
      },
    ],
    linkedElements: ['Fe', 'C', 'Mn'],
    linkedMaterials: ['AISI 1018 Carbon Steel'],
    attachments: [
      {
        id: 'att-201',
        name: 'A-Scan_Echo_Flaw_Waveform.csv',
        type: 'tensile_curve',
        fileSizeFormatted: '120 KB',
        uploadedAt: '2026-09-09',
        description: 'Digitized RF A-scan showing reflection peak at 28.5 mm sound path.',
      },
    ],
    history: [
      {
        id: 'hist-201',
        action: 'Calibration baseline saved',
        timestamp: '2026-09-08 14:00',
        user: 'Level II Inspector',
        details: 'Distance-Amplitude calibration confirmed on IIW Reference Block.',
      },
    ],
  },
];

export class ResearchWorkspaceService {
  static getProjects(): ResearchProject[] {
    try {
      const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('LocalStorage unavailable for projects', e);
    }
    return INITIAL_PROJECTS;
  }

  static saveProjects(projects: ResearchProject[]): void {
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.warn('Failed to save research projects to localStorage', e);
    }
  }

  static getProjectById(id: string): ResearchProject | undefined {
    return this.getProjects().find((p) => p.id === id);
  }

  static createProject(
    title: string,
    description: string,
    category: ResearchProject['category'],
    leadResearcher = 'Lead Metallurgist'
  ): ResearchProject {
    const newProject: ResearchProject = {
      id: `proj-${Date.now()}`,
      title,
      description,
      category,
      status: 'Active',
      leadResearcher,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: [],
      references: [],
      calculations: [],
      linkedElements: [],
      linkedMaterials: [],
      attachments: [],
      history: [
        {
          id: `hist-${Date.now()}`,
          action: 'Project Created',
          timestamp: new Date().toLocaleString(),
          user: leadResearcher,
          details: 'Initial project record generated in workspace.',
        },
      ],
    };

    const updated = [newProject, ...this.getProjects()];
    this.saveProjects(updated);
    return newProject;
  }

  static addNoteToProject(projectId: string, note: ResearchNote): ResearchProject {
    const projects = this.getProjects();
    const target = projects.find((p) => p.id === projectId);
    if (!target) throw new Error(`Project ${projectId} not found`);

    target.notes.unshift(note);
    target.updatedAt = new Date().toISOString();
    target.history.unshift({
      id: `hist-${Date.now()}`,
      action: `Note added: ${note.title}`,
      timestamp: new Date().toLocaleString(),
      user: 'Researcher',
      details: note.subtitle,
    });

    this.saveProjects(projects);
    return target;
  }

  static addCalculationToProject(projectId: string, calc: SavedCalculation): ResearchProject {
    const projects = this.getProjects();
    const target = projects.find((p) => p.id === projectId);
    if (!target) throw new Error(`Project ${projectId} not found`);

    target.calculations.unshift(calc);
    target.updatedAt = new Date().toISOString();
    target.history.unshift({
      id: `hist-${Date.now()}`,
      action: `Calculation logged: ${calc.title}`,
      timestamp: new Date().toLocaleString(),
      user: 'Calculation Engine',
      details: calc.formula,
    });

    this.saveProjects(projects);
    return target;
  }

  static addReferenceToProject(projectId: string, ref: ResearchReference): ResearchProject {
    const projects = this.getProjects();
    const target = projects.find((p) => p.id === projectId);
    if (!target) throw new Error(`Project ${projectId} not found`);

    target.references.unshift(ref);
    target.updatedAt = new Date().toISOString();
    this.saveProjects(projects);
    return target;
  }

  static addAttachmentToProject(projectId: string, att: ResearchAttachment): ResearchProject {
    const projects = this.getProjects();
    const target = projects.find((p) => p.id === projectId);
    if (!target) throw new Error(`Project ${projectId} not found`);

    target.attachments.unshift(att);
    target.updatedAt = new Date().toISOString();
    target.history.unshift({
      id: `hist-${Date.now()}`,
      action: `Attachment uploaded: ${att.name}`,
      timestamp: new Date().toLocaleString(),
      user: 'Researcher',
      details: att.description,
    });

    this.saveProjects(projects);
    return target;
  }

  static linkElement(projectId: string, symbol: string): ResearchProject {
    const projects = this.getProjects();
    const target = projects.find((p) => p.id === projectId);
    if (!target) throw new Error(`Project ${projectId} not found`);

    if (!target.linkedElements.includes(symbol)) {
      target.linkedElements.push(symbol);
      target.updatedAt = new Date().toISOString();
      this.saveProjects(projects);
    }
    return target;
  }

  static linkMaterial(projectId: string, designation: string): ResearchProject {
    const projects = this.getProjects();
    const target = projects.find((p) => p.id === projectId);
    if (!target) throw new Error(`Project ${projectId} not found`);

    if (!target.linkedMaterials.includes(designation)) {
      target.linkedMaterials.push(designation);
      target.updatedAt = new Date().toISOString();
      this.saveProjects(projects);
    }
    return target;
  }
}

// Legacy ResearchService class for backward compatibility with existing components
export const DEFAULT_RESEARCH_NOTES: ResearchNote[] = [
  {
    id: 'note-1',
    title: 'XRD pattern analysis',
    subtitle: 'Ti-6Al-4V / Phase identification',
    timestamp: 'Today, 10:42',
    category: 'XRD Analysis',
    statusColor: 'cyan',
    details:
      'Analyzed Cu-Kα diffractometer spectrum for Ti-6Al-4V Grade 5. Identified strong α-phase peaks at 2θ = 35.15° (100), 38.42° (002), and 40.24° (101). Verified residual β-BCC phase at 39.80° (110) confirming duplex microstructure.',
  },
  {
    id: 'note-2',
    title: 'New research note created',
    subtitle: 'Corrosion mechanisms in 316L',
    timestamp: 'Yesterday, 16:08',
    category: 'Corrosion Science',
    statusColor: 'purple',
    details:
      'Investigation of localized pitting corrosion in 316L stainless steel under 3.5 wt% NaCl aqueous environments. Molybdenum (2.5 wt%) enhances passive film stability against chloride ion penetration.',
  },
  {
    id: 'note-3',
    title: 'Material added to library',
    subtitle: 'Silicon carbide / SiC-α',
    timestamp: 'Yesterday, 09:21',
    category: 'Materials Library',
    statusColor: 'teal',
    details:
      '6H-SiC technical ceramic characterized. Extreme thermal conductivity (120 W/m·K) and high hardness (2800 HV). Suitable for nuclear fuel cladding and high-voltage power electronics substrates.',
  },
  {
    id: 'note-4',
    title: 'Equation balanced',
    subtitle: 'Fe + O₂ → Fe₂O₃',
    timestamp: '08 Sep, 14:33',
    category: 'Stoichiometry',
    statusColor: 'slate',
    details:
      'Stoichiometric balance: 4Fe + 3O₂ → 2Fe₂O₃. Standard reaction enthalpy ΔH° = -1648.4 kJ/mol. Exothermic rust formation verified with iron in high oxidation state Fe(III).',
  },
];

export class ResearchService {
  static getNotes(): ResearchNote[] {
    try {
      const stored = localStorage.getItem(NOTES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('LocalStorage unavailable, using in-memory state', e);
    }
    return DEFAULT_RESEARCH_NOTES;
  }

  static addNote(note: ResearchNote): ResearchNote[] {
    const current = this.getNotes();
    const updated = [note, ...current];
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
    return updated;
  }

  static resetToDefault(): ResearchNote[] {
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(DEFAULT_RESEARCH_NOTES));
    } catch (e) {
      console.warn('Failed to reset localStorage', e);
    }
    return DEFAULT_RESEARCH_NOTES;
  }
}

