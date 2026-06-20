'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  buildSharedAxisZVars,
  buildSharedAxisZExitVars,
  SHARED_AXIS_Z_MICRO_DELAY,
  SHARED_AXIS_Z_ENTER_EASE_ID,
  SHARED_AXIS_Z_ENTER_EASE_PATH,
  SHARED_AXIS_Z_EXIT_EASE_ID,
  SHARED_AXIS_Z_EXIT_EASE_PATH,
} from '@/lib/motion/shared-axis-z'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase, ScrollTrigger)
  // cubic-bezier(0.2, 0, 0, 1) — enter ease, registered once, reused by every instance.
  CustomEase.create(SHARED_AXIS_Z_ENTER_EASE_ID, SHARED_AXIS_Z_ENTER_EASE_PATH)
  // cubic-bezier(0.4, 0, 1, 1) — exit ease for the swap phase.
  CustomEase.create(SHARED_AXIS_Z_EXIT_EASE_ID, SHARED_AXIS_Z_EXIT_EASE_PATH)
}

interface SharedAxisZProps {
  /** The phrases to cycle through (2+ required). */
  phrases: string[]
  /** Seconds each phrase holds (settled) before exiting. */
  interval?: number
  className?: string
  as?: ElementType
}

/**
 * SharedAxisZ — a Material shared-axis (Z) transition adapted for typography: an
 * auto-cycling swap where each phrase zooms forward into focus, holds, then zooms
 * toward the viewer and fades out as the next phrase takes its place. Scale +
 * blur communicate depth, so the focus shifts "through" the Z axis between
 * strings. GSAP + CustomEase (element-scoped).
 *
 * Target is `whole`: there is NO split. The host element animates as one unit —
 * enter from { opacity 0, scale 0.9, blur 2px } to settled, then exit to
 * { opacity 0, scale 1.06, blur 1px }. We keep exactly ONE active text layer:
 * textContent is swapped between the exit and the next enter, so glyphs never
 * stack. Renders phrases[0] server-side (no layout shift, no-JS / screen-reader
 * safe — the from-state is applied imperatively only when JS runs and is torn
 * down on cleanup). Respects prefers-reduced-motion: phrases[0] stays visible,
 * no tween, no cycle.
 *
 * The loop runs exit → swap textContent → micro-delay → enter, scheduled through
 * a guarded gsap.delayedCall chain inside gsap.context, so every tween and timer
 * is reverted on cleanup.
 *
 * Clean-room reference: pixel-point/animate-text `shared-axis-z` — behavior only.
 * Spec base timing (the demo-only runtime down-scale is not reproduced). Do NOT
 * also bind Framer Motion to this element's transform/opacity/filter.
 */
export function SharedAxisZ({
  phrases,
  interval = 1.6,
  className,
  as: Tag = 'span',
}: SharedAxisZProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || phrases.length === 0) return
    // Reduced motion (or a single phrase): show phrases[0] statically, do nothing.
    if (prefersReduced || phrases.length < 2) {
      el.textContent = phrases[0]
      return
    }

    const { from, to } = buildSharedAxisZVars()
    const exit = buildSharedAxisZExitVars()

    // `whole` target — animate the single host element (no per-unit spans).
    // inline-block lets the scale transform apply cleanly to the inline host.
    el.style.display = 'inline-block'
    el.style.willChange = 'transform, opacity, filter'
    el.textContent = phrases[0]

    const ctx = gsap.context(() => {
      let index = 0
      let killed = false

      // ENTER the current phrase, then schedule the hold → exit → swap → enter
      // cycle. A killed-flag + the gsap.context teardown stop everything on
      // cleanup, so no orphaned tween or delayedCall survives unmount.
      const enter = () => {
        if (killed) return
        gsap.set(el, from)
        gsap.to(el, {
          ...to,
          onComplete: () => {
            if (killed) return
            gsap.delayedCall(interval, swap)
          },
        })
      }

      // EXIT the visible phrase, then swap textContent to the next one (keeping a
      // single text layer), wait the micro-delay, and ENTER the next phrase.
      const swap = () => {
        if (killed) return
        gsap.to(el, {
          ...exit.to,
          onComplete: () => {
            if (killed) return
            index = (index + 1) % phrases.length
            el.textContent = phrases[index]
            gsap.delayedCall(SHARED_AXIS_Z_MICRO_DELAY, enter)
          },
        })
      }

      enter()

      // killed short-circuits the scheduler callbacks; ctx.revert() (below) kills
      // the in-flight tweens and pending delayedCalls created in this context.
      return () => {
        killed = true
      }
    }, el)

    return () => {
      ctx.revert()
      el.textContent = phrases[0] // restore plain text on cleanup
    }
  }, [phrases, interval, prefersReduced])

  return (
    <Tag ref={ref} className={className}>
      {phrases[0]}
    </Tag>
  )
}
