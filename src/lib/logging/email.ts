/**
 * Sends a conversation summary via Resend email.
 * Requires RESEND_API_KEY env var.
 */
import { Resend } from "resend";

interface ConversationEntry {
  role: "user" | "assistant";
  text: string;
}

export async function sendEmail(
  conversations: ConversationEntry[],
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const resend = new Resend(apiKey);
  const ownerEmail = "jazzmincabizares@gmail.com";

  const userMessages = conversations.filter((c) => c.role === "user");
  const firstMessage =
    userMessages[0]?.text.slice(0, 60) ?? "New conversation";

  const transcriptHtml = conversations
    .map(
      (c) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;color:${c.role === "user" ? "#06b6d4" : "#6b7280"};width:80px;vertical-align:top">
          ${c.role === "user" ? "👤 Client" : "🤖 Jazz AI"}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#374151">
          ${c.text.replace(/\n/g, "<br>")}
        </td>
      </tr>`,
    )
    .join("");

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:640px;margin:0 auto">
      <h2 style="color:#06b6d4;border-bottom:2px solid #06b6d4;padding-bottom:8px">
        💬 New Chat Conversation
      </h2>
      <p style="color:#6b7280;font-size:14px">
        ${conversations.length} messages · ${userMessages.length} from client · ${new Date().toLocaleString()}
      </p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px">
        ${transcriptHtml}
      </table>
      <p style="color:#9ca3af;font-size:12px;margin-top:24px;border-top:1px solid #eee;padding-top:12px">
        Sent automatically from BuildWithJazz.com chat widget
      </p>
    </div>
  `;

  await resend.emails.send({
    from: "Chat Logger <onboarding@resend.dev>",
    to: ownerEmail,
    subject: `💬 New Chat: "${firstMessage}"`,
    html,
  });
}
