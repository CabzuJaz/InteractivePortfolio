# CLAUDE.md — AI-Native Portfolio

Project memory for Claude Code. Read this before any task in this repo.

## What this project is

An interactive portfolio in the style of toukoum.fr: the whole site is a conversation with
an AI avatar of the owner. Visitors ask questions; the model answers in first person and
calls tools that render rich React components (project cards, skills grid, resume, contact
card) directly inside the chat stream.

## Stack

- **Framework:** Next.js 15, App Router, TypeScript (strict mode, no `any`)
- **Styling:** Tailwind CSS v4 + shadcn/ui components (`src/components/ui`)
- **AI:** Vercel AI SDK (`ai` package) — `streamText` on the server, `useChat` on the client
- **Provider:** abstracted in `src/lib/ai/provider.ts`; default Anthropic, switchable via env
- **Animation:** Framer Motion
- **Package manager:** pnpm only (never npm/yarn). Node ≥ 18.

## Directory layout

```
src/
  app/
    page.tsx              # landing hero
    chat/page.tsx         # chat experience
    api/chat/route.ts     # streamText + tools
  components/
    chat/                 # chat shell, message list, input, suggestion chips
    tools/                # one renderer component per AI tool (Projects, Skills, ...)
    ui/                   # shadcn primitives
  lib/ai/
    provider.ts           # model selection from env
    tools.ts              # tool definitions (zod schemas)
    system-prompt.ts      # builds persona system prompt
  data/
    persona.ts            # personality, tone, bio — single source of truth for "who I am"
    projects.ts           # project entries
    skills.ts             # skills grouped by category
    resume.ts, contact.ts, fun.ts
public/                   # avatar images, project screenshots
```

## Hard rules

1. **All personal facts live in `src/data/`.** The model must never be given facts inline in
   prompts or components. To change content, edit data files only.
2. **One tool = one renderer component.** Tool `getProjects` ↔ `components/tools/Projects.tsx`.
   The mapping lives in a single switch in the chat message renderer.
3. **Tools return structured data, not prose.** The component renders it; the model may add a
   one-line first-person intro before/after the tool call.
4. **Persona discipline:** the system prompt instructs the model to (a) always answer in first
   person as the owner, (b) refuse to invent facts not in the data files, (c) redirect
   off-topic questions back to the portfolio with humor.
5. **Secrets:** only via `.env` (`ANTHROPIC_API_KEY` or `OPENAI_API_KEY`, optional
   `GITHUB_TOKEN`, `AI_MODEL`). Keep `.env.example` updated. Never commit keys.
6. **Streaming first:** never block the UI on a full completion; always render partial text
   and tool loading skeletons.

## Commands

- `pnpm dev` — dev server on :3000
- `pnpm build` — must pass with zero type errors before any task is "done"
- `pnpm lint` — ESLint + Prettier; fix, don't suppress

## Skills in this repo

Consult these in `.claude/skills/` — they are authoritative for their domains:

- **ai-chat-tools** — whenever touching `/api/chat`, tool definitions, streaming, or adding a
  new AI tool end-to-end.
- **portfolio-content** — whenever adding/editing personal data, persona, or system prompt.
- **portfolio-ui** — whenever building or restyling components, animations, or layout.

## Definition of done (every task)

- Type-checks and builds clean
- Works on mobile (375px) and desktop
- New tools wired end-to-end: zod schema → API route → renderer → suggestion chip if relevant
- No placeholder text left behind unless explicitly marked `// TODO: replace`
