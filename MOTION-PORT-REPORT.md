# Motion Port Report — annnimate.com/animations

Source: https://www.annnimate.com/animations (full catalog = **51 components**, lazy-loaded)
Method: clean-room from behavior, GSAP-only, per `.claude/skills/gsap-motion-port`.
**Every component is studied by driving its live sandbox iframe
(`/api/sandbox/iframe/<slug>`) — real interaction, no guessing from descriptions.**

## Already covered by the existing kit (6)

| Component | Catalog slug |
|-----------|--------------|
| TextScramble | text-scramble |
| DrawPath | svg-draw-path |
| ImageFollowList | image-follow-list |
| Magnetic | magnetic-button |
| Typewriter | typewriter — built this run ✓ verified live |
| CharacterAppear | character-appear — built this run ✓ verified live |

## Worklist — 45 to port

Status: `pending` / `studying` / `built` / `degraded` / `skipped`.

### Text & scroll-text
| Component | slug | status |
|-----------|------|--------|
| TextReveal | text-reveal | built ✓ verified live (masked word slide-up, stagger 0.1, top 75%) |
| DualScramble | dual-scramble | built ✓ verified live (frame-captured: left-to-right reveal, symbol charset; sr-only + aria-hidden dual layer; triggers scroll/hover/click) |
| TextMorph | text-morph | built ✓ verified live (GSAP Flip per-char morph: shared chars slide via stable flip-id, enter/exit fade, power3.out 0.3s. Demo is INPUT-driven search-bar — agent observed a real word→word morph by typing, productized as auto-cycle. Honestly labeled in code.) — parallel self-study |
| RectangleTextReveal | rectangle-text-reveal | built ✓ verified live (per-line bar scaleX 1→0 sweep + text slide-in 80→0, scroll-once, stagger 0.12) — parallel self-study agent |
| PoppingText | popping-text | built ✓ verified live (per-char scale 0→1 back.out(2) overshoot, per-line ScrollTrigger scrub, SplitText chars) — parallel self-study agent |
| MaskReveal | mask-reveal | built ✓ verified live (clip-path ellipse 0→200%/150% wipe from top-center, scroll/scrub) — parallel self-study agent |
| FoldingText | folding-text | built ✓ verified live (per-char rotateY 90→0 left-hinge, perspective 1200, scrub, stagger 0.04 from end) — parallel self-study agent |
| ElementReveal | element-reveal | built ✓ verified live (generic wrapper: y+opacity entrance, direction up/down/left/right, scroll-once or load) — parallel self-study agent |
| CinematicText | cinematic-text | built ✓ verified live (per-line translateX 40→0 + fade, scrub; agent DISPROVED blur hypothesis by observation) — parallel self-study agent |
| TextShimmerWave | text-shimmer-wave | built ✓ verified live (load-loop per-char sine crest; color→opacity/lift/scale for theme-neutrality; sine.inOut, period 2s) — parallel self-study |
| TextUnderline | text-underline | built ✓ verified live (hover scaleX bar with origin-flip wipe in-from-left/out-to-right, expo.out; scroll variant too) — parallel self-study |
| TextSplitZoom | text-split-zoom | built ✓ verified live (scrubbed inline image zoom 0→full, start top bottom→top center) |
| VelocityClip | velocity-clip | built ✓ verified live (scroll-velocity clip-path shear, settles to rectangle) |

### Scroll & layout motion
| Component | slug | status |
|-----------|------|--------|
| MultiFlip | multi-flip | built ✓ verified live (pinned ~3x-viewport, scrubbed; 4 cards scatter x/y/rotation from gathered fan; plain transforms, NOT Flip plugin) — parallel self-study |
| Parallax | parallax | built ✓ verified live (scrubbed yPercent, neutral mid-viewport) — parallel-agent built |
| Progress | progress | built ✓ verified live as **ScrollProgress** (renamed — shadcn `Progress` collision; ring strokeDashoffset + bar scaleX, scroll-linked, % label) — parallel self-study |
| HideHeader | hide-header | built ✓ verified live (direction-aware fixed header: down=hide translateY -100%, up=show, always-show near top; back.out overshoot) — parallel self-study |
| FlipZone | flip-zone | built ✓ verified live (GSAP Flip shared-element morph between two zones, pinned scrub, re-flips on scroll-up) — parallel self-study |
| RandomRotate | random-rotate | built ✓ verified live (hover/focus → random tilt ±10° back.out(1.7), springs back; seeded resting fan for SSR parity) — parallel self-study |
| Marquee | marquee | built ✓ verified live (infinite dual-track loop, pause-on-hover; drag omitted v1) — parallel-agent built |
| InfiniteParallaxSlider | infinite-parallax-slider | built ✓ verified live (prev/next carousel + per-frame inner-image parallax factor 1/6, imgScale 1.3, power3.out) — parallel self-study |
| ImageTrail | image-trail | built ✓ verified live (pointer distance-gated spawn ≥50px, pool 5, scale-pop-then-collapse back.out(2), opacity constant) — parallel self-study |
| AnimatedGrid | animated-grid | built ✓ verified live (grid-aware staggered y-entrance, scroll-once; patterns diagonal/center/rows/random-seeded) — parallel self-study |
| BackgroundColor | background-color | built ✓ verified live (per-zone scrubbed wrapper backgroundColor rgb-lerp, ease none; N stops) — parallel self-study |
| Counter | counter | built ✓ verified live (odometer roll to 10,482) — parallel-agent built; 2 bugs caught at central verify (10× spec error + SSR/gsap transform compounding), fixed |

