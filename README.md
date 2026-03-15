# Predart Starter

Reusable Next.js starter template for client projects. Clone it, run the branding wizard, ship.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript**
- **Tailwind CSS v4** (CSS-based config, oklch colors)
- **shadcn/ui v4** (55+ components)
- **Framer Motion** — component animations
- **GSAP + ScrollTrigger** — scroll-driven animations
- **Lenis** — smooth scroll
- **Phosphor Icons** — 9000+ icons, 6 weights
- **React Hook Form + Zod** — forms & validation
- **next-themes** — dark mode

## Quick Start

```bash
# Clone for a new client
git clone https://github.com/cristian-preda/predart-starter.git predart-clientname
cd predart-clientname
rm -rf .git && git init

# Install
pnpm install

# Design brainstorm (optional — drop references into docs/references/ first)
/design-brainstorm

# Brand it (interactive wizard)
pnpm new-client

# Dev
pnpm dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm tokens` | Sync `tokens.json` → `globals.css` |
| `pnpm new-client` | Interactive client branding wizard |

## Design Brainstorm

Run `/design-brainstorm` in Claude Code before implementation to converge on a visual direction. It produces `docs/design-brief.md` covering business context, visual mood, color, typography, layout, animation style, section plan, and component stack.

**Pre-load references:** Drop screenshots or mood boards into `docs/references/` before running — the brainstorm will analyze them automatically.

Scripts in `scripts/design/`:
- `collect-reference.js <url>` — captures viewport screenshots + CSS signals (requires Playwright)
- `match-playbook.js "<type>"` — matches business type to component stack playbook
- `scaffold-brief.js` — generates design-brief.md from JSON (stdin)
- `validate-brief.js` — validates brief completeness and consistency

## Token Workflow

Colors and radius live in `tokens.json` (oklch format). Edit the file, run `pnpm tokens`, done. Never edit `globals.css` directly — it's generated.

## Client Onboarding

`pnpm new-client` prompts for:
- Client slug (e.g. "minerva")
- Primary brand color (hex)
- Background color, font, border radius (optional, smart defaults)

It auto-generates the full palette (light + dark draft), updates `tokens.json`, regenerates CSS, and swaps the font + metadata in `layout.tsx`.

## Folder Structure

```
app/                  → Pages and layouts
components/
  ui/                 → shadcn components (don't modify)
  sections/           → Full-width page sections (Hero, Features, CTA)
  layout/             → Header, Footer, Nav
  animations/         → Animation wrappers (LenisProvider)
hooks/                → Custom React hooks
lib/                  → Utilities
types/                → Shared TypeScript types
scripts/              → Build/setup scripts
docs/                 → Component library reference, specs
```

## Docs

- **`CLAUDE.md`** — AI assistant project context
- **`docs/component-libraries.md`** — Curated library reference with install commands, quick-reference tables, and client type playbooks

---

Built by [Predart Studio](https://predart.com)
