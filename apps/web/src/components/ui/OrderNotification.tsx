import React, { useState, useEffect } from 'react';
import { Bell, ShoppingBag, CalendarCheck, X, Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type OrderType = 'GOFOOD' | 'SHOPEE' | 'GRAB' | 'WA' | 'RESERVATION';

interface IncomingOrder {
  id: string;
  type: OrderType;
  customerName: string;
  summary: string;
  time: string;
}

const ORDER_TEMPLATES: IncomingOrder[] = [];

export function OrderNotification() {
  const [order, setOrder] = useState<IncomingOrder | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate random incoming orders every 45-90 seconds
    const triggerOrder = () => {
      const randomOrder = ORDER_TEMPLATES[Math.floor(Math.random() * ORDER_TEMPLATES.length)];
      setOrder({ ...randomOrder, id: Math.random().toString() });
      setIsVisible(true);
      
      // Play sound
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play();
      } catch (e) {
        // Ignore auto-play policies
      }
    };

    // Removed auto-trigger for production/zero-data demo
    // const initialTimeout = setTimeout(triggerOrder, 5000);

    return () => {
      // clearTimeout(initialTimeout);
    };
  }, []);

  if (!order || !isVisible) return null;

  const getStyle = (type: OrderType) => {
    switch(type) {
      case 'GOFOOD': return { bg: 'bg-red-500', icon: <ShoppingBag className="w-6 h-6 text-white" />, label: 'GoFood' };
      case 'SHOPEE': return { bg: 'bg-orange-500', icon: <ShoppingBag className="w-6 h-6 text-white" />, label: 'ShopeeFood' };
      case 'GRAB': return { bg: 'bg-green-500', icon: <ShoppingBag className="w-6 h-6 text-white" />, label: 'GrabFood' };
      case 'WA': return { bg: 'bg-[#25D366]', icon: <Bell className="w-6 h-6 text-white" />, label: 'Pesanan WhatsApp' };
      case 'RESERVATION': return { bg: 'bg-indigo-500', icon: <CalendarCheck className="w-6 h-6 text-white" />, label: 'Reservasi Online' };
      default: return { bg: 'bg-primary', icon: <Bell className="w-6 h-6 text-white" />, label: 'Pesanan Baru' };
    }
  };

  const style = getStyle(order.type);

  return (
    <div className="fixed bottom-6 right-6 z-[999] animate-slide-up">
      <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden w-80">
        <div className={`${style.bg} p-4 flex items-center gap-3 relative overflow-hidden`}>
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/20 rounded-full blur-xl" />
          {style.icon}
          <div>
            <h4 className="font-black text-white uppercase tracking-widest text-xs">{style.label}</h4>
            <p className="text-white/80 text-[10px] font-bold">Waktu: {order.time}</p>
          </div>
          <button onClick={() => setIsVisible(false)} className="absolute top-2 right-2 text-white/50 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">
          <p className="font-black text-slate-800 text-lg mb-1">{order.customerName}</p>
          <p className="text-sm text-slate-500 font-medium mb-5">{order.summary}</p>
          
          <div className="flex gap-2">
            <button onClick={() => setIsVisible(false)} className="flex-1 py-2.5 rounded-xl border-2 border-slate-100 text-slate-400 font-bold text-xs uppercase hover:bg-slate-50 transition-colors">
              Nanti
            </button>
            <button onClick={() => { setIsVisible(false); navigate('/online-orders'); }} className="flex-2 w-full py-2.5 rounded-xl bg-slate-900 text-white font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-primary transition-colors shadow-lg shadow-slate-900/20">
              Cek Pesanan <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
