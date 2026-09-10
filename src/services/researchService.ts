// Research Notes & Project Management Service
import { ResearchNote } from '../types';

const RESEARCH_STORAGE_KEY = 'alaa_chem_lab_research_notes_v1';

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
  /**
   * Retrieves notes with fallback to initial default research dataset
   */
  static getNotes(): ResearchNote[] {
    try {
      const stored = localStorage.getItem(RESEARCH_STORAGE_KEY);
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

  /**
   * Adds a new research note and persists
   */
  static addNote(note: ResearchNote): ResearchNote[] {
    const current = this.getNotes();
    const updated = [note, ...current];
    try {
      localStorage.setItem(RESEARCH_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
    return updated;
  }

  /**
   * Resets to baseline initial dataset
   */
  static resetToDefault(): ResearchNote[] {
    try {
      localStorage.setItem(RESEARCH_STORAGE_KEY, JSON.stringify(DEFAULT_RESEARCH_NOTES));
    } catch (e) {
      console.warn('Failed to reset localStorage', e);
    }
    return DEFAULT_RESEARCH_NOTES;
  }
}
