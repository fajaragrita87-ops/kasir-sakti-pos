import React, { useState } from 'react';
import {
  BookOpen, ShoppingCart, Package, Users, BarChart3, Calculator,
  Utensils, Crown, Globe, Settings, Zap, ChevronDown, ChevronRight,
  Smartphone, FileText, Shield, DollarSign, Clock, Star, HelpCircle,
  CheckCircle2, ArrowRight, Search, MessageCircle, Heart
} from 'lucide-react';

const MODULES = [
  {
    id: 'pos',
    icon: <ShoppingCart className="w-5 h-5" />,
    color: 'bg-indigo-600',
    lightColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    title: 'POS (Point of Sale) / Kasir',
    badge: 'INTI',
    badgeColor: 'bg-indigo-100 text-indigo-600',
    steps: [
      { step: '1', title: 'Buka Menu Kasir', desc: 'Klik ikon "POS/Kasir" di sidebar kiri untuk masuk ke layar transaksi.' },
      { step: '2', title: 'Pilih Produk', desc: 'Klik produk atau ketik nama/SKU di kolom pencarian. Produk otomatis masuk ke keranjang.' },
      { step: '3', title: 'Atur Kuantitas', desc: 'Gunakan tombol + / – pada keranjang untuk mengubah jumlah item.' },
      { step: '4', title: 'Terapkan Diskon', desc: 'Klik tombol "Diskon" untuk memasukkan persen atau nominal potongan harga.' },
      { step: '5', title: 'Pilih Metode Bayar', desc: 'Pilih antara: Tunai, QRIS, Kartu Debit, atau Piutang (Hutang).' },
      { step: '6', title: 'Selesaikan Transaksi', desc: 'Klik "Proses Pembayaran". Struk otomatis tersedia dan stok langsung berkurang.' },
    ],
    tips: ['Tekan Enter untuk pencarian cepat', 'Gunakan Numpad untuk input nominal tunai', 'Shift+P untuk shortcut buka POS'],
  },
  {
    id: 'inventory',
    icon: <Package className="w-5 h-5" />,
    color: 'bg-indigo-500',
    lightColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    title: 'Manajemen Produk & Inventori',
    badge: 'INTI',
    badgeColor: 'bg-indigo-100 text-indigo-600',
    steps: [
      { step: '1', title: 'Tambah Produk Baru', desc: 'Klik "Tambah Produk Baru" → isi Nama, Harga Jual, HPP, dan Stok.' },
      { step: '2', title: 'Upload Foto Produk', desc: 'Klik area foto untuk upload gambar. Foto tampil di menu dan POS.' },
      { step: '3', title: 'Atur Kategori', desc: 'Klik "Kelola Kategori" untuk menambah/menghapus kategori produk sesuai bisnis.' },
      { step: '4', title: 'Resep / BOM', desc: 'Aktifkan toggle "Resep/BOM" jika produk terbuat dari bahan baku. Stok bahan baku akan berkurang otomatis saat terjual.' },
      { step: '5', title: 'Pantau Stok', desc: 'Kartu produk berwarna merah = Habis, kuning = Hampir habis. Segera isi ulang.' },
    ],
    tips: ['Margin keuntungan ditampilkan otomatis saat mengisi HPP', 'Aktifkan/nonaktifkan produk tanpa menghapusnya'],
  },
  {
    id: 'hrd',
    icon: <Users className="w-5 h-5" />,
    color: 'bg-indigo-600',
    lightColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    title: 'HRD & Payroll Karyawan',
    badge: 'PREMIUM',
    badgeColor: 'bg-violet-100 text-violet-600',
    steps: [
      { step: '1', title: 'Daftarkan Karyawan', desc: 'Tab "Data Karyawan" → "Tambah Karyawan" → isi nama, jabatan, gaji pokok, rekening bank.' },
      { step: '2', title: 'Absensi Harian', desc: 'Tab "Absensi" → klik "Absen Masuk (Live)" untuk validasi selfie + GPS secara real-time.' },
      { step: '3', title: 'Kelola Izin & Cuti', desc: 'Tab "Izin & Cuti" → review pengajuan → klik ✓ untuk setuju atau ✗ untuk tolak.' },
      { step: '4', title: 'Hitung Payroll', desc: 'Tab "Payroll" → sistem otomatis hitung gaji bersih, BPJS Kesehatan & Ketenagakerjaan sesuai UU Cipta Kerja.' },
      { step: '5', title: 'Kirim Slip Gaji', desc: 'Klik "Kirim via WA" pada kartu karyawan untuk mengirim slip gaji langsung ke WhatsApp.' },
    ],
    tips: ['BPJS dihitung otomatis sesuai PP 44/2015', 'THR otomatis = 1 bulan gaji (masa kerja ≥ 12 bln)'],
  },
  {
    id: 'accounting',
    icon: <Calculator className="w-5 h-5" />,
    color: 'bg-indigo-600',
    lightColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    title: 'Akuntansi & Pembukuan',
    badge: 'PREMIUM',
    badgeColor: 'bg-violet-100 text-violet-600',
    steps: [
      { step: '1', title: 'Catat Jurnal Manual', desc: 'Klik "Jurnal Manual" → pilih Tipe (Pengeluaran/Pemasukan) → isi kategori, keterangan, dan nominal.' },
      { step: '2', title: 'Tambah Aset', desc: 'Klik "Tambah Aset" → isi nama, kategori, harga beli, dan umur ekonomis. Penyusutan dihitung otomatis.' },
      { step: '3', title: 'Lihat Laporan', desc: 'Tab "Laporan Lengkap" → klik kartu laporan (Laba Rugi, Neraca, Arus Kas) untuk melihat detail.' },
      { step: '4', title: 'Ringkasan Eksekutif', desc: 'Tab pertama menampilkan grafik arus kas, total aset, dan rasio keuangan bisnis secara visual.' },
      { step: '5', title: 'Download Laporan', desc: 'Di dalam pop-up laporan, klik "Download PDF / Excel" untuk menyimpan atau mencetak.' },
    ],
    tips: ['Sistem mencatat double-entry otomatis — Anda tidak perlu paham akuntansi', 'Kategori "Lain-lain" tersedia jika tidak ada yang cocok'],
  },
  {
    id: 'kds',
    icon: <Utensils className="w-5 h-5" />,
    color: 'bg-rose-500',
    lightColor: 'bg-rose-50 text-rose-600 border-rose-200',
    title: 'Kitchen Display System (KDS)',
    badge: 'PREMIUM',
    badgeColor: 'bg-rose-100 text-rose-600',
    steps: [
      { step: '1', title: 'Aktifkan di App Market', desc: 'Menu Pengaturan → App Market → aktifkan "Kitchen Display System" (28 koin/bulan).' },
      { step: '2', title: 'Buka Layar Dapur', desc: 'Menu "Kitchen Display" muncul di sidebar. Buka di layar/tablet khusus dapur.' },
      { step: '3', title: 'Terima Pesanan', desc: 'Pesanan dari kasir muncul otomatis sebagai kartu. Urutan berdasarkan waktu masuk.' },
      { step: '4', title: 'Update Status', desc: 'Klik "Masak" → "Siap" → pesanan hilang dari antrian dan kasir mendapat notifikasi.' },
    ],
    tips: ['Pasang di layar TV atau tablet terpisah di dapur', 'Ada timer peringatan jika pesanan terlalu lama'],
  },
  {
    id: 'loyalty',
    icon: <Crown className="w-5 h-5" />,
    color: 'bg-amber-500',
    lightColor: 'bg-amber-50 text-amber-600 border-amber-200',
    title: 'Loyalty Program',
    badge: 'PREMIUM',
    badgeColor: 'bg-amber-100 text-amber-600',
    steps: [
      { step: '1', title: 'Aktifkan Modul', desc: 'Pengaturan → App Market → aktifkan "Loyalty Program".' },
      { step: '2', title: 'Daftarkan Pelanggan', desc: 'Di menu Pelanggan, tambahkan data pelanggan. Mereka otomatis masuk program poin.' },
      { step: '3', title: 'Poin Otomatis', desc: 'Setiap transaksi kasir, poin dihitung otomatis berdasarkan total belanja.' },
      { step: '4', title: 'Tier & Reward', desc: 'Bronze → Silver → Gold → Platinum. Tier naik otomatis berdasarkan akumulasi poin.' },
      { step: '5', title: 'Tukar Poin', desc: 'Pelanggan bisa tukar poin menjadi voucher diskon saat transaksi berikutnya.' },
    ],
    tips: ['Analisis RFM (Recency, Frequency, Monetary) tersedia di tab Analitik'],
  },
  {
    id: 'po',
    icon: <Package className="w-5 h-5" />,
    color: 'bg-indigo-600',
    lightColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    title: 'Purchase Order & Supplier',
    badge: 'PREMIUM',
    badgeColor: 'bg-violet-100 text-violet-600',
    steps: [
      { step: '1', title: 'Tambah Supplier', desc: 'Tab "Supplier" → klik "Tambah Supplier" → isi nama, kontak, email, alamat, dan kategori supplier.' },
      { step: '2', title: 'Buat Purchase Order', desc: 'Klik "Buat PO" → pilih supplier → tambah catatan → Buat Draft PO.' },
      { step: '3', title: 'Pantau Status', desc: 'Status PO: Draft → Dalam Proses → Diterima. Gunakan KPI card untuk filter cepat.' },
      { step: '4', title: 'Terima Barang', desc: 'Klik "Terima" pada PO berstatus Proses. Stok inventori & jurnal akuntansi otomatis diperbarui.' },
    ],
    tips: ['Setiap PO yang diterima otomatis membuat jurnal akuntansi', 'Riwayat PO per supplier bisa dilihat di kartu supplier'],
  },
  {
    id: 'ai-sakti',
    icon: <Star className="w-5 h-5" />,
    color: 'bg-gradient-to-br from-indigo-600 to-violet-600',
    lightColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    title: 'AI Sakti (Asisten Pintar)',
    badge: 'BARU',
    badgeColor: 'bg-emerald-100 text-emerald-600',
    steps: [
      { step: '1', title: 'Buka AI Sakti', desc: 'Klik menu "AI Sakti" di sidebar. Chatbot langsung terbuka dan siap menerima pertanyaan.' },
      { step: '2', title: 'Tanya Apa Saja', desc: 'Ketik pertanyaan tentang modul apapun: POS, Inventori, HRD, Akuntansi, CRM, Koin, dll.' },
      { step: '3', title: 'Quick Questions', desc: 'Klik tombol pertanyaan cepat yang tersedia untuk jawaban instan tanpa mengetik.' },
      { step: '4', title: 'Salin Jawaban', desc: 'Hover pada jawaban AI → klik ikon copy untuk menyalin teks ke clipboard.' },
    ],
    tips: ['AI Sakti menguasai 12+ modul dan 40+ topik', 'Gunakan kata kunci spesifik untuk jawaban lebih akurat', 'Reset percakapan kapan saja dengan tombol refresh'],
  },
  {
    id: 'online',
    icon: <Globe className="w-5 h-5" />,
    color: 'bg-indigo-500',
    lightColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    title: 'Pesanan Online & Reservasi',
    badge: 'PREMIUM',
    badgeColor: 'bg-indigo-100 text-indigo-600',
    steps: [
      { step: '1', title: 'Aktifkan Modul', desc: 'App Market → aktifkan "Integrasi Pesanan Online".' },
      { step: '2', title: 'Terima Notifikasi', desc: 'Pesanan dari GoFood, GrabFood, WhatsApp masuk otomatis dengan notifikasi suara & pop-up.' },
      { step: '3', title: 'Proses Pesanan', desc: 'Menu "Pesanan Online" → klik "Terima" untuk konfirmasi pesanan ke pelanggan.' },
      { step: '4', title: 'Kelola Reservasi', desc: 'Tab "Reservasi" untuk mengelola meja atau jadwal layanan yang dipesan di muka.' },
    ],
    tips: ['Semua saluran masuk ke 1 dashboard terpusat', 'Suara notifikasi berbeda untuk tiap platform'],
  },
  {
    id: 'billing',
    icon: <DollarSign className="w-5 h-5" />,
    color: 'bg-amber-500',
    lightColor: 'bg-amber-50 text-amber-600 border-amber-200',
    title: 'Informasi Layanan & Koin',
    badge: 'SISTEM',
    badgeColor: 'bg-amber-100 text-amber-600',
    steps: [
      { step: '1', title: 'Sistem Pay-As-You-Go', desc: 'VISTRAL POS menggunakan Koin sebagai mata uang layanan. Modul Kasir (POS) dasar gratis selamanya.' },
      { step: '2', title: 'Cek Status Layanan', desc: 'Buka menu "Informasi Layanan" untuk melihat semua modul yang sedang aktif beserta countdown waktu habisnya.' },
      { step: '3', title: 'Countdown Real-Time', desc: 'Setiap modul aktif menampilkan hitungan mundur (hari:jam:menit:detik). Bar berwarna merah jika sisa waktu < 20%.' },
      { step: '4', title: 'Isi Saldo Koin', desc: 'Pilih paket top-up (Hemat 50 koin, UMKM Juara 150 koin, Ekspansi 500 koin) → hubungi admin via WhatsApp.' },
      { step: '5', title: 'Aktifkan Modul', desc: 'Buka halaman fitur yang terkunci → pilih paket Harian / Mingguan / Bulanan → bayar dengan Koin.' },
      { step: '6', title: 'Harga per Modul', desc: 'Harga ditetapkan oleh Super Admin. Cek tabel "Harga Semua Modul" di halaman Informasi Layanan untuk melihat tarif terkini.' },
    ],
    tips: ['Koin tidak hangus — hanya modul yang diaktifkan yang dipotong', 'KDS (Kitchen Display) hanya tersedia paket Bulanan', 'Pantau countdown agar tidak terputus saat operasional'],
  },
  {
    id: 'superadmin',
    icon: <Crown className="w-5 h-5" />,
    color: 'bg-rose-600',
    lightColor: 'bg-rose-50 text-rose-600 border-rose-200',
    title: 'Super Admin Dashboard (SA)',
    badge: 'SA ONLY',
    badgeColor: 'bg-rose-100 text-rose-700',
    steps: [
      { step: '1', title: 'Akses SA Dashboard', desc: 'Login dengan akun Super Admin → sidebar menampilkan section "⚡ Super Admin" berwarna merah → klik "SA Dashboard".' },
      { step: '2', title: 'Command Center', desc: 'Tab pertama menampilkan statistik platform: total merchant aktif, transaksi hari ini, revenue platform, dan merchant hampir expired.' },
      { step: '3', title: 'Kelola Merchant', desc: 'Tab "Kelola Merchant" → lihat semua toko terdaftar, status (Aktif/Trial/Expired), suspend atau lihat detail per merchant.' },
      { step: '4', title: 'Atur Harga Koin', desc: 'Tab "Harga Koin" → ubah harga 11 modul berbayar (Harian/Mingguan/Bulanan), paket top-up, fee transaksi, dan durasi trial. Klik "Simpan" agar langsung berlaku.' },
      { step: '5', title: 'Kontrol Modul', desc: 'Tab "Kontrol Modul" → pilih merchant → toggle on/off modul secara manual (upgrade/downgrade plan).' },
      { step: '6', title: 'Broadcast & Sistem', desc: 'Tab "Broadcast" untuk kirim pengumuman ke semua merchant. Tab "Sistem" untuk maintenance mode, backup database, dan danger zone.' },
    ],
    tips: ['SA Dashboard hanya bisa diakses role SUPERADMIN — user biasa otomatis diarahkan ke dashboard toko', 'Perubahan harga koin langsung mempengaruhi Paywall semua merchant', 'Gunakan Maintenance Mode saat update sistem besar'],
  },
  {
    id: 'settings',
    icon: <Settings className="w-5 h-5" />,
    color: 'bg-gray-500',
    lightColor: 'bg-gray-50 text-gray-600 border-gray-200',
    title: 'Pengaturan & App Market',
    badge: 'SISTEM',
    badgeColor: 'bg-gray-100 text-gray-600',
    steps: [
      { step: '1', title: 'Info Toko', desc: 'Tab "Toko" → ubah nama toko, logo, alamat, dan nomor WA yang tampil di struk.' },
      { step: '2', title: 'Kelola Pengguna', desc: 'Tab "Pengguna" → tambah staf kasir, atur PIN, dan tentukan hak akses (Owner/Kasir/Manager).' },
      { step: '3', title: 'App Market', desc: 'Tab "App Market" → aktifkan atau nonaktifkan modul premium dengan Koin sesuai kebutuhan.' },
      { step: '4', title: 'Notifikasi', desc: 'Tab "Notifikasi" → atur kapan Anda ingin mendapat peringatan stok habis, laporan harian, dll.' },
      { step: '5', title: 'Keamanan', desc: 'Tab "Keamanan" → aktifkan PIN kasir untuk void, auto logout, dan ubah password akun.' },
    ],
    tips: ['Setiap perubahan di Pengaturan berlaku untuk semua perangkat yang login', 'Pin kasir minimal 6 digit'],
  },
];

