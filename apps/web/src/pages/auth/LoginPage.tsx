import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, Crown, Eye, EyeOff, Shield, AlertTriangle, Clock, Zap } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { Logo } from '../../components/ui/Logo';
import {
  validateSACredentials,
  generateSecureToken,
  getLoginLockoutRemaining,
  recordFailedAttempt,
  resetLoginAttempts,
  getRemainingAttempts,
  sha256,
} from '../../lib/security';
import { supabase } from '../../lib/supabase';

const SA_FEATURES = [
  'POS','INVENTORY','PURCHASE_ORDER','HRD','LOYALTY','CRM','KDS',
  'QRIS','BILLING','ACCOUNTING','DEBT','ONLINE_ORDER',
  'ANTI_ANTRI','MIGRATION','AUDIT'
];

export default function LoginPage() {
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPwd,    setShowPwd]    = useState(false);
  const [isLoading,  setIsLoading]  = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // SA Panel state
  const [saEmail,    setSaEmail]    = useState('');
  const [saPassword, setSaPassword] = useState('');
  const [showSaPwd,  setShowSaPwd]  = useState(false);
  const [saLoading,  setSaLoading]  = useState(false);
  const [saError,    setSaError]    = useState('');
  const [tab,        setTab]        = useState<'user' | 'sa'>('user');
  
  // Brute-force protection
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(5);

  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  // Check lockout status on mount and update countdown
  useEffect(() => {
    const remaining = getLoginLockoutRemaining();
    setLockoutSeconds(remaining);
    setRemainingAttempts(getRemainingAttempts());

    if (remaining > 0) {
      const interval = setInterval(() => {
        const r = getLoginLockoutRemaining();
        setLockoutSeconds(r);
        if (r <= 0) {
          clearInterval(interval);
          setRemainingAttempts(getRemainingAttempts());
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, []);

  const isLockedOut = lockoutSeconds > 0;

  // ── Login SA — credential validation via SHA-256 hash comparison ──
  const handleSALogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) return;
    
    setSaError('');
    setSaLoading(true);

    // Simulate network delay for realism
    await new Promise(r => setTimeout(r, 800));

    const isValid = await validateSACredentials(saEmail, saPassword);
    
    if (!isValid) {
      const locked = recordFailedAttempt();
      const remaining = getRemainingAttempts();
      setRemainingAttempts(remaining);
      
      if (locked) {
        const lockRemaining = getLoginLockoutRemaining();
        setLockoutSeconds(lockRemaining);
        setSaError(`Terlalu banyak percobaan. Akun dikunci selama ${Math.ceil(lockRemaining / 60)} menit.`);
        // Start countdown
        const interval = setInterval(() => {
          const r = getLoginLockoutRemaining();
          setLockoutSeconds(r);
          if (r <= 0) {
            clearInterval(interval);
            setRemainingAttempts(getRemainingAttempts());
          }
        }, 1000);
      } else {
        setSaError(`Kredensial tidak valid. Sisa percobaan: ${remaining}`);
      }
      setSaLoading(false);
      return;
    }

    // Success — generate unique session
    resetLoginAttempts();
    const hashedEmail = await sha256(saEmail.toLowerCase().trim());
    
    setAuth({
      id: `sa-${Date.now()}`,
      name: 'Super Administrator',
      email: saEmail,
      role: 'SUPERADMIN',
      outletId: 'main-outlet',
      coins: 99999,
      enabledFeatures: SA_FEATURES,
    }, generateSecureToken());
    
    navigate('/superadmin');
  };

  // ── Login Merchant ──────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) return;

    setLoginError('');
    setIsLoading(true);

    // Try Supabase Login
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Ambil data profil dari tabel profiles
      resetLoginAttempts();
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      // Auto-create profile jika belum ada (user lama)
      if (!profile) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Merchant',
          email: data.user.email || email,
          role: 'MERCHANT',
          outlet_id: `outlet-${data.user.id.slice(0, 8)}`,
          coins: 50,
          business_type: 'FNB',
          enabled_features: [
            'POS', 'INVENTORY', 'PURCHASE_ORDER', 'HRD', 'LOYALTY',
            'CRM', 'KDS', 'BILLING', 'ACCOUNTING', 'DEBT',
            'ONLINE_ORDER', 'ANTI_ANTRI', 'MIGRATION'
          ],
        });
      }

      // Default fitur lengkap untuk MERCHANT — SA akan override di SA login
      const DEFAULT_MERCHANT_FEATURES = [
        'POS', 'INVENTORY', 'PURCHASE_ORDER', 'HRD', 'LOYALTY',
        'CRM', 'KDS', 'BILLING', 'ACCOUNTING', 'DEBT',
        'ONLINE_ORDER', 'ANTI_ANTRI', 'MIGRATION'
      ];

      // Bersihkan data lama dari sesi user sebelumnya
      // Ini mencegah data dummy/lama bocor ke akun baru
      try {
        localStorage.removeItem('product-store');
        localStorage.removeItem('vistral-transactions');
        localStorage.removeItem('sakti_product_draft');
      } catch { /* ignore */ }

      setAuth({
        id: data.user.id,
        name: profile?.full_name || data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Merchant',
        email: data.user.email || email,
        role: (profile?.role as any) || 'MERCHANT',
        outletId: profile?.outlet_id || `outlet-${data.user.id}`,
        coins: profile?.coins ?? 50,
        businessType: (profile?.business_type as any) || 'FNB',
        enabledFeatures: (profile?.enabled_features as string[]) ?? DEFAULT_MERCHANT_FEATURES,
      }, data.session.access_token);
      
      navigate('/dashboard');
    } catch (err: any) {
      const locked = recordFailedAttempt();
      const remaining = getRemainingAttempts();
      setRemainingAttempts(remaining);
      
      if (locked) {
        const lockRemaining = getLoginLockoutRemaining();
        setLockoutSeconds(lockRemaining);
        setLoginError(`Terlalu banyak percobaan. Akun dikunci selama ${Math.ceil(lockRemaining / 60)} menit.`);
      } else {
        setLoginError(err.message || `Email atau password salah. Sisa percobaan: ${remaining}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatLockoutTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-100 flex flex-col justify-center py-10 px-4">
      {/* Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="flex flex-col items-center">
          <Logo />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">by Zyntra Labs</p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Lockout Banner */}
        {isLockedOut && (
          <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl px-5 py-4 mb-4 flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-sm font-black text-rose-800 uppercase">Akun Dikunci Sementara</p>
              <p className="text-xs font-bold text-rose-600">
                Terlalu banyak percobaan gagal. Coba lagi dalam {formatLockoutTime(lockoutSeconds)}
              </p>
            </div>
          </div>
        )}

        {/* ── PANEL LOGIN MERCHANT (Hanya ini yang tampil) ──────── */}
        {(
          <div className="bg-white py-10 px-6 shadow-2xl shadow-slate-200 rounded-[2rem] border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6">Masuk ke Akun</h2>

            <form className="space-y-5 relative z-10" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email Bisnis</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    id="email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setLoginError(''); }}
                    className="input-field w-full pl-10"
                    placeholder="nama@bisnis.com"
                    autoComplete="nope"
                    disabled={isLockedOut}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    id="password-input"
                    type={showPwd ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setLoginError(''); }}
                    className="input-field w-full pl-10 pr-12"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={isLockedOut}
                  />
                  <button type="button" onClick={() => setShowPwd(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-rose-700 text-sm font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {loginError}
                </div>
              )}

              {!isLockedOut && remainingAttempts < 5 && remainingAttempts > 0 && !loginError && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-amber-700 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  Sisa {remainingAttempts} percobaan sebelum akun dikunci
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="h-4 w-4 accent-violet-600 rounded" />
                  <span className="text-xs font-bold text-slate-500">Ingat Saya</span>
                </label>
                <a href="#" className="text-xs font-bold text-primary hover:underline">Lupa Password?</a>
              </div>

              <button id="btn-login" type="submit" disabled={isLoading || isLockedOut}
                className="w-full btn-premium flex items-center justify-center gap-2 py-4">
                {isLoading ? (
                  <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Memproses...</>
                ) : isLockedOut ? (
                  <><Clock className="w-4 h-4" /> Dikunci — {formatLockoutTime(lockoutSeconds)}</>
                ) : (
                  <>Masuk Sekarang <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
              <button 
                onClick={() => {
                  const { loginAsDemo } = useAuthStore.getState();
                  loginAsDemo();
                  navigate('/demo');
                }}
                className="w-full py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 hover:border-slate-200 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Coba Demo (Tanpa Daftar)
              </button>
              <p className="text-center text-xs font-bold text-slate-400">
                Belum punya akun? <Link to="/register" className="text-primary hover:underline">Daftar Gratis</Link>
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Sistem Keamanan Terenkripsi — Zyntra Labs</span>
        </div>
      </div>
    </div>
  );
}
