// Kasir Sakti POS - Offline Service (Patch 2)
// Uses IndexedDB to store queued transactions when the app is offline

const DB_NAME = 'KasirSaktiDB';
const DB_VERSION = 1;
const STORE_NAME = 'queued_transactions';

export class OfflineService {
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (event) => {
        console.error('IndexedDB init error:', event);
        reject('Error initializing IndexedDB');
      };
    });
  }

  async queueTransaction(transaction: any): Promise<void> {
    if (!this.db) await this.initDB();
    return new Promise((resolve, reject) => {
      const transactionToSave = {
        ...transaction,
        id: transaction.id || `offline-${Date.now()}`,
        queuedAt: new Date().toISOString()
      };
      
      const tx = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.add(transactionToSave);

      request.onsuccess = () => resolve();
      request.onerror = (e) => reject(e);
    });
  }

  async getQueuedTransactions(): Promise<any[]> {
    if (!this.db) await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = (e) => reject(e);
    });
  }

  async removeTransaction(id: string): Promise<void> {
    if (!this.db) await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = (e) => reject(e);
    });
  }

  async clearQueue(): Promise<void> {
    if (!this.db) await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = (e) => reject(e);
    });
  }
}

export const offlineService = new OfflineService();
