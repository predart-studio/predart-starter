'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  splitChars,
  buildTypewriterStepsVars,
  TYPEWRITER_STEPS_EXIT_EASE_ID,
  TYPEWRITER_STEPS_EXIT_EASE_PATH,
} from '@/lib/motion/typewriter-steps'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase, ScrollTrigger)
  // The enter ease "steps(1)" is a built-in GSAP ease (no CustomEase needed).
  // cubic-bezier(0.7, 0, 0.84, 0) — the exit curve, registered once for swaps.
  CustomEase.create(TYPEWRITER_STEPS_EXIT_EASE_ID, TYPEWRITER_STEPS_EXIT_EASE_PATH)
}

interface TypewriterStepsProps {
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
 * TypewriterSteps — per-character stepped reveal with a minimal editorial typing
 * rhythm. Each glyph snaps in on a `steps(1)` ease, so the line prints
 * character-by-character (system-text feel) instead of dissolving. GSAP +
 * EasePack steps (element-scoped).
 *
 * Splits the text into per-character spans on the client and tweens each from
 * { opacity 0 } to { opacity 1 } with a per-character stagger. Renders the full
 * text server-side (no layout shift, no-JS / screen-reader safe — the spans
 * exist only during the animation and are torn down on cleanup). Respects
 * prefers-reduced-motion: full text stays visible, no tween.
 *
 * Distinct from Typewriter (the phrase-looping rotator): this is a one-shot
 * stepped reveal — *-steps avoids the component-name clash.
 *
 * Clean-room reference: pixel-point/animate-text `typewriter` — behavior only.
 * One-shot ENTER phase via standard GSAP (the catalog phrase-loop is demo-only).
 * Do NOT also bind Framer Motion to this element's transform/opacity.
 */
export function TypewriterSteps({
  text,
  trigger = 'scroll',
  duration = 0.24,
  stagger = 0.046,
  className,
  as: Tag = 'span',
}: TypewriterStepsProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    const { from, to } = buildTypewriterStepsVars({ duration, stagger })

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
        // Stagger left-to-right (typing order) — explicit stagger object.
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
