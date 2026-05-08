import React, { useState } from 'react';
import { Users, Clock, DollarSign, Calendar, Plus, Edit2, Check, X, FileText, Send, AlertTriangle, Zap, ChevronRight } from 'lucide-react';

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

const EMPLOYEES: Employee[] = [
  { id: '1', name: 'Ahmad Kasir', position: 'Kasir', baseSalary: 2500000, bankAccount: 'BCA 1234567890', bpjs: 'BPJS-001', isActive: true, shift: 'Pagi' },
  { id: '2', name: 'Budi Pelayan', position: 'Pelayan', baseSalary: 2200000, bankAccount: 'Mandiri 0987654321', bpjs: 'BPJS-002', isActive: true, shift: 'Siang' },
  { id: '3', name: 'Citra Koki', position: 'Koki', baseSalary: 3000000, bankAccount: 'BNI 1122334455', bpjs: 'BPJS-003', isActive: true, shift: 'Pagi' },
];

const ATTENDANCES: Attendance[] = [
  { id: 'a1', employeeId: '1', date: '2026-05-07', checkIn: '07:55', checkOut: '15:05', status: 'HADIR' },
  { id: 'a2', employeeId: '2', date: '2026-05-07', checkIn: '12:00', checkOut: '20:10', status: 'HADIR' },
  { id: 'a3', employeeId: '3', date: '2026-05-07', checkIn: '', checkOut: '', status: 'SAKIT' },
];

const LEAVE_REQUESTS: LeaveRequest[] = [
  { id: 'l1', employeeId: '3', type: 'SAKIT', date: '2026-05-07', reason: 'Demam tinggi', status: 'PENDING' },
  { id: 'l2', employeeId: '1', type: 'CUTI', date: '2026-05-10', reason: 'Keperluan keluarga', status: 'APPROVED' },
];

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

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'KARYAWAN', label: 'Data Karyawan', icon: <Users className="w-4 h-4" /> },
    { key: 'ABSENSI', label: 'Absensi', icon: <Clock className="w-4 h-4" /> },
    { key: 'IZIN', label: 'Izin & Cuti', icon: <Calendar className="w-4 h-4" /> },
    { key: 'PAYROLL', label: 'Payroll', icon: <DollarSign className="w-4 h-4" /> },
    { key: 'SHIFT', label: 'Shift', icon: <Calendar className="w-4 h-4" /> },
  ];

  const statusColor: Record<string, string> = {
    HADIR: 'bg-emerald-100 text-emerald-700',
    IZIN: 'bg-amber-100 text-amber-700',
    SAKIT: 'bg-orange-100 text-orange-700',
    CUTI: 'bg-blue-100 text-blue-700',
    ALPHA: 'bg-rose-100 text-rose-700',
    PENDING: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-rose-100 text-rose-700',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">HRD & Payroll</h1>
          <p className="text-slate-500 font-medium mt-1">Manajemen karyawan sesuai UU Cipta Kerja No. 6/2023</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200">
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="text-sm font-black text-amber-600">18 Koin/bulan</span>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Karyawan', value: EMPLOYEES.length, color: 'bg-primary/10 text-primary' },
          { label: 'Hadir Hari Ini', value: ATTENDANCES.filter(a => a.status === 'HADIR').length, color: 'bg-emerald-100 text-emerald-600' },
          { label: 'Izin/Sakit', value: ATTENDANCES.filter(a => ['IZIN','SAKIT','CUTI'].includes(a.status)).length, color: 'bg-amber-100 text-amber-600' },
          { label: 'Total Gaji/Bln', value: `Rp ${(EMPLOYEES.reduce((a, e) => a + e.baseSalary, 0) / 1000000).toFixed(1)}M`, color: 'bg-rose-100 text-rose-600' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl p-5 shadow-lg">
            <div className={`inline-flex px-3 py-1 rounded-xl text-[10px] font-black uppercase mb-2 ${k.color}`}>{k.label}</div>
            <p className="text-2xl font-black text-slate-900">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm uppercase whitespace-nowrap transition-all ${tab === t.key ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-400 hover:bg-slate-100'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── KARYAWAN ─────────────────── */}
      {tab === 'KARYAWAN' && (
        <div className="space-y-4">
          <button onClick={() => setShowAddEmp(true)}
            className="btn-primary px-6 py-3 text-sm flex items-center gap-2">
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
            <div className="p-5 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-black text-slate-800 uppercase tracking-tight">Absensi Hari Ini — {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3>
              <button className="btn-primary px-4 py-2 text-xs">Export Laporan</button>
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
                <p className="text-sm text-slate-400 font-medium">Proses gaji bulan ini · 18 Koin</p>
              </div>
              <button className="btn-primary px-6 py-3 text-sm flex items-center gap-2">
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
                      <button className="flex items-center gap-1 text-[10px] font-black text-primary hover:underline uppercase">
                        <FileText className="w-3 h-3" /> Slip Gaji
                      </button>
                      <button className="flex items-center gap-1 text-[10px] font-black text-[#25D366] hover:underline uppercase">
                        <Send className="w-3 h-3" /> Kirim via WA
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
    </div>
  );
}
