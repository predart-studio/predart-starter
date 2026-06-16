'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'
import {
  DEFAULT_RECTANGLE_REVEAL,
  splitIntoLines,
  buildBarVars,
  buildTextVars,
  barStartTime,
  textStartTime,
} from '@/lib/motion/rectangle-text-reveal'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface RectangleTextRevealProps {
  /**
   * The headline. Use "\n" to split it into separate reveal lines; each line
   * gets its own rectangle bar + staggered reveal.
   */
  text: string
  /**
   * - `scroll`: reveal once when scrolled into view (default).
   * - `load`  : reveal once on mount.
   */
  trigger?: 'scroll' | 'load'
  /** Text slide-in distance on the X axis (px). */
  distance?: number
  /** Stagger between lines (s). */
  stagger?: number
  /** Tailwind classes for the rectangle bar (its color). Monochrome by default. */
  barClassName?: string
  className?: string
  /** Tag for each rendered line (default `span`). */
  as?: ElementType
}

/**
 * RectangleTextReveal — GSAP ScrollTrigger timeline wrapper (element-scoped).
 *
 * Splits a headline into lines; each line sits in an overflow-hidden wrapper with
 * an absolutely positioned rectangle "bar" overlay. On reveal the bar collapses
 * (scaleX 1 -> 0 from its left edge, sweeping across) while the text slides in
 * (x: distance -> 0) and fades up, with a per-line stagger — the confident,
 * editorial wipe that suits the monochrome aesthetic. Renders the final settled
 * state server-side (text fully visible, bars collapsed = no-JS / SSR safe); the
 * animation layers on the client. Respects prefers-reduced-motion (no tween, no
 * ScrollTrigger, text stays put). Do NOT also bind Framer Motion to the line's
 * transform/opacity.
 *
 * Clean-room reference: annnimate "RectangleTextReveal" — behavior only.
 * Implementation is standard GSAP + ScrollTrigger (see gsap-scrolltrigger skill).
 */
export function RectangleTextReveal({
  text,
  trigger = 'scroll',
  distance = DEFAULT_RECTANGLE_REVEAL.distance,
  stagger = DEFAULT_RECTANGLE_REVEAL.stagger,
  barClassName,
  className,
  as: Tag = 'span',
}: RectangleTextRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  const lines = splitIntoLines(text)

  useEffect(() => {
    if (prefersReduced) return
    const root = rootRef.current
    if (!root) return

    const config = { distance, stagger }

    const ctx = gsap.context(() => {
      const lineEls = gsap.utils.toArray<HTMLElement>('[data-rtr-line]')
      const barEls = gsap.utils.toArray<HTMLElement>('[data-rtr-bar]')
      if (lineEls.length === 0) return

      const barVars = buildBarVars(config)
      const textVars = buildTextVars(config)

      // Pre-set the start state so there is no flash before the timeline binds.
      gsap.set(barEls, { scaleX: 1, transformOrigin: 'left center' })
      gsap.set(lineEls, { x: distance, opacity: 0 })

      const tl = gsap.timeline({
        paused: true,
        defaults: { overwrite: 'auto' },
      })

      lineEls.forEach((lineEl, i) => {
        const bar = barEls[i]
        if (bar) tl.to(bar, { ...barVars, scaleX: 0 }, barStartTime(i, config))
        tl.to(lineEl, { ...textVars, x: 0, opacity: 1 }, textStartTime(i, config))
      })

      if (trigger === 'load') {
        tl.play()
        return
      }

      ScrollTrigger.create({
        trigger: root,
        start: 'top 80%',
        once: true,
        onEnter: () => tl.play(),
      })
    }, root)

    return () => ctx.revert()
  }, [text, trigger, distance, stagger, prefersReduced])

  return (
    <div ref={rootRef} className={cn('flex flex-col', className)}>
      {lines.map((line, i) => (
        <span
          key={i}
          className="relative inline-block w-fit overflow-hidden align-bottom"
        >
          <Tag data-rtr-line className="relative z-0 block">
            {line}
          </Tag>
          <span
            data-rtr-bar
            aria-hidden="true"
            className={cn(
              // Settled/no-JS state: collapsed (scaleX 0) from the left, so the
              // text is fully readable without JS. GSAP expands it to scaleX 1
              // at the start of the timeline, then collapses it again on reveal.
              'pointer-events-none absolute inset-0 z-[1] origin-left scale-x-0 rounded-[4px]',
              barClassName ?? 'bg-foreground',
            )}
          />
        </span>
      ))}
    </div>
  )
}
