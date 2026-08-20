# Build with Jazz UI Guide

This guide is the source of truth for the portfolio’s public interface. Use it when changing the landing page, chat, prep sheet, shared components, or public-facing copy.

## Product principles

1. **Lead with the outcome.** Explain what improves before naming tools or implementation details.
2. **One clear action per block.** Each section should have a primary next step; secondary actions must stay visually quieter.
3. **Evidence before inventory.** Selected work and delivered results come before long skill lists.
4. **Progressive detail.** The landing page stays scannable. MinMin AI and project detail views handle deeper questions.
5. **Calm technology.** The interface should feel capable and current without looking like a generic neon AI dashboard.

## Public information hierarchy

The landing page follows this sequence:

1. Positioning, status, and two primary actions
2. MinMin AI question field and five guided prompts
3. Three selected projects with a concrete delivered result
4. Three capability areas and a compact working toolkit
5. Background, proof, résumé, and credentials
6. One high-contrast contact panel

Do not add a new top-level section unless it introduces a distinct decision or type of evidence. Combine related proof rather than creating another card grid.

## Visual system

### Color roles

All colors are CSS variables in `src/app/globals.css` and are mapped through Tailwind.

| Token | Role |
|---|---|
| `background` | Warm page canvas |
| `foreground` | Deep green-black text and high-contrast surfaces |
| `card` | Primary content surface |
| `primary` | Actions, status, focus, and key labels |
| `muted` | Quiet section bands and tags |
| `highlight` | Fresh lime accent used sparingly for editorial emphasis |
| `border` | Structure without heavy shadows |
| `panel` | Stable dark overlay for image captions |

Never add hex colors directly to components. Add a semantic variable when a new color role is genuinely required.

### Typography

- Poppins is the single interface family; Geist Mono is reserved for technical values and code.
- Display headings use `.display-title`: bold, tightly tracked, and balanced.
- Section labels use `.eyebrow`: small, uppercase, and primary-colored.
- Body copy stays between 16–20px with generous line height and a readable maximum width.
- Avoid center-aligning long copy. Center alignment is reserved for short confirmation states.

### Shape and depth

- Buttons and inputs use `rounded-xl`; major cards use `rounded-2xl` or larger.
- Borders establish structure. Shadows are reserved for the hero portrait and elevated input surfaces.
- Avoid nested cards unless the inner surface contains a different interaction or content mode.
- Pills are for status and compact metadata, not every action.

## Component patterns

### Header

- Fixed on the portfolio, sticky inside task pages.
- Keep the primary navigation to three or four destinations.
- The booking action remains visible on wider screens; mobile uses one compact menu.

### Hero

- Lead with the short outcome headline from `src/data/persona.ts`.
- Keep the avatar as the main visual anchor.
- Show one filled action, one secondary action, one question field, and five horizontally scrollable prompts.
- The subtle grid is the only decorative page background. Do not add stock imagery or competing gradients.

### Project cards

- Show no more than three projects on the landing page.
- Every card needs: title, direct one-line summary, one delivered result, a visual or architecture preview, and a compact technology list.
- Use MinMin AI for extended case-study detail rather than expanding every card in place.

### Chat

- User messages are compact, right-aligned primary bubbles.
- MinMin responses are full-width with a quiet primary rule, not a large assistant bubble.
- Guided prompts scroll horizontally on small screens.
- Keep the composer above the mobile keyboard with `dvh` and a sticky bottom region.

### Prep sheet

- Use plain cards, direct instructions, and a single progress indicator.
- Mark required fields consistently and bring the first missing field into view on submission.
- “Send answers” is primary; copy and print actions remain secondary.

## Content style

- Use short, concrete sentences and active voice.
- Prefer “One lead pipeline for intake and estimating” over tool-first descriptions.
- Use “I” for Jazzmin’s portfolio voice and “you” for visitor actions.
- State measured results only when they exist in `src/data/`.
- Keep all personal facts and portfolio claims in `src/data/`; components only arrange that content.
- Use “MinMin AI” when referring to the interactive portfolio assistant.

## Motion and interaction

- Entrance transitions use a 12–16px rise and spring motion around stiffness 240–260 / damping 24–25.
- Stagger groups by roughly 0.06–0.08 seconds.
- Hover movement is limited to 1–2px translation or a very small image scale.
- Never loop decorative motion.
- `useReducedMotion` must remove transforms and delays; CSS also provides a global reduced-motion fallback.

## Responsive and accessibility checks

Verify at 375px, 768px, and 1280px:

- No horizontal page overflow; prompt rows may scroll intentionally.
- Headings wrap without clipping or isolated single words.
- Touch targets are at least 40px, with primary actions at least 48px tall.
- Navigation, chat, forms, and menus are fully keyboard accessible.
- Focus rings are visible in light and dark themes.
- Text and controls retain sufficient contrast across both themes.
- Images use `next/image`, explicit dimensions, and descriptive alt text.
- Motion respects reduced-motion preferences.

## Before shipping a UI change

1. Confirm the page still follows the intended information order.
2. Remove repeated copy and redundant actions.
3. Check light and dark theme token use.
4. Run `pnpm build` and `pnpm lint`.
5. Review the staged diff for secrets, personal data, and client-confidential content before commit.
