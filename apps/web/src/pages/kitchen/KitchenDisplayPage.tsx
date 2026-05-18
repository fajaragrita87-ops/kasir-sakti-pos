import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, ChevronRight, AlertCircle, Utensils, Bell, Zap, RefreshCw, Volume2 } from 'lucide-react';

type OrderStatus = 'PENDING' | 'COOKING' | 'READY' | 'SERVED';

interface KDSItem { name: string; qty: number; note?: string; }
interface KDSOrder {
  id: string; tableNo: string; items: KDSItem[];
  status: OrderStatus; time: string; elapsed: number; // seconds
  source: 'POS' | 'ANTI_ANTRI'; priority: 'NORMAL' | 'HIGH';
}

const MOCK_ORDERS: KDSOrder[] = [];

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; border: string; next: OrderStatus | null }> = {
  PENDING:  { label: '⏳ Antri',    color: 'text-amber-700',  bg: 'bg-amber-50',   border: 'border-amber-200', next: 'COOKING' },
  COOKING:  { label: '🔥 Masak',   color: 'text-orange-700', bg: 'bg-orange-50',  border: 'border-orange-200', next: 'READY' },
  READY:    { label: '✅ Siap',     color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', next: 'SERVED' },
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

  // Remove simulate new order arrival every 30s
  useEffect(() => {
    // Demo mode: No random new orders
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
      <div className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${cfg.border} ${isOverdue ? 'ring-2 ring-rose-400 ring-offset-2' : ''}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-black text-slate-800 tracking-tight">Meja {order.tableNo}</span>
              {order.source === 'ANTI_ANTRI' && (
                <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">QR Order</span>
              )}
              {order.priority === 'HIGH' && (
                <span className="bg-rose-50 text-rose-600 border border-rose-200 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">Prioritas</span>
              )}
            </div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{order.id} · {order.time}</p>
          </div>
          <div className={`text-right ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`}>
            <Clock className="w-4 h-4 ml-auto mb-1" />
            <p className={`text-sm font-black ${isOverdue ? 'text-rose-600' : 'text-slate-500'}`}>{fmtElapsed(order.elapsed)}</p>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-3 mb-5 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${cfg.color} ${cfg.bg} border ${cfg.border}`}>{item.qty}</span>
              <div className="mt-0.5">
                <p className="font-bold text-slate-700 text-sm">{item.name}</p>
                {item.note && <p className="text-xs text-rose-500 font-bold mt-0.5">⚠️ {item.note}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Action */}
        {STATUS_CONFIG[order.status].next && (
          <button onClick={() => advanceStatus(order.id)}
            className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm
              ${order.status === 'PENDING' ? 'bg-amber-500 text-white hover:bg-amber-600' :
                order.status === 'COOKING' ? 'bg-emerald-500 text-white hover:bg-emerald-600' :
                'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
            {order.status === 'PENDING' ? <><Utensils className="w-4 h-4" /> Mulai Memasak</> :
             order.status === 'COOKING' ? <><CheckCircle className="w-4 h-4" /> Tandai Selesai</> :
             <><ChevronRight className="w-4 h-4" /> Pesanan Tersaji</>}
          </button>
        )}
        {!STATUS_CONFIG[order.status].next && (
          <div className="w-full py-3.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-sm uppercase text-center border border-slate-200">
            ✓ Tersaji
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8">
      {/* New Order Alert */}
      {newOrderAlert && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-slate-200 text-slate-800 px-8 py-4 rounded-2xl shadow-xl font-bold text-lg flex items-center gap-3 animate-scale-up">
          <Bell className="w-6 h-6 text-amber-500 animate-pulse" /> Pesanan Baru Masuk!
        </div>
      )}

      {/* KDS Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 border border-slate-200">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Kitchen Display System</p>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">KDS Dashboard</h1>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {/* Stats */}
          <div className="flex gap-2 mr-2">
            {[
              { label: 'Antri', count: pending.length, color: 'text-amber-600 bg-amber-50 border-amber-100' },
              { label: 'Masak', count: cooking.length, color: 'text-orange-600 bg-orange-50 border-orange-100' },
              { label: 'Siap', count: ready.length, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
            ].map(s => (
              <div key={s.label} className={`px-4 py-2 rounded-xl border ${s.color} text-center min-w-[70px]`}>
                <p className="text-2xl font-black leading-none tracking-tight">{s.count}</p>
                <p className="text-[9px] font-bold uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          
          {/* Live clock */}
          <LiveClock />
          
          {/* Controls */}
          <div className="flex gap-2">
            <button onClick={() => setSoundOn(!soundOn)}
              className={`p-3 rounded-xl border transition-all ${soundOn ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-white border-slate-200 text-slate-300'}`}>
              <Volume2 className="w-4 h-4" />
            </button>
            <button onClick={() => setView(v => v === 'KANBAN' ? 'LIST' : 'KANBAN')}
              className="p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PENDING */}
        <div className="bg-slate-100/50 rounded-2xl p-4 border border-slate-200">
          <div className="flex items-center gap-2.5 mb-5 px-2">
            <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            <h2 className="font-bold uppercase tracking-widest text-xs text-slate-500">Antrian Masuk ({pending.length})</h2>
          </div>
          <div className="space-y-4">
            {pending.map(o => <OrderCard key={o.id} order={o} />)}
            {pending.length === 0 && <EmptyCol label="Tidak ada antrian" />}
          </div>
        </div>

        {/* COOKING */}
        <div className="bg-slate-100/50 rounded-2xl p-4 border border-slate-200">
          <div className="flex items-center gap-2.5 mb-5 px-2">
            <div className="w-2.5 h-2.5 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
            <h2 className="font-bold uppercase tracking-widest text-xs text-slate-500">Sedang Dimasak ({cooking.length})</h2>
          </div>
          <div className="space-y-4">
            {cooking.map(o => <OrderCard key={o.id} order={o} />)}
            {cooking.length === 0 && <EmptyCol label="Dapur kosong" />}
          </div>
        </div>

        {/* READY */}
        <div className="bg-slate-100/50 rounded-2xl p-4 border border-slate-200">
          <div className="flex items-center gap-2.5 mb-5 px-2">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <h2 className="font-bold uppercase tracking-widest text-xs text-slate-500">Siap Disajikan ({ready.length})</h2>
          </div>
          <div className="space-y-4">
            {ready.map(o => <OrderCard key={o.id} order={o} />)}
            {ready.length === 0 && <EmptyCol label="Belum ada yang siap" />}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-400">
        <span className="tracking-widest uppercase text-[10px]">VISTRAL POS KDS</span>
        <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Live Auto-Sync
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
  return <div className="bg-white border border-indigo-100 text-slate-800 px-5 py-2 rounded-xl font-black text-xl tabular-nums tracking-tight shadow-sm shadow-indigo-50">{time}</div>;
}

function EmptyCol({ label }: { label: string }) {
  return (
    <div className="border-2 border-dashed border-slate-200 bg-white/50 rounded-2xl p-8 text-center text-slate-400">
      <CheckCircle className="w-8 h-8 mx-auto mb-3 opacity-20" />
      <p className="font-semibold text-sm">{label}</p>
    </div>
  );
}
