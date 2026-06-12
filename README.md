# AI-Native Interactive Portfolio

An interactive portfolio where visitors chat with an AI version of you. Built with Next.js 15, Vercel AI SDK, Tailwind CSS v4, and Framer Motion. Inspired by [toukoum.fr](https://toukoum.fr).

## Quick Start

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Set up your API key:**

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and add your API key. Supports MiMo (Xiaomi), Anthropic, or OpenAI.

3. **Customize your content:**

   Edit the files in `src/data/` — every `// TODO: replace` marker shows where to add your own info:
   - `persona.ts` — your name, role, bio, personality
   - `projects.ts` — your projects with descriptions and links
   - `skills.ts` — your technical skills by category
   - `resume.ts` — education and experience
   - `contact.ts` — email and social links
   - `fun.ts` — hobbies and fun facts

4. **Run the dev server:**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **AI:** Vercel AI SDK (`ai` package) — streaming `useChat` + tool calling
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Animation:** Framer Motion
- **Provider:** MiMo (Xiaomi), Anthropic, or OpenAI — switchable via env vars

## Project Structure

```
src/
  app/
    page.tsx              # Landing hero with avatar + chat input
    chat/page.tsx         # Chat experience with streaming
    api/chat/route.ts     # AI SDK streamText + tools
  components/
    chat/                 # Chat shell, messages, input, chips
    tools/                # One component per AI tool
    ui/                   # shadcn primitives
  lib/ai/
    provider.ts           # Model selection from env
    tools.ts              # Tool definitions (zod schemas)
    system-prompt.ts      # Persona system prompt
  data/
    persona.ts            # Who you are
    projects.ts           # Your projects
    skills.ts             # Your skills
    resume.ts             # Education + experience
    contact.ts            # Email + socials
    fun.ts                # Hobbies + fun facts
```

## How It Works

1. Visitors land on a hero page with your avatar and a question input
2. They click a suggestion chip or type a question
3. The AI (powered by Vercel AI SDK) responds **as you** in first person
4. Tool calls render rich React components (project cards, skills grid, resume timeline) inline in the chat
5. The system prompt ensures the AI only states facts from your `src/data/` files

## Deployment

Deploy to Vercel with zero config:

```bash
pnpm build
vercel deploy
```

Set your `ANTHROPIC_API_KEY` in Vercel's environment variables.

## Commands

- `pnpm dev` — dev server on :3000
- `pnpm build` — production build (must pass clean)
- `pnpm lint` — ESLint + Prettier
