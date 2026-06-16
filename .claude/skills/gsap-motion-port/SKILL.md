---
name: gsap-motion-port
description: "Ports a catalog of GSAP-driven animation components (e.g. annnimate.com) into the predart-starter in-house motion library by studying each effect live in a browser and clean-room rebuilding it as a reusable, tested, GSAP-only React component. This skill should be used when the user gives a catalog or gallery URL of motion components and wants them studied and built into their library, or asks to study the motion and build it, port these animations, or add these GSAP effects to my motion kit. Runs autonomously through the whole catalog, one component at a time with no checkpoints, until every effect is ported."
---

# GSAP Motion Port

## Purpose

Turn a reference catalog of GSAP animation components into permanent, reusable
components in the predart-starter motion library. For each effect in the
catalog: deploy a browser, study how the motion actually behaves, then
clean-room rebuild it (from observed behavior, never by copying source) using
the official GSAP skills and the library's existing file pattern — pure logic +
unit test + React wrapper + barrel export + `/lab` gallery card.

The output is a library the user owns, not a dependency on the reference. Every
component is GSAP-only, `prefers-reduced-motion`-safe, and renders a sensible
final static state with no JS.

## When To Use

Use when the user provides a catalog/gallery URL of motion components (such as
`https://www.annnimate.com/animations`) and wants them ported into their motion
library. The mode is **targeted** (the user points at a catalog) and
**autonomous** (work through every item without stopping to ask).

## Prerequisites (verify first, fix if missing)

1. **Working dir** is a predart-starter project (or the predart-starter repo
   itself). Confirm `lib/motion/`, `components/animations/index.ts`, and
   `app/lab/page.tsx` exist. This is where components are written.
2. **Dependencies installed** — `node_modules/` present. If not: `pnpm install`.
3. **Dev server running** on `http://localhost:3000` (needed for `/lab` visual
   verification). If not: start `pnpm dev` in the background and wait for Ready.
4. **GSAP skills available** — this skill delegates all GSAP API decisions to
   the official skills. Invoke them as needed while building:
   - `gsap-core` (tweens, easing, `gsap.context`, `quickTo`)
   - `gsap-react` (`useGSAP`, refs, cleanup)
   - `gsap-scrolltrigger` (scroll-driven / pin / scrub)
   - `gsap-plugins` (ScrambleText, DrawSVG, SplitText, Flip, Observer, etc.)
   - `gsap-timeline`, `gsap-utils`, `gsap-performance` as relevant.
   GSAP 3.13+ ships every plugin free — no Club token needed.
5. **Playwright** browser tools available for studying the live demos (the
   reference catalogs are client-rendered SPAs — a plain fetch returns an empty
   shell, so the browser is mandatory).

## Workflow

Read `references/study-methodology.md` before studying motion, and
`references/build-pattern.md` before writing any component file. They hold the
detailed how-to so this file stays lean.

### Step 0 — Enumerate the catalog (once)

1. Open the catalog URL in Playwright. Wait for the SPA to render (`networkidle`
   + a short settle; the page shows "Loading" until hydrated).
2. Collect every component: name + demo URL/anchor + its category if shown.
3. Build a **worklist** (write it to `MOTION-PORT-REPORT.md` at the project root
   as a checklist so progress survives interruptions).
4. **Resume/skip:** for each worklist item, check if a matching component already
   exists in `components/animations/` (the library already ships some, e.g.
   TextScramble, Magnetic, DrawPath, VelocitySkew, ImageFollowList). Mark those
   `already-built` and do not rebuild them.

### Step 1..N — Port each remaining component, one at a time

For each worklist item, in order, run the full loop before moving on:

1. **Study** (see `references/study-methodology.md`): open the demo, identify
   trigger (load / scroll / hover / pointer / drag), what property animates,
   easing feel, duration, stagger, and any scroll coupling. Capture
   before/after frames to confirm what moves. Extract concrete default params.
2. **Build clean-room** (see `references/build-pattern.md`): create the five
   pieces —
   - `lib/motion/<name>.ts` — pure, DOM-free logic/var-builder (if the effect
     has any extractable math/config; trivial effects may skip this).
   - `lib/motion/__tests__/<name>.test.ts` — Vitest unit test of that logic.
   - `components/animations/<name>.tsx` — `'use client'` GSAP wrapper using
     `gsap.context`/`useGSAP`, reduced-motion guarded, SSR-safe final state.
   - Barrel export line in `components/animations/index.ts`.
   - A demo `<Card>` in `app/lab/page.tsx`.
3. **Verify** before moving on:
   - `pnpm test:run` (or scoped to the new file) passes.
   - `npx tsc --noEmit` clean (no type errors introduced).
   - `/lab` renders the new card: hit `http://localhost:3000/lab` and take a
     Playwright screenshot; confirm the component mounts without console errors.
4. **Record** the result in `MOTION-PORT-REPORT.md`: component name, params,
   GSAP plugin(s) used, and status (`built` / `degraded` / `skipped`).

### Loop control (autonomous — do not stop to ask)

- **Keep going** until every worklist item is `built`, `degraded`, or
  `already-built`. Do not pause for approval between components.
- **Degrade gracefully, never silently skip.** If an effect cannot be faithfully
  clean-roomed (proprietary rendering, too complex for the session), build the
  closest faithful version possible, mark it `degraded` with a one-line reason
  in the report, and continue. Only mark `skipped` if it genuinely cannot be
  represented, and say why.
- **One engine per property.** New components are **GSAP-only** (GSAP +
  ScrollTrigger + plugins; Lenis only when the effect needs smooth-scroll
  coupling). Never bind Framer Motion to a property a GSAP wrapper drives.
- **Idempotent.** Re-running the skill resumes from the report's checklist and
  never duplicates an existing component.

### Finish

When the worklist is exhausted, write a closing summary in
`MOTION-PORT-REPORT.md` (counts: built / degraded / skipped / already-built) and
report it back. Do not commit or push unless the user asks — pushing to the
predart-starter repo is the deliberate step that propagates the new components to
every future forge clone.

## Hard Rules

- Clean-room from **behavior only** — never copy the catalog's source code.
- Every component honors `prefers-reduced-motion` by rendering its final, static
  state (no tween, no listeners attached under reduced motion).
- Match the existing file conventions exactly (see `references/build-pattern.md`)
  — header doc comment with `Clean-room reference: <catalog> "<name>"`,
  `gsap.context(...).revert()` cleanup, `usePrefersReducedMotion` guard.
- Pure logic lives in `lib/motion/` and is unit-tested; the React wrapper in
  `components/animations/` only wires that logic to GSAP + the DOM.
- Defer all GSAP API specifics to the official `gsap-*` skills rather than
  guessing syntax.
