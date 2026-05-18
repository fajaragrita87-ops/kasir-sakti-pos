import React, { useState } from 'react';
import { 
  Wand2, Download, RefreshCw, Layout, Type, 
  Palette, ArrowRight, Zap, CheckCircle2, 
  Image as ImageIcon, Sparkles, Printer, FileDown
} from 'lucide-react';

export function AIMenuGenerator() {
  const [mode, setMode] = useState<'CHOOSING' | 'AI' | 'TEMPLATE' | 'RESULT'>('CHOOSING');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setMode('RESULT');
    }, 3500);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 animate-fade-in">
      <header className="mb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-cyan-100 text-purple-700 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.3em] mb-6 shadow-sm">
          <Sparkles className="w-4 h-4" /> Design Engine v2.5 (Patch 12)
        </div>
        <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter mb-6 uppercase italic">Studio Desain <span className="text-primary">Sakti</span></h1>
        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">Tingkatkan kelas outlet Anda dengan menu fisik berstandar restoran bintang 5 dalam hitungan detik.</p>
      </header>

      {mode === 'CHOOSING' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <ModeCard 
            title="Template Gallery"
            subtitle="Mode A — Klasik & Cepat"
            desc="Pilih dari koleksi template artisan kami yang sudah teruji meningkatkan penjualan."
            cost="5 Koin"
            icon={<Layout className="w-12 h-12 text-blue-500" />}
            onClick={() => setMode('TEMPLATE')}
            color="blue"
          />
          <ModeCard 
            title="AI Visual Magic"
            subtitle="Mode B — Unik & Personal"
            desc="AI kami akan menganalisis logo dan brand Anda untuk menciptakan desain eksklusif."
            cost="20 Koin"
            icon={<Wand2 className="w-12 h-12 text-purple-500" />}
            onClick={() => setMode('AI')}
            popular
            color="purple"
          />
        </div>
      )}

      {(mode === 'AI' || mode === 'TEMPLATE') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 animate-scale-up">
          <div className="card bg-white p-12 border-0 shadow-3xl rounded-[3rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-0"></div>
            <button onClick={() => setMode('CHOOSING')} className="mb-8 text-xs font-black text-slate-400 uppercase flex items-center gap-2 hover:text-primary transition-all">
               <ArrowRight className="w-4 h-4 rotate-180" /> Kembali
            </button>
            
            <div className="space-y-8 relative z-10">
              <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight italic">
                {mode === 'AI' ? 'Brainstorming AI' : 'Pilih Karakter'}
              </h3>
              
              {mode === 'TEMPLATE' ? (
                <div className="grid grid-cols-2 gap-6">
                  {['VINTAGE BISTRO', 'MINIMALIST CAFE', 'STREET VIBES', 'ROYAL DINING'].map(t => (
                    <div key={t} className="group cursor-pointer">
                      <div className="aspect-[3/4] bg-slate-100 rounded-3xl mb-3 flex items-center justify-center border-4 border-transparent group-hover:border-primary transition-all overflow-hidden shadow-lg">
                        <ImageIcon className="w-10 h-10 text-slate-300 group-hover:scale-125 transition-transform" />
                      </div>
                      <p className="text-[10px] font-black text-center text-slate-500 uppercase tracking-widest">{t}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tone Bisnis</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Clean & Fresh', 'Dark & Moody', 'Fun & Playful', 'High-End'].map(t => (
                        <button key={t} className="p-4 border-2 border-slate-100 rounded-2xl text-xs font-bold hover:border-primary hover:bg-primary/5">{t}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Audiens</label>
                    <select className="input-field w-full h-14 font-bold">
                      <option>Generasi Z (Eksis)</option>
                      <option>Keluarga (Homey)</option>
                      <option>Pekerja Kantor (Profesional)</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-10 border-t border-slate-100">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <p className="text-sm font-black text-slate-900">Total Investasi</p>
                    <p className="text-[10px] text-slate-400 font-bold italic">Hasil HD & Siap Cetak</p>
                  </div>
                  <span className="text-3xl font-black text-primary">{mode === 'AI' ? '20' : '5'} KOIN</span>
                </div>
                <button 
                  onClick={handleGenerate}
                  className="w-full btn-premium py-6 text-xl shadow-2xl shadow-primary/30"
                >
                  {isGenerating ? <RefreshCw className="w-8 h-8 animate-spin mx-auto" /> : 'GENERATE DESAIN'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-xl font-black text-slate-900 uppercase italic">Benefit Desain Sakti</h4>
            <div className="space-y-6">
              <BenefitItem icon={<Palette />} title="Color Psychology" desc="Warna disesuaikan untuk memicu nafsu makan pelanggan Anda." />
              <BenefitItem icon={<Type />} title="Smart Typography" desc="Font dipilih agar mudah dibaca di tempat minim cahaya sekalipun." />
              <BenefitItem icon={<Printer />} title="Print Ready" desc="Format CMYK beresolusi tinggi, siap dibawa ke percetakan manapun." />
            </div>
          </div>
        </div>
      )}

      {mode === 'RESULT' && (
        <div className="animate-scale-up space-y-12 max-w-4xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-[4rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="card bg-white p-2 border-0 shadow-3xl rounded-[3.5rem] overflow-hidden relative aspect-[1/1.41] flex flex-col items-center justify-center border-8 border-white">
              {/* Simulated Result Content */}
              <div className="text-center p-20 space-y-8">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tight italic">Desain Menu Selesai!</h3>
                  <p className="text-slate-400 font-medium">Layout telah dioptimasi untuk ukuran A4 HD.</p>
                </div>
                <div className="flex justify-center gap-4">
                  <div className="w-32 h-1 bg-primary rounded-full"></div>
                  <div className="w-12 h-1 bg-slate-200 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button onClick={() => { alert('Desain berhasil disimpan sebagai PDF resolusi tinggi! (Watermark telah dihapus)'); window.print(); }} className="p-6 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-slate-800 transition-all shadow-2xl">
              <FileDown className="w-6 h-6" /> Download PDF ({(mode as string) === 'AI' ? '2' : '1'} Koin)
            </button>
            <button onClick={() => setMode('AI')} className="p-6 bg-white border-4 border-slate-100 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-slate-400 hover:border-primary hover:text-primary transition-all">
              <RefreshCw className="w-5 h-5 inline mr-3" /> Revisi Desain (5 Koin)
            </button>
          </div>
          
          <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
            Watermark dihapus otomatis setelah download | Zyntra Labs Building Future
          </p>
        </div>
      )}
    </div>
  );
}

function ModeCard({ title, subtitle, desc, cost, icon, onClick, popular, color }: any) {
  return (
    <div 
      onClick={onClick}
      className={`card bg-white p-12 border-4 rounded-[3.5rem] cursor-pointer transition-all duration-500 group relative overflow-hidden ${
        popular ? `border-primary shadow-2xl shadow-primary/20 scale-105 z-10` : 'border-white hover:border-slate-100 shadow-xl'
      }`}
    >
      {popular && (
        <div className="absolute top-0 right-0 bg-primary text-white px-8 py-3 rounded-bl-[2.5rem] text-[10px] font-black uppercase tracking-widest shadow-lg">
          Best Value
        </div>
      )}
      <div className={`w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-10 group-hover:bg-${color}-500 group-hover:text-white transition-all duration-500`}>
        {icon}
      </div>
      <p className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-3">{subtitle}</p>
      <h3 className="text-4xl font-black text-slate-900 mb-6 tracking-tighter leading-none">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed mb-10 text-lg">{desc}</p>
      <div className="flex justify-between items-center border-t border-slate-50 pt-8">
        <span className="text-3xl font-black text-slate-900">{cost}</span>
        <div className="w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center group-hover:bg-primary transition-all shadow-xl">
          <ArrowRight className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
}

function BenefitItem({ icon, title, desc }: any) {
  return (
    <div className="flex gap-6 items-start">
      <div className="w-14 h-14 bg-white shadow-xl rounded-2xl flex items-center justify-center text-primary flex-shrink-0">
        {React.cloneElement(icon, { className: "w-6 h-6" })}
      </div>
      <div>
        <h5 className="font-black text-slate-800 uppercase tracking-tight">{title}</h5>
        <p className="text-sm text-slate-400 font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
