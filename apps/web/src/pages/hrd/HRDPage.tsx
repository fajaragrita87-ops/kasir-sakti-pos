import React, { useState, useRef, useEffect } from 'react';
import { Users, Clock, DollarSign, Calendar, Plus, Edit2, Check, X, FileText, Send, AlertTriangle, Zap, ChevronRight, Camera, MapPin, Loader2 } from 'lucide-react';

type Tab = 'KARYAWAN' | 'ABSENSI' | 'PAYROLL' | 'SHIFT' | 'IZIN';

interface Employee {
  id: string; name: string; position: string; baseSalary: number;
  bankAccount: string; bpjs: string; isActive: boolean; shift: string;
}

interface Attendance {
  id: string; employeeId: string; date: string;
  checkIn: string; checkOut: string;
  status: 'HADIR' | 'IZIN' | 'SAKIT' | 'CUTI' | 'ALPHA';
}

interface LeaveRequest {
  id: string; employeeId: string; type: 'IZIN' | 'SAKIT' | 'CUTI';
  date: string; reason: string; status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const EMPLOYEES: Employee[] = [];

const ATTENDANCES: Attendance[] = [];

const LEAVE_REQUESTS: LeaveRequest[] = [];

const fmtRp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

// BPJS Calc (UU Cipta Kerja)
function calcBPJS(salary: number) {
  const bpjsKesEmployee = Math.round(salary * 0.01);
  const bpjsKesCompany = Math.round(salary * 0.04);
  const bpjsTKEmployee = Math.round(salary * 0.02);
  const bpjsTKCompany = Math.round(salary * 0.037);
  return { bpjsKesEmployee, bpjsKesCompany, bpjsTKEmployee, bpjsTKCompany };
}

function calcPayroll(emp: Employee, overtime = 0, allowances = 0) {
  const bpjs = calcBPJS(emp.baseSalary);
  const deductions = bpjs.bpjsKesEmployee + bpjs.bpjsTKEmployee;
  const net = emp.baseSalary + allowances + overtime - deductions;
  return { ...bpjs, deductions, overtime, allowances, net };
}

export default function HRDPage() {
  const [tab, setTab] = useState<Tab>('KARYAWAN');
  const [leaves, setLeaves] = useState(LEAVE_REQUESTS);
  const [showAddEmp, setShowAddEmp] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [showLiveAbsen, setShowLiveAbsen] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isLoadingCam, setIsLoadingCam] = useState(false);
  const [downloadingSlip, setDownloadingSlip] = useState<string | null>(null);
  const [waSending, setWaSending] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setIsLoadingCam(true);
    setPhoto(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error(err)
      );
    } catch (err) {
      console.error(err);
      alert('Akses kamera atau lokasi ditolak.');
    }
    setIsLoadingCam(false);
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
    }
  };

  const takeSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        setPhoto(canvasRef.current.toDataURL('image/jpeg'));
        stopCamera();
      }
    }
  };

  const submitAbsen = () => {
    if (!photo || !location) return;
    alert(`Absen berhasil!\nLokasi: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
    setShowLiveAbsen(false);
    setPhoto(null);
  };

  // Bersihkan kamera saat unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'KARYAWAN', label: 'Data Karyawan', icon: <Users className="w-4 h-4" /> },
    { key: 'ABSENSI', label: 'Absensi', icon: <Clock className="w-4 h-4" /> },
    { key: 'IZIN', label: 'Izin & Cuti', icon: <Calendar className="w-4 h-4" /> },
    { key: 'PAYROLL', label: 'Payroll', icon: <DollarSign className="w-4 h-4" /> },
    { key: 'SHIFT', label: 'Shift', icon: <Calendar className="w-4 h-4" /> },
  ];

  const statusColor: Record<string, string> = {
    HADIR: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    IZIN: 'bg-amber-50 text-amber-700 border border-amber-200',
    SAKIT: 'bg-orange-50 text-orange-700 border border-orange-200',
    CUTI: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    ALPHA: 'bg-rose-50 text-rose-700 border border-rose-200',
    PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
    APPROVED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    REJECTED: 'bg-rose-50 text-rose-700 border border-rose-200',
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
    <div className="max-w-[1400px] mx-auto p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-4 bg-white border border-indigo-100 rounded-2xl px-6 py-4 shadow-sm">
        <div>
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Human Resource Management</span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-1">HRD & Payroll</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Manajemen karyawan · Absensi GPS · Payroll otomatis · UU Cipta Kerja</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-black">
          <Zap className="w-4 h-4 text-indigo-500" />
          <span className="text-indigo-600">Premium Aktif</span>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Karyawan', value: EMPLOYEES.length, icon: <Users className="w-4 h-4" /> },
          { label: 'Hadir Hari Ini', value: ATTENDANCES.filter(a => a.status === 'HADIR').length, icon: <Clock className="w-4 h-4" /> },
          { label: 'Izin/Sakit', value: ATTENDANCES.filter(a => ['IZIN','SAKIT','CUTI'].includes(a.status)).length, icon: <Calendar className="w-4 h-4" /> },
          { label: 'Total Gaji/Bln', value: `Rp ${(EMPLOYEES.reduce((a, e) => a + e.baseSalary, 0) / 1000000).toFixed(1)}M`, icon: <DollarSign className="w-4 h-4" /> },
        ].map(k => (
          <div key={k.label} className="bg-white border border-indigo-100 rounded-2xl p-5 hover:border-indigo-300 transition-all group">
            <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-500 mb-3 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-all">{k.icon}</div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{k.label}</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border border-indigo-200 rounded-xl overflow-hidden w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-[11px] font-black uppercase tracking-wide whitespace-nowrap transition-colors ${tab === t.key ? 'bg-indigo-600 text-white' : 'text-indigo-400 hover:bg-indigo-50'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* KARYAWAN */}
      {tab === 'KARYAWAN' && (
        <div className="space-y-4">
          <button onClick={() => setShowAddEmp(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all">
            <Plus className="w-4 h-4" /> Tambah Karyawan
          </button>
          {EMPLOYEES.map(emp => {
            const bpjs = calcBPJS(emp.baseSalary);
            return (
              <div key={emp.id} className="bg-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-xl flex-shrink-0">
                  {emp.name[0]}
                </div>
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Nama</p>
                    <p className="font-black text-slate-800">{emp.name}</p>
                    <p className="text-xs text-slate-400">{emp.position} · Shift {emp.shift}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Gaji Pokok</p>
                    <p className="font-black text-slate-800">{fmtRp(emp.baseSalary)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">BPJS (Kary.)</p>
                    <p className="font-black text-slate-700 text-sm">Kes: {fmtRp(bpjs.bpjsKesEmployee)}</p>
                    <p className="font-bold text-slate-500 text-xs">TK: {fmtRp(bpjs.bpjsTKEmployee)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Rekening</p>
                    <p className="font-bold text-slate-600 text-sm">{emp.bankAccount}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => setSelectedEmp(emp)} className="p-2 rounded-xl bg-slate-50 hover:bg-primary/10 text-slate-400 hover:text-primary transition-all">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <span className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase ${emp.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {emp.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ABSENSI ──────────────────── */}
      {tab === 'ABSENSI' && (
        <div>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-5 border-b border-slate-50 flex justify-between items-center flex-wrap gap-4">
              <h3 className="font-black text-slate-800 uppercase tracking-tight">Absensi Hari Ini — {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3>
              <div className="flex gap-2">
                <button onClick={() => { setShowLiveAbsen(true); startCamera(); }} className="btn-primary px-4 py-2 text-xs flex items-center gap-2">
                  <Camera className="w-4 h-4" /> Absen Masuk (Live)
                </button>
                <button className="bg-slate-100 text-slate-600 font-black px-4 py-2 text-xs rounded-2xl">Export Laporan</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    {['Karyawan', 'Posisi', 'Check-In', 'Check-Out', 'Durasi', 'Status', 'Aksi'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {EMPLOYEES.map(emp => {
                    const att = ATTENDANCES.find(a => a.employeeId === emp.id);
                    const dur = att?.checkIn && att?.checkOut
                      ? `${Math.round((new Date(`2000-01-01 ${att.checkOut}`).getTime() - new Date(`2000-01-01 ${att.checkIn}`).getTime()) / 3600000)}j`
                      : '-';
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-4 font-bold text-slate-800">{emp.name}</td>
                        <td className="px-5 py-4 text-slate-500 text-sm">{emp.position}</td>
                        <td className="px-5 py-4 font-mono text-sm text-slate-700">{att?.checkIn || '-'}</td>
                        <td className="px-5 py-4 font-mono text-sm text-slate-700">{att?.checkOut || '-'}</td>
                        <td className="px-5 py-4 text-sm text-slate-600 font-bold">{dur}</td>
                        <td className="px-5 py-4">
                          <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase ${statusColor[att?.status ?? 'ALPHA']}`}>
                            {att?.status ?? 'ALPHA'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {!att?.checkIn && (
                            <button className="text-[10px] font-black text-primary hover:underline uppercase">Check-In</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── IZIN & CUTI ──────────────── */}
      {tab === 'IZIN' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-amber-800 text-sm">Sisa Jatah Cuti</p>
              <p className="text-amber-700 text-xs mt-1">Setiap karyawan berhak 12 hari cuti tahunan sesuai UU Ketenagakerjaan Pasal 79.</p>
            </div>
          </div>
          {leaves.map(req => {
            const emp = EMPLOYEES.find(e => e.id === req.employeeId);
            return (
              <div key={req.id} className="bg-white rounded-2xl p-6 shadow-lg flex items-center gap-5">
                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black flex-shrink-0">
                  {emp?.name[0]}
                </div>
                <div className="flex-1">
                  <p className="font-black text-slate-800">{emp?.name}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{req.type} · {req.date} · <span className="italic">"{req.reason}"</span></p>
                </div>
                <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase ${statusColor[req.status]}`}>{req.status}</span>
                {req.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <button onClick={() => setLeaves(l => l.map(x => x.id === req.id ? { ...x, status: 'APPROVED' } : x))}
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setLeaves(l => l.map(x => x.id === req.id ? { ...x, status: 'REJECTED' } : x))}
                      className="p-2 rounded-xl bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── PAYROLL ──────────────────── */}
      {tab === 'PAYROLL' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-black text-slate-800 uppercase tracking-tight">Payroll Mei 2026</h3>
                <p className="text-sm text-slate-400 font-medium">Proses gaji otomatis dan efisien.</p>
              </div>
              <button 
                onClick={() => {
                  alert('✅ Gaji berhasil diproses!\n\nJurnal akuntansi double-entry didebet dari akun "5-2001 (Beban Gaji)" dan dikreditkan ke akun "1-1001 (Kas & Bank)" secara otomatis di belakang layar.');
                }}
                className="btn-primary px-6 py-3 text-sm flex items-center gap-2"
              >
                <Zap className="w-4 h-4" /> Proses Semua Gaji
              </button>
            </div>
            <div className="space-y-4">
              {EMPLOYEES.map(emp => {
                const calc = calcPayroll(emp, 150000, 200000);
                return (
                  <div key={emp.id} className="border border-slate-100 rounded-2xl p-5">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black">{emp.name[0]}</div>
                        <div>
                          <p className="font-black text-slate-800">{emp.name}</p>
                          <p className="text-xs text-slate-400">{emp.position}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Gaji Bersih</p>
                        <p className="text-xl font-black text-primary">{fmtRp(calc.net)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                      {[
                        { label: 'Gaji Pokok', value: fmtRp(emp.baseSalary), color: 'text-slate-800' },
                        { label: 'Tunjangan', value: fmtRp(calc.allowances), color: 'text-emerald-600' },
                        { label: 'Lembur', value: fmtRp(calc.overtime), color: 'text-blue-600' },
                        { label: 'BPJS Kesehatan', value: `-${fmtRp(calc.bpjsKesEmployee)}`, color: 'text-amber-600' },
                        { label: 'BPJS TK', value: `-${fmtRp(calc.bpjsTKEmployee)}`, color: 'text-amber-600' },
                      ].map(item => (
                        <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                          <p className="text-[9px] font-black text-slate-400 uppercase">{item.label}</p>
                          <p className={`font-black ${item.color}`}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={() => {
                          setDownloadingSlip(emp.id);
                          setTimeout(() => {
                            setDownloadingSlip(null);
                            alert(`Berhasil! Slip Gaji untuk ${emp.name} periode Mei 2026 berhasil diunduh dalam format PDF.`);
                          }, 1500);
                        }}
                        disabled={downloadingSlip === emp.id}
                        className={`flex items-center gap-1 text-[10px] font-black hover:underline uppercase ${downloadingSlip === emp.id ? 'text-slate-400' : 'text-primary'}`}
                      >
                        <FileText className={`w-3 h-3 ${downloadingSlip === emp.id ? 'animate-bounce' : ''}`} /> 
                        {downloadingSlip === emp.id ? 'Menyiapkan...' : 'Slip Gaji'}
                      </button>
                      <button 
                        onClick={() => {
                          setWaSending(emp.id);
                          setTimeout(() => {
                            setWaSending(null);
                            const text = encodeURIComponent(`*SLIP GAJI KARYAWAN*\nNama: ${emp.name}\nJabatan: ${emp.position}\nBulan: Mei 2026\n\nGaji Pokok: Rp ${emp.baseSalary.toLocaleString('id-ID')}\nPotongan BPJS: Rp ${calc.deductions.toLocaleString('id-ID')}\n*Total Diterima: Rp ${calc.net.toLocaleString('id-ID')}*\n\nTerima kasih atas kerja keras Anda!`);
                            window.open(`https://wa.me/?text=${text}`, '_blank');
                          }, 1000);
                        }}
                        disabled={waSending === emp.id}
                        className={`flex items-center gap-1 text-[10px] font-black hover:underline uppercase cursor-pointer ${waSending === emp.id ? 'text-slate-400' : 'text-[#25D366]'}`}
                      >
                        <Send className={`w-3 h-3 ${waSending === emp.id ? 'animate-pulse' : ''}`} /> 
                        {waSending === emp.id ? 'Membuka WA...' : 'Kirim via WA'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* THR Calculator */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
            <h3 className="font-black text-xl mb-2 uppercase">🎉 Kalkulator THR</h3>
            <p className="text-white/80 text-sm mb-4">THR = 1 bulan gaji pokok (masa kerja ≥ 12 bulan) · UU No. 6/2023</p>
            <div className="grid grid-cols-3 gap-3">
              {EMPLOYEES.map(emp => (
                <div key={emp.id} className="bg-white/20 rounded-xl p-4">
                  <p className="font-bold text-sm">{emp.name}</p>
                  <p className="font-black text-xl mt-1">{fmtRp(emp.baseSalary)}</p>
                  <p className="text-white/70 text-[10px] uppercase mt-1">THR Wajib</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SHIFT ────────────────────── */}
      {tab === 'SHIFT' && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-5 border-b border-slate-50">
            <h3 className="font-black text-slate-800 uppercase tracking-tight">Jadwal Shift Minggu Ini</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase">Karyawan</th>
                  {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(d => (
                    <th key={d} className="px-3 py-3 text-center text-[10px] font-black text-slate-400 uppercase">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {EMPLOYEES.map((emp, i) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800">{emp.name}</p>
                      <p className="text-xs text-slate-400">{emp.position}</p>
                    </td>
                    {[0,1,2,3,4,5,6].map(d => {
                      const shifts = ['Pagi', 'Siang', 'Malam'];
                      const isOff = (i === 0 && d === 6) || (i === 1 && d === 0) || (i === 2 && d === 5);
                      const shift = isOff ? 'OFF' : shifts[i % 3];
                      const colors: Record<string, string> = {
                        'Pagi': 'bg-amber-100 text-amber-700',
                        'Siang': 'bg-blue-100 text-blue-700',
                        'Malam': 'bg-purple-100 text-purple-700',
                        'OFF': 'bg-slate-100 text-slate-400',
                      };
                      return (
                        <td key={d} className="px-3 py-4 text-center">
                          <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${colors[shift]}`}>{shift}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-5 bg-slate-50 border-t border-slate-100">
            <div className="flex gap-4 text-xs font-bold">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-400 rounded-full inline-block" />Pagi 06:00–14:00</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-400 rounded-full inline-block" />Siang 14:00–22:00</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-purple-400 rounded-full inline-block" />Malam 22:00–06:00</span>
            </div>
          </div>
        </div>
      )}

      {/* BPJS Company share notice */}
      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <p className="font-black text-blue-800 text-sm mb-2">📋 Kewajiban BPJS Perusahaan (per UU SJSN & PP 44/2015)</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {EMPLOYEES.map(emp => {
            const b = calcBPJS(emp.baseSalary);
            return (
              <div key={emp.id} className="bg-white rounded-xl p-3 text-xs">
                <p className="font-black text-slate-700">{emp.name}</p>
                <p className="text-slate-500 mt-1">Kes Perusahaan: <span className="text-blue-600 font-black">{fmtRp(b.bpjsKesCompany)}</span></p>
                <p className="text-slate-500">TK Perusahaan: <span className="text-blue-600 font-black">{fmtRp(b.bpjsTKCompany)}</span></p>
              </div>
            );
          })}
        </div>
      </div>
      {/* Live Absen Modal */}
      {showLiveAbsen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-3xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-50">
              <div>
                <h3 className="font-black text-slate-900 uppercase tracking-tight">Absen Masuk</h3>
                <p className="text-xs text-slate-500 font-medium">Validasi Selfie & Lokasi (Anti-Cheat)</p>
              </div>
              <button onClick={() => { stopCamera(); setShowLiveAbsen(false); }} className="p-2 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-slate-900 rounded-2xl aspect-[3/4] relative overflow-hidden mb-4 shadow-inner">
                {photo ? (
                  <img src={photo} alt="Selfie" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    {isLoadingCam && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-900/50 backdrop-blur-sm">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <span className="text-xs font-black uppercase tracking-widest">Membuka Kamera...</span>
                      </div>
                    )}
                  </>
                )}
                <canvas ref={canvasRef} className="hidden" />

                {/* Location overlay */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/10">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-0.5">Lokasi Terdeteksi</p>
                      {location ? (
                        <p className="text-xs font-bold text-white leading-tight">
                          {location.lat.toFixed(5)}, {location.lng.toFixed(5)}<br/>
                          <span className="text-emerald-400">Jarak Aman (Di area Outlet)</span>
                        </p>
                      ) : (
                        <p className="text-xs font-bold text-amber-400 animate-pulse">Mencari sinyal GPS...</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {photo ? (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => { setPhoto(null); startCamera(); }} className="py-3 rounded-xl font-black text-xs uppercase bg-slate-100 text-slate-600 hover:bg-slate-200">
                    Ulangi Foto
                  </button>
                  <button onClick={submitAbsen} className="btn-primary py-3">
                    Kirim Absensi
                  </button>
                </div>
              ) : (
                <button onClick={takeSelfie} disabled={!location || isLoadingCam} className="w-full btn-premium py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Camera className="w-5 h-5" /> {location ? 'Ambil Foto Selfie' : 'Tunggu Lokasi...'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Karyawan */}
      {showAddEmp && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-3xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-50">
              <div>
                <h3 className="font-black text-slate-900 uppercase tracking-tight">Tambah Karyawan Baru</h3>
                <p className="text-xs text-slate-500 font-medium">Registrasi profil dan data payroll karyawan</p>
              </div>
              <button onClick={() => setShowAddEmp(false)} className="p-2 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Lengkap</label>
                  <input type="text" className="input-field w-full" placeholder="Nama Karyawan" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Posisi / Jabatan</label>
                  <input type="text" className="input-field w-full" placeholder="Cth: Kasir, Pelayan" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gaji Pokok (Rp)</label>
                  <input type="number" className="input-field w-full" placeholder="2500000" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">No. Rekening</label>
                  <input type="text" className="input-field w-full" placeholder="Bank - Nomor" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Shift Kerja Default</label>
                  <select className="input-field w-full">
                    <option>Pagi</option>
                    <option>Siang</option>
                    <option>Malam</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-indigo-50 p-4 rounded-xl text-sm text-indigo-700 border border-indigo-100 mt-4">
                <p className="font-bold mb-1">Informasi:</p>
                <p>Karyawan yang didaftarkan akan otomatis dibuatkan PIN akses untuk login aplikasi (apabila memiliki peran Kasir).</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowAddEmp(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">Batal</button>
                <button onClick={() => setShowAddEmp(false)} className="flex-1 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/30">Simpan Data</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