export default function UserGuidePage() {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = MODULES.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.steps.some(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.desc.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
    <div className="max-w-[1400px] mx-auto p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4 bg-white border border-indigo-100 rounded-2xl px-6 py-4 shadow-sm">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Knowledge Base</span>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Panduan Pengguna</h1>
          </div>
        </div>

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <p className="text-indigo-200 text-xs font-black uppercase tracking-[0.2em] mb-2">Selamat Datang</p>
            <h2 className="text-2xl font-black mb-3">Panduan Lengkap KASIR SAKTI POS</h2>
            <p className="text-indigo-100 font-medium max-w-2xl leading-relaxed text-sm">
              Dokumen ini memandu Anda menggunakan aplikasi kasir pintar kelas dunia yang didesain khusus agar mudah dipahami oleh semua orang. Dari jualan harian, catat stok bahan, absen karyawan, sampai hitung laba rugi otomatis—semuanya ada dalam satu aplikasi yang praktis dan canggih!
            </p>
            <div className="flex flex-wrap gap-2 mt-5">
              {['Sangat Mudah Dipakai', 'Lengkap & Praktis', 'Bayar Pakai Koin', 'Ada Asisten AI Pintar'].map(tag => (
                <span key={tag} className="bg-white/10 border border-white/10 text-white text-[10px] font-black px-3 py-1 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-300" /> {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Icons */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-8">
        {MODULES.map(m => (
          <button
            key={m.id}
            onClick={() => setActiveModule(activeModule === m.id ? null : m.id)}
            className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all border ${
              activeModule === m.id ? 'border-primary/30 bg-primary/5 shadow-md' : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'
            }`}
          >
            <div className={`w-10 h-10 ${m.color} rounded-xl flex items-center justify-center text-white`}>
              {m.icon}
            </div>
            <span className="text-[9px] font-black text-slate-500 uppercase text-center leading-tight">{m.title.split(' ').slice(0, 2).join(' ')}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari panduan... (contoh: absensi, laporan, koin)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field w-full pl-10 py-3.5 text-sm"
        />
      </div>

      {/* Modules */}
      <div className="space-y-4">
        {filtered.map(mod => (
          <div key={mod.id} className="bg-white rounded-[1.5rem] shadow-lg border border-slate-100 overflow-hidden">
            {/* Module Header */}
            <button
              onClick={() => setActiveModule(activeModule === mod.id ? null : mod.id)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${mod.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                  {mod.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-black text-slate-900">{mod.title}</h3>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${mod.badgeColor}`}>
                      {mod.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">{mod.steps.length} langkah penggunaan · {mod.tips.length} tips</p>
                </div>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${activeModule === mod.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                {activeModule === mod.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
            </button>

            {/* Module Content */}
            {activeModule === mod.id && (
              <div className="px-6 pb-6 border-t border-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                  {/* Steps */}
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Langkah Penggunaan</h4>
                    <div className="space-y-4">
                      {mod.steps.map((s, i) => (
                        <div key={i} className="flex gap-3">
                          <div className={`w-7 h-7 ${mod.color} rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0 mt-0.5`}>
                            {s.step}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-sm mb-0.5">{s.title}</p>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">{s.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tips */}
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">💡 Tips & Pintasan</h4>
                    <div className={`bg-gradient-to-br rounded-2xl p-5 border space-y-3 ${mod.lightColor}`}>
                      {mod.tips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Star className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                          <p className="text-xs font-medium leading-relaxed">{tip}</p>
                        </div>
                      ))}
                    </div>

                    {/* Quick CTA */}
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">🎯 Butuh Bantuan Lebih?</p>
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 rounded-lg bg-white border border-slate-200 text-xs font-black text-slate-600 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1">
                          <MessageCircle className="w-3 h-3" /> Chat Support
                        </button>
                        <button className="flex-1 py-2 rounded-lg bg-primary text-white text-xs font-black hover:bg-primary/90 transition-colors flex items-center justify-center gap-1">
                          <ArrowRight className="w-3 h-3" /> Coba Sekarang
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="mt-10 bg-slate-50 border border-slate-200 rounded-2xl p-6 flex items-start gap-4">
        <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
          <HelpCircle className="w-5 h-5 text-slate-500" />
        </div>
        <div>
          <p className="font-black text-slate-700 mb-1">Tidak menemukan yang Anda cari?</p>
          <p className="text-sm text-slate-500 font-medium mb-3">
            Hubungi tim support kami via WhatsApp atau email. Kami siap membantu 7 hari seminggu, jam 08.00–21.00 WIB.
          </p>
          <div className="flex flex-wrap gap-2">
            <a href="https://wa.me/6285320792447" className="inline-flex items-center gap-2 bg-[#25D366] text-white text-xs font-black px-4 py-2 rounded-xl hover:opacity-90">
              <MessageCircle className="w-3 h-3" /> WhatsApp Support
            </a>
            <a href="mailto:hello@vistralpos.id" className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-600 text-xs font-black px-4 py-2 rounded-xl hover:border-slate-300">
              📧 Email Support
            </a>
          </div>
        </div>
        <div className="ml-auto hidden md:flex items-center gap-1 text-slate-300">
          <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
          <span className="text-xs font-bold">Zyntra Labs</span>
        </div>
      </div>
    </div>
    </div>
  );
}
