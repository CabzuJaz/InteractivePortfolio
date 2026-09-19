/**
 * Google Sheets conversation logger: one row per conversation, rewritten each
 * turn, so every chat is kept in full, including anonymous ones. POSTs to a
 * Google Apps Script Web App. Requires the GOOGLE_SHEETS_WEBHOOK_URL env var.
 *
 * One-time setup:
 *  1. Create a blank Google Sheet (sheets.new). The script adds the headers.
 *  2. Extensions → Apps Script, replace everything with:
 *
 *       const HEADERS = ["Conversation ID", "Started", "Updated", "Messages",
 *         "From Visitor", "First Message", "Transcript"];
 *
 *       function doPost(e) {
 *         const lock = LockService.getScriptLock();
 *         lock.waitLock(10000);
 *         try {
 *           const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *           if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
 *           const d = JSON.parse(e.postData.contents);
 *           const ids = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues().flat();
 *           const at = ids.indexOf(d.conversationId);
 *           if (at > 0) {
 *             sheet.getRange(at + 1, 3, 1, 5).setValues([[d.updatedAt, d.messageCount,
 *               d.userMessageCount, d.firstMessage, d.transcript]]);
 *           } else {
 *             sheet.appendRow([d.conversationId, d.updatedAt, d.updatedAt, d.messageCount,
 *               d.userMessageCount, d.firstMessage, d.transcript]);
 *           }
 *           return ContentService.createTextOutput(JSON.stringify({ ok: true }))
 *             .setMimeType(ContentService.MimeType.JSON);
 *         } finally {
 *           lock.releaseLock();
 *         }
 *       }
 *
 *  3. Deploy → New deployment → Web app → Execute as: Me,
 *     Who has access: Anyone. Copy the /exec URL.
 *  4. Set GOOGLE_SHEETS_WEBHOOK_URL to that URL in Vercel and redeploy.
 */

import type { ConversationEntry } from "../types";

export async function sendToGoogleSheets(
  conversations: ConversationEntry[],
  conversationId: string,
): Promise<void> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) return;

  const userMessages = conversations.filter((c) => c.role === "user");
  const transcript = conversations
    .map((c) => `${c.role === "user" ? "Visitor" : "Jazz AI"}: ${c.text}`)
    .join("\n\n");

  // A Sheets cell holds at most 50,000 characters.
  const payload = {
    conversationId,
    updatedAt: new Date().toISOString(),
    messageCount: conversations.length,
    userMessageCount: userMessages.length,
    firstMessage: (userMessages[0]?.text ?? "").slice(0, 1000),
    transcript: transcript.length > 49000 ? `${transcript.slice(0, 49000)}\n\n[truncated]` : transcript,
  };

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Google Sheets webhook failed: ${res.status}`);
  }
}
