import React, { useState } from 'react';
import { ShoppingCart, Search, Package, Plus, Minus, Trash2, Zap, CreditCard, QrCode, User, Clock, FileText, Printer, XCircle, Banknote, ChevronDown } from 'lucide-react';
import { useProductStore } from '../../stores/product.store';

// Pembayaran Alternatif (Tanpa Xendit)
const PAYMENT_METHODS = [
  { key: 'CASH', label: 'Tunai', icon: <Banknote className="w-4 h-4" />, fee: 0, feeLabel: 'Gratis', feeNote: '' },
  { key: 'QRIS', label: 'QRIS Pribadi', icon: <QrCode className="w-4 h-4" />, fee: 0, feeLabel: 'Gratis', feeNote: 'Dana/GoPay' },
  { key: 'WHATSAPP', label: 'WhatsApp', icon: <Zap className="w-4 h-4" />, fee: 0, feeLabel: 'Kirim Struk', feeNote: 'Transfer' },
] as const;

type PaymentKey = typeof PAYMENT_METHODS[number]['key'];
interface CartItem { id: string; name: string; price: number; quantity: number; imageUrl?: string; }
interface Transaction { id: string; time: string; items: CartItem[]; total: number; method: string; cashier: string; }

export function POSScreen() {
  const { products, reduceStock } = useProductStore();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentKey>('CASH');
  const [cashInput, setCashInput] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Semua');

  const activeProducts = products.filter(p => p.isActive);
  const categories = ['Semua', ...Array.from(new Set(activeProducts.map(p => p.category)))];

  const filtered = activeProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'Semua' || p.category === catFilter;
    return matchSearch && matchCat;
  });

  const method = PAYMENT_METHODS.find(m => m.key === paymentMethod)!;
  const subtotal = cart.reduce((a, i) => a + i.price * i.quantity, 0);
  const discountAmt = Math.round(subtotal * discount / 100);
  const APP_FEE = 250;
  const total = subtotal - discountAmt + method.fee + APP_FEE;
  const cash = parseInt(cashInput.replace(/\./g, '')) || 0;
  const change = cash - total;

  const addToCart = (p: typeof products[0]) => {
    if (p.stock <= 0) return;
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      return ex
        ? prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { id: p.id, name: p.name, price: p.price, quantity: 1, imageUrl: p.imageUrl }];
    });
  };

  const generateWhatsAppLink = (tx: Transaction) => {
    let text = `*STRUK PEMBELIAN - KASIR SAKTI POS*\n\n`;
    text += `No: ${tx.id}\n`;
    text += `Waktu: ${tx.time}\n\n`;
    text += `*PESANAN:*\n`;
    tx.items.forEach(i => {
      text += `- ${i.name} x${i.quantity} (Rp ${(i.price * i.quantity).toLocaleString('id-ID')})\n`;
    });
    if (discount > 0) text += `\nDiskon: ${discount}%\n`;
    text += `\n*TOTAL: Rp ${tx.total.toLocaleString('id-ID')}*\n\n`;
    text += `Silakan lakukan pembayaran ke:\n`;
    text += `💳 BCA: 1234567890 a.n Pemilik Toko\n`;
    text += `📱 DANA: 081234567890\n\n`;
    text += `Terima kasih!`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  const handleProcess = () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'CASH' && cash < total) return;
    setIsProcessing(true);
    setTimeout(() => {
      cart.forEach(item => reduceStock(item.id, item.quantity));
      const tx: Transaction = {
        id: `TX-${Date.now()}`,
        time: new Date().toLocaleTimeString('id-ID'),
        items: [...cart], total, method: method.label,
        cashier: 'Ahmad (Shift Pagi)'
      };
      setTransactions(prev => [tx, ...prev]);
      setIsProcessing(false);
      setShowReceipt(true);
      
      if (paymentMethod === 'WHATSAPP') {
        window.open(generateWhatsAppLink(tx), '_blank');
      }
    }, 800);
  };

  const fmtRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  // RECEIPT
  if (showReceipt && transactions[0]) {
    const tx = transactions[0];
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
        <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-3xl overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-purple-600 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 fill-current" />
            </div>
            <h2 className="text-2xl font-black uppercase">Transaksi Sukses!</h2>
            <p className="text-white/70 text-sm mt-1">{tx.id} · {tx.time}</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-slate-50 rounded-2xl p-4 font-mono text-xs space-y-2 border border-dashed border-slate-200">
              <div className="flex justify-between text-slate-500"><span>Kasir</span><span>{tx.cashier}</span></div>
              <div className="flex justify-between text-slate-500"><span>Metode</span><span>{tx.method}</span></div>
              <hr className="border-dashed border-slate-200" />
              {tx.items.map(i => (
                <div key={i.id} className="flex justify-between">
                  <span className="truncate max-w-[150px]">{i.name} x{i.quantity}</span>
                  <span>{fmtRp(i.price * i.quantity)}</span>
                </div>
              ))}
              <hr className="border-dashed border-slate-200" />
              {discountAmt > 0 && <div className="flex justify-between text-emerald-600"><span>Diskon {discount}%</span><span>-{fmtRp(discountAmt)}</span></div>}
              {method.fee > 0 && <div className="flex justify-between text-primary"><span>Biaya Admin ({tx.method})</span><span>+{fmtRp(method.fee)}</span></div>}
              <div className="flex justify-between text-blue-500"><span>Layanan Zyntra Labs</span><span>+Rp 250</span></div>
              <div className="flex justify-between font-black text-slate-900 text-sm pt-1"><span>TOTAL</span><span>{fmtRp(tx.total)}</span></div>
              {paymentMethod === 'CASH' && <div className="flex justify-between text-emerald-600 font-black"><span>KEMBALIAN</span><span>{fmtRp(change)}</span></div>}
            </div>
            <p className="text-center text-[8px] text-slate-400 font-bold uppercase tracking-widest">Dibuat dengan Kasir Sakti POS · zyntra.id</p>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm uppercase">
                <Printer className="w-4 h-4" /> Cetak
              </button>
              {paymentMethod === 'QRIS' && (
                <div className="col-span-2 bg-slate-50 border-2 border-dashed border-primary/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
                  <QrCode className="w-24 h-24 text-slate-800" />
                  <p className="text-xs font-black text-slate-500 uppercase text-center">Scan QRIS Untuk Membayar</p>
                </div>
              )}
              <button onClick={() => { setCart([]); setCashInput(''); setDiscount(0); setShowReceipt(false); }}
                className="btn-primary py-3 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Baru
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CLOSING SHIFT REPORT
  if (showHistory) {
    const totalOmzet = transactions.reduce((a, t) => a + t.total, 0);
    const totalFee = transactions.filter(t => t.method !== 'Tunai').length * 500;
    const byMethod: Record<string, { count: number; total: number }> = {};
    transactions.forEach(t => {
      if (!byMethod[t.method]) byMethod[t.method] = { count: 0, total: 0 };
      byMethod[t.method].count++;
      byMethod[t.method].total += t.total;
    });
    const shiftStart = '07:00';
    const shiftEnd = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Laporan Closing Shift</p>
                <h2 className="text-2xl font-black uppercase tracking-tight">Shift Pagi</h2>
                <p className="text-slate-400 font-bold text-sm mt-1">Ahmad Kasir · {shiftStart} – {shiftEnd}</p>
              </div>
              <button onClick={() => setShowHistory(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[
                { label: 'Total Transaksi', value: transactions.length },
                { label: 'Total Omzet', value: fmtRp(totalOmzet) },
                { label: 'Fee Xendit', value: fmtRp(totalFee) },
              ].map(k => (
                <div key={k.label} className="bg-white/10 rounded-2xl p-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase">{k.label}</p>
                  <p className="font-black text-white mt-1 text-sm">{k.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Breakdown per metode */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Breakdown Per Metode</p>
              {Object.keys(byMethod).length === 0 ? (
                <p className="text-sm text-slate-400 font-bold text-center py-6">Belum ada transaksi di shift ini</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(byMethod).map(([method, data]) => (
                    <div key={method} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                      <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        {method === 'Tunai' ? <Banknote className="w-4 h-4 text-primary" /> : <CreditCard className="w-4 h-4 text-primary" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-700 text-sm">{method}</p>
                        <p className="text-xs text-slate-400 font-bold">{data.count} transaksi</p>
                      </div>
                      <p className="font-black text-slate-900">{fmtRp(data.total)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Riwayat transaksi ringkas */}
            {transactions.length > 0 && (
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Riwayat Transaksi ({transactions.length})</p>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {transactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-black text-slate-800 text-xs">{tx.id}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{tx.time} · {tx.items.length} item · {tx.method}</p>
                      </div>
                      <p className="font-black text-primary text-sm">{fmtRp(tx.total)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary box */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-2">
                <p className="font-black text-slate-800">Total Bersih Owner</p>
                <p className="font-black text-primary text-xl">{fmtRp(totalOmzet - (transactions.length * 250))}</p>
              </div>
              <p className="text-xs text-slate-500 font-medium">Potongan biaya aplikasi: Rp 250 / transaksi (Total: {fmtRp(transactions.length * 250)}).</p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black text-sm uppercase hover:bg-slate-200 transition-all">
                <Printer className="w-4 h-4" /> Cetak Laporan
              </button>
              <button onClick={() => { setShowHistory(false); setTransactions([]); setCart([]); }}
                className="btn-premium py-4 flex items-center justify-center gap-2 text-sm uppercase">
                <Clock className="w-4 h-4" /> Tutup Shift
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-slate-100 overflow-hidden">
      {/* Left: Products */}
      <div className="flex-1 flex flex-col min-w-0 p-3 gap-3">
        {/* Header */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><User className="w-4 h-4" /></div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase">Shift 1 · 06:00–14:00</p>
              <p className="font-black text-slate-800 text-sm">Ahmad Kasir</p>
            </div>
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Cari menu..." className="input-field w-full pl-9 h-10 text-sm" />
          </div>
          <button onClick={() => setShowHistory(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-black text-xs uppercase hover:bg-slate-200">
            <Clock className="w-4 h-4" /> Riwayat
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase whitespace-nowrap flex-shrink-0 transition-all ${catFilter === c ? 'bg-primary text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Products */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map(p => (
            <div key={p.id} onClick={() => addToCart(p)}
              className={`relative bg-white rounded-2xl overflow-hidden cursor-pointer border-2 transition-all group ${
                p.stock <= 0 ? 'opacity-50 cursor-not-allowed border-transparent' : 'border-transparent hover:border-primary hover:shadow-lg'
              }`}>
              {p.stock <= 0 && (
                <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                  <span className="bg-rose-500 text-white text-[9px] font-black px-3 py-1 rounded-full">HABIS</span>
                </div>
              )}
              <div className="aspect-video bg-slate-50 overflow-hidden">
                {p.imageUrl
                  ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  : <div className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform"><Package className="w-8 h-8 text-slate-200" /></div>
                }
              </div>
              <div className="p-3">
                <p className="font-black text-slate-800 text-sm leading-tight">{p.name}</p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-primary font-black text-sm">{fmtRp(p.price)}</p>
                  <span className={`text-[9px] font-bold ${p.stock < 5 ? 'text-amber-500' : 'text-slate-300'}`}>{p.stock} pcs</span>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-300">
              <Package className="w-16 h-16 mb-4" />
              <p className="font-bold uppercase text-sm">Tidak ada produk</p>
              <p className="text-xs mt-1">Tambah produk di menu Inventori</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-80 bg-white flex flex-col shadow-2xl border-l border-slate-100">
        <div className="p-4 border-b border-slate-50 flex items-center gap-3">
          <ShoppingCart className="w-5 h-5 text-primary" />
          <h3 className="font-black text-slate-900 uppercase tracking-tight">Pesanan</h3>
          {cart.length > 0 && (
            <span className="ml-auto bg-primary text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center">
              {cart.reduce((a, i) => a + i.quantity, 0)}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-200 gap-3">
              <ShoppingCart className="w-12 h-12" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-300">Ketuk produk untuk tambah</p>
            </div>
          ) : cart.map(item => (
            <div key={item.id} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50">
              {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-xs truncate">{item.name}</p>
                <p className="text-primary text-xs font-black">{fmtRp(item.price)}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => setCart(p => item.quantity === 1 ? p.filter(i => i.id !== item.id) : p.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i))}
                  className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center font-black text-xs">{item.quantity}</span>
                <button onClick={() => setCart(p => p.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))}
                  className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                  <Plus className="w-3 h-3" />
                </button>
                <button onClick={() => setCart(p => p.filter(i => i.id !== item.id))}
                  className="w-6 h-6 rounded-lg bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white ml-1 flex items-center justify-center transition-all">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 space-y-3 border-t border-slate-100 bg-slate-50">
          {/* Discount */}
          {cart.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-slate-400 uppercase">Diskon</span>
              <div className="flex gap-1">
                {[0, 5, 10, 20].map(d => (
                  <button key={d} onClick={() => setDiscount(d)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${discount === d ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-400'}`}>
                    {d === 0 ? 'OFF' : `${d}%`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Payment methods */}
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map(m => (
              <button key={m.key} onClick={() => setPaymentMethod(m.key)}
                className={`flex flex-col items-center py-2 rounded-xl border-2 text-[9px] font-black uppercase transition-all ${paymentMethod === m.key ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 bg-white text-slate-400'}`}>
                {m.icon}
                <span className="mt-1">{m.label}</span>
                <span className={`text-[8px] mt-0.5 ${paymentMethod === m.key ? 'text-primary/70' : 'text-slate-300'}`}>{m.feeLabel}</span>
              </button>
            ))}
          </div>

          {/* WhatsApp notice */}
          {paymentMethod === 'WHATSAPP' && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2 text-[9px] font-bold text-emerald-600 text-center flex items-center justify-center gap-1">
              <Zap className="w-3 h-3" /> Struk akan dikirim via WA
            </div>
          )}

          {/* Totals */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-500 font-bold">
              <span>Subtotal</span><span>{fmtRp(subtotal)}</span>
            </div>
            {discountAmt > 0 && <div className="flex justify-between text-emerald-500 font-bold"><span>Diskon {discount}%</span><span>-{fmtRp(discountAmt)}</span></div>}
            {method.fee > 0 && <div className="flex justify-between text-blue-500 font-bold"><span>Admin {method.label}</span><span>+{fmtRp(method.fee)}</span></div>}
            <div className="flex justify-between text-slate-400 font-bold"><span>Layanan Aplikasi</span><span>+Rp 250</span></div>
            <div className="flex justify-between text-slate-900 font-black text-base pt-2 border-t border-dashed border-slate-200">
              <span>TOTAL</span><span className="text-primary">{fmtRp(total)}</span>
            </div>
          </div>

          {/* Cash input */}
          {paymentMethod === 'CASH' && cart.length > 0 && (
            <div className="bg-white rounded-2xl p-3 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase">Uang Diterima</span>
                <input type="text" value={cashInput}
                  onChange={e => setCashInput(e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.'))}
                  className="text-right font-black text-slate-900 bg-transparent outline-none text-sm w-32" placeholder="0" />
              </div>
              <div className="flex gap-1 flex-wrap">
                {[total, Math.ceil(total / 5000) * 5000, 50000, 100000].filter((v, i, a) => a.indexOf(v) === i && v >= total).slice(0, 4).map(v => (
                  <button key={v} onClick={() => setCashInput(v.toLocaleString('id-ID'))}
                    className="flex-1 text-[9px] font-black bg-slate-100 hover:bg-primary hover:text-white px-2 py-1 rounded-lg transition-colors">
                    {fmtRp(v)}
                  </button>
                ))}
              </div>
              {cash >= total && (
                <div className="flex justify-between bg-emerald-50 rounded-xl px-3 py-2">
                  <span className="text-[10px] font-black text-emerald-600">KEMBALIAN</span>
                  <span className="font-black text-emerald-600 text-sm">{fmtRp(change)}</span>
                </div>
              )}
            </div>
          )}

          <button onClick={handleProcess}
            disabled={cart.length === 0 || (paymentMethod === 'CASH' && cash < total) || isProcessing}
            className="w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed btn-premium text-base">
            {isProcessing ? <Clock className="w-5 h-5 animate-spin" /> : <><Zap className="w-5 h-5" /> PROSES BAYAR</>}
          </button>

          <button onClick={() => setShowHistory(true)} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary flex items-center justify-center gap-1">
            <FileText className="w-3 h-3" /> Closing Shift
          </button>
        </div>
      </div>
    </div>
  );
}
