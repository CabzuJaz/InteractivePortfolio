import { createHmac } from "node:crypto";
import { safeEqual } from "@/lib/dashboard/auth";

export const BUG_MAN_COOKIE = "bug-man-session";

function passphrase(): string {
  return process.env.BUG_MAN_PASSWORD?.trim() || "";
}

/**
 * Stateless session value: an HMAC keyed by the passphrase itself.
 *
 * A valid cookie therefore proves the passphrase was presented once, without
 * the passphrase ever being stored or sent back to the browser. Rotating
 * BUG_MAN_PASSWORD changes the key, which invalidates every session already
 * handed out — so revoking access is a single env var change.
 */
export function sessionToken(): string {
  const secret = passphrase();
  if (!secret) return "";
  return createHmac("sha256", secret).update("bug-man-phase-1").digest("hex");
}

/** True when the cookie presented by the browser matches the current passphrase. */
export function isUnlocked(token: string | undefined | null): boolean {
  const expected = sessionToken();
  return Boolean(expected && token && safeEqual(token, expected));
}

/** True when a submitted passphrase matches the configured one. */
export function isPassphrase(candidate: string): boolean {
  const secret = passphrase();
  return Boolean(secret && candidate && safeEqual(candidate, secret));
}
