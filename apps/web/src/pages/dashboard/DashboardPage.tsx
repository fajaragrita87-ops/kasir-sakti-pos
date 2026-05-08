import React, { useState } from 'react';
import {
  TrendingUp, Users, ShoppingBag, DollarSign,
  ArrowUpRight, ArrowDownRight, Package, Zap,
  Trophy, Star, Target, Send, MessageCircle,
  BarChart3, ChevronRight, Award, Flame
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { Link } from 'react-router-dom';

const SALES_DATA = [
  { day: 'Sen', sales: 450000, tx: 18 },
  { day: 'Sel', sales: 620000, tx: 24 },
  { day: 'Rab', sales: 580000, tx: 22 },
  { day: 'Kam', sales: 980000, tx: 38 },
  { day: 'Jum', sales: 1200000, tx: 46 },
  { day: 'Sab', sales: 1500000, tx: 58 },
  { day: 'Min', sales: 1400000, tx: 54 },
];

const maxSales = Math.max(...SALES_DATA.map(d => d.sales));

const TOP_PRODUCTS = [
  { name: 'Nasi Goreng Spesial', count: 145, pct: 95 },
  { name: 'Kopi Susu Aren', count: 98, pct: 68 },
  { name: 'Es Teh Manis', count: 86, pct: 59 },
  { name: 'Mie Ayam Bakso', count: 72, pct: 50 },
];

const BADGES = [
  { icon: <Flame className="w-6 h-6" />, name: 'Streak 7 Hari', desc: 'Transaksi setiap hari!', earned: true, color: 'bg-orange-100 text-orange-500' },
  { icon: <Trophy className="w-6 h-6" />, name: 'Omzet 10 Juta', desc: 'Total kumulatif', earned: true, color: 'bg-amber-100 text-amber-500' },
  { icon: <Star className="w-6 h-6" />, name: 'Kasir Teladan', desc: 'Rating 5.0 dari pelanggan', earned: false, color: 'bg-slate-100 text-slate-400' },
  { icon: <Target className="w-6 h-6" />, name: 'Target Bulan Ini', desc: '85% tercapai', earned: false, color: 'bg-slate-100 text-slate-400' },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [sendingWA, setSendingWA] = useState(false);
  const [waSent, setWaSent] = useState(false);

  const handleSendWA = () => {
    setSendingWA(true);
    setTimeout(() => {
      setSendingWA(false);
      setWaSent(true);
      setTimeout(() => setWaSent(false), 3000);
    }, 1500);
  };

  const fmt = (n: number) => `Rp ${(n / 1000000).toFixed(1)}M`;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Selamat datang kembali 👋</p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{user?.name ?? 'Merchant Sakti'}</h1>
        </div>
        {/* WhatsApp Report Button (SKPL 4.3) */}
        <button
          onClick={handleSendWA}
          disabled={sendingWA || waSent}
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all ${
            waSent ? 'bg-emerald-500 text-white' :
            sendingWA ? 'bg-slate-200 text-slate-400' :
            'bg-[#25D366] text-white hover:scale-105'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          {waSent ? 'Laporan Terkirim!' : sendingWA ? 'Mengirim...' : 'Kirim Laporan via WA'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Omzet Hari Ini', value: 'Rp 1.4M', trend: '+12.5%', positive: true, icon: <DollarSign className="w-5 h-5" />, color: 'bg-primary/10 text-primary' },
          { title: 'Total Transaksi', value: '54', trend: '+8 dari kemarin', positive: true, icon: <ShoppingBag className="w-5 h-5" />, color: 'bg-emerald-100 text-emerald-600' },
          { title: 'Pelanggan Baru', value: '7', trend: '-2 dari kemarin', positive: false, icon: <Users className="w-5 h-5" />, color: 'bg-amber-100 text-amber-600' },
          { title: 'Avg. Order', value: 'Rp 25rb', trend: '+3.1%', positive: true, icon: <TrendingUp className="w-5 h-5" />, color: 'bg-purple-100 text-purple-600' },
        ].map(k => (
          <div key={k.title} className="bg-white rounded-2xl p-5 shadow-lg border-0 hover:-translate-y-1 transition-transform cursor-default">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 ${k.color} rounded-xl flex items-center justify-center`}>{k.icon}</div>
              <div className={`flex items-center gap-0.5 text-[10px] font-bold ${k.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {k.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {k.trend}
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{k.title}</p>
            <h3 className="text-2xl font-black text-slate-900">{k.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart (Pure CSS — no recharts) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-slate-800 uppercase tracking-tight">Tren Penjualan 7 Hari</h3>
            <div className="flex gap-2">
              {['Minggu Ini', 'Bulan Ini'].map((opt, i) => (
                <button key={opt} className={`px-3 py-1 rounded-lg text-xs font-bold ${i === 0 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>{opt}</button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-2 h-48">
            {SALES_DATA.map(d => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[9px] font-bold text-slate-400">{fmt(d.sales)}</span>
                <div className="w-full relative group cursor-pointer">
                  <div
                    className="w-full bg-primary/20 hover:bg-primary rounded-xl transition-all"
                    style={{ height: `${(d.sales / maxSales) * 160}px` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {d.tx} transaksi
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-black text-slate-400">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-black text-slate-800 uppercase tracking-tight mb-6">Produk Terlaris</h3>
          <div className="space-y-5">
            {TOP_PRODUCTS.map((p, i) => (
              <div key={p.name}>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${i === 0 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'}`}>{i + 1}</span>
                    <p className="text-sm font-bold text-slate-700 truncate max-w-[140px]">{p.name}</p>
                  </div>
                  <span className="text-xs font-black text-slate-600">{p.count}x</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${p.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <Link to="/audit" className="w-full mt-6 py-3 rounded-xl border-2 border-primary/20 text-xs font-black text-primary hover:bg-primary/5 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
            <BarChart3 className="w-4 h-4" /> Laporan Lengkap
          </Link>
        </div>
      </div>

      {/* Gamification Badges (SKPL 7.2) */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Achievement & Gamifikasi
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Kumpulkan badge untuk mendapatkan bonus koin!</p>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-black text-amber-600 text-sm">{user?.coins?.toLocaleString() ?? '9,999'} Koin</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BADGES.map(b => (
            <div key={b.name} className={`rounded-2xl p-4 border-2 transition-all ${b.earned ? 'border-amber-200 bg-amber-50' : 'border-slate-100 opacity-50'}`}>
              <div className={`w-12 h-12 ${b.color} rounded-2xl flex items-center justify-center mb-3`}>{b.icon}</div>
              <p className="font-black text-slate-800 text-sm">{b.name}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">{b.desc}</p>
              {b.earned && <span className="mt-2 inline-block text-[9px] font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full uppercase">Earned ✓</span>}
            </div>
          ))}
        </div>

        {/* Streak indicator */}
        <div className="mt-6 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-5 flex items-center gap-5 text-white">
          <div className="flex -space-x-1">
            {[1,2,3,4,5,6,7].map(d => (
              <div key={d} className="w-8 h-8 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-[9px] font-black">{d}</div>
            ))}
          </div>
          <div>
            <p className="font-black text-lg">🔥 Streak 7 Hari!</p>
            <p className="text-white/80 text-xs font-medium">Pertahankan untuk bonus +10 Koin minggu depan</p>
          </div>
          <div className="ml-auto text-right">
            <p className="font-black text-2xl">+10</p>
            <p className="text-[10px] font-bold uppercase opacity-80">Koin Bonus</p>
          </div>
        </div>
      </div>
    </div>
  );
}
