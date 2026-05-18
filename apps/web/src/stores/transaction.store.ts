import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem { 
  id: string; 
  name: string; 
  price: number; 
  basePrice: number;
  quantity: number; 
  imageUrl?: string;
  variant?: string;
  modifiers?: string[];
  unit?: string;
  conversionRate?: number;
  cartItemId: string;
}

export interface Transaction { 
  id: string; 
  time: string; 
  items: CartItem[]; 
  total: number; 
  method: string; 
  cashier: string; 
  type?: 'OFFLINE' | 'ONLINE'; // To distinguish online vs offline
}

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  clearTransactions: () => void;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set) => ({
      transactions: [],
      addTransaction: (tx) => set((state) => ({ 
        transactions: [tx, ...state.transactions] 
      })),
      clearTransactions: () => set({ transactions: [] }),
    }),
    {
      name: 'vistral-transactions',
    }
  )
);
