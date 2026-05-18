/**
 * VISTRAL POS — MASTER PRICING CONSTANTS
 * Single Source of Truth untuk seluruh harga modul berbayar.
 * 1 Koin = Rp 1.000 (nilai transparan untuk merchant)
 * Digunakan oleh: SuperAdminPage, FeatureGuard, BillingPage
 *
 * Kalkulasi margin:
 *   COGS per merchant: ~Rp 10.000/bln (server share + support)
 *   Break-even: 2 merchant berbayar
 *   Target margin: 60–80% dari pendapatan koin
 */

export interface PricingModule {
  id: string;
  name: string;
  icon: string;
  daily: number;    // Koin (1 koin = Rp 1.000)
  weekly: number;   // Koin (7 hari)
  monthly: number;  // Koin (30 hari)
  yearly: number;   // Koin (365 hari)
  fixed: boolean;   // true = hanya tersedia paket bulanan/tahunan
  isPayPerUse?: boolean; // true = bayar per pemakaian (bukan langganan)
  oneTimePrice?: number; // Harga koin untuk 1x pemakaian
  category: 'operasional' | 'keuangan' | 'pelanggan' | 'fnb' | 'advanced';
}

export const MASTER_PRICING: PricingModule[] = [
  // ── OPERASIONAL ──────────────────────────────────────────────────────────
  // POS Kasir = GRATIS (tidak ada di paywall)
  { id: 'inventory',      name: 'Inventori & Resep',                 icon: '📦', daily: 3,  weekly: 15, monthly: 49,  yearly: 490, fixed: false, category: 'operasional' },
  { id: 'purchase_order', name: 'Sistem PO & Supplier',              icon: '🚚', daily: 2,  weekly: 10, monthly: 35,  yearly: 350, fixed: false, category: 'operasional' },
  { id: 'opname',         name: 'Stock Opname Real-Time',            icon: '📋', daily: 2,  weekly: 10, monthly: 35,  yearly: 350, fixed: false, category: 'operasional' },
  // ── KEUANGAN ─────────────────────────────────────────────────────────────
  { id: 'accounting',     name: 'Akuntansi & Kas',                   icon: '📊', daily: 3,  weekly: 15, monthly: 49,  yearly: 490, fixed: false, category: 'keuangan'   },
  { id: 'piutang',        name: 'Piutang Digital',                   icon: '🧾', daily: 2,  weekly: 10, monthly: 35,  yearly: 350, fixed: false, category: 'keuangan'   },
  // ── PELANGGAN ────────────────────────────────────────────────────────────
  { id: 'customers',      name: 'Pelanggan (CRM)',                    icon: '👥', daily: 2,  weekly: 10, monthly: 35,  yearly: 350, fixed: false, category: 'pelanggan'  },
  { id: 'loyalty',        name: 'Loyalty Program',                   icon: '💳', daily: 2,  weekly: 10, monthly: 35,  yearly: 350, fixed: false, category: 'pelanggan'  },
  // ── FNB / RESTORAN ───────────────────────────────────────────────────────
  { id: 'anti_antri',     name: 'QR Order (Anti-Antri)',             icon: '📱', daily: 3,  weekly: 15, monthly: 49,  yearly: 490, fixed: false, category: 'fnb'        },
  { id: 'kitchen',        name: 'Kitchen Display (KDS)',             icon: '🍳', daily: 0,  weekly: 0,  monthly: 59,  yearly: 590, fixed: true,  category: 'fnb'        },
  { id: 'online_sync',    name: 'E-Commerce Sync (Shopee/Grab/WA)', icon: '🛒', daily: 3,  weekly: 15, monthly: 49,  yearly: 490, fixed: false, category: 'fnb'        },
  // ── ADVANCED ─────────────────────────────────────────────────────────────
  { id: 'hrd',            name: 'HRD & Payroll',                     icon: '👨‍💼', daily: 4,  weekly: 20, monthly: 69,  yearly: 690, fixed: false, category: 'advanced'  },
  { id: 'audit',          name: 'Audit Log & Anti-Tilep',            icon: '🔒', daily: 2,  weekly: 10, monthly: 35,  yearly: 350, fixed: false, category: 'advanced'  },
  { id: 'migration',      name: 'Smart Migration Data',              icon: '🔄', daily: 0,  weekly: 0,  monthly: 0,   yearly: 0,   fixed: false, isPayPerUse: true, oneTimePrice: 20, category: 'advanced'  },
];

