import React, { useState } from 'react';
import { Users, TrendingUp, AlertTriangle, Search, Plus, BarChart3, Phone, UserMinus, Star, ShoppingBag, Clock } from 'lucide-react';

type Segment = 'LOYAL' | 'ACTIVE' | 'NEW' | 'AT_RISK' | 'CHURNED';
type Tab = 'PELANGGAN' | 'RFM' | 'CHURN';

interface Customer {
  id: string; name: string; phone: string;
  totalSpent: number; visitCount: number; lastVisit: number; // days ago
  segment: Segment; avgOrder: number;
}

const CUSTOMERS: Customer[] = [];

const SEG_STYLE: Record<Segment, { bg: string; text: string; dot: string }> = {
  LOYAL:   { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  ACTIVE:  { bg: 'bg-indigo-50',  text: 'text-indigo-700',  dot: 'bg-indigo-500' },
  NEW:     { bg: 'bg-slate-50',   text: 'text-slate-600',   dot: 'bg-slate-400' },
  AT_RISK: { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500' },
  CHURNED: { bg: 'bg-rose-50',    text: 'text-rose-700',    dot: 'bg-rose-500' },
};

const fmtRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

function rfmScore(c: Customer) {
  const R = c.lastVisit <= 7 ? 3 : c.lastVisit <= 30 ? 2 : 1;
  const F = c.visitCount >= 20 ? 3 : c.visitCount >= 5 ? 2 : 1;
  const M = c.totalSpent >= 1000000 ? 3 : c.totalSpent >= 300000 ? 2 : 1;
  return { R, F, M, total: R + F + M };
}

export default function CustomerPage() {
  const [tab, setTab] = useState<Tab>('PELANGGAN');
  const [search, setSearch] = useState('');
  const [segFilter, setSegFilter] = useState<Segment | 'SEMUA'>('SEMUA');

  const filtered = CUSTOMERS.filter(c =>
    (segFilter === 'SEMUA' || c.segment === segFilter) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))
  );

  const stats = {
    total: CUSTOMERS.length,
    loyal: CUSTOMERS.filter(c => c.segment === 'LOYAL').length,
    atRisk: CUSTOMERS.filter(c => c.segment === 'AT_RISK').length,
    churned: CUSTOMERS.filter(c => c.segment === 'CHURNED').length,
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
    <div className="max-w-[1400px] mx-auto p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-4 bg-white border border-indigo-100 rounded-2xl px-6 py-4 shadow-sm">
        <div>
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Customer Relationship</span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-1">CRM & Analisis Pelanggan</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Segmentasi RFM otomatis · Deteksi churn · Retensi pelanggan</p>
        </div>
        <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all">
          <Plus className="w-4 h-4" /> Tambah Pelanggan
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Pelanggan', value: stats.total, icon: <Users className="w-4 h-4" /> },
          { label: 'Pelanggan Loyal', value: stats.loyal, icon: <Star className="w-4 h-4" /> },
          { label: 'Perlu Perhatian', value: stats.atRisk, icon: <AlertTriangle className="w-4 h-4" /> },
          { label: 'Tidak Aktif', value: stats.churned, icon: <UserMinus className="w-4 h-4" /> },
        ].map(k => (
          <div key={k.label} className="bg-white border border-indigo-100 rounded-2xl p-5 hover:border-indigo-300 transition-all group">
            <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-500 mb-3 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-all">{k.icon}</div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{k.label}</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border border-indigo-200 rounded-xl overflow-hidden w-fit">
        {(['PELANGGAN', 'RFM', 'CHURN'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-[11px] font-black uppercase tracking-wide transition-colors ${tab === t ? 'bg-indigo-600 text-white' : 'text-indigo-400 hover:bg-indigo-50'}`}>
            {t === 'RFM' ? 'Analisis RFM' : t === 'CHURN' ? 'Deteksi Churn' : 'Database'}
          </button>
        ))}
      </div>

      {/* ── DATABASE ── */}
      {tab === 'PELANGGAN' && (
        <div className="bg-white border border-indigo-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-indigo-50 flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama atau HP..." className="input-field w-full pl-9 border-indigo-100 focus:border-indigo-400" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {(['SEMUA', 'LOYAL', 'ACTIVE', 'NEW', 'AT_RISK', 'CHURNED'] as const).map(s => (
                <button key={s} onClick={() => setSegFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all ${segFilter === s ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-400 border border-indigo-100 hover:border-indigo-300'}`}>
                  {s === 'AT_RISK' ? 'AT RISK' : s}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>{['Pelanggan', 'Segmen', 'Total Belanja', 'Kunjungan', 'Terakhir', 'Avg Order', 'Aksi'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(c => {
                  const s = SEG_STYLE[c.segment];
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black">{c.name[0]}</div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{c.name}</p>
                            <p className="text-xs text-slate-400">{c.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[9px] font-black uppercase ${s.bg} ${s.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{c.segment}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-800">{fmtRp(c.totalSpent)}</td>
                      <td className="px-5 py-4 font-bold text-slate-600">{c.visitCount}x</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-black ${c.lastVisit > 30 ? 'text-rose-500' : c.lastVisit > 14 ? 'text-amber-500' : 'text-emerald-600'}`}>
                          {c.lastVisit}h lalu
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-bold text-sm">{fmtRp(c.avgOrder)}</td>
                      <td className="px-5 py-4">
                        <button className="text-xs font-black text-primary hover:underline flex items-center gap-1">
                          <Phone className="w-3 h-3" /> Hubungi
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

      {/* ── RFM ANALYSIS ── */}
      {tab === 'RFM' && (
        <div className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
            <p className="font-black text-slate-800 mb-1">📊 Apa itu RFM?</p>
            <p className="text-sm text-slate-600 font-medium">
              <strong>R</strong>ecency (kapan terakhir beli) · <strong>F</strong>requency (seberapa sering) · <strong>M</strong>onetary (berapa banyak belanja)
              · Skor 1–3 per dimensi. Total 9 = Champion, &lt;4 = Perlu perhatian.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {CUSTOMERS.map(c => {
              const rfm = rfmScore(c);
              const s = SEG_STYLE[c.segment];
              return (
                <div key={c.id} className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <p className="font-black text-slate-800">{c.name}</p>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>{c.segment}</span>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black ${rfm.total >= 8 ? 'bg-emerald-100 text-emerald-700' : rfm.total >= 5 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                      {rfm.total}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Recency', score: rfm.R, sub: `${c.lastVisit}h lalu` },
                      { label: 'Frequency', score: rfm.F, sub: `${c.visitCount}x visit` },
                      { label: 'Monetary', score: rfm.M, sub: fmtRp(c.totalSpent) },
                    ].map(dim => (
                      <div key={dim.label} className="text-center bg-slate-50 rounded-xl p-3">
                        <p className="text-[8px] font-black text-slate-400 uppercase">{dim.label}</p>
                        <p className={`text-2xl font-black mt-1 ${dim.score === 3 ? 'text-emerald-600' : dim.score === 2 ? 'text-amber-600' : 'text-rose-500'}`}>{dim.score}</p>
                        <p className="text-[8px] text-slate-400 mt-0.5 truncate">{dim.sub}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mt-4">
                    {rfm.total >= 8 ? '🏆 Champion — Prioritas utama' : rfm.total >= 6 ? '✅ Loyal — Pertahankan' : rfm.total >= 4 ? '⚠️ At Risk — Butuh reaktivasi' : '❌ Perlu kampanye khusus'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CHURN DETECTION ── */}
      {tab === 'CHURN' && (
        <div className="space-y-6">
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex gap-4">
            <AlertTriangle className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-rose-800">Deteksi Churn Otomatis</p>
              <p className="text-sm text-rose-700 font-medium mt-0.5">
                Pelanggan yang tidak transaksi &gt;30 hari dianggap <strong>At Risk</strong>. &gt;60 hari = <strong>Churned</strong>. Segera hubungi mereka!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* At Risk */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-5 py-4 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-black text-amber-800 uppercase text-sm">At Risk ({CUSTOMERS.filter(c => c.segment === 'AT_RISK').length})</h3>
              </div>
              {CUSTOMERS.filter(c => c.segment === 'AT_RISK').map(c => (
                <div key={c.id} className="p-5 border-b border-slate-50 flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700 font-black">{c.name[0]}</div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{c.lastVisit} hari tidak transaksi · {fmtRp(c.totalSpent)}</p>
                  </div>
                  <button className="text-xs font-black text-amber-600 bg-amber-50 px-3 py-2 rounded-xl hover:bg-amber-500 hover:text-white transition-all flex items-center gap-1">
                    <Phone className="w-3 h-3" /> WA
                  </button>
                </div>
              ))}
            </div>

            {/* Churned */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-5 py-4 bg-rose-50 border-b border-rose-100 flex items-center gap-2">
                <UserMinus className="w-4 h-4 text-rose-500" />
                <h3 className="font-black text-rose-800 uppercase text-sm">Churned ({CUSTOMERS.filter(c => c.segment === 'CHURNED').length})</h3>
              </div>
              {CUSTOMERS.filter(c => c.segment === 'CHURNED').map(c => (
                <div key={c.id} className="p-5 border-b border-slate-50 flex items-center gap-4">
                  <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-700 font-black">{c.name[0]}</div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{c.lastVisit} hari tidak transaksi · {fmtRp(c.totalSpent)}</p>
                  </div>
                  <button className="text-xs font-black text-rose-600 bg-rose-50 px-3 py-2 rounded-xl hover:bg-rose-500 hover:text-white transition-all flex items-center gap-1">
                    <Phone className="w-3 h-3" /> WA
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="font-black text-slate-800 mb-4">💡 Rekomendasi Reaktivasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {[
                { label: 'Kirim Promo Diskon', desc: 'Berikan diskon 10% via WA untuk pelanggan At Risk yang sudah 14+ hari tidak balik.', color: 'bg-amber-50 border-amber-200' },
                { label: 'Pesan Personal', desc: 'Sebut nama pelanggan + produk favoritnya. Pendekatan personal meningkatkan response 3x.', color: 'bg-blue-50 border-blue-200' },
                { label: 'Free Item', desc: 'Tawarkan 1 menu gratis untuk kunjungan berikutnya. Biaya kecil, dampak besar.', color: 'bg-emerald-50 border-emerald-200' },
              ].map(r => (
                <div key={r.label} className={`${r.color} border rounded-2xl p-4`}>
                  <p className="font-black text-slate-800 mb-2">{r.label}</p>
                  <p className="text-slate-600 font-medium text-xs leading-relaxed">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
