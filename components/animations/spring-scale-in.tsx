'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  splitWords,
  buildSpringScaleInVars,
  SPRING_SCALE_IN_EASE_ID,
  SPRING_SCALE_IN_EASE_PATH,
  SPRING_SCALE_IN_EXIT_EASE_ID,
  SPRING_SCALE_IN_EXIT_EASE_PATH,
} from '@/lib/motion/spring-scale-in'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase, ScrollTrigger)
  // cubic-bezier(0.34, 1.56, 0.64, 1) — the y2 = 1.56 overshoot is the spring.
  CustomEase.create(SPRING_SCALE_IN_EASE_ID, SPRING_SCALE_IN_EASE_PATH)
  // cubic-bezier(0.7, 0, 0.84, 0) — registered for swap callers, unused here.
  CustomEase.create(SPRING_SCALE_IN_EXIT_EASE_ID, SPRING_SCALE_IN_EXIT_EASE_PATH)
}

interface SpringScaleInProps {
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
 * SpringScaleIn — per-word pop-in with a soft overshoot scale that settles like
 * a physical spring (iOS icon bounce, macOS Dock, Vision Pro UI pops).
 * GSAP + CustomEase (element-scoped).
 *
 * Splits the text into per-word spans on the client — words AND whitespace get
 * spans, but only the word spans are tweened from { opacity 0, scale 0.7 } to
 * their settled state on the spring ease; whitespace spans stay static so word
 * spacing never collapses. Renders the full text server-side (no layout shift,
 * no-JS / screen-reader safe — the spans exist only during the animation and are
 * torn down on cleanup). Respects prefers-reduced-motion: full text stays
 * visible, no tween.
 *
 * The overshoot is entirely in the ease (y2 = 1.56), so scale animates straight
 * to 1 and the curve does the bounce — no keyframe needed.
 *
 * Clean-room reference: pixel-point/animate-text `spring-scale-in` — behavior
 * only. One-shot ENTER phase via standard GSAP (the catalog hold/exit/swap loop
 * is demo-only). Do NOT also bind Framer Motion to this element's transform/
 * opacity.
 */
export function SpringScaleIn({
  text,
  trigger = 'scroll',
  duration = 0.36,
  stagger = 0.095,
  className,
  as: Tag = 'span',
}: SpringScaleInProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    const { from, to } = buildSpringScaleInVars({ duration, stagger })

    // Build per-word spans (words + whitespace); collect only the word spans to
    // animate so spacing units stay put.
    el.textContent = ''
    const words: HTMLSpanElement[] = []
    splitWords(text).forEach((unit) => {
      const s = document.createElement('span')
      s.textContent = unit.text
      if (unit.isWord) {
        s.style.display = 'inline-block'
        s.style.willChange = 'transform, opacity'
        words.push(s)
      } else {
        s.style.whiteSpace = 'pre'
      }
      el.appendChild(s)
    })

    const ctx = gsap.context(() => {
      const reveal = (extra: Record<string, unknown> = {}) => {
        gsap.set(words, from)
        gsap.to(words, { ...to, ...extra })
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
