'use client'

import {
  useRef,
  useEffect,
  Children,
  isValidElement,
  type ReactNode,
} from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { DEFAULT_BACKGROUND_STOPS } from '@/lib/motion/background-color'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface BackgroundColorProps {
  /** Sections to wrap — one color stop per child, in order. */
  children: ReactNode
  /**
   * Ordered background colors, one per child section. As each section's top
   * crosses the trigger line, the wrapper crossfades to that section's color.
   * Defaults to the studied dark → light palette.
   */
  stops?: readonly string[]
  /** ScrollTrigger start for each zone (when does the wrapper adopt its color). */
  start?: string
  /** Scrub smoothing for the crossfade (seconds of catch-up lag). */
  scrub?: number | boolean
  className?: string
}

/**
 * BackgroundColor — GSAP ScrollTrigger wrapper (page-scoped, scrubbed).
 *
 * Wraps a vertical stack of tall sections and drives the WRAPPER's
 * backgroundColor as each section scrolls past its trigger line. Each child maps
 * to one color stop (in order); the wrapper crossfades — smooth rgb interpolation,
 * ease "none", scrubbed — from the previous section's color to the entering one.
 * The first stop is rendered server-side as the wrapper's starting color (no
 * flash, no-JS safe); the scroll-linked transitions layer on the client.
 *
 * Respects prefers-reduced-motion: no ScrollTriggers and no tweens — the wrapper
 * simply stays on the first stop. Do NOT also bind Framer Motion to this
 * element's backgroundColor.
 *
 * Because it wraps multiple full-height sections, mount it full-width (its own
 * section), not inside the lab card grid.
 *
 * Clean-room reference: annnimate "BackgroundColor" — behavior only.
 * Implementation is standard GSAP + ScrollTrigger scrub (see gsap-scrolltrigger).
 */
export function BackgroundColor({
  children,
  stops = DEFAULT_BACKGROUND_STOPS,
  start = 'top center',
  scrub = 0.4,
  className,
}: BackgroundColorProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReduced = usePrefersReducedMotion()
  const first = stops[0] ?? '#0a0a0a'

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Reduced motion: paint the first stop once, attach nothing.
    if (prefersReduced) {
      gsap.set(el, { backgroundColor: first })
      return
    }

    const ctx = gsap.context(() => {
      // Establish the starting color (no inline style needed).
      gsap.set(el, { backgroundColor: first })
      const zones = gsap.utils.toArray<HTMLElement>(el.children)

      zones.forEach((zone, i) => {
        const color = stops[i] ?? first
        // First zone owns the starting color; nothing to tween into on enter.
        if (i === 0) return
        gsap.to(el, {
          backgroundColor: color,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: {
            trigger: zone,
            start,
            // crossfade window: from this zone's start line up to one viewport later
            end: `+=${Math.round(window.innerHeight * 0.4)}`,
            scrub,
          },
        })
      })
    }, el)

    return () => ctx.revert()
  }, [stops, start, scrub, prefersReduced, first])

  // Wrap children so each child becomes a discrete "zone" in document order.
  const zones = Children.toArray(children).filter(isValidElement)

  return (
    <div ref={ref} className={cn('w-full', className)}>
      {zones}
    </div>
  )
}
