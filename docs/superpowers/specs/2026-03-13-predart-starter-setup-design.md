# Predart Starter Template — Design Spec

**Date:** 2026-03-13
**Status:** Approved

## Overview

Complete the Predart Starter Template — a reusable Next.js project cloned per client. Finish remaining Phase 1 setup (token system, animations, layout, folder structure, docs) and build an interactive client onboarding wizard that replaces the manual Phase 2 checklist.

### Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4 (CSS-based config, no tailwind.config.ts)
- shadcn/ui v4 (oklch colors, `@import "shadcn/tailwind.css"`)
- Framer Motion
- GSAP + ScrollTrigger
- Lenis (smooth scroll)
- pnpm

## 1. Token System

### tokens.json (project root)

Stores the full color palette in oklch format. Structure:

```json
{
  "_comment": "Edit per client. Run: pnpm tokens after every change.",
  "light": {
    "background": "oklch(1 0 0)",
    "foreground": "oklch(0.145 0 0)",
    "primary": "oklch(0.205 0 0)",
    "primary-foreground": "oklch(0.985 0 0)",
    "secondary": "oklch(0.97 0 0)",
    "secondary-foreground": "oklch(0.205 0 0)",
    "muted": "oklch(0.97 0 0)",
    "muted-foreground": "oklch(0.556 0 0)",
    "accent": "oklch(0.97 0 0)",
    "accent-foreground": "oklch(0.205 0 0)",
    "destructive": "oklch(0.577 0.245 27.325)",
    "border": "oklch(0.922 0 0)",
    "input": "oklch(0.922 0 0)",
    "ring": "oklch(0.708 0 0)",
    "card": "oklch(1 0 0)",
    "card-foreground": "oklch(0.145 0 0)",
    "popover": "oklch(1 0 0)",
    "popover-foreground": "oklch(0.145 0 0)",
    "chart-1": "oklch(0.809 0.105 251.813)",
    "chart-2": "oklch(0.623 0.214 259.815)",
    "chart-3": "oklch(0.546 0.245 262.881)",
    "chart-4": "oklch(0.488 0.243 264.376)",
    "chart-5": "oklch(0.424 0.199 265.638)",
    "sidebar": "oklch(0.985 0 0)",
    "sidebar-foreground": "oklch(0.145 0 0)",
    "sidebar-primary": "oklch(0.205 0 0)",
    "sidebar-primary-foreground": "oklch(0.985 0 0)",
    "sidebar-accent": "oklch(0.97 0 0)",
    "sidebar-accent-foreground": "oklch(0.205 0 0)",
    "sidebar-border": "oklch(0.922 0 0)",
    "sidebar-ring": "oklch(0.708 0 0)"
  },
  "dark": {
    "background": "oklch(0.145 0 0)",
    "foreground": "oklch(0.985 0 0)",
    "primary": "oklch(0.922 0 0)",
    "primary-foreground": "oklch(0.205 0 0)",
    "secondary": "oklch(0.269 0 0)",
    "secondary-foreground": "oklch(0.985 0 0)",
    "muted": "oklch(0.269 0 0)",
    "muted-foreground": "oklch(0.708 0 0)",
    "accent": "oklch(0.269 0 0)",
    "accent-foreground": "oklch(0.985 0 0)",
    "destructive": "oklch(0.704 0.191 22.216)",
    "border": "oklch(1 0 0 / 10%)",
    "input": "oklch(1 0 0 / 15%)",
    "ring": "oklch(0.556 0 0)",
    "card": "oklch(0.205 0 0)",
    "card-foreground": "oklch(0.985 0 0)",
    "popover": "oklch(0.205 0 0)",
    "popover-foreground": "oklch(0.985 0 0)",
    "chart-1": "oklch(0.809 0.105 251.813)",
    "chart-2": "oklch(0.623 0.214 259.815)",
    "chart-3": "oklch(0.546 0.245 262.881)",
    "chart-4": "oklch(0.488 0.243 264.376)",
    "chart-5": "oklch(0.424 0.199 265.638)",
    "sidebar": "oklch(0.205 0 0)",
    "sidebar-foreground": "oklch(0.985 0 0)",
    "sidebar-primary": "oklch(0.488 0.243 264.376)",
    "sidebar-primary-foreground": "oklch(0.985 0 0)",
    "sidebar-accent": "oklch(0.269 0 0)",
    "sidebar-accent-foreground": "oklch(0.985 0 0)",
    "sidebar-border": "oklch(1 0 0 / 10%)",
    "sidebar-ring": "oklch(0.556 0 0)"
  },
  "radius": "0.625rem",
  "font": {
    "sans": "Inter",
    "mono": "Geist Mono"
  }
}
```

