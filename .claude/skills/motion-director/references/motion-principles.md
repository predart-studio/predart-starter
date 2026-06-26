# Motion Principles — the Director's craft

This is the agency-grade knowledge a principal motion designer carries: how to choose timing,
easing, distance, and choreography so a whole site feels like one hand made it. Read this when
deciding *how much* of a gesture to apply, or when judging whether motion feels right.

The single rule everything below serves: **cohesion beats novelty.** A site feels premium when
ten sections share one motion language, not when each section is individually clever.

---

## 1. The five laws (apply before anything else)

1. **Purpose first.** Every animation must orient, give feedback, or show a relationship. If it
   only decorates, cut it or make it ambient and subordinate. "Looks cool" is not a purpose.
2. **Frequency dictates intensity.** The more often a user sees a gesture, the shorter and
   subtler it must be. A once-per-visit hero beat can be 1.2s and dramatic; a hover the user
   triggers 50 times must be ~150–200ms and quiet.
3. **One language.** A finite, shared set of durations, eases, distances, and staggers — used
   everywhere. New values are a bug unless they earn a named exception.
4. **Subordination.** At any moment, one thing leads. Background loops, ambient float, and
   secondary reveals must not compete with the primary gesture. Never fire three attention-
   grabbing beats at once.
5. **Respect the user.** 60fps non-negotiable; composite-only motion; honor
   `prefers-reduced-motion` in both JS and CSS.

---

## 2. Timing ladder (durations)

Pick duration by the *role* of the motion, not by feel-in-the-moment. Industry ranges:

| Role | Range | Notes |
| --- | --- | --- |
| **Micro** (hover, press, tap, color, focus) | 120–200ms | Instant-feeling feedback. One value site-wide. |
| **UI** (tooltips, small reveals, icon swaps, toggles) | 200–350ms | Small surfaces, short distance. |
| **Reveal** (the workhorse scroll/enter reveal) | 400–650ms | The default "rise + fade." |
| **Large / hero** (big blocks, mask reveals, scene beats) | 650–900ms | Reserve for large surfaces or first impressions. |
| **Page / route transition** | 500–800ms | Whole-view changes. |
| **Image clip-path reveal** | 1000–1200ms | Large luxurious wipe; use sparingly. |

**Rules of thumb**
- **Exits are shorter than enters** (≈ half). The user's focus is leaving; don't fight for it.
- **Bigger travels longer.** Duration scales with distance and surface size, not arbitrarily.
- **Collapse, don't proliferate.** If two gestures do the same job, they get the same duration.
  Seven durations for one "rise + fade" gesture is the #1 cause of a site feeling hectic.

## 3. Easing menu (curves)

Easing carries more of the "feel" than duration. Keep a tiny menu and assign by role:

| Role | Curve (CSS) | GSAP | Motion array | Feel |
| --- | --- | --- | --- | --- |
| **Entrance / reveal** (default, the *house* curve) | `cubic-bezier(0.22, 1, 0.36, 1)` | `power3.out`-ish / `CustomEase` | `[0.22, 1, 0.36, 1]` | Strong, confident ease-out |
| **Exit** | `cubic-bezier(0.4, 0, 1, 1)` | `power2.in` | `[0.4, 0, 1, 1]` | Quick getaway |
| **A→B on-screen** (layout, crossfade) | `cubic-bezier(0.65, 0, 0.35, 1)` | `power2.inOut` | `[0.65, 0, 0.35, 1]` | Symmetric, calm |
| **Scrubbed / continuous / marquee** | `linear` | `none` | `"linear"` | Tied to scroll — must be linear |
| **Snappy** (optional) | `cubic-bezier(0.87, 0, 0.13, 1)` | `power4.out` | `[0.87, 0, 0.13, 1]` | Decisive |
| **Overshoot / pop** (rare, ONE amount) | — | `back.out(1.7)` | `{type:'spring', stiffness:300, damping:20}` | Playful; reserve for special pops |

**Easing laws**
- **Ease-out is the default** for anything responding to the user or entering the screen.
- **Never ease-in an entrance** (feels sluggish/broken). Ease-in is for exits only.
- **Linear ONLY for scrub and marquee.** A scrubbed timeline with a non-linear ease breaks the
  1:1 scroll↔position mapping.
