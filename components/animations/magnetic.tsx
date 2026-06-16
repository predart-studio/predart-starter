'use client'

import { useRef, useEffect, type ElementType, type ReactNode } from 'react'
import gsap from 'gsap'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { computeMagneticOffset } from '@/lib/motion/magnetic'
import { cn } from '@/lib/utils'

interface MagneticProps {
  children: ReactNode
  /** Pull strength (0-100). Higher = follows the pointer more eagerly. */
  strength?: number
  className?: string
  as?: ElementType
}

/**
 * Magnetic — GSAP pointer-follow wrapper (element-scoped).
 *
 * Wraps a button/CTA/link so it drifts toward the cursor while hovered and
 * springs back on leave — the tactile micro-interaction behind the monochrome,
 * confident feel of the portfolio. Uses gsap.quickTo() for cheap, interruptible
 * transform updates driven by computeMagneticOffset() (clamped to half the
 * element's size). Respects prefers-reduced-motion: under reduced motion NO
 * listeners are attached and the element stays put.
 *
 * Do NOT also bind Framer Motion to this element's transform (x/y) — the two
 * libraries will fight over the same matrix.
 *
 * Clean-room reference: annnimate "Magnetic Button" — behavior only.
 * Implementation is standard core GSAP (see gsap-react / gsap-core skills).
 */
export function Magnetic({
  children,
  strength = 25,
  className,
  as: Tag = 'span',
}: MagneticProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    const ctx = gsap.context(() => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' })
      const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' })

      const onMove = (e: PointerEvent) => {
        const off = computeMagneticOffset(
          { x: e.clientX, y: e.clientY },
          el.getBoundingClientRect(),
          strength,
        )
        xTo(off.x)
        yTo(off.y)
      }
      const onLeave = () => {
        xTo(0)
        yTo(0)
      }

      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerleave', onLeave)

      return () => {
        el.removeEventListener('pointermove', onMove)
        el.removeEventListener('pointerleave', onLeave)
      }
    }, el)

    return () => ctx.revert()
  }, [strength, prefersReduced])

  return (
    <Tag ref={ref} className={cn('inline-block', className)}>
      {children}
    </Tag>
  )
}
