'use client'

import { useRef, useEffect, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion'
import {
  decideHeaderState,
  buildHideHeaderVars,
  DEFAULT_HIDE_THRESHOLD,
  DEFAULT_HIDE_DURATION,
  DEFAULT_HIDE_EASE,
  type HeaderState,
} from '@/lib/motion/hide-header'
import { cn } from '@/lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface HideHeaderProps {
  children: ReactNode
  /** Below this scroll px the bar always stays visible. */
  threshold?: number
  /** Tween duration in seconds. */
  duration?: number
  /** GSAP ease (overshoot reveal by default). */
  ease?: string
  className?: string
}

/**
 * HideHeader — GSAP ScrollTrigger direction-aware sticky header (page-scoped).
 *
 * Renders a fixed, full-width bar that hides (slides up out of view) when the
 * user scrolls DOWN past a threshold and reveals again the moment they scroll
 * UP — the classic "get out of the way while reading, come back when wanted"
 * header. A ScrollTrigger spanning the document reads self.direction inside
 * onUpdate; decideHeaderState() maps (direction, scrollY, threshold) to
 * 'show' | 'hide' and gsap.to() drives yPercent (0 vs -100) with a slight
 * overshoot ease. Near the top (scrollY <= threshold) it is always pinned
 * visible. Respects prefers-reduced-motion: under reduced motion NO
 * ScrollTrigger is attached and the bar stays put (always visible).
 *
 * It is a fixed/sticky bar, so it needs scroll room beneath it to do anything —
 * place it above tall page content.
 *
 * Do NOT also bind Framer Motion to this element's transform (y) — the two
 * libraries will fight over the same matrix.
 *
 * Clean-room reference: annnimate "HideHeader" — behavior only.
 * Implementation is standard ScrollTrigger (see gsap-scrolltrigger skill).
 */
export function HideHeader({
  children,
  threshold = DEFAULT_HIDE_THRESHOLD,
  duration = DEFAULT_HIDE_DURATION,
  ease = DEFAULT_HIDE_EASE,
  className,
}: HideHeaderProps) {
  const ref = useRef<HTMLElement>(null)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) return
    const el = ref.current
    if (!el) return

    const ctx = gsap.context(() => {
      let current: HeaderState = 'show'

      const st = ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const next = decideHeaderState({
            direction: self.direction === -1 ? -1 : 1,
            scrollY: self.scroll(),
            threshold,
          })
          if (next === current) return
          current = next
          gsap.to(el, buildHideHeaderVars(next, duration, ease))
        },
      })

      return () => st.kill()
    }, el)

    return () => ctx.revert()
  }, [threshold, duration, ease, prefersReduced])

  return (
    <header
      ref={ref}
      className={cn(
        'fixed inset-x-0 top-0 z-50 will-change-transform',
        className,
      )}
    >
      {children}
    </header>
  )
}
