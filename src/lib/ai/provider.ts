import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGroq } from "@ai-sdk/groq";
import { createVertex } from "@ai-sdk/google-vertex";

/**
 * Returns the AI model based on environment variables.
 * Priority: OPENROUTER_API_KEY > GOOGLE_VERTEX_PROJECT > GROQ_API_KEY >
 * ANTHROPIC_API_KEY > OPENAI_API_KEY.
 *
 * For OpenRouter (primary — one account, any model, one bill):
 *   OPENROUTER_API_KEY=sk-or-v1-...
 *   OPENROUTER_MODEL=google/gemini-2.5-flash  (optional, this is the default)
 *   Whatever model is chosen must support tool calling: the chat routes every
 *   factual answer through a tool, so a model without it answers from nothing.
 *
 * For Vertex AI / Gemini (fallback — billed to the GCP project):
 *   GOOGLE_VERTEX_PROJECT=your-gcp-project-id
 *   GOOGLE_VERTEX_LOCATION=us-central1  (optional, this is the default)
 *   GOOGLE_VERTEX_CREDENTIALS={"type":"service_account",...}  (full JSON key, one line)
 *   AI_MODEL=gemini-2.5-flash  (optional, this is the default)
 *
 * For Groq (fallback — free tier, low daily token limit):
 *   GROQ_API_KEY=gsk_...
 *   AI_MODEL=llama-3.3-70b-versatile  (optional, this is the default)
 *
 * For Anthropic:
 *   ANTHROPIC_API_KEY=sk-ant-...
 *   AI_MODEL=claude-sonnet-4-20250514  (optional)
 *
 * For OpenAI:
 *   OPENAI_API_KEY=sk-...
 *   AI_MODEL=gpt-4o  (optional)
 */
export function getModel() {
  const modelId = process.env.AI_MODEL;

  // OpenRouter (primary) — one account and one bill for every model.
  // OpenRouter speaks the OpenAI wire format, so the OpenAI provider works as-is.
  if (process.env.OPENROUTER_API_KEY) {
    const openrouter = createOpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });
    return openrouter(process.env.OPENROUTER_MODEL ?? "google/gemini-2.5-flash");
  }

  // Vertex AI / Gemini (fallback — paid GCP project, no free-tier rate-limit risk)
  if (process.env.GOOGLE_VERTEX_PROJECT) {
    const vertex = createVertex({
      project: process.env.GOOGLE_VERTEX_PROJECT,
      location: process.env.GOOGLE_VERTEX_LOCATION ?? "us-central1",
      googleAuthOptions: process.env.GOOGLE_VERTEX_CREDENTIALS
        ? { credentials: JSON.parse(process.env.GOOGLE_VERTEX_CREDENTIALS) }
        : undefined,
    });
    return vertex(modelId ?? "gemini-2.5-flash");
  }

  // Groq (fallback)
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

  // Default (will fail at runtime without a key, but keeps types happy)
  const anthropic = createAnthropic();
  return anthropic(modelId ?? "claude-sonnet-4-20250514");
}
