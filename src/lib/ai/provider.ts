import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGroq } from "@ai-sdk/groq";

/**
 * Returns the AI model based on environment variables.
 * Priority: GROQ_API_KEY > ANTHROPIC_API_KEY > OPENAI_API_KEY > OPENROUTER_API_KEY.
 *
 * For Groq (default):
 *   GROQ_API_KEY=gsk_...
 *   AI_MODEL=llama-3.3-70b-versatile  (optional, this is the default)
 *
 * For Anthropic:
 *   ANTHROPIC_API_KEY=sk-ant-...
 *   AI_MODEL=claude-sonnet-4-20250514  (optional)
 *
 * For OpenRouter / MiniMax (fallback):
 *   OPENROUTER_API_KEY=sk-or-v1-...
 *   OPENROUTER_MODEL=minimax/minimax-m3  (optional, this is the default)
 */
export function getModel() {
  const modelId = process.env.AI_MODEL;

  // Groq (primary)
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

  // OpenAI
  if (process.env.OPENAI_API_KEY) {
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return openai(modelId ?? "gpt-4o");
  }

  // OpenRouter / MiniMax (fallback)
  if (process.env.OPENROUTER_API_KEY) {
    const openrouter = createOpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });
    return openrouter(process.env.OPENROUTER_MODEL ?? "minimax/minimax-m3");
  }

  // Default (will fail at runtime without a key, but keeps types happy)
  const anthropic = createAnthropic();
  return anthropic(modelId ?? "claude-sonnet-4-20250514");
}
