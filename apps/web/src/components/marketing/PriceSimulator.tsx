import React, { useState } from 'react';
import { Check, X, TrendingDown, Info, Zap } from 'lucide-react';

export function PriceSimulator() {
  const [transactions, setTransactions] = useState(50);
  const [features, setFeatures] = useState({
    hrd: true,
    inventory: true,
    qris: true,
    debt: false,
  });

  const SAKTI_COIN_PRICE = 1000; // Rp 1.000 / coin
  const MOKAPOS_MONTHLY = 299000;
  const OLSERA_MONTHLY = 250000;

  // Calculate Sakti POS Cost
  let saktiMonthly = 0; // Kasir is FREE
  if (features.hrd) saktiMonthly += 18 * SAKTI_COIN_PRICE;
  if (features.inventory) saktiMonthly += 12 * SAKTI_COIN_PRICE;
  if (features.debt) saktiMonthly += 18 * SAKTI_COIN_PRICE;
  // QRIS is paid by customer, so 0 cost for owner

  const savings = MOKAPOS_MONTHLY - saktiMonthly;

  return (
    <div className="card bg-white border-0 shadow-3xl p-10 rounded-[3rem] overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-0"></div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
        <div>
          <h3 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tighter italic">Berapa Banyak Penghematanmu?</h3>
          
          <div className="space-y-10">
            <div>
              <div className="flex justify-between mb-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Transaksi per Hari</label>
                <span className="text-primary font-black">{transactions} Transaksi</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="500" 
                value={transactions} 
                onChange={(e) => setTransactions(parseInt(e.target.value))}
                className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">Fitur Premium (Koin)</label>
              <FeatureToggle 
                label="HRD & Payroll (18 Koin)" 
                active={features.hrd} 
                onClick={() => setFeatures({...features, hrd: !features.hrd})} 
              />
              <FeatureToggle 
                label="Inventory Advanced (12 Koin)" 
                active={features.inventory} 
                onClick={() => setFeatures({...features, inventory: !features.inventory})} 
              />
              <FeatureToggle 
                label="Buku Piutang (18 Koin)" 
                active={features.debt} 
                onClick={() => setFeatures({...features, debt: !features.debt})} 
              />
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-700">Kasir Core & POS (SELAMANYA GRATIS)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Hasil Kalkulasi</span>
            </div>
            
            <div className="space-y-4 mb-10">
              <ComparisonRow label="MokaPOS" value={MOKAPOS_MONTHLY} active={false} />
              <ComparisonRow label="Olsera" value={OLSERA_MONTHLY} active={false} />
              <div className="pt-4 border-t border-white/10">
                <ComparisonRow label="Kasir Sakti" value={saktiMonthly} active={true} />
              </div>
            </div>
          </div>

          <div className="bg-primary/20 border border-primary/30 p-6 rounded-[2rem] text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-cyan mb-2">Total Hemat per Bulan</p>
            <h4 className="text-4xl font-black text-white">Rp {savings.toLocaleString('id-ID')}</h4>
            <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold text-emerald-400">
              <TrendingDown className="w-3 h-3" /> HEMAT {Math.round((savings/MOKAPOS_MONTHLY)*100)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureToggle({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
        active ? 'border-primary bg-primary/5 text-slate-900' : 'border-slate-100 text-slate-400 hover:border-slate-200'
      }`}
    >
      <span className="text-xs font-bold">{label}</span>
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${active ? 'bg-primary text-white' : 'bg-slate-100'}`}>
        {active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      </div>
    </button>
  );
}

function ComparisonRow({ label, value, active }: { label: string, value: number, active: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className={`text-sm font-bold ${active ? 'text-white' : 'text-slate-500'}`}>{label}</span>
      <span className={`font-black ${active ? 'text-2xl text-primary' : 'text-slate-400'}`}>
        {value === 0 ? 'GRATIS' : `Rp ${value.toLocaleString('id-ID')}`}
      </span>
    </div>
  );
}
