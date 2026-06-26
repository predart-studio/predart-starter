# Canonical Motion System — per-project source of truth

This is the source of truth for *how much* motion a site built on this starter uses. The principles
file (`motion-principles.md`) says what good motion is in general; **this file pins the exact values
for the project you are building.** It ships as a TEMPLATE: §A is a ready-to-use canonical set, and
§B–§E are where you record this project's audit, mapping, and file map as the site grows.

Stack (starter default): Next.js 16 App Router · GSAP + ScrollTrigger (page-scoped) · Framer Motion
(component-scoped) · Lenis (smooth scroll) · Tailwind v4 tokens via `tokens.json` → `pnpm tokens`.

> **What the starter ships vs. the target.** Out of the box `tokens.json > motion` carries a minimal
> set — `ease-house` + `duration-fast/base/slow` — and `pnpm tokens` emits those as CSS vars
> (`--ease-house`, `--duration-*`) plus `lib/motion.generated.ts` (`EASE_HOUSE`, `EASE_HOUSE_CSS`,
> `DURATION`). §A below is the fuller **target** to grow into. Adding staggers / distances / extra
> eases means extending both `tokens.json` **and** the emitter in `scripts/sync-tokens.js`
> (`buildCss` / `buildMotionTs`) so the new values flow through — don't hand-edit `globals.css`.

---

## A. The canonical token set (the target)

A premium site runs on a *small* table of values. Target spread: **4 durations, 3 eases (+linear
+ one overshoot), 3 distances, 3 staggers, 1 scrub, 1 reveal start.** Everything maps to these.

### A.1 `tokens.json > motion` (extend the shipped block toward this)

```jsonc
"motion": {
  "ease-house":  "cubic-bezier(0.22, 1, 0.36, 1)",  // entrance / reveal — the SIGNATURE curve (shipped)
  "ease-exit":   "cubic-bezier(0.4, 0, 1, 1)",        // exits (shorter, ease-in)
  "ease-inout":  "cubic-bezier(0.65, 0, 0.35, 1)",    // A→B on-screen / layout / crossfade

  "duration-fast":  "0.3s",   // tooltips, icon swaps, small reveals (shipped)
  "duration-base":  "0.6s",   // the workhorse rise+fade reveal (shipped)
  "duration-slow":  "0.9s",   // large blocks, hero beats, scrubbed waves (shipped)
  "duration-micro": "0.2s",   // hover, press, focus, color — interruptible CSS

  "stagger-tight": "0.03s",   // per-character / dense grids
  "stagger-base":  "0.08s",   // default lists & cards
  "stagger-loose": "0.12s",   // a few large blocks

  "rise-sm": "16px",          // text lines, labels
  "rise-md": "32px",          // cards, list items (default)
  "rise-lg": "48px"           // large frames, full-width media
}
```

`pnpm tokens` emits the present keys as `--ease-house`, `--duration-base`, … in `app/globals.css`.
**Never hand-edit `globals.css`** — edit `tokens.json` (and the generator) and regenerate.

### A.2 JS constants — `lib/motion.generated.ts` (single source for GSAP/Framer)

The starter generates this from `tokens.json > motion`. The shipped shape is:

```ts
export const EASE_HOUSE = [0.22, 1, 0.36, 1] as const;
export const EASE_HOUSE_CSS = "cubic-bezier(0.22, 1, 0.36, 1)" as const;
export const DURATION = { fast: 0.3, base: 0.6, slow: 0.9 } as const;
```

As you adopt the full §A.1 set, extend `buildMotionTs` in `scripts/sync-tokens.js` to also emit the
extra eases, `STAGGER`, `RISE`, and the scroll constants below, so JS never hardcodes seconds again:

```ts
// Scroll constants (not CSS — used by GSAP/ScrollTrigger)
export const SCRUB = 0.8;            // ONE scrub weight site-wide
export const REVEAL_START = "top 85%"; // ONE wake point for one-shot reveals
export const OVERSHOOT = "back.out(1.7)"; // the ONE overshoot amount, for rare pops
```

If you lean on a shared GSAP `CustomEase` for the house curve, register it once (e.g.
`lib/motion/register-house-ease.ts`) from `EASE_HOUSE` so no component re-creates the ease.

### A.3 Lenis config — make it explicit

Prefer explicit options over `new Lenis()` defaults in `components/animations/lenis-provider.tsx`:

```ts
new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.2 });
```

`lerp: 0.1` is framerate-independent and reads calm under a `scrub`. Keep the existing
`lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(... lenis.raf(t*1000))`,
`lagSmoothing(0)`, and the `/studio` skip.

### A.4 Signature exceptions (allowed bespoke motion)

Cohesion ≠ uniformity. A few moments earn their own values *because they are once-per-visit and
lead*. List **this project's** exceptions here as you build them. Typical candidates:

- **A hero entrance** — e.g. the one horizontal headline slide. Keep, but source duration/ease from tokens.
- **A preloader / intro** — its own internal choreography that hands off to the hero; keep it
  self-contained but use `OVERSHOOT`, `EASE`, `DURATION` constants.
- **An ambient marquee / loop** — infinite, `ease:"none"`, subordinate to the foreground. One only.

Everything *not* on this list uses the canonical tokens.

---

## B. Current-state audit (run it, then record it here)

