import React from 'react';
import { ShoppingCart, ArrowRight, ShieldCheck } from 'lucide-react';

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-primary w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Verifikasi Nomor HP</h1>
          <p className="text-slate-500 text-sm mt-1">Masukkan 6 digit kode yang kami kirim ke WhatsApp.</p>
        </div>

        <div className="card shadow-xl border-0">
          <form className="space-y-6">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <input 
                  key={i}
                  type="text" 
                  maxLength={1}
                  className="w-12 h-14 text-center text-xl font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                />
              ))}
            </div>

            <button type="submit" className="w-full btn-primary py-4 flex items-center justify-center gap-2 group">
              Verifikasi <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Tidak menerima kode?{' '}
              <button className="font-bold text-primary hover:underline">Kirim Ulang (59s)</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
