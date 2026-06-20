'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  splitLines,
  buildLineByLineSlideVars,
  LINE_SLIDE_ENTER_EASE_ID,
  LINE_SLIDE_ENTER_EASE_PATH,
  LINE_SLIDE_EXIT_EASE_ID,
  LINE_SLIDE_EXIT_EASE_PATH,
} from '@/lib/motion/line-by-line-slide'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase, ScrollTrigger)
  // cubic-bezier(0.22, 1, 0.36, 1) — registered once, reused by every instance.
  CustomEase.create(LINE_SLIDE_ENTER_EASE_ID, LINE_SLIDE_ENTER_EASE_PATH)
  // cubic-bezier(0.64, 0, 0.78, 0) — exit ease (registered for completeness).
  CustomEase.create(LINE_SLIDE_EXIT_EASE_ID, LINE_SLIDE_EXIT_EASE_PATH)
}

interface LineByLineSlideProps {
  text: string
  /**
   * - `load`  : reveal once on mount.
   * - `scroll`: reveal when it scrolls into view (default).
   * - `hover` : re-reveal on each pointer-enter.
   */
  trigger?: 'load' | 'scroll' | 'hover'
  /** Tween duration per line (seconds). */
  duration?: number
  /** Per-line delay step (seconds). */
  stagger?: number
  className?: string
  as?: ElementType
}

/**
 * LineByLineSlide — each line slides in from the left as it fades up, one line
 * after another. Apple's section-subhead reveal that "breathes" line by line.
 * GSAP + CustomEase (element-scoped).
 *
 * Splits the text on "\n" into per-line block spans on the client and tweens
 * each from { opacity 0, x -48 } to its settled state on the enter ease.
 * Renders the full text server-side (no layout shift, no-JS / screen-reader
 * safe — the spans exist only during the animation and are torn down on
 * cleanup). Respects prefers-reduced-motion: full text stays visible, no tween.
 *
 * Distinct from SoftBlur (per-character, vertical drift + blur): LineByLineSlide
 * moves whole lines horizontally with no blur.
 *
 * Clean-room reference: pixel-point/animate-text `line-by-line-slide` — behavior
 * only. One-shot ENTER phase via standard GSAP (the catalog enter→hold→exit→swap
 * loop is demo-only). Do NOT also bind Framer Motion to this element's
 * transform/opacity.
 */
export function LineByLineSlide({
  text = 'Think different.\nDo more.',
  trigger = 'scroll',
  duration = 0.9,
  stagger = 0.12,
  className,
  as: Tag = 'span',
}: LineByLineSlideProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    const { from, to } = buildLineByLineSlideVars({ duration, stagger })

    // Build per-line block spans (each line slides as a unit).
    el.textContent = ''
    const spans = splitLines(text).map((line) => {
      const s = document.createElement('span')
      s.textContent = line
      s.style.display = 'block'
      s.style.willChange = 'transform, opacity'
      el.appendChild(s)
      return s
    })

    const ctx = gsap.context(() => {
      const reveal = (extra: Record<string, unknown> = {}) => {
        gsap.set(spans, from)
        gsap.to(spans, { ...to, ...extra })
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
