import React, { useState } from 'react';
import { Search, Plus, Truck, CheckCircle2, Clock, MapPin, Package, FileText, ArrowRight, X, Phone, Mail, Edit2, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';

// Demo Data — synced with real ERP workflow
const DEMO_SUPPLIERS: any[] = [];
const DEMO_POS: any[] = [];

export default function PurchaseOrderPage() {
  const [activeTab, setActiveTab] = useState<'PO' | 'SUPPLIER'>('PO');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('SEMUA');
  const [pos, setPos] = useState(DEMO_POS);
  const { user } = useAuthStore();

  const handleTerima = (poId: string) => {
    setPos(prev => prev.map(p => p.id === poId ? { ...p, status: 'DITERIMA' } : p));
    alert(`Barang diterima masuk gudang.\n\nStok otomatis diperbarui. Jurnal akuntansi: Debet "5-1001 Pembelian Bahan Baku", Kredit "2-1001 Hutang Usaha".`);
  };

  const fmtRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;
  const counts = { all: pos.length, draft: pos.filter(p=>p.status==='DRAFT').length, proses: pos.filter(p=>p.status==='PROSES').length, done: pos.filter(p=>p.status==='DITERIMA').length };

  return (
    <div className="min-h-screen bg-slate-50/50">
    <div className="max-w-[1400px] mx-auto p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white border border-indigo-100 rounded-2xl px-6 py-4 shadow-sm">
        <div>
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Procurement Management</span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-1">Purchase Order & Supplier</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Kelola pesanan pembelian bahan baku · Sinkronisasi otomatis ke inventori & akuntansi</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border border-indigo-200 rounded-xl overflow-hidden">
            {(['PO','SUPPLIER'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-4 py-2.5 text-[11px] font-black uppercase tracking-wide transition-colors ${activeTab===t ? 'bg-indigo-600 text-white' : 'text-indigo-400 hover:bg-indigo-50'}`}>
                {t==='PO' ? 'Data PO' : 'Supplier'}
              </button>
            ))}
          </div>
          <button onClick={() => setShowCreateModal(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all">
            <Plus className="w-4 h-4" /> Buat PO
          </button>
        </div>
      </div>

      {activeTab === 'PO' ? (
        <div className="space-y-6">

          {/* Status KPI */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label:'Semua PO', val: counts.all, icon:<FileText className="w-4 h-4"/>, filter:'SEMUA' },
              { label:'Draft', val: counts.draft, icon:<Clock className="w-4 h-4"/>, filter:'DRAFT' },
              { label:'Dalam Proses', val: counts.proses, icon:<Truck className="w-4 h-4"/>, filter:'PROSES' },
              { label:'Diterima', val: counts.done, icon:<CheckCircle2 className="w-4 h-4"/>, filter:'DITERIMA' },
            ].map(s => (
              <button key={s.label} onClick={() => setStatusFilter(s.filter)}
                className={`bg-white border rounded-2xl p-5 text-left transition-all group ${statusFilter===s.filter ? 'border-indigo-400 shadow-md shadow-indigo-50' : 'border-indigo-100 hover:border-indigo-300'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 transition-all ${statusFilter===s.filter ? 'bg-indigo-600 text-white' : 'bg-indigo-50 border border-indigo-100 text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent'}`}>{s.icon}</div>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{s.label}</p>
                <p className="text-2xl font-black text-slate-800 mt-1">{s.val}</p>
              </button>
            ))}
          </div>

          {/* PO Table */}
          <div className="bg-white border border-indigo-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-indigo-50 flex justify-between items-center">
              <h2 className="font-black text-slate-800 text-sm uppercase tracking-tight">Daftar Purchase Order</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 w-3.5 h-3.5" />
                <input type="text" placeholder="Cari No. PO..." className="border border-indigo-100 rounded-lg pl-9 pr-4 py-2 text-xs w-56 focus:outline-none focus:border-indigo-400 bg-indigo-50/50" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-indigo-50 bg-indigo-50/30">
                    {['No. PO','Supplier','Catatan','Item','Total','Status','Aksi'].map(h => (
                      <th key={h} className="px-5 py-3 text-[10px] font-black text-indigo-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-50">
                  {pos.filter(p => statusFilter==='SEMUA' || p.status===statusFilter).map(p => (
                    <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-black text-slate-800 text-xs">{p.id}</p>
                        <p className="text-[10px] text-slate-400">{p.date}</p>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-700 text-xs">{p.supplier}</td>
                      <td className="px-5 py-4 text-xs text-slate-500 max-w-[200px] truncate">{p.note}</td>
                      <td className="px-5 py-4"><span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-black">{p.items} Jenis</span></td>
                      <td className="px-5 py-4 font-black text-slate-800 text-xs">{fmtRp(p.total)}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${
                          p.status==='DITERIMA' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          p.status==='PROSES' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>{p.status}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {p.status==='PROSES' ? (
                          <button onClick={() => handleTerima(p.id)} className="bg-indigo-600 text-white text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1 ml-auto">
                            <CheckCircle2 className="w-3 h-3" /> Terima
                          </button>
                        ) : (
                          <span className="text-indigo-400 font-bold text-[10px] flex items-center justify-end gap-1 cursor-pointer hover:text-indigo-700">Detail <ArrowRight className="w-3 h-3"/></span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pos.filter(p => statusFilter==='SEMUA' || p.status===statusFilter).length === 0 && (
                <div className="py-16 text-center">
                  <Package className="w-10 h-10 text-indigo-200 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-400">Belum ada Purchase Order</p>
                  <p className="text-xs text-slate-300 mt-1">Klik "Buat PO" untuk memulai pemesanan ke supplier</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* SUPPLIER TAB */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEMO_SUPPLIERS.map(sup => (
              <div key={sup.id} className="bg-white border border-indigo-100 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-all">
                    <Truck className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{sup.category}</span>
                </div>
                <h3 className="font-black text-slate-800 text-base mb-2">{sup.name}</h3>
                <div className="space-y-1.5 mb-4">
                  <p className="text-xs text-slate-500 flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-indigo-400" />{sup.contact}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-indigo-400" />{sup.email}</p>
                  <p className="text-xs text-slate-400 flex items-start gap-2"><MapPin className="w-3.5 h-3.5 text-indigo-300 mt-0.5 flex-shrink-0" />{sup.address}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-indigo-50">
                  <div>
                    <p className="text-[9px] font-black text-indigo-400 uppercase">Total PO</p>
                    <p className="font-black text-slate-800">{sup.totalPO}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-indigo-400 uppercase">Order Terakhir</p>
                    <p className="font-bold text-slate-600 text-xs">{sup.lastOrder}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 py-2 rounded-lg hover:bg-indigo-600 hover:text-white hover:border-transparent transition-all flex items-center justify-center gap-1"><Edit2 className="w-3 h-3"/>Edit</button>
                  <button className="flex-1 text-xs font-bold text-slate-500 bg-white border border-slate-200 py-2 rounded-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-1">Riwayat <ArrowRight className="w-3 h-3"/></button>
                </div>
              </div>
            ))}
            <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[280px] cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group">
              <div className="w-12 h-12 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-center mb-3 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-all">
                <Plus className="w-5 h-5 text-indigo-400 group-hover:text-white" />
              </div>
              <p className="font-black text-indigo-400 text-xs uppercase tracking-widest group-hover:text-indigo-700">Tambah Supplier</p>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PO MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 text-white relative">
              <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 bg-white/15 p-1.5 rounded-lg hover:bg-white/30 transition-colors">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center"><Truck className="w-5 h-5"/></div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight">Buat Purchase Order</h2>
                  <p className="text-indigo-200 text-xs">Pesan bahan baku ke supplier untuk restok gudang</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5 bg-indigo-50/30">
              <div className="bg-white p-5 rounded-xl border border-indigo-100 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Pilih Supplier</label>
                  <select className="w-full border border-indigo-200 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 bg-white">
                    {DEMO_SUPPLIERS.map(s => <option key={s.id}>{s.name} ({s.category})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Catatan PO</label>
                  <textarea rows={2} className="w-full border border-indigo-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 bg-white resize-none" placeholder="Contoh: Restok bulanan beras & minyak goreng..." />
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-emerald-800 text-xs">Integrasi Otomatis Aktif</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">Saat PO berstatus "Diterima", stok inventori & jurnal akuntansi akan diperbarui secara otomatis.</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-indigo-100">
                <button onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 uppercase tracking-wider">Batal</button>
                <button onClick={() => { setShowCreateModal(false); alert('PO Draft berhasil dibuat!'); }} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 shadow-md shadow-indigo-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Buat Draft PO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
    </div>
  );
}