Values match the current globals.css (shadcn v4 defaults) so tokens.json becomes the single source of truth.

### scripts/sync-tokens.js

Node.js script (no external dependencies — `fs` and `path` only).

Reads `tokens.json` and generates the **complete** `app/globals.css` with this structure:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... all color mappings ... */
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}

:root {
  /* light values from tokens.json */
}

.dark {
  /* dark values from tokens.json */
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
}
```

The `@theme inline` block has a fixed set of mappings (color-* → var(--*), radius-* scales, font vars). The `:root` and `.dark` blocks are generated dynamically from tokens.json light/dark sections. The radius value comes from tokens.json.

**Important:** The `font` section in tokens.json is consumed ONLY by `new-client.js` (to know which Google Fonts to import in layout.tsx). `sync-tokens.js` does NOT write font variables into `:root` — the `--font-sans` and `--font-mono` CSS variables are set by Next.js font optimization via the `variable` option in layout.tsx. Writing them into `:root` would conflict.

Error handling: the script exits with code 1 and a descriptive message if tokens.json is missing, contains malformed JSON, or is missing required `light`/`dark` sections.

Logs `Tokens synced to globals.css` on success. Oklch values are written as-is from tokens.json (no rounding or transformation).

### package.json script

```json
"tokens": "node scripts/sync-tokens.js"
```

## 2. Client Onboarding Wizard

### scripts/new-client.js

Interactive Node.js CLI — no external dependencies (`fs`, `path`, `readline`).

**Required inputs:**
- Client slug (e.g. "minerva")
- Primary color (hex, e.g. "#1a56db")

**Optional inputs (Enter for defaults):**
- Background hex (default: #ffffff)
- Font name (default: Inter)
- Border radius (default: 0.5rem)

**Palette generation:**

Built-in hex-to-oklch conversion (sRGB → linear RGB → XYZ D65 → Oklab → Oklch). No dependencies.

From the primary color and background, the wizard derives:

- `primary`: direct hex→oklch conversion
- `primary-foreground`: white or near-black, whichever has better WCAG contrast against primary
- `foreground`: high-contrast counterpart of background
- `accent`: primary hue at low chroma + high lightness
- `muted`: near-neutral with hint of primary hue
- `secondary`: neutral (no hue)
- `destructive`: fixed red
- `border`, `input`, `ring`: derived from foreground at various lightness levels
- `card`, `popover`: match background
- `sidebar-*`: derived from core palette
- `chart-*`: kept at defaults (blue spectrum)

**Dark mode generation:**

Auto-generated as a functional **draft**, clearly messaged:

```
Light palette generated
Dark palette generated (draft - review and adjust)
```

Dark mode is derived by inverting lightness curves and adjusting chroma, giving a working starting point. The user is expected to refine it visually, edit tokens.json, and re-run `pnpm tokens`.

**Post-confirmation actions:**
1. Writes updated `tokens.json`
2. Runs `sync-tokens.js` (regenerates globals.css)
3. Updates font in `app/layout.tsx` using comment delimiters:
   - layout.tsx will contain `// PREDART:FONT_START` and `// PREDART:FONT_END` markers
   - The script replaces everything between these markers with the new font import and variable
   - Multi-word Google Font names are converted to Next.js format: "DM Sans" → `DM_Sans`, "Playfair Display" → `Playfair_Display`
   - The mono font (Geist_Mono) is never touched — only the sans font is swapped
