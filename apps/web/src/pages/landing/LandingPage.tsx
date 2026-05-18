import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, ShoppingCart, BarChart3, QrCode, Users, Wand2, ShieldCheck, Star, MessageCircle, MessageSquare, Brain, Heart, Check, X, ArrowLeftRight, Utensils, Crown, Store, Coffee, Scissors, Building2, Smartphone, Truck, ChevronDown, CheckCircle2, Calculator, ClipboardCheck, Layers, Image as ImageIcon, WifiOff, Package } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { useAuthStore } from '../../stores/auth.store';

const FEATURES = [
  { icon: <ShoppingCart className="w-6 h-6" />, title: 'Kasir Super Cepat', desc: 'Selesaikan transaksi < 2 detik. Varian S/M/L langsung di kartu produk, struk thermal otomatis.' },
  { icon: <BarChart3 className="w-6 h-6" />, title: 'Analitik Real-Time', desc: 'Pantau omzet, produk terlaris & jam sibuk secara live. Laporan otomatis ke WhatsApp Anda.' },
  { icon: <QrCode className="w-6 h-6" />, title: 'QR Order Anti-Antri', desc: 'Pelanggan scan QR di meja, pilih menu & bayar sendiri. Masuk KDS dapur otomatis.' },
  { icon: <Users className="w-6 h-6" />, title: 'HRD & Payroll Cerdas', desc: 'Absensi selfie + GPS, izin & cuti, hitung gaji otomatis termasuk BPJS & THR.' },
  { icon: <MessageSquare className="w-6 h-6" />, title: 'WA Automator & CRM', desc: 'Tagih piutang, kirim voucher ulang tahun & promo segmentasi — semua otomatis via WhatsApp.' },
  { icon: <Layers className="w-6 h-6" />, title: 'Pecah Tagihan & Grosir', desc: 'Split bill untuk rombongan & harga grosir otomatis saat pelanggan beli dalam kuantitas besar.' },
];

