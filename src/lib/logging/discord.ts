/**
 * Posts one Discord message per conversation and edits it as the chat goes on:
 * who the visitor is, their latest message, and MinMin's latest reply.
 * Requires DISCORD_WEBHOOK_URL env var.
 *
 * The browser keeps the message id between turns and sends it back. The log
 * endpoint is public, so that id is only trusted when it carries a signature
 * this server made for the same conversation, keyed on the webhook URL (a
 * secret only the server holds). Anything else gets a fresh message.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import type { ConversationEntry } from "../types";
import { findName } from "./contact-info";

/**
 * Extracts client name from conversation text.
 */
function extractName(conversations: ConversationEntry[]): string {
  const userText = conversations
    .filter((c) => c.role === "user")
    .map((c) => c.text)
    .join(" ");
  const { firstName, lastName } = findName(userText);
  return [firstName, lastName].filter(Boolean).join(" ") || "Unknown";
}

/**
 * Extracts email from conversation text.
 */
function extractEmail(conversations: ConversationEntry[]): string {
  const userText = conversations
    .filter((c) => c.role === "user")
    .map((c) => c.text)
    .join(" ");

  const emailMatch = userText.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
  return emailMatch?.[0] ?? "Not provided";
}

/**
 * Extracts a short topic summary from the conversation.
 */
function extractTopic(conversations: ConversationEntry[]): string {
  const userText = conversations
    .filter((c) => c.role === "user")
    .map((c) => c.text)
    .join(" ")
    .toLowerCase();

  if (userText.includes("contract") || userText.includes("hire") || userText.includes("rate"))
    return "Wants a contract / pricing info";
  if (userText.includes("project") || userText.includes("build") || userText.includes("automat"))
    return "Interested in automation project";
  if (userText.includes("skill") || userText.includes("experience") || userText.includes("resume"))
    return "Asking about skills / experience";
  if (userText.includes("ghl") || userText.includes("gohighlevel") || userText.includes("workflow"))
    return "Needs GHL / workflow help";
  if (userText.includes("business") || userText.includes("scale") || userText.includes("efficiency"))
    return "Business automation inquiry";
  return "General inquiry";
}

function clip(text: string, max: number): string {
  const clean = text.trim();
  if (!clean) return "—";
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

function sign(secret: string, conversationId: string, messageId: string): string {
  return createHmac("sha256", secret).update(`${conversationId}:${messageId}`).digest("base64url");
}

/** The message id inside `ref`, if this server signed it for this conversation. */
function verifiedMessageId(ref: string | undefined, secret: string, conversationId: string): string | undefined {
  const [messageId, signature] = ref?.split(".") ?? [];
  if (!messageId || !signature || !/^\d{1,24}$/.test(messageId)) return undefined;
  const expected = Buffer.from(sign(secret, conversationId, messageId));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given) ? messageId : undefined;
}

/** Edit URL for one of the webhook's messages, keeping any thread_id the webhook URL carries. */
function messageUrl(webhookUrl: string, messageId: string): URL {
  const url = new URL(webhookUrl);
  url.pathname = `${url.pathname.replace(/\/$/, "")}/messages/${messageId}`;
  return url;
}

/**
 * Creates or updates this conversation's Discord message. Returns the signed
 * reference the browser should send with its next log call.
 */
export async function sendToDiscord(
  conversations: ConversationEntry[],
  conversationId: string,
  ref?: string,
): Promise<string | undefined> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return undefined;

  const userMessages = conversations.filter((c) => c.role === "user");
  const lastUserMessage = userMessages[userMessages.length - 1]?.text ?? "";
  const lastReply = [...conversations].reverse().find((c) => c.role === "assistant")?.text ?? "";

  // Discord caps a field value at 1024 characters and a whole embed at 6000.
  const body = JSON.stringify({
    embeds: [
      {
        title: "💬 New Chat Lead",
        color: 0x06b6d4,
        fields: [
          { name: "👤 Client", value: extractName(conversations), inline: true },
          { name: "📧 Email", value: extractEmail(conversations), inline: true },
          {
            name: "📊 Messages",
            value: `${conversations.length} (${userMessages.length} from client)`,
            inline: true,
          },
          { name: "📋 Topic", value: extractTopic(conversations) },
          { name: "💬 Visitor's latest message", value: clip(lastUserMessage, 400) },
          { name: "🤖 MinMin's reply", value: clip(lastReply, 900) },
        ],
        footer: { text: `BuildWithJazz.com · chat ${conversationId.slice(0, 8)}` },
        timestamp: new Date().toISOString(),
      },
    ],
  });
  const headers = { "Content-Type": "application/json" };

  const messageId = verifiedMessageId(ref, webhookUrl, conversationId);
  if (messageId) {
    const edit = await fetch(messageUrl(webhookUrl, messageId), { method: "PATCH", headers, body });
    if (edit.ok) return ref;
    // Deleted or no longer editable: post a fresh message below.
  }

  const url = new URL(webhookUrl);
  url.searchParams.set("wait", "true");
  const res = await fetch(url, { method: "POST", headers, body });
  if (!res.ok) throw new Error(`Discord webhook failed: ${res.status}`);
  const { id } = (await res.json()) as { id: string };
  return `${id}.${sign(webhookUrl, conversationId, id)}`;
}
