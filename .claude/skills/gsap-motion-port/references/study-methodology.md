# Study Methodology — reading motion off a live demo

Adapted from the predart-forge Researcher's motion-capture passes. The goal is
to extract enough concrete detail to clean-room rebuild an effect: what triggers
it, what property moves, the easing feel, timing, and any scroll/pointer
coupling. Never read the catalog's source to do this — observe behavior.

## 1. Open and settle

1. The catalog page embeds the demo in a **sandbox iframe**. Load the iframe
   directly as a standalone page so it is scrollable and inspectable:
   `https://www.annnimate.com/api/sandbox/iframe/<slug>`. (Find the exact src by
   reading `iframe[src*="/api/sandbox/iframe/"]` on the component page.)
2. Wait for `networkidle`, then a short settle (the catalog hydrates a "Loading"
   shell — confirm the demo is actually visible via a snapshot before studying).
3. If the demo needs an interaction to fire (hover, click, drag), drive it with
   the Playwright pointer/keyboard tools, not by guessing.

**Never study a scroll-driven effect from its text description alone — drive it.**
The description gives the gist; only scrolling the live demo reveals the trigger
type (on-enter vs scrubbed), pin behavior, stagger, and real distances/rotations.

## 2. Classify the trigger

Decide which one the effect uses — it determines the wrapper shape:

- **load** — plays once on mount.
- **scroll** — plays when scrolled into view, or is scroll-*linked* (scrubbed).
  Distinguish "fires once at a threshold" from "progress tied to scroll
  position" — the second needs ScrollTrigger `scrub`.
- **hover / pointer** — fires on `mouseenter` / tracks `pointermove`.
- **drag** — pointer-drag with inertia (GSAP Draggable/InertiaPlugin).

## 3. Identify what animates (scroll-state / frame diffing)

Forge's core trick: compare element state across positions/time.

- For scroll effects: capture state at intervals across the demo's scroll range
  (e.g. progress 0 / 0.3 / 0.6 / 1) and diff what moved, faded, scaled, rotated,
  clipped, or split. **Gotcha:** ScrollTrigger updates on a RAF *after* the
  scroll event, so reading transforms synchronously right after `scrollTo` returns
  stale values. Use an **async** evaluate: `scrollTo` → dispatch a `scroll` event
  → `await` ~400ms (scrub has smoothing lag) → read computed transforms. Decompose
  `getComputedStyle(el).transform` with `DOMMatrix` to recover rotation/translate.
- For timed/load effects: capture frames shortly after trigger and after settle.
- For pointer effects: capture at a few pointer positions to see the mapping.

Name the exact property being driven: `x/y` (transform), `opacity`, `scale`,
`rotation`, `clipPath`, `strokeDashoffset` (SVG draw), per-char/word/line splits
(SplitText), skew, `backgroundPosition`, etc. One effect usually drives one or
two properties — pin that down.

## 4. Extract concrete parameters

Estimate and record real numbers to seed the component's defaults:

- **duration** (s) and **delay** / `revealDelay`.
- **easing feel** — map to a GSAP ease (`power2.out`, `power3.out`, `expo.out`,
  `none` for scrubbed/scramble, `elastic`, `back`). Snappy-then-settle ≈
  `power3.out`; linear scrub ≈ `none`.
- **stagger** between children (s) and its order (start / center / edges).
- **distance / amount** — px of travel, degrees of rotation, scale from→to.
- **scroll config** — `start` (e.g. `top 85%`), `end`, `once` vs `scrub`, `pin`.

## 5. Confirm with reduced motion

Toggle `prefers-reduced-motion: reduce` (Playwright emulation) and reload. Note
what a sensible *final static state* looks like — that is exactly what the built
component must render when reduced motion is on (no tween, no listeners).

## 6. Signature check (optional, supports classification)

Grep the demo's runtime for library fingerprints (`gsap`, `ScrollTrigger`,
`SplitText`, `Draggable`, `Observer`) to confirm which GSAP plugin reproduces
the effect. This informs the rebuild but does not replace observation.

## Output of the study

A short spec per component, ready to hand to the build step:

```
name:        <kebab-name>
trigger:     load | scroll(once) | scroll(scrub) | hover | pointer | drag
animates:    <property/properties>
plugin:      core | ScrollTrigger | ScrambleText | SplitText | DrawSVG | Draggable | ...
defaults:    duration, ease, delay, stagger, distance, scroll start/end
reduced:     <final static state to render>
notes:       anything tricky (clip reveal, looping, pin length, etc.)
```
