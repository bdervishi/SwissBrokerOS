import crypto from 'crypto';

/**
 * AES-256-GCM encryption for tokens at rest (tenant_integrations.encrypted_credentials).
 * Key comes from ENCRYPTION_KEY (32-byte value, hex or base64 or raw 32 chars).
 * If no key is configured, falls back to passthrough (dev) – logged once.
 */

function getKey(): Buffer | null {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) return null;
  if (/^[0-9a-fA-F]{64}$/.test(raw)) return Buffer.from(raw, 'hex');
  const b64 = Buffer.from(raw, 'base64');
  if (b64.length === 32) return b64;
  if (raw.length === 32) return Buffer.from(raw, 'utf8');
  // Derive a stable 32-byte key from an arbitrary secret.
  return crypto.createHash('sha256').update(raw).digest();
}

const KEY = getKey();
let warned = false;
function warnOnce() {
  if (!warned) { console.warn('[crypto] ENCRYPTION_KEY not set – integration tokens stored UNENCRYPTED.'); warned = true; }
}

// Encrypt an object -> a tagged envelope { v, iv, tag, data }.
export function encryptJson(obj: unknown): any {
  if (!KEY) { warnOnce(); return obj; }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const plaintext = Buffer.from(JSON.stringify(obj), 'utf8');
  const enc = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { v: 1, iv: iv.toString('base64'), tag: tag.toString('base64'), data: enc.toString('base64') };
}

// Decrypt an envelope back to the object. Plain objects (legacy/unencrypted) pass through.
export function decryptJson(envelope: any): any {
  if (!envelope || typeof envelope !== 'object') return envelope;
  if (envelope.v !== 1 || !envelope.iv || !envelope.data) return envelope; // not encrypted
  if (!KEY) { warnOnce(); return envelope; }
  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, Buffer.from(envelope.iv, 'base64'));
    decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));
    const dec = Buffer.concat([decipher.update(Buffer.from(envelope.data, 'base64')), decipher.final()]);
    return JSON.parse(dec.toString('utf8'));
  } catch (e) {
    console.error('[crypto] decrypt failed:', (e as Error).message);
    return null;
  }
}

// ---- signed OAuth state (HMAC + expiry) ---------------------------------
const STATE_SECRET = process.env.STATE_SECRET || process.env.ENCRYPTION_KEY || 'dev-state-secret';

export function signState(payload: Record<string, any>, ttlMs = 10 * 60_000): string {
  const body = { ...payload, exp: Date.now() + ttlMs };
  const json = Buffer.from(JSON.stringify(body)).toString('base64url');
  const sig = crypto.createHmac('sha256', STATE_SECRET).update(json).digest('base64url');
  return `${json}.${sig}`;
}

export function verifyState(state: string): Record<string, any> | null {
  const [json, sig] = String(state || '').split('.');
  if (!json || !sig) return null;
  const expected = crypto.createHmac('sha256', STATE_SECRET).update(json).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const body = JSON.parse(Buffer.from(json, 'base64url').toString());
    if (!body.exp || Date.now() > body.exp) return null;
    return body;
  } catch {
    return null;
  }
}
