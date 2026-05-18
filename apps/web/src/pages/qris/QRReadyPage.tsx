import React, { useState, useEffect } from 'react';
import { QrCode, Plus, Check, X, Clock, ChevronRight, Bell, Zap, TrendingUp, Settings, Download, RefreshCw } from 'lucide-react';

type OrderStatus = 'BARU' | 'DIPROSES' | 'SIAP' | 'SELESAI' | 'DITOLAK';

interface TableOrder {
  id: string; table: number; items: { name: string; qty: number; price: number; note?: string }[];
  total: number; fee: number; time: string; status: OrderStatus; customerNote?: string;
}

const MOCK_ORDERS: TableOrder[] = [];

const TABLES = [1,2,3,4,5,6,7,8,9,10,11,12];
const STATUS_COLORS: Record<OrderStatus, string> = {
  BARU: 'bg-amber-100 text-amber-700 border-amber-200',
  DIPROSES: 'bg-blue-100 text-blue-700 border-blue-200',
  SIAP: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  SELESAI: 'bg-slate-100 text-slate-500 border-slate-200',
  DITOLAK: 'bg-rose-100 text-rose-700 border-rose-200',
};
const NEXT_STATUS: Record<string, OrderStatus> = { BARU: 'DIPROSES', DIPROSES: 'SIAP', SIAP: 'SELESAI' };
const fmtRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

