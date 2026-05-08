import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Package, Users,
  BookOpen, QrCode, Zap, LogOut, Menu, X, Bell, User,
  ShieldCheck, Wand2, Settings, Crown, BarChart3,
  Star, Utensils, ArrowLeftRight
} from 'lucide-react';
import { Logo } from '../ui/Logo';
import { useAuthStore } from '../../stores/auth.store';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active: boolean;
  collapsed: boolean;
}

function SidebarItem({ icon, label, to, active, collapsed }: SidebarItemProps) {
  return (
    <Link
      to={to}
      title={collapsed ? label : ''}
      className={`flex items-center gap-4 px-4 py-3.5 mx-3 rounded-2xl transition-all duration-200 group ${
        active
          ? 'bg-primary/10 text-primary font-black'
          : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
      }`}
    >
      <div className={`flex-shrink-0 ${active ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`}>
        {icon}
      </div>
      {!collapsed && <span className="text-sm font-bold tracking-wide whitespace-nowrap">{label}</span>}
      {active && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"></div>}
    </Link>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isSA = user?.role === 'SUPERADMIN';
  const isMerchant = user?.role === 'MERCHANT' || isSA;

  const menuSections = [
    {
      title: 'Operasional',
      items: [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', to: '/dashboard', show: true },
        { icon: <ShoppingCart className="w-5 h-5" />, label: 'Kasir (POS)', to: '/pos', show: true },
        { icon: <Package className="w-5 h-5" />, label: 'Inventori', to: '/inventory', show: isMerchant },
        { icon: <QrCode className="w-5 h-5" />, label: 'Anti-Antri', to: '/anti-antri', show: true },
      ]
    },
    {
      title: 'Bisnis',
      items: [
        { icon: <Users className="w-5 h-5" />, label: 'Pelanggan (CRM)', to: '/customers', show: isMerchant },
        { icon: <Star className="w-5 h-5" />, label: 'Loyalty Program', to: '/loyalty', show: isMerchant },
        { icon: <BookOpen className="w-5 h-5" />, label: 'Piutang', to: '/piutang', show: isMerchant },
        { icon: <Users className="w-5 h-5" />, label: 'HRD & Payroll', to: '/hrd', show: isMerchant },
        { icon: <Wand2 className="w-5 h-5" />, label: 'Cetak Menu', to: '/menu', show: true },
        { icon: <Utensils className="w-5 h-5" />, label: 'Kitchen Display', to: '/kitchen', show: isMerchant },
      ]
    },
    {
      title: 'Manajemen',
      items: [
        { icon: <Zap className="w-5 h-5" />, label: 'Koin & Billing', to: '/billing', show: isMerchant },
        { icon: <ArrowLeftRight className="w-5 h-5" />, label: 'Migrasi Data', to: '/migration', show: isMerchant },
        { icon: <ShieldCheck className="w-5 h-5" />, label: 'Audit Log', to: '/audit', show: isSA },
        { icon: <Crown className="w-5 h-5" />, label: 'User & Admin', to: '/users', show: isSA },
        { icon: <Settings className="w-5 h-5" />, label: 'Pengaturan', to: '/settings', show: isMerchant },
      ]
    }
  ];

  const sidebar = (
    <aside className={`bg-white h-full flex flex-col border-r border-slate-100 transition-all duration-300 ${collapsed ? 'w-20' : 'w-72'}`}>
      {/* Logo */}
      <div className={`h-20 flex items-center border-b border-slate-50 ${collapsed ? 'justify-center px-4' : 'px-6 gap-3'}`}>
        <Logo showText={!collapsed} className="h-8" />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1">
        {menuSections.map(section => {
          const visible = section.items.filter(i => i.show);
          if (visible.length === 0) return null;
          return (
            <div key={section.title}>
              {!collapsed && (
                <p className="px-7 py-2 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">{section.title}</p>
              )}
              {visible.map(item => (
                <SidebarItem
                  key={item.to}
                  icon={item.icon}
                  label={item.label}
                  to={item.to}
                  active={location.pathname === item.to}
                  collapsed={collapsed}
                />
              ))}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-50 p-4 space-y-2">
        {!collapsed && (
          <div className="px-4 py-3 bg-slate-50 rounded-2xl mb-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Koin</p>
            <div className="flex items-center gap-2 mt-1">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="font-black text-amber-600">{user?.coins?.toLocaleString() ?? '0'} Koin</span>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 text-rose-500 font-bold text-sm hover:opacity-70 transition-opacity w-full px-4 py-3 rounded-2xl hover:bg-rose-50 ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        {sidebar}
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="relative w-72 h-full">
            {sidebar}
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => { setCollapsed(p => !p); setMobileOpen(p => !p); }}
              className="text-slate-400 hover:text-primary transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selamat Datang</p>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">{user?.name ?? 'Kasir Sakti'}</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-2xl border border-amber-200">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-black text-amber-600">{user?.coins?.toLocaleString() ?? '0'} KOIN</span>
            </div>
            <div className="relative">
              <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                <Bell className="w-5 h-5" />
              </div>
              <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 border-2 border-white rounded-full"></span>
            </div>
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <User className="w-5 h-5" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
