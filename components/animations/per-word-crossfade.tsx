'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  splitWords,
  buildPerWordCrossfadeVars,
  PER_WORD_CROSSFADE_ENTER_EASE_ID,
  PER_WORD_CROSSFADE_ENTER_EASE_PATH,
} from '@/lib/motion/per-word-crossfade'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase, ScrollTrigger)
  // cubic-bezier(0.16, 1, 0.3, 1) — registered once, reused by every instance.
  CustomEase.create(PER_WORD_CROSSFADE_ENTER_EASE_ID, PER_WORD_CROSSFADE_ENTER_EASE_PATH)
}

interface PerWordCrossfadeProps {
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
 * PerWordCrossfade — words fade into place one after another with a short
 * upward drift, for a calm keynote rhythm. GSAP + CustomEase (element-scoped).
 *
 * Splits the text into per-word spans on the client (whitespace runs become
 * their own static spans, so spacing is preserved verbatim) and tweens each
 * word from { opacity 0, y 8 } to its settled state on an editorial ease.
 * Renders the full text server-side (no layout shift, no-JS / screen-reader
 * safe — the spans exist only during the animation and are torn down on
 * cleanup). Respects prefers-reduced-motion: full text stays visible, no tween.
 *
 * Distinct from SoftBlur (per-character + blur dissolve): PerWordCrossfade
 * animates whole words with a smaller drift and no blur, keeping copy legible.
 *
 * Clean-room reference: pixel-point/animate-text `per-word-crossfade` — behavior
 * only. One-shot ENTER phase via standard GSAP (the catalog crossfade swap is
 * demo-only). Do NOT also bind Framer Motion to this element's transform/opacity.
 */
export function PerWordCrossfade({
  text = 'Beautifully, unmistakably simple.',
  trigger = 'scroll',
  duration = 0.7,
  stagger = 0.07,
  className,
  as: Tag = 'span',
}: PerWordCrossfadeProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    const { from, to } = buildPerWordCrossfadeVars({ duration, stagger })

    // Build per-word spans; whitespace runs render as static (non-animated)
    // spans so word spacing is preserved exactly.
    el.textContent = ''
    const words: HTMLSpanElement[] = []
    for (const unit of splitWords(text)) {
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
