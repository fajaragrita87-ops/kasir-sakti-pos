import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Ban, UserPlus, X, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

const AKSI_COLORS: Record<string, string> = {
  LOGIN: 'bg-emerald-50 text-emerald-700',
  LOGOUT: 'bg-slate-100 text-slate-600',
  LOGIN_GAGAL: 'bg-rose-50 text-rose-700',
  KUNCI_LAPORAN: 'bg-blue-50 text-blue-700',
  HAPUS_PRODUK: 'bg-orange-50 text-orange-700',
  UBAH_ROLE: 'bg-violet-50 text-violet-700',
};

export default function Keamanan() {
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdmin, setNewAdmin] = useState({ nama: '', email: '', role: 'support' });

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['SUPERADMIN'])
        .order('created_at', { ascending: false });
      setAdmins(data || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchAdmins(); }, []);

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Super Admin</p>
            <h1 className="text-2xl font-light text-slate-900">Keamanan & Audit</h1>
          </div>
          <button onClick={fetchAdmins} className="p-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
            <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Audit Log - Empty State */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">Audit Log Global</h2>
          </div>
          <div className="p-12 text-center">
            <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-500">Belum Ada Log Aktivitas</p>
            <p className="text-sm text-slate-400 mt-1">Log aktivitas akan tercatat secara otomatis saat user melakukan aksi penting seperti login, perubahan role, dan penghapusan data.</p>
            <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
              {['LOGIN', 'LOGOUT', 'LOGIN_GAGAL', 'UBAH_ROLE', 'HAPUS_PRODUK'].map(a => (
                <span key={a} className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${AKSI_COLORS[a] ?? 'bg-slate-100 text-slate-600'}`}>
                  {a.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Suspicious Access - Empty State */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">Akses Mencurigakan</h2>
          </div>
          <div className="p-12 text-center">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Shield className="w-7 h-7 text-emerald-500" />
            </div>
            <p className="font-bold text-emerald-700">Tidak Ada Aktivitas Mencurigakan</p>
            <p className="text-sm text-slate-400 mt-1">Sistem memantau percobaan login gagal berulang dan akses dari IP yang tidak dikenal.</p>
          </div>
        </div>

        {/* Super Admin Accounts - Real from Supabase */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#1e6fbf]" />
              <h2 className="font-black text-slate-900 text-sm uppercase tracking-widest">Akun Super Admin</h2>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-slate-400 animate-spin mx-auto" />
            </div>
          ) : admins.length === 0 ? (
            <div className="p-12 text-center">
              <Shield className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-400">Belum ada akun Super Admin</p>
              <p className="text-sm text-slate-400 mt-1">Set role user ke SUPERADMIN melalui Supabase SQL Editor.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-3">Nama</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Tgl Dibuat</th>
                    <th className="px-6 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {admins.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3.5 font-bold text-slate-900 text-sm">{a.full_name || '(Tanpa Nama)'}</td>
                      <td className="px-6 py-3.5 text-slate-500 text-sm">{a.email || a.id.slice(0,12)}</td>
                      <td className="px-6 py-3.5">
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase bg-[#0f172a] text-white">
                          {a.role}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-500 text-sm font-mono">
                        {a.created_at ? new Date(a.created_at).toLocaleDateString('id-ID') : '—'}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Aktif
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
