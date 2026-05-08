import React, { useState, useEffect } from 'react';
import { ShoppingCart, ArrowRight, User, Phone, Lock, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [captchaInput, setCaptchaInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setCaptchaNum1(Math.floor(Math.random() * 10) + 1);
    setCaptchaNum2(Math.floor(Math.random() * 10) + 1);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(captchaInput) !== captchaNum1 + captchaNum2) {
      alert('Verifikasi Keamanan (Captcha) Salah! Silakan coba lagi.');
      setCaptchaNum1(Math.floor(Math.random() * 10) + 1);
      setCaptchaNum2(Math.floor(Math.random() * 10) + 1);
      setCaptchaInput('');
      return;
    }
    navigate('/login');
  };
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-primary w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <ShoppingCart className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Daftar Akun Baru</h1>
          <p className="text-slate-500 text-sm mt-1">Gabung bersama 10.000+ UMKM Indonesia.</p>
        </div>

        <div className="card shadow-xl border-0">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Nama sesuai KTP" 
                  className="input-field w-full pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Nomor HP (WhatsApp)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="tel" 
                  placeholder="0812xxxx" 
                  className="input-field w-full pl-10"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Kami akan mengirimkan kode OTP melalui WhatsApp.</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Buat Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="password" 
                  placeholder="Minimal 6 karakter" 
                  className="input-field w-full pl-10"
                />
              </div>
            </div>

            {/* Captcha */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Verifikasi Keamanan
              </label>
              <div className="flex items-center gap-3">
                <div className="bg-white px-4 py-2.5 rounded-lg border border-slate-200 font-black text-slate-700 tracking-wider">
                  {captchaNum1} + {captchaNum2} =
                </div>
                <input 
                  type="number" 
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="?" 
                  className="input-field flex-1 font-black"
                  required
                />
              </div>
            </div>

            <button type="submit" className="w-full btn-primary py-4 flex items-center justify-center gap-2 group">
              Daftar Gratis <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Sudah punya akun?{' '}
              <Link to="/login" className="font-bold text-primary hover:underline">Masuk di sini</Link>
            </p>
          </div>
        </div>
        
        <p className="text-center mt-8 text-[10px] text-slate-400 font-medium px-4">
          Dengan mendaftar, Anda menyetujui <a href="#" className="underline">Syarat & Ketentuan</a> serta <a href="#" className="underline">Kebijakan Privasi</a> Zyntra Labs.
        </p>
      </div>
    </div>
  );
}
