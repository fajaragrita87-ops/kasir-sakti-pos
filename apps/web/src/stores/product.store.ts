import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProductComponent {
  id: string;
  productId: string; // The raw material product ID
  quantity: number;
}

export interface ProductVariantOption {
  name: string;
  priceDelta: number;
}

export interface ProductVariant {
  name: string; // e.g. "Ukuran"
  options: ProductVariantOption[];
}

export interface ProductModifier {
  name: string; // e.g. "Topping"
  multiple: boolean;
  options: ProductVariantOption[];
}

export interface ProductUnit {
  name: string; // e.g. "Dus"
  conversionRate: number; // e.g. 40 (1 Dus = 40 Pcs)
  price: number;
}

export interface WholesalePrice {
  minQty: number;
  price: number;
}

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
  unit: string;
  isComposite: boolean;
  components?: ProductComponent[];
  variants?: ProductVariant[];
  modifiers?: ProductModifier[];
  wholesalePrices?: WholesalePrice[];
  units?: ProductUnit[];
}

interface ProductState {
  products: Product[];
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  reduceStock: (id: string, qty: number) => void;
  categories: string[];
  addCategory: (name: string) => void;
  updateCategory: (oldName: string, newName: string) => void;
  deleteCategory: (name: string) => void;
}

const DEFAULTS: Product[] = [];

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
      reduceStock: (id: string, qty: number) => set(state => {
        const products = [...state.products];
        const pIndex = products.findIndex(p => p.id === id);
        if (pIndex === -1) return { products };
        
        const p = products[pIndex];
        
        // Kurangi stok produk utama
        products[pIndex] = { ...p, stock: Math.max(0, p.stock - qty) };
        
        // Kurangi stok bahan baku (komponen)
        if (p.isComposite && p.components) {
          p.components.forEach(comp => {
            const compIndex = products.findIndex(c => c.id === comp.productId);
            if (compIndex !== -1) {
              products[compIndex] = { 
                ...products[compIndex], 
                stock: Math.max(0, products[compIndex].stock - (comp.quantity * qty))
              };
            }
          });
        }
        
        return { products };
      }),
      categories: ['Makanan', 'Minuman', 'Snack', 'Paket', 'Bahan Baku', 'Lain-lain'],
      addCategory: (name) => set(state => ({
        categories: [...state.categories, name]
      })),
      updateCategory: (oldName, newName) => set(state => {
        const newCats = state.categories.map(c => c === oldName ? newName : c);
        const newProds = state.products.map(p => p.category === oldName ? { ...p, category: newName } : p);
        return { categories: newCats, products: newProds };
      }),
      deleteCategory: (name) => set(state => ({
        categories: state.categories.filter(c => c !== name),
        products: state.products.map(p => p.category === name ? { ...p, category: 'Lain-lain' } : p)
      })),
    }),
    { name: 'product-store' }
  )
);
