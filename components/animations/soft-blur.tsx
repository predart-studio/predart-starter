'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  splitChars,
  buildSoftBlurVars,
  SOFT_BLUR_EASE_ID,
  SOFT_BLUR_EASE_PATH,
} from '@/lib/motion/soft-blur'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase, ScrollTrigger)
  // cubic-bezier(0.22, 1, 0.36, 1) — registered once, reused by every instance.
  CustomEase.create(SOFT_BLUR_EASE_ID, SOFT_BLUR_EASE_PATH)
}

interface SoftBlurProps {
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
 * SoftBlur — per-character fade-in with an upward drift and a blur dissolve.
 * Apple's signature hero-title reveal. GSAP + CustomEase (element-scoped).
 *
 * Splits the text into per-character spans on the client and tweens each from
 * { opacity 0, y 16, blur 12px } to its settled state on a soft-blur ease.
 * Renders the full text server-side (no layout shift, no-JS / screen-reader
 * safe — the spans exist only during the animation and are torn down on
 * cleanup). Respects prefers-reduced-motion: full text stays visible, no tween.
 *
 * Distinct from CharacterAppear (pure opacity, no movement): SoftBlur adds the
 * vertical drift + blur that define the effect.
 *
 * Clean-room reference: pixel-point/animate-text `soft-blur-in` — behavior only.
 * One-shot ENTER phase via standard GSAP (the catalog loop is demo-only).
 * Do NOT also bind Framer Motion to this element's transform/opacity/filter.
 */
export function SoftBlur({
  text,
  trigger = 'scroll',
  duration = 0.9,
  stagger = 0.025,
  className,
  as: Tag = 'span',
}: SoftBlurProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    const { from, to } = buildSoftBlurVars({ duration, stagger })

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
