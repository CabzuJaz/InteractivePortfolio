import { NextRequest, NextResponse } from "next/server";
import { GHL_BASE, ghlHeaders } from "@/lib/ghl/client";

const GHL_HEADERS = ghlHeaders();

interface PrepAnswer {
  label: string;
  value: string;
}

interface PrepPayload {
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  answers: PrepAnswer[];
  pageUrl: string;
  submittedAt: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function findOrCreateContact(
  email: string,
  name: string,
  phone?: string,
): Promise<string | null> {
  const locationId = process.env.GHL_LOCATION_ID;
  if (!locationId || !email) return null;

  // Try to find existing
  const searchRes = await fetch(
    `${GHL_BASE}/contacts/?locationId=${locationId}&query=${encodeURIComponent(email)}&limit=1`,
    { headers: GHL_HEADERS },
  );
  if (searchRes.ok) {
    const data = await searchRes.json();
    const existing = data.contacts?.[0]?.id;
    if (existing) return existing;
  }

  // Create new
  const nameParts = name.trim().split(/\s+/);
  const firstName = nameParts[0] || "Client";
  const lastName = nameParts.slice(1).join(" ") || undefined;

  const contactPayload: Record<string, unknown> = {
    locationId,
    firstName,
    lastName,
    email,
    source: "Prep Sheet",
    tags: ["prep-sheet"],
  };
  if (phone) contactPayload.phone = phone;

  const createRes = await fetch(`${GHL_BASE}/contacts/`, {
    method: "POST",
    headers: GHL_HEADERS,
    body: JSON.stringify(contactPayload),
  });

  if (!createRes.ok) return null;
  const createData = await createRes.json();
  return createData.contact?.id ?? null;
}

async function addNote(contactId: string, payload: PrepPayload): Promise<void> {
  const answersText = payload.answers
    .map((a) => `**${escapeHtml(a.label)}**\n${escapeHtml(a.value)}`)
    .join("\n\n");

  const noteBody = [
    `📋 **Lead Automation Prep Sheet**`,
    `📅 ${new Date(payload.submittedAt).toLocaleString()}`,
    payload.pageUrl ? `🔗 ${payload.pageUrl}` : "",
    ``,
    `---`,
    ``,
    answersText,
  ]
    .filter(Boolean)
    .join("\n");

  await fetch(`${GHL_BASE}/contacts/${contactId}/notes`, {
    method: "POST",
    headers: GHL_HEADERS,
    body: JSON.stringify({ body: noteBody }),
  });
}

async function addTag(contactId: string, tag: string): Promise<void> {
  await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
    method: "POST",
    headers: GHL_HEADERS,
    body: JSON.stringify({ tags: [tag] }),
  });
}


async function notifyDiscord(payload: PrepPayload): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const topAnswers = payload.answers.slice(0, 3).map((a) => ({
    name: a.label.slice(0, 25),
    value: a.value.slice(0, 100),
    inline: false,
  }));

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [
        {
          title: "📋 Prep Sheet Submitted",
          color: 0x06b6d4,
          fields: [
            { name: "Client", value: payload.clientName || "Unknown", inline: true },
            { name: "Email", value: payload.clientEmail || "Not provided", inline: true },
            { name: "Phone", value: payload.clientPhone || "Not provided", inline: true },
            { name: "Answers", value: `${payload.answers.length} questions answered`, inline: true },
            { name: "Submitted", value: new Date(payload.submittedAt).toLocaleString(), inline: true },
            ...topAnswers,
          ],
          footer: { text: "BuildWithJazz.com" },
        },
      ],
    }),
  }).catch(() => {});
}

export async function POST(req: NextRequest) {
  try {
    const body: PrepPayload = await req.json();

    // Validate
    if (!body.answers || !Array.isArray(body.answers) || body.answers.length === 0) {
      return NextResponse.json(
        { error: "At least one answer is required" },
        { status: 400 },
      );
    }

    const email = body.clientEmail?.trim();
    const name = body.clientName?.trim() || "Client";

    // GHL integration
    let contactId: string | null = null;
    if (email) {
      contactId = await findOrCreateContact(email, name, body.clientPhone);
      if (contactId) {
        await Promise.allSettled([
          addNote(contactId, body),
          addTag(contactId, "prep-sheet-submitted"),
        ]);
      }
    }

    // Discord ping for the owner — fire-and-forget. The client's copy is sent
    // by the GHL workflow that watches for the "prep-sheet-submitted" tag.
    notifyDiscord(body).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[prep-intake] Error:", err);
    return NextResponse.json(
      { error: "Failed to process submission" },
      { status: 500 },
    );
  }
}
