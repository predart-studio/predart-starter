'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'

/* ── Tunables ──────────────────────────────────────────────────────────────
 * One solid brand-colour panel with a slanted edge sweeps left→right to cover,
 * holds briefly (route fetch window) with a small square loader, then keeps
 * sweeping right to uncover the swapped page. Direction is continuous, so it
 * reads as a single decisive wipe — not a curtain that bounces back.
 */
const SKEW_DEG = -12 // slant of the panel's leading/trailing edge
const COVER = 0.42 // s — sweep in (accelerates)
const HOLD = 0.5 // s — fully covered; loader ticks; page swaps under it
const REVEAL = 0.52 // s — sweep out (decelerates)
const OFF = 125 // xPercent offset that parks the panel fully off-screen
const INTRO_DELAY = 1 // s — settle before the first auto-play
const DWELL = 2 // s — the new page rests before the next auto-wipe

interface FauxPage {
  /** mono eyebrow shown above the headline */
  kicker: string
  headline: string
  sub: string
  /** label on the CTA that triggers the wipe to the other page */
  cta: string
  /** true = dark page (foreground bg), false = light page (background bg) */
  dark: boolean
}

const PAGES: FauxPage[] = [
  {
    kicker: 'demo — page one',
    headline: 'The page you start on.',
    sub: 'Click below — a diagonal panel wipes across and swaps the route underneath it.',
    cta: 'Next page',
    dark: true,
  },
  {
    kicker: 'demo — page two',
    headline: 'The page you land on.',
    sub: 'The same panel keeps moving the same direction, uncovering the swapped content.',
    cta: 'Back',
    dark: false,
  },
]

/**
 * PageWipe — a diagonal solid-colour page transition (the "Barba-style" overlay,
 * built native to React/GSAP instead of Barba).
 *
 * Self-contained /lab demo: two faux routes swapped by a single brand-colour
 * panel that sweeps across on a slanted edge. Cover (power3.in) → hold with a
 * staggered square loader → reveal (power4.out), with the page content swapped
 * at the fully-covered midpoint so the change is never seen. The whole thing is
 * one GSAP timeline; no router, no Barba, no DOM hand-off.
 *
 * On a real site the same timeline wraps `router.push()` at the midpoint and
 * resets Lenis scroll to top while covered — see the /lab notes. Here it just
 * toggles local state so the timing can be felt in isolation.
 *
 * Auto-plays a beat after mount and loops (ping-ponging the two faux pages) so
 * the demo advertises itself; the CTA still triggers it manually at any time.
 *
 * Respects prefers-reduced-motion: no sweep, no loader, no autoplay loop — a
 * fast crossfade swap only on manual click.
 */
