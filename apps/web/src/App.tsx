import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyOtpPage from './pages/auth/VerifyOtpPage';
import LandingPage from './pages/landing/LandingPage';
import LegalPage from './pages/legal/LegalPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import InventoryPage from './pages/inventory/InventoryPage';
import CustomerPage from './pages/crm/CustomerPage';
import HRDPage from './pages/hrd/HRDPage';
import QRReadyPage from './pages/qris/QRReadyPage';
import CustomerOrderPage from './pages/qris/CustomerOrderPage';
import DebtPage from './pages/debt/DebtPage';
import AuditLogPage from './pages/audit/AuditLogPage';
import BillingPage from './pages/billing/BillingPage';
import PrintMenuPage from './pages/menu/PrintMenuPage';
import UserAdminPage from './pages/admin/UserAdminPage';
import SettingsPage from './pages/settings/SettingsPage';
import LoyaltyPage from './pages/loyalty/LoyaltyPage';
import KitchenDisplayPage from './pages/kitchen/KitchenDisplayPage';
import MigrationPage from './pages/migration/MigrationPage';

// Components
import { DashboardLayout } from './components/layouts/DashboardLayout';
import { POSScreen } from './components/pos/POSScreen';
import AboutPage from './pages/about/AboutPage';
import { useAuthStore } from './stores/auth.store';
import PWAInstallBanner from './components/PWAInstallBanner';

// ── Auth Guard & Role Protection ────────────────────────────────
function RequireAuth({ children, roles }: { children: React.ReactNode, roles?: ('SUPERADMIN' | 'MERCHANT' | 'STAFF')[] }) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (roles && !roles.includes(user.role) && user.role !== 'SUPERADMIN') {
      // Jika Staff mencoba buka menu Merchant/Superadmin, tendang ke POS
      navigate('/pos');
    }
  }, [user, navigate, roles]);

  if (!user) return null;
  if (roles && !roles.includes(user.role) && user.role !== 'SUPERADMIN') return null;

  return <>{children}</>;
}

// ── Demo Banner ───────────────────────────────────────────────
function DemoBanner() {
  const navigate = useNavigate();
  return (
    <div className="fixed top-0 left-0 right-0 z-[1000] bg-primary text-white px-6 py-3 flex items-center justify-between shadow-2xl">
      <div className="flex items-center gap-4">
        <div className="animate-pulse bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">Demo Mode</div>
        <p className="text-xs font-bold sm:text-sm">Anda sedang dalam mode simulasi Kasir Sakti POS.</p>
      </div>
      <button onClick={() => navigate('/')} className="bg-white text-primary px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-slate-50 transition-colors">
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

        {/* Demo — masuk dashboard dengan banner */}
        <Route path="/demo" element={
          <div className="relative">
            <DemoBanner />
            <div className="pt-14">
              <DashboardLayout><DashboardPage /></DashboardLayout>
            </div>
          </div>
        } />
        <Route path="/demo/pos" element={
          <div className="relative">
            <DemoBanner />
            <div className="pt-14">
              <DashboardLayout><POSScreen /></DashboardLayout>
            </div>
          </div>
        } />
        <Route path="/demo/menu" element={
          <div className="relative">
            <DemoBanner />
            <div className="pt-14">
              <DashboardLayout><PrintMenuPage /></DashboardLayout>
            </div>
          </div>
        } />

        {/* Authenticated routes */}
        <Route path="/dashboard" element={<RequireAuth roles={['MERCHANT']}><DashboardLayout><DashboardPage /></DashboardLayout></RequireAuth>} />
        <Route path="/pos" element={<RequireAuth><DashboardLayout><POSScreen /></DashboardLayout></RequireAuth>} />
        <Route path="/inventory" element={<RequireAuth roles={['MERCHANT']}><DashboardLayout><InventoryPage /></DashboardLayout></RequireAuth>} />
        <Route path="/hrd" element={<RequireAuth roles={['MERCHANT']}><DashboardLayout><HRDPage /></DashboardLayout></RequireAuth>} />
        <Route path="/customers" element={<RequireAuth roles={['MERCHANT']}><DashboardLayout><CustomerPage /></DashboardLayout></RequireAuth>} />
        <Route path="/anti-antri" element={<RequireAuth roles={['MERCHANT']}><DashboardLayout><QRReadyPage /></DashboardLayout></RequireAuth>} />
        <Route path="/piutang" element={<RequireAuth roles={['MERCHANT']}><DashboardLayout><DebtPage /></DashboardLayout></RequireAuth>} />
        <Route path="/billing" element={<RequireAuth roles={['MERCHANT']}><DashboardLayout><BillingPage /></DashboardLayout></RequireAuth>} />
        <Route path="/menu" element={<RequireAuth><DashboardLayout><PrintMenuPage /></DashboardLayout></RequireAuth>} />
        <Route path="/audit" element={<RequireAuth roles={['MERCHANT']}><DashboardLayout><AuditLogPage /></DashboardLayout></RequireAuth>} />
        <Route path="/users" element={<RequireAuth roles={['SUPERADMIN']}><DashboardLayout><UserAdminPage /></DashboardLayout></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth roles={['MERCHANT']}><DashboardLayout><SettingsPage /></DashboardLayout></RequireAuth>} />

        <Route path="/loyalty" element={<RequireAuth roles={['MERCHANT']}><DashboardLayout><LoyaltyPage /></DashboardLayout></RequireAuth>} />
        <Route path="/kitchen" element={<RequireAuth><KitchenDisplayPage /></RequireAuth>} />
        <Route path="/migration" element={<RequireAuth roles={['MERCHANT']}><DashboardLayout><MigrationPage /></DashboardLayout></RequireAuth>} />

        {/* 404 */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
