'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  buildSharedAxisXVars,
  SHARED_AXIS_X_ENTER_EASE_ID,
  SHARED_AXIS_X_ENTER_EASE_PATH,
  SHARED_AXIS_X_EXIT_EASE_ID,
  SHARED_AXIS_X_EXIT_EASE_PATH,
} from '@/lib/motion/shared-axis-x'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase, ScrollTrigger)
  // cubic-bezier(0.2, 0, 0, 1) / cubic-bezier(0.4, 0, 1, 1) — registered once,
  // reused by every instance.
  CustomEase.create(SHARED_AXIS_X_ENTER_EASE_ID, SHARED_AXIS_X_ENTER_EASE_PATH)
  CustomEase.create(SHARED_AXIS_X_EXIT_EASE_ID, SHARED_AXIS_X_EXIT_EASE_PATH)
}

interface SharedAxisXProps {
  /** Sibling views to cycle through. The first renders statically for SSR / no-JS. */
  phrases: string[]
  /** Seconds the phrase holds (fully entered) before its exit plays. */
  interval?: number
  className?: string
  as?: ElementType
}

/**
 * SharedAxisX — horizontal shared-axis transition between sibling text views.
 * GSAP + CustomEase (element-scoped). Target `whole`: the single host element is
 * animated, never split.
 *
 * Continuously cycles `phrases`: the current view holds for `interval`s, plays
 * the EXIT (slides left + fades + shrinks to 0.98), then `textContent` is swapped
 * to the next phrase (wrapping) and the ENTER plays (slides in from the right +
 * fades + scales to 1). Exactly ONE text layer is ever active — we swap
 * textContent between exit and enter rather than stacking layers, so there are no
 * overlapping-glyph artifacts. The whole loop is driven by a single chained
 * timeline plus a guarded gsap.delayedCall scheduler, and the host is wrapped in
 * gsap.context so ctx.revert() tears EVERYTHING down on cleanup.
 *
 * Renders phrases[0] server-side (no layout shift, no-JS / screen-reader safe).
 * Respects prefers-reduced-motion: phrases[0] stays visible statically, no tween,
 * no cycle.
 *
 * Distinct from PerWordCrossfade (per-word fade reveal): SharedAxisX moves the
 * whole line along X with a subtle scale to read as a directional sibling swap.
 *
 * Clean-room reference: pixel-point/animate-text `shared-axis-x` — behavior only.
 * Standard GSAP timeline + delayedCall swap (no Framer Motion on x/opacity/scale).
 */
export function SharedAxisX({
  phrases,
  interval = 1.6,
  className,
  as: Tag = 'span',
}: SharedAxisXProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    if (phrases.length < 2) return
    const el = ref.current
    if (!el) return

    const { enter, exit } = buildSharedAxisXVars()

    const ctx = gsap.context(() => {
      // `killed` guards the recursive scheduler: once cleanup runs, any pending
      // delayedCall that still fires becomes a no-op instead of touching a
      // reverted element.
      let killed = false
      let index = 0

      // Play one full beat: hold -> exit current -> swap text -> enter next ->
      // schedule the following beat. Built as a single timeline so a context
      // revert kills it mid-flight.
      const playBeat = () => {
        if (killed) return
        const next = (index + 1) % phrases.length

        const tl = gsap.timeline({
          onComplete: () => {
            if (killed) return
            index = next
            // Re-arm the next beat on a guarded scheduler so the whole loop is
            // owned by gsap and torn down by ctx.revert().
            gsap.delayedCall(interval, playBeat)
          },
        })

        // EXIT the current view, swap textContent at the trough, ENTER the next.
        tl.to(el, exit.to)
          .add(() => {
            el.textContent = phrases[next]
          })
          .set(el, enter.from)
          .to(el, enter.to)
      }

      // Settle phrases[0] into the entered state, then start the first hold.
      gsap.set(el, enter.from)
      gsap.to(el, {
        ...enter.to,
        onComplete: () => {
          gsap.delayedCall(interval, playBeat)
        },
      })

      return () => {
        killed = true
      }
    }, el)

    return () => {
      ctx.revert()
      el.textContent = phrases[0] // restore the first sibling as plain text
    }
  }, [phrases, interval, prefersReduced])

  return (
    <Tag ref={ref} className={className} style={{ display: 'inline-block', willChange: 'transform' }}>
      {phrases[0]}
    </Tag>
  )
}
