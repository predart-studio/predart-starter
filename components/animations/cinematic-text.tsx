'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { buildCinematicVars, splitLines } from '@/lib/motion/cinematic-text'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface CinematicTextProps {
  /** The heading copy — a newline-delimited string or an array, one entry per line. */
  lines: string | readonly string[]
  /**
   * - `scroll`: lines cascade in, scrubbed to scroll position (default, the film-credits feel).
   * - `load`  : the cascade plays once on mount.
   */
  trigger?: 'scroll' | 'load'
  /** px each line is offset on the x-axis before settling. */
  xFrom?: number
  /** Optional entrance blur in px (0 = off, matching the reference). */
  blurFrom?: number
  /** Per-line tween duration (s). */
  duration?: number
  /** Seconds between consecutive lines (top -> bottom). */
  stagger?: number
  /** GSAP ease for each line's settle. */
  ease?: string
  className?: string
  /** Tag for each rendered line. */
  as?: ElementType
}

/**
 * CinematicText — GSAP ScrollTrigger wrapper (page/section-scoped).
 *
 * A multi-line heading whose lines slide in from the right and fade up in a
 * staggered top-to-bottom cascade, scrubbed to scroll — the film-credits /
 * title-card feel. Renders every line crisp and settled server-side (no layout
 * shift, no-JS safe); the cascade layers on the client. Respects
 * prefers-reduced-motion (no tween, all lines stay crisp). Do NOT also bind
 * Framer Motion to these lines' transform/opacity.
 *
 * Clean-room reference: annnimate "CinematicText" — behavior only.
 * Implementation is standard GSAP + ScrollTrigger (see gsap-scrolltrigger skill).
 */
export function CinematicText({
  lines,
  trigger = 'scroll',
  xFrom = 40,
  blurFrom = 0,
  duration = 0.6,
  stagger = 0.15,
  ease = 'power3.out',
  className,
  as: Tag = 'span',
}: CinematicTextProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReduced = usePrefersReducedMotion()
  const items = splitLines(lines)

  useEffect(() => {
    if (prefersReduced) return
    const root = ref.current
    if (!root) return

    const ctx = gsap.context(() => {
      const lineEls = gsap.utils.toArray<HTMLElement>('[data-cinematic-line]')
      if (!lineEls.length) return

      const { from, to } = buildCinematicVars({
        xFrom,
        blurFrom,
        blurTo: 0,
        duration,
        stagger,
        ease,
      })

      if (trigger === 'load') {
        gsap.fromTo(lineEls, from, to)
        return
      }

      gsap.fromTo(lineEls, from, {
        ...to,
        scrollTrigger: {
          trigger: root,
          start: 'top 80%',
          end: 'bottom 60%',
          scrub: true,
        },
      })
    }, root)

    return () => ctx.revert()
  }, [items.length, trigger, xFrom, blurFrom, duration, stagger, ease, prefersReduced])

  return (
    <div ref={ref} className={cn('flex flex-col', className)}>
      {items.map((line, i) => (
        <Tag key={i} data-cinematic-line>
          {line}
        </Tag>
      ))}
    </div>
  )
}
