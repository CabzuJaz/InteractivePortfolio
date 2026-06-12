import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { getModel } from "@/lib/ai/provider";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import * as tools from "@/lib/ai/tools";

export const maxDuration = 30;

/** Runs streamText with no internal retries so we can catch rate limits ourselves. */
function runStream(
  model: ReturnType<typeof getModel>,
  system: string,
  messages: Awaited<ReturnType<typeof convertToModelMessages>>,
) {
  return streamText({
    model,
    system,
    messages,
    tools,
    stopWhen: stepCountIs(3),
    maxRetries: 0,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.messages || !Array.isArray(body.messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: messages array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const model = getModel();
    const modelMessages = await convertToModelMessages(body.messages);
    const systemPrompt = buildSystemPrompt();

    const result = runStream(model, systemPrompt, modelMessages);
    return result.toUIMessageStreamResponse();
  } catch (err) {
    console.error("[chat] Error:", err);
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