### UI components
| Component | slug | status |
|-----------|------|--------|
| Tooltip | tooltip | built ✓ verified live as **MotionTooltip** (shadcn collision; anchored scale 0.9→1 + y 8→0 + fade, power2, hide grace delay) — parallel self-study |
| MorphingDialog | morphing-dialog | built ✓ verified live (GSAP Flip shared-element card→fixed dialog morph + backdrop fade, power3.inOut, Esc/backdrop/X close) — parallel self-study |
| Accordion | accordion | built ✓ verified live as **MotionAccordion** (shadcn collision; single-open height 0↔auto + chevron 180° + content fade, power2) — parallel self-study |
| HoverableList | hoverable-list | built ✓ verified live (per-row SVG path-morph liquid fill rising from bottom, power3.out; siblings unchanged) — parallel self-study |
| CircularSlider | circular-slider | built ✓ verified live (16-slot wheel, 360/count step, ring rotation back.out(1.4), prev/next; only top arc visible) — parallel self-study |
| InfiniteDraggableGrid | infinite-draggable-grid | built ✓ verified live (GSAP Draggable x,y + positive-modulo wrap → endless plane from small DOM set; inertia available, off by default to match demo snap) — parallel self-study |
| Card3DFlip | 3d-card-flip | built ✓ verified live (pointer-tilt rotateX/Y + scale 1.1; agent found demo is TILT-only not back-flip, built tilt as default + optional flip mode) — parallel self-study |
| CustomCursor | custom-cursor | built ✓ verified live (scoped quickTo follower expo.out 0.7s, hover grows to labelled pill; desktop-only, area-scoped) — parallel self-study |

### Buttons
| Component | slug | status |
|-----------|------|--------|
| RainbowButton | rainbow-button | built ✓ verified live (always-on background-position gradient sweep 0→200%, period 2s ease none; glow ::before) — parallel self-study |
| IconButton | icon-button | built ✓ verified live (masked diagonal icon swap, power3.inOut 0.5s, Phosphor ArrowUpRight; **central-gate bug fixed**: forwardRef icon rendered as child → crash; isIconComponent now accepts forwardRef/memo) — parallel self-study |
| CurveFillButton | curve-fill-button | built ✓ verified live (hover SVG path-morph fill rising bottom-up with quadratic curved front, back.out(1.4)) — parallel self-study |
| CircleFillButton | circle-fill-button | built ✓ verified live (circle scales from cursor-entry point to cover button, power2.out; shrinks back on leave) — parallel self-study |
| BackgroundFillButton | background-fill-button | built ✓ verified live (fill panel scaleY-from-bottom sweep, power4.inOut; optional origin-flip-on-leave) — parallel self-study |

### Menus
| Component | slug | status |
|-----------|------|--------|
| GooeyMenu | gooey-menu | built ✓ verified live (FAB fans items along 160° arc r70, back.out(1.7), stagger 0.05; real SVG goo filter feGaussianBlur 10 + feColorMatrix; unique filter id per instance) — parallel self-study |
| MegaMenu | mega-menu | built ✓ verified live (hover nav → panel height 0→auto + scaleY, per-item autoAlpha+x stagger, sliding underline indicator; A→B morphs height without close) — parallel self-study |
| MultiLevelDrawerMenu | multi-level-drawer-menu | built ✓ verified live (drawer slide-in + scrim, nested-level horizontal slide translateX -depth*width, power3.out; overlay conditionally mounted = no /lab hijack) — parallel self-study |
| FullscreenSlideMenu | fullscreen-slide-menu | built ✓ verified live (hamburger → full-viewport panel yPercent 100→0 power3.inOut + masked link stagger; Esc/X close; closed-by-default gated overlay) — parallel self-study |

