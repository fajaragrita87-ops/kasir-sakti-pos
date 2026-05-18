import React, { useState } from 'react';
import {
  TrendingUp, Users, ShoppingBag, DollarSign, ArrowUpRight, ArrowDownRight,
  Package, Zap, MessageCircle, BarChart3, AlertTriangle, Wallet, QrCode,
  Check, X, ArrowRight, Cpu, RefreshCw, FileText, Layers, ShieldCheck,
  Building, Globe, Server, Database, LineChart, Plus
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { useProductStore } from '../../stores/product.store';
import { useTransactionStore } from '../../stores/transaction.store';
import { Link } from 'react-router-dom';

const fmtRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');
const fmtM  = (n: number) => n >= 1_000_000 ? (n / 1_000_000).toFixed(2) + ' Jt' : fmtRp(n);

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { products } = useProductStore();
  const { transactions } = useTransactionStore();
  const [sendingWA, setSendingWA] = useState(false);
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' }).toUpperCase();

  const handleReportExport = () => {
    setSendingWA(true);
    setTimeout(() => setSendingWA(false), 1500);
  };

  // ── Kalkulasi data real dari stores ──
  const totalRevenue = transactions.reduce((a, t) => a + t.total, 0);
  const totalTransactions = transactions.length;
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock < 5 && p.stock > 0);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  // Top items dari transaksi
  const itemSales: Record<string, { name: string; qty: number; vol: number }> = {};
  transactions.forEach(t => {
    t.items.forEach(item => {
      if (!itemSales[item.id]) itemSales[item.id] = { name: item.name, qty: 0, vol: 0 };
      itemSales[item.id].qty += item.quantity;
      itemSales[item.id].vol += item.price * item.quantity;
    });
  });
  const topItems = Object.values(itemSales).sort((a, b) => b.vol - a.vol).slice(0, 5);

  // Revenue per hari (7 hari terakhir)
  const DAYS = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { day: DAYS[d.getDay()], rev: 0, trx: 0 };
  });
  // Populate from transactions (basic — date matching via time string)
  const maxRev = Math.max(...weeklyData.map(d => d.rev), 1);

  const isEmpty = totalTransactions === 0 && totalProducts === 0;

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-slate-800 font-sans">
      <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">

        {/* ── ERP COMMAND HEADER ── */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 border-b border-slate-300 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Building className="w-4 h-4 text-slate-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sistem Kasir Pintar</span>
            </div>
            <h1 className="text-3xl font-light text-slate-900 tracking-tight">Ringkasan Bisnis</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">ID Toko: {user?.id?.slice(0,8).toUpperCase() ?? 'V-9028A'} | Tanggal: {dateStr}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-300 px-4 py-2 flex items-center gap-4 text-sm shadow-sm">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Sisa Koin</span>
                <span className="font-bold text-slate-800">{user?.coins?.toLocaleString() ?? '0'} Koin</span>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Status Sistem</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Lancar</span>
              </div>
            </div>
            <button onClick={handleReportExport} disabled={sendingWA}
              className="bg-indigo-600 text-white border border-transparent px-5 py-2.5 font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all rounded-xl shadow-sm shadow-indigo-200 flex items-center gap-2">
              <FileText className="w-4 h-4" /> {sendingWA ? 'Mencetak...' : 'Cetak PDF'}
            </button>
          </div>
        </div>

        {/* ── KPI TILES — Data Real ── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label:'Pendapatan Hari Ini', value: fmtRp(totalRevenue), sub: `${totalTransactions} Transaksi`, delta: totalTransactions > 0 ? `${totalTransactions} trx` : '—', up: totalRevenue > 0, color:'border-blue-500' },
            { label:'Total Produk (SKU)', value: String(totalProducts), sub: `${products.filter(p=>p.isActive).length} Aktif`, delta: totalProducts > 0 ? 'Terdaftar' : 'Belum Ada', up: totalProducts > 0, color:'border-emerald-500' },
            { label:'Total Pesanan', value: String(totalTransactions), sub:'Transaksi Selesai', delta: totalTransactions > 0 ? 'Aktif' : '—', up: totalTransactions > 0, color:'border-indigo-600' },
            { label:'Stok Menipis', value: String(lowStockProducts.length), sub: `${outOfStockProducts.length} Habis Total`, delta: lowStockProducts.length > 0 ? 'Perlu Restok' : 'Aman', up: lowStockProducts.length === 0, color: lowStockProducts.length > 0 ? 'border-rose-500' : 'border-emerald-500' },
            { label:'Saldo Koin', value: `${user?.coins?.toLocaleString() ?? '0'}`, sub:'Koin Tersisa', delta: 'Pay as You Go', up: true, color:'border-indigo-500' },
          ].map((k,i) => (
            <div key={i} className={`bg-white border border-slate-200 border-t-4 ${k.color} p-4 hover:shadow-md transition-all flex flex-col justify-between h-32`}>
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{k.label}</p>
                <span className={`flex items-center gap-0.5 text-[10px] font-bold ${k.up ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {k.up ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>} {k.delta}
                </span>
              </div>
              <div>
                <p className="text-2xl font-light text-slate-900 tracking-tight">{k.value}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase">{k.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── WELCOME BANNER (hanya muncul kalau kosong) ── */}
        {isEmpty && (
          <div className="bg-gradient-to-r from-indigo-50/50 to-violet-50/50 text-slate-800 border border-indigo-100 rounded-3xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-indigo-500" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Selamat Datang di Vistral POS!</h2>
            <p className="text-sm text-slate-500 font-medium max-w-md mx-auto mb-6">
              Dashboard Anda masih kosong. Mulai dengan menambahkan produk pertama Anda, lalu buat transaksi pertama di Kasir.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link to="/inventory" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-indigo-200 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Tambah Produk Pertama
              </Link>
              <Link to="/pos" className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2">
                <QrCode className="w-4 h-4" /> Buka Kasir
              </Link>
            </div>
          </div>
        )}

        {/* ── AI PREDICTIVE INSIGHT (hanya muncul kalau ada data) ── */}
        {!isEmpty && (
          <div className="bg-gradient-to-r from-indigo-50/50 to-violet-50/50 text-slate-800 border border-indigo-100 rounded-3xl p-5 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <Cpu className="w-6 h-6 text-indigo-600" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Saran AI Pintar</span>
                </div>
                <p className="text-sm font-semibold text-slate-700 mt-1">
                  Anda memiliki <strong className="text-indigo-600 font-black">{totalProducts}</strong> produk dan <strong className="text-indigo-600 font-black">{totalTransactions}</strong> transaksi hari ini. 
                  {lowStockProducts.length > 0 && <> Perhatian: <strong className="text-rose-600 font-black">{lowStockProducts.length}</strong> produk perlu restok segera.</>}
                </p>
              </div>
            </div>
            <Link to="/purchase-order" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-indigo-100 whitespace-nowrap">
              Belanja Stok (PO)
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* ── MAIN ANALYTICS ── */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Chart Area */}
            <div className="bg-white border border-slate-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-slate-800 text-sm uppercase tracking-widest">Grafik Pendapatan</h2>
              </div>
              
              {totalTransactions === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                  <BarChart3 className="w-12 h-12 mb-3" />
                  <p className="text-xs font-bold text-slate-400 uppercase">Belum ada data transaksi</p>
                  <p className="text-[10px] text-slate-400 mt-1">Grafik akan muncul setelah transaksi pertama.</p>
                </div>
              ) : (
                <div className="flex items-end gap-3 h-48 mt-8 border-b border-slate-100 pb-2">
                  {weeklyData.map((d,i) => {
                    const pct = maxRev > 0 ? (d.rev/maxRev)*100 : 5;
                    const isMax = d.rev === maxRev && d.rev > 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                        <div className="w-full bg-slate-100 flex items-end h-full">
                          <div className={`w-full transition-all ${isMax ? 'bg-indigo-600 shadow-md shadow-indigo-200' : 'bg-indigo-100 group-hover:bg-indigo-200'}`} style={{height:`${Math.max(pct, 5)}%`}} />
                        </div>
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white border border-indigo-100 text-slate-800 text-[10px] font-bold px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-10 pointer-events-none rounded-xl">
                          {fmtRp(d.rev)} <br/> <span className="text-indigo-400 font-normal">{d.trx} transaksi</span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase ${isMax ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}>{d.day}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Application Launcher Grid */}
            <div className="bg-white border border-slate-200 p-6 shadow-sm">
              <h2 className="font-bold text-slate-800 text-sm uppercase tracking-widest mb-6">Menu Aplikasi Utama</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {name:'Kasir (POS)', icon:<QrCode/>, path:'/pos', desc:'Transaksi Toko'},
                  {name:'Inventori', icon:<Package/>, path:'/inventory', desc:'Stok & Barang'},
                  {name:'Akuntansi', icon:<Wallet/>, path:'/accounting', desc:'Keuangan & Kas'},
                  {name:'Belanja & PO', icon:<Building/>, path:'/purchase-order', desc:'Pesan ke Supplier'},
                  {name:'HRD & Gaji', icon:<Layers/>, path:'/hrd', desc:'Karyawan & Absen'},
                  {name:'Pelanggan', icon:<Users/>, path:'/customers', desc:'Data Member'},
                  {name:'Layar Dapur', icon:<Server/>, path:'/kitchen', desc:'Pesanan Masak'},
                  {name:'Laporan', icon:<LineChart/>, path:'/accounting/laporan-keuangan', desc:'Rekap Usaha'},
                ].map(m=>(
                  <Link key={m.name} to={m.path} className="border border-slate-200 p-4 hover:border-slate-800 hover:shadow-md transition-all group flex flex-col gap-3 bg-slate-50/50 hover:bg-white">
                    <div className="text-slate-600 group-hover:text-slate-900 transition-colors">
                      {React.cloneElement(m.icon as React.ReactElement, { className: 'w-6 h-6' })}
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-800 tracking-tight">{m.name}</span>
                      <span className="block text-[10px] text-slate-500 mt-0.5">{m.desc}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT COL: TABLES & LOGS ── */}
          <div className="space-y-6">
            
            {/* Top Items Table */}
            <div className="bg-white border border-slate-200 shadow-sm flex flex-col h-[340px]">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                <h2 className="font-bold text-slate-800 text-sm uppercase tracking-widest">Menu Terlaris</h2>
                <Link to="/inventory" className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">Lihat Semua</Link>
              </div>
              <div className="flex-1 overflow-auto">
                {topItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-300">
                    <ShoppingBag className="w-10 h-10 mb-2" />
                    <p className="text-xs font-bold text-slate-400 uppercase">Belum ada penjualan</p>
                    <p className="text-[10px] text-slate-400 mt-1">Data muncul setelah transaksi pertama.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 sticky top-0 z-10">
                      <tr className="text-[9px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200">
                        <th className="p-3">Nama Menu</th>
                        <th className="p-3 text-right">Pendapatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {topItems.map((p, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-3">
                            <p className="font-bold text-slate-800">{p.name}</p>
                            <p className="text-[9px] text-slate-500 font-mono mt-0.5">Laku {p.qty}</p>
                          </td>
                          <td className="p-3 text-right">
                            <p className="font-bold text-slate-800">{fmtM(p.vol)}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white border border-slate-200 shadow-sm flex flex-col h-[340px]">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                <h2 className="font-bold text-slate-800 text-sm uppercase tracking-widest">Aktivitas Terakhir</h2>
                <button className="text-slate-400 hover:text-slate-800 transition-colors"><RefreshCw className="w-4 h-4"/></button>
              </div>
              <div className="flex-1 overflow-auto p-4 space-y-4">
                {transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-300">
                    <FileText className="w-10 h-10 mb-2" />
                    <p className="text-xs font-bold text-slate-400 uppercase">Belum ada aktivitas</p>
                    <p className="text-[10px] text-slate-400 mt-1">Transaksi terbaru akan tampil di sini.</p>
                  </div>
                ) : (
                  transactions.slice(0, 8).map((t, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <p className="text-xs font-bold text-slate-800">{t.id}</p>
                          <span className="text-xs font-mono font-bold text-emerald-600">
                            +{fmtRp(t.total)}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Pesanan · {t.method} · Selesai</p>
                        <p className="text-[9px] text-slate-400 font-mono mt-1">{t.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t border-slate-300 pt-4 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Database className="w-3 h-3"/> Supabase Terhubung</span>
            <span className="flex items-center gap-1"><Globe className="w-3 h-3"/> Regional: ID-JKT</span>
          </div>
          <p>VISTRAL POS V.3.1</p>
        </div>

      </div>
    </div>
  );
}
