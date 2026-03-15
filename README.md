# Predart Starter

Reusable Next.js starter template for client projects. Clone it, initialize the project, and build from a prepared project context pack.

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

## The New Workflow

### Serious client projects
Use an external design-intelligence flow first, then let the repo consume the results.

1. Brainstorm / synthesize **outside the repo**
   - Notion hub
   - PDFs / decks
   - websites
   - videos / motion references
   - screenshots / notes
2. Generate a **project context pack**
   - markdown files under `docs/project-context/`
   - visual references under `docs/project-context/references/`
3. Clone this starter
4. Add the project context pack
5. Run `pnpm init-project`
6. Review the generated `project-profile.json` and `bootstrap-notes.md`
7. Run `pnpm new-client`
8. Build with Claude Code or another coding agent

### Quick / fallback projects
If you do not have a full external synthesis pack yet, you can still use:

- `/design-brainstorm`

Treat it as:
- a fallback mode
- a lightweight repo-local brainstorm
- a refinement tool for gaps in an existing direction

## Quick Start

```bash
# Clone for a new client
git clone https://github.com/predart-studio/predart-starter.git predart-clientname
cd predart-clientname
rm -rf .git && git init

# Install
pnpm install

# Inspect project context pack (recommended)
pnpm init-project

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
| `pnpm init-project` | Interpret the project context pack, write `project-profile.json`, and generate `bootstrap-notes.md` |

## Project Context Pack

This repo now expects serious client projects to carry structured context under:

```txt
docs/project-context/
```

Recommended core files:
- `01-project-context.md`
- `02-design-direction.md`
- `03-motion-direction.md`
- `04-implementation-direction.md`
- `05-build-init-prompt.md`
- `06-template-usage-rules.md`

Optional:
- `07-reference-notes.md`
- `references/visual/`
- `references/motion/`
- `references/pdf/`

These files are the bridge between:
- design thinking / synthesis outside the repo
- disciplined implementation inside the repo

## Design Brainstorm

Run `/design-brainstorm` in Claude Code when:
- the project is lightweight
- you do not have a full context pack yet
- you want to refine an existing direction from inside the repo

It produces `docs/design-brief.md` covering business context, visual mood, color, typography, layout, animation style, section plan, and component stack.

Scripts in `scripts/design/`:
- `collect-reference.js <url>` — captures viewport screenshots + CSS signals (requires Playwright)
- `match-playbook.js "<type>"` — matches business type to component stack playbook
- `scaffold-brief.js` — generates design-brief.md from JSON (stdin)
- `validate-brief.js` — validates brief completeness and consistency

## Token Workflow

Colors and radius live in `tokens.json` (oklch format). Edit the file, run `pnpm tokens`, done.

Important:
- `tokens.json` is the source of truth
- do not hardcode parallel token values in project components
- do not freestyle-edit generated token output without intention

## Client Onboarding

`pnpm new-client` prompts for:
- Client slug (e.g. `minerva`)
- Primary brand color (hex)
- Background color, font, border radius (optional, smart defaults)

It auto-generates the full palette (light + dark draft), updates `tokens.json`, regenerates CSS, and swaps the font + metadata in `layout.tsx`.

## Folder Structure

```txt
app/                  → Pages and layouts
components/
  ui/                 → shadcn components (primitive layer; avoid modifying)
  sections/           → Full-width project sections
  layout/             → Header, Footer, Nav
  animations/         → Animation wrappers
hooks/                → Custom React hooks
lib/                  → Utilities
types/                → Shared TypeScript types
scripts/              → Build/setup scripts
docs/                 → Specs, context, component library reference
  project-context/    → Project context pack + visual references
```

## Docs

- **`CLAUDE.md`** — AI assistant project context and implementation rules
- **`docs/component-libraries.md`** — Curated library reference with install commands, quick-reference tables, and client type playbooks
- **`docs/project-context/`** — Project-specific direction, implementation rules, and visual references

---

Built by [Predart Studio](https://predart.com)
