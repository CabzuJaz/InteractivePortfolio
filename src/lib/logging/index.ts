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

/** What a later log call for the same conversation needs from an earlier one. */
export interface LogRefs {
  /** Signed reference to this conversation's Discord message; see sendToDiscord. */
  discord?: string;
}

/**
 * Logs a conversation to GHL, Discord, and Google Sheets, updating each
 * channel's existing record for `conversationId` instead of adding another.
 * Returns the refs the browser should send with its next call.
 * Safe to call from client-side — all channels are optional and fail silently.
 */
export async function logConversation(
  messages: unknown[],
  conversationId: string,
  refs: LogRefs = {},
): Promise<LogRefs> {
  const conversations = extractConversation(messages);

  // Need at least one user message and one assistant response
  const hasUser = conversations.some((c) => c.role === "user");
  const hasAssistant = conversations.some((c) => c.role === "assistant");
  if (!hasUser || !hasAssistant) return refs;

  const [ghl, discord, sheets] = await Promise.allSettled([
    sendToGHL(conversations, conversationId),
    sendToDiscord(conversations, conversationId, refs.discord),
    sendToGoogleSheets(conversations, conversationId),
  ]);
  (["GHL", "Discord", "Google Sheets"] as const).forEach((channel, i) => {
    const result = [ghl, discord, sheets][i];
    if (result.status === "rejected") {
      console.error(`[log-conversation] ${channel} failed:`, result.reason);
    }
  });

  return { discord: discord.status === "fulfilled" ? (discord.value ?? refs.discord) : refs.discord };
}
