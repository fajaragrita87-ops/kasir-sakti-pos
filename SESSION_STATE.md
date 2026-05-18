# VISTRAL POS — Session Save State
**Last Updated: 2026-05-10 | Session: 7d5b988e-854b-481c-ab4e-00570ae54889**

> ✅ Semua perubahan sudah TERSIMPAN di file disk di folder project.
> File-file ini tidak akan hilang saat PC dimatikan — mereka sudah ada di filesystem lokal.

---

## 📌 Status Akhir Sesi Ini

### Branding
- ✅ **VISTRAL POS** — Ganti total dari "Kasir Sakti POS" / "JD POS"
- ✅ Logo komponen baru (Logo.tsx) dengan ikon V + "PAY AS YOU GO"
- ✅ index.html title, meta OG, PWA tags semua sudah VISTRAL POS

### Arsitektur
- ✅ `src/constants/pricing.constants.ts` — File baru, Single Source of Truth
- ✅ Circular import dihapus (FeatureGuard tidak lagi import dari SuperAdminPage)
- ✅ `main.tsx` — migrateStorageKeys() berjalan di startup
- ✅ Dual-key storage: baca/tulis ke `vistral_subs` DAN `sakti_subs`

### FeatureGuard
- ✅ Banner aktif: "Anda sedang menggunakan Paket Harian modul XYZ"
- ✅ Countdown "Tersisa: HH:MM:SS" di kanan banner
- ✅ Banner merah + peringatan jika sisa < 6 jam
- ✅ SUPERADMIN bypass — SA akses semua tanpa beli koin

### Landing Page
- ✅ Feature Showcase Carousel — 12 modul auto-scroll tiap 3.5 detik
- ✅ Tab pills bisa diklik manual
- ✅ Progress dots di bawah

### Warna UI
- ✅ Semua tab aktif gelap (slate-900) → **Biru (blue-600)**
- Halaman: HRD, Loyalty, CRM, Inventori, PO, QR, Audit Log, Settings

### Feature Lock
- ✅ 14 modul terlindungi FeatureGuard
- ✅ Semua route baru (anti_antri, menu_maker, migration, online_sync) terkunci
- ✅ SA Dashboard dilindungi RequireAuth SUPERADMIN only

---

## 🔑 Kredensial Login (Prototype)

| Role | Email | Password |
|---|---|---|
| **Super Admin** | `admin@saktipos.id` | `SaktiFull2026` |
| **Merchant** | `demo@saktipos.id` | `demo123` |

---

## 📁 File Kritis Yang Diubah Sesi Ini

```
apps/web/src/
├── constants/
│   └── pricing.constants.ts          ← BARU (Single Source of Truth)
├── components/
│   ├── ui/FeatureGuard.tsx           ← Direwrite total
│   └── ui/Logo.tsx                   ← VISTRAL V icon + teks
├── main.tsx                          ← migrateStorageKeys() added
├── App.tsx                           ← Banner VISTRAL POS
├── pages/
│   ├── landing/LandingPage.tsx       ← Carousel 12 modul + VISTRAL
│   ├── superadmin/SuperAdminPage.tsx ← Import dari constants
│   ├── billing/BillingPage.tsx       ← Import dari constants
│   ├── migration/MigrationPage.tsx   ← VISTRAL POS
│   ├── kitchen/KitchenDisplayPage.tsx← VISTRAL POS
│   ├── about/AboutPage.tsx           ← VISTRAL POS
│   ├── guide/UserGuidePage.tsx       ← VISTRAL POS
│   ├── legal/LegalPage.tsx           ← VISTRAL POS
│   ├── dashboard/DashboardPage.tsx   ← VISTRAL POS
│   ├── settings/SettingsPage.tsx     ← Blue tabs + VISTRAL
│   ├── audit/AuditLogPage.tsx        ← Blue tabs
│   ├── hrd/HRDPage.tsx               ← Blue tabs
│   ├── loyalty/LoyaltyPage.tsx       ← Blue tabs
│   ├── crm/CustomerPage.tsx          ← Blue tabs
│   ├── inventory/InventoryPage.tsx   ← Blue tabs
│   ├── inventory/PurchaseOrderPage.tsx← Blue tabs
│   └── qris/QRReadyPage.tsx          ← Blue tabs
├── components/
│   ├── pos/POSScreen.tsx             ← VISTRAL POS receipt
│   ├── pos/ReceiptTemplate.tsx       ← VISTRAL POS receipt
│   ├── layouts/DashboardLayout.tsx   ← VISTRAL POS fallback
│   └── PWAInstallBanner.tsx          ← VISTRAL POS
└── index.html                        ← Title, meta, PWA tags
```

---

## 🚀 Langkah Lanjutan (Sesi Berikutnya)

1. **Backend Integration** — Pindahkan `vistral_pricing` & `vistral_subs` dari localStorage ke database Prisma
2. **Coin System** — Implementasi endpoint `/api/coins/purchase` dan `/api/coins/balance`
3. **Production Build** — `npm run build` untuk bundle optimization
4. **Deployment** — Upload ke hosting dengan HTTPS

---

## 💡 Cara Jalankan Ulang

```powershell
cd c:\Users\HP\.gemini\antigravity\scratch\kasir-sakti-pos
npm run dev
# Buka: http://localhost:5173
```
