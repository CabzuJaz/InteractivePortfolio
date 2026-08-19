import { timingSafeEqual } from "node:crypto";

/**
 * Constant-time string comparison.
 *
 * A plain `===` on a secret leaks its prefix through response timing, which
 * matters here because access codes are short and guessable at scale.
 * Length is compared first because timingSafeEqual throws on a mismatch —
 * that leak is acceptable, since code length is not the secret.
 */
export function safeEqual(a: string, b: string): boolean {
  if (!a || !b) return false;

  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) return false;

  return timingSafeEqual(left, right);
}

/** True when the request carries the server-side admin key. */
export function isAdminRequest(adminKey: string | null): boolean {
  const expected = process.env.DASHBOARD_ADMIN_KEY;
  return Boolean(expected && adminKey && safeEqual(adminKey, expected));
}