4. Updates metadata title in `app/layout.tsx` using `// PREDART:META_START` / `// PREDART:META_END` markers (capitalizes slug for title)

**Does NOT do:**
- Git operations (clone, init, remote, push)
- GitHub repo creation

### package.json script

```json
"new-client": "node scripts/new-client.js"
```

## 3. LenisProvider

### components/animations/lenis-provider.tsx

`'use client'` component.

- Module-level: `gsap.registerPlugin(ScrollTrigger)`
- `useEffect` on mount:
  - Create Lenis instance
  - `lenis.on('scroll', ScrollTrigger.update)`
  - Add RAF callback to `gsap.ticker`: `gsap.ticker.add((time) => lenis.raf(time * 1000))`
  - `gsap.ticker.lagSmoothing(0)`
- Cleanup on unmount:
  - `lenis.destroy()`
  - Remove ticker callback
- Renders `children: React.ReactNode` passthrough

## 4. Layout Update

### app/layout.tsx

- Font: `Inter` from `next/font/google` with `variable: '--font-sans'`, `subsets: ['latin']`
- Mono font: Keep `Geist_Mono` from `next/font/google` with `variable: '--font-mono'`, `subsets: ['latin']`
- Remove: Geist (sans), Figtree imports
- Import: `LenisProvider` from `@/components/animations/lenis-provider`
- Import: `./globals.css`
- Metadata: `title: "Predart Starter"`, `description: "Predart Studio"`
- html: `lang="en"` `className={\`${inter.variable} ${geistMono.variable}\`}`
- body: `className="font-sans antialiased"` (bg-background/text-foreground handled in globals.css `@layer base`)
- Children wrapped in `<LenisProvider>`

## 5. Folder Structure

Create missing directories (with .gitkeep to ensure they're tracked):

- `components/sections/`
- `components/layout/`
- `components/animations/` (will contain lenis-provider.tsx)
- `scripts/` (will contain sync-tokens.js, new-client.js)
- `types/`

Already exists (from shadcn):
- `hooks/` (contains use-mobile.ts)
- `lib/` (contains utils.ts)

## 6. CLAUDE.md

Project documentation for Claude Code sessions. Covers:

- Stack: Next.js 16, App Router, TypeScript, Tailwind v4, shadcn v4, Framer Motion, GSAP + ScrollTrigger, Lenis
- Token workflow: edit tokens.json → `pnpm tokens` → never edit globals.css directly
- Client onboarding: `pnpm new-client`
- shadcn: `pnpm dlx shadcn@latest add [name]` → components/ui/, don't modify
- Folder conventions: sections/ (page sections), layout/ (Header/Footer/Nav), animations/ (animation wrappers), ui/ (shadcn only)
- Animation rules: Framer Motion for component animations, GSAP + ScrollTrigger for scroll-driven, `dynamic()` import for GSAP-heavy, prefers-reduced-motion check
- Scripts: dev, tokens, new-client, build, lint

## 7. Verification

After all files are created:

1. Run `pnpm tokens` — confirm tokens synced
2. Verify globals.css contains oklch variables
3. Run `pnpm dev` — confirm no TypeScript errors
4. Stop server
5. Smoke test `pnpm new-client` with test values, verify tokens.json updates correctly, then revert

## Files Changed/Created Summary

| File | Action |
|------|--------|
| `tokens.json` | Create |
| `scripts/sync-tokens.js` | Create |
| `scripts/new-client.js` | Create |
| `components/animations/lenis-provider.tsx` | Create |
| `app/layout.tsx` | Modify |
| `app/globals.css` | Regenerated by sync-tokens |
| `package.json` | Add "tokens" and "new-client" scripts |
| `CLAUDE.md` | Create |
| `components/sections/.gitkeep` | Create |
| `components/layout/.gitkeep` | Create |
| `types/.gitkeep` | Create |
