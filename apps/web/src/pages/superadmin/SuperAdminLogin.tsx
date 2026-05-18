import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Lock, Mail, KeyRound, AlertCircle } from 'lucide-react';
import { useSuperAdminStore } from '../../stores/superAdmin.store';

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const { signIn, isLoading } = useSuperAdminStore();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp]           = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError('Kode 2FA harus 6 digit angka.');
      return;
    }
    const result = await signIn(email, password, otp);
    if (result.error) {
      setError(result.error);
    } else {
      navigate('/superadmin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 font-sans">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-900/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo + Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1e6fbf] rounded-2xl mb-4 shadow-lg shadow-blue-900/50">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Super Admin Access</h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">Restricted — Authorized Personnel Only</p>
          <div className="mt-3 inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
            <Lock className="w-3 h-3" /> Akses Terbatas
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@kasirsakti.id"
                  required
                  className="w-full bg-[#0f172a] border border-[#334155] text-white placeholder-slate-600 pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#1e6fbf] transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#0f172a] border border-[#334155] text-white placeholder-slate-600 pl-10 pr-12 py-3 rounded-xl text-sm focus:outline-none focus:border-[#1e6fbf] transition-colors"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 2FA Code */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Kode 2FA (6 Digit)
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  required
                  className="w-full bg-[#0f172a] border border-[#334155] text-white placeholder-slate-600 pl-10 pr-4 py-3 rounded-xl text-sm font-mono tracking-[0.3em] focus:outline-none focus:border-[#1e6fbf] transition-colors"
                />
              </div>
              <p className="text-slate-500 text-[10px] mt-1.5 font-medium">
                Dev mode: gunakan kode <span className="text-blue-400 font-mono font-black">123456</span>
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1e6fbf] hover:bg-[#1a5fa8] disabled:opacity-60 text-white font-black text-sm uppercase tracking-widest py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Authenticate
                </>
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 p-4 bg-[#0f172a] rounded-xl border border-[#334155]">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Demo Credentials</p>
            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <p>Email: <span className="text-blue-400">superadmin@kasirsakti.id</span></p>
              <p>Pass: <span className="text-blue-400">Admin@12345</span></p>
              <p>2FA: <span className="text-blue-400">123456</span></p>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-600 text-[10px] mt-6 font-medium uppercase tracking-widest">
          Kasir Sakti POS · Super Admin Console v3.0
        </p>
      </div>
    </div>
  );
}