const FEATURE_SHOWCASE = [
  {
    id: 'pos', tag: 'INTI · GRATIS', color: 'from-blue-600 to-blue-800',
    title: 'POS / Kasir Cepat',
    desc: 'Transaksi < 2 detik. Struk thermal otomatis, kembalian cerdas, multi metode bayar (Tunai, QRIS, Kartu, Piutang). Shortcut keyboard & barcode scanner ready.',
    pills: ['Multi Metode Bayar', 'QRIS Terintegrasi', 'Struk Thermal', 'Offline Mode'],
    bg: 'bg-blue-50', accent: 'text-blue-600', pillBg: 'bg-blue-100 text-blue-700',
    icon: '🛒',
  },
  {
    id: 'inventory', tag: 'PREMIUM', color: 'from-emerald-600 to-teal-700',
    title: 'Inventori & Manajemen Produk',
    desc: 'Kelola ribuan SKU, atur kategori, upload foto produk, dan buat Resep/BOM untuk produk racikan. Stok bahan baku berkurang otomatis saat produk terjual.',
    pills: ['Resep/BOM Otomatis', 'Foto Produk', 'Kategori Fleksibel', 'Stok Real-Time'],
    bg: 'bg-emerald-50', accent: 'text-emerald-600', pillBg: 'bg-emerald-100 text-emerald-700',
    icon: '📦',
  },
  {
    id: 'hrd', tag: 'PREMIUM', color: 'from-violet-600 to-purple-700',
    title: 'HRD & Payroll Karyawan',
    desc: 'Absensi selfie + GPS real-time, kelola izin & cuti, hitung payroll otomatis sesuai UU Cipta Kerja termasuk BPJS & THR. Slip gaji via WhatsApp.',
    pills: ['Absensi GPS', 'Payroll Otomatis', 'BPJS Terintegrasi', 'Slip via WA'],
    bg: 'bg-violet-50', accent: 'text-violet-600', pillBg: 'bg-violet-100 text-violet-700',
    icon: '👥',
  },
  {
    id: 'accounting', tag: 'PREMIUM', color: 'from-teal-600 to-cyan-700',
    title: 'Akuntansi & Pembukuan',
    desc: 'Laporan Laba-Rugi, Neraca, dan Arus Kas otomatis tanpa perlu paham akuntansi. Rekonsiliasi bank 1-klik, manajemen aset & penyusutan.',
    pills: ['Laba Rugi Otomatis', 'Arus Kas Live', 'Neraca Keuangan', 'Aset & Penyusutan'],
    bg: 'bg-teal-50', accent: 'text-teal-600', pillBg: 'bg-teal-100 text-teal-700',
    icon: '📊',
  },
  {
    id: 'loyalty', tag: 'PREMIUM', color: 'from-amber-500 to-orange-600',
    title: 'Loyalty Program AI',
    desc: '4 tier otomatis Bronze→Platinum. Poin dihitung tanpa campur tangan kasir. Analisis RFM pelanggan, deteksi churn, dan notifikasi reward otomatis.',
    pills: ['4 Tier Otomatis', 'Analisis RFM', 'Reward Gamifikasi', 'Notif WA'],
    bg: 'bg-amber-50', accent: 'text-amber-600', pillBg: 'bg-amber-100 text-amber-700',
    icon: '👑',
  },
  {
    id: 'kitchen', tag: 'PREMIUM', color: 'from-rose-600 to-red-700',
    title: 'Kitchen Display System (KDS)',
    desc: 'Kanban board interaktif untuk dapur. Pesanan dari kasir muncul otomatis, ada timer SLA peringatan, dan notifikasi ke kasir saat pesanan siap.',
    pills: ['Kanban Board', 'Timer SLA', 'Sync ke Kasir', 'Tanpa Kertas'],
    bg: 'bg-rose-50', accent: 'text-rose-600', pillBg: 'bg-rose-100 text-rose-700',
    icon: '🍽️',
  },
  {
    id: 'crm', tag: 'PREMIUM', color: 'from-indigo-600 to-blue-700',
    title: 'Pelanggan & CRM',
    desc: 'Database pelanggan terpusat, segmentasi otomatis, analisis perilaku beli, dan deteksi pelanggan berisiko churn sebelum mereka pergi.',
    pills: ['Database Terpusat', 'Segmentasi Auto', 'Deteksi Churn', 'Histori Beli'],
    bg: 'bg-indigo-50', accent: 'text-indigo-600', pillBg: 'bg-indigo-100 text-indigo-700',
    icon: '🤝',
  },
  {
    id: 'piutang', tag: 'PREMIUM', color: 'from-orange-600 to-amber-700',
    title: 'Piutang Digital',
    desc: 'Catat piutang pelanggan otomatis saat bayar dengan metode Piutang. Pantau total tagihan beredar, jatuh tempo, dan kirim tagihan via WhatsApp.',
    pills: ['Auto Catat Piutang', 'Pantau Jatuh Tempo', 'Tagih via WA', 'Laporan Piutang'],
    bg: 'bg-orange-50', accent: 'text-orange-600', pillBg: 'bg-orange-100 text-orange-700',
    icon: '💰',
  },
  {
    id: 'audit', tag: 'PREMIUM', color: 'from-slate-700 to-slate-900',
    title: 'Anti-Tilep & Audit Log',
    desc: 'Blind Close Shift: kasir wajib hitung fisik uang sebelum sistem membuka total omzet. Semua void, diskon, refund, dan perubahan harga tercatat.',
    pills: ['Blind Close Shift', 'Audit Log Lengkap', 'Deteksi Selisih', 'Keamanan Berlapis'],
    bg: 'bg-slate-50', accent: 'text-slate-700', pillBg: 'bg-slate-200 text-slate-700',
    icon: '🛡️',
  },
  {
    id: 'online', tag: 'PREMIUM', color: 'from-sky-600 to-blue-700',
    title: 'E-Commerce & Pesanan Online',
    desc: 'Sinkronisasi pesanan dari GoFood, GrabFood, Shopee Food, dan WhatsApp ke satu dashboard. Notifikasi suara berbeda tiap platform.',
    pills: ['GoFood Sync', 'GrabFood Sync', 'WA Order', 'Satu Dashboard'],
    bg: 'bg-sky-50', accent: 'text-sky-600', pillBg: 'bg-sky-100 text-sky-700',
    icon: '🌐',
  },
  {
    id: 'migration', tag: 'GRATIS', color: 'from-green-600 to-emerald-700',
    title: 'Smart Migration Data',
    desc: 'Pindah dari sistem POS usang Anda dalam hitungan detik. Kami mendukung import otomatis via format CSV dan Excel standar industri.',
    pills: ['Import via CSV', 'Template Excel', 'Tanpa Kehilangan Data', 'Bantuan CS Gratis'],
    bg: 'bg-green-50', accent: 'text-green-600', pillBg: 'bg-green-100 text-green-700',
    icon: '🔄',
  },
  {
    id: 'antiantri', tag: 'PREMIUM', color: 'from-pink-600 to-rose-700',
    title: 'QR Order Anti-Antri',
    desc: 'Pelanggan scan QR di meja, pilih menu, dan bayar sendiri tanpa antre ke kasir. Langsung masuk KDS dapur dan terproses otomatis.',
    pills: ['QR per Meja', 'Self-Order', 'Bayar Mandiri', 'Masuk KDS Otomatis'],
    bg: 'bg-pink-50', accent: 'text-pink-600', pillBg: 'bg-pink-100 text-pink-700',
    icon: '📱',
  },
  {
    id: 'pay_as_you_go', tag: 'REVOLUSIONER', color: 'from-cyan-600 to-blue-700',
    title: 'Bayar Per Koin (Sistem Adil)',
    desc: 'Kenapa bayar fitur yang tidak Anda pakai? Beli koin dan gunakan untuk mengaktifkan fitur harian, mingguan, atau bulanan sesuai kebutuhan Anda.',
    pills: ['Tanpa Langganan Wajib', 'Beli Koin Fleksibel', 'Aktif Harian/Bulanan', 'Sangat Hemat'],
    bg: 'bg-cyan-50', accent: 'text-cyan-600', pillBg: 'bg-cyan-100 text-cyan-700',
    icon: '🪙',
  },
  {
    id: 'grosir', tag: 'BARU', color: 'from-orange-600 to-amber-700',
    title: 'Harga Grosir Otomatis',
    desc: 'Tingkatkan volume penjualan dengan harga bertingkat. Sistem otomatis mengubah harga saat kuantitas mencapai ambang grosir (Cth: 1-10 @10k, >10 @9k).',
    pills: ['Harga Bertingkat', 'Ambang Qty Kustom', 'Auto-Update Harga', 'Laporan Margin Grosir'],
    bg: 'bg-orange-50', accent: 'text-orange-600', pillBg: 'bg-orange-100 text-orange-700',
    icon: '📦',
  },
  {
    id: 'ai_radar', tag: 'SAKTI AI', color: 'from-fuchsia-600 to-purple-800',
    title: 'AI Business Health Radar',
    desc: 'Bukan sekadar grafik. AI kami mendiagnosis bisnis Anda: "Stok Indomie habis 2 hari lagi", "Sabtu sore butuh 2 staff tambahan", atau "Promo Happy Hour naikkan profit 15%".',
    pills: ['Prediksi Stok Habis', 'Analisis Jam Sibuk', 'Rekomendasi Promo', 'Deteksi Fraud'],
    bg: 'bg-fuchsia-50', accent: 'text-fuchsia-600', pillBg: 'bg-fuchsia-100 text-fuchsia-700',
    icon: '🔮',
  },
  {
    id: 'table_map', tag: 'PREMIUM', color: 'from-blue-500 to-cyan-600',
    title: 'Visual Room & Table Map',
    desc: 'Atur denah meja restoran Anda dengan Drag & Drop. Pantau status meja (Kosong, Isi, Billing, Sedang Dibersihkan) secara visual dan real-time.',
    pills: ['Drag & Drop Layout', 'Status Meja Visual', 'Pindah Meja 1-Klik', 'Booking Jadwal'],
    bg: 'bg-blue-50', accent: 'text-blue-600', pillBg: 'bg-blue-100 text-blue-700',
    icon: '🗺️',
  },
  {
    id: 'wa_crm', tag: 'PREMIUM', color: 'from-emerald-500 to-green-600',
    title: 'WhatsApp Marketing Automator',
    desc: 'Sistem CRM yang bekerja saat Anda tidur. Kirim ucapan ulang tahun, voucher "Kami Rindu", dan update poin loyalty secara otomatis via WhatsApp.',
    pills: ['Follow-up Otomatis', 'Blast Promo Segmentasi', 'Update Poin WA', 'Voucher Rindu'],
    bg: 'bg-emerald-50', accent: 'text-emerald-600', pillBg: 'bg-emerald-100 text-emerald-700',
    icon: '💬',
  },
];

