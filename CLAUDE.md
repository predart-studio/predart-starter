# Predart Starter Template

## Stack
- Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui v4
- Sanity CMS (embedded Studio at `/studio`, next-sanity Live Content API)
- Framer Motion, GSAP + ScrollTrigger, Lenis (smooth scroll)
- Phosphor Icons (`@phosphor-icons/react`)
- next-themes (dark mode)
- React Hook Form + Zod (forms)

## Token Workflow
1. Edit `tokens.json` — colors (oklch), `radius`, `font`, plus the design-system namespaces: `type`
   (editorial type scale), `space` (`gutter` / `section-y` / `content-max`), `grid` (12-col), and
   `motion` (house ease + durations)
2. Run `pnpm tokens` to regenerate **both** `app/globals.css` (CSS vars) and `lib/motion.generated.ts`
   (house easing + duration constants for GSAP/Framer)
3. NEVER edit `app/globals.css` or `lib/motion.generated.ts` directly — both are generated
4. Semantic type utilities (`.label`, `.kicker`, `.prose-measure`, balanced headings) live in the
   hand-managed `app/typography.css`, imported in `layout.tsx` AFTER globals.css

## Grid System
All landing-page sections lay out on ONE shared 12-column grid. Do not roll a per-section grid.
- Tokens live in `tokens.json > grid` (`--grid-cols: 12`, `--grid-gutter`, `--grid-baseline` = 8px) and flow through `pnpm tokens`. Page width is `--container-content` = `min(92vw, 128rem)`.
- Wrap section content in `<GridWrap>` (`components/grid.tsx`) — the centered max-width field carrying the 12-col track + `--grid-gutter`.
- Place content by column line with `col-span-*` / `col-start-*` (e.g. `col-span-12 md:col-span-7`). Equal-N child rows: a `col-span-12` sub-grid (`grid-cols-N gap-[var(--grid-gutter)]`, N divides 12).
- Position on the grid, but bound prose **measure** separately with `prose-measure` (68ch) or a rem `max-w`, so text stays readable as the field widens.
- Section padding stays on `<section>` (`px-[var(--spacing-gutter)] py-[var(--spacing-section-y)]`); GridWrap is the inner field.
- Dev: press `g` to toggle the column overlay (`GridOverlay`, dev-only, shares GridWrap geometry). Mount `<GridOverlay />` once per page (e.g. in `app/page.tsx`).

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
- For ANY motion work, use the **motion-director** skill (`.claude/skills/motion-director/`) — the
  canonical timing/easing/distance/stagger system, recipes, and a deterministic auditor
  (`python3 .claude/skills/motion-director/scripts/audit-motion.py`). It keeps the whole site speaking
  one motion language instead of scattering one-off values.

## Sanity CMS
Built in by default — embedded Studio at `/studio`, project-agnostic (each client
connects its own project). Full guide: `docs/sanity.md`.

- **Activation**: env-guarded. Everything is gated on `isSanityConfigured` from
  `sanity/env.ts`; with no `NEXT_PUBLIC_SANITY_PROJECT_ID` the site builds/runs
  unchanged and stays fully static. Connect a project with `pnpm setup-sanity`.
- **Never throw on missing env** — keep new CMS code behind `isSanityConfigured`
  so a fresh clone always builds.
- **Schema** lives in `sanity/schemaTypes/{documents,objects,blocks}`. Use
  `defineType`/`defineField`/`defineArrayMember`, an icon, and a `preview` on
  every type. Register new types in `schemaTypes/index.ts`.
- **Page builder**: top-level pages are CMS-driven via the `page` type +
  `app/[slug]/page.tsx`. Add a block → schema in `blocks/`, register in
  `pageBuilder.ts` + `index.ts`, add a `case` in
  `components/sanity/page-builder.tsx`.
- **Fetching**: use `sanityFetch` from `sanity/lib/live` (Live Content API).
  Queries go in `sanity/lib/queries.ts` wrapped in `defineQuery`.
- **TypeGen**: run `pnpm typegen` after any query or schema change
  (`sanity.types.ts` is generated; never hand-edit). Embedded Studio has no
  watch mode.
- **Don't** import `sanity/lib/token.ts` into client components, and **don't**
  import `sanity.config.ts` into a Server Component (mount the Studio behind the
  `'use client'` boundary in `app/studio/[[...tool]]/Studio.tsx`).

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
- `pnpm setup-sanity` — connect a Sanity project (writes `.env.local`)
- `pnpm typegen` — regenerate `sanity.types.ts` from schema + queries
