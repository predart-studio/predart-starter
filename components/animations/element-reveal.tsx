'use client'

import { useRef, useEffect, type ElementType, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  buildElementRevealVars,
  type RevealDirection,
  DEFAULT_REVEAL_DIRECTION,
  DEFAULT_REVEAL_DISTANCE,
  DEFAULT_REVEAL_DURATION,
} from '@/lib/motion/element-reveal'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface ElementRevealProps {
  /** Arbitrary content to reveal. Direct children stagger in when there are several. */
  children: ReactNode
  /** Which way the element travels in from. Default 'up' (rises from below). */
  direction?: RevealDirection
  /** Travel distance in px. Default 50. */
  distance?: number
  /** Tween duration (s). Default 0.6. */
  duration?: number
  /**
   * - `scroll`: reveal once when scrolled into view (default).
   * - `load`  : reveal once on mount.
   */
  trigger?: 'scroll' | 'load'
  className?: string
  as?: ElementType
}

/**
 * ElementReveal — GSAP ScrollTrigger entrance wrapper (element/page-scoped).
 *
 * A GENERIC reveal: wrap any block(s) and they fade + slide into place from the
 * chosen direction. Multiple direct children stagger in. Renders its final,
 * settled state server-side (no layout shift, no-JS safe); the entrance is
 * layered on the client with gsap.from(). Respects prefers-reduced-motion (no
 * tween, content stays fully visible). Do NOT also bind Framer Motion to the
 * transform/opacity this drives.
 *
 * Clean-room reference: annnimate "ElementReveal" — behavior only.
 * Implementation is standard GSAP (see gsap-scrolltrigger / gsap-react skills).
 */
export function ElementReveal({
  children,
  direction = DEFAULT_REVEAL_DIRECTION,
  distance = DEFAULT_REVEAL_DISTANCE,
  duration = DEFAULT_REVEAL_DURATION,
  trigger = 'scroll',
  className,
  as: Tag = 'div',
}: ElementRevealProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    const vars = buildElementRevealVars({ direction, distance, duration })
    // Stagger across direct children when present; otherwise reveal the element itself.
    const targets = el.children.length > 1 ? Array.from(el.children) : el

    const ctx = gsap.context(() => {
      if (trigger === 'scroll') {
        gsap.from(targets, {
          ...vars,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        })
        return
      }
      gsap.from(targets, vars) // 'load'
    }, el)

    return () => ctx.revert()
  }, [direction, distance, duration, trigger, prefersReduced])

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  )
}
