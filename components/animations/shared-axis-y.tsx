'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  splitWords,
  buildSharedAxisYVars,
  SHARED_AXIS_Y_MICRO_DELAY,
} from '@/lib/motion/shared-axis-y'

if (typeof window !== 'undefined') {
  // No CustomEase to register: the spec's easing is steps(1, end), which GSAP
  // parses natively from the "steps(1)" string. We still register the plugins
  // window-guarded, exactly like the sibling effects, for parity.
  gsap.registerPlugin(CustomEase, ScrollTrigger)
}

interface SharedAxisYProps {
  /** Phrases to cycle through (2+). The first renders server-side. */
  phrases: string[]
  /** Seconds the current phrase holds, fully visible, before it exits. */
  interval?: number
  className?: string
  as?: ElementType
}

/**
 * SharedAxisY — a per-word HARD-CUT phrase swap with staircase timing. The host
 * holds exactly ONE phrase at a time: the visible phrase's words blink out one
 * after another (stepped), its words are rebuilt for the next phrase, then those
 * words blink in on the same stepped cadence. GSAP (element-scoped).
 *
 * Each phrase is split into per-word spans on the client (whitespace runs become
 * their own static spans, so spacing is preserved verbatim); only the word spans
 * are tweened, on a steps(1) ease so every opacity change is an instantaneous
 * cut rather than a fade. A guarded GSAP timeline drives a continuous cycle:
 * enter → hold(interval) → exit → micro-delay (words rebuilt here) → enter → ...,
 * wrapping back to phrases[0]. Keeping a single text layer (rebuild the spans
 * between exit and enter) avoids stacked-glyph artifacts.
 *
 * Renders phrases[0] server-side (no layout shift, no-JS / screen-reader safe).
 * Respects prefers-reduced-motion: phrases[0] stays visible, no tween, no loop.
 *
 * Clean-room reference: pixel-point/animate-text `shared-axis-y` — behavior only.
 * Looping exit→swap→enter cycle via a GSAP timeline (this effect is inherently a
 * transition between strings, so the swap IS the effect).
 * Do NOT also bind Framer Motion to this element's transform/opacity.
 */
export function SharedAxisY({
  phrases,
  interval = 1.6,
  className,
  as: Tag = 'span',
}: SharedAxisYProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return
    if (phrases.length < 2) return // nothing to cycle between

    const { enter, exit } = buildSharedAxisYVars()

    // Render one phrase as per-word spans into the host, returning the word spans
    // (the only animated units). Whitespace runs render as static spans so word
    // spacing is preserved exactly. Called fresh for each phrase because word
    // counts differ phrase to phrase — one text layer at a time, no stacking.
    const renderPhrase = (text: string): HTMLSpanElement[] => {
      el.textContent = ''
      const words: HTMLSpanElement[] = []
      for (const part of splitWords(text)) {
        const s = document.createElement('span')
        s.textContent = part.text
        if (part.isWord) {
          s.style.display = 'inline-block'
          s.style.willChange = 'opacity'
          words.push(s)
        } else {
          s.style.whiteSpace = 'pre'
        }
        el.appendChild(s)
      }
      return words
    }

    const ctx = gsap.context(() => {
      // Cut a phrase IN: rebuild its per-word spans (hidden), then hard-cut each
      // word visible on the staircase. When the whole phrase is on, hold it for
      // `interval`, then cut to the next phrase. The recursive call chains the
      // whole loop; the timeline + tweens are owned by the context, so
      // ctx.revert() tears the loop down on cleanup.
      const enterPhrase = (i: number) => {
        const words = renderPhrase(phrases[i])
        gsap.set(words, enter.from)
        gsap.to(words, {
          ...enter.to,
          stagger: { each: enter.to.stagger, from: 'start' },
          // Hold the fully-visible phrase, then start its exit.
          onComplete: () => {
            gsap.delayedCall(interval, () => exitPhrase(i, words))
          },
        })
      }

      // Cut a phrase OUT, hard-cutting each word hidden on the staircase, then —
      // after the spec's micro-delay — cut the next phrase in (wrapping around).
      const exitPhrase = (i: number, words: HTMLSpanElement[]) => {
        const next = (i + 1) % phrases.length
        gsap.set(words, exit.from)
        gsap.to(words, {
          ...exit.to,
          stagger: { each: exit.to.stagger, from: 'start' },
          onComplete: () => {
            gsap.delayedCall(SHARED_AXIS_Y_MICRO_DELAY, () => enterPhrase(next))
          },
        })
      }

      // phrases[0] is on screen from SSR — split it, cut it in, then loop.
      enterPhrase(0)
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
