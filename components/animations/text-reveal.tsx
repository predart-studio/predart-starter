'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  splitTokens,
  DEFAULT_TEXT_REVEAL,
  type RevealBy,
} from '@/lib/motion/text-reveal'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface TextRevealProps {
  text: string
  /** Reveal unit. 'word' (default) masks each word; 'char' masks each glyph. */
  by?: RevealBy
  stagger?: number
  duration?: number
  className?: string
  as?: ElementType
}

/**
 * TextReveal — GSAP scroll-triggered masked slide-up (element-scoped).
 *
 * Splits the text into words (or characters), wraps each in an overflow-clip,
 * and slides each from one line below (yPercent 100) up to 0 as the element
 * scrolls into view — a clean mask reveal, opacity stays solid. Renders the
 * full text server-side (no layout shift, no-JS safe). Respects
 * prefers-reduced-motion: text stays put, no masks, no tween.
 *
 * Do NOT also bind Framer Motion to this element's transform.
 *
 * Clean-room reference: good-fella.com "Text Reveal" — behavior only (observed:
 * word mask slide-up, stagger 0.1, start top 75%, on-enter once).
 * Implementation is standard GSAP + ScrollTrigger (see gsap-scrolltrigger).
 */
export function TextReveal({
  text,
  by = DEFAULT_TEXT_REVEAL.by,
  stagger = DEFAULT_TEXT_REVEAL.stagger,
  duration = DEFAULT_TEXT_REVEAL.duration,
  className,
  as: Tag = 'span',
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    let cancelled = false
    let ctx: gsap.Context | undefined

    const build = () => {
      if (cancelled) return

      const tokens = splitTokens(text, by).map((t) => t.trim()).filter(Boolean)

      // Build masked tokens: outer clip (inline-block, overflow hidden) > inner.
      el.textContent = ''
      const inners: HTMLElement[] = []
      tokens.forEach((tok, i) => {
        const mask = document.createElement('span')
        mask.style.display = 'inline-block'
        mask.style.overflow = 'hidden'
        mask.style.verticalAlign = 'top'
        const inner = document.createElement('span')
        inner.style.display = 'inline-block'
        inner.textContent = tok
        mask.appendChild(inner)
        el.appendChild(mask)
        // space between words (char mode keeps glyphs adjacent)
        if (by === 'word' && i < tokens.length - 1) el.appendChild(document.createTextNode(' '))
        inners.push(inner)
      })

      ctx = gsap.context(() => {
        // yPercent 110 (not 100) fully clears descenders behind the mask;
        // expo.out is the editorial ease the reference uses.
        gsap.set(inners, { yPercent: 110 })
        gsap.to(inners, {
          yPercent: 0,
          duration,
          ease: 'expo.out',
          stagger,
          scrollTrigger: {
            trigger: el,
            start: 'top 75%',
            once: true,
            invalidateOnRefresh: true,
          },
        })
      }, el)
    }

    // Wait for web fonts before measuring/masking — splitting against a fallback
    // font and then swapping mid-reveal lets glyphs peek above the mask.
    if (typeof document !== 'undefined' && document.fonts?.status !== 'loaded') {
      document.fonts.ready.then(build)
    } else {
      build()
    }

    return () => {
      cancelled = true
      ctx?.revert()
      el.textContent = text
    }
  }, [text, by, stagger, duration, prefersReduced])

  return (
    <Tag ref={ref} className={className}>
      {text}
    </Tag>
  )
}
