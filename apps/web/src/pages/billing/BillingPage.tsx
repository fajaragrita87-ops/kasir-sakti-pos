import React, { useState, useEffect } from 'react';
import { Zap, Clock, CheckCircle, ArrowUpRight, AlertCircle, Package, Sparkles, Info } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import {
  getActivePricing, STORAGE_KEY_SUBS,
  COIN_TOPUP_PACKAGES,
  PLATFORM_FEE_PER_TRX,
} from '../../constants/pricing.constants';

// ── Countdown Hook ────────────────────────────────────────────
function useCountdown(expireAt: string | null) {
  const [timeLeft, setTimeLeft] = useState('');
  const [pct, setPct] = useState(100);
  useEffect(() => {
    if (!expireAt) return;
    const id = setInterval(() => {
      const dist = new Date(expireAt).getTime() - Date.now();
      if (dist <= 0) { setTimeLeft('Expired'); clearInterval(id); return; }
      const d = Math.floor(dist / 86400000);
      const h = Math.floor((dist % 86400000) / 3600000);
      const m = Math.floor((dist % 3600000) / 60000);
      const s = Math.floor((dist % 60000) / 1000);
      setTimeLeft(d > 0
        ? `${d}h ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
        : `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
      setPct(Math.max(0, Math.min(100, (dist / ((d + 1) * 86400000)) * 100)));
    }, 1000);
    return () => clearInterval(id);
  }, [expireAt]);
  return { timeLeft, pct };
}

// ── Active Sub Card ───────────────────────────────────────────
function ActiveSubCard({ mod, sub }: { mod: any; sub: any }) {
  const { timeLeft, pct } = useCountdown(sub.expireAt);
  const isExpiring = pct < 20;
  const typeLabel = sub.type === 'daily' ? 'Harian' : sub.type === 'weekly' ? 'Mingguan' : 'Bulanan';
  return (
    <div className={`p-4 rounded-2xl border-2 ${isExpiring ? 'border-rose-200 bg-rose-50' : 'border-emerald-100 bg-emerald-50'}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-black text-slate-800 text-sm">{mod.icon} {mod.name}</p>
          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${isExpiring ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-700'}`}>
            Paket {typeLabel}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold text-slate-400 uppercase">Sisa Waktu</p>
          <p className={`font-mono font-black text-base ${isExpiring ? 'text-rose-600' : 'text-emerald-700'}`}>{timeLeft}</p>
        </div>
      </div>
      <div className="w-full bg-white/60 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full transition-all ${isExpiring ? 'bg-rose-400' : 'bg-emerald-400'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function BillingPage() {
  const { user } = useAuthStore();
  const [subs, setSubs] = useState<Record<string, { type: string; expireAt: string; startAt: string }>>({});
  const [pricing] = useState(getActivePricing);
  const [activeTab, setActiveTab] = useState<'koin' | 'modul'>('koin');

  useEffect(() => {
    const s = localStorage.getItem(STORAGE_KEY_SUBS) || localStorage.getItem('sakti_subs');
    if (s) setSubs(JSON.parse(s));
  }, []);

  const activeSubs = Object.entries(subs).filter(([, v]) => new Date(v.expireAt).getTime() > Date.now());
  const fmtRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  // Group modules by category
  const categories: Record<string, { label: string; color: string }> = {
    operasional: { label: 'Operasional', color: 'blue' },
    keuangan:    { label: 'Keuangan',    color: 'emerald' },
    pelanggan:   { label: 'Pelanggan',   color: 'violet' },
    fnb:         { label: 'F&B / Restoran', color: 'orange' },
    advanced:    { label: 'Advanced',    color: 'rose' },
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/20">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Billing & Koin</h1>
            <p className="text-slate-500 font-medium text-sm">1 Koin = Rp 1.000 · Pay As You Go · Tanpa Kontrak</p>
          </div>
        </div>
      </header>

      {/* Saldo + Modul Aktif */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Saldo Koin */}
        <div className="bg-white rounded-[2rem] p-6 relative overflow-hidden shadow-sm border border-slate-200">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-50 rounded-full blur-[60px]" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 relative z-10">Saldo Koin Aktif</p>
          <div className="flex items-end gap-2 mb-4 relative z-10">
            <Zap className="w-7 h-7 text-amber-500 fill-amber-500 mb-1" />
            <span className="text-5xl font-black text-slate-800 italic">{(user?.coins ?? 1240).toLocaleString()}</span>
            <span className="text-slate-500 font-black mb-1">Koin</span>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-3 relative z-10 mb-3">
            <Clock className="w-4 h-4 text-amber-500" />
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Modul Aktif</p>
              <p className="font-black text-slate-800">{activeSubs.length} Modul</p>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-3 relative z-10">
            <Info className="w-4 h-4 text-slate-400" />
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
              Fee platform: <strong className="text-slate-700">Rp {PLATFORM_FEE_PER_TRX.toLocaleString('id-ID')}/transaksi</strong>
            </p>
          </div>
        </div>

        {/* Active Subs */}
        <div className="lg:col-span-2">
          <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-3">Modul Aktif Saat Ini</h3>
          {activeSubs.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center h-full flex flex-col items-center justify-center">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-black text-slate-400 uppercase tracking-tight">Belum Ada Modul Aktif</p>
              <p className="text-sm text-slate-400 mt-1">Buka modul dari menu fitur yang Anda butuhkan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeSubs.map(([id, sub]) => {
                const mod = pricing.find(p => p.id === id);
                return mod ? <ActiveSubCard key={id} mod={mod} sub={sub} /> : null;
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6 bg-slate-100 p-1.5 rounded-2xl w-fit">
        {([['koin', '⚡ Isi Koin'], ['modul', '🔍 Harga Modul']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`px-5 py-2.5 rounded-xl text-sm font-black uppercase transition-all ${activeTab === key ? 'bg-white shadow-md text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── TAB: ISI KOIN ── */}
      {activeTab === 'koin' && (
        <div>
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-amber-800 text-sm">Semakin banyak beli, semakin hemat!</p>
              <p className="text-xs text-amber-700 font-medium mt-0.5">Koin tidak kadaluarsa · Bisa digunakan untuk modul apapun · Transfer ke outlet lain</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COIN_TOPUP_PACKAGES.map(pkg => (
              <div key={pkg.id} className={`relative bg-white rounded-[1.5rem] p-5 border-2 overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 ${pkg.badge === 'Paling Populer' ? 'border-amber-400 shadow-lg shadow-amber-100' : 'border-slate-100'}`}>
                {pkg.badge && (
                  <div className={`absolute top-0 inset-x-0 py-1 text-center text-[9px] font-black uppercase tracking-widest ${pkg.badge === 'Paling Populer' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
                    {pkg.badge}
                  </div>
                )}
                <div className={pkg.badge ? 'mt-5' : ''}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{pkg.label}</p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl font-black text-slate-900">{pkg.coins}</span>
                    <span className="text-amber-500 font-black text-sm mb-1">Koin</span>
                  </div>
                  {pkg.bonus > 0 && (
                    <p className="text-xs font-black text-emerald-600 mb-1">+{pkg.bonus} Koin Bonus 🎁</p>
                  )}
                  <p className="text-sm font-black text-amber-600 mb-1">{fmtRp(pkg.price)}</p>
                  <p className="text-[10px] text-slate-400 font-medium mb-4">~Rp {pkg.pricePerCoin}/koin</p>
                  <a href={`https://wa.me/6285320792447?text=Halo Admin Vistral POS!%0ASaya ingin beli Paket ${pkg.label}%0A• ${pkg.coins + pkg.bonus} Koin (termasuk bonus)%0A• Harga: ${fmtRp(pkg.price)}%0A%0ANama: [nama]%0ANo HP: [nomor]`}
                    target="_blank" rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-amber-500 hover:text-white transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" /> Beli via WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-400 font-medium mt-4">
            💳 Pembayaran via Transfer Bank / QRIS · Konfirmasi otomatis dalam 5 menit kerja
          </p>
        </div>
      )}

      {/* ── TAB: HARGA MODUL ── */}
      {activeTab === 'modul' && (
        <div className="space-y-4">
          {/* POS Gratis Banner */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 flex items-center gap-4 text-white">
            <div className="text-3xl">🧾</div>
            <div>
              <p className="font-black text-lg">POS Kasir — GRATIS Selamanya</p>
              <p className="text-emerald-100 text-xs font-medium">Transaksi, struk, shift kasir, riwayat — tanpa biaya modul. Hanya fee Rp 500/transaksi.</p>
            </div>
            <span className="ml-auto bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full uppercase">Free</span>
          </div>

          {/* Module Table by Category */}
          {(Object.entries(categories) as [string, { label: string; color: string }][]).map(([catKey, cat]) => {
            const mods = pricing.filter((p: any) => p.category === catKey);
            if (mods.length === 0) return null;
            return (
              <div key={catKey} className="bg-white rounded-[1.5rem] shadow-lg border border-slate-100 overflow-hidden">
                <div className={`px-5 py-3 bg-${cat.color}-50 border-b border-${cat.color}-100 flex items-center gap-2`}>
                  <span className={`text-[10px] font-black text-${cat.color}-600 uppercase tracking-widest`}>{cat.label}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                        <th className="text-left px-5 py-3">Modul</th>
                        <th className="text-center px-3 py-3">Harian</th>
                        <th className="text-center px-3 py-3">Mingguan (7hr)</th>
                        <th className="text-center px-3 py-3">Bulanan (30hr)</th>
                        <th className="text-center px-3 py-3">Tahunan (365hr)</th>
                        <th className="text-center px-3 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {mods.map((mod: any) => {
                        const isActive = subs[mod.id] && new Date(subs[mod.id].expireAt).getTime() > Date.now();
                        return (
                          <tr key={mod.id} className={`transition-colors ${isActive ? 'bg-amber-50' : 'hover:bg-slate-50'}`}>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{mod.icon}</span>
                                <div>
                                  <p className="font-black text-slate-800 text-sm">{mod.name}</p>
                                  {mod.fixed && <p className="text-[9px] text-orange-500 font-bold uppercase">Bulanan Saja</p>}
                                </div>
                              </div>
                            </td>
                            {mod.isPayPerUse ? (
                              <td colSpan={4} className="px-3 py-3 text-center">
                                <div className="inline-block bg-blue-50 border border-blue-200 rounded-xl px-4 py-2">
                                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Pay-Per-Use (Satu Kali)</p>
                                  <p className="font-black text-blue-800 text-sm">{mod.oneTimePrice} Koin / Pemakaian</p>
                                  <p className="text-[9px] text-blue-500 font-medium">{fmtRp((mod.oneTimePrice || 0) * 1000)}</p>
                                </div>
                              </td>
                            ) : (
                              <>
                                <td className="px-3 py-3 text-center">
                                  {mod.fixed ? <span className="text-slate-300 font-bold">—</span> : (
                                    <div>
                                      <p className="font-black text-slate-800 text-sm">{mod.daily} Koin</p>
                                      <p className="text-[9px] text-slate-400 font-medium">{fmtRp(mod.daily * 1000)}</p>
                                    </div>
                                  )}
                                </td>
                                <td className="px-3 py-3 text-center">
                                  {mod.fixed ? <span className="text-slate-300 font-bold">—</span> : (
                                    <div>
                                      <p className="font-black text-slate-800 text-sm">{mod.weekly} Koin</p>
                                      <p className="text-[9px] text-slate-400 font-medium">{fmtRp(mod.weekly * 1000)}</p>
                                    </div>
                                  )}
                                </td>
                                <td className="px-3 py-3 text-center">
                                  <div>
                                    <p className="font-black text-violet-700 text-sm">{mod.monthly} Koin</p>
                                    <p className="text-[9px] text-slate-400 font-medium">{fmtRp(mod.monthly * 1000)}</p>
                                  </div>
                                </td>
                                <td className="px-3 py-3 text-center">
                                  <div>
                                    <p className="font-black text-rose-700 text-sm">{mod.yearly} Koin</p>
                                    <p className="text-[9px] text-slate-400 font-medium">{fmtRp(mod.yearly * 1000)}</p>
                                  </div>
                                </td>
                              </>
                            )}
                            <td className="px-3 py-3 text-center">
                              {isActive
                                ? <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">✓ Aktif</span>
                                : <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Tidak Aktif</span>
                              }
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {/* Fee Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Biaya Platform (Terpisah dari Koin)</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-3 border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Fee Transaksi POS</p>
                <p className="text-xl font-black text-slate-900">Rp 500 <span className="text-xs font-bold text-slate-400">/ trx</span></p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Fee QR Order (Anti-Antri)</p>
                <p className="text-xl font-black text-slate-900">Rp 1.000 <span className="text-xs font-bold text-slate-400">/ trx</span></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
