/**
 * Sends a conversation summary to a Discord webhook.
 * Requires DISCORD_WEBHOOK_URL env var.
 */

interface ConversationEntry {
  role: "user" | "assistant";
  text: string;
}

export async function sendToDiscord(
  conversations: ConversationEntry[],
): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const userMessages = conversations.filter((c) => c.role === "user");
  const preview = userMessages
    .slice(0, 3)
    .map((m) => m.text.slice(0, 100))
    .join("\n");

  const transcript = conversations
    .map(
      (c) =>
        `**${c.role === "user" ? "👤 Client" : "🤖 Jazz AI"}:** ${c.text.slice(0, 500)}`,
    )
    .join("\n\n");

  const embed = {
    title: "💬 New Chat Conversation",
    color: 0x06b6d4, // cyan
    fields: [
      {
        name: "Messages",
        value: `${conversations.length} total (${userMessages.length} from client)`,
        inline: true,
      },
      {
        name: "Time",
        value: new Date().toLocaleString(),
        inline: true,
      },
      {
        name: "Client Messages Preview",
        value: preview || "No messages",
      },
      {
        name: "Full Transcript",
        value: transcript.slice(0, 1024) || "Empty",
      },
    ],
    footer: {
      text: "BuildWithJazz.com — Chat Logger",
    },
  };

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [embed] }),
  });
}
