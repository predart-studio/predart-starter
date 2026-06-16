# Build Pattern — clean-room rebuilding a component

Match the conventions already in the library (`text-scramble.tsx`,
`magnetic.tsx`, `lib/motion/scramble.ts`, `lib/motion/magnetic.ts`). Each ported
effect produces up to **five pieces**. Read an existing component before writing
a new one of the same shape.

## The split: pure logic vs. React wrapper

- **`lib/motion/<name>.ts`** — pure, framework-free, DOM-free. Holds any
  extractable math or a GSAP-vars builder. This is what gets unit-tested. Only
  create it when the effect has logic worth isolating (offset math, vars
  construction, easing/stagger computation). Truly trivial effects (a one-line
  `gsap.to`) may skip the pure file — but most have *something* worth extracting.
- **`components/animations/<name>.tsx`** — `'use client'` React wrapper. Wires
  the pure logic to GSAP and the DOM, guards reduced motion, cleans up.

### Pure logic file — shape

```ts
/**
 * <one-line of what this computes>. Framework-free + DOM-free so it is
 * unit-testable; the <Name> wrapper feeds the result to gsap.<...>().
 *
 * Clean-room reference: <catalog> "<Effect Name>" — behavior only.
 */
export interface <Name>Input { /* ...typed params... */ }

export const DEFAULT_<NAME>_<X> = /* ... */

export function build<Name>Vars(input: <Name>Input) {
  const { /* defaults */ } = input
  return { /* gsap vars or computed result */ }
}
```

### React wrapper — shape (GSAP-only, reduced-motion-safe)

```tsx
'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
// import only the plugins this effect needs:
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { build<Name>Vars } from '@/lib/motion/<name>'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger /*, OtherPlugin */)
}

interface <Name>Props {
  /* typed, documented props with sane defaults matching the studied values */
  trigger?: 'load' | 'scroll' | 'hover'
  className?: string
  as?: ElementType
}

/**
 * <Name> — GSAP <plugin> wrapper (<scope>).
 *
 * <what it does + brand intent>. Renders its final state server-side (no layout
 * shift, no-JS safe); the animation layers on the client. Respects
 * prefers-reduced-motion (no tween, final state stays put). Do NOT also bind
 * Framer Motion to the property this drives.
 *
 * Clean-room reference: <catalog> "<Effect Name>" — behavior only.
 * Implementation is standard GSAP (see gsap-* skills).
 */
export function <Name>({ trigger = 'scroll', className, as: Tag = 'span', ...p }: <Name>Props) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return            // reduced motion: render final state, attach nothing
    const el = ref.current
    if (!el) return

    const ctx = gsap.context(() => {
      // build vars from lib/motion, then trigger-specific wiring:
      // hover  -> addEventListener('mouseenter', ...) and remove in returned cleanup
      // scroll -> gsap.to(el, { ...vars, scrollTrigger: { trigger: el, start: 'top 85%', once: true } })
      // load   -> gsap.to(el, vars)
    }, el)

    return () => ctx.revert()             // MANDATORY cleanup
  }, [trigger, prefersReduced /* + each prop the tween depends on */])

  return <Tag ref={ref} className={className}>{/* final, settled content */}</Tag>
}
```

### Non-negotiable wrapper rules

- `'use client'` at the top.
- Register plugins inside `if (typeof window !== 'undefined')` at module scope.
- Guard `if (prefersReduced) return` **before** touching the DOM — under reduced
  motion, attach no listeners and run no tweens; the JSX already renders the
  final state.
- Wrap all GSAP work in `gsap.context(() => { ... }, el)` and
  `return () => ctx.revert()` for cleanup (kills tweens, ScrollTriggers, and
  removes listeners registered inside the context).
- Use `gsap.quickTo` for high-frequency pointer-driven transforms (see
  `magnetic.tsx`).
- Default prop values must match the params extracted during study.
- Header doc comment ends with the `Clean-room reference:` line.

## Unit test — `lib/motion/__tests__/<name>.test.ts`

Vitest. Test the pure logic's contract (boundaries, scaling, clamping, vars
shape). Mirror `magnetic.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { build<Name>Vars } from '@/lib/motion/<name>'

describe('build<Name>Vars', () => {
  it('applies sensible defaults', () => { /* ... */ })
  it('respects passed params', () => { /* ... */ })
  // boundary / clamp / monotonicity cases as relevant
})
```

## Barrel export — `components/animations/index.ts`

Add the export line and extend the header comment list:

```ts
export { <Name> } from './<name>'
// (export the prop/type too if consumers need it, e.g. `type <Name>Item`)
```

## /lab card — `app/lab/page.tsx`

Add a `<Card name="<Display Name>" category="<text|pointer|scroll|svg|...>" hint="<how to trigger>">`
wrapping a live instance, matching the existing grid. Full-bleed effects (lists,
horizontal scroll, pinned sections) go in their own full-width `<section>` like
`ImageFollowList`, not the card grid.

## Verify (every component, before moving to the next)

1. `pnpm test:run` — new unit test passes.
2. `npx tsc --noEmit` — no new type errors.
3. Visual: open `http://localhost:3000/lab`, screenshot via Playwright, confirm
   the new card mounts and animates with no console errors. Also emulate
   `prefers-reduced-motion: reduce` and confirm it renders the static final
   state.
