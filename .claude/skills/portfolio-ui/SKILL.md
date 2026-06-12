---
name: portfolio-ui
description: Design system and component conventions for this portfolio — hero layout, chat shell, tool-result cards, Framer Motion animation patterns, Tailwind/shadcn usage, and responsive rules. Use this skill whenever the task creates or restyles any component or page, adds animations, fixes layout or mobile issues, or builds a renderer for a new chat tool. Use it even for "small" visual tweaks so the site stays coherent.
---

# Portfolio UI

The visual identity: clean, playful, avatar-centric. Big type, lots of whitespace, soft
gradients, springy motion. Everything must feel like one product, not a component zoo.

## Design tokens

- Define palette as CSS variables in `globals.css` and map them in Tailwind; never hardcode
  hex in components.
- Type scale: hero name uses an oversized display size (clamp ~3rem–8rem), chat text is
  base/relaxed. One display font + one body font max (next/font, self-hosted).
- Radius: generous (`rounded-2xl`+ on cards, full on chips/pills).
- Background: subtle animated gradient or grain on the hero only — chat stays calm/neutral.

## Landing hero (`app/page.tsx`)

Structure top-to-bottom: status pill (top corner) → greeting line → giant role/name heading →
avatar image (the visual anchor, ~40% of viewport height) → chat input → 5 suggestion chips.
- Avatar via `next/image`, `priority`, explicit dimensions.
- Submitting input or clicking a chip routes to `/chat?query=…` (the chat page auto-sends it).
- Entrance: stagger children with Framer Motion (`staggerChildren: 0.08`, fade + 12px rise).

## Chat shell (`components/chat/`)

- Sticky compact header: small avatar + name + "AI portfolio" hint + back link.
- Message list: user messages right-aligned in soft bubbles; assistant messages full-width,
  no bubble, prose styles. Tool components render full-width below the assistant text.
- Sticky bottom input with suggestion chips row above it (horizontally scrollable on mobile).
- Auto-scroll to bottom on new content, but pause auto-scroll while the user scrolls up.
- Loading: animated typing indicator for text; per-tool skeletons (same footprint as the
  final component to avoid layout shift).

## Tool renderer conventions (`components/tools/`)

- One file per tool, default export, typed props matching the tool's output type.
- Projects → horizontally snapping card carousel on mobile, 2-col grid on desktop; each card:
  image, title, one-liner, tech chips, live/GitHub links.
- Skills → category sections with chip clouds; subtle stagger-in.
- Contact → single card with copy-to-clipboard email and social icon row (lucide-react).
- Resume → compact timeline + prominent "Download PDF" button.
- Every renderer must look intentional standalone AND inside the chat column (max-w ~3xl).

## Motion rules

- Use Framer Motion `motion.*` with spring transitions (`type: 'spring', stiffness ~260,
  damping ~24`) for entrances; never animate layout-critical properties on scroll.
- Hover: scale 1.02 + shadow on cards, nothing flashier.
- Respect `prefers-reduced-motion`: wrap variants so they collapse to opacity-only.

## Responsive & quality bar

- Design mobile-first at 375px; verify 768px and 1280px.
- Chat input must stay above the keyboard on mobile (use `dvh`, not `vh`).
- Images: `next/image` everywhere, blur placeholders for project shots.
- No layout shift from streaming: reserve space with skeletons.
- Accessibility: focusable chips, `aria-live="polite"` on the message list, alt text on all
  images, visible focus rings.
