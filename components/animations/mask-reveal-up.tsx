'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  splitLines,
  buildMaskRevealUpVars,
  MASK_REVEAL_UP_ENTER_EASE_ID,
  MASK_REVEAL_UP_ENTER_EASE_PATH,
} from '@/lib/motion/mask-reveal-up'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase, ScrollTrigger)
  // cubic-bezier(0.22, 1, 0.36, 1) — registered once, reused by every instance.
  CustomEase.create(MASK_REVEAL_UP_ENTER_EASE_ID, MASK_REVEAL_UP_ENTER_EASE_PATH)
}

interface MaskRevealUpProps {
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
 * MaskRevealUp — per-line rise-in with a soft masked blur dissolve. Apple's
 * section-transition headline reveal: multiline copy lifts in line by line,
 * top-down, so the reading order stays intact. GSAP + CustomEase (element-scoped).
 *
 * Splits the text on "\n" into per-line block spans on the client and tweens
 * each from { opacity 0, y 30, blur 6px } to its settled state on the
 * mask-reveal-up ease. Renders the full text server-side (no layout shift,
 * no-JS / screen-reader safe — the spans exist only during the animation and are
 * torn down on cleanup). Respects prefers-reduced-motion: full text stays
 * visible, no tween.
 *
 * Distinct from SoftBlur (per-character drift): MaskRevealUp animates whole
 * lines, best for two- and three-line headings.
 *
 * Clean-room reference: pixel-point/animate-text `mask-reveal-up` — behavior only.
 * One-shot ENTER phase via standard GSAP (the catalog swap loop is demo-only).
 * Do NOT also bind Framer Motion to this element's transform/opacity/filter.
 */
export function MaskRevealUp({
  text,
  trigger = 'scroll',
  duration = 0.76,
  stagger = 0.09,
  className,
  as: Tag = 'span',
}: MaskRevealUpProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    const { from, to } = buildMaskRevealUpVars({ duration, stagger })

    // Build per-line block spans (each line on its own row).
    el.textContent = ''
    const spans = splitLines(text).map((line) => {
      const s = document.createElement('span')
      s.textContent = line
      s.style.display = 'block'
      s.style.whiteSpace = 'pre'
      el.appendChild(s)
      return s
    })

    const ctx = gsap.context(() => {
      const reveal = (extra: Record<string, unknown> = {}) => {
        gsap.set(spans, from)
        gsap.to(spans, { ...to, stagger: { each: to.stagger, from: 'start' }, ...extra })
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
