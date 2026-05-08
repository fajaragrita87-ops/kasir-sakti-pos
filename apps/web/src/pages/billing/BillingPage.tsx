import React from 'react';
import { Wallet, Zap, History, CreditCard, ArrowUpRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function BillingPage() {
  const coinPackages = [
    { id: '1', coins: 50, price: 55000, label: 'Paket Hemat' },
    { id: '2', coins: 150, price: 150000, label: 'Paket UMKM Juara', popular: true },
    { id: '3', coins: 500, price: 450000, label: 'Paket Ekspansi' },
  ];

  const activeFeatures = [
    { name: 'HRD & Payroll', cost: 18, period: 'Bulanan', status: 'ACTIVE', desc: 'Absensi, payroll, BPJS otomatis' },
    { name: 'Inventory Advanced', cost: 12, period: 'Bulanan', status: 'ACTIVE', desc: 'Multi-gudang, alert stok, FIFO' },
    { name: 'Kitchen Display (KDS)', cost: 20, period: 'Bulanan', status: 'INACTIVE', desc: 'Layar dapur real-time, kanban order' },
    { name: 'Loyalty Program', cost: 10, period: 'Bulanan', status: 'INACTIVE', desc: '4 tier Bronze–Platinum, poin & reward' },
    { name: 'Piutang Digital', cost: 18, period: 'Bulanan', status: 'INACTIVE', desc: 'Kelola hutang pelanggan & supplier' },
    { name: 'Migrasi Data', cost: 25, period: 'Per migrasi', status: 'INACTIVE', desc: 'Import dari Moka, iSeller, Olsera, Excel' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4 uppercase tracking-tighter">
          <div className="bg-amber-500 p-2 rounded-2xl shadow-xl shadow-amber-500/20 text-white">
            <Zap className="w-8 h-8 fill-current" />
          </div>
          Dompet Koin & Billing
        </h1>
        <p className="text-slate-500 font-medium mt-2">Prinsip Pay As You Go: Bayar fitur hanya saat Anda butuh.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Wallet Summary */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card border-0 shadow-2xl bg-slate-900 text-white p-10 overflow-hidden relative rounded-[2.5rem]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] -z-0"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <p className="text-xs font-black text-amber-500 uppercase tracking-[0.3em] mb-2">Saldo Koin Aktif</p>
                  <h2 className="text-6xl font-black italic">1,240 <span className="text-2xl not-italic text-slate-500 uppercase">Koin</span></h2>
                </div>
                <div className="bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-md">
                  <Wallet className="w-8 h-8 text-amber-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Estimasi Habis</p>
                  <p className="font-black">12 Agustus 2026</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Pengeluaran Bln Ini</p>
                  <p className="font-black text-amber-500">36 KOIN</p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Features Management */}
          <div className="card border-0 shadow-xl bg-white p-8">
            <h3 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> Kelola Fitur Aktif
            </h3>
            <div className="space-y-4">
              {activeFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${feature.status === 'ACTIVE' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'}`}>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{feature.name}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase">{feature.period}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900">{feature.cost} KOIN</p>
                    <button className={`text-[10px] font-black uppercase mt-1 ${feature.status === 'ACTIVE' ? 'text-rose-500' : 'text-primary'}`}>
                      {feature.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Up Sidebar */}
        <div className="space-y-8">
          <div className="card border-0 shadow-xl bg-white p-8">
            <h3 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tight">Isi Saldo Koin</h3>
            <div className="space-y-4">
              {coinPackages.map((pkg) => (
                <div key={pkg.id} className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden group ${pkg.popular ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-300'}`}>
                  {pkg.popular && (
                    <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                      Terpopuler
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">{pkg.label}</p>
                      <p className="text-2xl font-black text-slate-900">{pkg.coins} <span className="text-sm font-bold text-slate-400 uppercase">Koin</span></p>
                    </div>
                    <ArrowUpRight className={`w-6 h-6 ${pkg.popular ? 'text-primary' : 'text-slate-300'} group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform`} />
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="font-black text-primary">Rp {pkg.price.toLocaleString('id-ID')}</span>
                    <a 
                      href={`https://wa.me/6285320792447?text=Halo%20Admin%20Fajar,%20saya%20ingin%20membeli%20koin%20Kasir%20Sakti%20POS%20(${pkg.label}%20-%20${pkg.coins}%20Koin)`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-xl hover:bg-primary transition-colors uppercase"
                    >
                      Beli via WA
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card border-0 shadow-xl bg-amber-500 text-white p-8">
            <h4 className="font-black text-lg mb-4 flex items-center gap-2 uppercase italic tracking-tight">
              <Zap className="w-5 h-5 fill-current" /> Hemat 20%
            </h4>
            <p className="text-sm font-medium opacity-90 leading-relaxed">
              Dapatkan potongan harga khusus dengan berlangganan paket tahunan. Saldo koin tidak akan pernah hangus!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
