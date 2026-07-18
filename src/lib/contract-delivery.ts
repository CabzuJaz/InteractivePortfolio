/**
 * Server-side contract delivery — runs inside the generateContract tool so
 * nothing depends on the visitor's browser rendering buttons.
 *
 * Primary route: GoHighLevel — upsert contact, upload PDF to the media
 * library, store it in custom fields, tag `proposal-sent`, and send the
 * email through GHL's conversations API with the hosted PDF attached.
 * Fallback: Resend with the PDF as a base64 attachment.
 *
 * Every step is fail-soft: a delivery failure never breaks the tool call —
 * the returned DeliveryResult tells the model what actually happened so it
 * never claims an email was sent when it wasn't.
 */
import { Resend } from "resend";

const GHL_BASE = "https://services.leadconnectorhq.com";
const OWNER_EMAIL = "jazzmincabizares@gmail.com";
const FETCH_TIMEOUT_MS = 8000;

export interface ContractForDelivery {
  clientName: string;
  clientEmail?: string | null;
  projectDescription: string;
  hourlyRate: number;
  hours: number;
  totalCost: number;
}

export interface DeliveryResult {
  sent: boolean;
  method: "ghl-email" | "resend" | "none";
  sentTo: string | null;
  pdfUrl: string | null;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function ghlHeaders(json = true): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${process.env.GHL_API_KEY}`,
    Version: "2021-07-28",
  };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

/** Find a GHL contact by email, creating it if missing (chat visitors usually don't exist in the CRM yet). */
async function findOrCreateContact(
  email: string,
  name: string,
): Promise<string | null> {
  const locationId = process.env.GHL_LOCATION_ID;
  if (!locationId) return null;

  const searchRes = await fetch(
    `${GHL_BASE}/contacts/?locationId=${locationId}&query=${encodeURIComponent(email)}&limit=1`,
    { headers: ghlHeaders(), signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) },
  );
  if (searchRes.ok) {
    const data = await searchRes.json();
    const existing = data.contacts?.[0]?.id;
    if (existing) return existing;
  }

  const nameParts = name.trim().split(/\s+/);
  const createRes = await fetch(`${GHL_BASE}/contacts/`, {
    method: "POST",
    headers: ghlHeaders(),
    body: JSON.stringify({
      locationId,
      firstName: nameParts[0] || "Client",
      lastName: nameParts.slice(1).join(" ") || undefined,
      email,
      source: "Portfolio Chat — Contract",
      tags: ["portfolio-chat-lead"],
    }),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!createRes.ok) {
    console.error("[contract-delivery] contact create failed:", createRes.status);
    return null;
  }
  const created = await createRes.json();
  return created.contact?.id ?? null;
}

/** Upload the PDF to GHL's media library and return its hosted URL. */
async function uploadPdfToGHL(
  pdfBuffer: Buffer,
  filename: string,
): Promise<string | null> {
  const locationId = process.env.GHL_LOCATION_ID;
  if (!locationId) return null;

  const formData = new FormData();
  // Copy into a plain Uint8Array — Buffer's ArrayBufferLike backing doesn't satisfy BlobPart under strict TS
  formData.append(
    "file",
    new Blob([new Uint8Array(pdfBuffer)], { type: "application/pdf" }),
    filename,
  );
  formData.append("locationId", locationId);

  const res = await fetch(`${GHL_BASE}/medias/upload-file`, {
    method: "POST",
    headers: ghlHeaders(false),
    body: formData,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) {
    console.error("[contract-delivery] media upload failed:", res.status);
    return null;
  }
  const data = await res.json();
  return data.url ?? data.fileUrl ?? data.file?.url ?? null;
}

/** Attach the contract to the contact: note, custom fields, proposal-sent tag. */
async function attachToContact(
  contactId: string,
  contract: ContractForDelivery,
  pdfUrl: string | null,
): Promise<void> {
  if (pdfUrl) {
    const noteBody = [
      `📄 **Contract PDF Generated (auto-sent from chat)**`,
      `📅 ${new Date().toLocaleString()}`,
      `👤 Client: ${contract.clientName}`,
      `💰 Total: $${contract.totalCost.toLocaleString()}`,
      ``,
      `📎 Download: ${pdfUrl}`,
    ].join("\n");

    await fetch(`${GHL_BASE}/contacts/${contactId}/notes`, {
      method: "POST",
      headers: ghlHeaders(),
      body: JSON.stringify({ body: noteBody }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    }).catch(() => {});

    const fieldPdfUrl = process.env.GHL_FIELD_PDF_URL;
    const fieldName = process.env.GHL_FIELD_CLIENT_NAME;
    const fieldCost = process.env.GHL_FIELD_TOTAL_COST;
    if (fieldPdfUrl && fieldName && fieldCost) {
      await fetch(`${GHL_BASE}/contacts/${contactId}`, {
        method: "PUT",
        headers: ghlHeaders(),
        body: JSON.stringify({
          customField: [
            { id: fieldPdfUrl, value: pdfUrl },
            { id: fieldName, value: contract.clientName },
            { id: fieldCost, value: `$${contract.totalCost.toLocaleString()}` },
          ],
        }),
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      }).catch(() => {});
    }
  }

  await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
    method: "POST",
    headers: ghlHeaders(),
    body: JSON.stringify({ tags: ["proposal-sent"] }),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  }).catch(() => {});
}

function buildClientEmailHtml(contract: ContractForDelivery): string {
  const safeName = escapeHtml(contract.clientName);
  return `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#06b6d4">Hi ${safeName},</h2>
      <p>Thanks for your interest in working together! Please find your contract proposal attached.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#6b7280">Total Project Cost</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600;color:#06b6d4">$${contract.totalCost.toLocaleString()}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#6b7280">Rate</td><td style="padding:8px;border-bottom:1px solid #eee">$${contract.hourlyRate}/hour · ${contract.hours}h estimated</td></tr>
      </table>
      <p style="color:#374151">If you have questions or want to discuss the scope, reply to this email or book a call:</p>
      <p style="margin:16px 0"><a href="https://calendly.com/jazzmincabizares/15-minutes-discovery-call" style="display:inline-block;background:#06b6d4;color:white;padding:10px 24px;border-radius:999px;text-decoration:none;font-weight:600">Book a Discovery Call</a></p>
      <p style="color:#374151">Looking forward to working with you!</p>
      <p style="color:#374151;font-weight:600">Jazzmin Sicat-Cabizares</p>
      <p style="color:#6b7280;font-size:13px">AI Automation Engineer</p>
      <p style="color:#9ca3af;font-size:12px;margin-top:24px;border-top:1px solid #eee;padding-top:12px">BuildWithJazz.com · ${OWNER_EMAIL}</p>
    </div>
  `;
}

/** Send the contract email from GHL itself (conversations API) with the hosted PDF attached. */
async function sendEmailViaGHL(
  contactId: string,
  email: string,
  contract: ContractForDelivery,
  pdfUrl: string,
): Promise<boolean> {
  const res = await fetch(`${GHL_BASE}/conversations/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GHL_API_KEY}`,
      Version: "2021-04-15",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "Email",
      contactId,
      emailTo: email,
      subject: `Your Contract Proposal from Jazzmin — $${contract.totalCost.toLocaleString()}`,
      html: buildClientEmailHtml(contract),
      attachments: [pdfUrl],
    }),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) {
    console.error(
      "[contract-delivery] GHL email send failed:",
      res.status,
      await res.text().catch(() => ""),
    );
  }
  return res.ok;
}

/** Fire-and-forget: owner email + Discord ping so Jazzmin knows a proposal went out. */
function notifyOwner(contract: ContractForDelivery, method: string): void {
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const resend = new Resend(apiKey);
    resend.emails
      .send({
        from: "Jazzmin <onboarding@resend.dev>",
        to: OWNER_EMAIL,
        subject: `📄 Contract auto-sent to ${contract.clientName} — $${contract.totalCost.toLocaleString()}`,
        html: `<div style="font-family:system-ui,sans-serif"><p><strong>${escapeHtml(contract.clientName)}</strong> (${escapeHtml(contract.clientEmail ?? "no email")}) was sent a contract proposal via ${method}.</p><p>Total: <strong>$${contract.totalCost.toLocaleString()}</strong> · ${escapeHtml(contract.projectDescription)}</p></div>`,
      })
      .catch((err) => console.error("[contract-delivery] owner email failed:", err));
  }

  const discordWebhook = process.env.DISCORD_WEBHOOK_URL;
  if (discordWebhook) {
    fetch(discordWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: "📄 Contract Auto-Sent from Chat",
            color: 16776960,
            fields: [
              { name: "Client", value: contract.clientName, inline: true },
              { name: "Email", value: contract.clientEmail ?? "—", inline: true },
              { name: "Total", value: `$${contract.totalCost.toLocaleString()}`, inline: true },
              { name: "Via", value: method, inline: true },
            ],
            footer: { text: "BuildWithJazz.com" },
          },
        ],
      }),
    }).catch(() => {});
  }
}

/**
 * Deliver the contract PDF to the client.
 * GHL first (hosted PDF + CRM trail + GHL-sent email), Resend as fallback.
 */
export async function deliverContract(
  contract: ContractForDelivery,
  pdfBuffer: Buffer,
): Promise<DeliveryResult> {
  const email = contract.clientEmail?.trim();
  if (!email) return { sent: false, method: "none", sentTo: null, pdfUrl: null };

  const filename = `contract-${contract.clientName.toLowerCase().replace(/\s+/g, "-")}.pdf`;
  const hasGHL = !!(process.env.GHL_LOCATION_ID && process.env.GHL_API_KEY);

  let contactId: string | null = null;
  let pdfUrl: string | null = null;

  if (hasGHL) {
    try {
      [contactId, pdfUrl] = await Promise.all([
        findOrCreateContact(email, contract.clientName),
        uploadPdfToGHL(pdfBuffer, filename),
      ]);
      if (contactId) await attachToContact(contactId, contract, pdfUrl);
    } catch (err) {
      console.error("[contract-delivery] GHL steps failed:", err);
    }

    // Primary: email sent by GHL itself with the hosted PDF attached
    if (contactId && pdfUrl) {
      try {
        if (await sendEmailViaGHL(contactId, email, contract, pdfUrl)) {
          notifyOwner(contract, "GHL email");
          return { sent: true, method: "ghl-email", sentTo: email, pdfUrl };
        }
      } catch (err) {
        console.error("[contract-delivery] GHL email failed:", err);
      }
    }
  }

  // Fallback: Resend with base64 attachment
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error } = await resend.emails.send({
        from: "Jazzmin <onboarding@resend.dev>",
        to: email,
        subject: `Your Contract Proposal from Jazzmin — $${contract.totalCost.toLocaleString()}`,
        html: buildClientEmailHtml(contract),
        attachments: [{ filename, content: pdfBuffer.toString("base64") }],
      });
      if (!error) {
        notifyOwner(contract, "Resend (fallback)");
        return { sent: true, method: "resend", sentTo: email, pdfUrl };
      }
      console.error("[contract-delivery] Resend fallback failed:", error);
    } catch (err) {
      console.error("[contract-delivery] Resend fallback threw:", err);
    }
  }

  return { sent: false, method: "none", sentTo: email, pdfUrl };
}
