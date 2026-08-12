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

/** The subset of a UIMessage this logger reads. */
type LoggableMessage = { role?: unknown; parts?: unknown };
type LoggablePart = { type?: unknown; text?: unknown };

/**
 * Extracts plain text from UIMessage parts. Messages come from the client, so
 * every field is treated as untrusted rather than assumed to be well-formed.
 */
export function extractConversation(messages: unknown[]): ConversationEntry[] {
  const entries: ConversationEntry[] = [];

  for (const message of messages) {
    const msg = message as LoggableMessage;
    if (!Array.isArray(msg.parts)) continue;

    for (const rawPart of msg.parts) {
      const part = rawPart as LoggablePart;
      if (part.type !== "text" || typeof part.text !== "string") continue;

      const text = part.text.trim();
      if (!text) continue;

      entries.push({
        role: msg.role === "user" ? "user" : "assistant",
        text,
      });
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
