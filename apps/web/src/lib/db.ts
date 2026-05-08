import Dexie, { type EntityTable } from 'dexie';

interface OfflineTransaction {
  id?: string;
  items: any[];
  total: number;
  paymentMethod: string;
  createdAt: number;
  synced: boolean;
}

interface OfflineProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
}

const db = new Dexie('KasirSaktiOffline') as Dexie & {
  transactions: EntityTable<OfflineTransaction, 'id'>;
  products: EntityTable<OfflineProduct, 'id'>;
  settings: EntityTable<{ key: string; value: any }, 'key'>;
};

// Schema definition
db.version(1).stores({
  transactions: '++id, synced, createdAt',
  products: 'id, name, category',
  settings: 'key'
});

export { db };
export type { OfflineTransaction, OfflineProduct };
