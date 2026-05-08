// COIN PRICING & FEATURE RULES (Patch 3)

export const COIN_PRICE = 1000; // 1 koin = Rp 1.000

export const TOPUP_PACKAGES = [
  { name: 'Starter',    coins: 5,   price: 5_000,   pricePerCoin: 1000, bonus: 0    },
  { name: 'Basic',      coins: 11,  price: 10_000,  pricePerCoin: 909,  bonus: 10   },
  { name: 'Plus',       coins: 25,  price: 22_000,  pricePerCoin: 880,  bonus: 12   },
  { name: 'Pro',        coins: 55,  price: 45_000,  pricePerCoin: 818,  bonus: 18   },
  { name: 'Business',   coins: 120, price: 90_000,  pricePerCoin: 750,  bonus: 25   },
  { name: 'Enterprise', coins: 260, price: 180_000, pricePerCoin: 692,  bonus: 31   },
];

export const FEATURE_PRICING = {
  // GRATIS SELAMANYA
  pos_core:              'FREE',
  print_receipt:         'FREE',
  history_7days:         'FREE',
  wallet_management:     'FREE',

  // LAPORAN
  laporan_harian:        { perAkses: 1  },
  laporan_mingguan:      { perAkses: 5  },
  laporan_bulanan:       { perAkses: 18 },
  export_harian:         { once: 1      },
  export_bulanan:        { once: 5      },
  report_wa_otomatis:    { perHari: 1  },

  // INVENTORI
  inventori_stok:        { perHari: 1 },
  barcode_scan:          { perHari: 1 },
  laporan_inventori:     { once: 5    },

  // PIUTANG
  piutang_management:    { perHari: 1 },
  piutang_reminder_wa:   { perHari: 1 },

  // HRD & PAYROLL
  hrd_karyawan:          { perHari: 1  },
  proses_gaji:           { perRun: 18  },

  // CRM
  crm_dashboard:         { perHari: 1  },
  broadcast_wa:          { perBroadcast: 5 },

  // AI MENU GENERATOR (Patch 12)
  ai_menu_generate:      { once: 20 },
  ai_menu_revision:      { once: 5  },
  ai_menu_download:      { once: 2  },

  // ANTI ANTRI (QR ORDER) - Rp 1.000 / transaksi
  anti_antri_fee:        1000,
};

export const PLATFORM_FEE = {
  qris_ewallet: 200,
  anti_antri: 1000,
};
