import React, { useState, useEffect } from 'react';
import {
  Crown, Store, Zap, Settings, Shield,
  Bell, DollarSign, Database, RefreshCw, Trash2,
  AlertTriangle, BarChart3, Package, Check, Save, ChevronRight,
  UserPlus, Mail, Phone, CheckCheck, Eye, Clock
} from 'lucide-react';
import { MASTER_PRICING, STORAGE_KEY_PRICING } from '../../constants/pricing.constants';
import {
  getRegistrations, getUnreadCount, markAsRead, markAllAsRead,
  deleteRegistration, seedDemoRegistrations,
  type RegistrationRecord
} from '../../services/registrationNotifications';

type SATab = 'OVERVIEW' | 'MERCHANTS' | 'COIN_PRICING' | 'MODULE_CONTROL' | 'BILLING_REVENUE' | 'BROADCAST' | 'SYSTEM' | 'REGISTRATIONS';

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className={`rounded-3xl p-6 ${color} flex flex-col justify-between min-h-[130px]`}>
      <p className="text-[11px] font-black uppercase tracking-widest opacity-70">{label}</p>
      <div>
        <p className="text-3xl font-black">{value}</p>
        {sub && <p className="text-xs font-bold opacity-60 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function SCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[2rem] p-7 shadow-xl border border-slate-100 mb-6">
      <h3 className="font-black text-slate-900 uppercase tracking-tight text-base border-b border-slate-50 pb-4 mb-6">{title}</h3>
      {children}
    </div>
  );
}

