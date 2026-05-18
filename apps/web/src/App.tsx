import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyOtpPage from './pages/auth/VerifyOtpPage';
import LandingPage from './pages/landing/LandingPage';
import LegalPage from './pages/legal/LegalPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import InventoryPage from './pages/inventory/InventoryPage';
import PurchaseOrderPage from './pages/inventory/PurchaseOrderPage';
import CustomerPage from './pages/crm/CustomerPage';
import HRDPage from './pages/hrd/HRDPage';
import QRReadyPage from './pages/qris/QRReadyPage';
import CustomerOrderPage from './pages/qris/CustomerOrderPage';
import DebtPage from './pages/debt/DebtPage';
import AuditLogPage from './pages/audit/AuditLogPage';
import BillingPage from './pages/billing/BillingPage';
import UserAdminPage from './pages/admin/UserAdminPage';
import SuperAdminPage from './pages/superadmin/SuperAdminPage';
import SettingsPage from './pages/settings/SettingsPage';
import LoyaltyPage from './pages/loyalty/LoyaltyPage';
import KitchenDisplayPage from './pages/kitchen/KitchenDisplayPage';
import MigrationPage from './pages/migration/MigrationPage';
import AccountingPage from './pages/accounting/AccountingPage';
import OnlineOrderPage from './pages/online/OnlineOrderPage';
import UserGuidePage from './pages/guide/UserGuidePage';
import AISaktiPage from './pages/ai/AISaktiPage';

import TerimaDana from './pages/accounting/TerimaDana';
import JurnalUmum from './pages/accounting/JurnalUmum';
import LaporanKeuangan from './pages/accounting/LaporanKeuangan';
import COA from './pages/accounting/COA';

// ── SUPER ADMIN PAGES ──────────────────────────────────────
import SuperAdminLogin from './pages/superadmin/SuperAdminLogin';
import { SuperAdminGuard, SuperAdminLayout } from './pages/superadmin/SuperAdminLayout';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import KelolaSSPG from './pages/superadmin/KelolaSSPG';
import KelolaUser from './pages/superadmin/KelolaUser';
import PaketBilling from './pages/superadmin/PaketBilling';
import Analytics from './pages/superadmin/Analytics';
import Broadcast from './pages/superadmin/Broadcast';
import PengaturanSistem from './pages/superadmin/PengaturanSistem';
import Keamanan from './pages/superadmin/Keamanan';

// Components
import { DashboardLayout } from './components/layouts/DashboardLayout';
import { FeatureGuard } from './components/ui/FeatureGuard';
import { POSScreen } from './components/pos/POSScreen';
import AboutPage from './pages/about/AboutPage';
import { useAuthStore } from './stores/auth.store';
import PWAInstallBanner from './components/PWAInstallBanner';

// ── Auth Guard & Role Protection ────────────────────────────────
function RequireAuth({ children, roles }: { children: React.ReactNode, roles?: ('SUPERADMIN' | 'MERCHANT' | 'STAFF')[] }) {
  const { user, isSessionValid, logout } = useAuthStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Validate session fingerprint — prevent session hijacking
    if (!isSessionValid()) {
      logout();
      navigate('/login');
      return;
    }

    // SUPERADMIN-only routes: reject MERCHANT & STAFF
    if (roles && roles.length === 1 && roles[0] === 'SUPERADMIN' && user.role !== 'SUPERADMIN') {
      navigate('/dashboard');
      return;
    }
    if (roles && !roles.includes(user.role) && user.role !== 'SUPERADMIN') {
      navigate('/pos');
    }
  }, [user, navigate, roles, isSessionValid, logout]);

  if (!user) return null;
  if (roles && roles.length === 1 && roles[0] === 'SUPERADMIN' && user.role !== 'SUPERADMIN') return null;
  if (roles && !roles.includes(user.role) && user.role !== 'SUPERADMIN') return null;

  return <>{children}</>;
}

