import React, { useState } from 'react';
import { ShoppingBag, Bell, CalendarCheck, Check, X, Phone, MapPin, Search, Filter, MessageCircle, AlertTriangle } from 'lucide-react';
import { useTransactionStore } from '../../stores/transaction.store';

type OrderStatus = 'NEW' | 'PROCESSING' | 'READY' | 'COMPLETED' | 'CANCELLED';
type OrderType = 'GOFOOD' | 'SHOPEE' | 'GRAB' | 'WA' | 'RESERVATION';

interface Order {
  id: string;
  type: OrderType;
  customerName: string;
  items: string[];
  total: number;
  status: OrderStatus;
  time: string;
  phone?: string;
  address?: string;
  notes?: string;
}

const MOCK_ORDERS: Order[] = [];

export default function OnlineOrderPage() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [filter, setFilter] = useState<'ALL' | OrderType>('ALL');

  const fmtRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  const updateStatus = (id: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    
    if (status === 'COMPLETED') {
      const order = orders.find(o => o.id === id);
      if (order) {
        useTransactionStore.getState().addTransaction({
          id: order.id,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          items: order.items.map((i, idx) => ({ 
            id: `dummy-${idx}`, 
            name: i, 
            price: 0, 
            basePrice: 0, 
            quantity: 1, 
            cartItemId: `ci-${idx}` 
          })),
          total: order.total,
          method: order.type === 'WA' ? 'WhatsApp' : order.type,
          cashier: 'Sistem Online',
          type: 'ONLINE'
        });
      }
    }
  };

  const getBadgeStyle = (type: OrderType) => {
    switch(type) {
      case 'GOFOOD': return 'bg-red-100 text-red-600 border-red-200';
      case 'SHOPEE': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'GRAB': return 'bg-green-100 text-green-600 border-green-200';
      case 'WA': return 'bg-[#25D366]/10 text-[#25D366] border-[#25D366]/30';
      case 'RESERVATION': return 'bg-indigo-100 text-indigo-600 border-indigo-200';
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch(status) {
      case 'NEW': return 'bg-rose-500 text-white animate-pulse';
      case 'PROCESSING': return 'bg-amber-500 text-white';
      case 'READY': return 'bg-blue-500 text-white';
      case 'COMPLETED': return 'bg-emerald-500 text-white';
      case 'CANCELLED': return 'bg-slate-300 text-slate-600';
    }
  };

  const filteredOrders = filter === 'ALL' ? orders : orders.filter(o => o.type === filter);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic flex items-center gap-3">
            Pesanan Online <span className="flex w-3 h-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full w-3 h-3 bg-rose-500"></span></span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Kelola pesanan dari GoFood, WhatsApp, & Reservasi Web</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Cari ID / Nama..." className="pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-sm font-bold w-48 focus:w-64 transition-all outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <button className="p-2 bg-slate-50 rounded-xl text-slate-500 hover:text-primary transition-colors"><Filter className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {(['ALL', 'GOFOOD', 'GRAB', 'SHOPEE', 'WA', 'RESERVATION'] as const).map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase whitespace-nowrap transition-all border-2 ${filter === t ? 'border-primary bg-primary/10 text-primary' : 'border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600'}`}>
            {t === 'ALL' ? 'Semua Pesanan' : t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 hover:border-primary/30 transition-all flex flex-col h-full relative overflow-hidden">
            {order.status === 'NEW' && <div className="absolute top-0 inset-x-0 h-1 bg-rose-500 animate-pulse" />}
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className={`inline-flex px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${getBadgeStyle(order.type)}`}>
                  {order.type}
                </span>
                <p className="font-black text-slate-900 mt-2 text-lg">{order.customerName}</p>
                <p className="text-xs font-bold text-slate-400">ID: {order.id} · {order.time}</p>
              </div>
              <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusBadge(order.status)}`}>
                {order.status}
              </span>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 flex-1 mb-4 border border-slate-100">
              <ul className="space-y-2 mb-4">
                {order.items.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm font-bold text-slate-700">
                    <span className="text-slate-400">•</span> {item}
                  </li>
                ))}
              </ul>
              
              {order.notes && (
                <div className="bg-amber-50 text-amber-700 p-3 rounded-xl text-xs font-medium border border-amber-200/50 flex gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {order.notes}
                </div>
              )}
            </div>

            {(order.phone || order.address) && (
              <div className="mb-4 space-y-2">
                {order.phone && (
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" /> {order.phone}
                    <button className="ml-auto text-[#25D366] hover:bg-[#25D366]/10 p-1 rounded-md transition-colors"><MessageCircle className="w-4 h-4" /></button>
                  </div>
                )}
                {order.address && (
                  <div className="flex items-start gap-2 text-xs font-medium text-slate-500">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" /> <span className="line-clamp-2">{order.address}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
              <span className="font-black text-primary text-xl">{fmtRp(order.total)}</span>
              
              <div className="flex gap-2">
                {order.status === 'NEW' && (
                  <>
                    <button onClick={() => updateStatus(order.id, 'CANCELLED')} className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                    <button onClick={() => updateStatus(order.id, 'PROCESSING')} className="px-4 h-10 rounded-xl bg-emerald-500 text-white font-black text-xs uppercase flex items-center gap-2 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-colors"><Check className="w-4 h-4" /> Terima</button>
                  </>
                )}
                {order.status === 'PROCESSING' && (
                  <button onClick={() => updateStatus(order.id, 'READY')} className="px-4 h-10 w-full rounded-xl bg-blue-500 text-white font-black text-xs uppercase hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-colors">Pesanan Siap</button>
                )}
                {order.status === 'READY' && (
                  <button onClick={() => updateStatus(order.id, 'COMPLETED')} className="px-4 h-10 w-full rounded-xl bg-slate-900 text-white font-black text-xs uppercase hover:bg-black shadow-lg shadow-slate-900/20 transition-colors">Selesaikan</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