function Toggle({ label, desc, defaultVal }: { label: string; desc?: string; defaultVal?: boolean }) {
  const [on, setOn] = useState(defaultVal ?? false);
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
      <div>
        <p className="font-bold text-slate-800 text-sm">{label}</p>
        {desc && <p className="text-xs text-slate-400 font-medium mt-0.5">{desc}</p>}
      </div>
      <button onClick={() => setOn(p => !p)} className={`w-14 h-7 rounded-full transition-all flex items-center px-1 ${on ? 'bg-violet-600' : 'bg-slate-200'}`}>
        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-7' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

// ── Tab: Registrasi Baru ──────────────────────────────────────
function RegistrationsTab({ onRead }: { onRead: () => void }) {
  const [list, setList] = useState<RegistrationRecord[]>([]);

  const refresh = () => setList(getRegistrations());

  useEffect(() => {
    seedDemoRegistrations();
    refresh();
  }, []);

  const handleRead = (id: string) => {
    markAsRead(id);
    refresh();
    onRead();
  };

  const handleReadAll = () => {
    markAllAsRead();
    refresh();
    onRead();
  };

  const handleDelete = (id: string) => {
    deleteRegistration(id);
    refresh();
    onRead();
  };

  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)} menit lalu`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} jam lalu`;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const unread = list.filter(r => !r.isRead).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black text-slate-900">Pendaftar Baru</h2>
          {unread > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
              {unread} belum dibaca
            </span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={handleReadAll}
            className="text-xs font-bold text-violet-600 hover:text-violet-800 flex items-center gap-1.5 transition-colors">
            <CheckCheck className="w-4 h-4" /> Tandai Semua Dibaca
          </button>
        )}
      </div>

      {/* Notif Channel Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
            <Phone className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">WhatsApp Notif</p>
            <p className="text-xl font-black text-emerald-700">{list.filter(r => r.notifWA).length} terkirim</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Email Konfirmasi</p>
            <p className="text-xl font-black text-blue-700">{list.filter(r => r.notifEmail).length} terkirim</p>
          </div>
        </div>
      </div>

      <SCard title="Inbox Pendaftar">
        {list.length === 0 ? (
          <div className="text-center py-12">
            <UserPlus className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-bold">Belum ada pendaftar baru</p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map(reg => (
              <div key={reg.id}
                className={`rounded-2xl p-4 border-2 transition-all ${
                  reg.isRead
                    ? 'bg-slate-50 border-slate-100'
                    : 'bg-violet-50 border-violet-200 shadow-md shadow-violet-100'
                }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      reg.isRead ? 'bg-slate-200' : 'bg-violet-600'
                    }`}>
                      <UserPlus className={`w-5 h-5 ${reg.isRead ? 'text-slate-500' : 'text-white'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-black text-slate-900 text-sm">{reg.name}</p>
                        {!reg.isRead && (
                          <span className="bg-violet-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Baru</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-bold mt-0.5">{reg.businessName}</p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                          <Phone className="w-3 h-3 text-emerald-500" />{reg.phone}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                          <Mail className="w-3 h-3 text-blue-500" />{reg.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {reg.notifWA && (
                          <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <Check className="w-2.5 h-2.5" /> WA Terkirim
                          </span>
                        )}
                        {reg.notifEmail && (
                          <span className="flex items-center gap-1 text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                            <Check className="w-2.5 h-2.5" /> Email Terkirim
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[9px] font-medium text-slate-400">
                          <Clock className="w-2.5 h-2.5" />{fmtTime(reg.registeredAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!reg.isRead && (
                      <button onClick={() => handleRead(reg.id)}
                        title="Tandai dibaca"
                        className="w-8 h-8 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center hover:bg-violet-200 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(reg.id)}
                      title="Hapus"
                      className="w-8 h-8 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SCard>
    </div>
  );
}

// ── Tab: Overview ─────────────────────────────────────────────
function OverviewTab({ regCount }: { regCount: number }) {
  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Merchant Aktif" value="248" sub="+12 bulan ini" color="bg-violet-600 text-white" />
        <StatCard label="Total Transaksi Hari Ini" value="4,821" sub="Semua tenant" color="bg-indigo-600 text-white" />
        <StatCard label="Revenue Platform" value="Rp 1,2M" sub="Fee Rp250/trx hari ini" color="bg-emerald-500 text-white" />
        <StatCard label="Pendaftar Baru" value={String(regCount)} sub="Menunggu verifikasi" color="bg-rose-500 text-white" />
      </div>

      <SCard title="Statistik Pertumbuhan Merchant">
        <div className="grid grid-cols-3 gap-4">
          {[['Jan', 180], ['Feb', 195], ['Mar', 210], ['Apr', 228], ['Mei', 248], ['Jun', '—']].map(([m, v]) => (
            <div key={String(m)} className="bg-slate-50 rounded-2xl p-4 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m}</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{v}</p>
            </div>
          ))}
        </div>
      </SCard>

      <SCard title="Merchant Mendekati Expired (7 hari)">
        {['Warung Pak Budi - Solo', 'Kafe Nusantara - Bandung', 'Toko Sejahtera - Medan'].map(m => (
          <div key={m} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center"><Store className="w-4 h-4" /></div>
              <span className="font-bold text-slate-800 text-sm">{m}</span>
            </div>
            <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">EXPIRED 3 HARI</span>
          </div>
        ))}
      </SCard>
    </div>
  );
}

// MASTER_PRICING is imported from ../../constants/pricing.constants
// This re-export is kept for backward compat during migration
export { MASTER_PRICING } from '../../constants/pricing.constants';


// ── Tab: Coin Pricing ─────────────────────────────────────────
function CoinPricingTab() {
  const [saved, setSaved] = useState(false);
  const [pricing, setPricing] = useState(() => {
    try {
      const stored = localStorage.getItem('sakti_pricing');
      if (stored) {
        const parsed = JSON.parse(stored);
        return MASTER_PRICING.map(def => {
          const found = parsed.find((p: any) => p.id === def.id);
          return found ? { ...def, ...found } : def;
        });
      }
    } catch {}
    return MASTER_PRICING;
  });

  const [topUpPackages, setTopUpPackages] = useState([
    { id: '1', label: 'Paket Hemat',      coins: 50,  price: 55000  },
    { id: '2', label: 'Paket UMKM Juara', coins: 150, price: 150000 },
    { id: '3', label: 'Paket Ekspansi',   coins: 500, price: 450000 },
  ]);

  const [feePerTrx, setFeePerTrx] = useState(250);
  const [trialDays, setTrialDays] = useState(14);

  const updateField = (id: string, field: 'daily'|'weekly'|'monthly'|'yearly'|'oneTimePrice', val: number) =>
    setPricing(p => p.map(m => m.id === id ? { ...m, [field]: val } : m));

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY_PRICING, JSON.stringify(pricing));
    // Also keep old key for backward compat
    localStorage.setItem('sakti_pricing', JSON.stringify(pricing));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const packages = [
    { key: 'DAILY', label: 'Harian', coins: 100, price: 5000, desc: 'Akses 1 hari penuh' },
    { key: 'WEEKLY', label: 'Mingguan', coins: 500, price: 20000, desc: 'Akses 7 hari' },
    { key: 'MONTHLY', label: 'Bulanan', coins: 2000, price: 75000, desc: 'Akses 30 hari, paling hemat' },
  ];

  return (
    <div>
      <div className="mb-6 bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm font-bold text-amber-800">Harga koin berdampak langsung ke seluruh merchant. Perubahan berlaku setelah disimpan dan akan diterapkan pada pembelian berikutnya.</p>
      </div>

      <SCard title="Paket Harga Koin (Top-Up)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {packages.map(pkg => (
            <div key={pkg.key} className="border-2 border-violet-100 rounded-3xl p-6 bg-violet-50/30">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest bg-violet-100 px-3 py-1 rounded-full">{pkg.label}</span>
                <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              </div>
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-medium">{pkg.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h4 className="font-black text-slate-800 mb-4 text-sm uppercase tracking-wide">Paket Top-Up Koin (yang dilihat merchant di /billing)</h4>
          <div className="space-y-3">
            {topUpPackages.map((pkg, i) => (
              <div key={pkg.id} className="flex items-center gap-4 p-4 border-2 border-slate-100 rounded-2xl">
                <span className="text-xs font-black text-slate-400 w-6">{i+1}</span>
                <div className="flex-1">
                  <input type="text" value={pkg.label}
                    onChange={e => setTopUpPackages(p => p.map(x => x.id===pkg.id ? {...x, label: e.target.value} : x))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-700 focus:border-violet-500 focus:outline-none" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" value={pkg.coins}
                    onChange={e => setTopUpPackages(p => p.map(x => x.id===pkg.id ? {...x, coins: Number(e.target.value)} : x))}
                    className="w-20 border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-black text-center focus:border-violet-500 focus:outline-none" />
                  <span className="text-xs font-bold text-amber-500">Koin</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">Rp</span>
                  <input type="number" value={pkg.price}
                    onChange={e => setTopUpPackages(p => p.map(x => x.id===pkg.id ? {...x, price: Number(e.target.value)} : x))}
                    className="w-28 border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-black text-center focus:border-violet-500 focus:outline-none" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </SCard>

      <SCard title="Biaya Modul per Fitur — 11 Modul Berbayar (Sinkron dengan Paywall)">
        <p className="text-sm text-slate-500 font-medium mb-5">Harga di sini <strong>langsung mempengaruhi Paywall</strong> yang dilihat merchant saat membuka fitur terkunci.</p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100">
                <th className="text-left pb-3 pr-4">Nama Modul</th>
                <th className="text-center pb-3 px-3">Harian (1 Hr)</th>
                <th className="text-center pb-3 px-3">Mingguan (7 Hr)</th>
                <th className="text-center pb-3 px-3">Bulanan (30 Hr)</th>
                <th className="text-center pb-3 px-3">Tahunan (365 Hr)</th>
                <th className="text-center pb-3">Tipe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pricing.map(m => (
                <tr key={m.id} className="hover:bg-violet-50/30 transition-colors">
                  <td className="py-3 pr-4 font-bold text-slate-800 text-sm">{m.name}</td>
                  {m.isPayPerUse ? (
                    <td colSpan={4} className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                          Bayar Per Pakai (Satu Kali)
                        </span>
                        <div className="flex items-center gap-1">
                          <input type="number" value={m.oneTimePrice ?? 0}
                            onChange={e => updateField(m.id, 'oneTimePrice', parseInt(e.target.value)||0)}
                            className="w-16 border-2 border-slate-200 rounded-lg px-2 py-1.5 font-black text-center text-sm focus:border-violet-500 focus:outline-none" />
                          <span className="text-[10px] font-bold text-amber-500">Koin</span>
                        </div>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1">
                          <input type="number" disabled={m.fixed} value={m.daily}
                            onChange={e => updateField(m.id, 'daily', parseInt(e.target.value)||0)}
                            className="w-16 border-2 border-slate-200 rounded-lg px-2 py-1.5 font-black text-center text-sm focus:border-violet-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400" />
                          <span className="text-[10px] font-bold text-amber-500">Koin</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1">
                          <input type="number" disabled={m.fixed} value={m.weekly}
                            onChange={e => updateField(m.id, 'weekly', parseInt(e.target.value)||0)}
                            className="w-16 border-2 border-slate-200 rounded-lg px-2 py-1.5 font-black text-center text-sm focus:border-violet-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400" />
                          <span className="text-[10px] font-bold text-amber-500">Koin</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1">
                          <input type="number" value={m.monthly}
                            onChange={e => updateField(m.id, 'monthly', parseInt(e.target.value)||0)}
                            className="w-16 border-2 border-slate-200 rounded-lg px-2 py-1.5 font-black text-center text-sm focus:border-violet-500 focus:outline-none" />
                          <span className="text-[10px] font-bold text-amber-500">Koin</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1">
                          <input type="number" value={m.yearly}
                            onChange={e => updateField(m.id, 'yearly', parseInt(e.target.value)||0)}
                            className="w-16 border-2 border-slate-200 rounded-lg px-2 py-1.5 font-black text-center text-sm focus:border-violet-500 focus:outline-none" />
                          <span className="text-[10px] font-bold text-amber-500">Koin</span>
                        </div>
                      </td>
                    </>
                  )}
                  <td className="py-3 text-center">
                    {m.isPayPerUse
                      ? <span className="text-[9px] font-black uppercase bg-blue-100 text-blue-600 px-2 py-1 rounded-full">Per Pemakaian</span>
                      : m.fixed
                        ? <span className="text-[9px] font-black uppercase bg-orange-100 text-orange-600 px-2 py-1 rounded-full">Bulanan Saja</span>
                        : <span className="text-[9px] font-black uppercase bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">Semua Paket</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-medium text-indigo-700">
          <strong>Catatan:</strong> Kitchen Display (KDS) hanya bisa diakses paket Bulanan. Modul lain tersedia Harian, Mingguan & Bulanan.
        </div>
      </SCard>

      <SCard title="Konfigurasi Platform">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fee Transaksi Platform (Rp/trx)</label>
            <input type="number" value={feePerTrx} onChange={e => setFeePerTrx(Number(e.target.value))}
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 font-black text-slate-800 focus:border-violet-500 focus:outline-none" />
            <p className="text-xs text-slate-400 font-medium mt-1">Biaya yang diambil dari setiap transaksi merchant</p>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Durasi Free Trial (hari)</label>
            <input type="number" value={trialDays} onChange={e => setTrialDays(Number(e.target.value))}
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 font-black text-slate-800 focus:border-violet-500 focus:outline-none" />
          </div>
        </div>
        <Toggle label="Aktifkan Promo Global (Diskon 50% Semua Paket)" desc="Terapkan harga promosi ke seluruh merchant" />
        <Toggle label="Free Trial Mode Aktif" desc="Bypass seluruh Paywall untuk pengguna baru" defaultVal={true} />
      </SCard>

      <button onClick={handleSave}
        className={`px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-violet-600 text-white hover:bg-violet-700 shadow-xl shadow-violet-600/20'}`}
      >
        {saved ? <><Check className="w-4 h-4" /> Semua Harga Tersimpan!</> : <><Save className="w-4 h-4" /> Simpan Semua Konfigurasi Harga</>}
      </button>
    </div>
  );
}


// ── Tab: Merchant Management ──────────────────────────────────
function MerchantsTab() {
  const merchants = [
    { name: 'Warung Pak Budi', owner: 'Budi Santoso', plan: 'Pro', status: 'AKTIF', trx: 182 },
    { name: 'Kafe Nusantara', owner: 'Rina Dewi', plan: 'Starter', status: 'TRIAL', trx: 45 },
    { name: 'Toko Sejahtera', owner: 'Ahmad F.', plan: 'Enterprise', status: 'AKTIF', trx: 521 },
    { name: 'Bakso Mas Eko', owner: 'Eko Prasetyo', plan: 'Starter', status: 'EXPIRED', trx: 0 },
  ];

  return (
    <SCard title="Daftar Semua Merchant">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <th className="text-left pb-3">Merchant</th>
              <th className="text-left pb-3">Owner</th>
              <th className="text-left pb-3">Plan</th>
              <th className="text-left pb-3">Trx Hari Ini</th>
              <th className="text-left pb-3">Status</th>
              <th className="text-left pb-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {merchants.map(m => (
              <tr key={m.name} className="border-b border-slate-50 last:border-0">
                <td className="py-4 font-bold text-slate-800">{m.name}</td>
                <td className="py-4 text-sm text-slate-500 font-medium">{m.owner}</td>
                <td className="py-4">
                  <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">{m.plan}</span>
                </td>
                <td className="py-4 font-black text-slate-700">{m.trx.toLocaleString()}</td>
                <td className="py-4">
                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                    m.status === 'AKTIF' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    m.status === 'TRIAL' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    'bg-red-50 text-red-500 border-red-100'
                  }`}>{m.status}</span>
                </td>
                <td className="py-4">
                  <div className="flex gap-2">
                    <button className="text-xs font-bold text-violet-600 hover:underline">Detail</button>
                    <button className="text-xs font-bold text-rose-500 hover:underline">Suspend</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SCard>
  );
}

// ── Tab: Module Control ───────────────────────────────────────
function ModuleControlTab() {
  const modules = [
    'HRD & Payroll', 'KDS (Kitchen Display)', 'Loyalty Program',
    'Anti-Antri / QR Order', 'Inventori Advanced', 'CRM Pelanggan',
    'Akuntansi & Kas', 'Piutang Digital', 'Integrasi E-Commerce',
    'Smart Migration', 'AI Menu Maker', 'Billing & Koin'
  ];

  return (
    <SCard title="Kontrol Modul Global (Per Merchant)">
      <p className="text-sm text-slate-500 font-medium mb-6">Toggle modul akan diterapkan ke merchant yang dipilih. Gunakan ini untuk meng-upgrade / downgrade plan secara manual.</p>
      <div className="mb-5 flex gap-3">
        <select className="border-2 border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-700 focus:border-violet-500 focus:outline-none flex-1">
          <option>Pilih Merchant...</option>
          <option>Warung Pak Budi</option>
          <option>Kafe Nusantara</option>
          <option>Toko Sejahtera</option>
        </select>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {modules.map((m, i) => (
          <Toggle key={m} label={m} defaultVal={i % 3 !== 2} />
        ))}
      </div>
    </SCard>
  );
}

// ── Tab: Broadcast ────────────────────────────────────────────
function BroadcastTab() {
  return (
    <SCard title="Kirim Broadcast ke Merchant">
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Penerima</label>
          <select className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-violet-500 focus:outline-none">
            <option>Semua Merchant Aktif</option>
            <option>Merchant Trial Saja</option>
            <option>Merchant Expired</option>
            <option>Merchant Tertentu</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Judul Pengumuman</label>
          <input type="text" placeholder="Contoh: Update Sistem v2.5 — Fitur Baru!" className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-violet-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Isi Pesan</label>
          <textarea rows={5} placeholder="Tulis pesan broadcast di sini..." className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-violet-500 focus:outline-none resize-none" />
        </div>
        <div className="flex gap-3">
          <Toggle label="Kirim via In-App Notifikasi" defaultVal={true} />
          <Toggle label="Kirim via Email" />
          <Toggle label="Kirim via WhatsApp" />
        </div>
        <button className="bg-violet-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-sm flex items-center gap-2 hover:bg-violet-700 transition-colors shadow-lg shadow-violet-600/20">
          <Bell className="w-4 h-4" /> Kirim Broadcast
        </button>
      </div>
    </SCard>
  );
}

// ── Tab: System ───────────────────────────────────────────────
function SystemTab() {
  return (
    <div>
      <SCard title="Kontrol Sistem & Infrastruktur">
        <Toggle label="Maintenance Mode" desc="Matikan akses seluruh merchant (kecuali Super Admin)" />
        <Toggle label="Aktifkan Debug Logging" desc="Catat semua API request ke console" defaultVal={true} />
        <div className="mt-6 space-y-3">
          <button className="w-full bg-slate-900 text-white px-6 py-4 rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-3 hover:bg-slate-800 transition-colors shadow-xl">
            <RefreshCw className="w-5 h-5" /> Force Sync Database
          </button>
          <button className="w-full bg-amber-50 text-amber-600 border border-amber-200 px-6 py-4 rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-3 hover:bg-amber-100 transition-colors">
            <Database className="w-5 h-5" /> Backup Seluruh Database (.SQL)
          </button>
        </div>
      </SCard>

      <SCard title="Danger Zone">
        <div className="border-2 border-red-400 rounded-3xl p-6 bg-red-50">
          <h4 className="font-black text-red-700 uppercase tracking-tight text-lg mb-2">Peringatan Keras</h4>
          <p className="text-sm text-red-600 font-medium mb-6">Tindakan destruktif — tidak dapat dikembalikan (No Undo).</p>
          <button className="w-full bg-red-600 text-white px-6 py-4 rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-3 hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30">
            <Trash2 className="w-5 h-5" /> Reset Factory (Hapus Semua Data Transaksi)
          </button>
        </div>
      </SCard>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState<SATab>('OVERVIEW');
  const [unreadRegs, setUnreadRegs] = useState(0);
  const [totalRegs, setTotalRegs] = useState(0);

  const refreshBadge = () => {
    setUnreadRegs(getUnreadCount());
    setTotalRegs(getRegistrations().length);
  };

  useEffect(() => {
    seedDemoRegistrations();
    refreshBadge();
    // Poll every 5s for new registrations
    const interval = setInterval(refreshBadge, 5000);
    return () => clearInterval(interval);
  }, []);

  const tabs: { key: SATab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'OVERVIEW', label: 'Command Center', icon: <BarChart3 className="w-5 h-5" /> },
    { key: 'REGISTRATIONS', label: 'Registrasi Baru', icon: <UserPlus className="w-5 h-5" />, badge: unreadRegs },
    { key: 'MERCHANTS', label: 'Kelola Merchant', icon: <Store className="w-5 h-5" /> },
    { key: 'COIN_PRICING', label: 'Harga Koin', icon: <Zap className="w-5 h-5" /> },
    { key: 'MODULE_CONTROL', label: 'Kontrol Modul', icon: <Package className="w-5 h-5" /> },
    { key: 'BILLING_REVENUE', label: 'Revenue Platform', icon: <DollarSign className="w-5 h-5" /> },
    { key: 'BROADCAST', label: 'Broadcast', icon: <Bell className="w-5 h-5" /> },
    { key: 'SYSTEM', label: 'Sistem & Infrastruktur', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl shadow-violet-600/30">
            <Crown className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">Super Admin Dashboard</h1>
            <p className="text-slate-500 font-medium mt-0.5">Kontrol penuh platform Vistral POS — hanya bisa diakses oleh Super Admin.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-2xl px-5 py-3 mt-4 w-fit">
          <Shield className="w-4 h-4 text-rose-500" />
          <p className="text-xs font-black text-rose-700 uppercase tracking-wider">Area Terproteksi — Akses Tidak Sah Dicatat</p>
        </div>
      </header>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-sm transition-all ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl shadow-violet-500/20'
                  : 'text-slate-500 hover:bg-white hover:shadow-lg'
              }`}
            >
              {tab.icon}
              <span className="flex-1 text-left">{tab.label}</span>
              {tab.badge ? (
                <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {tab.badge}
                </span>
              ) : activeTab === tab.key ? (
                <ChevronRight className="w-4 h-4" />
              ) : null}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'OVERVIEW' && <OverviewTab regCount={totalRegs} />}
          {activeTab === 'REGISTRATIONS' && <RegistrationsTab onRead={refreshBadge} />}
          {activeTab === 'MERCHANTS' && <MerchantsTab />}
          {activeTab === 'COIN_PRICING' && <CoinPricingTab />}
          {activeTab === 'MODULE_CONTROL' && <ModuleControlTab />}
          {activeTab === 'BILLING_REVENUE' && (
            <SCard title="Revenue Platform">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-center">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Revenue Hari Ini</p>
                  <p className="text-3xl font-black text-emerald-700 mt-2">Rp 1,2M</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Revenue Bulan Ini</p>
                  <p className="text-3xl font-black text-blue-700 mt-2">Rp 38,5M</p>
                </div>
                <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5 text-center">
                  <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest">Total Transaksi</p>
                  <p className="text-3xl font-black text-violet-700 mt-2">154.284</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 font-medium">Laporan lengkap akan tersedia setelah integrasi backend.</p>
            </SCard>
          )}
          {activeTab === 'BROADCAST' && <BroadcastTab />}
          {activeTab === 'SYSTEM' && <SystemTab />}
        </div>
      </div>
    </div>
  );
}
