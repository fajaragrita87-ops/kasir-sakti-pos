import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../../components/ui/Logo';
import { ArrowLeft, Globe, Heart, Zap, Shield, Users, Target, Mail, Instagram, MessageCircle } from 'lucide-react';

const TEAM = [
  { name: 'Reza Firmansyah', role: 'Founder & CEO', avatar: '🧑‍💻', bio: 'Mantan kasir warung, sekarang bikin software buat kasir.' },
  { name: 'Dita Anggraeni', role: 'Head of Product', avatar: '👩‍💼', bio: '7 tahun di industri F&B, paham betul pain point UMKM.' },
  { name: 'Bagas Prasetyo', role: 'Lead Engineer', avatar: '🧑‍🔧', bio: 'Ex-Gojek. Obsesi sama performa dan keandalan sistem.' },
];

const VALUES = [
  { icon: <Heart className="w-6 h-6" />, title: 'Untuk UMKM Indonesia', desc: 'Setiap fitur dirancang bersama pemilik warung nyata — bukan asumsi.', color: 'bg-rose-100 text-rose-500' },
  { icon: <Shield className="w-6 h-6" />, title: 'Transparansi Penuh', desc: 'Harga jelas, biaya jelas, tidak ada langganan tersembunyi.', color: 'bg-blue-100 text-blue-500' },
  { icon: <Zap className="w-6 h-6" />, title: 'Teknologi Terdepan', desc: 'AI, real-time sync, dan Xendit payments — tapi tetap mudah dipakai.', color: 'bg-amber-100 text-amber-500' },
  { icon: <Globe className="w-6 h-6" />, title: 'Made in Indonesia', desc: 'Dibangun di Indonesia, untuk Indonesia. Semua server lokal, data aman.', color: 'bg-emerald-100 text-emerald-500' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <Logo />
        <Link to="/" className="flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white to-purple-50 -z-10" />
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm mb-8 text-xs font-black text-slate-600 uppercase tracking-widest">
            <Globe className="w-4 h-4 text-primary" /> Zyntra Labs · Est. 2024 · Jakarta, Indonesia
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
            Building Digital Tools<br /><span className="text-primary italic">for the Next Billion</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
            Zyntra Labs adalah perusahaan teknologi Indonesia yang berfokus membangun solusi digital terjangkau untuk pelaku UMKM — mulai dari kasir, inventori, hingga manajemen karyawan.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-6 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-black text-primary uppercase tracking-widest mb-4">Misi Kami</p>
          <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
            "Setiap warung Indonesia berhak mendapat teknologi kelas enterprise — tanpa harga enterprise."
          </h2>
          <p className="text-slate-400 font-medium text-lg max-w-2xl mx-auto">
            Kami percaya digitalisasi UMKM adalah kunci pertumbuhan ekonomi Indonesia. Kasir Sakti POS adalah langkah pertama kami.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-slate-900 mb-3">Nilai-Nilai Kami</h2>
            <p className="text-slate-500 font-medium">Prinsip yang memandu setiap keputusan yang kami buat.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VALUES.map(v => (
              <div key={v.title} className="bg-white rounded-2xl p-8 shadow-lg border border-slate-50 hover:-translate-y-1 transition-all">
                <div className={`w-14 h-14 ${v.color} rounded-2xl flex items-center justify-center mb-6`}>{v.icon}</div>
                <h3 className="text-xl font-black text-slate-900 mb-2">{v.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-slate-900 mb-3">Tim Kami</h2>
            <p className="text-slate-500 font-medium">Orang-orang di balik Kasir Sakti POS.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TEAM.map(m => (
              <div key={m.name} className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className="text-5xl mb-4">{m.avatar}</div>
                <h3 className="font-black text-slate-900 text-lg">{m.name}</h3>
                <p className="text-xs font-black text-primary uppercase tracking-widest mb-3">{m.role}</p>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '2024', label: 'Tahun Berdiri' },
              { value: '500+', label: 'Warung Aktif' },
              { value: 'Rp 2M+', label: 'Transaksi Diproses' },
              { value: '99.9%', label: 'Uptime SLA' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-4xl font-black text-primary mb-2">{s.value}</p>
                <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product */}
      <section className="py-20 px-6 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-black uppercase tracking-widest text-white/60 mb-4">Produk Kami</p>
          <h2 className="text-4xl font-black mb-4">Kasir Sakti POS</h2>
          <p className="text-white/80 font-medium text-lg max-w-2xl mx-auto mb-10">
            Platform kasir modern untuk UMKM Indonesia. Gratis untuk kasir, bayar hanya fitur yang dibutuhkan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary px-10 py-4 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all">
              Daftar Gratis
            </Link>
            <Link to="/demo/pos" className="border-2 border-white/30 text-white px-10 py-4 rounded-2xl font-black hover:bg-white/10 transition-all">
              Coba Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black text-slate-900 mb-4">Hubungi Kami</h2>
          <p className="text-slate-500 font-medium mb-10">Ada pertanyaan? Kami siap membantu 24/7.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: <Mail className="w-6 h-6" />, label: 'Email', value: 'Zyntralabs1@gmail.com', color: 'bg-blue-50 text-blue-500' },
              { icon: <MessageCircle className="w-6 h-6" />, label: 'WhatsApp', value: '0853-2079-2447 (Fajar)', color: 'bg-emerald-50 text-emerald-500' },
              { icon: <Instagram className="w-6 h-6" />, label: 'Instagram', value: '@zyntra.id', color: 'bg-pink-50 text-pink-500' },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-50">
                <div className={`w-12 h-12 ${c.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>{c.icon}</div>
                <p className="font-black text-slate-800">{c.label}</p>
                <p className="text-slate-500 font-medium text-sm mt-1">{c.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-10 px-6 text-center">
        <Logo white className="mx-auto mb-4" />
        <p className="text-slate-500 text-sm font-bold">© {new Date().getFullYear()} Zyntra Labs. All rights reserved.</p>
        <p className="text-slate-600 text-xs mt-2 font-bold uppercase tracking-widest">Building digital tools for the next billion</p>
      </footer>
    </div>
  );
}
