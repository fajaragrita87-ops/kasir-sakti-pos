// ─── Kasir Sakti POS — Accounting Engine ─────────────────────────────────────
// Engine akuntansi double-entry. Jantung dari semua kalkulasi keuangan.
// Semua transaksi HARUS melewati engine ini.
// User tidak perlu tau debit/kredit — app yang urus otomatis.

import { supabase } from './supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface JurnalLine {
  akun_kode: string
  deskripsi?: string
  debit: number
  kredit: number
}

export interface CreateJurnalParams {
  merchantId: string
  tanggal: string        // YYYY-MM-DD
  deskripsi: string      // bahasa manusia
  lines: JurnalLine[]
  refTipe?: string       // 'belanja_bahan'|'insentif'|'kas_masuk'|'petty_cash'|'operasional'|'bayar_hutang'|'manual'
  refId?: string
  dibuatOleh: string     // user id
}

export interface AkunInfo {
  id: string
  kode: string
  nama: string
  nama_tampil: string
  tipe: string
  sub_tipe: string
  normal_balance: string
  level: number
  urutan: number
  system_account: boolean
  aktif: boolean
  parent_id: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const formatRupiah = (n: number) =>
  'Rp ' + Math.abs(n).toLocaleString('id-ID', { minimumFractionDigits: 0 })

// ─── Generate Nomor Jurnal ────────────────────────────────────────────────────

async function generateNoJurnal(merchantId: string, tanggal: string): Promise<string> {
  const [tahun, bulan] = tanggal.split('-')
  const prefix = `JU/${merchantId.slice(0, 8)}/${tahun}/${bulan}/`
  const { count } = await supabase
    .from('jurnal_akuntansi')
    .select('*', { count: 'exact', head: true })
    .eq('merchant_id', merchantId)
    .like('no_jurnal', `${prefix}%`)
  const urutan = String((count || 0) + 1).padStart(4, '0')
  return `${prefix}${urutan}`
}

// ─── Validasi Balance ─────────────────────────────────────────────────────────

export function validasiBalance(lines: JurnalLine[]): boolean {
  const totalDebit  = lines.reduce((s, l) => s + l.debit,  0)
  const totalKredit = lines.reduce((s, l) => s + l.kredit, 0)
  return Math.abs(totalDebit - totalKredit) < 0.01
}

// ─── Core: Buat Jurnal ────────────────────────────────────────────────────────

export async function buatJurnal(params: CreateJurnalParams): Promise<string> {
  const { merchantId, tanggal, deskripsi, lines, refTipe, refId, dibuatOleh } = params

  if (!validasiBalance(lines)) {
    throw new Error('Jurnal tidak balance! Total debit ≠ total kredit.')
  }

  // Resolve akun IDs
  const kodes = lines.map(l => l.akun_kode)
  const { data: akuns, error: aErr } = await supabase
    .from('akun_akuntansi')
    .select('id, kode')
    .eq('merchant_id', merchantId)
    .in('kode', kodes)

  if (aErr || !akuns) throw new Error('Gagal mengambil data akun')

  const akunMap: Record<string, string> = {}
  akuns.forEach(a => { akunMap[a.kode] = a.id })

  const noJurnal = await generateNoJurnal(merchantId, tanggal)

  const { data: jurnal, error: jErr } = await supabase
    .from('jurnal_akuntansi')
    .insert({
      merchant_id: merchantId,
      tanggal,
      no_jurnal: noJurnal,
      deskripsi,
      ref_tipe: refTipe || 'manual',
      ref_id: refId || null,
      dibuat_oleh: dibuatOleh,
      status: 'posted'
    })
    .select('id')
    .single()

  if (jErr || !jurnal) throw new Error(`Gagal membuat jurnal: ${jErr?.message}`)

  const details = lines.map((line, i) => ({
    jurnal_id: jurnal.id,
    akun_id: akunMap[line.akun_kode],
    deskripsi: line.deskripsi || deskripsi,
    debit: line.debit,
    kredit: line.kredit,
    urutan: i + 1
  }))

  const { error: dErr } = await supabase.from('jurnal_detail_akuntansi').insert(details)
  if (dErr) throw new Error(`Gagal menyimpan detail jurnal: ${dErr.message}`)

  return jurnal.id
}

// ─── Template Jurnal Per Jenis Transaksi ──────────────────────────────────────
// Dipanggil OTOMATIS dari modul lain. User tidak perlu interaksi.

/** 1. Catat penerimaan dana (kas masuk dari penjualan/pendapatan) */
export async function jurnalKasMasuk(params: {
  merchantId: string; tanggal: string; jumlah: number
  keterangan: string; userId: string; kategori?: string
}) {
  const akunPendapatan = params.kategori === 'lainnya' ? '4-0003' : '4-0001'
  return buatJurnal({
    merchantId: params.merchantId, tanggal: params.tanggal,
    deskripsi: `Penerimaan dana — ${params.keterangan}`,
    refTipe: 'kas_masuk', dibuatOleh: params.userId,
    lines: [
      { akun_kode: '1-1001', debit: params.jumlah, kredit: 0, deskripsi: 'Kas bertambah' },
      { akun_kode: akunPendapatan, debit: 0, kredit: params.jumlah, deskripsi: params.keterangan },
    ]
  })
}

/** 2. Penjualan POS (otomatis dari transaksi kasir) */
export async function jurnalPenjualanPOS(params: {
  merchantId: string; tanggal: string; totalPenjualan: number
  hpp: number; metodeBayar: 'tunai' | 'transfer' | 'qris'
  userId: string; refId?: string
}) {
  const akunKas = params.metodeBayar === 'tunai' ? '1-1001' : '1-1002'
  const lines: JurnalLine[] = [
    { akun_kode: akunKas, debit: params.totalPenjualan, kredit: 0, deskripsi: `Penerimaan ${params.metodeBayar}` },
    { akun_kode: '4-0001', debit: 0, kredit: params.totalPenjualan, deskripsi: 'Pendapatan penjualan' },
  ]
  if (params.hpp > 0) {
    lines.push(
      { akun_kode: '5-1000', debit: params.hpp, kredit: 0, deskripsi: 'HPP penjualan' },
      { akun_kode: '1-1100', debit: 0, kredit: params.hpp, deskripsi: 'Persediaan berkurang' },
    )
  }
  return buatJurnal({
    merchantId: params.merchantId, tanggal: params.tanggal,
    deskripsi: 'Penjualan POS',
    refTipe: 'penjualan_pos', refId: params.refId, dibuatOleh: params.userId,
    lines
  })
}

/** 3. Belanja bahan baku / pembelian ke supplier */
export async function jurnalBelanjaBahan(params: {
  merchantId: string; tanggal: string; jumlah: number
  namaBahan: string; kategoriAkun: string
  metodeBayar: 'kas' | 'hutang'; userId: string; refId?: string
}) {
  const akunBahan = params.kategoriAkun || '5-1001'
  const akunKredit = params.metodeBayar === 'kas' ? '1-1001' : '2-1001'
  const ketKredit = params.metodeBayar === 'kas' ? 'Bayar tunai' : 'Belum dibayar (hutang supplier)'
  return buatJurnal({
    merchantId: params.merchantId, tanggal: params.tanggal,
    deskripsi: `Belanja ${params.namaBahan}`,
    refTipe: 'belanja_bahan', refId: params.refId, dibuatOleh: params.userId,
    lines: [
      { akun_kode: akunBahan, debit: params.jumlah, kredit: 0, deskripsi: `Belanja ${params.namaBahan}` },
      { akun_kode: akunKredit, debit: 0, kredit: params.jumlah, deskripsi: ketKredit },
    ]
  })
}

/** 4. Bayar biaya operasional (listrik, gas, air, dll) */
export async function jurnalBayarOperasional(params: {
  merchantId: string; tanggal: string; jumlah: number
  jenis: 'listrik' | 'gas' | 'air' | 'internet' | 'bbm' | 'sewa' | 'atk' | 'lainnya'
  keterangan: string; userId: string; refId?: string
}) {
  const akunMap: Record<string, string> = {
    listrik: '5-3001', gas: '5-3002', air: '5-3003', internet: '5-3004',
    bbm: '5-3005', sewa: '5-3006', atk: '5-3007', lainnya: '5-3099'
  }
  return buatJurnal({
    merchantId: params.merchantId, tanggal: params.tanggal,
    deskripsi: `Biaya ${params.jenis} — ${params.keterangan}`,
    refTipe: 'operasional', refId: params.refId, dibuatOleh: params.userId,
    lines: [
      { akun_kode: akunMap[params.jenis] || '5-3099', debit: params.jumlah, kredit: 0, deskripsi: `Biaya ${params.jenis}` },
      { akun_kode: '1-1001', debit: 0, kredit: params.jumlah, deskripsi: 'Bayar dari kas' },
    ]
  })
}

/** 5. Bayar gaji/upah karyawan */
export async function jurnalBayarGaji(params: {
  merchantId: string; tanggal: string; jumlah: number
  jumlahKaryawan: number; periode: string; userId: string
}) {
  return buatJurnal({
    merchantId: params.merchantId, tanggal: params.tanggal,
    deskripsi: `Gaji ${params.jumlahKaryawan} karyawan periode ${params.periode}`,
    refTipe: 'gaji', dibuatOleh: params.userId,
    lines: [
      { akun_kode: '5-2001', debit: params.jumlah, kredit: 0, deskripsi: 'Beban gaji karyawan' },
      { akun_kode: '1-1001', debit: 0, kredit: params.jumlah, deskripsi: 'Bayar dari kas' },
    ]
  })
}

/** 6. Petty cash keluar */
export async function jurnalPettyCash(params: {
  merchantId: string; tanggal: string; jumlah: number
  kategori: string; uraian: string; userId: string; refId?: string
}) {
  const akunMap: Record<string, string> = {
    bahan_baku: '5-1005', bbm: '5-3005', atk: '5-3007',
    kebersihan: '5-3008', lainnya: '5-3099'
  }
  const akunBeban = akunMap[params.kategori] || '5-3099'
  return buatJurnal({
    merchantId: params.merchantId, tanggal: params.tanggal,
    deskripsi: `Kas kecil — ${params.uraian}`,
    refTipe: 'petty_cash', refId: params.refId, dibuatOleh: params.userId,
    lines: [
      { akun_kode: akunBeban, debit: params.jumlah, kredit: 0, deskripsi: params.uraian },
      { akun_kode: '1-1002', debit: 0, kredit: params.jumlah, deskripsi: 'Keluar dari kas kecil' },
    ]
  })
}

/** 7. Lunasi hutang ke supplier */
export async function jurnalBayarHutangSupplier(params: {
  merchantId: string; tanggal: string; jumlah: number
  namaSupplier: string; userId: string; refId?: string
}) {
  return buatJurnal({
    merchantId: params.merchantId, tanggal: params.tanggal,
    deskripsi: `Bayar hutang ke ${params.namaSupplier}`,
    refTipe: 'bayar_hutang', refId: params.refId, dibuatOleh: params.userId,
    lines: [
      { akun_kode: '2-1001', debit: params.jumlah, kredit: 0, deskripsi: 'Hutang supplier berkurang' },
      { akun_kode: '1-1001', debit: 0, kredit: params.jumlah, deskripsi: 'Bayar dari kas' },
    ]
  })
}

/** 8. Tambah aset tetap (pembelian peralatan) */
export async function jurnalBeliAset(params: {
  merchantId: string; tanggal: string; jumlah: number
  namaAset: string; akunAset: string
  metodeBayar: 'kas' | 'hutang'; userId: string
}) {
  const akunKredit = params.metodeBayar === 'kas' ? '1-1001' : '2-1001'
  return buatJurnal({
    merchantId: params.merchantId, tanggal: params.tanggal,
    deskripsi: `Pembelian aset — ${params.namaAset}`,
    refTipe: 'beli_aset', dibuatOleh: params.userId,
    lines: [
      { akun_kode: params.akunAset || '1-2001', debit: params.jumlah, kredit: 0, deskripsi: params.namaAset },
      { akun_kode: akunKredit, debit: 0, kredit: params.jumlah, deskripsi: params.metodeBayar === 'kas' ? 'Bayar tunai' : 'Kredit' },
    ]
  })
}

// ─── Kalkulasi Saldo ──────────────────────────────────────────────────────────

export async function getSaldoAkun(
  merchantId: string, akunKode: string, sampaiTanggal: string
): Promise<number> {
  const { data: akun } = await supabase
    .from('akun_akuntansi')
    .select('id, normal_balance')
    .eq('merchant_id', merchantId)
    .eq('kode', akunKode)
    .single()
  if (!akun) return 0

  const { data } = await supabase
    .from('jurnal_detail_akuntansi')
    .select('debit, kredit, jurnal_akuntansi!inner(tanggal, status)')
    .eq('akun_id', akun.id)
    .eq('jurnal_akuntansi.status', 'posted')
    .lte('jurnal_akuntansi.tanggal', sampaiTanggal)

  if (!data) return 0
  const td = data.reduce((s, r) => s + (r.debit  || 0), 0)
  const tk = data.reduce((s, r) => s + (r.kredit || 0), 0)
  return akun.normal_balance === 'debit' ? td - tk : tk - td
}

export async function getAllAkun(merchantId: string): Promise<AkunInfo[]> {
  const { data } = await supabase
    .from('akun_akuntansi')
    .select('*')
    .eq('merchant_id', merchantId)
    .eq('aktif', true)
    .order('urutan')
  return (data || []) as AkunInfo[]
}
