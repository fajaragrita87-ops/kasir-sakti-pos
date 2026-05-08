import React, { useState, useEffect } from 'react';
import { Star, Gift, Zap, Users, TrendingUp, Phone, Search, Plus, Award, Crown, Shield, ChevronRight } from 'lucide-react';

type Tier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

interface LoyaltyMember {
  id: string; name: string; phone: string;
  points: number; totalSpent: number; visitCount: number;
  tier: Tier; joinDate: string; lastVisit: string;
}

const TIERS: Record<Tier, { label: string; min: number; max: number; color: string; bg: string; icon: React.ReactNode; perks: string[] }> = {
  BRONZE:   { label: 'Bronze', min: 0,    max: 999,   color: 'text-orange-700',  bg: 'bg-orange-100',  icon: <Shield className="w-5 h-5" />,  perks: ['Kumpulkan poin setiap transaksi', 'Diskon ulang tahun 10%'] },
  SILVER:   { label: 'Silver', min: 1000, max: 4999,  color: 'text-slate-600',   bg: 'bg-slate-100',   icon: <Star className="w-5 h-5" />,    perks: ['Semua benefit Bronze', 'Redeem poin 2x lebih cepat', 'Prioritas antrian'] },
  GOLD:     { label: 'Gold',   min: 5000, max: 14999, color: 'text-amber-600',   bg: 'bg-amber-100',   icon: <Award className="w-5 h-5" />,   perks: ['Semua benefit Silver', 'Free item tiap 10 kunjungan', 'Diskon 5% otomatis'] },
  PLATINUM: { label: 'Platinum', min: 15000, max: Infinity, color: 'text-purple-700', bg: 'bg-purple-100', icon: <Crown className="w-5 h-5" />, perks: ['Semua benefit Gold', 'Cashback 2% setiap transaksi', 'Undangan event eksklusif'] },
};

const getTier = (points: number): Tier => {
  if (points >= 15000) return 'PLATINUM';
  if (points >= 5000) return 'GOLD';
  if (points >= 1000) return 'SILVER';
  return 'BRONZE';
};

const MEMBERS: LoyaltyMember[] = [
  { id: '1', name: 'Budi Santoso', phone: '08123456789', points: 18500, totalSpent: 1850000, visitCount: 37, tier: 'PLATINUM', joinDate: '2025-10-01', lastVisit: '2026-05-07' },
  { id: '2', name: 'Maya Kusuma', phone: '08556677889', points: 12400, totalSpent: 1240000, visitCount: 28, tier: 'GOLD', joinDate: '2025-11-15', lastVisit: '2026-05-08' },
  { id: '3', name: 'Siti Aminah', phone: '08567890123', points: 4200, totalSpent: 420000, visitCount: 9, tier: 'SILVER', joinDate: '2026-01-20', lastVisit: '2026-05-05' },
  { id: '4', name: 'Andi Wijaya', phone: '08190123456', points: 250, totalSpent: 25000, visitCount: 1, tier: 'BRONZE', joinDate: '2026-05-05', lastVisit: '2026-05-05' },
  { id: '5', name: 'Rina Kartika', phone: '08778899001', points: 7800, totalSpent: 780000, visitCount: 16, tier: 'GOLD', joinDate: '2025-12-10', lastVisit: '2026-04-16' },
];

const REWARDS = [
  { id: '1', name: 'Diskon 10%',        points: 500,  icon: '🏷️', stock: 50 },
  { id: '2', name: 'Free Es Teh Manis', points: 1000, icon: '🧋', stock: 20 },
  { id: '3', name: 'Gratis Nasi Goreng',points: 2500, icon: '🍜', stock: 10 },
  { id: '4', name: 'Voucher Rp 50.000', points: 5000, icon: '🎟️', stock: 5 },
  { id: '5', name: 'Gratis 1 Paket',    points: 8000, icon: '🎁', stock: 3 },
];

type Tab = 'MEMBERS' | 'REWARDS' | 'TIERS' | 'SETTINGS';

const fmtRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

