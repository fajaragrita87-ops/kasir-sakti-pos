import { create } from 'zustand';

export type SuperAdminRole = 'super_admin' | 'support' | 'finance_viewer';

export interface SuperAdmin {
  id: string;
  nama: string;
  email: string;
  role: SuperAdminRole;
}

interface SuperAdminState {
  superAdmin: SuperAdmin | null;
  isLoading: boolean;
  signIn: (email: string, password: string, otpCode: string) => Promise<{ error: string | null }>;
  signOut: () => void;
  loadProfile: () => void;
}

// TODO: connect to Supabase — tabel super_admins
const MOCK_ADMINS = [
  { id: 'sa-001', nama: 'Super Admin Utama', email: 'superadmin@kasirsakti.id', password: 'Admin@12345', role: 'super_admin' as SuperAdminRole },
  { id: 'sa-002', nama: 'Tim Support',        email: 'support@kasirsakti.id',    password: 'Support@123', role: 'support' as SuperAdminRole },
  { id: 'sa-003', nama: 'Finance Viewer',     email: 'finance@kasirsakti.id',    password: 'Finance@123', role: 'finance_viewer' as SuperAdminRole },
];
const VALID_OTP = '123456'; // TODO: implement real TOTP

const SESSION_KEY = 'sa_session';

export const useSuperAdminStore = create<SuperAdminState>((set) => ({
  superAdmin: null,
  isLoading: false,

  signIn: async (email, password, otpCode) => {
    set({ isLoading: true });
    await new Promise(r => setTimeout(r, 800)); // simulate network

    // TODO: connect to Supabase super_admins table
    const found = MOCK_ADMINS.find(a => a.email === email && a.password === password);
    if (!found) {
      set({ isLoading: false });
      return { error: 'Email atau password salah.' };
    }
    if (otpCode !== VALID_OTP) {
      set({ isLoading: false });
      return { error: 'Kode 2FA tidak valid.' };
    }

    const admin: SuperAdmin = { id: found.id, nama: found.nama, email: found.email, role: found.role };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(admin));
    set({ superAdmin: admin, isLoading: false });
    return { error: null };
  },

  signOut: () => {
    sessionStorage.removeItem(SESSION_KEY);
    set({ superAdmin: null });
  },

  loadProfile: () => {
    // TODO: validate against Supabase session
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      try {
        const admin = JSON.parse(raw) as SuperAdmin;
        set({ superAdmin: admin });
      } catch {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
  },
}));

/** Helper — can this role access the given section? */
export function canAccess(role: SuperAdminRole | undefined, section: 'billing' | 'settings' | 'security'): boolean {
  if (!role) return false;
  if (role === 'super_admin') return true;
  if (role === 'support' && section === 'billing') return false;
  if (role === 'support' && section === 'settings') return false;
  if (role === 'finance_viewer' && section === 'security') return false;
  if (role === 'finance_viewer' && section === 'settings') return false;
  return true;
}
