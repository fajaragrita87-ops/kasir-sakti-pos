import React, { useState } from 'react';
import {
  Users, Plus, Edit2, Trash2, ShieldCheck, ShieldAlert,
  UserCheck, Search, Key, Eye, EyeOff, X, Check,
  Crown, Coffee, Package, BarChart3, Settings
} from 'lucide-react';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: 'SUPERADMIN' | 'MERCHANT' | 'STAFF' | 'KASIR';
  status: 'AKTIF' | 'NONAKTIF';
  shift?: string;
  lastLogin?: string;
  permissions: string[];
}

const ALL_PERMISSIONS = [
  { key: 'pos', label: 'Kasir (POS)', icon: <Coffee className="w-4 h-4" /> },
  { key: 'inventory', label: 'Inventori', icon: <Package className="w-4 h-4" /> },
  { key: 'reports', label: 'Laporan', icon: <BarChart3 className="w-4 h-4" /> },
  { key: 'hrd', label: 'Manajemen SDM', icon: <Users className="w-4 h-4" /> },
  { key: 'billing', label: 'Billing & Koin', icon: <ShieldCheck className="w-4 h-4" /> },
  { key: 'settings', label: 'Pengaturan', icon: <Settings className="w-4 h-4" /> },
  { key: 'audit', label: 'Audit Log', icon: <ShieldAlert className="w-4 h-4" /> },
  { key: 'void', label: 'Izin Void Pesanan', icon: <X className="w-4 h-4" /> },
  { key: 'discount', label: 'Izin Diskon Manual', icon: <Check className="w-4 h-4" /> },
];

const ROLE_PRESETS: Record<string, string[]> = {
  SUPERADMIN: ['pos', 'inventory', 'reports', 'hrd', 'billing', 'settings', 'audit', 'void', 'discount'],
  MERCHANT: ['pos', 'inventory', 'reports', 'hrd', 'billing', 'void', 'discount'],
  KASIR: ['pos'],
  STAFF: ['pos', 'inventory'],
};

const ROLE_BADGE: Record<string, string> = {
  SUPERADMIN: 'bg-purple-100 text-purple-700',
  MERCHANT: 'bg-primary/10 text-primary',
  KASIR: 'bg-amber-100 text-amber-700',
  STAFF: 'bg-slate-100 text-slate-600',
};

const ROLE_ICON: Record<string, React.ReactNode> = {
  SUPERADMIN: <Crown className="w-4 h-4 text-purple-500" />,
  MERCHANT: <ShieldCheck className="w-4 h-4 text-primary" />,
  KASIR: <Coffee className="w-4 h-4 text-amber-500" />,
  STAFF: <UserCheck className="w-4 h-4 text-slate-500" />,
};

const SAMPLE_USERS: StaffUser[] = [
  {
    id: '1', name: 'Superadmin Sakti', email: 'admin@saktipos.id', role: 'SUPERADMIN',
    status: 'AKTIF', lastLogin: '2 menit lalu',
    permissions: ROLE_PRESETS.SUPERADMIN
  },
  {
    id: '2', name: 'Andi Pratama', email: 'andi@warungsakti.id', role: 'KASIR',
    status: 'AKTIF', shift: 'Pagi (06:00-14:00)', lastLogin: '1 jam lalu',
    permissions: ROLE_PRESETS.KASIR
  },
  {
    id: '3', name: 'Siti Aminah', email: 'siti@warungsakti.id', role: 'KASIR',
    status: 'NONAKTIF', shift: 'Sore (14:00-22:00)', lastLogin: '2 hari lalu',
    permissions: ROLE_PRESETS.KASIR
  },
];

