'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  buildRevealDelays,
  DEFAULT_CHAR_APPEAR,
  type CharAppearOrder,
} from '@/lib/motion/character-appear'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface CharacterAppearProps {
  text: string
  /** 'sequential' reveals left-to-right; 'random' scatters the order. */
  order?: CharAppearOrder
  /** Seconds between consecutive character reveals. */
  step?: number
  /** Fade duration per character. */
  charDuration?: number
  seed?: number
  className?: string
  as?: ElementType
}

/**
 * CharacterAppear — GSAP scroll-triggered character fade-in (element-scoped).
 *
 * Splits the text into per-character spans and fades each from opacity 0 → 1 as
 * the element scrolls into view — sequentially or in a (seeded, deterministic)
 * random order. Pure opacity, no movement. Renders the full text server-side
 * (no layout shift, no-JS safe); spans + the fade layer on the client. Respects
 * prefers-reduced-motion: full text stays visible, no tween.
 *
 * Do NOT also bind Framer Motion to this element's opacity.
 *
 * Clean-room reference: annnimate "Character Appear" — behavior only.
 * Implementation is standard GSAP + ScrollTrigger (see gsap-scrolltrigger).
 */
export function CharacterAppear({
  text,
  order = 'random', // reference demo defaults to data-anm-random="true"
  step = DEFAULT_CHAR_APPEAR.step,
  charDuration = 0.5,
  seed = DEFAULT_CHAR_APPEAR.seed,
  className,
  as: Tag = 'span',
}: CharacterAppearProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    const chars = Array.from(text)
    const delays = buildRevealDelays({ count: chars.length, order, step, seed })

    // Build per-character spans (preserve spaces as non-breaking).
    el.textContent = ''
    const spans = chars.map((ch) => {
      const s = document.createElement('span')
      s.textContent = ch === ' ' ? ' ' : ch
      s.style.display = 'inline-block'
      s.style.whiteSpace = 'pre'
      el.appendChild(s)
      return s
    })

    const ctx = gsap.context(() => {
      gsap.set(spans, { opacity: 0 })
      gsap.to(spans, {
        opacity: 1,
        duration: charDuration,
        ease: 'none',
        // Per-character timing via a stagger function (deterministic order from
        // lib/motion). NOTE: GSAP does not evaluate `delay` per target — using a
        // function for `delay` yields NaN and stalls the tween; `stagger` is the
        // correct per-target mechanism.
        stagger: (i: number) => delays[i],
        scrollTrigger: { trigger: el, start: 'top 75%', once: true },
      })
    }, el)

    return () => {
      ctx.revert()
      el.textContent = text // restore plain text on cleanup
    }
  }, [text, order, step, charDuration, seed, prefersReduced])

  return (
    <Tag ref={ref} className={className}>
      {text}
    </Tag>
  )
}
