/**
 * Sends a conversation summary to a Discord webhook.
 * Shows only the last 2 messages + client name to stay under Discord limits.
 * Requires DISCORD_WEBHOOK_URL env var.
 */

interface ConversationEntry {
  role: "user" | "assistant";
  text: string;
}

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

export async function sendToDiscord(
  conversations: ConversationEntry[],
): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const userMessages = conversations.filter((c) => c.role === "user");
  const clientName = extractName(conversations);
  const clientEmail = extractEmail(conversations);

  // Get only the last 2 messages
  const lastTwo = conversations.slice(-2);
  const recentChat = lastTwo
    .map(
      (c) =>
        `**${c.role === "user" ? "👤 Client" : "🤖 Jazz AI"}:** ${c.text.slice(0, 200)}`,
    )
    .join("\n");

  const embed = {
    title: "💬 New Chat Conversation",
    color: 0x06b6d4, // cyan
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
        value: `${conversations.length} total (${userMessages.length} from client)`,
        inline: true,
      },
      {
        name: "💬 Latest Exchange",
        value: recentChat.slice(0, 1024) || "No messages",
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
