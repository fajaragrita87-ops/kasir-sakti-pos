-- ─── Kasir Sakti POS — Database Akuntansi ───────────────────────────────────
-- Jalankan di Supabase SQL Editor

-- Enable UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Tabel: Chart of Accounts ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS akun_akuntansi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL,  -- references merchants(id)
  kode VARCHAR(20) NOT NULL,
  nama VARCHAR(255) NOT NULL,
  nama_tampil VARCHAR(255),   -- bahasa manusia, tampil ke user
  tipe VARCHAR(20) NOT NULL,  -- aset/liabilitas/ekuitas/pendapatan/beban
  sub_tipe VARCHAR(50),
  normal_balance VARCHAR(10) NOT NULL DEFAULT 'debit', -- debit/kredit
  parent_id UUID REFERENCES akun_akuntansi(id),
  level INTEGER DEFAULT 1,
  aktif BOOLEAN DEFAULT true,
  urutan INTEGER,
  system_account BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(merchant_id, kode)
);

-- ─── Tabel: Jurnal Umum ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jurnal_akuntansi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL,
  tanggal DATE NOT NULL,
  no_jurnal VARCHAR(60) UNIQUE NOT NULL,
  deskripsi TEXT NOT NULL,
  ref_tipe VARCHAR(50) DEFAULT 'manual',
  ref_id UUID,
  status VARCHAR(20) DEFAULT 'posted',  -- draft/posted/void
  dibuat_oleh UUID,
  void_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Tabel: Detail Jurnal ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jurnal_detail_akuntansi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jurnal_id UUID REFERENCES jurnal_akuntansi(id) ON DELETE CASCADE,
  akun_id UUID REFERENCES akun_akuntansi(id),
  deskripsi TEXT,
  debit DECIMAL(15,2) DEFAULT 0,
  kredit DECIMAL(15,2) DEFAULT 0,
  urutan INTEGER
);

-- ─── Tabel: Periode Akuntansi ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS periode_akuntansi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL,
  tahun INTEGER NOT NULL,
  bulan INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'terbuka',
  ditutup_pada TIMESTAMPTZ,
  UNIQUE(merchant_id, tahun, bulan)
);

-- ─── Tabel: Anggaran ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS anggaran_akuntansi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL,
  akun_id UUID REFERENCES akun_akuntansi(id),
  tahun INTEGER,
  bulan INTEGER,
  jumlah DECIMAL(15,2),
  UNIQUE(merchant_id, akun_id, tahun, bulan)
);

-- ─── Index ────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_jurnal_merchant_tgl ON jurnal_akuntansi(merchant_id, tanggal);
CREATE INDEX IF NOT EXISTS idx_jdetail_jurnal     ON jurnal_detail_akuntansi(jurnal_id);
CREATE INDEX IF NOT EXISTS idx_jdetail_akun       ON jurnal_detail_akuntansi(akun_id);
CREATE INDEX IF NOT EXISTS idx_akun_merchant      ON akun_akuntansi(merchant_id, kode);

-- ─── Fungsi: Setup COA Default ───────────────────────────────────────────────
-- Panggil SEKALI saat merchant baru daftar:
-- SELECT setup_coa_default('<merchant_uuid>');

