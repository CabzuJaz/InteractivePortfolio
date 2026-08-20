# Build with Jazz

Jazzmin Sicat-Cabizares’s interactive portfolio for AI automation, workflow engineering, and backend integrations. Visitors can scan selected work, review capabilities, or ask MinMin AI for a guided view of projects, skills, experience, availability, and services.

## Experience map

| Route | Purpose |
|---|---|
| `/` | Portfolio landing page with selected work, capabilities, proof, and contact actions |
| `/chat` | Streaming AI portfolio conversation with rich project and service cards |
| `/prep` | Structured automation discovery form for prospective clients |
| `/dashboard` | Internal client-project dashboard |
| `/client/[slug]` | Client-facing project view |

The public journey is deliberately short: understand the value → see evidence → explore details → start a conversation.

## Quick start

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

3. Add at least one supported AI provider key to `.env`. The current provider chain and all optional integration variables are documented in [Project Setup](docs/PROJECT-SETUP.md).

4. Start the app:

   ```bash
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Editing the portfolio

Personal facts and portfolio content live in `src/data/`:

- `persona.ts` — positioning, hero copy, services, voice, and boundaries
- `projects.ts` — case studies, results, technology, and architecture
- `skills.ts` — working toolkit by category
- `resume.ts` — experience, education, certificates, and résumé link
- `contact.ts` — availability, email, booking link, and social profiles
- `fun.ts` — optional personal context used by MinMin AI

Keep personal facts in these files rather than hardcoding them in pages or prompts. The AI system prompt is generated from the same data, so the visible portfolio and the chat stay aligned.

For visual changes, follow [UI Guide](docs/UI-GUIDE.md). It documents the current hierarchy, color roles, responsive behavior, component patterns, and copy rules.

## Stack

- Next.js 16 App Router and TypeScript
- Tailwind CSS v4 and shadcn/ui
- Vercel AI SDK for streaming chat and tool rendering
- Framer Motion for restrained, reduced-motion-aware transitions
- GoHighLevel, n8n, Resend, and Discord integrations
- pnpm package management

## Project structure

```text
src/
  app/
    page.tsx                 # Public portfolio
    chat/page.tsx            # Interactive AI portfolio
    prep/page.tsx            # Automation discovery form
    dashboard/page.tsx       # Client dashboard
    api/                     # Chat and integration routes
  components/
    chat/                    # Messages, suggestions, and composer
    tools/                   # Rich AI tool results
    dashboard/               # Dashboard UI
    ui/                      # Shared primitives
  data/                      # Portfolio source of truth
  lib/                       # AI, CRM, delivery, and utility logic
```

## Quality checks

Run both before merging or deploying:

```bash
pnpm build
pnpm lint
```

The UI must remain usable at 375px, 768px, and 1280px; keyboard focus must remain visible; and motion must respect `prefers-reduced-motion`.

## Documentation

- [UI Guide](docs/UI-GUIDE.md) — visual system and page patterns
- [Project Setup](docs/PROJECT-SETUP.md) — architecture, integrations, deployment, and operations
- [Manual Actions](MANUAL-ACTIONS.md) — owner-only account and credential tasks
- [Project Documentation Template](templates/project-documentation.md) — case-study handoff format

## Deployment

The production project is configured for Vercel. Push an approved, validated change to the connected branch and verify the resulting deployment. Environment values are managed in the deployment platform and must never be committed.
