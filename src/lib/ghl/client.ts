/**
 * Shared GoHighLevel API access.
 *
 * The base URL and auth headers were previously repeated across five files,
 * which made the API version easy to get wrong. Version is a parameter rather
 * than a constant for a real reason: most endpoints take 2021-07-28, but
 * POST /conversations/messages accepts only 2021-04-15 — that is the sole
 * value in the enum in HighLevel's published OpenAPI spec, so sending the
 * newer version there is rejected.
 *
 * Multipart uploads must omit Content-Type so fetch can set the boundary
 * itself; pass `json: false` for those.
 */

export const GHL_BASE = "https://services.leadconnectorhq.com";

/** Version accepted by contacts, opportunities, notes, and media endpoints. */
export const GHL_VERSION = "2021-07-28";

/** The only version POST /conversations/messages accepts. */
export const GHL_CONVERSATIONS_VERSION = "2021-04-15";

interface GhlHeaderOptions {
  /** Send `Content-Type: application/json`. Omit for multipart uploads. */
  json?: boolean;
  /** Defaults to GHL_VERSION. */
  version?: string;
}

export function ghlHeaders(options: GhlHeaderOptions = {}): Record<string, string> {
  const { json = true, version = GHL_VERSION } = options;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${process.env.GHL_API_KEY}`,
    Version: version,
  };

  if (json) headers["Content-Type"] = "application/json";

  return headers;
}

/** True when both credentials needed for any GHL call are present. */
export function isGhlConfigured(): boolean {
  return Boolean(process.env.GHL_LOCATION_ID && process.env.GHL_API_KEY);
}
