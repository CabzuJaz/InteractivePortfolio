import type { Deliverable, ProjectData } from "@/lib/types";

/**
 * Client dashboard content is confidential, so it is never committed to this
 * repository. It is supplied at runtime via the `DASHBOARD_PROJECTS_JSON`
 * environment variable (set it in Vercel, and in `.env.local` for development).
 *
 * Shape — see `.env.example` for a filled-in sample:
 *
 * {
 *   "projects": [
 *     {
 *       "slug": "acme-co",              // optional: enables /client/acme-co
 *       "email": "client@example.com",  // lookup key, required
 *       "local": false,                 // true = serve as-is, skip the GHL lookup
 *       "clientName": "...",
 *       "projectName": "...",
 *       "description": "...",
 *       "totalCost": 0,
 *       "downpaymentPaid": true,
 *       "finalPaymentPaid": false,
 *       "deliverables": [
 *         { "id": "...", "title": "...", "description": "...", "status": "pending" }
 *       ]
 *     }
 *   ]
 * }
 *
 * A missing or malformed value is not fatal: the dashboard falls back to the
 * live GHL lookup, exactly as it does for a client with no local entry.
 */

export type DashboardProjectMetadata = Pick<
  ProjectData,
  | "clientName"
  | "projectName"
  | "description"
  | "totalCost"
  | "amountPaid"
  | "balanceDue"
  | "downpaymentPaid"
  | "finalPaymentPaid"
  | "deliverables"
>;

const DELIVERABLE_STATUSES: ReadonlySet<string> = new Set([
  "pending",
  "in-progress",
  "completed",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function parseDeliverables(value: unknown): Deliverable[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry): Deliverable[] => {
    if (!isRecord(entry)) return [];

    const id = asString(entry.id);
    const title = asString(entry.title);
    if (!id || !title) return [];

    const status = asString(entry.status, "pending");
    const completedAt = asString(entry.completedAt);
    const estimatedTime = asString(entry.estimatedTime);
    const parentId = asString(entry.parentId);

    return [
      {
        id,
        title,
        description: asString(entry.description),
        status: DELIVERABLE_STATUSES.has(status)
          ? (status as Deliverable["status"])
          : "pending",
        ...(estimatedTime ? { estimatedTime } : {}),
        ...(parentId ? { parentId } : {}),
        ...(entry.rollsUp === true ? { rollsUp: true } : {}),
        ...(completedAt ? { completedAt } : {}),
      },
    ];
  });
}

function parseMetadata(entry: Record<string, unknown>): DashboardProjectMetadata {
  return {
    clientName: asString(entry.clientName, "Client"),
    projectName: asString(entry.projectName, "Automation Project"),
    description: asString(entry.description),
    totalCost: asNumber(entry.totalCost),
    ...(typeof entry.amountPaid === "number" ? { amountPaid: entry.amountPaid } : {}),
    ...(typeof entry.balanceDue === "number" ? { balanceDue: entry.balanceDue } : {}),
    downpaymentPaid: asBoolean(entry.downpaymentPaid),
    finalPaymentPaid: asBoolean(entry.finalPaymentPaid),
    deliverables: parseDeliverables(entry.deliverables),
  };
}

interface ParsedDashboardProjects {
  slugs: Record<string, string>;
  metadata: Record<string, DashboardProjectMetadata>;
  local: Record<string, ProjectData>;
}

function parseDashboardProjects(raw: string | undefined): ParsedDashboardProjects {
  const empty: ParsedDashboardProjects = { slugs: {}, metadata: {}, local: {} };
  if (!raw) return empty;

  // Accepts raw JSON or base64-encoded JSON. Base64 is the safer form for
  // `.env` files and shells, since the content contains both quote characters.
  const trimmed = raw.trim();
  const json = trimmed.startsWith("{")
    ? trimmed
    : Buffer.from(trimmed, "base64").toString("utf8");

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    console.warn("DASHBOARD_PROJECTS_JSON is not valid JSON or base64 JSON — ignoring it.");
    return empty;
  }

  if (!isRecord(parsed) || !Array.isArray(parsed.projects)) {
    console.warn("DASHBOARD_PROJECTS_JSON has no `projects` array — ignoring it.");
    return empty;
  }

  const result: ParsedDashboardProjects = { slugs: {}, metadata: {}, local: {} };

  for (const entry of parsed.projects) {
    if (!isRecord(entry)) continue;

    const email = asString(entry.email).toLowerCase();
    if (!email) continue;

    const metadata = parseMetadata(entry);
    result.metadata[email] = metadata;

    const slug = asString(entry.slug).toLowerCase();
    if (slug) result.slugs[slug] = email;

    if (asBoolean(entry.local)) {
      const now = new Date().toISOString();
      result.local[email] = {
        ...metadata,
        contactId: asString(entry.contactId),
        clientEmail: email,
        createdAt: asString(entry.createdAt, now),
        updatedAt: asString(entry.updatedAt, now),
      };
    }
  }

  return result;
}

const dashboardProjects = parseDashboardProjects(process.env.DASHBOARD_PROJECTS_JSON);

/** Public slug (`/client/<slug>`) → client email. */
export const dashboardProjectSlugs: Record<string, string> = dashboardProjects.slugs;

/** Client email → metadata layered over the live GHL lookup. */
export const dashboardProjectMetadata: Record<string, DashboardProjectMetadata> =
  dashboardProjects.metadata;

/** Client email → complete project served without touching GHL. */
export const localDashboardProjects: Record<string, ProjectData> = dashboardProjects.local;
