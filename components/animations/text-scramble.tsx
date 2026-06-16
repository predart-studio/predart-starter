'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { buildScrambleVars, DEFAULT_SCRAMBLE_CHARS } from '@/lib/motion/scramble'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrambleTextPlugin, ScrollTrigger)
}

interface TextScrambleProps {
  /** Final, settled text. */
  text: string
  /**
   * - `load`  : scramble in once on mount.
   * - `scroll`: scramble in when it scrolls into view (default).
   * - `hover` : scramble on each pointer-enter.
   */
  trigger?: 'load' | 'scroll' | 'hover'
  duration?: number
  speed?: number
  chars?: string
  revealDelay?: number
  className?: string
  as?: ElementType
}

/**
 * TextScramble — GSAP ScrambleTextPlugin wrapper (page/element-scoped).
 *
 * On-brand for the monochrome + DM Mono aesthetic. Renders the final text
 * server-side (no layout shift, no-JS safe); the scramble is layered on the
 * client. Respects prefers-reduced-motion (no tween, final text stays put).
 * Do NOT also bind Framer Motion to this element's text/opacity.
 *
 * Clean-room reference: annnimate "Text Scramble" / "Dual Scramble" — behavior
 * only. Implementation is standard ScrambleTextPlugin (see gsap-plugins skill).
 */
export function TextScramble({
  text,
  trigger = 'scroll',
  duration = 1.1,
  speed = 0.5,
  chars = DEFAULT_SCRAMBLE_CHARS,
  revealDelay = 0,
  className,
  as: Tag = 'span',
}: TextScrambleProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    const vars = buildScrambleVars({ text, chars, speed, revealDelay, duration })

    const ctx = gsap.context(() => {
      if (trigger === 'hover') {
        const onEnter = () => gsap.to(el, vars)
        el.addEventListener('mouseenter', onEnter)
        return () => el.removeEventListener('mouseenter', onEnter)
      }
      if (trigger === 'scroll') {
        gsap.to(el, {
          ...vars,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        })
        return
      }
      gsap.to(el, vars) // 'load'
    }, el)

    return () => ctx.revert()
  }, [text, trigger, duration, speed, chars, revealDelay, prefersReduced])

  return (
    <Tag ref={ref} className={className}>
      {text}
    </Tag>
  )
}
