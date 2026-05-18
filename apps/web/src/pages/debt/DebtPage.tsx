import React from 'react';
import { BookOpen, Calendar, UserPlus, Search, AlertCircle, CheckCircle2, ChevronRight, Filter } from 'lucide-react';

export default function DebtPage() {
  const debts: any[] = [];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-4">
            <BookOpen className="text-primary w-10 h-10" /> Buku Piutang
          </h1>
          <p className="text-slate-500 font-medium mt-2">Catat hutang pelanggan dan pantau jatuh temponya.</p>
        </div>
        <button className="btn-primary px-8 py-3.5 flex items-center gap-2 shadow-2xl shadow-primary/20">
          <UserPlus className="w-5 h-5" /> Catat Hutang Baru
        </button>
      </header>

      {/* Debt Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="md:col-span-2 card border border-slate-200 shadow-sm bg-white p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 rounded-full blur-[80px] -z-0"></div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Total Piutang Berjalan</p>
            <h3 className="text-4xl font-black text-slate-900 mb-6">Rp 0</h3>
            <div className="flex gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Overdue</p>
                <p className="text-lg font-black text-rose-500">Rp 0</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Due Soon</p>
                <p className="text-lg font-black text-amber-500">Rp 0</p>
              </div>
            </div>
          </div>
        </div>
        <div className="card border border-slate-200 shadow-sm p-8 bg-white flex flex-col justify-center text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tertagih Bulan Ini</p>
          <h3 className="text-3xl font-black text-emerald-500 tracking-tight">Rp 0</h3>
          <p className="text-[10px] text-slate-400 font-bold mt-2">+15.2% VS BULAN LALU</p>
        </div>
        <div className="card border-0 shadow-xl p-8 bg-white flex flex-col justify-center text-center border-l-8 border-primary">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Koin Layanan</p>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">18 <span className="text-sm">KOIN</span></h3>
          <p className="text-[10px] text-slate-400 font-bold mt-2">PER OUTLET / BULAN</p>
        </div>
      </div>

      <div className="card border-0 shadow-xl bg-white overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input type="text" placeholder="Cari nama pelanggan..." className="input-field w-full pl-10" />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none p-3 border border-slate-100 rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2 text-sm font-bold text-slate-500">
              <Filter className="w-4 h-4" /> Semua Status
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="px-8 py-5">Pelanggan</th>
                <th className="px-8 py-5">Jatuh Tempo</th>
                <th className="px-8 py-5">Nominal Hutang</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {debts.map(debt => (
                <tr key={debt.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 uppercase">
                        {debt.customer.charAt(0)}
                      </div>
                      <p className="font-bold text-slate-800">{debt.customer}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                      <Calendar className="w-4 h-4" /> {debt.date}
                    </div>
                  </td>
                  <td className="px-8 py-6 font-black text-slate-900">
                    Rp {debt.total.toLocaleString('id-ID')}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`badge ${debt.status === 'OVERDUE' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                      {debt.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="bg-slate-50 hover:bg-primary hover:text-white p-3 rounded-xl transition-all group-hover:shadow-lg">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
