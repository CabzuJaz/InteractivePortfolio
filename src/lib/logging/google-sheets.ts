/**
 * Google Sheets conversation logger.
 * POSTs each chat transcript to a Google Apps Script Web App, which appends a
 * row to your sheet. Requires the GOOGLE_SHEETS_WEBHOOK_URL env var.
 *
 * One-time setup:
 *  1. Create a Google Sheet with headers:
 *       Timestamp | Messages | From Visitor | First Message | Transcript
 *  2. Extensions → Apps Script, paste:
 *
 *       function doPost(e) {
 *         const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *         const d = JSON.parse(e.postData.contents);
 *         sheet.appendRow([
 *           d.timestamp, d.messageCount, d.userMessageCount,
 *           d.firstMessage, d.transcript,
 *         ]);
 *         return ContentService
 *           .createTextOutput(JSON.stringify({ ok: true }))
 *           .setMimeType(ContentService.MimeType.JSON);
 *       }
 *
 *  3. Deploy → New deployment → Web app → Execute as: Me,
 *     Who has access: Anyone. Copy the /exec URL.
 *  4. Set GOOGLE_SHEETS_WEBHOOK_URL to that URL.
 */

import type { ConversationEntry } from "../types";

export async function sendToGoogleSheets(
  conversations: ConversationEntry[],
): Promise<void> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) return;

  const userMessages = conversations.filter((c) => c.role === "user");
  const transcript = conversations
    .map((c) => `${c.role === "user" ? "Visitor" : "Jazz AI"}: ${c.text}`)
    .join("\n\n");

  const payload = {
    timestamp: new Date().toISOString(),
    messageCount: conversations.length,
    userMessageCount: userMessages.length,
    firstMessage: userMessages[0]?.text ?? "",
    transcript,
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
