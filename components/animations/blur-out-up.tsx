'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  splitWords,
  buildBlurOutUpVars,
  BLUR_OUT_UP_ENTER_EASE_ID,
  BLUR_OUT_UP_ENTER_EASE_PATH,
  BLUR_OUT_UP_EXIT_EASE_ID,
  BLUR_OUT_UP_EXIT_EASE_PATH,
  BLUR_OUT_UP_MICRO_DELAY,
} from '@/lib/motion/blur-out-up'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase, ScrollTrigger)
  // cubic-bezier(0.22, 1, 0.36, 1) and cubic-bezier(0.64, 0, 0.78, 0) —
  // registered once, reused by every instance.
  CustomEase.create(BLUR_OUT_UP_ENTER_EASE_ID, BLUR_OUT_UP_ENTER_EASE_PATH)
  CustomEase.create(BLUR_OUT_UP_EXIT_EASE_ID, BLUR_OUT_UP_EXIT_EASE_PATH)
}

interface BlurOutUpProps {
  /** Phrases to cycle through (2+). The first renders server-side. */
  phrases: string[]
  /** Seconds the current phrase holds, fully visible, before it exits. */
  interval?: number
  className?: string
  as?: ElementType
}

/**
 * Build per-word spans into `host` for `text`, returning only the animated word
 * spans. Whitespace runs render as static (non-animated) spans so spacing is
 * preserved verbatim. Word spans are inline-block with a will-change hint.
 */
function paintWords(host: HTMLElement, text: string): HTMLSpanElement[] {
  host.textContent = ''
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
    host.appendChild(s)
  }
  return words
}

/**
 * BlurOutUp — a per-word content swap where words arrive clean and DEPART upward
 * with increasing blur. The host holds exactly ONE phrase at a time: the visible
 * phrase's words fade + lift + blur out (staggered), the host is re-split to the
 * next phrase, then that phrase's words fade + settle in (staggered). GSAP +
 * CustomEase (element-scoped).
 *
 * A guarded GSAP timeline drives a continuous cycle: enter → hold(interval) →
 * exit → micro-delay (text re-split here) → enter → ..., wrapping back to
 * phrases[0]. Keeping a single text layer (re-split between exit and enter)
 * avoids stacked-glyph artifacts. Per-word stagger applies to both phases.
 *
 * Renders phrases[0] server-side (no layout shift, no-JS / screen-reader safe).
 * Respects prefers-reduced-motion: phrases[0] stays visible, no tween, no loop.
 *
 * Clean-room reference: pixel-point/animate-text `blur-out-up` — behavior only.
 * Looping exit→swap→enter cycle via a GSAP timeline (this effect is inherently a
 * transition between strings, so the swap IS the effect — the exit's heavier
 * blur is the signature).
 * Do NOT also bind Framer Motion to these spans' transform/opacity/filter.
 */
export function BlurOutUp({
  phrases,
  interval = 1.6,
  className,
  as: Tag = 'span',
}: BlurOutUpProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return
    if (phrases.length < 2) return // nothing to cycle between

    const { enter, exit } = buildBlurOutUpVars()

    const ctx = gsap.context(() => {
      // Stagger objects: order from the start (left → right) for both phases.
      const enterStagger = { each: enter.to.stagger, from: 'start' as const }
      const exitStagger = { each: exit.to.stagger, from: 'start' as const }

      // Build the next cycle from the phrase currently shown at index `i`.
      // Each cycle: hold → exit current words → re-split to next → micro-delay →
      // enter next words, then schedules itself again. The timeline is owned by
      // the context, so ctx.revert() tears the whole loop down on cleanup.
      const cycle = (i: number) => {
        const next = (i + 1) % phrases.length
        const current = splitWords(phrases[i]).some((u) => u.isWord)
          ? Array.from(el.children).filter(
              (c) => (c as HTMLElement).style.display === 'inline-block',
            )
          : []

        const tl = gsap.timeline({
          delay: interval, // hold the current phrase fully visible
          onComplete: () => cycle(next),
        })
        tl.set(current, exit.from)
          .to(current, { ...exit.to, stagger: exitStagger })
          // Re-split to the next phrase off-screen, then pause the micro-delay.
          .add(() => {
            const words = paintWords(el, phrases[next])
            gsap.set(words, enter.from)
          })
          .to(
            // Re-query the freshly painted word spans for the enter tween.
            () =>
              Array.from(el.children).filter(
                (c) => (c as HTMLElement).style.display === 'inline-block',
              ),
            { ...enter.to, stagger: enterStagger },
            `+=${BLUR_OUT_UP_MICRO_DELAY}`,
          )
      }

      // phrases[0] is rendered server-side as plain text — split it into word
      // spans, enter them once, then start the loop.
      const first = paintWords(el, phrases[0])
      gsap.set(first, enter.from)
      gsap.to(first, {
        ...enter.to,
        stagger: enterStagger,
        onComplete: () => cycle(0),
      })
    }, el)

    return () => {
      ctx.revert()
      el.textContent = phrases[0] // restore the first phrase as plain text
    }
  }, [phrases, interval, prefersReduced])

  return (
    <Tag ref={ref} className={className}>
      {phrases[0]}
    </Tag>
  )
}
