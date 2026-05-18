import React, { useState } from 'react';
import {
  Settings, Store, Globe, Bell, Printer, Palette,
  CreditCard, MapPin, Phone, Mail, Clock, Wifi,
  Save, ChevronRight, Check, AlertCircle, Monitor,
  Receipt, User, Lock, Shield, Blocks, ExternalLink, RefreshCw, Trash2, Database
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { generateSecureToken } from '../../lib/security';

type Tab = 'OUTLET' | 'STRUK' | 'NOTIF' | 'PAJAK' | 'APPEARANCE' | 'SECURITY' | 'APPMARKET' | 'INTEGRATION';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('OUTLET');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">Pengaturan Umum</h1>
          <p className="text-slate-500 font-medium mt-1">Konfigurasi outlet, struk, pajak, dan tampilan sistem Anda.</p>
        </div>
        <button
          onClick={handleSave}
          className={`px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 transition-all ${saved ? 'bg-emerald-500 text-white' : 'btn-primary'}`}
        >
          {saved ? <><Check className="w-4 h-4" /> Tersimpan!</> : <><Save className="w-4 h-4" /> Simpan Perubahan</>}
        </button>
      </header>

      <div className="flex gap-8">
        {/* Sidebar Nav */}
        <div className="w-64 flex-shrink-0 space-y-2">
          {([
            { key: 'OUTLET', label: 'Info Outlet', icon: <Store className="w-5 h-5" /> },
            { key: 'STRUK', label: 'Format Struk', icon: <Receipt className="w-5 h-5" /> },
            { key: 'NOTIF', label: 'Notifikasi', icon: <Bell className="w-5 h-5" /> },
            { key: 'PAJAK', label: 'Pajak & Biaya', icon: <CreditCard className="w-5 h-5" /> },
            { key: 'APPEARANCE', label: 'Tampilan', icon: <Palette className="w-5 h-5" /> },
            { key: 'SECURITY', label: 'Keamanan', icon: <Shield className="w-5 h-5" /> },
            { key: 'APPMARKET', label: 'App Market', icon: <Blocks className="w-5 h-5" /> },
            { key: 'INTEGRATION', label: 'Integrasi & API', icon: <Globe className="w-5 h-5" /> },
          ] as { key: Tab, label: string, icon: React.ReactNode }[]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab === tab.key ? ((tab.key as string) === 'SUPERADMIN' ? 'bg-rose-600 text-white shadow-xl shadow-rose-500/20' : 'bg-blue-600 text-white shadow-xl') : ((tab.key as string) === 'SUPERADMIN' ? 'text-rose-500 hover:bg-rose-50' : 'text-slate-500 hover:bg-white hover:shadow-lg')}`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.key && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'OUTLET' && <OutletSettings />}
          {activeTab === 'STRUK' && <StrukSettings />}
          {activeTab === 'NOTIF' && <NotifSettings />}
          {activeTab === 'PAJAK' && <TaxSettings />}
          { activeTab === 'APPEARANCE' && <AppearanceSettings /> }
          { activeTab === 'SECURITY' && <SecuritySettings /> }
          { activeTab === 'APPMARKET' && <AppMarketSettings /> }
          { activeTab === 'INTEGRATION' && <IntegrationSettings /> }
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-xl border-0 mb-6">
      <h3 className="font-black text-slate-900 uppercase tracking-tight mb-6 text-lg border-b border-slate-50 pb-4">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, desc, defaultVal }: { label: string, desc?: string, defaultVal?: boolean }) {
  const [on, setOn] = useState(defaultVal ?? false);
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
      <div>
        <p className="font-bold text-slate-800 text-sm">{label}</p>
        {desc && <p className="text-xs text-slate-400 font-medium mt-0.5">{desc}</p>}
      </div>
      <button onClick={() => setOn(p => !p)} className={`w-14 h-7 rounded-full transition-all flex items-center px-1 ${on ? 'bg-primary' : 'bg-slate-200'}`}>
        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-7' : 'translate-x-0'}`}></div>
      </button>
    </div>
  );
}

