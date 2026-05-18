import React, { useState } from 'react';
import {
  Edit, Plus, X,
  Coins, Download, Zap
} from 'lucide-react';

// ── Konfigurasi harga modul & paket koin (master data sistem) ─────

const MASTER_PRICING = [
  { id: 'inventory',      name: 'Inventori & Resep',                 category: 'operasional', daily: 3, weekly: 15, monthly: 49, yearly: 490, fixed: false },
  { id: 'purchase_order', name: 'Sistem PO & Supplier',              category: 'operasional', daily: 2, weekly: 10, monthly: 35, yearly: 350, fixed: false },
  { id: 'accounting',     name: 'Akuntansi & Kas',                   category: 'keuangan',    daily: 3, weekly: 15, monthly: 49, yearly: 490, fixed: false },
  { id: 'piutang',        name: 'Piutang Digital',                   category: 'keuangan',    daily: 2, weekly: 10, monthly: 35, yearly: 350, fixed: false },
  { id: 'customers',      name: 'Pelanggan (CRM)',                    category: 'pelanggan',   daily: 2, weekly: 10, monthly: 35, yearly: 350, fixed: false },
  { id: 'loyalty',        name: 'Loyalty Program',                   category: 'pelanggan',   daily: 2, weekly: 10, monthly: 35, yearly: 350, fixed: false },
  { id: 'anti_antri',     name: 'QR Order (Anti-Antri)',             category: 'fnb',         daily: 3, weekly: 15, monthly: 49, yearly: 490, fixed: false },
  { id: 'kitchen',        name: 'Kitchen Display (KDS)',             category: 'fnb',         daily: 0, weekly: 0,  monthly: 59, yearly: 590, fixed: true },
  { id: 'hrd',            name: 'HRD & Payroll',                     category: 'advanced',    daily: 4, weekly: 20, monthly: 69, yearly: 690, fixed: false },
  { id: 'audit',          name: 'Audit Log & Anti-Tilep',            category: 'advanced',    daily: 2, weekly: 10, monthly: 35, yearly: 350, fixed: false },
];

const COIN_TOPUP_PACKAGES = [
  { id: 'starter',   label: 'Starter',     coins: 55,  bonus: 5,   price: 50000,  badge: null },
  { id: 'umkm',      label: 'UMKM Juara',  coins: 115, bonus: 15,  price: 100000, badge: 'Paling Populer' },
  { id: 'ekspansi',  label: 'Ekspansi',    coins: 240, bonus: 40,  price: 200000, badge: 'Hemat 17%' },
  { id: 'probisnis', label: 'Pro Bisnis',  coins: 625, bonus: 125, price: 500000, badge: 'Hemat 20%' },
];

const PROMO_DATA: { id: number; kode: string; jenis: string; nilai: number; paket: string; dipakai: number; maks: number; expired: string; aktif: boolean }[] = [];

const TRX_DATA: { tgl: string; toko: string; paket: string; nominal: number; metode: string; status: string }[] = [];

const fmtRp = (n: number) => n === 0 ? 'Custom' : 'Rp ' + n.toLocaleString('id-ID');

type TabType = 'modul' | 'topup' | 'promo' | 'riwayat';