export default function UserAdminPage() {
  const [users, setUsers] = useState<StaffUser[]>(SAMPLE_USERS);
  const [showModal, setShowModal] = useState(false);
  const [showPermModal, setShowPermModal] = useState<StaffUser | null>(null);
  const [search, setSearch] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'KASIR' as StaffUser['role'], shift: 'Pagi (06:00-14:00)' });

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    const u: StaffUser = {
      id: String(Date.now()), name: newUser.name, email: newUser.email,
      role: newUser.role, status: 'AKTIF', shift: newUser.shift,
      lastLogin: 'Belum pernah', permissions: ROLE_PRESETS[newUser.role]
    };
    setUsers(prev => [...prev, u]);
    setShowModal(false);
    setNewUser({ name: '', email: '', password: '', role: 'KASIR', shift: 'Pagi (06:00-14:00)' });
  };

  const handleToggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'AKTIF' ? 'NONAKTIF' : 'AKTIF' } : u));
  };

  const handleDelete = (id: string) => {
    if (id === '1') return; // protect superadmin
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">User & Administrator</h1>
          <p className="text-slate-500 font-medium mt-1">Kelola akses staff dan izin fitur per pengguna.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary px-8 py-3 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Tambah User
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
        {[
          { label: 'Total User', value: users.length, color: 'bg-primary/10 text-primary' },
          { label: 'User Aktif', value: users.filter(u => u.status === 'AKTIF').length, color: 'bg-emerald-100 text-emerald-600' },
          { label: 'Kasir', value: users.filter(u => u.role === 'KASIR').length, color: 'bg-amber-100 text-amber-600' },
          { label: 'Nonaktif', value: users.filter(u => u.status === 'NONAKTIF').length, color: 'bg-slate-100 text-slate-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-lg border-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-3xl font-black ${s.color.split(' ')[1]}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Cari nama atau email user..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field w-full pl-12 h-14 text-sm"
        />
      </div>

      {/* User Table */}
      <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border-0">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-8 py-5">Pengguna</th>
              <th className="px-8 py-5">Role</th>
              <th className="px-8 py-5">Shift</th>
              <th className="px-8 py-5">Login Terakhir</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${u.role === 'SUPERADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 flex items-center gap-2">
                        {u.name}
                        {u.id === '1' && <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />}
                      </p>
                      <p className="text-xs text-slate-400 font-bold">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase ${ROLE_BADGE[u.role]}`}>
                    {ROLE_ICON[u.role]} {u.role}
                  </span>
                </td>
                <td className="px-8 py-5 text-sm font-bold text-slate-500">{u.shift ?? '—'}</td>
                <td className="px-8 py-5 text-sm font-bold text-slate-400">{u.lastLogin}</td>
                <td className="px-8 py-5">
                  <button
                    onClick={() => handleToggleStatus(u.id)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${u.status === 'AKTIF' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    {u.status}
                  </button>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setShowPermModal(u)}
                      className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-primary/10 hover:text-primary transition-all text-xs font-black"
                      title="Kelola Izin"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-500 transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {u.id !== '1' && (
                      <button onClick={() => handleDelete(u.id)} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-3xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic mb-8">Tambah User Baru</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Lengkap</label>
                <input type="text" value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} className="input-field w-full" placeholder="Contoh: Budi Santoso" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Login</label>
                <input type="email" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} className="input-field w-full" placeholder="budi@outlet.id" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} className="input-field w-full pr-12" placeholder="Min. 8 karakter" />
                  <button onClick={() => setShowPass(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Role</label>
                  <select value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value as StaffUser['role'] }))} className="input-field w-full">
                    <option value="KASIR">Kasir</option>
                    <option value="STAFF">Staff</option>
                    <option value="MERCHANT">Merchant</option>
                    <option value="SUPERADMIN">Superadmin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Shift</label>
                  <select value={newUser.shift} onChange={e => setNewUser(p => ({ ...p, shift: e.target.value }))} className="input-field w-full">
                    <option>Pagi (06:00-14:00)</option>
                    <option>Sore (14:00-22:00)</option>
                    <option>Malam (22:00-06:00)</option>
                    <option>Full Day</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleAdd}
                disabled={!newUser.name || !newUser.email}
                className="w-full btn-premium py-4 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Simpan User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-3xl relative">
            <button onClick={() => setShowPermModal(null)} className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic mb-2">Kelola Izin Akses</h2>
            <p className="text-slate-400 font-bold text-sm mb-8">{showPermModal.name} — {showPermModal.role}</p>
            <div className="space-y-3">
              {ALL_PERMISSIONS.map(perm => {
                const has = showPermModal.permissions.includes(perm.key);
                return (
                  <div key={perm.key} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${has ? 'border-primary/20 bg-primary/5' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-3 text-slate-700">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${has ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {perm.icon}
                      </div>
                      <span className="font-bold text-sm">{perm.label}</span>
                    </div>
                    <button
                      onClick={() => setShowPermModal(prev => {
                        if (!prev) return prev;
                        const newPerms = has
                          ? prev.permissions.filter(p => p !== perm.key)
                          : [...prev.permissions, perm.key];
                        return { ...prev, permissions: newPerms };
                      })}
                      className={`w-12 h-6 rounded-full transition-all ${has ? 'bg-primary' : 'bg-slate-200'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${has ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                    </button>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setShowPermModal(null)} className="w-full btn-primary py-4 mt-8">Simpan Izin</button>
          </div>
        </div>
      )}
    </div>
  );
}
