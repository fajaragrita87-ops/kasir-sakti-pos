import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, ShoppingCart, BarChart3, QrCode, Users, Wand2, ShieldCheck, Star, MessageCircle, Heart, Check, X, ArrowLeftRight, Utensils, Crown } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { useAuthStore } from '../../stores/auth.store';

const FEATURES = [
  { icon: <ShoppingCart className="w-7 h-7" />, title: 'Kasir Gratis', desc: 'Transaksi kilat < 2 detik. Struk otomatis, 3 shift, kembalian pintar.', color: 'bg-indigo-50 text-indigo-500' },
  { icon: <BarChart3 className="w-7 h-7" />, title: 'Laporan Real-Time', desc: 'Harian, mingguan, bulanan. Kirim otomatis ke WhatsApp pemilik.', color: 'bg-emerald-50 text-emerald-500' },
  { icon: <QrCode className="w-7 h-7" />, title: 'Anti Antri QR', desc: 'Pelanggan pesan & bayar dari meja. Pangkas antrian hingga 60%.', color: 'bg-amber-50 text-amber-500' },
  { icon: <Users className="w-7 h-7" />, title: 'HRD & Gaji', desc: 'Absensi, cuti, payroll otomatis sesuai UU Cipta Kerja 2023.', color: 'bg-rose-50 text-rose-500' },
  { icon: <Wand2 className="w-7 h-7" />, title: 'AI Menu Maker', desc: 'Desain menu cetak premium dalam 30 detik. Hemat jutaan dari desainer.', color: 'bg-purple-50 text-purple-500' },
  { icon: <ShieldCheck className="w-7 h-7" />, title: 'Audit & Keamanan', desc: 'Pantau setiap void, diskon, dan login kasir secara real-time.', color: 'bg-blue-50 text-blue-500' },
  { icon: <Star className="w-7 h-7" />, title: 'Loyalty Program', desc: '4 tier (Bronze–Platinum). Poin otomatis tiap transaksi, redeem reward.', color: 'bg-amber-50 text-amber-600', badge: 'Baru' },
  { icon: <Utensils className="w-7 h-7" />, title: 'Kitchen Display (KDS)', desc: 'Layar dapur real-time. Status Antri → Masak → Siap. Terintegrasi Anti Antri.', color: 'bg-orange-50 text-orange-500', badge: 'Baru' },
  { icon: <ArrowLeftRight className="w-7 h-7" />, title: 'Migrasi 1 Klik', desc: 'Pindah dari Moka, iSeller, Olsera, atau Excel dalam hitungan detik. Gratis!', color: 'bg-green-50 text-green-600', badge: '🔥 Eksklusif' },
];

const TESTIMONIALS = [
  { name: 'Bu Sari Wulandari', outlet: 'Warung Sari Rasa, Bandung', rating: 5, text: 'Sudah 3 bulan pakai, laporan langsung ke WA saya tiap malam. Cocok banget!' },
  { name: 'Pak Dedi Kurniawan', outlet: 'Kafe Kota Lama, Semarang', rating: 5, text: 'Anti Antri QR-nya keren. Pelanggan happy, omzet naik 30% bulan pertama.' },
  { name: 'Mbak Rina Fitriani', outlet: 'Toko Oleh-Oleh Rina, Jogja', rating: 5, text: 'Gratis selamanya untuk kasir? Awalnya gak percaya. Sekarang udah 6 bulan gratis terus.' },
];

const COIN_PACKAGES = [
  { coins: 50, price: 55000, label: 'Paket Hemat', perCoin: 1100 },
  { coins: 150, price: 150000, label: 'Paket UMKM Juara', perCoin: 1000, popular: true },
  { coins: 500, price: 450000, label: 'Paket Ekspansi', perCoin: 900 },
];

