import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPERADMIN' | 'MERCHANT' | 'STAFF';
  outletId?: string;
  coins?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  loginAsDemo: () => void;
  hasPermission: (requiredRole: 'SUPERADMIN' | 'MERCHANT' | 'STAFF') => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      hasPermission: (requiredRole) => {
        const user = get().user;
        if (!user) return false;
        if (user.role === 'SUPERADMIN') return true;
        if (user.role === requiredRole) return true;
        return false;
      },
      loginAsDemo: () => set({
        user: {
          id: 'demo-id',
          name: 'Demo Superadmin',
          email: 'demo@saktipos.id',
          role: 'SUPERADMIN',
          outletId: 'demo-outlet',
          coins: 9999
        },
        token: 'demo-token'
      })
    }),
    {
      name: 'auth-storage',
    }
  )
);
