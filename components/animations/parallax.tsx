'use client'

import { useRef, useEffect, type ReactNode, type ElementType } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { parallaxYPercent, DEFAULT_PARALLAX } from '@/lib/motion/parallax'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface ParallaxProps {
  children: ReactNode
  /** Parallax factor. Negative moves the element opposite/slower than scroll. */
  speed?: number
  className?: string
  as?: ElementType
}

/**
 * Parallax — GSAP ScrollTrigger wrapper (page-scoped, scrubbed).
 *
 * Translates its content vertically as it scrolls through the viewport, scrubbed
 * to scroll (scrub 1, start "top bottom" → end "bottom top"). A negative speed
 * moves the element opposite/slower than the scroll for a classic depth effect;
 * the element is neutral at mid-viewport. Renders its settled content
 * server-side (no layout shift, no-JS safe); the parallax layers on the client.
 * Respects prefers-reduced-motion (no transform, stays static).
 *
 * Do NOT also bind Framer Motion to this element's transform.
 *
 * Clean-room reference: annnimate "Parallax" — behavior only.
 * Implementation is standard GSAP + ScrollTrigger scrub (see gsap-scrolltrigger).
 */
export function Parallax({
  children,
  speed = DEFAULT_PARALLAX.speed,
  className,
  as: Tag = 'div',
}: ParallaxProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => {
          gsap.set(el, { yPercent: parallaxYPercent(self.progress, speed) })
        },
      })
    }, el)

    return () => ctx.revert()
  }, [speed, prefersReduced])

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  )
}
