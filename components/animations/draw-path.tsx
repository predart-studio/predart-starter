'use client'

import { useRef, useEffect, type ReactNode } from 'react'
import gsap from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import { buildDrawVars } from '@/lib/motion/draw'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(DrawSVGPlugin, ScrollTrigger)
}

interface DrawPathProps {
  /** An <svg> with stroked elements (path/line/polyline/circle/rect/ellipse). */
  children: ReactNode
  /**
   * - `scroll`: draw when the wrapper scrolls into view (default).
   * - `load`  : draw once on mount.
   */
  trigger?: 'scroll' | 'load'
  /** Starting DrawSVG segment value (e.g. '0%'). */
  from?: string
  /** Ending DrawSVG segment value (e.g. '100%'). */
  to?: string
  duration?: number
  ease?: string
  className?: string
}

/**
 * DrawPath — GSAP DrawSVGPlugin wrapper that "draws" SVG strokes (page/element-
 * scoped via ScrollTrigger).
 *
 * On-brand for the monochrome aesthetic: stroke the SVG in a token color and let
 * the line draw itself in on scroll. The SVG renders fully visible server-side
 * (no-JS safe, no layout shift); the partial-draw state is only created on the
 * client when motion is allowed. Under prefers-reduced-motion the wrapper returns
 * early WITHOUT creating any partial-draw state, so the SVG stays fully drawn.
 * Do NOT also bind Framer Motion to these strokes (no double-driving of the same
 * draw / dashoffset).
 *
 * Clean-room reference: annnimate "SVG Draw Path" — behavior only. Implementation
 * is standard DrawSVGPlugin usage (see gsap-plugins skill).
 */
export function DrawPath({
  children,
  trigger = 'scroll',
  from,
  to,
  duration,
  ease,
  className,
}: DrawPathProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    const ctx = gsap.context(() => {
      const targets = el.querySelectorAll(
        'path, line, polyline, circle, rect, ellipse',
      )
      if (!targets.length) return

      const vars = buildDrawVars({ from, to, duration, ease })

      if (trigger === 'scroll') {
        gsap.fromTo(targets, vars.from, {
          ...vars.to,
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: 'top 80%', once: true },
        })
        return
      }

      gsap.fromTo(targets, vars.from, { ...vars.to, stagger: 0.08 }) // 'load'
    }, el)

    return () => ctx.revert()
  }, [trigger, from, to, duration, ease, prefersReduced])

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  )
}
