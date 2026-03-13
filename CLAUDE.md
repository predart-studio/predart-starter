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

## Client Onboarding
Run `pnpm new-client` to brand a cloned project. The wizard prompts for client slug, primary color, background, font, and border radius. It generates the full palette, updates tokens.json, syncs globals.css, and swaps the font + metadata in layout.tsx.

## Adding shadcn Components
```bash
pnpm dlx shadcn@latest add [component-name]
```
Components land in `components/ui/`. Do not modify files in this directory.

## Icons
Phosphor Icons for everything. Import from `@phosphor-icons/react`.
- `regular` / `bold` weight for UI icons (nav, actions, status)
- `duotone` weight for marketing/feature sections
- `thin` / `light` weight for decorative/subtle

## Folder Conventions
- `components/ui/` — shadcn components only, do not modify
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

## Scripts
- `pnpm dev` — start dev server (Turbopack)
- `pnpm build` — production build
- `pnpm lint` — ESLint
- `pnpm tokens` — sync tokens.json to globals.css
- `pnpm new-client` — interactive client branding wizard