const SOLUTIONS = [
  {
    category: 'Food & Beverage',
    icon: <Utensils className="w-5 h-5" />,
    items: [
      { title: 'Restaurant & Dining', desc: 'Resto Full Service, Fast Casual FnB, Family Restaurant' },
      { title: 'Cafe & Beverage', desc: 'Coffee Shop, Catering, Meal Prep, Bakery & Pastry' },
      { title: 'Cloud Kitchen', desc: 'Foodcourt Tenant, Multi-outlet, FnB Chain' }
    ]
  },
  {
    category: 'Retail & Distribution',
    icon: <ShoppingCart className="w-5 h-5" />,
    items: [
      { title: 'Daily Needs & Grocery', desc: 'Toko Kelontong, Minimarket, Pet Shop, Frozen Food' },
      { title: 'Specialized Retail', desc: 'Toko Bangunan, Elektronik, Gadget, Furniture' },
      { title: 'Fashion & Lifestyle', desc: 'Clothing Store, Toko Sepatu, Kosmetik, Hobby Store' }
    ]
  },
  {
    category: 'Hospitality & Services',
    icon: <Scissors className="w-5 h-5" />,
    items: [
      { title: 'Beauty & Wellness', desc: 'Salon, Barbershop, Klinik Kecantikan, Spa' },
      { title: 'Automotive & Repair', desc: 'Bengkel Motor/Mobil, Car Wash, Reparasi Elektronik' },
      { title: 'Lodging & Leisure', desc: 'Penginapan, Villa, Playground, Tempat Bermain' }
    ]
  },
  {
    category: 'Commercial Business',
    icon: <Building2 className="w-5 h-5" />,
    items: [
      { title: 'Franchise & Partnership', desc: 'Manajemen Franchise, Event, Popup Market' },
      { title: 'Multi-Tenant Business', desc: 'Mall, Food Court, Office Tenant, Modern Market' },
      { title: 'Wholesale & B2B', desc: 'Grosir, Distributor, General Merchandise' }
    ]
  }
];

