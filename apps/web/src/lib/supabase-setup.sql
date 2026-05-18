-- ═══════════════════════════════════════════════════════════════
-- VISTRAL POS — Supabase Database Setup (UPDATED)
-- Jalankan file ini di: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- 1. ENABLE UUID EXTENSION (biasanya sudah aktif)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- 2. TABEL PROFILES (data merchant/user)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT,
  email           TEXT,
  phone           TEXT,
  business_name   TEXT,
  business_type   TEXT DEFAULT 'FNB' CHECK (business_type IN ('FNB', 'RETAIL', 'SERVICES')),
  role            TEXT DEFAULT 'MERCHANT' CHECK (role IN ('SUPERADMIN', 'MERCHANT', 'STAFF')),
  outlet_id       TEXT,
  coins           INTEGER DEFAULT 50,
  enabled_features TEXT[] DEFAULT ARRAY[
    'POS', 'INVENTORY', 'PURCHASE_ORDER', 'HRD', 'LOYALTY',
    'CRM', 'KDS', 'BILLING', 'ACCOUNTING', 'DEBT',
    'ONLINE_ORDER', 'ANTI_ANTRI', 'MIGRATION'
  ],
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Tambahkan kolom email jika tabel sudah ada tapi belum ada kolom email
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- ─────────────────────────────────────────────
-- 3. TRIGGER: Auto-create profile saat user baru register
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, business_name, business_type, outlet_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'business_name',
    COALESCE(NEW.raw_user_meta_data ->> 'business_type', 'FNB'),
    'outlet-' || NEW.id::text
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pasang trigger ke auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────
-- 4. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies untuk menghindari error duplicate
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admin can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can insert profile" ON public.profiles;

-- User bisa lihat profil sendiri
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Super Admin bisa lihat SEMUA profil
CREATE POLICY "Super admin can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'SUPERADMIN'
    )
  );

-- User bisa update profil sendiri
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Super Admin bisa update SEMUA profil (termasuk injek koin)
CREATE POLICY "Super admin can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'SUPERADMIN'
    )
  );

-- Semua authenticated user bisa insert profil (untuk registrasi)
CREATE POLICY "Anyone can insert profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ─────────────────────────────────────────────
-- 5. TABEL TRANSAKSI (untuk sinkronisasi real-time)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id       TEXT NOT NULL,
  user_id         UUID REFERENCES auth.users(id),
  items           JSONB NOT NULL DEFAULT '[]',
  subtotal        NUMERIC(15, 2) NOT NULL DEFAULT 0,
  tax             NUMERIC(15, 2) NOT NULL DEFAULT 0,
  discount        NUMERIC(15, 2) NOT NULL DEFAULT 0,
  total           NUMERIC(15, 2) NOT NULL DEFAULT 0,
  payment_method  TEXT DEFAULT 'TUNAI',
  payment_status  TEXT DEFAULT 'PAID' CHECK (payment_status IN ('PAID', 'PENDING', 'FAILED')),
  cashier_name    TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Merchant sees own outlet transactions" ON public.transactions;
DROP POLICY IF EXISTS "Merchant can insert own transactions" ON public.transactions;

CREATE POLICY "Merchant sees own outlet transactions"
  ON public.transactions FOR SELECT
  USING (outlet_id = 'outlet-' || auth.uid()::text);

CREATE POLICY "Merchant can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (outlet_id = 'outlet-' || auth.uid()::text);

-- ─────────────────────────────────────────────
-- 6. TABEL PRODUK / INVENTORI
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id       TEXT NOT NULL,
  name            TEXT NOT NULL,
  sku             TEXT,
  category        TEXT,
  price           NUMERIC(15, 2) NOT NULL DEFAULT 0,
  cost            NUMERIC(15, 2) DEFAULT 0,
  stock           INTEGER DEFAULT 0,
  min_stock       INTEGER DEFAULT 5,
  unit            TEXT DEFAULT 'pcs',
  is_active       BOOLEAN DEFAULT TRUE,
  image_url       TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Merchant sees own products" ON public.products;
DROP POLICY IF EXISTS "Merchant manages own products" ON public.products;

CREATE POLICY "Merchant sees own products"
  ON public.products FOR SELECT
  USING (outlet_id = 'outlet-' || auth.uid()::text);

CREATE POLICY "Merchant manages own products"
  ON public.products FOR ALL
  USING (outlet_id = 'outlet-' || auth.uid()::text);

-- ─────────────────────────────────────────────
-- 7. FUNCTION: Updated_at auto-update
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────
-- SELESAI — Cek hasilnya di Table Editor Supabase
-- ─────────────────────────────────────────────
SELECT 'Setup selesai! Tabel profiles (+ email), transactions, dan products sudah siap.' AS status;
