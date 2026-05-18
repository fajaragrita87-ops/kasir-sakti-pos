// ─── Registration Notification Service ───────────────────────────────────────
// Simulates WA/Email notifications on new user registration.
// All data persisted in localStorage for this frontend-only prototype.

export interface RegistrationRecord {
  id: string;
  name: string;
  phone: string;         // nomor WA
  email: string;
  businessName: string;
  registeredAt: string;  // ISO string
  isRead: boolean;
  notifWA: boolean;
  notifEmail: boolean;
}

const STORAGE_KEY = 'vistral_registrations';

/** Retrieve all registration records */
export function getRegistrations(): RegistrationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Count unread registrations */
export function getUnreadCount(): number {
  return getRegistrations().filter(r => !r.isRead).length;
}

/** Add a new registration and fire simulated WA + Email notifications */
export function addRegistration(
  data: Omit<RegistrationRecord, 'id' | 'registeredAt' | 'isRead' | 'notifWA' | 'notifEmail'>
): RegistrationRecord {
  const record: RegistrationRecord = {
    ...data,
    id: `reg_${Date.now()}`,
    registeredAt: new Date().toISOString(),
    isRead: false,
    notifWA: true,
    notifEmail: true,
  };

  const existing = getRegistrations();
  existing.unshift(record); // newest first
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

  // ─── Simulasi WA & Email ──────────────────────────────────────
  console.log(`[WA Notif] 📱 Pengguna baru terdaftar!\nNama: ${record.name}\nHP: ${record.phone}\nBisnis: ${record.businessName}\nWaktu: ${new Date(record.registeredAt).toLocaleString('id-ID')}`);
  console.log(`[Email Notif] ✉️ New merchant signup!\nEmail: ${record.email}\nBusiness: ${record.businessName}`);

  return record;
}

/** Mark a registration as read */
export function markAsRead(id: string): void {
  const list = getRegistrations().map(r => r.id === id ? { ...r, isRead: true } : r);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/** Mark all as read */
export function markAllAsRead(): void {
  const list = getRegistrations().map(r => ({ ...r, isRead: true }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/** Delete a registration record */
export function deleteRegistration(id: string): void {
  const list = getRegistrations().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/** Clear any existing dummy data for production-readiness */
export function seedDemoRegistrations(): void {
  // We no longer seed dummy data. 
  // If there are existing 'demo_' records, we clear them to ensure a clean canvas.
  const existing = getRegistrations();
  if (existing.some(r => r.id.startsWith('demo_'))) {
    const clean = existing.filter(r => !r.id.startsWith('demo_'));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  }
}
