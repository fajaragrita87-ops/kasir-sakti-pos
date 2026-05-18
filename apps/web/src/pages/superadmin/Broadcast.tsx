import React, { useState } from 'react';
import { Bell, Send, Clock, CheckCircle2, Users, Building2 } from 'lucide-react';

// ── Riwayat broadcast akan tersimpan di state lokal ────────
const HISTORY: { tgl: string; judul: string; target: string; dikirim: number; dibaca: number; status: string }[] = [];

const JENIS_OPTIONS = ['Informasi', 'Peringatan', 'Pembaruan Fitur', 'Promosi'];
const TARGET_OPTIONS = [
  { value: 'semua', label: 'Semua Toko' },
  { value: 'pro', label: 'Paket Pro' },
  { value: 'enterprise', label: 'Paket Enterprise' },
  { value: 'custom', label: 'Toko Tertentu' },
];

const JENIS_COLORS: Record<string, string> = {
  Informasi: 'bg-blue-50 text-blue-700 border-blue-200',
  Peringatan: 'bg-amber-50 text-amber-700 border-amber-200',
  'Pembaruan Fitur': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Promosi: 'bg-violet-50 text-violet-700 border-violet-200',
};

export default function Broadcast() {
  const [target, setTarget]   = useState('semua');
  const [judul, setJudul]     = useState('');
  const [pesan, setPesan]     = useState('');
  const [jenis, setJenis]     = useState('Informasi');
  const [jadwal, setJadwal]   = useState<'sekarang' | 'jadwal'>('sekarang');
  const [jadwalTime, setJadwalTime] = useState('');
  const [sent, setSent]       = useState(false);

  const handleSend = () => {
    if (!judul || !pesan) return;
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const charLeft = 500 - pesan.length;

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Super Admin</p>
        <h1 className="text-2xl font-light text-slate-900">Broadcast & Notifikasi</h1>
        <p className="text-slate-500 text-sm mt-1">Kirim pengumuman ke semua toko atau segmen tertentu</p>
      </div>

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Form */}
          <div className="xl:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">Buat Broadcast Baru</h2>

            {/* Target */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Penerima</label>
              <div className="grid grid-cols-2 gap-2">
                {TARGET_OPTIONS.map(t => (
                  <button key={t.value} onClick={() => setTarget(t.value)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all text-left ${
                      target === t.value
                        ? 'bg-[#1e6fbf] text-white border-[#1e6fbf]'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}>
                    {t.value === 'semua' ? <Users className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Jenis */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Jenis Notifikasi</label>
              <div className="flex flex-wrap gap-2">
                {JENIS_OPTIONS.map(j => (
                  <button key={j} onClick={() => setJenis(j)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase border transition-all ${
                      jenis === j ? JENIS_COLORS[j] : 'bg-white text-slate-500 border-slate-200'
                    }`}>
                    {j}
                  </button>
                ))}
              </div>
            </div>

            {/* Judul */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Judul Notifikasi</label>
              <input value={judul} onChange={e => setJudul(e.target.value)}
                placeholder="Contoh: Pembaruan Fitur Terbaru v3.3"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1e6fbf]" />
            </div>

            {/* Pesan */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Isi Pesan</label>
              <textarea value={pesan} onChange={e => setPesan(e.target.value.slice(0, 500))}
                placeholder="Tulis pesan Anda di sini..."
                rows={4}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1e6fbf] resize-none" />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-slate-400">Maks. 500 karakter</span>
                <span className={`text-[10px] font-bold ${charLeft < 50 ? 'text-rose-500' : 'text-slate-400'}`}>{charLeft} karakter tersisa</span>
              </div>
            </div>

            {/* Jadwal */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Waktu Pengiriman</label>
              <div className="flex gap-3">
                {(['sekarang', 'jadwal'] as const).map(j => (
                  <button key={j} onClick={() => setJadwal(j)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                      jadwal === j ? 'bg-[#1e6fbf] text-white border-[#1e6fbf]' : 'bg-white text-slate-600 border-slate-200'
                    }`}>
                    {j === 'sekarang' ? <Send className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    {j === 'sekarang' ? 'Kirim Sekarang' : 'Jadwalkan'}
                  </button>
                ))}
              </div>
              {jadwal === 'jadwal' && (
                <input type="datetime-local" value={jadwalTime} onChange={e => setJadwalTime(e.target.value)}
                  className="mt-3 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1e6fbf] w-full" />
              )}
            </div>

            {/* Submit */}
            {sent ? (
              <div className="w-full py-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-black text-sm uppercase flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Broadcast Berhasil Dikirim!
              </div>
            ) : (
              <button onClick={handleSend} disabled={!judul || !pesan}
                className="w-full py-3.5 bg-[#1e6fbf] hover:bg-[#1a5fa8] disabled:opacity-40 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2">
                <Bell className="w-5 h-5" /> Kirim Broadcast
              </button>
            )}
          </div>

          {/* Preview */}
          <div className="xl:col-span-2">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-6">
              <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-4">Preview Notifikasi</h2>
              <div className="bg-[#0f172a] rounded-2xl p-4">
                <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
                  <div className="w-9 h-9 bg-[#1e6fbf] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white text-xs font-black truncate">{judul || 'Judul Notifikasi...'}</p>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0 ${JENIS_COLORS[jenis]}`}>{jenis}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-3">
                      {pesan || 'Isi pesan akan tampil di sini...'}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-slate-500 text-[9px] font-mono">Kasir Sakti · Baru saja</p>
                      <span className="text-[9px] text-slate-400 uppercase font-bold">{TARGET_OPTIONS.find(t => t.value === target)?.label}</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-center text-[10px] text-slate-400 mt-3">Tampilan notifikasi di dalam aplikasi</p>
            </div>
          </div>
        </div>

        {/* Riwayat */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">Riwayat Broadcast</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Judul</th>
                  <th className="px-6 py-3">Target</th>
                  <th className="px-6 py-3 text-center">Dikirim ke</th>
                  <th className="px-6 py-3 text-center">Dibaca</th>
                  <th className="px-6 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {HISTORY.map((h, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3.5 text-slate-500 text-sm font-mono">{h.tgl}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-900 text-sm">{h.judul}</td>
                    <td className="px-6 py-3.5 text-slate-500 text-sm">{h.target}</td>
                    <td className="px-6 py-3.5 text-center font-bold text-slate-800">{h.dikirim}</td>
                    <td className="px-6 py-3.5 text-center text-slate-500">
                      {h.dibaca > 0 ? (
                        <span className="font-bold text-slate-800">{h.dibaca}</span>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        h.status === 'Terkirim' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
