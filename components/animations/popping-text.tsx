'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  buildPoppingFromVars,
  buildPoppingToVars,
  buildPoppingScrollTrigger,
  DEFAULT_POP_DURATION,
  DEFAULT_POP_EASE,
  DEFAULT_POP_STAGGER,
  DEFAULT_POP_SCRUB,
  DEFAULT_POP_START,
  DEFAULT_POP_END,
} from '@/lib/motion/popping-text'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText)
}

interface PoppingTextProps {
  /** One headline line, or several lines that pop in sequence down the page. */
  lines: string | string[]
  /** Per-char tween duration (proportional under scrub). */
  duration?: number
  /** Pop ease — back.out overshoot by default. */
  ease?: string
  /** Per-char stagger within a line (seconds). */
  stagger?: number
  /** Scale chars start from (animate to 1). */
  fromScale?: number
  /** ScrollTrigger scrub smoothing (seconds of lag). */
  scrub?: number
  /** Where each line's scrub window opens. */
  start?: string
  /** Where each line's scrub window closes. */
  end?: string
  className?: string
  /** Tag for each line (default h2). */
  as?: ElementType
}

/**
 * PoppingText — GSAP ScrollTrigger + SplitText wrapper (page-scoped, scrubbed).
 *
 * Splits each headline line into characters that pop from scale 0 / opacity 0
 * up to a slight overshoot and settle to 1 (a back.out feel), staggered
 * char-by-char and scrubbed to scroll position. Successive lines get their own
 * trigger windows so they pop one after another as the page scrolls. Renders
 * the final, fully-visible text server-side (no layout shift, no-JS safe); the
 * pop layers on the client. Respects prefers-reduced-motion (no split, no
 * tween — text stays fully visible). Do NOT also bind Framer Motion to these
 * chars' transform/opacity.
 *
 * Clean-room reference: annnimate "PoppingText" — behavior only.
 * Implementation is standard GSAP (see gsap-scrolltrigger / gsap-plugins skills).
 */
export function PoppingText({
  lines,
  duration = DEFAULT_POP_DURATION,
  ease = DEFAULT_POP_EASE,
  stagger = DEFAULT_POP_STAGGER,
  fromScale = 0,
  scrub = DEFAULT_POP_SCRUB,
  start = DEFAULT_POP_START,
  end = DEFAULT_POP_END,
  className,
  as: Tag = 'h2',
}: PoppingTextProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const prefersReduced = usePrefersReducedMotion()
  const lineArr = Array.isArray(lines) ? lines : [lines]

  useEffect(() => {
    if (prefersReduced) return
    const root = rootRef.current
    if (!root) return

    const ctx = gsap.context(() => {
      const lineEls = gsap.utils.toArray<HTMLElement>('[data-pop-line]')

      lineEls.forEach((lineEl) => {
        const split = new SplitText(lineEl, {
          type: 'chars',
          charsClass: 'pop_char',
        })

        gsap.set(split.chars, { display: 'inline-block' })
        gsap.fromTo(
          split.chars,
          buildPoppingFromVars({ fromScale }),
          {
            ...buildPoppingToVars({ duration, ease, stagger }),
            scrollTrigger: buildPoppingScrollTrigger(lineEl, { start, end, scrub }),
          },
        )
      })
    }, root)

    return () => ctx.revert()
  }, [
    lineArr.join(''),
    duration,
    ease,
    stagger,
    fromScale,
    scrub,
    start,
    end,
    prefersReduced,
  ])

  return (
    <div ref={rootRef} className={cn('flex flex-col', className)}>
      {lineArr.map((line, i) => (
        <Tag key={i} data-pop-line>
          {line}
        </Tag>
      ))}
    </div>
  )
}
