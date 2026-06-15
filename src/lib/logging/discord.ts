/**
 * Sends a conversation summary to a Discord webhook.
 * Shows only the last 2 messages + client name to stay under Discord limits.
 * Requires DISCORD_WEBHOOK_URL env var.
 */

import type { ConversationEntry } from "../types";

/**
 * Extracts client name from conversation text.
 */
function extractName(conversations: ConversationEntry[]): string {
  const userText = conversations
    .filter((c) => c.role === "user")
    .map((c) => c.text)
    .join(" ");

  const nameMatch = userText.match(
    /(?:my name is|i'm|i am|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
  );
  return nameMatch?.[1] ?? "Unknown";
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

export async function sendToDiscord(
  conversations: ConversationEntry[],
): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const userMessages = conversations.filter((c) => c.role === "user");
  const clientName = extractName(conversations);
  const clientEmail = extractEmail(conversations);
  const topic = extractTopic(conversations);

  const embed = {
    title: "💬 New Chat Lead",
    color: 0x06b6d4,
    fields: [
      {
        name: "👤 Client",
        value: clientName,
        inline: true,
      },
      {
        name: "📧 Email",
        value: clientEmail,
        inline: true,
      },
      {
        name: "📊 Messages",
        value: `${conversations.length} (${userMessages.length} from client)`,
        inline: true,
      },
      {
        name: "📋 Topic",
        value: topic,
      },
    ],
    footer: {
      text: "BuildWithJazz.com",
    },
  };

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [embed] }),
  });
}
