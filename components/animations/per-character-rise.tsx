'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  splitChars,
  buildPerCharacterRiseVars,
  PER_CHARACTER_RISE_ENTER_EASE_ID,
  PER_CHARACTER_RISE_ENTER_EASE_PATH,
  PER_CHARACTER_RISE_EXIT_EASE_ID,
  PER_CHARACTER_RISE_EXIT_EASE_PATH,
} from '@/lib/motion/per-character-rise'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase, ScrollTrigger)
  // cubic-bezier(0.2, 0.8, 0.2, 1) — registered once, reused by every instance.
  CustomEase.create(PER_CHARACTER_RISE_ENTER_EASE_ID, PER_CHARACTER_RISE_ENTER_EASE_PATH)
  // cubic-bezier(0.7, 0, 0.84, 0) — exit ease, available for swap consumers.
  CustomEase.create(PER_CHARACTER_RISE_EXIT_EASE_ID, PER_CHARACTER_RISE_EXIT_EASE_PATH)
}

interface PerCharacterRiseProps {
  text: string
  /**
   * - `load`  : reveal once on mount.
   * - `scroll`: reveal when it scrolls into view (default).
   * - `hover` : re-reveal on each pointer-enter.
   */
  trigger?: 'load' | 'scroll' | 'hover'
  /** Tween duration per character (seconds). */
  duration?: number
  /** Per-character delay step (seconds). */
  stagger?: number
  className?: string
  as?: ElementType
}

/**
 * PerCharacterRise — letters slide up from below into place, NO blur. Crisp,
 * deliberate, kinetic. Apple's tvOS / Fitness+ title reveal. GSAP + CustomEase
 * (element-scoped).
 *
 * Splits the text into per-character spans on the client and tweens each from
 * { opacity 0, y 32 } to its settled state on a quick rise ease. Renders the
 * full text server-side (no layout shift, no-JS / screen-reader safe — the
 * spans exist only during the animation and are torn down on cleanup). Respects
 * prefers-reduced-motion: full text stays visible, no tween.
 *
 * Distinct from SoftBlur (opacity + drift + blur dissolve): PerCharacterRise
 * keeps every glyph sharp — pure opacity + a longer vertical travel.
 *
 * Clean-room reference: pixel-point/animate-text `per-character-rise` — behavior only.
 * One-shot ENTER phase via standard GSAP (the catalog loop + crossfade swap are
 * demo-only). Do NOT also bind Framer Motion to this element's transform/opacity.
 */
export function PerCharacterRise({
  text = 'One more thing.',
  trigger = 'scroll',
  duration = 0.7,
  stagger = 0.024,
  className,
  as: Tag = 'span',
}: PerCharacterRiseProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    const { from, to } = buildPerCharacterRiseVars({ duration, stagger })

    // Build per-character spans (preserve spaces with white-space: pre).
    el.textContent = ''
    const spans = splitChars(text).map((ch) => {
      const s = document.createElement('span')
      s.textContent = ch
      s.style.display = 'inline-block'
      s.style.whiteSpace = 'pre'
      el.appendChild(s)
      return s
    })

    const ctx = gsap.context(() => {
      const reveal = (extra: Record<string, unknown> = {}) => {
        gsap.set(spans, from)
        // stagger object keeps the left-to-right staircase rhythm.
        gsap.to(spans, { ...to, stagger: { each: stagger, from: 'start' }, ...extra })
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