export function PageWipe() {
  const reduced = usePrefersReducedMotion()
  const [page, setPage] = useState(0)

  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const loaderRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef(0)
  const busy = useRef(false)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const loopRef = useRef<gsap.core.Tween | null>(null)
  const reducedRef = useRef(reduced)
  const triggerRef = useRef<() => void>(() => {})

  // Keep the reduced-motion flag readable from inside the mount-scoped engine.
  useEffect(() => {
    reducedRef.current = reduced
  }, [reduced])

  // The whole motion engine lives in one mount effect so the autoplay loop and
  // the manual trigger share a single `play()` closure — no stale state.
  useEffect(() => {
    gsap.set(panelRef.current, { xPercent: -OFF, skewX: SKEW_DEG })
    if (loaderRef.current) {
      gsap.set(loaderRef.current, { autoAlpha: 0 })
      gsap.set(loaderRef.current.children, { scale: 0, transformOrigin: 'center' })
    }

    // One transition A→B, then schedule the next so the demo advertises itself.
    const play = () => {
      if (busy.current) return
      busy.current = true
      loopRef.current?.kill() // cancel any pending auto-tick (e.g. on manual click)
      const next = (pageRef.current + 1) % PAGES.length
      pageRef.current = next

      const onDone = () => {
        busy.current = false
        // Loop only while motion is allowed; reduced-motion stays click-only.
        if (!reducedRef.current) loopRef.current = gsap.delayedCall(DWELL, play)
      }

      // Reduced motion: skip the spectacle, just swap with a quick crossfade.
      if (reducedRef.current) {
        tlRef.current = gsap
          .timeline({ onComplete: onDone })
          .to(contentRef.current, { autoAlpha: 0, duration: 0.12, ease: 'power1.out' })
          .add(() => setPage(next))
          .to(contentRef.current, { autoAlpha: 1, duration: 0.16, ease: 'power1.out' })
        return
      }

      const squares = loaderRef.current?.children ?? []
      gsap.set(panelRef.current, { xPercent: -OFF }) // always sweep in from the left

      tlRef.current = gsap
        .timeline({ onComplete: onDone })
        // 1 — cover: panel sweeps in and fully hides the page
        .to(panelRef.current, { xPercent: 0, duration: COVER, ease: 'power3.in' })
        // at the covered midpoint: swap the page + tick the loader, all unseen
        .add(() => setPage(next))
        .set(loaderRef.current, { autoAlpha: 1 })
        .to(squares, { scale: 1, duration: 0.18, ease: 'power2.out', stagger: 0.07 }, '<')
        .to({}, { duration: HOLD }) // hold fully covered
        .set(loaderRef.current, { autoAlpha: 0 })
        // 2 — reveal: panel keeps moving the same way, uncovering the new page
        .to(panelRef.current, { xPercent: OFF, duration: REVEAL, ease: 'power4.out' })
        // reset loader squares for next run (off-screen, invisible)
        .set(squares, { scale: 0 })
    }

    triggerRef.current = play

    // Kick off the autoplay loop after a brief settle (unless reduced motion).
    if (!reducedRef.current) loopRef.current = gsap.delayedCall(INTRO_DELAY, play)

    return () => {
      loopRef.current?.kill()
      tlRef.current?.kill()
    }
  }, [])

  const current = PAGES[page]

  return (
    <div ref={rootRef} className="relative h-dvh w-full overflow-hidden">
      {/* ── the faux page (what's being transitioned) ───────────────────── */}
      <div
        ref={contentRef}
        className={
          current.dark
            ? 'flex h-full w-full flex-col bg-foreground text-background'
            : 'flex h-full w-full flex-col bg-background text-foreground'
        }
      >
        {/* faux top bar with a small brand-colour square (uses --primary) */}
        <header className="flex items-center justify-between px-6 py-5 md:px-10">
          <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em]">
            <span className="size-2.5 bg-primary" aria-hidden />
            lab
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] opacity-50">
            {current.kicker}
          </span>
        </header>

        {/* hero */}
        <div className="flex flex-1 flex-col justify-center px-6 md:px-10">
          <p className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] opacity-60">
            <span className="size-1.5 bg-primary" aria-hidden />
            {current.dark ? 'Page one' : 'Page two'}
          </p>
          <h1
            className="max-w-[18ch] text-balance font-sans font-semibold tracking-[-0.02em]"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', lineHeight: 1.02 }}
          >
            {current.headline}
          </h1>
          <p className="mt-6 max-w-[42ch] text-pretty text-base opacity-70 md:text-lg">
            {current.sub}
          </p>

          <div className="mt-10">
            <button
              type="button"
              onClick={() => triggerRef.current()}
              className={
                current.dark
                  ? 'inline-flex items-center gap-2 bg-primary px-6 py-3 font-mono text-[12px] uppercase tracking-[0.15em] text-primary-foreground transition-transform duration-150 active:scale-[0.96]'
                  : 'inline-flex items-center gap-2 bg-foreground px-6 py-3 font-mono text-[12px] uppercase tracking-[0.15em] text-background transition-transform duration-150 active:scale-[0.96]'
              }
            >
              {current.cta}
              <span aria-hidden>→</span>
            </button>
          </div>
        </div>

        <footer className="px-6 py-5 font-mono text-[10px] uppercase tracking-[0.2em] opacity-40 md:px-10">
          auto-playing — or click to trigger
        </footer>
      </div>

      {/* ── the transition overlay (panel + loader) ─────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
        {/* the single sweeping panel — slanted via skewX, oversized so the slant
            never leaves a gap during the fully-covered window */}
        <div
          ref={panelRef}
          className="absolute left-[-35vw] top-[-1vh] h-[102vh] w-[170vw] bg-primary will-change-transform"
        />
        {/* loader — small brand squares, fixed dead-centre (not on the moving panel) */}
        <div ref={loaderRef} className="absolute inset-0 grid place-items-center">
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="size-2 bg-primary-foreground" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
