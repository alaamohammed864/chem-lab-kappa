// Local persistence service for Favorites and Recent Materials
// Provides synchronous fallback in sandboxed/SSR environments

const FAVORITES_KEY = 'v0_materials_favorites';
const RECENTS_KEY = 'v0_materials_recents';
const MAX_RECENTS = 12;

type StorageListener = () => void;
const listeners = new Set<StorageListener>();

function notifyListeners() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error(e);
    }
  });
}

export class MaterialsStorageService {
  /**
   * Subscribe to changes in favorites or recent materials
   */
  static subscribe(listener: StorageListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  /**
   * Retrieves list of favorite material IDs
   */
  static getFavorites(): string[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(FAVORITES_KEY);
        if (stored) return JSON.parse(stored);
      }
    } catch {
      // Ignore storage errors
    }
    return ['ti-6al-4v', 'ss-316l', 'sic-alpha', 'cfrp-epoxy-hm']; // Default starters
  }

  /**
   * Checks if a material is bookmarked
   */
  static isFavorite(id: string): boolean {
    const list = this.getFavorites();
    return list.includes(id);
  }

  /**
   * Toggles bookmark state for a material ID
   */
  static toggleFavorite(id: string): boolean {
    const current = this.getFavorites();
    const exists = current.includes(id);
    const updated = exists ? current.filter((item) => item !== id) : [id, ...current];

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      }
    } catch {
      // Ignore
    }

    notifyListeners();
    return !exists;
  }

  /**
   * Retrieves list of recently viewed material IDs
   */
  static getRecents(): string[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(RECENTS_KEY);
        if (stored) return JSON.parse(stored);
      }
    } catch {
      // Ignore
    }
    return ['ti-6al-4v', 'inconel-718', 'peek-polymer'];
  }

  /**
   * Adds a material ID to the recently inspected list
   */
  static recordRecent(id: string): void {
    const current = this.getRecents().filter((item) => item !== id);
    const updated = [id, ...current].slice(0, MAX_RECENTS);

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(RECENTS_KEY, JSON.stringify(updated));
      }
    } catch {
      // Ignore
    }

    notifyListeners();
  }

  /**
   * Clears recently inspected materials
   */
  static clearRecents(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(RECENTS_KEY);
      }
    } catch {
      // Ignore
    }
    notifyListeners();
  }
}
