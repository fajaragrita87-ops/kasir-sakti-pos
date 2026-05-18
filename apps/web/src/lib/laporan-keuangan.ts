// ─── Kasir Sakti POS — Laporan Keuangan ─────────────────────────────────────
// Generate semua laporan keuangan dari data jurnal.
// Bahasa tampil ke user: Indonesia sederhana, bukan akuntansi.

import { supabase } from './supabase'
import { getBukuBesar } from './buku-besar'

export const formatRp = (n: number) =>
  'Rp ' + Math.abs(n).toLocaleString('id-ID', { minimumFractionDigits: 0 })

// ─── Neraca (Balance Sheet) ───────────────────────────────────────────────────
// Tampil ke user: "Laporan Posisi Keuangan"

export async function generateNeraca(merchantId: string, tanggal: string) {
  const { data: details } = await supabase
    .from('jurnal_detail_akuntansi')
    .select(`
      debit, kredit,
      akun_akuntansi!inner(kode, nama, nama_tampil, tipe, sub_tipe, normal_balance, urutan, level, parent_id),
      jurnal_akuntansi!inner(tanggal, status, merchant_id)
    `)
    .eq('jurnal_akuntansi.merchant_id', merchantId)
    .eq('jurnal_akuntansi.status', 'posted')
    .lte('jurnal_akuntansi.tanggal', tanggal)

  const saldoMap: Record<string, { akun: any; saldo: number }> = {}

  ;(details || []).forEach((d: any) => {
    const key = d.akun_akuntansi.kode
    if (!saldoMap[key]) saldoMap[key] = { akun: d.akun_akuntansi, saldo: 0 }
    const net = (d.debit || 0) - (d.kredit || 0)
    saldoMap[key].saldo += d.akun_akuntansi.normal_balance === 'debit' ? net : -net
  })

  const all = Object.values(saldoMap)
  const aset      = all.filter(x => x.akun.tipe === 'aset').sort((a, b) => a.akun.urutan - b.akun.urutan)
  const liabilitas = all.filter(x => x.akun.tipe === 'liabilitas').sort((a, b) => a.akun.urutan - b.akun.urutan)
  const ekuitas   = all.filter(x => x.akun.tipe === 'ekuitas').sort((a, b) => a.akun.urutan - b.akun.urutan)

  const totalAset       = aset.reduce((s, x) => s + x.saldo, 0)
  const totalLiabilitas = liabilitas.reduce((s, x) => s + x.saldo, 0)
  const totalEkuitas    = ekuitas.reduce((s, x) => s + x.saldo, 0)

  return {
    judul: 'Laporan Posisi Keuangan',
    tanggal,
    aset: { items: aset, total: totalAset },
    liabilitas: { items: liabilitas, total: totalLiabilitas },
    ekuitas: { items: ekuitas, total: totalEkuitas },
    balance: Math.abs(totalAset - (totalLiabilitas + totalEkuitas)) < 1,
  }
}

// ─── Laporan Laba Rugi / Surplus-Defisit ─────────────────────────────────────
// Tampil ke user: "Laporan Penggunaan Dana & Keuntungan"

