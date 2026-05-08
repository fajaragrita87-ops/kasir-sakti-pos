import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, ChevronRight, AlertCircle, Utensils, Bell, Zap, RefreshCw, Volume2 } from 'lucide-react';

type OrderStatus = 'PENDING' | 'COOKING' | 'READY' | 'SERVED';

interface KDSItem { name: string; qty: number; note?: string; }
interface KDSOrder {
  id: string; tableNo: string; items: KDSItem[];
  status: OrderStatus; time: string; elapsed: number; // seconds
  source: 'POS' | 'ANTI_ANTRI'; priority: 'NORMAL' | 'HIGH';
}

const MOCK_ORDERS: KDSOrder[] = [
  { id: 'TX-001', tableNo: '3', items: [{ name: 'Nasi Goreng Spesial', qty: 2 }, { name: 'Es Teh Manis', qty: 2 }], status: 'PENDING', time: '08:14', elapsed: 45, source: 'ANTI_ANTRI', priority: 'HIGH' },
  { id: 'TX-002', tableNo: '7', items: [{ name: 'Mie Ayam', qty: 1, note: 'Tanpa bakso' }, { name: 'Kopi Susu', qty: 1 }], status: 'COOKING', time: '08:10', elapsed: 280, source: 'POS', priority: 'NORMAL' },
  { id: 'TX-003', tableNo: '1', items: [{ name: 'Soto Ayam', qty: 3 }, { name: 'Es Jeruk', qty: 3, note: 'Gula sedikit' }], status: 'COOKING', time: '08:08', elapsed: 380, source: 'ANTI_ANTRI', priority: 'HIGH' },
  { id: 'TX-004', tableNo: '5', items: [{ name: 'Ayam Bakar', qty: 1 }, { name: 'Nasi Putih', qty: 1 }], status: 'READY', time: '08:05', elapsed: 540, source: 'POS', priority: 'NORMAL' },
  { id: 'TX-005', tableNo: '2', items: [{ name: 'Bakso Malang', qty: 2 }], status: 'PENDING', time: '08:15', elapsed: 12, source: 'POS', priority: 'NORMAL' },
];

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; border: string; next: OrderStatus | null }> = {
  PENDING:  { label: '⏳ Antri',    color: 'text-amber-700',  bg: 'bg-amber-50',   border: 'border-amber-300', next: 'COOKING' },
  COOKING:  { label: '🔥 Masak',   color: 'text-orange-700', bg: 'bg-orange-50',  border: 'border-orange-300', next: 'READY' },
  READY:    { label: '✅ Siap',     color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300', next: 'SERVED' },
  SERVED:   { label: '🍽️ Tersaji',  color: 'text-slate-600',  bg: 'bg-slate-50',   border: 'border-slate-200', next: null },
};

const fmtElapsed = (s: number) => s < 60 ? `${s}d` : `${Math.floor(s / 60)}m ${s % 60}d`;

export default function KitchenDisplayPage() {
  const [orders, setOrders] = useState<KDSOrder[]>(MOCK_ORDERS);
  const [view, setView] = useState<'KANBAN' | 'LIST'>('KANBAN');
  const [soundOn, setSoundOn] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState(false);

  // Auto-increment elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prev => prev.map(o =>
        o.status !== 'SERVED' ? { ...o, elapsed: o.elapsed + 1 } : o
      ));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate new order arrival every 30s
  useEffect(() => {
    const timer = setTimeout(() => {
      const newOrder: KDSOrder = {
        id: `TX-${String(Date.now()).slice(-3)}`,
        tableNo: String(Math.floor(Math.random() * 10) + 1),
        items: [{ name: 'Pesanan Baru', qty: 1 }],
        status: 'PENDING', time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        elapsed: 0, source: 'ANTI_ANTRI', priority: 'NORMAL',
      };
      setOrders(prev => [newOrder, ...prev]);
      setNewOrderAlert(true);
      setTimeout(() => setNewOrderAlert(false), 3000);
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  const advanceStatus = (id: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      const next = STATUS_CONFIG[o.status].next;
      return next ? { ...o, status: next, elapsed: 0 } : o;
    }));
  };

  const activeOrders = orders.filter(o => o.status !== 'SERVED');
  const pending  = orders.filter(o => o.status === 'PENDING');
  const cooking  = orders.filter(o => o.status === 'COOKING');
  const ready    = orders.filter(o => o.status === 'READY');

  const OrderCard = ({ order }: { order: KDSOrder }) => {
    const cfg = STATUS_CONFIG[order.status];
    const isOverdue = order.elapsed > 600; // >10min = overdue
    return (
      <div className={`rounded-2xl border-2 p-5 transition-all ${cfg.border} ${cfg.bg} ${isOverdue ? 'ring-2 ring-rose-400 ring-offset-2' : ''}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-black text-slate-900">Meja {order.tableNo}</span>
              {order.source === 'ANTI_ANTRI' && (
                <span className="bg-primary text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">QR Order</span>
              )}
              {order.priority === 'HIGH' && (
                <span className="bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Prioritas</span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-400">{order.id} · {order.time}</p>
          </div>
          <div className={`text-right ${isOverdue ? 'text-rose-500' : 'text-slate-500'}`}>
            <Clock className="w-4 h-4 ml-auto mb-0.5" />
            <p className={`text-sm font-black ${isOverdue ? 'text-rose-500' : 'text-slate-700'}`}>{fmtElapsed(order.elapsed)}</p>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2 mb-5">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${cfg.color} ${cfg.bg} border ${cfg.border}`}>{item.qty}</span>
              <div>
                <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                {item.note && <p className="text-[10px] text-amber-600 font-bold">⚠️ {item.note}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Action */}
        {STATUS_CONFIG[order.status].next && (
          <button onClick={() => advanceStatus(order.id)}
            className={`w-full py-3 rounded-xl font-black text-sm uppercase flex items-center justify-center gap-2 transition-all
              ${order.status === 'PENDING' ? 'bg-orange-500 text-white hover:bg-orange-600' :
                order.status === 'COOKING' ? 'bg-emerald-500 text-white hover:bg-emerald-600' :
                'bg-slate-900 text-white hover:bg-primary'}`}>
            {order.status === 'PENDING' ? <><Utensils className="w-4 h-4" /> Mulai Masak</> :
             order.status === 'COOKING' ? <><CheckCircle className="w-4 h-4" /> Selesai — Siap Disajikan</> :
             <><ChevronRight className="w-4 h-4" /> Tandai Tersaji</>}
          </button>
        )}
        {!STATUS_CONFIG[order.status].next && (
          <div className="w-full py-3 rounded-xl bg-slate-100 text-slate-400 font-black text-sm uppercase text-center">
            ✅ Tersaji
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 bg-slate-950 min-h-screen text-white">
      {/* New Order Alert */}
      {newOrderAlert && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-primary text-white px-8 py-4 rounded-2xl shadow-2xl font-black text-lg flex items-center gap-3 animate-scale-up">
          <Bell className="w-6 h-6 animate-pulse" /> Pesanan Baru Masuk!
        </div>
      )}

      {/* KDS Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kitchen Display System</p>
            <h1 className="text-xl font-black uppercase tracking-tight">Kasir Sakti · KDS</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live clock */}
          <LiveClock />
          {/* Stats */}
          <div className="flex gap-2">
            {[
              { label: 'Antri', count: pending.length, color: 'bg-amber-500' },
              { label: 'Masak', count: cooking.length, color: 'bg-orange-500' },
              { label: 'Siap', count: ready.length, color: 'bg-emerald-500' },
            ].map(s => (
              <div key={s.label} className={`px-4 py-2 rounded-xl ${s.color} text-white text-center min-w-[60px]`}>
                <p className="text-2xl font-black leading-none">{s.count}</p>
                <p className="text-[9px] font-black uppercase">{s.label}</p>
              </div>
            ))}
          </div>
          {/* Controls */}
          <button onClick={() => setSoundOn(!soundOn)}
            className={`p-2.5 rounded-xl transition-all ${soundOn ? 'bg-primary' : 'bg-slate-700'}`}>
            <Volume2 className="w-4 h-4" />
          </button>
          <button onClick={() => setView(v => v === 'KANBAN' ? 'LIST' : 'KANBAN')}
            className="p-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* PENDING */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
            <h2 className="font-black uppercase text-sm text-amber-400">Antri ({pending.length})</h2>
          </div>
          <div className="space-y-4">
            {pending.map(o => <OrderCard key={o.id} order={o} />)}
            {pending.length === 0 && <EmptyCol label="Tidak ada pesanan antri" />}
          </div>
        </div>

        {/* COOKING */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
            <h2 className="font-black uppercase text-sm text-orange-400">Sedang Masak ({cooking.length})</h2>
          </div>
          <div className="space-y-4">
            {cooking.map(o => <OrderCard key={o.id} order={o} />)}
            {cooking.length === 0 && <EmptyCol label="Dapur kosong" />}
          </div>
        </div>

        {/* READY */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-emerald-500 rounded-full" />
            <h2 className="font-black uppercase text-sm text-emerald-400">Siap Disajikan ({ready.length})</h2>
          </div>
          <div className="space-y-4">
            {ready.map(o => <OrderCard key={o.id} order={o} />)}
            {ready.length === 0 && <EmptyCol label="Belum ada yang siap" />}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-slate-800 flex justify-between items-center text-xs font-bold text-slate-600">
        <span>⚡ Kasir Sakti POS · Kitchen Display System · Zyntra Labs</span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Live — Auto-refresh setiap detik
        </span>
      </div>
    </div>
  );
}

function LiveClock() {
  const [time, setTime] = useState(new Date().toLocaleTimeString('id-ID'));
  useEffect(() => {
    const i = setInterval(() => setTime(new Date().toLocaleTimeString('id-ID')), 1000);
    return () => clearInterval(i);
  }, []);
  return <div className="bg-slate-800 px-5 py-2 rounded-xl font-black text-xl tabular-nums">{time}</div>;
}

function EmptyCol({ label }: { label: string }) {
  return (
    <div className="border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center text-slate-600">
      <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
      <p className="font-bold text-sm">{label}</p>
    </div>
  );
}
