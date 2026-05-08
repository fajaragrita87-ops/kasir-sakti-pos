import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { Logo } from '../../components/ui/Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth, loginAsDemo } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Hardcoded Superadmin for User
    if (email === 'admin@saktipos.id' && password === 'SaktiFull2026') {
      setAuth({
        id: 'super-1',
        name: 'Superadmin Sakti',
        email: 'admin@saktipos.id',
        role: 'SUPERADMIN',
        outletId: 'main-outlet',
        coins: 5000
      }, 'super-token');
      navigate('/dashboard');
      return;
    }

    // Mock other logins for now
    setTimeout(() => {
      setAuth({
        id: '1',
        name: 'Merchant Sakti',
        email,
        role: 'MERCHANT',
        outletId: 'outlet-1',
        coins: 100
      }, 'mock-token');
      navigate('/dashboard');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex flex-col items-center mb-8">
          <Logo />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">by Zyntra Labs</p>
        </div>
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Selamat Datang</h2>
        <p className="mt-2 text-sm text-slate-500 font-medium">
          Masuk untuk mengelola bisnis Anda lebih sakti.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-2xl shadow-slate-200 rounded-[2.5rem] border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
          
          <form className="space-y-6 relative z-10" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email Bisnis</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full pl-10"
                  placeholder="nama@bisnis.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field w-full pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input type="checkbox" className="h-4 w-4 text-primary border-slate-300 rounded" />
                <label className="ml-2 block text-xs font-bold text-slate-500">Ingat Saya</label>
              </div>
              <div className="text-xs font-bold">
                <a href="#" className="text-primary hover:underline">Lupa Password?</a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-premium flex items-center justify-center gap-2 py-4"
            >
              {isLoading ? 'Memproses...' : 'Masuk Sekarang'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 space-y-3">
            {/* Mode Sultan — SKPL 5.1 */}
            <button 
              onClick={() => { loginAsDemo(); navigate('/dashboard'); }}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-xl shadow-amber-500/20"
            >
              <Zap className="w-4 h-4 fill-current" /> ⚡ MODE SULTAN — Trial 24 Jam Gratis
            </button>
            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Akses penuh semua fitur premium selama 24 jam</p>
            <button 
              onClick={() => { loginAsDemo(); navigate('/dashboard'); }}
              className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary transition-all"
            >
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Demo Full Access (9.999 Koin)
            </button>
            <p className="text-center text-xs font-bold text-slate-400">
              Belum punya akun? <Link to="/register" className="text-primary hover:underline">Daftar Gratis</Link>
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Sistem Keamanan Terenkripsi — Zyntra Labs</span>
        </div>
      </div>
    </div>
  );
}
