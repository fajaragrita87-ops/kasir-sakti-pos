import React, { useState, useEffect } from 'react';
import { ShoppingCart, ArrowRight, User, Phone, Lock, ShieldCheck, Mail, Store, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { addRegistration } from '../../services/registrationNotifications';
import { supabase } from '../../lib/supabase';

export default function RegisterPage() {
  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [captchaInput, setCaptchaInput] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [password, setPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setCaptchaNum1(Math.floor(Math.random() * 10) + 1);
    setCaptchaNum2(Math.floor(Math.random() * 10) + 1);
  }, []);

  const [registerError, setRegisterError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(captchaInput) !== captchaNum1 + captchaNum2) {
      alert('Verifikasi Keamanan (Captcha) Salah! Silakan coba lagi.');
      setCaptchaNum1(Math.floor(Math.random() * 10) + 1);
      setCaptchaNum2(Math.floor(Math.random() * 10) + 1);
      setCaptchaInput('');
      return;
    }

    setSending(true);
    setRegisterError('');

    try {
      // 1. Daftarkan user di Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone: phone,
            business_name: businessName,
          },
        },
      });

      if (error) throw error;

      // 2. Buat profil di tabel profiles agar muncul di Super Admin
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: name,
          email: email,
          role: 'MERCHANT',
          outlet_id: `outlet-${data.user.id.slice(0, 8)}`,
          coins: 50,
          business_type: 'FNB',
          enabled_features: [
            'POS', 'INVENTORY', 'PURCHASE_ORDER', 'HRD', 'LOYALTY',
            'CRM', 'KDS', 'BILLING', 'ACCOUNTING', 'DEBT',
            'ONLINE_ORDER', 'ANTI_ANTRI', 'MIGRATION'
          ],
        });
      }

      // 3. Simpan notifikasi lokal (untuk Super Admin dashboard)
      addRegistration({ name, phone, email, businessName });

      setSending(false);
      setShowSuccess(true);
      // Redirect to login after 2.5 seconds
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      setSending(false);
      setRegisterError(err.message || 'Terjadi kesalahan saat mendaftar. Coba lagi.');
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-[2rem] p-10 shadow-2xl border border-slate-100">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Pendaftaran Berhasil! 🎉</h2>
            <p className="text-slate-500 text-sm font-medium mb-6">
              Akun <strong>{businessName || name}</strong> telah dibuat. Kami mengirimkan konfirmasi ke WhatsApp dan email Anda.
            </p>
            <div className="flex flex-col gap-2 text-xs font-bold text-left">
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
                <Phone className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="text-emerald-800">Notifikasi WhatsApp dikirim ke <strong>{phone}</strong></span>
              </div>
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
                <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="text-blue-800">Konfirmasi email dikirim ke <strong>{email}</strong></span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-6">Mengalihkan ke halaman login...</p>
          </div>
        </div>
      </div>
    );
  }

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

            {/* Nama Lengkap */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Nama sesuai KTP"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-field w-full pl-10"
                  required
                />
              </div>
            </div>

            {/* Nama Bisnis */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Nama Bisnis / Toko</label>
              <div className="relative">
                <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Contoh: Warung Pak Budi"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="input-field w-full pl-10"
                  required
                />
              </div>
            </div>

            {/* Nomor WA */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Nomor HP (WhatsApp)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="tel"
                  placeholder="0812xxxx"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="input-field w-full pl-10"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Notifikasi & OTP dikirim via WhatsApp.</p>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="email"
                  placeholder="email@bisnis.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field w-full pl-10"
                  autoComplete="off"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Konfirmasi dikirim ke email ini.</p>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Buat Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field w-full pl-10"
                  minLength={6}
                  autoComplete="new-password"
                  required
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

            {/* Notification Info Banner */}
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 flex items-start gap-3">
              <div className="flex flex-col gap-1 mt-0.5">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-violet-700 uppercase tracking-wide">
                  <Phone className="w-3 h-3" /> WA Notif Aktif
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-indigo-700 uppercase tracking-wide">
                  <Mail className="w-3 h-3" /> Email Konfirmasi Aktif
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                Setelah mendaftar, Super Admin platform akan mendapatkan notifikasi dan Anda akan menerima konfirmasi via WA & email.
              </p>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full btn-primary py-4 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mengirim Notifikasi...
                </>
              ) : (
                <>Daftar Gratis <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              )}
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
          Dengan mendaftar, Anda menyetujui <a href="#" className="underline">Syarat &amp; Ketentuan</a> serta <a href="#" className="underline">Kebijakan Privasi</a> Vistral POS.
        </p>
      </div>
    </div>
  );
}
