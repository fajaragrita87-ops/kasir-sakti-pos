-- ═══════════════════════════════════════════════════════════════
-- PATCH: Fix Super Admin bisa lihat semua user + kolom email
-- Jalankan di: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- 1. Tambahkan kolom email jika belum ada
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Isi email dari auth.users ke profiles yang sudah ada
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- 3. Update trigger agar email otomatis ter-copy saat register
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

-- 4. Fix RLS: Super Admin bisa lihat & update semua profiles
DROP POLICY IF EXISTS "Super admin can view all profiles" ON public.profiles;
CREATE POLICY "Super admin can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'SUPERADMIN'
    )
  );

DROP POLICY IF EXISTS "Super admin can update all profiles" ON public.profiles;
CREATE POLICY "Super admin can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'SUPERADMIN'
    )
  );

-- 5. Izinkan insert profil saat registrasi
DROP POLICY IF EXISTS "Anyone can insert profile" ON public.profiles;
CREATE POLICY "Anyone can insert profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

SELECT 'Patch selesai! Super Admin sekarang bisa lihat semua user.' AS status;
