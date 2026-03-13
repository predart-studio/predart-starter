# Predart Starter Template — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the Predart Starter Template with token system, onboarding wizard, smooth scroll, layout, icons, docs, and folder structure.

**Architecture:** Token-driven theming (tokens.json -> sync script -> globals.css). Interactive CLI wizard for client onboarding. Lenis + GSAP for smooth scroll. All config is file-based, no external services.

**Tech Stack:** Next.js 16, TypeScript, Tailwind v4, shadcn/ui v4, GSAP, Lenis, Phosphor Icons, Node.js (scripts)

**Spec:** `docs/superpowers/specs/2026-03-13-predart-starter-setup-design.md`

---

## Chunk 1: Foundation (folders, deps, tokens.json, sync-tokens)

### Task 1: Create folder structure and .gitkeep files

**Files:**
- Create: `components/sections/.gitkeep`
- Create: `components/layout/.gitkeep`
- Create: `components/animations/.gitkeep`
- Create: `scripts/.gitkeep` (temporary, replaced by actual scripts)
- Create: `types/.gitkeep`

- [ ] **Step 1: Create directories with .gitkeep files**

```bash
mkdir -p components/sections components/layout components/animations scripts types
touch components/sections/.gitkeep components/layout/.gitkeep types/.gitkeep
```

Note: `components/animations/.gitkeep` and `scripts/.gitkeep` are not needed since those dirs will get real files in later tasks.

- [ ] **Step 2: Commit**

```bash
git add components/sections/.gitkeep components/layout/.gitkeep types/.gitkeep
git commit -m "chore: create folder structure for sections, layout, types"
```

---

### Task 2: Swap icon libraries (Hugeicons -> Phosphor)

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Remove Hugeicons, add Phosphor**

```bash
pnpm remove @hugeicons/core-free-icons @hugeicons/react
pnpm add @phosphor-icons/react
```

- [ ] **Step 2: Verify no Hugeicons imports remain in codebase**

```bash
grep -r "hugeicons" components/ app/ lib/ --include="*.tsx" --include="*.ts" || echo "No hugeicons imports found - clean"
```

Expected: "No hugeicons imports found - clean"

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: swap hugeicons for phosphor-icons"
```

---

### Task 3: Create tokens.json

**Files:**
- Create: `tokens.json`

- [ ] **Step 1: Create tokens.json at project root**

Create `tokens.json` with exact content from spec Section 1. Values must match the current `app/globals.css` `:root` and `.dark` blocks exactly.

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

- [ ] **Step 2: Verify JSON is valid**

```bash
node -e "JSON.parse(require('fs').readFileSync('tokens.json','utf8')); console.log('Valid JSON')"
```

Expected: `Valid JSON`

- [ ] **Step 3: Commit**

```bash
git add tokens.json
git commit -m "feat: add tokens.json with oklch color palette"
```

---

### Task 4: Create sync-tokens.js

**Files:**
- Create: `scripts/sync-tokens.js`
- Modify: `package.json` (add "tokens" script)

- [ ] **Step 1: Write scripts/sync-tokens.js**

The script must:

1. Read `tokens.json` from project root
2. Generate the **complete** `app/globals.css` with this exact structure:

```
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  [fixed color mappings: --color-X: var(--X) for every token key]
  [fixed font mappings: --font-sans: var(--font-sans); --font-mono: var(--font-mono);]
  [fixed radius scale: --radius-sm through --radius-4xl]
}

:root {
  [all light tokens as --key: value;]
  --radius: [radius value];
}

