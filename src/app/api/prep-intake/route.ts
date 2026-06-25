import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const OWNER_EMAIL = "jazzmincabizares@gmail.com";
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

async function sendWhatsApp(
  contactId: string,
  clientName: string,
  dashboardUrl: string,
): Promise<void> {
  const locationId = process.env.GHL_LOCATION_ID;
  if (!locationId) return;

  // Get contact to find phone number
  const contactRes = await fetch(
    `${GHL_BASE}/contacts/${contactId}`,
    { headers: GHL_HEADERS },
  );
  if (!contactRes.ok) return;

  const contactData = await contactRes.json();
  const phone = contactData.contact?.phone;
  if (!phone) return;

  // Send WhatsApp message via GHL
  const message = `Hi ${clientName}! 👋\n\nThank you for filling out the prep sheet. I've created a project dashboard for you where you can track progress and see deliverables.\n\n📊 Your Dashboard: ${dashboardUrl}\n\nI'll review your answers and get back to you with a recommendation soon.\n\n— Jazzmin\nBuildWithJazz.com`;

  await fetch(`${GHL_BASE}/conversations/messages`, {
    method: "POST",
    headers: GHL_HEADERS,
    body: JSON.stringify({
      type: "SMS",
      contactId,
      message,
      phone,
    }),
  }).catch(() => {});
}

async function sendEmailToOwner(payload: PrepPayload, dashboardUrl: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const resend = new Resend(apiKey);

  const answersHtml = payload.answers
    .map(
      (a) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#6b7280;font-weight:600;vertical-align:top;width:40%">
          ${escapeHtml(a.label)}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#374151">
          ${escapeHtml(a.value).replace(/\n/g, "<br>")}
        </td>
      </tr>`,
    )
    .join("");

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:700px;margin:0 auto">
      <h2 style="color:#06b6d4">📋 Prep Sheet Submitted</h2>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#6b7280">Client</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600">${escapeHtml(payload.clientName || "Unknown")}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#6b7280">Email</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600">${escapeHtml(payload.clientEmail || "Not provided")}</td>
        </tr>
        ${
          payload.clientPhone
            ? `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#6b7280">Phone</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600">${escapeHtml(payload.clientPhone)}</td></tr>`
            : ""
        }
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#6b7280">Dashboard</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee"><a href="${dashboardUrl}" style="color:#06b6d4">${dashboardUrl}</a></td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#6b7280">Submitted</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee">${new Date(payload.submittedAt).toLocaleString()}</td>
        </tr>
      </table>

      <h3 style="color:#374151;margin-top:24px">Answers</h3>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        ${answersHtml}
      </table>

      <p style="color:#9ca3af;font-size:12px;margin-top:24px;border-top:1px solid #eee;padding-top:12px">
        Sent from BuildWithJazz.com — Prep Sheet
      </p>
    </div>
  `;

  await resend.emails.send({
    from: "Jazzmin <onboarding@resend.dev>",
    to: OWNER_EMAIL,
    subject: `📋 Prep Sheet: ${payload.clientName || "Unknown Client"}`,
    html,
  }).catch((err) => {
    console.error("[prep-intake] Email failed:", err);
  });
}

async function notifyDiscord(payload: PrepPayload, dashboardUrl: string): Promise<void> {
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
              name: "Dashboard",
              value: `[View Dashboard](${dashboardUrl})`,
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

    // Generate dashboard URL
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://clients.buildwithjazz.com";
    const dashboardUrl = email
      ? `${baseUrl}/dashboard?email=${encodeURIComponent(email)}`
      : `${baseUrl}/dashboard`;

    // GHL integration
    let contactId: string | null = null;
    if (email) {
      contactId = await findOrCreateContact(email, name, body.clientPhone);
      if (contactId) {
        await Promise.allSettled([
          addNote(contactId, body),
          addTag(contactId, "prep-sheet-submitted"),
        ]);

        // Send WhatsApp with dashboard link
        await sendWhatsApp(contactId, name, dashboardUrl).catch(() => {});
      }
    }

    // Email to owner + Discord notification
    Promise.allSettled([
      sendEmailToOwner(body, dashboardUrl),
      notifyDiscord(body, dashboardUrl),
    ]).catch(() => {});

    return NextResponse.json({
      ok: true,
      dashboardUrl,
    });
  } catch (err) {
    console.error("[prep-intake] Error:", err);
    return NextResponse.json(
      { error: "Failed to process submission" },
      { status: 500 },
    );
  }
}
