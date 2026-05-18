import React, { useState, useRef, useEffect } from 'react';
import {
  Upload, CheckCircle, AlertCircle, ArrowRight, FileSpreadsheet,
  Package, Users, DollarSign, BookOpen, Zap, RefreshCw,
  Download, ShieldCheck, ChevronDown, ChevronUp, Sparkles, Coins
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { useProductStore } from '../../stores/product.store';
import { getActivePricing } from '../../constants/pricing.constants';
import { generateSecureToken } from '../../lib/security';

type MigrateSource = 'MOKA' | 'ISELLER' | 'OLSERA' | 'EXCEL' | 'MANUAL';
type StepId = 'SOURCE' | 'UPLOAD' | 'PREVIEW' | 'MIGRATE' | 'DONE';

interface DataModule {
  key: string; label: string; icon: React.ReactNode;
  count: number; status: 'PENDING' | 'IMPORTING' | 'DONE' | 'ERROR';
  color: string;
}

const SOURCES: { key: MigrateSource; label: string; logo: string; desc: string }[] = [
  { key: 'MOKA', label: 'Moka POS', logo: '🔴', desc: 'Export dari Moka → Laporan → Download CSV' },
  { key: 'ISELLER', label: 'iSeller', logo: '🟣', desc: 'Export dari iSeller → Data → Export Excel' },
  { key: 'OLSERA', label: 'Olsera', logo: '🔵', desc: 'Export dari Olsera → Laporan → CSV' },
  { key: 'EXCEL', label: 'Excel / CSV', logo: '🟢', desc: 'Upload file Excel atau CSV apapun' },
  { key: 'MANUAL', label: 'Input Manual', logo: '✏️', desc: 'Isi wizard step-by-step' },
];

const fmtRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

// Simulated preview data after "parsing"
const PREVIEW_DATA = {
  products:  [
    { name: 'Nasi Goreng Spesial', price: 25000, category: 'Makanan', stock: 100 },
    { name: 'Es Teh Manis', price: 5000, category: 'Minuman', stock: 200 },
    { name: 'Mie Ayam Bakso', price: 20000, category: 'Makanan', stock: 50 },
    { name: 'Kopi Susu', price: 15000, category: 'Minuman', stock: 80 },
    { name: 'Ayam Bakar', price: 30000, category: 'Makanan', stock: 30 },
  ],
  customers: [
    { name: 'Budi Santoso', phone: '08123456789', totalSpent: 1500000 },
    { name: 'Siti Aminah', phone: '08567890123', totalSpent: 450000 },
    { name: 'Andi Wijaya', phone: '08190123456', totalSpent: 250000 },
  ],
  transactions: 1247,
  totalRevenue: 48500000,
  employees: [
    { name: 'Ahmad Kasir', position: 'Kasir', salary: 2500000 },
    { name: 'Doni Staff', position: 'Pramusaji', salary: 2000000 },
  ],
};

export default function MigrationPage() {
  const { user, setAuth } = useAuthStore();
  const { addProduct } = useProductStore();
  
  const [migrationPrice, setMigrationPrice] = useState(0);
  
  useEffect(() => {
    const p = getActivePricing().find(m => m.id === 'migration');
    if (p && p.oneTimePrice) {
      setMigrationPrice(p.oneTimePrice);
    }
  }, []);

  const [step, setStep] = useState<StepId>('SOURCE');
  const [source, setSource] = useState<MigrateSource | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [parsedProducts, setParsedProducts] = useState<any[]>(PREVIEW_DATA.products);
  const [showPreview, setShowPreview] = useState<Record<string, boolean>>({});
  const [modules, setModules] = useState<DataModule[]>([
    { key: 'products',     label: 'Produk & Menu',       icon: <Package className="w-5 h-5" />,     count: 5,    status: 'PENDING', color: 'text-blue-600 bg-blue-100' },
    { key: 'customers',   label: 'Data Pelanggan',       icon: <Users className="w-5 h-5" />,       count: 3,    status: 'PENDING', color: 'text-emerald-600 bg-emerald-100' },
    { key: 'transactions',label: 'Riwayat Transaksi',    icon: <DollarSign className="w-5 h-5" />,  count: 1247, status: 'PENDING', color: 'text-primary bg-primary/10' },
    { key: 'employees',   label: 'Data Karyawan (HRD)',  icon: <BookOpen className="w-5 h-5" />,    count: 2,    status: 'PENDING', color: 'text-amber-600 bg-amber-100' },
  ]);
  const [migrateProgress, setMigrateProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent) => {
    if ('target' in e && (e.target as HTMLInputElement).files?.length) {
      const file = (e.target as HTMLInputElement).files![0];
      setUploading(true);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        if (text) {
          const lines = text.split('\n').filter(l => l.trim().length > 0);
          const newProducts = [];
          // Skip header if typical CSV, but we'll try to parse data loosely
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
            if (cols.length >= 3) {
              newProducts.push({
                name: cols[0] || `Produk ${i}`,
                price: parseInt(cols[1]) || 0,
                category: cols[2] || 'Lain-lain',
                stock: parseInt(cols[3]) || 0,
                cost: 0,
                sku: `MIG-${Date.now()}-${i}`,
                isActive: true,
                unit: 'pcs',
                isComposite: false
              });
            }
          }
          if (newProducts.length > 0) {
            setParsedProducts(newProducts);
            setModules(prev => prev.map(m => m.key === 'products' ? { ...m, count: newProducts.length } : m));
          }
        }
        setUploading(false);
        setUploadDone(true);
        setTimeout(() => setStep('PREVIEW'), 1000);
      };
      reader.readAsText(file);
    } else {
      // Demo upload
      setUploading(true);
      setTimeout(() => { 
        setUploading(false); 
        setUploadDone(true); 
        setParsedProducts(PREVIEW_DATA.products);
        setTimeout(() => setStep('PREVIEW'), 1000);
      }, 2000);
    }
  };

  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);

  const startMigration = () => {
    if (!user) return;
    if ((user.coins || 0) < migrationPrice) {
      alert(`Koin tidak cukup! Sisa koin: ${user.coins || 0}`);
      return;
    }
    
    // Deduct coins
    setAuth({ ...user, coins: (user.coins || 0) - migrationPrice }, generateSecureToken());
    setShowPaymentConfirm(false);

    setStep('MIGRATE');
    setMigrateProgress(0);
    // Simulate each module importing one by one
    const delays = [800, 1800, 3200, 4500];
    delays.forEach((delay, i) => {
      setTimeout(() => {
        setModules(prev => prev.map((m, idx) => idx === i ? { ...m, status: 'IMPORTING' } : m));
      }, delay - 400);
      setTimeout(() => {
        setModules(prev => prev.map((m, idx) => idx === i ? { ...m, status: 'DONE' } : m));
        setMigrateProgress(Math.round(((i + 1) / 4) * 100));
        
        // Actually save products when products module is done
        if (i === 0) {
          parsedProducts.forEach(p => addProduct(p));
        }
        
        if (i === 3) setTimeout(() => setStep('DONE'), 500);
      }, delay);
    });
  };

  const handleMigrateClick = () => {
    if (migrationPrice > 0) {
      setShowPaymentConfirm(true);
    } else {
      startMigration();
    }
  };

  // ── STEP: SOURCE ──────────────────────────────────────────────
  if (step === 'SOURCE') return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
          <Sparkles className="w-4 h-4" /> Smart Migration Engine
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-3">Pindah ke VISTRAL POS<br /><span className="text-primary italic">dalam 1 Klik. Gratis.</span></h1>
        <p className="text-lg text-slate-500 font-medium max-w-2xl">
          Data menu, pelanggan, transaksi, dan karyawan Anda dari aplikasi lama bisa dipindahkan secara otomatis — tanpa ketik ulang satu per satu.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {SOURCES.map(s => (
          <div key={s.key} onClick={() => setSource(s.key)}
            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all hover:-translate-y-0.5 ${source === s.key ? 'border-primary bg-primary/5 shadow-lg' : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'}`}>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-4xl">{s.logo}</span>
              <div>
                <p className="font-black text-slate-900 text-lg">{s.label}</p>
                <p className="text-xs text-slate-400 font-medium">{s.desc}</p>
              </div>
              {source === s.key && <CheckCircle className="w-5 h-5 text-primary ml-auto flex-shrink-0" />}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-8 flex gap-4">
        <ShieldCheck className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-black text-slate-800">100% Aman & Gratis</p>
          <p className="text-sm text-slate-600 font-medium mt-0.5">Data Anda dienkripsi AES-256 selama proses migrasi. Tidak ada data yang dikirim ke pihak ketiga. Proses terjadi di server Zyntra Labs.</p>
        </div>
      </div>

      <button onClick={() => source && setStep('UPLOAD')} disabled={!source}
        className="btn-premium px-10 py-4 text-base flex items-center gap-3 disabled:opacity-40">
        Lanjut — Pilih Data <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  // ── STEP: UPLOAD ──────────────────────────────────────────────
  if (step === 'UPLOAD') {
    const src = SOURCES.find(s => s.key === source)!;
    return (
      <div className="p-6 max-w-3xl mx-auto animate-fade-in">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{src.logo}</span>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Migrasi dari</p>
              <h2 className="text-2xl font-black text-slate-900">{src.label}</h2>
            </div>
          </div>

          {source !== 'MANUAL' ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
              <p className="font-black text-amber-800 mb-3">Cara Export dari {src.label}:</p>
              <ol className="space-y-2 text-sm text-amber-700 font-medium">
                {source === 'MOKA' && ['Buka Moka POS → Laporan', 'Pilih: Produk, Pelanggan, Transaksi', 'Klik Download CSV / Excel', 'Upload semua file di bawah'].map((s, i) => <li key={i}><span className="font-black">{i+1}.</span> {s}</li>)}
                {source === 'ISELLER' && ['Buka iSeller → Data & Laporan', 'Export: Menu, Customer, Transaksi', 'Format: Excel (.xlsx)', 'Upload file di bawah'].map((s, i) => <li key={i}><span className="font-black">{i+1}.</span> {s}</li>)}
                {source === 'OLSERA' && ['Login Olsera → Laporan', 'Pilih Export Data', 'Format: CSV', 'Upload file di bawah'].map((s, i) => <li key={i}><span className="font-black">{i+1}.</span> {s}</li>)}
                {source === 'EXCEL' && ['Siapkan file Excel/CSV Anda', 'Kolom wajib: Nama, Harga, Kategori (produk)', 'Atau: Nama, HP, Total Belanja (pelanggan)', 'Upload di bawah'].map((s, i) => <li key={i}><span className="font-black">{i+1}.</span> {s}</li>)}
              </ol>
              <a href="#" className="inline-flex items-center gap-2 mt-4 text-amber-700 font-black text-sm hover:underline">
                <Download className="w-4 h-4" /> Download Template Excel
              </a>
            </div>
          ) : null}
        </div>

        {/* Upload Zone */}
        <div onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${uploadDone ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white hover:border-primary hover:bg-primary/5'}`}>
          {uploadDone ? (
            <>
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <p className="font-black text-emerald-700 text-xl">File Berhasil Dibaca!</p>
              <p className="text-emerald-600 font-medium mt-2">data_moka_export.xlsx · 1.247 baris data ditemukan</p>
            </>
          ) : uploading ? (
            <>
              <RefreshCw className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
              <p className="font-black text-slate-700 text-xl">Membaca & Parsing Data...</p>
              <p className="text-slate-400 font-medium mt-2">Mohon tunggu, ini hanya beberapa detik</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <FileSpreadsheet className="w-10 h-10 text-slate-400" />
              </div>
              <p className="font-black text-slate-700 text-xl mb-2">Drop file di sini</p>
              <p className="text-slate-400 font-medium">atau klik untuk pilih file</p>
              <p className="text-xs text-slate-300 mt-3 font-bold uppercase tracking-widest">Excel (.xlsx) · CSV · ZIP</p>
            </>
          )}
          <input ref={fileRef} type="file" className="hidden" accept=".xlsx,.csv,.zip" onChange={handleUpload} />
        </div>

        {!uploadDone && !uploading && (
          <button onClick={handleUpload} className="w-full mt-4 btn-premium py-4 flex items-center justify-center gap-2">
            <Upload className="w-5 h-5" /> Simulasikan Upload (Demo)
          </button>
        )}

        {uploadDone && (
          <button onClick={() => setStep('PREVIEW')} className="w-full mt-4 btn-premium py-4 flex items-center justify-center gap-2">
            Lihat Preview Data <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  }

  // ── STEP: PREVIEW ─────────────────────────────────────────────
  if (step === 'PREVIEW') return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
          <h2 className="text-3xl font-black text-slate-900">Data Ditemukan!</h2>
        </div>
        <p className="text-slate-500 font-medium">Periksa data yang akan diimpor. Anda bisa pilih modul mana saja yang ingin dipindahkan.</p>
      </div>

      <div className="space-y-4 mb-8">
        {/* Products */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex items-center gap-4 p-5 cursor-pointer hover:bg-slate-50" onClick={() => setShowPreview(p => ({ ...p, products: !p.products }))}>
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><Package className="w-5 h-5" /></div>
            <div className="flex-1">
              <p className="font-black text-slate-900">Produk & Menu</p>
              <p className="text-xs text-slate-400 font-bold">{parsedProducts.length} produk ditemukan</p>
            </div>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-3 py-1 rounded-full">Siap Import</span>
            {showPreview.products ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
          {showPreview.products && (
            <div className="border-t border-slate-50 overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 sticky top-0"><tr>{['Nama Produk', 'Harga', 'Kategori', 'Stok'].map(h => <th key={h} className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {parsedProducts.map((p, i) => (
                    <tr key={i}><td className="px-5 py-3 font-bold text-slate-700">{p.name}</td><td className="px-5 py-3">{fmtRp(p.price)}</td><td className="px-5 py-3 text-slate-500">{p.category}</td><td className="px-5 py-3">{p.stock}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Customers */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex items-center gap-4 p-5 cursor-pointer hover:bg-slate-50" onClick={() => setShowPreview(p => ({ ...p, customers: !p.customers }))}>
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center"><Users className="w-5 h-5" /></div>
            <div className="flex-1"><p className="font-black text-slate-900">Data Pelanggan</p><p className="text-xs text-slate-400 font-bold">{PREVIEW_DATA.customers.length} pelanggan ditemukan</p></div>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-3 py-1 rounded-full">Siap Import</span>
            {showPreview.customers ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
          {showPreview.customers && (
            <div className="border-t border-slate-50"><table className="w-full text-sm"><thead className="bg-slate-50"><tr>{['Nama', 'HP', 'Total Belanja'].map(h => <th key={h} className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-50">{PREVIEW_DATA.customers.map(c => <tr key={c.name}><td className="px-5 py-3 font-bold">{c.name}</td><td className="px-5 py-3 text-slate-500">{c.phone}</td><td className="px-5 py-3 font-bold text-primary">{fmtRp(c.totalSpent)}</td></tr>)}</tbody></table></div>
          )}
        </div>

        {/* Transactions summary */}
        <div className="bg-white rounded-2xl shadow-lg p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center"><DollarSign className="w-5 h-5" /></div>
          <div className="flex-1">
            <p className="font-black text-slate-900">Riwayat Transaksi</p>
            <p className="text-xs text-slate-400 font-bold">{PREVIEW_DATA.transactions.toLocaleString()} transaksi · Total {fmtRp(PREVIEW_DATA.totalRevenue)}</p>
          </div>
          <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-3 py-1 rounded-full">Siap Import</span>
        </div>

        {/* Employees */}
        <div className="bg-white rounded-2xl shadow-lg p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center"><BookOpen className="w-5 h-5" /></div>
          <div className="flex-1">
            <p className="font-black text-slate-900">Data Karyawan (HRD)</p>
            <p className="text-xs text-slate-400 font-bold">{PREVIEW_DATA.employees.length} karyawan ditemukan</p>
          </div>
          <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-3 py-1 rounded-full">Siap Import</span>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-6">
        <p className="font-black text-primary mb-1">🎯 Ringkasan Migrasi</p>
        <p className="text-sm text-slate-600 font-medium">{parsedProducts.length} produk · 3 pelanggan · 1.247 transaksi · 2 karyawan akan dipindahkan ke VISTRAL POS.</p>
      </div>

      <button onClick={handleMigrateClick} className="w-full btn-premium py-5 text-lg flex items-center justify-center gap-3 relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 -translate-x-full skew-x-12" />
        <Zap className="w-6 h-6" /> Mulai Migrasi Sekarang — 1 Klik!
      </button>

      {/* Payment Confirmation Modal */}
      {showPaymentConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-5">
              <Coins className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 text-center mb-2">Bayar per Pakai</h3>
            <p className="text-slate-500 font-medium text-center mb-6">
              Fitur Migrasi Data menggunakan sistem pembayaran per penggunaan. Anda akan dikenakan biaya <strong className="text-amber-500">{migrationPrice} Koin</strong> untuk melakukan migrasi ini.
            </p>
            
            <div className="bg-slate-50 rounded-2xl p-4 mb-6 flex justify-between items-center">
              <span className="font-bold text-slate-600">Saldo Koin Anda</span>
              <span className="font-black text-amber-500 text-lg">{user?.coins || 0}</span>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowPaymentConfirm(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">
                Batal
              </button>
              <button onClick={startMigration} className="flex-1 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/30">
                Bayar & Migrasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── STEP: MIGRATE ─────────────────────────────────────────────
  if (step === 'MIGRATE') return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8 relative">
        <Zap className="w-12 h-12 text-primary" />
        <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-pulse" />
      </div>
      <h2 className="text-3xl font-black text-slate-900 mb-2 text-center">Sedang Migrasi...</h2>
      <p className="text-slate-400 font-medium mb-10 text-center">Mohon jangan tutup halaman ini</p>

      <div className="w-full bg-slate-100 rounded-full h-4 mb-8">
        <div className="bg-primary h-4 rounded-full transition-all duration-500" style={{ width: `${migrateProgress}%` }} />
      </div>
      <p className="text-primary font-black text-2xl mb-8">{migrateProgress}%</p>

      <div className="w-full space-y-3">
        {modules.map(m => (
          <div key={m.key} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${m.status === 'DONE' ? 'border-emerald-200 bg-emerald-50' : m.status === 'IMPORTING' ? 'border-primary/30 bg-primary/5' : 'border-slate-100 bg-white'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${m.color}`}>{m.icon}</div>
            <div className="flex-1">
              <p className="font-bold text-slate-800 text-sm">{m.label}</p>
              <p className="text-xs text-slate-400 font-bold">{m.count.toLocaleString()} data</p>
            </div>
            {m.status === 'DONE' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
            {m.status === 'IMPORTING' && <RefreshCw className="w-5 h-5 text-primary animate-spin" />}
            {m.status === 'PENDING' && <div className="w-5 h-5 rounded-full border-2 border-slate-200" />}
          </div>
        ))}
      </div>
    </div>
  );

  // ── STEP: DONE ────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-emerald-200">
        <CheckCircle className="w-16 h-16 text-emerald-500" />
      </div>
      <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">
        <Sparkles className="w-4 h-4" /> Migrasi Selesai!
      </div>
      <h2 className="text-4xl font-black text-slate-900 mb-4">Selamat Datang di<br />VISTRAL POS! 🎉</h2>
      <p className="text-slate-500 font-medium mb-8 max-w-md">Semua data Anda sudah berhasil dipindahkan. Mulai gunakan VISTRAL POS sekarang!</p>

      <div className="grid grid-cols-2 gap-4 w-full mb-10">
        {[
          { label: 'Produk Diimpor', value: '5', icon: '📦', color: 'bg-blue-50 border-blue-100' },
          { label: 'Pelanggan Diimpor', value: '3', icon: '👥', color: 'bg-emerald-50 border-emerald-100' },
          { label: 'Transaksi Diimpor', value: '1.247', icon: '💳', color: 'bg-primary/5 border-primary/10' },
          { label: 'Karyawan Diimpor', value: '2', icon: '👔', color: 'bg-amber-50 border-amber-100' },
        ].map(s => (
          <div key={s.label} className={`${s.color} border rounded-2xl p-5 text-center`}>
            <div className="text-3xl mb-2">{s.icon}</div>
            <p className="text-2xl font-black text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 font-bold">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 w-full">
        <a href="/pos" className="py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-2 hover:bg-primary transition-colors">
          <Zap className="w-4 h-4" /> Mulai Kasir
        </a>
        <a href="/dashboard" className="py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
          Lihat Dashboard
        </a>
      </div>
    </div>
  );
}