function PriceSimulator() {
  const [txPerDay, setTxPerDay] = useState(50);
  const [useHRD, setUseHRD] = useState(true);
  const [useInv, setUseInv] = useState(true);
  const [useKDS, setUseKDS] = useState(false);
  const [useLoyalty, setUseLoyalty] = useState(false);
  const [useAntiAntri, setUseAntiAntri] = useState(true);
  const [useAkuntansi, setUseAkuntansi] = useState(true);
  const [useDebt, setUseDebt] = useState(true);
  const [useOnline, setUseOnline] = useState(false);
  const [useCRM, setUseCRM] = useState(false);
  const [usePO, setUsePO] = useState(false);

  const monthlyCoin = (useHRD ? 18 : 0) + (useInv ? 15 : 0) + (useKDS ? 20 : 0) + (useLoyalty ? 10 : 0) + (useAntiAntri ? 30 : 0) + (useAkuntansi ? 25 : 0) + (useDebt ? 12 : 0) + (useOnline ? 20 : 0) + (useCRM ? 15 : 0) + (usePO ? 10 : 0);
  const saktiCost = Math.round(monthlyCoin * 1000);
  const competitorCost = 250000;
  const saving = Math.max(0, competitorCost - saktiCost);

  return (
    <div className="bg-white border border-slate-200 shadow-xl rounded-[2rem] p-8 md:p-10 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
        <div className="space-y-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-bold text-slate-600">Volume Transaksi / Hari</label>
              <span className="text-xl font-black text-sky-600 bg-sky-50 px-4 py-1 rounded-full">{txPerDay}x</span>
            </div>
            <input type="range" min={10} max={300} value={txPerDay} onChange={e => setTxPerDay(+e.target.value)} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500" />
          </div>
          
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            <p className="text-sm font-bold text-slate-600 sticky top-0 bg-white z-10 py-2">Modul Operasional (Opsional):</p>
            {[
              { label: 'Sistem Akuntansi Terintegrasi', state: useAkuntansi, set: setUseAkuntansi, cost: '25 koin' },
              { label: 'Manajemen Inventori & BOM', state: useInv, set: setUseInv, cost: '15 koin' },
              { label: 'Sistem PO & Supplier', state: usePO, set: setUsePO, cost: '10 koin' },
              { label: 'HRD & Payroll Karyawan', state: useHRD, set: setUseHRD, cost: '18 koin' },
              { label: 'Loyalty Program (Poin)', state: useLoyalty, set: setUseLoyalty, cost: '10 koin' },
              { label: 'CRM & WA Automator', state: useCRM, set: setUseCRM, cost: '15 koin' },
              { label: 'Kitchen Display System (KDS)', state: useKDS, set: setUseKDS, cost: '20 koin' },
              { label: 'Sistem Anti-Antri (QR Table)', state: useAntiAntri, set: setUseAntiAntri, cost: '30 koin' },
              { label: 'Piutang & Penagihan', state: useDebt, set: setUseDebt, cost: '12 koin' },
              { label: 'Integrasi Pesanan Online', state: useOnline, set: setUseOnline, cost: '20 koin' },
            ].map((f, i) => (
              <label key={i} className="flex items-center justify-between cursor-pointer p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 hover:border-sky-500/50 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${f.state ? 'bg-sky-500 border-sky-500' : 'border-slate-300 bg-white'}`}>
                    {f.state && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="font-bold text-slate-700 text-sm">{f.label}</span>
                </div>
                <span className="text-[10px] font-bold text-sky-600 bg-sky-100 px-3 py-1 rounded-full whitespace-nowrap">{f.cost}/bln</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center gap-6">
          <div className="bg-gradient-to-br from-sky-600 to-blue-700 border border-sky-500/30 rounded-3xl p-8 relative overflow-hidden shadow-lg shadow-sky-500/20 text-white">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Logo white />
            </div>
            <p className="text-xs font-black text-sky-200 uppercase tracking-widest mb-2">VISTRAL POS</p>
            <div className="flex items-end gap-2 mb-2">
              <p className="text-5xl font-black text-white">Rp {saktiCost.toLocaleString('id-ID')}</p>
              <p className="text-sky-100 font-bold mb-1">/bulan</p>
            </div>
            <p className="text-sm text-sky-100">Core POS <span className="text-emerald-300 font-bold">Gratis Selamanya</span></p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-slate-800">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">POS Kompetitor</p>
              <p className="text-2xl font-black text-slate-400 line-through decoration-rose-500/50">Rp {competitorCost.toLocaleString('id-ID')}</p>
            </div>
            {saving > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center flex flex-col justify-center shadow-sm">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Anda Hemat</p>
                <p className="text-xl font-black text-emerald-600">Rp {saving.toLocaleString('id-ID')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = React.useState(false);
  const [activeSolution, setActiveSolution] = useState(0);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % FEATURE_SHOWCASE.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const generatedImageUrl = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=2000';

  React.useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-600 font-sans selection:bg-sky-500/30 selection:text-slate-900 overflow-x-hidden">
      {/* Background Gradients & Noise */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-200/50 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-200/50 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://saleunion.webflow.io/images/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b ${scrolled ? 'py-4 bg-white/90 backdrop-blur-xl border-slate-200 shadow-sm' : 'py-6 bg-transparent border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-10 text-sm font-bold text-slate-600">
            {/* Mega Menu Trigger */}
            <div 
              className="relative group"
              onMouseEnter={() => setShowMegaMenu(true)}
              onMouseLeave={() => setShowMegaMenu(false)}
            >
              <button className="flex items-center gap-2 hover:text-sky-600 transition-colors py-2">
                Solusi <ChevronDown className={`w-3 h-3 transition-transform ${showMegaMenu ? 'rotate-180 text-sky-600' : ''}`} />
              </button>

              {/* Mega Menu Dropdown */}
              {showMegaMenu && (
                <div className="absolute top-full -left-48 w-screen max-w-4xl bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-sky-500/10 border border-slate-200 p-8 grid grid-cols-4 gap-8 animate-in slide-in-from-top-2 duration-200 z-[100]">
                  {SOLUTIONS.map((sol, idx) => (
                    <div key={idx}>
                      <h4 className="font-black text-slate-900 mb-5 flex items-center gap-3">
                        <span className="p-2 bg-sky-50 rounded-lg text-sky-600">{sol.icon}</span> 
                        {sol.category}
                      </h4>
                      <ul className="space-y-4">
                        {sol.items.map((item, i) => (
                          <li key={i} className="group/item">
                            <Link to="/register" className="block">
                              <p className="text-sm font-bold text-slate-700 group-hover/item:text-sky-600 transition-colors">{item.title}</p>
                              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <a href="#fitur" className="hover:text-sky-600 transition-colors">Fitur</a>
            <a href="#harga" className="hover:text-sky-600 transition-colors">Harga</a>
            <a href="#cerita" className="hover:text-sky-600 transition-colors">Cerita Sukses</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-sky-600 hidden sm:block">Masuk</Link>
            <button 
              onClick={() => {
                const { loginAsDemo } = useAuthStore.getState();
                loginAsDemo();
                navigate('/demo');
              }}
              className="bg-sky-600 text-white hover:bg-sky-700 px-6 py-2.5 rounded-full text-sm font-black transition-all shadow-md shadow-sky-200 hover:shadow-lg hover:shadow-sky-300"
            >
              Coba Demo Gratis
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-20 px-6 z-10 flex flex-col items-center justify-center min-h-[90vh]">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full mb-8 text-xs font-bold text-sky-600 uppercase tracking-widest animate-pulse shadow-sm">
            <Zap className="w-3 h-3 fill-current" /> POS Generasi Baru. Tanpa Biaya Berlangganan Wajib.
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black text-slate-900 mb-8 leading-[1.1] tracking-tighter">
            Berhenti Membayar Kasir.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500">
              Mulai Menghasilkan.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Sistem Point of Sale modern yang dirancang untuk pengusaha cerdas. Percepat operasional, analisis data akurat, dan hemat puluhan juta tanpa biaya langganan bulanan.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link to="/register" className="w-full sm:w-auto bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white px-10 py-5 rounded-full font-black text-base transition-all shadow-[0_0_30px_rgba(2,132,199,0.3)] hover:shadow-[0_0_50px_rgba(2,132,199,0.5)] flex items-center justify-center gap-3">
              Daftar Sekarang <ArrowRight className="w-5 h-5" />
            </Link>
            <button 
              onClick={() => {
                const { loginAsDemo } = useAuthStore.getState();
                loginAsDemo();
                navigate('/demo');
              }} 
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-10 py-5 rounded-full font-black text-base transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
            >
              Lihat Live Demo
            </button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mt-20 w-full max-w-6xl mx-auto relative group">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent z-10 h-full w-full"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-sky-400 to-blue-400 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
          <img 
            src={generatedImageUrl} 
            alt="Owner bahagia menghemat biaya operasional" 
            className="relative z-0 w-full rounded-3xl border border-slate-200 shadow-2xl object-cover aspect-[21/9]"
          />
        </div>
      </section>

      {/* FEATURE SHOWCASE CAROUSEL */}
      <section id="fitur-showcase" className="py-20 px-6 relative z-10 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-100 text-sky-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
              <Zap className="w-3 h-3 fill-current" /> 16 Modul Lengkap dalam 1 Aplikasi
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Semua yang Bisnis Anda Butuhkan</h2>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">Dari kasir harian hingga laporan akuntansi — VISTRAL POS hadir sebagai platform operasional bisnis terlengkap.</p>
          </div>

          {/* Scrolling Tab Pills */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide">
            {FEATURE_SHOWCASE.map((f, i) => (
              <button key={f.id} onClick={() => setActiveFeature(i)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide transition-all border ${
                  activeFeature === i ? 'bg-sky-600 text-white border-sky-600 shadow-lg shadow-sky-500/20' : 'bg-white text-slate-500 border-slate-200 hover:border-sky-300'
                }`}>
                <span>{f.icon}</span> {f.title.split(' ').slice(0, 2).join(' ')}
              </button>
            ))}
          </div>

          {/* Active Feature Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Info */}
            <div>
              <span className={`inline-flex text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4 ${FEATURE_SHOWCASE[activeFeature].pillBg}`}>
                {FEATURE_SHOWCASE[activeFeature].tag}
              </span>
              <div className="text-7xl mb-4">{FEATURE_SHOWCASE[activeFeature].icon}</div>
              <h3 className={`text-3xl font-black mb-4 tracking-tight ${FEATURE_SHOWCASE[activeFeature].accent}`}>
                {FEATURE_SHOWCASE[activeFeature].title}
              </h3>
              <p className="text-slate-600 font-medium leading-relaxed mb-6 text-lg">
                {FEATURE_SHOWCASE[activeFeature].desc}
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {FEATURE_SHOWCASE[activeFeature].pills.map(p => (
                  <span key={p} className={`text-xs font-black px-3 py-1.5 rounded-xl ${FEATURE_SHOWCASE[activeFeature].pillBg}`}>
                    ✓ {p}
                  </span>
                ))}
              </div>
              <Link to="/register" className="inline-flex items-center gap-2 bg-sky-600 text-white px-6 py-3 rounded-full font-black text-sm hover:bg-sky-700 transition-colors shadow-lg shadow-sky-500/20">
                Coba Fitur Ini <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Visual Card */}
            <div className={`${FEATURE_SHOWCASE[activeFeature].bg} rounded-[2.5rem] p-10 border border-slate-100 relative overflow-hidden min-h-[320px] flex flex-col justify-center shadow-inner`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${FEATURE_SHOWCASE[activeFeature].color} opacity-5 rounded-[2.5rem]`} />
              <div className="text-8xl text-center mb-6 relative z-10">{FEATURE_SHOWCASE[activeFeature].icon}</div>
              <div className="space-y-3 relative z-10">
                {FEATURE_SHOWCASE[activeFeature].pills.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/50 shadow-sm">
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${FEATURE_SHOWCASE[activeFeature].color} flex items-center justify-center flex-shrink-0`}>
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-black text-slate-800 text-sm">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-10">
            {FEATURE_SHOWCASE.map((_, i) => (
              <button key={i} onClick={() => setActiveFeature(i)}
                className={`h-2 rounded-full transition-all ${activeFeature === i ? 'w-8 bg-sky-600' : 'w-2 bg-slate-200'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF STRIP */}
      <section className="py-12 border-y border-slate-200 relative z-10 bg-white">
        <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Dipercaya 5.000+ Bisnis Masa Depan</p>
        <div className="flex gap-12 animate-marquee whitespace-nowrap opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          {[
            'Warung Bu Sari', 'Kafe Kita', 'Kopi Kenangan Senja', 'Geprek Juara',
            'Salon Estetika', 'Bakery Dream', 'Es Teh Nusantara', 'Toko Gadget Pro',
            'Warung Bu Sari', 'Kafe Kita', 'Kopi Kenangan Senja', 'Geprek Juara',
          ].map((name, i) => (
            <span key={i} className="text-xl font-black text-slate-800 flex-shrink-0">{name}</span>
          ))}
        </div>
      </section>

      {/* BUSINESS SOLUTIONS TABS */}
      <section className="py-32 px-6 relative z-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Dibangun untuk Setiap Industri</h2>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
              Tidak ada bisnis yang identik. Kami menyediakan arsitektur fleksibel yang menyesuaikan dengan alur kerja spesifik Anda.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Tabs */}
            <div className="lg:w-1/3 flex flex-col gap-3">
              {SOLUTIONS.map((sol, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveSolution(idx)}
                  className={`flex items-center gap-5 p-5 rounded-2xl transition-all text-left border ${activeSolution === idx ? 'bg-sky-50 border-sky-200 shadow-sm' : 'bg-transparent border-transparent hover:bg-slate-50'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${activeSolution === idx ? 'bg-sky-600 text-white shadow-md shadow-sky-200' : 'bg-slate-100 text-slate-500'}`}>
                    {sol.icon}
                  </div>
                  <div>
                    <h3 className={`font-black tracking-tight ${activeSolution === idx ? 'text-sky-900 text-lg' : 'text-slate-600'}`}>{sol.category}</h3>
                  </div>
                </button>
              ))}
            </div>

            {/* Content Tab */}
            <div className="lg:w-2/3 bg-white shadow-xl shadow-slate-200/50 rounded-[2.5rem] p-10 md:p-14 border border-slate-200 relative overflow-hidden">
              <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-100 rounded-full blur-[100px]"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                {SOLUTIONS[activeSolution].items.map((item, idx) => (
                  <Link to="/register" key={idx} className="group cursor-pointer block border border-transparent hover:border-sky-100 hover:bg-sky-50/50 rounded-3xl p-4 -m-4 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-6 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-black text-slate-900 mb-3 tracking-tight">{item.title}</h4>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed mb-4">{item.desc}</p>
                    <div className="inline-flex items-center gap-2 text-xs font-black uppercase text-sky-600 group-hover:text-sky-700 transition-colors">
                      Pelajari Solusi <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section id="fitur" className="py-32 px-6 relative z-10 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Kinerja Maksimal. Bebas Hambatan.</h2>
              <p className="text-xl text-slate-500 font-medium">Fitur kelas enterprise yang dibungkus dalam antarmuka elegan, cepat, dan intuitif.</p>
            </div>
            <Link to="/register" className="hidden md:inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 font-black tracking-widest uppercase text-sm transition-colors">
              Lihat Semua Fitur <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-sky-100 rounded-3xl p-8 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full blur-[50px] group-hover:bg-sky-100 transition-all"></div>
                <div className="w-14 h-14 bg-sky-50 border border-sky-100 rounded-2xl flex items-center justify-center mb-8 text-sky-600 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-sm">
                  {f.icon}
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">{f.title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXCLUSIVE FEATURES (Bento Grid Style) */}
      <section className="py-32 px-6 relative z-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
             <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-100 text-sky-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
              <Star className="w-3 h-3 fill-current" /> Standar Baru Ekosistem POS
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Kekuatan yang Tak Dimiliki Kompetitor</h2>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">Enam modul raksasa yang mendefinisikan ulang cara Anda menjalankan operasional skala besar.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Akuntansi Modern */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-emerald-100 transition-shadow">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full blur-[80px]"></div>
              <div className="absolute top-6 right-6 bg-emerald-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest animate-pulse shadow-sm">✨ Baru</div>
              
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-8 text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                <Calculator className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Akuntansi Mudah Dipahami</h3>
              <p className="text-slate-600 font-medium leading-relaxed mb-8 relative z-10">Desain akuntansi modern yang diciptakan khusus untuk Owner, bukan sekadar akuntan. Pantau laba-rugi riil tanpa pusing dengan jurnal kompleks.</p>
              <ul className="space-y-3 relative z-10">
                {['Laporan Laba-Rugi Otomatis', 'Arus Kas Real-Time', 'Rekonsiliasi Bank 1-Klik'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm font-bold text-slate-700"><Check className="w-4 h-4 text-emerald-500" />{f}</li>
                ))}
              </ul>
            </div>

            {/* Loyalty */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-amber-100 transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-8 text-white shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                <Crown className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Loyalty Program AI</h3>
              <p className="text-slate-600 font-medium leading-relaxed mb-8">4 tier otomatis: Bronze hingga Platinum. Poin dihitung tanpa campur tangan kasir. Retensi pelanggan naik hingga 40%.</p>
              <ul className="space-y-3">
                {['Gamifikasi Reward', 'Notifikasi Poin Otomatis', 'Analisis RFM Pelanggan'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm font-bold text-slate-700"><Check className="w-4 h-4 text-amber-500" />{f}</li>
                ))}
              </ul>
            </div>

            {/* KDS */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-rose-100 transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-rose-600 rounded-2xl flex items-center justify-center mb-8 text-white shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform">
                <Utensils className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Kitchen Display (KDS)</h3>
              <p className="text-slate-600 font-medium leading-relaxed mb-8">Tinggalkan kertas pesanan. Layar dapur interaktif dengan sinkronisasi instan ke kasir dan pelanggan.</p>
              <ul className="space-y-3">
                {['Kanban Board Dinamis', 'SLA Timer Peringatan', 'Integrasi Anti-Antri'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm font-bold text-slate-700"><Check className="w-4 h-4 text-rose-500" />{f}</li>
                ))}
              </ul>
            </div>

            {/* Migration */}
            <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-sky-100 transition-shadow">
              <div className="absolute top-0 right-0 w-64 h-64 bg-sky-200/50 rounded-full blur-[80px]"></div>
              <div className="absolute top-6 right-6 bg-sky-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest animate-pulse shadow-sm">🔥 Fitur Unggulan</div>
              
              <div className="w-16 h-16 bg-sky-600 rounded-2xl flex items-center justify-center mb-8 text-white shadow-lg shadow-sky-600/30 group-hover:scale-110 transition-transform">
                <ArrowLeftRight className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Migrasi Sistem 1-Klik</h3>
              <p className="text-slate-600 font-medium leading-relaxed mb-8 relative z-10">Pindah dari sistem POS usang Anda dalam hitungan detik. Kami mendukung import otomatis via CSV, dan tidak ada data yang tertinggal.</p>
              <ul className="space-y-3 relative z-10">
                {['Import via Template Standar', 'Mapping Katalog Otomatis', 'Tim Bantuan Migrasi Gratis'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm font-bold text-slate-700"><Check className="w-4 h-4 text-sky-600" />{f}</li>
                ))}
              </ul>
            </div>

            {/* Anti-Tilep */}
            <div className="bg-gradient-to-br from-rose-900 to-rose-950 border border-rose-800 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/20 rounded-full blur-[80px]"></div>
              <div className="absolute top-6 right-6 bg-rose-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">Paling Dicari Owner</div>
              
              <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center mb-8 text-rose-400 group-hover:scale-110 transition-transform border border-rose-500/30">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Anti-Tilep (Blind Close)</h3>
              <p className="text-rose-200/80 font-medium leading-relaxed mb-8 relative z-10">Tutup celah kecurangan kasir. Karyawan wajib menghitung fisik uang laci sebelum sistem membuka laporan total omzet sebenarnya.</p>
              <ul className="space-y-3 relative z-10">
                {['Verifikasi Buta (2 Langkah)', 'Audit Log Deteksi Selisih', 'Pencegahan Kebocoran Kas'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm font-bold text-rose-100"><Check className="w-4 h-4 text-rose-500" />{f}</li>
                ))}
              </ul>
            </div>

            {/* Purchase Order */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-indigo-100 transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-8 text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Sistem PO & Supplier</h3>
              <p className="text-slate-600 font-medium leading-relaxed mb-8">Ucapkan selamat tinggal pada catatan gudang manual. Kelola pemesanan barang ke supplier hingga penerimaan stok dalam satu alur mulus.</p>
              <ul className="space-y-3">
                {['Penerimaan Barang Otomatis', 'Database & Riwayat Supplier', 'Sinkronisasi Inventori Real-Time'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm font-bold text-slate-700"><Check className="w-4 h-4 text-indigo-500" />{f}</li>
                ))}
              </ul>
            </div>

            {/* WhatsApp CRM - NEW KILLER FEATURE */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-emerald-100 transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mb-8 text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">WhatsApp Marketing Auto</h3>
              <p className="text-slate-600 font-medium leading-relaxed mb-8">Kirim voucher "Kami Rindu" otomatis ke pelanggan yang tidak datang &gt;30 hari. Retensi naik tanpa iklan berbayar.</p>
              <ul className="space-y-3">
                {['Ucapan Ultah & Voucher Otomatis', 'Update Poin via WhatsApp', 'Blast Promo Segmentasi RFM'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm font-bold text-slate-700"><Check className="w-4 h-4 text-emerald-500" />{f}</li>
                ))}
              </ul>
            </div>

            {/* AI Radar - NEW KILLER FEATURE */}
            <div className="bg-gradient-to-br from-fuchsia-900 to-purple-950 border border-fuchsia-800 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-xl lg:col-span-2">
              <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-[100px]"></div>
              <div className="absolute top-8 right-8 bg-fuchsia-500 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg animate-bounce">Sakti AI Exclusive</div>
              
              <div className="w-20 h-20 bg-fuchsia-500/20 rounded-3xl flex items-center justify-center mb-8 text-fuchsia-400 group-hover:scale-110 transition-transform border border-fuchsia-500/30">
                <Zap className="w-10 h-10" />
              </div>
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <h3 className="text-3xl font-black text-white mb-6 tracking-tight">AI Business Health Radar</h3>
                  <p className="text-fuchsia-100/80 text-lg font-medium leading-relaxed mb-8">Bukan sekadar grafik mati. AI kami memantau ribuan data per detik untuk memberikan rekomendasi nyata demi profit Anda.</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      'Prediksi Stok Habis (Stock-Out)', 
                      'Optimasi Jadwal Staff', 
                      'Rekomendasi Promo Pintar', 
                      'Deteksi Fraud & Kebocoran Kas',
                      'Analisis Tren Menu Terlaris',
                      'Prediksi Arus Kas (Cashflow)'
                    ].map(f => (
                      <li key={f} className="flex items-center gap-3 text-sm font-bold text-fuchsia-50"><Check className="w-5 h-5 text-fuchsia-400" />{f}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 space-y-6">
                  <div className="flex items-center gap-4 text-fuchsia-300">
                    <div className="w-2 h-2 rounded-full bg-fuchsia-500 animate-ping"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Sakti AI Diagnosis:</span>
                  </div>
                  <div className="p-4 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-2xl">
                    <p className="text-sm font-bold text-fuchsia-100">"Stok biji kopi Arabica Anda akan habis dalam 42 jam. Buat PO ke Supplier Kencana sekarang untuk menghindari kehilangan potensi omzet Rp 2.4jt."</p>
                  </div>
                  <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                    <p className="text-sm font-bold text-indigo-100">"Tren penjualan hari Selasa naik 20%. Kami menyarankan penambahan 1 staff di jam 17:00 – 20:00."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUPERIOR ARCHITECTURE (Addressing Competitors) */}
      <section className="py-24 px-6 relative z-10 bg-slate-900 overflow-hidden text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white">Mengapa Harus VISTRAL POS?</h2>
            <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto">Kami mengerti rasa frustrasi Anda. Vistral POS hadir untuk menutup semua kebocoran dan pusingnya operasional Anda selama ini.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {[
              { title: 'Tutup Celah Kebocoran Uang', desc: 'Sering ada selisih laci kasir? Sistem Blind Close Shift memaksa kasir lapor fisik uang sebelum kami tunjukkan data aslinya.', icon: <ShieldCheck className="w-6 h-6 text-rose-400" /> },
              { title: 'Stok Barang Selalu Akurat', desc: 'Lelah cek fisik tapi stok selalu minus? Sistem Inventory & Resep kami otomatis memotong bahan baku tiap kali kasir klik bayar.', icon: <Package className="w-6 h-6 text-sky-400" /> },
              { title: 'Piutang Tak Pernah Lupa', desc: 'Pelanggan sering ngutang tapi lupa bayar? Vistral otomatis mencatat bon dan bantu Anda menagih via WhatsApp sekali klik.', icon: <MessageSquare className="w-6 h-6 text-emerald-400" /> },
              { title: 'Server Offline Anti-Macet', desc: 'Kasir lelet pas jam sibuk karena internet putus? Aplikasi kami tetap melayani pelanggan 100% saat offline dan sync saat online.', icon: <WifiOff className="w-6 h-6 text-yellow-400" /> },
              { title: 'Hitung Gaji Bebas Emosi', desc: 'Tiap akhir bulan pusing hitung lembur dan kasbon? Sistem HRD kami merekap otomatis berdasar absensi selfie ber-GPS karyawan.', icon: <Users className="w-6 h-6 text-indigo-400" /> },
              { title: 'Sistem Koin Adil Harian', desc: 'Masa libur tutup toko tapi bayar langganan full bulanan? Di Vistral, beli koin dan aktifkan fitur hanya di hari Anda buka toko.', icon: <Calculator className="w-6 h-6 text-purple-400" /> },
            ].map((f, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700 p-8 rounded-3xl hover:bg-slate-800 transition-all hover:border-slate-500 backdrop-blur-sm group">
                <div className="w-14 h-14 bg-slate-700/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h3 className="text-xl font-black mb-3">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING (SIMULATOR) */}
      <section id="harga" className="py-32 px-6 relative z-10 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Hitung Sendiri Keuntungan Anda</h2>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">Model bisnis SaaS transparan. Anda hanya membayar apa yang Anda gunakan. Core POS kami? Selalu gratis.</p>
          </div>
          <PriceSimulator />
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-32 px-6 relative z-10 bg-white">
        <div className="max-w-5xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-600 rounded-[3rem] blur-3xl opacity-20"></div>
          <div className="bg-gradient-to-br from-sky-600 to-blue-700 border border-sky-500/20 shadow-2xl shadow-sky-500/20 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/10 rounded-full blur-[120px] pointer-events-none"></div>
            
            <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter relative z-10">
              Siap Bertransformasi?
            </h2>
            <p className="text-xl text-sky-100 mb-12 max-w-2xl mx-auto font-medium relative z-10">
              Bergabunglah dengan ekosistem POS masa depan. Pendaftaran gratis, instalasi instan, tanpa kontrak mengikat.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
              <Link to="/register" className="bg-white text-sky-700 px-12 py-5 rounded-full font-black text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105">
                Buat Akun Gratis
              </Link>
              <button
                onClick={() => {
                  const { loginAsDemo } = useAuthStore.getState();
                  loginAsDemo();
                  navigate('/demo');
                }}
                className="bg-sky-700/50 border border-white/20 text-white px-12 py-5 rounded-full font-black text-lg hover:bg-sky-700 transition-all hover:scale-105 flex items-center justify-center gap-3"
              >
                <Zap className="w-5 h-5 text-sky-300" /> Lihat Demo Gratis
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 py-16 px-6 relative z-10 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <Logo className="mb-6" />
              <p className="text-slate-500 font-medium text-sm max-w-sm leading-relaxed mb-6">
                Sistem operasi komprehensif untuk bisnis modern. Cepat, aman, dan dirancang untuk skalabilitas ekstrem.
              </p>
              <div className="flex items-center gap-2 text-slate-500">
                <Heart className="w-4 h-4 text-rose-500/80 fill-rose-500" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-600">Zyntra Labs Initiative</span>
              </div>
            </div>
            <div>
              <p className="font-black text-slate-900 uppercase tracking-widest text-xs mb-6">Produk</p>
              <ul className="space-y-4 text-slate-500 font-medium text-sm">
                <li><Link to="/demo/pos" className="hover:text-sky-600 transition-colors">POS Inti</Link></li>
                <li><a href="#fitur" className="hover:text-sky-600 transition-colors">Ekosistem Modul</a></li>
              </ul>
            </div>
            <div>
              <p className="font-black text-slate-900 uppercase tracking-widest text-xs mb-6">Perusahaan</p>
              <ul className="space-y-4 text-slate-500 font-medium text-sm">
                <li><Link to="/syarat-ketentuan" className="hover:text-sky-600 transition-colors">Syarat Ketentuan</Link></li>
                <li><Link to="/kebijakan-privasi" className="hover:text-sky-600 transition-colors">Kebijakan Privasi</Link></li>
                <li><a href="mailto:hello@zyntralabs.com" className="hover:text-sky-600 transition-colors">Hubungi Kami</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs font-bold text-slate-500">© {new Date().getFullYear()} Zyntra Labs. Hak cipta dilindungi.</p>
            <div className="flex gap-4">
              {['Twitter', 'LinkedIn', 'Instagram'].map(s => (
                <a key={s} href="#" className="text-xs font-bold text-slate-500 hover:text-sky-600 uppercase tracking-widest transition-colors">{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
