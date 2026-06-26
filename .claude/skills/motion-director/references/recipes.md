# Recipes — patterns wired to the system

Copy-paste-grade motion for this stack (GSAP + ScrollTrigger + Lenis + Framer Motion + Tailwind v4
tokens). Every recipe pulls from `lib/motion.generated.ts` and the `--*` CSS vars — no hardcoded
seconds, eases, or distances. Always guard with `usePrefersReducedMotion()`.

Import surface:
```ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EASE, EASE_CSS, DURATION, STAGGER, RISE, SCRUB, REVEAL_START, OVERSHOOT } from "@/lib/motion.generated";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
```

---

## 1. The house reveal (scroll, one-shot) — prefer this everywhere

Reuse `<ElementReveal>` for the standard rise+fade. Build bespoke only for signature moments.

```tsx
<ElementReveal>            {/* defaults: house ease · RISE.lg · DURATION.base · STAGGER.base · once at top 85% */}
  <Card />
  <Card />
  <Card />
</ElementReveal>
```

Raw GSAP equivalent (when a wrapper won't do), respecting reduced motion + cleanup:

```tsx
const reduced = usePrefersReducedMotion();
const scope = useRef<HTMLDivElement>(null);

useGSAP(() => {
  if (reduced) return; // settled state already rendered
  gsap.from(scope.current!.querySelectorAll("[data-reveal]"), {
    opacity: 0,
    y: RISE.md,
    duration: DURATION.base,
    ease: "house",            // registered once via register-house-ease.ts
    stagger: STAGGER.base,
    scrollTrigger: { trigger: scope.current, start: REVEAL_START, once: true },
  });
}, { scope, dependencies: [reduced] });
```

**Rules:** one wake point (`REVEAL_START`), `once: true`, items carry `data-reveal`, the settled
state is the SSR/no-JS default so nothing is invisible without JS.

## 2. Scrubbed scene (scroll-driven, linear)

For parallax / pinned-feel / per-char waves. `ease:"none"` is mandatory; one `SCRUB` weight.

```tsx
useGSAP(() => {
  if (reduced) return;
  gsap.to(".layer-back", {
    yPercent: 8,
    ease: "none",
    scrollTrigger: { trigger: section.current, start: "top top", end: "bottom bottom", scrub: SCRUB },
  });
}, { scope: section, dependencies: [reduced] });
```

Prefer CSS `sticky` over GSAP `pin` here (plays nicer with Lenis). Never combine `scrub` and
`toggleActions` on one trigger.

## 3. Marquee (ambient loop, behind content)

```tsx
useGSAP(() => {
  if (reduced) return;
  gsap.to(".marquee-track", {
    xPercent: -50,
    duration: 28,           // per-column loop; keep slow + subordinate
    ease: "none",
    repeat: -1,
  });
}, { dependencies: [reduced] });
```

One ambient loop at a time. Fade it in *after* the hero text settles so it doesn't compete on load.

## 4. Enter animation — split + stagger (Framer)

For component-scoped entrances (a header block). Split into chunks; stagger ~`STAGGER.base`.

```tsx
const container = { hidden: {}, visible: { transition: { staggerChildren: DURATION.base * 0.13 } } };
const item = {
  hidden:  { opacity: 0, y: RISE.sm, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)",
             transition: { duration: DURATION.base, ease: EASE.house } },
};

<motion.div variants={container} initial="hidden" animate="visible">
  <motion.h2 variants={item}>Title</motion.h2>
  <motion.p  variants={item}>Subtitle</motion.p>
  <motion.div variants={item}><CtaButton /></motion.div>
</motion.div>
```

## 5. Exit — subtle (Framer)

Shorter than the enter, small fixed travel, ease-in. Don't steal focus.

```tsx
<motion.div
  exit={{ opacity: 0, y: -12, filter: "blur(4px)",
          transition: { duration: DURATION.fast, ease: EASE.exit } }}
/>
```

## 6. Hover + press (interruptible CSS — no keyframes)

```tsx
<button className="transition-[background-color,color,transform] duration-[var(--duration-micro)] ease-[var(--ease-house)]
                   motion-safe:active:scale-[0.96] hover:text-foreground">
  Label
</button>
```

- Name exact properties — **never `transition: all`**.
- Press = `scale(0.96)` exactly, `motion-safe`-gated.
- One micro duration for every hover/press/color on the site.

## 7. Contextual icon swap (cross-fade, exact values)

```tsx
<AnimatePresence initial={false} mode="popLayout">
  <motion.span key={active ? "on" : "off"}
    initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
    exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
    transition={{ type: "spring", duration: DURATION.fast, bounce: 0 }}>  {/* bounce ALWAYS 0 */}
    <Icon />
  </motion.span>
</AnimatePresence>
```

`scale 0.25→1`, `opacity 0→1`, `blur 4px→0` — do not deviate. `initial={false}` so it doesn't fire on load.

## 8. Number ticker (no layout shift)

```tsx
<span className="tabular-nums">{value}</span>  // font-variant-numeric: tabular-nums
```

Use the existing `Counter` component for odometer rolls; keep `tabular-nums` so digits don't jitter.

## 9. Reduced motion — both layers

**JS (per component):** the one mechanism — early-return to settled state.
```tsx
const reduced = usePrefersReducedMotion();
if (reduced) return; // inside the GSAP/Framer effect, before building a timeline
```

**CSS (global fallback, in a NON-generated stylesheet — not globals.css):**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## 10. Lenis + ScrollTrigger wiring (the one provider)

```tsx
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
// skip on /studio; cleanup: gsap.ticker.remove + lenis.destroy on unmount
```

---

## Anti-patterns (reject in review)

- A new duration / ease / distance that isn't in `lib/motion.generated.ts` and isn't a documented
  signature exception → replace with the nearest token.
- `transition: all`, `will-change: all`, or `will-change` left on permanently.
- Animating `width`/`height`/`top`/`left`/`margin` for motion (use `transform`).
- A keyframe animation on an interactive (hover/toggle) element (use an interruptible transition).
- `scrub` + `toggleActions` on the same trigger; ScrollTrigger on a child tween of a timeline.
- The same property animated by GSAP *and* Framer on the same element.
- A reveal with no `usePrefersReducedMotion()` guard, or whose content is invisible without JS.
- More than one attention-grabbing beat firing simultaneously (subordinate the rest).
- Blur animated continuously, on a large surface, or above 8px.