export async function generateLabaRugi(merchantId: string, tanggalMulai: string, tanggalSelesai: string) {
  const { data: details } = await supabase
    .from('jurnal_detail_akuntansi')
    .select(`
      debit, kredit,
      akun_akuntansi!inner(kode, nama, nama_tampil, tipe, sub_tipe, normal_balance, urutan),
      jurnal_akuntansi!inner(tanggal, status, merchant_id)
    `)
    .eq('jurnal_akuntansi.merchant_id', merchantId)
    .eq('jurnal_akuntansi.status', 'posted')
    .gte('jurnal_akuntansi.tanggal', tanggalMulai)
    .lte('jurnal_akuntansi.tanggal', tanggalSelesai)

  const saldoMap: Record<string, { akun: any; saldo: number }> = {}
  ;(details || []).forEach((d: any) => {
    const key = d.akun_akuntansi.kode
    if (!saldoMap[key]) saldoMap[key] = { akun: d.akun_akuntansi, saldo: 0 }
    const net = (d.debit || 0) - (d.kredit || 0)
    saldoMap[key].saldo += d.akun_akuntansi.normal_balance === 'debit' ? net : -net
  })

  const all = Object.values(saldoMap)
  const pendapatan = all.filter(x => x.akun.tipe === 'pendapatan')
  const beban      = all.filter(x => x.akun.tipe === 'beban')

  const totalPendapatan = pendapatan.reduce((s, x) => s + x.saldo, 0)
  const bebanBahan  = beban.filter(x => x.akun.kode.startsWith('5-1'))
  const bebanSDM    = beban.filter(x => x.akun.kode.startsWith('5-2'))
  const bebanOps    = beban.filter(x => x.akun.kode.startsWith('5-3'))
  const bebanAdmin  = beban.filter(x => x.akun.kode.startsWith('5-4'))
  const totalBeban  = beban.reduce((s, x) => s + x.saldo, 0)
  const labaRugi    = totalPendapatan - totalBeban

  return {
    judul: 'Laporan Keuntungan & Pengeluaran',
    periode: `${tanggalMulai} s/d ${tanggalSelesai}`,
    pendapatan: { items: pendapatan, total: totalPendapatan },
    beban: {
      bahan_baku:   { items: bebanBahan,  total: bebanBahan.reduce((s, x) => s + x.saldo, 0) },
      sdm:          { items: bebanSDM,    total: bebanSDM.reduce((s, x) => s + x.saldo, 0) },
      operasional:  { items: bebanOps,    total: bebanOps.reduce((s, x) => s + x.saldo, 0) },
      administrasi: { items: bebanAdmin,  total: bebanAdmin.reduce((s, x) => s + x.saldo, 0) },
      total: totalBeban
    },
    laba_rugi: labaRugi,
    status: labaRugi >= 0 ? 'laba' : 'rugi'
  }
}

// ─── Laporan Arus Kas ─────────────────────────────────────────────────────────
// Tampil ke user: "Laporan Aliran Dana"

export async function generateArusKas(merchantId: string, tanggalMulai: string, tanggalSelesai: string) {
  const { data: details } = await supabase
    .from('jurnal_detail_akuntansi')
    .select(`
      debit, kredit,
      akun_akuntansi!inner(kode, sub_tipe),
      jurnal_akuntansi!inner(tanggal, status, merchant_id, ref_tipe)
    `)
    .eq('jurnal_akuntansi.merchant_id', merchantId)
    .eq('jurnal_akuntansi.status', 'posted')
    .gte('jurnal_akuntansi.tanggal', tanggalMulai)
    .lte('jurnal_akuntansi.tanggal', tanggalSelesai)

  const d = details || [] as any[]

  const kasMasuk   = d.filter((x: any) => x.jurnal_akuntansi.ref_tipe === 'kas_masuk').reduce((s: number, x: any) => s + (x.debit || 0), 0)
  const posMasuk   = d.filter((x: any) => x.jurnal_akuntansi.ref_tipe === 'penjualan_pos').reduce((s: number, x: any) => s + (x.debit || 0), 0)
  const keluarBahan  = d.filter((x: any) => x.jurnal_akuntansi.ref_tipe === 'belanja_bahan').reduce((s: number, x: any) => s + (x.kredit || 0), 0)
  const keluarOps    = d.filter((x: any) => x.jurnal_akuntansi.ref_tipe === 'operasional').reduce((s: number, x: any) => s + (x.kredit || 0), 0)
  const keluarGaji   = d.filter((x: any) => x.jurnal_akuntansi.ref_tipe === 'gaji').reduce((s: number, x: any) => s + (x.kredit || 0), 0)
  const keluarPetty  = d.filter((x: any) => x.jurnal_akuntansi.ref_tipe === 'petty_cash').reduce((s: number, x: any) => s + (x.kredit || 0), 0)
  const keluarAset   = d.filter((x: any) => x.jurnal_akuntansi.ref_tipe === 'beli_aset').reduce((s: number, x: any) => s + (x.kredit || 0), 0)

  const totalMasuk   = kasMasuk + posMasuk
  const totalKeluar  = keluarBahan + keluarOps + keluarGaji + keluarPetty
  const arusBersih   = totalMasuk - totalKeluar

  return {
    judul: 'Laporan Aliran Dana',
    periode: `${tanggalMulai} s/d ${tanggalSelesai}`,
    operasional: {
      masuk: { penjualan: posMasuk, dana_lainnya: kasMasuk, total: totalMasuk },
      keluar: { bahan_baku: keluarBahan, operasional: keluarOps, gaji: keluarGaji, petty_cash: keluarPetty, total: totalKeluar },
      net: arusBersih
    },
    investasi: { keluar_aset: keluarAset, net: -keluarAset },
    pendanaan: { net: 0 },
    arus_bersih: arusBersih - keluarAset,
    status: arusBersih >= 0 ? 'positif' : 'negatif'
  }
}

