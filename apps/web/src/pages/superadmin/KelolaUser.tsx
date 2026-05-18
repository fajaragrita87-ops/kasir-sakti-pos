import React, { useState, useEffect } from 'react';
import { Search, Users, Building2, KeyRound, Ban, CheckCircle, Coins, Plus, X, RefreshCw, Loader2 } from 'lucide-react';
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
  enabled_features: string[];
}

const ROLE_COLORS: Record<string, string> = {
  MERCHANT: 'bg-blue-50 text-blue-700',
  STAFF: 'bg-slate-100 text-slate-600',
  SUPERADMIN: 'bg-[#0f172a] text-white',
};

export default function KelolaUser() {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('Semua');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Coin injection modal
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [coinAmount, setCoinAmount] = useState('');
  const [coinNote, setCoinNote] = useState('');
  const [injecting, setInjecting] = useState(false);
  const [toast, setToast] = useState('');

  // Fetch users from Supabase
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data pengguna');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Inject coins to user
  const handleInjectCoins = async () => {
    if (!selectedUser || !coinAmount || Number(coinAmount) <= 0) return;
    setInjecting(true);
    try {
      const newCoins = (selectedUser.coins || 0) + Number(coinAmount);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ coins: newCoins })
        .eq('id', selectedUser.id);

      if (updateError) throw updateError;

      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === selectedUser.id ? { ...u, coins: newCoins } : u
      ));

      setToast(`✅ Berhasil menambahkan ${Number(coinAmount).toLocaleString()} koin ke ${selectedUser.full_name || selectedUser.email}`);
      setShowCoinModal(false);
      setCoinAmount('');
      setCoinNote('');
      setSelectedUser(null);
      setTimeout(() => setToast(''), 4000);
    } catch (err: any) {
      setToast(`❌ Gagal: ${err.message}`);
      setTimeout(() => setToast(''), 4000);
    } finally {
      setInjecting(false);
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.outlet_id || '').toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'Semua' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Super Admin</p>
            <h1 className="text-2xl font-light text-slate-900">Kelola User</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchUsers} className="p-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors" title="Refresh">
              <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm font-black px-4 py-2 rounded-xl">
              <Users className="w-4 h-4 inline mr-2" />
              Total: {users.length} Pengguna
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Toast */}
        {toast && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300 ${toast.startsWith('✅') ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-50 border border-rose-200'}`}>
            <p className={`font-bold text-sm ${toast.startsWith('✅') ? 'text-emerald-800' : 'text-rose-800'}`}>{toast}</p>
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama, email, atau outlet ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1e6fbf]"
            />
          </div>
          <div className="flex gap-2">
            {['Semua', 'MERCHANT', 'STAFF'].map(r => (
              <button key={r} onClick={() => setFilterRole(r)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                  filterRole === r
                    ? 'bg-[#1e6fbf] text-white border-[#1e6fbf]'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
            <p className="text-rose-700 font-bold">{error}</p>
            <button onClick={fetchUsers} className="mt-3 text-sm text-rose-600 underline font-bold">Coba Lagi</button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-3" />
            <p className="text-slate-500 font-bold">Memuat data pengguna dari Supabase...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && users.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-bold">Belum ada user terdaftar</p>
            <p className="text-sm text-slate-400 mt-1">User akan muncul di sini setelah mereka mendaftar.</p>
          </div>
        )}

        {/* Table */}
        {!loading && filtered.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-3">Nama</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Sisa Koin</th>
                    <th className="px-6 py-3">Tgl Daftar</th>
                    <th className="px-6 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#1e6fbf]/10 rounded-full flex items-center justify-center text-[#1e6fbf] text-xs font-black flex-shrink-0">
                            {(u.full_name || '?').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-900 text-sm">{u.full_name || '(Tanpa Nama)'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-slate-500 text-sm">{u.email || u.id.slice(0,8)}</td>
                      <td className="px-6 py-3.5">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${ROLE_COLORS[u.role] || ROLE_COLORS.MERCHANT}`}>
                          {u.role || 'MERCHANT'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Coins className={`w-3.5 h-3.5 ${(u.coins || 0) > 100 ? 'text-amber-500' : 'text-slate-400'}`} />
                          <span className={`font-mono text-sm font-bold ${(u.coins || 0) === 0 ? 'text-rose-500' : 'text-slate-700'}`}>
                            {(u.coins || 0).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-slate-500 text-sm font-mono">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID') : '—'}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <button
                            onClick={() => { setSelectedUser(u); setShowCoinModal(true); }}
                            title="Tambah Koin"
                            className="p-2 hover:bg-amber-50 rounded-lg text-amber-600 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
              <div>
                <h3 className="text-xl font-black text-slate-900">⚡ Tambah Koin</h3>
                <p className="text-sm text-slate-500 font-medium">Injek koin manual ke akun user</p>
              </div>
              <button onClick={() => setShowCoinModal(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* User Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1e6fbf]/10 rounded-full flex items-center justify-center text-[#1e6fbf] text-sm font-black">
                  {(selectedUser.full_name || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-black text-slate-800">{selectedUser.full_name || '(Tanpa Nama)'}</p>
                  <p className="text-xs text-slate-500">{selectedUser.email || selectedUser.id.slice(0,12)}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Saldo Saat Ini</p>
                  <p className="font-black text-amber-600 text-lg">{(selectedUser.coins || 0).toLocaleString()}</p>
                </div>
              </div>

              {/* Quick Amounts */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pilih Jumlah Cepat</label>
                <div className="grid grid-cols-4 gap-2">
                  {[50, 100, 500, 1000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setCoinAmount(String(amt))}
                      className={`py-2 rounded-xl text-xs font-black border-2 transition-all ${
                        coinAmount === String(amt)
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Atau Masukkan Jumlah</label>
                <div className="relative">
                  <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
                  <input
                    type="number"
                    value={coinAmount}
                    onChange={e => setCoinAmount(e.target.value)}
                    placeholder="0"
                    min="1"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-2xl font-black text-slate-900"
                  />
                </div>
                {coinAmount && Number(coinAmount) > 0 && (
                  <p className="mt-1 text-sm text-amber-600 font-bold">
                    Saldo baru: {((selectedUser.coins || 0) + Number(coinAmount)).toLocaleString()} Koin
                  </p>
                )}
              </div>

              {/* Note */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Catatan (Opsional)</label>
                <input
                  type="text"
                  value={coinNote}
                  onChange={e => setCoinNote(e.target.value)}
                  placeholder="Cth: Top-up via transfer bank, bonus promo, dll"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm"
                />
              </div>

              <button
                onClick={handleInjectCoins}
                disabled={injecting || !coinAmount || Number(coinAmount) <= 0}
                className="w-full py-4 bg-amber-500 text-white font-black rounded-2xl hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                {injecting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</>
                ) : (
                  <><Coins className="w-5 h-5" /> Tambahkan {coinAmount ? `${Number(coinAmount).toLocaleString()} Koin` : 'Koin'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
