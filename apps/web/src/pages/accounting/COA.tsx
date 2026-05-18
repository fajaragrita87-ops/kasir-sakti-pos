import React, { useState } from 'react';
import { 
  FolderTree, Lock, Trash2, Edit3, Plus, Search, HelpCircle, 
  Check, ArrowLeft, ChevronDown, ChevronRight, CheckCircle2, Download, RefreshCw, X 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

interface Akun {
  id: string;
  kode: string;
  nama: string;
  nama_tampil: string;
  tipe: 'aset' | 'liabilitas' | 'ekuitas' | 'pendapatan' | 'beban';
  normal_balance: 'debit' | 'kredit';
  system_account: boolean;
  saldo: number;
  aktif: boolean;
}

const DEFAULT_COA: Akun[] = [
  // Aset
  { id: '1', kode: '1-1001', nama: 'Kas & Bank', nama_tampil: 'Saldo Kas & Rekening Bank', tipe: 'aset', normal_balance: 'debit', system_account: true, saldo: 0, aktif: true },
  { id: '2', kode: '1-1002', nama: 'Kas Kecil', nama_tampil: 'Kas Kecil (Pegangan Tunai)', tipe: 'aset', normal_balance: 'debit', system_account: true, saldo: 0, aktif: true },
  { id: '3', kode: '1-1100', nama: 'Persediaan Barang', nama_tampil: 'Stok Barang & Bahan Baku', tipe: 'aset', normal_balance: 'debit', system_account: true, saldo: 0, aktif: true },
  { id: '4', kode: '1-2001', nama: 'Peralatan & Mesin', nama_tampil: 'Peralatan Usaha (Aset Tetap)', tipe: 'aset', normal_balance: 'debit', system_account: false, saldo: 0, aktif: true },
  
  // Liabilitas
  { id: '5', kode: '2-1001', nama: 'Hutang Usaha', nama_tampil: 'Belanja Belum Dibayar (Hutang)', tipe: 'liabilitas', normal_balance: 'kredit', system_account: true, saldo: 0, aktif: true },
  { id: '6', kode: '2-1002', nama: 'Hutang Gaji', nama_tampil: 'Gaji Karyawan Belum Dibayar', tipe: 'liabilitas', normal_balance: 'kredit', system_account: true, saldo: 0, aktif: true },

  // Ekuitas
  { id: '7', kode: '3-0001', nama: 'Modal Pemilik', nama_tampil: 'Modal Awal Usaha', tipe: 'ekuitas', normal_balance: 'kredit', system_account: true, saldo: 0, aktif: true },
  { id: '8', kode: '3-0003', nama: 'Laba/Rugi Berjalan', nama_tampil: 'Sisa Hasil Periode Ini', tipe: 'ekuitas', normal_balance: 'kredit', system_account: true, saldo: 0, aktif: true },

  // Pendapatan
  { id: '9', kode: '4-0001', nama: 'Penjualan', nama_tampil: 'Pendapatan Penjualan Kasir', tipe: 'pendapatan', normal_balance: 'kredit', system_account: true, saldo: 0, aktif: true },
  { id: '10', kode: '4-0003', nama: 'Pendapatan Lain-lain', nama_tampil: 'Pemasukan Lainnya', tipe: 'pendapatan', normal_balance: 'kredit', system_account: false, saldo: 0, aktif: true },

  // Beban
  { id: '11', kode: '5-1001', nama: 'Pembelian Bahan Baku', nama_tampil: 'Biaya Belanja Bahan Baku', tipe: 'beban', normal_balance: 'debit', system_account: true, saldo: 0, aktif: true },
  { id: '12', kode: '5-2001', nama: 'Gaji & Upah', nama_tampil: 'Gaji & Karyawan', tipe: 'beban', normal_balance: 'debit', system_account: true, saldo: 0, aktif: true },
  { id: '13', kode: '5-3001', nama: 'Listrik', nama_tampil: 'Tagihan Listrik PLN', tipe: 'beban', normal_balance: 'debit', system_account: false, saldo: 0, aktif: true },
];

export default function COA() {
  const navigate = useNavigate();
  const [akuns, setAkuns] = useState<Akun[]>(DEFAULT_COA);
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<'semua' | 'aset' | 'liabilitas' | 'ekuitas' | 'pendapatan' | 'beban'>('semua');
  
  // Modal states
  const [showAdd, setShowAdd] = useState(false);
  const [newTipe, setNewTipe] = useState<'aset' | 'liabilitas' | 'ekuitas' | 'pendapatan' | 'beban'>('aset');
  const [newNama, setNewNama] = useState('');
  const [newNamaTampil, setNewNamaTampil] = useState('');
  const [newParent, setNewParent] = useState('');
  const [toast, setToast] = useState('');

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama || !newNamaTampil) return;

    const prefix = newTipe === 'aset' ? '1-' : newTipe === 'liabilitas' ? '2-' : newTipe === 'ekuitas' ? '3-' : newTipe === 'pendapatan' ? '4-' : '5-';
    const sameTipe = akuns.filter(a => a.tipe === newTipe);
    const lastKode = sameTipe.length > 0 ? sameTipe[sameTipe.length - 1].kode : `${prefix}1000`;
    const nextNum = parseInt(lastKode.split('-')[1]) + 1;
    const newKode = `${prefix}${nextNum}`;

    const newAkun: Akun = {
      id: Date.now().toString(),
      kode: newKode,
      nama: newNama,
      nama_tampil: newNamaTampil,
      tipe: newTipe,
      normal_balance: (newTipe === 'aset' || newTipe === 'beban') ? 'debit' : 'kredit',
      system_account: false,
      saldo: 0,
      aktif: true,
    };

    setAkuns([...akuns, newAkun]);
    setShowAdd(false);
    setNewNama('');
    setNewNamaTampil('');
    setToast('✅ Akun baru berhasil ditambahkan!');
    setTimeout(() => setToast(''), 3000);
  };

  const filtered = akuns.filter(a => {
    const matchSearch = a.nama.toLowerCase().includes(search.toLowerCase()) || 
                        a.nama_tampil.toLowerCase().includes(search.toLowerCase()) || 
                        a.kode.includes(search);
    const matchType = activeType === 'semua' || a.tipe === activeType;
    return matchSearch && matchType;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <button onClick={() => navigate('/accounting')} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 font-bold text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Akuntansi
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 text-violet-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border border-violet-100">
            <FolderTree className="w-3 h-3" /> Daftar Akun
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Daftar Akun (Buku Besar)</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-lg">
            Kelola kode perkiraan pembukuan. Akun berlogo 🔒 adalah akun sistem yang tidak boleh dihapus demi keamanan.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-violet-600/20"
        >
          <Plus className="w-4 h-4" /> Tambah Akun Baru
        </button>
      </div>

      {toast && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="font-bold text-emerald-800">{toast}</p>
        </div>
      )}

      {/* Tabs Tipe Akun */}
      <div className="flex overflow-x-auto gap-2 mb-6 border-b border-slate-200 pb-px hide-scrollbar">
        {(['semua', 'aset', 'liabilitas', 'ekuitas', 'pendapatan', 'beban'] as const).map(type => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap capitalize ${
              activeType === type 
                ? 'border-violet-600 text-violet-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {type === 'semua' ? 'Semua Akun' : type === 'liabilitas' ? 'Kewajiban' : type === 'ekuitas' ? 'Modal' : type}
          </button>
        ))}
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari kode, nama akun, atau nama tampil..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
          />
        </div>
        <div className="bg-slate-100/60 border border-slate-200/50 rounded-xl p-3 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-500">Total Akun Aktif</span>
          <span className="text-lg font-black text-slate-900">{akuns.filter(a => a.aktif).length}</span>
        </div>
        <div className="bg-slate-100/60 border border-slate-200/50 rounded-xl p-3 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-500">Akun Sistem</span>
          <span className="text-lg font-black text-slate-900">{akuns.filter(a => a.system_account).length}</span>
        </div>
      </div>

      {/* COA List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-4 px-6 font-black text-[10px] text-slate-400 uppercase tracking-widest">Kode</th>
                <th className="py-4 px-6 font-black text-[10px] text-slate-400 uppercase tracking-widest">Nama Pembukuan (Akuntansi)</th>
                <th className="py-4 px-6 font-black text-[10px] text-slate-400 uppercase tracking-widest">Nama Tampilan (Bahasa Manusia)</th>
                <th className="py-4 px-6 font-black text-[10px] text-slate-400 uppercase tracking-widest">Tipe Akun</th>
                <th className="py-4 px-6 font-black text-[10px] text-slate-400 uppercase tracking-widest text-right">Saldo Saat Ini</th>
                <th className="py-4 px-6 font-black text-[10px] text-slate-400 uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-mono text-sm font-black text-indigo-600">{a.kode}</td>
                  <td className="py-4 px-6 text-sm font-bold text-slate-700">{a.nama}</td>
                  <td className="py-4 px-6 text-sm text-slate-900 font-bold bg-violet-50/20">{a.nama_tampil}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-black capitalize ${
                      a.tipe === 'aset' ? 'bg-emerald-50 text-emerald-700' :
                      a.tipe === 'liabilitas' ? 'bg-amber-50 text-amber-700' :
                      a.tipe === 'ekuitas' ? 'bg-violet-50 text-violet-700' :
                      a.tipe === 'pendapatan' ? 'bg-blue-50 text-blue-700' :
                      'bg-rose-50 text-rose-700'
                    }`}>
                      {a.tipe === 'liabilitas' ? 'Kewajiban' : a.tipe === 'ekuitas' ? 'Modal' : a.tipe}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm font-black text-right text-slate-900">{formatRp(a.saldo)}</td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex justify-center items-center gap-2">
                      {a.system_account ? (
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400" title="Akun sistem tidak bisa dihapus">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if(confirm('Apakah Anda yakin ingin menonaktifkan akun ini?')) {
                              setAkuns(akuns.filter(ak => ak.id !== a.id));
                              setToast('🗑️ Akun berhasil dihapus.');
                              setTimeout(() => setToast(''), 3000);
                            }
                          }}
                          className="w-8 h-8 rounded-lg text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Account */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg z-10 flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900">➕ Tambah Akun Baru</h3>
                <p className="text-sm text-slate-500 font-medium">Buat kode perkiraan baru untuk pencatatan bisnis Anda.</p>
              </div>
              <button onClick={() => setShowAdd(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleAddAccount} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tipe Akun</label>
                <select
                  value={newTipe}
                  onChange={e => setNewTipe(e.target.value as any)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 font-bold focus:ring-2 focus:ring-violet-500 focus:outline-none"
                >
                  <option value="aset">Aset (Harta)</option>
                  <option value="liabilitas">Liabilitas (Kewajiban/Hutang)</option>
                  <option value="ekuitas">Ekuitas (Modal Yayasan/Pemilik)</option>
                  <option value="pendapatan">Pendapatan (Pemasukan)</option>
                  <option value="beban">Beban (Pengeluaran)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Akun Pembukuan (Akuntansi)</label>
                <input
                  type="text"
                  value={newNama}
                  onChange={e => setNewNama(e.target.value)}
                  placeholder="Cth: Beban Promosi Online, Pendapatan Catering"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Tampilan Lapangan (Bahasa Manusia)</label>
                <input
                  type="text"
                  value={newNamaTampil}
                  onChange={e => setNewNamaTampil(e.target.value)}
                  placeholder="Cth: Biaya Iklan & Sosmed, Dana Hasil Catering"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                  required
                />
                <span className="text-[10px] font-medium text-slate-400 mt-1 block">Ini nama yang akan dimengerti oleh staff dan owner di laporan.</span>
              </div>

              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-700 leading-relaxed font-medium">
                🛡️ Sistem akan mengalokasikan kode akun secara otomatis agar tidak bertabrakan dengan akun yang sudah ada. Normal balance akan disesuaikan secara default.
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowAdd(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50">Batal</button>
                <button type="submit" className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-xl shadow-lg shadow-violet-600/20">Simpan Akun</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
