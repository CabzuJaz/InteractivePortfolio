import { NextRequest, NextResponse } from "next/server";

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_HEADERS = {
  Authorization: `Bearer ${process.env.GHL_API_KEY}`,
  "Content-Type": "application/json",
  Version: "2021-07-28",
};

interface PrepAnswer {
  label: string;
  value: string;
}

interface PrepPayload {
  clientId: string;
  clientName: string;
  clientEmail: string;
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

  const createRes = await fetch(`${GHL_BASE}/contacts/`, {
    method: "POST",
    headers: GHL_HEADERS,
    body: JSON.stringify({
      locationId,
      firstName,
      lastName,
      email,
      source: "Prep Sheet",
      tags: ["prep-sheet"],
    }),
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
    inline: true,
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
            {
              name: "Client",
              value: payload.clientName || "Unknown",
              inline: true,
            },
            {
              name: "Email",
              value: payload.clientEmail || "Not provided",
              inline: true,
            },
            {
              name: "Answers",
              value: `${payload.answers.length} questions answered`,
              inline: true,
            },
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
    if (email) {
      const contactId = await findOrCreateContact(email, name);
      if (contactId) {
        await Promise.allSettled([
          addNote(contactId, body),
          addTag(contactId, "prep-sheet-submitted"),
        ]);
      }
    }

    // Discord notification (fire-and-forget)
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