// ── Demo Banner ───────────────────────────────────────────────
function DemoBanner() {
  const navigate = useNavigate();
  return (
    <div className="relative z-[1000] bg-amber-500 text-white px-6 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-4">
        <div className="animate-pulse bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider hidden sm:block">Mode Demo</div>
        <p className="text-xs font-bold sm:text-sm">Anda sedang dalam mode demo (fitur terbatas). Daftar untuk akses penuh.</p>
      </div>
      <button onClick={() => navigate('/')} className="bg-white text-amber-600 px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-slate-50 transition-colors whitespace-nowrap ml-4">
        Keluar Demo
      </button>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <PWAInstallBanner />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />

        {/* Legal */}
        <Route path="/syarat-ketentuan" element={<LegalPage title="Syarat & Ketentuan" />} />
        <Route path="/kebijakan-privasi" element={<LegalPage title="Kebijakan Privasi" />} />
        <Route path="/kebijakan-koin" element={<LegalPage title="Kebijakan Koin" />} />

        <Route path="/tentang" element={<AboutPage />} />

        {/* Public Customer Order (AA-002) */}
        <Route path="/order" element={<CustomerOrderPage />} />

        {/* Demo — limited access with banner, no superadmin access */}
        <Route path="/demo" element={
          <div className="flex flex-col min-h-screen">
            <DemoBanner />
            <div className="flex-1 flex flex-col relative">
              <DashboardLayout><DashboardPage /></DashboardLayout>
            </div>
          </div>
        } />
        <Route path="/demo/pos" element={
          <div className="flex flex-col min-h-screen">
            <DemoBanner />
            <div className="flex-1 flex flex-col relative">
              <DashboardLayout><POSScreen /></DashboardLayout>
            </div>
          </div>
        } />

        {/* Authenticated routes */}
        <Route path="/dashboard" element={<RequireAuth roles={['MERCHANT']}><DashboardLayout><DashboardPage /></DashboardLayout></RequireAuth>} />
        <Route path="/pos" element={<RequireAuth><DashboardLayout><POSScreen /></DashboardLayout></RequireAuth>} />
        <Route path="/online-orders" element={<RequireAuth roles={['MERCHANT']}><DashboardLayout><FeatureGuard featureId="online_sync" featureName="Pesanan Online & E-Commerce"><OnlineOrderPage /></FeatureGuard></DashboardLayout></RequireAuth>} />
        <Route path="/inventory" element={<RequireAuth roles={['MERCHANT']}><DashboardLayout><FeatureGuard featureId="inventory" featureName="Inventori & Resep"><InventoryPage /></FeatureGuard></DashboardLayout></RequireAuth>} />
        <Route path="/purchase-order" element={<RequireAuth roles={['MERCHANT']}><DashboardLayout><FeatureGuard featureId="purchase_order" featureName="Sistem PO & Supplier"><PurchaseOrderPage /></FeatureGuard></DashboardLayout></RequireAuth>} />
        <Route path="/hrd" element={<RequireAuth roles={['MERCHANT']}><DashboardLayout><FeatureGuard featureId="hrd" featureName="HRD & Payroll"><HRDPage /></FeatureGuard></DashboardLayout></RequireAuth>} />
        <Route path="/customers" element={<RequireAuth roles={['MERCHANT']}><DashboardLayout><FeatureGuard featureId="customers" featureName="Pelanggan (CRM)"><CustomerPage /></FeatureGuard></DashboardLayout></RequireAuth>} />
        <Route path="/anti-antri" element={<RequireAuth roles={['MERCHANT']}><DashboardLayout><FeatureGuard featureId="anti_antri" featureName="QR Order (Anti-Antri)"><QRReadyPage /></FeatureGuard></DashboardLayout></RequireAuth>} />
        
        {/* Accounting Group */}
        <Route path="/accounting" element={<RequireAuth roles={['MERCHANT']}><DashboardLayout><FeatureGuard featureId="accounting" featureName="Akuntansi & Kas"><AccountingPage /></FeatureGuard></DashboardLayout></RequireAuth>} />
        <Route path="/accounting/terima-dana" element={<RequireAuth roles={['MERCHANT']}><DashboardLayout><FeatureGuard featureId="accounting" featureName="Akuntansi & Kas"><TerimaDana /></FeatureGuard></DashboardLayout></RequireAuth>} />
        <Route path="/accounting/jurnal" element={<RequireAuth roles={['MERCHANT']}><DashboardLayout><FeatureGuard featureId="accounting" featureName="Akuntansi & Kas"><JurnalUmum /></FeatureGuard></DashboardLayout></RequireAuth>} />
        <Route path="/accounting/laporan-keuangan" element={<RequireAuth roles={['MERCHANT']}><DashboardLayout><FeatureGuard featureId="accounting" featureName="Akuntansi & Kas"><LaporanKeuangan /></FeatureGuard></DashboardLayout></RequireAuth>} />
        <Route path="/accounting/daftar-akun" element={<RequireAuth roles={['MERCHANT']}><DashboardLayout><FeatureGuard featureId="accounting" featureName="Akuntansi & Kas"><COA /></FeatureGuard></DashboardLayout></RequireAuth>} />

        <Route path="/piutang" element={<RequireAuth roles={['MERCHANT']}><DashboardLayout><FeatureGuard featureId="piutang" featureName="Piutang Digital"><DebtPage /></FeatureGuard></DashboardLayout></RequireAuth>} />
        <Route path="/billing" element={<RequireAuth roles={['MERCHANT']}><DashboardLayout><BillingPage /></DashboardLayout></RequireAuth>} />
        <Route path="/audit" element={<RequireAuth roles={['MERCHANT']}><DashboardLayout><FeatureGuard featureId="audit" featureName="Audit Log Keamanan"><AuditLogPage /></FeatureGuard></DashboardLayout></RequireAuth>} />
        <Route path="/users" element={<RequireAuth roles={['SUPERADMIN']}><DashboardLayout><UserAdminPage /></DashboardLayout></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth roles={['MERCHANT']}><DashboardLayout><SettingsPage /></DashboardLayout></RequireAuth>} />
        <Route path="/panduan" element={<RequireAuth><DashboardLayout><UserGuidePage /></DashboardLayout></RequireAuth>} />
        <Route path="/ai-sakti" element={<RequireAuth><DashboardLayout><AISaktiPage /></DashboardLayout></RequireAuth>} />

        <Route path="/loyalty" element={<RequireAuth roles={['MERCHANT']}><DashboardLayout><FeatureGuard featureId="loyalty" featureName="Loyalty Program"><LoyaltyPage /></FeatureGuard></DashboardLayout></RequireAuth>} />
        <Route path="/kitchen" element={<RequireAuth><FeatureGuard featureId="kitchen" featureName="Kitchen Display (KDS)"><KitchenDisplayPage /></FeatureGuard></RequireAuth>} />
        <Route path="/migration" element={<RequireAuth roles={['MERCHANT']}><DashboardLayout><FeatureGuard featureId="migration" featureName="Smart Migration Data"><MigrationPage /></FeatureGuard></DashboardLayout></RequireAuth>} />

        {/* ════════════════════════════════════════════════════════════
            SUPER ADMIN ROUTES — Terpisah dari routing user biasa
            URL: /superadmin/*  (TIDAK muncul di sidebar user)
            User biasa yang coba akses: redirect ke /dashboard
            ════════════════════════════════════════════════════════════ */}
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />
        <Route path="/superadmin" element={<Navigate to="/superadmin/dashboard" replace />} />
        <Route path="/superadmin/*" element={
          <SuperAdminGuard>
            <SuperAdminLayout />
          </SuperAdminGuard>
        }>
          <Route path="dashboard"   element={<SuperAdminDashboard />} />
          <Route path="kelola-toko" element={<KelolaSSPG />} />
          <Route path="kelola-user" element={<KelolaUser />} />
          <Route path="billing"     element={<PaketBilling />} />
          <Route path="analytics"   element={<Analytics />} />
          <Route path="broadcast"   element={<Broadcast />} />
          <Route path="pengaturan"  element={<PengaturanSistem />} />
          <Route path="keamanan"    element={<Keamanan />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
