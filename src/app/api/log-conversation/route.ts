import { randomUUID } from "node:crypto";
import { logConversation } from "@/lib/logging";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      messages?: unknown;
      conversationId?: unknown;
      refs?: { discord?: unknown } | null;
    };

    if (!body.messages || !Array.isArray(body.messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Everything here comes from the browser. A malformed id just starts a
    // new record; the Discord ref is verified against its signature later.
    const conversationId =
      typeof body.conversationId === "string" && /^[\w-]{8,64}$/.test(body.conversationId)
        ? body.conversationId
        : randomUUID();
    const discordRef =
      typeof body.refs?.discord === "string" && body.refs.discord.length <= 200 ? body.refs.discord : undefined;

    // Must await — Vercel serverless functions terminate after response
    const refs = await logConversation(body.messages, conversationId, { discord: discordRef }).catch((err) => {
      console.error("[log-conversation] Background error:", err);
      return { discord: discordRef };
    });

    return new Response(JSON.stringify({ ok: true, refs }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[log-conversation] Error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
