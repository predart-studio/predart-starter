'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  splitChars,
  buildBottomUpLettersVars,
  BOTTOM_UP_LETTERS_EASE_ID,
  BOTTOM_UP_LETTERS_EASE_PATH,
} from '@/lib/motion/bottom-up-letters'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase, ScrollTrigger)
  // cubic-bezier(0.18, 1, 0.32, 1) — registered once, reused by every instance.
  CustomEase.create(BOTTOM_UP_LETTERS_EASE_ID, BOTTOM_UP_LETTERS_EASE_PATH)
}

interface BottomUpLettersProps {
  text?: string
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
 * BottomUpLetters — per-character rise from below in a pronounced staircase,
 * one symbol at a time, with ZERO blur. Sharp keynote / lower-third typography.
 * GSAP + CustomEase (element-scoped).
 *
 * Splits the text into per-character spans on the client and tweens each from
 * { opacity 0, y 46 } to its settled state on the bottom-up ease. The large
 * 88ms stagger keeps few letters on screen at once, so the reveal clearly reads
 * bottom-up rather than typewriter-left-to-right. Renders the full text
 * server-side (no layout shift, no-JS / screen-reader safe — the spans exist
 * only during the animation and are torn down on cleanup). Respects
 * prefers-reduced-motion: full text stays visible, no tween.
 *
 * Distinct from SoftBlur (drift + blur dissolve): taller lift, larger stagger,
 * and crisp glyph edges throughout — never blurred.
 *
 * Clean-room reference: pixel-point/animate-text `bottom-up-letters` — behavior
 * only. One-shot ENTER phase via standard GSAP (the catalog swap loop —
 * hold → exit → gap — is demo-only and not reproduced here).
 * Do NOT also bind Framer Motion to this element's transform/opacity.
 */
export function BottomUpLetters({
  text = 'Shift',
  trigger = 'scroll',
  duration = 0.4,
  stagger = 0.088,
  className,
  as: Tag = 'span',
}: BottomUpLettersProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    const { from, to } = buildBottomUpLettersVars({ duration, stagger })

    // Build per-character spans (preserve spaces via white-space: pre).
    el.textContent = ''
    const spans = splitChars(text).map((ch) => {
      const s = document.createElement('span')
      s.textContent = ch
      s.style.display = 'inline-block'
      s.style.whiteSpace = 'pre'
      s.style.willChange = 'transform, opacity'
      el.appendChild(s)
      return s
    })

    const ctx = gsap.context(() => {
      const reveal = (extra: Record<string, unknown> = {}) => {
        gsap.set(spans, from)
        // Stagger object pins ordering to the start so the staircase reads
        // left-to-right while each glyph rises from below.
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
