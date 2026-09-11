// ALAA CHEM LAB - Offline-First IndexedDB & Synchronization Engine
// Manages local offline persistence, background sync queues, and connectivity state.

export type SyncStatus = 'online' | 'offline' | 'syncing' | 'error';

export interface SyncQueueItem {
  id: string;
  action: string;
  entityType: 'project' | 'calculation' | 'progress' | 'note';
  payload: any;
  timestamp: number;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  lastError?: string;
}

export interface OfflineStorageData {
  projects: any[];
  calculations: any[];
  educationProgress: Record<string, any>;
  lastSyncedTimestamp: number | null;
}

class OfflineSyncService {
  private dbName = 'AlaaChemLab_DB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private currentStatus: SyncStatus = typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline';
  private statusListeners: Set<(status: SyncStatus) => void> = new Set();
  private syncIntervalId: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initDB();
      this.setupNetworkListeners();
      this.registerServiceWorker();
    }
  }

  // Register PWA Service Worker
  private registerServiceWorker() {
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'test') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[Offline Engine] Service Worker registered with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('[Offline Engine] Service Worker registration failed:', err);
          });
      });
    }
  }

  // Initialize IndexedDB
  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        return resolve(this.db);
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Key-value store for app state & research projects
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('calculations')) {
          db.createObjectStore('calculations', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('education')) {
          db.createObjectStore('education', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
          syncStore.createIndex('status', 'status', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.warn('[Offline Engine] IndexedDB init error, fallback to memory/localStorage:', event);
        reject(event);
      };
    });
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      console.log('[Offline Engine] Network restored. Triggering sync...');
      this.setStatus('syncing');
      this.syncPendingQueue();
    });

    window.addEventListener('offline', () => {
      console.log('[Offline Engine] Connection lost. Switched to offline mode.');
      this.setStatus('offline');
    });
  }

  public getStatus(): SyncStatus {
    return this.currentStatus;
  }

  public subscribeStatus(listener: (status: SyncStatus) => void): () => void {
    this.statusListeners.add(listener);
    listener(this.currentStatus);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private setStatus(status: SyncStatus) {
    this.currentStatus = status;
    this.statusListeners.forEach((listener) => listener(status));
  }

  // Queue an offline operation for future backend sync
  public async queueAction(
    action: string,
    entityType: 'project' | 'calculation' | 'progress' | 'note',
    payload: any
  ): Promise<string> {
    const item: SyncQueueItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      action,
      entityType,
      payload,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
    };

    try {
      const db = await this.initDB();
      const tx = db.transaction('sync_queue', 'readwrite');
      const store = tx.objectStore('sync_queue');
      store.put(item);

      // If online, immediately try to sync
      if (this.currentStatus === 'online') {
        this.syncPendingQueue();
      }
    } catch (e) {
      console.warn('[Offline Engine] Failed to queue sync item in IndexedDB:', e);
      // LocalStorage fallback for sync queue
      try {
        const queue = JSON.parse(localStorage.getItem('alaa_sync_queue') || '[]');
        queue.push(item);
        localStorage.setItem('alaa_sync_queue', JSON.stringify(queue));
      } catch (err) {
        console.error('[Offline Engine] LocalStorage sync fallback failed:', err);
      }
    }

    return item.id;
  }

  // Sync pending items with future backend or cloud sync endpoint
  public async syncPendingQueue(): Promise<void> {
    if (!navigator.onLine) {
      this.setStatus('offline');
      return;
    }

    this.setStatus('syncing');

    try {
      // Simulate backend synchronization handshake
      await new Promise((resolve) => setTimeout(resolve, 800));

      const db = await this.initDB();
      const tx = db.transaction('sync_queue', 'readwrite');
      const store = tx.objectStore('sync_queue');
      const getAllReq = store.getAll();

      getAllReq.onsuccess = async () => {
        const items: SyncQueueItem[] = getAllReq.result || [];
        const pending = items.filter((item) => item.status === 'pending' || item.status === 'failed');

        if (pending.length === 0) {
          this.setStatus('online');
          return;
        }

        // Process pending items
        for (const item of pending) {
          item.status = 'synced';
          store.put(item);
        }

        this.setStatus('online');
      };
    } catch (err) {
      console.error('[Offline Engine] Sync execution error:', err);
      this.setStatus('error');
    }
  }

  // Save entity directly to IndexedDB
  public async saveEntity(storeName: 'projects' | 'calculations' | 'education', data: any): Promise<void> {
    try {
      const db = await this.initDB();
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).put(data);
    } catch (e) {
      console.warn(`[Offline Engine] Could not persist ${storeName} to IndexedDB:`, e);
    }
  }

  // Load all entities from an IndexedDB store
  public async getAllEntities<T>(storeName: 'projects' | 'calculations' | 'education'): Promise<T[]> {
    try {
      const db = await this.initDB();
      return new Promise((resolve) => {
        const tx = db.transaction(storeName, 'readonly');
        const req = tx.objectStore(storeName).getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch (e) {
      console.warn(`[Offline Engine] Could not read ${storeName} from IndexedDB:`, e);
      return [];
    }
  }
}

export const offlineSyncService = new OfflineSyncService();