CREATE OR REPLACE FUNCTION setup_coa_default(p_merchant_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO akun_akuntansi
    (merchant_id, kode, nama, nama_tampil, tipe, sub_tipe, normal_balance, level, urutan, system_account)
  VALUES
  -- ASET LANCAR
  (p_merchant_id,'1-0000','Aset','Harta & Kekayaan','aset','induk','debit',1,100,true),
  (p_merchant_id,'1-1000','Aset Lancar','Uang & Harta Lancar','aset','induk','debit',1,110,true),
  (p_merchant_id,'1-1001','Kas & Bank','Uang Tunai & Saldo Bank','aset','kas','debit',2,111,true),
  (p_merchant_id,'1-1002','Kas Kecil','Kas Kecil (Petty Cash)','aset','kas','debit',2,112,true),
  (p_merchant_id,'1-1100','Persediaan Barang','Stok Barang Dagangan','aset','persediaan','debit',2,120,true),
  (p_merchant_id,'1-1200','Piutang Usaha','Tagihan ke Pelanggan','aset','piutang','debit',2,130,false),
  (p_merchant_id,'1-1300','Biaya Dibayar Dimuka','Bayar Awal untuk Periode Mendatang','aset','prepaid','debit',2,140,false),
  -- ASET TETAP
  (p_merchant_id,'1-2000','Aset Tetap','Peralatan & Kendaraan','aset','induk','debit',1,200,true),
  (p_merchant_id,'1-2001','Peralatan & Mesin','Mesin, Peralatan Usaha','aset','aset_tetap','debit',2,201,false),
  (p_merchant_id,'1-2002','Kendaraan','Kendaraan Operasional','aset','aset_tetap','debit',2,202,false),
  (p_merchant_id,'1-2003','Inventaris Kantor','Perabot & Perlengkapan Kantor','aset','aset_tetap','debit',2,203,false),
  (p_merchant_id,'1-2099','Akumulasi Penyusutan','Penyusutan Aset Tetap','aset','contra_asset','kredit',2,209,false),

  -- LIABILITAS
  (p_merchant_id,'2-0000','Liabilitas','Kewajiban & Hutang','liabilitas','induk','kredit',1,300,true),
  (p_merchant_id,'2-1000','Hutang Jangka Pendek','Kewajiban yang Harus Segera Dibayar','liabilitas','induk','kredit',1,310,true),
  (p_merchant_id,'2-1001','Hutang Usaha','Belanja Belum Dibayar ke Supplier','liabilitas','hutang_usaha','kredit',2,311,true),
  (p_merchant_id,'2-1002','Hutang Gaji','Gaji Karyawan Belum Dibayar','liabilitas','hutang_gaji','kredit',2,312,true),
  (p_merchant_id,'2-1003','Hutang Pajak','Kewajiban Pajak','liabilitas','hutang_pajak','kredit',2,313,false),
  (p_merchant_id,'2-1004','Pendapatan Diterima Dimuka','Uang Pelanggan yang Belum Digunakan','liabilitas','deferred','kredit',2,314,false),

  -- EKUITAS
  (p_merchant_id,'3-0000','Ekuitas','Modal Pemilik','ekuitas','induk','kredit',1,400,true),
  (p_merchant_id,'3-0001','Modal Pemilik','Modal Awal','ekuitas','modal','kredit',2,401,true),
  (p_merchant_id,'3-0002','Laba Ditahan','Laba/Rugi Tahun Sebelumnya','ekuitas','retained','kredit',2,402,true),
  (p_merchant_id,'3-0003','Laba/Rugi Berjalan','Laba/Rugi Periode Ini','ekuitas','current_earnings','kredit',2,403,true),

  -- PENDAPATAN
  (p_merchant_id,'4-0000','Pendapatan','Pemasukan Usaha','pendapatan','induk','kredit',1,500,true),
  (p_merchant_id,'4-0001','Penjualan','Pendapatan dari Penjualan','pendapatan','penjualan','kredit',2,501,true),
  (p_merchant_id,'4-0002','Pendapatan Jasa','Pendapatan dari Jasa','pendapatan','jasa','kredit',2,502,false),
  (p_merchant_id,'4-0003','Pendapatan Lain-lain','Pemasukan Lainnya','pendapatan','lain_lain','kredit',2,503,false),
  (p_merchant_id,'4-0099','Retur & Diskon Penjualan','Retur & Diskon Penjualan','pendapatan','retur','debit',2,504,false),

  -- BEBAN POKOK
  (p_merchant_id,'5-1000','Harga Pokok Penjualan','Biaya Bahan Baku / HPP','beban','induk','debit',1,600,true),
  (p_merchant_id,'5-1001','Pembelian Bahan Baku','Belanja Bahan Baku','beban','hpp','debit',2,601,true),
  (p_merchant_id,'5-1002','Biaya Produksi','Biaya Pengolahan & Produksi','beban','hpp','debit',2,602,false),
  (p_merchant_id,'5-1003','Persediaan Awal','Stok Awal Periode','beban','hpp','debit',2,603,false),
  (p_merchant_id,'5-1099','Persediaan Akhir','Stok Akhir Periode','beban','hpp','kredit',2,609,false),
  (p_merchant_id,'5-1005','Bahan Penolong & Bumbu','Bahan Penolong & Bumbu','beban','bahan_baku','debit',2,605,false),

  -- BEBAN SDM
  (p_merchant_id,'5-2000','Beban SDM','Biaya Karyawan','beban','induk','debit',1,700,true),
  (p_merchant_id,'5-2001','Gaji & Upah','Gaji & Upah Karyawan','beban','gaji','debit',2,701,true),
  (p_merchant_id,'5-2002','THR & Bonus','THR & Bonus Karyawan','beban','bonus','debit',2,702,false),
  (p_merchant_id,'5-2003','BPJS Kesehatan','Iuran BPJS Kesehatan','beban','bpjs','debit',2,703,false),
  (p_merchant_id,'5-2004','BPJS Ketenagakerjaan','Iuran BPJS Ketenagakerjaan','beban','bpjs','debit',2,704,false),

  -- BEBAN OPERASIONAL
  (p_merchant_id,'5-3000','Beban Operasional','Biaya Operasional Usaha','beban','induk','debit',1,800,true),
  (p_merchant_id,'5-3001','Listrik','Tagihan Listrik','beban','utilitas','debit',2,801,false),
  (p_merchant_id,'5-3002','Gas','Gas & Bahan Bakar Masak','beban','utilitas','debit',2,802,false),
  (p_merchant_id,'5-3003','Air','Tagihan Air','beban','utilitas','debit',2,803,false),
  (p_merchant_id,'5-3004','Internet & Telepon','Internet & Pulsa','beban','utilitas','debit',2,804,false),
  (p_merchant_id,'5-3005','BBM Kendaraan','Bahan Bakar Kendaraan','beban','kendaraan','debit',2,805,false),
  (p_merchant_id,'5-3006','Sewa Tempat','Sewa Tempat Usaha','beban','sewa','debit',2,806,false),
  (p_merchant_id,'5-3007','ATK & Perlengkapan','Alat Tulis & Perlengkapan','beban','atk','debit',2,807,false),
  (p_merchant_id,'5-3008','Kebersihan & APD','Alat Kebersihan & APD','beban','kebersihan','debit',2,808,false),
  (p_merchant_id,'5-3009','Perawatan & Servis','Servis & Perawatan Peralatan','beban','pemeliharaan','debit',2,809,false),
  (p_merchant_id,'5-3010','Penyusutan','Penyusutan Aset Tetap','beban','penyusutan','debit',2,810,false),
  (p_merchant_id,'5-3099','Biaya Operasional Lainnya','Biaya Lain-lain','beban','lain_lain','debit',2,899,false),

  -- BEBAN ADMINISTRASI
  (p_merchant_id,'5-4000','Beban Administrasi','Biaya Administrasi','beban','induk','debit',1,900,false),
  (p_merchant_id,'5-4001','Biaya Admin Bank','Biaya Admin Rekening Bank','beban','admin','debit',2,901,false),
  (p_merchant_id,'5-4002','Biaya Pajak','Pajak Usaha','beban','pajak','debit',2,902,false),
  (p_merchant_id,'5-4003','Biaya Pemasaran','Promosi & Iklan','beban','marketing','debit',2,903,false),
  (p_merchant_id,'5-4099','Beban Lain-lain','Biaya Lainnya','beban','lain_lain','debit',2,999,false)

  ON CONFLICT (merchant_id, kode) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Contoh pemanggilan:
-- SELECT setup_coa_default('your-merchant-uuid-here');
