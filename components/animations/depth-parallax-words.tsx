'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  splitWords,
  buildDepthParallaxWordsVars,
  DEPTH_PARALLAX_WORDS_ENTER_EASE_ID,
  DEPTH_PARALLAX_WORDS_ENTER_EASE_PATH,
} from '@/lib/motion/depth-parallax-words'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase, ScrollTrigger)
  // cubic-bezier(0.22, 1, 0.36, 1) — registered once, reused by every instance.
  CustomEase.create(DEPTH_PARALLAX_WORDS_ENTER_EASE_ID, DEPTH_PARALLAX_WORDS_ENTER_EASE_PATH)
}

interface DepthParallaxWordsProps {
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
 * DepthParallaxWords — words rise into place one after another while scaling up
 * from slightly small and dropping a soft blur, so each word reads as if it
 * surfaces from a shallow depth-of-field. GSAP + CustomEase (element-scoped).
 *
 * Splits the text into per-word spans on the client (whitespace runs become
 * their own static spans, so spacing is preserved verbatim) and tweens each
 * word from { opacity 0, y 18, scale 0.92, blur 3px } to its settled state on a
 * soft ease. Renders the full text server-side (no layout shift, no-JS /
 * screen-reader safe — the spans exist only during the animation and are torn
 * down on cleanup). Respects prefers-reduced-motion: full text stays visible,
 * no tween.
 *
 * Distinct from PerWordCrossfade (whole-word drift, no depth cues):
 * DepthParallaxWords layers in the scale + blur that give the words their sense
 * of depth.
 *
 * Clean-room reference: pixel-point/animate-text `depth-parallax-words` —
 * behavior only. One-shot ENTER phase via standard GSAP (the catalog crossfade
 * swap is demo-only). Do NOT also bind Framer Motion to this element's
 * transform/opacity/filter.
 */
export function DepthParallaxWords({
  text = 'Depth in every word.',
  trigger = 'scroll',
  duration = 0.7,
  stagger = 0.07,
  className,
  as: Tag = 'span',
}: DepthParallaxWordsProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    const { from, to } = buildDepthParallaxWordsVars({ duration, stagger })

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