.dark {
  [all dark tokens as --key: value;]
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
  html { @apply font-sans; }
}
```

Key implementation details:
- The `@theme inline` color mappings are generated dynamically from the union of all keys in `tokens.light` — for each key, output `--color-{key}: var(--{key});`
- Font and radius mappings in `@theme inline` are hardcoded (not from tokens.json). The exact font lines must be: `--font-sans: var(--font-sans);` and `--font-mono: var(--font-mono);` — NOT the old `--font-geist-mono` variable name. This circular-looking pattern works because `@theme inline` registers variables with Tailwind's theme system, while `var(--font-sans)` reads from the cascade where Next.js font optimization sets the value via the class on `<html>`.
- `:root` block: iterate tokens.light, write `--{key}: {value};` for each. Append `--radius: {tokens.radius};`
- `.dark` block: iterate tokens.dark, write `--{key}: {value};` for each
- Do NOT write font variables into `:root` or `.dark` (Next.js handles these)
- Error handling: exit code 1 with message if tokens.json missing, malformed JSON, or missing light/dark sections
- On success: `console.log('Tokens synced to globals.css')`
- Uses only `fs` and `path` — no external dependencies

- [ ] **Step 2: Add "tokens" script to package.json**

In the `"scripts"` section of `package.json`, add:
```json
"tokens": "node scripts/sync-tokens.js"
```

- [ ] **Step 3: Run the script and verify output**

```bash
node scripts/sync-tokens.js
```

Expected: `Tokens synced to globals.css`

Then verify the generated globals.css:
- Starts with `@import "tailwindcss";`
- Contains `@theme inline {` block with `--color-primary: var(--primary);` etc.
- Contains `:root {` block with `--primary: oklch(0.205 0 0);` etc.
- Contains `.dark {` block with `--primary: oklch(0.922 0 0);` etc.
- Contains `--radius: 0.625rem;` in `:root`
- Does NOT contain `--font-sans:` or `--font-mono:` in `:root` or `.dark`
- Ends with `@layer base { ... }`

- [ ] **Step 4: Verify globals.css matches expected structure by diffing key lines**

```bash
grep "^@import" app/globals.css
grep "\-\-color-primary:" app/globals.css
grep "\-\-primary:" app/globals.css
grep "\-\-radius:" app/globals.css
grep "\-\-font-sans:" app/globals.css
```

Expected output should show:
- 3 @import lines
- `--color-primary: var(--primary);` in @theme
- `--primary: oklch(0.205 0 0);` in :root and `--primary: oklch(0.922 0 0);` in .dark
- `--radius: 0.625rem;` in :root
- `--font-sans: var(--font-sans);` ONLY in @theme (not in :root)

- [ ] **Step 5: Commit**

```bash
git add scripts/sync-tokens.js app/globals.css package.json
git commit -m "feat: add sync-tokens script and generate globals.css from tokens.json"
```

---

## Chunk 2: Layout, LenisProvider, app shell

### Task 5: Create LenisProvider

**Files:**
- Create: `components/animations/lenis-provider.tsx`

- [ ] **Step 1: Write components/animations/lenis-provider.tsx**

```tsx
'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis()
    lenisRef.current = lenis

    lenis.on('scroll', ScrollTrigger.update)

    const rafCallback = (time: number) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(rafCallback)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(rafCallback)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return <>{children}</>
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit components/animations/lenis-provider.tsx 2>&1 || echo "Check errors above"
```

Note: This may show import resolution errors in isolation — that's expected. The real test is `pnpm dev` in the verification task.

- [ ] **Step 3: Commit**

```bash
git add components/animations/lenis-provider.tsx
git commit -m "feat: add LenisProvider with GSAP ScrollTrigger integration"
```

---

### Task 6: Update app/layout.tsx

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Rewrite app/layout.tsx**

Replace the entire file with:

```tsx
import type { Metadata } from 'next'
// PREDART:FONT_START
import { Inter } from 'next/font/google'
const fontSans = Inter({ variable: '--font-sans', subsets: ['latin'] })
// PREDART:FONT_END
import { Geist_Mono } from 'next/font/google'
import { LenisProvider } from '@/components/animations/lenis-provider'
import './globals.css'

const geistMono = Geist_Mono({ variable: '--font-mono', subsets: ['latin'] })

// PREDART:META_START
export const metadata: Metadata = {
  title: 'Predart Starter',
  description: 'Predart Studio',
}
// PREDART:META_END

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${fontSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  )
}
```

Key changes from current layout.tsx:
- Font: Inter replaces Figtree + Geist (sans). Geist_Mono kept for `--font-mono`.
- `// PREDART:FONT_START` / `// PREDART:FONT_END` markers around font import + variable (for new-client.js to swap)
- `// PREDART:META_START` / `// PREDART:META_END` markers around metadata (for new-client.js to swap)
- LenisProvider wraps children
- Removed `cn` import (no longer needed)
- Metadata updated to "Predart Starter" / "Predart Studio"
- body simplified to `font-sans antialiased` (bg/text handled in globals.css @layer base)

- [ ] **Step 2: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: update layout with Inter font, LenisProvider, PREDART markers"
```

---

### Task 7: First verification — dev server starts

- [ ] **Step 1: Run pnpm tokens to regenerate globals.css**

```bash
pnpm tokens
```

Expected: `Tokens synced to globals.css`

- [ ] **Step 2: Start dev server**

```bash
pnpm dev
```

Expected: Server starts on localhost:3000 with no TypeScript errors. Check terminal output for errors.

- [ ] **Step 3: Stop the server (Ctrl+C)**

If there are TypeScript errors, fix them before proceeding.

---

## Chunk 3: Client onboarding wizard

### Task 8: Create new-client.js — color utilities module

**Files:**
- Create: `scripts/lib/color-utils.js`

- [ ] **Step 1: Write scripts/lib/color-utils.js**

A pure utility module with these functions (no dependencies):

```js
// hexToRgb(hex) -> { r, g, b } (0-255)
// linearize(c) -> linear sRGB channel (0-1)
// rgbToOklch(r, g, b) -> { l, c, h } (l: 0-1, c: 0+, h: 0-360)
//   Chain: sRGB -> linear RGB -> XYZ D65 -> Oklab -> Oklch
// oklchToString({ l, c, h }) -> "oklch(0.488 0.217 264)" (3 decimal places)
// hexToOklch(hex) -> oklch string
// relativeLuminance(r, g, b) -> Y (0-1) for WCAG contrast
// contrastRatio(lum1, lum2) -> ratio (1-21)
// bestForeground(bgHex) -> "oklch(0.985 0 0)" or "oklch(0.145 0 0)"
//   Returns white or near-black, whichever has >= 4.5:1 contrast against bg
```

Implementation chain for `rgbToOklch`:
1. sRGB (0-255) -> linear sRGB (0-1) via gamma decoding
2. linear sRGB -> XYZ D65 via sRGB matrix
3. XYZ D65 -> Oklab via cube root transform
4. Oklab (L, a, b) -> Oklch (L, C, H) via `C = sqrt(a^2 + b^2)`, `H = atan2(b, a) * 180/PI`

Export all functions as `module.exports`.

- [ ] **Step 2: Verify conversions with known values**

```bash
node -e "
const c = require('./scripts/lib/color-utils.js');
console.log('White:', c.hexToOklch('#ffffff'));
console.log('Black:', c.hexToOklch('#000000'));
console.log('Blue:', c.hexToOklch('#1a56db'));
console.log('Contrast white on blue:', c.bestForeground('#1a56db'));
"
```

Expected (approximately):
- White: `oklch(1 0 0)` (or near 1, 0, 0)
- Black: `oklch(0 0 0)` (or near 0, 0, 0)
- Blue: `oklch(0.488 0.217 264.xxx)` (approximately)
- Contrast: should return the white oklch string (white has better contrast on dark blue)

- [ ] **Step 3: Commit**

```bash
git add scripts/lib/color-utils.js
git commit -m "feat: add hex-to-oklch color utilities for palette generation"
```

---

### Task 9: Create new-client.js — palette generation

**Files:**
- Create: `scripts/lib/palette-generator.js`

- [ ] **Step 1: Write scripts/lib/palette-generator.js**

A module that takes `{ primaryHex, backgroundHex, radius, fontName }` and returns a complete tokens.json-shaped object.

```js
const { hexToOklch, bestForeground, hexToRgb, rgbToOklch, oklchToString } = require('./color-utils')

function generatePalette({ primaryHex, backgroundHex = '#ffffff', radius = '0.5rem', fontName = 'Inter' }) {
  const primary = hexToOklch(primaryHex)
  const background = hexToOklch(backgroundHex)
  const primaryFg = bestForeground(primaryHex)
  const foreground = bestForeground(backgroundHex) // inverse contrast

  // Parse primary oklch to get hue for accent/muted derivation
  const primaryParsed = rgbToOklch(...Object.values(hexToRgb(primaryHex)))

  // Accent: primary hue, low chroma, high lightness
  const accent = oklchToString({ l: 0.97, c: Math.min(primaryParsed.c * 0.15, 0.03), h: primaryParsed.h })
  const accentFg = oklchToString({ l: 0.205, c: 0, h: 0 })

  // Muted: near-neutral with hint of primary hue
  const muted = oklchToString({ l: 0.97, c: Math.min(primaryParsed.c * 0.05, 0.005), h: primaryParsed.h })
  const mutedFg = oklchToString({ l: 0.556, c: 0, h: 0 })

  // Secondary: fully neutral
  const secondary = 'oklch(0.97 0 0)'
  const secondaryFg = 'oklch(0.205 0 0)'

  // Fixed
  const destructive = 'oklch(0.577 0.245 27.325)'
  const border = 'oklch(0.922 0 0)'
  const input = 'oklch(0.922 0 0)'
  const ring = 'oklch(0.708 0 0)'

  // Build light palette
  const light = {
    background, foreground, primary, 'primary-foreground': primaryFg,
    secondary, 'secondary-foreground': secondaryFg,
    muted, 'muted-foreground': mutedFg,
    accent, 'accent-foreground': accentFg,
    destructive, border, input, ring,
    card: background, 'card-foreground': foreground === 'oklch(0.985 0 0)' ? 'oklch(0.985 0 0)' : 'oklch(0.145 0 0)',
    popover: background, 'popover-foreground': foreground === 'oklch(0.985 0 0)' ? 'oklch(0.985 0 0)' : 'oklch(0.145 0 0)',
    // Charts: keep defaults
    'chart-1': 'oklch(0.809 0.105 251.813)',
    'chart-2': 'oklch(0.623 0.214 259.815)',
    'chart-3': 'oklch(0.546 0.245 262.881)',
    'chart-4': 'oklch(0.488 0.243 264.376)',
    'chart-5': 'oklch(0.424 0.199 265.638)',
    // Sidebar
    sidebar: background, 'sidebar-foreground': foreground === 'oklch(0.985 0 0)' ? 'oklch(0.985 0 0)' : 'oklch(0.145 0 0)',
    'sidebar-primary': primary, 'sidebar-primary-foreground': primaryFg,
    'sidebar-accent': accent, 'sidebar-accent-foreground': accentFg,
    'sidebar-border': border, 'sidebar-ring': ring,
  }

  // Dark mode: draft (inverted lightness)
  const dark = generateDarkDraft(light, primaryParsed)

  return {
    _comment: 'Edit per client. Run: pnpm tokens after every change.',
    light, dark, radius,
    font: { sans: fontName, mono: 'Geist Mono' }
  }
}

function generateDarkDraft(light, primaryParsed) {
  // Dark mode draft — functional starting point, user should refine
  return {
    background: 'oklch(0.145 0 0)',
    foreground: 'oklch(0.985 0 0)',
    primary: oklchToString({ l: 0.8, c: Math.min(primaryParsed.c * 0.8, 0.2), h: primaryParsed.h }),
    'primary-foreground': 'oklch(0.205 0 0)',
    secondary: 'oklch(0.269 0 0)',
    'secondary-foreground': 'oklch(0.985 0 0)',
    muted: 'oklch(0.269 0 0)',
    'muted-foreground': 'oklch(0.708 0 0)',
    accent: oklchToString({ l: 0.269, c: Math.min(primaryParsed.c * 0.1, 0.02), h: primaryParsed.h }),
    'accent-foreground': 'oklch(0.985 0 0)',
    destructive: 'oklch(0.704 0.191 22.216)',
    border: 'oklch(1 0 0 / 10%)',
    input: 'oklch(1 0 0 / 15%)',
    ring: 'oklch(0.556 0 0)',
    card: 'oklch(0.205 0 0)',
    'card-foreground': 'oklch(0.985 0 0)',
    popover: 'oklch(0.205 0 0)',
    'popover-foreground': 'oklch(0.985 0 0)',
    'chart-1': 'oklch(0.809 0.105 251.813)',
    'chart-2': 'oklch(0.623 0.214 259.815)',
    'chart-3': 'oklch(0.546 0.245 262.881)',
    'chart-4': 'oklch(0.488 0.243 264.376)',
    'chart-5': 'oklch(0.424 0.199 265.638)',
    sidebar: 'oklch(0.205 0 0)',
    'sidebar-foreground': 'oklch(0.985 0 0)',
    'sidebar-primary': oklchToString({ l: 0.7, c: Math.min(primaryParsed.c * 0.7, 0.2), h: primaryParsed.h }),
    'sidebar-primary-foreground': 'oklch(0.985 0 0)',
    'sidebar-accent': 'oklch(0.269 0 0)',
    'sidebar-accent-foreground': 'oklch(0.985 0 0)',
    'sidebar-border': 'oklch(1 0 0 / 10%)',
    'sidebar-ring': 'oklch(0.556 0 0)',
  }
}

module.exports = { generatePalette }
```

Note: This is a starting implementation — the exact derivation math may need tuning. The key contract is: given hex inputs, return a valid tokens.json structure.

- [ ] **Step 2: Verify palette generation**

```bash
node -e "
const { generatePalette } = require('./scripts/lib/palette-generator.js');
const result = generatePalette({ primaryHex: '#1a56db', backgroundHex: '#ffffff' });
console.log('Light primary:', result.light.primary);
console.log('Dark primary:', result.dark.primary);
console.log('Light keys:', Object.keys(result.light).length);
console.log('Dark keys:', Object.keys(result.dark).length);
console.log('Radius:', result.radius);
console.log('Font:', result.font.sans);
"
```

Expected: Both light and dark have all required keys, primary is an oklch string, radius defaults to 0.5rem, font defaults to Inter.

- [ ] **Step 3: Commit**

```bash
git add scripts/lib/palette-generator.js
git commit -m "feat: add palette generator for client onboarding wizard"
```

---

### Task 10: Create new-client.js — interactive wizard

**Files:**
- Create: `scripts/new-client.js`
- Modify: `package.json` (add "new-client" script)

- [ ] **Step 1: Write scripts/new-client.js**

Interactive CLI wizard using `readline`. Flow:

```
1. Prompt: "Client slug (e.g. minerva):" — REQUIRED, validate non-empty, lowercase alphanumeric + hyphens only
2. Prompt: "Primary color (hex, e.g. #1a56db):" — REQUIRED, validate with `/^#[0-9a-fA-F]{6}$/` (6-digit with `#` required, reject 3-digit shorthand)
3. Prompt: "Background hex [#ffffff]:" — optional, default #ffffff
4. Prompt: "Font name [Inter]:" — optional, default Inter
5. Prompt: "Border radius [0.5rem]:" — optional, default 0.5rem
6. Generate palette using palette-generator.js
7. Display preview of key light colors + dark mode draft notice
8. Prompt: "Confirm? (Y/n):" — default Y
9. If confirmed:
   a. Write tokens.json
   b. Run sync-tokens.js (via child_process.execSync('node scripts/sync-tokens.js'))
   c. Update layout.tsx font (replace between PREDART:FONT_START and PREDART:FONT_END markers)
   d. Update layout.tsx metadata (replace between PREDART:META_START and PREDART:META_END markers)
   e. Print success summary
```

Font swap in layout.tsx:
- Read layout.tsx
- Find content between `// PREDART:FONT_START` and `// PREDART:FONT_END` (inclusive of markers)
- Replace with:
  ```
  // PREDART:FONT_START
  import { FontName } from 'next/font/google'
  const fontSans = FontName({ variable: '--font-sans', subsets: ['latin'] })
  // PREDART:FONT_END
  ```
- Multi-word conversion: "DM Sans" -> `DM_Sans` for import, `DM_Sans` for constructor

Metadata swap in layout.tsx:
- Find content between `// PREDART:META_START` and `// PREDART:META_END`
- Replace with capitalized slug as title (e.g. "minerva" -> "Minerva")
- Description: "{Capitalized slug} — by Predart Studio"

- [ ] **Step 2: Add "new-client" script to package.json**

```json
"new-client": "node scripts/new-client.js"
```

- [ ] **Step 3: Commit**

```bash
git add scripts/new-client.js package.json
git commit -m "feat: add interactive client onboarding wizard"
```

---

## Chunk 4: Documentation and final verification

### Task 11: Create docs/component-libraries.md

**Files:**
- Create: `docs/component-libraries.md`

- [ ] **Step 1: Write docs/component-libraries.md**

Write the full reference file as specified in spec Section 7. Include all 7 sections:
1. Always available (in template) — table of pre-installed libs
2. Animated component libraries — table with install commands
3. Utility libraries — table with install commands
4. Component -> Library quick reference — mapping table
5. Client type playbooks — industry combos
6. Tailwind v4 animation note — keyframe translation guidance
7. Animation rules — Framer Motion vs GSAP coexistence

Content is fully specified in the design spec — transcribe it into a clean markdown document.

- [ ] **Step 2: Commit**

```bash
git add docs/component-libraries.md
git commit -m "docs: add curated component libraries reference"
```

---

### Task 12: Create CLAUDE.md

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: Write CLAUDE.md at project root**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md project documentation"
```

---

### Task 13: Final verification

- [ ] **Step 1: Run pnpm tokens**

```bash
pnpm tokens
```

Expected: `Tokens synced to globals.css`

- [ ] **Step 2: Verify globals.css has oklch variables**

```bash
grep "oklch" app/globals.css | head -5
```

Expected: Lines like `--primary: oklch(0.205 0 0);`

- [ ] **Step 3: Start dev server and check for errors**

```bash
pnpm dev
```

Expected: Server starts on localhost:3000 with no TypeScript errors. Check terminal for compilation errors.

- [ ] **Step 4: Stop the server**

Ctrl+C

- [ ] **Step 5: Smoke test new-client wizard**

```bash
# Back up current tokens.json and layout.tsx
cp tokens.json tokens.json.bak
cp app/layout.tsx app/layout.tsx.bak

# Run wizard with test values (pipe answers)
echo -e "testclient\n#1a56db\n\n\n\nY" | node scripts/new-client.js

# Verify tokens.json was updated
node -e "const t = JSON.parse(require('fs').readFileSync('tokens.json','utf8')); console.log('Primary:', t.light.primary); console.log('Font:', t.font.sans)"

# Verify layout.tsx was updated
grep "Testclient" app/layout.tsx && echo "Metadata updated" || echo "Metadata NOT updated"

# Restore originals
cp tokens.json.bak tokens.json
cp app/layout.tsx.bak app/layout.tsx
rm tokens.json.bak app/layout.tsx.bak

# Re-sync tokens to restore globals.css
pnpm tokens
```

Expected: Primary shows a blue oklch value, font shows Inter, metadata shows Testclient. Originals restored after test.

- [ ] **Step 6: Final commit if any fixes were needed**

```bash
git status
# If clean, nothing to commit. If fixes were made, commit them.
```
