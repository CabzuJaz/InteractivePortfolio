import { NextRequest, NextResponse } from "next/server";
import type { Deliverable, ProjectData } from "@/lib/types";
import { GHL_BASE, ghlHeaders } from "@/lib/ghl/client";
import {
  dashboardProjectMetadata,
  dashboardProjectSlugs,
  localDashboardProjects,
} from "@/data/dashboard-projects";

const GHL_HEADERS = ghlHeaders();

/**
 * Find contact by email and get project data from custom fields.
 * Returns a fallback project if GHL is unavailable.
 */
async function getProjectByEmail(email: string): Promise<ProjectData | null> {
  const normalizedEmail = email.toLowerCase();
  const localProject = localDashboardProjects[normalizedEmail];
  if (localProject) return localProject;
  const metadata = dashboardProjectMetadata[normalizedEmail];

  const locationId = process.env.GHL_LOCATION_ID;
  if (!locationId) return metadata ? createMetadataProject(email, metadata) : createFallbackProject(email);

  try {
    const res = await fetch(
      `${GHL_BASE}/contacts/?locationId=${locationId}&query=${encodeURIComponent(email)}&limit=1`,
      { headers: GHL_HEADERS },
    );
    if (!res.ok) return createFallbackProject(email);

    const data = await res.json();
    const contact = data.contacts?.[0];
    if (!contact) return null;

    // Check for project data in custom fields or tags
    const tags: string[] = contact.tags || [];
    const downpaymentPaid = tags.includes("downpayment-paid");
    const finalPaymentPaid = tags.includes("final-payment-paid");

    // Get deliverables from contact notes (latest note with "DELIVERABLES:" prefix)
    let deliverables: Deliverable[] = [];
    try {
      const notesRes = await fetch(
        `${GHL_BASE}/contacts/${contact.id}/notes`,
        { headers: GHL_HEADERS },
      );
      if (notesRes.ok) {
        const notesData = await notesRes.json();
        const deliverableNote = notesData.notes?.find((n: { body: string }) =>
          n.body?.startsWith("DELIVERABLES:"),
        );
        if (deliverableNote) {
          const jsonStr = deliverableNote.body.replace("DELIVERABLES:", "");
          deliverables = JSON.parse(jsonStr);
        }
      }
    } catch {
      // No deliverables set yet
    }

    // Get project name from opportunity or use defaults/metadata
    let projectName = metadata?.projectName ?? "Automation Project";
    const description = metadata?.description ?? "";
    let totalCost = metadata?.totalCost ?? 0;

    try {
      const oppRes = await fetch(
        `${GHL_BASE}/opportunities/search?location_id=${locationId}&q=${encodeURIComponent(email)}`,
        { headers: GHL_HEADERS },
      );
      if (oppRes.ok) {
        const oppData = await oppRes.json();
        const opp = oppData.opportunities?.[0];
        if (opp) {
          projectName = opp.name || projectName;
          totalCost = opp.monetary_value || opp.monetaryValue || totalCost;
        }
      }
    } catch {
      // Use defaults
    }

    return {
      contactId: contact.id,
      clientName:
        metadata?.clientName ||
        `${contact.firstName || ""} ${contact.lastName || ""}`.trim() ||
        "Client",
      clientEmail: contact.email || email,
      projectName,
      description,
      totalCost,
      ...(metadata?.amountPaid !== undefined ? { amountPaid: metadata.amountPaid } : {}),
      ...(metadata?.balanceDue !== undefined ? { balanceDue: metadata.balanceDue } : {}),
      downpaymentPaid: metadata?.downpaymentPaid ?? downpaymentPaid,
      finalPaymentPaid: metadata?.finalPaymentPaid ?? finalPaymentPaid,
      deliverables: deliverables.length > 0 ? deliverables : metadata?.deliverables ?? [],
      createdAt: contact.dateAdded || new Date().toISOString(),
      updatedAt: contact.dateUpdated || new Date().toISOString(),
    };
  } catch (err) {
    // GHL is down — return fallback
    console.error("[dashboard] GHL error, returning fallback:", err);
    return metadata ? createMetadataProject(email, metadata) : createFallbackProject(email);
  }
}