Run the deterministic auditor (no ripgrep dependency) and read the spread:

```bash
python3 .claude/skills/motion-director/scripts/audit-motion.py        # live surface (excludes /lab)
python3 .claude/skills/motion-director/scripts/audit-motion.py --all  # include the /lab catalog
```

It tallies distinct durations / eases / staggers / distances / scrub weights / reveal starts / blur
radii, reduced-motion coverage, and anti-patterns. **Any "distinct" count far above the canonical
table size (§A) is the concrete source of a "hectic" feel.** Record the diagnosed smells for this
project below, with `file:line`, so the cleanup is concrete:

```
- [ ] Two competing default reveal eases — <file:line> vs the house curve
- [ ] One gesture, many magnitudes/durations — <files>
- [ ] More than one list-stagger rhythm on adjacent sections — <files>
- [ ] More than one scrub weight — <files>
- [ ] More than one overshoot amount — <files>
- [ ] Hover-timing drift (200/250/300) — <files>
- [ ] Tokens defined but barely imported — <files>
- [ ] Missing CSS `@media (prefers-reduced-motion: reduce)` block
```

Re-run the inventory any time; treat its output as the live version of this section.

---

## C. Mapping table — current value → canonical token

As you audit, fill one row per scattered value so each collapses onto the system. Example shape:

| Where (`file:line`) | Today | → Canonical |
| --- | --- | --- |
| reveal wrapper default ease | `power2.out` | `house` — make the signature curve the site default |
| reveal distance | `50` | `RISE.lg` (48) |
| section list stagger | `0.12` / `0.14×i` | `STAGGER.base` (0.08), total cascade < ~0.4s |
| scrub weights | `0.6` / `1` | `SCRUB` (0.8) for both |
| overshoot amounts | `back.out(1.5/1.8)` | `OVERSHOOT` (`back.out(1.7)`) |
| nav/footer hovers | `duration-200/250/300` | `duration-[var(--duration-micro)]` (200ms) |

For a genuinely new need, pick the nearest token or propose a *named* addition to §A — never silently
introduce a one-off.

---

## D. Refactor playbook (ordered, lowest-risk first)

Do these as small, separately-verifiable commits. After each, view the page (review visual diffs
yourself — don't spin up Playwright/servers for small visual checks) and run `pnpm lint`.

1. **Extend tokens.** Add the §A.1 values you need to `tokens.json`, extend `scripts/sync-tokens.js`
   (`buildCss`/`buildMotionTs`) to emit them, run `pnpm tokens`, confirm new `--*` vars in
   `globals.css` and the new constants in `lib/motion.generated.ts`.
2. **De-duplicate the ease.** If the house curve is re-created in several files, register it once and
   import it. No visual change — pure consolidation.
3. **Fix the reveal default.** Point the most-used reveal wrapper (`lib/motion/element-reveal.ts`) at
   `EASE_HOUSE` / `RISE.lg` / `DURATION.base` / `STAGGER.base`. Highest-impact single change — it puts
   the signature curve on the most common reveals.
4. **Collapse the section reveals.** Migrate bespoke section motion onto the canonical
   distance/duration/stagger (§C). Prefer reusing `<ElementReveal>` over bespoke `gsap.from`.
5. **Unify scrub + overshoot.** One `SCRUB` weight; one `OVERSHOOT` amount.
6. **Unify hover timing.** Replace `duration-200/250/300` micro-interactions with `--duration-micro`;
   `motion-safe`-gate transform hovers.
7. **Tune Lenis.** Explicit options (§A.3).
8. **Reduced motion.** Add a CSS `@media (prefers-reduced-motion: reduce)` block to a
   **non-generated** stylesheet (`app/typography.css` or a new `app/motion.css` imported in layout —
   NOT `globals.css`). Standardize all JS on `usePrefersReducedMotion()`.
9. **Calm the first few seconds (judgment call, do last).** Reduce simultaneous load beats: let
   ambient motion fade in *after* the hero settles; make secondary reveals subordinate. Verify with
   the user — this is taste, not mechanics.

**Do NOT:** migrate GSAP↔Framer to fix a value, rewrite the catalog in `components/animations/*`
(it's the `/lab` library, not the live site), or change values inside the signature exceptions (§A.4)
beyond sourcing them from tokens.

---

## E. Where motion lives (file map)

Starter-default locations — extend with this project's specifics:

- **Tokens:** `tokens.json > motion` → `app/globals.css` (generated) → `lib/motion.generated.ts` (generated).
- **Smooth scroll:** `components/animations/lenis-provider.tsx`; wired in `app/layout.tsx`.
- **Reveal wrapper:** `components/animations/element-reveal.tsx` + `lib/motion/element-reveal.ts`.
- **Bespoke section motion (per project):** `components/sections/*` — your hero, statement, feature
  blocks, etc. (empty in the starter; this is where most project motion will live).
- **Reduced motion:** `hooks/use-reduced-motion.ts` (`usePrefersReducedMotion` — the one mechanism to
  standardize on) + a CSS `@media` block in a non-generated stylesheet.
- **The /lab catalog (NOT the live site):** `components/animations/*`, `lib/motion/*`,
  `app/lab/registry.tsx` — a component library to copy *from*; leave it alone unless explicitly porting.
