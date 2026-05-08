import React, { useState, useRef } from 'react';
import {
  Package, Search, Plus, Edit2, Trash2, ArrowUpRight,
  ArrowDownRight, X, Check, Barcode, DollarSign, Layers,
  Image as ImageIcon, ToggleLeft, ToggleRight, AlertTriangle,
  TrendingUp, ShoppingBag, Tag
} from 'lucide-react';
import { useProductStore, Product } from '../../stores/product.store';

const CATEGORIES = ['Makanan', 'Minuman', 'Snack', 'Paket', 'Bahan Baku', 'Lain-lain'];

export default function InventoryPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Semua');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', price: '', cost: '', stock: '', category: 'Makanan', sku: '', description: '', imageUrl: '' });
  const imgRef = useRef<HTMLInputElement>(null);

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.includes(search);
    const matchCat = catFilter === 'Semua' || p.category === catFilter;
    return matchSearch && matchCat;
  });

  const totalValue = products.reduce((a, p) => a + p.price * p.stock, 0);
  const lowStock = products.filter(p => p.stock < 5 && p.stock > 0).length;
  const outOfStock = products.filter(p => p.stock === 0).length;

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: '', price: '', cost: '', stock: '', category: 'Makanan', sku: '', description: '', imageUrl: '' });
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditItem(p);
    setForm({ name: p.name, price: String(p.price), cost: String(p.cost), stock: String(p.stock), category: p.category, sku: p.sku, description: p.description ?? '', imageUrl: p.imageUrl ?? '' });
    setShowModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(prev => ({ ...prev, imageUrl: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!form.name || !form.price) return;
    const data = {
      name: form.name,
      price: parseInt(form.price) || 0,
      cost: parseInt(form.cost) || 0,
      stock: parseInt(form.stock) || 0,
      category: form.category,
      sku: form.sku || `SKU-${Date.now()}`,
      description: form.description,
      imageUrl: form.imageUrl,
      isActive: true,
    };
    if (editItem) {
      updateProduct(editItem.id, data);
    } else {
      addProduct(data);
    }
    setShowModal(false);
  };

  const fmtRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Manajemen Produk</h1>
          <p className="text-slate-500 font-medium mt-1">Tambah produk di sini → otomatis muncul di POS & Template Menu</p>
        </div>
        <button onClick={openAdd} className="btn-primary px-8 py-3 flex items-center gap-2 text-sm">
          <Plus className="w-5 h-5" /> Tambah Produk Baru
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Produk', value: products.length, icon: <Package className="w-5 h-5" />, color: 'bg-primary/10 text-primary' },
          { label: 'Nilai Stok', value: `Rp ${(totalValue / 1000000).toFixed(1)}M`, icon: <DollarSign className="w-5 h-5" />, color: 'bg-emerald-100 text-emerald-600' },
          { label: 'Stok Menipis', value: lowStock, icon: <AlertTriangle className="w-5 h-5" />, color: 'bg-amber-100 text-amber-600' },
          { label: 'Habis', value: outOfStock, icon: <Layers className="w-5 h-5" />, color: 'bg-rose-100 text-rose-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-lg">
            <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Cari nama produk atau SKU..." className="input-field w-full pl-10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['Semua', ...CATEGORIES].map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${catFilter === c ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(p => (
          <div key={p.id} className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all hover:shadow-xl ${!p.isActive ? 'opacity-50' : 'border-transparent hover:border-primary/30'}`}>
            {/* Image */}
            <div className="aspect-video bg-slate-50 relative overflow-hidden">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-12 h-12 text-slate-200" />
                </div>
              )}
              {/* Stock badge */}
              <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-[9px] font-black ${
                p.stock === 0 ? 'bg-rose-500 text-white' :
                p.stock < 5 ? 'bg-amber-500 text-white' :
                'bg-emerald-500 text-white'
              }`}>
                {p.stock === 0 ? 'HABIS' : `${p.stock} pcs`}
              </div>
              {/* Category */}
              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[9px] font-black text-slate-600">
                {p.category}
              </div>
            </div>

            <div className="p-4">
              <h4 className="font-black text-slate-800 text-sm leading-tight mb-1">{p.name}</h4>
              <p className="text-[10px] font-mono text-slate-400 mb-3">{p.sku}</p>

              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold">Harga Jual</p>
                  <p className="font-black text-primary">{fmtRp(p.price)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold">HPP</p>
                  <p className="font-bold text-slate-500 text-sm">{fmtRp(p.cost)}</p>
                </div>
              </div>

              {/* Margin indicator */}
              <div className="mb-4">
                <div className="flex justify-between text-[9px] font-bold text-slate-400 mb-1">
                  <span>Margin</span>
                  <span className="text-emerald-500">{p.cost > 0 ? Math.round((p.price - p.cost) / p.price * 100) : 0}%</span>
                </div>
                <div className="h-1 bg-slate-100 rounded-full">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${p.cost > 0 ? Math.round((p.price - p.cost) / p.price * 100) : 0}%` }}></div>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-primary/10 hover:text-primary transition-all text-xs font-black">
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => updateProduct(p.id, { isActive: !p.isActive })}
                  className={`p-2 rounded-xl transition-all ${p.isActive ? 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                  {p.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </button>
                <button onClick={() => deleteProduct(p.id)} className="p-2 rounded-xl bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add product card */}
        <div onClick={openAdd} className="bg-white/50 border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group min-h-[300px]">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all">
            <Plus className="w-7 h-7 text-slate-300 group-hover:text-white" />
          </div>
          <p className="font-black text-slate-400 group-hover:text-primary text-sm uppercase tracking-widest">Tambah Produk</p>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-8 pb-0">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">
                {editItem ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Foto Produk</label>
                <div
                  onClick={() => imgRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-2xl aspect-video flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all overflow-hidden relative"
                >
                  {form.imageUrl ? (
                    <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-400">Klik untuk upload foto produk</p>
                      <p className="text-[9px] text-slate-300 mt-1">PNG, JPG, WEBP · Max 5MB</p>
                    </div>
                  )}
                  {form.imageUrl && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                      <p className="text-white font-black text-sm uppercase">Ganti Foto</p>
                    </div>
                  )}
                </div>
                <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Produk *</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} type="text" className="input-field w-full" placeholder="Contoh: Nasi Goreng Spesial" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Harga Jual (Rp) *</label>
                  <input value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} type="number" className="input-field w-full" placeholder="25000" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Harga Pokok (HPP)</label>
                  <input value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} type="number" className="input-field w-full" placeholder="10000" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Stok Awal</label>
                  <input value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} type="number" className="input-field w-full" placeholder="0" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kategori</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="input-field w-full">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">SKU / Kode Produk</label>
                  <input value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))} type="text" className="input-field w-full" placeholder="Kosongkan untuk generate otomatis" />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Deskripsi (Tampil di Menu)</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className="input-field w-full resize-none" placeholder="Uraian singkat produk untuk menu pelanggan..." />
                </div>
              </div>

              {/* Margin preview */}
              {form.price && form.cost && (
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-emerald-700">Estimasi Margin</span>
                    <span className="text-xl font-black text-emerald-600">
                      {Math.round((parseInt(form.price) - parseInt(form.cost)) / parseInt(form.price) * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-emerald-600 mt-1">
                    Keuntungan per item: Rp {(parseInt(form.price) - parseInt(form.cost)).toLocaleString('id-ID')}
                  </p>
                </div>
              )}

              <button onClick={handleSave} disabled={!form.name || !form.price}
                className="w-full btn-primary py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                <Check className="w-5 h-5" /> {editItem ? 'Simpan Perubahan' : 'Tambah Produk ke POS'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
