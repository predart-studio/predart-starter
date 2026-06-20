'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  splitWhole,
  buildFadeThroughVars,
  FADE_THROUGH_ENTER_EASE_ID,
  FADE_THROUGH_ENTER_EASE_PATH,
  FADE_THROUGH_EXIT_EASE_ID,
  FADE_THROUGH_EXIT_EASE_PATH,
  FADE_THROUGH_MICRO_DELAY,
} from '@/lib/motion/fade-through'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase, ScrollTrigger)
  // cubic-bezier(0.2, 0, 0, 1) and cubic-bezier(0.4, 0, 1, 1) — registered once,
  // reused by every instance.
  CustomEase.create(FADE_THROUGH_ENTER_EASE_ID, FADE_THROUGH_ENTER_EASE_PATH)
  CustomEase.create(FADE_THROUGH_EXIT_EASE_ID, FADE_THROUGH_EXIT_EASE_PATH)
}

interface FadeThroughProps {
  /** Phrases to cycle through (2+). The first renders server-side. */
  phrases: string[]
  /** Seconds the current phrase holds, fully visible, before it exits. */
  interval?: number
  className?: string
  as?: ElementType
}

/**
 * FadeThrough — a Material-style content swap. The host element holds exactly
 * ONE phrase at a time: the visible phrase fades + lifts out, its textContent is
 * swapped to the next phrase, then that phrase fades + settles in. GSAP +
 * CustomEase (element-scoped).
 *
 * Because the spec target is `whole`, nothing is split — the host element is the
 * single animated unit. A guarded GSAP timeline drives a continuous cycle:
 * enter → hold(interval) → exit → micro-delay (text swapped here) → enter → ...,
 * wrapping back to phrases[0]. Keeping a single text layer (swap textContent
 * between exit and enter) avoids stacked-glyph artifacts.
 *
 * Renders phrases[0] server-side (no layout shift, no-JS / screen-reader safe).
 * Respects prefers-reduced-motion: phrases[0] stays visible, no tween, no loop.
 *
 * Clean-room reference: pixel-point/animate-text `fade-through` — behavior only.
 * Looping exit→swap→enter cycle via a GSAP timeline (this effect is inherently a
 * transition between strings, so the swap IS the effect).
 * Do NOT also bind Framer Motion to this element's transform/opacity/filter.
 */
export function FadeThrough({
  phrases,
  interval = 1.6,
  className,
  as: Tag = 'span',
}: FadeThroughProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return
    if (phrases.length < 2) return // nothing to cycle between

    const unit = splitWhole(el)
    const { enter, exit } = buildFadeThroughVars()

    const ctx = gsap.context(() => {
      // Build the next cycle from the phrase currently shown at index `i`.
      // Each cycle: hold → exit current → swap text → micro-delay → enter next,
      // then schedules itself again. The timeline + delayedCall are owned by the
      // context, so ctx.revert() tears the whole loop down on cleanup.
      const cycle = (i: number) => {
        const next = (i + 1) % phrases.length
        const tl = gsap.timeline({
          delay: interval, // hold the current phrase fully visible
          onComplete: () => cycle(next),
        })
        tl.set(unit, exit.from)
          .to(unit, exit.to)
          // Swap to the next phrase off-screen, then pause the micro-delay.
          .add(() => {
            unit.textContent = phrases[next]
          })
          .set(unit, enter.from)
          .to(unit, enter.to, `+=${FADE_THROUGH_MICRO_DELAY}`)
      }

      // phrases[0] is already on screen from SSR — enter it once, then loop.
      gsap.set(unit, enter.from)
      gsap.to(unit, {
        ...enter.to,
        onComplete: () => cycle(0),
      })
    }, el)

    return () => {
      ctx.revert()
      el.textContent = phrases[0] // restore the first phrase as plain text
    }
  }, [phrases, interval, prefersReduced])

  return (
    <Tag ref={ref} className={className}>
      {phrases[0]}
    </Tag>
  )
}
