# Predart Starter Template

## Stack
- Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui v4
- Framer Motion, GSAP + ScrollTrigger, Lenis (smooth scroll)
- Phosphor Icons (`@phosphor-icons/react`)
- next-themes (dark mode)
- React Hook Form + Zod (forms)

## Token Workflow
1. Edit `tokens.json` (oklch color values)
2. Run `pnpm tokens` to regenerate `app/globals.css`
3. NEVER edit `app/globals.css` directly — it is generated

## Project Context Pack (Read This First)
For serious client projects, check `docs/project-context/` before implementing.

Priority reading order:
1. `docs/project-context/01-project-context.md`
2. `docs/project-context/02-design-direction.md`
3. `docs/project-context/03-motion-direction.md`
4. `docs/project-context/04-implementation-direction.md`
5. `docs/project-context/05-build-init-prompt.md`
6. `docs/project-context/06-template-usage-rules.md`
7. `docs/project-context/07-reference-notes.md` (if present)

If those files exist, treat them as the primary source of project direction.

## Implementation Discipline
- Respect `tokens.json` as the source of truth for colors, radius, and brand tokens
- Do not hardcode values that should come from the token workflow
- Prefer starter primitives from `components/ui/` where appropriate
- Put custom storytelling/building blocks in `components/sections/`
- Keep persistent structure in `components/layout/`
- Obey `docs/project-context/06-template-usage-rules.md`
- Do not use libraries/components just because they exist in the starter
- Follow the project-specific allowed/optional/out-of-scope guidance from `04-implementation-direction.md`

## Client Onboarding
Run `pnpm new-client` to brand a cloned project. The wizard prompts for client slug, primary color, background, font, and border radius. It generates the full palette, updates tokens.json, syncs globals.css, and swaps the font + metadata in layout.tsx.

Run `pnpm init-project` to interpret the current project context pack before implementation starts. This will generate:
- `docs/project-context/project-profile.json`
- `docs/project-context/bootstrap-notes.md`

Use those outputs as compact constraints alongside the richer markdown direction files.

## Adding shadcn Components
```bash
pnpm dlx shadcn@latest add [component-name]
```
Components land in `components/ui/`. Do not modify files in this directory lightly.

## Icons
Phosphor Icons for everything. Import from `@phosphor-icons/react`.
- `regular` / `bold` weight for UI icons (nav, actions, status)
- `duotone` weight for marketing/feature sections
- `thin` / `light` weight for decorative/subtle

## Folder Conventions
- `components/ui/` — shadcn components only, do not modify unless necessary
- `components/sections/` — full-width page sections (Hero, Features, CTA, etc.)
- `components/layout/` — Header, Footer, Nav, persistent layout components
- `components/animations/` — animation wrapper components (LenisProvider, etc.)
- `lib/` — utilities, helpers
- `hooks/` — custom React hooks
- `types/` — shared TypeScript types
- `scripts/` — Node.js build/setup scripts

## Animation Rules
- **Framer Motion** for component-scoped: enter/exit, layout transitions, hover/tap, drag
- **GSAP + ScrollTrigger** for page-scoped: scroll timelines, pinning, sequenced choreography
- Never animate the same property on the same element from both
- Use `dynamic(() => import(...), { ssr: false })` for GSAP-heavy components
- Always add `prefers-reduced-motion` media query checks

## Component Libraries
See `docs/component-libraries.md` for the full curated reference of per-project library choices, install commands, and client type playbooks.

## Design Brainstorm
Run `/design-brainstorm` when:
- you do not yet have a full external project context pack
- you need a lightweight repo-local brainstorm
- you want to refine an existing direction from inside the repo

It should no longer be treated as the only serious-project entrypoint.

Scripts in `scripts/design/`:
- `collect-reference.js <url>` — captures viewport screenshots + CSS signals (requires Playwright)
- `match-playbook.js "<type>"` — matches business type to component stack playbook
- `scaffold-brief.js` — generates design-brief.md from JSON (stdin)
- `validate-brief.js` — validates brief completeness and consistency

## Scripts
- `pnpm dev` — start dev server (Turbopack)
- `pnpm build` — production build
- `pnpm lint` — ESLint
- `pnpm tokens` — sync tokens.json to globals.css
- `pnpm new-client` — interactive client branding wizard
- `pnpm init-project` — inspect the current project context pack