export default function PaketBilling() {
  const [tab, setTab] = useState<TabType>('modul');
  const [editModul, setEditModul] = useState<typeof MASTER_PRICING[0] | null>(null);
  const [editTopup, setEditTopup] = useState<typeof COIN_TOPUP_PACKAGES[0] | null>(null);
  const [showPromoForm, setShowPromoForm] = useState(false);

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Super Admin</p>
        <h1 className="text-2xl font-light text-slate-900">Manajemen Harga & Sistem Koin</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-8">
        <div className="flex gap-1 overflow-x-auto">
          {[
            { id: 'modul', label: 'Harga Modul Langganan' },
            { id: 'topup', label: 'Paket Top-Up Koin' },
            { id: 'promo', label: 'Kode Promo' },
            { id: 'riwayat', label: 'Riwayat Top-Up' }
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as TabType)}
              className={`px-5 py-3.5 text-xs font-black uppercase tracking-widest border-b-2 whitespace-nowrap transition-all ${
                tab === t.id ? 'border-[#1e6fbf] text-[#1e6fbf]' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* TAB 1: HARGA MODUL (SUBSCRIBE) */}
        {tab === 'modul' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">Skema Langganan Modul</h2>
                <p className="text-xs text-slate-500 mt-1">Atur harga koin yang dikenakan saat merchant berlangganan sebuah modul.</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2">
                <Zap className="w-4 h-4" /> 1 Koin = Rp 1.000
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-3">Nama Modul</th>
                    <th className="px-6 py-3">Kategori</th>
                    <th className="px-6 py-3 text-center">Harian</th>
                    <th className="px-6 py-3 text-center">Mingguan</th>
                    <th className="px-6 py-3 text-center">Bulanan</th>
                    <th className="px-6 py-3 text-center">Tahunan</th>
                    <th className="px-6 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MASTER_PRICING.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{m.name}</p>
                        {m.fixed && <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full mt-1 inline-block">Hanya Bulanan/Tahunan</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{m.category}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {m.fixed ? <span className="text-slate-300">—</span> : (
                          <div className="flex flex-col items-center">
                            <span className="font-black text-slate-800">{m.daily} <span className="text-amber-500 text-xs">Koin</span></span>
                            <span className="text-[10px] text-slate-400">~{fmtRp(m.daily * 1000)}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {m.fixed ? <span className="text-slate-300">—</span> : (
                          <div className="flex flex-col items-center">
                            <span className="font-black text-slate-800">{m.weekly} <span className="text-amber-500 text-xs">Koin</span></span>
                            <span className="text-[10px] text-slate-400">~{fmtRp(m.weekly * 1000)}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-black text-violet-700">{m.monthly} <span className="text-amber-500 text-xs">Koin</span></span>
                          <span className="text-[10px] text-slate-400">~{fmtRp(m.monthly * 1000)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-black text-rose-700">{m.yearly} <span className="text-amber-500 text-xs">Koin</span></span>
                          <span className="text-[10px] text-slate-400">~{fmtRp(m.yearly * 1000)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => setEditModul(m)}
                          className="flex items-center gap-1.5 text-[11px] font-black text-[#1e6fbf] uppercase hover:underline mx-auto">
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PAKET TOP-UP KOIN */}
        {tab === 'topup' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">Paket Top-Up Koin</h2>
                <p className="text-xs text-slate-500 mt-1">Paket koin yang dibeli oleh merchant menggunakan Rupiah asli.</p>
              </div>
              <button className="flex items-center gap-2 bg-[#1e6fbf] text-white text-xs font-black uppercase px-4 py-2 rounded-xl hover:bg-[#1a5fa8] transition-colors">
                <Plus className="w-4 h-4" /> Tambah Paket Top-Up
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-3">Nama Paket</th>
                    <th className="px-6 py-3">Koin Utama</th>
                    <th className="px-6 py-3">Koin Bonus</th>
                    <th className="px-6 py-3">Harga (Rp)</th>
                    <th className="px-6 py-3">Label (Badge)</th>
                    <th className="px-6 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {COIN_TOPUP_PACKAGES.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-900">{p.label}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                          <Coins className="w-4 h-4 text-amber-500" />
                          {p.coins.toLocaleString()} Koin
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {p.bonus > 0 ? (
                          <span className="text-emerald-600 font-bold text-sm bg-emerald-50 px-2 py-1 rounded-md">+{p.bonus.toLocaleString()} Koin</span>
                        ) : (
                          <span className="text-slate-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">{fmtRp(p.price)}</td>
                      <td className="px-6 py-4">
                        {p.badge ? (
                          <span className="bg-[#1e6fbf] text-white text-[10px] font-black px-2 py-1 rounded-md uppercase">{p.badge}</span>
                        ) : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => setEditTopup(p)}
                          className="flex items-center gap-1.5 text-[11px] font-black text-[#1e6fbf] uppercase hover:underline mx-auto">
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: KODE PROMO */}
        {tab === 'promo' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">Kode Promo Top-Up</h2>
              <button onClick={() => setShowPromoForm(!showPromoForm)}
                className="flex items-center gap-2 bg-[#1e6fbf] text-white text-xs font-black uppercase px-4 py-2 rounded-xl hover:bg-[#1a5fa8] transition-colors">
                <Plus className="w-4 h-4" /> Buat Kode Promo
              </button>
            </div>
            {/* Promo table... (unchanged) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-3">Kode</th>
                    <th className="px-6 py-3">Reward</th>
                    <th className="px-6 py-3">Paket Valid</th>
                    <th className="px-6 py-3 text-center">Dipakai</th>
                    <th className="px-6 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PROMO_DATA.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3.5 font-mono font-black text-slate-900">{p.kode}</td>
                      <td className="px-6 py-3.5 font-bold text-slate-700">
                        {p.jenis === 'persen_diskon' ? `Diskon ${p.nilai}%` : `+${p.nilai} Koin`}
                      </td>
                      <td className="px-6 py-3.5 text-slate-500 text-sm">{p.paket}</td>
                      <td className="px-6 py-3.5 text-center font-bold text-slate-700">{p.dipakai}</td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${p.aktif ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {p.aktif ? 'Aktif' : 'Kedaluwarsa'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: RIWAYAT TRX */}
        {tab === 'riwayat' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">Riwayat Pembelian Koin (Top-Up)</h2>
              <button className="flex items-center gap-2 border border-slate-200 text-slate-600 text-xs font-black uppercase px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-3">Tanggal</th>
                    <th className="px-6 py-3">Nama Toko</th>
                    <th className="px-6 py-3">Paket Dibeli</th>
                    <th className="px-6 py-3 text-right">Nominal Tagihan</th>
                    <th className="px-6 py-3">Metode Bayar</th>
                    <th className="px-6 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {TRX_DATA.map((t, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3.5 text-slate-500 text-sm font-mono">{t.tgl}</td>
                      <td className="px-6 py-3.5 font-bold text-slate-900 text-sm">{t.toko}</td>
                      <td className="px-6 py-3.5 text-slate-500 text-sm">{t.paket}</td>
                      <td className="px-6 py-3.5 text-right font-mono font-bold text-slate-900">{fmtRp(t.nominal)}</td>
                      <td className="px-6 py-3.5 text-slate-500 text-sm">{t.metode}</td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${t.status === 'Berhasil' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL EDIT HARGA MODUL */}
      {editModul && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Edit Skema Modul</h3>
                <p className="text-slate-500 text-sm">{editModul.name}</p>
              </div>
              <button onClick={() => setEditModul(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Harga Harian (Koin)', key: 'daily', disabled: editModul.fixed },
                { label: 'Harga Mingguan (Koin)', key: 'weekly', disabled: editModul.fixed },
                { label: 'Harga Bulanan (Koin)', key: 'monthly', disabled: false },
                { label: 'Harga Tahunan (Koin)', key: 'yearly', disabled: false },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{f.label}</label>
                  <input type="number" defaultValue={(editModul as any)[f.key]} disabled={f.disabled}
                    className={`w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1e6fbf] ${f.disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}`} />
                  {!f.disabled && (
                    <p className="text-[10px] text-amber-600 font-bold mt-1">~{fmtRp((editModul as any)[f.key] * 1000)}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setEditModul(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600">Batal</button>
              <button className="flex-1 py-2.5 bg-[#1e6fbf] hover:bg-[#1a5fa8] rounded-xl text-sm font-bold text-white transition-colors">
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT TOPUP */}
      {editTopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-slate-900 text-lg">Edit Paket Top-Up Koin</h3>
              <button onClick={() => setEditTopup(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Nama Paket', key: 'label', type: 'text' },
                { label: 'Koin Utama', key: 'coins', type: 'number' },
                { label: 'Koin Bonus', key: 'bonus', type: 'number' },
                { label: 'Harga Rupiah (Rp)', key: 'price', type: 'number' },
                { label: 'Label Promo (Opsional)', key: 'badge', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{f.label}</label>
                  <input type={f.type} defaultValue={(editTopup as any)[f.key] || ''}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1e6fbf]" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setEditTopup(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600">Batal</button>
              <button className="flex-1 py-2.5 bg-[#1e6fbf] hover:bg-[#1a5fa8] rounded-xl text-sm font-bold text-white transition-colors">
                Simpan Paket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
