# Build with Jazz Product Brief

Build and maintain an outcome-led, AI-native portfolio for Jazzmin Sicat-Cabizares. The public site should be useful in two modes: a fast, scannable portfolio for visitors who want proof quickly, and an interactive AI portfolio for visitors who want deeper context.

Read `CLAUDE.md`, `docs/UI-GUIDE.md`, and the applicable skills in `.claude/skills/` before changing the product.

## Core experience

1. **Portfolio (`/`)**
   - Lead with a direct outcome statement, current availability, role, and location.
   - Keep Jazzmin’s avatar as the visual anchor.
   - Offer two clear actions: view selected work or ask MinMin AI.
   - Include one question field and five guided prompts that route to `/chat?query=...`.
   - Present three selected projects with a summary, delivered result, visual, and compact toolkit.
   - Follow with capabilities, background, credentials, and one strong contact panel.

2. **Interactive portfolio (`/chat`)**
   - Stream responses with the Vercel AI SDK.
   - Be transparent that MinMin is an AI version of Jazzmin while speaking in first person from the portfolio data.
   - Prefer rich tool results for projects, skills, experience, contact, availability, contracts, prep sheets, and business analysis.
   - Keep MinMin replies full-width and visually calm; keep user messages compact and right-aligned.
   - Keep guided prompts and the composer available above the mobile keyboard.

3. **Automation discovery (`/prep`)**
   - Gather contact details, current setup, pain points, and goals in three clear sections.
   - Use direct instructions, consistent required-field markers, and a simple progress indicator.
   - Make send the primary action; keep copy and print secondary.

4. **AI and integrations**
   - Build the system prompt from `src/data/`; never duplicate personal facts in prompts.
   - Keep provider selection behind `src/lib/ai/provider.ts`.
   - Keep GoHighLevel calls behind `src/lib/ghl/client.ts`.
   - Stream first and render tool loading states that reserve the final component’s space.

## Product principles

- Lead with outcomes, then evidence, then implementation detail.
- Keep the landing page concise; use MinMin AI for progressive detail.
- Use one dominant action per content block.
- Prefer semantic theme tokens and preserve the established Build with Jazz identity: dark-first surfaces, cyan accents, and restrained cyan-to-blue gradients.
- Avoid generic neon AI-dashboard styling, excessive gradients, and repeated card grids.
- Respect keyboard use, reduced motion, touch targets, and 375px layouts.

## Stack

- Next.js 16 App Router and strict TypeScript
- Tailwind CSS v4 and shadcn/ui
- Vercel AI SDK for streaming and tool calls
- Framer Motion for restrained transitions
- pnpm and Vercel deployment

## Acceptance criteria

- `pnpm build` and `pnpm lint` pass.
- Public pages work at 375px, 768px, and 1280px.
- Every guided prompt reaches a useful portfolio or workflow path.
- The assistant does not invent facts outside `src/data/`.
- Focus remains visible in light and dark themes.
- No secret, personal client data, or environment value enters the staged diff.
