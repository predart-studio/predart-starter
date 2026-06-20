'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  splitWords,
  buildShortSlideRightVars,
  SHORT_SLIDE_RIGHT_ENTER_EASE_ID,
  SHORT_SLIDE_RIGHT_ENTER_EASE_PATH,
} from '@/lib/motion/short-slide-right'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase, ScrollTrigger)
  // cubic-bezier(0.2, 0.8, 0.2, 1) — registered once, reused by every instance.
  CustomEase.create(SHORT_SLIDE_RIGHT_ENTER_EASE_ID, SHORT_SLIDE_RIGHT_ENTER_EASE_PATH)
}

interface ShortSlideRightProps {
  text: string
  /**
   * - `load`  : reveal once on mount.
   * - `scroll`: reveal when it scrolls into view (default).
   * - `hover` : re-reveal on each pointer-enter.
   */
  trigger?: 'load' | 'scroll' | 'hover'
  /** Duration of the shared title slide (seconds). */
  duration?: number
  /** Per-word opacity delay step (seconds). */
  stagger?: number
  className?: string
  as?: ElementType
}

/**
 * ShortSlideRight — the whole phrase glides in from the left as one compact
 * horizontal move, while the words are revealed in sequence only through an
 * opacity stagger. Keynote-style restrained editorial reveal. GSAP + CustomEase
 * (element-scoped).
 *
 * The shared x-slide + blur dissolve live on the HOST element, so the phrase
 * reads as a single move; the per-word spans never translate — they only fade
 * in, staggered, to communicate word order. Title transform and word opacity
 * start in the same tick (the title does not finish before the words begin).
 * Renders the full text server-side (no layout shift, no-JS / screen-reader
 * safe — the spans exist only during the animation and are torn down on
 * cleanup). Respects prefers-reduced-motion: full text stays visible, no tween.
 *
 * Distinct from PerWordCrossfade (each word translates + fades independently):
 * here ONLY the host translates, and words carry opacity alone.
 *
 * Clean-room reference: pixel-point/animate-text `short-slide-right` — behavior
 * only. One-shot ENTER phase via standard GSAP (the catalog showcase loop —
 * hold → exit → gap → next phrase — is demo-only and not reproduced). Do NOT
 * also bind Framer Motion to this element's transform/opacity/filter.
 */
export function ShortSlideRight({
  text = 'Move with intent.',
  trigger = 'scroll',
  duration = 0.52,
  stagger = 0.092,
  className,
  as: Tag = 'span',
}: ShortSlideRightProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    const { title, word } = buildShortSlideRightVars({ duration, stagger })

    // Build per-word spans; whitespace runs render as static (non-animated)
    // spans so word spacing is preserved exactly. The host element (`el`)
    // carries the shared slide; only the word spans below carry opacity.
    el.textContent = ''
    const words: HTMLSpanElement[] = []
    for (const unit of splitWords(text)) {
      const s = document.createElement('span')
      s.textContent = unit.text
      if (unit.isWord) {
        s.style.display = 'inline-block'
        s.style.willChange = 'opacity'
        words.push(s)
      } else {
        s.style.whiteSpace = 'pre'
      }
      el.appendChild(s)
    }
    el.style.display = 'inline-block'
    el.style.willChange = 'transform, filter'

    const ctx = gsap.context(() => {
      const reveal = (extra: gsap.TimelineVars = {}) => {
        // One shared slide on the host + a staggered opacity reveal on the words,
        // both starting at time 0 so the phrase moves while words fade in.
        gsap.set(el, title.from)
        gsap.set(words, word.from)
        const tl = gsap.timeline(extra)
        tl.to(el, title.to, 0)
        tl.to(words, { ...word.to, stagger: { each: stagger, from: 'start' } }, 0)
        return tl
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
