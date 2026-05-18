import React, { useState } from 'react';
import { 
  TrendingUp, Landmark, Wallet, Calculator, Target, 
  Calendar, FileText, Download, CheckCircle, ChevronDown, 
  AlertTriangle, ArrowLeft, ArrowUpRight, ArrowDownRight, Edit3 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

export default function LaporanKeuangan() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'neraca' | 'labarugi' | 'aruskas' | 'trial' | 'anggaran'>('neraca');
  
  // Date filters
  const [tglMulai, setTglMulai] = useState('2026-05-01');
  const [tglSelesai, setTglSelesai] = useState('2026-05-31');
  const [updating, setUpdating] = useState(false);

  // Anggaran vs Realisasi State
  const [inputAnggaran, setInputAnggaran] = useState<Record<string, string>>({
    'bahan_baku': '0',
    'sdm': '0',
    'operasional': '0',
    'administrasi': '0'
  });
  const [editAnggaran, setEditAnggaran] = useState(false);

  const handleUpdate = () => {
    setUpdating(true);
    setTimeout(() => setUpdating(false), 800);
  };

  // Mock download action
  const handleDownload = (reportName: string) => {
    alert(`📄 Laporan ${reportName} Periode Mei 2026 berhasil diunduh dalam format PDF.`);
  };

  return (
    <div className="bg-[#F4F5F7] min-h-[calc(100vh-3.5rem)]">
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto font-sans">
        <button onClick={() => navigate('/accounting')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-bold text-xs uppercase tracking-widest transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Akuntansi
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6 border-b border-slate-300 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Landmark className="w-3 h-3"/> Laporan Keuangan</span>
            </div>
            <h1 className="text-3xl font-light text-slate-900 tracking-tight">Buku Laporan Usaha</h1>
            <p className="text-xs font-medium text-slate-500 mt-1 max-w-xl">
              Catatan keuangan otomatis sesuai standar, langsung dari transaksi kasir Anda.
            </p>
          </div>
        </div>

        {/* Note Penting (Info Box) */}
        <div className="bg-white border-l-4 border-slate-800 rounded-sm p-4 mb-6 shadow-sm flex gap-4 text-slate-800">
          <div className="w-8 h-8 bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-600"><CheckCircle className="w-4 h-4"/></div>
          <div>
            <p className="font-bold text-sm uppercase tracking-wide">Pencatatan Otomatis Aktif</p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Semua transaksi penjualan, stok, dan kas otomatis tercatat ke laporan ini tanpa perlu hitung manual.
            </p>
          </div>
        </div>

        {/* Filter Periode */}
        <div className="bg-white border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
          <div className="flex items-center gap-3 w-full sm:w-auto border-r border-slate-200 pr-4">
            <Calendar className="w-4 h-4 text-slate-500" />
            <div className="flex items-center gap-2 flex-1">
              <input 
                type="date" 
                value={tglMulai} 
                onChange={e => setTglMulai(e.target.value)} 
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-slate-800 font-bold"
              />
              <span className="text-slate-400 text-[10px] font-bold uppercase">S/D</span>
              <input 
                type="date" 
                value={tglSelesai} 
                onChange={e => setTglSelesai(e.target.value)} 
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-slate-800 font-bold"
              />
            </div>
          </div>
          <button 
            onClick={handleUpdate}
            disabled={updating}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest transition-all rounded-xl shadow-sm shadow-indigo-100 flex items-center justify-center gap-2"
          >
            {updating ? 'Memproses...' : 'Buat Laporan'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-1 mb-6 border-b border-slate-300 pb-px hide-scrollbar">
          {[
            { id: 'neraca', label: 'Neraca (Harta & Hutang)', icon: <Landmark className="w-4 h-4" /> },
            { id: 'labarugi', label: 'Laba Rugi', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'aruskas', label: 'Arus Kas (Keluar Masuk)', icon: <Wallet className="w-4 h-4" /> },
            { id: 'trial', label: 'Neraca Saldo', icon: <Calculator className="w-4 h-4" /> },
            { id: 'anggaran', label: 'Anggaran vs Kenyataan', icon: <Target className="w-4 h-4" /> },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-widest font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === t.id 
                  ? 'border-slate-800 text-slate-900 bg-white' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/50'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        {activeTab === 'neraca' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-light text-slate-900 tracking-tight">Neraca (Ringkasan Harta & Hutang)</h2>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mt-1">Total Harta = Hutang + Modal</p>
              </div>
              <button onClick={() => handleDownload('Posisi Keuangan (Neraca)')} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold uppercase tracking-widest text-slate-700 shadow-sm transition-colors">
                <Download className="w-4 h-4" /> Cetak PDF
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* KIRI - ASET */}
              <div className="bg-white border border-slate-200 shadow-sm">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-slate-500"/> Harta Kekayaan
                  </h3>
                </div>
                <div className="p-5 space-y-6">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 pb-1 border-b border-slate-100">Uang & Kas</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-slate-700">
                        <span>Saldo di Rekening Bank</span>
                        <span className="font-mono">{formatRp(0)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-700">
                        <span>Uang Tunai di Laci (Kas Kecil)</span>
                        <span className="font-mono">{formatRp(0)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-indigo-600 uppercase tracking-wider mb-2">Stok Gudang</h4>
                    <div className="flex justify-between text-sm font-bold text-slate-700">
                      <span>Stok Bahan Baku & Barang</span>
                      <span>{formatRp(0)}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-indigo-600 uppercase tracking-wider mb-2">Aset Tetap</h4>
                    <div className="flex justify-between text-sm font-bold text-slate-700">
                      <span>Peralatan & Kendaraan</span>
                      <span>{formatRp(0)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-between text-lg font-black text-slate-900 bg-slate-50/50 p-3 rounded-2xl">
                    <span>Total Harta & Aset</span>
                    <span className="text-indigo-600">{formatRp(0)}</span>
                  </div>
                </div>
              </div>

            {/* KANAN - KEWAJIBAN & MODAL */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-base font-black text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <span className="text-lg">⚖️</span> Kewajiban yang Harus Dibayar
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold text-slate-700">
                    <span>Belanja Belum Dibayar (Hutang Supplier)</span>
                    <span>{formatRp(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-700">
                    <span>Hutang Gaji & Relawan</span>
                    <span>{formatRp(0)}</span>
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex justify-between text-base font-black text-slate-950">
                    <span>Total Kewajiban (Hutang)</span>
                    <span>{formatRp(0)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-base font-black text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <span className="text-lg">🏛️</span> Modal Yayasan / Pemilik
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold text-slate-700">
                    <span>Modal Awal Pemilik</span>
                    <span>{formatRp(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-700">
                    <span>Sisa Hasil Usaha Berjalan (Laba/Rugi)</span>
                    <span>{formatRp(0)}</span>
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex justify-between text-base font-black text-slate-950">
                    <span>Total Modal Bersih</span>
                    <span>{formatRp(0)}</span>
                  </div>
                </div>
              </div>

              {/* Balance Check */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-3xl flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-black text-emerald-800">Status Neraca Seimbang</p>
                    <p className="text-[10px] text-emerald-600 font-bold">Total Harta = Kewajiban + Modal</p>
                  </div>
                </div>
                <span className="text-sm font-black text-emerald-700">{formatRp(0)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'labarugi' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-900">Berapa Dana yang Masuk dan Keluar</h2>
              <p className="text-sm text-slate-500">Ringkasan semua penerimaan dan pengeluaran dalam periode yang dipilih.</p>
            </div>
            <button onClick={() => handleDownload('Penggunaan Dana (Laba Rugi)')} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-sm font-bold text-slate-700">
              <Download className="w-4 h-4" /> Cetak PDF
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {/* PENERIMAAN */}
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black text-emerald-950 flex items-center gap-2">
                    <span>💰</span> Pemasukan / Penerimaan
                  </h3>
                  <span className="text-lg font-black text-emerald-800">{formatRp(0)}</span>
                </div>
                <div className="space-y-2 text-sm text-emerald-900/80">
                  <div className="flex justify-between font-bold">
                    <span>Pendapatan Penjualan Kasir</span>
                    <span>{formatRp(0)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Pemasukan Tambahan / Lain-lain</span>
                    <span>{formatRp(0)}</span>
                  </div>
                </div>
              </div>

              {/* PENGELUARAN */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
                <h3 className="text-base font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <span>💸</span> Rincian Pengeluaran
                </h3>

                {/* 1 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-black text-slate-800">
                    <span>🍚 Biaya Bahan Makanan (Bahan Baku)</span>
                    <span>{formatRp(0)}</span>
                  </div>
                  <div className="pl-6 space-y-1 text-xs font-bold text-slate-500">
                    <div className="flex justify-between"><span>Karbohidrat (Beras, Tepung)</span><span>{formatRp(0)}</span></div>
                    <div className="flex justify-between"><span>Protein (Ayam, Telur)</span><span>{formatRp(0)}</span></div>
                    <div className="flex justify-between"><span>Sayur, Buah & Bumbu</span><span>{formatRp(0)}</span></div>
                  </div>
                </div>

                {/* 2 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-black text-slate-800">
                    <span>👥 Biaya SDM & Gaji Karyawan</span>
                    <span>{formatRp(0)}</span>
                  </div>
                  <div className="pl-6 space-y-1 text-xs font-bold text-slate-500">
                    <div className="flex justify-between"><span>Gaji Bersih Staff</span><span>{formatRp(0)}</span></div>
                    <div className="flex justify-between"><span>Uang Saku & Bonus</span><span>{formatRp(0)}</span></div>
                  </div>
                </div>

                {/* 3 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-black text-slate-800">
                    <span>🔌 Biaya Operasional Toko</span>
                    <span>{formatRp(0)}</span>
                  </div>
                  <div className="pl-6 space-y-1 text-xs font-bold text-slate-500">
                    <div className="flex justify-between"><span>Tagihan Listrik PLN</span><span>{formatRp(0)}</span></div>
                    <div className="flex justify-between"><span>Air PDAM & Pulsa</span><span>{formatRp(0)}</span></div>
                  </div>
                </div>

                {/* Total pengeluaran */}
                <div className="pt-4 border-t border-slate-200 flex justify-between text-base font-black text-slate-900 bg-rose-50/30 p-3 rounded-2xl">
                  <span>Total Pengeluaran</span>
                  <span className="text-rose-600">{formatRp(0)}</span>
                </div>
              </div>
            </div>

            {/* SURPLUS/DEFISIT */}
            <div>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] pointer-events-none"></div>
                <span className="text-2xl">🎉</span>
                <h3 className="font-black text-lg mt-3">Hasil Kinerja Periode Ini</h3>
                <p className="text-xs text-emerald-100 font-bold mt-1">Pemasukan dikurangi Pengeluaran</p>
                
                <div className="my-6">
                  <p className="text-4xl font-black">{formatRp(0)}</p>
                  <span className="inline-block mt-2 bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">BELUM ADA DATA</span>
                </div>

                <div className="p-4 bg-white/15 rounded-2xl border border-white/10 text-xs font-medium leading-relaxed text-emerald-50">
                  <strong>Pesan AI:</strong> Mulai catat transaksi penjualan dan pengeluaran untuk melihat analisa laba/rugi otomatis di sini.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'aruskas' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-900">Uang Masuk dan Keluar dari Rekening</h2>
              <p className="text-sm text-slate-500">Menunjukkan pergerakan uang nyata di kas dan rekening toko Anda.</p>
            </div>
            <button onClick={() => handleDownload('Aliran Dana (Arus Kas)')} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-sm font-bold text-slate-700">
              <Download className="w-4 h-4" /> Cetak PDF
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {/* OPERASIONAL */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center justify-between">
                  <span>A. Kegiatan Operasional</span>
                  <span className="text-emerald-600 font-black">+ {formatRp(0)}</span>
                </h3>
                <div className="space-y-2 text-sm text-slate-600 font-bold">
                  <div className="flex justify-between"><span>Kas Masuk dari Penjualan</span><span>+ {formatRp(0)}</span></div>
                  <div className="flex justify-between text-rose-500"><span>Kas Keluar Belanja Bahan & Gaji</span><span>- {formatRp(0)}</span></div>
                </div>
              </div>

              {/* INVESTASI */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center justify-between">
                  <span>B. Kegiatan Beli Aset</span>
                  <span className="text-rose-600 font-black">- {formatRp(0)}</span>
                </h3>
                <div className="space-y-2 text-sm text-slate-600 font-bold">
                  <div className="flex justify-between text-rose-500"><span>Pembelian Peralatan Dapur Tetap</span><span>- {formatRp(0)}</span></div>
                </div>
              </div>

              {/* PENDANAAN */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center justify-between">
                  <span>C. Kegiatan Pendanaan</span>
                  <span className="text-slate-500 font-black">{formatRp(0)}</span>
                </h3>
                <p className="text-xs text-slate-400 font-medium">Tidak ada aktivitas pinjaman / modal tambahan pada periode ini.</p>
              </div>
            </div>

            {/* Rekap Saldo */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-black text-slate-400 text-xs uppercase tracking-widest">Ringkasan Saldo Kas</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold text-slate-500">
                  <span>Saldo Awal Kas</span>
                  <span>{formatRp(0)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-emerald-600">
                  <span>Total Aliran Kas Bersih</span>
                  <span>+ {formatRp(0)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Saldo Akhir Kas</p>
                  <p className="text-3xl font-black text-indigo-600 mt-1">{formatRp(0)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trial' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-900">Ringkasan Saldo Semua Akun</h2>
              <p className="text-sm text-slate-500">Melihat daftar saldo setiap kategori untuk mengecek kecocokan hitungan.</p>
            </div>
            <button onClick={() => handleDownload('Neraca Saldo')} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-sm font-bold text-slate-700">
              <Download className="w-4 h-4" /> Cetak Excel
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-4 px-6 font-black text-[10px] text-slate-400 uppercase tracking-widest">Kode Akun</th>
                    <th className="py-4 px-6 font-black text-[10px] text-slate-400 uppercase tracking-widest">Nama Kategori</th>
                    <th className="py-4 px-6 font-black text-[10px] text-slate-400 uppercase tracking-widest text-right">Debit (Uang Keluar)</th>
                    <th className="py-4 px-6 font-black text-[10px] text-slate-400 uppercase tracking-widest text-right">Kredit (Uang Masuk)</th>
                    <th className="py-4 px-6 font-black text-[10px] text-slate-400 uppercase tracking-widest text-right">Saldo Bersih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700 font-bold">
                  <tr>
                    <td className="py-4 px-6 font-mono text-indigo-600">1-1001</td>
                    <td className="py-4 px-6">Kas & Rekening Bank</td>
                    <td className="py-4 px-6 text-right text-slate-900">{formatRp(0)}</td>
                    <td className="py-4 px-6 text-right">—</td>
                    <td className="py-4 px-6 text-right text-indigo-600">{formatRp(0)}</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-mono text-indigo-600">1-1002</td>
                    <td className="py-4 px-6">Kas Kecil (Laci Toko)</td>
                    <td className="py-4 px-6 text-right text-slate-900">{formatRp(0)}</td>
                    <td className="py-4 px-6 text-right">—</td>
                    <td className="py-4 px-6 text-right text-indigo-600">{formatRp(0)}</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-mono text-indigo-600">4-0001</td>
                    <td className="py-4 px-6">Pendapatan Penjualan</td>
                    <td className="py-4 px-6 text-right">—</td>
                    <td className="py-4 px-6 text-right text-slate-900">{formatRp(0)}</td>
                    <td className="py-4 px-6 text-right text-indigo-600">{formatRp(0)}</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-mono text-indigo-600">5-1001</td>
                    <td className="py-4 px-6">Biaya Belanja Bahan Makanan</td>
                    <td className="py-4 px-6 text-right text-slate-900">{formatRp(0)}</td>
                    <td className="py-4 px-6 text-right">—</td>
                    <td className="py-4 px-6 text-right text-indigo-600">{formatRp(0)}</td>
                  </tr>
                  <tr className="bg-slate-50 border-t-2 border-slate-200">
                    <td colSpan={2} className="py-4 px-6 font-black text-slate-900">Total Keseluruhan</td>
                    <td className="py-4 px-6 text-right font-black text-emerald-700">{formatRp(0)}</td>
                    <td className="py-4 px-6 text-right font-black text-emerald-700">{formatRp(0)}</td>
                    <td className="py-4 px-6 text-right text-emerald-700">✓ Seimbang</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'anggaran' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-900">Rencana vs Kenyataan Pengeluaran</h2>
              <p className="text-sm text-slate-500">Bandingkan batas belanja (anggaran) yang direncanakan dengan pengeluaran aslinya.</p>
            </div>
            <button 
              onClick={() => setEditAnggaran(!editAnggaran)} 
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-xl text-sm font-bold text-indigo-700"
            >
              <Edit3 className="w-4 h-4" /> {editAnggaran ? 'Simpan' : 'Atur Batas Belanja'}
            </button>
          </div>

          {/* EDIT ANGGARAN FORM */}
          {editAnggaran && (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top duration-300">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Bahan Makanan (Rp)</label>
                <input 
                  type="number" 
                  value={inputAnggaran.bahan_baku} 
                  onChange={e => setInputAnggaran({...inputAnggaran, bahan_baku: e.target.value})} 
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gaji Karyawan (Rp)</label>
                <input 
                  type="number" 
                  value={inputAnggaran.sdm} 
                  onChange={e => setInputAnggaran({...inputAnggaran, sdm: e.target.value})} 
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Listrik & Air (Rp)</label>
                <input 
                  type="number" 
                  value={inputAnggaran.operasional} 
                  onChange={e => setInputAnggaran({...inputAnggaran, operasional: e.target.value})} 
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Biaya Lain-lain (Rp)</label>
                <input 
                  type="number" 
                  value={inputAnggaran.administrasi} 
                  onChange={e => setInputAnggaran({...inputAnggaran, administrasi: e.target.value})} 
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TABLE COMPARISON */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-4 px-6 font-black text-[10px] text-slate-400 uppercase tracking-widest">Kategori Pengeluaran</th>
                    <th className="py-4 px-6 font-black text-[10px] text-slate-400 uppercase tracking-widest text-right">Batas Maksimal (Anggaran)</th>
                    <th className="py-4 px-6 font-black text-[10px] text-slate-400 uppercase tracking-widest text-right">Terpakai Asli</th>
                    <th className="py-4 px-6 font-black text-[10px] text-slate-400 uppercase tracking-widest text-right">Sisa Uang</th>
                    <th className="py-4 px-6 font-black text-[10px] text-slate-400 uppercase tracking-widest">Terpakai (%)</th>
                    <th className="py-4 px-6 font-black text-[10px] text-slate-400 uppercase tracking-widest text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700 font-bold">
                  {[
                    { key: 'bahan_baku', name: 'Biaya Bahan Makanan', aktual: 0 },
                    { key: 'sdm', name: 'Biaya SDM & Karyawan', aktual: 0 },
                    { key: 'operasional', name: 'Biaya Operasional Toko', aktual: 0 },
                    { key: 'administrasi', name: 'Biaya Administrasi & Bank', aktual: 0 },
                  ].map(row => {
                    const budget = Number(inputAnggaran[row.key]) || 0;
                    const remaining = budget - row.aktual;
                    const pct = budget > 0 ? Math.round((row.aktual / budget) * 100) : 0;
                    
                    const isOver = pct > 100;
                    const isOnTrack = pct >= 80 && pct <= 100;

                    return (
                      <tr key={row.key} className="hover:bg-slate-50/30">
                        <td className="py-4 px-6 font-black text-slate-800">{row.name}</td>
                        <td className="py-4 px-6 text-right text-slate-900">{formatRp(budget)}</td>
                        <td className="py-4 px-6 text-right text-indigo-600">{formatRp(row.aktual)}</td>
                        <td className={`py-4 px-6 text-right ${remaining < 0 ? 'text-rose-600 font-black' : 'text-slate-600'}`}>{formatRp(remaining)}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 max-w-[120px]">
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${isOver ? 'bg-rose-500' : isOnTrack ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                style={{ width: `${Math.min(pct, 100)}%` }} 
                              />
                            </div>
                            <span className="text-xs font-black text-slate-500">{pct}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                            isOver ? 'bg-rose-50 text-rose-700' :
                            isOnTrack ? 'bg-amber-50 text-amber-700' :
                            'bg-emerald-50 text-emerald-700'
                          }`}>
                            {isOver ? 'Lewat Batas 🚨' : isOnTrack ? 'Hampir Habis ⚠️' : 'Aman ✓'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
