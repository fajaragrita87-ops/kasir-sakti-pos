import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateSecureToken, getSessionFingerprint } from '../lib/security';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPERADMIN' | 'MERCHANT' | 'STAFF';
  outletId?: string;
  coins?: number;
  businessType?: 'FNB' | 'RETAIL' | 'SERVICES';
  enabledFeatures?: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  sessionFingerprint: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  loginAsDemo: () => void;
  hasPermission: (requiredRole: 'SUPERADMIN' | 'MERCHANT' | 'STAFF') => boolean;
  isSessionValid: () => boolean;
}

// Clean up any old insecure auth storage keys on load
try {
  localStorage.removeItem('auth-storage');
} catch { /* ignore */ }

// ── Demo mode features (limited set — NOT full superadmin) ───────────────────
const DEMO_FEATURES = ['POS', 'INVENTORY', 'BILLING', 'DEBT', 'CRM', 'LOYALTY', 'HRD', 'KDS', 'ACCOUNTING', 'ANTI_ANTRI', 'PURCHASE_ORDER', 'ONLINE_ORDER', 'MIGRATION'];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      sessionFingerprint: null,

      setAuth: (user, token) => set({
        user,
        token,
        sessionFingerprint: getSessionFingerprint(),
      }),

      logout: async () => {
        // Sign out dari Supabase (hapus sesi server-side)
        try { await supabase.auth.signOut(); } catch { /* ignore */ }
        set({ user: null, token: null, sessionFingerprint: null });
        // Clean up session data
        try { localStorage.removeItem('vistral-auth'); } catch { /* ignore */ }
      },

      hasPermission: (requiredRole) => {
        const user = get().user;
        if (!user) return false;
        if (user.role === 'SUPERADMIN') return true;
        if (user.role === requiredRole) return true;
        return false;
      },

      // Demo mode — SEVERELY limited access, NOT superadmin
      loginAsDemo: () => set({
        user: {
          id: `demo-${Date.now()}`,
          name: 'Demo User',
          email: 'demo@vistralpos.id',
          role: 'MERCHANT',         // ← MERCHANT, not SUPERADMIN
          outletId: 'demo-outlet',
          coins: 50,                // ← Limited coins
          businessType: 'FNB',
          enabledFeatures: DEMO_FEATURES,  // ← Only basic features
        },
        token: generateSecureToken(),      // ← Random token every time
        sessionFingerprint: getSessionFingerprint(),
      }),

      // Validate the current session is from the same browser
      isSessionValid: () => {
        const state = get();
        if (!state.user || !state.token) return false;
        if (!state.sessionFingerprint) return false;
        return state.sessionFingerprint === getSessionFingerprint();
      },
    }),
    {
      name: 'vistral-auth',
      // Use version to invalidate old sessions
      version: 2,
      migrate: () => {
        // On version mismatch, reset to clean state
        return { user: null, token: null, sessionFingerprint: null };
      },
    }
  )
);
