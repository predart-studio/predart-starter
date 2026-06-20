'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  splitWords,
  buildShortSlideDownVars,
  SHORT_SLIDE_DOWN_ENTER_EASE_ID,
  SHORT_SLIDE_DOWN_ENTER_EASE_PATH,
} from '@/lib/motion/short-slide-down'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase, ScrollTrigger)
  // cubic-bezier(0.2, 0.8, 0.2, 1) — registered once, reused by every instance.
  CustomEase.create(SHORT_SLIDE_DOWN_ENTER_EASE_ID, SHORT_SLIDE_DOWN_ENTER_EASE_PATH)
}

interface ShortSlideDownProps {
  text: string
  /**
   * - `load`  : reveal once on mount.
   * - `scroll`: reveal when it scrolls into view (default).
   * - `hover` : re-reveal on each pointer-enter.
   */
  trigger?: 'load' | 'scroll' | 'hover'
  /** Tween duration per word (seconds). */
  duration?: number
  /** Per-word delay step (seconds). */
  stagger?: number
  className?: string
  as?: ElementType
}

/**
 * ShortSlideDown — per-word drop-in where each word falls from above into place
 * with a faint blur and a hair of scale, for a Keynote-style editorial heading.
 * GSAP + CustomEase (element-scoped).
 *
 * Splits the text into per-word spans on the client (whitespace runs become
 * their own static spans, so spacing is preserved verbatim) and tweens each word
 * from { opacity 0, y -24, blur 2.4px, scale 0.992 } to its settled state on the
 * signature top-down ease. Renders the full text server-side (no layout shift,
 * no-JS / screen-reader safe — the spans exist only during the animation and are
 * torn down on cleanup). Respects prefers-reduced-motion: full text stays
 * visible, no tween.
 *
 * Distinct from PerWordCrossfade (whole words, small upward drift, no blur):
 * ShortSlideDown drops words from ABOVE (negative y) with the soft blur + micro
 * scale that give the entry its weight.
 *
 * Clean-room reference: pixel-point/animate-text `short-slide-down` — behavior
 * only. One-shot ENTER phase via standard GSAP; the catalog's kinetic top-build
 * stack (each word claims its own line and pushes the others down, looping
 * phrase by phrase) is demo-only and intentionally not reproduced. Do NOT also
 * bind Framer Motion to this element's transform/opacity/filter.
 */
export function ShortSlideDown({
  text = 'Drop into place.',
  trigger = 'scroll',
  duration = 0.52,
  stagger = 0,
  className,
  as: Tag = 'span',
}: ShortSlideDownProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    const { from, to } = buildShortSlideDownVars({ duration, stagger })

    // Build per-word spans; whitespace runs render as static (non-animated)
    // spans so word spacing is preserved exactly.
    el.textContent = ''
    const words: HTMLSpanElement[] = []
    for (const unit of splitWords(text)) {
      const s = document.createElement('span')
      s.textContent = unit.text
      if (unit.isWord) {
        s.style.display = 'inline-block'
        s.style.willChange = 'transform, opacity, filter'
        words.push(s)
      } else {
        s.style.whiteSpace = 'pre'
      }
      el.appendChild(s)
    }

    const ctx = gsap.context(() => {
      const reveal = (extra: Record<string, unknown> = {}) => {
        gsap.set(words, from)
        gsap.to(words, { ...to, stagger: { each: stagger, from: 'start' }, ...extra })
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
