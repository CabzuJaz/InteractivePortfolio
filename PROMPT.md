Build me an **AI-native interactive portfolio** inspired by toukoum.fr. Instead of a static
scrolling site, the entire portfolio is a conversation: visitors land on a hero page with my
avatar and a question input, and an AI version of me answers questions about my background,
projects, and skills — rendering rich UI components inline in the chat via tool calls.

Read `CLAUDE.md` first, and consult the skills in `.claude/skills/` (`ai-chat-tools`,
`portfolio-content`, `portfolio-ui`) before writing code.

## Core experience

1. **Landing page (`/`)**
   - Full-viewport hero: greeting ("Hey, I'm {name} 👋"), big title with my role, large
     avatar/memoji image center stage.
   - A single chat input ("Ask me anything…") that submits to `/chat?query=...`.
   - 5 quick-action chips below the input: **Me, Projects, Skills, Fun, Contact** — each
     sends a preset question.
   - A small status pill top-right (e.g. "open to work / looking for internship") that
     pre-fills a recruiting question when clicked.
   - Subtle animated gradient background + Framer Motion entrance animations.

2. **Chat page (`/chat`)**
   - Streaming chat UI built on the Vercel AI SDK (`useChat`).
   - The assistant speaks **in first person as me**, with my personality (defined in
     `src/data/persona.ts` — see the `portfolio-content` skill).
   - The model has **tools** that render React components inline instead of plain text:
     `getProjects`, `getSkills`, `getResume`, `getContact`, `getMe` (presentation + photos),
     `getFun` (hobbies), `getInternship` (availability/what I'm looking for).
   - Quick-suggestion chips remain visible above the input so visitors can keep exploring.
   - Avatar reacts: small avatar in the header, typing/loading states.

3. **API route (`/api/chat`)**
   - Edge/Node route using the Vercel AI SDK `streamText` with tool definitions.
   - Provider behind an abstraction so I can swap Anthropic/OpenAI via env vars
     (default: `ANTHROPIC_API_KEY`, model from `AI_MODEL` env).
   - System prompt assembled from `src/data/persona.ts` + tool-usage instructions.

## Tech stack (non-negotiable)

- Next.js 15 (App Router) + TypeScript strict
- Tailwind CSS v4 + shadcn/ui
- Vercel AI SDK (`ai` package) for streaming + tool calling
- Framer Motion for animations
- pnpm; deployable to Vercel with zero config

## Build order

1. Scaffold the Next.js app, Tailwind, shadcn/ui, install deps.
2. Create `src/data/` content files with placeholder content for ME (clearly marked
   `// TODO: replace`), following the `portfolio-content` skill schema.
3. Build the API route + tool definitions per the `ai-chat-tools` skill.
4. Build the landing page, then the chat page with tool-result component rendering,
   following the `portfolio-ui` skill.
5. Add loading/error/empty states, mobile layout, and a `README.md` with setup steps
   (`.env.example` included).
6. Run `pnpm build` and fix every type/lint error before declaring done.

## Acceptance criteria

- `pnpm dev` works after only adding an API key to `.env`.
- Clicking each quick-action chip triggers the matching tool and renders its component.
- The assistant never breaks character and never invents facts not present in `src/data/`.
- Lighthouse mobile ≥ 90 performance on the landing page.
- No `any` types; `pnpm build` passes clean.

Start by showing me your plan as a short todo list, then execute it.
