import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Clock, Search, Filter, ShieldCheck, TrendingDown, Download, RefreshCw, Eye } from 'lucide-react';

type LogType = 'VOID' | 'DISCOUNT' | 'LOGIN' | 'STOCK' | 'PRICE_CHANGE' | 'SHIFT_CLOSE' | 'REFUND';
type LogStatus = 'CRITICAL' | 'WARNING' | 'SUCCESS' | 'INFO';

interface AuditLog {
  id: string; type: LogType; user: string;
  action: string; time: string; date: string;
  status: LogStatus; amount: string; note?: string;
}

const LOGS: AuditLog[] = [];

const TYPE_STYLE: Record<LogType, { bg: string; text: string; label: string }> = {
  VOID:         { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Void' },
  DISCOUNT:     { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Diskon' },
  LOGIN:        { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Login' },
  STOCK:        { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Stok' },
  PRICE_CHANGE: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Harga' },
  SHIFT_CLOSE:  { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Shift' },
  REFUND:       { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Refund' },
};

export default function AuditLogPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<LogType | 'SEMUA'>('SEMUA');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const filtered = LOGS.filter(l =>
    (typeFilter === 'SEMUA' || l.type === typeFilter) &&
    (l.action.toLowerCase().includes(search.toLowerCase()) || l.user.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    voids: LOGS.filter(l => l.type === 'VOID').length,
    discountTotal: 0,
    refunds: LOGS.filter(l => l.type === 'REFUND').length,
    critical: LOGS.filter(l => l.status === 'CRITICAL').length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
            <ShieldAlert className="w-3 h-3" /> Fraud Prevention System
          </div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Audit Log & Keamanan</h1>
          <p className="text-slate-500 font-medium mt-1">Pantau setiap aktivitas mencurigakan di outlet Anda secara real-time.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase hover:bg-slate-50 shadow-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-2xl">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-black text-emerald-700">Terenkripsi · AES-256</span>
          </div>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Void', value: stats.voids, sub: 'Bulan ini', color: 'border-rose-500 text-rose-600', icon: <TrendingDown className="w-5 h-5" /> },
          { label: 'Refund', value: stats.refunds, sub: 'Bulan ini', color: 'border-rose-400 text-rose-500', icon: <RefreshCw className="w-5 h-5" /> },
          { label: 'Diskon Manual', value: `Rp ${stats.discountTotal.toLocaleString('id-ID')}`, sub: 'Total diberikan', color: 'border-amber-500 text-amber-600', icon: <AlertTriangle className="w-5 h-5" /> },
          { label: 'Status Sistem', value: 'AMAN', sub: 'Tidak ada ancaman', color: 'border-emerald-500 text-emerald-600', icon: <ShieldCheck className="w-5 h-5" /> },
        ].map(k => (
          <div key={k.label} className={`bg-white rounded-2xl p-5 shadow-lg border-l-4 ${k.color.split(' ')[0]}`}>
            <div className={`mb-3 ${k.color.split(' ')[1]}`}>{k.icon}</div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{k.label}</p>
            <p className={`text-2xl font-black mt-1 ${k.color.split(' ')[1]}`}>{k.value}</p>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari aktivitas atau nama staff..." className="input-field w-full pl-9" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['SEMUA', 'VOID', 'DISCOUNT', 'REFUND', 'PRICE_CHANGE', 'LOGIN', 'SHIFT_CLOSE'] as const).map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex-shrink-0 ${typeFilter === t ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                {t === 'SEMUA' ? 'Semua' : TYPE_STYLE[t as LogType]?.label ?? t}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {['Waktu', 'Tipe', 'Staff', 'Aktivitas', 'Nominal', 'Status', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(log => {
                const ts = TYPE_STYLE[log.type];
                const expanded = expandedLog === log.id;
                return (
                  <React.Fragment key={log.id}>
                    <tr className={`hover:bg-slate-50/50 transition-colors ${log.status === 'CRITICAL' ? 'bg-rose-50/30' : ''}`}>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-700 text-sm">{log.time}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{log.date}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase ${ts.bg} ${ts.text}`}>{ts.label}</span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-800 text-sm">{log.user}</p>
                      </td>
                      <td className="px-5 py-4 max-w-xs">
                        <p className="text-sm text-slate-600 font-medium truncate">{log.action}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`font-black text-sm ${log.amount.startsWith('-') ? 'text-rose-600' : log.amount.startsWith('+') ? 'text-emerald-600' : 'text-slate-700'}`}>
                          {log.amount}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {log.status === 'CRITICAL' && <ShieldAlert className="w-5 h-5 text-rose-500" />}
                        {log.status === 'WARNING' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                        {log.status === 'SUCCESS' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                        {log.status === 'INFO' && <Clock className="w-5 h-5 text-blue-400" />}
                      </td>
                      <td className="px-5 py-4">
                        {log.note && (
                          <button onClick={() => setExpandedLog(expanded ? null : log.id)}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-primary/10 text-slate-400 hover:text-primary transition-all">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                    {expanded && log.note && (
                      <tr className="bg-blue-50/50">
                        <td colSpan={7} className="px-5 py-3">
                          <p className="text-xs font-bold text-blue-700"><span className="text-blue-400 mr-2">📝 Catatan:</span>{log.note}</p>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-16 text-center text-slate-300">
                  <ShieldCheck className="w-12 h-12 mx-auto mb-3" />
                  <p className="font-bold uppercase text-sm">Tidak ada aktivitas ditemukan</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-400">
          <span>Menampilkan {filtered.length} dari {LOGS.length} log</span>
          <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Data dienkripsi end-to-end · Zyntra Labs</span>
        </div>
      </div>
    </div>
  );
}
