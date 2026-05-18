import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowLeft, Wand2, FileDown, Printer, Type, Image as Img, Palette } from 'lucide-react';
import { useProductStore } from '../../stores/product.store';
import { useAuthStore } from '../../stores/auth.store';

type Step = 'PROMPT' | 'GENERATING' | 'RESULT';

interface GenParams {
  bg: string;
  accent: string;
  textLight: string;
  textDark: string;
  font: string;
  layout: 'single' | 'double';
}

export default function PrintMenuPage() {
  const { products } = useProductStore();
  const { user } = useAuthStore();
  
  const [step, setStep] = useState<Step>('PROMPT');
  const [outletName, setOutletName] = useState('Warung Sakti');
  const [tagline, setTagline] = useState('Rasa Bintang Lima, Harga Kaki Lima');
  const [prompt, setPrompt] = useState('');
  
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  
  const [aiConfig, setAiConfig] = useState<GenParams>({
    bg: '#ffffff', accent: '#000000', textLight: '#000000', textDark: '#000000', font: 'sans-serif', layout: 'double'
  });

  const activeProducts = products.filter(p => p.isActive);
  const categories = Array.from(new Set(activeProducts.map(p => p.category)));
  const fmtRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  const extractThemeFromPrompt = (text: string): GenParams => {
    const t = text.toLowerCase();
    
    // Default modern
    let bg = '#FAFAFA';
    let accent = '#2D3748';
    let textLight = '#1A202C';
    let textDark = '#1A202C';
    let font = 'sans-serif';
    let layout: 'single' | 'double' = 'double';

    // Fonts
    if (t.includes('klasik') || t.includes('elegan') || t.includes('mewah') || t.includes('kuno')) font = 'serif';
    if (t.includes('retro') || t.includes('neon') || t.includes('komputer')) font = 'monospace';

    // Colors
    if (t.includes('gelap') || t.includes('dark') || t.includes('hitam')) { bg = '#111827'; textLight = '#F9FAFB'; textDark = '#F9FAFB'; accent = '#FCD34D'; }
    if (t.includes('merah')) { accent = '#EF4444'; if (bg === '#FAFAFA') textLight = '#EF4444'; }
    if (t.includes('biru')) { accent = '#3B82F6'; if (bg === '#FAFAFA') textLight = '#3B82F6'; }
    if (t.includes('hijau')) { accent = '#10B981'; if (bg === '#FAFAFA') textLight = '#10B981'; }
    if (t.includes('kuning') || t.includes('emas')) { accent = '#F59E0B'; }
    if (t.includes('pink') || t.includes('merah muda')) { accent = '#EC4899'; }
    if (t.includes('kopi') || t.includes('coklat') || t.includes('brown')) { bg = '#2D3748'; accent = '#D69E2E'; textLight = '#FDF6E3'; }
    if (t.includes('neon')) { bg = '#000000'; accent = '#39FF14'; textLight = '#39FF14'; font = 'monospace'; }

    // Layout
    if (t.includes('satu kolom') || t.includes('single') || t.includes('besar')) layout = 'single';

    return { bg, accent, textLight, textDark, font, layout };
  };

  const handleGenerate = () => {
    if (!prompt.trim()) {
      alert('Tolong ketikkan prompt desain Anda terlebih dahulu.');
      return;
    }
    
    // In real app: deduct coins
    
    setStep('GENERATING');
    setProgress(0);
    
    // Simulate AI Generation Process
    const steps = [
      { p: 10, msg: '🧠 Memahami konteks prompt...' },
      { p: 30, msg: '🎨 Mengekstraksi preferensi warna & tipografi...' },
      { p: 50, msg: '📐 Menghitung grid layout untuk ' + activeProducts.length + ' produk...' },
      { p: 75, msg: '✨ Mengaplikasikan style visual...' },
      { p: 90, msg: '🔥 Finalisasi rendering...' },
      { p: 100, msg: 'Selesai!' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep].p);
        setStatus(steps[currentStep].msg);
        currentStep++;
      } else {
        clearInterval(interval);
        setAiConfig(extractThemeFromPrompt(prompt));
        setStep('RESULT');
      }
    }, 800);
  };

  // ── GENERATING ──────────────────────────────────────────────────
  if (step === 'GENERATING') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-fade-in relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-slate-50 to-white -z-10" />
        
        <div className="w-32 h-32 relative mb-8">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
          <div className="absolute inset-2 bg-primary/40 rounded-full animate-pulse" />
          <div className="absolute inset-4 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/50">
            <Wand2 className="w-10 h-10 text-white animate-spin-slow" />
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4 italic">Sakti AI sedang bekerja...</h2>
        
        <div className="w-full max-w-md bg-white p-6 rounded-3xl shadow-2xl border border-slate-100">
          <div className="flex justify-between text-xs font-black text-slate-400 mb-3 uppercase tracking-widest">
            <span>Progress</span>
            <span className="text-primary">{progress}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-sm font-bold text-slate-600 animate-pulse">{status}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── RESULT ──────────────────────────────────────────────────────
  if (step === 'RESULT') {
    return (
      <div className="p-6 max-w-6xl mx-auto animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setStep('PROMPT')} className="flex items-center gap-2 text-slate-400 font-bold text-sm hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Buat Desain Baru
          </button>
          <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 border border-emerald-200">
            <Sparkles className="w-4 h-4" /> AI Generation Berhasil
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Canvas */}
          <div className="lg:col-span-2">
            <div className="relative p-8 rounded-[3rem] shadow-2xl" style={{ backgroundColor: aiConfig.bg }}>
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
              <div className="relative z-10" style={{ minHeight: '600px' }}>
                {/* Header */}
                <div className="text-center mb-10 pb-6 border-b-2" style={{ borderColor: `${aiConfig.accent}20` }}>
                  <h1 className="text-5xl font-black uppercase tracking-tighter mb-2" style={{ color: aiConfig.textLight, fontFamily: aiConfig.font }}>
                    {outletName}
                  </h1>
                  <p className="text-lg font-bold italic tracking-wide" style={{ color: aiConfig.accent, fontFamily: aiConfig.font }}>
                    {tagline}
                  </p>
                </div>

                {/* Categories & Items */}
                <div className="space-y-10">
                  {categories.map(cat => {
                    const items = activeProducts.filter(p => p.category === cat);
                    if (items.length === 0) return null;
                    return (
                      <div key={cat}>
                        <h2 className="text-2xl font-black uppercase tracking-widest mb-6 flex items-center gap-4" style={{ color: aiConfig.accent, fontFamily: aiConfig.font }}>
                          <span className="h-0.5 flex-1" style={{ backgroundColor: `${aiConfig.accent}40` }} />
                          {cat}
                          <span className="h-0.5 flex-1" style={{ backgroundColor: `${aiConfig.accent}40` }} />
                        </h2>
                        
                        <div className={`grid gap-6 ${aiConfig.layout === 'double' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                          {items.map(p => (
                            <div key={p.id} className="group relative">
                              <div className="flex justify-between items-baseline mb-1">
                                <h3 className="text-lg font-bold" style={{ color: aiConfig.textLight, fontFamily: aiConfig.font }}>{p.name}</h3>
                                <div className="flex-1 mx-4 border-b-2 border-dotted" style={{ borderColor: `${aiConfig.accent}30` }} />
                                <span className="text-lg font-black" style={{ color: aiConfig.accent }}>{fmtRp(p.price)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
              <h3 className="text-lg font-black text-slate-900 mb-4 uppercase">Hasil Ekstraksi AI</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-bold">Background</span>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: aiConfig.bg }} />
                    <span className="font-mono font-bold text-slate-700">{aiConfig.bg}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-bold">Aksen Utama</span>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: aiConfig.accent }} />
                    <span className="font-mono font-bold text-slate-700">{aiConfig.accent}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-bold">Tipografi</span>
                  <span className="font-bold text-slate-700 capitalize">{aiConfig.font}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full btn-premium py-4 text-sm flex items-center justify-center gap-2">
                  <FileDown className="w-5 h-5" /> Download PDF (Siap Cetak)
                </button>
                <button className="w-full bg-slate-100 text-slate-600 py-4 rounded-xl font-black text-sm uppercase flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
                  <Printer className="w-5 h-5" /> Cetak Langsung via Browser
                </button>
              </div>
            </div>

            <div className="bg-primary/5 rounded-3xl p-6 border border-primary/20">
              <p className="text-xs font-black text-primary uppercase tracking-widest mb-2">Kurang Cocok?</p>
              <p className="text-sm text-slate-600 font-medium mb-4">Coba ubah prompt Anda dengan kata kunci warna (merah, biru, gelap) atau gaya (klasik, neon).</p>
              <button onClick={() => setStep('PROMPT')} className="w-full py-3 bg-white text-primary border-2 border-primary/20 rounded-xl font-bold hover:bg-primary hover:text-white transition-all text-sm">
                Coba Prompt Lain
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── PROMPT ──────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-xl shadow-slate-900/20">
          <Wand2 className="w-4 h-4 text-amber-400" /> Sakti AI Menu Generator
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 italic leading-tight">
          Cukup Ketik, <br/><span className="text-primary not-italic">Biar AI Yang Desain.</span>
        </h1>
        <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">
          Tinggalkan template kaku. Ceritakan gaya menu yang Anda inginkan, dan AI kami akan merancangnya khusus untuk Anda secara real-time.
        </p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-8 md:p-10 space-y-8">
          
          {/* Identitas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Type className="w-3 h-3" /> Nama Outlet</label>
              <input 
                value={outletName} 
                onChange={e => setOutletName(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-slate-800 focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Type className="w-3 h-3" /> Tagline / Slogan</label>
              <input 
                value={tagline} 
                onChange={e => setTagline(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-slate-800 focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
              />
            </div>
          </div>

          {/* Prompt Utama */}
          <div className="relative">
            <label className="block text-sm font-black text-slate-900 uppercase tracking-tight mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Prompt Desain (Beritahu AI Apa Yang Anda Inginkan)
            </label>
            <div className="absolute top-12 right-4 flex gap-2">
              <button onClick={() => setPrompt('Buatkan saya menu dengan gaya elegan, warna latar hitam gelap dan aksen emas')} className="text-[10px] bg-slate-100 text-slate-500 font-bold px-3 py-1.5 rounded-lg hover:bg-slate-200">✨ Elegan & Mewah</button>
              <button onClick={() => setPrompt('Saya mau desain yang colorful, ceria dengan warna dominan merah muda dan layout 1 kolom besar')} className="text-[10px] bg-slate-100 text-slate-500 font-bold px-3 py-1.5 rounded-lg hover:bg-slate-200">🎨 Ceria</button>
            </div>
            <textarea 
              value={prompt} 
              onChange={e => setPrompt(e.target.value)} 
              placeholder="Contoh: Buatkan saya desain bertema warung kopi senja dengan warna latar gelap dan font klasik..."
              className="w-full bg-slate-50 border-2 border-slate-200 p-6 pt-14 rounded-3xl font-bold text-slate-800 text-lg focus:ring-8 focus:ring-primary/10 focus:border-primary outline-none transition-all h-48 resize-none placeholder:font-normal placeholder:text-slate-400" 
            />
          </div>

          {/* Info Sync */}
          <div className="flex items-center gap-3 bg-blue-50 text-blue-700 px-5 py-4 rounded-2xl border border-blue-100 text-sm font-medium">
            <Img className="w-5 h-5" />
            <p>
              <span className="font-black">{activeProducts.length} produk</span> dari inventori Anda akan otomatis disusun oleh AI ke dalam desain ini.
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-slate-50 p-6 md:p-8 flex items-center justify-between border-t border-slate-100">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Biaya Generation</p>
            <p className="text-2xl font-black text-amber-500 flex items-center gap-2">1 <span className="text-sm font-bold text-slate-500">Koin</span></p>
          </div>
          <button onClick={handleGenerate} className="btn-premium px-8 py-4 text-lg flex items-center gap-3 shadow-2xl shadow-primary/30">
            <Wand2 className="w-5 h-5" /> Generate Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
