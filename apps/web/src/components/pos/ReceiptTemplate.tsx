import React from 'react';

interface ReceiptProps {
  outletName: string;
  items: any[];
  subtotal: number;
  platformFee: number;
  total: number;
}

export function ReceiptTemplate({ outletName, items, subtotal, platformFee, total }: ReceiptProps) {
  return (
    <div className="bg-white p-6 w-[300px] font-mono text-[10px] text-slate-800 shadow-lg mx-auto">
      <div className="text-center border-b border-dashed border-slate-300 pb-4 mb-4">
        <h2 className="font-bold text-lg uppercase mb-1">{outletName}</h2>
        <p>Jl. Contoh Alamat No. 123, Jakarta</p>
        <p>0812-3456-7890</p>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span>Tgl: {new Date().toLocaleDateString('id-ID')}</span>
          <span>Jam: {new Date().toLocaleTimeString('id-ID')}</span>
        </div>
        <p>Kasir: Administrator</p>
        <p>No: #KSP-{Math.floor(Math.random() * 10000)}</p>
      </div>

      <div className="border-b border-dashed border-slate-300 pb-2 mb-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between mb-1">
            <div className="flex-1">
              <p>{item.product.name}</p>
              <p>{item.qty} x {item.product.price.toLocaleString('id-ID')}</p>
            </div>
            <p className="font-bold">{(item.qty * item.product.price).toLocaleString('id-ID')}</p>
          </div>
        ))}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{subtotal.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between italic">
          <span>Biaya Layanan (Patch 11)</span>
          <span>{platformFee.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between font-bold text-sm border-t border-slate-200 pt-1 mt-1">
          <span>TOTAL</span>
          <span>{total.toLocaleString('id-ID')}</span>
        </div>
      </div>

      <div className="text-center mt-8 space-y-1 border-t border-dashed border-slate-300 pt-4">
        <p className="font-bold">TERIMA KASIH</p>
        <p>Sudah mampir di {outletName}</p>
        <div className="mt-6 pt-4 text-[8px] text-slate-400 font-medium uppercase tracking-widest border-t border-slate-50">
          Dibuat dengan Kasir Sakti POS | zyntra.id
        </div>
      </div>
    </div>
  );
}