function PriceSimulator() {
  const [txPerDay, setTxPerDay] = useState(30);
  const [useHRD, setUseHRD] = useState(false);
  const [useMenu, setUseMenu] = useState(false);
  const [useAntiAntri, setUseAntiAntri] = useState(false);

  const monthlyCoin = (useHRD ? 18 : 0) + (useMenu ? 5 : 0) + (useAntiAntri ? 30 : 0);
  const saktiCost = Math.round(monthlyCoin * 1000);
  const competitorCost = 200000 + (txPerDay > 50 ? 100000 : 0);
  const saving = Math.max(0, competitorCost - saktiCost);

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-2xl max-w-3xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-black text-slate-700 mb-3">Transaksi per hari: <span className="text-primary">{txPerDay}x</span></label>
            <input type="range" min={5} max={200} value={txPerDay} onChange={e => setTxPerDay(+e.target.value)} className="w-full accent-primary" />
            <div className="flex justify-between text-xs text-slate-400 mt-1"><span>5x</span><span>200x</span></div>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-black text-slate-700">Fitur yang dipakai:</p>
            {[
              { label: 'HRD & Payroll', state: useHRD, set: setUseHRD, cost: '18 koin/bln' },
              { label: 'AI Menu Maker', state: useMenu, set: setUseMenu, cost: '5 koin/bln' },
              { label: 'Anti Antri QR', state: useAntiAntri, set: setUseAntiAntri, cost: '30 koin/bln' },
            ].map(f => (
              <label key={f.label} className="flex items-center justify-between cursor-pointer p-3 bg-slate-50 rounded-xl hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={f.state} onChange={e => f.set(e.target.checked)} className="w-4 h-4 accent-primary" />
                  <span className="font-bold text-slate-700 text-sm">{f.label}</span>
                </div>
                <span className="text-xs font-black text-primary">{f.cost}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-5">
            <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">Kasir Sakti POS</p>
            <p className="text-4xl font-black text-slate-900">Rp {saktiCost.toLocaleString('id-ID')}<span className="text-base font-bold text-slate-400">/bln</span></p>
            <p className="text-xs text-slate-500 mt-1">Kasir: Gratis + fitur pilihan saja</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-5">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Aplikasi Kasir Lain</p>
            <p className="text-4xl font-black text-slate-400">Rp {competitorCost.toLocaleString('id-ID')}<span className="text-base font-bold">/bln</span></p>
            <p className="text-xs text-slate-400 mt-1">Biaya berlangganan tetap, fitur terbatas</p>
          </div>
          {saving > 0 && (
            <div className="bg-emerald-500 text-white rounded-2xl p-5 text-center">
              <p className="text-sm font-black uppercase tracking-widest">Kamu hemat</p>
              <p className="text-3xl font-black">Rp {saving.toLocaleString('id-ID')}/bln</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { loginAsDemo } = useAuthStore();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'py-3 bg-white/95 backdrop-blur-md shadow-lg' : 'py-5 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
            <a href="#fitur" className="hover:text-primary transition-colors">Fitur</a>
            <a href="#harga" className="hover:text-primary transition-colors">Harga</a>
            <a href="#testimoni" className="hover:text-primary transition-colors">Testimoni</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-primary hidden sm:block">Masuk</Link>
            <Link to="/register" className="btn-primary px-5 py-2.5 text-sm">Daftar Gratis</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-36 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white to-purple-50 -z-10" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-lg mb-8 text-xs font-black text-slate-600 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Gratis Selamanya · Tanpa Kartu Kredit
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-[0.95] tracking-tight">
            Kasir Gratis<br /><span className="text-gradient italic">Selamanya.</span>
          </h1>
          <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
            Solusi POS modern untuk warung, toko, dan kafe Indonesia — mulai pakai sekarang tanpa biaya bulanan, tanpa trik.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/demo')}
              className="btn-premium px-10 py-5 text-lg flex items-center gap-3 shadow-2xl">
              Coba Demo Gratis <ArrowRight className="w-5 h-5" />
            </button>
            <Link to="/register" className="px-10 py-5 rounded-2xl border-2 border-slate-200 font-black text-slate-700 hover:border-primary hover:text-primary transition-all text-sm uppercase tracking-widest">
              Daftar Sekarang
            </Link>
          </div>
          <p className="mt-5 text-xs text-slate-400 font-bold">Dipercaya 500+ warung & toko di seluruh Indonesia</p>
        </div>
      </section>

      {/* SOCIAL PROOF STRIP */}
      <section className="py-10 px-6 bg-white border-y border-slate-100 overflow-hidden">
        <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Dipercaya warung & toko di seluruh Indonesia</p>
        <div className="flex gap-8 animate-marquee whitespace-nowrap">
          {[
            '🍜 Warung Bu Sari', '☕ Kafe Kita Jogja', '🛒 Toko Pak Budi', '🍗 Geprek Nusantara',
            '💇 Salon Ayu Cantik', '🎂 Bakery Dream', '🍵 Es Teh Pak RT', '🍱 Warung Makan Bahagia',
            '🍜 Warung Bu Sari', '☕ Kafe Kita Jogja', '🛒 Toko Pak Budi', '🍗 Geprek Nusantara',
          ].map((name, i) => (
            <span key={i} className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full px-5 py-2.5 text-sm font-bold text-slate-600 flex-shrink-0">{name}</span>
          ))}
        </div>
      </section>


      <section id="fitur" className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Semua yang Bisnis Anda Butuhkan</h2>
            <p className="text-lg text-slate-500 font-medium">Fitur kelas enterprise, harga ramah UMKM.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-8 shadow-lg hover:-translate-y-1 transition-all group">
                <div className={`w-16 h-16 ${f.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>{f.icon}</div>
                <h3 className="text-xl font-black text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPECIAL FEATURES: 3 BARU ── */}
      <section className="py-24 px-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
              <Zap className="w-4 h-4" /> Fitur Eksklusif — Tidak Ada di Kompetitor
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">Yang Bikin Kasir Sakti Beda</h2>
            <p className="text-slate-400 font-medium text-lg">3 fitur game-changing yang belum ada di aplikasi POS lain Indonesia.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Loyalty */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 hover:bg-white/10 transition-all group">
              <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-500/30 transition-all">
                <Star className="w-8 h-8 text-amber-400" />
              </div>
              <div className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-4">✨ Baru</div>
              <h3 className="text-2xl font-black mb-3">Loyalty Program</h3>
              <p className="text-slate-400 font-medium leading-relaxed mb-6">4 tier otomatis: Bronze → Silver → Gold → Platinum. Poin dihitung tiap transaksi, redeem reward kapan saja. Seperti Square POS tapi gratis.</p>
              <ul className="space-y-2 text-sm">
                {['Poin per Rp 1.000 transaksi', '4 tier reward otomatis', 'Kirim notif poin via WA', 'Katalog reward kustom'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-slate-300"><Check className="w-4 h-4 text-amber-400 flex-shrink-0" />{f}</li>
                ))}
              </ul>
            </div>
            {/* KDS */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 hover:bg-white/10 transition-all group">
              <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500/30 transition-all">
                <Utensils className="w-8 h-8 text-orange-400" />
              </div>
              <div className="inline-flex items-center gap-1 bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-4">✨ Baru</div>
              <h3 className="text-2xl font-black mb-3">Kitchen Display System</h3>
              <p className="text-slate-400 font-medium leading-relaxed mb-6">Layar khusus dapur real-time. Order tampil otomatis, status berubah dari Antri → Masak → Siap. Terintegrasi langsung dengan Anti Antri QR.</p>
              <ul className="space-y-2 text-sm">
                {['Kanban board 3 kolom', 'Timer per pesanan', 'Alert merah jika >10 menit', 'Buka di tablet terpisah'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-slate-300"><Check className="w-4 h-4 text-orange-400 flex-shrink-0" />{f}</li>
                ))}
              </ul>
            </div>
            {/* Migration */}
            <div className="bg-primary/10 border border-primary/30 rounded-[2rem] p-8 hover:bg-primary/20 transition-all group relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-primary text-white text-[8px] font-black px-3 py-1 rounded-full uppercase animate-pulse">🔥 Eksklusif</div>
              <div className="w-16 h-16 bg-primary/30 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/40 transition-all">
                <ArrowLeftRight className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-black mb-3">Migrasi Data 1 Klik</h3>
              <p className="text-slate-400 font-medium leading-relaxed mb-6">Pindah dari Moka POS, iSeller, Olsera, atau Excel dalam hitungan detik. Semua menu, pelanggan, transaksi, dan karyawan otomatis masuk. Gratis selamanya.</p>
              <ul className="space-y-2 text-sm">
                {['Import dari Moka, iSeller, Olsera', 'Upload Excel / CSV apapun', 'Preview sebelum import', 'Tidak ada data yang hilang'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-slate-300"><Check className="w-4 h-4 text-primary flex-shrink-0" />{f}</li>
                ))}
              </ul>
              <Link to="/demo" className="mt-6 flex items-center gap-2 text-primary font-black text-sm hover:gap-3 transition-all">
                Coba Sekarang <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>


      <section id="harga" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Hitung Sendiri Hematnya</h2>
            <p className="text-lg text-slate-500 font-medium">Transparansi penuh. Bayar hanya fitur yang Anda butuhkan.</p>
          </div>
          <PriceSimulator />
        </div>
      </section>

      {/* COIN PACKAGES */}
      <section className="py-24 px-6 bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white mb-3">Paket Top-Up Koin</h2>
            <p className="text-slate-400 font-medium">Kasir: GRATIS selamanya. Fitur premium? Bayar koin saat butuh.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COIN_PACKAGES.map(pkg => (
              <div key={pkg.label} className={`rounded-2xl p-8 relative overflow-hidden transition-all hover:-translate-y-1 ${pkg.popular ? 'bg-primary shadow-2xl shadow-primary/30' : 'bg-white/5 border border-white/10'}`}>
                {pkg.popular && <div className="absolute top-0 right-0 bg-amber-400 text-slate-900 text-[9px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest">Terpopuler</div>}
                <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: pkg.popular ? 'rgba(255,255,255,0.7)' : '#94a3b8' }}>{pkg.label}</p>
                <p className="text-4xl font-black text-white mb-1">{pkg.coins} <span className="text-base font-bold opacity-60">Koin</span></p>
                <p className="text-xl font-black text-white mb-6">Rp {pkg.price.toLocaleString('id-ID')}</p>
                <p className="text-xs font-bold mb-6" style={{ color: pkg.popular ? 'rgba(255,255,255,0.7)' : '#94a3b8' }}>Rp {pkg.perCoin.toLocaleString()}/koin</p>
                <button className={`w-full py-3 rounded-xl font-black text-sm uppercase transition-all ${pkg.popular ? 'bg-white text-primary hover:bg-slate-100' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  Beli Sekarang
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimoni" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-slate-900 mb-3">Kata Mereka</h2>
            <p className="text-slate-500 font-medium">Ribuan warung Indonesia sudah merasakan manfaatnya.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-slate-50 rounded-2xl p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-slate-700 font-medium leading-relaxed mb-6">"{t.text}"</p>
                <div>
                  <p className="font-black text-slate-900">{t.name}</p>
                  <p className="text-xs font-bold text-slate-400">{t.outlet}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-slate-900 mb-3">Kenapa Kasir Sakti POS?</h2>
            <p className="text-slate-500 font-medium">Bandingkan sendiri fiturnya.</p>
          </div>
          <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/3">Fitur</th>
                    <th className="px-6 py-5 text-center bg-primary/5">
                      <div className="text-primary font-black text-base">Kasir Sakti POS</div>
                      <div className="text-[10px] text-primary/70 font-bold uppercase">Zyntra Labs</div>
                    </th>
                    <th className="px-6 py-5 text-center">
                      <div className="text-slate-500 font-black">Kasir Lain A</div>
                      <div className="text-[10px] text-slate-300 font-bold uppercase">Berbayar</div>
                    </th>
                    <th className="px-6 py-5 text-center">
                      <div className="text-slate-500 font-black">Kasir Lain B</div>
                      <div className="text-[10px] text-slate-300 font-bold uppercase">Berbayar</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[
                    ['Kasir & Transaksi', true, true, true],
                    ['Laporan Harian via WA', true, false, true],
                    ['Anti Antri QR Order', true, false, false],
                    ['HRD & Payroll', true, true, false],
                    ['AI Menu Maker', true, false, false],
                    ['CRM & RFM Analysis', true, false, false],
                    ['Piutang Digital', true, false, false],
                    ['Audit Log Lengkap', true, true, false],
                    ['Tanpa Biaya Bulanan Wajib', true, false, false],
                    ['Xendit Payment Integration', true, false, false],
                  ].map(([label, sakti, a, b]) => (
                    <tr key={String(label)} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-700">{String(label)}</td>
                      <td className="px-6 py-4 text-center bg-primary/5">
                        {sakti ? <Check className="w-5 h-5 text-primary mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {a ? <Check className="w-5 h-5 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {b ? <Check className="w-5 h-5 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-primary/5 border-t-2 border-primary/20">
                    <td className="px-6 py-5 font-black text-slate-800">Biaya Bulanan</td>
                    <td className="px-6 py-5 text-center font-black text-primary text-lg">Rp 0*</td>
                    <td className="px-6 py-5 text-center font-bold text-slate-400">Rp 150rb+</td>
                    <td className="px-6 py-5 text-center font-bold text-slate-400">Rp 200rb+</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
              <p className="text-xs text-slate-400 font-bold">*Kasir gratis selamanya. Fitur premium opsional berbayar koin sesuai kebutuhan.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6 bg-gradient-to-br from-primary to-purple-700 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Mulai Sekarang.<br />Gratis Selamanya.</h2>
          <p className="text-white/80 text-lg font-medium mb-10">Bergabung dengan ribuan UMKM Indonesia yang sudah lebih cerdas mengelola bisnis.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/demo')}
              className="bg-white text-primary px-10 py-5 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all shadow-2xl flex items-center gap-3 justify-center">
              <Zap className="w-5 h-5 fill-current" /> Coba Demo Gratis
            </button>
            <Link to="/register" className="border-2 border-white/30 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all text-sm">
              Daftar Gratis
            </Link>
          </div>
          <p className="mt-6 text-white/50 text-xs font-bold uppercase tracking-widest">Dari warung, untuk warung Indonesia 🇮🇩</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2">
              <Logo white className="mb-4" />
              <p className="text-slate-400 font-medium text-sm max-w-xs leading-relaxed">Platform POS modern untuk UMKM Indonesia. Produk dari Zyntra Labs.</p>
              <p className="text-xs font-black text-slate-500 mt-4 uppercase tracking-widest">Building digital tools for the next billion</p>
            </div>
            <div>
              <p className="font-black text-primary uppercase tracking-widest text-sm mb-5">Solusi</p>
              <ul className="space-y-3 text-slate-400 font-bold text-sm">
                <li><Link to="/demo/pos" className="hover:text-white transition-colors">Demo Kasir</Link></li>
                <li><Link to="/demo/menu" className="hover:text-white transition-colors">AI Menu Maker</Link></li>
                <li><a href="#fitur" className="hover:text-white transition-colors">Semua Fitur</a></li>
              </ul>
            </div>
            <div>
              <p className="font-black text-primary uppercase tracking-widest text-sm mb-5">Legal</p>
              <ul className="space-y-3 text-slate-400 font-bold text-sm">
                <li><Link to="/syarat-ketentuan" className="hover:text-white transition-colors">Syarat & Ketentuan</Link></li>
                <li><Link to="/kebijakan-privasi" className="hover:text-white transition-colors">Kebijakan Privasi</Link></li>
                <li><Link to="/kebijakan-koin" className="hover:text-white transition-colors">Kebijakan Koin</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm font-bold text-slate-500">© {new Date().getFullYear()} Zyntra Labs. All rights reserved.</p>
            <div className="flex items-center gap-2 text-slate-500">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span className="text-xs font-bold uppercase tracking-widest">Made with love in Indonesia</span>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Float */}
      <a href="https://wa.me/6285320792447" target="_blank" rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[200] bg-[#25D366] text-white p-4 rounded-full shadow-2xl shadow-green-500/40 floating-anim hover:scale-110 transition-transform flex items-center gap-3 group">
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap font-bold text-sm pr-2">Hubungi Kami</span>
        <MessageCircle className="w-6 h-6" />
      </a>
    </div>
  );
}