### Shaders (studied; WebGL → honest GSAP/DOM approximation where needed)
| Component | slug | status |
|-----------|------|--------|
| GooeyHoverReveal | gooey-hover-reveal | built ✓ verified live — **DEGRADED (honest)**: original is THREE.js r169 WebGL per-pixel displacement shader (not reproducible in GSAP). Built a faithful DOM approximation: blurred base + crisp top layer clipped to an SVG-filter gooey mask (feGaussianBlur+feColorMatrix) that the pointer paints via gsap.quickTo. Matches the paint-to-reveal interaction + liquid edge; not the per-pixel fluid displacement. — parallel self-study |
| MeshGradient | mesh-gradient | built ✓ verified live — **DEGRADED (honest)**: original is THREE.js r169 WebGL noise-warp shader. Built a DOM approximation: stack of large blurred radial-gradient blobs drifting on slow Lissajous paths via one looping gsap tween. Same morphing-mesh look (pink/purple/orange), not the per-pixel noise warp. — parallel self-study |
| ImageDissolveScroll | image-dissolve-scroll | built ✓ verified live — **DEGRADED (honest)**: original is THREE.js r169 WebGL dissolve shader, scroll-scrubbed. Built a genuine DOM dissolve: scroll-scrubbed SVG feTurbulence→feDisplacementMap→alpha-threshold feColorMatrix on the image (pin+scrub), eats the image away + fades out. Same scroll-driven disintegration, not per-pixel particle fidelity. — parallel self-study |

## Build log

**Method correction:** scroll-driven effects MUST be studied by driving their
live sandbox demo and scroll-frame diffing — NOT from catalog descriptions.
Sandbox URL = `/api/sandbox/iframe/<slug>`. Gotcha: ScrollTrigger updates on a
RAF after the scroll event, so read transforms via an async `scrollTo → dispatch
scroll → await ~400ms → DOMMatrix` loop. Both recorded in the skill.

### Typewriter — built ✓
Load-triggered looping GSAP timeline (proxy count → textContent), no setInterval.
+4 unit tests. Verified live on /lab: actively cycling.

### CharacterAppear — built ✓
Scroll-into-view (once) per-char opacity reveal, random scatter default
(`data-anm-stagger=0.02`). Bug caught: function-based `delay` → NaN stalls the
tween (chars stuck at opacity 0); fixed with a `stagger` function. Re-verified
live: all 17 chars reveal on scroll-in. +5 unit tests, seeded deterministic order.

### TextReveal — built ✓
Masked word slide-up (yPercent 100→0), opacity solid, stagger 0.1, start top 75%,
on-enter once. Verified live: words settle to translateY 0 on scroll-in. +3 tests.

### DualScramble — built ✓
Accessible ScrambleText (sr-only real text + aria-hidden animated layer), glitchy
symbol charset, left-to-right reveal, triggers scroll/hover/click. Frame-captured
on reference + verified live on /lab (26-frame scramble → "RUNNING"). +3 tests.

### TextSplitZoom — built ✓
Scrubbed inline-image zoom (start top bottom → end top center, scrub 1); image
grows 0→full pushing split text apart. Manual progress→{width,scale} mapping.
Verified live: wrap width scrubs 0→120. +4 tests.

### VelocityClip — built ✓
Scroll-velocity clip-path shear via ScrollTrigger.getVelocity(), debounced settle
to a rectangle. Verified live: shears on fast scroll, returns to rect. +4 tests.

### Parallel build pipeline (adopted)
Browser STUDY stays serial (one shared Playwright browser). The BUILD parallelizes:
I scout a demo → write a precise spec → dispatch one general-purpose agent per
component (each writes only its 3 disjoint files + runs its own vitest, never
touches the barrel/lab). I then integrate barrel + /lab centrally, run tsc + full
vitest, and **live-verify each on /lab**. First parallel batch = Counter, Marquee,
Parallax (~136k tokens off main context). Central verify caught 2 real Counter
bugs before they shipped — proof the gate matters.

### Parallel self-study pipeline (batch 1: text family)
Breakthrough: playwright@1.58.2 is installed in predart-starter/node_modules, so each
build agent launches its OWN headless Chromium and studies its component in parallel —
study is no longer serialized through one shared browser. Each agent: writes a capture
script (scroll-frame-diff w/ DOMMatrix, reduced-motion pass) → builds 3 disjoint files
→ self-tests. Orchestrator integrates barrel + /lab centrally, runs tsc + full vitest +
live smoke. Batch 1 = RectangleTextReveal, PoppingText, MaskReveal, FoldingText,
ElementReveal, CinematicText — all 6 verified live on /lab (16 grid cards, 0 console
errors). The "observe don't guess" discipline held at the agent level: the CinematicText
agent disproved a blur+y hypothesis by actually reading getComputedStyle.filter.

