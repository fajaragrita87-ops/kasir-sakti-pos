import React, { useState, useEffect } from 'react';
import {
  Search, Building2, Coins, MoreVertical, Plus, X, Loader2, RefreshCw, Ban
} from 'lucide-react';
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

const STATUS_COLORS: Record<string, string> = {
  Aktif: 'bg-blue-50 text-blue-700 border-blue-200',
  Kritis: 'bg-amber-50 text-amber-700 border-amber-200',
  Habis: 'bg-slate-100 text-slate-600 border-slate-200',
};

const getStatus = (coins: number) => coins > 100 ? 'Aktif' : coins > 0 ? 'Kritis' : 'Habis';

type FilterType = 'Semua' | 'Aktif' | 'Kritis' | 'Habis';

export default function KelolaSSPG() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('Semua');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // Coin injection
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [coinAmount, setCoinAmount] = useState('');
  const [injecting, setInjecting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setUsers(data || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleInjectCoins = async () => {
    if (!selectedUser || !coinAmount || Number(coinAmount) <= 0) return;
    setInjecting(true);
    try {
      const newCoins = (selectedUser.coins || 0) + Number(coinAmount);
      await supabase.from('profiles').update({ coins: newCoins }).eq('id', selectedUser.id);
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, coins: newCoins } : u));
      setToast(`✅ +${Number(coinAmount).toLocaleString()} koin ke ${selectedUser.full_name || 'user'}`);
      setShowCoinModal(false); setCoinAmount(''); setSelectedUser(null);
      setTimeout(() => setToast(''), 3000);
    } catch (err: any) {
      setToast(`❌ ${err.message}`); setTimeout(() => setToast(''), 3000);
    }
    setInjecting(false);
  };

  const FILTERS: FilterType[] = ['Semua', 'Aktif', 'Kritis', 'Habis'];

  const filtered = users.filter(u => {
    const matchSearch = (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase());
    const status = getStatus(u.coins || 0);
    const matchFilter = filter === 'Semua' || status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Super Admin</p>
            <h1 className="text-2xl font-light text-slate-900">Kelola Toko</h1>
          </div>
          <button onClick={fetchData} className="p-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors" title="Refresh">
            <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {toast && (
          <div className={`p-4 rounded-2xl font-bold text-sm ${toast.startsWith('✅') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
            {toast}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama toko atau email..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1e6fbf]" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase border transition-all ${
                  filter === f ? 'bg-[#1e6fbf] text-white border-[#1e6fbf]' : 'bg-white text-slate-600 border-slate-200'
                }`}>{f}</button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-3" />
            <p className="text-slate-500 font-bold">Memuat data toko dari Supabase...</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-bold">Belum ada toko terdaftar</p>
            <p className="text-sm text-slate-400 mt-1">Toko akan muncul setelah merchant mendaftar.</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-5 py-3">#</th>
                    <th className="px-5 py-3">Nama / Email</th>
                    <th className="px-5 py-3">Tipe Bisnis</th>
                    <th className="px-5 py-3 text-right">Sisa Koin</th>
                    <th className="px-5 py-3 text-center">Status</th>
                    <th className="px-5 py-3">Tgl Daftar</th>
                    <th className="px-5 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((u, idx) => {
                    const status = getStatus(u.coins || 0);
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5 text-slate-400 text-xs font-mono">{idx + 1}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-4 h-4 text-[#1e6fbf]" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{u.full_name || '(Tanpa Nama)'}</p>
                              <p className="text-xs text-slate-400">{u.email || u.id.slice(0,12)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 text-sm">{u.business_type || 'FNB'}</td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className={`font-mono font-bold ${(u.coins || 0) === 0 ? 'text-rose-500' : (u.coins || 0) < 100 ? 'text-amber-500' : 'text-slate-800'}`}>
                              {(u.coins || 0).toLocaleString('id-ID')}
                            </span>
                            <Coins className={`w-3 h-3 ${(u.coins || 0) > 0 ? 'text-amber-500' : 'text-slate-300'}`} />
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${STATUS_COLORS[status]}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 text-sm font-mono">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID') : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <button onClick={() => { setSelectedUser(u); setShowCoinModal(true); }}
                            className="p-2 hover:bg-amber-50 rounded-lg text-amber-600 transition-colors" title="Tambah Koin">
                            <Plus className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL INJECT KOIN */}
      {showCoinModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCoinModal(false)} />
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md z-10">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-900">⚡ Tambah Koin</h3>
              <button onClick={() => setShowCoinModal(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1e6fbf]/10 rounded-full flex items-center justify-center text-[#1e6fbf] text-sm font-black">
                  {(selectedUser.full_name || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-black text-slate-800">{selectedUser.full_name || '(Tanpa Nama)'}</p>
                  <p className="text-xs text-slate-500">{selectedUser.email}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Saldo</p>
                  <p className="font-black text-amber-600 text-lg">{(selectedUser.coins || 0).toLocaleString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[50, 100, 500, 1000].map(amt => (
                  <button key={amt} onClick={() => setCoinAmount(String(amt))}
                    className={`py-2 rounded-xl text-xs font-black border-2 transition-all ${coinAmount === String(amt) ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-600'}`}>
                    +{amt}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
                <input type="number" value={coinAmount} onChange={e => setCoinAmount(e.target.value)}
                  placeholder="0" min="1"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-2xl font-black text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none" />
              </div>
              <button onClick={handleInjectCoins} disabled={injecting || !coinAmount || Number(coinAmount) <= 0}
                className="w-full py-4 bg-amber-500 text-white font-black rounded-2xl hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2 text-lg">
                {injecting ? <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</> : <><Coins className="w-5 h-5" /> Tambahkan Koin</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
