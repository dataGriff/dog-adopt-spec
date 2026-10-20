// Small helpers every service needs for service-token checks and
// idempotency. Kept here so the API and finder share one implementation.

/** Constant-time comparison of two strings as UTF-8 bytes. */
export function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  let diff = ab.length ^ bb.length;
  const len = Math.max(ab.length, bb.length, 1);
  for (let i = 0; i < len; i++) diff |= (ab[i % Math.max(ab.length, 1)] ?? 0) ^ (bb[i % Math.max(bb.length, 1)] ?? 0);
  return diff === 0;
}

/** True when `header` is `Bearer <token>` and the token matches `expected` in constant time. */
export function bearerMatches(header: string | null | undefined, expected: string | undefined): boolean {
  if (!header || !expected) return false;
  const [scheme, ...rest] = header.trim().split(/\s+/);
  if (scheme?.toLowerCase() !== 'bearer' || rest.length !== 1) return false;
  return timingSafeEqual(rest[0]!, expected);
}

/** Stable JSON (sorted object keys) so the same body always hashes the same. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort()
        .map((k) => [k, sortKeys((value as Record<string, unknown>)[k])]),
    );
  }
  return value;
}

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
