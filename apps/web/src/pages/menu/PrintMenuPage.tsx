import React, { useState, useRef } from 'react';
import { Wand2, Layout, FileDown, RefreshCw, ArrowLeft, Printer, Sparkles, Image as Img, Plus, X, ChevronRight, Check, Zap } from 'lucide-react';
import { useProductStore } from '../../stores/product.store';
import { useAuthStore } from '../../stores/auth.store';

type Step = 'HOME' | 'PICK_TEMPLATE' | 'CUSTOMIZE' | 'PREVIEW' | 'AI_FORM' | 'AI_RESULT';

const TEMPLATES = [
  { id: 'rustic', name: 'Rustic Warung', tag: 'Paling Populer', bg: 'bg-[#2C1810]', accent: '#D4A853', textLight: '#F5E6D0', textDark: '#2C1810', pattern: 'radial-gradient(circle at 20% 80%, rgba(212,168,83,0.15) 0%, transparent 50%)', font: 'serif' },
  { id: 'modern', name: 'Modern Minimal', tag: 'Trending', bg: 'bg-white', accent: '#1a1a2e', textLight: '#1a1a2e', textDark: '#1a1a2e', pattern: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', font: 'sans-serif' },
  { id: 'neon', name: 'Neon Street', tag: 'Gen Z Vibes', bg: 'bg-[#0a0a0a]', accent: '#39FF14', textLight: '#39FF14', textDark: '#0a0a0a', pattern: 'radial-gradient(ellipse at 50% 50%, rgba(57,255,20,0.05) 0%, transparent 70%)', font: 'monospace' },
  { id: 'royal', name: 'Luxury Resto', tag: 'Premium', bg: 'bg-[#1a0533]', accent: '#FFD700', textLight: '#FFD700', textDark: '#1a0533', pattern: 'linear-gradient(180deg, rgba(255,215,0,0.05) 0%, transparent 100%)', font: 'serif' },
  { id: 'tropical', name: 'Tropical Fresh', tag: 'F&B Hits', bg: 'bg-[#0D4F3C]', accent: '#F9C74F', textLight: '#FAFAFA', textDark: '#0D4F3C', pattern: 'radial-gradient(circle at 10% 90%, rgba(249,199,79,0.2) 0%, transparent 40%)', font: 'sans-serif' },
  { id: 'sakura', name: 'Sakura Cafe', tag: 'Aesthetic', bg: 'bg-[#FDE8F0]', accent: '#C9184A', textLight: '#C9184A', textDark: '#3D0019', pattern: 'radial-gradient(circle at 80% 20%, rgba(201,24,74,0.08) 0%, transparent 50%)', font: 'serif' },
  { id: 'nusantara', name: 'Warung Nusantara', tag: 'Tradisional', bg: 'bg-[#3D1C02]', accent: '#C68642', textLight: '#F5DEB3', textDark: '#3D1C02', pattern: 'repeating-linear-gradient(45deg, rgba(198,134,66,0.05) 0px, rgba(198,134,66,0.05) 2px, transparent 2px, transparent 12px)', font: 'serif' },
  { id: 'kids', name: 'Kids & Family', tag: 'Playful', bg: 'bg-[#FFF9C4]', accent: '#FF6B6B', textLight: '#FF6B6B', textDark: '#2D2D2D', pattern: 'radial-gradient(circle at 15% 85%, rgba(255,107,107,0.1) 0%, transparent 40%), radial-gradient(circle at 85% 15%, rgba(78,205,196,0.1) 0%, transparent 40%)', font: 'sans-serif' },
];

interface MenuConfig {
  outletName: string;
  tagline: string;
  logoUrl: string;
  template: typeof TEMPLATES[0];
  showPrices: boolean;
  showImages: boolean;
  layout: 'single' | 'double';
}

export default function PrintMenuPage() {
  const { products } = useProductStore();
  const { user } = useAuthStore();
  const [step, setStep] = useState<Step>('HOME');
  const [isGenerating, setIsGenerating] = useState(false);
  const [config, setConfig] = useState<MenuConfig>({
    outletName: 'Warung Sakti',
    tagline: 'Cita Rasa Terbaik Untuk Anda',
    logoUrl: '',
    template: TEMPLATES[0],
    showPrices: true,
    showImages: true,
    layout: 'double',
  });
  const logoRef = useRef<HTMLInputElement>(null);

  const activeProducts = products.filter(p => p.isActive);
  const categories = Array.from(new Set(activeProducts.map(p => p.category)));
  const fmtRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setConfig(c => ({ ...c, logoUrl: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => { setIsGenerating(false); setStep('PREVIEW'); }, 2000);
  };

  // ── PREVIEW ──────────────────────────────────────────────────
  if (step === 'PREVIEW') {
    const t = config.template;
    return (
      <div className="p-6 max-w-6xl mx-auto animate-fade-in">
        <button onClick={() => setStep('CUSTOMIZE')} className="flex items-center gap-2 text-slate-400 font-bold text-sm mb-6 hover:text-primary">
          <ArrowLeft className="w-4 h-4" /> Kembali Edit
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Canvas */}
          <div className="lg:col-span-2">
            <div className="relative">
              <div className="absolute -inset-3 rounded-[3rem] blur-2xl opacity-30" style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent}50)` }} />
              <div
                className={`relative ${t.bg} rounded-[2rem] overflow-hidden shadow-3xl`}
                style={{ background: t.pattern, aspectRatio: '210/297', minHeight: '500px' }}
              >
                {/* Header */}
                <div className="relative p-10 text-center border-b-2" style={{ borderColor: `${t.accent}30` }}>
                  {config.logoUrl && <img src={config.logoUrl} alt="logo" className="w-16 h-16 object-contain mx-auto mb-4 rounded-full" />}
                  <h1 className="text-4xl font-black uppercase tracking-tighter" style={{ color: t.textLight, fontFamily: t.font }}>
                    {config.outletName}
                  </h1>
                  <div className="flex items-center justify-center gap-3 mt-2">
                    <div className="h-px flex-1" style={{ background: t.accent, opacity: 0.4 }} />
                    <p className="text-sm font-bold" style={{ color: t.accent }}>{config.tagline}</p>
                    <div className="h-px flex-1" style={{ background: t.accent, opacity: 0.4 }} />
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-8 space-y-8">
                  {categories.map(cat => {
                    const items = activeProducts.filter(p => p.category === cat);
                    if (items.length === 0) return null;
                    return (
                      <div key={cat}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-2 h-6 rounded-full" style={{ background: t.accent }} />
                          <h2 className="text-lg font-black uppercase tracking-wider" style={{ color: t.accent, fontFamily: t.font }}>{cat}</h2>
                        </div>
                        <div className={`grid gap-3 ${config.layout === 'double' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                          {items.map(p => (
                            <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: `${t.accent}10`, border: `1px solid ${t.accent}20` }}>
                              {config.showImages && p.imageUrl && (
                                <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-black text-sm truncate" style={{ color: t.textLight, fontFamily: t.font }}>{p.name}</p>
                                {config.showPrices && <p className="text-xs font-bold mt-0.5" style={{ color: t.accent }}>{fmtRp(p.price)}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                  <p className="text-[8px] font-black uppercase tracking-[0.3em]" style={{ color: `${t.textLight}40` }}>
                    Dibuat dengan Kasir Sakti POS · zyntra.id
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-500 rounded-2xl flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-black text-slate-900">Desain Selesai!</p>
                  <p className="text-xs text-slate-400">A4 · Print Ready · HD</p>
                </div>
              </div>
              <div className="space-y-3">
                <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-2 hover:bg-primary transition-colors">
                  <FileDown className="w-5 h-5" /> Download PDF <span className="ml-auto bg-white/20 text-[10px] px-2 py-0.5 rounded-full">2 Koin</span>
                </button>
                <button className="w-full bg-slate-50 text-slate-600 py-4 rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-2">
                  <Printer className="w-5 h-5" /> Cetak Langsung
                </button>
                <button onClick={() => setStep('CUSTOMIZE')} className="w-full border-2 border-slate-100 py-3 rounded-2xl font-black text-sm uppercase text-slate-400 hover:border-primary hover:text-primary transition-all">
                  <RefreshCw className="w-4 h-4 inline mr-2" /> Revisi (1 Koin)
                </button>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500 flex-shrink-0" />
              <div>
                <p className="font-black text-amber-800 text-sm">Saldo Koin Anda</p>
                <p className="text-xl font-black text-amber-600">{user?.coins?.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ganti Template</p>
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES.map(t2 => (
                  <button key={t2.id} onClick={() => { setConfig(c => ({ ...c, template: t2 })); }}
                    className={`h-10 rounded-xl border-2 transition-all ${config.template.id === t2.id ? 'border-primary scale-110 shadow-lg' : 'border-transparent'} ${t2.bg}`}>
                    {config.template.id === t2.id && <Check className="w-4 h-4 mx-auto" style={{ color: t2.accent }} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── CUSTOMIZE ─────────────────────────────────────────────────
  if (step === 'CUSTOMIZE') {
    const t = config.template;
    return (
      <div className="p-6 max-w-5xl mx-auto animate-fade-in">
        <button onClick={() => setStep('PICK_TEMPLATE')} className="flex items-center gap-2 text-slate-400 font-bold text-sm mb-6 hover:text-primary">
          <ArrowLeft className="w-4 h-4" /> Pilih Template Lain
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Settings */}
          <div className="space-y-5">
            <div className={`${t.bg} rounded-2xl p-4 flex items-center gap-3`}>
              <div className="w-6 h-6 rounded-full" style={{ background: t.accent }} />
              <p className="font-black" style={{ color: t.textLight }}>{t.name}</p>
              <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: `${t.accent}20`, color: t.accent }}>{t.tag}</span>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Logo Outlet</label>
              <div onClick={() => logoRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-2xl h-20 flex items-center justify-center cursor-pointer hover:border-primary transition-all overflow-hidden">
                {config.logoUrl ? <img src={config.logoUrl} className="h-full object-contain" alt="logo" /> :
                  <div className="text-center"><Img className="w-6 h-6 text-slate-300 mx-auto" /><p className="text-xs text-slate-400 mt-1">Upload Logo</p></div>}
              </div>
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Outlet</label>
              <input value={config.outletName} onChange={e => setConfig(c => ({ ...c, outletName: e.target.value }))} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tagline</label>
              <input value={config.tagline} onChange={e => setConfig(c => ({ ...c, tagline: e.target.value }))} className="input-field w-full" />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={config.showPrices} onChange={e => setConfig(c => ({ ...c, showPrices: e.target.checked }))} className="w-4 h-4 accent-primary" />
                <span className="text-sm font-bold text-slate-600">Tampilkan Harga</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={config.showImages} onChange={e => setConfig(c => ({ ...c, showImages: e.target.checked }))} className="w-4 h-4 accent-primary" />
                <span className="text-sm font-bold text-slate-600">Tampilkan Foto</span>
              </label>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Layout</label>
              <div className="grid grid-cols-2 gap-3">
                {(['single', 'double'] as const).map(l => (
                  <button key={l} onClick={() => setConfig(c => ({ ...c, layout: l }))}
                    className={`py-3 rounded-2xl text-xs font-black uppercase border-2 transition-all ${config.layout === l ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 text-slate-400'}`}>
                    {l === 'single' ? '1 Kolom' : '2 Kolom'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Produk ({activeProducts.length} aktif dari Inventori)</p>
              <div className="bg-slate-50 rounded-2xl p-3 max-h-40 overflow-y-auto space-y-1">
                {activeProducts.length === 0 ? <p className="text-xs text-slate-400 text-center py-4">Belum ada produk. Tambah di menu Inventori.</p>
                  : activeProducts.map(p => (
                    <div key={p.id} className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="font-bold text-slate-600 flex-1 truncate">{p.name}</span>
                      <span className="text-slate-400">{fmtRp(p.price)}</span>
                    </div>
                  ))}
              </div>
            </div>
            <button onClick={handleGenerate} disabled={isGenerating}
              className="w-full btn-premium py-5 text-lg flex items-center justify-center gap-3">
              {isGenerating ? <><RefreshCw className="w-6 h-6 animate-spin" /> Membuat Desain...</>
                : <><Wand2 className="w-6 h-6" /> Generate Menu Premium — 5 Koin</>}
            </button>
          </div>

          {/* Live mini preview */}
          <div className="sticky top-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Preview Langsung</p>
            <div className={`${t.bg} rounded-2xl p-6 shadow-2xl`} style={{ background: t.pattern }}>
              {config.logoUrl && <img src={config.logoUrl} className="w-10 h-10 object-contain rounded-full mx-auto mb-3" alt="logo" />}
              <h3 className="text-xl font-black text-center uppercase" style={{ color: t.textLight, fontFamily: t.font }}>{config.outletName}</h3>
              <p className="text-center text-xs mt-1 mb-4" style={{ color: t.accent }}>{config.tagline}</p>
              {activeProducts.slice(0, 4).map(p => (
                <div key={p.id} className="flex justify-between py-1.5 border-b" style={{ borderColor: `${t.accent}20` }}>
                  <span className="text-xs font-bold" style={{ color: t.textLight }}>{p.name}</span>
                  {config.showPrices && <span className="text-xs font-black" style={{ color: t.accent }}>{fmtRp(p.price)}</span>}
                </div>
              ))}
              {activeProducts.length > 4 && <p className="text-center text-[10px] mt-2" style={{ color: `${t.textLight}40` }}>+{activeProducts.length - 4} item lainnya...</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── PICK TEMPLATE ─────────────────────────────────────────────
  if (step === 'PICK_TEMPLATE') {
    return (
      <div className="p-6 max-w-5xl mx-auto animate-fade-in">
        <button onClick={() => setStep('HOME')} className="flex items-center gap-2 text-slate-400 font-bold text-sm mb-8 hover:text-primary">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic mb-2">Pilih Template</h2>
        <p className="text-slate-500 font-medium mb-8">6 template premium hand-crafted. Semua siap cetak. <span className="font-black text-primary">5 Koin</span></p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {TEMPLATES.map(t => (
            <div key={t.id} onClick={() => { setConfig(c => ({ ...c, template: t })); setStep('CUSTOMIZE'); }}
              className={`cursor-pointer rounded-2xl overflow-hidden border-4 transition-all hover:scale-[1.02] hover:shadow-2xl ${config.template.id === t.id ? 'border-primary' : 'border-transparent'}`}>
              {/* Template visual preview */}
              <div className={`${t.bg} p-6`} style={{ background: t.pattern }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full" style={{ background: t.accent }} />
                  <div className="h-2 rounded-full flex-1" style={{ background: `${t.accent}30` }} />
                </div>
                <div className="space-y-2">
                  <div className="h-4 rounded" style={{ background: `${t.accent}40`, width: '70%' }} />
                  <div className="h-2 rounded" style={{ background: `${t.textLight}20`, width: '90%' }} />
                  <div className="h-2 rounded" style={{ background: `${t.textLight}20`, width: '80%' }} />
                  <div className="h-2 rounded" style={{ background: `${t.textLight}20`, width: '85%' }} />
                </div>
                <div className="flex gap-2 mt-4">
                  <div className="h-8 rounded-lg flex-1" style={{ background: `${t.accent}20` }} />
                  <div className="h-8 rounded-lg flex-1" style={{ background: `${t.accent}20` }} />
                </div>
              </div>
              <div className="bg-white p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-black text-slate-800 text-sm">{t.name}</p>
                    <span className="text-[9px] font-black uppercase" style={{ color: t.accent }}>{t.tag}</span>
                  </div>
                  {config.template.id === t.id && <Check className="w-5 h-5 text-primary" />}
                  <ChevronRight className={`w-4 h-4 text-slate-300 ${config.template.id === t.id ? 'hidden' : ''}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── AI FORM ────────────────────────────────────────────────────
  const [aiForm, setAiForm] = useState({ businessType: 'warung_makan', tone: 'Modern & Minimalis', size: 'A4', notes: '' });
  const [aiProgress, setAiProgress] = useState(0);

  const handleAIGenerate = () => {
    setIsGenerating(true);
    setAiProgress(0);
    const steps = [20, 45, 70, 90, 100];
    steps.forEach((p, i) => setTimeout(() => {
      setAiProgress(p);
      if (p === 100) { setIsGenerating(false); setStep('AI_RESULT'); }
    }, (i + 1) * 700));
  };

  if (step === 'AI_FORM') {
    return (
      <div className="p-6 max-w-3xl mx-auto animate-fade-in">
        <button onClick={() => setStep('HOME')} className="flex items-center gap-2 text-slate-400 font-bold text-sm mb-8 hover:text-primary">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
            <Sparkles className="w-4 h-4" /> AI Visual Magic Generator
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Ceritakan Brand Anda</h2>
          <p className="text-slate-500 font-medium">AI kami akan membuat desain menu 100% unik dalam 30 detik. <span className="font-black text-primary">20 Koin</span></p>
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-xl space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Jenis Usaha</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'warung_makan', label: '🍜 Warung Makan' },
                { key: 'cafe', label: '☕ Cafe / Kopi' },
                { key: 'toko', label: '🛒 Toko / Minimart' },
                { key: 'salon', label: '💇 Salon / Beauty' },
                { key: 'bakery', label: '🎂 Bakery / Kue' },
                { key: 'catering', label: '🍱 Catering' },
              ].map(b => (
                <button key={b.key} onClick={() => setAiForm(f => ({ ...f, businessType: b.key }))}
                  className={`p-3 rounded-2xl border-2 text-sm font-bold transition-all ${aiForm.businessType === b.key ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tone / Suasana</label>
            <div className="grid grid-cols-2 gap-3">
              {['Modern & Minimalis', 'Tradisional & Hangat', 'Colorful & Playful', 'Luxury & Elegant'].map(t => (
                <button key={t} onClick={() => setAiForm(f => ({ ...f, tone: t }))}
                  className={`p-3 rounded-2xl border-2 text-sm font-bold transition-all ${aiForm.tone === t ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ukuran</label>
            <div className="flex gap-3">
              {['A4', 'A3', 'F4', 'Brosur'].map(s => (
                <button key={s} onClick={() => setAiForm(f => ({ ...f, size: s }))}
                  className={`px-5 py-3 rounded-2xl border-2 text-sm font-bold transition-all flex-1 ${aiForm.size === s ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 text-slate-500'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-primary/5 rounded-2xl p-4">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">
              {activeProducts.length} Produk Auto-Sync dari Inventori
            </p>
            <div className="flex flex-wrap gap-2">
              {activeProducts.slice(0, 6).map(p => (
                <span key={p.id} className="text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-100">{p.name}</span>
              ))}
              {activeProducts.length > 6 && <span className="text-xs font-bold text-primary">+{activeProducts.length - 6} lainnya</span>}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Info Tambahan (opsional)</label>
            <textarea value={aiForm.notes} onChange={e => setAiForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Contoh: Warna brand kami hijau tua, nama kasir adalah Pak Budi, kami spesialis nasi goreng..."
              className="input-field w-full h-24 resize-none" />
          </div>

          {isGenerating ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm font-bold text-slate-600">
                <span>AI sedang membuat desain...</span>
                <span className="text-primary font-black">{aiProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="bg-primary h-3 rounded-full transition-all duration-500" style={{ width: `${aiProgress}%` }} />
              </div>
              {[
                [20, '🔍 Menganalisis jenis usaha & tone...'],
                [45, '🎨 Memilih palet warna & tipografi...'],
                [70, '📝 Menulis copywriting produk...'],
                [90, '🖼️ Menyusun layout menu...'],
                [100, '✅ Desain selesai!'],
              ].filter(([p]) => (p as number) <= aiProgress).map(([, label]) => (
                <p key={String(label)} className="text-xs font-bold text-slate-500 flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />{label}
                </p>
              ))}
            </div>
          ) : (
            <button onClick={handleAIGenerate}
              className="w-full btn-premium py-5 text-lg flex items-center justify-center gap-3">
              <Sparkles className="w-6 h-6" /> Generate dengan AI — 20 Koin
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── AI RESULT ──────────────────────────────────────────────────
  if (step === 'AI_RESULT') {
    const aiTemplate = TEMPLATES[1]; // Modern Minimal sebagai hasil AI
    return (
      <div className="p-6 max-w-5xl mx-auto animate-fade-in">
        <button onClick={() => setStep('AI_FORM')} className="flex items-center gap-2 text-slate-400 font-bold text-sm mb-6 hover:text-primary">
          <ArrowLeft className="w-4 h-4" /> Revisi (5 Koin)
        </button>
        <div className="flex items-center gap-3 mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4">
          <Sparkles className="w-5 h-5 text-emerald-500" />
          <div>
            <p className="font-black text-emerald-800">Desain AI Selesai Dibuat!</p>
            <p className="text-xs text-emerald-600 font-medium">Tone: {aiForm.tone} · {aiForm.size} · 20 Koin terpakai</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className={`${aiTemplate.bg} rounded-[2rem] overflow-hidden shadow-2xl`} style={{ background: aiTemplate.pattern, aspectRatio: '210/297', minHeight: '500px' }}>
              <div className="p-10 text-center border-b-2" style={{ borderColor: `${aiTemplate.accent}30` }}>
                <div className="text-4xl mb-2">🤖</div>
                <h1 className="text-4xl font-black uppercase tracking-tighter" style={{ color: aiTemplate.textLight }}>{config.outletName}</h1>
                <p className="text-sm font-bold mt-2" style={{ color: aiTemplate.accent }}>AI-Generated · {aiForm.tone}</p>
              </div>
              <div className="p-8 space-y-4">
                {activeProducts.slice(0, 6).map(p => (
                  <div key={p.id} className="flex justify-between py-2 border-b" style={{ borderColor: `${aiTemplate.accent}20` }}>
                    <span className="font-bold text-sm" style={{ color: aiTemplate.textLight }}>{p.name}</span>
                    <span className="font-black text-sm" style={{ color: aiTemplate.accent }}>Rp {p.price.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-[8px] font-black uppercase tracking-widest opacity-30" style={{ color: aiTemplate.textLight }}>Dibuat dengan AI · Kasir Sakti POS · zyntra.id</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-xl space-y-3">
              <p className="font-black text-slate-800 text-sm uppercase tracking-tight">Download & Cetak</p>
              <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-2">
                <FileDown className="w-4 h-4" /> Download PDF · 2 Koin
              </button>
              <button className="w-full bg-slate-50 text-slate-600 py-4 rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-2">
                <Printer className="w-4 h-4" /> Cetak Langsung
              </button>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 text-xs font-medium text-slate-600 space-y-1">
              <p className="font-black text-primary mb-2">🎨 Pilihan Desain AI:</p>
              <p>• Palet: Slate + White (Modern)</p>
              <p>• Font: Inter (Clean & Professional)</p>
              <p>• Layout: 2 Kolom</p>
              <p>• Tone: {aiForm.tone}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── HOME ──────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
          <Sparkles className="w-4 h-4" /> Studio Desain Menu
        </div>
        <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-3 uppercase italic leading-none">
          Cetak Menu <span className="text-primary">Premium</span>
        </h1>
        <p className="text-xl text-slate-500 font-medium max-w-2xl">
          Desain menu restoran profesional dari produk Inventori Anda — langsung, tanpa perlu desainer.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div onClick={() => setStep('PICK_TEMPLATE')}
          className="group bg-white rounded-[2.5rem] p-10 border-4 border-white hover:border-primary/30 shadow-xl cursor-pointer transition-all duration-300 hover:-translate-y-1">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-500 transition-all">
            <Layout className="w-8 h-8 text-blue-400 group-hover:text-white transition-colors" />
          </div>
          <span className="text-xs font-black text-blue-500 uppercase tracking-widest">Cepat & Pasti Keren</span>
          <h3 className="text-3xl font-black text-slate-900 mt-2 mb-3 tracking-tighter">Template Premium</h3>
          <p className="text-slate-500 font-medium leading-relaxed mb-8">6 template artisan premium. Produk dari Inventori otomatis masuk. Siap cetak dalam 30 detik.</p>
          <div className="flex justify-between items-center pt-6 border-t border-slate-50">
            <span className="text-2xl font-black text-slate-900">5 Koin</span>
            <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center group-hover:bg-primary transition-all">
              <ChevronRight className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div onClick={() => setStep('AI_FORM' as Step)}
          className="group bg-slate-900 rounded-[2.5rem] p-10 border-4 border-slate-900 hover:border-primary shadow-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute top-4 right-6 bg-primary text-white text-[8px] font-black px-3 py-1 rounded-full uppercase animate-pulse">✨ Aktif</div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary/40 transition-all">
            <Wand2 className="w-8 h-8 text-primary" />
          </div>
          <span className="text-xs font-black text-primary uppercase tracking-widest">AI Eksklusif</span>
          <h3 className="text-3xl font-black text-white mt-2 mb-3 tracking-tighter">AI Visual Magic</h3>
          <p className="text-slate-400 font-medium leading-relaxed mb-8">Deskripsikan brand Anda, AI kami buat desain 100% unik. Seperti punya desainer pribadi 24/7.</p>
          <div className="flex justify-between items-center pt-6 border-t border-white/10">
            <span className="text-2xl font-black text-white">20 Koin</span>
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <ChevronRight className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Product sync notice */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-black text-slate-800">Sinkronisasi Otomatis dengan Inventori</p>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            {activeProducts.length} produk aktif dari Inventori akan otomatis masuk ke desain menu Anda.
            {activeProducts.length === 0 && <span className="text-amber-600 font-black"> Tambah produk di Inventori terlebih dahulu.</span>}
          </p>
        </div>
      </div>
    </div>
  );
}