function OutletSettings() {
  return (
    <div>
      <SectionCard title="Informasi Outlet">
        <div className="grid grid-cols-2 gap-5">
          <Field label="Nama Outlet">
            <input type="text" defaultValue="Warung Sakti" className="input-field w-full" />
          </Field>
          <Field label="Tipe Bisnis">
            <select className="input-field w-full">
              <option>Restoran / Warung Makan</option>
              <option>Kafe / Coffee Shop</option>
              <option>Toko Retail</option>
              <option>Minimarket</option>
              <option>Jasa & Layanan</option>
              <option>Salon / Barbershop</option>
            </select>
          </Field>
          <Field label="No. Telepon Outlet">
            <div className="flex gap-2">
              <div className="input-field px-4 font-bold text-slate-500 flex items-center">+62</div>
              <input type="tel" defaultValue="8123456789" className="input-field flex-1" />
            </div>
          </Field>
          <Field label="Email Outlet">
            <input type="email" defaultValue="warung@outlet.id" className="input-field w-full" />
          </Field>
          <Field label="Alamat Lengkap">
            <textarea rows={2} defaultValue="Jl. Merdeka No. 1, Jakarta Pusat" className="input-field w-full resize-none" />
          </Field>
          <Field label="Kota / Kabupaten">
            <input type="text" defaultValue="Jakarta Pusat" className="input-field w-full" />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Jam Operasional">
        <div className="space-y-3">
          {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(day => (
            <div key={day} className="flex items-center gap-4">
              <div className="w-24 font-bold text-slate-600 text-sm">{day}</div>
              <div className="flex items-center gap-3">
                <input type="time" defaultValue="08:00" className="input-field px-3 py-2 text-sm" />
                <span className="text-slate-400 font-bold">—</span>
                <input type="time" defaultValue="22:00" className="input-field px-3 py-2 text-sm" />
              </div>
              <label className="flex items-center gap-2 ml-auto cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded" />
                <span className="text-xs font-bold text-slate-500">Buka</span>
              </label>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function StrukSettings() {
  return (
    <div>
      <SectionCard title="Header & Footer Struk">
        <Field label="Nama di Struk">
          <input type="text" defaultValue="WARUNG SAKTI" className="input-field w-full" />
        </Field>
        <Field label="Tagline / Slogan">
          <input type="text" defaultValue="Makan Enak, Harga Bersahabat!" className="input-field w-full" />
        </Field>
        <Field label="Pesan Footer Struk">
          <textarea rows={2} defaultValue="Terima kasih sudah mampir! Follow kami di @warungsakti" className="input-field w-full resize-none" />
        </Field>
        <Field label="No. NPWP (Opsional)">
          <input type="text" placeholder="Kosongkan jika tidak ada" className="input-field w-full" />
        </Field>
      </SectionCard>

      <SectionCard title="Opsi Cetak">
        <Toggle label="Cetak Otomatis Setelah Transaksi" desc="Struk langsung dicetak tanpa konfirmasi" defaultVal={true} />
        <Toggle label="Tampilkan Logo di Struk" defaultVal={true} />
        <Toggle label="Tampilkan Watermark VISTRAL POS" desc="Wajib sesuai Patch 14 — tidak bisa dinonaktifkan" defaultVal={true} />
        <Toggle label="Cetak Nomor Antrian" desc="Untuk bisnis dengan antrian" />
        <Toggle label="Struk Digital via WhatsApp" desc="Kirim struk ke pelanggan otomatis" />
        <Field label="Ukuran Struk">
          <select className="input-field w-full">
            <option>58mm (Mini Printer)</option>
            <option>80mm (Standar)</option>
            <option>A5 (Digital)</option>
          </select>
        </Field>
      </SectionCard>
    </div>
  );
}

function NotifSettings() {
  return (
    <SectionCard title="Pengaturan Notifikasi">
      <Toggle label="Notifikasi WhatsApp Laporan Harian" desc="Terima ringkasan omzet harian otomatis pukul 23:59" defaultVal={true} />
      <Toggle label="Alert Stok Menipis" desc="Notifikasi saat stok produk di bawah batas minimum" defaultVal={true} />
      <Toggle label="Alert Pembatalan Pesanan (VOID)" desc="Pemberitahuan langsung saat kasir membatalkan transaksi" defaultVal={true} />
      <Toggle label="Alert Diskon Manual" desc="Notifikasi saat kasir memberikan diskon di luar kebijakan" defaultVal={true} />
      <Toggle label="Notifikasi Pesanan Anti-Antri Masuk" desc="Bunyi alarm saat ada pesanan baru dari QR table" />
      <Toggle label="Laporan Mingguan ke Email" defaultVal={false} />

      <div className="mt-6 pt-6 border-t border-slate-100">
        <Field label="No. WhatsApp Penerima Laporan">
          <input type="tel" defaultValue="628123456789" className="input-field w-full" placeholder="628xxxxxxxxx" />
        </Field>
        <Field label="Email Penerima Laporan">
          <input type="email" defaultValue="owner@warungsakti.id" className="input-field w-full" />
        </Field>
      </div>
    </SectionCard>
  );
}

function TaxSettings() {
  return (
    <div>
      <SectionCard title="Pajak Pertambahan Nilai (PPN)">
        <Toggle label="Aktifkan PPN" desc="Tambahkan PPN 11% ke setiap transaksi" />
        <Field label="Persentase PPN (%)">
          <input type="number" defaultValue="11" className="input-field w-40" />
        </Field>
        <Toggle label="Harga Sudah Termasuk PPN (Inclusive)" desc="Harga produk sudah mencakup PPN" defaultVal />
      </SectionCard>

      <SectionCard title="Biaya Layanan Platform">
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-amber-800">Biaya layanan dibebankan ke pelanggan dan bukan mengurangi omzet Anda. Transparansi penuh sesuai Patch 11.</p>
          </div>
        </div>
        <Toggle label="Biaya Layanan QRIS (Rp 200)" desc="Dibebankan ke pelanggan saat bayar via QRIS" defaultVal={true} />
        <Toggle label="Biaya Layanan Anti-Antri (Rp 1.000)" desc="Dibebankan ke pelanggan saat pesan via QR Table" defaultVal={true} />
      </SectionCard>

      <SectionCard title="Diskon & Promosi">
        <Toggle label="Izinkan Diskon Manual oleh Kasir" desc="Kasir bisa input diskon nominal saat checkout" />
        <Field label="Batas Maksimal Diskon Kasir (%)">
          <input type="number" defaultValue="10" className="input-field w-40" />
        </Field>
        <Toggle label="Diskon Pelanggan Loyal Otomatis" desc="Berikan diskon 5% untuk pelanggan dengan 10+ transaksi" defaultVal={true} />
      </SectionCard>
    </div>
  );
}

function AppearanceSettings() {
  const [color, setColor] = useState('#8B5CF6');
  const [darkMode, setDarkMode] = useState(false);
  return (
    <SectionCard title="Tampilan Antarmuka">
      <Field label="Warna Tema Utama">
        <div className="flex gap-3 flex-wrap">
          {['#8B5CF6', '#6366F1', '#EC4899', '#10B981', '#F59E0B', '#EF4444'].map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{ backgroundColor: c }}
              className={`w-10 h-10 rounded-full transition-all ${color === c ? 'ring-4 ring-offset-2 ring-current scale-110' : 'hover:scale-105'}`}
            />
          ))}
          <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 rounded-full cursor-pointer border-2 border-slate-200" />
        </div>
      </Field>
      <Toggle label="Mode Gelap (Dark Mode)" desc="Tampilan lebih nyaman di malam hari (Beta)" />
      <Toggle label="Animasi & Efek Visual" desc="Matikan untuk performa lebih baik di perangkat lama" defaultVal={true} />
      <Field label="Bahasa Antarmuka">
        <select className="input-field w-full">
          <option>Bahasa Indonesia</option>
          <option>English</option>
        </select>
      </Field>
      <Field label="Format Tanggal">
        <select className="input-field w-full">
          <option>DD/MM/YYYY (07/05/2026)</option>
          <option>MM/DD/YYYY (05/07/2026)</option>
        </select>
      </Field>
    </SectionCard>
  );
}

function SecuritySettings() {
  return (
    <div>
      <SectionCard title="Keamanan Akun">
        <Toggle label="Autentikasi Dua Faktor (2FA)" desc="Tambah lapisan keamanan ekstra saat login" />
        <Toggle label="PIN Kasir untuk Void" desc="Wajib input PIN sebelum membatalkan transaksi" defaultVal={true} />
        <Toggle label="PIN Kasir untuk Diskon > 10%" desc="Wajib approval Owner untuk diskon besar" defaultVal={true} />
        <Toggle label="Auto Logout Tidak Aktif (15 menit)" defaultVal={true} />
        <Toggle label="Log Semua Aktivitas Login" defaultVal={true} />
      </SectionCard>
      <SectionCard title="Ubah Password">
        <Field label="Password Saat Ini">
          <input type="password" className="input-field w-full" placeholder="••••••••" />
        </Field>
        <Field label="Password Baru">
          <input type="password" className="input-field w-full" placeholder="Min. 8 karakter, sertakan angka & simbol" />
        </Field>
        <Field label="Konfirmasi Password Baru">
          <input type="password" className="input-field w-full" placeholder="••••••••" />
        </Field>
        <button className="btn-primary px-8 py-3 mt-2">Ubah Password</button>
      </SectionCard>
    </div>
  );
}

function AppMarketSettings() {
  const { user, setAuth } = useAuthStore();
  const features = user?.enabledFeatures || [];

  const toggleFeature = (feat: string) => {
    if (!user) return;
    const newFeatures = features.includes(feat) 
      ? features.filter(f => f !== feat)
      : [...features, feat];
    
    // update user context with new secure token
    setAuth({ ...user, enabledFeatures: newFeatures }, generateSecureToken());
  };

  const modules = [
    { key: 'POS', label: 'Kasir (POS)', desc: 'Modul kasir utama untuk memproses transaksi penjualan.', required: true },
    { key: 'INVENTORY', label: 'Manajemen Inventori & Stok', desc: 'Dilengkapi dengan Stock Opname Real-Time & HPP otomatis.' },
    { key: 'PURCHASE_ORDER', label: 'Sistem PO & Supplier', desc: 'Manajemen pengadaan barang dan tagihan supplier terintegrasi.' },
    { key: 'ANTI_ANTRI', label: 'QR Order (Anti-Antri)', desc: 'Pelanggan bisa pesan dari meja melalui scan QR.' },
    { key: 'CRM', label: 'Pelanggan (CRM)', desc: 'Database pelanggan untuk analisis dan pemasaran.' },
    { key: 'LOYALTY', label: 'Loyalty Program', desc: 'Beri poin dan hadiah untuk mempertahankan pelanggan.' },
    { key: 'DEBT', label: 'Buku Piutang / Kasbon', desc: 'Catat pelanggan yang berhutang dan kelola pembayaran.' },
    { key: 'HRD', label: 'HRD & Payroll', desc: 'Absensi karyawan (selfie + GPS) dan penggajian.' },
    { key: 'ACCOUNTING', label: 'Akuntansi & Keuangan', desc: 'Sistem akuntansi ganda, manajemen aset, dan kas.' },
    { key: 'ONLINE_ORDER', label: 'Integrasi E-Commerce & Pesanan Online', desc: 'Sinkronisasi otomatis dengan ShopeeFood, GrabFood, & WA.' },
    { key: 'KDS', label: 'Kitchen Display System', desc: 'Tampilan pesanan khusus untuk dapur.' },
    { key: 'BILLING', label: 'Koin & Billing', desc: 'Manajemen langganan dan pembelian koin sakti.', required: true },
  ];

  return (
    <SectionCard title="App Market (Kelola Fitur)">
      <p className="text-sm text-slate-500 mb-6 font-medium">Aktifkan atau nonaktifkan modul sesuai kebutuhan bisnis Anda. Tampilan menu akan menyesuaikan modul yang aktif untuk menjaga kebersihan UI.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map(mod => {
          const isOn = features.includes(mod.key) || mod.required;
          return (
            <div key={mod.key} className={`p-5 border ${isOn ? 'border-primary/20 bg-white' : 'border-slate-100 bg-slate-50/50'} rounded-3xl flex flex-col justify-between hover:shadow-lg transition-all`}>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-black uppercase tracking-tight ${isOn ? 'text-slate-900' : 'text-slate-500'}`}>{mod.label}</h4>
                  <button 
                    disabled={mod.required}
                    onClick={() => toggleFeature(mod.key)} 
                    className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${isOn ? 'bg-primary' : 'bg-slate-300'} ${mod.required ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${isOn ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{mod.desc}</p>
              </div>
              {mod.required ? (
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest bg-amber-50 self-start px-3 py-1 rounded-full border border-amber-200">Modul Inti</span>
              ) : isOn ? (
                <span className="text-[10px] font-black uppercase text-primary tracking-widest bg-primary/10 self-start px-3 py-1 rounded-full">Aktif</span>
              ) : (
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest bg-slate-200 self-start px-3 py-1 rounded-full">Nonaktif</span>
              )}
            </div>
          )
        })}
      </div>
    </SectionCard>
  );
}

function IntegrationSettings() {
  return (
    <div>
      <SectionCard title="Integrasi Payment Gateway">
        <div className="flex items-start gap-4 p-5 border-2 border-[#0E1E40] bg-[#0E1E40]/5 rounded-3xl mb-6">
          <div className="w-16 h-16 bg-[#0E1E40] text-white rounded-2xl flex items-center justify-center flex-shrink-0 font-black tracking-widest text-xl">
            xendit
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-black text-slate-900 uppercase tracking-tight text-lg">Xendit Payment</h4>
                <p className="text-sm text-slate-500 font-medium">Terima pembayaran QRIS Dinamis, OVO, DANA, dan VA.</p>
              </div>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-200">TERHUBUNG (LIVE)</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase">MDR QRIS Dinamis</p>
                <p className="font-bold text-slate-800 text-sm">0.7% per transaksi</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase">MDR E-Wallet</p>
                <p className="font-bold text-slate-800 text-sm">1.5% per transaksi</p>
              </div>
            </div>
          </div>
        </div>

        <Toggle label="Bebankan Biaya MDR ke Pelanggan" desc="Total tagihan pelanggan akan ditambahkan persenan MDR otomatis" defaultVal={true} />
        <Toggle label="Pencairan Dana Otomatis (H+1)" desc="Dana masuk ke rekening toko Anda setiap pagi hari kerja" defaultVal={true} />
      </SectionCard>

      <SectionCard title="Integrasi Lainnya">
        <Toggle label="WhatsApp Gateway (Fonnte/Watzap)" desc="Untuk kirim OTP dan struk digital otomatis" defaultVal={true} />
        <Toggle label="GrabFood / GoFood (Coming Soon)" desc="Tarik pesanan online langsung ke POS" defaultVal={false} />
      </SectionCard>
    </div>
  );
}

// SuperAdminSettings dipindah ke /superadmin (SuperAdminPage.tsx)
