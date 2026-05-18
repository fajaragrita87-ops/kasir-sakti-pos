import React, { useState } from 'react';
import { DollarSign, CheckCircle2, Clock, ChevronDown, X, Upload, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

type JenisPenerimaan = 'penjualan' | 'jasa' | 'lainnya';

interface Penerimaan {
  id: string;
  tanggal: string;
  jenis: JenisPenerimaan;
  jumlah: number;
  keterangan: string;
  dicatatOleh: string;
  status: 'posted';
}

const RIWAYAT_DUMMY: Penerimaan[] = [];

const JENIS_OPTS: { value: JenisPenerimaan; label: string; icon: string; desc: string }[] = [
  { value: 'penjualan', label: 'Hasil Penjualan', icon: '💰', desc: 'Uang dari penjualan produk/menu' },
  { value: 'jasa', label: 'Pendapatan Jasa', icon: '🤝', desc: 'Pembayaran untuk layanan/jasa' },
  { value: 'lainnya', label: 'Penerimaan Lainnya', icon: '📥', desc: 'Dana dari sumber lain' },
];

export default function TerimaDana() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const [jenis, setJenis] = useState<JenisPenerimaan>('penjualan');
  const [tanggal, setTanggal] = useState(today);
  const [jumlah, setJumlah] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [loading, setLoading] = useState(false);
  const [sukses, setSukses] = useState(false);
  const [riwayat] = useState<Penerimaan[]>(RIWAYAT_DUMMY);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jumlah || Number(jumlah) <= 0) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    setSukses(true);
    setTimeout(() => { setSukses(false); setJumlah(''); setKeterangan(''); }, 3000);
  };

  const jenisPilihan = JENIS_OPTS.find(j => j.value === jenis)!;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <button onClick={() => navigate('/accounting')} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 font-bold text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Akuntansi
      </button>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border border-emerald-100">
          <DollarSign className="w-3 h-3" /> Catat Penerimaan
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Catat Uang Masuk</h1>
        <p className="text-sm text-slate-500 mt-1">Catat setiap penerimaan dana. Jurnal akuntansi dibuat otomatis di balik layar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            {sukses && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-black text-emerald-800">Penerimaan berhasil dicatat!</p>
                  <p className="text-sm text-emerald-600">Jurnal akuntansi dibuat otomatis. Saldo kas diperbarui.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Jenis penerimaan */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Jenis Penerimaan</label>
                <div className="grid grid-cols-1 gap-2">
                  {JENIS_OPTS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setJenis(opt.value)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                        jenis === opt.value
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-2xl">{opt.icon}</span>
                      <div>
                        <p className={`font-black text-sm ${jenis === opt.value ? 'text-emerald-800' : 'text-slate-700'}`}>{opt.label}</p>
                        <p className="text-xs text-slate-500 font-medium">{opt.desc}</p>
                      </div>
                      {jenis === opt.value && <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tanggal */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tanggal Diterima</label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={e => setTanggal(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                  required
                />
              </div>

              {/* Jumlah */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Jumlah Diterima (Rp)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-lg">Rp</span>
                  <input
                    type="number"
                    value={jumlah}
                    onChange={e => setJumlah(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-2xl font-black text-slate-900"
                    required
                  />
                </div>
                {jumlah && Number(jumlah) > 0 && (
                  <p className="mt-1 text-sm text-emerald-600 font-bold">{formatRp(Number(jumlah))}</p>
                )}
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Keterangan / No. Referensi</label>
                <input
                  type="text"
                  value={keterangan}
                  onChange={e => setKeterangan(e.target.value)}
                  placeholder="Cth: Penjualan harian, Transfer dari pelanggan, dll"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                />
              </div>

              {/* Upload bukti */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Foto Bukti Transfer (Opsional)</label>
                <label className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all">
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-slate-500 font-medium">Klik untuk upload foto bukti</span>
                  <input type="file" accept="image/*" className="hidden" />
                </label>
              </div>

              {/* Info otomatis */}
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
                <span className="text-lg">⚙️</span>
                <p className="text-xs text-blue-700 font-medium leading-relaxed">
                  <span className="font-black">Dicatat otomatis:</span> Jurnal akuntansi double-entry akan dibuat otomatis.
                  Akun <strong>Kas</strong> akan bertambah dan dicatat sebagai <strong>{jenisPilihan.label}</strong>.
                  Anda tidak perlu paham debit/kredit.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !jumlah || Number(jumlah) <= 0}
                className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>
                ) : (
                  <><CheckCircle2 className="w-5 h-5" /> Catat Penerimaan Dana</>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Riwayat */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-black text-slate-900">Riwayat Penerimaan</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">7 hari terakhir</p>
            </div>
            <div className="divide-y divide-slate-100">
              {riwayat.map(r => (
                <div key={r.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                      r.jenis === 'penjualan' ? 'bg-emerald-50 text-emerald-600' :
                      r.jenis === 'jasa' ? 'bg-blue-50 text-blue-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {r.jenis === 'penjualan' ? '💰 Penjualan' : r.jenis === 'jasa' ? '🤝 Jasa' : '📥 Lainnya'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{r.tanggal}</span>
                  </div>
                  <p className="font-black text-slate-900 text-base">{formatRp(r.jumlah)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{r.keterangan}</p>
                  <p className="text-[10px] text-slate-400 mt-1">oleh {r.dicatatOleh}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Total bulan ini */}
          <div className="mt-4 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl p-5 text-white">
            <p className="text-emerald-100 text-xs font-black uppercase tracking-widest mb-1">Total Diterima Bulan Ini</p>
            <p className="text-3xl font-black">{formatRp(riwayat.reduce((s, r) => s + r.jumlah, 0))}</p>
            <div className="mt-3 pt-3 border-t border-emerald-500">
              <div className="flex items-center gap-2 text-emerald-100">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-bold">Semua penerimaan tercatat</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
