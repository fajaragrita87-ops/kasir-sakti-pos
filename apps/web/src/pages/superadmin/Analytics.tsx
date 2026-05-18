import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Building2, Coins, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface UserProfile {
  id: string;
  full_name: string;
  email?: string;
  coins: number;
  business_type: string;
  created_at: string;
}

export default function Analytics() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setUsers(data || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const totalUsers = users.length;
  const totalCoins = users.reduce((s, u) => s + (u.coins || 0), 0);
  const activeUsers = users.filter(u => (u.coins || 0) > 0).length;
  const coinHabis = users.filter(u => (u.coins || 0) === 0).length;

  // Group by business type
  const bizTypes: Record<string, number> = {};
  users.forEach(u => {
    const t = u.business_type || 'FNB';
    bizTypes[t] = (bizTypes[t] || 0) + 1;
  });

  // Group by month
  const monthlyReg: Record<string, number> = {};
  users.forEach(u => {
    if (u.created_at) {
      const d = new Date(u.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyReg[key] = (monthlyReg[key] || 0) + 1;
    }
  });
  const sortedMonths = Object.entries(monthlyReg).sort(([a], [b]) => a.localeCompare(b));

  // Top users by coins
  const topUsers = [...users].sort((a, b) => (b.coins || 0) - (a.coins || 0)).slice(0, 5);

  const COLORS = ['#1e6fbf', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#e0f2fe'];

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Super Admin</p>
            <h1 className="text-2xl font-light text-slate-900">Analytics & Wawasan</h1>
          </div>
          <button onClick={fetchData} className="p-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
            <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
        )}

        {!loading && (
          <>
            {/* Growth KPI */}
            <div>
              <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-4">Metrik Platform</h2>
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <Building2 className="w-5 h-5 text-[#1e6fbf]" />
                  </div>
                  <p className="text-3xl font-black text-slate-900">{totalUsers}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Toko Terdaftar</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-3xl font-black text-slate-900">{activeUsers}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">User Aktif (Punya Koin)</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <Coins className="w-5 h-5 text-amber-600" />
                  </div>
                  <p className="text-3xl font-black text-slate-900">{totalCoins.toLocaleString()}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Koin Beredar</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <TrendingUp className="w-5 h-5 text-violet-600" />
                  </div>
                  <p className="text-3xl font-black text-slate-900">{coinHabis}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Koin Habis (Perlu Top-Up)</p>
                </div>
              </div>
            </div>

            {/* Registration by Month */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-6">Registrasi per Bulan</h2>
                {sortedMonths.length === 0 ? (
                  <p className="text-slate-400 text-sm">Belum ada data registrasi.</p>
                ) : (
                  <div className="space-y-3">
                    {sortedMonths.map(([month, count]) => {
                      const maxCount = Math.max(...sortedMonths.map(([, c]) => c));
                      const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                      return (
                        <div key={month} className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-slate-500 w-16">{month}</span>
                          <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden">
                            <div className="h-full bg-[#1e6fbf] rounded-lg transition-all flex items-center justify-end pr-2"
                              style={{ width: `${Math.max(pct, 10)}%` }}>
                              <span className="text-[10px] font-black text-white">{count}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Business Type Distribution */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-6">Distribusi Tipe Bisnis</h2>
                {Object.keys(bizTypes).length === 0 ? (
                  <p className="text-slate-400 text-sm">Belum ada data.</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(bizTypes).sort(([, a], [, b]) => b - a).map(([type, count], i) => (
                      <div key={type} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-sm font-bold text-slate-700">{type}</span>
                        </div>
                        <span className="font-black text-slate-900">{count} toko</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Top Users by Coins */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">Toko dengan Koin Terbanyak</h2>
              </div>
              {topUsers.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="font-bold text-slate-400">Belum ada data.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-6 py-3">Peringkat</th>
                        <th className="px-6 py-3">Nama</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3 text-right">Sisa Koin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {topUsers.map((u, i) => (
                        <tr key={u.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-3.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                              i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-100 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-500'
                            }`}>{i + 1}</div>
                          </td>
                          <td className="px-6 py-3.5 font-bold text-slate-900 text-sm">{u.full_name || '(Tanpa Nama)'}</td>
                          <td className="px-6 py-3.5 text-slate-500 text-sm">{u.email || u.id.slice(0,8)}</td>
                          <td className="px-6 py-3.5 text-right font-black text-[#1e6fbf]">{(u.coins || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
