import React, { useState, useRef } from 'react';
import {
  Package, Search, Plus, Edit2, Trash2, ArrowUpRight,
  ArrowDownRight, X, Check, Barcode, DollarSign, Layers,
  Image as ImageIcon, ToggleLeft, ToggleRight, AlertTriangle,
  TrendingUp, ShoppingBag, Tag, ClipboardCheck
} from 'lucide-react';
import { useProductStore, Product } from '../../stores/product.store';

export default function InventoryPage() {
  const { products, addProduct, updateProduct, deleteProduct, categories, addCategory, updateCategory, deleteCategory } = useProductStore();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Semua');
  const [showModal, setShowModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [showOpnameModal, setShowOpnameModal] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [form, setForm] = useState({ 
    name: '', price: '', cost: '', stock: '', category: 'Makanan', sku: '', description: '', imageUrl: '',
    unit: 'pcs', isComposite: false, components: [] as { productId: string; quantity: number; }[]
  });
  const imgRef = useRef<HTMLInputElement>(null);

  // Auto-save draft logic
  React.useEffect(() => {
    if (!editItem && showModal) {
      const isNotEmpty = form.name || form.price || form.description;
      if (isNotEmpty) {
        localStorage.setItem('sakti_product_draft', JSON.stringify(form));
      }
    }
  }, [form, editItem, showModal]);

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
    const draft = localStorage.getItem('sakti_product_draft');
    if (draft) {
      setForm(JSON.parse(draft));
    } else {
      setForm({ name: '', price: '', cost: '', stock: '', category: 'Makanan', sku: '', description: '', imageUrl: '', unit: 'pcs', isComposite: false, components: [] });
    }
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditItem(p);
    setForm({ 
      name: p.name, price: String(p.price), cost: String(p.cost), stock: String(p.stock), 
      category: p.category, sku: p.sku, description: p.description ?? '', imageUrl: p.imageUrl ?? '',
      unit: p.unit ?? 'pcs', isComposite: p.isComposite ?? false, components: p.components ? p.components.map(c => ({ productId: c.productId, quantity: c.quantity })) : []
    });
    setShowModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Smart Image Resizer: Fixes cross-device missing photo issues
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 500;
        let width = img.width;
        let height = img.height;
        
        // Calculate aspect ratio
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Export consistently as lightweight webp
        const resizedUrl = canvas.toDataURL('image/webp', 0.8);
        setForm(prev => ({ ...prev, imageUrl: resizedUrl }));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const data: any = {
      name: form.name,
      price: parseInt(form.price) || 0,
      cost: parseInt(form.cost) || 0,
      stock: parseInt(form.stock) || 0,
      category: form.category,
      sku: form.sku || `SKU-${Date.now()}`,
      description: form.description,
      imageUrl: form.imageUrl,
      isActive: true,
      unit: form.unit,
      isComposite: form.isComposite,
      components: form.isComposite ? form.components.map(c => ({ id: `comp-${Date.now()}-${Math.random()}`, ...c })) : []
    };
    if (editItem) {
      updateProduct(editItem.id, data);
    } else {
      addProduct(data);
      localStorage.removeItem('sakti_product_draft');
    }
    setShowModal(false);
  };

  const fmtRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  return (
    <div className="min-h-screen bg-slate-50/50">
    <div className="max-w-[1400px] mx-auto p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white border border-indigo-100 rounded-2xl px-6 py-4 shadow-sm">
        <div>
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Material Management</span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-1">Inventori & Manajemen Produk</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Master data produk · Sinkronisasi otomatis ke POS & menu digital</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowOpnameModal(true)} className="bg-white border border-indigo-200 text-indigo-600 px-5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:bg-indigo-50 transition-all">
            <ClipboardCheck className="w-4 h-4" /> Stock Opname
          </button>
          <button onClick={openAdd} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all">
            <Plus className="w-4 h-4" /> Tambah Produk
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total SKU', value: products.length, icon: <Package className="w-4 h-4" /> },
          { label: 'Nilai Inventori', value: `Rp ${(totalValue / 1000000).toFixed(1)}M`, icon: <DollarSign className="w-4 h-4" /> },
          { label: 'Stok Menipis', value: lowStock, icon: <AlertTriangle className="w-4 h-4" /> },
          { label: 'Stok Habis', value: outOfStock, icon: <Layers className="w-4 h-4" /> },
        ].map(s => (
          <div key={s.label} className="bg-white border border-indigo-100 rounded-2xl p-5 hover:border-indigo-300 transition-all group">
            <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-500 mb-3 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-all">{s.icon}</div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{s.label}</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 w-4 h-4" />
          <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Cari nama produk atau SKU..." className="input-field w-full pl-10 border-indigo-100 focus:border-indigo-400" />
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {['Semua', ...categories].map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3.5 py-2 rounded-lg text-[11px] font-black uppercase tracking-wide transition-all ${catFilter === c ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 border border-indigo-100 hover:border-indigo-300'}`}>
              {c}
            </button>
          ))}
          <button onClick={() => setShowCatModal(true)} className="px-3.5 py-2 rounded-lg text-[11px] font-black uppercase tracking-wide bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1 border border-indigo-200">
            <Edit2 className="w-3 h-3" /> Kategori
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(p => (
          <div key={p.id} className={`bg-white rounded-2xl overflow-hidden border transition-all hover:shadow-md hover:border-indigo-300 ${!p.isActive ? 'opacity-50 border-slate-200' : 'border-indigo-100'}`}>
            <div className="aspect-video bg-indigo-50/50 relative overflow-hidden">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-10 h-10 text-indigo-200" />
                </div>
              )}
              <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-black border ${
                p.stock === 0 ? 'bg-rose-50 text-rose-700 border-rose-200' :
                p.stock < 5 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {p.stock === 0 ? 'HABIS' : `Stok: ${p.stock}`}
              </div>
              <div className="absolute top-2 left-2 flex gap-1">
                <span className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-[9px] font-black text-slate-600 border border-white/50">{p.category}</span>
                {p.isComposite && <span className="bg-indigo-100/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-[9px] font-black text-indigo-700">BOM</span>}
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-black text-slate-800 text-sm leading-tight mb-0.5">{p.name}</h4>
              <p className="text-[10px] font-mono text-slate-400 mb-3">{p.sku}</p>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-[9px] text-indigo-400 font-black uppercase">Harga Jual</p>
                  <p className="font-black text-indigo-600">{fmtRp(p.price)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-400 font-black uppercase">HPP</p>
                  <p className="font-bold text-slate-500 text-sm">{fmtRp(p.cost)}</p>
                </div>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-[9px] font-black mb-1">
                  <span className="text-slate-400">Margin</span>
                  <span className="text-emerald-600">{p.cost > 0 ? Math.round((p.price - p.cost) / p.price * 100) : 0}%</span>
                </div>
                <div className="h-1 bg-indigo-50 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${p.cost > 0 ? Math.round((p.price - p.cost) / p.price * 100) : 0}%` }} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all text-xs font-bold">
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => updateProduct(p.id, { isActive: !p.isActive })} className={`p-2 rounded-lg transition-all border ${p.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                  {p.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </button>
                <button onClick={() => deleteProduct(p.id)} className="p-2 rounded-lg bg-rose-50 text-rose-400 border border-rose-200 hover:bg-rose-500 hover:text-white hover:border-transparent transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        <div onClick={openAdd} className="bg-white/50 border-2 border-dashed border-indigo-200 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group min-h-[300px]">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-center mb-3 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-all">
            <Plus className="w-6 h-6 text-indigo-400 group-hover:text-white" />
          </div>
          <p className="font-black text-indigo-400 group-hover:text-indigo-700 text-xs uppercase tracking-widest">Tambah Produk</p>
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
              <div className="flex items-center gap-2">
                {!editItem && localStorage.getItem('sakti_product_draft') && (
                  <button onClick={() => {
                    localStorage.removeItem('sakti_product_draft');
                    setForm({ name: '', price: '', cost: '', stock: '', category: 'Makanan', sku: '', description: '', imageUrl: '', unit: 'pcs', isComposite: false, components: [] });
                  }} className="text-[10px] font-black text-rose-500 bg-rose-50 px-3 py-1.5 rounded-lg hover:bg-rose-100 uppercase tracking-widest mr-2">
                    Hapus Draft
                  </button>
                )}
                <button onClick={() => setShowModal(false)} className="p-2 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
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

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Stok Awal</label>
                  <input value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} type="number" className="input-field w-full" placeholder="0" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Satuan (Unit)</label>
                  <input value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} type="text" className="input-field w-full" placeholder="pcs, gram, ml, porsi" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kategori</label>
                  <div className="flex gap-2">
                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="input-field flex-1">
                      {categories.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <button onClick={() => setShowCatModal(true)} className="px-3 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 flex-shrink-0">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">SKU / Kode Produk</label>
                  <input value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))} type="text" className="input-field w-full" placeholder="Kosongkan otomatis" />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Deskripsi (Tampil di Menu)</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className="input-field w-full resize-none" placeholder="Uraian singkat produk untuk menu pelanggan..." />
                </div>
                
                {/* BOM / Resep Toggle */}
                <div className="col-span-2 border-t border-slate-100 pt-4 mt-2">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Gunakan Resep / Bahan Baku (BOM)</p>
                      <p className="text-xs text-slate-400">Saat produk terjual, stok bahan baku akan otomatis berkurang.</p>
                    </div>
                    <button onClick={() => setForm(p => ({ ...p, isComposite: !p.isComposite }))} 
                      className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${form.isComposite ? 'bg-primary' : 'bg-slate-200'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isComposite ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                  
                  {form.isComposite && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      {form.components.map((comp, idx) => (
                        <div key={idx} className="flex gap-2 items-end">
                          <div className="flex-1">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bahan Baku</label>
                            <select value={comp.productId} onChange={e => {
                                const newComps = [...form.components];
                                newComps[idx].productId = e.target.value;
                                setForm({ ...form, components: newComps });
                              }} className="input-field w-full py-2">
                              <option value="">-- Pilih Bahan --</option>
                              {products.filter(p => !p.isComposite).map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
                              ))}
                            </select>
                          </div>
                          <div className="w-24">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Qty</label>
                            <input type="number" value={comp.quantity} onChange={e => {
                                const newComps = [...form.components];
                                newComps[idx].quantity = parseFloat(e.target.value) || 0;
                                setForm({ ...form, components: newComps });
                              }} className="input-field w-full py-2" placeholder="0" />
                          </div>
                          <button onClick={() => {
                              const newComps = [...form.components];
                              newComps.splice(idx, 1);
                              setForm({ ...form, components: newComps });
                            }} className="p-3 bg-rose-100 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-colors mb-[2px]">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => setForm(p => ({ ...p, components: [...p.components, { productId: '', quantity: 1 }] }))} 
                        className="text-xs font-black text-primary hover:text-primary-dark uppercase flex items-center gap-1 mt-2">
                        <Plus className="w-4 h-4" /> Tambah Bahan
                      </button>
                    </div>
                  )}
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

      {/* Modal Kelola Kategori */}
      {showCatModal && (
        <CategoryModal
          categories={categories}
          onClose={() => setShowCatModal(false)}
          onAdd={addCategory}
          onUpdate={updateCategory}
          onDelete={deleteCategory}
        />
      )}

      {/* MODAL STOCK OPNAME */}
      {showOpnameModal && (
        <StockOpnameModal 
          products={products}
          updateProduct={updateProduct}
          onClose={() => setShowOpnameModal(false)}
        />
      )}
    </div>
    </div>
  );
}

// Komponen Stock Opname
function StockOpnameModal({ products, updateProduct, onClose }: any) {
  const [search, setSearch] = useState('');
  const [opnameData, setOpnameData] = useState<Record<string, number>>({});

  const filtered = products.filter((p: Product) => !p.isComposite && (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.includes(search)));

  const handleSave = () => {
    Object.entries(opnameData).forEach(([id, newStock]) => {
      updateProduct(id, { stock: newStock });
    });
    alert(`Opname berhasil disimpan! ${Object.keys(opnameData).length} produk telah disesuaikan stoknya.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-50 bg-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-primary" /> Stock Opname (Penyesuaian)
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-bold">Sesuaikan stok fisik gudang dengan stok sistem.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white hover:bg-rose-100 text-slate-400 hover:text-rose-500 transition-colors shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Cari barang untuk opname..." className="input-field w-full pl-10" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-2 bg-slate-50">
          {filtered.length === 0 ? (
            <p className="text-center text-slate-400 font-bold py-10">Barang tidak ditemukan.</p>
          ) : (
            filtered.map((p: Product) => {
              const currentInput = opnameData[p.id] !== undefined ? opnameData[p.id] : p.stock;
              const diff = currentInput - p.stock;
              
              return (
                <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between hover:border-primary transition-all">
                  <div className="flex-1">
                    <p className="font-black text-slate-800">{p.name}</p>
                    <p className="text-[10px] font-bold text-slate-400">{p.sku} · Stok Sistem: {p.stock} {p.unit}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {diff !== 0 && (
                      <span className={`text-xs font-black px-2 py-1 rounded-md ${diff > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {diff > 0 ? '+' : ''}{diff}
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Fisik:</label>
                      <input 
                        type="number" 
                        value={currentInput}
                        onChange={e => setOpnameData({ ...opnameData, [p.id]: parseInt(e.target.value) || 0 })}
                        className="w-20 p-2 text-center font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-white">
          <p className="text-xs font-bold text-slate-500">
            <span className="text-primary font-black text-lg">{Object.keys(opnameData).length}</span> barang diubah
          </p>
          <button onClick={handleSave} disabled={Object.keys(opnameData).length === 0} className="btn-primary px-8 py-3 disabled:opacity-50 flex items-center gap-2">
            <Check className="w-5 h-5" /> Simpan Opname
          </button>
        </div>
      </div>
    </div>
  );
}

// Komponen Modal Kategori Dinamis
function CategoryModal({ categories, onClose, onAdd, onUpdate, onDelete }: any) {
  const [newCat, setNewCat] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');

  const handleAdd = () => {
    if (newCat.trim() && !categories.includes(newCat.trim())) {
      onAdd(newCat.trim());
      setNewCat('');
    }
  };

  const handleSaveEdit = (oldName: string) => {
    if (editVal.trim() && editVal.trim() !== oldName && !categories.includes(editVal.trim())) {
      onUpdate(oldName, editVal.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-md shadow-3xl overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">Kelola Kategori</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Tambah, ubah nama, atau hapus kategori</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Add New */}
          <div className="flex gap-2 mb-6">
            <input 
              value={newCat} 
              onChange={e => setNewCat(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              type="text" 
              className="input-field flex-1" 
              placeholder="Kategori baru (Cth: Barang Non Listrik)" 
            />
            <button onClick={handleAdd} disabled={!newCat.trim()} className="btn-primary px-4 py-2 disabled:opacity-50 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Tambah
            </button>
          </div>

          {/* List Categories */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {categories.map((c: string) => (
              <div key={c} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                {editingId === c ? (
                  <div className="flex-1 flex gap-2">
                    <input 
                      autoFocus
                      value={editVal} 
                      onChange={e => setEditVal(e.target.value)} 
                      onKeyDown={e => e.key === 'Enter' && handleSaveEdit(c)}
                      className="input-field flex-1 py-1 px-3 text-sm" 
                    />
                    <button onClick={() => handleSaveEdit(c)} className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors">
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="font-bold text-slate-700 text-sm">{c}</span>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditingId(c); setEditVal(c); }} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:text-primary hover:border-primary transition-colors">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      {c !== 'Lain-lain' && (
                        <button onClick={() => onDelete(c)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
              <strong className="text-amber-800 uppercase block mb-1">Catatan:</strong>
              Jika Anda menghapus sebuah kategori, semua produk yang memakai kategori tersebut akan dialihkan ke kategori "Lain-lain" secara otomatis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
