'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  splitChars,
  buildStaggerFromCenterVars,
  STAGGER_FROM_CENTER_EASE_ID,
  STAGGER_FROM_CENTER_EASE_PATH,
} from '@/lib/motion/stagger-from-center'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase, ScrollTrigger)
  // cubic-bezier(0.22, 1, 0.36, 1) — registered once, reused by every instance.
  CustomEase.create(STAGGER_FROM_CENTER_EASE_ID, STAGGER_FROM_CENTER_EASE_PATH)
}

interface StaggerFromCenterProps {
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
 * StaggerFromCenter — per-character fade-in that radiates from the middle of the
 * word outward, so the keyword core lands first and emphasis blooms to the
 * edges. GSAP + CustomEase (element-scoped), center-out stagger ordering.
 *
 * Splits the text into per-character spans on the client and tweens each from
 * { opacity 0, y 12, blur 3px } to its settled state on a soft ease, ordered by
 * the gsap stagger object { each, from: 'center' }. Renders the full text
 * server-side (no layout shift, no-JS / screen-reader safe — the spans exist
 * only during the animation and are torn down on cleanup). Respects
 * prefers-reduced-motion: full text stays visible, no tween.
 *
 * Distinct from SoftBlur (start-ordered, heavier drift): the center-out stagger
 * is the defining trait — short words read as a symmetric bloom.
 *
 * Clean-room reference: pixel-point/animate-text `stagger-from-center` — behavior
 * only. One-shot ENTER phase via standard GSAP (the catalog crossfade-swap loop
 * is demo-only). Do NOT also bind Framer Motion to this element's
 * transform/opacity/filter.
 */
export function StaggerFromCenter({
  text,
  trigger = 'scroll',
  duration = 0.62,
  stagger = 0.022,
  className,
  as: Tag = 'span',
}: StaggerFromCenterProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    const { from, to } = buildStaggerFromCenterVars({ duration, stagger })

    // Build per-character spans (preserve spaces as non-breaking).
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
        // Wrap the scalar step in the gsap stagger object so characters resolve
        // from the center outward instead of left-to-right.
        gsap.to(spans, {
          ...to,
          stagger: { each: to.stagger, from: 'center' },
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
      el.textContent = text // restore plain text on cleanup
    }
  }, [text, trigger, duration, stagger, prefersReduced])

  return (
    <Tag ref={ref} className={className}>
      {text}
    </Tag>
  )
}
