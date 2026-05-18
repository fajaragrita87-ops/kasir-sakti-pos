import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, ArrowRight, RotateCcw, Copy, Check } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';

// Knowledge base — seluruh modul VISTRAL POS
export const KNOWLEDGE: Record<string, string> = {
  // POS
  'pos': 'Modul POS (Point of Sale) adalah kasir digital utama. Cara pakai: Buka sidebar → Kasir POS → pilih produk → atur qty → pilih metode bayar (Tunai/QRIS/Kartu) → Proses. Stok berkurang otomatis dan jurnal akuntansi tercipta.',
  'kasir': 'Modul Kasir mendukung multi-metode pembayaran, diskon per item/total, cetak struk thermal 58/80mm, split bill, dan simpan bill. Shortcut: Enter = cari produk, Shift+P = buka POS.',
  'struk': 'Struk otomatis dicetak setelah transaksi. Format disesuaikan untuk printer thermal 58mm dan 80mm. Anda bisa custom nama toko, alamat, dan nomor WA di menu Pengaturan → Toko.',
  // Inventori
  'inventori': 'Modul Inventori mengelola master data produk. Tambah produk → isi nama, harga jual, HPP, stok awal → upload foto. Produk otomatis muncul di POS. Fitur BOM (Bill of Material) tersedia untuk produk resep.',
  'stok': 'Stok berkurang otomatis saat transaksi POS. Indikator: Hijau = aman, Kuning = menipis (<5), Merah = habis (0). Gunakan Stock Opname untuk menyesuaikan stok fisik vs sistem.',
  'produk': 'Produk bisa dikelola per kategori, memiliki SKU otomatis, foto, satuan (pcs/gram/ml/porsi), dan status aktif/nonaktif. Margin keuntungan ditampilkan otomatis.',
  'opname': 'Stock Opname: Buka Inventori → klik "Stock Opname" → bandingkan stok fisik dengan stok sistem → input stok fisik → Simpan. Selisih otomatis dicatat.',
  'bom': 'BOM (Bill of Material) / Resep: Aktifkan toggle "Resep/BOM" saat tambah produk → pilih bahan baku & qty. Saat produk terjual, stok bahan baku berkurang otomatis.',
  // Purchase Order
  'po': 'Purchase Order (PO) mengelola pesanan ke supplier. Buat PO → pilih supplier → tambah item → kirim. Saat barang diterima, stok inventori dan jurnal akuntansi otomatis diperbarui.',
  'supplier': 'Data supplier tersimpan lengkap: nama, kontak, email, alamat, kategori. Riwayat PO per supplier bisa dilihat. Tab Supplier di menu PO & Supplier.',
  // HRD
  'hrd': 'Modul HRD & Payroll mengelola karyawan, absensi GPS+selfie, izin/cuti, shift, dan payroll otomatis. BPJS Kesehatan & Ketenagakerjaan dihitung sesuai PP 44/2015. Slip gaji bisa dikirim via WhatsApp.',
  'payroll': 'Payroll otomatis menghitung: Gaji Pokok + Tunjangan - Potongan BPJS - PPh21. BPJS Kesehatan: 5% (4% perusahaan, 1% karyawan). BPJS TK: JHT 5.7%, JP 3%, JKK 0.24%, JKM 0.3%.',
  'absensi': 'Absensi menggunakan selfie + GPS real-time. Buka tab Absensi → klik "Absen Masuk (Live)" → ambil foto → lokasi tercatat otomatis. Status: Hadir, Izin, Sakit, Cuti, Alpha.',
  'gaji': 'Slip gaji berisi: Gaji Pokok, Tunjangan Makan, Tunjangan Transport, Potongan BPJS, PPh21, dan Total Bersih. Klik "Kirim via WA" untuk mengirim langsung ke karyawan.',
  // Akuntansi
  'akuntansi': 'Sistem akuntansi double-entry otomatis sekelas Kledo. Setiap transaksi POS, PO, atau pengeluaran otomatis membuat jurnal. Laporan: Neraca, Laba Rugi, Arus Kas, Neraca Saldo.',
  'jurnal': 'Jurnal dibuat otomatis dari transaksi. Anda juga bisa buat jurnal manual untuk koreksi. Setiap jurnal memiliki pasangan Debet-Kredit yang seimbang (double-entry).',
  'laporan': 'Laporan keuangan tersedia: 1) Laba Rugi (revenue vs expense), 2) Neraca (aset, liabilitas, ekuitas), 3) Arus Kas (operating, investing, financing), 4) Neraca Saldo.',
  'neraca': 'Neraca menampilkan posisi keuangan bisnis: Aset (kas, piutang, persediaan, aset tetap) = Liabilitas (hutang) + Ekuitas (modal). Diupdate real-time dari jurnal.',
  'coa': 'Chart of Accounts (Daftar Akun) terdiri dari 40+ akun default: 1-xxxx Aset, 2-xxxx Liabilitas, 3-xxxx Ekuitas, 4-xxxx Pendapatan, 5-xxxx Beban. Bisa ditambah custom.',
  // CRM
  'crm': 'CRM mengelola pelanggan dengan analisis RFM (Recency, Frequency, Monetary). Segmentasi otomatis: Loyal, Active, New, At Risk, Churned. Deteksi churn: >30 hari = At Risk, >60 hari = Churned.',
  'pelanggan': 'Database pelanggan menyimpan: nama, telepon, total belanja, jumlah kunjungan, terakhir datang. Segmen otomatis dihitung berdasarkan RFM.',
  'rfm': 'RFM Analysis: R(ecency) kapan terakhir beli, F(requency) seberapa sering, M(onetary) berapa banyak belanja. Skor 1-3 per dimensi. Total 9 = Champion.',
  // Loyalty
  'loyalty': 'Loyalty Program: Pelanggan otomatis dapat poin setiap transaksi. Tier: Bronze → Silver → Gold → Platinum. Poin bisa ditukar voucher diskon.',
  // Billing & Koin
  'koin': 'Sistem Pay-As-You-Go menggunakan Koin. Modul POS gratis selamanya. Modul premium (HRD, Akuntansi, KDS, dll) dibeli dengan Koin per Harian/Mingguan/Bulanan. Koin tidak hangus.',
  'billing': 'Informasi Layanan menampilkan modul aktif, countdown real-time, dan saldo koin. Top-up koin: pilih paket → hubungi admin via WhatsApp.',
  'premium': 'Modul premium: Inventori, PO, HRD, Akuntansi, CRM, Loyalty, KDS, Pesanan Online, Anti-Antri, Migrasi Data. Setiap modul bisa dibeli terpisah sesuai kebutuhan.',
  // Settings
  'pengaturan': 'Pengaturan meliputi: Info Toko (nama, logo, alamat), Kelola Pengguna (staff, PIN, hak akses), App Market (aktifkan modul), Notifikasi, dan Keamanan.',
  'role': 'Role & Permission: SUPERADMIN = akses penuh platform + SA Dashboard. MERCHANT = pemilik toko, akses semua modul yang diaktifkan. STAFF = kasir, akses terbatas sesuai permission.',
  // KDS
  'kds': 'Kitchen Display System: Pesanan dari kasir muncul otomatis di layar dapur. Alur: Baru → Masak → Siap. Timer peringatan jika pesanan terlalu lama. Pasang di tablet/TV dapur.',
  'dapur': 'Layar dapur (KDS) menampilkan antrian pesanan real-time dari kasir. Koki klik "Masak" saat mulai dan "Siap" saat selesai. Kasir mendapat notifikasi otomatis.',
  // Online Order
  'online': 'Pesanan Online mengintegrasikan GoFood, GrabFood, WhatsApp ke 1 dashboard. Notifikasi suara berbeda per platform. Proses: Terima → Siapkan → Selesai.',
  'reservasi': 'Fitur Reservasi untuk mengelola booking meja atau jadwal layanan. Notifikasi otomatis ke pelanggan dan dashboard.',
  // Piutang
  'piutang': 'Modul Piutang mencatat hutang pelanggan yang belum bayar. Status: Belum Lunas, Cicilan, Lunas. Reminder otomatis bisa dikirim via WhatsApp.',
  // Migrasi
  'migrasi': 'Migrasi Data memungkinkan import data produk, pelanggan, dan transaksi dari sistem lama (Excel/CSV). Template tersedia untuk download.',
  // Dashboard
  'dashboard': 'Dashboard menampilkan KPI utama: Pendapatan hari ini, Transaksi, Produk terjual, Rata-rata order. Dilengkapi AI Insight, Activity Feed, dan Quick Navigation ke semua modul.',
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function findAnswer(query: string): string {
  const q = query.toLowerCase().replace(/[?!.,]/g, '');
  
  // Direct keyword match
  for (const [key, val] of Object.entries(KNOWLEDGE)) {
    if (q.includes(key)) return val;
  }
  
  // Fuzzy match — cek kata-kata di value
  const words = q.split(' ').filter(w => w.length > 2);
  let bestMatch = '';
  let bestScore = 0;
  
  for (const [, val] of Object.entries(KNOWLEDGE)) {
    const score = words.filter(w => val.toLowerCase().includes(w)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = val;
    }
  }
  
  if (bestScore >= 2) return bestMatch;
  
  // Context-aware responses
  if (q.includes('cara') || q.includes('bagaimana') || q.includes('gimana')) {
    if (q.includes('bayar') || q.includes('pembayaran')) return KNOWLEDGE['kasir'];
    if (q.includes('tambah') && q.includes('produk')) return KNOWLEDGE['inventori'];
    if (q.includes('tambah') && q.includes('karyawan')) return KNOWLEDGE['hrd'];
    if (q.includes('laporan')) return KNOWLEDGE['laporan'];
    if (q.includes('absen')) return KNOWLEDGE['absensi'];
  }
  
  if (q.includes('harga') || q.includes('biaya') || q.includes('bayar')) return KNOWLEDGE['koin'];
  if (q.includes('fitur') || q.includes('modul')) return KNOWLEDGE['premium'];
  if (q.includes('izin') || q.includes('akses') || q.includes('permission')) return KNOWLEDGE['role'];
  
  return 'Maaf, saya belum menemukan informasi spesifik untuk pertanyaan Anda. Coba tanyakan tentang modul tertentu seperti: POS, Inventori, HRD, Akuntansi, CRM, Loyalty, KDS, PO, Koin, atau Pengaturan. Saya siap membantu!';
}

const QUICK_QUESTIONS = [
  'Bagaimana cara pakai POS?',
  'Apa itu sistem koin?',
  'Cara melihat laporan keuangan?',
  'Bagaimana cara absensi karyawan?',
  'Apa perbedaan role user?',
  'Cara tambah produk baru?',
  'Apa itu Stock Opname?',
  'Cara buat Purchase Order?',
];

export default function AISaktiPage() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Halo${user?.name ? ` ${user.name}` : ''}! 👋\n\nSaya **AI Sakti** — asisten pintar VISTRAL POS. Saya menguasai seluruh modul: POS, Inventori, HRD & Payroll, Akuntansi, CRM, Loyalty, KDS, Purchase Order, dan Sistem Koin.\n\nTanyakan apa saja tentang cara penggunaan, fitur, laporan, atau troubleshooting. Saya siap membantu!`, timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = (text?: string) => {
    const query = text || input.trim();
    if (!query) return;

    const userMsg: Message = { role: 'user', content: query, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI "thinking" delay
    setTimeout(() => {
      const answer = findAnswer(query);
      const aiMsg: Message = { role: 'assistant', content: answer, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600 + Math.random() * 800);
  };

  const handleCopy = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleReset = () => {
    setMessages([
      { role: 'assistant', content: 'Percakapan direset. Silakan tanyakan apa saja tentang VISTRAL POS! 🚀', timestamp: new Date() },
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
    <div className="max-w-[1000px] mx-auto p-6 lg:p-8 flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      
      {/* Header */}
      <div className="flex items-center justify-between bg-white border border-indigo-100 rounded-2xl px-6 py-4 shadow-sm mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">AI Assistant</span>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">AI Sakti</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-emerald-700 uppercase">Online</span>
          </div>
          <button onClick={handleReset} className="p-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-500 hover:bg-indigo-600 hover:text-white hover:border-transparent transition-all" title="Reset Percakapan">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] relative group ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-2xl rounded-br-md px-5 py-3.5'
                : 'bg-white border border-indigo-100 text-slate-700 rounded-2xl rounded-bl-md px-5 py-3.5 shadow-sm'
            }`}>
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">AI Sakti</span>
                </div>
              )}
              <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</div>
              <div className={`flex items-center justify-between mt-2 ${msg.role === 'user' ? 'text-indigo-200' : 'text-slate-300'}`}>
                <span className="text-[9px] font-bold">
                  {msg.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.role === 'assistant' && (
                  <button onClick={() => handleCopy(idx, msg.content)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-indigo-50">
                    {copied === idx ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-indigo-100 rounded-2xl rounded-bl-md px-5 py-3.5 shadow-sm">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">AI Sakti sedang mengetik...</span>
              </div>
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: `${i*150}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-4 flex-shrink-0">
          {QUICK_QUESTIONS.map(q => (
            <button key={q} onClick={() => handleSend(q)}
              className="bg-white border border-indigo-100 text-slate-600 px-3.5 py-2 rounded-xl text-xs font-bold hover:border-indigo-400 hover:text-indigo-700 transition-all flex items-center gap-1.5">
              <ArrowRight className="w-3 h-3 text-indigo-400" />{q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 flex gap-2 bg-white border border-indigo-100 rounded-2xl p-2 shadow-sm">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Tanya apa saja tentang VISTRAL POS..."
          className="flex-1 px-4 py-3 text-sm font-medium text-slate-800 bg-transparent outline-none placeholder-slate-300"
        />
        <button onClick={() => handleSend()} disabled={!input.trim()}
          className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md shadow-indigo-200">
          <Send className="w-4 h-4" /> Kirim
        </button>
      </div>
    </div>
    </div>
  );
}