- **One overshoot amount.** If pops use `back.out`, pick a single value (e.g. `1.7`) everywhere.
  `back.out(1.5)` in one place and `back.out(1.8)` in another reads as two different physics.
- **Asymmetric > symmetric** for life: a curve that accelerates and decelerates differently feels
  more alive. The house curve is asymmetric on purpose.

## 4. Distance & magnitude

The "rise + fade" gesture should use a **3-step distance scale**, chosen by element size:

| Step | Travel | For |
| --- | --- | --- |
| **rise-sm** | 12–16px | Text lines, labels, small inline elements |
| **rise-md** | 24–32px | Cards, list items, blocks (the default) |
| **rise-lg** | 40–48px | Large frames, full-width media, hero blocks |

- **Never exceed ~48px** for a standard reveal — beyond that it reads as "flying in," not "settling."
- Pair distance with blur (≤8px) and opacity for the premium "soft focus" enter.
- Horizontal slides (x) are a *signature* move — keep them rare and deliberate (e.g. one hero
  headline), not a section default.

## 5. Choreography (stagger & orchestration)

Cascade timing is what makes a list feel composed rather than dumped on screen.

**Stagger scale** (per-item delay):

| Step | Delay | For |
| --- | --- | --- |
| **stagger-tight** | 0.02–0.04s | Per-character / dense grids (many items) |
| **stagger-base** | 0.06–0.08s | Default lists, cards (the workhorse) |
| **stagger-loose** | 0.10–0.12s | A few large blocks |

- **One rhythm per section.** Adjacent sections cascading at 0.08, then 0.12, then 0.14×index
  reads as three different machines. Pick by item *count and size*, then commit.
- **Total cascade budget:** keep the last item's delay under ~0.4s. A diagonal `index*0.14` over
  many items pushes the final item to 0.4s+ and the section feels slow.
- **Split, then stagger** (enter animations): break a header into title / subtitle / actions and
  stagger those chunks ~100ms; optionally split a title into words at ~80ms. Never animate one
  big container.
- **Orchestrate with timeline position offsets**, not piles of `delay:`. In GSAP, sequence beats
  on a timeline (`tl.to(...).to(..., "<0.1")`) so the whole thing is one editable score.

## 6. Enter / exit / hover patterns (exact values)

**Enter (split + stagger):** per chunk — `opacity 0→1`, `y rise-md→0`, `filter blur(4px)→0`,
duration *reveal*, ease *house*, stagger ~0.08 between chunks.

**Exit (subtle):** `opacity 1→0`, small fixed `y` (e.g. `-12px`, never full height),
`filter blur→4px`, duration ≈ half the enter, ease *exit*. Keep directional movement so the
user knows where it went. Don't just `display:none`.

**Hover / press:**
- Interactive states use **interruptible CSS transitions**, never keyframes (keyframes restart;
  transitions retarget mid-flight).
- Press feedback: `scale(0.96)` exactly — never below 0.95 (exaggerated). Always `motion-safe`-gated.
- Hover: animate `opacity` / `scale` / `blur`, never toggle `visibility`. One micro duration.
- **Never `transition: all`** — name the exact properties (`transition-property: transform, opacity`).

**Contextual icon swaps** (play→pause, etc.): cross-fade with exact values —
`scale 0.25→1`, `opacity 0→1`, `blur 4px→0`. With Motion use
`transition: { type: "spring", duration: 0.3, bounce: 0 }` (**bounce always 0**). Without a motion
lib, keep both icons in the DOM (one absolutely positioned) and cross-fade with CSS using
`cubic-bezier(0.2, 0, 0, 1)`.

**Skip animation on load:** `AnimatePresence initial={false}` for elements already in default
state (icon swaps, toggles, tabs) — but NOT for intentional first-paint entrances (hero stagger).

## 7. Scroll-driven motion (GSAP + Lenis)

- **Reveals are one-shot:** `once: true`, single shared `start` (e.g. `"top 85%"`). A uniform wake
  point is most of what makes scrolling feel calm. Don't scatter 72% / 80% / 90%.
- **Scrubbed scenes:** `ease: "none"`, ONE canonical scrub weight site-wide. Two different scrub
  numbers on adjacent sections changes the "scroll feel" mid-page.
