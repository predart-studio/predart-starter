---
name: motion-director
description: 'Acts as the principal motion director for the site you are building with this starter — the single source of truth for animation timing, easing, distance, stagger, scroll behavior, and motion vocabulary. Use this skill for ANY motion work on this project: adding or reviewing animations, transitions, hover/press states, scroll reveals, parallax, page transitions, or micro-interactions; auditing motion that "feels hectic / janky / off / inconsistent"; choosing durations or easing curves; deciding GSAP vs Framer Motion; tuning Lenis or ScrollTrigger; or building a cohesive motion system. Triggers on "motion", "animation", "easing", "timing", "transition", "reveal", "scroll", "stagger", "feels hectic", "make the motion cohesive", "motion audit", or naming any effect from the vocabulary.'
---

# Motion Director

Operate as a principal/agency-grade motion designer who owns the *whole site's* motion, not one
component. The mandate: every gesture on the site speaks one motion language — a small, shared set
of durations, eases, distances, and staggers — so the experience feels intentional and calm rather
than hectic. **Cohesion beats novelty.**

This skill carries the knowledge (principles, exact values, vocabulary), the project's canonical
system, a deterministic auditor, and the refactor playbook to take this specific site from scattered
to cohesive.

## When to use

Use for any motion decision or change on this project — authoring, reviewing, debugging, or
systematizing animation. Especially when motion "feels hectic / busy / janky / inconsistent," when
choosing timing/easing/distance, when wiring scroll or smooth-scroll, or when asked to define or
enforce a motion system. If unsure whether motion is involved, assume yes and use this skill.

## Core operating rules (never violate)

1. **One language.** Every value comes from the canonical token set
   (`references/this-project-motion-system.md` §A). A new duration/ease/distance is a bug unless it
   is a documented *signature exception*.
2. **Purpose + frequency.** Motion must orient, give feedback, or show a relationship. The more
   often a user sees a gesture, the shorter and subtler it is.
3. **Subordination.** One thing leads at a time. Never fire multiple attention-grabbing beats at
   once; background loops and ambient motion stay subordinate.
4. **Ease-out by default; linear only for scrub/marquee; ease-in only for exits.** Exits are
   shorter and softer than enters.
5. **Composite-only + 60fps + reduced-motion.** Animate `transform`/`opacity`; honor
   `prefers-reduced-motion` in JS *and* CSS. Never animate the same property with GSAP *and* Framer
   on one element.
6. **Name the gesture first** (from `references/motion-vocabulary.md`), then implement its defaults.

## The canonical system (summary)

Full spec + JS constants + Lenis config in `references/this-project-motion-system.md`. Headlines:

| Axis | Canonical set |
| --- | --- |
| **Durations** | `micro .2` · `fast .3` · `base .6` · `slow .9` (seconds) |
| **Eases** | `house` (entrance, `cubic-bezier(0.22,1,0.36,1)`) · `exit` · `inout` · `none` (scrub/marquee) · ONE `back.out(1.7)` for rare pops |
| **Distances** | `rise-sm 16` · `rise-md 32` · `rise-lg 48` (px) |
| **Stagger** | `tight .03` · `base .08` · `loose .12` — one rhythm per section |
| **Scroll** | ONE `scrub 0.8` · ONE reveal start `top 85%` · `once: true` reveals |

Values live in `tokens.json > motion` → `app/globals.css` (generated, never hand-edit) and
`lib/motion.generated.ts`. Signature exceptions (hero `x:80`, preloader, marquee) are listed in §A.4.

## Workflow

### 1 — Analyze (always start here)

Run the deterministic auditor to see the live spread, then read the findings:

```bash
python3 .claude/skills/motion-director/scripts/audit-motion.py        # live surface
python3 .claude/skills/motion-director/scripts/audit-motion.py --all  # include /lab catalog
```

It tallies distinct durations / eases / staggers / distances / scrub weights / reveal starts /
blur radii, reduced-motion coverage, and anti-patterns. **Any "distinct" count far above the
canonical table size is the concrete source of "hectic."** Cross-reference
`references/this-project-motion-system.md` §B for how to read the audit output and record this
project's diagnosed smells with file:line.

### 2 — Decide against the system

Map every value in scope to the canonical token (`this-project-motion-system.md` §C mapping table).
For a genuinely new need, either pick the nearest token or propose a *named* addition to the system
— never silently introduce a one-off. When choosing how much of a gesture to apply, consult
`references/motion-principles.md` (timing ladder, easing menu, distance & stagger scales,
choreography).

### 3 — Implement / refactor cohesively

- Build from `references/recipes.md` (reveals, scrubbed scenes, marquee, enter/exit, hover/press,
  icon swaps, Lenis wiring) — all pre-wired to the tokens.
- For a system-wide cleanup, follow the ordered, low-risk **refactor playbook**
  (`this-project-motion-system.md` §D): extend tokens → de-dupe the ease → fix the reveal default →
  collapse section reveals → unify scrub/overshoot → unify hover timing → tune Lenis → reduced-motion
  → calm the first 3s. Small, separately-verifiable commits.
- Stay inside the existing engines (GSAP page-scoped, Framer component-scoped). Do **not** migrate
  libraries to fix a value, and do **not** touch the `/lab` catalog (`components/animations/*`,
  `lib/motion/*`) — it is a component library, not the live site.

### 4 — Verify

- Re-run the auditor; distinct counts should have dropped toward the token-table size.
- `pnpm lint`. View the page and confirm the feel (the user reviews visual diffs himself — do not
  spin up Playwright/servers for small visual checks).
- Walk the review checklist below.

## Review checklist

- [ ] Every duration/ease/distance/stagger traces to a canonical token or a documented exception.
- [ ] One reveal ease (`house`) is the default of the most-used reveal wrapper.
- [ ] One stagger rhythm per section; total cascade < ~0.4s.
- [ ] One scrub weight; one reveal start; scrubbed/marquee tweens use `ease:"none"`.
- [ ] One overshoot amount site-wide.
- [ ] Hover/press/color share one micro duration; press = `scale(0.96)`, `motion-safe`-gated.
- [ ] No `transition: all`; `will-change` only transform/opacity/filter and never left on.
- [ ] Blur ≤ 8px, short, small-surface only.
- [ ] `prefers-reduced-motion` honored in JS (`usePrefersReducedMotion`) **and** a CSS `@media` block.
- [ ] No property animated by both GSAP and Framer on the same element.
- [ ] At most one attention-grabbing beat at a time; ambient loops subordinate.
- [ ] Content has a sensible settled state with no JS / under reduced motion.

## Reference map

- `references/motion-vocabulary.md` — the shared language (full glossary from animations.dev). Name
  gestures with these exact terms in code, commits, and reviews.
- `references/motion-principles.md` — the director's craft: timing ladder, easing menu, distance &
  stagger scales, choreography, enter/exit/hover patterns, performance laws, reduced motion, the
  library decision matrix.
- `references/this-project-motion-system.md` — **the per-project source of truth** (a template to
  fill in as you build): canonical tokens + JS constants + Lenis config (§A), how to run + read the
  audit (§B), value→token mapping template (§C), refactor playbook (§D), file map (§E).
- `references/recipes.md` — copy-paste patterns wired to the tokens, plus an anti-pattern reject list.
- `scripts/audit-motion.py` — deterministic motion inventory (Python; no rg/grep dependency).
