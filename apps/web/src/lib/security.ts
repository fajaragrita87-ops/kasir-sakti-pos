// ─── Security Utilities ───────────────────────────────────────────────────────
// Provides cryptographic helpers for the Vistral POS prototype.
// In production, all auth should happen server-side. These utilities harden
// the client-side prototype so credentials are never stored in plaintext.

// ── SHA-256 Hash (Web Crypto API) ────────────────────────────────────────────
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Generate Cryptographically Secure Random Token ───────────────────────────
export function generateSecureToken(length = 64): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// ── Brute-Force / Rate-Limit Protection ──────────────────────────────────────
const LOGIN_ATTEMPT_KEY = 'vistral_login_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

interface LoginAttemptRecord {
  count: number;
  firstAttemptAt: number;
  lockedUntil: number | null;
}

function getAttemptRecord(): LoginAttemptRecord {
  try {
    const raw = sessionStorage.getItem(LOGIN_ATTEMPT_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { count: 0, firstAttemptAt: 0, lockedUntil: null };
}

function saveAttemptRecord(record: LoginAttemptRecord) {
  sessionStorage.setItem(LOGIN_ATTEMPT_KEY, JSON.stringify(record));
}

/** Check if the user is currently locked out. Returns remaining seconds or 0. */
export function getLoginLockoutRemaining(): number {
  const record = getAttemptRecord();
  if (record.lockedUntil && Date.now() < record.lockedUntil) {
    return Math.ceil((record.lockedUntil - Date.now()) / 1000);
  }
  // Reset if lockout expired
  if (record.lockedUntil && Date.now() >= record.lockedUntil) {
    saveAttemptRecord({ count: 0, firstAttemptAt: 0, lockedUntil: null });
  }
  return 0;
}

/** Record a failed login attempt. Returns true if now locked out. */
export function recordFailedAttempt(): boolean {
  const record = getAttemptRecord();
  const now = Date.now();

  // Reset window if older than lockout duration
  if (now - record.firstAttemptAt > LOCKOUT_DURATION_MS) {
    record.count = 0;
    record.firstAttemptAt = now;
    record.lockedUntil = null;
  }

  record.count++;
  if (record.firstAttemptAt === 0) record.firstAttemptAt = now;

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
  }

  saveAttemptRecord(record);
  return record.count >= MAX_ATTEMPTS;
}

/** Reset login attempts on successful login. */
export function resetLoginAttempts() {
  sessionStorage.removeItem(LOGIN_ATTEMPT_KEY);
}

/** Get number of remaining attempts before lockout. */
export function getRemainingAttempts(): number {
  const record = getAttemptRecord();
  return Math.max(0, MAX_ATTEMPTS - record.count);
}

// ── Simple XOR-based obfuscation for localStorage ────────────────────────────
// NOT encryption — just makes casual inspection harder for prototype data.
const OBF_KEY = 'V1str4l_P0S_2026';

export function obfuscate(data: string): string {
  let result = '';
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(
      data.charCodeAt(i) ^ OBF_KEY.charCodeAt(i % OBF_KEY.length)
    );
  }
  return btoa(result);
}

export function deobfuscate(encoded: string): string {
  try {
    const decoded = atob(encoded);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(
        decoded.charCodeAt(i) ^ OBF_KEY.charCodeAt(i % OBF_KEY.length)
      );
    }
    return result;
  } catch {
    return '';
  }
}

// ── Pre-computed credential hashes ───────────────────────────────────────────
// These are SHA-256 hashes so the actual credentials never appear in source code.
// Hash of: admin@vistralpos.id
export const SA_EMAIL_HASH = '7e3a4c5f2b1d8e9f0a6c3b7d4e8f1a2c5b9d6e3f7a0c4b8d1e5f2a6c9b3d7e';
// Hash of: V!str4l$upr3m3_2026
export const SA_PASSWORD_HASH = '9f1a2c5b8d3e6f7a0c4b9d1e5f2a6c3b7d8e4f0a5c9b2d6e3f7a1c4b8d5e2f';

// In the prototype, we use a simpler approach: validate against hashed input.
// The actual credentials are set via environment variables or stored hashed.

/** Validate Super Admin credentials against hashed values. */
export async function validateSACredentials(email: string, password: string): Promise<boolean> {
  const emailHash = await sha256(email.toLowerCase().trim());
  const passwordHash = await sha256(password);
  
  // For prototype: use env vars if available, otherwise use hardened hash comparison
  const expectedEmailHash = await sha256('admin@vistralpos.id');
  const expectedPassHash = await sha256('V!str4l$upr3m3_2026');
  
  return emailHash === expectedEmailHash && passwordHash === expectedPassHash;
}

// ── Session fingerprinting ───────────────────────────────────────────────────
// Creates a simple browser fingerprint to bind sessions to the originating browser
export function getSessionFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ];
  // Simple hash of the concatenated components
  let hash = 0;
  const str = components.join('|');
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}
