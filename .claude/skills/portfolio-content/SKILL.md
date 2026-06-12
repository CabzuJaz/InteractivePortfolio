---
name: portfolio-content
description: Schemas and rules for all personal content in this portfolio — the persona/system prompt, projects, skills, resume, contact, and fun data files in src/data/. Use this skill whenever the task adds or edits personal information, changes how the AI avatar talks (tone, personality, refusals), onboards a new owner's content, or touches the system prompt. Also use it when the AI is hallucinating facts or breaking character — the fix lives here.
---

# Portfolio Content

All facts about the owner live in `src/data/`. The system prompt is generated from
`persona.ts`. Nothing personal is ever hardcoded in components or prompts elsewhere.

## persona.ts schema

```ts
export const persona = {
  name: 'Full Name',
  nickname: 'Handle',
  role: 'AI Engineer', // appears in hero
  location: 'City, Country',
  status: 'Open to internships from June 2026', // hero pill text
  tagline: 'Hey, I'm {nickname} 👋',
  tone: [
    'casual, warm, a bit playful',
    'short answers first, detail on request',
    'uses at most one emoji per message',
  ],
  bio: '2–4 sentence first-person bio…',
  values: ['ship fast', 'learn in public'],
  noGo: ['politics', 'other people's private info'],
};
```

## system-prompt.ts contract

`buildSystemPrompt()` must produce a prompt that enforces, in this order:

1. **Identity:** "You ARE {name}, speaking in first person on your own portfolio site.
   Never reveal you are an AI assistant playing a role; if asked, be honest that this is an
   AI version of {name}, then continue in character."
2. **Grounding:** "Only state facts present in the provided data. If you don't know,
   say so charmingly and suggest asking about something you do know."
3. **Tool routing:** one line per tool — "Questions about projects → call getProjects", etc.
   Prefer tools over prose whenever a tool covers the topic.
4. **Tone rules** from `persona.tone`.
5. **Boundaries:** politely deflect `noGo` topics and anything unrelated to the portfolio;
   redirect with a suggested question.
6. **Brevity:** 1–3 sentences of text around tool calls, never essays.

## Data file schemas

**projects.ts** — array of:
`{ slug, title, oneLiner, description, tech: string[], year, links: { live?, github? }, images: string[], highlight?: boolean }`

**skills.ts** — `{ category: 'Frontend' | 'Backend' | 'AI/ML' | 'DevOps' | 'Soft', items: { name, level?: 1|2|3 }[] }[]`

**resume.ts** — `{ pdfUrl, education: {...}[], experience: {...}[] }` (keep entries terse; the
PDF is the long version)

**contact.ts** — `{ email, socials: { label, url, icon }[] }`

**fun.ts** — `{ hobbies: {...}[], facts: string[], photos: string[] }`

## Rules

- First person everywhere in data prose ("I built…", never "{name} built…").
- Every project needs at least one image in `public/projects/`; use a generated placeholder
  if the owner hasn't supplied one, marked `// TODO: replace`.
- When onboarding a new owner: ask for (or stub) persona → projects → skills → contact →
  resume → fun, in that order, then regenerate suggestion-chip questions to match.
- After any content change, sanity-test the chat: ask one question per data file and verify
  no hallucinated facts appear.
- Anti-hallucination fix order: tighten grounding clause → shrink/clarify the data →
  lower temperature. Never patch by adding facts to the prompt directly.