### Batch 2 (scroll & layout family) — all 6 verified live
MultiFlip, ScrollProgress (renamed from Progress — shadcn collision), HideHeader,
FlipZone, RandomRotate, AnimatedGrid. /lab now: 17 grid cards + page-chrome
(HideHeader fixed bar, ScrollProgress ring) + full-width pinned sections
(AnimatedGrid, MultiFlip, FlipZone). 0 console errors. Naming guard worked: agent
detected `components/ui/progress.tsx` and exported `ScrollProgress` instead.

### Batch 3 (mixed: text + scroll + sliders) — all 6 verified live
TextShimmerWave, TextUnderline, BackgroundColor, InfiniteParallaxSlider, ImageTrail,
CircularSlider. /lab: 19 grid cards + 4 new full-width sections. 0 console errors.
Lab passes inline `ph()` data-URIs to ImageTrail/CircularSlider/Slider so the gallery
stays offline (components default to picsum, fine for real use).

### Batch 4 (UI family) — all 6 verified live
MotionTooltip, MorphingDialog, MotionAccordion, HoverableList, Card3DFlip, CustomCursor.
/lab: 22 grid cards + 3 new sections. 0 console errors. Naming guard renamed Tooltip→
MotionTooltip & Accordion→MotionAccordion (shadcn primitives exist). Observation honesty:
Card3DFlip demo was tilt-only — agent refused to fabricate the back-flip, made it optional.

### Batch 5 (buttons + draggable grid) — all 6 verified live
RainbowButton, IconButton, CurveFillButton, CircleFillButton, BackgroundFillButton,
InfiniteDraggableGrid. /lab: 27 grid cards + draggable-grid section. The live gate
caught a REAL crash unit-tests+tsc missed: IconButton's default ArrowUpRight is a
forwardRef object, not a function → rendered as a child → React threw. Fixed the
isIconComponent guard. This is the 3rd time the central live-verify caught a bug
agents' green tests didn't (Counter ×2, IconButton ×1).

### Batch 6 (menus + TextMorph revisit + first shader) — all 6 verified live
GooeyMenu, MegaMenu, MultiLevelDrawerMenu, FullscreenSlideMenu, TextMorph, GooeyHoverReveal.
/lab: 33 grid cards + MegaMenu section. 0 console errors. Notes: (a) transient API 500s
killed the first attempt of this batch (4 of 6 + a retry of 2 recovered it — no partial
files leaked, one stray study script cleaned). (b) TextMorph un-deferred: observed a real
Flip morph by typing into the search bar, productized as auto-cycle. (c) GooeyHoverReveal
is genuine THREE.js WebGL → honest DOM approximation, flagged DEGRADED in code + ledger.

### Batch 7 (final 2 shaders) — both verified live
MeshGradient, ImageDissolveScroll — both genuine THREE.js r169 WebGL, both honestly
DEGRADED with faithful DOM approximations (drifting radial blobs; feTurbulence dissolve).

## ✅ COMPLETE — 51/51 catalog ported
- **6** already covered by the prior kit + **45 built** this effort = **51/51**.
- **0 pending, 0 deferred.**
- **3 honest DEGRADES** — all genuine WebGL (THREE.js) where a GSAP/DOM kit cannot
  reproduce a fragment shader: GooeyHoverReveal, MeshGradient, ImageDissolveScroll.
  Each ships a faithful DOM approximation + a DEGRADED note in code and here.
- **Full motion suite: 345 tests green (52 test files).** `tsc --noEmit` clean across
  all ported files + /lab + barrel (only 2 pre-existing, unrelated shadcn errors remain:
  components/ui/sidebar.tsx, components/ui/spinner.tsx).
- **/lab**: 33 grid cards + 19 sections (full-width pinned/scroll/overlay demos), 0 console errors.

### What the parallel self-study pipeline delivered
Each component was studied by a dedicated agent driving its OWN headless Chromium
(playwright in node_modules) against the live sandbox iframe — real interaction, never
guessing. Builds ran in parallel (disjoint files); the orchestrator integrated barrel +
/lab centrally and live-verified every component on /lab. The central live gate caught
**3 real bugs that agents' own green unit tests + tsc missed**: Counter ×2 (10× spec
error, SSR/gsap transform compounding) and IconButton ×1 (forwardRef icon rendered as a
React child → runtime crash). "Observe, don't guess" repeatedly corrected wrong priors
(CinematicText had no blur; Card3DFlip was tilt-only not a back-flip; TextMorph is
input-driven not auto-cycle). Transient API 500s once killed a batch mid-flight — no
partial files leaked; a targeted retry recovered it.
