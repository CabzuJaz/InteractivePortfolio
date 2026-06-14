import { Resend } from "resend";

const OWNER_EMAIL = "jazzmincabizares@gmail.com";

/**
 * Uploads a PDF to GHL and attaches it to a contact.
 */
async function uploadToGHL(
  contactEmail: string,
  clientName: string,
  pdfBase64: string,
  filename: string,
): Promise<void> {
  const locationId = process.env.GHL_LOCATION_ID;
  const ghlKey = process.env.GHL_API_KEY;
  if (!locationId || !ghlKey) return;

  const baseUrl = "https://services.leadconnectorhq.com";
  const headers = {
    Authorization: `Bearer ${ghlKey}`,
    Version: "2021-07-28",
  };

  // 1. Find the contact by email
  const searchRes = await fetch(
    `${baseUrl}/contacts/?locationId=${locationId}&query=${encodeURIComponent(contactEmail)}&limit=1`,
    { headers },
  );
  if (!searchRes.ok) return;

  const searchData = await searchRes.json();
  const contactId = searchData.contacts?.[0]?.id;
  if (!contactId) return;

  // 2. Upload the file to GHL media library
  const base64Data = pdfBase64.split(",")[1] ?? pdfBase64;
  const buffer = Buffer.from(base64Data, "base64");

  const formData = new FormData();
  formData.append("file", new Blob([buffer], { type: "application/pdf" }), filename);
  formData.append("locationId", locationId);

  const uploadRes = await fetch(`${baseUrl}/medias/upload-file`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ghlKey}`, Version: "2021-07-28" },
    body: formData,
  });

  if (!uploadRes.ok) {
    console.error("[ghl] File upload failed:", uploadRes.status);
    return;
  }

  const uploadData = await uploadRes.json();
  const fileUrl = uploadData.url ?? uploadData.file?.url;

  // 3. Add a note to the contact with the contract link
  const noteBody = [
    `📄 **Contract PDF Uploaded**`,
    `📅 ${new Date().toLocaleString()}`,
    `👤 Client: ${clientName}`,
    ``,
    `Contract PDF has been generated and uploaded.`,
    fileUrl ? `📎 File: ${fileUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  await fetch(`${baseUrl}/contacts/${contactId}/notes`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ body: noteBody }),
  });

  // 4. Update contact tags
  await fetch(`${baseUrl}/contacts/${contactId}/tags`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ tags: ["proposal-sent"] }),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clientName, clientEmail, totalCost, pdfBase64 } = body;

    if (!clientName || !pdfBase64) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Extract base64 data (remove data:application/pdf;base64, prefix)
    const base64Data = pdfBase64.split(",")[1] ?? pdfBase64;
    const filename = `contract-${clientName.toLowerCase().replace(/\s+/g, "-")}.pdf`;

    const tasks: Promise<unknown>[] = [];

    // 1. Send emails via Resend
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);

      // Email to owner
      tasks.push(
        resend.emails.send({
          from: "Jazzmin <onboarding@resend.dev>",
          to: OWNER_EMAIL,
          subject: `📄 Contract Proposal for ${clientName} — $${totalCost.toLocaleString()}`,
          html: `
            <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
              <h2 style="color:#06b6d4">New Contract Proposal Sent</h2>
              <p>A contract proposal has been generated for <strong>${clientName}</strong>${clientEmail ? ` (${clientEmail})` : ""}.</p>
              <table style="width:100%;border-collapse:collapse;margin:16px 0">
                <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#6b7280">Client</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600">${clientName}</td></tr>
                ${clientEmail ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#6b7280">Email</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600">${clientEmail}</td></tr>` : ""}
                <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#6b7280">Total Cost</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600;color:#06b6d4">$${totalCost.toLocaleString()}</td></tr>
                <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#6b7280">Date</td><td style="padding:8px;border-bottom:1px solid #eee">${new Date().toLocaleDateString()}</td></tr>
              </table>
              <p style="color:#6b7280;font-size:14px">The contract PDF is attached to this email.</p>
              <p style="color:#9ca3af;font-size:12px;margin-top:24px;border-top:1px solid #eee;padding-top:12px">Sent from BuildWithJazz.com — Contract Generator</p>
            </div>
          `,
          attachments: [{ filename, content: base64Data }],
        }),
      );

      // Email to client
      if (clientEmail) {
        tasks.push(
          resend.emails.send({
            from: "Jazzmin <onboarding@resend.dev>",
            to: clientEmail,
            subject: `Your Contract Proposal from Jazzmin — $${totalCost.toLocaleString()}`,
            html: `
              <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
                <h2 style="color:#06b6d4">Hi ${clientName},</h2>
                <p>Thanks for your interest in working together! Please find the contract proposal attached.</p>
                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                  <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#6b7280">Total Project Cost</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600;color:#06b6d4">$${totalCost.toLocaleString()}</td></tr>
                  <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#6b7280">Rate</td><td style="padding:8px;border-bottom:1px solid #eee">$10/hour</td></tr>
                </table>
                <p style="color:#374151">If you have questions or want to discuss the scope, reply to this email or book a call:</p>
                <p style="margin:16px 0"><a href="https://calendly.com/jazzmincabizares/15-minutes-discovery-call" style="display:inline-block;background:#06b6d4;color:white;padding:10px 24px;border-radius:999px;text-decoration:none;font-weight:600">Book a Discovery Call</a></p>
                <p style="color:#374151">Looking forward to working with you!</p>
                <p style="color:#374151;font-weight:600">Jazzmin Sicat-Cabizares</p>
                <p style="color:#6b7280;font-size:13px">AI Automation Engineer</p>
                <p style="color:#9ca3af;font-size:12px;margin-top:24px;border-top:1px solid #eee;padding-top:12px">BuildWithJazz.com · jazzmincabizares@gmail.com</p>
              </div>
            `,
            attachments: [{ filename, content: base64Data }],
          }),
        );
      }
    }

    // 2. Upload to GHL
    if (clientEmail) {
      tasks.push(
        uploadToGHL(clientEmail, clientName, pdfBase64, filename).catch((err) => {
          console.error("[send-contract] GHL upload failed:", err);
        }),
      );
    }

    // 3. Notify Discord
    const discordWebhook = process.env.DISCORD_WEBHOOK_URL;
    if (discordWebhook) {
      tasks.push(
        fetch(discordWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            embeds: [
              {
                title: "📄 Contract Sent",
                color: 16776960,
                fields: [
                  { name: "Client", value: clientName, inline: true },
                  { name: "Email", value: clientEmail || "Not provided", inline: true },
                  { name: "Total", value: `$${totalCost.toLocaleString()}`, inline: true },
                ],
                footer: { text: "BuildWithJazz.com" },
              },
            ],
          }),
        }).catch(() => {}),
      );
    }

    await Promise.all(tasks);

    return new Response(
      JSON.stringify({
        ok: true,
        sentTo: clientEmail ? [OWNER_EMAIL, clientEmail] : [OWNER_EMAIL],
        ghl: !!clientEmail,
        discord: !!discordWebhook,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[send-contract] Error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to send contract" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
