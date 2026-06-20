'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  buildMicroScaleFadeVars,
  MICRO_SCALE_FADE_ENTER_EASE_ID,
  MICRO_SCALE_FADE_ENTER_EASE_PATH,
  MICRO_SCALE_FADE_EXIT_EASE_ID,
  MICRO_SCALE_FADE_EXIT_EASE_PATH,
} from '@/lib/motion/micro-scale-fade'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase, ScrollTrigger)
  // cubic-bezier(0.32, 0.72, 0, 1) — registered once, reused by every instance.
  CustomEase.create(MICRO_SCALE_FADE_ENTER_EASE_ID, MICRO_SCALE_FADE_ENTER_EASE_PATH)
  // cubic-bezier(0.7, 0, 0.84, 0) — exit ease for the swap phase (unused by the
  // one-shot ENTER wrapper, registered for parity with the portable contract).
  CustomEase.create(MICRO_SCALE_FADE_EXIT_EASE_ID, MICRO_SCALE_FADE_EXIT_EASE_PATH)
}

interface MicroScaleFadeProps {
  text?: string
  /**
   * - `load`  : reveal once on mount.
   * - `scroll`: reveal when it scrolls into view (default).
   * - `hover` : re-reveal on each pointer-enter.
   */
  trigger?: 'load' | 'scroll' | 'hover'
  /** Tween duration (seconds). */
  duration?: number
  /** Delay step (seconds) — `whole` has no units to stagger; kept for the shared
   * contract and applied harmlessly to the single host element. */
  stagger?: number
  className?: string
  as?: ElementType
}

/**
 * MicroScaleFade — a calm, tiny scale pop (0.96 → 1) that fades in. Apple's
 * secondary-label / system-status polish for single words and short titles.
 * GSAP + CustomEase (element-scoped).
 *
 * Target is `whole`: there is NO split. The host element animates as one unit
 * from { opacity 0, scale 0.96 } to its settled state on a micro-scale ease.
 * Renders the full text server-side (no layout shift, no-JS / screen-reader
 * safe — the from-state is applied imperatively only when JS runs and is torn
 * down on cleanup). Respects prefers-reduced-motion: full text stays visible,
 * no tween.
 *
 * Clean-room reference: pixel-point/animate-text `micro-scale-fade` — behavior
 * only. One-shot ENTER phase via standard GSAP (the catalog swap loop is
 * demo-only). Do NOT also bind Framer Motion to this element's transform/opacity.
 */
export function MicroScaleFade({
  text = 'Welcome to motion.',
  trigger = 'scroll',
  duration = 0.6,
  stagger = 0,
  className,
  as: Tag = 'span',
}: MicroScaleFadeProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    const { from, to } = buildMicroScaleFadeVars({ duration, stagger })

    // `whole` target — animate the single host element (no per-unit spans).
    // inline-block lets the scale transform apply cleanly to the inline host.
    el.style.display = 'inline-block'
    el.style.willChange = 'transform, opacity'

    const ctx = gsap.context(() => {
      const reveal = (extra: Record<string, unknown> = {}) => {
        gsap.set(el, from)
        gsap.to(el, { ...to, ...extra })
      }

      if (trigger === 'hover') {
        const onEnter = () => reveal()
        el.addEventListener('mouseenter', onEnter)
        return () => el.removeEventListener('mouseenter', onEnter)
      }
      if (trigger === 'scroll') {
        reveal({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } })
        return
      }
      reveal() // 'load'
    }, el)

    return () => {
      ctx.revert()
      el.textContent = text // restore plain text on cleanup
    }
  }, [text, trigger, duration, stagger, prefersReduced])

  return (
    <Tag ref={ref} className={className}>
      {text}
    </Tag>
  )
}
