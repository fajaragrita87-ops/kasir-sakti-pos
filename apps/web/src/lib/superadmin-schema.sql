-- Tabel paket/topup koin
CREATE TABLE coin_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama VARCHAR(50) NOT NULL,
  koin INTEGER NOT NULL DEFAULT 0,
  bonus INTEGER NOT NULL DEFAULT 0,
  harga INTEGER NOT NULL DEFAULT 0,
  deskripsi TEXT,
  aktif BOOLEAN DEFAULT true,
  tampil_di_landing BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel super admin
CREATE TABLE super_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'support',
  aktif BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel riwayat topup koin toko (transaksi)
CREATE TABLE coin_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id UUID REFERENCES sppg(id),
  package_id UUID REFERENCES coin_packages(id),
  koin_didapat INTEGER NOT NULL,
  harga_dibayar INTEGER NOT NULL,
  metode_bayar VARCHAR(30),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel penggunaan/pembakaran koin harian per sppg (burn rate)
CREATE TABLE coin_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sppg_id UUID REFERENCES sppg(id),
  koin_terpakai INTEGER NOT NULL,
  deskripsi TEXT, -- e.g. "Pembuatan Laporan BGN", "Pesanan Masuk POS"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel kode promo topup koin
CREATE TABLE coin_promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kode VARCHAR(50) UNIQUE NOT NULL,
  jenis VARCHAR(20), -- 'persen_diskon', 'koin_bonus'
  nilai INTEGER,
  paket_target VARCHAR(50),
  maks_penggunaan INTEGER,
  jumlah_dipakai INTEGER DEFAULT 0,
  expired_at TIMESTAMPTZ,
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert paket koin default
INSERT INTO coin_packages (nama, koin, bonus, harga, deskripsi) VALUES
('Paket Dasar', 5000, 0, 49000, 'Cocok untuk toko kecil, cukup untuk ~500 struk.'),
('Paket Menengah', 25000, 2500, 199000, 'Lebih hemat 20%. Paling laris untuk toko menengah.'),
('Paket Super', 100000, 15000, 699000, 'Super hemat untuk volume transaksi tinggi (Supermarket/Grosir).');
