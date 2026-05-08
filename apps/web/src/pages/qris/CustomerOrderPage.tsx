import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Zap, Check, Clock, Package, ChevronRight, QrCode } from 'lucide-react';

type Step = 'MENU' | 'CART' | 'PAYMENT' | 'TRACKING';
type OrderStatus = 'DITERIMA' | 'DIPROSES' | 'SIAP' | 'SELESAI';

const MENU_ITEMS = [
  { id: '1', name: 'Nasi Goreng Spesial', price: 25000, category: 'Makanan', desc: 'Nasi goreng dengan telur, ayam, dan bumbu rahasia', emoji: '🍳' },
  { id: '2', name: 'Mie Ayam Bakso', price: 18000, category: 'Makanan', desc: 'Mie kuning dengan ayam cincang dan bakso sapi', emoji: '🍜' },
  { id: '3', name: 'Ayam Penyet', price: 22000, category: 'Makanan', desc: 'Ayam goreng penyet sambal tomat segar', emoji: '🍗' },
  { id: '4', name: 'Kopi Susu Aren', price: 15000, category: 'Minuman', desc: 'Kopi robusta dengan gula aren asli', emoji: '☕' },
  { id: '5', name: 'Es Teh Manis', price: 5000, category: 'Minuman', desc: 'Teh segar dengan es batu', emoji: '🧋' },
  { id: '6', name: 'Jus Alpukat', price: 12000, category: 'Minuman', desc: 'Jus alpukat segar blended dengan susu', emoji: '🥑' },
];

interface CartItem { id: string; name: string; price: number; qty: number; note?: string; emoji: string; }

const PLATFORM_FEE = 1000;
const fmtRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

const tableNo = new URLSearchParams(window.location.search).get('meja') ?? '3';