- **Scrub vs toggleActions:** never both on one trigger. Scrub = tied to scroll; toggleActions =
  discrete play/reverse.
- **Pinning:** don't animate the pinned element itself — animate its children. CSS `sticky` is a
  lighter alternative that plays nicely with Lenis (this project prefers it).
- **Lenis must be tuned and wired:** register `lenis.on('scroll', ScrollTrigger.update)`, drive
  `lenis.raf` from `gsap.ticker`, `lagSmoothing(0)`. Give Lenis explicit options
  (`lerp`/`duration`, `smoothWheel`) — untuned `new Lenis()` stacked under a scrub feels floaty.
- **Order & refresh:** create triggers top-to-bottom (or set `refreshPriority`); call
  `ScrollTrigger.refresh()` after fonts/images/dynamic content change positions.
- **Never** drive animation from `scroll`/`scrollY` events; never put ScrollTrigger on a child
  tween of a timeline (put it on the timeline).

## 8. Craft details that compound (the small stuff)

These are individually tiny and collectively the difference between "fine" and "premium":

- **Concentric radius:** nested rounded elements — `outerRadius = innerRadius + padding`.
- **Tabular numbers** (`font-variant-numeric: tabular-nums`) on any animating/updating numbers.
- **`text-wrap: balance`** on headings, **`pretty`** on body — stops orphans during reveals.
- **Image outlines:** subtle 1px low-opacity outline for consistent depth.
- **Optical alignment** over geometric for icons in motion (play triangles, arrows).
- **Minimum 40×40px hit area** for interactive controls.
- **Font smoothing:** `-webkit-font-smoothing: antialiased` on root (macOS).

## 9. Performance laws (hard constraints)

Rendering cost by property: **composite** (`transform`, `opacity`) → cheap; **paint** (color,
borders, gradients, masks, filters) → medium; **layout** (width, height, top, left, flow) → expensive.

- **Default to `transform` + `opacity`.** Use JS-driven motion only when interaction requires it.
- **Never animate layout properties continuously** on large/meaningful surfaces. Prefer FLIP for
  layout-like effects.
- **Blur:** ≤ 8px, small surfaces, short one-time effects only. Never animate blur continuously or
  on large containers. Prefer opacity + translate before reaching for blur.
- **`will-change`:** only `transform`/`opacity`/`filter`, surgically and temporarily, only when you
  observe first-frame stutter. Never `will-change: all`, never leave it on.
- **No measurement loops:** batch DOM reads before writes; measure once then animate via transform.
- **Don't mix two systems that each measure/mutate layout** on the same element. Pick one engine
  per property per element (never animate the same property with GSAP *and* Framer).
- **Pause/stop off-screen animation;** no `requestAnimationFrame` loop without a stop condition.

## 10. Reduced motion (accessibility, non-negotiable)

- **One mechanism** for the policy. This project uses the `usePrefersReducedMotion()` hook — every
  motion component early-returns to the settled state before building a timeline. Don't introduce a
  second parallel mechanism.
- **Also ship the CSS fallback** — a `@media (prefers-reduced-motion: reduce)` block that nukes
  durations for anything CSS-driven:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```
- **Gate Tailwind transform hovers** with `motion-safe:` (e.g. `motion-safe:group-hover:scale-110`).
  Color-only hovers are low-risk but gate them too for consistency.
- Reduced motion means *settled final state instantly*, never *broken layout* or *missing content*.

## 11. Library decision matrix (this stack)

| Task | Use | Why |
| --- | --- | --- |
| Scroll timelines, pinning, scrub, sequenced choreography | **GSAP + ScrollTrigger** | Page-scoped control |
| Component enter/exit, hover/tap, layout, drag, presence | **Framer Motion** | Component-scoped, React-native |
| Smooth scroll | **Lenis** | Wired into ScrollTrigger |
| Continuous text scroll | Marquee via GSAP `repeat:-1`, `ease:"none"` | Linear loop |

**Boundary rule:** GSAP for page-scoped, Framer for component-scoped, and **never animate the same
property on the same element with both.** Don't migrate libraries to fix a value — fix the value
within the existing engine.
