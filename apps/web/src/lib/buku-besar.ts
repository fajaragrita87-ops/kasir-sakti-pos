// ─── Buku Besar per Akun ─────────────────────────────────────────────────────
import { supabase } from './supabase'

export async function getBukuBesar(
  merchantId: string, akunKode: string,
  tanggalMulai: string, tanggalSelesai: string
) {
  const { data: akun } = await supabase
    .from('akun_akuntansi')
    .select('*')
    .eq('merchant_id', merchantId)
    .eq('kode', akunKode)
    .single()

  if (!akun) return null

  const { data: entries } = await supabase
    .from('jurnal_detail_akuntansi')
    .select('*, jurnal_akuntansi!inner(no_jurnal, tanggal, deskripsi, ref_tipe, status)')
    .eq('akun_id', akun.id)
    .eq('jurnal_akuntansi.status', 'posted')
    .gte('jurnal_akuntansi.tanggal', tanggalMulai)
    .lte('jurnal_akuntansi.tanggal', tanggalSelesai)
    .order('jurnal_akuntansi(tanggal)')

  let saldoBerjalan = 0
  const rows = (entries || []).map((e: any) => {
    const net = akun.normal_balance === 'debit'
      ? (e.debit || 0) - (e.kredit || 0)
      : (e.kredit || 0) - (e.debit || 0)
    saldoBerjalan += net
    return { ...e, saldo_berjalan: saldoBerjalan }
  })

  return { akun, entries: rows, saldo_akhir: saldoBerjalan }
}
