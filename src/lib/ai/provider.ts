import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGroq } from "@ai-sdk/groq";

/**
 * Returns the AI model based on environment variables.
 * Priority: MIMO_API_KEY > GROQ_API_KEY > ANTHROPIC_API_KEY > OPENAI_API_KEY.
 *
 * For MiMo (default, supports images):
 *   MIMO_API_KEY=tp-...
 *   MIMO_BASE_URL=https://token-plan-sgp.xiaomimimo.com/anthropic  (optional)
 *   MIMO_TEXT_MODEL=mimo-vl-7b  (optional, this is the default)
 *
 * For Groq:
 *   GROQ_API_KEY=gsk_...
 *   AI_MODEL=llama-3.3-70b-versatile  (optional, this is the default)
 */
export function getModel() {
  const modelId = process.env.AI_MODEL;

  // MiMo (primary — supports text + images, no separate vision model needed)
  if (process.env.MIMO_API_KEY) {
    const mimo = createAnthropic({
      apiKey: process.env.MIMO_API_KEY,
      baseURL:
        process.env.MIMO_BASE_URL ??
        "https://token-plan-sgp.xiaomimimo.com/anthropic/v1",
    });
    return mimo(process.env.MIMO_TEXT_MODEL ?? process.env.MIMO_MODEL ?? "mimo-v2.5-pro");
  }

  // Groq
  if (process.env.GROQ_API_KEY) {
    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
    return groq(modelId ?? "llama-3.3-70b-versatile");
  }

  // Anthropic
  if (process.env.ANTHROPIC_API_KEY) {
    const anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      baseURL: process.env.ANTHROPIC_BASE_URL,
    });
    return anthropic(modelId ?? "claude-sonnet-4-20250514");
  }

  // OpenAI fallback
  if (process.env.OPENAI_API_KEY) {
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return openai(modelId ?? "gpt-4o");
  }

  // Default (will fail at runtime without a key, but keeps types happy)
  const anthropic = createAnthropic();
  return anthropic(modelId ?? "claude-sonnet-4-20250514");
}
