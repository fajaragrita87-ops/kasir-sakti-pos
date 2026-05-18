import React, { useState } from 'react';
import { 
  Calculator, TrendingUp, DollarSign, Download, Plus, Filter, 
  Search, Building2, Truck, FileText, PieChart, ArrowUpRight, 
  ArrowDownRight, Wallet, Landmark, CheckCircle2, ChevronRight, X,
  ArrowRight, FolderTree, BookOpen, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

export default function AccountingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ringkasan');
  const [downloading, setDownloading] = useState(false);

  // Quick Action Buttons
  const QUICK_ACTIONS = [
    { label: 'Catat Penerimaan Dana', desc: 'Uang masuk penjualan, piutang, dll', to: '/accounting/terima-dana', icon: <Wallet className="w-4 h-4" /> },
    { label: 'Jurnal Transaksi', desc: 'Buku jurnal & koreksi manual', to: '/accounting/jurnal', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Laporan Lengkap', desc: 'Neraca, Laba Rugi, & Arus Kas', to: '/accounting/laporan-keuangan', icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Daftar Kode Akun', desc: 'Kelola Chart of Accounts', to: '/accounting/daftar-akun', icon: <FolderTree className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
    <div className="max-w-[1400px] mx-auto p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-indigo-100 rounded-2xl px-6 py-4 shadow-sm">
        <div>
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Financial Management</span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-1">Akuntansi & Keuangan</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Sistem double-entry otomatis · Bahasa Indonesia sederhana · Sekelas Kledo</p>
        </div>
      </div>

      {/* Quick Menu Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_ACTIONS.map((qa, i) => (
          <div 
            key={i} 
            onClick={() => navigate(qa.to)}
            className="bg-white border border-indigo-100 rounded-2xl p-5 cursor-pointer transition-all hover:border-indigo-400 hover:shadow-md hover:shadow-indigo-50 flex flex-col justify-between group h-32"
          >
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-all">{qa.icon}</div>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <p className="font-black text-slate-800 text-sm">{qa.label}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{qa.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Visual Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-indigo-50">
              <div>
                <h3 className="font-black text-slate-800 text-base">Kas & Kesehatan Keuangan</h3>
                <p className="text-xs text-slate-400 font-medium">Bulan berjalan Mei 2026</p>
              </div>
              <button onClick={() => navigate('/accounting/laporan-keuangan')} className="text-xs font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition-colors">
                Selengkapnya <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Saldo Kas & Rekening', val: formatRp(0) },
                { label: 'Pemasukan Bulan Ini', val: formatRp(0) },
                { label: 'Pengeluaran Bulan Ini', val: formatRp(0) },
                { label: 'Modal Usaha Bersih', val: formatRp(0) },
              ].map(c => (
                <div key={c.label} className="bg-indigo-50/50 p-4 border border-indigo-100 rounded-2xl">
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider mb-1">{c.label}</p>
                  <p className="text-xl font-black text-slate-800">{c.val}</p>
                </div>
              ))}
            </div>

            {/* Chart placeholder */}
            <div className="pt-4 space-y-3">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">Perbandingan Tren Mingguan (Pemasukan vs Pengeluaran)</p>
              <div className="h-44 flex items-center justify-center text-slate-300">
                <div className="text-center">
                  <PieChart className="w-10 h-10 mx-auto mb-2 text-indigo-200" />
                  <p className="text-xs font-bold text-slate-400">Belum ada data keuangan</p>
                  <p className="text-[10px] text-slate-400 mt-1">Grafik akan muncul setelah transaksi pertama dicatat.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Mini Statement */}
        <div className="space-y-6">
          <div className="bg-gradient-to-b from-indigo-600 to-violet-700 text-white rounded-2xl p-6 shadow-lg shadow-indigo-200/40 relative overflow-hidden flex flex-col justify-between h-full">
            <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full blur-[40px] pointer-events-none"></div>
            <div>
              <Calculator className="w-5 h-5 text-indigo-200 mb-3" />
              <h3 className="font-black text-lg">Ringkasan Sisa Dana</h3>
              <p className="text-xs text-indigo-200 font-medium">Berdasarkan data operasional otomatis</p>
              
              <div className="my-6">
                <p className="text-3xl font-black text-white">{formatRp(0)}</p>
                <span className="inline-block mt-1 bg-white/10 text-indigo-200 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-white/10">BELUM ADA DATA</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm font-bold text-indigo-100">
                <span>Rasio Hutang</span>
                <span className="text-white">—</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-indigo-100">
                <span>Margin Keuntungan</span>
                <span className="text-white">—</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[10px] font-bold text-indigo-200 leading-relaxed">
                <strong className="text-white">Saran Sistem:</strong> Mulai catat penerimaan dan pengeluaran untuk mendapatkan analisa keuangan otomatis.
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
    </div>
  );
}