export default function QRReadyPage() {
  const [orders, setOrders] = useState<TableOrder[]>(MOCK_ORDERS);
  const [showQR, setShowQR] = useState<number | null>(null);
  const [tab, setTab] = useState<'PESANAN' | 'MEJA' | 'LAPORAN'>('PESANAN');
  const [notif, setNotif] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'SEMUA' | OrderStatus>('SEMUA');

  // Remove the simulated order notification effect for a clean demo
  useEffect(() => {
    // Demo mode: No random new orders
  }, []);

  const updateStatus = (id: string, status: OrderStatus) =>
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));

  const filtered = activeFilter === 'SEMUA' ? orders : orders.filter(o => o.status === activeFilter);
  const revenue = orders.filter(o => o.status === 'SELESAI').reduce((a, o) => a + o.fee, 0);
  const totalOrders = orders.filter(o => o.status !== 'DITOLAK').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Anti Antri — QR Order</h1>
          <p className="text-slate-500 font-medium mt-1">Pelanggan pesan langsung dari meja · Rp 1.000/transaksi</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl">
            <Zap className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-black text-emerald-600">Revenue: {fmtRp(revenue)}</span>
          </div>
          {notif && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl animate-pulse">
              <Bell className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-black text-amber-600 uppercase">Pesanan Baru!</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Pesanan', value: totalOrders, color: 'text-primary' },
          { label: 'Menunggu', value: orders.filter(o => o.status === 'BARU').length, color: 'text-amber-600' },
          { label: 'Diproses', value: orders.filter(o => o.status === 'DIPROSES').length, color: 'text-blue-600' },
          { label: 'Fee Terkumpul', value: fmtRp(revenue), color: 'text-emerald-600' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl p-5 shadow-lg">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{k.label}</p>
            <p className={`text-2xl font-black mt-1 ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['PESANAN', 'MEJA', 'LAPORAN'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-6 py-3 rounded-2xl font-black text-sm uppercase transition-all ${tab === t ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 hover:bg-slate-100'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── PESANAN ── */}
      {tab === 'PESANAN' && (
        <div>
          <div className="flex gap-2 mb-4 flex-wrap">
            {(['SEMUA', 'BARU', 'DIPROSES', 'SIAP', 'SELESAI'] as const).map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${activeFilter === f ? 'bg-primary text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>
                {f}
                {f === 'BARU' && orders.filter(o => o.status === 'BARU').length > 0 && (
                  <span className="ml-1 bg-amber-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">{orders.filter(o => o.status === 'BARU').length}</span>
                )}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(order => (
              <div key={order.id} className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 ${order.status === 'BARU' ? 'border-amber-300 shadow-amber-100' : 'border-transparent'}`}>
                <div className={`px-5 py-3 border-b flex justify-between items-center ${STATUS_COLORS[order.status]}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg">Meja {order.table}</span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/50">{order.status}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <Clock className="w-3 h-3" />{order.time}
                    <span className="font-black ml-1">{order.id}</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="space-y-2 mb-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="font-bold text-slate-700">{item.qty}x {item.name}</span>
                        <span className="font-black text-slate-800">{fmtRp(item.price * item.qty)}</span>
                      </div>
                    ))}
                    {order.customerNote && (
                      <p className="text-xs italic text-slate-400 bg-slate-50 rounded-xl px-3 py-2 mt-2">📝 "{order.customerNote}"</p>
                    )}
                  </div>
                  <div className="border-t border-dashed border-slate-200 pt-3 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500 font-bold">
                      <span>Subtotal</span><span>{fmtRp(order.total - order.fee)}</span>
                    </div>
                    <div className="flex justify-between text-primary font-bold">
                      <span>Biaya Layanan Anti Antri</span><span>{fmtRp(order.fee)}</span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-black text-sm pt-1">
                      <span>TOTAL</span><span>{fmtRp(order.total)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {order.status !== 'SELESAI' && order.status !== 'DITOLAK' && (
                    <div className="flex gap-2 mt-4">
                      {NEXT_STATUS[order.status] && (
                        <button onClick={() => updateStatus(order.id, NEXT_STATUS[order.status])}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl font-black text-xs uppercase hover:opacity-90">
                          <Check className="w-4 h-4" />
                          {order.status === 'BARU' ? 'Terima' : order.status === 'DIPROSES' ? 'Siap' : 'Selesai'}
                        </button>
                      )}
                      {(order.status === 'BARU' || order.status === 'DIPROSES') && (
                        <button onClick={() => updateStatus(order.id, 'DITOLAK')}
                          className="px-3 py-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-20 text-slate-300">
                <QrCode className="w-16 h-16 mx-auto mb-4" />
                <p className="font-black uppercase tracking-widest text-sm">Tidak ada pesanan</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MEJA (QR Generator) ── */}
      {tab === 'MEJA' && (
        <div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber-500" />
            <p className="text-sm font-bold text-amber-800">Klik meja untuk generate & download QR Code. Tempel di meja atau stand akrilik.</p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {TABLES.map(t => {
              const activeOrder = orders.find(o => o.table === t && !['SELESAI', 'DITOLAK'].includes(o.status));
              return (
                <div key={t} onClick={() => setShowQR(t)}
                  className={`bg-white rounded-2xl p-5 shadow-lg cursor-pointer hover:-translate-y-1 transition-all border-2 group ${activeOrder ? 'border-amber-300 bg-amber-50' : 'border-transparent hover:border-primary'}`}>
                  <div className="text-center mb-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Meja</p>
                    <p className="text-3xl font-black text-slate-900">{t}</p>
                  </div>
                  {activeOrder ? (
                    <div className={`text-center text-[9px] font-black uppercase px-2 py-1 rounded-lg ${STATUS_COLORS[activeOrder.status]}`}>
                      {activeOrder.status}
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <QrCode className="w-8 h-8 text-slate-200 group-hover:text-primary transition-colors" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* QR Modal */}
          {showQR !== null && (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
              <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-3xl text-center">
                <h3 className="font-black text-2xl text-slate-900 mb-1 uppercase">QR Meja {showQR}</h3>
                <p className="text-slate-500 text-sm mb-6">Scan untuk pesan & bayar langsung</p>
                {/* Real QR Code using api.qrserver.com */}
                <div className="w-48 h-48 mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4 flex items-center justify-center relative">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + '/customer-order?meja=' + showQR)}`} alt={`QR Meja ${showQR}`} className="w-full h-full mix-blend-multiply" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                      <QrCode className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 font-bold mb-1">kasirsakti.id/order/meja-{showQR}</p>
                <p className="text-[9px] text-slate-300 mb-6">Biaya layanan: Rp 1.000/transaksi</p>
                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-2xl font-black text-sm uppercase">
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button onClick={() => setShowQR(null)} className="px-4 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm">
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── LAPORAN ── */}
      {tab === 'LAPORAN' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="font-black text-slate-800 uppercase mb-6">Revenue Anti Antri — Hari Ini</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Total Transaksi', value: orders.filter(o => o.status === 'SELESAI').length },
                { label: 'Total Fee Terkumpul', value: fmtRp(revenue) },
                { label: 'Avg Order Value', value: fmtRp(orders.length > 0 ? Math.round(orders.reduce((a, o) => a + o.total, 0) / orders.length) : 0) },
              ].map(k => (
                <div key={k.label} className="bg-slate-50 rounded-2xl p-4 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase">{k.label}</p>
                  <p className="text-xl font-black text-primary mt-2">{k.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
              <p className="text-xs font-bold text-slate-600">
                💡 <strong>Revenue sharing:</strong> Biaya layanan Rp 1.000/transaksi → masuk ke rekening Zyntra Labs via Xendit Split Payment. Owner warung menerima subtotal penuh tanpa potongan.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
