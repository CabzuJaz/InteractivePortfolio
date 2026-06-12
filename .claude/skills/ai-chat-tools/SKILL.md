---
name: ai-chat-tools
description: How to build and extend the AI chat backbone of this portfolio — the /api/chat route, Vercel AI SDK streaming, tool definitions with zod, and wiring tool results to inline React components. Use this skill whenever the task touches the chat API, adds or modifies an AI tool (getProjects, getSkills, etc.), changes the model/provider, debugs streaming or tool-call rendering, or adds a new interactive answer type to the chat.
---

# AI Chat Tools

The chat is the product. The model answers as the portfolio owner and calls tools whose
results render as React components inline in the message stream.

## Architecture

```
useChat (client) ──POST──> /api/chat (streamText + tools) ──stream──> message parts
                                                                        ├─ text parts → markdown
                                                                        └─ tool parts → <ToolRenderer/>
```

## Tool definition pattern (`src/lib/ai/tools.ts`)

Every tool follows this shape. Tools take few/no parameters and return data straight from
`src/data/` — the model is a router + narrator, not a database.

```ts
import { tool } from 'ai';
import { z } from 'zod';
import { projects } from '@/data/projects';

export const getProjects = tool({
  description:
    'Show my projects as interactive cards. Call this whenever the user asks about ' +
    'projects, work, portfolio, what I have built, or anything I have shipped.',
  inputSchema: z.object({}),
  execute: async () => ({ projects }),
});
```

Rules:
- **Pushy descriptions.** List the trigger phrases in the description so the model reliably
  calls the tool instead of answering in prose.
- **No free-form params** unless filtering is genuinely needed (then a zod enum, never string).
- **Return JSON-serializable data only.**

## API route pattern (`src/app/api/chat/route.ts`)

```ts
import { streamText, convertToModelMessages } from 'ai';
import { getModel } from '@/lib/ai/provider';
import { buildSystemPrompt } from '@/lib/ai/system-prompt';
import * as tools from '@/lib/ai/tools';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({
    model: getModel(),
    system: buildSystemPrompt(),
    messages: convertToModelMessages(messages),
    tools,
    maxSteps: 3, // allow text → tool → wrap-up text
  });
  return result.toUIMessageStreamResponse();
}
```

Provider abstraction (`provider.ts`): read `AI_MODEL` env; default to an Anthropic model via
`@ai-sdk/anthropic`, fall back to `@ai-sdk/openai` if only `OPENAI_API_KEY` is set. Never
hardcode a model string in the route.

## Client rendering pattern

In the message list, iterate over `message.parts`:

- `part.type === 'text'` → render markdown (react-markdown, prose styles).
- tool parts → switch on tool name, render the matching component from `components/tools/`:

```tsx
case 'tool-getProjects':
  if (part.state === 'output-available') return <Projects data={part.output.projects} />;
  return <ToolSkeleton label="Pulling up my projects…" />;
```

Always handle the loading state (`input-streaming` / `input-available`) with a skeleton —
tool calls are visible to the user, dead air is not acceptable.

## Adding a new tool: end-to-end checklist

1. Add data file or extend one in `src/data/`.
2. Define the tool in `lib/ai/tools.ts` (description with trigger phrases).
3. Create `components/tools/<Name>.tsx` renderer + skeleton.
4. Add the case to the tool-part switch in the message renderer.
5. Mention the capability in `system-prompt.ts` ("you can show X by calling Y").
6. Optionally add a suggestion chip on landing + chat pages.
7. Test: ask three differently-phrased questions; the tool must fire on all three.

## Streaming & error gotchas

- `useChat` v5 sends `messages` as UI messages — always `convertToModelMessages` server-side.
- If a tool throws, return a friendly text fallback; never let the stream die silently.
- Set `export const maxDuration = 30` on the route for Vercel.
- Keep the system prompt + data payloads small; data files should stay under a few KB each so
  tool outputs don't bloat the stream.
