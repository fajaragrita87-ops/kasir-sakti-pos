import React, { useState } from 'react';
import { Save, CheckCircle2, AlertCircle, Mail, RefreshCw } from 'lucide-react';

// ── Pengaturan lokal (belum terhubung ke Supabase) ─────────────
type TabType = 'umum' | 'api' | 'email' | 'maintenance';

export default function PengaturanSistem() {
  const [tab, setTab] = useState<TabType>('umum');
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    namaApp: 'Kasir Sakti POS',
    urlApp: 'https://kasirsakti.id',
    emailSupport: 'support@kasirsakti.id',
    waSupport: '628123456789',
    textFooter: '© 2026 Kasir Sakti. Platform Kasir UMKM Indonesia.',
    maintenanceMode: false,
    registrasiBuka: true,
    modeDemo: false,
    maintenanceMsg: 'Sistem sedang dalam pemeliharaan. Akan kembali dalam 2 jam.',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const TABS: { id: TabType; label: string }[] = [
    { id: 'umum', label: 'Umum' },
    { id: 'api', label: 'API & Integrasi' },
    { id: 'email', label: 'Email' },
    { id: 'maintenance', label: 'Maintenance' },
  ];

  const Toggle = ({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <button onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors ${value ? 'bg-[#1e6fbf]' : 'bg-slate-300'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-7' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Super Admin</p>
        <h1 className="text-2xl font-light text-slate-900">Pengaturan Sistem</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-8">
        <div className="flex gap-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-3.5 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
                tab === t.id ? 'border-[#1e6fbf] text-[#1e6fbf]' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        {/* TAB UMUM */}
        {tab === 'umum' && (
          <div className="max-w-2xl space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">Pengaturan Global</h2>
              {[
                { label: 'Nama Aplikasi', key: 'namaApp', type: 'text' },
                { label: 'URL Aplikasi', key: 'urlApp', type: 'url' },
                { label: 'Email Support', key: 'emailSupport', type: 'email' },
                { label: 'Nomor WhatsApp Support', key: 'waSupport', type: 'tel' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{f.label}</label>
                  <input type={f.type} value={(settings as any)[f.key]}
                    onChange={e => setSettings({ ...settings, [f.key]: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1e6fbf]" />
                </div>
              ))}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Teks Footer Landing Page</label>
                <textarea value={settings.textFooter} onChange={e => setSettings({ ...settings, textFooter: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1e6fbf] resize-none" rows={2} />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-3">Mode Sistem</h2>
              <Toggle value={settings.maintenanceMode} onChange={v => setSettings({ ...settings, maintenanceMode: v })} label="Mode Maintenance (semua user dapat halaman maintenance)" />
              <Toggle value={settings.registrasiBuka} onChange={v => setSettings({ ...settings, registrasiBuka: v })} label="Registrasi Baru Dibuka" />
              <Toggle value={settings.modeDemo} onChange={v => setSettings({ ...settings, modeDemo: v })} label="Mode Demo (tampilkan data dummy)" />
            </div>

            <button onClick={handleSave}
              className="flex items-center gap-2 bg-[#1e6fbf] hover:bg-[#1a5fa8] text-white font-black text-sm uppercase px-6 py-3 rounded-xl transition-colors">
              {saved ? <><CheckCircle2 className="w-4 h-4" /> Tersimpan!</> : <><Save className="w-4 h-4" /> Simpan Perubahan</>}
            </button>
          </div>
        )}

        {/* TAB API */}
        {tab === 'api' && (
          <div className="max-w-2xl space-y-5">
            {/* Supabase */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">Supabase (Database & Auth)</h2>
                <div className="flex items-center gap-2 text-xs font-black text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  ✅ Terhubung
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Project URL</label>
                  <input type="text" value="Dikonfigurasi via .env.local" readOnly
                    className="w-full border border-slate-100 bg-slate-50 rounded-xl px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed" />
                </div>
                <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Database & Auth: OK
                </div>
              </div>
            </div>

            {/* Xendit - Coming Soon */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">Xendit (Payment Gateway)</h2>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase bg-slate-100 text-slate-500 border border-slate-200">
                  Segera Hadir
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-4">Integrasi pembayaran otomatis untuk top-up koin. Saat ini top-up dilakukan manual oleh Super Admin melalui menu Kelola User.</p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs font-bold text-amber-700">💡 Sementara belum ada payment gateway, gunakan menu <strong>Kelola User → Tambah Koin</strong> untuk injek koin manual setelah merchant transfer.</p>
              </div>
            </div>

            {/* WhatsApp API - Coming Soon */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">WhatsApp API (Notifikasi)</h2>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase bg-slate-100 text-slate-500 border border-slate-200">
                  Segera Hadir
                </span>
              </div>
              <p className="text-sm text-slate-500">Kirim notifikasi otomatis ke merchant via WhatsApp (registrasi baru, top-up berhasil, dll).</p>
            </div>
          </div>
        )}

        {/* TAB EMAIL */}
        {tab === 'email' && (
          <div className="max-w-2xl space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">Konfigurasi SMTP</h2>
              {[
                { label: 'SMTP Host', placeholder: 'smtp.gmail.com' },
                { label: 'SMTP Port', placeholder: '587' },
                { label: 'Username', placeholder: 'noreply@kasirsakti.id' },
                { label: 'Password', placeholder: '••••••••', type: 'password' },
                { label: 'From Name', placeholder: 'Kasir Sakti' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{f.label}</label>
                  <input type={f.type ?? 'text'} placeholder={f.placeholder}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1e6fbf]" />
                </div>
              ))}
              <button className="flex items-center gap-2 bg-[#1e6fbf] text-white text-xs font-black uppercase px-4 py-2.5 rounded-xl hover:bg-[#1a5fa8] transition-colors">
                <Mail className="w-4 h-4" /> Kirim Email Test
              </button>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-3">Template Email</h2>
              <div className="space-y-2">
                {['Selamat Datang (Welcome)', 'Reset Password', 'Invoice Pembayaran', 'Broadcast Massal'].map(t => (
                  <div key={t} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                    <span className="text-sm text-slate-700 font-medium">{t}</span>
                    <button className="text-[#1e6fbf] text-xs font-black uppercase hover:underline">Edit Template</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB MAINTENANCE */}
        {tab === 'maintenance' && (
          <div className="max-w-2xl space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">Mode Maintenance</h2>
                <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase ${settings.maintenanceMode ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {settings.maintenanceMode ? 'Maintenance ON' : 'Sistem Normal'}
                </div>
              </div>
              <Toggle value={settings.maintenanceMode} onChange={v => setSettings({ ...settings, maintenanceMode: v })} label="Aktifkan mode maintenance" />
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Pesan Maintenance</label>
                <textarea value={settings.maintenanceMsg} onChange={e => setSettings({ ...settings, maintenanceMsg: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1e6fbf] resize-none" rows={3} />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">Log Error Terakhir</h2>
                <button className="text-slate-400 hover:text-slate-700 transition-colors"><RefreshCw className="w-4 h-4" /></button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-5 py-3">Timestamp</th>
                      <th className="px-5 py-3">Level</th>
                      <th className="px-5 py-3">Route</th>
                      <th className="px-5 py-3">Pesan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-slate-400 font-bold text-sm">Tidak ada log error terbaru</td>
                    </tr>
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