// ─── Trial Balance (Neraca Saldo) ─────────────────────────────────────────────
// Tampil ke user: "Ringkasan Saldo Semua Akun"

export async function generateTrialBalance(merchantId: string, sampaiTanggal: string) {
  const { data: akuns } = await supabase
    .from('akun_akuntansi')
    .select('*')
    .eq('merchant_id', merchantId)
    .eq('aktif', true)
    .order('urutan')

  if (!akuns) return null

  const result = await Promise.all(
    akuns.map(async (akun: any) => {
      const { data: det } = await supabase
        .from('jurnal_detail_akuntansi')
        .select('debit, kredit, jurnal_akuntansi!inner(tanggal, status)')
        .eq('akun_id', akun.id)
        .eq('jurnal_akuntansi.status', 'posted')
        .lte('jurnal_akuntansi.tanggal', sampaiTanggal)

      const td = (det || []).reduce((s: number, d: any) => s + (d.debit || 0), 0)
      const tk = (det || []).reduce((s: number, d: any) => s + (d.kredit || 0), 0)
      const saldo = akun.normal_balance === 'debit' ? td - tk : tk - td
      return { ...akun, total_debit: td, total_kredit: tk, saldo }
    })
  )

  const aktif = result.filter(r => r.total_debit > 0 || r.total_kredit > 0)
  const totalDebit  = aktif.reduce((s, r) => s + r.total_debit, 0)
  const totalKredit = aktif.reduce((s, r) => s + r.total_kredit, 0)

  return {
    judul: 'Neraca Saldo',
    sampai_tanggal: sampaiTanggal,
    akuns: aktif,
    total_debit: totalDebit,
    total_kredit: totalKredit,
    balance: Math.abs(totalDebit - totalKredit) < 1
  }
}

// ─── Anggaran vs Realisasi ────────────────────────────────────────────────────

export async function getAnggaranVsRealisasi(merchantId: string, tahun: number, bulan: number) {
  const pad = String(bulan).padStart(2, '0')
  const tglMulai   = `${tahun}-${pad}-01`
  const tglSelesai = new Date(tahun, bulan, 0).toISOString().split('T')[0]

  const { data: anggaran } = await supabase
    .from('anggaran_akuntansi')
    .select('*, akun_akuntansi!inner(nama, nama_tampil, tipe, kode)')
    .eq('merchant_id', merchantId)
    .eq('tahun', tahun)
    .eq('bulan', bulan)

  return Promise.all(
    (anggaran || []).map(async (a: any) => {
      const bb = await getBukuBesar(merchantId, a.akun_akuntansi.kode, tglMulai, tglSelesai)
      const realisasi   = bb?.saldo_akhir || 0
      const varians     = a.jumlah - realisasi
      const persen      = a.jumlah > 0 ? Math.round((realisasi / a.jumlah) * 100) : 0
      return {
        akun: a.akun_akuntansi, anggaran: a.jumlah, realisasi, varians, persen,
        status: persen > 110 ? 'over' : persen >= 90 ? 'on_track' : 'under'
      }
    })
  )
}
