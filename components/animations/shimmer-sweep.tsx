'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  buildShimmerSweepVars,
  SHIMMER_SWEEP_EASE_ID,
  SHIMMER_SWEEP_EASE_PATH,
  SHIMMER_SWEEP_EXIT_EASE_ID,
  SHIMMER_SWEEP_EXIT_EASE_PATH,
} from '@/lib/motion/shimmer-sweep'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase, ScrollTrigger)
  // cubic-bezier(0.22, 1, 0.36, 1) — registered once, reused by every instance.
  CustomEase.create(SHIMMER_SWEEP_EASE_ID, SHIMMER_SWEEP_EASE_PATH)
  // cubic-bezier(0.7, 0, 0.84, 0) — exit curve for swap transitions.
  CustomEase.create(SHIMMER_SWEEP_EXIT_EASE_ID, SHIMMER_SWEEP_EXIT_EASE_PATH)
}

interface ShimmerSweepProps {
  text?: string
  /**
   * - `load`  : reveal once on mount.
   * - `scroll`: reveal when it scrolls into view (default).
   * - `hover` : re-reveal on each pointer-enter.
   */
  trigger?: 'load' | 'scroll' | 'hover'
  /** Tween duration for the entrance (seconds). */
  duration?: number
  /** Per-unit delay step (seconds) — 0 for this whole-element effect. */
  stagger?: number
  className?: string
  as?: ElementType
}

/**
 * ShimmerSweep — a whole-headline reveal: the title glides in from a small left
 * offset as a soft blur dissolves, and a subtle highlight sweeps left→center
 * across the glyphs. A premium hero-copy micro-transition. GSAP + CustomEase
 * (element-scoped).
 *
 * Target is `whole`: the host element is animated directly (no per-character or
 * per-word splitting). The sweep is a background-clip:text gradient whose
 * position GSAP tweens from off-left to centred, so the highlight travels across
 * the text exactly once. Renders the full text server-side (no layout shift,
 * no-JS / screen-reader safe — the imperative styles are torn down on cleanup).
 * Respects prefers-reduced-motion: full text stays visible, no tween, no sweep.
 *
 * Distinct from SoftBlur (per-character vertical drift): ShimmerSweep is one
 * horizontal glide with a travelling highlight, not a glyph-by-glyph cascade.
 *
 * Clean-room reference: pixel-point/animate-text `shimmer-sweep` — behavior only.
 * One-shot ENTER phase via standard GSAP (the catalog hold→exit→swap loop is
 * demo-only; exit vars live in lib/motion for swap transitions).
 * Do NOT also bind Framer Motion to this element's transform/opacity/filter.
 */
export function ShimmerSweep({
  text = 'Shiny details.',
  trigger = 'scroll',
  duration = 0.85,
  stagger = 0,
  className,
  as: Tag = 'span',
}: ShimmerSweepProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    const { from, to } = buildShimmerSweepVars({ duration, stagger })

    // The highlight: a gradient clipped to the text. We keep the original ink
    // color via the un-clipped element, then paint a brighter band that the
    // tween slides from off-left (200%) to centred (50%). Restored on cleanup.
    const prevBg = el.style.backgroundImage
    const prevClip = el.style.backgroundClip
    const prevSize = el.style.backgroundSize
    el.style.backgroundImage =
      'linear-gradient(110deg, currentColor 38%, rgba(255,255,255,0.85) 50%, currentColor 62%)'
    el.style.backgroundSize = '220% 100%'
    ;(el.style as CSSStyleDeclaration & { webkitBackgroundClip?: string }).webkitBackgroundClip =
      'text'
    el.style.backgroundClip = 'text'
    el.style.willChange = 'transform, opacity, filter, background-position'

    const ctx = gsap.context(() => {
      const reveal = (extra: Record<string, unknown> = {}) => {
        // Reveal: opacity / x-glide / blur-dissolve on the host element.
        gsap.set(el, { ...from, backgroundPosition: '200% 0' })
        gsap.to(el, { ...to, ...extra })
        // Sweep: the highlight band travels left→center, finishing as the
        // headline settles. Same ease, no stagger (whole-element target).
        gsap.to(el, {
          backgroundPosition: '50% 0',
          duration: to.duration,
          ease: to.ease,
          ...extra,
        })
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
      // Restore the host's original paint (gsap.context reverts tweened props,
      // but the clip/gradient styles we set imperatively are ours to undo).
      el.style.backgroundImage = prevBg
      el.style.backgroundClip = prevClip
      el.style.backgroundSize = prevSize
      ;(el.style as CSSStyleDeclaration & { webkitBackgroundClip?: string }).webkitBackgroundClip =
        ''
      el.style.willChange = ''
      el.textContent = text // restore plain text on cleanup
    }
  }, [text, trigger, duration, stagger, prefersReduced])

  return (
    <Tag ref={ref} className={className}>
      {text}
    </Tag>
  )
}
