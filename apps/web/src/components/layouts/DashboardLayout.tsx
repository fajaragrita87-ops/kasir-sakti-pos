import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Package, Users,
  BookOpen, QrCode, Zap, LogOut, Menu, X, Bell, User,
  ShieldCheck, Wand2, Settings, Crown, BarChart3,
  Star, Utensils, ArrowLeftRight, Calculator, HelpCircle, Truck, ShieldAlert, Bot
} from 'lucide-react';
import { Logo } from '../ui/Logo';
import { useAuthStore } from '../../stores/auth.store';
import { OrderNotification } from '../ui/OrderNotification';
interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active: boolean;
  collapsed: boolean;
  isSAItem?: boolean;
}

function SidebarItem({ icon, label, to, active, collapsed, isSAItem }: SidebarItemProps) {
  return (
    <Link
      to={to}
      title={collapsed ? label : ''}
      className={`flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl transition-all duration-150 group ${
        active
          ? 'bg-slate-100 text-slate-900 font-semibold'
          : isSAItem
            ? 'text-rose-400 hover:bg-rose-50 hover:text-rose-600 font-medium'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium'
      }`}
    >
      <div className={`flex-shrink-0 w-5 h-5 ${active ? 'text-slate-700' : isSAItem ? 'text-rose-400' : 'text-slate-400 group-hover:text-slate-600'}`}>
        {icon}
      </div>
      {!collapsed && <span className="text-[13px] tracking-tight whitespace-nowrap">{label}</span>}
    </Link>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [keuanganOpen, setKeuanganOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isSA = user?.role === 'SUPERADMIN';
  const isMerchant = user?.role === 'MERCHANT' || isSA;
  const features = user?.enabledFeatures || [];
  // SUPERADMIN always bypasses feature check (even if old session has no enabledFeatures)
  const hasFeature = (key: string) => isSA || features.includes(key);
  const isAdmin = isSA; // alias for clarity

  const menuSections = [
    {
      title: 'Operasional',
      items: [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', to: '/dashboard', show: true },
        { icon: <ShoppingCart className="w-5 h-5" />, label: 'Kasir (POS)', to: '/pos', show: hasFeature('POS') },
        { icon: <Bell className="w-5 h-5" />, label: 'Pesanan Online', to: '/online-orders', show: isMerchant && hasFeature('ONLINE_ORDER') },
        { icon: <Package className="w-5 h-5" />, label: 'Inventori & Resep', to: '/inventory', show: isMerchant && hasFeature('INVENTORY') },
        { icon: <Truck className="w-5 h-5" />, label: 'Sistem PO & Supplier', to: '/purchase-order', show: isMerchant && hasFeature('PURCHASE_ORDER') },
        { icon: <QrCode className="w-5 h-5" />, label: 'Anti-Antri', to: '/anti-antri', show: hasFeature('ANTI_ANTRI') },
      ]
    },
    {
      title: 'Bisnis',
      items: [
        { icon: <Users className="w-5 h-5" />, label: 'Pelanggan (CRM)', to: '/customers', show: isMerchant && hasFeature('CRM') },
        { icon: <Star className="w-5 h-5" />, label: 'Loyalty Program', to: '/loyalty', show: isMerchant && hasFeature('LOYALTY') },
        { icon: <Users className="w-5 h-5" />, label: 'HRD & Payroll', to: '/hrd', show: isMerchant && hasFeature('HRD') },
        { icon: <Utensils className="w-5 h-5" />, label: 'Kitchen Display', to: '/kitchen', show: isMerchant && hasFeature('KDS') },
      ]
    },
    {
      title: 'Keuangan',
      items: [
        {
          icon: <Calculator className="w-5 h-5" />,
          label: 'Akuntansi & Kas',
          to: '/accounting',
          show: isMerchant && hasFeature('ACCOUNTING'),
          submenu: [
            { label: 'Dashboard Keuangan', to: '/accounting' },
            { label: 'Catat Penerimaan', to: '/accounting/terima-dana' },
            { label: 'Jurnal Transaksi', to: '/accounting/jurnal' },
            { label: 'Laporan Keuangan', to: '/accounting/laporan-keuangan' },
            { label: 'Daftar Kode Akun', to: '/accounting/daftar-akun' }
          ]
        },
        { icon: <BookOpen className="w-5 h-5" />, label: 'Piutang', to: '/piutang', show: isMerchant && hasFeature('DEBT') },
      ]
    },
    {
      title: 'Manajemen',
      items: [
        { icon: <Zap className="w-5 h-5" />, label: 'Informasi Layanan', to: '/billing', show: isMerchant && hasFeature('BILLING') },
        { icon: <ArrowLeftRight className="w-5 h-5" />, label: 'Migrasi Data', to: '/migration', show: isMerchant },
        { icon: <ShieldCheck className="w-5 h-5" />, label: 'Audit Log', to: '/audit', show: isSA },
        { icon: <Crown className="w-5 h-5" />, label: 'User & Admin', to: '/users', show: isSA },
        { icon: <Settings className="w-5 h-5" />, label: 'Pengaturan', to: '/settings', show: isMerchant },
        { icon: <Bot className="w-5 h-5" />, label: 'AI Sakti', to: '/ai-sakti', show: true },
        { icon: <HelpCircle className="w-5 h-5" />, label: 'Panduan Pengguna', to: '/panduan', show: true },
      ]
    },
    {
      title: 'Super Admin',
      items: [
        { icon: <ShieldAlert className="w-5 h-5" />, label: 'SA Dashboard', to: '/superadmin', show: isSA },
      ]
    }
  ];

  const sidebar = (
    <aside className={`bg-white h-full flex flex-col border-r border-slate-200 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-60'}`}>
      
      {/* Logo */}
      <div className={`h-14 flex items-center border-b border-slate-100 ${collapsed ? 'justify-center px-3' : 'px-4 gap-3'}`}>
        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-xs flex-shrink-0">V</div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 tracking-tight leading-none">VISTRAL</p>
            <p className="text-[9px] font-medium text-slate-400 tracking-widest uppercase">Pay as you go</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {menuSections.map(section => {
          const visible = section.items.filter(i => i.show);
          if (visible.length === 0) return null;
          const isSASection = section.title.includes('Super Admin');
          return (
            <div key={section.title} className="mb-1">
              {!collapsed && (
                <p className={`px-5 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                  isSASection ? 'text-rose-400' : 'text-slate-400'
                }`}>{section.title}</p>
              )}
              {collapsed && <div className="h-px bg-slate-100 mx-3 my-2" />}
              {visible.map(item => {
                if (item.submenu) {
                  const isSubActive = location.pathname.startsWith('/accounting');
                  return (
                    <div key={item.to}>
                      <button
                        onClick={() => setKeuanganOpen(!keuanganOpen)}
                        className={`flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl transition-all duration-150 group w-[calc(100%-16px)] text-left ${
                          isSubActive
                            ? 'bg-slate-100 text-slate-900 font-semibold'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium'
                        }`}
                      >
                        <div className={`flex-shrink-0 w-5 h-5 ${isSubActive ? 'text-slate-700' : 'text-slate-400 group-hover:text-slate-600'}`}>
                          {item.icon}
                        </div>
                        {!collapsed && <span className="text-[13px] tracking-tight whitespace-nowrap">{item.label}</span>}
                        {!collapsed && (
                          <span className={`ml-auto text-[10px] text-slate-300 transition-transform duration-200 ${keuanganOpen ? 'rotate-180' : ''}`}>
                            ▾
                          </span>
                        )}
                      </button>
                      {keuanganOpen && !collapsed && (
                        <div className="ml-6 pl-3 border-l-2 border-slate-100 space-y-0.5 mt-0.5 mb-1">
                          {item.submenu.map(sub => (
                            <Link
                              key={sub.to}
                              to={sub.to}
                              className={`flex items-center px-3 py-1.5 rounded-lg text-[12px] transition-all ${
                                location.pathname === sub.to
                                  ? 'bg-slate-100 text-slate-800 font-semibold'
                                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50 font-medium'
                              }`}
                            >
                              <span>{sub.label}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <SidebarItem
                    key={item.to}
                    icon={item.icon}
                    label={item.label}
                    to={item.to}
                    active={location.pathname === item.to}
                    collapsed={collapsed}
                    isSAItem={isSASection}
                  />
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 p-3 space-y-1.5">
        {!collapsed && (
          <div className="px-3 py-2 bg-slate-50 rounded-xl">
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Saldo</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="font-semibold text-slate-700 text-sm">{user?.coins?.toLocaleString() ?? '0'} Koin</span>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2.5 text-slate-400 font-medium text-[13px] hover:text-rose-500 transition-colors w-full px-3 py-2 rounded-xl hover:bg-rose-50 ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-white flex relative">
      <OrderNotification />
      {/* Desktop Sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        {sidebar}
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <div className="relative w-60 h-full shadow-2xl shadow-black/10">
            {sidebar}
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => { setCollapsed(p => !p); setMobileOpen(p => !p); }}
              className="text-slate-400 hover:text-slate-700 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:block">
              <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Selamat Datang</p>
              <h2 className="text-sm font-semibold text-slate-800 tracking-tight">{user?.name ?? 'VISTRAL POS'}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="text-xs font-semibold text-slate-600">{user?.coins?.toLocaleString() ?? '0'} Koin</span>
            </div>
            <div className="relative">
              <div className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 cursor-pointer transition-colors">
                <Bell className="w-4 h-4" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
            </div>
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:bg-slate-700 transition-colors">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}
