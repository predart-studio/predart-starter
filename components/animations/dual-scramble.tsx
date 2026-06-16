'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  buildDualScrambleVars,
  DEFAULT_DUAL_SCRAMBLE_CHARS,
  DEFAULT_DUAL_SCRAMBLE_DURATION,
} from '@/lib/motion/dual-scramble'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrambleTextPlugin, ScrollTrigger)
}

interface DualScrambleProps {
  text: string
  /**
   * - `scroll`: scramble in when it scrolls into view (default).
   * - `hover` : scramble on each pointer-enter.
   * - `click` : scramble on each click.
   */
  trigger?: 'scroll' | 'hover' | 'click'
  duration?: number
  speed?: number
  chars?: string
  /** Manual stagger when several sit in a group (seconds). */
  revealDelay?: number
  className?: string
  as?: ElementType
}

/**
 * DualScramble — accessible GSAP ScrambleText with a glitchy symbol charset.
 *
 * Dual-layer structure: an sr-only span holds the real text for screen readers,
 * while an aria-hidden span is the visible layer GSAP scrambles (left-to-right
 * reveal). Triggers on scroll-in, hover, or click. Renders the final text
 * server-side (no layout shift, no-JS safe). Respects prefers-reduced-motion:
 * no tween, final text shown.
 *
 * Do NOT also bind Framer Motion to this element's text.
 *
 * Clean-room reference: good-fella.com "Dual Scramble" — behavior only.
 * Implementation is standard ScrambleTextPlugin (see gsap-plugins).
 */
export function DualScramble({
  text,
  trigger = 'scroll',
  duration = DEFAULT_DUAL_SCRAMBLE_DURATION,
  speed = 0.6,
  chars = DEFAULT_DUAL_SCRAMBLE_CHARS,
  revealDelay = 0,
  className,
  as: Tag = 'span',
}: DualScrambleProps) {
  const layerRef = useRef<HTMLSpanElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = layerRef.current
    if (!el) return

    const vars = buildDualScrambleVars({ text, chars, speed, revealDelay, duration })
    const play = () => gsap.to(el, vars)

    const ctx = gsap.context(() => {
      if (trigger === 'hover') {
        el.addEventListener('mouseenter', play)
        return () => el.removeEventListener('mouseenter', play)
      }
      if (trigger === 'click') {
        el.addEventListener('click', play)
        return () => el.removeEventListener('click', play)
      }
      gsap.to(el, {
        ...vars,
        scrollTrigger: { trigger: el, start: 'top 80%', once: true },
      })
    }, el)

    return () => ctx.revert()
  }, [text, trigger, duration, speed, chars, revealDelay, prefersReduced])

  return (
    <Tag className={cn('relative inline-block', className)}>
      <span className="sr-only">{text}</span>
      <span ref={layerRef} aria-hidden="true">
        {text}
      </span>
    </Tag>
  )
}