export default function CustomerOrderPage() {
  const [step, setStep] = useState<Step>('MENU');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [catFilter, setCatFilter] = useState('Semua');
  const [payMethod, setPayMethod] = useState<'QRIS' | 'EWALLET'>('QRIS');
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('DITERIMA');
  const [orderId] = useState(`AA-${Date.now().toString().slice(-6)}`);

  const categories = ['Semua', ...Array.from(new Set(MENU_ITEMS.map(i => i.category)))];
  const filtered = catFilter === 'Semua' ? MENU_ITEMS : MENU_ITEMS.filter(i => i.category === catFilter);
  const subtotal = cart.reduce((a, i) => a + i.price * i.qty, 0);
  const total = subtotal + PLATFORM_FEE;
  const cartCount = cart.reduce((a, i) => a + i.qty, 0);

  const addItem = (item: typeof MENU_ITEMS[0]) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id);
      return ex ? prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)
        : [...prev, { ...item, qty: 1 }];
    });
  };

  const handleOrder = () => {
    setStep('TRACKING');
    // Simulate status updates
    setTimeout(() => setOrderStatus('DIPROSES'), 5000);
    setTimeout(() => setOrderStatus('SIAP'), 12000);
  };

  // ── TRACKING ──────────────────────────────────────────────────
  if (step === 'TRACKING') {
    const steps: { key: OrderStatus; label: string; desc: string }[] = [
      { key: 'DITERIMA', label: 'Pesanan Diterima', desc: 'Kasir sudah menerima pesanan Anda' },
      { key: 'DIPROSES', label: 'Sedang Dimasak', desc: 'Pesanan sedang disiapkan di dapur' },
      { key: 'SIAP', label: 'Pesanan Siap!', desc: 'Pesanan akan segera diantarkan ke meja Anda' },
      { key: 'SELESAI', label: 'Selesai', desc: 'Selamat menikmati. Terima kasih!' },
    ];
    const currentIdx = steps.findIndex(s => s.key === orderStatus);

    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Pesanan Aktif</h1>
            <p className="text-slate-500 font-bold mt-1 text-sm">{orderId} · Meja {tableNo}</p>
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-2xl mb-6">
            <div className="space-y-5">
              {steps.map((s, i) => {
                const done = i < currentIdx;
                const active = i === currentIdx;
                return (
                  <div key={s.key} className={`flex items-start gap-4 transition-all ${active ? 'opacity-100' : done ? 'opacity-60' : 'opacity-30'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${done ? 'bg-emerald-500' : active ? 'bg-primary animate-pulse' : 'bg-slate-200'}`}>
                      {done ? <Check className="w-5 h-5 text-white" /> : <span className="text-white font-black text-sm">{i + 1}</span>}
                    </div>
                    <div className="pt-1.5">
                      <p className={`font-black text-sm ${active ? 'text-primary' : 'text-slate-700'}`}>{s.label}</p>
                      <p className="text-xs text-slate-400 font-medium">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg text-sm space-y-2">
            <p className="font-black text-slate-800 uppercase text-[10px] tracking-widest mb-3">Ringkasan Pesanan</p>
            {cart.map(i => (
              <div key={i.id} className="flex justify-between">
                <span className="text-slate-600 font-bold">{i.qty}x {i.name}</span>
                <span className="font-black text-slate-800">{fmtRp(i.price * i.qty)}</span>
              </div>
            ))}
            <div className="border-t border-dashed border-slate-200 pt-2 flex justify-between text-primary font-black">
              <span>Biaya layanan digital</span><span>{fmtRp(PLATFORM_FEE)}</span>
            </div>
            <div className="flex justify-between font-black text-slate-900">
              <span>Total Dibayar</span><span>{fmtRp(total)}</span>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 font-bold mt-6 uppercase tracking-widest">
            Kasir Sakti POS · zyntra.id
          </p>
        </div>
      </div>
    );
  }

  // ── PAYMENT ───────────────────────────────────────────────────
  if (step === 'PAYMENT') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="bg-white px-6 py-5 shadow-sm flex items-center gap-3">
          <button onClick={() => setStep('CART')} className="text-slate-400 font-bold text-sm">← Kembali</button>
          <h1 className="font-black text-slate-900">Pembayaran</h1>
        </div>
        <div className="flex-1 p-6 max-w-sm mx-auto w-full">
          <div className="bg-white rounded-2xl p-5 shadow-lg mb-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ringkasan</p>
            {cart.map(i => (
              <div key={i.id} className="flex justify-between text-sm mb-1.5">
                <span className="text-slate-600 font-bold">{i.qty}x {i.name}</span>
                <span className="font-black">{fmtRp(i.price * i.qty)}</span>
              </div>
            ))}
            <div className="border-t border-dashed border-slate-200 my-3" />
            <div className="flex justify-between text-sm text-primary font-bold">
              <span>Biaya layanan digital</span><span>{fmtRp(PLATFORM_FEE)}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 italic">
              "Biaya layanan digital Rp 1.000 membantu kami menyediakan sistem pemesanan yang cepat dan aman untuk Anda."
            </p>
            <div className="flex justify-between font-black text-base text-slate-900 mt-3">
              <span>TOTAL</span><span className="text-primary">{fmtRp(total)}</span>
            </div>
          </div>

          <div className="mb-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Pilih Pembayaran</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                { key: 'QRIS', label: 'QRIS', sub: 'Semua e-wallet' },
                { key: 'EWALLET', label: 'GoPay/OVO', sub: 'Dana, ShopeePay' },
              ] as const).map(m => (
                <button key={m.key} onClick={() => setPayMethod(m.key)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${payMethod === m.key ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white'}`}>
                  <p className="font-black text-slate-800 text-sm">{m.label}</p>
                  <p className="text-xs text-slate-400 font-medium">{m.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {payMethod === 'QRIS' && (
            <div className="bg-white rounded-2xl p-5 shadow-lg mb-5 text-center">
              <p className="text-xs font-black text-slate-500 uppercase mb-3">Scan QR Code ini</p>
              <div className="w-36 h-36 mx-auto bg-slate-900 rounded-2xl flex items-center justify-center">
                <QrCode className="w-20 h-20 text-white" />
              </div>
              <p className="text-xs text-slate-400 mt-3 font-bold">QR berlaku 15 menit</p>
            </div>
          )}

          <button onClick={handleOrder}
            className="w-full btn-premium py-5 text-lg flex items-center justify-center gap-3">
            <Check className="w-6 h-6" /> Konfirmasi Pembayaran
          </button>
        </div>
      </div>
    );
  }

  // ── CART ──────────────────────────────────────────────────────
  if (step === 'CART') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="bg-white px-6 py-5 shadow-sm flex items-center gap-3">
          <button onClick={() => setStep('MENU')} className="text-slate-400 font-bold text-sm">← Menu</button>
          <h1 className="font-black text-slate-900">Pesanan Saya · Meja {tableNo}</h1>
        </div>
        <div className="flex-1 p-4 max-w-sm mx-auto w-full">
          {cart.length === 0 ? (
            <div className="text-center py-20 text-slate-300">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4" />
              <p className="font-bold uppercase">Keranjang kosong</p>
              <button onClick={() => setStep('MENU')} className="mt-4 text-primary font-black text-sm">Kembali ke Menu</button>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">{item.emoji}</div>
                  <div className="flex-1">
                    <p className="font-black text-slate-800 text-sm">{item.name}</p>
                    <p className="text-primary font-black text-sm">{fmtRp(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCart(p => p.map(c => c.id === item.id ? { ...c, qty: Math.max(0, c.qty - 1) } : c).filter(c => c.qty > 0))}
                      className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-black w-4 text-center">{item.qty}</span>
                    <button onClick={() => setCart(p => p.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c))}
                      className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between text-sm text-slate-500 font-bold mb-1">
                  <span>Subtotal</span><span>{fmtRp(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-primary font-bold mb-3">
                  <span>Biaya layanan digital</span><span>{fmtRp(PLATFORM_FEE)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900">
                  <span>Total</span><span>{fmtRp(total)}</span>
                </div>
              </div>
              <button onClick={() => setStep('PAYMENT')} className="w-full btn-premium py-5 text-lg flex items-center justify-center gap-3 mt-4">
                Lanjut Bayar <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── MENU ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Warung Sakti · Meja {tableNo}</p>
              <h1 className="font-black text-slate-900 text-xl">Pesan Sekarang 🍽️</h1>
            </div>
            <button onClick={() => setStep('CART')} className="relative bg-primary text-white p-3 rounded-2xl shadow-lg">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 text-white text-xs font-black rounded-full flex items-center justify-center">{cartCount}</span>
              )}
            </button>
          </div>
          {/* Categories */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
            {categories.map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase whitespace-nowrap flex-shrink-0 transition-all ${catFilter === c ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-4 space-y-3">
        {filtered.map(item => {
          const inCart = cart.find(c => c.id === item.id);
          return (
            <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">{item.emoji}</div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-400 font-medium truncate">{item.desc}</p>
                <p className="text-primary font-black mt-1">{fmtRp(item.price)}</p>
              </div>
              {inCart ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => setCart(p => p.map(c => c.id === item.id ? { ...c, qty: Math.max(0, c.qty - 1) } : c).filter(c => c.qty > 0))}
                    className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-black w-5 text-center">{inCart.qty}</span>
                  <button onClick={() => addItem(item)} className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button onClick={() => addItem(item)} className="w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-100">
          <button onClick={() => setStep('CART')} className="w-full btn-premium py-4 flex items-center justify-between px-6">
            <span className="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full">{cartCount} item</span>
            <span className="font-black text-lg">Lihat Pesanan</span>
            <span className="font-black">{fmtRp(subtotal)}</span>
          </button>
        </div>
      )}

      <p className="text-center text-[9px] text-slate-300 font-bold uppercase tracking-widest pb-24 pt-4">
        Kasir Sakti POS · zyntra.id
      </p>
    </div>
  );
}
