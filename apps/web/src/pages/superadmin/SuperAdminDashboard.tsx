import React, { useState, useEffect } from 'react';
import {
  Building2, TrendingUp, Users, Coins, ArrowUpRight,
  RefreshCw, ChevronRight, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface UserProfile {
  id: string;
  full_name: string;
  email?: string;
  role: string;
  outlet_id: string;
  coins: number;
  business_type: string;
  created_at: string;
}

const fmtRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

const StatusBadge = ({ coins }: { coins: number }) => {
  const status = coins > 100 ? 'Aktif' : coins > 0 ? 'Kritis' : 'Habis';
  const cfg: Record<string, string> = {
    Aktif: 'bg-blue-50 text-blue-700 border-blue-200',
    Kritis: 'bg-amber-50 text-amber-700 border-amber-200',
    Habis: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${cfg[status]}`}>
      {status}
    </span>
  );
};

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      setUsers(data || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const totalUsers = users.length;
  const totalCoins = users.reduce((s, u) => s + (u.coins || 0), 0);
  const activeUsers = users.filter(u => (u.coins || 0) > 0).length;
  const coinHabis = users.filter(u => (u.coins || 0) === 0).length;
  const recentUsers = users.slice(0, 8);

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kasir Sakti Super Admin</p>
            <h1 className="text-2xl font-light text-slate-900 tracking-tight">Overview Platform</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Supabase Terhubung
            </div>
            <button onClick={fetchData} className="p-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors" title="Refresh">
              <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
        )}

        {/* KPI Cards */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Toko Terdaftar</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{totalUsers}</p>
              <div className="flex gap-3 mt-2 text-[10px] font-bold">
                <span className="text-blue-600">Aktif: {activeUsers}</span>
                <span className="text-amber-500">Koin Habis: {coinHabis}</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Koin Beredar</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{totalCoins.toLocaleString()}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Seluruh koin di semua akun</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-50">
                  <Users className="w-5 h-5 text-violet-600" />
                </div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">User Aktif (Punya Koin)</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{activeUsers}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full" style={{ width: `${totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}%` }} />
                </div>
                <span className="text-[10px] font-black text-violet-600">{totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}%</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50">
                  <Coins className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rata-rata Koin / User</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {totalUsers > 0 ? Math.round(totalCoins / totalUsers).toLocaleString() : '0'}
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Distribusi koin per akun</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/superadmin/kelola-user" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-black text-slate-800 text-sm">Kelola User & Injek Koin</p>
                  <p className="text-xs text-slate-500">Lihat daftar user, tambah koin manual</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
              </div>
            </Link>
            <Link to="/superadmin/billing" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-amber-300 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <Coins className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-black text-slate-800 text-sm">Pengaturan Billing & Paket</p>
                  <p className="text-xs text-slate-500">Atur harga modul & paket koin</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
              </div>
            </Link>
            <Link to="/superadmin/pengaturan" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                  <Building2 className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-black text-slate-800 text-sm">Pengaturan Sistem</p>
                  <p className="text-xs text-slate-500">Konfigurasi platform global</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
              </div>
            </Link>
          </div>
        )}

        {/* Recent Users Table */}
        {!loading && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">User Terdaftar Terbaru</h2>
              <Link to="/superadmin/kelola-user"
                className="text-[10px] font-black text-[#1e6fbf] uppercase tracking-widest hover:underline flex items-center gap-1">
                Lihat Semua <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {recentUsers.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="font-bold text-slate-400">Belum ada user terdaftar</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-6 py-3">Nama</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Sisa Koin</th>
                      <th className="px-6 py-3">Tgl Daftar</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentUsers.map((u, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-3.5 font-bold text-slate-900 text-sm">{u.full_name || '(Tanpa Nama)'}</td>
                        <td className="px-6 py-3.5 text-slate-500 text-sm">{u.email || u.id.slice(0,8)}</td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-1">
                            <Coins className={`w-3.5 h-3.5 ${(u.coins || 0) > 100 ? 'text-amber-500' : 'text-slate-400'}`} />
                            <span className={`font-mono text-sm font-bold ${(u.coins || 0) === 0 ? 'text-rose-500' : 'text-slate-700'}`}>
                              {(u.coins || 0).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-slate-500 text-sm font-mono">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID') : '—'}
                        </td>
                        <td className="px-6 py-3.5"><StatusBadge coins={u.coins || 0} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
