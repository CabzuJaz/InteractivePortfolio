/**
 * Conversation logging dispatcher.
 * Sends conversation transcripts to GoHighLevel (GHL) CRM, Discord, and
 * Google Sheets. Failures are logged to console but never thrown — this is
 * fire-and-forget. Each channel is optional and no-ops if unconfigured.
 */
import { sendToGHL } from "./ghl";
import { sendToDiscord } from "./discord";
import { sendToGoogleSheets } from "./google-sheets";
import type { ConversationEntry } from "../types";

export type { ConversationEntry };

/**
 * Extracts plain text from UIMessage parts.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractConversation(messages: any[]): ConversationEntry[] {
  const entries: ConversationEntry[] = [];

  for (const msg of messages) {
    if (!msg.parts) continue;
    for (const part of msg.parts) {
      if (part.type === "text" && part.text?.trim()) {
        entries.push({
          role: msg.role === "user" ? "user" : "assistant",
          text: part.text.trim(),
        });
      }
    }
  }

  return entries;
}

/**
 * Logs a conversation to GHL, Discord, and Google Sheets.
 * Safe to call from client-side — all channels are optional and fail silently.
 */
export async function logConversation(
  messages: unknown[],
): Promise<void> {
  const conversations = extractConversation(messages);

  // Need at least one user message and one assistant response
  const hasUser = conversations.some((c) => c.role === "user");
  const hasAssistant = conversations.some((c) => c.role === "assistant");
  if (!hasUser || !hasAssistant) return;

  // Send to GHL, Discord, and Google Sheets in parallel
  await Promise.allSettled([
    sendToGHL(conversations),
    sendToDiscord(conversations),
    sendToGoogleSheets(conversations),
  ]).then((results) => {
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        const channels = ["GHL", "Discord", "Google Sheets"];
        console.error(`[log-conversation] ${channels[i]} failed:`, r.reason);
      }
    });
  });
}
