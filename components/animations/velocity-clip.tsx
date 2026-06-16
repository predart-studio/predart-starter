'use client'

import { useRef, useEffect, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  velocityToShear,
  buildClipPolygon,
  RECT_CLIP,
  DEFAULT_VELOCITY_CLIP,
  type VelocityShearOpts,
} from '@/lib/motion/velocity-clip'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface VelocityClipProps extends VelocityShearOpts {
  children: ReactNode
  className?: string
}

/**
 * VelocityClip — GSAP scroll-velocity clip-path shear (element-scoped).
 *
 * Reads scroll velocity from ScrollTrigger and shears the element's clip-path
 * polygon proportionally — a momentum "drag" on the edges that settles back to
 * a clean rectangle when scrolling stops. Respects prefers-reduced-motion:
 * stays a rectangle, no listeners.
 *
 * Do NOT also bind Framer Motion to this element's clip-path.
 *
 * Clean-room reference: annnimate "Velocity Clip" — behavior only.
 * Implementation is standard GSAP + ScrollTrigger velocity (see gsap-scrolltrigger).
 */
export function VelocityClip({
  children,
  sensitivity = DEFAULT_VELOCITY_CLIP.sensitivity,
  maxShear = DEFAULT_VELOCITY_CLIP.maxShear,
  className,
}: VelocityClipProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    let resetTimer: ReturnType<typeof setTimeout> | undefined

    const ctx = gsap.context(() => {
      gsap.set(el, { clipPath: RECT_CLIP })
      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const shear = velocityToShear(self.getVelocity(), { sensitivity, maxShear })
          gsap.to(el, {
            clipPath: buildClipPolygon(shear),
            duration: 0.4,
            ease: 'power2.out',
            overwrite: true,
          })
          // settle back to a rectangle shortly after scrolling stops
          clearTimeout(resetTimer)
          resetTimer = setTimeout(() => {
            gsap.to(el, { clipPath: RECT_CLIP, duration: 0.5, ease: 'power2.out' })
          }, 120)
        },
      })
    }, el)

    return () => {
      clearTimeout(resetTimer)
      ctx.revert()
    }
  }, [sensitivity, maxShear, prefersReduced])

  return (
    <div ref={ref} className={cn('inline-block', className)}>
      {children}
    </div>
  )
}
