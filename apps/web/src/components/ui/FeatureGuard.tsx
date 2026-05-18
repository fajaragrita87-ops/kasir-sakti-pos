import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Zap, Clock, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { getActivePricing, getFeatureSub, saveFeatureSub } from '../../constants/pricing.constants';
import { supabase } from '../../lib/supabase';

interface FeatureGuardProps {
  featureId: string;
  featureName: string;
  children: React.ReactNode;
}

export function FeatureGuard({ featureId, featureName, children }: FeatureGuardProps) {
  const [pricing]      = useState(getActivePricing);
  const [subscription, setSubscription] = useState(() => getFeatureSub(featureId));
  const [timeLeft, setTimeLeft]         = useState('');
  const { user } = useAuthStore();

  // Re-check subscription every second (handles expiry in real-time)
  useEffect(() => {
    const tick = () => {
      const sub = getFeatureSub(featureId);
      setSubscription(sub);
      if (sub) {
        const dist = new Date(sub.expireAt).getTime() - Date.now();
        if (dist <= 0) { setTimeLeft('Expired'); setSubscription(null); return; }
        const d = Math.floor(dist / 86_400_000);
        const h = Math.floor((dist % 86_400_000) / 3_600_000);
        const m = Math.floor((dist % 3_600_000) / 60_000);
        const s = Math.floor((dist % 60_000) / 1000);
        setTimeLeft(d > 0
          ? `${d}h ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
          : `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [featureId]);

  const handlePurchase = useCallback(async (type: 'daily' | 'weekly' | 'monthly' | 'yearly', cost: number, days: number) => {
    const label = type === 'daily' ? 'Harian' : type === 'weekly' ? 'Mingguan' : type === 'monthly' ? 'Bulanan' : 'Tahunan';
    
    if (!user) {
      alert('Silakan login terlebih dahulu.');
      return;
    }
    if ((user.coins || 0) < cost) {
      alert(`Saldo Koin tidak cukup! Anda butuh ${cost} koin, tapi saldo Anda sisa ${user.coins || 0} koin.`);
      return;
    }

    if (!window.confirm(`Aktifkan ${featureName} paket ${label} seharga ${cost} Koin?`)) return;
    
    try {
      const newCoins = (user.coins || 0) - cost;
      
      // Update Supabase (bypass if demo user)
      if (!user.id.startsWith('demo-')) {
        const { error } = await supabase.from('profiles').update({ coins: newCoins }).eq('id', user.id);
        if (error) throw error;
      }

      // Update Auth Store
      useAuthStore.setState(state => ({
        user: state.user ? { ...state.user, coins: newCoins } : null
      }));

      // Activate feature locally
      const sub = saveFeatureSub(featureId, type, days);
      setSubscription(sub);
      
      alert(`✅ Fitur aktif! Koin Anda berhasil dipotong. Sisa koin: ${newCoins}`);
    } catch (err: any) {
      alert(`❌ Gagal mengaktifkan fitur: ${err.message}`);
    }
  }, [featureId, featureName, user]);

  const featurePrice = pricing.find(p => p.id === featureId) ?? pricing[0];

  // ── SUPERADMIN bypass ──────────────────────────────────────────
  if (user?.role === 'SUPERADMIN') return <>{children}</>;

  // ── PAYWALL ────────────────────────────────────────────────────
  if (!subscription) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 relative bg-slate-50">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-amber-50/60 z-0" />
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-4xl w-full relative z-10 text-center border border-slate-100 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -z-10" />

          <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-200">
            <Lock className="w-10 h-10 text-slate-500" />
          </div>
          <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4">
            <Zap className="w-3 h-3" /> Modul Premium
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Fitur Terkunci</h2>
          <p className="text-slate-500 font-medium max-w-xl mx-auto mb-10">
            Anda mencoba mengakses modul <span className="font-bold text-slate-900">{featureName}</span>.
            Pilih paket penggunaan untuk membuka fitur ini.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {!featurePrice.fixed && (
              <>
                {/* Harian */}
                <div className="border-2 border-slate-100 rounded-3xl p-6 hover:border-amber-400 hover:shadow-xl transition-all group flex flex-col bg-slate-50 hover:bg-white">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Harian</p>
                  <p className="text-xs text-slate-400 mb-6">Akses 24 Jam</p>
                  <div className="mt-auto">
                    <p className="text-4xl font-black text-amber-500 mb-1">{featurePrice.daily}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-6">Koin</p>
                    <button
                      onClick={() => handlePurchase('daily', featurePrice.daily, 1)}
                      className="w-full py-3 rounded-2xl font-black text-sm bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20 uppercase tracking-wide"
                    >
                      Beli Harian (v2)
                    </button>
                  </div>
                </div>

                {/* Mingguan */}
                <div className="border-2 border-amber-400 rounded-3xl p-6 shadow-xl shadow-amber-500/10 flex flex-col bg-white relative overflow-hidden transform scale-105 z-10">
                  <div className="absolute top-0 inset-x-0 bg-amber-400 text-white text-[9px] font-black py-1.5 uppercase tracking-widest text-center">⭐ Rekomendasi</div>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 mt-5">Mingguan</p>
                  <p className="text-xs text-slate-400 mb-6">Akses 7 Hari</p>
                  <div className="mt-auto">
                    <p className="text-4xl font-black text-amber-500 mb-1">{featurePrice.weekly}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-6">Koin</p>
                    <button
                      onClick={() => handlePurchase('weekly', featurePrice.weekly, 7)}
                      className="w-full py-3 rounded-2xl font-black text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 uppercase tracking-wide"
                    >
                      Beli Mingguan (v2)
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className={`border-2 border-slate-100 rounded-3xl p-6 hover:border-indigo-400 hover:shadow-xl transition-all flex flex-col bg-slate-50 hover:bg-white ${featurePrice.fixed ? 'col-span-full max-w-sm mx-auto' : ''}`}>
              {featurePrice.fixed && (
                <div className="bg-indigo-100 text-indigo-700 text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest mb-3 inline-block">Hanya Bulanan / Tahunan</div>
              )}
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bulanan</p>
              <p className="text-xs text-slate-400 mb-6">Akses 30 Hari</p>
              <div className="mt-auto">
                <p className="text-4xl font-black text-indigo-500 mb-1">{featurePrice.monthly}</p>
                <p className="text-xs font-bold text-slate-400 uppercase mb-6">Koin</p>
                <button
                  onClick={() => handlePurchase('monthly', featurePrice.monthly, 30)}
                  className="w-full py-3 rounded-2xl font-black text-sm bg-indigo-500 text-white hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20 uppercase tracking-wide"
                >
                  Beli Bulanan (v2)
                </button>
              </div>
            </div>

            {/* Tahunan */}
            <div className={`border-2 border-slate-100 rounded-3xl p-6 hover:border-rose-400 hover:shadow-xl transition-all flex flex-col bg-slate-50 hover:bg-white ${featurePrice.fixed ? 'col-span-full max-w-sm mx-auto' : ''}`}>
              {featurePrice.fixed && (
                <div className="bg-rose-100 text-rose-700 text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest mb-3 inline-block">Hanya Bulanan / Tahunan</div>
              )}
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tahunan</p>
              <p className="text-xs text-slate-400 mb-6">Akses 365 Hari (Lebih Hemat)</p>
              <div className="mt-auto">
                <p className="text-4xl font-black text-rose-500 mb-1">{featurePrice.yearly}</p>
                <p className="text-xs font-bold text-slate-400 uppercase mb-6">Koin</p>
                <button
                  onClick={() => handlePurchase('yearly', featurePrice.yearly, 365)}
                  className="w-full py-3 rounded-2xl font-black text-sm bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20 uppercase tracking-wide"
                >
                  Beli Tahunan (v2)
                </button>
              </div>
            </div>
          </div>

          <p className="mt-8 text-xs text-slate-400 font-medium">
            Butuh bantuan? Hubungi{' '}
            <a href="https://wa.me/6285320792447" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">
              Admin VISTRAL POS via WhatsApp
            </a>
          </p>
        </div>
      </div>
    );
  }

  // ── ACTIVE SUBSCRIPTION ────────────────────────────────────────
  const isExpiring = (() => {
    const dist = new Date(subscription.expireAt).getTime() - Date.now();
    return dist < 3_600_000 * 6; // less than 6 hours = warning mode
  })();

  const paketLabel = subscription.type === 'daily' ? 'Harian'
    : subscription.type === 'weekly' ? 'Mingguan' : subscription.type === 'monthly' ? 'Bulanan' : 'Tahunan';

  return (
    <div className="relative">
      {/* Active Subscription Banner - Running Text */}
      <div className={`overflow-hidden flex items-center sticky top-0 z-[90] shadow-lg border-b ${
        isExpiring
          ? 'bg-rose-600 border-rose-700'
          : 'bg-gradient-to-r from-amber-500 to-orange-500 border-orange-600'
      } text-white`}>
        <div className="whitespace-nowrap animate-[marquee_20s_linear_infinite] flex items-center py-2">
          {/* Repeat multiple times to ensure smooth scrolling */}
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="flex items-center mx-8">
              <ShieldCheck className="w-5 h-5 opacity-90 flex-shrink-0 mr-3" />
              <span className="text-sm font-bold uppercase tracking-wider">
                Anda sedang menggunakan fitur {featureName} (Paket {paketLabel})
              </span>
              <span className="mx-3 text-white/50">•</span>
              <Clock className="w-4 h-4 mr-2" />
              <span className="font-mono font-black tracking-widest text-base">
                {timeLeft || '...'}
              </span>
              {isExpiring && (
                <span className="ml-4 text-xs font-black text-rose-200 uppercase tracking-widest bg-rose-800/50 px-2 py-1 rounded">
                  ⚠️ Segera Perpanjang
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}
