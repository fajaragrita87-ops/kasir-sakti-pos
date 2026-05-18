import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Search, Package, Plus, Minus, Trash2, Zap, CreditCard, QrCode, User, Clock, FileText, Printer, XCircle, Banknote, ChevronDown, WifiOff, CloudUpload, Check, Star, ShieldCheck, Save, Layers, ListOrdered, Map, MessageSquare, Brain, ScanFace } from 'lucide-react';
import { useProductStore } from '../../stores/product.store';
import { useTransactionStore } from '../../stores/transaction.store';
import { offlineService } from '../../services/offline.service';
import { useAuthStore } from '../../stores/auth.store';

// Integrasi Pembayaran Xendit & Alternatif
const PAYMENT_METHODS = [
  { key: 'CASH', label: 'Tunai', icon: <Banknote className="w-4 h-4" />, feeType: 'fixed', feeVal: 0, feeLabel: 'Gratis' },
  { key: 'XENDIT_QRIS', label: 'QRIS Dinamis', icon: <QrCode className="w-4 h-4" />, feeType: 'percent', feeVal: 0.007, feeLabel: '0.7%' },
  { key: 'XENDIT_OVO', label: 'OVO', icon: <CreditCard className="w-4 h-4" />, feeType: 'percent', feeVal: 0.015, feeLabel: '1.5%' },
  { key: 'XENDIT_DANA', label: 'DANA', icon: <CreditCard className="w-4 h-4" />, feeType: 'percent', feeVal: 0.015, feeLabel: '1.5%' },
  { key: 'QRIS_PRIBADI', label: 'QRIS Statis', icon: <QrCode className="w-4 h-4" />, feeType: 'fixed', feeVal: 0, feeLabel: 'Gratis' },
  { key: 'WHATSAPP', label: 'WhatsApp', icon: <MessageSquare className="w-4 h-4" />, feeType: 'fixed', feeVal: 0, feeLabel: 'Gratis' },
  { key: 'PIUTANG', label: 'Kasbon/Hutang', icon: <Clock className="w-4 h-4" />, feeType: 'fixed', feeVal: 0, feeLabel: 'Premium' },
] as const;

type PaymentKey = typeof PAYMENT_METHODS[number]['key'];
interface CartItem { 
  id: string; 
  name: string; 
  price: number; 
  basePrice: number;
  quantity: number; 
  imageUrl?: string;
  variant?: string;
  modifiers?: string[];
  unit?: string;
  conversionRate?: number;
  cartItemId: string; // unique ID for cart
}
// Using Transaction from store directly

const fmtRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

