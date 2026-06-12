import { Resend } from "resend";

const OWNER_EMAIL = "jazzmincabizares@gmail.com";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Email not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

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

    const resend = new Resend(apiKey);
    const sends: Promise<unknown>[] = [];

    // 1. Always send to owner
    sends.push(
      resend.emails.send({
        from: "Jazzmin <onboarding@resend.dev>",
        to: OWNER_EMAIL,
        subject: `📄 Contract Proposal for ${clientName} — $${totalCost.toLocaleString()}`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#06b6d4">New Contract Proposal Sent</h2>
            <p>A contract proposal has been generated for <strong>${clientName}</strong>${clientEmail ? ` (${clientEmail})` : ""}.</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
              <tr>
                <td style="padding:8px;border-bottom:1px solid #eee;color:#6b7280">Client</td>
                <td style="padding:8px;border-bottom:1px solid #eee;font-weight:600">${clientName}</td>
              </tr>
              ${clientEmail ? `<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#6b7280">Email</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600">${clientEmail}</td></tr>` : ""}
              <tr>
                <td style="padding:8px;border-bottom:1px solid #eee;color:#6b7280">Total Cost</td>
                <td style="padding:8px;border-bottom:1px solid #eee;font-weight:600;color:#06b6d4">$${totalCost.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding:8px;border-bottom:1px solid #eee;color:#6b7280">Date</td>
                <td style="padding:8px;border-bottom:1px solid #eee">${new Date().toLocaleDateString()}</td>
              </tr>
            </table>
            <p style="color:#6b7280;font-size:14px">The contract PDF is attached to this email.</p>
            <p style="color:#9ca3af;font-size:12px;margin-top:24px;border-top:1px solid #eee;padding-top:12px">
              Sent from BuildWithJazz.com — Contract Generator
            </p>
          </div>
        `,
        attachments: [{ filename, content: base64Data }],
      }),
    );

    // 2. Also send to client if email is provided
    if (clientEmail) {
      sends.push(
        resend.emails.send({
          from: "Jazzmin <onboarding@resend.dev>",
          to: clientEmail,
          subject: `Your Contract Proposal from Jazzmin — $${totalCost.toLocaleString()}`,
          html: `
            <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
              <h2 style="color:#06b6d4">Hi ${clientName},</h2>
              <p>Thanks for your interest in working together! Please find the contract proposal attached.</p>
              <table style="width:100%;border-collapse:collapse;margin:16px 0">
                <tr>
                  <td style="padding:8px;border-bottom:1px solid #eee;color:#6b7280">Total Project Cost</td>
                  <td style="padding:8px;border-bottom:1px solid #eee;font-weight:600;color:#06b6d4">$${totalCost.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding:8px;border-bottom:1px solid #eee;color:#6b7280">Rate</td>
                  <td style="padding:8px;border-bottom:1px solid #eee">$10/hour</td>
                </tr>
              </table>
              <p style="color:#374151">If you have any questions or would like to discuss the scope, feel free to reply to this email or book a call:</p>
              <p style="margin:16px 0">
                <a href="https://calendly.com/jazzmincabizares/15-minutes-discovery-call" style="display:inline-block;background:#06b6d4;color:white;padding:10px 24px;border-radius:999px;text-decoration:none;font-weight:600">
                  Book a Discovery Call
                </a>
              </p>
              <p style="color:#374151">Looking forward to working with you!</p>
              <p style="color:#374151;font-weight:600">Jazzmin Sicat-Cabizares</p>
              <p style="color:#6b7280;font-size:13px">AI Automation Engineer</p>
              <p style="color:#9ca3af;font-size:12px;margin-top:24px;border-top:1px solid #eee;padding-top:12px">
                BuildWithJazz.com · jazzmincabizares@gmail.com
              </p>
            </div>
          `,
          attachments: [{ filename, content: base64Data }],
        }),
      );
    }

    await Promise.all(sends);

    return new Response(
      JSON.stringify({ ok: true, sentTo: clientEmail ? [OWNER_EMAIL, clientEmail] : [OWNER_EMAIL] }),
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
