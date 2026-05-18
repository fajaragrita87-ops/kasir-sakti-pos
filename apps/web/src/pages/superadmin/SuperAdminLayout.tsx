import React, { useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, CreditCard, BarChart3,
  Bell, Settings, Shield, LogOut, Zap, ChevronRight
} from 'lucide-react';
import { useSuperAdminStore, canAccess } from '../../stores/superAdmin.store';

// ── Guard Component ──────────────────────────────────────────
export function SuperAdminGuard({ children }: { children: React.ReactNode }) {
  const { superAdmin, loadProfile } = useSuperAdminStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (superAdmin === null) {
      // Give a moment for loadProfile to complete
      const t = setTimeout(() => {
        const raw = sessionStorage.getItem('sa_session');
        if (!raw) navigate('/superadmin/login');
      }, 100);
      return () => clearTimeout(t);
    }
  }, [superAdmin, navigate]);

  const raw = sessionStorage.getItem('sa_session');
  if (!raw && !superAdmin) return null;

  return <>{children}</>;
}

// ── Sidebar ──────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview',          path: '/superadmin/dashboard' },
  { icon: Building2,       label: 'Kelola Toko',       path: '/superadmin/kelola-toko' },
  { icon: Users,           label: 'Kelola User',       path: '/superadmin/kelola-user' },
  { icon: CreditCard,      label: 'Paket & Billing',   path: '/superadmin/billing', section: 'billing' as const },
  { icon: BarChart3,       label: 'Analytics',         path: '/superadmin/analytics' },
  { icon: Bell,            label: 'Broadcast',         path: '/superadmin/broadcast' },
  { icon: Settings,        label: 'Pengaturan Sistem', path: '/superadmin/pengaturan', section: 'settings' as const },
  { icon: Shield,          label: 'Keamanan',          path: '/superadmin/keamanan', section: 'security' as const },
];

function SuperAdminSidebar() {
  const { superAdmin, signOut } = useSuperAdminStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate('/superadmin/login');
  };

  return (
    <aside className="w-[220px] flex-shrink-0 bg-[#0f172a] flex flex-col h-screen sticky top-0 z-30">
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#1e6fbf] rounded-xl flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-black text-sm tracking-tight">Super Admin</p>
            <p className="text-slate-500 text-[10px] font-medium uppercase tracking-widest">Console</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const blocked = item.section ? !canAccess(superAdmin?.role, item.section) : false;
          if (blocked) return null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#1e293b] text-white'
                    : 'text-[#94a3b8] hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User area */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1">
          <div className="w-8 h-8 bg-[#1e6fbf] rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0">
            {superAdmin?.nama?.charAt(0) ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold truncate">{superAdmin?.nama ?? '—'}</p>
            <p className="text-slate-500 text-[10px] truncate">{superAdmin?.role}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors text-sm font-semibold">
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}

// ── Top Bar ──────────────────────────────────────────────────
function SuperAdminTopBar({ title }: { title?: string }) {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-2">
      <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Super Admin</span>
      {title && (
        <>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-slate-700 text-xs font-bold uppercase tracking-widest">{title}</span>
        </>
      )}
    </div>
  );
}

// ── Layout ───────────────────────────────────────────────────
export function SuperAdminLayout() {
  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      <SuperAdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export { SuperAdminTopBar };
