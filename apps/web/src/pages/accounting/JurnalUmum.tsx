import React, { useState } from 'react';
import {
  FileText, Search, Filter, ChevronDown, ChevronRight, Plus, X,
  Check, AlertCircle, Trash2, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatRp = (n: number) => 'Rp ' + Math.abs(n).toLocaleString('id-ID');

type RefTipe = 'penjualan_pos' | 'belanja_bahan' | 'operasional' | 'gaji' | 'petty_cash' | 'kas_masuk' | 'beli_aset' | 'bayar_hutang' | 'manual';

interface JurnalItem {
  id: string;
  tanggal: string;
  no_jurnal: string;
  deskripsi: string;
  ref_tipe: RefTipe;
  total_debit: number;
  total_kredit: number;
  status: 'posted' | 'void';
  detail: { kode: string; nama_tampil: string; debit: number; kredit: number }[];
}

const REF_LABEL: Record<RefTipe, { label: string; icon: string; color: string }> = {
  penjualan_pos:  { label: 'Penjualan POS',    icon: '🛒', color: 'bg-emerald-50 text-emerald-700' },
  belanja_bahan:  { label: 'Belanja Bahan',     icon: '🍚', color: 'bg-amber-50 text-amber-700' },
  operasional:    { label: 'Biaya Operasional', icon: '🔌', color: 'bg-blue-50 text-blue-700' },
  gaji:           { label: 'Gaji Karyawan',     icon: '👥', color: 'bg-violet-50 text-violet-700' },
  petty_cash:     { label: 'Kas Kecil',         icon: '💵', color: 'bg-orange-50 text-orange-700' },
  kas_masuk:      { label: 'Dana Masuk',        icon: '💰', color: 'bg-green-50 text-green-700' },
  beli_aset:      { label: 'Beli Aset',         icon: '🏭', color: 'bg-slate-100 text-slate-700' },
  bayar_hutang:   { label: 'Bayar Hutang',      icon: '✅', color: 'bg-teal-50 text-teal-700' },
  manual:         { label: 'Manual',            icon: '✏️', color: 'bg-rose-50 text-rose-700' },
};

const DUMMY_JURNAL: JurnalItem[] = [];

const COA_OPTS = [
  { kode: '1-1001', nama: 'Kas & Bank' },
  { kode: '1-1002', nama: 'Kas Kecil' },
  { kode: '4-0001', nama: 'Pendapatan Penjualan' },
  { kode: '5-1001', nama: 'Biaya Bahan Baku' },
  { kode: '5-2001', nama: 'Gaji & Upah' },
  { kode: '5-3001', nama: 'Tagihan Listrik' },
  { kode: '5-3099', nama: 'Biaya Lain-lain' },
  { kode: '2-1001', nama: 'Hutang Supplier' },
];

interface ManualLine { akun_kode: string; deskripsi: string; debit: string; kredit: string }

export default function JurnalUmum() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterTipe, setFilterTipe] = useState<string>('semua');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [manualLines, setManualLines] = useState<ManualLine[]>([
    { akun_kode: '', deskripsi: '', debit: '', kredit: '' },
    { akun_kode: '', deskripsi: '', debit: '', kredit: '' },
  ]);
  const [manualTgl, setManualTgl] = useState(new Date().toISOString().split('T')[0]);
  const [manualDesc, setManualDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const totalDebit  = manualLines.reduce((s, l) => s + (Number(l.debit)  || 0), 0);
  const totalKredit = manualLines.reduce((s, l) => s + (Number(l.kredit) || 0), 0);
  const isBalanced  = Math.abs(totalDebit - totalKredit) < 0.01 && totalDebit > 0;

  const addLine = () => setManualLines(l => [...l, { akun_kode: '', deskripsi: '', debit: '', kredit: '' }]);
  const removeLine = (i: number) => setManualLines(l => l.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: keyof ManualLine, val: string) =>
    setManualLines(l => l.map((row, idx) => idx === i ? { ...row, [field]: val } : row));

  const handleSave = async () => {
    if (!isBalanced) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    setSaving(false);
    setShowManual(false);
    setManualLines([
      { akun_kode: '', deskripsi: '', debit: '', kredit: '' },
      { akun_kode: '', deskripsi: '', debit: '', kredit: '' },
    ]);
    setManualDesc('');
  };

  const filtered = DUMMY_JURNAL.filter(j => {
    const matchSearch = j.deskripsi.toLowerCase().includes(search.toLowerCase()) || j.no_jurnal.includes(search);
    const matchTipe = filterTipe === 'semua' || j.ref_tipe === filterTipe;
    return matchSearch && matchTipe;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <button onClick={() => navigate('/accounting')} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 font-bold text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Akuntansi
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border border-indigo-100">
            <FileText className="w-3 h-3" /> Jurnal Transaksi
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Jurnal Transaksi</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-lg">Semua transaksi dicatat otomatis di sini. Tidak perlu input manual kecuali untuk koreksi.</p>
        </div>
        <button
          onClick={() => setShowManual(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 border border-rose-200 text-rose-700 font-bold rounded-xl hover:bg-rose-100 transition-colors"
        >
          <Plus className="w-4 h-4" /> Jurnal Koreksi Manual
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari keterangan atau no. jurnal..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
        <select
          value={filterTipe} onChange={e => setFilterTipe(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="semua">Semua Jenis</option>
          {Object.entries(REF_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Tabel Jurnal */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-4 px-5 font-black text-[10px] text-slate-400 uppercase tracking-widest">Tanggal</th>
                <th className="py-4 px-5 font-black text-[10px] text-slate-400 uppercase tracking-widest">No. Jurnal</th>
                <th className="py-4 px-5 font-black text-[10px] text-slate-400 uppercase tracking-widest">Keterangan</th>
                <th className="py-4 px-5 font-black text-[10px] text-slate-400 uppercase tracking-widest text-right">Jumlah</th>
                <th className="py-4 px-5 font-black text-[10px] text-slate-400 uppercase tracking-widest">Dibuat dari</th>
                <th className="py-4 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(j => {
                const meta = REF_LABEL[j.ref_tipe];
                const isOpen = expanded === j.id;
                return (
                  <React.Fragment key={j.id}>
                    <tr
                      className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => setExpanded(isOpen ? null : j.id)}
                    >
                      <td className="py-4 px-5 text-sm font-bold text-slate-700">{j.tanggal}</td>
                      <td className="py-4 px-5">
                        <span className="text-xs font-black text-indigo-600 font-mono">{j.no_jurnal}</span>
                      </td>
                      <td className="py-4 px-5 text-sm text-slate-700 max-w-xs">{j.deskripsi}</td>
                      <td className="py-4 px-5 text-right font-black text-slate-900">{formatRp(j.total_debit)}</td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black ${meta.color}`}>
                          {meta.icon} {meta.label}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr>
                        <td colSpan={6} className="bg-indigo-50/40 px-5 py-4 border-b border-indigo-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Detail Entri Jurnal</p>
                          <table className="w-full max-w-2xl text-sm">
                            <thead>
                              <tr className="text-left">
                                <th className="pb-2 font-black text-[10px] text-slate-400 uppercase tracking-wider pr-4">Kode Akun</th>
                                <th className="pb-2 font-black text-[10px] text-slate-400 uppercase tracking-wider flex-1">Nama Akun</th>
                                <th className="pb-2 font-black text-[10px] text-slate-400 uppercase tracking-wider text-right pr-4">Debit</th>
                                <th className="pb-2 font-black text-[10px] text-slate-400 uppercase tracking-wider text-right">Kredit</th>
                              </tr>
                            </thead>
                            <tbody>
                              {j.detail.map((d, i) => (
                                <tr key={i} className="border-t border-indigo-100">
                                  <td className="py-2 pr-4 font-mono text-xs text-indigo-600 font-black">{d.kode}</td>
                                  <td className="py-2 font-bold text-slate-700">{d.nama_tampil}</td>
                                  <td className="py-2 pr-4 text-right font-bold text-slate-900">{d.debit > 0 ? formatRp(d.debit) : '—'}</td>
                                  <td className="py-2 text-right font-bold text-slate-900">{d.kredit > 0 ? formatRp(d.kredit) : '—'}</td>
                                </tr>
                              ))}
                              <tr className="border-t-2 border-indigo-200">
                                <td colSpan={2} className="py-2 font-black text-slate-600">Total</td>
                                <td className="py-2 pr-4 text-right font-black text-emerald-700">{formatRp(j.total_debit)}</td>
                                <td className="py-2 text-right font-black text-emerald-700">{formatRp(j.total_kredit)}</td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Jurnal Manual */}
      {showManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowManual(false)} />
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl z-10 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900">✏️ Jurnal Koreksi Manual</h3>
                <p className="text-sm text-rose-600 font-medium mt-0.5">Gunakan hanya untuk koreksi. Transaksi normal dibuat otomatis.</p>
              </div>
              <button onClick={() => setShowManual(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tanggal</label>
                  <input type="date" value={manualTgl} onChange={e => setManualTgl(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-rose-400 focus:outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Keterangan</label>
                  <input value={manualDesc} onChange={e => setManualDesc(e.target.value)} placeholder="Tujuan koreksi..." className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-rose-400 focus:outline-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Baris Jurnal</label>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${isBalanced ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {isBalanced ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {isBalanced ? 'Balance ✓' : `Selisih: ${formatRp(Math.abs(totalDebit - totalKredit))}`}
                  </div>
                </div>
                <div className="space-y-2">
                  {manualLines.map((line, i) => (
                    <div key={i} className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-2 items-center">
                      <select value={line.akun_kode} onChange={e => updateLine(i, 'akun_kode', e.target.value)} className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-rose-400 focus:outline-none">
                        <option value="">Pilih Akun...</option>
                        {COA_OPTS.map(o => <option key={o.kode} value={o.kode}>{o.kode} — {o.nama}</option>)}
                      </select>
                      <input value={line.deskripsi} onChange={e => updateLine(i, 'deskripsi', e.target.value)} placeholder="Keterangan baris..." className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-rose-400 focus:outline-none" />
                      <input type="number" value={line.debit} onChange={e => updateLine(i, 'debit', e.target.value)} placeholder="Debit" className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm text-right focus:ring-2 focus:ring-rose-400 focus:outline-none" />
                      <input type="number" value={line.kredit} onChange={e => updateLine(i, 'kredit', e.target.value)} placeholder="Kredit" className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm text-right focus:ring-2 focus:ring-rose-400 focus:outline-none" />
                      {manualLines.length > 2 ? (
                        <button onClick={() => removeLine(i)} className="w-8 h-8 flex items-center justify-center text-rose-400 hover:bg-rose-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : <div className="w-8" />}
                    </div>
                  ))}
                </div>
                <button onClick={addLine} className="mt-2 flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700">
                  <Plus className="w-4 h-4" /> Tambah Baris
                </button>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowManual(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50">Batal</button>
              <button
                onClick={handleSave}
                disabled={!isBalanced || saving || !manualDesc}
                className="px-6 py-2.5 rounded-xl font-black text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</> : 'Simpan Jurnal Koreksi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