export function POSScreen() {
  const { products, reduceStock } = useProductStore();
  const { transactions, addTransaction, clearTransactions } = useTransactionStore();
  const { user } = useAuthStore();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentKey>('CASH');
  const [cashInput, setCashInput] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentTx, setCurrentTx] = useState<any>(null);
  const [showXenditModal, setShowXenditModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isDeclared, setIsDeclared] = useState(false);
  const [declaredCash, setDeclaredCash] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Semua');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [queuedCount, setQueuedCount] = useState(0);
  const [savedBills, setSavedBills] = useState<{id: string; name: string; time: string; cart: CartItem[]}[]>([]);
  const [showSavedBills, setShowSavedBills] = useState(false);
  const [billNameInput, setBillNameInput] = useState('');
  const [showSaveBillModal, setShowSaveBillModal] = useState(false);
  const [showTableMap, setShowTableMap] = useState(false);
  const [showAiRadar, setShowAiRadar] = useState(false);
  const [isScanningFace, setIsScanningFace] = useState(false);
  const [recognizedCustomer, setRecognizedCustomer] = useState<any>(null);
  const [taxPercent, setTaxPercent] = useState(11);
  const [servicePercent, setServicePercent] = useState(0);
  const [isSplitBill, setIsSplitBill] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [showCartMobile, setShowCartMobile] = useState(false);
  
  // Variant/Modifier Modal States
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const [selectedVariantOption, setSelectedVariantOption] = useState<string | null>(null);
  const [selectedModifierOptions, setSelectedModifierOptions] = useState<string[]>([]);

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOffline(false);
      const queue = await offlineService.getQueuedTransactions();
      if (queue.length > 0) {
        // Simulasi background sync
        setTimeout(async () => {
          await offlineService.clearQueue();
          setQueuedCount(0);
          // Normally we would push to API here
        }, 1500);
      }
    };
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    offlineService.getQueuedTransactions().then(q => setQueuedCount(q.length));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const activeProducts = products.filter(p => p.isActive);
  const categories = ['Semua', ...Array.from(new Set(activeProducts.map(p => p.category)))];

  const filtered = activeProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'Semua' || p.category === catFilter;
    return matchSearch && matchCat;
  });

  const method = PAYMENT_METHODS.find(m => m.key === paymentMethod) || PAYMENT_METHODS[0];
  const subtotal = cart.reduce((a, i) => {
    // Wholesale price logic
    const prod = products.find(p => p.id === i.id);
    let itemPrice = i.price;
    if (prod?.wholesalePrices) {
      const bestWholesale = prod.wholesalePrices
        .filter(w => i.quantity >= w.minQty)
        .sort((a, b) => b.minQty - a.minQty)[0];
      if (bestWholesale) {
        // We only apply wholesale to base price part
        const diff = i.price - i.basePrice;
        itemPrice = bestWholesale.price + diff;
      }
    }
    return a + itemPrice * i.quantity;
  }, 0);
  const discountAmt = Math.round(subtotal * discount / 100);
  const subtotalAfterDiscount = subtotal - discountAmt;
  const serviceAmt = Math.round(subtotalAfterDiscount * servicePercent / 100);
  const taxAmt = Math.round((subtotalAfterDiscount + serviceAmt) * taxPercent / 100);
  const adminFee = method.feeType === 'percent' ? Math.round((subtotalAfterDiscount + serviceAmt + taxAmt) * method.feeVal) : method.feeVal;
  const APP_FEE = 500;
  const total = subtotalAfterDiscount + serviceAmt + taxAmt + adminFee + APP_FEE;
  const cash = parseInt(cashInput.replace(/\./g, '')) || 0;
  const change = cash - total;

  const addToCart = (p: typeof products[0]) => {
    if (p.stock <= 0) return;
    
    if ((p.variants && p.variants.length > 0) || (p.modifiers && p.modifiers.length > 0)) {
      setSelectedProduct(p);
      setSelectedVariantOption(p.variants?.[0]?.options?.[0]?.name || null);
      setSelectedModifierOptions([]);
      return;
    }
    
    addToCartDirect(p, p.price, p.price, undefined, []);
  };

  const addToCartDirect = (p: typeof products[0], finalPrice: number, basePrice: number, variant?: string, modifiers: string[] = [], customUnit?: string) => {
    let unit = customUnit || p.unit;
    let price = finalPrice;
    let conversionRate = 1;

    if (customUnit && p.units) {
      const u = p.units.find(un => un.name === customUnit);
      if (u) {
        price = u.price;
        conversionRate = u.conversionRate;
      }
    }

    setCart(prev => {
      // Find exact match
      const ex = prev.find(i => i.id === p.id && i.variant === variant && JSON.stringify(i.modifiers) === JSON.stringify(modifiers) && i.unit === unit);
      return ex
        ? prev.map(i => i.cartItemId === ex.cartItemId ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { 
            cartItemId: `ci-${Date.now()}-${Math.random()}`, 
            id: p.id, 
            name: p.name, 
            price, 
            basePrice,
            quantity: 1, 
            imageUrl: p.imageUrl,
            variant,
            modifiers,
            unit,
            conversionRate
          }];
    });
    setSelectedProduct(null);
  };

  const handleConfirmOptions = () => {
    if (!selectedProduct) return;
    
    let finalPrice = selectedProduct.price;
    let variantDesc = undefined;
    
    if (selectedProduct.variants && selectedVariantOption) {
      const vGrp = selectedProduct.variants[0];
      const opt = vGrp.options.find(o => o.name === selectedVariantOption);
      if (opt) {
        finalPrice += opt.priceDelta;
        variantDesc = opt.name;
      }
    }
    
    if (selectedProduct.modifiers && selectedModifierOptions.length > 0) {
      selectedProduct.modifiers.forEach(m => {
        m.options.forEach(o => {
          if (selectedModifierOptions.includes(o.name)) {
            finalPrice += o.priceDelta;
          }
        });
      });
    }
    
    addToCartDirect(selectedProduct, finalPrice, selectedProduct.price, variantDesc, selectedModifierOptions);
  };

  const generateWhatsAppLink = (tx: any) => {
    let text = `*STRUK PEMBELIAN - VISTRAL POS*\n\n`;
    text += `No: ${tx.id}\n`;
    text += `Waktu: ${tx.time}\n\n`;
    text += `*PESANAN:*\n`;
    tx.items.forEach((i: any) => {
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
    
    if (paymentMethod === 'CASH' && cash < total) {
      alert(`Nominal uang tunai kurang! Total tagihan adalah Rp ${total.toLocaleString('id-ID')}`);
      return;
    }
    
    if (paymentMethod.startsWith('XENDIT_')) {
      setShowReviewModal(false);
      setShowXenditModal(true);
      return;
    }
    
    setShowReviewModal(false);
    finalizeTransaction();
  };

  const finalizeTransaction = () => {
    setIsProcessing(true);
    setShowXenditModal(false);
    setTimeout(() => {
      cart.forEach(item => reduceStock(item.id, item.quantity));
      const tx = {
        id: `TX-${Date.now()}`,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        items: [...cart], total, method: method.label,
        cashier: user?.name || 'Kasir (Shift Pagi)'
      };
      
      if (!navigator.onLine || isOffline) {
        offlineService.queueTransaction(tx).then(() => {
          setQueuedCount(prev => prev + 1);
        });
      }

      addTransaction(tx);
      setCurrentTx(tx);
      setCart([]);
      setCashInput('');
      setDiscount(0);
      setIsProcessing(false);
      setShowReceipt(true);
    }, 800);
  };

  const handleSaveBill = () => {
    if (!billNameInput.trim() || cart.length === 0) return;
    setSavedBills(prev => [...prev, {
      id: `BILL-${Date.now()}`,
      name: billNameInput,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      cart: [...cart]
    }]);
    setCart([]);
    setBillNameInput('');
    setShowSaveBillModal(false);
  };

  const loadBill = (bill: any) => {
    setCart(bill.cart);
    setSavedBills(prev => prev.filter(b => b.id !== bill.id));
    setShowSavedBills(false);
  };

  const fmtRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  const renderReceiptModal = () => {
    if (!showReceipt || !currentTx) return null;
    const tx = currentTx;
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
        <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-3xl overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-purple-600 p-8 text-white text-center print:hidden">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 fill-current" />
            </div>
            <h2 className="text-2xl font-black uppercase">Transaksi Sukses!</h2>
            <p className="text-white/70 text-sm mt-1">{tx.id} · {tx.time}</p>
          </div>
          <div className="p-6 space-y-4" id="printable-area">
            <div className="bg-slate-50 rounded-2xl p-4 font-mono text-xs space-y-2 border border-dashed border-slate-200">
              <div className="flex justify-between text-slate-500"><span>Kasir</span><span>{tx.cashier}</span></div>
              <div className="flex justify-between text-slate-500"><span>Metode</span><span>{tx.method}</span></div>
              <hr className="border-dashed border-slate-200" />
              {tx.items.map((i: any) => (
                <div key={i.cartItemId} className="flex flex-col mb-2">
                  <div className="flex justify-between">
                    <span className="truncate max-w-[150px]">{i.name} x{i.quantity}</span>
                    <span>{fmtRp(i.price * i.quantity)}</span>
                  </div>
                  {(i.variant || (i.modifiers && i.modifiers.length > 0)) && (
                    <div className="text-[9px] text-slate-400 font-medium pl-2">
                      {i.variant && <span>Ukuran: {i.variant}</span>}
                      {i.modifiers && i.modifiers.length > 0 && <span> | Tambahan: {i.modifiers.join(', ')}</span>}
                    </div>
                  )}
                </div>
              ))}
              <hr className="border-dashed border-slate-200" />
              <div className="flex justify-between font-black text-slate-900 text-sm pt-1"><span>TOTAL</span><span>{fmtRp(tx.total)}</span></div>
            </div>
            <p className="text-center text-[8px] text-slate-400 font-bold uppercase tracking-widest">Dibuat dengan VISTRAL POS · vistral.id</p>
            <div className="grid grid-cols-3 gap-3 print:hidden">
              <button onClick={() => window.print()} className="flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm uppercase hover:bg-slate-200">
                <Printer className="w-4 h-4" /> Cetak
              </button>
              <button onClick={() => window.open(generateWhatsAppLink(tx), '_blank')} className="flex items-center justify-center gap-2 py-3 bg-[#25D366]/10 text-[#25D366] rounded-2xl font-black text-sm uppercase hover:bg-[#25D366]/20 transition-colors">
                <MessageSquare className="w-4 h-4" /> Kirim WA
              </button>
              <button onClick={() => { 
                setShowReceipt(false); 
              }}
                className="btn-primary py-3 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Baru
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHistoryModal = () => {
    if (!showHistory) return null;
    const shiftStart = '07:00';
    const shiftEnd = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const cashTransactions = transactions.filter(t => t.method === 'Tunai');
    const expectedCash = cashTransactions.reduce((a, t) => a + t.total, 0);
    const nonCashTotal = transactions.filter(t => t.method !== 'Tunai').reduce((a, t) => a + t.total, 0);
    const totalOmzet = expectedCash + nonCashTotal;
    const declaredAmount = parseInt(declaredCash.replace(/\./g, '')) || 0;
    const difference = declaredAmount - expectedCash;

    if (!isDeclared) {
      return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-3xl overflow-hidden p-8 text-center relative">
            <button onClick={() => setShowHistory(false)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-400 hover:text-rose-500">
              <XCircle className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Tutup Kasir (Blind Close)</h2>
            <p className="text-sm text-slate-500 font-bold mt-2 mb-6">Hitung uang fisik di laci kasir secara manual dan masukkan totalnya di bawah ini sebelum melihat laporan.</p>
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 mb-6">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Total Uang Fisik Laci</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">Rp</span>
                <input autoFocus type="text" value={declaredCash} onChange={e => setDeclaredCash(e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.'))} className="w-full text-3xl font-black text-center bg-white border-2 border-slate-200 rounded-xl py-4 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all" placeholder="0" />
              </div>
            </div>
            <button onClick={() => setIsDeclared(true)} disabled={!declaredCash} className="w-full btn-premium py-4 flex items-center justify-center gap-2 text-sm uppercase disabled:opacity-50 disabled:cursor-not-allowed">
              <Check className="w-5 h-5" /> Verifikasi & Lihat Hasil
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white print:hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Laporan Rekonsiliasi Shift</p>
                <h2 className="text-2xl font-black uppercase tracking-tight">Shift Pagi</h2>
                <p className="text-slate-400 font-bold text-sm mt-1">{user?.name || 'Kasir'} · {shiftStart} – {shiftEnd}</p>
              </div>
              <button onClick={() => { setShowHistory(false); setIsDeclared(false); }} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-6 space-y-6" id="printable-area">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Pencocokan Uang Tunai Laci</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-500">Uang Seharusnya (Sistem)</span>
                  <span className="font-black text-slate-800">{fmtRp(expectedCash)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-500">Uang Dihitung (Kasir)</span>
                  <span className="font-black text-slate-800">{fmtRp(declaredAmount)}</span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-black text-slate-700 uppercase">Selisih</span>
                  <span className={`text-lg font-black ${difference === 0 ? 'text-emerald-500' : difference > 0 ? 'text-blue-500' : 'text-rose-500'}`}>
                    {difference > 0 ? '+' : ''}{fmtRp(difference)}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Total Omzet Keseluruhan ({transactions.length} Transaksi)</h3>
              <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-2 text-sm">
                <div className="flex justify-between font-bold text-slate-500"><span>Pembayaran Non-Tunai (QRIS/Trf/Online)</span><span>{fmtRp(nonCashTotal)}</span></div>
                <div className="flex justify-between font-bold text-slate-500"><span>Pembayaran Tunai (Sistem)</span><span>{fmtRp(expectedCash)}</span></div>
                <div className="pt-2 border-t border-slate-100 flex justify-between font-black text-slate-900 text-base"><span>TOTAL PENDAPATAN</span><span>{fmtRp(totalOmzet)}</span></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 print:hidden pt-4 border-t border-slate-100">
              <button onClick={() => window.print()} className="flex items-center justify-center gap-2 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black text-sm uppercase hover:bg-slate-200 transition-all">
                <Printer className="w-4 h-4" /> Cetak
              </button>
              <button onClick={() => { setShowHistory(false); setIsDeclared(false); clearTransactions(); setCart([]); }}
                className="btn-premium py-4 flex items-center justify-center gap-2 text-sm uppercase">
                <Clock className="w-4 h-4" /> Selesai Shift
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReviewModal = () => {
    if (!showReviewModal) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
        <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-3xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
            <div>
              <h3 className="font-black text-slate-900 text-xl tracking-tight uppercase">Review Transaksi</h3>
              <p className="text-sm text-slate-500 font-bold mt-1">Periksa kembali pesanan sebelum memproses pembayaran.</p>
            </div>
            <button onClick={() => setShowReviewModal(false)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-rose-500 shadow-sm border border-slate-200">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
            {/* Kiri: Rincian Pesanan */}
            <div className="flex-1 space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">Rincian Pesanan</h4>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {cart.map(item => (
                  <div key={item.cartItemId} className="flex justify-between items-start text-sm">
                    <div>
                      <span className="font-bold text-slate-800">{item.name} <span className="text-primary">x{item.quantity}</span></span>
                      {(item.variant || (item.modifiers && item.modifiers.length > 0)) && (
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5 leading-tight">
                          {item.variant && <span className="mr-1">Ukuran: {item.variant}.</span>}
                          {item.modifiers && item.modifiers.length > 0 && <span>Tambahan: {item.modifiers.join(', ')}</span>}
                        </p>
                      )}
                    </div>
                    <span className="font-black text-slate-700">{fmtRp(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 mt-4">
                <div className="flex justify-between text-slate-500 text-xs font-bold"><span>Subtotal</span><span>{fmtRp(subtotal)}</span></div>
                {discountAmt > 0 && <div className="flex justify-between text-emerald-500 text-xs font-bold"><span>Diskon {discount}%</span><span>-{fmtRp(discountAmt)}</span></div>}
                {taxAmt > 0 && <div className="flex justify-between text-slate-500 text-xs font-bold"><span>Pajak {taxPercent}%</span><span>+{fmtRp(taxAmt)}</span></div>}
                <div className="flex justify-between text-slate-900 font-black text-lg pt-2 border-t border-slate-200 mt-2">
                  <span>TOTAL TAGIHAN</span><span className="text-primary">{fmtRp(total)}</span>
                </div>
              </div>
            </div>

            {/* Kanan: Pembayaran */}
            <div className="w-full md:w-72 space-y-6">
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Pilih Pembayaran</h4>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map(m => (
                    <button key={m.key} onClick={() => setPaymentMethod(m.key)}
                      className={`flex flex-col items-center py-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${paymentMethod === m.key ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-slate-200 bg-white text-slate-400 hover:border-primary/50'}`}>
                      {m.icon}
                      <span className="mt-1.5">{m.label}</span>
                      <span className={`text-[8px] mt-0.5 ${paymentMethod === m.key ? 'text-primary/70' : 'text-slate-300'}`}>{m.feeLabel}</span>
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'WHATSAPP' && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs font-bold text-emerald-600 flex items-center gap-2">
                  <Zap className="w-4 h-4 flex-shrink-0" /> Link pembayaran & struk digital akan dikirim ke WA pelanggan.
                </div>
              )}

              {paymentMethod === 'CASH' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Uang Diterima</span>
                    <div className="relative w-32">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">Rp</span>
                      <input type="text" value={cashInput} autoFocus
                        onChange={e => setCashInput(e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.'))}
                        className="w-full text-right font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 outline-none focus:border-primary text-sm transition-all" placeholder="0" />
                    </div>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {[total, Math.ceil(total / 5000) * 5000, 50000, 100000].filter((v, i, a) => a.indexOf(v) === i && v >= total).slice(0, 4).map(v => (
                      <button key={v} onClick={() => setCashInput(v.toLocaleString('id-ID'))}
                        className="flex-1 text-[10px] font-black bg-slate-100 hover:bg-primary hover:text-white px-2 py-1.5 rounded-lg transition-colors border border-slate-200 hover:border-primary text-slate-700">
                        {fmtRp(v)}
                      </button>
                    ))}
                  </div>
                  {cash >= total && (
                    <div className="flex justify-between bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-100">
                      <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Kembalian</span>
                      <span className="font-black text-emerald-600 text-lg">{fmtRp(change)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="p-6 border-t border-slate-100 bg-white sticky bottom-0">
            <button onClick={handleProcess}
              disabled={isProcessing || (paymentMethod === 'CASH' && cash < total)}
              className="w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed btn-premium text-base shadow-lg shadow-primary/20 hover:shadow-primary/40">
              {isProcessing ? <Clock className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> PROSES PEMBAYARAN SEKARANG</>}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex h-[calc(100vh-5rem)] bg-[#F4F5F7] overflow-hidden font-sans relative">
      <div className="flex-1 flex flex-col min-w-0 min-h-0 p-2 md:p-4 gap-3 md:gap-4">
        {/* Top Control Bar */}
        <div className="flex overflow-x-auto hide-scrollbar items-center gap-2 md:gap-4 bg-white p-2 md:p-3 border border-slate-200 shadow-sm">
          <div className="hidden md:flex items-center gap-3 pr-4 border-r border-slate-200">
            <div className="w-10 h-10 bg-slate-100 flex items-center justify-center text-slate-600"><User className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Shift 1 · 06:00–14:00</p>
              <p className="font-bold text-slate-900 text-sm">{user?.name || 'Kasir'} (Cashier)</p>
            </div>
          </div>
          <div className="relative flex-1 min-w-[200px] group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Cari Menu..." className="w-full pl-12 pr-4 h-10 md:h-12 bg-slate-50 border border-slate-200 focus:border-slate-800 text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-all rounded-lg" />
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <button onClick={() => alert('Sinkronisasi E-Commerce berhasil!')} className="hidden md:flex items-center gap-1 bg-amber-100 text-amber-600 px-3 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-amber-200 transition-colors shadow-sm">
              <CloudUpload className="w-4 h-4" /> Sync Online
            </button>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${isOffline ? 'bg-rose-100 text-rose-500' : 'bg-emerald-100 text-emerald-600'}`}>
              {isOffline ? <WifiOff className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
              {isOffline ? 'Offline' : 'Online'}
            </div>
          </div>
          <button onClick={() => setShowHistory(true)} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-black text-xs uppercase hover:bg-slate-200 whitespace-nowrap">
            <Clock className="w-4 h-4" /> <span className="hidden md:inline">Riwayat</span>
          </button>
          <button onClick={() => setShowTableMap(true)} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-100 text-blue-600 rounded-xl font-black text-xs uppercase hover:bg-blue-200 whitespace-nowrap">
            <Map className="w-4 h-4" /> <span className="hidden md:inline">Denah</span>
          </button>
          <button onClick={() => setShowAiRadar(!showAiRadar)} className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl font-black text-xs uppercase transition-all whitespace-nowrap ${showAiRadar ? 'bg-fuchsia-600 text-white' : 'bg-fuchsia-100 text-fuchsia-600 hover:bg-fuchsia-200'}`}>
            <Brain className="w-4 h-4" /> <span className="hidden md:inline">AI Radar</span>
          </button>
        </div>

        {/* AI Recommendations Bar */}
        {showAiRadar && (
          <div className="bg-gradient-to-r from-fuchsia-600 to-purple-700 p-4 rounded-2xl shadow-lg animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-white">
                <Brain className="w-4 h-4 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Sakti AI Recommendation</span>
              </div>
              <button onClick={() => setShowAiRadar(false)} className="text-white/50 hover:text-white"><XCircle className="w-4 h-4" /></button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl min-w-[280px]">
                <p className="text-xs font-bold text-fuchsia-100 italic">"Pelanggan sering membeli *Indomie Goreng* bersama *Es Teh Manis*. Tawarkan Paket Hemat (+Rp 2.000) untuk tingkatkan profit?"</p>
                <button className="mt-2 text-[9px] font-black bg-white text-fuchsia-600 px-3 py-1 rounded-full uppercase">Terapkan Promo</button>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl min-w-[280px]">
                <p className="text-xs font-bold text-fuchsia-100 italic">"Stok *Ayam Goreng* kritis (Sisa 3). AI menyarankan Anda segera restok atau ganti menu favorit di layar utama."</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => alert('Draft Purchase Order ke Supplier PT Ayam Sentosa telah dibuat!')} className="text-[9px] font-black bg-white text-fuchsia-600 px-3 py-1 rounded-full uppercase">Buat Auto-PO</button>
                  <button className="text-[9px] font-black bg-fuchsia-500 text-white px-3 py-1 rounded-full uppercase">Lihat Inventori</button>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl min-w-[280px]">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-[10px] font-black text-white uppercase">Prediksi Profit</span>
                </div>
                <p className="text-xs font-bold text-fuchsia-100 italic">"Besok Selasa diprediksi ramai jam 15-18. AI menyarankan tambah 1 staff dan stok Kopi Susu +20%."</p>
                <button className="mt-2 text-[9px] font-black bg-white/20 text-white px-3 py-1 rounded-full uppercase border border-white/30">Siapkan Stok</button>
              </div>
            </div>
          </div>
        )}

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {categories.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-4 md:px-5 py-2 md:py-2.5 text-[10px] md:text-xs font-bold uppercase whitespace-nowrap flex-shrink-0 transition-all border rounded-xl ${catFilter === c ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Products */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-28 min-h-0">
          {search === '' && catFilter === 'Semua' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Sering Dibeli</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {activeProducts.slice(0, 4).map(p => (
                  <div key={`hot-${p.id}`} onClick={() => addToCart(p)}
                    className="relative bg-gradient-to-br from-amber-50 to-orange-50 p-3 rounded-2xl border-2 border-amber-200/50 hover:border-amber-400 hover:shadow-lg cursor-pointer transition-all group overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-500/10 rounded-full group-hover:scale-150 transition-transform"></div>
                    <div className="relative z-10 flex flex-col h-full justify-between gap-2">
                      <p className="font-black text-amber-900 text-xs leading-tight line-clamp-2">{p.name}</p>
                      <p className="text-amber-600 font-black text-sm">{fmtRp(p.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            {search === '' && catFilter === 'Semua' && (
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Semua Menu</h4>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map(p => (
                <div key={p.id} onClick={() => addToCart(p)}
                  className={`relative bg-white border border-slate-200 overflow-hidden cursor-pointer transition-all group ${
                    p.stock <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-800 hover:shadow-md active:scale-[0.98]'
                  }`}>
                  {p.stock <= 0 && (
                    <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                      <span className="bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-black px-3 py-1.5 uppercase tracking-widest shadow-sm rounded-lg">Habis</span>
                    </div>
                  )}
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden border-b border-slate-100">
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300"><Package className="w-8 h-8 text-slate-300" /></div>
                    }
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-slate-900 text-sm leading-tight mb-1 line-clamp-2">{p.name}</p>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-slate-800 font-light text-base tracking-tight">{fmtRp(p.price)}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 ${p.stock < 5 ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>{p.stock} EA</span>
                    </div>
                    {/* Quick Selection for S/M/L and Multi-Unit */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.variants && p.variants.length === 1 && p.variants[0].options.map(opt => (
                        <button key={opt.name} onClick={(e) => { e.stopPropagation(); addToCartDirect(p, p.price + opt.priceDelta, p.price, opt.name); }}
                          className="py-1 px-2 bg-slate-50 border border-slate-200 text-[9px] font-bold hover:bg-slate-800 hover:text-white transition-all uppercase tracking-widest">
                          {opt.name.slice(0, 3)}
                        </button>
                      ))}
                      {p.units?.map(u => (
                        <button key={u.name} onClick={(e) => { e.stopPropagation(); addToCartDirect(p, u.price, p.price, undefined, [], u.name); }}
                          className="py-1 px-2 bg-blue-50 border border-blue-200 text-[9px] font-bold text-blue-700 hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest">
                          {u.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-300">
              <Package className="w-16 h-16 mb-4" />
              <p className="font-bold uppercase text-sm">Tidak ada produk</p>
              <p className="text-xs mt-1">Tambah produk di menu Inventori</p>
            </div>
          )}
        </div>

        {/* Sticky Bottom Cart Bar for Mobile */}
        <div className="lg:hidden absolute bottom-0 left-0 right-0 z-30 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
          <button onClick={() => setShowCartMobile(true)} className="w-full bg-indigo-600 text-white p-4 rounded-2xl shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-between border border-indigo-500">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="w-6 h-6" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-rose-500 rounded-full animate-ping opacity-75"></span>
                )}
              </div>
              <span className="font-black uppercase tracking-widest text-sm">Keranjang</span>
            </div>
            {cart.length > 0 ? (
              <div className="flex items-center gap-3">
                <span className="bg-indigo-800 text-white px-2.5 py-1 rounded-lg text-xs font-black shadow-inner">
                  {cart.reduce((a,c)=>a+c.quantity,0)} item
                </span>
                <span className="font-black text-lg tracking-tight">{fmtRp(total)}</span>
              </div>
            ) : (
              <span className="text-indigo-200 font-bold text-sm">0 item</span>
            )}
          </button>
        </div>
      </div>

      {/* Right: Cart */}
      <div className={`w-full lg:w-96 bg-white flex flex-col shadow-2xl lg:border-l border-slate-300 z-40 ${showCartMobile ? 'absolute inset-0 flex' : 'hidden lg:flex'}`}>
        <div className="p-4 md:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-slate-800" />
            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-sm">Pesanan Saat Ini</h3>
          </div>
          <div className="flex items-center gap-3">
            {cart.length > 0 && (
              <span className="bg-slate-800 text-white text-xs font-bold w-6 h-6 flex items-center justify-center shadow-sm rounded-md">
                {cart.reduce((a, i) => a + i.quantity, 0)}
              </span>
            )}
            <button onClick={() => setShowCartMobile(false)} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-rose-100 hover:text-rose-500 transition-colors">
               <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white flex flex-col p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-3 min-h-[200px]">
              <ShoppingCart className="w-12 h-12 opacity-50" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Belum Ada Pesanan</p>
            </div>
          ) : cart.map(item => (
            <div key={item.cartItemId} className="flex flex-col gap-2 p-3 bg-white border border-slate-200 shadow-sm relative group">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm">
                    {item.name} {item.unit && item.unit !== 'porsi' && <span className="text-[10px] text-blue-600 font-mono">({item.unit})</span>}
                  </p>
                  {(item.variant || (item.modifiers && item.modifiers.length > 0)) && (
                    <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                      {item.variant && <span className="mr-1">Var: {item.variant}.</span>}
                      {item.modifiers && item.modifiers.length > 0 && <span>Mods: {item.modifiers.join(', ')}</span>}
                    </p>
                  )}
                  <p className="text-slate-700 font-light text-sm mt-1">{fmtRp(item.price)}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 bg-slate-50 border border-slate-200">
                  <button onClick={() => setCart(p => item.quantity === 1 ? p.filter(i => i.cartItemId !== item.cartItemId) : p.map(i => i.cartItemId === item.cartItemId ? { ...i, quantity: i.quantity - 1 } : i))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 transition-colors">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                  <button onClick={() => setCart(p => p.map(i => i.cartItemId === item.cartItemId ? { ...i, quantity: i.quantity + 1 } : i))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <button onClick={() => setCart(p => p.filter(i => i.cartItemId !== item.cartItemId))}
                className="absolute -top-2 -right-2 bg-white border border-slate-200 rounded-full p-1 text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

          {/* Cart Options (Scrollable along with items) */}
          <div className="p-4 space-y-4 border-t border-slate-200 bg-white shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
            {/* Discount */}
            {cart.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-slate-400 uppercase">Diskon</span>
                <div className="flex gap-1">
                  {[0, 5, 10, 20].map(d => (
                    <button key={d} onClick={() => setDiscount(d)}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-black transition-all ${discount === d ? 'bg-primary text-white shadow-sm' : 'bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                      {d === 0 ? 'OFF' : `${d}%`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Hold Order & Tools */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button onClick={() => setIsSplitBill(!isSplitBill)} className={`py-3 flex items-center justify-center gap-2 border text-xs font-bold uppercase transition-all rounded-xl ${isSplitBill ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                 <Layers className="w-4 h-4" /> {isSplitBill ? 'Batal Pisah' : 'Pisah Nota'}
              </button>
              <button onClick={() => setShowSaveBillModal(true)} disabled={cart.length === 0} className="py-3 flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 text-xs font-bold uppercase text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors">
                 <Save className="w-4 h-4" /> Simpan (Hold)
              </button>
              <button onClick={() => setShowSavedBills(true)} className="col-span-2 py-3 flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 text-xs font-bold uppercase text-slate-600 hover:bg-slate-100 relative transition-colors">
                 <ListOrdered className="w-4 h-4" /> Buka Pesanan Tersimpan
                 {savedBills.length > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-sm">{savedBills.length}</span>}
              </button>
            </div>

            <button onClick={() => setShowHistory(true)} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary flex items-center justify-center gap-1 mt-2 py-2 bg-slate-50 rounded-xl transition-colors">
              <FileText className="w-3 h-3" /> Tutup Kasir (Shift)
            </button>

            {/* Face Recognition */}
            <div className="pt-2 border-t border-slate-100">
               <button onClick={() => {
                 setIsScanningFace(true);
                 setTimeout(() => {
                   setIsScanningFace(false);
                   setRecognizedCustomer({ name: 'Pak Budi (Gold)', favorite: 'Kopi Susu Gula Aren', points: 1250 });
                 }, 2000);
               }} className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all border border-indigo-100">
                  <ScanFace className="w-4 h-4" /> {isScanningFace ? 'Memindai Wajah...' : 'Member Wajah'}
               </button>
               {recognizedCustomer && (
                 <div className="mt-3 bg-gradient-to-br from-indigo-600 to-blue-700 p-4 rounded-2xl text-white shadow-lg animate-in zoom-in-95 duration-300">
                   <div className="flex justify-between items-start mb-2">
                      <p className="text-[9px] font-black text-indigo-200 uppercase">Pelanggan Terdeteksi</p>
                      <button onClick={() => setRecognizedCustomer(null)}><XCircle className="w-3 h-3 text-indigo-300" /></button>
                   </div>
                   <p className="text-sm font-black">{recognizedCustomer.name}</p>
                   <p className="text-[10px] text-indigo-100 mt-1">Favorit: <span className="font-bold">{recognizedCustomer.favorite}</span></p>
                   <div className="flex items-center justify-between mt-3">
                     <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded-lg">⭐ {recognizedCustomer.points} Poin</span>
                     <button className="text-[9px] font-black bg-white text-indigo-600 px-3 py-1.5 rounded-full uppercase shadow-md hover:bg-slate-50 transition-colors">Ulang Pesanan</button>
                   </div>
                 </div>
               )}
            </div>
          </div>

        {/* Fixed Bottom Review & Pay Area */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 z-10">
          <div className="flex justify-between text-slate-900 font-bold text-lg mb-4">
            <span>Total Tagihan</span><span className="text-slate-900">{fmtRp(total)}</span>
          </div>
          <button onClick={() => setShowReviewModal(true)}
            disabled={cart.length === 0}
            className="w-full py-4 font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white text-base uppercase tracking-widest shadow-sm">
            <CreditCard className="w-5 h-5" /> BAYAR SEKARANG
          </button>
        </div>
      </div>
    </div>

    {/* XENDIT PAYMENT MODAL */}
      {showXenditModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-3xl overflow-hidden text-center p-8 relative">
            <button onClick={() => setShowXenditModal(false)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-400 hover:text-rose-500">
              <XCircle className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-[#0E1E40] text-white rounded-2xl flex items-center justify-center mx-auto mb-4 font-black tracking-widest text-xl">
              xendit
            </div>
            <h3 className="font-black text-slate-900 text-xl uppercase">Selesaikan Pembayaran</h3>
            <p className="text-slate-500 text-sm mt-1 mb-6">Total tagihan: <span className="font-black text-primary">{fmtRp(total)}</span></p>

            {paymentMethod === 'XENDIT_QRIS' ? (
              <div className="bg-slate-50 border-2 border-dashed border-[#0E1E40]/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 mb-6">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://xendit.co/pay?amount=${total}`} alt="Xendit QRIS" className="w-40 h-40 mix-blend-multiply" />
                <p className="text-[10px] font-black text-[#0E1E40] uppercase bg-[#0E1E40]/10 px-3 py-1 rounded-full">QRIS Dinamis (Auto-Check)</p>
              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-[#0E1E40]/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 mb-6">
                <div className="w-20 h-20 bg-blue-500 text-white rounded-2xl flex items-center justify-center mb-2">
                  <CreditCard className="w-10 h-10" />
                </div>
                <p className="text-xs font-bold text-slate-600">Menunggu pembayaran dari aplikasi {method.label}</p>
                <div className="flex gap-1 justify-center mt-2">
                  <div className="w-2 h-2 bg-[#0E1E40] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#0E1E40] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-[#0E1E40] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}

            <button onClick={finalizeTransaction} className="w-full bg-[#0E1E40] text-white py-4 rounded-xl font-black uppercase text-sm flex items-center justify-center gap-2 hover:bg-[#0A152D] transition-colors">
              <Check className="w-4 h-4" /> Simulasikan Berhasil
            </button>
            <p className="text-[9px] font-bold text-slate-400 uppercase mt-4">Diintegrasikan melalui API Xendit</p>
          </div>
        </div>
      )}

      {/* SAVE BILL MODAL */}
      {showSaveBillModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-3xl overflow-hidden p-8 relative">
            <button onClick={() => setShowSaveBillModal(false)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-400 hover:text-rose-500">
              <XCircle className="w-5 h-5" />
            </button>
            <h3 className="font-black text-slate-900 text-xl uppercase mb-2">Simpan Tagihan (Hold)</h3>
            <p className="text-sm text-slate-500 font-bold mb-6">Simpan pesanan ini sementara untuk digabungkan nanti atau jika pelanggan belum siap bayar.</p>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Pelanggan / Meja</label>
            <input autoFocus value={billNameInput} onChange={e => setBillNameInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveBill()} type="text" className="input-field w-full mb-6 py-4 text-center font-bold text-lg" placeholder="Cth: Meja 4 / Rombongan Budi" />
            <button onClick={handleSaveBill} disabled={!billNameInput.trim()} className="w-full btn-primary py-4 flex items-center justify-center gap-2 uppercase text-sm disabled:opacity-50">
              <Save className="w-4 h-4" /> Simpan Bill
            </button>
          </div>
        </div>
      )}

      {/* OPEN BILLS MODAL */}
      {showSavedBills && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-3xl overflow-hidden max-h-[90vh] flex flex-col relative">
            <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="font-black text-slate-900 text-xl uppercase">Daftar Tagihan (Open Bill)</h3>
                <p className="text-xs text-slate-500 font-bold mt-1">Lanjutkan pesanan yang tertunda.</p>
              </div>
              <button onClick={() => setShowSavedBills(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-rose-500 shadow-sm border border-slate-100">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-3 bg-slate-100 flex-1">
              {savedBills.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-bold">Belum ada tagihan yang disimpan.</div>
              ) : (
                savedBills.map(b => (
                  <div key={b.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-primary transition-all flex items-center justify-between group">
                    <div>
                      <p className="font-black text-slate-900 text-lg">{b.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{b.time} · {b.cart.length} Item · Total: {fmtRp(b.cart.reduce((a,c)=>a+(c.price*c.quantity),0))}</p>
                    </div>
                    <button onClick={() => loadBill(b)} className="px-5 py-2.5 bg-primary/10 text-primary rounded-xl font-black text-xs uppercase hover:bg-primary hover:text-white transition-colors">
                      Buka
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TABLE MAP MODAL */}
      {showTableMap && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[120] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-3xl overflow-hidden flex flex-col h-[80vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-black text-slate-900 text-2xl uppercase tracking-tight">Visual Room & Table Map</h3>
                <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">Lantai 1 · Area Utama</p>
              </div>
              <button onClick={() => setShowTableMap(false)} className="p-3 bg-white rounded-full text-slate-400 hover:text-rose-500 shadow-sm border border-slate-200">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 bg-slate-100 p-10 relative overflow-hidden">
               {/* Grid Background */}
               <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-50"></div>
               
               <div className="relative w-full h-full border-4 border-dashed border-slate-200 rounded-[2rem] p-10 flex flex-wrap gap-8 items-start justify-center">
                  {[
                    { id: '1', name: 'Meja 01', status: 'OCCUPIED', size: '2x2', pos: 'top-10 left-10' },
                    { id: '2', name: 'Meja 02', status: 'EMPTY', size: '2x2', pos: 'top-10 left-40' },
                    { id: '3', name: 'Meja 03', status: 'BILLING', size: '2x2', pos: 'top-10 left-70' },
                    { id: '4', name: 'VIP Room 1', status: 'EMPTY', size: '4x4', pos: 'bottom-10 left-10' },
                    { id: '5', name: 'Meja 05', status: 'CLEANING', size: '2x2', pos: 'top-40 left-40' },
                    { id: '6', name: 'Meja 06', status: 'OCCUPIED', size: '2x2', pos: 'top-40 left-70' },
                  ].map(t => (
                    <div key={t.id} onClick={() => { setBillNameInput(t.name); setShowTableMap(false); setShowSaveBillModal(true); }}
                      className={`w-32 h-32 rounded-2xl border-4 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 shadow-md relative group ${
                        t.status === 'EMPTY' ? 'bg-white border-slate-200 text-slate-400 hover:border-blue-500' :
                        t.status === 'OCCUPIED' ? 'bg-blue-600 border-blue-400 text-white' :
                        t.status === 'BILLING' ? 'bg-amber-500 border-amber-300 text-white' :
                        'bg-slate-200 border-slate-300 text-slate-500 opacity-50 cursor-not-allowed'
                      }`}>
                      <p className="font-black text-sm">{t.name}</p>
                      <p className="text-[9px] font-black uppercase mt-1 opacity-70">{t.status}</p>
                      {t.status === 'OCCUPIED' && (
                        <div className="absolute -top-2 -right-2 bg-rose-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white animate-bounce">
                           !
                        </div>
                      )}
                    </div>
                  ))}
               </div>
            </div>
            <div className="p-6 bg-white border-t border-slate-100 flex justify-center gap-6">
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-white border border-slate-300"></div><span className="text-[10px] font-black text-slate-500 uppercase">Kosong</span></div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-600"></div><span className="text-[10px] font-black text-slate-500 uppercase">Terisi</span></div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div><span className="text-[10px] font-black text-slate-500 uppercase">Billing</span></div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-300"></div><span className="text-[10px] font-black text-slate-500 uppercase">Cleaning</span></div>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT OPTIONS MODAL (VARIANTS & MODIFIERS) */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-end sm:items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-t-[2rem] sm:rounded-[2rem] w-full max-w-md shadow-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
              <div>
                <h3 className="font-black text-slate-900 text-xl tracking-tight">{selectedProduct.name}</h3>
                <p className="text-primary font-black mt-1">{fmtRp(selectedProduct.price)}</p>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-rose-500 shadow-sm border border-slate-200">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Variants */}
              {selectedProduct.variants?.map(vGrp => (
                <div key={vGrp.name}>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">{vGrp.name}</h4>
                    <span className="text-[9px] font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-md uppercase">Wajib Pilih 1</span>
                  </div>
                  <div className="space-y-2">
                    {vGrp.options.map(opt => (
                      <label key={opt.name} className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedVariantOption === opt.name ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedVariantOption === opt.name ? 'border-primary' : 'border-slate-300'}`}>
                            {selectedVariantOption === opt.name && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                          </div>
                          <span className="font-bold text-slate-800 text-sm">{opt.name}</span>
                        </div>
                        {opt.priceDelta > 0 && <span className="font-black text-primary text-xs">+{fmtRp(opt.priceDelta)}</span>}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {/* Modifiers */}
              {selectedProduct.modifiers?.map(mGrp => (
                <div key={mGrp.name}>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">{mGrp.name}</h4>
                    <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase">Opsional (Bisa Banyak)</span>
                  </div>
                  <div className="space-y-2">
                    {mGrp.options.map(opt => (
                      <label key={opt.name} className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedModifierOptions.includes(opt.name) ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${selectedModifierOptions.includes(opt.name) ? 'border-primary bg-primary' : 'border-slate-300'}`}>
                            {selectedModifierOptions.includes(opt.name) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="font-bold text-slate-800 text-sm">{opt.name}</span>
                        </div>
                        {opt.priceDelta > 0 && <span className="font-black text-primary text-xs">+{fmtRp(opt.priceDelta)}</span>}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-slate-100 bg-white sticky bottom-0">
              <button onClick={handleConfirmOptions} className="w-full btn-premium py-4 flex items-center justify-center gap-2 text-sm uppercase">
                <ShoppingCart className="w-5 h-5" /> Tambahkan ke Pesanan
              </button>
            </div>
          </div>
        </div>
      )}
      {renderReviewModal()}
      {renderReceiptModal()}
      {renderHistoryModal()}
    </>
  );
}