function createMetadataProject(
  email: string,
  metadata: NonNullable<(typeof dashboardProjectMetadata)[string]>,
): ProjectData {
  return {
    contactId: "",
    clientName: metadata.clientName,
    clientEmail: email,
    projectName: metadata.projectName,
    description: metadata.description,
    totalCost: metadata.totalCost,
    ...(metadata.amountPaid !== undefined ? { amountPaid: metadata.amountPaid } : {}),
    ...(metadata.balanceDue !== undefined ? { balanceDue: metadata.balanceDue } : {}),
    downpaymentPaid: metadata.downpaymentPaid,
    finalPaymentPaid: metadata.finalPaymentPaid,
    deliverables: metadata.deliverables,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Creates a fallback project when GHL is unavailable.
 * Shows a basic dashboard so the client doesn't see an error.
 */
function createFallbackProject(email: string): ProjectData {
  return {
    contactId: "",
    clientName: email.split("@")[0] || "Client",
    clientEmail: email,
    projectName: "Project Dashboard",
    description: "Your project details will appear here once the system syncs.",
    totalCost: 0,
    downpaymentPaid: false,
    finalPaymentPaid: false,
    deliverables: [
      {
        id: "pending",
        title: "Project setup in progress",
        description: "Your deliverables will appear here soon.",
        status: "pending",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Save deliverables to contact notes.
 */
async function saveDeliverables(
  contactId: string,
  deliverables: Deliverable[],
): Promise<void> {
  // Find existing deliverable note
  const notesRes = await fetch(`${GHL_BASE}/contacts/${contactId}/notes`, {
    headers: GHL_HEADERS,
  });
  if (!notesRes.ok) {
    throw new Error(`Failed to fetch contact notes (${notesRes.status})`);
  }

  const notesData = await notesRes.json();
  const existingNote = notesData.notes?.find((n: { body: string }) =>
    n.body?.startsWith("DELIVERABLES:"),
  );

  const noteBody = `DELIVERABLES:${JSON.stringify(deliverables)}`;

  if (existingNote) {
    // Update existing note
    const updateRes = await fetch(`${GHL_BASE}/contacts/${contactId}/notes/${existingNote.id}`, {
      method: "PUT",
      headers: GHL_HEADERS,
      body: JSON.stringify({ body: noteBody }),
    });
    if (!updateRes.ok) {
      throw new Error(`Failed to update deliverables note (${updateRes.status})`);
    }
  } else {
    // Create new note
    const createRes = await fetch(`${GHL_BASE}/contacts/${contactId}/notes`, {
      method: "POST",
      headers: GHL_HEADERS,
      body: JSON.stringify({ body: noteBody }),
    });
    if (!createRes.ok) {
      throw new Error(`Failed to create deliverables note (${createRes.status})`);
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug")?.toLowerCase();
    const email = searchParams.get("email") ?? (slug ? dashboardProjectSlugs[slug] : null);

    if (!email) {
      return NextResponse.json(
        { error: "email or slug parameter required" },
        { status: 400 },
      );
    }

    const project = await getProjectByEmail(email);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (err) {
    console.error("[dashboard] GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  // Server-side admin auth
  const adminKey = req.headers.get("x-admin-key");
  if (!adminKey || adminKey !== process.env.DASHBOARD_ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { contactId, deliverables } = body;

    if (!contactId || !Array.isArray(deliverables)) {
      return NextResponse.json(
        { error: "contactId and deliverables array required" },
        { status: 400 },
      );
    }

    // Validate deliverable structure
    for (const d of deliverables) {
      if (!d.id || !d.title || !["pending", "in-progress", "completed"].includes(d.status)) {
        return NextResponse.json(
          { error: "Invalid deliverable structure" },
          { status: 400 },
        );
      }
    }

    await saveDeliverables(contactId, deliverables);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[dashboard] PUT error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