// ── PAKET TOP-UP KOIN ────────────────────────────────────────────────────────
// 1 Koin = Rp 1.000 | Semakin banyak beli, semakin hemat
export const COIN_TOPUP_PACKAGES = [
  { id: 'starter',   label: 'Starter',     coins: 55,  bonus: 5,   price: 50_000,  pricePerCoin: 909, badge: null              },
  { id: 'umkm',      label: 'UMKM Juara',  coins: 115, bonus: 15,  price: 100_000, pricePerCoin: 870, badge: 'Paling Populer'  },
  { id: 'ekspansi',  label: 'Ekspansi',    coins: 240, bonus: 40,  price: 200_000, pricePerCoin: 833, badge: 'Hemat 17%'       },
  { id: 'probisnis', label: 'Pro Bisnis',  coins: 625, bonus: 125, price: 500_000, pricePerCoin: 800, badge: 'Hemat 20%'       },
];


// ── FEE TRANSAKSI ─────────────────────────────────────────────────────────────
export const PLATFORM_FEE_PER_TRX   = 500;   // Rp per transaksi POS
export const ANTI_ANTRI_FEE_PER_TRX = 1_000; // Rp per transaksi Anti-Antri

export const STORAGE_KEY_PRICING = 'vistral_pricing';
export const STORAGE_KEY_SUBS    = 'vistral_subs';
// Legacy keys — kept for read fallback (backward compat)
const LEGACY_KEY_PRICING = 'sakti_pricing';
const LEGACY_KEY_SUBS    = 'sakti_subs';

/** Load pricing from localStorage — falls back to MASTER_PRICING */
export function getActivePricing(): PricingModule[] {
  try {
    // Check new key first, then legacy
    const stored = localStorage.getItem(STORAGE_KEY_PRICING)
                ?? localStorage.getItem(LEGACY_KEY_PRICING);
    if (stored) {
      const parsed: Partial<PricingModule>[] = JSON.parse(stored);
      return MASTER_PRICING.map(def => {
        const override = parsed.find(p => p.id === def.id);
        return override ? { ...def, ...override } : def;
      });
    }
  } catch { /* ignore corrupt storage */ }
  return MASTER_PRICING;
}

/**
 * Get active subscription for a feature.
 * Reads from BOTH vistral_subs AND sakti_subs (dual-key fallback).
 */
export function getFeatureSub(featureId: string): { type: string; expireAt: string; startAt: string } | null {
  try {
    // Try new key first, then legacy
    const raw = localStorage.getItem(STORAGE_KEY_SUBS)
             ?? localStorage.getItem(LEGACY_KEY_SUBS);
    if (!raw) return null;
    const subs = JSON.parse(raw);
    const sub  = subs[featureId];
    if (sub && new Date(sub.expireAt).getTime() > Date.now()) return sub;
  } catch { /* ignore */ }
  return null;
}

/**
 * Save subscription for a feature.
 * Writes to BOTH vistral_subs AND sakti_subs so any reader finds it.
 */
export function saveFeatureSub(
  featureId: string,
  type: 'daily' | 'weekly' | 'monthly' | 'yearly',
  days: number
) {
  // Read from whichever key has data
  const raw  = localStorage.getItem(STORAGE_KEY_SUBS)
            ?? localStorage.getItem(LEGACY_KEY_SUBS);
  const subs = raw ? JSON.parse(raw) : {};
  const now  = new Date();

  subs[featureId] = {
    type,
    startAt:  now.toISOString(),
    expireAt: new Date(now.getTime() + days * 86_400_000).toISOString(),
  };

  // Write to BOTH keys so all readers (old & new) find it
  const json = JSON.stringify(subs);
  localStorage.setItem(STORAGE_KEY_SUBS,    json);
  localStorage.setItem(LEGACY_KEY_SUBS,     json);

  return subs[featureId];
}

/** Migrate old sakti_* keys to vistral_* keys (one-time, silent) */
export function migrateStorageKeys() {
  if (!localStorage.getItem(STORAGE_KEY_PRICING) && localStorage.getItem(LEGACY_KEY_PRICING)) {
    localStorage.setItem(STORAGE_KEY_PRICING, localStorage.getItem(LEGACY_KEY_PRICING)!);
  }
  if (!localStorage.getItem(STORAGE_KEY_SUBS) && localStorage.getItem(LEGACY_KEY_SUBS)) {
    localStorage.setItem(STORAGE_KEY_SUBS, localStorage.getItem(LEGACY_KEY_SUBS)!);
  }
}
