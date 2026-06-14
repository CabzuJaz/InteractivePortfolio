/**
 * Conversation logging dispatcher.
 * Sends conversation summaries to GoHighLevel (GHL) CRM.
 * Failures are logged to console but never thrown — this is fire-and-forget.
 */
import { sendToGHL } from "./ghl";
import { sendToDiscord } from "./discord";

export interface ConversationEntry {
  role: "user" | "assistant";
  text: string;
}

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
 * Logs a conversation to GHL.
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

  // Send to GHL and Discord in parallel
  await Promise.allSettled([
    sendToGHL(conversations),
    sendToDiscord(conversations),
  ]).then((results) => {
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        const channels = ["GHL", "Discord"];
        console.error(`[log-conversation] ${channels[i]} failed:`, r.reason);
      }
    });
  });
}
