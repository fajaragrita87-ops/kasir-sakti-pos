import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  sku: string;
  imageUrl?: string;
  isActive: boolean;
  description?: string;
}

interface ProductState {
  products: Product[];
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  reduceStock: (id: string, qty: number) => void;
}

const DEFAULTS: Product[] = [
  { id: '1', name: 'Nasi Goreng Spesial', price: 25000, cost: 10000, stock: 15, category: 'Makanan', sku: 'MKN-001', isActive: true },
  { id: '2', name: 'Mie Ayam Bakso', price: 18000, cost: 8000, stock: 0, category: 'Makanan', sku: 'MKN-002', isActive: true },
  { id: '3', name: 'Kopi Susu Aren', price: 15000, cost: 6000, stock: 45, category: 'Minuman', sku: 'MNM-001', isActive: true },
  { id: '4', name: 'Es Teh Manis', price: 5000, cost: 1500, stock: 100, category: 'Minuman', sku: 'MNM-002', isActive: true },
  { id: '5', name: 'Ayam Penyet', price: 22000, cost: 9000, stock: 8, category: 'Makanan', sku: 'MKN-003', isActive: true },
  { id: '6', name: 'Jus Alpukat', price: 12000, cost: 4000, stock: 20, category: 'Minuman', sku: 'MNM-003', isActive: true },
];

export const useProductStore = create<ProductState>()(
  persist(
    (set) => ({
      products: DEFAULTS,
      addProduct: (p) => set(state => ({
        products: [...state.products, { ...p, id: `prod-${Date.now()}` }]
      })),
      updateProduct: (id, updates) => set(state => ({
        products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      deleteProduct: (id) => set(state => ({
        products: state.products.filter(p => p.id !== id)
      })),
      reduceStock: (id, qty) => set(state => ({
        products: state.products.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock - qty) } : p)
      })),
    }),
    { name: 'product-store' }
  )
);
