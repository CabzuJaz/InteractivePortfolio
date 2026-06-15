import { NextRequest, NextResponse } from "next/server";

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_HEADERS = {
  Authorization: `Bearer ${process.env.GHL_API_KEY}`,
  "Content-Type": "application/json",
  Version: "2021-07-28",
};

interface Deliverable {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  completedAt?: string;
}

interface ProjectData {
  contactId: string;
  clientName: string;
  clientEmail: string;
  projectName: string;
  description: string;
  totalCost: number;
  downpaymentPaid: boolean;
  finalPaymentPaid: boolean;
  deliverables: Deliverable[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Find contact by email and get project data from custom fields.
 */
async function getProjectByEmail(email: string): Promise<ProjectData | null> {
  const locationId = process.env.GHL_LOCATION_ID;
  if (!locationId) return null;

  const res = await fetch(
    `${GHL_BASE}/contacts/?locationId=${locationId}&query=${encodeURIComponent(email)}&limit=1`,
    { headers: GHL_HEADERS },
  );
  if (!res.ok) return null;

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

  // Get project name from opportunity or use default
  let projectName = "Automation Project";
  const description = "";
  let totalCost = 0;

  try {
    const oppRes = await fetch(
      `${GHL_BASE}/opportunities/search`,
      {
        method: "POST",
        headers: GHL_HEADERS,
        body: JSON.stringify({
          location_id: process.env.GHL_LOCATION_ID,
          contact_id: contact.id,
        }),
      },
    );
    if (oppRes.ok) {
      const oppData = await oppRes.json();
      const opp = oppData.opportunities?.[0];
      if (opp) {
        projectName = opp.name || projectName;
        totalCost = opp.monetary_value || totalCost;
      }
    }
  } catch {
    // Use defaults
  }

  return {
    contactId: contact.id,
    clientName: `${contact.firstName || ""} ${contact.lastName || ""}`.trim() || "Client",
    clientEmail: contact.email || email,
    projectName,
    description,
    totalCost,
    downpaymentPaid,
    finalPaymentPaid,
    deliverables,
    createdAt: contact.dateAdded || new Date().toISOString(),
    updatedAt: contact.dateUpdated || new Date().toISOString(),
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
  if (!notesRes.ok) return;

  const notesData = await notesRes.json();
  const existingNote = notesData.notes?.find((n: { body: string }) =>
    n.body?.startsWith("DELIVERABLES:"),
  );

  const noteBody = `DELIVERABLES:${JSON.stringify(deliverables)}`;

  if (existingNote) {
    // Update existing note
    await fetch(`${GHL_BASE}/contacts/${contactId}/notes/${existingNote.id}`, {
      method: "PUT",
      headers: GHL_HEADERS,
      body: JSON.stringify({ body: noteBody }),
    });
  } else {
    // Create new note
    await fetch(`${GHL_BASE}/contacts/${contactId}/notes`, {
      method: "POST",
      headers: GHL_HEADERS,
      body: JSON.stringify({ body: noteBody }),
    });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const projectId = searchParams.get("projectId");

  if (!email && !projectId) {
    return NextResponse.json(
      { error: "email or projectId required" },
      { status: 400 },
    );
  }

  const project = await getProjectByEmail(email || projectId || "");
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ project });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { contactId, deliverables } = body;

  if (!contactId || !deliverables) {
    return NextResponse.json(
      { error: "contactId and deliverables required" },
      { status: 400 },
    );
  }

  await saveDeliverables(contactId, deliverables);

  return NextResponse.json({ ok: true });
}
