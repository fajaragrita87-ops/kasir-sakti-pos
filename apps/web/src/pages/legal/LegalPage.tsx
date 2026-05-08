import React from 'react';
import { Shield, FileText, Info } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';

export default function LegalPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-slate-100 py-6 px-8">
        <Logo />
      </nav>
      <div className="max-w-3xl mx-auto py-20 px-6">
        <h1 className="text-4xl font-black text-slate-900 mb-8 uppercase tracking-tighter">{title}</h1>
        <div className="prose prose-slate max-w-none space-y-6 text-slate-600 font-medium">
          <section>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Pendahuluan
            </h2>
            <p>Selamat datang di Kasir Sakti POS, produk dari Zyntra Labs. Dengan menggunakan layanan kami, Anda menyetujui seluruh ketentuan yang tertulis di halaman ini.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Kebijakan Data
            </h2>
            <p>Kami menjaga data UMKM Anda dengan standar enkripsi tinggi. Zyntra Labs berkomitmen untuk tidak menjual data transaksi Anda kepada pihak ketiga manapun sesuai UU PDP Indonesia.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" /> Penggunaan Koin
            </h2>
            <p>Koin yang telah dibeli tidak dapat diuangkan kembali tetapi tidak memiliki masa hangus. Biaya fitur premium (seperti HRD 18 koin/bulan) akan dipotong secara otomatis jika fitur diaktifkan.</p>
          </section>
        </div>
        <div className="mt-20 pt-8 border-t border-slate-100 text-center">
          <p className="text-xs font-bold text-slate-400">© 2026 Zyntra Labs. Building digital tools for the next billion.</p>
        </div>
      </div>
    </div>
  );
}
