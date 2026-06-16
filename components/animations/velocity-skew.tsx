'use client'

import { useRef, useEffect, type ElementType, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { velocityToSkew } from '@/lib/motion/velocity'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface VelocitySkewProps {
  children: ReactNode
  /** Max skew angle in degrees (clamped both directions). */
  max?: number
  /** Velocity → degrees multiplier. Higher = more skew per px/sec. */
  scale?: number
  className?: string
  as?: ElementType
}

/**
 * VelocitySkew — GSAP ScrollTrigger scroll-velocity skew wrapper (page-scoped).
 *
 * Wraps a block so it skews along the Y axis in proportion to scroll velocity
 * (fast scroll = more lean, then it settles back to flat) — the kinetic,
 * confident motion behind the monochrome portfolio. Reads self.getVelocity()
 * inside ScrollTrigger.onUpdate and feeds velocityToSkew() into gsap.quickTo()
 * for cheap, interruptible transform updates; a short debounce eases skew back
 * to 0 once scrolling stops. Respects prefers-reduced-motion: under reduced
 * motion NO ScrollTrigger is attached and the element stays flat (no skew).
 *
 * Do NOT also bind Framer Motion to this element's transform — the two
 * libraries will fight over the same matrix.
 *
 * Clean-room reference: annnimate "Velocity Clip" — behavior only.
 * Implementation is standard ScrollTrigger (see gsap-scrolltrigger skill).
 */
export function VelocitySkew({
  children,
  max = 10,
  scale = 0.005,
  className,
  as: Tag = 'div',
}: VelocitySkewProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    const ctx = gsap.context(() => {
      const skewTo = gsap.quickTo(el, 'skewY', { duration: 0.5, ease: 'power3' })
      let resetId: ReturnType<typeof setTimeout> | undefined

      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          skewTo(velocityToSkew(self.getVelocity(), max, scale))
          if (resetId) clearTimeout(resetId)
          resetId = setTimeout(() => skewTo(0), 120)
        },
      })

      return () => {
        if (resetId) clearTimeout(resetId)
        st.kill()
      }
    }, el)

    return () => ctx.revert()
  }, [max, scale, prefersReduced])

  return (
    <Tag ref={ref} className={cn(!prefersReduced && 'will-change-transform', className)}>
      {children}
    </Tag>
  )
}
