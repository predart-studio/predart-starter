'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  buildFocusBlurResolveVars,
  FOCUS_BLUR_RESOLVE_ENTER_EASE_ID,
  FOCUS_BLUR_RESOLVE_ENTER_EASE_PATH,
  FOCUS_BLUR_RESOLVE_EXIT_EASE_ID,
  FOCUS_BLUR_RESOLVE_EXIT_EASE_PATH,
} from '@/lib/motion/focus-blur-resolve'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase, ScrollTrigger)
  // cubic-bezier(0.22, 1, 0.36, 1) enter + cubic-bezier(0.64, 0, 0.78, 0) exit —
  // registered once, reused by every instance.
  CustomEase.create(FOCUS_BLUR_RESOLVE_ENTER_EASE_ID, FOCUS_BLUR_RESOLVE_ENTER_EASE_PATH)
  CustomEase.create(FOCUS_BLUR_RESOLVE_EXIT_EASE_ID, FOCUS_BLUR_RESOLVE_EXIT_EASE_PATH)
}

interface FocusBlurResolveProps {
  /** Phrases to cycle through (2 or more). The first renders server-side. */
  phrases: string[]
  /** Seconds a phrase stays crisp before it blurs out (default ~1.6). */
  interval?: number
  className?: string
  as?: ElementType
}

/**
 * FocusBlurResolve — a whole-headline focus pull that swaps between phrases:
 * each phrase resolves from heavy blur (with a slight scale-up + drift) into a
 * crisp settled state, holds, then blurs back out as the next phrase enters.
 * GSAP + CustomEase (element-scoped). `target: whole` — the host element is the
 * single animated unit, no per-glyph/word split.
 *
 * Auto-cycling swap: keeps exactly ONE active text layer at a time by swapping
 * `textContent` between the exit and the next enter, so glyphs never stack.
 * A single gsap.timeline drives ENTER → hold → EXIT → swap → (repeat) and is
 * set to `repeat: -1`, so the whole loop is torn down on cleanup via
 * ctx.revert(). Renders phrases[0] server-side (no layout shift, no-JS /
 * screen-reader safe). Respects prefers-reduced-motion: phrases[0] stays visible
 * and crisp, no tween.
 *
 * Distinct from SoftBlur (per-character enter only): FocusBlurResolve animates
 * the whole headline as one unit and demonstrates the paired blur-in / blur-out
 * transition between strings.
 *
 * Clean-room reference: pixel-point/animate-text `focus-blur-resolve` — behavior
 * only. Drives both the ENTER and EXIT spec phases (this effect is a transition
 * between strings). Do NOT also bind Framer Motion to this element's
 * transform/opacity/filter.
 */
export function FocusBlurResolve({
  phrases,
  interval = 1.6,
  className,
  as: Tag = 'span',
}: FocusBlurResolveProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Need at least two phrases to swap; otherwise leave the static text alone.
    if (prefersReduced || phrases.length < 2) return

    const { from, to, exit } = buildFocusBlurResolveVars()

    // Imperative host styles (same approach SoftBlur uses on its spans): the
    // whole headline is the animated unit, so it needs inline-block + a
    // will-change hint for the transform/opacity/filter tweens.
    el.style.display = 'inline-block'
    el.style.willChange = 'transform, opacity, filter'

    const ctx = gsap.context(() => {
      // One self-repeating timeline = one teardown surface. We append an
      // ENTER → hold → EXIT → swap segment per phrase; `repeat: -1` wraps back
      // to phrases[0], so the cycle is continuous and fully revertible.
      const tl = gsap.timeline({ repeat: -1 })

      // After the last phrase exits, the timeline repeats and the first
      // segment's set() swaps textContent back to phrases[0] — no manual wrap.
      for (const phrase of phrases) {
        // Set the blurred ENTER-from state, then swap textContent while it is
        // invisible (so glyphs never stack), then resolve the phrase in.
        tl.set(el, {
          ...from,
          onComplete: () => {
            el.textContent = phrase
          },
        })
        tl.to(el, { ...to })
        // Hold the crisp phrase, then blur it back out before the next swap.
        tl.to(el, { ...exit.to }, `+=${interval}`)
      }
    }, el)

    return () => {
      ctx.revert()
      // Clear the imperative styles GSAP/ctx didn't own, then restore plain text.
      el.style.removeProperty('will-change')
      el.style.removeProperty('display')
      el.textContent = phrases[0] // restore the first phrase as plain text
    }
  }, [phrases, interval, prefersReduced])

  return (
    <Tag ref={ref} className={className}>
      {phrases[0]}
    </Tag>
  )
}