export default function LoyaltyPage() {
  const [tab, setTab] = useState<Tab>('MEMBERS');
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<Tier | 'SEMUA'>('SEMUA');
  const [addPoints, setAddPoints] = useState<Record<string, string>>({});
  const [members, setMembers] = useState(MEMBERS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', phone: '' });

  const filtered = members.filter(m =>
    (tierFilter === 'SEMUA' || m.tier === tierFilter) &&
    (m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search))
  );

  const stats = {
    total: members.length,
    active: members.filter(m => m.lastVisit >= '2026-04-08').length,
    totalPoints: members.reduce((a, m) => a + m.points, 0),
    platinum: members.filter(m => m.tier === 'PLATINUM').length,
  };

  const handleAddPoints = (id: string) => {
    const pts = parseInt(addPoints[id] || '0');
    if (!pts) return;
    setMembers(prev => prev.map(m => {
      if (m.id !== id) return m;
      const newPts = m.points + pts;
      return { ...m, points: newPts, tier: getTier(newPts) };
    }));
    setAddPoints(prev => ({ ...prev, [id]: '' }));
  };

  const handleAddMember = () => {
    if (!newMember.name || !newMember.phone) return;
    setMembers(prev => [...prev, {
      id: String(Date.now()), name: newMember.name, phone: newMember.phone,
      points: 0, totalSpent: 0, visitCount: 0, tier: 'BRONZE',
      joinDate: new Date().toISOString().split('T')[0],
      lastVisit: new Date().toISOString().split('T')[0],
    }]);
    setNewMember({ name: '', phone: '' });
    setShowAddModal(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-black text-slate-900 mb-6">Tambah Anggota</h3>
            <div className="space-y-4">
              <input value={newMember.name} onChange={e => setNewMember(p => ({ ...p, name: e.target.value }))}
                placeholder="Nama lengkap" className="input-field w-full" />
              <input value={newMember.phone} onChange={e => setNewMember(p => ({ ...p, phone: e.target.value }))}
                placeholder="Nomor HP (08xx)" className="input-field w-full" />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="py-3 rounded-2xl bg-slate-100 font-black text-slate-600 text-sm">Batal</button>
              <button onClick={handleAddMember} className="py-3 btn-primary text-sm">Daftarkan</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-[10px] font-black text-amber-700 uppercase tracking-widest mb-3">
            <Star className="w-3 h-3 fill-amber-500" /> Loyalty Program
          </div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Program Loyalitas</h1>
          <p className="text-slate-500 font-medium mt-1">Buat pelanggan terus kembali dengan sistem poin & reward.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary px-5 py-3 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Daftarkan Pelanggan
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Anggota', value: stats.total, icon: <Users className="w-5 h-5" />, color: 'text-primary bg-primary/10' },
          { label: 'Aktif 30 Hari', value: stats.active, icon: <TrendingUp className="w-5 h-5" />, color: 'text-emerald-600 bg-emerald-100' },
          { label: 'Total Poin Beredar', value: stats.totalPoints.toLocaleString(), icon: <Star className="w-5 h-5" />, color: 'text-amber-600 bg-amber-100' },
          { label: 'Member Platinum', value: stats.platinum, icon: <Crown className="w-5 h-5" />, color: 'text-purple-600 bg-purple-100' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl p-5 shadow-lg">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${k.color}`}>{k.icon}</div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{k.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['MEMBERS', 'REWARDS', 'TIERS', 'SETTINGS'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-3 rounded-2xl font-black text-sm uppercase transition-all ${tab === t ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 hover:bg-slate-100 shadow-sm'}`}>
            {t === 'MEMBERS' ? '👥 Anggota' : t === 'REWARDS' ? '🎁 Reward' : t === 'TIERS' ? '🏆 Tier' : '⚙️ Pengaturan'}
          </button>
        ))}
      </div>

      {/* ── MEMBERS TAB ── */}
      {tab === 'MEMBERS' && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-5 border-b border-slate-50 flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama atau nomor HP..." className="input-field w-full pl-9" />
            </div>
            <div className="flex gap-2">
              {(['SEMUA', 'PLATINUM', 'GOLD', 'SILVER', 'BRONZE'] as const).map(t => {
                const tier = t !== 'SEMUA' ? TIERS[t] : null;
                return (
                  <button key={t} onClick={() => setTierFilter(t)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${tierFilter === t ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500'}`}>
                    {t === 'SEMUA' ? 'Semua' : tier?.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>{['Member', 'Tier', 'Poin', 'Total Belanja', 'Kunjungan', 'Tambah Poin', 'Aksi'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(m => {
                  const tier = TIERS[m.tier];
                  const nextTier = m.tier === 'BRONZE' ? TIERS.SILVER : m.tier === 'SILVER' ? TIERS.GOLD : m.tier === 'GOLD' ? TIERS.PLATINUM : null;
                  const progress = nextTier ? Math.min(100, ((m.points - tier.min) / (tier.max - tier.min)) * 100) : 100;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-sm">{m.name[0]}</div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{m.name}</p>
                            <p className="text-xs text-slate-400">{m.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[9px] font-black uppercase ${tier.bg} ${tier.color}`}>
                            {tier.icon} {tier.label}
                          </span>
                          {nextTier && (
                            <div className="mt-2 w-24">
                              <div className="w-full bg-slate-100 h-1.5 rounded-full">
                                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${progress}%` }} />
                              </div>
                              <p className="text-[8px] text-slate-400 font-bold mt-0.5">{(tier.max + 1 - m.points).toLocaleString()} poin ke {nextTier.label}</p>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-black text-amber-600 text-lg">{m.points.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400 font-bold">poin</p>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-800">{fmtRp(m.totalSpent)}</td>
                      <td className="px-5 py-4 font-bold text-slate-600">{m.visitCount}x</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2 items-center">
                          <input type="number" value={addPoints[m.id] || ''}
                            onChange={e => setAddPoints(p => ({ ...p, [m.id]: e.target.value }))}
                            placeholder="100" className="w-20 px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:border-primary" />
                          <button onClick={() => handleAddPoints(m.id)} className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-black hover:bg-amber-600 transition-colors">
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <button className="flex items-center gap-1 text-xs font-black text-primary hover:underline">
                          Detail <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── REWARDS TAB ── */}
      {tab === 'REWARDS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {REWARDS.map(r => (
            <div key={r.id} className="bg-white rounded-2xl p-6 shadow-lg hover:-translate-y-1 transition-all">
              <div className="text-5xl mb-4">{r.icon}</div>
              <h3 className="font-black text-slate-900 text-lg mb-1">{r.name}</h3>
              <p className="text-xs text-slate-400 font-bold mb-4">Stok tersedia: {r.stock}</p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-black text-amber-600 text-lg">{r.points.toLocaleString()}</span>
                  <span className="text-xs text-slate-400 font-bold">poin</span>
                </div>
                <button className="px-4 py-2 bg-amber-500 text-white rounded-xl font-black text-xs uppercase hover:bg-amber-600 transition-colors flex items-center gap-1">
                  <Gift className="w-3 h-3" /> Redeem
                </button>
              </div>
            </div>
          ))}
          <button className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-all cursor-pointer">
            <Plus className="w-8 h-8 mb-2" />
            <p className="font-black text-sm uppercase">Tambah Reward</p>
          </button>
        </div>
      )}

      {/* ── TIERS TAB ── */}
      {tab === 'TIERS' && (
        <div className="space-y-5">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
            <p className="font-black text-slate-800 mb-1">📊 Sistem Poin</p>
            <p className="text-sm text-slate-600 font-medium">Setiap <strong>Rp 1.000</strong> transaksi = <strong>1 poin</strong>. Poin bisa diredeem untuk reward pilihan.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(Object.entries(TIERS) as [Tier, typeof TIERS[Tier]][]).map(([key, tier]) => (
              <div key={key} className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4 mb-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${tier.bg} ${tier.color}`}>{tier.icon}</div>
                  <div>
                    <h3 className="font-black text-slate-900 text-xl">{tier.label}</h3>
                    <p className="text-xs font-bold text-slate-400">
                      {tier.max === Infinity ? `${tier.min.toLocaleString()}+ poin` : `${tier.min.toLocaleString()} – ${tier.max.toLocaleString()} poin`}
                    </p>
                  </div>
                  <div className="ml-auto font-black text-2xl text-slate-200">
                    {members.filter(m => m.tier === key).length}
                    <span className="text-xs font-bold block text-slate-400">member</span>
                  </div>
                </div>
                <ul className="space-y-2">
                  {tier.perks.map(p => (
                    <li key={p} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                      <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${tier.color.replace('text-', 'bg-')}`} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SETTINGS TAB ── */}
      {tab === 'SETTINGS' && (
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-xl space-y-6">
          <h3 className="font-black text-slate-900 text-lg">Konfigurasi Program</h3>
          {[
            { label: 'Poin per Rp 1.000 transaksi', defaultVal: '1', type: 'number' },
            { label: 'Minimum poin untuk redeem', defaultVal: '500', type: 'number' },
            { label: 'Masa berlaku poin (hari)', defaultVal: '365', type: 'number' },
            { label: 'Bonus poin pendaftaran baru', defaultVal: '100', type: 'number' },
          ].map(s => (
            <div key={s.label}>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{s.label}</label>
              <input type={s.type} defaultValue={s.defaultVal} className="input-field w-full" />
            </div>
          ))}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
            <div>
              <p className="font-black text-slate-800 text-sm">Notifikasi WA ke anggota</p>
              <p className="text-xs text-slate-400 font-medium">Kirim poin update via WhatsApp</p>
            </div>
            <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
              <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow" />
            </div>
          </div>
          <button className="w-full btn-primary py-4">Simpan Konfigurasi</button>
        </div>
      )}
    </div>
  );
}
